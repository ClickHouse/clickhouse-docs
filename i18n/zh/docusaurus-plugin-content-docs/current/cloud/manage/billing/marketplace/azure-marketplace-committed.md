---
'slug': '/cloud/billing/marketplace/azure-marketplace-committed-contract'
'title': 'Azure 市场承诺合同'
'description': '通过 Azure 市场（承诺合同）订阅 ClickHouse Cloud'
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

开始通过与 ClickHouse 签订的承诺合同在 [Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps) 上使用 ClickHouse Cloud。承诺合同，也称为私人报价，允许客户承诺在一段时间内在 ClickHouse Cloud 上花费一定金额。

## 先决条件 {#prerequisites}

- 根据特定合同条款从 ClickHouse 获取的私人报价。

## 注册步骤 {#steps-to-sign-up}

1. 您应该已经收到了一封带有链接的电子邮件，以查看和接受您的私人报价。

<br />

<Image img={azure_marketplace_committed_1} size="md" alt="Azure Marketplace private offer email" border/>

<br />

2. 点击电子邮件中的 **Review Private Offer** 链接。这将带您访问包含私人报价详情的 GCP Marketplace 页面。

<br />

<Image img={azure_marketplace_committed_2} size="md" alt="Azure Marketplace private offer details" border/>

<br />

3. 一旦您接受报价，您将被带到 **Private Offer Management** 屏幕。Azure 可能需要一些时间来准备购买该报价。

<br />

<Image img={azure_marketplace_committed_3} size="md" alt="Azure Marketplace Private Offer Management page" border/>

<br />

<Image img={azure_marketplace_committed_4} size="md" alt="Azure Marketplace Private Offer Management page loading" border/>

<br />

4. 几分钟后，刷新页面。该报价应准备好 **Purchase**。

<br />

<Image img={azure_marketplace_committed_5} size="md" alt="Azure Marketplace Private Offer Management page purchase enabled" border/>

<br />

5. 点击 **Purchase** - 您将看到一个弹出窗口。完成以下内容：

<br />

- 订阅和资源组 
- 为 SaaS 订阅提供一个名称
- 选择您有私人报价的计费计划。只有创建私有报价的期限（例如，1 年）将有相应的金额。其他计费期限选项的金额将为 $0。 
- 选择您是否希望设置递归计费。如果不选择递归计费，合同将在计费期结束时终止，资源将被设定为退役。
- 点击 **Review + subscribe**。

<br />

<Image img={azure_marketplace_committed_6} size="md" alt="Azure Marketplace subscription form" border/>

<br />

6. 在下一个屏幕上，审核所有细节，然后点击 **Subscribe**。

<br />

<Image img={azure_marketplace_committed_7} size="md" alt="Azure Marketplace subscription confirmation" border/>

<br />

7. 在下一个屏幕上，您将看到 **Your SaaS subscription in progress**。

<br />

<Image img={azure_marketplace_committed_8} size="md" alt="Azure Marketplace subscription submitting page" border/>

<br />

8. 一旦准备就绪，您可以点击 **Configure account now**。请注意，这是将 Azure 订阅与您帐户的 ClickHouse Cloud 组织绑定的重要步骤。没有这一步，您的 Marketplace 订阅将不完整。

<br />

<Image img={azure_marketplace_committed_9} size="md" alt="Azure Marketplace configure account now button" border/>

<br />

9. 您将被重定向到 ClickHouse Cloud 注册或登录页面。您可以选择使用新账户注册或使用现有账户登录。登录后，将创建一个新组织，准备通过 Azure Marketplace 使用和计费。

10. 在您继续之前，您需要回答一些问题 - 地址和公司详细信息。

<br />

<Image img={aws_marketplace_payg_8} size="md" alt="ClickHouse Cloud sign up info form" border/>

<br />

<Image img={aws_marketplace_payg_9} size="md" alt="ClickHouse Cloud sign up info form 2" border/>

<br />

11. 一旦您点击 **Complete sign up**，您将被带到 ClickHouse Cloud 中的组织，在那里您可以查看计费屏幕，以确保通过 Azure Marketplace 进行计费并可以创建服务。

<br />

<br />

<Image img={azure_marketplace_payg_11} size="sm" alt="ClickHouse Cloud sign up info form" border/>

<br />

<br />

<Image img={azure_marketplace_payg_12} size="md" alt="ClickHouse Cloud sign up info form" border/>

<br />

如果您遇到任何问题，请随时联系 [我们的支持团队](https://clickhouse.com/support/program)。
