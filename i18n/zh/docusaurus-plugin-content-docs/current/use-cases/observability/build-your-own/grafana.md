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


# 在可观测性中使用 Grafana 和 ClickHouse

Grafana 是在 ClickHouse 中可视化可观测性数据的首选工具，这一能力通过 Grafana 的官方 ClickHouse 插件实现。用户可以按照[此处](/integrations/grafana)的安装说明进行部署。

插件的 V4 版本在全新的查询构建器界面中，将日志和追踪提升为一等公民。这样可以最大程度减少 SRE 编写 SQL 查询的需求，并简化基于 SQL 的可观测性，加速这一新兴范式的演进。
其中一个关键举措是将 OpenTelemetry (OTel) 置于插件的核心位置，因为我们相信，在未来数年内，它将成为基于 SQL 的可观测性的基础，以及数据收集的主要方式。



## OpenTelemetry 集成 {#open-telemetry-integration}

在 Grafana 中配置 ClickHouse 数据源时，插件允许用户为日志和 Trace 指定默认的数据库和表，并指明这些表是否符合 OTel 架构。这使得插件能够返回在 Grafana 中正确渲染日志和 Trace 所需的列。如果你对默认的 OTel 架构进行了修改并希望使用自定义的列名，也可以在此进行指定。对于诸如时间（`Timestamp`）、日志级别（`SeverityText`）或消息体（`Body`）等列，如果使用默认的 OTel 列名，则无需进行任何更改。

:::note HTTP or Native
用户可以通过 HTTP 或 Native 协议将 Grafana 连接到 ClickHouse。后者在性能上有些许优势，但在 Grafana 用户发起的聚合查询中通常难以察觉。相对而言，HTTP 协议通常更便于进行代理和排查。
:::

日志配置要求必须提供时间、日志级别和消息列，才能确保日志被正确渲染。

Trace 配置稍微复杂一些（完整列表见[此处](/engines/table-engines/mergetree-family/mergetree#mergetree-data-storage)）。这里要求的列是为了便于对后续用于构建完整 Trace 画像的查询进行抽象。这些查询假定数据结构与 OTel 类似，因此如果用户在架构上与标准差异较大，则需要使用视图才能利用这一特性。

<Image img={observability_15} alt="Connector config" size="sm"/>

配置完成后，用户可以前往 [Grafana Explore](https://grafana.com/docs/grafana/latest/explore/)，开始搜索日志和 Trace。



## 日志

如果遵循 Grafana 对日志的要求，用户可以在查询构建器中选择 `Query Type: Log`，然后点击 `Run Query`。查询构建器会生成用于列出日志的查询，并确保它们被正确渲染，例如：

```sql
SELECT Timestamp as timestamp, Body as body, SeverityText as level, TraceId as traceID FROM "default"."otel_logs" WHERE ( timestamp >= $__fromTime AND timestamp <= $__toTime ) ORDER BY timestamp DESC LIMIT 1000
```

<Image img={observability_16} alt="连接器日志配置" size="lg" border />

查询构建器提供了一种简单的方式来修改查询，使用户无需手写 SQL。可以在查询构建器中进行过滤操作，包括查找包含关键字的日志。希望编写更复杂查询的用户可以切换到 SQL 编辑器。只要返回了合适的列，并在 Query Type 中选择 `logs`，结果就会以日志形式呈现。用于日志渲染的必需列列在[此处](https://grafana.com/developers/plugin-tools/tutorials/build-a-logs-data-source-plugin#logs-data-frame-format)。

### 从日志跳转到 Trace

如果日志中包含 trace ID，用户就可以从特定日志行跳转并浏览对应的 Trace。

<Image img={observability_17} alt="日志到 Trace" size="lg" border />


## Traces（跟踪）

与上述日志体验类似，如果满足 Grafana 渲染跟踪所需的列（例如使用 OTel schema），查询构建器就可以自动生成所需的查询。通过选择 `Query Type: Traces` 并点击 `Run Query`，将会生成并执行类似如下的查询（具体取决于你配置的列——以下示例假设使用 OTel）：

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

此查询会返回 Grafana 所期望的列名，并渲染出如下所示的 traces 表。可以基于时长或其他列进行过滤，而无需编写 SQL。

<Image img={observability_18} alt="Traces" size="lg" border />

希望编写更复杂查询的用户可以切换到 `SQL Editor`。

### 查看 trace 详情

如上所示，trace ID 会渲染为可点击的链接。点击某个 trace ID 时，用户可以通过 `View Trace` 链接查看关联的 spans。此操作会执行以下查询（假设使用 OTel 列）以按所需结构检索这些 spans，并将结果以瀑布图形式呈现。

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
请注意，上面的查询使用了物化视图 `otel_traces_trace_id_ts` 来执行 trace id 查找。有关更多详细信息，请参阅 [加速查询 - 使用物化视图进行查找](/use-cases/observability/schema-design#using-materialized-views-incremental--for-fast-lookups)。
:::

<Image img={observability_19} alt="Trace Details" size="lg" border />

### Trace 到日志

如果日志中包含 trace id，用户可以从某个 trace 跳转到与其关联的日志。要查看日志，请单击某个 trace id 并选择 `View Logs`。在假定使用 OTel 默认列的前提下，这会执行如下查询。

```sql
SELECT Timestamp AS "timestamp",
  Body AS "body", SeverityText AS "level",
  TraceId AS "traceID" FROM "default"."otel_logs"
WHERE ( traceID = '<trace_id>' )
ORDER BY timestamp ASC LIMIT 1000
```

<Image img={observability_20} alt="从追踪到日志" size="lg" border />


## 仪表盘

用户可以在 Grafana 中使用 ClickHouse 数据源构建仪表盘。我们建议参考 Grafana 和 ClickHouse 的[数据源文档](https://github.com/grafana/clickhouse-datasource)以了解更多细节，尤其是其中的[宏](https://github.com/grafana/clickhouse-datasource?tab=readme-ov-file#macros)和[变量](https://grafana.com/docs/grafana/latest/dashboards/variables/)相关内容。

该插件提供了多个开箱即用的仪表盘，其中包括一个示例仪表盘 “Simple ClickHouse OTel dashboarding”，用于展示符合 OTel 规范的日志和追踪数据。要使用该示例，用户需要遵循 OTel 的默认列名，并可在数据源配置中安装该仪表盘。

<Image img={observability_21} alt="仪表盘" size="lg" border />

下面是一些构建可视化的简单建议。

### 时间序列

除统计类图表外，折线图是在可观测性场景中最常用的可视化形式。ClickHouse 插件会在查询返回一个名为 `time` 的 `datetime` 列以及一个数值列时，自动渲染为折线图。例如：

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

### 多折线图

在满足以下条件时，查询结果会自动渲染为多折线图：

* 字段 1：带有 time 别名的 datetime 字段
* 字段 2：用于分组的值，应为字符串（String）类型
* 字段 3+：指标值

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

<Image img={observability_23} alt="多折线图表" size="lg" border />

### 地理数据可视化

我们在前文中已经探讨了如何使用 IP 字典为可观测性数据添加地理坐标信息。假设你已经有 `latitude` 和 `longitude` 列，可以使用 `geohashEncode` 函数对可观测性数据进行地理可视化。该函数会生成与 Grafana Geo Map 图表兼容的 geohash 值。下面展示了示例查询和可视化结果：

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
