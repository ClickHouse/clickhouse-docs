---
'slug': '/cloud/billing/marketplace/aws-marketplace-payg'
'title': 'AWS Marketplace PAYG'
'description': '通过 AWS Marketplace (PAYG) 订阅 ClickHouse Cloud.'
'keywords':
- 'aws'
- 'marketplace'
- 'billing'
- 'PAYG'
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
import aws_marketplace_payg_10 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-10.png';
import aws_marketplace_payg_11 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-11.png';
import aws_marketplace_payg_12 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-12.png';
import Image from '@theme/IdealImage';

开始通过[AWS Marketplace](https://aws.amazon.com/marketplace)的PAYG（按需付费）公共报价设置ClickHouse Cloud。

## 前提条件 {#prerequisites}

- 一个由您的账单管理员启用购买权限的AWS账户。
- 要进行购买，您必须使用此账户登录AWS Marketplace。

## 注册步骤 {#steps-to-sign-up}

1. 前往[AWS Marketplace](https://aws.amazon.com/marketplace)并搜索ClickHouse Cloud。

<br />

<Image img={aws_marketplace_payg_1} size="md" alt="AWS Marketplace首页" border/>

<br />

2. 点击[列表](https://aws.amazon.com/marketplace/pp/prodview-jettukeanwrfc)，然后点击**查看购买选项**。

<br />

<Image img={aws_marketplace_payg_2} size="md" alt="AWS Marketplace中搜索ClickHouse" border/>

<br />

3. 在下一个屏幕上，配置合同：
- **合同期限** - PAYG合同按月进行。
- **续订设置** - 您可以选择合同是否自动续订。
请注意，如果您未启用自动续订，您的组织将在账单周期结束时自动进入宽限期，然后被停用。

- **合同选项** - 您可以在此文本框中输入任何数字（或仅输入1）。这不会影响您支付的价格，因为这些单位的公共报价价格为$0。通常在接受ClickHouse Cloud的私人报价时使用这些单位。

- **采购订单** - 这是可选的，您可以忽略此项。

<br />

<Image img={aws_marketplace_payg_3} size="md" alt="AWS Marketplace配置合同" border/>

<br />

填写完上述信息后，点击**创建合同**。您可以确认显示的合同价格为零美元，这基本上意味着您无需支付任何费用，仅需根据使用情况收取费用。

<br />

<Image img={aws_marketplace_payg_4} size="md" alt="AWS Marketplace确认合同" border/>

<br />

4. 一旦您点击**创建合同**，您将看到一个确认和支付的模态框（0美元到期）。

5. 一旦您点击**立即付款**，您将看到确认您现在已订阅ClickHouse Cloud的AWS Marketplace报价。

<br />

<Image img={aws_marketplace_payg_5} size="md" alt="AWS Marketplace支付确认" border/>

<br />

6. 请注意，此时设置尚未完成。您需要通过点击**设置您的账户**并在ClickHouse Cloud上注册来继续。

7. 一旦您重定向到ClickHouse Cloud，您可以选择使用现有账户登录，或注册新账户。这一步非常重要，以便我们可以将您的ClickHouse Cloud组织与AWS Marketplace账单绑定。

<br />

<Image img={aws_marketplace_payg_6} size="md" alt="ClickHouse Cloud登录页面" border/>

<br />

如果您是新用户，请在页面底部点击**注册**。系统将提示您创建新用户并验证电子邮件。验证邮件后，您可以离开ClickHouse Cloud登录页面，并使用新用户名登录到[https://console.clickhouse.cloud](https://console.clickhouse.cloud)。

<br />

<Image img={aws_marketplace_payg_7} size="md" alt="ClickHouse Cloud注册页面" border/>

<br />

请注意，如果您是新用户，您还需要提供有关您业务的一些基本信息。请查看下面的截图。

<br />

<Image img={aws_marketplace_payg_8} size="md" alt="ClickHouse Cloud注册信息表单" border/>

<br />

<br />

<Image img={aws_marketplace_payg_9} size="md" alt="ClickHouse Cloud注册信息表单2" border/>

<br />

如果您是现有的ClickHouse Cloud用户，请使用您的凭据直接登录。

8. 成功登录后，将会创建一个新的ClickHouse Cloud组织。该组织将与您的AWS账单账户连接，所有使用情况将通过您的AWS账户计费。

9. 登录后，您可以确认您的账单确实与AWS Marketplace绑定，并开始设置您的ClickHouse Cloud资源。

<br />

<Image img={aws_marketplace_payg_10} size="md" alt="ClickHouse Cloud查看AWS Marketplace账单" border/>

<br />

<Image img={aws_marketplace_payg_11} size="md" alt="ClickHouse Cloud新服务页面" border/>

<br />

10. 您应该会收到一封确认注册的电子邮件：

<br />

<Image img={aws_marketplace_payg_12} size="md" alt="AWS Marketplace确认邮件" border/>

<br />

如果您遇到任何问题，请随时联系[我们的支持团队](https://clickhouse.com/support/program)。
