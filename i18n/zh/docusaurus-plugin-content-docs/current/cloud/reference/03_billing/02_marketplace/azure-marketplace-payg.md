---
slug: /cloud/billing/marketplace/azure-marketplace-payg
title: 'Azure Marketplace 按需付费（PAYG）'
description: '通过 Azure Marketplace（PAYG）订阅 ClickHouse Cloud。'
keywords: ['azure', 'marketplace', 'billing', 'PAYG']
doc_type: 'guide'
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

在 [Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps) 上通过按需付费（PAYG，按使用量付费）的公共方案开始使用 ClickHouse Cloud。


## 先决条件 {#prerequisites}

- 一个已由计费管理员授予购买权限的 Azure 项目。
- 若要在 Azure Marketplace 中订阅 ClickHouse Cloud，必须使用具有购买权限的账户登录，并选择相应的项目。

1. 前往 [Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps) 并搜索 ClickHouse Cloud。请确保已登录，这样才能在 Marketplace 上购买产品。

<br />

<Image img={azure_marketplace_payg_1} size="md" alt="ClickHouse Cloud 注册信息表单" border/>

<br />

2. 在产品列表页面中，点击 **Get It Now**。

<br />

<Image img={azure_marketplace_payg_2} size="md" alt="ClickHouse Cloud 注册信息表单" border/>

<br />

3. 在下一个界面中，您需要提供姓名、电子邮件和所在位置等信息。

<br />

<Image img={azure_marketplace_payg_3} size="md" alt="ClickHouse Cloud 注册信息表单" border/>

<br />

4. 在下一个界面中，点击 **Subscribe**。

<br />

<Image img={azure_marketplace_payg_4} size="md" alt="ClickHouse Cloud 注册信息表单" border/>

<br />

5. 在下一个界面中，选择订阅、资源组和资源组位置。资源组位置不必与您计划在 ClickHouse Cloud 中启动服务的位置相同。

<br />

<Image img={azure_marketplace_payg_5} size="md" alt="ClickHouse Cloud 注册信息表单" border/>

<br />

6. 您还需要为该订阅提供一个名称，并从可用选项中选择计费周期。您可以选择将 **Recurring billing** 设置为开启或关闭。如果将其设置为“off”，则在计费周期结束后，您的合同将终止，相关资源将被回收。

<br />

<Image img={azure_marketplace_payg_6} size="md" alt="ClickHouse Cloud 注册信息表单" border/>

<br />

7. 点击 **"Review + subscribe"**。

8. 在下一个界面中，核实所有信息无误后，点击 **Subscribe**。

<br />

<Image img={azure_marketplace_payg_7} size="md" alt="ClickHouse Cloud 注册信息表单" border/>

<br />

9. 注意，此时您已经订阅了 ClickHouse Cloud 的 Azure 订阅，但尚未在 ClickHouse Cloud 上完成账户设置。接下来的步骤是必需且关键的，用于让 ClickHouse Cloud 绑定到您的 Azure 订阅，从而通过 Azure Marketplace 正确进行计费。

<br />

<Image img={azure_marketplace_payg_8} size="md" alt="ClickHouse Cloud 注册信息表单" border/>

<br />

10. 一旦 Azure 端配置完成，**Configure account now** 按钮将变为可用状态。

<br />

<Image img={azure_marketplace_payg_9} size="md" alt="ClickHouse Cloud 注册信息表单" border/>

<br />

11. 点击 **Configure account now**。

<br />

您将收到一封类似下图的电子邮件，其中包含有关配置账户的详细信息：

<br />

<Image img={azure_marketplace_payg_10} size="md" alt="ClickHouse Cloud 注册信息表单" border/>

<br />

12. 您会被重定向到 ClickHouse Cloud 的注册或登录页面。重定向到 ClickHouse Cloud 后，您可以使用现有账户登录，或注册一个新账户。此步骤非常重要，用于将您的 ClickHouse Cloud 组织与 Azure Marketplace 的计费绑定起来。

13. 请注意，如果您是新用户，还需要提供一些有关您业务的基本信息。请参见下方截图。

<br />

<Image img={aws_marketplace_payg_8} size="md" alt="ClickHouse Cloud 注册信息表单" border/>

<br />

<Image img={aws_marketplace_payg_9} size="md" alt="ClickHouse Cloud 注册信息表单 2" border/>

<br />

当您点击 **Complete sign up** 后，将进入您在 ClickHouse Cloud 中的组织，在那里可以查看计费页面，以确认您是通过 Azure Marketplace 计费，并且可以创建服务。

<br />

<br />

<Image img={azure_marketplace_payg_11} size="md" alt="ClickHouse Cloud 注册信息表单" border/>

<br />

<br />

<Image img={azure_marketplace_payg_12} size="md" alt="ClickHouse Cloud 注册信息表单" border/>



<br />

14. 如果您遇到任何问题，欢迎随时联系[我们的支持团队](https://clickhouse.com/support/program)。
