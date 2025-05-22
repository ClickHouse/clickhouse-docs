---
'title': '架构设计'
'description': '为可观测性设计架构设计'
'keywords':
- 'observability'
- 'logs'
- 'traces'
- 'metrics'
- 'OpenTelemetry'
- 'Grafana'
- 'OTel'
'slug': '/use-cases/observability/schema-design'
---

import observability_10 from '@site/static/images/use-cases/observability/observability-10.png';
import observability_11 from '@site/static/images/use-cases/observability/observability-11.png';
import observability_12 from '@site/static/images/use-cases/observability/observability-12.png';
import observability_13 from '@site/static/images/use-cases/observability/observability-13.png';
import Image from '@theme/IdealImage';


# 设计可观测性的架构

我们建议用户始终为日志和追踪创建自己的模式，原因如下：

- **选择主键** - 默认模式使用 `ORDER BY`，该方式针对特定的访问模式进行了优化。您的访问模式不太可能与此对齐。
- **提取结构** - 用户可能希望从现有列中提取新列，例如 `Body` 列。这可以通过物化列（在更复杂的情况下使用物化视图）来完成。这需要模式变更。
- **优化映射** - 默认模式使用 Map 类型存储属性。这些列允许存储任意元数据。尽管这是一个基本功能，因为事件的元数据通常在预先定义时未知，无法在强类型数据库如 ClickHouse 中存储，访问映射键及其值的效率并不如访问普通列。我们通过修改模式并确保最常访问的映射键为顶层列来解决此问题 - 参见 ["使用 SQL 提取结构"](#extracting-structure-with-sql)。这需要模式变更。
- **简化映射键访问** - 访问映射中的键需要更冗长的语法。用户可以通过别名来缓解这一点。参见 ["使用别名"](#using-aliases) 简化查询。
- **二级索引** - 默认模式使用二级索引来加速对 Maps 的访问和加快文本查询。通常不需要这些，且会产生额外的磁盘空间开销。可以使用，但应进行测试以确保其必要性。参见 ["二级 / 数据跳过索引"](#secondarydata-skipping-indices)。
- **使用编解码器** - 如果用户理解预期数据并有证据表明这会改善压缩，可能希望自定义列的编解码器。

_我们在下面详细描述上述每个用例。_

**重要提示：** 虽然鼓励用户扩展和修改其模式以实现最佳的压缩和查询性能，但应在可能的情况下遵循 OTel 模式命名以核心列。ClickHouse Grafana 插件假设存在一些基本的 OTel 列以协助查询构建，例如 Timestamp 和 SeverityText。日志和追踪所需的列在此处记录 [[1]](https://grafana.com/developers/plugin-tools/tutorials/build-a-logs-data-source-plugin#logs-data-frame-format)[[2]](https://grafana.com/docs/grafana/latest/explore/logs-integration/) 和 [此处](https://grafana.com/docs/grafana/latest/explore/trace-integration/#data-frame-structure)。您可以选择更改这些列名，覆盖插件配置中的默认值。

## 使用 SQL 提取结构 {#extracting-structure-with-sql}

无论是摄取结构化还是非结构化日志，用户通常需要具备以下能力：

- **从字符串块中提取列**。查询这些列的速度会比在查询时间使用字符串操作更快。
- **从映射中提取键**。默认模式将任意属性放置在 Map 类型的列中。该类型提供了无模式的功能，用户在定义日志和追踪时不需预先定义属性的列，这在从 Kubernetes 收集日志并希望保持 pod 标签以便后续搜索时通常不可行。访问映射键及其值的效率低于查询普通 ClickHouse 列。因此，将映射键提取到根表列通常是有利的。

考虑以下查询：

假设我们希望计算哪些 URL 路径接收最多的 POST 请求，使用结构化日志。JSON 块存储在 `Body` 列中作为字符串。此外，如果用户在收集器中启用了 json_parser，它也可以存储在 `LogAttributes` 列中作为 `Map(String, String)`。

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

假设 `LogAttributes` 可用，查询计算网站的 URL 路径中接收到最多 POST 请求的查询为：

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

注意这里的映射语法，例如 `LogAttributes['request_path']`，以及用于去除 URL 中查询参数的 [`path` 函数](/sql-reference/functions/url-functions#path)。

如果用户没有在收集器中启用 JSON 解析，则 `LogAttributes` 将为空，迫使我们使用 [JSON 函数](/sql-reference/functions/json-functions) 从字符串 `Body` 中提取列。

:::note 优先选择 ClickHouse 进行解析
我们通常推荐用户在 ClickHouse 中解析结构化日志的 JSON。我们确信 ClickHouse 是速度最快的 JSON 解析实现。然而，我们认识到用户可能希望将日志发送到其他来源，而不希望这一逻辑驻留在 SQL 中。
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

解析非结构化日志的查询复杂性和成本增加（注意性能差异）是我们建议用户在可能的情况下始终使用结构化日志的原因。

:::note 考虑字典
上述查询可以优化以利用正则表达式字典。有关详细信息，请参见 [使用字典](#using-dictionaries)。
:::

这两种用例均可以通过将上述查询逻辑移动到插入时间来使用 ClickHouse 来满足。我们将在下面探讨几种方法，突出每种方法的适用时机。

:::note OTel 或 ClickHouse 进行处理？
用户也可以使用 OTel Collector 处理器和操作符进行处理，具体描述见 [此处](/observability/integrating-opentelemetry#processing---filtering-transforming-and-enriching)。在大多数情况下，用户会发现 ClickHouse 相对于收集器的处理器更具资源效率和更快。在 SQL 中执行所有事件处理的主要缺点是您将解决方案与 ClickHouse 耦合。例如，用户可能希望将处理过的日志发送到 OTel 收集器的其他目标，例如 S3。
:::

### 物化列 {#materialized-columns}

物化列提供了从其他列提取结构的最简单解决方案。这些列的值始终在插入时计算，无法在 INSERT 查询中指定。

:::note 开销
物化列会产生额外的存储开销，因为在插入时值被提取到磁盘的新列中。
:::

物化列支持任何 ClickHouse 表达式，并可以利用用于 [处理字符串](/sql-reference/functions/string-functions) 的任何分析函数（包括 [正则表达式和搜索](/sql-reference/functions/string-search-functions)）和 [URL](/sql-reference/functions/url-functions)，执行 [类型转换](/sql-reference/functions/type-conversion-functions)， [从 JSON 中提取值](/sql-reference/functions/json-functions) 或 [数学运算](/sql-reference/functions/math-functions)。

我们推荐将物化列用于基本处理。它们尤其适用于从映射中提取值，提升至根列，并执行类型转换。在非常基本的模式中或与物化视图结合使用时，它们通常最有用。考虑以下从收集器提取到 `LogAttributes` 列的日志模式：

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

我们的三个物化视图列提取请求页面、请求类型和引荐域名。这些访问映射键并对其值应用函数。我们后续的查询速度显著更快：

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
物化列默认不会在 `SELECT *` 中返回。这是为了保持 `SELECT *` 的结果可以始终通过 INSERT 插回表中的不变性。通过设置 `asterisk_include_materialized_columns=1` 可以禁用此行为，并且可以在 Grafana 中启用（见数据源配置中的 `Additional Settings -> Custom Settings`）。
:::

## 物化视图 {#materialized-views}

[物化视图](/materialized-views) 提供了一种更强大的方式用于对日志和追踪应用 SQL 过滤和转换。

物化视图允许用户将计算成本从查询时间转移到插入时间。ClickHouse 物化视图仅是一个触发器，在数据块插入表时运行查询。该查询的结果将插入到第二个“目标”表中。

<Image img={observability_10} alt="物化视图" size="md"/>

:::note 实时更新
ClickHouse 中的物化视图会实时更新，随着数据流入其基础的表，功能更像是不断更新的索引。相比之下，在其他数据库中，物化视图通常是查询的静态快照，必须刷新（类似于 ClickHouse 的可刷新的物化视图）。
:::

与物化视图相关的查询理论上可以是任何查询，包括聚合，尽管 [与 Join 的限制](/using-materialized-views-in-clickhouse#materialized-views-and-joins)存在。对于日志和追踪所需的转换和过滤工作负载，用户可以考虑任何 `SELECT` 语句都是可能的。

用户应记住，查询只是一个触发器，在插入到表中的行（源表）上执行，结果发送到一个新表（目标表）。

为了确保我们不将数据双重持久化（在源表和目标表中），我们可以将源表的表更改为 [Null 表引擎](/engines/table-engines/special/null)，保持原始模式。我们的 OTel 收集器将继续将数据发送到此表。例如，对于日志，`otel_logs` 表变为：

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

Null 表引擎是一种强大的优化 - 可以将其视为 `/dev/null`。该表不会存储任何数据，但任何附加的物化视图仍将在插入的行上执行，然后被丢弃。

考虑以下查询。此查询将我们的行转化为所需的格式，提取所有来自 `LogAttributes` 的列（假设这是由收集器使用 `json_parser` 操作符设置的），并设置 `SeverityText` 和 `SeverityNumber`（基于某些简单条件和对 [这些列](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-severitytext) 的定义）。在这种情况下，我们还仅选择我们知道将被填充的列 - 忽略诸如 `TraceId`、`SpanId` 和 `TraceFlags` 类的列。

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

我们还提取了上面的 `Body` 列 - 以防将来添加了额外属性且未被我们的 SQL 提取。这一列在 ClickHouse 中应具有良好的压缩率，并且不经常被访问，因此不会影响查询性能。最后，我们将时间戳减少为 DateTime（以节省空间 - 参见 ["优化类型"](#optimizing-types)）并进行类型转换。

:::note 条件
注意上述用于提取 `SeverityText` 和 `SeverityNumber` 的 [条件](https://sql-reference/functions/conditional-functions)。这些对于制定复杂条件和检查映射中值的设置非常有用 - 我们天真地假设所有键都存在于 `LogAttributes` 中。我们建议用户熟悉它们 - 除了处理 [null 值](/sql-reference/functions/functions-for-nulls) 之外，它们是您进行日志解析的得力助手！
:::

我们需要一个表来接收这些结果。以下目标表与上述查询匹配：

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

所选类型基于 ["优化类型"](#optimizing-types) 中讨论的优化。

:::note
注意我们如何显著改变了我们的模式。实际上，用户可能还会有他们希望保留的 Trace 列以及 `ResourceAttributes` 列（这通常包含 Kubernetes 元数据）。Grafana 可以利用 Trace 列提供日志与追踪之间的链接功能 - 参见 ["使用 Grafana"](/observability/grafana)。
:::

下面，我们创建一个物化视图 `otel_logs_mv`，该视图对 `otel_logs` 表执行上述选择并将结果发送到 `otel_logs_v2`。

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

以上内容如下图所示：

<Image img={observability_11} alt="Otel MV" size="md"/>

如果我们现在重启在 ["导出到 ClickHouse"](/observability/integrating-opentelemetry#exporting-to-clickhouse) 中使用的收集器配置，数据将出现在 `otel_logs_v2` 中，格式为我们所需的格式。注意使用类型化的 JSON 提取函数。

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

一个等效的物化视图，依赖于使用 JSON 函数从 `Body` 列提取列，如下所示：

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

上述物化视图依赖于隐式类型转换 - 特别是在使用 `LogAttributes` 映射的情况下。ClickHouse 通常会将提取的值透明地转换为目标表类型，减少所需的语法。然而，我们建议用户始终通过仅使用 `SELECT` 语句和 [`INSERT INTO`](/sql-reference/statements/insert-into) 语句与具有相同模式的目标表来测试其视图。这应该确认类型是否正确处理。应特别注意以下情况：

- 如果映射中不存在键，将返回空字符串。在数字的情况下，用户需要将其映射到适当的值。这可以通过 [条件](https://sql-reference/functions/conditional-functions) 实现，例如 `if(LogAttributes['status'] = ", 200, LogAttributes['status'])` 或 [类型转换函数](/sql-reference/functions/type-conversion-functions)，如果默认值可以接受，例如 `toUInt8OrDefault(LogAttributes['status'] )`
- 某些类型可能并不总是会被转换，例如，数字的字符串表示不会转换为枚举值。
- 如果未找到值，JSON 提取函数将返回其类型的默认值。确保这些值是合理的！

:::note 避免 Nullable
避免在 ClickHouse 中针对可观测性数据使用 [Nullable](/sql-reference/data-types/nullable)。在日志和追踪中，它很少需要区分空值和 null 值。此特性会造成额外的存储开销并对查询性能产生负面影响。有关详细信息，请见 [此处](/data-modeling/schema-design#optimizing-types)。
:::

## 选择主（排序）键 {#choosing-a-primary-ordering-key}

一旦您提取了所需的列，就可以开始优化排序/主键。

可以应用一些简单的规则来帮助选择排序键。以下规则有时可能会发生冲突，因此请按顺序考虑这些规则。用户可以从此过程中识别出一些键，通常 4-5 个即可满足需求：

1. 选择与常用过滤器和访问模式相一致的列。如果用户通常通过特定列（例如 pod 名称）开始可观测性调查，则此列将频繁用于 `WHERE` 子句中。优先将这些列包含在您的键中，而不是使用频率较低的列。
2. 优先选择能够在过滤时排除大量行的列，从而减少需要读取的数据量。服务名称和状态代码通常是不错的候选者 - 在后者的情况下，仅当用户过滤的值能够排除大多数行时，例如过滤 200 状态码，在大多数系统中将匹配大多数行，相比之下，500 错误将仅对应于小部分。
3. 优先选择与表中其他列高度相关的列。这有助于确保这些值也以连续的方式存储，从而改善压缩。
4. 对排序键列进行 `GROUP BY` 和 `ORDER BY` 操作时可以更有效地利用内存。

<br />

在识别排序键的列子集后，必须按特定顺序声明这些列。这个顺序可以显著影响查询中二级键列的过滤效率以及表数据文件的压缩比。一般来说，**最好按照基数的升序对键进行排序**。这应该与列在排序键中的出现顺序的过滤效率相平衡，出现在排序元组后面的列的过滤效率低于出现在元组前面的列。均衡这些行为并考虑您的访问模式。最重要的是，测试不同的变体。为了进一步了解排序键及其优化方式，建议阅读 [这篇文章](/guides/best-practices/sparse-primary-indexes)。

:::note 结构优先
我们建议在构建日志结构后再决定排序键。不要在属性映射或 JSON 提取表达式中使用键。确保将您的排序键设置为表中的根列。
:::

## 使用映射 {#using-maps}

前面的示例展示了使用映射语法 `map['key']` 访问 `Map(String, String)` 列中的值。除了使用映射语法访问嵌套键，ClickHouse 还提供了专门的 [映射函数](/sql-reference/functions/tuple-map-functions#mapkeys)，用于过滤或选择这些列。

例如，以下查询使用 [`mapKeys` 函数](/sql-reference/functions/tuple-map-functions#mapkeys) 识别 `LogAttributes` 列中所有独特键，之后使用 [`groupArrayDistinctArray` 函数](/sql-reference/aggregate-functions/combinators) （组合器）。

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
我们不建议在映射列名中使用点，并可能会弃用其使用。请使用下划线 `_`。
:::

## 使用别名 {#using-aliases}

查询映射类型的速度低于正常列的速度 - 参见 ["加速查询"](#accelerating-queries)。此外，它的语法更加复杂，用户编写起来可能会感觉繁琐。为了解决这个问题，我们建议使用别名列。

别名列在查询时间计算，并不存储在表中。因此，无法向这种类型的列插入值。使用别名，我们可以引用映射键并简化语法，透明地将映射条目暴露为普通列。考虑以下示例：

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

我们有几个物化列和一个 `ALIAS` 列 `RemoteAddr`，该列访问映射 `LogAttributes`。我们现在可以通过此列查询 `LogAttributes['remote_addr']` 值，从而简化我们的查询，如下所示：

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

此外，通过 `ALTER TABLE` 命令添加 `ALIAS` 列很简单。这些列将立即可用，例如：

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

:::note 默认为不包括别名
默认情况下，`SELECT *` 排除别名列。可以通过设置 `asterisk_include_alias_columns=1` 禁用此行为。
:::

## 优化类型 {#optimizing-types}

[Clickhouse 的一般最佳实践](/data-modeling/schema-design#optimizing-types) 适用于 ClickHouse 用例。

## 使用编解码器 {#using-codecs}

除了类型优化，用户在尝试优化 ClickHouse 可观测性架构的压缩时，可以遵循 [编解码器的一般最佳实践](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec)。

一般来说，用户会发现 `ZSTD` 编解码器非常适合日志和追踪数据集。将压缩值从默认值 1 提高可能改善压缩。然而，这应进行测试，因为较高的值在插入时带来更大的 CPU 开销。通常，我们看到提高这个值的收益很小。

此外，时间戳在压缩方面受益于增量编码，但如果该列用作主键/排序键，则会导致查询性能变慢。我们建议用户评估各自的压缩与查询性能的权衡。

## 使用字典 {#using-dictionaries}

[字典](/sql-reference/dictionaries) 是 ClickHouse 的一个 [关键特性](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)，提供来自各种内部和外部 [源](/sql-reference/dictionaries#dictionary-sources) 的内存 [键值](https://en.wikipedia.org/wiki/Key%E2%80%93value_database) 表示，优化了超低延迟查找查询。

<Image img={observability_12} alt="可观测性与字典" size="md"/>

这在各种场景中都很方便，从实时丰富摄取数据而不降低摄取过程到改善查询性能，尤其是 JOIN 会特别受益。
尽管在可观测性用例中通常不需要连接，但字典仍可以在插入和查询时间用于丰富目的。我们在下面提供两个示例。

:::note 加速连接
有兴趣通过字典加速连接的用户可以在 [此处](/dictionary) 找到进一步的详细信息。
:::

### 插入时间与查询时间 {#insert-time-vs-query-time}

字典可以用于在查询时间或插入时间丰富数据集。每种方法都有其各自的优缺点。总结如下：

- **插入时间** - 如果丰富的值不变并且存在于可用于填充字典的外部源中，通常适用。在这种情况下，在插入时丰富行可以避免查询时间对字典的查找。这会导致插入性能的成本以及额外的存储开销，因为丰富的值将被存储为列。
- **查询时间** - 如果字典中的值频繁变化，则查询时间查找通常更合适。如果映射的值改变，则避免了需要更新列（并重写数据）。这种灵活性以查询时间查找成本为代价。如果需要在许多行中进行查找，例如在过滤子句中使用字典查找，这个查询时间成本通常是显著的。对于结果丰富，即在 `SELECT` 中，这些开销通常不显著。

我们建议用户熟悉字典的基础知识。字典提供一个内存查找表，可以使用专用的 [专业函数](/sql-reference/functions/ext-dict-functions#dictgetall) 来检索值。

有关简单丰富的示例，请参见字典的指南 [这里](/dictionary)。在下面，我们重点介绍常见的可观测性丰富任务。

### 使用 IP 字典 {#using-ip-dictionaries}

使用 IP 地址对日志和追踪进行地理丰富，包含经纬度值是可观测性中的一种常见需求。我们可以使用 `ip_trie` 结构字典来实现。

我们使用公开可用的 [DB-IP 城市级数据集](https://github.com/sapics/ip-location-db#db-ip-database-update-monthly)，该数据集由 [DB-IP.com](https://db-ip.com/) 提供，受 [CC BY 4.0 许可证](https://creativecommons.org/licenses/by/4.0/) 的约束。

从 [自述文件](https://github.com/sapics/ip-location-db#csv-format) 中，我们可以看到数据的结构如下：

```csv
| ip_range_start | ip_range_end | country_code | state1 | state2 | city | postcode | latitude | longitude | timezone |
```

考虑到这个结构，让我们开始使用 [url()](/sql-reference/table-functions/url) 表功能查看数据：

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

为了方便起见，我们使用 [`URL()`](/engines/table-engines/special/url) 表引擎创建 ClickHouse 表对象，并确认总行数：

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

由于我们的 `ip_trie` 字典要求 IP 地址范围以 CIDR 表示，我们需要转换 `ip_range_start` 和 `ip_range_end`。

对于每个范围，可以通过以下查询简洁计算其 CIDR：

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
上述查询中有很多内容。对感兴趣的人，阅读这个出色的 [解释](https://clickhouse.com/blog/geolocating-ips-in-clickhouse-and-grafana#using-bit-functions-to-convert-ip-ranges-to-cidr-notation)。否则请接受上述计算为 IP 范围计算 CIDR。
:::

就我们的目的而言，我们只需要 IP 范围、国家代码和坐标，因此让我们创建一个新表并插入我们的 Geo IP 数据：

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

为了在 ClickHouse 中执行低延迟的 IP 查找，我们将利用字典在内存中存储关键值 -> 属性映射，以便我们的 Geo IP 数据。ClickHouse 提供了一种 `ip_trie` [字典结构](/sql-reference/dictionaries#ip_trie)，用于将我们的网络前缀（CIDR 块）映射到坐标和国家代码。以下查询指定了使用这种布局的字典和上述表作为源。

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

我们可以从字典中选择行，并确认该数据集可用于查找：

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
ClickHouse 中的字典会基于底层表数据和上面使用的生存时间条款定期刷新。要更新时间 IP 字典以反映 DB-IP 数据集中的最新更改，我们只需从 geoip_url 远程表向我们的 `geoip` 表重新插入数据并应用转换。
:::

现在我们已经将 Geo IP 数据加载到我们的 `ip_trie` 字典中（方便起见也命名为 `ip_trie`），我们可以用于 IP 地理位置查找。可以使用 [`dictGet()` 函数](/sql-reference/functions/ext-dict-functions) 进行查找，如下所示：

```sql
SELECT dictGet('ip_trie', ('country_code', 'latitude', 'longitude'), CAST('85.242.48.167', 'IPv4')) AS ip_details

┌─ip_details──────────────┐
│ ('PT',38.7944,-9.34284) │
└─────────────────────────┘

1 row in set. Elapsed: 0.003 sec.
```

注意此处的检索速度。这使我们能够丰富日志。在此情况下，我们选择 **执行查询时间丰富**。

回到原始日志数据集，我们可以使用上述内容按国家汇总我们的日志。以下假设我们使用的是来自我们之前物化视图的模式，该物化视图具有提取出的 `RemoteAddress` 列。

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

由于 IP 到地理位置的映射可能会变化，用户可能希望了解到请求来源于请求发出时的地址 - 而不是当前同一地址的地理位置。因此，索引时间丰富在这里可能是优选的。这可以通过物化列进行，如下所示或在物化视图的选择中：

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
用户可能希望基于新数据定期更新 IP 丰富字典。这可以通过字典的 `LIFETIME` 条款实现，该条款将导致字典定期从底层表重新加载。要更新底层表，请参见 ["可刷新的物化视图"](/materialized-view/refreshable-materialized-view)。
:::

上述国家和坐标提供超出按国家分组和过滤的可视化能力。获取灵感请参见 ["可视化地理数据"](/observability/grafana#visualizing-geo-data)。

### 使用正则表达式字典（用户代理解析） {#using-regex-dictionaries-user-agent-parsing}

解析 [用户代理字符串](https://en.wikipedia.org/wiki/User_agent) 是一个经典的正则表达式问题，并在基于日志和追踪的数据集中是一个常见需求。ClickHouse 提供了高效的用户代理解析，使用正则表达式树字典。

正则表达式树字典在 ClickHouse 开源中使用 YAMLRegExpTree 字典源类型定义，该类型提供包含正则表达式树的 YAML 文件的路径。如果您希望提供自己的正则表达式字典，可以在 [此处](https://sql-reference/dictionaries#use-regular-expression-tree-dictionary-in-clickhouse-open-source) 找到所需结构的详细信息。下面我们重点介绍使用 [uap-core](https://github.com/ua-parser/uap-core) 进行用户代理解析，并加载我们支持的 CSV 格式的字典。这种方法与 OSS 和 ClickHouse Cloud 兼容。

:::note
在下面的示例中，我们使用了 2024 年 6 月最新的 uap-core 正则表达式快照，用于用户代理解析。最新的文件（偶尔更新）可以在 [这里](https://raw.githubusercontent.com/ua-parser/uap-core/master/regexes.yaml) 找到。用户可以遵循 [这里](https://sql-reference/dictionaries#collecting-attribute-values) 中的步骤，将其加载入下面使用的 CSV 文件。
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

随着我们的内存表填充完毕，我们可以加载我们的正则表达式字典。请注意，我们需要将关键值指定为列 - 这些将是我们可以从用户代理中提取的属性。

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

加载这些字典后，我们可以提供一个示例用户代理并测试我们新的字典提取功能：

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

由于围绕用户代理的规则几乎不会变，字典仅在响应新的浏览器、操作系统和设备时需要更新，因此在插入时执行此提取是有意义的。

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

这需要我们修改目标表 `otel_logs_v2` 的模式：

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

在重启收集器并根据之前记录的步骤摄取结构化日志后，我们可以查询新提取的设备、浏览器和操作系统列。

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
注意这些用户代理列中使用了元组。元组建议用于已知层次结构的复杂结构。子列与常规列相比提供相同的性能（不同于映射键），同时允许异构类型。
:::
### 进一步阅读 {#further-reading}

有关字典的更多示例和详细信息，我们推荐以下文章：

- [高级字典主题](/dictionary#advanced-dictionary-topics)
- ["使用字典加速查询"](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)
- [字典](/sql-reference/dictionaries)
## 加速查询 {#accelerating-queries}

ClickHouse 支持多种加速查询性能的技术。以下内容应仅在选择适当的主键/排序键以优化最常用的访问模式并最大化压缩后进行考虑。这通常对性能的影响最大，而且付出的努力最少。
### 使用物化视图（增量）进行聚合 {#using-materialized-views-incremental-for-aggregations}

在前面的部分中，我们探讨了使用物化视图进行数据转换和过滤。然而，物化视图还可以用于在插入时预计算聚合并存储结果。该结果可以通过后续插入的结果进行更新，从而有效地允许在插入时预计算聚合。

这里的主要思想是，结果通常会是原始数据的更小表示（在聚合的情况下是部分草图）。当结合使用更简单的查询从目标表读取结果时，查询时间会比在原始数据上执行相同计算时更快。

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

我们可以想象这是用户使用 Grafana 绘制的常见折线图。这个查询确实非常快速——数据集仅有 1000 万行，而 ClickHouse 很快！然而，如果我们将此扩展到数十亿和数万亿行，我们理想情况下希望保持此查询性能。

:::note
如果我们使用 `otel_logs_v2` 表，该表的结果来自我们之前的物化视图，该视图从 `LogAttributes` 映射中提取大小键，那么这个查询会快 10 倍。我们在这里使用原始数据仅供说明，建议如果这是常见查询，则使用之前的视图。
:::

如果我们希望在插入时使用物化视图计算该结果，则需要一个表来接收结果。该表每小时只应保留 1 行。如果接收到现有小时的更新，其他列应与现有小时的行进行合并。为了使增量状态的合并发生，必须存储其他列的部分状态。

这在 ClickHouse 中需要一种特殊的引擎类型：SummingMergeTree。这将相同排序键的所有行替换为一行，其中包含数值列的总和。以下表格将合并任何具有相同日期的行，并对任何数值列进行求和。

```sql
CREATE TABLE bytes_per_hour
(
  `Hour` DateTime,
  `TotalBytes` UInt64
)
ENGINE = SummingMergeTree
ORDER BY Hour
```

为了演示我们的物化视图，假设我们的 `bytes_per_hour` 表为空且尚未接收任何数据。我们的物化视图对插入到 `otel_logs` 中的数据执行上述 `SELECT`（这将在配置大小的块上执行），并将结果发送到 `bytes_per_hour`。语法如下所示：

```sql
CREATE MATERIALIZED VIEW bytes_per_hour_mv TO bytes_per_hour AS
SELECT toStartOfHour(Timestamp) AS Hour,
       sum(toUInt64OrDefault(LogAttributes['size'])) AS TotalBytes
FROM otel_logs
GROUP BY Hour
```

这里的 `TO` 子句是关键，表示结果将发送到哪里，即 `bytes_per_hour`。

如果我们重新启动 OTel Collector 并重新发送日志，`bytes_per_hour` 表将逐步填充上述查询结果。完成后，我们可以确认我们的 `bytes_per_hour` 的大小——我们每小时应该有 1 行：

```sql
SELECT count()
FROM bytes_per_hour
FINAL

┌─count()─┐
│     113 │
└─────────┘

1 row in set. Elapsed: 0.039 sec.
```

通过存储我们的查询结果，我们有效地将行数从 1000 万行（在 `otel_logs` 中）减少到 113 行。关键在于如果新的日志插入到 `otel_logs` 表中，新值将为其各自的小时发送到 `bytes_per_hour`，并将在后台异步自动合并——通过每小时仅保留一行，`bytes_per_hour` 将始终保持小且实时更新。

由于行的合并是异步的，当用户查询时，每小时可能会有多于一行。为了确保在查询时合并任何未完成的行，我们有两个选项：

- 在表名称上使用 [`FINAL` 修饰符](/sql-reference/statements/select/from#final-modifier)（如我们在上面的计数查询中所做）。
- 按照我们最终表中使用的排序键进行聚合，即时间戳，汇总指标。

通常，第二种选择更有效和灵活（该表可以用于其他用途），但对于某些查询来说，第一种可能更简单。以下是我们展示的两种选择：

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

这将我们的查询从 0.6 秒加速到 0.008 秒——超过 75 倍！

:::note
在处理更大的数据集和更复杂的查询时，这些节省可能会更大。有关示例，请参见 [此处](https://github.com/ClickHouse/clickpy)。
:::
#### 更复杂的示例 {#a-more-complex-example}

上述示例使用 [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree) 汇总每小时的简单计数。超出简单总和的统计需要不同的目标表引擎：[AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree)。

假设我们希望计算每天独特的 IP 地址（或独特用户）数量。该查询为：

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

为了持久化增量更新的基数计数，需要 AggregatingMergeTree。

```sql
CREATE TABLE unique_visitors_per_hour
(
  `Hour` DateTime,
  `UniqueUsers` AggregateFunction(uniq, IPv4)
)
ENGINE = AggregatingMergeTree
ORDER BY Hour
```

为了确保 ClickHouse 知道聚合状态将被存储，我们将 `UniqueUsers` 列定义为 [`AggregateFunction`](/sql-reference/data-types/aggregatefunction) 类型，指定部分状态的函数源（uniq）和源列的类型（IPv4）。与 SummingMergeTree 一样，具有相同 `ORDER BY` 键值的行将被合并（上述示例中的小时）。

相关的物化视图使用之前的查询：

```sql
CREATE MATERIALIZED VIEW unique_visitors_per_hour_mv TO unique_visitors_per_hour AS
SELECT toStartOfHour(Timestamp) AS Hour,
        uniqState(LogAttributes['remote_addr']::IPv4) AS UniqueUsers
FROM otel_logs
GROUP BY Hour
ORDER BY Hour DESC
```

注意我们在聚合函数末尾添加的后缀 `State`。这确保返回的是函数的聚合状态，而不是最终结果。这将包含额外的信息，以允许此部分状态与其他状态合并。

一旦数据通过 Collector 重启重新加载，我们可以确认在 `unique_visitors_per_hour` 表中有 113 行可用。

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

注意我们在这里使用 `GROUP BY` 而不是使用 `FINAL`。
### 使用物化视图（增量）进行快速查找 {#using-materialized-views-incremental--for-fast-lookups}

用户在选择 ClickHouse 数组键时，应考虑其访问模式，包括在过滤和聚合子句中经常使用的列。在可观察性用例中，当用户拥有更多无法用一组列封装的多样化访问模式时，这可能会受到限制。这在内置于默认 OTel 架构的示例中得到最好的说明。考虑跟踪的默认架构：

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

此架构经过优化，可以按 `ServiceName`、`SpanName` 和 `Timestamp` 进行过滤。在跟踪中，用户还需要按特定 `TraceId` 进行查找并检索相关追踪的段。虽然这一点出现在排序键中，但它在末尾的位置意味着 [过滤将不那么高效](/guides/best-practices/sparse-primary-indexes#ordering-key-columns-efficiently)，并且在检索单个追踪时，很可能会需要扫描大量数据。

OTel Collector 还安装了物化视图和相关表以应对这一挑战。表和视图如下所示：

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

该视图有效地确保表 `otel_traces_trace_id_ts` 拥有追踪的最小和最大时间戳。该表按 `TraceId` 排序，从而可以有效检索这些时间戳。这些时间戳范围可以在查询主 `otel_traces` 表时使用。更具体地说，在通过 ID 检索追踪时，Grafana 使用以下查询：

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

CTE 在此处识别追踪 ID `ae9226c78d1d360601e6383928e4d22d` 的最小和最大时间戳，然后使用此信息过滤主 `otel_traces` 表以获取其关联的段。

对于类似的访问模式，可以应用相同的方法。我们在数据建模中探讨了类似的示例 [此处](/materialized-view/incremental-materialized-view#lookup-table)。
### 使用投影 {#using-projections}

ClickHouse 投影允许用户为表指定多个 `ORDER BY` 子句。

在前面的部分中，我们探讨了如何在 ClickHouse 中使用物化视图预计算聚合、转换行以及优化可观察查询以适应不同的访问模式。

我们提供了一个示例，其中物化视图将行发送到与接收插入的原始表不同的排序键的目标表，以优化按追踪 ID 的查找。

投影可以用来解决相同的问题，使用户能够针对不属于主键的列的查询进行优化。

理论上，此能力可用于为表提供多个排序键，但有一个显著的缺点：数据重复。具体来说，数据需要按主要主键的顺序写入，还需按照为每个投影指定的顺序写入。这将减慢插入速度并消耗更多磁盘空间。

:::note 投影与物化视图
投影提供了与物化视图许多相同的功能，但应谨慎使用，后者通常更受青睐。用户应理解缺点以及何时适合使用。例如，尽管投影可用于预计算聚合，我们建议用户为此使用物化视图。
:::

<Image img={observability_13} alt="Observability and projections" size="md"/>

考虑以下查询，它根据 500 错误代码过滤我们的 `otel_logs_v2` 表。这可能是日志记录用户希望按错误代码过滤的常见访问模式：

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
我们在这里不使用 `FORMAT Null` 打印结果。这会强制读取所有结果但不返回，从而防止由于 LIMIT 而导致查询提前终止。这只是为了显示扫描所有 1000 万行所需的时间。
:::

上述查询需要使用我们选择的排序键 `(ServiceName, Timestamp)` 进行线性扫描。虽然我们可以将 `Status` 添加到排序键末尾，以提高上述查询的性能，但我们也可以添加一个投影。

```sql
ALTER TABLE otel_logs_v2 (
  ADD PROJECTION status
  (
     SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent ORDER BY Status
  )
)

ALTER TABLE otel_logs_v2 MATERIALIZE PROJECTION status
```

注意，我们必须先创建投影，然后进行物化。此后者命令使数据在磁盘上以两种不同顺序存储两次。投影还可以在创建数据时定义，如下所示，并将在数据插入时自动维护。

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

重要的是，如果通过 `ALTER` 创建投影，则在发出 `MATERIALIZE PROJECTION` 命令时，会异步创建该投影。用户可以通过以下查询确认此操作的进度，等待 `is_done=1`。

```sql
SELECT parts_to_do, is_done, latest_fail_reason
FROM system.mutations
WHERE (`table` = 'otel_logs_v2') AND (command LIKE '%MATERIALIZE%')

┌─parts_to_do─┬─is_done─┬─latest_fail_reason─┐
│           0 │     1   │                    │
└─────────────┴─────────┴────────────────────┘

1 row in set. Elapsed: 0.008 sec.
```

如果我们重复上述查询，可以看到性能显著改善，代价是额外存储（有关如何测量，请参见 ["测量表大小和压缩"](#measuring-table-size--compression)）。

```sql
SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent
FROM otel_logs_v2
WHERE Status = 500
FORMAT `Null`

0 rows in set. Elapsed: 0.031 sec. Processed 51.42 thousand rows, 22.85 MB (1.65 million rows/s., 734.63 MB/s.)
Peak memory usage: 27.85 MiB.
```

在上述示例中，我们在投影中指定了早期查询中使用的列。这将意味着只有这些指定的列将按状态的顺序作为投影的一部分存储在磁盘上。如果我们在这里使用 `SELECT *`，则所有列都会被存储。虽然这将允许更多查询（使用任何列的子集）受益于投影，但将产生额外存储。有关磁盘空间和压缩的测量，参见 ["测量表大小和压缩"](#measuring-table-size--compression)。
### 次级/数据跳过索引 {#secondarydata-skipping-indices}

无论 ClickHouse 的主键调优得多好，一些查询注定需要完整的表扫描。尽管可以通过使用物化视图（以及某些查询的投影）来减轻这种情况，但这些需要额外的维护，用户需要知道它们的可用性，以确保它们得到利用。虽然传统的关系数据库通过使用次级索引来解决此问题，但在像 ClickHouse 这样的列式数据库中，它们是无效的。相反，ClickHouse 使用“跳过”索引，这可以显著提升查询性能，让数据库跳过没有匹配值的大数据块。

默认的 OTel 架构使用次级索引，试图加速对映射的访问。尽管我们发现这些通常无效，并不推荐将它们复制到您的自定义架构，但跳过索引仍然可能有用。

用户应该在尝试应用它们之前阅读和理解 [次级索引指南](/optimize/skipping-indexes)。

**一般而言，当主键与目标的非主键列/表达式之间存在强相关性，并且用户正在查找稀有值时，即在许多粒度中不出现的值，它们将是有效的。**
### 文本搜索的布隆过滤器 {#bloom-filters-for-text-search}

对于可观察性查询，当用户需要执行文本搜索时，次级索引可能会很有用。具体来说，基于 ngram 和基于 token 的布隆过滤器索引 [`ngrambf_v1`](/optimize/skipping-indexes#bloom-filter-types) 和 [`tokenbf_v1`](/optimize/skipping-indexes#bloom-filter-types) 可用于加速对 String 列的搜索，配合操作符 `LIKE`、`IN` 和 hasToken。重要的是，基于 token 的索引使用非字母数字字符作为分隔符生成 token。这意味着在查询时只能匹配 token（或整个单词）。为了实现更细粒度的匹配，可以使用 [N-gram 布隆过滤器](/optimize/skipping-indexes#bloom-filter-types)。这将字符串分割为指定大小的 ngram，从而实现子词匹配。

为了评估将产生的 token 及其匹配，可以使用 `tokens` 函数：

```sql
SELECT tokens('https://www.zanbil.ir/m/filter/b113')

┌─tokens────────────────────────────────────────────┐
│ ['https','www','zanbil','ir','m','filter','b113'] │
└───────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.008 sec.
```

`ngram` 函数提供类似的功能，其中 `ngram` 大小可以作为第二个参数指定：

```sql
SELECT ngrams('https://www.zanbil.ir/m/filter/b113', 3)

┌─ngrams('https://www.zanbil.ir/m/filter/b113', 3)────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ['htt','ttp','tps','ps:','s:/','://','//w','/ww','www','ww.','w.z','.za','zan','anb','nbi','bil','il.','l.i','.ir','ir/','r/m','/m/','m/f','/fi','fil','ilt','lte','ter','er/','r/b','/b1','b11','113'] │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.008 sec.
```

:::note 倒排索引
ClickHouse 还实验性地支持作为次级索引的倒排索引。目前我们不推荐将其用于日志数据集，但预期它们将在生产准备就绪时取代基于 token 的布隆过滤器。
:::

在本示例中，我们使用结构化日志数据集。假设我们希望统计 `Referer` 列包含 `ultra` 的日志。

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

索引 `ngrambf_v1(3, 10000, 3, 7)` 在此处包括四个参数。其中最后一个（值 7）表示种子。其他参数表示 ngram 大小（3）、值 `m`（过滤器大小）和哈希函数数量 `k`（7）。`k` 和 `m` 需要调优，并将基于唯一 ngram/token 的数量以及过滤器结果为真负的概率——从而确认某个值在粒度中不存在。我们建议使用 [这些函数](/engines/table-engines/mergetree-family/mergetree#bloom-filter) 来帮助确定这些值。

如果调优正确，这里的提速可能会显著：

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
以上仅供说明。我们建议用户在插入时从日志中提取结构，而不是尝试使用基于 token 的布隆过滤器来优化文本搜索。然而，确实存在某些情况下，用户拥有堆栈跟踪或其他大字符串，文本搜索可能由于结构不确定而有用。
:::

关于使用布隆过滤器的一般指南：

布隆过滤器的目标是过滤 [粒度](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design)，从而避免加载某列的所有值并执行线性扫描。可以使用 `EXPLAIN` 子句，带有参数 `indexes=1`，以识别跳过的粒度数量。请考虑以下原始表 `otel_logs_v2` 和具有 ngram 布隆过滤器的表 `otel_logs_bloom` 的响应。

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

布隆过滤器通常只有在比列本身更小时才会更快。如果它更大，则可能没有显著的性能收益。通过以下查询比较过滤器的大小和列的大小：

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

在上述示例中，我们可以看到次级布隆过滤器索引大小为 12MB——几乎是列本身压缩大小 56MB 的 5 倍。

布隆过滤器可能需要显著调优。我们建议遵循 [此处](/engines/table-engines/mergetree-family/mergetree#bloom-filter) 的说明，这对于识别最佳设置可能是有用的。布隆过滤器在插入和合并时也可能很昂贵。用户在将布隆过滤器添加到生产中之前，应评估对插入性能的影响。

有关次级跳过索引的更多详细信息，请参阅 [此处](/optimize/skipping-indexes#skip-index-functions)。
### 从映射中提取 {#extracting-from-maps}

在 OTel 架构中，Map 类型是普遍存在的。此类型要求值和键具有相同类型——足以用于如 Kubernetes 标签等元数据。请注意，当查询 Map 类型的子键时，会加载整个父列。如果映射包含多个键，则可能会因需要从磁盘读取的数据量比如果键存在于某列要多而导致显著的查询惩罚。

如果您经常查询特定键，请考虑将其移到根目录的专用列中。这通常是在响应常见访问模式后进行的任务，且在部署后进行，可能在生产之前难以预测。有关如何在部署后修改架构，请参见 ["管理架构更改"](/observability/managing-data#managing-schema-changes)。
## 测量表大小和压缩 {#measuring-table-size--compression}

ClickHouse 用于可观察性的主要原因之一是压缩。

除了显著降低存储成本外，磁盘上的数据量减少意味着更少的 I/O 和更快的查询和插入。I/O 的减少将超过任何与 CPU 相关的压缩算法的开销。因此，改善数据的压缩应当是确保 ClickHouse 查询快速的首要任务。

有关测量压缩的详细信息，请参见 [此处](/data-compression/compression-in-clickhouse)。
