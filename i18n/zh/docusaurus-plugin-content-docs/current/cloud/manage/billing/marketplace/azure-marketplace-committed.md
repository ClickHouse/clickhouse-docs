---
'slug': '/cloud/billing/marketplace/azure-marketplace-committed-contract'
'title': 'Azure Marketplace Committed Contract'
'description': 'Subscribe to ClickHouse Cloud through the Azure Marketplace (Committed
  Contract)'
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

开始使用 [Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps) 上的 ClickHouse Cloud，通过一个承诺合同。承诺合同，也称为私人报价，允许客户在一段时间内承诺在 ClickHouse Cloud 上花费一定金额。

## 前提条件 {#prerequisites}

- 一份基于特定合同条款的 ClickHouse 私人报价。

## 注册步骤 {#steps-to-sign-up}

1. 您应该已经收到了一封带有链接的电子邮件，以查看和接受您的私人报价。

<br />

<Image img={azure_marketplace_committed_1} size="md" alt="Azure Marketplace 私人报价邮件" border/>

<br />

2. 点击电子邮件中的 **Review Private Offer** 链接。这将带您到您的 GCP Marketplace 页面，其中包含私人报价的详细信息。

<br />

<Image img={azure_marketplace_committed_2} size="md" alt="Azure Marketplace 私人报价详情" border/>

<br />

3. 一旦您接受报价，您将被带到 **Private Offer Management** 屏幕。Azure 可能需要一些时间来准备购买报价。

<br />

<Image img={azure_marketplace_committed_3} size="md" alt="Azure Marketplace 私人报价管理页面" border/>

<br />

<Image img={azure_marketplace_committed_4} size="md" alt="Azure Marketplace 私人报价管理页面加载中" border/>

<br />

4. 几分钟后，刷新页面。该报价应该已准备好进行 **Purchase**。

<br />

<Image img={azure_marketplace_committed_5} size="md" alt="Azure Marketplace 私人报价管理页面可购买" border/>

<br />

5. 点击 **Purchase** - 您将看到一个弹出窗口。完成以下内容：

<br />

- 订阅和资源组 
- 为 SaaS 订阅提供一个名称
- 选择您拥有私人报价的计费计划。只有私人报价创建时的条款（例如，1 年）将有金额。其他计费条款选项将为 $0 金额。
- 选择是否希望定期计费。如果未选择定期计费，合同将在计费周期结束时结束，资源将被设置为退役。
- 点击 **Review + subscribe**。

<br />

<Image img={azure_marketplace_committed_6} size="md" alt="Azure Marketplace 订阅表单" border/>

<br />

6. 在下一屏上，查看所有详细信息并点击 **Subscribe**。

<br />

<Image img={azure_marketplace_committed_7} size="md" alt="Azure Marketplace 订阅确认" border/>

<br />

7. 在下一屏上，您将看到 **Your SaaS subscription in progress**。

<br />

<Image img={azure_marketplace_committed_8} size="md" alt="Azure Marketplace 订阅提交页面" border/>

<br />

8. 一旦准备好，您可以点击 **Configure account now**。请注意，这是将 Azure 订阅绑定到您的 ClickHouse Cloud 组织的关键步骤。如果不执行此步骤，您的 Marketplace 订阅将不完整。

<br />

<Image img={azure_marketplace_committed_9} size="md" alt="Azure Marketplace 立即配置帐户按钮" border/>

<br />

9. 您将被重定向到 ClickHouse Cloud 注册或登录页面。您可以选择使用新帐户注册或使用现有帐户登录。登录后，将创建一个新的组织，可以通过 Azure Marketplace 进行使用和计费。

10. 在继续之前，您需要回答一些问题 - 地址和公司详细信息。

<br />

<Image img={aws_marketplace_payg_8} size="md" alt="ClickHouse Cloud 注册信息表单" border/>

<br />

<Image img={aws_marketplace_payg_9} size="md" alt="ClickHouse Cloud 注册信息表单 2" border/>

<br />

11. 一旦您点击 **Complete sign up**，您将被带到 ClickHouse Cloud 中的您的组织，您可以查看计费页面，以确保您通过 Azure Marketplace 进行计费并可以创建服务。

<br />

<br />

<Image img={azure_marketplace_payg_11} size="sm" alt="ClickHouse Cloud 注册信息表单" border/>

<br />

<br />

<Image img={azure_marketplace_payg_12} size="md" alt="ClickHouse Cloud 注册信息表单" border/>

<br />

如果您遇到任何问题，请随时联系 [我们的支持团队](https://clickhouse.com/support/program)。
