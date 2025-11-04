---
'title': '使用 Grafana'
'description': '使用 Grafana 和 ClickHouse 进行可观察性'
'slug': '/observability/grafana'
'keywords':
- 'Observability'
- 'logs'
- 'traces'
- 'metrics'
- 'OpenTelemetry'
- 'Grafana'
- 'OTel'
'show_related_blogs': true
'doc_type': 'guide'
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

Grafana 是 ClickHouse 中可观察性数据的首选可视化工具。通过使用 Grafana 的官方 ClickHouse 插件来实现。用户可以按照 [此处](/integrations/grafana) 的安装说明进行操作。

插件 V4 使日志和跟踪成为新查询构建器体验中的一等公民。这减少了 SREs 编写 SQL 查询的需要，简化了基于 SQL 的可观察性，推动了这一新兴范式的发展。其中一部分是将 OpenTelemetry (OTel) 放在插件的核心位置，因为我们相信这将成为未来几年基于 SQL 的可观察性的基础以及数据收集的方式。

## OpenTelemetry 集成 {#open-telemetry-integration}

在 Grafana 中配置 ClickHouse 数据源时，插件允许用户指定日志和跟踪的默认数据库和表，以及这些表是否符合 OTel 架构。这使插件能够返回在 Grafana 中正确呈现日志和跟踪所需的列。如果您对默认 OTel 架构进行了更改并希望使用自己的列名，可以进行相应的指定。对于时间（`Timestamp`）、日志级别（`SeverityText`）或消息体（`Body`）等列，使用默认的 OTel 列名不需要进行更改。

:::note HTTP 或原生协议
用户可以通过 HTTP 或原生协议将 Grafana 连接到 ClickHouse。后者提供了边际性能优势，但在 Grafana 用户发出的聚合查询中可能不显著。相反，HTTP 协议通常更简单，便于用户进行代理和检查。
:::

日志配置需要一个时间、日志级别和消息列，以便日志能够正确呈现。

