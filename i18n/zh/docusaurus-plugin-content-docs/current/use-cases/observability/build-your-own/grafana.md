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

Grafana 是 ClickHouse 中可观察性数据的首选可视化工具。这是通过使用官方的 ClickHouse 插件实现的。用户可以按照 [这里](/integrations/grafana) 的安装说明进行操作。

该插件的 V4 版本使日志和追踪成为新版查询构建器体验中的第一公民。这减少了 SRE 需要编写 SQL 查询的需求，并简化了基于 SQL 的可观察性，推动了这一新兴范例的发展。
其中一部分工作是将 OpenTelemetry (OTel) 置于插件的核心，因为我们相信这将是未来几年 SQL 基于可观察性的基础，以及数据将如何被收集。

## OpenTelemetry 集成 {#open-telemetry-integration}

在 Grafana 中配置 ClickHouse 数据源时，插件允许用户为日志和追踪指定一个默认数据库和表，并确定这些表是否遵循 OTel 架构。这使插件能够返回正确的列，以便在 Grafana 中正确渲染日志和追踪。如果您对默认的 OTel 架构进行了更改，并希望使用自己的列名，可以进行相应指定。对于像时间 (`Timestamp`)、日志级别 (`SeverityText`) 或消息体 (`Body`) 等列的默认 OTel 列名的使用，则无需做出更改。

:::note HTTP 或本机
用户可以通过 HTTP 或本机协议将 Grafana 连接到 ClickHouse。后一种方式提供了边际性能优势，但在 Grafana 用户发出的聚合查询中，可能不那么明显。相反，HTTP 协议通常更容易供用户代理和检查。
:::

日志配置需要时间、日志级别和消息列，以便正确渲染日志。

追踪配置稍微复杂一些（完整列表请参考 [这里](/engines/table-engines/mergetree-family/mergetree#mergetree-data-storage)）。这里需要的列是为了使后续查询能够构建完整的追踪剖面。这些查询假设数据的结构与 OTel 相似，因此偏离标准架构显著的用户将需要使用视图来从这一特性受益。

<Image img={observability_15} alt="Connector config" size="sm"/>

配置完成后，用户可以访问 [Grafana Explore](https://grafana.com/docs/grafana/latest/explore/) 开始搜索日志和追踪。

## 日志 {#logs}

如果遵循 Grafana 对日志的要求，用户可以在查询构建器中选择 `Query Type: Log` 并点击 `Run Query`。查询构建器将制定一个查询来列出日志，并确保正确渲染，例如：

```sql
SELECT Timestamp as timestamp, Body as body, SeverityText as level, TraceId as traceID FROM "default"."otel_logs" WHERE ( timestamp >= $__fromTime AND timestamp <= $__toTime ) ORDER BY timestamp DESC LIMIT 1000
```

<Image img={observability_16} alt="Connector logs config" size="lg" border/>

查询构建器提供了简单的手段来修改查询，避免用户需要编写 SQL。可以从查询构建器中进行过滤，包括查找包含关键词的日志。希望编写更复杂查询的用户可以切换到 SQL 编辑器。如果返回了适当的列，并且将 `logs` 选择为查询类型，结果将按日志渲染。日志渲染所需的列在 [这里](https://grafana.com/developers/plugin-tools/tutorials/build-a-logs-data-source-plugin#logs-data-frame-format) 列出。

### 日志到追踪 {#logs-to-traces}

如果日志包含追踪 ID，用户可以通过特定日志行导航到对应的追踪。

<Image img={observability_17} alt="Logs to traces" size="lg" border/>

## 追踪 {#traces}

类似于上述日志体验，如果满足 Grafana 渲染追踪所需的列（例如，通过使用 OTel 架构），查询构建器能够自动制定必要的查询。通过选择 `Query Type: Traces` 并点击 `Run Query`，将生成并执行一个类似于以下的查询（具体取决于你配置的列 - 以下假设使用 OTel）：

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

该查询返回 Grafana 预期的列名，渲染出如下所示的追踪表格。可以不需要编写 SQL 来对持续时间或其他列进行过滤。

<Image img={observability_18} alt="Traces" size="lg" border/>

希望编写更复杂查询的用户可以切换到 `SQL Editor`。

### 查看追踪详情 {#view-trace-details}

如上所示，追踪 ID 被渲染为可点击的链接。单击追踪 ID，用户可以选择通过链接 `View Trace` 查看相关的 spans。这将发出以下查询（假设 OTel 列），以检索所需结构的 spans，并将结果渲染为瀑布图。

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
注意上面的查询使用物化视图 `otel_traces_trace_id_ts` 进行追踪 ID 查询。有关更多细节，请参见 [加速查询 - 使用物化视图进行查找](/use-cases/observability/schema-design#using-materialized-views-incremental--for-fast-lookups)。
:::

<Image img={observability_19} alt="Trace Details" size="lg" border/>

### 追踪到日志 {#traces-to-logs}

如果日志包含追踪 ID，用户可以从追踪导航到其相关的日志。要查看日志，单击追踪 ID 并选择 `View Logs`。这将发出以下查询，假设使用默认的 OTel 列。

```sql
SELECT Timestamp as "timestamp",
  Body as "body", SeverityText as "level",
  TraceId as "traceID" FROM "default"."otel_logs"
WHERE ( traceID = '<trace_id>' )
ORDER BY timestamp ASC LIMIT 1000
```

<Image img={observability_20} alt="Traces to logs" size="lg" border/>

## 仪表板 {#dashboards}

用户可以在 Grafana 中使用 ClickHouse 数据源构建仪表板。我们建议查阅 Grafana 和 ClickHouse 的 [数据源文档](https://github.com/grafana/clickhouse-datasource) 以获取更多信息，特别是 [宏的概念](https://github.com/grafana/clickhouse-datasource?tab=readme-ov-file#macros) 和 [变量](https://grafana.com/docs/grafana/latest/dashboards/variables/)。

该插件提供了多个开箱即用的仪表板，包括一个示例仪表板“简单 ClickHouse OTel 仪表板”，用于符合 OTel 规范的日志和追踪数据。这要求用户遵循 OTel 的默认列名，且可以从数据源配置中安装。

<Image img={observability_21} alt="Dashboards" size="lg" border/>

我们在下面提供一些构建可视化的简单技巧。

### 时间序列 {#time-series}

除了统计数据，折线图是可观察性用例中最常用的可视化形式。如果查询返回一个名为 `time` 的 `datetime` 字段和一个数值列，Clickhouse 插件将自动渲染一个折线图。例如：

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

只要满足以下条件，查询将自动渲染多线图：

- 字段 1：别名为时间的 datetime 字段
- 字段 2：用于分组的值。应该是字符串。
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

我们已在前面的部分探讨了如何使用 IP 字典丰富可观察性数据的地理坐标。假设您有 `latitude` 和 `longitude` 列，可使用 `geohashEncode` 函数对可观察性进行可视化。这将生成与 Grafana Geo Map 图表兼容的地理散列。以下是示例查询和可视化：

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
