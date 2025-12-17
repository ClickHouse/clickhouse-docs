---
description: '关于 ClickHouse 对 Prometheus 协议支持的文档'
sidebar_label: 'Prometheus 协议'
sidebar_position: 19
slug: /interfaces/prometheus
title: 'Prometheus 协议'
doc_type: 'reference'
---

# Prometheus 协议 {#prometheus-protocols}

## 暴露指标 {#expose}

:::note
如果您使用 ClickHouse Cloud，可以通过 [Prometheus 集成](/integrations/prometheus) 将指标暴露给 Prometheus。
:::

ClickHouse 可以将自身指标暴露出来，供 Prometheus 抓取：

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
                <histograms>true</histograms>
                <dimensional_metrics>true</dimensional_metrics>
            </handler>
        </my_rule_1>
    </handlers>
</prometheus>
````

Settings:

| Name                         | Default    | Description                                                                                             |
| ---------------------------- | ---------- | ------------------------------------------------------------------------------------------------------- |
| `port`                       | none       | 用于对外提供 metrics 协议服务的端口。                                                                                 |
| `endpoint`                   | `/metrics` | 供 Prometheus 服务器抓取 metrics 的 HTTP endpoint。以 `/` 开头。不应与 `<handlers>` 部分一起使用。                            |
| `url` / `headers` / `method` | none       | 用于为请求查找匹配 handler 的过滤条件。类似于 [`<http_handlers>`](/interfaces/http) 部分中具有相同名称的字段。                         |
| `metrics`                    | true       | 从 [system.metrics](/operations/system-tables/metrics) 表中暴露 metrics 指标。                                  |
| `asynchronous_metrics`       | true       | 从 [system.asynchronous&#95;metrics](/operations/system-tables/asynchronous_metrics) 表中暴露当前 metrics 指标值。 |
| `events`                     | true       | 从 [system.events](/operations/system-tables/events) 表中暴露 metrics 指标。                                    |
| `errors`                     | true       | 暴露自上次服务器重启以来按错误码统计的错误数量。该信息也可以从 [system.errors](/operations/system-tables/errors) 表中获取。                 |
| `histograms`                 | true       | 从 [system.histogram&#95;metrics](/operations/system-tables/histogram_metrics) 表中暴露直方图类 metrics 指标。      |
| `dimensional_metrics`        | true       | 从 [system.dimensional&#95;metrics](/operations/system-tables/dimensional_metrics) 表中暴露维度化 metrics 指标。   |

检查（将 `127.0.0.1` 替换为 ClickHouse 服务器的 IP 地址或主机名）：

```bash
curl 127.0.0.1:9363/metrics
```

## 远程写入协议

ClickHouse 支持 [remote-write](https://prometheus.io/docs/specs/remote_write_spec/) 协议。
通过该协议接收的数据会写入 [TimeSeries](/engines/table-engines/special/time_series) 表中
（该表需要预先创建）。

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

| Name                         | Default | Description                                                                                                    |
| ---------------------------- | ------- | -------------------------------------------------------------------------------------------------------------- |
| `port`                       | none    | 用于提供 `remote-write` 协议服务的监听端口。                                                                                 |
| `url` / `headers` / `method` | none    | 用于为请求查找匹配处理器的过滤条件。与 [`<http_handlers>`](/interfaces/http) 部分中同名字段含义相同。                                         |
| `table`                      | none    | 用于写入通过 `remote-write` 协议接收到的数据的 [TimeSeries](/engines/table-engines/special/time_series) 表名。该名称也可以选择性地包含数据库名称。 |
| `database`                   | none    | 当 `table` 设置中未指定数据库名时，`table` 设置中指定的表所在的数据库名称。                                                                 |

## 远程读取协议

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

Settings:

| Name                         | Default | Description                                                                                              |
| ---------------------------- | ------- | -------------------------------------------------------------------------------------------------------- |
| `port`                       | none    | 用于提供 `remote-read` 协议服务的端口。                                                                              |
| `url` / `headers` / `method` | none    | 用于为请求查找匹配处理器的过滤条件。类似于 [`<http_handlers>`](/interfaces/http) 部分中同名字段。                                     |
| `table`                      | none    | 通过 `remote-read` 协议发送数据时读取数据的 [TimeSeries](/engines/table-engines/special/time_series) 表名。该名称中也可以包含数据库名。 |
| `database`                   | none    | 当在 `table` 设置中未指定数据库名时，用于指定该表所在数据库的名称。                                                                   |

## 多协议配置

可以在同一位置同时指定多个协议：

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
