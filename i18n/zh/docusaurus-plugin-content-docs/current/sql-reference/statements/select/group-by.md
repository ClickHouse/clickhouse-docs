---
'description': 'GROUP BY子句的文档'
'sidebar_label': 'GROUP BY'
'slug': '/sql-reference/statements/select/group-by'
'title': 'GROUP BY子句'
---




# GROUP BY 子句

`GROUP BY` 子句将 `SELECT` 查询切换到聚合模式，其工作方式如下：

- `GROUP BY` 子句包含一个表达式列表（或单个表达式，这被视为长度为一的列表）。此列表充当“分组键”，而每个单独的表达式将被称为“键表达式”。
- 在 [SELECT](/sql-reference/statements/select/index.md)、[HAVING](/sql-reference/statements/select/having.md) 和 [ORDER BY](/sql-reference/statements/select/order-by.md) 子句中，所有的表达式 **必须** 基于键表达式 **或** 对非键表达式（包括普通列）的 [聚合函数](../../../sql-reference/aggregate-functions/index.md) 进行计算。换句话说，从表中选择的每一列必须要么用于键表达式，要么用于聚合函数，但不能两者兼顾。
- 聚合 `SELECT` 查询的结果将包含与源表中“分组键”的唯一值相同数量的行。通常，这会显著减少行数，通常减少几个数量级，但不一定：如果所有“分组键”值都是唯一的，则行数保持不变。

