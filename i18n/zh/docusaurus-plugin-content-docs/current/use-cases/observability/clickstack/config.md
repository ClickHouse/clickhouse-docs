---
slug: /use-cases/observability/clickstack/config
title: '配置选项'
pagination_prev: null
pagination_next: null
description: 'ClickStack 配置选项——ClickHouse 可观测性栈'
keywords: ['ClickStack 配置', '可观测性配置', 'HyperDX 设置', '采集器配置', '环境变量']
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import hyperdx_25 from '@site/static/images/use-cases/observability/hyperdx-25.png';
import hyperdx_26 from '@site/static/images/use-cases/observability/hyperdx-26.png';

ClickStack 的每个组件都提供如下配置选项：

## 修改设置 {#modifying-settings}

### Docker {#docker}

如果使用 [All in One](/use-cases/observability/clickstack/deployment/all-in-one)、[HyperDX Only](/use-cases/observability/clickstack/deployment/hyperdx-only) 或 [Local Mode](/use-cases/observability/clickstack/deployment/local-mode-only)，只需通过环境变量传递所需设置，例如：

```shell
docker run  -e HYPERDX_LOG_LEVEL='debug' -p 8080:8080 -p 4317:4317 -p 4318:4318 clickhouse/clickstack-all-in-one:latest
```


### Docker Compose {#docker-compose}

