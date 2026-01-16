---
slug: /cloud/billing/marketplace/gcp-marketplace-payg
title: 'GCP Marketplace 按需付费（PAYG）'
description: '通过 GCP Marketplace 以按需付费（PAYG）方式订阅 ClickHouse Cloud。'
keywords: ['gcp', 'marketplace', 'billing', 'PAYG']
doc_type: 'guide'
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
import Image from '@theme/IdealImage';

通过 [GCP Marketplace](https://console.cloud.google.com/marketplace) 上的按需付费（PAYG，Pay-as-you-go）公共方案开始使用 ClickHouse Cloud。


## 前提条件 \\{#prerequisites\\}

- 一个已由计费管理员开通购买权限的 GCP 项目。
- 在 GCP Marketplace 订阅 ClickHouse Cloud 时，您必须使用具有购买权限的账号登录，并选择相应的项目。



## 注册步骤 \\{#steps-to-sign-up\\}

1. 前往 [GCP Marketplace](https://cloud.google.com/marketplace)，搜索 ClickHouse Cloud。请确保已选择正确的 GCP 项目。

<Image img={gcp_marketplace_payg_1} size="md" alt="GCP Marketplace 主页" border/>

2. 点击该[商品列表](https://console.cloud.google.com/marketplace/product/clickhouse-public/clickhouse-cloud)，然后点击 **Subscribe（订阅）**。

<Image img={gcp_marketplace_payg_2} size="md" alt="GCP Marketplace 中的 ClickHouse Cloud" border/>

3. 在下一个界面中配置订阅：

- 套餐默认为 “ClickHouse Cloud”
- 订阅周期为 “Monthly”（按月）
- 选择合适的结算账户
- 接受条款并点击 **Subscribe（订阅）**

<br />

<Image img={gcp_marketplace_payg_3} size="sm" alt="在 GCP Marketplace 中配置订阅" border/>

<br />

4. 点击 **Subscribe（订阅）** 后，您会看到一个 **Sign up with ClickHouse（使用 ClickHouse 注册）** 的弹出框。

<br />

<Image img={gcp_marketplace_payg_4} size="md" alt="GCP Marketplace 注册弹出框" border/>

<br />

5. 请注意，此时设置尚未完成。您需要点击 **Set up your account（设置您的账号）** 跳转到 ClickHouse Cloud，并在 ClickHouse Cloud 上完成注册。

6. 跳转到 ClickHouse Cloud 后，您可以使用已有账号登录，或注册新账号。此步骤非常重要，以便我们将您的 ClickHouse Cloud 组织绑定到 GCP Marketplace 的结算。

<br />

<Image img={aws_marketplace_payg_6} size="md" alt="ClickHouse Cloud 登录页面" border/>

<br />

如果您是新的 ClickHouse Cloud 用户，请点击页面底部的 **Register（注册）**。系统会提示您创建新用户并验证邮箱。验证邮箱后，您可以离开 ClickHouse Cloud 登录页面，然后在 [https://console.clickhouse.cloud](https://console.clickhouse.cloud) 使用新用户名登录。

<br />

<Image img={aws_marketplace_payg_7} size="md" alt="ClickHouse Cloud 注册页面" border/>

<br />

请注意，如果您是新用户，还需要提供一些关于您业务的基本信息。参见下方截图。

<br />

<Image img={aws_marketplace_payg_8} size="md" alt="ClickHouse Cloud 注册信息表单" border/>

<br />

<Image img={aws_marketplace_payg_9} size="md" alt="ClickHouse Cloud 注册信息表单 2" border/>

<br />

如果您是已有 ClickHouse Cloud 账号的用户，只需使用您的凭据登录即可。

7. 成功登录后，会创建一个新的 ClickHouse Cloud 组织。该组织会关联到您的 GCP 结算账户，所有使用费用都会通过您的 GCP 账号结算。

8. 登录后，您可以确认您的结算确实已绑定到 GCP Marketplace，并开始创建和配置您的 ClickHouse Cloud 资源。

<br />

<Image img={gcp_marketplace_payg_5} size="md" alt="ClickHouse Cloud 登录页面" border/>

<br />

<Image img={aws_marketplace_payg_11} size="md" alt="ClickHouse Cloud 新服务页面" border/>

<br />

9. 您应该会收到一封确认注册的电子邮件：

<br />
<br />

<Image img={gcp_marketplace_payg_6} size="md" alt="GCP Marketplace 确认邮件" border/>

<br />

<br />

如果您遇到任何问题，请随时联系[我们的支持团队](https://clickhouse.com/support/program)。
