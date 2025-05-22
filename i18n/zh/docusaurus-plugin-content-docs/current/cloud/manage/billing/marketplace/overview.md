---
'slug': '/cloud/marketplace/marketplace-billing'
'title': '市场账单'
'description': '通过 AWS、GCP 和 Azure 市场订阅 ClickHouse Cloud。'
'keywords':
- 'aws'
- 'azure'
- 'gcp'
- 'google cloud'
- 'marketplace'
- 'billing'
---

import Image from '@theme/IdealImage';
import marketplace_signup_and_org_linking from '@site/static/images/cloud/manage/billing/marketplace/marketplace_signup_and_org_linking.png'

您可以通过 AWS、GCP 和 Azure 市场订阅 ClickHouse Cloud。这使您可以通过现有的云提供商账单支付 ClickHouse Cloud。

您可以选择按需付费 (PAYG)，或者通过市场与 ClickHouse Cloud 签署合同。账单将由云提供商处理，您将收到所有云服务的一张统一发票。

- [AWS 市场按需付费](/cloud/billing/marketplace/aws-marketplace-payg)
- [AWS 市场承诺合同](/cloud/billing/marketplace/aws-marketplace-committed-contract)
- [GCP 市场按需付费](/cloud/billing/marketplace/gcp-marketplace-payg)
- [GCP 市场承诺合同](/cloud/billing/marketplace/gcp-marketplace-committed-contract)
- [Azure 市场按需付费](/cloud/billing/marketplace/azure-marketplace-payg)
- [Azure 市场承诺合同](/cloud/billing/marketplace/azure-marketplace-committed-contract)

## 常见问题 {#faqs}

### 我如何验证我的组织是否连接到市场账单？​ {#how-can-i-verify-that-my-organization-is-connected-to-marketplace-billing}

在 ClickHouse Cloud 控制台中，导航至 **Billing**。您应该在 **Payment details** 部分看到市场名称和链接。

### 我是现有的 ClickHouse Cloud 用户。当我通过 AWS / GCP / Azure 市场订阅 ClickHouse Cloud 时会发生什么？​ {#i-am-an-existing-clickhouse-cloud-user-what-happens-when-i-subscribe-to-clickhouse-cloud-via-aws--gcp--azure-marketplace}

从云提供商市场注册 ClickHouse Cloud 是一个两步的过程：
1. 您首先在云提供商的市场门户上 “订阅” ClickHouse Cloud。在您完成订阅后，点击 “立即支付” 或 “在提供商上管理”（取决于市场）。这将重定向您到 ClickHouse Cloud。
2. 在 ClickHouse Cloud 上，您可以注册一个新帐户，或者用现有帐户登录。无论哪种方式，将为您创建一个新的 ClickHouse Cloud 组织，该组织与您的市场账单相关联。

注意：您以前的 ClickHouse Cloud 注册的所有服务和组织将保留且不会与市场账单连接。ClickHouse Cloud 允许您使用相同的帐户管理多个组织，每个组织具有不同的账单。

您可以从 ClickHouse Cloud 控制台的左下角菜单在组织之间切换。

### 我是现有的 ClickHouse Cloud 用户。如果我希望我的现有服务通过市场账单结算，我该怎么做？​ {#i-am-an-existing-clickhouse-cloud-user-what-should-i-do-if-i-want-my-existing-services-to-be-billed-via-marketplace}

您需要通过云提供商市场订阅 ClickHouse Cloud。完成市场上的订阅后，重定向到 ClickHouse Cloud，您将有机会将现有的 ClickHouse Cloud 组织与市场账单连接。从那时起，您的现有资源将通过市场结算。

<Image img={marketplace_signup_and_org_linking} size='md' alt='Marketplace signup and org linking' border/>

