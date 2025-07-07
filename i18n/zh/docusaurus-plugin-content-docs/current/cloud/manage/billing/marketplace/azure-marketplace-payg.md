---
'slug': '/cloud/billing/marketplace/azure-marketplace-payg'
'title': 'Azure Marketplace PAYG'
'description': '通过 Azure Marketplace (PAYG) 订阅 ClickHouse Cloud。'
'keywords':
- 'azure'
- 'marketplace'
- 'billing'
- 'PAYG'
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

开始在 [Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps) 上通过 PAYG（按需付费）公共报价使用 ClickHouse Cloud。

## 先决条件 {#prerequisites}

- 由您的账单管理员启用购买权限的 Azure 项目。
- 要在 Azure Marketplace 上订阅 ClickHouse Cloud，您必须使用具有购买权限的帐户登录并选择适当的项目。

1. 访问 [Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps) 并搜索 ClickHouse Cloud。确保您已登录，以便可以在市场上购买产品。

<br />

<Image img={azure_marketplace_payg_1} size="md" alt="ClickHouse Cloud 注册信息表单" border/>

<br />

2. 在产品列表页面，点击 **立即获取**。

<br />

<Image img={azure_marketplace_payg_2} size="md" alt="ClickHouse Cloud 注册信息表单" border/>

<br />

3. 在下一个屏幕上，您需要提供姓名、电子邮件和位置信息。

<br />

<Image img={azure_marketplace_payg_3} size="md" alt="ClickHouse Cloud 注册信息表单" border/>

<br />

4. 在下一个屏幕上，点击 **订阅**。

<br />

<Image img={azure_marketplace_payg_4} size="md" alt="ClickHouse Cloud 注册信息表单" border/>

<br />

5. 在下一个屏幕上，选择订阅、资源组和资源组位置。资源组位置不必与您打算在 ClickHouse Cloud 上启动服务的位置相同。

<br />

<Image img={azure_marketplace_payg_5} size="md" alt="ClickHouse Cloud 注册信息表单" border/>

<br />

6. 您还需要为订阅提供一个名称，并从可用选项中选择计费条款。您可以选择将 **循环计费** 设置为开启或关闭。如果您将其设置为“关闭”，您的合同将在计费期结束后终止，您的资源将被退役。

<br />

<Image img={azure_marketplace_payg_6} size="md" alt="ClickHouse Cloud 注册信息表单" border/>

<br />

7. 点击 **“查看 + 订阅”**。

8. 在下一个屏幕上，确认一切看起来正确，然后点击 **订阅**。

<br />

<Image img={azure_marketplace_payg_7} size="md" alt="ClickHouse Cloud 注册信息表单" border/>

<br />

9. 请注意，此时您已经订阅了 ClickHouse Cloud 的 Azure 订阅，但尚未在 ClickHouse Cloud 上设置您的帐户。接下来的步骤是必要且关键的，以便 ClickHouse Cloud 能够绑定到您的 Azure 订阅，以便通过 Azure 市场正确进行计费。

<br />

<Image img={azure_marketplace_payg_8} size="md" alt="ClickHouse Cloud 注册信息表单" border/>

<br />

10. 一旦 Azure 设置完成，**现在配置帐户** 按钮将变为活跃状态。

<br />

<Image img={azure_marketplace_payg_9} size="md" alt="ClickHouse Cloud 注册信息表单" border/>

<br />

11. 点击 **现在配置帐户**。

<br />

您将收到一封电子邮件，内容如下，内含有关配置您的帐户的详细信息：

<br />

<Image img={azure_marketplace_payg_10} size="md" alt="ClickHouse Cloud 注册信息表单" border/>

<br />

12. 您将被重定向到 ClickHouse Cloud 注册或登录页面。您可以使用新帐户注册或使用现有帐户登录。一旦登录，将创建一个新组织，可以通过 Azure Marketplace 进行使用和计费。

13. 在继续之前，您需要回答几个问题 - 地址和公司信息。

<br />

<Image img={aws_marketplace_payg_8} size="md" alt="ClickHouse Cloud 注册信息表单" border/>

<br />

<Image img={aws_marketplace_payg_9} size="md" alt="ClickHouse Cloud 注册信息表单 2" border/>

<br />

14. 一旦您点击 **完成注册**，您将被带到 ClickHouse Cloud 内的组织，您可以查看计费屏幕，以确保通过 Azure Marketplace 进行计费并创建服务。

<br />

<br />

<Image img={azure_marketplace_payg_11} size="md" alt="ClickHouse Cloud 注册信息表单" border/>

<br />

<br />

<Image img={azure_marketplace_payg_12} size="md" alt="ClickHouse Cloud 注册信息表单" border/>

<br />

15. 如果您遇到任何问题，请随时联系 [我们的支持团队](https://clickhouse.com/support/program)。
