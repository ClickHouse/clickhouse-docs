---
'title': '使用Grafana'
'description': '使用Grafana和ClickHouse进行可观测性'
'slug': '/observability/grafana'
'keywords':
- 'observability'
- 'logs'
- 'traces'
- 'metrics'
- 'OpenTelemetry'
- 'Grafana'
- 'OTel'
---

import observability_15 from '@site/static/images/use-cases/observability/observability-15.png';
import observability_16 from '@site/static/images/use-cases/observability/observability-16.png';
import observability_17 from '@site/static/images/use-cases/observability/observability-17.png';
import observability_18 from '@site/static/images/use-cases/observability/observability-18.png';
import observability_19 from '@site/static/images/use-cases/observability/observability-19.png';
import observability_20 from '@site/static/images/use-cases/observability/observability-20.png';
import observability_21 from '@site/static/images/use-cases/observability/observability-21.png';
import observability_22 from '@site/static/images/use-cases/observability/observability-22.png';
import observability_23 from '@site/static/images/use-cases/observability/observability-23.png';
import observability_24 from '@site/static/images/use-cases/observability/observability-24.png';
import Image from '@theme/IdealImage';


# 使用 Grafana 和 ClickHouse 进行可观察性

Grafana 是 ClickHouse 中可观察性数据的首选可视化工具。这是通过使用官方的 ClickHouse 插件实现的。用户可以按照 [这里](/integrations/grafana) 找到的安装说明进行安装。

插件的 V4 版本使得日志和追踪成为新查询构建体验中的第一类公民。这减少了 SRE 编写 SQL 查询的需求，并简化了基于 SQL 的可观察性，为这一新兴范式向前推进。部分原因是将 Open Telemetry (OTel) 置于插件的核心，因为我们相信这将是未来几年基于 SQL 的可观察性的基础，以及数据的收集方式。

## Open Telemetry 集成 {#open-telemetry-integration}

在 Grafana 中配置 Clickhouse 数据源时，插件允许用户指定日志和追踪的默认数据库和表，以及这些表是否遵循 OTel 模式。这使得插件能够返回 Grafana 中正确日志和追踪渲染所需的列。如果您对默认 OTel 模式进行了更改并希望使用自己的列名，可以进行相应的指定。对于时间 (Timestamp)、日志级别 (SeverityText) 或消息正文 (Body) 等列，使用默认 OTel 列名意味着不需要进行更改。

:::note HTTP 或本地协议
用户可以通过 HTTP 或本地协议将 Grafana 连接到 ClickHouse。后者提供了轻微的性能优势，但在 Grafana 用户发出的聚合查询中，这种优势可能不明显。相反，HTTP 协议通常对用户的代理和检测更为简单。
:::

日志配置需要时间、日志级别和消息列，以便日志能正确渲染。

