---
sidebar_label: '付款阈值'
slug: /cloud/billing/payment-thresholds
title: '付款阈值'
description: 'ClickHouse Cloud 的付款阈值与自动开票。'
keywords: ['billing', 'payment thresholds', 'automatic invoicing', 'invoice']
doc_type: 'guide'
---

# 付款阈值

当您在某个计费周期内在 ClickHouse Cloud 的应付金额达到 10,000 美元或等值金额时，系统会自动从您的支付方式中扣款。如果扣款失败，在宽限期结束后，您的服务将被暂停或终止。

:::note
此付款阈值不适用于与 ClickHouse 签订了承诺消费合同或其他协商合同协议的客户。
:::

如果您的组织达到了付款阈值的 90%，且按当前趋势预计将在计费周期内超过该阈值，则与该组织关联的计费邮箱将会收到电子邮件通知。当您超过付款阈值时，您也会收到电子邮件通知以及一份发票。

这些付款阈值可应客户请求或由 ClickHouse 财务团队调整为低于 10,000 美元的数值。如有任何问题，请联系 support@clickhouse.com 以获取更多详情。