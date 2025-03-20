---
slug: /cloud/billing/marketplace/gcp-marketplace-committed-contract
title: GCP Marketplace 受托合同
description: 通过 GCP Marketplace 订阅 ClickHouse Cloud（受托合同）
keywords: [gcp, google, marketplace, billing, committed, committed contract]
---

import gcp_marketplace_committed_1 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-committed-1.png';
import gcp_marketplace_committed_2 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-committed-2.png';
import gcp_marketplace_committed_3 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-committed-3.png';
import gcp_marketplace_committed_4 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-committed-4.png';
import gcp_marketplace_committed_5 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-committed-5.png';
import gcp_marketplace_committed_6 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-committed-6.png';
import gcp_marketplace_committed_7 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-committed-7.png';
import aws_marketplace_payg_6 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-6.png';
import aws_marketplace_payg_7 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-7.png';
import aws_marketplace_payg_8 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-8.png';
import aws_marketplace_payg_9 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-9.png';
import gcp_marketplace_payg_5 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-payg-5.png';
import aws_marketplace_payg_11 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-11.png';
import gcp_marketplace_payg_6 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-payg-6.png';

开始使用 ClickHouse Cloud 通过 [GCP Marketplace](https://console.cloud.google.com/marketplace) 的受托合同。受托合同，也称为私人报价，允许客户承诺在一定时间内在 ClickHouse Cloud 上消费一定金额。

## 前提条件 {#prerequisites}

- 根据具体合同条款获取了 ClickHouse 的私人报价。

## 注册步骤 {#steps-to-sign-up}

1. 您应该已经收到了一封电子邮件，其中包含审核和接受您私人报价的链接。

<br />

<img src={gcp_marketplace_committed_1}
    alt='GCP Marketplace 私人报价邮件'
    class='image'
    style={{width: '300px'}}
/>

<br />

2. 点击电子邮件中的 **审核报价** 链接。这将带您进入包含私人报价详情的 GCP Marketplace 页面。

<br />

<img src={gcp_marketplace_committed_2}
    alt='GCP Marketplace 报价摘要'
    class='image'
    style={{width: '300px'}}
/>

<br />

<img src={gcp_marketplace_committed_3}
    alt='GCP Marketplace 定价摘要'
    class='image'
    style={{width: '300px'}}
/>

<br />

3. 审核私人报价详情，如果一切正确，请点击 **接受**。

<br />

<img src={gcp_marketplace_committed_4}
    alt='GCP Marketplace 接受页面'
    class='image'
    style={{width: '300px'}}
/>

<br />

4. 点击 **前往产品页面**。

<br />

<img src={gcp_marketplace_committed_5}
    alt='GCP Marketplace 接受确认'
    class='image'
    style={{width: '400px'}}
/>

<br />

5. 点击 **在供应商处管理**。

<br />

<img src={gcp_marketplace_committed_6}
    alt='GCP Marketplace ClickHouse Cloud 页面'
    class='image'
    style={{width: '400px'}}
/>

<br />

此时至关重要的是重定向到 ClickHouse Cloud 并注册或登录。未完成此步骤，我们将无法将您的 GCP Marketplace 订阅链接到 ClickHouse Cloud。

<br />

<img src={gcp_marketplace_committed_7}
    alt='GCP Marketplace 离开网站确认模态'
    class='image'
    style={{width: '400px'}}
/>

<br />

6. 当您重定向到 ClickHouse Cloud 后，可以使用现有帐户登录或注册新帐户。

<br />

<img src={aws_marketplace_payg_6}
    alt='ClickHouse Cloud 登录页面'
    class='image'
    style={{width: '300px'}}
/>

<br />

如果您是新用户，请点击页面底部的 **注册**。系统会提示您创建新用户并验证电子邮件。验证电子邮件后，您可以离开 ClickHouse Cloud 登录页面，并使用新用户名登录 [https://console.clickhouse.cloud](https://console.clickhouse.cloud)。

<br />

<img src={aws_marketplace_payg_7}
    alt='ClickHouse Cloud 注册页面'
    class='image'
    style={{width: '500px'}}
/>

<br />

请注意，如果您是新用户，您还需要提供关于您企业的一些基本信息。请查看下面的截图。

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

如果您是现有 ClickHouse Cloud 用户，请使用您的凭证登录。

7. 成功登录后，将创建一个新的 ClickHouse Cloud 组织。该组织将与您的 GCP 计费帐户连接，所有使用情况将通过您的 GCP 帐户计费。

8. 登录后，您可以确认您的计费确实与 GCP Marketplace 关联，并开始设置您的 ClickHouse Cloud 资源。

<br />

<img src={gcp_marketplace_payg_5}
    alt='ClickHouse Cloud 登录页面'
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

9. 您应该收到一封确认注册的电子邮件：

<br />
<br />

<img src={gcp_marketplace_payg_6}
    alt='GCP Marketplace 确认邮件'
    class='image'
    style={{width: '300px'}}
/>

<br />

<br />

如果您遇到任何问题，请随时联系 [我们的支持团队](https://clickhouse.com/support/program)。
