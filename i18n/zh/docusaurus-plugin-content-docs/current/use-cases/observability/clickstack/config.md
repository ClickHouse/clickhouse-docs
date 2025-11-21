---
slug: /use-cases/observability/clickstack/config
title: '配置选项'
pagination_prev: null
pagination_next: null
description: 'ClickStack 的配置选项——ClickHouse 可观测性栈'
keywords: ['ClickStack 配置', '可观测性配置', 'HyperDX 设置', '采集器配置', '环境变量']
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import hyperdx_25 from '@site/static/images/use-cases/observability/hyperdx-25.png';
import hyperdx_26 from '@site/static/images/use-cases/observability/hyperdx-26.png';

ClickStack 的每个组件都提供以下配置选项：


## 修改设置 {#modifying-settings}

### Docker {#docker}

如果使用 [All in One](/use-cases/observability/clickstack/deployment/all-in-one)、[HyperDX Only](/use-cases/observability/clickstack/deployment/hyperdx-only) 或 [Local Mode](/use-cases/observability/clickstack/deployment/local-mode-only) 部署方式,只需通过环境变量传递所需的设置即可,例如:

```shell
docker run  -e HYPERDX_LOG_LEVEL='debug' -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

### Docker Compose {#docker-compose}

如果使用 [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose) 部署指南,可以通过 [`.env`](https://github.com/hyperdxio/hyperdx/blob/main/.env) 文件修改设置。

或者,也可以在 [`docker-compose.yaml`](https://github.com/hyperdxio/hyperdx/blob/main/docker-compose.yml) 文件中显式覆盖设置,例如:

示例:

```yaml
services:
  app:
    environment:
      HYPERDX_API_KEY: ${HYPERDX_API_KEY}
      HYPERDX_LOG_LEVEL: ${HYPERDX_LOG_LEVEL}
      # ... 其他设置
