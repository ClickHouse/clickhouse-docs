---
'sidebar_label': 'PostgreSQL CDC'
'slug': '/cloud/reference/billing/clickpipes/postgres-cdc'
'title': 'ClickPipes for PostgreSQL CDC'
'description': 'PostgreSQL CDC ClickPipes 的计费概述'
'doc_type': 'reference'
---


# ClickPipes for PostgreSQL CDC {#clickpipes-for-postgresql-cdc}

本节概述了 ClickPipes 中 Postgres 数据变更捕获 (CDC) 连接器的定价模型。在设计此模型时，目标是在保持价格高度竞争的同时，忠实于我们的核心愿景：

> 使客户能够无缝且实惠地将数据从 Postgres 移动到 ClickHouse 以进行实时分析。

该连接器的成本优于外部 ETL 工具和其他数据库平台中类似功能的 **5 倍以上**。

:::note
从 **2025 年 9 月 1 日** 起，所有使用 Postgres CDC ClickPipes 的客户（包括现有客户和新客户）开始按月计费。
:::

## 定价维度 {#pricing-dimensions}

定价主要包括两个维度：

1. **已摄取数据**：来自 Postgres 的原始未压缩字节，已摄取到 ClickHouse 中。
2. **计算**：每个服务管理多个 Postgres CDC ClickPipes 的计算单元，与 ClickHouse Cloud 服务使用的计算单元是分开的。这部分额外的计算专门用于 Postgres CDC ClickPipes。计算是按服务层级计费，而不是按单个管道计费。每个计算单元包括 2 个 vCPU 和 8 GB 的 RAM。

### 已摄取数据 {#ingested-data}

Postgres CDC 连接器主要分为两个阶段：

- **初始加载 / 重新同步**：这会捕获 Postgres 表的完整快照，并在第一次创建或重新同步管道时发生。
- **持续复制 (CDC)**：从 Postgres 到 ClickHouse 的变更的持续复制，例如插入、更新、删除和模式更改。

在大多数用例中，持续复制占 ClickPipe 生命周期的 90% 以上。由于初始加载涉及一次性传输大量数据，因此我们对该阶段提供了较低的费率。

| 阶段                            | 费用         |
|----------------------------------|--------------|
| **初始加载 / 重新同步**        | 每 GB $0.10  |
| **持续复制 (CDC)**             | 每 GB $0.20  |

### 计算 {#compute}

该维度覆盖了专用于 Postgres ClickPipes 的每个服务所配置的计算单元。计算在同一服务中所有 Postgres 管道之间共享。**当第一个 Postgres 管道创建时会配置计算，在没有 Postgres CDC 管道时会释放计算。** 配置的计算量取决于您组织的层级：

| 层级                         | 费用                                          |
|------------------------------|-----------------------------------------------|
| **基本层**                   | 每服务 0.5 计算单元 - 每小时 $0.10          |
| **规模或企业层**            | 每服务 1 计算单元 - 每小时 $0.20            |

### 示例 {#example}

假设您的服务处于规模层，并且有以下设置：

- 2 个 Postgres ClickPipes 正在进行持续复制
- 每个管道每月摄取 500 GB 的数据变化 (CDC)
- 当第一个管道启动时，服务根据规模层为 Postgres CDC 配置了 **1 个计算单元**

#### 每月费用明细 {#cost-breakdown}

**已摄取数据 (CDC)**：

$$ 2 \text{ pipes} \times 500 \text{ GB} = 1,000 \text{ GB per month} $$

$$ 1,000 \text{ GB} \times \$0.20/\text{GB} = \$200 $$

**计算**：

$$1 \text{ compute unit} \times \$0.20/\text{hr} \times 730 \text{ hours (approximate month)} = \$146$$

:::note
计算在两个管道之间共享
:::

**每月总费用**：

$$\$200 \text{ (ingest)} + \$146 \text{ (compute)} = \$346$$

## Postgres CDC ClickPipes 常见问题解答 {#faq-postgres-cdc-clickpipe}

<details>

<summary>定价中测量的已摄取数据是基于压缩大小还是未压缩大小？</summary>

已摄取数据是指来自 Postgres 的 _未压缩数据_ — 无论是在初始加载和 CDC（通过复制槽）。Postgres 默认在传输过程中不压缩数据，ClickPipe 处理的是原始未压缩字节。

</details>

<details>

<summary>Postgres CDC 的定价何时开始出现在我的账单上？</summary>

Postgres CDC ClickPipes 的定价从 **2025 年 9 月 1 日** 开始出现在所有客户（现有客户和新客户）的月账单上。

</details>

<details>

<summary>如果我暂停我的管道，会被收费吗？</summary>

在管道暂停期间不收取数据摄取费用，因为没有数据被移动。但是，依然会收取计算费用 — 0.5 或 1 个计算单元 — 具体取决于您组织的层级。这是一个固定的服务层级费用，适用于该服务内的所有管道。

</details>

<details>

<summary>我如何估算我的定价？</summary>

ClickPipes 中的概述页面提供了初始加载/重新同步和 CDC 数据量的指标。您可以结合这些指标和 ClickPipes 定价来估算您的 Postgres CDC 成本。

</details>

<details>

<summary>我可以为我的服务扩展分配给 Postgres CDC 的计算吗？</summary>

默认情况下，计算扩展无法由用户配置。配置的资源经过优化以最佳处理大多数客户工作负载。如果您的用例需要更多或更少的计算，请提交支持票以便我们评估您的请求。

</details>

<details>

<summary>定价粒度是什么？</summary>

- **计算**：按小时计费。部分小时将四舍五入到下一个小时。
- **已摄取数据**：根据未压缩数据的千兆字节 (GB) 进行测量和计费。

</details>

<details>

<summary>我可以为通过 ClickPipes 的 Postgres CDC 使用我的 ClickHouse Cloud 额度吗？</summary>

可以。ClickPipes 定价是统一 ClickHouse Cloud 定价的一部分。您拥有的任何平台额度将自动适用于 ClickPipes 的使用。

</details>

<details>

<summary>我可以预期在现有的 ClickHouse Cloud 月支出中， Postgres CDC ClickPipes 会增加多少额外成本？</summary>

成本因您的用例、数据量和组织层级而异。也就是说，大多数现有客户在试用后相较于现有的 ClickHouse Cloud 月支出看到的增加为 **0–15%**。实际成本可能因工作负载而异—一些工作负载涉及大量数据而处理较少，而其他工作负载要求更多处理但数据较少。

</details>
