---
slug: /use-cases/observability/clickstack/setting-up-your-opentelemetry-collector
title: '设置 OpenTelemetry Collector'
description: '为托管 ClickStack 设置 OpenTelemetry Collector'
doc_type: 'guide'
keywords: ['clickstack', 'opentelemetry', 'collector', 'managed', 'observability', 'gateway', 'otelgen']
unlisted: true
pagination_prev: null
pagination_next: null
custom_edit_url: null
hide_advert: true
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import GatherCredentials from '@site/i18n/zh/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/managed-onboarding/_snippets/_gather_credentials.md';
import CreateIngestionUser from '@site/i18n/zh/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/managed-onboarding/_snippets/_create_ingestion_user.md';
import ConfirmInUI from '@site/i18n/zh/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/managed-onboarding/_snippets/_confirm_in_ui.md';

本指南将引导你针对现有的托管 ClickStack 服务部署 OpenTelemetry collector，或调整你现有的 collector，然后验证数据是否正在通过它流动。

Collector 以 **gateway** 角色运行：提供一个统一的 OTLP 端点，供你的应用程序、SDK 和 agent collectors 将数据发送到这里。gateway 会将事件按批次处理，应用你已配置的处理逻辑，然后通过 [ClickHouse exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter) 将其写入 ClickHouse。这种模式可将采集逻辑从应用程序代码中剥离出来，并让你能够独立于生成数据的工作负载扩展摄取能力。有关 gateway 与 agent 角色的背景信息，请参见 [Collector roles](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles)。

:::note 现有 collector
如果你正在使用现有的 OpenTelemetry collector，我们假设它已经配置为 **gateway** 角色。我们不建议使用此流程来重新配置 **agent** 角色的 collectors。
:::

选择与你当前情况相符的标签页：

