---
sidebar_label: 'ClickHouse Cloud 计费合规'
slug: /manage/clickhouse-cloud-billing-compliance
title: 'ClickHouse Cloud 计费合规'
description: '介绍 ClickHouse Cloud 计费合规的页面'
keywords: ['计费合规', '按需付费']
doc_type: 'guide'
---

import billing_compliance from '@site/static/images/cloud/manage/billing_compliance.png';
import Image from '@theme/IdealImage';


# ClickHouse Cloud 计费合规



## 计费合规性 {#billing-compliance}

您在使用 ClickHouse Cloud 时，必须为您的组织配置一项处于激活状态且有效的计费方式。在 30 天试用期结束或试用额度耗尽（以先到者为准）后，如需继续使用 ClickHouse Cloud，您可以选择以下计费方式：

| 计费选项                                            | 说明                                                                                     |
|------------------------------------------------------|-----------------------------------------------------------------------------------------|
| [Direct PAYG](#direct-payg)                          | 为您的组织添加一张有效信用卡，以按使用量付费（Pay-As-You-Go）                           |
| [Marketplace PAYG](#cloud-marketplace-payg)          | 通过受支持的云市场服务商设置按使用量付费（Pay-As-You-Go）订阅                            |
| [Committed spend contract](#committed-spend-contract) | 直接或通过受支持的云市场签署预承诺消费合约                                               |

如果试用期结束时您的组织尚未配置任何计费选项，您所有的服务将会被停止。如果在两周后仍未配置任何计费方式，您所有的数据将会被删除。

ClickHouse 按组织级别对服务进行计费。如果我们无法使用您当前的计费方式处理付款，您必须将其更新为上述三种选项之一，以避免服务中断。有关根据所选计费方式进行付款合规性的更多详情，请参阅下文。

### 使用信用卡的按使用量付费计费 {#direct-payg}

您可以使用信用卡，以按月后付的方式为您的 ClickHouse Cloud 用量付款。要添加信用卡，请按照这些[说明](#add-credit-card)操作。

ClickHouse 的月度计费周期从选择组织层级（Basic、Scale 或 Enterprise）并在该组织中创建第一个服务的当天开始。

系统中登记的信用卡通常会在您月度计费周期结束时被扣款，但如果当期账期内应付金额达到 10,000 美元，将会提前触发扣款（有关付款阈值的更多信息请参见[此处](/cloud/billing/payment-thresholds)）。

登记的信用卡必须有效、未过期，并且有足够的可用额度来支付您的发票总额。如果由于任何原因我们无法收取全部应付金额，将立即应用以下未付款发票限制：

* 每个副本最多只能扩容到 120 GiB
* 如果服务已停止，则无法重新启动
* 无法启动或创建新服务

我们会在最长 30 天内尝试使用该组织配置的计费方式处理付款。如果在 14 天后仍未成功收款，该组织内的所有服务将被停止。如果在这 30 天期限结束前仍未收到付款且我们未授予延期，与您的组织相关的所有数据和服务将被删除。

### 云市场按使用量付费计费 {#cloud-marketplace-payg}

您也可以配置按使用量付费（Pay-As-You-Go）计费，通过我们支持的云市场（AWS、GCP 或 Azure）向组织收取费用。要注册 Marketplace PAYG 计费，请按照这些[说明](#marketplace-payg)操作。

与通过 Direct PAYG 计费类似，在 Marketplace PAYG 下，ClickHouse 的月度计费周期从选择组织层级（Basic、Scale 或 Enterprise）并在该组织中创建第一个服务的当天开始。

不过，由于云市场的要求，我们会按小时报告您按使用量付费的使用费用。您将根据与该云市场的协议条款收到账单，通常为按日历月计费周期。

例如，如果您在 1 月 18 日创建了第一个组织服务，那么在 ClickHouse Cloud 中的首次计费用量周期将从 1 月 18 日持续到 2 月 17 日当天结束。但是，您可能会在 2 月初从云市场收到第一张发票。

如果您的 PAYG 云市场订阅被取消或未能自动续订，计费将回退到该组织系统中登记的信用卡（如果有）。要添加信用卡，请[联系支持](/about-us/support)以获得帮助。如果未提供有效信用卡，将适用上述针对 [Direct PAYG](#direct-payg) 的相同未付款发票限制，包括服务暂停以及最终的数据删除。

### 预承诺合约计费 {#committed-spend-contract}

您可以通过预承诺合约为您的组织购买额度，方式包括：



1. 直接联系销售团队购买额度，支持 ACH 或电汇等支付方式。具体付款条款将载明在相应的订单表中。
2. 联系销售团队，通过我们支持的云市场（AWS、GCP 或 Azure）中的订阅来购买额度。在您接受私有报价后以及此后根据该报价条款，我们会将费用报告给相应的云市场，但我们将根据您与该云市场之间协议中的条款向您开具发票。若要通过云市场付款，请按照这些[说明](#marketplace-payg)操作。

应用到某个组织的额度（例如通过承诺合约或退款获得）可在订单表或已接受的私有报价中指定的期限内使用。
额度自授予当日开始按账单周期消耗，账单周期基于首次选择组织层级（Basic、Scale 或 Enterprise）的日期确定。

如果某个组织**不**在云市场承诺合约下，并且额度用完或额度过期，该组织将自动切换为按需计费（Pay-As-You-Go，PAYG）。在这种情况下，我们将尝试使用该组织备案的信用卡（如果有）处理付款。

如果某个组织**在**云市场承诺合约下，并且额度用完，该组织同样会在剩余订阅期内自动通过相同云市场切换为 PAYG 计费。但如果订阅未续期而到期，我们随后将尝试使用该组织备案的信用卡（如果有）处理付款。

无论哪种情况，如果我们无法向已配置的信用卡收费，则上述适用于使用信用卡进行[按需计费 (PAYG)](#direct-payg)时的未付发票限制将生效——包括暂停服务。有关从承诺合约切换到 PAYG 计费的更多详情，请参阅我们[条款和条件](https://clickhouse.com/legal/agreements/terms-of-service)中的“Overconsumption”章节。
不过，对于承诺合约客户，在启动数据删除之前，我们会就任何未支付发票与您联系。数据不会在任何固定期限届满后自动删除。

如果您希望在现有额度到期或用尽之前添加额外额度，请[联系我们](https://clickhouse.com/company/contact)。

### 如何使用信用卡付款 {#add-credit-card}

在 ClickHouse Cloud 界面中进入 Billing（计费）部分，点击下面所示的“Add Credit Card”按钮完成设置。如果您有任何问题，请[联系支持](/about-us/support)获取帮助。

<Image img={billing_compliance} size="md" alt="如何添加信用卡" />



## 如何通过云市场支付 {#marketplace-payg}

如果您想通过我们支持的云市场（AWS、GCP 或 Azure）进行支付，
可以按照[此处](/cloud/marketplace/marketplace-billing)的步骤操作。
如有任何与云市场计费相关的具体问题，请直接联系相应的云服务提供商。

解决云市场计费问题的实用链接：
* [AWS 计费常见问题](https://aws.amazon.com/aws-cost-management/aws-billing/faqs/)
* [GCP 计费常见问题](https://cloud.google.com/compute/docs/billing-questions)
* [Azure 计费常见问题](https://learn.microsoft.com/en-us/azure/cost-management-billing/cost-management-billing-faq)
