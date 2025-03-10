---
slug: /cloud/billing/marketplace/azure-marketplace-committed-contract
title: Azure Marketplace 承诺合同
description: 通过 Azure Marketplace （承诺合同）订阅 ClickHouse Cloud
keywords: [Microsoft, Azure, marketplace, billing, committed, committed contract]
---

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

通过承诺合同在 [Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps) 开始使用 ClickHouse Cloud。承诺合同，也称为私人优惠，允许客户承诺在一段时间内在 ClickHouse Cloud 上支出一定金额。

## 先决条件 {#prerequisites}

- 基于特定合同条款的 ClickHouse 私人优惠。

## 注册步骤 {#steps-to-sign-up}

1. 您应该已经收到了一封包含审查和接受您的私人优惠链接的电子邮件。

<br />

<img src={azure_marketplace_committed_1}
    alt='Azure Marketplace 私人优惠电子邮件'
    class='image'
    style={{width: '400px'}}
/>

<br />

2. 点击电子邮件中的 **审查私人优惠** 链接。这将带您进入您的 GCP Marketplace 页面，其中包含私人优惠的详细信息。

<br />

<img src={azure_marketplace_committed_2}
    alt='Azure Marketplace 私人优惠详细信息'
    class='image'
    style={{width: '600px'}}
/>

<br />

3. 一旦您接受优惠，您将被带到 **私人优惠管理** 屏幕。Azure 可能需要一些时间来准备购买优惠。

<br />

<img src={azure_marketplace_committed_3}
    alt='Azure Marketplace 私人优惠管理页面'
    class='image'
    style={{width: '600px'}}
/>

<br />

<img src={azure_marketplace_committed_4}
    alt='Azure Marketplace 私人优惠管理页面加载'
    class='image'
    style={{width: '600px'}}
/>

<br />

4. 几分钟后，刷新页面。优惠应该准备好 **购买**。

<br />

<img src={azure_marketplace_committed_5}
    alt='Azure Marketplace 私人优惠管理页面购买启用'
    class='image'
    style={{width: '500px'}}
/>

<br />

5. 点击 **购买** - 您将看到一个弹出窗口。完成以下内容：

<br />

- 订阅和资源组 
- 为 SaaS 订阅提供一个名称
- 选择您有私人优惠的账单计划。只有私人优惠创建的条款（例如，1 年）才会针对其附有金额。其他账单条款选项将为 $0 数额。 
- 选择是否希望启用重复计费。如果未选择重复计费，则合同将在计费周期结束时结束，并且资源将被设置为停用。
- 点击 **审查 + 订阅**。

<br />

<img src={azure_marketplace_committed_6}
    alt='Azure Marketplace 订阅表单'
    class='image'
    style={{width: '500px'}}
/>

<br />

6. 在下一个屏幕上，查看所有详细信息，然后点击 **订阅**。

<br />

<img src={azure_marketplace_committed_7}
    alt='Azure Marketplace 订阅确认'
    class='image'
    style={{width: '500px'}}
/>

<br />

7. 在下一个屏幕上，您将看到 **您的 SaaS 订阅正在进行中**。

<br />

<img src={azure_marketplace_committed_8}
    alt='Azure Marketplace 订阅提交页面'
    class='image'
    style={{width: '500px'}}
/>

<br />

8. 一旦准备就绪，您可以点击 **立即配置账户**。请注意，这是一个关键步骤，将 Azure 订阅绑定到您账户的 ClickHouse Cloud 组织。没有此步骤，您的 Marketplace 订阅将不完整。

<br />

<img src={azure_marketplace_committed_9}
    alt='Azure Marketplace 立即配置账户按钮'
    class='image'
    style={{width: '400px'}}
/>

<br />

9. 您将被重定向到 ClickHouse Cloud 注册或登录页面。您可以使用新账户注册或使用现有账户登录。一旦登录，将创建一个新组织，准备通过 Azure Marketplace 使用和计费。

10. 您需要回答几个问题——地址和公司详情——然后才能继续。

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

11. 一旦您点击 **完成注册**，您将被带到 ClickHouse Cloud 中的组织，您可以查看计费屏幕以确保您通过 Azure Marketplace 计费并可以创建服务。

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

如果您遇到任何问题，请随时联系 [我们的支持团队](https://clickhouse.com/support/program)。
