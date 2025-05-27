---
'description': 'OpenTelemetry 在 ClickHouse 中进行分布式跟踪和指标收集的指南'
'sidebar_label': '使用 OpenTelemetry 进行 ClickHouse 跟踪'
'sidebar_position': 62
'slug': '/operations/opentelemetry'
'title': '使用 OpenTelemetry 进行 ClickHouse 跟踪'
---

[OpenTelemetry](https://opentelemetry.io/) 是一个用于从分布式应用程序收集跟踪和指标的开放标准。 ClickHouse 对 OpenTelemetry 有一定的支持。

## 将跟踪上下文提供给 ClickHouse {#supplying-trace-context-to-clickhouse}

ClickHouse 接受跟踪上下文 HTTP 头，如 [W3C 推荐](https://www.w3.org/TR/trace-context/) 中所述。它还接受通过 ClickHouse 服务器之间或客户端与服务器之间通信所使用的本地协议传递的跟踪上下文。对于手动测试，可以使用 `--opentelemetry-traceparent` 和 `--opentelemetry-tracestate` 标志将符合跟踪上下文推荐的头提供给 `clickhouse-client`。

如果未提供父级跟踪上下文，或提供的跟踪上下文不符合上述 W3C 标准，ClickHouse 可以以由 [opentelemetry_start_trace_probability](/operations/settings/settings#opentelemetry_start_trace_probability) 设置控制的概率开始新的跟踪。

## 传递跟踪上下文 {#propagating-the-trace-context}

在以下情况下，跟踪上下文会传递给下游服务：

* 对远程 ClickHouse 服务器的查询，例如使用 [Distributed](../engines/table-engines/special/distributed.md) 表引擎时。

* [url](../sql-reference/table-functions/url.md) 表函数。跟踪上下文信息通过 HTTP 头发送。

## 跟踪 ClickHouse 本身 {#tracing-the-clickhouse-itself}

ClickHouse 为每个查询以及某些查询执行阶段（例如查询规划或分布式查询）创建 `trace spans`。

为了有用，跟踪信息必须导出到支持 OpenTelemetry 的监控系统，例如 [Jaeger](https://jaegertracing.io/) 或 [Prometheus](https://prometheus.io/)。ClickHouse 避免依赖特定的监控系统，而是通过系统表提供跟踪数据。符合 [标准](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/overview.md#span) 的 OpenTelemetry 跟踪跨度信息存储在 [system.opentelemetry_span_log](../operations/system-tables/opentelemetry_span_log.md) 表中。

该表必须在服务器配置中启用，详见默认配置文件 `config.xml` 中的 `opentelemetry_span_log` 元素。默认情况下它是启用的。

标签或属性作为两个并行数组保存，其中包含键和值。使用 [ARRAY JOIN](../sql-reference/statements/select/array-join.md) 来处理它们。

## 日志查询设置 {#log-query-settings}

设置 [log_query_settings](settings/settings.md) 允许在查询执行期间记录查询设置的更改。当启用时，对查询设置所做的任何修改将记录在 OpenTelemetry 跨度日志中。此功能在生产环境中特别有用，用于跟踪可能影响查询性能的配置更改。

## 与监控系统的集成 {#integration-with-monitoring-systems}

目前，还没有可以将 ClickHouse 的跟踪数据导出到监控系统的现成工具。

对于测试，可以使用基于 [system.opentelemetry_span_log](../operations/system-tables/opentelemetry_span_log.md) 表的 [URL](../engines/table-engines/special/url.md) 引擎设置物化视图进行导出，这将把到达的日志数据推送到跟踪收集器的 HTTP 端点。例如，要将最小的跨度数据以 Zipkin v2 JSON 格式推送到运行在 `http://localhost:9411` 的 Zipkin 实例：

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

在错误发生的情况下，发生错误的日志数据部分将被静默丢失。如果数据未到达，请检查服务器日志以获取错误消息。

## 相关内容 {#related-content}

- 博客: [使用 ClickHouse 构建可观察性解决方案 - 第 2 部分 - 跟踪](https://clickhouse.com/blog/storing-traces-and-spans-open-telemetry-in-clickhouse)
