---
slug: /use-cases/observability/clickstack/config
title: '配置选项'
pagination_prev: null
pagination_next: null
description: 'ClickStack 配置选项——ClickHouse 可观测性栈'
keywords: ['ClickStack 配置', '可观测性配置', 'HyperDX 配置', '采集器配置', '环境变量']
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import hyperdx_25 from '@site/static/images/use-cases/observability/hyperdx-25.png';
import hyperdx_26 from '@site/static/images/use-cases/observability/hyperdx-26.png';
import highlighted_attributes_config from '@site/static/images/use-cases/observability/hyperdx-highlighted-attributes-config.png';
import highlighted_attributes from '@site/static/images/use-cases/observability/hyperdx-highlighted-attributes.png';
import highlighted_attributes_search from '@site/static/images/use-cases/observability/hyperdx-highlighted-attributes-search.png';

以下配置选项适用于 ClickStack 的各个组件：


## 开源发行版的配置 \{#modifying-settings\}

### Docker \{#docker\}

如果使用 [All in One](/use-cases/observability/clickstack/deployment/all-in-one)、[HyperDX Only](/use-cases/observability/clickstack/deployment/hyperdx-only) 或 [Local Mode](/use-cases/observability/clickstack/deployment/local-mode-only)，只需通过环境变量传递所需的配置，例如：

```shell
docker run  -e HYPERDX_LOG_LEVEL='debug' -p 8080:8080 -p 4317:4317 -p 4318:4318 clickhouse/clickstack-all-in-one:latest
```


### Docker Compose \{#docker-compose\}

