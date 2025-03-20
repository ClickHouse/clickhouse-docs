---
slug: /sql-reference/statements/select/sample
sidebar_label: '样本'
---


# 样本子句

`SAMPLE` 子句允许进行近似的 `SELECT` 查询处理。

当数据采样被启用时，查询并不是在所有数据上执行，而仅在某个数据的某一部分（样本）上执行。例如，如果您需要计算所有访问的统计信息，执行查询在所有访问的 1/10 的数据上，然后将结果乘以 10 就足够了。

近似查询处理在以下情况下是有用的：

- 当您有严格的延迟要求（例如低于 100ms），但您无法为满足这些要求而额外承担硬件资源的成本。
- 当您的原始数据不准确时，因此近似不会明显降低质量。
- 业务要求目标为近似结果（出于成本效益，或向高级用户营销精确结果）。

:::note    
您只能在 [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md) 家族的表中使用采样，并且只有在创建表时指定了采样表达式的情况下（请参阅 [MergeTree 引擎](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)）。
:::

数据采样的特点如下：

- 数据采样是一个确定性的机制。相同的 `SELECT .. SAMPLE` 查询的结果始终是相同的。
- 对不同的表，采样一致有效。对于具有单一采样键的表，具有相同系数的样本总是选择相同的可能数据子集。例如，用户 ID 的样本从不同表中取出相同子集的所有可能用户 ID。这意味着您可以在 [IN](../../../sql-reference/operators/in.md) 子句的子查询中使用样本。此外，您可以使用 [JOIN](../../../sql-reference/statements/select/join.md) 子句连接样本。
- 采样允许从磁盘读取更少的数据。请注意，您必须正确指定采样键。有关更多信息，请参见 [创建 MergeTree 表](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)。

对于 `SAMPLE` 子句，支持以下语法：

| SAMPLE 子句语法       | 描述                                                                                                                                                                                                                             |
|-----------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `SAMPLE k`           | 这里 `k` 是一个从 0 到 1 的数字。查询在 `k`比例的数据上执行。例如，`SAMPLE 0.1` 在 10% 的数据上运行查询。 [阅读更多](#sample-k)                                                                                       |
| `SAMPLE n`           | 这里 `n` 是一个足够大的整数。查询在至少 `n` 行的样本上执行（但不显著多于这个）。例如，`SAMPLE 10000000` 在至少 10,000,000 行上运行查询。 [阅读更多](#sample-n)                                                |
| `SAMPLE k OFFSET m`  | 这里 `k` 和 `m` 是从 0 到 1 的数字。查询在 `k`比例的数据样本上执行。用于样本的数据由 `m`比例偏移。 [阅读更多](#sample-k-offset-m)                                                                                    |


## SAMPLE K {#sample-k}

这里 `k` 是一个从 0 到 1 的数字（支持分数和小数表示）。例如，`SAMPLE 1/2` 或 `SAMPLE 0.5`。

在 `SAMPLE k` 子句中，样本是从 `k`比例的数据显示出来的。下面展示了示例：

``` sql
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

在这个例子中，查询是在 0.1（10%）的样本数据上执行。聚合函数的值不会自动校正，因此为了得到近似结果，`count()` 的值需要手动乘以 10。

## SAMPLE N {#sample-n}

这里 `n` 是一个足够大的整数。例如，`SAMPLE 10000000`。

在这种情况下，查询是在至少 `n` 行的样本上执行（但不显著多于这个）。例如，`SAMPLE 10000000` 在至少 10,000,000 行上运行查询。

由于数据读取的最小单位是一个粒度（其大小由 `index_granularity` 设置决定），因此设置一个大于粒度大小的样本是有意义的。

使用 `SAMPLE n` 子句时，您不知道处理了多少相对百分比的数据。因此，您不知道聚合函数应该乘以的系数。使用 `_sample_factor` 虚拟列来获取近似结果。

`_sample_factor` 列包含动态计算的相对系数。创建具有指定采样键的表时，此列会自动创建。下面展示了 `_sample_factor` 列的使用示例。

假设表 `visits` 包含有关网站访问的统计信息。第一个示例展示了如何计算页面浏览量：

``` sql
SELECT sum(PageViews * _sample_factor)
FROM visits
SAMPLE 10000000
```

下一个示例展示了如何计算总访问次数：

``` sql
SELECT sum(_sample_factor)
FROM visits
SAMPLE 10000000
```

下面的示例展示了如何计算平均会话持续时间。请注意，计算平均值时不需要使用相对系数。

``` sql
SELECT avg(Duration)
FROM visits
SAMPLE 10000000
```

## SAMPLE K OFFSET M {#sample-k-offset-m}

这里 `k` 和 `m` 是从 0 到 1 的数字。下面展示了示例。

**示例 1**

``` sql
SAMPLE 1/10
```

在这个例子中，样本是所有数据的 1/10：

`[++------------]`

**示例 2**

``` sql
SAMPLE 1/10 OFFSET 1/2
```

在这里，从数据的后半部分取样 10%。 

`[------++------]`
