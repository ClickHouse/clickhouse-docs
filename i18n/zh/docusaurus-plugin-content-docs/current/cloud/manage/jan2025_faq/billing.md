---
'title': '计费'
'slug': '/cloud/manage/jan-2025-faq/billing'
'keywords':
- 'new pricing'
- 'billing'
'description': '新定价层的计费详情'
---

## Billing {#billing}

### Are there any changes to how usage is metered and charged? {#are-there-any-changes-to-how-usage-is-metered-and-charged}

计算和存储的每个维度单位成本发生了变化，并且现在有两个额外的维度来计算数据传输和 ClickPipes 使用情况。

一些显著的变化：

- 每 TB 存储价格将降低，存储成本将不再包括备份（我们将单独收费，并且只要求进行一次备份）。存储成本在不同级别之间相同，并根据地区和云服务提供商有所不同。
- 计算成本将根据级别、地区和云服务提供商有所不同。
- 数据传输的新定价维度仅适用于跨区域和公共互联网的数据出口。
- ClickPipes 使用的新定价维度。

### What happens to users with existing committed spend contracts? {#what-happens-to-users-with-existing-committed-spend-contracts}

拥有有效的承诺消费合同的用户在合同到期之前不会受到计算和存储新每个维度单位成本价格的影响。然而，数据传输和 ClickPipes 的新定价维度将从 2025 年 3 月 24 日开始适用。大多数客户不会看到这些新维度导致的每月账单显著增加。

### Can users on a committed spend agreement with ClickHouse continue to launch services on the old plan? {#can-users-on-a-committed-spend-agreement-with-clickhouse-continue-to-launch-services-on-the-old-plan}

是的，用户将在合同的结束日期之前能够继续启动开发和生产服务，续订将反映新的定价计划。

如果您需要修改合同或对这些变化如何在未来影响您有任何疑问，请联系支持团队或您的销售代表。

### What happens if users exhaust their credits before the end of the contract and go to PAYG? {#what-happens-if-users-exhaust-their-credits-before-the-end-of-the-contract-and-go-to-payg}

如果承诺消费合同在续订日期之前用尽了信用额度，我们将按当前费率收费，直到续订（根据当前政策）。

### What happens to users on the monthly PAYG? {#what-happens-to-users-on-the-monthly-payg}

使用每月 PAYG 计划的用户将继续按旧定价计划收费，以用于开发和生产服务。他们有直到 2025 年 7 月 23 日的时间自行迁移到新计划，否则将于该日迁移到 Scale 配置，并根据新计划收费。

### Where can I reference legacy plans? {#where-can-i-reference-legacy-plans}

可以在 [这里](https://clickhouse.com/pricing?legacy=true) 查阅旧计划。

## Marketplaces {#marketplaces}

### Are there changes to how users are charged via the CSP marketplaces? {#are-there-changes-to-how-users-are-charged-via-the-csp-marketplaces}

通过 CSP 市场注册 ClickHouse Cloud 的用户以 CHCs（ClickHouse Cloud Credits）的形式产生使用费用。此行为没有改变。然而，信用使用的基础组成将与此处概述的定价和包装变化保持一致，并包括任何数据传输使用和 ClickPipes 的费用，一旦这些服务上线。
