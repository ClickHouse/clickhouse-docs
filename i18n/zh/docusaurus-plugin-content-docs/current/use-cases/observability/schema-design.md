import observability_10 from '@site/static/images/use-cases/observability/observability-10.png';
import observability_11 from '@site/static/images/use-cases/observability/observability-11.png';
import observability_12 from '@site/static/images/use-cases/observability/observability-12.png';
import observability_13 from '@site/static/images/use-cases/observability/observability-13.png';
import Image from '@theme/IdealImage';

# 设计可观察性的架构

我们建议用户始终为日志和追踪创建自己的架构，原因如下：

- **选择主键** - 默认架构使用优化特定访问模式的 `ORDER BY`。您的访问模式不太可能与此对齐。
- **提取结构** - 用户可能希望从现有列（例如 `Body` 列）中提取新列。这可以通过物化列（在更复杂的情况下使用物化视图）来完成。这需要对架构进行更改。
- **优化映射** - 默认架构使用 Map 类型存储属性。这些列允许存储任意元数据。虽然这是一项重要的能力，因为事件的元数据通常不像前面定义一样，因此无法在像 ClickHouse 这样类型严格的数据库中存储，但是访问映射键及其值的效率不如访问正常列的效率。我们通过修改架构并确保最常访问的映射键是顶级列来解决此问题 - 请参见 ["使用 SQL 提取结构"](#extracting-structure-with-sql)。这需要对架构进行更改。
- **简化映射键访问** - 访问映射中的键要求更冗长的语法。用户可以通过别名来缓解这个问题。请参见 ["使用别名"](#using-aliases) 来简化查询。
- **次级索引** - 默认架构使用次级索引加速访问映射和提高文本查询的速度。通常不需要这些，并会占用额外的磁盘空间。可以使用，但应该测试以确保确实需要。请参见 ["次级/数据跳过索引"](#secondarydata-skipping-indices)。
- **使用编解码器** - 用户如果理解预期数据，可能希望自定义列的编解码器，并有证据表明这会改善压缩。

_下面详细描述上述每种用例。_

**重要：** 虽然鼓励用户扩展和修改架构以实现最佳压缩和查询性能，但在可能的情况下应遵循有关核心列的 OTel 架构命名。 ClickHouse Grafana 插件假定存在一些基本的 OTel 列以帮助构建查询，例如 Timestamp 和 SeverityText。日志和追踪所需的列在此处有文档记录 [[1]](https://grafana.com/developers/plugin-tools/tutorials/build-a-logs-data-source-plugin#logs-data-frame-format)[[2]](https://grafana.com/docs/grafana/latest/explore/logs-integration/) 和 [这里](https://grafana.com/docs/grafana/latest/explore/trace-integration/#data-frame-structure)，分别。您可以选择更改这些列名，覆盖插件配置中的默认值。
## 使用 SQL 提取结构 {#extracting-structure-with-sql}

无论是摄取结构化日志还是非结构化日志，用户通常需要具备以下能力：

- **从字符串块中提取列**。查询这些列会比在查询时使用字符串操作更快。
- **从映射中提取键**。默认架构将任意属性放入 Map 类型的列中。这种类型提供了一种无模式的能力，优点是用户在定义日志和追踪时无需预先定义属性的列 - 通常在从 Kubernetes 收集日志并希望确保保留 pod 标签以供后续搜索时，这是不可能的。访问映射键及其值的效率低于在正常 ClickHouse 列上查询。因此，从映射中提取键到根表列通常是可取的。

考虑以下查询：

假设我们希望从结构化日志中统计收到最多 POST 请求的 URL 路径。JSON 块存储在 `Body` 列中作为字符串。此外，如果用户在收集器中启用了 json_parser，它也可以存储在 `LogAttributes` 列中，作为 `Map(String, String)`。

```sql
SELECT LogAttributes
FROM otel_logs
LIMIT 1
FORMAT Vertical

Row 1:
──────
Body:           {"remote_addr":"54.36.149.41","remote_user":"-","run_time":"0","time_local":"2019-01-22 00:26:14.000","request_type":"GET","request_path":"\/filter\/27|13 ,27|  5 ,p53","request_protocol":"HTTP\/1.1","status":"200","size":"30577","referer":"-","user_agent":"Mozilla\/5.0 (compatible; AhrefsBot\/6.1; +http:\/\/ahrefs.com\/robot\/)"}
LogAttributes: {'status':'200','log.file.name':'access-structured.log','request_protocol':'HTTP/1.1','run_time':'0','time_local':'2019-01-22 00:26:14.000','size':'30577','user_agent':'Mozilla/5.0 (compatible; AhrefsBot/6.1; +http://ahrefs.com/robot/)','referer':'-','remote_user':'-','request_type':'GET','request_path':'/filter/27|13 ,27|  5 ,p53','remote_addr':'54.36.149.41'}
```

假设 `LogAttributes` 可用，查询以统计网站接收到最多 POST 请求的 URL 路径如下：

```sql
SELECT path(LogAttributes['request_path']) AS path, count() AS c
FROM otel_logs
WHERE ((LogAttributes['request_type']) = 'POST')
GROUP BY path
ORDER BY c DESC
LIMIT 5

┌─path─────────────────────┬─────c─┐
│ /m/updateVariation       │ 12182 │
│ /site/productCard        │ 11080 │
│ /site/productPrice       │ 10876 │
│ /site/productModelImages │ 10866 │
│ /site/productAdditives   │ 10866 │
└──────────────────────────┴───────┘

5 rows in set. Elapsed: 0.735 sec. Processed 10.36 million rows, 4.65 GB (14.10 million rows/s., 6.32 GB/s.)
Peak memory usage: 153.71 MiB.
```

请注意此处使用了映射语法，例如 `LogAttributes['request_path']`，以及 [`path` 函数](/sql-reference/functions/url-functions#path) 用于去除 URL 中的查询参数。

如果用户未在收集器中启用 JSON 解析，则 `LogAttributes` 将为空，迫使我们使用 [JSON 函数](/sql-reference/functions/json-functions) 从字符串 `Body` 中提取列。

:::note 优先使用 ClickHouse 进行解析
我们通常建议用户在 ClickHouse 中对结构化日志进行 JSON 解析。我们相信 ClickHouse 是最快的 JSON 解析实现。然而，我们承认用户可能希望将日志发送到其他来源，而不希望在 SQL 中保留此逻辑。
:::

```sql
SELECT path(JSONExtractString(Body, 'request_path')) AS path, count() AS c
FROM otel_logs
WHERE JSONExtractString(Body, 'request_type') = 'POST'
GROUP BY path
ORDER BY c DESC
LIMIT 5

┌─path─────────────────────┬─────c─┐
│ /m/updateVariation       │ 12182 │
│ /site/productCard        │ 11080 │
│ /site/productPrice       │ 10876 │
│ /site/productAdditives   │ 10866 │
│ /site/productModelImages │ 10866 │
└──────────────────────────┴───────┘

5 rows in set. Elapsed: 0.668 sec. Processed 10.37 million rows, 5.13 GB (15.52 million rows/s., 7.68 GB/s.)
Peak memory usage: 172.30 MiB.
```

现在考虑非结构化日志的情况：

```sql
SELECT Body, LogAttributes
FROM otel_logs
LIMIT 1
FORMAT Vertical

Row 1:
──────
Body:           151.233.185.144 - - [22/Jan/2019:19:08:54 +0330] "GET /image/105/brand HTTP/1.1" 200 2653 "https://www.zanbil.ir/filter/b43,p56" "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36" "-"
LogAttributes: {'log.file.name':'access-unstructured.log'}
```

针对非结构化日志的类似查询需要通过 [`extractAllGroupsVertical` 函数](/sql-reference/functions/string-search-functions#extractallgroupsvertical) 使用正则表达式。

```sql
SELECT
        path((groups[1])[2]) AS path,
        count() AS c
FROM
(
        SELECT extractAllGroupsVertical(Body, '(\\w+)\\s([^\\s]+)\\sHTTP/\\d\\.\\d') AS groups
        FROM otel_logs
        WHERE ((groups[1])[1]) = 'POST'
)
GROUP BY path
ORDER BY c DESC
LIMIT 5

┌─path─────────────────────┬─────c─┐
│ /m/updateVariation       │ 12182 │
│ /site/productCard        │ 11080 │
│ /site/productPrice       │ 10876 │
│ /site/productModelImages │ 10866 │
│ /site/productAdditives   │ 10866 │
└──────────────────────────┴───────┘

5 rows in set. Elapsed: 1.953 sec. Processed 10.37 million rows, 3.59 GB (5.31 million rows/s., 1.84 GB/s.)
```

解析非结构化日志的查询复杂性和成本增加（注意性能差异）是我们推荐用户在可能的情况下始终使用结构化日志的原因。

:::note 考虑字典
上述查询可以通过利用正则表达式字典进行优化。请参见 [使用字典](#using-dictionaries) 了解更多细节。
:::

这两种用例都可以通过将上述查询逻辑移动到插入时来在 ClickHouse 中满足。我们在下面探索几种方法，突出每种方法适合的情况。

:::note 使用 OTel 或 ClickHouse 进行处理？
用户还可以使用 OTel Collector 处理器和操作符进行处理，具体见 [此处](/observability/integrating-opentelemetry#processing---filtering-transforming-and-enriching)。在大多数情况下，用户会发现 ClickHouse 在资源效率和速度上远优于收集器的处理器。将所有事件处理放在 SQL 中的主要缺点是将您的解决方案与 ClickHouse 绑定在一起。例如，用户可能希望将处理后的日志发送到 OTel 收集器的其他目标，例如 S3。
:::
### 物化列 {#materialized-columns}

物化列提供了从其他列中提取结构的最简单解决方案。这些列的值始终在插入时计算，不能在 INSERT 查询中指定。

:::note 开销
物化列会产生额外的存储开销，因为在插入时将值提取到磁盘上的新列中。
:::


物化列支持任何 ClickHouse 表达式，并可以利用任何分析函数来 [处理字符串](/sql-reference/functions/string-functions)（包括 [正则表达式和搜索](/sql-reference/functions/string-search-functions)）和 [URL](/sql-reference/functions/url-functions)，执行 [类型转换](/sql-reference/functions/type-conversion-functions)，[从 JSON 中提取值](/sql-reference/functions/json-functions) 或进行 [数学运算](/sql-reference/functions/math-functions)。

我们建议将物化列用于基本处理。它们特别适合从映射中提取值，将其提升为根列，并进行类型转换。在非常基本的架构中或与物化视图结合使用时，它们通常最为有用。考虑以下日志架构，收集器已将 JSON 提取到 `LogAttributes` 列中：

```sql
CREATE TABLE otel_logs
(
        `Timestamp` DateTime64(9) CODEC(Delta(8), ZSTD(1)),
        `TraceId` String CODEC(ZSTD(1)),
        `SpanId` String CODEC(ZSTD(1)),
        `TraceFlags` UInt32 CODEC(ZSTD(1)),
        `SeverityText` LowCardinality(String) CODEC(ZSTD(1)),
        `SeverityNumber` Int32 CODEC(ZSTD(1)),
        `ServiceName` LowCardinality(String) CODEC(ZSTD(1)),
        `Body` String CODEC(ZSTD(1)),
        `ResourceSchemaUrl` String CODEC(ZSTD(1)),
        `ResourceAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
        `ScopeSchemaUrl` String CODEC(ZSTD(1)),
        `ScopeName` String CODEC(ZSTD(1)),
        `ScopeVersion` String CODEC(ZSTD(1)),
        `ScopeAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
        `LogAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
        `RequestPage` String MATERIALIZED path(LogAttributes['request_path']),
        `RequestType` LowCardinality(String) MATERIALIZED LogAttributes['request_type'],
        `RefererDomain` String MATERIALIZED domain(LogAttributes['referer'])
)
ENGINE = MergeTree
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SeverityText, toUnixTimestamp(Timestamp), TraceId)
```

使用 JSON 函数从字符串 `Body` 中提取的等效架构可以在 [此处找到](https://pastila.nl/?005cbb97/513b174a7d6114bf17ecc657428cf829#gqoOOiomEjIiG6zlWhE+Sg==)。

我们的三个物化视图列提取请求页面、请求类型和引荐域。这些访问映射键并对其值应用函数。我们的后续查询明显更快：

```sql
SELECT RequestPage AS path, count() AS c
FROM otel_logs
WHERE RequestType = 'POST'
GROUP BY path
ORDER BY c DESC
LIMIT 5

┌─path─────────────────────┬─────c─┐
│ /m/updateVariation       │ 12182 │
│ /site/productCard        │ 11080 │
│ /site/productPrice       │ 10876 │
│ /site/productAdditives   │ 10866 │
│ /site/productModelImages │ 10866 │
└──────────────────────────┴───────┘

5 rows in set. Elapsed: 0.173 sec. Processed 10.37 million rows, 418.03 MB (60.07 million rows/s., 2.42 GB/s.)
Peak memory usage: 3.16 MiB.
```

:::note
物化列默认不会在 `SELECT *` 中返回。这是为了保持 `SELECT *` 的结果总是可以通过 INSERT 语句重新插入到表中的不变性。可以通过将 `asterisk_include_materialized_columns=1` 设置来禁用此行为，并且可以在 Grafana 中启用（参见数据源配置中的 `Additional Settings -> Custom Settings`）。
:::
## 物化视图 {#materialized-views}

[物化视图](/materialized-views) 提供了一种更强大的方式，将 SQL 过滤和变换应用于日志和追踪。

物化视图允许用户将计算成本从查询时转移到插入时。 ClickHouse 物化视图实际上是一个触发器，它在数据块插入表时运行查询。该查询的结果插入到第二个“目标”表中。

<Image img={observability_10} alt="物化视图" size="md"/>

:::note 实时更新
ClickHouse 中的物化视图随着数据流入其基础表而实时更新，更像是持续更新的索引。相比之下，在其他数据库中，物化视图通常是必须刷新的查询的静态快照（类似于 ClickHouse 可刷新物化视图）。
:::


与物化视图关联的查询理论上可以是任何查询，包括聚合，尽管 [连接存在限制](https://clickhouse.com/blog/using-materialized-views-in-clickhouse#materialized-views-and-joins)。对于日志和追踪所需的转换和过滤工作，用户可以视任何 `SELECT` 语句为可能。

用户应记住，查询仅是执行的触发器，针对插入到表（源表）的行，结果发送到新表（目标表）。

为了确保我们不会重复保持数据（在源表和目标表中），我们可以将源表的表更改为 [Null 表引擎](/engines/table-engines/special/null)，保留原始架构。我们的 OTel 收集器将继续向此表发送数据。例如，对于日志，`otel_logs` 表变为：

```sql
CREATE TABLE otel_logs
(
        `Timestamp` DateTime64(9) CODEC(Delta(8), ZSTD(1)),
        `TraceId` String CODEC(ZSTD(1)),
        `SpanId` String CODEC(ZSTD(1)),
        `TraceFlags` UInt32 CODEC(ZSTD(1)),
        `SeverityText` LowCardinality(String) CODEC(ZSTD(1)),
        `SeverityNumber` Int32 CODEC(ZSTD(1)),
        `ServiceName` LowCardinality(String) CODEC(ZSTD(1)),
        `Body` String CODEC(ZSTD(1)),
        `ResourceSchemaUrl` String CODEC(ZSTD(1)),
        `ResourceAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
        `ScopeSchemaUrl` String CODEC(ZSTD(1)),
        `ScopeName` String CODEC(ZSTD(1)),
        `ScopeVersion` String CODEC(ZSTD(1)),
        `ScopeAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
        `LogAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1))
) ENGINE = Null
```

Null 表引擎是一种强大的优化 - 可以将其视为 `/dev/null`。此表不会存储任何数据，但任何附加的物化视图将在插入的行上执行，然后再被丢弃。

考虑以下查询。这将我们的行转换为我们希望保留的格式，从 `LogAttributes` 中提取所有列（我们假设这是通过收集器使用 `json_parser` 操作符设置的），设置 `SeverityText` 和 `SeverityNumber`（基于一些简单的条件和 [这些列的定义](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-severitytext)）。在这种情况下，我们还只选择我们知道会被填充的列 - 忽略像 `TraceId`、`SpanId` 和 `TraceFlags` 等列。

```sql
SELECT
        Body, 
        Timestamp::DateTime AS Timestamp,
        ServiceName,
        LogAttributes['status'] AS Status,
        LogAttributes['request_protocol'] AS RequestProtocol,
        LogAttributes['run_time'] AS RunTime,
        LogAttributes['size'] AS Size,
        LogAttributes['user_agent'] AS UserAgent,
        LogAttributes['referer'] AS Referer,
        LogAttributes['remote_user'] AS RemoteUser,
        LogAttributes['request_type'] AS RequestType,
        LogAttributes['request_path'] AS RequestPath,
        LogAttributes['remote_addr'] AS RemoteAddr,
        domain(LogAttributes['referer']) AS RefererDomain,
        path(LogAttributes['request_path']) AS RequestPage,
        multiIf(Status::UInt64 > 500, 'CRITICAL', Status::UInt64 > 400, 'ERROR', Status::UInt64 > 300, 'WARNING', 'INFO') AS SeverityText,
        multiIf(Status::UInt64 > 500, 20, Status::UInt64 > 400, 17, Status::UInt64 > 300, 13, 9) AS SeverityNumber
FROM otel_logs
LIMIT 1
FORMAT Vertical

Row 1:
──────
Body:           {"remote_addr":"54.36.149.41","remote_user":"-","run_time":"0","time_local":"2019-01-22 00:26:14.000","request_type":"GET","request_path":"\/filter\/27|13 ,27|  5 ,p53","request_protocol":"HTTP\/1.1","status":"200","size":"30577","referer":"-","user_agent":"Mozilla\/5.0 (compatible; AhrefsBot\/6.1; +http:\/\/ahrefs.com\/robot\/)"}
Timestamp:      2019-01-22 00:26:14
ServiceName:
Status:         200
RequestProtocol: HTTP/1.1
RunTime:        0
Size:           30577
UserAgent:      Mozilla/5.0 (compatible; AhrefsBot/6.1; +http://ahrefs.com/robot/)
Referer:        -
RemoteUser:     -
RequestType:    GET
RequestPath:    /filter/27|13 ,27|  5 ,p53
RemoteAddr:     54.36.149.41
RefererDomain:
RequestPage:    /filter/27|13 ,27|  5 ,p53
SeverityText:   INFO
SeverityNumber:  9

1 row in set. Elapsed: 0.027 sec.
```

我们还提取了上面的 `Body` 列 - 以防将来添加未被我们的 SQL 提取的附加属性。此列在 ClickHouse 中应该压缩良好且不常访问，因此不会影响查询性能。最后，我们将时间戳减少到 DateTime（以节省空间 - 见 ["优化类型"](#optimizing-types)）并进行转换。

:::note 条件表达式
请注意上述用于提取 `SeverityText` 和 `SeverityNumber` 的 [条件表达式](/sql-reference/functions/conditional-functions)。这些在构建复杂条件和检查映射中是否设置值时非常有用 - 我们天真地假设所有键都存在于 `LogAttributes` 中。我们建议用户熟悉它们 - 它们是日志解析中的好助手，此外还有处理 [空值](/sql-reference/functions/functions-for-nulls) 的函数！
:::

我们需要一个表来接收这些结果。下面的目标表与上述查询匹配：

```sql
CREATE TABLE otel_logs_v2
(
        `Body` String,
        `Timestamp` DateTime,
        `ServiceName` LowCardinality(String),
        `Status` UInt16,
        `RequestProtocol` LowCardinality(String),
        `RunTime` UInt32,
        `Size` UInt32,
        `UserAgent` String,
        `Referer` String,
        `RemoteUser` String,
        `RequestType` LowCardinality(String),
        `RequestPath` String,
        `RemoteAddress` IPv4,
        `RefererDomain` String,
        `RequestPage` String,
        `SeverityText` LowCardinality(String),
        `SeverityNumber` UInt8
)
ENGINE = MergeTree
ORDER BY (ServiceName, Timestamp)
```

此处选择的类型基于 ["优化类型"](#optimizing-types) 中讨论的优化。

:::note
注意我们如何显著改变了架构。实际上用户可能还会有希望保留的 Trace 列，以及列 `ResourceAttributes` （通常包含 Kubernetes 元数据）。Grafana 可以利用追踪列提供日志与追踪之间的链接功能 - 请参见 ["使用 Grafana"](/observability/grafana)。
:::


下面，我们创建一个物化视图 `otel_logs_mv`，它对 `otel_logs` 表执行上述选择，并将结果发送到 `otel_logs_v2`。

```sql
CREATE MATERIALIZED VIEW otel_logs_mv TO otel_logs_v2 AS
SELECT
        Body, 
        Timestamp::DateTime AS Timestamp,
        ServiceName,
        LogAttributes['status']::UInt16 AS Status,
        LogAttributes['request_protocol'] AS RequestProtocol,
        LogAttributes['run_time'] AS RunTime,
        LogAttributes['size'] AS Size,
        LogAttributes['user_agent'] AS UserAgent,
        LogAttributes['referer'] AS Referer,
        LogAttributes['remote_user'] AS RemoteUser,
        LogAttributes['request_type'] AS RequestType,
        LogAttributes['request_path'] AS RequestPath,
        LogAttributes['remote_addr'] AS RemoteAddress,
        domain(LogAttributes['referer']) AS RefererDomain,
        path(LogAttributes['request_path']) AS RequestPage,
        multiIf(Status::UInt64 > 500, 'CRITICAL', Status::UInt64 > 400, 'ERROR', Status::UInt64 > 300, 'WARNING', 'INFO') AS SeverityText,
        multiIf(Status::UInt64 > 500, 20, Status::UInt64 > 400, 17, Status::UInt64 > 300, 13, 9) AS SeverityNumber
FROM otel_logs
```

以上的可视化如下所示：

<Image img={observability_11} alt="Otel MV" size="md"/>

如果我们现在重新启动在 ["导出到 ClickHouse"](/observability/integrating-opentelemetry#exporting-to-clickhouse) 中使用的收集器配置，数据将以我们所需的格式出现在 `otel_logs_v2` 中。注意使用了已键入的 JSON 提取函数。

```sql
SELECT *
FROM otel_logs_v2
LIMIT 1
FORMAT Vertical

Row 1:
──────
Body:           {"remote_addr":"54.36.149.41","remote_user":"-","run_time":"0","time_local":"2019-01-22 00:26:14.000","request_type":"GET","request_path":"\/filter\/27|13 ,27|  5 ,p53","request_protocol":"HTTP\/1.1","status":"200","size":"30577","referer":"-","user_agent":"Mozilla\/5.0 (compatible; AhrefsBot\/6.1; +http:\/\/ahrefs.com\/robot\/)"}
Timestamp:      2019-01-22 00:26:14
ServiceName:
Status:         200
RequestProtocol: HTTP/1.1
RunTime:        0
Size:           30577
UserAgent:      Mozilla/5.0 (compatible; AhrefsBot/6.1; +http://ahrefs.com/robot/)
Referer:        -
RemoteUser:     -
RequestType:    GET
RequestPath:    /filter/27|13 ,27|  5 ,p53
RemoteAddress:  54.36.149.41
RefererDomain:
RequestPage:    /filter/27|13 ,27|  5 ,p53
SeverityText:   INFO
SeverityNumber:  9

1 row in set. Elapsed: 0.010 sec.
```

一个等效的物化视图，依赖使用 JSON 函数从 `Body` 列提取列，显示如下：

```sql
CREATE MATERIALIZED VIEW otel_logs_mv TO otel_logs_v2 AS
SELECT  Body, 
        Timestamp::DateTime AS Timestamp,
        ServiceName,
        JSONExtractUInt(Body, 'status') AS Status,
        JSONExtractString(Body, 'request_protocol') AS RequestProtocol,
        JSONExtractUInt(Body, 'run_time') AS RunTime,
        JSONExtractUInt(Body, 'size') AS Size,
        JSONExtractString(Body, 'user_agent') AS UserAgent,
        JSONExtractString(Body, 'referer') AS Referer,
        JSONExtractString(Body, 'remote_user') AS RemoteUser,
        JSONExtractString(Body, 'request_type') AS RequestType,
        JSONExtractString(Body, 'request_path') AS RequestPath,
        JSONExtractString(Body, 'remote_addr') AS remote_addr,
        domain(JSONExtractString(Body, 'referer')) AS RefererDomain,
        path(JSONExtractString(Body, 'request_path')) AS RequestPage,
        multiIf(Status::UInt64 > 500, 'CRITICAL', Status::UInt64 > 400, 'ERROR', Status::UInt64 > 300, 'WARNING', 'INFO') AS SeverityText,
        multiIf(Status::UInt64 > 500, 20, Status::UInt64 > 400, 17, Status::UInt64 > 300, 13, 9) AS SeverityNumber
FROM otel_logs
```
### 注意类型 {#beware-types}

上述物化视图依赖于隐式转换 - 尤其是在使用 `LogAttributes` 映射的情况下。 ClickHouse 将常常透明地将提取的值转换为目标表类型，从而减少所需语法。然而，我们建议用户始终通过使用与相同架构的目标表的 [`SELECT` 语句与 `INSERT INTO`](/sql-reference/statements/insert-into) 语句测试他们的视图。这应确认类型是否得到正确处理。特别关注以下情况：

- 如果映射中不存在某个键，将返回空字符串。在数值情况下，用户需要将其映射到适当的值。这可以通过 [条件表达式](/sql-reference/functions/conditional-functions) 实现，例如 `if(LogAttributes['status'] = ", 200, LogAttributes['status'])` 或者在默认值可接受的情况下使用 [转换函数](/sql-reference/functions/type-conversion-functions)，例如 `toUInt8OrDefault(LogAttributes['status'] )`
- 某些类型不会总是被转换，例如数值的字符串表示不会被转换为枚举值。
- 如果找不到值，JSON 提取函数将返回其类型的默认值。确保这些值是有意义的！

:::note 避免 Nullable
避免在 Clickhouse 中为可观察性数据使用 [Nullable](/sql-reference/data-types/nullable)。在日志和追踪中很少需要区分空值和 NULL。此功能会导致额外的存储开销，并会对查询性能产生负面影响。有关进一步的详细信息，请参见 [这里](/data-modeling/schema-design#optimizing-types)。
:::
## 选择主（排序）键 {#choosing-a-primary-ordering-key}

一旦您提取了所需的列，您可以开始优化您的排序/主键。

一些简单规则可以帮助选择排序键。以下内容有时可能会冲突，请按顺序考虑这些。用户可以通过此过程识别出多个键，通常 4-5 个足够：

1. 选择与您的常用过滤器和访问模式一致的列。如果用户通常通过特定列（例如 pod 名称）筛选开始可观察性调查，该列将在 `WHERE` 子句中频繁使用。在主键中优先包括这些列，而不是使用频率较低的列。
2. 优先选择在过滤时能够排除大量总行的列，从而减少需读取的数据量。服务名称和状态码通常是良好的候选者 - 在后者的情况下，仅当用户按排除大多数行的值进行过滤时，例如，过滤 200s 将在大多数系统中匹配大多数行，而 500 错误将只对应一小部分。
3. 优先选择与表中其他列高度相关的列。这将有助于确保这些值也连续存储，从而改善压缩。
4. 对于排序键中的列，可以更加节省内存地执行 `GROUP BY` 和 `ORDER BY` 操作。

<br />

在识别出排序键的子集后，必须按照特定顺序声明这些键。此顺序会显著影响查询中对次级键列的过滤效率以及表数据文件的压缩比。通常，**最好按照基数的升序对键进行排序**。这应与以下事实相平衡：对排序键中后出现的列进行过滤的效率将低于对较早出现在元组中的列进行过滤。平衡这些行为并考虑您的访问模式。最重要的是，测试不同的变体。欲进一步了解排序键及其优化方式，我们推荐 [这篇文章](/guides/best-practices/sparse-primary-indexes)。

:::note 先构建结构
我们建议在结构化日志后再决定排序键。不要在属性映射中使用键作为排序键或 JSON 提取表达式。确保您的排序键为表中的根列。
:::
## 使用映射 {#using-maps}

早期示例显示使用映射语法 `map['key']` 访问 `Map(String, String)` 列中的值。除了使用映射表示法访问嵌套键外，ClickHouse 还提供专门的 [映射函数](/sql-reference/functions/tuple-map-functions#mapkeys)，用于过滤或选择这些列。

例如，以下查询使用 [`mapKeys` 函数](/sql-reference/functions/tuple-map-functions#mapkeys) 找出 `LogAttributes` 列中所有唯一键，随后使用 [`groupArrayDistinctArray` 函数](/sql-reference/aggregate-functions/combinators)（一个组合器）。

```sql
SELECT groupArrayDistinctArray(mapKeys(LogAttributes))
FROM otel_logs
FORMAT Vertical

Row 1:
──────
groupArrayDistinctArray(mapKeys(LogAttributes)): ['remote_user','run_time','request_type','log.file.name','referer','request_path','status','user_agent','remote_addr','time_local','size','request_protocol']

1 row in set. Elapsed: 1.139 sec. Processed 5.63 million rows, 2.53 GB (4.94 million rows/s., 2.22 GB/s.)
Peak memory usage: 71.90 MiB.
```

:::note 避免使用点
我们不推荐在映射列名称中使用点，并可能会弃用其使用。使用 `_`。
:::
## 使用别名 {#using-aliases}

查询映射类型比查询正常列要慢 - 请参见 ["加速查询"](#accelerating-queries)。此外，这在语法上更复杂，用户编写起来可能会很麻烦。为了解决后一个问题，我们建议使用别名列。

ALIAS 列在查询时计算，而不会存储在表中。因此，无法在此类型的列中插入值。使用别名，我们可以引用映射键并简化语法，透明地将映射条目作为普通列公开。考虑以下示例：

```sql
CREATE TABLE otel_logs
(
        `Timestamp` DateTime64(9) CODEC(Delta(8), ZSTD(1)),
        `TraceId` String CODEC(ZSTD(1)),
        `SpanId` String CODEC(ZSTD(1)),
        `TraceFlags` UInt32 CODEC(ZSTD(1)),
        `SeverityText` LowCardinality(String) CODEC(ZSTD(1)),
        `SeverityNumber` Int32 CODEC(ZSTD(1)),
        `ServiceName` LowCardinality(String) CODEC(ZSTD(1)),
        `Body` String CODEC(ZSTD(1)),
        `ResourceSchemaUrl` String CODEC(ZSTD(1)),
        `ResourceAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
        `ScopeSchemaUrl` String CODEC(ZSTD(1)),
        `ScopeName` String CODEC(ZSTD(1)),
        `ScopeVersion` String CODEC(ZSTD(1)),
        `ScopeAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
        `LogAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
        `RequestPath` String MATERIALIZED path(LogAttributes['request_path']),
        `RequestType` LowCardinality(String) MATERIALIZED LogAttributes['request_type'],
        `RefererDomain` String MATERIALIZED domain(LogAttributes['referer']),
        `RemoteAddr` IPv4 ALIAS LogAttributes['remote_addr']
)
ENGINE = MergeTree
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, Timestamp)
```

我们有多个物化列和一个 `ALIAS` 列 `RemoteAddr`，它访问映射 `LogAttributes`。我们现在可以通过该列查询 `LogAttributes['remote_addr']` 的值，从而简化我们的查询，例如

```sql
SELECT RemoteAddr
FROM default.otel_logs
LIMIT 5

┌─RemoteAddr────┐
│ 54.36.149.41  │
│ 31.56.96.51   │
│ 31.56.96.51   │
│ 40.77.167.129 │
│ 91.99.72.15   │
└───────────────┘

5 rows in set. Elapsed: 0.011 sec.
```

此外，通过 `ALTER TABLE` 命令添加 `ALIAS` 非常简单。这些列立即可用，例如

```sql
ALTER TABLE default.otel_logs
        (ADD COLUMN `Size` String ALIAS LogAttributes['size'])

SELECT Size
FROM default.otel_logs_v3
LIMIT 5

┌─Size──┐
│ 30577 │
│ 5667  │
│ 5379  │
│ 1696  │
│ 41483 │
└───────┘

5 rows in set. Elapsed: 0.014 sec.
```

:::note 默认排除别名
默认情况下，`SELECT *` 将排除 ALIAS 列。可以通过将 `asterisk_include_alias_columns=1` 设置来禁用此行为。
:::
## 优化类型 {#optimizing-types}

有关类型优化的 [一般 Clickhouse 最佳实践](/data-modeling/schema-design#optimizing-types) 同样适用于 ClickHouse 用例。
## 使用编解码器 {#using-codecs}

除了类型优化之外，用户在尝试优化 ClickHouse 可观察性架构的压缩时，可以遵循 [编解码器的通用最佳实践](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec)。

一般来说，用户发现 `ZSTD` 编解码器非常适用于日志和追踪数据集。将压缩值从默认值 1 增加可能会改善压缩。然而，这应经过测试，因为更高的值在插入时会带来更大的 CPU 开销。通常，我们看到提高该值的收益很小。

此外，虽然时间戳在压缩方面受益于增量编码，但如果此列用于主/排序键，可能会导致查询性能下降。我们建议用户评估各自的压缩与查询性能之间的权衡。
## 使用字典 {#using-dictionaries}

[字典](/sql-reference/dictionaries) 是 ClickHouse 的一项 [关键特性](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)，提供来自各种内部和外部 [源](/sql-reference/dictionaries#dictionary-sources) 的内存中 [键值](https://en.wikipedia.org/wiki/Key%E2%80%93value_database) 表示，优化以实现超低延迟查找查询。

<Image img={observability_12} alt="可观察性和字典" size="md"/>

这在多种场景中非常方便，从实时丰富摄取数据而不减慢摄取过程，到改善查询性能，JOIN 特别受益。
虽然在可观察性用例中很少需要 JOIN，但字典在丰富目的上仍然非常有用 - 无论是在插入时还是查询时。我们在下面提供了两个例子的细节。

:::note 加速 JOIN
有意使用字典加速 JOIN 的用户可以在 [此处](https://clickhouse.com/blog/accelerating-joins-with-dictionaries) 找到更多详细信息。
:::
### 插入时与查询时 {#insert-time-vs-query-time}

字典可以用于在查询时或插入时丰富数据集。每种方法都有其各自的优缺点。总结如下：

- **插入时** - 如果丰富值不变，并存在于可以用来填充字典的外部源中，这通常是合适的。在这种情况下，在插入时丰富行可以避免查询时对字典的查找。这会牺牲插入性能以及额外的存储开销，因为丰富值将作为列存储。
- **查询时** - 如果字典中的值频繁更改，查询时查找通常更为适用。如果映射值更改，则不需要更新列（并重写数据）。这种灵活性带来的成本是查询时的查找费用。当需要对许多行进行查找时，例如在过滤子句中使用字典查找，则此查询时间成本通常会相当明显。对于结果丰富，即在 `SELECT` 中，此开销通常不明显。

我们建议用户熟悉字典的基本知识。字典提供了一个内存查找表，可以使用专用的 [专业函数](/sql-reference/functions/ext-dict-functions#dictgetall) 检索值。

有关简单丰富示例，请参见 [字典指南](https://clickhouse.com/blog/geolocating-ips-in-clickhouse-and-grafana#using-dictionaries)。在下面，我们专注于常见的可观察性丰富任务。
### 使用 IP 字典 {#using-ip-dictionaries}

使用 IP 地址对日志和追踪进行地理丰富是可观察性的常见需求。我们可以使用 `ip_trie` 结构字典来实现。

我们使用由 [DB-IP.com](https://db-ip.com/) 提供的公开可用 [DB-IP 城市级数据集](https://github.com/sapics/ip-location-db#db-ip-database-update-monthly)，遵循 [CC BY 4.0 许可协议](https://creativecommons.org/licenses/by/4.0/)。

从 [readme](https://github.com/sapics/ip-location-db#csv-format) 可以看到，数据结构如下：

```csv
| ip_range_start | ip_range_end | country_code | state1 | state2 | city | postcode | latitude | longitude | timezone |
```

鉴于此结构，让我们先使用 [url()](/sql-reference/table-functions/url) 表函数来查看数据：

```sql
SELECT *
FROM url('https://raw.githubusercontent.com/sapics/ip-location-db/master/dbip-city/dbip-city-ipv4.csv.gz', 'CSV', '\n           \tip_range_start IPv4, \n       \tip_range_end IPv4, \n         \tcountry_code Nullable(String), \n     \tstate1 Nullable(String), \n           \tstate2 Nullable(String), \n           \tcity Nullable(String), \n     \tpostcode Nullable(String), \n         \tlatitude Float64, \n          \tlongitude Float64, \n         \ttimezone Nullable(String)\n   \t')
LIMIT 1
FORMAT Vertical
Row 1:
──────
ip_range_start: 1.0.0.0
ip_range_end:   1.0.0.255
country_code:   AU
state1:         Queensland
state2:         ᴺᵁᴸᴸ
city:           South Brisbane
postcode:       ᴺᵁᴸᴸ
latitude:       -27.4767
longitude:      153.017
timezone:       ᴺᵁᴸᴸ
```

为了方便起见，让我们使用 [`URL()`](/engines/table-engines/special/url) 表引擎创建一个具有字段名称的 ClickHouse 表对象，并确认总行数：

```sql
CREATE TABLE geoip_url(
        ip_range_start IPv4,
        ip_range_end IPv4,
        country_code Nullable(String),
        state1 Nullable(String),
        state2 Nullable(String),
        city Nullable(String),
        postcode Nullable(String),
        latitude Float64,
        longitude Float64,
        timezone Nullable(String)
) engine=URL('https://raw.githubusercontent.com/sapics/ip-location-db/master/dbip-city/dbip-city-ipv4.csv.gz', 'CSV')

select count() from geoip_url;

┌─count()─┐
│ 3261621 │ -- 3.26 million
└─────────┘
```

由于我们的 `ip_trie` 字典要求 IP 地址范围以 CIDR 表示，因此我们需要转换 `ip_range_start` 和 `ip_range_end`。

每个范围的 CIDR 可以通过以下查询简洁地计算：

```sql
with
        bitXor(ip_range_start, ip_range_end) as xor,
        if(xor != 0, ceil(log2(xor)), 0) as unmatched,
        32 - unmatched as cidr_suffix,
        toIPv4(bitAnd(bitNot(pow(2, unmatched) - 1), ip_range_start)::UInt64) as cidr_address
select
        ip_range_start,
        ip_range_end,
        concat(toString(cidr_address),'/',toString(cidr_suffix)) as cidr    
from
        geoip_url
limit 4;

┌─ip_range_start─┬─ip_range_end─┬─cidr───────┐
│ 1.0.0.0        │ 1.0.0.255    │ 1.0.0.0/24 │
│ 1.0.1.0        │ 1.0.3.255    │ 1.0.0.0/22 │
│ 1.0.4.0        │ 1.0.7.255    │ 1.0.4.0/22 │
│ 1.0.8.0        │ 1.0.15.255   │ 1.0.8.0/21 │
└────────────────┴──────────────┴────────────┘

4 rows in set. Elapsed: 0.259 sec.
```

:::note
在上述查询中进行的操作相当多。对于感兴趣的人，请阅读这个优秀的 [解释](https://clickhouse.com/blog/geolocating-ips-in-clickhouse-and-grafana#using-bit-functions-to-convert-ip-ranges-to-cidr-notation)。否则可以接受上述计算出一个 IP 范围的 CIDR。
:::

就我们的目的而言，我们只需要 IP 范围、国家代码和坐标，因此让我们创建一个新表并插入我们的地理 IP 数据：

```sql
CREATE TABLE geoip
(
        `cidr` String,
        `latitude` Float64,
        `longitude` Float64,
        `country_code` String
)
ENGINE = MergeTree
ORDER BY cidr

INSERT INTO geoip
WITH
        bitXor(ip_range_start, ip_range_end) as xor,
        if(xor != 0, ceil(log2(xor)), 0) as unmatched,
        32 - unmatched as cidr_suffix,
        toIPv4(bitAnd(bitNot(pow(2, unmatched) - 1), ip_range_start)::UInt64) as cidr_address
SELECT
        concat(toString(cidr_address),'/',toString(cidr_suffix)) as cidr,
        latitude,
        longitude,
        country_code    
FROM geoip_url
```

为在 ClickHouse 中进行低延迟 IP 查找，我们将利用字典将键->属性映射为内存中的我们的地理 IP 数据。 ClickHouse 提供了 `ip_trie` [字典结构](/sql-reference/dictionaries#ip_trie) 来将我们的网络前缀（CIDR 块）映射到坐标和国家代码。以下查询使用此布局和上述表作为数据源规范字典。

```sql
CREATE DICTIONARY ip_trie (
   cidr String,
   latitude Float64,
   longitude Float64,
   country_code String
)
primary key cidr
source(clickhouse(table 'geoip'))
layout(ip_trie)
lifetime(3600);
```

我们可以从字典中选择行并确认此数据集可用于查找：

```sql
SELECT * FROM ip_trie LIMIT 3

┌─cidr───────┬─latitude─┬─longitude─┬─country_code─┐
│ 1.0.0.0/22 │  26.0998 │   119.297 │ CN           │
│ 1.0.0.0/24 │ -27.4767 │   153.017 │ AU           │
│ 1.0.4.0/22 │ -38.0267 │   145.301 │ AU           │
└────────────┴──────────┴───────────┴──────────────┘

3 rows in set. Elapsed: 4.662 sec.
```

:::note 定期刷新
ClickHouse 中的字典基于基础表数据和使用的生命周期子句定期刷新。要更新我们的地理 IP 字典，以反映 DB-IP 数据集中最新的更改，我们只需重新插入具有转换的 geoip_url 远程表中的数据到我们的 `geoip` 表中即可。
:::

现在我们已经将地理 IP 数据加载到我们的 `ip_trie` 字典（方便地命名为 `ip_trie`）中，可以使用它进行 IP 地理定位。这可以使用 [`dictGet()` 函数](/sql-reference/functions/ext-dict-functions) 来完成，如下所示：

```sql
SELECT dictGet('ip_trie', ('country_code', 'latitude', 'longitude'), CAST('85.242.48.167', 'IPv4')) AS ip_details

┌─ip_details──────────────┐
│ ('PT',38.7944,-9.34284) │
└─────────────────────────┘

1 row in set. Elapsed: 0.003 sec.
```

请注意此处的检索速度。这使我们能够丰富日志。在这种情况下，我们选择 **在查询时丰富**。

返回到我们原来的日志数据集，我们可以使用上述方法按国家汇总我们的日志。以下假设我们使用之前物化视图生成的架构，其中提取了 `RemoteAddress` 列。

```sql
SELECT dictGet('ip_trie', 'country_code', tuple(RemoteAddress)) AS country,
        formatReadableQuantity(count()) AS num_requests
FROM default.otel_logs_v2
WHERE country != ''
GROUP BY country
ORDER BY count() DESC
LIMIT 5

┌─country─┬─num_requests────┐
│ IR      │ 7.36 million    │
│ US      │ 1.67 million    │
│ AE      │ 526.74 thousand │
│ DE      │ 159.35 thousand │
│ FR      │ 109.82 thousand │
└─────────┴─────────────────┘

5 rows in set. Elapsed: 0.140 sec. Processed 20.73 million rows, 82.92 MB (147.79 million rows/s., 591.16 MB/s.)
Peak memory usage: 1.16 MiB.
```

由于 IP 到地理位置的映射可能会更改，用户可能想知道请求在发出时的来源 - 而不是当前同一地址的地理位置。因此，在索引时间丰富在这里可能更为合适。这可以通过如下所示的物化列或物化视图的选择实现：

```sql
CREATE TABLE otel_logs_v2
(
        `Body` String,
        `Timestamp` DateTime,
        `ServiceName` LowCardinality(String),
        `Status` UInt16,
        `RequestProtocol` LowCardinality(String),
        `RunTime` UInt32,
        `Size` UInt32,
        `UserAgent` String,
        `Referer` String,
        `RemoteUser` String,
        `RequestType` LowCardinality(String),
        `RequestPath` String,
        `RemoteAddress` IPv4,
        `RefererDomain` String,
        `RequestPage` String,
        `SeverityText` LowCardinality(String),
        `SeverityNumber` UInt8,
        `Country` String MATERIALIZED dictGet('ip_trie', 'country_code', tuple(RemoteAddress)),
        `Latitude` Float32 MATERIALIZED dictGet('ip_trie', 'latitude', tuple(RemoteAddress)),
        `Longitude` Float32 MATERIALIZED dictGet('ip_trie', 'longitude', tuple(RemoteAddress))
)
ENGINE = MergeTree
ORDER BY (ServiceName, Timestamp)
```

:::note 定期更新
用户可能希望根据新数据定期更新 IP 丰富字典。这可以通过字典的 `LIFETIME` 子句来实现，该子句将使字典定期从基础表重新加载。要更新基础表，请参见 ["可刷新物化视图"](/materialized-view/refreshable-materialized-view)。
:::

以上国家和坐标提供了超过按国家分组和过滤的可视化能力。有关灵感，请参见 ["可视化地理数据"](/observability/grafana#visualizing-geo-data)。
### 使用正则字典（用户代理解析） {#using-regex-dictionaries-user-agent-parsing}

解析 [用户代理字符串](https://en.wikipedia.org/wiki/User_agent) 是一个经典的正则表达式问题，也是日志和追踪数据集中常见的需求。 ClickHouse 提供了通过正则表达式树字典高效解析用户代理的功能。

正则表达式树字典在 ClickHouse 开源中使用 YAMLRegExpTree 字典源类型定义，该类型提供了指向包含正则表达式树的 YAML 文件的路径。如果您希望提供自己的正则表达式字典，可以在 [此处](https://sql-reference/dictionaries#use-regular-expression-tree-dictionary-in-clickhouse-open-source) 找到所需结构的详细信息。下面我们专注于使用 [uap-core](https://github.com/ua-parser/uap-core) 进行用户代理解析，并加载我们的字典以支持 CSV 格式。此方法与 OSS 和 ClickHouse Cloud 兼容。

:::note
在下面的示例中，我们使用了 2024 年 6 月最新的 uap-core 正则表达式快照来解析用户代理。最新的文件会偶尔更新，可以在 [此处](https://raw.githubusercontent.com/ua-parser/uap-core/master/regexes.yaml) 找到。用户可以按照 [这里](https://sql-reference/dictionaries#collecting-attribute-values) 的步骤加载到下面使用的 CSV 文件中。
:::

创建以下内存表。这些表存储我们用于解析设备、浏览器和操作系统的正则表达式。

```sql
CREATE TABLE regexp_os
(
        id UInt64,
        parent_id UInt64,
        regexp String,
        keys   Array(String),
        values Array(String)
) ENGINE=Memory;

CREATE TABLE regexp_browser
(
        id UInt64,
        parent_id UInt64,
        regexp String,
        keys   Array(String),
        values Array(String)
) ENGINE=Memory;

CREATE TABLE regexp_device
(
        id UInt64,
        parent_id UInt64,
        regexp String,
        keys   Array(String),
        values Array(String)
) ENGINE=Memory;
```

这些表可以通过以下公开托管的 CSV 文件填充，使用 URL 表函数：

```sql
INSERT INTO regexp_os SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_os.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')

INSERT INTO regexp_device SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_device.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')

INSERT INTO regexp_browser SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_browser.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')
```

通过填充我们的内存表，我们可以加载我们的正则表达式字典。请注意，我们需要将键值指定为列 - 这些将是我们可以从用户代理提取的属性。

```sql
CREATE DICTIONARY regexp_os_dict
(
        regexp String,
        os_replacement String default 'Other',
        os_v1_replacement String default '0',
        os_v2_replacement String default '0',
        os_v3_replacement String default '0',
        os_v4_replacement String default '0'
)
PRIMARY KEY regexp
SOURCE(CLICKHOUSE(TABLE 'regexp_os'))
LIFETIME(MIN 0 MAX 0)
LAYOUT(REGEXP_TREE);

CREATE DICTIONARY regexp_device_dict
(
        regexp String,
        device_replacement String default 'Other',
        brand_replacement String,
        model_replacement String
)
PRIMARY KEY(regexp)
SOURCE(CLICKHOUSE(TABLE 'regexp_device'))
LIFETIME(0)
LAYOUT(regexp_tree);

CREATE DICTIONARY regexp_browser_dict
(
        regexp String,
        family_replacement String default 'Other',
        v1_replacement String default '0',
        v2_replacement String default '0'
)
PRIMARY KEY(regexp)
SOURCE(CLICKHOUSE(TABLE 'regexp_browser'))
LIFETIME(0)
LAYOUT(regexp_tree);
```

加载这些字典后，我们可以提供一个示例用户代理并测试我们新的字典提取能力：

```sql
WITH 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:127.0) Gecko/20100101 Firefox/127.0' AS user_agent
SELECT
        dictGet('regexp_device_dict', ('device_replacement', 'brand_replacement', 'model_replacement'), user_agent) AS device,
        dictGet('regexp_browser_dict', ('family_replacement', 'v1_replacement', 'v2_replacement'), user_agent) AS browser,
        dictGet('regexp_os_dict', ('os_replacement', 'os_v1_replacement', 'os_v2_replacement', 'os_v3_replacement'), user_agent) AS os

┌─device────────────────┬─browser───────────────┬─os─────────────────────────┐
│ ('Mac','Apple','Mac') │ ('Firefox','127','0') │ ('Mac OS X','10','15','0') │
└───────────────────────┴───────────────────────┴────────────────────────────┘

1 row in set. Elapsed: 0.003 sec.
```

鉴于围绕用户代理的规则很少会更改，并且字典只需在新浏览器、操作系统和设备出现时更新，因此在插入时执行此提取很有意义。

我们可以通过物化列或物化视图执行此项工作。以下我们修改了先前使用的物化视图：

```sql
CREATE MATERIALIZED VIEW otel_logs_mv TO otel_logs_v2
AS SELECT
        Body,
        CAST(Timestamp, 'DateTime') AS Timestamp,
        ServiceName,
        LogAttributes['status'] AS Status,
        LogAttributes['request_protocol'] AS RequestProtocol,
        LogAttributes['run_time'] AS RunTime,
        LogAttributes['size'] AS Size,
        LogAttributes['user_agent'] AS UserAgent,
        LogAttributes['referer'] AS Referer,
        LogAttributes['remote_user'] AS RemoteUser,
        LogAttributes['request_type'] AS RequestType,
        LogAttributes['request_path'] AS RequestPath,
        LogAttributes['remote_addr'] AS RemoteAddress,
        domain(LogAttributes['referer']) AS RefererDomain,
        path(LogAttributes['request_path']) AS RequestPage,
        multiIf(CAST(Status, 'UInt64') > 500, 'CRITICAL', CAST(Status, 'UInt64') > 400, 'ERROR', CAST(Status, 'UInt64') > 300, 'WARNING', 'INFO') AS SeverityText,
        multiIf(CAST(Status, 'UInt64') > 500, 20, CAST(Status, 'UInt64') > 400, 17, CAST(Status, 'UInt64') > 300, 13, 9) AS SeverityNumber,
        dictGet('regexp_device_dict', ('device_replacement', 'brand_replacement', 'model_replacement'), UserAgent) AS Device,
        dictGet('regexp_browser_dict', ('family_replacement', 'v1_replacement', 'v2_replacement'), UserAgent) AS Browser,
        dictGet('regexp_os_dict', ('os_replacement', 'os_v1_replacement', 'os_v2_replacement', 'os_v3_replacement'), UserAgent) AS Os
FROM otel_logs
```

这需要我们修改目标表 `otel_logs_v2` 的架构：

```sql
CREATE TABLE default.otel_logs_v2
(
 `Body` String,
 `Timestamp` DateTime,
 `ServiceName` LowCardinality(String),
 `Status` UInt8,
 `RequestProtocol` LowCardinality(String),
 `RunTime` UInt32,
 `Size` UInt32,
 `UserAgent` String,
 `Referer` String,
 `RemoteUser` String,
 `RequestType` LowCardinality(String),
 `RequestPath` String,
 `remote_addr` IPv4,
 `RefererDomain` String,
 `RequestPage` String,
 `SeverityText` LowCardinality(String),
 `SeverityNumber` UInt8,
 `Device` Tuple(device_replacement LowCardinality(String), brand_replacement LowCardinality(String), model_replacement LowCardinality(String)),
 `Browser` Tuple(family_replacement LowCardinality(String), v1_replacement LowCardinality(String), v2_replacement LowCardinality(String)),
 `Os` Tuple(os_replacement LowCardinality(String), os_v1_replacement LowCardinality(String), os_v2_replacement LowCardinality(String), os_v3_replacement LowCardinality(String))
)
ENGINE = MergeTree
ORDER BY (ServiceName, Timestamp, Status)
```

在重新启动收集器并根据之前记录的步骤摄取结构化日志后，我们可以查询我们新提取的 Device、Browser 和 Os 列。

```sql
SELECT Device, Browser, Os
FROM otel_logs_v2
LIMIT 1
FORMAT Vertical

Row 1:
──────
Device:  ('Spider','Spider','Desktop')
Browser: ('AhrefsBot','6','1')
Os:     ('Other','0','0','0')
```

:::note 对于复杂结构使用元组
请注意这些用户代理列使用元组。推荐对已知层次结构的复杂结构使用元组。子列提供与普通列相同的性能（与映射键不同），同时允许异构类型。
:::
### Further reading {#further-reading}

有关字典的更多示例和详细信息，我们推荐以下文章：

- [高级字典主题](/dictionary#advanced-dictionary-topics)
- ["使用字典加速查询"](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)
- [字典](/sql-reference/dictionaries)
## 加速查询 {#accelerating-queries}

ClickHouse 支持多种加速查询性能的技术。在选择适当的主键/排序键以优化最常用的访问模式并最大化压缩后，应考虑以下内容。这通常会在较小的努力下，对性能产生最大的影响。
### 使用物化视图（增量）进行聚合 {#using-materialized-views-incremental-for-aggregations}

在之前的部分中，我们探讨了使用物化视图进行数据转换和过滤。然而，物化视图也可以用于在插入时预计算聚合并存储结果。这个结果可以通过后续插入的结果进行更新，从而有效地使得在插入时预计算聚合。

这里的主要思路是，结果通常会是原始数据的较小表示（在聚合的情况下是部分草图）。当结合用于从目标表读取结果的更简单查询时，查询时间将比在原始数据上执行相同计算要快。

考虑以下查询，我们使用结构化日志计算每小时的总流量：

```sql
SELECT toStartOfHour(Timestamp) AS Hour,
        sum(toUInt64OrDefault(LogAttributes['size'])) AS TotalBytes
FROM otel_logs
GROUP BY Hour
ORDER BY Hour DESC
LIMIT 5

┌────────────────Hour─┬─TotalBytes─┐
│ 2019-01-26 16:00:00 │ 1661716343 │
│ 2019-01-26 15:00:00 │ 1824015281 │
│ 2019-01-26 14:00:00 │ 1506284139 │
│ 2019-01-26 13:00:00 │ 1580955392 │
│ 2019-01-26 12:00:00 │ 1736840933 │
└─────────────────────┴────────────┘

5 rows in set. Elapsed: 0.666 sec. Processed 10.37 million rows, 4.73 GB (15.56 million rows/s., 7.10 GB/s.)
Peak memory usage: 1.40 MiB.
```

我们可以想象这可能是用户在 Grafana 中绘制的常见折线图。这个查询坦率地说是非常快的 - 数据集只有 1000 万行，而 ClickHouse 的运行速度非常快！然而，如果我们将其扩展到数十亿和数万亿行，我们希望保持这种查询性能。

:::note
如果我们使用 `otel_logs_v2` 表，该表是我们之前物化视图的结果，这个查询将快 10 倍，因为它提取了 `LogAttributes` 映射中的大小键。这里我们使用原始数据仅用于说明，如果这是一个常见查询，我们建议使用之前的视图。
:::

如果我们希望在插入时使用物化视图计算此结果，我们需要一个表来接收结果。该表每小时应仅保留 1 行。如果现有小时接收到更新，其他列应合并到现有小时的行中。为了实现这种增量状态的合并，必须为其他列存储部分状态。

这需要 ClickHouse 中的一种特殊引擎类型：SummingMergeTree。它将所有具有相同排序键的行替换为一行，其中包含数值列的总和。以下表将合并任何具有相同日期的行，总和任何数值列。

```sql
CREATE TABLE bytes_per_hour
(
  `Hour` DateTime,
  `TotalBytes` UInt64
)
ENGINE = SummingMergeTree
ORDER BY Hour
```

为了演示我们的物化视图，假设我们的 `bytes_per_hour` 表为空，并且尚未接收任何数据。我们的物化视图对插入到 `otel_logs` 中的数据执行上面的 `SELECT`（这将在配置大小的块上执行），结果发送到 `bytes_per_hour`。语法如下所示：

```sql
CREATE MATERIALIZED VIEW bytes_per_hour_mv TO bytes_per_hour AS
SELECT toStartOfHour(Timestamp) AS Hour,
       sum(toUInt64OrDefault(LogAttributes['size'])) AS TotalBytes
FROM otel_logs
GROUP BY Hour
```

此处的 `TO` 子句是关键，表示结果将发送到 `bytes_per_hour`。

如果我们重新启动我们的 OTel Collector 并重新发送日志，则 `bytes_per_hour` 表将随着上述查询结果逐步填充。完成后，我们可以确认我们的 `bytes_per_hour` 的大小 - 我们应该有每小时 1 行：

```sql
SELECT count()
FROM bytes_per_hour
FINAL

┌─count()─┐
│     113 │
└─────────┘

1 row in set. Elapsed: 0.039 sec.
```

通过存储我们查询的结果，我们有效地将行数从 1000 万（在 `otel_logs` 中）减少到 113。关键在于，如果新的日志被插入到 `otel_logs` 表中，新的值将被发送到它们各自的小时的 `bytes_per_hour`，在那里它们将自动在后台异步合并 - 通过每小时仅保留一行，`bytes_per_hour` 将始终保持小且最新。

由于行的合并是异步进行的，用户在查询时每小时可能会有多于一行。为了确保在查询时合并任何未完成的行，我们有两个选项：

- 使用表名上的 [`FINAL` 修饰符](/sql-reference/statements/select/from#final-modifier)（我们在上面的计数查询中使用了它）。
- 根据我们最终表中使用的排序键进行聚合，即时间戳并汇总指标。

通常，第二个选项更高效更灵活（该表可以用于其他用途），但第一个选项在某些查询中可能更简单。我们在下面展示两者：

```sql
SELECT
        Hour,
        sum(TotalBytes) AS TotalBytes
FROM bytes_per_hour
GROUP BY Hour
ORDER BY Hour DESC
LIMIT 5

┌────────────────Hour─┬─TotalBytes─┐
│ 2019-01-26 16:00:00 │ 1661716343 │
│ 2019-01-26 15:00:00 │ 1824015281 │
│ 2019-01-26 14:00:00 │ 1506284139 │
│ 2019-01-26 13:00:00 │ 1580955392 │
│ 2019-01-26 12:00:00 │ 1736840933 │
└─────────────────────┴────────────┘

5 rows in set. Elapsed: 0.008 sec.

SELECT
        Hour,
        TotalBytes
FROM bytes_per_hour
FINAL
ORDER BY Hour DESC
LIMIT 5

┌────────────────Hour─┬─TotalBytes─┐
│ 2019-01-26 16:00:00 │ 1661716343 │
│ 2019-01-26 15:00:00 │ 1824015281 │
│ 2019-01-26 14:00:00 │ 1506284139 │
│ 2019-01-26 13:00:00 │ 1580955392 │
│ 2019-01-26 12:00:00 │ 1736840933 │
└─────────────────────┴────────────┘

5 rows in set. Elapsed: 0.005 sec.
```

这使我们的查询从 0.6 秒加速到 0.008 秒，速度提升了 75 倍以上！

:::note
在更大的数据集和更复杂的查询中，这些节省可能甚至更大。请参阅 [这里](https://github.com/ClickHouse/clickpy) 以获取示例。
:::
#### 更复杂的示例 {#a-more-complex-example}

上述示例使用 [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree) 聚合每小时的简单计数。更复杂的统计数据需要不同的目标表引擎：[AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree)。

假设我们希望计算每天唯一 IP 地址（或唯一用户）的数量。对此的查询如下：

```sql
SELECT toStartOfHour(Timestamp) AS Hour, uniq(LogAttributes['remote_addr']) AS UniqueUsers
FROM otel_logs
GROUP BY Hour
ORDER BY Hour DESC

┌────────────────Hour─┬─UniqueUsers─┐
│ 2019-01-26 16:00:00 │     4763    │
│ 2019-01-22 00:00:00 │     536     │
└─────────────────────┴─────────────┘

113 rows in set. Elapsed: 0.667 sec. Processed 10.37 million rows, 4.73 GB (15.53 million rows/s., 7.09 GB/s.)
```

为了保持增量更新的基数计数，需要使用 AggregatingMergeTree。

```sql
CREATE TABLE unique_visitors_per_hour
(
  `Hour` DateTime,
  `UniqueUsers` AggregateFunction(uniq, IPv4)
)
ENGINE = AggregatingMergeTree
ORDER BY Hour
```

为了确保 ClickHouse 知道将存储聚合状态，我们将 `UniqueUsers` 列定义为类型 [`AggregateFunction`](/sql-reference/data-types/aggregatefunction)，指定部分状态的函数源（uniq）和源列的类型（IPv4）。与 SummingMergeTree 类似，具有相同 `ORDER BY` 键值的行将被合并（上面的示例中的小时）。

相关的物化视图使用早期的查询：

```sql
CREATE MATERIALIZED VIEW unique_visitors_per_hour_mv TO unique_visitors_per_hour AS
SELECT toStartOfHour(Timestamp) AS Hour,
        uniqState(LogAttributes['remote_addr']::IPv4) AS UniqueUsers
FROM otel_logs
GROUP BY Hour
ORDER BY Hour DESC
```

请注意，我们在聚合函数的末尾添加了后缀 `State`。这确保返回的是函数的聚合状态，而不是最终结果。这将包含附加信息以允许该部分状态与其他状态合并。

一旦数据重新加载，通过 Collector 的重启，我们可以确认 `unique_visitors_per_hour` 表中有 113 行。

```sql
SELECT count()
FROM unique_visitors_per_hour
FINAL
┌─count()─┐
│   113   │
└─────────┘

1 row in set. Elapsed: 0.009 sec.
```

我们的最终查询需要利用我们函数的合并后缀（因为列存储部分聚合状态）：

```sql
SELECT Hour, uniqMerge(UniqueUsers) AS UniqueUsers
FROM unique_visitors_per_hour
GROUP BY Hour
ORDER BY Hour DESC

┌────────────────Hour─┬─UniqueUsers─┐
│ 2019-01-26 16:00:00 │      4763   │
│ 2019-01-22 00:00:00 │      536    │
└─────────────────────┴─────────────┘

113 rows in set. Elapsed: 0.027 sec.
```

请注意，在这里我们使用 `GROUP BY`，而不是使用 `FINAL`。
### 使用物化视图（增量）进行快速查找 {#using-materialized-views-incremental--for-fast-lookups}

用户在选择 ClickHouse 排序键时应考虑其访问模式，选择在过滤和聚合子句中经常使用的列。这在可观察性用例中可能是限制性的，用户有更为多样的访问模式，无法用一组列来封装。这在默认 OTel 模式中内置的示例中得到了很好的体现。考虑追踪的默认模式：

```sql
CREATE TABLE otel_traces
(
        `Timestamp` DateTime64(9) CODEC(Delta(8), ZSTD(1)),
        `TraceId` String CODEC(ZSTD(1)),
        `SpanId` String CODEC(ZSTD(1)),
        `ParentSpanId` String CODEC(ZSTD(1)),
        `TraceState` String CODEC(ZSTD(1)),
        `SpanName` LowCardinality(String) CODEC(ZSTD(1)),
        `SpanKind` LowCardinality(String) CODEC(ZSTD(1)),
        `ServiceName` LowCardinality(String) CODEC(ZSTD(1)),
        `ResourceAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
        `ScopeName` String CODEC(ZSTD(1)),
        `ScopeVersion` String CODEC(ZSTD(1)),
        `SpanAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
        `Duration` Int64 CODEC(ZSTD(1)),
        `StatusCode` LowCardinality(String) CODEC(ZSTD(1)),
        `StatusMessage` String CODEC(ZSTD(1)),
        `Events.Timestamp` Array(DateTime64(9)) CODEC(ZSTD(1)),
        `Events.Name` Array(LowCardinality(String)) CODEC(ZSTD(1)),
        `Events.Attributes` Array(Map(LowCardinality(String), String)) CODEC(ZSTD(1)),
        `Links.TraceId` Array(String) CODEC(ZSTD(1)),
        `Links.SpanId` Array(String) CODEC(ZSTD(1)),
        `Links.TraceState` Array(String) CODEC(ZSTD(1)),
        `Links.Attributes` Array(Map(LowCardinality(String), String)) CODEC(ZSTD(1)),
        INDEX idx_trace_id TraceId TYPE bloom_filter(0.001) GRANULARITY 1,
        INDEX idx_res_attr_key mapKeys(ResourceAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
        INDEX idx_res_attr_value mapValues(ResourceAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
        INDEX idx_span_attr_key mapKeys(SpanAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
        INDEX idx_span_attr_value mapValues(SpanAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
        INDEX idx_duration Duration TYPE minmax GRANULARITY 1
)
ENGINE = MergeTree
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SpanName, toUnixTimestamp(Timestamp), TraceId)
```

此模式针对 `ServiceName`、`SpanName` 和 `Timestamp` 的过滤进行了优化。在追踪中，用户还需要能按特定的 `TraceId` 执行查找并检索相关追踪的 span。虽然这在排序键中存在，但其位置在末尾意味着 [过滤效率不会很高](/guides/best-practices/sparse-primary-indexes#ordering-key-columns-efficiently)，并且在检索单个追踪时可能需要扫描大量数据。

OTel 收集器还安装了物化视图和相关表以解决此挑战。表和视图如下所示：

```sql
CREATE TABLE otel_traces_trace_id_ts
(
        `TraceId` String CODEC(ZSTD(1)),
        `Start` DateTime64(9) CODEC(Delta(8), ZSTD(1)),
        `End` DateTime64(9) CODEC(Delta(8), ZSTD(1)),
        INDEX idx_trace_id TraceId TYPE bloom_filter(0.01) GRANULARITY 1
)
ENGINE = MergeTree
ORDER BY (TraceId, toUnixTimestamp(Start))


CREATE MATERIALIZED VIEW otel_traces_trace_id_ts_mv TO otel_traces_trace_id_ts
(
        `TraceId` String,
        `Start` DateTime64(9),
        `End` DateTime64(9)
)
AS SELECT
        TraceId,
        min(Timestamp) AS Start,
        max(Timestamp) AS End
FROM otel_traces
WHERE TraceId != ''
GROUP BY TraceId
```

该视图有效保证了表 `otel_traces_trace_id_ts` 拥有追踪的最小和最大时间戳。这个表按 `TraceId` 排序，可以有效地检索这些时间戳。在查询主要的 `otel_traces` 表时，这些时间戳范围可以被使用。更具体地说，当通过其 ID 检索追踪时，Grafana 使用以下查询：

```sql
WITH 'ae9226c78d1d360601e6383928e4d22d' AS trace_id,
        (
        SELECT min(Start)
          FROM default.otel_traces_trace_id_ts
          WHERE TraceId = trace_id
        ) AS trace_start,
        (
        SELECT max(End) + 1
          FROM default.otel_traces_trace_id_ts
          WHERE TraceId = trace_id
        ) AS trace_end
SELECT
        TraceId AS traceID,
        SpanId AS spanID,
        ParentSpanId AS parentSpanID,
        ServiceName AS serviceName,
        SpanName AS operationName,
        Timestamp AS startTime,
        Duration * 0.000001 AS duration,
        arrayMap(key -> map('key', key, 'value', SpanAttributes[key]), mapKeys(SpanAttributes)) AS tags,
        arrayMap(key -> map('key', key, 'value', ResourceAttributes[key]), mapKeys(ResourceAttributes)) AS serviceTags
FROM otel_traces
WHERE (traceID = trace_id) AND (startTime >= trace_start) AND (startTime <= trace_end)
LIMIT 1000
```

此处的 CTE 确定追踪 ID `ae9226c78d1d360601e6383928e4d22d` 的最小和最大时间戳，然后使用此信息过滤主要的 `otel_traces` 以获取其相关 span。

这种相同的方法可以应用于类似的访问模式。我们在数据建模 [这里](/materialized-view/incremental-materialized-view#lookup-table) 探索了一个类似的示例。
### 使用投影 {#using-projections}

ClickHouse 投影允许用户为一个表指定多个 `ORDER BY` 子句。

在之前的部分中，我们探讨了如何在 ClickHouse 中使用物化视图来预计算聚合、转换行并优化可观察性查询以适应不同的访问模式。

我们提供了一个示例，其中物化视图将行发送到一个与原始表异不同的排序键的目标表，以便针对以追踪 ID 查找进行优化。

投影可以用于解决相同的问题，使用户能够优化查询未作为主键一部分的列。

理论上，这种能力可以用于为表提供多个排序键，但有一个明显的缺点：数据重复。具体而言，数据需要以主主键的顺序写入以及为每个投影指定的顺序。这将降低插入速度并占用更多磁盘空间。

:::note 投影与物化视图
投影提供了许多与物化视图相同的功能，但应谨慎使用，后者通常更受欢迎。用户应了解缺点以及何时使用。例如，虽然可以使用投影预计算聚合，但我们建议用户使用物化视图来实现这一点。
:::

<Image img={observability_13} alt="Observability and projections" size="md"/>

考虑以下查询，它通过 500 个错误代码过滤我们的 `otel_logs_v2` 表。这可能是用户希望按错误代码过滤的日志的常见访问模式：

```sql
SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent
FROM otel_logs_v2
WHERE Status = 500
FORMAT `Null`

Ok.

0 rows in set. Elapsed: 0.177 sec. Processed 10.37 million rows, 685.32 MB (58.66 million rows/s., 3.88 GB/s.)
Peak memory usage: 56.54 MiB.
```

:::note 使用 Null 测量性能
我们不在这里打印结果，使用 `FORMAT Null`。这强制所有结果被读取但不返回，从而防止因 LIMIT 而导致查询过早终止。这只是为了显示扫描所有 1000 万行所需的时间。
:::

上述查询要求使用我们选择的排序键进行线性扫描 `(ServiceName, Timestamp)`。虽然我们可以在排序键的末尾添加 `Status`，以提高上述查询的性能，但我们也可以添加一个投影。

```sql
ALTER TABLE otel_logs_v2 (
  ADD PROJECTION status
  (
     SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent ORDER BY Status
  )
)

ALTER TABLE otel_logs_v2 MATERIALIZE PROJECTION status
```

请注意，我们必须先创建投影，然后再进行物化。后者的命令导致数据以两种不同的顺序在磁盘上存储两次。当创建数据时，还可以在创建时定义投影，如下所示，并将在数据插入时自动维护。

```sql
CREATE TABLE otel_logs_v2
(
        `Body` String,
        `Timestamp` DateTime,
        `ServiceName` LowCardinality(String),
        `Status` UInt16,
        `RequestProtocol` LowCardinality(String),
        `RunTime` UInt32,
        `Size` UInt32,
        `UserAgent` String,
        `Referer` String,
        `RemoteUser` String,
        `RequestType` LowCardinality(String),
        `RequestPath` String,
        `RemoteAddress` IPv4,
        `RefererDomain` String,
        `RequestPage` String,
        `SeverityText` LowCardinality(String),
        `SeverityNumber` UInt8,
        PROJECTION status
        (
           SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent
           ORDER BY Status
        )
)
ENGINE = MergeTree
ORDER BY (ServiceName, Timestamp)
```

重要的是，如果通过 `ALTER` 创建投影，则在发出 `MATERIALIZE PROJECTION` 命令时，它的创建是异步的。用户可以通过以下查询确认此操作的进度，等待 `is_done=1`。

```sql
SELECT parts_to_do, is_done, latest_fail_reason
FROM system.mutations
WHERE (`table` = 'otel_logs_v2') AND (command LIKE '%MATERIALIZE%')

┌─parts_to_do─┬─is_done─┬─latest_fail_reason─┐
│           0 │     1   │                    │
└─────────────┴─────────┴────────────────────┘

1 row in set. Elapsed: 0.008 sec.
```

如果我们重复上述查询，我们可以看到性能在额外存储的代价下显著提高（有关测量此的内容，请参见 ["测量表大小与压缩"](#measuring-table-size--compression)）。

```sql
SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent
FROM otel_logs_v2
WHERE Status = 500
FORMAT `Null`

0 rows in set. Elapsed: 0.031 sec. Processed 51.42 thousand rows, 22.85 MB (1.65 million rows/s., 734.63 MB/s.)
Peak memory usage: 27.85 MiB.
```

在上面的示例中，我们在投影中指定了在早期查询中使用的列。这将意味着仅这些指定列将按状态存储在磁盘上。如果我们在这里使用 `SELECT *`，则将存储所有列。虽然这将使得更多查询（使用任何子集的列）从投影中受益，但将产生额外的存储。在测量磁盘空间和压缩方面，见 ["测量表大小与压缩"](#measuring-table-size--compression)。
### 二级/数据跳过索引 {#secondarydata-skipping-indices}

无论在 ClickHouse 中如何调优主键，一些查询不可避免地需要全表扫描。虽然可以通过使用物化视图（和某些查询的投影）来减轻这点，但这些都需要额外的维护，用户需要了解它们的可用性以确保他们得到利用。传统的关系数据库使用二级索引解决此问题，但在 ClickHouse 等列式数据库中，这些并不有效。相反，ClickHouse 使用“跳过”索引，这可以通过允许数据库跳过没有匹配值的大数据块，显著提高查询性能。

默认的 OTel 模式使用二级索引，以试图加速对映射访问的访问。虽然我们发现这些通常无效，并不建议将其复制到自定义模式中，但跳过索引仍然可以派上用场。

用户在尝试应用它们之前，应阅读并理解 [二级索引指南](/optimize/skipping-indexes)。

**一般来说，当主键与目标非主键列/表达式之间存在强相关性并且用户查找稀有值（即在许多粒度中不会出现的值）时，它们是有效的。**
### 用于文本搜索的布隆过滤器 {#bloom-filters-for-text-search}

在可观察性查询中，当用户需要执行文本搜索时，二级索引可以是有用的。具体而言，基于 ngram 和令牌的布隆过滤器索引 [`ngrambf_v1`](/optimize/skipping-indexes#bloom-filter-types) 和 [`tokenbf_v1`](/optimize/skipping-indexes#bloom-filter-types) 可用于加速对字符串列的搜索，使用操作符 `LIKE`、`IN` 和 hasToken。重要的是，基于令牌的索引使用非字母数字字符作为分隔符生成令牌。这意味着仅在查询时可以匹配令牌（或整个单词）。要进行更细粒度的匹配，可以使用 [N-gram 布隆过滤器](/optimize/skipping-indexes#bloom-filter-types)。这将字符串拆分为指定大小的 ngram，因此允许子词匹配。

要评估将生成的令牌，因此匹配的，可以使用 `tokens` 函数：

```sql
SELECT tokens('https://www.zanbil.ir/m/filter/b113')

┌─tokens────────────────────────────────────────────┐
│ ['https','www','zanbil','ir','m','filter','b113'] │
└───────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.008 sec.
```

`ngram` 函数提供类似的功能，其中可以将 ngram 大小指定为第二个参数：

```sql
SELECT ngrams('https://www.zanbil.ir/m/filter/b113', 3)

┌─ngrams('https://www.zanbil.ir/m/filter/b113', 3)────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ['htt','ttp','tps','ps:','s:/','://','//w','/ww','www','ww.','w.z','.za','zan','anb','nbi','bil','il.','l.i','.ir','ir/','r/m','/m/','m/f','/fi','fil','ilt','lte','ter','er/','r/b','/b1','b11','113'] │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.008 sec.
```

:::note 反向索引
ClickHouse 还实验性地支持反向索引作为二级索引。我们目前不建议在日志数据集中使用这些，但预计它们在生产准备就绪时将取代基于令牌的布隆过滤器。
:::

在本示例中，我们使用结构化日志数据集。假设我们希望计算 `Referer` 列包含 `ultra` 的日志数。

```sql
SELECT count()
FROM otel_logs_v2
WHERE Referer LIKE '%ultra%'

┌─count()─┐
│  114514 │
└─────────┘

1 row in set. Elapsed: 0.177 sec. Processed 10.37 million rows, 908.49 MB (58.57 million rows/s., 5.13 GB/s.)
```

在这里，我们需要以 ngram 大小为 3 进行匹配。因此我们创建一个 `ngrambf_v1` 索引。

```sql
CREATE TABLE otel_logs_bloom
(
        `Body` String,
        `Timestamp` DateTime,
        `ServiceName` LowCardinality(String),
        `Status` UInt16,
        `RequestProtocol` LowCardinality(String),
        `RunTime` UInt32,
        `Size` UInt32,
        `UserAgent` String,
        `Referer` String,
        `RemoteUser` String,
        `RequestType` LowCardinality(String),
        `RequestPath` String,
        `RemoteAddress` IPv4,
        `RefererDomain` String,
        `RequestPage` String,
        `SeverityText` LowCardinality(String),
        `SeverityNumber` UInt8,
        INDEX idx_span_attr_value Referer TYPE ngrambf_v1(3, 10000, 3, 7) GRANULARITY 1
)
ENGINE = MergeTree
ORDER BY (Timestamp)
```

索引 `ngrambf_v1(3, 10000, 3, 7)` 此处有四个参数。最后一个（值 7）代表种子。其他代表 ngram 大小（3）、值 `m`（过滤器大小）和哈希函数数量 `k`（7）。`k` 和 `m` 需要调优，并将根据唯一的 ngram/令牌的数量及过滤器导致真实负例的概率进行调整 - 从而确认某个值不存在于粒度中。我们建议使用 [这些函数](/engines/table-engines/mergetree-family/mergetree#bloom-filter) 帮助建立这些值。

如果调优得当，这里的加速可能是显著的：

```sql
SELECT count()
FROM otel_logs_bloom
WHERE Referer LIKE '%ultra%'
┌─count()─┐
│   182   │
└─────────┘

1 row in set. Elapsed: 0.077 sec. Processed 4.22 million rows, 375.29 MB (54.81 million rows/s., 4.87 GB/s.)
Peak memory usage: 129.60 KiB.
```

:::note 示例仅用于说明
上述仅用于说明目的。我们建议用户在插入时从日志中提取结构，而不是尝试使用基于令牌的布隆过滤器来优化文本搜索。然而，有些情况下，用户可能会使用堆栈跟踪或其他大型字符串，这使得由于结构不确定性文本搜索可能是有用的。
:::

有关使用布隆过滤器的一些一般性指导：

布隆的目标是过滤 [粒度](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design)，从而避免加载列的所有值并执行线性扫描。可以使用 `EXPLAIN` 子句，参数 `indexes=1`，识别已跳过的粒度数量。考虑以下关于原始表 `otel_logs_v2` 和带有 ngram 布隆过滤器的表 `otel_logs_bloom` 的响应。

```sql
EXPLAIN indexes = 1
SELECT count()
FROM otel_logs_v2
WHERE Referer LIKE '%ultra%'

┌─explain────────────────────────────────────────────────────────────┐
│ Expression ((Project names + Projection))                          │
│   Aggregating                                                      │
│       Expression (Before GROUP BY)                                 │
│       Filter ((WHERE + Change column names to column identifiers)) │
│       ReadFromMergeTree (default.otel_logs_v2)                     │
│       Indexes:                                                     │
│               PrimaryKey                                           │
│               Condition: true                                      │
│               Parts: 9/9                                           │
│               Granules: 1278/1278                                  │
└────────────────────────────────────────────────────────────────────┘

10 rows in set. Elapsed: 0.016 sec.


EXPLAIN indexes = 1
SELECT count()
FROM otel_logs_bloom
WHERE Referer LIKE '%ultra%'

┌─explain────────────────────────────────────────────────────────────┐
│ Expression ((Project names + Projection))                          │
│   Aggregating                                                      │
│       Expression (Before GROUP BY)                                 │
│       Filter ((WHERE + Change column names to column identifiers)) │
│       ReadFromMergeTree (default.otel_logs_bloom)                  │
│       Indexes:                                                     │
│               PrimaryKey                                           │ 
│               Condition: true                                      │
│               Parts: 8/8                                           │
│               Granules: 1276/1276                                  │
│               Skip                                                 │
│               Name: idx_span_attr_value                            │
│               Description: ngrambf_v1 GRANULARITY 1                │
│               Parts: 8/8                                           │
│               Granules: 517/1276                                   │
└────────────────────────────────────────────────────────────────────┘
```

布隆过滤器通常仅在其小于列本身时才更快。如果它更大，则可能几乎没有性能益处。使用以下查询比较过滤器的大小与列的大小：

```sql
SELECT
        name,
        formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
        formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
        round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE (`table` = 'otel_logs_bloom') AND (name = 'Referer')
GROUP BY name
ORDER BY sum(data_compressed_bytes) DESC

┌─name────┬─compressed_size─┬─uncompressed_size─┬─ratio─┐
│ Referer │ 56.16 MiB       │ 789.21 MiB        │ 14.05 │
└─────────┴─────────────────┴───────────────────┴───────┘

1 row in set. Elapsed: 0.018 sec.


SELECT
        `table`,
        formatReadableSize(data_compressed_bytes) AS compressed_size,
        formatReadableSize(data_uncompressed_bytes) AS uncompressed_size
FROM system.data_skipping_indices
WHERE `table` = 'otel_logs_bloom'

┌─table───────────┬─compressed_size─┬─uncompressed_size─┐
│ otel_logs_bloom │ 12.03 MiB       │ 12.17 MiB         │
└─────────────────┴─────────────────┴───────────────────┘

1 row in set. Elapsed: 0.004 sec.
```

在上述示例中，我们可以看到二级布隆过滤器索引为 12MB - 减少到原始列压缩大小 56MB 的近 5 倍。

布隆过滤器可能需要显著的调优。我们建议遵循 [这里的说明](/engines/table-engines/mergetree-family/mergetree#bloom-filter)，这对于识别最佳设置可能是有帮助的。布隆过滤器在插入和合并时也可能成本高昂。用户在将布隆过滤器添加到生产环境之前，应评估其对插入性能的影响。

有关二级跳过索引的更多详细信息，请参见 [这里](/optimize/skipping-indexes#skip-index-functions)。
### 从映射中提取 {#extracting-from-maps}

映射类型在 OTel 模式中很常见。该类型要求值和键具有相同的类型 - 适合 Kubernetes 标签等元数据。请注意，当查询映射类型的子键时，会加载整个父列。如果映射的键很多，这可能会产生显著的查询惩罚，因为需要从磁盘读取的数据量比键存在作为列时要多。

如果您经常查询特定键，请考虑将其移动到根部作为自己的专用列。这通常是在响应常见访问模式后发生的任务，可能在部署后难以预测。有关如何在部署后修改模式的信息，请参见 ["管理模式变更"](/observability/managing-data#managing-schema-changes)。
## 测量表大小与压缩 {#measuring-table-size--compression}

ClickHouse 被用于可观察性的主要原因之一是压缩。

除了大幅降低存储成本外，磁盘上的数据量减少意味着较少的 I/O 和更快的查询与插入。I/O 的减少将超过任何压缩算法在 CPU 上的开销。因此，在确保 ClickHouse 查询快速时，改善数据的压缩应是首要关注点。

有关如何测量压缩的详细信息，请参见 [这里](/data-compression/compression-in-clickhouse)。
