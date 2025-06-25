---
'description': 'SAMPLE 子句的文档'
'sidebar_label': 'SAMPLE'
'slug': '/sql-reference/statements/select/sample'
'title': 'SAMPLE 子句'
---


# SAMPLE 子句

`SAMPLE` 子句允许进行近似的 `SELECT` 查询处理。

当启用数据采样时，查询并不是在所有数据上执行，而只是在一定比例的数据（样本）上执行。例如，如果您需要计算所有访问的统计信息，仅需在所有访问的十分之一上执行查询，然后将结果乘以 10。

近似查询处理在以下情况下可能会很有用：

- 当您有严格的延迟要求（如低于 100ms），但无法证明为满足这些要求而增加额外硬件资源的成本是合理的。
- 当您的原始数据不准确时，因此近似不会明显降低质量。
- 业务需求针对近似结果（为了成本效益，或将精确结果市场化给高级用户）。

:::note    
您只能在 [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md) 家族的表中使用采样，并且只有在创建表时指定了采样表达式的情况下（参见 [MergeTree 引擎](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)）。
:::

数据采样的特性如下所示：

- 数据采样是一个确定性机制。相同的 `SELECT .. SAMPLE` 查询的结果始终相同。
- 在不同的表上采样的一致性。有单一采样键的表，对于相同系数的样本总是选择相同的可能数据子集。例如，用户 ID 的样本从不同表中获取相同子集的所有可能用户 ID 的行。这意味着您可以在 [IN](../../../sql-reference/operators/in.md) 子句中使用样本进行子查询。此外，您可以使用 [JOIN](../../../sql-reference/statements/select/join.md) 子句连接样本。
- 采样允许从磁盘中读取更少的数据。请注意，您必须正确指定采样键。有关更多信息，请参阅 [创建 MergeTree 表](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)。

对于 `SAMPLE` 子句，支持以下语法：

| SAMPLE 子句语法 | 描述                                                                                                                                                                                                                                   |
|----------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `SAMPLE k`     | 这里的 `k` 是从 0 到 1 的数字。查询在 `k` 比例的数据上执行。例如，`SAMPLE 0.1` 在 10% 的数据上运行查询。 [了解更多](#sample-k)                                                                                       |
| `SAMPLE n`     | 这里的 `n` 是一个够大的整数。查询在至少 `n` 行的样本上执行（但不会显著超过这个数字）。例如，`SAMPLE 10000000` 在至少 10,000,000 行的数据上运行查询。 [了解更多](#sample-n)                                   |
| `SAMPLE k OFFSET m` | 这里的 `k` 和 `m` 是从 0 到 1 的数字。查询在 `k` 比例的数据样本上执行。用于样本的数据由 `m` 比例偏移。 [了解更多](#sample-k-offset-m)                                                        |

## SAMPLE K {#sample-k}

这里的 `k` 是从 0 到 1 的数字（支持小数和小数点表示法）。例如，`SAMPLE 1/2` 或 `SAMPLE 0.5`。

在 `SAMPLE k` 子句中，样本来自 `k` 比例的数据。下面是示例：

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

在这个例子中，查询在 0.1 （10%）的数据样本上执行。聚合函数的值不会自动调整，因此为了获得近似结果，需将 `count()` 的值手动乘以 10。

## SAMPLE N {#sample-n}

这里的 `n` 是一个足够大的整数。例如，`SAMPLE 10000000`。

在这种情况下，查询在至少 `n` 行的样本上执行（但不会显著超过这个数字）。例如，`SAMPLE 10000000` 在至少 10,000,000 行的数据上运行查询。

由于读取数据的最小单元是一个颗粒（其大小由 `index_granularity` 设置确定），因此设置一个远大于颗粒大小的样本是有意义的。

使用 `SAMPLE n` 子句时，您不知道处理了哪个相对数据的百分比。因此，您不知道聚合函数应该乘以的系数。使用 `_sample_factor` 虚拟列获取近似结果。

`_sample_factor` 列包含动态计算的相对系数。此列在您 [创建](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table) 表时自动生成，并指定了采样键。以下是使用 `_sample_factor` 列的示例。

让我们考虑表 `visits`，它包含有关网站访问的统计信息。第一个示例展示了如何计算页面浏览量：

```sql
SELECT sum(PageViews * _sample_factor)
FROM visits
SAMPLE 10000000
```

下一个示例展示了如何计算访问的总数：

```sql
SELECT sum(_sample_factor)
FROM visits
SAMPLE 10000000
```

下面的示例展示了如何计算平均会话持续时间。请注意，您在计算平均值时无需使用相对系数。

```sql
SELECT avg(Duration)
FROM visits
SAMPLE 10000000
```

## SAMPLE K OFFSET M {#sample-k-offset-m}

这里的 `k` 和 `m` 是从 0 到 1 的数字。下面是示例。

**示例 1**

```sql
SAMPLE 1/10
```

在这个例子中，样本是所有数据的 1/10：

`[++------------]`

**示例 2**

```sql
SAMPLE 1/10 OFFSET 1/2
```

在这里，从数据的后半部分取样 10%。 

`[------++------]`
