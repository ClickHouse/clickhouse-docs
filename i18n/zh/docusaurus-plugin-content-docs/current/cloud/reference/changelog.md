---
'slug': '/whats-new/cloud'
'sidebar_label': '云平台更新日志'
'title': '云平台更新日志'
'description': 'ClickHouse 云平台更新日志，提供每个 ClickHouse 云平台版本中的新功能描述'
---

import Image from '@theme/IdealImage';
import add_marketplace from '@site/static/images/cloud/reference/add_marketplace.png';
import beta_dashboards from '@site/static/images/cloud/reference/beta_dashboards.png';
import api_endpoints from '@site/static/images/cloud/reference/api_endpoints.png';
import cross_vpc from '@site/static/images/cloud/reference/cross-vpc-clickpipes.png';
import nov_22 from '@site/static/images/cloud/reference/nov-22-dashboard.png';
import private_endpoint from '@site/static/images/cloud/reference/may-30-private-endpoints.png';
import notifications from '@site/static/images/cloud/reference/nov-8-notifications.png';
import kenesis from '@site/static/images/cloud/reference/may-17-kinesis.png';
import s3_gcs from '@site/static/images/cloud/reference/clickpipes-s3-gcs.png';
import tokyo from '@site/static/images/cloud/reference/create-tokyo-service.png';
import cloud_console from '@site/static/images/cloud/reference/new-cloud-console.gif';
import copilot from '@site/static/images/cloud/reference/nov-22-copilot.gif';
import latency_insights from '@site/static/images/cloud/reference/oct-4-latency-insights.png';
import cloud_console_2 from '@site/static/images/cloud/reference/aug-15-compute-compute.png';
import compute_compute from '@site/static/images/cloud/reference/july-18-table-inspector.png';
import query_insights from '@site/static/images/cloud/reference/june-28-query-insights.png';
import prometheus from '@site/static/images/cloud/reference/june-28-prometheus.png';
import kafka_config from '@site/static/images/cloud/reference/june-13-kafka-config.png';
import fast_releases from '@site/static/images/cloud/reference/june-13-fast-releases.png';
import share_queries from '@site/static/images/cloud/reference/may-30-share-queries.png';
import query_endpoints from '@site/static/images/cloud/reference/may-17-query-endpoints.png';

在此 ClickHouse Cloud 更新日志的基础上，请参阅 [Cloud Compatibility](/cloud/reference/cloud-compatibility.md) 页面。
## 2025年5月16日 {#may-16-2025}

- 引入了资源利用率仪表板，该仪表板提供了 ClickHouse Cloud 中服务使用的资源视图。以下指标从系统表中提取，并显示在此仪表板上：
  * 内存和 CPU：`CGroupMemoryTotal`（分配内存）、`CGroupMaxCPU`（分配 CPU）、`MemoryResident`（使用的内存）和 `ProfileEvent_OSCPUVirtualTimeMicroseconds`（使用的 CPU）的图表
  * 数据传输：显示 ClickHouse Cloud 的数据输入和输出情况的图表。了解更多信息 [在这里](/cloud/manage/network-data-transfer)。
