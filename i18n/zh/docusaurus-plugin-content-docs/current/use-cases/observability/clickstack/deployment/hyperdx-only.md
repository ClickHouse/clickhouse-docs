---
'slug': '/use-cases/observability/clickstack/deployment/hyperdx-only'
'title': 'HyperDX 仅限'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 4
'description': '仅部署 HyperDX'
---

import Image from '@theme/IdealImage';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import hyperdx_logs from '@site/static/images/use-cases/observability/hyperdx-logs.png';
import hyperdx_2 from '@site/static/images/use-cases/observability/hyperdx-2.png';

这个选项是为已经运行的 ClickHouse 实例并填充了可观察性或事件数据的用户设计的。

HyperDX 可以独立于其余堆栈使用，并且与任何数据架构兼容 - 不仅仅是 OpenTelemetry (OTel)。这使得它适用于已经在 ClickHouse 上构建的自定义可观察性管道。

要启用完整功能，您必须提供一个 MongoDB 实例来存储应用程序状态，包括仪表板、保存的搜索、用户设置和警报。

在这种模式下，数据摄取完全由用户负责。您可以使用自己托管的 OpenTelemetry 收集器、从客户端库直接摄取、ClickHouse 原生表引擎（如 Kafka 或 S3）、ETL 管道或管理的摄取服务（如 ClickPipes）将数据导入 ClickHouse。此方法提供了最大的灵活性，适合那些已经在操作 ClickHouse 的团队，并希望在其上层叠加 HyperDX 进行可视化、搜索和警报。

### 适合 {#suitable-for}

- 现有的 ClickHouse 用户
- 自定义事件管道

## 部署步骤 {#deployment-steps}
<br/>

<VerticalStepper headerLevel="h3">

### 使用 Docker 部署 {#deploy-hyperdx-with-docker}

运行以下命令，根据需要修改 `YOUR_MONGODB_URI`。

```bash
docker run -e MONGO_URI=mongodb://YOUR_MONGODB_URI -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx
```

### 访问 HyperDX 用户界面 {#navigate-to-hyperdx-ui}

访问 [http://localhost:8080](http://localhost:8080) 以访问 HyperDX 用户界面。

创建一个用户，提供符合要求的用户名和密码。

单击 `Create` 后，系统将提示您输入连接详细信息。

<Image img={hyperdx_login} alt="HyperDX UI" size="lg"/>

### 完善连接详细信息 {#complete-connection-details}

连接到您自己的外部 ClickHouse 集群，例如 ClickHouse Cloud。

<Image img={hyperdx_2} alt="HyperDX Login" size="md"/>

如果提示您创建源，请保留所有默认值，并在 `Table` 字段中填写 `otel_logs`。所有其他设置应自动检测，使您可以点击 `Save New Source`。

:::note 创建源
创建源需要在 ClickHouse 中存在表。如果您没有数据，我们建议部署 ClickStack OpenTelemetry 收集器以创建表。
:::

</VerticalStepper>

## 使用 Docker Compose {#using-docker-compose}

用户可以修改 [Docker Compose 配置](/use-cases/observability/clickstack/deployment/docker-compose) 以实现与本指南相同的效果，从清单中删除 OTel 收集器和 ClickHouse 实例。

## ClickStack OpenTelemetry 收集器 {#otel-collector}

即使您管理自己的 OpenTelemetry 收集器，而不依赖于堆栈中的其他组件，我们仍建议使用 ClickStack 版本的收集器。这确保了使用默认架构并应用最佳实践进行摄取。

有关部署和配置独立收集器的详细信息，请参见 ["使用 OpenTelemetry 摄取"](/use-cases/observability/clickstack/ingesting-data/otel-collector#modifying-otel-collector-configuration)。
