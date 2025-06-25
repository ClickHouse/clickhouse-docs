---
'title': '模式设计'
'description': '为可观察性设计模式设计'
'keywords':
- 'observability'
- 'logs'
- 'traces'
- 'metrics'
- 'OpenTelemetry'
- 'Grafana'
- 'OTel'
'slug': '/use-cases/observability/schema-design'
'show_related_blogs': true
---

import observability_10 from '@site/static/images/use-cases/observability/observability-10.png';
import observability_11 from '@site/static/images/use-cases/observability/observability-11.png';
import observability_12 from '@site/static/images/use-cases/observability/observability-12.png';
import observability_13 from '@site/static/images/use-cases/observability/observability-13.png';
import Image from '@theme/IdealImage';


# 设计可观察性的模式

我们建议用户始终创建自己的日志和跟踪的模式，原因如下：

- **选择主键** - 默认模式使用针对特定访问模式优化的 `ORDER BY`。您的访问模式不太可能与此一致。
- **提取结构** - 用户可能希望从现有列中提取新列，例如 `Body` 列。这可以使用物化列来实现（在更复杂的情况下使用物化视图）。这需要模式更改。
- **优化映射** - 默认模式使用 Map 类型存储属性。这些列允许存储任意元数据。尽管这是一个基本功能，因为事件中的元数据通常没有预先定义，因此无法在类似 ClickHouse 的强类型数据库中存储，但访问 map 键及其值的效率不如访问普通列的效率。因此，我们通过修改模式来解决这个问题，并确保最常访问的 map 键是顶级列 - 见 ["使用 SQL 提取结构"](#extracting-structure-with-sql)。这也需要模式更改。
- **简化 map 键访问** - 访问 map 中的键需要更详细的语法。用户可以通过别名来缓解此问题。见 ["使用别名"](#using-aliases) 以简化查询。
- **二级索引** - 默认模式使用二级索引加速对 Maps 的访问并加速文本查询。这通常是不必要的，并且会增加额外的磁盘空间。可以使用，但应进行测试以确保需要。见 ["二级 / 数据跳过索引"](#secondarydata-skipping-indices)。
- **使用编解码器** - 如果用户了解预期数据并有证据表明这可以改善压缩，可以自定义列的编解码器。

_我们将在下面详细描述上述每个用例。_

**重要提示：** 虽然鼓励用户扩展和修改他们的模式以实现最佳压缩和查询性能，但他们应尽可能遵循核心列的 OTel 模式命名。ClickHouse Grafana 插件假定存在一些基本的 OTel 列以协助查询构建，例如 Timestamp 和 SeverityText。日志和跟踪所需的列在这里有文档记录 [[1]](https://grafana.com/developers/plugin-tools/tutorials/build-a-logs-data-source-plugin#logs-data-frame-format)[[2]](https://grafana.com/docs/grafana/latest/explore/logs-integration/) 和 [这里](https://grafana.com/docs/grafana/latest/explore/trace-integration/#data-frame-structure)。您可以选择更改这些列名，覆盖插件配置中的默认值。
## 使用 SQL 提取结构 {#extracting-structure-with-sql}

无论是摄取结构化还是非结构化日志，用户通常需要具备以下能力：

- **从字符串 blob 中提取列**。查询这些列将比在查询时使用字符串操作更快。
- **从 maps 中提取键**。默认模式将任意属性放入 Map 类型的列中。此类型提供无模式的能力，具有用户在定义日志和跟踪时无需预定义属性列的优势 - 通常在从 Kubernetes 收集日志并希望确保 Pod 标签在以后搜索时保留时，这是不可能的。访问 map 键及其值的速度不如在普通 ClickHouse 列上查询。因此，从 maps 提取键到根表列通常是可取的。

考虑以下查询：

假设我们希望统计接收最多 POST 请求的网址路径，使用结构化日志。JSON blob 存储在 `Body` 列中作为字符串。此外，如果用户在收集器中启用了 json_parser，它也可能存储在 `LogAttributes` 列中作为 `Map(String, String)`。

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

假设 `LogAttributes` 可用，查询以统计网站接收最多 POST 请求的 URL 路径：

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

请注意此处使用 map 语法，例如 `LogAttributes['request_path']` 和用于去除 URL 查询参数的 [`path` 函数](/sql-reference/functions/url-functions#path)。

如果用户在收集器中没有启用 JSON 解析，则 `LogAttributes` 将为空，迫使我们使用 [JSON 函数](/sql-reference/functions/json-functions) 从字符串 `Body` 中提取列。

:::note 请优先考虑 ClickHouse 进行解析
我们通常建议用户在 ClickHouse 中对结构化日志进行 JSON 解析。我们相信 ClickHouse 是最快的 JSON 解析实现。然而，我们认识到用户可能希望将日志发送到其他源，并且不希望此逻辑驻留在 SQL 中。
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

对非结构化日志的类似查询需要通过 [`extractAllGroupsVertical` 函数](/sql-reference/functions/string-search-functions#extractallgroupsvertical) 使用正则表达式。

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

解析非结构化日志查询的复杂性和成本增加（注意性能差异）是我们建议用户始终在可能的情况下使用结构化日志的原因。

:::note 考虑字典
上述查询可以通过利用正则表达式字典进行优化。有关详细信息，请参见 [使用字典](#using-dictionaries)。
:::

这两种用例都可以通过将上述查询逻辑移动到插入时来满足。我们在下面探讨几种方法，强调何时使用每种方法是合适的。

:::note 使用 OTel 还是 ClickHouse 进行处理？
用户还可以使用 OTel Collector 处理器和操作符进行处理，具体说明见 [此处](/observability/integrating-opentelemetry#processing---filtering-transforming-and-enriching)。在大多数情况下，用户会发现 ClickHouse 在资源效率和速度方面显著优于收集器的处理器。在 SQL 中执行所有事件处理的主要缺点是将您的解决方案与 ClickHouse 绑定在一起。例如，用户可能希望从 OTel 收集器发送处理后的日志到替代目的地，例如 S3。
:::
### 物化列 {#materialized-columns}

物化列提供了从其他列提取结构的最简单解决方案。这些列的值始终在插入时计算，并且无法在 INSERT 查询中指定。

:::note 额外开销
物化列会导致额外的存储开销，因为这些值在插入时被提取到新列中并存储在磁盘上。
:::


物化列支持任何 ClickHouse 表达式，并可以利用任何用于 [处理字符串](/sql-reference/functions/string-functions)（包括 [正则表达式和搜索](/sql-reference/functions/string-search-functions)）和 [URL](/sql-reference/functions/url-functions) 的分析函数，执行 [类型转换](/sql-reference/functions/type-conversion-functions)、[从 JSON 中提取值](/sql-reference/functions/json-functions) 或 [数学运算](/sql-reference/functions/math-functions)。

我们建议对基本处理使用物化列。它们对于从 maps 中提取值、将其提升为根列和进行类型转换非常有用。它们在非常基本的模式中或与物化视图结合使用时通常最有用。考虑以下从收集器提取 JSON 到 `LogAttributes` 列的日志模式：

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

使用 JSON 函数从字符串 `Body` 中提取的等效模式可以在 [这里](https://pastila.nl/?005cbb97/513b174a7d6114bf17ecc657428cf829#gqoOOiomEjIiG6zlWhE+Sg==) 找到。

我们的三列物化视图提取请求页面、请求类型和引荐者域。这些访问 map 键并对其值应用函数。随后我们的查询显著更快：

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
物化列默认不会在 `SELECT *` 中返回。这是为了保持 `SELECT *` 的结果始终可以通过 INSERT 重新插入到表中的不变性。可以通过设置 `asterisk_include_materialized_columns=1` 禁用此行为，并可在 Grafana 中启用（请参见数据源配置中的 `Additional Settings -> Custom Settings`）。
:::
## 物化视图 {#materialized-views}

[物化视图](/materialized-views) 提供了一种更强大的方式将 SQL 过滤和转换应用于日志和跟踪。

物化视图允许用户将计算的成本从查询时间转移到插入时间。 ClickHouse 物化视图只是一个触发器，根据插入到表中的数据块运行查询。该查询的结果插入到第二个“目标”表中。

<Image img={observability_10} alt="物化视图" size="md"/>

:::note 实时更新
ClickHouse 中的物化视图在数据流入基础表时实时更新，功能更像是不断更新的索引。相比之下，在其他数据库中，物化视图通常是查询的静态快照，必须刷新（类似于 ClickHouse 可刷新的物化视图）。
:::


与物化视图相关的查询理论上可以是任何查询，包括聚合，尽管 [连接存在限制](https://clickhouse.com/blog/using-materialized-views-in-clickhouse#materialized-views-and-joins)。对于日志和跟踪所需的转换和过滤工作负载，用户可以考虑任何 `SELECT` 语句均可行。

用户应记住，查询只是对插入到表（源表）中的行执行的一个触发器，结果发送到一个新表（目标表）。

为了确保我们不在源表和目标表中重复持久化数据，我们可以将源表的表引擎更改为 [Null 表引擎](/engines/table-engines/special/null)，保留原始模式。我们的 OTel 收集器将继续向该表发送数据。例如，对于日志，`otel_logs` 表变为：

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

Null 表引擎是一种强大的优化 - 想象它像是 `/dev/null`。此表不会存储任何数据，但任何附加的物化视图仍将在插入的行上执行，然后被丢弃。

考虑以下查询。这将我们的行转换为希望保留的格式，从 `LogAttributes` 中提取所有列（我们假设这已由使用 `json_parser` 操作符的收集器设置），设置 `SeverityText` 和 `SeverityNumber`（基于一些简单的条件和对 [这些列](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-severitytext) 的定义）。在这种情况下，我们还只选择我们知道会被填充的列 - 忽略 `TraceId`、`SpanId` 和 `TraceFlags` 等列。

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

我们还提取了上面的 `Body` 列 - 以防后续添加未被 SQL 提取的额外属性。该列在 ClickHouse 中应压缩良好，并将很少被访问，因此不会影响查询性能。最后，我们将 Timestamp 减少为 DateTime（以节省空间 - 见 ["优化类型"](#optimizing-types)）进行类型转换。

:::note 条件
注意上面用于提取 `SeverityText` 和 `SeverityNumber` 的 [条件](https://sql-reference/functions/conditional-functions)。这些在制定复杂条件和检查 map 中的值是否设置时非常有用 - 我们天真地假设 `LogAttributes` 中的所有键都存在。我们建议用户熟悉它们 - 除了处理 [null 值](https://sql-reference/functions/functions-for-nulls) 的函数外，它们是日志解析中的好帮手！
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

这里选择的类型基于 ["优化类型"](#optimizing-types) 中讨论的优化。

:::note
请注意，我们显著改变了我们的模式。实际上，用户可能还希望保留跟踪列以及 `ResourceAttributes` 列（这通常包含 Kubernetes 元数据）。Grafana 可以利用跟踪列提供日志和跟踪之间的链接功能 - 见 ["使用 Grafana"](/observability/grafana)。
:::


下面，我们创建一个物化视图 `otel_logs_mv`，它在 `otel_logs` 表上执行上述选择，并将结果发送到 `otel_logs_v2`。

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

上面的内容如下图所示：

<Image img={observability_11} alt="Otel MV" size="md"/>

如果我们现在重新启动在 ["导出到 ClickHouse"](/observability/integrating-opentelemetry#exporting-to-clickhouse)中使用的收集器配置，数据将以我们期望的格式出现在 `otel_logs_v2` 中。请注意使用了带类型的 JSON 提取函数。

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

一个等效的物化视图，通过使用 JSON 函数从 `Body` 列中提取列如下所示：

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

上述物化视图依赖于隐式转换 - 尤其是在使用 `LogAttributes` map 的情况下。ClickHouse 通常会透明地将提取的值转换为目标表类型，减少所需的语法。然而，我们建议用户在使用目标表与相同模式的 [`INSERT INTO`](/sql-reference/statements/insert-into) 语句的视图 `SELECT` 语句时始终测试他们的视图。这应确认类型正确处理。特别关注以下情况：

- 如果 map 中不存在某个键，将返回空字符串。在数值的情况下，用户需要将这些映射到适当的值。这可以通过 [条件](https://sql-reference/functions/conditional-functions) 实现，例如 `if(LogAttributes['status'] = ", 200, LogAttributes['status'])` 或 [类型转换函数](https://sql-reference/functions/type-conversion-functions)，如果默认值可以接受，例如 `toUInt8OrDefault(LogAttributes['status'] )`
- 某些类型不会始终被转换，例如数值的字符串表示不会被转换为枚举值。
- JSON 提取函数在找不到值时会返回其类型的默认值。确保这些值是合理的！

:::note 避免 Nullable
避免在 Clickhouse 中使用 [Nullable](/sql-reference/data-types/nullable) 处理可观察性数据。在日志和跟踪中，通常不需要区分空和 null。此特性会导致额外的存储开销，并会对查询性能产生负面影响。有关详细信息，请参见 [这里](/data-modeling/schema-design#optimizing-types)。
:::
## 选择主（排序）键 {#choosing-a-primary-ordering-key}

一旦您提取了所需的列，您就可以开始优化排序/主键。

可以应用一些简单的规则来帮助选择排序键。以下项目有时可能会发生冲突，因此请按顺序考虑这些。用户可以从这一过程中识别出多个键，通常 4-5 个就足够：

1. 选择与常见过滤器和访问模式对齐的列。如果用户通常通过特定列筛选来开始可观察性调查，例如 Pod 名称，那么在 `WHERE` 子句中将频繁使用该列。优先包括这些列，而不是使用较少的列。
2. 优先选择帮助在过滤时排除大量总行的列，从而减少需要读取的数据量。服务名称和状态代码通常是不错的候选者 - 在后者的情况下，仅当用户根据排除大多数行的值进行过滤时，例如，按 200 过滤在大多数系统中会匹配大多数行，而与 500 错误相对应的则是小子集。
3. 优先选择可能与表中的其他列高度相关的列。这将帮助确保这些值也被连续存储，从而改善压缩。
4. 对于排序键中列的 `GROUP BY` 和 `ORDER BY` 操作可以更有效地使用内存。

<br />

在确定排序键的列子集后，必须按特定顺序进行声明。此顺序可能会显著影响查询中二级键列的过滤效率以及表的数据文件的压缩比。一般而言，**最好按基数的升序排列键**。这应该与在排序键中后面的列的过滤效率低于在元组中前面的列的过滤效率之间进行权衡。权衡这些行为并考虑访问模式。最重要的是，测试变体。欲了解排序键及其优化的进一步理解，我们推荐 [这篇文章](/guides/best-practices/sparse-primary-indexes)。

:::note 结构优先
我们建议在结构化日志后决定您的排序键。不要在排序键或 JSON 提取表达式中使用属性 maps 的键。确保将排序键作为根列放在表中。
:::
## 使用映射 {#using-maps}

早期示例显示了使用 map 语法 `map['key']` 访问 `Map(String, String)` 列中的值。除了使用 map 表示法访问嵌套键外，还有可用于过滤或选择这些列的专用 ClickHouse [map 函数](/sql-reference/functions/tuple-map-functions#mapkeys)。

例如，以下查询使用 [`mapKeys` 函数](/sql-reference/functions/tuple-map-functions#mapkeys) 识别 `LogAttributes` 列中可用的所有唯一键，随后使用 [`groupArrayDistinctArray` 函数](/sql-reference/aggregate-functions/combinators)（一个组合器）。

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
我们不建议在 Map 列名中使用点，可能会弃用其用法。请使用 `_`。
:::
## 使用别名 {#using-aliases}

查询 map 类型的速度比查询普通列的速度慢 - 见 ["加速查询"](#accelerating-queries)。此外，语法更复杂，用户编写时可能会感到繁琐。为了解决这个后续问题，我们建议使用别名列。

别名列在查询时计算，并且不存储在表中。因此，不可能向这种类型的列中插入值。使用别名，我们可以引用 map 键并简化语法，将 map 项目透明地显示为普通列。考虑以下示例：

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

我们有几个物化列和一个 `ALIAS` 列 `RemoteAddr`，它访问 map `LogAttributes`。现在，我们可以通过这个列查询 `LogAttributes['remote_addr']` 的值，从而简化我们的查询，即：

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

此外，通过 `ALTER TABLE` 命令添加 `ALIAS` 非常简单。这些列立即可用，例如：

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

:::note 默认情况下不包括别名
默认情况下，`SELECT *` 不包括 ALIAS 列。可以通过设置 `asterisk_include_alias_columns=1` 禁用此行为。
:::
## 优化类型 {#optimizing-types}

[Clickhouse 的一般最佳实践](/data-modeling/schema-design#optimizing-types) 适用于 ClickHouse 的用例。
## 使用编解码器 {#using-codecs}

除了类型优化，用户在尝试优化 ClickHouse 可观察性模式的压缩时，可以遵循 [编解码器的通用最佳实践](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec)。

一般而言，用户会发现 `ZSTD` 编解码器对日志和追踪数据集非常适用。将压缩值从默认值 1 增加可能会改善压缩。然而，这应进行测试，因为更高的值在插入时会增加 CPU 开销。通常，我们看到提高这个值的收益很小。

此外，虽然时间戳在压缩方面受益于增量编码，但如果该列用于主键/排序键，查询性能可能会变慢。我们建议用户权衡相应的压缩与查询性能之间的权衡。
## 使用字典 {#using-dictionaries}

[字典](/sql-reference/dictionaries) 是 ClickHouse 的一个 [关键特性](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)，提供来自各种内部和外部 [源](https://sql-reference/dictionaries#dictionary-sources) 的数据的内存中 [键值](https://en.wikipedia.org/wiki/Key%E2%80%93value_database) 表示，优化以获得超低延迟的查找查询。

<Image img={observability_12} alt="可观察性和字典" size="md"/>

这在各种场景中都很方便，可以在不减慢摄取过程的情况下动态丰富摄取的数据，并提高查询的总体性能，尤其是连接查询受益匪浅。
虽然在可观察性用例中很少需要连接，但字典仍可以在插入和查询时用于丰富目的。我们提供了以下两方面的示例。

:::note 加速连接
对加速连接感兴趣的用户可以在 [这里](https://dictionary) 查找更多详细信息。
:::
### 插入时间 vs 查询时间 {#insert-time-vs-query-time}

字典可以在查询时间或插入时间用于丰富数据集。这些方法各有优缺点。总结：

- **插入时间** - 如果丰富值不变且存在于可以用来填充字典的外部源中，这通常是适当的。在这种情况下，在插入时间丰富行可以避免在查询时间查找字典。这样做的代价是插入性能以及额外的存储开销，因为丰富的值将被存储为列。
- **查询时间** - 如果字典中的值经常变化，查询时间查找通常更为适用。这可以避免在映射值变化时更新列（和重写数据）。这种灵活性是以查询时间查找成本为代价的。当需要查找许多行时，例如在过滤子句中使用字典查找，该查询时间成本通常是显著的。对于结果丰富，即在 `SELECT` 中，通常不会感受到这种开销。

我们建议用户熟悉字典的基础知识。字典提供了一个内存中的查找表，可以使用专用 [专业函数](/sql-reference/functions/ext-dict-functions#dictgetall) 检索值。

有关简单丰富示例，参见 [字典指南](https://dictionary)。在下面，我们重点介绍常见的可观察性丰富任务。
### 使用 IP 字典 {#using-ip-dictionaries}

使用 IP 地址将日志和跟踪的纬度和经度值进行地理丰富是一个常见的可观察性要求。我们可以使用 `ip_trie` 结构字典来实现这一点。

我们使用公开可用的 [DB-IP 城市级数据集](https://github.com/sapics/ip-location-db#db-ip-database-update-monthly)，该数据集由 [DB-IP.com](https://db-ip.com/) 提供，遵循 [CC BY 4.0 许可](https://creativecommons.org/licenses/by/4.0/) 的条款。

从 [readme](https://github.com/sapics/ip-location-db#csv-format) 中，我们可以看到数据的结构如下：

```csv
| ip_range_start | ip_range_end | country_code | state1 | state2 | city | postcode | latitude | longitude | timezone |
```

根据该结构，让我们通过 [url()](/sql-reference/table-functions/url) 表函数快速查看数据：

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

为了简化操作，让我们使用 [`URL()`](/engines/table-engines/special/url) 表引擎创建一个 ClickHouse 表对象，带上我们的字段名，并确认总行数：

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

由于我们的 `ip_trie` 字典要求使用 CIDR 表示 IP 地址范围，因此我们需要转换 `ip_range_start` 和 `ip_range_end`。

可以通过以下查询简洁地计算每个范围的 CIDR：

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
在上述查询中发生了很多事情。那些感兴趣的人可以阅读这个精彩的 [解释](https://clickhouse.com/blog/geolocating-ips-in-clickhouse-and-grafana#using-bit-functions-to-convert-ip-ranges-to-cidr-notation)。否则请接受上述内容计算了 IP 范围的 CIDR。
:::

为了我们的目的，我们只需要 IP 范围、国家代码和坐标，因此让我们创建一个新表并插入我们的 Geo IP 数据：

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

为了在 ClickHouse 中执行低延迟 IP 查找，我们将利用字典来存储我们在内存中进行 IP 数据的键 - 属性映射。 ClickHouse 提供了一个 `ip_trie` [字典结构](/sql-reference/dictionaries#ip_trie)，将我们的网络前缀（CIDR 块）映射到坐标和国家代码。以下查询指定了一个使用此布局和以上表作为源的字典。

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

我们可以从字典中选择行并确认此数据集可供查询：

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
ClickHouse 中的字典会根据底层表数据和使用的生命周期子句进行定期刷新。要更新我们的 Geo IP 字典以反映 DB-IP 数据集中的最新更改，我们只需将数据从 geoip_url 远程表重新插入到我们的 `geoip` 表中，并应用转换。
:::

现在我们已经将 Geo IP 数据加载到我们的 `ip_trie` 字典中（也方便地命名为 `ip_trie`），我们可以用它进行 IP 地理定位。这可以使用 [`dictGet()` 函数](/sql-reference/functions/ext-dict-functions) 实现，如下所示：

```sql
SELECT dictGet('ip_trie', ('country_code', 'latitude', 'longitude'), CAST('85.242.48.167', 'IPv4')) AS ip_details

┌─ip_details──────────────┐
│ ('PT',38.7944,-9.34284) │
└─────────────────────────┘

1 row in set. Elapsed: 0.003 sec.
```

请注意此处的检索速度。这使我们能够丰富日志。在这种情况下，我们选择**执行查询时间丰富**。

回到最初的日志数据集，我们可以利用上述信息按国家聚合日志。以下假定我们使用早期物化视图的结果模式，该模式提取了 `RemoteAddress` 列。

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

由于 IP 到地理位置的映射可能会改变，用户可能希望在请求发出时了解请求来源，而不是当前同一地址的地理位置。因此，在这里可能更倾向于索引时间丰富。这可以使用物化列或在物化视图的选择中完成，如下所示：

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
用户可能希望根据新数据定期更新 IP 丰富字典。这可以通过字典的 `LIFETIME` 子句来实现，这将导致字典定期从底层表重新加载。要更新底层表，请参见 ["可刷新的物化视图"](/materialized-view/refreshable-materialized-view)。
:::

上述国家和坐标提供了超出按国家分组和过滤的可视化能力。有关启发，请参见 ["可视化地理数据"](/observability/grafana#visualizing-geo-data)。
### 使用正则表达式字典（用户代理解析） {#using-regex-dictionaries-user-agent-parsing}

解析 [用户代理字符串](https://en.wikipedia.org/wiki/User_agent) 是经典的正则表达式问题，在基于日志和跟踪的数据集中是一个常见的需求。 ClickHouse 提供了使用正则表达式树字典高效解析用户代理。

正则表达式树字典在 ClickHouse 开源中使用 YAMLRegExpTree 字典源类型定义，提供了指向包含正则表达式树的 YAML 文件的路径。如果您希望提供自己的正则表达式字典，要求的结构细节可以在 [这里](/sql-reference/dictionaries#use-regular-expression-tree-dictionary-in-clickhouse-open-source) 找到。下面我们关注使用 [uap-core](https://github.com/ua-parser/uap-core) 进行用户代理解析，并加载我们的字典以支持 CSV 格式。此方法与 OSS 和 ClickHouse Cloud 兼容。

:::note
在下面的示例中，我们使用 2024 年 6 月的最新 uap-core 用户代理解析的正则表达式快照。可以在 [这里](https://raw.githubusercontent.com/ua-parser/uap-core/master/regexes.yaml) 找到最新文件，该文件不定期更新。用户可以按照 [这里](https://sql-reference/dictionaries#collecting-attribute-values) 的步骤加载到下面使用的 CSV 文件中。
:::

创建以下内存表。这些表保存我们用于解析设备、浏览器和操作系统的正则表达式。

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

这些表可以从以下公开托管的 CSV 文件中填充，使用 URL 表函数：

```sql
INSERT INTO regexp_os SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_os.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')

INSERT INTO regexp_device SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_device.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')

INSERT INTO regexp_browser SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_browser.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')
```

随着内存表的填充，我们可以加载我们的正则表达式字典。请注意，我们需要将键值指定为列 - 这些将是我们可以从用户代理中提取的属性。

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

加载完这些字典后，我们可以提供一个示例用户代理并测试我们新的字典提取能力：

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

鉴于与用户代理相关的规则很少会变更，字典只需在响应新的浏览器、操作系统和设备时进行更新，因此在插入时间执行此提取是有意义的。

我们可以使用物化列或物化视图来执行此操作。下面我们修改之前使用的物化视图：

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

这要求我们修改目标表 `otel_logs_v2` 的模式：

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

重新启动收集器并根据之前记录的步骤摄取结构化日志后，我们可以查询我们新提取的 Device、Browser 和 Os 列。

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

:::note 元组用于复杂结构
请注意这些用户代理列中使用的元组。对于已知层次的复杂结构，推荐使用元组。子列的性能与常规列相同（与 map 键不同），同时允许异构类型。
:::
### 进一步阅读 {#further-reading}

有关字典的更多示例和详细信息，我们推荐以下文章：

- [高级字典主题](/dictionary#advanced-dictionary-topics)
- ["使用字典加速查询"](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)
- [字典](/sql-reference/dictionaries)
## 加速查询 {#accelerating-queries}

ClickHouse 支持多种加速查询性能的技术。以下方法应仅在选择适当的主键/排序键，以优化最常见的访问模式并最大化压缩后考虑。这通常会对性能产生最大的影响，同时付出最少的努力。
### 使用物化视图（增量）进行聚合 {#using-materialized-views-incremental-for-aggregations}

在前面的部分中，我们探讨了物化视图在数据转换和过滤中的使用。然而，物化视图也可以用于在插入时预计算聚合并存储结果。该结果可以与后续插入的结果进行更新，因此有效地允许在插入时预计算聚合。

这里的主要思想是，结果通常会是原始数据的较小表示（在聚合的情况下是部分草图）。当与更简单的查询结合以从目标表中读取结果时，查询时间将比对原始数据执行相同计算要快。

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

我们可以想象，这可能是用户在 Grafana 中绘制的常见折线图。这个查询无疑非常快——数据集只有 1000 万行，而 ClickHouse 很快速！然而，如果我们将其扩展到数十亿和万亿行，我们希望理想地保持这个查询性能。

:::note
如果我们使用 `otel_logs_v2` 表，这个查询的速度将快 10 倍，该表源自我们之前的物化视图，它从 `LogAttributes` 映射中提取大小键。我们在这里使用原始数据仅用于说明，并建议在这是常见查询时使用之前的视图。
:::

如果我们希望使用物化视图在插入时计算，需要一个表来接收结果。该表每小时只应保留 1 行。如果接收到现有小时的更新，则其他列应合并到现有小时的行中。为了使增量状态合并，必须为其他列存储部分状态。

这需要 ClickHouse 中的一种特殊引擎：SummingMergeTree。它会将所有具有相同排序键的行替换为一个行，其中包含数值列的汇总值。以下表格将合并任何具有相同日期的行，对任何数值列进行求和。

```sql
CREATE TABLE bytes_per_hour
(
  `Hour` DateTime,
  `TotalBytes` UInt64
)
ENGINE = SummingMergeTree
ORDER BY Hour
```

为了演示我们的物化视图，假设我们的 `bytes_per_hour` 表为空且尚未接收任何数据。我们的物化视图在插入到 `otel_logs` 时对数据执行上述 `SELECT`（这将在配置块的大小上执行），结果发送到 `bytes_per_hour`。语法如下所示：

```sql
CREATE MATERIALIZED VIEW bytes_per_hour_mv TO bytes_per_hour AS
SELECT toStartOfHour(Timestamp) AS Hour,
       sum(toUInt64OrDefault(LogAttributes['size'])) AS TotalBytes
FROM otel_logs
GROUP BY Hour
```

这里的 `TO` 子句是关键，表示结果将发送到即 `bytes_per_hour`。

如果我们重启 OTel Collector 并重新发送日志，`bytes_per_hour` 表将逐步填充上述查询结果。完成后，我们可以确认 `bytes_per_hour` 的大小 - 每小时将有 1 行：

```sql
SELECT count()
FROM bytes_per_hour
FINAL

┌─count()─┐
│     113 │
└─────────┘

1 row in set. Elapsed: 0.039 sec.
```

通过存储查询的结果，我们有效地将行数从 1000 万（在 `otel_logs` 中）减少到 113。关键在于，如果新的日志插入到 `otel_logs` 表中，则新值将被发送到 `bytes_per_hour` 的相应小时，并将在后台异步自动合并——通过每小时只保留一行，`bytes_per_hour` 将始终保持小且最新。

由于行的合并是异步的，当用户查询时每小时可能会有多行。为了确保在查询时合并所有未完成的行，我们有两个选择：

- 在表名上使用 [`FINAL` 修饰符](/sql-reference/statements/select/from#final-modifier)（正如我们在上面的计数查询中所做）。
- 按用于我们的最终表的排序键进行聚合，即时间戳并对指标进行求和。

通常，第二个选项效率更高且更灵活（该表可以用于其他用途），但第一个选项对某些查询更简单。我们下面展示了两者：

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

这将我们的查询速度从 0.6 秒提高到 0.008 秒，超过 75 倍！

:::note
在更大数据集和更复杂的查询中，这些节省可能会更大。请参见 [这里](https://github.com/ClickHouse/clickpy) 以获取示例。
:::
#### 一个更复杂的示例 {#a-more-complex-example}

上述示例使用 [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree) 聚合每小时的简单计数。超出简单求和的统计需要不同的目标表引擎：[AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree)。

假设我们希望计算每天的唯一 IP 地址数量（或唯一用户数量）。对此的查询如下：

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

为了保持增量更新的基数计算，需要使用 AggregatingMergeTree。

```sql
CREATE TABLE unique_visitors_per_hour
(
  `Hour` DateTime,
  `UniqueUsers` AggregateFunction(uniq, IPv4)
)
ENGINE = AggregatingMergeTree
ORDER BY Hour
```

为了确保 ClickHouse 知道将存储汇总状态，我们将 `UniqueUsers` 列定义为类型 [`AggregateFunction`](/sql-reference/data-types/aggregatefunction)，指定部分状态的函数源（uniq）和源列的类型（IPv4）。与 SummingMergeTree 一样，具有相同 `ORDER BY` 键值的行将被合并（上面的例子中的小时）。

相关的物化视图使用上面的查询：

```sql
CREATE MATERIALIZED VIEW unique_visitors_per_hour_mv TO unique_visitors_per_hour AS
SELECT toStartOfHour(Timestamp) AS Hour,
        uniqState(LogAttributes['remote_addr']::IPv4) AS UniqueUsers
FROM otel_logs
GROUP BY Hour
ORDER BY Hour DESC
```

注意我们在聚合函数的末尾添加了后缀 `State`。这确保返回函数的聚合状态而不是最终结果。这将包含额外的信息，以便允许该部分状态与其他状态合并。

一旦通过 Collector 重启重新加载数据，我们可以确认 `unique_visitors_per_hour` 表中可用 113 行。

```sql
SELECT count()
FROM unique_visitors_per_hour
FINAL
┌─count()─┐
│   113   │
└─────────┘

1 row in set. Elapsed: 0.009 sec.
```

我们的最终查询需要利用我们函数的 Merge 后缀（因为列存储部分聚合状态）：

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

注意我们在此处使用 `GROUP BY` 而不是使用 `FINAL`。
### 使用物化视图（增量）进行快速查找 {#using-materialized-views-incremental--for-fast-lookups}

用户在选择 ClickHouse 排序键时应考虑他们的访问模式，以及在过滤和聚合子句中频繁使用的列。这在可观察性用例中可能是有限制的，因为用户有更多多样化的访问模式，无法在一组列中封装。这在默认 OTel 模式的内置示例中得到了很好的说明。考虑跟踪的默认模式：

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

该模式针对按 `ServiceName`、`SpanName` 和 `Timestamp` 进行过滤进行了优化。在跟踪中，用户还需要能够通过特定的 `TraceId` 进行查找并检索相关跟踪的跨度。虽然这一点在排序键中存在，但它在末尾的位置意味着 [过滤效率将不如](https://guides/best-practices/sparse-primary-indexes#ordering-key-columns-efficiently)，并且在检索单个跟踪时可能需要扫描大量数据。

OTel 收集器还安装了一个物化视图和相关的表来解决这个问题。表和视图如下所示：

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

该视图有效确保表 `otel_traces_trace_id_ts` 具有跟踪的最小和最大时间戳。这个按 `TraceId` 排序的表允许高效检索这些时间戳。这些时间戳范围可以在查询主 `otel_traces` 表时使用。更具体地说，当通过其 ID 检索跟踪时，Grafana 使用以下查询：

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

此处的 CTE 确定跟踪 ID `ae9226c78d1d360601e6383928e4d22d` 的最小和最大时间戳，然后使用此信息过滤主 `otel_traces` 的相关跨度。

可以对类似的访问模式应用相同的方法。我们在数据建模 [这里](/materialized-view/incremental-materialized-view#lookup-table) 探讨了类似的示例。
### 使用投影 {#using-projections}

ClickHouse 投影允许用户为表指定多个 `ORDER BY` 子句。

在前面的部分中，我们探讨了物化视图如何在 ClickHouse 中用于预计算聚合、转换行以及优化可观察性查询以适应不同的访问模式。

我们提供了一个示例，其中物化视图将行发送到目标表，该表的排序键不同于接收插入的原始表，以便在通过跟踪 ID 查找时优化。

投影可用于解决相同的问题，使用户能够对不属于主键的列的查询进行优化。

理论上，这种能力可以用于为一个表提供多个排序键，具有一个显著的缺点：数据重复。具体而言，数据需要按照主主键的顺序写入，并且还需要按照每个投影指定的顺序写入。这将减慢插入速度，并消耗更多的磁盘空间。

:::note 投影 vs 物化视图
投影提供了许多与物化视图相同的功能，但应谨慎使用，后者通常更受偏爱。用户应了解缺点以及何时适用。例如，虽然可以使用投影进行预计算聚合，但我们建议用户使用物化视图来实现这一目标。
:::

<Image img={observability_13} alt="Observability and projections" size="md"/>

考虑以下查询，它通过 500 错误码过滤我们的 `otel_logs_v2` 表。这可能是用户在记录中希望按错误代码过滤的常见访问模式：

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
我们这里不使用 `FORMAT Null` 打印结果。这强制所有结果被读取但不返回，从而防止因 LIMIT 导致查询的提前终止。这仅仅是为了展示扫描 1000 万行所需的时间。
:::

上述查询需要根据我们选择的排序键 `(ServiceName, Timestamp)` 进行线性扫描。虽然我们可以将 `Status` 添加到排序键的末尾，以提高上述查询的性能，但我们也可以添加一个投影。

```sql
ALTER TABLE otel_logs_v2 (
  ADD PROJECTION status
  (
     SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent ORDER BY Status
  )
)

ALTER TABLE otel_logs_v2 MATERIALIZE PROJECTION status
```

注意我们必须先创建投影，然后对其进行物化。后者的命令会导致数据在磁盘上以两种不同的顺序存储两次。如果在创建数据时定义投影，如下所示，将在插入时自动维护。

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

重要的是，如果通过 `ALTER` 创建投影，则在发出 `MATERIALIZE PROJECTION` 命令时，它的创建是异步的。用户可以通过以下查询确认该操作的进度，等待 `is_done=1`。

```sql
SELECT parts_to_do, is_done, latest_fail_reason
FROM system.mutations
WHERE (`table` = 'otel_logs_v2') AND (command LIKE '%MATERIALIZE%')

┌─parts_to_do─┬─is_done─┬─latest_fail_reason─┐
│           0 │     1   │                    │
└─────────────┴─────────┴────────────────────┘

1 row in set. Elapsed: 0.008 sec.
```

如果我们重复上述查询，可以看到性能在付出额外存储成本的情况下显著改善（有关如何测量这一点，请参见 ["测量表的大小和压缩"](#measuring-table-size--compression)）。

```sql
SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent
FROM otel_logs_v2
WHERE Status = 500
FORMAT `Null`

0 rows in set. Elapsed: 0.031 sec. Processed 51.42 thousand rows, 22.85 MB (1.65 million rows/s., 734.63 MB/s.)
Peak memory usage: 27.85 MiB.
```

在上面的示例中，我们在投影中指定了早期查询中使用的列。这意味着这些指定的列将按状态存储在磁盘上。如果我们在这里使用 `SELECT *`，则所有列都将被存储。虽然这会使更多查询（使用任何子集列）受益于投影，但将产生额外的存储成本。有关磁盘空间和压缩的测量，请参见 ["测量表的大小和压缩"](#measuring-table-size--compression)。
### 二级/数据跳过索引 {#secondarydata-skipping-indices}

无论如何，如果在 ClickHouse 中主键的调优良好，一些查询不可避免地会需要全表扫描。虽然可以通过使用物化视图（以及对于某些查询使用投影）来减轻这一问题，但这些需要额外的维护，用户必须了解它们的可用性以确保它们被利用。虽然传统关系数据库通过二级索引解决了这一问题，但在列式数据库如 ClickHouse 中，这些是无效的。相反，ClickHouse 使用“跳过”索引，通过允许数据库跳过大量不匹配值的数据块，显著提高查询性能。

默认的 OTel 模式使用二级索引来加速对地图的访问。虽然我们发现这些通常无效，并不建议将它们复制到自定义模式中，但跳过索引仍然可以是有用的。

用户在尝试应用它们之前，应阅读并理解 [二级索引指南](/optimize/skipping-indexes)。

**通常，当主键与目标的非主列/表达式之间存在强相关性，并且用户查找稀有值时，即那些在许多粒度中不会出现的值，它们是有效的。**
### 文本搜索的布隆过滤器 {#bloom-filters-for-text-search}

对于可观察性查询，当用户需要执行文本搜索时，二级索引会很有用。具体而言，基于 ngram 和 token 的布隆过滤器索引 [`ngrambf_v1`](/optimize/skipping-indexes#bloom-filter-types) 和 [`tokenbf_v1`](/optimize/skipping-indexes#bloom-filter-types) 可用于加速对字符串列的搜索，使用操作符 `LIKE`、`IN` 和 hasToken。重要的是，基于 token 的索引使用非字母数字字符作为分隔符生成 token。这意味着在查询时只能匹配 token（或完整单词）。对于更细粒度的匹配，可以使用 [N-gram 布隆过滤器](/optimize/skipping-indexes#bloom-filter-types)。该过滤器将字符串拆分为指定大小的 ngram，从而允许子词匹配。

为了评估将要生成的 token 及其匹配，可以使用 `tokens` 函数：

```sql
SELECT tokens('https://www.zanbil.ir/m/filter/b113')

┌─tokens────────────────────────────────────────────┐
│ ['https','www','zanbil','ir','m','filter','b113'] │
└───────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.008 sec.
```

`ngram` 函数提供了类似的能力，其中可以将 `ngram` 大小指定为第二个参数：

```sql
SELECT ngrams('https://www.zanbil.ir/m/filter/b113', 3)

┌─ngrams('https://www.zanbil.ir/m/filter/b113', 3)────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ['htt','ttp','tps','ps:','s:/','://','//w','/ww','www','ww.','w.z','.za','zan','anb','nbi','bil','il.','l.i','.ir','ir/','r/m','/m/','m/f','/fi','fil','ilt','lte','ter','er/','r/b','/b1','b11','113'] │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.008 sec.
```

:::note 反向索引
ClickHouse 还对反向索引作为二级索引提供实验性支持。我们目前不建议将其用于日志数据集，但预计它们将取代基于 token 的布隆过滤器，成为生产就绪状态。
:::

在这个示例中，我们使用结构化日志数据集。假设我们希望计算 `Referer` 列中包含 `ultra` 的日志数量。

```sql
SELECT count()
FROM otel_logs_v2
WHERE Referer LIKE '%ultra%'

┌─count()─┐
│  114514 │
└─────────┘

1 row in set. Elapsed: 0.177 sec. Processed 10.37 million rows, 908.49 MB (58.57 million rows/s., 5.13 GB/s.)
```

在这里，我们需要匹配 ngram 大小为 3。因此我们创建一个 `ngrambf_v1` 索引。

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

索引 `ngrambf_v1(3, 10000, 3, 7)` 这里有四个参数。最后一个参数（值为 7）表示一个种子。其他参数表示 ngram 大小（3）、值 `m`（过滤器大小）以及哈希函数的数量 `k`（7）。`k` 和 `m` 需要调整，基于唯一 ngram/token 的数量和过滤器产生真实负值的概率 - 从而确认某个值不在某个粒度中。我们建议使用 [这些函数](/engines/table-engines/mergetree-family/mergetree#bloom-filter) 来帮助确定这些值。

如果调整得当，这里的加速可能会非常显著：

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

:::note 示例仅供参考
以上仅供说明。我们建议用户在插入时从日志中提取结构，而不是尝试使用基于 token 的布隆过滤器来优化文本搜索。然而，有些情况下用户可能会有堆栈跟踪或其他庞大的字符串，在这些情况下，文本搜索由于结构不确定性可能是有用的。
:::

使用布隆过滤器的一些一般指导原则：

布隆的目标是过滤 [粒度](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design)，从而避免加载某列的所有值并进行线性扫描。可以使用 `EXPLAIN` 子句，并设置参数 `indexes=1`，来识别已跳过的粒度数量。请考虑以下原始表 `otel_logs_v2` 和带有 ngram 布隆过滤器的表 `otel_logs_bloom` 的响应。

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

布隆过滤器通常仅在其大小小于列本身时才能更快。如果它更大，那么在性能上可能几乎没有好处。通过以下查询比较过滤器和列的大小：

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

在上述示例中，我们可以看到二级布隆过滤器索引的大小为 12MB - 几乎是该列压缩大小 56MB 的五分之一。

布隆过滤器可能需要显著调整。我们建议遵循 [这里的说明](/engines/table-engines/mergetree-family/mergetree#bloom-filter)，这些说明在识别最佳设置时可能会很有用。布隆过滤器在插入和合并时也可能是昂贵的。用户在将布隆过滤器添加到生产之前，应评估其对插入性能的影响。

有关二级跳过索引的更多详细信息，可以在 [这里](https://optimize/skipping-indexes#skip-index-functions) 找到。
### 从映射中提取 {#extracting-from-maps}

Map 类型在 OTel 模式中普遍存在。此类型要求值和键具有相同的类型——对于 Kubernetes 标签等元数据来说足够。当查询 Map 类型的子键时，整个父列会被加载。如果映射中有许多键，这会产生显著的查询惩罚，因为需要从磁盘读取的数据比键作为列存在时要多。

如果您经常查询特定的键，请考虑将其移动到根部的专用列中。这通常是响应于常见访问模式和部署后进行的任务，可能在生产之前难以预测。有关如何在部署后修改架构，请参见 ["管理架构变化"](/observability/managing-data#managing-schema-changes)。
## 测量表的大小和压缩 {#measuring-table-size--compression}

ClickHouse 被用于可观察性的一个主要原因是压缩。

它不仅能显著降低存储成本，更少的数据在磁盘上意味着更少的 I/O 和更快的查询及插入。I/O 的减少将超出任何压缩算法与 CPU 的开销。因此，在确保 ClickHouse 查询快速时，数据压缩的改善应该是首要关注点。

有关测量压缩的详细信息，请参见 [这里](/data-compression/compression-in-clickhouse)。
