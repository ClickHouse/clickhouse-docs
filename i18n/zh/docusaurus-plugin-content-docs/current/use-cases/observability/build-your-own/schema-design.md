---
title: 'Schema 设计'
description: '为可观测性设计数据模式'
keywords: ['可观测性', '日志', '追踪', '指标', 'OpenTelemetry', 'Grafana', 'OTel']
slug: /use-cases/observability/schema-design
show_related_blogs: true
doc_type: 'guide'
---

import observability_10 from '@site/static/images/use-cases/observability/observability-10.png';
import observability_11 from '@site/static/images/use-cases/observability/observability-11.png';
import observability_12 from '@site/static/images/use-cases/observability/observability-12.png';
import observability_13 from '@site/static/images/use-cases/observability/observability-13.png';
import Image from '@theme/IdealImage';

# 为可观测性设计 schema {#designing-a-schema-for-observability}

我们建议用户始终为日志和追踪数据创建自己的 schema，原因如下：

- **选择主键** - 默认 schema 使用的 `ORDER BY` 已针对特定访问模式进行了优化。你的访问模式很可能与其并不一致。
- **提取结构** - 用户可能希望从现有列（例如 `Body` 列）中提取出新的列。这可以通过物化列（以及在更复杂场景中使用物化视图）实现。此操作需要修改 schema。
- **优化 Map** - 默认 schema 使用 `Map` 类型来存储属性。这些列允许存储任意元数据。由于事件元数据通常不会预先定义，否则就无法存储在像 ClickHouse 这样强类型的数据库中，因此这是一个关键能力。然而，与普通列相比，访问 `Map` 中的键及其值的效率较低。我们通过修改 schema，并将最常访问的 `Map` 键提升为顶层列来解决这一问题——参见[「使用 SQL 提取结构」](#extracting-structure-with-sql)。这需要修改 schema。
- **简化 Map 键访问** - 访问 `Map` 中的键需要更冗长的语法。用户可以通过别名来缓解此问题。参见[「使用别名」](#using-aliases)以简化查询。
- **二级索引** - 默认 schema 使用二级索引来加速对 `Map` 的访问并提升文本查询性能。通常这些索引并非必需，而且会占用额外磁盘空间。可以使用它们，但应通过测试确认确有必要。参见[「二级 / Data Skipping 索引」](#secondarydata-skipping-indices)。
- **使用 Codecs** - 如果用户了解预期数据，并且有证据表明自定义列的编解码器有助于提升压缩效果，则可以为列自定义 Codecs。

_我们将在下文中详细描述上述每个使用场景。_

**重要：** 虽然鼓励用户扩展和修改自己的 schema 以获得最佳压缩率和查询性能，但在可能的情况下，应遵循 OTel schema 对核心列的命名约定。ClickHouse Grafana 插件假定存在一些基础的 OTel 列来辅助构建查询，例如 `Timestamp` 和 `SeverityText`。日志和追踪所需的列分别记录在此处 [[1]](https://grafana.com/developers/plugin-tools/tutorials/build-a-logs-data-source-plugin#logs-data-frame-format)[[2]](https://grafana.com/docs/grafana/latest/explore/logs-integration/) 和[此处](https://grafana.com/docs/grafana/latest/explore/trace-integration/#data-frame-structure)。你可以选择更改这些列名，并在插件配置中覆盖默认值。

## 使用 SQL 提取结构 {#extracting-structure-with-sql}

无论摄取的是结构化还是非结构化日志，用户通常都需要能够：

* **从字符串 blob 中提取列**。对这些列进行查询会比在查询时直接对字符串执行操作更快。
* **从 Map 中提取键**。默认 schema 会将任意属性放入 `Map` 类型的列中。此类型提供了无模式（schema-less）的能力，其优势在于，用户在定义日志和 trace 时，不需要为这些属性预先定义列——在从 Kubernetes 收集日志并希望确保 pod（容器组）标签在后续搜索中仍然保留时，这通常是不可能做到的。从 Map 中访问键及其值比在普通 ClickHouse 列上查询要慢。因此，将 Map 中的键提取到根表的列中通常是更理想的做法。

考虑以下查询：

假设我们希望统计在结构化日志中，哪些 URL 路径接收到最多的 POST 请求。JSON blob 作为 String 存储在 `Body` 列中。此外，如果用户在 collector 中启用了 `json_parser`，它也可能会以 `Map(String, String)` 的形式存储在 `LogAttributes` 列中。

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

假设 `LogAttributes` 已可用，用于统计站点中哪些 URL 路径收到最多 POST 请求的查询如下：

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

请注意此处使用的 map 语法，例如 `LogAttributes['request_path']`，以及用于从 URL 中去掉查询参数部分的 [`path` 函数](/sql-reference/functions/url-functions#path)。

如果用户没有在采集器中启用 JSON 解析，那么 `LogAttributes` 将为空，因此需要使用 [JSON 函数](/sql-reference/functions/json-functions) 从 String 类型的 `Body` 中提取列。

:::note Prefer ClickHouse for parsing
我们通常建议用户在 ClickHouse 中对结构化日志进行 JSON 解析。我们有信心 ClickHouse 提供了最快的 JSON 解析实现。不过，我们也意识到，有些用户可能希望将日志发送到其他系统，而不希望将这部分逻辑写在 SQL 中。
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

现在来看非结构化日志的情况：

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

对非结构化日志进行类似查询时，需要在 `extractAllGroupsVertical` 函数中使用正则表达式。

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

对于解析非结构化日志的查询，其复杂性和成本都会增加（注意性能差异），这也是我们建议用户在可能的情况下尽量使用结构化日志的原因。

:::note 考虑使用字典
上述查询可以通过利用正则表达式字典进行优化。参见 [Using Dictionaries](#using-dictionaries) 以获取更多详细信息。
:::

通过将上述查询逻辑前移到写入阶段，这两种用例都可以通过 ClickHouse 来满足。我们在下面探讨几种不同的方法，并指出每种方法适用的场景。

:::note 使用 OTel 还是 ClickHouse 进行处理？
用户也可以按[此处](/observability/integrating-opentelemetry#processing---filtering-transforming-and-enriching)所述，使用 OTel Collector 的 processors 和 operators 进行处理。在大多数情况下，用户会发现 ClickHouse 在资源利用率和速度方面都明显优于 collector 的 processors。使用 SQL 执行所有事件处理的主要缺点是会将你的解决方案与 ClickHouse 紧密耦合。例如，用户可能希望从 OTel collector 将已处理日志发送到其他目的地，例如 S3。
:::

### 物化列 {#materialized-columns}

物化列是从其他列中提取结构化信息的最简单方案。这类列的值始终在插入时计算，且不能在 INSERT 查询中显式指定。

:::note 开销
物化列会带来额外的存储开销，因为在插入时其值会被提取并写入磁盘上的新列。
:::

物化列支持任意 ClickHouse 表达式，并且可以利用任意分析函数来[处理字符串](/sql-reference/functions/string-functions)（包括[正则和搜索](/sql-reference/functions/string-search-functions)）以及[URL](/sql-reference/functions/url-functions)，执行[类型转换](/sql-reference/functions/type-conversion-functions)、[从 JSON 中提取值](/sql-reference/functions/json-functions)或[数学运算](/sql-reference/functions/math-functions)。

我们推荐使用物化列进行基础处理。它们在从 map 中提取值、将其提升为顶层列以及执行类型转换时尤其有用。在非常基础的模式中或与物化视图结合使用时，它们通常最有价值。请参考下面这个日志模式：其中 JSON 已由采集器提取到 `LogAttributes` 列中：

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

用于对 `Body` 字符串使用 JSON 函数进行抽取的等效 schema 可以在[此处](https://pastila.nl/?005cbb97/513b174a7d6114bf17ecc657428cf829#gqoOOiomEjIiG6zlWhE+Sg==)找到。

我们的三个物化列会抽取请求页面、请求类型以及 referrer 的域名。它们访问 Map 的键并对其对应的值应用函数。我们后续的查询速度会显著提升：

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
默认情况下，物化列不会包含在 `SELECT *` 的返回结果中。这样可以保持这样一个不变量：`SELECT *` 的结果始终可以通过 INSERT 语句原样插回同一张表。可以通过将 `asterisk_include_materialized_columns` 设置为 1 来关闭此行为，也可以在 Grafana 中启用该设置（参见数据源配置中的 `Additional Settings -> Custom Settings`）。
:::

## 物化视图 {#materialized-views}

[物化视图](/materialized-views) 提供了一种更强大的方式，用于对日志和追踪应用 SQL 过滤和转换。

物化视图允许用户将计算成本从查询时转移到插入时。ClickHouse 中的物化视图本质上是一个触发器，在数据块插入表时对其运行查询。该查询的结果会被插入到第二个 &quot;target&quot; 表中。

<Image img={observability_10} alt="物化视图" size="md" />

:::note 实时更新
ClickHouse 中的物化视图会在数据流入其所依赖的表时实时更新，更像是持续更新的索引。相比之下，在其他数据库中，物化视图通常是某个查询的静态快照，必须刷新（类似于 ClickHouse 的 Refreshable Materialized Views）。
:::

与物化视图关联的查询理论上可以是任意查询，包括聚合查询，尽管[在 Join 方面存在一些限制](https://clickhouse.com/blog/using-materialized-views-in-clickhouse#materialized-views-and-joins)。对于日志和追踪所需的转换和过滤工作负载，用户可以认为任意 `SELECT` 语句都是可行的。

用户应当记住，该查询只是一个触发器，对插入到表中的行（源表）执行，并将结果发送到一个新表（目标表）。

为了确保我们不会在源表和目标表中各持久化一份数据，我们可以将源表的表引擎修改为 [Null table engine](/engines/table-engines/special/null)，同时保留原有的表结构（schema）。我们的 OTel collectors 将继续向该表发送数据。例如，对于日志，`otel_logs` 表会变为：

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

Null 表引擎是一种强大的优化手段——可以把它类比为 `/dev/null`。这个表本身不会存储任何数据，但任何附加其上的物化视图仍然会在行被丢弃之前，基于插入的行继续执行。

来看下面的查询。它将我们的行转换为希望保留的格式，从 `LogAttributes` 中提取所有列（我们假设这是由采集器使用 `json_parser` 算子设置的），并设置 `SeverityText` 和 `SeverityNumber`（基于一些简单条件以及对[这些列](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-severitytext)的定义）。在这个例子中，我们还仅选择那些我们确定会被填充的列——忽略诸如 `TraceId`、`SpanId` 和 `TraceFlags` 等列。

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

我们还提取了上面的 `Body` 列——以防之后新增了一些当前 SQL 未提取的额外属性。该列在 ClickHouse 中压缩效果很好，而且很少被访问，因此不会影响查询性能。最后，我们通过一次类型转换将 Timestamp 转换为 DateTime（以节省空间——参见 [&quot;Optimizing Types&quot;](#optimizing-types)）。

:::note 条件函数
请注意上面为提取 `SeverityText` 和 `SeverityNumber` 而使用的[条件函数](/sql-reference/functions/conditional-functions)。这些函数在构造复杂条件以及检查 map 中的值是否已设置时非常有用——我们在此简单地假设 `LogAttributes` 中存在所有键。我们建议用户熟悉这些函数——在日志解析时，它们与处理[空值](/sql-reference/functions/functions-for-nulls)的函数一起，是你得力的助手！
:::

我们需要一个表来接收这些结果。下面的目标表与上面的查询相匹配：

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

此处选择的类型基于在 [&quot;Optimizing types&quot;](#optimizing-types) 中讨论的优化。

:::note
请注意，我们在这里对 schema（模式）进行了大幅调整。实际场景中，用户很可能还会有希望保留的 Trace 列，以及 `ResourceAttributes` 列（通常包含 Kubernetes 元数据）。Grafana 可以利用这些 Trace 列在日志与 Trace 之间提供跳转/关联功能——参见 [&quot;Using Grafana&quot;](/observability/grafana)。
:::

下面，我们创建一个物化视图 `otel_logs_mv`，它对 `otel_logs` 表执行上述 SELECT 查询，并将结果写入 `otel_logs_v2`。

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

上面的内容在下图中可视化展示：

<Image img={observability_11} alt="Otel MV" size="md" />

如果我们现在重启 [&quot;Exporting to ClickHouse&quot;](/observability/integrating-opentelemetry#exporting-to-clickhouse) 中使用的 collector 配置，数据就会以我们期望的格式出现在 `otel_logs_v2` 中。请注意这里使用了类型化的 JSON 提取函数。

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

下面展示了一个等效的物化视图，它通过使用 JSON 函数从 `Body` 列中解析并提取各个字段：

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

上面的物化视图依赖于隐式类型转换——尤其是在使用 `LogAttributes` 映射时。ClickHouse 通常会透明地将提取的值转换为目标表的类型，从而简化语法。不过，我们建议用户始终通过将视图中的 `SELECT` 语句与一个使用相同 schema 的目标表上的 [`INSERT INTO`](/sql-reference/statements/insert-into) 语句配合使用来测试视图。这样可以确认类型是否被正确处理。以下情况需要特别注意：

- 如果某个键在映射中不存在，将返回空字符串。对于数值类型，用户需要将这些值映射为合适的数值。这可以通过[条件函数](/sql-reference/functions/conditional-functions)实现，例如 `if(LogAttributes['status'] = ", 200, LogAttributes['status'])`，或者在默认值可接受的情况下，通过[类型转换函数](/sql-reference/functions/type-conversion-functions)实现，例如 `toUInt8OrDefault(LogAttributes['status'] )`。
- 某些类型不会始终被自动转换，例如数值的字符串表示不会被转换为枚举值。
- JSON 提取函数在未找到值时，会按其类型返回默认值。请确保这些默认值在语义上是合理的！

:::note Avoid Nullable
在 ClickHouse 中处理可观测性（Observability）数据时避免使用 [Nullable](/sql-reference/data-types/nullable)。在日志和跟踪数据中，很少需要区分空字符串和 null。该特性会带来额外的存储开销，并对查询性能产生负面影响。更多细节请参见[此处](/data-modeling/schema-design#optimizing-types)。
:::

## 选择主键（排序键） {#choosing-a-primary-ordering-key}

在提取出所需列之后，就可以开始优化排序键 / 主键了。

可以遵循一些简单规则来帮助选择排序键。下面这些规则有时会互相冲突，因此请按顺序权衡考虑。通过这个过程，用户通常可以识别出若干个键，一般 4–5 个就足够：

1. 选择与常见过滤条件和访问模式相匹配的列。如果用户在开始可观测性排查时，通常会先按某一特定列（例如 pod（容器组）名称）进行过滤，那么该列将频繁出现在 `WHERE` 子句中。优先将这些列包含在键中，而不是那些使用频率较低的列。
2. 优先选择在过滤时能排除掉总行数中很大比例的列，从而减少需要读取的数据量。服务名和状态码通常是不错的候选——状态码只有在用户会按能排除大部分行的取值进行过滤时才适用，例如按 2xx 状态码过滤在大多数系统中会匹配大多数行，而 5xx 错误通常只对应一个很小的子集。
3. 优先选择很可能与表中其他列高度关联的列。这有助于确保这些值也能被连续存储，从而提升压缩效果。
4. 对排序键中的列执行 `GROUP BY` 和 `ORDER BY` 操作时，可以更高效地使用内存。

<br />

在确定排序键要使用的列子集之后，必须以特定顺序声明这些列。该顺序会显著影响查询中对排序键后续列进行过滤的效率，以及该表数据文件的压缩率。一般而言，**最好按照基数从低到高的顺序来排列键**。同时需要平衡的一点是：对在排序键中位置较后的列进行过滤，将不如对元组中靠前的列进行过滤高效。请在这些行为之间做好权衡，并结合你的访问模式加以考虑。最重要的是，要对不同方案进行测试。要进一步了解排序键以及如何优化它们，我们推荐阅读[这篇文章](/guides/best-practices/sparse-primary-indexes)。

:::note Structure first
我们建议在已经对日志完成结构化之后，再来决定排序键。不要在排序键中使用属性映射中的键或 JSON 提取表达式。请确保你的排序键在表中是作为根级列存在的。
:::

## 使用 map {#using-maps}

前面的示例展示了如何使用 map 语法 `map['key']` 来访问 `Map(String, String)` 列中的值。除了使用 map 表示法来访问嵌套键之外，还可以使用 ClickHouse 提供的专用 [map 函数](/sql-reference/functions/tuple-map-functions#mapkeys) 来过滤或选取这些列。

例如，下面的查询使用 [`mapKeys` 函数](/sql-reference/functions/tuple-map-functions#mapkeys)，再配合 [`groupArrayDistinctArray` 函数](/sql-reference/aggregate-functions/combinators)（一种组合器），来找出 `LogAttributes` 列中所有可用的唯一键。

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

:::note 避免使用点号
我们不建议在 Map 列名中使用点号，将来可能会取消对此的支持。请改用 `_`。
:::

## 使用别名 {#using-aliases}

查询 `map` 类型列比查询普通列要慢——参见 [&quot;加速查询&quot;](#accelerating-queries)。此外，其语法更为复杂，用户书写起来也较为繁琐。为了解决这一问题，我们建议使用别名（ALIAS）列。

ALIAS 列在查询时计算且不会存储在表中。因此，无法向此类列执行 INSERT 写入值。通过使用别名，我们可以引用 map 的键并简化语法，将 map 中的条目透明地暴露为普通列。请看以下示例：

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

我们有几个物化列，以及一个 `ALIAS` 列 `RemoteAddr`，用于访问映射 `LogAttributes`。现在我们可以通过该列查询 `LogAttributes['remote_addr']` 的值，从而简化查询，即：

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

此外，通过 `ALTER TABLE` 命令添加 `ALIAS` 非常容易。这些列会立即生效，例如：

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

:::note 默认排除 Alias
默认情况下，`SELECT *` 会排除 ALIAS 列。可以通过将 `asterisk_include_alias_columns` 设置为 `1` 来关闭此行为。
:::

## 优化类型 {#optimizing-types}

关于类型优化的 [ClickHouse 通用最佳实践](/data-modeling/schema-design#optimizing-types) 同样适用于本 ClickHouse 场景。

## 使用编解码器 {#using-codecs}

除了类型优化之外，用户在尝试为 ClickHouse Observability 模式优化压缩时，还可以遵循[编解码器的一般最佳实践](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec)。

通常情况下，用户会发现 `ZSTD` 编解码器非常适用于日志和跟踪数据集。将压缩级别从默认值 1 提高，可能会提升压缩率。不过需要进行验证测试，因为更高的压缩级别会在插入时带来更高的 CPU 开销。通常，我们观察到将该值调高后收益有限。

另外，时间戳列虽然在压缩方面可以从增量编码中获益，但如果该列被用作主键或排序键，已被证明会导致查询性能下降。我们建议用户评估压缩效果与查询性能之间的权衡。

## 使用字典 {#using-dictionaries}

[Dictionaries](/sql-reference/dictionaries) 是 ClickHouse 的一项[关键特性](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)，用于以内存中的 [key-value](https://en.wikipedia.org/wiki/Key%E2%80%93value_database) 形式表示来自各种内部和外部[源](/sql-reference/dictionaries#dictionary-sources)的数据，并针对超低延迟的查找查询进行了优化。

<Image img={observability_12} alt="可观测性与字典" size="md"/>

字典在多种场景下都非常实用，例如在不减慢摄取过程的情况下即时丰富已摄取的数据，以及总体上提升查询性能，尤其是对 JOIN 查询有明显收益。
虽然在可观测性场景中很少需要使用 JOIN，但字典在数据富化方面仍然很有用——无论是在写入时还是查询时。下面我们分别提供这两种情况的示例。

:::note 加速 JOIN
对使用字典加速 JOIN 感兴趣的用户可以在[这里](/dictionary)找到更多详细信息。
:::

### 插入时 vs 查询时 {#insert-time-vs-query-time}

字典可以用于在查询时或插入时对数据集进行富化。这两种方式各有优缺点。概括如下：

- **插入时** - 如果富化值基本不变，并且存在于可用于填充字典的外部数据源中，那么通常适合在插入时进行富化。在这种情况下，在插入时对行进行富化可以避免在查询时对字典进行查找。代价是插入性能会受到影响，并且会有额外的存储开销，因为富化后的值将作为列进行存储。
- **查询时** - 如果字典中的值经常变化，那么在查询时进行查找通常更合适。这样就避免了在映射值变化时需要更新列（并重写数据）。这种灵活性是以查询时增加查找开销为代价的。如果需要对大量行进行查找，例如在过滤子句中使用字典查找，那么这种查询时的开销通常会比较明显。对于结果富化，即在 `SELECT` 中使用时，这种开销通常不明显。

我们建议用户先熟悉字典的基础知识。字典提供一个内存查找表，可以通过[专用函数](/sql-reference/functions/ext-dict-functions#dictGetAll)检索值。

关于基础富化示例，请参阅字典相关指南[此处](/dictionary)。在下文中，我们将重点介绍常见的可观测性富化任务。

### 使用 IP 字典 {#using-ip-dictionaries}

利用 IP 地址为日志和追踪数据添加带有经纬度的地理信息，是常见的可观测性需求。我们可以使用 `ip_trie` 结构化字典来实现这一点。

我们使用公开的 [DB-IP 城市级数据集](https://github.com/sapics/ip-location-db#db-ip-database-update-monthly)，该数据集由 [DB-IP.com](https://db-ip.com/) 提供，并遵循 [CC BY 4.0 许可证](https://creativecommons.org/licenses/by/4.0/) 的条款。

从 [README](https://github.com/sapics/ip-location-db#csv-format) 中可以看到，数据的结构如下所示：

```csv
| ip_range_start | ip_range_end | country_code | state1 | state2 | city | postcode | latitude | longitude | timezone |
```

在了解了这一结构之后，我们先通过 [url()](/sql-reference/table-functions/url) 表函数来查看一下数据：

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

为了简化操作，我们使用 [`URL()`](/engines/table-engines/special/url) 表引擎创建一个包含相同字段名的 ClickHouse 表对象，并确认总行数：

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
) ENGINE=URL('https://raw.githubusercontent.com/sapics/ip-location-db/master/dbip-city/dbip-city-ipv4.csv.gz', 'CSV')

select count() from geoip_url;

┌─count()─┐
│ 3261621 │ -- 3.26 million
└─────────┘
```

由于我们的 `ip_trie` 字典要求将 IP 地址范围以 CIDR 表示法表示，我们需要对 `ip_range_start` 和 `ip_range_end` 进行转换。

可以使用以下查询简洁地计算出每个范围对应的 CIDR：

```sql
WITH
        bitXor(ip_range_start, ip_range_end) AS xor,
        if(xor != 0, ceil(log2(xor)), 0) AS unmatched,
        32 - unmatched AS cidr_suffix,
        toIPv4(bitAnd(bitNot(pow(2, unmatched) - 1), ip_range_start)::UInt64) AS cidr_address
SELECT
        ip_range_start,
        ip_range_end,
        concat(toString(cidr_address),'/',toString(cidr_suffix)) AS cidr    
FROM
        geoip_url
LIMIT 4;

┌─ip_range_start─┬─ip_range_end─┬─cidr───────┐
│ 1.0.0.0        │ 1.0.0.255    │ 1.0.0.0/24 │
│ 1.0.1.0        │ 1.0.3.255    │ 1.0.0.0/22 │
│ 1.0.4.0        │ 1.0.7.255    │ 1.0.4.0/22 │
│ 1.0.8.0        │ 1.0.15.255   │ 1.0.8.0/21 │
└────────────────┴──────────────┴────────────┘

4 rows in set. Elapsed: 0.259 sec.
```

:::note
上面的查询内容较多。感兴趣的读者可以查看这篇精彩的[说明](https://clickhouse.com/blog/geolocating-ips-in-clickhouse-and-grafana#using-bit-functions-to-convert-ip-ranges-to-cidr-notation)。否则，只需知道上述查询会为一个 IP 范围计算出 CIDR 即可。
:::

在本例中，我们只需要 IP 范围、国家代码和坐标，因此让我们创建一个新表并插入 Geo IP 数据：

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

为了在 ClickHouse 中进行低延迟的 IP 查询，我们将利用字典在内存中存储地理 IP（Geo IP）数据的键到属性的映射关系。ClickHouse 提供了一个 `ip_trie` [字典结构](/sql-reference/dictionaries#ip_trie)，用于将网络前缀（CIDR 块）映射到坐标和国家代码。下面的查询基于这种结构布局，并以上述表作为数据源来定义一个字典。

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

我们可以从该字典中选取一些行，以确认此数据集可用于查找：

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
ClickHouse 中的字典会根据其底层表数据以及上文使用的 lifetime 子句定期刷新。要让我们的 Geo IP 字典反映 DB-IP 数据集中的最新变化，只需要将 `geoip_url` 远程表中的数据重新插入到应用了转换的 `geoip` 表中即可。
:::

现在我们已经把 Geo IP 数据加载进了 `ip_trie` 字典（名称也恰好是 `ip_trie`），就可以用它来执行 IP 地理定位了。可以使用 [`dictGet()` 函数](/sql-reference/functions/ext-dict-functions) 按如下方式实现：

```sql
SELECT dictGet('ip_trie', ('country_code', 'latitude', 'longitude'), CAST('85.242.48.167', 'IPv4')) AS ip_details

┌─ip_details──────────────┐
│ ('PT',38.7944,-9.34284) │
└─────────────────────────┘

1 row in set. Elapsed: 0.003 sec.
```

注意这里的检索速度。这使我们可以对日志进行富化。在本例中，我们选择在 **查询时进行富化（query time enrichment）**。

回到我们原始的日志数据集，我们可以利用上述结果按国家对日志进行聚合。下面的示例假设我们使用的是之前物化视图生成的 schema，其中包含提取出的 `RemoteAddress` 列。

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

由于 IP 与地理位置之间的映射可能会发生变化，用户通常希望知道请求在发出时是从哪里发起的，而不是这个地址此刻对应的地理位置。基于这一原因，这里更适合在索引时进行富化（index time enrichment）。这可以通过如下所示的物化列来实现，或者在物化视图的 `SELECT` 子句中实现：

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
用户通常希望基于最新数据定期更新 IP 富集字典。可以使用字典的 `LIFETIME` 子句实现这一点，该子句会使字典定期从其底层表中重新加载。要更新底层表，请参阅 [&quot;可刷新物化视图&quot;](/materialized-view/refreshable-materialized-view)。
:::

上述国家和坐标信息不仅支持按国家进行分组和过滤，还提供了更丰富的可视化能力。可参考 [&quot;可视化地理数据&quot;](/observability/grafana#visualizing-geo-data) 获取灵感。

### 使用正则表达式字典（User-Agent 解析） {#using-regex-dictionaries-user-agent-parsing}

[User agent 字符串](https://en.wikipedia.org/wiki/User_agent) 的解析是一个经典的正则表达式问题，也是基于日志和追踪数据集中的常见需求。ClickHouse 通过正则表达式树字典（Regular Expression Tree Dictionaries）高效解析 user agent。

在 ClickHouse 开源版中，正则表达式树字典通过 `YAMLRegExpTree` 字典源类型定义，该类型指定包含正则表达式树的 YAML 文件路径。如果你希望提供自己的正则表达式字典，可以在[此处](/sql-reference/dictionaries#use-regular-expression-tree-dictionary-in-clickhouse-open-source)找到所需结构的详细说明。下面我们重点介绍如何使用 [uap-core](https://github.com/ua-parser/uap-core) 进行 user-agent 解析，并加载适用于受支持 CSV 格式的字典。此方法兼容 OSS 和 ClickHouse Cloud。

:::note
在下列示例中，我们使用了截至 2024 年 6 月的最新 uap-core user-agent 解析正则表达式快照。最新（不定期更新）的文件可以在[这里](https://raw.githubusercontent.com/ua-parser/uap-core/master/regexes.yaml)找到。用户可以按照[此处](/sql-reference/dictionaries#collecting-attribute-values)中的步骤，将其加载到下文使用的 CSV 文件中。
:::

创建以下 Memory 表。这些表存储用于解析设备、浏览器和操作系统的正则表达式。

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

可以使用 `url` 表函数，将以下公开托管的 CSV 文件中的数据导入这些表：

```sql
INSERT INTO regexp_os SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_os.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')

INSERT INTO regexp_device SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_device.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')

INSERT INTO regexp_browser SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_browser.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')
```

在内存表填充完成后，我们就可以加载正则表达式字典了。请注意，我们需要将键值指定为列——这些将是我们可以从 User-Agent 中提取的属性。

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

在加载了这些字典之后，我们可以提供一个示例 user-agent 字符串，并测试我们新的字典提取能力：

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

鉴于与 user agent 相关的规则很少发生变化，且该字典只需在出现新的浏览器、操作系统和设备时才进行更新，因此在插入数据时就完成这一步解析是合理的。

我们可以选择使用物化列或物化视图来完成这项工作。下面我们将修改前面使用过的物化视图：

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

这需要我们修改目标表 `otel_logs_v2` 的表结构：

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

在重启 collector 并按照前文所述步骤摄取结构化日志之后，我们就可以对新提取出的 Device、Browser 和 Os 列进行查询了。

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

:::note 用于复杂结构的 Tuple
请注意这些 user agent 列中对 Tuple 的使用。对于层级结构在预先已知的复杂结构，推荐使用 Tuple。子列在提供对异构类型支持的同时，能够保持与常规列相同的性能（不同于 Map 的键）。
:::

### 延伸阅读 {#further-reading}

如需查看更多字典示例和详细信息，我们推荐阅读以下文章：

- [高级字典相关主题](/dictionary#advanced-dictionary-topics)
- [“Using Dictionaries to Accelerate Queries”](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)
- [字典](/sql-reference/dictionaries)

## 加速查询 {#accelerating-queries}

ClickHouse 支持多种用于提升查询性能的技术。只有在为最常见的访问模式选择了合适的主键/排序键并最大化压缩之后，才应考虑以下技术。通常，这一选择会以最小的代价带来最大的性能提升。

### 使用物化视图（增量）进行聚合 {#using-materialized-views-incremental-for-aggregations}

在前面的章节中，我们已经探讨了使用物化视图进行数据转换和过滤。物化视图同样可以在插入数据时预先计算聚合结果并将其存储下来。随后在有新数据插入时，再将新的聚合结果合并更新，从而实现在插入阶段就完成聚合计算。

其核心思想是，这些结果通常是原始数据的压缩表示（在聚合场景下可以视作一种部分概要）。当通过一个更简单的查询从目标表中读取这些结果时，查询时间将比在原始数据上执行相同计算更短。

考虑下面的查询示例，我们使用结构化日志计算每小时的总流量：

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

我们可以想象，这可能是用户在 Grafana 中绘制的一种常见折线图。这个查询确实非常快——数据集只有 1000 万行，而且 ClickHouse 本身就很快！然而，如果我们将规模扩展到数十亿甚至数万亿行，我们理想情况下希望仍然能够维持这样的查询性能。

:::note
如果我们使用 `otel_logs_v2` 表，这个查询会快 10 倍。该表来自我们之前的物化视图，用于从 `LogAttributes` map 中抽取 size 键。这里我们仅为演示说明而使用原始数据，如果这是一个常见查询，我们推荐使用前面定义的视图。
:::

如果我们希望在写入时使用物化视图来完成这个计算，就需要一个表来接收结果。这个表每个小时只应保留 1 行。如果针对某个已存在的小时收到一条更新，其它列应合并到该小时已存在的那一行中。要实现这种增量状态的合并，必须在其它列中存储部分聚合状态。

这在 ClickHouse 中需要一种特殊的引擎类型：SummingMergeTree。它会将所有具有相同排序键的行替换为一行，其中数值列的值是求和后的结果。下面的这个表会合并任何具有相同日期的行，对所有数值列进行求和。

```sql
CREATE TABLE bytes_per_hour
(
  `Hour` DateTime,
  `TotalBytes` UInt64
)
ENGINE = SummingMergeTree
ORDER BY Hour
```

为了演示我们的物化视图，假设 `bytes_per_hour` 表当前为空，尚未接收任何数据。我们的物化视图会对插入到 `otel_logs` 的数据执行上述 `SELECT` 查询（将按配置的块大小执行），并将结果写入 `bytes_per_hour`。语法如下所示：

```sql
CREATE MATERIALIZED VIEW bytes_per_hour_mv TO bytes_per_hour AS
SELECT toStartOfHour(Timestamp) AS Hour,
       sum(toUInt64OrDefault(LogAttributes['size'])) AS TotalBytes
FROM otel_logs
GROUP BY Hour
```

这里的 `TO` 子句是关键，它表示结果将被写入到哪里，即 `bytes_per_hour`。

如果我们重启 OTel collector 并重新发送日志，`bytes_per_hour` 表将会根据上述查询结果被增量填充。完成后，我们可以检查 `bytes_per_hour` 的大小——应该是每小时一行数据：

```sql
SELECT count()
FROM bytes_per_hour
FINAL

┌─count()─┐
│     113 │
└─────────┘

1 row in set. Elapsed: 0.039 sec.
```

通过存储查询结果，我们实际上将这里的行数从 1000 万（`otel_logs` 中）减少到了 113。关键在于，当有新的日志插入到 `otel_logs` 表时，其所属小时的最新数值会写入 `bytes_per_hour`，并在后台自动异步合并——由于我们每小时只保留一行，因此 `bytes_per_hour` 始终既数据量小又保持最新。

由于行合并是异步进行的，当用户查询时，每小时可能会存在多行。为了确保在查询时将所有尚未合并的行合并，我们有两个选项：

* 在表名上使用 [`FINAL` 修饰符](/sql-reference/statements/select/from#final-modifier)（我们在上面的计数查询中就是这样做的）。
* 按最终表中使用的排序键进行聚合，即按 Timestamp 分组并对指标求和。

通常，第二个选项在效率和灵活性方面更好（该表可以用于其他用途），但第一个选项对于某些查询可能更简单。下面我们展示这两种方式：

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

这将我们的查询耗时从 0.6s 缩短到了 0.008s —— 提速超过 75 倍！

:::note
在更大的数据集上执行更复杂的查询时，这种收益会更加显著。示例请参见[这里](https://github.com/ClickHouse/clickpy)。
:::

#### 更复杂的示例 {#a-more-complex-example}

上面的示例使用 [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree) 对每小时的简单计数进行聚合。若要获取超出简单求和的统计信息，则需要使用不同的目标表引擎：[AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree)。

假设我们希望计算每天唯一 IP 地址数（或唯一用户数）。对应的查询如下：

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

为了在增量更新时持久化基数统计，需要使用 AggregatingMergeTree。

```sql
CREATE TABLE unique_visitors_per_hour
(
  `Hour` DateTime,
  `UniqueUsers` AggregateFunction(uniq, IPv4)
)
ENGINE = AggregatingMergeTree
ORDER BY Hour
```

为确保 ClickHouse 明确知道将存储聚合状态，我们将 `UniqueUsers` 列定义为 [`AggregateFunction`](/sql-reference/data-types/aggregatefunction) 类型，并指定部分聚合状态所使用的函数（uniq）以及源列的类型（IPv4）。与 SummingMergeTree 类似，具有相同 `ORDER BY` 键值的行会被合并（如上例中的 Hour）。

对应的物化视图则使用前面的查询：

```sql
CREATE MATERIALIZED VIEW unique_visitors_per_hour_mv TO unique_visitors_per_hour AS
SELECT toStartOfHour(Timestamp) AS Hour,
        uniqState(LogAttributes['remote_addr']::IPv4) AS UniqueUsers
FROM otel_logs
GROUP BY Hour
ORDER BY Hour DESC
```

注意我们在聚合函数末尾追加了后缀 `State`。这可以确保返回的是函数的聚合状态而不是最终结果。该状态将包含额外信息，从而允许该部分状态与其他状态合并。

在通过重启 Collector 重新加载数据后，我们可以确认在 `unique_visitors_per_hour` 表中共有 113 行可用。

```sql
SELECT count()
FROM unique_visitors_per_hour
FINAL
┌─count()─┐
│   113   │
└─────────┘

1 row in set. Elapsed: 0.009 sec.
```

我们的最终查询在调用这些函数时需要使用 `Merge` 后缀（因为这些列存储的是部分聚合状态）：

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

请注意，这里我们使用 `GROUP BY` 而不是 `FINAL`。

### 使用物化视图（增量）实现快速查询 {#using-materialized-views-incremental--for-fast-lookups}

在选择 ClickHouse 排序键时，用户应结合自身的访问模式，将在过滤和聚合子句中经常使用的列包含在排序键中。但在可观测性场景下，这种方式可能会受到限制，因为用户的访问模式更加多样，无法用单一的一组列来概括。默认 OTel schema 中内置的一个示例最能说明这一点。以 traces 的默认 schema 为例：

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

此 schema 针对按 `ServiceName`、`SpanName` 和 `Timestamp` 进行过滤进行了优化。在链路追踪中，用户还需要能够根据特定的 `TraceId` 进行查找，并检索属于该 trace 的 spans。虽然 `TraceId` 也包含在排序键中，但由于它位于末尾，[过滤效率不会那么高](/guides/best-practices/sparse-primary-indexes#ordering-key-columns-efficiently)，在检索单个 trace 时很可能需要扫描大量数据。

OTel collector 还会创建一个物化视图及其关联表来解决这一问题。该表和视图如下所示：

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

该视图可以有效确保表 `otel_traces_trace_id_ts` 记录了每个 trace 的最小和最大时间戳。该表按 `TraceId` 排序，使得这些时间戳可以被高效检索。随后，在查询主表 `otel_traces` 时可以利用这些时间戳范围。更具体地说，当通过 id 检索某个 trace 时，Grafana 会使用以下查询：

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

这里的 CTE 会先确定 trace id `ae9226c78d1d360601e6383928e4d22d` 对应的最小和最大时间戳，然后再使用这些时间戳去过滤主表 `otel_traces`，以获取与其关联的 spans。

同样的方法也可以应用于类似的访问模式。我们在数据建模章节中[这里](/materialized-view/incremental-materialized-view#lookup-table)探讨了一个类似的示例。

### 使用投影 {#using-projections}

ClickHouse 投影允许用户为表指定多个 `ORDER BY` 子句。

在前面的章节中,我们探讨了如何在 ClickHouse 中使用物化视图来预先计算聚合结果、转换数据行,并针对不同的访问模式优化可观测性查询。

我们提供了一个示例，其中物化视图将行发送到目标表，该目标表使用与接收插入数据的原始表不同的排序键，以优化按 trace id 查找的性能。

投影可用于解决同样的问题,允许用户对非主键列的查询进行优化。

理论上,此功能可用于为表提供多个排序键,但存在一个明显的缺点:数据冗余。具体而言,除了按主键顺序写入数据外,还需要按每个投影指定的顺序写入数据。这会降低插入性能并占用更多磁盘空间。

:::note 投影与物化视图
投影提供了许多与物化视图相同的功能,但应谨慎使用,后者通常是更优选择。用户应了解投影的局限性以及适用场景。例如,虽然投影可用于预计算聚合,但我们建议用户使用物化视图来实现此目的。
:::

<Image img={observability_13} alt="可观测性与投影" size="md" />

请参考以下查询,该查询根据 500 错误代码筛选 `otel_logs_v2` 表。这是日志查询中的常见访问模式,用户通常需要按错误代码进行筛选:

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
此处使用 `FORMAT Null` 不打印结果。这会强制读取所有结果但不返回,从而防止查询因 LIMIT 子句而提前终止。这样做是为了展示扫描全部 1000 万行所需的时间。
:::

上述查询需要对我们选择的排序键 `(ServiceName, Timestamp)` 进行线性扫描。虽然可以将 `Status` 添加到排序键末尾来提升该查询的性能,但我们也可以通过添加投影来实现。

```sql
ALTER TABLE otel_logs_v2 (
  ADD PROJECTION status
  (
     SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent ORDER BY Status
  )
)

ALTER TABLE otel_logs_v2 MATERIALIZE PROJECTION status
```

注意,必须先创建投影,然后再将其物化。后一条命令会使数据以两种不同的顺序在磁盘上存储两次。投影也可以在创建表时定义(如下所示),并在插入数据时自动维护。

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

需要注意的是,如果投影是通过 `ALTER` 命令创建的,那么在执行 `MATERIALIZE PROJECTION` 命令时,其创建过程是异步进行的。用户可以通过以下查询来确认该操作的进度,直到 `is_done=1` 为止。

```sql
SELECT parts_to_do, is_done, latest_fail_reason
FROM system.mutations
WHERE (`table` = 'otel_logs_v2') AND (command LIKE '%MATERIALIZE%')

┌─parts_to_do─┬─is_done─┬─latest_fail_reason─┐
│           0 │     1   │                    │
└─────────────┴─────────┴────────────────────┘

1 row in set. Elapsed: 0.008 sec.
```

如果我们重复执行上述查询,可以看到性能显著提升,代价是需要额外的存储空间(有关如何测量的方法,请参见[&quot;测量表大小和压缩率&quot;](#measuring-table-size--compression))。

```sql
SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent
FROM otel_logs_v2
WHERE Status = 500
FORMAT `Null`

0 rows in set. Elapsed: 0.031 sec. Processed 51.42 thousand rows, 22.85 MB (1.65 million rows/s., 734.63 MB/s.)
Peak memory usage: 27.85 MiB.
```

在上面的示例中，我们在投影中指定了先前查询中使用的列。这意味着只有这些指定的列会作为投影的一部分存储在磁盘上，并按照 Status 排序。或者，如果我们在这里使用 `SELECT *`，则所有列都会被包含在投影中并存储。这样虽然可以让更多查询（使用任意列子集）从该投影中获益，但会带来额外的存储开销。有关磁盘空间占用和压缩情况的衡量，请参见 [&quot;Measuring table size &amp; compression&quot;](#measuring-table-size--compression)。

### Secondary/data skipping indices {#secondarydata-skipping-indices}

无论在 ClickHouse 中多么精细地调优主键，某些查询最终仍然仍需要对整张表进行全表扫描。虽然可以通过使用物化视图（以及对某些查询使用 projections）来缓解这一问题，但这需要额外的维护工作，并且要求用户了解这些对象的存在，才能在查询中真正加以利用。传统关系型数据库通常通过二级索引来解决这一问题，但在像 ClickHouse 这样的列式数据库中，这类索引并不高效。取而代之的是，ClickHouse 使用“跳过（Skip）索引”，通过允许数据库跳过包含无匹配值的大块数据，从而显著提升查询性能。

默认的 OTel schema 会尝试使用二级索引来加速对 `map` 字段的访问。我们发现这些索引整体上效果并不理想，因此不建议在自定义 schema 中照搬；不过，跳过索引在某些场景下依然是有用的。

在尝试应用这些索引之前，用户应先阅读并理解[二级索引指南](/optimize/skipping-indexes)。

**一般而言，当主键与目标的非主键列/表达式之间存在较强相关性，并且用户要查找的是稀有值（即在许多 granule 中并不常见的值）时，这些索引才会较为有效。**

### 用于文本搜索的布隆过滤器 {#bloom-filters-for-text-search}

对于可观测性查询,当用户需要执行文本搜索时,辅助索引会非常有用。具体而言,基于 ngram 和 token 的布隆过滤器索引 [`ngrambf_v1`](/optimize/skipping-indexes#bloom-filter-types) 和 [`tokenbf_v1`](/optimize/skipping-indexes#bloom-filter-types) 可用于加速在 String 列上使用 `LIKE`、`IN` 和 hasToken 操作符的搜索。需要注意的是,基于 token 的索引使用非字母数字字符作为分隔符来生成 token。这意味着在查询时只能匹配 token(即完整单词)。如需更细粒度的匹配,可以使用 [N-gram 布隆过滤器](/optimize/skipping-indexes#bloom-filter-types)。该索引将字符串拆分为指定大小的 ngram,从而支持子词匹配。

要评估将生成并进行匹配的 token,可以使用 `tokens` 函数:

```sql
SELECT tokens('https://www.zanbil.ir/m/filter/b113')

┌─tokens────────────────────────────────────────────┐
│ ['https','www','zanbil','ir','m','filter','b113'] │
└───────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.008 sec.
```

`ngram` 函数提供了类似的功能,可通过第二个参数指定 `ngram` 的大小:

```sql
SELECT ngrams('https://www.zanbil.ir/m/filter/b113', 3)

┌─ngrams('https://www.zanbil.ir/m/filter/b113', 3)────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ['htt','ttp','tps','ps:','s:/','://','//w','/ww','www','ww.','w.z','.za','zan','anb','nbi','bil','il.','l.i','.ir','ir/','r/m','/m/','m/f','/fi','fil','ilt','lte','ter','er/','r/b','/b1','b11','113'] │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.008 sec.
```

:::note 倒排索引
ClickHouse 还提供了倒排索引作为辅助索引的实验性支持。我们目前不建议将其用于日志数据集,但预计在其达到生产就绪状态后,将取代基于 token 的布隆过滤器。
:::

本示例使用结构化日志数据集。假设需要统计 `Referer` 列中包含 `ultra` 的日志条数。

```sql
SELECT count()
FROM otel_logs_v2
WHERE Referer LIKE '%ultra%'

┌─count()─┐
│  114514 │
└─────────┘

1 row in set. Elapsed: 0.177 sec. Processed 10.37 million rows, 908.49 MB (58.57 million rows/s., 5.13 GB/s.)
```

此处需要匹配 ngram 大小为 3，因此创建一个 `ngrambf_v1` 索引。

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

此处的索引 `ngrambf_v1(3, 10000, 3, 7)` 接受四个参数。最后一个参数（值为 7）表示种子值。其他参数分别表示 ngram 大小（3）、值 `m`（过滤器大小）以及哈希函数数量 `k`（7）。`k` 和 `m` 需要调优，其取值基于唯一 ngram/token 的数量以及过滤器产生真阴性结果的概率——从而确认某个值不存在于 granule 中。我们建议使用[这些函数](/engines/table-engines/mergetree-family/mergetree#bloom-filter)来帮助确定这些值。

如果调优得当，这里的加速效果可能会非常可观：

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
以上内容仅作示例说明。我们建议用户在插入日志时就提取其结构，而不是尝试通过基于 token 的 Bloom 过滤器来优化文本搜索。不过，在某些情况下，用户会有堆栈跟踪或其他体积较大的字符串，这类数据由于结构不够固定，使用文本搜索仍然可能是有用的。
:::

关于使用 Bloom 过滤器的一些通用指南：

Bloom 过滤器的目标是过滤[粒度](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design)，从而避免为某一列加载全部值并执行线性扫描。`EXPLAIN` 子句配合参数 `indexes=1` 可用于确认被跳过的粒度数量。请参考下方针对原始表 `otel_logs_v2` 和带有 ngram Bloom 过滤器的表 `otel_logs_bloom` 的返回结果。

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

通常只有当布隆过滤器本身比该列更小时，它才会更快。如果它更大，那么性能收益很可能可以忽略不计。使用以下查询将过滤器的大小与该列进行比较：

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

在上面的示例中，我们可以看到二级 Bloom filter 索引的大小为 12MB——几乎只有该列本身压缩后 56MB 的五分之一。

Bloom filter 可能需要进行较为细致的调优。我们建议参考[此处](/engines/table-engines/mergetree-family/mergetree#bloom-filter)的说明，以帮助确定最优配置。Bloom filter 在插入和合并阶段的开销也可能较大。用户应在将 Bloom filter 引入生产环境之前，先评估其对插入性能的影响。

关于二级跳过索引的更多细节可以在[此处](/optimize/skipping-indexes#skip-index-functions)找到。

### 从 Map 中提取数据 {#extracting-from-maps}

`Map` 类型在 OTel schema 中非常常见。该类型要求键和值使用相同的数据类型，这对于存储 Kubernetes label 等元数据已经足够。请注意，当查询 `Map` 类型的某个子键时，会加载整个父列。如果该 map 拥有大量键，那么相比将该键单独建成一列，这会导致需要从磁盘读取更多数据，从而带来显著的查询开销。

如果你经常查询某个特定键，建议将其移动到根级别的专用列中。这通常是在完成部署并观察到常见访问模式之后才会进行的工作，在生产环境之前往往难以准确预估。有关如何在部署后修改 schema，请参见[“管理 schema 变更”](/observability/managing-data#managing-schema-changes)。

## Measuring table size & compression {#measuring-table-size--compression}

ClickHouse 被用于可观测性的主要原因之一是其出色的压缩能力。

除了显著降低存储成本之外，磁盘上的数据更少也意味着更少的 I/O，以及更快的查询和写入。与 CPU 开销相比，I/O 的减少将远远抵消任何压缩算法带来的额外开销。因此，在优化 ClickHouse 查询性能时，提高数据压缩率应当是首要关注点。

有关如何评估压缩效果的详细信息，请参阅[此处](/data-compression/compression-in-clickhouse)。