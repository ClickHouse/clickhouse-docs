---
description: 'GROUP BY 子句说明'
sidebar_label: 'GROUP BY'
slug: /sql-reference/statements/select/group-by
title: 'GROUP BY 子句'
doc_type: 'reference'
---



# GROUP BY 子句

`GROUP BY` 子句会将 `SELECT` 查询切换到聚合模式，其工作方式如下：

- `GROUP BY` 子句包含一个表达式列表（也可以是单个表达式，此时被视为长度为 1 的列表）。该列表作为“分组键（grouping key）”，其中的每个独立表达式称为“键表达式（key expression）”。
- [SELECT](/sql-reference/statements/select/index.md)、[HAVING](/sql-reference/statements/select/having.md) 和 [ORDER BY](/sql-reference/statements/select/order-by.md) 子句中的所有表达式 **必须** 基于键表达式 **或** 基于对非键表达式（包括普通列）使用的[聚合函数](../../../sql-reference/aggregate-functions/index.md)计算得出。换句话说，从表中选出的每一列必须要么出现在键表达式中，要么出现在聚合函数内部，但不能同时出现在两者中。
- 聚合后的 `SELECT` 查询结果包含的行数，与源表中“分组键”不同取值的个数相同。通常，这会显著减少行数，往往会减少几个数量级，但也不一定：如果所有“分组键”取值都互不相同，则行数保持不变。

