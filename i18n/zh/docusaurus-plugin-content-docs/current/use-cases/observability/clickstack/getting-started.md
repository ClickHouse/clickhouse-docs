---
slug: /use-cases/observability/clickstack/getting-started
title: 'ClickStack 快速入门'
sidebar_label: '快速入门'
pagination_prev: null
pagination_next: use-cases/observability/clickstack/example-datasets/index
description: 'ClickStack 快速入门 - ClickHouse 可观测性栈'
doc_type: 'guide'
keywords: ['ClickStack', '快速入门', 'Docker 部署', 'HyperDX UI', 'ClickHouse Cloud', '本地部署']
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

得益于预构建好的 Docker 镜像，开始使用 **ClickStack** 非常简单。这些镜像基于官方的 ClickHouse Debian 软件包构建，并提供多种发行版，以适配不同的使用场景。


## 本地部署 {#local-deployment}

最简单的方式是使用**单镜像分发版**，它将技术栈的所有核心组件打包在一起：

- **HyperDX UI**
- **OpenTelemetry (OTel) 收集器**
- **ClickHouse**

这个一体化镜像允许您通过单条命令启动完整的技术栈，非常适合用于测试、实验或快速本地部署。

<VerticalStepper headerLevel="h3">

### 使用 Docker 部署技术栈 {#deploy-stack-with-docker}

以下命令将运行一个 OpenTelemetry 收集器（监听端口 4317 和 4318）和 HyperDX UI（监听端口 8080）。

```shell
docker run -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

:::note 持久化数据和设置
要在容器重启后保留数据和设置，用户可以修改上述 Docker 命令以挂载路径 `/data/db`、`/var/lib/clickhouse` 和 `/var/log/clickhouse-server`。

例如：


```shell
# 修改命令以挂载路径
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

### 访问 HyperDX UI {#navigate-to-hyperdx-ui}

访问 [http://localhost:8080](http://localhost:8080) 以进入 HyperDX UI。

创建用户,提供满足复杂性要求的用户名和密码。

<Image img={hyperdx_login} alt='HyperDX UI' size='lg' />

HyperDX 将自动连接到本地集群,并为日志、追踪、指标和会话创建数据源,使您能够立即开始使用该产品。

### 探索产品 {#explore-the-product}

部署完成后,可以尝试使用我们的示例数据集。

若要继续使用本地集群:

- [示例数据集](/use-cases/observability/clickstack/getting-started/sample-data) - 从我们的公共演示中加载示例数据集,诊断简单问题。
- [本地文件和指标](/use-cases/observability/clickstack/getting-started/local-data) - 使用本地 OTel collector 在 OSX 或 Linux 上加载本地文件并监控系统。

<br />
或者,您也可以连接到演示集群以探索更大规模的数据集:

- [远程演示数据集](/use-cases/observability/clickstack/getting-started/remote-demo-data) - 在我们的演示 ClickHouse 服务中探索演示数据集。

</VerticalStepper>


## 使用 ClickHouse Cloud 部署 {#deploy-with-clickhouse-cloud}

用户可以在 ClickHouse Cloud 之上部署 ClickStack，从而在享受全托管、安全后端的同时，仍然对摄取、数据表结构以及可观测性工作流保有完全的控制权。

<VerticalStepper headerLevel="h3">

### 创建 ClickHouse Cloud 服务 {#create-a-service}

按照 [ClickHouse Cloud 入门指南](/getting-started/quick-start/cloud#1-create-a-clickhouse-service) 创建一个服务。

### 复制连接信息 {#copy-cloud-connection-details}

要获取 HyperDX 的连接信息，请打开 ClickHouse Cloud 控制台并点击侧边栏中的 <b>Connect</b> 按钮。 

复制 HTTP 连接信息，尤其是 HTTPS 端点（`endpoint`）和密码。

<Image img={connect_cloud} alt="连接 Cloud" size="md"/>

:::note 部署到生产环境
虽然我们会使用 `default` 用户连接 HyperDX，但在[进入生产环境](/use-cases/observability/clickstack/production#create-a-user)时，我们建议创建一个专用用户。
:::

### 使用 docker 部署 {#deploy-with-docker}

打开终端并导出上面复制的凭证：

```shell
export CLICKHOUSE_USER=default
export CLICKHOUSE_ENDPOINT=<YOUR HTTPS ENDPOINT>
export CLICKHOUSE_PASSWORD=<YOUR_PASSWORD>
```

运行以下 docker 命令：

```shell
docker run -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

这会暴露一个 OTel collector（端口 4317 和 4318），以及 HyperDX UI（端口 8080）。

### 访问 HyperDX UI {#navigate-to-hyperdx-ui-cloud}

访问 [http://localhost:8080](http://localhost:8080) 打开 HyperDX UI。

创建一个用户，并提供满足复杂度要求的用户名和密码。 

<Image img={hyperdx_login} alt="HyperDX 登录" size="lg"/>

### 创建 ClickHouse Cloud 连接 {#create-a-cloud-connection}

进入 `Team Settings`，然后点击 `Local Connection` 的 `Edit`：

<Image img={edit_connection} alt="编辑连接" size="lg"/>

将连接重命名为 `Cloud`，使用你的 ClickHouse Cloud 服务凭证完整填写后续表单，然后点击 `Save`：

<Image img={edit_cloud_connection} alt="创建 Cloud 连接" size="lg"/>

### 体验产品 {#explore-the-product-cloud}

在成功部署整套栈之后，可以尝试我们提供的一个示例数据集。

- [示例数据集](/use-cases/observability/clickstack/getting-started/sample-data) - 从我们的公开演示中加载一个示例数据集，并诊断一个简单问题。
- [本地文件和指标](/use-cases/observability/clickstack/getting-started/local-data) - 使用本地 OTel collector 加载本地文件，并在 OSX 或 Linux 上监控系统。

</VerticalStepper>



## 本地模式 {#local-mode}

本地模式是一种在无需身份验证的情况下部署 HyperDX 的方式。 

本模式不支持身份验证。 

此模式适用于快速测试、开发、演示以及调试等场景，在这些场景中不需要身份验证和设置的持久化保存。

### 托管版本 {#hosted-version}

你可以使用以本地模式运行的 HyperDX 托管版本，访问地址为 [play.hyperdx.io](https://play.hyperdx.io)。

### 自托管版本 {#self-hosted-version}

<VerticalStepper headerLevel="h3">

### 使用 Docker 运行 {#run-local-with-docker}

自托管本地模式镜像内置了 OpenTelemetry Collector 和预先配置好的 ClickHouse 服务器。这使你能够轻松地从应用中采集遥测数据，并以最小的外部配置在 HyperDX 中进行可视化。要开始使用自托管版本，只需运行 Docker 容器并映射相应端口：

```shell
docker run -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx-local
```

你不会被提示创建用户，因为本地模式不包含身份验证机制。

### 完整连接凭据 {#complete-connection-credentials}

要连接到你自己的 **外部 ClickHouse 集群**，可以手动输入连接凭据。

或者，为了快速体验产品，你也可以点击 **Connect to Demo Server** 访问预加载的数据集，在无需任何配置的情况下试用 ClickStack。

<Image img={hyperdx_2} alt="凭据" size="md"/>

如果连接到演示服务器，用户可以结合[演示数据集说明](/use-cases/observability/clickstack/getting-started/remote-demo-data)来探索该数据集。

</VerticalStepper>
