---
'slug': '/cloud/marketplace/marketplace-billing'
'title': '市场计费'
'description': '通过 AWS、GCP 和 Azure 市场订阅 ClickHouse 云。'
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

您可以通过 AWS、GCP 和 Azure 市场订阅 ClickHouse Cloud。这允许您通过您现有的云提供商账单支付 ClickHouse Cloud。

您可以选择按需付费 (PAYG) 或通过市场与 ClickHouse Cloud 签订合同。账单将由云提供商处理，您将收到一张涵盖所有云服务的统一发票。

- [AWS 市场 PAYG](/cloud/billing/marketplace/aws-marketplace-payg)
- [AWS 市场承诺合同](/cloud/billing/marketplace/aws-marketplace-committed-contract)
- [GCP 市场 PAYG](/cloud/billing/marketplace/gcp-marketplace-payg)
- [GCP 市场承诺合同](/cloud/billing/marketplace/gcp-marketplace-committed-contract)
- [Azure 市场 PAYG](/cloud/billing/marketplace/azure-marketplace-payg)
- [Azure 市场承诺合同](/cloud/billing/marketplace/azure-marketplace-committed-contract)

## 常见问题 {#faqs}

### 如何验证我的组织是否已连接到市场计费？​ {#how-can-i-verify-that-my-organization-is-connected-to-marketplace-billing}

在 ClickHouse Cloud 控制台中，导航到 **计费**。您应该在 **支付详情** 部分看到市场的名称和链接。

### 我是现有的 ClickHouse Cloud 用户。当我通过 AWS / GCP / Azure 市场订阅 ClickHouse Cloud 时会发生什么？​ {#i-am-an-existing-clickhouse-cloud-user-what-happens-when-i-subscribe-to-clickhouse-cloud-via-aws--gcp--azure-marketplace}

从云提供商市场注册 ClickHouse Cloud 是一个两步过程：
1. 您首先在云提供商的市场门户上“订阅” ClickHouse Cloud。完成订阅后，您点击“立即付款”或“在提供商处管理”（具体取决于市场）。这会将您重定向到 ClickHouse Cloud。
2. 在 ClickHouse Cloud 上，您可以选择注册一个新帐户，或使用现有帐户登录。无论哪种方式，将为您创建一个新的 ClickHouse Cloud 组织，该组织与您的市场计费相关联。

注意：您之前在任何 ClickHouse Cloud 注册中现有的服务和组织将保持不变，并且它们不会与市场计费连接。 ClickHouse Cloud 允许您使用同一帐户管理多个组织，每个组织有不同的计费。

您可以从 ClickHouse Cloud 控制台的左下菜单切换组织。

### 我是现有的 ClickHouse Cloud 用户。如果我希望我的现有服务通过市场计费，我该怎么办？​ {#i-am-an-existing-clickhouse-cloud-user-what-should-i-do-if-i-want-my-existing-services-to-be-billed-via-marketplace}

您需要通过云提供商市场订阅 ClickHouse Cloud。一旦您在市场上完成订阅，并重定向到 ClickHouse Cloud，您将有机会将现有的 ClickHouse Cloud 组织与市场计费关联。从那时起，您的现有资源将通过市场计费。

<Image img={marketplace_signup_and_org_linking} size='md' alt='市场注册与组织关联' border/>

您可以从组织的计费页面确认计费确实已连接到市场。如果您遇到任何问题，请联系 [ClickHouse Cloud 支持](https://clickhouse.com/support/program)。

:::note
您之前在任何 ClickHouse Cloud 注册中现有的服务和组织将保持不变，并且不会与市场计费连接。
:::

### 我作为市场用户订阅了 ClickHouse Cloud。如何取消订阅？​ {#i-subscribed-to-clickhouse-cloud-as-a-marketplace-user-how-can-i-unsubscribe}

请注意，您可以简单地停止使用 ClickHouse Cloud 并删除所有现有的 ClickHouse Cloud 服务。尽管订阅仍然有效，但您将不会支付任何费用，因为 ClickHouse Cloud 没有周期性费用。

如果您想取消订阅，请导航到云提供商控制台并在那里取消订阅续订。一旦订阅结束，所有现有服务将停止，您将被提示添加信用卡。如果没有添加信用卡，在两周后所有现有服务将被删除。

### 我作为市场用户订阅了 ClickHouse Cloud，然后取消了订阅。现在我想重新订阅，流程是什么？​ {#i-subscribed-to-clickhouse-cloud-as-a-marketplace-user-and-then-unsubscribed-now-i-want-to-subscribe-back-what-is-the-process}

在这种情况下，请照常订阅 ClickHouse Cloud（见于通过市场订阅 ClickHouse Cloud 的部分）。

- 对于 AWS 市场，将创建一个新的 ClickHouse Cloud 组织并连接到市场。
- 对于 GCP 市场，您的旧组织将被重新激活。

如果您在重新激活市场组织时遇到任何困难，请联系 [ClickHouse Cloud 支持](https://clickhouse.com/support/program)。

### 如何访问我对 ClickHouse Cloud 服务的市场订阅发票？​ {#how-do-i-access-my-invoice-for-my-marketplace-subscription-to-the-clickhouse-cloud-service}

- [AWS 账单控制台](https://us-east-1.console.aws.amazon.com/billing/home)
- [GCP 市场订单](https://console.cloud.google.com/marketplace/orders)（选择您用于订阅的账单账户）

### 使用声明上的日期为何与我的市场发票不匹配？​ {#why-do-the-dates-on-the-usage-statements-not-match-my-marketplace-invoice}

市场计费遵循日历月份周期。例如，对于 12 月 1 日到 1 月 1 日之间的使用情况，将于 1 月 3 日到 1 月 5 日之间生成发票。

ClickHouse Cloud 使用声明遵循不同的计费周期，其中使用情况在注册当天起的 30 天内进行计量和报告。

如果这些日期不同，则使用和发票日期会有所差异。由于使用声明按天追踪给定服务的使用，用户可以依赖声明来查看费用的细目。

### 我在哪里可以找到一般的计费信息？​ {#where-can-i-find-general-billing-information}

请参阅 [计费概述页面](/cloud/manage/billing)。

### 通过云提供商市场支付与直接向 ClickHouse 支付之间的 ClickHouse Cloud 价格有什么区别吗？ {#is-there-a-difference-in-clickhouse-cloud-pricing-whether-paying-through-the-cloud-provider-marketplace-or-directly-to-clickhouse}

市场计费和直接与 ClickHouse 注册之间的定价没有区别。在任何情况下，您对 ClickHouse Cloud 的使用都会以 ClickHouse Cloud 积分 (CHCs) 的形式进行追踪，这些积分的计量方式与计费相同。

### 我可以设置多个 ClickHouse 组织将账单关联到一个云市场账单账户或子账户 (AWS、GCP 或 Azure) 吗？ {#multiple-organizations-to-bill-to-single-cloud-marketplace-account}

单个 ClickHouse 组织只能配置为与单个云市场账单账户或子账户进行计费。

### 如果我的 ClickHouse 组织通过云市场承诺支出协议进行计费，当我用完积分时，是否会自动转到 PAYG 计费？ {#automatically-move-to-PAYG-when-running-out-of-credit}

如果您的市场承诺支出合同有效，且您用完了积分，则我们将自动将您的组织转到 PAYG 计费。但是，当您现有的合同到期时，您将需要将新的市场合同链接到您的组织，或通过信用卡将您的组织转为直接计费。
