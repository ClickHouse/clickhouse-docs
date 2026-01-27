---
description: 'SAMPLE 子句说明'
sidebar_label: 'SAMPLE 子句'
slug: /sql-reference/statements/select/sample
title: 'SAMPLE 子句'
doc_type: 'reference'
---

# SAMPLE 子句 \{#sample-clause\}

`SAMPLE` 子句用于对 `SELECT` 查询进行近似处理。

启用数据采样时，查询不会在全部数据上执行，而只会在一定比例的数据（样本）上执行。例如，如果需要计算所有访问的统计数据，只需在所有访问数据的 1/10 上执行查询，然后将结果乘以 10 即可。

近似查询处理在以下情况下会很有用：

* 当有严格的延迟要求（例如低于 100ms），但又无法证明为满足这些要求而增加额外硬件资源的成本是合理的。
* 当原始数据本身就不精确，因此使用近似不会明显降低结果质量。
* 业务需求只要求近似结果（例如出于成本效益考虑，或者将精确结果作为付费高级用户的增值服务）。

:::note
只能在 [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md) 系列的表上使用采样，并且仅当在建表时指定了采样表达式时才能使用采样（参见 [MergeTree engine](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)）。
:::

数据采样的特性如下：

* 数据采样是一种确定性机制。相同的 `SELECT .. SAMPLE` 查询其结果始终相同。
* 采样在不同表之间具有一致性。对于具有单一采样键的表，使用相同系数的样本总会选取相同的数据子集。例如，以用户 ID 进行采样时，会从不同的表中选取包含同一子集用户 ID 的行。这意味着你可以在 [IN](../../../sql-reference/operators/in.md) 子句中的子查询里使用采样。同时，你也可以在使用 [JOIN](../../../sql-reference/statements/select/join.md) 子句进行连接时对采样结果进行关联。
* 采样允许从磁盘中读取更少的数据。请注意，必须正确指定采样键。更多信息参见 [Creating a MergeTree Table](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)。

对于 `SAMPLE` 子句，支持如下语法：

| SAMPLE 子句语法 | 描述                                                                                                                                                                                                                                    |
|-----------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `SAMPLE k`   | 其中 `k` 为 0 到 1 之间的数值。查询会在占比为 `k` 的数据子集上执行。例如，`SAMPLE 0.1` 会在 10% 的数据上执行查询。[详细说明](#sample-k)                                                                             |
| `SAMPLE n`    | 其中 `n` 为足够大的整数。查询会在至少包含 `n` 行的样本上执行（但不会显著多于该数量）。例如，`SAMPLE 10000000` 会在至少 10,000,000 行数据的样本上执行查询。[详细说明](#sample-n) |
| `SAMPLE k OFFSET m`  | 其中 `k` 和 `m` 为 0 到 1 之间的数值。查询会在占比为 `k` 的数据样本上执行。用于采样的数据相对于整个数据集偏移 `m` 的比例。[详细说明](#sample-k-offset-m)                                           |

## SAMPLE K \{#sample-k\}

这里的 `k` 是一个介于 0 和 1 之间的数（支持分数和小数表示）。例如，`SAMPLE 1/2` 或 `SAMPLE 0.5`。

在 `SAMPLE k` 子句中，样本是从占数据 `k` 比例的部分中抽取的。示例如下：

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

在本示例中，查询只在占全部数据 0.1（10%）的样本上执行。聚合函数的值不会自动校正，因此要获得近似结果，就将 `count()` 的值手动乘以 10。

## SAMPLE N \{#sample-n\}

这里的 `n` 是一个足够大的整数。例如，`SAMPLE 10000000`。

在这种情况下，查询会在至少 `n` 行的数据样本上执行（但不会显著多于这个数量）。例如，`SAMPLE 10000000` 会在至少 10,000,000 行数据上运行查询。

由于读取数据的最小单位是一个 granule（其大小由 `index_granularity` 设置决定），因此将样本规模设置得远大于 granule 的大小是合理的。

使用 `SAMPLE n` 子句时，并不知道处理了数据的相对百分比是多少。因此，也就不知道应该将聚合函数乘以什么系数。请使用 `_sample_factor` 虚拟列来获得近似结果。

`_sample_factor` 列包含动态计算得到的相对系数。在使用指定的 sampling key [创建](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table) 表时，该列会自动创建。`_sample_factor` 列的使用示例如下所示。

考虑表 `visits`，其中包含网站访问的统计信息。第一个示例展示了如何计算页面浏览次数：

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

下面的示例展示了如何计算平均会话时长。请注意，计算平均值时不需要使用相对系数。

```sql
SELECT avg(Duration)
FROM visits
SAMPLE 10000000
```

## SAMPLE K OFFSET M \{#sample-k-offset-m\}

这里的 `k` 和 `m` 是取值范围在 0 到 1 之间的数字。下面给出一些示例。

**示例 1**

```sql
SAMPLE 1/10
```

在此示例中，采样比例为全部数据的 1/10：

`[++------------]`

**示例 2**

```sql
SAMPLE 1/10 OFFSET 1/2
```

此处从数据的后半部分中抽取了 10% 的数据样本。

`[------++------]`
