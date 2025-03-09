---
slug: /cloud/billing/marketplace/azure-marketplace-payg
title: Azure Marketplace PAYG
description: 通过 Azure Marketplace (按需付费) 订阅 ClickHouse Cloud。
keywords: [azure, marketplace, billing, PAYG]
---

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

开始使用 ClickHouse Cloud 的 [Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps)，通过 PAYG（按需付费）公共报价。

## 先决条件 {#prerequisites}

- 一个由您的计费管理员启用购买权限的 Azure 项目。
- 要在 Azure Marketplace 订阅 ClickHouse Cloud，您必须使用具有购买权限的帐户登录并选择适当的项目。

1. 前往 [Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps)，搜索 ClickHouse Cloud。确保您已登录，以便可以在市场上购买服务。

<br />

<img src={azure_marketplace_payg_1}
    alt='ClickHouse Cloud 注册信息表单'
    class='image'
    style={{width: '300px'}}
 />

<br />

2. 在产品列表页面，单击 **立即获取**。

<br />

<img src={azure_marketplace_payg_2}
    alt='ClickHouse Cloud 注册信息表单'
    class='image'
    style={{width: '500px'}}
 />

<br />

3. 在下一个页面上，您需要提供名称、电子邮件和位置信息。

<br />

<img src={azure_marketplace_payg_3}
    alt='ClickHouse Cloud 注册信息表单'
    class='image'
    style={{width: '400px'}}
 />

<br />

4. 在下一个页面上，单击 **订阅**。

<br />

<img src={azure_marketplace_payg_4}
    alt='ClickHouse Cloud 注册信息表单'
    class='image'
    style={{width: '400px'}}
 />

<br />

5. 在下一个页面上，选择订阅、资源组和资源组位置。资源组位置不必与您打算在 ClickHouse Cloud 启动服务的位置相同。

<br />

<img src={azure_marketplace_payg_5}
    alt='ClickHouse Cloud 注册信息表单'
    class='image'
    style={{width: '500px'}}
 />

<br />

6. 您还需要为订阅提供名称，并从可用选项中选择计费条款。您可以选择将 **定期计费** 设置为开或关。如果您将其设置为“关”，则合同将在计费条款结束后终止，您的资源将被停用。

<br />

<img src={azure_marketplace_payg_6}
    alt='ClickHouse Cloud 注册信息表单'
    class='image'
    style={{width: '500px'}}
 />

<br />

7. 点击 **"审核 + 订阅"**。

8. 在下一个页面上，确认一切看起来正常，然后点击 **订阅**。

<br />

<img src={azure_marketplace_payg_7}
    alt='ClickHouse Cloud 注册信息表单'
    class='image'
    style={{width: '400px'}}
 />

<br />

9. 请注意，此时您已订阅 ClickHouse Cloud 的 Azure 订阅，但尚未在 ClickHouse Cloud 上设置帐户。接下来的步骤是必需且至关重要的，以便 ClickHouse Cloud 能够绑定到您的 Azure 订阅，以便通过 Azure marketplace 进行正确计费。

<br />

<img src={azure_marketplace_payg_8}
    alt='ClickHouse Cloud 注册信息表单'
    class='image'
    style={{width: '500px'}}
 />

<br />

10. 一旦 Azure 设置完成，**立即配置帐户**按钮将变为可用。

<br />

<img src={azure_marketplace_payg_9}
    alt='ClickHouse Cloud 注册信息表单'
    class='image'
    style={{width: '400px'}}
 />

<br />

11. 点击 **立即配置帐户**。

<br />

您将收到类似于以下内容的电子邮件，其中包含有关配置帐户的详细信息：

<br />

<img src={azure_marketplace_payg_10}
    alt='ClickHouse Cloud 注册信息表单'
    class='image'
    style={{width: '400px'}}
 />

<br />

12. 您将被重定向到 ClickHouse Cloud 注册或登录页面。您可以选择使用新帐户注册或使用现有帐户登录。登录后，将创建一个新组织，可以通过 Azure Marketplace 使用并计费。

13. 在继续之前，您需要回答几个问题 - 地址和公司详细信息。

<br />

<img src={aws_marketplace_payg_8}
    alt='ClickHouse Cloud 注册信息表单'
    class='image'
    style={{width: '400px'}}
 />

<br />

<img src={aws_marketplace_payg_9}
    alt='ClickHouse Cloud 注册信息表单 2'
    class='image'
    style={{width: '400px'}}
 />

<br />

14. 一旦您点击 **完成注册**，您将被带到 ClickHouse Cloud 内的组织，在这里您可以查看计费屏幕，以确保您通过 Azure Marketplace 进行计费并可以创建服务。

<br />

<br />

<img src={azure_marketplace_payg_11}
    alt='ClickHouse Cloud 注册信息表单'
    class='image'
    style={{width: '300px'}}
 />

<br />

<br />

<img src={azure_marketplace_payg_12}
    alt='ClickHouse Cloud 注册信息表单'
    class='image'
    style={{width: '500px'}}
 />

<br />

15. 如果您遇到任何问题，请随时联系 [我们的支持团队](https://clickhouse.com/support/program)。
