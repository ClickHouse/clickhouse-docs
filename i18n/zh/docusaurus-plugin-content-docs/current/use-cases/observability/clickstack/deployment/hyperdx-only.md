---
'slug': '/use-cases/observability/clickstack/deployment/hyperdx-only'
'title': 'HyperDX 仅适用'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 4
'description': '仅部署 HyperDX'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import hyperdx_logs from '@site/static/images/use-cases/observability/hyperdx-logs.png';
import hyperdx_2 from '@site/static/images/use-cases/observability/hyperdx-2.png';
import JSONSupport from '@site/i18n/zh/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';

该选项旨在为已经运行的 ClickHouse 实例并填充了可观察性或事件数据的用户提供支持。

HyperDX 可以独立于其他堆栈使用，并且与任何数据模式兼容 - 不仅限于 OpenTelemetry (OTel)。这使其适合已经在 ClickHouse 上构建的自定义可观察性管道。

为启用完整功能，您必须提供一个 MongoDB 实例用于存储应用程序状态，包括仪表板、保存的搜索、用户设置和警报。

在此模式下，数据摄取完全由用户负责。您可以通过自己的托管 OpenTelemetry 收集器、客户端库的直接摄取、ClickHouse 原生表引擎（例如 Kafka 或 S3）、ETL 管道或像 ClickPipes 这样的托管摄取服务将数据摄取到 ClickHouse。该方法提供了最大的灵活性，适合已经操作 ClickHouse 并希望在其上添加 HyperDX 以进行可视化、搜索和警报的团队。

### 适合 {#suitable-for}

- 现有 ClickHouse 用户
- 自定义事件管道

## 部署步骤 {#deployment-steps}
<br/>

<VerticalStepper headerLevel="h3">

### 使用 Docker 部署 {#deploy-hyperdx-with-docker}

运行以下命令，根据需要修改 `YOUR_MONGODB_URI`。

```shell
docker run -e MONGO_URI=mongodb://YOUR_MONGODB_URI -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx
```

### 导航到 HyperDX UI {#navigate-to-hyperdx-ui}

访问 [http://localhost:8080](http://localhost:8080) 以访问 HyperDX UI。

创建一个用户，提供符合要求的用户名和密码。

点击 `Create` 后，您将被提示输入连接详情。

<Image img={hyperdx_login} alt="HyperDX UI" size="lg"/>

### 完成连接详情 {#complete-connection-details}

连接到您自己的外部 ClickHouse 集群，例如 ClickHouse Cloud。

<Image img={hyperdx_2} alt="HyperDX Login" size="md"/>

如果被提示创建源，请保留所有默认值，并在 `Table` 字段中填写值 `otel_logs`。所有其他设置应自动检测，您可以点击 `Save New Source`。

:::note 创建源
创建源需要在 ClickHouse 中存在表。如果没有数据，我们建议部署 ClickStack OpenTelemetry 收集器来创建表。
:::

</VerticalStepper>

## 使用 Docker Compose {#using-docker-compose}

用户可以修改 [Docker Compose 配置](/use-cases/observability/clickstack/deployment/docker-compose)，以达到本指南所示的相同效果，从清单中移除 OTel 收集器和 ClickHouse 实例。

## ClickStack OpenTelemetry 收集器 {#otel-collector}

即使您管理自己的 OpenTelemetry 收集器，而不依赖于堆栈中的其他组件，我们仍然建议使用 ClickStack 发行版的收集器。这确保使用默认模式并应用摄取的最佳实践。

有关部署和配置独立收集器的详细信息，请参见 [“使用 OpenTelemetry 摄取”](/use-cases/observability/clickstack/ingesting-data/otel-collector#modifying-otel-collector-configuration)。

<JSONSupport/>

对于仅限 HyperDX 的图像，用户只需设置 `BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true` 参数，例如：

```shell
docker run -e BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true -e MONGO_URI=mongodb://YOUR_MONGODB_URI -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx
```
