---
slug: /use-cases/observability/clickstack/getting-started
title: 'ClickStack 入门'
sidebar_label: '入门'
pagination_prev: null
pagination_next: use-cases/observability/clickstack/example-datasets/index
description: 'ClickStack 入门 - ClickHouse 可观测性栈'
doc_type: 'guide'
keywords: ['ClickStack', '入门', 'Docker 部署', 'HyperDX UI', 'ClickHouse Cloud', '本地部署']
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

由于提供了预构建好的 Docker 镜像，开始使用 **ClickStack** 十分简单。这些镜像基于官方的 ClickHouse Debian 软件包构建，并提供多种发行版本，以适配不同的使用场景。

## 本地部署 {#local-deployment}

最简单的选项是使用包含该栈所有核心组件的**单镜像发行版**：

- **HyperDX UI**
- **OpenTelemetry (OTel) collector**
- **ClickHouse**

这个一体化镜像允许你通过一条命令启动完整的栈，非常适合用于测试、试验或快速本地部署。

<VerticalStepper headerLevel="h3">

### 使用 docker 部署栈 {#deploy-stack-with-docker}

以下命令会运行一个 OpenTelemetry collector（监听端口 4317 和 4318）以及 HyperDX UI（监听端口 8080）。

```shell
docker run -p 8080:8080 -p 4317:4317 -p 4318:4318 clickhouse/clickstack-all-in-one:latest
```

:::note 镜像名称更新
ClickStack 镜像现在发布为 `clickhouse/clickstack-*`（之前为 `docker.hyperdx.io/hyperdx/*`）。
:::

:::tip 持久化数据和设置
为了在容器重启之间持久化数据和设置，用户可以修改上述 docker 命令，将路径 `/data/db`、`/var/lib/clickhouse` 和 `/var/log/clickhouse-server` 挂载到本地目录。

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
  clickhouse/clickstack-all-in-one:latest
