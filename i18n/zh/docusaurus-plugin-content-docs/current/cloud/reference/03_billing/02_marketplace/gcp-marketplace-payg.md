---
slug: /cloud/billing/marketplace/gcp-marketplace-payg
title: 'GCP Marketplace 按需付费 (PAYG)'
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

在 [GCP Marketplace](https://console.cloud.google.com/marketplace) 上通过按需付费（PAYG，按使用付费）的公开报价开始使用 ClickHouse Cloud。


## 前提条件 {#prerequisites}

- 一个已由账单管理员授予购买权限的 GCP 项目。
- 要在 GCP Marketplace 上订阅 ClickHouse Cloud,您必须使用具有购买权限的账户登录并选择相应的项目。


## 注册步骤 {#steps-to-sign-up}

1. 访问 [GCP Marketplace](https://cloud.google.com/marketplace) 并搜索 ClickHouse Cloud。请确保已选择正确的项目。

<Image
  img={gcp_marketplace_payg_1}
  size='md'
  alt='GCP Marketplace 主页'
  border
/>

2. 点击[列表](https://console.cloud.google.com/marketplace/product/clickhouse-public/clickhouse-cloud),然后点击 **Subscribe**。

<Image
  img={gcp_marketplace_payg_2}
  size='md'
  alt='GCP Marketplace 中的 ClickHouse Cloud'
  border
/>

3. 在下一个页面中配置订阅:

- 计划将默认为"ClickHouse Cloud"
- 订阅时间范围为"Monthly"
- 选择相应的计费账户
- 接受条款并点击 **Subscribe**

<br />

<Image
  img={gcp_marketplace_payg_3}
  size='sm'
  alt='在 GCP Marketplace 中配置订阅'
  border
/>

<br />

4. 点击 **Subscribe** 后,将显示 **Sign up with ClickHouse** 弹窗。

<br />

<Image
  img={gcp_marketplace_payg_4}
  size='md'
  alt='GCP Marketplace 注册弹窗'
  border
/>

<br />

5. 请注意,此时设置尚未完成。您需要点击 **Set up your account** 跳转到 ClickHouse Cloud 并完成注册。

6. 跳转到 ClickHouse Cloud 后,您可以使用现有账户登录,或注册新账户。此步骤非常重要,以便将您的 ClickHouse Cloud 组织绑定到 GCP Marketplace 计费账户。

<br />

<Image
  img={aws_marketplace_payg_6}
  size='md'
  alt='ClickHouse Cloud 登录页面'
  border
/>

<br />

如果您是 ClickHouse Cloud 新用户,请点击页面底部的 **Register**。系统将提示您创建新用户并验证电子邮件地址。验证电子邮件后,您可以关闭 ClickHouse Cloud 登录页面,然后使用新用户名在 [https://console.clickhouse.cloud](https://console.clickhouse.cloud) 登录。

<br />

<Image
  img={aws_marketplace_payg_7}
  size='md'
  alt='ClickHouse Cloud 注册页面'
  border
/>

<br />

请注意,如果您是新用户,还需要提供一些企业基本信息。请参见下方截图。

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

如果您是现有 ClickHouse Cloud 用户,只需使用您的凭据登录即可。

7. 成功登录后,系统将创建一个新的 ClickHouse Cloud 组织。该组织将关联到您的 GCP 计费账户,所有使用量将通过您的 GCP 账户计费。

8. 登录后,您可以确认计费已绑定到 GCP Marketplace,并开始配置您的 ClickHouse Cloud 资源。

<br />

<Image
  img={gcp_marketplace_payg_5}
  size='md'
  alt='ClickHouse Cloud 登录页面'
  border
/>

<br />

<Image
  img={aws_marketplace_payg_11}
  size='md'
  alt='ClickHouse Cloud 新服务页面'
  border
/>

<br />

9. 您将收到一封确认注册的电子邮件:

<br />
<br />

<Image
  img={gcp_marketplace_payg_6}
  size='md'
  alt='GCP Marketplace 确认电子邮件'
  border
/>

<br />

<br />

如果您遇到任何问题,请随时联系[我们的支持团队](https://clickhouse.com/support/program)。
