---
slug: /cloud/billing/marketplace/aws-marketplace-payg
title: 'AWS Marketplace 按需付费（PAYG）'
description: '通过 AWS Marketplace（按需付费，PAYG）订阅 ClickHouse Cloud。'
keywords: ['aws', 'marketplace', 'billing', 'PAYG']
doc_type: 'guide'
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
import Image from '@theme/IdealImage';

通过 [AWS Marketplace](https://aws.amazon.com/marketplace) 上的按需付费（PAYG，Pay-as-you-go）公共产品优惠开始使用 ClickHouse Cloud。


## 前提条件 {#prerequisites}

- 一个已由账单管理员授予购买权限的 AWS 账户。
- 购买时,您必须使用该账户登录 AWS Marketplace。
- 要将 ClickHouse 组织关联到您的订阅,您必须是该组织的管理员。

:::note
一个 AWS 账户只能订阅一个"ClickHouse Cloud - 按量付费"订阅,且该订阅只能关联到一个 ClickHouse 组织。
:::


## 注册步骤 {#steps-to-sign-up}

<VerticalStepper headerLevel="h3">

### 搜索 ClickHouse Cloud - 按量付费 {#search-payg}

前往 [AWS Marketplace](https://aws.amazon.com/marketplace) 并搜索"ClickHouse Cloud - Pay As You Go"。

<Image
  img={aws_marketplace_payg_1}
  alt='在 AWS Marketplace 中搜索 ClickHouse'
  border
/>

### 查看购买选项 {#purchase-options}

点击[列表](https://aws.amazon.com/marketplace/pp/prodview-p4gwofrqpkltu),然后点击 **View purchase options**。

<Image
  img={aws_marketplace_payg_2}
  alt='AWS Marketplace 查看购买选项'
  border
/>

### 订阅 {#subscribe}

在下一个页面中,点击订阅。

:::note
**采购订单 (PO) 编号**为可选项,可以忽略。
:::

<Image img={aws_marketplace_payg_3} alt='AWS Marketplace 订阅' border />

### 设置您的账户 {#set-up-your-account}

请注意,此时设置尚未完成,您的 ClickHouse Cloud 组织还未通过 Marketplace 进行计费。您现在需要在 Marketplace 订阅页面上点击 Set up your account,以重定向到 ClickHouse Cloud 完成设置。

<Image img={aws_marketplace_payg_4} alt='设置您的账户' border />

重定向到 ClickHouse Cloud 后,您可以使用现有账户登录,或注册一个新账户。此步骤非常重要,以便我们将您的 ClickHouse Cloud 组织绑定到您的 AWS Marketplace 计费账单。

:::note[新 ClickHouse Cloud 用户]
如果您是新的 ClickHouse Cloud 用户,请按照以下步骤操作。
:::

<details>
<summary><strong>新用户步骤</strong></summary>

如果您是新的 ClickHouse Cloud 用户,请点击页面底部的 Register。系统将提示您创建新用户并验证电子邮件。验证电子邮件后,您可以离开 ClickHouse Cloud 登录页面,并使用新用户名在 https://console.clickhouse.cloud 登录。

<Image img={aws_marketplace_payg_5} size='md' alt='ClickHouse Cloud 注册' />

:::note[新用户]
您还需要提供一些关于您业务的基本信息。请参见下面的截图。
:::

<Image img={aws_marketplace_payg_6} size='md' alt='开始之前' />

<Image img={aws_marketplace_payg_7} size='md' alt='开始之前(续)' />

</details>

如果您是现有的 ClickHouse Cloud 用户,只需使用您的凭据登录即可。

### 将 Marketplace 订阅添加到组织 {#add-marketplace-subscription}

成功登录后,您可以决定是创建一个新组织来关联此 Marketplace 订阅计费,还是选择一个现有组织来关联此订阅计费。

<Image
  img={aws_marketplace_payg_8}
  size='md'
  alt='添加 Marketplace 订阅'
  border
/>

完成此步骤后,您的组织将连接到此 AWS 订阅,所有使用量将通过您的 AWS 账户计费。

您可以从 ClickHouse UI 中组织的计费页面确认计费现已链接到 AWS Marketplace。

<Image
  img={aws_marketplace_payg_9}
  size='lg'
  alt='确认计费页面'
  border
/>

</VerticalStepper>


## 支持 {#support}

如果您遇到任何问题,请随时联系[我们的支持团队](https://clickhouse.com/support/program)。
