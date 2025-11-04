---
'description': 'SAMPLE 子句的文档'
'sidebar_label': 'SAMPLE'
'slug': '/sql-reference/statements/select/sample'
'title': 'SAMPLE 子句'
'doc_type': 'reference'
---


# SAMPLE 子句

`SAMPLE` 子句允许近似的 `SELECT` 查询处理。

当启用数据采样时，查询并非在所有数据上执行，而仅在某个数据的特定比例（样本）上执行。例如，如果您需要计算所有访问的统计信息，仅需在 1/10 的所有访问上执行查询，然后将结果乘以 10。

近似查询处理在以下情况下可能很有用：

- 当您有严格的延迟要求（如低于 100ms），但无法证明支出额外硬件资源以满足这些要求的合理性。
- 当您的原始数据不准确时，因此近似不会显著降低质量。
- 商业需求目标是近似结果（为了成本效益，或将确切结果市场销售给高端用户）。

:::note    
您只能在 [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md) 家族中的表上使用采样，并且仅在创建表时指定了采样表达式的情况下（请参见 [MergeTree 引擎](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)）。
:::

数据采样的特点如下：

- 数据采样是一个确定性机制。同一 `SELECT .. SAMPLE` 查询的结果始终相同。
- 对于不同的表，采样结果是一致的。对具有单一采样键的表，相同系数的样本始终选择相同的可能数据子集。例如，用户 ID 的样本会从不同的表中选择具有相同子集的所有可能用户 ID 的行。这意味着您可以在 [IN](../../../sql-reference/operators/in.md) 子句中的子查询中使用样本。此外，您可以使用 [JOIN](../../../sql-reference/statements/select/join.md) 子句连接样本。
- 采样允许从磁盘读取更少的数据。请注意，您必须正确指定采样键。有关更多信息，请参见 [创建 MergeTree 表](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)。

对于 `SAMPLE` 子句，支持以下语法：

| SAMPLE 子句语法    | 描述                                                                                                                                                                                                                                    |
|---------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `SAMPLE k`          | 这里 `k` 是从 0 到 1 的数字。查询在 `k` 比例的数据上执行。例如，`SAMPLE 0.1` 在 10% 的数据上运行查询。[阅读更多](#sample-k)                                                                                   |
| `SAMPLE n`          | 这里 `n` 是一个足够大的整数。查询在至少 `n` 行的样本上执行（但不会比这多得多）。例如，`SAMPLE 10000000` 在至少 10,000,000 行上运行查询。[阅读更多](#sample-n)                                          |
| `SAMPLE k OFFSET m` | 这里 `k` 和 `m` 是从 0 到 1 的数字。查询在 `k` 比例的数据样本上执行。用于样本的数据偏移 `m` 比例。[阅读更多](#sample-k-offset-m)                                                                                       |

## SAMPLE K {#sample-k}

这里 `k` 是从 0 到 1 的数字（支持分数和小数表示法）。例如，`SAMPLE 1/2` 或 `SAMPLE 0.5`。

在 `SAMPLE k` 子句中，样本是从 `k` 比例的数据中获取的。下面是示例：

```sql
SELECT
    Title,
    count() * 10 AS PageViews
FROM hits_distributed
SAMPLE 0.1
WHERE
    CounterID = 34
GROUP BY Title
ORDER BY PageViews DESC LIMIT 1000
```

在此示例中，查询在 0.1（10%）的数据样本上执行。聚合函数的值不会自动修正，因此为了获得近似结果，`count()` 的值需要手动乘以 10。

## SAMPLE N {#sample-n}

这里 `n` 是一个足够大的整数。例如，`SAMPLE 10000000`。

在这种情况下，查询在至少 `n` 行的样本上执行（但不会比这多得多）。例如，`SAMPLE 10000000` 在至少 10,000,000 行上运行查询。

由于数据读取的最小单位是一个粒度（其大小由 `index_granularity` 设置决定），因此设置一个比粒度大小大得多的样本是有意义的。

使用 `SAMPLE n` 子句时，您无法知道处理了哪个相对百分比的数据。因此，您不知道聚合函数应该乘以的系数。使用虚拟列 `_sample_factor` 来获得近似结果。

`_sample_factor` 列包含动态计算的相对系数。当您 [创建](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table) 表时自动创建此列，并指定采样键。以下是 `_sample_factor` 列的使用示例。

让我们考虑表 `visits`，该表包含有关网站访问的统计信息。第一个示例展示如何计算页面视图的数量：

```sql
SELECT sum(PageViews * _sample_factor)
FROM visits
SAMPLE 10000000
```

下一个示例展示如何计算总访问次数：

```sql
SELECT sum(_sample_factor)
FROM visits
SAMPLE 10000000
```

下面的示例展示如何计算平均会话持续时间。请注意，您不需要使用相对系数来计算平均值。

```sql
SELECT avg(Duration)
FROM visits
SAMPLE 10000000
```

## SAMPLE K OFFSET M {#sample-k-offset-m}

这里 `k` 和 `m` 是从 0 到 1 的数字。示例如下。

**示例 1**

```sql
SAMPLE 1/10
```

在此示例中，样本为所有数据的 1/10：

`[++------------]`

**示例 2**

```sql
SAMPLE 1/10 OFFSET 1/2
```

在这里，从数据的后半部分采样 10%。

`[------++------]`
