---
'slug': '/use-cases/observability/clickstack/deployment/hyperdx-clickhouse-cloud'
'title': 'ClickHouse Cloud'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 1
'description': '使用 ClickHouse Cloud 部署 ClickStack'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import BetaBadge from '@theme/badges/BetaBadge';
import cloud_connect from '@site/static/images/use-cases/observability/clickhouse_cloud_connection.png';
import hyperdx_cloud from '@site/static/images/use-cases/observability/hyperdx_cloud.png';
import hyperdx_cloud_landing from '@site/static/images/use-cases/observability/hyperdx_cloud_landing.png';
import hyperdx_cloud_datasource from '@site/static/images/use-cases/observability/hyperdx_cloud_datasource.png';
import hyperdx_create_new_source from '@site/static/images/use-cases/observability/hyperdx_create_new_source.png';
import hyperdx_create_trace_datasource from '@site/static/images/use-cases/observability/hyperdx_create_trace_datasource.png';

<PrivatePreviewBadge/>

该选项旨在为使用 ClickHouse Cloud 的用户提供服务。在这种部署模式下，ClickHouse 和 HyperDX 都托管在 ClickHouse Cloud 中，从而减少用户自我托管的组件数量。

除了减少基础设施管理外，此部署模式还确保身份验证与 ClickHouse Cloud SSO/SAML 集成。与自托管部署不同，此模式无需配置 MongoDB 实例来存储应用程序状态，例如仪表板、已保存的搜索、用户设置和警报。

在此模式下，数据摄取完全由用户负责。您可以使用自己托管的 OpenTelemetry 收集器、客户端库的直接摄取、ClickHouse 原生表引擎（例如 Kafka 或 S3）、ETL 管道或 ClickPipes（ClickHouse Cloud 的托管摄取服务）将数据摄取到 ClickHouse Cloud。这种方法提供了操作 ClickStack 最简单且性能最佳的方式。

### 适用场景 {#suitable-for}

该部署模式非常适合以下场景：

1. 您已经在 ClickHouse Cloud 中拥有可观察性数据，并希望使用 HyperDX 对其进行可视化。
2. 您运营着大型可观察性部署，需要 ClickStack 和 ClickHouse Cloud 提供的专用性能和可扩展性。
3. 您已经在分析中使用 ClickHouse Cloud，希望通过 ClickStack 插件库为应用程序提供监控功能——将数据发送到同一集群。在这种情况下，我们建议使用 [warehouses](/cloud/reference/warehouses) 来隔离可观察性工作负载的计算。

## 部署步骤 {#deployment-steps}

