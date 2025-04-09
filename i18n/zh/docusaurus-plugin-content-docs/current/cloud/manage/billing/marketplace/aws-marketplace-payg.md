---
slug: /cloud/billing/marketplace/aws-marketplace-payg
title: AWS Marketplace PAYG
description: 通过 AWS Marketplace (PAYG) 订阅 ClickHouse Cloud。
keywords: [aws, marketplace, billing, PAYG]
---

import aws_marketplace_payg_1 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-1.png';
import aws_marketplace_payg_2 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-2.png';
import aws_marketplace_payg_3 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-3.png';
import aws_marketplace_payg_4 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-4.png';
import aws_marketplace_payg_5 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-5.png';
import aws_marketplace_payg_6 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-6.png';
import aws_marketplace_payg_7 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-7.png';
import aws_marketplace_payg_8 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-8.png';
import aws_marketplace_payg_9 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-9.png';
import aws_marketplace_payg_10 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-10.png';
import aws_marketplace_payg_11 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-11.png';
import aws_marketplace_payg_12 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-12.png';

开始使用 ClickHouse Cloud，通过 [AWS Marketplace](https://aws.amazon.com/marketplace) 的 PAYG（按需付费）公共报价。

## Prerequisites {#prerequisites}

- 一个由您的账单管理员启用购买权的 AWS 账户。
- 您必须使用此账户登录 AWS 市场才能购买。

## Steps to sign up {#steps-to-sign-up}

1. 前往 [AWS Marketplace](https://aws.amazon.com/marketplace) 并搜索 ClickHouse Cloud。

<br />

<img src={aws_marketplace_payg_1}
    alt='AWS Marketplace 主页'
    class='image'
    style={{width: '500px'}}
/>

<br />

2. 点击 [列表](https://aws.amazon.com/marketplace/pp/prodview-jettukeanwrfc)，然后点击 **查看购买选项**。

<br />

<img src={aws_marketplace_payg_2}
    alt='AWS Marketplace 搜索 ClickHouse'
    class='image'
    style={{width: '500px'}}
/>

<br />

3. 在下一个屏幕上，配置合同：
- **合同长度** - PAYG 合同按月运行。
- **续订设置** - 您可以选择合同是否自动续订。
请注意，如果您未启用自动续订，您的组织将在账单周期结束时自动进入宽限期，然后被注销。

- **合同选项** - 您可以在此文本框中输入任意数字（或仅输入1）。这不会影响您支付的价格，因为公共报价下这些单位的价格为 $0。这些单位通常在接受 ClickHouse Cloud 的私人报价时使用。

- **采购订单** - 这是可选的，您可以忽略此项。

<br />

<img src={aws_marketplace_payg_3}
    alt='AWS Marketplace 配置合同'
    class='image'
    style={{width: '500px'}}
/>

<br />

填写完上述信息后，点击 **创建合同**。您可以确认显示的合同价格为零美元，这基本上意味着您没有应付款项，费用将根据使用情况产生。

<br />

<img src={aws_marketplace_payg_4}
    alt='AWS Marketplace 确认合同'
    class='image'
    style={{width: '500px'}}
/>

<br />

4. 一旦您点击 **创建合同**，您将看到一个弹窗确认并支付（$0 到期）。

5. 一旦您点击 **立即支付**，您将看到确认信息，表明您现在已订阅 ClickHouse Cloud 的 AWS Marketplace 产品。

<br />

<img src={aws_marketplace_payg_5}
    alt='AWS Marketplace 支付确认'
    class='image'
    style={{width: '500px'}}
/>

<br />

6. 请注意，此时设置尚未完成。您需要通过点击 **设置您的账户** 重新定向到 ClickHouse Cloud，并在 ClickHouse Cloud 上注册。

7. 一旦您重新定向到 ClickHouse Cloud，您可以选择使用现有账户登录，或注册新账户。此步骤非常重要，以便我们能将您的 ClickHouse Cloud 组织与 AWS Marketplace 计费绑定。

<br />

<img src={aws_marketplace_payg_6}
    alt='ClickHouse Cloud 登录页面'
    class='image'
    style={{width: '300px'}}
/>

<br />

如果您是新的 ClickHouse Cloud 用户，请在页面底部点击 **注册**。您将被提示创建新用户并验证电子邮件。验证您的电子邮件后，您可以离开 ClickHouse Cloud 登录页面，并在 [https://console.clickhouse.cloud](https://console.clickhouse.cloud) 使用新用户名登录。

<br />

<img src={aws_marketplace_payg_7}
    alt='ClickHouse Cloud 注册页面'
    class='image'
    style={{width: '500px'}}
/>

<br />

请注意，如果您是新用户，您还需要提供一些有关您公司的基本信息。请查看以下截图。

<br />

<img src={aws_marketplace_payg_8}
    alt='ClickHouse Cloud 注册信息表单'
    class='image'
    style={{width: '400px'}}
/>

<br />

<br />

<img src={aws_marketplace_payg_9}
    alt='ClickHouse Cloud 注册信息表单 2'
    class='image'
    style={{width: '400px'}}
/>

<br />

如果您是现有的 ClickHouse Cloud 用户，只需使用您的凭据登录。

8. 登录成功后，将创建一个新的 ClickHouse Cloud 组织。该组织将与您的 AWS 账单账户连接，所有使用情况将通过您的 AWS 账户计费。

9. 登录后，您可以确认您的计费实际上与 AWS Marketplace 相关联，并开始设置您的 ClickHouse Cloud 资源。

<br />

<img src={aws_marketplace_payg_10}
    alt='ClickHouse Cloud 查看 AWS Marketplace 计费'
    class='image'
    style={{width: '300px'}}
/>

<br />

<img src={aws_marketplace_payg_11}
    alt='ClickHouse Cloud 新服务页面'
    class='image'
    style={{width: '400px'}}
/>

<br />

10. 您应该收到一封确认注册的电子邮件：

<br />

<img src={aws_marketplace_payg_12}
    alt='AWS Marketplace 确认邮件'
    class='image'
    style={{width: '500px'}}
/>

<br />

如果您遇到任何问题，请随时联系 [我们的支持团队](https://clickhouse.com/support/program)。
