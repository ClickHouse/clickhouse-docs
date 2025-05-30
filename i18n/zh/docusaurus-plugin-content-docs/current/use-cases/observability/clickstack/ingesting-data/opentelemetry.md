---
'slug': '/use-cases/observability/clickstack/ingesting-data/opentelemetry'
'pagination_prev': null
'pagination_next': null
'description': '使用 OpenTelemetry 进行数据摄取以支持 ClickStack - ClickHouse 可观察性栈'
'title': '使用 OpenTelemetry 进行数据摄取'
---

import Image from '@theme/IdealImage';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';

所有数据通过 **OpenTelemetry (OTel) 收集器** 实例被输入到 ClickStack 中，该实例作为日志、指标、追踪和会话数据的主要入口点。我们建议为此实例使用官方 [ClickStack 发行版](#installing-otel-collector) 的收集器。

用户通过 [语言 SDKs](/use-cases/observability/clickstack/sdks) 或通过收集基础设施指标和日志的数据收集代理（例如以 [代理](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles) 角色运行的 OTel 收集器或其他技术，如 [Fluentd](https://www.fluentd.org/) 或 [Vector](https://vector.dev/)）向该收集器发送数据。

## 安装 ClickStack OpenTelemetry 收集器 {#installing-otel-collector}

ClickStack OpenTelemetry 收集器包含在大多数 ClickStack 发行版中，包括：

- [一体化](/use-cases/observability/clickstack/deployment/all-in-one)
- [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose)
- [Helm](/use-cases/observability/clickstack/deployment/helm)

### 独立部署 {#standalone}

ClickStack OTel 收集器也可以独立部署，与堆栈的其他组件无关。

如果您使用的是 [仅限 HyperDX](/use-cases/observability/clickstack/deployment/hyperdx-only) 发行版，则需要自己将数据发送到 ClickHouse。这可以通过以下方式实现：

- 运行自己的 OpenTelemetry 收集器并指向 ClickHouse - 请参见下文。
- 使用其他工具（如 [Vector](https://vector.dev/)、[Fluentd](https://www.fluentd.org/) 等）直接发送到 ClickHouse，甚至使用默认的 [OTel contrib 收集器发行版](https://github.com/open-telemetry/opentelemetry-collector-contrib)。

:::note 我们建议使用 ClickStack OpenTelemetry 收集器
这使用户能够受益于标准化的数据输入、强制的架构以及与 HyperDX UI 的开箱即用兼容性。使用默认架构可以实现自动源检测和预配置列映射。
:::

有关更多详细信息，请参见 ["部署收集器"](/use-cases/observability/clickstack/ingesting-data/otel-collector)。

## 发送 OpenTelemetry 数据 {#sending-otel-data}

要将数据发送到 ClickStack，请将您的 OpenTelemetry 工具指向 OpenTelemetry 收集器提供的以下端点：

- **HTTP (OTLP):** `http://localhost:4318`
- **gRPC (OTLP):** `localhost:4317`

对于大多数支持 OpenTelemetry 的 [语言 SDKs](/use-cases/observability/clickstack/sdks) 和遥测库，用户只需在您的应用程序中设置 `OTEL_EXPORTER_OTLP_ENDPOINT` 环境变量：

```bash
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

此外，还需要包含一个包含 API 输入密钥的授权头。您可以在 HyperDX 应用程序的 `团队设置 → API 密钥` 中找到该密钥。

<Image img={ingestion_key} alt="输入密钥" size="lg"/>

对于语言 SDKs，可以通过 `init` 函数或通过 `OTEL_EXPORTER_OTLP_HEADERS` 环境变量来设置，例如：

```bash
OTEL_EXPORTER_OTLP_HEADERS='authorization=<YOUR_INGESTION_API_KEY>'
```

代理同样应在任何 OTLP 通信中包含此授权头。例如，如果在代理角色中部署 [OTel 收集器的 contrib 发行版](https://github.com/open-telemetry/opentelemetry-collector-contrib)，它们可以使用 OTLP 导出器。下面是一个示例代理配置，消费此 [结构化日志文件](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-structured.log.gz)，请注意需要指定授权密钥 - 请参见 `<YOUR_API_INGESTION_KEY>`。

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
