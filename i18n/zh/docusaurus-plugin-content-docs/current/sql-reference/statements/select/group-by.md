
# GROUP BY 子句

`GROUP BY` 子句将 `SELECT` 查询切换到聚合模式，其工作方式如下：

- `GROUP BY` 子句包含一个表达式列表（或一个单一的表达式，视为长度为一的列表）。该列表充当“分组键”，而每个单独的表达式称为“键表达式”。
- 所有在 [SELECT](/sql-reference/statements/select/index.md)、[HAVING](/sql-reference/statements/select/having.md) 和 [ORDER BY](/sql-reference/statements/select/order-by.md) 子句中的表达式 **必须** 基于键表达式 **或** 对非键表达式（包括普通列）的 [聚合函数](../../../sql-reference/aggregate-functions/index.md) 进行计算。换句话说，从表中选择的每一列必须作为键表达式使用或在聚合函数内使用，但不能同时使用。
- 聚合 `SELECT` 查询的结果将包含与源表中“分组键”的唯一值数量相等的行数。通常，这会显著减少行数，往往是几个数量级，但不一定：如果所有“分组键”值都是唯一的，则行数保持不变。

当您想通过列编号而不是列名称对表中的数据进行分组时，请启用设置 [enable_positional_arguments](/operations/settings/settings#enable_positional_arguments)。

:::note
还有另一种方法可以在表上运行聚合。如果查询仅在聚合函数内包含表列，则可以省略 `GROUP BY` 子句，并假定通过一个空的键集进行聚合。这种查询总是返回恰好一行。
:::

## NULL 处理 {#null-processing}

对于分组，ClickHouse 将 [NULL](/sql-reference/syntax#null) 解释为一个值，并且 `NULL==NULL`。这与大多数其他上下文中的 `NULL` 处理有所不同。

下面是一个示例来说明这意味着什么。

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

查询 `SELECT sum(x), y FROM t_null_big GROUP BY y` 的结果为：

```text
┌─sum(x)─┬────y─┐
│      4 │    2 │
│      3 │    3 │
│      5 │ ᴺᵁᴸᴸ │
└────────┴──────┘
```

您可以看到，`GROUP BY` 对于 `y = NULL` 时对 `x` 求和，仿佛 `NULL` 是这个值。

如果您将多个键传递给 `GROUP BY`，结果将给出选择的所有组合，就好像 `NULL` 是一个具体值。

## ROLLUP 修饰符 {#rollup-modifier}

`ROLLUP` 修饰符用于根据在 `GROUP BY` 列表中的顺序计算键表达式的子总和。子总和行在结果表之后添加。

子总和的计算是按反向顺序进行的：首先计算列表中最后一个键表达式的子总和，然后是前一个，以此类推，直到第一个键表达式。

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
由于 `GROUP BY` 部分具有三个键表达式，结果包含四个表，子总和“从右到左汇总”：

- `GROUP BY year, month, day`;
- `GROUP BY year, month`（此时 `day` 列填充为零）；
- `GROUP BY year`（现在 `month, day` 列都填充为零）；
- 和总和（所有三个键表达式列均为零）。

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
同样的查询还可以使用 `WITH` 关键字编写。
```sql
SELECT year, month, day, count(*) FROM t GROUP BY year, month, day WITH ROLLUP;
```

**另见**

- [group_by_use_nulls](/operations/settings/settings.md#group_by_use_nulls) 设置以保证与 SQL 标准兼容。

## CUBE 修饰符 {#cube-modifier}

`CUBE` 修饰符用于计算 `GROUP BY` 列表中每个键表达式组合的子总和。子总和行在结果表之后添加。

在子总和行中，所有“分组”的键表达式的值都设置为 `0` 或空行。

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

由于 `GROUP BY` 部分具有三个键表达式，结果包含八个表，涵盖所有键表达式组合的子总和：

- `GROUP BY year, month, day`
- `GROUP BY year, month`
- `GROUP BY year, day`
- `GROUP BY year`
- `GROUP BY month, day`
- `GROUP BY month`
- `GROUP BY day`
- 和总和。

未包含在 `GROUP BY` 中的列填充为零。

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

- [group_by_use_nulls](/operations/settings/settings.md#group_by_use_nulls) 设置以保证与 SQL 标准兼容。

## WITH TOTALS 修饰符 {#with-totals-modifier}

如果指定了 `WITH TOTALS` 修饰符，将计算另一行。这一行将具有默认值的键列（零或空行）和聚合函数的列，其值是针对所有行计算的（“总和”值）。

这一额外的行仅在 `JSON*`、`TabSeparated*` 和 `Pretty*` 格式中生成，与其他行分开：

- 在 `XML` 和 `JSON*` 格式中，这一行作为单独的“总和”字段输出。
- 在 `TabSeparated*`、`CSV*` 和 `Vertical` 格式中，行紧随主要结果出现，前面有一行空行（在其他数据之后）。
- 在 `Pretty*` 格式中，该行作为主结果之后的单独表输出。
- 在 `Template` 格式中，该行根据指定模板输出。
- 在其他格式中不可用。

:::note
总和仅在 `SELECT` 查询的结果中输出，而不会在 `INSERT INTO ... SELECT` 中输出。
:::

`WITH TOTALS` 在存在 [HAVING](/sql-reference/statements/select/having.md) 的情况下可以以不同的方式运行。行为取决于 `totals_mode` 设置。

### 配置总和处理 {#configuring-totals-processing}

默认情况下，`totals_mode = 'before_having'`。在这种情况下，“总和”是计算所有行的，包括没有通过 HAVING 和 `max_rows_to_group_by` 的行。

其他选项包括仅将通过 HAVING 的行包括在“总和”中，并在设置 `max_rows_to_group_by` 和 `group_by_overflow_mode = 'any'` 时表现不同。

`after_having_exclusive` – 不包括未通过 `max_rows_to_group_by` 的行。换句话说，“总和”的行数将少于或等于省略 `max_rows_to_group_by` 的情况。

`after_having_inclusive` – 包括所有未通过 `max_rows_to_group_by` 的行。换句话说，“总和”的行数将大于或等于省略 `max_rows_to_group_by` 的情况。

`after_having_auto` – 计算通过 HAVING 的行数。如果超过某个数量（默认值为 50%），则将所有未通过 `max_rows_to_group_by` 的行包括在“总和”中。否则，不包括它们。

`totals_auto_threshold` – 默认值为 0.5。用于 `after_having_auto` 的系数。

如果没有使用 `max_rows_to_group_by` 和 `group_by_overflow_mode = 'any'`，则所有 `after_having` 的变体是相同的，您可以使用它们中的任何一个（例如，`after_having_auto`）。

您可以在子查询中使用 `WITH TOTALS`，包括在 [JOIN](/sql-reference/statements/select/join.md) 子句中的子查询（在这种情况下，相应的总值会被合并）。

## GROUP BY ALL {#group-by-all}

`GROUP BY ALL` 等同于列出所有 SELECT 的表达式，这些表达式不是聚合函数。

例如：

```sql
SELECT
    a * 2,
    b,
    count(c),
FROM t
GROUP BY ALL
```

与

```sql
SELECT
    a * 2,
    b,
    count(c),
FROM t
GROUP BY a * 2, b
```

在特殊情况下，如果存在一个函数同时包含聚合函数和其他字段作为其参数，则 `GROUP BY` 键将包含可以从中提取的最大非聚合字段。

例如：

```sql
SELECT
    substring(a, 4, 2),
    substring(substring(a, 1, 2), 1, count(b))
FROM t
GROUP BY ALL
```

与

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

与 MySQL 相对（并符合标准 SQL），您不能获取未在键或聚合函数中的某列的某个值（常量表达式除外）。要解决此问题，您可以使用“any”聚合函数（获取第一个遇到的值）或“min/max”。

示例：

```sql
SELECT
    domainWithoutWWW(URL) AS domain,
    count(),
    any(Title) AS title -- getting the first occurred page header for each domain.
FROM hits
GROUP BY domain
```

对于每一个遇到的不同键值，`GROUP BY` 计算一组聚合函数值。

## GROUPING SETS 修饰符 {#grouping-sets-modifier}

这是最通用的修饰符。
此修饰符允许手动指定多个聚合键集（分组集）。
每个分组集单独执行聚合，然后将所有结果合并。
如果某列不在分组集中，则用默认值填充该列。

换句话说，上述描述的修饰符可以通过 `GROUPING SETS` 表示。
尽管带有 `ROLLUP`、`CUBE` 和 `GROUPING SETS` 修饰符的查询在语法上是等效的，但它们的执行方式可能不同。
当 `GROUPING SETS` 尝试并行执行时，`ROLLUP` 和 `CUBE` 在单线程中执行聚合的最终合并。

在源列包含默认值的情况下，可能难以区分一行是否属于使用这些列作为键的聚合。
要解决此问题，必须使用 `GROUPING` 函数。

**示例**

以下两个查询是等价的。

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

- [group_by_use_nulls](/operations/settings/settings.md#group_by_use_nulls) 设置以保证与 SQL 标准兼容。

## 实现细节 {#implementation-details}

聚合是列式数据库管理系统中最重要的功能之一，因此其实现是 ClickHouse 最被优化的部分之一。默认情况下，聚合是在内存中使用哈希表完成的。它有 40 多个特化，自动根据“分组键”数据类型进行选择。

### 根据表排序键的 GROUP BY 优化 {#group-by-optimization-depending-on-table-sorting-key}

如果表按某个键排序，且 `GROUP BY` 表达式至少包含排序键的前缀或单射函数，则聚合可以更有效地执行。在这种情况下，当从表中读取新键时，可以最终确定聚合的中间结果并发送给客户端。这种行为由设置 [optimize_aggregation_in_order](../../../operations/settings/settings.md#optimize_aggregation_in_order) 开启。此优化在聚合过程中减少内存使用，但在某些情况下可能会降低查询执行速度。

### 在外部内存中进行 GROUP BY {#group-by-in-external-memory}

您可以启用将临时数据转储到磁盘，以限制 `GROUP BY` 期间的内存使用。
设置 [max_bytes_before_external_group_by](/operations/settings/settings#max_bytes_before_external_group_by) 确定将 `GROUP BY` 临时数据转储到文件系统的阈值 RAM 消耗。如果设置为 0（默认值），则禁用。
另外，您可以设置 [max_bytes_ratio_before_external_group_by](/operations/settings/settings#max_bytes_ratio_before_external_group_by)，这允许在查询达到一定的使用内存阈值时使用外部内存中的 `GROUP BY`。

在使用 `max_bytes_before_external_group_by` 时，我们建议将 `max_memory_usage` 设置为大约两倍（或 `max_bytes_ratio_before_external_group_by=0.5`）。这是因聚合有两个阶段：读取数据和形成中间数据（1），以及合并中间数据（2）。数据仅能在阶段 1 时转储到文件系统。如果临时数据未转储，那么阶段 2 可能需要与阶段 1 近似的内存。

例如，如果将 [max_memory_usage](/operations/settings/settings#max_memory_usage) 设置为 10000000000，并且您希望使用外部聚合，则可以将 `max_bytes_before_external_group_by` 设置为 10000000000，将 `max_memory_usage` 设置为 20000000000。当触发外部聚合（如果至少转储了一个临时数据时），最大内存消耗仅比 `max_bytes_before_external_group_by` 稍多。

在分布式查询处理时，外部聚合在远程服务器上执行。为了使请求服务器仅使用少量 RAM，请将 `distributed_aggregation_memory_efficient` 设置为 1。

当合并转储到磁盘的数据以及在启用 `distributed_aggregation_memory_efficient` 设置的情况下合并来自远程服务器的结果时，消耗的 RAM 量高达 `1/256 * the_number_of_threads` 的总量。

启用外部聚合时，如果数据量少于 `max_bytes_before_external_group_by`（即数据未转储），则查询运行速度与未启用外部聚合时一样快。如果转储了任何临时数据，运行时间将会长几倍（大约三倍）。

如果您的 [ORDER BY](/sql-reference/statements/select/order-by.md) 后有一个 [LIMIT](/sql-reference/statements/select/limit.md)，则使用的 RAM 量取决于 `LIMIT` 中的数据量，而不是整个表的数量。但如果 `ORDER BY` 没有 `LIMIT`，请记得启用外部排序（`max_bytes_before_external_sort`）。
