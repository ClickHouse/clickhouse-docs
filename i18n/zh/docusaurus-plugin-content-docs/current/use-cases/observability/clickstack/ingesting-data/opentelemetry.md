---
slug: /use-cases/observability/clickstack/ingesting-data/opentelemetry
pagination_prev: null
pagination_next: null
description: '使用 OpenTelemetry 为 ClickStack 采集数据 - ClickHouse 可观测性技术栈'
title: '使用 OpenTelemetry 采集数据'
doc_type: 'guide'
keywords: ['clickstack', 'opentelemetry', 'traces', 'observability', 'telemetry']
---

import Image from '@theme/IdealImage';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';

所有数据通过 **OpenTelemetry (OTel) 收集器**实例接入 ClickStack,该实例作为日志、指标、追踪和会话数据的主要入口。我们建议使用官方的 [ClickStack 发行版](#installing-otel-collector)收集器。

用户可以通过[语言 SDK](/use-cases/observability/clickstack/sdks)或数据收集代理向该收集器发送数据,这些代理用于收集基础设施指标和日志(例如以[代理](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles)角色运行的 OTel 收集器,或其他技术如 [Fluentd](https://www.fluentd.org/) 或 [Vector](https://vector.dev/))。


## 安装 ClickStack OpenTelemetry 采集器 {#installing-otel-collector}

ClickStack OpenTelemetry 采集器包含在大多数 ClickStack 发行版中,包括:

- [一体化部署](/use-cases/observability/clickstack/deployment/all-in-one)
- [Docker Compose 部署](/use-cases/observability/clickstack/deployment/docker-compose)
- [Helm 部署](/use-cases/observability/clickstack/deployment/helm)

### 独立部署 {#standalone}

ClickStack OTel 采集器也可以独立部署,无需依赖堆栈中的其他组件。

如果您使用的是 [仅 HyperDX](/use-cases/observability/clickstack/deployment/hyperdx-only) 发行版,则需要自行负责将数据传输到 ClickHouse。可以通过以下方式实现:

- 运行您自己的 OpenTelemetry 采集器并将其指向 ClickHouse - 详见下文。
- 使用其他工具直接发送到 ClickHouse,例如 [Vector](https://vector.dev/)、[Fluentd](https://www.fluentd.org/) 等,甚至可以使用默认的 [OTel contrib 采集器发行版](https://github.com/open-telemetry/opentelemetry-collector-contrib)。

:::note 我们建议使用 ClickStack OpenTelemetry 采集器
这使用户能够受益于标准化的数据摄取、强制模式约束以及与 HyperDX UI 的开箱即用兼容性。使用默认模式可以实现自动源检测和预配置的列映射。
:::

有关更多详细信息,请参阅["部署采集器"](/use-cases/observability/clickstack/ingesting-data/otel-collector)。


## 发送 OpenTelemetry 数据 {#sending-otel-data}

要将数据发送到 ClickStack,请将您的 OpenTelemetry 插桩指向 OpenTelemetry 收集器提供的以下端点:

- **HTTP (OTLP):** `http://localhost:4318`
- **gRPC (OTLP):** `localhost:4317`

对于大多数支持 OpenTelemetry 的[语言 SDK](/use-cases/observability/clickstack/sdks) 和遥测库,用户只需在应用程序中设置 `OTEL_EXPORTER_OTLP_ENDPOINT` 环境变量:

```shell
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

此外,还需要包含 API 接入密钥的授权标头。您可以在 HyperDX 应用程序的 `Team Settings → API Keys` 下找到该密钥。

<Image img={ingestion_key} alt='接入密钥' size='lg' />

对于语言 SDK,可以通过 `init` 函数或通过 `OTEL_EXPORTER_OTLP_HEADERS` 环境变量进行设置,例如:

```shell
OTEL_EXPORTER_OTLP_HEADERS='authorization=<YOUR_INGESTION_API_KEY>'
```

代理同样应在任何 OTLP 通信中包含此授权标头。例如,如果以代理角色部署 [OTel 收集器的 contrib 发行版](https://github.com/open-telemetry/opentelemetry-collector-contrib),则可以使用 OTLP 导出器。下面显示了一个使用此[结构化日志文件](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-structured.log.gz)的代理配置示例。请注意需要指定授权密钥 - 参见 `<YOUR_API_INGESTION_KEY>`。


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
 
  # gRPC 配置（可选）
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
