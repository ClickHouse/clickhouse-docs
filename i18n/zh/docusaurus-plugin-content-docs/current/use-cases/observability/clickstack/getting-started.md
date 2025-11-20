---
slug: /use-cases/observability/clickstack/getting-started
title: 'ClickStack 快速入门'
sidebar_label: '快速入门'
pagination_prev: null
pagination_next: use-cases/observability/clickstack/example-datasets/index
description: 'ClickStack 快速入门 - ClickHouse 可观测性技术栈'
doc_type: 'guide'
keywords: ['ClickStack', 'getting started', 'Docker deployment', 'HyperDX UI', 'ClickHouse Cloud', 'local deployment']
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

借助预构建的 Docker 镜像，上手使用 **ClickStack** 十分简单。这些镜像基于官方的 ClickHouse Debian 包构建，并提供多个发行版，以适配不同的使用场景。


## 本地部署 {#local-deployment}

最简单的方式是使用**单镜像分发版**,它将技术栈的所有核心组件打包在一起:

- **HyperDX UI**
- **OpenTelemetry (OTel) 收集器**
- **ClickHouse**

这个一体化镜像允许您通过单条命令启动完整的技术栈,非常适合用于测试、实验或快速本地部署。

<VerticalStepper headerLevel="h3">

### 使用 Docker 部署技术栈 {#deploy-stack-with-docker}

以下命令将运行一个 OpenTelemetry 收集器(监听端口 4317 和 4318)和 HyperDX UI(监听端口 8080)。

```shell
docker run -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

:::note 持久化数据和设置
要在容器重启后保留数据和设置,用户可以修改上述 Docker 命令以挂载路径 `/data/db`、`/var/lib/clickhouse` 和 `/var/log/clickhouse-server`。

例如:


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

访问 [http://localhost:8080](http://localhost:8080) 进入 HyperDX UI。

创建用户,提供符合复杂度要求的用户名和密码。

<Image img={hyperdx_login} alt='HyperDX UI' size='lg' />

HyperDX 将自动连接到本地集群,并为日志、追踪、指标和会话创建数据源,让您可以立即开始使用该产品。

### 探索产品 {#explore-the-product}

部署完成后,可以尝试我们的示例数据集。

继续使用本地集群:

- [示例数据集](/use-cases/observability/clickstack/getting-started/sample-data) - 从我们的公共演示中加载示例数据集,诊断简单问题。
- [本地文件和指标](/use-cases/observability/clickstack/getting-started/local-data) - 使用本地 OTel 收集器加载本地文件并监控 OSX 或 Linux 系统。

<br />
或者,您也可以连接到演示集群来探索更大规模的数据集:

- [远程演示数据集](/use-cases/observability/clickstack/getting-started/remote-demo-data) - 在我们的演示 ClickHouse 服务中探索演示数据集。

</VerticalStepper>


## 使用 ClickHouse Cloud 部署 {#deploy-with-clickhouse-cloud}

用户可以将 ClickStack 部署到 ClickHouse Cloud,既能享受完全托管的安全后端,又能完全掌控数据摄取、模式设计和可观测性工作流。

<VerticalStepper headerLevel="h3">

### 创建 ClickHouse Cloud 服务 {#create-a-service}

按照 [ClickHouse Cloud 快速入门指南](/getting-started/quick-start/cloud#1-create-a-clickhouse-service)创建服务。

### 复制连接详情 {#copy-cloud-connection-details}

要获取 HyperDX 的连接详情,请进入 ClickHouse Cloud 控制台,点击侧边栏的<b>连接</b>按钮。

复制 HTTP 连接详情,特别是 HTTPS 端点(`endpoint`)和密码。

<Image img={connect_cloud} alt='连接 Cloud' size='md' />

:::note 部署到生产环境
虽然我们将使用 `default` 用户连接 HyperDX,但建议在[投入生产](/use-cases/observability/clickstack/production#create-a-user)时创建专用用户。
:::

### 使用 Docker 部署 {#deploy-with-docker}

打开终端并导出上面复制的凭据:

```shell
export CLICKHOUSE_USER=default
export CLICKHOUSE_ENDPOINT=<YOUR HTTPS ENDPOINT>
export CLICKHOUSE_PASSWORD=<YOUR_PASSWORD>
```

运行以下 Docker 命令:

```shell
docker run -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

这将启动一个 OpenTelemetry 收集器(端口 4317 和 4318)和 HyperDX UI(端口 8080)。

### 访问 HyperDX UI {#navigate-to-hyperdx-ui-cloud}

访问 [http://localhost:8080](http://localhost:8080) 进入 HyperDX UI。

创建用户,提供符合复杂性要求的用户名和密码。

<Image img={hyperdx_login} alt='HyperDX 登录' size='lg' />

### 创建 ClickHouse Cloud 连接 {#create-a-cloud-connection}

进入 `Team Settings`,点击 `Local Connection` 的 `Edit`:

<Image img={edit_connection} alt='编辑连接' size='lg' />

将连接重命名为 `Cloud`,使用您的 ClickHouse Cloud 服务凭据填写表单,然后点击 `Save`:

<Image img={edit_cloud_connection} alt='创建 Cloud 连接' size='lg' />

### 探索产品功能 {#explore-the-product-cloud}

部署完成后,可以尝试使用我们的示例数据集。

- [示例数据集](/use-cases/observability/clickstack/getting-started/sample-data) - 从我们的公共演示加载示例数据集,诊断简单问题。
- [本地文件和指标](/use-cases/observability/clickstack/getting-started/local-data) - 加载本地文件,使用本地 OTel 收集器在 macOS 或 Linux 上监控系统。

</VerticalStepper>


## 本地模式 {#local-mode}

本地模式是一种无需身份验证即可部署 HyperDX 的方式。

不支持身份验证。

此模式适用于快速测试、开发、演示和调试等无需身份验证和设置持久化的场景。

### 托管版本 {#hosted-version}

您可以使用 HyperDX 本地模式的托管版本,访问地址为 [play.hyperdx.io](https://play.hyperdx.io)。

### 自托管版本 {#self-hosted-version}

<VerticalStepper headerLevel="h3">

### 使用 Docker 运行 {#run-local-with-docker}

自托管本地模式镜像预配置了 OpenTelemetry 采集器和 ClickHouse 服务器。这使得从应用程序中采集遥测数据并在 HyperDX 中可视化变得简单,只需最少的外部配置。要开始使用自托管版本,只需运行 Docker 容器并转发相应的端口:

```shell
docker run -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx-local
```

由于本地模式不包含身份验证,因此不会提示您创建用户。

### 填写连接凭据 {#complete-connection-credentials}

要连接到您自己的**外部 ClickHouse 集群**,您可以手动输入连接凭据。

或者,为了快速体验产品,您也可以点击**连接到演示服务器**来访问预加载的数据集,无需任何配置即可试用 ClickStack。

<Image img={hyperdx_2} alt='凭据' size='md' />

如果连接到演示服务器,用户可以按照[演示数据集说明](/use-cases/observability/clickstack/getting-started/remote-demo-data)探索数据集。

</VerticalStepper>
