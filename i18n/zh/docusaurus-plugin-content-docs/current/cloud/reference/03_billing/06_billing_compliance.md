---
'sidebar_label': 'ClickHouse Cloud 计费合规性'
'slug': '/manage/clickhouse-cloud-billing-compliance'
'title': 'ClickHouse Cloud 计费合规性'
'description': '页面描述 ClickHouse Cloud 计费合规性'
'keywords':
- 'billing compliance'
- 'pay-as-you-go'
'doc_type': 'guide'
---

import billing_compliance from '@site/static/images/cloud/manage/billing_compliance.png';
import Image from '@theme/IdealImage';


# ClickHouse Cloud 账单合规性

## 账单合规性 {#billing-compliance}

您使用 ClickHouse Cloud 需要您的组织配置有效的账单付款方式。在您的 30 天试用期结束或您的试用积分耗尽（以先发生者为准）后，您有以下账单选项以继续使用 ClickHouse Cloud：

| 账单选项                                            | 描述                                                                                  |
|------------------------------------------------------|---------------------------------------------------------------------------------------|
| [直接按需支付](#direct-payg)                          | 为您的组织添加有效信用卡以进行按需支付                                                 |
| [市场按需支付](#cloud-marketplace-payg)              | 通过支持的云市场供应商设置按需支付订阅                                               |
| [承诺支出合同](#committed-spend-contract)            | 直接或通过支持的云市场签署承诺支出合同                                               |

如果您的试用期结束且您的组织未配置任何账单选项，您的所有服务将被停止。 如果在两周后仍未配置账单方法，您的所有数据将被删除。

ClickHouse 按组织级别对服务收费。如果我们无法使用您当前的账单方法处理付款，您必须将其更新为上述三种选项之一以避免服务中断。有关根据您选择的账单方法的付款合规性的更多详细信息，请参见下文。

### 使用信用卡进行按需支付 {#direct-payg}

您可以使用信用卡按月支付 ClickHouse Cloud 的使用费用。 要添加信用卡，请按照这些 [说明](#add-credit-card)。

ClickHouse 的每月账单周期自选择组织层级（基本版、扩展版或企业版）并在组织内创建首个服务之日起开始。

文件中的信用卡通常会在您的每月账单周期结束时被收费，但如果计费周期内到期金额达到 10,000 美元（有关付款阈值的更多信息，请参见 [这里](/cloud/billing/payment-thresholds)）。

文件中的信用卡必须有效且未过期，并且有足够的可用信用额度来支付您的账单总额。如果由于任何原因我们无法收费全额到期款项，将立即适用以下未付款账单限制：

* 您只能扩展到每个副本 120 GiB
* 如果服务已停止，您将无法启动服务
* 您将无法启动或创建新服务

我们将在最多 30 天内尝试使用组织配置的账单方法处理付款。如果在 14 天后付款不成功，则组织内的所有服务将被停止。如果在此 30 天期限结束时仍未收到付款，并且我们未授予延长，则将删除与您的组织相关的所有数据和服务。

### 云市场按需支付账单 {#cloud-marketplace-payg}

按需支付账单也可以通过我们支持的云市场（AWS、GCP 或 Azure）为组织收费。 要注册市场按需支付账单，请按照这些 [说明](#marketplace-payg)。

与直接按需支付类似，通过市场按需支付的 ClickHouse 每月账单周期从选择组织层级（基本版、扩展版或企业版）并在组织内创建首个服务之日起开始。

然而，由于市场的要求，我们会按小时记录您按需使用的费用。 请注意，您将根据与该市场的协议条款开具发票 - 通常是在日历月的账单周期上。

例如，如果您在 1 月 18 日创建了第一个组织服务，那么您在 ClickHouse Cloud 的首次账单使用周期将从 1 月 18 日持续到 2 月 17 日的结束。然而，您可能会在 2 月初收到来自云市场的首张发票。

但是，如果您的 PAYG 市场订阅被取消或未能自动续订，账单将退回到组织的文件信用卡上（如果有）。 若要添加信用卡，请 [联系支持](/about-us/support) 获取帮助。如果未提供有效的信用卡，将适用上述针对 [直接按需支付](#direct-payg) 的未付账单限制 - 这包括服务暂停和最终的数据删除。

### 承诺合同计费 {#committed-spend-contract}

您可以通过承诺合同为您的组织购买积分，方法如下：

1. 联系销售直接购买积分，包括 ACH 或电汇等付款选项。付款条款将在适用的订单表中列出。
2. 联系销售通过我们支持的云市场之一购买积分（AWS、GCP 或 Azure）上的订阅。费用将在接受私人报价后报告给适用的云市场，并随后根据报价条款进行处理，但您将根据与该市场的协议条款开具发票。要通过市场付款，请按照这些 [说明](#marketplace-payg)。

应用于组织的积分（例如，通过承诺合同或退款）在订单表或接受的私人报价中指定的期限内供您使用。
积分自授予积分之日开始消耗，具体的账单周期根据选择的第一个组织层级（基本版、扩展版或企业版）日期来决定。

如果一个组织 **不** 在云市场的承诺合同中且积分用完或积分过期，组织将自动切换到按需支付（PAYG）账单。在这种情况下，我们将尝试使用组织的文件信用卡对付款进行处理（如果有）。

如果一个组织 **在** 云市场的承诺合同中且积分用完，则其也将自动切换到通过同一市场支付的 PAYG 账单，用于剩余的订阅。 然而，如果订阅未续订并过期，我们将尝试使用组织的文件信用卡进行付款处理（如果有）。

在这两种情况下，如果我们无法对配置的信用卡收费，将适用上述针对 [按需支付（PAYG）](#direct-payg) 账单的未付款限制——这包括服务暂停。 但是，对于承诺合同客户，我们将在启动数据删除之前与您联系有关任何未付款的发票。 数据不会在任何时间段后自动删除。

如果您希望在现有积分到期或耗尽之前添加额外积分，请 [联系我们](https://clickhouse.com/company/contact)。

### 如何使用信用卡付款 {#add-credit-card}

请前往 ClickHouse Cloud UI 的账单部分，点击“添加信用卡”按钮（如下图所示）完成设置。如果您有任何问题，请 [联系支持](/about-us/support) 获取帮助。

<Image img={billing_compliance} size="md" alt="如何添加信用卡" />

## 如何通过市场付款 {#marketplace-payg}

如果您想通过我们支持的任何市场（AWS、GCP 或 Azure）付款，您可以按照 [这些步骤](/cloud/marketplace/marketplace-billing) 获取帮助。 对于与云市场账单相关的任何问题，请直接联系云服务提供商。

解决市场账单问题的有用链接：
* [AWS 账单常见问题](https://aws.amazon.com/aws-cost-management/aws-billing/faqs/)
* [GCP 账单常见问题](https://cloud.google.com/compute/docs/billing-questions)
* [Azure 账单常见问题](https://learn.microsoft.com/en-us/azure/cost-management-billing/cost-management-billing-faq)