<Tabs groupId="otel-collector-setup">
  <TabItem value="new-collector" label="我还没有 collector" default>
    <VerticalStepper headerLevel="h2">
      ## 收集您的凭据 \{#gather-credentials\}

      <GatherCredentials />

      ## 创建摄取用户 \{#create-ingestion-user\}

      <CreateIngestionUser />

      ## 部署 collector \{#deploy-the-collector\}

      部署**用于托管 ClickStack 的 ClickStack 版 OpenTelemetry collector**。在下面的示例中，为简便起见，我们在本地运行 collector，并从同一台机器生成模拟遥测数据。

      :::note
      在生产环境中，您通常需要将 collector 部署在 Kubernetes 集群中，或部署在可供 OpenTelemetry SDK、agent 及其他 collector 访问的虚拟机上。这样即可将整个环境中的遥测数据集中采集并转发至 ClickStack。
      :::

      选择一个共享密钥，用于验证向 collector 发送数据的客户端，然后将其连同连接详情和为 `hyperdx_ingest` 用户设置的密码一并导出：

      ```shell
      export CLICKHOUSE_ENDPOINT=<HTTPS_ENDPOINT>
      export CLICKHOUSE_USER=hyperdx_ingest
      export CLICKHOUSE_PASSWORD=ClickH0u3eRocks123!
      export OTLP_AUTH_TOKEN="a-strong-shared-secret"
      ```

      运行 ClickStack OTel collector：

      ```shell
      docker run -d \
        -e OTLP_AUTH_TOKEN=${OTLP_AUTH_TOKEN} \
        -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} \
        -e CLICKHOUSE_USER=${CLICKHOUSE_USER} \
        -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} \
        -e HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE=otel \
        -p 4317:4317 \
        -p 4318:4318 \
        clickhouse/clickstack-otel-collector:latest
      ```

      collector 现已在 `4317` 端口暴露 OTLP gRPC，在 `4318` 端口暴露 OTLP HTTP。应用程序、SDK 及 agent collector 在向这些端口发送数据时，需在请求头中携带 `authorization: $OTLP_AUTH_TOKEN`。

      :::note[生产环境部署]
      对于生产环境，我们建议在 OTLP 端点上启用 TLS。请参阅[保护 collector](/use-cases/observability/clickstack/ingesting-data/otel-collector#securing-the-collector)。
      :::

      ## 验证端点 \{#verify-the-endpoint\}

      向 collector 发送一些合成流量，以验证完整管道是否正常工作。我们使用 [`otelgen`](https://github.com/krzko/otelgen)，这是一个小型 CLI 工具，用于发送 OTLP 日志、链路追踪和指标。

      使用 Homebrew 安装 `otelgen`：

      ```shell
      brew install krzko/tap/otelgen
      ```

      或使用 Go：

      ```shell
      go install github.com/krzko/otelgen@latest
      ```

      向 collector 发送一小批日志：

      ```shell
       otelgen \
        --otel-exporter-otlp-endpoint localhost:4317 \
        --insecure \
        --protocol grpc \
        --header "authorization=${OTLP_AUTH_TOKEN}" \
        --rate 5 \
        --duration 60 \
        logs multi
      ```

      有关等效的 trace 和指标命令，以及其他 `otelgen` 子命令的详细介绍，请参阅[使用 otelgen 生成合成数据](/use-cases/observability/clickstack/getting-started/otelgen)。

      ## 在 ClickStack UI 中确认 \{#confirm-in-ui\}

      <ConfirmInUI />
    </VerticalStepper>
  </TabItem>

  <TabItem value="existing-collector" label="我有一个 collector">
    <VerticalStepper headerLevel="h2">
      ## 收集您的凭据 \{#gather-credentials-existing\}

      <GatherCredentials />

      ## 创建摄取用户 \{#create-ingestion-user-existing\}

      <CreateIngestionUser />

      ## 调整您的 collector 配置 \{#adapt-collector\}

      通过 [ClickHouse exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter) 扩展您现有的 collector 配置，以将数据写入托管 ClickStack。

      :::note 需要 ClickHouse exporter
      如果您使用自己的发行版，请确保其中包含 ClickHouse exporter。上游 [contrib 镜像](https://github.com/open-telemetry/opentelemetry-collector-contrib) 已默认包含。
      :::

      以下是一个示例配置，使用 ClickHouse exporter，并包含 ClickStack 界面所需的接收器、处理器和管道。该配置与 ClickStack 发行版的行为一致，包括 Session Replay (`rrweb`) 路由路径。请将 `<clickhouse_cloud_endpoint>` 和 `<your_password_here>` 替换为上方创建的 `hyperdx_ingest` 用户的凭据：

      ```yaml
      receivers:
        otlp/hyperdx:
          protocols:
            grpc:
              include_metadata: true
              endpoint: "0.0.0.0:4317"
            http:
              cors:
                allowed_origins: ["*"]
                allowed_headers: ["*"]
              include_metadata: true
              endpoint: "0.0.0.0:4318"

      processors:
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
        clickhouse:
          database: otel
          endpoint: <clickhouse_cloud_endpoint>
          username: hyperdx_ingest
          password: <your_password_here>
          ttl: 720h
          timeout: 5s
          retry_on_failure:
            enabled: true
            initial_interval: 5s
            max_interval: 30s
            max_elapsed_time: 300s
        clickhouse/rrweb:
          database: otel
          endpoint: <clickhouse_cloud_endpoint>
          username: hyperdx_ingest
          password: <your_password_here>
          ttl: 720h
          logs_table_name: hyperdx_sessions
          timeout: 5s
          retry_on_failure:
            enabled: true
            initial_interval: 5s
            max_interval: 30s
            max_elapsed_time: 300s

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
            processors: [memory_limiter, batch]
            exporters: [clickhouse]
          logs/out-rrweb:
            receivers: [routing/logs]
            processors: [memory_limiter, batch]
            exporters: [clickhouse/rrweb]
      ```

      注意事项：

      * `otlp/hyperdx` receiver 同时监听 gRPC (`4317`) 和 HTTP (`4318`)；应用程序和 agent 应将 collector 主机上的这些端口作为目标。
      * `clickhouse` exporter 会将日志、链路追踪和指标写入 `otel` 数据库，其布局与 ClickStack UI 的预期一致。`clickhouse/rrweb` exporter 则负责处理由 `routing/logs` connector 路由到 `otel.hyperdx_sessions` 的 Session Replay 事件。
      * OTLP 接收器的身份验证沿用您现有的设置。如需强制要求使用摄取令牌，可通过 collector 的 [extensions](https://opentelemetry.io/docs/collector/configuration/#extensions) (例如 `bearertokenauth`) 或由 TLS 保护的反向代理进行配置。

      使用新配置重新加载您的 collector。应用程序、SDK 及 agent collector 随后应向您的 collector 暴露的 OTLP 端点发送数据，并携带您的配置所要求的认证请求头。

      有关针对托管 ClickStack 配置 OpenTelemetry collector 的更多详情，请参阅[使用 OpenTelemetry 摄取数据](/use-cases/observability/clickstack/ingesting-data/opentelemetry)。

      ## 验证端点 \{#verify-the-endpoint-existing\}

      向您的 collector 发送一些合成流量，以验证完整管道是否正常工作。我们使用 [`otelgen`](https://github.com/krzko/otelgen)，这是一个小型 CLI 工具，用于发送 OTLP 日志、链路追踪和指标。

      使用 Homebrew 安装 `otelgen`：

      ```shell
      brew install krzko/tap/otelgen
      ```

      或使用 Go：

      ```shell
      go install github.com/krzko/otelgen@latest
      ```

      向您的 collector 发送一批日志。将 `<your-collector-host>` 替换为您的 collector 所监听的主机地址，并将 `authorization` 请求头 (或其他认证方式) 设置为您的 collector 所要求的值：

      ```shell
       otelgen \
        --otel-exporter-otlp-endpoint <your-collector-host>:4317 \
        --insecure \
        --protocol grpc \
        --header "authorization=<your-auth-token>" \
        --rate 5 \
        --duration 60 \
        logs multi
      ```

      有关等效的 trace 和指标命令，以及其他 `otelgen` 子命令的详细介绍，请参阅[使用 otelgen 生成合成数据](/use-cases/observability/clickstack/getting-started/otelgen)。

      ## 在 ClickStack 界面中确认 \{#confirm-in-ui-existing\}

      <ConfirmInUI />
    </VerticalStepper>
  </TabItem>
</Tabs>

## 延伸阅读 \{#further-reading\}

本指南介绍的是最简单的单实例 collector 形式。[OpenTelemetry collector 参考文档](/use-cases/observability/clickstack/ingesting-data/otel-collector)说明了接下来可以做什么：

* 在 OTLP 端点上启用 TLS，并使用遵循最小权限原则的摄取用户，以[保护 collector](/use-cases/observability/clickstack/ingesting-data/otel-collector#securing-the-collector)。
* 在 gateway 处对事件进行[处理、过滤和增强](/use-cases/observability/clickstack/ingesting-data/otel-collector#processing-filtering-transforming-enriching)。
* 使用自定义 receiver、处理器和管道来[扩展 collector 配置](/use-cases/observability/clickstack/ingesting-data/otel-collector#extending-collector-config)。
* 根据预期吞吐量，为 gateway 和 agent 部署[估算资源](/use-cases/observability/clickstack/ingesting-data/otel-collector#estimating-resources)。
* [投入生产环境](/use-cases/observability/clickstack/production)