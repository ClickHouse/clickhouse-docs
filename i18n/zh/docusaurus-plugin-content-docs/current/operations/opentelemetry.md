---
'description': '在 ClickHouse 中使用 OpenTelemetry 进行分布式追踪和指标收集的指南'
'sidebar_label': '使用 OpenTelemetry 对 ClickHouse 进行追踪'
'sidebar_position': 62
'slug': '/operations/opentelemetry'
'title': '使用 OpenTelemetry 对 ClickHouse 进行追踪'
---



[OpenTelemetry](https://opentelemetry.io/) 是一个用于从分布式应用程序收集追踪和指标的开放标准。ClickHouse 对 OpenTelemetry 有一些支持。

## 向 ClickHouse 提供追踪上下文 {#supplying-trace-context-to-clickhouse}

ClickHouse 接受追踪上下文 HTTP 头，如 [W3C 建议](https://www.w3.org/TR/trace-context/) 所述。它还通过用于 ClickHouse 服务器之间或客户端与服务器之间通信的原生协议接受追踪上下文。对于手动测试，可以使用 `--opentelemetry-traceparent` 和 `--opentelemetry-tracestate` 标志将符合追踪上下文建议的头提供给 `clickhouse-client`。

如果未提供父追踪上下文，或者提供的追踪上下文不符合上述 W3C 标准，ClickHouse 可以以由 [opentelemetry_start_trace_probability](/operations/settings/settings#opentelemetry_start_trace_probability) 设置控制的概率开始一个新的追踪。

## 传播追踪上下文 {#propagating-the-trace-context}

在以下情况下，追踪上下文会传播到下游服务：

* 查询远程 ClickHouse 服务器，例如使用 [Distributed](../engines/table-engines/special/distributed.md) 表引擎时。

* [url](../sql-reference/table-functions/url.md) 表函数。追踪上下文信息通过 HTTP 头发送。

## 对 ClickHouse 本身进行追踪 {#tracing-the-clickhouse-itself}

ClickHouse 为每个查询及某些查询执行阶段（例如查询规划或分布式查询）创建 `trace spans`。

为了有用，追踪信息必须导出到支持 OpenTelemetry 的监控系统，例如 [Jaeger](https://jaegertracing.io/) 或 [Prometheus](https://prometheus.io/)。ClickHouse 避免依赖于特定的监控系统，而仅通过系统表提供追踪数据。OpenTelemetry 追踪跨度信息 [标准要求的](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/overview.md#span) 存储在 [system.opentelemetry_span_log](../operations/system-tables/opentelemetry_span_log.md) 表中。

必须在服务器配置中启用该表，请参见默认配置文件 `config.xml` 中的 `opentelemetry_span_log` 元素。默认情况下已启用。

标签或属性作为两个并行数组保存，包含键和值。使用 [ARRAY JOIN](../sql-reference/statements/select/array-join.md) 进行操作。

## 日志查询设置 {#log-query-settings}

设置 [log_query_settings](settings/settings.md) 允许在查询执行期间记录查询设置的更改。当启用时，对查询设置的任何修改都将记录在 OpenTelemetry span 日志中。此功能在生产环境中特别有用，因为它可以跟踪可能影响查询性能的配置更改。

## 与监控系统的集成 {#integration-with-monitoring-systems}

目前，没有现成的工具可以将 ClickHouse 的追踪数据导出到监控系统。

为了进行测试，可以使用 [URL](../engines/table-engines/special/url.md) 引擎通过 [system.opentelemetry_span_log](../operations/system-tables/opentelemetry_span_log.md) 表设置导出，这将把到达的日志数据推送到追踪收集器的 HTTP 端点。例如，要将最小的跨度数据推送到运行在 `http://localhost:9411` 的 Zipkin 实例中，采用 Zipkin v2 JSON 格式：

```sql
CREATE MATERIALIZED VIEW default.zipkin_spans
ENGINE = URL('http://127.0.0.1:9411/api/v2/spans', 'JSONEachRow')
SETTINGS output_format_json_named_tuples_as_objects = 1,
    output_format_json_array_of_rows = 1 AS
SELECT
    lower(hex(trace_id)) AS traceId,
    case when parent_span_id = 0 then '' else lower(hex(parent_span_id)) end AS parentId,
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

在出现任何错误的情况下，发生错误的日志数据部分将静默丢失。如果数据没有到达，请检查服务器日志以获取错误消息。

## 相关内容 {#related-content}

- 博客: [使用 ClickHouse 构建可观测性解决方案 - 第 2 部分 - 追踪](https://clickhouse.com/blog/storing-traces-and-spans-open-telemetry-in-clickhouse)
