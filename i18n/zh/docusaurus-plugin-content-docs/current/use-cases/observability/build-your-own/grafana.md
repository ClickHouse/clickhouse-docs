---
title: '使用 Grafana'
description: '使用 Grafana 与 ClickHouse 构建可观测性'
slug: /observability/grafana
keywords: ['Observability', 'logs', 'traces', 'metrics', 'OpenTelemetry', 'Grafana', 'OTel']
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


# 将 Grafana 和 ClickHouse 用于可观测性

Grafana 是在 ClickHouse 中用于可观测性数据的首选可视化工具。这是通过 Grafana 的官方 ClickHouse 插件实现的。用户可以按照[此处](/integrations/grafana)的安装说明进行安装。

插件的 V4 版本在全新的查询构建体验中，将日志和追踪提升为一等公民。这大大降低了 SRE 编写 SQL 查询的需求，并简化了基于 SQL 的可观测性，加速了这一新兴范式的发展。
为此，我们将 OpenTelemetry（OTel）置于插件的核心位置，因为我们相信，在未来几年中，它将成为基于 SQL 的可观测性的基础，以及数据采集的主要方式。



## OpenTelemetry 集成 {#open-telemetry-integration}

在 Grafana 中配置 ClickHouse 数据源时,该插件允许用户为日志和追踪指定默认数据库和表,以及这些表是否符合 OTel schema。这使得插件能够返回在 Grafana 中正确渲染日志和追踪所需的列。如果您对默认的 OTel schema 进行了修改并希望使用自定义列名,可以进行指定。使用默认的 OTel 列名(例如时间列 `Timestamp`、日志级别列 `SeverityText` 或消息正文列 `Body`)意味着无需进行任何更改。

:::note HTTP 或 Native 协议
用户可以通过 HTTP 或 Native 协议将 Grafana 连接到 ClickHouse。后者提供了微小的性能优势,但在 Grafana 用户发出的聚合查询中不太可能有明显体现。相反,HTTP 协议通常更便于用户进行代理和检查。
:::

日志配置需要时间列、日志级别列和消息列才能正确渲染日志。

