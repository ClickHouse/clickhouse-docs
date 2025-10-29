---
'slug': '/use-cases/observability/clickstack/getting-started'
'title': '开始使用 ClickStack'
'sidebar_label': '开始使用'
'pagination_prev': null
'pagination_next': 'use-cases/observability/clickstack/example-datasets/index'
'description': '开始使用 ClickStack - ClickHouse 观察性栈'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import hyperdx_logs from '@site/static/images/use-cases/observability/hyperdx-logs.png';
import hyperdx from '@site/static/images/use-cases/observability/hyperdx-1.png';
import hyperdx_2 from '@site/static/images/use-cases/observability/hyperdx-2.png';
import connect_cloud from '@site/static/images/use-cases/observability/connect-cloud-creds.png';
import add_connection from '@site/static/images/use-cases/observability/add_connection.png';
import hyperdx_cloud from '@site/static/images/use-cases/observability/hyperdx-cloud.png';
import edit_cloud_connection from '@site/static/images/use-cases/observability/edit_cloud_connection.png';
import delete_source from '@site/static/images/use-cases/observability/delete_source.png';
import delete_connection from '@site/static/images/use-cases/observability/delete_connection.png';
import created_sources from '@site/static/images/use-cases/observability/created_sources.png';
import edit_connection from '@site/static/images/use-cases/observability/edit_connection.png';

Getting started with **ClickStack** is straightforward thanks to the availability of prebuilt Docker images. These images are based on the official ClickHouse Debian package and are available in multiple distributions to suit different use cases.

## Local deployment {#local-deployment}

最简单的选项是**单镜像分发**，它将堆栈的所有核心组件捆绑在一起：

- **HyperDX UI**
- **OpenTelemetry (OTel) collector**
- **ClickHouse**

这个一体化镜像让您可以通过一条命令启动整个堆栈，非常适合测试、实验或快速本地部署。

<VerticalStepper headerLevel="h3">

### Deploy stack with docker {#deploy-stack-with-docker}

以下命令将运行一个 OpenTelemetry collector（在端口 4317 和 4318 上）以及 HyperDX UI（在端口 8080 上）。

```shell
docker run -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

:::note Persisting data and settings
为了在容器重启之间保持数据和设置，用户可以修改上述 docker 命令以挂载路径 `/data/db`、`/var/lib/clickhouse` 和 `/var/log/clickhouse-server`。

例如：

```shell

# modify command to mount paths
docker run \
  -p 8080:8080 \
  -p 4317:4317 \
  -p 4318:4318 \
  -v "$(pwd)/.volumes/db:/data/db" \
  -v "$(pwd)/.volumes/ch_data:/var/lib/clickhouse" \
  -v "$(pwd)/.volumes/ch_logs:/var/log/clickhouse-server" \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```
:::

### Navigate to the HyperDX UI {#navigate-to-hyperdx-ui}

访问 [http://localhost:8080](http://localhost:8080) 来访问 HyperDX UI。

创建一个用户，提供符合复杂性要求的用户名和密码。

<Image img={hyperdx_login} alt="HyperDX UI" size="lg"/>

HyperDX 将自动连接到本地集群并为日志、跟踪、指标和会话创建数据源 - 让您能立即探索产品。

### Explore the product {#explore-the-product}

在堆栈部署后，尝试我们的一些相同数据集。

要继续使用本地集群：

- [Example dataset](/use-cases/observability/clickstack/getting-started/sample-data) - 从我们的公共演示加载示例数据集。诊断一个简单的问题。
- [Local files and metrics](/use-cases/observability/clickstack/getting-started/local-data) - 加载本地文件并使用本地 OTel collector 在 OSX 或 Linux 上监控系统。

<br/>
或者，您可以连接到一个演示集群，在那里您可以探索更大的数据集：

- [Remote demo dataset](/use-cases/observability/clickstack/getting-started/remote-demo-data) - 在我们的演示 ClickHouse 服务中探索演示数据集。

</VerticalStepper>

## Deploy with ClickHouse Cloud {#deploy-with-clickhouse-cloud}

用户可以针对 ClickHouse Cloud 部署 ClickStack，受益于完全托管的安全后端，同时保留对数据摄取、模式和可观察性工作流的完全控制。

<VerticalStepper headerLevel="h3">

### Create a ClickHouse Cloud service {#create-a-service}

请遵循 [getting started guide for ClickHouse Cloud](/getting-started/quick-start/cloud#1-create-a-clickhouse-service) 来创建服务。

### Copy connection details {#copy-cloud-connection-details}

要查找 HyperDX 的连接详细信息，请导航到 ClickHouse Cloud 控制台并单击侧边栏上的 <b>Connect</b> 按钮。

复制 HTTP 连接详细信息，特别是 HTTPS 端点（`endpoint`）和密码。

<Image img={connect_cloud} alt="Connect Cloud" size="md"/>

:::note Deploying to production
虽然我们将使用 `default` 用户连接 HyperDX，但我们建议在 [去生产时](/use-cases/observability/clickstack/production#create-a-user) 创建一个专用用户。
:::

### Deploy with docker {#deploy-with-docker}

打开终端并导出上面复制的凭据：

```shell
export CLICKHOUSE_USER=default
export CLICKHOUSE_ENDPOINT=<YOUR HTTPS ENDPOINT>
export CLICKHOUSE_PASSWORD=<YOUR_PASSWORD>
```

运行以下 docker 命令：

```shell
docker run -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

