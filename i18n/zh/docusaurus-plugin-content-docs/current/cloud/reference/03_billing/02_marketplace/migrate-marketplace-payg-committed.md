---
'slug': '/cloud/billing/marketplace/migrate'
'title': '将计费从按需付费 (PAYG) 迁移到云市场中的承诺支出合同'
'description': '从按需付费迁移到承诺支出合同。'
'keywords':
- 'marketplace'
- 'billing'
- 'PAYG'
- 'pay-as-you-go'
- 'committed spend contract'
'doc_type': 'guide'
---


# 将账单从按需支付 (PAYG) 迁移到云市场中的承诺支出合同 {#migrate-payg-to-committed}

如果您的 ClickHouse 组织当前通过活跃的云市场按需支付 (PAYG) 订阅（或订单）进行计费，并且您希望通过同一云市场迁移到通过承诺支出合同进行计费，请接受您的新报价，然后根据您的云服务提供商遵循以下步骤。

## 重要说明 {#important-notes}

请注意，取消您的市场 PAYG 订阅不会删除您的 ClickHouse Cloud 账户 - 仅删除通过市场的计费关系。一旦取消，我们的系统将停止通过市场对 ClickHouse Cloud 服务的计费。（注意：此过程不是立即的，可能需要几分钟才能完成）。

在您的市场订阅取消后，如果您的 ClickHouse 组织有保存的信用卡，我们将在您的计费周期结束时收费 - 除非在此之前连接了新的市场订阅。

如果在取消后没有配置信用卡，您将有 14 天的时间为您的组织添加有效的信用卡或新的云市场订阅。如果在该期间内未配置付款方式，您的服务将被暂停，并且您的组织将被视为不符合 [计费合规性](/manage/clickhouse-cloud-billing-compliance)。

任何在订阅取消后产生的使用费用将按照顺序计入下一个配置的有效付款方式 - 预付信用卡、市场订阅或信用卡。

如有任何问题或需要帮助配置您的组织到新的市场订阅，请联系 ClickHouse [支持](https://clickhouse.com/support/program) 寻求帮助。

## AWS Marketplace {#aws-marketplace}

如果您希望使用相同的 AWS 账户 ID 将您的 PAYG 订阅迁移到承诺支出合同，则我们推荐的方法是 [联系销售](https://clickhouse.com/company/contact) 进行此变更。这样做意味着不需要额外的步骤，并且不会对您的 ClickHouse 组织或服务造成干扰。

如果您希望使用不同的 AWS 账户 ID 将您的 ClickHouse 组织从 PAYG 订阅迁移到承诺支出合同，请按照以下步骤进行：

### 取消 AWS PAYG 订阅的步骤 {#cancel-aws-payg}

1. **前往 [AWS Marketplace](https://us-east-1.console.aws.amazon.com/marketplace)**
2. **点击“管理订阅”按钮**
3. **导航到“您的订阅”：**
    - 点击“管理订阅”
4. **在列表中找到 ClickHouse Cloud：**
    - 在“您的订阅”下查找并点击 ClickHouse Cloud
5. **取消订阅：**
    - 在“协议”下点击 ClickHouse Cloud 列表旁边的“操作”下拉菜单或按钮
    - 选择“取消订阅”

> **注意：** 如需帮助取消您的订阅（例如，如果取消订阅按钮不可用），请联系 [AWS 支持](https://support.console.aws.amazon.com/support/home#/)。

接下来，请遵循这些 [步骤](/cloud/billing/marketplace/aws-marketplace-committed-contract) 将您的 ClickHouse 组织配置为您接受的新 AWS 承诺支出合同。

## GCP Marketplace {#gcp-marketplace}

### 取消 GCP PAYG 订单的步骤 {#cancel-gcp-payg}

1. **前往您的 [Google Cloud Marketplace 控制台](https://console.cloud.google.com/marketplace)：**
    - 确保您已登录到正确的 GCP 账户并选择了适当的项目
2. **找到您的 ClickHouse 订单：**
    - 在左侧菜单中，点击“您的订单”
    - 在活动订单列表中找到正确的 ClickHouse 订单
3. **取消订单：**
    - 找到您订单右侧的三个点菜单，并按照说明取消 ClickHouse 订单

> **注意：** 如需帮助取消此订单，请联系 [GCP 支持](https://cloud.google.com/support/docs/get-billing-support)。

接下来，请遵循这些 [步骤](/cloud/billing/marketplace/gcp-marketplace-committed-contract) 将您的 ClickHouse 组织配置为您的新 GCP 承诺支出合同。

## Azure Marketplace {#azure-marketplace}

### 取消 Azure PAYG 订阅的步骤 {#cancel-azure-payg}

1. **前往 [Microsoft Azure 门户](http://portal.azure.com)**
2. **导航到“订阅”**
3. **找到您要取消的活动 ClickHouse 订阅**
4. **取消订阅：**
    - 点击 ClickHouse Cloud 订阅以打开订阅详情
    - 选择“取消订阅”按钮

> **注意：** 如需帮助取消此订单，请在您的 Azure 门户中打开支持票。

接下来，请遵循这些 [步骤](/cloud/billing/marketplace/azure-marketplace-committed-contract) 将您的 ClickHouse 组织配置为您新的 Azure 承诺支出合同。

## 连接到承诺支出合同的要求 {#linking-requirements}

> **注意：** 为了将您的组织连接到市场承诺支出合同：
> - 跟随步骤的用户必须是您要连接订阅的 ClickHouse 组织的管理员用户
> - 组织中的所有未付款发票必须已支付（如有任何问题，请联系 ClickHouse [支持](https://clickhouse.com/support/program)）。
