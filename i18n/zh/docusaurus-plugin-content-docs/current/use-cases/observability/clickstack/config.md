---
'slug': '/use-cases/observability/clickstack/config'
'title': '配置选项'
'pagination_prev': null
'pagination_next': null
'description': 'ClickStack 的配置选项 - ClickHouse 可观察性栈'
'doc_type': 'reference'
---

import Image from '@theme/IdealImage';
import hyperdx_25 from '@site/static/images/use-cases/observability/hyperdx-25.png';
import hyperdx_26 from '@site/static/images/use-cases/observability/hyperdx-26.png';

以下是 ClickStack 各组件可用的配置选项：

## 修改设置 {#modifying-settings}

### Docker {#docker}

如果使用 [All in One](/use-cases/observability/clickstack/deployment/all-in-one)、 [HyperDX Only](/use-cases/observability/clickstack/deployment/hyperdx-only) 或 [Local Mode](/use-cases/observability/clickstack/deployment/local-mode-only)，只需通过环境变量传递所需的设置，例如：

```shell
docker run  -e HYPERDX_LOG_LEVEL='debug' -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

### Docker Compose {#docker-compose}

如果使用 [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose) 部署指南，可以使用 [`.env`](https://github.com/hyperdxio/hyperdx/blob/main/.env) 文件修改设置。

或者，可以在 [`docker-compose.yaml`](https://github.com/hyperdxio/hyperdx/blob/main/docker-compose.yml) 文件中显式覆盖设置，例如：

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

#### 自定义值（可选） {#customizing-values}

您可以使用 `--set` 标志自定义设置，例如：

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

或者编辑 `values.yaml`。要检索默认值：

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

## HyperDX {#hyperdx}

### 数据源设置 {#datasource-settings}

HyperDX 依赖用户为每种可观察性数据类型/支柱定义源：

- `Logs`
- `Traces`
- `Metrics`
- `Sessions`

此配置可以在应用程序中通过 `Team Settings -> Sources` 完成，如下所示以获取日志为例：

<Image img={hyperdx_25} alt="HyperDX Source configuration" size="lg"/>

每个源在创建时都需要至少指定一个表，以及一组允许 HyperDX 查询数据的列。

如果使用 [default OpenTelemetry (OTel) schema](/observability/integrating-opentelemetry#out-of-the-box-schema)，ClickStack 分发的这些列可以为每个源自动推导。如果 [modifying the schema](#clickhouse) 或使用自定义架构，用户需要指定和更新这些映射。

:::note
ClickStack 附带的 ClickHouse 默认架构是由 [ClickHouse exporter for the OTel collector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter) 创建的架构。这些列名与 OTel 官方规范文档 [此处](https://opentelemetry.io/docs/specs/otel/logs/data-model/) 中的相关。
:::

以下设置适用于每个源：

#### 日志 {#logs}

| 设置                            | 描述                                                                                                                     | 必需       | 在默认架构中推导    | 推导值                                      |
|----------------------------------|--------------------------------------------------------------------------------------------------------------------------|------------|---------------------|---------------------------------------------|
| `Name`                           | 源名称。                                                                                                                | 是         | 否                  | –                                           |
| `Server Connection`              | 服务器连接名称。                                                                                                | 是         | 否                  | `Default`                                   |
| `Database`                       | ClickHouse 数据库名称。                                                                                              | 是         | 是                  | `default`                                   |
| `Table`                          | 目标表名称。如果使用默认架构，则设置为 `otel_logs`。                                                                                                     | 是         | 否                  |                                             |
| `Timestamp Column`               | 作为主键一部分的时间戳列或表达式。                                                        | 是         | 是                  | `TimestampTime`                             |
| `Default Select`                 | 默认搜索结果中显示的列。                                                                                           | 是         | 是                  | `Timestamp`, `ServiceName`, `SeverityText`, `Body`         |
| `Service Name Expression`        | 服务名称的表达式或列。                                                                                     | 是         | 是                  | `ServiceName`                               |
| `Log Level Expression`           | 日志级别的表达式或列。                                                                                   | 是         | 是                  | `SeverityText`                              |
| `Body Expression`                | 日志消息的表达式或列。                                                                               | 是         | 是                  | `Body`                                      |
| `Log Attributes Expression`      | 自定义日志属性的表达式或列。                                                                       | 是         | 是                  | `LogAttributes`                             |
| `Resource Attributes Expression`  | 资源级别属性的表达式或列。                                                                  | 是         | 是                  | `ResourceAttributes`                        |
| `Displayed Timestamp Column`     | 用于 UI 显示的时间戳列。                                                                            | 是         | 是                  | `ResourceAttributes`                        |
| `Correlated Metric Source`       | 关联的指标源（例如 HyperDX 指标）。                                                                           | 否         | 否                  | –                                           |
| `Correlated Trace Source`        | 关联的跟踪源（例如 HyperDX 跟踪）。                                                                             | 否         | 否                  | –                                           |
| `Trace Id Expression`            | 用于提取跟踪 ID 的表达式或列。                                                                          | 是         | 是                  | `TraceId`                                   |
| `Span Id Expression`             | 用于提取跨度 ID 的表达式或列。                                                                          | 是         | 是                  | `SpanId`                                    |
| `Implicit Column Expression`     | 用于全文搜索的列，如果没有指定字段（Lucene 风格）。通常是日志主体。                      | 是         | 是                  | `Body`                                      |

#### 跟踪 {#traces}

| 设置                              | 描述                                                                                      | 必需       | 在默认架构中推导    | 推导值             |
|-----------------------------------|-------------------------------------------------------------------------------------------|------------|---------------------|--------------------|
| `Name`                            | 源名称。                                                                                 | 是         | 否                  | –                  |
| `Server Connection`               | 服务器连接名称。                                                                       | 是         | 否                  | `Default`          |
| `Database`                        | ClickHouse 数据库名称。                                                                   | 是         | 是                  | `default`          |
| `Table`                           | 目标表名称。如果使用默认架构，则设置为 `otel_traces`。                                                          | 是         | 是                  | -                  |
| `Timestamp Column`                | 作为主键一部分的时间戳列或表达式。                                                        | 是         | 是                  | `Timestamp`        |
| `Timestamp`                       | `Timestamp Column` 的别名。                                                                | 是         | 是                  | `Timestamp`        |
| `Default Select`                  | 默认搜索结果中显示的列。                                                                   | 是         | 是                  | `Timestamp, ServiceName as service, StatusCode as level, round(Duration / 1e6) as duration, SpanName` |
| `Duration Expression`             | 用于计算跨度持续时间的表达式。                                                             | 是         | 是                  | `Duration`         |
| `Duration Precision`              | 持续时间表达式的精度（例如，纳秒、微秒）。                                                  | 是         | 是                  | ns                 |
| `Trace Id Expression`             | 跟踪 ID 的表达式或列。                                                                    | 是         | 是                  | `TraceId`          |
| `Span Id Expression`              | 跨度 ID 的表达式或列。                                                                     | 是         | 是                  | `SpanId`           |
| `Parent Span Id Expression`       | 父跨度 ID 的表达式或列。                                                                   | 是         | 是                  | `ParentSpanId`     |
| `Span Name Expression`            | 跨度名称的表达式或列。                                                                     | 是         | 是                  | `SpanName`         |
| `Span Kind Expression`            | 跨度类型的表达式或列（例如，客户端、服务器）。                                               | 是         | 是                  | `SpanKind`         |
| `Correlated Log Source`           | 可选。关联的日志源（例如，HyperDX 日志）。                                                  | 否         | 否                  | –                  |
| `Correlated Session Source`       | 可选。关联的会话源。                                                                       | 否         | 否                  | –                  |
| `Correlated Metric Source`        | 可选。关联的指标源（例如，HyperDX 指标）。                                                  | 否         | 否                  | –                  |
| `Status Code Expression`          | 跨度状态代码的表达式。                                                                      | 是         | 是                  | `StatusCode`       |
| `Status Message Expression`       | 跨度状态消息的表达式。                                                                      | 是         | 是                  | `StatusMessage`     |
| `Service Name Expression`         | 服务名称的表达式或列。                                                                     | 是         | 是                  | `ServiceName`      |
| `Resource Attributes Expression`  | 资源级别属性的表达式或列。                                                                   | 是         | 是                  | `ResourceAttributes`|
| `Event Attributes Expression`     | 事件属性的表达式或列。                                                                     | 是         | 是                  | `SpanAttributes`    |
| `Span Events Expression`          | 提取跨度事件的表达式。通常是 `Nested` 类型的列。这允许与支持的语言 SDK 渲染异常堆栈跟踪。    | 是         | 是                  | `Events`           |
| `Implicit Column Expression`     | 用于全文搜索的列，如果没有指定字段（Lucene 风格）。通常是日志主体。                      | 是         | 是                  | `SpanName`         |

#### 指标 {#metrics}

| 设置                  | 描述                                                                                      | 必需       | 在默认架构中推导    | 推导值                |
|-----------------------|-------------------------------------------------------------------------------------------|------------|---------------------|-----------------------|
| `Name`                | 源名称。                                                                                 | 是         | 否                  | –                     |
| `Server Connection`   | 服务器连接名称。                                                                          | 是         | 否                  | `Default`             |
| `Database`            | ClickHouse 数据库名称。                                                                    | 是         | 是                  | `default`             |
| `Gauge Table`         | 存储测量类型指标的表。                                                                  | 是         | 否                  | `otel_metrics_gauge`  |
| `Histogram Table`     | 存储直方图类型指标的表。                                                                  | 是         | 否                  | `otel_metrics_histogram` |
| `Sum Table`           | 存储总和类型（计数器）指标的表。                                                        | 是         | 否                  | `otel_metrics_sum`    |
| `Correlated Log Source` | 可选。关联的日志源（例如，HyperDX 日志）。                                               | 否         | 否                  | –                     |

#### 会话 {#settings}

| 设置                               | 描述                                                                                         | 必需       | 在默认架构中推导    | 推导值             |
|------------------------------------|----------------------------------------------------------------------------------------------|------------|---------------------|--------------------|
| `Name`                             | 源名称。                                                                                    | 是         | 否                  | –                  |
| `Server Connection`                | 服务器连接名称。                                                                             | 是         | 否                  | `Default`          |
| `Database`                         | ClickHouse 数据库名称。                                                                       | 是         | 是                  | `default`          |
| `Table`                            | 会话数据的目标表。目标表名称。如果使用默认架构，则设置为 `hyperdx_sessions`。                   | 是         | 是                  | -                  |
| `Timestamp Column`                | 作为主键一部分的时间戳列或表达式。                                                          | 是         | 是                  | `TimestampTime`    |
| `Log Attributes Expression`        | 从会话数据中提取日志级别属性的表达式。                                                    | 是         | 是                  | `LogAttributes`    |
| `LogAttributes`                    | 用于存储日志属性的别名或字段引用。                                                         | 是         | 是                  | `LogAttributes`    |
| `Resource Attributes Expression`   | 用于提取资源级别元数据的表达式。                                                          | 是         | 是                  | `ResourceAttributes`|
| `Correlated Trace Source`          | 可选。用于会话关联的跟踪源。                                                                | 否         | 否                  | –                  |
| `Implicit Column Expression`       | 如果未指定字段（例如，Lucene 样式查询解析），则用于全文搜索的列。                             | 是         | 是                  | `Body`             |

### 关联源 {#correlated-sources}

要在 ClickStack 中启用完全的跨源关联，用户必须为日志、跟踪、指标和会话配置关联源。这使得 HyperDX 能够关联相关数据，并在呈现事件时提供丰富的上下文。

- `Logs`：可以与跟踪和指标关联。
- `Traces`：可以与日志、会话和指标关联。
- `Metrics`：可以与日志关联。
- `Sessions`：可以与跟踪关联。

通过设置这些关联，HyperDX 可以例如在跟踪旁边呈现相关日志或显示与会话相关的指标异常。正确的配置确保统一和上下文丰富的可观察性体验。

例如，以下是配置了关联源的日志源：

<Image img={hyperdx_26} alt="HyperDX Source correlated" size="md"/>

### 应用程序配置设置 {#application-configuration-settings}

:::note HyperDX 在 ClickHouse Cloud 中
当 HyperDX 在 ClickHouse Cloud 中管理时，这些设置无法修改。
:::

- `HYPERDX_API_KEY`
  - **默认值：** 无（必需）
  - **描述：** HyperDX API 的身份验证密钥。
  - **指导：** 
  - 为遥测和日志记录所需 
  - 在本地开发中，可以是任何非空值 
  - 对于生产，使用安全的唯一密钥 
  - 在创建帐户后可以从团队设置页面获取

- `HYPERDX_LOG_LEVEL`
  - **默认值：** `info`
  - **描述：** 设置日志的详细程度级别。
  - **选项：** `debug`, `info`, `warn`, `error`
  - **指导：**
  - 在故障排除时使用 `debug`
  - 正常操作使用 `info`
  - 在生产中使用 `warn` 或 `error` 来减少日志量

- `HYPERDX_API_PORT`
  - **默认值：** `8000`
  - **描述：** HyperDX API 服务器的端口。
  - **指导：**
  - 确保该端口在主机上可用 
  - 如果端口冲突，请更改 
  - 必须与 API 客户端配置中的端口相匹配 

- `HYPERDX_APP_PORT`
  - **默认值：** `8000`
  - **描述：** HyperDX 前端应用程序的端口。
  - **指导：**
  - 确保该端口在主机上可用 
  - 如果端口冲突，请更改 
  - 必须可以从浏览器访问 

- `HYPERDX_APP_URL`
  - **默认值：** `http://localhost`
  - **描述：** 前端应用程序的基本 URL。
  - **指导：**
  - 在生产中设置为您的域 
  - 包含协议（http/https） 
  - 不要包括尾部斜杠 