这将暴露一个 OpenTelemetry collector（在端口 4317 和 4318 上）和 HyperDX UI（在端口 8080 上）。

### Navigate to the HyperDX UI {#navigate-to-hyperdx-ui-cloud}

访问 [http://localhost:8080](http://localhost:8080) 来访问 HyperDX UI。

创建一个用户，提供符合复杂性要求的用户名和密码。

<Image img={hyperdx_login} alt="HyperDX Login" size="lg"/>

### Create a ClickHouse Cloud connection {#create-a-cloud-connection}

导航到 `Team Settings` 并点击 `Edit` 以获取 `Local Connection`：

<Image img={edit_connection} alt="Edit Connection" size="lg"/>

将连接重命名为 `Cloud` 并在单击 `Save` 之前填写后续表单与您的 ClickHouse Cloud 服务凭据：

<Image img={edit_cloud_connection} alt="Create Cloud connection" size="lg"/>

### Explore the product {#explore-the-product-cloud}

在堆栈部署后，尝试我们的一些相同数据集。

- [Example dataset](/use-cases/observability/clickstack/getting-started/sample-data) - 从我们的公共演示加载示例数据集。诊断一个简单的问题。
- [Local files and metrics](/use-cases/observability/clickstack/getting-started/local-data) - 加载本地文件并使用本地 OTel collector 在 OSX 或 Linux 上监控系统。

</VerticalStepper>

## Local mode {#local-mode}

本地模式是一种在不需要身份验证的情况下部署 HyperDX 的方式。

不支持身份验证。

此模式旨在用于快速测试、开发、演示以及调试用例，其中不需要身份验证和设置持久化。

### Hosted version {#hosted-version}

您可以使用可在 [play.hyperdx.io](https://play.hyperdx.io) 中提供的本地模式托管版本。

### Self-hosted version {#self-hosted-version}

<VerticalStepper headerLevel="h3">

### Run with docker {#run-local-with-docker}

自托管本地模式镜像预配置了 OpenTelemetry collector 和 ClickHouse 服务器。这使得从您的应用中获取遥测数据并在 HyperDX 中可视化变得简单，外部设置最少。要开始使用自托管版本，只需运行 Docker 容器并转发相应的端口：

```shell
docker run -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx-local
```

您将不会被提示创建用户，因为本地模式不包括身份验证。

### Complete connection credentials {#complete-connection-credentials}

要连接到您自己的**外部 ClickHouse 集群**，您可以手动输入连接凭据。

或者，若要快速探索产品，您还可以单击**Connect to Demo Server**来访问预加载的数据集，无需设置即可尝试 ClickStack。

<Image img={hyperdx_2} alt="Credentials" size="md"/>

如果连接到演示服务器，用户可以使用 [demo dataset instructions](/use-cases/observability/clickstack/getting-started/remote-demo-data) 探索数据集。

</VerticalStepper>
