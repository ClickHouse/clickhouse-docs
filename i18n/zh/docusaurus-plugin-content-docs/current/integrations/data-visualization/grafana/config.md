---
sidebar_label: '插件配置'
sidebar_position: 3
slug: /integrations/grafana/config
description: 'Grafana 中 ClickHouse 数据源插件的配置选项'
title: '在 Grafana 中配置 ClickHouse 数据源'
doc_type: 'guide'
keywords: ['Grafana 插件配置', '数据源设置', '连接参数', '身份验证配置', '插件选项']
integration:
  - support_level: '核心'
  - category: 'data_visualization'
---

import Image from '@theme/IdealImage';
import ConnectionDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_native.md';
import config_common from '@site/static/images/integrations/data-visualization/grafana/config_common.png';
import config_http from '@site/static/images/integrations/data-visualization/grafana/config_http.png';
import config_additional from '@site/static/images/integrations/data-visualization/grafana/config_additional.png';
import config_logs from '@site/static/images/integrations/data-visualization/grafana/config_logs.png';
import config_traces from '@site/static/images/integrations/data-visualization/grafana/config_traces.png';
import alias_table_config_example from '@site/static/images/integrations/data-visualization/grafana/alias_table_config_example.png';
import alias_table_select_example from '@site/static/images/integrations/data-visualization/grafana/alias_table_select_example.png';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';

# 在 Grafana 中配置 ClickHouse 数据源 \{#configuring-clickhouse-data-source-in-grafana\}

<ClickHouseSupportedBadge/>

