---
description: 'ClickHouse 对 Prometheus 协议支持的文档'
sidebar_label: 'Prometheus 协议'
sidebar_position: 19
slug: /interfaces/prometheus
title: 'Prometheus 协议'
doc_type: 'reference'
---



# Prometheus 协议



## 暴露指标 {#expose}

:::note
如果您使用 ClickHouse Cloud,可以通过 [Prometheus 集成](/integrations/prometheus) 将指标暴露给 Prometheus。
:::

ClickHouse 可以暴露自身的指标供 Prometheus 抓取:

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

`<prometheus.handlers>` 部分可用于创建更多扩展处理器。
此部分类似于 [<http_handlers>](/interfaces/http),但适用于 Prometheus 协议:

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

设置:

| 名称                         | 默认值    | 描述                                                                                                                                                                               |
| ---------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `port`                       | none       | 用于提供指标暴露协议的端口。                                                                                                                                           |
| `endpoint`                   | `/metrics` | Prometheus 服务器抓取指标的 HTTP 端点。以 `/` 开头。不应与 `<handlers>` 部分一起使用。                                                               |
| `url` / `headers` / `method` | none       | 用于查找请求匹配处理器的过滤器。类似于 [`<http_handlers>`](/interfaces/http) 部分中的同名字段。                                    |
| `metrics`                    | true       | 暴露来自 [system.metrics](/operations/system-tables/metrics) 表的指标。                                                                                                        |
| `asynchronous_metrics`       | true       | 暴露来自 [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) 表的当前指标值。                                                               |
| `events`                     | true       | 暴露来自 [system.events](/operations/system-tables/events) 表的指标。                                                                                                          |
| `errors`                     | true       | 暴露自上次服务器重启以来按错误代码分类的错误数量。此信息也可以从 [system.errors](/operations/system-tables/errors) 获取。 |
| `histograms`                 | true       | 暴露来自 [system.histogram_metrics](/operations/system-tables/histogram_metrics) 的直方图指标                                                                                     |
| `dimensional_metrics`        | true       | 暴露来自 [system.dimensional_metrics](/operations/system-tables/dimensional_metrics) 的维度指标                                                                               |

检查(将 `127.0.0.1` 替换为您的 ClickHouse 服务器的 IP 地址或主机名):

```bash
curl 127.0.0.1:9363/metrics
```


## Remote-write 协议 {#remote-write}

ClickHouse 支持 [remote-write](https://prometheus.io/docs/specs/remote_write_spec/) 协议。
通过该协议接收的数据会写入 [TimeSeries](/engines/table-engines/special/time_series) 表
(需要预先创建该表)。

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

设置:

| 名称                         | 默认值 | 描述                                                                                                                                                                                      |
| ---------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `port`                       | none    | 用于提供 `remote-write` 协议服务的端口。                                                                                                                                                    |
| `url` / `headers` / `method` | none    | 用于查找请求匹配处理器的过滤器。与 [`<http_handlers>`](/interfaces/http) 部分中的同名字段类似。                                           |
| `table`                      | none    | 用于写入通过 `remote-write` 协议接收数据的 [TimeSeries](/engines/table-engines/special/time_series) 表名称。该名称可选择性地包含数据库名称。 |
| `database`                   | none    | 当 `table` 设置中未指定数据库名称时,该设置指定 `table` 所在的数据库名称。                                                                 |


## Remote-read 协议 {#remote-read}

ClickHouse 支持 [remote-read](https://prometheus.io/docs/prometheus/latest/querying/remote_read_api/) 协议。
数据从 [TimeSeries](/engines/table-engines/special/time_series) 表中读取并通过此协议发送。

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

设置:

| 名称                         | 默认值 | 描述                                                                                                                                                                                   |
| ---------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `port`                       | none    | 用于提供 `remote-read` 协议服务的端口。                                                                                                                                                  |
| `url` / `headers` / `method` | none    | 用于查找与请求匹配的处理器的过滤器。与 [`<http_handlers>`](/interfaces/http) 部分中的同名字段类似。                                        |
| `table`                      | none    | 用于读取数据并通过 `remote-read` 协议发送的 [TimeSeries](/engines/table-engines/special/time_series) 表名称。此名称可选择性地包含数据库名称。 |
| `database`                   | none    | 当 `table` 设置中未指定数据库名称时,此设置用于指定表所在的数据库名称。                                                              |


## 多协议配置 {#multiple-protocols}

可以在同一位置配置多个协议:

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
