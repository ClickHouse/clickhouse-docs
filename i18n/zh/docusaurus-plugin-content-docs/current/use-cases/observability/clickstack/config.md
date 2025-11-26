---
slug: /use-cases/observability/clickstack/config
title: '配置选项'
pagination_prev: null
pagination_next: null
description: 'ClickStack 配置选项——ClickHouse 可观测性技术栈'
keywords: ['ClickStack 配置', '可观测性配置', 'HyperDX 设置', '采集器配置', '环境变量']
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import hyperdx_25 from '@site/static/images/use-cases/observability/hyperdx-25.png';
import hyperdx_26 from '@site/static/images/use-cases/observability/hyperdx-26.png';

ClickStack 的每个组件都支持以下配置选项：


## 修改设置

### Docker

如果使用 [All in One](/use-cases/observability/clickstack/deployment/all-in-one)、[HyperDX Only](/use-cases/observability/clickstack/deployment/hyperdx-only) 或 [Local Mode](/use-cases/observability/clickstack/deployment/local-mode-only)，只需通过环境变量传入所需配置，例如：

```shell
docker run  -e HYPERDX_LOG_LEVEL='debug' -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

### Docker Compose

如果使用 [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose) 部署指南，可以使用 [`.env`](https://github.com/hyperdxio/hyperdx/blob/main/.env) 文件修改配置。

或者，也可以在 [`docker-compose.yaml`](https://github.com/hyperdxio/hyperdx/blob/main/docker-compose.yml) 文件中显式覆盖配置，比如：

示例：

```yaml
services:
  app:
    environment:
      HYPERDX_API_KEY: ${HYPERDX_API_KEY}
      HYPERDX_LOG_LEVEL: ${HYPERDX_LOG_LEVEL}
      # ... 其他配置
