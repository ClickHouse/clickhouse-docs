---
sidebar_label: 'ClickHouse Cloud 计费合规性'
slug: /manage/clickhouse-cloud-billing-compliance
title: 'ClickHouse Cloud 计费合规性'
description: '介绍 ClickHouse Cloud 计费合规性的页面'
keywords: ['计费合规性', '按量付费']
doc_type: 'guide'
---

import billing_compliance from '@site/static/images/cloud/manage/billing_compliance.png';
import Image from '@theme/IdealImage';


# ClickHouse Cloud 计费合规



## 计费合规性 {#billing-compliance}

使用 ClickHouse Cloud 需要您的组织配置有效的计费方式。在 30 天试用期结束或试用额度耗尽(以先发生者为准)后,您可以选择以下计费方式继续使用 ClickHouse Cloud:

| 计费方式                                        | 说明                                                                             |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------- |
| [直接按量付费](#direct-payg)                           | 向您的组织添加有效的信用卡以实现按量付费                           |
| [云市场按量付费](#cloud-marketplace-payg)           | 通过支持的云市场提供商设置按量付费订阅          |
| [承诺消费合同](#committed-spend-contract) | 直接或通过支持的云市场签订承诺消费合同 |

如果试用期结束时您的组织尚未配置计费方式,所有服务将被停止。如果两周后仍未配置计费方式,您的所有数据将被删除。

ClickHouse 在组织级别收取服务费用。如果我们无法使用您当前的计费方式处理付款,您必须将其更新为上述三个选项之一以避免服务中断。有关基于所选计费方式的付款合规性详细信息,请参见下文。

### 使用信用卡按量付费 {#direct-payg}

您可以使用信用卡按月后付费方式支付 ClickHouse Cloud 使用费用。要添加信用卡,请按照这些[说明](#add-credit-card)操作。

ClickHouse 的月度计费周期从选择组织层级(Basic、Scale 或 Enterprise)并在组织内创建第一个服务的当天开始。

通常会在月度计费周期结束时对登记的信用卡进行扣款,但如果周期内应付金额达到 10,000 美元,将提前扣款(有关付款阈值的更多信息请参见[此处](/cloud/billing/payment-thresholds))。

登记的信用卡必须有效、未过期,并且有足够的可用额度来支付您的账单总额。如果因任何原因我们无法收取全部应付金额,将立即实施以下未付账单限制:

- 您只能将每个副本扩展到最多 120 GiB
- 如果服务已停止,您将无法启动服务
- 您将无法启动或创建新服务

我们将尝试使用组织配置的计费方式处理付款,最多持续 30 天。如果 14 天后付款仍未成功,组织内的所有服务将被停止。如果在 30 天期限结束时仍未收到付款且我们未授予延期,与您组织相关的所有数据和服务将被删除。

### 云市场按量付费 {#cloud-marketplace-payg}

按量付费也可以配置为通过我们支持的云市场之一(AWS、GCP 或 Azure)向组织收费。要注册云市场按量付费,请按照这些[说明](#marketplace-payg)操作。

与直接按量付费类似,在云市场按量付费模式下,您在 ClickHouse 的月度计费周期从选择组织层级(Basic、Scale 或 Enterprise)并在组织内创建第一个服务的当天开始。

但是,由于云市场的要求,我们按小时报告您的按量付费使用费用。请注意,您将根据与该云市场的协议条款收到账单 - 通常按自然月计费周期。

例如,如果您在 1 月 18 日创建第一个组织服务,您在 ClickHouse Cloud 的第一个计费使用周期将从 1 月 18 日持续到 2 月 17 日当天结束。但是,您可能会在 2 月初收到来自云市场的第一张账单。

但是,如果您的云市场按量付费订阅被取消或未能自动续订,计费将回退到组织登记的信用卡(如果有)。要添加信用卡,请[联系支持](/about-us/support)寻求帮助。如果未提供有效的信用卡,将实施与上述[直接按量付费](#direct-payg)相同的未付账单限制 - 包括服务暂停和最终数据删除。

### 承诺合同计费 {#committed-spend-contract}

您可以通过以下方式为您的组织购买承诺合同额度:


1. 联系销售团队直接购买积分,支付方式包括 ACH
   或电汇。付款条款将在相应的订单表格中列明。
2. 联系销售团队通过我们支持的云市场(AWS、GCP 或 Azure)之一的订阅购买积分。费用将在接受私有报价时报告给相应的云市场,此后将按照报价条款进行报告,但您将根据与该云市场的协议条款收到账单。要通过云市场付款,请遵循这些[说明](#marketplace-payg)。

应用于组织的积分(例如通过承诺合同或退款)可在订单表格或已接受的私有报价中指定的期限内使用。
积分从授予当天开始消耗,计费周期基于首次选择组织层级(Basic、Scale 或 Enterprise)的日期。

如果组织**未**签订云市场承诺合同且积分用尽或过期,该组织将自动切换到按需付费(PAYG)计费。在这种情况下,如果组织有存档的信用卡,我们将尝试使用该信用卡处理付款。

如果组织**已**签订云市场承诺合同且积分用尽,它也将在订阅剩余期间通过同一云市场自动切换到 PAYG 计费。但是,如果订阅未续订并过期,我们将尝试使用组织存档的信用卡处理付款(如有)。

在任一情况下,如果我们无法对配置的信用卡收费,上述针对使用信用卡的[按需付费(PAYG)](#direct-payg)计费的未付账单限制将适用——这包括暂停服务。
有关从承诺合同转为 PAYG 计费的更多详细信息,请参阅我们[条款和条件](https://clickhouse.com/legal/agreements/terms-of-service)中的"超额消费"部分。
但是,对于承诺合同客户,我们将在启动数据删除之前就任何未付账单与您联系。数据不会在任何时间段后自动删除。

如果您想在现有积分过期或用尽之前添加额外积分,请[联系我们](https://clickhouse.com/company/contact)。

### 如何使用信用卡付款 {#add-credit-card}

转到 ClickHouse Cloud 用户界面中的计费部分,然后点击"添加信用卡"按钮(如下所示)以完成设置。如有任何疑问,请[联系支持团队](/about-us/support)寻求帮助。

<Image img={billing_compliance} size='md' alt='如何添加信用卡' />


## 如何通过云市场支付 {#marketplace-payg}

如果您希望通过我们支持的云市场之一(AWS、GCP 或 Azure)进行支付,
可以参考[此处](/cloud/marketplace/marketplace-billing)的步骤说明。
如有任何与云市场计费相关的问题,请
直接联系相应的云服务提供商。

解决云市场计费问题的相关链接:

- [AWS 计费常见问题](https://aws.amazon.com/aws-cost-management/aws-billing/faqs/)
- [GCP 计费常见问题](https://cloud.google.com/compute/docs/billing-questions)
- [Azure 计费常见问题](https://learn.microsoft.com/en-us/azure/cost-management-billing/cost-management-billing-faq)
