---
'slug': '/cloud/billing/marketplace/aws-marketplace-committed-contract'
'title': 'AWS Marketplace 承诺合同'
'description': '通过 AWS Marketplace 订阅 ClickHouse Cloud（承诺合同）'
'keywords':
- 'aws'
- 'amazon'
- 'marketplace'
- 'billing'
- 'committed'
- 'committed contract'
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

开始使用 [AWS Marketplace](https://aws.amazon.com/marketplace) 上的 ClickHouse Cloud 中的承诺合同。承诺合同，也称为私人优惠，允许客户承诺在一段时间内在 ClickHouse Cloud 上支出一定金额。

## 先决条件 {#prerequisites}

- 具有特定合同条款的 ClickHouse 私人优惠。

## 注册步骤 {#steps-to-sign-up}

1. 您应该收到一封电子邮件，其中包含一个链接，以查看和接受您的私人优惠。

<br />

<Image img={aws_marketplace_committed_1} size="md" alt="AWS Marketplace private offer email" border/>

<br />

2. 点击电子邮件中的 **Review Offer** 链接。这应该会将您带到包含私人优惠详情的 AWS Marketplace 页面。在接受私人优惠时，在合同选项下拉列表中选择 1 作为单位数量。

3. 完成 AWS 门户上的订阅步骤，然后点击 **Set up your account**。此时重定向到 ClickHouse Cloud 是非常重要的，并且需要注册新帐户或使用现有帐户登录。如果未完成此步骤，我们将无法将您的 AWS Marketplace 订阅与 ClickHouse Cloud 关联。

4. 一旦您重定向到 ClickHouse Cloud，您可以使用现有帐户登录或注册新帐户。此步骤非常重要，以便我们能够将您的 ClickHouse Cloud 组织绑定到 AWS Marketplace 账单。

<br />

<Image img={aws_marketplace_payg_6} size="md" alt="ClickHouse Cloud sign in page" border/>

<br />

如果您是新用户，请在页面底部点击 **Register**。系统会提示您创建新用户并验证电子邮件。在验证您的电子邮件后，您可以离开 ClickHouse Cloud 登录页面，并在 [https://console.clickhouse.cloud](https://console.clickhouse.cloud) 使用新用户名登录。

<br />

<Image img={aws_marketplace_payg_7} size="md" alt="ClickHouse Cloud sign up page" border/>

<br />

请注意，如果您是新用户，您还需要提供一些关于您业务的基本信息。请参见下面的截图。

<br />

<Image img={aws_marketplace_payg_8} size="md" alt="ClickHouse Cloud sign up info form" border/>

<br />

<br />

<Image img={aws_marketplace_payg_9} size="md" alt="ClickHouse Cloud sign up info form 2" border/>

<br />

如果您是现有的 ClickHouse Cloud 用户，只需使用您的凭据登录即可。

5. 成功登录后，将创建一个新的 ClickHouse Cloud 组织。该组织将与您的 AWS 账单帐户连接，所有使用情况将通过您的 AWS 账户进行计费。

6. 登录后，您可以确认您的计费确实与 AWS Marketplace 绑定，并开始设置您的 ClickHouse Cloud 资源。

<br />

<Image img={aws_marketplace_payg_10} size="md" alt="ClickHouse Cloud view AWS Marketplace billing" border/>

<br />

<Image img={aws_marketplace_payg_11} size="md" alt="ClickHouse Cloud new services page" border/>

<br />

6. 您应该会收到一封确认注册的电子邮件：

<br />

<Image img={aws_marketplace_payg_12} size="md" alt="AWS Marketplace confirmation email" border/>

<br />

如果您遇到任何问题，请随时联系 [我们的支持团队](https://clickhouse.com/support/program)。
