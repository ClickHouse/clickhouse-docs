---
'slug': '/cloud/billing/marketplace/azure-marketplace-committed-contract'
'title': 'Azure Marketplace 认可的合同'
'description': '通过 Azure Marketplace 订阅 ClickHouse Cloud (认可的合同)'
'keywords':
- 'Microsoft'
- 'Azure'
- 'marketplace'
- 'billing'
- 'committed'
- 'committed contract'
---

import Image from '@theme/IdealImage';
import azure_marketplace_committed_1 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-committed-1.png';
import azure_marketplace_committed_2 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-committed-2.png';
import azure_marketplace_committed_3 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-committed-3.png';
import azure_marketplace_committed_4 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-committed-4.png';
import azure_marketplace_committed_5 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-committed-5.png';
import azure_marketplace_committed_6 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-committed-6.png';
import azure_marketplace_committed_7 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-committed-7.png';
import azure_marketplace_committed_8 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-committed-8.png';
import azure_marketplace_committed_9 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-committed-9.png';
import aws_marketplace_payg_8 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-8.png';
import aws_marketplace_payg_9 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-9.png';
import azure_marketplace_payg_11 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-11.png';
import azure_marketplace_payg_12 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-12.png';

开始在 [Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps) 上通过承诺合同使用 ClickHouse Cloud。承诺合同，也称为私有报价，允许客户承诺在一段时间内在 ClickHouse Cloud 上花费一定金额。

## 先决条件 {#prerequisites}

- 来自 ClickHouse 的私有报价，基于特定的合同条款。

## 注册步骤 {#steps-to-sign-up}

1. 您应该收到一封包含查看和接受您私有报价的链接的电子邮件。

<br />

<Image img={azure_marketplace_committed_1} size="md" alt="Azure Marketplace 私有报价电子邮件" border/>

<br />

2. 点击电子邮件中的 **Review Private Offer** 链接。这将把您带到包含私有报价详情的 GCP Marketplace 页面。

<br />

<Image img={azure_marketplace_committed_2} size="md" alt="Azure Marketplace 私有报价详情" border/>

<br />

3. 一旦您接受报价，您将进入 **Private Offer Management** 页面。Azure 可能需要一些时间来准备购买报价。

<br />

<Image img={azure_marketplace_committed_3} size="md" alt="Azure Marketplace 私有报价管理页面" border/>

<br />

<Image img={azure_marketplace_committed_4} size="md" alt="Azure Marketplace 私有报价管理页面加载中" border/>

<br />

4. 等待几分钟后，刷新页面。报价应该准备完成 **Purchase**。

<br />

<Image img={azure_marketplace_committed_5} size="md" alt="Azure Marketplace 私有报价管理页面可购买" border/>

<br />

5. 点击 **Purchase** - 您将看到一个弹出窗口。完成以下内容：

<br />

- 订阅和资源组 
- 为 SaaS 订阅提供一个名称
- 选择您有私有报价的计费计划。只有创建私有报价时的期限（例如，1 年）才会有金额，而其他计费期限选项将为 $0。
- 选择是否希望进行循环计费。如果未选择循环计费，合同将在计费期结束时结束，资源将被设置为退役。
- 点击 **Review + subscribe**。

<br />

<Image img={azure_marketplace_committed_6} size="md" alt="Azure Marketplace 订阅表单" border/>

<br />

6. 在下一个屏幕上，检查所有详细信息并点击 **Subscribe**。

<br />

<Image img={azure_marketplace_committed_7} size="md" alt="Azure Marketplace 订阅确认" border/>

<br />

7. 在下一个屏幕上，您将看到 **Your SaaS subscription in progress**。

<br />

<Image img={azure_marketplace_committed_8} size="md" alt="Azure Marketplace 订阅提交页面" border/>

<br />

8. 一旦准备好，您可以点击 **Configure account now**。请注意，这是将 Azure 订阅绑定到您帐户的 ClickHouse Cloud 组织的关键步骤。如果没有此步骤，您的 Marketplace 订阅将不会完成。

<br />

<Image img={azure_marketplace_committed_9} size="md" alt="Azure Marketplace 立即配置帐户按钮" border/>

<br />

9. 您将被重定向到 ClickHouse Cloud 注册或登录页面。您可以使用新帐户注册或使用现有帐户登录。一旦您登录，将创建一个新的组织，准备通过 Azure Marketplace 进行使用和计费。

10. 在继续之前，您需要回答几个问题 - 地址和公司详情。

<br />

<Image img={aws_marketplace_payg_8} size="md" alt="ClickHouse Cloud 注册信息表单" border/>

<br />

<Image img={aws_marketplace_payg_9} size="md" alt="ClickHouse Cloud 注册信息表单 2" border/>

<br />

11. 一旦您点击 **Complete sign up**，您将被带到 ClickHouse Cloud 组织中，在那里您可以查看计费屏幕，以确保您通过 Azure Marketplace 付费并可以创建服务。

<br />

<br />

<Image img={azure_marketplace_payg_11} size="sm" alt="ClickHouse Cloud 注册信息表单" border/>

<br />

<br />

<Image img={azure_marketplace_payg_12} size="md" alt="ClickHouse Cloud 注册信息表单" border/>

<br />

如果您遇到任何问题，请随时联系 [我们的支持团队](https://clickhouse.com/support/program)。
