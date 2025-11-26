---
description: '介绍 ClickHouse 对 Prometheus 协议支持的文档'
sidebar_label: 'Prometheus 协议'
sidebar_position: 19
slug: /interfaces/prometheus
title: 'Prometheus 协议'
doc_type: 'reference'
---



# Prometheus 协议



## 暴露指标

:::note
如果使用 ClickHouse Cloud，可以通过 [Prometheus Integration](/integrations/prometheus) 将指标暴露给 Prometheus。
:::

ClickHouse 可以将自身的指标暴露出来，以供 Prometheus 抓取：

````xml
<prometheus>
    <port>9363</port>
    <endpoint>/metrics</endpoint>
    <metrics>true</metrics>
    <asynchronous_metrics>true</asynchronous_metrics>
    <events>true</events>
    <errors>true</errors>
    <histograms>true</histograms>
    <dimensional_metrics>true</dimensional_metrics>
</prometheus>

可以使用 `<prometheus.handlers>` 部分来创建更多扩展处理器。
此部分类似于 [<http_handlers>](/interfaces/http),但用于 Prometheus 协议:

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
                <histograms>true</histograms>
                <dimensional_metrics>true</dimensional_metrics>
            </handler>
        </my_rule_1>
    </handlers>
</prometheus>
````

设置：

| Name                         | Default    | Description                                                                                    |
| ---------------------------- | ---------- | ---------------------------------------------------------------------------------------------- |
| `port`                       | none       | 用于对外提供指标协议服务的端口。                                                                               |
| `endpoint`                   | `/metrics` | 供 Prometheus 服务器抓取指标的 HTTP endpoint。必须以 `/` 开头。不应与 `<handlers>` 小节同时使用。                        |
| `url` / `headers` / `method` | none       | 用于根据请求查找匹配 handler 的过滤条件。与 [`<http_handlers>`](/interfaces/http) 小节中同名字段的含义相同。                 |
| `metrics`                    | true       | 暴露 [system.metrics](/operations/system-tables/metrics) 表中的指标。                                  |
| `asynchronous_metrics`       | true       | 暴露 [system.asynchronous&#95;metrics](/operations/system-tables/asynchronous_metrics) 表中的当前指标值。 |
| `events`                     | true       | 暴露 [system.events](/operations/system-tables/events) 表中的指标。                                    |
| `errors`                     | true       | 暴露自上次服务器重启以来按错误码统计的错误次数。该信息也可以从 [system.errors](/operations/system-tables/errors) 表中获取。        |
| `histograms`                 | true       | 暴露来自 [system.histogram&#95;metrics](/operations/system-tables/histogram_metrics) 的直方图指标。       |
| `dimensional_metrics`        | true       | 暴露来自 [system.dimensional&#95;metrics](/operations/system-tables/dimensional_metrics) 的维度指标。    |

检查（将 `127.0.0.1` 替换为 ClickHouse 服务器的 IP 地址或主机名）：

```bash
curl 127.0.0.1:9363/metrics
```


## Remote-write 协议

ClickHouse 支持 [remote-write](https://prometheus.io/docs/specs/remote_write_spec/) 协议。
通过该协议接收的数据会被写入一个 [TimeSeries](/engines/table-engines/special/time_series) 表
（该表需要事先创建）。

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

Settings:

| Name                         | Default | Description                                                                                                  |
| ---------------------------- | ------- | ------------------------------------------------------------------------------------------------------------ |
| `port`                       | none    | 用于提供 `remote-write` 协议服务的端口。                                                                                 |
| `url` / `headers` / `method` | none    | 用于为请求查找匹配处理器的筛选条件。类似于 [`<http_handlers>`](/interfaces/http) 部分中具有相同名称的字段。                                    |
| `table`                      | none    | 用于写入通过 `remote-write` 协议接收数据的 [TimeSeries](/engines/table-engines/special/time_series) 表名。该名称还可以选择性地包含数据库名称。 |
| `database`                   | none    | 在 `table` 设置中未指定数据库名称时，此处指定 `table` 设置中所述表所在的数据库名称。                                                          |


## 远程读取协议

ClickHouse 支持 [remote-read](https://prometheus.io/docs/prometheus/latest/querying/remote_read_api/) 协议。
数据从 [TimeSeries](/engines/table-engines/special/time_series) 表中读取，并通过该协议进行传输。

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

Settings:

| Name                         | Default | Description                                                                                                  |
| ---------------------------- | ------- | ------------------------------------------------------------------------------------------------------------ |
| `port`                       | none    | 用于提供 `remote-read` 协议服务的端口。                                                                                  |
| `url` / `headers` / `method` | none    | 用于为请求查找匹配的处理程序的过滤器。类似于 [`<http_handlers>`](/interfaces/http) 部分中同名字段。                                        |
| `table`                      | none    | 通过 `remote-read` 协议发送数据时要读取数据的 [TimeSeries](/engines/table-engines/special/time_series) 表名。该名称还可以可选地包含数据库名称。 |
| `database`                   | none    | 如果在 `table` 设置中未指定数据库名称，则此处为包含该表的数据库名称。                                                                      |


## 多协议配置

可以在同一个位置同时指定多个协议：

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
                <histograms>true</histograms>
                <dimensional_metrics>true</dimensional_metrics>
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
