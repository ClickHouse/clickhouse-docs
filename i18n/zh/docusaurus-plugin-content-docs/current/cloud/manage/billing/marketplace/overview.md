---
'slug': '/cloud/marketplace/marketplace-billing'
'title': '市场计费'
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

您可以通过 AWS、GCP 和 Azure 市场订阅 ClickHouse Cloud。这使您可以通过现有的云服务提供商账单支付 ClickHouse Cloud。

您可以选择按需支付（PAYG）或通过市场与 ClickHouse Cloud 签订合同。账单将由云服务提供商处理，您将收到一份有关所有云服务的单一发票。

- [AWS 市场 PAYG](/cloud/billing/marketplace/aws-marketplace-payg)
- [AWS 市场承诺合同](/cloud/billing/marketplace/aws-marketplace-committed-contract)
- [GCP 市场 PAYG](/cloud/billing/marketplace/gcp-marketplace-payg)
- [GCP 市场承诺合同](/cloud/billing/marketplace/gcp-marketplace-committed-contract)
- [Azure 市场 PAYG](/cloud/billing/marketplace/azure-marketplace-payg)
- [Azure 市场承诺合同](/cloud/billing/marketplace/azure-marketplace-committed-contract)

## 常见问题 {#faqs}

### 我如何验证我的组织是否已连接到市场账单？​ {#how-can-i-verify-that-my-organization-is-connected-to-marketplace-billing}

在 ClickHouse Cloud 控制台中，导航到 **账单**。在 **付款详情** 部分，您应该能看到市场名称和链接。

### 我是现有的 ClickHouse Cloud 用户。当我通过 AWS / GCP / Azure 市场订阅 ClickHouse Cloud 时会发生什么？​ {#i-am-an-existing-clickhouse-cloud-user-what-happens-when-i-subscribe-to-clickhouse-cloud-via-aws--gcp--azure-marketplace}

从云服务提供商市场注册 ClickHouse Cloud 是一个两步过程：
1. 您首先在云服务提供商的市场门户中“订阅” ClickHouse Cloud。完成订阅后，您点击“立即支付”或“在提供商处管理”（具体取决于市场）。这将重定向您到 ClickHouse Cloud。
2. 在 ClickHouse Cloud 上，您可以注册一个新帐户或使用现有帐户登录。无论哪种方式，都会为您创建一个新的 ClickHouse Cloud 组织，它与您的市场账单相关联。

注意：您之前任何 ClickHouse Cloud 注册的现有服务和组织将保持不变，并且它们不会与市场账单连接。ClickHouse Cloud 允许您使用同一帐户管理多个组织，每个组织都有不同的账单。

您可以通过 点击 House Cloud 控制台左下角的菜单在组织之间切换。

### 我是现有的 ClickHouse Cloud 用户。如果我希望我的现有服务通过市场收费，我该怎么办？​ {#i-am-an-existing-clickhouse-cloud-user-what-should-i-do-if-i-want-my-existing-services-to-be-billed-via-marketplace}

您需要通过云服务提供商市场订阅 ClickHouse Cloud。完成市场上的订阅后，重定向到 ClickHouse Cloud，您将有选择将现有的 ClickHouse Cloud 组织链接到市场账单的选项。从那时起，您的现有资源将通过市场收费。

<Image img={marketplace_signup_and_org_linking} size='md' alt='Marketplace signup and org linking' border/>

您可以从组织的账单页面确认账单确实已链接到市场。如果您遇到任何问题，请联系 [ClickHouse Cloud 支持](https://clickhouse.com/support/program)。

:::note
您之前任何 ClickHouse Cloud 注册的现有服务和组织将保持不变，并且不会与市场账单连接。
:::

### 我作为市场用户订阅了 ClickHouse Cloud。我如何取消订阅？​ {#i-subscribed-to-clickhouse-cloud-as-a-marketplace-user-how-can-i-unsubscribe}

请注意，您可以简单地停止使用 ClickHouse Cloud 并删除所有现有的 ClickHouse Cloud 服务。尽管订阅仍然有效，但您将不再支付任何费用，因为 ClickHouse Cloud 没有任何经常性费用。

如果您想取消订阅，请导航到云服务提供商控制台并取消订阅续订。一旦订阅结束，所有现有服务将停止，您将被提示添加信用卡。如果没有添加信用卡，在两周后，所有现有服务将被删除。

### 我作为市场用户订阅了 ClickHouse Cloud，然后取消了订阅。现在我想再次订阅，流程是什么？​ {#i-subscribed-to-clickhouse-cloud-as-a-marketplace-user-and-then-unsubscribed-now-i-want-to-subscribe-back-what-is-the-process}

在这种情况下，请像往常一样订阅 ClickHouse Cloud（参见通过市场订阅 ClickHouse Cloud 的部分）。

- 对于 AWS 市场，将创建一个新的 ClickHouse Cloud 组织并与市场连接。
- 对于 GCP 市场，您的旧组织将重新激活。

如果您在重新激活市场组织时遇到任何问题，请联系 [ClickHouse Cloud 支持](https://clickhouse.com/support/program)。

### 我如何访问我的 ClickHouse Cloud 服务的市场订阅发票？​ {#how-do-i-access-my-invoice-for-my-marketplace-subscription-to-the-clickhouse-cloud-service}

- [AWS 账单控制台](https://us-east-1.console.aws.amazon.com/billing/home)
- [GCP 市场订单](https://console.cloud.google.com/marketplace/orders)（选择您用于订阅的账单帐户）

### 为什么使用情况报表上的日期与我的市场发票不匹配？​ {#why-do-the-dates-on-the-usage-statements-not-match-my-marketplace-invoice}

市场账单遵循日历月周期。例如，对于 12 月 1 日至 1 月 1 日之间的使用情况，将在 1 月 3 日至 1 月 5 日之间生成发票。

ClickHouse Cloud 使用情况报表遵循不同的账单周期，在注册日起的 30 天内对使用情况进行计量和报告。

如果这些日期不相同，则使用情况和发票日期会有所不同。由于使用情况报表按天跟踪某项服务的使用情况，用户可以依赖这些报表查看费用的详细细分。

### 我可以在哪里找到一般的账单信息​？ {#where-can-i-find-general-billing-information}

请参阅 [账单概述页面](/cloud/manage/billing)。

### 通过云服务提供商市场支付和直接向 ClickHouse 支付的 ClickHouse Cloud 价格有什么区别吗？ {#is-there-a-difference-in-clickhouse-cloud-pricing-whether-paying-through-the-cloud-provider-marketplace-or-directly-to-clickhouse}

市场账单和直接与 ClickHouse 注册之间的价格没有区别。在这两种情况下，您对 ClickHouse Cloud 的使用情况都是以 ClickHouse Cloud 积分（CHC）进行跟踪的，这些积分的计量方式是相同的，并相应地计费。

### 我可以设置多个 ClickHouse 组织，以便将账单发送到单个云市场账单帐户或子帐户（AWS、GCP 或 Azure）吗？ {#multiple-organizations-to-bill-to-single-cloud-marketplace-account}

单个 ClickHouse 组织只能配置为将账单发送到单个云市场账单帐户或子帐户。

### 如果我的 ClickHouse 组织是通过云市场承诺支出协议收费，当我的信用耗尽时，是否会自动转换为 PAYG 账单？ {#automatically-move-to-PAYG-when-running-out-of-credit}

如果您的市场承诺支出合同处于活动状态并且您的信用耗尽，我们将自动将您的组织转换为 PAYG 账单。然而，当您现有的合同到期时，您将需要将新的市场合同链接到您的组织，或者将您的组织移至通过信用卡直接收费。
