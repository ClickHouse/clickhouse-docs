---
slug: /sql-reference/statements/select/group-by
sidebar_label: 'GROUP BY'
---


# GROUP BY 子句

`GROUP BY` 子句将 `SELECT` 查询切换到聚合模式，其工作方式如下：

- `GROUP BY` 子句包含一个表达式列表（或单个表达式，这被视为长度为一的列表）。这个列表作为“分组键”，而每个单独的表达式将被称为“键表达式”。
- 所有在 [SELECT](/sql-reference/statements/select/index.md)、[HAVING](/sql-reference/statements/select/having.md) 和 [ORDER BY](/sql-reference/statements/select/order-by.md) 子句中的表达式 **必须** 基于键表达式 **或** 在非键表达式（包括普通列）上的 [聚合函数](../../../sql-reference/aggregate-functions/index.md) 计算。换句话说，从表中选择的每一列必须在键表达式中使用或在聚合函数内部使用，而不是两者都用。
- 聚合 `SELECT` 查询的结果将包含与源表中“分组键”唯一值的数量相同的行。通常，这会显著减少行数，通常减少几个数量级，但不一定：如果所有“分组键”的值都是不同的，则行数保持不变。

当您想按列号而非列名对表中的数据进行分组时，请启用设置 [enable_positional_arguments](/operations/settings/settings#enable_positional_arguments)。

:::note
还有一种在表上运行聚合的方法。如果查询仅在聚合函数内部包含表列，则可以省略 `GROUP BY` 子句，且假定按空键集进行聚合。这种查询始终返回确切的一行。
:::

## NULL 处理 {#null-processing}

对于分组，ClickHouse 将 [NULL](/sql-reference/syntax#null) 视为一个值，并且 `NULL==NULL`。这与大多数其他上下文中的 `NULL` 处理有所不同。

下面是一个示例，展示这意味着什么。

假设您有以下表：

``` text
┌─x─┬────y─┐
│ 1 │    2 │
│ 2 │ ᴺᵁᴸᴸ │
│ 3 │    2 │
│ 3 │    3 │
│ 3 │ ᴺᵁᴸᴸ │
└───┴──────┘
```

查询 `SELECT sum(x), y FROM t_null_big GROUP BY y` 的结果为：

``` text
┌─sum(x)─┬────y─┐
│      4 │    2 │
│      3 │    3 │
│      5 │ ᴺᵁᴸᴸ │
└────────┴──────┘
```

您可以看到，`GROUP BY` 对于 `y = NULL` 汇总了 `x`，仿佛 `NULL` 是这个值。

如果您将多个键传递给 `GROUP BY`，结果将为您提供选择的所有组合，好像 `NULL` 是一个特定的值。

## ROLLUP 修饰符 {#rollup-modifier}

`ROLLUP` 修饰符用于根据在 `GROUP BY` 列表中的顺序计算键表达式的子总和。子总和行会在结果表之后添加。

子总和是按相反的顺序计算的：首先计算列表中最后一个键表达式的子总和，然后是前一个，以此类推，一直到第一个键表达式。

在子总和行中，已经“分组”的键表达式的值设置为 `0` 或空行。

:::note
请注意，[HAVING](/sql-reference/statements/select/having.md) 子句可能会影响子总和结果。
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
由于 `GROUP BY` 部分有三个键表达式，结果包含四个具有“从右到左汇总”的子总和表：

- `GROUP BY year, month, day`;
- `GROUP BY year, month`（`day` 列填充为零）；
- `GROUP BY year`（现在 `month, day` 列均填充为零）；
- 总计（所有三个键表达式列均为零）。

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
相同的查询也可以使用 `WITH` 关键字写出。
```sql
SELECT year, month, day, count(*) FROM t GROUP BY year, month, day WITH ROLLUP;
```

**另见**

- [group_by_use_nulls](/operations/settings/settings.md#group_by_use_nulls) 设置以兼容 SQL 标准。

## CUBE 修饰符 {#cube-modifier}

`CUBE` 修饰符用于计算 `GROUP BY` 列表中所有键表达式的每个组合的子总和。子总和行会在结果表之后添加。

在子总和行中，所有“分组”键表达式的值设置为 `0` 或空行。

:::note
请注意，[HAVING](/sql-reference/statements/select/having.md) 子句可能会影响子总和结果。
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

由于 `GROUP BY` 部分有三个键表达式，结果包含八个具有所有键表达式组合的子总和表：

- `GROUP BY year, month, day`
- `GROUP BY year, month`
- `GROUP BY year, day`
- `GROUP BY year`
- `GROUP BY month, day`
- `GROUP BY month`
- `GROUP BY day`
- 及总计。

未在 `GROUP BY` 中的列用零填充。

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
相同的查询也可以使用 `WITH` 关键字写出。
```sql
SELECT year, month, day, count(*) FROM t GROUP BY year, month, day WITH CUBE;
```

**另见**

- [group_by_use_nulls](/operations/settings/settings.md#group_by_use_nulls) 设置以兼容 SQL 标准。

## WITH TOTALS 修饰符 {#with-totals-modifier}

如果指定了 `WITH TOTALS` 修饰符，则将计算另一行。此行的关键列将包含默认值（零或空行），聚合函数的列将包含跨所有行计算的值（“总计”值）。

这一额外行仅在 `JSON*`、`TabSeparated*` 和 `Pretty*` 格式中生成，与其他行分开：

- 在 `XML` 和 `JSON*` 格式中，此行作为单独的“总计”字段输出。
- 在 `TabSeparated*`、`CSV*` 和 `Vertical` 格式中，该行在主要结果之后出现，前面有一条空行（在其他数据之后）。
- 在 `Pretty*` 格式中，该行在主要结果之后作为单独表输出。
- 在 `Template` 格式中，该行根据指定的模板输出。
- 在其他格式中不可用。

:::note
“总计”在 `SELECT` 查询的结果中输出，而在 `INSERT INTO ... SELECT` 中不输出。
:::

`WITH TOTALS` 在存在 [HAVING](/sql-reference/statements/select/having.md) 时可以以不同的方式运行。其行为取决于 `totals_mode` 设置。

### 配置总计处理 {#configuring-totals-processing}

默认情况下，`totals_mode = 'before_having'`。在这种情况下，“总计”是在所有行中计算的，包括那些未通过 HAVING 和 `max_rows_to_group_by` 的行。

其他替代方案仅在“总计”中包含通过 HAVING 的行，并在 `max_rows_to_group_by` 和 `group_by_overflow_mode = 'any'` 设置上具有不同的行为。

`after_having_exclusive` - 不包括未通过 `max_rows_to_group_by` 的行。换句话说，“总计”的行数将少于或等于如果遗漏 `max_rows_to_group_by` 的情况下的行数。

`after_having_inclusive` - 将所有未通过 `max_rows_to_group_by` 的行包含在“总计”中。换句话说，“总计”的行数将多于或等于如果遗漏 `max_rows_to_group_by` 的情况下的行数。

`after_having_auto` - 统计通过 HAVING 的行数。如果它超过某个数量（默认为 50%），则在“总计”中包括所有未通过 `max_rows_to_group_by` 的行。否则，不包括它们。

`totals_auto_threshold` - 默认值为 0.5。用于 `after_having_auto` 的系数。

如果未使用 `max_rows_to_group_by` 和 `group_by_overflow_mode = 'any'`，则所有的 `after_having` 变体都是相同的，您可以使用其中任何一个（例如，`after_having_auto`）。

您可以在子查询中使用 `WITH TOTALS`，包括在 [JOIN](/sql-reference/statements/select/join.md) 子句中的子查询（在这种情况下，相应的总值会被合并）。

## GROUP BY ALL {#group-by-all}

`GROUP BY ALL` 等同于列出所有未包含聚合函数的 SELECT 表达式。

例如：

``` sql
SELECT
    a * 2,
    b,
    count(c),
FROM t
GROUP BY ALL
```

与

``` sql
SELECT
    a * 2,
    b,
    count(c),
FROM t
GROUP BY a * 2, b
```

是相同的。

对于特定情况，如果存在同时包含聚合函数和其他字段的函数，则 `GROUP BY` 键将包含可以从中提取的最大非聚合字段。

例如：

``` sql
SELECT
    substring(a, 4, 2),
    substring(substring(a, 1, 2), 1, count(b))
FROM t
GROUP BY ALL
```

与

``` sql
SELECT
    substring(a, 4, 2),
    substring(substring(a, 1, 2), 1, count(b))
FROM t
GROUP BY substring(a, 4, 2), substring(a, 1, 2)
```

是相同的。

## 示例 {#examples}

示例：

``` sql
SELECT
    count(),
    median(FetchTiming > 60 ? 60 : FetchTiming),
    count() - sum(Refresh)
FROM hits
```

与 MySQL 相反（并符合标准 SQL），您不能获取未在键或聚合函数中的某列的某个值（常量表达式除外）。为了解决这个问题，您可以使用 'any' 聚合函数（获取首次遇到的值）或 'min/max'。

示例：

``` sql
SELECT
    domainWithoutWWW(URL) AS domain,
    count(),
    any(Title) AS title -- 获取每个域名的首个页面标题。
FROM hits
GROUP BY domain
```

对于每个遇到的不同键值，`GROUP BY` 计算一组聚合函数值。

## GROUPING SETS 修饰符 {#grouping-sets-modifier}

这是最通用的修饰符。
此修饰符允许手动指定多个聚合键集合（分组集合）。
对于每个分组集分别执行聚合，并将所有结果合并。
如果列未在分组集中出现，则用默认值填充。

换句话说，上述修饰符可以通过 `GROUPING SETS` 表示。
尽管带有 `ROLLUP`、`CUBE` 和 `GROUPING SETS` 修饰符的查询在语法上是相等的，但它们的性能可能不同。
执行 `GROUPING SETS` 尝试并行执行所有操作，而执行 `ROLLUP` 和 `CUBE` 则是在单线程中执行聚合的最终合并。

当源列包含默认值时，可能很难区分一行是否属于使用这些列作为键的聚合的一部分。
为了解决这个问题，必须使用 `GROUPING` 函数。

**示例**

以下两个查询是等效的。

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

**另见**

- [group_by_use_nulls](/operations/settings/settings.md#group_by_use_nulls) 设置以兼容 SQL 标准。

## 实现细节 {#implementation-details}

聚合是列式 DBMS 最重要的特性之一，因此其实现是 ClickHouse 中经过深度优化的部分之一。默认情况下，聚合是在内存中使用哈希表完成的。它具有 40 多个特殊化，根据“分组键”数据类型自动选择。

### 依赖于表排序键的 GROUP BY 优化 {#group-by-optimization-depending-on-table-sorting-key}

如果某个表按某个键排序，并且 `GROUP BY` 表达式至少包含排序键的前缀或单射函数，则可以更有效地执行聚合。在这种情况下，当从表中读取新键时，可以最终确定聚合的中间结果并将其发送给客户端。这种行为通过 [optimize_aggregation_in_order](../../../operations/settings/settings.md#optimize_aggregation_in_order) 设置开启。这种优化减少了聚合过程中的内存使用，但在某些情况下可能会减慢查询执行速度。

### 外部内存中的 GROUP BY {#group-by-in-external-memory}

您可以启用将临时数据转储到磁盘以限制 `GROUP BY` 期间的内存使用。
`[max_bytes_before_external_group_by](/operations/settings/query-complexity.md#settings-max_bytes_before_external_group_by)` 设置确定将 `GROUP BY` 临时数据转储到文件系统的 RAM 消耗阈值。如果设置为 0（默认值），则禁用。
另外，您可以设置 `[max_bytes_ratio_before_external_group_by](/operations/settings/query-complexity.md#settings-max_bytes_ratio_before_external_group_by)`，仅在查询达到某个使用内存阈值时允许使用外部内存中的 `GROUP BY`。

使用 `max_bytes_before_external_group_by` 时，建议将 `max_memory_usage` 设置为大约两倍（或 `max_bytes_ratio_before_external_group_by=0.5`）。这是因为聚合有两个阶段：读取数据和形成中间数据（1），以及合并中间数据（2）。只能在阶段 1 中进行数据转储。如果临时数据未被转储，则阶段 2 可能会需要与阶段 1 相同的内存量。

例如，如果 `[max_memory_usage](/operations/settings/query-complexity.md#settings_max_memory_usage)` 设置为 10000000000，并且希望使用外部聚合，建议将 `max_bytes_before_external_group_by` 设置为 10000000000，并将 `max_memory_usage` 设置为 20000000000。当触发外部聚合时（如果有至少一次临时数据转储），最多消耗的 RAM 稍微超过 `max_bytes_before_external_group_by`。

通过分布式查询处理，远程服务器上执行外部聚合。为了使请求服务器仅使用少量 RAM，请将 `distributed_aggregation_memory_efficient` 设置为 1。

在将数据合并到磁盘时，以及在启用 `distributed_aggregation_memory_efficient` 设置时从远程服务器合并结果时，最多消耗总 RAM 的 `1/256 * the_number_of_threads`。

启用外部聚合时，如果数据少于 `max_bytes_before_external_group_by`（即数据未被转储），查询的运行速度与不使用外部聚合一样快。如果任何临时数据已被转储，则运行时间将延长几倍（约三倍）。

如果在 `GROUP BY` 之后有 [ORDER BY](/sql-reference/statements/select/order-by.md) 和 [LIMIT](/sql-reference/statements/select/limit.md)，则使用的 RAM 量取决于 `LIMIT` 中的数据量，而不是整个表中的数据量。但是，如果 `ORDER BY` 没有 `LIMIT`，请不要忘记启用外部排序（`max_bytes_before_external_sort`）。
