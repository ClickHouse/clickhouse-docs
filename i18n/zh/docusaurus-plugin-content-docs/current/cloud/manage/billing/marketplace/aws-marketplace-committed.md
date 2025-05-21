---
'slug': '/cloud/billing/marketplace/aws-marketplace-committed-contract'
'title': 'AWS Marketplace Committed Contract'
'description': '通过 AWS Marketplace（承诺合同）订阅 ClickHouse Cloud'
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

开始通过承诺合同在 [AWS Marketplace](https://aws.amazon.com/marketplace) 上使用 ClickHouse Cloud。承诺合同，也称为私人报价，允许客户承诺在一段时间内在 ClickHouse Cloud 上花费一定金额。

## 先决条件 {#prerequisites}

- 根据特定合同条款获得的来自 ClickHouse 的私人报价。

## 注册步骤 {#steps-to-sign-up}

1. 您应该已经收到一封电子邮件，里面有一个链接，可供您查看和接受您的私人报价。

<br />

<Image img={aws_marketplace_committed_1} size="md" alt="AWS Marketplace private offer email" border/>

<br />

2. 点击电子邮件中的 **Review Offer** 链接。这应该会将您带到 AWS Marketplace 页面，显示私人报价的详细信息。在接受私人报价时，请在合同选项下拉列表中选择 1 作为单位数量。

3. 完成以下步骤以在 AWS 门户上订阅，并点击 **Set up your account**。此时至关重要的是重定向到 ClickHouse Cloud，并注册新账户或使用现有账户登录。未完成此步骤，我们将无法将您的 AWS Marketplace 订阅链接到 ClickHouse Cloud。

4. 一旦重定向到 ClickHouse Cloud，您可以使用现有账户登录或注册新账户。此步骤非常重要，以便我们能够将您的 ClickHouse Cloud 组织绑定到 AWS Marketplace 账单。

<br />

<Image img={aws_marketplace_payg_6} size="md" alt="ClickHouse Cloud sign in page" border/>

<br />

如果您是新的 ClickHouse Cloud 用户，请在页面底部点击 **Register**。系统会提示您创建新用户并验证电子邮件。验证电子邮件后，您可以离开 ClickHouse Cloud 登录页面，并使用新用户名登录 [https://console.clickhouse.cloud](https://console.clickhouse.cloud)。

<br />

<Image img={aws_marketplace_payg_7} size="md" alt="ClickHouse Cloud sign up page" border/>

<br />

请注意，如果您是新用户，您还需要提供一些有关您业务的基本信息。请参见下面的截图。

<br />

<Image img={aws_marketplace_payg_8} size="md" alt="ClickHouse Cloud sign up info form" border/>

<br />

<br />

<Image img={aws_marketplace_payg_9} size="md" alt="ClickHouse Cloud sign up info form 2" border/>

<br />

如果您是现有的 ClickHouse Cloud 用户，只需使用您的凭据登录即可。

5. 登录成功后，将创建一个新的 ClickHouse Cloud 组织。此组织将与您的 AWS 账单账户连接，所有使用将通过您的 AWS 账户计费。

6. 登录后，您可以确认您的账单确实与 AWS Marketplace 关联，并开始设置您的 ClickHouse Cloud 资源。

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