- 我们很高兴地宣布推出新的 ClickHouse Cloud Prometheus/Grafana 插件，旨在简化 ClickHouse Cloud 服务的监控。
  该插件使用我们与 Prometheus 兼容的 API 端点，将 ClickHouse 指标无缝集成到您现有的 Prometheus 和 Grafana 设置中。它包括一个预配置的仪表板，使您能够实时查看服务的健康状况和性能。请参阅发布的 [博客](https://clickhouse.com/blog/monitor-with-new-prometheus-grafana-mix-in) 以了解更多信息。
  
## 2025年4月18日 {#april-18-2025}

- 引入了新的 **Member** 组织级角色和两个新的服务级角色：**Service Admin** 和 **Service Read Only**。
  **Member** 是一个组织级角色，默认分配给 SAML SSO 用户，仅提供登录和个人资料更新权限。**Service Admin** 和 **Service Read Only** 角色可以分配给具有 **Member**、**Developer** 或 **Billing Admin** 角色的用户。有关更多信息，请参阅 [“在 ClickHouse Cloud 中的访问控制”](https://clickhouse.com/docs/cloud/security/cloud-access-management/overview)。
- ClickHouse Cloud 现在在以下区域为 **Enterprise** 客户提供 **HIPAA** 和 **PCI** 服务：AWS eu-central-1，AWS eu-west-2，AWS us-east-2。
- 引入了 **ClickPipes 的用户通知**。此功能通过电子邮件、ClickHouse Cloud UI 和 Slack 自动发送 ClickPipes 故障的警报。默认启用电子邮件和 UI 通知，并可以按管道进行配置。对于 **Postgres CDC ClickPipes**，警报还涵盖复制槽阈值（可在 **Settings** 选项卡中配置）、特定错误类型，以及自助解决故障的步骤。
- **MySQL CDC 私有预览** 现已开放。此功能让客户可以通过几次点击将 MySQL 数据库复制到 ClickHouse Cloud，快速进行分析并消除对外部 ETL 工具的需求。该连接器支持连续复制和一次性迁移，无论 MySQL 是在云中（RDS、Aurora、Cloud SQL、Azure 等）还是本地。您可以通过 [此链接](https://clickhouse.com/cloud/clickpipes/mysql-cdc-connector) 注册私有预览。
- 引入了 **ClickPipes 的 AWS PrivateLink**。您可以使用 AWS PrivateLink 在 VPC、AWS 服务、您本地系统与 ClickHouse Cloud 之间建立安全连接。此操作可以在不暴露流量到公共互联网的情况下，从 Postgres、MySQL 和 AWS 上的 MSK 等来源移动数据。它还支持通过 VPC 服务端点进行跨区域访问。
  PrivateLink 连接设定现已 [完全自助](https://clickhouse.com/docs/integrations/clickpipes/aws-privatelink)。
  
## 2025年4月4日 {#april-4-2025}

- 对 ClickHouse Cloud 的 Slack 通知：ClickHouse Cloud 现在支持 Slack 通知，适用于计费、扩容和 ClickPipes 事件，此外还包括控制台内和电子邮件通知。这些通知通过 ClickHouse Cloud Slack 应用程序发送。组织管理员可以通过通知中心配置这些通知，指定发送通知的 Slack 频道。
- 运行生产和开发服务的用户将看到其账单上的 ClickPipes 和数据传输使用费用。有关更多详细信息，请参考 2025年1月 [公告](/cloud/manage/jan-2025-faq/pricing-dimensions)。

## 2025年3月21日 {#march-21-2025}

- AWS 上的跨区域 Private Link 连接现已进入公测。请参考 ClickHouse Cloud 私有链接 [文档](/manage/security/aws-privatelink) 以获取设置详细信息和支持的区域列表。
- AWS 上可用的最大副本大小现在设定为 236 GiB RAM。这样可以有效利用资源，同时确保为后台进程分配资源。

## 2025年3月7日 {#march-7-2025}

- 新的 `UsageCost` API 端点：API 规范现在支持一个新的端点，用于检索使用信息。该端点是组织级的，使用成本可以查询最多 31 天。可以检索的指标包括存储、计算、数据传输和 ClickPipes。有关详细信息，请参阅 [文档](https://clickhouse.com/docs/cloud/manage/api/usageCost-api-reference)。
- Terraform 提供的 [v2.1.0](https://registry.terraform.io/providers/ClickHouse/clickhouse/2.1.0/docs/resources/service#nestedatt--endpoints_configuration) 版本支持启用 MySQL 端点。

## 2025年2月21日 {#february-21-2025}
### ClickHouse 自带云（BYOC）在 AWS 上现已正式发布！ {#clickhouse-byoc-for-aws-ga}

在这种部署模型中，数据平面组件（计算、存储、备份、日志、指标）运行在客户 VPC 中，而控制平面（网络访问、API 和计费）保留在 ClickHouse VPC 内。该设置非常适合需要遵守严格数据居留要求的大型工作负载，以确保所有数据保持在安全的客户环境内。

- 有关更多详细信息，您可以查阅 [文档](/cloud/reference/byoc) 或阅读我们的 [公告博客文章](https://clickhouse.com/blog/announcing-general-availability-of-clickhouse-bring-your-own-cloud-on-aws)。
- [联系我们](https://clickhouse.com/cloud/bring-your-own-cloud) 以请求访问权。
  
### Postgres CDC 连接器 for ClickPipes {#postgres-cdc-connector-for-clickpipes}

Postgres CDC 连接器 for ClickPipes 现已进入公开公测。此功能让用户可以无缝地将其 Postgres 数据库复制到 ClickHouse Cloud。

- 要开始使用，请参考 ClickPipes Postgres CDC 连接器的 [文档](https://clickhouse.com/docs/integrations/clickpipes/postgres)。
- 有关客户用例和功能的更多信息，请参考 [着陆页](https://clickhouse.com/cloud/clickpipes/postgres-cdc-connector) 和 [发布博客](https://clickhouse.com/blog/postgres-cdc-connector-clickpipes-public-beta)。

### AWS 上 ClickHouse Cloud 的 PCI 合规性 {#pci-compliance-for-clickhouse-cloud-on-aws}

ClickHouse Cloud 现在支持 **PCI 合规服务**，适用于 **Enterprise tier** 客户，在 **us-east-1** 和 **us-west-2** 区域。希望在合规环境中启动服务的用户可以联系 [支持团队](https://clickhouse.com/support/program) 以获得帮助。

### Google Cloud Platform 上的透明数据加密和客户管理的加密密钥 {#tde-and-cmek-on-gcp}

对 **透明数据加密 (TDE)** 和 **客户管理的加密密钥 (CMEK)** 的支持现已在 **Google Cloud Platform (GCP)** 上推出。

- 有关更多信息，请参阅这些功能的 [文档](https://clickhouse.com/docs/cloud/security/cmek#transparent-data-encryption-tde)。

### AWS 中东（阿联酋）可用性 {#aws-middle-east-uae-availability}

现在为 ClickHouse Cloud 添加了新区域支持，现已在 **AWS 中东（阿联酋） me-central-1** 区域可用。

### ClickHouse Cloud 保护措施 {#clickhouse-cloud-guardrails}

为了促进最佳实践并确保 ClickHouse Cloud 的稳定使用，我们正在对使用中的表、数据库、分区和部分的数量进行保护措施。

- 有关详细信息，请查阅文档中的 [使用限制](https://clickhouse.com/docs/cloud/bestpractices/usage-limits) 部分。
- 如果您的服务已经超过这些限制，我们将允许增加 10%。如有任何疑问，请联系人 [支持](https://clickhouse.com/support/program)。

## 2025年1月27日 {#january-27-2025}
### 对 ClickHouse Cloud 阶层的更改 {#changes-to-clickhouse-cloud-tiers}

我们致力于调整我们的产品，以满足客户不断变化的需求。自 GA 引入两年来，ClickHouse Cloud 发生了重大变化，我们对客户如何使用我们的云产品获得了宝贵的见解。

我们引入新功能以优化 ClickHouse Cloud 服务的容量和成本效率。这些功能包括 **计算计算分离**、高性能机器类型和 **单副本服务**。我们还在不断发展自动扩展和管理升级，以实现更流畅和更具反应能力的执行。

我们将增加一个 **新企业层**，以满足最苛刻的客户和工作负载的需求，专注于特定行业的安全和合规功能，以及对基础硬件和升级的更多控制和高级灾难恢复功能。

为支持这些更改，我们正在重组当前的 **Development** 和 **Production** 层，以更密切地匹配不断发展的客户使用需求。我们正在引入 **Basic** 层，面向正在测试新想法和项目的用户，以及 **Scale** 层，适合在生产工作负载和大规模数据中工作的用户。

您可以在这篇 [博客](https://clickhouse.com/blog/evolution-of-clickhouse-cloud-new-features-superior-performance-tailored-offerings) 中阅读这些和其他功能更改。现有客户需要采取行动以选择 [新计划](https://clickhouse.com/pricing)。客户沟通通过电子邮件发送给组织管理员，并且以下 [常见问题解答](/cloud/manage/jan-2025-faq/summary) 涵盖关键更改和时间表。

### 仓库：计算计算分离（GA） {#warehouses-compute-compute-separation-ga}

计算计算分离（也称为“仓库”）现已正式发布；有关更多详细信息，请参阅 [博客](https://clickhouse.com/blog/introducing-warehouses-compute-compute-separation-in-clickhouse-cloud) 和 [文档](/cloud/reference/warehouses)。

### 单副本服务 {#single-replica-services}

我们引入了 “单副本服务” 的概念，既可以作为独立的产品，也可以在仓库中使用。作为独立产品，单副本服务的大小有限，旨在用于小型测试工作负载。在仓库中，可以将单副本服务部署为更大规模，并用于不需要高可用性的大型工作负载，例如可重启的 ETL 作业。

### 垂直自动缩放改进 {#vertical-auto-scaling-improvements}

我们引入了一种新的计算副本垂直缩放机制，称为“先增加后删除”（MBB）。这种方法在删除旧副本之前添加一个或多个新大小的副本，防止在缩放操作期间丢失任何容量。通过消除移除现有副本和添加新副本之间的间隙，MBB 创建了更无缝且干扰更小的缩放过程。在扩展场景中特别有效，由于高资源利用率触发额外容量的需求，提前移除副本只会加剧资源瓶颈。

### 水平扩展（GA） {#horizontal-scaling-ga}

水平扩展现已正式发布。用户可以通过 API 和云控制台添加额外的副本以扩展他们的服务。有关详细信息，请参阅 [文档](/manage/scaling#manual-horizontal-scaling)。

### 可配置备份 {#configurable-backups}

我们现在支持客户将备份导出到他们自己的云帐户；有关更多信息，请参阅 [文档](/cloud/manage/backups/configurable-backups)。

### 管理升级改进 {#managed-upgrade-improvements}

安全的管理升级为我们的用户带来了显著的价值，允许他们在数据库前进添加新功能时保持最新。随着此次推出，我们将 “先增加后删除”（或 MBB） 方法应用于升级，进一步减少了对正在运行的工作负载的影响。

### HIPAA 支持 {#hipaa-support}

我们现在在合规区域（包括 AWS `us-east-1`、`us-west-2` 和 GCP `us-central1`、`us-east1`）提供 HIPAA 支持。希望入驻的客户必须签署商业合作协议（BAA），并部署到合规版本的区域。有关 HIPAA 的更多信息，请参阅 [文档](/cloud/security/security-and-compliance)。

### 计划升级 {#scheduled-upgrades}

用户可以为他们的服务安排升级。此功能仅支持企业级服务。有关计划升级的更多信息，请参阅 [文档](/manage/updates)。

### 语言客户端对复杂类型的支持 {#language-client-support-for-complex-types}

[Golang](https://github.com/ClickHouse/clickhouse-go/releases/tag/v2.30.1)、[Python](https://github.com/ClickHouse/clickhouse-connect/releases/tag/v0.8.11) 和 [NodeJS](https://github.com/ClickHouse/clickhouse-js/releases/tag/1.10.1) 客户端新增了对动态、变体和 JSON 类型的支持。

### DBT 支持可刷新的物化视图 {#dbt-support-for-refreshable-materialized-views}

DBT 现在在 `1.8.7` 版本中 [支持可刷新的物化视图](https://github.com/ClickHouse/dbt-clickhouse/releases/tag/v1.8.7)。

### JWT 令牌支持 {#jwt-token-support}

已添加对基于 JWT 的身份验证的支持，适用于 JDBC 驱动程序 v2、clickhouse-java、[Python](https://github.com/ClickHouse/clickhouse-connect/releases/tag/v0.8.12) 和 [NodeJS](https://github.com/ClickHouse/clickhouse-js/releases/tag/1.10.0) 客户端。

JDBC / Java 在发布时将是 [0.8.0](https://github.com/ClickHouse/clickhouse-java/releases/tag/v0.8.0) - 预计发布时间待定。

### Prometheus 集成改进 {#prometheus-integration-improvements}

我们为 Prometheus 的集成添加了几个增强功能：

- **组织级端点**。我们为 ClickHouse Cloud 的 Prometheus 集成引入了一项增强功能。除了服务级指标外，API 现在提供了 **组织级指标** 的端点。此新端点自动收集您组织内所有服务的指标，从而简化将指标导出到您的 Prometheus 收集器的过程。这些指标可以与 Grafana 和 Datadog 等可视化工具集成，以更全面地查看您组织的性能。

  该功能现已对所有用户开放。您可以在此处找到更多详细信息 [这里](/integrations/prometheus)。

- **过滤指标**。我们为 ClickHouse Cloud 的 Prometheus 集成添加了支持返回过滤的指标列表。这项功能通过使您专注于对监控服务健康至关重要的指标，帮助减少响应有效载荷的大小。

  此功能可通过 API 中的可选查询参数访问，更容易优化数据收集并简化与 Grafana 和 Datadog 等工具的集成。

  过滤指标功能现已对所有用户开放。您可以在此处找到更多详细信息 [这里](/integrations/prometheus)。

## 2024年12月20日 {#december-20-2024}
### 市场订阅组织附加 {#marketplace-subscription-organization-attachment}

您现在可以将新的市场订阅附加到现有的 ClickHouse Cloud 组织。订阅市场后并重定向到 ClickHouse Cloud 后，您可以将过去创建的现有组织连接到新的市场订阅。从此时起，您在组织中的资源将通过市场进行计费。 

<Image img={add_marketplace} size="md" alt="ClickHouse Cloud 界面，显示如何将市场订阅添加到现有组织" border />
### 强制 OpenAPI 密钥过期 {#force-openapi-key-expiration}

现在可以限制 API 密钥的过期选项，以免创建未过期的 OpenAPI 密钥。请联系 ClickHouse Cloud 支持团队为您的组织启用这些限制。
### 针对通知的自定义电子邮件 {#custom-emails-for-notifications}

组织管理员现在可以将更多电子邮件地址添加到特定通知中作为额外接收人。如果您想将通知发送给别名或组织内的其他用户（可能不是 ClickHouse Cloud 用户），这将非常有用。要配置此选项，请访问云控制台的通知设置，并编辑您希望接收电子邮件通知的电子邮件地址。

## 2024年12月6日 {#december-6-2024}
### 自带云 (Beta) {#byoc-beta}

Bring Your Own Cloud for AWS 现已进入公测。该部署模型允许您在自己的 AWS 账户中部署和运行 ClickHouse Cloud。我们支持在 11 个以上的 AWS 区域进行部署，更多区域将很快推出。请 [联系支持](https://clickhouse.com/support/program) 以获取访问权限。请注意，此部署仅限于大规模部署。

### Postgres 变更数据捕获 (CDC) 连接器在 ClickPipes 中（公共 Beta） {#postgres-change-data-capture-cdc-connector-in-clickpipes-public-beta}

此即插即用集成使客户可以仅通过几次点击将其 Postgres 数据库复制到 ClickHouse Cloud，并利用 ClickHouse 进行极快的分析。您可以使用此连接器进行持续复制和一次性从 Postgres 迁移。

### 仪表板 (Beta) {#dashboards-beta}

本周，我们非常高兴地宣布 ClickHouse Cloud 中仪表板的 Beta 发布。通过仪表板，用户可以将保存的查询转换为可视化，将可视化组织到仪表板上，并使用查询参数与仪表板交互。要开始使用，请遵循 [仪表板文档](/cloud/manage/dashboards)。

<Image img={beta_dashboards} size="lg" alt="ClickHouse Cloud 界面，显示新的仪表板 Beta 功能及其可视化" border />
### 查询 API 端点（GA） {#query-api-endpoints-ga}

我们很高兴地宣布 ClickHouse Cloud 中查询 API 端点的 GA 发布。查询 API 端点可以让您仅通过几次点击为保存的查询启动 RESTful API 端点，并开始在您的应用程序中获取数据，而无需处理语言客户端或身份验证的复杂性。自初次发布以来，我们进行了一系列改进，包括：

* 降低端点延迟，尤其是冷启动时
* 增强端点 RBAC 控制
* 可配置的 CORS 允许域
* 结果流式传输
* 支持所有 ClickHouse 兼容的输出格式

除了这些改进外，我们还很高兴地宣布通用查询 API 端点，这些端点利用我们现有的框架，使您能够针对 ClickHouse Cloud 服务执行任意 SQL 查询。通用端点可以在服务设置页面启用和配置。

要开始使用，请遵循 [查询 API 端点文档](/cloud/get-started/query-endpoints)。

<Image img={api_endpoints} size="lg" alt="ClickHouse Cloud 界面，显示 API 端点配置和各种设置" border />
### 原生 JSON 支持（Beta） {#native-json-support-beta}

我们为 ClickHouse Cloud 中的原生 JSON 支持推出公测。要开始使用，请联系支持 [以启用您的云服务](/cloud/support)。

### 使用向量相似度索引的向量搜索（早期访问） {#vector-search-using-vector-similarity-indexes-early-access}

我们宣布向量相似度索引的早期访问，用于近似向量搜索！

ClickHouse 已经提供了对基于向量的用例的强大支持，具有广泛的 [距离函数](https://clickhouse.com/blog/reinvent-2024-product-announcements#vector-search-using-vector-similarity-indexes-early-access) 和执行线性扫描的能力。此外，最近我们增加了一种实验性 [近似向量搜索](https://engines/table-engines/mergetree-family/annindexes) 方法，利用了 [usearch](https://github.com/unum-cloud/usearch) 库和层级可导航小世界（HNSW）近似最近邻搜索算法。

要开始使用，请 [注册早期访问候补名单](https://clickhouse.com/cloud/vector-search-index-waitlist)。

### ClickHouse-Connect（Python）和 ClickHouse-Kafka-Connect 用户 {#clickhouse-connect-python-and-clickhouse-kafka-connect-users}

已向曾遇到 `MEMORY_LIMIT_EXCEEDED` 异常的客户发送通知电子邮件。

请升级至：
- Kafka-Connect：> 1.2.5
- ClickHouse-Connect（Java）：> 0.8.6

### ClickPipes 现在支持 AWS 上的跨 VPC 资源访问 {#clickpipes-now-supports-cross-vpc-resource-access-on-aws}

您现在可以为特定数据源（如 AWS MSK）授予单向访问权限。通过 AWS PrivateLink 和 VPC Lattice 的跨 VPC 资源访问，您可以在 VPC 和账户边界之间共享单独的资源，甚至在不妥协隐私和安全的情况下，从本地网络向公共网络传输数据以进行访问。要开始设置资源共享，您可以阅读 [公告文章](https://clickhouse.com/blog/clickpipes-crossvpc-resource-endpoints?utm_medium=web&utm_source=changelog)。

<Image img={cross_vpc} size="lg" alt="显示 ClickPipes 连接到 AWS MSK 的跨 VPC 资源访问架构的图表" border />
### ClickPipes 现在支持 AWS MSK 的 IAM {#clickpipes-now-supports-iam-for-aws-msk}

您现在可以使用 IAM 身份验证连接到 AWS MSK ClickPipes 的 MSK 经纪人。要开始使用，请查看我们的 [文档](/integrations/clickpipes/kafka#iam)。

### AWS 上新服务的最大副本大小 {#maximum-replica-size-for-new-services-on-aws}

从现在起，任何在 AWS 上创建的新服务将允许最大可用副本大小为 236 GiB。

## 2024年11月22日 {#november-22-2024}
### ClickHouse Cloud 的内置高级可观察性仪表板 {#built-in-advanced-observability-dashboard-for-clickhouse-cloud}

之前，允许您监控 ClickHouse 服务器指标和硬件资源利用率的高级可观察性仪表板仅在开源 ClickHouse 中可用。我们高兴地宣布此功能现在在 ClickHouse Cloud 控制台中可用！

该仪表板允许您基于 [system.dashboards](/operations/system-tables/dashboards) 表以一体化 UI 视图查询。访问 **Monitoring > Service Health** 页面，以立即开始使用高级可观察性仪表板。

<Image img={nov_22} size="lg" alt="ClickHouse Cloud 高级可观察性仪表板显示服务器指标和资源使用情况" border />
### AI 驱动的 SQL 自动补全 {#ai-powered-sql-autocomplete}

我们显著改善了自动补全功能，允许您在使用新 AI Copilot 编写查询时获得行内 SQL 补全！您可以通过切换任何 ClickHouse Cloud 服务的 **“启用行内代码补全”** 设置来启用此功能。

<Image img={copilot} size="lg" alt="演示用户输入时 AI Copilot 提供 SQL 自动完成建议的动画" border />
### 新的 “计费” 角色 {#new-billing-role}

您现在可以将组织中的用户分配到新的 **Billing** 角色，允许他们查看和管理计费信息，而无需授予他们配置或管理服务的权限。只需邀请新用户或编辑现有用户的角色以分配 **Billing** 角色。

## 2024年11月8日 {#november-8-2024}
### ClickHouse Cloud 中的客户通知 {#customer-notifications-in-clickhouse-cloud}

ClickHouse Cloud 现在为多个计费和扩展事件提供控制台和电子邮件通知。客户可以通过云控制台的通知中心配置这些通知，以便仅在 UI 上显示、接收电子邮件，或同时接收两者。您可以按服务级别配置您收到的通知的类别和严重性。

未来，我们将为其他事件添加通知，并提供其他接收通知的方式。

请参见 [ClickHouse 文档](/cloud/notifications)，以了解如何为您的服务启用通知的更多信息。

<Image img={notifications} size="lg" alt="ClickHouse Cloud 通知中心界面，显示不同通知类型的配置选项" border />

<br />

## 2024年10月4日 {#october-4-2024}
### ClickHouse Cloud 现在在 GCP 中提供 HIPAA 准备服务的 Beta 版本 {#clickhouse-cloud-now-offers-hipaa-ready-services-in-beta-for-gcp}

希望提高受保护健康信息（PHI）安全性的客户现在可以在 [Google Cloud Platform (GCP)](https://cloud.google.com/) 上入驻 ClickHouse Cloud。ClickHouse 已实施 [HIPAA 安全规则](https://www.hhs.gov/hipaa/for-professionals/security/index.html) 规定的行政、物理和技术保障措施，并且现在具有可配置的安全设置，可以根据您的具体用例和工作负载进行实施。有关可用安全设置的更多信息，请查看我们的 [安全共享责任模型](/cloud/security/shared-responsibility-model)。

服务在 GCP `us-central-1` 区域向 **Dedicated** 服务类型的客户提供，并需要签署商业合伙协议（BAA）。联系 [销售团队](mailto:sales@clickhouse.com) 或 [支持团队](https://clickhouse.com/support/program) 请求访问此功能或加入 GCP、AWS 和 Azure 区域的候补名单。

### 计算-计算分离现已在 GCP 和 Azure 中进行私有预览 {#compute-compute-separation-is-now-in-private-preview-for-gcp-and-azure}

我们最近宣布了 AWS 上计算-计算分离的私有预览。我们很高兴地宣布它现在在 GCP 和 Azure 中可用。

计算计算分离允许您将特定服务指定为可读写或只读服务，使您能够设计最佳计算配置以优化成本和性能。有关更多详细信息，请 [阅读文档](/cloud/reference/warehouses)。

### 自助 MFA 恢复代码 {#self-service-mfa-recovery-codes}

使用多因素身份验证的客户现在可以获得在丢失手机或意外删除令牌时使用的恢复代码。首次注册 MFA 的客户将会在设置时获得该代码。已有 MFA 的客户可以通过删除现有 MFA 令牌并添加新的令牌来获得恢复代码。

### ClickPipes 更新：自定义证书、延迟洞察以及更多功能！ {#clickpipes-update-custom-certificates-latency-insights-and-more}

我们很高兴分享 ClickPipes 的最新更新，这是将数据引入 ClickHouse 服务的最简单方法！这些新功能旨在增强您对数据引入的控制，并提供对性能指标的更大可见性。

*Kafka 的自定义认证证书*

ClickPipes for Kafka 现在支持使用 SASL 和公共 SSL/TLS 的 Kafka 经纪人的自定义认证证书。您可以在 ClickPipe 设置过程中轻松上传自己的证书，以确保与 Kafka 的连接更加安全。

*为 Kafka 和 Kinesis 引入延迟指标*

性能可见性至关重要。ClickPipes 现在具有延迟图，提供从消息生成（无论是来自 Kafka 主题还是 Kinesis 流）到引入 ClickHouse Cloud 的时间洞察。有了这个新指标，您可以更仔细地监视数据管道的性能并根据需要进行优化。

<Image img={latency_insights} size="lg" alt="ClickPipes 界面，显示数据引入性能的延迟指标图" border />

<br />

*Kafka 和 Kinesis 的扩展控制（私有 Beta）*

高吞吐量可能需要额外的资源来满足您的数据量和延迟需求。我们为 ClickPipes 引入了水平扩展，直接通过我们的云控制台提供。此功能目前处于私有测试阶段，允许您根据需求更有效地扩展资源。请联系 [支持](https://clickhouse.com/support/program) 以加入 Beta 版本。

*Kafka 和 Kinesis 的原始消息引入*

现在可以不解析整个 Kafka 或 Kinesis 消息进行引入。ClickPipes 现在提供对 `_raw_message` [虚拟列](/integrations/clickpipes/kafka#kafka-virtual-columns) 的支持，允许用户将完整消息映射到单一的 String 列。这使您能够根据需要处理原始数据。

## 2024年8月29日 {#august-29-2024}
### 新的 Terraform 提供程序版本 - v1.0.0 {#new-terraform-provider-version---v100}

Terraform 允许您以编程方式控制您的 ClickHouse Cloud 服务，并将配置存储为代码。我们的 Terraform 提供程序已有近 200,000 次下载，并且现在正式发布为 v1.0.0！此版本包含了一些改进，例如更好的重试逻辑和一个新的资源，用于将私人端点附加到 ClickHouse Cloud 服务。您可以在 [此处下载 Terraform 提供程序](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest) 并查看 [完整更新日志](https://github.com/ClickHouse/terraform-provider-clickhouse/releases/tag/v1.0.0)。
### 2024 SOC 2 Type II 报告和更新的 ISO 27001 证书 {#2024-soc-2-type-ii-report-and-updated-iso-27001-certificate}

我们自豪地宣布我们 2024 SOC 2 Type II 报告和更新的 ISO 27001 证书的发布，这两个报告均包含我们最近在 Azure 上推出的服务，并继续涵盖 AWS 和 GCP 中的服务。

我们的 SOC 2 Type II 展示了我们在为 ClickHouse 用户提供的服务中，确保安全性、可用性、处理完整性和机密性的持续承诺。有关更多信息，请查看由美国注册会计师协会（AICPA）发布的 [SOC 2 - SOC for Service Organizations: Trust Services Criteria](https://www.aicpa-cima.com/resources/landing/system-and-organization-controls-soc-suite-of-services) 和国际标准化组织（ISO）发布的 [What is ISO/IEC 27001](https://www.iso.org/standard/27001)。

请您也查看我们的 [Trust Center](https://trust.clickhouse.com/) 获取安全和合规的文档及报告。

## 2024 年 8 月 15 日 {#august-15-2024}
### 计算-计算分离现已在 AWS 中进行私人预览 {#compute-compute-separation-is-now-in-private-preview-for-aws}

在现有的 ClickHouse Cloud 服务中，副本处理读写请求，没有办法将某个副本配置为仅处理一种类型的操作。我们即将推出一个称为计算-计算分离的新特性，允许您将特定服务指定为读写或只读服务，使您能够为您的应用程序设计最佳计算配置，以优化成本和性能。

我们的新计算-计算分离功能使您能够创建多个计算节点组，每个组都有自己的端点，且使用相同的对象存储文件夹，因此包含相同的表、视图等。有关更多信息，请查看 [计算-计算分离](https://cloud/reference/warehouses)。如果您希望以私人预览的方式访问此功能，请 [联系支持](https://clickhouse.com/support/program)。

<Image img={cloud_console_2} size="lg" alt="Diagram showing example architecture for compute-compute separation with read-write and read-only service groups" border />
### ClickPipes for S3 和 GCS 现已正式发布，支持持续模式 {#clickpipes-for-s3-and-gcs-now-in-ga-continuous-mode-support}

ClickPipes 是将数据导入 ClickHouse Cloud 的最简便方法。我们很高兴地宣布，适用于 S3 和 GCS 的 [ClickPipes](https://clickhouse.com/cloud/clickpipes) 现已 **正式发布**。ClickPipes 支持一次性批量导入和“持续模式”。导入任务将从特定远程桶中加载所有与模式匹配的文件到 ClickHouse 目标表。在“持续模式”下，ClickPipes 作业将不断运行，导入在远程对象存储桶中添加的匹配文件。这将允许用户将任何对象存储桶转变为一个完整的用于将数据导入 ClickHouse Cloud 的临时区域。有关 ClickPipes 的更多信息，请参见 [我们的文档](/integrations/clickpipes)。

## 2024 年 7 月 18 日 {#july-18-2024}
### Prometheus 指标端点现已正式发布 {#prometheus-endpoint-for-metrics-is-now-generally-available}

在我们上一个云变更日志中，我们宣布了从 ClickHouse Cloud 导出 [Prometheus](https://prometheus.io/) 指标的私人预览。此功能允许您使用 [ClickHouse Cloud API](/cloud/manage/api/api-overview) 将指标获取到 [Grafana](https://grafana.com/) 和 [Datadog](https://www.datadoghq.com/) 等工具中进行可视化。我们很高兴地宣布，此功能现已 **正式发布**。请查看 [我们的文档](/integrations/prometheus) 以获取有关此功能的更多信息。

### 云控制台中的表检查器 {#table-inspector-in-cloud-console}

ClickHouse 提供类似于 [`DESCRIBE`](/sql-reference/statements/describe-table) 的命令，可以允许您检查您的表以检查模式。这些命令的输出到控制台，但由于需要结合多个查询以获取有关表和列的所有相关数据，因此使用起来通常不太方便。

我们最近在云控制台推出了 **表检查器**，允许您在 UI 中检索重要的表和列信息，而无需编写 SQL。您可以通过查看云控制台来试用服务的表检查器。它提供了有关您的模式、存储、压缩等信息，在一个统一的界面中。

<Image img={compute_compute} size="lg" alt="ClickHouse Cloud Table Inspector interface showing detailed schema and storage information" border />
### 新的 Java 客户端 API {#new-java-client-api}

我们的 [Java 客户端](https://github.com/ClickHouse/clickhouse-java) 是用户连接 ClickHouse 的最流行客户端之一。我们希望使其使用更加轻松直观，包括重新设计的 API 和各种性能优化。这些更改将使您从 Java 应用程序连接到 ClickHouse 变得更加简单。您可以在这篇 [博客文章](https://clickhouse.com/blog/java-client-sequel) 中阅读有关如何使用更新的 Java 客户端的更多信息。

### 新分析器默认启用 {#new-analyzer-is-enabled-by-default}

在过去的几年中，我们一直在致力于新的分析器，以进行查询分析和优化。该分析器提高了查询性能，并允许我们进行进一步优化，包括更快和更高效的 `JOIN`。以前，新用户需要使用 `allow_experimental_analyzer` 设置手动启用此功能。此改进的分析器现已在新的 ClickHouse Cloud 服务中默认提供。

请您期待我们即将推出的更多分析器改进，我们还有许多其他优化计划！

## 2024 年 6 月 28 日 {#june-28-2024}
### ClickHouse Cloud for Microsoft Azure 现已正式发布！ {#clickhouse-cloud-for-microsoft-azure-is-now-generally-available}

我们首次在今年五月宣布 Microsoft Azure 支持的 Beta 版本 [这篇文章](https://clickhouse.com/blog/clickhouse-cloud-is-now-on-azure-in-public-beta)。在此最新的云版本中，我们很高兴地宣布我们的 Azure 支持从 Beta 过渡到正式发布。ClickHouse Cloud 现在已在所有三个主要云平台上提供：AWS、Google Cloud Platform 和现在的 Microsoft Azure。

此版本还包括通过 [Microsoft Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps/clickhouse.clickhouse_cloud) 的订阅支持。该服务在以下区域最初受到支持：
- 美国：西部美国 3（亚利桑那州）
- 美国：东部美国 2（维吉尼亚州）
- 欧洲：德国西部中部（法兰克福）

如果您希望支持任何特定区域，请 [联系我们](https://clickhouse.com/support/program)。

### 查询日志洞察 {#query-log-insights}

我们在云控制台中新的查询洞察 UI 使 ClickHouse 内置查询日志更加易于使用。ClickHouse 的 `system.query_log` 表是查询优化、调试和监控整体集群健康和性能的重要信息来源。需要注意的是：由于有 70+ 个字段和每个查询多个记录，解释查询日志具有陡峭的学习曲线。这个查询洞察的初始版本为未来的工作提供了蓝图，旨在简化查询调试和优化模式。我们非常希望听到您对此功能的反馈，因此请与我们联系，您的意见将不胜感激！

<Image img={query_insights} size="lg" alt="ClickHouse Cloud Query Insights UI showing query performance metrics and analysis" border />
### Prometheus 指标端点（私人预览） {#prometheus-endpoint-for-metrics-private-preview}

这可能是我们最受欢迎的功能之一：您现在可以从 ClickHouse Cloud 导出 [Prometheus](https://prometheus.io/) 指标到 [Grafana](https://grafana.com/) 和 [Datadog](https://www.datadoghq.com/) 进行可视化。Prometheus 提供了一个开源的解决方案，用于监控 ClickHouse 和设置自定义警报。您的 ClickHouse Cloud 服务的 Prometheus 指标可通过 [ClickHouse Cloud API](/integrations/prometheus) 获得。此功能目前处于私人预览状态。如果您希望为您的组织启用此功能，请与 [支持团队](https://clickhouse.com/support/program) 联系。

<Image img={prometheus} size="lg" alt="Grafana dashboard showing Prometheus metrics from ClickHouse Cloud" border />
### 其他功能： {#other-features}
- [可配置备份](/cloud/manage/backups/configurable-backups) 允许配置自定义备份策略，如频率、保留和计划，现已正式发布。

## 2024 年 6 月 13 日 {#june-13-2024}
### Kafka ClickPipes 连接器的可配置偏移量（Beta） {#configurable-offsets-for-kafka-clickpipes-connector-beta}

直到最近，每当您设置新的 [Kafka ClickPipes 连接器](/integrations/clickpipes/kafka) 时，它总是从 Kafka 主题的开始处消费数据。在这种情况下，当您需要重新处理历史数据、监控新的数据或从精确的点恢复时，可能不够灵活。

Kafka 的 ClickPipes 添加了一项新功能，增强了对 Kafka 主题数据消费的灵活性和控制。您现在可以配置数据的消费偏移量。

以下选项可用：
- 从开始：从 Kafka 主题的最开始处开始消费数据。此选项非常适合需要重新处理所有历史数据的用户。
- 从最新：从最新的偏移量开始消费数据。此选项对只对新消息感兴趣的用户非常有用。
- 从时间戳：从在特定时间戳时或之后生成的消息开始消费数据。此功能允许更精确的控制，使用户能够从准确的时间点恢复处理。

<Image img={kafka_config} size="lg" alt="ClickPipes Kafka connector configuration interface showing offset selection options" border />
### 将服务注册到快速发布渠道 {#enroll-services-to-the-fast-release-channel}

快速发布渠道允许您的服务提前收到更新。以前，启用此功能需要支持团队的协助。现在，您可以使用 ClickHouse Cloud 控制台直接为您的服务启用此功能。只需导航至 **设置**，然后单击 **注册快速发布**。您的服务将立即收到可用更新！

<Image img={fast_releases} size="lg" alt="ClickHouse Cloud settings page showing the option to enroll in fast releases" border />
### Terraform 支持水平扩展 {#terraform-support-for-horizontal-scaling}

ClickHouse Cloud 支持 [水平扩展](/manage/scaling#how-scaling-works-in-clickhouse-cloud)，或向您的服务添加额外的相同大小的副本。水平扩展提高了性能和并行处理能力，以支持并发查询。之前，增加更多副本需要使用 ClickHouse Cloud 控制台或 API。您现在可以使用 Terraform 根据需要添加或删除副本，从而以编程方式扩展您的 ClickHouse 服务。

有关更多信息，请参见 [ClickHouse Terraform 提供程序](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs)。

## 2024 年 5 月 30 日 {#may-30-2024}
### 与团队成员共享查询 {#share-queries-with-your-teammates}

当您编写 SQL 查询时，您的团队中的其他人很可能也会发现该查询有用。以前，您必须通过 Slack 或电子邮件发送查询，如果您修改了该查询，团队成员将无法自动接收更新。

我们很高兴地宣布，您现在可以通过 ClickHouse Cloud 控制台轻松共享查询。您可以直接与整个团队或特定团队成员共享查询。您还可以指定他们是否具有只读或写入访问权限。在查询编辑器中单击 **共享** 按钮以尝试新的共享查询功能。

<Image img={share_queries} size="lg" alt="ClickHouse Cloud query editor showing the share functionality with permission options" border />
### ClickHouse Cloud for Microsoft Azure 现已进入测试阶段 {#clickhouse-cloud-for-microsoft-azure-is-now-in-beta}

我们终于推出了在 Microsoft Azure 上创建 ClickHouse Cloud 服务的能力！我们已经有许多客户在生产环境中使用 Azure 上的 ClickHouse Cloud，作为我们的私人预览计划的一部分。现在，任何人都可以在 Azure 上创建自己的服务。所有您在 AWS 和 GCP 上支持的 ClickHouse 功能也将在 Azure 上使用。

我们预计 ClickHouse Cloud for Azure 会在接下来的几周内准备好正式发布。 [阅读这篇博客文章](https://clickhouse.com/blog/clickhouse-cloud-is-now-on-azure-in-public-beta) 以了解更多或通过 ClickHouse Cloud 控制台使用 Azure 创建您的新服务。

注意：**开发** 服务目前不受支持。

### 通过云控制台设置私人链接 {#set-up-private-link-via-the-cloud-console}

我们的私人链接功能允许您连接 ClickHouse Cloud 服务与您云提供商账户中的内部服务，而无需将流量导向公共互联网，从而节省成本并增强安全性。以前，这样设置较为复杂，需使用 ClickHouse Cloud API。

您现在可以直接从 ClickHouse Cloud 控制台仅需几次点击即可配置私人端点。只需转到您的服务的 **设置**，进入 **安全** 部分并单击 **设置私有端点**。

<Image img={private_endpoint} size="lg" alt="ClickHouse Cloud console showing private endpoint setup interface in the security settings" border />
## 2024 年 5 月 17 日 {#may-17-2024}
### 使用 ClickPipes 从 Amazon Kinesis 导入数据（Beta） {#ingest-data-from-amazon-kinesis-using-clickpipes-beta}

ClickPipes 是 ClickHouse Cloud 提供的一项独特服务，允许无代码导入数据。Amazon Kinesis 是 AWS 的完全托管流服务，用于导入和存储数据流进行处理。我们很高兴地推出适用于 Amazon Kinesis 的 ClickPipes 测试版，这是我们应要求推出的整合方案。我们希望将更多整合添加到 ClickPipes，因此请告诉我们您希望我们支持的数据源！有关此功能的更多信息，请 [查看这里](https://clickhouse.com/blog/clickpipes-amazon-kinesis)。

您可以在云控制台尝试新的 Amazon Kinesis 集成的 ClickPipes：

<Image img={kenesis} size="lg" alt="ClickPipes interface showing Amazon Kinesis integration configuration options" border />
### 可配置备份（私人预览） {#configurable-backups-private-preview}

备份对于每个数据库（无论其多么可靠）都至关重要，自 ClickHouse Cloud 开始以来，我们非常重视备份。本周，我们推出了可配置备份，允许您更加灵活地进行服务备份。您现在可以控制开始时间、保留和频率。此功能适用于 **生产** 和 **专用** 服务，不适用于 **开发** 服务。由于此功能处于私人预览阶段，请与 support@clickhouse.com 联系以为您的服务启用此功能。有关可配置备份的更多信息，请 [查看这里](https://clickhouse.com/blog/configurable-backups-in-clickhouse-cloud)。

### 从 SQL 查询创建 API（Beta） {#create-apis-from-your-sql-queries-beta}

当您为 ClickHouse 编写 SQL 查询时，您仍需通过驱动程序连接 ClickHouse，以通过一个 API 将查询公开给您的应用程序。现在，借助我们新的 **查询端点** 功能，您可以直接从 API 执行 SQL 查询，而无需进行任何配置。您可以指定查询端点将返回 JSON、CSV 或 TSV。请单击云控制台中的“共享”按钮以尝试此新功能。有关查询端点的更多信息，请 [查看这里](https://clickhouse.com/blog/automatic-query-endpoints)。

<Image img={query_endpoints} size="lg" alt="ClickHouse Cloud interface showing Query Endpoints configuration with output format options" border />
### 官方 ClickHouse 认证现已上线 {#official-clickhouse-certification-is-now-available}

ClickHouse 开发培训课程中有 12 个免费培训模块。在此之前，没有官方方式证明您在 ClickHouse 中的掌握。我们最近推出了一个官方考试，使您成为 **ClickHouse 认证开发人员**。完成此考试后，您可以向当前和未来的雇主展示您在 ClickHouse 中掌握的数据导入、建模、分析、性能优化等主题。您可以 [在这里参加考试](https://clickhouse.com/learn/certification) 或在这篇 [博客文章](https://clickhouse.com/blog/first-official-clickhouse-certification) 中了解更多有关 ClickHouse 认证的信息。

## 2024 年 4 月 25 日 {#april-25-2024}
### 使用 ClickPipes 从 S3 和 GCS 导入数据 {#load-data-from-s3-and-gcs-using-clickpipes}

您可能在我们新发布的云控制台中注意到了一个名为“数据源”的新部分。“数据源”页面由 ClickPipes 提供支持，这是 ClickHouse Cloud 的一项本地功能，允许您轻松将数据从各种源插入 ClickHouse Cloud。

我们最近的 ClickPipes 更新增加了从 Amazon S3 和 Google Cloud Storage 直接上传数据的能力。虽然您仍可以使用我们的内置表函数，但 ClickPipes 是通过我们的 UI 完全托管的服务，允许您仅需几次点击即可从 S3 和 GCS 导入数据。此功能仍处于私人预览中，但您今天可以通过云控制台试用它。

<Image img={s3_gcs} size="lg" alt="ClickPipes interface showing configuration options for loading data from S3 and GCS buckets" border />
### 使用 Fivetran 将数据从 500+ 来源加载到 ClickHouse Cloud {#use-fivetran-to-load-data-from-500-sources-into-clickhouse-cloud}

ClickHouse 可以快速查询所有大型数据集，但当然，您的数据必须首先插入到 ClickHouse 中。得益于 Fivetran 提供的全面连接器，用户现在可以快速从 500 多个来源加载数据。无论您需要从 Zendesk、Slack 还是任何您喜爱的应用程序加载数据，现在的新 ClickHouse 目标可以让您将 ClickHouse 作为应用程序数据的目标数据库。

这是一个开源整合，经过我们整合团队数月的努力而建成。您可以在这里查看我们的 [发布博客文章](https://clickhouse.com/blog/fivetran-destination-clickhouse-cloud) 和 [GitHub 仓库](https://github.com/ClickHouse/clickhouse-fivetran-destination)。

### 其他更改 {#other-changes}

**控制台更改**
- SQL 控制台支持输出格式

**集成更改**
- ClickPipes Kafka 连接器支持多代理设置
- PowerBI 连接器支持提供 ODBC 驱动程序配置选项。

## 2024 年 4 月 18 日 {#april-18-2024}
### AWS 东京区域现已可用于 ClickHouse Cloud {#aws-tokyo-region-is-now-available-for-clickhouse-cloud}

此版本引入了 ClickHouse Cloud 的新 AWS 东京区域（`ap-northeast-1`）。因为我们希望 ClickHouse 成为最快的数据库，我们会不断增加每个云的更多区域，以尽可能减少延迟。您可以在更新的云控制台中在东京创建新的服务。

<Image img={tokyo} size="lg" alt="ClickHouse Cloud service creation interface showing Tokyo region selection" border />

其他更改：
### 控制台更改 {#console-changes}
- ClickPipes 的 Avro 格式支持现已正式发布
- 为 Terraform 提供程序实现完全支持导入资源（服务和私有端点）

### 集成更改 {#integrations-changes}
- NodeJS 客户端重大稳定发布：查询 + ResultSet 的高级 TypeScript 支持，URL 配置
- Kafka 连接器：修复写入 DLQ 时忽略异常的错误，增加对 Avro 枚举类型的支持，为在 [MSK](https://www.youtube.com/watch?v=6lKI_WlQ3-s) 和 [Confluent Cloud](https://www.youtube.com/watch?v=SQAiPVbd3gg) 上使用连接器发布指南
- Grafana：修复 UI 中 Nullable 类型支持，修复动态 OTEL 跟踪表名的支持
- DBT：修复自定义物化的模型设置。
- Java 客户端：修复错误码解析的错误
- Python 客户端：修复数值类型的参数绑定，修复查询绑定中的数字列表错误，增加对 SQLAlchemy Point 的支持。

## 2024 年 4 月 4 日 {#april-4-2024}
### 推出新的 ClickHouse Cloud 控制台 {#introducing-the-new-clickhouse-cloud-console}

此版本推出了新的云控制台的私人预览。

在 ClickHouse，我们不断思考如何改善开发者体验。我们意识到，提供最快的实时数据仓库是不够的，它还需要易于使用和管理。

成千上万的 ClickHouse Cloud 用户每月在我们的 SQL 控制台上执行数十亿次查询，这就是为什么我们决定投资于世界级的控制台，以便与 ClickHouse Cloud 服务更方便地交互。我们新的云控制台体验将我们的独立 SQL 编辑器与管理控制台结合在一个直观的 UI 中。

选定的客户将获得我们新云控制台体验的预览 - 一种探索和管理 ClickHouse 数据的新统一和沉浸式方式。如果您希望优先访问，请通过 support@clickhouse.com 与我们联系。

<Image img={cloud_console} size="lg" alt="Animation showing the new ClickHouse Cloud Console interface with integrated SQL editor and management features" border />

## 2024 年 3 月 28 日 {#march-28-2024}

此版本引入了 Microsoft Azure 支持、通过 API 进行水平扩展以及私人预览中的发布渠道。
### 常规更新 {#general-updates}
- 引入了 Microsoft Azure 的私人预览支持。要获得访问权限，请联系账户管理或支持，或加入 [候补名单](https://clickhouse.com/cloud/azure-waitlist)。
- 引入了发布渠道 - 根据环境类型指定升级时间的能力。在此版本中，我们增加了“快速”发布渠道，使您能够提前升级非生产环境。
### 管理变化 {#administration-changes}
- 通过 API 添加水平扩展配置支持（私人预览，请联系支持以启用）
- 改进自动扩展以在启动时扩展内存不足的服务
- 通过 Terraform 提供程序增加对 AWS 的 CMEK 支持

### 控制台更改 {#console-changes-1}
- 添加了对 Microsoft 社交登录的支持
- 添加了在 SQL 控制台中共享参数化查询的能力
- 在某些欧盟地区显著改善查询编辑器的性能（从 5 秒减少到 1.5 秒的延迟）

### 集成更改 {#integrations-changes-1}
- ClickHouse OpenTelemetry 导出器：[添加支持](https://github.com/open-telemetry/opentelemetry-collector-contrib/pull/31920) 对 ClickHouse 复制表引擎的支持，并 [添加集成测试](https://github.com/open-telemetry/opentelemetry-collector-contrib/pull/31896)
- ClickHouse DBT 适配器：为 [字典的物化宏](https://github.com/ClickHouse/dbt-clickhouse/pull/255) 和 [TTL 表达式支持的测试](https://github.com/ClickHouse/dbt-clickhouse/pull/254) 添加支持
- ClickHouse Kafka Connect Sink：[添加兼容性](https://github.com/ClickHouse/clickhouse-kafka-connect/issues/350) 与 Kafka 插件发现（社区贡献）
- ClickHouse Java 客户端：为新客户端 API 引入了 [一个新包](https://github.com/ClickHouse/clickhouse-java/pull/1574)，并为云测试添加了 [测试覆盖](https://github.com/ClickHouse/clickhouse-java/pull/1575)
- ClickHouse NodeJS 客户端：扩展对新 HTTP keep-alive 行为的测试和文档。从 v0.3.0 版本开始可用。
- ClickHouse Golang 客户端：[修复了一个错误](https://github.com/ClickHouse/clickhouse-go/pull/1236)，即将 Enum 作为 Map 中的关键；[修复了一个错误](https://github.com/ClickHouse/clickhouse-go/pull/1237)，即已发错误的连接留在连接池中（社区贡献）。
- ClickHouse Python 客户端：[添加支持](https://github.com/ClickHouse/clickhouse-connect/issues/155) 通过 PyArrow 流式传输查询（社区贡献）。

### 安全更新 {#security-updates}
- 更新 ClickHouse Cloud 以防止 ["基于角色的访问控制在启用查询缓存时被绕过"](https://github.com/ClickHouse/ClickHouse/security/advisories/GHSA-45h5-f7g3-gr8r)（CVE-2024-22412）。

## 2024 年 3 月 14 日 {#march-14-2024}

此版本提供新云控制台体验、适用于 S3 和 GCS 的 ClickPipes 批量加载支持以及在 ClickPipes 中支持 Avro 格式的早期访问。它还将 ClickHouse 数据库版本升级到 24.1，带来新功能的支持以及性能和资源使用的优化。
### 控制台更改 {#console-changes-2}
- 新的云控制台体验在早期访问中可用（如果您有兴趣参与，请联系支持）。
- ClickPipes 批量加载适用于 S3 和 GCS 也在早期访问中可用（如果您有兴趣参与，请联系支持）。
- ClickPipes 中对 Kafka 的 Avro 格式的支持也在早期访问中。

### ClickHouse 版本升级 {#clickhouse-version-upgrade}
- 对 FINAL 的优化、向量化改进、快速聚合 - 有关详细信息，请参见 [23.12 版本博客](https://clickhouse.com/blog/clickhouse-release-23-12#optimizations-for-final)。
- 处理 punycode、字符串相似性、检测离群值的新函数，以及合并和 Keeper 的内存优化 - 有关详细信息，请参见 [24.1 版本博客](https://clickhouse.com/blog/clickhouse-release-24-01) 和 [演示](https://presentations.clickhouse.com/release_24.1/)。
- 此 ClickHouse 云版本基于 24.1，您可以看到数十个新功能、性能改进和错误修复。请参见核心数据库 [变更日志](/whats-new/changelog/2023#2312)。

### 集成更改 {#integrations-changes-2}
- Grafana：修复 v4 的仪表盘迁移，临时过滤逻辑。
- Tableau 连接器：修复 DATENAME 函数和 “real” 参数的四舍五入。
- Kafka 连接器：修复连接初始化中的 NPE，增加指定 JDBC 驱动程序选项的能力。
- Golang 客户端：减少处理响应的内存占用，修复 Date32 极端值，修复启用压缩时的错误报告。
- Python 客户端：改进 datetime 参数的时区支持，改善 Pandas DataFrame 的性能。

## 2024 年 2 月 29 日 {#february-29-2024}

此版本改善了 SQL 控制台应用程序的加载时间，增加了对 ClickPipes 中 SCRAM-SHA-256 认证的支持，并将嵌套结构支持扩展到 Kafka Connect。

### 控制台更改 {#console-changes-3}
- 优化 SQL 控制台应用程序的初始加载时间
- 修复 SQL 控制台中的竞争条件，导致“认证失败”错误
- 修复监控页面中最近的内存分配值有时不正确的行为
- 修复控制台有时发出重复 KILL QUERY 命令的行为
- 在 ClickPipes 中添加 Kafka 数据源的 SCRAM-SHA-256 认证方法的支持

### 集成更改 {#integrations-changes-3}
- Kafka 连接器：扩展对复杂嵌套结构（Array、Map）的支持；增加对 FixedString 类型的支持；增加对多个数据库的导入支持。
- Metabase：修复 ClickHouse 版本低于 23.8 的不兼容问题。
- DBT：增加参数传递到模型创建的能力。
- Node.js 客户端：增加对长时间运行查询（>1小时）的支持，并优雅处理空值。

## 2024 年 2 月 15 日 {#february-15-2024}

此版本升级核心数据库版本，增加通过 Terraform 设置私有链接的能力，并增加对通过 Kafka Connect 的精确插入语义的支持。

### ClickHouse 版本升级 {#clickhouse-version-upgrade-1}
- S3Queue 表引擎用于从 S3 连续、定时加载数据已达到生产就绪状态 - 有关详细信息，请参见 [23.11 版本博客](https://clickhouse.com/blog/clickhouse-release-23-11)。
- 针对 FINAL 的重大性能改善和 SIM由指令的向量化改进，带来更快的查询 - 有关详细信息，请参见 [23.12 版本博客](https://clickhouse.com/blog/clickhouse-release-23-12#optimizations-for-final)。
- 此 ClickHouse 云版本基于 23.12，您可以看到数十个新功能、性能改进和错误修复。请参见 [核心数据库变更日志](/whats-new/changelog/2023#2312) 以获取详细信息。

### 控制台更改 {#console-changes-4}
- 增加通过 Terraform 提供程序设置 AWS 私有链接和 GCP 私有服务连接的能力
- 改进远程文件数据导入的可靠性
- 对所有数据导入添加导入状态详细信息的弹出窗口
- 对 s3 数据导入增加 key/secret key 凭证支持

### 集成更改 {#integrations-changes-4}
* Kafka Connect
    * 支持 async_insert 的精确插入（默认禁用）
* Golang 客户端
    * 修复 DateTime 绑定问题
    * 改进批量插入性能
* Java 客户端
    * 修复请求压缩问题
### 设置更改 {#settings-changes}
* `use_mysql_types_in_show_columns` 不再是必需的。当通过 MySQL 接口连接时，它会自动启用。
* `async_insert_max_data_size` 现在的默认值为 `10 MiB`。
## 2024年2月2日 {#february-2-2024}

本次发布带来了 ClickPipes 对于 Azure Event Hub 的可用性，显著改善了使用 v4 ClickHouse Grafana 连接器的日志和追踪导航的工作流程，并首次支持 Flyway 和 Atlas 数据库架构管理工具。
### 控制台更改 {#console-changes-5}
* 为 Azure Event Hub 添加了 ClickPipes 支持 
* 新服务的默认闲置时间为 15 分钟
### 集成更改 {#integrations-changes-5}
* [ClickHouse 数据源用于 Grafana](https://grafana.com/grafana/plugins/grafana-clickhouse-datasource/) v4 版本
  * 完全重建的查询构建器，针对表、日志、时间序列和追踪提供专门的编辑器
  * 完全重建的 SQL 生成器，支持更加复杂和动态的查询
  * 在日志和追踪视图中增加了对 OpenTelemetry 的一流支持
  * 扩展配置，允许指定日志和追踪的默认表和列
  * 增加了指定自定义 HTTP 头的能力
  * 和更多的改进 - 查看完整的 [变更日志](https://github.com/grafana/clickhouse-datasource/blob/main/CHANGELOG.md#400)
* 数据库架构管理工具
  * [Flyway 添加了 ClickHouse 支持](https://github.com/flyway/flyway-community-db-support/packages/2037428)
  * [Ariga Atlas 添加了 ClickHouse 支持](https://atlasgo.io/blog/2023/12/19/atlas-v-0-16#clickhouse-beta-program)
* Kafka Connector Sink
  * 优化了具有默认值的表的摄取
  * 添加了对 DateTime64 中基于字符串的日期的支持
* Metabase
  * 添加了对多个数据库的连接支持
## 2024年1月18日 {#january-18-2024}

本次发布带来了 AWS 新区域（伦敦 / eu-west-2），增加了对 Redpanda、Upstash 和 Warpstream 的 ClickPipes 支持，并提高了 [is_deleted](/engines/table-engines/mergetree-family/replacingmergetree#is_deleted) 核心数据库能力的可靠性。
### 一般更改 {#general-changes}
- 新的 AWS 区域：伦敦 (eu-west-2)
### 控制台更改 {#console-changes-6}
- 为 Redpanda、Upstash 和 Warpstream 添加了 ClickPipes 支持
- 使 ClickPipes 认证机制可以在 UI 中进行配置
### 集成更改 {#integrations-changes-6}
- Java 客户端：
  - 破坏性更改：移除了在调用中指定随机 URL 手柄的能力。这个功能已从 ClickHouse 中移除
  - 弃用：Java CLI 客户端和 GRPC 包
  - 添加了 RowBinaryWithDefaults 格式的支持，以减少批处理大小和对 ClickHouse 实例的工作负载（Exabeam 提出的请求）
  - 使 Date32 和 DateTime64 的范围边界与 ClickHouse 兼容，兼容 Spark Array 字符串类型，节点选择机制
- Kafka Connector：为 Grafana 添加了 JMX 监控仪表板
- PowerBI：使 ODBC 驱动程序设置可以在 UI 中进行配置
- JavaScript 客户端：公开了查询摘要信息，允许为插入提供特定列的子集，使 web 客户端的 keep_alive 可配置
- Python 客户端：为 SQLAlchemy 添加了 Nothing 类型支持
### 可靠性更改 {#reliability-changes}
- 面向用户的向后不兼容更改：之前，在某些条件下，两个功能（[is_deleted](/engines/table-engines/mergetree-family/replacingmergetree#is_deleted) 和 ``OPTIMIZE CLEANUP``）可能导致 ClickHouse 数据的损坏。为了保护用户数据的完整性，同时保持功能的核心部分，我们调整了该功能的工作方式。具体来说，MergeTree 设置 ``clean_deleted_rows`` 现在已弃用，并且不再生效。``CLEANUP`` 关键字默认不被允许（要使用它，您需要启用 ``allow_experimental_replacing_merge_with_cleanup``）。如果您决定使用 ``CLEANUP``，您需要确保始终与 ``FINAL`` 一起使用，并且必须保证在运行 ``OPTIMIZE FINAL CLEANUP`` 之后不会插入旧版本的行。
## 2023年12月18日 {#december-18-2023}

本次发布带来了 GCP 新区域（us-east1），自助服务安全端点连接的能力，支持包括 DBT 1.7 在内的额外集成以及众多错误修复和安全增强。
### 一般更改 {#general-changes-1}
- ClickHouse Cloud 现在在 GCP us-east1（南卡罗来纳州）区域可用
- 启用了通过 OpenAPI 设置 AWS Private Link 和 GCP Private Service Connect 的能力
### 控制台更改 {#console-changes-7}
- 为具有开发者角色的用户启用了无缝登录 SQL 控制台
- 在入职期间简化了设置闲置控制的工作流程
### 集成更改 {#integrations-changes-7}
- DBT 连接器：添加对 DBT v1.7 的支持
- Metabase：添加对 Metabase v0.48 的支持
- PowerBI Connector：增加了在 PowerBI Cloud 上运行的能力
- 使 ClickPipes 内部用户的权限可配置
- Kafka Connect
  - 改进了去重逻辑和 Nullable 类型的摄取。
  - 添加了对基于文本的格式（CSV、TSV）的支持
- Apache Beam：添加对布尔型和 LowCardinality 类型的支持
- Nodejs 客户端：添加对 Parquet 格式的支持
### 安全公告 {#security-announcements}
- 修补了 3 个安全漏洞 - 详细内容请见 [安全变更日志](/whats-new/security-changelog)：
  - CVE 2023-47118 (CVSS 7.0) - 影响默认运行在 9000/tcp 端口上的本地接口的堆缓冲区溢出漏洞
  - CVE-2023-48704 (CVSS 7.0) - 影响默认运行在 9000/tcp 端口上的本地接口的堆缓冲区溢出漏洞
  - CVE 2023-48298 (CVSS 5.9) - FPC 压缩编解码器中的整数下溢漏洞
## 2023年11月22日 {#november-22-2023}

本次发布升级了核心数据库版本，改善了登录和身份验证流程，并为 Kafka Connect Sink 添加了代理支持。
### ClickHouse 版本升级 {#clickhouse-version-upgrade-2}

- 显著提高了读取 Parquet 文件的性能。有关详细信息，请参见 [23.8 版本博客](https://clickhouse.com/blog/clickhouse-release-23-08)。
- 添加了对 JSON 的类型推断支持。有关详细信息，请参见 [23.9 版本博客](https://clickhouse.com/blog/clickhouse-release-23-09)。
- 引入了强大的分析师面对的功能，比如 `ArrayFold`。有关详细信息，请参见 [23.10 版本博客](https://clickhouse.com/blog/clickhouse-release-23-10)。
- **面向用户的向后不兼容更改**：默认禁用了设置 `input_format_json_try_infer_numbers_from_strings`，以避免在 JSON 格式中从字符串推断数字。这样做可能在样本数据包含类似于数字的字符串时产生潜在的解析错误。
- 数十个新功能、性能改进和错误修复。有关详细信息，请参见 [核心数据库变更日志](/whats-new/changelog)。
### 控制台更改 {#console-changes-8}

- 改进了登录和身份验证流程。
- 改进了基于 AI 的查询建议，以更好地支持大型架构。
### 集成更改 {#integrations-changes-8}

- Kafka Connect Sink：增加了代理支持、`topic-tablename` 映射和 Keeper _exactly-once_ 交付属性的可配置性。
- Node.js 客户端：添加对 Parquet 格式的支持。
- Metabase：添加 `datetimeDiff` 函数支持。
- Python 客户端：添加对列名称中特殊字符的支持。修复时区参数绑定问题。
## 2023年11月2日 {#november-2-2023}

本次发布增加了对亚洲开发服务的地区支持，向客户管理的加密密钥引入了密钥轮换功能，改进了账单控制台中的税务设置粒度，并修复了多个支持语言客户端的问题。
### 一般更新 {#general-updates-1}
- 开发服务现在在 AWS 的 `ap-south-1`（孟买）和 `ap-southeast-1`（新加坡）中可用
- 添加了客户管理的加密密钥（CMEK）的密钥轮换支持
### 控制台更改 {#console-changes-9}
- 添加了在添加信用卡时配置详细税务设置的能力
### 集成更改 {#integrations-changes-9}
- MySQL
  - 通过 MySQL 改进了 Tableau Online 和 QuickSight 的支持
- Kafka Connector
  - 引入了新的 StringConverter，以支持基于文本的格式（CSV、TSV）
  - 添加了对字节和小数数据类型的支持
  - 调整了可重试异常，以便现在始终重试（即使 errors.tolerance=all）
- Node.js 客户端
  - 修复了导致流式大数据集提供损坏结果的问题
- Python 客户端
  - 修复了大数据插入时的超时
  - 修复了 NumPy/Pandas Date32 问题
- Golang 客户端
  - 修复了将空映射插入 JSON 列的问题，压缩缓冲区清理问题，查询转义问题，以及在 IPv4 和 IPv6 上的零/空值时引发的恐慌
  - 为已取消的插入添加监视程序
- DBT
  - 改进了分布式表支持的测试
## 2023年10月19日 {#october-19-2023}

本次发布带来了 SQL 控制台的可用性和性能改进，改进了 Metabase 连接器中 IP 数据类型的处理，并在 Java 和 Node.js 客户端中引入了新功能。
### 控制台更改 {#console-changes-10}
- 改进了 SQL 控制台的可用性（例如，在查询执行之间保留列宽）
- 改进了 SQL 控制台的性能
### 集成更改 {#integrations-changes-10}
- Java 客户端：
  - 更改了默认网络库，以提高性能并重用开放连接
  - 添加了代理支持
  - 添加了使用可信存储的安全连接支持
- Node.js 客户端：修复了插入查询的保持活动行为
- Metabase：修复了 IPv4/IPv6 列序列化
## 2023年9月28日 {#september-28-2023}

本次发布为 Kafka、Confluent Cloud 和 Amazon MSK 提供了 ClickPipes 的一般可用性，以及 Kafka Connect ClickHouse Sink，自助服务工作流程以通过 IAM 角色安全访问 Amazon S3，以及 AI 辅助查询建议（私人预览）。
### 控制台更改 {#console-changes-11}
- 添加了一个自助服务工作流程来安全地 [访问 Amazon S3 via IAM roles](/cloud/security/secure-s3)
- 在私人预览中引入了 AI 辅助查询建议（请 [联系 ClickHouse Cloud 支持](https://console.clickhouse.cloud/support) 以试用！）
### 集成更改 {#integrations-changes-11}
- 宣布 ClickPipes 的一般可用性 - 一种即插即用的数据摄取服务 - 适用于 Kafka、Confluent Cloud 和 Amazon MSK（有关详细信息，请参见 [发布博客](https://clickhouse.com/blog/clickpipes-is-generally-available)）
- Kafka Connect ClickHouse Sink 的一般可用性
  - 扩展了对使用 `clickhouse.settings` 属性自定义 ClickHouse 设置的支持
  - 改进了去重行为，以考虑动态字段
  - 添加了对 `tableRefreshInterval` 的支持，以从 ClickHouse 重新获取表更改
- 修复了 SSL 连接问题和 [PowerBI](/integrations/powerbi) 与 ClickHouse 数据类型之间的类型映射
## 2023年9月7日 {#september-7-2023}

本次发布带来了 PowerBI Desktop 官方连接器的测试版本，改进了印度的信用卡支付处理，以及多个支持语言客户端的改进。
### 控制台更改 {#console-changes-12}
- 添加剩余信用额度和支付重试以支持来自印度的收费
### 集成更改 {#integrations-changes-12}
- Kafka Connector：添加了配置 ClickHouse 设置的支持，添加了错误.tolerance 配置选项
- PowerBI Desktop：发布了官方连接器的测试版本
- Grafana：添加了对点地理类型的支持，修复了数据分析仪表板中的面板，修复了时间间隔宏
- Python 客户端：与 Pandas 2.1.0 兼容，删除了 Python 3.7 的支持，添加了对可空 JSON 类型的支持
- Node.js 客户端：添加了 default_format 设置支持
- Golang 客户端：修复了布尔类型处理，删除了字符串限制
## 2023年8月24日 {#aug-24-2023}

本次发布为 ClickHouse 数据库添加了对 MySQL 接口的支持，引入了新的官方 PowerBI 连接器，在云控制台中添加了新的“正在运行的查询”视图，并将 ClickHouse 版本更新为 23.7。
### 一般更新 {#general-updates-2}
- 添加了对 [MySQL wire protocol](/interfaces/mysql) 的支持，这使（在其他用例中）与许多现有 BI 工具兼容。请联系支持启用此功能。
- 引入了新的官方 PowerBI 连接器
### 控制台更改 {#console-changes-13}
- 添加了 SQL 控制台中的“正在运行的查询”视图支持
### ClickHouse 23.7 版本升级 {#clickhouse-237-version-upgrade}
- 添加了对 Azure 表函数的支持，将地理数据类型提升到生产准备，改进了连接性能 - 有关详细信息，请参见 23.5 版本 [博客](https://clickhouse.com/blog/clickhouse-release-23-05)。
- 扩展了对 MongoDB 集成支持到版本 6.0 - 有关详细信息，请参见 23.6 版本 [博客](https://clickhouse.com/blog/clickhouse-release-23-06)。
- 将写入 Parquet 格式的性能提升了 6 倍，添加了对 PRQL 查询语言的支持，并改善了 SQL 兼容性 - 有关详细信息，请参见 23.7 版本 [deck](https://presentations.clickhouse.com/release_23.7/)。
- 数十个新功能、性能改进和错误修复 - 有关详细信息，请参见 23.5、23.6、23.7 的详细 [变更日志](/whats-new/changelog)。
### 集成更改 {#integrations-changes-13}
- Kafka Connector：添加对 Avro 日期和时间类型的支持
- JavaScript 客户端：为基于 Web 的环境发布了稳定版本
- Grafana：改进了过滤逻辑、数据库名称处理，并添加了对毫秒级精度的时间间隔支持
- Golang 客户端：修复了多个批处理和异步数据加载问题
- Metabase：支持 v0.47，添加连接代理，修复数据类型映射
## 2023年7月27日 {#july-27-2023}

本次发布带来了 Kafka 的 ClickPipes 私人预览，新的数据加载体验，以及通过云控制台使用 URL 加载文件的能力。
### 集成更改 {#integrations-changes-14}
- 引入了 [ClickPipes](https://clickhouse.com/cloud/clickpipes) 的私人预览，用于 Kafka，这是一种云原生集成引擎，使从 Kafka 和 Confluent Cloud 吸收大量数据变得简单，只需点击几个按钮即可。请在 [这里](https://clickhouse.com/cloud/clickpipes#joinwaitlist) 注册等待列表。
- JavaScript 客户端：发布了对基于 Web 的环境的支持（浏览器、Cloudflare 工人）。代码已重构，允许社区为自定义环境创建连接器。
- Kafka Connector：添加了对时间戳和时间 Kafka 类型的内联架构的支持
- Python 客户端：修复了插入压缩和 LowCardinality 读取问题
### 控制台更改 {#console-changes-14}
- 添加了一种新的数据加载体验，具有更多表创建配置选项
- 引入了通过云控制台使用 URL 加载文件的能力
- 改进了邀请流程，增加了加入其他组织的额外选项，并查看所有未处理的邀请
## 2023年7月14日 {#july-14-2023}

本次发布带来了启动专用服务的能力，在澳大利亚的新 AWS 区域，以及带来您自己密钥以加密磁盘上的数据的能力。
### 一般更新 {#general-updates-3}
- 新 AWS 澳大利亚区域：悉尼 (ap-southeast-2)
- 为要求延迟敏感的工作负载提供专用层服务（请联系 [支持](https://console.clickhouse.cloud/support) 以进行设置）
- 带上您自己的密钥（BYOK）以加密磁盘上的数据（请联系 [支持](https://console.clickhouse.cloud/support) 以进行设置）
### 控制台更改 {#console-changes-15}
- 改进了用于异步插入的可观察性指标仪表板
- 改进了与支持的集成的聊天机器人行为
### 集成更改 {#integrations-changes-15}
- NodeJS 客户端：修复了由于套接字超时而导致连接失败的错误
- Python 客户端：为插入查询添加了 QuerySummary，支持数据库名称中的特殊字符
- Metabase：更新了 JDBC 驱动程序版本，添加了 DateTime64 支持，性能改进。
### 核心数据库更改 {#core-database-changes}
- 可以在 ClickHouse Cloud 中启用 [查询缓存](/operations/query-cache)。启用后，成功的查询默认缓存一分钟，后续查询将使用缓存结果。
## 2023年6月20日 {#june-20-2023}

本次发布使 ClickHouse Cloud 在 GCP 上普遍可用，带来了 Cloud API 的 Terraform 提供程序，并将 ClickHouse 版本更新为 23.4。
### 一般更新 {#general-updates-4}
- ClickHouse Cloud 在 GCP 上现在 GA，带来 GCP Marketplace 集成、支持 Private Service Connect 和自动备份（有关详细信息，请参见 [博客](https://clickhouse.com/blog/clickhouse-cloud-on-google-cloud-platform-gcp-is-generally-available) 和 [公告](https://clickhouse.com/blog/clickhouse-cloud-expands-choice-with-launch-on-google-cloud-platform)）
- 现已提供 [Terraform 提供程序](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs) 用于 Cloud API
### 控制台更改 {#console-changes-16}
- 添加了服务的新合并设置页面
- 调整了存储和计算的计量准确性
### 集成更改 {#integrations-changes-16}
- Python 客户端：改进了插入性能，重构了内部依赖关系以支持多处理
- Kafka Connector：可以在 Confluent Cloud 上上传和安装，增加了对中间连接问题的重试，自动重置不正确的连接状态
### ClickHouse 23.4 版本升级 {#clickhouse-234-version-upgrade}
- 为并行副本添加了 JOIN 支持（请联系 [支持](https://console.clickhouse.cloud/support) 以进行设置）
- 改进了轻量级删除的性能
- 改进了处理大插入时的缓存
### 管理更改 {#administration-changes-1}
- 扩展了对非“默认”用户本地字典创建的支持
## 2023年5月30日 {#may-30-2023}

本次发布带来了 ClickHouse Cloud 可编程 API 的公开发布（有关详细信息，请参见 [博客](https://clickhouse.com/blog/using-the-new-clickhouse-cloud-api-to-automate-deployments)），通过 IAM 角色访问 S3 的能力，以及额外的扩展选项。
### 一般更改 {#general-changes-2}
- ClickHouse Cloud 的 API 支持。通过新的 Cloud API，您可以无缝集成服务管理到现有的 CI/CD 管道中，并以编程方式管理服务
- 通过 IAM 角色访问 S3。您现在可以利用 IAM 角色安全访问您的私有 Amazon Simple Storage Service (S3) 存储桶（请联系支持以进行设置）
### 扩展更改 {#scaling-changes}
- [水平扩展](/manage/scaling#manual-horizontal-scaling)。需要更多并行化的工作负载现在可以配置最多 10 个副本（请联系支持以进行设置）
- [基于 CPU 的自动扩展](/manage/scaling)。 CPU 限制的工作负载现在可以受益于自动扩展策略的额外触发器
### 控制台更改 {#console-changes-17}
- 将开发服务迁移到生产服务（请联系支持以启用）
- 在实例创建流程中添加扩展配置控件
- 当默认密码不在内存中时修复连接字符串
### 集成更改 {#integrations-changes-17}
- Golang 客户端：修复了导致本地协议中连接不平衡的问题，添加了对本地协议中自定义设置的支持
- Nodejs 客户端：删除了对 nodejs v14 的支持，添加了对 v20 的支持
- Kafka Connector：添加对 LowCardinality 类型的支持
- Metabase：修复按时间范围分组，修复内置 Metabase 问题中的整数支持
### 性能和可靠性 {#performance-and-reliability}
- 提高了写入密集型工作负载的效率和性能
- 部署了增量备份策略，以提高备份的速度和效率
## 2023年5月11日 {#may-11-2023}

本次发布带来了 ClickHouse Cloud 在 GCP 上的~~公测~~（现在 GA，见上面的6月20日条目）（有关详细信息，请参见 [博客](https://clickhouse.com/blog/clickhouse-cloud-on-gcp-available-in-public-beta)），扩展了管理员权限授予终止查询权限，并增加了在云控制台中对 MFA 用户状态的可见性。
### ClickHouse Cloud 在 GCP 上~~(公测)~~（现在 GA，见上面的6月20日条目） {#clickhouse-cloud-on-gcp-public-beta-now-ga-see-june-20th-entry-above}
- 启动了一种完全托管的单独存储和计算的 ClickHouse 提供，运行在 Google Compute 和 Google Cloud Storage 之上
- 在爱荷华州（us-central1）、荷兰（europe-west4）和新加坡（asia-southeast1）区域可用
- 在所有三个初始区域支持开发和生产服务
- 默认提供强大的安全性：传输中的端到端加密、静态数据加密、IP 允许列表
### 集成更改 {#integrations-changes-18}
- Golang 客户端：添加对代理环境变量的支持
- Grafana：添加了在 Grafana 数据源设置中指定 ClickHouse 自定义设置和代理环境变量的能力
- Kafka Connector：改进了处理空记录
### 控制台更改 {#console-changes-18}
- 在用户列表中添加了多因素身份验证 (MFA) 使用的指示器
### 性能和可靠性 {#performance-and-reliability-1}
- 为管理员增加了对终止查询权限的更细粒度控制
## 2023年5月4日 {#may-4-2023}

本次发布带来了新的热图图表类型，改进了账单使用页面，并改善了服务启动时间。
### 控制台更改 {#console-changes-19}
- 在 SQL 控制台中添加热图图表类型
- 改进了账单使用页面，以显示每个账单维度消耗的信用额度
### 集成更改 {#integrations-changes-19}
- Kafka 连接器：为瞬时连接错误添加了重试机制
- Python 客户端：添加了 max_connection_age 设置，以确保 HTTP 连接不会被永久重用。这可以帮助某些负载均衡问题
- Node.js 客户端：添加了对 Node.js v20 的支持
- Java 客户端：改进了客户端证书身份验证支持，并添加了对嵌套 Tuple/Map/Nested 类型的支持
### 性能和可靠性 {#performance-and-reliability-2}
- 在存在大量部分时改善了服务启动时间
- 优化了 SQL 控制台中长时间运行的查询取消逻辑
### 错误修复 {#bug-fixes}
- 修复了一个导致“Cell Towers”示例数据集导入失败的错误
## 2023年4月20日 {#april-20-2023}

本次发布将 ClickHouse 版本更新为 23.3，显著提高了冷读取速度，并提供了与支持的实时聊天功能。
### 控制台更改 {#console-changes-20}
- 添加了与支持的实时聊天选项
### 集成更改 {#integrations-changes-20}
- Kafka 连接器：添加对 Nullable 类型的支持
- Golang 客户端：添加对外部表的支持，支持布尔值和指针类型参数绑定
### 配置更改 {#configuration-changes}
- 添加删除大表的能力-通过覆盖 `max_table_size_to_drop` 和 `max_partition_size_to_drop` 设置
### 性能和可靠性 {#performance-and-reliability-3}
- 通过 `allow_prefetched_read_pool_for_remote_filesystem` 设置提高冷读取速度
### ClickHouse 23.3 版本升级 {#clickhouse-233-version-upgrade}
- 轻量级删除已准备好投入生产-请参见 23.3 版本 [博客](https://clickhouse.com/blog/clickhouse-release-23-03) 获取详细信息
- 添加对多阶段 PREWHERE 的支持-请参见 23.2 版本 [博客](https://clickhouse.com/blog/clickhouse-release-23-03) 的详细信息
- 数十个新功能、性能改进和错误修复 - 有关详细信息，请参见 23.3 和 23.2 的详细 [变更日志](/whats-new/changelog/index.md)。
## 2023年4月6日 {#april-6-2023}

本次发布带来了一个用于检索云端点的 API、最小闲置超时的高级扩展控制，以及 Python 客户端查询方法中对外部数据的支持。
### API 更改 {#api-changes}
* 添加了通过 [Cloud Endpoints API](//cloud/get-started/query-endpoints.md) 以编程方式查询 ClickHouse Cloud 端点的能力
### 控制台更改 {#console-changes-21}
- 在高级扩展设置中添加了“最小闲置超时”设置
- 在数据加载模式中添加了带最努力的日期时间检测的模式
### 集成更改 {#integrations-changes-21}
- [Metabase](/integrations/data-visualization/metabase-and-clickhouse.md)：添加了对多个架构的支持
- [Go 客户端](/integrations/language-clients/go/index.md)：修复了 TLS 连接的空闲连接存活检查
- [Python 客户端](/integrations/language-clients/python/index.md)
  - 添加对查询方法中外部数据的支持
  - 添加查询结果时区的支持
  - 添加 `no_proxy`/`NO_PROXY` 环境变量的支持
  - 修复了 Nullable 类型的 NULL 值的服务器端参数绑定
### 错误修复 {#bug-fixes-1}
* 修复了在 SQL 控制台上运行 `INSERT INTO ... SELECT ...` 时错误地将相同的行限制应用于选择查询的行为
## 2023年3月23日 {#march-23-2023}

本次发布带来了数据库密码复杂性规则、显著加快了大备份的恢复速度，并支持在 Grafana Trace View 中显示追踪。
### 安全和可靠性 {#security-and-reliability}
- 核心数据库端点现在强制实施密码复杂性规则
- 改善了恢复大备份的时间
### 控制台更改 {#console-changes-22}
- 精简了入职工作流程，推出新默认值和更紧凑的视图
- 减少了注册和登录延迟
### 集成更改 {#integrations-changes-22}
- Grafana：
  - 添加了在 Trace View 中显示存储在 ClickHouse 中的追踪数据的支持
  - 改进了时间范围过滤器，并添加了对表名中特殊字符的支持
- Superset：添加对 ClickHouse 的原生支持
- Kafka Connect Sink：添加自动日期转换和 Null 列处理
- Metabase：实现了与 v0.46 的兼容性
- Python 客户端：修复了临时表中的插入，并添加了对 Pandas Null 的支持
- Golang 客户端：将日期类型标准化为时区
- Java 客户端
  - 为 SQL 解析器添加了对压缩、infile 和 outfile 关键字的支持
  - 添加了凭证重载
  - 修复了与 `ON CLUSTER` 的批处理支持
- Node.js 客户端
  - 添加了对 JSONStrings、JSONCompact、JSONCompactStrings、JSONColumnsWithMetadata 格式的支持
  - 现在可以为所有主要客户端方法提供 `query_id`。
### 错误修复 {#bug-fixes-2}
- 修复了导致新服务的初始配置和启动时间缓慢的错误
- 修复了由于缓存配置错误导致查询性能下降的错误
## 2023年3月9日 {#march-9-2023}

本次发布改善了可观察性仪表板，优化了创建大备份的时间，并增加了删除大表和分区所需的配置。
### 控制台更改 {#console-changes-23}
- 添加了高级可观察性仪表板（预览）
- 在可观察性仪表板中引入了内存分配图表
- 改善了 SQL 控制台电子表格视图中的间距和换行处理
### 可靠性和性能 {#reliability-and-performance}
- 优化了备份计划，仅在数据修改时运行备份
- 改善了完成大备份的时间
### 配置更改 {#configuration-changes-1}
- 在查询或连接级别上，通过覆盖设置 `max_table_size_to_drop` 和 `max_partition_size_to_drop` 的能力，提高删除表和分区的限额
- 向查询日志中添加源 IP，以启用基于源 IP 的配额和访问控制执行
### 集成 {#integrations}
- [Python 客户端](/integrations/language-clients/python/index.md)：改进了 Pandas 支持，并修复时区相关问题
- [Metabase](/integrations/data-visualization/metabase-and-clickhouse.md)：与 Metabase 0.46.x 兼容，并支持 SimpleAggregateFunction
- [Kafka-Connect](/integrations/data-ingestion/kafka/index.md)：隐式日期转换和更好地处理空列
- [Java 客户端](https://github.com/ClickHouse/clickhouse-java)：嵌套转换为 Java maps
## 2023年2月23日 {#february-23-2023}

本次发布启用了 ClickHouse 23.1 核心版本中的一部分功能，带来了与 Amazon Managed Streaming for Apache Kafka (MSK) 的互操作性，并在活动日志中公开了高级扩展和闲置调整功能。
### ClickHouse 23.1 版本升级 {#clickhouse-231-version-upgrade}

添加了对 ClickHouse 23.1 中一部分功能的支持，例如：
- Map 类型的 ARRAY JOIN
- SQL 标准的十六进制和二进制文字
- 新函数，包括 `age()`、`quantileInterpolatedWeighted()`、`quantilesInterpolatedWeighted()`
- 能够在 `generateRandom` 中使用插入表的结构而不带参数
- 改进的数据库创建和重命名逻辑，允许重用先前的名称
- 有关详细信息，请参见 23.1 版本 [网络研讨会幻灯片](https://presentations.clickhouse.com/release_23.1/#cover) 和 [23.1 版本变更日志](/whats-new/cloud#clickhouse-231-version-upgrade)。
### 集成更改 {#integrations-changes-23}
- [Kafka-Connect](/integrations/data-ingestion/kafka/index.md): 添加对 Amazon MSK 的支持
- [Metabase](/integrations/data-visualization/metabase-and-clickhouse.md): 首个稳定版本 1.0.0
  - 使连接器可用于 [Metabase Cloud](https://www.metabase.com/start/)
  - 添加了探索所有可用数据库的功能
  - 修复了与 AggregationFunction 类型的数据库同步问题
- [DBT-clickhouse](/integrations/data-ingestion/etl-tools/dbt/index.md): 添加对最新 DBT 版本 v1.4.1 的支持
- [Python client](/integrations/language-clients/python/index.md): 改进了代理和 ssh 隧道支持；为 Pandas DataFrames 添加了多个修复和性能优化
- [Nodejs client](/integrations/language-clients/js.md): 发布了将 `query_id` 附加到查询结果的功能，可用于从 `system.query_log` 中检索查询指标
- [Golang client](/integrations/language-clients/go/index.md): 优化了与 ClickHouse Cloud 的网络连接

### 控制台更改 {#console-changes-24}
- 向活动日志添加高级缩放和空闲设置调整
- 向重置密码电子邮件添加用户代理和 IP 信息
- 改进 Google OAuth 的注册流程机制

### 可靠性和性能 {#reliability-and-performance-1}
- 加快大型服务的从空闲状态恢复的时间
- 改进处理具有大量表格和分区的服务的读取延迟

### 错误修复 {#bug-fixes-3}
- 修复重置服务密码时未遵循密码策略的行为
- 使组织邀请电子邮件验证不区分大小写

## 2023年2月2日 {#february-2-2023}

此版本带来了官方支持的 Metabase 集成、主要的 Java 客户端 / JDBC 驱动程序版本发布，以及 SQL 控制台中对视图和物化视图的支持。

### 集成更改 {#integrations-changes-24}
- [Metabase](/integrations/data-visualization/metabase-and-clickhouse.md) 插件：成为 ClickHouse 维护的官方解决方案
- [dbt](/integrations/data-ingestion/etl-tools/dbt/index.md) 插件：添加对 [多线程](https://github.com/ClickHouse/dbt-clickhouse/blob/main/CHANGELOG.md) 的支持
- [Grafana](/integrations/data-visualization/grafana/index.md) 插件：更好地处理连接错误
- [Python](/integrations/language-clients/python/index.md) 客户端：对插入操作的 [流支持](/integrations/language-clients/python/index.md#streaming-queries)
- [Go](/integrations/language-clients/go/index.md) 客户端：[错误修复](https://github.com/ClickHouse/clickhouse-go/blob/main/CHANGELOG.md)：关闭取消的连接，更好地处理连接错误
- [JS](/integrations/language-clients/js.md) 客户端：[exec/insert 的重大更改](https://github.com/ClickHouse/clickhouse-js/releases/tag/0.0.12)；在返回类型中公开了 query_id
- [Java](https://github.com/ClickHouse/clickhouse-java#readme) 客户端 / JDBC 驱动程序重大版本发布
  - [重大更改](https://github.com/ClickHouse/clickhouse-java/releases)：已删除不推荐使用的方法、类和包
  - 添加 R2DBC 驱动程序和文件插入支持

### 控制台更改 {#console-changes-25}
- SQL 控制台中添加对视图和物化视图的支持

### 性能和可靠性 {#performance-and-reliability-4}
- 停止/空闲实例的更快密码重置
- 改进通过更准确的活动跟踪进行缩减的行为
- 修复了 SQL 控制台 CSV 导出被截断的错误
- 修复了导致间歇性示例数据上传失败的错误

## 2023年1月12日 {#january-12-2023}

此版本将 ClickHouse 版本更新为 22.12，启用多个新源的字典，并改善查询性能。

### 一般更改 {#general-changes-3}
- 为附加源启用字典，包括外部 ClickHouse、Cassandra、MongoDB、MySQL、PostgreSQL 和 Redis

### ClickHouse 22.12 版本升级 {#clickhouse-2212-version-upgrade}
- 扩展 JOIN 支持以包括 Grace Hash Join
- 添加对读取文件的二进制 JSON (BSON) 支持
- 添加对 GROUP BY ALL 标准 SQL 语法的支持
- 新的数学函数用于具有固定精度的十进制操作
- 请参阅 [22.12 版本博客](https://clickhouse.com/blog/clickhouse-release-22-12) 和 [详细的 22.12 更新日志](/whats-new/cloud#clickhouse-2212-version-upgrade) 获取完整更改列表

### 控制台更改 {#console-changes-26}
- 改进 SQL 控制台的自动完成功能
- 默认区域现在考虑到大陆本地性
- 改进账单使用页面以显示账单和网站单位

### 集成更改 {#integrations-changes-25}
- DBT 发布 [v1.3.2](https://github.com/ClickHouse/dbt-clickhouse/blob/main/CHANGELOG.md#release-132-2022-12-23)
  - 添加对 delete+insert 增量策略的实验性支持
  - 新的 s3source 宏
- Python 客户端 [v0.4.8](https://github.com/ClickHouse/clickhouse-connect/blob/main/CHANGELOG.md#048-2023-01-02)
  - 文件插入支持
  - 服务器端查询 [参数绑定](/interfaces/cli.md/#cli-queries-with-parameters)
- Go 客户端 [v2.5.0](https://github.com/ClickHouse/clickhouse-go/releases/tag/v2.5.0)
  - 减少压缩的内存使用
  - 服务器端查询 [参数绑定](/interfaces/cli.md/#cli-queries-with-parameters)

### 可靠性和性能 {#reliability-and-performance-2}
- 改进提取大量小文件时查询的读取性能
- 为新启动的服务将 [compatibility](/operations/settings/settings#compatibility) 设置为服务最初启动时的版本

### 错误修复 {#bug-fixes-4}
使用高级缩放滑块保留资源现在会立刻生效。

## 2022年12月20日 {#december-20-2022}

此版本引入了管理员无缝登录 SQL 控制台、针对冷读取改进的读取性能，以及适用于 ClickHouse Cloud 的改进 Metabase 连接器。

### 控制台更改 {#console-changes-27}
- 启用管理员用户无缝访问 SQL 控制台
- 为新邀请者更改默认角色为“管理员”
- 添加入职调查

### 可靠性和性能 {#reliability-and-performance-3}
- 为长时间运行的插入查询添加重试逻辑，以便在网络故障的情况下恢复
- 改进冷读取的读取性能

### 集成更改 {#integrations-changes-26}
- [Metabase 插件](/integrations/data-visualization/metabase-and-clickhouse.md) 进行了期待已久的 v0.9.1 重大更新。现在它与最新的 Metabase 版本兼容，并经过了 ClickHouse Cloud 的全面测试。

## 2022年12月6日 - 一般可用性 {#december-6-2022---general-availability}

ClickHouse Cloud 现已准备好用于生产，符合 SOC2 Type II 认证，为生产工作负载提供正常运行时间 SLA，并提供公共状态页面。此版本包括 AWS Marketplace 集成、SQL 控制台 - ClickHouse 用户的数据探索工作台，以及 ClickHouse Academy - 在 ClickHouse Cloud 中自学。了解更多信息，请参阅此 [博客](https://clickhouse.com/blog/clickhouse-cloud-generally-available)。

### 生产就绪 {#production-ready}
- 符合 SOC2 Type II 标准（详细信息见 [博客](https://clickhouse.com/blog/clickhouse-cloud-is-now-soc-2-type-ii-compliant) 和 [信任中心](https://trust.clickhouse.com/)）
- ClickHouse Cloud 的公共 [状态页面](https://status.clickhouse.com/)
- 为生产用例提供正常运行时间 SLA
- 在 [AWS Marketplace](https://aws.amazon.com/marketplace/pp/prodview-jettukeanwrfc) 上提供

### 主要新功能 {#major-new-capabilities}
- 引入 SQL 控制台，作为 ClickHouse 用户的数据探索工作台
- 推出 [ClickHouse Academy](https://learn.clickhouse.com/visitor_class_catalog)，在 ClickHouse Cloud 中自学

### 定价和计量更改 {#pricing-and-metering-changes}
- 将试用期延长至 30 天
- 引入固定容量、低月支出的开发服务，非常适合启动项目和开发/测试环境
- 对生产服务引入新降低的定价，因为我们持续改进 ClickHouse Cloud 的操作和扩展
- 改进计算计量时的粒度和保真度

### 集成更改 {#integrations-changes-27}
- 启用对 ClickHouse Postgres / MySQL 集成引擎的支持
- 添加对 SQL 用户定义函数 (UDFs) 的支持
- 高级 Kafka Connect sink 升级为 Beta 状态
- 通过引入版本、更新状态等丰富的元数据改善集成 UI

### 控制台更改 {#console-changes-28}
- 在云控制台中支持多因素身份验证
- 改进移动设备的云控制台导航

### 文档更改 {#documentation-changes}
- 为 ClickHouse Cloud 引入专门的 [文档](/cloud/overview) 部分

### 错误修复 {#bug-fixes-5}
- 解决了已知问题，即在依赖关系解析期间，从备份恢复并不总是有效

## 2022年11月29日 {#november-29-2022}

此版本带来了 SOC2 Type II 认证，将 ClickHouse 版本更新为 22.11，并改善了许多 ClickHouse 客户端和集成。

### 一般更改 {#general-changes-4}
- 达到 SOC2 Type II 合规（详细信息见 [博客](https://clickhouse.com/blog/clickhouse-cloud-is-now-soc-2-type-ii-compliant) 和 [信任中心](https://trust.clickhouse.com)）

### 控制台更改 {#console-changes-29}
- 添加“空闲”状态指示器，以显示服务已自动暂停

### ClickHouse 22.11 版本升级 {#clickhouse-2211-version-upgrade}
- 添加对 Hudi 和 DeltaLake 表引擎和表函数的支持
- 改进对 S3 的递归目录遍历
- 添加对复合时间间隔语法的支持
- 通过重试插入来提高插入的可靠性
- 请参阅 [详细的 22.11 更新日志](/whats-new/cloud#clickhouse-2211-version-upgrade) 获取完整更改列表

### 集成 {#integrations-1}
- Python 客户端：v3.11 支持，改进插入性能
- Go 客户端：修复 DateTime 和 Int64 支持
- JS 客户端：支持双向 SSL 身份验证
- dbt-clickhouse：支持 DBT v1.3

### 错误修复 {#bug-fixes-6}
- 修复升级后显示过时的 ClickHouse 版本的错误
- 为“默认”帐户更改权限不再中断会话
- 新创建的非管理员帐户默认不再访问系统表

### 本次发布中的已知问题 {#known-issues-in-this-release}
- 备份恢复可能由于依赖关系解析而无法工作

## 2022年11月17日 {#november-17-2022}

此版本启用了来自本地 ClickHouse 表和 HTTP 源的字典，支持孟买地区，并改善了云控制台用户体验。

### 一般更改 {#general-changes-5}
- 添加对来自本地 ClickHouse 表和 HTTP 源的 [字典](/sql-reference/dictionaries/index.md) 的支持
- 引入对孟买 [地区](/cloud/reference/supported-regions.md) 的支持

### 控制台更改 {#console-changes-30}
- 改进账单发票格式
- 精简支付方式捕获的用户界面
- 为备份添加更细粒度的活动日志记录
- 在文件上传过程中改善错误处理

### 错误修复 {#bug-fixes-7}
- 修复了一个可能导致备份失败的错误，如果某些部分中有单个大文件
- 修复了一个错误，如果同时应用访问列表更改，则恢复备份未成功

### 已知问题 {#known-issues}
- 备份恢复可能由于依赖关系解析而无法工作

## 2022年11月3日 {#november-3-2022}

此版本从定价中移除了读取和写入单位（详细信息见 [定价页面](https://clickhouse.com/pricing)），将 ClickHouse 版本更新为 22.10，为自服务客户提供更高的垂直扩展支持，并通过更好的默认设置提高可靠性。

### 一般更改 {#general-changes-6}
- 从定价模型中移除了读取/写入单位

### 配置更改 {#configuration-changes-2}
- 出于稳定原因，设置 `allow_suspicious_low_cardinality_types`、`allow_suspicious_fixed_string_types` 和 `allow_suspicious_codecs`（默认值为 false）不再允许用户更改。

### 控制台更改 {#console-changes-31}
- 将自服务最大垂直扩展提高到 720GB 内存，适用于付费客户
- 改进备份恢复工作流程，以设置 IP 访问列表规则和密码
- 在服务创建对话框中引入 GCP 和 Azure 的等待列表
- 改善文件上传过程中的错误处理
- 改进账单管理的工作流程

### ClickHouse 22.10 版本升级 {#clickhouse-2210-version-upgrade}
- 通过放宽存在大量大部分（至少 10 GiB）时的“部分过多”阈值，改善对对象存储上合并的控制。这允许在单个表的单个分区中处理高达 PB 的数据。
- 通过 `min_age_to_force_merge_seconds` 设置，提高对合并的控制，以在达到某个时间阈值后合并。
- 添加 MySQL 兼容语法以重置设置 `SET setting_name = DEFAULT`。
- 添加用于 Morton 曲线编码、Java 整数哈希和随机数生成的函数。
- 请参阅 [详细的 22.10 更新日志](/whats-new/cloud#clickhouse-2210-version-upgrade) 获取完整更改列表。

## 2022年10月25日 {#october-25-2022}

此版本显著降低了小工作负载的计算消耗，降低了计算定价（详细信息见 [定价](https://clickhouse.com/pricing) 页面），通过更好的默认设置提高了稳定性，并增强了 ClickHouse Cloud 控制台中的账单和使用视图。

### 一般更改 {#general-changes-7}
- 将最低服务内存分配减少至 24G
- 将服务空闲超时时间从 30 分钟减少到 5 分钟

### 配置更改 {#configuration-changes-3}
- 将 max_parts_in_total 从 100,000 降低到 10,000。MergeTree 表的 `max_parts_in_total` 设置的默认值已从 100,000 降低到 10,000。此更改的原因是我们观察到大量数据部分可能会导致云中服务的启动时间较慢。大量部分通常表示选择了过于细粒度的分区键，这通常是意外完成的，应避免。默认值的更改将允许更早发现这些情况。

### 控制台更改 {#console-changes-32}
- 改进试用用户账单视图中的信用使用详情
- 改进工具提示和帮助文本，并在使用视图中添加指向定价页面的链接
- 改进选择 IP 过滤选项时的工作流程
- 向云控制台添加重新发送电子邮件确认按钮

## 2022年10月4日 - 测试版 {#october-4-2022---beta}

ClickHouse Cloud 于 2022 年 10 月 4 日开始公测。了解更多信息，请参阅此 [博客](https://clickhouse.com/blog/clickhouse-cloud-public-beta)。

ClickHouse Cloud 版本基于 ClickHouse 核心 v22.10。有关兼容功能的列表，请参考 [Cloud Compatibility](/cloud/reference/cloud-compatibility.md) 指南。
