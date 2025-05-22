---
'title': '使用 Grafana'
'description': '使用 Grafana 和 ClickHouse 进行可观察性'
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

Grafana 是 ClickHouse 中可观察性数据的首选可视化工具。通过使用官方的 ClickHouse 插件来实现。用户可以按照 [这里](/integrations/grafana) 的安装说明进行操作。

插件 V4 使日志和追踪成为新的查询构建器体验中的一等公民。这减少了 SRE 书写 SQL 查询的需要，并简化了基于 SQL 的可观察性，为这一新兴范式推动了进展。部分原因是将 Open Telemetry (OTel) 放在插件的核心，因为我们相信这将在未来几年内成为基于 SQL 的可观察性的基础，以及数据将如何被收集。

## Open Telemetry 集成 {#open-telemetry-integration}

在 Grafana 中配置 Clickhouse 数据源时，插件允许用户指定日志和追踪的默认数据库和表，以及这些表是否符合 OTel 架构。这允许插件返回在 Grafana 中正确渲染日志和追踪所需的列。如果您对默认的 OTel 架构进行了更改并希望使用自己的列名，可以指定这些列。如果使用默认的 OTel 列名，比如时间 (Timestamp)、日志级别 (SeverityText) 或消息体 (Body)，则无需进行更改。

:::note HTTP 或 Native
用户可以通过 HTTP 或 Native 协议将 Grafana 连接到 ClickHouse。后者在性能上提供了微小的优势，但在 Grafana 用户发出的聚合查询中可能并不明显。相反，HTTP 协议通常更容易供用户代理和检查。
:::

日志配置需要时间、日志级别和消息列，以便日志能够正确渲染。

追踪配置略微复杂（完整列表 [这里](/engines/table-engines/mergetree-family/mergetree#mergetree-data-storage)）。这里所需的列是为了后续查询能够构建完整的追踪配置文件。这些查询假设数据结构与 OTel 相似，因此显著偏离标准架构的用户将需要使用视图来利用此功能。

<Image img={observability_15} alt="连接器配置" size="sm"/>

配置完成后，用户可以导航至 [Grafana Explore](https://grafana.com/docs/grafana/latest/explore/) 开始搜索日志和追踪。

## 日志 {#logs}

如果遵循 Grafana 对日志的要求，用户可以在查询构建器中选择 `Query Type: Log`，然后点击 `Run Query`。查询构建器将生成一个查询以列出日志并确保它们被正确渲染，例如：

```sql
SELECT Timestamp as timestamp, Body as body, SeverityText as level, TraceId as traceID FROM "default"."otel_logs" WHERE ( timestamp >= $__fromTime AND timestamp <= $__toTime ) ORDER BY timestamp DESC LIMIT 1000
```

<Image img={observability_16} alt="连接器日志配置" size="lg" border/>

查询构建器提供了一种简单的方法来修改查询，避免用户需要书写 SQL。过滤，包括查找包含关键字的日志，可以通过查询构建器进行。希望编写更复杂查询的用户可以切换到 SQL 编辑器。只要返回适当的列，并选择 `logs` 作为查询类型，结果将被呈现为日志。日志渲染所需的列列在 [这里](https://grafana.com/developers/plugin-tools/tutorials/build-a-logs-data-source-plugin#logs-data-frame-format)。

### 日志到追踪 {#logs-to-traces}

如果日志包含追踪 ID，用户可以通过特定日志行导航到追踪。

<Image img={observability_17} alt="日志到追踪" size="lg" border/>

## 追踪 {#traces}

与上述日志体验相似，如果 Grafana 渲染追踪所需的列得到满足（例如，通过使用 OTel 架构），查询构建器能够自动生成必要的查询。选择 `Query Type: Traces` 并点击 `Run Query`，将生成并执行如下查询（根据您的配置列 - 以下假设使用 OTel）：

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

此查询返回 Grafana 所期望的列名，呈现出如下的追踪表。可以无需编写 SQL 对持续时间或其他列进行过滤。

<Image img={observability_18} alt="追踪" size="lg" border/>

希望编写更复杂查询的用户可以切换到 `SQL Editor`。

### 查看追踪详细信息 {#view-trace-details}

如上所示，追踪 ID 被渲染为可单击的链接。点击追踪 ID，用户可以选择通过链接 `View Trace` 查看相关的跨度。这会发出以下查询（假设使用 OTel 列）以检索所需结构中的跨度，并将结果呈现为瀑布图。

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
请注意，上述查询使用物化视图 `otel_traces_trace_id_ts` 来执行追踪 ID 查找。有关更多详细信息，请参见 [加速查询 - 使用物化视图进行查找](/use-cases/observability/schema-design#using-materialized-views-incremental--for-fast-lookups)。
:::

<Image img={observability_19} alt="追踪详细信息" size="lg" border/>

### 追踪到日志 {#traces-to-logs}

如果日志包含追踪 ID，用户可以从追踪导航到相关日志。要查看日志，请点击追踪 ID 并选择 `View Logs`。这将发出以下查询，假设使用默认的 OTel 列。

```sql
SELECT Timestamp as "timestamp",
  Body as "body", SeverityText as "level",
  TraceId as "traceID" FROM "default"."otel_logs"
WHERE ( traceID = '<trace_id>' )
ORDER BY timestamp ASC LIMIT 1000
```

<Image img={observability_20} alt="追踪到日志" size="lg" border/>

## 仪表板 {#dashboards}

用户可以使用 ClickHouse 数据源在 Grafana 中构建仪表板。我们建议查阅 Grafana 和 ClickHouse 的 [数据源文档](https://github.com/grafana/clickhouse-datasource) 以获取更多详细信息，特别是 [宏的概念](https://github.com/grafana/clickhouse-datasource?tab=readme-ov-file#macros) 和 [变量](https://grafana.com/docs/grafana/latest/dashboards/variables/)。

该插件提供了几个开箱即用的仪表板，包括一个示例仪表板 "Simple ClickHouse OTel dashboarding"，用于符合 OTel 规范的日志和追踪数据。这要求用户遵循 OTel 的默认列名，并可以从数据源配置中安装。

<Image img={observability_21} alt="仪表板" size="lg" border/>

以下是构建可视化的一些简单技巧。

### 时间序列 {#time-series}

除了统计，折线图是可观察性用例中最常用的可视化形式。如果查询返回一个名为 `time` 的 `datetime` 和一个数值列，Clickhouse 插件会自动呈现折线图。例如：

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

### 多线图 {#multi-line-charts}

只要满足以下条件，查询将自动呈现多线图：

- 字段 1：别名为 time 的 datetime 字段
- 字段 2：要分组的值。应为一个字符串。
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

<Image img={observability_23} alt="多线图" size="lg" border/>

### 可视化地理数据 {#visualizing-geo-data}

我们在前面的部分中探索了如何利用 IP 字典增强可观察性数据的地理坐标。假设您有 `latitude` 和 `longitude` 列，可以通过 `geohashEncode` 函数可视化可观察性。这将生成与 Grafana Geo Map 图表兼容的地理哈希。下面是一个示例查询和可视化：

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
