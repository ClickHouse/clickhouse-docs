---
'sidebar_label': '插件配置'
'sidebar_position': 3
'slug': '/integrations/grafana/config'
'description': '在 Grafana 中为 ClickHouse 数据源插件提供的配置选项'
'title': '在 Grafana 中配置 ClickHouse 数据源'
'doc_type': 'guide'
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


# 在Grafana中配置ClickHouse数据源

<ClickHouseSupportedBadge/>

修改配置的最简单方法是在Grafana UI上的插件配置页面，但数据源也可以通过 [YAML文件](https://grafana.com/docs/grafana/latest/administration/provisioning/#data-sources) 进行预先配置。

本页显示了在ClickHouse插件中可用的配置选项列表，以及使用YAML提供数据源的配置代码片段。

对于所有选项的快速概述，完整的配置选项列表可在 [这里](#all-yaml-options) 找到。

## 通用设置 {#common-settings}

示例配置屏幕：
<Image size="sm" img={config_common} alt="示例安全本地配置" border />

通用设置的示例配置YAML：
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

注意，从UI保存配置时会添加一个 `version` 属性。这显示了保存配置时插件的版本。

### HTTP协议 {#http-protocol}

如果您选择通过HTTP协议连接，将显示更多设置。

<Image size="md" img={config_http} alt="额外的HTTP配置选项" border />

#### HTTP路径 {#http-path}

如果您的HTTP服务器在不同的URL路径下公开，您可以在此处添加。

```yaml
jsonData:
  # excludes first slash
  path: additional/path/example
```

#### 自定义HTTP头部 {#custom-http-headers}

您可以向发送到服务器的请求添加自定义头部。

头部可以是普通文本或安全的。
所有头部键以普通文本存储，而安全头部值保存在安全配置中（类似于 `password` 字段）。

:::warning 通过HTTP传输的安全值
尽管安全头部值安全存储在配置中，但如果未启用安全连接，此值仍将通过HTTP发送。
:::

普通/安全头部的示例YAML：
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

示例YAML：
```yaml
jsonData:
  defaultDatabase: default # default database loaded by the query builder. Defaults to "default".
  defaultTable: <string>   # default table loaded by the query builder.

  dialTimeout: 10    # dial timeout when connecting to the server, in seconds. Defaults to "10".
  queryTimeout: 60   # query timeout when running a query, in seconds. Defaults to 60. This requires permissions on the user, if you get a permission error try setting it to "0" to disable it.
  validateSql: false # when set to true, will validate the SQL in the SQL editor.
```

### OpenTelemetry {#opentelemetry}

OpenTelemetry (OTel) 与插件深度集成。
可以通过我们的 [导出插件](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter) 将OpenTelemetry数据导出到ClickHouse。
为了实现最佳使用，建议为 [日志](#logs) 和 [追踪](#traces) 配置OTel。

还需要配置这些默认值以启用 [数据链接](./query-builder.md#data-links)，这是一个可以实现强大可观察性工作流程的功能。

### 日志 {#logs}

为了加快 [日志查询构建](./query-builder.md#logs)，您可以设置默认数据库/表以及日志查询的列。这将预加载查询构建器，包含可运行的日志查询，使在探索页面浏览更快，以增强可观察性。

如果您使用OpenTelemetry，应启用 "**使用OTel**" 开关，并将 **默认日志表** 设置为 `otel_logs`。
这将自动覆盖默认列，以使用所选的OTel模式版本。

虽然OpenTelemetry并不是日志查询的必需，但使用单一的日志/追踪数据集有助于在使用 [数据链接](./query-builder.md#data-links) 时实现更顺畅的可观察性工作流程。

示例日志配置屏幕：
<Image size="sm" img={config_logs} alt="日志配置" border />

示例日志配置YAML：
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

### 追踪 {#traces}

为了加快 [追踪查询的构建](./query-builder.md#traces)，您可以设置默认数据库/表以及追踪查询的列。这将预加载查询构建器，包含可运行的追踪搜索查询，使在探索页面浏览更快，以增强可观察性。

如果您使用OpenTelemetry，应启用 "**使用OTel**" 开关，并将 **默认追踪表** 设置为 `otel_traces`。
这将自动覆盖默认列，以使用所选的OTel模式版本。
虽然不强制要求OpenTelemetry，但当使用其追踪模式时，此功能效果最佳。

示例追踪配置屏幕：
<Image size="sm" img={config_traces} alt="追踪配置" border />

示例追踪配置YAML：
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

列别名是以不同名称和类型查询数据的便捷方式。
通过别名，您可以将嵌套模式展平，以便在Grafana中轻松选择。

如果您：
- 知道您的模式及其大多数嵌套属性/类型
- 将数据存储在Map类型中
- 将JSON作为字符串存储
- 经常应用函数以转换选择的列

则别名可能与您相关。

#### 表定义的别名列 {#table-defined-alias-columns}

ClickHouse内置列别名功能，并与Grafana开箱即用。
可以直接在表上定义别名列。

```sql
CREATE TABLE alias_example (
  TimestampNanos DateTime(9),
  TimestampDate ALIAS toDate(TimestampNanos)
)
```

在上面的示例中，我们创建了一个名为 `TimestampDate` 的别名，将纳秒时间戳转换为 `Date` 类型。
这些数据不存储在磁盘上，而是在查询时计算。
表定义的别名不会与 `SELECT *` 一起返回，但可以在服务器设置中进行配置。

有关更多信息，请阅读 [ALIAS](/sql-reference/statements/create/table#alias) 列类型的文档。

#### 列别名表 {#column-alias-tables}

默认情况下，Grafana将根据 `DESC table` 的响应提供列建议。
在某些情况下，您可能希望完全覆盖Grafana看到的列。
这有助于在选择列时模糊化Grafana中的模式，根据表的复杂性可能会改善用户体验。

与表定义的别名相比，此方法的好处在于，您可以轻松更新它们，而无需更改表。在某些模式中，这可能长达数千个条目，可能会使基础表定义变得杂乱。它还允许隐藏您希望用户忽略的列。

Grafana要求别名表具有以下列结构：
```sql
CREATE TABLE aliases (
  `alias` String,  -- The name of the alias, as seen in the Grafana column selector
  `select` String, -- The SELECT syntax to use in the SQL generator
  `type` String    -- The type of the resulting column, so the plugin can modify the UI options to match the data type.
)
```

以下是我们如何使用别名表复制 `ALIAS` 列的行为：
```sql
CREATE TABLE example_table (
  TimestampNanos DateTime(9)
);

CREATE TABLE example_table_aliases (`alias` String, `select` String, `type` String);

INSERT INTO example_table_aliases (`alias`, `select`, `type`) VALUES
('TimestampNanos', 'TimestampNanos', 'DateTime(9)'), -- Preserve original column from table (optional)
('TimestampDate', 'toDate(TimestampNanos)', 'Date'); -- Add new column that converts TimestampNanos to a Date
```

然后我们可以配置此表在Grafana中使用。请注意，名称可以是任何内容，甚至可以在单独的数据库中定义：
<Image size="md" img={alias_table_config_example} alt="示例别名表配置" border />

现在Grafana将看到别名表的结果，而不是 `DESC example_table` 的结果：
<Image size="md" img={alias_table_select_example} alt="示例别名表选择" border />

这两种类型的别名都可以用于执行复杂的类型转换或JSON字段提取。

## 所有YAML选项 {#all-yaml-options}

这些是插件提供的所有YAML配置选项。
某些字段具有示例值，而其他字段则仅显示字段的类型。

有关使用YAML预配置数据源的更多信息，请参见 [Grafana文档](https://grafana.com/docs/grafana/latest/administration/provisioning/#data-sources)。

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
