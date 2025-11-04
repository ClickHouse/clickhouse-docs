---
'title': '架构设计'
'description': '为可观察性设计架构设计'
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
'doc_type': 'guide'
---

import observability_10 from '@site/static/images/use-cases/observability/observability-10.png';
import observability_11 from '@site/static/images/use-cases/observability/observability-11.png';
import observability_12 from '@site/static/images/use-cases/observability/observability-12.png';
import observability_13 from '@site/static/images/use-cases/observability/observability-13.png';
import Image from '@theme/IdealImage';


# 设计可观测性架构

我们建议用户始终为日志和追踪创建自己的架构，原因如下：

- **选择主键** - 默认架构使用优化特定访问模式的`ORDER BY`。您的访问模式不太可能与此对齐。
- **提取结构** - 用户可能希望从现有列（例如`Body`列）中提取新列。可以使用物化列（在更复杂的情况下使用物化视图）实现。这需要对架构进行更改。
- **优化映射** - 默认架构使用Map类型存储属性。这些列允许存储任意元数据。虽然这是必要的能力，因为事件的元数据通常在前期未被定义，因此无法存储在像ClickHouse这样的强类型数据库中，但访问映射键及其值的效率不如访问普通列。我们通过修改架构并确保最常访问的映射键是顶级列来解决此问题 - 参见 ["使用SQL提取结构"](#extracting-structure-with-sql)。这需要架构更改。
- **简化映射键访问** - 访问映射中的键需要更详细的语法。用户可以使用别名减轻此问题。请参见 ["使用别名"](#using-aliases) 来简化查询。
- **二级索引** - 默认架构使用二级索引来加速对Map的访问并加速文本查询。这通常不是必需的，且会占用额外的磁盘空间。可以使用，但应该进行测试以确保它们是必要的。参见 ["二级/数据跳过索引"](#secondarydata-skipping-indices)。
- **使用编码器** - 如果用户理解预期的数据并有证据表明这会改善压缩，他们可能希望自定义列的编码器。

_我们将在下面详细描述上述每个用例。_

**重要提示：** 虽然鼓励用户扩展和修改他们的架构以实现最佳的压缩和查询性能，但他们应尽可能遵循核心列的OTel架构命名。ClickHouse Grafana插件假定存在一些基本的OTel列以帮助构建查询，例如Timestamp和SeverityText。日志和追踪所需的列在这里有文档记录 [[1]](https://grafana.com/developers/plugin-tools/tutorials/build-a-logs-data-source-plugin#logs-data-frame-format)[[2]](https://grafana.com/docs/grafana/latest/explore/logs-integration/) 和 [这里](https://grafana.com/docs/grafana/latest/explore/trace-integration/#data-frame-structure)。您可以选择更改这些列名，覆盖插件配置中的默认值。
## 使用SQL提取结构 {#extracting-structure-with-sql}

无论是摄取结构化日志还是非结构化日志，用户通常需要以下能力：

- **从字符串blob中提取列**。查询这些将比使用查询时的字符串操作更快。
- **从映射中提取键**。默认架构将任意属性置于Map类型的列中。此类型提供无架构能力，用户在定义日志和追踪时不需要预先定义属性列 - 收集Kubernetes日志时，这通常是不可能的，并且希望保留pod标签以便后续搜索。从映射中访问键及其值的速度慢于查询正常的ClickHouse列。因此，提取映射中的键到根表列通常是可取的。

考虑以下查询：

假设我们希望计算网站上接收最多POST请求的URL路径。JSON blob存储在`Body`列中，作为字符串。同时，如果用户在收集器中启用了json_parser，它也可能存储在`LogAttributes`列中，作为`Map(String, String)`。

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

假设`LogAttributes`可用，查询计算该网站上接收最多POST请求的URL路径如下：

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

注意此处使用的映射语法，例如`LogAttributes['request_path']`，以及[`path`函数](/sql-reference/functions/url-functions#path)用于剥离URL中的查询参数。

如果用户未在收集器中启用JSON解析，则`LogAttributes`将为空，迫使我们使用[JSON函数](/sql-reference/functions/json-functions) 从字符串`Body`中提取列。

:::note 优先使用ClickHouse进行解析
我们通常建议用户在ClickHouse中对结构化日志进行JSON解析。我们相信ClickHouse是最快的JSON解析实现。然而，我们认识到用户可能希望将日志发送到其他来源，并且不希望此逻辑驻留在SQL中。
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

现在考虑对非结构化日志执行相同操作：

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

针对非结构化日志的类似查询需要通过[`extractAllGroupsVertical`函数](/sql-reference/functions/string-search-functions#extractallgroupsvertical)使用正则表达式。

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

解析非结构化日志的查询复杂性和成本增加（注意性能差异）是我们建议用户始终在可能的情况下使用结构化日志的原因。

:::note 考虑字典
上述查询可以优化以利用正则表达式字典。有关详细信息，请参见 [使用字典](#using-dictionaries)。
:::

这两个用例都可以使用ClickHouse通过将上述查询逻辑移到插入时间来满足。我们在下面探讨几种方法，突出每种方法何时适用。

:::note 处理时使用OTel或ClickHouse？
用户还可以使用OTel Collector处理器和操作符进行处理，如[这里](https://observability/integrating-opentelemetry#processing---filtering-transforming-and-enriching)所述。在大多数情况下，用户会发现ClickHouse在资源效率和速度上显著优于收集器的处理器。在SQL中执行所有事件处理的主要缺点是将解决方案与ClickHouse耦合。例如，用户可能希望将处理后的日志发送到OTel收集器的替代目标，例如S3。
:::
### 物化列 {#materialized-columns}

物化列提供了从其他列提取结构的最简单解决方案。此类列的值将在插入时间始终计算，并且不能在INSERT查询中指定。

:::note 开销
物化列会产生额外的存储开销，因为在插入时间将值提取到新的列中。
:::

物化列支持任何ClickHouse表达式，并且可以利用任何处理字符串的分析函数（包括[正则表达式和查找](/sql-reference/functions/string-search-functions)）和[URLs](/sql-reference/functions/url-functions)，执行[类型转换](/sql-reference/functions/type-conversion-functions)、[从JSON提取值](/sql-reference/functions/json-functions)或[数学运算](/sql-reference/functions/math-functions)。

我们建议将物化列用于基本处理。它们对于从映射中提取值、将它们提升为根列和执行类型转换特别有用。当在非常基本的架构中使用或与物化视图结合使用时，它们通常最有用。考虑以下架构，由收集器将JSON提取到`LogAttributes`列中：

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

使用JSON函数从字符串`Body`提取的等效架构可以在[这里](https://pastila.nl/?005cbb97/513b174a7d6114bf17ecc657428cf829#gqoOOiomEjIiG6zlWhE+Sg==)找到。

我们的三个物化列提取请求页面、请求类型和引用者域。这些访问映射键并对其值应用函数。我们后续的查询显著更快：

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
物化列默认不会在`SELECT *`中返回。这是为了保持`SELECT *`的结果始终可以通过INSERT插入回表中的不变性。可以通过设置`asterisk_include_materialized_columns=1`来禁用此行为，并且可以在Grafana中启用（请参见数据源配置中的`附加设置 -> 自定义设置`）。
:::
## 物化视图 {#materialized-views}

[物化视图](/materialized-views)提供了一种更强大的方式来对日志和追踪应用SQL过滤和变换。

物化视图允许用户将计算的成本从查询时间转移到插入时间。ClickHouse物化视图只是一种触发器，在数据块插入表时执行查询。该查询的结果插入第二个“目标”表中。

<Image img={observability_10} alt="物化视图" size="md"/>

:::note 实时更新
在ClickHouse中，物化视图会实时更新，因为数据流入它们所基于的表，功能更像是不断更新的索引。相比之下，在其他数据库中，物化视图通常是查询的静态快照，必须刷新（类似于ClickHouse的可刷新的物化视图）。
:::

物化视图关联的查询理论上可以是任何查询，其中包括聚合，但[存在与连接的限制](https://clickhouse.com/blog/using-materialized-views-in-clickhouse#materialized-views-and-joins)。对于日志和追踪所需的转换和过滤工作负载，用户可以考虑任何`SELECT`语句是可能的。

用户应记住该查询只是一种触发器，针对插入表的行（源表）执行，结果发送到新表（目标表）。

为了确保我们不在源表和目标表中重复持久化数据，我们可以将源表的表更改为[Null表引擎](/engines/table-engines/special/null)，保持原始架构。我们的OTel收集器将继续将数据发送到此表。例如，对于日志，`otel_logs`表变为：

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

Null表引擎是一种强大的优化 - 想想它就像是`/dev/null`。该表不会存储任何数据，但任何附加的物化视图仍将在插入的行上执行，然后被丢弃。

考虑以下查询。该查询将我们的行转换为我们希望保留的格式，提取所有列来自`LogAttributes`（我们假设收集器使用`json_parser`操作符设置了此列），设置`SeverityText`和`SeverityNumber`（基于一些简单的条件和[这些列的定义](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-severitytext)）。在这种情况下，我们还仅选择我们知道会被填充的列 - 忽略`TraceId`、`SpanId`和`TraceFlags`等列。

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

我们还提取了上述的`Body`列 - 以防后续添加了未通过我们的SQL提取的其他属性。此列在ClickHouse中应该能很好地压缩，并且很少访问，因此不会影响查询性能。最后，我们将Timestamp缩减为DateTime（以节省空间 - 参见 ["优化类型"](#optimizing-types)），进行类型转换。

:::note 条件表达式
注意上面提取`SeverityText`和`SeverityNumber`的[条件函数](/sql-reference/functions/conditional-functions)。它们对制定复杂条件和检查映射中的值是否设置极为有用 - 我们天真地假设所有键都存在於`LogAttributes`中。我们建议用户熟悉它们 - 它们在日志解析中有助于处理[空值](/sql-reference/functions/functions-for-nulls)的函数！
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

这里选择的类型基于在["优化类型"](#optimizing-types)中讨论的优化。

:::note
注意我们如何显著改变了我们的架构。实际上，用户可能还会有他们希望保留的Trace列以及`ResourceAttributes`列（这通常包含Kubernetes元数据）。Grafana可以利用trace列提供日志和追踪之间的链接功能 - 参见 ["使用Grafana"](/observability/grafana)。
:::

接下来，我们创建一个物化视图`otel_logs_mv`，它为`otel_logs`表执行上述选择，并将结果发送到`otel_logs_v2`。

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

上面的内容如下所示：

<Image img={observability_11} alt="Otel MV" size="md"/>

如果我们现在重新启动在["导出到ClickHouse"](/observability/integrating-opentelemetry#exporting-to-clickhouse)中使用的收集器配置，数据将以我们期望的格式出现在`otel_logs_v2`中。注意使用了类型化的JSON提取函数。

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

等效的物化视图，通过使用JSON函数从`Body`列中提取列也如下所示：

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

上述物化视图依赖于隐式转换 - 特别是在使用`LogAttributes`映射的情况下。ClickHouse通常会透明地将提取的值转换为目标表类型，从而减少所需的语法。然而，我们建议用户始终通过使用视图的`SELECT`语句和使用相同架构的[`INSERT INTO`](/sql-reference/statements/insert-into)语句来测试它们的视图。这应确认类型处理正确。应特别注意以下情况：

- 如果映射中不存在某个键，则将返回空字符串。在数值的情况下，用户需要将其映射到适当的值。可以通过[条件函数](/sql-reference/functions/conditional-functions)实现，例如`if(LogAttributes['status'] = ", 200, LogAttributes['status'])`，或使用[类型转换函数](/sql-reference/functions/type-conversion-functions)，如果默认值可以接受，例如`toUInt8OrDefault(LogAttributes['status'] )`。
- 某些类型不会总是被转换，例如数值的字符串表示不会被转换为枚举值。
- JSON提取函数在未找到值时会返回默认值。确保这些值合理！

:::note 避免Nullable
避免在ClickHouse的可观测性数据中使用[Nullable](/sql-reference/data-types/nullable)。在日志和追踪中，区分空值和null值通常不是必需的。此功能会占用额外的存储开销，并会对查询性能产生负面影响。更多详情请参见[这里](/data-modeling/schema-design#optimizing-types)。
:::
## 选择主（排序）键 {#choosing-a-primary-ordering-key}

一旦您提取了所需的列，就可以开始优化您的排序/主键。

可以应用一些简单的规则来帮助选择排序键。以下几点有时可能会冲突，因此请按顺序考虑这些。用户可以通过此过程识别出多个键，通常4到5个就够了：

1. 选择与常用的过滤器和访问模式一致的列。如果用户通常通过特定列进行可观测性调查（例如pod名称），则此列将频繁用于`WHERE`子句。优先将这些包含在您的键中，而不是那些使用频率较低的列。
2. 优先选择在过滤时能够排除大量总行的列，从而减少需要读取的数据量。服务名称和状态码通常是良好的候选者 - 在后者情况下，仅当用户根据排除大部分行的值来过滤时，例如，按200s过滤在大多数系统中将匹配大部分行，而500错误则可能相应地对应于小部分。
3. 优先选择与表中其他列高度相关的列。这有助于确保这些值也被连续存储，从而改善压缩效果。
4. 在排序键中，对列的`GROUP BY`和`ORDER BY`操作可以更高效地使用内存。

<br />

在识别出排序键的列子集后，必须按特定顺序声明它们。此顺序可以显著影响查询中对二级键列过滤的效率以及表数据文件的压缩比。一般来说，**最好按基数升序排序键**。这应该与排序键中晚出现的列的过滤效率低于早出现列的事实相平衡。平衡这些行为并考虑您的访问模式。最重要的是，测试变体。为了进一步了解排序键以及如何优化它们，建议参考[这篇文章](/guides/best-practices/sparse-primary-indexes)。

:::note 首先结构化
我们建议在结构化日志后再决定您的排序键。不要在属性映射中使用键作为排序键或JSON提取表达式。确保您的排序键作为根列在表中。
:::
## 使用映射 {#using-maps}

早期示例显示使用映射语法`map['key']`访问`Map(String, String)`列中的值。除了使用映射符号访问嵌套键外，专门的ClickHouse [映射函数](/sql-reference/functions/tuple-map-functions#mapkeys)可以用于过滤或选择这些列。

例如，以下查询使用[`mapKeys`函数](/sql-reference/functions/tuple-map-functions#mapkeys)识别`LogAttributes`列中所有唯一键，然后使用[`groupArrayDistinctArray`函数](/sql-reference/aggregate-functions/combinators)（一个组合器）：

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

:::note 避免点
我们不建议在Map列名中使用点，并可能停止使用它。使用`_`。
:::
## 使用别名 {#using-aliases}

查询映射类型的速度比查询普通列慢 - 参见 ["加速查询"](#accelerating-queries)。此外，语法也更复杂，对于用户来说可能很麻烦。为了应对这一问题，我们建议使用别名列。

别名列在查询时计算，并不存储在表中。因此，不可能向这种类型的列插入值。使用别名，我们可以引用映射键并简化语法，透明地将映射条目公开为普通列。考虑以下示例：

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

我们有几个物化列和一个别名列`RemoteAddr`，它访问映射`LogAttributes`。我们现在可以通过此列查询`LogAttributes['remote_addr']`的值，从而简化我们的查询，即：

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

此外，通过`ALTER TABLE`命令添加`ALIAS`非常简单。这些列立即可用，例如：

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
默认情况下，`SELECT *`排除别名列。可以通过设置`asterisk_include_alias_columns=1`来禁用此行为。
:::
## 优化类型 {#optimizing-types}

[一般的Clickhouse最佳实践](/data-modeling/schema-design#optimizing-types)同样适用于ClickHouse的使用情况。
## 使用编码器 {#using-codecs}

除了类型优化，用户在试图优化ClickHouse可观测性架构的压缩时，可以遵循[编码器的一般最佳实践](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec)。

一般来说，用户会发现`ZSTD`编码器非常适用于日志和追踪数据集。将压缩值从默认的1增加可能会改善压缩效果。然而，这需要进行测试，因为更高的值在插入时会产生更大的CPU开销。通常，我们看到很少的收益来自增加此值。

此外，虽然时间戳在压缩方面受益于增量编码，但如果此列用于主键/排序键，将会导致查询性能缓慢。我们建议用户评估相应的压缩与查询性能的权衡。
## 使用字典 {#using-dictionaries}

[字典](/sql-reference/dictionaries)是ClickHouse的一个[关键特性](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)，提供了来自各种内部和外部[数据源](/sql-reference/dictionaries#dictionary-sources)的内存[key-value](https://en.wikipedia.org/wiki/Key%E2%80%93value_database)表示，优化了超低延迟查找查询。

<Image img={observability_12} alt="可观测性与字典" size="md"/>

这在多种场景中非常方便，从在不减慢摄取过程的情况下动态丰富摄取数据到改善查询总体性能，特别是JOIN受益。
虽然在可观测性用例中，几乎不需要JOIN，但字典对于富化的目的仍然非常有用 - 在插入和查询时间都有用。我们在下面提供了两者的示例。

:::note 加速JOIN
对加速字典JOIN感兴趣的用户可以在[这里](/dictionary)找到更多详细信息。
:::
### 插入时间与查询时间 {#insert-time-vs-query-time}

字典可以用于在查询时间或插入时间丰富数据集。这两种方法各有其优缺点。总结如下：

- **插入时间** - 如果富集值不变并存在于可以用于填充字典的外部源中，通常这是合适的。在这种情况下，在插入时间丰富行可避免查询时间对字典的查找。这会以插入性能为代价，以及额外的存储开销，因为丰富的值将作为列存储。
- **查询时间** - 如果字典中的值经常变化，查询时间查找通常更为适用。这可以避免需要更新列（并重写数据）如果映射的值发生变化。这种灵活性以查询时间查找成本为代价。如果需要许多行进行查找，例如在过滤子句中使用字典查找，通常此查询时间成本是明显的。对于结果丰富，即在`SELECT`中，这种开销通常不明显。

我们建议用户熟悉字典的基础知识。字典提供一个内存查找表，从中可以使用专用[专业函数](/sql-reference/functions/ext-dict-functions#dictgetall)检索值。

有关简单富化示例，请参见[这里](/dictionary)的字典指南。下面，我们重点关注常见的可观测性富化任务。
### 使用IP字典 {#using-ip-dictionaries}

使用IP地址通过纬度和经度值丰富日志和追踪是一个常见的可观测性需求。我们可以使用结构化字典`ip_trie`实现这一点。

我们使用公开提供的[DB-IP城市级数据集](https://github.com/sapics/ip-location-db#db-ip-database-update-monthly)，由[DB-IP.com](https://db-ip.com/)根据[CC BY 4.0许可证](https://creativecommons.org/licenses/by/4.0/)提供。

从[自述文件](https://github.com/sapics/ip-location-db#csv-format)中，我们可以看到数据的结构如下：

```csv
| ip_range_start | ip_range_end | country_code | state1 | state2 | city | postcode | latitude | longitude | timezone |
```

根据这个结构，让我们先使用[url()](/sql-reference/table-functions/url)表函数窥探数据：

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

为了方便我们，将使用[`URL()`](/engines/table-engines/special/url)表引擎创建ClickHouse表对象，带有我们的字段名称，并确认总行数：

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

因为我们的`ip_trie`字典需要以CIDR表示IP地址范围，我们需要转换`ip_range_start`和`ip_range_end`。

这个范围的CIDR可以通过以下查询简洁地计算：

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
上面的查询做了很多事情。对此感兴趣的人可以阅读这个优秀的[解释](https://clickhouse.com/blog/geolocating-ips-in-clickhouse-and-grafana#using-bit-functions-to-convert-ip-ranges-to-cidr-notation)。否则，请接受上述计算IP范围的CIDR。
:::

就我们的目的而言，我们只需要IP范围、国家代码和坐标，因此让我们创建一个新表并插入我们的Geo IP数据：

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

为了在ClickHouse中执行低延迟的IP查找，我们将利用字典在内存中存储关键->属性映射，以供我们的Geo IP数据。ClickHouse提供了一个`ip_trie` [字典结构](/sql-reference/dictionaries#ip_trie)，用于将我们的网络前缀(CIDR块)映射到坐标和国家代码。以下查询指定使用这种布局和上述表作为源的字典。

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

我们可以从字典中选择行并确认该数据集可用于查找：

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
ClickHouse中的字典会根据底层表数据和上述使用的生命周期子句定期刷新。为了更新我们的Geo IP字典以反映DB-IP数据集的最新变化，我们只需将geoip_url远程表中的数据重新插入到我们的`geoip`表中，并应用转换。
:::

现在我们已经将Geo IP数据加载到`ip_trie`字典（方便地也命名为`ip_trie`）中，我们可以使用它进行IP地理位置。这可以通过如下使用[`dictGet()`函数](/sql-reference/functions/ext-dict-functions)实现：

```sql
SELECT dictGet('ip_trie', ('country_code', 'latitude', 'longitude'), CAST('85.242.48.167', 'IPv4')) AS ip_details

┌─ip_details──────────────┐
│ ('PT',38.7944,-9.34284) │
└─────────────────────────┘

1 row in set. Elapsed: 0.003 sec.
```

注意此处的检索速度。这使我们能够丰富日志。在这种情况下，我们选择**进行查询时间富化**。

返回到我们原始的日志数据集，我们可以利用上述内容按国家聚合我们的日志。以下假设我们使用来自早期物化视图的架构，其中提取了`RemoteAddress`列。

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

由于IP到地理位置的映射可能会改变，用户可能希望了解请求发起时的位置 - 而不是同一地址当前的地理位置。因此，此处通常更为优先的是索引时间富化。这可以通过如下所示的物化列或物化视图的选择完成：

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
用户可能希望IP富化字典定期更新，以便根据新数据进行更新。这可以通过字典的`LIFETIME`子句实现，该子句会导致字典定期从底层表中重新加载。要更新底层表，参见["可刷新的物化视图"](/materialized-view/refreshable-materialized-view)。
:::

上述国家和坐标提供了超越按国家分组和过滤的可视化能力。获得灵感，请参见["可视化地理数据"](/observability/grafana#visualizing-geo-data)。
### 使用正则表达式字典（用户代理解析） {#using-regex-dictionaries-user-agent-parsing}

解析[用户代理字符串](https://en.wikipedia.org/wiki/User_agent)是经典的正则表达式问题，也是基于日志和追踪数据集的常见需求。ClickHouse提供使用正则表达式树字典高效解析用户代理的功能。

正则表达式树字典在ClickHouse开源中使用YAMLRegExpTree字典源类型定义，该类型提供包含正则表达式树的YAML文件路径。如果您希望提供自己的正则表达式字典，可以在[这里](/sql-reference/dictionaries#use-regular-expression-tree-dictionary-in-clickhouse-open-source)找到所需结构的详细信息。下面我们重点关注使用[uap-core](https://github.com/ua-parser/uap-core)解析用户代理并加载我们支持的CSV格式的字典。这种方法与OSS和ClickHouse Cloud兼容。

:::note
在以下示例中，我们使用2024年6月的最新uap-core用户代理解析的正则表达式快照。最新文件（会偶尔更新）可在[这里](https://raw.githubusercontent.com/ua-parser/uap-core/master/regexes.yaml)找到。用户可以遵循[这里](/sql-reference/dictionaries#collecting-attribute-values)中的步骤加载下面使用的CSV文件。
:::

创建以下内存表。它们存储我们用于解析设备、浏览器和操作系统的正则表达式。

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

这些表可以使用URL表函数从以下公开托管的CSV文件填充：

```sql
INSERT INTO regexp_os SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_os.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')

INSERT INTO regexp_device SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_device.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')

INSERT INTO regexp_browser SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_browser.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')
```

随着我们的内存表的填充，我们可以加载我们的正则表达式字典。请注意，我们需要将键值指定为列 - 这些将是我们可以从用户代理提取的属性。

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

考虑到围绕用户代理的规则几乎不会改变，字典只需在响应新浏览器、操作系统和设备时更新，因此在插入时执行此提取是有意义的。

我们可以使用物化列或物化视图来完成此工作。下面我们修改之前使用的物化视图：

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

这要求我们修改目标表`otel_logs_v2`的架构：

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

在重新启动收集器并根据早期记录的步骤摄取结构化日志后，我们可以查询新提取的Device、Browser和Os列。

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

:::note 用于复杂结构的元组
注意这些用户代理列使用元组。元组建议用于结构已知的复杂结构。子列提供与常规列相同的性能（与映射键不同），同时允许异构类型。
:::
### 进一步阅读 {#further-reading}

有关字典的更多示例和详细信息，我们推荐以下文章：

- [高级字典主题](/dictionary#advanced-dictionary-topics)
- ["使用字典加速查询"](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)
- [字典](/sql-reference/dictionaries)
## 加速查询 {#accelerating-queries}

ClickHouse 支持多种加速查询性能的技术。在选择合适的主键/排序键以优化最常见的访问模式并最大化压缩后，以下方法应被考虑。这通常对性能的影响最大，同时投入的精力最少。
### 使用物化视图（增量）进行聚合 {#using-materialized-views-incremental-for-aggregations}

在前面的部分中，我们探索了物化视图在数据转换和过滤中的使用。然而，物化视图还可以用于在插入时预计算聚合并存储结果。这个结果可以使用后续插入的结果进行更新，从而有效地允许在插入时预计算聚合。

这里的主要想法是，结果通常会比原始数据小（在聚合情况下是部分快照）。当结合更简单的查询从目标表中读取结果时，查询时间将比在原始数据上执行相同计算的速度更快。

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

我们可以想象这可能是用户在 Grafana 上绘制的常见折线图。这个查询确实非常快 - 数据集只有 1000 万行，而 ClickHouse 的速度很快！但是，如果我们将其扩展到数十亿和数万亿行，我们理想上希望维持这种查询性能。

:::note
如果我们使用之前物化视图生成的 `otel_logs_v2` 表，这个查询将快 10 倍，该表从 `LogAttributes` map 中提取大小键。我们在这里使用原始数据仅供说明，并建议如果这是一个常见查询，使用之前的视图。
:::

如果我们希望在插入时使用物化视图来计算这一点，则需要一个表来接收结果。该表应仅保持每小时 1 行。如果对现有小时收到更新，则应将其他列合并到现有小时的行中。为了实现增量状态的合并，必须为其他列存储部分状态。

这需要 ClickHouse 中的一种特殊引擎类型：SummingMergeTree。它通过将具有相同排序键的所有行替换为一行，其中包含数值列的和。以下表将合并任何具有相同日期的行，求和任何数值列。

```sql
CREATE TABLE bytes_per_hour
(
  `Hour` DateTime,
  `TotalBytes` UInt64
)
ENGINE = SummingMergeTree
ORDER BY Hour
```

为了演示我们的物化视图，假设我们的 `bytes_per_hour` 表是空的，还未接收任何数据。我们的物化视图对 `otel_logs` 中插入的数据执行上述 `SELECT`（这将在配置大小的块上执行），结果发送到 `bytes_per_hour`。语法如下所示：

```sql
CREATE MATERIALIZED VIEW bytes_per_hour_mv TO bytes_per_hour AS
SELECT toStartOfHour(Timestamp) AS Hour,
       sum(toUInt64OrDefault(LogAttributes['size'])) AS TotalBytes
FROM otel_logs
GROUP BY Hour
```

这里的 `TO` 子句是关键，表示结果将发送到哪个地方，即 `bytes_per_hour`。

如果我们重新启动 OTel Collector 并重新发送日志，`bytes_per_hour` 表将增量填充上述查询结果。完成后，我们可以确认 `bytes_per_hour` 的大小 - 我们每小时应有 1 行：

```sql
SELECT count()
FROM bytes_per_hour
FINAL

┌─count()─┐
│     113 │
└─────────┘

1 row in set. Elapsed: 0.039 sec.
```

通过存储我们的查询结果，我们实际上将行数从 `otel_logs` 中的 1000 万减少到 113。关键是，如果新的日志被插入到 `otel_logs` 表中，新值将被发送到各自小时的 `bytes_per_hour`，在那里它们将被自动异步合并 - 通过保持每小时一行，`bytes_per_hour` 将始终保持小且最新。

由于行的合并是异步的，因此在用户查询时，每小时可能会有多于一行。为了确保所有未完成的行在查询时被合并，我们有两个选项：

- 在表名上使用 [`FINAL` 修饰符](/sql-reference/statements/select/from#final-modifier)(这在上面的计数查询中使用了)。
- 按照我们最终表中使用的排序键进行聚合，即时间戳并求和度量。

通常，第二个选项更高效和灵活（该表可以用于其他用途），但第一个选项对于某些查询来说可能更简单。我们在下面同时展示两者：

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

这将我们的查询速度从 0.6 秒提升到 0.008 秒 - 超过 75 倍！

:::note
在大数据集和更复杂的查询中，节省可能会更大。请参阅 [这里](https://github.com/ClickHouse/clickpy) 的示例。
:::
#### 更复杂的例子 {#a-more-complex-example}

上述示例使用 [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree) 聚合每小时的简单计数。超出简单求和的统计要求一种不同的目标表引擎：[AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree)。

假设我们希望计算每天唯一 IP 地址（或唯一用户）的数量。查询如下：

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

为了确保 ClickHouse 知道聚合状态将被存储，我们将 `UniqueUsers` 列定义为类型 [`AggregateFunction`](/sql-reference/data-types/aggregatefunction)，指定部分状态的功能源（uniq）和源列的类型（IPv4）。像 SummingMergeTree 一样，具有相同 `ORDER BY` 键值的行将被合并（上面的例子中的小时）。

相关的物化视图使用早期查询：

```sql
CREATE MATERIALIZED VIEW unique_visitors_per_hour_mv TO unique_visitors_per_hour AS
SELECT toStartOfHour(Timestamp) AS Hour,
        uniqState(LogAttributes['remote_addr']::IPv4) AS UniqueUsers
FROM otel_logs
GROUP BY Hour
ORDER BY Hour DESC
```

注意我们在聚合函数的末尾附加了后缀 `State`。这确保返回的是函数的聚合状态而不是最终结果。这将包含额外的信息以允许该部分状态与其他状态合并。

一旦数据通过 Collector 重启重新加载，我们可以确认 `unique_visitors_per_hour` 表中有 113 行。

```sql
SELECT count()
FROM unique_visitors_per_hour
FINAL
┌─count()─┐
│   113   │
└─────────┘

1 row in set. Elapsed: 0.009 sec.
```

我们的最终查询需要利用 Merge 后缀进行我们的函数（因为列存储部分聚合状态）：

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

注意，我们在这里使用 `GROUP BY` 而不是使用 `FINAL`。
### 使用物化视图（增量）进行快速查找 {#using-materialized-views-incremental--for-fast-lookups}

用户在选择 ClickHouse 排序键时应考虑他们的访问模式与经常用于过滤和聚合子句的列。这在可观察性用例中可能是有约束的，用户有更加多样化的访问模式，无法在一组列中呈现。这在内置于默认 OTel 模式的一个示例中得到了很好的说明。考虑默认的跟踪模式：

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

此模式针对 `ServiceName`、`SpanName` 和 `Timestamp` 的过滤进行了优化。在跟踪中，用户还需要根据特定 `TraceId` 进行查找，并检索相关跟踪的跨度。虽然这存在于排序键中，但它的位置在末尾意味着 [过滤的效率将不会那么高](/guides/best-practices/sparse-primary-indexes#ordering-key-columns-efficiently)，并且在检索单个跟踪时很可能需要扫描大量数据。

OTel Collector 还安装了一个物化视图和相关表来解决这个挑战。表和视图如下所示：

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

该视图有效地确保表 `otel_traces_trace_id_ts` 的最小和最大时间戳适用于该跟踪。该表按 `TraceId` 排序，允许高效检索这些时间戳。此时间戳范围可以在查询主 `otel_traces` 表时使用。更具体地说，在通过 id 检索跟踪时，Grafana 使用以下查询：

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

CTE 在此处识别跟踪 id `ae9226c78d1d360601e6383928e4d22d` 的最小和最大时间戳，然后使用此信息过滤主 `otel_traces` 的相关跨度。

这个相同的方法可以应用于类似的访问模式。我们在这里探讨一个类似的示例 [在数据建模中](/materialized-view/incremental-materialized-view#lookup-table)。
### 使用投影 {#using-projections}

ClickHouse 投影允许用户为一个表指定多个 `ORDER BY` 子句。

在之前的部分中，我们探索了物化视图如何在 ClickHouse 中用于预计算聚合、转换行并优化可观察性查询以适应不同的访问模式。

我们提供了一个示例，其中物化视图将行发送到目标表，该目标表的排序键与接收插入的原始表不同，以便优化按跟踪 id 的查找。

投影可以用于解决相同的问题，使用户能够针对不属于主键的列的查询进行优化。

理论上，此功能可用于为一个表提供多个排序键，具有一个明显的缺点：数据重复。具体来说，除了为每个投影指定的顺序之外，数据还需要按照主主键的顺序进行写入。这将减慢插入速度并占用更多磁盘空间。

:::note 投影与物化视图
投影提供了与物化视图相同的许多能力，但应谨慎使用，并且后者通常更受欢迎。用户应该了解缺点以及何时适用。例如，虽然可以使用投影进行预计算聚合，但我们建议用户使用物化视图来完成此操作。
:::

<Image img={observability_13} alt="Observability and projections" size="md"/>

考虑以下查询，它根据 500 错误代码过滤我们的 `otel_logs_v2` 表。这很可能是日志记录中用户希望按错误代码过滤的常见访问模式：

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
我们在这里使用 `FORMAT Null` 不打印结果。这会强制读取所有结果但不返回，从而防止由于 LIMIT 导致查询的提前终止。这只是为了显示扫描所有 1000 万行所需的时间。
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

注意，我们必须首先创建投影，然后使其物化。这个后续命令会导致数据在两种不同顺序下被存储两次。我们在创建数据时也可以定义投影，如下所示，并将在数据插入时自动维护。

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

重要的是，如果通过 `ALTER` 创建投影，则在发出 `MATERIALIZE PROJECTION` 命令时创建是异步的。用户可以通过以下查询确认此操作的进度，等待 `is_done=1`。

```sql
SELECT parts_to_do, is_done, latest_fail_reason
FROM system.mutations
WHERE (`table` = 'otel_logs_v2') AND (command LIKE '%MATERIALIZE%')

┌─parts_to_do─┬─is_done─┬─latest_fail_reason─┐
│           0 │     1   │                    │
└─────────────┴─────────┴────────────────────┘

1 row in set. Elapsed: 0.008 sec.
```

如果我们重复上述查询，可以看到性能显著提高，但代价是额外的存储（参见 ["测量表大小和压缩"](#measuring-table-size--compression) 以了解如何进行测量）。

```sql
SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent
FROM otel_logs_v2
WHERE Status = 500
FORMAT `Null`

0 rows in set. Elapsed: 0.031 sec. Processed 51.42 thousand rows, 22.85 MB (1.65 million rows/s., 734.63 MB/s.)
Peak memory usage: 27.85 MiB.
```

在上述示例中，我们在投影中指定了早期查询中使用的列。这将意味着只有这些指定的列将按状态有序地存储在磁盘上。如果相反，我们在这里使用 `SELECT *`，则所有列都将被存储。虽然这将允许更多查询（使用任意列的子集）从投影中受益，但将产生额外的存储。在测量磁盘空间和压缩时，请参见 ["测量表大小和压缩"](#measuring-table-size--compression)。
### 二级/数据跳过索引 {#secondarydata-skipping-indices}

无论 ClickHouse 中主键调整得多么完美，某些查询不可避免地需要全表扫描。虽然这可以通过使用物化视图（以及某些查询的投影）来缓解，但这些需要额外的维护，并且用户需要意识到它们的可用性以确保有效利用。传统关系数据库通过二级索引来解决这个问题，但在像 ClickHouse 这样的列式数据库中，这些是无效的。相反，ClickHouse 使用“跳过”索引，它可以通过允许数据库跳过没有匹配值的大数据块，显著提高查询性能。

默认的 OTel 模式在尝试加速对映射访问的访问时使用二级索引。虽然我们发现这些通常无效，并不推荐将它们复制到你的自定义模式中，但跳过索引仍然可以有用。

用户应在尝试使用它们之前阅读并理解 [二级索引指南](/optimize/skipping-indexes)。

**一般来说，当主键与目标的非主列/表达式之间存在强相关性，并且用户在查找稀有值时即不会出现在多个粒度中，使用它们效果较好。**
### 文本搜索的布隆过滤器 {#bloom-filters-for-text-search}

对于可观察性查询，当用户需要执行文本搜索时，二级索引可能很有用。具体来说，以 ngram 和基于 token 的布隆过滤器索引 [`ngrambf_v1`](/optimize/skipping-indexes#bloom-filter-types) 和 [`tokenbf_v1`](/optimize/skipping-indexes#bloom-filter-types) 可以用于加速对 String 列的搜索，使用操作符 `LIKE`、`IN` 和 hasToken。重要的是，基于 token 的索引使用非字母数字字符作为分隔符生成 tokens。这意味着只能在查询时匹配 tokens（或整个单词）。对于更精细的匹配，可以使用 [N-gram 布隆过滤器](/optimize/skipping-indexes#bloom-filter-types)。它将字符串拆分成指定大小的 ngrams，从而允许进行子词匹配。

为了评估将要产生并因此被匹配的 tokens，可以使用 `tokens` 函数：

```sql
SELECT tokens('https://www.zanbil.ir/m/filter/b113')

┌─tokens────────────────────────────────────────────┐
│ ['https','www','zanbil','ir','m','filter','b113'] │
└───────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.008 sec.
```

`ngram` 函数提供类似的功能，可以将 ngram 大小作为第二个参数指定：

```sql
SELECT ngrams('https://www.zanbil.ir/m/filter/b113', 3)

┌─ngrams('https://www.zanbil.ir/m/filter/b113', 3)────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ['htt','ttp','tps','ps:','s:/','://','//w','/ww','www','ww.','w.z','.za','zan','anb','nbi','bil','il.','l.i','.ir','ir/','r/m','/m/','m/f','/fi','fil','ilt','lte','ter','er/','r/b','/b1','b11','113'] │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.008 sec.
```

:::note 倒排索引
ClickHouse 还实验性地支持作为二级索引的倒排索引。我们目前不推荐这些用于日志数据集，但预计它们将在准备好生产环境时替代基于 token 的布隆过滤器。
:::

为了本示例的目的，我们使用结构化日志数据集。假设我们希望计算其中 `Referer` 列包含 `ultra` 的日志。

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

索引 `ngrambf_v1(3, 10000, 3, 7)` 这里需要四个参数。最后一个参数（值为 7）代表种子。其他参数代表 ngram 大小（3）、值 `m`（过滤器大小）以及哈希函数数量 `k`（7）。`k` 和 `m` 需要调整，并将基于唯一 ngrams/tokens 的数量以及过滤器结果为真负的概率 - 从而确认值不在粒度中。我们推荐 [这些函数](/engines/table-engines/mergetree-family/mergetree#bloom-filter) 来帮助确定这些值。

如果调整正确，这里的加速可以是显著的：

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

:::note 示例仅
上述内容仅供说明。我们建议用户在插入时从日志中提取结构，而不是尝试使用基于 token 的布隆过滤器优化文本搜索。然而，在用户处理堆栈跟踪或其他大字符串的情况下，文本搜索可能会由于结构不那么确定而有用。
:::

关于使用布隆过滤器的一些一般指南：

布隆的目标是过滤 [粒度](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design)，从而避免需要加载列的所有值并执行线性扫描。可以使用 `EXPLAIN` 子句，并带有参数 `indexes=1`，来识别跳过的粒度数量。考虑下面对原始表 `otel_logs_v2` 和使用 ngram 布隆过滤器的表 `otel_logs_bloom` 的响应。

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

布隆过滤器通常只有在它的大小小于列本身时才会更快。如果它更大，则可能会几乎没有性能提升。可以使用以下查询比较过滤器和列的大小：

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

在上述示例中，我们可以看到二级布隆过滤器索引的大小为 12MB - 比列本身的压缩大小 56MB 小了将近 5 倍。

布隆过滤器可能需要显著的调整。我们建议遵循 [这里](/engines/table-engines/mergetree-family/mergetree#bloom-filter) 的注释，这些注释可以在识别最佳设置时提供帮助。布隆过滤器在插入和合并时也可能很昂贵。用户在向生产中添加布隆过滤器之前，应评估其对插入性能的影响。

有关二次跳过索引的更多细节，请参见 [这里](/optimize/skipping-indexes#skip-index-functions)。
### 从映射中提取 {#extracting-from-maps}

Map 类型在 OTel 模式中广泛存在。此类型要求值和键具有相同的类型 - 适用于 Kubernetes 标签等元数据。请注意，当查询 Map 类型的子键时，会加载整个父列。如果映射具有许多键，这可能会引起显著的查询罚款，因为需要从磁盘读取的数据比键存在为列时要多。

如果您经常查询特定键，请考虑将其移动到根级别的专用列中。这通常是在响应常见访问模式并部署后进行的任务，并可能在生产之前难以预测。请参阅 ["管理架构变更"](/observability/managing-data#managing-schema-changes) 以了解如何在部署后修改架构。
## 测量表大小和压缩 {#measuring-table-size--compression}

ClickHouse 用于可观察性的主要原因之一是压缩。

除了显著降低存储成本外，磁盘上较少的数据意味着较少的 I/O 和更快的查询与插入。I/O 的减少将超过任何压缩算法相对于 CPU 的开销。因此，提高数据的压缩性能应成为确保 ClickHouse 查询快速的首要重点。

关于压缩测量的详细信息可以在 [这里](/data-compression/compression-in-clickhouse) 找到。