- `MONGO_URI`
  - **默认值：** `mongodb://db:27017/hyperdx`
  - **描述：** MongoDB 连接字符串。
  - **指导：**
  - 在本地开发时使用 Docker 的默认值 
  - 对于生产，使用安全的连接字符串 
  - 如果需要，包含身份验证 
  - 示例：`mongodb://user:pass@host:port/db`

- `MINER_API_URL`
  - **默认值：** `http://miner:5123`
  - **描述：** 日志模式挖掘服务的 URL。
  - **指导：**
  - 在本地开发时使用 Docker 的默认值 
  - 在生产环境中设置为您的挖掘服务 URL 
  - 必须可以从 API 服务访问 

- `FRONTEND_URL`
  - **默认值：** `http://localhost:3000`
  - **描述：** 前端应用程序的 URL。
  - **指导：**
  - 在本地开发时使用默认值 
  - 在生产中设置为您的域 
  - 必须可以从 API 服务访问 

- `OTEL_SERVICE_NAME`
  - **默认值：** `hdx-oss-api`
  - **描述：** OpenTelemetry 插件的服务名称。
  - **指导：**
  - 使用描述性的名称为您的 HyperDX 服务。如果 HyperDX 自我插桩，则适用。
  - 有助于在遥测数据中识别 HyperDX 服务

