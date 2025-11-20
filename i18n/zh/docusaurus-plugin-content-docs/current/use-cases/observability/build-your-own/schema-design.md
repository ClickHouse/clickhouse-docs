---
title: '模式设计'
description: '为可观测性场景进行模式设计'
keywords: ['observability', 'logs', 'traces', 'metrics', 'OpenTelemetry', 'Grafana', 'OTel']
slug: /use-cases/observability/schema-design
show_related_blogs: true
doc_type: 'guide'
---

import observability_10 from '@site/static/images/use-cases/observability/observability-10.png';
import observability_11 from '@site/static/images/use-cases/observability/observability-11.png';
import observability_12 from '@site/static/images/use-cases/observability/observability-12.png';
import observability_13 from '@site/static/images/use-cases/observability/observability-13.png';
import Image from '@theme/IdealImage';


# 为可观测性设计模式

我们建议用户始终为日志和链路追踪创建自己的表结构（schema），原因如下：

- **选择主键** - 默认表结构使用的是针对特定访问模式优化的 `ORDER BY`。你的访问模式很可能与此并不一致。
- **抽取结构化信息** - 用户可能希望从现有列（例如 `Body` 列）中抽取新的列。这可以通过物化列（以及在更复杂场景中使用物化视图）来实现，这需要对表结构进行变更。
- **优化 Map** - 默认表结构使用 `Map` 类型来存储属性。这些列允许存储任意元数据。这一能力非常关键，因为事件的元数据通常无法提前完全定义，否则就可以直接存储在像 ClickHouse 这样强类型的数据库中。但访问 Map 的键及其值并不像访问普通列那样高效。我们通过修改表结构，并将最常访问的 Map 键提升为顶层列来解决这一问题——参见[“使用 SQL 抽取结构”](#extracting-structure-with-sql)。这需要修改表结构。
- **简化 Map 键访问** - 访问 Map 中的键需要更冗长的语法。用户可以通过别名来缓解这一问题。参见[“使用别名”](#using-aliases)以简化查询。
- **二级索引** - 默认表结构使用二级索引来加速对 Map 的访问并加速文本查询。这些通常不是必需的，并会占用额外磁盘空间。可以使用，但应通过测试确认其确有必要。参见[“二级 / 数据跳过索引”](#secondarydata-skipping-indices)。
- **使用 Codec** - 如果用户了解预期数据并有证据表明可以改进压缩效果，可能希望为某些列自定义 Codec。

_我们将在下文详细介绍上述每一个用例。_

**重要提示：** 虽然鼓励用户扩展和修改自己的表结构以获得最佳压缩率和查询性能，但在可能的情况下，核心列应尽量遵循 OTel 模式的命名规范。ClickHouse Grafana 插件假定存在一些基本的 OTel 列以协助构建查询，例如 `Timestamp` 和 `SeverityText`。日志和链路追踪所需的列分别记录在此处 [[1]](https://grafana.com/developers/plugin-tools/tutorials/build-a-logs-data-source-plugin#logs-data-frame-format)[[2]](https://grafana.com/docs/grafana/latest/explore/logs-integration/) 和[此处](https://grafana.com/docs/grafana/latest/explore/trace-integration/#data-frame-structure)。你可以选择更改这些列名，并在插件配置中覆盖默认值。



## 使用 SQL 提取结构 {#extracting-structure-with-sql}

无论摄取结构化日志还是非结构化日志,用户通常需要以下能力:

- **从字符串数据块中提取列**。查询这些列比在查询时使用字符串操作更快。
- **从映射中提取键**。默认模式将任意属性放入 Map 类型的列中。这种类型提供了无模式能力,其优势在于用户在定义日志和追踪时无需预先定义属性列——在从 Kubernetes 收集日志并希望保留 pod 标签以供后续搜索时,预先定义通常是不可能的。访问映射键及其值比查询普通 ClickHouse 列要慢。因此,将键从映射提取到根表列通常是更好的选择。

考虑以下查询:

假设我们希望使用结构化日志统计哪些 URL 路径接收的 POST 请求最多。JSON 数据块以字符串形式存储在 `Body` 列中。此外,如果用户在采集器中启用了 json_parser,它也可能以 `Map(String, String)` 形式存储在 `LogAttributes` 列中。

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

假设 `LogAttributes` 可用,统计站点哪些 URL 路径接收的 POST 请求最多的查询如下:

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

返回 5 行。耗时:0.735 秒。处理了 1036 万行,4.65 GB(1410 万行/秒,6.32 GB/秒)
峰值内存使用:153.71 MiB。
```

注意这里使用的映射语法,例如 `LogAttributes['request_path']`,以及用于从 URL 中去除查询参数的 [`path` 函数](/sql-reference/functions/url-functions#path)。

如果用户未在采集器中启用 JSON 解析,则 `LogAttributes` 将为空,这时我们需要使用 [JSON 函数](/sql-reference/functions/json-functions) 从字符串 `Body` 中提取列。

:::note 优先使用 ClickHouse 进行解析
我们通常建议用户在 ClickHouse 中对结构化日志执行 JSON 解析。我们确信 ClickHouse 是最快的 JSON 解析实现。但是,我们也理解用户可能希望将日志发送到其他目标,而不希望将此逻辑放在 SQL 中。
:::

```sql
SELECT path(JSONExtractString(Body, 'request_path')) AS path, count() AS c
FROM otel_logs
WHERE JSONExtractString(Body, 'request_type') = 'POST'
GROUP BY path
ORDER BY c DESC
LIMIT 5

```


┌─path─────────────────────┬─────c─┐
│ /m/updateVariation │ 12182 │
│ /site/productCard │ 11080 │
│ /site/productPrice │ 10876 │
│ /site/productAdditives │ 10866 │
│ /site/productModelImages │ 10866 │
└──────────────────────────┴───────┘

返回 5 行。用时:0.668 秒。已处理 1037 万行,5.13 GB(1552 万行/秒,7.68 GB/秒)。
内存峰值:172.30 MiB。

````

现在考虑对非结构化日志执行相同操作:

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

对非结构化日志执行类似查询需要通过 `extractAllGroupsVertical` 函数使用正则表达式。

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

解析非结构化日志的查询复杂度和成本增加(注意性能差异),这就是我们建议用户尽可能使用结构化日志的原因。

:::note 考虑使用字典
上述查询可以利用正则表达式字典进行优化。详情请参阅[使用字典](#using-dictionaries)。
:::

通过将上述查询逻辑移至插入时执行,可以使用 ClickHouse 满足这两种用例。下面我们将探讨几种方法,并说明每种方法的适用场景。

:::note 使用 OTel 还是 ClickHouse 进行处理?
用户也可以使用 OTel Collector 处理器和操作符执行处理,如[此处](/observability/integrating-opentelemetry#processing---filtering-transforming-and-enriching)所述。在大多数情况下,用户会发现 ClickHouse 在资源效率和速度方面明显优于 Collector 的处理器。在 SQL 中执行所有事件处理的主要缺点是将解决方案与 ClickHouse 耦合。例如,用户可能希望从 OTel Collector 将处理后的日志发送到其他目标(如 S3)。
:::

### 物化列 {#materialized-columns}

物化列提供了从其他列中提取结构的最简单解决方案。此类列的值始终在插入时计算,不能在 INSERT 查询中指定。

:::note 开销
物化列会产生额外的存储开销,因为在插入时会将值提取到磁盘上的新列中。
:::

物化列支持任何 ClickHouse 表达式,可以利用任何分析函数来[处理字符串](/sql-reference/functions/string-functions)(包括[正则表达式和搜索](/sql-reference/functions/string-search-functions))和 [URL](/sql-reference/functions/url-functions)、执行[类型转换](/sql-reference/functions/type-conversion-functions)、[从 JSON 中提取值](/sql-reference/functions/json-functions)或[数学运算](/sql-reference/functions/math-functions)。

我们建议将物化列用于基本处理。它们特别适用于从映射中提取值、将其提升为根列以及执行类型转换。当在非常基础的模式中使用或与物化视图结合使用时,它们通常最为有用。考虑以下日志模式,其中 Collector 已将 JSON 提取到 `LogAttributes` 列:


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

用于从 `String` 类型的 `Body` 中使用 JSON 函数提取数据的等效表结构可以在[这里](https://pastila.nl/?005cbb97/513b174a7d6114bf17ecc657428cf829#gqoOOiomEjIiG6zlWhE+Sg==)找到。

我们的三个物化列分别提取请求页面、请求类型以及引用来源的域名。它们访问 map 的键并对对应的值应用函数。我们后续的查询速度快得多：

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
默认情况下，`SELECT *` 不会返回物化列（materialized columns）。这是为了保证这样一个不变式：`SELECT *` 的结果始终可以通过 `INSERT` 重新插入到表中。可以通过设置 `asterisk_include_materialized_columns=1` 来关闭这一行为，并且可以在 Grafana 中启用该设置（参见数据源配置中的 `Additional Settings -> Custom Settings`）。
:::


## 物化视图 {#materialized-views}

[物化视图](/materialized-views)提供了一种更强大的方式,可以对日志和追踪数据应用 SQL 过滤和转换。

物化视图允许用户将计算成本从查询时转移到插入时。ClickHouse 物化视图本质上是一个触发器,在数据块插入表时对其执行查询。查询结果会被插入到第二个"目标"表中。

<Image img={observability_10} alt='Materialized view' size='md' />

:::note 实时更新
ClickHouse 中的物化视图会随着数据流入其所基于的表而实时更新,其功能更像是持续更新的索引。相比之下,其他数据库中的物化视图通常是查询的静态快照,必须手动刷新(类似于 ClickHouse 的可刷新物化视图)。
:::

与物化视图关联的查询理论上可以是任何查询,包括聚合查询,尽管[连接操作存在一些限制](https://clickhouse.com/blog/using-materialized-views-in-clickhouse#materialized-views-and-joins)。对于日志和追踪数据所需的转换和过滤工作负载,用户可以使用任何 `SELECT` 语句。

用户应该记住,查询只是一个触发器,对插入到表(源表)中的行执行操作,并将结果发送到新表(目标表)。

为了确保不会重复持久化数据(在源表和目标表中),我们可以将源表的表引擎更改为 [Null 表引擎](/engines/table-engines/special/null),同时保留原始模式。我们的 OTel 采集器将继续向该表发送数据。例如,对于日志,`otel_logs` 表变为:

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

Null 表引擎是一种强大的优化手段 - 可以将其视为 `/dev/null`。该表不会存储任何数据,但在丢弃插入的行之前,仍会对其执行所有附加的物化视图。

考虑以下查询。该查询将我们的行转换为希望保留的格式,从 `LogAttributes` 中提取所有列(我们假设这是由采集器使用 `json_parser` 操作符设置的),设置 `SeverityText` 和 `SeverityNumber`(基于一些简单条件和[这些列的定义](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-severitytext))。在这种情况下,我们还只选择已知会被填充的列 - 忽略诸如 `TraceId`、`SpanId` 和 `TraceFlags` 等列。


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

返回 1 行。用时:0.027 秒。
```

我们还提取了上面的 `Body` 列——以防之后添加了我们的 SQL 尚未提取的其他属性。该列在 ClickHouse 中应该能够获得很好的压缩效果，而且访问频率很低，因此不会影响查询性能。最后，我们通过一次类型转换将 `Timestamp` 降为 `DateTime`（以节省空间——参见 [&quot;Optimizing Types&quot;](#optimizing-types)）。

:::note Conditionals
请注意上面使用了 [conditionals](/sql-reference/functions/conditional-functions) 来提取 `SeverityText` 和 `SeverityNumber`。这些函数在构造复杂条件以及检查 map 中是否设置了值时非常有用——这里我们简单地假设 `LogAttributes` 中存在所有键。我们建议用户熟悉这些函数——在日志解析中，它们是你可靠的帮手，并且可以与处理 [null values](/sql-reference/functions/functions-for-nulls) 的函数配合使用！
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

此处选择的类型基于[《优化类型》](#optimizing-types)中讨论的优化。

:::note
请注意，我们已经对模式做了较大幅度的调整。实际场景中，用户很可能还会有希望保留的 Trace 列，以及 `ResourceAttributes` 列（通常包含 Kubernetes 元数据）。Grafana 可以利用这些 Trace 列在日志和追踪之间提供跳转关联功能——参见[《使用 Grafana》](/observability/grafana)。
:::


下面，我们创建一个物化视图 `otel_logs_mv`，它对 `otel_logs` 表执行上述查询，并将结果写入 `otel_logs_v2`。

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

上面的内容可视化如下所示：

<Image img={observability_11} alt="Otel MV" size="md" />

如果我们现在重启 [&quot;Exporting to ClickHouse&quot;](/observability/integrating-opentelemetry#exporting-to-clickhouse) 中使用的 collector 配置，数据就会以期望的格式出现在 `otel_logs_v2` 中。请注意这里使用了带类型的 JSON 提取函数。

```sql
SELECT *
FROM otel_logs_v2
LIMIT 1
FORMAT Vertical

第 1 行:
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

结果集包含 1 行。用时:0.010 秒。
```

下面展示了一个等效的物化视图，它依赖使用 JSON 函数从 `Body` 列中提取各个字段：


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

### 注意类型问题 {#beware-types}

上述物化视图依赖隐式类型转换——尤其是在使用 `LogAttributes` 映射时。ClickHouse 通常会自动将提取的值转换为目标表的类型,从而简化语法。但是,我们建议用户始终通过视图的 `SELECT` 语句配合 [`INSERT INTO`](/sql-reference/statements/insert-into) 语句向使用相同模式的目标表插入数据来测试视图。这可以确认类型是否被正确处理。以下情况需要特别注意:

- 如果映射中不存在某个键,将返回空字符串。对于数值类型,用户需要将这些空字符串映射为合适的值。可以通过[条件函数](/sql-reference/functions/conditional-functions)实现,例如 `if(LogAttributes['status'] = ", 200, LogAttributes['status'])`;如果可以接受默认值,也可以使用[类型转换函数](/sql-reference/functions/type-conversion-functions),例如 `toUInt8OrDefault(LogAttributes['status'] )`
- 某些类型并不总是会被转换,例如数值的字符串表示不会被转换为枚举值。
- 如果未找到值,JSON 提取函数会返回该类型的默认值。请确保这些默认值符合预期!

:::note 避免使用 Nullable
在 ClickHouse 中处理可观测性数据时应避免使用 [Nullable](/sql-reference/data-types/nullable)。在日志和追踪数据中很少需要区分空值和 null。该特性会产生额外的存储开销,并对查询性能产生负面影响。更多详情请参见[此处](/data-modeling/schema-design#optimizing-types)。
:::


## 选择主键(排序键) {#choosing-a-primary-ordering-key}

提取所需列后,您可以开始优化排序键/主键。

可以应用一些简单的规则来帮助选择排序键。以下规则有时可能会相互冲突,因此请按顺序考虑。用户可以通过此过程确定多个键,通常 4-5 个就足够了:

1. 选择与常见过滤条件和访问模式相符的列。如果用户通常通过特定列(例如 pod 名称)进行过滤来开始可观测性调查,则该列将在 `WHERE` 子句中频繁使用。优先将这些列包含在键中,而不是那些使用频率较低的列。
2. 优先选择在过滤时能够排除大部分总行数的列,从而减少需要读取的数据量。服务名称和状态码通常是不错的候选项 - 对于后者,仅当用户按能够排除大多数行的值进行过滤时才适用,例如按 200 状态码过滤在大多数系统中会匹配大部分行,而按 500 错误过滤则只对应一小部分行。
3. 优先选择可能与表中其他列高度相关的列。这将有助于确保这些值也连续存储,从而提高压缩率。
4. 对排序键中的列执行 `GROUP BY` 和 `ORDER BY` 操作可以更高效地利用内存。

<br />

在确定排序键的列子集后,必须按特定顺序声明它们。此顺序会显著影响查询中对次要键列的过滤效率以及表数据文件的压缩率。一般来说,**最好按基数升序排列键**。这需要与以下事实进行权衡:对排序键中较后出现的列进行过滤的效率将低于对元组中较早出现的列进行过滤。平衡这些行为并考虑您的访问模式。最重要的是,测试不同的变体。要进一步了解排序键及其优化方法,我们推荐阅读[这篇文章](/guides/best-practices/sparse-primary-indexes)。

:::note 先确定结构
我们建议在结构化日志后再决定排序键。不要在排序键中使用属性映射中的键或 JSON 提取表达式。确保将排序键作为表中的根列。
:::


## 使用 Map {#using-maps}

前面的示例展示了如何使用 Map 语法 `map['key']` 来访问 `Map(String, String)` 列中的值。除了使用 Map 表示法访问嵌套键之外,ClickHouse 还提供了专门的 [Map 函数](/sql-reference/functions/tuple-map-functions#mapkeys)用于过滤或选择这些列。

例如,以下查询使用 [`mapKeys` 函数](/sql-reference/functions/tuple-map-functions#mapkeys)和 [`groupArrayDistinctArray` 函数](/sql-reference/aggregate-functions/combinators)(一个组合器)来识别 `LogAttributes` 列中所有可用的唯一键。

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
我们不建议在 Map 列名中使用点号,并可能在未来弃用这种用法。请使用 `_`。
:::


## 使用别名 {#using-aliases}

查询 Map 类型比查询普通列慢 - 请参阅["加速查询"](#accelerating-queries)。此外,Map 类型的语法更复杂,用户编写起来可能比较繁琐。为了解决后一个问题,我们建议使用别名列。

ALIAS 列在查询时计算,不会存储在表中。因此,无法向此类型的列 INSERT 值。使用别名可以引用 Map 键并简化语法,将 Map 条目透明地暴露为普通列。请看以下示例:

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

我们有几个物化列和一个 `ALIAS` 列 `RemoteAddr`,它访问 Map `LogAttributes`。现在我们可以通过此列查询 `LogAttributes['remote_addr']` 的值,从而简化查询,即:

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

返回 5 行。耗时:0.011 秒。
```

此外,通过 `ALTER TABLE` 命令添加 `ALIAS` 非常简单。这些列立即可用,例如:

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

返回 5 行。耗时:0.014 秒。
```

:::note 默认排除别名列
默认情况下,`SELECT *` 会排除 ALIAS 列。可以通过设置 `asterisk_include_alias_columns=1` 来禁用此行为。
:::


## 优化数据类型 {#optimizing-types}

[ClickHouse 数据类型优化的通用最佳实践](/data-modeling/schema-design#optimizing-types)同样适用于 ClickHouse 的可观测性场景。


## 使用编解码器 {#using-codecs}

除了类型优化之外,在优化 ClickHouse 可观测性架构的压缩时,用户还可以遵循[编解码器的通用最佳实践](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec)。

通常情况下,用户会发现 `ZSTD` 编解码器非常适用于日志和追踪数据集。将压缩级别从默认值 1 提高可能会改善压缩效果。但是,这需要进行测试,因为更高的值会在插入时产生更大的 CPU 开销。通常,我们发现提高此值带来的收益很小。

此外,时间戳虽然在压缩方面受益于增量编码,但如果将此列用于主键/排序键,已被证明会导致查询性能下降。我们建议用户权衡压缩与查询性能之间的取舍。


## 使用字典 {#using-dictionaries}

[字典](/sql-reference/dictionaries)是 ClickHouse 的一项[核心功能](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse),它提供了来自各种内部和外部[数据源](/sql-reference/dictionaries#dictionary-sources)的数据的内存[键值](https://en.wikipedia.org/wiki/Key%E2%80%93value_database)表示,专为超低延迟查找查询而优化。

<Image img={observability_12} alt='可观测性与字典' size='md' />

这在多种场景中都非常实用,既可以在不影响数据摄取速度的情况下即时丰富摄取的数据,又能全面提升查询性能,尤其是 JOIN 操作。
虽然在可观测性场景中很少需要连接操作,但字典在数据丰富方面仍然非常有用——无论是在插入时还是查询时。下面我们将提供这两种情况的示例。

:::note 加速连接操作
对使用字典加速连接操作感兴趣的用户可以在[此处](/dictionary)找到更多详细信息。
:::

### 插入时 vs 查询时 {#insert-time-vs-query-time}

字典可用于在查询时或插入时丰富数据集。这两种方法各有利弊。总结如下:

- **插入时** - 如果丰富值不会改变且存在于可用于填充字典的外部数据源中,这种方式通常比较合适。在这种情况下,在插入时丰富数据行可以避免查询时对字典的查找。但这会以插入性能为代价,并带来额外的存储开销,因为丰富后的值将作为列存储。
- **查询时** - 如果字典中的值经常变化,查询时查找通常更适用。这样可以避免在映射值变化时需要更新列(并重写数据)。这种灵活性是以查询时查找成本为代价的。如果需要对大量行进行查找,例如在过滤子句中使用字典查找,这种查询时成本通常会比较明显。而对于结果丰富,即在 `SELECT` 中使用,这种开销通常可以忽略不计。

我们建议用户熟悉字典的基础知识。字典提供了一个内存查找表,可以使用专用的[特定函数](/sql-reference/functions/ext-dict-functions#dictgetall)从中检索值。

有关简单的数据丰富示例,请参阅[此处](/dictionary)的字典指南。下面,我们重点介绍常见的可观测性数据丰富任务。

### 使用 IP 字典 {#using-ip-dictionaries}

使用 IP 地址为日志和追踪数据添加经纬度值进行地理位置丰富是一个常见的可观测性需求。我们可以使用 `ip_trie` 结构化字典来实现这一点。

我们使用由 [DB-IP.com](https://db-ip.com/) 根据 [CC BY 4.0 许可证](https://creativecommons.org/licenses/by/4.0/)条款提供的公开可用的 [DB-IP 城市级数据集](https://github.com/sapics/ip-location-db#db-ip-database-update-monthly)。

从[自述文件](https://github.com/sapics/ip-location-db#csv-format)中,我们可以看到数据的结构如下:

```csv
| ip_range_start | ip_range_end | country_code | state1 | state2 | city | postcode | latitude | longitude | timezone |
```

基于这种结构,让我们首先使用 [url()](/sql-reference/table-functions/url) 表函数查看一下数据:

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

为了简化操作,让我们使用 [`URL()`](/engines/table-engines/special/url) 表引擎创建一个带有字段名称的 ClickHouse 表对象,并确认总行数:


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

由于我们的 `ip_trie` 字典要求用 CIDR 记法表示 IP 地址范围，因此需要对 `ip_range_start` 和 `ip_range_end` 进行转换。

每个范围对应的 CIDR 可以通过以下查询简洁地计算出来：

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
上面的查询做了不少事情。感兴趣的读者可以阅读这篇很好的[说明](https://clickhouse.com/blog/geolocating-ips-in-clickhouse-and-grafana#using-bit-functions-to-convert-ip-ranges-to-cidr-notation)。如果不想深入细节，可以简单理解为：它为一个 IP 范围计算出了对应的 CIDR。
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

为了在 ClickHouse 中实现低延迟的 IP 查询，我们将利用字典在内存中存储 Geo IP 数据的键到属性的映射。ClickHouse 提供了一个 `ip_trie` [字典结构](/sql-reference/dictionaries#ip_trie)，用于将网络前缀（CIDR 块）映射到坐标和国家代码。下面的查询使用这种结构，并以上述表作为数据源来定义一个字典。

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

我们可以从字典中选取行，并确认该数据集可用于查询：

```sql
SELECT * FROM ip_trie LIMIT 3
```


┌─cidr───────┬─latitude─┬─longitude─┬─country&#95;code─┐
│ 1.0.0.0/22 │  26.0998 │   119.297 │ CN           │
│ 1.0.0.0/24 │ -27.4767 │   153.017 │ AU           │
│ 1.0.4.0/22 │ -38.0267 │   145.301 │ AU           │
└────────────┴──────────┴───────────┴──────────────┘

3 行结果。耗时 4.662 秒。

````

:::note 定期刷新
ClickHouse 中的字典会根据底层表数据和上述使用的 lifetime 子句定期刷新。要更新我们的 Geo IP 字典以反映 DB-IP 数据集中的最新变化,只需将 geoip_url 远程表中的数据重新插入到 `geoip` 表中并应用转换即可。
:::

现在我们已经将 Geo IP 数据加载到 `ip_trie` 字典中(该字典也命名为 `ip_trie`),就可以使用它进行 IP 地理位置定位了。可以通过 [`dictGet()` 函数](/sql-reference/functions/ext-dict-functions)来实现,如下所示:

```sql
SELECT dictGet('ip_trie', ('country_code', 'latitude', 'longitude'), CAST('85.242.48.167', 'IPv4')) AS ip_details

┌─ip_details──────────────┐
│ ('PT',38.7944,-9.34284) │
└─────────────────────────┘

1 row in set. Elapsed: 0.003 sec.
````

注意这里的检索速度。这使我们可以对日志进行增强。在这个例子中，我们选择**在查询时进行增强**。

回到我们最初的日志数据集，我们可以利用上述方法按国家聚合日志。下面假设我们使用的是之前物化视图生成的 schema，其中包含一个已提取出的 `RemoteAddress` 列。

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

返回 5 行。耗时:0.140 秒。处理了 2073 万行,82.92 MB(1.4779 亿行/秒,591.16 MB/秒)。
峰值内存使用量:1.16 MiB。
```

由于 IP 到地理位置的映射可能会发生变化，用户通常希望了解请求在发出时是从哪里来的，而不是该地址当前对应的地理位置。基于这一点，这里更适合在写入（索引）阶段进行富化。可以通过如下所示的 `materialized` 列来实现，或者在 `materialized view` 的 `select` 子句中实现：

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
用户通常希望基于新数据定期更新 IP 富化字典。这可以通过字典的 `LIFETIME` 子句实现,该子句会使字典从底层表定期重新加载。要更新底层表,请参阅["可刷新物化视图"](/materialized-view/refreshable-materialized-view)。
:::

上述国家和坐标信息提供了超越按国家分组和过滤的可视化能力。如需了解更多示例,请参阅["可视化地理数据"](/observability/grafana#visualizing-geo-data)。

### 使用正则表达式字典(用户代理解析) {#using-regex-dictionaries-user-agent-parsing}

[用户代理字符串](https://en.wikipedia.org/wiki/User_agent)的解析是一个经典的正则表达式问题,也是基于日志和追踪数据集的常见需求。ClickHouse 使用正则表达式树字典提供高效的用户代理解析能力。

在 ClickHouse 开源版本中,正则表达式树字典使用 YAMLRegExpTree 字典源类型定义,该类型提供包含正则表达式树的 YAML 文件路径。如果您希望提供自己的正则表达式字典,可以在[此处](/sql-reference/dictionaries#use-regular-expression-tree-dictionary-in-clickhouse-open-source)找到所需结构的详细信息。下面我们重点介绍使用 [uap-core](https://github.com/ua-parser/uap-core) 进行用户代理解析,并为支持的 CSV 格式加载字典。此方法与开源版本和 ClickHouse Cloud 兼容。

:::note
在下面的示例中,我们使用 2024 年 6 月的最新 uap-core 正则表达式快照进行用户代理解析。最新文件会不定期更新,可以在[此处](https://raw.githubusercontent.com/ua-parser/uap-core/master/regexes.yaml)找到。用户可以按照[此处](/sql-reference/dictionaries#collecting-attribute-values)的步骤将其加载到下面使用的 CSV 文件中。
:::

创建以下 Memory 表。这些表用于保存解析设备、浏览器和操作系统的正则表达式。

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

可以使用 url 表函数从以下公开托管的 CSV 文件填充这些表:

```sql
INSERT INTO regexp_os SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_os.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')

INSERT INTO regexp_device SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_device.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')

INSERT INTO regexp_browser SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_browser.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')
```

在填充内存表后,我们可以加载正则表达式字典。请注意,我们需要将键值指定为列 - 这些将是我们可以从用户代理中提取的属性。

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


加载好这些字典之后，我们就可以提供一个示例 `user-agent` 来测试新的字典抽取功能：

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

鉴于与 user agent 相关的规则很少变化，而该字典只需在出现新的浏览器、操作系统和设备时才更新，因此在插入时就完成这种解析是合理的。

我们可以通过使用一个 `MATERIALIZED` 列或一个 `MATERIALIZED VIEW` 来完成这项工作。下面我们来修改之前使用的 `MATERIALIZED VIEW`：

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

这需要我们修改目标表 `otel_logs_v2` 的模式定义：

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

根据先前记录的步骤重新启动采集器并导入结构化日志后，我们就可以查询新提取的 `Device`、`Browser` 和 `OS` 列了。


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

:::note 复杂结构的元组
注意这些用户代理列使用了元组。对于层次结构预先已知的复杂结构,推荐使用元组。子列提供与常规列相同的性能(不同于 Map 键),同时支持异构类型。
:::

### 延伸阅读 {#further-reading}

有关字典的更多示例和详细信息,推荐阅读以下文章:

- [字典高级主题](/dictionary#advanced-dictionary-topics)
- ["使用字典加速查询"](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)
- [字典](/sql-reference/dictionaries)


## 加速查询 {#accelerating-queries}

ClickHouse 支持多种加速查询性能的技术。以下技术应仅在选择了合适的主键/排序键以优化最常见的访问模式并最大化压缩率之后再考虑使用。通常情况下,这样做能以最小的工作量获得最大的性能提升。

### 使用物化视图(增量)进行聚合 {#using-materialized-views-incremental-for-aggregations}

在前面的章节中,我们探讨了使用物化视图进行数据转换和过滤。然而,物化视图还可以用于在插入时预计算聚合并存储结果。该结果可以随着后续插入的结果进行更新,从而有效地实现在插入时预计算聚合。

这里的核心思想是,结果通常是原始数据的更小表示形式(在聚合的情况下是部分草图)。当与从目标表读取结果的更简单查询相结合时,查询时间将比在原始数据上执行相同计算要快。

考虑以下查询,我们使用结构化日志计算每小时的总流量:

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

返回 5 行。耗时:0.666 秒。处理了 1037 万行,4.73 GB(1556 万行/秒,7.10 GB/秒)
峰值内存使用:1.40 MiB。
```

我们可以想象这可能是用户使用 Grafana 绘制的常见折线图。诚然,这个查询非常快——数据集只有 1000 万行,而且 ClickHouse 本身就很快!然而,如果我们将其扩展到数十亿甚至数万亿行,我们理想情况下希望能保持这种查询性能。

:::note
如果我们使用 `otel_logs_v2` 表,此查询将快 10 倍,该表是我们之前的物化视图的结果,它从 `LogAttributes` 映射中提取了 size 键。我们在这里使用原始数据仅用于演示目的,如果这是一个常见查询,我们建议使用之前的视图。
:::

如果我们想使用物化视图在插入时计算这个结果,我们需要一个表来接收结果。该表每小时应该只保留 1 行。如果收到现有小时的更新,其他列应该合并到现有小时的行中。为了实现这种增量状态的合并,必须为其他列存储部分状态。

这需要 ClickHouse 中的一种特殊引擎类型:SummingMergeTree。它将具有相同排序键的所有行替换为一行,其中包含数值列的求和值。以下表将合并具有相同日期的任何行,对所有数值列求和。

```sql
CREATE TABLE bytes_per_hour
(
  `Hour` DateTime,
  `TotalBytes` UInt64
)
ENGINE = SummingMergeTree
ORDER BY Hour
```

为了演示我们的物化视图,假设我们的 `bytes_per_hour` 表是空的且尚未接收任何数据。我们的物化视图对插入到 `otel_logs` 的数据执行上述 `SELECT`(这将在配置大小的数据块上执行),结果发送到 `bytes_per_hour`。语法如下所示:

```sql
CREATE MATERIALIZED VIEW bytes_per_hour_mv TO bytes_per_hour AS
SELECT toStartOfHour(Timestamp) AS Hour,
       sum(toUInt64OrDefault(LogAttributes['size'])) AS TotalBytes
FROM otel_logs
GROUP BY Hour
```

这里的 `TO` 子句是关键,它指定了结果将发送到哪里,即 `bytes_per_hour`。

如果我们重启 OTel Collector 并重新发送日志,`bytes_per_hour` 表将使用上述查询结果进行增量填充。完成后,我们可以确认 `bytes_per_hour` 的大小——我们应该每小时有 1 行:

```sql
SELECT count()
FROM bytes_per_hour
FINAL

```


┌─count()─┐
│ 113 │
└─────────┘

1 row in set. Elapsed: 0.039 sec.

````

通过存储查询结果,我们有效地将行数从 1000 万行(在 `otel_logs` 中)减少到 113 行。关键在于,当新日志插入到 `otel_logs` 表时,新值会被发送到 `bytes_per_hour` 对应的小时记录中,并在后台自动异步合并 - 通过每小时仅保留一行,`bytes_per_hour` 将始终保持精简且实时更新。

由于行合并是异步进行的,用户查询时每小时可能存在多行记录。为确保查询时合并所有待处理的行,我们有两个选择:

- 在表名上使用 [`FINAL` 修饰符](/sql-reference/statements/select/from#final-modifier)(我们在上面的计数查询中使用了此方法)。
- 按最终表中使用的排序键(即 Timestamp)进行聚合并对指标求和。

通常,第二个选项更高效且更灵活(该表可用于其他用途),但第一个选项对某些查询来说可能更简单。下面展示这两种方法:

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
````

这将查询速度从 0.6 秒提升到 0.008 秒 - 提升超过 75 倍!

:::note
在更大的数据集和更复杂的查询中,性能提升可能更加显著。请参阅[此处](https://github.com/ClickHouse/clickpy)的示例。
:::

#### 更复杂的示例 {#a-more-complex-example}

上面的示例使用 [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree) 对每小时的简单计数进行聚合。对于简单求和之外的统计需求,需要使用不同的目标表引擎:[AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree)。

假设我们希望计算每天的唯一 IP 地址数(或唯一用户数)。查询如下:

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

为了持久化基数计数以支持增量更新,需要使用 AggregatingMergeTree。

```sql
CREATE TABLE unique_visitors_per_hour
(
  `Hour` DateTime,
  `UniqueUsers` AggregateFunction(uniq, IPv4)
)
ENGINE = AggregatingMergeTree
ORDER BY Hour
```


为了确保 ClickHouse 知道将存储聚合状态,我们将 `UniqueUsers` 列定义为 [`AggregateFunction`](/sql-reference/data-types/aggregatefunction) 类型,指定部分状态的函数来源(uniq)和源列的类型(IPv4)。与 SummingMergeTree 类似,具有相同 `ORDER BY` 键值的行将被合并(在上述示例中为 Hour)。

关联的物化视图使用之前的查询:

```sql
CREATE MATERIALIZED VIEW unique_visitors_per_hour_mv TO unique_visitors_per_hour AS
SELECT toStartOfHour(Timestamp) AS Hour,
        uniqState(LogAttributes['remote_addr']::IPv4) AS UniqueUsers
FROM otel_logs
GROUP BY Hour
ORDER BY Hour DESC
```

注意我们在聚合函数末尾添加了后缀 `State`。这样可以确保返回函数的聚合状态而非最终结果。该状态将包含额外信息,以便此部分状态能够与其他状态合并。

通过重启 Collector 重新加载数据后,我们可以确认 `unique_visitors_per_hour` 表中有 113 行数据。

```sql
SELECT count()
FROM unique_visitors_per_hour
FINAL
┌─count()─┐
│   113   │
└─────────┘

1 row in set. Elapsed: 0.009 sec.
```

我们的最终查询需要为函数使用 Merge 后缀(因为列中存储的是部分聚合状态):

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

注意这里我们使用 `GROUP BY` 而不是 `FINAL`。

### 使用物化视图(增量)进行快速查找 {#using-materialized-views-incremental--for-fast-lookups}

用户在选择 ClickHouse 排序键时应考虑其访问模式,选择在过滤和聚合子句中频繁使用的列。这在可观测性场景中可能存在局限性,因为用户的访问模式更加多样化,无法用单一列集合来概括。默认 OTel 模式中内置的示例很好地说明了这一点。以 traces 的默认模式为例:


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

该模式针对按 `ServiceName`、`SpanName` 和 `Timestamp` 进行过滤进行了优化。在链路追踪场景中，用户还需要能够根据特定的 `TraceId` 进行查找，并检索该 trace 关联的 spans。尽管这包含在排序键中，但由于它位于末尾，[过滤效率不会那么高](/guides/best-practices/sparse-primary-indexes#ordering-key-columns-efficiently)，因此在检索单个 trace 时很可能需要扫描大量数据。

为了解决这一问题，OTel collector 还会创建一个物化视图及其关联的表。该表和视图如下所示：

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

该视图确保表 `otel_traces_trace_id_ts` 记录了每个 trace 的最小和最大时间戳。该表按 `TraceId` 排序，因此可以高效地检索这些时间戳。这些时间戳范围随后可以在查询主表 `otel_traces` 时使用。更具体地说，在通过 id 检索某个 trace 时，Grafana 使用如下查询：


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

此处的 CTE 识别跟踪 ID `ae9226c78d1d360601e6383928e4d22d` 的最小和最大时间戳,然后使用这些时间戳过滤主表 `otel_traces` 以获取其关联的 span。

相同的方法可以应用于类似的访问模式。我们在数据建模[此处](/materialized-view/incremental-materialized-view#lookup-table)探讨了一个类似的示例。

### 使用投影 {#using-projections}

ClickHouse 投影允许用户为一个表指定多个 `ORDER BY` 子句。

在前面的章节中,我们探讨了如何在 ClickHouse 中使用物化视图来预计算聚合、转换行以及针对不同访问模式优化可观测性查询。

我们提供了一个示例,其中物化视图将行发送到目标表,该目标表使用与接收插入的原始表不同的排序键,以优化按跟踪 ID 进行的查找。

投影可用于解决相同的问题,允许用户优化对不属于主键的列的查询。

理论上,此功能可用于为表提供多个排序键,但有一个明显的缺点:数据重复。具体来说,除了为每个投影指定的顺序外,数据还需要按主主键的顺序写入。这将降低插入速度并消耗更多磁盘空间。

:::note 投影与物化视图
投影提供了许多与物化视图相同的功能,但应谨慎使用,通常首选后者。用户应了解其缺点以及何时适合使用。例如,虽然投影可用于预计算聚合,但我们建议用户使用物化视图来实现此目的。
:::

<Image img={observability_13} alt='可观测性与投影' size='md' />

考虑以下查询,它按 500 错误代码过滤我们的 `otel_logs_v2` 表。这可能是日志记录的常见访问模式,用户希望按错误代码进行过滤:

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
我们在此处使用 `FORMAT Null` 不打印结果。这会强制读取所有结果但不返回,从而防止由于 LIMIT 导致查询提前终止。这只是为了显示扫描所有 1000 万行所需的时间。
:::

上述查询需要使用我们选择的排序键 `(ServiceName, Timestamp)` 进行线性扫描。虽然我们可以将 `Status` 添加到排序键的末尾以提高上述查询的性能,但我们也可以添加投影。

```sql
ALTER TABLE otel_logs_v2 (
  ADD PROJECTION status
  (
     SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent ORDER BY Status
  )
)

ALTER TABLE otel_logs_v2 MATERIALIZE PROJECTION status
```

请注意,我们必须首先创建投影,然后将其物化。后一个命令会导致数据以两种不同的顺序在磁盘上存储两次。投影也可以在创建数据时定义,如下所示,并且会在插入数据时自动维护。


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

需要注意的是,如果投影是通过 `ALTER` 创建的,那么在执行 `MATERIALIZE PROJECTION` 命令时,其创建过程是异步的。用户可以通过以下查询确认此操作的进度,等待 `is_done=1`。

```sql
SELECT parts_to_do, is_done, latest_fail_reason
FROM system.mutations
WHERE (`table` = 'otel_logs_v2') AND (command LIKE '%MATERIALIZE%')

┌─parts_to_do─┬─is_done─┬─latest_fail_reason─┐
│           0 │     1   │                    │
└─────────────┴─────────┴────────────────────┘

1 row in set. Elapsed: 0.008 sec.
```

如果我们重复执行上述查询,可以看到性能显著提升,代价是需要额外的存储空间(有关如何测量存储空间,请参阅["测量表大小和压缩率"](#measuring-table-size--compression))。

```sql
SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent
FROM otel_logs_v2
WHERE Status = 500
FORMAT `Null`

0 rows in set. Elapsed: 0.031 sec. Processed 51.42 thousand rows, 22.85 MB (1.65 million rows/s., 734.63 MB/s.)
Peak memory usage: 27.85 MiB.
```

在上述示例中,我们在投影中指定了早期查询中使用的列。这意味着只有这些指定的列会作为投影的一部分存储在磁盘上,并按 Status 排序。如果我们在这里使用 `SELECT *`,则会存储所有列。虽然这将允许更多查询(使用任意列子集)从投影中受益,但会产生额外的存储开销。有关测量磁盘空间和压缩率的信息,请参阅["测量表大小和压缩率"](#measuring-table-size--compression)。

### 二级索引/数据跳过索引 {#secondarydata-skipping-indices}

无论在 ClickHouse 中如何优化主键,某些查询不可避免地需要全表扫描。虽然可以使用物化视图(以及针对某些查询的投影)来缓解这一问题,但这些方法需要额外的维护,并且用户需要了解它们的可用性才能确保被充分利用。传统关系型数据库通过二级索引来解决这个问题,但在像 ClickHouse 这样的列式数据库中,二级索引效果不佳。相反,ClickHouse 使用"跳过"索引,通过允许数据库跳过不包含匹配值的大块数据,可以显著提升查询性能。

默认的 OTel 模式使用二级索引来尝试加速映射访问。虽然我们发现这些索引通常效果不佳,不建议将它们复制到自定义模式中,但跳过索引仍然可能有用。

用户在尝试应用这些索引之前,应该阅读并理解[二级索引指南](/optimize/skipping-indexes)。

**一般来说,当主键与目标非主键列/表达式之间存在强相关性,并且用户查找的是罕见值(即不在许多颗粒中出现的值)时,跳过索引是有效的。**

### 用于文本搜索的布隆过滤器 {#bloom-filters-for-text-search}


对于可观测性查询，当用户需要执行文本搜索时，二级索引会很有用。具体来说，基于 ngram 和 token 的布隆过滤器索引 [`ngrambf_v1`](/optimize/skipping-indexes#bloom-filter-types) 和 [`tokenbf_v1`](/optimize/skipping-indexes#bloom-filter-types) 可用于加速在 String 列上使用 `LIKE`、`IN` 和 `hasToken` 运算符的搜索。需要注意的是，基于 token 的索引用非字母数字字符作为分隔符来生成 token。这意味着在查询时只能匹配 token（或完整单词）。如果需要更细粒度的匹配，可以使用 [N-gram 布隆过滤器](/optimize/skipping-indexes#bloom-filter-types)。它会将字符串拆分为指定大小的 ngram，从而支持子词级匹配。

为了评估将会生成、并因此可被匹配的 token，可以使用 `tokens` 函数：

```sql
SELECT tokens('https://www.zanbil.ir/m/filter/b113')

┌─tokens────────────────────────────────────────────┐
│ ['https','www','zanbil','ir','m','filter','b113'] │
└───────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.008 sec.
```

`ngram` 函数提供了类似的功能，你可以通过第二个参数来指定 `ngram` 的大小：`

```sql
SELECT ngrams('https://www.zanbil.ir/m/filter/b113', 3)

┌─ngrams('https://www.zanbil.ir/m/filter/b113', 3)────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ['htt','ttp','tps','ps:','s:/','://','//w','/ww','www','ww.','w.z','.za','zan','anb','nbi','bil','il.','l.i','.ir','ir/','r/m','/m/','m/f','/fi','fil','ilt','lte','ter','er/','r/b','/b1','b11','113'] │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

返回 1 行。用时:0.008 秒。
```

:::note 倒排索引
ClickHouse 还对作为二级索引的倒排索引提供了实验性支持。我们目前不建议在日志数据集上使用这些索引，但预计当它们达到生产可用状态时，将会取代基于 token 的布隆过滤器。
:::

在本示例中，我们使用结构化日志数据集。假设我们希望统计 `Referer` 列中包含 `ultra` 的日志条数。

```sql
SELECT count()
FROM otel_logs_v2
WHERE Referer LIKE '%ultra%'

┌─count()─┐
│  114514 │
└─────────┘

1 row in set. Elapsed: 0.177 sec. Processed 10.37 million rows, 908.49 MB (58.57 million rows/s., 5.13 GB/s.)
```

在这里，我们需要匹配长度为 3 的 ngram。因此，我们创建一个 `ngrambf_v1` 索引。

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

这里的索引 `ngrambf_v1(3, 10000, 3, 7)` 接受四个参数。最后一个参数（值 7）表示种子。其余参数分别表示 ngram 大小（3）、值 `m`（过滤器大小）以及哈希函数数量 `k`（7）。`k` 和 `m` 需要进行调优，其取值将基于唯一 ngram/标记的数量，以及过滤器给出真负结果的概率——从而确认某个值在一个 granule 中不存在。我们推荐使用[这些函数](/engines/table-engines/mergetree-family/mergetree#bloom-filter)来帮助确定这些取值。


如果调优得当，这里的性能提升可能非常明显：

```sql
SELECT count()
FROM otel_logs_bloom
WHERE Referer LIKE '%ultra%'
┌─count()─┐
│   182   │
└─────────┘

返回 1 行。用时:0.077 秒。处理了 422 万行,375.29 MB(每秒 5481 万行,4.87 GB/秒)。
峰值内存使用量:129.60 KiB。
```

:::note 示例仅供参考
以上内容仅用于演示说明。我们建议用户在写入时就从日志中抽取结构化信息，而不是尝试通过基于 token 的 Bloom filter 来优化文本搜索。不过，在某些情况下，用户会有堆栈跟踪或其他结构不太确定的大型 `String`，此时文本搜索仍然可能很有用。
:::

关于使用 Bloom filter 的一些通用指南：

Bloom filter 的目标是过滤[数据粒度](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design)，从而避免需要加载某列的所有值并执行线性扫描。`EXPLAIN` 子句配合参数 `indexes=1` 可用于识别被跳过的数据粒度数量。请参考下面针对原始表 `otel_logs_v2` 和带有 ngram Bloom filter 的表 `otel_logs_bloom` 的查询结果。

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

通常只有当 bloom filter 比列本身更小时，它才会更快。如果它更大，那么性能收益很可能可以忽略不计。使用以下查询将过滤器的大小与列进行比较：

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

1 行结果。用时:0.018 秒。

SELECT
        `table`,
        formatReadableSize(data_compressed_bytes) AS compressed_size,
        formatReadableSize(data_uncompressed_bytes) AS uncompressed_size
FROM system.data_skipping_indices
WHERE `table` = 'otel_logs_bloom'
```


┌─table───────────┬─compressed&#95;size─┬─uncompressed&#95;size─┐
│ otel&#95;logs&#95;bloom │ 12.03 MiB       │ 12.17 MiB         │
└─────────────────┴─────────────────┴───────────────────┘

1 行结果。耗时：0.004 秒。

```

在上述示例中,我们可以看到二级布隆过滤器索引为 12MB——几乎比列本身的压缩大小 56MB 小 5 倍。

布隆过滤器可能需要大量调优。我们建议参考[此处](/engines/table-engines/mergetree-family/mergetree#bloom-filter)的说明,这有助于确定最佳设置。布隆过滤器在插入和合并时也可能开销较大。用户应在将布隆过滤器添加到生产环境之前评估其对插入性能的影响。

有关二级跳数索引的更多详细信息,请参阅[此处](/optimize/skipping-indexes#skip-index-functions)。

### 从 Map 中提取数据 {#extracting-from-maps}

Map 类型在 OTel 模式中很常见。此类型要求值和键具有相同的类型——这对于 Kubernetes 标签等元数据来说已经足够。请注意,当查询 Map 类型的子键时,会加载整个父列。如果 Map 包含许多键,这可能会导致显著的查询性能损失,因为需要从磁盘读取的数据比键作为独立列存在时要多。

如果您经常查询某个特定键,请考虑将其移动到根级别的专用列中。这通常是在部署后根据常见访问模式而执行的任务,在生产环境之前可能难以预测。有关如何在部署后修改模式,请参阅["管理模式变更"](/observability/managing-data#managing-schema-changes)。
```


## 测量表大小和压缩率 {#measuring-table-size--compression}

ClickHouse 被广泛应用于可观测性场景的一个主要原因就是其出色的压缩能力。

压缩不仅能大幅降低存储成本,磁盘数据量的减少还意味着更少的 I/O 操作,从而实现更快的查询和插入性能。I/O 减少带来的性能提升远超任何压缩算法在 CPU 方面产生的开销。因此,在优化 ClickHouse 查询性能时,提升数据压缩率应当是首要关注点。

有关压缩率测量的详细信息,请参阅[此处](/data-compression/compression-in-clickhouse)。
