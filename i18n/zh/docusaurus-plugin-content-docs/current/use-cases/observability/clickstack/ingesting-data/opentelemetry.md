---
slug: /use-cases/observability/clickstack/ingesting-data/opentelemetry
pagination_prev: null
pagination_next: null
description: '使用 OpenTelemetry 为 ClickStack 摄取数据 - ClickHouse 可观测性栈'
title: '通过 OpenTelemetry 摄取数据'
doc_type: 'guide'
keywords: ['clickstack', 'opentelemetry', 'traces', 'observability', 'telemetry']
---

import Image from '@theme/IdealImage';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';

所有数据都会通过一个 **OpenTelemetry (OTel) collector** 实例摄取到 ClickStack 中，该实例作为日志、指标、追踪和会话数据的主要入口。我们建议在该实例上使用官方提供的 [ClickStack 发行版](#installing-otel-collector) 中的 collector。

用户可以通过[语言 SDKS](/use-cases/observability/clickstack/sdks) 将数据发送到此 collector，或者通过收集基础设施指标和日志的数据采集代理发送数据（例如以 [agent](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles) 角色运行的 OTel collectors，或其他技术，例如 [Fluentd](https://www.fluentd.org/) 或 [Vector](https://vector.dev/)）。


## 安装 ClickStack OpenTelemetry collector {#installing-otel-collector}

ClickStack OpenTelemetry collector 已包含在大多数 ClickStack 发行版中，包括：

- [All-in-One](/use-cases/observability/clickstack/deployment/all-in-one)
- [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose)
- [Helm](/use-cases/observability/clickstack/deployment/helm)

### 独立部署 {#standalone}

ClickStack OTel collector 也可以以独立方式部署，而不依赖于 ClickStack 栈中的其他组件。

如果您使用的是 [HyperDX-only](/use-cases/observability/clickstack/deployment/hyperdx-only) 发行版，则需要自行负责将数据摄取到 ClickHouse 中。可以通过以下方式完成：

- 运行您自己的 OpenTelemetry collector 并将其指向 ClickHouse —— 见下文。
- 使用其他工具（例如 [Vector](https://vector.dev/)、[Fluentd](https://www.fluentd.org/) 等）直接发送到 ClickHouse，或者使用默认的 [OTel contrib collector distribution](https://github.com/open-telemetry/opentelemetry-collector-contrib)。

:::note 我们建议使用 ClickStack OpenTelemetry collector
这可以让用户受益于标准化的摄取流程、受强制约束的 schema，以及与 HyperDX UI 的开箱即用兼容性。使用默认 schema 可以启用自动数据源检测和预配置的列映射。
:::

有关更多详细信息，请参阅 ["部署 collector"](/use-cases/observability/clickstack/ingesting-data/otel-collector)。



## 发送 OpenTelemetry 数据

要将数据发送到 ClickStack，请将你的 OpenTelemetry 采集配置指向由 OpenTelemetry Collector 暴露的以下端点：

* **HTTP (OTLP):** `http://localhost:4318`
* **gRPC (OTLP):** `localhost:4317`

对于大多数支持 OpenTelemetry 的[语言 SDK](/use-cases/observability/clickstack/sdks) 和遥测库，只需在应用程序中设置 `OTEL_EXPORTER_OTLP_ENDPOINT` 环境变量即可：

```shell
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

此外，请求中需要包含带有 API 摄取密钥的 Authorization 请求头。你可以在 HyperDX 应用的 `Team Settings → API Keys` 中找到该密钥。

<Image img={ingestion_key} alt="摄取密钥" size="lg" />

对于语言 SDK，可以通过 `init` 函数设置此值，或者通过 `OTEL_EXPORTER_OTLP_HEADERS` 环境变量进行设置，例如：

```shell
OTEL_EXPORTER_OTLP_HEADERS='authorization=<您的摄取_API_密钥>'
```

Agent 同样应在所有 OTLP 通信中包含此 Authorization 头。例如，如果在 agent 角色中部署 [OTel collector 的 contrib 发行版](https://github.com/open-telemetry/opentelemetry-collector-contrib)，可以使用 OTLP exporter。下面展示了一个示例 agent 配置，它会读取这个 [结构化日志文件](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-structured.log.gz)。请注意需要指定授权密钥——见 `<YOUR_API_INGESTION_KEY>`。


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
  # HTTP 配置
  otlphttp/hdx:
    endpoint: 'http://localhost:4318'
    headers:
      authorization: <YOUR_API_INGESTION_KEY>
    compression: gzip
 
  # gRPC 配置（备选）
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
      address: 0.0.0.0:9888 # 已修改，因同一主机上运行 2 个采集器
  pipelines:
    logs:
      receivers: [filelog]
      processors: [batch]
      exporters: [otlphttp/hdx]
```
