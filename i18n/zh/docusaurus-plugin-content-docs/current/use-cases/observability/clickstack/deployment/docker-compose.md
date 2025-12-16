---
slug: /use-cases/observability/clickstack/deployment/docker-compose
title: 'Docker Compose'
pagination_prev: null
pagination_next: null
sidebar_position: 3
description: '通过 Docker Compose 部署 ClickStack - ClickHouse 可观测性栈'
doc_type: 'guide'
keywords: ['ClickStack Docker Compose', 'Docker Compose ClickHouse', 'HyperDX Docker 部署', 'ClickStack 部署指南', 'OpenTelemetry Docker Compose']
---

import Image from '@theme/IdealImage';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import hyperdx_logs from '@site/static/images/use-cases/observability/hyperdx-logs.png';
import JSONSupport from '@site/i18n/zh/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';

所有 ClickStack 组件都以独立的 Docker 镜像单独分发：

* **ClickHouse**
* **HyperDX**
* **OpenTelemetry (OTel) collector**
* **MongoDB**

这些镜像可以通过 Docker Compose 组合并在本地部署。

基于默认的 `otel-collector` 配置，Docker Compose 会暴露用于可观测性和摄取的额外端口：

* `13133`：`health_check` 扩展的健康检查端点
* `24225`：用于日志摄取的 Fluentd 接收器
* `4317`：OTLP gRPC 接收器（用于 traces、logs 和 metrics 的标准端口）
* `4318`：OTLP HTTP 接收器（gRPC 的替代方案）
* `8888`：用于监控收集器自身的 Prometheus metrics 端点

这些端口支持与多种遥测源集成，使 OpenTelemetry collector 能够在生产环境中满足多样化的摄取需求。

### 适用场景 {#suitable-for}

* 本地测试
* 概念验证
* 对容错性无要求、单台服务器即可承载全部 ClickHouse 数据的生产环境部署
* 部署 ClickStack，但将 ClickHouse 独立托管（例如通过 ClickHouse Cloud）

## 部署步骤 {#deployment-steps}

<br/>

<VerticalStepper headerLevel="h3">

### 克隆仓库 {#clone-the-repo}

要使用 Docker Compose 进行部署，先克隆 ClickStack 仓库，进入该目录并运行 `docker-compose up`：

```shell
git clone https://github.com/ClickHouse/ClickStack.git
docker compose up
```

### 访问 HyperDX UI {#navigate-to-hyperdx-ui}

