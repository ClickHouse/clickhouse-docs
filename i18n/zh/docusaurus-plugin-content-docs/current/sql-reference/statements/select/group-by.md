---
description: 'GROUP BY 子句文档'
sidebar_label: 'GROUP BY'
slug: /sql-reference/statements/select/group-by
title: 'GROUP BY 子句'
doc_type: 'reference'
---

# GROUP BY 子句 {#group-by-clause}

`GROUP BY` 子句会将 `SELECT` 查询切换到聚合模式，其工作方式如下：

- `GROUP BY` 子句包含一个表达式列表（或单个表达式，此时被视为长度为 1 的列表）。这个列表充当“分组键（grouping key）”，而列表中的每个表达式称为“键表达式（key expression）”。
- [SELECT](/sql-reference/statements/select/index.md)、[HAVING](/sql-reference/statements/select/having.md) 和 [ORDER BY](/sql-reference/statements/select/order-by.md) 子句中的所有表达式 **必须** 基于键表达式 **或** 基于针对非键表达式（包括普通列）的[聚合函数](../../../sql-reference/aggregate-functions/index.md)计算得出。换句话说，从表中选出的每一列要么必须用于某个键表达式，要么必须出现在某个聚合函数内部，但不能同时两者兼有。
- 聚合后的 `SELECT` 查询结果中包含的行数等于源表中“分组键”不同取值的个数。通常，这会显著减少行数，经常能减少几个数量级，但并非必然：如果所有“分组键”取值都互不相同，则行数保持不变。

