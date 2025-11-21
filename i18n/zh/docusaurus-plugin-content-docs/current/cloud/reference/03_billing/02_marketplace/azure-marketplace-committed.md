---
slug: /cloud/billing/marketplace/azure-marketplace-committed-contract
title: 'Azure Marketplace 承诺合约'
description: '通过 Azure Marketplace 签订承诺合约订阅 ClickHouse Cloud'
keywords: ['Microsoft', 'Azure', 'marketplace', '计费', '承诺合约', '承诺合同']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import azure_marketplace_committed_1 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-committed-1.png';
import azure_marketplace_committed_2 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-committed-2.png';
import azure_marketplace_committed_3 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-committed-3.png';
import azure_marketplace_committed_4 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-committed-4.png';
import azure_marketplace_committed_5 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-committed-5.png';
import azure_marketplace_committed_6 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-committed-6.png';
import azure_marketplace_committed_7 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-committed-7.png';
import azure_marketplace_committed_8 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-committed-8.png';
import azure_marketplace_committed_9 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-committed-9.png';
import aws_marketplace_payg_8 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-8.png';
import aws_marketplace_payg_9 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-9.png';
import azure_marketplace_payg_11 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-11.png';
import azure_marketplace_payg_12 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-12.png';

通过在 [Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps) 上签订承诺消费合约来开始使用 ClickHouse Cloud。承诺消费合约（也称为 Private Offer）允许客户在一定期限内预先承诺在 ClickHouse Cloud 上消费指定金额。


## 前提条件 {#prerequisites}

- 基于特定合同条款的 ClickHouse 私有优惠。


## 注册步骤 {#steps-to-sign-up}

1. 您应该已收到一封包含链接的电子邮件,用于查看并接受您的专属优惠。

<br />

<Image
  img={azure_marketplace_committed_1}
  size='md'
  alt='Azure Marketplace 专属优惠电子邮件'
  border
/>

<br />

2. 点击电子邮件中的 **Review Private Offer** 链接。这将带您进入 Azure Marketplace 页面,其中包含专属优惠详情。

<br />

<Image
  img={azure_marketplace_committed_2}
  size='md'
  alt='Azure Marketplace 专属优惠详情'
  border
/>

<br />

3. 接受优惠后,您将进入 **Private Offer Management** 页面。Azure 可能需要一些时间来准备可供购买的优惠。

<br />

<Image
  img={azure_marketplace_committed_3}
  size='md'
  alt='Azure Marketplace Private Offer Management 页面'
  border
/>

<br />

<Image
  img={azure_marketplace_committed_4}
  size='md'
  alt='Azure Marketplace Private Offer Management 页面加载中'
  border
/>

<br />

4. 几分钟后,刷新页面。优惠应该已准备好进行 **Purchase**。

<br />

<Image
  img={azure_marketplace_committed_5}
  size='md'
  alt='Azure Marketplace Private Offer Management 页面已启用购买'
  border
/>

<br />

5. 点击 **Purchase** - 您将看到一个弹出窗口打开。完成以下内容:

<br />

- 订阅和资源组
- 为 SaaS 订阅提供名称
- 选择您拥有专属优惠的计费方案。只有创建专属优惠的期限(例如 1 年)才会有相应金额。其他计费期限选项的金额将为 $0。
- 选择是否需要循环计费。如果未选择循环计费,合同将在计费周期结束时终止,资源将被设置为停用状态。
- 点击 **Review + subscribe**。

<br />

<Image
  img={azure_marketplace_committed_6}
  size='md'
  alt='Azure Marketplace 订阅表单'
  border
/>

<br />

6. 在下一个页面上,查看所有详细信息并点击 **Subscribe**。

<br />

<Image
  img={azure_marketplace_committed_7}
  size='md'
  alt='Azure Marketplace 订阅确认'
  border
/>

<br />

7. 在下一个页面上,您将看到 **Your SaaS subscription in progress**。

<br />

<Image
  img={azure_marketplace_committed_8}
  size='md'
  alt='Azure Marketplace 订阅提交页面'
  border
/>

<br />

8. 准备就绪后,您可以点击 **Configure account now**。请注意,这是将 Azure 订阅绑定到您账户的 ClickHouse Cloud 组织的关键步骤。如果没有此步骤,您的 Marketplace 订阅将不完整。

<br />

<Image
  img={azure_marketplace_committed_9}
  size='md'
  alt='Azure Marketplace 立即配置账户按钮'
  border
/>

<br />

9. 您将被重定向到 ClickHouse Cloud 注册或登录页面。您可以使用新账户注册或使用现有账户登录。登录后,将创建一个新组织,该组织已准备好使用并通过 Azure Marketplace 计费。

10. 在继续之前,您需要回答几个问题 - 地址和公司详细信息。

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

11. 点击 **Complete sign up** 后,您将进入 ClickHouse Cloud 中的组织,在那里您可以查看计费页面以确保您通过 Azure Marketplace 计费,并可以创建服务。

<br />

<br />

<Image
  img={azure_marketplace_payg_11}
  size='sm'
  alt='ClickHouse Cloud 注册信息表单'
  border
/>

<br />

<br />

<Image
  img={azure_marketplace_payg_12}
  size='md'
  alt='ClickHouse Cloud 注册信息表单'
  border
/>

<br />

如果您遇到任何问题,请随时联系[我们的支持团队](https://clickhouse.com/support/program)。
