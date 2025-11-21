---
slug: /use-cases/observability/clickstack/deployment/hyperdx-only
title: "仅 HyperDX"
pagination_prev: null
pagination_next: null
sidebar_position: 4
description: "仅部署 HyperDX"
doc_type: "guide"
keywords:
  [
    "HyperDX 独立部署",
    "HyperDX ClickHouse 集成",
    "仅部署 HyperDX",
    "HyperDX Docker 安装",
    "ClickHouse 可视化工具"
  ]
---

import Image from "@theme/IdealImage"
import hyperdx_login from "@site/static/images/use-cases/observability/hyperdx-login.png"
import hyperdx_logs from "@site/static/images/use-cases/observability/hyperdx-logs.png"
import hyperdx_2 from "@site/static/images/use-cases/observability/hyperdx-2.png"
import JSONSupport from "@site/docs/use-cases/observability/clickstack/deployment/_snippets/_json_support.md"

此选项专为已拥有运行中的 ClickHouse 实例且已填充可观测性或事件数据的用户而设计。

HyperDX 可以独立于其他组件使用,并且兼容任何数据模式——不仅限于 OpenTelemetry (OTel)。这使其适用于已在 ClickHouse 上构建的自定义可观测性管道。

要启用完整功能,您必须提供一个 MongoDB 实例来存储应用程序状态,包括仪表板、已保存的搜索、用户设置和告警。

在此模式下,数据摄取完全由用户负责。您可以使用自己托管的 OpenTelemetry 收集器、客户端库直接摄取、ClickHouse 原生表引擎(如 Kafka 或 S3)、ETL 管道或 ClickPipes 等托管摄取服务将数据摄取到 ClickHouse 中。这种方法提供了最大的灵活性,适合已经运营 ClickHouse 并希望在其上层部署 HyperDX 以实现可视化、搜索和告警的团队。

### 适用于 {#suitable-for}

- 现有 ClickHouse 用户
- 自定义事件管道


## 部署步骤 {#deployment-steps}

<br />

<VerticalStepper headerLevel="h3">

### 使用 Docker 部署 {#deploy-hyperdx-with-docker}

运行以下命令,根据需要修改 `YOUR_MONGODB_URI`。

```shell
docker run -e MONGO_URI=mongodb://YOUR_MONGODB_URI -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx
```

### 访问 HyperDX 用户界面 {#navigate-to-hyperdx-ui}

访问 [http://localhost:8080](http://localhost:8080) 进入 HyperDX 用户界面。

创建用户,提供符合要求的用户名和密码。

点击 `Create` 后,系统将提示您输入连接详细信息。

<Image img={hyperdx_login} alt='HyperDX 用户界面' size='lg' />

### 填写连接详细信息 {#complete-connection-details}

连接到您自己的外部 ClickHouse 集群,例如 ClickHouse Cloud。

<Image img={hyperdx_2} alt='HyperDX 登录' size='md' />

如果系统提示创建数据源,请保留所有默认值,并在 `Table` 字段中填入值 `otel_logs`。所有其他设置应会自动检测,然后您可以点击 `Save New Source`。

:::note 创建数据源
创建数据源需要 ClickHouse 中存在表。如果您没有数据,我们建议部署 ClickStack OpenTelemetry 收集器来创建表。
:::

</VerticalStepper>


## 使用 Docker Compose {#using-docker-compose}

用户可以修改 [Docker Compose 配置](/use-cases/observability/clickstack/deployment/docker-compose)来实现与本指南相同的效果,只需从配置清单中移除 OTel 收集器和 ClickHouse 实例即可。


## ClickStack OpenTelemetry 收集器 {#otel-collector}

即使您独立于堆栈中的其他组件自行管理 OpenTelemetry 收集器,我们仍然建议使用 ClickStack 发行版的收集器。这样可以确保使用默认架构并应用数据摄取的最佳实践。

有关部署和配置独立收集器的详细信息,请参阅["使用 OpenTelemetry 摄取数据"](/use-cases/observability/clickstack/ingesting-data/otel-collector#modifying-otel-collector-configuration)。

<JSONSupport />

对于仅限 HyperDX 的镜像,用户只需设置 `BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true` 参数即可,例如:

```shell
docker run -e BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true -e MONGO_URI=mongodb://YOUR_MONGODB_URI -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx
```
