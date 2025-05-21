---
'description': 'ClickHouse中对Prometheus协议的支持文档'
'sidebar_label': 'Prometheus协议'
'sidebar_position': 19
'slug': '/interfaces/prometheus'
'title': 'Prometheus协议'
---




# Prometheus 协议

## 暴露指标 {#expose}

:::note
如果您使用的是 ClickHouse Cloud，您可以使用 [Prometheus 集成](/integrations/prometheus) 将指标暴露给 Prometheus。
:::

ClickHouse 可以暴露其自身的指标以供 Prometheus 抓取：

```xml
<prometheus>
    <port>9363</port>
    <endpoint>/metrics</endpoint>
    <metrics>true</metrics>
    <asynchronous_metrics>true</asynchronous_metrics>
    <events>true</events>
    <errors>true</errors>
</prometheus>

Section `<prometheus.handlers>` can be used to make more extended handlers.
This section is similar to [<http_handlers>](/interfaces/http) but works for prometheus protocols:

```xml
<prometheus>
    <port>9363</port>
    <handlers>
        <my_rule_1>
            <url>/metrics</url>
            <handler>
                <type>expose_metrics</type>
                <metrics>true</metrics>
                <asynchronous_metrics>true</asynchronous_metrics>
                <events>true</events>
                <errors>true</errors>
            </handler>
        </my_rule_1>
    </handlers>
</prometheus>
```

设置：

| 名称                         | 默认值    | 描述                                                                                                                                                                                  |
|------------------------------|------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `port`                       | none       | 用于提供暴露指标协议的端口。                                                                                                                                              |
| `endpoint`                   | `/metrics` | Prometheus 服务器抓取指标的 HTTP 端点。以 `/` 开头。与 `<handlers>` 部分不应同时使用。                                                                  |
| `url` / `headers` / `method` | none       | 用于查找与请求匹配的处理程序的过滤器。类似于 [`<http_handlers>`](/interfaces/http) 部分中同名字段的功能。                                    |
| `metrics`                    | true       | 从 [system.metrics](/operations/system-tables/metrics) 表暴露指标。                                                                                                        |
| `asynchronous_metrics`       | true       | 从 [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) 表暴露当前指标值。                                                               |
| `events`                     | true       | 从 [system.events](/operations/system-tables/events) 表暴露指标。                                                                                                          |
| `errors`                     | true       | 暴露自上次服务器重启以来按错误代码发生的错误数量。此信息也可以从 [system.errors](/operations/system-tables/errors) 获取。 |

检查（将 `127.0.0.1` 替换为您的 ClickHouse 服务器的 IP 地址或主机名）：
```bash
curl 127.0.0.1:9363/metrics
```

## 远程写入协议 {#remote-write}

ClickHouse 支持 [remote-write](https://prometheus.io/docs/specs/remote_write_spec/) 协议。
数据通过该协议接收并写入 [TimeSeries](/engines/table-engines/special/time_series) 表（应提前创建）。

```xml
<prometheus>
    <port>9363</port>
    <handlers>
        <my_rule_1>
            <url>/write</url>
            <handler>
                <type>remote_write</type>
                <database>db_name</database>
                <table>time_series_table</table>
            </handler>
        </my_rule_1>
    </handlers>
</prometheus>
```

设置：

| 名称                         | 默认值 | 描述                                                                                                                                                                                         |
|------------------------------|---------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `port`                       | none    | 用于提供 `remote-write` 协议的端口。                                                                                                                                                       |
| `url` / `headers` / `method` | none    | 用于查找与请求匹配的处理程序的过滤器。类似于 [`<http_handlers>`](/interfaces/http) 部分中同名字段的功能。                                           |
| `table`                      | none    | 用于写入通过 `remote-write` 协议接收到的数据的 [TimeSeries](/engines/table-engines/special/time_series) 表的名称。该名称可以选择性地包含数据库名称。 |
| `database`                   | none    | 数据库名称，如果在 `table` 设置中未指定，则表的名称位于该数据库中。                                                                    |

## 远程读取协议 {#remote-read}

ClickHouse 支持 [remote-read](https://prometheus.io/docs/prometheus/latest/querying/remote_read_api/) 协议。
数据从 [TimeSeries](/engines/table-engines/special/time_series) 表中读取，并通过该协议发送。

```xml
<prometheus>
    <port>9363</port>
    <handlers>
        <my_rule_1>
            <url>/read</url>
            <handler>
                <type>remote_read</type>
                <database>db_name</database>
                <table>time_series_table</table>
            </handler>
        </my_rule_1>
    </handlers>
</prometheus>
```

设置：

| 名称                         | 默认值 | 描述                                                                                                                                                                                      |
|------------------------------|---------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `port`                       | none    | 用于提供 `remote-read` 协议的端口。                                                                                                                                                     |
| `url` / `headers` / `method` | none    | 用于查找与请求匹配的处理程序的过滤器。类似于 [`<http_handlers>`](/interfaces/http) 部分中同名字段的功能。                                        |
| `table`                      | none    | 用于读取数据以通过 `remote-read` 协议发送的 [TimeSeries](/engines/table-engines/special/time_series) 表的名称。该名称可以选择性地包含数据库名称。 |
| `database`                   | none    | 数据库名称，如果在 `table` 设置中未指定，则表的名称位于该数据库中。                                                                 |

## 多协议配置 {#multiple-protocols}

可以将多个协议一起在一个地方指定：

```xml
<prometheus>
    <port>9363</port>
    <handlers>
        <my_rule_1>
            <url>/metrics</url>
            <handler>
                <type>expose_metrics</type>
                <metrics>true</metrics>
                <asynchronous_metrics>true</asynchronous_metrics>
                <events>true</events>
                <errors>true</errors>
            </handler>
        </my_rule_1>
        <my_rule_2>
            <url>/write</url>
            <handler>
                <type>remote_write</type>
                <table>db_name.time_series_table</table>
            </handler>
        </my_rule_2>
        <my_rule_3>
            <url>/read</url>
            <handler>
                <type>remote_read</type>
                <table>db_name.time_series_table</table>
            </handler>
        </my_rule_3>
    </handlers>
</prometheus>
```
