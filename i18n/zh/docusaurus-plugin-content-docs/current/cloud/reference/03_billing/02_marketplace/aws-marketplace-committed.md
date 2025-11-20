---
slug: /cloud/billing/marketplace/aws-marketplace-committed-contract
title: 'AWS Marketplace 承诺合约'
description: '通过 AWS Marketplace 以承诺合约方式订阅 ClickHouse Cloud'
keywords: ['aws', 'amazon', 'marketplace', 'billing', 'committed', 'committed contract']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import mp_committed_spend_1 from '@site/static/images/cloud/reference/mp_committed_spend_1.png'
import mp_committed_spend_2 from '@site/static/images/cloud/reference/mp_committed_spend_2.png'
import mp_committed_spend_3 from '@site/static/images/cloud/reference/mp_committed_spend_3.png'
import mp_committed_spend_4 from '@site/static/images/cloud/reference/mp_committed_spend_4.png'
import mp_committed_spend_5 from '@site/static/images/cloud/reference/mp_committed_spend_5.png'
import mp_committed_spend_6 from '@site/static/images/cloud/reference/mp_committed_spend_6.png'
import mp_committed_spend_7 from '@site/static/images/cloud/reference/mp_committed_spend_7.png'

在 [AWS Marketplace](https://aws.amazon.com/marketplace) 上通过签订承诺合同开始使用 ClickHouse Cloud。
承诺合同（也称为 Private Offer）允许客户在一段时间内承诺在 ClickHouse Cloud 上花费一定金额。


## 前提条件 {#prerequisites}

- 基于特定合同条款的 ClickHouse Private Offer。
- 要将 ClickHouse 组织关联到您的承诺消费优惠,您必须是该组织的管理员。

:::note
一个 AWS 账户只能订阅一个"ClickHouse Cloud - Committed Contract"私有优惠,且该优惠只能关联一个 ClickHouse 组织。
:::

在 AWS 中查看和接受承诺合同所需的权限:

- 如果您使用 AWS 托管策略,需要具有以下权限:
  - `AWSMarketplaceRead-only`、`AWSMarketplaceManageSubscriptions`
  - 或 `AWSMarketplaceFullAccess`
- 如果您未使用 AWS 托管策略,需要具有以下权限:
  - IAM 操作 `aws-marketplace:ListPrivateListings` 和 `aws-marketplace:ViewSubscriptions`


## 注册步骤 {#steps-to-sign-up}

<VerticalStepper headerLevel="h3">

### 接受您的专属优惠 {#private-offer-accept}

您应该已收到一封包含链接的电子邮件,用于查看和接受您的专属优惠。

<Image
  img={mp_committed_spend_1}
  size='md'
  alt='AWS Marketplace 专属优惠电子邮件'
/>

### 查看优惠链接 {#review-offer-link}

点击电子邮件中的"查看优惠"链接。
这将带您进入 AWS Marketplace 页面,其中包含专属优惠的详细信息。

### 设置您的账户 {#setup-your-account}

在 AWS 门户上完成订阅步骤并点击 **"设置您的账户"**。
此时务必重定向到 ClickHouse Cloud 并注册新账户或使用现有账户登录。
如果不完成此步骤,我们将无法将您的 AWS Marketplace 合同关联到 ClickHouse Cloud。

<Image
  img={mp_committed_spend_2}
  size='md'
  alt='AWS Marketplace 专属优惠电子邮件'
/>

### 登录 Cloud {#login-cloud}

重定向到 ClickHouse Cloud 后,您可以使用现有账户登录或注册新账户。
此步骤是必需的,以便我们将您的 ClickHouse Cloud 组织绑定到 AWS Marketplace 计费。

<Image
  img={mp_committed_spend_3}
  size='md'
  alt='AWS Marketplace 专属优惠电子邮件'
/>

### 新用户注册 {#register}

如果您是 ClickHouse Cloud 新用户,请点击页面底部的"注册"。
系统将提示您创建新用户并验证电子邮件。
验证电子邮件后,您可以离开 ClickHouse Cloud 登录页面,并使用新用户名在 [https://console.clickhouse.cloud](https://console.clickhouse.cloud) 登录。

请注意,如果您是新用户,还需要提供一些关于您业务的基本信息。
请参见下面的屏幕截图。

<Image
  img={mp_committed_spend_4}
  size='md'
  alt='提供业务信息'
/>

<Image
  img={mp_committed_spend_5}
  size='md'
  alt='提供业务信息'
/>

如果您是 ClickHouse Cloud 现有用户,只需使用您的凭据登录即可。

### 创建或选择要计费的组织 {#create-select-org-to-bill}

成功登录后,您可以决定是创建新组织并将此 Marketplace 合同计费到该组织,还是选择现有组织并将此合同计费到该组织。

<Image
  img={mp_committed_spend_6}
  size='md'
  alt='创建或选择要将此订阅计费到的组织'
/>

完成此步骤后,您的组织将连接到您的 AWS 承诺消费合同,所有使用量将通过您的 AWS 账户计费。
您可以从 ClickHouse UI 中组织的计费页面确认计费现已关联到 AWS Marketplace。

<Image img={mp_committed_spend_7} size='md' alt='确认设置已完成' />

如果您遇到任何问题,请随时联系我们的[支持团队](https://clickhouse.com/support/program)。

</VerticalStepper>
