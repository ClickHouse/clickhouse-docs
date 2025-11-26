---
slug: /use-cases/observability/clickstack/deployment/docker-compose
title: 'Docker Compose'
pagination_prev: null
pagination_next: null
sidebar_position: 3
description: '使用 Docker Compose 部署 ClickStack - ClickHouse 可观测性栈'
doc_type: 'guide'
keywords: ['ClickStack Docker Compose', 'Docker Compose ClickHouse', 'HyperDX Docker 部署', 'ClickStack 部署指南', 'OpenTelemetry Docker Compose']
---

import Image from '@theme/IdealImage';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import hyperdx_logs from '@site/static/images/use-cases/observability/hyperdx-logs.png';
import JSONSupport from '@site/docs/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';

所有 ClickStack 组件都作为独立的 Docker 镜像单独发布：

* **ClickHouse**
* **HyperDX**
* **OpenTelemetry (OTel) collector**
* **MongoDB**

可以使用 Docker Compose 将这些镜像组合起来并在本地部署。

基于默认的 `otel-collector` 设置，Docker Compose 会额外暴露用于可观测性和数据摄取的端口：

* `13133`：`health_check` 扩展的健康检查端点
* `24225`：用于日志摄取的 Fluentd 接收器
* `4317`：OTLP gRPC 接收器（用于跟踪、日志和指标的标准端口）
* `4318`：OTLP HTTP 接收器（gRPC 的替代方案）
* `8888`：用于监控 collector 本身的 Prometheus 指标端点

这些端口支持与各类遥测源集成，使 OpenTelemetry collector 达到生产可用状态，满足多样化的数据摄取需求。

### 适用场景

* 本地测试
* 概念验证
* 不需要容错且单台服务器即可承载所有 ClickHouse 数据的生产部署
* 部署 ClickStack 但将 ClickHouse 单独托管时，例如使用 ClickHouse Cloud。


## 部署步骤 {#deployment-steps}
<br/>

<VerticalStepper headerLevel="h3">

### 克隆仓库 {#clone-the-repo}

要使用 Docker Compose 进行部署，先克隆 HyperDX 仓库，进入该目录并运行 `docker-compose up`：

```shell
git clone git@github.com:hyperdxio/hyperdx.git
docker compose up
```

### 访问 HyperDX UI {#navigate-to-hyperdx-ui}

