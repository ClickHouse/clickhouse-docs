---
slug: /whats-new/cloud
sidebar_label: 云变更日志
title: 云变更日志
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

除了此 ClickHouse 云变更日志外，请查看 [云兼容性](/cloud/reference/cloud-compatibility.md) 页面。
## 2025年2月21日 {#february-21-2025}
### ClickHouse 自带云（BYOC）现已全面上线！ {#clickhouse-byoc-for-aws-ga}

在此部署模型中，数据平面组件（计算、存储、备份、日志、指标）运行在客户 VPC 中，而控制平面（网络访问、API 和计费）则保持在 ClickHouse VPC 中。此设置非常适合需要遵循严格数据驻留要求的大型工作负载，以确保所有数据保持在安全的客户环境中。

- 有关更多详细信息，请参考 BYOC 的 [文档](/cloud/reference/byoc) 或阅读我们的 [公告博客文章](https://clickhouse.com/blog/announcing-general-availability-of-clickhouse-bring-your-own-cloud-on-aws)。
- [联系我们](https://clickhouse.com/cloud/bring-your-own-cloud) 请求访问权限。
### ClickPipes 的 Postgres CDC 连接器 {#postgres-cdc-connector-for-clickpipes}

ClickPipes 的 Postgres CDC 连接器现已公开测试。此功能允许用户将他们的 Postgres 数据库无缝复制到 ClickHouse 云。

- 要开始使用，请参阅 [ClickPipes Postgres CDC 连接器的文档](https://clickhouse.com/docs/integrations/clickpipes/postgres)。
- 如需有关客户用例和功能的更多信息，请参考 [登陆页面](https://clickhouse.com/cloud/clickpipes/postgres-cdc-connector) 以及 [发布博客](https://clickhouse.com/blog/postgres-cdc-connector-clickpipes-public-beta)。
### AWS 上的 ClickHouse 云的 PCI 合规性 {#pci-compliance-for-clickhouse-cloud-on-aws}

ClickHouse 云现在支持 **符合 PCI 规范的服务**，适用于 **us-east-1** 和 **us-west-2** 区域的 **企业级** 客户。希望在 PCI 合规环境中启动服务的用户可以联系 [支持](https://clickhouse.com/support/program) 寻求协助。
### Google Cloud Platform 上的透明数据加密和客户管理的加密密钥 {#tde-and-cmek-on-gcp}

支持 **透明数据加密 (TDE)** 和 **客户管理的加密密钥 (CMEK)**，现在可用于 **Google Cloud Platform (GCP)** 上的 ClickHouse 云。

- 有关这些功能的更多信息，请参考 [文档](https://clickhouse.com/docs/cloud/security/cmek#transparent-data-encryption-tde)。
### AWS 中东（阿联酋）可用性 {#aws-middle-east-uae-availability}

ClickHouse 云新增了一个区域支持，现已在 **AWS 中东（阿联酋）me-central-1** 区域提供服务。
### ClickHouse 云保护机制 {#clickhouse-cloud-guardrails}

为了促使最佳实践并确保 ClickHouse 云的稳定使用，我们引入了表、数据库、分区和分片的使用数量保护机制。

- 有关详细信息，请参阅文档的 [使用限制](https://clickhouse.com/docs/cloud/bestpractices/usage-limits) 部分。
- 如果您的服务已超过这些限制，我们将允许增加 10%。如有任何疑问，请联系 [支持](https://clickhouse.com/support/program)。
## 2025年1月27日 {#january-27-2025}
### ClickHouse 云层级的变更 {#changes-to-clickhouse-cloud-tiers}

我们致力于调整我们的产品以满足客户不断变化的需求。自 GA 发布以来，在过去两年中，ClickHouse 云经历了重大的进化，我们也获得了关于客户如何利用我们云产品的宝贵见解。

我们正在引入新功能，以优化 ClickHouse 云服务在您工作负载中的规模和成本效率。这些功能包括 **计算-计算分离**、高性能机器类型和 **单副本服务**。我们还在自动扩展和管理升级方面进行演变，使其以更无缝和响应式的方式执行。

我们将添加 **新的企业级**，以满足最苛刻的客户和工作负载的需求，重点关注特定行业的安全与合规功能，对基础硬件和升级的更多控制以及先进的灾难恢复功能。

为了支持这些变更，我们正在重构当前的 **开发** 和 **生产** 层级，以更贴合我们不断发展的客户基础使用我们的产品。我们将引入 **基础** 层，面向正在测试新想法和项目的用户，和 **规模** 层，匹配处理生产工作负载和大规模数据的用户。

您可以在这篇 [博客](https://clickhouse.com/blog/evolution-of-clickhouse-cloud-new-features-superior-performance-tailored-offerings) 中阅读有关这些和其他功能更改的内容。现有客户需要采取行动来选择 [新计划](https://clickhouse.com/pricing)。面向客户的沟通已通过电子邮件发送给组织管理员，并且 [FAQ](/cloud/manage/jan-2025-faq/summary) 涵盖了关键更改和时间表。
### 仓库：计算-计算分离（GA） {#warehouses-compute-compute-separation-ga}

计算-计算分离（也称为“仓库”）现已全面上线；有关更多详细信息，请参阅 [博客](https://clickhouse.com/blog/introducing-warehouses-compute-compute-separation-in-clickhouse-cloud) 和 [文档](/cloud/reference/warehouses)。
### 单副本服务 {#single-replica-services}

我们正在引入“单副本服务”的概念，既作为独立的产品，也作为仓库的一部分。作为独立的产品，单副本服务的规模有限，旨在用于小型测试工作负载。在仓库内，单副本服务可以以更大的规模部署，并用于不需要高可用性的大型工作负载，例如可重启的 ETL 作业。
### 垂直自动扩展改进 {#vertical-auto-scaling-improvements}

我们正在引入一种新的垂直扩展机制，用于计算副本，我们称之为“先创建后删除”（MBB）。此方法在删除旧副本之前添加一个或多个新规模的副本，从而防止扩展操作期间的容量损失。通过消除删除现有副本和添加新副本之间的间隙，MBB 创建了一个更无缝且影响更小的扩展过程。它在扩展场景中特别有益，该场景中高资源利用率触发了额外容量的需求，因为过早删除副本只会加剧资源限制。
### 水平扩展（GA） {#horizontal-scaling-ga}

水平扩展现在全面可用。用户可以通过 API 和云控制台添加额外的副本，以扩展其服务。有关信息，请参考 [文档](/manage/scaling#manual-horizontal-scaling)。
### 可配置备份 {#configurable-backups}

我们现在支持客户将备份导出到他们自己的云帐户；有关更多信息，请参阅 [文档](/cloud/manage/backups/configurable-backups)。
### 管理升级改进 {#managed-upgrade-improvements}

安全管理升级通过允许用户在数据库更新以添加功能时保持最新，实现了显著的价值。在此推出中，我们将“先创建后删除”（MBB）方法应用于升级，进一步减少对运行工作负载的影响。
### HIPAA 支持 {#hipaa-support}

我们现在在合规区域支持 HIPAA，包括 AWS `us-east-1`、`us-west-2` 和 GCP `us-central1`、`us-east1`。希望入驻的客户必须签署商业伙伴协议 (BAA)，并部署到合规版本的区域。如需了解有关 HIPAA 的更多信息，请查看 [文档](/cloud/security/security-and-compliance)。
### 定期升级 {#scheduled-upgrades}

用户可以为其服务安排升级。此功能仅支持企业级服务。如需了解有关定期升级的更多信息，请参阅 [文档](/manage/updates)。
### 对复杂类型的语言客户端支持 {#language-client-support-for-complex-types}

[Golang](https://github.com/ClickHouse/clickhouse-go/releases/tag/v2.30.1)、[Python](https://github.com/ClickHouse/clickhouse-connect/releases/tag/v0.8.11) 和 [NodeJS](https://github.com/ClickHouse/clickhouse-js/releases/tag/1.10.1) 客户端已添加对动态、变体和 JSON 类型的支持。
### DBT 支持可刷新物化视图 {#dbt-support-for-refreshable-materialized-views}

DBT 现在 [支持可刷新物化视图](https://github.com/ClickHouse/dbt-clickhouse/releases/tag/v1.8.7) 在 `1.8.7` 的发布中。
### JWT 令牌支持 {#jwt-token-support}

在 JDBC 司机 v2、clickhouse-java、[Python](https://github.com/ClickHouse/clickhouse-connect/releases/tag/v0.8.12) 和 [NodeJS](https://github.com/ClickHouse/clickhouse-js/releases/tag/1.10.0) 客户端中添加了对基于 JWT 的身份验证的支持。

JDBC/Java 将在 [0.8.0](https://github.com/ClickHouse/clickhouse-java/releases/tag/v0.8.0) 发布时可用 - ETA 待定。
### Prometheus 集成改进 {#prometheus-integration-improvements}

我们为 Prometheus 集成添加了若干增强功能：

- **组织级端点**。我们为 ClickHouse 云的 Prometheus 集成引入了增强。除了服务级指标外，API 现在还包括 **组织级指标** 的端点。此新端点自动收集您组织内所有服务的指标，简化了将指标导出到 Prometheus 收集器的过程。这些指标可以与如 Grafana 和 Datadog 等可视化工具相结合，以更全面地查看您组织的性能。

  此功能现已向所有用户开放。您可以在 [这里](/integrations/prometheus) 找到更多详细信息。

- **过滤指标**。我们为 ClickHouse 云的 Prometheus 集成添加了支持，以返回指标的过滤列表。此功能通过使您能够专注于监控服务健康所需的关键指标，帮助减少响应负载大小。

  此功能可以通过 API 中的可选查询参数访问，使您更容易优化数据收集并简化与 Grafana 和 Datadog 等工具的集成。

  过滤指标功能现已向所有用户开放。您可以在 [这里](/integrations/prometheus) 找到更多详细信息。
## 2024年12月20日 {#december-20-2024}
### 市场订阅组织关联 {#marketplace-subscription-organization-attachment}

您现在可以将新的市场订阅附加到现有的 ClickHouse 云组织中。订阅市场后重定向到 ClickHouse 云，您可以将过去创建的现有组织连接到新的市场订阅。从这一点开始，您在组织中的资源将通过市场计费。

<img alt="添加市场订阅"
  style={{width: '600px'}}
  src={add_marketplace} />
### 强制 OpenAPI 密钥过期 {#force-openapi-key-expiration}

现在可以限制 API 密钥的过期选项，以免创建未过期的 OpenAPI 密钥。请联系 ClickHouse 云支持团队以启用您组织的这些限制。
### 自定义通知电子邮件 {#custom-emails-for-notifications}

组织管理员现在可以将更多电子邮件地址添加到特定通知中作为附加收件人。如果您希望将通知发送给别名或组织内其他可能不是 ClickHouse 云用户的用户，这将很有用。要配置此设置，请从云控制台进入通知设置，编辑要接收邮件通知的电子邮件地址。
## 2024年12月6日 {#december-6-2024}
### BYOC（测试版） {#byoc-beta}

自带云（BYOC）现已在 AWS 上提供测试版。此部署模型允许您在自己的 AWS 帐户中部署和运行 ClickHouse 云。我们支持在 11 个以上的 AWS 区域进行部署，并且还会推出更多区域。请 [联系支持](https://clickhouse.com/support/program) 获取访问权限。请注意，此部署仅限于大规模部署。
### Postgres 变更数据捕获（CDC）连接器在 ClickPipes 中（公开测试版） {#postgres-change-data-capture-cdc-connector-in-clickpipes-public-beta}

此即插即用集成使客户能够以几次点击将其 Postgres 数据库复制到 ClickHouse 云，并利用 ClickHouse 进行快速分析。您可以使用此连接器进行连续复制或一次性迁移 Postgres 数据。
### 仪表板（测试版） {#dashboards-beta}

本周，我们非常高兴地宣布 ClickHouse 云中仪表板的测试版上线。通过仪表板，用户可以将保存的查询转换为可视化，将可视化组织到仪表板中，并使用查询参数与仪表板互动。要开始使用，请按照 [仪表板文档](/cloud/manage/dashboards) 的说明操作。

<img alt="仪表板测试版"
  style={{width: '600px'}}
  src={beta_dashboards} />
### 查询 API 端点（GA） {#query-api-endpoints-ga}

我们很高兴地宣布 ClickHouse 云中查询 API 端点的 GA 发布。查询 API 端点允许您仅需几次点击即可为保存的查询启动 RESTful API 端点，并开始在您的应用程序中消费数据，而无需处理语言客户端或身份验证复杂性。自首次推出以来，我们已经推出了许多改进，包括：

* 降低端点延迟，特别是对于冷启动
* 增加端点的 RBAC 控制
* 可配置的 CORS 允许域
* 结果流式传输
* 支持所有 ClickHouse 兼容的输出格式

除了这些改进，我们还很高兴地宣布通用查询 API 端点，这些端点利用现有框架，允许您对 ClickHouse 云服务执行任意 SQL 查询。通用端点可以在服务设置页面启用和配置。

要开始使用，请按照 [查询 API 端点文档](/cloud/get-started/query-endpoints) 的说明进行操作。

<img alt="API 端点"
  style={{width: '600px'}}
  src={api_endpoints} />
### 原生 JSON 支持（测试版） {#native-json-support-beta}

我们正在为 ClickHouse 云推出测试版的原生 JSON 支持。要开始使用，请联系支持 [启用您的云服务](/cloud/support)。
### 使用向量相似度索引进行向量搜索（提前访问） {#vector-search-using-vector-similarity-indexes-early-access}

我们宣布向量相似度索引用于近似向量搜索的提前访问！

ClickHouse 已经为基于向量的用例提供了强大的支持，具有广泛的 [距离函数](https://clickhouse.com/blog/reinvent-2024-product-announcements#vector-search-using-vector-similarity-indexes-early-access) 和执行线性扫描的能力。此外，最近，我们添加了一种实验性的 [近似向量搜索](/engines/table-engines/mergetree-family/annindexes) 方法，由 [usearch](https://github.com/unum-cloud/usearch) 库和层次可导航小世界 (HNSW) 近似最近邻搜索算法提供支持。

要开始使用， [请注册提前访问候补名单](https://clickhouse.com/cloud/vector-search-index-waitlist)。
### ClickHouse-Connect（Python）和 ClickHouse-Kafka-Connect 用户 {#clickhouse-connect-python-and-clickhouse-kafka-connect-users}

已向经历了客户端可能出现 `MEMORY_LIMIT_EXCEEDED` 异常问题的客户发送通知电子邮件。

请升级到：
- Kafka-Connect: > 1.2.5
- ClickHouse-Connect（Java）: > 0.8.6
### ClickPipes 现已支持 AWS 上的跨 VPC 资源访问 {#clickpipes-now-supports-cross-vpc-resource-access-on-aws}

您现在可以授予对特定数据源（如 AWS MSK）的单向访问。通过 AWS PrivateLink 和 VPC Lattice 的跨 VPC 资源访问，您可以在 VPC 和帐户之间共享单个资源，甚至从本地网络共享，而无需在公共网络上妥协隐私和安全。要开始设置资源共享，您可以阅读 [公告文章](https://clickhouse.com/blog/clickpipes-crossvpc-resource-endpoints?utm_medium=web&utm_source=changelog)。

<img alt="VPC ClickPipes"
  style={{width: '600px'}}
  src={cross_vpc} />
### ClickPipes 现已支持 AWS MSK 的 IAM {#clickpipes-now-supports-iam-for-aws-msk}

您现在可以使用 IAM 身份验证连接到具有 AWS MSK ClickPipes 的 MSK Broker。要开始使用，请查看我们的 [文档](/integrations/clickpipes/kafka#iam)。
### AWS 上新服务的最大副本大小 {#maximum-replica-size-for-new-services-on-aws}

从现在开始，在 AWS 创建的任何新服务将允许最大可用副本大小为 236 GiB。
## 2024年11月22日 {#november-22-2024}
### ClickHouse 云的内置高级可观测性仪表板 {#built-in-advanced-observability-dashboard-for-clickhouse-cloud}

之前，允许您监控 ClickHouse 服务器指标和硬件资源利用率的高级可观测性仪表板仅在开源 ClickHouse 中可用。我们很高兴地宣布，该功能现在在 ClickHouse 云控制台中可用！

此仪表板允许您在一个 UI 中查看基于 [system.dashboards](/operations/system-tables/dashboards) 表的查询。访问 **监控 > 服务健康** 页面，立即开始使用高级可观测性仪表板。

<img alt="高级可观测性仪表板"
  style={{width: '600px'}}
  src={nov_22} />
### AI 驱动的 SQL 自动完成 {#ai-powered-sql-autocomplete}

我们显著改进了自动完成，允许您在编写查询时使用新的 AI Copilot 进行行内 SQL 完成！该功能可以通过为任何 ClickHouse 云服务切换 **“启用行内代码完成”** 设置来启用。

<img alt="AI Copilot SQL 自动完成"
  style={{width: '600px'}}
  src={copilot} />
### 新的“账单”角色 {#new-billing-role}

您现在可以将组织中的用户分配给新的 **账单** 角色，使他们可以查看和管理账单信息，而不必给予他们配置或管理服务的能力。只需邀请新用户或编辑现有用户的角色以分配 **账单** 角色。
## 2024年11月8日 {#november-8-2024}
### ClickHouse 云中的客户通知 {#customer-notifications-in-clickhouse-cloud}

ClickHouse 云现在提供多个计费和扩展事件的控制台内和电子邮件通知。客户可以通过云控制台通知中心配置这些通知，以仅在 UI 上显示、接收电子邮件或两者兼而有之。您可以在服务级别配置接收的通知类别和严重性。

未来，我们将为其他事件添加通知，并提供更多的接收通知的方法。

请查看 [ClickHouse 文档](/cloud/notifications)，了解有关如何为您的服务启用通知的更多信息。

<img alt="客户通知 UI"
  style={{width: '600px'}}
  src={notifications} />

<br />
## 2024年10月4日 {#october-4-2024}
### ClickHouse 云现在在 GCP 中提供 HIPAA 就绪服务（测试版） {#clickhouse-cloud-now-offers-hipaa-ready-services-in-beta-for-gcp}

寻找受保护健康信息（PHI）增加安全性的客户现在可以在 [Google Cloud Platform (GCP)](https://cloud.google.com/) 上入驻 ClickHouse 云。ClickHouse 已实施 [HIPAA 安全规则](https://www.hhs.gov/hipaa/for-professionals/security/index.html) 规定的管理、物理和技术保障，并且现在拥有可以根据您的特定用例和工作负载实施的可配置安全设置。有关可用安全设置的更多信息，请查看我们的 [安全共享责任模型](/cloud/security/shared-responsibility-model)。

位于 GCP `us-central-1` 的服务对 **专用** 服务类型的客户可用，并且需要签署商业伙伴协议 (BAA)。请联系 [销售](mailto:sales@clickhouse.com) 或 [支持](https://clickhouse.com/support/program) 请求访问该功能或加入其他 GCP、AWS 和 Azure 区域的候补名单。
### 计算-计算分离现已在 GCP 和 Azure 中提供私有预览 {#compute-compute-separation-is-now-in-private-preview-for-gcp-and-azure}

我们最近宣布了 AWS 的计算-计算分离的私有预览。我们很高兴地宣布，现在在 GCP 和 Azure 中也可用。

计算-计算分离允许您将特定服务指定为读写或只读服务，使您能够为应用程序设计最佳计算配置，以优化成本和性能。有关更多详细信息，请 [阅读文档](/cloud/reference/compute-compute-separation)。
### 自助 MFA 恢复代码 {#self-service-mfa-recovery-codes}

使用多因素身份验证的客户现在可以获取恢复代码，这些代码可在丢失手机或意外删除令牌时使用。第一次注册 MFA 的客户将在设置时提供该代码。拥有现有 MFA 的客户可以通过删除现有的 MFA 令牌并添加新的来获取恢复代码。
### ClickPipes 更新：自定义证书、延迟洞察等！ {#clickpipes-update-custom-certificates-latency-insights-and-more}

我们很高兴分享 ClickPipes 的最新更新，这是将数据导入 ClickHouse 服务的最简单方式！这些新功能旨在增强您对数据摄取的控制，并提供更大的性能指标可见性。

*Kafka 的自定义身份验证证书*

ClickPipes 对 Kafka 现在支持使用 SASL 和公共 SSL/TLS 的自定义身份验证证书。您可以在 ClickPipe 设置的 SSL 证书部分轻松上传自己的证书，确保与 Kafka 的连接更加安全。

*针对 Kafka 和 Kinesis 的延迟指标*

性能可见性至关重要。ClickPipes 现在具有延迟图，提供从消息生产（无论是来自 Kafka 主题还是 Kinesis 流）到 ClickHouse 云摄取所需的时间。借助这一新指标，您可以更密切地关注数据管道的性能，并相应优化。

<img alt="延迟指标图"
  style={{width: '600px'}}
  src={latency_insights} />

<br />

*Kakfa 和 Kinesis 的扩展控制（私有测试版）*

高吞吐量可能需要额外资源以满足您的数据量和延迟需求。我们正在为 ClickPipes 引入水平扩展，用户可以直接通过我们的云控制台访问。此功能当前处于私有测试版，允许您根据需求更有效地扩展资源。请联系 [支持](https://clickhouse.com/support/program) 加入测试版。

*Kakfa 和 Kinesis 的原始消息摄取*

现在可以在不解析的情况下摄取整个 Kafka 或 Kinesis 消息。ClickPipes 现在支持一个 `_raw_message` [虚拟列](/integrations/clickpipes/kafka#kafka-virtual-columns)，允许用户将完整消息映射到单个字符串列。这使您可以根据需要灵活处理原始数据。
## 2024年8月29日 {#august-29-2024}
### 新的 Terraform 提供程序版本 - v1.0.0 {#new-terraform-provider-version---v100}

Terraform 允许您以编程方式控制您的 ClickHouse 云服务，然后将配置存储为代码。我们的 Terraform 提供程序已近达到 200,000 次下载，现在正式发布为 v1.0.0！该新版本包括更好的重试逻辑和一个新的资源，用于将私有端点附加到您的 ClickHouse 云服务。您可以在 [这里下载 Terraform 提供程序](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest) 并查看 [完整的变更日志](https://github.com/ClickHouse/terraform-provider-clickhouse/releases/tag/v1.0.0)。
### 2024 SOC 2 类型 II 报告和更新的 ISO 27001 证书 {#2024-soc-2-type-ii-report-and-updated-iso-27001-certificate}

我们自豪地宣布，我们的 2024 SOC 2 类型 II 报告和更新的 ISO 27001 证书现已可用，包括我们最近在 Azure 上推出的服务，以及对 AWS 和 GCP 服务的持续覆盖。

我们的 SOC 2 类型 II 报告展示了我们对为 ClickHouse 用户提供安全性、可用性、处理完整性和机密性服务的持续承诺。有关更多信息，请查看 [SOC 2 - 服务组织的 SOC：信任服务标准](https://www.aicpa-cima.com/resources/landing/system-and-organization-controls-soc-suite-of-services) 由美国注册会计师协会（AICPA）发布和 [ISO/IEC 27001 是什么](https://www.iso.org/standard/27001) 来自国际标准化组织 (ISO)。

如需安全和合规文档和报告，请查看我们的 [信任中心](https://trust.clickhouse.com/)。
## 2024年8月15日 {#august-15-2024}
### 计算-计算分离现已在 AWS 中提供私有预览 {#compute-compute-separation-is-now-in-private-preview-for-aws}

对于现有 ClickHouse 云服务，副本同时处理读取和写入操作，并且无法将特定副本配置为仅处理一种类型的操作。我们拥有一个即将推出的新功能，称为计算-计算分离，该功能允许您将特定服务指定为读写或只读服务，使您能够设计最佳计算配置，以优化成本和性能。

我们的新计算-计算分离功能使您能够创建多个计算节点组，每个组都有自己的端点，且使用相同的对象存储文件夹，因此，即使用相同的表、视图等。阅读有关 [计算-计算分离的内容](/cloud/reference/compute-compute-separation)。如果您希望在私有预览中访问此功能，请 [联系支持](https://clickhouse.com/support/program)。

<img alt="计算-计算分离的示例架构"
  style={{width: '600px'}}
  src={cloud_console_2} />
### ClickPipes 的 S3 和 GCS 现已全面上线，支持连续模式 {#clickpipes-for-s3-and-gcs-now-in-ga-continuous-mode-support}

ClickPipes 是将数据导入 ClickHouse 云的最简单方法。我们很高兴地宣布 [ClickPipes](https://clickhouse.com/cloud/clickpipes) 的 S3 和 GCS 现在 **全面可用**。ClickPipes 支持一次性批量摄取和“连续模式”。摄取任务将所有匹配特定远程存储桶模式的文件加载到 ClickHouse 目标表中。在“连续模式”下，ClickPipes 作业将持续运行，摄取在远程对象存储桶中新增的匹配文件。这将允许用户将任何对象存储桶转变为一个功能齐全的中转区，以将数据导入 ClickHouse 云。有关 ClickPipes 的更多信息，请参阅 [我们的文档](/integrations/clickpipes)。
## 2024年7月18日 {#july-18-2024}
### Prometheus 指标端点现已全面可用 {#prometheus-endpoint-for-metrics-is-now-generally-available}

在我们的上一个云变更日志中，我们宣布了从 ClickHouse 云导出 [Prometheus](https://prometheus.io/) 指标的私有预览。此功能允许您使用 [ClickHouse云 API](/cloud/manage/api/api-overview) 将您的指标导入到 [Grafana](https://grafana.com/) 和 [Datadog](https://www.datadoghq.com/) 等工具中进行可视化。我们很高兴地宣布该功能现在 **全面可用**。有关此功能的更多信息，请参见 [我们的文档](/integrations/prometheus)。
```yaml
title: '云控制台中的表检查器'
sidebar_label: '云控制台中的表检查器'
keywords: ['表检查器', '云控制台', 'ClickHouse']
description: '了解如何使用云控制台中的表检查器来快速查看表和列的信息，而无需编写SQL。'
```

### 云控制台中的表检查器 {#table-inspector-in-cloud-console}

ClickHouse 提供了诸如 [`DESCRIBE`](/sql-reference/statements/describe-table) 的命令，让您能够深入查看表以检查模式。这些命令会输出到控制台，但通常使用起来不够方便，因为您需要组合多个查询才能检索有关表和列的所有相关数据。

我们最近在云控制台中推出了 **表检查器**，使您能够在用户界面中检索重要的表和列信息，而无需编写 SQL。您可以通过查看云控制台来尝试为您的服务使用表检查器。它提供了有关您的模式、存储、压缩等信息的统一界面。

<img alt="表检查器用户界面"
  style={{width: '800px', marginLeft: 0}}
  src={compute_compute} />
### 新的 Java 客户端 API {#new-java-client-api}

我们的 [Java 客户端](https://github.com/ClickHouse/clickhouse-java) 是用户连接 ClickHouse 的最受欢迎的客户端之一。我们希望让它更易于使用和直观，包括重新设计的 API 和各种性能优化。这些更改将使您的 Java 应用程序更容易连接到 ClickHouse。您可以在这篇 [博客文章](https://clickhouse.com/blog/java-client-sequel) 中阅读有关如何使用更新的 Java 客户端的更多信息。
### 新的分析器默认启用 {#new-analyzer-is-enabled-by-default}

在过去的几年里，我们一直在开发用于查询分析和优化的新分析器。该分析器提高了查询性能，并将使我们能够进行进一步的优化，包括更快、更高效的 `JOIN`。之前，新用户需要使用设置 `allow_experimental_analyzer` 来启用此功能。此改进的分析器现在默认可在新的 ClickHouse Cloud 服务上使用。

请持续关注分析器的更多改进，因为我们有许多更多的优化计划！
## 2024年6月28日 {#june-28-2024}
### ClickHouse Cloud for Microsoft Azure 现已普遍可用！ {#clickhouse-cloud-for-microsoft-azure-is-now-generally-available}

我们在 [今年5月](https://clickhouse.com/blog/clickhouse-cloud-is-now-on-azure-in-public-beta) 首次宣布对 Microsoft Azure 的支持。在此最新的云版本中，我们很高兴地宣布 Azure 支持正从测试版转换为普遍可用。ClickHouse Cloud 现在可在所有三个主要云平台上使用：AWS、Google Cloud Platform 和 Microsoft Azure。

此版本还包括通过 [Microsoft Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps/clickhouse.clickhouse_cloud) 提供的订阅支持。该服务最初将在以下区域提供支持：
- 美国：西部美国 3（亚利桑那州）
- 美国：东部美国 2（弗吉尼亚州）
- 欧洲：德国西部中央（法兰克福）

如果您希望支持任何特定区域，请 [联系我们](https://clickhouse.com/support/program)。
### 查询日志洞察 {#query-log-insights}

我们在云控制台中新的查询洞察 UI 使 ClickHouse 的内置查询日志变得更容易使用。ClickHouse 的 `system.query_log` 表是查询优化、调试和监控整体集群健康和性能的重要信息来源。唯一的缺点是：70多个字段和每个查询多个记录，使得解析查询日志具有陡峭的学习曲线。这一初始版本的查询洞察为简化查询调试和优化模式的未来工作提供了蓝图。我们希望听到您的反馈，因为我们将继续对这一功能进行迭代，因此请告诉我们—您的意见将非常宝贵！

<img alt="查询洞察用户界面"
  style={{width: '600px', marginLeft: 0}}
  src={query_insights} />
### Prometheus 指标端点（私有预览） {#prometheus-endpoint-for-metrics-private-preview}

这可能是我们最受欢迎的请求功能之一：您现在可以从 ClickHouse Cloud 导出 [Prometheus](https://prometheus.io/) 指标到 [Grafana](https://grafana.com/) 和 [Datadog](https://www.datadoghq.com/) 进行可视化。Prometheus 提供了一个开源解决方案来监控 ClickHouse 并设置自定义警报。您可以通过 [ClickHouse Cloud API](/integrations/prometheus) 访问 ClickHouse Cloud 服务的 Prometheus 指标。此功能当前处于私有预览中。请联系 [支持团队](https://clickhouse.com/support/program) 以为您的组织启用此功能。

<img alt="与 Grafana 的 Prometheus 指标"
  style={{width: '600px', marginLeft: 0}}
  src={prometheous} />
### 其他功能： {#other-features}
- [可配置备份](/cloud/manage/backups/configurable-backups) 现在普遍可用，允许用户配置自定义备份策略，如频率、保留和计划。
## 2024年6月13日 {#june-13-2024}
### 为 Kafka ClickPipes 连接器配置偏移量（测试版） {#configurable-offsets-for-kafka-clickpipes-connector-beta}

直到最近，每当您设置新的 [Kafka 连接器用于 ClickPipes](/integrations/clickpipes/kafka) 时，它总是从 Kafka 主题的开头消费数据。在这种情况下，当您需要重新处理历史数据、监控新传入数据或从特定点恢复时，它可能不够灵活。

ClickPipes for Kafka 添加了一项新功能，增强了对 Kafka 主题数据消费的灵活性和控制能力。您现在可以配置消费数据的偏移量。

可用的选项如下：
- 从头开始：从 Kafka 主题的开头开始消费数据。此选项非常适合需要重新处理所有历史数据的用户。
- 从最新开始：从最新的偏移量开始消费数据。对于仅对新消息感兴趣的用户，这非常有用。
- 从时间戳开始：从在特定时间戳时或之后生产的消息开始消费数据。此功能允许更精确的控制，使用户能够从准确的时间点恢复处理。

<img alt="为 Kafka 连接器配置偏移量"
  style={{width: '600px', marginLeft: 0}}
  src={kafka_config} />
### 将服务注册到快速发布通道 {#enroll-services-to-the-fast-release-channel}

快速发布通道允许您的服务提前接收更新。之前，这一功能需要支持团队的帮助才能启用。现在，您可以直接使用 ClickHouse Cloud 控制台为您的服务启用此功能。只需导航到 **设置**，然后点击 **注册到快速发布**。您的服务将会在更新可用时立即收到更新！

<img alt="注册快速发布"
  style={{width: '500px', marginLeft: 0}}
  src={fast_releases} />
### Terraform 支持水平扩展 {#terraform-support-for-horizontal-scaling}

ClickHouse Cloud 支持 [水平扩展](/manage/scaling#how-scaling-works-in-clickhouse-cloud)，即能够为您的服务添加额外相同规模的副本。水平扩展提高了性能和并行性，以支持并发查询。之前，添加更多副本需要使用 ClickHouse Cloud 控制台或 API。现在，您可以使用 Terraform 从服务中添加或删除副本，使您可以根据需要以编程方式扩展 ClickHouse 服务。

有关详细信息，请参见 [ClickHouse Terraform 提供者](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs)。
## 2024年5月30日 {#may-30-2024}
### 与您的团队成员共享查询 {#share-queries-with-your-teammates}

当您编写 SQL 查询时，其他团队成员很可能也会发现该查询有用。之前，您必须通过 Slack 或电子邮件发送查询，并且如果您编辑查询，团队成员无法自动接收该查询的更新。

我们很高兴地宣布，现在您可以通过 ClickHouse Cloud 控制台轻松共享查询。在查询编辑器中，您可以直接与整个团队或特定团队成员共享查询。您还可以指定他们是仅具有读取权限还是写入权限。单击查询编辑器中的 **共享** 按钮即可尝试新共享查询功能。

<img alt="共享查询" style={{width: '500px', marginLeft: 0}} src={share_queries} />
### ClickHouse Cloud for Microsoft Azure 现已进入测试版 {#clickhouse-cloud-for-microsoft-azure-is-now-in-beta}

我们终于推出了在 Microsoft Azure 上创建 ClickHouse Cloud 服务的能力！我们已经有许多客户在我们的私有预览计划中使用 ClickHouse Cloud 在 Azure 上进行生产。现在，任何人都可以在 Azure 上创建自己的服务。您在 AWS 和 GCP 上支持的所有 ClickHouse 功能也将在 Azure 上有效。

我们预计 ClickHouse Cloud for Azure 在接下来的几周内准备好普遍可用。您可以通过 ClickHouse Cloud 控制台了解更多信息，或使用 Azure 创建您的新服务。

注意：目前不支持 Azure 的 **开发** 服务。
### 通过云控制台设置私有链接 {#set-up-private-link-via-the-cloud-console}

我们的私有链接功能允许您在不必将流量指向公共互联网的情况下，将 ClickHouse Cloud 服务与云提供商账号中的内部服务连接，从而节省成本并增强安全性。之前，这一设置很复杂，并且需要使用 ClickHouse Cloud API。

现在，您可以直接从 ClickHouse Cloud 控制台通过几次点击配置私有端点。只需转到服务的 **设置**，然后在 **安全** 部分单击 **设置私有端点**。

<img alt="设置私有端点" src={private_endpoint} />
## 2024年5月17日 {#may-17-2024}
### 使用 ClickPipes 从 Amazon Kinesis 导入数据（测试版） {#ingest-data-from-amazon-kinesis-using-clickpipes-beta}

ClickPipes 是 ClickHouse Cloud 提供的专属服务，允许用户无代码地导入数据。Amazon Kinesis 是 AWS 的完全托管流媒体服务，用于导入和存储数据流以进行处理。我们很高兴正式推出针对 Amazon Kinesis 的 ClickPipes 测试版，这是我们最受欢迎的集成之一。我们希望将更多集成添加到 ClickPipes 中，因此请告诉我们您希望我们支持哪些数据源！在这篇 [文章](https://clickhouse.com/blog/clickpipes-amazon-kinesis) 中阅读更多关于此功能的信息。

您可以在云控制台中尝试新的 Amazon Kinesis 集成：

<img alt="在 ClickPipes 上的 Amazon Kinesis"
  src={kenesis} />
### 可配置备份（私有预览） {#configurable-backups-private-preview}

备份对每个数据库（无论多么可靠）都很重要，自 ClickHouse Cloud 开始的第一天起，我们就非常重视备份。本周，我们推出了可配置备份，这为您的服务备份提供了更大的灵活性。您现在可以控制开始时间、保留和频率。此功能适用于 **生产** 和 **专用** 服务，不适用于 **开发** 服务。由于此功能处于私有预览中，请联系 support@clickhouse.com 来为您的服务启用此功能。在这篇 [文章](https://clickhouse.com/blog/configurable-backups-in-clickhouse-cloud) 中了解有关可配置备份的更多信息。
### 从 SQL 查询创建 API（测试版） {#create-apis-from-your-sql-queries-beta}

当您为 ClickHouse 编写 SQL 查询时，您仍然需要通过驱动程序连接到 ClickHouse，以便将查询公开给您的应用程序。现在，借助我们新的 **查询端点** 功能，您可以直接从 API 执行 SQL 查询，而无需任何配置。您可以指定查询端点以返回 JSON、CSV 或 TSV。单击云控制台中的 “共享” 按钮，与您的查询一起尝试此新功能。在这篇 [文章](https://clickhouse.com/blog/automatic-query-endpoints) 中阅读有关查询端点的更多信息。

<img alt="配置查询端点" style={{width: '450px', marginLeft: 0}} src={query_endpoints} />
### 官方 ClickHouse 认证现已可用 {#official-clickhouse-certification-is-now-available}

ClickHouse 开发培训课程中有 12 个免费的培训模块。在这周之前，没有官方途径证明您对 ClickHouse 的掌握。我们最近推出了一个官方考试来成为 **ClickHouse 认证开发者**。完成此考试后，您可以与当前和潜在的雇主分享您在数据导入、建模、分析、性能优化等主题上的精通。您可以在 [这里](https://clickhouse.com/learn/certification) 参加考试，或在这篇 [博客文章](https://clickhouse.com/blog/first-official-clickhouse-certification) 中阅读有关 ClickHouse 认证的更多信息。
## 2024年4月25日 {#april-25-2024}
### 使用 ClickPipes 从 S3 和 GCS 中加载数据 {#load-data-from-s3-and-gcs-using-clickpipes}

您可能已经注意到我们新发布的云控制台中有一个名为 “数据源” 的新部分。“数据源” 页面由 ClickPipes 提供支持，这是 ClickHouse Cloud 的本地功能，使您能够轻松地将各种来源的数据插入 ClickHouse Cloud。

我们最近的 ClickPipes 更新具有直接从 Amazon S3 和 Google Cloud Storage 上传数据的能力。虽然您仍然可以使用我们的内置表函数，ClickPipes 是通过我们的用户界面提供的完全托管的服务，允许您只需几次点击即可从 S3 和 GCS 导入数据。此功能仍处于私有预览中，但您今天可以通过云控制台进行尝试。

<img alt="ClickPipes S3 和 GCS" src={s3_gcs} />
### 使用 Fivetran 从 500 多个来源将数据加载到 ClickHouse Cloud {#use-fivetran-to-load-data-from-500-sources-into-clickhouse-cloud}

ClickHouse 可以快速查询您所有的大型数据集，但当然，您的数据必须先插入 ClickHouse。感谢 Fivetran 广泛的连接器，用户现在可以快速从 500 多个来源加载数据。无论您需要从 Zendesk、Slack 还是任何您喜欢的应用程序加载数据，新 ClickHouse 目标用于 Fivetran 使您可以将 ClickHouse 用作应用程序数据的目标数据库。

这是一个经过多个月辛勤工作的开源集成。您可以查看我们的 [发布博客文章](https://clickhouse.com/blog/fivetran-destination-clickhouse-cloud) 和 [GitHub 存储库](https://github.com/ClickHouse/clickhouse-fivetran-destination)。
### 其他更改 {#other-changes}

**控制台更改**
- SQL 控制台支持输出格式

**集成更改**
- ClickPipes Kafka 连接器支持多代理设置
- PowerBI 连接器支持配置 ODBC 驱动程序选项。
## 2024年4月18日 {#april-18-2024}
### AWS 东京区域现在可用于 ClickHouse Cloud {#aws-tokyo-region-is-now-available-for-clickhouse-cloud}

此发布引入了 ClickHouse Cloud 的新 AWS 东京区域（`ap-northeast-1`）。因为我们希望 ClickHouse 成为最快的数据库，所以我们不断为每个云添加更多区域，以尽可能降低延迟。您可以在更新的云控制台中在东京创建您的新服务。

<img alt="创建东京服务" src={tokyo} />

其他更改：
### 控制台更改 {#console-changes}
- ClickPipes for Kafka 现在普遍可用的 Avro 格式支持
- 为 Terraform 提供者实现资源（服务和私有端点）导入的完全支持
### 集成更改 {#integrations-changes}
- NodeJS 客户端主要稳定版本：查询 + ResultSet 的高级 TypeScript 支持，URL 配置
- Kafka 连接器：修复在写入 DLQ 时忽略异常的错误，添加对 Avro 枚举类型的支持，为在 [MSK](https://www.youtube.com/watch?v=6lKI_WlQ3-s) 和 [Confluent Cloud](https://www.youtube.com/watch?v=SQAiPVbd3gg) 上使用连接器发布指南
- Grafana：修复 UI 中的 Nullable 类型支持，修复动态 OTEL 跟踪表名的支持
- DBT：修复自定义物化的模型设置。
- Java 客户端：修复错误代码解析的错误
- Python 客户端：修复数字类型的参数绑定，修复查询绑定中的数字列表的错误，增加对 SQLAlchemy Point 的支持。
## 2024年4月4日 {#april-4-2024}
### 介绍新的 ClickHouse Cloud 控制台 {#introducing-the-new-clickhouse-cloud-console}

此发布引入了新的云控制台的私有预览。

在 ClickHouse，我们不断思考如何改善开发者体验。我们认识到，仅提供最快的实时数据仓库还不够，它还需要易于使用和管理。

成千上万的 ClickHouse Cloud 用户每个月在我们的 SQL 控制台上执行数十亿次查询，这就是为什么我们决定投资更多资源来打造一个世界级的控制台，使与 ClickHouse Cloud 服务的交互变得比以往任何时候都更加简单。我们新的云控制台体验将我们的独立 SQL 编辑器与我们的管理控制台结合在一个直观的用户界面中。

选定客户将收到我们新云控制台体验的预览——一种统一而身临其境的方式来探索和管理您在 ClickHouse 中的数据。如果您希望优先访问，请通过 support@clickhouse.com 联系我们。

<img alt="新云控制台" src={cloud_console} />
## 2024年3月28日 {#march-28-2024}

此发布在私有预览中引入对 Microsoft Azure 的支持、通过 API 的水平扩展和发布通道。
### 一般更新 {#general-updates}
- 在私有预览中引入 Microsoft Azure 支持。要获取访问权限，请联系账户管理或支持，或加入 [候补名单](https://clickhouse.com/cloud/azure-waitlist)。
- 引入发布通道——根据环境类型指定升级时机的能力。在此版本中，我们添加了“快速”发布通道，使您能够提前在非生产环境中升级（请联系支持以启用）。
### 管理更改 {#administration-changes}
- 通过 API 增加了水平扩展配置的支持（私有预览，请联系支持以启用）
- 改进了自动扩展，以在启动时缩放出内存错误的服务
- 通过 Terraform 提供者为 AWS 添加了 CMEK 支持
### 控制台更改 {#console-changes-1}
- 增加了对 Microsoft 社交登录的支持
- 在 SQL 控制台中添加了参数化查询共享功能
- 显著改善查询编辑器的性能（在一些欧盟地区从5秒降低到1.5秒的延迟）
### 集成更改 {#integrations-changes-1}
- ClickHouse OpenTelemetry 导出器：[添加支持](https://github.com/open-telemetry/opentelemetry-collector-contrib/pull/31920) ClickHouse 复制表引擎并 [添加集成测试](https://github.com/open-telemetry/opentelemetry-collector-contrib/pull/31896)
- ClickHouse DBT 适配器：为 [字典的物化宏添加支持](https://github.com/ClickHouse/dbt-clickhouse/pull/255)， [TTL 表达式支持的测试](https://github.com/ClickHouse/dbt-clickhouse/pull/254)
- ClickHouse Kafka Connect Sink：[与 Kafka 插件发现](https://github.com/ClickHouse/clickhouse-kafka-connect/issues/350) 兼容性（社区贡献）
- ClickHouse Java 客户端：引入 [新包](https://github.com/ClickHouse/clickhouse-java/pull/1574) 用于新客户端 API 和 [为 Cloud 测试添加测试覆盖率](https://github.com/ClickHouse/clickhouse-java/pull/1575)
- ClickHouse NodeJS 客户端：扩展对新 HTTP keep-alive 行为的测试和文档。自 v0.3.0 发布以来可用
- ClickHouse Golang 客户端：[修复了一个错误](https://github.com/ClickHouse/clickhouse-go/pull/1236)，使枚举作为映射中的键； [修复了一个错误](https://github.com/ClickHouse/clickhouse-go/pull/1237)，当出现错误连接时留在连接池中（社区贡献）
- ClickHouse Python 客户端：[添加支持](https://github.com/ClickHouse/clickhouse-connect/issues/155) 通过 PyArrow 流式查询（社区贡献）
### 安全更新 {#security-updates}
- 更新 ClickHouse Cloud 以防止 ["基于角色的访问控制在启用查询缓存时被绕过"](https://github.com/ClickHouse/ClickHouse/security/advisories/GHSA-45h5-f7g3-gr8r)（CVE-2024-22412）
## 2024年3月14日 {#march-14-2024}

此发布早期访问新云控制台体验、ClickPipes 从 S3 和 GCS 大批量加载的功能，以及 ClickPipes for Kafka 的 Avro 格式支持。还将 ClickHouse 数据库版本升级到 24.1，新增许多功能，并优化性能和资源使用。
### 控制台更改 {#console-changes-2}
- 新云控制台体验现已在早期访问中提供（如果您有兴趣参与，请联系支持）。
- ClickPipes 用于从 S3 和 GCS 大批量加载的功能现已在早期访问中提供（如果您有兴趣参与，请联系支持）。
- ClickPipes for Kafka 的 Avro 格式支持现已在早期访问中提供（如果您有兴趣参与，请联系支持）。
### ClickHouse 版本升级 {#clickhouse-version-upgrade}
- 对 FINAL、向量化改进、加快聚合的优化 - 有关详细信息，请参见 [23.12 发布博客](https://clickhouse.com/blog/clickhouse-release-23-12#optimizations-for-final)。
- 新增处理 punycode、字符串相似性、检测异常值的函数，以及合并和 Keeper 的内存优化 - 有关详细信息，请参见 [24.1 发布博客](https://clickhouse.com/blog/clickhouse-release-24-01) 和 [演示](https://presentations.clickhouse.com/release_24.1/)。
- 本 ClickHouse 云版本基于 24.1，您可以看到数十项新功能、性能改进和错误修复。有关详细信息，请查看核心数据库 [更改日志](/whats-new/changelog/2023#2312)。
### 集成更改 {#integrations-changes-2}
- Grafana：修复 v4 的仪表板迁移，临时过滤逻辑
- Tableau 连接器：修复 DATENAME 函数和 “实际” 参数的舍入
- Kafka 连接器：修复连接初始化中的 NPE，添加指定 JDBC 驱动程序选项的能力
- Golang 客户端：减少处理响应的内存占用，修复 Date32 极端值，在启用压缩时改进错误报告
- Python 客户端：改善 datetime 参数的时区支持，提高 Pandas DataFrame 的性能
## 2024年2月29日 {#february-29-2024}

此发布改善了 SQL 控制台应用程序的加载时间，添加了对 ClickPipes 中 SCRAM-SHA-256 认证的支持，并将嵌套结构支持扩展到 Kafka Connect。
### 控制台更改 {#console-changes-3}
- 优化 SQL 控制台应用程序首次加载时间
- 修复 SQL 控制台竞争条件导致的 “认证失败” 错误
- 修复监控页面上最近内存分配值有时不正确的行为
- 修复 SQL 控制台有时发出重复 KILL QUERY 命令的行为
- 在 ClickPipes 中添加对 Kafka 数据源的 SCRAM-SHA-256 认证方法的支持
### 集成更改 {#integrations-changes-3}
- Kafka 连接器：扩展对复杂嵌套结构（数组、映射）的支持；添加对 FixedString 类型的支持；添加对多个数据库的摄取支持
- Metabase：修复与 ClickHouse 低于版本 23.8 的不兼容性
- DBT：添加将设置传递给模型创建的能力
- Node.js 客户端：添加对长期运行查询（>1小时）的支持，优雅地处理空值
## 2024年2月15日 {#february-15-2024}

此发布升级核心数据库版本，添加通过 Terraform 设置私有链接的能力，以及为通过 Kafka Connect 的异步插入添加对恰好一次语义的支持。
### ClickHouse 版本升级 {#clickhouse-version-upgrade-1}
- S3Queue 表引擎用于从 S3 进行连续、计划的数据加载已准备好进入生产环境 - 有关详细信息，请参见 [23.11 发布博客](https://clickhouse.com/blog/clickhouse-release-23-11)。
- 对 FINAL 的显著性能改进和向量化改进，使用 SIMD 指令使查询更快 - 有关详细信息，请参见 [23.12 发布博客](https://clickhouse.com/blog/clickhouse-release-23-12#optimizations-for-final)。
- 本 ClickHouse 云版本基于 23.12，您可以看到数十项新功能、性能改进和错误修复。有关详细信息，请查看 [核心数据库更改日志](/whats-new/changelog/2023#2312)。
### 控制台更改 {#console-changes-4}
- 增加了通过 Terraform 提供者设置 AWS 私有链接和 GCP 私有服务连接的能力
- 改进了对远程文件数据导入的弹性
- 为所有数据导入添加了导入状态详细信息弹出窗口
- 为 s3 数据导入添加了密钥/秘密密钥凭证支持
### 集成更改 {#integrations-changes-4}
* Kafka Connect
    * 支持异步插入，实现恰好一次（默认禁用）
* Golang 客户端
    * 修复 DateTime 绑定
    * 改进批量插入性能
* Java 客户端
    * 修复请求压缩问题
### 设置更改 {#settings-changes}
* `use_mysql_types_in_show_columns` 不再是必需的。通过 MySQL 接口连接时将自动启用。
* `async_insert_max_data_size` 现在的默认值为 `10 MiB`
## 2024年2月2日 {#february-2-2024}

此发布带来了 ClickPipes 对 Azure Event Hub 的可用性，显著改善了使用 v4 ClickHouse Grafana 连接器进行日志和跟踪导航的工作流程，并首次支持 Flyway 和 Atlas 数据库架构管理工具。
### 控制台更改 {#console-changes-5}
* 为 Azure Event Hub 添加了 ClickPipes 支持
* 新服务以 15 分钟的默认闲置时间启动
### 集成更改 {#integrations-changes-5}
* [用于 Grafana 的 ClickHouse 数据源](https://grafana.com/grafana/plugins/grafana-clickhouse-datasource/) v4 发布
  * 完全重建查询构建器，具有适用于表、日志、时间序列和跟踪的专业编辑器
  * 完全重建 SQL 生成器，以支持更复杂和动态的查询
  * 在日志和跟踪视图中添加对 OpenTelemetry 的一流支持
  * 扩展配置以允许指定日志和跟踪的默认表和列
  * 添加指定自定义 HTTP 头的能力
  * 还有许多其他改进 - 请查看完整的 [更改日志](https://github.com/grafana/clickhouse-datasource/blob/main/CHANGELOG.md#400)
* 数据库架构管理工具
  * [Flyway 添加 ClickHouse 支持](https://github.com/flyway/flyway-community-db-support/packages/2037428)
  * [Ariga Atlas 添加 ClickHouse 支持](https://atlasgo.io/blog/2023/12/19/atlas-v-0-16#clickhouse-beta-program)
* Kafka 连接器 Sink
  * 优化对具有默认值的表的摄取
  * 添加对 DateTime64 中基于字符串的日期的支持
* Metabase
  * 添加对连接多个数据库的支持
## 2024年1月18日 {#january-18-2024}

此发布在 AWS 中带来了新区域（伦敦 / eu-west-2）、为 Redpanda、Upstash 和 Warpstream 添加了 ClickPipes 支持，并改善了 [is_deleted](/engines/table-engines/mergetree-family/replacingmergetree#is_deleted) 核心数据库能力的可靠性。
### 一般更改 {#general-changes}
- 新的 AWS 区域：伦敦（eu-west-2）
### 控制台更改 {#console-changes-6}
- 为 Redpanda、Upstash 和 Warpstream 添加了 ClickPipes 支持
- 使 ClickPipes 认证机制可以在用户界面中进行配置
### 集成更改 {#integrations-changes-6}
- Java 客户端：
  - 重大更改：移除了在调用中指定随机 URL 句柄的能力。此功能已从 ClickHouse 中删除
  - 弃用：Java CLI 客户端和 GRPC 包
  - 添加对 RowBinaryWithDefaults 格式的支持，以减少批量大小和在 ClickHouse 实例上的工作负载（由 Exabeam 请求）
  - 使 Date32 和 DateTime64 范围边界与 ClickHouse 兼容，并在节点选择机制中与 Spark Array 字符串类型兼容
- Kafka 连接器：为 Grafana 添加 JMX 监控仪表板
- PowerBI：使 ODBC 驱动程序设置可以在 UI 中进行配置
- JavaScript 客户端：公开查询摘要信息，允许提供插入的特定列子集，使 keep_alive 可用于 Web 客户端进行配置
- Python 客户端：为 SQLAlchemy 添加 Nothing 类型支持
### 可靠性更改 {#reliability-changes}
- 面向用户的向后不兼容更改：之前，两个功能（[is_deleted](/engines/table-engines/mergetree-family/replacingmergetree#is_deleted) 和 ``OPTIMIZE CLEANUP``）在某些条件下可能导致 ClickHouse 中的数据损坏。为了保护我们用户数据的完整性，同时保持功能的核心，我们调整了此功能的工作方式。特别是，MergeTree 设置 ``clean_deleted_rows`` 现在已弃用且不再生效。默认情况下不允许使用 ``CLEANUP`` 关键字（要使用它，您需要启用 ``allow_experimental_replacing_merge_with_cleanup``）。如果您决定使用 ``CLEANUP``，则必须确保始终与 ``FINAL`` 一起使用，并且必须保证在运行 ``OPTIMIZE FINAL CLEANUP`` 后不会插入任何 older 版本的行。
## 2023年12月18日 {#december-18-2023}

此发布带来了 GCP 中的新区域（us-east1），能够自助服务安全端点连接，支持包括 DBT 1.7 在内的额外集成，以及大量错误修复和安全增强。
```yaml
title: '更新日志'
sidebar_label: '更新日志'
keywords: ['更新', 'ClickHouse', '日志']
description: 'ClickHouse的最新更改和功能更新'
```

### 一般变更 {#general-changes-1}
- ClickHouse Cloud现在在GCP us-east1（南卡罗来纳州）区域可用
- 启用通过OpenAPI设置AWS Private Link和GCP Private Service Connect的能力
### 控制台变更 {#console-changes-7}
- 启用开发者角色用户无缝登录到SQL控制台
- 简化入职期间设定空闲控制的工作流程
### 集成变更 {#integrations-changes-7}
- DBT连接器：增加对DBT v1.7的支持
- Metabase：增加对Metabase v0.48的支持
- PowerBI连接器：增加在PowerBI云上运行的能力
- 使ClickPipes内部用户的权限可配置
- Kafka Connect
  - 改进了可空类型的去重逻辑和摄取
  - 增加对基于文本格式（CSV，TSV）的支持
- Apache Beam：增加对布尔和低基数类型的支持
- Nodejs客户端：增加对Parquet格式的支持
### 安全公告 {#security-announcements}
- 修复了3个安全漏洞 - 详见[安全变更日志](/whats-new/security-changelog)：
  - CVE 2023-47118 (CVSS 7.0) - 影响默认在端口9000/tcp上运行的本地接口的堆缓冲溢出漏洞
  - CVE-2023-48704 (CVSS 7.0) - 影响默认在端口9000/tcp上运行的本地接口的堆缓冲溢出漏洞
  - CVE 2023-48298 (CVSS 5.9) - FPC压缩编解码器中的整数下溢漏洞
## 2023年11月22日 {#november-22-2023}

此版本升级核心数据库版本，改善登录和认证流程，并为Kafka Connect Sink添加代理支持。
### ClickHouse版本升级 {#clickhouse-version-upgrade-2}

- 大幅提升了读取Parquet文件的性能。详情见[23.8发布博客](https://clickhouse.com/blog/clickhouse-release-23-08)。
- 增加对JSON的类型推断支持。详情见[23.9发布博客](https://clickhouse.com/blog/clickhouse-release-23-09)。
- 引入了强大的分析师功能，如`ArrayFold`。详情见[23.10发布博客](https://clickhouse.com/blog/clickhouse-release-23-10)。
- **用户面向的向后不兼容更改**：默认禁用设置`input_format_json_try_infer_numbers_from_strings`以避免在JSON格式中从字符串推断数字。这可能会在样本数据包含类似数字的字符串时导致解析错误。
- 数十项新功能、性能改进和错误修复。详情见[核心数据库变更日志](/whats-new/changelog)。
### 控制台变更 {#console-changes-8}

- 改进了登录和认证流程。
- 改进了基于AI的查询建议，更好地支持大型模式。
### 集成变更 {#integrations-changes-8}

- Kafka Connect Sink：新增代理支持、`topic-tablename`映射和对Keeper _exactly-once_ 交付属性的可配置性。
- Node.js客户端：增加对Parquet格式的支持。
- Metabase：增加对`datetimeDiff`函数的支持。
- Python客户端：增加对列名中特殊字符的支持。修复时区参数绑定问题。
## 2023年11月2日 {#november-2-2023}

此版本为亚洲的开发服务增加了更多区域支持，引入了客户管理加密密钥的关键轮换功能，改善了账单控制台的税务设置粒度，并在受支持的语言客户端中修复了多个错误。
### 一般更新 {#general-updates-1}
- 开发服务现在在AWS的`ap-south-1`（孟买）和`ap-southeast-1`（新加坡）可用
- 增加对客户管理加密密钥（CMEK）中的关键轮换支持
### 控制台变更 {#console-changes-9}
- 增加在添加信用卡时配置精细税务设置的能力
### 集成变更 {#integrations-changes-9}
- MySQL
  - 通过MySQL改进了Tableau Online和QuickSight的支持
- Kafka连接器
  - 引入了支持文本格式（CSV，TSV）的新StringConverter
  - 增加对字节和十进制数据类型的支持
  - 调整可重试异常，现在始终重试（即使错误容忍=全部）
- Node.js客户端
  - 修复了流式大数据集提供损坏结果的问题
- Python客户端
  - 修复了大插入时的超时问题
  - 修复了NumPy/Pandas的Date32问题
​​- Golang客户端
  - 修复将空映射插入JSON列、压缩缓冲区清理、查询转义、IPv4和IPv6的零/nil引发的恐慌
  - 为取消插入添加监视程序
- DBT
  - 改进了分布式表支持及测试
## 2023年10月19日 {#october-19-2023}

此版本在SQL控制台中带来了可用性和性能改进，改善了Metabase连接器中的IP数据类型处理，以及Java和Node.js客户端中的新功能。
### 控制台变更 {#console-changes-10}
- 改进了SQL控制台的可用性（例如，在查询执行之间保留列宽）
- 改进了SQL控制台的性能
### 集成变更 {#integrations-changes-10}
- Java客户端：
  - 切换默认网络库以提高性能并重用打开的连接
  - 增加对代理的支持
  - 增加使用信任存储的安全连接支持
- Node.js客户端：修复插入查询的保活行为
- Metabase：修复IPv4/IPv6列序列化
## 2023年9月28日 {#september-28-2023}

此版本为Kafka、Confluent Cloud和Amazon MSK推出了ClickPipes的一般可用性以及Kafka Connect ClickHouse Sink，提供了通过IAM角色安全访问Amazon S3的自助工作流程，并推出了AI辅助查询建议（私人预览）。
### 控制台变更 {#console-changes-11}
- 增加自助工作流程以安全 [访问Amazon S3 via IAM角色](/cloud/security/secure-s3)
- 在私人预览中引入了AI辅助查询建议（请 [联系ClickHouse Cloud支持](https://console.clickhouse.cloud/support)体验！）
### 集成变更 {#integrations-changes-11}
- 宣布ClickPipes - 一种交钥匙数据摄取服务 - 的一般可用性，适用于Kafka、Confluent Cloud和Amazon MSK（见[发布博客](https://clickhouse.com/blog/clickpipes-is-generally-available)）
- 达成Kafka Connect ClickHouse Sink的一般可用性
  - 扩展了对使用`clickhouse.settings`属性的自定义ClickHouse设置的支持
  - 改进了去重行为以考虑动态字段
  - 增加支持`tableRefreshInterval`以重新获取ClickHouse中的表更改
- 修复了SSL连接问题以及[PowerBI](/integrations/powerbi)与ClickHouse数据类型之间的类型映射
## 2023年9月7日 {#september-7-2023}

此版本推出了PowerBI Desktop官方连接器的beta版本，改善了印度的信用卡支付处理，并在受支持的语言客户端中进行了多项改进。
### 控制台变更 {#console-changes-12}
- 增加剩余信用和支付重试以支持来自印度的收费
### 集成变更 {#integrations-changes-12}
- Kafka连接器：增加配置ClickHouse设置的支持，增加错误容忍配置选项
- PowerBI Desktop：发布官方连接器的beta版本
- Grafana：增加对Point地理类型的支持，修复数据分析仪仪表板中的面板，修复timeInterval宏
- Python客户端：兼容Pandas 2.1.0，取消对Python 3.7的支持，增加对nullable JSON类型的支持
- Node.js客户端：增加default_format设置支持
- Golang客户端：修复布尔类型处理，移除字符串限制
## 2023年8月24日 {#aug-24-2023}

此版本为ClickHouse数据库添加了对MySQL接口的支持，推出了新的官方PowerBI连接器，在云控制台中添加了新的“运行查询”视图，并将ClickHouse版本更新为23.7。
### 一般更新 {#general-updates-2}
- 增加对[MySQL线协议](/interfaces/mysql)的支持，这使得与许多现有BI工具的兼容性成为可能。请联系支持以为您的组织启用此功能。
- 推出了新的官方PowerBI连接器
### 控制台变更 {#console-changes-13}
- 增加对SQL控制台中“运行查询”视图的支持
### ClickHouse 23.7版本升级 {#clickhouse-237-version-upgrade}
- 增加对Azure表函数的支持，将地理数据类型提升为生产就绪，并改善了连接性能 - 详见23.5发布 [博客](https://clickhouse.com/blog/clickhouse-release-23-05)
- 将MongoDB集成支持扩展到版本6.0 - 详见23.6发布 [博客](https://clickhouse.com/blog/clickhouse-release-23-06)
- 将写入Parquet格式的性能提高了6倍，增加对PRQL查询语言的支持，并改善SQL兼容性 - 详见23.7发布 [文档](https://presentations.clickhouse.com/release_23.7/)。
- 数十项新功能、性能改进和错误修复 - 详见详细的[变更日志](/whats-new/changelog)以获取23.5、23.6、23.7
### 集成变更 {#integrations-changes-13}
- Kafka连接器：增加对Avro日期和时间类型的支持
- JavaScript客户端：为基于Web的环境发布了稳定版本
- Grafana：改进了过滤逻辑、数据库名称处理，并增加对具有亚秒级精度的TimeInterval的支持
- Golang客户端：修复了多个批量和异步数据加载问题
- Metabase：支持v0.47，增加连接假冒，修复数据类型映射
## 2023年7月27日 {#july-27-2023}

此版本带来了ClickPipes for Kafka的私人预览，新的数据加载体验，以及通过云控制台从URL加载文件的能力。
### 集成变更 {#integrations-changes-14}
- 引入[ClickPipes](https://clickhouse.com/cloud/clickpipes)的私人预览，提供一种云原生集成引擎，使从Kafka和Confluent Cloud摄取大量数据变得简单，只需单击几下按钮。请在[此处](https://clickhouse.com/cloud/clickpipes#joinwaitlist)注册等待列表。
- JavaScript客户端：发布了对基于Web的环境（浏览器、Cloudflare workers）的支持。代码经过重构，以允许社区为自定义环境创建连接器。
- Kafka连接器：增加对带有时间戳和时间Kafka类型的inline schema的支持
- Python客户端：修复了插入压缩和低基数读取问题
### 控制台变更 {#console-changes-14}
- 增加了新的数据加载体验，提供更多表创建配置选项
- 引入通过云控制台从URL加载文件的能力
- 改进邀请流程，增加了加入不同组织和查看所有未处理邀请的额外选项
## 2023年7月14日 {#july-14-2023}

此版本带来了启动专用服务的能力、新的AWS区域（澳大利亚），以及引入自定义密钥以加密磁盘上的数据。
### 一般更新 {#general-updates-3}
- 新的AWS澳大利亚区域：悉尼（ap-southeast-2）
- 针对要求严格的低延迟工作负载的专用服务层（请联系[支持](https://console.clickhouse.cloud/support)以设置）
- 自带密钥（BYOK）以加密磁盘上的数据（请联系[支持](https://console.clickhouse.cloud/support)以设置）
### 控制台变更 {#console-changes-15}
- 改进异步插入的可观察性指标仪表板
- 改进聊天机器人与支持的集成行为
### 集成变更 {#integrations-changes-15}
- NodeJS客户端：修复了因套接字超时导致的连接失败的错误
- Python客户端：为插入查询增加QuerySummary，支持数据库名称中的特殊字符
- Metabase：更新JDBC驱动程序版本，增加对DateTime64的支持，提升性能。
### 核心数据库变更 {#core-database-changes}
- 可以在ClickHouse Cloud中启用[查询缓存](/operations/query-cache)。启用时，成功的查询默认缓存一分钟，后续查询将使用缓存的结果。
## 2023年6月20日 {#june-20-2023}

此版本使ClickHouse Cloud在GCP上一般可用，带来了Cloud API的Terraform提供程序，并将ClickHouse版本更新为23.4。
### 一般更新 {#general-updates-4}
- ClickHouse Cloud在GCP现已GA，带来了GCP市场集成、Private Service Connect支持和自动备份（详见[博客](https://clickhouse.com/blog/clickhouse-cloud-on-google-cloud-platform-gcp-is-generally-available)和[新闻稿](https://clickhouse.com/blog/clickhouse-cloud-expands-choice-with-launch-on-google-cloud-platform)了解详细信息）
- [Terraform提供程序](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs)现已可用
### 控制台变更 {#console-changes-16}
- 增加了一页新的综合服务设置
- 调整了存储和计算的计量精度
### 集成变更 {#integrations-changes-16}
- Python客户端：改善插入性能，重构内部依赖以支持多进程
- Kafka连接器：可上传并安装到Confluent Cloud，增加对临时连接问题的重试，自动重置错误的连接器状态
### ClickHouse 23.4版本升级 {#clickhouse-234-version-upgrade}
- 增加对并行副本的JOIN支持（请联系[支持](https://console.clickhouse.cloud/support)以设置）
- 改进了轻量级删除的性能
- 改进了处理大插入时的缓存性能
### 管理变更 {#administration-changes-1}
- 扩展了对非“默认”用户创建本地字典的支持
## 2023年5月30日 {#may-30-2023}

此版本带来了ClickHouse Cloud可编程API的公开发布，用于控制平面操作（详见[博客](https://clickhouse.com/blog/using-the-new-clickhouse-cloud-api-to-automate-deployments)了解详细信息），使用IAM角色的S3访问，以及额外的扩展选项。
### 一般变更 {#general-changes-2}
- ClickHouse Cloud的API支持。通过新的Cloud API，您可以无缝集成管理服务到现有的CI/CD管道，并以编程方式管理服务。
- 使用IAM角色的S3访问。您现在可以利用IAM角色安全访问您的私人Amazon简单存储服务（S3）存储桶（请联系支持以设置）。
### 扩展变更 {#scaling-changes}
- [水平扩展](/manage/scaling#manual-horizontal-scaling)。需要更多并行处理的工作负载现在可以配置最多10个副本（请联系支持以设置）。
- [基于CPU的自动扩展](/manage/scaling)。CPU瓶颈的工作负载现在可以获得额外触发自动扩展策略的好处。
### 控制台变更 {#console-changes-17}
- 将Dev服务迁移到生产服务（请联系支持以启用）
- 在实例创建流程中增加扩展配置控制
- 当默认密码未存储在内存中时修复连接字符串
### 集成变更 {#integrations-changes-17}
- Golang客户端：修复了导致本地协议中连接不平衡的问题，增加对本地协议中的自定义设置的支持
- Nodejs客户端：取消对nodejs v14的支持，增加对v20的支持
- Kafka连接器：增加对低基数类型的支持
- Metabase：修复按时间范围分组，修复在内置Metabase问题中的整数支持
### 性能和可靠性 {#performance-and-reliability}
- 改善了写入重的工作负载的效率和性能
- 部署了增量备份策略，以提高备份的速度和效率
## 2023年5月11日 {#may-11-2023}

此版本带来了ClickHouse Cloud在GCP的~~公开测试~~（现已GA，见上文6月20日条目），扩展管理员权限以授予终止查询权限，并在Cloud控制台中增加了对MFA用户状态的更多可见性。
### ClickHouse Cloud在GCP ~~（公开测试）~~（现已GA，见上文6月20日条目） {#clickhouse-cloud-on-gcp-public-beta-now-ga-see-june-20th-entry-above}
- 启动了一个完全托管的分离的存储和计算ClickHouse服务，运行在Google Compute和Google Cloud Storage之上
- 在爱荷华州（us-central1）、荷兰（europe-west4）和新加坡（asia-southeast1）地区可用
- 在所有三个初始区域支持开发和生产服务
- 默认提供强大的安全性：传输中的端到端加密、静态数据加密、IP允许列表
### 集成变更 {#integrations-changes-18}
- Golang客户端：增加代理环境变量支持
- Grafana：在Grafana数据源设置中增加自定义ClickHouse设置和代理环境变量的能力
- Kafka连接器：改进对空记录的处理
### 控制台变更 {#console-changes-18}
- 在用户列表中增加多因素认证（MFA）使用的指示器
### 性能和可靠性 {#performance-and-reliability-1}
- 增加了对管理员终止查询权限的更细粒度控制
## 2023年5月4日 {#may-4-2023}

此版本带来了新的热图图表类型，改善了账单使用页面，并改善了服务启动时间。
### 控制台变更 {#console-changes-19}
- 为SQL控制台增加热图图表类型
- 改进了账单使用页面，以显示每个账单维度内消耗的信用
### 集成变更 {#integrations-changes-19}
- Kafka连接器：增加临时连接错误的重试机制
- Python客户端：增加max_connection_age设置，以确保HTTP连接不会无限期重用。这有助于解决某些负载均衡问题
- Node.js客户端：增加对Node.js v20的支持
- Java客户端：改善客户端证书认证支持，并增加对嵌套Tuple/Map/嵌套类型的支持
### 性能和可靠性 {#performance-and-reliability-2}
- 在存在大量parts的情况下改善服务启动时间
- 优化SQL控制台中的长时间运行查询取消逻辑
### 错误修复 {#bug-fixes}
- 修复了导致‘Cell Towers’样本数据集导入失败的错误
## 2023年4月20日 {#april-20-2023}

此版本将ClickHouse版本更新至23.3，显著提高了冷读速度，并提供实时聊天支持。
### 控制台变更 {#console-changes-20}
- 增加实时聊天与支持的选项
### 集成变更 {#integrations-changes-20}
- Kafka连接器：增加对可空类型的支持
- Golang客户端：增加对外部表的支持，支持布尔和指针类型参数绑定
### 配置变更 {#configuration-changes}
- 增加通过覆盖`max_table_size_to_drop`和`max_partition_size_to_drop`设置删除大型表的能力
### 性能和可靠性 {#performance-and-reliability-3}
- 通过设置`allow_prefetched_read_pool_for_remote_filesystem`来提高冷读速度
### ClickHouse 23.3版本升级 {#clickhouse-233-version-upgrade}
- 轻量级删除已准备好生产环境–详见23.3发布 [博客](https://clickhouse.com/blog/clickhouse-release-23-03)了解详细信息
- 增加对多阶段PREWHERE的支持–详见23.2发布 [博客](https://clickhouse.com/blog/clickhouse-release-23-03)了解详细信息
- 数十项新功能、性能改进和错误修复–详见详细的[变更日志](/whats-new/changelog/index.md)以获取23.3和23.2
## 2023年4月6日 {#april-6-2023}

此版本带来了获取云端点的API、最小空闲超时的高级扩展控制以及对Python客户端查询方法中外部数据的支持。
### API变更 {#api-changes}
* 增加通过[Cloud Endpoints API](//cloud/get-started/query-endpoints.md)以编程方式查询ClickHouse Cloud端点的能力
### 控制台变更 {#console-changes-21}
- 在高级扩展设置中增加‘最低空闲超时’设置
- 在数据加载模态中增加最佳努力的日期时间检测以推断架构
### 集成变更 {#integrations-changes-21}
- [Metabase](/integrations/data-visualization/metabase-and-clickhouse.md)：增加对多个模式的支持
- [Go客户端](/integrations/language-clients/go/index.md)：修复TLS连接的空闲连接存活检查
- [Python客户端](/integrations/language-clients/python/index.md)
  - 增加在查询方法中对外部数据的支持
  - 增加查询结果的时区支持
  - 增加对`no_proxy` / `NO_PROXY`环境变量的支持
  - 修复对可空类型的NULL值的服务器端参数绑定
### 错误修复 {#bug-fixes-1}
* 修复了在SQL控制台运行`INSERT INTO … SELECT …`时错误地将相同的行限制应用到选择查询的问题
## 2023年3月23日 {#march-23-2023}

此版本带来了数据库密码复杂性规则，显著加快了恢复大型备份的速度，并支持在Grafana Trace View中显示跟踪。
### 安全性和可靠性 {#security-and-reliability}
- 核心数据库端点现在强制执行密码复杂性规则
- 改善恢复大型备份的时间
### 控制台变更 {#console-changes-22}
- 精简入职流程，引入新默认值和更紧凑的视图
- 减少注册和登录延迟
### 集成变更 {#integrations-changes-22}
- Grafana：
  - 增加支持在Trace View中显示存储在ClickHouse中的跟踪数据
  - 改进时区过滤器，增加对表名中特殊字符的支持
- Superset：增加对ClickHouse的原生支持
- Kafka Connect Sink：增加自动日期转换和Null列处理
- Metabase：实现与v0.46的兼容
- Python客户端：修复临时表的插入并增加对Pandas Null的支持
- Golang客户端：标准化带时区的日期类型
- Java客户端
  - 增加对压缩、infile和outfile关键字的SQL解析支持
  - 增加凭据重载
  - 修复与`ON CLUSTER`的批量支持
- Node.js客户端
  - 增加对JSONString、JSONCompact、JSONCompactStrings、带元数据的JSONColumns格式的支持
  - 现在可以为所有主客户端方法提供`query_id`
### 错误修复 {#bug-fixes-2}
- 修复了导致新服务的初始配置和启动时间较长的错误
- 修复了由于缓存配置错误导致的查询性能下降的错误
## 2023年3月9日 {#march-9-2023}

此版本改善了可观察性仪表板，优化了创建大型备份的时间，并增加了删除大型表和分区所需的配置。
### 控制台变更 {#console-changes-23}
- 增加高级可观察性仪表板（预览）
- 在可观察性仪表板中引入内存分配图表
- 改善SQL控制台电子表格视图中的间距和换行处理
### 可靠性和性能 {#reliability-and-performance}
- 优化了备份调度，仅在数据修改时运行备份
- 改善完成大型备份的时间
### 配置变更 {#configuration-changes-1}
- 增加通过覆盖查询或连接级别的设置`max_table_size_to_drop`和`max_partition_size_to_drop`来增加删除表和分区的限制的能力
- 在查询日志中增加源IP，以实现基于源IP的配额和访问控制执行
### 集成 {#integrations}
- [Python客户端](/integrations/language-clients/python/index.md)：改善对Pandas的支持，修复与时区相关的问题
- [Metabase](/integrations/data-visualization/metabase-and-clickhouse.md)：与Metabase 0.46.x兼容，支持SimpleAggregateFunction
- [Kafka-Connect](/integrations/data-ingestion/kafka/index.md)：隐式日期转换，更好处理空列
- [Java客户端](https://github.com/ClickHouse/clickhouse-java)：对Java映射的嵌套转换
## 2023年2月23日 {#february-23-2023}

此版本启用了ClickHouse 23.1核心版本的部分功能，带来了与Amazon Managed Streaming for Apache Kafka (MSK)的互操作性，并在活动日志中暴露了高级扩展和空闲调整。
### ClickHouse 23.1版本升级 {#clickhouse-231-version-upgrade}

增加对ClickHouse 23.1部分功能的支持，例如：
- 带Map类型的ARRAY JOIN
- SQL标准十六进制和二进制文字
- 新函数，包括`age()`、`quantileInterpolatedWeighted()`、`quantilesInterpolatedWeighted()`
- 能够在`generateRandom`中使用插入表的结构而不带参数
- 改进了数据库创建和重命名逻辑，允许重用以前的名称
- 有关更多详细信息，请查看23.1发布 [网络研讨会幻灯片](https://presentations.clickhouse.com/release_23.1/#cover)和[23.1发布变更日志](/whats-new/cloud#clickhouse-231-version-upgrade)。
### 集成变更 {#integrations-changes-23}
- [Kafka-Connect](/integrations/data-ingestion/kafka/index.md)：增加对Amazon MSK的支持
- [Metabase](/integrations/data-visualization/metabase-and-clickhouse.md)：第一个稳定版本1.0.0
  - 使连接器可在[Metabase Cloud](https://www.metabase.com/start/)上使用
  - 增加探索所有可用数据库的功能
  - 修复与AggregationFunction类型的同步
- [DBT-clickhouse](/integrations/data-ingestion/etl-tools/dbt/index.md)：增加对最新DBT版本v1.4.1的支持
- [Python客户端](/integrations/language-clients/python/index.md)：改善代理和ssh隧道支持；增加了一些修复和对Pandas DataFrames的性能优化
- [Nodejs客户端](/integrations/language-clients/js.md)：发布了将`query_id`附加到查询结果的能力，可以用于从`system.query_log`检索查询指标
- [Golang客户端](/integrations/language-clients/go/index.md)：优化与ClickHouse Cloud的网络连接
### 控制台变更 {#console-changes-24}
- 在活动日志中增加高级扩展和空闲设置调整
- 在重置密码电子邮件中增加用户代理和IP信息
- 改善Google OAuth的注册流程机制
### 可靠性和性能 {#reliability-and-performance-1}
- 加快了大服务从空闲恢复的时间
- 改善了大型表和分区服务的读取延迟
### 错误修复 {#bug-fixes-3}
- 修复了重置服务密码未遵循密码政策的行为
- 使组织邀请电子邮件验证不区分大小写
## 2023年2月2日 {#february-2-2023}

此版本带来了官方支持的Metabase集成、主要的Java客户端/JDBC驱动程序发布，以及对SQL控制台中的视图和物化视图的支持。
### 集成变更 {#integrations-changes-24}
- [Metabase](/integrations/data-visualization/metabase-and-clickhouse.md)插件：成为ClickHouse维护的官方解决方案
- [dbt](/integrations/data-ingestion/etl-tools/dbt/index.md)插件：增加对[多线程](https://github.com/ClickHouse/dbt-clickhouse/blob/main/CHANGELOG.md)的支持
- [Grafana](/integrations/data-visualization/grafana/index.md)插件：更好地处理连接错误
- [Python](/integrations/language-clients/python/index.md)客户端：为插入操作提供[流式支持](/integrations/language-clients/python/index.md#streaming-queries)
- [Go](/integrations/language-clients/go/index.md)客户端：修复[错误](https://github.com/ClickHouse/clickhouse-go/blob/main/CHANGELOG.md)：关闭已取消的连接，更好地处理连接错误
- [JS](/integrations/language-clients/js.md)客户端：在exec/insert中[重大变更](https://github.com/ClickHouse/clickhouse-js/releases/tag/0.0.12)；在返回类型中公开query_id
- [Java](https://github.com/ClickHouse/clickhouse-java#readme)客户端/JDBC驱动程序重大发布
  - [重大变更](https://github.com/ClickHouse/clickhouse-java/releases)：弃用了的方法、类和包被删除
  - 增加对R2DBC驱动程序和文件插入的支持
### 控制台变更 {#console-changes-25}
- 在SQL控制台中增加了对视图和物化视图的支持
### 性能和可靠性 {#performance-and-reliability-4}
- 加快了对已停止/空闲实例的密码重置
- 改善了通过更精准的活动跟踪降低规模的行为
- 修复了SQL控制台CSV导出被截断的bug
- 修复了导致样本数据上传失败的间歇性bug
## 2023年1月12日 {#january-12-2023}

此版本将ClickHouse版本更新至22.12，为许多新的来源启用字典，并改善查询性能。
### 一般变更 {#general-changes-3}
- 为额外来源启用字典，包括外部ClickHouse、Cassandra、MongoDB、MySQL、PostgreSQL和Redis
### ClickHouse 22.12版本升级 {#clickhouse-2212-version-upgrade}
- 扩展JOIN支持，包括Grace Hash Join
- 增加对读取文件的二进制JSON (BSON)支持
- 增加对GROUP BY ALL标准SQL语法的支持
- 新的数学函数用于固定精度的小数操作
- 有关完整变化列表，请参见[22.12发布博客](https://clickhouse.com/blog/clickhouse-release-22-12)和[详细22.12变更日志](/whats-new/cloud#clickhouse-2212-version-upgrade)
### 集成更改 {#integrations-changes-25}
- DBT 版本 [v1.3.2](https://github.com/ClickHouse/dbt-clickhouse/blob/main/CHANGELOG.md#release-132-2022-12-23)
  - 增加对 delete+insert 增量策略的实验性支持
  - 新的 s3source 宏
- Python 客户端 [v0.4.8](https://github.com/ClickHouse/clickhouse-connect/blob/main/CHANGELOG.md#048-2023-01-02)
  - 文件插入支持
  - 服务器端查询 [参数绑定](/interfaces/cli.md/#cli-queries-with-parameters)
- Go 客户端 [v2.5.0](https://github.com/ClickHouse/clickhouse-go/releases/tag/v2.5.0)
  - 降低了压缩的内存使用
  - 服务器端查询 [参数绑定](/interfaces/cli.md/#cli-queries-with-parameters)

### 可靠性和性能 {#reliability-and-performance-2}
- 改进了针对对象存储上获取大量小文件的查询的读取性能
- 将 [兼容性](/operations/settings/settings#compatibility) 设置为服务最初启动时的版本，适用于新启动的服务

### Bug 修复 {#bug-fixes-4}
使用高级缩放滑块保留资源现在立即生效。

## 2022年12月20日 {#december-20-2022}
此版本为管理员引入了无缝登录 SQL 控制台、改进的冷读性能以及改进的 ClickHouse Cloud 的 Metabase 连接器。

### 控制台更改 {#console-changes-27}
- 为管理员用户启用了无缝访问 SQL 控制台
- 将新邀请者的默认角色更改为“管理员”
- 添加了入职调查

### 可靠性和性能 {#reliability-and-performance-3}
- 为长时间运行的插入查询添加了重试逻辑，以便在网络故障的情况下恢复
- 改进了冷读的读取性能

### 集成更改 {#integrations-changes-26}
- [Metabase 插件](/integrations/data-visualization/metabase-and-clickhouse.md) 进行了期待已久的 v0.9.1 重大更新。现在它与最新的 Metabase 版本兼容，并经过彻底测试以适配 ClickHouse Cloud。

## 2022年12月6日 - 一般可用性 {#december-6-2022---general-availability}
ClickHouse Cloud 现在已具备生产准备，符合 SOC2 Type II 合规性，提供生产工作负载的正常运行时间 SLA，以及公开的状态页面。此版本包含像 AWS 市场集成、SQL 控制台-ClickHouse 用户的数据探索工作台，以及 ClickHouse 学院-ClickHouse Cloud 的自学课程等重要新功能。在这个 [博客](https://clickhouse.com/blog/clickhouse-cloud-generally-available) 中了解更多信息。

### 生产就绪 {#production-ready}
- SOC2 Type II 合规性（详细信息见 [博客](https://clickhouse.com/blog/clickhouse-cloud-is-now-soc-2-type-ii-compliant) 和 [信任中心](https://trust.clickhouse.com/)）
- ClickHouse Cloud 的公共 [状态页面](https://status.clickhouse.com/)
- 针对生产用例的正常运行时间 SLA 可用
- 在 [AWS 市场](https://aws.amazon.com/marketplace/pp/prodview-jettukeanwrfc) 上可用

### 重大新功能 {#major-new-capabilities}
- 引入 SQL 控制台，ClickHouse 用户的数据探索工作台
- 启动 [ClickHouse 学院](https://learn.clickhouse.com/visitor_class_catalog)，在 ClickHouse Cloud 中自学

### 定价和计量更改 {#pricing-and-metering-changes}
- 将试用期延长至 30 天
- 引入固定容量、低月支出的开发服务，适合初学项目和开发/阶段环境
- 在生产服务上引入新的降价，因为我们继续改进 ClickHouse Cloud 的操作和扩展方式
- 改进了计量计算时的粒度和准确性

### 集成更改 {#integrations-changes-27}
- 启用了对 ClickHouse Postgres / MySQL 集成引擎的支持
- 增加了对 SQL 用户自定义函数（UDFs）的支持
- 高级 Kafka Connect sink 达到 Beta 状态
- 通过引入关于版本、更新状态等丰富的元数据改进集成 UI

### 控制台更改 {#console-changes-28}
- 云控制台中的多因素身份验证支持
- 改善移动设备的云控制台导航

### 文档更改 {#documentation-changes}
- 为 ClickHouse Cloud 引入专门的 [文档](/cloud/overview) 部分

### Bug 修复 {#bug-fixes-5}
- 解决了已知问题，即由于依赖关系解析，恢复备份不总是有效。

## 2022年11月29日 {#november-29-2022}
此版本带来了 SOC2 Type II 合规性，将 ClickHouse 版本更新为 22.11，并改进了多款 ClickHouse 客户端和集成。

### 一般更改 {#general-changes-4}
- 达到了 SOC2 Type II 合规性（详细信息见 [博客](https://clickhouse.com/blog/clickhouse-cloud-is-now-soc-2-type-ii-compliant) 和 [信任中心](https://trust.clickhouse.com)）

### 控制台更改 {#console-changes-29}
- 添加了“空闲”状态指示器，以显示服务已自动暂停

### ClickHouse 22.11 版本升级 {#clickhouse-2211-version-upgrade}
- 增加对 Hudi 和 DeltaLake 表引擎和表函数的支持
- 改进了 S3 的递归目录遍历
- 增加了对复合时间间隔语法的支持
- 改进了插入的可靠性，增加了插入时的重试
- 请参阅 [详细的 22.11 更改日志](/whats-new/cloud#clickhouse-2211-version-upgrade) 获取完整更改列表

### 集成 {#integrations-1}
- Python 客户端：v3.11 支持，改进的插入性能
- Go 客户端：修复 DateTime 和 Int64 支持
- JS 客户端：支持相互 SSL 验证
- dbt-clickhouse：支持 DBT v1.3

### Bug 修复 {#bug-fixes-6}
- 修复了一个在升级后显示过时 ClickHouse 版本的错误
- 更改“默认”帐户的授权不再中断会话
- 新创建的非管理员帐户默认不再具有系统表访问权限

### 本次发布的已知问题 {#known-issues-in-this-release}
- 由于依赖关系解析，恢复备份可能无法工作

## 2022年11月17日 {#november-17-2022}
此版本启用了来自本地 ClickHouse 表和 HTTP 源的字典，支持孟买地区，并改善了云控制台用户体验。

### 一般更改 {#general-changes-5}
- 添加了来自本地 ClickHouse 表和 HTTP 源的 [字典](/sql-reference/dictionaries/index.md) 支持
- 引入对孟买 [地区](/cloud/reference/supported-regions.md) 的支持

### 控制台更改 {#console-changes-30}
- 改进了账单发票格式
- 简化了支付方式捕捉的用户界面
- 为备份活动添加了更详细的日志记录
- 改善了文件上传时的错误处理

### Bug 修复 {#bug-fixes-7}
- 修复了一个如果某些分区中存在单个大文件可能导致备份失败的错误
- 修复了一个如果同时应用访问列表更改，恢复备份未能成功的错误

### 已知问题 {#known-issues}
- 由于依赖关系解析，恢复备份可能无法工作

## 2022年11月3日 {#november-3-2022}
此版本从定价中删除了读写单位（有关详细信息，请参见 [定价页面](https://clickhouse.com/pricing)），将 ClickHouse 版本更新为 22.10，为自助客户添加了更高的垂直扩展支持，并通过更好的默认值提高了可靠性。

### 一般更改 {#general-changes-6}
- 从定价模型中删除了读/写单位

### 配置更改 {#configuration-changes-2}
- 由于稳定性原因，用户不再能更改 `allow_suspicious_low_cardinality_types`、`allow_suspicious_fixed_string_types` 和 `allow_suspicious_codecs`（默认为 false）的设置。

### 控制台更改 {#console-changes-31}
- 将自助服务的最大垂直扩展提高到 720GB 内存，适用于付费客户
- 改进了恢复备份工作流，以设置 IP 访问列表规则和密码
- 在服务创建对话框中引入 GCP 和 Azure 的候补名单
- 改善文件上传时的错误处理
- 改进了账单管理的工作流程

### ClickHouse 22.10 版本升级 {#clickhouse-2210-version-upgrade}
- 改进了在对象存储上的合并，放宽了在存在许多大分区（至少 10 GiB）时的“分区过多”阈值。这使得单个表的单个分区中可以容纳多达几个 PB 的数据。
- 通过 `min_age_to_force_merge_seconds` 设置增加了对合并的控制，以在达到特定时间阈值后进行合并。
- 增加了 MySQL 兼容语法用于重置设置 `SET setting_name = DEFAULT`。
- 增加了用于 Morton 曲线编码、Java 整数哈希和随机数生成的函数。
- 请参阅 [详细的 22.10 更改日志](/whats-new/cloud#clickhouse-2210-version-upgrade) 获取完整更改列表。

## 2022年10月25日 {#october-25-2022}
此版本显著降低了小工作负载的计算消耗，降低了计算定价（有关详细信息，请参见 [定价](https://clickhouse.com/pricing) 页面），通过更好的默认设置提高了稳定性，增强了 ClickHouse Cloud 控制台中的计费和使用视图。

### 一般更改 {#general-changes-7}
- 将最小服务内存分配减少至 24G
- 将服务空闲超时从 30 分钟减少至 5 分钟

### 配置更改 {#configuration-changes-3}
- 将 max_parts_in_total 从 100k 降低到 10k。MergeTree 表的 `max_parts_in_total` 设置的默认值已从 100,000 降低至 10,000。此更改的原因是我们观察到大量的数据分区可能导致云中的服务启动时间缓慢。大量的分区通常表明分区键选择过于细粒度，这通常是偶然造成的，应该避免。默认值的变化将允许更早地检测到这些情况。

### 控制台更改 {#console-changes-32}
- 为试用用户增强了计费视图中的信用使用详细信息
- 改进了工具提示和帮助文本，并在使用视图中添加了指向定价页面的链接
- 改进了切换 IP 过滤选项时的工作流程
- 为云控制台添加了重新发送电子邮件确认按钮

## 2022年10月4日 - 测试版 {#october-4-2022---beta}
ClickHouse Cloud 于 2022 年 10 月 4 日开始公开测试版。了解更多信息，请参阅此 [博客](https://clickhouse.com/blog/clickhouse-cloud-public-beta)。

ClickHouse Cloud 版本基于 ClickHouse 核心 v22.10。有关兼容功能的列表，请参阅 [云兼容性](/cloud/reference/cloud-compatibility.md) 指南。
