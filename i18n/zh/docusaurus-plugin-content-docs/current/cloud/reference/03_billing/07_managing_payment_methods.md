---
sidebar_label: '管理付款方式'
slug: /manage/manage/billing/managing-payment-methods
title: '管理付款方式'
description: '管理 Marketplace 订阅并添加备用信用卡'
keywords: ['账单']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import add_payment_method from '@site/static/images/cloud/reference/billing/01-add-payment-method.png';
import edit_credit_card from '@site/static/images/cloud/reference/billing/02-edit-credit-card.png';
import edit_payment_method from '@site/static/images/cloud/reference/billing/03-edit-payment-method.png';
import edit_payment_method_2 from '@site/static/images/cloud/reference/billing/04-edit-payment-method.png';
import add_backup from '@site/static/images/cloud/reference/billing/05-add-backup.png';

本文档介绍如何在 ClickHouse Cloud 中管理和更新贵组织的计费方式，包括在信用卡计费和 Marketplace 计费之间切换、添加备用信用卡，以及在多个组织之间共享 Marketplace 订阅。

## 前提条件 \{#prerequisites\}

* 您必须在组织中拥有 Admin 或 Billing 角色，才能更新支付方式。
* 您可用的 marketplace 订阅，仅限于您在其他组织中以 Admin 或 Billing 角色管理的、当前处于有效状态的订阅。
* 要共享来自其他组织的 marketplace 订阅，您必须在当前组织和拥有该 marketplace 订阅的组织中都具有 Admin 或 Billing 角色。
* 您希望通过 marketplace 订阅计费的组织内所有服务，必须与该 marketplace 属于同一云服务商 (AWS、GCP 或 Azure) 。

:::note
您不能共享其他组织的信用卡。
如果您当前的支付方式是信用卡，并且想要更新，则必须输入新的信用卡信息。
:::

## 添加或更新信用卡支付方式 \{#add-update-cc-payment-method\}

如果您的组织当前采用信用卡付款，您可以在“Billing”页面更新信用卡信息。

### 如何添加或更新您的信用卡 \{#steps-add-update\}

1. 在 ClickHouse Cloud 控制台中，前往 **Billing**。
2. 如果您要添加信用卡，请点击页面顶部的 **添加支付方式** 按钮。

<Image img={add_payment_method} alt="添加支付方式" size="lg" />

3. 如果您要编辑信用卡，请点击页面顶部的 **编辑您的信用卡** 按钮。

<Image img={edit_credit_card} alt="编辑您的信用卡" size="lg" />

4. 在这两种情况下，请按照说明添加或更新您信用卡的账单地址信息。

## 将组织的计费切换到现有的市场订阅 \{#configure-billing-to-existing-mp-sub\}

如果您有多个组织，您可以：

* 将某个组织的计费方式从信用卡计费切换到已在您其他某个组织上启用的市场订阅。
* 将某个组织当前使用的市场订阅改为由其他组织使用的市场订阅。

### 如何将组织的计费方式从信用卡切换为已在您的其他组织中激活的 marketplace 订阅 \{#steps-switch-org-already-active\}

1. 进入 ClickHouse Cloud 控制台的 **Billing** 页面。
2. 点击 **payment method** 旁边的编辑图标。

<Image img={edit_payment_method} alt="编辑支付方式" size="lg" />

3. 在 **Edit payment method** 对话框中，您会看到当前信用卡显示为主要支付方式。
4. 在信用卡下方，会显示您其他组织中符合条件的 marketplace 订阅。每个条目都会显示 marketplace 类型 (例如 AWS Marketplace) 以及关联的组织名称。
5. 选择要用于支付此组织使用量费用的 marketplace 订阅。
6. 点击 **Update payment method** 确认。

### 如何将组织当前的 Marketplace 订阅切换为其他组织使用的订阅 \{#steps-switch-org-different-org\}

1. 前往 ClickHouse Cloud 控制台中的 **Billing** 页面。
2. 点击 **payment method** 旁边的编辑图标。

<Image img={edit_payment_method_2} alt="编辑 payment method" size="lg" />

