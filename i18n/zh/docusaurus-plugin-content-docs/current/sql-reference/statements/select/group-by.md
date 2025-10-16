---
'description': 'GROUP BY 子句 的文档'
'sidebar_label': 'GROUP BY'
'slug': '/sql-reference/statements/select/group-by'
'title': 'GROUP BY 子句'
'doc_type': 'reference'
---


# GROUP BY 子句

`GROUP BY` 子句将 `SELECT` 查询切换到聚合模式，其工作方式如下：

- `GROUP BY` 子句包含一个表达式列表（或一个单一表达式，该表达式被视为长度为一的列表）。这个列表充当“分组键”，而每个单独的表达式将被称为“键表达式”。
- [SELECT](/sql-reference/statements/select/index.md)、[HAVING](/sql-reference/statements/select/having.md) 和 [ORDER BY](/sql-reference/statements/select/order-by.md) 子句中的所有表达式 **必须** 基于键表达式 **或** 非键表达式（包括普通列）上的 [聚合函数](../../../sql-reference/aggregate-functions/index.md) 进行计算。换句话说，从表中选择的每一列必须用于键表达式或聚合函数内部，但不能同时用于这两者。
- 聚合 `SELECT` 查询的结果将包含与源表中“分组键”唯一值的数量相等的行。通常，这会显著减少行数，通常是几个数量级，但并不一定：如果所有“分组键”值都是唯一的，则行数保持不变。

