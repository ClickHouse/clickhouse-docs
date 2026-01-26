---
sidebar_label: 'PostgreSQL CDC'
slug: /cloud/reference/billing/clickpipes/postgres-cdc
title: '适用于 PostgreSQL CDC 的 ClickPipes'
description: 'PostgreSQL CDC ClickPipes 的计费概览'
doc_type: 'reference'
keywords: ['计费', 'ClickPipes', 'CDC 定价', '成本', '价格']
---



# 用于 PostgreSQL CDC 的 ClickPipes \{#clickpipes-for-postgresql-cdc\}

本节介绍 ClickPipes 中 Postgres Change Data Capture（CDC）连接器的定价模型。在设计该模型时，我们的目标是在保持价格高度具备竞争力的同时，始终坚持我们的核心愿景：

> 让用户能够无缝且成本可控地将数据从 Postgres 迁移到 ClickHouse，用于实时分析。

与外部 ETL 工具以及其他数据库平台中类似功能相比，该连接器在成本效益方面高出 **5 倍以上**。

:::note
自 **2025 年 9 月 1 日** 起，所有使用 Postgres CDC ClickPipes 的客户（包括现有和新客户）均按月计量并出具账单。
:::



## 定价维度 \{#pricing-dimensions\}

定价包含两个主要维度：

1. **摄取数据**：来自 Postgres 并摄取到 ClickHouse 的原始未压缩字节数。
2. **计算资源**：每个服务配置的计算单元用于管理多个 Postgres CDC（变更数据捕获）ClickPipes，与 ClickHouse Cloud 服务使用的计算单元相互独立。这些额外的计算资源专门用于 Postgres CDC ClickPipes。计算资源按服务级别计费，而非按单个管道计费。每个计算单元包含 2 个 vCPU 和 8 GB 内存。

### 摄取数据 \{#ingested-data\}

Postgres CDC 连接器分为两个主要阶段运行：

- **初始加载/重新同步**：捕获 Postgres 表的完整快照，在首次创建管道或重新同步时执行。
- **持续复制（CDC）**：持续将变更（如插入、更新、删除和架构变更）从 Postgres 复制到 ClickHouse。

在大多数使用场景中，持续复制占 ClickPipe 生命周期的 90% 以上。由于初始加载涉及一次性传输大量数据，我们为该阶段提供更低的费率。

| 阶段                            | 费用         |
| -------------------------------- | ------------ |
| **初始加载/重新同步**        | 每 GB $0.10 |
| **持续复制（CDC）** | 每 GB $0.20 |

### 计算资源 \{#compute\}

此维度涵盖专门为 Postgres ClickPipes 按服务配置的计算单元。计算资源在服务内的所有 Postgres 管道之间共享。**在创建第一个 Postgres 管道时配置，当不再有 Postgres CDC 管道时释放**。配置的计算资源量取决于您组织的层级：

| 层级                         | 费用                                          |
| ---------------------------- | --------------------------------------------- |
| **基础层级**               | 每个服务 0.5 个计算单元 — 每小时 $0.10 |
| **扩展层级或企业层级** | 每个服务 1 个计算单元 — 每小时 $0.20   |

### 示例 \{#example\}

假设您的服务处于扩展层级并具有以下配置：

- 2 个运行持续复制的 Postgres ClickPipes
- 每个管道每月摄取 500 GB 的数据变更（CDC）
- 当第一个管道启动时，服务为 Postgres CDC 配置**扩展层级下的 1 个计算单元**

#### 月度费用明细 \{#cost-breakdown\}

**摄取数据（CDC）**：

$$ 2 \text{ 个管道} \times 500 \text{ GB} = 1,000 \text{ GB 每月} $$

$$ 1,000 \text{ GB} \times \$0.20/\text{GB} = \$200 $$

**计算资源**：

$$1 \text{ 个计算单元} \times \$0.20/\text{小时} \times 730 \text{ 小时（约一个月）} = \$146$$

:::note
计算资源在两个管道之间共享
:::

**月度总费用**：

$$\$200 \text{ (摄取)} + \$146 \text{ (计算资源)} = \$346$$


## Postgres CDC ClickPipes 常见问题解答 \{#faq-postgres-cdc-clickpipe\}

<details>

<summary>在计费时，摄取数据是按压缩后还是未压缩的数据量来计算的？</summary>

摄取的数据按来自 Postgres 的_未压缩数据_进行计量——包括初始加载和 CDC（通过 replication slot）。Postgres 默认在传输过程中不会压缩数据，ClickPipe 处理的是原始的、未压缩的字节数据。

</details>

<details>

<summary>Postgres CDC 的费用什么时候会出现在我的账单上？</summary>

Postgres CDC ClickPipes 的费用自 **2025 年 9 月 1 日** 起开始出现在所有客户（包括现有和新客户）的月度账单中。

</details>

<details>

<summary>如果我暂停我的管道（pipe），还会收费吗？</summary>

在管道暂停期间不会产生数据摄取费用，因为没有数据被移动。不过，仍会产生计算费用——根据你所在组织的层级，收费为 0.5 或 1 个 compute unit。这是固定的服务级成本，并适用于该服务内的所有管道。

</details>

<details>

<summary>我如何预估费用？</summary>

ClickPipes 的 Overview 页面提供了初始加载/重同步以及 CDC 数据量的指标。你可以结合这些指标和 ClickPipes 的定价来预估你的 Postgres CDC 成本。

</details>

<details>

<summary>我可以在服务中扩缩分配给 Postgres CDC 的计算资源吗？</summary>

默认情况下，计算伸缩不可由用户自行配置。已预置的资源经过优化，可以高效应对大多数客户的工作负载。如果你的用例需要更多或更少的计算资源，请提交支持工单，我们会对你的请求进行评估。

</details>

<details>

<summary>计费粒度是什么？</summary>

- **Compute**：按小时计费。部分小时向上取整到下一个整小时。
- **Ingested Data**：按每 GB（千兆字节）的未压缩数据进行计量和计费。

</details>

<details>

<summary>我可以使用我的 ClickHouse Cloud 额度来支付通过 ClickPipes 使用 Postgres CDC 的费用吗？</summary>

可以。ClickPipes 的定价是统一 ClickHouse Cloud 定价的一部分。你拥有的任何平台额度都会自动适用于 ClickPipes 的使用费用。

</details>

<details>

<summary>在我现有的每月 ClickHouse Cloud 支出上，Postgres CDC ClickPipes 大约会增加多少额外成本？</summary>

成本会因你的用例、数据量以及组织层级而异。总体而言，大多数现有客户在试用期结束后，其现有的每月 ClickHouse Cloud 支出通常会增加约 **0–15%**。实际成本可能因工作负载而不同——有些工作负载数据量很大但处理较少，另一些则需要更多处理但数据量较小。

</details>