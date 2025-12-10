---
slug: /cloud/billing/marketplace/aws-marketplace-committed-contract
title: 'AWS Marketplace 承诺消费合约'
description: '通过 AWS Marketplace（承诺消费合约）订阅 ClickHouse Cloud'
keywords: ['aws', 'amazon', 'marketplace', '计费', '承诺消费', '承诺消费合约']
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

通过在 [AWS Marketplace](https://aws.amazon.com/marketplace) 上签订承诺消费合约来开始使用 ClickHouse Cloud。
承诺消费合约（也称为 Private Offer）允许客户在一段时间内承诺在 ClickHouse Cloud 上花费一定金额。


## 先决条件 {#prerequisites}

- 基于特定合同条款的 ClickHouse Private Offer。
- 若要将某个 ClickHouse 组织关联到你的承诺消费优惠，你必须是该组织的管理员。

:::note
一个 AWS 账号只能订阅一个“ClickHouse Cloud - Committed Contract” Private Offer，并且该 Offer 只能关联到一个 ClickHouse 组织。
:::

在 AWS 中查看并接受承诺合同所需的权限：

- 如果你使用 AWS 托管策略，则必须具备以下权限：
  - `AWSMarketplaceRead-only`, `AWSMarketplaceManageSubscriptions`
  - 或 `AWSMarketplaceFullAccess`
- 如果你未使用 AWS 托管策略，则必须具备以下权限：
  - IAM 操作 `aws-marketplace:ListPrivateListings` 和 `aws-marketplace:ViewSubscriptions`



## 注册步骤 {#steps-to-sign-up}

<VerticalStepper headerLevel="h3">

### 接受您的私有优惠 {#private-offer-accept}

您应该已经收到一封电子邮件，其中包含用于查看并接受您的私有优惠的链接。

<Image img={mp_committed_spend_1} size="md" alt="AWS Marketplace 私有优惠电子邮件"/>

### 查看优惠链接 {#review-offer-link}

点击邮件中的 **Review offer** 链接。
这会将您带到 AWS Marketplace 页面，并显示该私有优惠的详细信息。

### 设置您的账号 {#setup-your-account}

在 AWS 门户中完成订阅步骤，然后点击 **"Set up your account"**。
此时必须跳转到 ClickHouse Cloud，并在该页面上注册新账号或使用现有账号登录。
如果不完成这一步，我们将无法把您的 AWS Marketplace 合同关联到 ClickHouse Cloud。

<Image img={mp_committed_spend_2} size="md" alt="AWS Marketplace 私有优惠电子邮件"/>

### 登录 Cloud {#login-cloud}

跳转到 ClickHouse Cloud 后，您可以使用现有账号登录，或注册新账号。
此步骤是为了将您的 ClickHouse Cloud 组织与 AWS Marketplace 计费进行绑定。

<Image img={mp_committed_spend_3} size="md" alt="AWS Marketplace 私有优惠电子邮件"/>

### 新用户注册 {#register}

如果您是新的 ClickHouse Cloud 用户，点击页面底部的 "Register"。
系统会提示您创建新用户并验证邮箱。
验证邮箱后，您可以离开 ClickHouse Cloud 登录页面，并在 [https://console.clickhouse.cloud](https://console.clickhouse.cloud) 使用新的用户名登录。

请注意，如果您是新用户，还需要提供一些关于您业务的基本信息。
参见下面的截图。

<Image img={mp_committed_spend_4} size="md" alt="提供业务信息"/>

<Image img={mp_committed_spend_5} size="md" alt="提供业务信息"/>

如果您是现有的 ClickHouse Cloud 用户，只需使用您的账号凭据登录即可。

### 创建或选择用于计费的组织 {#create-select-org-to-bill}

成功登录后，您可以决定是创建一个新组织，将其作为此 Marketplace 合同的计费主体，还是选择一个现有组织作为此合同的计费主体。

<Image img={mp_committed_spend_6} size="md" alt="创建或选择用于此订阅计费的组织"/>

完成此步骤后，您的组织将关联到 AWS 的承诺消费合同，所有使用量都会通过您的 AWS 账号进行计费。
您可以在 ClickHouse UI 中该组织的计费页面确认计费已与 AWS Marketplace 成功关联。

<Image img={mp_committed_spend_7} size="md" alt="确认设置已完成"/>

如果您遇到任何问题，请随时联系我们的[支持团队](https://clickhouse.com/support/program)。

</VerticalStepper>
