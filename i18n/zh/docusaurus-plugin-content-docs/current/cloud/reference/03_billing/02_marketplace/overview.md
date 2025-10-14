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
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import marketplace_signup_and_org_linking from '@site/static/images/cloud/manage/billing/marketplace/marketplace_signup_and_org_linking.png'

您可以通过 AWS、GCP 和 Azure 市场订阅 ClickHouse Cloud。这使您可以通过现有的云服务提供商账单为 ClickHouse Cloud 付款。

您可以选择按需支付（PAYG）或通过市场与 ClickHouse Cloud 签订合同。账单将由云服务提供商处理，您将获得所有云服务的单一发票。

- [AWS Marketplace 按需支付](/cloud/billing/marketplace/aws-marketplace-payg)
- [AWS Marketplace 合同签订](/cloud/billing/marketplace/aws-marketplace-committed-contract)
- [GCP Marketplace 按需支付](/cloud/billing/marketplace/gcp-marketplace-payg)
- [GCP Marketplace 合同签订](/cloud/billing/marketplace/gcp-marketplace-committed-contract)
- [Azure Marketplace 按需支付](/cloud/billing/marketplace/azure-marketplace-payg)
- [Azure Marketplace 合同签订](/cloud/billing/marketplace/azure-marketplace-committed-contract)

## 常见问题 {#faqs}

### 我如何验证我的组织是否已连接到市场账单？​ {#how-can-i-verify-that-my-organization-is-connected-to-marketplace-billing}

在 ClickHouse Cloud 控制台中，导航到 **账单**。您应该在 **支付详情** 部分看到市场的名称和链接。

### 我是现有的 ClickHouse Cloud 用户。如果我通过 AWS / GCP / Azure 市场订阅 ClickHouse Cloud，会发生什么？​ {#i-am-an-existing-clickhouse-cloud-user-what-happens-when-i-subscribe-to-clickhouse-cloud-via-aws--gcp--azure-marketplace}

从云服务提供商市场注册 ClickHouse Cloud 是一个两步过程：
1. 您首先在云服务提供商的市场门户中“订阅” ClickHouse Cloud。完成订阅后，您点击“立即支付”或“在提供商上管理”（具体取决于市场）。这会将您重定向到 ClickHouse Cloud。
2. 在 ClickHouse Cloud 上，您可以注册新账户或使用现有账户登录。不管哪种方式，都会为您创建一个新的 ClickHouse Cloud 组织，该组织与您的市场账单相联系。

注意：您之前 ClickHouse Cloud 注册的现有服务和组织将保持存在，但它们不会与市场账单连接。ClickHouse Cloud 允许您使用同一账户管理多个组织，每个组织具有不同的账单。

您可以通过 ClickHouse Cloud 控制台左下角的菜单在组织之间切换。

### 我是现有的 ClickHouse Cloud 用户。如果我希望现有服务通过市场计费，我该怎么做？​ {#i-am-an-existing-clickhouse-cloud-user-what-should-i-do-if-i-want-my-existing-services-to-be-billed-via-marketplace}

您需要通过云服务提供商市场订阅 ClickHouse Cloud。完成市场的订阅后，重定向到 ClickHouse Cloud，您将有机会将现有的 ClickHouse Cloud 组织链接到市场账单。从那时起，您的现有资源将通过市场进行计费。

<Image img={marketplace_signup_and_org_linking} size='md' alt='市场注册和组织链接' border/>

您可以通过组织的账单页面确认计费现在确实已链接到市场。如果遇到任何问题，请联系 [ClickHouse Cloud 支持](https://clickhouse.com/support/program)。

:::note
您之前 ClickHouse Cloud 注册的现有服务和组织将保持存在，并且不会与市场账单连接。
:::

### 我作为市场用户订阅了 ClickHouse Cloud。如何取消订阅？​ {#i-subscribed-to-clickhouse-cloud-as-a-marketplace-user-how-can-i-unsubscribe}

请注意，您可以简单地停止使用 ClickHouse Cloud，并删除所有现有 ClickHouse Cloud 服务。尽管订阅仍然有效，但您将不会支付任何费用，因为 ClickHouse Cloud 没有任何定期费用。

如果要取消订阅，请导航到云服务提供商控制台并在那里取消订阅续订。一旦订阅结束，所有现有服务将停止，并且您将被提示添加信用卡。如果没有添加卡，两个星期后所有现有服务将被删除。

### 我作为市场用户订阅了 ClickHouse Cloud，然后取消了订阅。现在我想重新订阅，流程是什么？​ {#i-subscribed-to-clickhouse-cloud-as-a-marketplace-user-and-then-unsubscribed-now-i-want-to-subscribe-back-what-is-the-process}

在这种情况下，请像往常一样订阅 ClickHouse Cloud（请参阅通过市场订阅 ClickHouse Cloud 的部分）。

- 对于 AWS 市场，将创建一个新的 ClickHouse Cloud 组织并连接到市场。
- 对于 GCP 市场，您的旧组织将被重新激活。

如果您在重新激活市场组织时遇到任何问题，请联系 [ClickHouse Cloud 支持](https://clickhouse.com/support/program)。

### 我如何访问我对 ClickHouse Cloud 服务的市场订阅的发票？​ {#how-do-i-access-my-invoice-for-my-marketplace-subscription-to-the-clickhouse-cloud-service}

- [AWS 账单控制台](https://us-east-1.console.aws.amazon.com/billing/home)
- [GCP 市场订单](https://console.cloud.google.com/marketplace/orders)（选择您用于订阅的账单账户）

### 使用状态报表上的日期为何与我的市场发票不符？​ {#why-do-the-dates-on-the-usage-statements-not-match-my-marketplace-invoice}

市场账单遵循日历月周期。例如，对于 12 月 1 日至 1 月 1 日之间的使用，将于 1 月 3 日至 1 月 5 日之间生成发票。

ClickHouse Cloud 使用报表遵循不同的计费周期，其中使用情况是从注册之日起的 30 天内计量和报告的。

如果这些日期不相同，使用和发票日期会有所不同。由于使用状态按天跟踪特定服务的使用，用户可以依赖状态查看费用明细。

### 我在哪里可以找到一般账单信息？​ {#where-can-i-find-general-billing-information}

请参阅 [账单概述页面](/cloud/manage/billing)。

### 通过云服务提供商市场付款和直接向 ClickHouse 付款在 ClickHouse Cloud 定价上有什么区别吗？ {#is-there-a-difference-in-clickhouse-cloud-pricing-whether-paying-through-the-cloud-provider-marketplace-or-directly-to-clickhouse}

市场账单和直接与 ClickHouse 注册之间的定价没有区别。在这两种情况下，您对 ClickHouse Cloud 的使用以 ClickHouse Cloud 积分（CHCs）跟踪，使用方式和计费方式相同。

### 我可以设置多个 ClickHouse 组织以计费到单个云市场账单账户或子账户（AWS、GCP 或 Azure）吗？ {#multiple-organizations-to-bill-to-single-cloud-marketplace-account}

单个 ClickHouse 组织只能配置为计费到单个云市场账单账户或子账户。

### 如果我的 ClickHouse 组织通过云市场的承诺支出协议计费，当我用尽积分时，我会自动转到按需支付计费吗？ {#automatically-move-to-PAYG-when-running-out-of-credit}

如果您的市场承诺支出合同有效且您用尽了积分，我们将自动将您的组织转到按需支付计费。但是，当您现有的合同到期时，您将需要将新的市场合同链接到您的组织，或通过信用卡将您的组织转到直接计费。