如果需要按列序号而不是列名对表中的数据进行分组，请启用 [enable_positional_arguments](/operations/settings/settings#enable_positional_arguments) 设置。

:::note
还有另一种方式可以对表进行聚合。如果查询中只在聚合函数内部使用了表列，则可以省略 `GROUP BY` 子句，此时会假定按空键集进行聚合。此类查询总是恰好返回一行。
:::

## NULL 处理 {#null-processing}

在分组操作中，ClickHouse 将 [NULL](/sql-reference/syntax#null) 视为一个具体值，并且认为 `NULL==NULL`。这与在大多数其他上下文中的 `NULL` 处理方式不同。

下面通过一个示例来说明其含义。

假设你有如下表：

```text
┌─x─┬────y─┐
│ 1 │    2 │
│ 2 │ ᴺᵁᴸᴸ │
│ 3 │    2 │
│ 3 │    3 │
│ 3 │ ᴺᵁᴸᴸ │
└───┴──────┘
```

执行查询 `SELECT sum(x), y FROM t_null_big GROUP BY y` 会返回：

```text
┌─sum(x)─┬────y─┐
│      4 │    2 │
│      3 │    3 │
│      5 │ ᴺᵁᴸᴸ │
└────────┴──────┘
```

你可以看到，对于 `y = NULL` 的情况，`GROUP BY` 对 `x` 进行了求和，看起来就像把 `NULL` 当作一个实际的取值来处理。

如果你向 `GROUP BY` 传入多个键列，结果会给出所选数据的所有组合，就好像把 `NULL` 当作一个特定的取值一样。

## ROLLUP 修饰符 {#rollup-modifier}

`ROLLUP` 修饰符用于根据 `GROUP BY` 列表中键表达式的顺序计算各级小计。小计行会追加在结果表的末尾。

小计是按相反顺序计算的：首先为列表中的最后一个键表达式计算小计，然后为前一个键表达式计算，如此类推直到第一个键表达式。

在小计行中，已经“分组”的键表达式的值会被设置为 `0` 或空字符串。

:::note
请注意，[HAVING](/sql-reference/statements/select/having.md) 子句可能会影响小计结果。
:::

**示例**

考虑表 t：

```text
┌─year─┬─month─┬─day─┐
│ 2019 │     1 │   5 │
│ 2019 │     1 │  15 │
│ 2020 │     1 │   5 │
│ 2020 │     1 │  15 │
│ 2020 │    10 │   5 │
│ 2020 │    10 │  15 │
└──────┴───────┴─────┘
```

查询：

```sql
SELECT year, month, day, count(*) FROM t GROUP BY ROLLUP(year, month, day);
```

由于 `GROUP BY` 子句中包含三个关键表达式，结果中会包含四个结果表，其中的小计是从右向左逐级汇总得到的：

* `GROUP BY year, month, day`；
* `GROUP BY year, month`（并且 `day` 列用零填充）；
* `GROUP BY year`（此时 `month, day` 两列都用零填充）；
* 以及总计（此时三个关键表达式对应的列都为零）。

```text
┌─year─┬─month─┬─day─┬─count()─┐
│ 2020 │    10 │  15 │       1 │
│ 2020 │     1 │   5 │       1 │
│ 2019 │     1 │   5 │       1 │
│ 2020 │     1 │  15 │       1 │
│ 2019 │     1 │  15 │       1 │
│ 2020 │    10 │   5 │       1 │
└──────┴───────┴─────┴─────────┘
┌─year─┬─month─┬─day─┬─count()─┐
│ 2019 │     1 │   0 │       2 │
│ 2020 │     1 │   0 │       2 │
│ 2020 │    10 │   0 │       2 │
└──────┴───────┴─────┴─────────┘
┌─year─┬─month─┬─day─┬─count()─┐
│ 2019 │     0 │   0 │       2 │
│ 2020 │     0 │   0 │       4 │
└──────┴───────┴─────┴─────────┘
┌─year─┬─month─┬─day─┬─count()─┐
│    0 │     0 │   0 │       6 │
└──────┴───────┴─────┴─────────┘
```

同一个查询也可以使用 `WITH` 关键字来改写。

```sql
SELECT year, month, day, count(*) FROM t GROUP BY year, month, day WITH ROLLUP;
```

**另请参阅**

* 用于实现 SQL 标准兼容性的 [group&#95;by&#95;use&#95;nulls](/operations/settings/settings.md#group_by_use_nulls) 设置。

## CUBE 修饰符 {#cube-modifier}

`CUBE` 修饰符用于对 `GROUP BY` 列表中键表达式的每一种组合计算小计。这些小计行会追加在结果表的末尾。

在小计行中，所有“分组”键表达式的值会被设置为 `0` 或空字符串。

:::note
请注意，[HAVING](/sql-reference/statements/select/having.md) 子句可能会影响小计结果。
:::

**示例**

考虑表 t：

```text
┌─year─┬─month─┬─day─┐
│ 2019 │     1 │   5 │
│ 2019 │     1 │  15 │
│ 2020 │     1 │   5 │
│ 2020 │     1 │  15 │
│ 2020 │    10 │   5 │
│ 2020 │    10 │  15 │
└──────┴───────┴─────┘
```

查询：

```sql
SELECT year, month, day, count(*) FROM t GROUP BY CUBE(year, month, day);
```

由于 `GROUP BY` 子句中有三个关键表达式，结果中包含八个对应所有关键表达式组合的小计表：

* `GROUP BY year, month, day`
* `GROUP BY year, month`
* `GROUP BY year, day`
* `GROUP BY year`
* `GROUP BY month, day`
* `GROUP BY month`
* `GROUP BY day`
* 以及总计。

未包含在 `GROUP BY` 中的列会被填充为 0。

```text
┌─year─┬─month─┬─day─┬─count()─┐
│ 2020 │    10 │  15 │       1 │
│ 2020 │     1 │   5 │       1 │
│ 2019 │     1 │   5 │       1 │
│ 2020 │     1 │  15 │       1 │
│ 2019 │     1 │  15 │       1 │
│ 2020 │    10 │   5 │       1 │
└──────┴───────┴─────┴─────────┘
┌─year─┬─month─┬─day─┬─count()─┐
│ 2019 │     1 │   0 │       2 │
│ 2020 │     1 │   0 │       2 │
│ 2020 │    10 │   0 │       2 │
└──────┴───────┴─────┴─────────┘
┌─year─┬─month─┬─day─┬─count()─┐
│ 2020 │     0 │   5 │       2 │
│ 2019 │     0 │   5 │       1 │
│ 2020 │     0 │  15 │       2 │
│ 2019 │     0 │  15 │       1 │
└──────┴───────┴─────┴─────────┘
┌─year─┬─month─┬─day─┬─count()─┐
│ 2019 │     0 │   0 │       2 │
│ 2020 │     0 │   0 │       4 │
└──────┴───────┴─────┴─────────┘
┌─year─┬─month─┬─day─┬─count()─┐
│    0 │     1 │   5 │       2 │
│    0 │    10 │  15 │       1 │
│    0 │    10 │   5 │       1 │
│    0 │     1 │  15 │       2 │
└──────┴───────┴─────┴─────────┘
┌─year─┬─month─┬─day─┬─count()─┐
│    0 │     1 │   0 │       4 │
│    0 │    10 │   0 │       2 │
└──────┴───────┴─────┴─────────┘
┌─year─┬─month─┬─day─┬─count()─┐
│    0 │     0 │   5 │       3 │
│    0 │     0 │  15 │       3 │
└──────┴───────┴─────┴─────────┘
┌─year─┬─month─┬─day─┬─count()─┐
│    0 │     0 │   0 │       6 │
└──────┴───────┴─────┴─────────┘
```

同一查询也可以写成使用 `WITH` 关键字的形式。

```sql
SELECT year, month, day, count(*) FROM t GROUP BY year, month, day WITH CUBE;
```

**另请参阅**

* 有关 SQL 标准兼容性，请参见 [group&#95;by&#95;use&#95;nulls](/operations/settings/settings.md#group_by_use_nulls) 设置。

## WITH TOTALS 修饰符 {#with-totals-modifier}

如果指定了 `WITH TOTALS` 修饰符，将会额外计算一行数据。该行的键列包含默认值（零或空字符串），聚合函数列则包含在所有行上的聚合结果（即「总计」值）。

这行额外数据仅在 `JSON*`、`TabSeparated*` 和 `Pretty*` 格式中生成，并且与其他行分开输出：

- 在 `XML` 和 `JSON*` 格式中，这一行作为单独的 `totals` 字段输出。
- 在 `TabSeparated*`、`CSV*` 和 `Vertical` 格式中，该行位于主结果之后，在其他数据之后由一个空行分隔。
- 在 `Pretty*` 格式中，该行作为主结果之后的一个单独表格输出。
- 在 `Template` 格式中，该行根据指定的模板输出。
- 在其他格式中，不支持该行。

:::note
`totals` 会出现在 `SELECT` 查询的结果中，但不会出现在 `INSERT INTO ... SELECT` 的结果中。
:::

在存在 [HAVING](/sql-reference/statements/select/having.md) 时，`WITH TOTALS` 的行为可以有不同方式，取决于 `totals_mode` 设置。

### 配置 Totals 处理方式 {#configuring-totals-processing}

默认情况下，`totals_mode = 'before_having'`。在这种情况下，`totals` 会基于所有行计算，包括那些未通过 HAVING 和 `max_rows_to_group_by` 限制的行。

其他可选模式仅在 `totals` 中包含通过 HAVING 的行，并且在与 `max_rows_to_group_by` 和 `group_by_overflow_mode = 'any'` 配合使用时表现不同。

`after_having_exclusive` – 不包含未通过 `max_rows_to_group_by` 的行。换句话说，与未设置 `max_rows_to_group_by` 的情况相比，`totals` 中的行数将小于或等于未设置时的行数。

`after_having_inclusive` – 在 `totals` 中包含所有未通过 `max_rows_to_group_by` 的行。换句话说，与未设置 `max_rows_to_group_by` 的情况相比，`totals` 中的行数将大于或等于未设置时的行数。

`after_having_auto` – 统计通过 HAVING 的行数。如果其数量超过某个阈值（默认 50%），则在 `totals` 中包含所有未通过 `max_rows_to_group_by` 的行；否则，不包含这些行。

`totals_auto_threshold` – 默认值为 0.5，是用于 `after_having_auto` 的系数。

如果未使用 `max_rows_to_group_by` 和 `group_by_overflow_mode = 'any'`，则所有 `after_having` 变体的行为相同，你可以任选其一（例如 `after_having_auto`）。

你可以在子查询中使用 `WITH TOTALS`，包括位于 [JOIN](/sql-reference/statements/select/join.md) 子句中的子查询（在这种情况下，相应的总计值会被合并）。

## GROUP BY ALL {#group-by-all}

`GROUP BY ALL` 等同于在 GROUP BY 中列出所有在 SELECT 子句中出现且不是聚合函数的表达式。

例如：

```sql
SELECT
    a * 2,
    b,
    count(c),
FROM t
GROUP BY ALL
```

等同于

```sql
SELECT
    a * 2,
    b,
    count(c),
FROM t
GROUP BY a * 2, b
```

对于一种特殊情况：如果某个函数的参数同时包含聚合函数和其他字段，则 `GROUP BY` 键会包含我们能够从中提取的尽可能多的非聚合字段。

例如：

```sql
SELECT
    substring(a, 4, 2),
    substring(substring(a, 1, 2), 1, count(b))
FROM t
GROUP BY ALL
```

等同于

```sql
SELECT
    substring(a, 4, 2),
    substring(substring(a, 1, 2), 1, count(b))
FROM t
GROUP BY substring(a, 4, 2), substring(a, 1, 2)
```

## 示例 {#examples}

示例：

```sql
SELECT
    count(),
    median(FetchTiming > 60 ? 60 : FetchTiming),
    count() - sum(Refresh)
FROM hits
```

与 MySQL 不同（并且符合标准 SQL 规范），你无法获取某个列的值，如果该列既不在键中，也不在聚合函数中（常量表达式除外）。要规避这一点，你可以使用 `any` 聚合函数（获取首次遇到的值），或者使用 `min/max`。

示例：

```sql
SELECT
    domainWithoutWWW(URL) AS domain,
    count(),
    any(Title) AS title -- getting the first occurred page header for each domain.
FROM hits
GROUP BY domain
```

对于遇到的每个不同的键值，`GROUP BY` 会计算一组聚合函数的结果。

## GROUPING SETS 修饰符 {#grouping-sets-modifier}

这是最通用的修饰符。
该修饰符允许手动指定多个聚合键集合（grouping set）。
会针对每个 grouping set 单独执行聚合，之后再将所有结果合并。
如果某列未出现在某个 grouping set 中，则会用默认值填充。

换句话说，上面描述的修饰符都可以通过 `GROUPING SETS` 来表示。
尽管带有 `ROLLUP`、`CUBE` 和 `GROUPING SETS` 修饰符的查询在语法上等价，但它们的执行性能可能不同。
`GROUPING SETS` 会尝试并行执行所有分组，而 `ROLLUP` 和 `CUBE` 则会在单线程中完成聚合结果的最终合并。

在源列包含默认值的情况下，可能很难判断某行是否属于使用这些列作为键的聚合结果。
为解决这一问题，必须使用 `GROUPING` 函数。

**示例**

下面这两个查询是等价的。

```sql
-- Query 1
SELECT year, month, day, count(*) FROM t GROUP BY year, month, day WITH ROLLUP;

-- Query 2
SELECT year, month, day, count(*) FROM t GROUP BY
GROUPING SETS
(
    (year, month, day),
    (year, month),
    (year),
    ()
);
```

**另请参阅**

* 有关 SQL 标准兼容性，请参见 [group&#95;by&#95;use&#95;nulls](/operations/settings/settings.md#group_by_use_nulls) 设置。

## 实现细节 {#implementation-details}

聚合是列式 DBMS 最重要的特性之一，因此它的实现也是 ClickHouse 中优化最充分的部分之一。默认情况下，聚合在内存中使用哈希表完成。它有 40 多种特化实现，会根据“分组键”的数据类型自动选择。

### 基于表排序键的 GROUP BY 优化 {#group-by-optimization-depending-on-table-sorting-key}

如果表按某个键排序，并且 `GROUP BY` 表达式至少包含排序键的前缀或单射函数，那么聚合可以更高效地执行。在这种情况下，当从表中读取到一个新的键时，聚合的中间结果可以被最终化并发送给客户端。此行为由 [optimize_aggregation_in_order](../../../operations/settings/settings.md#optimize_aggregation_in_order) 设置控制。该优化在聚合过程中可以降低内存使用，但在某些情况下可能会减慢查询执行。

### 外部内存中的 GROUP BY {#group-by-in-external-memory}

可以启用将临时数据写入磁盘，以限制执行 `GROUP BY` 时的内存使用。
[max_bytes_before_external_group_by](/operations/settings/settings#max_bytes_before_external_group_by) 设置决定了将 `GROUP BY` 临时数据写入文件系统时的 RAM 消耗阈值。如果设置为 0（默认值），则表示禁用。
或者，可以设置 [max_bytes_ratio_before_external_group_by](/operations/settings/settings#max_bytes_ratio_before_external_group_by)，只在查询已使用内存达到某个阈值后，才允许使用外部内存执行 `GROUP BY`。

在使用 `max_bytes_before_external_group_by` 时，建议将 `max_memory_usage` 设置为其大约两倍（或将 `max_bytes_ratio_before_external_group_by=0.5`）。这是必要的，因为聚合分为两个阶段：读取数据并形成中间数据（阶段 1），以及合并中间数据（阶段 2）。只有在阶段 1 中才可能将数据写入文件系统。如果临时数据没有被写入磁盘，那么阶段 2 可能需要与阶段 1 相同数量的内存。

例如，如果 [max_memory_usage](/operations/settings/settings#max_memory_usage) 设置为 10000000000，并且希望使用外部聚合，那么将 `max_bytes_before_external_group_by` 也设置为 10000000000，将 `max_memory_usage` 设置为 20000000000 是合理的。当触发外部聚合时（即至少发生过一次临时数据写入磁盘），RAM 的最大消耗只会略高于 `max_bytes_before_external_group_by`。

在分布式查询处理时，外部聚合在远程服务器上执行。为了使请求端服务器只使用少量 RAM，请将 `distributed_aggregation_memory_efficient` 设置为 1。

在合并已写入磁盘的数据时，以及在启用 `distributed_aggregation_memory_efficient` 设置时合并来自远程服务器的结果时，最多会额外消耗总 RAM 的 `1/256 * the_number_of_threads`。

启用外部聚合时，如果数据量小于 `max_bytes_before_external_group_by`（即数据未写入磁盘），查询运行速度与未使用外部聚合时一样快。如果有任何临时数据被写入磁盘，运行时间将会变为原来的数倍（大约三倍）。

如果在 `GROUP BY` 之后有带 [LIMIT](/sql-reference/statements/select/limit.md) 的 [ORDER BY](/sql-reference/statements/select/order-by.md)，则 RAM 的使用量取决于 `LIMIT` 中的数据量，而不是整个表的数据量。但如果 `ORDER BY` 没有 `LIMIT`，不要忘记启用外部排序（`max_bytes_before_external_sort`）。