跟踪配置稍微复杂一些（完整列表见 [这里](/engines/table-engines/mergetree-family/mergetree#mergetree-data-storage)）。这里所需的列是为了使随后的查询能够构建完整的跟踪概况，这些查询假设数据结构与 OTel 相似，因此显著偏离标准架构的用户需要使用视图才能使用此功能。

<Image img={observability_15} alt="Connector config" size="sm"/>

配置完成后，用户可以导航到 [Grafana Explore](https://grafana.com/docs/grafana/latest/explore/) 并开始搜索日志和跟踪。

## 日志 {#logs}

如果遵循 Grafana 对日志的要求，用户可以在查询构建器中选择 `Query Type: Log` 并点击 `Run Query`。查询构建器将生成一个查询以列出日志并确保它们正确呈现，例如：

```sql
SELECT Timestamp as timestamp, Body as body, SeverityText as level, TraceId as traceID FROM "default"."otel_logs" WHERE ( timestamp >= $__fromTime AND timestamp <= $__toTime ) ORDER BY timestamp DESC LIMIT 1000
```

<Image img={observability_16} alt="Connector logs config" size="lg" border/>

查询构建器提供了一种简单的方法来修改查询，避免用户编写 SQL 的需要。过滤，包括查找包含关键字的日志，可以在查询构建器中执行。希望编写更复杂查询的用户可以切换到 SQL 编辑器。只要返回适当的列，并选择 `logs` 作为查询类型，结果将被呈现为日志。用于日志呈现的必需列在 [这里](https://grafana.com/developers/plugin-tools/tutorials/build-a-logs-data-source-plugin#logs-data-frame-format) 列出。

### 日志到跟踪 {#logs-to-traces}

如果日志包含跟踪 ID，用户可以从特定日志行导航到对应的跟踪。

<Image img={observability_17} alt="Logs to traces" size="lg" border/>

## 跟踪 {#traces}

与上述日志体验类似，如果满足 Grafana 渲染跟踪所需的列（例如，通过使用 OTel 架构），查询构建器能够自动生成必要的查询。通过选择 `Query Type: Traces` 并点击 `Run Query`，将生成并执行一个类似于以下的查询（根据您的配置列 - 以下假设使用 OTel）：

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

此查询返回 Grafana 期望的列名，渲染如下所示的跟踪表格。可以在不编写 SQL 的情况下对持续时间或其他列进行过滤。

<Image img={observability_18} alt="Traces" size="lg" border/>

希望编写更复杂查询的用户可以切换到 `SQL Editor`。

### 查看跟踪详情 {#view-trace-details}

如上所示，跟踪 ID 被呈现为可点击的链接。点击跟踪 ID 后，用户可以选择通过链接 `View Trace` 查看相关的 span。这将发出以下查询（假设 OTel 列）以检索所需结构的 spans，结果呈现为瀑布图。

```sql
WITH '<trace_id>' AS trace_id,
  (SELECT min(Start) FROM "default"."otel_traces_trace_id_ts"
    WHERE TraceId = trace_id) AS trace_start,
  (SELECT max(End) + 1 FROM "default"."otel_traces_trace_id_ts"
    WHERE TraceId = trace_id) AS trace_end
SELECT "TraceId" AS traceID,
  "SpanId" AS spanID,
  "ParentSpanId" AS parentSpanID,
  "ServiceName" AS serviceName,
  "SpanName" AS operationName,
  "Timestamp" AS startTime,
  multiply("Duration", 0.000001) AS duration,
  arrayMap(key -> map('key', key, 'value',"SpanAttributes"[key]),
  mapKeys("SpanAttributes")) AS tags,
  arrayMap(key -> map('key', key, 'value',"ResourceAttributes"[key]),
  mapKeys("ResourceAttributes")) AS serviceTags
FROM "default"."otel_traces"
WHERE traceID = trace_id
  AND startTime >= trace_start
  AND startTime <= trace_end
LIMIT 1000
```

:::note
请注意，以上查询使用物化视图 `otel_traces_trace_id_ts` 来执行跟踪 ID 查找。有关更多详细信息，请参阅 [加速查询 - 使用物化视图进行查找](/use-cases/observability/schema-design#using-materialized-views-incremental--for-fast-lookups)。
:::

<Image img={observability_19} alt="Trace Details" size="lg" border/>

### 跟踪到日志 {#traces-to-logs}

如果日志包含跟踪 ID，用户可以从跟踪转到其关联的日志。要查看日志，请点击一个跟踪 ID 并选择 `View Logs`。这将发出以下查询，假设使用默认 OTel 列。

```sql
SELECT Timestamp AS "timestamp",
  Body AS "body", SeverityText AS "level",
  TraceId AS "traceID" FROM "default"."otel_logs"
WHERE ( traceID = '<trace_id>' )
ORDER BY timestamp ASC LIMIT 1000
```

<Image img={observability_20} alt="Traces to logs" size="lg" border/>

## 仪表板 {#dashboards}

用户可以在 Grafana 中使用 ClickHouse 数据源构建仪表板。我们建议参考 Grafana 和 ClickHouse 的 [数据源文档](https://github.com/grafana/clickhouse-datasource) 以获取更多细节，特别是 [宏的概念](https://github.com/grafana/clickhouse-datasource?tab=readme-ov-file#macros) 和 [变量](https://grafana.com/docs/grafana/latest/dashboards/variables/)。

该插件提供了多个开箱即用的仪表板，包括一个示例仪表板“简单 ClickHouse OTel 仪表板”，用于符合 OTel 规范的日志和跟踪数据。这要求用户遵循 OTel 的默认列名，并可以从数据源配置中安装。

<Image img={observability_21} alt="Dashboards" size="lg" border/>

我们提供了一些构建可视化的简单技巧如下。

### 时间序列 {#time-series}

与统计数据一起，折线图是可观察性用例中最常见的可视化形式。如果查询返回一个名为 `time` 的 `datetime` 和一个数值列，Clickhouse 插件将自动渲染为折线图。例如：

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

<Image img={observability_22} alt="Time series" size="lg" border/>

### 多线图 {#multi-line-charts}

在满足以下条件的情况下，查询将自动渲染为多线图：

- 字段 1：别名为时间的 datetime 字段
- 字段 2：要分组的值。这应该是一个字符串。
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

<Image img={observability_23} alt="Multi-line charts" size="lg" border/>

### 可视化地理数据 {#visualizing-geo-data}

我们在早期部分探讨了使用 IP 字典丰富可观察性数据与地理坐标的方式。假设您有 `latitude` 和 `longitude` 列，可以使用 `geohashEncode` 函数来可视化可观察性。这将生成适用于 Grafana 地图图表的地理哈希。下面是示例查询和可视化：

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

<Image img={observability_24} alt="Visualizing geo data" size="lg" border/>
