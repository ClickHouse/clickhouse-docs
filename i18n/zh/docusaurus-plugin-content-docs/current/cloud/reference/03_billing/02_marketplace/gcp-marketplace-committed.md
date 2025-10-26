---
'slug': '/cloud/billing/marketplace/gcp-marketplace-committed-contract'
'title': 'GCP Marketplace 承诺合同'
'description': '通过 GCP Marketplace 订阅 ClickHouse Cloud（承诺合同）'
'keywords':
- 'gcp'
- 'google'
- 'marketplace'
- 'billing'
- 'committed'
- 'committed contract'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import gcp_marketplace_committed_1 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-committed-1.png';
import gcp_marketplace_committed_2 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-committed-2.png';
import gcp_marketplace_committed_3 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-committed-3.png';
import gcp_marketplace_committed_4 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-committed-4.png';
import gcp_marketplace_committed_5 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-committed-5.png';
import gcp_marketplace_committed_6 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-committed-6.png';
import gcp_marketplace_committed_7 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-committed-7.png';
import aws_marketplace_payg_6 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-6.png';
import aws_marketplace_payg_7 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-7.png';
import aws_marketplace_payg_8 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-8.png';
import aws_marketplace_payg_9 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-9.png';
import gcp_marketplace_payg_5 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-payg-5.png';
import aws_marketplace_payg_11 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-11.png';
import gcp_marketplace_payg_6 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-payg-6.png';

通过签订承诺合同在 [GCP Marketplace](https://console.cloud.google.com/marketplace) 上开始使用 ClickHouse Cloud。承诺合同，也称为私有报价，允许客户在一段时间内承诺在 ClickHouse Cloud 上支出一定金额。

## 前提条件 {#prerequisites}

- 根据特定合同条款 从 ClickHouse 获得的私有报价。

## 注册步骤 {#steps-to-sign-up}

1. 您应该已经收到一封电子邮件，里面包含审核和接受您的私有报价的链接。

<br />

<Image img={gcp_marketplace_committed_1} size="md" alt="GCP Marketplace 私有报价电子邮件" border />

<br />

2. 点击电子邮件中的 **Review Offer** 链接。这将带您到包含私有报价详细信息的 GCP Marketplace 页面。

<br />

<Image img={gcp_marketplace_committed_2} size="md" alt="GCP Marketplace 报价摘要" border/>

<br />

<Image img={gcp_marketplace_committed_3} size="md" alt="GCP Marketplace 定价摘要" border/>

<br />

3. 审核私有报价的详细信息，如果一切正确，请点击 **Accept**。

<br />

<Image img={gcp_marketplace_committed_4} size="md" alt="GCP Marketplace 接受页面" border/>

<br />

4. 点击 **Go to product page**。

<br />

<Image img={gcp_marketplace_committed_5} size="md" alt="GCP Marketplace 接受确认" border/>

<br />

5. 点击 **Manage on provider**。

<br />

<Image img={gcp_marketplace_committed_6} size="md" alt="GCP Marketplace ClickHouse Cloud 页面" border/>

<br />

在这一点上重定向到 ClickHouse Cloud 并注册或登录是至关重要的。未完成此步骤，我们将无法将您的 GCP Marketplace 订阅与 ClickHouse Cloud 连接。

<br />

<Image img={gcp_marketplace_committed_7} size="md" alt="GCP Marketplace 离开网站确认模态" border/>

<br />

6. 一旦您重定向到 ClickHouse Cloud，您可以使用现有帐户登录，也可以注册新帐户。

<br />

<Image img={aws_marketplace_payg_6} size="md" alt="ClickHouse Cloud 登录页面" border/>

<br />

如果您是新的 ClickHouse Cloud 用户，请在页面底部点击 **Register**。系统会提示您创建新用户并验证电子邮件。验证您的电子邮件后，您可以离开 ClickHouse Cloud 登录页面，并使用新用户名登录 [https://console.clickhouse.cloud](https://console.clickhouse.cloud)。

<br />

<Image img={aws_marketplace_payg_7} size="md" alt="ClickHouse Cloud 注册页面" border/>

<br />

请注意，如果您是新用户，您还需要提供一些有关您业务的基本信息。请参见下面的屏幕截图。

<br />

<Image img={aws_marketplace_payg_8} size="md" alt="ClickHouse Cloud 注册信息表单" border/>

<br />

<Image img={aws_marketplace_payg_9} size="md" alt="ClickHouse Cloud 注册信息表单 2" border/>

<br />

如果您是现有的 ClickHouse Cloud 用户，只需使用您的凭据登录。

7. 成功登录后，将创建一个新的 ClickHouse Cloud 组织。该组织将与您的 GCP 计费帐户连接，所有使用情况将通过您的 GCP 帐户计费。

8. 登录后，您可以确认您的计费确实与 GCP Marketplace 相关，并开始设置您的 ClickHouse Cloud 资源。

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
