---
slug: /use-cases/observability/clickstack/deployment/hyperdx-only
title: '仅部署 HyperDX'
pagination_prev: null
pagination_next: null
sidebar_position: 4
description: '仅部署 HyperDX'
doc_type: 'guide'
keywords: ['HyperDX 独立部署', 'HyperDX ClickHouse 集成', '仅部署 HyperDX', 'HyperDX Docker 安装', 'ClickHouse 可视化工具']
---

import Image from '@theme/IdealImage';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import hyperdx_logs from '@site/static/images/use-cases/observability/hyperdx-logs.png';
import hyperdx_2 from '@site/static/images/use-cases/observability/hyperdx-2.png';
import JSONSupport from '@site/i18n/zh/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';

如果您已经有一个正在运行的 ClickHouse 实例，并且其中已经写入了可观测性或事件数据，那么可以使用此选项。

HyperDX 可以独立于其余组件单独使用，并且兼容任意数据 schema——不仅限于 OpenTelemetry (OTel)。这使其非常适合已经基于 ClickHouse 构建的自定义可观测性管道。

要启用全部功能，您必须提供一个 MongoDB 实例，用于存储应用程序状态，包括仪表盘、已保存搜索、用户设置和告警。

在此模式下，数据摄取完全由用户自行负责。您可以使用自己托管的 OpenTelemetry collector、来自客户端库的直接摄取、ClickHouse 原生表引擎（例如 Kafka 或 S3）、ETL 管道，或 ClickPipes 等托管摄取服务将数据摄取到 ClickHouse 中。此方式提供最大灵活性，适合已经在运行 ClickHouse，并希望在其之上叠加 HyperDX 以实现可视化、搜索和告警的团队。


### 适用对象 \{#suitable-for\}

- 现有 ClickHouse 用户
- 自定义事件管道

## 部署步骤 \{#deployment-steps\}

<br/>

<VerticalStepper headerLevel="h3">

### 使用 Docker 部署 \{#deploy-hyperdx-with-docker\}

运行以下命令，并根据需要修改 `YOUR_MONGODB_URI`。 

```shell
docker run -e MONGO_URI=mongodb://YOUR_MONGODB_URI -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx
```

### 访问 HyperDX UI \{#navigate-to-hyperdx-ui\}

访问 [http://localhost:8080](http://localhost:8080) 以进入 HyperDX UI。

创建一个用户，并提供符合要求的用户名和密码。 

单击 `Create` 后，系统会提示您填写连接信息。

<Image img={hyperdx_login} alt="HyperDX UI" size="lg"/>

### 完成连接信息 \{#complete-connection-details\}

连接到您自己的外部 ClickHouse 集群，例如 ClickHouse Cloud。

<Image img={hyperdx_2} alt="HyperDX Login" size="md"/>

如果系统提示您创建一个 source，请保留所有默认值，并在 `Table` 字段中填入 `otel_logs`。其他设置应会自动检测，然后您即可单击 `Save New Source`。

:::note 创建 source
创建 source 之前，需要 ClickHouse 中已存在相应的表。如果您还没有数据，我们建议部署 ClickStack OpenTelemetry collector 来创建这些表。
:::

</VerticalStepper>

## 使用 Docker Compose \{#using-docker-compose\}

你可以修改 [Docker Compose 配置](/use-cases/observability/clickstack/deployment/docker-compose)，以实现与本指南相同的效果，同时从清单中移除 OTel collector 和 ClickHouse 实例。

## ClickStack OpenTelemetry collector \{#otel-collector\}

即使你在独立于该栈中其他组件的情况下自行管理 OpenTelemetry collector，我们仍然建议使用 ClickStack 发行版的 collector。这样可以确保使用默认 schema，并遵循摄取的最佳实践。

关于部署和配置独立 collector 的详细信息，请参阅[“Ingesting with OpenTelemetry”](/use-cases/observability/clickstack/ingesting-data/otel-collector#modifying-otel-collector-configuration)。

<JSONSupport />

对于仅 HyperDX 使用的镜像，用户只需将参数 `BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true` 设置为启用，例如：

```shell
docker run -e BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true -e MONGO_URI=mongodb://YOUR_MONGODB_URI -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx
```
