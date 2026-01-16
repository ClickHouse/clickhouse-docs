---
slug: /whats-new/cloud
sidebar_label: 'Cloud 更新日志'
title: 'Cloud 更新日志'
description: 'ClickHouse Cloud 更新日志，介绍每个 ClickHouse Cloud 发布版本中的新内容与变更'
doc_type: '更新日志'
keywords: ['更新日志', '发行说明', '更新', '新功能', 'Cloud 变更']
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
import dashboards from '@site/static/images/cloud/reference/may-30-dashboards.png';

除了本 ClickHouse Cloud 更新日志之外，请参阅 [Cloud Compatibility](/whats-new/cloud-compatibility) 页面。

:::tip[自动保持最新！]

<a href="/docs/cloud/changelog-rss.xml">
  通过 RSS 订阅 Cloud 更新日志
</a>

:::


## 2025 年 12 月 19 日 \{#december-19-2025\}

- AWS ap-south-1 现在支持部署符合 PCI 标准的服务。
- **统一用户身份功能私有预览**
  有兴趣通过控制台管理数据库用户的客户，现在可以为 SQL 控制台启用一种新的身份验证方法。
  这使客户能够在我们继续将数据库用户管理功能引入控制台的同时，抢先试用新的身份验证方式。
- **S3 ClickPipes 现已支持无序模式（Unordered mode）**：
  客户现在可以以任意顺序从 Amazon S3 摄取数据到 ClickHouse Cloud，用于事件驱动型分析。
  文件不再需要按字典序排列即可被读取。更多详情请参阅公告[博客](https://clickhouse.com/blog/clickpipes-s3-unordered-mode)。
- Fivetran 连接器最近已进入 beta 阶段。如果您在使用 Fivetran，并希望将 ClickHouse 配置为目标端，请查看这些[文档](https://fivetran.com/docs/destinations/clickhouse/setup-guide)。

## 2025 年 12 月 12 日 \{#december-12-2025\}

- **SAML SSO 自助配置**

  企业客户现在可以在控制台中自助完成 SAML 配置，而无需提交支持工单。
  此外，SAML 客户可以设置一个默认角色，该角色将自动分配给通过其身份提供商添加的新用户，并配置自定义会话超时时长。
  如需了解更多信息，请查阅我们的[文档](/cloud/security/saml-setup)。
- **Azure 中的最大副本大小和扩缩容限制**  

  客户现在可以在所有 Azure 区域（`eastus2` 除外）将最大副本大小设置为 356 GiB；在 `eastus2` 区域，可用的最大副本大小为 120 GiB。

## 2025 年 11 月 21 日 \{#november-21-2025\}

- ClickHouse Cloud 现已在 **AWS Israel（特拉维夫）— il-central-1** 区域提供。
- 改进了在 Marketplace 中创建 ClickHouse 组织并将其计入 Marketplace 按需订阅或私有优惠的接入体验。

## 2025 年 11 月 14 日 \{#november-14-2025\}

- 我们很高兴地宣布，**ClickHouse Cloud** 现已在**两个新的公共区域**上线：
  - **GCP 日本区域 (asia-northeast1)**
  - **AWS 首尔区域（亚太地区, ap-northeast-2）** —— 现在在 **ClickPipes** 中也已支持

  这些区域此前仅作为**私有区域**提供，现已对**所有用户开放**。
- Terraform 和 API 现在支持为服务添加标签，并按标签筛选服务。

## 2025 年 11 月 7 日 \{#november-7-2025\}

- 现在可以在 ClickHouse Cloud 控制台中以 1 vCPU、4 GiB 为步长配置副本规格。
  这些选项既适用于创建新服务时，也适用于在设置页面上配置副本的最小和最大规格时。
- 自定义硬件配置（在 Enterprise 版本中可用）现在支持空闲模式。
- ClickHouse Cloud 现在通过 AWS Marketplace 提供更简化的购买体验，分别提供[按需付费](https://aws.amazon.com/marketplace/pp/prodview-p4gwofrqpkltu?sr=0-2&ref_=beagle&applicationId=AWSMPContessa)和[承诺支出合约](https://aws.amazon.com/marketplace/pp/prodview-4qyeihstyym2s?sr=0-3&ref_=beagle&applicationId=AWSMPContessa)选项。
- ClickHouse Cloud 中的 ClickStack 用户现在可以使用告警功能。
  用户可以直接在 HyperDX UI 中创建和管理针对日志、指标和追踪的告警，无需额外设置、额外基础设施或服务，也无需任何配置。告警可集成到 Slack、PagerDuty 等系统。
  更多信息参见[告警文档](/use-cases/observability/clickstack/alerts)。

## 2025 年 10 月 17 日 \{#october-17-2025\}

- **服务监控 - 资源使用率仪表板**  
  CPU 使用率和内存使用率指标的展示方式将从显示平均值改为在特定时间段内显示最大使用率指标，以更好地识别资源配置不足的情况。
  此外，CPU 使用率指标将显示一个 Kubernetes 级别的 CPU 使用率指标，更加贴近 ClickHouse Cloud 自动伸缩器使用的指标。 
- **外部存储桶**  
  ClickHouse Cloud 现在支持将备份直接导出到您自己的云服务提供商账户中。
  连接您的外部存储桶（AWS S3、Google Cloud Storage 或 Azure Blob Storage），以便更好地掌控备份管理。

## 2025 年 8 月 29 日 \{#august-29-2025\}

- [ClickHouse Cloud Azure Private Link](/cloud/security/azure-privatelink) 已从使用 Resource GUID 过滤器进行资源标识切换为使用 Resource ID 过滤器。您仍然可以继续使用具备向后兼容性的旧版 Resource GUID，但我们建议迁移到 Resource ID 过滤器。有关迁移的详细信息，请参阅 Azure Private Link 的[文档](/cloud/security/azure-privatelink#obtaining-private-endpoint-resourceid)。

## 2025年8月22日 \{#august-22-2025\}

- **ClickHouse Connector for AWS Glue**  
  现在可以使用官方的 [ClickHouse Connector for AWS Glue](/integrations/glue)，该连接器可从 [AWS Marketplace](https://aws.amazon.com/marketplace/pp/prodview-eqvmuopqzdg7s) 获取。它利用 AWS Glue 基于 Apache Spark 的无服务器引擎，实现 ClickHouse 与其他数据源之间的数据抽取、转换和加载集成。请参阅公告[博客文章](http://clickhouse.com/blog/clickhouse-connector-aws-glue)，了解如何创建表，以及在 ClickHouse 与 Spark 之间写入和读取数据。
- **服务副本数最小值的变更**  
  已扩容的服务现在可以[缩容](/manage/scaling)为单个副本（之前最少为 2 个副本）。注意：单副本服务的可用性较低，不建议用于生产环境。
- ClickHouse Cloud 将开始默认向管理员角色发送与服务扩缩容和服务版本升级相关的通知。您可以在通知设置中调整这些通知偏好。

## 2025 年 8 月 13 日 \{#august-13-2025\}

- **面向 MongoDB CDC 的 ClickPipes 现已进入私有预览阶段**
  现在可以通过 ClickPipes 只需几次点击就将 MongoDB 中的数据复制到 ClickHouse Cloud，实现
  实时分析，而无需依赖外部 ETL 工具。该连接器支持持续复制和一次性迁移，并兼容 MongoDB Atlas 以及自托管的 MongoDB
  部署。请阅读这篇[博客文章](https://clickhouse.com/blog/mongodb-cdc-clickhouse-preview)了解 MongoDB CDC 连接器的概览，并[在此注册抢先体验](https://clickhouse.com/cloud/clickpipes/mongodb-cdc-connector)！ 

## 2025 年 8 月 8 日 \{#august-08-2025\}

- **通知**：当你的服务开始升级到新的 ClickHouse 版本时，你现在会在 UI 中收到通知。可以通过通知中心添加额外的电子邮件和 Slack 通知。
- **ClickPipes**：已经在 ClickHouse Terraform 提供程序中添加了对 Azure Blob Storage (ABS) ClickPipes 的支持。请参阅该提供程序文档，了解如何以编程方式创建 ABS ClickPipe 的示例。
  - [Bug 修复] 使用 Null 引擎向目标表写入的对象存储 ClickPipes 现在会在 UI 中报告 "Total records" 和 "Data ingested" 指标。
  - [Bug 修复] UI 中用于指标的 "Time period" 选择器此前无论选择何种时间范围，都会默认设置为 "24 hours"。该问题现已修复，UI 会根据所选时间范围正确更新图表。
- **跨区域 PrivateLink（AWS）** 现已正式发布（GA）。支持区域列表请参阅[文档](/manage/security/aws-privatelink)。

## 2025 年 7 月 31 日 \{#july-31-2025\}

**ClickPipes 纵向扩展现已可用**

[面向流式 ClickPipes 的纵向扩展现已可用](https://clickhouse.com/blog/clickpipes-flexible-scaling-monitoring)。  
通过这一特性，你现在不仅可以控制副本数量（横向扩展），还可以控制每个副本的资源规模（纵向扩展）。每个 ClickPipe 的详情页面现在还包含按副本划分的 CPU 和内存使用情况，这有助于你更好地理解工作负载，并更有信心地规划规格调整和扩容操作。

## 2025 年 7 月 24 日 \{#july-24-2025\}

**用于 MySQL CDC 的 ClickPipes 现已公开测试**

ClickPipes 中的 MySQL CDC 连接器现已面向所有用户开放公测。只需简单几次点击，
即可在没有任何外部依赖的情况下，将 MySQL（或 MariaDB）数据实时直接复制到 ClickHouse Cloud。
阅读[博客文章](https://clickhouse.com/blog/mysql-cdc-connector-clickpipes-beta)
以了解该连接器的整体概况，并按照[快速入门](https://clickhouse.com/docs/integrations/clickpipes/mysql)
快速开始使用。

## July 11, 2025 \{#june-11-2025\}

- 新服务现在会将数据库和表的元数据存储在中心化的 **SharedCatalog** 中，
  这是一种用于协调和管理对象生命周期的新模型，可实现：
  - **云规模的 DDL**，即使在高并发下也能正常运行
  - **更可靠的删除和新增 DDL 操作**
  - **快速启动和唤醒**，因为无状态节点现在在启动时不再依赖本地磁盘
  - **覆盖原生与开放格式的无状态计算**，包括 Iceberg 和 Delta Lake
  
  在我们的[博客](https://clickhouse.com/blog/clickhouse-cloud-stateless-compute)中了解更多关于 SharedCatalog 的信息

- 我们现在支持在 GCP `europe-west4` 中启动符合 HIPAA 合规要求的服务

## 2025 年 6 月 27 日 \{#june-27-2025\}

- 我们现在正式支持用于管理数据库权限的 Terraform provider，该 provider 也兼容自管理部署。请参阅
  [博客](https://clickhouse.com/blog/new-terraform-provider-manage-clickhouse-database-users-roles-and-privileges-with-code)
  和我们的 [文档](https://registry.terraform.io/providers/ClickHouse/clickhousedbops/latest/docs)
  了解更多信息。
- Enterprise 级服务现在可以加入 [慢速发布通道](/manage/updates/#slow-release-channel-deferred-upgrades)，在常规版本发布后将升级延后两周，以便预留更多测试时间。

## 2025 年 6 月 13 日 \{#june-13-2025\}

- 我们很高兴宣布 ClickHouse Cloud Dashboards 现已正式向所有用户开放。Dashboards 允许用户在仪表板中可视化查询结果，通过筛选器和查询参数与数据交互，并管理共享设置。
- API 密钥 IP 过滤：我们正在为你与 ClickHouse Cloud 的交互引入额外一层防护。在生成 API 密钥时，你可以设置 IP 允许列表，以限制该 API 密钥可被使用的来源地址。有关详细信息，请参阅[文档](https://clickhouse.com/docs/cloud/security/setting-ip-filters)。 

## 2025 年 5 月 30 日 \{#may-30-2025\}

- 我们很高兴宣布 **ClickPipes for Postgres CDC** 在 ClickHouse Cloud 中正式全面可用。只需几次点击，您就可以复制 Postgres
  数据库，并解锁极速、实时的分析能力。该连接器提供更快的数据同步、低至几秒的延迟、自动模式变更、
  安全可靠的连接等能力。更多信息请参阅
  [博客](https://clickhouse.com/blog/postgres-cdc-connector-clickpipes-ga)。如需开始使用，请参考[此处](https://clickhouse.com/docs/integrations/clickpipes/postgres)的说明。

- 我们对 SQL 控制台仪表板进行了改进：
  - 共享：您可以与团队成员共享仪表板。支持四种访问级别，可在全局和按用户维度进行调整：
    - _写入访问（Write access）_：添加/编辑可视化、刷新设置，并通过筛选器与仪表板交互。
    - _所有者（Owner）_：共享仪表板、删除仪表板，以及拥有“写入访问”用户的所有权限。
    - _只读访问（Read-only access）_：通过筛选器查看并与仪表板交互。
    - _无访问（No access）_：无法查看仪表板。
  - 对于已经创建的现有仪表板，组织管理员可以将这些仪表板指派给自己作为所有者。
  - 您现在可以在查询视图中，将 SQL 控制台中的表或图表添加到某个仪表板。

<Image img={dashboards} size="md" alt="仪表板改进" border />

- 我们正在为 AWS 和 GCP 征集 [Distributed cache](https://clickhouse.com/cloud/distributed-cache-waitlist)
  预览体验参与者。更多内容请阅读[博客](https://clickhouse.com/blog/building-a-distributed-cache-for-s3)。

## 2025 年 5 月 16 日 \{#may-16-2025\}

- 引入了资源利用率仪表板，用于查看 ClickHouse Cloud 中某个服务所使用的资源。以下指标从系统表中采集，并显示在该仪表板上：
  * 内存和 CPU：`CGroupMemoryTotal`（已分配内存）、`CGroupMaxCPU`（已分配 CPU）、`MemoryResident`（已使用内存）以及 `ProfileEvent_OSCPUVirtualTimeMicroseconds`（已使用 CPU）的图表
  * 数据传输：展示 ClickHouse Cloud 入站与出站数据传输的图表。了解更多内容请查看[此处](/cloud/manage/network-data-transfer)。
- 我们很高兴地宣布全新的 ClickHouse Cloud Prometheus/Grafana mix-in 正式发布，
  它旨在简化对 ClickHouse Cloud 服务的监控。
  该 mix-in 使用与 Prometheus 兼容的 API 端点，将 ClickHouse 指标无缝集成到您现有的 Prometheus 和 Grafana 环境中。它包含
  一个预配置的仪表板，为您提供服务健康状况和性能的实时可观测性。更多信息请参阅发布[博客](https://clickhouse.com/blog/monitor-with-new-prometheus-grafana-mix-in)。

## 2025 年 4 月 18 日 \{#april-18-2025\}

- 引入了一个新的组织级角色 **Member**，以及两个新的服务级角色：**Service Admin** 和 **Service Read Only**。
  **Member** 是一个组织级角色，默认分配给 SAML SSO 用户，只提供登录和更新个人资料的能力。可以将一个或多个服务的 **Service Admin** 和 **Service Read Only** 角色分配给具有 **Member**、**Developer** 或 **Billing Admin** 角色的用户。更多信息请参见 ["Access control in ClickHouse Cloud"](https://clickhouse.com/docs/cloud/security/cloud-access-management/overview)。
- ClickHouse Cloud 现在在以下区域为 **Enterprise** 客户提供符合 **HIPAA** 和 **PCI** 的服务：
  AWS eu-central-1、AWS eu-west-2、AWS us-east-2。
- 引入了 **面向用户的 ClickPipes 通知功能**。此功能会通过电子邮件、ClickHouse Cloud UI 和 Slack 自动发送 ClickPipes 故障告警。通过电子邮件和 UI 的通知默认启用，并可按每条管道单独配置。对于 **Postgres CDC ClickPipes**，告警还涵盖复制槽阈值（可在 **Settings** 选项卡中配置）、特定错误类型，以及自助解决故障的步骤。
- **MySQL CDC 私有预览** 现已开放。借助该功能，客户只需几次点击即可将 MySQL 数据库复制到 ClickHouse Cloud，从而支持快速分析并消除对外部 ETL 工具的需求。该连接器支持持续复制和一次性迁移，无论 MySQL 部署在云端（RDS、Aurora、Cloud SQL、Azure 等）还是本地数据中心。可[通过此链接](https://clickhouse.com/cloud/clickpipes/mysql-cdc-connector)注册私有预览。
- 引入了 **适用于 ClickPipes 的 AWS PrivateLink**。可以使用 AWS PrivateLink 在 VPC、AWS 服务、本地系统与 ClickHouse Cloud 之间建立安全连接，在从 Postgres、MySQL 和 AWS 上的 MSK 等数据源传输数据时，无需将流量暴露到公共互联网。它还通过 VPC 服务端点支持跨区域访问。PrivateLink 连接的配置现在可以通过 ClickPipes [完全自助完成](https://clickhouse.com/docs/integrations/clickpipes/aws-privatelink)。

## 2025 年 4 月 4 日 \{#april-4-2025\}

- ClickHouse Cloud 的 Slack 通知：除了控制台内通知和电子邮件通知之外，ClickHouse Cloud 现已支持针对计费、伸缩以及 ClickPipes 事件的 Slack 通知。这些通知通过 ClickHouse Cloud 的 Slack 应用发送。组织管理员可以在通知中心配置这些通知，并指定要接收通知的 Slack 频道。
- 运行 Production 和 Development 服务的用户现在可以在账单中看到 ClickPipes 和数据传输用量的价格明细。

## 2025 年 3 月 21 日 \{#march-21-2025\}

- AWS 上跨区域 PrivateLink 连接现已进入 Beta 阶段。请参阅 ClickHouse Cloud PrivateLink
  [文档](/manage/security/aws-privatelink)，了解具体的配置步骤及支持的区域列表。
- 目前 AWS 上服务可用的单个副本最大内存规格为 236 GiB。此配置既能提高资源利用效率，
  又能确保为后台进程预留足够的资源。

## 2025 年 3 月 7 日 \{#march-7-2025\}

- 新增 `UsageCost` API 端点：API 规范现在支持一个用于检索用量信息的新端点。该端点为组织级端点，最多可在 31 天的时间范围内查询用量成本。可检索的指标包括 Storage、Compute、Data Transfer 和 ClickPipes。详情请参阅[文档](https://clickhouse.com/docs/cloud/manage/api/usageCost-api-reference)。
- Terraform Provider [v2.1.0](https://registry.terraform.io/providers/ClickHouse/clickhouse/2.1.0/docs/resources/service#nestedatt--endpoints_configuration) 版本现已发布，支持启用 MySQL 端点。

## 2025 年 2 月 21 日 \{#february-21-2025\}

### 适用于 AWS 的 ClickHouse Bring Your Own Cloud (BYOC) 现已全面可用 \{#clickhouse-byoc-for-aws-ga\}

在此部署模型中，数据平面组件（计算、存储、备份、日志、指标）
运行在客户 VPC 中，而控制平面（Web 访问、API 和计费）
则保留在 ClickHouse 的 VPC 内。此设置非常适合需要满足严格数据驻留要求、
并确保所有数据都保留在安全客户环境中的大型工作负载。

- 如需了解更多详细信息，可以参考 BYOC 的[文档](/cloud/reference/byoc/overview)，
  或阅读我们的[公告博文](https://clickhouse.com/blog/announcing-general-availability-of-clickhouse-bring-your-own-cloud-on-aws)。
- 可[联系我们](https://clickhouse.com/cloud/bring-your-own-cloud)以申请访问权限。

### 用于 ClickPipes 的 Postgres CDC 连接器 \{#postgres-cdc-connector-for-clickpipes\}

用于 ClickPipes 的 Postgres CDC 连接器允许您将 Postgres 数据库无缝复制到 ClickHouse Cloud。

- 要开始使用，请参考 ClickPipes Postgres CDC 连接器的[文档](https://clickhouse.com/docs/integrations/clickpipes/postgres)。
- 有关客户使用场景和功能的更多信息，请参阅[专题页面](https://clickhouse.com/cloud/clickpipes/postgres-cdc-connector)和[发布博文](https://clickhouse.com/blog/postgres-cdc-connector-clickpipes-public-beta)。

### ClickHouse Cloud 在 AWS 上的 PCI 合规性 \{#pci-compliance-for-clickhouse-cloud-on-aws\}

ClickHouse Cloud 现在为 **Enterprise 层**客户在 **us-east-1** 和 **us-west-2** 区域
提供**符合 PCI 要求的服务**。希望在符合 PCI 要求的环境中启动服务的用户，
可以联系[支持](https://clickhouse.com/support/program)以获取协助。

### 在 Google Cloud Platform 上的透明数据加密和客户管理加密密钥 \{#tde-and-cmek-on-gcp\}

现已在 **Google Cloud Platform (GCP)** 上的 ClickHouse Cloud 中提供
**Transparent Data Encryption (TDE，透明数据加密)** 和 **Customer Managed Encryption Keys (CMEK，客户管理加密密钥)** 的支持。

- 有关这些功能的更多信息，请参阅相关[文档](https://clickhouse.com/docs/cloud/security/cmek#transparent-data-encryption-tde)。

### AWS 中东（阿联酋）区域可用性 \{#aws-middle-east-uae-availability\}

ClickHouse Cloud 新增了区域支持，现在可在
**AWS Middle East (UAE) me-central-1** 区域中使用。

### ClickHouse Cloud 保护措施（Guardrails） \{#clickhouse-cloud-guardrails\}

为推动最佳实践并确保稳定使用 ClickHouse Cloud，我们正在针对
正在使用的表、数据库、分区和数据片段（parts）数量引入保护措施（guardrails）。

- 有关详细信息，请参阅文档中的[使用限制](https://clickhouse.com/docs/cloud/bestpractices/usage-limits)部分。
- 如果您的服务已经超过这些限制，我们将允许在此基础上增加 10%。如有任何问题，请联系[支持](https://clickhouse.com/support/program)。

## 2025 年 1 月 27 日 \{#january-27-2025\}

### ClickHouse Cloud 层级变更 \{#changes-to-clickhouse-cloud-tiers\}

我们致力于持续调整产品，以满足客户不断变化的需求。自两年前正式 GA 上线以来，ClickHouse Cloud 发展显著，我们也从客户如何使用我们的云产品中获得了宝贵洞见。

我们正在引入新的功能，以优化 ClickHouse Cloud 服务在各类工作负载下的规模配置和成本效率。这些功能包括 **计算-计算分离（compute-compute separation）**、高性能机型以及 **单副本服务（single-replica services）**。我们也在演进自动伸缩和托管升级能力，使其执行过程更加顺畅并具备更强的响应性。

我们将新增一个 **Enterprise 层级**，以满足最严苛的客户和工作负载需求，重点提供面向特定行业的安全与合规功能、更强的底层硬件与升级控制能力，以及高级灾难恢复能力。

为配合这些变更，我们正在重构当前的 **Development** 和 **Production** 层级，使其更贴合不断扩大的客户群对我们产品的实际使用方式。我们将引入面向尝试新想法和新项目用户的 **Basic** 层级，以及匹配大规模生产工作负载和数据需求的 **Scale** 层级。

您可以在这篇[博客](https://clickhouse.com/blog/evolution-of-clickhouse-cloud-new-features-superior-performance-tailored-offerings)中了解这些以及其他功能变更。现有客户需要主动选择[新套餐](https://clickhouse.com/pricing)。面向客户的通知已通过电子邮件发送给组织管理员。

### Warehouses：计算-计算分离（GA） \{#warehouses-compute-compute-separation-ga\}

计算-计算分离（亦称为“Warehouses”）现已正式可用（GA）；详情请参阅[博客](https://clickhouse.com/blog/introducing-warehouses-compute-compute-separation-in-clickhouse-cloud)以及[文档](/cloud/reference/warehouses)。

### 单副本服务 \{#single-replica-services\}

我们引入了“单副本服务（single-replica service）”的概念，既可作为独立产品提供，也可在 Warehouses 内使用。作为独立产品时，单副本服务规模受限，主要用于小型测试工作负载。在 Warehouses 内，单副本服务可以以更大规模部署，并可用于不需要大规模高可用性的工作负载，例如可重启的 ETL 作业。

### 垂直自动伸缩改进 \{#vertical-auto-scaling-improvements\}

我们为计算副本引入了一种新的垂直伸缩机制，我们称之为“Make Before Break”（MBB）。这种方式会先添加一个或多个新规格的副本，再移除旧副本，从而在伸缩操作期间避免任何容量损失。通过消除先移除旧副本再添加新副本之间的空档期，MBB 能够带来更平滑、干扰更小的伸缩过程。在扩容场景中尤为有利，此时高资源利用率会触发额外容量需求，而过早移除副本只会加剧资源压力。

### 水平伸缩（GA） \{#horizontal-scaling-ga\}

水平伸缩现已正式可用（GA）。用户可以通过 API 和云控制台添加额外副本，对服务进行横向扩展。相关信息请参阅[文档](/manage/scaling#manual-horizontal-scaling)。

### 可配置备份 \{#configurable-backups\}

我们现在支持客户将备份导出到自己的云账号，更多信息请参阅[文档](/cloud/manage/backups/configurable-backups)。

### 托管升级改进 \{#managed-upgrade-improvements\}

安全的托管升级通过帮助用户保持与数据库版本演进和新增特性同步，为用户带来了显著价值。在此次发布中，我们将“make before break”（MBB）方法应用于升级流程，进一步降低对正在运行工作负载的影响。

### HIPAA 支持 \{#hipaa-support\}

我们现在在符合要求的区域支持 HIPAA，包括 AWS `us-east-1`、`us-west-2` 以及 GCP `us-central1`、`us-east1`。希望接入的客户必须签署 Business Associate Agreement（BAA），并部署到该区域的合规版本。有关 HIPAA 的更多信息，请参阅[文档](/cloud/security/compliance-overview)。

### 定时升级 \{#scheduled-upgrades\}

用户可以为其服务安排定时升级。此功能仅适用于 Enterprise 层级服务。有关定时升级的更多信息，请参阅[文档](/manage/updates)。

### 各语言客户端对复杂类型的支持 \{#language-client-support-for-complex-types\}

[Golang](https://github.com/ClickHouse/clickhouse-go/releases/tag/v2.30.1)、[Python](https://github.com/ClickHouse/clickhouse-connect/releases/tag/v0.8.11) 和 [NodeJS](https://github.com/ClickHouse/clickhouse-js/releases/tag/1.10.1) 客户端已新增对 Dynamic、Variant 和 JSON 类型的支持。

### 对可刷新物化视图的 DBT 支持 \{#dbt-support-for-refreshable-materialized-views\}

DBT 现在在 `1.8.7` 版本中[支持可刷新物化视图](https://github.com/ClickHouse/dbt-clickhouse/releases/tag/v1.8.7)。

### JWT 令牌支持 \{#jwt-token-support\}

已在 JDBC 驱动 v2、clickhouse-java、[Python](https://github.com/ClickHouse/clickhouse-connect/releases/tag/v0.8.12) 和 [NodeJS](https://github.com/ClickHouse/clickhouse-js/releases/tag/1.10.0) 客户端中添加对基于 JWT 的身份验证的支持。

JDBC / Java 将会在 [0.8.0](https://github.com/ClickHouse/clickhouse-java/releases/tag/v0.8.0) 版本中提供此功能——预计发布时间待定。

### Prometheus 集成改进 \{#prometheus-integration-improvements\}

我们对 Prometheus 集成进行了多项改进：

- **组织级端点**。我们为 ClickHouse Cloud 的 Prometheus 集成引入了一项增强功能。除了服务级的指标外，API 现在还提供了一个 **组织级指标** 端点。该新端点会自动收集组织内所有服务的指标，从而简化将指标导出到 Prometheus 采集器的流程。您可以将这些指标与 Grafana 和 Datadog 等可视化工具集成，以更全面地了解整个组织的性能表现。

  此功能现已向所有用户开放。您可以在[此处](/integrations/prometheus)找到更多详细信息。

- **过滤指标**。我们在 ClickHouse Cloud 的 Prometheus 集成中增加了返回过滤后指标列表的支持。该功能通过让您专注于对监控服务健康状况至关重要的指标，帮助减小响应负载的大小。

  该功能可通过 API 中的可选查询参数使用，从而更轻松地优化数据采集，并简化与 Grafana 和 Datadog 等工具的集成。

  过滤指标功能现已向所有用户开放。您可以在[此处](/integrations/prometheus)找到更多详细信息。

## 2024 年 12 月 20 日 \{#december-20-2024\}

### Marketplace 订阅关联组织 \{#marketplace-subscription-organization-attachment\}

您现在可以将新的 Marketplace 订阅关联到现有的 ClickHouse Cloud 组织。完成在 Marketplace 的订阅并重定向至 ClickHouse Cloud 后，您可以将之前创建的现有组织连接到新的 Marketplace 订阅。从此，该组织中的资源将通过 Marketplace 进行计费。 

<Image img={add_marketplace} size="md" alt="ClickHouse Cloud 界面展示了如何将 Marketplace 订阅添加到现有组织" border />

### 强制 OpenAPI 密钥过期 \{#force-openapi-key-expiration\}

现在可以限制 API 密钥的过期时间选项，以避免创建永不过期的 OpenAPI 密钥。请联系 ClickHouse Cloud 支持团队，为您的组织启用这些限制。

### 通知的自定义邮箱地址 \{#custom-emails-for-notifications\}

组织管理员（Org Admin）现在可以为某条通知添加更多邮箱地址作为额外收件人。这在您希望将通知发送到邮件别名，或发送给组织中可能不是 ClickHouse Cloud 用户的其他成员时非常有用。要进行配置，请从云控制台进入 Notification Settings（通知设置），然后编辑希望接收邮件通知的邮箱地址。 

## 2024 年 12 月 6 日 \{#december-6-2024\}

### BYOC（测试版） \{#byoc-beta\}

适用于 AWS 的 Bring Your Own Cloud（自带云）现已提供测试版。此部署模型允许你在自己的 AWS 账号中部署和运行 ClickHouse Cloud。我们目前支持在 11+ 个 AWS 区域进行部署，后续还会增加更多区域。若要获取访问权限，请[联系技术支持](https://clickhouse.com/support/program)。请注意，此部署主要面向大规模部署场景。

### ClickPipes 中的 Postgres Change Data Capture (CDC) 连接器 \{#postgres-change-data-capture-cdc-connector-in-clickpipes\}

这一开箱即用的集成，使用户只需点击几下即可将 Postgres 数据库复制到 ClickHouse Cloud，并利用 ClickHouse 实现超高速分析。你可以使用该连接器进行持续复制，也可以用于从 Postgres 执行一次性迁移。

### Dashboards（测试版） \{#dashboards-beta\}

本周，我们很高兴宣布 ClickHouse Cloud 中 Dashboards（仪表盘）测试版发布。借助 Dashboards，用户可以将已保存的查询转换为可视化视图，将可视化内容组织到仪表盘上，并使用查询参数与仪表盘交互。要开始使用，请参阅 [dashboards 文档](/cloud/manage/dashboards)。

<Image img={beta_dashboards} size="lg" alt="ClickHouse Cloud 界面展示了带有可视化视图的新 Dashboards 测试版功能" border />

### Query API endpoints（正式版） \{#query-api-endpoints-ga\}

我们很高兴宣布 ClickHouse Cloud 中 Query API Endpoints（查询 API 端点）正式版发布。Query API Endpoints 允许你为已保存的查询快速创建 RESTful API 端点，只需点击几下即可在应用中消费数据，而无需处理语言客户端或复杂的身份认证。自初次发布以来，我们已经交付了多项改进，包括：

* 降低端点延迟，尤其是冷启动时的延迟
* 增强端点的 RBAC 控制
* 可配置的 CORS 允许域名
* 结果流式传输
* 支持所有 ClickHouse 兼容的输出格式

除上述改进外，我们还很高兴宣布通用查询 API 端点。基于现有框架，这些端点允许你对 ClickHouse Cloud 服务执行任意 SQL 查询。可以在服务设置页面启用并配置通用端点。

要开始使用，请参阅 [Query API Endpoints 文档](/cloud/get-started/query-endpoints)。

<Image img={api_endpoints} size="lg" alt="ClickHouse Cloud 界面展示了带有多种设置的 API Endpoints 配置" border />

### 原生 JSON 支持（测试版） \{#native-json-support-beta\}

我们在 ClickHouse Cloud 中上线了原生 JSON 支持的测试版。要开始使用，请[联系技术支持，为你的云服务启用该功能](/cloud/support)。

### 使用向量相似度索引的向量搜索（早期访问） \{#vector-search-using-vector-similarity-indexes-early-access\}

我们宣布推出用于近似向量搜索的向量相似度索引早期访问版本。

ClickHouse 已经为基于向量的用例提供了强大的支持，包括广泛的[距离函数](https://clickhouse.com/blog/reinvent-2024-product-announcements#vector-search-using-vector-similarity-indexes-early-access)以及执行线性扫描的能力。此外，最近我们还新增了一种实验性的[近似向量搜索](/engines/table-engines/mergetree-family/annindexes)方法，基于 [usearch](https://github.com/unum-cloud/usearch) 库和 Hierarchical Navigable Small Worlds (HNSW) 近似最近邻搜索算法实现。

要开始使用，请[注册早期访问候补名单](https://clickhouse.com/cloud/vector-search-index-waitlist)。

### ClickHouse-Connect（Python）和 ClickHouse Kafka Connect 用户 \{#clickhouse-connect-python-and-clickhouse-kafka-connect-users\}

我们已向曾遇到客户端可能触发 `MEMORY_LIMIT_EXCEEDED` 异常问题的客户发送了通知邮件。

请升级至：

- Kafka-Connect：> 1.2.5
- ClickHouse-Connect (Java)：> 0.8.6

### ClickPipes 现已支持在 AWS 上跨 VPC 访问资源 \{#clickpipes-now-supports-cross-vpc-resource-access-on-aws\}

你现在可以为特定数据源（如 AWS MSK）授予单向访问权限。通过结合使用 AWS PrivateLink 和 VPC Lattice 的跨 VPC 资源访问，你可以在不同 VPC 和账号之间，甚至从本地网络共享单个资源，同时在通过公共网络访问时不牺牲隐私和安全性。要开始使用并设置资源共享，你可以阅读[公告文章](https://clickhouse.com/blog/clickpipes-crossvpc-resource-endpoints?utm_medium=web&utm_source=changelog)。

<Image img={cross_vpc} size="lg" alt="示意图展示 ClickPipes 连接到 AWS MSK 的跨 VPC 资源访问架构" border />

### ClickPipes 现已支持 AWS MSK 的 IAM \{#clickpipes-now-supports-iam-for-aws-msk\}

您现在可以使用 IAM 认证，通过 AWS MSK ClickPipes 连接到 MSK broker。要开始使用，请查看我们的[文档](/integrations/clickpipes/kafka/best-practices/#iam)。

### AWS 上新建服务的最大副本大小 \{#maximum-replica-size-for-new-services-on-aws\}

今后，在 AWS 上创建的任何新服务，其可用的最大副本大小为 236 GiB。

## 2024 年 11 月 22 日 \{#november-22-2024\}

### ClickHouse Cloud 内置高级可观测性仪表盘 \{#built-in-advanced-observability-dashboard-for-clickhouse-cloud\}

此前，用于监控 ClickHouse 服务器指标和硬件资源利用率的高级可观测性仪表盘仅在开源版 ClickHouse 中可用。我们很高兴地宣布，这一功能现已在 ClickHouse Cloud 控制台中提供。

该仪表盘基于 [system.dashboards](/operations/system-tables/dashboards) 表，在统一的 UI 界面中展示查询。访问 **Monitoring > Service Health** 页面即可开始使用高级可观测性仪表盘。

<Image img={nov_22} size="lg" alt="ClickHouse Cloud 高级可观测性仪表盘显示服务器指标和资源利用率" border />

### AI 驱动的 SQL 自动补全 \{#ai-powered-sql-autocomplete\}

我们对自动补全功能进行了大幅改进，通过全新的 AI Copilot，在编写查询时即可获得行内 SQL 补全建议。可以在任意 ClickHouse Cloud 服务中切换启用 **"Enable Inline Code Completion"** 设置来开启此功能。

<Image img={copilot} size="lg" alt="演示 AI Copilot 在用户输入时提供 SQL 自动补全建议的动画" border />

### 新的 "billing" 角色 \{#new-billing-role\}

现在，可以在组织中为用户分配新的 **Billing（计费）** 角色，使其能够查看和管理计费信息，而无需授予配置或管理服务的权限。只需邀请新用户或编辑现有用户的角色即可分配 **Billing** 角色。

## 2024 年 11 月 8 日 \{#november-8-2024\}

### ClickHouse Cloud 中的客户通知功能 \{#customer-notifications-in-clickhouse-cloud\}

ClickHouse Cloud 现在会针对多种计费和扩缩容事件提供控制台内通知和电子邮件通知。客户可以在云控制台的通知中心配置这些通知，可选择仅在 UI 中显示、仅通过电子邮件接收，或两者同时启用。您可以在服务级别配置希望接收的通知类别和严重级别。

未来，我们将为更多事件提供通知，并增加更多接收通知的方式。

请参阅 [ClickHouse 文档](/cloud/notifications)，了解如何为您的服务启用通知。

<Image img={notifications} size="lg" alt="ClickHouse Cloud 通知中心界面，展示不同通知类型的配置选项" border />

<br />

## 2024 年 10 月 4 日 \{#october-4-2024\}

### ClickHouse Cloud 现已在 GCP 推出 Beta 阶段的 HIPAA 就绪服务 \{#clickhouse-cloud-now-offers-hipaa-ready-services-in-beta-for-gcp\}

希望为受保护健康信息（PHI）提供更高安全性的客户，现在可以在 [Google Cloud Platform (GCP)](https://cloud.google.com/) 上使用 ClickHouse Cloud。ClickHouse 已根据 [HIPAA 安全规则](https://www.hhs.gov/hipaa/for-professionals/security/index.html) 实施了管理、物理和技术方面的防护措施，并提供可配置的安全设置，可根据您的具体用例和工作负载进行应用。有关可用安全设置的更多信息，请查看我们的[安全功能页面](/cloud/security)。

服务目前在 GCP `us-central-1` 区域向 **Dedicated** 服务类型的客户开放，并需要签署业务伙伴协议（BAA）。请联系 [sales](mailto:sales@clickhouse.com) 或 [support](https://clickhouse.com/support/program) 申请使用此功能，或加入其他 GCP、AWS 和 Azure 区域的候补名单。

### 计算-计算分离现已在 GCP 和 Azure 上提供私有预览 \{#compute-compute-separation-is-now-in-private-preview-for-gcp-and-azure\}

我们最近宣布了在 AWS 上提供计算-计算分离的私有预览。现在，我们很高兴地宣布，该功能已适用于 GCP 和 Azure。

计算-计算分离允许您将特定服务指定为读写服务或只读服务，从而为您的应用设计最优的计算配置，以优化成本和性能。请[阅读文档](/cloud/reference/warehouses)以获取更多详细信息。

### 自助式 MFA 恢复代码 \{#self-service-mfa-recovery-codes\}

使用多因素认证的客户现在可以获取恢复代码，以便在手机丢失或误删令牌时使用。首次启用 MFA 的客户将在配置过程中获得恢复代码。已启用 MFA 的现有客户可以通过删除现有的 MFA 令牌并添加新的令牌来获取恢复代码。

### ClickPipes 更新：自定义证书、延迟洞察等 \{#clickpipes-update-custom-certificates-latency-insights-and-more\}

我们很高兴与您分享 ClickPipes 的最新更新——这是将数据摄取到 ClickHouse 服务中最简单的方式。这些新功能旨在增强您对数据摄取的控制能力，并提升对性能指标的可见性。

*Kafka 的自定义认证证书*

用于 Kafka 的 ClickPipes 现已支持为使用 SASL 和公有 SSL/TLS 的 Kafka broker 配置自定义认证证书。您可以在 ClickPipe 设置过程中的 SSL Certificate 部分轻松上传自己的证书，从而确保与 Kafka 建立更安全的连接。

*Kafka 和 Kinesis 的延迟指标介绍*

性能可见性至关重要。ClickPipes 现在提供延迟图表，使您能够洞察从消息生成（无论是来自 Kafka Topic 还是 Kinesis Stream）到摄取到 ClickHouse Cloud 之间的时间。借助这一新指标，您可以更密切地关注数据管道的性能并进行相应优化。

<Image img={latency_insights} size="lg" alt="ClickPipes 界面显示用于监控数据摄取性能的延迟指标图表" border />

<br />

*Kafka 和 Kinesis 的伸缩控制（私有 Beta）*

高吞吐量可能需要额外资源来满足您的数据量和延迟需求。我们正在为 ClickPipes 引入水平伸缩功能，可直接通过我们的云控制台使用。该功能目前处于私有 Beta 阶段，使您可以根据需求更有效地扩展资源。请联系 [support](https://clickhouse.com/support/program) 加入 Beta 计划。

*Kafka 和 Kinesis 的原始消息摄取*

现在可以在不对消息进行解析的情况下摄取整个 Kafka 或 Kinesis 消息。ClickPipes 现已支持 `_raw_message` [虚拟列](/integrations/clickpipes/kafka/reference/#kafka-virtual-columns)，允许用户将完整消息映射到一个单独的 String 列。这使您在需要时可以更灵活地处理原始数据。

## 2024 年 8 月 29 日 \{#august-29-2024\}

### 全新 Terraform Provider 版本 - v1.0.0 \{#new-terraform-provider-version---v100\}

Terraform 允许你以编程方式控制 ClickHouse Cloud 服务，并将配置以代码形式存储。我们的 Terraform Provider 已累计近 200,000 次下载，现在已正式发布 v1.0.0。该新版本带来了多项改进，例如更完善的重试逻辑，以及用于将私有端点关联到 ClickHouse Cloud 服务的新资源。你可以在[此处下载 Terraform Provider](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest)，并在[此处查看完整更新日志](https://github.com/ClickHouse/terraform-provider-clickhouse/releases/tag/v1.0.0)。

### 2024 年 SOC 2 Type II 报告和更新后的 ISO 27001 证书 \{#2024-soc-2-type-ii-report-and-updated-iso-27001-certificate\}

我们很高兴宣布，2024 年 SOC 2 Type II 报告和更新后的 ISO 27001 证书现已发布，这两项均涵盖了我们近期在 Azure 上推出的服务，以及持续覆盖的 AWS 和 GCP 上的服务。

我们的 SOC 2 Type II 体现了我们始终致力于确保向 ClickHouse 用户提供的服务在安全性、可用性、处理完整性和机密性方面达到高标准。欲了解更多信息，请参阅由美国注册会计师协会（AICPA）发布的 [SOC 2 - SOC for Service Organizations: Trust Services Criteria](https://www.aicpa-cima.com/resources/landing/system-and-organization-controls-soc-suite-of-services) 以及国际标准化组织（ISO）发布的 [What is ISO/IEC 27001](https://www.iso.org/standard/27001)。

你也可以访问我们的 [Trust Center](https://trust.clickhouse.com/)，查看安全与合规相关的文档和报告。

## 2024 年 8 月 15 日 \{#august-15-2024\}

### Compute-compute 分离现已在 AWS 上提供 Private Preview \{#compute-compute-separation-is-now-in-private-preview-for-aws\}

对于现有的 ClickHouse Cloud 服务，副本同时处理读和写操作，无法将某个副本配置为只处理某一种操作。我们即将推出一项名为 Compute-compute 分离（Compute-compute separation）的新功能，它允许你将特定服务指定为读写服务或只读服务，从而为你的应用设计最优的计算配置，以兼顾成本和性能。

我们全新的 Compute-compute 分离功能使你可以创建多个计算节点组，每个节点组都有自己的 endpoint，并使用相同的对象存储目录，因此共享相同的表、视图等。阅读更多关于[Compute-compute 分离的说明](/cloud/reference/warehouses)。如果你希望在 Private Preview 阶段访问此功能，请[联系支持](https://clickhouse.com/support/program)。

<Image img={cloud_console_2} size="lg" alt="展示 Compute-compute 分离架构示例的图示，其中包含读写和只读服务组" border />

### 面向 S3 和 GCS 的 ClickPipes 现已正式发布，支持 Continuous 模式 \{#clickpipes-for-s3-and-gcs-now-in-ga-continuous-mode-support\}

ClickPipes 是将数据摄取到 ClickHouse Cloud 的最简便方式。我们很高兴地宣布，面向 S3 和 GCS 的[ClickPipes](https://clickhouse.com/cloud/clickpipes) 现已**正式发布（GA）**。ClickPipes 同时支持一次性批量摄取和“Continuous 模式（continuous mode）”。一个摄取任务会将指定远程存储桶中与某个模式匹配的所有文件加载到目标 ClickHouse 表中。在“Continuous 模式”下，ClickPipes 作业会持续运行，不断摄取新写入远程对象存储桶且匹配该模式的文件。这样，你就可以将任意对象存储桶构建成向 ClickHouse Cloud 摄取数据的完整中间暂存区。你可以在[我们的文档](/integrations/clickpipes)中进一步了解 ClickPipes。

## 2024 年 7 月 18 日 \{#july-18-2024\}

### Prometheus 指标端点现已正式 GA \{#prometheus-endpoint-for-metrics-is-now-generally-available\}

在上一期 Cloud 更新日志中，我们宣布了从 ClickHouse Cloud 导出 [Prometheus](https://prometheus.io/) 指标的 Private Preview。通过这一功能，你可以使用 [ClickHouse Cloud API](/cloud/manage/api/api-overview)，将指标导入 [Grafana](https://grafana.com/) 和 [Datadog](https://www.datadoghq.com/) 等工具进行可视化展示。现正式宣布，这一功能已**全面 GA（Generally Available）**。请参阅[我们的文档](/integrations/prometheus)了解更多详情。

### Cloud 控制台中的表检查器 \{#table-inspector-in-cloud-console\}

ClickHouse 提供了诸如 [`DESCRIBE`](/sql-reference/statements/describe-table) 之类的命令，允许你检查表以查看其模式（schema）。这些命令会将结果输出到控制台，但在实际使用时往往不够方便，因为通常需要组合多条查询，才能获取关于表和列的全部相关数据。

我们近日在 Cloud 控制台中上线了一个**表检查器（Table Inspector）**，它允许你直接在 UI 中查看关键的表和列信息，而无需编写 SQL。你可以在 Cloud 控制台中为你的服务试用表检查器。它在一个统一界面中提供关于 schema、存储、压缩等方面的信息。

<Image img={compute_compute} size="lg" alt="ClickHouse Cloud 表检查器界面，展示详细的 schema 和存储信息" border />

### 全新的 Java Client API \{#new-java-client-api\}

我们的 [Java Client](https://github.com/ClickHouse/clickhouse-java) 是用户连接 ClickHouse 时最常用的客户端之一。我们希望让它更加易用、直观，因此重新设计了 API，并进行了多项性能优化。这些改进将使你更轻松地从 Java 应用程序连接到 ClickHouse。你可以在这篇[博客文章](https://clickhouse.com/blog/java-client-sequel)中了解如何使用更新后的 Java Client。

### 新的分析器默认启用 \{#new-analyzer-is-enabled-by-default\}

在过去的几年中，我们一直在开发一个用于查询分析和优化的新分析器（analyzer）。这个分析器提升了查询性能，并将使我们能够进行更多优化，包括更快速、更高效的 `JOIN`。此前，新用户需要通过设置 `allow_experimental_analyzer` 来启用该功能。现在，这个改进后的分析器已在新的 ClickHouse Cloud 服务中默认启用。

请继续关注分析器的后续改进，我们已经规划了更多优化。

## 2024 年 6 月 28 日 \{#june-28-2024\}

### ClickHouse Cloud for Microsoft Azure 现已正式发布 \{#clickhouse-cloud-for-microsoft-azure-is-now-generally-available\}

我们在 [今年 5 月](https://clickhouse.com/blog/clickhouse-cloud-is-now-on-azure-in-public-beta) 首次宣布了对 Microsoft Azure 的 Beta 版支持。在最新的云服务发布中，我们很高兴地宣布，Azure 支持已从 Beta 阶段转变为正式（GA）发布。ClickHouse Cloud 现在已在三大主流云平台全面提供：AWS、Google Cloud Platform，以及本次新增的 Microsoft Azure。

本次发布还支持通过 [Microsoft Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps/clickhouse.clickhouse_cloud) 订阅服务。服务初期将在以下区域提供支持：
- 美国：West US 3（亚利桑那）
- 美国：East US 2（弗吉尼亚）
- 欧洲：Germany West Central（法兰克福）

如果你希望支持其他特定区域，请[联系我们](https://clickhouse.com/support/program)。

### 查询日志洞察 \{#query-log-insights\}

Cloud 控制台中的全新 Query Insights UI 让 ClickHouse 内置的查询日志更加易于使用。ClickHouse 的 `system.query_log` 表是查询优化、调试以及监控整体集群健康状况与性能的关键信息来源。唯一的挑战在于：该表包含 70 多个字段，且每条查询会产生多条记录，理解查询日志的学习曲线相对较陡。此首个版本的 Query Insights 为后续简化查询调试与优化模式提供了一个蓝本。我们非常期待在持续迭代这一功能的过程中听到你的反馈，因此欢迎随时与我们联系——你的意见对我们而言非常宝贵。

<Image img={query_insights} size="lg" alt="ClickHouse Cloud Query Insights UI 展示查询性能指标与分析" border />

### Prometheus 指标端点（私有预览）\{#prometheus-endpoint-for-metrics-private-preview\}

这可能是我们被请求次数最多的功能之一：你现在可以将 ClickHouse Cloud 的 [Prometheus](https://prometheus.io/) 指标导出到 [Grafana](https://grafana.com/) 和 [Datadog](https://www.datadoghq.com/) 进行可视化。Prometheus 提供了一个开源方案，用于监控 ClickHouse 并设置自定义告警。你可以通过 [ClickHouse Cloud API](/integrations/prometheus) 访问 ClickHouse Cloud 服务的 Prometheus 指标。此功能目前处于私有预览阶段。请联系 [support 团队](https://clickhouse.com/support/program)，为你的组织启用该功能。

<Image img={prometheus} size="lg" alt="Grafana 仪表板展示来自 ClickHouse Cloud 的 Prometheus 指标" border />

### 其他功能 \{#other-features\}

- [Configurable backups](/cloud/manage/backups/configurable-backups)（可配置备份）现已正式发布，你可以配置诸如备份频率、保留策略和调度等自定义备份策略。

## 2024 年 6 月 13 日 \{#june-13-2024\}

### Kafka ClickPipes Connector 可配置偏移量（测试版）\{#configurable-offsets-for-kafka-clickpipes-connector-beta\}

直到最近，每当你设置一个新的 [Kafka Connector for ClickPipes](/integrations/clickpipes/kafka) 时，它都会从 Kafka 主题的起始位置开始消费数据。在你需要重新处理历史数据、监控新进入的数据或从某个精确位置恢复时，这种行为可能不够灵活，无法满足特定用例。

ClickPipes for Kafka 现已新增一项功能，增强了从 Kafka 主题消费数据时的灵活性和控制能力。你现在可以配置开始消费数据时所使用的偏移量。

可用选项如下：
- From the beginning：从 Kafka 主题的最开始位置开始消费数据。该选项适用于需要重新处理全部历史数据的用户。
- From latest：从最新偏移量开始消费数据。该选项适用于只对新消息感兴趣的用户。
- From a timestamp：从在某个特定时间戳或之后产生的消息开始消费数据。该功能提供了更精细的控制，使用户可以从一个精确的时间点恢复处理。

<Image img={kafka_config} size="lg" alt="ClickPipes Kafka connector 配置界面，显示偏移量选择选项" border />

### 将服务加入 Fast 发布通道 \{#enroll-services-to-the-fast-release-channel\}

Fast 发布通道允许你的服务在正式发布时间表之前提前接收更新。此前，要启用该功能需要支持团队的协助。现在，你可以直接使用 ClickHouse Cloud 控制台为你的服务启用该功能。只需导航到 **Settings**，并点击 **Enroll in fast releases**。你的服务将会在更新可用时第一时间收到更新。

<Image img={fast_releases} size="lg" alt="ClickHouse Cloud 设置页面，显示加入 Fast 发布通道的选项" border />

### Terraform 对水平扩展的支持 \{#terraform-support-for-horizontal-scaling\}

ClickHouse Cloud 支持 [水平扩展](/manage/scaling#how-scaling-works-in-clickhouse-cloud)，即为你的服务添加相同规格的额外副本。水平扩展通过提升性能和并行度来支持并发查询。此前，添加更多副本需要使用 ClickHouse Cloud 控制台或 API。现在，你可以使用 Terraform 为服务添加或删除副本，从而按需以编程方式扩展 ClickHouse 服务。

更多信息请参阅 [ClickHouse Terraform provider](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs)。

## 2024 年 5 月 30 日 \{#may-30-2024\}

### 与团队成员共享查询 \{#share-queries-with-your-teammates\}

当你编写一条 SQL 查询时，很有可能团队中的其他人也会觉得这条查询很有用。之前，你必须通过 Slack 或电子邮件发送查询，而且如果你对查询进行了编辑，团队成员无法自动收到更新。

我们很高兴地宣布，你现在可以通过 ClickHouse Cloud 控制台轻松共享查询。在查询编辑器中，你可以将查询直接共享给整个团队或特定团队成员。你还可以指定他们是仅具有只读权限，还是具有读写权限。点击查询编辑器中的 **Share** 按钮即可试用新的共享查询功能。

<Image img={share_queries} size="lg" alt="ClickHouse Cloud 查询编辑器展示带有权限选项的共享功能" border />

### ClickHouse Cloud for Microsoft Azure 现已进入测试版 \{#clickhouse-cloud-for-microsoft-azure-is-now-in-beta\}

我们终于上线了在 Microsoft Azure 上创建 ClickHouse Cloud 服务的功能。我们已经有许多客户通过我们的 Private Preview 计划在 Azure 的生产环境中使用 ClickHouse Cloud。现在，任何人都可以在 Azure 上创建自己的服务。你在 AWS 和 GCP 上已经喜爱的、受支持的所有 ClickHouse 功能，在 Azure 上同样可以使用。

我们预计将在接下来的几周内让 ClickHouse Cloud for Azure 达到正式可用（GA）阶段。[阅读这篇博客文章](https://clickhouse.com/blog/clickhouse-cloud-is-now-on-azure-in-public-beta)了解更多信息，或者通过 ClickHouse Cloud 控制台使用 Azure 创建你的新服务。

注意：目前不支持 Azure 的 **Development** 服务。

### 通过 Cloud 控制台设置 Private Link \{#set-up-private-link-via-the-cloud-console\}

我们的 Private Link 功能允许你将 ClickHouse Cloud 服务与你在云提供商账户中的内部服务进行连接，而无需将流量引向公共互联网，从而节省成本并增强安全性。此前，这一功能的配置较为困难，需要使用 ClickHouse Cloud API。

你现在只需在 ClickHouse Cloud 控制台中点击几下即可配置私有端点。只需进入你的服务 **Settings**，前往 **Security** 部分，然后点击 **Set up private endpoint** 即可。

<Image img={private_endpoint} size="lg" alt="ClickHouse Cloud 控制台在安全设置中展示私有端点设置界面" border />

## 2024 年 5 月 17 日 \{#may-17-2024\}

### 使用 ClickPipes（测试版）从 Amazon Kinesis 摄取数据 \{#ingest-data-from-amazon-kinesis-using-clickpipes-beta\}

ClickPipes 是由 ClickHouse Cloud 提供的专用服务，可在无需编写代码的情况下摄取数据。Amazon Kinesis 是 AWS 的全托管流式服务，用于摄取和存储数据流以进行处理。我们很高兴发布面向 Amazon Kinesis 的 ClickPipes 测试版，这是最受用户期待的集成之一。我们计划在 ClickPipes 中新增更多集成，因此请告诉我们您希望我们支持哪些数据源。有关此功能的更多信息请阅读[此处](https://clickhouse.com/blog/clickpipes-amazon-kinesis)。

您可以在云控制台中试用 ClickPipes 的全新 Amazon Kinesis 集成：

<Image img={kenesis} size="lg" alt="ClickPipes 界面展示 Amazon Kinesis 集成的配置选项" border />

### 可配置备份（私有预览版） \{#configurable-backups-private-preview\}

备份对每个数据库都非常重要（无论其有多可靠），从 ClickHouse Cloud 创立之初我们就一直非常重视备份。本周我们发布了可配置备份（Configurable Backups），为您的服务备份提供了更高的灵活性。您现在可以控制备份的开始时间、保留周期和频率。该功能适用于 **Production** 和 **Dedicated** 服务，不适用于 **Development** 服务。由于此功能目前处于私有预览阶段，请联系 support@clickhouse.com 为您的服务启用。有关可配置备份的更多信息请阅读[此处](https://clickhouse.com/blog/configurable-backups-in-clickhouse-cloud)。

### 从 SQL 查询创建 API（测试版） \{#create-apis-from-your-sql-queries-beta\}

当您为 ClickHouse 编写 SQL 查询时，仍然需要通过驱动程序连接到 ClickHouse，才能将查询暴露给您的应用。现在，通过全新的 **Query Endpoints** 功能，您可以通过 API 直接执行 SQL 查询，而无需任何额外配置。您可以指定查询端点的返回格式为 JSON、CSV 或 TSV。点击云控制台中的“Share”按钮，在您的查询上试用这一新功能。有关 Query Endpoints 的更多信息请阅读[此处](https://clickhouse.com/blog/automatic-query-endpoints)。

<Image img={query_endpoints} size="lg" alt="ClickHouse Cloud 界面展示 Query Endpoints 的配置及输出格式选项" border />

### 官方 ClickHouse 认证现已推出 \{#official-clickhouse-certification-is-now-available\}

ClickHouse Develop 培训课程中包含 12 个免费培训模块。在此之前，并没有官方途径来证明您在 ClickHouse 方面的掌握程度。我们近期推出了一项官方考试，用于获得 **ClickHouse Certified Developer** 认证。完成此考试后，您可以向当前和潜在雇主展示您在 ClickHouse 方面的掌握程度，涵盖数据摄取、建模、分析、性能优化等主题。您可以在[此处](https://clickhouse.com/learn/certification)参加考试，或在这篇[博文](https://clickhouse.com/blog/first-official-clickhouse-certification)中阅读更多关于 ClickHouse 认证的信息。

## 2024 年 4 月 25 日 \{#april-25-2024\}

### 使用 ClickPipes 从 S3 和 GCS 加载数据 \{#load-data-from-s3-and-gcs-using-clickpipes\}

你可能已经在我们新发布的云控制台中注意到，有一个名为「Data sources」的新部分。「Data sources」页面由 ClickPipes 驱动，ClickPipes 是 ClickHouse Cloud 的原生功能，可让你轻松地将来自各种数据源的数据插入到 ClickHouse Cloud 中。

我们最新的 ClickPipes 更新支持直接从 Amazon S3 和 Google Cloud Storage 上传数据。虽然你仍然可以使用我们内置的表函数，但 ClickPipes 是通过我们的 UI 提供的全托管服务，只需点击几下，就可以从 S3 和 GCS 摄取数据。该功能目前仍处于 Private Preview 阶段，但你今天就可以通过云控制台进行试用。

<Image img={s3_gcs} size="lg" alt="ClickPipes 界面显示了从 S3 和 GCS 存储桶加载数据的配置选项" border />

### 使用 Fivetran 将来自 500+ 个源的数据加载到 ClickHouse Cloud 中 \{#use-fivetran-to-load-data-from-500-sources-into-clickhouse-cloud\}

ClickHouse 可以快速查询你所有的大型数据集，但当然，前提是你的数据必须先被插入到 ClickHouse 中。借助 Fivetran 丰富的连接器，你现在可以快速从 500 多个数据源加载数据。无论你需要从 Zendesk、Slack 还是其他常用应用程序加载数据，全新的 Fivetran ClickHouse 目标端现在都允许你使用 ClickHouse 作为应用数据的目标数据库。

这是一个开源集成，由我们的 Integrations 团队经过数月的辛勤工作构建而成。你可以在这里查看我们的[发布博客文章](https://clickhouse.com/blog/fivetran-destination-clickhouse-cloud)，以及对应的 [GitHub 仓库](https://github.com/ClickHouse/clickhouse-fivetran-destination)。

### 其他更改 \{#other-changes\}

**控制台更改**

- SQL 控制台中支持输出格式

**集成更改**

- ClickPipes Kafka 连接器支持多 broker 部署
- PowerBI 连接器支持传入 ODBC 驱动配置选项。

## 2024 年 4 月 18 日 \{#april-18-2024\}

### ClickHouse Cloud 现已支持 AWS 东京区域 \{#aws-tokyo-region-is-now-available-for-clickhouse-cloud\}

本次发布为 ClickHouse Cloud 新增了 AWS 东京区域（`ap-northeast-1`）。为了让 ClickHouse 成为最快的数据库，我们在各大云平台中持续增加更多区域，以尽可能降低延迟。您现在可以在更新后的云控制台中在东京区域创建新的服务。

<Image img={tokyo} size="lg" alt="ClickHouse Cloud 服务创建界面中显示东京区域选择" border />

其他变更：

### 控制台变更 \{#console-changes\}

- ClickPipes for Kafka 的 Avro 格式支持现已一般可用（GA）
- 为 Terraform 提供程序实现了对资源（services 和 private endpoints）导入的完整支持

### 集成变更 \{#integrations-changes\}

- Node.js 客户端重大稳定版本发布：为 query 和 ResultSet 提供高级 TypeScript 支持，支持 URL 配置
- Kafka 连接器：修复了向 DLQ 写入时忽略异常的 bug，新增对 Avro Enum 类型的支持，并发布了在 [MSK](https://www.youtube.com/watch?v=6lKI_WlQ3-s) 和 [Confluent Cloud](https://www.youtube.com/watch?v=SQAiPVbd3gg) 上使用该连接器的指南
- Grafana：修复了 UI 中 Nullable 类型支持的问题，修复了对动态 OTel tracing 表名的支持
- dbt：修复了自定义 materialization 的模型设置
- Java 客户端：修复了错误码解析不正确的 bug
- Python 客户端：修复了数值类型的参数绑定问题，修复了查询绑定中数字列表的相关 bug，新增对 SQLAlchemy Point 的支持

## 2024 年 4 月 4 日 \{#april-4-2024\}

### 全新 ClickHouse Cloud 控制台重磅登场 \{#introducing-the-new-clickhouse-cloud-console\}

本次发布推出了全新云控制台的私有预览版本。

在 ClickHouse，我们持续思考并实践如何改进开发者体验。我们深知，仅仅提供最快的实时数据仓库还不够，它还必须易于使用和运维管理。

成千上万的 ClickHouse Cloud 用户每月在我们的 SQL 控制台上执行数十亿次查询，因此我们决定加大投入，打造世界一流的控制台，让您比以往任何时候都更轻松地与 ClickHouse Cloud 服务交互。全新的云控制台体验将独立的 SQL 编辑器与管理控制台融合在一个直观的 UI 中。

部分客户将获得我们全新云控制台体验的预览权限——这是一种统一且沉浸式的方式，可用于在 ClickHouse 中探索和管理您的数据。如果您希望获得优先访问权限，请通过 support@clickhouse.com 与我们联系。

<Image img={cloud_console} size="lg" alt="动画展示了全新的 ClickHouse Cloud 控制台界面，其中集成了 SQL 编辑器和管理功能" border />

## 2024 年 3 月 28 日 \{#march-28-2024\}

此版本引入了对 Microsoft Azure 的支持、通过 API 进行水平扩展以及处于私有预览阶段的发布渠道。

### 常规更新 \{#general-updates\}
- 引入了对 Microsoft Azure 的支持(私有预览)。如需获取访问权限,请联系客户经理或支持团队,或加入[候补名单](https://clickhouse.com/cloud/azure-waitlist)。
- 引入了发布渠道——可根据环境类型指定升级时间。在此版本中,我们添加了"快速"发布渠道,使您能够在生产环境之前升级非生产环境(请联系支持团队以启用)。

### 管理变更 \{#administration-changes\}

- 添加了通过 API 进行水平扩展配置的支持(私有预览,请联系支持团队以启用)
- 改进了自动扩展功能,可扩展在启动时遇到内存不足错误的服务
- 通过 Terraform provider 添加了对 AWS CMEK 的支持

### 控制台变更 \{#console-changes-1\}

- 添加了对 Microsoft 社交登录的支持
- 在 SQL 控制台中添加了参数化查询共享功能
- 显著提升了查询编辑器性能(在某些欧盟地区从 5 秒降至 1.5 秒延迟)

### 集成变更 \{#integrations-changes-1\}

- ClickHouse OpenTelemetry 导出器:[添加了对](https://github.com/open-telemetry/opentelemetry-collector-contrib/pull/31920) ClickHouse 复制表引擎的支持,并[添加了集成测试](https://github.com/open-telemetry/opentelemetry-collector-contrib/pull/31896)
- ClickHouse DBT 适配器:添加了对[字典物化宏](https://github.com/ClickHouse/dbt-clickhouse/pull/255)的支持,[TTL 表达式支持的测试](https://github.com/ClickHouse/dbt-clickhouse/pull/254)
- ClickHouse Kafka Connect Sink:[添加了与](https://github.com/ClickHouse/clickhouse-kafka-connect/issues/350) Kafka 插件发现的兼容性(社区贡献)
- ClickHouse Java 客户端:为新客户端 API [引入了新包](https://github.com/ClickHouse/clickhouse-java/pull/1574),并为 ClickHouse Cloud 测试[添加了测试覆盖](https://github.com/ClickHouse/clickhouse-java/pull/1575)
- ClickHouse NodeJS 客户端:扩展了新 HTTP keep-alive 行为的测试和文档。自 v0.3.0 版本起可用
- ClickHouse Golang 客户端:[修复了](https://github.com/ClickHouse/clickhouse-go/pull/1236)将 Enum 作为 Map 键的错误;[修复了](https://github.com/ClickHouse/clickhouse-go/pull/1237)错误连接留在连接池中的问题(社区贡献)
- ClickHouse Python 客户端:[添加了](https://github.com/ClickHouse/clickhouse-connect/issues/155)通过 PyArrow 进行查询流式传输的支持(社区贡献)

### 安全更新 \{#security-updates\}

- 更新了 ClickHouse Cloud 以防止["启用查询缓存时绕过基于角色的访问控制"](https://github.com/ClickHouse/ClickHouse/security/advisories/GHSA-45h5-f7g3-gr8r)漏洞 (CVE-2024-22412)

## 2024 年 3 月 14 日 \{#march-14-2024\}

本次发布在早期访问中提供全新的 Cloud 控制台体验、用于从 S3 和 GCS 批量加载数据的 ClickPipes，以及在用于 Kafka 的 ClickPipes 中对 Avro 格式的支持。同时将 ClickHouse 数据库版本升级到 24.1，引入对新函数的支持，并对性能和资源使用进行优化。

### 控制台变更 \{#console-changes-2\}

- 全新的 Cloud 控制台体验现已提供早期访问（如有兴趣参与，请联系支持团队）。
- 用于从 S3 和 GCS 批量加载数据的 ClickPipes 现已提供早期访问（如有兴趣参与，请联系支持团队）。
- 在用于 Kafka 的 ClickPipes 中对 Avro 格式的支持现已提供早期访问（如有兴趣参与，请联系支持团队）。

### ClickHouse 版本升级 \{#clickhouse-version-upgrade\}

- 对 FINAL 的优化、向量化改进、更快的聚合 —— 详情参见 [23.12 发布博客](https://clickhouse.com/blog/clickhouse-release-23-12#optimizations-for-final)。
- 新增用于处理 punycode、字符串相似度、检测异常值的函数，以及针对合并和 Keeper 的内存优化 —— 详情参见 [24.1 发布博客](https://clickhouse.com/blog/clickhouse-release-24-01) 和 [演示文稿](https://presentations.clickhouse.com/release_24.1/)。
- 此 ClickHouse Cloud 版本基于 24.1，其中包含数十项新功能、性能改进和错误修复。详情参见核心数据库的[变更日志](/whats-new/changelog/2023#2312)。

### 集成变更 \{#integrations-changes-2\}

- Grafana：修复了 v4 的仪表板迁移和即席筛选逻辑
- Tableau Connector：修复了 DATENAME 函数以及对 "real" 参数的舍入
- Kafka Connector：修复了连接初始化中的 NPE，新增了指定 JDBC 驱动程序选项的功能
- Golang client：降低了处理响应时的内存占用，修复了 Date32 极值问题，修复了在启用压缩时的错误报告
- Python client：改进了 datetime 参数的时区支持，提升了对 Pandas DataFrame 的处理性能

## 2024 年 2 月 29 日 \{#february-29-2024\}

此版本改进了 SQL 控制台应用的加载时间，增加了 ClickPipes 对 SCRAM-SHA-256 认证的支持，并将嵌套结构支持扩展到了 Kafka Connect。

### 控制台变更 \{#console-changes-3\}

- 优化了 SQL 控制台应用的初始加载时间
- 修复了 SQL 控制台中的竞争条件导致出现 “authentication failed” 错误的问题
- 修复了监控页面上最新内存分配值有时不正确的问题
- 修复了 SQL 控制台有时会发出重复 KILL QUERY 命令的问题
- 在 ClickPipes 中增加了对基于 Kafka 的数据源使用 SCRAM-SHA-256 认证方法的支持

### 集成变更 \{#integrations-changes-3\}

- Kafka Connector：扩展了对复杂嵌套结构（Array、Map）的支持；新增了对 FixedString 类型的支持；新增了向多个数据库摄取数据的支持
- Metabase：修复了与低于 23.8 版本的 ClickHouse 不兼容的问题
- DBT：新增了在创建模型时传递设置的能力
- Node.js 客户端：新增了对长时间运行查询（>1 小时）的支持，并改进了对空值的友好处理

## 2024 年 2 月 15 日 \{#february-15-2024\}

此版本升级了核心数据库版本，新增通过 Terraform 配置私有链接的能力，并为通过 Kafka Connect 进行异步插入提供了“恰好一次”语义支持。

### ClickHouse 版本升级 \{#clickhouse-version-upgrade-1\}

- 用于从 S3 持续、定时加载数据的 S3Queue 表引擎已可用于生产环境——详情参见 [23.11 版本博客](https://clickhouse.com/blog/clickhouse-release-23-11)。
- 在 FINAL 查询性能方面有显著提升，并改进了 SIMD 指令的向量化，从而加快查询速度——详情参见 [23.12 版本博客](https://clickhouse.com/blog/clickhouse-release-23-12#optimizations-for-final)。
- 此 ClickHouse Cloud 版本基于 23.12，包含数十项新特性、性能改进和错误修复。详情参见 [核心数据库变更日志](/whats-new/changelog/2023#2312)。

### 控制台变更 \{#console-changes-4\}

- 新增通过 Terraform provider 配置 AWS Private Link 和 GCP Private Service Connect 的功能
- 提升了远程文件数据导入的可靠性
- 为所有数据导入新增导入状态详情的侧边弹出面板
- 为 S3 数据导入新增 access key/secret key 凭证支持

### 集成变更 \{#integrations-changes-4\}

* Kafka Connect
  * 支持实现“恰好一次”语义的 `async_insert`（默认禁用）
* Golang 客户端
  * 修复了 DateTime 绑定
  * 提升批量插入性能
* Java 客户端
  * 修复了请求压缩问题

### 设置变更 \{#settings-changes\}

* 不再需要 `use_mysql_types_in_show_columns`。当你通过 MySQL 接口连接时，该设置会自动启用。
* `async_insert_max_data_size` 的默认值现在为 `10 MiB`

## 2024 年 2 月 2 日 \{#february-2-2024\}

本次发布提供了适用于 Azure Event Hub 的 ClickPipes，大幅改进了使用 v4 ClickHouse Grafana 连接器浏览日志和链路追踪的工作流，并首次引入对 Flyway 和 Atlas 数据库架构管理工具的支持。

### Console 变更 \{#console-changes-5\}

* 新增对 Azure Event Hub 的 ClickPipes 支持
* 新建服务的默认空闲时间为 15 分钟

### Integrations 变更 \{#integrations-changes-5\}

* [Grafana 的 ClickHouse 数据源](https://grafana.com/grafana/plugins/grafana-clickhouse-datasource/) v4 发布
  * 完全重构查询构建器，为 Table、Logs、Time Series 和 Traces 提供专用编辑器
  * 完全重构 SQL 生成器，以支持更复杂和更动态的查询
  * 在 Log 和 Trace 视图中新增对 OpenTelemetry 的一等公民级支持
  * 扩展配置，允许为 Logs 和 Traces 指定默认表和列
  * 新增支持指定自定义 HTTP 头
  * 以及更多改进——请查看完整[更新日志](https://github.com/grafana/clickhouse-datasource/blob/main/CHANGELOG.md#400)
* 数据库架构管理工具
  * [Flyway 新增 ClickHouse 支持](https://github.com/flyway/flyway-community-db-support/packages/2037428)
  * [Ariga Atlas 新增 ClickHouse 支持](https://atlasgo.io/blog/2023/12/19/atlas-v-0-16#clickhouse-beta-program)
* Kafka Connector Sink
  * 针对带有默认值的表优化了摄取性能
  * 新增对 DateTime64 中字符串形式日期的支持
* Metabase
  * 新增对连接多个数据库的支持

## 2024 年 1 月 18 日 \{#january-18-2024\}

本次发布在 AWS 中增加了一个新区域（伦敦 / eu-west-2），为 Redpanda、Upstash 和 Warpstream 增加了 ClickPipes 支持，并提升了 [is_deleted](/engines/table-engines/mergetree-family/replacingmergetree#is_deleted) 核心数据库能力的可靠性。

### 一般变更 \{#general-changes\}

- 新增 AWS 区域：伦敦（eu-west-2）

### Console 变更 \{#console-changes-6\}

- 为 Redpanda、Upstash 和 Warpstream 增加了 ClickPipes 支持
- 在 UI 中将 ClickPipes 身份验证机制做成可配置项

### 集成变更 \{#integrations-changes-6\}

- Java 客户端：
  - 破坏性变更：移除了在调用中指定任意 URL 句柄的能力。该功能已从 ClickHouse 中移除
  - 弃用项：Java CLI 客户端和 gRPC 包
  - 增加了对 RowBinaryWithDefaults 格式的支持，以减少批大小和 ClickHouse 实例上的工作负载（应 Exabeam 请求）
  - 使 Date32 和 DateTime64 的范围边界与 ClickHouse 保持一致，并改进了与 Spark Array 字符串类型以及节点选择机制的兼容性
- Kafka Connector：为 Grafana 添加了 JMX 监控仪表盘
- Power BI：在 UI 中将 ODBC 驱动设置做成可配置项
- JavaScript 客户端：暴露查询摘要信息，允许在插入时仅提供部分特定列，使 Web 客户端的 keep_alive 可配置
- Python 客户端：为 SQLAlchemy 添加了 Nothing 类型支持

### 可靠性变更 \{#reliability-changes\}

- 面向用户的向后不兼容变更：此前，在某些条件下，两个特性（[is_deleted](/engines/table-engines/mergetree-family/replacingmergetree#is_deleted) 和 ``OPTIMIZE CLEANUP``）可能会导致 ClickHouse 中数据损坏。为了在保留功能核心的同时保护用户数据的完整性，我们调整了该特性的工作方式。具体而言，MergeTree 设置 ``clean_deleted_rows`` 现已弃用并且不再产生任何效果。默认情况下不允许使用 ``CLEANUP`` 关键字（如需使用，需要先启用 ``allow_experimental_replacing_merge_with_cleanup``）。如果你决定使用 ``CLEANUP``，需要确保它始终与 ``FINAL`` 一起使用，并且你必须保证在运行 ``OPTIMIZE FINAL CLEANUP`` 之后，不会再插入具有更早版本的行。

## 2023 年 12 月 18 日 \{#december-18-2023\}

此版本带来了 GCP 新区域（us-east1）、自助配置安全端点连接的能力、对包括 DBT 1.7 在内的更多集成的支持，以及大量缺陷修复和安全增强。

### 通用更新 \{#general-changes-1\}

- ClickHouse Cloud 现已在 GCP us-east1（南卡罗来纳州）区域提供
- 通过 OpenAPI 启用配置 AWS Private Link 和 GCP Private Service Connect 的能力

### 控制台更新 \{#console-changes-7\}

- 为具有 Developer 角色的用户启用了无缝登录 SQL 控制台的功能
- 精简了在注册引导过程中设置空闲控制策略（idling controls）的工作流

### 集成更新 \{#integrations-changes-7\}

- DBT 连接器：新增对最高至 DBT v1.7 的支持
- Metabase：新增对 Metabase v0.48 的支持
- Power BI 连接器：新增对在 Power BI Cloud 上运行的支持
- 使 ClickPipes 内部用户的权限可配置
- Kafka Connect
  - 改进了去重逻辑和对 Nullable 类型的摄取
  - 新增对基于文本的格式（CSV、TSV）的支持
- Apache Beam：新增对 Boolean 和 LowCardinality 类型的支持
- Node.js 客户端：新增对 Parquet 格式的支持

### 安全公告 \{#security-announcements\}

- 修补了 3 个安全漏洞——详情参见[安全变更日志](/whats-new/security-changelog)：
  - CVE 2023-47118（CVSS 7.0）——影响默认在 9000/tcp 端口上运行的原生接口的堆缓冲区溢出漏洞
  - CVE-2023-48704（CVSS 7.0）——影响默认在 9000/tcp 端口上运行的原生接口的堆缓冲区溢出漏洞
  - CVE 2023-48298（CVSS 5.9）——FPC 压缩编解码器中的整数下溢漏洞

## 2023 年 11 月 22 日 \{#november-22-2023\}

本次发布升级了核心数据库版本，改进了登录和认证流程，并为 Kafka Connect Sink 增加了代理支持。

### ClickHouse 版本升级 \{#clickhouse-version-upgrade-2\}

- 显著提升读取 Parquet 文件时的性能。详情参见 [23.8 发布博客](https://clickhouse.com/blog/clickhouse-release-23-08)。
- 新增 JSON 类型推断支持。详情参见 [23.9 发布博客](https://clickhouse.com/blog/clickhouse-release-23-09)。
- 引入了面向分析人员的强大函数，例如 `ArrayFold`。详情参见 [23.10 发布博客](https://clickhouse.com/blog/clickhouse-release-23-10)。
- **面向用户的不兼容变更**：默认禁用设置 `input_format_json_try_infer_numbers_from_strings`，以避免在 JSON 格式中从字符串推断数字。这样可以避免当样本数据包含与数字相似的字符串时可能出现的解析错误。
- 数十项新特性、性能改进和缺陷修复。详情参见 [核心数据库更新日志](/whats-new/changelog)。

### Console 变更 \{#console-changes-8\}

- 改进了登录和认证流程。
- 改进了基于 AI 的查询建议，更好地支持大型 schema。

### 集成变更 \{#integrations-changes-8\}

- Kafka Connect Sink：新增代理支持、`topic-tablename` 映射，以及 Keeper 的 _exactly-once_ 投递属性的可配置能力。
- Node.js 客户端：新增对 Parquet 格式的支持。
- Metabase：新增对 `datetimeDiff` 函数的支持。
- Python 客户端：新增对列名中包含特殊字符的支持，并修复了时区参数绑定问题。

## 2023 年 11 月 2 日 \{#november-2-2023\}

本次发布为亚洲地区的开发服务增加了更多区域支持，引入了客户管理加密密钥的密钥轮换功能，改进了计费控制台中的税务设置粒度，并修复了多个受支持语言客户端中的若干问题。

### 常规更新 \{#general-updates-1\}

- 开发服务现已在 AWS 的 `ap-south-1`（孟买）和 `ap-southeast-1`（新加坡）区域提供
- 为客户管理加密密钥（CMEK）增加了密钥轮换支持

### 控制台更改 \{#console-changes-9\}

- 在添加信用卡时，新增了更细粒度的税务设置配置功能

### 集成更改 \{#integrations-changes-9\}

- MySQL
  - 通过 MySQL 改进了对 Tableau Online 和 QuickSight 的支持
- Kafka Connector
  - 引入了新的 StringConverter，以支持基于文本的格式（CSV、TSV）
  - 增加了对 Bytes 和 Decimal 数据类型的支持
  - 调整了可重试异常，使其现在始终会被重试（即使在 errors.tolerance=all 时）
- Node.js 客户端
  - 修复了在流式处理大型数据集时导致结果损坏的问题
- Python 客户端
  - 修复了大批量插入时的超时问题
  - 修复了 NumPy/Pandas 的 Date32 问题
- Golang 客户端
  - 修复了向 JSON 列插入空 map、压缩缓冲区清理、查询转义以及 IPv4 和 IPv6 为 zero/nil 时导致 panic 等问题
  - 为被取消的插入操作添加了 watchdog
- DBT
  - 通过测试改进了对分布式表的支持

## 2023 年 10 月 19 日 \{#october-19-2023\}

此版本改进了 SQL 控制台的易用性和性能、增强了 Metabase 连接器中 IP 数据类型的处理能力，并为 Java 和 Node.js 客户端增加了新功能。

### 控制台变更 \{#console-changes-10\}

- 提升 SQL 控制台的易用性（例如：在多次执行查询时保持列宽设置不变）
- 提升 SQL 控制台的性能

### 集成变更 \{#integrations-changes-10\}

- Java 客户端：
  - 切换默认网络库以提升性能并复用已打开的连接
  - 新增代理支持
  - 新增通过 Trust Store 建立安全连接的支持
- Node.js 客户端：修复插入查询的 keep-alive 行为
- Metabase：修复 IPv4/IPv6 列序列化问题

## 2023 年 9 月 28 日 \{#september-28-2023\}

本次发布带来了适用于 Kafka、Confluent Cloud 和 Amazon MSK 的 ClickPipes 以及 Kafka Connect ClickHouse Sink 的正式可用版本、自助式的通过 IAM 角色保护对 Amazon S3 访问的工作流，以及由 AI 辅助的查询建议（私有预览版）。

### 控制台变更 \{#console-changes-11\}

- 新增自助式工作流，用于通过 IAM 角色保护[对 Amazon S3 的访问](/cloud/data-sources/secure-s3)
- 在私有预览版中引入由 AI 辅助的查询建议（如需试用，请[联系 ClickHouse Cloud 支持](https://console.clickhouse.cloud/support)）

### 集成变更 \{#integrations-changes-11\}

- 宣布 ClickPipes（即开即用的数据摄取服务）在 Kafka、Confluent Cloud 和 Amazon MSK 上正式可用（参见[发布博客](https://clickhouse.com/blog/clickpipes-is-generally-available)）
- Kafka Connect ClickHouse Sink 已正式可用
  - 扩展了对通过 `clickhouse.settings` 属性自定义 ClickHouse 设置的支持
  - 改进了去重行为，以便考虑动态字段
  - 新增对 `tableRefreshInterval` 的支持，用于从 ClickHouse 重新获取表变更
- 修复了 [PowerBI](/integrations/powerbi) 与 ClickHouse 数据类型之间的 SSL 连接问题和类型映射问题

## 2023 年 9 月 7 日 \{#september-7-2023\}

此次发布带来了 PowerBI Desktop 官方连接器测试版、面向印度的信用卡支付处理改进，以及对多种受支持的语言客户端的一系列改进。

### 控制台更新 \{#console-changes-12\}

- 新增剩余额度和支付重试信息，以支持从印度发起的扣款

### 集成更新 \{#integrations-changes-12\}

- Kafka Connector：新增对配置 ClickHouse 设置的支持，新增 `error.tolerance` 配置项
- PowerBI Desktop：发布官方连接器测试版
- Grafana：新增对 Point 地理类型的支持，修复 Data Analyst 仪表板中的 Panels，修复 `timeInterval` 宏
- Python 客户端：兼容 Pandas 2.1.0，移除对 Python 3.7 的支持，新增对可空 JSON 类型的支持
- Node.js 客户端：新增 `default_format` 设置支持
- Golang 客户端：修复 `bool` 类型处理，移除字符串长度限制

## 2023 年 8 月 24 日 \{#aug-24-2023\}

本次发布为 ClickHouse 数据库新增了 MySQL 接口支持，引入了新的官方 Power BI 连接器，在云控制台中增加了新的“Running Queries（正在运行的查询）”视图，并将 ClickHouse 版本升级至 23.7。

### 常规更新 \{#general-updates-2\}

- 新增对 [MySQL wire protocol](/interfaces/mysql) 的支持，这使得（除其他用例外）可以与许多现有 BI 工具兼容。如需为您的组织启用此功能，请联系技术支持。
- 引入新的官方 Power BI 连接器

### 控制台更改 \{#console-changes-13\}

- 在 SQL 控制台中新增对“Running Queries（正在运行的查询）”视图的支持

### ClickHouse 23.7 版本升级 \{#clickhouse-237-version-upgrade\}

- 新增对 Azure Table 函数的支持，将 geo 数据类型提升为可用于生产环境，并改进了 join 性能——详情参见 23.5 版本发布[博客](https://clickhouse.com/blog/clickhouse-release-23-05)
- 将 MongoDB 集成支持扩展到 6.0 版本——详情参见 23.6 版本发布[博客](https://clickhouse.com/blog/clickhouse-release-23-06)
- 将写入 Parquet 格式的性能提升了 6 倍，新增对 PRQL 查询语言的支持，并改进了 SQL 兼容性——详情参见 23.7 版本发布[演示文稿](https://presentations.clickhouse.com/release_23.7/)
- 数十项新功能、性能改进和缺陷修复——详情参见 23.5、23.6、23.7 的详细[更新日志](/whats-new/changelog)

### 集成变更 \{#integrations-changes-13\}

- Kafka Connector：新增对 Avro Date 和 Time 类型的支持
- JavaScript client：发布了面向 Web 环境的稳定版本
- Grafana：改进了过滤逻辑、数据库名称处理，并新增对具备亚秒级精度的 TimeInteval 的支持
- Golang Client：修复了若干批量和异步数据加载问题
- Metabase：支持 v0.47，新增连接身份冒充（impersonation），修复了数据类型映射问题

## 2023 年 7 月 27 日 \{#july-27-2023\}

本次发布带来了 ClickPipes for Kafka 的私有预览、全新的数据加载体验，以及通过云控制台从 URL 加载文件的功能。

### 集成变更 \{#integrations-changes-14\}

- 推出 [ClickPipes](https://clickhouse.com/cloud/clickpipes) for Kafka 的私有预览，这是一款云原生集成引擎，可将来自 Kafka 和 Confluent Cloud 的海量数据摄取简化为只需点击几下。请在[此处](https://clickhouse.com/cloud/clickpipes#joinwaitlist)加入候补名单。
- JavaScript 客户端：新增对 Web 环境（浏览器、Cloudflare Workers）的支持。对代码进行了重构，以便社区为自定义环境创建连接器。
- Kafka Connector：新增对在内联 schema 中使用 Timestamp 和 Time Kafka 类型的支持
- Python 客户端：修复了插入压缩和 LowCardinality 读取问题

### 控制台变更 \{#console-changes-14\}

- 新增全新的数据加载体验，提供更多建表配置选项
- 新增通过云控制台从 URL 加载文件的功能
- 改进邀请流程，增加加入其他组织以及查看所有未处理邀请的选项

## 2023 年 7 月 14 日 \{#july-14-2023\}

本次发布引入了启动专用服务的功能、澳大利亚新的 AWS 区域，以及使用自有密钥对磁盘数据进行加密的能力。

### 常规更新 \{#general-updates-3\}

- 新增 AWS 澳大利亚区域：悉尼（ap-southeast-2）
- 面向高要求、对延迟敏感工作负载的专用层级服务（请联系 [support](https://console.clickhouse.cloud/support) 进行设置）
- 自带密钥（BYOK）用于磁盘数据加密（请联系 [support](https://console.clickhouse.cloud/support) 进行设置）

### 控制台变更 \{#console-changes-15\}

- 改进了异步插入的可观测性指标仪表板
- 改进了与支持系统集成的聊天机器人的行为

### 集成变更 \{#integrations-changes-15\}

- Node.js 客户端：修复了由于套接字超时导致连接失败的问题
- Python 客户端：在插入查询中添加了 QuerySummary，支持在数据库名称中使用特殊字符
- Metabase：更新 JDBC 驱动版本，新增对 DateTime64 的支持，并提升了性能

### 核心数据库变更 \{#core-database-changes\}

- [Query cache](/operations/query-cache) 现在可以在 ClickHouse Cloud 中启用。启用后，成功的查询默认会被缓存 1 分钟，后续相同查询将使用缓存结果。

## 2023 年 6 月 20 日 \{#june-20-2023\}

本次发布将运行在 GCP 上的 ClickHouse Cloud 提升为一般可用（GA）状态，引入了用于 Cloud API 的 Terraform provider，并将 ClickHouse 版本更新至 23.4。

### 通用更新 \{#general-updates-4\}

- 运行在 GCP 上的 ClickHouse Cloud 现已 GA，带来了与 GCP Marketplace 的集成、对 Private Service Connect 的支持以及自动备份（详情参见 [博客](https://clickhouse.com/blog/clickhouse-cloud-on-google-cloud-platform-gcp-is-generally-available) 和 [新闻稿](https://clickhouse.com/blog/clickhouse-cloud-expands-choice-with-launch-on-google-cloud-platform)）
- 现已提供用于 Cloud API 的 [Terraform provider](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs)

### 控制台变更 \{#console-changes-16\}

- 为服务新增了统一的设置页面
- 调整了存储与计算的计量精度

### 集成变更 \{#integrations-changes-16\}

- Python 客户端：提升了插入性能，重构内部依赖以支持多进程
- Kafka Connector：现在可以上传并安装到 Confluent Cloud，针对临时连接问题增加了重试机制，可自动重置错误的连接器状态

### ClickHouse 23.4 版本升级 \{#clickhouse-234-version-upgrade\}

- 为并行副本添加了 JOIN 支持（请联系 [support](https://console.clickhouse.cloud/support) 进行配置）
- 提升轻量级删除操作的性能
- 在处理大批量插入时改进了缓存机制

### 管理变更 \{#administration-changes-1\}

- 放宽对非 "default" 用户创建本地字典的支持

## 2023 年 5 月 30 日 \{#may-30-2023\}

此版本公开发布用于控制平面操作的 ClickHouse Cloud 可编程 API（详情参见[博客](https://clickhouse.com/blog/using-the-new-clickhouse-cloud-api-to-automate-deployments)）、通过 IAM 角色访问 S3，以及额外的扩缩容选项。

### 常规变更 \{#general-changes-2\}

- 为 ClickHouse Cloud 提供 API 支持。借助新的 Cloud API，您可以将服务管理无缝集成到现有的 CI/CD 流水线中，并通过编程方式管理您的服务
- 通过 IAM 角色访问 S3。您现在可以利用 IAM 角色安全地访问您的私有 Amazon Simple Storage Service (S3) 存储桶（请联系技术支持进行设置）

### 扩缩容相关变更 \{#scaling-changes\}

- [水平扩展](/manage/scaling#manual-horizontal-scaling)。需要更多并行化的工作负载现在可以配置最多 10 个副本（请联系技术支持进行设置）
- [基于 CPU 的自动扩缩容](/manage/scaling)。CPU 受限的工作负载现在可以从额外的自动扩缩容策略触发器中获益

### 控制台变更 \{#console-changes-17\}

- 将 Dev 服务迁移到 Production 服务（请联系技术支持启用）
- 在实例创建流程中新增扩缩容配置选项
- 修复在默认密码不在内存中时的连接字符串问题

### 集成相关变更 \{#integrations-changes-17\}

- Golang 客户端：修复了导致原生协议连接分布不均衡的问题，增加对原生协议中自定义设置的支持
- Node.js 客户端：移除对 Node.js v14 的支持，新增对 v20 的支持
- Kafka Connector：新增对 LowCardinality 类型的支持
- Metabase：修复按时间范围分组的问题，修复对内置 Metabase 问题中整数类型的支持

### 性能与可靠性 \{#performance-and-reliability\}

- 提升写入密集型工作负载的效率和性能
- 部署增量备份策略以提升备份的速度和效率

## 2023 年 5 月 11 日 \{#may-11-2023\}

本次发布在 GCP 上推出 ClickHouse Cloud 的公开测试版
（详情参见[博客](https://clickhouse.com/blog/clickhouse-cloud-on-gcp-available-in-public-beta)），
扩展了管理员授予终止查询权限的能力，并在 Cloud 控制台中提供了对启用 MFA 的用户状态的更高可见性。

:::note 更新
ClickHouse Cloud 在 GCP 上现已 GA，请参阅上方 6 月 20 日的条目。
:::

### ClickHouse Cloud 在 GCP 上现已提供公开测试版 \{#clickhouse-cloud-on-gcp-is-now-available-in-public-beta-now-ga-see-june-20th-entry-above\}

:::note
ClickHouse Cloud 在 GCP 上现已 GA，请参阅上方的 [6 月 20 日](#june-20-2023) 条目。
:::

- 推出在 Google Compute 和 Google Cloud Storage 之上运行的、完全托管的存储与计算分离的 ClickHouse 服务
- 在 Iowa（us-central1）、Netherlands（europe-west4）和 Singapore（asia-southeast1）区域可用
- 在上述三个初始区域中均支持开发（Development）和生产（Production）服务
- 默认即提供强安全性：传输全程加密、静态数据加密、IP 允许列表

### 集成变更 \{#integrations-changes-18\}

- Golang 客户端：新增对代理环境变量的支持
- Grafana：在配置 Grafana 数据源时，新增可指定 ClickHouse 自定义设置和代理环境变量的能力
- Kafka Connector：改进了对空记录的处理

### 控制台变更 \{#console-changes-18\}

- 在用户列表中新增多因素认证（MFA）使用情况指示器

### 性能与可靠性 \{#performance-and-reliability-1\}

- 为管理员新增对终止查询权限的更细粒度控制

## 2023 年 5 月 4 日 \{#may-4-2023\}

此版本带来了新的热力图图表类型，改进了计费使用情况页面，并缩短了服务启动时间。

### 控制台变更 \{#console-changes-19\}

- 在 SQL 控制台中新增热力图图表类型
- 改进计费使用情况页面，以显示在各个计费维度中消耗的额度

### 集成变更 \{#integrations-changes-19\}

- Kafka 连接器：为瞬时连接错误新增重试机制
- Python 客户端：新增 `max_connection_age` 设置，以确保 HTTP 连接不会被无限期复用。这有助于解决某些负载均衡问题
- Node.js 客户端：新增对 Node.js v20 的支持
- Java 客户端：改进客户端证书认证支持，并新增对嵌套 `Tuple`/`Map`/`Nested` 类型的支持

### 性能和可靠性 \{#performance-and-reliability-2\}

- 在存在大量数据片段（parts）时改进服务启动时间
- 优化 SQL 控制台中长时间运行查询的取消逻辑

### Bug 修复 \{#bug-fixes\}

- 修复了导致“Cell Towers”示例数据集导入失败的缺陷

## 2023 年 4 月 20 日 \{#april-20-2023\}

此版本将 ClickHouse 升级到 23.3，大幅提升冷数据读取性能，并引入与技术支持的实时聊天功能。

### Console 更改 \{#console-changes-20\}

- 新增与技术支持进行实时聊天的选项

### 集成更改 \{#integrations-changes-20\}

- Kafka 连接器：新增对 Nullable 类型的支持
- Go 客户端：新增对 external tables 的支持，并支持 boolean 和 pointer 类型参数绑定

### 配置更改 \{#configuration-changes\}

- 新增对删除大表的支持——可通过覆盖 `max_table_size_to_drop` 和 `max_partition_size_to_drop` 配置项来实现

### 性能与可靠性 \{#performance-and-reliability-3\}

- 通过 `allow_prefetched_read_pool_for_remote_filesystem` 设置启用基于 S3 的预取功能，以提升冷数据读取速度

### ClickHouse 23.3 版本升级 \{#clickhouse-233-version-upgrade\}

- 轻量级删除已达到生产可用级别——详情参见 23.3 版本发布[博客](https://clickhouse.com/blog/clickhouse-release-23-03)
- 新增对 multi-stage PREWHERE 的支持——详情参见 23.2 版本发布[博客](https://clickhouse.com/blog/clickhouse-release-23-03)
- 数十项新特性、性能改进和缺陷修复——参见 23.3 和 23.2 的详细[更新日志](/whats-new/changelog/index.md)

## 2023 年 4 月 6 日 \{#april-6-2023\}

本次发布带来了用于检索云端点的 API、用于控制最小空闲超时的高级扩缩容控制，以及在 Python 客户端查询方法中对外部数据的支持。

### API changes \{#api-changes\}

* 新增通过 [Cloud Endpoints API](//cloud/get-started/query-endpoints.md) 以编程方式查询 ClickHouse Cloud 端点的功能

### Console changes \{#console-changes-21\}

- 在高级扩缩容设置中新增“最小空闲超时时间”选项
- 在数据加载弹窗的模式推断中新增尽力而为的日期时间类型自动检测

### Integrations changes \{#integrations-changes-21\}

- [Metabase](/integrations/data-visualization/metabase-and-clickhouse.md)：新增对多个 schema 的支持
- [Go client](/integrations/language-clients/go/index.md)：修复了 TLS 连接的空闲连接存活检查
- [Python client](/integrations/language-clients/python/index.md)
  - 在查询方法中新增对外部数据的支持
  - 为查询结果新增时区支持
  - 新增对 `no_proxy`/`NO_PROXY` 环境变量的支持
  - 修复了 Nullable 类型中 NULL 值的服务端参数绑定问题

### Bug fixes \{#bug-fixes-1\}

* 修复了从 SQL 控制台运行 `INSERT INTO ... SELECT ...` 时错误地套用与 SELECT 查询相同行数限制的行为

## 2023 年 3 月 23 日 \{#march-23-2023\}

本次发布带来了数据库密码复杂度规则、大型备份恢复效率的大幅提升，以及在 Grafana Trace View 中展示 trace 的支持。

### 安全性和可靠性 \{#security-and-reliability\}

- 核心数据库端点现在强制执行密码复杂度规则
- 显著缩短了大型备份的恢复时间

### Console 变更 \{#console-changes-22\}

- 精简了上手引导流程，引入了新的默认设置和更紧凑的视图
- 降低了注册和登录的延迟

### 集成变更 \{#integrations-changes-22\}

- Grafana：
  - 新增对在 Trace View 中显示存储在 ClickHouse 中的 trace 数据的支持
  - 改进了时间范围过滤器，并新增对表名中包含特殊字符的支持
- Superset：新增原生 ClickHouse 支持
- Kafka Connect Sink：新增自动日期转换和 Null 列处理
- Metabase：实现了与 v0.46 的兼容性
- Python client：修复了向临时表插入数据的问题，并新增对 Pandas Null 的支持
- Golang client：统一了带时区的 Date 类型
- Java client
  - 在 SQL parser 中新增对 compression、infile 和 outfile 关键字的支持
  - 新增凭证参数重载
  - 修复了使用 `ON CLUSTER` 的批量操作支持问题
- Node.js client
  - 新增对 JSONStrings、JSONCompact、JSONCompactStrings、JSONColumnsWithMetadata 格式的支持
  - 现在可以为所有主要的 client 方法提供 `query_id`

### Bug 修复 \{#bug-fixes-2\}

- 修复了导致新服务初始配置和启动时间过长的 bug
- 修复了由于缓存配置错误导致查询性能下降的 bug

## 2023 年 3 月 9 日 \{#march-9-2023\}

此版本改进了可观测性仪表板，优化了创建大型备份所需的时间，并添加了删除大型表和分区所需的配置。

### 控制台更新 \{#console-changes-23\}

- 新增高级可观测性仪表板（预览）
- 在可观测性仪表板中新增内存分配图表
- 改进了 SQL Console 电子表格视图中的间距和换行处理

### 可靠性和性能 \{#reliability-and-performance\}

- 优化了备份计划，仅在数据发生变更时才执行备份
- 改进了完成大型备份所需的时间

### 配置变更 \{#configuration-changes-1\}

- 通过在查询或连接级别覆盖 `max_table_size_to_drop` 和 `max_partition_size_to_drop` 设置，可提高删除表和分区的大小限制
- 在查询日志中新增源 IP，以便基于源 IP 强制执行配额和访问控制

### 集成 \{#integrations\}

- [Python client](/integrations/language-clients/python/index.md)：改进了对 Pandas 的支持并修复了与时区相关的问题
- [Metabase](/integrations/data-visualization/metabase-and-clickhouse.md)：兼容 Metabase 0.46.x 并支持 SimpleAggregateFunction
- [Kafka-Connect](/integrations/data-ingestion/kafka/index.md)：支持隐式日期转换，并改进了对空列的处理
- [Java Client](https://github.com/ClickHouse/clickhouse-java)：支持将嵌套结构转换为 Java Map

##  2023 年 2 月 23 日 \{#february-23-2023\}

本次发布启用了 ClickHouse 23.1 核心版本中的部分功能，引入了与 Amazon Managed Streaming for Apache Kafka (MSK) 的互操作性，并在活动日志中提供了高级扩缩容和空闲状态调节设置。

### ClickHouse 23.1 版本升级 \{#clickhouse-231-version-upgrade\}

增加了对 ClickHouse 23.1 中部分功能的支持，例如：

- 对 Map 类型使用 ARRAY JOIN
- 符合 SQL 标准的十六进制与二进制字面量
- 新增函数，包括 `age()`, `quantileInterpolatedWeighted()`, `quantilesInterpolatedWeighted()`
- 能够在不带参数的情况下，在 `generateRandom` 中使用插入表的结构
- 改进了数据库创建和重命名逻辑，允许重复使用之前的名称
- 详情参见 23.1 发布[网络研讨会幻灯片](https://presentations.clickhouse.com/release_23.1/#cover)和 [23.1 发布变更日志](/whats-new/cloud#clickhouse-231-version-upgrade)

### 集成变更 \{#integrations-changes-23\}

- [Kafka-Connect](/integrations/data-ingestion/kafka/index.md)：新增对 Amazon MSK 的支持
- [Metabase](/integrations/data-visualization/metabase-and-clickhouse.md)：首个稳定版本 1.0.0
  - 已在 [Metabase Cloud](https://www.metabase.com/start/) 上提供该连接器
  - 新增了探索所有可用数据库的功能
  - 修复了带 AggregationFunction 类型的数据库同步问题
- [DBT-clickhouse](/integrations/data-ingestion/etl-tools/dbt/index.md)：新增对最新 DBT 版本 v1.4.1 的支持
- [Python client](/integrations/language-clients/python/index.md)：改进了代理和 SSH 隧道支持；对 Pandas DataFrame 进行了多项修复和性能优化
- [Nodejs client](/integrations/language-clients/js.md)：新增支持将 `query_id` 附加到查询结果，可用于从 `system.query_log` 中获取查询指标
- [Golang client](/integrations/language-clients/go/index.md)：优化了与 ClickHouse Cloud 的网络连接

### Console 变更 \{#console-changes-24\}

- 在活动日志中新增高级扩缩容和空闲设置调节
- 在重置密码邮件中增加了 user agent 和 IP 信息
- 改进了使用 Google OAuth 的注册流程

### 可靠性与性能 \{#reliability-and-performance-1\}

- 加快了大型服务从空闲状态恢复的时间
- 改善了拥有大量表和分区的服务的读取延迟

### Bug 修复 \{#bug-fixes-3\}

- 修复了重置服务密码时未遵循密码策略的问题
- 使组织邀请邮件的电子邮件地址验证不区分大小写

## 2023 年 2 月 2 日 \{#february-2-2023\}

本次发布带来了官方支持的 Metabase 集成、一次重要的 Java 客户端 / JDBC 驱动版本发布，以及在 SQL 控制台中对视图和物化视图的支持。

### 集成变更 \{#integrations-changes-24\}

- [Metabase](/integrations/data-visualization/metabase-and-clickhouse.md) 插件：成为由 ClickHouse 维护的官方解决方案
- [dbt](/integrations/data-ingestion/etl-tools/dbt/index.md) 插件：新增对[多线程](https://github.com/ClickHouse/dbt-clickhouse/blob/main/CHANGELOG.md)的支持
- [Grafana](/integrations/data-visualization/grafana/index.md) 插件：改进连接错误处理
- [Python](/integrations/language-clients/python/index.md) 客户端：为插入操作提供[流式支持](/integrations/language-clients/python/advanced-querying.md#streaming-queries)
- [Go](/integrations/language-clients/go/index.md) 客户端：[错误修复](https://github.com/ClickHouse/clickhouse-go/blob/main/CHANGELOG.md)：关闭已取消的连接，并改进连接错误处理
- [JS](/integrations/language-clients/js.md) 客户端：[exec/insert 中的不兼容变更](https://github.com/ClickHouse/clickhouse-js/releases/tag/0.0.12)；在返回类型中暴露 query_id
- [Java](https://github.com/ClickHouse/clickhouse-java#readme) 客户端 / JDBC 驱动重大版本发布
  - [不兼容变更](https://github.com/ClickHouse/clickhouse-java/releases)：移除所有已弃用的方法、类和包
  - 新增 R2DBC 驱动和文件插入操作支持

### 控制台变更 \{#console-changes-25\}

- 在 SQL 控制台中新增对视图和物化视图的支持

### 性能和可靠性 \{#performance-and-reliability-4\}

- 加快停止/空闲实例的密码重置速度
- 通过更精确的活动跟踪改进缩容行为
- 修复 SQL 控制台 CSV 导出被截断的问题
- 修复导致示例数据上传间歇性失败的问题

## 2023 年 1 月 12 日 \{#january-12-2023\}

此版本将 ClickHouse 升级到 22.12，为更多新的数据源启用了字典，并提升了查询性能。

### 常规变更 \{#general-changes-3\}

- 为更多数据源启用字典，包括外部 ClickHouse、Cassandra、MongoDB、MySQL、PostgreSQL 和 Redis

### ClickHouse 22.12 版本升级 \{#clickhouse-2212-version-upgrade\}

- 扩展 JOIN 支持，新增 Grace Hash Join
- 新增对 Binary JSON (BSON) 文件读取的支持
- 新增对标准 SQL 语法 GROUP BY ALL 的支持
- 新增用于定点小数运算的数学函数
- 完整变更列表请参阅 [22.12 版本发布博客](https://clickhouse.com/blog/clickhouse-release-22-12) 和 [详细的 22.12 变更日志](/whats-new/cloud#clickhouse-2212-version-upgrade)

### 控制台变更 \{#console-changes-26\}

- 改进 SQL Console 中的自动补全功能
- 默认区域现在会考虑所属大洲的地域性
- 改进 Billing Usage 页面，以同时显示计费与网站使用单位

### 集成变更 \{#integrations-changes-25\}

- DBT 版本 [v1.3.2](https://github.com/ClickHouse/dbt-clickhouse/blob/main/CHANGELOG.md#release-132-2022-12-23)
  - 新增对 delete+insert 增量策略的实验性支持
  - 新增 s3source 宏
- Python 客户端 [v0.4.8](https://github.com/ClickHouse/clickhouse-connect/blob/main/CHANGELOG.md#048-2023-01-02)
  - 支持文件插入
  - 支持服务端查询[参数绑定](/interfaces/cli.md/#cli-queries-with-parameters)
- Go 客户端 [v2.5.0](https://github.com/ClickHouse/clickhouse-go/releases/tag/v2.5.0)
  - 降低压缩过程中的内存使用
  - 支持服务端查询[参数绑定](/interfaces/cli.md/#cli-queries-with-parameters)

### 可靠性与性能 \{#reliability-and-performance-2\}

- 提升针对在对象存储上读取大量小文件的查询的读取性能
- 对于新启动的服务，将 [compatibility](/operations/settings/settings#compatibility) 设置为服务首次启动时的版本

### 缺陷修复 \{#bug-fixes-4\}
使用 Advanced Scaling 滑块预留资源现在会立即生效。

## 2022 年 12 月 20 日 \{#december-20-2022\}

此版本引入了管理员无缝登录 SQL 控制台、冷读场景下优化的读取性能，以及改进后的适用于 ClickHouse Cloud 的 Metabase 连接器。

### 控制台变更 \{#console-changes-27\}

- 为管理员用户启用了对 SQL 控制台的无缝访问
- 将新受邀用户的默认角色更改为 “Administrator”
- 新增用户引导问卷

### 可靠性和性能 \{#reliability-and-performance-3\}

- 为运行时间较长的 insert 查询添加了重试逻辑，以便在发生网络故障时进行恢复
- 改进了冷读的读取性能

### 集成变更 \{#integrations-changes-26\}

- [Metabase 插件](/integrations/data-visualization/metabase-and-clickhouse.md) 迎来了期待已久的 v0.9.1 重大更新。现在它与最新的 Metabase 版本兼容，并已在 ClickHouse Cloud 上经过全面测试。

## 2022 年 12 月 6 日 - 正式可用（GA） \{#december-6-2022---general-availability\}

ClickHouse Cloud 现已达到生产级就绪状态，具备 SOC2 Type II 合规性、面向生产工作负载的可用性 SLA 以及公开的状态页。本次发布包含多项全新重要功能，例如 AWS Marketplace 集成、SQL console——面向 ClickHouse 用户的数据探索工作台，以及 ClickHouse Academy——在 ClickHouse Cloud 中的自定进度学习。详细内容请参阅这篇[博客](https://clickhouse.com/blog/clickhouse-cloud-generally-available)。

### 生产就绪 \{#production-ready\}

- 符合 SOC2 Type II（详见[博客](https://clickhouse.com/blog/clickhouse-cloud-is-now-soc-2-type-ii-compliant)和 [Trust Center](https://trust.clickhouse.com/)）
- ClickHouse Cloud 提供公开的[状态页](https://status.clickhouse.com/)
- 为生产用例提供可用性 SLA
- 已在 [AWS Marketplace](https://aws.amazon.com/marketplace/pp/prodview-jettukeanwrfc) 上架

### 主要新功能 \{#major-new-capabilities\}

- 引入 SQL console，面向 ClickHouse 用户的数据探索工作台
- 发布 [ClickHouse Academy](https://learn.clickhouse.com/visitor_class_catalog)，在 ClickHouse Cloud 中提供自定进度学习

### 定价与计量变更 \{#pricing-and-metering-changes\}

- 试用期延长至 30 天
- 引入固定容量、低月支出的 Development Services，非常适合入门项目以及开发 / 预生产环境
- 引入新的、更低的 Production Services 定价，随着我们持续改进 ClickHouse Cloud 的运行与扩展方式
- 提升计算计量的粒度和精确度

### 集成变更 \{#integrations-changes-27\}

- 启用对 ClickHouse Postgres / MySQL 集成引擎的支持
- 增加对 SQL 用户定义函数（UDF）的支持
- 将 Kafka Connect sink 推进至 Beta 阶段
- 通过引入关于版本、更新状态等的丰富元数据改进集成 UI

### Console 变更 \{#console-changes-28\}

- 云控制台支持多因素认证
- 改进云控制台在移动设备上的导航体验

### 文档变更 \{#documentation-changes\}

- 为 ClickHouse Cloud 新增了专门的[文档](/cloud/overview)部分

### Bug 修复 \{#bug-fixes-5\}

- 解决了因依赖解析问题导致从备份恢复有时无法正常工作这一已知问题

## 2022 年 11 月 29 日 \{#november-29-2022\}

此版本实现了 SOC 2 Type II 合规性，将 ClickHouse 版本更新到 22.11，并改进了多个 ClickHouse 客户端和集成。

### 常规变更 \{#general-changes-4\}

- 达到 SOC 2 Type II 合规标准（详见 [博客](https://clickhouse.com/blog/clickhouse-cloud-is-now-soc-2-type-ii-compliant) 和 [信任中心](https://trust.clickhouse.com)）

### 控制台变更 \{#console-changes-29\}

- 新增 “Idle” 状态指示器，用于显示服务已被自动暂停

### ClickHouse 22.11 版本升级 \{#clickhouse-2211-version-upgrade\}

- 新增对 Hudi 和 DeltaLake 表引擎及表函数的支持
- 改进了针对 S3 的递归目录遍历
- 新增对复合时间间隔语法的支持
- 通过在插入时进行重试来提高插入可靠性
- 完整变更列表请参见 [22.11 详细变更日志](/whats-new/cloud#clickhouse-2211-version-upgrade)

### 集成 \{#integrations-1\}

- Python 客户端：支持 v3.11，提升插入性能
- Go 客户端：修复对 DateTime 和 Int64 的支持
- JS 客户端：支持双向 SSL 身份验证
- dbt-clickhouse：支持 dbt v1.3

### Bug 修复 \{#bug-fixes-6\}

- 修复了升级后仍显示旧版 ClickHouse 的问题
- 修改 "default" 账户的授权不再中断会话
- 新创建的非管理员账户默认不再具有 system 表访问权限

### 此版本中的已知问题 \{#known-issues-in-this-release\}

- 由于依赖关系解析问题，从备份恢复可能无法正常工作

## 2022 年 11 月 17 日 \{#november-17-2022\}

本次发布新增了对基于本地 ClickHouse 表和 HTTP 源的字典的支持，引入了对孟买区域的支持，并改进了云控制台的用户体验。

### 常规更改 \{#general-changes-5\}

- 新增对基于本地 ClickHouse 表和 HTTP 源的 [dictionaries](/sql-reference/dictionaries/index.md) 的支持
- 引入了对孟买 [region](/cloud/reference/supported-regions) 的支持

### 控制台更改 \{#console-changes-30\}

- 改进了账单发票的格式
- 简化了支付方式录入的用户界面
- 为备份添加了更细粒度的活动日志记录
- 改进了文件上传过程中的错误处理

### 错误修复 \{#bug-fixes-7\}

- 修复了在某些部分中存在单个大文件时可能导致备份失败的错误
- 修复了在同时应用访问列表更改时，无法成功从备份恢复的错误

### 已知问题 \{#known-issues\}

- 由于依赖关系解析问题，从备份恢复可能无法正常工作

## 2022 年 11 月 3 日 \{#november-3-2022\}

此版本从定价中移除了读写单元（详细信息参见[定价页面](https://clickhouse.com/pricing)），将 ClickHouse 版本更新至 22.10，为自助式客户提供了更高的纵向扩展上限，并通过更合理的默认配置提升了可靠性。

### 常规变更 \{#general-changes-6\}

- 从定价模型中移除了读/写单元

### 配置变更 \{#configuration-changes-2\}

- 出于稳定性原因，不再允许用户更改设置 `allow_suspicious_low_cardinality_types`、`allow_suspicious_fixed_string_types` 和 `allow_suspicious_codecs`（默认值为 false）。

### 控制台变更 \{#console-changes-31\}

- 将自助式付费客户的纵向扩展最大内存上限提升至 720GB
- 改进了从备份恢复的流程，以设置 IP 访问列表规则和密码
- 在服务创建对话框中为 GCP 和 Azure 引入了候补列表
- 改进了文件上传过程中的错误处理
- 改进了计费管理相关的工作流程

### ClickHouse 22.10 版本升级 \{#clickhouse-2210-version-upgrade\}

- 在存在大量大分片（至少 10 GiB）时，通过放宽“分片过多”阈值，改进了在对象存储上的合并操作。这使得单个表的单个分区中可以存储高达 PB 级的数据。
- 通过 `min_age_to_force_merge_seconds` 设置改进了对合并的控制，可以在达到指定时间阈值后强制执行合并。
- 添加了用于重置设置的 MySQL 兼容语法 `SET setting_name = DEFAULT`。
- 添加了 Morton 曲线编码、Java 整数哈希和随机数生成相关函数。
- 有关完整的变更列表，请参阅[详细的 22.10 变更日志](/whats-new/cloud#clickhouse-2210-version-upgrade)。

## 2022 年 10 月 25 日 \{#october-25-2022\}

此版本显著降低了小规模工作负载的计算资源消耗，降低了计算费用（详情参见 [pricing](https://clickhouse.com/pricing) 定价页面），通过更合理的默认值提升了稳定性，并改进了 ClickHouse Cloud 控制台中的 Billing 和 Usage 视图。

### 通用更改 \{#general-changes-7\}

- 将最小服务内存分配降低至 24G
- 将服务空闲超时时间从 30 分钟缩短至 5 分钟

### 配置更改 \{#configuration-changes-3\}

- 将 max_parts_in_total 从 100k 降低到 10k。MergeTree 表的 `max_parts_in_total` 设置的默认值已从 100,000 降低到 10,000。做出此更改的原因是我们观察到，大量数据分区片段很可能导致云端服务启动时间变慢。大量的分区片段通常表明分区键选择过于细粒度，这通常是无意为之，应当避免。默认值的更改将使这些情况能够更早被发现。

### 控制台更改 \{#console-changes-32\}

- 为试用用户增强了 Billing 视图中的积分使用详情
- 改进了工具提示和帮助文本，并在 Usage 视图中添加了指向 pricing 定价页面的链接
- 改进了切换 IP 过滤选项时的操作流程
- 向 Cloud 控制台添加了重发电子邮件确认按钮

## 2022 年 10 月 4 日 - Beta \{#october-4-2022---beta\}

ClickHouse Cloud 于 2022 年 10 月 4 日开始公开 Beta 测试。更多信息请参见这篇[博客](https://clickhouse.com/blog/clickhouse-cloud-public-beta)。

ClickHouse Cloud 版本基于 ClickHouse 核心 v22.10。有关兼容功能的列表，请参阅 [Cloud Compatibility](/whats-new/cloud-compatibility) 指南。