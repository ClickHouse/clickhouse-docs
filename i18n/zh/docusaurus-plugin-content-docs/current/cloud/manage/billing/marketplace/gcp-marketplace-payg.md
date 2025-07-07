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

开始通过 PAYG（按需付费）公共报价在 [GCP Marketplace](https://console.cloud.google.com/marketplace) 上使用 ClickHouse Cloud。

## 前提条件 {#prerequisites}

- 一个由您的计费管理员启用采购权限的 GCP 项目。
- 要在 GCP Marketplace 上订阅 ClickHouse Cloud，您必须使用具有采购权限的帐户登录并选择相应的项目。

## 注册步骤 {#steps-to-sign-up}

1. 前往 [GCP Marketplace](https://cloud.google.com/marketplace) 并搜索 ClickHouse Cloud。确保您选择了正确的项目。

<Image img={gcp_marketplace_payg_1} size="md" alt="GCP Marketplace 首页" border/>

2. 点击 [列表](https://console.cloud.google.com/marketplace/product/clickhouse-public/clickhouse-cloud)，然后点击 **Subscribe**。

<Image img={gcp_marketplace_payg_2} size="md" alt="GCP Marketplace 中的 ClickHouse Cloud" border/>

3. 在下一个屏幕上，配置订阅：

- 计划默认设置为 "ClickHouse Cloud"
- 订阅时间框架为 "每月"
- 选择适当的计费账户
- 接受条款并点击 **Subscribe**

<br />

<Image img={gcp_marketplace_payg_3} size="sm" alt="在 GCP Marketplace 中配置订阅" border/>

<br />

4. 一旦您点击 **Subscribe**，您将看到一个模态窗口 **Sign up with ClickHouse**。

<br />

<Image img={gcp_marketplace_payg_4} size="md" alt="GCP Marketplace 注册模态窗口" border/>

<br />

5. 请注意，此时设置尚未完成。您需要通过点击 **Set up your account** 并在 ClickHouse Cloud 上注册来进行重定向。

6. 一旦您重定向到 ClickHouse Cloud，您可以使用现有帐户登录，或使用新帐户注册。此步骤非常重要，这样我们才能将您的 ClickHouse Cloud 组织与 GCP Marketplace 计费绑定。

<br />

<Image img={aws_marketplace_payg_6} size="md" alt="ClickHouse Cloud 登录页面" border/>

<br />

如果您是 ClickHouse Cloud 新用户，请在页面底部点击 **Register**。系统会提示您创建新用户并验证电子邮件。验证您的电子邮件后，您可以离开 ClickHouse Cloud 登录页面，并使用新用户名登录 [https://console.clickhouse.cloud](https://console.clickhouse.cloud)。

<br />

<Image img={aws_marketplace_payg_7} size="md" alt="ClickHouse Cloud 注册页面" border/>

<br />

请注意，如果您是新用户，您还需要提供一些有关您的业务的基本信息。请参见下面的屏幕截图。

<br />

<Image img={aws_marketplace_payg_8} size="md" alt="ClickHouse Cloud 注册信息表单" border/>

<br />

<Image img={aws_marketplace_payg_9} size="md" alt="ClickHouse Cloud 注册信息表单 2" border/>

<br />

如果您是现有 ClickHouse Cloud 用户，只需使用您的凭据登录。

7. 成功登录后，将创建一个新的 ClickHouse Cloud 组织。该组织将与您的 GCP 计费账户连接，所有使用将通过您的 GCP 账户计费。

8. 登录后，您可以确认您的计费确实与 GCP Marketplace 相关联，并开始设置您的 ClickHouse Cloud 资源。

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

如果您遇到任何问题，请随时联系 [我们的支持团队](https://clickhouse.com/support/program)。