- `NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT`
  - **默认值：** `http://localhost:4318`
  - **描述：** OpenTelemetry 收集器端点。
  - **指导：**
  - 与自我插桩的 HyperDX 相关。
  - 在本地开发时使用默认值 
  - 在生产中设置为您的收集器 URL 
  - 必须可以从 HyperDX 服务访问 

- `USAGE_STATS_ENABLED`
  - **默认值：** `true`
  - **描述：** 切换使用统计信息的收集。
  - **指导：**
  - 设置为 `false` 以禁用使用跟踪 
  - 对于隐私敏感的部署很有用 
  - 默认值为 `true` 以改善产品 

- `IS_OSS`
  - **默认值：** `true`
  - **描述：** 表示是否在 OSS 模式下运行。
  - **指导：**
  - 对于开源部署保持为 `true` 
  - 对于企业部署设置为 `false` 
  - 影响功能可用性 

- `IS_LOCAL_MODE`
  - **默认值：** `false`
  - **描述：** 表示是否在本地模式下运行。
  - **指导：**
  - 设置为 `true` 以进行本地开发 
  - 禁用某些生产功能 
  - 对于测试和开发非常有用 

- `EXPRESS_SESSION_SECRET`
  - **默认值：** `hyperdx is cool 👋`
  - **描述：** Express 会话管理的密钥。
  - **指导：**
  - 在生产中更改 
  - 使用强随机字符串 
  - 保持机密和安全 