```

### Helm {#helm}

#### 自定义值(可选) {#customizing-values}

您可以使用 `--set` 标志自定义设置,例如:

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

或者编辑 `values.yaml` 文件。要获取默认值:

```shell
helm show values hyperdx/hdx-oss-v2 > values.yaml
```

示例配置:

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

HyperDX 需要用户为每种可观测性数据类型/支柱定义数据源:

- `Logs`
- `Traces`
- `Metrics`
- `Sessions`

此配置可在应用程序内通过 `Team Settings -> Sources` 进行,日志配置示例如下:

<Image img={hyperdx_25} alt='HyperDX Source configuration' size='lg' />

每个数据源在创建时都需要至少指定一个表以及一组允许 HyperDX 查询数据的列。

如果使用 ClickStack 分发的[默认 OpenTelemetry (OTel) 架构](/observability/integrating-opentelemetry#out-of-the-box-schema),这些列可以为每个数据源自动推断。如果[修改架构](#clickhouse)或使用自定义架构,用户需要指定并更新这些映射。

:::note
ClickStack 分发的 ClickHouse 默认架构是由 [OTel 收集器的 ClickHouse 导出器](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter)创建的架构。这些列名与[此处](https://opentelemetry.io/docs/specs/otel/logs/data-model/)记录的 OTel 官方规范相对应。
:::

每个数据源可用的设置如下:

#### Logs {#logs}

| 设置                          | 描述                                                                                       | 必需 | 在默认架构中推断 | 推断值                                     |
| -------------------------------- | ------------------------------------------------------------------------------------------------- | -------- | -------------------------- | -------------------------------------------------- |
| `Name`                           | 数据源名称。                                                                                      | 是      | 否                         | –                                                  |
| `Server Connection`              | 服务器连接名称。                                                                           | 是      | 否                         | `Default`                                          |
| `Database`                       | ClickHouse 数据库名称。                                                                         | 是      | 是                        | `default`                                          |
| `Table`                          | 目标表名称。如果使用默认架构,设置为 `otel_logs`。                                  | 是      | 否                         |                                                    |
| `Timestamp Column`               | 作为主键一部分的日期时间列或表达式。                                    | 是      | 是                        | `TimestampTime`                                    |
| `Default Select`                 | 默认搜索结果中显示的列。                                                          | 是      | 是                        | `Timestamp`, `ServiceName`, `SeverityText`, `Body` |
| `Service Name Expression`        | 服务名称的表达式或列。                                                        | 是      | 是                        | `ServiceName`                                      |
| `Log Level Expression`           | 日志级别的表达式或列。                                                           | 是      | 是                        | `SeverityText`                                     |
| `Body Expression`                | 日志消息的表达式或列。                                                         | 是      | 是                        | `Body`                                             |
| `Log Attributes Expression`      | 自定义日志属性的表达式或列。                                                   | 是      | 是                        | `LogAttributes`                                    |
| `Resource Attributes Expression` | 资源级属性的表达式或列。                                               | 是      | 是                        | `ResourceAttributes`                               |
| `Displayed Timestamp Column`     | UI 显示中使用的时间戳列。                                                              | 是      | 是                        | `ResourceAttributes`                               |
| `Correlated Metric Source`       | 关联的指标数据源(例如 HyperDX metrics)。                                                      | 否       | 否                         | –                                                  |
| `Correlated Trace Source`        | 关联的追踪数据源(例如 HyperDX traces)。                                                        | 否       | 否                         | –                                                  |
| `Trace Id Expression`            | 用于提取追踪 ID 的表达式或列。                                                    | 是      | 是                        | `TraceId`                                          |
| `Span Id Expression`             | 用于提取跨度 ID 的表达式或列。                                                     | 是      | 是                        | `SpanId`                                           |
| `Implicit Column Expression`     | 未指定字段时用于全文搜索的列(Lucene 风格)。通常为日志正文。 | 是      | 是                        | `Body`                                             |

#### Traces {#traces}


| 设置                          | 描述                                                                                                                                        | 必需 | 在默认架构中推断 | 推断值                                                                                        |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------- | ----------------------------------------------------------------------------------------------------- |
| `Name`                           | 数据源名称。                                                                                                                                       | 是      | 否                         | –                                                                                                     |
| `Server Connection`              | 服务器连接名称。                                                                                                                            | 是      | 否                         | `Default`                                                                                             |
| `Database`                       | ClickHouse 数据库名称。                                                                                                                          | 是      | 是                        | `default`                                                                                             |
| `Table`                          | 目标表名称。如果使用默认架构,设置为 `otel_traces`。                                                                               | 是      | 是                        | -                                                                                                     |
| `Timestamp Column`               | 作为主键一部分的日期时间列或表达式。                                                                                     | 是      | 是                        | `Timestamp`                                                                                           |
| `Timestamp`                      | `Timestamp Column` 的别名。                                                                                                                      | 是      | 是                        | `Timestamp`                                                                                           |
| `Default Select`                 | 默认搜索结果中显示的列。                                                                                                           | 是      | 是                        | `Timestamp, ServiceName as service, StatusCode as level, round(Duration / 1e6) as duration, SpanName` |
| `Duration Expression`            | 用于计算 span 持续时间的表达式。                                                                                                          | 是      | 是                        | `Duration`                                                                                            |
| `Duration Precision`             | 持续时间表达式的精度(例如纳秒、微秒)。                                                                            | 是      | 是                        | ns                                                                                                    |
| `Trace Id Expression`            | 用于 trace ID 的表达式或列。                                                                                                                | 是      | 是                        | `TraceId`                                                                                             |
| `Span Id Expression`             | 用于 span ID 的表达式或列。                                                                                                                 | 是      | 是                        | `SpanId`                                                                                              |
| `Parent Span Id Expression`      | 用于父 span ID 的表达式或列。                                                                                                          | 是      | 是                        | `ParentSpanId`                                                                                        |
| `Span Name Expression`           | 用于 span 名称的表达式或列。                                                                                                               | 是      | 是                        | `SpanName`                                                                                            |
| `Span Kind Expression`           | 用于 span 类型的表达式或列(例如 client、server)。                                                                                          | 是      | 是                        | `SpanKind`                                                                                            |
| `Correlated Log Source`          | 可选。关联的日志数据源(例如 HyperDX 日志)。                                                                                                   | 否       | 否                         | –                                                                                                     |
| `Correlated Session Source`      | 可选。关联的会话数据源。                                                                                                                   | 否       | 否                         | –                                                                                                     |
| `Correlated Metric Source`       | 可选。关联的指标数据源(例如 HyperDX 指标)。                                                                                             | 否       | 否                         | –                                                                                                     |
| `Status Code Expression`         | 用于 span 状态码的表达式。                                                                                                               | 是      | 是                        | `StatusCode`                                                                                          |
| `Status Message Expression`      | 用于 span 状态消息的表达式。                                                                                                            | 是      | 是                        | `StatusMessage`                                                                                       |
| `Service Name Expression`        | 用于服务名称的表达式或列。                                                                                                         | 是      | 是                        | `ServiceName`                                                                                         |
| `Resource Attributes Expression` | 用于资源级属性的表达式或列。                                                                                                | 是      | 是                        | `ResourceAttributes`                                                                                  |
| `Event Attributes Expression`    | 用于事件属性的表达式或列。                                                                                                         | 是      | 是                        | `SpanAttributes`                                                                                      |
| `Span Events Expression`         | 用于提取 span 事件的表达式。通常是 `Nested` 类型列。这允许使用支持的语言 SDK 渲染异常堆栈跟踪。 | 是      | 是                        | `Events`                                                                                              |
| `Implicit Column Expression`     | 当未指定字段时用于全文搜索的列(Lucene 风格)。通常是日志正文。                                                  | 是      | 是                        | `SpanName`                                                                                            |

#### 指标 {#metrics}


| 设置                    | 描述                                             | 必需     | 在默认模式中推断             | 推断值                    |
| ----------------------- | ------------------------------------------------ | -------- | -------------------------- | ------------------------ |
| `Name`                  | 数据源名称。                                      | 是       | 否                         | –                        |
| `Server Connection`     | 服务器连接名称。                                  | 是       | 否                         | `Default`                |
| `Database`              | ClickHouse 数据库名称。                           | 是       | 是                         | `default`                |
| `Gauge Table`           | 存储仪表盘类型指标的表。                             | 是       | 否                         | `otel_metrics_gauge`     |
| `Histogram Table`       | 存储直方图类型指标的表。                           | 是       | 否                         | `otel_metrics_histogram` |
| `Sum Table`             | 存储求和类型(计数器)指标的表。                      | 是       | 否                         | `otel_metrics_sum`       |
| `Correlated Log Source` | 可选。关联的日志源(例如 HyperDX 日志)。             | 否       | 否                         | –                        |

#### 会话 {#settings}

| 设置                              | 描述                                                                                                     | 必需     | 在默认模式中推断             | 推断值                |
| -------------------------------- | -------------------------------------------------------------------------------------------------------- | -------- | -------------------------- | -------------------- |
| `Name`                           | 数据源名称。                                                                                              | 是       | 否                         | –                    |
| `Server Connection`              | 服务器连接名称。                                                                                          | 是       | 否                         | `Default`            |
| `Database`                       | ClickHouse 数据库名称。                                                                                   | 是       | 是                         | `default`            |
| `Table`                          | 会话数据的目标表。目标表名称。如果使用默认模式,请设置为 `hyperdx_sessions`。                                    | 是       | 是                         | -                    |
| `Timestamp Column`               | 作为主键一部分的日期时间列或表达式。                                                                         | 是       | 是                         | `TimestampTime`      |
| `Log Attributes Expression`      | 用于从会话数据中提取日志级别属性的表达式。                                                                    | 是       | 是                         | `LogAttributes`      |
| `LogAttributes`                  | 用于存储日志属性的别名或字段引用。                                                                           | 是       | 是                         | `LogAttributes`      |
| `Resource Attributes Expression` | 用于提取资源级元数据的表达式。                                                                              | 是       | 是                         | `ResourceAttributes` |
| `Correlated Trace Source`        | 可选。用于会话关联的链接追踪源。                                                                            | 否       | 否                         | –                    |
| `Implicit Column Expression`     | 未指定字段时用于全文搜索的列(例如 Lucene 风格的查询解析)。                                                    | 是       | 是                         | `Body`               |

### 关联数据源 {#correlated-sources}

要在 ClickStack 中启用完整的跨源关联,用户必须为日志、追踪、指标和会话配置关联数据源。这使 HyperDX 能够关联相关数据,并在呈现事件时提供丰富的上下文信息。

- `Logs`:可以与追踪和指标关联。
- `Traces`:可以与日志、会话和指标关联。
- `Metrics`:可以与日志关联。
- `Sessions`:可以与追踪关联。

设置这些关联可以启用多项功能。例如,HyperDX 可以在追踪旁边呈现相关日志,或显示与会话关联的指标异常。

例如,以下是配置了关联数据源的日志源:

<Image img={hyperdx_26} alt='HyperDX Source correlated' size='md' />

### 应用程序配置设置 {#application-configuration-settings}

:::note ClickHouse Cloud 中的 HyperDX
当 HyperDX 在 ClickHouse Cloud 中托管时,这些设置无法修改。
:::

- `HYPERDX_API_KEY`
  - **默认值:** 无(必需)
  - **描述:** HyperDX API 的身份验证密钥。
  - **指导:**
  - 遥测和日志记录所必需
  - 在本地开发中,可以是任何非空值
  - 对于生产环境,请使用安全、唯一的密钥
  - 可以在创建账户后从团队设置页面获取

- `HYPERDX_LOG_LEVEL`
  - **默认值:** `info`
  - **描述:** 设置日志详细程度级别。
  - **选项:** `debug`、`info`、`warn`、`error`
  - **指导:**
  - 使用 `debug` 进行详细故障排查
  - 使用 `info` 进行正常操作
  - 在生产环境中使用 `warn` 或 `error` 以减少日志量

- `HYPERDX_API_PORT`
  - **默认值:** `8000`
  - **描述:** HyperDX API 服务器的端口。
  - **指导:**
  - 确保此端口在您的主机上可用
  - 如果存在端口冲突请更改
  - 必须与 API 客户端配置中的端口匹配


- `HYPERDX_APP_PORT`
  - **默认值：** `8000`
  - **说明：** HyperDX 前端应用的端口。
  - **指导：**
  - 确保此端口在宿主机上可用
  - 如有端口冲突则进行更改
  - 必须可从浏览器访问

- `HYPERDX_APP_URL`
  - **默认值：** `http://localhost`
  - **说明：** 前端应用的基础 URL。
  - **指导：**
  - 在生产环境中设置为你的域名
  - 必须包含协议（http/https）
  - 不要包含结尾斜杠

