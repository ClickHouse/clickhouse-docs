---
description: '在 ClickHouse 中使用 OpenTelemetry 进行分布式链路追踪与指标采集的指南'
sidebar_label: '使用 OpenTelemetry 追踪 ClickHouse'
sidebar_position: 62
slug: /operations/opentelemetry
title: '使用 OpenTelemetry 追踪 ClickHouse'
doc_type: 'guide'
---

[OpenTelemetry](https://opentelemetry.io/) 是一个用于从分布式应用程序中收集链路追踪和指标的开放标准。ClickHouse 内置了对 OpenTelemetry 的部分支持。



## 向 ClickHouse 提供 trace 上下文 {#supplying-trace-context-to-clickhouse}

ClickHouse 接收符合 [W3C 规范](https://www.w3.org/TR/trace-context/)的 trace 上下文 HTTP 头部。它还可以通过一种原生协议接收 trace 上下文，该协议用于 ClickHouse 服务器之间或客户端与服务器之间的通信。对于手动测试，可以使用 `--opentelemetry-traceparent` 和 `--opentelemetry-tracestate` 参数，将符合 Trace Context 规范的 trace 上下文头部传递给 `clickhouse-client`。

如果未提供父级 trace 上下文，或者提供的 trace 上下文不符合上述 W3C 标准，ClickHouse 可以启动一个新的 trace，其触发概率由 [opentelemetry_start_trace_probability](/operations/settings/settings#opentelemetry_start_trace_probability) 设置控制。



## 传播 trace 上下文 {#propagating-the-trace-context}

在以下情况下，trace 上下文会被传播到下游服务：

* 对远程 ClickHouse 服务器的查询，例如使用 [Distributed](../engines/table-engines/special/distributed.md) 表引擎时。

* [url](../sql-reference/table-functions/url.md) 表函数。trace 上下文信息会通过 HTTP 请求头发送。



## 对 ClickHouse 本身进行追踪 {#tracing-the-clickhouse-itself}

ClickHouse 会为每个查询以及部分查询执行阶段（例如查询规划或分布式查询）创建 `trace spans`。

为了发挥作用，追踪信息必须导出到支持 OpenTelemetry 的监控系统中，例如 [Jaeger](https://jaegertracing.io/) 或 [Prometheus](https://prometheus.io/)。ClickHouse 避免依赖特定监控系统，而是仅通过系统表提供追踪数据。符合 OpenTelemetry 标准要求的 trace span 信息（参见[标准定义](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/overview.md#span)）存储在 [system.opentelemetry_span_log](../operations/system-tables/opentelemetry_span_log.md) 表中。

必须在服务器配置中启用该表，参见默认配置文件 `config.xml` 中的 `opentelemetry_span_log` 元素。该功能默认已启用。

标签或属性以两个并行数组的形式保存，分别包含键和值。使用 [ARRAY JOIN](../sql-reference/statements/select/array-join.md) 来处理它们。



## Log-query-settings {#log-query-settings}

[log_query_settings](settings/settings.md) 设置允许在查询执行期间将对查询设置所做的更改写入日志。启用后，对查询设置的任何修改都会记录到 OpenTelemetry span 日志中。此功能在生产环境中尤为有用，可用于跟踪可能影响查询性能的配置更改。



## 与监控系统的集成 {#integration-with-monitoring-systems}

目前，还没有可将 ClickHouse 的跟踪数据导出到监控系统的现成工具。

在测试时，可以通过在 [system.opentelemetry&#95;span&#95;log](../operations/system-tables/opentelemetry_span_log.md) 表之上创建一个使用 [URL](../engines/table-engines/special/url.md) 引擎的物化视图来配置导出，该视图会将接收到的日志数据推送到某个 trace 收集器的 HTTP 端点。例如，要将最精简的 span 数据以 Zipkin v2 JSON 格式推送到运行在 `http://localhost:9411` 的 Zipkin 实例，可以这样做：

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

如果发生任何错误，发生错误的那部分日志数据将被静默丢弃。若数据未到达，请检查服务器日志中的错误消息。


## 相关内容 {#related-content}

- 博客：[使用 ClickHouse 构建可观测性解决方案 - 第 2 部分：跟踪（Traces）](https://clickhouse.com/blog/storing-traces-and-spans-open-telemetry-in-clickhouse)
