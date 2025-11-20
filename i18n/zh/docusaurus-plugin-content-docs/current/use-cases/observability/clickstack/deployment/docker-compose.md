---
slug: /use-cases/observability/clickstack/deployment/docker-compose
title: "Docker Compose"
pagination_prev: null
pagination_next: null
sidebar_position: 3
description: "使用 Docker Compose 部署 ClickStack - ClickHouse 可观测性技术栈"
doc_type: "guide"
keywords:
  [
    "ClickStack Docker Compose",
    "Docker Compose ClickHouse",
    "HyperDX Docker deployment",
    "ClickStack deployment guide",
    "OpenTelemetry Docker Compose"
  ]
---

import Image from "@theme/IdealImage"
import hyperdx_login from "@site/static/images/use-cases/observability/hyperdx-login.png"
import hyperdx_logs from "@site/static/images/use-cases/observability/hyperdx-logs.png"
import JSONSupport from "@site/docs/use-cases/observability/clickstack/deployment/_snippets/_json_support.md"

所有 ClickStack 组件均以独立 Docker 镜像的形式单独分发:

- **ClickHouse**
- **HyperDX**
- **OpenTelemetry (OTel) 收集器**
- **MongoDB**

这些镜像可以通过 Docker Compose 组合并在本地部署。

Docker Compose 基于默认的 `otel-collector` 配置暴露了用于可观测性和数据采集的额外端口:

- `13133`: `health_check` 扩展的健康检查端点
- `24225`: 用于日志采集的 Fluentd 接收器
- `4317`: OTLP gRPC 接收器(用于追踪、日志和指标的标准协议)
- `4318`: OTLP HTTP 接收器(gRPC 的替代方案)
- `8888`: 用于监控收集器自身的 Prometheus 指标端点

这些端口支持与各种遥测数据源集成,使 OpenTelemetry 收集器能够满足生产环境中多样化的数据采集需求。

### 适用场景 {#suitable-for}

- 本地测试
- 概念验证
- 不需要容错能力且单台服务器足以承载所有 ClickHouse 数据的生产部署
- 部署 ClickStack 但单独托管 ClickHouse 的场景,例如使用 ClickHouse Cloud


## 部署步骤 {#deployment-steps}

<br />

<VerticalStepper headerLevel="h3">

### 克隆仓库 {#clone-the-repo}

使用 Docker Compose 部署时,请克隆 HyperDX 仓库,进入该目录并运行 `docker-compose up`:


```shell
git clone git@github.com:hyperdxio/hyperdx.git
cd hyperdx
# 切换到 v2 分支
git checkout v2
docker compose up
```

### 访问 HyperDX UI {#navigate-to-hyperdx-ui}

访问 [http://localhost:8080](http://localhost:8080) 进入 HyperDX UI。

创建用户,提供符合要求的用户名和密码。

点击 `Create` 后,将为通过 Helm chart 部署的 ClickHouse 实例创建数据源。

:::note 覆盖默认连接
您可以覆盖集成 ClickHouse 实例的默认连接。详情请参阅 ["使用 ClickHouse Cloud"](#using-clickhouse-cloud)。
:::

<Image img={hyperdx_login} alt='HyperDX UI' size='lg' />

有关使用其他 ClickHouse 实例的示例,请参阅 ["创建 ClickHouse Cloud 连接"](/use-cases/observability/clickstack/getting-started#create-a-cloud-connection)。

### 完成连接配置 {#complete-connection-details}

要连接到已部署的 ClickHouse 实例,只需点击 **Create** 并接受默认设置即可。

如果您希望连接到自己的**外部 ClickHouse 集群**(例如 ClickHouse Cloud),可以手动输入连接凭据。

如果系统提示创建数据源,请保留所有默认值,并在 `Table` 字段中填入 `otel_logs`。其他设置将自动检测,然后您可以点击 `Save New Source`。

<Image img={hyperdx_logs} alt='创建日志数据源' size='md' />

</VerticalStepper>


## 修改 Compose 设置 {#modifying-settings}

用户可以通过环境变量文件修改堆栈的设置,例如所使用的版本:


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
HYPERDX_API_PORT=8000 #可选(不应被其他服务占用)
HYPERDX_APP_PORT=8080
HYPERDX_APP_URL=http://localhost
HYPERDX_LOG_LEVEL=debug
HYPERDX_OPAMP_PORT=4320



# Otel/ClickHouse 配置

HYPERDX&#95;OTEL&#95;EXPORTER&#95;CLICKHOUSE&#95;DATABASE=default

```

### 配置 OpenTelemetry 采集器 {#configuring-collector}

如需修改 OTel 采集器配置,请参阅["修改配置"](/use-cases/observability/clickstack/ingesting-data/otel-collector#modifying-otel-collector-configuration)。
```


## 使用 ClickHouse Cloud {#using-clickhouse-cloud}

此发行版可与 ClickHouse Cloud 配合使用。用户需要:

- 从 `docker-compose.yaml` 文件中移除 ClickHouse 服务。如果是测试环境,此步骤为可选项,因为部署的 ClickHouse 实例将被忽略——但会浪费本地资源。如果移除该服务,请确保同时移除对该服务的所有引用,例如 `depends_on`。
- 通过在 compose 文件中设置环境变量 `CLICKHOUSE_ENDPOINT`、`CLICKHOUSE_USER` 和 `CLICKHOUSE_PASSWORD`,将 OTel collector 配置为使用 ClickHouse Cloud 实例。具体操作是将这些环境变量添加到 OTel collector 服务中:

  ```shell
  otel-collector:
      image: ${OTEL_COLLECTOR_IMAGE_NAME}:${IMAGE_VERSION}
      environment:
        CLICKHOUSE_ENDPOINT: '<CLICKHOUSE_ENDPOINT>' # 此处填写 https 端点
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

  `CLICKHOUSE_ENDPOINT` 应为 ClickHouse Cloud 的 HTTPS 端点,包括端口 `8443`,例如 `https://mxl4k3ul6a.us-east-2.aws.clickhouse.com:8443`

- 连接到 HyperDX UI 并创建到 ClickHouse 的连接时,使用您的 Cloud 凭据。

<JSONSupport />

要设置这些参数,请修改 `docker-compose.yaml` 中的相关服务:

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
  # 为简洁起见已省略

otel-collector:
  image: ${HDX_IMAGE_REPO}/${OTEL_COLLECTOR_IMAGE_NAME_DOCKERHUB}:${IMAGE_VERSION}
  environment:
    OTEL_AGENT_FEATURE_GATE_ARG: "--feature-gates=clickhouse.json" # 启用 JSON
    CLICKHOUSE_ENDPOINT: "tcp://ch-server:9000?dial_timeout=10s"
    # 为简洁起见已省略
```