访问 [http://localhost:8080](http://localhost:8080) 以打开 HyperDX UI。

创建一个用户，并提供符合要求的用户名和密码。 

点击 `Create` 后，将为通过 Helm 图表部署的 ClickHouse 实例创建数据源。

:::note 覆盖默认连接
您可以覆盖到集成 ClickHouse 实例的默认连接配置。有关详细信息，请参阅 ["使用 ClickHouse Cloud"](#using-clickhouse-cloud)。
:::

<Image img={hyperdx_login} alt="HyperDX UI" size="lg"/>

有关使用替代 ClickHouse 实例的示例，请参阅 ["创建 ClickHouse Cloud 连接"](/use-cases/observability/clickstack/getting-started#create-a-cloud-connection)。

### 完成连接配置 {#complete-connection-details}

要连接到已部署的 ClickHouse 实例，只需单击 **Create** 并接受默认设置。  

如果您更希望连接自己的**外部 ClickHouse 集群**（例如 ClickHouse Cloud），可以手动输入连接凭据。

如果系统提示创建数据源，请保留所有默认值，并将 `Table` 字段填写为 `otel_logs`。其他设置应会自动检测，然后您即可点击 `Save New Source`。

<Image img={hyperdx_logs} alt="创建日志数据源" size="md"/>

</VerticalStepper>



## 修改 compose 设置 {#modifying-settings}

用户可以通过环境变量文件修改栈的配置，例如指定使用的版本：



```shell
user@example-host hyperdx % cat .env
# 供 docker-compose.yml 使用
# 供 docker-compose.yml 使用
HDX_IMAGE_REPO=docker.hyperdx.io
IMAGE_NAME=ghcr.io/hyperdxio/hyperdx
IMAGE_NAME_DOCKERHUB=hyperdx/hyperdx
LOCAL_IMAGE_NAME=ghcr.io/hyperdxio/hyperdx-local
LOCAL_IMAGE_NAME_DOCKERHUB=hyperdx/hyperdx-local
ALL_IN_ONE_IMAGE_NAME=ghcr.io/hyperdxio/hyperdx-all-in-one
ALL_IN_ONE_IMAGE_NAME_DOCKERHUB=hyperdx/hyperdx-all-in-one
OTEL_COLLECTOR_IMAGE_NAME=ghcr.io/hyperdxio/hyperdx-otel-collector
OTEL_COLLECTOR_IMAGE_NAME_DOCKERHUB=hyperdx/hyperdx-otel-collector
CODE_VERSION=2.0.0-beta.16
IMAGE_VERSION_SUB_TAG=.16
IMAGE_VERSION=2-beta
IMAGE_NIGHTLY_TAG=2-nightly
```


# 设置域名 URL
HYPERDX_API_PORT=8000 # 可选（不应被其他服务占用）
HYPERDX_APP_PORT=8080
HYPERDX_APP_URL=http://localhost
HYPERDX_LOG_LEVEL=debug
HYPERDX_OPAMP_PORT=4320



# OTel/ClickHouse 配置

HYPERDX&#95;OTEL&#95;EXPORTER&#95;CLICKHOUSE&#95;DATABASE=default

```

### 配置 OpenTelemetry collector {#configuring-collector}

如有需要，可以修改 OTel collector 配置——请参阅[“修改配置”](/use-cases/observability/clickstack/ingesting-data/otel-collector#modifying-otel-collector-configuration)。
```


## 使用 ClickHouse Cloud

此发行版可以与 ClickHouse Cloud 一起使用。用户应当：

* 从 `docker-compose.yaml` 文件中移除 ClickHouse 服务。如果只是测试，这一步是可选的，因为已经部署的 ClickHouse 实例会被忽略——只是会浪费本地资源。如果移除该服务，请确保删除对该服务的所有引用，例如 `depends_on`。

* 在 Compose 文件中通过设置环境变量 `CLICKHOUSE_ENDPOINT`、`CLICKHOUSE_USER` 和 `CLICKHOUSE_PASSWORD`，修改 OTel collector 以使用 ClickHouse Cloud 实例。具体来说，将这些环境变量添加到 OTel collector 服务中：

  ```shell
  otel-collector:
      image: ${OTEL_COLLECTOR_IMAGE_NAME}:${IMAGE_VERSION}
      environment:
        CLICKHOUSE_ENDPOINT: '<CLICKHOUSE_ENDPOINT>' # 在此填写 HTTPS endpoint
        CLICKHOUSE_USER: '<CLICKHOUSE_USER>'
        CLICKHOUSE_PASSWORD: '<CLICKHOUSE_PASSWORD>'
        HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE: ${HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE}
        HYPERDX_LOG_LEVEL: ${HYPERDX_LOG_LEVEL}
        OPAMP_SERVER_URL: 'http://app:${HYPERDX_OPAMP_PORT}'
      ports:
        - '13133:13133' # health_check 扩展
        - '24225:24225' # fluentd 接收器
        - '4317:4317' # OTLP gRPC 接收器
        - '4318:4318' # OTLP http 接收器
        - '8888:8888' # metrics 扩展
      restart: always
      networks:
        - internal
  ```

  `CLICKHOUSE_ENDPOINT` 应为 ClickHouse Cloud 的 HTTPS endpoint，并包含端口 `8443`，例如 `https://mxl4k3ul6a.us-east-2.aws.clickhouse.com:8443`

* 在连接到 HyperDX UI 并创建到 ClickHouse 的连接时，使用您的 ClickHouse Cloud 凭证。

<JSONSupport />

要完成这些配置，请修改 `docker-compose.yaml` 中相应的服务：

```yaml
  app:
    image: ${HDX_IMAGE_REPO}/${IMAGE_NAME_DOCKERHUB}:${IMAGE_VERSION}
    ports:
      - ${HYPERDX_API_PORT}:${HYPERDX_API_PORT}
      - ${HYPERDX_APP_PORT}:${HYPERDX_APP_PORT}
    environment:
      BETA_CH_OTEL_JSON_SCHEMA_ENABLED: true # 启用 JSON
      FRONTEND_URL: ${HYPERDX_APP_URL}:${HYPERDX_APP_PORT}
      HYPERDX_API_KEY: ${HYPERDX_API_KEY}
      HYPERDX_API_PORT: ${HYPERDX_API_PORT}
    # 为简洁起见，此处省略

  otel-collector:
    image: ${HDX_IMAGE_REPO}/${OTEL_COLLECTOR_IMAGE_NAME_DOCKERHUB}:${IMAGE_VERSION}
    environment:
      OTEL_AGENT_FEATURE_GATE_ARG: '--feature-gates=clickhouse.json' # 启用 JSON
      CLICKHOUSE_ENDPOINT: 'tcp://ch-server:9000?dial_timeout=10s' 
      # 为简洁起见，此处省略
```
