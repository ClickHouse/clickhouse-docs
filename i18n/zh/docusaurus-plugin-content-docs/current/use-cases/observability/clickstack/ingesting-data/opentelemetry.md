---
'slug': '/use-cases/observability/clickstack/ingesting-data/opentelemetry'
'pagination_prev': null
'pagination_next': null
'description': '使用 OpenTelemetry 进行数据摄取以支持 ClickStack - ClickHouse 可观测性栈'
'title': '使用 OpenTelemetry 进行数据摄取'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';

所有数据都通过一个 **OpenTelemetry (OTel) 收集器** 实例导入到 ClickStack，该实例作为日志、指标、跟踪和会话数据的主要入口点。我们推荐为此实例使用官方的 [ClickStack 分发版](#installing-otel-collector) 收集器。

用户可以通过 [语言 SDK](/use-cases/observability/clickstack/sdks) 向这个收集器发送数据，或通过收集基础设施指标和日志的数据收集代理（例如，OTel 收集器在 [代理](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles) 角色或其他技术如 [Fluentd](https://www.fluentd.org/) 或 [Vector](https://vector.dev/)）进行发送。

## 安装 ClickStack OpenTelemetry 收集器 {#installing-otel-collector}

ClickStack OpenTelemetry 收集器包含在大多数 ClickStack 分发版中，包括：

- [一体化版](/use-cases/observability/clickstack/deployment/all-in-one)
- [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose)
- [Helm](/use-cases/observability/clickstack/deployment/helm)

### 独立部署 {#standalone}

ClickStack OTel 收集器也可以独立部署，与堆栈的其他组件无关。

如果你使用的是 [仅 HyperDX](/use-cases/observability/clickstack/deployment/hyperdx-only) 分发版，你需要自己负责将数据送入 ClickHouse。可以通过以下方式完成：

- 运行你自己的 OpenTelemetry 收集器并将其指向 ClickHouse - 请见下文。
- 使用其他工具直接发送到 ClickHouse，例如 [Vector](https://vector.dev/)、[Fluentd](https://www.fluentd.org/) 等，或甚至是默认的 [OTel contrib 收集器分发版](https://github.com/open-telemetry/opentelemetry-collector-contrib)。

:::note 我们建议使用 ClickStack OpenTelemetry 收集器
这使得用户能够受益于标准化的导入、强制执行的架构以及与 HyperDX UI 的开箱即用兼容性。使用默认架构可以自动检测源并预配置列映射。
:::

有关更多详细信息，请参见 ["部署收集器"](/use-cases/observability/clickstack/ingesting-data/otel-collector)。

## 发送 OpenTelemetry 数据 {#sending-otel-data}

要将数据发送到 ClickStack，请将你的 OpenTelemetry 仪器指向 OpenTelemetry 收集器提供的以下端点：

- **HTTP (OTLP):** `http://localhost:4318`
- **gRPC (OTLP):** `localhost:4317`

对于大多数支持 OpenTelemetry 的 [语言 SDK](/use-cases/observability/clickstack/sdks) 和遥测库，用户可以简单地在应用程序中设置 `OTEL_EXPORTER_OTLP_ENDPOINT` 环境变量：

```shell
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

此外，需要包含一个包含 API 导入密钥的授权头。您可以在 HyperDX 应用的 `团队设置 → API 密钥` 中找到该密钥。

<Image img={ingestion_key} alt="导入密钥" size="lg"/>

对于语言 SDK，可以通过 `init` 函数或 `OTEL_EXPORTER_OTLP_HEADERS` 环境变量设置，例如：

```shell
OTEL_EXPORTER_OTLP_HEADERS='authorization=<YOUR_INGESTION_API_KEY>'
```

代理也应在任何 OTLP 通信中包含此授权头。例如，如果在代理角色中部署 [OTel 收集器的 contrib 分发版](https://github.com/open-telemetry/opentelemetry-collector-contrib)，他们可以使用 OTLP 导出器。下面是一个消耗此 [结构化日志文件](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-structured.log.gz) 的示例代理配置。注意需要指定授权密钥 - 参考 `<YOUR_API_INGESTION_KEY>`。

```yaml

# clickhouse-agent-config.yaml
receivers:
  filelog:
    include:
      - /opt/data/logs/access-structured.log
    start_at: beginning
    operators:
      - type: json_parser
        timestamp:
          parse_from: attributes.time_local
          layout: '%Y-%m-%d %H:%M:%S'
exporters:
  # HTTP setup
  otlphttp/hdx:
    endpoint: 'http://localhost:4318'
    headers:
      authorization: <YOUR_API_INGESTION_KEY>
    compression: gzip

  # gRPC setup (alternative)
  otlp/hdx:
    endpoint: 'localhost:4317'
    headers:
      authorization: <YOUR_API_INGESTION_KEY>
    compression: gzip
processors:
  batch:
    timeout: 5s
    send_batch_size: 1000
service:
  telemetry:
    metrics:
      address: 0.0.0.0:9888 # Modified as 2 collectors running on same host
  pipelines:
    logs:
      receivers: [filelog]
      processors: [batch]
      exporters: [otlphttp/hdx]
```
