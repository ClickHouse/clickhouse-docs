---
'slug': '/cloud/billing/marketplace/aws-marketplace-committed-contract'
'title': 'AWS Marketplace 承诺合同'
'description': '通过 AWS Marketplace (Committed Contract) 订阅 ClickHouse Cloud'
'keywords':
- 'aws'
- 'amazon'
- 'marketplace'
- 'billing'
- 'committed'
- 'committed contract'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import aws_marketplace_committed_1 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-committed-1.png';
import aws_marketplace_payg_6 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-6.png';
import aws_marketplace_payg_7 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-7.png';
import aws_marketplace_payg_8 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-8.png';
import aws_marketplace_payg_9 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-9.png';
import aws_marketplace_payg_10 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-10.png';
import aws_marketplace_payg_11 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-11.png';
import aws_marketplace_payg_12 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-12.png';

开始通过承诺合同在 [AWS Marketplace](https://aws.amazon.com/marketplace) 上使用 ClickHouse Cloud。承诺合同，也称为私有报价，允许客户承诺在一段时间内在 ClickHouse Cloud 上花费一定金额。

## 先决条件 {#prerequisites}

- 根据具体合同条款从 ClickHouse 获得的私有报价。
- 要将 ClickHouse 组织连接到您的承诺支出报价，您必须是该组织的管理员。

[在 AWS 中查看和接受您承诺合同所需的权限](https://docs.aws.amazon.com/marketplace/latest/buyerguide/private-offers-page.html#private-offers-page-permissions):
- 如果您使用 AWS 托管策略，则需要具有以下权限： `AWSMarketplaceRead-only`, `AWSMarketplaceManageSubscriptions` 或 `AWSMarketplaceFullAccess`。
- 如果您不使用 AWS 托管策略，则需具备以下权限： IAM 操作 `aws-marketplace:ListPrivateListings` 和 `aws-marketplace:ViewSubscriptions`。

## 注册步骤 {#steps-to-sign-up}

1. 您应该已经收到了一封电子邮件，里面有一个链接用于查看和接受您的私有报价。

<br />

<Image img={aws_marketplace_committed_1} size="md" alt="AWS Marketplace 私有报价邮件" border/>

<br />

2. 点击邮件中的 **Review Offer** 链接。这将带您到 AWS Marketplace 页面，并显示私有报价的详细信息。在接受私有报价时，选择合同选项下拉框中的单位数量为 1。

3. 完成在 AWS 门户上的订阅步骤并点击 **Set up your account**。
此时将您重定向到 ClickHouse Cloud 非常重要，您可以注册一个新帐户或使用现有帐户登录。未完成此步骤，我们将无法将您的 AWS Marketplace 订阅与 ClickHouse Cloud 关联。

4. 一旦您重定向到 ClickHouse Cloud，您可以使用现有帐户登录或注册新帐户。此步骤非常重要，以便我们可以将您的 ClickHouse Cloud 组织与 AWS Marketplace 计费绑定。

<br />

<Image img={aws_marketplace_payg_6} size="md" alt="ClickHouse Cloud 登录页面" border/>

<br />

如果您是新的 ClickHouse Cloud 用户，请点击页面底部的 **Register**。您将被提示创建新用户并验证电子邮件。在验证您的电子邮件后，您可以离开 ClickHouse Cloud 登录页面，并使用新用户名登录到 [https://console.clickhouse.cloud](https://console.clickhouse.cloud)。

<br />

<Image img={aws_marketplace_payg_7} size="md" alt="ClickHouse Cloud 注册页面" border/>

<br />

请注意，如果您是新用户，您还需要提供一些有关您业务的基本信息。请参见以下截图。

<br />

<Image img={aws_marketplace_payg_8} size="md" alt="ClickHouse Cloud 注册信息表单" border/>

<br />

<br />

<Image img={aws_marketplace_payg_9} size="md" alt="ClickHouse Cloud 注册信息表单 2" border/>

<br />

如果您是现有的 ClickHouse Cloud 用户，只需使用您的凭据登录即可。

5. 成功登录后，将创建一个新的 ClickHouse Cloud 组织。该组织将与您的 AWS 计费帐户连接，所有使用将通过您的 AWS 帐户计费。

6. 一旦您登录，您可以确认您的计费确实与 AWS Marketplace 相关联，并开始设置您的 ClickHouse Cloud 资源。

<br />

<Image img={aws_marketplace_payg_10} size="md" alt="ClickHouse Cloud 查看 AWS Marketplace 计费" border/>

<br />

<Image img={aws_marketplace_payg_11} size="md" alt="ClickHouse Cloud 新服务页面" border/>

<br />

6. 您应该会收到一封确认注册的电子邮件：

<br />

<Image img={aws_marketplace_payg_12} size="md" alt="AWS Marketplace 确认电子邮件" border/>

<br />

如果您遇到任何问题，请随时联系 [我们的支持团队](https://clickhouse.com/support/program)。
