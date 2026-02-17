---
slug: /use-cases/observability/clickstack/ingesting-data/opentelemetry
pagination_prev: null
pagination_next: null
toc_max_heading_level: 2
description: '使用 OpenTelemetry 为 ClickStack 进行数据摄取 - ClickHouse 可观测性栈'
title: '使用 OpenTelemetry 进行数据摄取'
doc_type: 'guide'
keywords: ['clickstack', 'opentelemetry', 'traces', 'observability', 'telemetry']
---

import Image from '@theme/IdealImage';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

所有数据都会通过一个 **OpenTelemetry (OTel) collector** 实例摄取到 ClickStack 中，该实例是日志、指标、追踪和会话数据的主要入口。对于这个实例，我们建议使用官方的 [ClickStack 发行版](#installing-otel-collector)的 collector。

用户可以通过 [language SDKs](/use-cases/observability/clickstack/sdks) 将数据发送到该 collector，或者通过采集基础设施指标和日志的数据采集代理发送数据（例如以 [agent](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles) 角色运行的 OTel collector，或其他技术，如 [Fluentd](https://www.fluentd.org/) 或 [Vector](https://vector.dev/)）。对于希望使用托管 OpenTelemetry 管道的团队，[Bindplane](/use-cases/observability/clickstack/integration-partners/bindplane)提供一个原生支持 OpenTelemetry 的解决方案，内置 ClickStack 目标端，从而简化遥测数据的采集、处理和路由。


## 发送 OpenTelemetry 数据 \{#sending-otel-data\}

<Tabs groupId="os-type">
  <TabItem value="托管版 ClickStack" label="托管版 ClickStack" default>
    ### 安装 ClickStack OpenTelemetry collector

    要向托管 ClickStack 发送数据，应以[gateway 角色](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles)部署一个 OTel collector。兼容 OTel 的埋点会通过基于 HTTP 或 gRPC 的 OTLP 将事件发送到该 collector。

    :::note 我们推荐使用 ClickStack OpenTelemetry collector
    这使您能够受益于标准化的摄取、统一的 schema 约束，以及与 ClickStack UI（HyperDX）的开箱即用兼容性。使用默认 schema 可启用自动来源识别和预配置的列映射。
    :::

    更多详情请参阅[《部署 collector》](/use-cases/observability/clickstack/ingesting-data/otel-collector)。

    ### 向 collector 发送数据

    要向托管 ClickStack 发送数据，请将您的 OpenTelemetry 埋点指向由 OpenTelemetry collector 暴露的以下端点：

    * **HTTP (OTLP)：** `http://localhost:4318`
    * **gRPC (OTLP)：** `localhost:4317`

    对于支持 OpenTelemetry 的[语言 SDK](/use-cases/observability/clickstack/sdks)和遥测库，您只需在应用中设置 `OTEL_EXPORTER_OTLP_ENDPOINT` 环境变量：

    ```shell
    export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
    ```

    如果以 agent 模式部署 [OTel collector 的 contrib 发行版](https://github.com/open-telemetry/opentelemetry-collector-contrib)，可以使用 OTLP exporter 将数据发送到 ClickStack collector。下面展示了一个示例 agent 配置，用于读取此[结构化日志文件](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-structured.log.gz)。

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
        compression: gzip
     
      # gRPC setup (alternative)
      otlp/hdx:
        endpoint: 'localhost:4317'
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
  </TabItem>

  <TabItem value="oss-clickstack" label="开源 ClickStack" default>
    ClickStack OpenTelemetry collector 已包含在大多数 ClickStack 发行版中，包括：

    * [All-in-One](/use-cases/observability/clickstack/deployment/all-in-one)
    * [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose)
    * [Helm](/use-cases/observability/clickstack/deployment/helm)

    ### 安装 ClickStack OpenTelemetry collector

    ClickStack OTel collector 也可以以独立方式部署，而无需依赖整个技术栈中的其他组件。

    如果您使用的是 [HyperDX-only](/use-cases/observability/clickstack/deployment/hyperdx-only) 发行版，则需要自行负责将数据写入 ClickHouse。可以通过以下方式实现：

    * 运行您自己的 OpenTelemetry collector，并将其指向 ClickHouse——参见下文。
    * 使用其他工具（例如 [Vector](https://vector.dev/)、[Fluentd](https://www.fluentd.org/) 等），或默认的 [OTel contrib collector 发行版](https://github.com/open-telemetry/opentelemetry-collector-contrib)，直接发送到 ClickHouse。

    :::note 我们推荐使用 ClickStack OpenTelemetry collector
    这使您能够受益于标准化的摄取、统一的 schema 约束，以及与 HyperDX UI 的开箱即用兼容性。使用默认 schema 可启用自动来源识别和预配置的列映射。
    :::

    更多详情请参阅[《部署 collector》](/use-cases/observability/clickstack/ingesting-data/otel-collector)。

    ### 向 collector 发送数据

    要向 ClickStack 发送数据，请将您的 OpenTelemetry 插桩配置为指向由 OpenTelemetry collector 提供的以下端点：

    * **HTTP (OTLP)：** `http://localhost:4318`
    * **gRPC (OTLP)：** `localhost:4317`

    对于支持 OpenTelemetry 的[语言 SDK](/use-cases/observability/clickstack/sdks) 和遥测库，您只需在应用程序中设置 `OTEL_EXPORTER_OTLP_ENDPOINT` 环境变量即可：

    ```shell
    export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
    ```

    此外，请在请求中添加包含 API 摄取密钥的 Authorization 头。您可以在 HyperDX 应用的 `Team Settings → API Keys` 中找到该密钥。

    <Image img={ingestion_key} alt="Ingestion keys" size="lg" />

    对于各语言的 SDK，可以通过 `init` 函数或 `OTEL_EXPORTER_OTLP_HEADERS` 环境变量进行设置，例如：

    ```shell
    OTEL_EXPORTER_OTLP_HEADERS='authorization=<YOUR_INGESTION_API_KEY>'
    ```

    Agent 同样应在任何 OTLP 通信中包含此授权头。例如，如果在 agent 角色中部署 [OTel collector 的 contrib 发行版](https://github.com/open-telemetry/opentelemetry-collector-contrib)，则可以使用 OTLP exporter。下面展示了一个读取该[结构化日志文件](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-structured.log.gz)的 agent 配置示例。注意需要指定授权密钥（即 `<YOUR_API_INGESTION_KEY>`，用于数据摄取的 API 密钥）。

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
  </TabItem>
</Tabs>