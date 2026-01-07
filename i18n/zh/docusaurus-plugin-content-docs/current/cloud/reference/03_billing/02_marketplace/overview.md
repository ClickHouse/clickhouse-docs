---
slug: /cloud/marketplace/marketplace-billing
title: 'Marketplace 计费'
description: '通过 AWS、GCP 和 Azure Marketplace 订阅 ClickHouse Cloud。'
keywords: ['aws', 'azure', 'gcp', 'google cloud', 'marketplace', 'billing']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import marketplace_signup_and_org_linking from '@site/static/images/cloud/manage/billing/marketplace/marketplace_signup_and_org_linking.png'

您可以通过 AWS、GCP 和 Azure 的 Marketplace 订阅 ClickHouse Cloud。这样，您可以在现有云服务提供商的账单中统一支付 ClickHouse Cloud 的费用。

您可以通过云 Marketplace 选择按需计费（PAYG），或签订 ClickHouse Cloud 的承诺用量合约。计费将由云服务提供商处理，您将收到一张涵盖所有云服务的统一发票。

* [AWS Marketplace 按需计费（PAYG）](/cloud/billing/marketplace/aws-marketplace-payg)
* [AWS Marketplace 承诺用量合约](/cloud/billing/marketplace/aws-marketplace-committed-contract)
* [GCP Marketplace 按需计费（PAYG）](/cloud/billing/marketplace/gcp-marketplace-payg)
* [GCP Marketplace 承诺用量合约](/cloud/billing/marketplace/gcp-marketplace-committed-contract)
* [Azure Marketplace 按需计费（PAYG）](/cloud/billing/marketplace/azure-marketplace-payg)
* [Azure Marketplace 承诺用量合约](/cloud/billing/marketplace/azure-marketplace-committed-contract)


## 常见问题解答 {#faqs}

### 我如何验证我的组织是否已连接到 Marketplace 计费？​ {#how-can-i-verify-that-my-organization-is-connected-to-marketplace-billing}

在 ClickHouse Cloud 控制台中，进入 **Billing** 页面。你应当在 **Payment details** 部分看到所使用 Marketplace 的名称及其链接。

### 我是现有的 ClickHouse Cloud 用户。当我通过 AWS / GCP / Azure Marketplace 订阅 ClickHouse Cloud 时会发生什么？​ {#i-am-an-existing-clickhouse-cloud-user-what-happens-when-i-subscribe-to-clickhouse-cloud-via-aws--gcp--azure-marketplace}

通过云服务商的 Marketplace 订阅 ClickHouse Cloud 包含两个步骤：

1. 首先，你在云服务商的 Marketplace 门户中「订阅」ClickHouse Cloud。完成订阅后，点击「Pay Now」或「Manage on Provider」（具体取决于云市场），系统会将你重定向到 ClickHouse Cloud。
2. 在 ClickHouse Cloud 上，你可以注册一个新账号，或者使用现有账号登录。无论采用哪种方式，系统都会为你创建一个新的 ClickHouse Cloud 组织，并将其绑定到你的 Marketplace 计费。

注意：你之前任何一次 ClickHouse Cloud 注册所创建的现有服务和组织都会保留，并且不会连接到 Marketplace 计费。ClickHouse Cloud 允许你使用同一个账号管理多个组织，每个组织可以有不同的计费方式。

你可以通过 ClickHouse Cloud 控制台左下角的菜单在不同组织之间切换。

### 我是现有的 ClickHouse Cloud 用户。如果我希望将现有服务通过 Marketplace 计费，该怎么做？​ {#i-am-an-existing-clickhouse-cloud-user-what-should-i-do-if-i-want-my-existing-services-to-be-billed-via-marketplace}

你需要通过云服务商的 Marketplace 订阅 ClickHouse Cloud。完成在 Marketplace 上的订阅并重定向回 ClickHouse Cloud 后，你将可以选择将一个现有的 ClickHouse Cloud 组织关联到 Marketplace 计费。从那一刻起，你的现有资源将通过 Marketplace 进行计费。 

<Image img={marketplace_signup_and_org_linking} size='md' alt='Marketplace 注册与组织关联' border/>

