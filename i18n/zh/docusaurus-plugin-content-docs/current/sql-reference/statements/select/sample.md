---
description: 'SAMPLE 子句文档'
sidebar_label: 'SAMPLE'
slug: /sql-reference/statements/select/sample
title: 'SAMPLE 子句'
doc_type: 'reference'
---

# SAMPLE 子句 {#sample-clause}

`SAMPLE` 子句允许对 `SELECT` 查询进行近似处理。

启用数据采样后，查询不会在全部数据上执行，而只在一定比例的数据（样本）上执行。例如，如果你需要为所有访问计算统计数据，只需对所有访问的 1/10 执行查询，然后将结果乘以 10 即可。

近似查询处理在以下情况下可能有用：

* 当你有严格的延迟要求（例如低于 100ms），但又无法证明为满足这些要求而增加额外硬件资源的成本是合理时。
* 当你的原始数据本身就不精确，因此近似不会明显降低结果质量时。
* 当业务需求本身只需要近似结果（出于成本效益考虑，或者将精确结果作为付费高级用户专属功能进行售卖）时。

:::note\
你只能对 [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md) 家族中的表使用采样，并且前提是在建表时指定了采样表达式（参见 [MergeTree 引擎](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)）。
:::

数据采样具有以下特性：

* 数据采样是一个确定性机制。相同的 `SELECT .. SAMPLE` 查询每次的结果都是相同的。
* 采样在不同的表上表现一致。对于具有单一采样键的表，相同系数的样本总是选择相同的潜在数据子集。例如，对用户 ID 的采样会从不同的表中选出具有相同用户 ID 子集的行。这意味着你可以在 [IN](../../../sql-reference/operators/in.md) 子句的子查询中使用样本。同时，你也可以使用 [JOIN](../../../sql-reference/statements/select/join.md) 子句对样本进行连接。
* 采样可以减少从磁盘读取的数据量。请注意，你必须正确指定采样键。更多信息参见 [创建 MergeTree 表](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)。

对于 `SAMPLE` 子句，支持以下语法：

| SAMPLE 子句语法 | 说明                                                                                                                                                                                                                                    |
|-----------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `SAMPLE k`   | 这里 `k` 是 0 到 1 之间的数值。查询在占比为 `k` 的数据上执行。例如，`SAMPLE 0.1` 会在 10% 的数据上运行查询。 [详细信息](#sample-k)                                                                             |
| `SAMPLE n`    | 这里 `n` 是一个足够大的整数。查询会在至少包含 `n` 行的样本上执行（但不会明显超过这个数量）。例如，`SAMPLE 10000000` 会在至少 10,000,000 行数据上运行查询。 [详细信息](#sample-n) |
| `SAMPLE k OFFSET m`  | 这里 `k` 和 `m` 是 0 到 1 之间的数值。查询会在占比为 `k` 的数据样本上执行，而用于样本的数据会按 `m` 的比例进行偏移。 [详细信息](#sample-k-offset-m)                                           |

## SAMPLE K {#sample-k}

这里的 `k` 是介于 0 和 1 之间的数值（支持分数形式和小数形式）。例如，`SAMPLE 1/2` 或 `SAMPLE 0.5`。

在 `SAMPLE k` 子句中，样本是从数据中占比为 `k` 的部分抽取的。示例如下：

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

在此示例中，查询在占数据量 10%（0.1）的样本上执行。聚合函数的值不会自动校正，因此要获得近似结果，需要将 `count()` 的值手动乘以 10。

## SAMPLE N {#sample-n}

这里的 `n` 是一个足够大的整数，例如 `SAMPLE 10000000`。

在这种情况下，查询会在至少 `n` 行（但不会显著多于这个数量）的样本上执行。例如，`SAMPLE 10000000` 会在至少 10,000,000 行数据上运行查询。

由于读取数据的最小单位是一个 granule（其大小由 `index_granularity` 设置决定），因此将样本大小设置为远大于 granule 大小是合理的。

使用 `SAMPLE n` 子句时，无法得知实际处理了数据的相对百分比，因此也就不知道聚合函数结果应当乘以的系数。可以使用 `_sample_factor` 虚拟列来获得近似结果。

`_sample_factor` 列包含动态计算得到的相对系数。在使用指定的采样键[创建](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)表时，该列会自动创建。下面展示了 `_sample_factor` 列的使用示例。

考虑表 `visits`，它包含站点访问的统计数据。第一个示例展示了如何计算页面浏览次数：

```sql
SELECT sum(PageViews * _sample_factor)
FROM visits
SAMPLE 10000000
```

下面的示例展示了如何计算总访问次数：

```sql
SELECT sum(_sample_factor)
FROM visits
SAMPLE 10000000
```

下面的示例展示了如何计算平均会话持续时间。请注意，计算平均值时不需要使用相对系数。

```sql
SELECT avg(Duration)
FROM visits
SAMPLE 10000000
```

## SAMPLE K OFFSET M {#sample-k-offset-m}

这里的 `k` 和 `m` 是取值范围为 0 到 1 的数。示例如下所示。

**示例 1**

```sql
SAMPLE 1/10
```

在此示例中，采样率为全部数据的 1/10：

`[++------------]`

**示例 2**

```sql
样本 1/10 偏移 1/2
```

这里，从数据的后半部分中抽取 10% 作为样本。

`[------++------]`