追踪配置稍微复杂一些（完整列表请见 [这里](/engines/table-engines/mergetree-family/mergetree#mergetree-data-storage)）。这里所需的列是为了后续查询构建完整的追踪分析而必需的。这些查询假定数据的结构与 OTel 类似，因此，用户如果显著偏离标准模式，则需要使用视图来受益于此功能。

<Image img={observability_15} alt="连接器配置" size="sm"/>

配置完成后，用户可以导航到 [Grafana Explore](https://grafana.com/docs/grafana/latest/explore/) 开始搜索日志和追踪。

## 日志 {#logs}

如果遵循 Grafana 对日志的要求，用户可以在查询构建器中选择 `Query Type: Log` 并单击 `Run Query`。查询构建器将生成一个查询以列出日志并确保其渲染，例如：

```sql
SELECT Timestamp as timestamp, Body as body, SeverityText as level, TraceId as traceID FROM "default"."otel_logs" WHERE ( timestamp >= $__fromTime AND timestamp <= $__toTime ) ORDER BY timestamp DESC LIMIT 1000
```

<Image img={observability_16} alt="连接器日志配置" size="lg" border/>

查询构建器提供了一种简单的方式来修改查询，避免用户编写 SQL 的需求。可以从查询构建器中进行过滤，包括查找包含关键字的日志。希望编写更复杂查询的用户可以切换到 SQL 编辑器。只要返回了适当的列，并选择 `logs` 作为查询类型，结果将以日志方式渲染。日志渲染所需的列在 [这里](https://grafana.com/developers/plugin-tools/tutorials/build-a-logs-data-source-plugin#logs-data-frame-format) 列出。

### 日志到追踪 {#logs-to-traces}

如果日志包含追踪 ID，用户可以便利地通过特定的日志行导航到追踪。

<Image img={observability_17} alt="日志到追踪" size="lg" border/>

## 追踪 {#traces}

与上述日志体验类似，如果满足 Grafana 渲染追踪所需的列（例如，使用 OTel 模式），查询构建器能够自动生成必要的查询。选择 `Query Type: Traces` 并单击 `Run Query` 后，将生成并执行一个类似以下的查询（具体根据您配置的列而定 - 以下假设使用 OTel）：

```sql
SELECT "TraceId" as traceID,
  "ServiceName" as serviceName,
  "SpanName" as operationName,
  "Timestamp" as startTime,
  multiply("Duration", 0.000001) as duration
FROM "default"."otel_traces"
WHERE ( Timestamp >= $__fromTime AND Timestamp <= $__toTime )
  AND ( ParentSpanId = '' )
  AND ( Duration > 0 )
  ORDER BY Timestamp DESC, Duration DESC LIMIT 1000
```

该查询返回 Grafana 期望的列名，以呈现如下的追踪表。可以对持续时间或其他列执行过滤，而无需编写 SQL。

<Image img={observability_18} alt="追踪" size="lg" border/>

希望编写更复杂查询的用户可以切换到 `SQL Editor`。

### 查看追踪详情 {#view-trace-details}

如上所示，追踪 ID 被渲染为可点击的链接。在点击追踪 ID 后，用户可以选择通过链接 `View Trace` 查看相关的 spans。这会发出以下查询（假设 OTel 列）以检索所需结构中的 spans，并将结果呈现为瀑布图。

```sql
WITH '<trace_id>' as trace_id,
  (SELECT min(Start) FROM "default"."otel_traces_trace_id_ts"
    WHERE TraceId = trace_id) as trace_start,
  (SELECT max(End) + 1 FROM "default"."otel_traces_trace_id_ts"
    WHERE TraceId = trace_id) as trace_end
SELECT "TraceId" as traceID,
  "SpanId" as spanID,
  "ParentSpanId" as parentSpanID,
  "ServiceName" as serviceName,
  "SpanName" as operationName,
  "Timestamp" as startTime,
  multiply("Duration", 0.000001) as duration,
  arrayMap(key -> map('key', key, 'value',"SpanAttributes"[key]),
  mapKeys("SpanAttributes")) as tags,
  arrayMap(key -> map('key', key, 'value',"ResourceAttributes"[key]),
  mapKeys("ResourceAttributes")) as serviceTags
FROM "default"."otel_traces"
WHERE traceID = trace_id
  AND startTime >= trace_start
  AND startTime <= trace_end
LIMIT 1000
```

:::note
注意上面的查询使用了物化视图 `otel_traces_trace_id_ts` 来执行追踪 ID 查找。有关更多详细信息，请参见 [加速查询 - 使用物化视图进行查找](/use-cases/observability/schema-design#using-materialized-views-incremental--for-fast-lookups)。
:::

<Image img={observability_19} alt="追踪详情" size="lg" border/>

### 追踪到日志 {#traces-to-logs}

如果日志包含追踪 ID，用户可以从追踪导航到其相关日志。要查看日志，请点击追踪 ID 并选择 `View Logs`。这会发出以下查询，假设使用默认 OTel 列。

```sql
SELECT Timestamp as "timestamp",
  Body as "body", SeverityText as "level",
  TraceId as "traceID" FROM "default"."otel_logs"
WHERE ( traceID = '<trace_id>' )
ORDER BY timestamp ASC LIMIT 1000
```

<Image img={observability_20} alt="追踪到日志" size="lg" border/>

## 仪表板 {#dashboards}

用户可以使用 ClickHouse 数据源在 Grafana 中构建仪表板。我们推荐查看 Grafana 和 ClickHouse 的 [数据源文档](https://github.com/grafana/clickhouse-datasource) 以获取更多细节，尤其是 [宏的概念](https://github.com/grafana/clickhouse-datasource?tab=readme-ov-file#macros) 和 [变量](https://grafana.com/docs/grafana/latest/dashboards/variables/)。

该插件提供了多个开箱即用的仪表板，包括“简单 ClickHouse OTel 仪表板”的示例仪表板，用于符合 OTel 规范的日志和追踪数据。这要求用户遵循 OTel 的默认列名，可以从数据源配置中进行安装。

<Image img={observability_21} alt="仪表板" size="lg" border/>

我们提供了一些构建可视化的简单提示如下。

### 时间序列 {#time-series}

除了统计信息，折线图是可观察性用例中最常用的可视化形式。如果查询返回名为 `time` 的 `datetime` 类型和一个数字列，Clickhouse 插件将自动渲染一个折线图。例如：

```sql
SELECT
 $__timeInterval(Timestamp) as time,
 quantile(0.99)(Duration)/1000000 AS p99
FROM otel_traces
WHERE
 $__timeFilter(Timestamp)
 AND ( Timestamp  >= $__fromTime AND Timestamp <= $__toTime )
GROUP BY time
ORDER BY time ASC
LIMIT 100000
```

<Image img={observability_22} alt="时间序列" size="lg" border/>

### 多折线图 {#multi-line-charts}

只要满足以下条件，查询将自动渲染多条折线图：

- 字段 1：带有别名为 `time` 的 datetime 字段
- 字段 2：分组值。这应该是一个字符串。
- 字段 3+：指标值

例如：

```sql
SELECT
  $__timeInterval(Timestamp) as time,
  ServiceName,
  quantile(0.99)(Duration)/1000000 AS p99
FROM otel_traces
WHERE $__timeFilter(Timestamp)
AND ( Timestamp  >= $__fromTime AND Timestamp <= $__toTime )
GROUP BY ServiceName, time
ORDER BY time ASC
LIMIT 100000
```

<Image img={observability_23} alt="多折线图" size="lg" border/>

### 可视化地理数据 {#visualizing-geo-data}

我们已经在前面的部分探讨过利用 IP 字典来丰富可观察性数据与地理坐标。如果您有 `latitude` 和 `longitude` 列，可以使用 `geohashEncode` 函数可视化可观察性。该函数生成与 Grafana Geo Map 图表兼容的地理哈希。下面展示一个示例查询和可视化：

```sql
WITH coords AS
        (
        SELECT
                Latitude,
                Longitude,
                geohashEncode(Longitude, Latitude, 4) AS hash
        FROM otel_logs_v2
        WHERE (Longitude != 0) AND (Latitude != 0)
        )
SELECT
        hash,
        count() AS heat,
        round(log10(heat), 2) AS adj_heat
FROM coords
GROUP BY hash
```

<Image img={observability_24} alt="可视化地理数据" size="lg" border/>
