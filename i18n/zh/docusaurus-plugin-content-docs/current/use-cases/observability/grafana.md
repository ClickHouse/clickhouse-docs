---
title: '使用 Grafana'
description: '使用 Grafana 和 ClickHouse 进行可观察性'
slug: /observability/grafana
keywords: ['可观察性', '日志', '跟踪', '指标', 'OpenTelemetry', 'Grafana', 'OTel']
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


# 使用 Grafana 和 ClickHouse 进行可观察性

Grafana 是 ClickHouse 中可观察性数据的首选可视化工具。通过使用官方的 ClickHouse 插件，可以实现此功能。用户可以按照 [这里](/integrations/grafana) 的安装说明进行操作。

插件的 V4 版本使日志和跟踪成为新查询构建体验中的首要角色。这减少了 SRE 编写 SQL 查询的需求，并简化了基于 SQL 的可观察性，为这一新兴范例推动了进展。部分原因在于将 Open Telemetry (OTel) 放在插件的核心位置，因为我们相信这将是未来几年基于 SQL 的可观察性的基础以及数据的收集方式。

## Open Telemetry 集成 {#open-telemetry-integration}

在 Grafana 中配置 ClickHouse 数据源后，该插件允许用户指定日志和跟踪的默认数据库和表，并指明这些表是否符合 OTel 架构。这使得插件能够返回在 Grafana 中正确呈现日志和跟踪所需的列。如果您对默认 OTel 架构进行了更改，并希望使用自己的列名称，可以进行相应的指定。对于时间 (Timestamp)、日志级别 (SeverityText) 或消息正文 (Body) 等列使用默认 OTel 列名称，则无需进行更改。

:::note HTTP 或 Native
用户可以通过 HTTP 或 Native 协议将 Grafana 连接到 ClickHouse。后者提供了微小的性能优势，但在图表查询中不太可能显著。相反，HTTP 协议通常更简单，便于用户进行代理和检查。
:::

日志配置需要时间、日志级别和消息列，以便正确呈现日志。