```

### Helm

#### 自定义配置（可选）

你可以使用 `--set` 参数来自定义配置，例如：

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

### Data source settings {#datasource-settings}

HyperDX 依赖用户为每一种可观测性数据类型（支柱）定义一个数据源（source）：

- `Logs`
- `Traces`
- `Metrics`
- `Sessions`

可以在应用内通过 `Team Settings -> Sources` 进行此配置，下面以日志为例：

<Image img={hyperdx_25} alt="HyperDX Source configuration" size="lg"/>

每个数据源在创建时至少需要指定一个表，以及一组列，以便 HyperDX 能够查询这些数据。

如果使用 ClickStack 随附的[默认 OpenTelemetry (OTel) schema](/observability/integrating-opentelemetry#out-of-the-box-schema)，这些列可以针对每个数据源自动推断。如果[修改该 schema](#clickhouse)或使用自定义 schema，则需要用户自行指定并更新这些映射。

:::note
ClickStack 中随 ClickHouse 分发的默认 schema 是由 [ClickHouse exporter for the OTel collector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter) 创建的 schema。其列名与 OTel 官方规范中记录的字段[在此](https://opentelemetry.io/docs/specs/otel/logs/data-model/)一一对应。
:::

每个数据源可用的设置如下：

#### Logs {#logs}

| Setting                        | Description                                                                                                             | Required | Inferred in Default Schema | Inferred Value                                      |
|-------------------------------|-------------------------------------------------------------------------------------------------------------------------|----------|-----------------------------|-----------------------------------------------------|
| `Name`                        | 数据源名称。                                                                                                            | Yes      | No                          | –                                                   |
| `Server Connection`           | 服务器连接名称。                                                                                                        | Yes      | No                          | `Default`                                           |
| `Database`                    | ClickHouse 数据库名称。                                                                                                 | Yes      | Yes                         | `default`                                           |
| `Table`                       | 目标表名。若使用默认 schema，请设置为 `otel_logs`。                                                                     | Yes      | No                          |                                                     |
| `Timestamp Column`            | 作为主键一部分的 Datetime 列或表达式。                                                                                  | Yes      | Yes                         | `TimestampTime`                                     |
| `Default Select`              | 在默认搜索结果中展示的列。                                                                                              | Yes      | Yes                         | `Timestamp`, `ServiceName`, `SeverityText`, `Body` |
| `Service Name Expression`     | 服务名称所使用的表达式或列。                                                                                            | Yes      | Yes                         | `ServiceName`                                       |
| `Log Level Expression`        | 日志级别所使用的表达式或列。                                                                                            | Yes      | Yes                         | `SeverityText`                                      |
| `Body Expression`             | 日志消息所使用的表达式或列。                                                                                            | Yes      | Yes                         | `Body`                                              |
| `Log Attributes Expression`   | 自定义日志属性所使用的表达式或列。                                                                                      | Yes      | Yes                         | `LogAttributes`                                     |
| `Resource Attributes Expression` | 资源级属性所使用的表达式或列。                                                                                       | Yes      | Yes                         | `ResourceAttributes`                                |
| `Displayed Timestamp Column`  | 在 UI 展示中使用的时间戳列。                                                                                            | Yes      | Yes                         | `ResourceAttributes`                                |
| `Correlated Metric Source`    | 关联的指标数据源（例如 HyperDX metrics）。                                                                              | No       | No                          | –                                                   |
| `Correlated Trace Source`     | 关联的 Trace 数据源（例如 HyperDX traces）。                                                                            | No       | No                          | –                                                   |
| `Trace Id Expression`         | 用于提取 Trace ID 的表达式或列。                                                                                        | Yes      | Yes                         | `TraceId`                                           |
| `Span Id Expression`          | 用于提取 Span ID 的表达式或列。                                                                                         | Yes      | Yes                         | `SpanId`                                            |
| `Implicit Column Expression`  | 在未指定字段时用于全文搜索（类似 Lucene 风格）的列，通常为日志正文。                                                    | Yes      | Yes                         | `Body`                                              |

#### Traces {#traces}



| Setting                          | Description                                                                                                             | Required | Inferred in Default Schema | Inferred Value         |
|----------------------------------|-------------------------------------------------------------------------------------------------------------------------|----------|-----------------------------|------------------------|
| `Name`                           | 源名称。                                                                                                                | Yes      | No                          | –                      |
| `Server Connection`              | 服务器连接名称。                                                                                                        | Yes      | No                          | `Default`              |
| `Database`                       | ClickHouse 数据库名称。                                                                                                 | Yes      | Yes                         | `default`                |
| `Table`                          | 目标表名。如果使用默认 schema，请设置为 `otel_traces`。                                                                 | Yes      | Yes                         |      -       |
| `Timestamp Column`              | 作为主键一部分的日期时间列或表达式。                                                                                   | Yes      | Yes                         | `Timestamp`              |
| `Timestamp`                      | `Timestamp Column` 的别名。                                                                                             | Yes      | Yes                         | `Timestamp`              |
| `Default Select`                | 默认搜索结果中显示的列。                                                                                                | Yes      | Yes                         | `Timestamp, ServiceName as service, StatusCode as level, round(Duration / 1e6) as duration, SpanName` |
| `Duration Expression`           | 用于计算 span 持续时间的表达式。                                                                                        | Yes      | Yes                         | `Duration`               |
| `Duration Precision`            | 持续时间表达式的精度（例如纳秒、微秒）。                                                                                | Yes      | Yes                         | ns                     |
| `Trace Id Expression`           | Trace ID 的表达式或列。                                                                                                 | Yes      | Yes                         | `TraceId`                |
| `Span Id Expression`            | span ID 的表达式或列。                                                                                                  | Yes      | Yes                         | `SpanId`                 |
| `Parent Span Id Expression`     | 父 span ID 的表达式或列。                                                                                               | Yes      | Yes                         | `ParentSpanId`           |
| `Span Name Expression`          | span 名称的表达式或列。                                                                                                 | Yes      | Yes                         | `SpanName`               |
| `Span Kind Expression`          | span 类型（例如 client、server）的表达式或列。                                                                          | Yes      | Yes                         | `SpanKind`               |
| `Correlated Log Source`         | 可选。关联的日志源（例如 HyperDX 日志）。                                                                               | No       | No                          | –                      |
| `Correlated Session Source`     | 可选。关联的会话源。                                                                                                    | No       | No                          | –                      |
| `Correlated Metric Source`      | 可选。关联的指标源（例如 HyperDX 指标）。                                                                               | No       | No                          | –                      |
| `Status Code Expression`        | span 状态码的表达式。                                                                                                   | Yes      | Yes                         | `StatusCode`             |
| `Status Message Expression`     | span 状态消息的表达式。                                                                                                 | Yes      | Yes                         | `StatusMessage`          |
| `Service Name Expression`       | 服务名称的表达式或列。                                                                                                  | Yes      | Yes                         | `ServiceName`            |
| `Resource Attributes Expression`| 资源级别属性的表达式或列。                                                                                              | Yes      | Yes                         | `ResourceAttributes`     |
| `Event Attributes Expression`   | 事件属性的表达式或列。                                                                                                  | Yes      | Yes                         | `SpanAttributes`         |
| `Span Events Expression`        | 用于提取 span 事件的表达式。通常是 `Nested` 类型列。这使得可以使用受支持语言的 SDKS 渲染异常堆栈追踪。                  | Yes      | Yes                         | `Events`                 |
| `Implicit Column Expression`   | 当未指定字段时用于全文搜索（类似 Lucene 风格）的列。通常为日志正文。                                                   | Yes  | Yes  | `SpanName`|

#### 指标 {#metrics}



| Setting               | Description                                                                                   | Required | Inferred in Default Schema | Inferred Value              |
|------------------------|-----------------------------------------------------------------------------------------------|----------|-----------------------------|-----------------------------|
| `Name`                 | 来源名称。                                                                                     | Yes      | No                          | –                           |
| `Server Connection`    | 服务器连接名称。                                                                               | Yes      | No                          | `Default`                   |
| `Database`             | ClickHouse 数据库名称。                                                                       | Yes      | Yes                         | `default`                   |
| `Gauge Table`          | 存储 gauge 类型指标的表。                                                                     | Yes      | No                          | `otel_metrics_gauge`        |
| `Histogram Table`      | 存储 histogram 类型指标的表。                                                                 | Yes      | No                          | `otel_metrics_histogram`    |
| `Sum Table`            | 存储 sum 类型（计数器）指标的表。                                                             | Yes      | No                          | `otel_metrics_sum`          |
| `Correlated Log Source`| 可选。关联的日志来源（例如 HyperDX 日志）。                                                   | No       | No                          | –                           |

#### Sessions {#settings}

| Setting                        | Description                                                                                         | Required | Inferred in Default Schema | Inferred Value         |
|-------------------------------|-----------------------------------------------------------------------------------------------------|----------|-----------------------------|------------------------|
| `Name`                        | 来源名称。                                                                                          | Yes      | No                          | –                      |
| `Server Connection`           | 服务器连接名称。                                                                                     | Yes      | No                          | `Default`              |
| `Database`                    | ClickHouse 数据库名称。                                                                             | Yes      | Yes                         | `default`              |
| `Table`                       | 会话数据的目标表。目标表名称。如果使用默认 schema，请设置为 `hyperdx_sessions`。                    | Yes      | Yes                         | -                      |
| `Timestamp Column`           | 作为主键一部分的 Datetime 列或表达式。                                                              | Yes      | Yes                         | `TimestampTime`        |
| `Log Attributes Expression`   | 从会话数据中提取日志级别属性的表达式。                                                              | Yes      | Yes                         | `LogAttributes`        |
| `LogAttributes`               | 用于存储日志属性的别名或字段引用。                                                                 | Yes      | Yes                         | `LogAttributes`        |
| `Resource Attributes Expression` | 用于提取资源级元数据的表达式。                                                                  | Yes      | Yes                         | `ResourceAttributes`   |
| `Correlated Trace Source`     | 可选。用于会话关联的 Trace 来源。                                                                  | No       | No                          | –                      |
| `Implicit Column Expression`  | 在未指定字段时用于全文搜索的列（例如 Lucene 风格的查询解析）。                                      | Yes      | Yes                         | `Body`                 |

### Correlated sources {#correlated-sources}

要在 ClickStack 中启用完整的跨来源关联，用户必须为日志、Trace、指标和会话配置关联来源。这样可以让 HyperDX 将相关数据关联起来，并在渲染事件时提供丰富的上下文。

- `Logs`：可以与 Trace 和指标关联。
- `Traces`：可以与日志、会话和指标关联。
- `Metrics`：可以与日志关联。
- `Sessions`：可以与 Trace 关联。

配置这些关联后，可以启用多种功能。例如，HyperDX 可以在 Trace 旁边渲染相关日志，或显示与某个会话关联的指标异常。

例如，下面是配置了关联来源的 Logs 来源：

<Image img={hyperdx_26} alt="HyperDX Source correlated" size="md"/>

### Application configuration settings {#application-configuration-settings}

:::note HyperDX in ClickHouse Cloud
当 HyperDX 由 ClickHouse Cloud 托管时，这些设置不可修改。
:::

- `HYPERDX_API_KEY`
  - **Default:** 无（必填）
  - **Description:** HyperDX API 的认证密钥。
  - **Guidance:**
  - 遥测和日志记录必需
  - 在本地开发中，可以是任意非空值
  - 在生产环境中，请使用安全且唯一的密钥
  - 可在创建账号后从团队设置页面获取

- `HYPERDX_LOG_LEVEL`
  - **Default:** `info`
  - **Description:** 设置日志详细程度。
  - **Options:** `debug`, `info`, `warn`, `error`
  - **Guidance:**
  - 使用 `debug` 进行详细故障排查
  - 使用 `info` 用于正常运行
  - 在生产环境中使用 `warn` 或 `error` 以减少日志量

- `HYPERDX_API_PORT`
  - **Default:** `8000`
  - **Description:** HyperDX API 服务器端口。
  - **Guidance:**
  - 确保此端口在主机上可用
  - 如有端口冲突，请修改
  - 必须与 API 客户端配置中的端口保持一致



- `HYPERDX_APP_PORT`
  - **Default：** `8000`
  - **Description：** HyperDX 前端应用的端口。
  - **Guidance：**
  - 确保该端口在主机上可用
  - 如有端口冲突请更改
  - 必须能从浏览器访问

- `HYPERDX_APP_URL`
  - **Default：** `http://localhost`
  - **Description：** 前端应用的基础 URL。
  - **Guidance：**
  - 生产环境中设置为你的域名
  - 必须包含协议（http/https）
  - 末尾不要包含斜杠

