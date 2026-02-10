---
slug: /use-cases/observability/clickstack/deployment/hyperdx-only
title: '仅部署 HyperDX'
pagination_prev: null
pagination_next: null
sidebar_position: 4
description: '仅部署 HyperDX'
doc_type: 'guide'
keywords: ['HyperDX 独立部署', 'HyperDX 与 ClickHouse 集成', '仅部署 HyperDX', '通过 Docker 安装 HyperDX', 'ClickHouse 可视化工具']
---

import Image from '@theme/IdealImage';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import hyperdx_logs from '@site/static/images/use-cases/observability/hyperdx-logs.png';
import hyperdx_2 from '@site/static/images/use-cases/observability/hyperdx-2.png';
import JSONSupport from '@site/i18n/zh/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';

此选项适用于已经拥有运行中的 ClickHouse 实例，并且其中已写入可观测性或事件数据的用户。

HyperDX 可以独立于其余组件使用，并且兼容任意数据 schema——不仅限于 OpenTelemetry (OTel)。这使其非常适合已经基于 ClickHouse 构建的自定义可观测性管道。

要启用全部功能，必须提供一个 MongoDB 实例，用于存储应用状态，包括仪表盘、已保存的搜索、用户设置和告警。

在此模式下，数据摄取完全由用户自行负责。你可以使用自己部署的 OpenTelemetry collector、从客户端库直接摄取、ClickHouse 原生表引擎（例如 Kafka 或 S3）、ETL 管道，或诸如 ClickPipes 等托管摄取服务，将数据摄取到 ClickHouse 中。这种方式提供了最大的灵活性，适合已经在运行 ClickHouse、并希望在其之上引入 HyperDX 以实现可视化、搜索和告警的团队。


### 适用对象 \{#suitable-for\}

- 现有 ClickHouse 用户
- 自定义事件数据管道

## 部署步骤 \{#deployment-steps\}

<br/>

<VerticalStepper headerLevel="h3">

### 使用 Docker 部署 \{#deploy-hyperdx-with-docker\}

运行以下命令，并根据需要修改 `YOUR_MONGODB_URI`。 

```shell
docker run -e MONGO_URI=mongodb://YOUR_MONGODB_URI -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx
```

### 访问 HyperDX UI \{#navigate-to-hyperdx-ui\}

访问 [http://localhost:8080](http://localhost:8080) 打开 HyperDX UI。

创建一个用户，提供符合要求的用户名和密码。 

单击 `Create` 后，系统会提示你填写连接信息。

<Image img={hyperdx_login} alt="HyperDX UI" size="lg"/>

### 完成连接信息 \{#complete-connection-details\}

连接到你自己的外部 ClickHouse 集群，例如 ClickHouse Cloud。

<Image img={hyperdx_2} alt="HyperDX Login" size="md"/>

如果提示你创建一个 source，保留所有默认值，并将 `Table` 字段填写为 `otel_logs`。其他设置应会自动检测，此时可以点击 `Save New Source`。

:::note 创建 source
创建 source 的前提是 ClickHouse 中已存在数据表。如果你还没有数据，建议部署 ClickStack OpenTelemetry collector 来创建数据表。
:::

</VerticalStepper>

## 使用 Docker Compose \{#using-docker-compose\}

用户可以修改 [Docker Compose 配置](/use-cases/observability/clickstack/deployment/docker-compose)，以实现与本指南相同的效果，并从清单中移除 OTel collector 和 ClickHouse 实例。

## ClickStack OpenTelemetry collector \{#otel-collector\}

即使您在该栈之外自行管理 OpenTelemetry collector，我们仍然建议使用 ClickStack 提供的 collector 发行版。这样可以确保使用默认的 schema，并采用推荐的摄取最佳实践。

有关部署和配置独立 collector 的详细信息，请参阅 [&quot;Ingesting with OpenTelemetry&quot;](/use-cases/observability/clickstack/ingesting-data/otel-collector#modifying-otel-collector-configuration)。

<JSONSupport />

对于仅用于 HyperDX 的镜像，用户只需要设置参数 `BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true`，例如：

```shell
docker run -e BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true -e MONGO_URI=mongodb://YOUR_MONGODB_URI -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx
```
