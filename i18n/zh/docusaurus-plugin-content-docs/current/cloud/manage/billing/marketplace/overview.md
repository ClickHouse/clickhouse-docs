---
slug: /cloud/marketplace/marketplace-billing
title: 市场计费
description: 通过 AWS、GCP 和 Azure 市场订阅 ClickHouse Cloud。
keywords: [aws, azure, gcp, google cloud, marketplace, billing]
---

您可以通过 AWS、GCP 和 Azure 市场订阅 ClickHouse Cloud。这使您能够通过现有的云服务提供商计费来支付 ClickHouse Cloud 的费用。

您可以选择按需付费 (PAYG) 或通过市场与 ClickHouse Cloud 签订合同。计费将由云服务提供商处理，您将收到一份包含所有云服务的单一发票。

- [AWS Marketplace PAYG](/cloud/billing/marketplace/aws-marketplace-payg)
- [AWS Marketplace 承诺合同](/cloud/billing/marketplace/aws-marketplace-committed-contract)
- [GCP Marketplace PAYG](/cloud/billing/marketplace/gcp-marketplace-payg)
- [GCP Marketplace 承诺合同](/cloud/billing/marketplace/gcp-marketplace-committed-contract)
- [Azure Marketplace PAYG](/cloud/billing/marketplace/azure-marketplace-payg)
- [Azure Marketplace 承诺合同](/cloud/billing/marketplace/azure-marketplace-committed-contract)

## 常见问题 {#faqs}

### 我如何验证我的组织是否已连接到市场计费？​ {#how-can-i-verify-that-my-organization-is-connected-to-marketplace-billing}

在 ClickHouse Cloud 控制台中，导航到 **计费**。您应该在 **支付详情** 部分看到市场名称和链接。

### 我是现有的 ClickHouse Cloud 用户。当我通过 AWS / GCP / Azure 市场订阅 ClickHouse Cloud 时会发生什么？​ {#i-am-an-existing-clickhouse-cloud-user-what-happens-when-i-subscribe-to-clickhouse-cloud-via-aws--gcp--azure-marketplace}

通过云服务提供商市场注册 ClickHouse Cloud 是一个两步过程：
1. 您首先在云服务提供商的市场门户上“订阅” ClickHouse Cloud。 完成订阅后，点击“立即支付”或“在提供商处管理”（具体取决于市场）。这会将您重定向到 ClickHouse Cloud。
2. 在 ClickHouse Cloud 上，您可以注册新帐户或使用现有帐户登录。 无论哪种方式，都会为您创建一个新的 ClickHouse Cloud 组织，该组织与您的市场计费相关联。

注意：您先前任何 ClickHouse Cloud 注册的现有服务和组织将保留，并且不会与市场计费相关联。 ClickHouse Cloud 允许您使用同一帐户管理多个组织，每个组织具有不同的计费。

您可以从 ClickHouse Cloud 控制台左下角的菜单切换组织。

### 我是现有的 ClickHouse Cloud 用户。如果我希望我的现有服务通过市场计费，该怎么办？​ {#i-am-an-existing-clickhouse-cloud-user-what-should-i-do-if-i-want-my-existing-services-to-be-billed-via-marketplace}

您需要通过云服务提供商市场订阅 ClickHouse Cloud。完成市场的订阅后，重定向到 ClickHouse Cloud，您将有选项将现有的 ClickHouse Cloud 组织与市场计费链接。从那时起，您现有的资源将通过市场计费。

![市场注册和组织链接](https://github.com/user-attachments/assets/a0939007-320b-4b12-9d6d-fd63bce31864)

您可以从组织的计费页面确认计费确实已链接到市场。 如果您遇到任何问题，请联系 [ClickHouse Cloud 支持](https://clickhouse.com/support/program)。

:::note
您先前任何 ClickHouse Cloud 注册的现有服务和组织将保留，并且不会与市场计费相关联。
:::

### 我作为市场用户订阅了 ClickHouse Cloud。我该如何取消订阅？​ {#i-subscribed-to-clickhouse-cloud-as-a-marketplace-user-how-can-i-unsubscribe}

请注意，您可以简单地停止使用 ClickHouse Cloud，并删除所有现有的 ClickHouse Cloud 服务。尽管订阅仍然有效，但您不会支付任何费用，因为 ClickHouse Cloud 没有任何经常性费用。

如果您想取消订阅，请导航到云服务提供商控制台并在那取消订阅续费。订阅结束后，所有现有服务将停止，您将被提示添加信用卡。如果未添加任何卡，经过两周所有现有服务将被删除。

### 我作为市场用户订阅了 ClickHouse Cloud，然后取消了订阅。现在我想重新订阅，流程是什么？​ {#i-subscribed-to-clickhouse-cloud-as-a-marketplace-user-and-then-unsubscribed-now-i-want-to-subscribe-back-what-is-the-process}

在这种情况下，请照常订阅 ClickHouse Cloud（请参阅通过市场订阅 ClickHouse Cloud 的部分）。

- 对于 AWS 市场，将创建一个新的 ClickHouse Cloud 组织并与市场连接。
- 对于 GCP 市场，您的旧组织将被重新激活。

如果您在重新激活市场组织时遇到任何问题，请联系 [ClickHouse Cloud 支持](https://clickhouse.com/support/program)。

### 我如何访问我对 ClickHouse Cloud 服务的市场订阅发票？​ {#how-do-i-access-my-invoice-for-my-marketplace-subscription-to-the-clickhouse-cloud-service}

- [AWS 计费控制台](https://us-east-1.console.aws.amazon.com/billing/home)
- [GCP Marketplace 订单](https://console.cloud.google.com/marketplace/orders)（选择您用于订阅的计费帐户）

### 使用报表的日期与我的市场发票不一致为什么？​ {#why-do-the-dates-on-the-usage-statements-not-match-my-marketplace-invoice}

市场计费遵循日历月周期。例如，对于 12 月 1 日到 1 月 1 日之间的使用，将在 1 月 3 日到 1 月 5 日之间生成发票。

ClickHouse Cloud 的使用报表遵循不同的计费周期，其中使用情况在注册日起的 30 天内计量和报告。

如果这些日期不相同，使用情况和发票日期将不同。由于使用报表每天跟踪特定服务的使用情况，用户可以依赖报表查看成本明细。

### 我可以在哪里找到一般计费信息？ {#where-can-i-find-general-billing-information}

请查看 [计费概述页面](/cloud/manage/billing)。

### 通过云服务提供商市场支付与直接支付给 ClickHouse 之间的 ClickHouse Cloud 定价有区别吗？ {#is-there-a-difference-in-clickhouse-cloud-pricing-whether-paying-through-the-cloud-provider-marketplace-or-directly-to-clickhouse}

市场计费与直接与 ClickHouse 注册的定价没有区别。在任何情况下，您对 ClickHouse Cloud 的使用都以 ClickHouse Cloud 额度 (CHCs) 的形式进行跟踪，这些在相同的方式下计量并相应计费。
