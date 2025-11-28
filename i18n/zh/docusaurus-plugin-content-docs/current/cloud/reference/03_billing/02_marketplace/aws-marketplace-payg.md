---
slug: /cloud/billing/marketplace/aws-marketplace-payg
title: 'AWS Marketplace 按需计费（PAYG）'
description: '通过 AWS Marketplace 以按需计费（PAYG）方式订阅 ClickHouse Cloud。'
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

通过 [AWS Marketplace](https://aws.amazon.com/marketplace) 上的按需付费（PAYG）公共报价开始使用 ClickHouse Cloud。


## 先决条件 {#prerequisites}

- 一个已由计费管理员开通购买权限的 AWS 账户。
- 要进行购买，您必须使用该账户登录 AWS Marketplace。
- 若要将 ClickHouse 组织关联到您的订阅，您必须是该组织的管理员。

:::note
一个 AWS 账户只能订阅一个 “ClickHouse Cloud - 按量付费” 订阅，并且该订阅只能关联一个 ClickHouse 组织。
:::



## 注册步骤 {#steps-to-sign-up}

<VerticalStepper headerLevel="h3">

### 搜索 ClickHouse Cloud - Pay As You Go {#search-payg}

前往 [AWS Marketplace](https://aws.amazon.com/marketplace)，搜索 “ClickHouse Cloud - Pay As You Go”。

<Image img={aws_marketplace_payg_1} alt="在 AWS Marketplace 中搜索 ClickHouse" border/>

### 查看购买选项 {#purchase-options}

点击该[产品页面](https://aws.amazon.com/marketplace/pp/prodview-p4gwofrqpkltu)，然后点击 **View purchase options**。

<Image img={aws_marketplace_payg_2} alt="在 AWS Marketplace 中查看购买选项" border/>

### 订阅 {#subscribe}

在下一个页面中，点击 **Subscribe**。

:::note
**Purchase order (PO) number（采购订单号）** 为可选项，可以忽略。
:::

<Image img={aws_marketplace_payg_3} alt="在 AWS Marketplace 中订阅" border/>

### 设置你的账户 {#set-up-your-account}

请注意，此时设置尚未完成，你的 ClickHouse Cloud 组织尚未通过 Marketplace 计费。你现在需要在 Marketplace 订阅页面中点击 **Set up your account**，跳转到 ClickHouse Cloud 完成配置。

<Image img={aws_marketplace_payg_4} alt="设置你的账户" border/>

跳转到 ClickHouse Cloud 后，你可以使用现有账户登录，或者注册一个新账户。此步骤非常关键，以便我们将你的 ClickHouse Cloud 组织绑定到你的 AWS Marketplace 计费。

:::note[新 ClickHouse Cloud 用户]
如果你是新的 ClickHouse Cloud 用户，请按照下面的步骤操作。
:::

<details>
<summary><strong>新用户步骤</strong></summary>

如果你是新的 ClickHouse Cloud 用户，请点击页面底部的 **Register**。系统会提示你创建新用户并验证邮箱。完成邮箱验证后，你可以关闭 ClickHouse Cloud 登录页面，然后在 https://console.clickhouse.cloud 使用新用户名登录。

<Image img={aws_marketplace_payg_5} size="md" alt="ClickHouse Cloud 注册"/>

:::note[新用户]
你还需要提供一些关于你业务的基本信息。请参见下面的截图。
:::

<Image img={aws_marketplace_payg_6} size="md" alt="开始之前"/>

<Image img={aws_marketplace_payg_7} size="md" alt="开始之前（续）"/>

</details>

如果你是现有的 ClickHouse Cloud 用户，只需使用你的账户凭证登录即可。

### 将 Marketplace 订阅添加到组织 {#add-marketplace-subscription}

成功登录后，你可以选择创建一个新组织，将其计费绑定到此 Marketplace 订阅；也可以选择一个现有组织，将其计费绑定到此订阅。

<Image img={aws_marketplace_payg_8} size="md" alt="添加 Marketplace 订阅" border/>

完成此步骤后，你的组织将连接到该 AWS 订阅，所有用量将通过你的 AWS 账户计费。

你可以在 ClickHouse UI 中该组织的计费页面确认计费已成功关联到 AWS Marketplace。

<Image img={aws_marketplace_payg_9} size="lg" alt="确认计费页面" border/>

</VerticalStepper>



## 支持 {#support}

如果您遇到任何问题，请随时联系[我们的支持团队](https://clickhouse.com/support/program)。
