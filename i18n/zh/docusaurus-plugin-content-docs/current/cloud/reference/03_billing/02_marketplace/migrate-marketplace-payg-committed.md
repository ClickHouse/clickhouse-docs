---
slug: /cloud/billing/marketplace/migrate
title: '在云市场中将计费从按需付费（PAYG）迁移到承诺消费合同'
description: '将按需付费迁移为承诺消费合同。'
keywords: ['marketplace', '计费', 'PAYG', 'pay-as-you-go', '承诺消费合同']
doc_type: 'guide'
---



# 将按需付费 (PAYG) 计费迁移为云市场中的承诺消费合约 \\{#migrate-payg-to-committed\\}

如果您的 ClickHouse 组织当前是通过云市场中的有效按需付费 (PAYG) 订阅（或订单）进行计费，并且希望在同一云市场中改为通过承诺消费合约进行计费，请先接受您的新报价，然后根据您的云服务提供商，按照下面的步骤进行操作。



## 重要说明 \\{#important-notes\\}

请注意，取消云市场的按需付费（PAYG）订阅并不会删除您的 ClickHouse Cloud 账号——它只会终止通过云市场建立的计费关系。取消后，我们的系统将停止通过云市场为 ClickHouse Cloud 服务计费。（注意：该过程并非即时生效，可能需要几分钟才能完成。）

在您取消云市场订阅后，如果您的 ClickHouse 组织已绑定信用卡，我们将在您当前结算周期结束时从该信用卡扣费——除非在此之前已为该组织关联了新的云市场订阅。

如果在取消之后没有配置信用卡，您将有 14 天时间为您的组织添加有效信用卡或新的云市场订阅。如果在该期限内仍未配置任何支付方式，您的服务将被暂停，且您的组织将被视为未满足[计费合规性](/manage/clickhouse-cloud-billing-compliance)要求。

在订阅取消之后产生的任何使用量，将计入下一个已配置的有效支付方式——按预付额度、云市场订阅、信用卡的顺序依次扣费。

如果您在为组织配置新的云市场订阅时有任何疑问或需要支持，请联系 ClickHouse [支持](https://clickhouse.com/support/program)获取帮助。



## AWS Marketplace \\{#aws-marketplace\\}

如果你希望使用相同的 AWS Account ID 将按需计费（PAYG）订阅迁移为承诺消费合约，我们推荐你[联系销售团队](https://clickhouse.com/company/contact)来完成此变更。这样做无需任何额外步骤，也不会对你的 ClickHouse 组织或服务造成任何中断。

如果你希望使用不同的 AWS Account ID，将你的 ClickHouse 组织从按需计费（PAYG）订阅迁移到承诺消费合约，请按以下步骤操作：

### 取消 AWS PAYG 订阅的步骤 \\{#cancel-aws-payg\\}

1. **前往 [AWS Marketplace](https://us-east-1.console.aws.amazon.com/marketplace)**
2. **点击“Manage Subscriptions”按钮**
3. **进入“Your Subscriptions”：**
    - 点击“Manage Subscriptions”
4. **在列表中找到 ClickHouse Cloud：**
    - 在“Your Subscriptions”下找到并点击 ClickHouse Cloud
5. **取消订阅：**
    - 在“Agreement”下，点击 ClickHouse Cloud 列表项旁的“Actions”下拉菜单或按钮
    - 选择“Cancel subscription”

> **注意：** 如果你在取消订阅时需要帮助（例如，“Cancel subscription” 按钮不可用），请联系 [AWS support](https://support.console.aws.amazon.com/support/home#/)。

接下来，请按照这些[步骤](/cloud/billing/marketplace/aws-marketplace-committed-contract)，将你的 ClickHouse 组织配置为你已接受的新 AWS 承诺消费合约。



## GCP Marketplace \\{#gcp-marketplace\\}

### 取消 GCP 按需付费 (PAYG) 订单的步骤 \\{#cancel-gcp-payg\\}

1. **前往你的 [Google Cloud Marketplace 控制台](https://console.cloud.google.com/marketplace)：**
    - 确保你已登录正确的 GCP 帐号，并已选择相应的项目
2. **找到你的 ClickHouse 订单：**
    - 在左侧菜单中，点击 “Your Orders”
    - 在活动订单列表中找到对应的 ClickHouse 订单
3. **取消该订单：**
    - 在订单右侧找到三点菜单，并按提示操作以取消该 ClickHouse 订单

> **注意：** 如需帮助取消该订单，请联系 [GCP 支持](https://cloud.google.com/support/docs/get-billing-support)。

接下来按照这些[步骤](/cloud/billing/marketplace/gcp-marketplace-committed-contract)，将你的 ClickHouse 组织配置到新的 GCP 承诺支出合约下。



## Azure Marketplace \\{#azure-marketplace\\}

### 取消 Azure 按需付费 (PAYG) 订阅的步骤 \\{#cancel-azure-payg\\}

1. **前往 [Microsoft Azure 门户](http://portal.azure.com)**
2. **在左侧导航中选择 “Subscriptions”（订阅）**
3. **找到您想要取消的活动 ClickHouse 订阅**
4. **取消订阅：**
    - 单击该 ClickHouse Cloud 订阅以打开订阅详情
    - 选择 “Cancel subscription” 按钮

> **注意：** 如需协助取消此订单，请在 Azure 门户中提交支持工单。

接下来，请按照这些[步骤](/cloud/billing/marketplace/azure-marketplace-committed-contract)将您的 ClickHouse 组织配置到新的 Azure 承诺消费合约。



## 将组织关联至承诺消费合同时的要求 \\{#linking-requirements\\}

> **注意：** 要将您的组织关联到云市场中的承诺消费合同：
> - 执行以下步骤的用户必须是要附加订阅的 ClickHouse 组织的管理员用户
> - 该组织的所有未支付发票必须先结清（如有任何问题，请联系 ClickHouse [支持](https://clickhouse.com/support/program)）