- `ENABLE_SWAGGER`
  - **默认值：** `false`
  - **描述：** 切换 Swagger API 文档。
  - **指导：**
  - 设置为 `true` 以启用 API 文档 
  - 对于开发和测试很有用 
  - 在生产中禁用 

- `BETA_CH_OTEL_JSON_SCHEMA_ENABLED`
  - **默认值：** `false`
  - **描述：** 启用 HyperDX 中 JSON 类型的 Beta 支持。另请参阅 [`OTEL_AGENT_FEATURE_GATE_ARG`](#otel-collector) 以启用 OTel 收集器中的 JSON 支持。
  - **指导：**
  - 设置为 `true` 以在 ClickStack 中启用 JSON 支持。

## OpenTelemetry 收集器 {#otel-collector}

有关更多详细信息，请参见 ["ClickStack OpenTelemetry Collector"](/use-cases/observability/clickstack/ingesting-data/otel-collector)。

- `CLICKHOUSE_ENDPOINT`  
  - **默认值：** *无（必需）* 如果是独立镜像。如果是 All-in-one 或 Docker Compose 分发，则设置为集成的 ClickHouse 实例。
  - **描述：** 要导出遥测数据的 ClickHouse 实例的 HTTPS URL。  
  - **指导：**  
    - 必须是完整的 HTTPS 端点，包括端口（例如，`https://clickhouse.example.com:8443`）  
    - 收集器向 ClickHouse 发送数据时必需  

- `CLICKHOUSE_USER`  
  - **默认值：** `default`  
  - **描述：** 用于与 ClickHouse 实例进行身份验证的用户名。  
  - **指导：**  
    - 确保该用户具有 `INSERT` 和 `CREATE TABLE` 权限  
    - 建议为提取创建专用用户  

- `CLICKHOUSE_PASSWORD`  
  - **默认值：** *无（如果启用身份验证，则必需）*  
  - **描述：** 指定 ClickHouse 用户的密码。  
  - **指导：**  
    - 如果用户帐户设置了密码，则为必需  
    - 在生产部署中通过密钥安全存储  

- `HYPERDX_LOG_LEVEL`  
  - **默认值：** `info`  
  - **描述：** 收集器的日志详细程度级别。  
  - **指导：**  
    - 接受类似 `debug`、`info`、`warn`、`error` 的值  
    - 在故障排除期间使用 `debug`  

- `OPAMP_SERVER_URL`  
  - **默认值：** *无（必需）* 如果是独立镜像。如果是 All-in-one 或 Docker Compose 分发，则指向部署的 HyperDX 实例。
  - **描述：** 用于管理收集器的 OpAMP 服务器的 URL（例如，HyperDX 实例）。默认端口为 `4320`。
  - **指导：**  
    - 必须指向您的 HyperDX 实例  
    - 启用动态配置和安全提取  

- `HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE`  
  - **默认值：** `default`  
  - **描述：** 收集器将遥测数据写入的 ClickHouse 数据库。  
  - **指导：**  
    - 如果使用自定义数据库名称，则设置  
    - 确保所指定的用户对该数据库有访问权限  

- `OTEL_AGENT_FEATURE_GATE_ARG`
  - **默认值：** `<空字符串>`
  - **描述：** 启用收集器中的功能标志。如果设置为 `--feature-gates=clickhouse.json` 则启用收集器中的 JSON 类型的 Beta 支持，确保创建具有该类型的架构。另请参见 [`BETA_CH_OTEL_JSON_SCHEMA_ENABLED`](#hyperdx) 以在 HyperDX 中启用 JSON 支持。
  - **指导：**
  - 设置为 `true` 以在 ClickStack 中启用 JSON 支持。

## ClickHouse {#clickhouse}

ClickStack 附带的默认 ClickHouse 配置旨在用于多 TB 规模，但用户可以自由修改和优化以适应其工作负载。

要有效调整 ClickHouse，用户应了解关键存储概念，例如 [parts](/parts)、[partitions](/partitions)、[shards and replicas](/shards)，以及如何在插入时发生 [merges](/merges)。我们建议查看 [primary indices](/primary-indexes)、[sparse secondary indices](/optimize/skipping-indexes) 和数据跳过索引的基本知识，以及使用 TTL 生命周期管理数据生命周期的技术。

ClickStack 支持 [schema customization](/use-cases/observability/schema-design) - 用户可以修改列类型、提取新字段（例如，从日志中）、应用编解码器和字典，并使用投影加速查询。

此外，物化视图可以用于 [transform or filter data during ingestion](/use-cases/observability/schema-design#materialized-columns)，前提是数据写入视图的源表，并且应用程序从目标表读取。

有关更多详细信息，请参阅 ClickHouse 文档中的架构设计、索引策略和数据管理最佳实践 - 大多数内容直接适用于 ClickStack 部署。
