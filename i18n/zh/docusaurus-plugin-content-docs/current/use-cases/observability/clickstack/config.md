---
'slug': '/use-cases/observability/clickstack/config'
'title': '配置选项'
'pagination_prev': null
'pagination_next': null
'description': 'ClickStack 的配置选项 - ClickHouse 观察性堆栈'
---

import Image from '@theme/IdealImage';
import hyperdx_25 from '@site/static/images/use-cases/observability/hyperdx-25.png';
import hyperdx_26 from '@site/static/images/use-cases/observability/hyperdx-26.png';

以下是 ClickStack 每个组件可用的配置选项：

## 修改设置 {#modifying-settings}

### Docker {#docker}

如果使用[一体化](/use-cases/observability/clickstack/deployment/all-in-one)、[仅限 HyperDX](/use-cases/observability/clickstack/deployment/hyperdx-only) 或 [本地模式](/use-cases/observability/clickstack/deployment/local-mode-only)，只需通过环境变量传递所需的设置，例如：

```bash
docker run  -e HYPERDX_LOG_LEVEL='debug' -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

### Docker Compose {#docker-compose}

如果使用 [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose) 部署指南，可以使用 [`.env`](https://github.com/hyperdxio/hyperdx/blob/main/.env) 文件来修改设置。

或者，明确地在 [`docker-compose.yaml`](https://github.com/hyperdxio/hyperdx/blob/main/docker-compose.yml) 文件中覆盖设置，例如：

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

#### 自定义值 (可选) {#customizing-values}

您可以使用 `--set` 标志来自定义设置，例如：

```bash
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

