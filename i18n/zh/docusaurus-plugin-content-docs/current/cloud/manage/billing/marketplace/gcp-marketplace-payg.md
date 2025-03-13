---
slug: /cloud/billing/marketplace/gcp-marketplace-payg
title: GCP Marketplace PAYG
description: 通过 GCP Marketplace (按需付费) 订阅 ClickHouse Cloud。
keywords: ['gcp', 'marketplace', 'billing', 'PAYG']
---

import gcp_marketplace_payg_1 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-payg-1.png';
import gcp_marketplace_payg_2 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-payg-2.png';
import gcp_marketplace_payg_3 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-payg-3.png';
import gcp_marketplace_payg_4 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-payg-4.png';
import aws_marketplace_payg_6 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-6.png';
import aws_marketplace_payg_7 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-7.png';
import aws_marketplace_payg_8 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-8.png';
import aws_marketplace_payg_9 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-9.png';
import gcp_marketplace_payg_5 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-payg-5.png';
import aws_marketplace_payg_11 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-11.png';
import gcp_marketplace_payg_6 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-payg-6.png';

开始通过 [GCP Marketplace](https://console.cloud.google.com/marketplace) 的按需付费公共报价使用 ClickHouse Cloud。

## 前提条件 {#prerequisites}

- 一个由您的计费管理员启用购买权限的 GCP 项目。
- 要在 GCP Marketplace 上订阅 ClickHouse Cloud，您必须使用具有购买权限的账户登录，并选择适当的项目。

## 注册步骤 {#steps-to-sign-up}

1. 转到 [GCP Marketplace](https://cloud.google.com/marketplace)，搜索 ClickHouse Cloud。确保您选择了正确的项目。

<br />

<img src={gcp_marketplace_payg_1}
    alt='GCP Marketplace 主页'
    class='image'
    style={{width: '500px'}}
/>

<br />

2. 点击 [列表](https://console.cloud.google.com/marketplace/product/clickhouse-public/clickhouse-cloud)，然后点击 **订阅**。

<br />

<img src={gcp_marketplace_payg_2}
    alt='GCP Marketplace 中的 ClickHouse Cloud'
    class='image'
    style={{width: '500px'}}
/>

<br />

3. 在下一个屏幕上，配置订阅：

- 计划将默认为“ClickHouse Cloud”
- 订阅时间框架为“每月”
- 选择适当的计费账户
- 接受条款然后点击 **订阅**

<br />

<img src={gcp_marketplace_payg_3}
    alt='在 GCP Marketplace 中配置订阅'
    class='image'
    style={{width: '400px'}}
/>

<br />

4. 一旦您点击 **订阅**，您将看到一个模态框 **使用 ClickHouse 注册**。

<br />

<img src={gcp_marketplace_payg_4}
    alt='GCP Marketplace 注册模态框'
    class='image'
    style={{width: '400px'}}
/>

<br />

5. 请注意，此时设置尚未完成。您需要通过点击 **设置您的账户** 并在 ClickHouse Cloud 上注册，来重定向到 ClickHouse Cloud。

6. 一旦您重定向到 ClickHouse Cloud，您可以使用现有账户登录，或注册新账户。此步骤非常重要，以便将您的 ClickHouse Cloud 组织绑定到 GCP Marketplace 计费。

<br />

<img src={aws_marketplace_payg_6}
    alt='ClickHouse Cloud 登录页面'
    class='image'
    style={{width: '300px'}}
/>

<br />

如果您是新用户，请在页面底部点击 **注册**。系统会提示您创建新用户并验证邮箱。验证邮箱后，您可以离开 ClickHouse Cloud 登录页面，并使用新用户名登录 [https://console.clickhouse.cloud](https://console.clickhouse.cloud)。

<br />

<img src={aws_marketplace_payg_7}
    alt='ClickHouse Cloud 注册页面'
    class='image'
    style={{width: '500px'}}
/>

<br />

请注意，如果您是新用户，您还需要提供一些关于您业务的基本信息。请参见下面的截图。

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

如果您是现有 ClickHouse Cloud 用户，只需使用您的凭据登录。

7. 成功登录后，将创建一个新的 ClickHouse Cloud 组织。该组织将连接到您的 GCP 计费账户，所有使用将通过您的 GCP 账户计费。

8. 登录后，您可以确认您的计费确实与 GCP Marketplace 绑定，并开始设置您的 ClickHouse Cloud 资源。

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

9. 您应该会收到一封确认注册的电子邮件：

<br />
<br />

<img src={gcp_marketplace_payg_6}
    alt='GCP Marketplace 确认电子邮件'
    class='image'
    style={{width: '300px'}}
/>

<br />

<br />

如果您遇到任何问题，请随时联系 [我们的支持团队](https://clickhouse.com/support/program)。
