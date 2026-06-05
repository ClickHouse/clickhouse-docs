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

import Image from '@theme/IdealImage';
import clickhouse_cloud_connection from '@site/static/images/use-cases/observability/clickstack-cloud-connect.png';
import clickstack_cloud from '@site/static/images/use-cases/observability/clickstack-cloud-first-time.png';
import clickstack_start_ingestion from '@site/static/images/use-cases/observability/clickstack-start-ingestion.png';
import clickstack_start_exploring from '@site/static/images/use-cases/observability/clickstack-start-exploring.png';
import clickstack_search from '@site/static/images/use-cases/observability/clickstack-search.png';

本指南将引导你针对现有的托管 ClickStack 服务部署 OpenTelemetry (OTel) Collector，然后验证数据是否正在通过它流动。

Collector 以 **gateway** 角色运行：提供一个统一的 OTLP 端点，供你的应用程序、SDK 和 agent collectors 将数据发送到这里。gateway 会将事件按批次处理，应用你已配置的处理逻辑，然后通过 [ClickHouse exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter) 将其写入 ClickHouse。这种模式可将采集逻辑从应用程序代码中剥离出来，并让你能够独立于生成数据的工作负载扩展摄取能力。有关 gateway 与 agent 角色的背景信息，请参见 [Collector roles](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles)。

本指南假设你已完成 [托管 ClickStack 入门](/use-cases/observability/clickstack/getting-started/managed) 指南，并已准备好连接凭据。

<VerticalStepper headerLevel="h2">
  ## 收集您的凭据 \{#gather-credentials\}

  您需要：

  * 您的 ClickHouse Cloud 服务的 HTTPS 端点 (包括协议和端口) ，例如 `https://abc123xyz.us-central1.gcp.clickhouse.cloud:8443`。
  * 用于摄取的 ClickHouse 用户名和密码。

  如果您尚未记录这些信息，请在 [ClickHouse Cloud 控制台](https://console.clickhouse.cloud) 中打开您的服务并选择 **Connect**。从弹出的对话框中复制 URL。我们将在下方为数据摄取创建一个专用用户。

  <Image img={clickhouse_cloud_connection} size="lg" alt="服务连接面板，显示 HTTPS 端点和密码" border />

  ## 创建摄取用户 \{#create-ingestion-user\}

  我们建议为 collector 创建专用用户，而非复用 `default`。请通过 SQL 控制台连接到您的服务并执行：

  ```sql
  CREATE USER hyperdx_ingest IDENTIFIED WITH sha256_password BY 'ClickH0u3eRocks123!';
  GRANT SELECT, INSERT, CREATE DATABASE, CREATE TABLE, CREATE VIEW ON otel.* TO hyperdx_ingest;
  ```

  :::tip
  请将上方代码片段中的密码替换为强密码
  :::

  collector 在首次使用时会在 `otel` 数据库中为日志、链路追踪和指标创建 schema。有关生产环境用户配置的更多指导，请参阅[生产环境部署](/use-cases/observability/clickstack/production#create-a-database-ingestion-user-managed)。

  ## 部署 collector \{#deploy-the-collector\}

  将 collector 部署在应用程序和基础设施能够访问的位置，以便发送 OpenTelemetry 数据。在下面的示例中，为简便起见，我们在本地运行 collector，并从同一台机器生成模拟遥测数据。

  :::note info
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

  向采集器发送一批日志：

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

  ## 在 ClickStack 界面中确认 \{#confirm-in-ui\}

  在 [ClickHouse Cloud 控制台](https://console.clickhouse.cloud) 中打开您的服务，从左侧菜单中选择 **ClickStack**，然后点击 **Start Ingestion**。

  <Image img={clickstack_cloud} size="lg" alt="启动 ClickStack" border />

  由于您已完成采集器的配置，下一步可以跳过。点击 **Launch ClickStack** 继续。

  ClickStack 将在新标签页中打开，并自动跳转至 **Getting Started** 页面。如未自动跳转，请从左侧菜单中选择 **Getting Started**，然后依次点击 **Start Ingestion** 和 **Next**。

  <Image img={clickstack_start_ingestion} size="lg" alt="开始向 ClickStack 摄取数据" border />

  ClickStack 将自动检测您的表和遥测数据，您可直接继续操作。选择 **Start Exploring** 开始探索您的 trace 数据。

  <Image img={clickstack_start_exploring} size="lg" alt="开始探索 ClickStack" border />

  将数据源切换至 `Logs`，并将时间范围设置为 **Last 15 minutes**。来自 `otelgen` 的合成日志应在几秒内出现。

  <Image img={clickstack_search} size="lg" alt="ClickStack 搜索视图中显示日志" />

  如果没有任何内容显示：

  * 确认传给 `otelgen` 的 `OTLP_AUTH_TOKEN` 值与收集器上设置的值一致。
  * 使用 `docker logs -f <container-id>` 持续查看 collector 日志，并留意导出错误。
  * 请确认 `CLICKHOUSE_ENDPOINT` 包含协议和端口 (`https://...:8443`) 。

  ## 延伸阅读 \{#further-reading\}

  本指南以最简单的形式介绍单个 collector 实例。如需了解后续步骤，请参阅 [OpenTelemetry collector 参考文档](/use-cases/observability/clickstack/ingesting-data/otel-collector)：

  * [保护采集器](/use-cases/observability/clickstack/ingesting-data/otel-collector#securing-the-collector)，通过在 OTLP 端点启用 TLS，并使用最小权限的摄取用户。
  * 在网关处对事件进行[处理、过滤和增强](/use-cases/observability/clickstack/ingesting-data/otel-collector#processing-filtering-transforming-enriching)。
  * [使用自定义接收器、处理器和管道来扩展 collector 配置](/use-cases/observability/clickstack/ingesting-data/otel-collector#extending-collector-config)。
  * 根据预期吞吐量，为 gateway 和 agent 部署[估算资源](/use-cases/observability/clickstack/ingesting-data/otel-collector#estimating-resources)。
  * [投入生产环境](/use-cases/observability/clickstack/production) 中关于正式投入生产环境的建议。
</VerticalStepper>