- `MONGO_URI`
  - **Default：** `mongodb://db:27017/hyperdx`
  - **Description：** MongoDB 连接字符串。
  - **Guidance：**
  - 本地使用 Docker 开发时可使用默认值
  - 生产环境中使用安全的连接字符串
  - 如需认证，请包含认证信息
  - 示例：`mongodb://user:pass@host:port/db`

- `MINER_API_URL`
  - **Default：** `http://miner:5123`
  - **Description：** 日志模式挖掘服务的 URL。
  - **Guidance：**
  - 本地使用 Docker 开发时可使用默认值
  - 生产环境中设置为你的 miner 服务 URL
  - 必须能从 API 服务访问

- `FRONTEND_URL`
  - **Default：** `http://localhost:3000`
  - **Description：** 前端应用的 URL。
  - **Guidance：**
  - 本地开发时使用默认值
  - 生产环境中设置为你的域名
  - 必须能从 API 服务访问

- `OTEL_SERVICE_NAME`
  - **Default：** `hdx-oss-api`
  - **Description：** OpenTelemetry 插桩使用的服务名称。
  - **Guidance：**
  - 为你的 HyperDX 服务使用具有描述性的名称，适用于 HyperDX 自身插桩的情况
  - 有助于在遥测数据中识别 HyperDX 服务

