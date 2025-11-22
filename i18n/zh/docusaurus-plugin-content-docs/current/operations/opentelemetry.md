---
description: '在 ClickHouse 中使用 OpenTelemetry 进行分布式追踪和指标采集的指南'
sidebar_label: '使用 OpenTelemetry 追踪 ClickHouse'
sidebar_position: 62
slug: /operations/opentelemetry
title: '使用 OpenTelemetry 追踪 ClickHouse'
doc_type: 'guide'
---

[OpenTelemetry](https://opentelemetry.io/) 是一种用于从分布式应用中收集链路追踪和指标数据的开放标准。ClickHouse 对 OpenTelemetry 提供了一定程度的支持。



## 向 ClickHouse 提供追踪上下文 {#supplying-trace-context-to-clickhouse}

ClickHouse 接受追踪上下文 HTTP 头,如 [W3C 建议](https://www.w3.org/TR/trace-context/)中所述。它还通过用于 ClickHouse 服务器之间或客户端与服务器之间通信的原生协议接受追踪上下文。对于手动测试,可以使用 `--opentelemetry-traceparent` 和 `--opentelemetry-tracestate` 标志向 `clickhouse-client` 提供符合 Trace Context 建议的追踪上下文头。

如果未提供父追踪上下文或提供的追踪上下文不符合上述 W3C 标准,ClickHouse 可以启动新的追踪,其概率由 [opentelemetry_start_trace_probability](/operations/settings/settings#opentelemetry_start_trace_probability) 设置控制。


## 传播追踪上下文 {#propagating-the-trace-context}

在以下情况下,追踪上下文会传播到下游服务:

- 查询远程 ClickHouse 服务器时,例如使用 [Distributed](../engines/table-engines/special/distributed.md) 表引擎。

- [url](../sql-reference/table-functions/url.md) 表函数。追踪上下文信息通过 HTTP 请求头发送。


## 追踪 ClickHouse 本身 {#tracing-the-clickhouse-itself}

ClickHouse 会为每个查询以及某些查询执行阶段(如查询规划或分布式查询)创建 `trace spans`(追踪跨度)。

为了使追踪信息发挥作用,需要将其导出到支持 OpenTelemetry 的监控系统,例如 [Jaeger](https://jaegertracing.io/) 或 [Prometheus](https://prometheus.io/)。ClickHouse 不依赖于特定的监控系统,而是仅通过系统表提供追踪数据。符合[标准要求](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/overview.md#span)的 OpenTelemetry 追踪跨度信息存储在 [system.opentelemetry_span_log](../operations/system-tables/opentelemetry_span_log.md) 表中。

该表必须在服务器配置中启用,请参阅默认配置文件 `config.xml` 中的 `opentelemetry_span_log` 元素。该表默认已启用。

标签或属性以两个并行数组的形式保存,分别包含键和值。可使用 [ARRAY JOIN](../sql-reference/statements/select/array-join.md) 来处理它们。


## Log-query-settings {#log-query-settings}

[log_query_settings](settings/settings.md) 设置用于记录查询执行期间对查询设置的更改。启用后,对查询设置的任何修改都将被记录到 OpenTelemetry span 日志中。此功能在生产环境中尤其有用,可用于跟踪可能影响查询性能的配置变更。


## 与监控系统集成 {#integration-with-monitoring-systems}

目前还没有现成的工具可以将 ClickHouse 的追踪数据导出到监控系统。

在测试环境中,可以通过在 [system.opentelemetry_span_log](../operations/system-tables/opentelemetry_span_log.md) 表上使用 [URL](../engines/table-engines/special/url.md) 引擎创建物化视图来设置导出功能,该视图会将接收到的日志数据推送到追踪收集器的 HTTP 端点。例如,要将最小化的 span 数据以 Zipkin v2 JSON 格式推送到运行在 `http://localhost:9411` 的 Zipkin 实例:

```sql
CREATE MATERIALIZED VIEW default.zipkin_spans
ENGINE = URL('http://127.0.0.1:9411/api/v2/spans', 'JSONEachRow')
SETTINGS output_format_json_named_tuples_as_objects = 1,
    output_format_json_array_of_rows = 1 AS
SELECT
    lower(hex(trace_id)) AS traceId,
    CASE WHEN parent_span_id = 0 THEN '' ELSE lower(hex(parent_span_id)) END AS parentId,
    lower(hex(span_id)) AS id,
    operation_name AS name,
    start_time_us AS timestamp,
    finish_time_us - start_time_us AS duration,
    cast(tuple('clickhouse'), 'Tuple(serviceName text)') AS localEndpoint,
    cast(tuple(
        attribute.values[indexOf(attribute.names, 'db.statement')]),
        'Tuple("db.statement" text)') AS tags
FROM system.opentelemetry_span_log
```

如果发生任何错误,出错部分的日志数据将会静默丢失。如果数据未能到达,请检查服务器日志中的错误消息。


## 相关内容 {#related-content}

- 博客：[使用 ClickHouse 构建可观测性解决方案 - 第 2 部分 - 链路追踪](https://clickhouse.com/blog/storing-traces-and-spans-open-telemetry-in-clickhouse)