你可以在该组织的计费页面上确认计费已成功连接到 Marketplace。如果在此过程中遇到任何问题，请联系 [ClickHouse Cloud 支持](https://clickhouse.com/support/program)。

:::note
你之前任何一次 ClickHouse Cloud 注册所创建的现有服务和组织都会保留，并且不会连接到 Marketplace 计费。
:::

### 我作为 Marketplace 用户订阅了 ClickHouse Cloud。如何取消订阅？​ {#i-subscribed-to-clickhouse-cloud-as-a-marketplace-user-how-can-i-unsubscribe}

请注意，你可以直接停止使用 ClickHouse Cloud 并删除所有现有的 ClickHouse Cloud 服务。即使订阅仍然处于激活状态，由于 ClickHouse Cloud 没有任何固定的周期性费用，你也不会产生任何费用。

如果你希望取消订阅，请前往云服务商控制台，在其中取消订阅续费。一旦订阅结束，所有现有服务将被停止，并会提示你添加信用卡。如果未添加信用卡，两周后所有现有服务将被删除。

### 我作为 Marketplace 用户订阅了 ClickHouse Cloud，然后又取消了订阅。现在我想重新订阅，该如何操作？​ {#i-subscribed-to-clickhouse-cloud-as-a-marketplace-user-and-then-unsubscribed-now-i-want-to-subscribe-back-what-is-the-process}

在这种情况下，请像往常一样订阅 ClickHouse Cloud（参见通过 Marketplace 订阅 ClickHouse Cloud 的相关章节）。

- 对于 AWS Marketplace，将创建一个新的 ClickHouse Cloud 组织并将其连接到该 Marketplace。
- 对于 GCP Marketplace，你之前的组织将会被重新激活。

如果在重新激活你的 Marketplace 组织时遇到任何问题，请联系 [ClickHouse Cloud 支持](https://clickhouse.com/support/program)。

### 我如何访问我在 Marketplace 中订阅的 ClickHouse Cloud 服务的发票？​ {#how-do-i-access-my-invoice-for-my-marketplace-subscription-to-the-clickhouse-cloud-service}

- [AWS billing Console](https://us-east-1.console.aws.amazon.com/billing/home)
- [GCP Marketplace orders](https://console.cloud.google.com/marketplace/orders)（选择你用于订阅的计费账号）

### 为什么用量报表上的日期与 Marketplace 发票上的日期不匹配？​ {#why-do-the-dates-on-the-usage-statements-not-match-my-marketplace-invoice}

Marketplace 计费遵循自然月周期。例如，对于 12 月 1 日到次年 1 月 1 日之间的用量，将会在 1 月 3 日到 1 月 5 日之间生成发票。

ClickHouse Cloud 用量报表遵循不同的计费周期：从你注册当日开始计算一个 30 天周期，对该周期内的用量进行计量并出具报表。

如果这两个日期不一致，用量和发票的日期就会不同。由于用量报表会按天统计某一服务的使用情况，你可以依靠这些报表来查看成本明细。

### 在哪里可以找到通用计费信息？ {#where-can-i-find-general-billing-information}

请参阅 [计费概览页面](/cloud/manage/billing)。

### 无论是通过云服务商 Marketplace 支付，还是直接向 ClickHouse 支付，ClickHouse Cloud 的价格有差别吗？ {#is-there-a-difference-in-clickhouse-cloud-pricing-whether-paying-through-the-cloud-provider-marketplace-or-directly-to-clickhouse}

通过 Marketplace 计费与直接向 ClickHouse 注册在价格上没有差别。在这两种情况下，您对 ClickHouse Cloud 的使用量都以 ClickHouse Cloud Credits（CHC）计量，用量的计量方式相同，并据此计费。

### 我可以设置多个 ClickHouse 组织，将其计费统一关联到同一个云市场计费账户（AWS、GCP 或 Azure）吗？ {#multiple-organizations-to-bill-to-single-cloud-marketplace-account}

可以。可以将多个 ClickHouse 组织配置为将其后付费用量统一计入同一个云市场计费账户（AWS、GCP 或 Azure）。不过，预付费额度默认不会在不同组织之间共享。如果您需要在多个组织之间共享额度，请联系 [ClickHouse Cloud Support](https://clickhouse.com/support/program)。

### 如果我的 ClickHouse Organization 通过云 Marketplace 承诺消费协议计费，在用完额度后会自动切换到 PAYG 计费吗？ {#automatically-move-to-PAYG-when-running-out-of-credit}

如果您的 Marketplace 承诺消费合同仍然有效，并且您用完了额度，我们会自动将您的 Organization 切换到按需付费（PAYG）计费模式。不过，当现有合同到期时，您需要将新的 Marketplace 合同关联到您的 Organization，或者将您的 Organization 切换为通过信用卡直接计费。 