- `NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT`
  - **Default：** `http://localhost:4318`
  - **Description：** OpenTelemetry collector 端点。
  - **Guidance：**
  - 仅在 HyperDX 自身插桩时相关
  - 本地开发时使用默认值
  - 生产环境中设置为你的 collector URL
  - 必须能从你的 HyperDX 服务访问

- `USAGE_STATS_ENABLED`
  - **Default：** `true`
  - **Description：** 控制是否收集使用统计数据。
  - **Guidance：**
  - 设置为 `false` 可禁用使用跟踪
  - 对隐私敏感的部署非常有用
  - 默认值为 `true`，以便更好地改进产品

- `IS_OSS`
  - **Default：** `true`
  - **Description：** 表示是否在 OSS 模式下运行。
  - **Guidance：**
  - 开源部署保持为 `true`
  - 企业部署设置为 `false`
  - 会影响功能可用性

- `IS_LOCAL_MODE`
  - **Default：** `false`
  - **Description：** 表示是否在本地模式下运行。
  - **Guidance：**
  - 本地开发时设置为 `true`
  - 会禁用某些生产特性
  - 适用于测试和开发

- `EXPRESS_SESSION_SECRET`
  - **Default：** `hyperdx 很酷 👋`
  - **Description：** Express 会话管理的密钥。
  - **Guidance：**
  - 生产环境中请更改
  - 使用强随机字符串
  - 确保密钥保密且安全存储

- `ENABLE_SWAGGER`
  - **Default：** `false`
  - **Description：** 控制是否启用 Swagger API 文档。
  - **Guidance：**
  - 设置为 `true` 可启用 API 文档
  - 适用于开发和测试
  - 生产环境中建议禁用

