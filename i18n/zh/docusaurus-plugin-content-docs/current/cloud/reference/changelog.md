---
slug: /whats-new/cloud
sidebar_label: 云更新日志
title: 云更新日志
---

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
import prometheous from '@site/static/images/cloud/reference/june-28-prometheus.png';
import kafka_config from '@site/static/images/cloud/reference/june-13-kafka-config.png';
import fast_releases from '@site/static/images/cloud/reference/june-13-fast-releases.png';
import share_queries from '@site/static/images/cloud/reference/may-30-share-queries.png';
import query_endpoints from '@site/static/images/cloud/reference/may-17-query-endpoints.png';


除了此 ClickHouse 云更新日志外，请参阅[云兼容性](/cloud/reference/cloud-compatibility.md)页面。
## 2025年3月7日 {#march-7-2025}

- 新的 `UsageCost` API 端点：API 规范现在支持新的端点以检索使用信息。此端点适用于组织，并且可以查询最多31天的使用成本。可以检索的指标包括存储、计算、数据传输和 ClickPipes。有关详细信息，请参阅[文档](https://clickhouse.com/docs/cloud/manage/api/usageCost-api-reference)。

- Terraform 提供者 [v2.1.0](https://registry.terraform.io/providers/ClickHouse/clickhouse/2.1.0/docs/resources/service#nestedatt--endpoints_configuration) 版本支持启用 MySQL 端点。
## 2025年2月21日 {#february-21-2025}
### ClickHouse 自带云（BYOC）在 AWS 上现已全面上线！ {#clickhouse-byoc-for-aws-ga}

在此部署模型中，数据平面组件（计算、存储、备份、日志、指标）
运行在客户 VPC 中，而控制平面（网络访问、API 和计费）
则仍存于 ClickHouse VPC 中。这种设置非常适合需要遵守严格数据驻留要求的大型工作负载，确保所有数据保持在安全的客户环境内。

- 有关更多详细信息，请参考 BYOC 的[文档](/cloud/reference/byoc)
  或阅读我们的[公告博客文章](https://clickhouse.com/blog/announcing-general-availability-of-clickhouse-bring-your-own-cloud-on-aws)。
- [联系我们](https://clickhouse.com/cloud/bring-your-own-cloud)以请求访问。
### Postgres CDC 连接器用于 ClickPipes {#postgres-cdc-connector-for-clickpipes}

Postgres CDC 连接器用于 ClickPipes 现在处于公开测试阶段。此功能允许用户无缝地将其 Postgres 数据库复制到 ClickHouse 云。

- 要开始，请参考 ClickPipes Postgres CDC 连接器的[文档](https://clickhouse.com/docs/integrations/clickpipes/postgres)。
- 有关客户使用案例和功能的更多信息，请参阅[着陆页](https://clickhouse.com/cloud/clickpipes/postgres-cdc-connector)和[发布博客](https://clickhouse.com/blog/postgres-cdc-connector-clickpipes-public-beta)。
### AWS 上的 ClickHouse Cloud PCI 合规性 {#pci-compliance-for-clickhouse-cloud-on-aws}

ClickHouse Cloud 现在支持**PCI 合规服务**，适用于**企业级**客户在**us-east-1**和**us-west-2**区域。希望在 PCI 合规环境中启动服务的用户可以联系[support](https://clickhouse.com/support/program)以获取帮助。
### Google Cloud Platform 上的透明数据加密和客户管理的加密密钥 {#tde-and-cmek-on-gcp}

对 ClickHouse Cloud 在**Google Cloud Platform (GCP)**上的**透明数据加密 (TDE)**和**客户管理的加密密钥 (CMEK)**的支持现已可用。

- 有关更多信息，请参阅这些功能的[文档](https://clickhouse.com/docs/cloud/security/cmek#transparent-data-encryption-tde)。
### AWS 中东（阿联酋）可用性 {#aws-middle-east-uae-availability}

ClickHouse Cloud 现在在**AWS 中东（阿联酋）me-central-1**区域新增区域支持。
### ClickHouse Cloud 保护措施 {#clickhouse-cloud-guardrails}

为了促进最佳实践并确保 ClickHouse Cloud 的稳定使用，我们引入了用于表、数据库、分区和分片数量的保护措施。

- 有关详细信息，请参阅文档的[使用限制](https://clickhouse.com/docs/cloud/bestpractices/usage-limits)部分。
- 如果您的服务已经超过这些限制，我们将允许提高10%。如有任何疑问，请联系[support](https://clickhouse.com/support/program)。
## 2025年1月27日 {#january-27-2025}
### ClickHouse Cloud 级别的变更 {#changes-to-clickhouse-cloud-tiers}

我们致力于调整我们的产品，以满足客户日益变化的需求。自 GA 登场两年以来，ClickHouse Cloud 已大幅演变，我们获得了对客户如何利用我们的云产品的宝贵洞察。

我们引入新功能以优化 ClickHouse Cloud 服务的大小和成本效益。这些功能包括**计算-计算分离**、高性能机器类型和**单副本服务**。我们还在自动扩展和管理升级方面进行了变革，以更无缝和更具反应能力的方式进行执行。

我们增加了**新的企业级**以满足最苛刻的客户和工作负载的需求，专注于行业特定的安全和合规特性，更加控制底层硬件和升级，以及高级灾难恢复功能。

为了支持这些变化，我们正在重组我们当前的**开发**和**生产**层，以更好地匹配我们不断发展的客户基础使用我们的产品的方式。我们正在引入**基础**层，面向那些测试新想法和项目的用户，以及**规模**层，面向处理生产工作负载和大规模数据的用户。

您可以在[博客](https://clickhouse.com/blog/evolution-of-clickhouse-cloud-new-features-superior-performance-tailored-offerings)中阅读有关这些及其他功能变化的信息。现有客户需要采取行动以选择[新计划](https://clickhouse.com/pricing)。面向客户的沟通已通过电子邮件发送给组织管理员，以下[常见问题解答](/cloud/manage/jan-2025-faq/summary)涵盖了关键变更和时间表。
### 仓库：计算-计算分离 (GA) {#warehouses-compute-compute-separation-ga}

计算-计算分离（也称为“仓库”）现已全面上线；有关更多详细信息，请参考[博客](https://clickhouse.com/blog/introducing-warehouses-compute-compute-separation-in-clickhouse-cloud)和[文档](/cloud/reference/warehouses)。
### 单副本服务 {#single-replica-services}

我们引入了“单副本服务”的概念，既作为独立产品，也作为仓库中的一部分。作为独立产品，单副本服务有大小限制，适用于小型测试工作负载。在仓库中，单副本服务可以以更大的规模部署，适用于不需要高可用性的大规模工作负载，例如可重启的 ETL 作业。
### 垂直自动扩展改进 {#vertical-auto-scaling-improvements}

我们引入了一种新的垂直扩展机制，用于计算副本，我们称之为“Make Before Break”（MBB）。这一方法在移除旧副本之前添加一个或多个新大小的副本，防止在扩展操作中丢失任何容量。通过消除移除现有副本和添加新副本之间的间隙，MBB 创建了一个更加无缝和不干扰的扩展过程。这在规模扩展场景中特别有利，因为高资源利用率触发了对额外容量的需求，而提前移除副本只会加剧资源限制。
### 水平扩展 (GA) {#horizontal-scaling-ga}

水平扩展现已全面上线。用户可以通过 API 和云控制台添加额外的副本以扩展其服务。有关信息，请参阅[文档](/manage/scaling#manual-horizontal-scaling)。
### 可配置备份 {#configurable-backups}

我们现在支持客户将备份导出到他们自己的云帐户；有关更多信息，请参阅[文档](/cloud/manage/backups/configurable-backups)。
### 管理升级改进 {#managed-upgrade-improvements}

安全的管理升级通过允许用户与数据库保持最新状态，给我们用户带来了显著价值，使他们在新增功能时及时跟进。通过这一推出，我们将“在破坏之前做好准备”（或 MBB）的方法应用于升级，进一步减少对运行工作负载的影响。
### HIPAA 支持 {#hipaa-support}

我们现在在合规地区支持 HIPAA，包括 AWS `us-east-1`、`us-west-2` 和 GCP `us-central1`、`us-east1`。希望加入的客户必须签署商业合作协议 (BAA) 并部署至合规版本的区域。有关 HIPAA 的更多信息，请参阅[文档](/cloud/security/security-and-compliance)。
### 定时升级 {#scheduled-upgrades}

用户可以为其服务安排升级。此功能仅支持企业级服务。有关定时升级的更多信息，请参阅[文档](/manage/updates)。
### 对复杂类型的语言客户端支持 {#language-client-support-for-complex-types}

[Golang](https://github.com/ClickHouse/clickhouse-go/releases/tag/v2.30.1)、[Python](https://github.com/ClickHouse/clickhouse-connect/releases/tag/v0.8.11)和[NodeJS](https://github.com/ClickHouse/clickhouse-js/releases/tag/1.10.1)客户端已添加对动态、变体和 JSON 类型的支持。
### DBT 支持可刷新的物化视图 {#dbt-support-for-refreshable-materialized-views}

DBT 现在在 `1.8.7` 发布中[支持可刷新的物化视图](https://github.com/ClickHouse/dbt-clickhouse/releases/tag/v1.8.7)。
### JWT 令牌支持 {#jwt-token-support}

在 JDBC 驱动程序 v2、clickhouse-java、[Python](https://github.com/ClickHouse/clickhouse-connect/releases/tag/v0.8.12) 和 [NodeJS](https://github.com/ClickHouse/clickhouse-js/releases/tag/1.10.0) 客户端中增加了对基于 JWT 的身份验证的支持。

JDBC / Java 将在[0.8.0](https://github.com/ClickHouse/clickhouse-java/releases/tag/v0.8.0) 中发布 - 预计发布日期待定。
### Prometheus 集成改进 {#prometheus-integration-improvements}

我们为 Prometheus 集成增加了多个增强功能：

- **组织级端点**。我们对 ClickHouse Cloud 的 Prometheus 集成进行了增强。除了服务级指标外，API 现在还包括用于**组织级指标**的端点。此新端点自动收集您组织中所有服务的指标，简化将指标导出到您的 Prometheus 收集器的过程。这些指标可以与 Grafana 和 Datadog 等可视化工具集成，以更全面地了解您组织的绩效。

  此功能现在对所有用户可用。您可以在[这里](/integrations/prometheus)找到更多详细信息。

- **过滤指标**。我们在 ClickHouse Cloud 的 Prometheus 集成中增加了支持返回过滤指标列表的功能。此功能通过使您可以集中于监控服务健康至关重要的指标来帮助减少响应有效载荷的大小。

  此功能通过 API 中的可选查询参数提供，使您更容易优化数据收集并简化与 Grafana 和 Datadog 等工具的集成。

  过滤指标功能现在对所有用户可用。您可以在[这里](/integrations/prometheus)找到更多详细信息。
## 2024年12月20日 {#december-20-2024}
### 市场订阅组织关联 {#marketplace-subscription-organization-attachment}

您现在可以将新的市场订阅附加到现有的 ClickHouse Cloud 组织。一旦您完成订阅市场并重定向到 ClickHouse Cloud，您可以将过去创建的现有组织连接到新的市场订阅。从这一点起，您在组织中的资源将通过市场进行计费。

<img alt="添加市场订阅"
  style={{width: '600px'}}
  src={add_marketplace} />
### 强制 OpenAPI 密钥过期 {#force-openapi-key-expiration}

现在可以限制 API 密钥的过期选项，因此您不会生成未过期的 OpenAPI 密钥。请联系 ClickHouse Cloud 支持团队以为您的组织启用这些限制。
### 自定义电子邮件通知 {#custom-emails-for-notifications}

组织管理员现在可以向特定通知添加更多电子邮件地址作为附加收件人。如果您希望向别名或您组织内可能不是 ClickHouse Cloud 用户的其他用户发送通知，这非常有用。要进行配置，请从云控制台转到通知设置并编辑要接收电子邮件通知的电子邮件地址。
## 2024年12月6日 {#december-6-2024}
### BYOC（测试版） {#byoc-beta}

AWS 的自带云现已以 Beta 形式提供。此部署模型允许您在自己的 AWS 账户中部署和运行 ClickHouse Cloud。我们支持在 11 个以上的 AWS 区域进行部署，并且还会增加更多区域。请[联系我们](https://clickhouse.com/support/program)以获取访问权限。请注意，此部署仅保留给大规模部署。
### Postgres 变更数据捕获（CDC）连接器在 ClickPipes 中（公开测试版） {#postgres-change-data-capture-cdc-connector-in-clickpipes-public-beta}

此即插即用集成使客户能够到几次点击将其 Postgres 数据库复制到 ClickHouse Cloud，并利用 ClickHouse 实现快速分析。您可以使用此连接器进行持续复制和从 Postgres 的一次性迁移。
### 仪表盘（测试版） {#dashboards-beta}

本周，我们很高兴地宣布 ClickHouse Cloud 中的仪表盘 Beta 发布。通过仪表盘，用户可以将保存的查询转换为可视化，组织可视化到仪表盘，并使用查询参数与仪表盘进行交互。要开始使用，请按照[仪表盘文档](/cloud/manage/dashboards)。

<img alt="仪表盘 Beta"
  style={{width: '600px'}}
  src={beta_dashboards} />
### 查询 API 端点（GA） {#query-api-endpoints-ga}

我们兴奋地宣布 ClickHouse Cloud 中查询 API 端点的 GA 发布。查询 API 端点允许您仅需几次点击即可为保存的查询生成 RESTful API 端点，并开始在应用程序中消费数据，而无需处理语言客户端或身份验证复杂性。自初始发布以来，我们已推出了一系列改进，包括：

* 减少端点延迟，尤其是对于冷启动
* 增加端点 RBAC 控制
* 可配置的 CORS 允许域
* 结果流式处理
* 支持所有 ClickHouse 兼容的输出格式

除了这些改进外，我们还很高兴地宣布通用查询 API 端点，利用我们现有的框架，允许您对 ClickHouse Cloud 服务执行任意 SQL 查询。可以通过服务设置页面启用和配置通用端点。

要开始使用，请访问[查询 API 端点文档](/cloud/get-started/query-endpoints)。

<img alt="API 端点"
  style={{width: '600px'}}
  src={api_endpoints} />
### 原生 JSON 支持（测试版） {#native-json-support-beta}

我们正在 ClickHouse Cloud 中推出原生 JSON 支持的测试版。要开始使用，请联系支持[以启用您的云服务](/cloud/support)。
### 使用向量相似性索引的向量搜索（提前访问） {#vector-search-using-vector-similarity-indexes-early-access}

我们宣布向量相似性索引用于近似向量搜索的提前访问！

ClickHouse 已经为基于向量的用例提供了强大的支持，具有广泛的[距离函数](https://clickhouse.com/blog/reinvent-2024-product-announcements#vector-search-using-vector-similarity-indexes-early-access)和执行线性扫描的能力。此外，最近我们增加了一种实验性的[近似向量搜索](/engines/table-engines/mergetree-family/annindexes)方法，该方法由 [usearch](https://github.com/unum-cloud/usearch)库和层次可导航小世界（HNSW）近似最近邻搜索算法提供。

要开始使用，请[注册提前访问候补名单](https://clickhouse.com/cloud/vector-search-index-waitlist)。
### ClickHouse-Connect（Python）和 ClickHouse-Kafka-Connect 用户 {#clickhouse-connect-python-and-clickhouse-kafka-connect-users}

关于客户遇到`MEMORY_LIMIT_EXCEEDED`异常的通知电子邮件已发送给客户。

请升级到：
- Kafka-Connect: > 1.2.5
- ClickHouse-Connect（Java）：> 0.8.6
### ClickPipes 现在支持 AWS 上的跨 VPC 资源访问 {#clickpipes-now-supports-cross-vpc-resource-access-on-aws}

您现在可以授予对特定数据源（如 AWS MSK）的单向访问。通过 AWS PrivateLink 和 VPC Lattice 进行的跨 VPC 资源访问，您可以在 VPC 和帐户边界之间，甚至从本地网络共享单个资源，而无需在公共网络上妥协隐私和安全。要开始并设置资源共享，请阅读[公告文章](https://clickhouse.com/blog/clickpipes-crossvpc-resource-endpoints?utm_medium=web&utm_source=changelog)。

<img alt="VPC ClickPipes"
  style={{width: '600px'}}
  src={cross_vpc} />
### ClickPipes 现在支持 AWS MSK 的 IAM {#clickpipes-now-supports-iam-for-aws-msk}

您现在可以使用 IAM 身份验证连接到具有 AWS MSK ClickPipes 的 MSK broker。要开始，请查看我们的[文档](/integrations/clickpipes/kafka#iam)。
### 新服务在 AWS 上的最大副本大小 {#maximum-replica-size-for-new-services-on-aws}

从现在开始，任何在 AWS 上创建的新服务将允许最大可用副本大小为 236 GiB。
## 2024年11月22日 {#november-22-2024}
### ClickHouse Cloud 内置的高级可观察性仪表板 {#built-in-advanced-observability-dashboard-for-clickhouse-cloud}

以前，允许您监控 ClickHouse 服务器指标和硬件资源利用率的高级可观察性仪表板仅在开源 ClickHouse 中可用。我们很高兴地宣布此功能现在已在 ClickHouse Cloud 控制台中可用！

该仪表板允许您基于[system.dashboards](/operations/system-tables/dashboards)表查看查询，在一个综合的用户界面中。访问 **监控 > 服务健康** 页面，立即开始使用高级可观察性仪表板。

<img alt="高级可观察性仪表板"
  style={{width: '600px'}}
  src={nov_22} />
### AI 驱动的 SQL 自动完成功能 {#ai-powered-sql-autocomplete}

我们显著改善了自动完成功能，允许您在编写查询时使用新的 AI Copilot 进行在线 SQL 完成！ 通过切换任何 ClickHouse Cloud 服务的**“启用行内代码补全”**设置，即可启用此功能。

<img alt="AI Copilot SQL 自动完成"
  style={{width: '600px'}}
  src={copilot} />
### 新的“计费”角色 {#new-billing-role}

您现在可以将组织中的用户分配给新的**计费**角色，使他们可以查看和管理计费信息，而无需赋予他们配置或管理服务的能力。只需邀请新用户或编辑现有用户的角色以分配**计费**角色。
## 2024年11月8日 {#november-8-2024}
### ClickHouse Cloud 中的客户通知 {#customer-notifications-in-clickhouse-cloud}

ClickHouse Cloud 现在提供针对多个计费和扩展事件的控制台内和电子邮件通知。客户可以通过云控制台通知中心配置这些通知，以仅在 UI 上显示、接收电子邮件或两者兼而有之。您可以在服务级别配置您收到的通知的类别和严重性。

未来，我们将增加其他事件的通知，以及接收通知的其他方式。

请查看[ClickHouse 文档](/cloud/notifications)，了解有关如何为您的服务启用通知的更多信息。

<img alt="客户通知 UI"
  style={{width: '600px'}}
  src={notifications} />

<br />
## 2024年10月4日 {#october-4-2024}
### ClickHouse Cloud 现在在 GCP 中提供 HIPAA 准备服务的 Beta 版 {#clickhouse-cloud-now-offers-hipaa-ready-services-in-beta-for-gcp}

寻求提高保护健康信息（PHI）安全性的客户现在可以在[Google Cloud Platform (GCP)](https://cloud.google.com/)上加入 ClickHouse Cloud。ClickHouse 已实施 HIPAA 安全规则规定的管理、物理和技术保护措施，现在具有可配置的安全设置，以便根据您的具体用例和工作负载实施有关信息。有关可用安全设置的更多信息，请查看我们的[安全共享责任模型](/cloud/security/shared-responsibility-model)。

在 GCP `us-central-1` 中提供的服务面向具有**专用**服务类型的客户，并且需要商业合作协议 (BAA)。请联系[sales](mailto:sales@clickhouse.com)或[support](https://clickhouse.com/support/program)以请求访问此功能或加入附加 GCP、AWS 和 Azure 区域的候补名单。
### 计算-计算分离现已在 GCP 和 Azure 中处于私有预览状态 {#compute-compute-separation-is-now-in-private-preview-for-gcp-and-azure}

我们最近宣布了 AWS 上的计算-计算分离的私有预览。我们很高兴地宣布它现在在 GCP 和 Azure 中可用。

计算-计算分离允许您将特定服务指定为读写或只读服务，使您能够为应用程序设计优化的计算配置，以提高成本和性能。有关详细信息，请[阅读文档](/cloud/reference/compute-compute-separation)。
### 自助式 MFA 恢复代码 {#self-service-mfa-recovery-codes}

使用多因素身份验证的客户现在可以获取恢复代码，以防手机丢失或意外删除令牌。首次注册 MFA 的客户将在设置时提供代码。已存在的 MFA 客户可以通过移除现有 MFA 令牌并添加新的来获取恢复代码。
### ClickPipes 更新：自定义证书、延迟洞察及更多！ {#clickpipes-update-custom-certificates-latency-insights-and-more}

我们很高兴地分享 ClickPipes 的最新更新，这是将数据引入 ClickHouse 服务的最简单方式！这些新功能旨在增强您对数据摄取的控制，并提供对性能指标的更大可见性。

*用于 Kafka 的自定义身份验证证书*

ClickPipes for Kafka 现在支持使用 SASL 和公共 SSL/TLS 的 Kafka broker 的自定义身份验证证书。您可以在 ClickPipe 设置过程中轻松上传自己的证书，以确保与 Kafka 的更安全连接。

*引入 Kafka 和 Kinesis 的延迟指标*

性能可见性至关重要。ClickPipes 现在具有延迟图表，向您提供消息生产（无论来自 Kafka 主题还是 Kinesis 流）到 ClickHouse 云摄取之间的时间的洞察。通过此新指标，您可以更紧密地监视数据管道的性能并进行相应优化。

<img alt="延迟指标图表"
  style={{width: '600px'}}
  src={latency_insights} />

<br />

*Kafka 和 Kinesis 的扩展控制（私人测试版）*

高吞吐量可能需要额外资源以满足数据量和延迟需求。我们正在引入 ClickPipes 的水平扩展，可通过我们的云控制台直接使用。此功能目前处于私有测试阶段，允许您根据需求更有效地扩展资源。请联系[support](https://clickhouse.com/support/program)以加入测试。

*Kafka 和 Kinesis 的原始消息摄取*

现在可以不解析整个 Kafka 或 Kinesis 消息进行摄取。ClickPipes 现在支持`_raw_message` [虚拟列](/integrations/clickpipes/kafka#kafka-virtual-columns)，允许用户将完整消息映射到单个字符串列。这使您可以根据需要处理原始数据。
## 2024年8月29日 {#august-29-2024}
### 新的 Terraform 提供者版本 - v1.0.0 {#new-terraform-provider-version---v100}

Terraform 允许您以编程方式控制 ClickHouse Cloud 服务，然后将您的配置存储为代码。我们的 Terraform 提供者已经有近 200,000 次下载，如今正式发布 v1.0.0！这个新版本包括更好的重试逻辑和一个新的资源，以将私有端点附加到 ClickHouse Cloud 服务。您可以在[此处下载 Terraform 提供者](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest)，并在[此处查看完整更新日志](https://github.com/ClickHouse/terraform-provider-clickhouse/releases/tag/v1.0.0)。
### 2024 SOC 2 类型 II 报告和更新的 ISO 27001 证书 {#2024-soc-2-type-ii-report-and-updated-iso-27001-certificate}

我们自豪地宣布我们 2024 年 SOC 2 类型 II 报告和更新的 ISO 27001 证书均可用，这两个文件涵盖了我们新推出的 Azure 服务以及 AWS 和 GCP 服务的持续覆盖。

我们的 SOC 2 类型 II 展示了我们在实现安全性、可用性、处理完整性和客户对 ClickHouse 用户提供的服务的机密性方面的持续承诺。有关更多信息，请查看美国注册会计师协会（AICPA）发布的[SOC 2 - 服务组织的 SOC：信任服务标准](https://www.aicpa-cima.com/resources/landing/system-and-organization-controls-soc-suite-of-services)和国际标准化组织（ISO）的[ISO/IEC 27001 是什么](https://www.iso.org/standard/27001)。

请还查看我们的[信任中心](https://trust.clickhouse.com/)以获取安全和合规文档及报告。
## 2024年8月15日 {#august-15-2024}
### 计算-计算分离现已在 AWS 中处于私人预览状态 {#compute-compute-separation-is-now-in-private-preview-for-aws}

对于现有的 ClickHouse Cloud 服务，副本处理读取和写入，没有办法配置特定副本仅处理一种操作。我们即将推出的新功能称为计算-计算分离，允许您将特定服务指定为读写或只读服务，使您能够为应用程序设计优化的计算配置，以提高成本和性能。

我们的新计算-计算分离功能使您能够创建多个计算节点组，每个组具有自己的端点，使用相同的对象存储文件夹，因此具有相同的表、视图等。有关更多信息，请在此处阅读[计算-计算分离](/cloud/reference/compute-compute-separation)。如果您希望在私人预览中访问此功能，请[联系我们](https://clickhouse.com/support/program)。

<img alt="计算-计算分离的示例架构"
  style={{width: '600px'}}
  src={cloud_console_2} />
### ClickPipes 用于 S3 和 GCS 现已 GA，支持连续模式 {#clickpipes-for-s3-and-gcs-now-in-ga-continuous-mode-support}

ClickPipes 是将数据引入 ClickHouse Cloud 的最简单方式。我们高兴地宣布[ClickPipes](https://clickhouse.com/cloud/clickpipes)用于 S3 和 GCS 现已**全面可用**。ClickPipes 支持一次性批量摄取和“连续模式”。一个摄取任务将从特定远程存储桶加载匹配模式的所有文件到 ClickHouse 目标表。在“连续模式”下，ClickPipes 作业将不断运行，将新添加到远程对象存储桶的匹配文件摄取。这样，用户可以将任何对象存储存储桶转变为一个完全成熟的临时区域，以便将数据引入 ClickHouse Cloud。有关 ClickPipes 的更多信息，请查看[我们的文档](/integrations/clickpipes)。
## 2024年7月18日 {#july-18-2024}
```yaml
title: 'Prometheus Endpoint for Metrics is now Generally Available'
sidebar_label: 'Prometheus Endpoint'
keywords: ['Prometheus', 'ClickHouse', 'metrics', 'Grafana', 'Datadog']
description: 'ClickHouse announces the general availability of the Prometheus endpoint for metrics export.'
```

### Prometheus Endpoint for Metrics is now Generally Available {#prometheus-endpoint-for-metrics-is-now-generally-available}

在我们上一个云更改日志中，我们宣布了从 ClickHouse Cloud 导出 [Prometheus](https://prometheus.io/) 指标的私有预览。此功能允许您使用 [ClickHouse Cloud API](/cloud/manage/api/api-overview) 将您的指标导入到 [Grafana](https://grafana.com/) 和 [Datadog](https://www.datadoghq.com/) 等工具中进行可视化。我们很高兴地宣布，此功能现已 **正式上线**。请查看 [我们的文档](/integrations/prometheus) 以了解有关此功能的更多信息。

### Table Inspector in Cloud Console {#table-inspector-in-cloud-console}

ClickHouse 提供了类似 [`DESCRIBE`](/sql-reference/statements/describe-table) 的命令，允许您检查您的表以审查架构。这些命令输出到控制台，但通常不方便使用，因为您需要组合多个查询才能检索有关您的表和列的所有相关数据。

我们最近在云控制台中推出了 **Table Inspector**，允许您在用户界面中检索重要的表和列信息，而无需编写 SQL。您可以通过查看云控制台来尝试您服务的表检测器。它提供关于您的架构、存储、压缩等的信息，并在一个统一界面中展示。

<img alt="Table Inspector UI"
  style={{width: '800px', marginLeft: 0}}
  src={compute_compute} />

### New Java Client API {#new-java-client-api}

我们的 [Java Client](https://github.com/ClickHouse/clickhouse-java) 是用户连接 ClickHouse 的最受欢迎的客户端之一。我们希望使其更加简单和直观，包括重新设计的 API 和各种性能优化。这些更改将使您更容易从 Java 应用程序连接到 ClickHouse。您可以在这篇 [博客文章](https://clickhouse.com/blog/java-client-sequel) 中阅读有关如何使用更新后的 Java Client 的更多信息。

### New Analyzer is enabled by default {#new-analyzer-is-enabled-by-default}

在过去的两年里，我们一直在努力开发一个新的查询分析和优化分析器。此分析器改善了查询性能，并将允许我们进行进一步的优化，包括更快和更高效的 `JOIN`。以前，新用户需要使用设置 `allow_experimental_analyzer` 启用此功能。此改进分析器现在在新的 ClickHouse Cloud 服务中默认可用。

敬请期待我们将对分析器进行更多改进，因为我们还有许多优化计划！

## June 28, 2024 {#june-28-2024}

### ClickHouse Cloud for Microsoft Azure is now Generally Available! {#clickhouse-cloud-for-microsoft-azure-is-now-generally-available}

我们首次在 [今年五月](https://clickhouse.com/blog/clickhouse-cloud-is-now-on-azure-in-public-beta) 宣布了对 Microsoft Azure 的支持。本次云发布中，我们很高兴地宣布，我们的 Azure 支持已从 Beta 过渡到正式发布。ClickHouse Cloud 现在可在所有三大主要云平台上使用：AWS、Google Cloud Platform 和现在的 Microsoft Azure。

本次发布还包括通过 [Microsoft Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps/clickhouse.clickhouse_cloud) 进行订阅的支持。该服务最初将在以下区域提供支持：
- 美国：西部美国 3（亚利桑那州）
- 美国：东部美国 2（弗吉尼亚州）
- 欧洲：德国西南部（法兰克福）

如果您希望支持任何特定区域，请 [与我们联系](https://clickhouse.com/support/program)。

### Query Log Insights {#query-log-insights}

我们在云控制台中推出的新查询洞察用户界面使 ClickHouse 的内置查询日志更容易使用。ClickHouse 的 `system.query_log` 表是查询优化、调试和监控整体集群健康和性能的重要信息来源。唯一的注意事项是：由于有 70 多个字段，每个查询都有多个记录，理解查询日志代表了陡峭的学习曲线。查询洞察的初始版本为未来简化查询调试和优化模式提供了蓝图。我们非常希望听到您的反馈，因为我们将继续对该功能进行迭代，因此请与我们联系——您的意见将受到极大重视！

<img alt="Query Insights UI"
  style={{width: '600px', marginLeft: 0}}
  src={query_insights} />

### Prometheus Endpoint for Metrics (Private Preview) {#prometheus-endpoint-for-metrics-private-preview}

或许是我们最受欢迎的请求之一：您现在可以从 ClickHouse Cloud 导出 [Prometheus](https://prometheus.io/) 指标到 [Grafana](https://grafana.com/) 和 [Datadog](https://www.datadoghq.com/) 进行可视化。Prometheus 提供了一个开源解决方案来监控 ClickHouse 并设置自定义警报。您可以通过 [ClickHouse Cloud API](/integrations/prometheus) 访问 ClickHouse Cloud 服务的 Prometheus 指标。此功能当前处于私有预览阶段。请与 [支持团队](https://clickhouse.com/support/program) 联系，以为您的组织启用此功能。

<img alt="Prometheus Metrics with Grafana"
  style={{width: '600px', marginLeft: 0}}
  src={prometheous} />

### Other features: {#other-features}

- [Configurable backups](/cloud/manage/backups/configurable-backups) 现在可以配置自定义备份策略，如频率、保留和计划，并已正式上线。

## June 13, 2024 {#june-13-2024}

### Configurable offsets for Kafka ClickPipes Connector (Beta) {#configurable-offsets-for-kafka-clickpipes-connector-beta}

直到最近，每当您设置新的 [Kafka Connector for ClickPipes](/integrations/clickpipes/kafka) 时，它总是从 Kafka 主题的开头消费数据。在这种情况下，当您需要重新处理历史数据、监控新到来的数据或从精确的点恢复时，它可能不够灵活。

Kafka 的 ClickPipes 添加了一个新功能，增强了对 Kafka 主题的数据消费的灵活性和控制。您现在可以配置从哪个偏移量开始消费数据。

提供以下选项：
- 从开始：从 Kafka 主题的开始处开始消费数据。此选项非常适合需要重新处理所有历史数据的用户。
- 从最新：从最近的偏移量开始消费数据。此选项对只对新消息感兴趣的用户非常有用。
- 从时间戳：从在特定时间戳时或之后生产的消息开始消费数据。此功能允许更精确的控制，帮助用户从特定时间点恢复处理。

<img alt="Configure offsets for Kafka connector"
  style={{width: '600px', marginLeft: 0}}
  src={kafka_config} />

### Enroll services to the Fast release channel {#enroll-services-to-the-fast-release-channel}

快速发布渠道允许您的服务提前接收更新。以前，此功能需要支持团队的帮助才能启用。现在，您可以通过 ClickHouse Cloud 控制台直接为您的服务启用此功能。只需导航到 **设置**，然后点击 **注册快速发布**。您的服务将立即收到最新更新！

<img alt="Enroll in Fast releases"
  style={{width: '500px', marginLeft: 0}}
  src={fast_releases} />

### Terraform support for horizontal scaling {#terraform-support-for-horizontal-scaling}

ClickHouse Cloud 支持 [horizontal scaling](/manage/scaling#how-scaling-works-in-clickhouse-cloud)，或向您的服务添加相同大小的附加副本的能力。水平扩展提高了性能和并行性，以支持并发查询。之前，添加更多副本需要使用 ClickHouse Cloud 控制台或 API。现在，您可以使用 Terraform 添加或删除服务中的副本，从而允许您在需要时以编程方式扩展您的 ClickHouse 服务。

有关更多信息，请查看 [ClickHouse Terraform provider](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs)。

## May 30, 2024 {#may-30-2024}

### Share queries with your teammates {#share-queries-with-your-teammates}

当您编写 SQL 查询时，您的团队中的其他人很可能也会发现该查询有用。以前，您必须通过 Slack 或电子邮件发送查询，并且如果您对该查询进行编辑，则无法自动向团队成员发送更新。

我们很高兴地宣布，您现在可以通过 ClickHouse Cloud 控制台轻松共享查询。从查询编辑器，您可以直接与您的整个团队或特定团队成员共享查询。您还可以指定他们是仅有读取或写入权限。点击查询编辑器中的 **共享** 按钮以尝试新的共享查询功能。

<img alt="Share queries" style={{width: '500px', marginLeft: 0}} src={share_queries} />

### ClickHouse Cloud for Microsoft Azure is now in beta {#clickhouse-cloud-for-microsoft-azure-is-now-in-beta}

我们终于推出了在 Microsoft Azure 上创建 ClickHouse Cloud 服务的能力！我们已经有许多客户在生产中使用 ClickHouse Cloud 运行在 Azure 的服务，作为我们私有预览程序的一部分。现在，任何人都可以在 Azure 上创建自己的服务。您在 AWS 和 GCP 上支持的所有喜爱的 ClickHouse 功能也将在 Azure 上运行。

我们预计将在接下来的几周内完成 ClickHouse Cloud for Azure 的正式发布。要了解更多信息，请阅读这篇 [博客文章](https://clickhouse.com/blog/clickhouse-cloud-is-now-on-azure-in-public-beta)，或通过 ClickHouse Cloud 控制台使用 Azure 创建您的新服务。

注意：**Development** 服务目前不支持 Azure。

### Set up Private Link via the Cloud Console {#set-up-private-link-via-the-cloud-console}

我们的 Private Link 功能允许您将 ClickHouse Cloud 服务与您云提供商帐户中的内部服务连接，而无需将流量直接引导到公共互联网，从而节省成本并提高安全性。之前，这很难设置，并需要使用 ClickHouse Cloud API。

您现在可以通过 ClickHouse Cloud 控制台直接进行几次点击即可配置私人端点。只需转到您服务的 **设置**，进入 **安全** 部分，然后单击 **设置私人端点**。

<img alt="Set up private endpoint" src={private_endpoint} />

## May 17, 2024 {#may-17-2024}

### Ingest data from Amazon Kinesis using ClickPipes (Beta) {#ingest-data-from-amazon-kinesis-using-clickpipes-beta}

ClickPipes 是 ClickHouse Cloud 提供的专属服务，可无代码导入数据。Amazon Kinesis 是 AWS 的完全托管流服务，用于导入和存储数据流以供处理。我们很高兴推出 ClickPipes beta 用于 Amazon Kinesis，这是我们请求最多的集成之一。我们希望向 ClickPipes 添加更多集成，所以请告诉我们您希望支持哪些数据源！有关此功能的更多信息，请 [点击这里](https://clickhouse.com/blog/clickpipes-amazon-kinesis)。

您可以在云控制台中试用新的 Amazon Kinesis 集成：

<img alt="Amazon Kinesis on ClickPipes"
  src={kenesis} />

### Configurable Backups (Private Preview) {#configurable-backups-private-preview}

备份对每个数据库（无论其可靠性如何）都很重要，自 ClickHouse Cloud 开始以来，我们一直非常重视备份。本周，我们推出了可配置备份，提供更大的灵活性以满足您的服务备份需求。您现在可以控制开始时间、保留和频率。此功能适用于 **Production** 和 **Dedicated** 服务，不适用于 **Development** 服务。由于此功能处于私有预览阶段，请联系 support@clickhouse.com 以启用此功能。有关可配置备份的更多信息，请 [点击这里](https://clickhouse.com/blog/configurable-backups-in-clickhouse-cloud)。

### Create APIs from your SQL queries (Beta) {#create-apis-from-your-sql-queries-beta}

当您为 ClickHouse 编写 SQL 查询时，仍然需要通过驱动程序连接到 ClickHouse，以将查询暴露给您的应用程序。现在，利用我们的 **Query Endpoints** 功能，您可以直接从 API 执行 SQL 查询，而无需任何配置。您可以指定查询端点返回 JSON、CSV 或 TSV。在云控制台中单击 "分享" 按钮以尝试此新功能。

<img alt="Configure query endpoints" style={{width: '450px', marginLeft: 0}} src={query_endpoints} />

### Official ClickHouse Certification is now available {#official-clickhouse-certification-is-now-available}

ClickHouse 开发培训课程中提供了 12 个免费的培训模块。在本周之前，没有官方的方式来证明您对 ClickHouse 的掌握。我们最近推出了官方考试，成为 **ClickHouse Certified Developer**。完成此考试将允许您向当前和潜在的雇主展示您在 ClickHouse 各个主题（包括数据摄取、建模、分析、性能优化等）上的掌握。您可以 [点击这里](https://clickhouse.com/learn/certification) 参加考试，或在这篇 [博客文章](https://clickhouse.com/blog/first-official-clickhouse-certification) 中了解有关 ClickHouse 认证的更多信息。

## April 25, 2024 {#april-25-2024}

### Load data from S3 and GCS using ClickPipes {#load-data-from-s3-and-gcs-using-clickpipes}

您可能已经注意到我们新发布的云控制台中有一个新部分，称为 "数据源"。 "数据源" 页面由 ClickPipes 提供支持，这是 ClickHouse Cloud 的原生功能，允许您轻松地从各种来源插入数据到 ClickHouse Cloud。

我们最近的 ClickPipes 更新增加了直接从 Amazon S3 和 Google Cloud Storage 上传数据的能力。虽然您仍然可以使用我们内置的表函数，ClickPipes 是通过我们的用户界面完全管理的服务，可以让您仅需几次点击即可从 S3 和 GCS 中摄取数据。此功能仍处于私有预览阶段，但您今天可以通过云控制台试用。

<img alt="ClickPipes S3 and GCS" src={s3_gcs} />

### Use Fivetran to load data from 500+ sources into ClickHouse Cloud {#use-fivetran-to-load-data-from-500-sources-into-clickhouse-cloud}

ClickHouse 能够快速查询您所有的大型数据集，但当然，您的数据必须首先插入到 ClickHouse 中。多亏了 Fivetran 提供的全面连接器，用户现在可以迅速从 500 多个来源快速加载数据。无论您需要从 Zendesk、Slack 还是您喜欢的任何应用程序加载数据，新的 ClickHouse 目标 Fivetran 现在允许您将 ClickHouse 作为应用程序数据的目标数据库。

这是一个开源集成，经过我们集成团队几个月的努力工作而开发。您可以在 [这里查看我们的发布博客文章](https://clickhouse.com/blog/fivetran-destination-clickhouse-cloud) 和 [GitHub 存储库](https://github.com/ClickHouse/clickhouse-fivetran-destination)。

### Other changes {#other-changes}

**控制台更改**
- SQL 控制台中的输出格式支持

**集成更改**
- ClickPipes Kafka 连接器支持多代理设置
- PowerBI 连接器支持提供 ODBC 驱动程序配置选项。

## April 18, 2024 {#april-18-2024}

### AWS Tokyo region is now available for ClickHouse Cloud {#aws-tokyo-region-is-now-available-for-clickhouse-cloud}

此版本引入了 ClickHouse Cloud 的新 AWS 东京区域（`ap-northeast-1`）。因为我们希望 ClickHouse 成为最快的数据库，我们不断增加更多区域，以尽可能减少延迟。您可以在更新的云控制台中在东京创建新服务。

<img alt="Create Tokyo Service" src={tokyo} />

其他更改：

### 控制台更改 {#console-changes}
- ClickPipes for Kafka 的 Avro 格式支持现在已经正式上线
- 为 Terraform 提供者实现对导入资源（服务和私人端点）的完全支持

### 集成更改 {#integrations-changes}
- NodeJS 客户端主要稳定版本：改进了查询 + ResultSet 的 TypeScript 支持，URL 配置
- Kafka 连接器：修复了忽略写入 DLQ 时的异常的错误，增加对 Avro 枚举类型的支持，发布了在 [MSK](https://www.youtube.com/watch?v=6lKI_WlQ3-s) 和 [Confluent Cloud](https://www.youtube.com/watch?v=SQAiPVbd3gg) 上使用连接器的指南
- Grafana：修复了 UI 中对 Nullable 类型的支持，修复了动态 OTEL 追踪表名的支持
- DBT：修复了自定义物化视图的模型设置。
- Java 客户端：修复了错误代码解析的问题
- Python 客户端：修复了数值类型的绑定参数，修复了查询绑定中的数字列表错误，增加了 SQLAlchemy Point 支持。

## April 4, 2024 {#april-4-2024}

### Introducing the new ClickHouse Cloud Console {#introducing-the-new-clickhouse-cloud-console}

此版本引入了新云控制台的私有预览。

在 ClickHouse，我们始终在思考如何改善开发人员体验。我们认识到，仅提供最快的实时数据仓库是不够的，它还需要易于使用和管理。

成千上万的 ClickHouse Cloud 用户每月在我们的 SQL 控制台上执行数十亿个查询，这就是为什么我们决定在世界级控制台上进行更多投资，使与 ClickHouse Cloud 服务的交互变得比以往任何时候都更加容易。我们新的云控制台体验将我们的独立 SQL 编辑器与管理控制台合并在一个直观的 UI 中。

选定的客户将获得我们新云控制台体验的预览——一种统一和沉浸式方式来探索和管理您在 ClickHouse 中的数据。如果您希望优先访问，请通过 support@clickhouse.com 与我们联系。

<img alt="New Cloud Console" src={cloud_console} />

## March 28, 2024 {#march-28-2024}

此版本引入了对 Microsoft Azure 的支持，通过 API 进行水平扩展，以及在私有预览中提供发布渠道。

### 一般更新 {#general-updates}
- 引入了对 Microsoft Azure 的支持，处于私有预览中。要获取访问权限，请联系账户管理或支持，或加入 [候补名单](https://clickhouse.com/cloud/azure-waitlist)。
- 引入发布渠道——根据环境类型指定升级时机的能力。在本次发布中，我们增加了 “快速” 发布渠道，使您可以提前在非生产环境中升级（请联系支持以启用）。

### 管理更改 {#administration-changes}
- 添加通过 API 配置水平扩展的支持（私有预览，请联系支持以启用）
- 改善自动扩展，以便在启动时处理内存不足错误的服务
- 通过 Terraform 提供者增加对 AWS 的 CMEK 支持

### 控制台更改 {#console-changes-1}
- 添加对 Microsoft 社交登录的支持
- 在 SQL 控制台中添加参数化查询共享能力
- 显著提高查询编辑器性能（在某些欧盟地区的延迟从 5 秒降低到 1.5 秒）

### 集成更改 {#integrations-changes-1}
- ClickHouse OpenTelemetry 导出器：为 ClickHouse 复制表引擎 [添加支持](https://github.com/open-telemetry/opentelemetry-collector-contrib/pull/31920) 并 [添加集成测试](https://github.com/open-telemetry/opentelemetry-collector-contrib/pull/31896)
- ClickHouse DBT 适配器：为 [字典的物化宏](https://github.com/ClickHouse/dbt-clickhouse/pull/255) 添加支持，[TTL 表达式支持的测试](https://github.com/ClickHouse/dbt-clickhouse/pull/254)
- ClickHouse Kafka Connect Sink：对 Kafka 插件发现 [添加兼容性](https://github.com/ClickHouse/clickhouse-kafka-connect/issues/350)（社区贡献）
- ClickHouse Java Client：引入 [新包](https://github.com/ClickHouse/clickhouse-java/pull/1574) 用于新客户端 API 并为云测试 [添加测试覆盖率](https://github.com/ClickHouse/clickhouse-java/pull/1575)
- ClickHouse NodeJS 客户端：扩展对新 HTTP 保持活动行为的测试和文档。从 v0.3.0 版本开始提供
- ClickHouse Golang 客户端：修复了 Enum 作为 Map 中的键的问题；修复了在连接池中留存出错连接的问题（社区贡献）
- ClickHouse Python 客户端：为 SQLAlchemy [添加了支持](https://github.com/ClickHouse/clickhouse-connect/issues/155)，实现查询流传输（社区贡献）

### 安全更新 {#security-updates}
- 更新 ClickHouse Cloud 以防止 ["基于角色的访问控制在启用查询缓存时被绕过"](https://github.com/ClickHouse/ClickHouse/security/advisories/GHSA-45h5-f7g3-gr8r) (CVE-2024-22412)

## March 14, 2024 {#march-14-2024}

此版本在早期提供了新云控制台体验、ClickPipes 的 S3 和 GCS 批量加载支持，以及对 ClickPipes 中 Avro 格式的支持。还将 ClickHouse 数据库版本升级到 24.1，带来了新功能的支持以及性能和资源使用的优化。

### 控制台更改 {#console-changes-2}
- 新云控制台体验在早期访问中可用（如果您有兴趣参与，请联系支持）。
- ClickPipes 的 S3 和 GCS 批量加载在早期访问中可用（如果您有兴趣参与，请联系支持）。
- ClickPipes 中对 Kafka 的 Avro 格式支持在早期访问中可用（如果您有兴趣参与，请联系支持）。

### ClickHouse 版本升级 {#clickhouse-version-upgrade}
- 对 FINAL 的优化、向量化改进、聚合计算更快——有关详细信息，请参见 [23.12 发布博客](https://clickhouse.com/blog/clickhouse-release-23-12#optimizations-for-final)。
- 处理 punycode 的新功能、字符串相似度、新增离群检测以及合并和 Keeper 的内存优化——有关详细信息，请参见 [24.1 发布博客](https://clickhouse.com/blog/clickhouse-release-24-01) 和 [演示文稿](https://presentations.clickhouse.com/release_24.1/)。
- 此 ClickHouse 云版本基于 24.1，您可以看到数十个新功能、性能改进和错误修复。有关详细信息，请查看核心数据库 [更改日志](/whats-new/changelog/2023#2312)。

### 集成更改 {#integrations-changes-2}
- Grafana：修复了 v4 的仪表板迁移和即席过滤逻辑
- Tableau Connector：修复了 DATENAME 函数和 "实际" 参数的四舍五入
- Kafka Connector：修复了连接初始化中的 NPE，增加了指定 JDBC 驱动程序选项的能力
- Golang 客户端：减小了处理响应的内存占用，修复了 Date32 极端值，修复了启用压缩时的错误报告
- Python 客户端：改进了 datetime 参数的时区支持，改善了 Pandas DataFrame 的性能

## February 29, 2024 {#february-29-2024}

此版本提高了 SQL 控制台应用程序的加载时间，增加了 ClickPipes 中对 SCRAM-SHA-256 身份验证的支持，并将嵌套结构支持扩展到 Kafka Connect。

### 控制台更改 {#console-changes-3}
- 优化了 SQL 控制台应用程序的初始加载时间
- 修复了导致 "身份验证失败" 错误的 SQL 控制台竞争条件
- 修复了监控页面上大多数最近内存分配值有时不正确的行为
- 修复了 SQL 控制台有时发出重复 KILL QUERY 命令的行为
- 在 ClickPipes 中添加对 Kafka 数据源的 SCRAM-SHA-256 身份验证方法的支持

### 集成更改 {#integrations-changes-3}
- Kafka Connector：扩展对复杂嵌套结构（数组、映射）的支持；增加对 FixedString 类型的支持；增加对多个数据库的摄取支持
- Metabase：修复与 ClickHouse 版本低于 23.8 之间的不兼容
- DBT：增加了在模型创建时传递设置的能力
- Node.js 客户端：增加了对长时间运行的查询（>1小时）的支持，并对此类值的处理更加优雅

## February 15, 2024 {#february-15-2024}

此版本升级了核心数据库版本，增加了通过 Terraform 设置私有链接的能力，并为通过 Kafka Connect 异步插入的数据提供确切一次语义的支持。

### ClickHouse 版本升级 {#clickhouse-version-upgrade-1}
- 用于从 S3 持续、定期加载数据的 S3Queue 表引擎已准备好投产——有关详细信息，请参见 [23.11 发布博客](https://clickhouse.com/blog/clickhouse-release-23-11)。
- 对 FINAL 的显著性能改进及对 SIMD 指令向量化改进，导致更快的查询——有关详细信息，请参见 [23.12 发布博客](https://clickhouse.com/blog/clickhouse-release-23-12#optimizations-for-final)。
- 此 ClickHouse 云版本基于 23.12，您可以看到数十个新功能、性能改进和错误修复。请参见 [核心数据库更改日志](/whats-new/changelog/2023#2312) 获取详细信息。

### 控制台更改 {#console-changes-4}
- 增加通过 Terraform 提供者设置 AWS 私有链接和 GCP 私有服务连接的能力
- 改进了远程文件数据导入的韧性
- 所有数据导入中添加了导入状态详情弹出信息
- 为 S3 数据导入添加了密钥/私钥凭据支持

### 集成更改 {#integrations-changes-4}
* Kafka Connect
    * 支持异步插入以准确一次（默认禁用）
* Golang 客户端
    * 修复 DateTime 绑定问题
    * 改进批量插入性能
* Java 客户端
    * 修复请求压缩问题

### 设置更改 {#settings-changes}
* `use_mysql_types_in_show_columns` 不再需要。当您通过 MySQL 接口连接时，它将自动启用。
* `async_insert_max_data_size` 现在的默认值为 `10 MiB`

## February 2, 2024 {#february-2-2024}

此版本带来了 ClickPipes 对 Azure Event Hub 的支持，极大改善了使用 v4 ClickHouse Grafana 连接器的日志和跟踪导航工作流，并首次支持 Flyway 和 Atlas 数据库架构管理工具。

### 控制台更改 {#console-changes-5}
* 为 Azure Event Hub 添加 ClickPipes 支持
* 新服务的默认闲置时间设置为 15 分钟

### 集成更改 {#integrations-changes-5}
* [ClickHouse 数据源对于 Grafana](https://grafana.com/grafana/plugins/grafana-clickhouse-datasource/) v4 发布
  * 完全重建的查询构建器，为表、日志、时间序列和追踪提供了专用编辑器
  * 完全重建的 SQL 生成器，支持更复杂和动态的查询
  * 为 OpenTelemetry 在日志和追踪视图提供原生支持
  * 扩展配置以允许指定日志和追踪的默认表和列
  * 添加指定自定义 HTTP 头的能力
  * 还有更多改进—请查看完整的 [更改日志](https://github.com/grafana/clickhouse-datasource/blob/main/CHANGELOG.md#400)

* 数据库架构管理工具
  * [Flyway 添加 ClickHouse 支持](https://github.com/flyway/flyway-community-db-support/packages/2037428)
  * [Ariga Atlas 添加 ClickHouse 支持](https://atlasgo.io/blog/2023/12/19/atlas-v-0-16#clickhouse-beta-program)

* Kafka Connector Sink
  * 优化对具有默认值的表的摄取
  * 在 DateTime64 中增加对基于字符串的日期的支持

* Metabase
  * 增加对连接多个数据库的支持

## January 18, 2024 {#january-18-2024}

此版本在 AWS 中带来了一个新区域（伦敦 / eu-west-2），增加了 ClickPipes 对 Redpanda、Upstash 和 Warpstream 的支持，并改善了核心数据库功能 [is_deleted](/engines/table-engines/mergetree-family/replacingmergetree#is_deleted) 的可靠性。

### 一般更改 {#general-changes}
- 新 AWS 区域：伦敦（eu-west-2）

### 控制台更改 {#console-changes-6}
- 为 ClickPipes 添加对 Redpanda、Upstash 和 Warpstream 的支持
- 使 ClickPipes 身份验证机制在用户界面中可配置

### 集成更改 {#integrations-changes-6}
- Java 客户端：
  - 破坏性更改：移除了在调用中指定随机 URL 处理的能力。此功能已从 ClickHouse 中移除
  - 弃用：Java CLI 客户端和 GRPC 包
  - 向 RowBinaryWithDefaults 格式添加了支持，以减少批处理大小和 ClickHouse 实例上的工作负载（由 Exabeam 提出的请求）
  - 使 Date32 和 DateTime64 范围边界与 ClickHouse 兼容，与 Spark Array 字符串类型兼容，节点选择机制 

- Kafka Connector：为 Grafana 添加了 JMX 监控仪表板 
- PowerBI：使 ODBC 驱动程序设置在用户界面中可配置
- JavaScript 客户端：公开查询摘要信息，允许提供特定列的子集进行插入，使保持活动可配置于网络客户端 
- Python 客户端：为 SQLAlchemy 添加了 Nothing 类型的支持 
```
### 可靠性变化 {#reliability-changes}
- 用户可见的向后不兼容更改：以前，在某些条件下，两个功能（[is_deleted](/engines/table-engines/mergetree-family/replacingmergetree#is_deleted) 和 ``OPTIMIZE CLEANUP``）可能导致 ClickHouse 中数据损坏。为了保护用户数据的完整性，同时保持功能的核心，我们调整了这个功能的工作方式。具体来说，MergeTree 设置 ``clean_deleted_rows`` 现已弃用且不再有效。默认情况下不允许使用 ``CLEANUP`` 关键字（要使用它，您需要启用 ``allow_experimental_replacing_merge_with_cleanup``）。如果您决定使用 ``CLEANUP``，则需要确保其始终与 ``FINAL`` 一起使用，并且必须确保在运行 ``OPTIMIZE FINAL CLEANUP`` 后没有旧版本的行会被插入。

## 2023年12月18日 {#december-18-2023}

此版本引入了 GCP（us-east1）中的新区域，自助服务安全端点连接功能，支持包括 DBT 1.7 在内的额外集成，并包含众多错误修复和安全增强。

### 一般更改 {#general-changes-1}
- ClickHouse Cloud 现在在 GCP us-east1（南卡罗来纳州）区域可用
- 启用通过 OpenAPI 设置 AWS Private Link 和 GCP Private Service Connect 的能力

### 控制台更改 {#console-changes-7}
- 为开发者角色的用户启用无缝登录 SQL 控制台
- 简化了在入职期间设置闲置控制的工作流程

### 集成更改 {#integrations-changes-7}
- DBT 连接器：增加对 DBT 1.7 版本的支持
- Metabase：增加对 Metabase v0.48 的支持
- PowerBI 连接器：增加在 PowerBI Cloud 上运行的能力
- 使 ClickPipes 内部用户权限可配置
- Kafka 连接
  - 改进了去重逻辑和 Nullable 类型的摄取
  - 增加对文本格式（CSV, TSV）的支持
- Apache Beam：增加对布尔类型和 LowCardinality 类型的支持
- Nodejs 客户端：增加对 Parquet 格式的支持

### 安全公告 {#security-announcements}
- 修补了 3 个安全漏洞 - 详细信息请参见 [安全变更日志](/whats-new/security-changelog)：
  - CVE 2023-47118 (CVSS 7.0) - 一个影响默认在 9000/tcp 端口上运行的本地接口的堆缓冲区溢出漏洞
  - CVE-2023-48704 (CVSS 7.0) - 一个影响默认在 9000/tcp 端口上运行的本地接口的堆缓冲区溢出漏洞
  - CVE 2023-48298 (CVSS 5.9) - FPC 压缩编解码器中的整型下溢漏洞

## 2023年11月22日 {#november-22-2023}

此版本升级核心数据库版本，改善登录和身份验证流程，并为 Kafka Connect Sink 增加了代理支持。

### ClickHouse 版本升级 {#clickhouse-version-upgrade-2}

- 显著提高了读取 Parquet 文件的性能。详细信息请参见 [23.8 发布博客](https://clickhouse.com/blog/clickhouse-release-23-08)。
- 增加了对 JSON 的类型推断支持。详细信息请参见 [23.9 发布博客](https://clickhouse.com/blog/clickhouse-release-23-09)。
- 引入了强大的分析师功能，例如 `ArrayFold`。详细信息请参见 [23.10 发布博客](https://clickhouse.com/blog/clickhouse-release-23-10)。
- **用户可见的向后不兼容更改**：默认情况下禁用了设置 `input_format_json_try_infer_numbers_from_strings`，以避免从 JSON 格式的字符串推断数字。这可能会在样本数据包含类似数字的字符串时引发可能的解析错误。
- 数十项新功能、性能改进和错误修复。详细信息请参见 [核心数据库变更日志](/whats-new/changelog)。

### 控制台更改 {#console-changes-8}

- 改进了登录和身份验证流程。
- 改进了基于 AI 的查询建议，以更好地支持大型架构。

### 集成更改 {#integrations-changes-8}

- Kafka Connect Sink：增加代理支持，`topic-tablename` 映射，以及 Keeper _exactly-once_ 交付属性的可配置性。
- Node.js 客户端：增加对 Parquet 格式的支持。
- Metabase：增加 `datetimeDiff` 函数的支持。
- Python 客户端：增加对列名中的特殊字符的支持。修复时区参数绑定。

## 2023年11月2日 {#november-2-2023}

此版本为亚洲的发展服务增加了更多地区支持，引入客户管理加密密钥的密钥轮换功能，改进计费控制台中的税务设置粒度，并修复了多个支持语言客户端中的错误。

### 一般更新 {#general-updates-1}
- 开发服务现在在 AWS 的 `ap-south-1`（孟买）和 `ap-southeast-1`（新加坡）可用
- 增加对客户管理加密密钥（CMEK）中的密钥轮换支持

### 控制台更改 {#console-changes-9}
- 在添加信用卡时增加配置细粒度税务设置的能力

### 集成更改 {#integrations-changes-9}
- MySQL
  - 通过 MySQL 改进了 Tableau Online 和 QuickSight 的支持
- Kafka 连接器
  - 引入了一种新的 StringConverter，以支持文本格式（CSV, TSV）
  - 增加对 Bytes 和 Decimal 数据类型的支持
  - 调整可重试异常，现在始终会重试（即使当 errors.tolerance=all 时）
- Node.js 客户端
  - 修复了流式大数据集提供损坏结果的问题
- Python 客户端
  - 修复了大插入时的超时问题
  - 修复了 NumPy/Pandas 的 Date32 问题
- Golang 客户端
  - 修复将空映射插入 JSON 列、压缩缓冲区清理、查询转义、在 IPv4 和 IPv6 上的零/nil 恐慌
  - 添加取消插入的看门狗
- DBT
  - 改进了分布式表支持和测试

## 2023年10月19日 {#october-19-2023}

此版本在 SQL 控制台中带来可用性和性能增强，改进了 Metabase 连接器中的 IP 数据类型处理，并为 Java 和 Node.js 客户端引入了新功能。

### 控制台更改 {#console-changes-10}
- 改进了 SQL 控制台的可用性（例如，在查询执行之间保持列宽）
- 改进了 SQL 控制台的性能

### 集成更改 {#integrations-changes-10}
- Java 客户端：
  - 切换到默认网络库，以提高性能并重用开放连接
  - 增加代理支持
  - 增加通过信任存储进行安全连接的支持
- Node.js 客户端：修复了插入查询的保持活动行为
- Metabase：修复了 IPv4/IPv6 列序列化

## 2023年9月28日 {#september-28-2023}

此版本带来了 ClickPipes 对 Kafka、Confluent Cloud 和 Amazon MSK 的全面可用性，以及 Kafka Connect ClickHouse Sink，自助工作流程以通过 IAM 角色安全访问 Amazon S3，并提供 AI 辅助查询建议（私有预览）。

### 控制台更改 {#console-changes-11}
- 增加了自助工作流程，以安全访问 [Amazon S3](https://cloud/security/secure-s3) 通过 IAM 角色
- 引入 AI 辅助查询建议的私有预览（请 [联系 ClickHouse Cloud 支持](https://console.clickhouse.cloud/support) 尝试！）

### 集成更改 {#integrations-changes-11}
- 宣布 ClickPipes 的全面可用性 - 一个交钥匙的数据摄取服务 - 适用于 Kafka、Confluent Cloud 和 Amazon MSK（请参见 [发布博客](https://clickhouse.com/blog/clickpipes-is-generally-available)）
- 达到 Kafka Connect ClickHouse Sink 的全面可用性
  - 扩展支持自定义的 ClickHouse 设置使用 `clickhouse.settings` 属性
  - 改进去重行为以考虑动态字段
  - 增加支持 `tableRefreshInterval` 以重新获取 ClickHouse 中的表变更
- 修复了 SSL 连接问题和 [PowerBI](/integrations/powerbi) 与 ClickHouse 数据类型之间的类型映射

## 2023年9月7日 {#september-7-2023}

此版本带来了 PowerBI Desktop 官方连接器的测试版本，改善了对印度的信用卡支付处理，并在多个支持语言客户端中进行了多项改进。

### 控制台更改 {#console-changes-12}
- 添加剩余积分和支付重试，以支持印

### ClickHouse 22.12 版本升级 {#clickhouse-2212-version-upgrade}
- 扩展了 JOIN 支持，包括优雅哈希 JOIN
- 添加了对二进制 JSON (BSON) 文件读取的支持
- 添加了对 GROUP BY ALL 标准 SQL 语法的支持
- 新增了用于固定精度小数运算的数学函数
- 查看 [22.12 发布日志](https://clickhouse.com/blog/clickhouse-release-22-12) 和 [详细的 22.12 更新日志](/whats-new/cloud#clickhouse-2212-version-upgrade) 以获取完整的更改列表

### 控制台更改 {#console-changes-26}
- 改进了 SQL 控制台的自动完成功能
- 默认区域现在考虑到洲的地理位置
- 改进了账单使用页面，显示账单和网站单位

### 集成更改 {#integrations-changes-25}
- DBT 发布 [v1.3.2](https://github.com/ClickHouse/dbt-clickhouse/blob/main/CHANGELOG.md#release-132-2022-12-23)
  - 添加了对 delete+insert 增量策略的实验性支持
  - 新增 s3source 宏
- Python 客户端 [v0.4.8](https://github.com/ClickHouse/clickhouse-connect/blob/main/CHANGELOG.md#048-2023-01-02)
  - 文件插入支持
  - 服务器端查询 [参数绑定](/interfaces/cli.md/#cli-queries-with-parameters)
- Go 客户端 [v2.5.0](https://github.com/ClickHouse/clickhouse-go/releases/tag/v2.5.0)
  - 减少了压缩的内存使用
  - 服务器端查询 [参数绑定](/interfaces/cli.md/#cli-queries-with-parameters)

### 可靠性和性能 {#reliability-and-performance-2}
- 改进了查询性能，使之能够快速获取对象存储中大量小文件
- 对于新启动的服务，设置 [兼容性](/operations/settings/settings#compatibility) 设置为服务最初启动时的版本

### 错误修复 {#bug-fixes-4}
使用高级缩放滑块保留资源现在会立即生效。

## 2022年12月20日 {#december-20-2022}

此版本引入了管理员无缝登录 SQL 控制台、改善冷读的读取性能，以及改进了 ClickHouse Cloud 的 Metabase 连接器。

### 控制台更改 {#console-changes-27}
- 启用管理员用户的 SQL 控制台无缝访问
- 将新邀请者的默认角色更改为“管理员”
- 添加了入职调查

### 可靠性和性能 {#reliability-and-performance-3}
- 为长时间运行的插入查询添加了重试逻辑，以便在网络故障的情况下进行恢复
- 改进了冷读的读取性能

### 集成更改 {#integrations-changes-26}
- [Metabase 插件](/integrations/data-visualization/metabase-and-clickhouse.md) 获得了期待已久的 v0.9.1 重大更新。现在它与最新的 Metabase 版本兼容，并已针对 ClickHouse Cloud 进行了全面测试。

## 2022年12月6日 - 一般可用性 {#december-6-2022---general-availability}

ClickHouse Cloud 现在已经具备生产准备，就 SOC2 II 型合规性、生产工作负载的正常运行时间 SLA 以及公共状态页面。这一版本包括了重要的新功能，如 AWS 市场集成、SQL 控制台 - ClickHouse 用户的数据探索工作台，以及 ClickHouse 学院 - ClickHouse Cloud 的自主学习。了解更多信息，请查看这一 [博客](https://clickhouse.com/blog/clickhouse-cloud-generally-available)。

### 生产就绪 {#production-ready}
- SOC2 II 型合规性 (详情见 [博客](https://clickhouse.com/blog/clickhouse-cloud-is-now-soc-2-type-ii-compliant) 和 [信任中心](https://trust.clickhouse.com/))
- ClickHouse Cloud 的公共 [状态页面](https://status.clickhouse.com/)
- 适用于生产用例的正常运行时间 SLA
- 在 [AWS 市场](https://aws.amazon.com/marketplace/pp/prodview-jettukeanwrfc) 上提供

### 重大新功能 {#major-new-capabilities}
- 引入了 SQL 控制台，ClickHouse 用户的数据探索工作台
- 推出了 [ClickHouse 学院](https://learn.clickhouse.com/visitor_class_catalog)，ClickHouse Cloud 中的自主学习

### 定价与计量更改 {#pricing-and-metering-changes}
- 将试用期延长至 30 天
- 引入固定容量、低月消费的开发服务，非常适合初学项目和开发/测试环境
- 在生产服务上推出新的降价，随着我们继续改善 ClickHouse Cloud 的运行和扩展
- 改进了计算计量的粒度和准确性

### 集成更改 {#integrations-changes-27}
- 启用了对 ClickHouse Postgres / MySQL 集成引擎的支持
- 添加了对 SQL 用户定义函数 (UDFs) 的支持
- 高级 Kafka Connect 接收器达到测试版状态
- 通过引入丰富的元数据、版本、更新状态等改进了集成 UI

### 控制台更改 {#console-changes-28}

- 云控制台中的多因素身份验证支持
- 改进了移动设备的云控制台导航

### 文档更改 {#documentation-changes}

- 引入了 ClickHouse Cloud 的专门 [文档](/cloud/overview) 部分

### 错误修复 {#bug-fixes-5}
- 解决了由于依赖解析导致备份恢复不总是有效的问题。

## 2022年11月29日 {#november-29-2022}

此版本带来了 SOC2 II 型合规性，将 ClickHouse 版本更新为 22.11，并改进了许多 ClickHouse 客户端和集成。

### 一般更改 {#general-changes-4}

- 达到 SOC2 II 型合规性（详情见 [博客](https://clickhouse.com/blog/clickhouse-cloud-is-now-soc-2-type-ii-compliant) 和 [信任中心](https://trust.clickhouse.com)）

### 控制台更改 {#console-changes-29}

- 添加了“空闲”状态指示器，以显示服务已自动暂停。

### ClickHouse 22.11 版本升级 {#clickhouse-2211-version-upgrade}

- 添加了对 Hudi 和 DeltaLake 表引擎及表函数的支持
- 改进了 S3 的递归目录遍历
- 添加了对复合时间间隔语法的支持
- 改进了插入可靠性，支持重试插入
- 查看 [详细的 22.11 更新日志](/whats-new/cloud#clickhouse-2211-version-upgrade) 以获取完整的更改列表

### 集成 {#integrations-1}

- Python 客户端：支持 v3.11，改进插入性能
- Go 客户端：修复 DateTime 和 Int64 支持
- JS 客户端：支持双向 SSL 认证
- dbt-clickhouse：支持 DBT v1.3

### 错误修复 {#bug-fixes-6}

- 修复在升级后显示过期 ClickHouse 版本的错误
- 更改“默认”账户的授权不再中断会话
- 新创建的非管理员账户默认不再具有系统表访问权限

### 已知问题 {#known-issues-in-this-release}

- 由于依赖解析，备份恢复可能无法正常工作。

## 2022年11月17日 {#november-17-2022}

此版本启用了来自本地 ClickHouse 表和 HTTP 源的字典，首次介绍了对孟买地区的支持，并改善了云控制台用户体验。

### 一般更改 {#general-changes-5}

- 添加了对来自本地 ClickHouse 表和 HTTP 源的 [字典](/sql-reference/dictionaries/index.md) 的支持
- 首次引入对孟买 [地区](/cloud/reference/supported-regions.md) 的支持

### 控制台更改 {#console-changes-30}

- 改进了账单发票格式
- 简化了支付方式捕获的用户界面
- 为备份添加了更多细粒度的活动日志
- 改进了文件上传时的错误处理

### 错误修复 {#bug-fixes-7}
- 修复了如果某些部分有单个大文件，可能导致备份失败的错误
- 修复了如果同时应用访问列表更改，则备份恢复不成功的错误

### 已知问题 {#known-issues}
- 由于依赖解析，备份恢复可能无法正常工作。

## 2022年11月3日 {#november-3-2022}

此版本从定价中移除了读取和写入单位（有关详细信息，请参见 [定价页面](https://clickhouse.com/pricing)），将 ClickHouse 版本更新为 22.10，增强了自助客户的更高垂直扩展支持，并通过更好的默认设置提高了可靠性。

### 一般更改 {#general-changes-6}

- 从定价模型中移除了读取/写入单位

### 配置更改 {#configuration-changes-2}

- 出于稳定性原因，设置 `allow_suspicious_low_cardinality_types`、`allow_suspicious_fixed_string_types` 和 `allow_suspicious_codecs` （默认设置为 false）不再允许用户更改。

### 控制台更改 {#console-changes-31}

- 将自助服务的垂直扩展最大值增加到 720GB 内存，面向付费客户
- 改进了备份恢复工作流，以设置 IP 访问列表规则和密码
- 在服务创建对话框中推出了 GCP 和 Azure 的候补名单
- 改进了文件上传时的错误处理
- 改进了账单管理的工作流程

### ClickHouse 22.10 版本升级 {#clickhouse-2210-version-upgrade}

- 通过放宽“太多部分”的阈值，改善对象存储上的合并，在许多大部分（至少 10 GiB）的情况下，使其能够在单个表的单个分区中容纳高达 PB 的数据。
- 通过 `min_age_to_force_merge_seconds` 设置改善合并控制，以便在超过某一时间阈值后进行合并。
- 添加了 MySQL 兼容的语法以重置设置 `SET setting_name = DEFAULT`。
- 添加了 Morton 曲线编码、Java 整数哈希和随机数生成的函数。
- 查看 [详细的 22.10 更新日志](/whats-new/cloud#clickhouse-2210-version-upgrade) 以获取完整的更改列表。

## 2022年10月25日 {#october-25-2022}

此版本显著降低了小负载的计算消耗，降低了计算定价（有关详细信息，请参见 [定价](https://clickhouse.com/pricing) 页面），通过更好的默认设置提高了稳定性，并增强了 ClickHouse Cloud 控制台中的账单和使用视图。

### 一般更改 {#general-changes-7}

- 将服务的最低内存分配减少到 24G
- 将服务的空闲超时从30分钟减少到5分钟

### 配置更改 {#configuration-changes-3}

- 将 `max_parts_in_total` 的最大值从 100,000 降低到 10,000。MergeTree 表的 `max_parts_in_total` 设置的默认值已降低至 10,000。此更改的原因是，我们观察到大量数据部分可能导致云中服务的启动时间缓慢。大量部分通常表示选择了过于细粒度的分区键，这通常是无意中造成的，应予以避免。默认值的改变将允许更早地检测到这些情况。

### 控制台更改 {#console-changes-32}

- 加强了试用用户在账单视图中的信用使用细节
- 改进了工具提示和帮助文本，并在使用视图中添加了指向定价页面的链接
- 改进了在 IP 过滤选项切换时的工作流程
- 在云控制台中添加了重新发送邮件确认按钮

## 2022年10月4日 - 测试版 {#october-4-2022---beta}

ClickHouse Cloud 于 2022 年 10 月 4 日开始公测。欲了解更多，请查看这篇 [博客](https://clickhouse.com/blog/clickhouse-cloud-public-beta)。

ClickHouse Cloud 版本基于 ClickHouse 核心 v22.10。有关兼容功能的列表，请参阅 [云兼容性](/cloud/reference/cloud-compatibility.md) 指南。
```
