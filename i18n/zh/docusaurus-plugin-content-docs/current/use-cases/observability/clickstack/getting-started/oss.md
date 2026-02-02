---
slug: /use-cases/observability/clickstack/getting-started/oss
title: '开源版 ClickStack 入门'
sidebar_label: '开源版'
pagination_prev: null
pagination_next: use-cases/observability/clickstack/example-datasets/index
description: '开源版 ClickStack 入门'
doc_type: 'guide'
keywords: ['ClickStack 开源版', '入门', 'Docker 部署', 'HyperDX UI', '本地部署']
---

import Image from '@theme/IdealImage';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import hyperdx_logs from '@site/static/images/use-cases/observability/hyperdx-logs.png';
import hyperdx from '@site/static/images/use-cases/observability/hyperdx-1.png';
import hyperdx_2 from '@site/static/images/use-cases/observability/hyperdx-2.png';
import add_connection from '@site/static/images/use-cases/observability/add_connection.png';
import hyperdx_cloud from '@site/static/images/use-cases/observability/hyperdx-cloud.png';
import edit_cloud_connection from '@site/static/images/use-cases/observability/edit_cloud_connection.png';
import delete_source from '@site/static/images/use-cases/observability/delete_source.png';
import delete_connection from '@site/static/images/use-cases/observability/delete_connection.png';
import created_sources from '@site/static/images/use-cases/observability/created_sources.png';
import edit_connection from '@site/static/images/use-cases/observability/edit_connection.png';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

要部署 **ClickStack Open Source**（由你自行运行和管理 ClickHouse 和 ClickStack UI），我们提供预构建的 Docker 镜像，将 UI、一个 OpenTelemetry collector 和 ClickHouse 打包到单个容器中——让本地开发、测试以及自管理部署的起步变得简单直接。

这些镜像基于官方的 ClickHouse Debian 包构建，并提供多种发行版本，以适配不同的使用场景。

最简单的选项是一个 **单镜像发行版**，其中包含整个栈的所有核心组件，打包在一起：

* **HyperDX UI**
* **OpenTelemetry (OTel) collector**
* **ClickHouse**

这种一体化镜像允许你通过一条命令启动完整的栈，非常适合用于测试、实验或快速本地部署。


<VerticalStepper headerLevel="h2">

## 使用 Docker 部署堆栈 \{#deploy-stack-with-docker\}

以下命令将运行一个 OpenTelemetry collector（监听端口 4317 和 4318）、HyperDX UI（监听端口 8080）以及 ClickHouse。

```shell
docker run -p 8080:8080 -p 4317:4317 -p 4318:4318 clickhouse/clickstack-all-in-one:latest
```

:::note 镜像名称更新
ClickStack 镜像现在发布为 `clickhouse/clickstack-*`（之前为 `docker.hyperdx.io/hyperdx/*`）。
:::

:::tip 持久化数据和设置
要在容器重启后仍然保留数据和设置，您可以修改上述 docker 命令，将路径 `/data/db`、`/var/lib/clickhouse` 和 `/var/log/clickhouse-server` 挂载为本地卷。

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

## 访问 ClickStack UI \{#navigate-to-hyperdx-ui\}

访问 [http://localhost:8080](http://localhost:8080) 以打开 ClickStack UI（HyperDX）。

创建一个用户，并提供满足复杂性要求的用户名和密码。

<Image img={hyperdx_login} alt="HyperDX UI" size="lg"/>

HyperDX 会自动连接到本地集群，并为日志（logs）、链路追踪（traces）、指标（metrics）和会话（sessions）创建数据源，从而让您可以立即开始探索产品。

## 探索产品 \{#explore-the-product\}

在堆栈部署完成后，可以尝试以下任一示例数据集。

若要继续使用本地集群：

- [示例数据集](/use-cases/observability/clickstack/getting-started/sample-data) - 从我们的公共演示环境加载一个示例数据集，并诊断一个简单问题。
- [本地文件与指标](/use-cases/observability/clickstack/getting-started/local-data) - 使用本地 OTel collector 从 OSX 或 Linux 加载本地文件并监控系统。

<br/>
或者，您可以连接到一个演示集群，在其中探索更大的数据集：

- [远程演示数据集](/use-cases/observability/clickstack/getting-started/remote-demo-data) - 在我们的演示 ClickHouse 服务中探索一个演示数据集。

</VerticalStepper>

## 其他部署模型 \{#alternative-deployment-models\}

### 本地模式 \{#local-mode\}

本地模式是一种在无需认证的情况下部署 HyperDX 的方式。

**不支持认证功能**。

此模式适用于快速测试、开发、演示以及调试等场景，在这些场景中不需要认证或配置持久化。

有关此部署模型的更多详细信息，请参阅["仅本地模式"](/use-cases/observability/clickstack/deployment/local-mode-only)。

### 托管版本 \{#hosted-version\}

您可以使用以本地模式运行的托管版 ClickStack，访问地址为 [play-clickstack.clickhouse.com](https://play-clickstack.clickstack.com)。

### 自托管版本 \{#self-hosted-version\}

<VerticalStepper headerLevel="h3">

### 使用 Docker 运行 \{#run-local-with-docker\}

自托管本地模式镜像内置了一个 OpenTelemetry collector、ClickStack UI 和预先配置好的 ClickHouse 服务器。这使你可以轻松从应用程序中采集遥测数据，并在几乎无需额外外部配置的情况下进行可视化。要开始使用自托管版本，只需运行 Docker 容器并映射相应端口：

```shell
docker run -p 8080:8080 clickhouse/clickstack-local:latest
```

与 “All-in-one” 镜像不同，你不会被提示创建用户，因为**本地模式不包含身份认证**。

### 完成连接凭据 \{#complete-connection-credentials\}

要连接到你自己的**外部 ClickHouse 集群**，可以手动填写连接凭据。

或者，如果只是想快速体验产品，你也可以点击 **Connect to Demo Server** 来访问预加载的数据集，在无需任何安装配置的情况下试用 ClickStack。

<Image img={hyperdx_2} alt="凭据" size="md"/>

如果连接到演示服务器，你可以按照[演示数据集使用说明](/use-cases/observability/clickstack/getting-started/remote-demo-data)来探索该数据集。

</VerticalStepper>