- `BETA_CH_OTEL_JSON_SCHEMA_ENABLED`
  - **Default：** `false`
  - **Description：** 启用 HyperDX 中 JSON 类型的 Beta 级支持。参见 [`OTEL_AGENT_FEATURE_GATE_ARG`](#otel-collector) 以在 OTel collector 中启用 JSON 支持。
  - **Guidance：**
  - 设置为 `true` 可在 ClickStack 中启用 JSON 支持。



## OpenTelemetry collector {#otel-collector}

详见 ["ClickStack OpenTelemetry Collector"](/use-cases/observability/clickstack/ingesting-data/otel-collector)。

- `CLICKHOUSE_ENDPOINT`
  - **默认值：** *无（必填）*，如果使用独立镜像；如果为 All-in-one 或 Docker Compose 发行版，则会设置为集成的 ClickHouse 实例。
  - **说明：** 用于导出遥测数据的 ClickHouse 实例的 HTTPS URL。
  - **指导：**
    - 必须是包含端口的完整 HTTPS 端点（例如：`https://clickhouse.example.com:8443`）
    - 是收集器向 ClickHouse 发送数据所必需的

- `CLICKHOUSE_USER`
  - **默认值：** `default`
  - **说明：** 用于与 ClickHouse 实例进行身份验证的用户名。
  - **指导：**
    - 确保该用户拥有 `INSERT` 和 `CREATE TABLE` 权限
    - 建议为摄取创建一个专用用户

- `CLICKHOUSE_PASSWORD`
  - **默认值：** *无（如果启用了身份验证则必填）*
  - **说明：** 指定 ClickHouse 用户的密码。
  - **指导：**
    - 如果用户账户设置了密码，则必填
    - 在生产部署中通过 Secret 安全存储

- `HYPERDX_LOG_LEVEL`
  - **默认值：** `info`
  - **说明：** 收集器的日志详细程度级别。
  - **指导：**
    - 接受 `debug`、`info`、`warn`、`error` 等值
    - 故障排查时使用 `debug`

- `OPAMP_SERVER_URL`
  - **默认值：** *无（必填）*，如果使用独立镜像；如果为 All-in-one 或 Docker Compose 发行版，则指向已部署的 HyperDX 实例。
  - **说明：** 用于管理收集器的 OpAMP 服务器 URL（例如 HyperDX 实例）。默认使用端口 `4320`。
  - **指导：**
    - 必须指向你的 HyperDX 实例
    - 启用动态配置和安全摄取

- `HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE`
  - **默认值：** `default`
  - **说明：** 收集器写入遥测数据的 ClickHouse 数据库。
  - **指导：**
    - 如果使用自定义数据库名称则进行设置
    - 确保指定用户对该数据库具有访问权限

- `OTEL_AGENT_FEATURE_GATE_ARG`
  - **默认值：** `<empty string>`
  - **说明：** 在收集器中启用功能开关。如果设置为 `--feature-gates=clickhouse.json`，则在收集器中启用对 JSON 类型的 Beta 支持，确保使用该类型创建模式（schema）。参见 [`BETA_CH_OTEL_JSON_SCHEMA_ENABLED`](#hyperdx) 以在 HyperDX 中启用 JSON 支持。
  - **指导：**
  - 将其设置为 `true` 以在 ClickStack 中启用 JSON 支持。



## ClickHouse {#clickhouse}

ClickStack 自带的默认 ClickHouse 配置按多 TB 级规模设计，但用户可以根据自身工作负载自由修改和优化。

要有效调优 ClickHouse，用户应理解关键的存储概念，例如 [parts](/parts)、[partitions](/partitions)、[shards and replicas](/shards)，以及在插入时 [merges](/merges) 是如何发生的。我们建议先回顾 [primary indices](/primary-indexes)、[sparse secondary indices](/optimize/skipping-indexes) 和数据跳过索引等基础知识，以及 [数据生命周期管理](/observability/managing-data) 的相关技术，例如使用 TTL 生命周期策略。

ClickStack 支持 [模式自定义](/use-cases/observability/schema-design)——用户可以修改列类型、抽取新字段（例如从日志中）、应用编解码器和字典，并通过使用 projections 加速查询。

此外，可以使用物化视图在[摄取期间转换或过滤数据](/use-cases/observability/schema-design#materialized-columns)，前提是数据写入视图的源表，而应用程序从目标表中读取数据。

更多详情请参考 ClickHouse 关于模式设计、索引策略和数据管理最佳实践的文档——其中绝大部分内容可直接应用于 ClickStack 部署。
