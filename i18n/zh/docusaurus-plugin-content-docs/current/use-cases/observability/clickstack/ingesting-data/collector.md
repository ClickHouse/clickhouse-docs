---
slug: /use-cases/observability/clickstack/ingesting-data/otel-collector
pagination_prev: null
pagination_next: null
description: '适用于 ClickStack 的 OpenTelemetry Collector - ClickHouse 可观测性栈'
sidebar_label: 'OpenTelemetry Collector'
title: 'ClickStack OpenTelemetry Collector'
doc_type: 'guide'
toc_max_heading_level: 2
keywords: ['ClickStack', 'OpenTelemetry Collector', 'ClickHouse 可观测性', 'OTel Collector 配置', 'OpenTelemetry ClickHouse']
---

import Image from '@theme/IdealImage';
import observability_6 from '@site/static/images/use-cases/observability/observability-6.png';
import observability_8 from '@site/static/images/use-cases/observability/observability-8.png';
import clickstack_with_gateways from '@site/static/images/use-cases/observability/clickstack-with-gateways.png';
import clickstack_with_kafka from '@site/static/images/use-cases/observability/clickstack-with-kafka.png';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import ExtendingConfig from '@site/i18n/zh/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/ingesting-data/_snippets/_extending_config.md';

:::tip 试试 OTel FYI —— 让 OTel collector 文档一目了然
[OTel FYI](https://otel.fyi) 提供清晰简明的 OpenTelemetry collector 文档，涵盖接收器、处理器、导出器和管道。它是配置 ClickStack OTel collector 时的绝佳参考资源。
:::

本页详细介绍如何配置官方 ClickStack OpenTelemetry (OTel) Collector。

## Collector 角色 \{#collector-roles\}

OpenTelemetry collector 可以以两种主要角色进行部署：

- **Agent** - Agent 实例在边缘侧收集数据，例如在服务器或 Kubernetes 节点上，或者直接从通过 OpenTelemetry SDK 接入的应用程序接收事件。在后一种情况下，Agent 实例与应用程序一起运行，或运行在与应用程序相同的主机上（例如作为 sidecar 或 DaemonSet 守护进程集）。Agent 可以将其数据直接发送到 ClickHouse，或者发送到网关实例。在前一种情况下，这被称为 [Agent 部署模式](https://opentelemetry.io/docs/collector/deployment/agent/)。 

- **Gateway** - Gateway 实例提供一个独立的服务（例如在 Kubernetes 中的一个部署），通常按集群、数据中心或区域划分。这些实例通过单个 OTLP 端点接收来自应用程序（或作为 Agent 的其他 collector）的事件。通常会部署一组 Gateway 实例，并使用开箱即用的负载均衡器在它们之间分发负载。如果所有 Agent 和应用程序都将信号发送到这一单一端点，则通常称为 [Gateway 部署模式](https://opentelemetry.io/docs/collector/deployment/gateway/)。 

**重要：Collector（包括 ClickStack 的默认发行版）默认采用下面描述的 [Gateway 角色](#collector-roles)，从 Agent 或 SDK 接收数据。**

以 Agent 角色部署 OTel collector 的用户通常会使用 [collector 的默认 contrib 发行版](https://github.com/open-telemetry/opentelemetry-collector-contrib)，而非 ClickStack 版本，但也可以自由选择其他兼容 OTLP 的技术，例如 [Fluentd](https://www.fluentd.org/) 和 [Vector](https://vector.dev/)。

## 部署 collector \{#configuring-the-collector\}

<br/>

<Tabs groupId="otel-collector">
  <TabItem value="managed-clickstack" label="托管 ClickStack" default>
    在向托管 ClickStack 发送数据时，我们[建议尽可能使用官方 ClickStack 发行版的 collector](/use-cases/observability/clickstack/deployment/hyperdx-only#otel-collector) 充当 gateway 角色。如果您选择自行提供，请确保其中包含 [ClickHouse exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter)。

    采集器可通过 Helm (推荐用于 Kubernetes 环境) 或 Docker 部署。官方 [ClickStack Helm 图表](https://github.com/ClickHouse/ClickStack-helm-charts) 将上游 [OpenTelemetry collector Helm 图表](https://github.com/open-telemetry/opentelemetry-helm-charts) 作为子图表嵌入，并预配置了 ClickStack 发行版镜像——如需安装包含 HyperDX 的完整技术栈，请参阅 [ClickStack Helm 部署指南](/use-cases/observability/clickstack/deployment/helm)。如需单独部署采集器，可直接使用上游图表配合 ClickStack 镜像，具体操作如下所示。

    <Tabs groupId="install-method">
      <TabItem value="helm" label="Helm" default>
        添加上游 OpenTelemetry Helm 仓库：

        ```shell
        helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
        helm repo update
        ```

        创建一个 `values.yaml`，用于配置 ClickStack 镜像和托管 ClickStack 凭据：

        ```yaml
        # values.yaml
        mode: deployment

        image:
          repository: docker.clickhouse.com/clickhouse/clickstack-otel-collector
          tag: "2.19.0"

        ports:
          otlp:
            enabled: true
          otlp-http:
            enabled: true

        extraEnvs:
          - name: CLICKHOUSE_ENDPOINT
            value: "https://your-instance.clickhouse.cloud:8443"
          - name: CLICKHOUSE_USER
            value: "default"
          - name: CLICKHOUSE_PASSWORD
            value: "<password>"
        ```

        安装该 chart：

        ```shell
        helm install clickstack-otel-collector open-telemetry/opentelemetry-collector -f values.yaml
        ```

        对于生产环境部署，建议将 `CLICKHOUSE_PASSWORD` 存储在 Kubernetes secret 中，并通过 `extraEnvsFrom` 引用，而不要将该值直接写在配置里。
      </TabItem>

      <TabItem value="docker" label="Docker">
        要以独立模式部署 ClickStack 版 OTel 收集器，请运行以下 docker 命令：

        ```shell
        docker run -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 4317:4317 -p 4318:4318 clickhouse/clickstack-otel-collector:latest
        ```

        :::note 镜像名称更新
        ClickStack 镜像现已发布为 `clickhouse/clickstack-*` (此前为 `docker.hyperdx.io/hyperdx/*`) 。
        :::
      </TabItem>
    </Tabs>

    目标 ClickHouse 实例通过环境变量 `CLICKHOUSE_ENDPOINT`、`CLICKHOUSE_USERNAME` 和 `CLICKHOUSE_PASSWORD` 进行配置。`CLICKHOUSE_ENDPOINT` 应为完整的 ClickHouse Cloud HTTP 端点，包含协议和端口，例如 `https://99rr6dm6v3.us-central1.gcp.clickhouse.cloud:8443`。

    有关如何获取托管 ClickStack 凭据的详细信息，请参阅[此处](/cloud/guides/sql-console/gather-connection-details)。

    :::note 生产环境用户
    在生产环境中，请使用具有[适当凭据](/use-cases/observability/clickstack/ingesting-data/otel-collector#creating-an-ingestion-user)的用户。
    :::

    ### 修改配置

    #### 配置托管 ClickStack 实例

    可以通过环境变量 `CLICKHOUSE_ENDPOINT`、`CLICKHOUSE_USERNAME` 和 `CLICKHOUSE_PASSWORD` 将 OpenTelemetry collector 配置为使用托管 ClickStack 实例。这些变量的设置方式取决于您所采用的部署方式：

    <Tabs groupId="install-method">
      <TabItem value="helm" label="Helm" default>
        在你的 `values.yaml` 中覆盖 `extraEnvs` 下的相关条目，然后升级该 release：

        ```yaml
        # values.yaml
        extraEnvs:
          - name: CLICKHOUSE_ENDPOINT
            value: "<HTTPS_ENDPOINT>"
          - name: CLICKHOUSE_USER
            value: "<CLICKHOUSE_USER>"
          - name: CLICKHOUSE_PASSWORD
            value: "<CLICKHOUSE_PASSWORD>"
        ```

        ```shell
        helm upgrade clickstack-otel-collector open-telemetry/opentelemetry-collector -f values.yaml
        ```
      </TabItem>

      <TabItem value="docker" label="Docker">
        所有包含 OpenTelemetry collector 的 Docker image 都可以通过环境变量进行配置。例如，all-in-one image：

        ```shell
        export CLICKHOUSE_ENDPOINT=<HTTPS ENDPOINT>
        export CLICKHOUSE_USER=<CLICKHOUSE_USER>
        export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>
        ```

        ```shell
        docker run -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 clickhouse/clickstack-otel-collector:latest
        ```
      </TabItem>
    </Tabs>

    <ExtendingConfig />

    #### Docker Compose

    使用 Docker Compose 时，可通过与上述相同的环境变量修改采集器配置：

    ```yaml
      otel-collector:
        image: hyperdx/hyperdx-otel-collector
        environment:
          CLICKHOUSE_ENDPOINT: 'https://mxl4k3ul6a.us-east-2.aws.clickhouse-staging.com:8443'
          HYPERDX_LOG_LEVEL: ${HYPERDX_LOG_LEVEL}
          CLICKHOUSE_USER: 'default'
          CLICKHOUSE_PASSWORD: 'password'
          CUSTOM_OTELCOL_CONFIG_FILE: '/etc/otelcol-contrib/custom.config.yaml'
        ports:
          - '13133:13133' # health_check extension
          - '24225:24225' # fluentd receiver
          - '4317:4317' # OTLP gRPC receiver
          - '4318:4318' # OTLP http receiver
          - '8888:8888' # metrics extension
        volumes:
          - ./custom-config.yaml:/etc/otelcol-contrib/custom.config.yaml:ro
        restart: always
        networks:
          - internal
    ```
  </TabItem>

  <TabItem value="oss-clickstack" label="开源 ClickStack" default>
    如果您在独立部署中自行管理 OpenTelemetry collector (例如使用仅含 HyperDX 的发行版) ，我们[建议尽可能使用官方 ClickStack 发行版的 collector](/use-cases/observability/clickstack/deployment/hyperdx-only#otel-collector) 承担 gateway 角色。但如果您选择自带 collector，请确保其中包含 [ClickHouse exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter)。

    Collector 可通过 Helm (推荐用于 Kubernetes) 或 Docker 进行部署。官方 [ClickStack Helm 图表](https://github.com/ClickHouse/ClickStack-helm-charts) 将上游 [OpenTelemetry Collector Helm 图表](https://github.com/open-telemetry/opentelemetry-helm-charts) 作为子图表嵌入，并通过共享的 `clickstack-config` ConfigMap 和 `clickstack-secret` Secret 自动配置 OpAMP 端点、ClickStack 镜像及 HyperDX API key——如需安装包含 HyperDX 的完整技术栈，请参阅 [ClickStack Helm 部署指南](/use-cases/observability/clickstack/deployment/helm)。如需独立部署 collector 并连接至现有的 HyperDX 实例，可直接使用上游图表配合 ClickStack 镜像，如下所示。

    <Tabs groupId="install-method">
      <TabItem value="helm" label="Helm" default>
        添加上游 OpenTelemetry Helm 仓库：

        ```shell
        helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
        helm repo update
        ```

        创建一个 `values.yaml`，用于配置 ClickStack 镜像、ClickHouse 凭据，以及你的 HyperDX 部署的 OpAMP 端点：

        ```yaml
        # values.yaml
        mode: deployment

        image:
          repository: docker.clickhouse.com/clickhouse/clickstack-otel-collector
          tag: "2.19.0"

        ports:
          otlp:
            enabled: true
          otlp-http:
            enabled: true

        extraEnvs:
          - name: CLICKHOUSE_ENDPOINT
            value: "tcp://clickhouse.your-namespace.svc.cluster.local:9000?dial_timeout=10s"
          - name: CLICKHOUSE_USER
            value: "otelcollector"
          - name: CLICKHOUSE_PASSWORD
            value: "<password>"
          - name: OPAMP_SERVER_URL
            value: "http://hyperdx.your-namespace.svc.cluster.local:4320"
          - name: HYPERDX_API_KEY
            value: "<your-ingestion-api-key>"
        ```

        安装该 Helm chart：

        ```shell
        helm install clickstack-otel-collector open-telemetry/opentelemetry-collector -f values.yaml
        ```

        `OPAMP_SERVER_URL` 应解析到你的 HyperDX 服务。当 HyperDX 和收集器在同一集群中运行时，请使用集群内服务的 DNS 名称 (例如 `http://hyperdx.your-namespace.svc.cluster.local:4320`) 。默认情况下，HyperDX 会在端口 `4320` 的 `/v1/opamp` 路径上提供 OpAMP API。

        对于生产部署，我们建议将 `CLICKHOUSE_PASSWORD` 和 `HYPERDX_API_KEY` 存储在 Kubernetes Secret 中，并通过 `extraEnvsFrom` 引用它们，而不是将这些值直接内联写入配置中。
      </TabItem>

      <TabItem value="docker" label="Docker">
        要以独立模式部署 ClickStack 发行版的 OTel 收集器，请运行以下 docker 命令：

        ```shell
        docker run -e OPAMP_SERVER_URL=${OPAMP_SERVER_URL} -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 4317:4317 -p 4318:4318 clickhouse/clickstack-otel-collector:latest
        ```

        :::note 镜像名称更新
        ClickStack 镜像现已发布为 `clickhouse/clickstack-*` (此前为 `docker.hyperdx.io/hyperdx/*`) 。
        :::

        `OPAMP_SERVER_URL` 应指向你的 HyperDX 部署，例如 `http://localhost:4320`。默认情况下，HyperDX 会在端口 `4320` 的 `/v1/opamp` 路径上提供 OpAMP (Open Agent Management Protocol) 服务器。请确保暴露运行 HyperDX 的容器上的此端口 (例如使用 `-p 4320:4320`) 。

        :::note 暴露并连接到 OpAMP 端口
        要让收集器连接到 OpAMP 端口，HyperDX 容器必须暴露该端口，例如 `-p 4320:4320`。对于本地测试，OSX 用户随后可以设置 `OPAMP_SERVER_URL=http://host.docker.internal:4320`。Linux 用户可以使用 `--network=host` 启动收集器容器。
        :::
      </TabItem>
    </Tabs>

    目标 ClickHouse 实例通过环境变量 `CLICKHOUSE_ENDPOINT`、`CLICKHOUSE_USERNAME` 和 `CLICKHOUSE_PASSWORD` 进行配置。`CLICKHOUSE_ENDPOINT` 应为完整的 ClickHouse HTTP 端点，包含协议和端口，例如 `http://localhost:8123`。

    **这些环境变量可用于任何包含该连接器的 Docker 发行版。**

    :::note 生产环境用户
    在生产环境中，您应使用具有[适当凭据](/use-cases/observability/clickstack/ingesting-data/otel-collector#creating-an-ingestion-user)的用户。
    :::

    ### 修改配置

    #### 配置 ClickHouse 实例

    OpenTelemetry collector 可通过环境变量 `OPAMP_SERVER_URL`、`CLICKHOUSE_ENDPOINT`、`CLICKHOUSE_USERNAME` 和 `CLICKHOUSE_PASSWORD` 配置为使用 ClickHouse 实例。这些变量的具体设置方式取决于您的部署方式：

    <Tabs groupId="install-method">
      <TabItem value="helm" label="Helm" default>
        在 `values.yaml` 中覆盖 `extraEnvs` 下的相关条目，然后升级该 release：

        ```yaml
        # values.yaml
        extraEnvs:
          - name: OPAMP_SERVER_URL
            value: "<OPAMP_SERVER_URL>"
          - name: CLICKHOUSE_ENDPOINT
            value: "<HTTPS_ENDPOINT>"
          - name: CLICKHOUSE_USER
            value: "<CLICKHOUSE_USER>"
          - name: CLICKHOUSE_PASSWORD
            value: "<CLICKHOUSE_PASSWORD>"
        ```

        ```shell
        helm upgrade clickstack-otel-collector open-telemetry/opentelemetry-collector -f values.yaml
        ```
      </TabItem>

      <TabItem value="docker" label="Docker">
        所有包含 OpenTelemetry collector 的 Docker image 都可以通过环境变量进行配置。例如，all-in-one 镜像：

        ```shell
        export OPAMP_SERVER_URL=<OPAMP_SERVER_URL>
        export CLICKHOUSE_ENDPOINT=<HTTPS ENDPOINT>
        export CLICKHOUSE_USER=<CLICKHOUSE_USER>
        export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>
        ```

        ```shell
        docker run -e OPAMP_SERVER_URL=${OPAMP_SERVER_URL} -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 clickhouse/clickstack-otel-collector:latest
        ```
      </TabItem>
    </Tabs>

    <ExtendingConfig />

    #### Docker Compose

    使用 Docker Compose 时，通过与上述相同的环境变量修改 collector 配置：

    ```yaml
      otel-collector:
        image: hyperdx/hyperdx-otel-collector
        environment:
          CLICKHOUSE_ENDPOINT: 'https://mxl4k3ul6a.us-east-2.aws.clickhouse-staging.com:8443'
          HYPERDX_LOG_LEVEL: ${HYPERDX_LOG_LEVEL}
          CLICKHOUSE_USER: 'default'
          CLICKHOUSE_PASSWORD: 'password'
          OPAMP_SERVER_URL: 'http://app:${HYPERDX_OPAMP_PORT}'
        ports:
          - '13133:13133' # health_check extension
          - '24225:24225' # fluentd receiver
          - '4317:4317' # OTLP gRPC receiver
          - '4318:4318' # OTLP http receiver
          - '8888:8888' # metrics extension
        restart: always
        networks:
          - internal
    ```
  </TabItem>
</Tabs>

## 保护 collector

<Tabs groupId="securing-collector">
  <TabItem value="managed-clickstack" label="托管 ClickStack" default>
    默认情况下，当 ClickStack OpenTelemetry collector 在开源发行版之外部署时是未加固的，并且其 OTLP 端口不需要身份验证。

    要保护摄取过程，请在部署 collector 时通过 `OTLP_AUTH_TOKEN` 环境变量指定一个认证 token。具体设置方式取决于您的部署方法：

    <Tabs groupId="install-method">
      <TabItem value="helm" label="Helm" default>
        将 `OTLP_AUTH_TOKEN` 添加到 `values.yaml` 的 `extraEnvs` 中，然后升级该 release：

        ```yaml
        # values.yaml
        extraEnvs:
          - name: OTLP_AUTH_TOKEN
            value: "a_very_secure_string"
          - name: CLICKHOUSE_ENDPOINT
            value: "<HTTPS_ENDPOINT>"
          - name: CLICKHOUSE_USER
            value: "<CLICKHOUSE_USER>"
          - name: CLICKHOUSE_PASSWORD
            value: "<CLICKHOUSE_PASSWORD>"
        ```

        ```shell
        helm upgrade clickstack-otel-collector open-telemetry/opentelemetry-collector -f values.yaml
        ```

        对于生产部署，我们建议将 `OTLP_AUTH_TOKEN` 和 `CLICKHOUSE_PASSWORD` 存储在 Kubernetes secret 中，并通过 `extraEnvsFrom` 引用它们。
      </TabItem>

      <TabItem value="docker" label="Docker">
        ```sh
        export CLICKHOUSE_ENDPOINT=<HTTPS_ENDPOINT>
        export CLICKHOUSE_USER=<CLICKHOUSE_USER>
        export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>
        export OTLP_AUTH_TOKEN="a_very_secure_string"

        docker run \
          -e OTLP_AUTH_TOKEN=${OTLP_AUTH_TOKEN} \
          -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} \
          -e CLICKHOUSE_USER=${CLICKHOUSE_USER} \
          -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} \
          -p 4317:4317 \
          -p 4318:4318 \
          clickhouse/clickstack-otel-collector:latest
        ```
      </TabItem>
    </Tabs>

    此外，我们还建议：

    * 将 collector 配置为通过 HTTPS 与 ClickHouse 通信。
    * 为摄取创建一个权限受限的专用用户——参见下文。
    * 为 OTLP 端点启用 TLS，确保 SDK/agent 与 collector 之间的通信经过加密。您可以通过[自定义 collector 配置](#extending-collector-config)进行配置。

    ### 创建摄取用户

    我们建议为 OTel collector 创建专用数据库和用户，用于向托管 ClickStack 摄取数据。该用户应具备在[由 ClickStack 创建和使用的表](/use-cases/observability/clickstack/ingesting-data/schemas)中创建表以及插入数据的权限。

    ```sql
    CREATE DATABASE otel;
    CREATE USER hyperdx_ingest IDENTIFIED WITH sha256_password BY 'ClickH0u3eRocks123!';
    GRANT SELECT, INSERT, CREATE DATABASE, CREATE TABLE, CREATE VIEW ON otel.* TO hyperdx_ingest;
    ```

    这里假设 collector 已配置为使用 `otel` 数据库。可以通过环境变量 `HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE` 来控制这一点。将该变量[与其他环境变量类似](#modifying-otel-collector-configuration)传递给 collector。
  </TabItem>

  <TabItem value="oss-clickstack" label="开源 ClickStack" default>
    ClickStack 发行版中的 OpenTelemetry collector 内置了对 OpAMP (Open Agent Management Protocol) 的支持，用于安全地配置和管理 OTLP 端点。启动时，您必须提供一个 `OPAMP_SERVER_URL` 环境变量——其值应指向 HyperDX 应用，该应用在 `/v1/opamp` 路径下提供 OpAMP API。

    此集成确保 OTLP 端点通过在部署 HyperDX 应用时自动生成的摄取 API key 得到保护。所有发送到 collector 的遥测数据都必须包含此 API key 以完成身份验证。您可以在 HyperDX 应用的 `Team Settings → API Keys` 中找到该 key。

    <Image img={ingestion_key} alt="Ingestion keys" size="lg" />

    为了进一步保护您的部署，我们建议：

    * 将 collector 配置为通过 HTTPS 与 ClickHouse 通信。
    * 为摄取创建一个权限受限的专用用户——参见下文。
    * 为 OTLP 端点启用 TLS，确保 SDK/agent 与 collector 之间的通信经过加密。您可以通过[自定义 collector 配置](#extending-collector-config)进行配置。

    ### 创建摄取用户

    我们建议为 OTel collector 创建专用数据库和用户，用于向 ClickHouse 摄取数据。该用户应具备在[由 ClickStack 创建和使用的表](/use-cases/observability/clickstack/ingesting-data/schemas)中创建表以及插入数据的权限。

    ```sql
    CREATE DATABASE otel;
    CREATE USER hyperdx_ingest IDENTIFIED WITH sha256_password BY 'ClickH0u3eRocks123!';
    GRANT SELECT, INSERT, CREATE DATABASE, CREATE TABLE, CREATE VIEW ON otel.* TO hyperdx_ingest;
    ```

    这里假设 collector 已配置为使用 `otel` 数据库。可以通过环境变量 `HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE` 来控制这一点。将该变量[与其他环境变量类似](#modifying-otel-collector-configuration)传递给托管 collector 的镜像。
  </TabItem>
</Tabs>

## 处理 —— 过滤、转换和富化 {#processing-filtering-transforming-enriching}

用户在数据摄取过程中通常会希望对事件消息进行过滤、转换和富化。由于无法修改 ClickStack connector 的配置，我们建议需要进一步进行事件过滤和处理的用户采用以下任一方式：

- 部署自有版本的 OTel collector，在其中执行过滤和处理，然后通过 OTLP 将事件发送到 ClickStack collector，以摄取到 ClickHouse 中。
- 部署自有版本的 OTel collector，并使用 ClickHouse exporter 将事件直接发送到 ClickHouse。

如果使用 OTel collector 进行处理，我们建议在网关实例上执行转换工作，并尽量减少在 agent 实例上的工作负载。这样可以确保在边缘、运行在服务器上的 agent 所需资源尽可能少。通常，我们看到用户只在 agent 中执行过滤（以减少不必要的网络使用）、时间戳设置（通过 operators），以及需要上下文的富化操作。例如，如果网关实例位于不同的 Kubernetes 集群中，则需要在 agent 中执行 k8s 富化。

OpenTelemetry 支持以下可供使用的处理和过滤功能：

- **Processors** - Processors 获取由 [receivers 收集到的数据并对其进行修改或转换](https://opentelemetry.io/docs/collector/transforming-telemetry/)，然后再发送给 exporters。Processors 按照在 collector 配置中 `processors` 部分指定的顺序应用。这些是可选的，但[通常建议使用一个最小集合](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor#recommended-processors)。在将 OTel collector 与 ClickHouse 一起使用时，我们建议将 processors 限制为：

- 一个 [memory_limiter](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/memorylimiterprocessor/README.md)，用于防止 collector 出现内存耗尽情况。建议参见 [Estimating Resources](#estimating-resources)。
- 任何基于上下文执行富化的 processor。例如，[Kubernetes Attributes Processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor) 允许使用 k8s 元数据自动为 span、metrics 和 logs 设置 resource 属性，例如用源 pod id 富化事件。
- 如需要 trace 时使用的 [尾部或头部采样（tail/head sampling）](https://opentelemetry.io/docs/concepts/sampling/)。
- [基本过滤](https://opentelemetry.io/docs/collector/transforming-telemetry/) —— 如果无法通过 operator 完成（见下文），则丢弃不需要的事件。
- [Batching](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor/batchprocessor) —— 在与 ClickHouse 一起使用时必不可少，以确保数据以批量方式发送。参见 ["Optimizing inserts"](#optimizing-inserts)。

- **Operators** - [Operators](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md) 提供了在 receiver 侧可用的最基本处理单元。支持基础解析，允许设置诸如 Severity 和 Timestamp 等字段。此处支持 JSON 和正则解析，以及事件过滤和基础转换。我们建议在此执行事件过滤。

我们建议用户避免使用 operators 或 [transform processors](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/transformprocessor/README.md) 进行过度的事件处理。这些操作可能带来相当大的内存和 CPU 开销，尤其是 JSON 解析。完全可以在 ClickHouse 插入时通过 materialized view 和列完成所有处理，但有一些例外 —— 尤其是具备上下文感知的富化，例如添加 k8s 元数据。有关更多详细信息，请参阅 [使用 SQL 提取结构](/use-cases/observability/schema-design#extracting-structure-with-sql)。

### 示例

以下配置演示了如何采集这个[非结构化日志文件](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-unstructured.log.gz)。该配置可用于以 agent 身份运行的 collector，将数据发送到 ClickStack 网关。

请注意，这里使用算子从日志行中提取结构 (`regex_parser`) 并过滤事件，同时使用处理器对事件进行批处理，以限制内存占用。

```yaml file=code_snippets/ClickStack/config-unstructured-logs-with-processor.yaml
receivers:
  filelog:
    include:
      - /opt/data/logs/access-unstructured.log
    start_at: beginning
    operators:
      - type: regex_parser
        regex: '^(?P<ip>[\d.]+)\s+-\s+-\s+\[(?P<timestamp>[^\]]+)\]\s+"(?P<method>[A-Z]+)\s+(?P<url>[^\s]+)\s+HTTP/[^\s]+"\s+(?P<status>\d+)\s+(?P<size>\d+)\s+"(?P<referrer>[^"]*)"\s+"(?P<user_agent>[^"]*)"'
        timestamp:
          parse_from: attributes.timestamp
          layout: '%d/%b/%Y:%H:%M:%S %z'
          #22/Jan/2019:03:56:14 +0330
processors:
  batch:
    timeout: 1s
    send_batch_size: 10000
  memory_limiter:
    check_interval: 1s
    limit_mib: 2048
    spike_limit_mib: 256
exporters:
  # HTTP setup
  otlphttp/hdx:
    endpoint: 'http://localhost:4318'
    headers:
      authorization: <YOUR_INGESTION_API_KEY>
    compression: gzip

  # gRPC setup (alternative)
  otlp/hdx:
    endpoint: 'localhost:4317'
    headers:
      authorization: <YOUR_API_INGESTION_KEY>
    compression: gzip
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

请注意，在任何 OTLP 通信中都需要包含[带有摄取 API key 的 Authorization 请求头](#securing-the-collector)。

如需更高级的配置，我们建议参考 [OpenTelemetry collector 文档](https://opentelemetry.io/docs/collector/)。


## 优化插入 {#optimizing-inserts}

为了在获得强一致性保证的同时实现高效的插入性能，你在通过 ClickStack collector 向 ClickHouse 插入可观测性数据时，应当遵循一些简单的规则。只要正确配置 OTel collector，遵循以下规则就会非常简单。这样也可以避免用户在首次使用 ClickHouse 时遇到的一些[常见问题](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse)。

### 批处理

默认情况下，发送到 ClickHouse 的每个 insert 都会让 ClickHouse 立即创建一个存储部分 (part) ，其中包含此次插入的数据以及需要存储的其他元数据。因此，相比发送大量每次只包含少量数据的 insert，发送较少次数但每次包含更多数据的 insert，可以减少所需的写入次数。我们建议一次插入至少 1,000 行的较大批次数据。更多详情见[此处](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)。

默认情况下，对 ClickHouse 的 insert 是同步的，并且对于相同内容是幂等的。对于 merge tree 引擎族的表，ClickHouse 默认会自动[对 insert 进行去重](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#5-deduplication-at-insert-time)。这意味着 insert 在如下情况中是可容错的：

* (1) 如果接收数据的节点出现问题，insert 查询会超时 (或返回更具体的错误) ，并且不会收到确认。
* (2) 如果数据已经被该节点写入，但由于网络中断，确认无法返回给查询的发送方，则发送方会收到超时或网络错误。

从 collector 的角度来看，(1) 和 (2) 可能很难区分。不过，在这两种情况下，未被确认的 insert 都可以立即重试。只要重试的 insert 查询包含的数据及其顺序与原始 insert 相同，如果原始 (未被确认的) insert 实际上已成功，ClickHouse 就会自动忽略这次重试的 insert。

基于上述原因，ClickStack 发行版中的 OTel collector 使用了[batch processor](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/batchprocessor/README.md)。这可以确保 insert 以满足上述要求的一致批次形式发送。如果预期某个 collector 具有较高吞吐量 (每秒事件数，events per second) ，并且每次 insert 至少可以发送 10,000 个事件，那么通常这就是处理管道 (pipeline) 中唯一需要的批处理机制。如果内存允许，也可以使用最高 100,000 的值。在这种情况下，collector 会在 batch processor 的 `timeout` 达到之前刷新批次，从而确保整个管道的端到端延迟保持较低，并且批次大小保持一致。

### 使用异步插入 {#use-asynchronous-inserts}

通常，当采集器的吞吐量较低时，用户不得不发送更小的批次，但他们仍然希望数据在端到端延迟尽可能低的情况下到达 ClickHouse。在这种情况下，当批处理器的 `timeout` 过期时会发送小批次。这可能导致问题，此时就需要异步插入。如果用户将数据发送到充当 Gateway 的 ClickStack 采集器，这个问题比较少见——采集器作为聚合器，可以缓解这一问题——参见 [Collector roles](#collector-roles)。

如果无法保证足够大的批次，用户可以通过使用 [Asynchronous Inserts](/best-practices/selecting-an-insert-strategy#asynchronous-inserts) 将批处理工作委托给 ClickHouse。使用异步插入时，数据首先被插入到缓冲区，然后再写入数据库存储，写入过程会在稍后以异步方式完成。

<Image img={observability_6} alt="异步插入" size="md"/>

在[启用异步插入](/optimize/asynchronous-inserts#enabling-asynchronous-inserts)后，当 ClickHouse ① 接收到一条插入查询时，该查询的数据会 ② 立即写入内存缓冲区。随后在 ③ 下一次缓冲区刷新时，缓冲区中的数据会被[排序](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns)，并作为一个数据 part 写入数据库存储。请注意，在数据刷新到数据库存储之前，无法通过查询检索到这些数据；缓冲区刷新的行为是[可配置的](/optimize/asynchronous-inserts)。

要为采集器启用异步插入，请在连接字符串中添加 `async_insert=1`。我们建议用户使用 `wait_for_async_insert=1`（默认值）以获得投递可靠性保证——更多细节参见[此处](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)。

异步插入的数据会在 ClickHouse 缓冲区被刷新时写入。这会在超过 [`async_insert_max_data_size`](/operations/settings/settings#async_insert_max_data_size) 后发生，或者在自首次 INSERT 查询以来经过 [`async_insert_busy_timeout_ms`](/operations/settings/settings#async_insert_max_data_size) 毫秒后发生。如果将 `async_insert_stale_timeout_ms` 设置为非零值，则数据会在自最后一条查询以来经过 `async_insert_stale_timeout_ms 毫秒` 后被插入。用户可以通过调优这些设置来控制其流水线的端到端延迟。用于进一步调优缓冲区刷新的设置文档在[此处](/operations/settings/settings#async_insert)。通常，默认值已经比较合适。

:::note 考虑自适应异步插入
在仅使用少量 agent（代理）、吞吐量较低但端到端延迟要求严格的场景中，[自适应异步插入](https://clickhouse.com/blog/clickhouse-release-24-02#adaptive-asynchronous-inserts) 可能会有用。总体而言，对于 ClickHouse 常见的高吞吐量可观测性场景，这些设置通常并不适用。
:::

最后，之前与同步插入 ClickHouse 相关的去重行为，在使用异步插入时默认不会启用。如有需要，请参阅设置 [`async_insert_deduplicate`](/operations/settings/settings#async_insert_deduplicate)。

关于配置此功能的完整细节，请参阅此[文档页面](/optimize/asynchronous-inserts#enabling-asynchronous-inserts)，或参考这篇更深入的[博客文章](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)。

## 扩展 \{#scaling\}

ClickStack OTel collector 充当网关（Gateway）实例——参见 [Collector roles](#collector-roles)。这些实例作为独立服务提供能力，通常按数据中心或区域进行部署。它们通过单一 OTLP 端点从应用程序（或以 agent 角色运行的其他 collector）接收事件。通常会部署一组 collector 实例，并使用开箱即用的负载均衡器在它们之间分发负载。

<Image img={clickstack_with_gateways} alt="通过网关实现扩展" size="lg"/>

此架构的目标是将计算密集型处理从 agent 侧卸载，从而尽量减少其资源占用。这些 ClickStack 网关可以执行原本需要由 agent 完成的转换任务。此外，通过汇聚来自多个 agent 的事件，网关可以确保以大批量方式将数据发送到 ClickHouse，从而实现高效写入。随着更多 agent 和 SDK 数据源的接入以及事件吞吐量的增加，这些网关 collector 可以轻松扩展。 

### 添加 Kafka \{#adding-kafka\}

读者可能已经注意到，上面的架构并未使用 Kafka 作为消息队列。

在日志架构中，使用 Kafka 队列作为消息缓冲是一种常见的设计模式，并由 ELK 技术栈推广。它带来了几方面优势：主要是可以提供更强的消息投递保证，并有助于处理背压问题。消息从采集代理发送到 Kafka 并写入磁盘。理论上，一个集群化的 Kafka 实例应该能够提供高吞吐量的消息缓冲区，因为顺序写入磁盘的数据在计算开销上要远小于对消息进行解析和处理。例如，在 Elastic 中，分词和索引会带来显著的开销。通过将数据从代理侧移出，你也可以降低由于源端日志轮转导致消息丢失的风险。最后，它还提供一定的消息重放和跨区域复制能力，这在某些用例中可能具有吸引力。

然而，ClickHouse 能够非常快速地插入数据——在中等硬件上即可达到每秒数百万行。来自 ClickHouse 的背压情况较为少见。很多时候，引入 Kafka 队列只会带来更多架构复杂度和成本。如果你能够接受这样一个原则：日志并不需要像银行交易等关键任务数据那样的投递保证，我们建议避免引入 Kafka 带来的额外复杂度。

不过，如果你需要很高的投递保证，或者需要重放数据（可能重放到多个下游），Kafka 依然可以是一个有用的架构组件。

<Image img={observability_8} alt="添加 Kafka" size="lg"/>

在这种情况下，可以将 OTel 代理配置为通过 [Kafka exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/kafkaexporter/README.md) 向 Kafka 发送数据。然后，网关实例使用 [Kafka receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/kafkareceiver/README.md) 来消费消息。更多细节请参考 Confluent 和 OTel 文档。

:::note OTel collector 配置
ClickStack OpenTelemetry collector 发行版可以通过使用[自定义 collector 配置](#extending-collector-config)来配置对 Kafka 的支持。
:::

## 预估资源 {#estimating-resources}

OTel collector 的资源需求取决于事件吞吐量、消息大小以及执行的处理量。OpenTelemetry 项目维护了[基准测试](https://opentelemetry.io/docs/collector/benchmarks/)，供用户用来预估资源需求。

[根据我们的经验](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog#architectural-overview)，一台具有 3 个核心和 12GB 内存的 ClickStack 网关实例大约可以处理每秒 60k 个事件。这里假设使用的是只负责重命名字段且不使用正则表达式的最小处理流水线。

对于负责将事件发送到网关、且只在事件上设置时间戳的 agent 实例，我们建议用户根据预期的每秒日志数量来进行容量规划。以下数据可作为一个大致的起点参考：

| Logging rate | Resources to collector agent      |
|--------------|-----------------------------------|
| 1k/second    | 0.2 CPU, 0.2 GiB                 |
| 5k/second    | 0.5 CPU, 0.5 GiB                 |
| 10k/second   | 1 CPU, 1 GiB                     |

## schema 选择：Map vs JSON \{#processing-filtering-transforming-enriching\}

ClickStack collector 默认创建的表会将属性存储在 `Map(LowCardinality(String), String)` 列中。这是可观测性工作负载推荐使用的 schema。Beta 版提供了 `JSON` 类型的 schema，适合在属性键集合较小且稳定的工作负载上进行评估。

有关完整对比、各自适用的场景、启用 JSON 类型 schema 所需的环境变量，以及迁移演练，请参阅 [Map vs JSON type](/use-cases/observability/clickstack/ingesting-data/schema/map-vs-json)。