---
'slug': '/cloud/billing/marketplace/gcp-marketplace-payg'
'title': 'GCP 市场 PAYG'
'description': '通过 GCP 市场 (PAYG) 订阅 ClickHouse Cloud。'
'keywords':
- 'gcp'
- 'marketplace'
- 'billing'
- 'PAYG'
---

import gcp_marketplace_payg_1 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-payg-1.png';
import gcp_marketplace_payg_2 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-payg-2.png';
import gcp_marketplace_payg_3 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-payg-3.png';
import gcp_marketplace_payg_4 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-payg-4.png';
import aws_marketplace_payg_6 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-6.png';
import aws_marketplace_payg_7 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-7.png';
import aws_marketplace_payg_8 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-8.png';
import aws_marketplace_payg_9 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-9.png';
import gcp_marketplace_payg_5 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-payg-5.png';
import aws_marketplace_payg_11 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-11.png';
import gcp_marketplace_payg_6 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-payg-6.png';
import Image from '@theme/IdealImage';

开始使用 [GCP Marketplace](https://console.cloud.google.com/marketplace) 上的 ClickHouse Cloud，选择 PAYG（按需付费）公共优惠。

## 前提条件 {#prerequisites}

- 一个由您的计费管理员启用购买权限的 GCP 项目。
- 要在 GCP Marketplace 上订阅 ClickHouse Cloud，您必须使用具有购买权限的帐户登录并选择适当的项目。

## 注册步骤 {#steps-to-sign-up}

1. 前往 [GCP Marketplace](https://cloud.google.com/marketplace) 并搜索 ClickHouse Cloud。确保您已选择正确的项目。

<Image img={gcp_marketplace_payg_1} size="md" alt="GCP Marketplace 首页" border/>

2. 点击 [产品列表](https://console.cloud.google.com/marketplace/product/clickhouse-public/clickhouse-cloud)，然后点击 **订阅**。

<Image img={gcp_marketplace_payg_2} size="md" alt="GCP Marketplace 中的 ClickHouse Cloud" border/>

3. 在下一屏上，配置订阅：

- 计划默认为“ClickHouse Cloud”
- 订阅时间框架是“每月”
- 选择适当的计费帐户
- 接受条款并点击 **订阅**

<br />

<Image img={gcp_marketplace_payg_3} size="sm" alt="在 GCP Marketplace 中配置订阅" border/>

<br />

4. 点击 **订阅** 后，您将看到一个 **使用 ClickHouse 注册** 的弹窗。

<br />

<Image img={gcp_marketplace_payg_4} size="md" alt="GCP Marketplace 注册弹窗" border/>

<br />

5. 请注意，此时设置尚未完成。您需要点击 **设置您的帐户** 以跳转到 ClickHouse Cloud 并注册账号。

6. 一旦您跳转到 ClickHouse Cloud，您可以用现有账号登录，或使用新账号注册。此步骤非常重要，以便将您的 ClickHouse Cloud 组织与 GCP Marketplace 计费绑定。

<br />

<Image img={aws_marketplace_payg_6} size="md" alt="ClickHouse Cloud 登录页面" border/>

<br />

如果您是新的 ClickHouse Cloud 用户，请在页面底部点击 **注册**。系统会提示您创建新用户并验证电子邮件。验证电子邮件后，您可以离开 ClickHouse Cloud 登录页面，并使用新用户名在 [https://console.clickhouse.cloud](https://console.clickhouse.cloud) 登录。

<br />

<Image img={aws_marketplace_payg_7} size="md" alt="ClickHouse Cloud 注册页面" border/>

<br />

请注意，如果您是新用户，还需要提供一些关于您业务的基本信息。请查看下面的截图。

<br />

<Image img={aws_marketplace_payg_8} size="md" alt="ClickHouse Cloud 注册信息表单" border/>

<br />

<Image img={aws_marketplace_payg_9} size="md" alt="ClickHouse Cloud 注册信息表单 2" border/>

<br />

如果您是现有 ClickHouse Cloud 用户，只需使用您的凭据登录即可。

7. 登录成功后，将创建一个新的 ClickHouse Cloud 组织。该组织将与您的 GCP 计费帐户关联，所有使用情况将通过您的 GCP 帐户收费。

8. 登录后，您可以确认您的计费与 GCP Marketplace 实际关联，并开始设置您的 ClickHouse Cloud 资源。

<br />

<Image img={gcp_marketplace_payg_5} size="md" alt="ClickHouse Cloud 登录页面" border/>

<br />

<Image img={aws_marketplace_payg_11} size="md" alt="ClickHouse Cloud 新服务页面" border/>

<br />

9. 您应该会收到一封确认注册的电子邮件：

<br />
<br />

<Image img={gcp_marketplace_payg_6} size="md" alt="GCP Marketplace 确认电子邮件" border/>

<br />

<br />

如果您遇到任何问题，请随时联系我们的 [支持团队](https://clickhouse.com/support/program)。