访问 [http://localhost:8080](http://localhost:8080) 以打开 HyperDX UI。

创建一个用户，并提供满足要求的用户名和密码。

点击 `Create` 后，会为通过 Docker Compose 部署的 ClickHouse 实例自动创建数据源。

:::note 覆盖默认连接
您可以替换到集成 ClickHouse 实例的默认连接。有关详细信息，请参阅 ["Using ClickHouse Cloud"](#using-clickhouse-cloud)。
:::

<Image img={hyperdx_login} alt="HyperDX UI" size="lg"/>

有关使用其他 ClickHouse 实例的示例，请参阅 ["Create a ClickHouse Cloud connection"](/use-cases/observability/clickstack/getting-started#create-a-cloud-connection)。

### 完成连接配置 {#complete-connection-details}

要连接到已部署的 ClickHouse 实例，只需点击 **Create** 并接受默认设置。  

如果您更倾向于连接自己的**外部 ClickHouse 集群**（例如 ClickHouse Cloud），可以手动输入连接凭据。

如果系统提示您创建数据源，请保留所有默认值，并将 `Table` 字段设置为 `otel_logs`。其他所有设置应会自动检测，此时即可点击 `Save New Source`。

<Image img={hyperdx_logs} alt="创建日志数据源" size="md"/>

</VerticalStepper>

## 修改 compose 设置 {#modifying-settings}

用户可以通过环境变量文件来修改该栈的设置，例如使用的版本。

```shell
user@example-host clickstack % cat .env

# Used by docker-compose.yml
IMAGE_NAME_DOCKERHUB=clickhouse/clickstack-all-in-one
LOCAL_IMAGE_NAME_DOCKERHUB=clickhouse/clickstack-local
ALL_IN_ONE_IMAGE_NAME_DOCKERHUB=clickhouse/clickstack-all-in-one
OTEL_COLLECTOR_IMAGE_NAME_DOCKERHUB=clickhouse/clickstack-otel-collector
CODE_VERSION=2.8.0
IMAGE_VERSION_SUB_TAG=.8.0
IMAGE_VERSION=2
IMAGE_NIGHTLY_TAG=2-nightly
IMAGE_LATEST_TAG=latest

# Set up domain URLs
HYPERDX_API_PORT=8000 #optional (should not be taken by other services)
HYPERDX_APP_PORT=8080
HYPERDX_APP_URL=http://localhost
HYPERDX_LOG_LEVEL=debug
HYPERDX_OPAMP_PORT=4320

# Otel/Clickhouse config
HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE=default
```


### 配置 OpenTelemetry collector {#configuring-collector}

如有需要，可以修改 OTel collector 的配置——请参阅[“修改配置”](/use-cases/observability/clickstack/ingesting-data/otel-collector#modifying-otel-collector-configuration)。

## 使用 ClickHouse Cloud {#using-clickhouse-cloud}

此发行版可以与 ClickHouse Cloud 一起使用。用户应当：

* 从 `docker-compose.yml` 文件中移除 ClickHouse 服务。如果只是测试，这一步是可选的，因为已部署的 ClickHouse 实例只是会被忽略——不过仍会占用本地资源。如果移除该服务，请确保同时移除对该服务的所有引用，例如 `depends_on`。

* 通过在 Compose 文件中设置环境变量 `CLICKHOUSE_ENDPOINT`、`CLICKHOUSE_USER` 和 `CLICKHOUSE_PASSWORD`，修改 OTel collector 以使用 ClickHouse Cloud 实例。具体来说，将这些环境变量添加到 OTel collector 服务中：

  ```shell
    otel-collector:
        image: ${OTEL_COLLECTOR_IMAGE_NAME_DOCKERHUB}:${IMAGE_VERSION}
        environment:
          CLICKHOUSE_ENDPOINT: '<CLICKHOUSE_ENDPOINT>' # https endpoint here
          CLICKHOUSE_USER: '<CLICKHOUSE_USER>'
          CLICKHOUSE_PASSWORD: '<CLICKHOUSE_PASSWORD>'
          HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE: ${HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE}
          HYPERDX_LOG_LEVEL: ${HYPERDX_LOG_LEVEL}
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

  `CLICKHOUSE_ENDPOINT` 应设置为 ClickHouse Cloud 的 HTTPS endpoint，并包含端口 `8443`，例如 `https://mxl4k3ul6a.us-east-2.aws.clickhouse.com:8443`。

* 在连接到 HyperDX UI 并创建到 ClickHouse 的连接时，使用你的 Cloud 凭证。

<JSONSupport />

要进行这些设置，请修改 `docker-compose.yml` 中相关的服务：

```yaml
  app:
    image: ${IMAGE_NAME_DOCKERHUB}:${IMAGE_VERSION}
    ports:
      - ${HYPERDX_API_PORT}:${HYPERDX_API_PORT}
      - ${HYPERDX_APP_PORT}:${HYPERDX_APP_PORT}
    environment:
      BETA_CH_OTEL_JSON_SCHEMA_ENABLED: true # enable JSON
      FRONTEND_URL: ${HYPERDX_APP_URL}:${HYPERDX_APP_PORT}
      HYPERDX_API_KEY: ${HYPERDX_API_KEY}
      HYPERDX_API_PORT: ${HYPERDX_API_PORT}
    # truncated for brevity

  otel-collector:
    image: ${OTEL_COLLECTOR_IMAGE_NAME_DOCKERHUB}:${IMAGE_VERSION}
    environment:
      OTEL_AGENT_FEATURE_GATE_ARG: '--feature-gates=clickhouse.json' # enable JSON
      CLICKHOUSE_ENDPOINT: 'tcp://ch-server:9000?dial_timeout=10s' 
      # truncated for brevity
```