- `MONGO_URI`
  - **默认值：** `mongodb://db:27017/hyperdx`
  - **说明：** MongoDB 连接字符串。
  - **指导：**
  - 使用 Docker 进行本地开发时使用默认值
  - 生产环境中使用安全的连接字符串
  - 如需要，包含认证信息
  - 示例：`mongodb://user:pass@host:port/db`

- `MINER_API_URL`
  - **默认值：** `http://miner:5123`
  - **说明：** 日志模式挖掘服务的 URL。
  - **指导：**
  - 使用 Docker 进行本地开发时使用默认值
  - 生产环境中设置为你的 miner 服务 URL
  - 必须可从 API 服务访问

- `FRONTEND_URL`
  - **默认值：** `http://localhost:3000`
  - **说明：** 前端应用的 URL。
  - **指导：**
  - 本地开发时使用默认值
  - 生产环境中设置为你的域名
  - 必须可从 API 服务访问

- `OTEL_SERVICE_NAME`
  - **默认值：** `hdx-oss-api`
  - **说明：** OpenTelemetry 插桩的服务名称。
  - **指导：**
  - 为你的 HyperDX 服务使用具有描述性的名称。适用于 HyperDX 自行插桩的场景。
  - 有助于在遥测数据中识别 HyperDX 服务

