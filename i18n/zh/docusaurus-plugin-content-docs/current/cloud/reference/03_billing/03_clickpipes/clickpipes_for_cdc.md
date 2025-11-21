---
sidebar_label: 'PostgreSQL CDC'
slug: /cloud/reference/billing/clickpipes/postgres-cdc
title: '适用于 PostgreSQL CDC 的 ClickPipes'
description: 'PostgreSQL CDC ClickPipes 计费概览'
doc_type: 'reference'
keywords: ['billing', 'clickpipes', 'cdc pricing', 'costs', 'pricing']
---



# PostgreSQL CDC 的 ClickPipes {#clickpipes-for-postgresql-cdc}

本节概述了 ClickPipes 中 Postgres 变更数据捕获 (CDC) 连接器的定价模型。在设计此模型时,我们的目标是在保持高度竞争力的定价的同时,坚守我们的核心愿景:

> 让客户能够无缝且经济实惠地将数据从 Postgres 迁移到 ClickHouse 进行实时分析。

该连接器的成本效益**比外部 ETL 工具和其他数据库平台的类似功能高出 5 倍以上**。

:::note
从 **2025 年 9 月 1 日**起,所有使用 Postgres CDC ClickPipes 的客户(包括现有客户和新客户)均开始按月计量计费。
:::


## 定价维度 {#pricing-dimensions}

定价包含两个主要维度:

1. **数据摄取量**: 从 Postgres 传入并摄取到 ClickHouse 的原始未压缩字节数。
2. **计算资源**: 每个服务配置的计算单元用于管理多个 Postgres CDC ClickPipes,与 ClickHouse Cloud 服务使用的计算单元相互独立。这些额外的计算资源专门用于 Postgres CDC ClickPipes。计算资源按服务级别计费,而非按单个管道计费。每个计算单元包含 2 个 vCPU 和 8 GB 内存。

### 数据摄取量 {#ingested-data}

Postgres CDC 连接器分为两个主要阶段运行:

- **初始加载 / 重新同步**: 捕获 Postgres 表的完整快照,在首次创建管道或重新同步时执行。
- **持续复制 (CDC)**: 持续将变更(如插入、更新、删除和模式变更)从 Postgres 复制到 ClickHouse。

在大多数使用场景中,持续复制占 ClickPipe 生命周期的 90% 以上。由于初始加载涉及一次性传输大量数据,我们为该阶段提供更低的费率。

| 阶段                            | 费用         |
| -------------------------------- | ------------ |
| **初始加载 / 重新同步**        | 每 GB $0.10 |
| **持续复制 (CDC)** | 每 GB $0.20 |

### 计算资源 {#compute}

此维度涵盖专门为 Postgres ClickPipes 配置的每个服务的计算单元。计算资源在服务内的所有 Postgres 管道之间共享。**在创建第一个 Postgres 管道时配置,当不再有 Postgres CDC 管道时释放**。配置的计算资源量取决于您组织的层级:

| 层级                         | 费用                                          |
| ---------------------------- | --------------------------------------------- |
| **Basic 层级**               | 每个服务 0.5 个计算单元 — 每小时 $0.10 |
| **Scale 或 Enterprise 层级** | 每个服务 1 个计算单元 — 每小时 $0.20   |

### 示例 {#example}

假设您的服务位于 Scale 层级,并具有以下配置:

- 2 个运行持续复制的 Postgres ClickPipes
- 每个管道每月摄取 500 GB 的数据变更 (CDC)
- 当第一个管道启动时,服务为 Postgres CDC 配置 **Scale 层级下的 1 个计算单元**

#### 月度费用明细 {#cost-breakdown}

**数据摄取量 (CDC)**:

$$ 2 \text{ 个管道} \times 500 \text{ GB} = 1,000 \text{ GB 每月} $$

$$ 1,000 \text{ GB} \times \$0.20/\text{GB} = \$200 $$

**计算资源**:

$$1 \text{ 个计算单元} \times \$0.20/\text{小时} \times 730 \text{ 小时(约一个月)} = \$146$$

:::note
计算资源在两个管道之间共享
:::

**月度总费用**:

$$\$200 \text{ (摄取)} + \$146 \text{ (计算)} = \$346$$


## Postgres CDC ClickPipes 常见问题 {#faq-postgres-cdc-clickpipe}

<details>

<summary>
  定价中计量的摄取数据是基于压缩大小还是未压缩大小?
</summary>

摄取数据按来自 Postgres 的_未压缩数据_进行计量——包括初始加载和 CDC(通过复制槽)期间。Postgres 默认不会在传输过程中压缩数据,ClickPipe 处理的是原始的未压缩字节。

</details>

<details>

<summary>Postgres CDC 定价何时开始出现在我的账单上?</summary>

从 **2025 年 9 月 1 日**起,所有客户(现有客户和新客户)的月度账单上开始显示 Postgres CDC ClickPipes 定价。

</details>

<details>

<summary>如果我暂停管道,是否会被收费?</summary>

当管道暂停时,不会产生数据摄取费用,因为没有数据移动。但是,计算费用仍然适用——根据您组织的层级,为 0.5 或 1 个计算单元。这是固定的服务级别成本,适用于该服务内的所有管道。

</details>

<details>

<summary>如何估算我的费用?</summary>

ClickPipes 中的概览页面提供了初始加载/重新同步和 CDC 数据量的指标。您可以使用这些指标结合 ClickPipes 定价来估算您的 Postgres CDC 成本。

</details>

<details>

<summary>
  我可以调整为服务中的 Postgres CDC 分配的计算资源吗?
</summary>

默认情况下,计算资源扩展不可由用户配置。预配置的资源已经过优化,可以最佳地处理大多数客户工作负载。如果您的使用场景需要更多或更少的计算资源,请提交支持工单,以便我们评估您的需求。

</details>

<details>

<summary>定价粒度是什么?</summary>

- **计算**:按小时计费。不足一小时的部分向上舍入到下一个小时。
- **摄取数据**:按未压缩数据的千兆字节(GB)进行计量和计费。

</details>

<details>

<summary>
  我可以使用 ClickHouse Cloud 积分来支付通过 ClickPipes 的 Postgres CDC 费用吗?
</summary>

可以。ClickPipes 定价是统一的 ClickHouse Cloud 定价的一部分。您拥有的任何平台积分都将自动应用于 ClickPipes 使用。

</details>

<details>

<summary>
  在我现有的 ClickHouse Cloud 月度支出中,Postgres CDC ClickPipes 预计会增加多少额外成本?
</summary>

成本因您的使用场景、数据量和组织层级而异。也就是说,大多数现有客户在试用后相对于其现有的 ClickHouse Cloud 月度支出会增加 **0–15%**。实际成本可能因您的工作负载而异——某些工作负载涉及大量数据但处理较少,而其他工作负载则需要更多处理但数据较少。

</details>
