---
'slug': '/use-cases/observability/clickstack/deployment/docker-compose'
'title': 'Docker Compose'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 3
'description': '使用 Docker Compose 部署 ClickStack - ClickHouse 观察栈'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import hyperdx_logs from '@site/static/images/use-cases/observability/hyperdx-logs.png';
import JSONSupport from '@site/i18n/zh/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';

所有 ClickStack 组件均作为单独的 Docker 镜像分发：

* **ClickHouse**
* **HyperDX**
* **OpenTelemetry (OTel) collector**
* **MongoDB**

这些镜像可以使用 Docker Compose 组合并本地部署。

Docker Compose 根据默认的 `otel-collector` 设置暴露额外的端口用于可观察性和数据接收：

- `13133`: `health_check` 扩展的健康检查端点
- `24225`: 用于日志接收的 Fluentd 接收器
- `4317`: OTLP gRPC 接收器（用于跟踪、日志和指标的标准）
- `4318`: OTLP HTTP 接收器（gRPC 的替代方案）
- `8888`: 用于监控收集器自身的 Prometheus 指标端点

这些端口可以与各种遥测源集成，并使 OpenTelemetry collector 满足多样的数据接收需求，从而具备生产就绪的能力。

### 适用场景 {#suitable-for}

* 本地测试
* 概念验证
* 生产部署，不要求容错，单台服务器即可托管所有 ClickHouse 数据
* 部署 ClickStack，但单独托管 ClickHouse，例如使用 ClickHouse Cloud。

## 部署步骤 {#deployment-steps}
<br/>

<VerticalStepper headerLevel="h3">

### 克隆 Repo {#clone-the-repo}

要使用 Docker Compose 部署，请克隆 HyperDX repo，切换到该目录并运行 `docker-compose up`：

```shell
git clone git@github.com:hyperdxio/hyperdx.git
cd hyperdx

# switch to the v2 branch
git checkout v2
docker compose up
```

### 访问 HyperDX UI {#navigate-to-hyperdx-ui}

访问 [http://localhost:8080](http://localhost:8080) 来访问 HyperDX UI。

创建用户，提供符合要求的用户名和密码。

单击 `Create` 后，将为通过 Helm chart 部署的 ClickHouse 实例创建数据源。

:::note 覆盖默认连接
您可以覆盖与集成的 ClickHouse 实例的默认连接。有关详细信息，请参见 ["使用 ClickHouse Cloud"](#using-clickhouse-cloud)。
:::

<Image img={hyperdx_login} alt="HyperDX UI" size="lg"/>

有关使用替代 ClickHouse 实例的示例，请参见 ["创建 ClickHouse Cloud 连接"](/use-cases/observability/clickstack/getting-started#create-a-cloud-connection)。

### 完成连接详情 {#complete-connection-details}

要连接到已部署的 ClickHouse 实例，只需单击 **Create** 并接受默认设置。

如果您希望连接到自己的 **外部 ClickHouse 集群**，例如 ClickHouse Cloud，可以手动输入连接凭据。

如果提示您创建数据源，请保留所有默认值，并将 `Table` 字段填入值 `otel_logs`。所有其他设置应自动检测，允许您单击 `Save New Source`。

<Image img={hyperdx_logs} alt="创建日志源" size="md"/>

</VerticalStepper>

## 修改 compose 设置 {#modifying-settings}

用户可以通过环境变量文件修改堆栈的设置，例如使用的版本：

```shell
user@example-host hyperdx % cat .env

# Used by docker-compose.yml

# Used by docker-compose.yml
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

如果需要，可以修改 OTel collector 配置 - 请参见 ["修改配置"](/use-cases/observability/clickstack/ingesting-data/otel-collector#modifying-otel-collector-configuration)。

## 使用 ClickHouse Cloud {#using-clickhouse-cloud}

此发行版可以与 ClickHouse Cloud 一起使用。用户应：

- 从 `docker-compose.yaml` 文件中删除 ClickHouse 服务。如果进行测试，这一操作是可选的，因为所部署的 ClickHouse 实例将被简单忽略——尽管会浪费本地资源。如果删除服务，请确保移除任何对该服务的引用，如 `depends_on`。
- 修改 OTel collector，以通过在 compose 文件中设置环境变量 `CLICKHOUSE_ENDPOINT`、`CLICKHOUSE_USER` 和 `CLICKHOUSE_PASSWORD` 来使用 ClickHouse Cloud 实例。具体而言，将环境变量添加到 OTel collector 服务：

```shell
otel-collector:
    image: ${OTEL_COLLECTOR_IMAGE_NAME}:${IMAGE_VERSION}
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

    `CLICKHOUSE_ENDPOINT` 应该是 ClickHouse Cloud HTTPS 端点，包括端口 `8443`，例如 `https://mxl4k3ul6a.us-east-2.aws.clickhouse.com:8443`

- 连接到 HyperDX UI 并创建与 ClickHouse 的连接时，使用您的 Cloud 凭据。

<JSONSupport/>

要设置这些，请修改 `docker-compose.yaml` 中相关服务：

```yaml
app:
  image: ${HDX_IMAGE_REPO}/${IMAGE_NAME_DOCKERHUB}:${IMAGE_VERSION}
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
  image: ${HDX_IMAGE_REPO}/${OTEL_COLLECTOR_IMAGE_NAME_DOCKERHUB}:${IMAGE_VERSION}
  environment:
    OTEL_AGENT_FEATURE_GATE_ARG: '--feature-gates=clickhouse.json' # enable JSON
    CLICKHOUSE_ENDPOINT: 'tcp://ch-server:9000?dial_timeout=10s' 
    # truncated for brevity
```
