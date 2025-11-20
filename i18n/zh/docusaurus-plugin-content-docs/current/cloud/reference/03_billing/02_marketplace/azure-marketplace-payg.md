---
slug: /cloud/billing/marketplace/azure-marketplace-payg
title: 'Azure Marketplace 按需付费（PAYG）'
description: '通过 Azure Marketplace（按需付费，PAYG）订阅 ClickHouse Cloud。'
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

通过 [Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps) 上的按需付费（PAYG）公共优惠开始使用 ClickHouse Cloud。


## 前提条件 {#prerequisites}

- 由计费管理员授予购买权限的 Azure 项目。
- 要在 Azure Marketplace 上订阅 ClickHouse Cloud,必须使用具有购买权限的账户登录,并选择相应的项目。

1. 访问 [Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps) 并搜索 ClickHouse Cloud。请确保已登录,以便在市场上购买产品。

<br />

<Image
  img={azure_marketplace_payg_1}
  size='md'
  alt='ClickHouse Cloud 注册信息表单'
  border
/>

<br />

2. 在产品列表页面,点击 **Get It Now**。

<br />

<Image
  img={azure_marketplace_payg_2}
  size='md'
  alt='ClickHouse Cloud 注册信息表单'
  border
/>

<br />

3. 在下一个页面中,需要提供姓名、电子邮件和位置信息。

<br />

<Image
  img={azure_marketplace_payg_3}
  size='md'
  alt='ClickHouse Cloud 注册信息表单'
  border
/>

<br />

4. 在下一个页面,点击 **Subscribe**。

<br />

<Image
  img={azure_marketplace_payg_4}
  size='md'
  alt='ClickHouse Cloud 注册信息表单'
  border
/>

<br />

5. 在下一个页面,选择订阅、资源组和资源组位置。资源组位置不必与您计划在 ClickHouse Cloud 上部署服务的位置相同。

<br />

<Image
  img={azure_marketplace_payg_5}
  size='md'
  alt='ClickHouse Cloud 注册信息表单'
  border
/>

<br />

6. 还需要为订阅提供名称,并从可用选项中选择计费周期。可以选择将 **Recurring billing** 设置为开启或关闭。如果设置为"关闭",合同将在计费周期结束后终止,资源将被停用。

<br />

<Image
  img={azure_marketplace_payg_6}
  size='md'
  alt='ClickHouse Cloud 注册信息表单'
  border
/>

<br />

7. 点击 **"Review + subscribe"**。

8. 在下一个页面,确认所有信息无误后,点击 **Subscribe**。

<br />

<Image
  img={azure_marketplace_payg_7}
  size='md'
  alt='ClickHouse Cloud 注册信息表单'
  border
/>

<br />

9. 请注意,此时您已完成 ClickHouse Cloud 的 Azure 订阅,但尚未在 ClickHouse Cloud 上设置账户。接下来的步骤是必需且关键的,以便 ClickHouse Cloud 能够绑定到您的 Azure 订阅,从而通过 Azure Marketplace 正确计费。

<br />

<Image
  img={azure_marketplace_payg_8}
  size='md'
  alt='ClickHouse Cloud 注册信息表单'
  border
/>

<br />

10. Azure 设置完成后,**Configure account now** 按钮将变为可用状态。

<br />

<Image
  img={azure_marketplace_payg_9}
  size='md'
  alt='ClickHouse Cloud 注册信息表单'
  border
/>

<br />

11. 点击 **Configure account now**。

<br />

您将收到一封类似下图的电子邮件,其中包含配置账户的详细信息:

<br />

<Image
  img={azure_marketplace_payg_10}
  size='md'
  alt='ClickHouse Cloud 注册信息表单'
  border
/>

<br />

12. 您将被重定向到 ClickHouse Cloud 注册或登录页面。重定向后,可以使用现有账户登录,或注册新账户。此步骤非常重要,以便将您的 ClickHouse Cloud 组织绑定到 Azure Marketplace 计费。

13. 请注意,如果您是新用户,还需要提供一些业务基本信息。请参见下面的截图。

<br />

<Image
  img={aws_marketplace_payg_8}
  size='md'
  alt='ClickHouse Cloud 注册信息表单'
  border
/>

<br />

<Image
  img={aws_marketplace_payg_9}
  size='md'
  alt='ClickHouse Cloud 注册信息表单 2'
  border
/>

<br />

点击 **Complete sign up** 后,您将进入 ClickHouse Cloud 组织页面,在此可以查看计费页面以确认通过 Azure Marketplace 计费,并可以创建服务。

<br />

<br />

<Image
  img={azure_marketplace_payg_11}
  size='md'
  alt='ClickHouse Cloud 注册信息表单'
  border
/>

<br />

<br />

<Image
  img={azure_marketplace_payg_12}
  size='md'
  alt='ClickHouse Cloud 注册信息表单'
  border
/>


<br />

14. 如果遇到任何问题，请随时联系我们的[支持团队](https://clickhouse.com/support/program)。
