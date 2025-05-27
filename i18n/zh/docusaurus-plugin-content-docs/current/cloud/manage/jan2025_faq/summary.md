---
'title': '概要'
'slug': '/cloud/manage/jan-2025-faq/summary'
'keywords':
- 'new tiers'
- 'packaging'
- 'pricing faq'
- 'summary'
'description': '新 ClickHouse Cloud 层的摘要'
---

The following FAQ summarizes common questions with respect to new tiers introduced in ClickHouse Cloud starting in January 2025.

## What has changed with ClickHouse Cloud tiers? {#what-has-changed-with-clickhouse-cloud-tiers}

在 ClickHouse，我们致力于根据客户不断变化的需求调整我们的产品。自两年前在 GA 中推出以来，ClickHouse Cloud 已经发生了重大变化，我们获得了关于客户如何利用我们云服务的宝贵洞察。

我们正在引入新功能，以优化 ClickHouse Cloud 服务在您的工作负载中的规模和成本效益。这些包括计算-计算分离、高性能机器类型和单副本服务。我们还在完善自动扩展和托管升级的功能，以便以更加无缝和灵活的方式执行。

我们增加了一个新的企业级（Enterprise）套餐，以满足最苛刻的客户和工作负载的需求，重点关注行业特定的安全性和合规性功能，对底层硬件和升级的更大控制，以及先进的灾难恢复功能。

您可以在这篇 [博客](https://clickhouse.com/blog/evolution-of-clickhouse-cloud-new-features-superior-performance-tailored-offerings) 中阅读这些和其他功能变化的详细信息。

## What action is required? {#what-action-is-required}

为了支持这些变化，我们正在重组现有套餐，以更紧密地匹配我们不断发展的客户群体对服务的使用，因此您需要采取行动以选择一个新计划。

下面描述了进行这些选择的细节和时间表。

## How are tiers changing? {#how-are-tiers-changing}

我们正在从一个根据“服务类型”纯粹组织付费套餐的模型转变，该服务类型由容量和功能划分（即，开发、生产和专用套餐）到一个根据功能可用性组织付费套餐的模型。这些新套餐被称为基础（Basic）、扩展（Scale）和企业（Enterprise），其详细信息如下。

这一变化带来了几个关键好处：

* **一致的功能访问**：某个套餐中存在的功能将在该套餐中的所有服务规模中可用，也将在所有更高级的套餐中可用。例如，之前仅可用于生产服务类型的私有网络，现在将从扩展套餐开始适用于所有服务，因此您可以根据需要将其部署在适合开发和生产工作负载的服务上。

* **组织级特性**：我们现在可以提供基于组织级别构建的功能，确保客户在适当的套餐中获得所需的工具。例如，进入 SSO（单点登录）和 CMEK（客户管理的加密密钥）将只能在企业级套餐中可用。

* **优化的支持计划**：新的包装结构还使我们能够将支持响应时间与付费套餐对齐，更有效地满足我们多样化客户群体的需求。例如，我们现在向企业级套餐的客户提供专属支持工程师。

以下是新套餐的概述，描述它们与用例的关系，并概述关键功能。

**Basic: A taste of ClickHouse**

* 基础套餐旨在为具有较小数据量和不太苛刻工作负载的组织提供一个预算友好的选项。它允许您运行单副本部署，内存最多为 12GB，存储小于 1TB，特别适合不需要可靠性保证的小规模用例。

**Scale: Enhanced SLAs and scalability**

* 扩展套餐适合需要增强 SLA、较高可扩展性和高级安全措施的工作负载。
* 它提供无限的计算和存储，支持任何复制因子，访问计算-计算分离，并支持自动垂直和水平扩展。
* 关键特性包括：
  * 支持私有网络、自定义备份控制、多因素认证等
  * 计算-计算分离，以优化资源使用
  * 灵活的扩展选项（垂直和水平）以满足不断变化的需求

**Enterprise: Mission-critical deployments**

* 企业级套餐是运行大规模、关键任务 ClickHouse 部署的最佳选择。
* 它最适合具有严格安全和合规性需求的组织，需要最高水平的性能和可靠性。
* 关键特性包括：
  * 行业特定的合规性认证，例如 HIPAA
  * 自助访问 SSO（单点登录）和 CMEK（客户管理的加密密钥）
  * 计划中的升级以确保最小干扰
  * 支持自定义配置，包括高内存、高 CPU 选项以及私有区域

新套餐的详细描述请见我们的 [网站](https://clickhouse.com/pricing)。

## How is pricing changing? {#how-is-pricing-changing}

除了改进我们的付费套餐外，我们还对整体定价结构和定价点进行以下调整：

* **存储**：每 TB 存储价格将降低，并且不再将备份捆绑到存储成本中。
* **备份**：备份将单独收费，仅需一个备份。
* **计算**：计算成本将增加，因套餐和地区而异。这一增长可能会通过引入计算-计算分离和单副本服务来平衡，这允许您通过根据不同的工作负载类型部署和合理调整服务来优化计算使用。
* **数据传输**：我们将对数据出站引入费用，特别是针对互联网和跨区域的数据传输。根据我们的分析，大多数客户不会因这个新维度而看到他们的每月账单有显著增加。
* **ClickPipes**：我们的管理数据摄取服务在试用期内是免费的，现在将根据计算和摄取数据收费。根据我们的分析，大多数客户不会因这个新维度而看到他们的每月账单有显著增加。

## When will these changes take effect? {#when-will-these-changes-take-effect}

虽然对新客户的变化立即生效，但现有客户将在 6 个月到一年之间过渡到新计划。

有效日期的详细分解如下：

* **新客户**：新的套餐将于 **2025 年 1 月 27 日** 对 ClickHouse Cloud 的新客户生效。
* **现有按需付费（PAYG）客户**：按需付费（PAYG）客户将有 6 个月时间，直到 **2025 年 7 月 23 日** 迁移到新计划。
* **现有承诺消费客户**：与承诺消费协议的客户可以在现有合同结束时重新协商条款。
* 数据传输和 ClickPipes 的 **新使用维度** 适用于 PAYG 和承诺消费客户，并在本公告后 8 周于 **2025 年 3 月 24 日** 生效。

## What actions should you take? {#what-actions-should-you-take}

如果您是 **按需付费（PAYG）客户**，您可以通过 ClickHouse Cloud 控制台中提供的自助服务选项来迁移到新计划。

如果您是 **承诺消费客户**，请与您的客户代表联系，讨论您的自定义迁移计划和时间表。

**Need assistance?**
我们在此支持您顺利过渡。如果您有任何问题或需要个性化帮助，请联系您的客户代表或与我们的支持团队联系。
