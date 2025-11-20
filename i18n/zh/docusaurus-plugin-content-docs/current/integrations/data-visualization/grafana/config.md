---
sidebar_label: '插件配置'
sidebar_position: 3
slug: /integrations/grafana/config
description: 'Grafana 中 ClickHouse 数据源插件的配置选项'
title: '在 Grafana 中配置 ClickHouse 数据源'
doc_type: 'guide'
keywords: ['Grafana 插件配置', '数据源设置', '连接参数', '身份验证设置', '插件选项']
---

import Image from '@theme/IdealImage';
import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_native.md';
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

修改配置最简单的方式是在 Grafana UI 的插件配置页面中进行，但也可以通过 [YAML 文件进行预配置](https://grafana.com/docs/grafana/latest/administration/provisioning/#data-sources)来添加数据源。

本页面展示了 ClickHouse 插件中可配置的选项列表，以及为通过 YAML 预配置数据源的用户提供的配置片段。

若需快速了解所有选项，可以在[此处](#all-yaml-options)找到完整的配置项列表。



## 通用设置 {#common-settings}

配置界面示例:

<Image
  size='sm'
  img={config_common}
  alt='安全原生配置示例'
  border
/>

通用设置的 YAML 配置示例:

```yaml
jsonData:
  host: 127.0.0.1 # (必需) 服务器地址。
  port: 9000 # (必需) 服务器端口。对于 native 协议,安全连接默认为 9440,非安全连接默认为 9000。对于 HTTP 协议,安全连接默认为 8443,非安全连接默认为 8123。

  protocol: native # (必需) 连接使用的协议。可设置为 "native" 或 "http"。
  secure: false # 如果连接是安全的,设置为 true。

  username: default # 用于身份验证的用户名。

  tlsSkipVerify: <boolean> # 设置为 true 时跳过 TLS 验证。
  tlsAuth: <boolean> # 设置为 true 以启用 TLS 客户端身份验证。
  tlsAuthWithCACert: <boolean> # 如果提供了 CA 证书,设置为 true。验证自签名 TLS 证书时必需。

secureJsonData:
  password: secureExamplePassword # 用于身份验证的密码。

  tlsCACert: <string> # TLS CA 证书
  tlsClientCert: <string> # TLS 客户端证书
  tlsClientKey: <string> # TLS 客户端密钥
```

注意:从 UI 保存配置时会添加 `version` 属性。该属性显示保存配置时使用的插件版本。

### HTTP 协议 {#http-protocol}

如果选择通过 HTTP 协议连接,将显示更多设置。

<Image size='md' img={config_http} alt='额外的 HTTP 配置选项' border />

#### HTTP 路径 {#http-path}

如果您的 HTTP 服务器在不同的 URL 路径下公开,可以在此处添加该路径。

```yaml
jsonData:
  # 不包含开头的斜杠
  path: additional/path/example
```

#### 自定义 HTTP 头 {#custom-http-headers}

您可以向发送到服务器的请求添加自定义头。

头可以是明文或安全的。
所有头键以明文存储,而安全头值保存在安全配置中(类似于 `password` 字段)。

:::warning 通过 HTTP 传输安全值
虽然安全头值在配置中安全存储,但如果禁用安全连接,该值仍将通过 HTTP 发送。
:::

明文/安全头的 YAML 示例:

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

<Image
  size='sm'
  img={config_additional}
  alt='附加设置示例'
  border
/>

YAML 示例:

```yaml
jsonData:
  defaultDatabase: default # 查询构建器加载的默认数据库。默认值为 "default"。
  defaultTable: <string> # 查询构建器加载的默认表。

  dialTimeout: 10 # 连接服务器时的拨号超时时间,单位为秒。默认值为 "10"。
  queryTimeout: 60 # 运行查询时的查询超时时间,单位为秒。默认值为 60。此设置需要用户权限,如果遇到权限错误,请尝试将其设置为 "0" 以禁用。
  validateSql: false # 设置为 true 时,将在 SQL 编辑器中验证 SQL。
```

### OpenTelemetry {#opentelemetry}

OpenTelemetry (OTel) 已深度集成到插件中。
OpenTelemetry 数据可以通过我们的[导出器插件](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter)导出到 ClickHouse。
为了获得最佳使用效果,建议同时为[日志](#logs)和[链路追踪](#traces)配置 OTel。

还需要配置这些默认值以启用[数据链接](./query-builder.md#data-links),该功能可实现强大的可观测性工作流。

### 日志 {#logs}

为了加快[日志查询构建](./query-builder.md#logs),您可以为日志查询设置默认数据库/表以及列。这将使查询构建器预加载一个可运行的日志查询,从而加快在探索页面上浏览可观测性数据的速度。

如果您使用 OpenTelemetry,应启用"**Use OTel**"开关,并将**默认日志表**设置为 `otel_logs`。
这将自动覆盖默认列以使用所选的 OTel 模式版本。

虽然日志不强制要求使用 OpenTelemetry,但使用统一的日志/链路追踪数据集有助于通过[数据链接](./query-builder.md#data-links)实现更流畅的可观测性工作流。

日志配置屏幕示例:

<Image size='sm' img={config_logs} alt='日志配置' border />

日志配置 YAML 示例:

```yaml
jsonData:
  logs:
    defaultDatabase: default # 默认日志数据库。
    defaultTable: otel_logs # 默认日志表。如果您使用 OTel,应将其设置为 "otel_logs"。

    otelEnabled: false # 如果启用了 OTel,设置为 true。
    otelVersion: latest # 要使用的 otel collector 模式版本。版本显示在 UI 中,但 "latest" 将使用插件中最新的可用版本。

    # 打开新日志查询时要选择的默认列。如果启用了 OTel,将被忽略。
    timeColumn: <string> # 日志的主要时间列。
    levelColumn: <string> # 日志的级别/严重性。值通常类似于 "INFO"、"error" 或 "Debug"。
    messageColumn: <string> # 日志的消息/内容。
```

### 链路追踪 {#traces}

为了加快[链路追踪查询构建](./query-builder.md#traces),您可以为链路追踪查询设置默认数据库/表以及列。这将使查询构建器预加载一个可运行的链路追踪搜索查询,从而加快在探索页面上浏览可观测性数据的速度。

如果您使用 OpenTelemetry,应启用"**Use OTel**"开关,并将**默认链路追踪表**设置为 `otel_traces`。
这将自动覆盖默认列以使用所选的 OTel 模式版本。
虽然不强制要求使用 OpenTelemetry,但使用其模式进行链路追踪时此功能效果最佳。

链路追踪配置屏幕示例:

<Image size='sm' img={config_traces} alt='链路追踪配置' border />

链路追踪配置 YAML 示例:

```yaml
jsonData:
  traces:
    defaultDatabase: default # 默认链路追踪数据库。
    defaultTable: otel_traces # 默认链路追踪表。如果您使用 OTel,应将其设置为 "otel_traces"。

    otelEnabled: false # 如果启用了 OTel,设置为 true。
    otelVersion: latest # 要使用的 otel collector 模式版本。版本显示在 UI 中,但 "latest" 将使用插件中最新的可用版本。
```


    # 打开新跟踪查询时要选择的默认列。如果启用了 OTel,则将被忽略。
    traceIdColumn:       <string>    # 跟踪 ID 列。
    spanIdColumn:        <string>    # span ID 列。
    operationNameColumn: <string>    # 操作名称列。
    parentSpanIdColumn:  <string>    # 父 span ID 列。
    serviceNameColumn:   <string>    # 服务名称列。
    durationTimeColumn:  <string>    # 持续时间列。
    durationUnitColumn:  <time unit> # 持续时间单位。可以设置为 "seconds"、"milliseconds"、"microseconds" 或 "nanoseconds"。对于 OTel,默认值为 "nanoseconds"。
    startTimeColumn:     <string>    # 开始时间列。这是跟踪 span 的主时间列。
    tagsColumn:          <string>    # 标签列。预期为 map 类型。
    serviceTagsColumn:   <string>    # 服务标签列。预期为 map 类型。

````

### 列别名 {#column-aliases}

列别名是一种便捷的方式,可以使用不同的名称和类型查询数据。
通过别名,您可以将嵌套模式展平,以便在 Grafana 中轻松选择。

在以下情况下,别名可能对您有用:
- 您了解模式及其大部分嵌套属性/类型
- 您将数据存储在 Map 类型中
- 您将 JSON 存储为字符串
- 您经常应用函数来转换所选列

#### 表定义的 ALIAS 列 {#table-defined-alias-columns}

ClickHouse 内置了列别名功能,可以直接与 Grafana 配合使用。
别名列可以直接在表上定义。

```sql
CREATE TABLE alias_example (
  TimestampNanos DateTime(9),
  TimestampDate ALIAS toDate(TimestampNanos)
)
````

在上面的示例中,我们创建了一个名为 `TimestampDate` 的别名,它将纳秒时间戳转换为 `Date` 类型。
这些数据不像第一列那样存储在磁盘上,而是在查询时计算。
表定义的别名不会通过 `SELECT *` 返回,但可以在服务器设置中配置此行为。

有关更多信息,请阅读 [ALIAS](/sql-reference/statements/create/table#alias) 列类型的文档。

#### 列别名表 {#column-alias-tables}

默认情况下,Grafana 将根据 `DESC table` 的响应提供列建议。
在某些情况下,您可能希望完全覆盖 Grafana 看到的列。
这有助于在选择列时对 Grafana 隐藏您的模式,根据表的复杂性,这可以改善用户体验。

与表定义的别名相比,这种方法的优势在于您可以轻松更新它们,而无需修改表。在某些模式中,别名可能有数千个条目,这可能会使底层表定义变得混乱。它还允许隐藏您希望用户忽略的列。

Grafana 要求别名表具有以下列结构:

```sql
CREATE TABLE aliases (
  `alias` String,  -- 别名的名称,在 Grafana 列选择器中显示
  `select` String, -- 在 SQL 生成器中使用的 SELECT 语法
  `type` String    -- 结果列的类型,以便插件可以修改 UI 选项以匹配数据类型。
)
```

以下是我们如何使用别名表复制 `ALIAS` 列的行为:

```sql
CREATE TABLE example_table (
  TimestampNanos DateTime(9)
);

CREATE TABLE example_table_aliases (`alias` String, `select` String, `type` String);

INSERT INTO example_table_aliases (`alias`, `select`, `type`) VALUES
('TimestampNanos', 'TimestampNanos', 'DateTime(9)'), -- 保留表中的原始列(可选)
('TimestampDate', 'toDate(TimestampNanos)', 'Date'); -- 添加将 TimestampNanos 转换为 Date 的新列
```

然后我们可以配置此表以在 Grafana 中使用。请注意,名称可以是任何内容,甚至可以在单独的数据库中定义:

<Image
  size='md'
  img={alias_table_config_example}
  alt='别名表配置示例'
  border
/>

现在 Grafana 将看到别名表的结果,而不是 `DESC example_table` 的结果:

<Image
  size='md'
  img={alias_table_select_example}
  alt='别名表选择示例'
  border
/>

两种类型的别名都可用于执行复杂的类型转换或 JSON 字段提取。


## 所有 YAML 选项 {#all-yaml-options}

以下是该插件提供的所有 YAML 配置选项。
部分字段显示示例值,其他字段仅显示字段类型。

有关使用 YAML 配置数据源的更多信息,请参阅 [Grafana 文档](https://grafana.com/docs/grafana/latest/administration/provisioning/#data-sources)。

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
      tlsCACert: <string>
      tlsClientCert: <string>
      tlsClientKey: <string>
      secureHttpHeaders.X-Example-Secure-Header: secure header value
```
