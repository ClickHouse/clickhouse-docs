---
title: '账单'
slug: /cloud/manage/jan-2025-faq/billing
description: '新价格水平的账单信息'
---

## Billing {#billing}

### Are there any changes to how usage is metered and charged? {#are-there-any-changes-to-how-usage-is-metered-and-charged}

计算和存储的每维度单元成本已发生变化，并增加了两个额外维度，以考虑数据传输和 ClickPipes 使用情况。

一些显著的变化：

- 每 TB 的存储价格将降低，存储成本将不再包括备份（我们将单独收费，并且只需提供一个备份）。存储成本在各个层级相同，并根据地区和云服务提供商有所不同。
- 计算成本将根据层级、地区和云服务提供商而有所不同。
- 数据传输的新定价维度仅适用于跨地区和公共互联网的数据外流。
- ClickPipes 使用的新定价维度。

### What happens to users with existing committed spend contracts? {#what-happens-to-users-with-existing-committed-spend-contracts}

拥有有效承诺支出合同的用户在其合同到期之前不会受到计算和存储的新每维度单元成本价格的影响。然而，数据传输和 ClickPipes 的新定价维度将自 2025 年 3 月 24 日起生效。大多数客户不会因这些新维度而看到其月账单显著增加。

### Can users on a committed spend agreement with ClickHouse continue to launch services on the old plan? {#can-users-on-a-committed-spend-agreement-with-clickhouse-continue-to-launch-services-on-the-old-plan}

是的，用户可以在合同的结束日期之前继续启动开发和生产服务，续订将反映新定价计划。

如果您需要修改合同或对这些变化可能如何影响您未来有疑问，请联系您的支持团队或销售代表。

### What happens if users exhaust their credits before the end of the contract and go to PAYG? {#what-happens-if-users-exhaust-their-credits-before-the-end-of-the-contract-and-go-to-payg}

如果承诺支出合同在续订日期之前耗尽信用，我们将根据当前费率对其进行计费，直到续订（根据当前政策）。

### What happens to users on the monthly PAYG? {#what-happens-to-users-on-the-monthly-payg}

每月 PAYG 计划的用户将继续根据旧定价计划对开发和生产服务进行计费。他们有时间在 2025 年 7 月 23 日之前自助迁移到新计划，否则他们将在当天全部迁移到 Scale 配置，并根据新计划进行计费。

### Where can I reference legacy plans? {#where-can-i-reference-legacy-plans}

遗留计划可在 [这里](https://clickhouse.com/pricing?legacy=true) 查询。

## Marketplaces {#marketplaces}

### Are there changes to how users are charged via the CSP marketplaces? {#are-there-changes-to-how-users-are-charged-via-the-csp-marketplaces}

通过 CSP 市场注册 ClickHouse Cloud 的用户会根据 CHCs（ClickHouse Cloud Credits）产生使用费用。这种行为没有变化。然而，信用使用的基本组成将与此处概述的定价和打包变化保持一致，并在相关服务上线后包括任何数据传输使用和 ClickPipes 的费用。