- `NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT`
  - **默认值：** `http://localhost:4318`
  - **说明：** OpenTelemetry 收集器端点。
  - **指导：**
  - 在 HyperDX 自行插桩时适用
  - 本地开发时使用默认值
  - 生产环境中设置为你的收集器 URL
  - 必须可从你的 HyperDX 服务访问

- `USAGE_STATS_ENABLED`
  - **默认值：** `true`
  - **说明：** 用于开启或关闭使用统计数据收集功能。
  - **指导：**
  - 设为 `false` 以禁用使用情况跟踪
  - 对隐私敏感的部署很有用
  - 默认值为 `true`，以便更好地改进产品

- `IS_OSS`
  - **默认值：** `true`
  - **说明：** 指示是否以 OSS 模式运行。
  - **指导：**
  - 开源部署保持为 `true`
  - 企业部署设为 `false`
  - 会影响功能可用性

- `IS_LOCAL_MODE`
  - **默认值：** `false`
  - **说明：** 指示是否以本地模式运行。
  - **指导：**
  - 本地开发时设为 `true`
  - 会禁用某些生产功能
  - 有助于测试和开发

- `EXPRESS_SESSION_SECRET`
  - **默认值：** `hyperdx is cool 👋`
  - **说明：** Express 会话管理使用的密钥。
  - **指导：**
  - 在生产环境中更改
  - 使用强随机字符串
  - 请妥善保密并确保安全

- `ENABLE_SWAGGER`
  - **默认值：** `false`
  - **说明：** 用于开启或关闭 Swagger API 文档。
  - **指导：**
  - 设为 `true` 以启用 API 文档
  - 对开发和测试很有用
  - 生产环境中应禁用

