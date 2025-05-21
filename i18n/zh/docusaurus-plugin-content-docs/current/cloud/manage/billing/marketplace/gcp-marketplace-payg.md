---
'slug': '/cloud/billing/marketplace/gcp-marketplace-payg'
'title': 'GCP Marketplace PAYG'
'description': 'Subscribe to ClickHouse Cloud through the GCP Marketplace (PAYG).'
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

开始在 [GCP Marketplace](https://console.cloud.google.com/marketplace) 上通过 PAYG（按需付费）公共优惠使用 ClickHouse Cloud。

## 先决条件 {#prerequisites}

- 一个已启用购买权限的 GCP 项目，由您的计费管理员管理。
- 要在 GCP Marketplace 上订阅 ClickHouse Cloud，您必须使用具有购买权限的帐户登录，并选择适当的项目。

## 注册步骤 {#steps-to-sign-up}

1. 前往 [GCP Marketplace](https://cloud.google.com/marketplace)，搜索 ClickHouse Cloud。确保选择了正确的项目。

<Image img={gcp_marketplace_payg_1} size="md" alt="GCP Marketplace 主页" border/>

2. 点击该 [列表](https://console.cloud.google.com/marketplace/product/clickhouse-public/clickhouse-cloud)，然后点击 **订阅**。

<Image img={gcp_marketplace_payg_2} size="md" alt="GCP Marketplace 中的 ClickHouse Cloud" border/>

3. 在下一个屏幕上，配置订阅：

- 计划默认为 "ClickHouse Cloud"
- 订阅时间框架为 "每月"
- 选择适当的计费帐户
- 接受条款并点击 **订阅**

<br />

<Image img={gcp_marketplace_payg_3} size="sm" alt="在 GCP Marketplace 中配置订阅" border/>

<br />

4. 一旦点击 **订阅**，您将看到一个模态框 **使用 ClickHouse 注册**。

<br />

<Image img={gcp_marketplace_payg_4} size="md" alt="GCP Marketplace 注册模态框" border/>

<br />

5. 请注意，此时设置尚未完成。您需要通过点击 **设置您的帐户** 并在 ClickHouse Cloud 上注册来进行重定向。

6. 一旦重定向到 ClickHouse Cloud，您可以使用现有帐户登录，或注册新帐户。这一步非常重要，以便我们能够将您的 ClickHouse Cloud 组织绑定到 GCP Marketplace 的计费。

<br />

<Image img={aws_marketplace_payg_6} size="md" alt="ClickHouse Cloud 登录页面" border/>

<br />

如果您是新用户，请点击页面底部的 **注册**。系统会提示您创建新用户并验证电子邮件。验证电子邮件后，您可以离开 ClickHouse Cloud 登录页面，并使用新用户名在 [https://console.clickhouse.cloud](https://console.clickhouse.cloud) 登录。

<br />

<Image img={aws_marketplace_payg_7} size="md" alt="ClickHouse Cloud 注册页面" border/>

<br />

请注意，如果您是新用户，还需要提供一些关于您业务的基本信息。请查看下面的截图。

<br />

<Image img={aws_marketplace_payg_8} size="md" alt="ClickHouse Cloud 注册信息表单" border/>

<br />

<Image img={aws_marketplace_payg_9} size="md" alt="ClickHouse Cloud 注册信息表单 2" border/>

<br />

如果您是现有的 ClickHouse Cloud 用户，只需使用您的凭据登录。

7. 登录成功后，将创建一个新的 ClickHouse Cloud 组织。该组织将连接到您的 GCP 计费帐户，所有使用情况将通过您的 GCP 帐户计费。

8. 登录后，您可以确认您的计费确实与 GCP Marketplace 关联，并开始设置您的 ClickHouse Cloud 资源。

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
