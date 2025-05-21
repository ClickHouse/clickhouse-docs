---
'title': '模式设计'
'description': '为可观测性设计模式'
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


# 设计可观察性架构

我们建议用户总是为日志和跟踪创建自己的架构，原因如下：

- **选择主键** - 默认架构使用的 `ORDER BY` 是针对特定访问模式优化的。您的访问模式不太可能与此相匹配。
- **提取结构** - 用户可能希望从现有列中提取新列，例如 `Body` 列。这可以通过使用物化列（在更复杂的情况下使用物化视图）来实现。这需要架构更改。
- **优化地图** - 默认架构使用 Map 类型来存储属性。这些列允许存储任意元数据。虽然这是一个基本的能力，因为事件的元数据通常没有提前定义，因此无法以强类型数据库（如 ClickHouse）存储，访问映射键及其值的效率不如访问普通列。我们通过修改架构来解决这个问题，确保最常访问的映射键为顶层列 - 参见 ["用 SQL 提取结构"](#extracting-structure-with-sql)。这需要架构更改。
- **简化映射键访问** - 访问 Map 中的键需要更冗长的语法。用户可以通过别名来缓解这种情况。参见 ["使用别名"](#using-aliases) 来简化查询。
- **二级索引** - 默认架构使用二级索引来加速对 Maps 的访问并加快文本查询。这通常不是必需的，并且会占用额外的磁盘空间。可以使用，但应该测试以确保它们是必要的。参见 ["二级/数据跳过索引"](#secondarydata-skipping-indices)。
- **使用编解码器** - 如果用户了解预期数据并有证据表明这可以改善压缩，他们可能希望自定义列的编解码器。

_我们将在下文中详细描述上述每个用例。_

**重要:** 虽然鼓励用户扩展和修改他们的架构以达到最佳压缩和查询性能，但他们应该尽可能遵循 OTel 架构命名核心列。ClickHouse Grafana 插件假设存在一些基础的 OTel 列以协助查询构建，例如 Timestamp 和 SeverityText。日志和跟踪所需的列在这里记录 [[1]](https://grafana.com/developers/plugin-tools/tutorials/build-a-logs-data-source-plugin#logs-data-frame-format)[[2]](https://grafana.com/docs/grafana/latest/explore/logs-integration/) 和 [这里](https://grafana.com/docs/grafana/latest/explore/trace-integration/#data-frame-structure)，您可以选择更改这些列名，覆盖插件配置中的默认值。

## 用 SQL 提取结构 {#extracting-structure-with-sql}

无论是摄取结构化日志还是非结构化日志，用户通常都需要以下能力：

- **从字符串 Blob 提取列**。查询这些列的速度将比查询时使用字符串操作更快。
- **从映射中提取键**。默认架构将任意属性放入 Map 类型的列中。这种类型提供无模式的能力，这样用户在定义日志和跟踪时不需要预先定义属性的列 - 通常，在从 Kubernetes 收集日志并希望确保保留 Pod 标签以便稍后搜索时，这几乎是不可能的。访问映射键及其值的速度慢于对普通 ClickHouse 列的查询。因此，将映射键提取到根表列中通常是可取的。

考虑以下查询：

假设我们希望计算哪些 URL 路径接收的 POST 请求最多，使用结构化日志。JSON Blob 存储在 `Body` 列中作为字符串。此外，如果用户在收集器中启用了 json_parser，它也可能存储在 `LogAttributes` 列中作为 `Map(String, String)`。

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

假设 `LogAttributes` 可用，以下查询计算网站中接收 POST 请求最多的 URL 路径：

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

请注意这里使用了映射语法，例如 `LogAttributes['request_path']`，以及 [`path` 函数](/sql-reference/functions/url-functions#path) 用于去除 URL 中的查询参数。

如果用户没有在收集器中启用 JSON 解析，则 `LogAttributes` 将为空，这迫使我们使用 [JSON 函数](/sql-reference/functions/json-functions) 从字符串 `Body` 中提取列。

:::note 优先使用 ClickHouse 进行解析
我们通常建议用户在 ClickHouse 中解析结构化日志的 JSON。我们相信 ClickHouse 是最快的 JSON 解析实现。不过，我们认识到用户可能希望将日志发送到其他来源，而不是将此逻辑保留在 SQL 中。
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

现在考虑同样的处理非结构化日志：

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

对非结构化日志的类似查询需要使用正则表达式，通过 [`extractAllGroupsVertical` 函数](/sql-reference/functions/string-search-functions#extractallgroupsvertical)。

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

解析非结构化日志的查询复杂性和成本增加（注意性能差异）是我们建议用户始终使用结构化日志的原因。

:::note 考虑字典
上述查询可以优化以利用正则表达式字典。有关详细信息，请参见 [使用字典](#using-dictionaries)。
:::

通过将上述查询逻辑移到插入时间，可以使用 ClickHouse 满足这两种用例。我们将在下面探讨几种方法，强调每种方法适用的情况。

:::note OTel 还是 ClickHouse 进行处理？
用户还可以使用 OTel Collector 处理器和操作符执行处理，相关描述见 [这里](/observability/integrating-opentelemetry#processing---filtering-transforming-and-enriching)。在大多数情况下，用户会发现 ClickHouse 在资源效率和速度上显著优于收集器的处理器。使用 SQL 进行所有事件处理的主要缺点是将您的解决方案与 ClickHouse 紧密耦合。例如，用户可能希望将处理后的日志发送到 OTel 收集器以外的替代目的地，例如 S3。
:::
### 物化列 {#materialized-columns}

物化列提供了从其他列提取结构的最简单解决方案。这种列的值始终在插入时计算，无法在 INSERT 查询中指定。

:::note 开销
物化列会产生额外的存储开销，因为值在插入时会提取到新列中。
:::

物化列支持任何 ClickHouse 表达式，并可利用任何分析函数进行 [字符串处理](/sql-reference/functions/string-functions)（包括 [正则表达式和搜索](/sql-reference/functions/string-search-functions)）以及 [URL 处理](/sql-reference/functions/url-functions)，进行 [类型转换](/sql-reference/functions/type-conversion-functions)， [从 JSON 中提取值](/sql-reference/functions/json-functions) 或 [数学运算](/sql-reference/functions/math-functions)。

我们建议将物化列用于基本处理。它们对于从映射中提取值、将其提升为根列以及执行类型转换尤其有用。在非常基本的架构或与物化视图结合使用时，它们通常最有效。考虑以下架构，其中 JSON 已由收集器提取到 `LogAttributes` 列中：

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

使用 JSON 函数从字符串 `Body` 提取的等效架构可以在 [这里](https://pastila.nl/?005cbb97/513b174a7d6114bf17ecc657428cf829#gqoOOiomEjIiG6zlWhE+Sg==) 找到。

我们的三个物化视图列提取请求页面、请求类型和引用者的域名。这些列访问映射键并对其值应用函数。我们后续的查询速度显著更快：

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
物化列将默认不在 `SELECT *` 中返回。这是为了保持 `SELECT *` 的结果始终可以通过 INSERT 重新插入表中。通过设置 `asterisk_include_materialized_columns=1`，可以禁用此行为，并且可以在 Grafana 中启用（参见数据源配置中的 `Additional Settings -> Custom Settings`）。
:::
## 物化视图 {#materialized-views}

[物化视图](/materialized-views) 提供了一种更强大的工具，以对日志和跟踪应用 SQL 过滤和转换。

物化视图允许用户将计算成本从查询时间转移到插入时间。ClickHouse 物化视图只是一个触发器，它在数据块插入表时运行查询。该查询的结果将插入到第二个“目标”表中。

<Image img={observability_10} alt="物化视图" size="md"/>

:::note 实时更新
ClickHouse 中的物化视图会在数据流入其基础表时实时更新，更像是持续更新的索引。相比之下，在其他数据库中，物化视图通常是查询的静态快照，必须刷新（类似于 ClickHouse 可刷新的物化视图）。
:::

与物化视图相关的查询理论上可以是任何查询，包括聚合，尽管 [在连接方面存在限制](https://clickhouse.com/blog/using-materialized-views-in-clickhouse#materialized-views-and-joins)。对于日志和跟踪所需的转换和过滤工作负载，用户可以考虑任何 `SELECT` 语句。

用户应记住，查询只是一个触发器，由插入到表中的行（源表）执行，结果发送到新表（目标表）。

为了确保我们不在源表和目标表中持久化数据两次，我们可以将源表的表更改为 [Null 表引擎](/engines/table-engines/special/null)，从而保留原始架构。我们的 OTel 收集器将继续将数据发送到该表。例如，对于日志，`otel_logs` 表变为：

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

Null 表引擎是一种强大的优化 - 可以将其视为 `/dev/null`。该表将不存储任何数据，但任何附加的物化视图仍将在插入的行上执行，然后再被丢弃。

考虑以下查询。这将我们的行转换为我们希望保留的格式，从 `LogAttributes` 中提取所有列（我们假设这已由收集器使用 `json_parser` 操作符设置），设置 `SeverityText` 和 `SeverityNumber`（基于某些简单条件和 [这些列](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-severitytext) 的定义）。在这种情况下，我们还只选择我们知道将被填充的列 - 忽略 `TraceId`、`SpanId` 和 `TraceFlags` 等列。

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

我们还提取了上面的 `Body` 列 - 以防后续添加了我们 SQL 未提取的其他属性。该列在 ClickHouse 中应该压缩良好，并且访问频率很低，因此不会影响查询性能。最后，我们将时间戳减少为 DateTime （以节省空间 - 参见 ["优化类型"](#optimizing-types)）并进行了类型转换。

:::note 条件
注意上述用于提取 `SeverityText` 和 `SeverityNumber` 的 [条件函数](/sql-reference/functions/conditional-functions)。这些对于制定复杂条件和检查映射中的值是否设置极其有用 - 我们天真地假设 `LogAttributes` 中所有键都存在。我们建议用户熟悉它们 - 它们是日志解析中的好帮手，除了处理 [null 值](/sql-reference/functions/functions-for-nulls) 的函数之外！
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

这里选择的类型基于 ["优化类型"](#optimizing-types) 中讨论的优化。

:::note
注意我们已经显著改变了我们的架构。实际上，用户可能还会有希望保留的 Trace 列以及 `ResourceAttributes` 列（这通常包含 Kubernetes 元数据）。Grafana 可以利用 Trace 列提供日志与跟踪之间的链接功能 - 参见 ["使用 Grafana"](/observability/grafana)。
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

以上内容可视化如下：

<Image img={observability_11} alt="Otel MV" size="md"/>

如果我们现在重新启动在 ["导出到 ClickHouse"](/observability/integrating-opentelemetry#exporting-to-clickhouse) 中使用的收集器配置，则数据将以我们期望的格式出现在 `otel_logs_v2` 中。注意使用了类型化的 JSON 提取函数。

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

一个等效的物化视图，通过使用 JSON 函数从 `Body` 列提取列如下：

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

上述物化视图依赖于隐式转换 - 尤其是在使用 `LogAttributes` 映射时。ClickHouse 通常会透明地将提取值转换为目标表类型，从而减少所需的语法。然而，我们建议用户始终通过使用具有相同架构的目标表的 `SELECT` 语句结合 [`INSERT INTO`](/sql-reference/statements/insert-into) 语句测试他们的视图。这应能确认类型是否正确处理。特别注意以下情况：

- 如果映射中不存在键，将返回空字符串。对于数字，用户需要将它们映射到适当的值。这可以使用 [条件](/sql-reference/functions/conditional-functions) 例如 `if(LogAttributes['status'] = ", 200, LogAttributes['status'])` 或 [cast 函数](/sql-reference/functions/type-conversion-functions) 如果默认值是可以接受的，例如 `toUInt8OrDefault(LogAttributes['status'] )`
- 某些类型将不总是被转换，例如数字的字符串表示不会被转换为枚举值。
- JSON 提取函数返回默认值类型，如果没有找到值。确保这些值有意义！

:::note 避免 Nullable
避免在 Clickhouse 中对可观察性数据使用 [Nullable](/sql-reference/data-types/nullable)。在日志和跟踪中，区分空和 null 很少是必要的。该特性会产生额外的存储开销，并对查询性能产生负面影响。有关更多详细信息，请参见 [这里](/data-modeling/schema-design#optimizing-types)。
:::
## 选择主（排序）键 {#choosing-a-primary-ordering-key}

在提取出所需列后，您可以开始优化您的排序/主键。

可以应用一些简单规则来帮助选择排序键。以下有时可能会产生冲突，因此请按顺序考虑这些。用户可以通过此过程识别出多个键，通常 4-5 个键就足够：

1. 选择与常见过滤器和访问模式对齐的列。如果用户通常通过特定列（例如 Pod 名称）开始可观察性调查，该列将频繁用于 `WHERE` 子句。在排序键中优先包含这些列，而非使用频率较低的列。
2. 优选那些在过滤时有助于排除大量行的列，从而减少读取的数据量。服务名称和状态代码通常是好的候选者 - 在后者的情况下，仅在用户过滤的值排除了大部分行时，例如，过滤 200s 将在大多数系统中匹配大多数行，而 500 错误通常只对应少量子集。
3. 优选那些可能与表中其他列高度相关的列。这将有助于确保这些值也被连续存储，从而提高压缩。
4. 对排序键列的 `GROUP BY` 和 `ORDER BY` 操作可以变得更加内存高效。

<br />

在识别排序键的列子集后，必须按特定顺序声明这些列。此顺序可以显著影响查询中对二级键列过滤的效率以及表数据文件的压缩比率。一般来说，**最好按基数的升序排列键**。这应与排序键中后出现的列的过滤效率较低这一事实平衡。平衡这些行为并考虑您的访问模式。最重要的是，测试不同的变体。要进一步了解排序键及如何优化它们，我们推荐 [这篇文章](/guides/best-practices/sparse-primary-indexes)。

:::note 先结构
我们建议在结构化日志后再决定排序键。请勿在属性映射中使用键作为排序键或 JSON 提取表达式。确保将排序键作为根列放在表中。
:::
## 使用映射 {#using-maps}

之前的示例展示了如何使用映射语法 `map['key']` 访问 `Map(String, String)` 列中的值。除了使用映射符号访问嵌套键外，还可以使用专业的 ClickHouse [映射函数](/sql-reference/functions/tuple-map-functions#mapkeys) 来过滤或选择这些列。

例如，以下查询使用 [`mapKeys` 函数](/sql-reference/functions/tuple-map-functions#mapkeys) 和 [`groupArrayDistinctArray` 函数](/sql-reference/aggregate-functions/combinators)（一个组合器）识别 `LogAttributes` 列中所有唯一的键。

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
我们不建议在 Map 列名中使用点，可能会弃用其用法。使用下划线 `_`。
:::
## 使用别名 {#using-aliases}

查询映射类型比查询普通列慢 - 参见 ["加速查询"](#accelerating-queries)。此外，它的语法更加复杂，用户编写时可能会感到繁琐。为了解决这个问题，我们建议使用别名列。

别名列在查询时计算，且不存储在表中。因此，不可能将值插入到这种类型的列中。使用别名，我们可以引用映射键并简化语法，透明地将映射条目暴露为普通列。考虑以下示例：

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

我们有几个物化列和一个 `ALIAS` 列 `RemoteAddr`，该列访问映射 `LogAttributes`。我们现在可以通过这个列查询 `LogAttributes['remote_addr']` 的值，从而简化我们的查询，即：

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

此外，通过 `ALTER TABLE` 命令添加 `ALIAS` 是微不足道的。这些列可以立即使用，例如：

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
默认情况下，`SELECT *` 排除别名列。可以通过设置 `asterisk_include_alias_columns=1` 禁用此行为。
:::
## 优化类型 {#optimizing-types}

[Clickhouse 一般最佳实践](/data-modeling/schema-design#optimizing-types) 中的优化类型适用于 ClickHouse 用例。
## 使用编解码器 {#using-codecs}

除了类型优化之外，用户在尝试优化 ClickHouse 可观察性架构的压缩时，可以遵循 [编解码器的一般最佳实践](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec)。

一般来说，用户会发现 `ZSTD` 编解码器非常适用于日志和跟踪数据集。提高其默认值 1 的压缩值可能会改善压缩效果。然而，这应经过测试，因为更高的值在插入时会造成更大的 CPU 开销。通常，增加这一数值很少会带来好处。

此外，时间戳虽然在压缩方面受益于增量编码，但如果在主/排序键中使用该列，可能会导致查询性能下降。我们建议用户评估各自的压缩与查询性能之间的权衡。
## 使用字典 {#using-dictionaries}

[字典](/sql-reference/dictionaries) 是 ClickHouse 的一个 [关键特性](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)，提供来自各种内部和外部 [源](/sql-reference/dictionaries#dictionary-sources) 的内存 [键值](https://en.wikipedia.org/wiki/Key%E2%80%93value_database) 表示，用于超级低延迟的查找查询。

<Image img={observability_12} alt="可观察性和字典" size="md"/>

在各种场景中，这非常方便，从即时丰富输入数据而不减慢摄取过程，到总体上提高查询性能，特别是 JOIN 受益于此。
虽然在可观察性用例中，JOIN 很少是必需的，但字典在丰富目的上仍然方便 - 无论是在插入时间还是查询时间。我们在下面提供这两者的示例。

:::note 加速 JOIN
希望通过字典加速 JOIN 的用户可以在 [这里](/dictionary) 找到进一步详细信息。
:::
### 插入时间 vs 查询时间 {#insert-time-vs-query-time}

字典可以用来在查询时间或插入时间丰富数据集。这两种方法各有优缺点。总结如下：

- **插入时间** - 如果丰富值不变且存在于可以用于填充字典的外部源，则通常合适。在这种情况下，在插入时间丰富行避免了查询时间到字典的查找。这会增加插入性能的成本以及额外的存储开销，因为丰富的值将作为列存储。
- **查询时间** - 如果字典中的值频繁变化，查询时间查找通常更为适用。这避免了在映射值变化时需要更新列（并重写数据）。然而，这种灵活性会以查询时间查找成本为代价。如果对许多行需要执行查找，例如在过滤子句中使用字典查找，这种查询时间成本通常较高。对于结果丰富，即在 `SELECT` 中，这种开销通常不明显。

我们建议用户熟悉字典的基础知识。字典提供了一个内存查找表，可以使用专用的 [专业函数](/sql-reference/functions/ext-dict-functions#dictgetall) 获取值。

有关简单丰富示例，请参见字典 [这里](https://dictionary)。下面，我们集中于常见的可观察性丰富任务。
### 使用 IP 字典 {#using-ip-dictionaries}

使用 IP 地址通过经纬度值丰富日志和跟踪是一个常见的可观察性需求。我们可以使用 `ip_trie` 结构字典来实现这一点。

我们使用公开提供的 [DB-IP 城市级数据集](https://github.com/sapics/ip-location-db#db-ip-database-update-monthly)，该数据集由 [DB-IP.com](https://db-ip.com/) 提供，遵循 [CC BY 4.0 许可](https://creativecommons.org/licenses/by/4.0/)。

从 [自述文件](https://github.com/sapics/ip-location-db#csv-format) 中，我们可以看到数据结构如以下所示：

```csv
| ip_range_start | ip_range_end | country_code | state1 | state2 | city | postcode | latitude | longitude | timezone |
```

鉴于此结构，我们先通过 [url()](/sql-reference/table-functions/url) 表函数查看数据：

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

为了便利起见，我们使用 [`URL()`](/engines/table-engines/special/url) 表引擎创建一个 ClickHouse 表对象，命名字段并确认总行数：

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

因为我们的 `ip_trie` 字典要求 IP 地址范围以 CIDR 表示，我们需要转换 `ip_range_start` 和 `ip_range_end`。

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
在上述查询中，有许多内容。感兴趣的用户可以阅读这一极好的 [解释](https://clickhouse.com/blog/geolocating-ips-in-clickhouse-and-grafana#using-bit-functions-to-convert-ip-ranges-to-cidr-notation)。否则，请接受上述内容计算了 IP 范围的 CIDR。
:::

对于我们的目的，我们只需要 IP 范围、国家代码和坐标，因此让我们创建一个新表并插入我们的 Geo IP 数据：

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

为了在 ClickHouse 中执行低延迟 IP 查找，我们将利用字典在内存中存储关键 -> 属性映射的 Geo IP 数据。ClickHouse 提供 `ip_trie` [字典结构](/sql-reference/dictionaries#ip_trie)，将我们的网络前缀（CIDR 块）映射到坐标和国家代码。以下查询使用此布局指定字典，并以上述表作为源。

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

我们可以从字典中选择行并确认这个数据集可用于查找：

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
ClickHouse 中的字典会根据基础表数据和使用的生命周期子句进行定期刷新。要更新我们的 Geo IP 字典以反映 DB-IP 数据集中的最新更改，我们只需将数据从 geoip_url 远程表重新插入到我们 `geoip` 表中，并应用变换。
:::

现在我们已经将 Geo IP 数据加载到我们的 `ip_trie` 字典中（同样也被命名为 `ip_trie`），我们可以用它进行 IP 地理定位。这可以通过使用 [`dictGet()` 函数](/sql-reference/functions/ext-dict-functions) 如下完成：

```sql
SELECT dictGet('ip_trie', ('country_code', 'latitude', 'longitude'), CAST('85.242.48.167', 'IPv4')) AS ip_details

┌─ip_details──────────────┐
│ ('PT',38.7944,-9.34284) │
└─────────────────────────┘

1 row in set. Elapsed: 0.003 sec.
```

注意检索速度。这使我们能够丰富日志。在这种情况下，我们选择 **执行查询时间丰富**。

返回到我们原始日志数据集，我们可以使用上述内容按国家聚合日志。假设我们使用的架构是之前物化视图的结果，并具有提取的 `RemoteAddress` 列。

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

由于 IP 到地理位置的映射可能会改变，用户可能希望了解请求在做出时的来源，而不是相同地址的当前地理位置。因此，在这里更可能希望进行索引时间丰富。这可以通过物化列或在物化视图的选择中显示出来，如下所示：

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
用户可能希望 IP 丰富字典根据新数据定期更新。这可以通过字典的 `LIFETIME` 子句来实现，该子句将导致字典定期从基础表重新加载。要更新基础表，请参见 ["可刷新的物化视图"](/materialized-view/refreshable-materialized-view)。
:::

上述国家和坐标提供了超越按国家分组和过滤的可视化能力。有关灵感，请参见 ["可视化地理数据"](/observability/grafana#visualizing-geo-data)。
### 使用正则字典（用户代理解析） {#using-regex-dictionaries-user-agent-parsing}

解析 [用户代理字符串](https://en.wikipedia.org/wiki/User_agent) 是一个经典的正则表达式问题，也是日志和跟踪数据集的常见需求。ClickHouse 提供高效的用户代理解析，使用正则表达式树字典。

正则表达式树字典在 ClickHouse 开源中定义为 YAMLRegExpTree 字典源类型，提供指向包含正则表达式树的 YAML 文件的路径。如果您希望提供自己的正则表达式字典，可以在 [这里](https://sql-reference/dictionaries#use-regular-expression-tree-dictionary-in-clickhouse-open-source) 找到所需结构的详细信息。下面我们重点介绍使用 [uap-core](https://github.com/ua-parser/uap-core) 进行用户代理解析，并加载我们支持的 CSV 格式字典。这种方法与 OSS 和 ClickHouse Cloud 兼容。

:::note
在下面的示例中，我们使用 2024 年 6 月的最新 uap-core 用户代理解析正则表达式快照。可以在 [这里](https://raw.githubusercontent.com/ua-parser/uap-core/master/regexes.yaml) 找到最新文件，该文件会定期更新。用户可以按照 [这里](https://sql-reference/dictionaries#collecting-attribute-values) 的步骤加载到下面使用的 CSV 文件中。
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

这些表可以从以下公开托管的 CSV 文件中填充，使用 url 表函数：

```sql
INSERT INTO regexp_os SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_os.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')

INSERT INTO regexp_device SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_device.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')

INSERT INTO regexp_browser SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_browser.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')
```

填充内存表后，我们可以加载我们的正则表达式字典。请注意，我们需要将关键值指定为列 - 这些将是我们可以从用户代理中提取的属性。

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

加载完这些字典后，我们可以提供一个示例用户代理并测试我们的字典提取能力：

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

鉴于与用户代理相关的规则很少会改变，字典只需根据新的浏览器、操作系统和设备进行更新，因此，在插入时间执行此提取是合理的。

我们可以通过物化列或使用物化视图执行此操作。以下是我们修改之前使用的物化视图：

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

这要求我们修改目标表 `otel_logs_v2` 的架构：

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

在重新启动收集器并按之前记录的步骤摄取结构化日志后，我们可以查询新提取的 Device、Browser 和 Os 列。

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

:::note 适用于复杂结构的元组
注意这些用户代理列使用了元组。元组被推荐用于层次结构已知的复杂结构，子列提供与常规列相同的性能（与映射键不同），同时允许异构类型。
:::
### 进一步阅读 {#further-reading}

关于字典的更多示例和细节，我们推荐以下文章：

- [高级字典主题](/dictionary#advanced-dictionary-topics)
- ["使用字典加速查询"](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)
- [字典](/sql-reference/dictionaries)
## 加速查询 {#accelerating-queries}

ClickHouse 支持多种加速查询性能的技术。在选择适当的主键/排序键以优化最常见的访问模式并最大化压缩之前，应考虑以下内容。这通常会对性能产生最大的影响，并且付出的努力最小。
### 使用物化视图（增量）进行聚合 {#using-materialized-views-incremental-for-aggregations}

在之前的部分中，我们探讨了物化视图在数据转换和过滤中的使用。然而，物化视图还可以用于在插入时预计算聚合并存储结果。该结果可以通过后续插入的结果进行更新，从而有效允许在插入时预计算聚合。

这里的主要思想是，结果通常会比原始数据的表示更小（在聚合的情况下为部分草图）。将其与从目标表读取结果的更简单查询结合时，查询时间将比在原始数据上执行相同计算时要快。

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

我们可以想象这可能是用户与 Grafana 绘制的常见折线图。该查询确实非常快速——数据集仅有 1000 万行，而 ClickHouse 非常快！但是，如果我们将其扩展到数十亿和数万亿行，我们希望保持这种查询性能。

:::note
如果我们使用 `otel_logs_v2` 表（它来自于我们之前的物化视图，提取 `LogAttributes` 映射中的大小键），则这个查询将快 10 倍。我们在这里使用原始数据仅供说明，建议在这是常见查询的情况下使用之前的视图。
:::

如果我们希望使用物化视图在插入时计算此内容，则需要一个表以接收结果。该表应只保持每小时 1 行。如果接收到对现有小时的更新，其他列应合并到现有小时的行中。为了实现增量状态的合并，必须为其他列存储部分状态。

这需要在 ClickHouse 中使用特殊的引擎类型：SummingMergeTree。这将用包含数值列的和的行替换所有具有相同排序键的行。以下表将合并任何具有相同日期的行，汇总任何数值列。

```sql
CREATE TABLE bytes_per_hour
(
  `Hour` DateTime,
  `TotalBytes` UInt64
)
ENGINE = SummingMergeTree
ORDER BY Hour
```

为了演示我们的物化视图，假设我们的 `bytes_per_hour` 表是空的，尚未接收任何数据。我们的物化视图在插入到 `otel_logs` 的数据上执行上述 `SELECT`（这将针对配置大小的块执行），然后将结果发送到 `bytes_per_hour`。语法如下所示：

```sql
CREATE MATERIALIZED VIEW bytes_per_hour_mv TO bytes_per_hour AS
SELECT toStartOfHour(Timestamp) AS Hour,
       sum(toUInt64OrDefault(LogAttributes['size'])) AS TotalBytes
FROM otel_logs
GROUP BY Hour
```

这里的 `TO` 子句是关键，表示结果将被发送到 `bytes_per_hour`。

如果我们重新启动我们的 OTel Collector 并重新发送日志，那么 `bytes_per_hour` 表将随着上述查询结果的逐步填充而更新。完成后，我们可以确认我们的 `bytes_per_hour` 的大小 - 我们应该每小时有 1 行：

```sql
SELECT count()
FROM bytes_per_hour
FINAL

┌─count()─┐
│     113 │
└─────────┘

1 row in set. Elapsed: 0.039 sec.
```

通过存储查询的结果，我们实际上将行数从 1000 万行（在 `otel_logs` 中）减少到了 113 行。关键是，如果新的日志被插入到 `otel_logs` 表中，则新的值将被发送到 `bytes_per_hour` 的相关小时，在那里它们将被自动异步合并 - 通过保持每小时仅 1 行，`bytes_per_hour` 将始终既小又最新。

由于行的合并是异步的，当用户查询时，每小时可能会有多于一行。为了确保在查询时合并任何未完成的行，我们有两个选择：

- 在表名上使用 [`FINAL` 修饰符](/sql-reference/statements/select/from#final-modifier)（我们在上面的计数查询中使用了它）。
- 按我们最终表中使用的排序键聚合，即时间戳，汇总指标。

通常，第二个选项更有效且灵活（该表可以用于其他目的），但第一个选项对于某些查询可能更简单。我们在下面展示了这两种方式：

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

这将我们的查询速度从 0.6 秒提升到了 0.008 秒 - 超过了 75 倍！

:::note
在较大的数据集和更复杂的查询中，这些节省可能会更大。可以在 [这里](https://github.com/ClickHouse/clickpy) 查看示例。
:::
#### 更复杂的示例 {#a-more-complex-example}

上述示例使用 [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree) 聚合每小时的简单计数。超出简单求和的统计需要不同的目标表引擎：[AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree)。

假设我们希望计算每天唯一 IP 地址（或唯一用户）的数量。实现此功能的查询为：

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

为了确保 ClickHouse 知道聚合状态将被存储，我们将 `UniqueUsers` 列定义为类型 [`AggregateFunction`](/sql-reference/data-types/aggregatefunction)，指定部分状态的函数源（uniq）和源列的类型（IPv4）。像 SummingMergeTree 一样，具有相同 `ORDER BY` 键值的行将被合并（上述示例中的小时）。

相关的物化视图使用之前的查询：

```sql
CREATE MATERIALIZED VIEW unique_visitors_per_hour_mv TO unique_visitors_per_hour AS
SELECT toStartOfHour(Timestamp) AS Hour,
        uniqState(LogAttributes['remote_addr']::IPv4) AS UniqueUsers
FROM otel_logs
GROUP BY Hour
ORDER BY Hour DESC
```

注意我们在聚合函数的末尾附加了后缀 `State`。这确保返回函数的聚合状态，而不是最终结果。这将包含附加信息，以允许该部分状态与其他状态合并。

一旦数据通过 Collector 重启重新加载，我们可以确认 `unique_visitors_per_hour` 表中有 113 行可用。

```sql
SELECT count()
FROM unique_visitors_per_hour
FINAL
┌─count()─┐
│   113   │
└─────────┘

1 row in set. Elapsed: 0.009 sec.
```

我们的最终查询需要使用合并后缀来调用我们的函数（因为列存储了部分聚合状态）：

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

请注意，我们在这里使用了 `GROUP BY`，而不是使用 `FINAL`。
### 使用物化视图（增量）进行快速查找 {#using-materialized-views-incremental--for-fast-lookups}

用户在选择 ClickHouse 排序键时，应考虑他们的访问模式，并选择在过滤和聚合子句中频繁使用的列。在可观察性用例中，这可能是限制性的，因为用户具有更多无法封装在一组列中的多样化访问模式。这在内置于默认 OTel 模式的示例中得到了最佳说明。考虑默认的跟踪架构：

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

此架构针对 `ServiceName`、`SpanName` 和 `Timestamp` 的过滤进行了优化。在跟踪中，用户还需要能够通过特定的 `TraceId` 进行查找并检索相关跟踪的跨度。虽然这个选项在排序键中存在，但其位于末尾意味着 [过滤效率将不高](/guides/best-practices/sparse-primary-indexes#ordering-key-columns-efficiently)，并且在检索单个跟踪时可能需要扫描大量数据。

OTel Collector 还安装了一个物化视图和相关表以解决此挑战。表和视图如下所示：

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

该视图有效地确保表 `otel_traces_trace_id_ts` 具有跟踪的最小和最大时间戳。此表按 `TraceId` 排序，可有效检索这些时间戳。这些时间戳范围可以在查询主 `otel_traces` 表时使用。更具体地说，在通过 id 检索跟踪时，Grafana 使用以下查询：

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

此处的 CTE 确定跟踪 id `ae9226c78d1d360601e6383928e4d22d` 的最小和最大时间戳，然后使用此信息过滤主 `otel_traces` 的相关跨度。

对于类似的访问模式，可以应用相同的方法。我们在数据建模中探讨了一个类似的示例 [这里](/materialized-view/incremental-materialized-view#lookup-table)。
### 使用投影 {#using-projections}

ClickHouse 的投影允许用户为表指定多个 `ORDER BY` 子句。

在之前的部分中，我们探讨了物化视图在 ClickHouse 中如何用于预计算聚合、转换行和优化可观察性查询以适应不同的访问模式。

我们提供了一个示例，其中物化视图将行发送到具有不同排序键的目标表，以优化通过跟踪 ID 的查找。

投影可用于解决同样的问题，使用户能够针对不是主键一部分的列优化查询。

理论上，这种能力可以为表提供多个排序键，但有一个明显的缺点：数据重复。具体来说，数据需要按照主主键的顺序写入，此外还需要按照每个投影指定的顺序写入。这将减慢插入速度并消耗更多磁盘空间。

:::note 投影与物化视图
投影提供与物化视图相同的许多功能，但应该谨慎使用，通常更倾向于后者。用户应了解缺点以及何时使用它们。例如，虽然投影可用于预计算聚合，但我们建议用户使用物化视图来实现这一点。
:::

<Image img={observability_13} alt="Observability and projections" size="md"/>

考虑以下查询，该查询通过 500 个错误代码过滤我们的 `otel_logs_v2` 表。这可能是用户希望按错误代码过滤的日志记录的常见访问模式：

```sql
SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent
FROM otel_logs_v2
WHERE Status = 500
FORMAT `Null`

Ok.

0 rows in set. Elapsed: 0.177 sec. Processed 10.37 million rows, 685.32 MB (58.66 million rows/s., 3.88 GB/s.)
Peak memory usage: 56.54 MiB.
```

:::note 使用 Null 来测量性能
我们在这里不使用 `FORMAT Null` 打印结果。这迫使所有结果被读取但不返回，从而防止由于 LIMIT 提前终止查询。这只是为了显示扫描所有 1 千万行所花费的时间。
:::

上述查询需要针对我们选择的排序键 `(ServiceName, Timestamp)` 进行线性扫描。虽然我们可以将 `Status` 添加到排序键的末尾，从而提高上述查询的性能，但我们也可以添加一个投影。

```sql
ALTER TABLE otel_logs_v2 (
  ADD PROJECTION status
  (
     SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent ORDER BY Status
  )
)

ALTER TABLE otel_logs_v2 MATERIALIZE PROJECTION status
```

请注意，我们必须先创建投影，然后对其进行物化。后者命令使数据在两种不同的排序方式下在磁盘上存储两次。投影也可以在数据创建时定义，如下所示，并将随着数据的插入而自动维护。

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

重要的是，如果通过 `ALTER` 创建投影，则在发布 `MATERIALIZE PROJECTION` 命令时，其创建是异步的。用户可以通过以下查询确认此操作的进度，等待 `is_done=1`。

```sql
SELECT parts_to_do, is_done, latest_fail_reason
FROM system.mutations
WHERE (`table` = 'otel_logs_v2') AND (command LIKE '%MATERIALIZE%')

┌─parts_to_do─┬─is_done─┬─latest_fail_reason─┐
│           0 │     1   │                    │
└─────────────┴─────────┴────────────────────┘

1 row in set. Elapsed: 0.008 sec.
```

如果我们重复上述查询，可以看到性能在额外存储的代价下显著提高（请参见 ["测量表大小与压缩"](#measuring-table-size--compression) 以了解如何测量这一点）。

```sql
SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent
FROM otel_logs_v2
WHERE Status = 500
FORMAT `Null`

0 rows in set. Elapsed: 0.031 sec. Processed 51.42 thousand rows, 22.85 MB (1.65 million rows/s., 734.63 MB/s.)
Peak memory usage: 27.85 MiB.
```

在上述示例中，我们在投影中指定了用于之前查询的列。这将意味着只有这些指定的列将按状态作为投影的一部分存储在磁盘上。如果相反，我们在这里使用 `SELECT *`，所有列都将被存储。虽然这将允许更多查询（使用任何列子集）受益于投影，但将导致额外的存储开销。有关测量磁盘空间和压缩的更多信息，请参见 ["测量表大小与压缩"](#measuring-table-size--compression)。
### 次级/数据跳过索引 {#secondarydata-skipping-indices}

无论主键在 ClickHouse 中调优得多好，一些查询必然会要求全表扫描。尽管可以使用物化视图（对于某些查询还可以使用投影）来缓解这些情况，但这些需要额外维护，用户也需要了解它们的可用性以确保它们被充分利用。虽然传统关系数据库通过次级索引来解决此问题，但这些在列式数据库（如 ClickHouse）中是无效的。相反，ClickHouse 使用“跳过”索引，可以允许数据库跳过没有匹配值的大数据块，从而显著提高查询性能。

默认 OTel 架构使用次级索引来加速对映射的访问。尽管我们发现这些通常无效，并不建议将其复制到您自定义架构中，但跳过索引仍然可以是有用的。

用户应在尝试应用它们之前阅读并了解 [次级索引指南](/optimize/skipping-indexes)。

**一般来说，当主键与目标的非主列/表达式之间存在强相关时，它们在查找稀少值（即在许多分组中未出现的值）时是有效的。**
### Bloom 过滤器用于文本搜索 {#bloom-filters-for-text-search}

对于可观察性查询，当用户需要进行文本搜索时，次级索引可能很有用。特别是，基于 ngram 和 token 的 bloom 过滤器索引 [`ngrambf_v1`](/optimize/skipping-indexes#bloom-filter-types) 和 [`tokenbf_v1`](/optimize/skipping-indexes#bloom-filter-types) 可用于加速对字符串列的搜索，操作符包括 `LIKE`、`IN` 和 hasToken。重要的是，基于 token 的索引使用非字母数字字符作为分隔符生成 token。这意味着只有在查询时才能匹配 token（或整个单词）。要进行更细粒度的匹配，可以使用 [N-gram bloom 过滤器](/optimize/skipping-indexes#bloom-filter-types)。这将字符串分割为指定大小的 ngrams，从而允许子词匹配。

要评估将生成并因此匹配的 tokens，可以使用 `tokens` 函数：

```sql
SELECT tokens('https://www.zanbil.ir/m/filter/b113')

┌─tokens────────────────────────────────────────────┐
│ ['https','www','zanbil','ir','m','filter','b113'] │
└───────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.008 sec.
```

`ngram` 函数提供类似功能，可以在第二个参数中指定 `ngram` 的大小：

```sql
SELECT ngrams('https://www.zanbil.ir/m/filter/b113', 3)

┌─ngrams('https://www.zanbil.ir/m/filter/b113', 3)────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ['htt','ttp','tps','ps:','s:/','://','//w','/ww','www','ww.','w.z','.za','zan','anb','nbi','bil','il.','l.i','.ir','ir/','r/m','/m/','m/f','/fi','fil','ilt','lte','ter','er/','r/b','/b1','b11','113'] │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.008 sec.
```

:::note 倒排索引
ClickHouse 还对作为次级索引的倒排索引提供实验性支持。我们目前不建议将其用于日志数据集，但预计它们将在准备好投入生产时取代基于 token 的 bloom 过滤器。
:::

为了这个例子，我们使用结构化日志数据集。假设我们希望计数 `Referer` 列中包含 `ultra` 的日志。

```sql
SELECT count()
FROM otel_logs_v2
WHERE Referer LIKE '%ultra%'

┌─count()─┐
│  114514 │
└─────────┘

1 row in set. Elapsed: 0.177 sec. Processed 10.37 million rows, 908.49 MB (58.57 million rows/s., 5.13 GB/s.)
```

在这里，我们需要匹配 ngram 大小为 3。因此，我们创建一个 `ngrambf_v1` 索引。

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

索引 `ngrambf_v1(3, 10000, 3, 7)` 这里有四个参数。最后一个（值 7）代表种子。其他参数分别表示 ngram 大小（3）、值 `m`（过滤器大小）和哈希函数数量 `k`（7）。`k` 和 `m` 需要调优，将基于唯一 ngrams/tokens 的数量和过滤器导致真实负的概率——从而确认值不在分组中。我们建议使用 [这些函数](/engines/table-engines/mergetree-family/mergetree#bloom-filter) 来帮助建立这些值。

如果调优正确，速度提升可能会显著：

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
上述内容仅为示例。我们建议用户在插入时从日志中提取结构，而不是尝试使用基于 token 的 bloom 过滤器来优化文本搜索。然而，在某些情况下，用户可能具有 stack traces 或其他大型字符串，其中由于结构的不确定性，文本搜索可能会很有用。
:::

一些关于使用 bloom 过滤器的一般指导：

bloom 的目标是过滤 [分组](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design)，从而避免加载某列的所有值并执行线性扫描。`EXPLAIN` 子句，带参数 `indexes=1` 可用于确定跳过的分组数量。考虑以下关于原始表 `otel_logs_v2` 和带有 ngram bloom 过滤器的表 `otel_logs_bloom` 的响应。

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

当 bloom 过滤器小于列本身时，其通常才会更快。如果它更大，则很可能性能提升微乎其微。使用以下查询比较过滤器的大小与列的大小：

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

在上述示例中，我们可以看到次级 bloom 过滤器索引的大小为 12MB——几乎是列本身压缩大小（56MB）的 5 倍。

Bloom 过滤器可能需要显著调优。我们建议遵循 [这里](/engines/table-engines/mergetree-family/mergetree#bloom-filter) 的说明，这可能会帮助识别最佳设置。在插入和合并时，Bloom 过滤器也可能很昂贵。用户在将 Bloom 过滤器添加到生产之前，应评估对插入性能的影响。

有关次级跳过索引的更多详细信息，请参见 [这里](/optimize/skipping-indexes#skip-index-functions)。
### 从映射中提取 {#extracting-from-maps}

Map 类型在 OTel 架构中广泛存在。此类型要求值和键具有相同的类型——这对于 Kubernetes 标签等元数据来说是足够的。请注意，当查询 Map 类型的子键时，整个父列都会被加载。如果映射具有许多键，那么由于需要从磁盘读取的数据量将比如果键作为列存在时多，这可能会产生显著的查询惩罚。

如果您经常查询特定键，请考虑将其移动到根目录下的专用列中。这通常是在响应于常见访问模式并在部署后进行的任务，并且在生产之前可能很难预测。请参见 ["管理架构变化"](/observability/managing-data#managing-schema-changes) 以了解如何在部署后修改架构。
## 测量表大小和压缩 {#measuring-table-size--compression}

ClickHouse 用于可观察性的主要原因之一是压缩。

除了显著降低存储成本外，磁盘上更少的数据意味着更少的输入/输出和更快的查询和插入。输入/输出的减少将超过任何压缩算法的 CPU 开销。因此，在确保 ClickHouse 查询快速时，改善数据的压缩应该是首要任务。

有关测量压缩的详细信息，请参见 [这里](/data-compression/compression-in-clickhouse)。
