---
slug: /cloud/billing/marketplace/migrate
title: '在云市场中将计费从按需付费 (PAYG) 迁移到承诺消费合约'
description: '将计费从按需付费迁移到承诺消费合约。'
keywords: ['marketplace', 'billing', 'PAYG', 'pay-as-you-go', 'committed spend contract']
doc_type: 'guide'
---



# 将计费方式从按需付费 (PAYG) 迁移到云市场承诺消费合同 {#migrate-payg-to-committed}

如果您的 ClickHouse 组织当前通过有效的云市场按需付费 (PAYG) 订阅(或订单)进行计费,并且您希望迁移到通过同一云市场的承诺消费合同进行计费,请先接受新的报价,然后根据您的云服务提供商按照以下步骤操作。


## 重要说明 {#important-notes}

请注意,取消您的云市场按量付费订阅不会删除您的 ClickHouse Cloud 账户,仅会终止通过云市场的计费关系。取消后,我们的系统将停止通过云市场对 ClickHouse Cloud 服务进行计费。(注意:此过程不是即时的,可能需要几分钟才能完成)。

在您的云市场订阅被取消后,如果您的 ClickHouse 组织已登记信用卡,我们将在计费周期结束时向该卡收费,除非在此之前关联了新的云市场订阅。

如果取消后未配置信用卡,您将有 14 天时间向您的组织添加有效的信用卡或新的云市场订阅。如果在此期间未配置任何付款方式,您的服务将被暂停,您的组织将被视为不符合[计费合规性](/manage/clickhouse-cloud-billing-compliance)要求。

订阅取消后产生的任何使用量将按以下优先级顺序向下一个已配置的有效付款方式收费:预付费余额、云市场订阅或信用卡。

如有任何问题或在将您的组织配置到新的云市场订阅时需要支持,请联系 ClickHouse [支持团队](https://clickhouse.com/support/program)寻求帮助。


## AWS Marketplace {#aws-marketplace}

如果您希望使用相同的 AWS 账户 ID 将按量付费(PAYG)订阅迁移到承诺消费合同,我们建议[联系销售团队](https://clickhouse.com/company/contact)进行此变更。这样无需额外步骤,您的 ClickHouse 组织或服务也不会受到任何影响。

如果您希望使用不同的 AWS 账户 ID 将 ClickHouse 组织从按量付费(PAYG)订阅迁移到承诺消费合同,请按照以下步骤操作:

### 取消 AWS 按量付费订阅的步骤 {#cancel-aws-payg}

1. **前往 [AWS Marketplace](https://us-east-1.console.aws.amazon.com/marketplace)**
2. **点击"Manage Subscriptions"按钮**
3. **导航到"Your Subscriptions":**
   - 点击"Manage Subscriptions"
4. **在列表中找到 ClickHouse Cloud:**
   - 在"Your Subscriptions"下查找并点击 ClickHouse Cloud
5. **取消订阅:**
   - 在"Agreement"下,点击 ClickHouse Cloud 列表旁边的"Actions"下拉菜单或按钮
   - 选择"Cancel subscription"

> **注意:** 如需取消订阅方面的帮助(例如取消订阅按钮不可用),请联系 [AWS 支持](https://support.console.aws.amazon.com/support/home#/)。

接下来,按照这些[步骤](/cloud/billing/marketplace/aws-marketplace-committed-contract)将您的 ClickHouse 组织配置到您已接受的新 AWS 承诺消费合同。


## GCP Marketplace {#gcp-marketplace}

### 取消 GCP 按需付费订单的步骤 {#cancel-gcp-payg}

1. **前往您的 [Google Cloud Marketplace 控制台](https://console.cloud.google.com/marketplace):**
   - 确保您已登录正确的 GCP 账户并选择了相应的项目
2. **找到您的 ClickHouse 订单:**
   - 在左侧菜单中,点击"您的订单"
   - 在活动订单列表中找到相应的 ClickHouse 订单
3. **取消订单:**
   - 找到订单右侧的三点菜单,按照说明取消 ClickHouse 订单

> **注意:** 如需取消订单方面的帮助,请联系 [GCP 支持](https://cloud.google.com/support/docs/get-billing-support)。

接下来按照这些[步骤](/cloud/billing/marketplace/gcp-marketplace-committed-contract)将您的 ClickHouse 组织配置到新的 GCP 承诺消费合同。


## Azure 市场 {#azure-marketplace}

### 取消 Azure 按量付费订阅的步骤 {#cancel-azure-payg}

1. **前往 [Microsoft Azure 门户](http://portal.azure.com)**
2. **导航至"订阅"**
3. **找到您要取消的有效 ClickHouse 订阅**
4. **取消订阅：**
   - 点击 ClickHouse Cloud 订阅以打开订阅详情
   - 选择"取消订阅"按钮

> **注意：** 如需取消此订单的帮助，请在您的 Azure 门户中提交支持工单。

接下来，请按照这些[步骤](/cloud/billing/marketplace/azure-marketplace-committed-contract)将您的 ClickHouse 组织配置到新的 Azure 承诺消费合同。


## 关联承诺消费合同的要求 {#linking-requirements}

> **注意：** 要将您的组织关联到市场承诺消费合同，需满足以下条件:
>
> - 执行操作的用户必须是要关联订阅的 ClickHouse 组织的管理员
> - 该组织的所有未付账单必须已结清(如有任何疑问,请联系 ClickHouse [支持团队](https://clickhouse.com/support/program))
