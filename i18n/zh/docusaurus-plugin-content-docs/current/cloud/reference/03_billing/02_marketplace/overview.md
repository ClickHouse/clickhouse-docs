---
slug: /cloud/marketplace/marketplace-billing
title: 'Marketplace 计费'
description: '通过 AWS、GCP 和 Azure Marketplace 订阅 ClickHouse Cloud。'
keywords: ['aws', 'azure', 'gcp', 'google cloud', 'marketplace', 'billing']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import marketplace_signup_and_org_linking from '@site/static/images/cloud/manage/billing/marketplace/marketplace_signup_and_org_linking.png'

您可以通过 AWS、GCP 和 Azure Marketplace 订阅 ClickHouse Cloud。这样，您就可以通过现有云服务提供商的账单来支付 ClickHouse Cloud 的费用。

您可以在 Marketplace 中选择按需付费（PAYG），或者与 ClickHouse Cloud 签订承诺合约。计费将由云服务提供商处理，您会收到一份整合了所有云服务的账单。

* [AWS Marketplace 按需付费（PAYG）](/cloud/billing/marketplace/aws-marketplace-payg)
* [AWS Marketplace 承诺合约](/cloud/billing/marketplace/aws-marketplace-committed-contract)
* [GCP Marketplace 按需付费（PAYG）](/cloud/billing/marketplace/gcp-marketplace-payg)
* [GCP Marketplace 承诺合约](/cloud/billing/marketplace/gcp-marketplace-committed-contract)
* [Azure Marketplace 按需付费（PAYG）](/cloud/billing/marketplace/azure-marketplace-payg)
* [Azure Marketplace 承诺合约](/cloud/billing/marketplace/azure-marketplace-committed-contract)


## 常见问题 {#faqs}

### 如何验证我的组织已连接到云市场计费？​ {#how-can-i-verify-that-my-organization-is-connected-to-marketplace-billing}

在 ClickHouse Cloud 控制台中,导航至 **Billing**。您应该能在 **Payment details** 部分看到云市场名称和链接。

### 我是现有的 ClickHouse Cloud 用户。当我通过 AWS / GCP / Azure 云市场订阅 ClickHouse Cloud 时会发生什么？​ {#i-am-an-existing-clickhouse-cloud-user-what-happens-when-i-subscribe-to-clickhouse-cloud-via-aws--gcp--azure-marketplace}

从云提供商市场注册 ClickHouse Cloud 需要两个步骤:

1. 首先在云提供商的市场门户上"订阅" ClickHouse Cloud。完成订阅后,点击"Pay Now"或"Manage on Provider"(取决于具体的云市场)。这将重定向您到 ClickHouse Cloud。
2. 在 ClickHouse Cloud 上,您可以注册新账户或使用现有账户登录。无论哪种方式,都会为您创建一个新的 ClickHouse Cloud 组织,该组织与您的云市场计费关联。

注意:您之前注册 ClickHouse Cloud 时创建的现有服务和组织将保留,它们不会连接到云市场计费。ClickHouse Cloud 允许您使用同一账户管理多个组织,每个组织具有不同的计费方式。

您可以从 ClickHouse Cloud 控制台左下角的菜单切换组织。

### 我是现有的 ClickHouse Cloud 用户。如果我希望现有服务通过云市场计费,应该怎么做？​ {#i-am-an-existing-clickhouse-cloud-user-what-should-i-do-if-i-want-my-existing-services-to-be-billed-via-marketplace}

您需要通过云提供商市场订阅 ClickHouse Cloud。在云市场上完成订阅并重定向到 ClickHouse Cloud 后,您将可以选择将现有的 ClickHouse Cloud 组织关联到云市场计费。从那时起,您的现有资源将通过云市场计费。

<Image
  img={marketplace_signup_and_org_linking}
  size='md'
  alt='云市场注册和组织关联'
  border
/>

