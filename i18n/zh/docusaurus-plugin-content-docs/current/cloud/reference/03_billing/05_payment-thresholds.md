---
sidebar_label: '付款阈值'
slug: /cloud/billing/payment-thresholds
title: '付款阈值'
description: 'ClickHouse Cloud 的付款阈值和自动开具发票。'
keywords: ['billing', 'payment thresholds', 'automatic invoicing', 'invoice']
doc_type: 'guide'
---

# 付款阈值

当你在某个计费周期内针对 ClickHouse Cloud 的应付金额达到 10,000 美元或等值金额时，将会自动从你的付款方式中扣款。若扣款失败，在宽限期结束后，你的服务将被暂停或终止。

:::note
此付款阈值不适用于与 ClickHouse 签订了承诺消费合同或其他经协商达成合同协议的客户。
:::

如果你的组织达到了付款阈值的 90%，且预计会在计费周期中途超过该阈值，与该组织关联的计费邮箱将会收到一封电子邮件通知。当你超过付款阈值时，你还会收到一封电子邮件通知以及一张发票。

这些付款阈值可以应客户请求或由 ClickHouse 财务团队调整为低于 10,000 美元的数值。如有任何疑问，请联系 support@clickhouse.com 了解更多详情。