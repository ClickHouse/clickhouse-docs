---
description: 'SAMPLE 子句文档'
sidebar_label: 'SAMPLE'
slug: /sql-reference/statements/select/sample
title: 'SAMPLE 子句'
doc_type: 'reference'
---



# SAMPLE 子句

`SAMPLE` 子句用于对 `SELECT` 查询进行近似处理。

启用数据采样后，查询不会在全部数据上执行，而只会在其中的一定比例（样本）上执行。例如，如果需要对所有访问记录计算统计数据，只需在全部访问记录的 1/10 上执行查询，然后将结果乘以 10 即可。

近似查询处理在以下情况下可能很有用：

- 当有严格的延迟要求（例如低于 100ms），但又难以证明为满足这些要求而增加额外硬件资源的成本是值得的。
- 当原始数据本身就不精确，因此近似不会明显降低结果质量。
- 业务需求只要求近似结果（出于成本考虑，或将精确结果作为高级用户的增值服务）。

:::note    
只能对 [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md) 系列表使用采样，并且仅当在建表时指定了采样表达式时才可以使用（参见 [MergeTree engine](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)）。
:::

数据采样的特性如下：

- 数据采样是确定性机制。相同的 `SELECT .. SAMPLE` 查询每次都会得到相同的结果。
- 采样在不同表之间是一致的。对于具有单一采样键的表，相同系数的样本总是选择相同的潜在数据子集。例如，以用户 ID 作为采样键时，会从不同的表中选取具有相同用户 ID 子集的行。这意味着可以在 [IN](../../../sql-reference/operators/in.md) 子句中的子查询里使用采样。同时，也可以在 [JOIN](../../../sql-reference/statements/select/join.md) 子句中对样本进行连接。
- 采样可以减少从磁盘读取的数据量。请注意，必须正确指定采样键。更多信息参见 [创建 MergeTree 表](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)。

对于 `SAMPLE` 子句，支持以下语法：

| SAMPLE 子句语法 | 描述                                                                                                                                                                                                                                    |
|----------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `SAMPLE k`   | 其中 `k` 为 0 到 1 之间的数。查询在占比为 `k` 的数据上执行。例如，`SAMPLE 0.1` 会在 10% 的数据上运行查询。[了解更多](#sample-k)                                                                             |
| `SAMPLE n`    | 其中 `n` 为足够大的整数。查询在至少包含 `n` 行的样本上执行（但不会显著超过该数量）。例如，`SAMPLE 10000000` 会在最少 10,000,000 行数据上运行查询。[了解更多](#sample-n) |
| `SAMPLE k OFFSET m`  | 其中 `k` 和 `m` 为 0 到 1 之间的数。查询在占比为 `k` 的数据样本上执行。样本所使用的数据相对于全部数据按 `m` 的比例进行偏移。[了解更多](#sample-k-offset-m)                                           |



## SAMPLE K {#sample-k}

这里 `k` 是 0 到 1 之间的数值(支持分数和小数表示法)。例如,`SAMPLE 1/2` 或 `SAMPLE 0.5`。

在 `SAMPLE k` 子句中,样本从数据的 `k` 比例中抽取。示例如下:

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

在此示例中,查询在 0.1(10%)的数据样本上执行。聚合函数的值不会自动修正,因此为了获得近似结果,需要手动将 `count()` 的值乘以 10。


## SAMPLE N {#sample-n}

这里 `n` 是一个足够大的整数。例如,`SAMPLE 10000000`。

在这种情况下,查询将在至少 `n` 行的样本上执行(但不会显著超过此数量)。例如,`SAMPLE 10000000` 会在至少 10,000,000 行上运行查询。

由于数据读取的最小单位是一个颗粒(其大小由 `index_granularity` 设置决定),因此设置一个远大于颗粒大小的样本才有意义。

使用 `SAMPLE n` 子句时,您无法知道处理了数据的相对百分比,因此也无法知道聚合函数应该乘以的系数。请使用 `_sample_factor` 虚拟列来获取近似结果。

`_sample_factor` 列包含动态计算的相对系数。当您使用指定的采样键[创建](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)表时,此列会自动创建。下面展示了 `_sample_factor` 列的使用示例。

让我们以表 `visits` 为例,该表包含网站访问的统计信息。第一个示例展示了如何计算页面浏览量:

```sql
SELECT sum(PageViews * _sample_factor)
FROM visits
SAMPLE 10000000
```

下一个示例展示了如何计算访问总数:

```sql
SELECT sum(_sample_factor)
FROM visits
SAMPLE 10000000
```

下面的示例展示了如何计算平均会话持续时间。请注意,计算平均值时不需要使用相对系数。

```sql
SELECT avg(Duration)
FROM visits
SAMPLE 10000000
```


## SAMPLE K OFFSET M {#sample-k-offset-m}

这里 `k` 和 `m` 是 0 到 1 之间的数值。以下是示例。

**示例 1**

```sql
SAMPLE 1/10
```

在此示例中,样本为全部数据的 1/10:

`[++------------]`

**示例 2**

```sql
SAMPLE 1/10 OFFSET 1/2
```

在此示例中,从数据的后半部分抽取 10% 的样本。

`[------++------]`