- `BETA_CH_OTEL_JSON_SCHEMA_ENABLED`
  - **默认值：** `false`
  - **说明：** 启用 HyperDX 对 JSON 类型的 Beta 支持。另见 [`OTEL_AGENT_FEATURE_GATE_ARG`](#otel-collector) 以在 OTel 收集器中启用 JSON 支持。
  - **指导：**
  - 设为 `true` 以在 ClickStack 中启用 JSON 支持。



## OpenTelemetry 收集器 {#otel-collector}

详情请参阅 ["ClickStack OpenTelemetry Collector"](/use-cases/observability/clickstack/ingesting-data/otel-collector)。

- `CLICKHOUSE_ENDPOINT`
  - **默认值:** 独立镜像时为 _无(必需)_。如果是一体化或 Docker Compose 分发版,则设置为集成的 ClickHouse 实例。
  - **描述:** 用于导出遥测数据的 ClickHouse 实例的 HTTPS URL。
  - **指导:**
    - 必须是包含端口的完整 HTTPS 端点(例如 `https://clickhouse.example.com:8443`)
    - 收集器向 ClickHouse 发送数据时必需

- `CLICKHOUSE_USER`
  - **默认值:** `default`
  - **描述:** 用于向 ClickHouse 实例进行身份验证的用户名。
  - **指导:**
    - 确保用户具有 `INSERT` 和 `CREATE TABLE` 权限
    - 建议为数据摄取创建专用用户

- `CLICKHOUSE_PASSWORD`
  - **默认值:** _无(启用身份验证时必需)_
  - **描述:** 指定 ClickHouse 用户的密码。
  - **指导:**
    - 如果用户账户设置了密码则必需
    - 在生产部署中通过密钥安全存储

- `HYPERDX_LOG_LEVEL`
  - **默认值:** `info`
  - **描述:** 收集器的日志详细级别。
  - **指导:**
    - 接受 `debug`、`info`、`warn`、`error` 等值
    - 故障排查时使用 `debug`

- `OPAMP_SERVER_URL`
  - **默认值:** 独立镜像时为 _无(必需)_。如果是一体化或 Docker Compose 分发版,则指向已部署的 HyperDX 实例。
  - **描述:** 用于管理收集器的 OpAMP 服务器的 URL(例如 HyperDX 实例)。默认端口为 `4320`。
  - **指导:**
    - 必须指向您的 HyperDX 实例
    - 启用动态配置和安全摄取

- `HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE`
  - **默认值:** `default`
  - **描述:** 收集器写入遥测数据的 ClickHouse 数据库。
  - **指导:**
    - 使用自定义数据库名称时设置
    - 确保指定用户有权访问此数据库

- `OTEL_AGENT_FEATURE_GATE_ARG`
  - **默认值:** `<空字符串>`
  - **描述:** 启用收集器中的功能标志。如果设置为 `--feature-gates=clickhouse.json`,则启用收集器中 JSON 类型的 Beta 支持,确保使用该类型创建模式。另请参阅 [`BETA_CH_OTEL_JSON_SCHEMA_ENABLED`](#hyperdx) 以在 HyperDX 中启用 JSON 支持。
  - **指导:**
  - 设置为 `true` 以在 ClickStack 中启用 JSON 支持。


## ClickHouse {#clickhouse}

ClickStack 附带了一个为多 TB 级规模设计的默认 ClickHouse 配置,用户可以根据自身工作负载自由修改和优化该配置。

为了有效调优 ClickHouse,用户应当理解关键的存储概念,例如 [parts](/parts)、[partitions](/partitions)、[shards and replicas](/shards),以及 [merges](/merges) 在插入时的执行机制。 我们建议了解 [primary indices](/primary-indexes)、[sparse secondary indices](/optimize/skipping-indexes) 和数据跳过索引的基础知识,以及 [managing data lifecycle](/observability/managing-data) 的相关技术,例如使用 TTL 生命周期。

ClickStack 支持 [schema customization](/use-cases/observability/schema-design) - 用户可以修改列类型、提取新字段(例如从日志中提取)、应用编解码器和字典,以及使用投影加速查询。

此外,物化视图可用于 [transform or filter data during ingestion](/use-cases/observability/schema-design#materialized-columns),前提是数据写入视图的源表,且应用程序从目标表读取。

有关更多详细信息,请参阅 ClickHouse 文档中关于模式设计、索引策略和数据管理最佳实践的内容 - 其中大部分可直接应用于 ClickStack 部署。
