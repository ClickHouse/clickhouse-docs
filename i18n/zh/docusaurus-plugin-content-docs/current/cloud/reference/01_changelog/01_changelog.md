---
slug: /whats-new/cloud
sidebar_label: 'Cloud 更新日志'
title: 'Cloud 更新日志'
description: 'ClickHouse Cloud 更新日志，说明每个 ClickHouse Cloud 版本中的新增功能和变更'
doc_type: 'changelog'
keywords: ['changelog', 'release notes', 'updates', 'new features', 'cloud changes']
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

除了本页 ClickHouse Cloud 更新日志外，您还可以参阅 [Cloud 兼容性](/whats-new/cloud-compatibility) 页面。

:::tip[自动保持最新！]

<a href="/docs/cloud/changelog-rss.xml">
  通过 RSS 订阅 Cloud 更新日志
</a>

:::


## 2025 年 11 月 14 日 {#november-14-2025}

- 我们很高兴地宣布 **ClickHouse Cloud** 现已在**两个新增公共区域**上线:
  - **GCP 日本 (asia-northeast1)**
  - **AWS 首尔 (亚太地区, ap-northeast-2)** — 现已支持 **ClickPipes**

  这些区域此前仅作为**私有区域**提供,现已**面向所有用户开放**。

- Terraform 和 API 现已支持为服务添加标签并按标签筛选服务。


## 2025年11月7日 {#november-7-2025}

- ClickHouse Cloud 控制台现在支持以 1 vCPU、4 GiB 为增量单位配置副本规格。
  这些选项在创建新服务时以及在设置页面配置副本规格的最小值和最大值时均可使用。
