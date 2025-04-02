---
title: '模式设计'
description: '设计用于可观察性的模式设计'
keywords: ['可观察性', '日志', '追踪', '指标', 'OpenTelemetry', 'Grafana', 'OTel']
---

import observability_10 from '@site/static/images/use-cases/observability/observability-10.png';
import observability_11 from '@site/static/images/use-cases/observability/observability-11.png';
import observability_12 from '@site/static/images/use-cases/observability/observability-12.png';
import observability_13 from '@site/static/images/use-cases/observability/observability-13.png';

# 为可观察性设计模式

我们建议用户始终为日志和追踪创建自己的模式，原因如下：

- **选择主键** - 默认模式使用 `ORDER BY`，这对于特定访问模式进行了优化。你的访问模式不太可能与此对齐。
- **提取结构** - 用户可能希望从现有列中提取新列，例如 `Body` 列。这可以通过物化列（在更复杂的情况下通过物化视图）来实现。这需要模式更改。
- **优化 Maps** - 默认模式使用 Map 类型存储属性。这些列允许存储任意元数据。尽管这是一项基本功能，因为事件元数据通常不会提前定义，因此无法在像 ClickHouse 这样的强类型数据库中存储，但访问 Map 键及其值的效率不如访问普通列。我们通过修改模式并确保最常访问的 Map 键是顶级列来解决这一点 - 参见 ["使用 SQL 提取结构"](#extracting-structure-with-sql)。这要求更改模式。
- **简化 Map 键访问** - 访问 Map 中的键需要更冗长的语法。用户可以通过别名来缓解这一点。参见 ["使用别名"](#using-aliases) 以简化查询。
- **辅助索引** - 默认模式使用辅助索引来加速对 Maps 的访问和加速文本查询。这些通常不是必需的，并且会占用额外的磁盘空间。可以使用，但应进行测试以确保是必需的。参见 ["辅助 / 数据跳过索引"](#secondarydata-skipping-indices)。
- **使用编解码器** - 如果用户了解预期数据并有证据表明这可以改善压缩，可能希望自定义列的编解码器。

_我们将在下面详细描述每一个上述用例。_

**重要提示：** 虽然鼓励用户扩展和修改其模式以实现最佳压缩和查询性能，但应尽可能遵循核心列的 OTel 模式命名。 ClickHouse Grafana 插件假定存在一些基本的 OTel 列以协助构建查询，例如 Timestamp 和 SeverityText。日志和追踪所需的列在此处被记录[[1]](https://grafana.com/developers/plugin-tools/tutorials/build-a-logs-data-source-plugin#logs-data-frame-format)[[2]](https://grafana.com/docs/grafana/latest/explore/logs-integration/) 和 [这里](https://grafana.com/docs/grafana/latest/explore/trace-integration/#data-frame-structure)，分别。你可以选择更改这些列的名称，覆盖插件配置中的默认值。
## 使用 SQL 提取结构 {#extracting-structure-with-sql}

无论是摄取结构化还是非结构化日志，用户通常需要具备以下能力：

- **从字符串大对象中提取列**。查询这些将比在查询时使用字符串操作更快。
- **从 Maps 中提取键**。默认模式将任意属性放入 Map 类型的列中。这种类型提供了一种无模式的能力，用户在定义日志和追踪时不需要预先定义属性的列 - 在从 Kubernetes 收集日志并希望确保保留 Pod 标签以便后续搜索时，这通常是不可能的。访问 Map 键及其值的速度比在普通 ClickHouse 列上查询要慢。因此，将键从 Maps 提取到根表列通常是可取的。

考虑以下查询：

假设我们希望计算接收最多 POST 请求的 URL 路径，使用结构化日志。JSON 大对象存储在 `Body` 列中，作为字符串。此外，如果用户在收集器中启用了 json_parser，则它也可能存储在 `LogAttributes` 列中，作为 `Map(String, String)`。

```sql
SELECT LogAttributes
FROM otel_logs
LIMIT 1
FORMAT Vertical

行 1:
──────
Body:      	{"remote_addr":"54.36.149.41","remote_user":"-","run_time":"0","time_local":"2019-01-22 00:26:14.000","request_type":"GET","request_path":"\/filter\/27|13 ,27|  5 ,p53","request_protocol":"HTTP\/1.1","status":"200","size":"30577","referer":"-","user_agent":"Mozilla\/5.0 (compatible; AhrefsBot\/6.1; +http:\/\/ahrefs.com\/robot\/)"}
LogAttributes: {'status':'200','log.file.name':'access-structured.log','request_protocol':'HTTP/1.1','run_time':'0','time_local':'2019-01-22 00:26:14.000','size':'30577','user_agent':'Mozilla/5.0 (compatible; AhrefsBot/6.1; +http://ahrefs.com/robot/)','referer':'-','remote_user':'-','request_type':'GET','request_path':'/filter/27|13 ,27|  5 ,p53','remote_addr':'54.36.149.41'}
```

假设 `LogAttributes` 是可用的，查询计算网站的哪些 URL 路径接收了最多的 POST 请求：

```sql
SELECT path(LogAttributes['request_path']) AS path, count() AS c
FROM otel_logs
WHERE ((LogAttributes['request_type']) = 'POST')
GROUP BY path
ORDER BY c DESC
LIMIT 5

┌─path─────────────────────┬─────c─┐
│ /m/updateVariation   	   │ 12182 │
│ /site/productCard    	   │ 11080 │
│ /site/productPrice   	   │ 10876 │
│ /site/productModelImages │ 10866 │
│ /site/productAdditives   │ 10866 │
└──────────────────────────┴───────┘

5 行记录。耗时: 0.735 秒。处理 1036 万行，4.65 GB (每秒 1410 万行，6.32 GB/秒)
峰值内存使用: 153.71 MiB。
```

注意此处 Map 语法的使用，例如 `LogAttributes['request_path']`，以及用于从 URL 中剥离查询参数的 [`path` 函数](/sql-reference/functions/url-functions#path)。

如果用户未在收集器中启用 JSON 解析，则 `LogAttributes` 将为空，迫使我们使用 [JSON 函数](/sql-reference/functions/json-functions) 从字符串 `Body` 中提取列。

:::note 优先使用 ClickHouse 进行解析
我们通常建议用户在 ClickHouse 中对结构化日志执行 JSON 解析。我们相信 ClickHouse 是最快的 JSON 解析实现。然而，我们认识到用户可能希望将日志发送到其他源，并且不会将此逻辑保留在 SQL 中。
:::

```sql
SELECT path(JSONExtractString(Body, 'request_path')) AS path, count() AS c
FROM otel_logs
WHERE JSONExtractString(Body, 'request_type') = 'POST'
GROUP BY path
ORDER BY c DESC
LIMIT 5

┌─path─────────────────────┬─────c─┐
│ /m/updateVariation   	   │ 12182 │
│ /site/productCard    	   │ 11080 │
│ /site/productPrice   	   │ 10876 │
│ /site/productAdditives   │ 10866 │
│ /site/productModelImages │ 10866 │
└──────────────────────────┴───────┘

5 行记录。耗时: 0.668 秒。处理 1037 万行，5.13 GB (每秒 1552 万行，7.68 GB/秒)
峰值内存使用: 172.30 MiB。
```

现在考虑非结构化日志的情况：

```sql
SELECT Body, LogAttributes
FROM otel_logs
LIMIT 1
FORMAT Vertical

行 1:
──────
Body:      	151.233.185.144 - - [22/Jan/2019:19:08:54 +0330] "GET /image/105/brand HTTP/1.1" 200 2653 "https://www.zanbil.ir/filter/b43,p56" "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36" "-"
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
│ /m/updateVariation   	   │ 12182 │
│ /site/productCard    	   │ 11080 │
│ /site/productPrice   	   │ 10876 │
│ /site/productModelImages │ 10866 │
│ /site/productAdditives   │ 10866 │
└──────────────────────────┴───────┘

5 行记录。耗时: 1.953 秒。处理 1037 万行，3.59 GB (每秒 531 万行，1.84 GB/秒)
```

对解析非结构化日志的查询复杂性和费用的增加（注意性能差异）是我们建议用户始终在可能的情况下使用结构化日志的原因。

:::note 考虑字典
上述查询可以被优化为利用正则表达式字典。有关更多详细信息，请参见 [使用字典](#using-dictionaries)。
:::

这两个用例都可以通过在插入时间将上述查询逻辑移到 ClickHouse 中来满足。我们在下面探讨几种方法，并突出每种方法适宜时的情景。

:::note OTel 还是 ClickHouse 进行处理？
用户还可以利用 OTel Collector 处理器和操作符进行处理，如 [这里](https://observe.opencensus.io) /observability/integrating-opentelemetry#processing---filtering-transforming-and-enriching)。在大多数情况下，用户会发现 ClickHouse 在资源使用效率和速度上远超收集器的处理器。在 SQL 中执行所有事件处理的主要缺点是将解决方案与 ClickHouse 绑定在一起。例如，用户可能希望将处理过的日志发送到 OTel 收集器的其他目的地，例如 S3。
:::
### 物化列 {#materialized-columns}

物化列提供了从其他列提取结构的最简单方案。此类列的值始终在插入时计算，无法在 INSERT 查询中指定。

:::note 开销
物化列在插入时会将值提取到磁盘上的新列中，从而产生额外的存储开销。
:::

物化列支持任何 ClickHouse 表达式，并可以利用任何用于 [处理字符串](/sql-reference/functions/string-functions)（包括 [正则表达式和搜索](/sql-reference/functions/string-search-functions)）和 [URL](/sql-reference/functions/url-functions) 的分析函数，进行 [类型转换](/sql-reference/functions/type-conversion-functions)、[从 JSON 提取值](/sql-reference/functions/json-functions) 或 [数学操作](/sql-reference/functions/math-functions)。

我们建议将物化列用于基本处理。它们在从 Maps 中提取值、将其提升为根列和执行类型转换时尤为有用。它们在非常基本的模式或与物化视图结合使用时通常最有用。考虑以下日志模式，其中 JSON 已通过收集器提取到 `LogAttributes` 列：

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

提取使用 JSON 函数的等效模式可以在此处找到 [here](https://pastila.nl/?005cbb97/513b174a7d6114bf17ecc657428cf829#gqoOOiomEjIiG6zlWhE+Sg==)。

我们的三个物化视图列提取请求页面、请求类型和引用域。这些访问 Maps 键并对其值应用函数。我们的后续查询速度显著更快：

```sql
SELECT RequestPage AS path, count() AS c
FROM otel_logs
WHERE RequestType = 'POST'
GROUP BY path
ORDER BY c DESC
LIMIT 5

┌─path─────────────────────┬─────c─┐
│ /m/updateVariation   	   │ 12182 │
│ /site/productCard    	   │ 11080 │
│ /site/productPrice   	   │ 10876 │
│ /site/productAdditives   │ 10866 │
│ /site/productModelImages │ 10866 │
└──────────────────────────┴───────┘

5 行记录。耗时: 0.173 秒。处理 1037 万行，418.03 MB (每秒 6007 万行，2.42 GB/秒)
峰值内存使用: 3.16 MiB。
```

:::note
物化列默认情况下不会包含在 `SELECT *` 的结果中。这是为了保持 `SELECT *` 的结果始终可以使用 INSERT 插入回表中的不变性。可以通过设置 `asterisk_include_materialized_columns=1` 来禁用此行为，并可以在 Grafana 中启用（参见数据源配置中的 `Additional Settings -> Custom Settings`）。
:::
## 物化视图 {#materialized-views}

[物化视图](/materialized-views) 提供了将 SQL 过滤和转换应用于日志和追踪的更强大手段。

物化视图允许用户将计算的成本从查询时间转移到插入时间。ClickHouse 物化视图实际上是一个触发器，在将数据块插入到表中时运行查询。该查询的结果会插入到第二个“目标”表中。

<img src={observability_10}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '600px'}} />

<br />


:::note 实时更新
ClickHouse 中的物化视图将在数据流入其基础上表时实时更新，功能更像是不断更新的索引。相较之下，其他数据库中的物化视图通常是查询的静态快照，必须刷新（类似于 ClickHouse 可刷新物化视图）。
:::


与物化视图相关的查询可以理论上是任何查询，包括聚合，尽管 [连接存在限制](https://clickhouse.com/blog/using-materialized-views-in-clickhouse#materialized-views-and-joins)。对于日志和追踪所需的转换和过滤工作负载，用户可以考虑任何 `SELECT` 语句都是可能的。

用户应记住，该查询只是一个触发器，在插入到表中的行（源表）上执行，结果发送到一个新表（目标表）。

为了确保我们不重复持久化数据（在源表和目标表中），我们可以将源表的表更改为 [Null 表引擎](/engines/table-engines/special/null)，从而保留原始模式。我们的 OTel 收集器将继续将数据发送到这个表。例如，对于日志，`otel_logs` 表变为：

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

Null 表引擎是一个强大的优化 - 可以将其视为 `/dev/null`。此表将不存储任何数据，但任何附加的物化视图仍将在插入的行上执行，然后被丢弃。

考虑以下查询。这将我们的行转换为我们想要保留的格式，从 `LogAttributes` 中提取所有列（我们假设这一列是由收集器通过 `json_parser` 操作设置的），设置 `SeverityText` 和 `SeverityNumber`（基于一些简单条件和 [这些列的定义](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-severitytext)）。在这种情况下，我们还仅选择我们知道将被填充的列 - 忽略如 `TraceId`、`SpanId` 和 `TraceFlags` 等列。

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

行 1:
──────
Body:        	{"remote_addr":"54.36.149.41","remote_user":"-","run_time":"0","time_local":"2019-01-22 00:26:14.000","request_type":"GET","request_path":"\/filter\/27|13 ,27|  5 ,p53","request_protocol":"HTTP\/1.1","status":"200","size":"30577","referer":"-","user_agent":"Mozilla\/5.0 (compatible; AhrefsBot\/6.1; +http:\/\/ahrefs.com\/robot\/)"}
Timestamp:   	2019-01-22 00:26:14
ServiceName:
Status:      	200
RequestProtocol: HTTP/1.1
RunTime:     	0
Size:        	30577
UserAgent:   	Mozilla/5.0 (compatible; AhrefsBot/6.1; +http://ahrefs.com/robot/)
Referer:     	-
RemoteUser:  	-
RequestType: 	GET
RequestPath: 	/filter/27|13 ,27|  5 ,p53
RemoteAddr: 	54.36.149.41
RefererDomain:
RequestPage: 	/filter/27|13 ,27|  5 ,p53
SeverityText:	INFO
SeverityNumber:  9

1 行记录。耗时: 0.027 秒。
```

我们还提取了上面的 `Body` 列 - 以防以后添加未被我们的 SQL 提取的其他属性。这一列在 ClickHouse 中应压缩良好，并且将很少访问，因此不会影响查询性能。最后，我们将 Timestamp 转换为 DateTime（以节省空间 - 参见 ["优化类型"](#optimizing-types)），并进行了类型转换。

:::note 条件语句
注意用于提取 `SeverityText` 和 `SeverityNumber` 的 [条件语句](/sql-reference/functions/conditional-functions)。这些对于形成复杂条件和检查值是否在 maps 中设置非常有用 - 我们天真假设所有键都存在于 `LogAttributes` 中。我们建议用户熟悉它们 - 这将有助于日志解析，此外，还有处理 [空值](/sql-reference/functions/functions-for-nulls) 的函数！
:::

我们需要一个表来接收这些结果。以下目标表与上面的查询匹配：

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

这里选择的类型是基于 ["优化类型"](#optimizing-types) 中讨论的优化。

:::note
请注意我们如何显著更改了我们的模式。实际上，用户可能还会想保留一些 Trace 列以及 `ResourceAttributes` 列（这通常包含 Kubernetes 元数据）。Grafana 可以利用 Trace 列提供日志和追踪之间的链接功能 - 参见 ["使用 Grafana"](/observability/grafana)。
:::

接下来，我们创建一个物化视图 `otel_logs_mv`，该视图对 `otel_logs` 表执行上述选择并将结果发送到 `otel_logs_v2`。

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

这个查询如下图所示：

<img src={observability_11}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />

如果现在重启用于 ["导出到 ClickHouse"](/observability/integrating-opentelemetry#exporting-to-clickhouse) 的收集器配置，数据将以我们期望的格式出现在 `otel_logs_v2` 中。注意使用了类型化 JSON 提取函数。

```sql
SELECT *
FROM otel_logs_v2
LIMIT 1
FORMAT Vertical

行 1:
──────
Body:        	{"remote_addr":"54.36.149.41","remote_user":"-","run_time":"0","time_local":"2019-01-22 00:26:14.000","request_type":"GET","request_path":"\/filter\/27|13 ,27|  5 ,p53","request_protocol":"HTTP\/1.1","status":"200","size":"30577","referer":"-","user_agent":"Mozilla\/5.0 (compatible; AhrefsBot\/6.1; +http:\/\/ahrefs.com\/robot\/)"}
Timestamp:   	2019-01-22 00:26:14
ServiceName:
Status:      	200
RequestProtocol: HTTP/1.1
RunTime:     	0
Size:        	30577
UserAgent:   	Mozilla/5.0 (compatible; AhrefsBot/6.1; +http://ahrefs.com/robot/)
Referer:     	-
RemoteUser:  	-
RequestType: 	GET
RequestPath: 	/filter/27|13 ,27|  5 ,p53
RemoteAddress: 	54.36.149.41
RefererDomain:
RequestPage: 	/filter/27|13 ,27|  5 ,p53
SeverityText:	INFO
SeverityNumber:  9

1 行记录。耗时: 0.010 秒。
```

使用 JSON 函数从 `Body` 列提取列的等效物化视图如下所示：

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

上述物化视图依赖于隐式转换 - 尤其是在使用 `LogAttributes` map 的情况下。ClickHouse 通常会将提取的值透明地转换为目标表类型，从而减少所需的语法。然而，我们建议用户始终通过使用 [`INSERT INTO`](/sql-reference/statements/insert-into) 语句将视图 `SELECT` 语句与具有相同模式的目标表一起测试。这应该确认类型是否正确处理。特别注意以下情况：

- 如果 Map 中不存在某个键，则会返回空字符串。在数值的情况下，用户需要将其映射到合适的值。这可以通过 [条件语句](/sql-reference/functions/conditional-functions) 实现，例如 `if (LogAttributes['status'] = "", 200, LogAttributes['status'])` 或者 [类型转换函数](/sql-reference/functions/type-conversion-functions)，如果默认值可以接受，例如 `toUInt8OrDefault(LogAttributes['status'])`
- 一些类型不会始终被转换，例如数值的字符串表示不会被转换为枚举值。
- 如果未找到值，JSON 提取函数会返回其类型的默认值。确保这些值是合理的！

:::note 避免使用 Nullable
在 ClickHouse 中，避免对可观察性数据使用 [Nullable](/sql-reference/data-types/nullable)。在日志和追踪中，区分空和 null 的情况很少需要。这一特性会产生额外的存储开销，并会对查询性能产生负面影响。有关更多细节，请参阅 [此处](/data-modeling/schema-design#optimizing-types)。
:::
## 选择主（排序）键 {#choosing-a-primary-ordering-key}

一旦你提取了所需的列，就可以开始优化你的排序/主键。

可以应用一些简单规则来帮助选择排序键。以下有时可能会存在冲突，因此请根据顺序考虑这些因素。用户可以从这个过程中识别出多个键，通常 4-5 个就足够了：

1. 选择与常见过滤和访问模式对齐的列。如果用户通常通过特定列（例如 Pod 名称）开始可观察性调查，那么在 `WHERE` 子句中经常使用这一列。优先将这些列纳入你的键，而不是使用较少频繁使用的列。
2. 优先选择能够在过滤时排除大量总行数的列，从而减少需要读取的数据量。服务名称和状态码通常是良好的候选者 - 在后者的情况下，仅当用户使用排除大多数行的值进行过滤时，例如过滤 200 时，在大多数系统中将匹配大多数行，尽管 500 错误对应于较小的子集。
3. 优先选择可能与表中的其他列高度相关的列。这将有助于确保这些值也连续存储，从而改善压缩。
4. 对排序键中列的 `GROUP BY` 和 `ORDER BY` 操作可以更有效地使用内存。

<br />

识别排序键的子集后，它们必须以特定顺序声明。此顺序可能会显著影响查询中对辅助键列的过滤效率以及表数据文件的压缩比率。一般而言，**最好将键按基数的升序排序**。这应当与过滤较后排序键列的效率较低的事实相平衡。平衡这些行为并考虑你的访问模式。最重要的是，测试变体。有关排序键的进一步理解以及如何优化它们，我们建议 [本文](/guides/best-practices/sparse-primary-indexes)。

:::note 先结构后排序
我们建议在结构化日志之后再决定你的排序键。不要将属性 map 中的键用作排序键或 JSON 提取表达式。确保你已经将排序键作为根列放入表中。
:::
## 使用 Maps {#using-maps}

早期示例展示了如何使用 Map 语法 `map['key']` 访问 `Map(String, String)` 列中的值。除了使用 Map 符号来访问嵌套键外， ClickHouse 还提供了用于过滤或选择这些列的专用 [map 函数](/sql-reference/functions/tuple-map-functions#mapkeys)。

例如，以下查询使用 [`mapKeys` 函数](/sql-reference/functions/tuple-map-functions#mapkeys) 识别 `LogAttributes` 列中所有唯一的键，随后使用 [`groupArrayDistinctArray` 函数](/sql-reference/aggregate-functions/combinators)（一个组合器）。

```sql
SELECT groupArrayDistinctArray(mapKeys(LogAttributes))
FROM otel_logs
FORMAT Vertical

行 1:
──────
groupArrayDistinctArray(mapKeys(LogAttributes)): ['remote_user','run_time','request_type','log.file.name','referer','request_path','status','user_agent','remote_addr','time_local','size','request_protocol']

1 行记录。耗时: 1.139 秒。处理 563 万行，2.53 GB (每秒 494 万行，2.22 GB/秒)
峰值内存使用: 71.90 MiB。
```

:::note 避免使用点
我们不建议在 Map 列名中使用点，并可能会废弃此用法。请使用 `_`。
:::

## 使用别名 {#using-aliases}

查询映射类型的速度比查询普通列要慢 - 参见 ["加速查询"](#accelerating-queries)。此外，这在语法上更复杂，可能会让用户感到麻烦。为了解决这个问题，我们建议使用别名列。

ALIAS 列在查询时计算，不存储在表中。因此，无法向此类型的列插入值。通过使用别名，我们可以引用映射键并简化语法，将映射条目透明地暴露为普通列。考虑以下示例：

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

我们有几个物化列和一个 `ALIAS` 列 `RemoteAddr`，该列访问映射 `LogAttributes`。现在我们可以通过这个列查询 `LogAttributes['remote_addr']` 的值，从而简化我们的查询，即：

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

此外，通过 `ALTER TABLE` 命令添加 `ALIAS` 是微不足道的。这些列立即可用，例如：

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

:::note 默认情况下排除别名
默认情况下，`SELECT *` 排除 ALIAS 列。可以通过设置 `asterisk_include_alias_columns=1` 来禁用此行为。
:::
## 优化类型 {#optimizing-types}

[通用 Clickhouse 最佳实践](/data-modeling/schema-design#optimizing-types) 适用于 ClickHouse 用例的类型优化。
## 使用编解码器 {#using-codecs}

除了类型优化之外，用户还可以在尝试优化 ClickHouse 可观察性模式的压缩时遵循 [编解码器的通用最佳实践](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec)。

一般来说，用户会发现 `ZSTD` 编解码器对于日志和追踪数据集非常适用。将压缩值从默认值 1 增加可能会改善压缩。然而，这应经过测试，因为较高的值在插入时会引入更大的 CPU 开销。通常，我们看到提高该值带来的收益极小。

此外，时间戳虽然受益于与压缩相关的增量编码，但如果此列在主键/排序键中使用，已被证明会导致查询性能缓慢。我们建议用户评估相应的压缩与查询性能之间的权衡。
## 使用字典 {#using-dictionaries}

[字典](/sql-reference/dictionaries) 是 ClickHouse 的一个 [关键特性](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)，提供来自各种内部和外部 [来源](/sql-reference/dictionaries#dictionary-sources) 的数据的内存 [键值对](https://en.wikipedia.org/wiki/Key%E2%80%93value_database) 表示，优化用于超低延迟的查找查询。

<img src={observability_12}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />

这在多种场景中都非常方便，从无缝丰富实时摄取的数据，不减慢摄取过程，并且总体上提高查询性能，尤其是 JOIN 受益匪浅。
虽然在可观察性用例中很少需要使用 JOIN，但字典在丰富目的上仍然非常方便 - 在插入和查询时都可以。我们在下面提供了两个示例。

:::note 加速 JOIN
对加速 JOIN 感兴趣的用户可以在 [这里](/dictionary) 找到详细信息。
:::
### 插入时间与查询时间 {#insert-time-vs-query-time}

字典可以在查询时间或插入时间用于丰富数据集。这两种方法各有优缺点。总结如下：

- **插入时间** - 如果丰富值不变，并且存在于可以用于填充字典的外部来源，则通常适用。在这种情况下，在插入时丰富行可以避免在查询时查找字典。这会产生插入性能和额外存储开销的代价，因为丰富的值将作为列存储。
- **查询时间** - 如果字典中的值经常变化，则查询时间查找通常更为适用。这避免了需要在映射值变化时更新列（和重写数据）。这一灵活性以查询时间查找成本为代价。通常，如果需要对多个行执行查找，例如在过滤子句中使用字典查找，这一查询时间成本是显著的。在结果丰富中，即在 `SELECT` 中，这一开销通常并不显著。

我们建议用户熟悉字典的基本知识。字典提供一个内存查找表，可以使用专门的 [专业函数](/sql-reference/functions/ext-dict-functions#dictgetall) 进行值检索。

有关简单丰富示例，请参见 [这里的字典指南](/dictionary)。在下面，我们集中讨论常见的可观察性丰富任务。
### 使用 IP 字典 {#using-ip-dictionaries}

使用 IP 地址通过经纬度值丰富日志和追踪是一个常见的可观察性需求。我们可以通过 `ip_trie` 结构字典实现这一目标。

我们使用由 [DB-IP.com](https://db-ip.com/) 提供的公开可用的 [DB-IP 城市级数据集](https://github.com/sapics/ip-location-db#db-ip-database-update-monthly)，其遵循 [CC BY 4.0 许可证](https://creativecommons.org/licenses/by/4.0/)。

从 [自述文件](https://github.com/sapics/ip-location-db#csv-format) 可以看到数据结构如下：

```csv
| ip_range_start | ip_range_end | country_code | state1 | state2 | city | postcode | latitude | longitude | timezone |
```

给定此结构，让我们首先通过 [url()](/sql-reference/table-functions/url) 表函数查看数据：

```sql
SELECT *
FROM url('https://raw.githubusercontent.com/sapics/ip-location-db/master/dbip-city/dbip-city-ipv4.csv.gz', 'CSV', '\n    	\tip_range_start IPv4, \n    	\tip_range_end IPv4, \n    	\tcountry_code Nullable(String), \n    	\tstate1 Nullable(String), \n    	\tstate2 Nullable(String), \n    	\tcity Nullable(String), \n    	\tpostcode Nullable(String), \n    	\tlatitude Float64, \n    	\tlongitude Float64, \n    	\ttimezone Nullable(String)\n	\t')
LIMIT 1
FORMAT Vertical
Row 1:
──────
ip_range_start: 1.0.0.0
ip_range_end:   1.0.0.255
country_code:   AU
state1:     	Queensland
state2:     	ᴺᵁᴸᴸ
city:       	South Brisbane
postcode:   	ᴺᵁᴸᴸ
latitude:   	-27.4767
longitude:  	153.017
timezone:   	ᴺᵁᴸᴸ
```

为了方便起见，让我们使用 [`URL()`](/engines/table-engines/special/url) 表引擎创建一个 ClickHouse 表对象，并确认行数：

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

因为我们的 `ip_trie` 字典需要 IP 地址范围以 CIDR 表示法表示，所以我们需要转换 `ip_range_start` 和 `ip_range_end`。

可以通过以下查询简洁地计算出每个范围的 CIDR：

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
│ 1.0.0.0    	 │ 1.0.0.255	│ 1.0.0.0/24 │
│ 1.0.1.0    	 │ 1.0.3.255	│ 1.0.0.0/22 │
│ 1.0.4.0    	 │ 1.0.7.255	│ 1.0.4.0/22 │
│ 1.0.8.0    	 │ 1.0.15.255   │ 1.0.8.0/21 │
└────────────────┴──────────────┴────────────┘

4 rows in set. Elapsed: 0.259 sec.
```

:::note
上面的查询中进行了很多操作。如果你感兴趣，可以阅读这篇优秀的 [解释](https://clickhouse.com/blog/geolocating-ips-in-clickhouse-and-grafana#using-bit-functions-to-convert-ip-ranges-to-cidr-notation)。否则可以接受，上面的计算为 IP 范围计算了 CIDR。
:::

就我们的需要而言，我们只需要 IP 范围、国家代码和坐标，因此让我们创建一个新表并插入我们的 Geo IP 数据：

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

为了在 ClickHouse 中执行低延迟 IP 查找，我们将利用字典在内存中存储键 -> 属性映射以获取 Geo IP 数据。ClickHouse 提供了一个 `ip_trie` [字典结构](/sql-reference/dictionaries#ip_trie) 用于将我们的网络前缀（CIDR 块）映射到坐标和国家代码。以下查询使用此布局和上述表作为源来指定字典。

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
│ 1.0.0.0/22 │  26.0998 │   119.297 │ CN       	   │
│ 1.0.0.0/24 │ -27.4767 │   153.017 │ AU       	   │
│ 1.0.4.0/22 │ -38.0267 │   145.301 │ AU       	   │
└────────────┴──────────┴───────────┴──────────────┘

3 rows in set. Elapsed: 4.662 sec.
```

:::note 周期性刷新
ClickHouse 中的字典根据底层表数据和上述 lifetime 子句定期刷新。要更新我们的 Geo IP 字典以反映 DB-IP 数据集中的最新更改，我们只需将数据从 geoip_url 远程表重新插入到我们的 `geoip` 表中，并应用转换。
:::

现在我们已经将 Geo IP 数据加载到我们的 `ip_trie` 字典中（方便起见也命名为 `ip_trie`），我们可以使用它进行 IP 地理位置查找。这可以通过以下方式使用 [`dictGet()` 函数](/sql-reference/functions/ext-dict-functions) 实现：

```sql
SELECT dictGet('ip_trie', ('country_code', 'latitude', 'longitude'), CAST('85.242.48.167', 'IPv4')) AS ip_details

┌─ip_details──────────────┐
│ ('PT',38.7944,-9.34284) │
└─────────────────────────┘

1 row in set. Elapsed: 0.003 sec.
```

请注意这里的检索速度。这使我们能够丰富日志。在这种情况下，我们选择 **在查询时间进行丰富**。

返回到我们原始的日志数据集，我们可以使用上述方法按国家对我们的日志进行聚合。以下假定我们使用结果于我们之前物化视图的模式，该视图中提取了 `RemoteAddress` 列。

```sql
SELECT dictGet('ip_trie', 'country_code', tuple(RemoteAddress)) AS country,
	formatReadableQuantity(count()) AS num_requests
FROM default.otel_logs_v2
WHERE country != ''
GROUP BY country
ORDER BY count() DESC
LIMIT 5

┌─country─┬─num_requests────┐
│ IR  	  │ 7.36 million	│
│ US  	  │ 1.67 million	│
│ AE  	  │ 526.74 thousand │
│ DE  	  │ 159.35 thousand │
│ FR  	  │ 109.82 thousand │
└─────────┴─────────────────┘

5 rows in set. Elapsed: 0.140 sec. Processed 20.73 million rows, 82.92 MB (147.79 million rows/s., 591.16 MB/s.)
Peak memory usage: 1.16 MiB.
```

由于 IP 到地理位置的映射可能会变化，用户可能希望知道请求在发出时的来源 - 而不是同一地址的当前地理位置。因此，这里可能更倾向于使用插入时间丰富。这可以通过物化列或在物化视图的选择中完成，如下所示：

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
用户可能希望 IP 丰富字典根据新数据周期性更新。这可以通过字典的 `LIFETIME` 子句来实现，使用此子句将导致字典根据底层表定期重新加载。要更新底层表，请参见 ["可刷新的物化视图"](/materialized-view/refreshable-materialized-view)。
:::

上面的国家和坐标提供了超出按国家分组和过滤的可视化功能。有关灵感，请参见 ["可视化地理数据"](/observability/grafana#visualizing-geo-data)。
### 使用正则字典（用户代理解析） {#using-regex-dictionaries-user-agent-parsing}

解析 [用户代理字符串](https://en.wikipedia.org/wiki/User_agent) 是一个经典的正则表达式问题，也是基于日志和追踪数据集中的常见需求。ClickHouse 提供了使用正则表达式树字典高效解析用户代理的能力。

正则表达式树字典在 ClickHouse 开源中是使用 YAMLRegExpTree 字典源类型定义的，该源类型提供了指向包含正则表达式树的 YAML 文件的路径。如果您希望提供自己的正则表达式字典，可以在 [此处](https://sql-reference/dictionaries#use-regular-expression-tree-dictionary-in-clickhouse-open-source) 找到所需结构的详细信息。下面我们专注于使用 [uap-core](https://github.com/ua-parser/uap-core) 进行用户代理解析，并加载我们支持的 CSV 格式的字典。这种方法兼容 OSS 和 ClickHouse Cloud。

:::note
在下面的示例中，我们使用 2024 年 6 月的最新 uap-core 正则表达式快照进行用户代理解析。最新文件（偶尔更新）可以在 [此处](https://raw.githubusercontent.com/ua-parser/uap-core/master/regexes.yaml) 找到。用户可以按照 [这里](/sql-reference/dictionaries#collecting-attribute-values) 的步骤加载使用的 CSV 文件。
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

这些表可以从以下公共托管的 CSV 文件填充，使用 url 表函数：

```sql
INSERT INTO regexp_os SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_os.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')

INSERT INTO regexp_device SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_device.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')

INSERT INTO regexp_browser SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_browser.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')
```

在填充了我们的内存表后，我们可以加载正则表达式字典。请注意，我们需要将键值指定为列 - 这些将是我们可以从用户代理中提取的属性。

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

鉴于用户代理规则很少会改变，字典仅在响应新的浏览器、操作系统和设备时才需要更新，因此在插入时间进行此提取是合理的。

我们可以使用物化列或物化视图进行此工作。下面我们修改之前使用的物化视图：

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

在重新启动收集器并根据先前记录的步骤摄取结构化日志后，我们可以查询我们新提取的 Device, Browser 和 Os 列。

```sql
SELECT Device, Browser, Os
FROM otel_logs_v2
LIMIT 1
FORMAT Vertical

Row 1:
──────
Device:  ('Spider','Spider','Desktop')
Browser: ('AhrefsBot','6','1')
Os:  	('Other','0','0','0')
```

:::note 复杂结构的元组
注意在这些用户代理列中使用的元组。对于已知层次的复杂结构，推荐使用元组。子列与常规列一样具有相同的性能（与映射键不同），同时允许异构类型。
:::
### 更多阅读 {#further-reading}

有关字典的更多示例和详细信息，我们推荐以下文章：

- [高级字典主题](/dictionary#advanced-dictionary-topics)
- ["使用字典加速查询"](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)
- [字典](/sql-reference/dictionaries)
## 加速查询 {#accelerating-queries}

ClickHouse 支持多种加速查询性能的技术。下面的内容只有在选择了合适的主键/排序键以优化最流行的访问模式并最大化压缩后才能考虑。这通常对性能的影响最大，且最为便捷。
### 使用物化视图（增量）进行聚合 {#using-materialized-views-incremental-for-aggregations}

在早期的章节中，我们探索了使用物化视图进行数据转换和过滤。物化视图也可以用于在插入时预计算聚合并存储结果。此结果可以通过后续插入的结果进行更新，因此有效地允许在插入时预计算聚合。

这里的主要思想是，结果通常会比原始数据有更小的表示（在聚合的情况下是部分草图）。当与用于从目标表读取结果的更简单的查询结合时，查询时间通常将比在原始数据上执行相同计算要快。

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

我们可以想象这可能是用户在 Grafana 中绘制的常见折线图。这个查询显然很快 - 数据集只有 10m 行，而且 ClickHouse 很快！然而，如果我们将其扩展到数十亿或数万亿行，我们希望能够保持这种查询性能。

:::note
如果我们使用 `otel_logs_v2` 表，该表是我们之前物化视图的结果，这个查询将快 10 倍，仅用于说明目的我们在此使用原始数据，但如果这是一个常见查询，我们建议使用早先的视图。
:::

如果我们希望使用物化视图在插入时间计算此内容，则需要一个表来接收结果。此表应每小时只保留 1 行。如果收到对现有小时的更新，则其他列应合并到现有小时的行中。为了使增量状态的合并能够发生，必须为其他列存储部分状态。

这要求 ClickHouse 中有一个特殊的引擎类型：SummingMergeTree。它将所有具有相同排序键的行替换为一行，该行包含所有数值列的和。以下表将合并任何具有相同日期的行，求和任何数值列。

```sql
CREATE TABLE bytes_per_hour
(
  `Hour` DateTime,
  `TotalBytes` UInt64
)
ENGINE = SummingMergeTree
ORDER BY Hour
```

为了演示我们的物化视图，假设我们的 `bytes_per_hour` 表为空且尚未接收任何数据。我们的物化视图在插入到 `otel_logs` 时执行上述 `SELECT`（此操作将在配置的块大小上进行），结果发送到 `bytes_per_hour`。语法如下：

```sql
CREATE MATERIALIZED VIEW bytes_per_hour_mv TO bytes_per_hour AS
SELECT toStartOfHour(Timestamp) AS Hour,
       sum(toUInt64OrDefault(LogAttributes['size'])) AS TotalBytes
FROM otel_logs
GROUP BY Hour
```

这里的 `TO` 子句是关键，指示结果将发送到哪里，即 `bytes_per_hour`。

如果我们重新启动 OTel Collector 并重新发送日志，则 `bytes_per_hour` 表将通过上述查询结果增量填充。完成后，我们可以确认 `bytes_per_hour` 的大小 - 我们应该每小时有 1 行：

```sql
SELECT count()
FROM bytes_per_hour
FINAL

┌─count()─┐
│ 	113 │
└─────────┘
```

我们在这里有效地将行数从 10m （在 `otel_logs`）减少到 113，因为我们存储了查询的结果。关键是如果新的日志插入到 `otel_logs` 表，则新值将被发送到 `bytes_per_hour` 的各自小时，并将在后台异步自动合并 - 通过只保留每小时一行，`bytes_per_hour` 将始终保持小且最新。

由于行的合并是异步的，用户查询时可能会有多于一行。为确保任何未合并的行在查询时合并，我们有两个选择：

- 使用表名上的 [`FINAL` 修饰符](/sql-reference/statements/select/from#final-modifier)（我们在上面的计数查询中这样做）。
- 按我们最终表中使用的排序键聚合，即时间戳并对指标求和。

通常，第二个选项效率更高且更灵活（表可以用于其他事情），但第一个对于某些查询可能更简单。我们在下面展示两者：

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

这将我们的查询速度从 0.6s 提升到 0.008s - 超过 75 倍！

:::note
在更大数据集和更复杂查询中的节省可能会更大。有关示例，请参见 [此处](https://github.com/ClickHouse/clickpy)。
:::
```

#### 更复杂的示例 {#a-more-complex-example}

上面的示例使用 [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree) 聚合每小时的简单计数。统计数据超出简单和的范围时，需要不同的目标表引擎： [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree)。

假设我们希望计算每天唯一 IP 地址（或唯一用户）的数量。该查询如下：

```sql
SELECT toStartOfHour(Timestamp) AS Hour, uniq(LogAttributes['remote_addr']) AS UniqueUsers
FROM otel_logs
GROUP BY Hour
ORDER BY Hour DESC

┌────────────────Hour─┬─UniqueUsers─┐
│ 2019-01-26 16:00:00 │   	4763    │
…
│ 2019-01-22 00:00:00 │    	536     │
└─────────────────────┴─────────────┘

113 行在集合中。已耗时：0.667 秒。处理了 1037 万行，4.73 GB（每秒 1553 万行，7.09 GB/s。）
```

为了持久化基数计数以进行增量更新，需要使用 AggregatingMergeTree。

```sql
CREATE TABLE unique_visitors_per_hour
(
  `Hour` DateTime,
  `UniqueUsers` AggregateFunction(uniq, IPv4)
)
ENGINE = AggregatingMergeTree
ORDER BY Hour
```

为了确保 ClickHouse 知道聚合状态将被存储，我们将 `UniqueUsers` 列定义为类型 [`AggregateFunction`](/sql-reference/data-types/aggregatefunction)，指定部分状态的函数源（uniq）和源列的类型（IPv4）。与 SummingMergeTree 一样，具有相同 `ORDER BY` 键值的行将被合并（如上例中的 Hour）。

相关的物化视图使用早期的查询：

```sql
CREATE MATERIALIZED VIEW unique_visitors_per_hour_mv TO unique_visitors_per_hour AS
SELECT toStartOfHour(Timestamp) AS Hour,
	uniqState(LogAttributes['remote_addr']::IPv4) AS UniqueUsers
FROM otel_logs
GROUP BY Hour
ORDER BY Hour DESC
```

注意我们在聚合函数的末尾添加了后缀 `State`。这确保返回的是函数的聚合状态，而不是最终结果。这将包含附加信息，以允许该部分状态与其他状态合并。

一旦数据通过 Collector 重启重新加载，我们可以确认 `unique_visitors_per_hour` 表中有 113 行可用。

```sql
SELECT count()
FROM unique_visitors_per_hour
FINAL
┌─count()─┐
│ 	113   │
└─────────┘

1 行在集合中。已耗时：0.009 秒。
```

我们的最终查询需要利用合并后缀来处理我们的函数（因为列存储部分聚合状态）：

```sql
SELECT Hour, uniqMerge(UniqueUsers) AS UniqueUsers
FROM unique_visitors_per_hour
GROUP BY Hour
ORDER BY Hour DESC

┌────────────────Hour─┬─UniqueUsers─┐
│ 2019-01-26 16:00:00 │   	 4763   │

│ 2019-01-22 00:00:00 │		 536    │
└─────────────────────┴─────────────┘

113 行在集合中。已耗时：0.027 秒。
```

注意我们在这里使用 `GROUP BY`，而不是使用 `FINAL`。
### 使用物化视图（增量）进行快速查找 {#using-materialized-views-incremental--for-fast-lookups}

用户在选择 ClickHouse 排序键时应考虑其访问模式，并使用经常在过滤和聚合子句中使用的列。这在可观察性用例中可能是限制性的，用户具有更多无法封装在单一列集合中的多样化访问模式。这可以通过内置于默认 OTel 模式中的示例来最清楚地说明。考虑跟踪的默认模式：

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

该模式优化了通过 `ServiceName`、`SpanName` 和 `Timestamp` 的过滤。在跟踪中，用户还需要能够通过特定 `TraceId` 执行查找并检索相关跟踪的 span。虽然这一点在排序键中存在，但它位于末尾意味着 [过滤效率将不会那么高](/guides/best-practices/sparse-primary-indexes#ordering-key-columns-efficiently)，并且在检索单个跟踪时，可能需要扫描大量数据。

OTel 收集器还安装了物化视图及其相关表，以解决此挑战。下表和视图显示如下：

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

该视图有效地确保 `otel_traces_trace_id_ts` 表具有追踪的最小和最大时间戳。该表按 `TraceId` 排序，允许高效检索这些时间戳。这些时间戳范围可以在查询主 `otel_traces` 表时使用。更具体地说，在按其 ID 检索跟踪时，Grafana 使用以下查询：

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

此 CTE 识别跟踪 ID `ae9226c78d1d360601e6383928e4d22d` 的最小和最大时间戳，然后使用此信息过滤主 `otel_traces` 表以获取其相关的 spans。

对于类似的访问模式，这种方法可以应用。我们在数据建模中探讨了类似的示例 [这里](/materialized-view/incremental-materialized-view#lookup-table)。
### 使用投影 {#using-projections}

ClickHouse 投影允许用户为表指定多个 `ORDER BY` 子句。

在前面的部分，我们探讨了如何在 ClickHouse 中使用物化视图预计算聚合，转换行并优化可观察性查询以适应不同的访问模式。

我们提供了一个示例，其中物化视图将行发送到目标表，该表的排序键与接收插入的原始表的排序键不同，以便优化通过跟踪 ID 的查找。

投影可以用于解决同样的问题，允许用户针对不属于主键的列进行查询优化。

理论上，这一能力可以用于为表提供多个排序键，但有一个明显的缺点：数据重复。具体而言，数据需要按照主主键的顺序写入，以及为每个投影指定的顺序。这将减慢插入速度并占用更多磁盘空间。

:::note 投影与物化视图
投影提供了许多与物化视图相同的功能，但应谨慎使用，后者通常更受欢迎。用户应在理解缺点及其适用场合的情况下使用投影。例如，虽然可以使用投影进行预计算聚合，但我们建议用户使用物化视图。
:::

<img src={observability_13}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />

考虑下面的查询，它通过 500 错误代码过滤我们的 `otel_logs_v2` 表。这很可能是日志记录的常见访问模式，用户希望按错误代码过滤：

```sql
SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent
FROM otel_logs_v2
WHERE Status = 500
FORMAT `Null`

Ok.

0 行在集合中。已耗时：0.177 秒。处理了 1037 万行，685.32 MB（每秒 5866 万行，3.88 GB/s。）
峰值内存使用量：56.54 MiB。
```

:::note 使用 Null 测量性能
我们在这里使用 `FORMAT Null` 不打印结果。这强制读取所有结果，但不返回，从而防止由于 LIMIT 提前终止查询。这只是为了显示扫描所有 1000 万行所需的时间。
:::

上述查询需要使用我们选择的排序键 `(ServiceName, Timestamp)` 进行线性扫描。虽然我们可以将 `Status` 添加到排序键的末尾，从而提高上述查询的性能，但我们也可以添加一个投影。 

```sql
ALTER TABLE otel_logs_v2 (
  ADD PROJECTION status
  (
     SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent ORDER BY Status
  )
)

ALTER TABLE otel_logs_v2 MATERIALIZE PROJECTION status
```

注意，我们必须首先创建投影，然后将其物化。后一条命令会导致数据在两种不同的顺序下存储在磁盘上。可以在创建数据时定义投影，如下所示，并将自动在数据插入时维护。

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

重要的是，如果通过 `ALTER` 创建了投影，则在发出 `MATERIALIZE PROJECTION` 命令时，其创建是异步的。用户可以通过以下查询确认此操作的进度，并等待 `is_done=1`。

```sql
SELECT parts_to_do, is_done, latest_fail_reason
FROM system.mutations
WHERE (`table` = 'otel_logs_v2') AND (command LIKE '%MATERIALIZE%')

┌─parts_to_do─┬─is_done─┬─latest_fail_reason─┐
│       	0 │   	1   │                	 │
└─────────────┴─────────┴────────────────────┘

1 行在集合中。已耗时：0.008 秒。
```

如果我们重复上述查询，可以看到性能显著提高，但需要额外的存储空间（有关如何测量此内容，请参阅 ["测量表大小与压缩"](#measuring-table-size--compression)）。

```sql
SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent
FROM otel_logs_v2
WHERE Status = 500
FORMAT `Null`

0 行在集合中。已耗时：0.031 秒。处理了 51420 行，22.85 MB（每秒 165 万行，734.63 MB/s。）
峰值内存使用量：27.85 MiB。
```

在上述示例中，我们在投影中指定了早期查询中使用的列。这将意味着只有这些指定的列才会存储在磁盘上，按 `Status` 排序。相反，如果我们在这里使用 `SELECT *`，则所有列都将被存储。虽然这将允许更多查询（使用任何列的子集）受益于投影，但将产生额外的存储。有关测量磁盘空间和压缩的信息，请参见 ["测量表大小与压缩"](#measuring-table-size--compression)。
### 次级/数据跳过索引 {#secondarydata-skipping-indices}

无论 ClickHouse 的主键如何调优，某些查询不可避免地会要求全表扫描。虽然使用物化视图（以及某些查询的投影）可以减轻这种情况，但这些需要额外的维护，并且用户需了解其可用性，以确保它们得以利用。传统关系数据库通过次级索引解决这一问题，但在类似 ClickHouse 的列式数据库中，这些索引是无效的。相反，ClickHouse 使用“跳过”索引，这可以通过允许数据库跳过没有匹配值的大块数据来显著提高查询性能。

默认 OTel 模式使用次级索引试图加速对映射的访问。我们发现这些通常是无效的，不建议将其复制到自定义模式中，但跳过索引仍然可以有用。

用户应在尝试应用它们之前阅读并理解 [次级索引指南](/optimize/skipping-indexes)。

**一般而言，当主键与目标非主列/表达式之间存在强相关性时，这些是有效的，用户正在查找稀有值，即那些在许多数据块中未出现的值。**
### 文本搜索的布隆过滤器 {#bloom-filters-for-text-search}

对于可观察性查询，当用户需要进行文本搜索时，次级索引可能会很有用。具体而言，可以使用基于 ngram 和 token 的布隆过滤器索引 [`ngrambf_v1`](/optimize/skipping-indexes#bloom-filter-types) 和 [`tokenbf_v1`](/optimize/skipping-indexes#bloom-filter-types) 加速对具有操作符 `LIKE`、`IN` 和 hasToken 的字符串列的搜索。重要的是，基于 token 的索引使用非字母数字字符作为分隔符生成 token。这意味着在查询时只能匹配 token（或完整单词）。对于更细粒度的匹配，可以使用 [N-gram 布隆过滤器](/optimize/skipping-indexes#bloom-filter-types)。该过滤器将字符串拆分为指定大小的 ngrams，从而允许子词匹配。

要评估将生成并匹配的 tokens，可以使用 `tokens` 函数：

```sql
SELECT tokens('https://www.zanbil.ir/m/filter/b113')

┌─tokens────────────────────────────────────────────┐
│ ['https','www','zanbil','ir','m','filter','b113'] │
└───────────────────────────────────────────────────┘

1 行在集合中。已耗时：0.008 秒。
```

`ngram` 函数提供类似的功能，可以将 ngram 大小指定为第二个参数：

```sql
SELECT ngrams('https://www.zanbil.ir/m/filter/b113', 3)

┌─ngrams('https://www.zanbil.ir/m/filter/b113', 3)────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ['htt','ttp','tps','ps:','s:/','://','//w','/ww','www','ww.','w.z','.za','zan','anb','nbi','bil','il.','l.i','.ir','ir/','r/m','/m/','m/f','/fi','fil','ilt','lte','ter','er/','r/b','/b1','b11','113'] │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

1 行在集合中。已耗时：0.008 秒。
```

:::note 反向索引
ClickHouse 还支持实验性的反向索引作为次级索引。目前，我们不建议将其用于日志数据集，但预计它们会在生产准备就绪时取代基于 token 的布隆过滤器。
:::

为了此示例，我们使用结构化日志数据集。假设我们希望统计 `Referer` 列中包含 `ultra` 的日志数量。

```sql
SELECT count()
FROM otel_logs_v2
WHERE Referer LIKE '%ultra%'

┌─count()─┐
│  114514 │
└─────────┘

1 行在集合中。已耗时：0.177 秒。处理了 1037 万行，908.49 MB（每秒 5857 万行，5.13 GB/s。）
```

在这里，我们需要匹配 ngram 大小为 3。我们因此创建一个 `ngrambf_v1` 索引。 

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

索引 `ngrambf_v1(3, 10000, 3, 7)` 此处带有四个参数。最后一个（值 7）表示种子。其他参数表示 ngram 大小（3）、值 `m`（过滤器大小）和哈希函数数量 `k`（7）。`k` 和 `m` 需要调优，并将基于唯一 ngram/token 的数量以及过滤器结果为假阴性（即确认某个值不在数据块中）的概率进行调整。我们建议使用 [这些函数](/engines/table-engines/mergetree-family/mergetree#bloom-filter) 来帮助确定这些值。

如果调优正确，速度提升可能会显著：

```sql
SELECT count()
FROM otel_logs_bloom
WHERE Referer LIKE '%ultra%'
┌─count()─┐
│ 	182   │
└─────────┘

1 行在集合中。已耗时：0.077 秒。处理了 422 万行，375.29 MB（每秒 5481 万行，4.87 GB/s。）
峰值内存使用量：129.60 KiB。
```

:::note 示例仅供参考
以上仅为说明性示例。我们建议用户在插入时从日志中提取结构，而不是尝试使用基于 token 的布隆过滤器优化文本搜索。然而，在某些情况下，用户可能有堆栈跟踪或其他大型字符串，对这些进行文本搜索可能会由于结构不太确定而是有用的。
:::

关于使用布隆过滤器的一些常规指南：

布隆过滤器的目标是过滤 [数据块](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design)，从而避免加载列的所有值并执行线性扫描。可以使用 `EXPLAIN` 子句，带上参数 `indexes=1`，来识别已跳过的数据块数量。考虑下面对于原始表 `otel_logs_v2` 和带有 ngram 布隆过滤器的表 `otel_logs_bloom` 的响应。

```sql
EXPLAIN indexes = 1
SELECT count()
FROM otel_logs_v2
WHERE Referer LIKE '%ultra%'

┌─explain────────────────────────────────────────────────────────────┐
│ Expression ((Project names + Projection))                      	 │
│   Aggregating                                                  	 │
│ 	Expression (Before GROUP BY)                               	     │
│   	Filter ((WHERE + Change column names to column identifiers)) │
│     	ReadFromMergeTree (default.otel_logs_v2)               	     │
│     	Indexes:                                               	     │
│       	PrimaryKey                                           	 │
│         	Condition: true                                    	     │
│         	Parts: 9/9                                         	     │
│         	Granules: 1278/1278                                	     │
└────────────────────────────────────────────────────────────────────┘

10 行在集合中。已耗时：0.016 秒。


EXPLAIN indexes = 1
SELECT count()
FROM otel_logs_bloom
WHERE Referer LIKE '%ultra%'

┌─explain────────────────────────────────────────────────────────────┐
│ Expression ((Project names + Projection))                      	 │
│   Aggregating                                                  	 │
│ 	Expression (Before GROUP BY)                               	     │
│   	Filter ((WHERE + Change column names to column identifiers)) │
│     	ReadFromMergeTree (default.otel_logs_bloom)            	     │
│     	Indexes:                                               	     │
│       	PrimaryKey                                           	 │ 
│         	Condition: true                                    	     │
│         	Parts: 8/8                                         	     │
│         	Granules: 1276/1276                                 	 │
│       	Skip                                                 	 │
│         	Name: idx_span_attr_value                          	     │
│         	Description: ngrambf_v1 GRANULARITY 1              	     │
│         	Parts: 8/8                                         	     │
│         	Granules: 517/1276                                 	     │
└────────────────────────────────────────────────────────────────────┘
```

布隆过滤器通常只会更快，如果其大小小于列本身。如果它更大，那么几乎没有性能上的好处。使用以下查询比较过滤器的大小与列的大小：

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
│ Referer │ 56.16 MiB   	│ 789.21 MiB    	│ 14.05 │
└─────────┴─────────────────┴───────────────────┴───────┘

1 行在集合中。已耗时：0.018 秒。


SELECT
	`table`,
	formatReadableSize(data_compressed_bytes) AS compressed_size,
	formatReadableSize(data_uncompressed_bytes) AS uncompressed_size
FROM system.data_skipping_indices
WHERE `table` = 'otel_logs_bloom'

┌─table───────────┬─compressed_size─┬─uncompressed_size─┐
│ otel_logs_bloom │ 12.03 MiB   	│ 12.17 MiB     	│
└─────────────────┴─────────────────┴───────────────────┘

1 行在集合中。已耗时：0.004 秒。
```

在以上示例中，我们可以看到次级布隆过滤器索引的大小为 12MB - 几乎是列本身（56MB）压缩大小的五倍。

布隆过滤器可能需要进行重大调优。我们建议遵循 [这里](https://clickhouse.com/docs/zh/engines/table-engines/mergetree-family/mergetree#bloom-filter) 的注意事项，这些可能有助于确定最佳设置。布隆过滤器在插入和合并时也可能成本高昂。用户在向生产添加布隆过滤器之前，应评估对插入性能的影响。

有关次级跳过索引的更多详细信息，可以查看 [这里](/optimize/skipping-indexes#skip-index-functions)。
### 从映射中提取 {#extracting-from-maps}

Map 类型在 OTel 模式中很普遍。此类型要求键和值具有相同的类型 - 足够用于如 Kubernetes 标签等元数据。请注意，当查询 Map 类型的子键时，将加载整个父列。如果映射具有许多键，这可能会引发显著的查询惩罚，因为需要从磁盘读取的数据比如果键存在为列时要多。

如果您经常查询特定键，请考虑将其移入专用列中。这通常是响应常见访问模式和部署后的任务，可能在生产之前很难预测。有关如何在部署后修改架构的信息，请参见 ["管理架构更改"](/observability/managing-data#managing-schema-changes)。

## 测量表大小与压缩 {#measuring-table-size--compression}

ClickHouse 用于可观察性的主要原因之一是压缩。

压缩不仅显著降低存储成本，磁盘上的数据更少意味着 I/O 更少、查询和插入更快。I/O 的减少将抵消任何压缩算法在 CPU 上的开销。因此，改善数据的压缩应成为确保 ClickHouse 查询快速的首要任务。

有关测量压缩的详细信息，请参见 [这里](/data-compression/compression-in-clickhouse)。