追踪配置稍微复杂一些(完整列表参见[此处](/engines/table-engines/mergetree-family/mergetree#mergetree-data-storage))。此处所需的列是为了使后续构建完整追踪配置文件的查询能够被抽象化。这些查询假定数据结构类似于 OTel,因此与标准 schema 有较大偏差的用户需要使用视图才能从此功能中受益。

<Image img={observability_15} alt='连接器配置' size='sm' />

配置完成后,用户可以导航到 [Grafana Explore](https://grafana.com/docs/grafana/latest/explore/) 并开始搜索日志和追踪。


## 日志 {#logs}

如果遵循 Grafana 对日志的要求,用户可以在查询构建器中选择 `Query Type: Log` 并点击 `Run Query`。查询构建器将生成一个查询来列出日志并确保它们被正确渲染,例如:

```sql
SELECT Timestamp as timestamp, Body as body, SeverityText as level, TraceId as traceID FROM "default"."otel_logs" WHERE ( timestamp >= $__fromTime AND timestamp <= $__toTime ) ORDER BY timestamp DESC LIMIT 1000
```

<Image img={observability_16} alt='连接器日志配置' size='lg' border />

查询构建器提供了一种简单的方式来修改查询,无需用户编写 SQL。可以从查询构建器执行过滤操作,包括查找包含关键字的日志。如需编写更复杂的查询,用户可以切换到 SQL 编辑器。只要返回适当的列,并选择 `logs` 作为查询类型,结果就会以日志形式渲染。日志渲染所需的列在[此处](https://grafana.com/developers/plugin-tools/tutorials/build-a-logs-data-source-plugin#logs-data-frame-format)列出。

### 从日志到追踪 {#logs-to-traces}

如果日志包含追踪 ID,用户可以从特定日志行导航到相应的追踪。

<Image img={observability_17} alt='从日志到追踪' size='lg' border />


## 追踪 {#traces}

与上述日志功能类似,如果满足 Grafana 渲染追踪所需的列(例如使用 OTel 模式),查询构建器能够自动生成必要的查询。选择 `Query Type: Traces` 并点击 `Run Query` 后,将生成并执行类似以下的查询(具体取决于您配置的列 - 以下示例假设使用 OTel):

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

此查询返回 Grafana 所需的列名,并渲染如下所示的追踪表。可以对持续时间或其他列进行过滤,无需编写 SQL。

<Image img={observability_18} alt='Traces' size='lg' border />

需要编写更复杂查询的用户可以切换到 `SQL Editor`。

### 查看追踪详情 {#view-trace-details}

如上所示,追踪 ID 被渲染为可点击的链接。点击追踪 ID 后,用户可以选择通过 `View Trace` 链接查看关联的 span。此操作将发出以下查询(假设使用 OTel 列)以检索所需结构的 span,并将结果渲染为瀑布图。

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
注意上述查询使用物化视图 `otel_traces_trace_id_ts` 来执行追踪 ID 查找。更多详细信息请参阅[加速查询 - 使用物化视图进行查找](/use-cases/observability/schema-design#using-materialized-views-incremental--for-fast-lookups)。
:::

<Image img={observability_19} alt='Trace Details' size='lg' border />

### 从追踪到日志 {#traces-to-logs}

如果日志包含追踪 ID,用户可以从追踪导航到其关联的日志。要查看日志,请点击追踪 ID 并选择 `View Logs`。此操作将发出以下查询(假设使用默认 OTel 列)。

```sql
SELECT Timestamp AS "timestamp",
  Body AS "body", SeverityText AS "level",
  TraceId AS "traceID" FROM "default"."otel_logs"
WHERE ( traceID = '<trace_id>' )
ORDER BY timestamp ASC LIMIT 1000
```

<Image img={observability_20} alt='Traces to logs' size='lg' border />


## 仪表板 {#dashboards}

用户可以使用 ClickHouse 数据源在 Grafana 中构建仪表板。建议参考 Grafana 和 ClickHouse 的[数据源文档](https://github.com/grafana/clickhouse-datasource)了解更多详情,特别是[宏的概念](https://github.com/grafana/clickhouse-datasource?tab=readme-ov-file#macros)和[变量](https://grafana.com/docs/grafana/latest/dashboards/variables/)。

该插件提供了多个开箱即用的仪表板,包括一个示例仪表板"Simple ClickHouse OTel dashboarding",用于符合 OTel 规范的日志和追踪数据。使用该仪表板需要遵循 OTel 的默认列名,可以从数据源配置中安装。

<Image img={observability_21} alt='Dashboards' size='lg' border />

下面提供一些构建可视化的实用技巧。

### 时间序列 {#time-series}

除统计数据外,折线图是可观测性场景中最常见的可视化形式。如果查询返回一个名为 `time` 的 `datetime` 字段和一个数值字段,ClickHouse 插件将自动渲染折线图。例如:

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

<Image img={observability_22} alt='Time series' size='lg' border />

### 多线图表 {#multi-line-charts}

当查询满足以下条件时,将自动渲染多线图表:

- 字段 1:别名为 time 的 datetime 字段
- 字段 2:用于分组的值,应为字符串类型
- 字段 3+:指标值

例如:

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

<Image img={observability_23} alt='Multi-line charts' size='lg' border />

### 可视化地理数据 {#visualizing-geo-data}

在前面的章节中,我们探讨了如何使用 IP 字典为可观测性数据添加地理坐标。假设您已有 `latitude` 和 `longitude` 列,可以使用 `geohashEncode` 函数对可观测性数据进行可视化。该函数生成的地理哈希与 Grafana Geo Map 图表兼容。示例查询和可视化如下所示:

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

<Image img={observability_24} alt='Visualizing geo data' size='lg' border />