如果要按列序号而不是列名对表中的数据进行分组，请启用设置 [enable_positional_arguments](/operations/settings/settings#enable_positional_arguments)。

:::note
还有一种额外的方式可以对表进行聚合。如果查询中表列只出现在聚合函数内部（即不在聚合函数外单独使用表列），则可以省略 `GROUP BY` 子句，此时会默认按空键集合进行聚合。此类查询总是**恰好**返回一行。
:::



## NULL 处理 {#null-processing}

在分组操作中,ClickHouse 将 [NULL](/sql-reference/syntax#null) 视为一个值,且 `NULL==NULL`。这与大多数其他场景中的 `NULL` 处理方式不同。

以下示例说明了这一点。

假设您有如下表:

```text
┌─x─┬────y─┐
│ 1 │    2 │
│ 2 │ ᴺᵁᴸᴸ │
│ 3 │    2 │
│ 3 │    3 │
│ 3 │ ᴺᵁᴸᴸ │
└───┴──────┘
```

查询 `SELECT sum(x), y FROM t_null_big GROUP BY y` 的结果为:

```text
┌─sum(x)─┬────y─┐
│      4 │    2 │
│      3 │    3 │
│      5 │ ᴺᵁᴸᴸ │
└────────┴──────┘
```

可以看到,`GROUP BY` 对 `y = NULL` 的情况将 `x` 进行了求和,就像 `NULL` 是一个具体的值一样。

如果向 `GROUP BY` 传递多个键,结果将给出所有选择的组合,就像 `NULL` 是一个特定值一样。


## ROLLUP 修饰符 {#rollup-modifier}

`ROLLUP` 修饰符用于根据 `GROUP BY` 列表中键表达式的顺序计算小计。小计行将添加到结果表之后。

小计按逆序计算:首先计算列表中最后一个键表达式的小计,然后是倒数第二个,依此类推,直到第一个键表达式。

在小计行中,已"分组"的键表达式的值将被设置为 `0` 或空行。

:::note
请注意,[HAVING](/sql-reference/statements/select/having.md) 子句可能会影响小计结果。
:::

**示例**

考虑表 t:

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

查询:

```sql
SELECT year, month, day, count(*) FROM t GROUP BY ROLLUP(year, month, day);
```

由于 `GROUP BY` 部分包含三个键表达式,结果包含四个表,小计从右到左"汇总":

- `GROUP BY year, month, day`;
- `GROUP BY year, month`(此时 `day` 列填充为零);
- `GROUP BY year`(此时 `month, day` 列均填充为零);
- 以及总计(所有三个键表达式列均为零)。

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

同样的查询也可以使用 `WITH` 关键字编写。

```sql
SELECT year, month, day, count(*) FROM t GROUP BY year, month, day WITH ROLLUP;
```

**另请参阅**

- [group_by_use_nulls](/operations/settings/settings.md#group_by_use_nulls) 设置,用于实现 SQL 标准兼容性。


## CUBE 修饰符 {#cube-modifier}

`CUBE` 修饰符用于计算 `GROUP BY` 列表中键表达式每种组合的小计。小计行将添加到结果表之后。

在小计行中,所有"分组"键表达式的值会被设置为 `0` 或空行。

:::note
请注意,[HAVING](/sql-reference/statements/select/having.md) 子句可能会影响小计结果。
:::

**示例**

考虑表 t:

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

查询:

```sql
SELECT year, month, day, count(*) FROM t GROUP BY CUBE(year, month, day);
```

由于 `GROUP BY` 部分包含三个键表达式,结果将包含八个表,分别对应所有键表达式组合的小计:

- `GROUP BY year, month, day`
- `GROUP BY year, month`
- `GROUP BY year, day`
- `GROUP BY year`
- `GROUP BY month, day`
- `GROUP BY month`
- `GROUP BY day`
- 以及总计。

未包含在 `GROUP BY` 中的列将填充为零。


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

同一个查询也可以改写为使用 `WITH` 关键字的形式。

```sql
SELECT year, month, day, count(*) FROM t GROUP BY year, month, day WITH CUBE;
```

**另请参阅**

* [group&#95;by&#95;use&#95;nulls](/operations/settings/settings.md#group_by_use_nulls) 设置（以实现 SQL 标准兼容性）。


## WITH TOTALS 修饰符 {#with-totals-modifier}

如果指定了 `WITH TOTALS` 修饰符,将会计算一个额外的行。该行的键列包含默认值(零或空字符串),聚合函数列包含对所有行计算得出的值("总计"值)。

这个额外的行仅在 `JSON*`、`TabSeparated*` 和 `Pretty*` 格式中生成,与其他行分开:

- 在 `XML` 和 `JSON*` 格式中,该行作为单独的 'totals' 字段输出。
- 在 `TabSeparated*`、`CSV*` 和 `Vertical` 格式中,该行位于主结果之后,前面有一个空行(在其他数据之后)。
- 在 `Pretty*` 格式中,该行作为单独的表在主结果之后输出。
- 在 `Template` 格式中,该行根据指定的模板输出。
- 在其他格式中不可用。

:::note
totals 会在 `SELECT` 查询的结果中输出,但不会在 `INSERT INTO ... SELECT` 中输出。
:::

当存在 [HAVING](/sql-reference/statements/select/having.md) 时,`WITH TOTALS` 可以以不同的方式运行。其行为取决于 `totals_mode` 设置。

### 配置总计处理 {#configuring-totals-processing}

默认情况下,`totals_mode = 'before_having'`。在这种情况下,'totals' 会对所有行进行计算,包括未通过 HAVING 和 `max_rows_to_group_by` 的行。

其他选项仅在 'totals' 中包含通过 HAVING 的行,并且在设置 `max_rows_to_group_by` 和 `group_by_overflow_mode = 'any'` 时表现不同。

`after_having_exclusive` – 不包含未通过 `max_rows_to_group_by` 的行。换句话说,'totals' 的行数将少于或等于省略 `max_rows_to_group_by` 时的行数。

`after_having_inclusive` – 在 'totals' 中包含所有未通过 'max_rows_to_group_by' 的行。换句话说,'totals' 的行数将多于或等于省略 `max_rows_to_group_by` 时的行数。

`after_having_auto` – 计算通过 HAVING 的行数。如果超过一定比例(默认为 50%),则在 'totals' 中包含所有未通过 'max_rows_to_group_by' 的行。否则,不包含它们。

`totals_auto_threshold` – 默认为 0.5。`after_having_auto` 的系数。

如果未使用 `max_rows_to_group_by` 和 `group_by_overflow_mode = 'any'`,则所有 `after_having` 变体都相同,您可以使用其中任何一个(例如 `after_having_auto`)。

您可以在子查询中使用 `WITH TOTALS`,包括 [JOIN](/sql-reference/statements/select/join.md) 子句中的子查询(在这种情况下,相应的总计值会被合并)。


## GROUP BY ALL {#group-by-all}

`GROUP BY ALL` 等同于列出所有非聚合函数的 SELECT 表达式。

例如:

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

对于特殊情况,如果某个函数的参数中同时包含聚合函数和其他字段,则 `GROUP BY` 键将包含从中提取的所有非聚合字段。

例如:

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

示例:

```sql
SELECT
    count(),
    median(FetchTiming > 60 ? 60 : FetchTiming),
    count() - sum(Refresh)
FROM hits
```

与 MySQL 不同(但符合标准 SQL),您无法获取不在键或聚合函数中的列的值(常量表达式除外)。要解决此问题,可以使用 'any' 聚合函数(获取首次遇到的值)或 'min/max'。

示例:

```sql
SELECT
    domainWithoutWWW(URL) AS domain,
    count(),
    any(Title) AS title -- 获取每个域名首次出现的页面标题
FROM hits
GROUP BY domain
```

对于遇到的每个不同键值,`GROUP BY` 会计算一组聚合函数值。


## GROUPING SETS 修饰符 {#grouping-sets-modifier}

这是最通用的修饰符。
此修饰符允许手动指定多个聚合键集(分组集)。
每个分组集会分别执行聚合,然后将所有结果合并。
如果某列未出现在分组集中,则使用默认值填充。

换句话说,上述修饰符都可以用 `GROUPING SETS` 来表示。
尽管使用 `ROLLUP`、`CUBE` 和 `GROUPING SETS` 修饰符的查询在语法上等价,但它们的执行方式可能不同。
`GROUPING SETS` 会尝试并行执行所有操作,而 `ROLLUP` 和 `CUBE` 则在单线程中执行聚合的最终合并。

当源列包含默认值时,可能难以区分某行是否属于使用这些列作为键的聚合结果。
要解决此问题,必须使用 `GROUPING` 函数。

**示例**

以下两个查询等价。

```sql
-- 查询 1
SELECT year, month, day, count(*) FROM t GROUP BY year, month, day WITH ROLLUP;

-- 查询 2
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

- [group_by_use_nulls](/operations/settings/settings.md#group_by_use_nulls) 设置,用于 SQL 标准兼容性。


## 实现细节 {#implementation-details}

聚合是列式数据库管理系统最重要的特性之一,因此其实现是 ClickHouse 中优化最深入的部分之一。默认情况下,聚合在内存中使用哈希表完成。它具有 40 多种专门化实现,会根据"分组键"的数据类型自动选择。

### 基于表排序键的 GROUP BY 优化 {#group-by-optimization-depending-on-table-sorting-key}

如果表按某个键排序,且 `GROUP BY` 表达式至少包含排序键的前缀或单射函数,则可以更高效地执行聚合。在这种情况下,当从表中读取新键时,可以完成中间聚合结果并将其发送到客户端。此行为由 [optimize_aggregation_in_order](../../../operations/settings/settings.md#optimize_aggregation_in_order) 设置控制。这种优化可以减少聚合期间的内存使用量,但在某些情况下可能会降低查询执行速度。

### 外部内存中的 GROUP BY {#group-by-in-external-memory}

您可以启用将临时数据转储到磁盘的功能,以限制 `GROUP BY` 期间的内存使用量。
[max_bytes_before_external_group_by](/operations/settings/settings#max_bytes_before_external_group_by) 设置确定将 `GROUP BY` 临时数据转储到文件系统的内存消耗阈值。如果设置为 0(默认值),则禁用此功能。
或者,您可以设置 [max_bytes_ratio_before_external_group_by](/operations/settings/settings#max_bytes_ratio_before_external_group_by),它允许仅在查询达到特定已用内存阈值后才在外部内存中使用 `GROUP BY`。

使用 `max_bytes_before_external_group_by` 时,我们建议将 `max_memory_usage` 设置为约两倍(或 `max_bytes_ratio_before_external_group_by=0.5`)。这是必要的,因为聚合分为两个阶段:读取数据并形成中间数据(阶段 1)以及合并中间数据(阶段 2)。数据转储到文件系统只能在阶段 1 期间发生。如果临时数据未被转储,则阶段 2 可能需要与阶段 1 相同的内存量。

例如,如果 [max_memory_usage](/operations/settings/settings#max_memory_usage) 设置为 10000000000 并且您想使用外部聚合,则将 `max_bytes_before_external_group_by` 设置为 10000000000,将 `max_memory_usage` 设置为 20000000000 是合理的。当触发外部聚合时(如果至少有一次临时数据转储),最大内存消耗仅略高于 `max_bytes_before_external_group_by`。

在分布式查询处理中,外部聚合在远程服务器上执行。为了使请求服务器仅使用少量内存,请将 `distributed_aggregation_memory_efficient` 设置为 1。

当合并刷新到磁盘的数据时,以及当启用 `distributed_aggregation_memory_efficient` 设置时合并来自远程服务器的结果时,最多消耗总内存量的 `1/256 * 线程数`。

启用外部聚合后,如果数据少于 `max_bytes_before_external_group_by`(即数据未被刷新),则查询运行速度与不使用外部聚合时一样快。如果有任何临时数据被刷新,运行时间将延长数倍(大约三倍)。

如果在 `GROUP BY` 之后有带 [LIMIT](/sql-reference/statements/select/limit.md) 的 [ORDER BY](/sql-reference/statements/select/order-by.md),则使用的内存量取决于 `LIMIT` 中的数据量,而不是整个表。但如果 `ORDER BY` 没有 `LIMIT`,请不要忘记启用外部排序(`max_bytes_before_external_sort`)。
