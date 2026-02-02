---
slug: /use-cases/observability/clickstack/deployment/clickstack-clickhouse-cloud
title: '托管版'
pagination_prev: null
pagination_next: null
sidebar_position: 1
description: '部署托管版 ClickStack'
doc_type: 'guide'
keywords: ['clickstack', 'deployment', 'setup', 'configuration', 'observability']
---

import Image from '@theme/IdealImage';
import BetaBadge from '@theme/badges/BetaBadge';
import hyperdx_cloud_datasource from '@site/static/images/use-cases/observability/hyperdx_cloud_datasource.png';
import hyperdx_create_new_source from '@site/static/images/use-cases/observability/hyperdx_create_new_source.png';
import hyperdx_create_trace_datasource from '@site/static/images/use-cases/observability/hyperdx_create_trace_datasource.png';
import read_only from '@site/static/images/clickstack/read-only-access.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';
import select_service from '@site/static/images/clickstack/select_service.png';
import JSONSupport from '@site/i18n/zh/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';
import SetupManagedIngestion from '@site/i18n/zh/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_setup_managed_ingestion.md';
import StartManagedIngestion from '@site/i18n/zh/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_start_managed_ingestion.md';
import NavigateClickStackUI from '@site/i18n/zh/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_navigate_managed.md';
import ProviderSelection from '@site/i18n/zh/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_select_provider.md';
import UseCaseSelector from '@site/i18n/zh/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_select_usecase.md';
import new_service from '@site/static/images/clickstack/getting-started/new_service.png';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<BetaBadge />

::::note[测试版功能]
此功能目前在 ClickHouse Cloud 处于测试阶段（Beta）。
::::

本**指南适用于已有 ClickHouse Cloud 账号的用户**。如果你刚接触 ClickHouse Cloud，建议先阅读 ClickStack 托管部署的[入门指南](/use-cases/observability/clickstack/getting-started/managed)。

在此部署模式下，ClickHouse 和 ClickStack UI（HyperDX）都托管在 ClickHouse Cloud 中，从而最大程度减少用户需要自托管的组件数量。

除了降低基础设施管理开销之外，此部署模式还确保身份验证与 ClickHouse Cloud 的 SSO/SAML 集成。与自托管部署不同，你无需再准备 MongoDB 实例来存储应用状态——例如仪表盘、已保存搜索、用户设置和告警。用户还将受益于：

* 计算与存储解耦的自动扩缩容
* 基于对象存储的低成本、几乎无限的保留期
* 使用 Warehouse（仓库）独立隔离读写工作负载的能力
* 集成身份认证
* 自动化备份
* 安全与合规特性
* 无缝升级

在此模式下，数据摄取完全由用户负责。你可以使用自托管的 OpenTelemetry collector、客户端库直接摄取、ClickHouse 原生表引擎（如 Kafka 或 S3）、ETL 管道，或 ClickPipes——ClickHouse Cloud 的托管摄取服务——将数据摄取到托管型 ClickStack 中。这种方式为运行 ClickStack 提供了最简单且性能最佳的路径。


### 适用场景 \{#suitable-for\}

此部署模式在以下场景中尤其适用：

1. 你已经在 ClickHouse Cloud 中存有可观测性数据，并希望通过 ClickStack 对其进行可视化。
2. 你运行大规模可观测性部署，并且需要在 ClickHouse Cloud 上运行的 ClickStack 所提供的专用性能和可扩展性。
3. 你已经在使用 ClickHouse Cloud 进行分析，并希望使用 ClickStack 的埋点库对应用进行观测，将数据发送到同一个集群。在这种情况下，我们建议使用 [warehouses](/cloud/reference/warehouses) 为可观测性工作负载隔离计算资源。

## 设置步骤 \{#setup-steps\}

本指南假设你已经创建了一个 ClickHouse Cloud 服务。如果你还没有创建服务，请按照托管 ClickStack 的[快速开始](/use-cases/observability/clickstack/getting-started/managed)指南进行操作。完成后，你将获得一个与本指南假定起点状态相同的服务，即已启用 ClickStack 并准备好接收可观测性数据。

<Tabs groupId="service-create-select">
<TabItem value="select" label="使用现有服务" default>

<VerticalStepper headerLevel="h3">

### 选择服务 \{#select-service\}

在 ClickHouse Cloud 登录页中，选择你希望为其启用托管 ClickStack 的服务。

