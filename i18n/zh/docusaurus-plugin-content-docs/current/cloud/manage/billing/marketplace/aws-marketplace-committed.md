---
'slug': '/cloud/billing/marketplace/aws-marketplace-committed-contract'
'title': 'AWS Marketplace 订阅合同'
'description': '通过 AWS Marketplace 订阅 ClickHouse Cloud（订阅合同）'
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

开始通过一个承诺合同在 [AWS Marketplace](https://aws.amazon.com/marketplace) 上使用 ClickHouse Cloud。承诺合同，也称为私有报价，允许客户在一段时间内承诺在 ClickHouse Cloud 上消费一定金额。

## 前提条件 {#prerequisites}

- 根据特定合同条款从 ClickHouse 获得的私有报价。

## 注册步骤 {#steps-to-sign-up}

1. 您应该已收到一封包含审查和接受您的私有报价的链接的电子邮件。

<br />

<Image img={aws_marketplace_committed_1} size="md" alt="AWS Marketplace private offer email" border/>

<br />

2. 点击电子邮件中的 **审核报价** 链接。这将带您进入 AWS Marketplace 页面，查看私有报价的详细信息。在接受私有报价时，在合同选项的下拉列表中选择1作为单位数量。

3. 完成 AWS 门户上的订阅步骤，并点击 **设置您的帐户**。 此时重定向到 ClickHouse Cloud 是非常重要的，您可以注册一个新帐户或使用现有帐户登录。如果不完成此步骤，我们将无法将您的 AWS Marketplace 订阅与 ClickHouse Cloud 关联。

4. 一旦您重定向到 ClickHouse Cloud，您可以选择使用现有帐户登录或注册新帐户。此步骤非常重要，以便我们能够将您的 ClickHouse Cloud 组织与 AWS Marketplace 账单绑定。

<br />

<Image img={aws_marketplace_payg_6} size="md" alt="ClickHouse Cloud sign in page" border/>

<br />

如果您是新的 ClickHouse Cloud 用户，请在页面底部点击 **注册**。系统会提示您创建新用户并验证电子邮件。验证您的电子邮件后，您可以离开 ClickHouse Cloud 登陆页面，使用新用户名登录 [https://console.clickhouse.cloud](https://console.clickhouse.cloud)。

<br />

<Image img={aws_marketplace_payg_7} size="md" alt="ClickHouse Cloud sign up page" border/>

<br />

请注意，如果您是新用户，还需要提供一些关于您业务的基本信息。请参见以下屏幕截图。

<br />

<Image img={aws_marketplace_payg_8} size="md" alt="ClickHouse Cloud sign up info form" border/>

<br />

<br />

<Image img={aws_marketplace_payg_9} size="md" alt="ClickHouse Cloud sign up info form 2" border/>

<br />

如果您是现有的 ClickHouse Cloud 用户，只需使用您的凭据登录。

5. 成功登录后，将创建一个新的 ClickHouse Cloud 组织。该组织将与您的 AWS 账单账户相连，所有使用情况将通过您的 AWS 账户进行计费。

6. 登录后，您可以确认您的账单确实与 AWS Marketplace 绑定，并开始设置您的 ClickHouse Cloud 资源。

<br />

<Image img={aws_marketplace_payg_10} size="md" alt="ClickHouse Cloud view AWS Marketplace billing" border/>

<br />

<Image img={aws_marketplace_payg_11} size="md" alt="ClickHouse Cloud new services page" border/>

<br />

6. 您应该会收到一封确认注册的电子邮件：

<br />

<Image img={aws_marketplace_payg_12} size="md" alt="AWS Marketplace confirmation email" border/>

<br />

如果您遇到任何问题，请随时联系我们的 [支持团队](https://clickhouse.com/support/program)。