- 自定义硬件配置(企业版功能)现已支持闲置模式。
- ClickHouse Cloud 现在通过 AWS Marketplace 提供简化的购买体验,分别提供[按量付费](https://aws.amazon.com/marketplace/pp/prodview-p4gwofrqpkltu?sr=0-2&ref_=beagle&applicationId=AWSMPContessa)和[承诺用量合约](https://aws.amazon.com/marketplace/pp/prodview-4qyeihstyym2s?sr=0-3&ref_=beagle&applicationId=AWSMPContessa)两种选项。
- 告警功能现已面向 ClickHouse Cloud 中的 ClickStack 用户开放。
  用户现在可以直接在 HyperDX UI 中创建和管理告警,覆盖日志、指标和链路追踪,无需额外设置、额外基础设施或服务,也无需配置。告警支持与 Slack、PagerDuty 等工具集成。
  更多信息请参阅[告警文档](/use-cases/observability/clickstack/alerts)。


## 2025 年 10 月 17 日 {#october-17-2025}

- **服务监控 - 资源利用率仪表板**  
  CPU 利用率和内存利用率指标的显示方式将发生变化,从显示平均值改为显示特定时间段内的最大利用率指标,以便更好地识别资源配置不足的情况。
  此外,CPU 利用率指标将显示 Kubernetes 级别的 CPU 利用率指标,该指标与 ClickHouse Cloud 自动扩缩容器使用的指标更为接近。
- **外部存储桶**  
  ClickHouse Cloud 现在支持将备份直接导出到您自己的云服务提供商账户。
  连接您的外部存储桶(AWS S3、Google Cloud Storage 或 Azure Blob Storage),即可完全掌控您的备份管理。


## August 29, 2025 {#august-29-2025}

- [ClickHouse Cloud Azure Private Link](/cloud/security/azure-privatelink) 已从使用资源 GUID 切换为使用资源 ID 筛选器来识别资源。您仍可以使用旧版资源 GUID(向后兼容),但我们建议切换到资源 ID 筛选器。有关迁移的详细信息,请参阅 Azure Private Link [文档](/cloud/security/azure-privatelink#obtaining-private-endpoint-resourceid)。


## 2025年8月22日 {#august-22-2025}

- **ClickHouse Connector for AWS Glue**  
  现在可以使用官方的 [ClickHouse Connector for AWS Glue](/integrations/glue),该连接器可从 [AWS Marketplace](https://aws.amazon.com/marketplace/pp/prodview-eqvmuopqzdg7s) 获取。该连接器利用 AWS Glue 基于 Apache Spark 的无服务器引擎,实现 ClickHouse 与其他数据源之间的数据提取、转换和加载集成。请参阅发布[博客文章](http://clickhouse.com/blog/clickhouse-connector-aws-glue)开始使用,了解如何创建表以及在 ClickHouse 和 Spark 之间读写数据。
- **服务最小副本数变更**  
  已扩容的服务现在可以[缩减](/manage/scaling)至使用单个副本(之前最小值为 2 个副本)。注意:单副本服务的可用性较低,不建议用于生产环境。
- ClickHouse Cloud 将开始发送与服务扩缩容和服务版本升级相关的通知,默认情况下发送给管理员角色。用户可以在通知设置中调整通知偏好。


## 2025 年 8 月 13 日 {#august-13-2025}

- **ClickPipes for MongoDB CDC 现已开放私有预览**
  现在您可以使用 ClickPipes 通过几次点击将数据从 MongoDB 复制到 ClickHouse Cloud,无需外部 ETL 工具即可实现实时分析。该连接器支持持续复制和一次性迁移,兼容 MongoDB Atlas 和自托管 MongoDB 部署。阅读[博客文章](https://clickhouse.com/blog/mongodb-cdc-clickhouse-preview)了解 MongoDB CDC 连接器概述,并[在此注册抢先体验](https://clickhouse.com/cloud/clickpipes/mongodb-cdc-connector)!


## 2025 年 8 月 8 日 {#august-08-2025}

- **通知**:当服务开始升级到新的 ClickHouse 版本时,用户将收到 UI 通知。可通过通知中心添加额外的电子邮件和 Slack 通知。
- **ClickPipes**:ClickHouse Terraform provider 已添加对 Azure Blob Storage (ABS) ClickPipes 的支持。有关如何以编程方式创建 ABS ClickPipe 的示例,请参阅 provider 文档。
  - [Bug 修复] 使用 Null 引擎写入目标表的对象存储 ClickPipes 现在会在 UI 中报告"总记录数"和"已摄取数据"指标。
  - [Bug 修复] UI 中指标的"时间段"选择器无论选择何种时间段都默认为"24 小时"。此问题现已修复,UI 现在可以正确更新所选时间段的图表。
- **跨区域私有链接 (AWS)** 现已正式发布 (GA)。有关支持的区域列表,请参阅[文档](/manage/security/aws-privatelink)。


## 2025 年 7 月 31 日 {#july-31-2025}

**ClickPipes 现已支持垂直扩展**

[流式 ClickPipes 现已支持垂直扩展](https://clickhouse.com/blog/clickpipes-flexible-scaling-monitoring)。
此功能允许您控制每个副本的规格大小,作为副本数量(水平扩展)的补充。每个 ClickPipe 的详情页面现在
还包含每个副本的 CPU 和内存使用率,帮助您更好地了解工作负载并更有把握地规划资源调整操作。


## July 24, 2025 {#july-24-2025}

**ClickPipes MySQL CDC 现已公开测试**

ClickPipes 中的 MySQL CDC 连接器现已进入公开测试阶段。只需简单几步操作,
您就可以将 MySQL(或 MariaDB)数据实时直接同步到 ClickHouse Cloud,
无需任何外部依赖。阅读[博客文章](https://clickhouse.com/blog/mysql-cdc-connector-clickpipes-beta)
了解连接器概述,并参考[快速入门指南](https://clickhouse.com/docs/integrations/clickpipes/mysql)
开始使用。


## 2025 年 7 月 11 日 {#june-11-2025}

- 新服务现在将数据库和表元数据存储在中央 **SharedCatalog** 中,
  这是一种用于协调和对象生命周期管理的新模型,可实现:
  - **云规模 DDL**,即使在高并发下也能稳定运行
  - **可靠的删除和新增 DDL 操作**
  - **快速启动和唤醒**,无状态节点现在启动时无需依赖磁盘
  - **跨原生和开放格式的无状态计算**,包括 Iceberg 和 Delta Lake

  在我们的[博客](https://clickhouse.com/blog/clickhouse-cloud-stateless-compute)中了解更多关于 SharedCatalog 的信息

- 我们现在支持在 GCP `europe-west4` 区域启动符合 HIPAA 合规要求的服务


## 2025 年 6 月 27 日 {#june-27-2025}

- 我们现已正式支持用于管理数据库权限的 Terraform provider,
  该 provider 同样兼容自管理部署。请参阅
  [博客](https://clickhouse.com/blog/new-terraform-provider-manage-clickhouse-database-users-roles-and-privileges-with-code)
  和我们的[文档](https://registry.terraform.io/providers/ClickHouse/clickhousedbops/latest/docs)
  了解更多信息。
- Enterprise 层级服务现在可以选择加入[慢速发布通道](/manage/updates/#slow-release-channel-deferred-upgrades),
  在常规发布后延迟两周进行升级,以便获得更多测试时间。


## June 13, 2025 {#june-13-2025}

- 我们很高兴地宣布 ClickHouse Cloud 仪表板现已正式发布。仪表板允许用户可视化查询结果、通过过滤器和查询参数与数据交互，以及管理共享功能。
- API 密钥 IP 过滤器:我们为您与 ClickHouse Cloud 的交互引入了额外的安全保护层。在生成 API 密钥时,您可以设置 IP 白名单来限制 API 密钥的使用位置。详情请参阅[文档](https://clickhouse.com/docs/cloud/security/setting-ip-filters)。


## 2025 年 5 月 30 日 {#may-30-2025}

- 我们很高兴地宣布 **ClickPipes for Postgres CDC** 在 ClickHouse Cloud 中正式发布。
  只需点击几下,您现在就可以复制 Postgres 数据库并实现超快速的实时分析。
  该连接器提供更快的数据同步、低至几秒的延迟、自动模式变更、
  完全安全的连接等功能。更多信息请参阅
  [博客](https://clickhouse.com/blog/postgres-cdc-connector-clickpipes-ga)。
  要开始使用,请参阅[此处](https://clickhouse.com/docs/integrations/clickpipes/postgres)的说明。

- SQL 控制台仪表板引入了新的改进:
  - 共享:您可以与团队成员共享仪表板。支持四个访问级别,可以在全局和每个用户级别进行调整:
    - _写入权限_:添加/编辑可视化、刷新设置、通过筛选器与仪表板交互。
    - _所有者_:共享仪表板、删除仪表板,以及拥有"写入权限"用户的所有其他权限。
    - _只读权限_:查看仪表板并通过筛选器与其交互
    - _无权限_:无法查看仪表板
  - 对于已创建的现有仪表板,组织管理员可以将现有仪表板分配给自己作为所有者。
  - 您现在可以从查询视图将 SQL 控制台中的表或图表添加到仪表板。

<Image img={dashboards} size='md' alt='仪表板改进' border />

- 我们正在招募 AWS 和 GCP 的[分布式缓存](https://clickhouse.com/cloud/distributed-cache-waitlist)
  预览参与者。更多信息请阅读[博客](https://clickhouse.com/blog/building-a-distributed-cache-for-s3)。


## 2025 年 5 月 16 日 {#may-16-2025}

- 引入了资源利用率仪表板,用于查看 ClickHouse Cloud 服务所使用的资源。以下指标从系统表中采集并显示在此仪表板上:
  - 内存与 CPU:显示 `CGroupMemoryTotal`(已分配内存)、`CGroupMaxCPU`(已分配 CPU)、
    `MemoryResident`(已使用内存)和 `ProfileEvent_OSCPUVirtualTimeMicroseconds`(已使用 CPU)的图表
  - 数据传输:显示 ClickHouse Cloud 数据流入和流出的图表。了解更多信息请参阅[此处](/cloud/manage/network-data-transfer)。
- 我们很高兴地宣布推出全新的 ClickHouse Cloud Prometheus/Grafana 混合组件,
  旨在简化 ClickHouse Cloud 服务的监控。
  该混合组件使用我们兼容 Prometheus 的 API 端点,将 ClickHouse 指标无缝集成到您现有的 Prometheus 和 Grafana 环境中。它包含一个预配置的仪表板,
  让您能够实时查看服务的健康状况和性能表现。请参阅发布[博客](https://clickhouse.com/blog/monitor-with-new-prometheus-grafana-mix-in)了解更多信息。


## 2025 年 4 月 18 日 {#april-18-2025}

- 引入了新的 **Member** 组织级角色以及两个新的服务级角色:**Service Admin** 和 **Service Read Only**。
  **Member** 是一个组织级角色,默认分配给 SAML SSO 用户,仅提供登录和个人资料更新功能。可以为拥有 **Member**、**Developer** 或 **Billing Admin** 角色的用户分配一个或多个服务的 **Service Admin** 和 **Service Read Only** 角色。有关更多信息,请参阅 ["ClickHouse Cloud 中的访问控制"](https://clickhouse.com/docs/cloud/security/cloud-access-management/overview)
- ClickHouse Cloud 现在为 **Enterprise** 客户在以下区域提供 **HIPAA** 和 **PCI** 服务:AWS eu-central-1、AWS eu-west-2、AWS us-east-2。
- 引入了 **ClickPipes 的面向用户通知功能**。此功能通过电子邮件、ClickHouse Cloud UI 和 Slack 发送 ClickPipes 故障的自动告警。通过电子邮件和 UI 的通知默认启用,可以按管道进行配置。对于 **Postgres CDC ClickPipes**,告警还涵盖复制槽阈值(可在 **Settings** 选项卡中配置)、特定错误类型以及解决故障的自助步骤。
- **MySQL CDC 私有预览版**现已开放。客户只需点击几次即可将 MySQL 数据库复制到 ClickHouse Cloud,实现快速分析并消除对外部 ETL 工具的需求。该连接器支持持续复制和一次性迁移,无论 MySQL 是在云上(RDS、Aurora、Cloud SQL、Azure 等)还是本地部署。您可以通过[此链接](https://clickhouse.com/cloud/clickpipes/mysql-cdc-connector)注册私有预览版。
- 引入了 **用于 ClickPipes 的 AWS PrivateLink**。您可以使用 AWS PrivateLink 在 VPC、AWS 服务、本地系统和 ClickHouse Cloud 之间建立安全连接。在从 AWS 上的 Postgres、MySQL 和 MSK 等数据源移动数据时,可以在不将流量暴露到公共互联网的情况下完成此操作。它还支持通过 VPC 服务端点进行跨区域访问。PrivateLink 连接设置现在可以通过 ClickPipes [完全自助完成](https://clickhouse.com/docs/integrations/clickpipes/aws-privatelink)。


## 2025 年 4 月 4 日 {#april-4-2025}

- ClickHouse Cloud 的 Slack 通知:除控制台内通知和电子邮件通知外,ClickHouse Cloud 现已支持针对账单、扩缩容和 ClickPipes 事件的 Slack 通知。这些通知通过 ClickHouse Cloud Slack 应用程序发送。组织管理员可通过通知中心配置这些通知,指定接收通知的 Slack 频道。
- 运行生产环境和开发环境服务的用户现在可在账单中查看 ClickPipes 和数据传输的使用费用。


## 2025 年 3 月 21 日 {#march-21-2025}

- AWS 上的跨区域 Private Link 连接现已进入 Beta 测试阶段。有关如何设置以及支持的区域列表,请参阅 ClickHouse Cloud Private Link [文档](/manage/security/aws-privatelink)。
- AWS 服务的最大副本规格现已设置为 236 GiB 内存。这样既能实现高效利用,又能确保为后台进程预留足够的资源。


## 2025 年 3 月 7 日 {#march-7-2025}

- 新增 `UsageCost` API 端点:API 规范现已支持用于获取使用情况信息的新端点。这是一个组织级端点,可查询最多 31 天的使用成本。可获取的指标包括存储、计算、数据传输和 ClickPipes。详情请参阅[文档](https://clickhouse.com/docs/cloud/manage/api/usageCost-api-reference)。
- Terraform provider [v2.1.0](https://registry.terraform.io/providers/ClickHouse/clickhouse/2.1.0/docs/resources/service#nestedatt--endpoints_configuration) 版本支持启用 MySQL 端点。


## 2025年2月21日 {#february-21-2025}

### ClickHouse Bring Your Own Cloud (BYOC) for AWS 现已正式发布 {#clickhouse-byoc-for-aws-ga}

在此部署模式中,数据平面组件(计算、存储、备份、日志、指标)
运行在客户 VPC 中,而控制平面(Web 访问、API 和计费)
保留在 ClickHouse VPC 中。此设置非常适合需要
遵守严格数据驻留要求的大规模工作负载,可确保所有数据保留
在安全的客户环境中。

- 有关更多详细信息,您可以参考 BYOC 的[文档](/cloud/reference/byoc/overview)
  或阅读我们的[发布博客文章](https://clickhouse.com/blog/announcing-general-availability-of-clickhouse-bring-your-own-cloud-on-aws)。
- [联系我们](https://clickhouse.com/cloud/bring-your-own-cloud)申请访问权限。

### ClickPipes 的 Postgres CDC 连接器 {#postgres-cdc-connector-for-clickpipes}

ClickPipes 的 Postgres CDC 连接器允许用户无缝地将其 Postgres 数据库复制到 ClickHouse Cloud。

- 要开始使用,请参考 ClickPipes Postgres CDC 连接器的[文档](https://clickhouse.com/docs/integrations/clickpipes/postgres)。
- 有关客户使用案例和功能的更多信息,请参考[产品页面](https://clickhouse.com/cloud/clickpipes/postgres-cdc-connector)和[发布博客](https://clickhouse.com/blog/postgres-cdc-connector-clickpipes-public-beta)。

### ClickHouse Cloud on AWS 的 PCI 合规性 {#pci-compliance-for-clickhouse-cloud-on-aws}

ClickHouse Cloud 现在为 **us-east-1** 和 **us-west-2** 区域的 **Enterprise 层级**
客户提供 **PCI 合规服务**支持。希望在 PCI 合规环境中启动
服务的用户可以联系[支持团队](https://clickhouse.com/support/program)
获取帮助。

### Google Cloud Platform 上的透明数据加密和客户管理的加密密钥 {#tde-and-cmek-on-gcp}

**Google Cloud Platform (GCP)** 上的 ClickHouse Cloud 现已支持**透明数据加密 (TDE)** 和**客户管理的
加密密钥 (CMEK)**。

- 有关这些功能的更多信息,请参考[文档](https://clickhouse.com/docs/cloud/security/cmek#transparent-data-encryption-tde)。

### AWS 中东(阿联酋)可用性 {#aws-middle-east-uae-availability}

ClickHouse Cloud 新增了区域支持,现已在
**AWS 中东(阿联酋)me-central-1** 区域可用。

### ClickHouse Cloud 防护措施 {#clickhouse-cloud-guardrails}

为了推广最佳实践并确保 ClickHouse Cloud 的稳定使用,我们正在
引入针对使用中的表、数据库、分区和数据部分数量的防护措施。

- 有关详细信息,请参考文档的[使用限制](https://clickhouse.com/docs/cloud/bestpractices/usage-limits)
  部分。
- 如果您的服务已经超过这些限制,我们将允许增加 10%。
  如有任何疑问,请联系[支持团队](https://clickhouse.com/support/program)。


## 2025 年 1 月 27 日 {#january-27-2025}

### ClickHouse Cloud 服务层级变更 {#changes-to-clickhouse-cloud-tiers}

我们致力于不断调整产品以满足客户日益变化的需求。自两年前正式发布以来,ClickHouse Cloud 已经历了显著的演进,我们也深入了解了客户如何使用我们的云服务产品。

我们正在推出新功能,以优化 ClickHouse Cloud 服务的规模配置和成本效益,更好地适配您的工作负载。这些功能包括**计算-计算分离**、高性能机器类型和**单副本服务**。我们还在持续改进自动扩展和托管升级功能,使其执行更加流畅和响应更加迅速。

我们正在推出**全新的 Enterprise 层级**,以满足最严苛的客户和工作负载需求,重点提供行业特定的安全性和合规性功能、对底层硬件和升级的更精细控制,以及高级灾难恢复功能。

为了支持这些变更,我们正在重组现有的 **Development** 和 **Production** 层级,以更好地匹配不断演进的客户群体对我们产品的使用方式。我们推出了 **Basic** 层级,面向测试新想法和项目的用户,以及 **Scale** 层级,面向处理生产工作负载和大规模数据的用户。

您可以在此[博客文章](https://clickhouse.com/blog/evolution-of-clickhouse-cloud-new-features-superior-performance-tailored-offerings)中了解这些功能变更的详细信息。现有客户需要选择[新的服务计划](https://clickhouse.com/pricing)。我们已通过电子邮件向组织管理员发送了相关通知。

### Warehouses:计算-计算分离(正式发布){#warehouses-compute-compute-separation-ga}

计算-计算分离(也称为 "Warehouses")现已正式发布;请参阅[博客文章](https://clickhouse.com/blog/introducing-warehouses-compute-compute-separation-in-clickhouse-cloud)了解更多详情,以及[文档](/cloud/reference/warehouses)。

### 单副本服务 {#single-replica-services}

我们正在推出"单副本服务"概念,既可作为独立产品使用,也可在 warehouses 中使用。作为独立产品时,单副本服务有大小限制,适用于小型测试工作负载。在 warehouses 中,单副本服务可以部署更大的规模,适用于不需要大规模高可用性的工作负载,例如可重启的 ETL 作业。

### 垂直自动扩展改进 {#vertical-auto-scaling-improvements}

我们为计算副本引入了一种新的垂直扩展机制,称为"先建后断"(Make Before Break,MBB)。该方法在移除旧副本之前先添加一个或多个新规模的副本,防止扩展操作期间出现任何容量损失。通过消除移除现有副本和添加新副本之间的间隙,MBB 实现了更加流畅、中断更少的扩展过程。该机制在扩容场景中尤其有益,因为在高资源利用率触发额外容量需求时,过早移除副本只会加剧资源限制。

### 水平扩展(正式发布){#horizontal-scaling-ga}

水平扩展现已正式发布。用户可以通过 API 和云控制台添加额外的副本来横向扩展其服务。请参阅[文档](/manage/scaling#manual-horizontal-scaling)了解相关信息。

### 可配置备份 {#configurable-backups}

我们现在支持客户将备份导出到自己的云账户;请参阅[文档](/cloud/manage/backups/configurable-backups)了解更多信息。

### 托管升级改进 {#managed-upgrade-improvements}

安全的托管升级为用户提供了重要价值,使他们能够在数据库不断添加新功能时保持版本更新。在此次发布中,我们将"先建后断"(MBB)方法应用于升级过程,进一步降低对运行中工作负载的影响。

### HIPAA 支持 {#hipaa-support}

我们现在在合规区域支持 HIPAA,包括 AWS `us-east-1`、`us-west-2` 和 GCP `us-central1`、`us-east1`。希望启用该功能的客户必须签署业务伙伴协议(BAA)并部署到该区域的合规版本。有关 HIPAA 的更多信息,请参阅[文档](/cloud/security/compliance-overview)。

### 计划升级 {#scheduled-upgrades}

用户可以为其服务安排升级计划。此功能仅支持 Enterprise 层级服务。有关计划升级的更多信息,请参阅[文档](/manage/updates)。

### 语言客户端对复杂类型的支持 {#language-client-support-for-complex-types}


[Golang](https://github.com/ClickHouse/clickhouse-go/releases/tag/v2.30.1)、[Python](https://github.com/ClickHouse/clickhouse-connect/releases/tag/v0.8.11) 和 [NodeJS](https://github.com/ClickHouse/clickhouse-js/releases/tag/1.10.1) 客户端新增了对 Dynamic、Variant 和 JSON 类型的支持。

### DBT 支持可刷新物化视图 {#dbt-support-for-refreshable-materialized-views}

DBT 在 `1.8.7` 版本中[新增了对可刷新物化视图的支持](https://github.com/ClickHouse/dbt-clickhouse/releases/tag/v1.8.7)。

### JWT 令牌支持 {#jwt-token-support}

JDBC driver v2、clickhouse-java、[Python](https://github.com/ClickHouse/clickhouse-connect/releases/tag/v0.8.12) 和 [NodeJS](https://github.com/ClickHouse/clickhouse-js/releases/tag/1.10.0) 客户端新增了对基于 JWT 的身份验证支持。

JDBC / Java 将在 [0.8.0](https://github.com/ClickHouse/clickhouse-java/releases/tag/v0.8.0) 版本中提供此功能 - 发布时间待定。

### Prometheus 集成改进 {#prometheus-integration-improvements}

我们为 Prometheus 集成新增了多项增强功能:

- **组织级端点**。我们为 ClickHouse Cloud 的 Prometheus 集成引入了一项增强功能。除服务级指标外,API 现在还提供了**组织级指标**端点。该端点会自动收集组织内所有服务的指标,简化了将指标导出到 Prometheus 采集器的流程。这些指标可以与 Grafana 和 Datadog 等可视化工具集成,以便更全面地了解组织的性能表现。

  此功能现已面向所有用户开放。您可以在[此处](/integrations/prometheus)查看更多详细信息。

- **指标过滤**。我们在 ClickHouse Cloud 的 Prometheus 集成中新增了对返回过滤指标列表的支持。此功能让您能够专注于对监控服务健康状况至关重要的指标,从而有助于减小响应负载大小。

  此功能通过 API 中的可选查询参数提供,使您能够更轻松地优化数据采集并简化与 Grafana 和 Datadog 等工具的集成。

  指标过滤功能现已面向所有用户开放。您可以在[此处](/integrations/prometheus)查看更多详细信息。


## 2024年12月20日 {#december-20-2024}

### 市场订阅关联到组织 {#marketplace-subscription-organization-attachment}

您现在可以将新的市场订阅关联到现有的 ClickHouse Cloud 组织。完成市场订阅并重定向到 ClickHouse Cloud 后,您可以将之前创建的现有组织连接到新的市场订阅。从此之后,该组织中的资源将通过市场进行计费。

<Image
  img={add_marketplace}
  size='md'
  alt='ClickHouse Cloud 界面展示如何将市场订阅添加到现有组织'
  border
/>

### 强制 OpenAPI 密钥过期 {#force-openapi-key-expiration}

现在可以限制 API 密钥的过期选项,从而避免创建永不过期的 OpenAPI 密钥。请联系 ClickHouse Cloud 支持团队为您的组织启用这些限制。

### 通知的自定义邮箱地址 {#custom-emails-for-notifications}

组织管理员现在可以为特定通知添加更多邮箱地址作为额外收件人。如果您想将通知发送到邮件别名或组织内可能不是 ClickHouse Cloud 用户的其他人员,这将非常有用。要配置此功能,请从云控制台进入通知设置,并编辑您希望接收邮件通知的邮箱地址。


## 2024 年 12 月 6 日 {#december-6-2024}

### BYOC(测试版){#byoc-beta}

AWS 的 Bring Your Own Cloud 现已推出测试版。此部署模式允许您在自己的 AWS 账户中部署和运行 ClickHouse Cloud。我们支持在 11 个以上的 AWS 区域进行部署,更多区域即将推出。请[联系支持团队](https://clickhouse.com/support/program)获取访问权限。请注意,此部署方式仅适用于大规模部署场景。

### ClickPipes 中的 Postgres 变更数据捕获(CDC)连接器 {#postgres-change-data-capture-cdc-connector-in-clickpipes}

这一开箱即用的集成使客户能够通过几次点击即可将其 Postgres 数据库复制到 ClickHouse Cloud,并利用 ClickHouse 进行超快速分析。您可以使用此连接器进行持续复制和从 Postgres 的一次性迁移。

### 仪表板(测试版){#dashboards-beta}

本周,我们很高兴宣布 ClickHouse Cloud 中仪表板的测试版发布。通过仪表板,用户可以将保存的查询转换为可视化图表,将可视化图表组织到仪表板上,并使用查询参数与仪表板进行交互。要开始使用,请参阅[仪表板文档](/cloud/manage/dashboards)。

<Image
  img={beta_dashboards}
  size='lg'
  alt='ClickHouse Cloud 界面展示新的仪表板测试版功能及可视化图表'
  border
/>

### 查询 API 端点(正式版){#query-api-endpoints-ga}

我们很高兴宣布 ClickHouse Cloud 中查询 API 端点的正式版发布。查询 API 端点允许您只需点击几次即可为保存的查询创建 RESTful API 端点,并在应用程序中开始使用数据,无需处理语言客户端或身份验证的复杂性。自最初发布以来,我们已经推出了多项改进,包括:

- 降低端点延迟,尤其是冷启动时的延迟
- 增强端点 RBAC 控制
- 可配置的 CORS 允许域
- 结果流式传输
- 支持所有 ClickHouse 兼容的输出格式

除了这些改进之外,我们很高兴宣布通用查询 API 端点,该端点利用我们现有的框架,允许您对 ClickHouse Cloud 服务执行任意 SQL 查询。可以从服务设置页面启用和配置通用端点。

要开始使用,请参阅[查询 API 端点文档](/cloud/get-started/query-endpoints)。

<Image
  img={api_endpoints}
  size='lg'
  alt='ClickHouse Cloud 界面展示 API 端点配置及各种设置'
  border
/>

### 原生 JSON 支持(测试版){#native-json-support-beta}

我们正在为 ClickHouse Cloud 中的原生 JSON 支持推出测试版。要开始使用,请联系支持团队[为您的云服务启用此功能](/cloud/support)。

### 使用向量相似度索引的向量搜索(抢先体验){#vector-search-using-vector-similarity-indexes-early-access}

我们宣布向量相似度索引用于近似向量搜索的抢先体验版本。

ClickHouse 已经为基于向量的用例提供了强大的支持,包括广泛的[距离函数](https://clickhouse.com/blog/reinvent-2024-product-announcements#vector-search-using-vector-similarity-indexes-early-access)和执行线性扫描的能力。此外,最近我们还添加了一种实验性的[近似向量搜索](/engines/table-engines/mergetree-family/annindexes)方法,该方法由 [usearch](https://github.com/unum-cloud/usearch) 库和分层可导航小世界(HNSW)近似最近邻搜索算法提供支持。

要开始使用,[请注册抢先体验候补名单](https://clickhouse.com/cloud/vector-search-index-waitlist)。

### ClickHouse-connect(Python)和 ClickHouse Kafka Connect 用户 {#clickhouse-connect-python-and-clickhouse-kafka-connect-users}

已向遇到客户端可能出现 `MEMORY_LIMIT_EXCEEDED` 异常问题的客户发送通知邮件。

请升级至:

- Kafka-Connect: > 1.2.5
- ClickHouse-Connect(Java): > 0.8.6

### ClickPipes 现在支持 AWS 上的跨 VPC 资源访问 {#clickpipes-now-supports-cross-vpc-resource-access-on-aws}

您现在可以授予对特定数据源(如 AWS MSK)的单向访问权限。通过使用 AWS PrivateLink 和 VPC Lattice 的跨 VPC 资源访问,您可以跨 VPC 和账户边界共享单个资源,甚至可以从本地网络共享,而不会在通过公共网络时损害隐私和安全性。要开始使用并设置资源共享,您可以阅读[公告文章](https://clickhouse.com/blog/clickpipes-crossvpc-resource-endpoints?utm_medium=web&utm_source=changelog)。


<Image
  img={cross_vpc}
  size='lg'
  alt='显示 ClickPipes 连接到 AWS MSK 的跨 VPC 资源访问架构示意图'
  border
/>

### ClickPipes 现已支持 AWS MSK 的 IAM 身份验证 {#clickpipes-now-supports-iam-for-aws-msk}

您现在可以使用 IAM 身份验证通过 AWS MSK ClickPipes 连接到 MSK 代理。如需开始使用,请参阅我们的[文档](/integrations/clickpipes/kafka/best-practices/#iam)。

### AWS 上新服务的最大副本大小 {#maximum-replica-size-for-new-services-on-aws}

从现在起,在 AWS 上创建的所有新服务的最大可用副本大小为 236 GiB。


## 2024年11月22日 {#november-22-2024}

### ClickHouse Cloud 内置高级可观测性仪表板 {#built-in-advanced-observability-dashboard-for-clickhouse-cloud}

此前,用于监控 ClickHouse 服务器指标和硬件资源使用情况的高级可观测性仪表板仅在开源 ClickHouse 中提供。我们很高兴地宣布,该功能现已在 ClickHouse Cloud 控制台中推出。

该仪表板允许您在统一的 UI 界面中查看基于 [system.dashboards](/operations/system-tables/dashboards) 表的查询。访问 **监控 > 服务健康** 页面,即可立即开始使用高级可观测性仪表板。

<Image
  img={nov_22}
  size='lg'
  alt='ClickHouse Cloud 高级可观测性仪表板,显示服务器指标和资源使用情况'
  border
/>

### AI 驱动的 SQL 自动补全 {#ai-powered-sql-autocomplete}

我们大幅改进了自动补全功能,通过全新的 AI Copilot,您可以在编写查询时获得行内 SQL 补全建议。可以通过切换任何 ClickHouse Cloud 服务的 **"启用行内代码补全"** 设置来启用此功能。

<Image
  img={copilot}
  size='lg'
  alt='动画演示 AI Copilot 在用户输入时提供 SQL 自动补全建议'
  border
/>

### 新增"账单"角色 {#new-billing-role}

您现在可以将组织中的用户分配到新的 **账单** 角色,该角色允许他们查看和管理账单信息,而无需授予配置或管理服务的权限。只需邀请新用户或编辑现有用户的角色,即可分配 **账单** 角色。


## November 8, 2024 {#november-8-2024}

### ClickHouse Cloud 中的客户通知 {#customer-notifications-in-clickhouse-cloud}

ClickHouse Cloud 现已为多种计费和扩缩容事件提供控制台内通知和电子邮件通知。客户可以通过云控制台通知中心配置这些通知,选择仅在用户界面显示、接收电子邮件或同时启用两者。您可以在服务级别配置接收通知的类别和严重程度。

未来,我们将为其他事件添加通知,并提供更多接收通知的方式。

请参阅 [ClickHouse 文档](/cloud/notifications),了解如何为您的服务启用通知。

<Image
  img={notifications}
  size='lg'
  alt='ClickHouse Cloud 通知中心界面,显示不同通知类型的配置选项'
  border
/>

<br />


## 2024年10月4日 {#october-4-2024}

### ClickHouse Cloud 现在为 GCP 提供符合 HIPAA 要求的服务(Beta 版){#clickhouse-cloud-now-offers-hipaa-ready-services-in-beta-for-gcp}

需要加强受保护健康信息(PHI)安全性的客户现在可以在 [Google Cloud Platform (GCP)](https://cloud.google.com/) 上使用 ClickHouse Cloud。ClickHouse 已实施 [HIPAA 安全规则](https://www.hhs.gov/hipaa/for-professionals/security/index.html)规定的管理、物理和技术保障措施,并提供可配置的安全设置,可根据您的具体用例和工作负载进行配置。有关可用安全设置的更多信息,请查看我们的[安全功能页面](/cloud/security)。

该服务在 GCP `us-central-1` 区域向使用 **Dedicated** 服务类型的客户提供,并需要签署商业伙伴协议(BAA)。请联系[销售团队](mailto:sales@clickhouse.com)或[支持团队](https://clickhouse.com/support/program)以申请访问此功能,或加入候补名单以获取更多 GCP、AWS 和 Azure 区域的支持。

### 计算-计算分离现已在 GCP 和 Azure 上提供私有预览 {#compute-compute-separation-is-now-in-private-preview-for-gcp-and-azure}

我们最近宣布了 AWS 的计算-计算分离私有预览版。我们很高兴地宣布,该功能现已在 GCP 和 Azure 上提供。

计算-计算分离允许您将特定服务指定为读写或只读服务,使您能够为应用程序设计最优的计算配置,从而优化成本和性能。请[阅读文档](/cloud/reference/warehouses)了解更多详情。

### 自助式 MFA 恢复代码 {#self-service-mfa-recovery-codes}

使用多因素身份验证的客户现在可以获取恢复代码,以便在手机丢失或意外删除令牌时使用。首次启用 MFA 的客户将在设置时获得该代码。已启用 MFA 的客户可以通过删除现有 MFA 令牌并添加新令牌来获取恢复代码。

### ClickPipes 更新:自定义证书、延迟洞察等功能 {#clickpipes-update-custom-certificates-latency-insights-and-more}

我们很高兴分享 ClickPipes 的最新更新,这是将数据导入 ClickHouse 服务的最简单方式。这些新功能旨在增强您对数据导入的控制,并提供更好的性能指标可见性。

_Kafka 自定义身份验证证书_

ClickPipes for Kafka 现在支持使用 SASL 和公共 SSL/TLS 为 Kafka 代理提供自定义身份验证证书。您可以在 ClickPipe 设置期间轻松在 SSL 证书部分上传自己的证书,确保与 Kafka 的连接更加安全。

_推出 Kafka 和 Kinesis 的延迟指标_

性能可见性至关重要。ClickPipes 现在提供延迟图表,让您深入了解从消息生成(无论是来自 Kafka Topic 还是 Kinesis Stream)到导入 ClickHouse Cloud 之间的时间。借助这一新指标,您可以更密切地监控数据管道的性能并进行相应优化。

<Image
  img={latency_insights}
  size='lg'
  alt='ClickPipes 界面显示数据导入性能的延迟指标图表'
  border
/>

<br />

_Kafka 和 Kinesis 的扩展控制(私有 Beta 版)_

高吞吐量可能需要额外的资源来满足您的数据量和延迟需求。我们正在为 ClickPipes 引入水平扩展功能,可直接通过我们的云控制台使用。此功能目前处于私有 Beta 阶段,允许您根据需求更有效地扩展资源。请联系[支持团队](https://clickhouse.com/support/program)加入 Beta 测试。

_Kafka 和 Kinesis 的原始消息导入_

现在可以在不解析的情况下导入完整的 Kafka 或 Kinesis 消息。ClickPipes 现在支持 `_raw_message` [虚拟列](/integrations/clickpipes/kafka/reference/#kafka-virtual-columns),允许用户将完整消息映射到单个 String 列中。这为您提供了根据需要处理原始数据的灵活性。


## 2024年8月29日 {#august-29-2024}

### 新版 Terraform Provider - v1.0.0 {#new-terraform-provider-version---v100}

Terraform 允许您以编程方式控制 ClickHouse Cloud 服务,并将配置存储为代码。我们的 Terraform Provider 下载量已接近 20 万次,现已正式发布 v1.0.0 版本。此新版本包含多项改进,例如更优的重试逻辑,以及用于将私有端点附加到 ClickHouse Cloud 服务的新资源。您可以[在此下载 Terraform Provider](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest) 并[在此查看完整变更日志](https://github.com/ClickHouse/terraform-provider-clickhouse/releases/tag/v1.0.0)。

### 2024 年 SOC 2 Type II 报告和更新的 ISO 27001 证书 {#2024-soc-2-type-ii-report-and-updated-iso-27001-certificate}

我们很荣幸地宣布,2024 年 SOC 2 Type II 报告和更新的 ISO 27001 证书现已发布,两者均涵盖我们最近在 Azure 上推出的服务,以及在 AWS 和 GCP 上持续提供的服务。

我们的 SOC 2 Type II 报告证明了我们对为 ClickHouse 用户提供的服务在安全性、可用性、处理完整性和机密性方面的持续承诺。如需了解更多信息,请查看美国注册会计师协会 (AICPA) 发布的 [SOC 2 - 服务组织 SOC:信任服务标准](https://www.aicpa-cima.com/resources/landing/system-and-organization-controls-soc-suite-of-services),以及国际标准化组织 (ISO) 的 [什么是 ISO/IEC 27001](https://www.iso.org/standard/27001)。

另请访问我们的[信任中心](https://trust.clickhouse.com/)获取安全和合规文档及报告。


## 2024年8月15日 {#august-15-2024}

### 计算-计算分离功能现已在AWS上开启私有预览 {#compute-compute-separation-is-now-in-private-preview-for-aws}

对于现有的ClickHouse Cloud服务,副本同时处理读取和写入操作,无法将某个副本配置为仅处理单一类型的操作。我们即将推出一项名为计算-计算分离的新功能,允许您将特定服务指定为读写服务或只读服务,从而为您的应用程序设计最优的计算配置,以优化成本和性能。

我们的新计算-计算分离功能使您能够创建多个计算节点组,每个组都有自己的端点,它们使用相同的对象存储文件夹,因此具有相同的表、视图等。了解更多关于[计算-计算分离的信息](/cloud/reference/warehouses)。如果您希望在私有预览阶段使用此功能,请[联系支持团队](https://clickhouse.com/support/program)。

<Image
  img={cloud_console_2}
  size='lg'
  alt='显示计算-计算分离示例架构的图表,包含读写和只读服务组'
  border
/>

### 适用于S3和GCS的ClickPipes现已正式发布,支持连续模式 {#clickpipes-for-s3-and-gcs-now-in-ga-continuous-mode-support}

ClickPipes是将数据导入ClickHouse Cloud最简单的方式。我们很高兴地宣布,适用于S3和GCS的[ClickPipes](https://clickhouse.com/cloud/clickpipes)现已**正式发布**。ClickPipes支持一次性批量导入和"连续模式"。导入任务将从指定的远程存储桶中加载所有匹配模式的文件到ClickHouse目标表。在"连续模式"下,ClickPipes作业将持续运行,在匹配的文件添加到远程对象存储桶时实时导入它们。这使得用户可以将任何对象存储桶转变为功能完备的暂存区域,用于将数据导入ClickHouse Cloud。在[我们的文档](/integrations/clickpipes)中了解更多关于ClickPipes的信息。


## 2024年7月18日 {#july-18-2024}

### Prometheus 指标端点现已正式发布 {#prometheus-endpoint-for-metrics-is-now-generally-available}

在上一次云更新日志中,我们宣布了从 ClickHouse Cloud 导出 [Prometheus](https://prometheus.io/) 指标的私有预览版。此功能允许您使用 [ClickHouse Cloud API](/cloud/manage/api/api-overview) 将指标导入 [Grafana](https://grafana.com/) 和 [Datadog](https://www.datadoghq.com/) 等工具进行可视化。我们很高兴地宣布,此功能现已**正式发布**。请参阅[我们的文档](/integrations/prometheus)以了解有关此功能的更多信息。

### Cloud 控制台中的表检查器 {#table-inspector-in-cloud-console}

ClickHouse 提供了诸如 [`DESCRIBE`](/sql-reference/statements/describe-table) 之类的命令,允许您检查表结构。这些命令会输出到控制台,但使用起来往往不太方便,因为您需要组合多个查询才能检索有关表和列的所有相关数据。

我们最近在云控制台中推出了**表检查器**,允许您在 UI 中检索重要的表和列信息,而无需编写 SQL。您可以通过访问云控制台来试用服务的表检查器。它在一个统一的界面中提供有关表结构、存储、压缩等方面的信息。

<Image
  img={compute_compute}
  size='lg'
  alt='ClickHouse Cloud 表检查器界面,显示详细的表结构和存储信息'
  border
/>

### 新的 Java 客户端 API {#new-java-client-api}

我们的 [Java Client](https://github.com/ClickHouse/clickhouse-java) 是用户连接 ClickHouse 时最常用的客户端之一。我们希望使其更易于使用且更直观,包括重新设计的 API 和各种性能优化。这些更改将使从 Java 应用程序连接到 ClickHouse 变得更加容易。您可以在此[博客文章](https://clickhouse.com/blog/java-client-sequel)中了解有关如何使用更新后的 Java Client 的更多信息。

### 新分析器默认启用 {#new-analyzer-is-enabled-by-default}

在过去几年中,我们一直在开发用于查询分析和优化的新分析器。此分析器可提高查询性能,并将使我们能够进行进一步的优化,包括更快、更高效的 `JOIN` 操作。以前,新用户需要使用 `allow_experimental_analyzer` 设置来启用此功能。现在,这个改进的分析器在新的 ClickHouse Cloud 服务上默认启用。

敬请期待分析器的更多改进,我们已规划了更多优化。


## 2024年6月28日 {#june-28-2024}

### ClickHouse Cloud for Microsoft Azure 现已正式发布 {#clickhouse-cloud-for-microsoft-azure-is-now-generally-available}

我们在[今年5月](https://clickhouse.com/blog/clickhouse-cloud-is-now-on-azure-in-public-beta)首次发布了 Microsoft Azure 的 Beta 版支持。在最新的云版本中,我们很高兴地宣布 Azure 支持已从 Beta 版转为正式发布。ClickHouse Cloud 现已在三大主流云平台上可用:AWS、Google Cloud Platform 以及 Microsoft Azure。

此版本还支持通过 [Microsoft Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps/clickhouse.clickhouse_cloud) 进行订阅。该服务初期将在以下区域提供支持:

- 美国:West US 3(亚利桑那州)
- 美国:East US 2(弗吉尼亚州)
- 欧洲:Germany West Central(法兰克福)

如果您希望支持特定区域,请[联系我们](https://clickhouse.com/support/program)。

### 查询日志洞察 {#query-log-insights}

Cloud 控制台中新推出的查询洞察 UI 使 ClickHouse 内置的查询日志更易于使用。ClickHouse 的 `system.query_log` 表是查询优化、调试以及监控集群整体健康状况和性能的关键信息来源。但存在一个问题:由于每个查询包含 70 多个字段和多条记录,解读查询日志的学习曲线较为陡峭。此初始版本的查询洞察为未来简化查询调试和优化模式的工作提供了基础框架。我们非常希望听到您的反馈,因为我们会持续迭代此功能,请随时与我们联系——您的意见对我们非常重要。

<Image
  img={query_insights}
  size='lg'
  alt='ClickHouse Cloud 查询洞察 UI 显示查询性能指标和分析'
  border
/>

### Prometheus 指标端点(私有预览) {#prometheus-endpoint-for-metrics-private-preview}

这可能是我们最受欢迎的功能之一:您现在可以将 [Prometheus](https://prometheus.io/) 指标从 ClickHouse Cloud 导出到 [Grafana](https://grafana.com/) 和 [Datadog](https://www.datadoghq.com/) 进行可视化。Prometheus 提供了一个开源解决方案来监控 ClickHouse 并设置自定义告警。您可以通过 [ClickHouse Cloud API](/integrations/prometheus) 访问 ClickHouse Cloud 服务的 Prometheus 指标。此功能目前处于私有预览阶段。请联系[支持团队](https://clickhouse.com/support/program)为您的组织启用此功能。

<Image
  img={prometheus}
  size='lg'
  alt='Grafana 仪表板显示来自 ClickHouse Cloud 的 Prometheus 指标'
  border
/>

### 其他功能 {#other-features}

- [可配置备份](/cloud/manage/backups/configurable-backups)用于配置自定义备份策略(如频率、保留期和计划)现已正式发布。


## June 13, 2024 {#june-13-2024}

### Kafka ClickPipes 连接器的可配置偏移量(Beta){#configurable-offsets-for-kafka-clickpipes-connector-beta}

直到最近,每当您设置新的 [Kafka Connector for ClickPipes](/integrations/clickpipes/kafka) 时,它总是从 Kafka 主题的开头开始消费数据。在需要重新处理历史数据、监控新传入的数据或从精确位置恢复时,这种方式可能不够灵活,无法满足特定的使用场景。

ClickPipes for Kafka 新增了一项功能,增强了从 Kafka 主题消费数据的灵活性和控制能力。您现在可以配置数据消费的起始偏移量。

可用选项如下:

- 从开头开始:从 Kafka 主题的最开始位置消费数据。此选项适合需要重新处理所有历史数据的用户。
- 从最新位置开始:从最新的偏移量开始消费数据。此选项适合只关注新消息的用户。
- 从时间戳开始:从特定时间戳或之后生成的消息开始消费数据。此功能提供更精确的控制,使用户能够从确切的时间点恢复处理。

<Image
  img={kafka_config}
  size='lg'
  alt='ClickPipes Kafka 连接器配置界面,显示偏移量选择选项'
  border
/>

### 将服务注册到快速发布渠道 {#enroll-services-to-the-fast-release-channel}

快速发布渠道允许您的服务提前接收更新,无需等待正式发布计划。以前,启用此功能需要支持团队的协助。现在,您可以直接使用 ClickHouse Cloud 控制台为您的服务启用此功能。只需导航到 **Settings**,然后点击 **Enroll in fast releases**。您的服务将在更新可用时立即接收。

<Image
  img={fast_releases}
  size='lg'
  alt='ClickHouse Cloud 设置页面,显示注册快速发布的选项'
  border
/>

### Terraform 对水平扩展的支持 {#terraform-support-for-horizontal-scaling}

ClickHouse Cloud 支持[水平扩展](/manage/scaling#how-scaling-works-in-clickhouse-cloud),即向您的服务添加相同规格的额外副本。水平扩展可以提高性能和并行化能力,以支持并发查询。以前,添加更多副本需要使用 ClickHouse Cloud 控制台或 API。现在,您可以使用 Terraform 为服务添加或删除副本,从而以编程方式根据需要扩展 ClickHouse 服务。

有关更多信息,请参阅 [ClickHouse Terraform provider](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs)。


## 2024年5月30日 {#may-30-2024}

### 与团队成员共享查询 {#share-queries-with-your-teammates}

当您编写 SQL 查询时,团队中的其他成员很可能也会觉得该查询有用。以前,您必须通过 Slack 或电子邮件发送查询,而且如果您编辑了查询,团队成员无法自动接收更新。

我们很高兴地宣布,您现在可以通过 ClickHouse Cloud 控制台轻松共享查询。在查询编辑器中,您可以直接与整个团队或特定团队成员共享查询。您还可以指定他们拥有只读权限还是写入权限。点击查询编辑器中的 **Share** 按钮即可试用新的共享查询功能。

<Image
  img={share_queries}
  size='lg'
  alt='ClickHouse Cloud 查询编辑器显示带有权限选项的共享功能'
  border
/>

### ClickHouse Cloud for Microsoft Azure 现已进入公测阶段 {#clickhouse-cloud-for-microsoft-azure-is-now-in-beta}

我们终于推出了在 Microsoft Azure 上创建 ClickHouse Cloud 服务的功能。作为私有预览计划的一部分,已经有许多客户在生产环境中使用 Azure 上的 ClickHouse Cloud。现在,任何人都可以在 Azure 上创建自己的服务。您喜爱的所有在 AWS 和 GCP 上支持的 ClickHouse 功能也将在 Azure 上可用。

我们预计在未来几周内 ClickHouse Cloud for Azure 将正式发布(General Availability)。[阅读此博客文章](https://clickhouse.com/blog/clickhouse-cloud-is-now-on-azure-in-public-beta)了解更多信息,或通过 ClickHouse Cloud 控制台使用 Azure 创建新服务。

注意:目前不支持 Azure 的 **Development** 服务。

### 通过 Cloud 控制台设置 Private Link {#set-up-private-link-via-the-cloud-console}

我们的 Private Link 功能允许您将 ClickHouse Cloud 服务与云提供商账户中的内部服务连接,而无需将流量导向公共互联网,从而节省成本并增强安全性。以前,这需要使用 ClickHouse Cloud API 进行复杂的设置。

现在,您只需在 ClickHouse Cloud 控制台中点击几下即可配置私有端点。只需转到服务的 **Settings**,进入 **Security** 部分,然后点击 **Set up private endpoint**。

<Image
  img={private_endpoint}
  size='lg'
  alt='ClickHouse Cloud 控制台显示安全设置中的私有端点设置界面'
  border
/>


## 2024年5月17日 {#may-17-2024}

### 使用 ClickPipes 从 Amazon Kinesis 摄取数据(Beta 版) {#ingest-data-from-amazon-kinesis-using-clickpipes-beta}

ClickPipes 是 ClickHouse Cloud 提供的专属服务,可实现无代码数据摄取。Amazon Kinesis 是 AWS 的全托管流式服务,用于摄取和存储数据流以供处理。我们很高兴推出 ClickPipes 对 Amazon Kinesis 的 Beta 版支持,这是用户呼声最高的集成之一。我们正在为 ClickPipes 添加更多集成,欢迎告诉我们您希望我们支持哪些数据源。在[此处](https://clickhouse.com/blog/clickpipes-amazon-kinesis)了解有关此功能的更多信息。

您可以在云控制台中试用 ClickPipes 的新 Amazon Kinesis 集成:

<Image
  img={kenesis}
  size='lg'
  alt='ClickPipes 界面显示 Amazon Kinesis 集成配置选项'
  border
/>

### 可配置备份(私有预览版) {#configurable-backups-private-preview}

备份对于每个数据库都至关重要(无论其可靠性如何),自 ClickHouse Cloud 推出第一天起,我们就非常重视备份。本周,我们推出了可配置备份功能,为您的服务备份提供了更大的灵活性。您现在可以控制开始时间、保留期限和频率。此功能适用于**生产**和**专用**服务,不适用于**开发**服务。由于此功能处于私有预览阶段,请联系 support@clickhouse.com 为您的服务启用此功能。在[此处](https://clickhouse.com/blog/configurable-backups-in-clickhouse-cloud)了解有关可配置备份的更多信息。

### 从 SQL 查询创建 API(Beta 版) {#create-apis-from-your-sql-queries-beta}

当您为 ClickHouse 编写 SQL 查询时,仍然需要通过驱动程序连接到 ClickHouse 才能将查询暴露给应用程序。现在通过我们的**查询端点**功能,您可以直接从 API 执行 SQL 查询,无需任何配置。您可以指定查询端点返回 JSON、CSV 或 TSV 格式。在云控制台中点击"共享"按钮,即可使用您的查询试用此新功能。在[此处](https://clickhouse.com/blog/automatic-query-endpoints)了解有关查询端点的更多信息。

<Image
  img={query_endpoints}
  size='lg'
  alt='ClickHouse Cloud 界面显示查询端点配置及输出格式选项'
  border
/>

### ClickHouse 官方认证现已推出 {#official-clickhouse-certification-is-now-available}

ClickHouse 开发培训课程包含 12 个免费培训模块。在本周之前,没有官方途径来证明您对 ClickHouse 的掌握程度。我们最近推出了官方考试,以获得 **ClickHouse 认证开发者**资格。完成此考试后,您可以向当前和潜在雇主展示您在 ClickHouse 方面的专业能力,涵盖数据摄取、建模、分析、性能优化等主题。您可以在[此处](https://clickhouse.com/learn/certification)参加考试,或在此[博客文章](https://clickhouse.com/blog/first-official-clickhouse-certification)中了解有关 ClickHouse 认证的更多信息。


## 2024年4月25日 {#april-25-2024}

### 使用 ClickPipes 从 S3 和 GCS 加载数据 {#load-data-from-s3-and-gcs-using-clickpipes}

您可能已经注意到,在我们新发布的云控制台中有一个名为"数据源"的新部分。"数据源"页面由 ClickPipes 提供支持,这是 ClickHouse Cloud 的原生功能,让您可以轻松地将来自各种来源的数据导入到 ClickHouse Cloud 中。

我们最新的 ClickPipes 更新支持直接从 Amazon S3 和 Google Cloud Storage 上传数据。虽然您仍然可以使用我们的内置表函数,但 ClickPipes 是通过我们的用户界面提供的完全托管服务,只需点击几下即可从 S3 和 GCS 导入数据。此功能目前仍处于私有预览阶段,但您现在就可以通过云控制台试用。

<Image
  img={s3_gcs}
  size='lg'
  alt='ClickPipes 界面显示从 S3 和 GCS 存储桶加载数据的配置选项'
  border
/>

### 使用 Fivetran 从 500 多个数据源加载数据到 ClickHouse Cloud {#use-fivetran-to-load-data-from-500-sources-into-clickhouse-cloud}

ClickHouse 可以快速查询您的所有大型数据集,但首先需要将数据导入到 ClickHouse 中。借助 Fivetran 全面的连接器,用户现在可以快速从 500 多个数据源加载数据。无论您需要从 Zendesk、Slack 还是任何您喜爱的应用程序加载数据,Fivetran 的新 ClickHouse 目标连接器现在都允许您将 ClickHouse 用作应用程序数据的目标数据库。

这是我们集成团队经过数月努力构建的开源集成。您可以在此处查看我们的[发布博客文章](https://clickhouse.com/blog/fivetran-destination-clickhouse-cloud)和 [GitHub 仓库](https://github.com/ClickHouse/clickhouse-fivetran-destination)。

### 其他变更 {#other-changes}

**控制台变更**

- SQL 控制台支持输出格式

**集成变更**

- ClickPipes Kafka 连接器支持多代理设置
- PowerBI 连接器支持提供 ODBC 驱动程序配置选项


## 2024 年 4 月 18 日 {#april-18-2024}

### ClickHouse Cloud 现已支持 AWS 东京区域 {#aws-tokyo-region-is-now-available-for-clickhouse-cloud}

本次发布为 ClickHouse Cloud 引入了新的 AWS 东京区域(`ap-northeast-1`)。为了让 ClickHouse 成为最快的数据库,我们持续为各个云平台添加更多区域,以尽可能降低延迟。您可以在更新后的云控制台中创建位于东京的新服务。

<Image
  img={tokyo}
  size='lg'
  alt='ClickHouse Cloud 服务创建界面显示东京区域选择'
  border
/>

其他变更:

### 控制台变更 {#console-changes}

- ClickPipes for Kafka 的 Avro 格式支持现已正式发布
- 为 Terraform provider 实现了完整的资源导入支持(服务和私有端点)

### 集成变更 {#integrations-changes}

- NodeJS 客户端主要稳定版本发布:为查询 + ResultSet 提供高级 TypeScript 支持,URL 配置
- Kafka Connector:修复了写入 DLQ 时忽略异常的问题,添加了对 Avro Enum 类型的支持,发布了在 [MSK](https://www.youtube.com/watch?v=6lKI_WlQ3-s) 和 [Confluent Cloud](https://www.youtube.com/watch?v=SQAiPVbd3gg) 上使用连接器的指南
- Grafana:修复了 UI 中对 Nullable 类型的支持,修复了对动态 OTEL 追踪表名的支持
- DBT:修复了自定义物化的模型设置
- Java 客户端:修复了错误代码解析不正确的问题
- Python 客户端:修复了数值类型的参数绑定问题,修复了查询绑定中数字列表的错误,添加了 SQLAlchemy Point 支持


## April 4, 2024 {#april-4-2024}

### 推出全新 ClickHouse Cloud 控制台 {#introducing-the-new-clickhouse-cloud-console}

本次发布为全新云控制台推出私有预览版。

在 ClickHouse,我们始终致力于提升开发者体验。我们深知,仅仅提供最快的实时数据仓库还不够,它还必须易于使用和管理。

每月有数千名 ClickHouse Cloud 用户在我们的 SQL 控制台上执行数十亿次查询,因此我们决定加大投入,打造世界级控制台,让您与 ClickHouse Cloud 服务的交互变得前所未有的简单。我们的全新云控制台体验将独立 SQL 编辑器与管理控制台整合到一个直观的用户界面中。

精选客户将率先体验我们的全新云控制台——一种统一且沉浸式的方式来探索和管理您在 ClickHouse 中的数据。如果您希望优先获得访问权限,请通过 support@clickhouse.com 与我们联系。

<Image
  img={cloud_console}
  size='lg'
  alt='展示全新 ClickHouse Cloud 控制台界面的动画,集成了 SQL 编辑器和管理功能'
  border
/>


## 2024 年 3 月 28 日 {#march-28-2024}

此版本引入了对 Microsoft Azure 的支持、通过 API 进行水平扩展以及处于私有预览阶段的发布渠道功能。

### 常规更新 {#general-updates}

- 在私有预览阶段引入了对 Microsoft Azure 的支持。如需获取访问权限,请联系客户经理或支持团队,或加入[候补名单](https://clickhouse.com/cloud/azure-waitlist)。
- 引入了发布渠道功能 – 可根据环境类型指定升级时机。在此版本中,我们新增了"快速"发布渠道,使您能够在生产环境之前升级非生产环境(请联系支持团队启用此功能)。

### 管理功能变更 {#administration-changes}

- 新增通过 API 进行水平扩展配置的支持(私有预览阶段,请联系支持团队启用)
- 改进了自动扩展功能,可对启动时遇到内存不足错误的服务进行扩容
- 通过 Terraform provider 新增了对 AWS CMEK 的支持

### 控制台变更 {#console-changes-1}

- 新增对 Microsoft 社交登录的支持
- 在 SQL 控制台中新增参数化查询共享功能
- 显著提升了查询编辑器性能(在某些欧盟地区,延迟从 5 秒降至 1.5 秒)

### 集成功能变更 {#integrations-changes-1}

- ClickHouse OpenTelemetry exporter:[新增了对](https://github.com/open-telemetry/opentelemetry-collector-contrib/pull/31920) ClickHouse 复制表引擎的支持,并[新增了集成测试](https://github.com/open-telemetry/opentelemetry-collector-contrib/pull/31896)
- ClickHouse DBT adapter:新增了对[字典物化宏](https://github.com/ClickHouse/dbt-clickhouse/pull/255)的支持,[TTL 表达式支持的测试](https://github.com/ClickHouse/dbt-clickhouse/pull/254)
- ClickHouse Kafka Connect Sink:[新增了与](https://github.com/ClickHouse/clickhouse-kafka-connect/issues/350) Kafka 插件发现的兼容性(社区贡献)
- ClickHouse Java Client:为新客户端 API 引入了[新包](https://github.com/ClickHouse/clickhouse-java/pull/1574),并为 Cloud 测试[新增了测试覆盖](https://github.com/ClickHouse/clickhouse-java/pull/1575)
- ClickHouse NodeJS Client:扩展了新 HTTP keep-alive 行为的测试和文档。自 v0.3.0 版本起可用
- ClickHouse Golang Client:[修复了](https://github.com/ClickHouse/clickhouse-go/pull/1236) Enum 作为 Map 键的错误;[修复了](https://github.com/ClickHouse/clickhouse-go/pull/1237)错误连接残留在连接池中的问题(社区贡献)
- ClickHouse Python Client:[新增了](https://github.com/ClickHouse/clickhouse-connect/issues/155)通过 PyArrow 进行查询流式传输的支持(社区贡献)

### 安全更新 {#security-updates}

- 更新了 ClickHouse Cloud 以防止["启用查询缓存时绕过基于角色的访问控制"](https://github.com/ClickHouse/ClickHouse/security/advisories/GHSA-45h5-f7g3-gr8r)漏洞 (CVE-2024-22412)


## 2024年3月14日 {#march-14-2024}

此版本以早期访问形式提供了全新的 Cloud 控制台体验、用于从 S3 和 GCS 批量加载数据的 ClickPipes,以及 ClickPipes for Kafka 对 Avro 格式的支持。此版本还将 ClickHouse 数据库版本升级至 24.1,带来了新函数支持以及性能和资源使用优化。

### 控制台变更 {#console-changes-2}

- 全新的 Cloud 控制台体验以早期访问形式提供(如有兴趣参与,请联系支持团队)。
- 用于从 S3 和 GCS 批量加载数据的 ClickPipes 以早期访问形式提供(如有兴趣参与,请联系支持团队)。
- ClickPipes for Kafka 对 Avro 格式的支持以早期访问形式提供(如有兴趣参与,请联系支持团队)。

### ClickHouse 版本升级 {#clickhouse-version-upgrade}

- FINAL 优化、向量化改进、更快的聚合操作 - 详情请参阅 [23.12 版本博客](https://clickhouse.com/blog/clickhouse-release-23-12#optimizations-for-final)。
- 新增用于处理 punycode、字符串相似度、异常值检测的函数,以及针对合并操作和 Keeper 的内存优化 - 详情请参阅 [24.1 版本博客](https://clickhouse.com/blog/clickhouse-release-24-01)和[演示文稿](https://presentations.clickhouse.com/release_24.1/)。
- 此 ClickHouse Cloud 版本基于 24.1,包含数十项新功能、性能改进和错误修复。详情请参阅核心数据库[变更日志](/whats-new/changelog/2023#2312)。

### 集成变更 {#integrations-changes-2}

- Grafana:修复了 v4 仪表板迁移、即席过滤逻辑
- Tableau Connector:修复了 DATENAME 函数和 "real" 参数的舍入问题
- Kafka Connector:修复了连接初始化中的空指针异常,新增了指定 JDBC 驱动程序选项的功能
- Golang 客户端:减少了处理响应的内存占用,修复了 Date32 极值问题,修复了启用压缩时的错误报告
- Python 客户端:改进了 datetime 参数的时区支持,提升了 Pandas DataFrame 的性能


## 2024年2月29日 {#february-29-2024}

此版本改进了 SQL 控制台应用程序的加载时间,在 ClickPipes 中添加了对 SCRAM-SHA-256 身份验证的支持,并扩展了 Kafka Connect 对嵌套结构的支持。

### 控制台变更 {#console-changes-3}

- 优化了 SQL 控制台应用程序的初始加载时间
- 修复了 SQL 控制台竞态条件导致的"身份验证失败"错误
- 修复了监控页面上最新内存分配值有时显示不正确的问题
- 修复了 SQL 控制台有时会发出重复 KILL QUERY 命令的问题
- 在 ClickPipes 中为基于 Kafka 的数据源添加了对 SCRAM-SHA-256 身份验证方法的支持

### 集成变更 {#integrations-changes-3}

- Kafka Connector:扩展了对复杂嵌套结构(Array、Map)的支持;添加了对 FixedString 类型的支持;添加了对向多个数据库写入数据的支持
- Metabase:修复了与 ClickHouse 23.8 以下版本的不兼容问题
- DBT:添加了向模型创建传递设置的功能
- Node.js 客户端:添加了对长时间运行查询(>1小时)的支持以及对空值的优雅处理


## 2024年2月15日 {#february-15-2024}

此版本升级了核心数据库版本,新增通过 Terraform 设置私有链接的功能,并为通过 Kafka Connect 进行的异步插入添加了精确一次(exactly-once)语义支持。

### ClickHouse 版本升级 {#clickhouse-version-upgrade-1}

- 用于从 S3 持续、定期加载数据的 S3Queue 表引擎已达到生产就绪状态 - 详情请参阅 [23.11 版本博客](https://clickhouse.com/blog/clickhouse-release-23-11)。
- FINAL 的显著性能改进以及 SIMD 指令的向量化优化,使查询速度更快 - 详情请参阅 [23.12 版本博客](https://clickhouse.com/blog/clickhouse-release-23-12#optimizations-for-final)。
- 此 ClickHouse Cloud 版本基于 23.12,包含数十项新功能、性能改进和错误修复。详情请参阅[核心数据库变更日志](/whats-new/changelog/2023#2312)。

### 控制台变更 {#console-changes-4}

- 新增通过 Terraform provider 设置 AWS Private Link 和 GCP Private Service Connect 的功能
- 改进了远程文件数据导入的可靠性
- 为所有数据导入添加了导入状态详情浮窗
- 为 S3 数据导入添加了访问密钥/私密访问密钥凭证支持

### 集成变更 {#integrations-changes-4}

- Kafka Connect
  - 支持精确一次(exactly-once)的 async_insert(默认禁用)
- Golang 客户端
  - 修复了 DateTime 绑定问题
  - 改进了批量插入性能
- Java 客户端
  - 修复了请求压缩问题

### 设置变更 {#settings-changes}

- 不再需要 `use_mysql_types_in_show_columns`。当您通过 MySQL 接口连接时,它将自动启用。
- `async_insert_max_data_size` 现在的默认值为 `10 MiB`


## 2024年2月2日 {#february-2-2024}

此版本为 Azure Event Hub 提供了 ClickPipes 支持,通过 v4 版本的 ClickHouse Grafana 连接器显著改进了日志和追踪导航工作流,并首次支持 Flyway 和 Atlas 数据库模式管理工具。

### 控制台变更 {#console-changes-5}

- 新增对 Azure Event Hub 的 ClickPipes 支持
- 新服务启动时默认空闲时间为 15 分钟

### 集成变更 {#integrations-changes-5}

- [Grafana 的 ClickHouse 数据源](https://grafana.com/grafana/plugins/grafana-clickhouse-datasource/) v4 版本发布
  - 完全重构查询构建器,为表、日志、时间序列和追踪提供专用编辑器
  - 完全重构 SQL 生成器以支持更复杂和动态的查询
  - 在日志和追踪视图中新增对 OpenTelemetry 的原生支持
  - 扩展配置功能,允许为日志和追踪指定默认表和列
  - 新增指定自定义 HTTP 头的功能
  - 以及更多改进 - 查看完整的[变更日志](https://github.com/grafana/clickhouse-datasource/blob/main/CHANGELOG.md#400)
- 数据库模式管理工具
  - [Flyway 新增 ClickHouse 支持](https://github.com/flyway/flyway-community-db-support/packages/2037428)
  - [Ariga Atlas 新增 ClickHouse 支持](https://atlasgo.io/blog/2023/12/19/atlas-v-0-16#clickhouse-beta-program)
- Kafka Connector Sink
  - 优化了向带有默认值的表中进行数据摄取
  - 新增对 DateTime64 中基于字符串的日期的支持
- Metabase
  - 新增对连接多个数据库的支持


## 2024年1月18日 {#january-18-2024}

此版本在 AWS 新增了一个区域(伦敦 / eu-west-2),为 Redpanda、Upstash 和 Warpstream 添加了 ClickPipes 支持,并提升了 [is_deleted](/engines/table-engines/mergetree-family/replacingmergetree#is_deleted) 核心数据库功能的可靠性。

### 常规变更 {#general-changes}

- 新增 AWS 区域:伦敦 (eu-west-2)

### 控制台变更 {#console-changes-6}

- 为 Redpanda、Upstash 和 Warpstream 添加了 ClickPipes 支持
- 使 ClickPipes 身份验证机制可在 UI 中配置

### 集成变更 {#integrations-changes-6}

- Java 客户端:
  - 破坏性变更:移除了在调用中指定随机 URL 句柄的功能。此功能已从 ClickHouse 中移除
  - 已弃用:Java CLI 客户端和 GRPC 包
  - 添加了对 RowBinaryWithDefaults 格式的支持,以减少 ClickHouse 实例的批处理大小和工作负载(应 Exabeam 请求)
  - 使 Date32 和 DateTime64 范围边界与 ClickHouse 兼容,兼容 Spark Array 字符串类型,节点选择机制
- Kafka 连接器:为 Grafana 添加了 JMX 监控仪表板
- PowerBI:使 ODBC 驱动程序设置可在 UI 中配置
- JavaScript 客户端:公开查询摘要信息,允许为插入操作提供特定列的子集,使 Web 客户端的 keep_alive 可配置
- Python 客户端:为 SQLAlchemy 添加了 Nothing 类型支持

### 可靠性变更 {#reliability-changes}

- 面向用户的向后不兼容变更:以前,两个功能([is_deleted](/engines/table-engines/mergetree-family/replacingmergetree#is_deleted) 和 `OPTIMIZE CLEANUP`)在某些条件下可能导致 ClickHouse 中的数据损坏。为了保护用户数据的完整性,同时保留核心功能,我们调整了此功能的工作方式。具体来说,MergeTree 设置 `clean_deleted_rows` 现已弃用且不再生效。默认情况下不允许使用 `CLEANUP` 关键字(要使用它,您需要启用 `allow_experimental_replacing_merge_with_cleanup`)。如果您决定使用 `CLEANUP`,则需要确保始终将其与 `FINAL` 一起使用,并且必须保证在运行 `OPTIMIZE FINAL CLEANUP` 后不会插入旧版本的行。


## 2023年12月18日 {#december-18-2023}

此版本在 GCP 新增了一个区域（us-east1），支持自助配置安全端点连接，增加了对包括 DBT 1.7 在内的更多集成的支持，并修复了大量错误和安全增强。

### 常规变更 {#general-changes-1}

- ClickHouse Cloud 现已在 GCP us-east1（南卡罗来纳州）区域可用
- 支持通过 OpenAPI 配置 AWS Private Link 和 GCP Private Service Connect

### 控制台变更 {#console-changes-7}

- 为具有 Developer 角色的用户启用了 SQL 控制台无缝登录功能
- 简化了入门过程中设置空闲控制的工作流程

### 集成变更 {#integrations-changes-7}

- DBT 连接器：新增对 DBT v1.7 及更早版本的支持
- Metabase：新增对 Metabase v0.48 的支持
- PowerBI 连接器：新增在 PowerBI Cloud 上运行的能力
- ClickPipes 内部用户权限现已支持配置
- Kafka Connect
  - 改进了去重逻辑和 Nullable 类型的数据摄取
  - 新增对基于文本格式（CSV、TSV）的支持
- Apache Beam：新增对 Boolean 和 LowCardinality 类型的支持
- Node.js 客户端：新增对 Parquet 格式的支持

### 安全公告 {#security-announcements}

- 修复了 3 个安全漏洞 - 详情请参阅[安全更新日志](/whats-new/security-changelog)：
  - CVE-2023-47118（CVSS 7.0）- 影响默认运行在 9000/tcp 端口上的原生接口的堆缓冲区溢出漏洞
  - CVE-2023-48704（CVSS 7.0）- 影响默认运行在 9000/tcp 端口上的原生接口的堆缓冲区溢出漏洞
  - CVE-2023-48298（CVSS 5.9）- FPC 压缩编解码器中的整数下溢漏洞


## 2023 年 11 月 22 日 {#november-22-2023}

此版本升级了核心数据库版本,改进了登录和身份验证流程,并为 Kafka Connect Sink 添加了代理支持。

### ClickHouse 版本升级 {#clickhouse-version-upgrade-2}

- 大幅提升了 Parquet 文件的读取性能。详情请参阅 [23.8 版本博客](https://clickhouse.com/blog/clickhouse-release-23-08)。
- 新增了 JSON 类型推断支持。详情请参阅 [23.9 版本博客](https://clickhouse.com/blog/clickhouse-release-23-09)。
- 引入了面向分析人员的强大函数,如 `ArrayFold`。详情请参阅 [23.10 版本博客](https://clickhouse.com/blog/clickhouse-release-23-10)。
- **面向用户的向后不兼容变更**:默认禁用了 `input_format_json_try_infer_numbers_from_strings` 设置,以避免从 JSON 格式的字符串中推断数字。当样本数据包含类似数字的字符串时,启用此设置可能会导致解析错误。
- 数十项新功能、性能改进和错误修复。详情请参阅[核心数据库变更日志](/whats-new/changelog)。

### 控制台变更 {#console-changes-8}

- 改进了登录和身份验证流程。
- 改进了基于 AI 的查询建议功能,以更好地支持大型 schema。

### 集成变更 {#integrations-changes-8}

- Kafka Connect Sink:新增了代理支持、`topic-tablename` 映射,以及 Keeper _精确一次_ 传递属性的可配置性。
- Node.js 客户端:新增了对 Parquet 格式的支持。
- Metabase:新增了 `datetimeDiff` 函数支持。
- Python 客户端:新增了对列名中特殊字符的支持。修复了时区参数绑定问题。


## 2023 年 11 月 2 日 {#november-2-2023}

此版本为亚洲地区的开发服务增加了更多区域支持,引入了客户管理加密密钥的密钥轮换功能,改进了账单控制台中税务设置的粒度,并修复了多个支持的语言客户端中的 bug。

### 常规更新 {#general-updates-1}

- 开发服务现已在 AWS 的 `ap-south-1`(孟买)和 `ap-southeast-1`(新加坡)区域可用
- 新增对客户管理加密密钥(CMEK)中密钥轮换的支持

### 控制台变更 {#console-changes-9}

- 新增在添加信用卡时配置细粒度税务设置的功能

### 集成变更 {#integrations-changes-9}

- MySQL
  - 改进了通过 MySQL 对 Tableau Online 和 QuickSight 的支持
- Kafka Connector
  - 引入了新的 StringConverter 以支持基于文本的格式(CSV、TSV)
  - 新增对 Bytes 和 Decimal 数据类型的支持
  - 调整了可重试异常,现在始终会重试(即使在 errors.tolerance=all 时)
- Node.js 客户端
  - 修复了流式传输大型数据集时返回损坏结果的问题
- Python 客户端
  - 修复了大批量插入时的超时问题
  - 修复了 NumPy/Pandas Date32 问题
    - Golang 客户端
  - 修复了向 JSON 列插入空 map、压缩缓冲区清理、查询转义、IPv4 和 IPv6 零值/空值时的 panic 问题
  - 新增对已取消插入操作的监控
- DBT
  - 改进了分布式表支持并增加了测试


## 2023年10月19日 {#october-19-2023}

此版本为 SQL 控制台带来了可用性和性能改进,改善了 Metabase 连接器中的 IP 数据类型处理,并为 Java 和 Node.js 客户端增加了新功能。

### 控制台变更 {#console-changes-10}

- 改进了 SQL 控制台的可用性(例如在查询执行之间保持列宽)
- 提升了 SQL 控制台的性能

### 集成变更 {#integrations-changes-10}

- Java 客户端:
  - 切换了默认网络库以提升性能并复用已打开的连接
  - 新增代理支持
  - 新增使用 Trust Store 进行安全连接的支持
- Node.js 客户端:修复了插入查询的 keep-alive 行为
- Metabase:修复了 IPv4/IPv6 列序列化问题


## 2023年9月28日 {#september-28-2023}

此版本正式发布了适用于 Kafka、Confluent Cloud 和 Amazon MSK 的 ClickPipes 以及 Kafka Connect ClickHouse Sink,提供了通过 IAM 角色安全访问 Amazon S3 的自助服务工作流,以及 AI 辅助查询建议(私有预览)。

### 控制台变更 {#console-changes-11}

- 新增了通过 IAM 角色安全[访问 Amazon S3](/cloud/data-sources/secure-s3) 的自助服务工作流
- 推出了 AI 辅助查询建议的私有预览版(请[联系 ClickHouse Cloud 支持](https://console.clickhouse.cloud/support)试用)

### 集成变更 {#integrations-changes-11}

- 宣布 ClickPipes(一项即开即用的数据摄取服务)正式发布,支持 Kafka、Confluent Cloud 和 Amazon MSK(参见[发布博客](https://clickhouse.com/blog/clickpipes-is-generally-available))
- Kafka Connect ClickHouse Sink 正式发布
  - 扩展了对使用 `clickhouse.settings` 属性自定义 ClickHouse 设置的支持
  - 改进了去重行为以支持动态字段
  - 新增了对 `tableRefreshInterval` 的支持,用于从 ClickHouse 重新获取表变更
- 修复了 [PowerBI](/integrations/powerbi) 与 ClickHouse 数据类型之间的 SSL 连接问题和类型映射问题


## 2023年9月7日 {#september-7-2023}

此版本发布了 PowerBI Desktop 官方连接器的测试版,改进了印度地区的信用卡支付处理,并对多个语言客户端进行了改进。

### 控制台变更 {#console-changes-12}

- 新增剩余额度显示和支付重试功能,以支持印度地区的扣费

### 集成变更 {#integrations-changes-12}

- Kafka Connector:新增 ClickHouse 设置配置支持,新增 error.tolerance 配置选项
- PowerBI Desktop:发布官方连接器测试版
- Grafana:新增 Point 地理类型支持,修复 Data Analyst 仪表板中的面板问题,修复 timeInterval 宏
- Python 客户端:兼容 Pandas 2.1.0,停止支持 Python 3.7,新增可空 JSON 类型支持
- Node.js 客户端:新增 default_format 设置支持
- Golang 客户端:修复 bool 类型处理问题,移除字符串长度限制


## 2023年8月24日 {#aug-24-2023}

此版本为 ClickHouse 数据库添加了 MySQL 接口支持,引入了新的官方 PowerBI 连接器,在云控制台中新增了"运行中查询"视图,并将 ClickHouse 版本更新至 23.7。

### 常规更新 {#general-updates-2}

- 新增对 [MySQL 线协议](/interfaces/mysql)的支持,可与众多现有 BI 工具兼容使用。如需为您的组织启用此功能,请联系技术支持。
- 推出新的官方 PowerBI 连接器

### 控制台变更 {#console-changes-13}

- SQL 控制台新增"运行中查询"视图

### ClickHouse 23.7 版本升级 {#clickhouse-237-version-upgrade}

- 新增 Azure Table 函数支持,地理数据类型升级为生产就绪状态,并改进了 JOIN 性能 - 详见 23.5 版本[博客](https://clickhouse.com/blog/clickhouse-release-23-05)
- MongoDB 集成支持扩展至 6.0 版本 - 详见 23.6 版本[博客](https://clickhouse.com/blog/clickhouse-release-23-06)
- Parquet 格式写入性能提升 6 倍,新增 PRQL 查询语言支持,并改进了 SQL 兼容性 - 详见 23.7 版本[演示文稿](https://presentations.clickhouse.com/release_23.7/)
- 数十项新功能、性能改进和错误修复 - 详见 23.5、23.6、23.7 的详细[变更日志](/whats-new/changelog)

### 集成变更 {#integrations-changes-13}

- Kafka 连接器:新增 Avro 日期和时间类型支持
- JavaScript 客户端:发布 Web 环境稳定版本
- Grafana:改进了过滤逻辑和数据库名称处理,新增亚秒级精度 TimeInterval 支持
- Golang 客户端:修复了多个批量和异步数据加载问题
- Metabase:支持 v0.47 版本,新增连接模拟功能,修复了数据类型映射问题


## 2023年7月27日 {#july-27-2023}

此版本推出了 ClickPipes for Kafka 的私有预览版、全新的数据加载体验,以及通过云控制台从 URL 加载文件的功能。

### 集成变更 {#integrations-changes-14}

- 推出了 [ClickPipes](https://clickhouse.com/cloud/clickpipes) for Kafka 的私有预览版,这是一个云原生集成引擎,只需点击几下即可从 Kafka 和 Confluent Cloud 摄取海量数据。请在[此处](https://clickhouse.com/cloud/clickpipes#joinwaitlist)注册候补名单。
- JavaScript 客户端:发布了对基于 Web 环境(浏览器、Cloudflare workers)的支持。代码已重构,允许社区为自定义环境创建连接器。
- Kafka 连接器:新增对 Timestamp 和 Time Kafka 类型内联模式的支持
- Python 客户端:修复了插入压缩和 LowCardinality 读取问题

### 控制台变更 {#console-changes-14}

- 新增数据加载体验,提供更多表创建配置选项
- 新增通过云控制台从 URL 加载文件的功能
- 改进了邀请流程,新增加入不同组织和查看所有待处理邀请的选项


## July 14, 2023 {#july-14-2023}

此版本新增了专用服务部署能力、澳大利亚新 AWS 区域,以及自带密钥加密磁盘数据的功能。

### 常规更新 {#general-updates-3}

- 新增 AWS 澳大利亚区域:悉尼 (ap-southeast-2)
- 面向延迟敏感型高负载工作场景的专用层级服务(请联系[支持团队](https://console.clickhouse.cloud/support)进行配置)
- 自带密钥 (BYOK) 加密磁盘数据(请联系[支持团队](https://console.clickhouse.cloud/support)进行配置)

### 控制台变更 {#console-changes-15}

- 改进异步插入的可观测性指标仪表板
- 改进聊天机器人与支持系统的集成行为

### 集成变更 {#integrations-changes-15}

- NodeJS 客户端:修复了套接字超时导致的连接失败问题
- Python 客户端:为插入查询添加了 QuerySummary,支持数据库名称中的特殊字符
- Metabase:更新了 JDBC 驱动程序版本,新增 DateTime64 支持,性能优化

### 核心数据库变更 {#core-database-changes}

- ClickHouse Cloud 现已支持启用[查询缓存](/operations/query-cache)。启用后,成功执行的查询默认会被缓存一分钟,后续相同查询将直接使用缓存结果。


## 2023年6月20日 {#june-20-2023}

此版本正式推出 GCP 上的 ClickHouse Cloud，引入了 Cloud API 的 Terraform provider，并将 ClickHouse 版本更新至 23.4。

### 常规更新 {#general-updates-4}

- GCP 上的 ClickHouse Cloud 现已正式发布（GA），集成了 GCP Marketplace，支持 Private Service Connect，并提供自动备份功能（详情请参阅[博客](https://clickhouse.com/blog/clickhouse-cloud-on-google-cloud-platform-gcp-is-generally-available)和[新闻稿](https://clickhouse.com/blog/clickhouse-cloud-expands-choice-with-launch-on-google-cloud-platform)）
- Cloud API 的 [Terraform provider](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs) 现已推出

### 控制台变更 {#console-changes-16}

- 为服务新增了统一的设置页面
- 调整了存储和计算的计量精度

### 集成变更 {#integrations-changes-16}

- Python 客户端：改进了插入性能，重构了内部依赖以支持多进程
- Kafka Connector：可上传并安装到 Confluent Cloud，为临时连接问题增加了重试机制，自动重置错误的连接器状态

### ClickHouse 23.4 版本升级 {#clickhouse-234-version-upgrade}

- 为并行副本增加了 JOIN 支持（请联系[技术支持](https://console.clickhouse.cloud/support)进行配置）
- 改进了轻量级删除的性能
- 改进了处理大批量插入时的缓存性能

### 管理变更 {#administration-changes-1}

- 扩展了非"default"用户的本地字典创建功能


## 2023年5月30日 {#may-30-2023}

此版本正式发布了 ClickHouse Cloud 控制平面操作的编程 API(详见[博客](https://clickhouse.com/blog/using-the-new-clickhouse-cloud-api-to-automate-deployments)),支持使用 IAM 角色访问 S3,以及新增扩展选项。

### 常规变更 {#general-changes-2}

- ClickHouse Cloud 的 API 支持。通过新的 Cloud API,您可以将服务管理无缝集成到现有的 CI/CD 流水线中,并以编程方式管理您的服务
- 使用 IAM 角色访问 S3。您现在可以利用 IAM 角色安全地访问您的私有 Amazon Simple Storage Service (S3) 存储桶(请联系技术支持进行配置)

### 扩展变更 {#scaling-changes}

- [水平扩展](/manage/scaling#manual-horizontal-scaling)。需要更高并行度的工作负载现在可以配置最多 10 个副本(请联系技术支持进行配置)
- [基于 CPU 的自动扩展](/manage/scaling)。CPU 密集型工作负载现在可以利用自动扩展策略的额外触发条件

### 控制台变更 {#console-changes-17}

- 将开发服务迁移到生产服务(请联系技术支持启用)
- 在实例创建流程中新增了扩展配置控制
- 修复了当内存中不存在默认密码时的连接字符串问题

### 集成变更 {#integrations-changes-17}

- Golang 客户端:修复了导致原生协议中连接不均衡的问题,新增了对原生协议中自定义设置的支持
- Node.js 客户端:停止支持 Node.js v14,新增了对 v20 的支持
- Kafka Connector:新增了对 LowCardinality 类型的支持
- Metabase:修复了按时间范围分组的问题,修复了内置 Metabase 查询中对整数的支持

### 性能和可靠性 {#performance-and-reliability}

- 提升了写入密集型工作负载的效率和性能
- 部署了增量备份策略以提升备份的速度和效率


## 2023年5月11日 {#may-11-2023}

此版本发布了 ClickHouse Cloud 在 GCP 上的公开测试版
(详见[博客](https://clickhouse.com/blog/clickhouse-cloud-on-gcp-available-in-public-beta)),
扩展了管理员授予终止查询权限的能力,
并在 Cloud 控制台中增加了 MFA 用户状态的可见性。

:::note 更新
ClickHouse Cloud 在 GCP 上现已正式发布(GA),请参阅上方6月20日的条目。
:::

### ClickHouse Cloud 在 GCP 上现已提供公开测试版 {#clickhouse-cloud-on-gcp-is-now-available-in-public-beta-now-ga-see-june-20th-entry-above}

:::note
ClickHouse Cloud 在 GCP 上现已正式发布(GA),请参阅上方[6月20日](#june-20-2023)的条目。
:::

- 推出完全托管的存储计算分离架构 ClickHouse 服务,运行在 Google Compute 和 Google Cloud Storage 之上
- 在爱荷华州(us-central1)、荷兰(europe-west4)和新加坡(asia-southeast1)区域可用
- 在所有三个初始区域均支持开发和生产服务
- 默认提供强大的安全保障:传输中端到端加密、静态数据加密、IP 白名单

### 集成变更 {#integrations-changes-18}

- Golang 客户端:新增代理环境变量支持
- Grafana:在 Grafana 数据源配置中新增指定 ClickHouse 自定义设置和代理环境变量的功能
- Kafka Connector:改进了空记录的处理

### 控制台变更 {#console-changes-18}

- 在用户列表中新增多因素身份验证(MFA)使用状态指示器

### 性能与可靠性 {#performance-and-reliability-1}

- 为管理员新增对终止查询权限更细粒度的控制


## 2023 年 5 月 4 日 {#may-4-2023}

此版本引入了新的热力图图表类型,改进了账单使用情况页面,并提升了服务启动速度。

### 控制台变更 {#console-changes-19}

- 在 SQL 控制台中添加了热力图图表类型
- 改进了账单使用情况页面,可显示每个计费维度内消耗的额度

### 集成变更 {#integrations-changes-19}

- Kafka 连接器:为瞬态连接错误添加了重试机制
- Python 客户端:添加了 max_connection_age 设置,以确保 HTTP 连接不会被无限期重用。这有助于解决某些负载均衡问题
- Node.js 客户端:添加了对 Node.js v20 的支持
- Java 客户端:改进了客户端证书身份验证支持,并添加了对嵌套 Tuple/Map/Nested 类型的支持

### 性能和可靠性 {#performance-and-reliability-2}

- 改进了存在大量数据分片时的服务启动时间
- 优化了 SQL 控制台中长时间运行查询的取消逻辑

### 错误修复 {#bug-fixes}

- 修复了导致"Cell Towers"示例数据集导入失败的错误


## 2023年4月20日 {#april-20-2023}

此版本将 ClickHouse 更新至 23.3 版本,显著提升了冷读取速度,并引入了实时技术支持聊天功能。

### 控制台变更 {#console-changes-20}

- 新增实时技术支持聊天选项

### 集成变更 {#integrations-changes-20}

- Kafka 连接器:新增对 Nullable 类型的支持
- Golang 客户端:新增对外部表的支持,支持布尔类型和指针类型参数绑定

### 配置变更 {#configuration-changes}

- 新增删除大型表的能力——通过覆盖 `max_table_size_to_drop` 和 `max_partition_size_to_drop` 设置实现

### 性能与可靠性 {#performance-and-reliability-3}

- 通过 `allow_prefetched_read_pool_for_remote_filesystem` 设置启用 S3 预取功能,提升冷读取速度

### ClickHouse 23.3 版本升级 {#clickhouse-233-version-upgrade}

- 轻量级删除功能已可用于生产环境——详情请参阅 23.3 版本[博客](https://clickhouse.com/blog/clickhouse-release-23-03)
- 新增对多阶段 PREWHERE 的支持——详情请参阅 23.2 版本[博客](https://clickhouse.com/blog/clickhouse-release-23-03)
- 数十项新功能、性能改进和错误修复——详情请参阅 23.3 和 23.2 版本的详细[变更日志](/whats-new/changelog/index.md)


## 2023年4月6日 {#april-6-2023}

此版本新增了用于检索云端点的 API、最小空闲超时的高级扩展控制，以及 Python 客户端查询方法中的外部数据支持。

### API 变更 {#api-changes}

- 新增通过 [Cloud Endpoints API](//cloud/get-started/query-endpoints.md) 以编程方式查询 ClickHouse Cloud 端点的功能

### 控制台变更 {#console-changes-21}

- 在高级扩展设置中新增"最小空闲超时"设置
- 在数据加载对话框的模式推断中新增尽力而为的日期时间检测功能

### 集成变更 {#integrations-changes-21}

- [Metabase](/integrations/data-visualization/metabase-and-clickhouse.md): 新增对多模式的支持
- [Go client](/integrations/language-clients/go/index.md): 修复了 TLS 连接的空闲连接活性检查问题
- [Python client](/integrations/language-clients/python/index.md)
  - 在查询方法中新增对外部数据的支持
  - 为查询结果新增时区支持
  - 新增对 `no_proxy`/`NO_PROXY` 环境变量的支持
  - 修复了 Nullable 类型的 NULL 值服务器端参数绑定问题

### 错误修复 {#bug-fixes-1}

- 修复了从 SQL 控制台运行 `INSERT INTO ... SELECT ...` 时错误地应用与 SELECT 查询相同行数限制的问题


## March 23, 2023 {#march-23-2023}

此版本引入了数据库密码复杂度规则，显著提升了大型备份的恢复速度，并支持在 Grafana Trace View 中显示追踪数据。

### 安全性和可靠性 {#security-and-reliability}

- 核心数据库端点现已强制执行密码复杂度规则
- 提升了大型备份的恢复速度

### 控制台变更 {#console-changes-22}

- 简化了入门工作流程，引入了新的默认设置和更紧凑的视图
- 降低了注册和登录延迟

### 集成变更 {#integrations-changes-22}

- Grafana:
  - 新增支持在 Trace View 中显示存储在 ClickHouse 中的追踪数据
  - 改进了时间范围过滤器，并新增对表名中特殊字符的支持
- Superset: 新增原生 ClickHouse 支持
- Kafka Connect Sink: 新增自动日期转换和 Null 列处理
- Metabase: 实现了与 v0.46 的兼容性
- Python 客户端: 修复了临时表的插入问题，并新增对 Pandas Null 的支持
- Golang 客户端: 规范化了带时区的 Date 类型
- Java 客户端
  - 在 SQL 解析器中新增对 compression、infile 和 outfile 关键字的支持
  - 新增凭证重载
  - 修复了 `ON CLUSTER` 的批处理支持
- Node.js 客户端
  - 新增对 JSONStrings、JSONCompact、JSONCompactStrings、JSONColumnsWithMetadata 格式的支持
  - 现在可以为所有主要客户端方法提供 `query_id`

### 错误修复 {#bug-fixes-2}

- 修复了导致新服务初始配置和启动时间缓慢的错误
- 修复了由于缓存配置错误导致查询性能下降的错误


## March 9, 2023 {#march-9-2023}

此版本改进了可观测性仪表板,优化了大型备份的创建时间,并添加了删除大型表和分区所需的配置。

### 控制台变更 {#console-changes-23}

- 新增高级可观测性仪表板(预览版)
- 在可观测性仪表板中新增内存分配图表
- 改进了 SQL 控制台电子表格视图中的间距和换行处理

### 可靠性和性能 {#reliability-and-performance}

- 优化了备份调度,仅在数据发生修改时执行备份
- 缩短了大型备份的完成时间

### 配置变更 {#configuration-changes-1}

- 新增通过在查询或连接级别覆盖 `max_table_size_to_drop` 和 `max_partition_size_to_drop` 设置来提高删除表和分区限制的功能
- 在查询日志中新增源 IP 地址,以支持基于源 IP 的配额和访问控制

### 集成 {#integrations}

- [Python 客户端](/integrations/language-clients/python/index.md):改进了 Pandas 支持并修复了时区相关问题
- [Metabase](/integrations/data-visualization/metabase-and-clickhouse.md):支持 Metabase 0.46.x 兼容性以及 SimpleAggregateFunction
- [Kafka-Connect](/integrations/data-ingestion/kafka/index.md):支持隐式日期转换以及更好的空列处理
- [Java 客户端](https://github.com/ClickHouse/clickhouse-java):支持嵌套结构转换为 Java 映射


## 2023年2月23日 {#february-23-2023}

此版本启用了 ClickHouse 23.1 核心版本中的部分功能,实现了与 Amazon Managed Streaming for Apache Kafka (MSK) 的互操作性,并在活动日志中提供了高级扩缩容和空闲调整功能。

### ClickHouse 23.1 版本升级 {#clickhouse-231-version-upgrade}

新增对 ClickHouse 23.1 中部分功能的支持,例如:

- 支持 Map 类型的 ARRAY JOIN
- SQL 标准的十六进制和二进制字面量
- 新增函数,包括 `age()`、`quantileInterpolatedWeighted()`、`quantilesInterpolatedWeighted()`
- 支持在不带参数的 `generateRandom` 中使用插入表的结构
- 改进了数据库创建和重命名逻辑,允许重用先前的名称
- 更多详情请参阅 23.1 版本的[网络研讨会幻灯片](https://presentations.clickhouse.com/release_23.1/#cover)和 [23.1 版本更新日志](/whats-new/cloud#clickhouse-231-version-upgrade)

### 集成变更 {#integrations-changes-23}

- [Kafka-Connect](/integrations/data-ingestion/kafka/index.md): 新增对 Amazon MSK 的支持
- [Metabase](/integrations/data-visualization/metabase-and-clickhouse.md): 首个稳定版本 1.0.0
  - 连接器现已在 [Metabase Cloud](https://www.metabase.com/start/) 上可用
  - 新增浏览所有可用数据库的功能
  - 修复了 AggregationFunction 类型数据库的同步问题
- [DBT-clickhouse](/integrations/data-ingestion/etl-tools/dbt/index.md): 新增对最新 DBT 版本 v1.4.1 的支持
- [Python 客户端](/integrations/language-clients/python/index.md): 改进了代理和 SSH 隧道支持;为 Pandas DataFrames 新增了多项修复和性能优化
- [Nodejs 客户端](/integrations/language-clients/js.md): 发布了将 `query_id` 附加到查询结果的功能,可用于从 `system.query_log` 中检索查询指标
- [Golang 客户端](/integrations/language-clients/go/index.md): 优化了与 ClickHouse Cloud 的网络连接

### 控制台变更 {#console-changes-24}

- 在活动日志中新增了高级扩缩容和空闲设置调整
- 在重置密码邮件中新增了用户代理和 IP 信息
- 改进了 Google OAuth 的注册流程机制

### 可靠性和性能 {#reliability-and-performance-1}

- 加快了大型服务从空闲状态恢复的速度
- 改进了具有大量表和分区的服务的读取延迟

### 错误修复 {#bug-fixes-3}

- 修复了重置服务密码时不遵守密码策略的问题
- 使组织邀请邮件验证不区分大小写


## 2023年2月2日 {#february-2-2023}

此版本带来了官方支持的 Metabase 集成、Java 客户端/JDBC 驱动程序的重大版本更新,以及 SQL 控制台中对视图和物化视图的支持。

### 集成变更 {#integrations-changes-24}

- [Metabase](/integrations/data-visualization/metabase-and-clickhouse.md) 插件:成为由 ClickHouse 官方维护的解决方案
- [dbt](/integrations/data-ingestion/etl-tools/dbt/index.md) 插件:新增[多线程](https://github.com/ClickHouse/dbt-clickhouse/blob/main/CHANGELOG.md)支持
- [Grafana](/integrations/data-visualization/grafana/index.md) 插件:优化了连接错误处理
- [Python](/integrations/language-clients/python/index.md) 客户端:为插入操作新增[流式处理支持](/integrations/language-clients/python/advanced-querying.md#streaming-queries)
- [Go](/integrations/language-clients/go/index.md) 客户端:[错误修复](https://github.com/ClickHouse/clickhouse-go/blob/main/CHANGELOG.md):关闭已取消的连接,优化了连接错误处理
- [JS](/integrations/language-clients/js.md) 客户端:[exec/insert 中的破坏性变更](https://github.com/ClickHouse/clickhouse-js/releases/tag/0.0.12);在返回类型中公开了 query_id
- [Java](https://github.com/ClickHouse/clickhouse-java#readme) 客户端/JDBC 驱动程序重大版本发布
  - [破坏性变更](https://github.com/ClickHouse/clickhouse-java/releases):移除了已弃用的方法、类和包
  - 新增 R2DBC 驱动程序和文件插入支持

### 控制台变更 {#console-changes-25}

- SQL 控制台新增对视图和物化视图的支持

### 性能和可靠性 {#performance-and-reliability-4}

- 为已停止/空闲实例提供更快的密码重置速度
- 通过更精确的活动跟踪优化了缩容行为
- 修复了 SQL 控制台 CSV 导出被截断的问题
- 修复了导致示例数据上传间歇性失败的问题


## 2023年1月12日 {#january-12-2023}

此版本将 ClickHouse 更新至 22.12 版本,为多个新数据源启用了字典功能,并提升了查询性能。

### 常规变更 {#general-changes-3}

- 为更多数据源启用了字典功能,包括外部 ClickHouse、Cassandra、MongoDB、MySQL、PostgreSQL 和 Redis

### ClickHouse 22.12 版本升级 {#clickhouse-2212-version-upgrade}

- 扩展了 JOIN 支持,新增 Grace Hash Join
- 新增对读取文件的二进制 JSON (BSON) 支持
- 新增对 GROUP BY ALL 标准 SQL 语法的支持
- 新增用于固定精度十进制运算的数学函数
- 完整变更列表请参阅 [22.12 版本博客](https://clickhouse.com/blog/clickhouse-release-22-12)和[详细的 22.12 变更日志](/whats-new/cloud#clickhouse-2212-version-upgrade)

### 控制台变更 {#console-changes-26}

- 改进了 SQL 控制台的自动补全功能
- 默认区域现在会考虑所在大陆的地理位置
- 改进了账单使用页面,可同时显示计费单位和网站单位

### 集成变更 {#integrations-changes-25}

- DBT 发布 [v1.3.2](https://github.com/ClickHouse/dbt-clickhouse/blob/main/CHANGELOG.md#release-132-2022-12-23)
  - 新增对 delete+insert 增量策略的实验性支持
  - 新增 s3source 宏
- Python 客户端 [v0.4.8](https://github.com/ClickHouse/clickhouse-connect/blob/main/CHANGELOG.md#048-2023-01-02)
  - 支持文件插入
  - 服务端查询[参数绑定](/interfaces/cli.md/#cli-queries-with-parameters)
- Go 客户端 [v2.5.0](https://github.com/ClickHouse/clickhouse-go/releases/tag/v2.5.0)
  - 降低了压缩的内存使用量
  - 服务端查询[参数绑定](/interfaces/cli.md/#cli-queries-with-parameters)

### 可靠性与性能 {#reliability-and-performance-2}

- 改进了从对象存储获取大量小文件的查询读取性能
- 对于新启动的服务,将 [compatibility](/operations/settings/settings#compatibility) 设置为服务初始启动时的版本

### 错误修复 {#bug-fixes-4}

使用高级扩展滑块预留资源现在会立即生效。


## 2022 年 12 月 20 日 {#december-20-2022}

此版本为管理员提供了 SQL 控制台的无缝登录功能,提升了冷读取性能,并改进了 ClickHouse Cloud 的 Metabase 连接器。

### 控制台变更 {#console-changes-27}

- 为管理员用户启用了 SQL 控制台的无缝访问
- 将新受邀用户的默认角色更改为"管理员"
- 新增了入门调查

### 可靠性和性能 {#reliability-and-performance-3}

- 为长时间运行的插入查询添加了重试逻辑,以便在网络故障时进行恢复
- 提升了冷读取的性能

### 集成变更 {#integrations-changes-26}

- [Metabase 插件](/integrations/data-visualization/metabase-and-clickhouse.md)迎来了期待已久的 v0.9.1 重大更新。现在它与最新版本的 Metabase 兼容,并已针对 ClickHouse Cloud 进行了全面测试。


## 2022年12月6日 - 正式发布 {#december-6-2022---general-availability}

ClickHouse Cloud 现已正式投入生产使用,通过了 SOC2 Type II 合规认证,为生产工作负载提供正常运行时间 SLA,并提供公开状态页面。此版本包含重要的新功能,如 AWS Marketplace 集成、SQL 控制台(ClickHouse 用户的数据探索工作台)以及 ClickHouse Academy(ClickHouse Cloud 中的自主学习平台)。在此[博客](https://clickhouse.com/blog/clickhouse-cloud-generally-available)中了解更多信息。

### 生产就绪 {#production-ready}

- SOC2 Type II 合规认证(详情请参阅[博客](https://clickhouse.com/blog/clickhouse-cloud-is-now-soc-2-type-ii-compliant)和[信任中心](https://trust.clickhouse.com/))
- ClickHouse Cloud 的公开[状态页面](https://status.clickhouse.com/)
- 为生产用例提供正常运行时间 SLA
- 在 [AWS Marketplace](https://aws.amazon.com/marketplace/pp/prodview-jettukeanwrfc) 上可用

### 主要新功能 {#major-new-capabilities}

- 推出 SQL 控制台,为 ClickHouse 用户提供数据探索工作台
- 推出 [ClickHouse Academy](https://learn.clickhouse.com/visitor_class_catalog),在 ClickHouse Cloud 中提供自主学习课程

### 定价和计量变更 {#pricing-and-metering-changes}

- 将试用期延长至 30 天
- 推出固定容量、低月度支出的开发服务,非常适合入门项目和开发/预发布环境
- 推出生产服务的新降价方案,我们将持续改进 ClickHouse Cloud 的运营和扩展方式
- 提高了计算资源计量的粒度和准确性

### 集成变更 {#integrations-changes-27}

- 启用对 ClickHouse Postgres / MySQL 集成引擎的支持
- 添加对 SQL 用户自定义函数 (UDF) 的支持
- 将 Kafka Connect sink 提升至 Beta 状态
- 通过引入有关版本、更新状态等丰富的元数据来改进集成 UI

### 控制台变更 {#console-changes-28}

- 云控制台中支持多因素身份验证
- 改进了移动设备上的云控制台导航

### 文档变更 {#documentation-changes}

- 为 ClickHouse Cloud 引入专门的[文档](/cloud/overview)部分

### 错误修复 {#bug-fixes-5}

- 解决了由于依赖项解析导致从备份恢复并非总能成功的已知问题


## 2022年11月29日 {#november-29-2022}

此版本实现了 SOC2 Type II 合规性,将 ClickHouse 版本更新至 22.11,并改进了多个 ClickHouse 客户端和集成。

### 常规变更 {#general-changes-4}

- 达到 SOC2 Type II 合规性(详情请参阅[博客](https://clickhouse.com/blog/clickhouse-cloud-is-now-soc-2-type-ii-compliant)和[信任中心](https://trust.clickhouse.com))

### 控制台变更 {#console-changes-29}

- 新增"空闲"状态指示器,用于显示服务已被自动暂停

### ClickHouse 22.11 版本升级 {#clickhouse-2211-version-upgrade}

- 新增对 Hudi 和 DeltaLake 表引擎及表函数的支持
- 改进了 S3 的递归目录遍历功能
- 新增对复合时间间隔语法的支持
- 通过插入重试机制提高了插入可靠性
- 查看[详细的 22.11 变更日志](/whats-new/cloud#clickhouse-2211-version-upgrade)以获取完整的变更列表

### 集成 {#integrations-1}

- Python 客户端:支持 v3.11,改进了插入性能
- Go 客户端:修复了 DateTime 和 Int64 支持
- JS 客户端:支持双向 SSL 认证
- dbt-clickhouse:支持 DBT v1.3

### 错误修复 {#bug-fixes-6}

- 修复了升级后显示过时 ClickHouse 版本的错误
- 更改 "default" 账户的授权不再中断会话
- 新创建的非管理员账户默认不再具有系统表访问权限

### 此版本中的已知问题 {#known-issues-in-this-release}

- 由于依赖项解析问题,从备份恢复可能无法正常工作


## 2022年11月17日 {#november-17-2022}

此版本支持从本地 ClickHouse 表和 HTTP 源创建字典,新增对孟买地区的支持,并改进了云控制台的用户体验。

### 常规变更 {#general-changes-5}

- 新增支持从本地 ClickHouse 表和 HTTP 源创建[字典](/sql-reference/dictionaries/index.md)
- 新增对孟买[地区](/cloud/reference/supported-regions)的支持

### 控制台变更 {#console-changes-30}

- 改进了账单发票格式
- 优化了支付方式录入的用户界面
- 为备份操作新增了更细粒度的活动日志记录
- 改进了文件上传时的错误处理

### 错误修复 {#bug-fixes-7}

- 修复了当某些数据分区中存在单个大文件时可能导致备份失败的问题
- 修复了在同时应用访问列表变更时从备份恢复失败的问题

### 已知问题 {#known-issues}

- 由于依赖项解析问题,从备份恢复功能可能无法正常工作


## 2022年11月3日 {#november-3-2022}

此版本从定价中移除了读写单元(详见[定价页面](https://clickhouse.com/pricing)),将 ClickHouse 版本更新至 22.10,为自助服务客户增加了更高的垂直扩展支持,并通过更优的默认配置提升了可靠性。

### 常规变更 {#general-changes-6}

- 从定价模型中移除了读写单元

### 配置变更 {#configuration-changes-2}

- 出于稳定性考虑,用户不再能够更改 `allow_suspicious_low_cardinality_types`、`allow_suspicious_fixed_string_types` 和 `allow_suspicious_codecs` 设置(默认值为 false)。

### 控制台变更 {#console-changes-31}

- 将付费客户的自助服务垂直扩展上限提升至 720GB 内存
- 改进了从备份恢复的工作流,可设置 IP 访问列表规则和密码
- 在服务创建对话框中引入了 GCP 和 Azure 的等候名单
- 改进了文件上传期间的错误处理
- 改进了计费管理工作流

### ClickHouse 22.10 版本升级 {#clickhouse-2210-version-upgrade}

- 通过在存在大量大分片(至少 10 GiB)时放宽"分片过多"阈值,改进了对象存储上的合并操作。这使得单个表的单个分区可支持高达 PB 级的数据。
- 通过 `min_age_to_force_merge_seconds` 设置改进了对合并的控制,可在达到特定时间阈值后进行合并。
- 添加了与 MySQL 兼容的语法来重置设置:`SET setting_name = DEFAULT`。
- 添加了 Morton 曲线编码、Java 整数哈希和随机数生成函数。
- 有关完整的变更列表,请参阅[详细的 22.10 更新日志](/whats-new/cloud#clickhouse-2210-version-upgrade)。


## 2022年10月25日 {#october-25-2022}

此版本显著降低了小型工作负载的计算资源消耗,降低了计算定价(详见[定价](https://clickhouse.com/pricing)页面),通过更优的默认配置提升了稳定性,并增强了 ClickHouse Cloud 控制台中的账单和用量视图。

### 常规变更 {#general-changes-7}

- 将最小服务内存分配降低至 24G
- 将服务空闲超时时间从 30 分钟缩短至 5 分钟

### 配置变更 {#configuration-changes-3}

- 将 max_parts_in_total 从 100k 降低至 10k。MergeTree 表的 `max_parts_in_total` 设置的默认值已从 100,000 降低至 10,000。此变更的原因是我们观察到大量数据分片可能会导致云服务启动时间变慢。大量分片通常表明选择了过于细粒度的分区键,这通常是无意中造成的,应当避免。默认值的调整将有助于更早地发现这些情况。

### 控制台变更 {#console-changes-32}

- 增强了试用用户在账单视图中的额度使用详情
- 改进了工具提示和帮助文本,并在用量视图中添加了指向定价页面的链接
- 改进了切换 IP 过滤选项时的工作流程
- 在云控制台中添加了重新发送确认邮件按钮


## 2022年10月4日 - Beta 版 {#october-4-2022---beta}

ClickHouse Cloud 于2022年10月4日开始公开 Beta 测试。了解更多信息,请参阅此[博客文章](https://clickhouse.com/blog/clickhouse-cloud-public-beta)。

ClickHouse Cloud 版本基于 ClickHouse 核心版本 v22.10。有关兼容功能列表,请参阅[云兼容性](/whats-new/cloud-compatibility)指南。
