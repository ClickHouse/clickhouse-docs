---
slug: /cloud/billing/marketplace/aws-marketplace-committed-contract
title: AWS Marketplace 承诺合同
description: 通过 AWS Marketplace 订阅 ClickHouse Cloud（承诺合同）
keywords: [aws, amazon, marketplace, billing, committed, committed contract]
---

import aws_marketplace_committed_1 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-committed-1.png';
import aws_marketplace_payg_6 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-6.png';
import aws_marketplace_payg_7 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-7.png';
import aws_marketplace_payg_8 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-8.png';
import aws_marketplace_payg_9 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-9.png';
import aws_marketplace_payg_10 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-10.png';
import aws_marketplace_payg_11 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-11.png';
import aws_marketplace_payg_12 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-12.png';

通过承诺合同在 [AWS Marketplace](https://aws.amazon.com/marketplace) 上开始使用 ClickHouse Cloud。承诺合同，也称为私人优惠，允许客户承诺在一段时间内在 ClickHouse Cloud 上花费一定金额。

## 先决条件 {#prerequisites}

- 来自 ClickHouse 的私人优惠，基于特定合同条款。

## 注册步骤 {#steps-to-sign-up}

1. 您应该收到了一封带有链接的电子邮件，以查看和接受您的私人优惠。

<br />

<img src={aws_marketplace_committed_1}
    alt='AWS Marketplace 私人优惠电子邮件'
    class='image'
    style={{width: '400px'}}
 />

<br />

2. 点击电子邮件中的 **Review Offer** 链接。这应该会带您到 AWS Marketplace 页面，并显示私人优惠的详细信息。在接受私人优惠时，选择合同选项下的单位数量为 1。

3. 在 AWS 门户上完成订阅步骤，并点击 **Set up your account**。
此时重定向到 ClickHouse Cloud 是至关重要的，您可以注册新帐户或使用现有帐户登录。如果不完成此步骤，我们将无法将您的 AWS Marketplace 订阅与 ClickHouse Cloud 关联。

4. 一旦重定向到 ClickHouse Cloud，您可以选择用现有帐户登录或注册新帐户。此步骤非常重要，以便我们可以将您的 ClickHouse Cloud 组织绑定到 AWS Marketplace 账单中。

<br />

<img src={aws_marketplace_payg_6}
    alt='ClickHouse Cloud 登录页面'
    class='image'
    style={{width: '300px'}}
 />

<br />

如果您是新的 ClickHouse Cloud 用户，请点击页面底部的 **Register**。系统将提示您创建新用户并验证电子邮件。验证您的电子邮件后，您可以离开 ClickHouse Cloud 登录页面，并使用新用户名登录 [https://console.clickhouse.cloud](https://console.clickhouse.cloud)。

<br />

<img src={aws_marketplace_payg_7}
    alt='ClickHouse Cloud 注册页面'
    class='image'
    style={{width: '500px'}}
 />

<br />

请注意，如果您是新用户，您还需要提供一些有关您业务的基本信息。请参见下面的屏幕截图。

<br />

<img src={aws_marketplace_payg_8}
    alt='ClickHouse Cloud 注册信息表'
    class='image'
    style={{width: '400px'}}
 />

<br />

<br />

<img src={aws_marketplace_payg_9}
    alt='ClickHouse Cloud 注册信息表 2'
    class='image'
    style={{width: '400px'}}
 />

<br />

如果您是现有的 ClickHouse Cloud 用户，请使用您的凭据直接登录。

5. 登录成功后，将创建一个新的 ClickHouse Cloud 组织。该组织将连接到您的 AWS 账单帐户，所有使用情况将通过您的 AWS 帐户计费。

6. 登录后，您可以确认您的账单确实与 AWS Marketplace 关联，并开始设置您的 ClickHouse Cloud 资源。

<br />

<img src={aws_marketplace_payg_10}
    alt='ClickHouse Cloud 查看 AWS Marketplace 账单'
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

6. 您应该会收到一封确认注册的电子邮件：

<br />

<img src={aws_marketplace_payg_12}
    alt='AWS Marketplace 确认电子邮件'
    class='image'
    style={{width: '500px'}}
 />

<br />

如果您遇到任何问题，请随时联系 [我们的支持团队](https://clickhouse.com/support/program)。
