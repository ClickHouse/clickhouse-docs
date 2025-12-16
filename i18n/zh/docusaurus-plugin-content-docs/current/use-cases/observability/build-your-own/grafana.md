---
title: '使用 Grafana'
description: '结合 Grafana 和 ClickHouse 实现可观测性'
slug: /observability/grafana
keywords: ['可观测性', '日志', '追踪', '指标', 'OpenTelemetry', 'Grafana', 'OTel']
show_related_blogs: true
doc_type: 'guide'
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

# 使用 Grafana 和 ClickHouse 构建可观测性 {#using-grafana-and-clickhouse-for-observability}

Grafana 是 ClickHouse 可观测性数据的首选可视化工具。这是通过 Grafana 官方的 ClickHouse 插件实现的。用户可以按照[此处](/integrations/grafana)的安装说明进行操作。

该插件的 V4 版本在全新的查询构建体验中，将日志和链路追踪提升为一等公民。这最大限度地减少了 SRE 编写 SQL 查询的需求，并简化了基于 SQL 的可观测性，推动了这一新兴范式的发展。
其中一项重要工作是将 OpenTelemetry (OTel) 置于插件的核心位置，因为我们认为，在未来几年中，它将成为基于 SQL 的可观测性以及数据采集方式的基础。

## OpenTelemetry 集成 {#open-telemetry-integration}

在 Grafana 中配置 ClickHouse 数据源时，插件允许用户为日志和链路追踪指定默认的数据库和表，并指明这些表是否符合 OTel 模式（schema）。这使插件可以返回在 Grafana 中正确渲染日志和链路追踪所需的列。如果你对默认的 OTel 模式进行了修改，并希望使用自定义列名，也可以在此指定。对于诸如时间列（`Timestamp`）、日志级别（`SeverityText`）或消息体（`Body`）等列，使用默认的 OTel 列名意味着无需做任何额外更改。

:::note HTTP 或 Native
用户可以通过 HTTP 或 Native 协议将 Grafana 连接到 ClickHouse。后者在性能上略有优势，但在 Grafana 用户发起的聚合查询中通常并不明显。相对地，HTTP 协议通常更便于用户进行代理和流量调试与检查。
:::

日志配置需要时间、日志级别和消息列，以便正确渲染日志。