如果使用 [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose) 部署指南，可以通过修改 [`.env`](https://github.com/hyperdxio/hyperdx/blob/main/.env) 文件来调整配置。

或者，也可以直接在 [`docker-compose.yaml`](https://github.com/hyperdxio/hyperdx/blob/main/docker-compose.yml) 文件中显式覆盖这些配置，例如：

示例：

```yaml
services:
  app:
    environment:
      HYPERDX_API_KEY: ${HYPERDX_API_KEY}
      HYPERDX_LOG_LEVEL: ${HYPERDX_LOG_LEVEL}
      # ... other settings
```

### Helm {#helm}

#### 自定义配置（可选） {#customizing-values}

可以通过使用 `--set` 标志来自定义配置，例如：

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

或者编辑 `values.yaml` 文件。要获取默认配置值：

```shell
helm show values hyperdx/hdx-oss-v2 > values.yaml
```

配置示例：

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

## HyperDX {#hyperdx}

### 数据源设置 {#datasource-settings}

HyperDX 依赖用户为每一种可观测性数据类型/支柱定义一个数据源：

- `Logs`
- `Traces`
- `Metrics`
- `Sessions`

可以在应用内通过 `Team Settings -> Sources` 完成此配置，下面以日志的数据源配置为例：

<Image img={hyperdx_25} alt="HyperDX Source 配置" size="lg"/>

每个数据源在创建时都需要至少指定一个表，以及一组允许 HyperDX 查询数据的列。

如果使用 ClickStack 随附的[默认 OpenTelemetry (OTel) schema](/observability/integrating-opentelemetry#out-of-the-box-schema)，这些列可以为每个数据源自动推断出来。如果[修改了 schema](#clickhouse)或使用自定义 schema，则需要用户手动指定并更新这些映射。

:::note
ClickStack 随附的 ClickHouse 默认 schema 是由 [ClickHouse exporter for the OTel collector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter) 创建的 schema。这些列名与 OTel 官方规范中记录的字段名称相对应，详见[此处](https://opentelemetry.io/docs/specs/otel/logs/data-model/)。
:::

每个数据源均提供以下设置：

#### 日志 {#logs}

| Setting                        | Description                                                                                                             | Required | Inferred in Default Schema | Inferred Value                                      |
|-------------------------------|-------------------------------------------------------------------------------------------------------------------------|----------|-----------------------------|-----------------------------------------------------|
| `Name`                        | 数据源名称。                                                                                                            | 是       | 否                          | –                                                   |
| `Server Connection`           | 服务器连接名称。                                                                                                        | 是       | 否                          | `Default`                                             |
| `Database`                    | ClickHouse 数据库名称。                                                                                                 | 是       | 是                         | `default`                                             |
| `Table`                       | 目标表名。如果使用默认 schema，则设置为 `otel_logs`。                                                                   | 是       | 否                         |                                            |
| `Timestamp Column`            | 作为主键一部分的日期时间列或表达式。                                                                                    | 是       | 是                         | `TimestampTime`                                       |
| `Default Select`              | 默认搜索结果中显示的列。                                                                                                | 是       | 是                         | `Timestamp`, `ServiceName`, `SeverityText`, `Body`         |
| `Service Name Expression`     | 服务名称对应的表达式或列。                                                                                              | 是       | 是                         | `ServiceName`                                         |
| `Log Level Expression`        | 日志级别对应的表达式或列。                                                                                              | 是       | 是                         | `SeverityText`                                        |
| `Body Expression`             | 日志消息对应的表达式或列。                                                                                              | 是       | 是                         | `Body`                                                |
| `Log Attributes Expression`   | 自定义日志属性对应的表达式或列。                                                                                        | 是       | 是                         | `LogAttributes`                                       |
| `Resource Attributes Expression` | 资源级属性对应的表达式或列。                                                                                         | 是       | 是                         | `ResourceAttributes`                                  |
| `Displayed Timestamp Column`  | 在 UI 中用于展示的时间戳列。                                                                                            | 是       | 是                         | `ResourceAttributes`                                  |
| `Correlated Metric Source`    | 关联的指标数据源（例如 HyperDX 指标）。                                                                                 | 否       | 否                          | –                                                   |
| `Correlated Trace Source`     | 关联的跟踪数据源（例如 HyperDX traces）。                                                                               | 否       | 否                          | –                                                   |
| `Trace Id Expression`         | 用于提取 Trace ID 的表达式或列。                                                                                        | 是       | 是                         | `TraceId`                                             |
| `Span Id Expression`          | 用于提取 Span ID 的表达式或列。                                                                                         | 是       | 是                         | `SpanId`                                              |
| `Implicit Column Expression`  | 当未指定字段时，用于全文搜索的列（类似 Lucene 的风格）。通常为日志正文。                                               | 是       | 是                         | `Body`                                                |

#### Traces {#traces}

| Setting                          | Description                                                                                                             | Required | Inferred in Default Schema | Inferred Value         |
|----------------------------------|-------------------------------------------------------------------------------------------------------------------------|----------|-----------------------------|------------------------|
| `Name`                           | 数据源名称。                                                                                                            | Yes      | No                          | –                      |
| `Server Connection`              | 服务器连接名称。                                                                                                | Yes      | No                          | `Default`              |
| `Database`                       | ClickHouse 数据库名称。                                                                                              | Yes      | Yes                         | `default`                |
| `Table`                          | 目标表名。如果使用默认模式，请设置为 `otel_traces`。                                                                                                    | Yes      | Yes                         |      -       |
| `Timestamp Column`              | 作为主键一部分的日期时间列或表达式。                                                        | Yes      | Yes                         | `Timestamp`              |
| `Timestamp`                      | `Timestamp Column` 的别名。                                                                                          | Yes      | Yes                         | `Timestamp`              |
| `Default Select`                | 默认搜索结果中显示的列。                                                                               | Yes      | Yes                         | `Timestamp, ServiceName as service, StatusCode as level, round(Duration / 1e6) as duration, SpanName` |
| `Duration Expression`           | 计算 span 持续时间的表达式。                                                                              | Yes      | Yes                         | `Duration`               |
| `Duration Precision`            | 持续时间表达式的精度（例如纳秒、微秒）。                                                | Yes      | Yes                         | ns                     |
| `Trace Id Expression`           | Trace ID 的表达式或列。                                                                                    | Yes      | Yes                         | `TraceId`                |
| `Span Id Expression`            | Span ID 的表达式或列。                                                                                     | Yes      | Yes                         | `SpanId`                 |
| `Parent Span Id Expression`     | 父 Span ID 的表达式或列。                                                                              | Yes      | Yes                         | `ParentSpanId`           |
| `Span Name Expression`          | Span 名称的表达式或列。                                                                                   | Yes      | Yes                         | `SpanName`               |
| `Span Kind Expression`          | Span 类型（例如 client、server）的表达式或列。                                                              | Yes      | Yes                         | `SpanKind`               |
| `Correlated Log Source`         | 可选。关联的日志数据源（例如 HyperDX 日志）。                                                                       | No       | No                          | –                      |
| `Correlated Session Source`     | 可选。关联的会话数据源。                                                                                       | No       | No                          | –                      |
| `Correlated Metric Source`      | 可选。关联的指标数据源（例如 HyperDX 指标）。                                                                  | No       | No                          | –                      |
| `Status Code Expression`        | Span 状态码的表达式。                                                                                   | Yes      | Yes                         | `StatusCode`             |
| `Status Message Expression`     | Span 状态消息的表达式。                                                                                | Yes      | Yes                         | `StatusMessage`          |
| `Service Name Expression`       | 服务名称的表达式或列。                                                                             | Yes      | Yes                         | `ServiceName`            |
| `Resource Attributes Expression`| 资源级别属性的表达式或列。                                                                    | Yes      | Yes                         | `ResourceAttributes`     |
| `Event Attributes Expression`   | 事件属性的表达式或列。                                                                             | Yes      | Yes                         | `SpanAttributes`         |
| `Span Events Expression`        | 用于提取 span 事件的表达式。通常是 `Nested` 类型的列。这使得可以使用受支持语言的 SDK 渲染异常堆栈追踪。                                                   | Yes      | Yes                         | `Events`                 |
| `Implicit Column Expression`   | 在未指定字段时用于全文搜索（类似 Lucene 风格）的列。通常为日志正文。  | Yes  | Yes  | `SpanName`|

#### 指标 {#metrics}

| 设置                   | 说明                                                                                         | 是否必需 | 在默认模式中是否可推断       | 推断值                       |
|------------------------|----------------------------------------------------------------------------------------------|----------|------------------------------|------------------------------|
| `Name`                 | 源名称。                                                                                     | 是       | 否                           | –                            |
| `Server Connection`    | 服务器连接名称。                                                                             | 是       | 否                           | `Default`                    |
| `Database`             | ClickHouse 数据库名称。                                                                      | 是       | 是                           | `default`                    |
| `Gauge Table`          | 存储 gauge 类型指标的表。                                                                    | 是       | 否                           | `otel_metrics_gauge`         |
| `Histogram Table`      | 存储 histogram 类型指标的表。                                                                | 是       | 否                           | `otel_metrics_histogram`     |
| `Sum Table`            | 存储 sum 类型（计数器）指标的表。                                                           | 是       | 否                           | `otel_metrics_sum`           |
| `Correlated Log Source`| 可选。关联的日志源（例如 HyperDX 日志）。                                                   | 否       | 否                           | –                            |

#### 会话 {#settings}

| 设置                        | 描述                                                                                         | 必需 | 在默认架构中推断 | 推断值         |
|-------------------------------|-----------------------------------------------------------------------------------------------------|----------|-----------------------------|------------------------|
| `Name`                        | 源名称。                                                                                        | 是      | 否                          | —                      |
| `Server Connection`           | 服务器连接名称。                                                                             | 是      | 否                          | `Default`              |
| `Database`                    | ClickHouse 数据库名称。                                                                           | 是      | 是                         | `default`              |
| `Table`                       | 会话数据的目标表，目标表名称。如果使用默认架构，请设置为 `hyperdx_sessions`。                                                                          | 是      | 是                         | —      |
| `Timestamp Column`           | 作为主键一部分的 DateTime 类型列或表达式。                                    | 是      | 是                         | `TimestampTime`            |
| `Log Attributes Expression`   | 用于从会话数据中提取日志级别属性的表达式。                                  | 是      | 是                         | `LogAttributes`        |
| `LogAttributes`               | 用于存储日志属性的别名或字段引用。                                              | 是      | 是                         | `LogAttributes`        |
| `Resource Attributes Expression` | 用于提取资源级元数据的表达式。                                               | 是      | 是                         | `ResourceAttributes`   |
| `Correlated Trace Source`     | 可选。用于会话关联的 Trace 来源。                                              | 否       | 否                          | —                      |
| `Implicit Column Expression`  | 当未指定字段时用于全文搜索的列或表达式（例如 Lucene 风格的查询解析）。      | 是      | 是                         | `Body` |

### 关联来源 {#correlated-sources}

要在 ClickStack 中启用跨来源的完整关联功能，用户必须为 logs、traces、metrics 和 sessions 配置关联来源。这使 HyperDX 能够将相关数据关联起来，并在展示事件时提供丰富的上下文。

- `Logs`：可以与 traces 和 metrics 关联。
- `Traces`：可以与 logs、sessions 和 metrics 关联。
- `Metrics`：可以与 logs 关联。
- `Sessions`：可以与 traces 关联。

设置这些关联可以启用多项功能。例如，HyperDX 可以在 trace 视图旁显示相关 logs，或展示与某个 session 关联的指标异常。

例如，下面是在 Logs 来源中配置了关联来源的示例：

<Image img={hyperdx_26} alt="已配置关联来源的 HyperDX 来源" size="md"/>

### 应用配置设置 {#application-configuration-settings}

:::note ClickHouse Cloud 中的 HyperDX
在 ClickHouse Cloud 中托管 HyperDX 时，这些设置无法修改。
:::

* `HYPERDX_API_KEY`
  * **默认值：** 无（必填）
  * **描述：** HyperDX API 的认证密钥。
  * **指南：**
  * 进行遥测和日志采集时必填
  * 在本地开发环境中，可以为任意非空值
  * 在生产环境中，请使用安全且唯一的密钥
  * 创建账户后可在团队设置页面获取

* `HYPERDX_LOG_LEVEL`
  * **默认值：** `info`
  * **说明：** 设置日志输出的详细级别。
  * **可选值：** `debug`, `info`, `warn`, `error`
  * **使用指南：**
  * 在需要进行详细排障时使用 `debug`
  * 在正常运行时使用 `info`
  * 在生产环境中使用 `warn` 或 `error` 以减少日志量

* `HYPERDX_API_PORT`
  * **默认值：** `8000`
  * **说明：** HyperDX API 服务器使用的端口。
  * **指南：**
  * 确保此端口在主机上可用
  * 如有端口冲突，请修改此值
  * 必须与 API 客户端配置中的端口保持一致

* `HYPERDX_APP_PORT`
  * **默认值：** `8000`
  * **描述：** HyperDX 前端应用程序使用的端口。
  * **指导：**
  * 确保此端口在主机上处于空闲且可用状态。
  * 如有端口冲突，请修改该端口。
  * 必须可从浏览器访问该端口。

* `HYPERDX_APP_URL`
  * **默认值：** `http://localhost`
  * **说明：** 前端应用的基础 URL。
  * **指导：**
  * 在生产环境中将其设置为你的域名
  * 必须包含协议（http/https）
  * 末尾不要加斜杠

* `MONGO_URI`
  * **默认值：** `mongodb://db:27017/hyperdx`
  * **描述：** MongoDB 连接字符串。
  * **指南：**
  * 在本地使用 Docker 进行开发时使用默认值
  * 在生产环境中，使用安全的连接字符串
  * 如有需要，请包含身份验证信息
  * 示例：`mongodb://user:pass@host:port/db`

* `MINER_API_URL`
  * **默认值：** `http://miner:5123`
  * **描述：** 日志模式挖掘服务的 URL。
  * **指南：**
  * 使用 Docker 进行本地开发时可使用默认值
  * 在生产环境中将其设置为您的 miner 服务 URL
  * 必须能被 API 服务访问

* `FRONTEND_URL`
  * **默认值：** `http://localhost:3000`
  * **说明：** 前端应用的 URL。
  * **使用指引：**
  * 本地开发时使用默认值
  * 生产环境中设置为你的域名
  * 必须可被 API 服务访问

* `OTEL_SERVICE_NAME`
  * **默认值：** `hdx-oss-api`
  * **描述：** 用于 OpenTelemetry 插桩的服务名称。
  * **指导：**
  * 为你的 HyperDX 服务使用具有描述性的服务名称。如果 HyperDX 本身进行了插桩，则适用。
  * 有助于在遥测数据中识别 HyperDX 服务。

* `NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT`
  * **默认值：** `http://localhost:4318`
  * **描述：** OpenTelemetry collector 端点。
  * **指南：**
  * 与 HyperDX 自行埋点相关。
  * 本地开发环境使用默认值
  * 生产环境中设置为你的 collector URL
  * 必须能从你的 HyperDX 服务访问

* `USAGE_STATS_ENABLED`
  * **默认值：** `true`
  * **描述：** 控制是否收集使用统计信息。
  * **指南：**
  * 将其设置为 `false` 可禁用使用情况跟踪
  * 适用于对隐私要求较高的部署
  * 默认值为 `true`，有助于改进产品

* `IS_OSS`
  * **默认值：** `true`
  * **说明：** 表示是否在 OSS 模式下运行。
  * **指南：**
  * 开源部署请保持为 `true`
  * 企业部署请设置为 `false`
  * 会影响可用的功能

* `IS_LOCAL_MODE`
  * **默认值：** `false`
  * **描述：** 指示是否在本地模式下运行。
  * **指南：**
  * 本地开发时设置为 `true`
  * 会禁用部分生产环境功能
  * 适用于测试和开发

* `EXPRESS_SESSION_SECRET`
  * **默认值：** `hyperdx is cool 👋`
  * **说明：** 用于 Express 会话管理的 Secret。
  * **指南：**
  * 在生产环境中务必修改该值
  * 使用强随机字符串
  * 妥善保密并确保安全

* `ENABLE_SWAGGER`
  * **默认值：** `false`
  * **说明：** 控制是否启用 Swagger API 文档。
  * **使用指南：**
  * 设置为 `true` 以启用 API 文档
  * 常用于开发和测试环境
  * 在生产环境中请禁用

* `BETA_CH_OTEL_JSON_SCHEMA_ENABLED`
  * **默认值：** `false`
  * **描述：** 在 HyperDX 中启用对 JSON 类型的 Beta 级支持。另请参阅 [`OTEL_AGENT_FEATURE_GATE_ARG`](#otel-collector) 以在 OTel collector 中启用 JSON 支持。
  * **指导：**
  * 将其设置为 `true` 以在 ClickStack 中启用 JSON 支持。

## OpenTelemetry collector {#otel-collector}

有关更多详细信息，请参阅 ["ClickStack OpenTelemetry Collector"](/use-cases/observability/clickstack/ingesting-data/otel-collector)。

- `CLICKHOUSE_ENDPOINT`
  - **默认值：** *无（必填）*（如果是独立镜像）。对于 All-in-one 或 Docker Compose 发行版，则会设置为集成的 ClickHouse 实例。
  - **描述：** 用于导出遥测数据的 ClickHouse 实例的 HTTPS URL。
  - **指导：**
    - 必须是包含端口的完整 HTTPS 端点（例如 `https://clickhouse.example.com:8443`）
    - 收集器向 ClickHouse 发送数据时必需

- `CLICKHOUSE_USER`
  - **默认值：** `default`
  - **描述：** 用于与 ClickHouse 实例进行身份验证的用户名。
  - **指导：**
    - 确保该用户具有 `INSERT` 和 `CREATE TABLE` 权限
    - 建议为摄取专门创建一个独立用户

- `CLICKHOUSE_PASSWORD`
  - **默认值：** *无（如果启用了身份验证则必填）*
  - **描述：** 指定的 ClickHouse 用户的密码。
  - **指导：**
    - 如果该用户账户设置了密码，则必填
    - 在生产部署中通过 Secret 安全存储

- `HYPERDX_LOG_LEVEL`
  - **默认值：** `info`
  - **描述：** 收集器的日志详细级别。
  - **指导：**
    - 接受的值包括 `debug`、`info`、`warn`、`error`
    - 在排查问题时使用 `debug`

- `OPAMP_SERVER_URL`
  - **默认值：** *无（必填）*（如果是独立镜像）。对于 All-in-one 或 Docker Compose 发行版，该值指向已部署的 HyperDX 实例。
  - **描述：** 用于管理收集器的 OpAMP 服务器 URL（例如 HyperDX 实例）。默认端口为 `4320`。
  - **指导：**
    - 必须指向你的 HyperDX 实例
    - 启用动态配置和安全摄取

- `HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE`
  - **默认值：** `default`
  - **描述：** 收集器写入遥测数据的 ClickHouse 数据库。
  - **指导：**
    - 如果使用自定义数据库名称，则进行设置
    - 确保指定用户具有访问该数据库的权限

- `OTEL_AGENT_FEATURE_GATE_ARG`
  - **默认值：** `<empty string>`
  - **描述：** 用于在收集器中启用功能开关。如果设置为 `--feature-gates=clickhouse.json`，则在收集器中启用对 JSON 类型的 Beta 支持，并确保创建的模式使用该类型。另请参阅 [`BETA_CH_OTEL_JSON_SCHEMA_ENABLED`](#hyperdx) 以在 HyperDX 中启用 JSON 支持。
  - **指导：**
    - 将其设置为 `true` 以在 ClickStack 中启用 JSON 支持。

## ClickHouse {#clickhouse}

ClickStack 随附的默认 ClickHouse 配置面向多 TB 级别规模设计，但用户可以自由修改和优化，使其更适合自身的工作负载。

为了高效调优 ClickHouse，用户应理解关键存储概念，例如 [parts](/parts)、[partitions](/partitions)、[shards and replicas](/shards)，以及在插入时 [merges](/merges) 是如何发生的。我们建议先回顾 [primary indices](/primary-indexes)、[sparse secondary indices](/optimize/skipping-indexes) 和数据跳过索引等基础知识，以及用于[管理数据生命周期](/observability/managing-data) 的技术（例如使用 TTL 进行生命周期管理）。

ClickStack 支持[模式自定义](/use-cases/observability/schema-design) —— 用户可以修改列类型，从日志等来源提取新字段，应用编解码器（codec）和字典，并通过投影（projection）加速查询。

此外，可以使用物化视图在[摄取期间转换或过滤数据](/use-cases/observability/schema-design#materialized-columns)，前提是数据写入视图的源表，并且应用从目标表读取数据。

更多详情请参考 ClickHouse 关于模式设计、索引策略和数据管理最佳实践的文档——其中大部分内容可以直接应用于 ClickStack 部署。