```
:::

### 访问 HyperDX UI {#navigate-to-hyperdx-ui}

访问 [http://localhost:8080](http://localhost:8080) 以打开 HyperDX UI。

创建一个用户，并提供满足复杂度要求的用户名和密码。

<Image img={hyperdx_login} alt="HyperDX UI 界面" size="lg"/>

HyperDX 会自动连接到本地集群，并为日志、追踪、指标和会话创建数据源，使你可以立即开始探索产品。

### 探索产品 {#explore-the-product}

在栈已部署的情况下，可以尝试我们的任一示例数据集。

如果要继续使用本地集群：

- [示例数据集](/use-cases/observability/clickstack/getting-started/sample-data) - 从我们的公开演示中加载一个示例数据集，并诊断一个简单问题。
- [本地文件和指标](/use-cases/observability/clickstack/getting-started/local-data) - 使用本地 OTel collector 在 OSX 或 Linux 上加载本地文件并监控系统。

<br/>
或者，你也可以连接到一个演示集群，在其中探索更大的数据集：

- [远程演示数据集](/use-cases/observability/clickstack/getting-started/remote-demo-data) - 在我们的演示 ClickHouse 服务中探索一个演示数据集。

</VerticalStepper>

## 使用 ClickHouse Cloud 部署 {#deploy-with-clickhouse-cloud}

用户可以将 ClickStack 部署在 ClickHouse Cloud 之上，在享受完全托管且安全的后端的同时，依然对数据摄取、schema 以及可观测性工作流保持完全控制。

<VerticalStepper headerLevel="h3">

### 创建 ClickHouse Cloud 服务 {#create-a-service}

按照 [ClickHouse Cloud 入门指南](/getting-started/quick-start/cloud#1-create-a-clickhouse-service) 创建一个服务。

### 复制连接信息 {#copy-cloud-connection-details}

要查找 HyperDX 的连接信息，请进入 ClickHouse Cloud 控制台，并单击侧边栏中的 <b>Connect</b> 按钮。 

复制 HTTP 连接信息，特别是 HTTPS 端点（`endpoint`）和密码。

<Image img={connect_cloud} alt="Connect Cloud" size="md"/>

:::note 部署到生产环境
虽然我们会使用 `default` 用户连接 HyperDX，但在[用于生产环境](/use-cases/observability/clickstack/production#create-a-user)时，我们建议创建一个专用用户。
:::

### 使用 docker 部署 {#deploy-with-docker}

打开终端并导出上面复制的凭据：

```shell
export CLICKHOUSE_USER=default
export CLICKHOUSE_ENDPOINT=<YOUR HTTPS ENDPOINT>
export CLICKHOUSE_PASSWORD=<YOUR_PASSWORD>
```

运行以下 docker 命令：

```shell
docker run -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 clickhouse/clickstack-all-in-one:latest
```

这会启动一个 OTel collector（监听端口 4317 和 4318），以及 HyperDX UI（监听端口 8080）。

### 访问 HyperDX UI {#navigate-to-hyperdx-ui-cloud}

访问 [http://localhost:8080](http://localhost:8080) 打开 HyperDX UI。

创建一个用户，并设置满足复杂度要求的用户名和密码。 

<Image img={hyperdx_login} alt="HyperDX 登录" size="lg"/>

### 创建 ClickHouse Cloud 连接 {#create-a-cloud-connection}

导航到 `Team Settings` 并在 `Local Connection` 上单击 `Edit`：

<Image img={edit_connection} alt="编辑连接" size="lg"/>

将连接重命名为 `Cloud`，然后使用你的 ClickHouse Cloud 服务凭据填写后续表单，完成后单击 `Save`：

<Image img={edit_cloud_connection} alt="创建 Cloud 连接" size="lg"/>

### 体验产品 {#explore-the-product-cloud}

在部署好整个栈之后，试用我们的任一示例数据集。

- [示例数据集](/use-cases/observability/clickstack/getting-started/sample-data) - 从我们的公共演示环境加载一个示例数据集，并诊断一个简单问题。
- [本地文件和指标](/use-cases/observability/clickstack/getting-started/local-data) - 使用本地 OTel collector 在 OSX 或 Linux 上加载本地文件并监控系统。

</VerticalStepper>

## 本地模式 {#local-mode}

本地模式是一种无需身份验证即可部署 HyperDX 的方式。 

此模式不支持身份验证。 

该模式适用于快速测试、开发、演示和调试等场景，此时不需要身份验证和设置持久化。

### 托管版本 {#hosted-version}

可以在本地模式下使用 HyperDX 的托管版本，地址为 [play.hyperdx.io](https://play.hyperdx.io)。

### 自托管版本 {#self-hosted-version}

<VerticalStepper headerLevel="h3">

### 使用 Docker 运行 {#run-local-with-docker}

自托管本地模式镜像已预先配置好 OpenTelemetry collector 和 ClickHouse 服务器，使您能够轻松地从应用程序采集遥测数据，并在仅需极少外部配置的情况下在 HyperDX 中进行可视化。要开始使用自托管版本，只需运行 Docker 容器并映射相应的端口：

```shell
docker run -p 8080:8080 clickhouse/clickstack-local:latest
```

系统不会提示您创建用户，因为本地模式不包含身份认证功能。

### 完整连接凭据 {#complete-connection-credentials}

要连接到您自己的**外部 ClickHouse 集群**，可以手动输入连接凭据。

或者，如果只是想快速体验产品，您也可以点击 **Connect to Demo Server** 以访问预置数据集，在无需任何额外配置的情况下体验 ClickStack。

<Image img={hyperdx_2} alt="凭据" size="md"/>

如果连接到演示服务器，您可以按照[演示数据集说明](/use-cases/observability/clickstack/getting-started/remote-demo-data)来探索该数据集。

</VerticalStepper>