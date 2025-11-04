---
'description': '关于在 ClickHouse 中使用 OpenTelemetry 进行分布式跟踪和指标收集的指南'
'sidebar_label': '使用 OpenTelemetry 跟踪 ClickHouse'
'sidebar_position': 62
'slug': '/operations/opentelemetry'
'title': '使用 OpenTelemetry 跟踪 ClickHouse'
'doc_type': 'guide'
---

[OpenTelemetry](https://opentelemetry.io/) 是一个用于从分布式应用程序收集跟踪和指标的开放标准。ClickHouse 对 OpenTelemetry 有一定的支持。

## 向 ClickHouse 提供 trace 上下文 {#supplying-trace-context-to-clickhouse}

ClickHouse 接受 trace 上下文 HTTP 头，如 [W3C 推荐](https://www.w3.org/TR/trace-context/) 所述。它还接受通过用于 ClickHouse 服务器之间或客户端与服务器之间通信的原生协议传递的 trace 上下文。对于手动测试，符合 Trace Context 推荐的 trace 上下文头可以通过 `--opentelemetry-traceparent` 和 `--opentelemetry-tracestate` 选项提供给 `clickhouse-client`。

如果没有提供父 trace 上下文，或提供的 trace 上下文不符合上述 W3C 标准，ClickHouse 可以以由 [opentelemetry_start_trace_probability](/operations/settings/settings#opentelemetry_start_trace_probability) 设置控制的概率启动新的 trace。

## 传播 trace 上下文 {#propagating-the-trace-context}

以下情况下，trace 上下文将传播到下游服务：

* 向远程 ClickHouse 服务器的查询，例如使用 [Distributed](../engines/table-engines/special/distributed.md) 表引擎时。

* [url](../sql-reference/table-functions/url.md) 表函数。trace 上下文信息通过 HTTP 头发送。

## 跟踪 ClickHouse 本身 {#tracing-the-clickhouse-itself}

ClickHouse 为每个查询及某些查询执行阶段（如查询规划或分布式查询）创建 `trace spans`。

为了更有用，跟踪信息必须导出到支持 OpenTelemetry 的监控系统中，例如 [Jaeger](https://jaegertracing.io/) 或 [Prometheus](https://prometheus.io/)。ClickHouse 避免对特定监控系统的依赖，而是通过系统表提供跟踪数据。根据标准所需的 OpenTelemetry trace span 信息 [要求](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/overview.md#span) 存储在 [system.opentelemetry_span_log](../operations/system-tables/opentelemetry_span_log.md) 表中。

该表必须在服务器配置中启用，请参见默认配置文件 `config.xml` 中的 `opentelemetry_span_log` 元素。默认情况下已启用。

标签或属性作为两个并行数组保存，包含键和值。使用 [ARRAY JOIN](../sql-reference/statements/select/array-join.md) 来处理它们。

## 日志查询设置 {#log-query-settings}

设置 [log_query_settings](settings/settings.md) 允许记录查询执行期间对查询设置的更改。当启用时，任何对查询设置所做的修改将记录在 OpenTelemetry span 日志中。此功能在生产环境中特别有用，可以跟踪可能影响查询性能的配置更改。

## 与监控系统的集成 {#integration-with-monitoring-systems}

目前，没有现成的工具可以将 ClickHouse 的跟踪数据导出到监控系统。

对于测试，可以使用基于 [system.opentelemetry_span_log](../operations/system-tables/opentelemetry_span_log.md) 表的 [URL](../engines/table-engines/special/url.md) 引擎设置物化视图进行导出，这可以将到达的日志数据推送到 trace 收集器的 HTTP 端点。例如，将最小的 span 数据推送到运行在 `http://localhost:9411` 的 Zipkin 实例，采用 Zipkin v2 JSON 格式：

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

如果发生任何错误，发生错误的日志数据部分将会悄然丢失。如果数据没有到达，请检查服务器日志以获得错误消息。

## 相关内容 {#related-content}

- 博客: [使用 ClickHouse 构建可观察性解决方案 - 第 2 部分 - 跟踪](https://clickhouse.com/blog/storing-traces-and-spans-open-telemetry-in-clickhouse)
