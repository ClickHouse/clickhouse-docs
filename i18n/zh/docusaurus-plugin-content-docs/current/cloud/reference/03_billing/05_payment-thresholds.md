---
sidebar_label: '支付阈值'
slug: /cloud/billing/payment-thresholds
title: '支付阈值'
description: 'ClickHouse Cloud 的支付阈值和自动开票。'
keywords: ['计费', '支付阈值', '自动开票', '发票']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import billing_1 from '@site/static/images/cloud/reference/billing_payment_threshhold.png';
import billing_2 from '@site/static/images/cloud/reference/billing_payment_threshhold_2.png';


## 支付阈值 \{#threshholds\}

如果您是按使用量付费（pay as you go）客户，并且在某个计费周期内对 ClickHouse Cloud 的应付金额达到 10,000 美元（或等值金额），系统会自动向为您的组织配置的支付方式扣款。

:::tip
此默认支付阈值金额可以调整为低于 10,000 美元。
如果您希望进行调整，请[联系支持](support@clickhouse.com)。
:::

扣款失败将在 14 天宽限期后导致您的服务被暂停。
如果您在一个计费周期内收到多张发票，则所有发票在收到时即视为到期，必须全部支付才能保持您的 ClickHouse Cloud 组织处于[合规](/manage/clickhouse-cloud-billing-compliance)状态。

如果您的自动付款扣款失败，可能是由于您配置的信用卡存在问题，或者您尚未在信用卡上设置电子授权（e-mandate），又或者您的信用卡不符合印度储备银行（RBI）关于处理定期在线交易电子授权的框架要求。
如果您的信用卡不符合 RBI 要求，您必须添加一种符合 RBI 要求的新支付方式，或者在您能够在该卡上设置电子授权之前，继续进行手动付款。

下面的示例展示了 Cloud 控制台中的计费 UI：

<Image img={billing_1} size="sm" alt="在 UI 中查找计费的位置"/>

<Image img={billing_2} size="lg" alt="账单"/>

从上述示例可以看到，在 2 月 28 日至 3 月 31 日的计费周期内发送了一张阈值发票，然后在同一计费周期内又针对超过 10,000 美元的剩余用量发送了另一张发票。

## 付款阈值通知 \{#threshholds-notifications\}

如果你的组织在计费周期内的消费金额达到付款阈值的 90%，并且预计将在该周期中途超过该阈值，与该组织关联的计费联系人邮箱将会收到一封电子邮件通知。
当你超过付款阈值时，你还会收到电子邮件通知以及一份发票。