当您想根据列号而不是列名对表中的数据进行分组时，请启用设置 [enable_positional_arguments](/operations/settings/settings#enable_positional_arguments)。

:::note
还有另一种方法可以对表进行聚合。如果查询仅在聚合函数中包含表列，则可以省略 `GROUP BY` 子句，并假定使用一个空的键集进行聚合。这样的查询始终返回一行。
:::

## NULL 处理 {#null-processing}

对于分组，ClickHouse 将 [NULL](/sql-reference/syntax#null) 解释为一个值，并认为 `NULL==NULL`。这与大多数其他上下文中的 `NULL` 处理有所不同。

以下是一个示例，展示了这意味着什么。

假设您有这样一个表：

```text
┌─x─┬────y─┐
│ 1 │    2 │
│ 2 │ ᴺᵁᴸᴸ │
│ 3 │    2 │
│ 3 │    3 │
│ 3 │ ᴺᵁᴸᴸ │
└───┴──────┘
```

查询 `SELECT sum(x), y FROM t_null_big GROUP BY y` 的结果为：

```text
┌─sum(x)─┬────y─┐
│      4 │    2 │
│      3 │    3 │
│      5 │ ᴺᵁᴸᴸ │
└────────┴──────┘
```

您可以看到，对于 `y = NULL` 的 `GROUP BY` 对 `x` 进行了求和，仿佛 `NULL` 是这个值。

如果您传递多个键给 `GROUP BY`，结果将给您所有选择的组合，就好像 `NULL` 是一个特定值。

## ROLLUP 修饰符 {#rollup-modifier}

`ROLLUP` 修饰符用于计算基于其在 `GROUP BY` 列表中的顺序的键表达式的小计。小计行在结果表之后添加。

小计是按照相反的顺序计算的：首先为列表中的最后一个键表达式计算小计，然后为之前的一个，依此类推直到第一个键表达式。

在小计行中，已“分组”的键表达式的值设置为 `0` 或空行。

:::note
请注意， [HAVING](/sql-reference/statements/select/having.md) 子句可能会影响小计结果。
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
由于 `GROUP BY` 部分有三个键表达式，结果包含四个表，带有从右到左“滚动”的小计：

- `GROUP BY year, month, day`；
- `GROUP BY year, month`（`day` 列填充为零）；
- `GROUP BY year`（现在 `month, day` 列都填充为零）；
- 总计（所有三个键表达式列都是零）。

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

**另见**

- [group_by_use_nulls](/operations/settings/settings.md#group_by_use_nulls) 设置以确保与 SQL 标准的兼容性。

## CUBE 修饰符 {#cube-modifier}

`CUBE` 修饰符用于计算 `GROUP BY` 列表中所有键表达式组合的小计。小计行在结果表之后添加。

在小计行中，所有“分组”键表达式的值设置为 `0` 或空行。

:::note
请注意， [HAVING](/sql-reference/statements/select/having.md) 子句可能会影响小计结果。
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

由于 `GROUP BY` 部分有三个键表达式，结果包含八个表，具有所有键表达式组合的小计：

- `GROUP BY year, month, day`
- `GROUP BY year, month`
- `GROUP BY year, day`
- `GROUP BY year`
- `GROUP BY month, day`
- `GROUP BY month`
- `GROUP BY day`
- 和总计。

未包括在 `GROUP BY` 中的列填充为零。

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
同样的查询也可以使用 `WITH` 关键字编写。
```sql
SELECT year, month, day, count(*) FROM t GROUP BY year, month, day WITH CUBE;
```

**另见**

- [group_by_use_nulls](/operations/settings/settings.md#group_by_use_nulls) 设置以确保与 SQL 标准的兼容性。

## WITH TOTALS 修饰符 {#with-totals-modifier}

如果指定了 `WITH TOTALS` 修饰符，将计算另一行。该行的键列包含默认值（零或空行），聚合函数的列包含计算出的总值（“总计”值）。

该额外行仅在 `JSON*`、`TabSeparated*` 和 `Pretty*` 格式中生成，与其他行分开：

- 在 `XML` 和 `JSON*` 格式中，该行输出为单独的“总计”字段。
- 在 `TabSeparated*`、`CSV*` 和 `Vertical` 格式中，该行位于主要结果之后，并在前面有一空行（在其他数据之后）。
- 在 `Pretty*` 格式中，该行在主要结果之后作为单独表输出。
- 在 `Template` 格式中，该行根据指定的模板输出。
- 在其他格式中不可用。

:::note
总计在 `SELECT` 查询的结果中输出，而在 `INSERT INTO ... SELECT` 中不输出。
:::

当存在 [HAVING](/sql-reference/statements/select/having.md) 时，可以以不同方式运行 `WITH TOTALS`。其行为取决于 `totals_mode` 设置。

### 配置总计处理 {#configuring-totals-processing}

默认情况下，`totals_mode = 'before_having'`。在这种情况下，'总计' 是在所有行中计算的，包括未通过 HAVING 和 `max_rows_to_group_by` 的行。

其他替代方案只包括通过 HAVING 的行的 '总计'，并且在使用设置 `max_rows_to_group_by` 和 `group_by_overflow_mode = 'any'` 时表现不同。

`after_having_exclusive` – 不包括未通过 `max_rows_to_group_by` 的行。换句话说，‘总计’的行数将少于或等于如果省略 `max_rows_to_group_by` 时的行数。

`after_having_inclusive` – 包括所有未通过 'max_rows_to_group_by' 的行在 '总计' 中。换句话说，‘总计’的行数将大于或等于如果省略 `max_rows_to_group_by` 时的行数。

`after_having_auto` – 计算通过 HAVING 的行数。如果超过某个数量（默认值为 50%），则在 '总计' 中包括所有未通过 'max_rows_to_group_by' 的行。否则，不包括它们。

`totals_auto_threshold` – 默认值为 0.5。适用于 `after_having_auto` 的系数。

如果未使用 `max_rows_to_group_by` 和 `group_by_overflow_mode = 'any'`，则所有 `after_having` 变体都是相同的，您可以使用其中任何一种（例如，`after_having_auto`）。

您可以在子查询中使用 `WITH TOTALS`，包括在 [JOIN](/sql-reference/statements/select/join.md) 子句中（在这种情况下，相应的总值会合并）。

## GROUP BY ALL {#group-by-all}

`GROUP BY ALL` 等同于列出所有未作为聚合函数的 SELECT 表达式。

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

在特殊情况下，如果有一个函数同时使用聚合函数和其他字段作为其参数，则 `GROUP BY` 键将包含我们可以从中提取的最大非聚合字段。

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

与 MySQL 相比（并符合标准 SQL），您无法获得未在键或聚合函数中的某列的某个值（常量表达式除外）。要解决这个问题，您可以使用 'any' 聚合函数（获取首次遇到的值）或 'min/max'。

示例：

```sql
SELECT
    domainWithoutWWW(URL) AS domain,
    count(),
    any(Title) AS title -- getting the first occurred page header for each domain.
FROM hits
GROUP BY domain
```

对于遇到的每个不同的键值，`GROUP BY` 计算一组聚合函数值。

## GROUPING SETS 修饰符 {#grouping-sets-modifier}

这是最通用的修饰符。
此修饰符允许手动指定多个聚合键集合（分组集）。
对每个分组集单独进行聚合，然后合并所有结果。
如果分组集中未出现某列，则其填充为默认值。

换句话说，上述修饰符可以通过 `GROUPING SETS` 来表示。
尽管带有 `ROLLUP`、`CUBE` 和 `GROUPING SETS` 修饰符的查询在语法上是相等的，但它们的执行可能会有所不同。
当 `GROUPING SETS` 尝试并行执行所有操作时，`ROLLUP` 和 `CUBE` 在单线程中执行聚合的最终合并。

在源列包含默认值的情况下，可能很难区分某一行是否是使用这些列作为键的聚合的一部分。
为了解决此问题，必须使用 `GROUPING` 函数。

**示例**

以下两个查询是等效的。

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

**另见**

- [group_by_use_nulls](/operations/settings/settings.md#group_by_use_nulls) 设置以确保与 SQL 标准的兼容性。

## 实现细节 {#implementation-details}

聚合是列式 DBMS 最重要的特性之一，因此其实现是 ClickHouse 最经过优化的部分之一。默认情况下，聚合在内存中使用哈希表完成。它有 40 多个专门化，自动根据“分组键”数据类型选择。

### 基于表排序键的 GROUP BY 优化 {#group-by-optimization-depending-on-table-sorting-key}

如果表按某个键排序，并且 `GROUP BY` 表达式包含至少一个排序键的前缀或单射函数，则可以更有效地执行聚合。在这种情况下，当从表中读取新键时，可以完成聚合的中间结果并将其发送到客户端。这种行为通过 [optimize_aggregation_in_order](../../../operations/settings/settings.md#optimize_aggregation_in_order) 设置开启。这种优化在聚合过程中减少了内存使用，但在某些情况下可能会减慢查询执行。

### 外部内存中的 GROUP BY {#group-by-in-external-memory}

您可以启用将临时数据转储到磁盘以限制 `GROUP BY` 期间的内存使用。
[ max_bytes_before_external_group_by](/operations/settings/settings#max_bytes_before_external_group_by) 设置确定将 `GROUP BY` 临时数据转储到文件系统的内存消费阈值。如果设置为 0（默认），则禁用此功能。
或者，您可以设置 [max_bytes_ratio_before_external_group_by](/operations/settings/settings#max_bytes_ratio_before_external_group_by)，这允许在查询达到某个阈值的内存使用时才在外部内存中使用 `GROUP BY`。

当使用 `max_bytes_before_external_group_by` 时，我们建议您将 `max_memory_usage` 设置为大约两倍（或 `max_bytes_ratio_before_external_group_by=0.5`）。这是必要的，因为聚合有两个阶段：读取数据和形成中间数据（1），以及合并中间数据（2）。将数据转储到文件系统只能在阶段 1 中发生。如果临时数据没有转储，则阶段 2 可能需要的内存与阶段 1 一样多。

例如，如果 [max_memory_usage](/operations/settings/settings#max_memory_usage) 设置为 10000000000 而您希望使用外部聚合，则将 `max_bytes_before_external_group_by` 设置为 10000000000，`max_memory_usage` 设置为 20000000000 是合理的。当外部聚合被触发（如果至少有一次临时数据转储），最大内存消耗仅会稍高于 `max_bytes_before_external_group_by`。

在分布式查询处理中，外部聚合在远程服务器上执行。为了使请求服务器只使用少量内存，请将 `distributed_aggregation_memory_efficient` 设置为 1。

在合并刷新到磁盘的数据时，以及在启用 `distributed_aggregation_memory_efficient` 设置时合并来自远程服务器的结果时，最多使用 `1/256 * 线程数` 的总内存。

当启用外部聚合时，如果数据少于 `max_bytes_before_external_group_by`（即数据未刷新），查询运行速度与未启用外部聚合相同。如果任何临时数据已被刷新，则运行时间将长几倍（大约三倍）。

如果在 `GROUP BY` 后有 [ORDER BY](/sql-reference/statements/select/order-by.md) 和 [LIMIT](/sql-reference/statements/select/limit.md)，则使用的 RAM 量取决于 `LIMIT` 中的数据量，而不是整个表的数据量。但如果 `ORDER BY` 没有 `LIMIT`，不要忘记启用外部排序（`max_bytes_before_external_sort`）。