您可以从组织的计费页面确认计费确实已关联到云市场。如果遇到任何问题,请联系 [ClickHouse Cloud 支持](https://clickhouse.com/support/program)。

:::note
您之前注册 ClickHouse Cloud 时创建的现有服务和组织将保留,不会连接到云市场计费。
:::

### 我作为云市场用户订阅了 ClickHouse Cloud。如何取消订阅？​ {#i-subscribed-to-clickhouse-cloud-as-a-marketplace-user-how-can-i-unsubscribe}

请注意,您可以直接停止使用 ClickHouse Cloud 并删除所有现有的 ClickHouse Cloud 服务。即使订阅仍然有效,您也不会支付任何费用,因为 ClickHouse Cloud 没有任何定期费用。

如果您想取消订阅,请导航到云提供商控制台并在那里取消订阅续订。订阅结束后,所有现有服务将被停止,系统会提示您添加信用卡。如果未添加信用卡,两周后所有现有服务将被删除。

### 我作为云市场用户订阅了 ClickHouse Cloud,然后取消了订阅。现在我想重新订阅,流程是什么？​ {#i-subscribed-to-clickhouse-cloud-as-a-marketplace-user-and-then-unsubscribed-now-i-want-to-subscribe-back-what-is-the-process}

在这种情况下,请像往常一样订阅 ClickHouse Cloud(参见通过云市场订阅 ClickHouse Cloud 的相关章节)。

- 对于 AWS 云市场,将创建一个新的 ClickHouse Cloud 组织并连接到云市场。
- 对于 GCP 云市场,您的旧组织将被重新激活。

如果您在重新激活云市场组织时遇到任何问题,请联系 [ClickHouse Cloud 支持](https://clickhouse.com/support/program)。

### 如何访问我的 ClickHouse Cloud 服务云市场订阅发票？​ {#how-do-i-access-my-invoice-for-my-marketplace-subscription-to-the-clickhouse-cloud-service}

- [AWS 计费控制台](https://us-east-1.console.aws.amazon.com/billing/home)
- [GCP Marketplace 订单](https://console.cloud.google.com/marketplace/orders)(选择您用于订阅的计费账户)

### 为什么使用量报表上的日期与我的云市场发票不匹配？​ {#why-do-the-dates-on-the-usage-statements-not-match-my-marketplace-invoice}

云市场计费遵循自然月周期。例如,对于 12 月 1 日至 1 月 1 日之间的使用量,发票将在 1 月 3 日至 1 月 5 日之间生成。


ClickHouse Cloud 使用情况报表采用不同的计费周期,从注册之日起以 30 天为周期计量和报告使用量。

如果使用日期和发票日期不一致,两者将会有所差异。由于使用情况报表按天跟踪特定服务的使用量,用户可以通过报表查看详细的成本明细。

### 在哪里可以找到常规计费信息? {#where-can-i-find-general-billing-information}

请参阅[计费概览页面](/cloud/manage/billing)。

### 通过云服务商市场付费与直接向 ClickHouse 付费,ClickHouse Cloud 的定价是否有差异? {#is-there-a-difference-in-clickhouse-cloud-pricing-whether-paying-through-the-cloud-provider-marketplace-or-directly-to-clickhouse}

通过市场计费与直接向 ClickHouse 注册的定价没有差异。无论采用哪种方式,您的 ClickHouse Cloud 使用量都以 ClickHouse Cloud Credits (CHCs) 进行跟踪,计量方式相同并据此计费。

### 我可以将多个 ClickHouse 组织关联到单个云市场计费账户或子账户(AWS、GCP 或 Azure)吗? {#multiple-organizations-to-bill-to-single-cloud-marketplace-account}

单个 ClickHouse 组织只能配置为关联到单个云市场计费账户或子账户。

### 如果我的 ClickHouse 组织通过云市场承诺消费协议计费,当额度用完时会自动转为按量付费(PAYG)计费吗? {#automatically-move-to-PAYG-when-running-out-of-credit}

如果您的市场承诺消费合同处于有效状态且额度已用完,我们将自动将您的组织转为按量付费(PAYG)计费。但是,当现有合同到期时,您需要将新的市场合同关联到您的组织,或将组织转为通过信用卡直接计费。