以下指南假设您已创建 ClickHouse Cloud 服务。如果您尚未创建任何服务，请按照我们的快速入门指南中的 ["创建 ClickHouse 服务"](/getting-started/quick-start/cloud#1-create-a-clickhouse-service) 步骤进行操作。

<VerticalStepper headerLevel="h3">

### 复制服务凭据（可选） {#copy-service-credentials}

**如果您希望可视化已有的可观察性事件，则可以跳过此步骤。**

导航到主要服务列表，选择您打算进行可视化的可观察性事件的服务。

从导航菜单中按 `Connect` 按钮。将打开一个模态窗口，提供您服务的凭据以及通过不同接口和语言进行连接的一组指令。从下拉菜单中选择 `HTTPS` 并记录连接端点和凭据。

<Image img={cloud_connect} alt="ClickHouse Cloud connect" size="lg"/>

### 部署 Open Telemetry 收集器（可选） {#deploy-otel-collector} 

**如果您希望可视化已有的可观察性事件，则可以跳过此步骤。**

此步骤确保使用 Open Telemetry (OTel) 模式创建表，这样可以无缝地用于在 HyperDX 中创建数据源。它还提供了一个 OLTP 端点，可用于加载 [示例数据集](/use-cases/observability/clickstack/sample-datasets) 并将 OTel 事件发送至 ClickStack。

:::note 使用标准 Open Telemetry 收集器
以下指令使用 OTel 收集器的标准发行版，而不是 ClickStack 发行版。后者需要 OpAMP 服务器进行配置。目前在私人预览中不支持此功能。以下配置复制了 ClickStack 收集器的发行版使用的版本，提供了一个 OTLP 端点，可以将事件发送到此端点。
:::

下载 OTel 收集器的配置：

```bash
curl -O https://raw.githubusercontent.com/ClickHouse/clickhouse-docs/refs/heads/main/docs/use-cases/observability/clickstack/deployment/_snippets/otel-cloud-config.yaml
```

<details>
<summary>otel-cloud-config.yaml</summary>

```yaml file=docs/use-cases/observability/clickstack/deployment/_snippets/otel-cloud-config.yaml
receivers:
  otlp/hyperdx:
    protocols:
      grpc:
        include_metadata: true
        endpoint: '0.0.0.0:4317'
      http:
        cors:
          allowed_origins: ['*']
          allowed_headers: ['*']
        include_metadata: true
        endpoint: '0.0.0.0:4318'
processors:
  transform:
    log_statements:
      - context: log
        error_mode: ignore
        statements:
          # JSON parsing: Extends log attributes with the fields from structured log body content, either as an OTEL map or
          # as a string containing JSON content.
          - set(log.cache, ExtractPatterns(log.body, "(?P<0>(\\{.*\\}))")) where
            IsString(log.body)
          - merge_maps(log.attributes, ParseJSON(log.cache["0"]), "upsert")
            where IsMap(log.cache)
          - flatten(log.attributes) where IsMap(log.cache)
          - merge_maps(log.attributes, log.body, "upsert") where IsMap(log.body)
      - context: log
        error_mode: ignore
        conditions:
          - severity_number == 0 and severity_text == ""
        statements:
          # Infer: extract the first log level keyword from the first 256 characters of the body
          - set(log.cache["substr"], log.body.string) where Len(log.body.string)
            < 256
          - set(log.cache["substr"], Substring(log.body.string, 0, 256)) where
            Len(log.body.string) >= 256
          - set(log.cache, ExtractPatterns(log.cache["substr"],
            "(?i)(?P<0>(alert|crit|emerg|fatal|error|err|warn|notice|debug|dbug|trace))"))
          # Infer: detect FATAL
          - set(log.severity_number, SEVERITY_NUMBER_FATAL) where
            IsMatch(log.cache["0"], "(?i)(alert|crit|emerg|fatal)")
          - set(log.severity_text, "fatal") where log.severity_number ==
            SEVERITY_NUMBER_FATAL
          # Infer: detect ERROR
          - set(log.severity_number, SEVERITY_NUMBER_ERROR) where
            IsMatch(log.cache["0"], "(?i)(error|err)")
          - set(log.severity_text, "error") where log.severity_number ==
            SEVERITY_NUMBER_ERROR
          # Infer: detect WARN
          - set(log.severity_number, SEVERITY_NUMBER_WARN) where
            IsMatch(log.cache["0"], "(?i)(warn|notice)")
          - set(log.severity_text, "warn") where log.severity_number ==
            SEVERITY_NUMBER_WARN
          # Infer: detect DEBUG
          - set(log.severity_number, SEVERITY_NUMBER_DEBUG) where
            IsMatch(log.cache["0"], "(?i)(debug|dbug)")
          - set(log.severity_text, "debug") where log.severity_number ==
            SEVERITY_NUMBER_DEBUG
          # Infer: detect TRACE
          - set(log.severity_number, SEVERITY_NUMBER_TRACE) where
            IsMatch(log.cache["0"], "(?i)(trace)")
          - set(log.severity_text, "trace") where log.severity_number ==
            SEVERITY_NUMBER_TRACE
          # Infer: else
          - set(log.severity_text, "info") where log.severity_number == 0
          - set(log.severity_number, SEVERITY_NUMBER_INFO) where log.severity_number == 0
      - context: log
        error_mode: ignore
        statements:
          # Normalize the severity_text case
          - set(log.severity_text, ConvertCase(log.severity_text, "lower"))
  resourcedetection:
    detectors:
      - env
      - system
      - docker
    timeout: 5s
    override: false
  batch:
  memory_limiter:
    # 80% of maximum memory up to 2G, adjust for low memory environments
    limit_mib: 1500
    # 25% of limit up to 2G, adjust for low memory environments
    spike_limit_mib: 512
    check_interval: 5s
connectors:
  routing/logs:
    default_pipelines: [logs/out-default]
    error_mode: ignore
    table:
      - context: log
        statement: route() where IsMatch(attributes["rr-web.event"], ".*")
        pipelines: [logs/out-rrweb]
exporters:
  debug:
    verbosity: detailed
    sampling_initial: 5
    sampling_thereafter: 200
  clickhouse/rrweb:
    database: ${env:CLICKHOUSE_DATABASE}
    endpoint: ${env:CLICKHOUSE_ENDPOINT}
    password: ${env:CLICKHOUSE_PASSWORD}
    username: ${env:CLICKHOUSE_USER}
    ttl: 720h
    logs_table_name: hyperdx_sessions
    timeout: 5s
    retry_on_failure:
      enabled: true
      initial_interval: 5s
      max_interval: 30s
      max_elapsed_time: 300s
  clickhouse:
    database: ${env:CLICKHOUSE_DATABASE}
    endpoint: ${env:CLICKHOUSE_ENDPOINT}
    password: ${env:CLICKHOUSE_PASSWORD}
    username: ${env:CLICKHOUSE_USER}
    ttl: 720h
    timeout: 5s
    retry_on_failure:
      enabled: true
      initial_interval: 5s
      max_interval: 30s
      max_elapsed_time: 300s
extensions:
  health_check:
    endpoint: :13133
service:
  pipelines:
    traces:
      receivers: [otlp/hyperdx]
      processors: [memory_limiter, batch]
      exporters: [clickhouse]
    metrics:
      receivers: [otlp/hyperdx]
      processors: [memory_limiter, batch]
      exporters: [clickhouse]
    logs/in:
      receivers: [otlp/hyperdx]
      exporters: [routing/logs]
    logs/out-default:
      receivers: [routing/logs]
      processors: [memory_limiter, transform, batch]
      exporters: [clickhouse]
    logs/out-rrweb:
      receivers: [routing/logs]
      processors: [memory_limiter, batch]
      exporters: [clickhouse/rrweb]

```

</details>

使用以下 Docker 命令部署收集器，将各环境变量设置为之前记录的连接设置，并根据您的操作系统使用适当的命令。

```bash

# modify to your cloud endpoint
export CLICKHOUSE_ENDPOINT=
export CLICKHOUSE_PASSWORD=

# optionally modify 
export CLICKHOUSE_DATABASE=default


# osx
docker run --rm -it \
  -p 4317:4317 -p 4318:4318 \
  -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} \
  -e CLICKHOUSE_USER=default \
  -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} \
  -e CLICKHOUSE_DATABASE=${CLICKHOUSE_DATABASE} \
  --user 0:0 \
  -v "$(pwd)/otel-cloud-collector.yaml":/etc/otel/config.yaml \
  -v /var/log:/var/log:ro \
  -v /private/var/log:/private/var/log:ro \
  otel/opentelemetry-collector-contrib:latest \
  --config /etc/otel/config.yaml


# linux command


# docker run --network=host --rm -it \

#   -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} \

#   -e CLICKHOUSE_USER=default \

#   -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} \

#   -e CLICKHOUSE_DATABASE=${CLICKHOUSE_DATABASE} \

#   --user 0:0 \

#   -v "$(pwd)/otel-cloud-config.yaml":/etc/otel/config.yaml \

#   -v /var/log:/var/log:ro \

#   -v /private/var/log:/private/var/log:ro \

#   otel/opentelemetry-collector-contrib:latest \

#   --config /etc/otel/config.yaml
```

:::note
在生产环境中，我们建议为数据摄取创建一个专用用户，并限制访问数据库和表的权限。有关详细信息，请参见 ["数据库和摄取用户"](/use-cases/observability/clickstack/production#database-ingestion-user)。
:::

### 连接到 HyperDX {#connect-to-hyperdx}

选择您的服务，然后从左侧菜单中选择 `HyperDX`。

<Image img={hyperdx_cloud} alt="ClickHouse Cloud HyperDX" size="lg"/>

您无需创建用户，将自动进行身份验证，然后提示您创建数据源。

对于仅希望探索 HyperDX 界面的用户，我们建议使用我们的 [示例数据集](/use-cases/observability/clickstack/sample-datasets)，这些数据集使用 OTel 数据。

<Image img={hyperdx_cloud_landing} alt="ClickHouse Cloud HyperDX Landing" size="lg"/>

### 创建数据源 {#create-a-datasource}

HyperDX 是 Open Telemetry 原生的，但并不是 Open Telemetry 专有的 - 用户可以根据需要使用自己的表模式。

#### 使用 Open Telemetry 模式 {#using-otel-schemas}

如果您使用上述 OTel 收集器在 ClickHouse 内创建数据库和表，则保留创建源模型中的所有默认值，在 `Table` 字段中填写 `otel_logs` 以创建日志源。所有其他设置应自动检测，允许您单击 `Save New Source`。

<Image img={hyperdx_cloud_datasource} alt="ClickHouse Cloud HyperDX Datasource" size="lg"/>

要为跟踪和 OTel 指标创建源，用户可以从顶部菜单选择 `Create New Source`。

<Image img={hyperdx_create_new_source} alt="HyperDX create new source" size="lg"/>

在此处，选择所需的源类型，然后选择适当的表，例如，对于跟踪，选择表 `otel_traces`。所有设置都应自动检测。

<Image img={hyperdx_create_trace_datasource} alt="HyperDX create trace source" size="lg"/>

:::note 关联源
请注意，ClickStack 中的不同数据源，例如日志和跟踪，可以相互关联。为了实现这一点，每个源都需要额外配置。例如，在日志源中，您可以指定相应的跟踪源，而在跟踪源中，则可以指定相应的日志源。有关详细信息，请参见 ["关联源"](/use-cases/observability/clickstack/config#correlated-sources)。
:::

#### 使用自定义模式 {#using-custom-schemas}

希望将 HyperDX 连接到现有服务且拥有数据的用户可以根据需要完成数据库和表的设置。如果数据表符合 ClickHouse 的 Open Telemetry 模式，设置将被自动检测。

如果使用您自己的模式，我们建议创建日志源，并确保指定必需的字段 - 有关详细信息，请参见 ["日志源设置"](/use-cases/observability/clickstack/config#logs)。

</VerticalStepper>

## JSON 类型支持 {#json-type-support}

<BetaBadge/>

ClickStack 从版本 `2.0.4` 开始支持 [JSON 类型](/interfaces/formats/JSON) 的测试版。

有关此类型的好处，请参见 [JSON 类型的好处](/use-cases/observability/clickstack/ingesting-data/otel-collector#benefits-json-type)。

为了启用对 JSON 类型的支持，用户必须设置以下环境变量：

- `OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json'` - 在 OTel 收集器中启用支持，确保使用 JSON 类型创建模式。

此外，用户应联系 support@clickhouse.com 确保其 ClickHouse Cloud 服务上启用了 JSON。