3. 在 **Edit payment method** 对话框中，您会看到当前的 Marketplace 订阅列为支付方式。
4. 在当前 Marketplace 订阅下方，会显示您其他组织中符合条件的其他 Marketplace 订阅。每个条目都会显示 Marketplace 类型 (例如 AWS Marketplace) 以及关联的组织名称。
5. 选择要用于为该组织用量计费的新 Marketplace 订阅。
6. 点击 **Update payment method** 确认。

## 为 marketplace 组织添加备用信用卡 \{#add-backup-cc-to-marketplace-org\}

如果您组织的主要付款方式是 Marketplace 订阅，您可以添加一张信用卡作为备用付款方式。只有在我们无法通过 marketplace 订阅收取使用费用时，才会向这张备用信用卡收费 (例如订阅已取消或已过期) 。

:::note
使用 ClickHouse Cloud 时，您的组织至少需要配置一种有效且处于激活状态的计费方式 (Marketplace 订阅或信用卡) 。有关计费合规性的更多信息，请参阅[此处](/manage/clickhouse-cloud-billing-compliance#billing-compliance)。
:::

### 如何添加备用信用卡 \{#steps-add-backup-cc\}

1. 前往 ClickHouse Cloud 控制台中的 **Billing** 页面。
2. 在账单页面顶部，您会看到主要付款方式显示为 Marketplace 订阅，而备用付款方式显示为 **None**。
3. 点击 **add credit card** 按钮以设置备用付款方式。

<Image img={add_backup} alt="添加备用信用卡" size="lg" />

4. 按照说明添加或更新信用卡的账单地址信息。保存后，**Billing** 页面会显示备用信用卡以及主要的 Marketplace 订阅。

:::note
配置好备用信用卡后，您还可以点击该按钮编辑信用卡，并将其设为主要付款方式。
但如果您这样做，您的信用卡将成为该组织唯一的付款方式，您的 Marketplace 订阅也会从 ClickHouse Cloud 中被完全移除。
您需要返回您的 marketplace 账户，并按照[&quot;如何通过您的云服务商设置 Marketplace 计费&quot;](#set-up-marketplace-billing-from-cp)一节中的步骤重新配置。
:::

## 通过您的云服务商设置 Marketplace 计费 \{#set-up-marketplace-billing-from-cp\}

您也可以直接通过云市场设置或更新组织的 Marketplace 订阅，而无需通过 ClickHouse Cloud 控制台。

请根据 Marketplace 和订阅类型，按照以下说明操作：

* [AWS Marketplace PAYG](/cloud/billing/marketplace/aws-marketplace-payg)
* [AWS Marketplace 承诺消费合同](/cloud/billing/marketplace/aws-marketplace-committed-contract)
* [GCP Marketplace PAYG](/cloud/billing/marketplace/gcp-marketplace-payg)
* [GCP Marketplace 承诺消费合同](/cloud/billing/marketplace/gcp-marketplace-committed-contract)
* [Azure Marketplace PAYG](/cloud/billing/marketplace/azure-marketplace-payg)
* [Azure Marketplace 承诺消费合同](/cloud/billing/marketplace/azure-marketplace-committed-contract)

完成此流程后，所选组织的计费将关联到新的 Marketplace 订阅，ClickHouse Cloud 控制台中的计费页面也会反映此更新。

## 支持 \{#support\}

如果您遇到任何问题，请随时[联系支持团队](https://clickhouse.com/support/program)。

## 常见问题 \{#faqs\}

### 如果我在计费周期中途切换计费方式，我的使用费用会如何处理？ \{#what-happens-to-my-usage-charges-if-i-switch-billing-methods-mid-billing-cycle\}

这取决于切换方向：

从 Marketplace 计费切换到信用卡计费：从计费周期开始到切换时点的用量会发送到 Marketplace。自切换时点起至本计费周期结束的其余用量，将在计费周期结束时计入信用卡。

从信用卡计费切换到 Marketplace 计费：整个计费周期内所有尚未开具发票的用量都会发送到 Marketplace。