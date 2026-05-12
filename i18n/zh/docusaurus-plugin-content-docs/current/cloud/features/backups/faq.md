---
slug: /cloud/features/backups/faq
sidebar_label: '备份常见问题'
title: '备份计费差异常见问题解答'
description: '关于 ClickHouse Cloud 备份计费和保留期的常见问题'
keywords: ['backups', 'cloud backups', 'billing', 'retention', 'faq']
doc_type: 'reference'
---

### 为什么备份存储费用会上涨？ \{#why-bill-going-up\}

ClickHouse Cloud 会为您的数据最多保留 8 个备份版本 (包括全量备份和增量备份) ，以确保可靠恢复。此前，发票中仅计入了其中一部分数据。我们正在对此进行校正，因此自 2026 年 7 月 1 日起，收费将与实际保留的存储量一致。

:::note
备份存储的每 GB 价格并未修改。此次校正会修改发票中显示的备份版本数量，使其与您的服务实际保留的备份一致。
:::

### 这是涨价吗？ \{#is-this-a-price-increase\}

不是。每 GB 的价格保持不变。我们正在更正发票中计入的备份版本数量。

### 会追收此前少收的费用吗？ \{#past-undercharges\}

不会。我们不会追溯补收此前计费周期的任何费用。此次校正仅适用于自 2026 年 7 月 1 日起开始的计费。

### 我可以在哪里查看所有已保留的备份版本？ \{#see-backup-versions\}

自 4 月 23 日起，所有已保留的备份版本都可在 ClickHouse Cloud 控制台中查看。您还可以查看某个特定版本当前是否正在计费，或者是否已保留但尚未计费。更新后的[定价计算器](https://clickhouse.com/pricing)也会反映这些成本。

### 如有疑问，我可以联系谁？ \{#contact\}

如有任何疑问，请联系 [ClickHouse Support](https://clickhouse.com/support/program)。您的账户团队也可根据您的具体情况与您沟通。

### 这会影响我的备份可靠性或可用性吗？ \{#reliability\}

不会。您的备份覆盖范围、保留策略和恢复能力均不会改变。我们只是更正了备份的计费方式，并不会影响其存储或管理方式。

### 在哪里可以找到更多详情？ \{#more-details\}

4 月 23 日将发送通知邮件，提供完整详情。您可以使用[定价计算器](https://clickhouse.com/pricing)更准确地估算实际备份成本。

### 计费变更何时生效？ \{#when-changes-go-live\}

计费变更将于 2026 年 7 月 1 日生效，也就是在首次通知发出 60 天后。