```sh
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

- `日志`
- `追踪`
- `指标`
- `会话`

此配置可以在应用程序中的 `团队设置 -> 源` 内完成，如下所示（针对日志）：

<Image img={hyperdx_25} alt="HyperDX 源配置" size="lg"/>

每个源在创建时至少需要指定一个表，以及一组列，以允许 HyperDX 查询数据。

如果使用 [默认的 OpenTelemetry (OTel) 架构](/observability/integrating-opentelemetry#out-of-the-box-schema) 与 ClickStack 一起分发，则这些列可以为每个源自动推导。如果 [修改架构](#clickhouse) 或使用自定义架构，用户需要指定并更新这些映射。

:::note
与 ClickStack 一起分发的 ClickHouse 的默认架构是为 OTel 收集器创建的 [ClickHouse 导出器](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter) 的架构。这些列名与 OTel 官方规范文档中的详细说明 [here](https://opentelemetry.io/docs/specs/otel/logs/data-model/) 相对应。
:::

每个源可用以下设置：

#### 日志 {#logs}

| 设置                           | 描述                                                                                                                    | 必须       | 默认架构中推导 | 推导值                                          |
|-------------------------------|-------------------------------------------------------------------------------------------------------------------------|------------|-----------------|-------------------------------------------------|
| `名称`                        | 源名称。                                                                                                               | 是         | 否             | –                                               |
| `服务器连接`                  | 服务器连接名称。                                                                                                      | 是         | 否             | `Default`                                       |
| `数据库`                     | ClickHouse 数据库名称。                                                                                               | 是         | 是             | `default`                                       |
| `表`                         | 目标表名。如果使用默认架构，则设置为 `otel_logs`。                                                                        | 是         | 否             |                                                 |
| `时间戳列`                   | 作为主键一部分的日期时间列或表达式。                                                                                     | 是         | 是             | `TimestampTime`                                 |
| `默认选择`                    | 默认搜索结果中显示的列。                                                                                               | 是         | 是             | `Timestamp`, `ServiceName`, `SeverityText`, `Body`  |
| `服务名称表达式`             | 表达式或列，用于获取服务名称。                                                                                         | 是         | 是             | `ServiceName`                                   |
| `日志级别表达式`             | 表达式或列，用于获取日志级别。                                                                                         | 是         | 是             | `SeverityText`                                  |
| `主体表达式`                  | 表达式或列，用于日志消息。                                                                                             | 是         | 是             | `Body`                                          |
| `日志属性表达式`              | 表达式或列，用于自定义日志属性。                                                                                       | 是         | 是             | `LogAttributes`                                 |
| `资源属性表达式`             | 表达式或列，用于资源级别的属性。                                                                                       | 是         | 是             | `ResourceAttributes`                            |
| `显示的时间戳列`             | 用于 UI 显示的时间戳列。                                                                                               | 是         | 是             | `ResourceAttributes`                            |
| `相关指标源`                 | 关联的指标源（例如：HyperDX 指标）。                                                                                   | 否         | 否             | –                                               |
| `相关追踪源`                 | 关联的追踪源（例如：HyperDX 追踪）。                                                                                    | 否         | 否             | –                                               |
| `追踪 ID 表达式`             | 用于提取追踪 ID 的表达式或列。                                                                                          | 是         | 是             | `TraceId`                                       |
| `跨度 ID 表达式`             | 用于提取跨度 ID 的表达式或列。                                                                                          | 是         | 是             | `SpanId`                                        |
| `隐式列表达式`               | 如果未指定字段则用于全文搜索的列（Lucene 风格），通常是日志主体。                                                       | 是         | 是             | `Body`                                          |

#### 追踪 {#traces}

| 设置                            | 描述                                                                                                                    | 必须       | 默认架构中推导 | 推导值         |
|--------------------------------|-------------------------------------------------------------------------------------------------------------------------|------------|-----------------|-----------------|
| `名称`                         | 源名称。                                                                                                               | 是         | 否             | –               |
| `服务器连接`                   | 服务器连接名称。                                                                                                      | 是         | 否             | `Default`       |
| `数据库`                       | ClickHouse 数据库名称。                                                                                               | 是         | 是             | `default`       |
| `表`                          | 目标表名。如果使用默认架构，则设置为 `otel_traces`。                                                                        | 是         | 是             | -               |
| `时间戳列`                    | 作为主键一部分的日期时间列或表达式。                                                                                     | 是         | 是             | `Timestamp`     |
| `时间戳`                      | `时间戳列` 的别名。                                                                                                   | 是         | 是             | `Timestamp`     |
| `默认选择`                    | 默认搜索结果中显示的列。                                                                                               | 是         | 是             | `Timestamp, ServiceName as service, StatusCode as level, round(Duration / 1e6) as duration, SpanName` |
| `持续时间表达式`              | 计算跨度持续时间的表达式。                                                                                            | 是         | 是             | `Duration`      |
| `持续时间精度`                | 持续时间表达式的精度（例如，纳秒、微秒）。                                                                            | 是         | 是             | ns              |
| `追踪 ID 表达式`              | 用于追踪 ID 的表达式或列。                                                                                            | 是         | 是             | `TraceId`       |
| `跨度 ID 表达式`              | 用于跨度 ID 的表达式或列。                                                                                            | 是         | 是             | `SpanId`        |
| `父跨度 ID 表达式`            | 用于父跨度 ID 的表达式或列。                                                                                           | 是         | 是             | `ParentSpanId`  |
| `跨度名称表达式`              | 用于跨度名称的表达式或列。                                                                                            | 是         | 是             | `SpanName`      |
| `跨度类型表达式`              | 用于跨度类型的表达式或列（例如：客户端、服务器）。                                                                    | 是         | 是             | `SpanKind`      |
| `相关日志源`                  | 可选。关联的日志源（例如：HyperDX 日志）。                                                                             | 否         | 否             | –               |
| `相关会话源`                  | 可选。关联的会话源。                                                                                                   | 否         | 否             | –               |
| `相关指标源`                  | 可选。关联的指标源（例如：HyperDX 指标）。                                                                             | 否         | 否             | –               |
| `状态代码表达式`              | 用于跨度状态代码的表达式。                                                                                            | 是         | 是             | `StatusCode`    |
| `状态消息表达式`              | 用于跨度状态消息的表达式。                                                                                            | 是         | 是             | `StatusMessage`  |
| `服务名称表达式`              | 表达式或列，用于服务名称。                                                                                            | 是         | 是             | `ServiceName`    |
| `资源属性表达式`             | 表达式或列，用于资源级别的属性。                                                                                       | 是         | 是             | `ResourceAttributes`     |
| `事件属性表达式`              | 表达式或列，用于事件属性。                                                                                             | 是         | 是             | `SpanAttributes` |
| `跨度事件表达式`              | 提取跨度事件的表达式。通常是 `Nested` 类型列。这允许使用支持的语言 SDK 渲染异常堆栈跟踪。                                      | 是         | 是             | `Events`        |
| `隐式列表达式`               | 如果未指定字段则用于全文搜索的列（Lucene 风格）。通常是日志主体。                                                      | 是         | 是             | `SpanName`      |

#### 指标 {#metrics}

| 设置                         | 描述                                                                                                           | 必须       | 默认架构中推导 | 推导值              |
|------------------------------|---------------------------------------------------------------------------------------------------------------|------------|-----------------|---------------------|
| `名称`                      | 源名称。                                                                                                      | 是         | 否             | –                   |
| `服务器连接`                | 服务器连接名称。                                                                                            | 是         | 否             | `Default`           |
| `数据库`                    | ClickHouse 数据库名称。                                                                                     | 是         | 是             | `default`           |
| `仪表表`                    | 存储仪表类型指标的表。                                                                                       | 是         | 否             | `otel_metrics_gauge` |
| `直方图表`                  | 存储直方图类型指标的表。                                                                                     | 是         | 否             | `otel_metrics_histogram` |
| `总和表`                    | 存储总和类型（计数器）指标的表。                                                                            | 是         | 否             | `otel_metrics_sum`   |
| `相关日志源`                | 可选。关联的日志源（例如：HyperDX 日志）。                                                                   | 否         | 否             | –                   |

#### 会话 {#settings}

| 设置                          | 描述                                                                                                            | 必须       | 默认架构中推导 | 推导值              |
|-------------------------------|----------------------------------------------------------------------------------------------------------------|------------|-----------------|---------------------|
| `名称`                        | 源名称。                                                                                                      | 是         | 否             | –                   |
| `服务器连接`                  | 服务器连接名称。                                                                                            | 是         | 否             | `Default`           |
| `数据库`                      | ClickHouse 数据库名称。                                                                                     | 是         | 是             | `default`           |
| `表`                         | 会话数据的目标表名。在使用默认架构时，设置为 `hyperdx_sessions`。                                            | 是         | 是             | -                   |
| `时间戳列`                   | 作为主键一部分的日期时间列或表达式。                                                                         | 是         | 是             | `TimestampTime`     |
| `日志属性表达式`             | 从会话数据中提取日志级别属性的表达式。                                                                    | 是         | 是             | `LogAttributes`     |
| `LogAttributes`               | 用于存储日志属性的别名或字段引用。                                                                           | 是         | 是             | `LogAttributes`     |
| `资源属性表达式`             | 提取资源级别元数据的表达式。                                                                                 | 是         | 是             | `ResourceAttributes` |
| `相关追踪源`                 | 可选。用于会话关联的关联追踪源。                                                                            | 否         | 否             | –                   |
| `隐式列表达式`               | 如果未指定字段，则用于全文搜索的列（例如 Lucene 风格查询解析）。                                              | 是         | 是             | `Body`              |

### 相关源 {#correlated-sources}

要在 ClickStack 中启用完整的跨源关联，用户必须配置日志、追踪、指标和会话的相关源。这使 HyperDX 能够关联相关数据，并在呈现事件时提供丰富的上下文。

- `日志`：可以与追踪和指标关联。
- `追踪`：可以与日志、会话和指标关联。
- `指标`：可以与日志关联。
- `会话`：可以与追踪关联。

通过设置这些关联，HyperDX 可以，例如，在追踪旁边呈现相关日志或列出与会话相关的指标异常。正确的配置确保了统一且有上下文的可观察性体验。

例如，以下是配置了相关源的日志源：

<Image img={hyperdx_26} alt="HyperDX 源相关" size="md"/>

### 应用程序配置设置 {#application-configuration-settings}

- `HYPERDX_API_KEY`
    - **默认值：** 无（必需）
    - **描述：** HyperDX API 的身份验证密钥。
    - **指导：** 
    - 传感器和日志记录所需
    - 本地开发中，可以是任何非空值
    - 对于生产环境，使用安全的唯一密钥
    - 账户创建后可从团队设置页面获取

- `HYPERDX_LOG_LEVEL`
    - **默认值：** `info`
    - **描述：** 设置日志详细级别。
    - **选项：** `debug`, `info`, `warn`, `error`
    - **指导：**
    - 在故障排除时使用 `debug`
    - 正常操作使用 `info`
    - 生产环境中使用 `warn` 或 `error` 以减少日志数量

- `HYPERDX_API_PORT`
    - **默认值：** `8000`
    - **描述：** HyperDX API 服务器的端口。
    - **指导：**
    - 确保此端口在您的主机上可用
    - 如果有端口冲突，请更改
    - 必须与 API 客户端配置中的端口匹配

- `HYPERDX_APP_PORT`
    - **默认值：** `8000`
    - **描述：** HyperDX 前端应用程序的端口。
    - **指导：**
    - 确保此端口在您的主机上可用
    - 如果有端口冲突，请更改
    - 必须可以从您的浏览器访问

- `HYPERDX_APP_URL`
    - **默认值：** `http://localhost`
    - **描述：** 前端应用程序的基本 URL。
    - **指导：**
    - 在生产环境中设置为您的域名
    - 包含协议（http/https）
    - 不要包含尾部斜杠

