
# Prometheus 协议

## 暴露指标 {#expose}

:::note
如果您使用的是 ClickHouse Cloud，您可以通过 [Prometheus 集成](/integrations/prometheus) 将指标暴露给 Prometheus。
:::

ClickHouse 可以暴露其自身的指标供 Prometheus 抓取：

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

| 名称                         | 默认值    | 描述                                                                                                                                                                                      |
|------------------------------|------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `port`                       | none       | 用于提供暴露指标协议的端口。                                                                                                                                                          |
| `endpoint`                   | `/metrics` | Prometheus 服务器抓取指标的 HTTP 端点。以 `/` 开头。应与 `<handlers>` 部分一起使用。                                                                                                  |
| `url` / `headers` / `method` | none       | 用于查找请求匹配处理程序的过滤器。类似于 [`<http_handlers>`](/interfaces/http) 部分中同名字段。                                                                                       |
| `metrics`                    | true       | 从 [system.metrics](/operations/system-tables/metrics) 表中暴露指标。                                                                                                                  |
| `asynchronous_metrics`       | true       | 从 [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) 表中暴露当前指标值。                                                                                   |
| `events`                     | true       | 从 [system.events](/operations/system-tables/events) 表中暴露指标。                                                                                                                    |
| `errors`                     | true       | 暴露自上次服务器重启以来按错误代码发生的错误数量。这些信息亦可从 [system.errors](/operations/system-tables/errors) 中获得。                                                            |

检查（将 `127.0.0.1` 替换为您的 ClickHouse 服务器的 IP 地址或主机名）：
```bash
curl 127.0.0.1:9363/metrics
```

## 远程写入协议 {#remote-write}

ClickHouse 支持 [remote-write](https://prometheus.io/docs/specs/remote_write_spec/) 协议。
通过该协议接收的数据被写入 [TimeSeries](/engines/table-engines/special/time_series) 表（该表应事先创建）。

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

| 名称                         | 默认值 | 描述                                                                                                                                                                                            |
|------------------------------|---------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `port`                       | none    | 用于提供 `remote-write` 协议的端口。                                                                                                                                                            |
| `url` / `headers` / `method` | none    | 用于查找请求匹配处理程序的过滤器。类似于 [`<http_handlers>`](/interfaces/http) 部分中同名字段。                                                                                            |
| `table`                      | none    | 要写入通过 `remote-write` 协议接收数据的 [TimeSeries](/engines/table-engines/special/time_series) 表的名称。该名称可以选择性地包含数据库的名称。                                          |
| `database`                   | none    | 在 `table` 设置中未指定的表所在数据库的名称（如果未在 `table` 设置中指定）。                                                                                                                  |

## 远程读取协议 {#remote-read}

ClickHouse 支持 [remote-read](https://prometheus.io/docs/prometheus/latest/querying/remote_read_api/) 协议。
通过该协议从 [TimeSeries](/engines/table-engines/special/time_series) 表读取数据并发送。

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
|------------------------------|---------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `port`                       | none    | 用于提供 `remote-read` 协议的端口。                                                                                                                                                     |
| `url` / `headers` / `method` | none    | 用于查找请求匹配处理程序的过滤器。类似于 [`<http_handlers>`](/interfaces/http) 部分中同名字段。                                                                                      |
| `table`                      | none    | 要通过 `remote-read` 协议读取数据并发送的 [TimeSeries](/engines/table-engines/special/time_series) 表的名称。该名称可以选择性地包含数据库的名称。                                      |
| `database`                   | none    | 在 `table` 设置中未指定的表所在数据库的名称（如果未在 `table` 设置中指定）。                                                                                                         |

## 多协议配置 {#multiple-protocols}

可以在一个地方一起指定多个协议：

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