您可以在组织的账单页面确认账单确实现在与市场关联。 如果您遇到任何问题，请联系 [ClickHouse Cloud 支持](https://clickhouse.com/support/program)。

:::note
您以前的 ClickHouse Cloud 注册的所有服务和组织将保留且不与市场账单连接。
:::

### 我作为市场用户订阅了 ClickHouse Cloud。我如何取消订阅？​ {#i-subscribed-to-clickhouse-cloud-as-a-marketplace-user-how-can-i-unsubscribe}

请注意，您可以简单地停止使用 ClickHouse Cloud 并删除所有现有的 ClickHouse Cloud 服务。尽管订阅仍然处于活动状态，但您不会支付任何费用，因为 ClickHouse Cloud 没有任何经常性费用。

如果您想取消订阅，请导航到云提供商控制台并在那里取消订阅续订。一旦订阅结束，所有现有服务将被停止，您将被提示添加信用卡。如果没有添加卡，经过两周后，所有现有服务将被删除。

### 我作为市场用户订阅了 ClickHouse Cloud，然后取消了订阅。现在我想重新订阅，如何操作？​ {#i-subscribed-to-clickhouse-cloud-as-a-marketplace-user-and-then-unsubscribed-now-i-want-to-subscribe-back-what-is-the-process}

在这种情况下，请像往常一样订阅 ClickHouse Cloud（请参阅通过市场订阅 ClickHouse Cloud 的部分）。

- 对于 AWS 市场，将创建一个新的 ClickHouse Cloud 组织并与市场连接。
- 对于 GCP 市场，您的旧组织将被重新激活。

如果您在重新激活市场组织时遇到任何问题，请联系 [ClickHouse Cloud 支持](https://clickhouse.com/support/program)。

### 我如何访问 ClickHouse Cloud 服务市场订阅的发票？​ {#how-do-i-access-my-invoice-for-my-marketplace-subscription-to-the-clickhouse-cloud-service}

- [AWS 账单控制台](https://us-east-1.console.aws.amazon.com/billing/home)
- [GCP 市场订单](https://console.cloud.google.com/marketplace/orders)（选择您用于订阅的账单账户）

### 使用情况声明的日期为什么与我的市场发票不匹配？​ {#why-do-the-dates-on-the-usage-statements-not-match-my-marketplace-invoice}

市场账单遵循日历月周期。例如，对于 12 月 1 日到 1 月 1 日之间的使用情况，将在 1 月 3 日到 1 月 5 日之间生成发票。

ClickHouse Cloud 使用情况声明遵循不同的账单周期，其中使用情况在注册当天开始的 30 天内进行计量和报告。

如果这些日期不相同，使用情况和发票日期将不同。由于使用情况声明按天跟踪特定服务的使用情况，用户可以依靠声明查看成本的细分。

### 我可以在哪里找到一般账单信息​？ {#where-can-i-find-general-billing-information}

请参见 [账单概述页面](/cloud/manage/billing)。

### 通过云提供商市场支付与直接支付 ClickHouse，ClickHouse Cloud 的定价是否存在差异？ {#is-there-a-difference-in-clickhouse-cloud-pricing-whether-paying-through-the-cloud-provider-marketplace-or-directly-to-clickhouse}

市场账单和直接与 ClickHouse 注册之间的定价是没有差异的。在任何情况下，您的 ClickHouse Cloud 使用情况都以 ClickHouse Cloud Credits (CHCs) 计量，并以相同的方式计费。

### 我能否设置多个 ClickHouse 组织以计费到一个单一的云市场账单账户或子账户（AWS、GCP 或 Azure）？ {#multiple-organizations-to-bill-to-single-cloud-marketplace-account}

单个 ClickHouse 组织只能配置为向一个云市场账单账户或子账户收费。

### 如果我的 ClickHouse 组织通过云市场承诺支出协议计费，当我用完积分时，是否会自动转为按需付费计费？ {#automatically-move-to-PAYG-when-running-out-of-credit}

如果您的市场承诺支出合同处于活动状态并且您用完积分，我们将自动将您的组织转为按需付费计费。然而，当您现有的合同到期时，您需要将一个新的市场合同与您的组织关联，或者将您的组织转移到通过信用卡直接计费。