当您希望按列数字而不是列名对表中的数据进行分组时，请启用设置 [enable_positional_arguments](/operations/settings/settings#enable_positional_arguments)。

:::note
还有另一种在表上运行聚合的方法。如果查询仅在聚合函数内部包含表列，则可以省略 `GROUP BY` 子句，默认情况下假设根据空的键集进行聚合。这类查询总是返回一行。
:::

## NULL 处理 {#null-processing}

对于分组，ClickHouse 将 [NULL](/sql-reference/syntax#null) 视为值，并且 `NULL==NULL`。这与大多数其他上下文中的 NULL 处理不同。

以下是一个示例以展示这意味着什么。

假设您有这个表：

```text
┌─x─┬────y─┐
│ 1 │    2 │
│ 2 │ ᴺᵁᴸᴸ │
│ 3 │    2 │
│ 3 │    3 │
│ 3 │ ᴺᵁᴸᴸ │
└───┴──────┘
```

查询 `SELECT sum(x), y FROM t_null_big GROUP BY y` 的结果是：

```text
┌─sum(x)─┬────y─┐
│      4 │    2 │
│      3 │    3 │
│      5 │ ᴺᵁᴸᴸ │
└────────┴──────┘
```

您可以看到对于 `y = NULL` 的 `GROUP BY` 对 `x` 进行了求和，仿佛 `NULL` 是这个值。

如果您将多个键传递给 `GROUP BY`，结果将给出选择的所有组合，仿佛 `NULL` 是一个特定值。

## ROLLUP 修饰符 {#rollup-modifier}

`ROLLUP` 修饰符用于根据 `GROUP BY` 列表中的顺序计算键表达式的子总计。子总计行将添加到结果表之后。

子总计是按相反的顺序计算的：首先计算列表中最后一个键表达式的子总计，然后是前一个，以此类推，直到第一个键表达式。

在子总计行中，已经“分组”的键表达式的值被设置为 `0` 或空行。

:::note
请注意 [HAVING](/sql-reference/statements/select/having.md) 子句可能会影响子总计结果。
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
由于 `GROUP BY` 部分有三个键表达式，结果包含四个带有从右到左“卷起”的子总计的表：

- `GROUP BY year, month, day`;
- `GROUP BY year, month`（并且 `day` 列填充为零）；
- `GROUP BY year`（现在 `month, day` 列均填充为零）；
- 以及总计（所有三个键表达式列均为零）。

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
相同的查询也可以使用 `WITH` 关键字书写。
```sql
SELECT year, month, day, count(*) FROM t GROUP BY year, month, day WITH ROLLUP;
```

**另见**

- [group_by_use_nulls](/operations/settings/settings.md#group_by_use_nulls) 设置以兼容 SQL 标准。

## CUBE 修饰符 {#cube-modifier}

`CUBE` 修饰符用于计算 `GROUP BY` 列表中键表达式的每个组合的子总计。子总计行将添加到结果表之后。

在子总计行中，所有“分组”的键表达式的值被设置为 `0` 或空行。

:::note
请注意 [HAVING](/sql-reference/statements/select/having.md) 子句可能会影响子总计结果。
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

由于 `GROUP BY` 部分有三个键表达式，结果包含八个带有所有键表达式组合的子总计的表：

- `GROUP BY year, month, day`
- `GROUP BY year, month`
- `GROUP BY year, day`
- `GROUP BY year`
- `GROUP BY month, day`
- `GROUP BY month`
- `GROUP BY day`
- 以及总计。

不在 `GROUP BY` 中的列填充为零。

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
相同的查询还可以使用 `WITH` 关键字书写。
```sql
SELECT year, month, day, count(*) FROM t GROUP BY year, month, day WITH CUBE;
```

**另见**

- [group_by_use_nulls](/operations/settings/settings.md#group_by_use_nulls) 设置以兼容 SQL 标准。

## WITH TOTALS 修饰符 {#with-totals-modifier}

如果指定了 `WITH TOTALS` 修饰符，将计算另一行。该行的键列将包含默认值（零或空行），而聚合函数的列将对所有行进行计算（“总计”值）。

此额外行仅在 `JSON*`、`TabSeparated*` 和 `Pretty*` 格式中生成，独立于其他行：

- 在 `XML` 和 `JSON*` 格式中，该行输出为单独的“总计”字段。
- 在 `TabSeparated*`、`CSV*` 和 `Vertical` 格式中，该行在主要结果之后出现，前面有一行空行（在其他数据之后）。
- 在 `Pretty*` 格式中，该行输出为主要结果之后的单独表。
- 在 `Template` 格式中，该行根据指定模板输出。
- 在其他格式中不可用。

:::note
总计在 `SELECT` 查询的结果中输出，不会在 `INSERT INTO ... SELECT` 中输出。
:::

当存在 [HAVING](/sql-reference/statements/select/having.md) 时，可以以不同方式运行 `WITH TOTALS`。其行为取决于 `totals_mode` 设置。

### 配置总计处理 {#configuring-totals-processing}

默认情况下，`totals_mode = 'before_having'`。在这种情况下，“总计”是在所有行上计算的，包括未通过 HAVING 和 `max_rows_to_group_by` 的行。

其他选项包括仅将通过 HAVING 的行包含在“总计”中，并在 `max_rows_to_group_by` 和 `group_by_overflow_mode = 'any'` 设置时表现不同。

`after_having_exclusive` - 不包含未通过 `max_rows_to_group_by` 的行。换句话说，“总计”的行数将少于或等于未省略 `max_rows_to_group_by` 时的行数。

`after_having_inclusive` - 包括所有未通过 `max_rows_to_group_by` 的行在“总计”中。换句话说，“总计”的行数将多于或等于未省略 `max_rows_to_group_by` 时的行数。

`after_having_auto` - 计算通过 HAVING 的行数。如果超过某个量（默认 50%），则在“总计”中包括所有未通过 `max_rows_to_group_by` 的行。否则，不包括它们。

`totals_auto_threshold` - 默认值为 0.5。用于 `after_having_auto` 的系数。

如果未使用 `max_rows_to_group_by` 和 `group_by_overflow_mode = 'any'`，则 `after_having` 的所有变体都是相同的，您可以使用它们中的任何一种（例如，`after_having_auto`）。

您可以在子查询中使用 `WITH TOTALS`，包括在 [JOIN](/sql-reference/statements/select/join.md) 子句中的子查询（在此情况下，相应的总计值会合并）。

## GROUP BY ALL {#group-by-all}

`GROUP BY ALL` 相当于列出所有未作为聚合函数的 SELECT 表达式。

例如：

```sql
SELECT
    a * 2,
    b,
    count(c),
FROM t
GROUP BY ALL
```

与以下内容相同：

```sql
SELECT
    a * 2,
    b,
    count(c),
FROM t
GROUP BY a * 2, b
```

对于一个特殊情况，如果有一个函数拥有聚合函数和其他字段作为其参数，则 `GROUP BY` 键将包含我们可以从中提取的最大非聚合字段。

例如：

```sql
SELECT
    substring(a, 4, 2),
    substring(substring(a, 1, 2), 1, count(b))
FROM t
GROUP BY ALL
```

与以下内容相同：

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

与 MySQL 相对（并符合标准 SQL），您不能获取某个不在键或聚合函数中的列的一些值（常量表达式除外）。为了解决这个问题，您可以使用 'any' 聚合函数（获取首次遇到的值）或 'min/max'。

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

这是最一般的修饰符。
该修饰符允许手动指定多个聚合键集（分组集）。
对每个分组集单独执行聚合，然后将所有结果合并在一起。
如果某一列未在分组集中，则用默认值填充。

换句话说，上述修饰符可以通过 `GROUPING SETS` 表示。
尽管带有 `ROLLUP`、`CUBE` 和 `GROUPING SETS` 修饰符的查询在语法上是相等的，但它们的执行可能有所不同。
当 `GROUPING SETS` 尝试并行执行所有内容时，`ROLLUP` 和 `CUBE` 会在单线程中执行聚合的最终合并。

在源列包含默认值的情况下，可能很难区分一行是否属于使用这些列作为键的聚合。
为了解决这个问题，必须使用 `GROUPING` 函数。

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

- [group_by_use_nulls](/operations/settings/settings.md#group_by_use_nulls) 设置以兼容 SQL 标准。

## 实现细节 {#implementation-details}

聚合是列式数据库管理系统最重要的特性之一，因此它的实现是 ClickHouse 最优化的部分之一。默认情况下，聚合是在内存中使用哈希表进行的。它有 40 多个特化版本，依据“分组键”数据类型自动选择。

### 根据表排序键的 GROUP BY 优化 {#group-by-optimization-depending-on-table-sorting-key}

如果表通过某个键排序，并且 `GROUP BY` 表达式至少包含排序键的前缀或单射函数，则聚合可以更有效地执行。在这种情况下，当从表中读取新的键时，可以最终确定聚合的中间结果并发送给客户端。此行为通过设置 [optimize_aggregation_in_order](../../../operations/settings/settings.md#optimize_aggregation_in_order) 开启。这种优化在聚合期间减少了内存使用，但在某些情况下可能会减慢查询执行速度。

### 在外部内存中的 GROUP BY {#group-by-in-external-memory}

您可以启用将临时数据转储到磁盘的功能，以限制在 `GROUP BY` 期间的内存使用。
设置 [max_bytes_before_external_group_by](/operations/settings/settings#max_bytes_before_external_group_by) 确定转储 `GROUP BY` 临时数据到文件系统的内存消耗阈值。如果设置为 0（默认值），则禁用。
或者，您可以设置 [max_bytes_ratio_before_external_group_by](/operations/settings/settings#max_bytes_ratio_before_external_group_by)，这允许在查询达到特定的内存使用阈值之前仅在外部内存中使用 `GROUP BY`。

使用 `max_bytes_before_external_group_by` 时，我们建议您将 `max_memory_usage` 设置为大约两倍（或 `max_bytes_ratio_before_external_group_by=0.5`）。这是因为聚合有两个阶段：读取数据并形成中间数据（1）和合并中间数据（2）。只能在阶段 1 期间将数据转储到文件系统中。如果临时数据没有转储，那么阶段 2 可能会需要与阶段 1 相同数量的内存。

例如，如果设置了 [max_memory_usage](/operations/settings/settings#max_memory_usage) 为 10000000000 并且您希望使用外部聚合，那么将 `max_bytes_before_external_group_by` 设置为 10000000000 并将 `max_memory_usage` 设置为 20000000000 是有意义的。当触发外部聚合时（如果至少有一次临时数据转储），最大内存消耗仅比 `max_bytes_before_external_group_by` 稍高。

在分布式查询处理中，外部聚合在远程服务器上执行。为了使请求者服务器仅使用少量 RAM，设置 `distributed_aggregation_memory_efficient` 为 1。

在合并刷新到磁盘的数据时，以及在启用 `distributed_aggregation_memory_efficient` 设置时合并来自远程服务器的结果时，消耗的 RAM 最高为 `1/256 * the_number_of_threads`。

启用外部聚合时，如果数据少于 `max_bytes_before_external_group_by`（即数据未刷新），查询运行与未进行外部聚合时一样快。如果任何临时数据被刷新，运行时间将延长几倍（大约三倍）。

如果您在 `GROUP BY` 之后有一个带有 [LIMIT](/sql-reference/statements/select/limit.md) 的 [ORDER BY](/sql-reference/statements/select/order-by.md)，那么所使用的 RAM 的量取决于 `LIMIT` 中的数据量，而不是整个表的量。但如果 `ORDER BY` 没有 `LIMIT`，请不要忘记启用外部排序 (`max_bytes_before_external_sort`)。