链路追踪配置稍微复杂一些（完整列表见[此处](/engines/table-engines/mergetree-family/mergetree#mergetree-data-storage)）。这里所需的列是为了便于对后续用于构建完整链路追踪画像的查询进行抽象和封装。这些查询假设数据结构与 OTel 类似，因此如果用户显著偏离标准模式，则需要通过视图才能从该特性中受益。

<Image img={observability_15} alt="连接器配置" size="sm"/>

配置完成后，用户可以进入 [Grafana Explore](https://grafana.com/docs/grafana/latest/explore/)，开始搜索日志和链路追踪数据。

## 日志 {#logs}

如果符合 Grafana 的日志查询要求，用户可以在查询构建器中选择 `Query Type: Log`，然后点击 `Run Query`。查询构建器会生成一条查询语句，用于列出日志并确保它们能够正确渲染，例如：

```sql
SELECT Timestamp as timestamp, Body as body, SeverityText as level, TraceId as traceID FROM "default"."otel_logs" WHERE ( timestamp >= $__fromTime AND timestamp <= $__toTime ) ORDER BY timestamp DESC LIMIT 1000
```

<Image img={observability_16} alt="Connector logs config" size="lg" border />

查询构建器提供了一种简便方式来修改查询，从而避免用户手写 SQL。包括关键词搜索在内的筛选操作都可以在查询构建器中完成。希望编写更复杂查询的用户可以切换到 SQL 编辑器。只要返回了合适的列，并且在 Query Type 中选择了 `logs`，结果就会以日志的形式呈现。用于日志渲染的必需列列在[此处](https://grafana.com/developers/plugin-tools/tutorials/build-a-logs-data-source-plugin#logs-data-frame-format)。

### 从日志跳转到 Trace {#logs-to-traces}

如果日志中包含 trace ID，用户可以从特定的日志行导航到对应的 trace 进行查看。

<Image img={observability_17} alt="从日志跳转到 Trace" size="lg" border/>

## Traces {#traces}

与上述日志体验类似，如果满足 Grafana 渲染 trace 所需的列（例如使用 OTel schema），查询构建器就能自动生成所需的查询。通过选择 `Query Type: Traces` 并点击 `Run Query`，就会生成并执行类似如下的查询（具体取决于你配置的列——下面示例假设使用 OTel）：

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

此查询返回 Grafana 所需的列名，并渲染如下所示的跟踪数据表。可以按持续时间或其他列进行过滤，而无需编写 SQL。

<Image img={observability_18} alt="Traces" size="lg" border />

如需编写更复杂的查询，用户可以切换到 `SQL 编辑器`。

### 查看 Trace 详情 {#view-trace-details}

如上所示，Trace ID 会显示为可点击的链接。点击某个 Trace ID 后，用户可以通过 `View Trace` 链接查看关联的 span。系统会执行如下查询（假设使用 OTel 列），以所需结构检索这些 span，并将结果以瀑布图形式呈现。

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
请注意，上述查询如何使用物化视图 `otel_traces_trace_id_ts` 来执行 trace ID 查找。有关详细信息，请参阅[加速查询——使用物化视图进行查找](/use-cases/observability/schema-design#using-materialized-views-incremental--for-fast-lookups)。
:::

<Image img={observability_19} alt="Trace 详情" size="lg" border />

### Trace 到日志 {#traces-to-logs}

如果日志中包含 trace ID，用户可以从某个 trace 跳转到其关联的日志。要查看日志，单击某个 trace ID 并选择 `View Logs`。在使用默认 OTel 列的情况下，将会执行如下查询。

```sql
SELECT Timestamp AS "timestamp",
  Body AS "body", SeverityText AS "level",
  TraceId AS "traceID" FROM "default"."otel_logs"
WHERE ( traceID = '<trace_id>' )
ORDER BY timestamp ASC LIMIT 1000
```

<Image img={observability_20} alt="从链路追踪到日志" size="lg" border />

## 仪表盘 {#dashboards}

用户可以在 Grafana 中使用 ClickHouse 数据源构建仪表盘。建议参考 Grafana 与 ClickHouse 的[数据源文档](https://github.com/grafana/clickhouse-datasource)以获取更多详细信息，尤其是其中关于[宏](https://github.com/grafana/clickhouse-datasource?tab=readme-ov-file#macros)和[变量](https://grafana.com/docs/grafana/latest/dashboards/variables/)的内容。

该插件提供了多个开箱即用的仪表盘，其中包括一个示例仪表盘 “Simple ClickHouse OTel dashboarding”，用于展示符合 OTel 规范的日志和追踪数据。使用该示例需要遵循 OTel 的默认列名约定，并可在数据源配置中进行安装。

<Image img={observability_21} alt="Dashboards" size="lg" border/>

下面是一些用于构建可视化的简单建议。

### 时间序列 {#time-series}

在各种统计图表中，折线图是可观测性场景下最常见的可视化形式。ClickHouse 插件会在查询返回一个名为 `time` 的 `datetime` 列和一个数值列时自动渲染折线图。例如：

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

<Image img={observability_22} alt="时间序列" size="lg" border />

### 多折线图 {#multi-line-charts}

当查询满足以下条件时，会自动渲染为多折线图：

* 字段 1：具有别名 `time` 的 datetime 字段
* 字段 2：用于分组的取值。该字段类型应为字符串（String）。
* 字段 3 及之后：度量指标值

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

<Image img={observability_23} alt="多折线图" size="lg" border />

### 可视化地理数据 {#visualizing-geo-data}

在前文中，我们已经探讨了如何使用 IP 字典为可观测性数据补充地理坐标。假设已经有 `latitude` 和 `longitude` 列，就可以使用 `geohashEncode` 函数来对可观测性数据进行可视化。该函数生成的地理哈希与 Grafana Geo Map 图表兼容。下面展示了一个示例查询和可视化结果：

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

<Image img={observability_24} alt="地理数据可视化" size="lg" border />
