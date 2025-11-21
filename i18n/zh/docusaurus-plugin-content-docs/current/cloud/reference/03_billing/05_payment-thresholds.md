---
sidebar_label: '付款阈值'
slug: /cloud/billing/payment-thresholds
title: '付款阈值'
description: 'ClickHouse Cloud 的付款阈值和自动开具发票。'
keywords: ['计费', '付款阈值', '自动开具发票', '发票']
doc_type: 'guide'
---

# 付款阈值

当您在某个计费周期内在 ClickHouse Cloud 的应付金额达到 10,000 美元（或等值金额）时，系统将自动向您的付款方式扣款。若扣款失败，在宽限期结束后您的服务将被暂停或终止。

:::note
此付款阈值不适用于与 ClickHouse 签订了承诺消费合同或其他协商合同的客户。
:::

如果您的组织达到了付款阈值的 90%，并且预计会在当前计费周期中途超过该付款阈值，与该组织关联的账单邮箱将收到电子邮件通知。当您超过付款阈值时，您也会收到电子邮件通知以及发票。

这些付款阈值可根据客户的请求或由 ClickHouse 财务团队调整为低于 10,000 美元。如果您有任何疑问，请联系 support@clickhouse.com 以获取更多详细信息。