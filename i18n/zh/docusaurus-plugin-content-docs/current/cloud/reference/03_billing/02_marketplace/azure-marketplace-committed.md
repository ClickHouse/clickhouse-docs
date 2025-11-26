---
slug: /cloud/billing/marketplace/azure-marketplace-committed-contract
title: 'Azure Marketplace 承诺消费合同'
description: '通过 Azure Marketplace 订阅 ClickHouse Cloud（承诺消费合同）'
keywords: ['Microsoft', 'Azure', 'marketplace', '计费', '承诺消费', '承诺消费合同']
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

通过在 [Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps) 签订承诺合同开始使用 ClickHouse Cloud。承诺合同（也称为 Private Offer）允许客户在约定期限内承诺在 ClickHouse Cloud 上支出一定金额。


## 先决条件 {#prerequisites}

- ClickHouse 基于特定合同条款提供的专属报价。



## 注册步骤 {#steps-to-sign-up}

1. 您应该已经收到一封包含链接的电子邮件，用于查看并接受您的专属私有优惠（private offer）。

<br />

<Image img={azure_marketplace_committed_1} size="md" alt="Azure Marketplace 私有优惠电子邮件" border/>

<br />

2. 点击邮件中的 **Review Private Offer** 链接。这会将您带到 Azure Marketplace 页面，在那里可以查看该私有优惠的详细信息。

<br />

<Image img={azure_marketplace_committed_2} size="md" alt="Azure Marketplace 私有优惠详情" border/>

<br />

3. 接受优惠后，您将进入 **Private Offer Management** 页面。Azure 可能需要一些时间来准备该优惠以供购买。

<br />

<Image img={azure_marketplace_committed_3} size="md" alt="Azure Marketplace 私有优惠管理页面" border/>

<br />

<Image img={azure_marketplace_committed_4} size="md" alt="Azure Marketplace 私有优惠管理页面加载中" border/>

<br />

4. 几分钟后，刷新页面。此时该优惠应该已准备好进行 **Purchase**（购买）。

<br />

<Image img={azure_marketplace_committed_5} size="md" alt="Azure Marketplace 私有优惠管理页面已可购买" border/>

<br />

5. 点击 **Purchase** —— 会弹出一个侧边面板。完成以下操作：

<br />

- 选择 Subscription 和 resource group  
- 为 SaaS 订阅指定一个名称  
- 选择与您的私有优惠对应的计费方案。只有创建私有优惠时所使用的计费期限（例如 1 年）会显示收费金额。其他计费期限选项的金额将为 $0。  
- 选择是否启用循环计费。如果未选择循环计费，合约将在计费周期结束时终止，相关资源将被标记为退役。  
- 点击 **Review + subscribe**。

<br />

<Image img={azure_marketplace_committed_6} size="md" alt="Azure Marketplace 订阅表单" border/>

<br />

6. 在下一个页面中，检查所有详细信息并点击 **Subscribe**。

<br />

<Image img={azure_marketplace_committed_7} size="md" alt="Azure Marketplace 订阅确认" border/>

<br />

7. 在接下来的页面中，您会看到 **Your SaaS subscription in progress**（您的 SaaS 订阅正在处理中）。

<br />

<Image img={azure_marketplace_committed_8} size="md" alt="Azure Marketplace 订阅提交页面" border/>

<br />

8. 就绪后，您可以点击 **Configure account now**。请注意，这是一个关键步骤，它会将该 Azure 订阅与您账户中的 ClickHouse Cloud 组织绑定。如果跳过此步骤，您的 Marketplace 订阅将不会完成。

<br />

<Image img={azure_marketplace_committed_9} size="md" alt="Azure Marketplace 立即配置账户按钮" border/>

<br />

9. 您将被重定向到 ClickHouse Cloud 的注册或登录页面。您可以使用新账户注册，或使用已有账户登录。登录完成后，将为您创建一个新组织，该组织已准备好通过 Azure Marketplace 进行计费并供您使用。

10. 在继续之前，您需要回答几个问题——包括地址和公司详细信息。

<br />

<Image img={aws_marketplace_payg_8} size="md" alt="ClickHouse Cloud 注册信息表单" border/>

<br />

<Image img={aws_marketplace_payg_9} size="md" alt="ClickHouse Cloud 注册信息表单 2" border/>

<br />

11. 点击 **Complete sign up** 后，您将进入 ClickHouse Cloud 中的组织页面，在那里您可以查看计费页面，以确认您是通过 Azure Marketplace 计费，并且可以创建服务。

<br />

<br />

<Image img={azure_marketplace_payg_11} size="sm" alt="ClickHouse Cloud 注册信息表单" border/>

<br />

<br />

<Image img={azure_marketplace_payg_12} size="md" alt="ClickHouse Cloud 注册信息表单" border/>

<br />

如果您遇到任何问题，请随时联系[我们的支持团队](https://clickhouse.com/support/program)。
