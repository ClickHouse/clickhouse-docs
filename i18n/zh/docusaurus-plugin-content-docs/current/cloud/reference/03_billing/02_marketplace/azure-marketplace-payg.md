---
'slug': '/cloud/billing/marketplace/azure-marketplace-payg'
'title': 'Azure Marketplace PAYG'
'description': '通过 Azure Marketplace (PAYG) 订阅 ClickHouse Cloud。'
'keywords':
- 'azure'
- 'marketplace'
- 'billing'
- 'PAYG'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import azure_marketplace_payg_1 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-1.png';
import azure_marketplace_payg_2 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-2.png';
import azure_marketplace_payg_3 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-3.png';
import azure_marketplace_payg_4 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-4.png';
import azure_marketplace_payg_5 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-5.png';
import azure_marketplace_payg_6 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-6.png';
import azure_marketplace_payg_7 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-7.png';
import azure_marketplace_payg_8 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-8.png';
import azure_marketplace_payg_9 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-9.png';
import azure_marketplace_payg_10 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-10.png';
import aws_marketplace_payg_8 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-8.png';
import aws_marketplace_payg_9 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-9.png';
import azure_marketplace_payg_11 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-11.png';
import azure_marketplace_payg_12 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-12.png';

开始使用 ClickHouse Cloud，通过 [Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps) 的 PAYG（按需付费）公共报价。

## 前提条件 {#prerequisites}

- 一个由您的账单管理员启用购买权限的 Azure 项目。
- 要在 Azure Marketplace 订阅 ClickHouse Cloud，您必须使用具有购买权限的帐户登录，并选择适当的项目。

1. 前往 [Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps)，搜索 ClickHouse Cloud。确保您已登录，以便您可以在市场上购买产品。

<br />

<Image img={azure_marketplace_payg_1} size="md" alt="ClickHouse Cloud sign up info form" border/>

<br />

2. 在产品列表页面，点击 **立即获取**。

<br />

<Image img={azure_marketplace_payg_2} size="md" alt="ClickHouse Cloud sign up info form" border/>

<br />

3. 在下一个屏幕上，您需要提供名称、电子邮件和位置信息。

<br />

<Image img={azure_marketplace_payg_3} size="md" alt="ClickHouse Cloud sign up info form" border/>

<br />

4. 在下一个屏幕上，点击 **订阅**。

<br />

<Image img={azure_marketplace_payg_4} size="md" alt="ClickHouse Cloud sign up info form" border/>

<br />

5. 在下一个屏幕上，选择订阅、资源组和资源组位置。资源组位置不必与您打算在 ClickHouse Cloud 上启动服务的位置相同。

<br />

<Image img={azure_marketplace_payg_5} size="md" alt="ClickHouse Cloud sign up info form" border/>

<br />

6. 您还需要为订阅提供一个名称，并从可用选项中选择计费条款。您可以选择将 **定期计费** 设置为开启或关闭。如果您将其设置为 "关闭"，则您的合同将在计费周期结束后结束，您的资源将被停用。

<br />

<Image img={azure_marketplace_payg_6} size="md" alt="ClickHouse Cloud sign up info form" border/>

<br />

7. 点击 **"审核 + 订阅"**。

8. 在下一个屏幕上，确认一切无误后，点击 **订阅**。

<br />

<Image img={azure_marketplace_payg_7} size="md" alt="ClickHouse Cloud sign up info form" border/>

<br />

9. 注意，此时您已经订阅了 ClickHouse Cloud 的 Azure 订阅，但还没有在 ClickHouse Cloud 上设置您的帐户。接下来的步骤是必要且关键的，以便 ClickHouse Cloud 能够绑定到您的 Azure 订阅，从而通过 Azure 市场正确进行计费。

<br />

<Image img={azure_marketplace_payg_8} size="md" alt="ClickHouse Cloud sign up info form" border/>

<br />

10. 一旦 Azure 设置完成，**立即配置帐户** 按钮应变为可用。

<br />

<Image img={azure_marketplace_payg_9} size="md" alt="ClickHouse Cloud sign up info form" border/>

<br />

11. 点击 **立即配置帐户**。

<br />

您将收到类似于以下内容的电子邮件，邮件中包含配置您帐户的详细信息：

<br />

<Image img={azure_marketplace_payg_10} size="md" alt="ClickHouse Cloud sign up info form" border/>

<br />

12. 您将被重定向到 ClickHouse Cloud 注册或登录页面。一旦您重定向到 ClickHouse Cloud，您可以使用现有帐户登录，或注册新帐户。此步骤非常重要，以便我们可以将您的 ClickHouse Cloud 组织与 Azure Marketplace 计费绑定。

13. 注意，如果您是新用户，您还需要提供一些关于您业务的基本信息。请查看下面的截图。

<br />

<Image img={aws_marketplace_payg_8} size="md" alt="ClickHouse Cloud sign up info form" border/>

<br />

<Image img={aws_marketplace_payg_9} size="md" alt="ClickHouse Cloud sign up info form 2" border/>

<br />

一旦您点击 **完成注册**，您将进入 ClickHouse Cloud 内的您的组织，在那里您可以查看计费屏幕，以确保您通过 Azure Marketplace 进行计费并可以创建服务。

<br />

<br />

<Image img={azure_marketplace_payg_11} size="md" alt="ClickHouse Cloud sign up info form" border/>

<br />

<br />

<Image img={azure_marketplace_payg_12} size="md" alt="ClickHouse Cloud sign up info form" border/>

<br />

14. 如果您遇到任何问题，请随时联系 [我们的支持团队](https://clickhouse.com/support/program)。
