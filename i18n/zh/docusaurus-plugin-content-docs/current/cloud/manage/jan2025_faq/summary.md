---
'title': '总结'
'slug': '/cloud/manage/jan-2025-faq/summary'
'keywords':
- 'new tiers'
- 'packaging'
- 'pricing faq'
- 'summary'
'description': '新 ClickHouse Cloud 级别的总结'
---

以下常见问题解答总结了有关ClickHouse Cloud于2025年1月引入的新层级的常见问题。

## ClickHouse Cloud层级有哪些变化？ {#what-has-changed-with-clickhouse-cloud-tiers}

在ClickHouse，我们致力于调整我们的产品，以满足客户不断变化的需求。自两年前正式推出以来，ClickHouse Cloud经历了显著的演变，我们获得了宝贵的见解，了解客户如何利用我们的云服务。

我们正在引入新功能，以优化ClickHouse Cloud服务在工作负载方面的规模和成本效率。这些功能包括计算-计算分离、高性能机器类型和单副本服务。我们还在自动扩展和托管升级方面进行改进，使其以更无缝和响应迅速的方式执行。

我们正在新增一个企业级别，以满足最具挑战性的客户和工作负载的需求，重点关注行业特定的安全和合规功能，对基础硬件和升级有更多控制，以及先进的灾难恢复功能。

您可以在这个[博客](https://clickhouse.com/blog/evolution-of-clickhouse-cloud-new-features-superior-performance-tailored-offerings)中阅读这些以及其他功能变化。

## 需要采取什么措施？ {#what-action-is-required}

为了支持这些变化，我们正在重组当前层级，以更准确匹配我们的不断发展的客户基础对我们产品的使用，您需要采取行动来选择新计划。

选择的详细信息和时间表如下。

## 层级有什么变化？ {#how-are-tiers-changing}

我们正在从一个将付费层级仅按“服务类型”组织的模型转变，该模型根据容量和特性区分（即开发、生产和专用层级）到一个按功能可用性组织的付费层级。这些新层级称为基础、规模和企业，下面将详细描述。

这一变化带来了几个关键好处：

* **一致的功能访问**：某一层级中的功能将在该层级的所有服务规模中可用，并且在其上所有层级中均可用。例如，私有网络以前仅对生产服务类型可用，现在从规模层级开始，所有服务都可以访问，因此您可以根据需要为开发和生产工作负载部署此功能。

* **组织级功能**：我们现在可以在适当的计划下提供在组织级别建立的功能，确保客户在合适的服务级别获得所需工具。例如，SSO（单一登录）和CMEK（客户管理加密密钥）的访问权限将仅在企业层级可用。

* **优化的支持计划**：新的包装结构还允许我们将支持响应时间与付费层级对齐，更有效地满足我们多样化客户基础的需求。例如，我们现在为企业层级客户提供指定支持工程师。

以下是新层级的概述，描述它们如何与使用案例相关，并列出关键功能。

**基础：ClickHouse的初步体验**

* 基础层级旨在为数据量较小和工作负载要求较低的组织提供预算友好的选项。它允许您运行单副本部署，具备最多12GB内存和少于1TB存储，非常适合不需要可靠性保证的小规模用例。

**规模：增强的服务等级协议和可扩展性**

* 规模层级适用于需要增强服务等级协议、更大可扩展性和高级安全措施的工作负载。
* 它提供无限计算和存储，伴随任何复制因子，访问计算-计算分离，以及自动垂直和水平扩展。
* 关键功能包括：
  * 对私有网络、自定义备份控制、多因素身份验证等的支持
  * 优化资源使用的计算-计算分离
  * 灵活的扩展选项（包括垂直和水平）以满足变化的需求

**企业：关键任务部署**

* 企业级别是运行大规模、关键任务的ClickHouse部署的最佳选择。
* 它最适合对安全和合规性需求严格的组织，要求最高水平的性能和可靠性。
* 关键功能包括：
  * 行业特定的合规认证，如HIPAA
  * 自助访问SSO（单一登录）和CMEK（客户管理加密密钥）
  * 定期升级以确保最小干扰
  * 支持自定义配置，包括高内存、高CPU选项和私有区域

新层级的详细介绍可在我们的[官网](https://clickhouse.com/pricing)上找到。

## 定价将如何变化？ {#how-is-pricing-changing}

除了发展我们的付费层级外，我们还对整体定价结构和价格点进行了以下调整：

* **存储**：存储每TB的价格将降低，且存储费用中将不再包含备份。
* **备份**：备份将单独收费，仅为一个备份为强制性。
* **计算**：计算成本将增加，视层级和地区而异。这一增加可能会因为计算-计算分离和单副本服务的引入而得到平衡，这些服务允许您通过根据不同工作负载类型部署和合理配置服务来优化计算使用。
* **数据传输**：我们将对数据出带进行收费，特别是针对互联网和跨地区的数据传输。根据我们的分析，大多数客户不会因为这个新维度而看到其月账单有实质性增加。
* **ClickPipes**：我们的托管摄取服务在介绍期内是免费的，现在将根据计算和摄取的数据收取费用。根据我们的分析，大多数客户不会因为这个新维度而看到其月账单有实质性增加。

## 这些变化何时生效？ {#when-will-these-changes-take-effect}

尽管对于新客户，这些变化会立即生效，但现有客户将拥有6个月到一年的时间来过渡到新计划。

生效日期的详细分解如下：

* **新客户**：对于ClickHouse Cloud的新客户，新计划将于**2025年1月27日**生效。
* **现有的按需付费客户**：按需付费（PAYG）客户将有6个月的时间，直到**2025年7月23日**，以迁移到新计划。
* **现有的承诺消费客户**：拥有承诺消费协议的客户可以在当前合同结束时重新协商条款。
* **数据传输和ClickPipes的新使用维度**将于**2025年3月24日**，在此次公告后8周内同时对PAYG和承诺消费客户生效。

## 您应该采取什么行动？ {#what-actions-should-you-take}

如果您是**按需付费（PAYG）客户**，可以通过ClickHouse Cloud控制台中提供的自助选项迁移到新计划。

如果您是**承诺消费客户**，请联系您的客户代表讨论您的自定义迁移计划和时间表。

**需要帮助吗？**
我们在这次过渡中为您提供支持。如果您有任何问题或需要个性化帮助，请联系您的客户代表或联系我们的支持团队。
