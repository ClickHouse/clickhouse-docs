---
title: 计费
slug: /cloud/manage/jan-2025-faq/billing
keywords: ['new pricing', 'billing']
description: 新定价层的计费细节
---

## 计费 {#billing}

### 使用量计量和收费方式有变化吗？ {#are-there-any-changes-to-how-usage-is-metered-and-charged}

计算和存储的每个维度单元成本发生了变化，并且有两个额外维度需要考虑数据传输和 ClickPipes 的使用。

一些显著变化：

- 每 TB 的存储价格将降低，并且存储费用将不再包括备份（我们将单独收费，并且只需要做一个备份）。存储成本在各个层级之间是相同的，但因地区和云服务提供商而异。
- 计算成本将依据层级、地区和云服务提供商而变化。
- 数据传输的新定价维度仅适用于跨地区和公共互联网的数据出站。
- ClickPipes 使用的新定价维度。

### 现有承诺支出合同的用户会发生什么？ {#what-happens-to-users-with-existing-committed-spend-contracts}

有活跃的承诺支出合同的用户在其合同到期之前将不受计算和存储的新每个维度单元成本价格的影响。然而，数据传输和 ClickPipes 的新定价维度将从 2025 年 3 月 24 日起适用。大多数客户不会看到这些新维度带来的月账单显著增加。

### 与 ClickHouse 签订承诺支出协议的用户是否可以继续按照旧计划启动服务？ {#can-users-on-a-committed-spend-agreement-with-clickhouse-continue-to-launch-services-on-the-old-plan}

是的，用户将能够在合同到期之前启动开发和生产服务，续约将反映新定价计划。

如果您需要修改合同或有关于这些变化如何影响您未来的问题，请联系支持团队或您的销售代表。

### 如果用户在合同到期前耗尽信用额度并转为按需计费（PAYG）会发生什么？ {#what-happens-if-users-exhaust-their-credits-before-the-end-of-the-contract-and-go-to-payg}

如果承诺支出合同在续约日期之前耗尽信用额度，我们将根据现行政策按当前费率收费，直到续约。

### 每月按需计费（PAYG）的用户会发生什么？ {#what-happens-to-users-on-the-monthly-payg}

每月按需计费计划的用户将继续按照旧的定价计划进行开发和生产服务的计费。他们有时间直到 2025 年 7 月 23 日自行迁移到新计划，否则将在这一天全部迁移到规模配置，并根据新计划计费。

### 我在哪里可以参考遗留计划？ {#where-can-i-reference-legacy-plans}

遗留计划可在[这里](https://clickhouse.com/pricing?legacy=true)进行参考。

## 市场 {#marketplaces}

### 用户在 CSP 市场中收费方式有变化吗？ {#are-there-changes-to-how-users-are-charged-via-the-csp-marketplaces}

通过 CSP 市场注册 ClickHouse Cloud 的用户按 CHCs（ClickHouse Cloud Credits）计算使用量。此行为没有变化。然而，信用使用的基本组成将与此处概述的定价和包装变化保持一致，包括在 ClickPipes 发布后对任何数据传输使用的收费。
