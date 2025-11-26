---
slug: /use-cases/observability/clickstack/deployment/hyperdx-only
title: '仅部署 HyperDX'
pagination_prev: null
pagination_next: null
sidebar_position: 4
description: '仅部署 HyperDX'
doc_type: 'guide'
keywords: ['HyperDX 独立部署', 'HyperDX 与 ClickHouse 集成', '仅部署 HyperDX', 'HyperDX Docker 安装', 'ClickHouse 可视化工具']
---

import Image from '@theme/IdealImage';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import hyperdx_logs from '@site/static/images/use-cases/observability/hyperdx-logs.png';
import hyperdx_2 from '@site/static/images/use-cases/observability/hyperdx-2.png';
import JSONSupport from '@site/docs/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';

此选项适用于已经有运行中的 ClickHouse 实例，并且其中已存有可观测性或事件数据的用户。

HyperDX 可以独立于其余栈组件使用，并且兼容任何数据模式（schema），不仅限于 OpenTelemetry (OTel)。这使其非常适合已经构建在 ClickHouse 之上的自定义可观测性数据管道。

要启用全部功能，需要提供一个 MongoDB实例，用于存储应用程序状态，包括仪表盘、已保存搜索、用户设置和告警。

在此模式下，数据摄取完全由用户自行负责。你可以使用自建的 OpenTelemetry collector、通过客户端库直接摄取、ClickHouse 原生表引擎（例如 Kafka 或 S3）、ETL 流水线，或 ClickPipes 等托管摄取服务将数据摄取到 ClickHouse 中。这种方式提供了最大灵活性，适合已经在运行 ClickHouse 并希望在其之上叠加 HyperDX 以实现可视化、搜索和告警的团队。

### 适用场景

* 现有 ClickHouse 用户
* 自定义事件数据管道


## 部署步骤 {#deployment-steps}
<br/>

<VerticalStepper headerLevel="h3">

### 使用 Docker 部署 {#deploy-hyperdx-with-docker}

运行以下命令，并根据需要修改 `YOUR_MONGODB_URI`。 

```shell
docker run -e MONGO_URI=mongodb://YOUR_MONGODB_URI -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx
```

### 访问 HyperDX UI {#navigate-to-hyperdx-ui}

访问 [http://localhost:8080](http://localhost:8080) 打开 HyperDX UI。

创建一个用户，并设置满足要求的用户名和密码。 

点击 `Create` 后，系统会提示填写连接信息。

<Image img={hyperdx_login} alt="HyperDX UI" size="lg"/>

### 完成连接信息 {#complete-connection-details}

连接到自己的外部 ClickHouse 集群，例如 ClickHouse Cloud。

<Image img={hyperdx_2} alt="HyperDX 登录" size="md"/>

如果系统提示创建 source（数据源），请保留所有默认值，并将 `Table` 字段设置为 `otel_logs`。其他所有设置应会自动检测，此时可以点击 `Save New Source`。

:::note 创建 source
创建 source 需要 ClickHouse 中已存在相应的表。如果还没有数据，建议部署 ClickStack OpenTelemetry collector 来创建这些表。
:::

</VerticalStepper>



## 使用 Docker Compose {#using-docker-compose}

用户可以修改 [Docker Compose 配置](/use-cases/observability/clickstack/deployment/docker-compose)，通过从 manifest 中移除 OTel collector 和 ClickHouse 实例，以实现与本指南相同的效果。



## ClickStack OpenTelemetry collector

即使您在独立于该栈中其他组件的情况下自行管理 OpenTelemetry collector，我们仍然建议使用 ClickStack 发行版的 collector。这样可以确保使用默认模式，并应用数据摄取方面的最佳实践。

有关部署和配置独立 collector 的详细信息，请参阅[《使用 OpenTelemetry 进行数据摄取》](/use-cases/observability/clickstack/ingesting-data/otel-collector#modifying-otel-collector-configuration)。

<JSONSupport />

对于仅包含 HyperDX 的镜像，用户只需要设置 `BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true` 参数，例如：

```shell
docker run -e BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true -e MONGO_URI=mongodb://YOUR_MONGODB_URI -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx
```
