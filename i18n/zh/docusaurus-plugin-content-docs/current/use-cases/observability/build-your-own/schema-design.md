---
title: 'Schema 设计'
description: '面向可观测性的 Schema 设计'
keywords: ['可观测性', '日志', '链路追踪', '指标', 'OpenTelemetry', 'Grafana', 'OTel']
slug: /use-cases/observability/schema-design
show_related_blogs: true
doc_type: 'guide'
---

import observability_10 from '@site/static/images/use-cases/observability/observability-10.png';
import observability_11 from '@site/static/images/use-cases/observability/observability-11.png';
import observability_12 from '@site/static/images/use-cases/observability/observability-12.png';
import observability_13 from '@site/static/images/use-cases/observability/observability-13.png';
import Image from '@theme/IdealImage';


# 为可观测性设计 Schema

我们建议用户始终为日志和链路追踪自建 schema，原因如下：

- **选择主键** - 默认的 schema 使用针对特定访问模式优化的 `ORDER BY`，你的访问模式很可能与其不一致。
- **抽取结构化信息** - 用户可能希望从现有列中抽取新的列，例如 `Body` 列。可以通过物化列（以及在更复杂场景中使用物化视图）来实现。这需要修改 schema。
- **优化 Map** - 默认的 schema 使用 Map 类型来存储属性。这些列允许存储任意元数据。这是一项关键能力，因为事件中的元数据通常不会预先定义，否则在像 ClickHouse 这样强类型的数据库中将无法存储。然而，相比普通列，访问 Map 的键及其值的效率要低一些。我们通过修改 schema，并确保最常访问的 Map 键被提升为顶层列来解决这一问题——参见「[使用 SQL 抽取结构](#extracting-structure-with-sql)」。这需要进行 schema 变更。
- **简化 Map 键访问** - 访问 Map 中的键需要较为冗长的语法。用户可以通过别名来缓解这一问题。参见「[使用别名](#using-aliases)」以简化查询。
- **二级索引** - 默认 schema 使用二级索引来加速对 Map 的访问以及文本查询。这些通常不是必需的，并会占用额外磁盘空间。可以使用，但应先测试以确认确有必要。参见「[二级 / Data Skipping 索引](#secondarydata-skipping-indices)」。
- **使用 Codec** - 如果用户了解预期数据，并有证据表明可以提升压缩效果，可能希望为列自定义 codec。

_我们将在下文详细介绍上述每一种用例。_

**重要提示：** 虽然鼓励用户扩展和修改其 schema 以获得最佳压缩率和查询性能，但在可能的情况下，应遵循 OTel 对核心列的命名约定。ClickHouse 的 Grafana 插件假定某些基础的 OTel 列存在，以辅助构建查询，例如 `Timestamp` 和 `SeverityText`。日志和链路追踪所需的列分别记录在这里 [[1]](https://grafana.com/developers/plugin-tools/tutorials/build-a-logs-data-source-plugin#logs-data-frame-format)[[2]](https://grafana.com/docs/grafana/latest/explore/logs-integration/) 和[这里](https://grafana.com/docs/grafana/latest/explore/trace-integration/#data-frame-structure)。你也可以选择更改这些列名，并在插件配置中覆盖其默认值。



## 使用 SQL 提取结构

无论摄取的是结构化还是非结构化日志，用户通常都需要能够：

* **从字符串 blob 中提取列**。查询这些列比在查询时直接对原始字符串执行操作要更快。
* **从 Map 中提取键**。默认 schema 会将任意属性放入 Map 类型的列中。该类型提供了无 schema 的能力，其优点是用户在定义日志和跟踪数据时不需要预先为属性定义列——在从 Kubernetes 收集日志并希望保留 pod（容器组）标签以便后续搜索的场景下，这往往难以预先穷举所有属性。从 Map 中访问键及其值比在普通 ClickHouse 列上查询要慢。因此，将 Map 中的键提取到根表的列中往往是更理想的做法。

请看下面的查询示例：

假设我们希望使用结构化日志统计哪些 URL 路径接收到最多的 POST 请求。JSON blob 作为 String 存储在 `Body` 列中。此外，如果用户在采集器中启用了 `json_parser`，它也可能以 `Map(String, String)` 的形式存储在 `LogAttributes` 列中。

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

假设 `LogAttributes` 可用，用于统计站点上哪些 URL 路径收到最多 POST 请求的查询如下：

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

返回 5 行。用时:0.735 秒。已处理 1036 万行,4.65 GB(1410 万行/秒,6.32 GB/秒)。
内存峰值:153.71 MiB。
```

请注意这里使用了 map 语法，例如 `LogAttributes['request_path']`，以及用于从 URL 中去除查询参数的 [`path` 函数](/sql-reference/functions/url-functions#path)。

如果用户没有在收集器中启用 JSON 解析，那么 `LogAttributes` 将为空，此时我们就需要使用 [JSON 函数](/sql-reference/functions/json-functions) 从 String 类型的 `Body` 中提取列。

:::note Prefer ClickHouse for parsing
我们通常建议用户在 ClickHouse 中对结构化日志执行 JSON 解析。我们确信 ClickHouse 拥有最快的 JSON 解析实现。不过，我们也认识到，用户可能希望将日志发送到其他目标，并且不希望在 SQL 中实现这部分逻辑。
:::

```sql
SELECT path(JSONExtractString(Body, 'request_path')) AS path, count() AS c
FROM otel_logs
WHERE JSONExtractString(Body, 'request_type') = 'POST'
GROUP BY path
ORDER BY c DESC
LIMIT 5
```


┌─路径─────────────────────┬─────c─┐
│ /m/updateVariation       │ 12182 │
│ /site/productCard        │ 11080 │
│ /site/productPrice       │ 10876 │
│ /site/productAdditives   │ 10866 │
│ /site/productModelImages │ 10866 │
└──────────────────────────┴───────┘

结果集包含 5 行。耗时：0.668 秒。已处理 10.37 百万行，5.13 GB（15.52 百万行/秒，7.68 GB/秒）。
峰值内存使用量：172.30 MiB。

````

现在考虑非结构化日志的相同操作:

```sql
SELECT Body, LogAttributes
FROM otel_logs
LIMIT 1
FORMAT Vertical

Row 1:
──────
Body:           151.233.185.144 - - [22/Jan/2019:19:08:54 +0330] "GET /image/105/brand HTTP/1.1" 200 2653 "https://www.zanbil.ir/filter/b43,p56" "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36" "-"
LogAttributes: {'log.file.name':'access-unstructured.log'}
````

对于非结构化日志的类似查询，需要使用 `extractAllGroupsVertical` 函数配合正则表达式来完成。

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

返回 5 行。用时:1.953 秒。已处理 1037 万行,3.59 GB(531 万行/秒,1.84 GB/秒)。
```

对非结构化日志进行解析所需查询的复杂度和成本更高（性能差异也很明显），这就是我们建议用户在可能的情况下始终使用结构化日志的原因。

:::note 考虑使用字典
以上查询可以通过利用正则表达式字典进行优化。参见 [Using Dictionaries](#using-dictionaries) 了解更多细节。
:::

这两种场景都可以通过在 ClickHouse 中将上述查询逻辑前移到插入阶段来满足。我们在下面探讨几种方法，并强调各自适用的场景。

:::note 使用 OTel 还是 ClickHouse 进行处理？
用户也可以使用 OTel collector 的 processor 和 operator 组件来执行处理，如[此处](/observability/integrating-opentelemetry#processing---filtering-transforming-and-enriching)所述。在大多数情况下，用户会发现 ClickHouse 在资源效率和速度方面都明显优于 collector 的 processors。使用 SQL 执行所有事件处理的主要缺点，是会将你的解决方案与 ClickHouse 紧密耦合。例如，用户可能希望从 OTel collector 将处理后的日志发送到其他目的地，例如 S3。
:::

### 物化列（Materialized columns）

物化列提供了从其他列中提取结构的最简单方案。这类列的值始终在插入时计算，且不能在 INSERT 查询中显式指定。

:::note 开销
物化列会带来额外的存储开销，因为在插入时，这些值会被提取到磁盘上的新列中。
:::

物化列支持任意 ClickHouse 表达式，并且可以利用任意用于[处理字符串](/sql-reference/functions/string-functions)（包括[正则和搜索](/sql-reference/functions/string-search-functions)）和 [URL](/sql-reference/functions/url-functions) 的分析函数，执行[类型转换](/sql-reference/functions/type-conversion-functions)、[从 JSON 中提取值](/sql-reference/functions/json-functions)或[数学运算](/sql-reference/functions/math-functions)。

我们推荐使用物化列来完成基础处理。它们对于从映射（map）中提取值、将其提升为顶层列以及执行类型转换特别有用。在非常简单的 schema 中，或者与物化视图结合使用时，它们通常最为有用。考虑以下用于日志的 schema，其中 JSON 已由 collector 提取到 `LogAttributes` 列中：


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

可以在[此处](https://pastila.nl/?005cbb97/513b174a7d6114bf17ecc657428cf829#gqoOOiomEjIiG6zlWhE+Sg==)找到在使用 JSON 函数从 String 类型的 `Body` 中抽取数据时所对应的等价 schema。

我们的三个物化列会抽取请求页面、请求类型以及引用方（referrer）的域名。它们访问 map 的键并对其对应的值应用函数。之后的查询会快得多：

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
默认情况下，`SELECT *` 不会返回物化列（materialized columns）。这样做是为了保证：`SELECT *` 的结果始终可以通过 INSERT 再次插入到表中。可以通过设置 `asterisk_include_materialized_columns=1` 来关闭这一行为，并且可以在 Grafana 中启用该设置（参见数据源配置中的 `Additional Settings -> Custom Settings`）。
:::


## 物化视图

[物化视图](/materialized-views) 提供了一种更强大的方式，可以对日志和追踪应用 SQL 过滤和转换。

物化视图允许用户将计算成本从查询时转移到写入时。一个 ClickHouse 物化视图本质上就是一个触发器，在数据块插入到表中时对其运行一条查询语句。这条查询的结果会被插入到第二张“目标”表中。

<Image img={observability_10} alt="物化视图" size="md" />

:::note 实时更新
ClickHouse 中的物化视图会在数据流入其所依赖的表时实时更新，其行为更类似于持续更新的索引。相比之下，在其他数据库中，物化视图通常是查询的静态快照，需要显式刷新（类似于 ClickHouse Refreshable Materialized Views）。
:::

与物化视图关联的查询在理论上可以是任意查询，包括聚合查询，尽管[在 JOIN 上存在一些限制](https://clickhouse.com/blog/using-materialized-views-in-clickhouse#materialized-views-and-joins)。对于日志和追踪所需的转换与过滤类工作负载，用户可以认为任何 `SELECT` 语句都是可行的。

用户应牢记，该查询只是一个触发器，它仅在插入到表中的行（源表）上执行，并将结果发送到一个新表（目标表）。

为了确保我们不会在源表和目标表中各持久化一份数据，我们可以将源表的表引擎更改为 [Null table engine](/engines/table-engines/special/null)，同时保留原有的表结构。我们的 OTel collectors 将继续向这张表发送数据。例如，对于日志，`otel_logs` 表会变成：

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

Null 表引擎是一种强大的优化手段 —— 可以把它看作 `/dev/null`。这个表本身不会存储任何数据，但附加到其上的任何物化视图仍会在行被丢弃之前对插入的行执行。

看下面的查询示例。它会将我们的行转换为希望保留的格式：从 `LogAttributes` 中提取所有列（我们假设这是由采集器使用 `json_parser` 运算符设置的），并设置 `SeverityText` 和 `SeverityNumber`（基于一些简单条件以及[这些列](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-severitytext)的定义）。在这个例子中，我们还只选择我们确定会被填充的列 —— 忽略诸如 `TraceId`、`SpanId` 和 `TraceFlags` 之类的列。


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

我们还在上面提取了 `Body` 列——以便将来如果添加了未被我们 SQL 提取的额外属性，仍然可以保留它们。此列在 ClickHouse 中应具有良好的压缩率，且访问频率很低，因此不会影响查询性能。最后，我们通过一次类型转换将 Timestamp 转换为 DateTime（以节省空间——参见 [&quot;Optimizing Types&quot;](#optimizing-types)）。

:::note 条件表达式
请注意上文中使用了 [conditionals](/sql-reference/functions/conditional-functions) 来提取 `SeverityText` 和 `SeverityNumber`。这些函数在构造复杂条件以及检查 map 中的值是否已设置时非常有用——我们在这里简单地假设 `LogAttributes` 中存在所有键。我们建议用户熟悉这些函数——在用于处理 [null values](/sql-reference/functions/functions-for-nulls) 的函数之外，它们同样是进行日志解析时的有力工具！
:::

我们需要一张表来接收这些结果。下面的目标表与上面的查询相匹配：

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

此处选择的类型基于在 [&quot;Optimizing types&quot;](#optimizing-types) 中讨论的优化内容。

:::note
注意我们已经大幅更改了模式。实际场景中，用户很可能还有需要保留的 Trace 列，以及 `ResourceAttributes` 列（通常包含 Kubernetes 元数据）。Grafana 可以利用这些 Trace 列在日志与 Trace 之间提供关联功能——参见 [&quot;Using Grafana&quot;](/observability/grafana)。
:::


下面，我们创建一个物化视图 `otel_logs_mv`，它会对 `otel_logs` 表执行上述 select 查询，并将结果写入 `otel_logs_v2`。

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

上述内容可以通过下图进行可视化展示：

<Image img={observability_11} alt="Otel MV 可视化" size="md" />

如果我们现在重新启动在[“导出到 ClickHouse”](/observability/integrating-opentelemetry#exporting-to-clickhouse)中使用的 collector 配置，数据就会以期望的格式出现在 `otel_logs_v2` 表中。请注意这里使用了带类型的 JSON 提取函数。

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

下面展示了一个等价的物化视图示例，该视图通过 JSON 函数从 `Body` 列中提取各个字段：


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

### 注意类型

上述物化视图依赖隐式类型转换——尤其是在使用 `LogAttributes` 映射时。ClickHouse 通常会透明地将提取到的值转换为目标表的类型，从而减少所需的语法。不过，我们建议用户始终通过将视图的 `SELECT` 语句与一个使用相同 schema 的目标表上的 [`INSERT INTO`](/sql-reference/statements/insert-into) 语句配合使用来测试视图。这样可以确认类型是否被正确处理。对于以下情况应给予特别关注：

* 如果某个键在 map 中不存在，则会返回空字符串。对于数值类型，用户需要将这些情况映射为合适的数值。这可以通过[条件函数](/sql-reference/functions/conditional-functions)实现，例如：`if(LogAttributes['status'] = ", 200, LogAttributes['status'])`；或者在可以接受默认值的情况下使用[类型转换函数](/sql-reference/functions/type-conversion-functions)，例如：`toUInt8OrDefault(LogAttributes['status'] )`。
* 某些类型不会总是被自动转换，例如：数值的字符串表示不会被转换为 enum 值。
* 当未找到值时，JSON 提取函数会返回其类型的默认值。请确保这些默认值在你的场景中是合理的！

:::note 避免使用 Nullable
避免在 ClickHouse 的可观测性数据中使用 [Nullable](/sql-reference/data-types/nullable)。在日志和追踪数据中，很少需要区分空字符串与 null。该特性会带来额外的存储开销，并对查询性能产生负面影响。更多详情请参阅[此处](/data-modeling/schema-design#optimizing-types)。
:::


## 选择主键（排序键）{#choosing-a-primary-ordering-key}

在提取出所需的列之后，就可以开始优化排序键/主键。

可以遵循一些简单的规则来帮助选择排序键。下面这些规则有时会彼此冲突，因此请按列出的顺序依次考虑和权衡。用户通常可以通过这一过程选出若干个键，一般 4–5 个就已足够：

1. 选择与你的常用过滤条件和访问模式相匹配的列。如果用户在开始可观测性排查时通常会按某个特定列过滤，例如按 pod（容器组）名称过滤，那么这列会经常出现在 `WHERE` 子句中。应优先将这些列包含在键中，而不是那些很少用于过滤的列。
2. 优先选择在过滤时可以排除总行数中很大比例的列，从而减少需要读取的数据量。服务名称和状态码通常是不错的候选——但对于状态码，仅当用户按能排除大多数行的值进行过滤时才适用。例如，在大多数系统中按 200 这一类状态码过滤会匹配到大部分行，而 500 错误通常只对应一个很小的子集。
3. 优先选择很可能与表中其他列高度关联的列。这有助于确保这些值在存储上也尽量连续，从而提升压缩率。
4. 对排序键中的列执行 `GROUP BY` 和 `ORDER BY` 操作时，可以做到更高的内存效率。

<br />

在确定了用于排序键的列子集后，必须按特定顺序声明它们。这个顺序会显著影响查询中对排序键后续列进行过滤时的效率，以及表数据文件的压缩比。一般来说，**最好按基数从小到大的顺序来排列键**。同时需要权衡的一点是：对出现在排序键后部的列进行过滤，其效率会低于对出现在前部的列进行过滤。请在这些行为之间取得平衡，并结合你的访问模式来选择。更重要的是，要实际测试不同的变体。若要进一步理解排序键以及如何优化它们，我们推荐阅读[这篇文章](/guides/best-practices/sparse-primary-indexes)。

:::note Structure first
我们建议在对日志完成结构化之后再确定排序键。不要使用属性映射中的键或 JSON 提取表达式作为排序键。请确保你的排序键对应的列在表中是根级列。
:::



## 使用 map

前面的示例展示了如何使用 map 语法 `map['key']` 来访问 `Map(String, String)` 列中的值。除了用 map 语法访问嵌套键之外，还可以使用 ClickHouse 提供的专用 [map 函数](/sql-reference/functions/tuple-map-functions#mapkeys)对这些列进行过滤或选取。

例如，下面的查询先使用 [`mapKeys` 函数](/sql-reference/functions/tuple-map-functions#mapkeys)，再结合 [`groupArrayDistinctArray` 函数](/sql-reference/aggregate-functions/combinators)（一个组合器），找出 `LogAttributes` 列中所有可用的唯一键。

```sql
SELECT groupArrayDistinctArray(mapKeys(LogAttributes))
FROM otel_logs
FORMAT Vertical

第 1 行:
──────
groupArrayDistinctArray(mapKeys(LogAttributes)): ['remote_user','run_time','request_type','log.file.name','referer','request_path','status','user_agent','remote_addr','time_local','size','request_protocol']

返回 1 行。耗时:1.139 秒。已处理 563 万行,2.53 GB(494 万行/秒,2.22 GB/秒)。
峰值内存使用量:71.90 MiB。
```

:::note 避免使用点号
我们不建议在 Map 列名称中使用点号，并且可能会在将来废弃这种用法。请使用 `_`。
:::


## 使用别名

对 Map 类型的查询比对普通列的查询更慢——参见[“加速查询”](#accelerating-queries)。此外，它在语法上更复杂，用户书写起来也更麻烦。为了解决这一问题，我们推荐使用别名列（ALIAS 列）。

ALIAS 列在查询时计算，不会存储在表中。因此，无法向这种类型的列执行 INSERT 操作。通过使用别名，我们可以引用 Map 的键并简化语法，将 Map 条目以普通列的形式透明地暴露出来。请看以下示例：

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

我们已经有了几个物化列以及一个 `ALIAS` 列 `RemoteAddr`，用于访问映射 `LogAttributes`。现在我们可以通过该列查询 `LogAttributes['remote_addr']` 的值，从而简化查询语句，例如：

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

返回 5 行。用时：0.011 秒。
```

此外，通过 `ALTER TABLE` 命令添加 `ALIAS` 列非常简单。这些列会立即可用，例如：

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

返回 5 行。用时：0.014 秒。
```

:::note 默认不包含别名列
默认情况下，`SELECT *` 不会包含 ALIAS 列。可以通过将 `asterisk_include_alias_columns` 设置为 1 来禁用此行为。
:::


## 优化类型 {#optimizing-types}

关于类型优化的 [ClickHouse 通用最佳实践](/data-modeling/schema-design#optimizing-types)同样适用于本节所述的 ClickHouse 使用场景。



## 使用编解码器 {#using-codecs}

除了类型优化之外，用户在尝试为 ClickHouse Observability 架构优化压缩时，还可以遵循[编解码器的一般最佳实践](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec)。

通常情况下，用户会发现 `ZSTD` 编解码器非常适用于日志和跟踪数据集。将压缩级别从默认值 1 提高，可能会提升压缩率。不过，这需要进行测试，因为更高的压缩级别会在写入时带来更高的 CPU 开销。通常，我们观察到将该值调高带来的收益有限。

此外，时间戳虽然在压缩方面可以通过差分编码获益，但如果该列被用作主键或排序键，已被证明会导致查询性能变慢。我们建议用户评估压缩与查询性能之间的权衡关系。



## 使用字典

[字典](/sql-reference/dictionaries) 是 ClickHouse 的[关键特性](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)，可以将来自各种内部和外部[数据源](/sql-reference/dictionaries#dictionary-sources)的数据表示为内存中的 [key-value](https://en.wikipedia.org/wiki/Key%E2%80%93value_database) 形式，并针对超低延迟的查找查询进行了优化。

<Image img={observability_12} alt="可观测性与字典" size="md" />

这在多种场景中都非常有用，例如在不减慢摄取过程的情况下对摄取中的数据进行实时丰富，以及总体上提升查询性能（尤其对 JOIN 有明显益处）。
虽然在可观测性场景中很少需要 JOIN，但字典在丰富方面依然非常有用——无论是在插入时还是查询时。我们在下面分别给出示例。

:::note 加速 JOIN
对利用字典加速 JOIN 感兴趣的用户可在[此处](/dictionary)找到更多详情。
:::

### 插入时 vs 查询时

字典可以用于在查询时或插入时对数据集进行丰富。每种方式都有各自的优缺点。总结如下：

* **插入时** - 如果丰富用的值不会发生变化，并且存在可用于填充字典的外部数据源，那么这通常是合适的选择。在这种情况下，在插入时对行进行丰富可以避免在查询时对字典进行查找。但这会以插入性能以及额外存储开销为代价，因为丰富后的值会作为列进行存储。
* **查询时** - 如果字典中的值经常变化，则通常更适合在查询时进行查找。这样可以避免在映射值变化时更新列（并重写数据）。这种灵活性以查询时查找开销为代价。如果需要对许多行进行查找（例如在过滤条件中使用字典查找），该查询时开销通常是显著的。对于结果丰富，即在 `SELECT` 中使用时，该开销通常可以忽略不计。

我们建议用户先熟悉字典的基础知识。字典提供了一个内存中的查找表，可以使用专用的[函数](/sql-reference/functions/ext-dict-functions#dictgetall)来获取其中的值。

关于简单丰富的示例，请参见[字典指南](/dictionary)。在下文中，我们将重点介绍常见的可观测性丰富任务。

### 使用 IP 字典

使用 IP 地址对日志和追踪进行地理信息丰富（添加经纬度值）是常见的可观测性需求。我们可以使用 `ip_trie` 结构化字典来实现这一点。

我们使用公开可用的 [DB-IP 城市级数据集](https://github.com/sapics/ip-location-db#db-ip-database-update-monthly)，该数据集由 [DB-IP.com](https://db-ip.com/) 提供，并遵循 [CC BY 4.0 许可协议](https://creativecommons.org/licenses/by/4.0/)。

从[自述文件](https://github.com/sapics/ip-location-db#csv-format)中，我们可以看到数据的结构如下所示：

```csv
| ip_range_start | ip_range_end | country_code | state1 | state2 | city | postcode | latitude | longitude | timezone |
```

在了解了这一结构之后，我们先使用 [url()](/sql-reference/table-functions/url) 表函数来快速查看一下这些数据：

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

为了简化操作，我们使用 [`URL()`](/engines/table-engines/special/url) 表引擎创建一张包含相应字段名的 ClickHouse 表，并确认总行数：


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
│ 3261621 │ -- 326 万
└─────────┘
```

由于我们的 `ip_trie` 字典要求使用 CIDR 表示法来表达 IP 地址范围，我们需要将 `ip_range_start` 和 `ip_range_end` 进行转换。

可以通过下面的查询为每个范围计算出相应的 CIDR：

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

4 行数据。耗时: 0.259 秒。
```

:::note
上面的查询中包含了很多内容。感兴趣的读者可以查看这篇优秀的[说明](https://clickhouse.com/blog/geolocating-ips-in-clickhouse-and-grafana#using-bit-functions-to-convert-ip-ranges-to-cidr-notation)。否则，你可以直接认为上述查询会为一个 IP 范围计算出 CIDR。
:::

在我们的场景中，我们只需要 IP 范围、国家代码和坐标，所以让我们创建一个新表并插入 Geo IP 数据：

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

为了在 ClickHouse 中进行低延迟的 IP 查询，我们将利用字典在内存中存储键 -&gt; 属性映射，以保存 GeoIP 数据。ClickHouse 提供了一个 `ip_trie` [字典结构](/sql-reference/dictionaries#ip_trie)，用于将网络前缀（CIDR 块）映射到坐标和国家代码。下面的查询按照该布局，并以上述表为源定义了一个字典。

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

我们可以从该字典中选取行，并确认此数据集可用于查找：

```sql
SELECT * FROM ip_trie LIMIT 3
```


┌─cidr───────┬─latitude─┬─longitude─┬─country&#95;code─┐
│ 1.0.0.0/22 │  26.0998 │   119.297 │ CN           │
│ 1.0.0.0/24 │ -27.4767 │   153.017 │ AU           │
│ 1.0.4.0/22 │ -38.0267 │   145.301 │ AU           │
└────────────┴──────────┴───────────┴──────────────┘

3 行结果。耗时：4.662 秒。

````

:::note 定期刷新
ClickHouse 中的字典会根据底层表数据和上述使用的 lifetime 子句定期刷新。要更新我们的 Geo IP 字典以反映 DB-IP 数据集中的最新变化,只需将 geoip_url 远程表中的数据重新插入到 `geoip` 表并应用转换即可。
:::

现在我们已将 Geo IP 数据加载到 `ip_trie` 字典中(该字典也命名为 `ip_trie`),即可使用它进行 IP 地理位置定位。可通过 [`dictGet()` 函数](/sql-reference/functions/ext-dict-functions)实现,如下所示:

```sql
SELECT dictGet('ip_trie', ('country_code', 'latitude', 'longitude'), CAST('85.242.48.167', 'IPv4')) AS ip_details

┌─ip_details──────────────┐
│ ('PT',38.7944,-9.34284) │
└─────────────────────────┘

1 row in set. Elapsed: 0.003 sec.
````

注意这里的查询速度。这使我们能够对日志进行富化。在本例中，我们选择**在查询时进行富化**。

回到我们最初的日志数据集，我们可以利用上述方式按国家对日志进行聚合。下面的示例假设我们使用的是先前物化视图生成的 schema，其中包含一个已提取的 `RemoteAddress` 列。

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

返回 5 行。耗时:0.140 秒。处理了 2073 万行,82.92 MB(每秒 1.4779 亿行,591.16 MB/秒)。
峰值内存使用量:1.16 MiB。
```

由于 IP 到地理位置的映射可能会发生变化，用户通常希望知道请求在发出时是从哪里发起的，而不是该地址当前对应的地理位置。基于这一点，这里更适合在索引时进行富化处理。可以使用如下所示的物化列来实现，或者在物化视图的 SELECT 子句中实现：

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
用户通常希望基于新数据定期更新 IP 丰富信息字典。这可以通过在字典中使用 `LIFETIME` 子句实现，该子句会使字典定期从其底层表重新加载。要更新底层表，请参阅 [&quot;可刷新物化视图&quot;](/materialized-view/refreshable-materialized-view)。
:::

上述国家及其坐标除了按国家分组和过滤之外，还支持更丰富的可视化能力。可参考 [&quot;地理数据可视化&quot;](/observability/grafana#visualizing-geo-data) 获取灵感。

### 使用正则表达式字典（User-Agent 解析）

[User-Agent 字符串](https://en.wikipedia.org/wiki/User_agent) 的解析是一个经典的正则表达式问题，也是基于日志和 Trace 的数据集中的常见需求。ClickHouse 提供了通过正则表达式树字典高效解析 User-Agent 的能力。

在 ClickHouse 开源版中，正则表达式树字典通过 YAMLRegExpTree 字典源类型来定义，该类型会指定包含正则表达式树的 YAML 文件路径。如果你希望提供自己的正则表达式字典，所需结构的详细信息可以在[此处](/sql-reference/dictionaries#use-regular-expression-tree-dictionary-in-clickhouse-open-source)找到。下面我们重点介绍使用 [uap-core](https://github.com/ua-parser/uap-core) 进行 User-Agent 解析，并以受支持的 CSV 格式加载我们的字典。此方法兼容 ClickHouse 开源版（OSS）和 ClickHouse Cloud。

:::note
在下面的示例中，我们使用 2024 年 6 月的最新 uap-core User-Agent 解析正则表达式快照。最新文件（会不定期更新）可以在[此处](https://raw.githubusercontent.com/ua-parser/uap-core/master/regexes.yaml)找到。用户可以按照[这里](/sql-reference/dictionaries#collecting-attribute-values)的步骤，将数据加载到下文所用的 CSV 文件中。
:::

创建以下 Memory 表。这些表保存用于解析设备、浏览器和操作系统的正则表达式。

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

可以使用 `url` 表函数，从以下公开托管的 CSV 文件中向这些表导入数据：

```sql
INSERT INTO regexp_os SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_os.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')

INSERT INTO regexp_device SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_device.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')

INSERT INTO regexp_browser SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_browser.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')
```

在内存表填充完毕后，我们就可以加载正则表达式字典。请注意，我们需要将键指定为列，这些列就是我们可以从 user agent 中提取的属性。

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


加载完这些字典后，我们可以提供一个示例 User-Agent，并测试新的字典提取能力：

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

鉴于围绕 User-Agent 的规则很少会发生变化，而字典只需要在出现新的浏览器、操作系统和设备时才更新，因此在插入时执行这种提取是合理的选择。

我们可以通过使用物化列或物化视图来完成这项工作。下面我们会修改之前使用过的物化视图：

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

为此，我们需要修改目标表 `otel_logs_v2` 的 schema：

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

在重启 collector 并按照前文步骤摄取结构化日志之后，我们可以查询新提取的 Device、Browser 和 OS 列。


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

:::note 用于复杂结构的 Tuples
请注意这些 user agent 列中对 Tuples 的使用。对于层级结构在预先已知的复杂结构，推荐使用 Tuples。子列在提供异构类型支持的同时，性能与常规列相同（不同于 Map 的键）。
:::

### 延伸阅读

要了解更多关于字典的示例和细节，推荐阅读以下文章：

* [字典进阶主题](/dictionary#advanced-dictionary-topics)
* [“Using Dictionaries to Accelerate Queries”](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)
* [字典](/sql-reference/dictionaries)


## 加速查询

ClickHouse 支持多种技术来提升查询性能。只有在为最常见的访问模式选择了合适的主键/排序键并最大化压缩之后，才应考虑以下方法。通常这一步能以最小代价带来最大的性能提升。

### 使用物化视图（增量）进行聚合

在前面的章节中，我们已经探讨了使用物化视图进行数据转换和过滤。然而，物化视图还可以在插入时预计算聚合并存储结果。该结果可以在后续插入时用新的聚合结果进行更新，从而实现在插入阶段预先完成聚合计算。

其核心思想是：这些结果通常是原始数据的更小表示形式（在聚合场景下是部分汇总或近似轮廓）。当它与一个更简单的查询结合，用于从目标表中读取这些结果时，查询时间将会比在原始数据上执行相同计算要更快。

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

我们可以想象，这可能是用户在 Grafana 中绘制的一个常见折线图。这个查询的确非常快——数据集只有 1000 万行，而且 ClickHouse 本身就很快！不过，如果我们把规模扩展到数十亿甚至数万亿行，理想情况下我们仍然希望维持这样的查询性能。

:::note
如果我们使用 `otel_logs_v2` 表，这个查询会快 10 倍。该表来自我们之前的物化视图，该视图从 `LogAttributes` 映射中提取了 size 键。此处我们仅为演示目的使用原始数据，如果这是一个常见查询，建议使用前面创建的视图。
:::

如果我们希望在写入（insert）时就通过物化视图完成此计算，就需要先创建一张表来接收计算结果。该表每个小时只应保留 1 行数据。如果针对已存在的某一小时收到了更新，则其他列应合并到该小时已有的那一行中。要实现这种增量状态的合并，其他列必须以部分（partial）状态进行存储。

这在 ClickHouse 中需要使用一种特殊的引擎类型：SummingMergeTree。它会将所有具有相同排序键的多行替换为一行，其中数值列为求和后的结果。下面的表会合并所有具有相同日期的行，对所有数值列进行求和。

```sql
CREATE TABLE bytes_per_hour
(
  `Hour` DateTime,
  `TotalBytes` UInt64
)
ENGINE = SummingMergeTree
ORDER BY Hour
```

为了演示我们的物化视图，假设 `bytes_per_hour` 表当前为空，尚未接收任何数据。我们的物化视图会在向 `otel_logs` 插入数据时，对其执行上述 `SELECT` 查询（会按配置的块大小分块执行），并将结果写入到 `bytes_per_hour`。其语法如下所示：

```sql
CREATE MATERIALIZED VIEW bytes_per_hour_mv TO bytes_per_hour AS
SELECT toStartOfHour(Timestamp) AS Hour,
       sum(toUInt64OrDefault(LogAttributes['size'])) AS TotalBytes
FROM otel_logs
GROUP BY Hour
```

这里的 `TO` 子句至关重要，用于指定结果将被写入到哪里，即 `bytes_per_hour`。

如果我们重启 OTel collector 并重新发送日志，`bytes_per_hour` 表会根据上述查询结果被逐步填充。完成后，我们可以确认 `bytes_per_hour` 的大小——理论上每小时应当有 1 行记录：

```sql
SELECT count()
FROM bytes_per_hour
FINAL
```


┌─count()─┐
│     113 │
└─────────┘

1 行结果，耗时 0.039 秒。

````

通过存储查询结果,我们有效地将行数从 1000 万行(在 `otel_logs` 中)减少到 113 行。关键在于,当新日志插入到 `otel_logs` 表时,新值将被发送到 `bytes_per_hour` 对应的小时记录中,并在后台自动异步合并——通过每小时仅保留一行,`bytes_per_hour` 将始终保持精简且实时更新。

由于行合并是异步进行的,用户查询时每小时可能存在多行数据。为确保在查询时合并所有待处理的行,我们有两个选项:

- 在表名上使用 [`FINAL` 修饰符](/sql-reference/statements/select/from#final-modifier)(如上面的计数查询所示)。
- 按最终表中使用的排序键(即 Timestamp)进行聚合,并对指标求和。

通常,第二个选项更高效且更灵活(该表可用于其他用途),但第一个选项对某些查询而言可能更简单。下面展示这两种方法:

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

返回 5 行。耗时:0.008 秒。

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

返回 5 行。耗时:0.005 秒。
````

这将把我们的查询从 0.6s 加速到 0.008s —— 提升了 75 倍以上！

:::note
在更大的数据集上、针对更复杂的查询，这种加速效果会更加明显。示例参见[此处](https://github.com/ClickHouse/clickpy)。
:::

#### 一个更复杂的示例

上面的示例使用 [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree) 按小时聚合简单计数。如果要计算不仅仅是简单求和的统计信息，则需要使用不同的目标表引擎：[AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree)。

假设我们希望计算每天的唯一 IP 地址数量（或唯一用户数量）。对应的查询如下所示：

```sql
SELECT toStartOfHour(Timestamp) AS Hour, uniq(LogAttributes['remote_addr']) AS UniqueUsers
FROM otel_logs
GROUP BY Hour
ORDER BY Hour DESC

┌────────────────Hour─┬─UniqueUsers─┐
│ 2019-01-26 16:00:00 │     4763    │
│ 2019-01-22 00:00:00 │     536     │
└─────────────────────┴─────────────┘

返回 113 行。用时:0.667 秒。已处理 1037 万行,4.73 GB(每秒 1553 万行,7.09 GB/秒)
```

在进行增量更新时，要持久化基数统计值，需要使用 AggregatingMergeTree。

```sql
CREATE TABLE unique_visitors_per_hour
(
  `Hour` DateTime,
  `UniqueUsers` AggregateFunction(uniq, IPv4)
)
ENGINE = AggregatingMergeTree
ORDER BY Hour
```


为了让 ClickHouse 知道会存储聚合状态，我们将 `UniqueUsers` 列定义为 [`AggregateFunction`](/sql-reference/data-types/aggregatefunction) 类型，指定部分状态所使用的聚合函数（uniq）以及源列的类型（IPv4）。与 SummingMergeTree 类似，具有相同 `ORDER BY` 键值的行会被合并（在上面的示例中为 Hour）。

关联的物化视图使用了前面的查询：

```sql
CREATE MATERIALIZED VIEW unique_visitors_per_hour_mv TO unique_visitors_per_hour AS
SELECT toStartOfHour(Timestamp) AS Hour,
        uniqState(LogAttributes['remote_addr']::IPv4) AS UniqueUsers
FROM otel_logs
GROUP BY Hour
ORDER BY Hour DESC
```

注意我们在聚合函数末尾追加了后缀 `State`。这可以确保返回的是函数的聚合状态而不是最终结果。该状态包含额外信息，使得这个局部状态可以与其他状态进行合并。

在通过重启 Collector 重新加载数据后，我们可以确认在 `unique_visitors_per_hour` 表中有 113 行数据可用。

```sql
SELECT count()
FROM unique_visitors_per_hour
FINAL
┌─count()─┐
│   113   │
└─────────┘

1 行结果集。用时:0.009 秒。
```

我们的最终查询需要在这些函数上使用 `Merge` 后缀（因为这些列存储的是部分聚合状态）：

```sql
SELECT Hour, uniqMerge(UniqueUsers) AS UniqueUsers
FROM unique_visitors_per_hour
GROUP BY Hour
ORDER BY Hour DESC

┌────────────────Hour─┬─UniqueUsers─┐
│ 2019-01-26 16:00:00 │      4763   │
│ 2019-01-22 00:00:00 │      536    │
└─────────────────────┴─────────────┘

113 行结果集。耗时：0.027 秒。
```

请注意，这里我们使用的是 `GROUP BY`，而不是 `FINAL`。

### 使用物化视图（增量）进行快速查找

用户在选择 ClickHouse 排序键时，应根据其访问模式，将经常用于过滤和聚合子句的列包含在排序键中。在可观测性（Observability）场景中，这可能会带来一定限制，因为用户的访问模式更加多样，无法用单一的一组列完全概括。默认 OTel 模式中内置的一个示例可以很好地说明这一点。请参考 traces 的默认模式：


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

此架构针对按 `ServiceName`、`SpanName` 和 `Timestamp` 进行过滤进行了优化。在追踪场景中，用户还需要能够根据特定的 `TraceId` 进行查找，并检索该追踪关联的所有 span。虽然 `TraceId` 已包含在排序键中，但由于其位于末尾，[过滤效率不会那么高](/guides/best-practices/sparse-primary-indexes#ordering-key-columns-efficiently)，在检索单个追踪时很可能需要扫描大量数据。

OTel collector 还会创建一个物化视图及其对应的表来解决这一问题。该表和视图如下所示：

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

该视图用于确保表 `otel_traces_trace_id_ts` 中存储了每个 trace 的最小和最大时间戳。该表按 `TraceId` 排序，使得可以高效地检索这些时间戳。随后，在查询主表 `otel_traces` 时可以利用这些时间戳范围。更具体地说，当通过 id 检索某个 trace 时，Grafana 会使用如下查询：


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

此处的 CTE 用于查找 trace id `ae9226c78d1d360601e6383928e4d22d` 的最小和最大时间戳，然后基于这两个时间戳来过滤主表 `otel_traces` 中与之关联的 span。

同样的方法可以应用于类似的访问模式。我们在数据建模中对一个类似示例进行了探讨，参见[此处](/materialized-view/incremental-materialized-view#lookup-table)。

### 使用 projections

ClickHouse 的 projections 允许用户为一张表指定多个 `ORDER BY` 子句。

在前面的章节中，我们探讨了如何在 ClickHouse 中使用物化视图来预计算聚合、转换行以及针对不同访问模式优化可观测性查询。

我们给出了一个示例，其中物化视图将行发送到一个目标表，该目标表的排序键与接收插入数据的原始表不同，以便针对按 trace id 查找进行优化。

Projections 可以用来解决同样的问题，使用户能够针对不属于主键的列来优化查询。

理论上，此功能可用于为一张表提供多个排序键，但存在一个明显的缺点：数据重复。具体来说，数据需要先按照主键顺序写入一次，并且还要按照为每个 projection 指定的顺序再写入一次。这会降低插入性能并消耗更多磁盘空间。

:::note Projections vs Materialized Views
Projections 提供了与物化视图相似的许多功能，但应谨慎使用，通常更推荐使用物化视图。用户需要理解它们的缺点以及适用场景。例如，虽然 projections 可以用于预计算聚合，但我们建议用户在这种场景下使用物化视图。
:::

<Image img={observability_13} alt="Observability and projections" size="md" />

考虑以下查询，它对 `otel_logs_v2` 表按 500 错误码过滤记录。这很可能是日志中的常见访问模式，用户通常希望按错误码进行过滤：

```sql
SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent
FROM otel_logs_v2
WHERE Status = 500
FORMAT `Null`

Ok.

0 rows in set. Elapsed: 0.177 sec. Processed 10.37 million rows, 685.32 MB (58.66 million rows/s., 3.88 GB/s.)
Peak memory usage: 56.54 MiB.
```

:::note 使用 Null 来进行性能测试
这里我们没有打印结果，而是使用 `FORMAT Null`。这会强制读取所有结果但不返回，从而防止查询因为 LIMIT 而提前终止。这样做只是为了展示扫描全部 1000 万行所花费的时间。
:::

上述查询在我们选择的排序键 `(ServiceName, Timestamp)` 下需要进行线性扫描。虽然我们可以将 `Status` 添加到排序键末尾，以提升上述查询的性能，但我们也可以添加一个投影（projection）。

```sql
ALTER TABLE otel_logs_v2 (
  ADD PROJECTION status
  (
     SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent ORDER BY Status
  )
)

ALTER TABLE otel_logs_v2 MATERIALIZE PROJECTION status
```

请注意，我们必须先创建 projection，然后再将其物化。后面的命令会导致数据以两种不同的顺序在磁盘上各存储一份。projection 也可以在创建数据（例如创建数据表）时定义，如下所示，并且在插入数据时会自动维护。


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

需要注意的是，如果投影是通过 `ALTER` 创建的，那么在执行 `MATERIALIZE PROJECTION` 命令后，其创建将在后台异步进行。用户可以使用以下查询来检查该操作的进度，并等待 `is_done=1`。

```sql
SELECT parts_to_do, is_done, latest_fail_reason
FROM system.mutations
WHERE (`table` = 'otel_logs_v2') AND (command LIKE '%MATERIALIZE%')

┌─parts_to_do─┬─is_done─┬─latest_fail_reason─┐
│           0 │     1   │                    │
└─────────────┴─────────┴────────────────────┘

1 row in set. Elapsed: 0.008 sec.
```

如果我们再次执行上述查询，可以看到性能在额外存储开销的前提下显著提升（关于如何进行测量，请参阅 [&quot;Measuring table size &amp; compression&quot;](#measuring-table-size--compression)）。

```sql
SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent
FROM otel_logs_v2
WHERE Status = 500
FORMAT `Null`

返回 0 行。耗时：0.031 秒。处理了 51.42 千行，22.85 MB（1.65 百万行/秒，734.63 MB/秒）。
峰值内存使用：27.85 MiB。
```

在上面的示例中，我们在投影中指定了前面查询中使用的列。这意味着只有这些指定的列会作为投影的一部分存储到磁盘上，并按 Status 排序。或者，如果我们在这里使用 `SELECT *`，则所有列都会被存储。虽然这将允许更多查询（使用任意列子集）从投影中获益，但也会带来额外的存储开销。要衡量磁盘空间占用和压缩情况，请参阅 [&quot;Measuring table size &amp; compression&quot;](#measuring-table-size--compression)。

### 二级 / 数据跳过索引

无论在 ClickHouse 中主键如何精心调优，一些查询仍然不可避免地需要全表扫描。虽然这可以通过物化视图（以及针对某些查询的投影）来缓解，但这些机制需要额外维护，并且还要求用户了解它们的存在，才能确保被有效利用。传统关系型数据库通过二级索引来解决这一问题，但在像 ClickHouse 这样的列式数据库中，这类索引并不高效。取而代之的是，ClickHouse 使用“跳过索引（Skip index）”，它可以通过让数据库跳过大量不包含匹配值的数据块，从而显著提升查询性能。

默认的 OTel 模式使用二级索引，试图加速对 map 字段的访问。我们发现这些索引整体效果有限，因此不建议在自定义模式中照搬它们，但跳过索引在某些场景下仍然是有用的。

在尝试应用二级索引之前，用户应阅读并理解 [guide to secondary indices](/optimize/skipping-indexes)。

**通常来说，当主键与目标的非主键列/表达式之间存在较强相关性，并且用户查询的是稀有值（即在许多 granule 中都不出现的值）时，它们会更为有效。**

### 用于文本搜索的 Bloom 过滤器


对于可观测性相关查询，当用户需要执行文本搜索时，二级索引会非常有用。具体来说，ngram 和基于 token 的 Bloom 过滤索引 [`ngrambf_v1`](/optimize/skipping-indexes#bloom-filter-types) 和 [`tokenbf_v1`](/optimize/skipping-indexes#bloom-filter-types) 可用于加速在 String 列上使用 `LIKE`、`IN` 和 `hasToken` 运算符的搜索。需要注意的是，基于 token 的索引会使用非字母数字字符作为分隔符来生成 token。这意味着在查询时只能匹配 token（或完整单词）。如果需要更细粒度的匹配，可以使用 [N-gram Bloom 过滤器](/optimize/skipping-indexes#bloom-filter-types)。它会将字符串拆分为指定长度的 ngram，从而实现子词级匹配。

要评估将会生成、并可被匹配的 token，可以使用 `tokens` 函数：

```sql
SELECT tokens('https://www.zanbil.ir/m/filter/b113')

┌─tokens────────────────────────────────────────────┐
│ ['https','www','zanbil','ir','m','filter','b113'] │
└───────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.008 sec.
```

`ngram` 函数也提供类似功能，可以通过第二个参数指定 `ngram` 的大小：

```sql
SELECT ngrams('https://www.zanbil.ir/m/filter/b113', 3)

┌─ngrams('https://www.zanbil.ir/m/filter/b113', 3)────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ['htt','ttp','tps','ps:','s:/','://','//w','/ww','www','ww.','w.z','.za','zan','anb','nbi','bil','il.','l.i','.ir','ir/','r/m','/m/','m/f','/fi','fil','ilt','lte','ter','er/','r/b','/b1','b11','113'] │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.008 sec.
```

:::note 倒排索引
ClickHouse 还对将倒排索引用作二级索引提供了实验性支持。我们目前不建议在日志数据集上使用它们，但预计在其达到生产就绪后，它们将取代基于 token 的 Bloom 过滤器。
:::

在本示例中，我们使用结构化日志数据集。假设我们希望统计 `Referer` 列中包含 `ultra` 的日志数量。

```sql
SELECT count()
FROM otel_logs_v2
WHERE Referer LIKE '%ultra%'

┌─count()─┐
│  114514 │
└─────────┘

1 行结果。用时：0.177 秒。已处理 1037 万行，908.49 MB（5857 万行/秒，5.13 GB/秒）。
```

在这里我们需要匹配 ngram 大小为 3，因此创建一个 `ngrambf_v1` 索引。

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

这里的索引 `ngrambf_v1(3, 10000, 3, 7)` 接受四个参数。最后一个参数（值为 7）表示种子（seed）。其他参数分别表示 ngram 大小（3）、值 `m`（过滤器大小），以及哈希函数个数 `k`（7）。`k` 和 `m` 需要进行调优，其取值取决于唯一 ngram/标记的数量，以及过滤器产生真负结果（true negative）的概率——从而确认某个值在一个 granule 中不存在。我们建议使用[这些函数](/engines/table-engines/mergetree-family/mergetree#bloom-filter)来帮助确定这些取值。


如果调优得当，这里的性能提升可能非常可观：

```sql
SELECT count()
FROM otel_logs_bloom
WHERE Referer LIKE '%ultra%'
┌─count()─┐
│   182   │
└─────────┘

返回 1 行。用时:0.077 秒。已处理 422 万行,375.29 MB(每秒 5481 万行,4.87 GB/秒)。
内存峰值:129.60 KiB。
```

:::note 仅为示例
以上内容仅用于演示目的。我们建议用户在写入时就对日志进行结构化处理，而不是尝试使用基于 token 的 Bloom 过滤器来优化文本搜索。不过，在某些情况下，用户可能会有堆栈跟踪或其他大型字符串，由于其结构不那么确定，此时文本搜索仍然是有用的。
:::

关于使用 Bloom 过滤器的一些通用指南：

Bloom 过滤器的目标是过滤[granule](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design)，从而避免为某个列加载所有值并执行线性扫描。`EXPLAIN` 子句配合参数 `indexes=1`，可用于识别被跳过的 granule 数量。请对比下面针对原始表 `otel_logs_v2` 和带有 ngram Bloom 过滤器的表 `otel_logs_bloom` 的输出结果。

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

返回 10 行。耗时：0.016 秒。

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

通常只有当 Bloom 过滤器本身比该列更小时，查询才会更快；如果它更大，则性能提升往往可以忽略不计。可以使用以下查询比较过滤器与该列的大小：

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
```


┌─表──────────────┬─压缩&#95;大小───────┬─未压缩&#95;大小─────────┐
│ otel&#95;logs&#95;bloom │ 12.03 MiB       │ 12.17 MiB         │
└─────────────────┴─────────────────┴───────────────────┘

1 行结果。耗时：0.004 秒。

```

在上述示例中,可以看到二级布隆过滤器索引为 12MB,几乎比列本身的压缩大小 56MB 小 5 倍。

布隆过滤器可能需要大量调优。建议参考[此处](/engines/table-engines/mergetree-family/mergetree#bloom-filter)的说明以确定最佳设置。布隆过滤器在插入和合并时也可能产生较高开销。用户应在将布隆过滤器添加到生产环境之前评估其对插入性能的影响。

有关二级跳数索引的更多详细信息,请参阅[此处](/optimize/skipping-indexes#skip-index-functions)。

### 从 Map 中提取数据 {#extracting-from-maps}

Map 类型在 OTel 模式中很常见。此类型要求值和键具有相同的类型,足以用于 Kubernetes 标签等元数据。请注意,查询 Map 类型的子键时,会加载整个父列。如果 Map 包含大量键,这可能会导致显著的查询性能损失,因为需要从磁盘读取的数据量比键作为独立列存在时更多。

如果您经常查询特定键,请考虑将其移至根级别的专用列中。这通常是在部署后根据常见访问模式执行的任务,在生产环境之前可能难以预测。有关如何在部署后修改模式,请参阅["管理模式变更"](/observability/managing-data#managing-schema-changes)。
```


## 衡量表大小与压缩 {#measuring-table-size--compression}

ClickHouse 被用于可观测性场景的主要原因之一是其出色的压缩能力。

除了大幅降低存储成本外，更少的磁盘数据意味着更少的 I/O，以及更快速的查询与写入。就 CPU 耗用而言，I/O 的减少所带来的收益将远远超过任何压缩算法引入的额外开销。因此，在优化 ClickHouse 查询性能时，提高数据压缩率应当是首要关注点。

有关如何衡量压缩的详细信息，请参见[此处](/data-compression/compression-in-clickhouse)。
