---
slug: /cloud/billing/marketplace/gcp-marketplace-committed-contract
title: 'GCP Marketplace 承诺消费合约'
description: '通过 GCP Marketplace 订阅 ClickHouse Cloud（承诺消费合约）'
keywords: ['gcp', 'google', 'marketplace', 'billing', 'committed', 'committed contract']
doc_type: 'guide'
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

通过在 [GCP Marketplace](https://console.cloud.google.com/marketplace) 上签订承诺合同来开始使用 ClickHouse Cloud。承诺合同（也称为 Private Offer）允许客户承诺在一定时间内在 ClickHouse Cloud 上消费特定金额。


## 前提条件 {#prerequisites}

- 基于特定合同条款的 ClickHouse 私有优惠。


## 注册步骤 {#steps-to-sign-up}

1. 您应该已收到一封包含链接的电子邮件,用于查看并接受您的专属优惠。

<br />

<Image
  img={gcp_marketplace_committed_1}
  size='md'
  alt='GCP Marketplace 专属优惠电子邮件'
  border
/>

<br />

2. 点击电子邮件中的 **Review Offer** 链接。这将带您进入 GCP Marketplace 页面,其中显示专属优惠的详细信息。

<br />

<Image
  img={gcp_marketplace_committed_2}
  size='md'
  alt='GCP Marketplace 优惠摘要'
  border
/>

<br />

<Image
  img={gcp_marketplace_committed_3}
  size='md'
  alt='GCP Marketplace 定价摘要'
  border
/>

<br />

3. 查看专属优惠的详细信息,如果一切正确,请点击 **Accept**。

<br />

<Image
  img={gcp_marketplace_committed_4}
  size='md'
  alt='GCP Marketplace 接受页面'
  border
/>

<br />

4. 点击 **Go to product page**。

<br />

<Image
  img={gcp_marketplace_committed_5}
  size='md'
  alt='GCP Marketplace 接受确认'
  border
/>

<br />

5. 点击 **Manage on provider**。

<br />

<Image
  img={gcp_marketplace_committed_6}
  size='md'
  alt='GCP Marketplace ClickHouse Cloud 页面'
  border
/>

<br />

此时重定向到 ClickHouse Cloud 并注册或登录至关重要。如果不完成此步骤,我们将无法将您的 GCP Marketplace 订阅关联到 ClickHouse Cloud。

<br />

<Image
  img={gcp_marketplace_committed_7}
  size='md'
  alt='GCP Marketplace 离开网站确认对话框'
  border
/>

<br />

6. 重定向到 ClickHouse Cloud 后,您可以使用现有账户登录,或注册新账户。

<br />

<Image
  img={aws_marketplace_payg_6}
  size='md'
  alt='ClickHouse Cloud 登录页面'
  border
/>

<br />

如果您是 ClickHouse Cloud 新用户,请点击页面底部的 **Register**。系统将提示您创建新用户并验证电子邮件地址。验证电子邮件后,您可以离开 ClickHouse Cloud 登录页面,并使用新用户名在 [https://console.clickhouse.cloud](https://console.clickhouse.cloud) 登录。

<br />

<Image
  img={aws_marketplace_payg_7}
  size='md'
  alt='ClickHouse Cloud 注册页面'
  border
/>

<br />

请注意,如果您是新用户,还需要提供一些关于您业务的基本信息。请参见下面的屏幕截图。

<br />

<Image
  img={aws_marketplace_payg_8}
  size='md'
  alt='ClickHouse Cloud 注册信息表单'
  border
/>

<br />

<Image
  img={aws_marketplace_payg_9}
  size='md'
  alt='ClickHouse Cloud 注册信息表单 2'
  border
/>

<br />

如果您是现有的 ClickHouse Cloud 用户,只需使用您的凭据登录即可。

7. 成功登录后,将创建一个新的 ClickHouse Cloud 组织。该组织将连接到您的 GCP 计费账户,所有使用量将通过您的 GCP 账户计费。

8. 登录后,您可以确认您的计费确实已关联到 GCP Marketplace,并开始设置您的 ClickHouse Cloud 资源。

<br />

<Image
  img={gcp_marketplace_payg_5}
  size='md'
  alt='ClickHouse Cloud 登录页面'
  border
/>

<br />

<Image
  img={aws_marketplace_payg_11}
  size='md'
  alt='ClickHouse Cloud 新服务页面'
  border
/>

<br />

9. 您应该会收到一封确认注册的电子邮件:

<br />
<br />

<Image
  img={gcp_marketplace_payg_6}
  size='md'
  alt='GCP Marketplace 确认电子邮件'
  border
/>

<br />

<br />

如果您遇到任何问题,请随时联系[我们的支持团队](https://clickhouse.com/support/program)。
