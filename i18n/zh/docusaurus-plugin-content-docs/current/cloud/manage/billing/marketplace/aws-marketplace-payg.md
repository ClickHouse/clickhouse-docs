---
'slug': '/cloud/billing/marketplace/aws-marketplace-payg'
'title': 'AWS Marketplace 按使用付费 (PAYG)'
'description': '通过 AWS Marketplace (按使用付费) 订阅 ClickHouse Cloud。'
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

开始使用 [AWS Marketplace](https://aws.amazon.com/marketplace) 上的 ClickHouse Cloud，通过 PAYG（按需付费）公共优惠。

## 先决条件 {#prerequisites}

- 一个由您的账单管理员启用购买权限的 AWS 账户。
- 要进行购买，您必须使用此账户登录 AWS Marketplace。

## 注册步骤 {#steps-to-sign-up}

1. 前往 [AWS Marketplace](https://aws.amazon.com/marketplace) 并搜索 ClickHouse Cloud。

<br />

<Image img={aws_marketplace_payg_1} size="md" alt="AWS Marketplace 首页" border/>

<br />

2. 点击 [列表](https://aws.amazon.com/marketplace/pp/prodview-jettukeanwrfc)，然后点击 **查看购买选项**。

<br />

<Image img={aws_marketplace_payg_2} size="md" alt="AWS Marketplace 搜索 ClickHouse" border/>

<br />

3. 在下一个屏幕上，配置合同：
- **合同期限** - PAYG 合同按月运行。
- **续订设置** - 您可以选择自动续订合同与否。
请注意，如果您不启用自动续订，您的组织在账单周期结束时将自动进入宽限期，然后被停用。

- **合同选项** - 您可以在此文本框中输入任何数量（或仅输入 1）。这不会影响您支付的价格，因为公共优惠的这些单位价格为 $0。这些单位通常用于接受 ClickHouse Cloud 的私人优惠。

- **采购订单** - 这是可选的，您可以忽略此项。

<br />

<Image img={aws_marketplace_payg_3} size="md" alt="AWS Marketplace 配置合同" border/>

<br />

填写完以上信息后，点击 **创建合同**。您可以确认显示的合同价格为零美元，这意味着您没有到期付款，将根据使用情况产生费用。

<br />

<Image img={aws_marketplace_payg_4} size="md" alt="AWS Marketplace 确认合同" border/>

<br />

4. 一旦您点击 **创建合同**，您将看到一个模态窗口以确认并付款（$0 到期）。

5. 点击 **立即支付** 后，您将收到您现在已订阅 ClickHouse Cloud 的 AWS Marketplace 产品的确认。

<br />

<Image img={aws_marketplace_payg_5} size="md" alt="AWS Marketplace 付款确认" border/>

<br />

6. 请注意，此时设置尚未完成。您需要点击 **设置您的账户** 并在 ClickHouse Cloud 上注册。

7. 一旦您重定向到 ClickHouse Cloud，您可以使用现有账户登录，或使用新账户注册。此步骤非常重要，以便我们将您的 ClickHouse Cloud 组织绑定到 AWS Marketplace 的账单。

<br />

<Image img={aws_marketplace_payg_6} size="md" alt="ClickHouse Cloud 登录页面" border/>

<br />

如果您是新用户，请在页面底部点击 **注册**。系统将提示您创建新用户并验证电子邮件。验证电子邮件后，您可以离开 ClickHouse Cloud 登录页面，并使用新用户名登录 [https://console.clickhouse.cloud](https://console.clickhouse.cloud)。

<br />

<Image img={aws_marketplace_payg_7} size="md" alt="ClickHouse Cloud 注册页面" border/>

<br />

请注意，如果您是新用户，您还需要提供一些关于您业务的基本信息。请查看下面的截图。

<br />

<Image img={aws_marketplace_payg_8} size="md" alt="ClickHouse Cloud 注册信息表单" border/>

<br />

<br />

<Image img={aws_marketplace_payg_9} size="md" alt="ClickHouse Cloud 注册信息表单 2" border/>

<br />

如果您是已存在的 ClickHouse Cloud 用户，请使用您的凭据登录。

8. 登录成功后，将创建一个新的 ClickHouse Cloud 组织。此组织将连接到您的 AWS 账单账户，所有使用情况将通过您的 AWS 账户计费。

9. 登录后，您可以确认您的账单确实与 AWS Marketplace 关联，并开始设置您的 ClickHouse Cloud 资源。

<br />

<Image img={aws_marketplace_payg_10} size="md" alt="ClickHouse Cloud 查看 AWS Marketplace 账单" border/>

<br />

<Image img={aws_marketplace_payg_11} size="md" alt="ClickHouse Cloud 新服务页面" border/>

<br />

10. 您应该会收到一封确认注册的电子邮件：

<br />

<Image img={aws_marketplace_payg_12} size="md" alt="AWS Marketplace 确认电子邮件" border/>

<br />

如果您遇到任何问题，请随时联系 [我们的支持团队](https://clickhouse.com/support/program)。