如果使用 [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose) 部署指南，可以通过 [`.env`](https://github.com/hyperdxio/hyperdx/blob/main/.env) 文件修改配置。

或者，在 [`docker-compose.yaml`](https://github.com/hyperdxio/hyperdx/blob/main/docker-compose.yml) 文件中显式覆盖这些设置，例如：

示例：

```yaml
services:
  app:
    environment:
      HYPERDX_API_KEY: ${HYPERDX_API_KEY}
      HYPERDX_LOG_LEVEL: ${HYPERDX_LOG_LEVEL}
      # ... other settings
```


### Helm \{#helm\}

#### 自定义参数值（可选） \{#customizing-values\}

可以使用 `--set` 标志来自定义配置，例如：

```shell
helm install my-hyperdx hyperdx/hdx-oss-v2 \
  --set replicaCount=2 \
  --set resources.limits.cpu=500m \
  --set resources.limits.memory=512Mi \
  --set resources.requests.cpu=250m \
  --set resources.requests.memory=256Mi \
  --set ingress.enabled=true \
  --set ingress.annotations."kubernetes\.io/ingress\.class"=nginx \
  --set ingress.hosts[0].host=hyperdx.example.com \
  --set ingress.hosts[0].paths[0].path=/ \
  --set ingress.hosts[0].paths[0].pathType=ImplementationSpecific \
  --set env[0].name=CLICKHOUSE_USER \
  --set env[0].value=abc
```

或者编辑 `values.yaml` 文件。要获取默认值：

```shell
helm show values hyperdx/hdx-oss-v2 > values.yaml
```

示例配置：

```yaml
replicaCount: 2
resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi
ingress:
  enabled: true
  annotations:
    kubernetes.io/ingress.class: nginx
  hosts:
    - host: hyperdx.example.com
      paths:
        - path: /
          pathType: ImplementationSpecific
  env:
    - name: CLICKHOUSE_USER
      value: abc
```


## ClickStack UI（HyperDX）应用 \{#hyperdx\}

### 数据源设置 \{#datasource-settings\}

ClickStack UI 依赖用户为每一种可观测性数据类型/支柱定义一个数据源（source）：

- `Logs`
- `Traces`
- `Metrics`
- `Sessions`

可以在应用内通过 `Team Settings -> Sources` 完成此配置，下图展示了针对日志的配置方式：

<Image img={hyperdx_25} alt="HyperDX Source configuration" size="lg"/>

每一个数据源在创建时至少需要指定一张表，以及一组列，以便 HyperDX 能够对数据进行查询。

如果使用 ClickStack 随附的[默认 OpenTelemetry (OTel) schema](/observability/integrating-opentelemetry#out-of-the-box-schema)，则这些列可以针对每个数据源自动推断。如果[修改 schema](#clickhouse)或使用自定义 schema，则需要用户自行指定并更新这些映射。

:::note
ClickStack 随 ClickHouse 分发的默认 schema 是由 [ClickHouse exporter for the OTel collector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter) 创建的 schema。这些列名与 OTel 官方规范中记录的字段[相对应](https://opentelemetry.io/docs/specs/otel/logs/data-model/)。
:::

每个数据源都可以配置以下设置：

#### 日志 \{#logs\}

| Setting                        | Description                                                                                                             | Required | Inferred in Default Schema | Inferred Value                                      |
|-------------------------------|-------------------------------------------------------------------------------------------------------------------------|----------|-----------------------------|-----------------------------------------------------|
| `Name`                        | 数据源名称。                                                                                                            | Yes      | No                          | –                                                   |
| `Server Connection`           | 服务器连接名称。                                                                                                        | Yes      | No                          | `Default`                                           |
| `Database`                    | ClickHouse 数据库名称。                                                                                                 | Yes      | Yes                         | `default`                                           |
| `Table`                       | 目标表名。如果使用默认 schema，请设置为 `otel_logs`。                                                                   | Yes      | No                          |                                                     |
| `Timestamp Column`            | 作为主键一部分的日期时间列或表达式。                                                                                    | Yes      | Yes                         | `TimestampTime`                                     |
| `Default Select`              | 默认搜索结果中显示的列。                                                                                                | Yes      | Yes                         | `Timestamp`, `ServiceName`, `SeverityText`, `Body` |
| `Service Name Expression`     | 用于服务名称的表达式或列。                                                                                              | Yes      | Yes                         | `ServiceName`                                       |
| `Log Level Expression`        | 用于日志级别的表达式或列。                                                                                              | Yes      | Yes                         | `SeverityText`                                      |
| `Body Expression`             | 用于日志消息的表达式或列。                                                                                              | Yes      | Yes                         | `Body`                                              |
| `Log Attributes Expression`   | 用于自定义日志属性的表达式或列。                                                                                        | Yes      | Yes                         | `LogAttributes`                                     |
| `Resource Attributes Expression` | 用于资源级属性的表达式或列。                                                                                         | Yes      | Yes                         | `ResourceAttributes`                                |
| `Displayed Timestamp Column`  | 在 UI 中用于展示的时间戳列。                                                                                            | Yes      | Yes                         | `ResourceAttributes`                                |
| `Correlated Metric Source`    | 关联的指标源（例如 HyperDX 指标）。                                                                                     | No       | No                          | –                                                   |
| `Correlated Trace Source`     | 关联的跟踪源（例如 HyperDX traces）。                                                                                   | No       | No                          | –                                                   |
| `Trace Id Expression`         | 用于提取跟踪 ID 的表达式或列。                                                                                          | Yes      | Yes                         | `TraceId`                                           |
| `Span Id Expression`          | 用于提取 Span ID 的表达式或列。                                                                                         | Yes      | Yes                         | `SpanId`                                            |
| `Implicit Column Expression`  | 当未指定字段时用于全文搜索的列（类似 Lucene 风格）。通常为日志正文。                                                   | Yes      | Yes                         | `Body`                                              |
| `Highlighted Attributes`      | 打开日志详情时显示的表达式或列。返回 URL 的表达式将显示为链接。                                                         | No       | No                          | –                                                   |
| `Highlighted Trace Attributes` | 从每条跟踪中的日志提取并显示在跟踪瀑布图上方的表达式或列。返回 URL 的表达式将显示为链接。                              | No       | No                          | –                                                   |

#### Traces \{#traces\}

| Setting                          | Description                                                                                                             | Required | Inferred in Default Schema | Inferred Value         |
|----------------------------------|-------------------------------------------------------------------------------------------------------------------------|----------|-----------------------------|------------------------|
| `Name`                           | 数据源名称。                                                                                                            | Yes      | No                          | –                      |
| `Server Connection`              | 服务器连接名称。                                                                                                | Yes      | No                          | `Default`              |
| `Database`                       | ClickHouse 数据库名称。                                                                                              | Yes      | Yes                         | `default`                |
| `Table`                          | 目标表名。如果使用默认 schema，请设置为 `otel_traces`。                                                                                                    | Yes      | Yes                         |      -       |
| `Timestamp Column`              | 作为主键一部分的 DateTime 列或表达式。                                                        | Yes      | Yes                         | `Timestamp`              |
| `Timestamp`                      | `Timestamp Column` 的别名。                                                                                          | Yes      | Yes                         | `Timestamp`              |
| `Default Select`                | 默认搜索结果中显示的列。                                                                               | Yes      | Yes                         | `Timestamp, ServiceName as service, StatusCode as level, round(Duration / 1e6) as duration, SpanName` |
| `Duration Expression`           | 用于计算 span 持续时间的表达式。                                                                              | Yes      | Yes                         | `Duration`               |
| `Duration Precision`            | 持续时间表达式的精度（例如纳秒、微秒）。                                                | Yes      | Yes                         | ns                     |
| `Trace Id Expression`           | trace ID 的表达式或列。                                                                                    | Yes      | Yes                         | `TraceId`                |
| `Span Id Expression`            | span ID 的表达式或列。                                                                                     | Yes      | Yes                         | `SpanId`                 |
| `Parent Span Id Expression`     | 父 span ID 的表达式或列。                                                                              | Yes      | Yes                         | `ParentSpanId`           |
| `Span Name Expression`          | span 名称的表达式或列。                                                                                   | Yes      | Yes                         | `SpanName`               |
| `Span Kind Expression`          | span 类型（例如 client、server）的表达式或列。                                                              | Yes      | Yes                         | `SpanKind`               |
| `Correlated Log Source`         | 可选。关联的日志数据源（例如 HyperDX 日志）。                                                                       | No       | No                          | –                      |
| `Correlated Session Source`     | 可选。关联的会话数据源。                                                                                       | No       | No                          | –                      |
| `Correlated Metric Source`      | 可选。关联的指标数据源（例如 HyperDX 指标）。                                                                  | No       | No                          | –                      |
| `Status Code Expression`        | span 状态码的表达式。                                                                                   | Yes      | Yes                         | `StatusCode`             |
| `Status Message Expression`     | span 状态信息的表达式。                                                                                | Yes      | Yes                         | `StatusMessage`          |
| `Service Name Expression`       | 服务名称的表达式或列。                                                                             | Yes      | Yes                         | `ServiceName`            |
| `Resource Attributes Expression`| 资源级别属性的表达式或列。                                                                    | Yes      | Yes                         | `ResourceAttributes`     |
| `Event Attributes Expression`   | 事件属性的表达式或列。                                                                             | Yes      | Yes                         | `SpanAttributes`         |
| `Span Events Expression`        | 用于提取 span 事件的表达式。通常是 `Nested` 类型列。这允许使用受支持语言的 SDK 渲染异常堆栈追踪。                                                   | Yes      | Yes                         | `Events`                 |
| `Implicit Column Expression`   | 在未指定字段时用于全文搜索（类似 Lucene 风格）的列。通常为日志正文。  | Yes  | Yes  | `SpanName`|
| `Highlighted Attributes`        | 在打开 span 详情时显示的表达式或列。返回 URL 的表达式将显示为链接。         | No       | No                          |  –                       |
| `Highlighted Trace Attributes` | 从 trace 中每个 span 提取并显示在 trace 瀑布图上方的表达式或列。返回 URL 的表达式将显示为链接。 | No  | No   |  –                       |

#### 指标 \{#metrics\}

| Setting               | Description                                                                                   | Required | Inferred in Default Schema | Inferred Value              |
|------------------------|-----------------------------------------------------------------------------------------------|----------|-----------------------------|-----------------------------|
| `Name`                 | 数据源名称。                                                                                  | Yes      | No                          | –                           |
| `Server Connection`    | 服务器连接名称。                                                                              | Yes      | No                          | `Default`                   |
| `Database`             | ClickHouse 数据库名称。                                                                       | Yes      | Yes                         | `default`                   |
| `Gauge Table`          | 存储 gauge 类型指标的表。                                                                     | Yes      | No                          | `otel_metrics_gauge`        |
| `Histogram Table`      | 存储 histogram 类型指标的表。                                                                 | Yes      | No                          | `otel_metrics_histogram`    |
| `Sum Table`            | 存储 sum（计数器）类型指标的表。                                                              | Yes      | No                          | `otel_metrics_sum`          |
| `Correlated Log Source`| 可选。关联的日志源（例如 HyperDX 日志）。                                                    | No       | No                          | –                           |

#### 会话 \{#settings\}

| 设置                        | 描述                                                                                         | 必需 | 在默认 schema 中推断 | 推断值         |
|-------------------------------|-----------------------------------------------------------------------------------------------------|----------|-----------------------------|------------------------|
| `Name`                        | 数据源名称。                                                                                        | 是      | 否                          | –                      |
| `Server Connection`           | 服务器连接名称。                                                                             | 是      | 否                          | `Default`              |
| `Database`                    | ClickHouse 数据库名称。                                                                           | 是      | 是                         | `default`              |
| `Table`                       | 会话数据的目标表。目标表名称。如果使用默认 schema，则设置为 `hyperdx_sessions`。                                                                          | 是      | 是                         | –      |
| `Timestamp Column`           | 作为主键一部分的日期时间列或表达式。                                    | 是      | 是                         | `TimestampTime`            |
| `Log Attributes Expression`   | 用于从会话数据中提取日志级属性的表达式。                                  | 是      | 是                         | `LogAttributes`        |
| `LogAttributes`               | 用于存储日志属性的别名或字段引用。                                              | 是      | 是                         | `LogAttributes`        |
| `Resource Attributes Expression` | 用于提取资源级元数据的表达式。                                               | 是      | 是                         | `ResourceAttributes`   |
| `Correlated Trace Source`     | 可选。用于会话关联的 trace 源。                                              | 否       | 否                          | –                      |
| `Implicit Column Expression`  | 在未指定字段时用于全文搜索的列（例如 Lucene 风格的查询解析）。      | 是      | 是                         | `Body` |

#### 高亮属性 \{#highlighted-attributes\}

可以为 Log 和 Trace 数据源配置 Highlighted Attributes 和 Highlighted Trace Attributes。

- Highlighted Attributes 是在查看日志或 span 详情时，为每条日志或每个 span 显示的列或表达式。
- Highlighted Trace Attributes 是从某个 trace 中的每条日志或每个 span 查询得到的列或表达式，并显示在该 trace 的瀑布图上方。

这些属性在数据源配置中定义，可以是任意 SQL 表达式。如果 SQL 表达式返回的值是 URL 格式，则该属性会显示为一个链接。空值不会显示。

例如，下面这个 trace 数据源已配置了一个 Highlighted Attribute 和一个 Highlighted Trace Attribute：

<Image img={highlighted_attributes_config} alt="Highlighted Attributes 配置" size="md"/>

在点击某条日志或某个 span 之后，这些属性会显示在侧边面板中：

<Image img={highlighted_attributes} alt="Highlighted Attributes" size="md"/>

点击某个属性可获得将该属性作为搜索值使用的选项。如果在属性配置中提供了可选的 Lucene 表达式，则搜索时会使用该 Lucene 表达式，而不是 SQL 表达式。

<Image img={highlighted_attributes_search} alt="Highlighted Attributes 搜索" size="md"/>

### 关联来源 \{#correlated-sources\}

要在 ClickStack 中启用完整的跨来源关联，必须为 logs、traces、metrics 和 sessions 配置关联来源。这样 HyperDX 就能够将相关数据关联起来，并在渲染事件时提供丰富的上下文信息。

- `Logs`：可以与 traces 和 metrics 进行关联。
- `Traces`：可以与 logs、sessions 和 metrics 进行关联。
- `Metrics`：可以与 logs 进行关联。
- `Sessions`：可以与 traces 进行关联。

配置这些关联可以启用多种功能。例如，HyperDX 可以在 trace 旁边展示相关的 logs，或显示与某个 session 关联的指标异常。

例如，下面是为 Logs 源配置关联来源的示例：

<Image img={hyperdx_26} alt="HyperDX Source correlated" size="md"/>

### 应用程序配置设置 \{#application-configuration-settings\}

:::note ClickHouse Cloud 中的 HyperDX
当 HyperDX 由 ClickHouse Cloud 托管管理时，无法修改这些设置。
:::

* `HYPERDX_API_KEY`
  * **默认值：** 无（必填）
  * **描述：** 用于 HyperDX API 的认证密钥。
  * **指导：**
  * 遥测和日志采集必需
  * 在本地开发环境中可以设置为任意非空值
  * 在生产环境中应使用安全且唯一的密钥
  * 创建账号后可在团队设置页面获取

* `HYPERDX_LOG_LEVEL`
  * **默认值：** `info`
  * **说明：** 设置日志输出详细程度级别。
  * **选项：** `debug`, `info`, `warn`, `error`
  * **指导：**
  * 在进行详细排障时使用 `debug`
  * 在正常运行时使用 `info`
  * 在生产环境中使用 `warn` 或 `error` 以减少日志量

* `HYPERDX_API_PORT`
  * **默认值：** `8000`
  * **说明：** HyperDX API 服务器使用的端口。
  * **指导：**
  * 确保该端口在主机上可用（未被占用）
  * 如有端口冲突，请修改该端口
  * 必须与 API 客户端配置中的端口保持一致

* `HYPERDX_APP_PORT`
  * **默认值：** `8000`
  * **说明：** HyperDX 前端应用使用的端口。
  * **指导：**
  * 确保此端口在主机上可用
  * 如有端口冲突，请修改此值
  * 必须能从浏览器访问该端口

* `HYPERDX_APP_URL`
  * **默认值：** `http://localhost`
  * **描述：** 前端应用的基础 URL。
  * **指导：**
  * 在生产环境中设置为您的域名
  * 必须包含协议（http 或 https）
  * 不要在末尾加斜杠（/）

* `MONGO_URI`
  * **默认值：** `mongodb://db:27017/hyperdx`
  * **说明：** MongoDB 连接字符串。
  * **使用建议：**
  * 使用 Docker 进行本地开发时可使用默认值
  * 在生产环境中请使用安全的连接字符串
  * 如需身份验证，请在连接字符串中包含认证信息
  * 示例：`mongodb://user:pass@host:port/db`

* `MINER_API_URL`
  * **默认值：** `http://miner:5123`
  * **说明：** 日志模式挖掘服务的 URL。
  * **指导：**
  * 使用 Docker 进行本地开发时可使用默认值
  * 在生产环境中设置为您的 miner 服务 URL
  * 必须可被 API 服务访问

* `FRONTEND_URL`
  * **默认值：** `http://localhost:3000`
  * **描述：** 前端应用的 URL。
  * **指南：**
  * 本地开发时使用默认值
  * 生产环境中将其设置为你的域名
  * 必须可从 API 服务访问

* `OTEL_SERVICE_NAME`
  * **默认值：** `hdx-oss-api`
  * **说明：** 用于 OpenTelemetry 插桩的服务名称。
  * **指南：**
  * 为你的 HyperDX 服务使用具有描述性的名称。仅在 HyperDX 启用自插桩时适用。
  * 有助于在遥测数据中识别该 HyperDX 服务。

* `NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT`
  * **默认值：** `http://localhost:4318`
  * **描述：** OpenTelemetry collector 端点。
  * **指导：**
  * 仅在对 HyperDX 本身进行自我埋点时相关。
  * 本地开发时使用默认值。
  * 在生产环境中设置为你的 collector URL。
  * 必须能从你的 HyperDX 服务访问到该地址。

* `USAGE_STATS_ENABLED`
  * **默认值：** `true`
  * **描述：** 控制是否收集使用统计信息。
  * **指南：**
  * 将其设置为 `false` 可禁用使用统计跟踪
  * 适用于对隐私要求较高的部署
  * 默认值为 `true`，有助于更好地改进产品

* `IS_OSS`
  * **默认值：** `true`
  * **说明：** 表示是否以 OSS 模式运行。
  * **指南：**
  * 对于开源部署，请保持为 `true`
  * 对于企业部署，请设置为 `false`
  * 会影响可用功能

* `IS_LOCAL_MODE`
  * **默认值：** `false`
  * **描述：** 指示是否在本地模式下运行。
  * **指导：**
  * 本地开发时设置为 `true`
  * 禁用某些生产环境功能
  * 适用于测试和开发环境

* `EXPRESS_SESSION_SECRET`
  * **默认值：** `hyperdx is cool 👋`
  * **说明：** 用于 Express 会话管理的密钥。
  * **指南：**
  * 在生产环境中务必更改此值
  * 使用强且随机的字符串
  * 保持此密钥的机密性和安全性

* `ENABLE_SWAGGER`
  * **默认值：** `false`
  * **说明：** 用于开启或关闭 Swagger API 文档。
  * **指导：**
  * 将其设置为 `true` 以启用 API 文档
  * 对开发和测试非常有用
  * 在生产环境中应禁用

* `BETA_CH_OTEL_JSON_SCHEMA_ENABLED`
  * **默认值：** `false`
  * **描述：** 在 HyperDX 中启用对 JSON 类型的测试版支持。另请参阅 [`OTEL_AGENT_FEATURE_GATE_ARG`](#otel-collector) 以在 OTel collector 中启用 JSON 支持。
  * **指导：**
  * 将其设置为 `true` 以在 ClickStack 中启用 JSON 支持。

## OpenTelemetry collector \{#otel-collector\}

参见 ["ClickStack OpenTelemetry Collector"](/use-cases/observability/clickstack/ingesting-data/otel-collector) 了解更多详情。

- `CLICKHOUSE_ENDPOINT`
  - **默认值：** *无（必填）*（若为独立镜像）。如果是 All-in-one 或 Docker Compose 发行版，则会设置为集成的 ClickHouse 实例。
  - **说明：** 用于导出遥测数据的 ClickHouse 实例的 HTTPS URL。
  - **指南：**
    - 必须是包含端口的完整 HTTPS 端点（例如 `https://clickhouse.example.com:8443`）
    - 采集器向 ClickHouse 发送数据时必需

- `CLICKHOUSE_USER`
  - **默认值：** `default`
  - **说明：** 用于与 ClickHouse 实例进行身份验证的用户名。
  - **指南：**
    - 确保该用户具有 `INSERT` 和 `CREATE TABLE` 权限
    - 推荐为摄取创建专用用户

- `CLICKHOUSE_PASSWORD`
  - **默认值：** *无（启用认证时必填）*
  - **说明：** 指定 ClickHouse 用户的密码。
  - **指南：**
    - 如果该用户账户设置了密码，则必需
    - 在生产环境部署中通过 secret 安全存储

- `HYPERDX_LOG_LEVEL`
  - **默认值：** `info`
  - **说明：** 采集器的日志详细程度级别。
  - **指南：**
    - 接受 `debug`、`info`、`warn`、`error` 等值
    - 排查问题时使用 `debug`

- `OPAMP_SERVER_URL`
  - **默认值：** *无（必填）*（若为独立镜像）。如果是 All-in-one 或 Docker Compose 发行版，则指向已部署的 HyperDX 实例。
  - **说明：** 用于管理采集器的 OpAMP 服务器 URL（例如 HyperDX 实例）。默认端口为 `4320`。
  - **指南：**
    - 必须指向你的 HyperDX 实例
    - 启用动态配置和安全摄取
    - 如果省略，则除非指定了 `OTLP_AUTH_TOKEN` 值，否则安全摄取将被禁用。

- `OTLP_AUTH_TOKEN`
  - **默认值：** *无*。仅用于独立镜像。
  - **说明：** 允许指定 OTLP 认证 token。若设置，则所有通信都需要该 bearer token。
  - **指南：**
    - 建议在生产环境中使用独立采集器镜像时启用。

- `HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE`
  - **默认值：** `default`
  - **说明：** 采集器写入遥测数据的 ClickHouse 数据库。
  - **指南：**
    - 若使用自定义数据库名，则需设置
    - 确保指定用户对该数据库具有访问权限

- `OTEL_AGENT_FEATURE_GATE_ARG`
  - **默认值：** `<empty string>`
  - **说明：** 用于在采集器中启用 feature flag。如果设置为 `--feature-gates=clickhouse.json`，则在采集器中启用对 JSON 类型的 Beta 支持，确保 schema 使用该类型创建。另见 [`BETA_CH_OTEL_JSON_SCHEMA_ENABLED`](#hyperdx) 以在 HyperDX 中启用 JSON 支持。
  - **指南：**
  - 将其设置为 `true` 以在 ClickStack 中启用 JSON 支持。

## ClickHouse \{#clickhouse\}

ClickStack 开源版本自带一套面向多 TB 级数据规模设计的默认 ClickHouse 配置，但用户可以自由修改和优化以适配自身负载。

要高效调优 ClickHouse，你需要理解关键的存储概念，例如 [parts](/parts)、[partitions](/partitions)、[shards and replicas](/shards)，以及在插入时 [merges](/merges) 如何执行。我们建议先回顾 [primary indices](/primary-indexes)、[sparse secondary indices](/optimize/skipping-indexes) 和数据跳过索引等基础知识，以及用于[管理数据生命周期](/observability/managing-data) 的各种技术，例如使用生存时间 (TTL) 生命周期。

ClickStack 支持[模式自定义](/use-cases/observability/schema-design)——你可以修改列类型、抽取新字段（例如从日志中抽取）、应用编解码器和字典，并通过使用投影来加速查询。

此外，materialized view 可用于在[摄取过程中转换或过滤数据](/use-cases/observability/schema-design#materialized-columns)，前提是数据写入该 view 的源表，且应用从目标表读取数据。materialized view 也可用于在 ClickStack 中[原生加速查询](/use-cases/observability/clickstack/materialized_views)。

更多详情请参考 ClickHouse 关于模式设计、索引策略和数据管理最佳实践的文档——其中大部分内容可以直接应用于 ClickStack 部署。