- `MONGO_URI`
    - **默认值：** `mongodb://db:27017/hyperdx`
    - **描述：** MongoDB 连接字符串。
    - **指导：**
    - 在使用 Docker 的本地开发中使用默认值
    - 在生产环境中，使用安全连接字符串
    - 如果需要，包含身份验证
    - 示例： `mongodb://user:pass@host:port/db`

- `MINER_API_URL`
    - **默认值：** `http://miner:5123`
    - **描述：** 日志模式挖掘服务的 URL。
    - **指导：**
    - 在使用 Docker 的本地开发中使用默认值
    - 在生产环境中设置为您的挖矿服务 URL
    - 必须可以从 API 服务访问

- `FRONTEND_URL`
    - **默认值：** `http://localhost:3000`
    - **描述：** 前端应用程序的 URL。
    - **指导：**
    - 在本地开发中使用默认值
    - 在生产环境中设置为您的域名
    - 必须可以从 API 服务访问

- `OTEL_SERVICE_NAME`
    - **默认值：** `hdx-oss-api`
    - **描述：** OpenTelemetry 仪表化的服务名称。
    - **指导：**
    - 使用描述性名称来表示您的 HyperDX 服务。如果 HyperDX 自我仪表化，则适用。
    - 有助于识别传感器数据中的 HyperDX 服务

