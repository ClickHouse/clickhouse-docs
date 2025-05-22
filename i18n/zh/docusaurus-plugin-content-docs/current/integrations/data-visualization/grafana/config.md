import Image from '@theme/IdealImage';
import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_native.md';
import config_common from '@site/static/images/integrations/data-visualization/grafana/config_common.png';
import config_http from '@site/static/images/integrations/data-visualization/grafana/config_http.png';
import config_additional from '@site/static/images/integrations/data-visualization/grafana/config_additional.png';
import config_logs from '@site/static/images/integrations/data-visualization/grafana/config_logs.png';
import config_traces from '@site/static/images/integrations/data-visualization/grafana/config_traces.png';
import alias_table_config_example from '@site/static/images/integrations/data-visualization/grafana/alias_table_config_example.png';
import alias_table_select_example from '@site/static/images/integrations/data-visualization/grafana/alias_table_select_example.png';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';

# 在 Grafana 中配置 ClickHouse 数据源

<ClickHouseSupportedBadge/>

修改配置的最简单方法是在 Grafana 用户界面上的插件配置页面进行修改，但数据源也可以通过 [YAML 文件进行配置](https://grafana.com/docs/grafana/latest/administration/provisioning/#data-sources)。

本页面展示了 ClickHouse 插件可用配置选项的列表，以及为那些使用 YAML 进行数据源配置的配置代码片段。

有关所有选项的快速概述，完整的配置选项列表可以在 [这里](#all-yaml-options) 找到。

## 常见设置 {#common-settings}

示例配置屏幕：
<Image size="sm" img={config_common} alt="示例安全原生配置" border />

常见设置的示例配置 YAML：
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

请注意，从用户界面保存配置时，会添加 `version` 属性。这显示了保存配置时使用的插件版本。

### HTTP 协议 {#http-protocol}

如果您选择通过 HTTP 协议连接，将显示更多设置。

<Image size="md" img={config_http} alt="额外的 HTTP 配置选项" border />

#### HTTP 路径 {#http-path}

如果您的 HTTP 服务器使用不同的 URL 路径公开，可以在此处添加。

```yaml
jsonData:
  # excludes first slash
  path: additional/path/example
```

#### 自定义 HTTP 标头 {#custom-http-headers}

您可以向发送到服务器的请求添加自定义标头。

标头可以是纯文本或安全的。
所有标头键以纯文本存储，而安全标头值则保存在安全配置中（类似于 `password` 字段）。

:::warning 通过 HTTP 传输安全值
尽管安全标头值安全地存储在配置中，但如果禁用安全连接，值仍将通过 HTTP 发送。
:::

纯文本/安全标头的示例 YAML：
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

## 附加设置 {#additional-settings}

这些附加设置是可选的。

<Image size="sm" img={config_additional} alt="示例附加设置" border />

示例 YAML：
```yaml
jsonData:
  defaultDatabase: default # default database loaded by the query builder. Defaults to "default".
  defaultTable: <string>   # default table loaded by the query builder.

  dialTimeout: 10    # dial timeout when connecting to the server, in seconds. Defaults to "10".
  queryTimeout: 60   # query timeout when running a query, in seconds. Defaults to 60. This requires permissions on the user, if you get a permission error try setting it to "0" to disable it.
  validateSql: false # when set to true, will validate the SQL in the SQL editor.
```

### OpenTelemetry {#opentelemetry}

OpenTelemetry (OTel) 已深度集成于插件中。
OpenTelemetry 数据可以通过我们的 [导出插件](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter) 导出到 ClickHouse。
为了最佳使用，建议为 [日志](#logs) 和 [跟踪](#traces) 配置 OTel。

还需要配置这些默认值以启用 [数据链接](./query-builder.md#data-links)，这是一项启用强大可观察性工作流的功能。

### 日志 {#logs}

为了加速 [日志查询构建](./query-builder.md#logs)，您可以设置默认数据库/表以及日志查询的列。这将预加载查询构建器，使其具有可运行的日志查询，从而使在探索页面浏览变得更快，增强可观察性。

如果您使用 OpenTelemetry，您应该启用 "**使用 OTel**" 开关，并将 **默认日志表** 设置为 `otel_logs`。
这将自动覆盖默认列，以使用所选的 OTel 架构版本。

虽然对日志不需要 OpenTelemetry，但使用单一的日志/跟踪数据集有助于通过 [数据链接](./query-builder.md#data-links) 启用更顺畅的可观察性工作流。

示例日志配置屏幕：
<Image size="sm" img={config_logs} alt="日志配置" border />

示例日志配置 YAML：
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

### 跟踪 {#traces}

为了加速 [跟踪查询构建](./query-builder.md#traces)，您可以设置默认数据库/表以及跟踪查询的列。这将预加载查询构建器，使其具有可运行的跟踪搜索查询，从而使在探索页面浏览变得更快，增强可观察性。

如果您使用 OpenTelemetry，您应该启用 "**使用 OTel**" 开关，并将 **默认跟踪表** 设置为 `otel_traces`。
这将自动覆盖默认列，以使用所选的 OTel 架构版本。
虽然 OpenTelemetry 不是必需的，但此功能在使用其跟踪的架构时效果最好。

示例跟踪配置屏幕：
<Image size="sm" img={config_traces} alt="跟踪配置" border />

示例跟踪配置 YAML：
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

### 列别名 {#column-aliases}

列别名是一种以不同名称和类型查询数据的便捷方式。
通过别名，您可以将嵌套架构扁平化，以便在 Grafana 中轻松选择。

如果您符合以下条件，别名可能对您相关：
- 您了解您的架构及其大多数嵌套属性/类型
- 您以 Map 类型存储数据
- 您将 JSON 存储为字符串
- 您经常对所选列应用函数进行转换

#### 表定义的别名列 {#table-defined-alias-columns}

ClickHouse 内置了列别名，并与 Grafana 默认兼容。
别名列可以直接在表上定义。

```sql
CREATE TABLE alias_example (
  TimestampNanos DateTime(9),
  TimestampDate ALIAS toDate(TimestampNanos)
)
```

在上述示例中，我们创建了一个名为 `TimestampDate` 的别名，将纳秒时间戳转换为 `Date` 类型。
该数据不会像第一列那样存储在磁盘上，而是在查询时计算。
表定义的别名不会通过 `SELECT *` 返回，但可以在服务器设置中配置。

有关更多信息，请阅读 [ALIAS](/sql-reference/statements/create/table#alias) 列类型的文档。

#### 列别名表 {#column-alias-tables}

默认情况下，Grafana 将根据 `DESC table` 的响应提供列建议。
在某些情况下，您可能希望完全覆盖 Grafana 所看到的列。
这有助于在选择列时隐藏您的架构，从而根据您表的复杂程度改善用户体验。

与表定义的别名相比，这种方法的好处在于您可以轻松更新它们，而无需更改表。在某些架构中，这可能包含成千上万条条目，这可能会使底层表定义变得繁琐。这也允许隐藏您希望用户忽略的列。

Grafana 要求别名表具有以下列结构：
```sql
CREATE TABLE aliases (
  `alias` String,  -- The name of the alias, as seen in the Grafana column selector
  `select` String, -- The SELECT syntax to use in the SQL generator
  `type` String    -- The type of the resulting column, so the plugin can modify the UI options to match the data type.
)
```

以下是如何使用别名表复制 `ALIAS` 列的行为：
```sql
CREATE TABLE example_table (
  TimestampNanos DateTime(9)
);

CREATE TABLE example_table_aliases (`alias` String, `select` String, `type` String);

INSERT INTO example_table_aliases (`alias`, `select`, `type`) VALUES
('TimestampNanos', 'TimestampNanos', 'DateTime(9)'), -- Preserve original column from table (optional)
('TimestampDate', 'toDate(TimestampNanos)', 'Date'); -- Add new column that converts TimestampNanos to a Date
```

然后我们可以配置此表在 Grafana 中使用。请注意，名称可以是任意名称，甚至可以在一个单独的数据库中定义：
<Image size="md" img={alias_table_config_example} alt="示例别名表配置" border />

现在 Grafana 将看到别名表的结果，而不是 `DESC example_table` 的结果：
<Image size="md" img={alias_table_select_example} alt="示例别名表选择" border />

这两种类型的别名都可以用于执行复杂的类型转换或 JSON 字段提取。

## 所有 YAML 选项 {#all-yaml-options}

这些是插件提供的所有 YAML 配置选项。
一些字段具有示例值，而其他字段则仅显示字段的类型。

有关使用 YAML 配置数据源的更多信息，请参见 [Grafana 文档](https://grafana.com/docs/grafana/latest/administration/provisioning/#data-sources)。

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
