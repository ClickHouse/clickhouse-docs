
# SAMPLE 子句

`SAMPLE` 子句允许进行近似的 `SELECT` 查询处理。

启用数据采样时，查询并不是在所有数据上执行，而仅在一定比例的数据（样本）上执行。例如，如果需要计算所有访问的统计信息，只需在所有访问的 1/10 的比例上执行查询，然后将结果乘以 10。

近似查询处理在以下情况下可能会很有用：

- 当您有严格的延迟要求（例如低于 100ms），但又无法证明增加额外硬件资源来满足这些要求的成本合理时。
- 当您的原始数据不准确时，因此近似值不会明显降低质量。
- 业务需求针对近似结果（出于成本效益，或为高端用户提供精确结果）。

:::note    
您只能在 [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md) 家族的表上使用采样，并且只有在表创建时指定了采样表达式的情况下（请参阅 [MergeTree 引擎](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)）。
:::

数据采样的特点如下：

- 数据采样是一个确定性机制。相同的 `SELECT .. SAMPLE` 查询的结果总是相同的。
- 采样在不同表之间一致工作。对于具有单一采样键的表，相同系数的样本始终选择相同的数据子集。例如，用户ID的样本从不同表中提取具有相同用户ID子集的行。这意味着您可以在 [IN](../../../sql-reference/operators/in.md) 子句中的子查询中使用样本。此外，您可以使用 [JOIN](../../../sql-reference/statements/select/join.md) 子句连接样本。
- 采样允许从磁盘中读取更少的数据。请注意，您必须正确指定采样键。有关更多信息，请参阅 [创建一个 MergeTree 表](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)。

对于 `SAMPLE` 子句，支持以下语法：

| SAMPLE 子句语法 | 描述                                                                                                                                                                                                                                    |
|--------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `SAMPLE k`         | 此处 `k` 为 0 到 1 之间的数字。查询在 `k` 比例的数据上执行。例如，`SAMPLE 0.1` 在 10% 的数据上运行查询。 [阅读更多](#sample-k)                                                                                                        |
| `SAMPLE n`         | 此处 `n` 为一个足够大的整数。查询在至少 `n` 行的样本上执行（但不会大幅超过此数量）。例如，`SAMPLE 10000000` 在至少 10,000,000 行上运行查询。[阅读更多](#sample-n)                                                           |
| `SAMPLE k OFFSET m`| 此处 `k` 和 `m` 为 0 到 1 之间的数字。查询在 `k` 比例的数据样本上执行。用于样本的数据为 `m` 比例的偏移。[阅读更多](#sample-k-offset-m)                                                                                          |


## SAMPLE K {#sample-k}

此处 `k` 为 0 到 1 之间的数字（支持分数和小数表示法）。例如，`SAMPLE 1/2` 或 `SAMPLE 0.5`。

在 `SAMPLE k` 子句中，样本是从 `k` 比例的数据中提取的。示例显示如下：

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

在此示例中，查询是在 0.1 (10%) 的数据样本上执行的。聚合函数的值不会自动更正，因此为了获得近似结果，需手动将 `count()` 的值乘以 10。

## SAMPLE N {#sample-n}

此处 `n` 为一个足够大的整数。例如，`SAMPLE 10000000`。

在这种情况下，查询在至少 `n` 行的样本上执行（但不会大幅超过此数量）。例如，`SAMPLE 10000000` 在至少 10,000,000 行上运行查询。

由于读取数据的最小单位是一个粒度（其大小由 `index_granularity` 设置），因此设置比粒度大小大得多的样本是有意义的。

在使用 `SAMPLE n` 子句时，您不知道处理了相对的多少数据。因此，您不知道聚合函数应该乘以的系数。使用 `_sample_factor` 虚拟列来获得近似结果。

`_sample_factor` 列包含动态计算的相对系数。当您 [创建](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table) 带有指定采样键的表时，此列会自动创建。`_sample_factor` 列的用法示例如下。

我们考虑表 `visits`，它包含有关网站访问的统计信息。第一个示例展示如何计算页面浏览量：

```sql
SELECT sum(PageViews * _sample_factor)
FROM visits
SAMPLE 10000000
```

下一个示例展示如何计算总访问数：

```sql
SELECT sum(_sample_factor)
FROM visits
SAMPLE 10000000
```

下面的示例展示如何计算平均会话持续时间。请注意，您无需使用相对系数来计算平均值。

```sql
SELECT avg(Duration)
FROM visits
SAMPLE 10000000
```

## SAMPLE K OFFSET M {#sample-k-offset-m}

此处 `k` 和 `m` 为 0 到 1 之间的数字。以下是示例。

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

在这里，从数据的后半部分提取了 10% 的样本。

`[------++------]`