修改配置最简单的方式是在 Grafana 的 UI 中的插件配置页面完成，但也可以通过 [使用 YAML 文件预配置数据源](https://grafana.com/docs/grafana/latest/administration/provisioning/#data-sources)。

本页面展示了 ClickHouse 插件中可用的配置项列表，以及在使用 YAML 预配置数据源时可参考的配置片段。

如需快速了解所有可用选项，可在[此处](#all-yaml-options)查看完整的配置选项列表。

## 通用设置 \{#common-settings\}

示例配置界面：

<Image size="sm" img={config_common} alt="安全原生配置示例" border />

通用设置的 YAML 配置示例：

```yaml
jsonData:
  host: 127.0.0.1 # (required) server address.
  port: 9000      # (required) server port. For native, defaults to 9440 secure and 9000 insecure. For HTTP, defaults to 8443 secure and 8123 insecure.

  protocol: native # (required) the protocol used for the connection. Can be set to "native" or "http".
  secure: false    # set to true if the connection is secure.

  username: default # the username used for authentication.

  tlsSkipVerify:     <boolean> # skips TLS verification when set to true.
  tlsAuth:           <boolean> # set to true to enable TLS client authentication.
  tlsAuthWithCACert: <boolean> # set to true if CA certificate is provided. Required for verifying self-signed TLS certificates.

secureJsonData:
  password: secureExamplePassword # the password used for authentication.

  tlsCACert:     <string> # TLS CA certificate
  tlsClientCert: <string> # TLS client certificate
  tlsClientKey:  <string> # TLS client key
```

请注意，从 UI 中保存配置时会添加一个 `version` 属性。该属性表示配置保存时所使用的插件版本。

### HTTP 协议 \{#http-protocol\}

如果选择通过 HTTP 协议连接，将会显示更多设置。

<Image size="md" img={config_http} alt="额外的 HTTP 配置选项" border />

#### HTTP path \{#http-path\}

如果 HTTP 服务器是在不同的 URL 路径下对外提供服务，可以在此配置该路径。

```yaml
jsonData:
  # excludes first slash
  path: additional/path/example
```

#### 自定义 HTTP 头 \{#custom-http-headers\}

可以为发送到服务器的请求添加自定义 HTTP 头。

HTTP 头可以是明文或安全类型。
所有头的键都会以明文形式存储，而安全头的值会保存在安全配置中（类似于 `password` 字段）。

:::warning 通过 HTTP 传输的安全值
虽然安全头的值会在配置中安全存储，但如果禁用了安全连接，该值仍会通过 HTTP 发送。
:::

明文 / 安全头的 YAML 示例：

```yaml
jsonData:
  httpHeaders:
  - name: X-Example-Plain-Header
    value: plain text value
    secure: false
  - name: X-Example-Secure-Header
    # "value" is excluded
    secure: true
secureJsonData:
  secureHttpHeaders.X-Example-Secure-Header: secure header value
```

## 其他配置 \{#additional-settings\}

以下附加配置为可选项。

<Image size="sm" img={config_additional} alt="附加配置示例" border />

YAML 示例：

```yaml
jsonData:
  defaultDatabase: default # default database loaded by the query builder. Defaults to "default".
  defaultTable: <string>   # default table loaded by the query builder.

  dialTimeout: 10    # dial timeout when connecting to the server, in seconds. Defaults to "10".
  queryTimeout: 60   # query timeout when running a query, in seconds. Defaults to 60. This requires permissions on the user, if you get a permission error try setting it to "0" to disable it.
  validateSql: false # when set to true, will validate the SQL in the SQL editor.
```

### OpenTelemetry \{#opentelemetry\}

OpenTelemetry (OTel) 已与该插件深度集成。
可以使用我们的 [exporter 插件](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter) 将 OpenTelemetry 数据导出到 ClickHouse。
为获得最佳效果，建议同时为 [logs](#logs) 和 [traces](#traces) 配置 OTel。

还需要配置这些默认设置以启用 [data links](./query-builder.md#data-links)，这是一个可以实现强大可观测性工作流的功能。

### 日志 \{#logs\}

为了加快[日志查询构建](./query-builder.md#logs)，可以为日志查询预先设置默认的数据库 / 表以及列。这样会在查询构建器中预加载一个可直接运行的日志查询，从而在探索页面中浏览日志时提升可观测性分析的效率。

如果你使用的是 OpenTelemetry，应当启用“**Use OTel**”开关，并将**默认日志表**设置为 `otel_logs`。
这将自动根据所选的 OTel Schema 版本覆盖默认列配置。

虽然日志并不强制要求使用 OpenTelemetry，但将日志与追踪统一为单一数据集，有助于配合[数据关联](./query-builder.md#data-links)实现更顺畅的可观测性工作流。

日志配置示例界面：

<Image size="sm" img={config_logs} alt="Logs config" border />

日志配置 YAML 示例：

```yaml
jsonData:
  logs:
    defaultDatabase: default # default log database.
    defaultTable: otel_logs  # default log table. If you're using OTel, this should be set to "otel_logs".

    otelEnabled: false  # set to true if OTel is enabled.
    otelVersion: latest # the otel collector schema version to be used. Versions are displayed in the UI, but "latest" will use latest available version in the plugin.

    # Default columns to be selected when opening a new log query. Will be ignored if OTel is enabled.
    timeColumn:       <string> # the primary time column for the log.
    levelColumn:   <string> # the log level/severity of the log. Values typically look like "INFO", "error", or "Debug".
    messageColumn: <string> # the log's message/content.
```

### Traces \{#traces\}

为了加快[构建追踪查询](./query-builder.md#traces)的速度，可以为追踪查询设置默认数据库/数据表以及列。这样会在查询构建器中预加载一条可直接运行的追踪搜索查询，从而使在 Explore 页面中浏览可观测性数据更加高效。

如果你使用的是 OpenTelemetry，应启用“**Use OTel**”开关，并将**默认跟踪表**设置为 `otel_traces`。
这会自动重写默认列，以使用所选的 OTel Schema 版本。
虽然 OpenTelemetry 并非必需，但在对追踪使用其 Schema 时，此功能效果最佳。

示例追踪配置界面：

<Image size="sm" img={config_traces} alt="Traces 配置" border />

示例追踪配置 YAML：

```yaml
jsonData:
  traces:
    defaultDatabase: default  # default trace database.
    defaultTable: otel_traces # default trace table. If you're using OTel, this should be set to "otel_traces".

    otelEnabled: false  # set to true if OTel is enabled.
    otelVersion: latest # the otel collector schema version to be used. Versions are displayed in the UI, but "latest" will use latest available version in the plugin.

    # Default columns to be selected when opening a new trace query. Will be ignored if OTel is enabled.
    traceIdColumn:       <string>    # trace ID column.
    spanIdColumn:        <string>    # span ID column.
    operationNameColumn: <string>    # operation name column.
    parentSpanIdColumn:  <string>    # parent span ID column.
    serviceNameColumn:   <string>    # service name column.
    durationTimeColumn:  <string>    # duration time column.
    durationUnitColumn:  <time unit> # duration time unit. Can be set to "seconds", "milliseconds", "microseconds", or "nanoseconds". For OTel the default is "nanoseconds".
    startTimeColumn:     <string>    # start time column. This is the primary time column for the trace span.
    tagsColumn:          <string>    # tags column. This is expected to be a map type.
    serviceTagsColumn:   <string>    # service tags column. This is expected to be a map type.
```

### 列别名 \{#column-aliases\}

列别名是一种便捷方式，可以使用不同的名称和类型来查询数据。
通过使用别名，你可以将嵌套的模式结构扁平化，从而在 Grafana 中更方便地进行选择。

在以下情况下，你可能会用到别名：

- 你清楚了解自己的模式以及其中大部分嵌套属性/类型
- 你使用 Map 类型来存储数据
- 你将 JSON 以字符串形式存储
- 你经常对所选列应用函数以进行转换

#### 表中定义的 ALIAS 列 \{#table-defined-alias-columns\}

ClickHouse 内置了列别名功能，并可开箱即用地与 Grafana 配合使用。
可以在表定义中直接声明别名列。

```sql
CREATE TABLE alias_example (
  TimestampNanos DateTime(9),
  TimestampDate ALIAS toDate(TimestampNanos)
)
```

在上面的示例中，我们创建了一个名为 `TimestampDate` 的别名，用于将纳秒时间戳转换为 `Date` 类型。
这类数据不像第一列那样存储在磁盘上，而是在查询时计算得到。
表中定义的别名列在执行 `SELECT *` 时不会被返回，但可以通过服务器设置进行调整。

更多信息请参阅 [ALIAS](/sql-reference/statements/create/table#alias) 列类型的文档。

#### 列别名表 \{#column-alias-tables\}

默认情况下，Grafana 会根据 `DESC table` 命令的返回结果提供列建议。
在某些情况下，您可能希望完全覆盖 Grafana 所识别到的列。
在选择列时，这有助于在 Grafana 中对您的 schema 进行一定程度的隐藏，对于复杂表结构可以改善用户体验。

与在表上直接定义别名相比，这种方式的优势在于，您可以轻松更新别名而无需修改表本身。在某些 schema 中，此类定义可能多达数千条，从而使底层表定义变得臃肿不清。同时，它也允许您隐藏希望用户忽略的列。

Grafana 要求别名表具有如下列结构：

```sql
CREATE TABLE aliases (
  `alias` String,  -- The name of the alias, as seen in the Grafana column selector
  `select` String, -- The SELECT syntax to use in the SQL generator
  `type` String    -- The type of the resulting column, so the plugin can modify the UI options to match the data type.
)
```

下面是如何使用别名表来复现 `ALIAS` 列的行为：

```sql
CREATE TABLE example_table (
  TimestampNanos DateTime(9)
);

CREATE TABLE example_table_aliases (`alias` String, `select` String, `type` String);

INSERT INTO example_table_aliases (`alias`, `select`, `type`) VALUES
('TimestampNanos', 'TimestampNanos', 'DateTime(9)'), -- Preserve original column from table (optional)
('TimestampDate', 'toDate(TimestampNanos)', 'Date'); -- Add new column that converts TimestampNanos to a Date
```

然后我们可以在 Grafana 中配置使用此表。请注意，名称可以是任意名称，甚至可以在单独的数据库中定义：

<Image size="md" img={alias_table_config_example} alt="别名表示例配置" border />

现在，Grafana 将使用别名表的结果，而不是 `DESC example_table` 的结果：

<Image size="md" img={alias_table_select_example} alt="别名表示例查询" border />

这两种类型的别名都可以用于执行复杂的类型转换或 JSON 字段提取。

## 所有 YAML 选项 \{#all-yaml-options\}

以下是该插件提供的全部 YAML 配置选项。
部分字段给出了示例值，其他字段仅展示字段类型。

有关通过 YAML 预配置数据源的更多信息，请参阅 [Grafana 文档](https://grafana.com/docs/grafana/latest/administration/provisioning/#data-sources)。

```yaml
datasources:
  - name: Example ClickHouse
    uid: clickhouse-example
    type: grafana-clickhouse-datasource
    jsonData:
      host: 127.0.0.1
      port: 9000
      protocol: native
      secure: false
      username: default
      tlsSkipVerify: <boolean>
      tlsAuth: <boolean>
      tlsAuthWithCACert: <boolean>
      defaultDatabase: default
      defaultTable: <string>
      dialTimeout: 10
      queryTimeout: 60
      validateSql: false
      httpHeaders:
      - name: X-Example-Plain-Header
        value: plain text value
        secure: false
      - name: X-Example-Secure-Header
        secure: true
      logs:
        defaultDatabase: default
        defaultTable: otel_logs
        otelEnabled: false
        otelVersion: latest
        timeColumn: <string>
        levelColumn: <string>
        messageColumn: <string>
      traces:
        defaultDatabase: default
        defaultTable: otel_traces
        otelEnabled: false
        otelVersion: latest
        traceIdColumn: <string>
        spanIdColumn: <string>
        operationNameColumn: <string>
        parentSpanIdColumn: <string>
        serviceNameColumn: <string>
        durationTimeColumn: <string>
        durationUnitColumn: <time unit>
        startTimeColumn: <string>
        tagsColumn: <string>
        serviceTagsColumn: <string>
    secureJsonData:
      tlsCACert:     <string>
      tlsClientCert: <string>
      tlsClientKey:  <string>
      secureHttpHeaders.X-Example-Secure-Header: secure header value
```
