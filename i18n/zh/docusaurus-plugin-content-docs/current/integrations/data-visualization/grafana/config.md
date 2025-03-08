---
sidebar_label: '插件配置'
sidebar_position: 3
slug: /integrations/grafana/config
description: 'Grafana 中 ClickHouse 数据源插件的配置选项'
---
import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_native.md';
import config_common from '@site/static/images/integrations/data-visualization/grafana/config_common.png';
import config_http from '@site/static/images/integrations/data-visualization/grafana/config_http.png';
import config_additional from '@site/static/images/integrations/data-visualization/grafana/config_additional.png';
import config_logs from '@site/static/images/integrations/data-visualization/grafana/config_logs.png';
import config_traces from '@site/static/images/integrations/data-visualization/grafana/config_traces.png';
import alias_table_config_example from '@site/static/images/integrations/data-visualization/grafana/alias_table_config_example.png';
import alias_table_select_example from '@site/static/images/integrations/data-visualization/grafana/alias_table_select_example.png';


# 在 Grafana 中配置 ClickHouse 数据源

修改配置的最简单方法是在 Grafana UI 的插件配置页面上，但数据源也可以通过 [YAML 文件进行预配置](https://grafana.com/docs/grafana/latest/administration/provisioning/#data-sources)。

此页面列出了 ClickHouse 插件中可用的配置选项，以及为使用 YAML 预配置数据源的配置片段。

有关所有选项的快速概览，完整的配置选项列表可以在 [这里](#all-yaml-options) 找到。

## 常见设置 {#common-settings}

示例配置屏幕：
<img src={config_common} class="image" alt="示例安全原生配置" />

常见设置的示例配置 YAML：
```yaml
jsonData:
  host: 127.0.0.1 # (必需) 服务器地址。
  port: 9000      # (必需) 服务器端口。对于原生，默认为安全的 9440 和不安全的 9000。对于 HTTP，默认为安全的 8443 和不安全的 8123。

  protocol: native # (必需) 用于连接的协议。可以设置为 "native" 或 "http"。
  secure: false    # 如果连接是安全的，则设置为 true。

  username: default # 用于身份验证的用户名。

  tlsSkipVerify:     <boolean> # 设置为 true 时跳过 TLS 验证。
  tlsAuth:           <boolean> # 设置为 true 以启用 TLS 客户端身份验证。
  tlsAuthWithCACert: <boolean> # 如果提供了 CA 证书，则设置为 true。用于验证自签名的 TLS 证书。

secureJsonData:
  password: secureExamplePassword # 用于身份验证的密码。

  tlsCACert:     <string> # TLS CA 证书
  tlsClientCert: <string> # TLS 客户端证书
  tlsClientKey:  <string> # TLS 客户端密钥
```

请注意，`version` 属性在从 UI 保存配置时会被添加。它显示了保存配置时插件的版本。

### HTTP 协议 {#http-protocol}

如果您选择通过 HTTP 协议连接，将显示更多设置。

<img src={config_http} class="image" alt="额外的 HTTP 配置选项" />

#### HTTP 路径 {#http-path}

如果您的 HTTP 服务器在不同的 URL 路径下暴露，可以在此添加。

```yaml
jsonData:
  # 排除第一个斜杠
  path: additional/path/example
```

#### 自定义 HTTP 头 {#custom-http-headers}

您可以为发送到服务器的请求添加自定义头。

头可以是纯文本或安全的。
所有头键以纯文本存储，而安全头值则保存在安全配置中（类似于 `password` 字段）。

:::warning 安全值通过 HTTP 发送
虽然安全头值在配置中安全存储，但如果禁用安全连接，值仍将通过 HTTP 发送。
:::

纯文本/安全头的示例 YAML：
```yaml
jsonData:
  httpHeaders:
  - name: X-Example-Plain-Header
    value: plain text value
    secure: false
  - name: X-Example-Secure-Header
    # "value" 被排除
    secure: true
secureJsonData:
  secureHttpHeaders.X-Example-Secure-Header: secure header value
```

## 附加设置 {#additional-settings}

这些附加设置是可选的。

<img src={config_additional} class="image" alt="示例附加设置" />

示例 YAML：
```yaml
jsonData:
  defaultDatabase: default # 查询构建器加载的默认数据库。默认为 "default"。
  defaultTable: <string>   # 查询构建器加载的默认表。

  dialTimeout: 10    # 连接到服务器时的拨号超时，以秒为单位。默认为 "10"。
  queryTimeout: 60   # 运行查询时的查询超时，以秒为单位。默认为 60。这需要用户权限，如果出现权限错误，请尝试将其设置为 "0" 以禁用。
  validateSql: false # 如果设置为 true，将验证 SQL 编辑器中的 SQL。
```

### OpenTelemetry {#opentelemetry}

OpenTelemetry (OTel) 与插件深度集成。
可以通过我们的 [导出插件](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter) 将 OpenTelemetry 数据导出到 ClickHouse。
为了获得最佳使用效果，建议同时为 [日志](#logs) 和 [追踪](#traces) 配置 OTel。

还需要配置这些默认设置以启用 [数据链接](./query-builder.md#data-links)，这是一个启用强大可观察性工作流的功能。

### 日志 {#logs}

为了加快 [日志的查询构建](./query-builder.md#logs)，您可以设置默认的数据库/表以及日志查询的列。这将使查询构建器预加载一个可运行的日志查询，从而加快了探索页面的浏览速度，提升可观察性。

如果您使用 OpenTelemetry，您应打开“**使用 OTel**”开关，并将 **默认日志表** 设置为 `otel_logs`。
这将自动覆盖默认列以使用所选的 OTel 架构版本。

虽然 OpenTelemetry 不是日志的必需品，但使用单一的日志/追踪数据集有助于通过 [数据链接](./query-builder.md#data-links) 启用更流畅的可观察性工作流。

示例日志配置屏幕：
<img src={config_logs} class="image" alt="日志配置" />

示例日志配置 YAML：
```yaml
jsonData:
  logs:
    defaultDatabase: default # 默认日志数据库。
    defaultTable: otel_logs  # 默认日志表。如果您使用 OTel，应该设置为 "otel_logs"。

    otelEnabled: false  # 如果启用 OTel，则设置为 true。
    otelVersion: latest # 将使用的 OTel 收集器架构版本。版本在 UI 中显示，但 "latest" 将使用插件中可用的最新版本。

    # 打开新日志查询时默认选择的列。如果启用 OTel，将被忽略。
    timeColumn:       <string> # 日志的主时间列。
    levelColumn:   <string> # 日志的级别/严重性。值通常类似于 "INFO"、"error" 或 "Debug"。
    messageColumn: <string> # 日志的消息/内容。
```

### 追踪 {#traces}

为了加快 [追踪的查询构建](./query-builder.md#traces)，您可以设置默认的数据库/表以及追踪查询的列。这将使查询构建器预加载一个可运行的追踪搜索查询，从而加快了探索页面的浏览速度，提升可观察性。

如果您使用 OpenTelemetry，您应打开“**使用 OTel**”开关，并将 **默认追踪表** 设置为 `otel_traces`。
这将自动覆盖默认列以使用所选的 OTel 架构版本。
虽然 OpenTelemetry 不是必需的，但在使用其追踪架构时此功能效果最好。

示例追踪配置屏幕：
<img src={config_traces} class="image" alt="追踪配置" />

示例追踪配置 YAML：
```yaml
jsonData:
  traces:
    defaultDatabase: default  # 默认追踪数据库。
    defaultTable: otel_traces # 默认追踪表。如果您使用 OTel，应该设置为 "otel_traces"。

    otelEnabled: false  # 如果启用 OTel，则设置为 true。
    otelVersion: latest # 将使用的 OTel 收集器架构版本。版本在 UI 中显示，但 "latest" 将使用插件中可用的最新版本。

    # 打开新追踪查询时默认选择的列。如果启用 OTel，将被忽略。
    traceIdColumn:       <string>    # 追踪 ID 列。
    spanIdColumn:        <string>    # span ID 列。
    operationNameColumn: <string>    # 操作名称列。
    parentSpanIdColumn:  <string>    # 父级 span ID 列。
    serviceNameColumn:   <string>    # 服务名称列。
    durationTimeColumn:  <string>    # 持续时间列。
    durationUnitColumn:  <time unit> # 持续时间单位。可以设置为 "seconds"、"milliseconds"、"microseconds" 或 "nanoseconds"。对于 OTel，默认值为 "nanoseconds"。
    startTimeColumn:     <string>    # 开始时间列。这是追踪 span 的主时间列。
    tagsColumn:          <string>    # 标签列。预计为映射类型。
    serviceTagsColumn:   <string>    # 服务标签列。预计为映射类型。
```

### 列别名 {#column-aliases}

列别名是以不同名称和类型查询数据的便捷方式。
通过别名，您可以将嵌套架构扁平化，以便在 Grafana 中轻松选择。

如果您符合以下情况，则别名可能与您相关：
- 您了解您的架构及其大部分嵌套属性/类型
- 您将数据存储在 Map 类型中
- 您将 JSON 存储为字符串
- 您经常应用函数以转换所选列

#### 表定义的 ALIAS 列 {#table-defined-alias-columns}

ClickHouse 内置了列别名，并且可以与 Grafana 开箱即用。
别名列可以直接在表上定义。

```sql
CREATE TABLE alias_example (
  TimestampNanos DateTime(9),
  TimestampDate ALIAS toDate(TimestampNanos)
)
```

在上述示例中，我们创建了一个名为 `TimestampDate` 的别名，将纳秒时间戳转换为 `Date` 类型。
这些数据并不像第一列那样存储在磁盘上，而是在查询时计算。
表定义的别名不会通过 `SELECT *` 返回，但这可以在服务器设置中配置。

有关更多信息，请阅读 [ALIAS](/sql-reference/statements/create/table#alias) 列类型的文档。

#### 列别名表 {#column-alias-tables}

默认情况下，Grafana 会根据 `DESC table` 的响应提供列建议。
在某些情况下，您可能希望完全覆盖 Grafana 看到的列。
这有助于在选择列时隐藏您的架构，从而提高用户体验，具体取决于表的复杂性。

与表定义的别名相比，这种方法的好处在于，您可以轻松更新它们，而无需更改表。在某些架构中，这可能会有数千个条目，可能会使基础表定义混乱。它还允许隐藏您希望用户忽略的列。

Grafana 要求别名表具有以下列结构：
```sql
CREATE TABLE aliases (
  `alias` String,  -- 别名的名称，如 Grafana 列选择器中所示
  `select` String, -- 用于 SQL 生成器的 SELECT 语法
  `type` String    -- 结果列的类型，以便插件可以修改 UI 选项以匹配数据类型。
)
```

以下是我们如何使用别名表复制 `ALIAS` 列的行为：
```sql
CREATE TABLE example_table (
  TimestampNanos DateTime(9)
);

CREATE TABLE example_table_aliases (`alias` String, `select` String, `type` String);

INSERT INTO example_table_aliases (`alias`, `select`, `type`) VALUES
('TimestampNanos', 'TimestampNanos', 'DateTime(9)'), -- 保留表中的原始列（可选）
('TimestampDate', 'toDate(TimestampNanos)', 'Date'); -- 添加新列，将 TimestampNanos 转换为日期
```

然后我们可以配置此表在 Grafana 中使用。请注意，名称可以是任何名称，或者甚至在单独的数据库中定义：
<img src={alias_table_config_example} class="image" alt="示例别名表配置" />

现在 Grafana 将看到别名表的结果，而不是 `DESC example_table` 的结果：
<img src={alias_table_select_example} class="image" alt="示例别名表选择" />

这两种类型的别名都可以用于执行复杂的类型转换或 JSON 字段提取。

## 所有 YAML 选项 {#all-yaml-options}

这些是插件提供的所有 YAML 配置选项。
一些字段有示例值，而其他字段则仅显示字段的类型。

有关使用 YAML 预配置数据源的更多信息，请参阅 [Grafana 文档](https://grafana.com/docs/grafana/latest/administration/provisioning/#data-sources)。

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
