---
'slug': '/use-cases/observability/clickstack/deployment/docker-compose'
'title': 'Docker Compose'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 2
'description': '使用 Docker Compose 部署 ClickStack - ClickHouse 观察能力栈'
---

import Image from '@theme/IdealImage';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import hyperdx_logs from '@site/static/images/use-cases/observability/hyperdx-logs.png';

所有 ClickStack 组件作为单独的 Docker 镜像分发：

* **ClickHouse**
* **HyperDX**
* **OpenTelemetry (OTel) collector**
* **MongoDB**

这些镜像可以结合使用 Docker Compose 在本地部署。

Docker Compose 根据默认的 `otel-collector` 设置暴露了额外的端口，用于可观察性和数据摄取：

- `13133`：用于 `health_check` 扩展的健康检查端点
- `24225`：用于日志摄取的 Fluentd 接收端
- `4317`：OTLP gRPC 接收端（标准用于跟踪、日志和指标）
- `4318`：OTLP HTTP 接收端（gRPC 的替代方案）
- `8888`：用于监控收集器本身的 Prometheus 指标端点

这些端口使得可以与各种遥测源集成，并使 OpenTelemetry collector 适用于多样化的数据摄取需求。

### 适用于 {#suitable-for}

* 本地测试
* 概念验证
* 生产部署时不需要故障容错且单台服务器足以托管所有 ClickHouse 数据
* 当部署 ClickStack 但单独托管 ClickHouse 时，例如使用 ClickHouse Cloud。

## 部署步骤 {#deployment-steps}
<br/>

<VerticalStepper headerLevel="h3">

### 克隆仓库 {#clone-the-repo}

要通过 Docker Compose 部署，克隆 HyperDX 仓库，进入目录并运行 `docker-compose up`：

```bash
git clone git@github.com:hyperdxio/hyperdx.git
cd hyperdx

# switch to the v2 branch
git checkout v2
docker compose up
```

### 访问 HyperDX UI {#navigate-to-hyperdx-ui}

访问 [http://localhost:8080](http://localhost:8080) 以访问 HyperDX UI。

创建一个用户，提供符合要求的用户名和密码。

单击 `Create` 后，将为使用 Helm 图表部署的 ClickHouse 实例创建数据源。

:::note 覆盖默认连接
您可以覆盖与集成的 ClickHouse 实例的默认连接。有关详细信息，请参见 ["使用 ClickHouse Cloud"](#using-clickhouse-cloud)。
:::

<Image img={hyperdx_login} alt="HyperDX UI" size="lg"/>

有关使用替代 ClickHouse 实例的示例，请参见 ["创建 ClickHouse Cloud 连接"](/use-cases/observability/clickstack/getting-started#create-a-cloud-connection)。

### 完成连接详情 {#complete-connection-details}

要连接到已部署的 ClickHouse 实例，只需单击 **Create** 并接受默认设置。

如果您更喜欢连接到自己的 **外部 ClickHouse 集群**，例如 ClickHouse Cloud，您可以手动输入连接凭据。

如果系统提示您创建源，请保留所有默认值，并在 `Table` 字段中填写 `otel_logs`。所有其他设置应自动检测，您可以单击 `Save New Source`。

<Image img={hyperdx_logs} alt="创建日志源" size="md"/>

</VerticalStepper>

## 修改 compose 设置 {#modifying-settings}

用户可以通过环境变量文件修改堆栈的设置，例如使用的版本：

```bash
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

如果需要，可以修改 OTel 收集器的配置 - 请参阅 ["修改配置"](/use-cases/observability/clickstack/ingesting-data/otel-collector#modifying-otel-collector-configuration)。

## 使用 ClickHouse Cloud {#using-clickhouse-cloud}

此发行版可与 ClickHouse Cloud 一起使用。用户应：

- 从 [`docker-compose.yaml`](https://github.com/hyperdxio/hyperdx/blob/86465a20270b895320eb21dca13560b65be31e68/docker-compose.yml#L89) 文件中删除 ClickHouse 服务。如果进行测试，这是可选的，因为已部署的 ClickHouse 实例将被简单忽略 - 尽管会浪费本地资源。如果删除服务，请确保删除对该服务的 [任何引用](https://github.com/hyperdxio/hyperdx/blob/86465a20270b895320eb21dca13560b65be31e68/docker-compose.yml#L65)，例如 `depends_on`。
- 修改 OTel 收集器以使用 ClickHouse Cloud 实例，方法是在 compose 文件中设置环境变量 `CLICKHOUSE_ENDPOINT`、`CLICKHOUSE_USER` 和 `CLICKHOUSE_PASSWORD`。具体来说，将环境变量添加到 OTel 收集器服务：

```bash
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

    `CLICKHOUSE_ENDPOINT` 应为 ClickHouse Cloud 的 HTTPS 端点，包括端口 `8443`，例如 `https://mxl4k3ul6a.us-east-2.aws.clickhouse.com:8443`

- 在连接到 HyperDX UI 并创建与 ClickHouse 的连接时，请使用您在 Cloud 的凭据。