:::important 资源估算
本指南假设你已经预留了足够的资源，用于处理计划通过 ClickStack 摄取和查询的可观测性数据量。要估算所需资源，请参考[生产环境指南](/use-cases/observability/clickstack/production#estimating-resources)。 

如果你的 ClickHouse 服务已经承载了现有工作负载（例如实时应用分析），我们建议使用 [ClickHouse Cloud 的 warehouses 功能](/cloud/reference/warehouses)创建一个子服务，以隔离可观测性工作负载。这样可以确保现有应用不会受到干扰，同时仍然可以从两个服务访问相同的数据集。
:::

<Image img={select_service} alt="选择服务" size="md"/>

从左侧导航菜单中选择 “ClickStack”。

### 配置摄取 \{#setup-ingestion\}

<SetupManagedIngestion/>

### 启动摄取 \{#start-ingestion\}

<StartManagedIngestion/>

### 访问 ClickStack UI \{#navigate-to-clickstack-ui-cloud\}

<NavigateClickStackUI/>

</VerticalStepper>

</TabItem>
<TabItem value="create" label="创建新服务" default>

<VerticalStepper headerLevel="h3">

### 创建新服务 \{#create-a-service\}

在 ClickHouse Cloud 登录页中，选择 `New service` 以创建新服务。

<Image img={new_service} size="md" alt='服务 Service' border/>

### 选择你的用例 \{#select-your-use-case\}

<UseCaseSelector/>

### 指定云厂商、区域和数据规模 \{#specify-your-data-size\}

<ProviderSelection/>

### 配置摄取 \{#setup-ingestion-create-new\}

<SetupManagedIngestion/>

### 启动摄取 \{#start-ingestion-create-new\}

<StartManagedIngestion/>

### 访问 ClickStack UI \{#navigate-to-clickstack-ui-cloud-create-new\}

<NavigateClickStackUI/>

</VerticalStepper>

</TabItem>
</Tabs>

## 其他任务 \{#additional-tasks\}

### 为 Managed ClickStack 授予访问权限 \{#configure-access\}

1. 在 ClickHouse Cloud 控制台中进入你的服务
2. 前往 **Settings** → **SQL Console Access**
3. 为每个用户设置合适的权限级别：
   - **Service Admin → Full Access** - 启用告警所必需
   - **Service Read Only → Read Only** - 可以查看可观测性数据并创建仪表板
   - **No access** - 无法访问 HyperDX

<Image img={read_only} alt="ClickHouse Cloud 只读" size="md"/>

:::important 告警功能需要管理员访问权限
要启用告警，必须至少有一名具有 **Service Admin** 权限（在 SQL Console Access 下拉菜单中映射为 **Full Access**）的用户至少登录一次 HyperDX。这样会在数据库中自动创建一个用于运行告警查询的专用用户。
:::

### 添加更多数据源 \{#adding-data-sources\}

ClickStack 对 OpenTelemetry 提供原生支持，但并不限于 OpenTelemetry —— 如有需要，你也可以使用自己的表结构。

以下内容说明用户如何在自动配置的数据源之外添加更多数据源。

#### 使用 OpenTelemetry schema  \{#using-otel-schemas\}

如果你使用 OTel collector 在 ClickHouse 中创建数据库和数据表，请在创建数据源模型时保留所有默认值，并将 `Table` 字段填写为 `otel_logs`，以创建日志数据源。其他所有设置应会被自动检测到，然后点击 `Save New Source` 即可。

<Image img={hyperdx_cloud_datasource} alt="ClickHouse Cloud HyperDX 数据源" size="lg"/>

要为 traces 和 OTel 指标创建数据源，你可以从顶部菜单中选择 `Create New Source`。

<Image img={hyperdx_create_new_source} alt="ClickStack 创建新数据源" size="lg"/>

从这里开始，选择所需的数据源类型，然后选择相应的数据表，例如对于 traces，选择数据表 `otel_traces`。所有设置应会被自动检测到。

<Image img={hyperdx_create_trace_datasource} alt="ClickStack 创建 trace 数据源" size="lg"/>

:::note 关联来源
请注意，ClickStack 中的不同数据源（例如 logs 和 traces）可以彼此关联。要启用此功能，需要在每个数据源上进行额外配置。例如，在日志数据源中，你可以指定对应的 trace 数据源，在 traces 数据源中也可以指定对应的日志数据源。有关更多详细信息，请参阅 ["关联来源"](/use-cases/observability/clickstack/config#correlated-sources)。
:::

#### 使用自定义 Schema \{#using-custom-schemas\}

希望将 HyperDX 连接到已有数据的现有服务的用户，可以根据需要配置数据库和表。如果表符合 ClickHouse 的 OpenTelemetry Schema，这些设置将会被自动检测。

如果使用自定义 Schema，建议创建一个 Logs 数据源，并确保指定所有必需字段——详情参见[“Log source settings”](/use-cases/observability/clickstack/config#logs)。

<JSONSupport/>

此外，您还应联系 support@clickhouse.com，以确保在您的 ClickHouse Cloud 服务上已启用 JSON 支持。