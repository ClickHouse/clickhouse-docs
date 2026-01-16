---
title: 'Schema 设计'
description: '面向可观测性的 schema 设计'
keywords: ['可观测性', 'logs', 'traces', 'metrics', 'OpenTelemetry', 'Grafana', 'OTel']
slug: /use-cases/observability/schema-design
show_related_blogs: true
doc_type: 'guide'
---

import observability_10 from '@site/static/images/use-cases/observability/observability-10.png';
import observability_11 from '@site/static/images/use-cases/observability/observability-11.png';
import observability_12 from '@site/static/images/use-cases/observability/observability-12.png';
import observability_13 from '@site/static/images/use-cases/observability/observability-13.png';
import Image from '@theme/IdealImage';


# 为可观测性设计模式 \{#designing-a-schema-for-observability\}

我们建议用户始终为日志和追踪创建自己的模式，原因如下：

- **选择主键** - 默认模式使用的 `ORDER BY` 针对特定访问模式进行了优化，而您的访问模式很可能与此不一致。
- **提取结构** - 您可能希望从已有列中提取出新的列，例如从 `Body` 列中提取。可以使用物化列（以及在更复杂的情况下使用 materialized views）来实现。这需要对模式进行更改。
- **优化 Maps** - 默认模式使用 Map 类型来存储属性。这些列允许存储任意元数据。这一能力至关重要，因为事件中的元数据通常并非预先定义，否则就无法存储在像 ClickHouse 这样强类型的数据库中。不过，与访问普通列相比，访问 Map 键及其值的效率要低一些。我们通过修改模式，并确保最常访问的 Map 键提升为顶层列来解决此问题——参见 ["Extracting structure with SQL"](#extracting-structure-with-sql)。这需要进行模式更改。
- **简化 Map 键访问** - 访问 Map 中的键需要更冗长的语法。您可以通过别名来缓解这一问题。参见 ["Using Aliases"](#using-aliases) 以简化查询。
- **二级索引** - 默认模式使用二级索引来加速对 Maps 的访问以及文本查询。这些通常不是必需的，并会额外占用磁盘空间。可以使用，但应经过测试以确认确有必要。参见 ["Secondary / Data Skipping indices"](#secondarydata-skipping-indices)。
- **使用 Codecs** - 如果您了解预期数据，并有证据表明这可以改进压缩效果，您可能希望为列自定义编解码器。

_我们将在下文详细介绍上述每个用例。_

**重要说明：** 虽然鼓励用户扩展和修改其模式以获得最佳压缩和查询性能，但在可能的情况下，应遵循 OTel 对核心列的命名约定。ClickHouse Grafana 插件假定存在一些基础的 OTel 列以辅助构建查询，例如 Timestamp 和 SeverityText。日志和追踪的必需列分别记录在此处 [[1]](https://grafana.com/developers/plugin-tools/tutorials/build-a-logs-data-source-plugin#logs-data-frame-format)[[2]](https://grafana.com/docs/grafana/latest/explore/logs-integration/) 和[此处](https://grafana.com/docs/grafana/latest/explore/trace-integration/#data-frame-structure)。您可以选择更改这些列名，并在插件配置中覆盖默认值。

## 使用 SQL 提取结构 \{#extracting-structure-with-sql\}

无论是摄取结构化还是非结构化日志，用户通常都需要能够：

* **从字符串 blob 中提取列**。对这些列进行查询会比在查询时执行字符串操作更快。
* **从 Map 中提取键**。默认 schema 会将任意属性放入 Map 类型的列中。该类型提供了无 schema 的能力，其优势在于用户在定义日志和跟踪时不需要为属性预先定义列——在从 Kubernetes 收集日志并希望确保 pod（容器组）标签被保留以供后续搜索时，这往往是做不到的。从 Map 中访问键及其值比在普通 ClickHouse 列上查询要慢。因此，将键从 Map 中提取到根表的列中通常是更理想的做法。

请看以下查询：

假设我们希望统计在结构化日志中，哪些 URL 路径接收到的 POST 请求最多。JSON blob 作为 String 存储在 `Body` 列中。此外，如果用户在采集器中启用了 `json_parser`，它也可能作为 `Map(String, String)` 存储在 `LogAttributes` 列中。

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

假设已提供 `LogAttributes`，用于统计站点中哪些 URL 路径收到最多 POST 请求的查询如下：

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

请注意这里使用的 map 语法，例如 `LogAttributes['request_path']`，以及用于从 URL 中去除查询参数的 [`path` function](/sql-reference/functions/url-functions#path)。

如果用户没有在收集器中启用 JSON 解析，那么 `LogAttributes` 将为空，这时就需要我们使用 [JSON functions](/sql-reference/functions/json-functions) 从 String 类型的 `Body` 中提取列。

:::note Prefer ClickHouse for parsing
我们通常建议用户在 ClickHouse 中对结构化日志执行 JSON 解析。我们有信心 ClickHouse 拥有最快的 JSON 解析实现。不过，我们也理解您可能希望将日志发送到其他系统，而不希望这部分逻辑通过 SQL 来实现。
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

现在对非结构化日志做同样的处理：

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

对于非结构化日志，进行类似的查询时需要结合正则表达式并使用 `extractAllGroupsVertical` 函数。

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

为了解析非结构化日志而执行查询所增加的复杂性和成本（注意性能差异），正是我们建议用户在可能的情况下始终使用结构化日志的原因。

:::note 考虑使用字典
上述查询可以通过利用正则表达式字典进行优化。有关更多详细信息，请参阅 [Using Dictionaries](#using-dictionaries)。
:::

通过将上述查询逻辑前移到插入阶段，即可在 ClickHouse 中满足这两种用例。我们在下面探讨几种方法，并强调各自适用的场景。

:::note 使用 OTel 还是 ClickHouse 进行处理？
你也可以按照[此处](/observability/integrating-opentelemetry#processing---filtering-transforming-and-enriching)所述，使用 OTel Collector 的处理器和算子进行处理。在大多数情况下，你会发现 ClickHouse 在资源利用效率和处理速度方面都显著优于 collector 的处理器。将所有事件处理都放在 SQL 中完成的主要缺点，是会让你的解决方案与 ClickHouse 紧密耦合。例如，你可能希望从 OTel collector 将处理后的日志发送到其他目标端，例如 S3。
:::


### 物化列 \{#materialized-columns\}

物化列提供了从其他列中提取结构化信息的最简单方案。这类列的值始终在插入时计算，并且不能在 `INSERT` 查询中显式指定。

:::note Overhead
物化列会带来额外的存储开销，因为这些值会在插入时被提取到磁盘上的新列中。
:::

物化列支持任意 ClickHouse 表达式，并且可以利用任意分析函数进行[字符串处理](/sql-reference/functions/string-functions)（包括[正则和搜索](/sql-reference/functions/string-search-functions)）、[URL 处理](/sql-reference/functions/url-functions)、执行[类型转换](/sql-reference/functions/type-conversion-functions)、[从 JSON 中提取值](/sql-reference/functions/json-functions)或[数学运算](/sql-reference/functions/math-functions)。

我们建议将物化列用于基础处理。它们对于从 Map 中提取值、将其提升为顶层列以及执行类型转换特别有用。在非常基础的 schema 中，或与 materialized view 结合使用时，它们通常最为实用。请参考下面这个用于日志的 schema，其中 JSON 已由采集器提取到 `LogAttributes` 列中：

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

用于从字符串 `Body` 中使用 JSON 函数进行提取的等效 schema 可以在[此处](https://pastila.nl/?005cbb97/513b174a7d6114bf17ecc657428cf829#gqoOOiomEjIiG6zlWhE+Sg==)找到。

我们的三个物化列分别提取请求页面、请求类型以及 referrer 的域名。它们访问 map 的键并对其值应用函数。我们后续的查询会快得多：

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
默认情况下，物化列不会包含在 `SELECT *` 的结果中。这样可以保证一个不变式：`SELECT *` 的结果总是可以通过 INSERT 插回同一张表。可以通过设置 `asterisk_include_materialized_columns=1` 来关闭这种默认行为；也可以在 Grafana 中启用包含物化列（参见数据源配置中的 `Additional Settings -> Custom Settings`）。
:::


## materialized view \{#materialized-views\}

[materialized view](/materialized-views) 为对日志和追踪应用 SQL 过滤和转换提供了一种更强大的方式。

materialized view 可以让你将计算成本从查询时转移到写入时。ClickHouse 的 materialized view 本质上就是一个触发器，在数据块被插入到表中时对其运行一个查询。该查询的结果被插入到第二个“目标”表中。

<Image img={observability_10} alt="Materialized view" size="md" />

:::note 实时更新
ClickHouse 中的 materialized view 会在数据流入其所基于的表时实时更新，其行为更类似于持续更新的索引。相比之下，在其他数据库中，materialized view 通常是查询的静态快照，必须显式刷新（类似于 ClickHouse 的 Refreshable Materialized Views）。
:::

与 materialized view 关联的查询在理论上可以是任意查询，包括聚合查询，尽管[在 Join 方面存在一些限制](https://clickhouse.com/blog/using-materialized-views-in-clickhouse#materialized-views-and-joins)。对于日志和追踪所需的转换和过滤类型的工作负载，你可以认为任意 `SELECT` 语句都是可行的。

你应当记住，这个查询只是一个触发器，作用于被插入到某个表（源表）中的行，将结果发送到一个新表（目标表）。

为了确保我们不会将数据在源表和目标表中各持久化一份，我们可以将源表的表引擎修改为 [Null table engine](/engines/table-engines/special/null)，同时保留原有 schema。我们的 OTel collectors 将继续向该表发送数据。例如，对于日志，`otel_logs` 表会变为：

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

Null 表引擎是一种强大的优化手段——可以把它理解为 `/dev/null`。该表本身不会存储任何数据，但在插入的行被丢弃之前，任何在其之上附加的 materialized view 仍会照常执行。

来看下面这个查询。它将我们的行转换为我们希望保留的格式，从 `LogAttributes` 中提取所有列（我们假设这是由收集器使用 `json_parser` 运算符设置的），并设置 `SeverityText` 和 `SeverityNumber`（基于一些简单条件以及[这些列](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-severitytext)的定义）。在这个例子中，我们只选择那些确定会被填充的列，忽略诸如 `TraceId`、`SpanId` 和 `TraceFlags` 等列。


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

我们还提取了上面的 `Body` 列——以防之后添加了新的属性但没有被我们的 SQL 提取到。该列在 ClickHouse 中通常会有良好的压缩效果，而且很少被访问，因此不会影响查询性能。最后，我们通过一次类型转换将 Timestamp 转换为 DateTime 类型（以节省空间——参见[《优化数据类型》](#optimizing-types)）。

:::note 条件表达式
请注意上面使用了[条件函数](/sql-reference/functions/conditional-functions)来提取 `SeverityText` 和 `SeverityNumber`。这些函数在构建复杂条件以及检查 map 中的值是否已设置时非常有用——在这里我们简单地假设 `LogAttributes` 中存在所有键。我们建议用户熟悉这些函数——除了用于处理[空值](/sql-reference/functions/functions-for-nulls)的函数之外，它们也是你进行日志解析的好帮手！
:::

我们需要一张表来接收这些结果。下面的目标表与上述查询相匹配：

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
请注意，我们在这里对 schema 做出了大幅调整。实际使用中，你很可能还有需要保留的 Trace 列，以及 `ResourceAttributes` 列（通常包含 Kubernetes 元数据）。Grafana 可以利用 trace 列，在日志与 trace 之间提供链接功能——参见 [&quot;Using Grafana&quot;](/observability/grafana)。
:::


在下面的示例中，我们创建一个 materialized view `otel_logs_mv`，它对 `otel_logs` 表执行上述 SELECT，并将结果写入 `otel_logs_v2`。

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

上面的内容可视化如下：

<Image img={observability_11} alt="Otel MV" size="md" />

如果我们现在重新启动 [&quot;Exporting to ClickHouse&quot;](/observability/integrating-opentelemetry#exporting-to-clickhouse) 一节中使用的 collector 配置，数据就会以我们期望的格式出现在 `otel_logs_v2` 中。请注意这里使用了带类型的 JSON 提取函数。

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

下面展示了一个等效的 materialized view，它通过使用 JSON 函数从 `Body` 列中提取各个列：


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


### 注意类型 \\{#beware-types\\}

上面的 materialized view 依赖隐式类型转换——尤其是在使用 `LogAttributes` 映射时。ClickHouse 通常会透明地将提取出的值转换为目标表的类型，从而减少显式类型转换语法的编写。不过，我们建议用户始终通过在目标表上使用相同 schema 的 [`INSERT INTO`](/sql-reference/statements/insert-into) 语句配合该 view 的 `SELECT` 语句来测试自己的 view。这样可以确认类型是否被正确处理。对以下情况需要特别注意：

- 如果键在映射中不存在，将返回空字符串。对于数值类型，你需要将这些值映射为合适的数值。这可以通过[条件函数](/sql-reference/functions/conditional-functions)实现，例如 `if(LogAttributes['status'] = ", 200, LogAttributes['status'])`，或者在默认值可接受的情况下，使用[类型转换函数](/sql-reference/functions/type-conversion-functions)，例如 `toUInt8OrDefault(LogAttributes['status'] )`
- 某些类型并不会总是被转换，例如数值的字符串表示不会被转换为枚举值。
- JSON 提取函数在找不到值时会返回其类型的默认值。请确认这些默认值在语义上是合理的。

:::note 避免使用 Nullable
避免在 ClickHouse 中为可观测性数据使用 [Nullable](/sql-reference/data-types/nullable)。在日志和链路追踪中，很少需要区分空值与 null。该特性会增加额外的存储开销，并对查询性能产生负面影响。参见[此处](/data-modeling/schema-design#optimizing-types)了解更多细节。
:::

## 选择主（排序）键 \\{#choosing-a-primary-ordering-key\\}

在提取出所需的列之后，就可以开始优化排序键/主键了。

可以应用一些简单规则来帮助选择排序键。下列规则有时会相互冲突，因此请按顺序考虑这些因素。通过这个过程你可以识别出若干个键，通常 4–5 个就足够：

1. 选择与你的常见过滤条件和访问模式相匹配的列。如果你通常在可观测性排查中首先通过某个特定列（例如 pod（容器组）名称）进行过滤，那么这个列会在 `WHERE` 子句中被频繁使用。优先将这些列包含进你的键中，而不是那些使用频率较低的列。
2. 优先选择在过滤时可以排除很大比例总行数的列，从而减少需要读取的数据量。服务名称和状态码通常是不错的候选项——后者仅在你按能排除大多数行的值进行过滤时才适用；例如，在大多数系统中，按 2xx 状态码过滤通常会匹配大部分行，而 5xx 错误只对应一个较小子集。
3. 优先选择与表中其他列高度关联的列。这有助于确保这些值也被连续存储，从而提升压缩率。
4. 对排序键中的列执行 `GROUP BY` 和 `ORDER BY` 操作时，可以更高效地利用内存。

<br />

在确定排序键所用列的子集之后，必须按特定顺序声明它们。这个顺序会显著影响到查询中过滤排序键后续列时的效率，以及表数据文件的压缩比。一般而言，**最好按基数从小到大的顺序来排列键**。同时应平衡这样一个事实：在排序键中位置越靠后的列，其过滤效率会低于位置更靠前的列。权衡这些特性，并结合你的访问模式进行选择。更重要的是，要测试不同变体。若要进一步理解排序键以及如何优化它们，我们推荐阅读[这篇文章](/guides/best-practices/sparse-primary-indexes)。

:::note 先考虑结构
我们建议在理清日志结构后再决定排序键。不要使用属性 map 中的键或 JSON 提取表达式作为排序键。请确保你的排序键是表中的根级列。
:::

## 使用 map \{#using-maps\}

前面的示例展示了使用 `map['key']` 语法来访问 `Map(String, String)` 列中的值。除了使用 map 语法访问嵌套键之外，还可以使用 ClickHouse 提供的专用 [map 函数](/sql-reference/functions/tuple-map-functions#mapKeys) 来过滤或选取这些列。

例如，下面的查询先使用 [`mapKeys` 函数](/sql-reference/functions/tuple-map-functions#mapKeys)，再配合 [`groupArrayDistinctArray` 函数](/sql-reference/aggregate-functions/combinators)（一种组合器），来识别 `LogAttributes` 列中所有可用的唯一键。

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
我们不建议在 Map 类型的列名中使用点号，将来可能会废弃这种用法。请改用 `_`。
:::


## 使用别名 \{#using-aliases\}

查询 map 类型比查询普通列更慢——参见 [&quot;Accelerating queries&quot;](#accelerating-queries)。此外，其语法更为复杂，书写起来也可能比较麻烦。为了解决后一个问题，我们建议使用 ALIAS 列。

ALIAS 列在查询时计算，并不会存储在表中。因此，无法向这种类型的列执行 INSERT 操作。通过使用别名，我们可以引用 map 的键并简化语法，将 map 条目透明地暴露为普通列。请看下面的示例：

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

我们有几个物化列，以及一个 `ALIAS` 列 `RemoteAddr`，它访问 Map 类型列 `LogAttributes`。现在我们可以通过该列来查询 `LogAttributes['remote_addr']` 的值，从而简化查询，例如：

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

此外，通过 `ALTER TABLE` 命令添加 `ALIAS` 非常简单。这些列会立即生效，例如：

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
默认情况下，`SELECT *` 不会返回 ALIAS 列。可以通过将 `asterisk_include_alias_columns` 设置为 `1` 来禁用此行为。
:::


## 优化类型 \\{#optimizing-types\\}

关于类型优化的 [通用 ClickHouse 最佳实践](/data-modeling/schema-design#optimizing-types) 在本 ClickHouse 可观测性场景中同样适用。

## 使用编解码器 \\{#using-codecs\\}

除了类型优化之外，在尝试为 ClickHouse 可观测性 schema 优化压缩时，还可以遵循[关于编解码器的一般最佳实践](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec)。

通常，`ZSTD` 编解码器非常适用于日志和追踪数据集。将压缩级别从默认值 1 提高，可能会带来更好的压缩效果。但这需要通过测试验证，因为更高的压缩级别会在插入时带来更高的 CPU 开销。在实践中，我们通常发现继续提高该值带来的收益有限。

另外，时间戳在压缩方面虽然可以从差分编码中获益，但如果该列被用作主键或排序键，已被证明会导致查询性能下降。我们建议用户评估压缩率与查询性能之间的权衡。

## 使用字典 \\{#using-dictionaries\\}

[Dictionaries](/sql-reference/dictionaries) 是 ClickHouse 的[关键特性](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)，提供一种内存中的 [key-value](https://en.wikipedia.org/wiki/Key%E2%80%93value_database) 形式，用于表示来自各种内部和外部[数据源](/sql-reference/dictionaries#dictionary-sources)的数据，并针对超低延迟的查找查询进行了优化。

<Image img={observability_12} alt="Observability and dictionaries" size="md"/>

这在多种场景下都非常实用，例如在不减慢摄取过程的前提下，对摄取中的数据进行实时富化，并整体提升查询性能，尤其是对 JOIN 的加速。
虽然在可观测性场景中很少需要使用 JOIN，但字典在数据富化方面仍然非常有用——无论是在写入时还是在查询时。下面我们分别给出这两种方式的示例。

:::note Accelerating joins
希望通过字典加速 JOIN 的用户可以在[此处](/dictionary)找到更多详细信息。
:::

### 插入时 vs 查询时 \\{#insert-time-vs-query-time\\}

字典可以在查询时或插入时用于丰富数据集。每种方式都有各自的优缺点。总结如下：

- **插入时** - 如果用于丰富的数据值是静态的，并且存在于可用于填充字典的外部数据源中，那么通常适合在插入时进行丰富。在这种情况下，在插入时对行进行丰富，可以避免在查询时对字典进行查找。代价是插入性能会下降，并带来额外的存储开销，因为丰富后的值会作为列进行存储。
- **查询时** - 如果字典中的值经常变化，通常更适合在查询时进行字典查找。这样可以避免在映射值发生变化时需要更新列（并重写数据）。这种灵活性是以查询时查找开销为代价的。当需要对大量行进行查找时，这种查询时开销通常才会变得明显，例如在过滤子句中使用字典查找。对于结果丰富场景，即在 `SELECT` 中使用时，这种开销通常并不显著。

我们建议用户先熟悉字典的基础知识。字典提供了一个内存中的查找表，可以通过[专用函数](/sql-reference/functions/ext-dict-functions#dictGetAll)从中检索值。

有关简单丰富示例，请参阅关于字典的指南[此处](/dictionary)。下文我们将重点介绍常见的可观测性丰富任务。

### 使用 IP 字典 \{#using-ip-dictionaries\}

使用 IP 地址为日志和链路追踪添加经纬度等地理信息（Geo-enrich）是常见的可观测性需求。我们可以使用 `ip_trie` 结构化字典来实现这一点。

我们使用由 [DB-IP.com](https://db-ip.com/) 提供、在 [CC BY 4.0 license](https://creativecommons.org/licenses/by/4.0/) 条款下公开发布的 [DB-IP city-level dataset](https://github.com/sapics/ip-location-db#db-ip-database-update-monthly)。

从 [README](https://github.com/sapics/ip-location-db#csv-format) 中可以看到，数据结构如下所示：

```csv
| ip_range_start | ip_range_end | country_code | state1 | state2 | city | postcode | latitude | longitude | timezone |
```

在这种结构下，我们先使用 [url()](/sql-reference/table-functions/url) 表函数来查看一下数据：

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

为方便起见，我们使用 [`URL()`](/engines/table-engines/special/url) 表引擎来创建一个包含字段名称的 ClickHouse 表对象，并验证总行数：

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

由于我们的 `ip_trie` 字典要求使用 CIDR 表示法来表示 IP 地址范围，因此需要对 `ip_range_start` 和 `ip_range_end` 进行转换。

可以使用下面的查询为每个范围简洁地计算出对应的 CIDR：

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
上面的查询做了很多事情。感兴趣的读者可以参考这篇优秀的[说明](https://clickhouse.com/blog/geolocating-ips-in-clickhouse-and-grafana#using-bit-functions-to-convert-ip-ranges-to-cidr-notation)。否则，只需知道上述查询会为一个 IP 范围计算出对应的 CIDR。
:::

在本小节中，我们只需要 IP 范围、国家代码和坐标，因此我们来创建一个新表并插入我们的 Geo IP 数据：

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

为了在 ClickHouse 中进行低延迟的 IP 查询，我们将利用字典在内存中存储 Geo IP 数据的键到属性的映射关系。ClickHouse 提供了一个 `ip_trie` [字典结构](/sql-reference/dictionaries#ip_trie)，用于将网络前缀（CIDR 块）映射到坐标和国家代码。下面的查询使用这种布局，并以上述表作为数据源来定义一个字典。

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

我们可以从该字典中查询行，以确认此数据集可用于查询：

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
ClickHouse 中的字典会根据底层表数据以及上面使用的 lifetime 子句定期刷新。要让我们的 Geo IP 字典反映 DB-IP 数据集中的最新变更，只需要将 `geoip_url` 远程表中的数据重新插入到 `geoip` 表中，并应用相应的转换。
:::

现在我们已经将 Geo IP 数据加载进名为 `ip_trie` 的字典（字典本身也命名为 `ip_trie`），就可以用它来进行 IP 地理位置解析了。可以通过如下方式使用 [`dictGet()` 函数](/sql-reference/functions/ext-dict-functions) 来实现：

```sql
SELECT dictGet('ip_trie', ('country_code', 'latitude', 'longitude'), CAST('85.242.48.167', 'IPv4')) AS ip_details

┌─ip_details──────────────┐
│ ('PT',38.7944,-9.34284) │
└─────────────────────────┘

1 row in set. Elapsed: 0.003 sec.
```

注意这里的检索速度。这使我们能够对日志进行富集。在本例中，我们选择在 **查询时进行富集（query time enrichment）**。

回到我们最初的日志数据集，我们可以利用上述方式按国家聚合日志。下面假设我们使用的是先前 materialized view 得到的模式（schema），其中包含一个已提取的 `RemoteAddress` 列。


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

由于 IP 到地理位置的映射可能会发生变化，用户通常希望了解请求在发出时是从哪里发起的，而不是该地址当前对应的地理位置。因此，在索引阶段进行富化处理在这里通常更合适。可以使用下面所示的物化列来实现，或者在 materialized view 的 SELECT 中实现：

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
用户通常希望基于新数据定期更新 IP 富化字典。可以通过使用字典的 `LIFETIME` 子句来实现，该子句会使字典定期从底层表中重新加载。要更新底层表，请参阅 [&quot;可刷新materialized view&quot;](/materialized-view/refreshable-materialized-view)。
:::

上述国家和坐标信息不仅可用于按国家分组和过滤，还支持更丰富的可视化能力。可参考 [&quot;可视化地理数据&quot;](/observability/grafana#visualizing-geo-data) 获取灵感。


### 使用正则表达式字典（User-Agent 解析） \{#using-regex-dictionaries-user-agent-parsing\}

[User-Agent 字符串](https://en.wikipedia.org/wiki/User_agent) 的解析是一个经典的正则表达式问题，也是基于日志和 trace 的数据集中的常见需求。ClickHouse 通过 Regular Expression Tree Dictionaries 高效解析 User-Agent。

正则表达式树字典在 ClickHouse 开源版本中通过 `YAMLRegExpTree` 字典源类型定义，该类型提供包含正则表达式树的 YAML 文件路径。如果你希望提供自己的正则表达式字典，其所需结构的详细信息可以在[这里](/sql-reference/dictionaries#use-regular-expression-tree-dictionary-in-clickhouse-open-source)找到。下面我们重点介绍使用 [uap-core](https://github.com/ua-parser/uap-core) 进行 User-Agent 解析，并加载适用于受支持 CSV 格式的字典。此方法兼容开源版和 ClickHouse Cloud。

:::note
在下面的示例中，我们使用的是 2024 年 6 月的最新 uap-core User-Agent 解析正则表达式快照。最新文件（会不定期更新）可以在[这里](https://raw.githubusercontent.com/ua-parser/uap-core/master/regexes.yaml)找到。你可以按照[这里](/sql-reference/dictionaries#collecting-attribute-values)的步骤，将其加载到下文使用的 CSV 文件中。
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

可以使用 `url` 表函数，从以下公开托管的 CSV 文件中填充这些表：

```sql
INSERT INTO regexp_os SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_os.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')

INSERT INTO regexp_device SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_device.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')

INSERT INTO regexp_browser SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_browser.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')
```

在填充好内存表之后，我们可以加载正则表达式字典。请注意，我们需要将键名指定为列——这些列就是我们能够从 User-Agent 中提取的属性。

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

在加载了这些字典之后，我们可以提供一个示例 user-agent，并测试新的字典提取功能：


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

鉴于与 user agent 相关的规则很少发生变化，且字典只需在出现新的浏览器、操作系统和设备时才需更新，因此在插入时执行这一解析/提取操作是合理的。

我们可以通过使用物化列或使用 materialized view 来完成这项工作。下面我们将修改前面使用过的 materialized view：

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

这要求我们修改目标表 `otel_logs_v2` 的表结构：

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

按照前文的步骤重启采集器并摄取结构化日志后，我们就可以查询新提取的 Device、Browser 和 OS 列了。


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

:::note 适用于复杂结构的 Tuple
请注意在这些 User-Agent 列中对 Tuple 的使用。对于层级结构在预先已知的复杂结构，推荐使用 Tuple。子列在性能上与常规列相同（不同于 Map 键），同时还允许使用异构类型。
:::


### 延伸阅读 \\{#further-reading\\}

如需了解更多有关字典的示例和细节，我们推荐阅读以下文章：

- [字典进阶主题](/dictionary#advanced-dictionary-topics)
- [使用字典加速查询](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)
- [字典](/sql-reference/dictionaries)

## 加速查询 \\{#accelerating-queries\\}

ClickHouse 支持多种用于加速查询性能的技术。只有在已经选择了合适的主键/排序键，以针对最常见的访问模式进行优化并最大化压缩之后，才应考虑下述方法。通常这一步能以最小的投入带来最大的性能提升。

### 使用 Materialized views（增量）进行聚合 \{#using-materialized-views-incremental-for-aggregations\}

在前面的章节中，我们探讨了使用 Materialized views 进行数据转换和过滤。此外，Materialized views 还可以用于在插入时预先计算聚合并存储结果，并在后续插入时增量更新这些结果，从而实现在插入阶段就完成聚合计算。

这里的核心思想是，聚合后的结果通常是原始数据的一个更小、更紧凑的表示形式（在聚合场景下是一个部分概要）。当结合一个更简单的查询从目标表中读取这些结果时，查询时间会比在原始数据上执行相同计算更快。

考虑下面的查询，我们使用结构化日志来计算每小时的总流量：

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

我们可以想象，这可能是用户在 Grafana 中绘制的一个常见折线图。这个查询确实非常快——数据集只有 1000 万行，而且 ClickHouse 本身也很快！但是，如果我们将规模扩展到数十亿甚至数万亿行，我们理想情况下希望仍然能够持续保持这样的查询性能。

:::note
如果我们使用 `otel_logs_v2` 表，这个查询会快 10 倍。该表来自我们前面创建的 materialized view，该视图从 `LogAttributes` 映射中提取 size 键。这里我们仅为了演示使用原始数据，如果这是一个常见查询，建议使用前面的视图。
:::

如果我们希望在写入时通过 materialized view 计算这个结果，就需要一张用于接收结果的表。该表每小时只应保留 1 行数据。如果某个已存在的小时收到更新，那么其他列应当合并到该小时已有的行中。为了实现这种增量状态的合并，必须为其他列存储部分状态（partial states）。

这在 ClickHouse 中需要一种特殊的引擎类型：SummingMergeTree。它会将所有具有相同排序键的行替换为一行，并在该行中存放数值列的求和值。下面的表会合并具有相同日期的行，对数值列进行求和。

```sql
CREATE TABLE bytes_per_hour
(
  `Hour` DateTime,
  `TotalBytes` UInt64
)
ENGINE = SummingMergeTree
ORDER BY Hour
```

为了演示我们的 materialized view，假设 `bytes_per_hour` 表当前为空，尚未接收到任何数据。我们的 materialized view 会对插入到 `otel_logs` 中的数据执行上述 `SELECT`（按配置大小的数据块执行），并将结果写入 `bytes_per_hour`。其语法如下：

```sql
CREATE MATERIALIZED VIEW bytes_per_hour_mv TO bytes_per_hour AS
SELECT toStartOfHour(Timestamp) AS Hour,
       sum(toUInt64OrDefault(LogAttributes['size'])) AS TotalBytes
FROM otel_logs
GROUP BY Hour
```

这里的 `TO` 子句是关键，它表示结果会被发送到哪里，即发送到 `bytes_per_hour`。

如果我们重启 OTel collector 并重新发送日志，`bytes_per_hour` 表将会根据上述查询结果被逐步增量填充。完成后，我们可以检查 `bytes_per_hour` 的行数——应该是每小时 1 行数据：

```sql
SELECT count()
FROM bytes_per_hour
FINAL

┌─count()─┐
│     113 │
└─────────┘

1 row in set. Elapsed: 0.039 sec.
```


通过存储查询结果，我们实际上将这里的行数从 1,000 万（在 `otel_logs` 中）减少到了 113。关键在于，当新日志插入到 `otel_logs` 表时，新值会被写入 `bytes_per_hour` 中对应小时的记录，并在后台异步自动合并——通过每小时只保留一行，`bytes_per_hour` 因此将始终既小又保持最新。

由于行的合并是异步完成的，当用户发起查询时，每小时可能会存在多于一行的数据。为了确保在查询时将所有尚未合并的行合并，我们有两个选项：

* 在表名上使用 [`FINAL` 修饰符](/sql-reference/statements/select/from#final-modifier)（就像我们在上面的计数查询中所做的那样）。
* 按最终表中使用的排序键进行聚合，即按 Timestamp 分组并对指标求和。

通常，第二种方式效率更高也更灵活（该表还可以用于其他用途），但对于某些查询而言，第一种方式可能更简单。我们在下面展示这两种方式：

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

这使我们的查询耗时从 0.6 秒缩短到 0.008 秒 —— 提升了超过 75 倍！

:::note
在更大的数据集以及更复杂的查询中，这种性能提升还会更加显著。示例请参见[此处](https://github.com/ClickHouse/clickpy)。
:::


#### 一个更复杂的示例 \{#a-more-complex-example\}

上面的示例使用 [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree) 按小时聚合简单的计数。若需要计算超出简单求和范围的统计信息，则需要使用另一种目标表引擎：[AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree)。

假设我们希望按天计算唯一的 IP 地址（或唯一用户）数量。对应的查询如下：

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

为了在增量更新中持久化基数统计结果，需要使用 AggregatingMergeTree。

```sql
CREATE TABLE unique_visitors_per_hour
(
  `Hour` DateTime,
  `UniqueUsers` AggregateFunction(uniq, IPv4)
)
ENGINE = AggregatingMergeTree
ORDER BY Hour
```

为使 ClickHouse 知道将会存储聚合状态，我们将 `UniqueUsers` 列定义为 [`AggregateFunction`](/sql-reference/data-types/aggregatefunction) 类型，指定部分状态所使用的聚合函数（uniq）以及源列的类型（IPv4）。与 SummingMergeTree 类似，具有相同 `ORDER BY` 键值的行会被合并（在上面示例中为 Hour）。

对应的 materialized view 使用的是前面给出的查询：

```sql
CREATE MATERIALIZED VIEW unique_visitors_per_hour_mv TO unique_visitors_per_hour AS
SELECT toStartOfHour(Timestamp) AS Hour,
        uniqState(LogAttributes['remote_addr']::IPv4) AS UniqueUsers
FROM otel_logs
GROUP BY Hour
ORDER BY Hour DESC
```

注意我们在聚合函数名称末尾追加了后缀 `State`。这可以确保返回的是函数的聚合状态，而不是最终结果。该状态将包含额外信息，从而使这个部分状态可以与其他状态合并。

当通过重启 Collector 重新加载数据后，我们可以确认在 `unique_visitors_per_hour` 表中有 113 行数据可用。

```sql
SELECT count()
FROM unique_visitors_per_hour
FINAL
┌─count()─┐
│   113   │
└─────────┘

1 row in set. Elapsed: 0.009 sec.
```

我们的最终查询需要为这些函数使用带有 Merge 后缀的版本（因为这些列存储的是部分聚合状态）：

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

请注意，这里我们使用 `GROUP BY`，而不是 `FINAL`。


### 使用 materialized view（增量）进行快速查找 \{#using-materialized-views-incremental--for-fast-lookups\}

在选择 ClickHouse 的排序键时，应根据访问模式优先选择那些在过滤和聚合子句中经常使用的列。但在可观测性场景中，这可能会显得相当受限，因为用户的访问模式更加多样，无法用单一的一组列来概括。默认 OTel schema 中自带的一个示例就很好地说明了这一点。以 traces 的默认 schema 为例：

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

此模式已针对按 `ServiceName`、`SpanName` 和 `Timestamp` 进行过滤进行了优化。在追踪场景中，用户还需要能够根据特定的 `TraceId` 进行查找，并检索该追踪关联的 spans。虽然这已经包含在排序键中，但由于它位于末尾，[过滤效率不会那么高](/guides/best-practices/sparse-primary-indexes#ordering-key-columns-efficiently)，这很可能意味着在检索单个追踪时需要扫描大量数据。

OTel collector 还会安装一个 materialized view 以及相关联的表来解决这一问题。该表和 materialized view 如下所示：

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


该 VIEW 可以确保表 `otel_traces_trace_id_ts` 中保存了每个 trace 的最小和最大时间戳。该表按 `TraceId` 排序，从而能够高效地检索这些时间戳。随后，在查询主表 `otel_traces` 时即可利用这些时间戳范围。更具体地说，当通过 id 检索某个 trace 时，Grafana 会使用如下查询：

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

这里的 CTE 会先为 trace id `ae9226c78d1d360601e6383928e4d22d` 找出最小和最大时间戳，然后再利用这些时间戳过滤主表 `otel_traces` 中与之关联的 span。

同样的方法也可以应用于类似的访问模式。我们在数据建模部分的[此处](/materialized-view/incremental-materialized-view#lookup-table)中探讨了一个类似的示例。


### 使用 PROJECTION \{#using-projections\}

ClickHouse PROJECTION 允许您为一张表指定多个 `ORDER BY` 子句。

在前面的章节中,我们探讨了如何在 ClickHouse 中使用 materialized view 来预先计算聚合结果、转换行数据,并针对不同的访问模式优化可观测性查询。

我们提供了一个示例,其中 materialized view 将行发送到目标表,该目标表使用与接收插入数据的原始表不同的排序键,以优化按 trace id 查找的性能。

投影可用于解决同样的问题,允许用户针对不属于主键的列进行查询优化。

理论上,此功能可用于为表提供多个排序键,但有一个明显的缺点:数据重复。具体来说,数据需要按主主键的顺序写入,同时还需要按每个 PROJECTION 指定的顺序写入。这会降低插入速度并占用更多磁盘空间。

:::note PROJECTION 与 Materialized View 对比
PROJECTION 提供了许多与 materialized view 相同的功能,但应谨慎使用,通常更推荐后者。您应当了解各自的局限性以及适用场景。例如,虽然 PROJECTION 可用于预计算聚合,但我们建议用户使用 materialized view 来实现此目的。
:::

<Image img={observability_13} alt="可观测性与 PROJECTION" size="md" />

考虑以下查询,它根据 500 错误代码过滤 `otel_logs_v2` 表。这是日志记录中的常见访问模式,用户通常需要按错误代码进行过滤:

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
此处使用 `FORMAT Null` 不打印结果。这会强制读取所有结果但不返回,从而防止查询因 LIMIT 提前终止。这样做只是为了显示扫描全部 1000 万行所需的时间。
:::

上述查询需要对我们选择的排序键 `(ServiceName, Timestamp)` 进行线性扫描。虽然我们可以将 `Status` 添加到排序键的末尾来提高上述查询的性能,但我们也可以添加 PROJECTION。

```sql
ALTER TABLE otel_logs_v2 (
  ADD PROJECTION status
  (
     SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent ORDER BY Status
  )
)

ALTER TABLE otel_logs_v2 MATERIALIZE PROJECTION status
```

注意,我们必须先创建 PROJECTION,然后再将其物化。后一个命令会导致数据以两种不同的顺序在磁盘上存储两次。PROJECTION 也可以在创建数据时定义,如下所示,并且会在插入数据时自动维护。

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

需要注意的是,如果通过 `ALTER` 创建 projection,在执行 `MATERIALIZE PROJECTION` 命令时,其创建过程是异步的。您可以使用以下查询来确认此操作的进度,等待 `is_done=1`。

```sql
SELECT parts_to_do, is_done, latest_fail_reason
FROM system.mutations
WHERE (`table` = 'otel_logs_v2') AND (command LIKE '%MATERIALIZE%')

┌─parts_to_do─┬─is_done─┬─latest_fail_reason─┐
│           0 │     1   │                    │
└─────────────┴─────────┴────────────────────┘

1 row in set. Elapsed: 0.008 sec.
```

如果我们重复上述查询,可以看到性能已显著提升,代价是需要额外的存储空间(有关如何测量,请参阅[&quot;测量表大小和压缩率&quot;](#measuring-table-size--compression))。

```sql
SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent
FROM otel_logs_v2
WHERE Status = 500
FORMAT `Null`

0 rows in set. Elapsed: 0.031 sec. Processed 51.42 thousand rows, 22.85 MB (1.65 million rows/s., 734.63 MB/s.)
Peak memory usage: 27.85 MiB.
```

在上述示例中，我们在 PROJECTION 中指定了之前查询所使用的列。这样一来，只有这些指定的列会作为 PROJECTION 的一部分按 Status 排序存储到磁盘上。相反，如果我们在此处使用 `SELECT *`，则会将所有列都存储下来。虽然这可以让更多查询（使用任意列子集）受益于 PROJECTION，但会产生额外的存储开销。关于磁盘空间占用和压缩情况的测量，请参见[“Measuring table size &amp; compression”](#measuring-table-size--compression)。


### Secondary/data skipping indices \\{#secondarydata-skipping-indices\\}

无论在 ClickHouse 中主键调优得多好，某些查询仍然不可避免地需要对整张表进行全表扫描。虽然可以通过使用 materialized view（以及在某些查询中使用 projection）来缓解这一问题，但这会带来额外的维护开销，并且需要用户了解这些对象的存在才能确保真正利用上它们。传统关系型数据库通常通过二级索引来解决这一问题，但在像 ClickHouse 这样的列式数据库中，这类索引并不奏效。取而代之的是，ClickHouse 使用“跳过（Skip）索引”，通过允许数据库跳过不包含匹配值的大块数据，从而显著提升查询性能。

默认的 OTel 模式会尝试使用二级索引来加速对 map 的访问。虽然我们发现这些索引整体效果并不理想，因此不建议在自定义模式中照搬它们，但跳过索引在某些场景下仍然是有用的。

在尝试使用这些索引之前，应先阅读并理解[关于二级索引的指南](/optimize/skipping-indexes)。

**一般来说，当主键与目标的非主键列或表达式之间存在强相关性，并且用户查找的值较为稀有（即这些值只出现在很少的 granule 中）时，它们会更为有效。**

### 文本搜索的布隆过滤器 \{#bloom-filters-for-text-search\}

对于可观测性查询,当需要执行文本搜索时,辅助索引非常有用。 具体而言,基于 ngram 和 token 的布隆过滤器索引 [`ngrambf_v1`](/optimize/skipping-indexes#bloom-filter-types) 和 [`tokenbf_v1`](/optimize/skipping-indexes#bloom-filter-types) 可用于加速在 String 列上使用 `LIKE`、`IN` 和 hasToken 操作符的搜索。 需要注意的是,基于 token 的索引使用非字母数字字符作为分隔符来生成 token。 这意味着查询时只能匹配 token(或完整单词)。 若需要更细粒度的匹配,可以使用 [N-gram 布隆过滤器](/optimize/skipping-indexes#bloom-filter-types)。 它将字符串拆分为指定大小的 ngram,从而实现子词匹配。

要评估将生成并因此匹配的标记,可以使用 `tokens` 函数:

```sql
SELECT tokens('https://www.zanbil.ir/m/filter/b113')

┌─tokens────────────────────────────────────────────┐
│ ['https','www','zanbil','ir','m','filter','b113'] │
└───────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.008 sec.
```

`ngram` 函数提供了类似的功能，可以通过第二个参数指定 `ngram` 的大小：

```sql
SELECT ngrams('https://www.zanbil.ir/m/filter/b113', 3)

┌─ngrams('https://www.zanbil.ir/m/filter/b113', 3)────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ['htt','ttp','tps','ps:','s:/','://','//w','/ww','www','ww.','w.z','.za','zan','anb','nbi','bil','il.','l.i','.ir','ir/','r/m','/m/','m/f','/fi','fil','ilt','lte','ter','er/','r/b','/b1','b11','113'] │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.008 sec.
```

:::note 倒排索引
ClickHouse 对倒排索引作为二级索引提供了实验性支持。我们目前不建议将其用于日志数据集,但预计当其达到生产就绪状态时,将取代基于令牌的布隆过滤器。
:::

在本示例中,我们使用结构化日志数据集。假设我们希望统计 `Referer` 列中包含 `ultra` 的日志数量。

```sql
SELECT count()
FROM otel_logs_v2
WHERE Referer LIKE '%ultra%'

┌─count()─┐
│  114514 │
└─────────┘

1 row in set. Elapsed: 0.177 sec. Processed 10.37 million rows, 908.49 MB (58.57 million rows/s., 5.13 GB/s.)
```

这里我们需要匹配 ngram 大小为 3 的情况。因此我们创建一个 `ngrambf_v1` 索引。

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

此处的索引 `ngrambf_v1(3, 10000, 3, 7)` 接受四个参数。最后一个参数(值为 7)表示种子值。其他参数分别表示 ngram 大小(3)、值 `m`(过滤器大小)以及哈希函数数量 `k`(7)。`k` 和 `m` 需要调优,其取值取决于唯一 ngram/token 的数量以及过滤器产生真阴性结果的概率——从而确认某个值不存在于颗粒中。我们建议使用[这些函数](/engines/table-engines/mergetree-family/mergetree#bloom-filter)来帮助确定这些值。

如果调优得当，性能提升会非常显著：

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

:::note 示例说明
上述内容仅用于示例说明。我们建议用户在插入日志时就从日志中提取结构化信息，而不是尝试通过基于 token 的布隆过滤器来优化文本搜索。不过，在某些情况下，用户可能会有堆栈跟踪或其他较大的字符串字段，此时由于结构不够固定，文本搜索仍然可能有用。
:::

关于使用布隆过滤器的一些通用准则：

Bloom 过滤器的目标是过滤[颗粒（granules）](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design)，从而避免需要加载某个列的所有值并执行线性扫描。可以使用带有参数 `indexes=1` 的 `EXPLAIN` 子句来识别被跳过的颗粒数量。请参考下方针对原始表 `otel_logs_v2` 和带有 ngram Bloom 过滤器的表 `otel_logs_bloom` 的查询结果。

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

通常只有当布隆过滤器比列本身更小时，它才会更快。如果它更大，则性能提升通常可以忽略不计。使用以下查询比较过滤器与列的大小：


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

在上面的示例中，我们可以看到次级 Bloom 过滤器索引的大小为 12MB——仅约为该列本身压缩后 56MB 大小的五分之一。

Bloom 过滤器通常需要进行大量调优。我们建议参考[此处](/engines/table-engines/mergetree-family/mergetree#bloom-filter)的说明，以帮助识别最优设置。Bloom 过滤器在插入和合并操作时也可能带来较大开销。在将 Bloom 过滤器应用到生产环境之前，应评估其对写入性能的影响。

关于二级跳过索引的更多细节可以在[此处](/optimize/skipping-indexes#skip-index-functions)找到。


### 从 Map 中抽取 \\{#extracting-from-maps\\}

`Map` 类型在 OTel 模式中非常常见。此类型要求键和值具有相同的类型——这对于诸如 Kubernetes 标签之类的元数据来说已经足够。请注意，当查询 `Map` 类型的某个子键时，会加载整个父列。如果该 `Map` 包含大量键，那么相较于该键作为单独列存在的情况，这会导致需要从磁盘读取更多数据，从而带来显著的查询开销。

如果你经常查询某个特定键，请考虑将其移动到表的根级，作为独立的专用列。这通常是在完成部署并观察到常见访问模式之后才会进行的任务，在生产前往往难以预估。有关如何在部署后修改模式，请参阅[“管理模式变更”](/observability/managing-data#managing-schema-changes)。

## Measuring table size & compression \\{#measuring-table-size--compression\\}

ClickHouse 用于可观测性的主要原因之一是其出色的压缩能力。

除了显著降低存储成本之外，磁盘上的数据更少意味着更少的 I/O，以及更快的查询和写入。从 CPU 的角度来看，I/O 的减少足以抵消任何压缩算法带来的开销。因此，在确保 ClickHouse 查询足够快时，提高数据压缩率应当是首要关注点。

关于如何衡量压缩效果的详细信息，请参见[此处](/data-compression/compression-in-clickhouse)。