- `NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT`
    - **默认值：** `http://localhost:4318`
    - **描述：** OpenTelemetry 收集器端点。
    - **指导：**
    - 与自我仪表化的 HyperDX 相关。
    - 本地开发中使用默认值
    - 在生产中设置为您的收集器 URL
    - 必须可以从您的 HyperDX 服务访问

- `USAGE_STATS_ENABLED`
    - **默认值：** `true`
    - **描述：** 切换使用统计信息收集。
    - **指导：**
    - 设置为 `false` 以禁用使用跟踪
    - 对于隐私敏感的部署有用
    - 默认是 `true`，以改善产品

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
    - 将设置为 `true` 以进行本地开发
    - 禁用某些生产功能
    - 适用于测试和开发

- `EXPRESS_SESSION_SECRET`
    - **默认值：** `hyperdx is cool 👋`
    - **描述：** Express 会话管理的密钥。
    - **指导：**
    - 在生产中进行更改
    - 使用强随机字符串
    - 保持机密和安全

- `ENABLE_SWAGGER`
    - **默认值：** `false`
    - **描述：** 切换 Swagger API 文档。
    - **指导：**
    - 设置为 `true` 启用 API 文档
    - 对于开发和测试有用
    - 在生产中禁用


## OpenTelemetry 收集器 {#otel-collector}