跟踪配置稍微复杂一些（完整列表请见 [这里](/engines/table-engines/mergetree-family/mergetree#mergetree-data-storage)）。所需的列是为了使后续查询能够抽象出完整的跟踪配置。这些查询假设数据结构类似于 OTel，因此偏离标准架构的用户将需要使用视图以从此功能中受益。

<a href={observability_15} target="_blank">
  <img src={observability_15}    
    class="image"
    alt="NEEDS ALT"
    style={{width: '400px'}} />
</a>
<br />

配置完成后，用户可以导航到 [Grafana Explore](https://grafana.com/docs/grafana/latest/explore/) 并开始搜索日志和跟踪。

## 日志 {#logs}

如果遵循 Grafana 对日志的要求，用户可以在查询构建器中选择 `Query Type: Log` 并点击 `Run Query`。查询构建器将生成一个查询以列出日志并确保其呈现，例如：

```sql
SELECT Timestamp as timestamp, Body as body, SeverityText as level, TraceId as traceID FROM "default"."otel_logs" WHERE ( timestamp >= $__fromTime AND timestamp <= $__toTime ) ORDER BY timestamp DESC LIMIT 1000
```

<a href={observability_16} target="_blank">
  <img src={observability_16}    
    class="image"
    alt="NEEDS ALT"
    style={{width: '1450px'}} />
</a>
<br />

查询构建器提供了一种简单的方式来修改查询，避免用户编写 SQL 的需要。可以通过查询构建器进行过滤，包括查找包含关键字的日志。希望编写更复杂查询的用户可以切换到 SQL 编辑器。只要返回了适当的列，并选择 `logs` 作为查询类型，结果将以日志形式呈现。日志呈现所需的列列在 [这里](https://grafana.com/developers/plugin-tools/tutorials/build-a-logs-data-source-plugin#logs-data-frame-format)。

### 日志到跟踪 {#logs-to-traces}

如果日志包含跟踪 ID，用户可以受益于能够导航到特定日志行的跟踪。

<a href={observability_17} target="_blank">
  <img src={observability_17}    
    class="image"
    alt="NEEDS ALT"
    style={{width: '1450px'}} />
</a>
<br />

## 跟踪 {#traces}

与上述日志体验类似，如果满足 Grafana 生成跟踪所需的列（例如，使用 OTel 架构），查询构建器能够自动生成必要的查询。通过选择 `Query Type: Traces` 并点击 `Run Query`，将生成并执行类似于以下的查询（根据您配置的列 - 以下假设使用 OTel）：

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

此查询返回 Grafana 所期望的列名，并渲染出如下的跟踪表格。可以在不需要编写 SQL 的情况下对持续时间或其他列进行过滤。

<a href={observability_18} target="_blank">
  <img src={observability_18}    
    class="image"
    alt="NEEDS ALT"
    style={{width: '1450px'}} />
</a>
<br />

希望编写更复杂查询的用户可以切换到 `SQL Editor`。

### 查看跟踪细节 {#view-trace-details}

如上所示，跟踪 ID 被呈现为可点击的链接。点击跟踪 ID 后，用户可以选择通过链接 `View Trace` 查看相关的 spans。此操作将发出以下查询（假设 OTel 列）以检索所需结构中的 spans，并将结果呈现为瀑布图。

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
请注意，上述查询使用了物化视图 `otel_traces_trace_id_ts` 来进行跟踪 ID 查找。有关更多详细信息，请参见 [加速查询 - 使用物化视图进行查找](/use-cases/observability/schema-design#using-materialized-views-incremental--for-fast-lookups)。
:::

<a href={observability_19} target="_blank">
  <img src={observability_19}    
    class="image"
    alt="NEEDS ALT"
    style={{width: '1450px'}} />
</a>
<br />

### 跟踪到日志 {#traces-to-logs}

如果日志包含跟踪 ID，用户可以从跟踪导航到其相关日志。要查看日志，请点击跟踪 ID 并选择 `View Logs`。此操作发出以下查询，假设使用默认的 OTel 列。

```sql
SELECT Timestamp as "timestamp",
  Body as "body", SeverityText as "level",
  TraceId as "traceID" FROM "default"."otel_logs"
WHERE ( traceID = '<trace_id>' )
ORDER BY timestamp ASC LIMIT 1000
```

<a href={observability_20} target="_blank">
  <img src={observability_20}    
    class="image"
    alt="NEEDS ALT"
    style={{width: '1450px'}} />
</a>
<br />

## 仪表板 {#dashboards}

用户可以在 Grafana 中使用 ClickHouse 数据源构建仪表板。我们建议查看 Grafana 和 ClickHouse 的 [数据源文档](https://github.com/grafana/clickhouse-datasource) 以获取更多详细信息，特别是 [宏的概念](https://github.com/grafana/clickhouse-datasource?tab=readme-ov-file#macros) 和 [变量](https://grafana.com/docs/grafana/latest/dashboards/variables/)。

该插件提供了几个开箱即用的仪表板，包括示例仪表板“简单的 ClickHouse OTel 仪表板”，用于符合 OTel 规范的日志和跟踪数据。这要求用户遵循 OTel 的默认列名称，并可以从数据源配置中安装。

<a href={observability_21} target="_blank">
  <img src={observability_21}    
    class="image"
    alt="NEEDS ALT"
    style={{width: '1450px'}} />
</a>
<br />

以下是一些构建可视化的简单提示。

### 时间序列 {#time-series}

除了统计信息外，折线图是可观察性用例中最常见的可视化形式。如果查询返回名为 `time` 的 `datetime` 和一个数值列，则 Clickhouse 插件将自动渲染折线图。例如：

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

<a href={observability_22} target="_blank">
  <img src={observability_22}    
    class="image"
    alt="NEEDS ALT"
    style={{width: '1450px'}} />
</a>
<br />

### 多条线图 {#multi-line-charts}

只要满足以下条件，将自动为查询渲染多条线图：

- 字段 1：具有别名为 time 的 datetime 字段
- 字段 2：要分组的值，应该是一个字符串
- 字段 3+: 指标值
 
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

<a href={observability_23} target="_blank">
  <img src={observability_23}    
    class="image"
    alt="NEEDS ALT"
    style={{width: '1450px'}} />
</a>
<br />

### 可视化地理数据 {#visualizing-geo-data}

我们在前面的部分中探讨了如何使用 IP 字典来丰富可观察性数据的地理坐标。假设您有 `latitude` 和 `longitude` 列，可观察性可以使用 `geohashEncode` 函数进行可视化。这将生成与 Grafana Geo Map 图表兼容的地理哈希。以下是一个查询和可视化示例：

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

<a href={observability_24} target="_blank">
  <img src={observability_24}    
    class="image"
    alt="NEEDS ALT"
    style={{width: '1450px'}} />
</a>
<br />
