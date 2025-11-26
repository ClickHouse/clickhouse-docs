---
sidebar_label: '支付阈值'
slug: /cloud/billing/payment-thresholds
title: '支付阈值'
description: 'ClickHouse Cloud 的支付阈值和自动开票。'
keywords: ['计费', '支付阈值', '自动开票', '发票']
doc_type: 'guide'
---

# 付款阈值

当你在某一 ClickHouse Cloud 计费周期内的应付金额达到 10,000 美元（USD）或等值金额时，系统将会自动从你的付款方式中扣款。扣款失败将在宽限期结束后导致你的服务被暂停或终止。 

:::note
此付款阈值不适用于与 ClickHouse 签订了承诺消费合同或其他协商合同协议的客户。
:::

如果你的组织在计费周期内的消费金额达到付款阈值的 90%，并且预计将在该周期中途超过该阈值，与该组织关联的计费邮箱将会收到一封电子邮件通知。当你超过付款阈值时，你还会收到电子邮件通知以及一份发票。

根据客户的请求，或由 ClickHouse 财务团队决定，这些付款阈值可以调整为低于 10,000 美元。如有任何问题，请联系 support@clickhouse.com 获取更多详情。