有关更多详细信息，请参阅 ["ClickStack OpenTelemetry Collector"](/use-cases/observability/clickstack/ingesting-data/otel-collector)。

- `CLICKHOUSE_ENDPOINT`  
  - **默认值：** 如果是独立映像则为*无（必需）*。如果是一体化或 Docker Compose 分布，则设置为集成的 ClickHouse 实例。
  - **描述：** 将监控数据导出到的 ClickHouse 实例的 HTTPS URL。  
  - **指导：**  
    - 必须是完整的 HTTPS 端点，包括端口（例如，`https://clickhouse.example.com:8443`）  
    - 收集器发送数据到 ClickHouse 时必需  

- `CLICKHOUSE_USER`  
  - **默认值：** `default`  
  - **描述：** 用于与 ClickHouse 实例进行身份验证的用户名。  
  - **指导：**  
    - 确保用户具有 `INSERT` 和 `CREATE TABLE` 权限  
    - 建议为数据摄取创建一个专用用户  

- `CLICKHOUSE_PASSWORD`  
  - **默认值：** *无（如果启用身份验证，则必需）*  
  - **描述：** 指定 ClickHouse 用户的密码。  
  - **指导：**  
    - 如果用户帐户设置了密码，则必需  
    - 在生产部署中安全地存储  

- `HYPERDX_LOG_LEVEL`  
  - **默认值：** `info`  
  - **描述：** 收集器的日志详细级别。  
  - **指导：**  
    - 接受 `debug`, `info`, `warn`, `error` 等值  
    - 在故障排除期间使用 `debug`  

- `OPAMP_SERVER_URL`  
  - **默认值：** 如果是独立映像，则*无（必需）*。如果是一体化或 Docker Compose 分布，则指向已部署的 HyperDX 实例。
  - **描述：** 用于管理收集器的 OpAMP 服务器的 URL（例如：HyperDX 实例）。默认端口为 `4320`。
  - **指导：**  
    - 必须指向您的 HyperDX 实例  
    - 启用动态配置和安全摄取  

- `HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE`  
  - **默认值：** `default`  
  - **描述：** 收集器写入监控数据的 ClickHouse 数据库。  
  - **指导：**  
    - 如果使用自定义数据库名称，请设置  
    - 确保指定用户对该数据库有访问权限  

## ClickHouse {#clickhouse}

ClickStack 附带了默认的 ClickHouse 配置，旨在支持多 TB 的规模，但用户可以自由修改和优化以适应其工作负载。

为了有效调整 ClickHouse，用户应了解关键存储概念，如 [parts](/parts)、[partitions](/partitions)、[shards and replicas](/shards)，以及 [merges](/merges) 在插入时如何发生。我们建议回顾[主索引](/primary-indexes)、[稀疏二级索引](/optimize/skipping-indexes)和数据跳过索引的基础知识，以及[管理数据生命周期](/observability/managing-data)的技术，例如，使用 TTL 生命周期。

ClickStack 支持 [架构自定义](/use-cases/observability/schema-design) - 用户可以修改列类型、提取新字段（例如：从日志中）、应用编解码器和字典，并使用投影加速查询。

此外，可以使用物化视图[在摄取期间转换或过滤数据](/use-cases/observability/schema-design#materialized-columns)，前提是数据被写入视图的源表，并且应用程序从目标表中读取。

有关更多详细信息，请参考 ClickHouse 文档中的架构设计、索引策略和数据管理最佳实践 - 大多数均直接适用于 ClickStack 部署。
