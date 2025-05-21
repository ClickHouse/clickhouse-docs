---
'title': '计费'
'slug': '/cloud/manage/jan-2025-faq/billing'
'keywords':
- 'new pricing'
- 'billing'
'description': '新定价层的计费详情'
---



## 账单 {#billing}

### 使用计费和收费方式是否有变化？ {#are-there-any-changes-to-how-usage-is-metered-and-charged}

计算和存储的每个维度单元成本已经改变，并且增加了两个附加维度，以便考虑数据传输和 ClickPipes 的使用情况。

一些显著的变化：

- 每 TB 的存储价格将降低，存储成本将不再包括备份（我们将单独收费，并且仅需提供一个备份）。存储成本在各个层次之间相同，按区域和云服务提供商而变化。
- 计算成本将因层次、区域和云服务提供商而有所不同。
- 数据传输的新定价维度仅适用于跨区域和公共互联网的数据出站。
- ClickPipes 使用的新定价维度。

### 对于有现有承诺消费合同的用户会发生什么？ {#what-happens-to-users-with-existing-committed-spend-contracts}

有活跃承诺消费合同的用户在合同到期之前不会受到计算和存储的新每个维度单元成本价格的影响。然而，数据传输和 ClickPipes 的新定价维度将在 2025 年 3 月 24 日起适用。大多数客户不会因这些新维度而看到他们的月账单显著增加。

### 在与 ClickHouse 的承诺消费协议下的用户能否继续在旧计划上启动服务？ {#can-users-on-a-committed-spend-agreement-with-clickhouse-continue-to-launch-services-on-the-old-plan}

是的，用户可以在合同到期之前启动开发和生产服务，续约将反映新的定价计划。

如果您需要修改合同或对这些变化可能对您未来的影响有疑问，请联系客服团队或您的销售代表。

### 如果用户在合同结束前耗尽了积分并转为按需付费怎么办？ {#what-happens-if-users-exhaust-their-credits-before-the-end-of-the-contract-and-go-to-payg}

如果承诺消费合同在续约日期之前耗尽了积分，我们将按当前费率收费直到续约（根据当前政策）。

### 每月按需付费的用户会发生什么？ {#what-happens-to-users-on-the-monthly-payg}

每月按需付费计划的用户将继续按照旧定价计划为开发和生产服务收费。他们有直到 2025 年 7 月 23 日的时间自行迁移到新计划，否则将在这一天自动迁移到规模配置并根据新计划收费。

### 我在哪里可以参考旧计划？ {#where-can-i-reference-legacy-plans}

旧计划可以在 [此处](https://clickhouse.com/pricing?legacy=true) 参考。

## 市场 {#marketplaces}

### 用户通过 CSP 市场收费的方式是否有变化？ {#are-there-changes-to-how-users-are-charged-via-the-csp-marketplaces}

通过 CSP 市场注册 ClickHouse Cloud 的用户将按 CHCs（ClickHouse Cloud Credits）计量使用。这种行为没有变化。然而，信用使用的底层组成将与此处概述的定价和包装变化一致，并在数据传输使用和 ClickPipes 正式上线后包括相关费用。
