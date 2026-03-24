---
slug: /use-cases/observability/clickstack/deployment/clickstack-clickhouse-cloud
title: '托管版'
pagination_prev: null
pagination_next: null
sidebar_position: 1
toc_max_heading_level: 2
description: '部署托管版 ClickStack'
doc_type: 'guide'
keywords: ['clickstack', 'deployment', 'setup', 'configuration', 'observability']
---

import Image from '@theme/IdealImage';
import BetaBadge from '@theme/badges/BetaBadge';
import hyperdx_cloud_datasource from '@site/static/images/use-cases/observability/hyperdx_cloud_datasource.png';
import hyperdx_create_new_source from '@site/static/images/use-cases/observability/hyperdx_create_new_source.png';
import hyperdx_create_trace_datasource from '@site/static/images/use-cases/observability/hyperdx_create_trace_datasource.png';
import clickstack_ui_setup_ingestion from '@site/static/images/clickstack/clickstack-ui-setup-ingestion.png';
import read_only from '@site/static/images/clickstack/read-only-access.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';
import select_service from '@site/static/images/clickstack/select_service.png';
import select_source_clickstack_ui from '@site/static/images/clickstack/select-source-clickstack-ui.png';
import advanced_otel_collector_clickstack_ui from '@site/static/images/clickstack/advanced-otel-collector-clickstack-ui.png'
import otel_collector_start_clickstack_ui from '@site/static/images/clickstack/otel-collector-start-clickstack-ui.png';
import vector_config_clickstack_ui from '@site/static/images/clickstack/vector-config-clickstack-ui.png';
import clickstack_managed_ui from '@site/static/images/clickstack/getting-started/clickstack_managed_ui.png';
import JSONSupport from '@site/i18n/zh/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';
import ExampleOTelConfig from '@site/i18n/zh/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_config_example_otel.md';
import create_vector_datasource from '@site/static/images/clickstack/create-vector-datasource.png';
import SetupManagedIngestion from '@site/i18n/zh/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_setup_managed_ingestion.md';
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
  <TabItem value="创建" label="创建新服务" default>
    <br />

    <VerticalStepper headerLevel="h3">
      ### 创建新服务

      在 ClickHouse Cloud 登录页面中选择 `New service` 来创建一个新服务。

      <Image img={new_service} size="lg" alt="Service Service" border />

      ### 指定你的云厂商、区域和资源

      <ProviderSelection />

      ### 配置摄取

      服务创建完成后，确保已选中该服务，然后在左侧菜单中点击 &quot;ClickStack&quot;。

      <SetupManagedIngestion />

      ### 进入 ClickStack UI

      <NavigateClickStackUI />

      <br />
    </VerticalStepper>
  </TabItem>

  <TabItem value="选择" label="使用现有服务">
    <br />

    <VerticalStepper headerLevel="h3">
      ### 选择一个服务

      在 ClickHouse Cloud 主页中,选择您要启用托管 ClickStack 的服务。

      :::important 资源估算
      本指南假设您已预配置足够的资源来处理计划通过 ClickStack 摄取和查询的可观测性数据量。要估算所需资源，请参阅[资源估算](/use-cases/observability/clickstack/estimating-resources)指南。

      如果您的 ClickHouse 服务已经承载现有工作负载 (例如实时应用分析) ，我们建议使用 [ClickHouse Cloud 的 warehouses 功能](/cloud/reference/warehouses)创建子服务，以隔离可观测性工作负载。这样可以确保现有应用程序不受影响，同时保持两个服务都能访问数据集。
      :::

      <Image img={select_service} alt="选择服务" size="lg" />

      ### 进入 ClickStack UI

      从左侧导航菜单中选择 &#39;ClickStack&#39;。您将被重定向到 ClickStack UI，并根据您的 ClickHouse Cloud 权限自动完成身份验证。

      如果您的服务中已存在 OpenTelemetry 表,系统将自动检测并创建相应的数据源。

      :::note 数据源自动检测
      自动检测依赖于 ClickStack 发行版 OpenTelemetry 采集器提供的标准 OpenTelemetry 表架构。系统会为包含最完整表集的数据库创建数据源。如有需要,可以将其他表添加为[单独的数据源](/use-cases/observability/clickstack/config#datasource-settings)。
      :::

      如果自动检测成功,您将被引导至搜索视图,即可立即开始探索数据。

      <Image img={clickstack_managed_ui} size="lg" alt="ClickStack UI" />

      如果此步骤成功,那么就大功告成了 🎉,否则请继续进行摄取设置。

      ### 配置摄取

      如果自动检测失败,或者您没有现有表,系统将提示您设置数据摄取。

      <Image img={clickstack_ui_setup_ingestion} alt="ClickStack UI 摄取设置" size="lg" />

      选择&quot;开始摄取&quot;,系统将提示您选择摄取源。托管版 ClickStack 支持 OpenTelemetry 和 [Vector](https://vector.dev/) 作为其主要摄取源。此外,用户也可以使用任何 [ClickHouse Cloud 支持的集成](/integrations),以自定义 schema 直接向 ClickHouse 发送数据。

      <Image img={select_source_clickstack_ui} size="lg" alt="选择摄取源 - ClickStack UI" border />

      :::note[推荐使用 OpenTelemetry]
      强烈建议使用 OpenTelemetry 作为摄取格式。
      它提供了最简单、最优化的体验，并配备了专为与 ClickStack 高效协作而设计的开箱即用架构。
      :::

      <Tabs groupId="ingestion-sources-existing">
        <TabItem value="open-telemetry" label="OpenTelemetry" default>
          要将 OpenTelemetry 数据发送到托管的 ClickStack，推荐使用 OpenTelemetry Collector。Collector 充当网关，从您的应用 (以及其他 Collector) 接收 OpenTelemetry 数据，并将其转发到 ClickHouse Cloud。

          如果当前还没有运行中的 Collector，请按照下面的步骤启动一个。如果已经有现有的 Collector，也提供了一个配置示例。

          ### 启动 Collector

          下面假定您采用推荐路径：使用 **ClickStack 发行版的 OpenTelemetry Collector**，它包含了额外的处理流程，并且专门针对 ClickHouse Cloud 做了优化。如果您希望使用自己的 OpenTelemetry Collector，请参见 [&quot;配置现有 Collector。&quot;](#configure-existing-collectors)

          要快速开始，请复制并运行所示的 Docker 命令。

          <Image img={otel_collector_start_clickstack_ui} size="md" alt="OTel collector 源" />

          **使用您在创建服务时记录的服务凭据修改此命令。**

          :::note[部署到生产环境]
          虽然此命令使用 `default` 用户连接到托管 ClickStack，但在[进入生产环境](/use-cases/observability/clickstack/production#create-a-database-ingestion-user-managed)时，您应该创建一个专用用户，并相应修改配置。
          :::

          运行这一条命令即可启动 ClickStack Collector，并在 4317 (gRPC) 和 4318 (HTTP) 端口上暴露 OTLP 端点。如果您已经有 OpenTelemetry 的埋点和 Agent，可以立即开始向这些端点发送遥测数据。

          ### 配置现有 Collector

          您也可以配置自己已有的 OpenTelemetry Collector，或使用您自己的 Collector 发行版。

          :::note[需要 ClickHouse exporter]
          如果您在使用自己的发行版，例如 [contrib 镜像](https://github.com/open-telemetry/opentelemetry-collector-contrib)，请确保其中包含 [ClickHouse exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter)。
          :::

          为此，我们提供了一个示例 OpenTelemetry Collector 配置，它使用 ClickHouse exporter 及相应的设置，并暴露 OTLP 接收器。该配置与 ClickStack 发行版所期望的接口和行为保持一致。

          <ExampleOTelConfig />

          <Image img={advanced_otel_collector_clickstack_ui} size="lg" alt="高级 OTel collector 源" />

          如需了解更多配置 OpenTelemetry Collector 的细节，请参见 [&quot;使用 OpenTelemetry 进行摄取。&quot;](/use-cases/observability/clickstack/ingesting-data/opentelemetry)

          ### 启动摄取 (可选)

          如果您有要使用 OpenTelemetry 进行埋点的现有应用或基础设施，请转到“连接应用”中链接的相关指南。

          要对应用进行埋点以收集跟踪 (traces) 和日志 (logs) ，请使用[受支持的语言 SDKs](/use-cases/observability/clickstack/sdks)，它们会将数据发送到作为网关的 OpenTelemetry Collector，以将数据摄取到托管 ClickStack 中。

          可以使用以 agent 模式运行的 [OpenTelemetry Collectors 收集日志](/use-cases/observability/clickstack/integrations/host-logs)，并将数据转发到同一个 Collector。对于 Kubernetes 监控，请遵循[专用指南](/use-cases/observability/clickstack/integrations/kubernetes)。有关其他集成，请参见我们的[快速入门指南](/use-cases/observability/clickstack/integration-guides)。

          <br />
        </TabItem>

        <TabItem value="vector" label="Vector" default>
          [Vector](https://vector.dev) 是一个高性能、与厂商无关的可观测性数据管道，因其灵活性和低资源占用而在日志摄取场景中尤为流行。

          在将 Vector 与 ClickStack 结合使用时，用户需要自行定义 schema。这些 schema 可以遵循 OpenTelemetry 约定，也可以完全自定义，用于表示用户自定义的事件结构。

          :::note 需要时间戳
          对托管版 ClickStack 的唯一严格要求是，数据中必须包含一个**时间戳列** (或等效的时间字段) ，并可在 ClickStack UI 中配置数据源时进行声明。
          :::

          下面的内容假定您已经有一个正在运行的 Vector 实例，且已预先配置好数据摄取管道，并在持续投递数据。

          ### 创建数据库和表

          Vector 要求在进行数据摄取之前预先定义好表和 schema。

          首先创建一个数据库。这可以通过 [ClickHouse Cloud 控制台](/cloud/get-started/sql-console) 完成。

          例如，为日志创建一个数据库：

          ```sql
          CREATE DATABASE IF NOT EXISTS logs
          ```

          然后创建一个表，使其 schema 与你的日志数据结构一致。下面的示例假设使用经典的 Nginx 访问日志格式：

          ```sql
          CREATE TABLE logs.nginx_logs
          (
              `time_local` DateTime,
              `remote_addr` IPv4,
              `remote_user` LowCardinality(String),
              `request` String,
              `status` UInt16,
              `body_bytes_sent` UInt64,
              `http_referer` String,
              `http_user_agent` String,
              `http_x_forwarded_for` LowCardinality(String),
              `request_time` Float32,
              `upstream_response_time` Float32,
              `http_host` String
          )
          ENGINE = MergeTree
          ORDER BY (toStartOfMinute(time_local), status, remote_addr);
          ```

          你的表必须与 Vector 生成的输出 schema 保持一致。根据你的数据需要调整该 schema，并遵循推荐的 [schema 最佳实践](/docs/best-practices/select-data-types)。

          强烈建议先了解 ClickHouse 中 [主键](/docs/primary-indexes) 的工作方式，并根据访问模式选择排序键 (ordering key) 。关于如何选择主键，请参阅 [ClickStack 专用](/use-cases/observability/clickstack/performance_tuning#choosing-a-primary-key) 指南。

          创建好表后，复制显示的配置代码片段。根据需要调整输入以对接你现有的数据管道，以及目标表和数据库。凭据应已自动填入。

          <Image img={vector_config_clickstack_ui} size="lg" alt="Vector configuration" />

          有关使用 Vector 摄取数据的更多示例，请参阅[&quot;Ingesting with Vector&quot;](/use-cases/observability/clickstack/ingesting-data/vector)或 [Vector ClickHouse sink 文档](https://vector.dev/docs/reference/configuration/sinks/clickhouse/)以获取高级选项。

          <br />
        </TabItem>
      </Tabs>

      ### 进入 ClickStack UI

      完成摄取设置并开始发送数据后,选择&quot;下一步&quot;。

      <Tabs groupId="datsources-sources-existing">
        <TabItem value="open-telemetry" label="OpenTelemetry" default>
          如果已经按照本指南使用 OpenTelemetry 摄取了数据，则会自动创建数据源，无需进行额外配置。你可以立即开始探索 ClickStack。系统会将你引导到搜索视图，并自动为你选择一个数据源，以便你可以立刻开始查询。

          <Image img={clickstack_managed_ui} size="lg" alt="ClickStack UI" />

          就这些——一切就绪 🎉。

          <br />
        </TabItem>

        <TabItem value="vector" label="Vector" default>
          如果是通过 Vector 或其他来源摄取数据，你将会被提示配置数据源。

          <Image img={create_vector_datasource} alt="创建数据源 - Vector" size="lg" />

          上述配置假定使用 Nginx 风格的 schema，并使用 `time_local` 列作为时间戳。该列在可能的情况下应为主键中声明的时间戳列。**此列为必需列**。

          我们还建议更新 `Default SELECT`，以显式定义在日志视图中返回的列。如果存在其他字段，例如服务名、日志级别或正文列 (body 列) ，也可以在这里进行配置。如果用于展示时间戳的列与表主键中使用的列不同，也可以在此进行覆盖。

          在上面的示例中，数据中不存在 `Body` 列。相反，它是通过一个 SQL 表达式定义的，该表达式使用可用字段重建一条 Nginx 日志行。

          有关其他可用选项，请参阅[配置参考](/use-cases/observability/clickstack/config#hyperdx)。

          配置完成后，点击“Save”开始探索你的数据。

          <Image img={clickstack_managed_ui} size="lg" alt="ClickStack UI" />

          <br />
        </TabItem>
      </Tabs>
    </VerticalStepper>
  </TabItem>
</Tabs>

## 其他任务 {#additional-tasks}

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

### 在只读计算环境中使用 ClickStack \{#clickstack-read-only-compute\}

ClickStack UI 可以完全运行在只读的 ClickHouse Cloud 服务之上。当需要隔离摄取与查询工作负载时，推荐采用这种部署方式。

#### ClickStack 如何选择 compute {#how-clickstack-selects-compute}

ClickStack UI 始终连接到在 ClickHouse Cloud 控制台中启动 ClickStack 的 ClickHouse service。

这意味着：

* 如果从只读 service 打开 ClickStack，所有由 ClickStack UI 发出的查询都会在该只读 compute 上运行。
* 如果从读写 service 打开 ClickStack，ClickStack 将改为使用该 compute。

在 ClickStack 内部无需任何额外配置即可实现只读行为。

#### 推荐设置 {#recommended-setup}

要在只读计算环境上运行 ClickStack：

1. 在数据仓库中创建或选择一个配置为只读的 ClickHouse Cloud 服务。
2. 在 ClickHouse Cloud 控制台中，选择该只读服务。
3. 通过左侧导航菜单启动 ClickStack。

启动后，ClickStack UI 将自动绑定到此只读服务。

### 添加更多数据源 \{#adding-data-sources\}

ClickStack 对 OpenTelemetry 提供原生支持，但并不限于 OpenTelemetry —— 如有需要，你也可以使用自己的表结构。

以下内容说明用户如何在自动配置的数据源之外添加更多数据源。

#### 使用 OpenTelemetry schema  {#using-otel-schemas}

如果你使用 OTel collector 在 ClickHouse 中创建数据库和数据表，请在创建数据源模型时保留所有默认值，并将 `Table` 字段填写为 `otel_logs`，以创建日志数据源。其他所有设置应会被自动检测到，然后点击 `Save New Source` 即可。

<Image img={hyperdx_cloud_datasource} alt="ClickHouse Cloud HyperDX 数据源" size="lg"/>

要为 traces 和 OTel 指标创建数据源，你可以从顶部菜单中选择 `Create New Source`。

<Image img={hyperdx_create_new_source} alt="ClickStack 创建新数据源" size="lg"/>

从这里开始，选择所需的数据源类型，然后选择相应的数据表，例如对于 traces，选择数据表 `otel_traces`。所有设置应会被自动检测到。

<Image img={hyperdx_create_trace_datasource} alt="ClickStack 创建 trace 数据源" size="lg"/>

:::note 关联来源
请注意，ClickStack 中的不同数据源（例如 logs 和 traces）可以彼此关联。要启用此功能，需要在每个数据源上进行额外配置。例如，在日志数据源中，你可以指定对应的 trace 数据源，在 traces 数据源中也可以指定对应的日志数据源。有关更多详细信息，请参阅 ["关联来源"](/use-cases/observability/clickstack/config#correlated-sources)。
:::

#### 使用自定义 Schema {#using-custom-schemas}

希望将 ClickStack 连接到已有数据的现有服务的用户，可以根据需要配置数据库和表。如果表符合 ClickHouse 的 OpenTelemetry Schema，这些设置将会被自动检测。

如果使用自定义 Schema，建议创建一个 Logs 数据源，并确保指定所有必需字段——详情参见[“Log source settings”](/use-cases/observability/clickstack/config#logs)。

<JSONSupport/>

此外，您还应联系 support@clickhouse.com，以确保在您的 ClickHouse Cloud 服务上已启用 JSON 支持。