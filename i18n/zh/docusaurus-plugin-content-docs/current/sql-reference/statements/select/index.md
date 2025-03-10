---
slug: /sql-reference/statements/select/
sidebar_position: 32
sidebar_label: SELECT
---


# SELECT 查询

`SELECT` 查询执行数据检索。默认情况下，请求的数据返回给客户端，而与 [INSERT INTO](../../../sql-reference/statements/insert-into.md) 结合时可以转发到不同的表。

## 语法 {#syntax}

``` sql
[WITH expr_list(subquery)]
SELECT [DISTINCT [ON (column1, column2, ...)]] expr_list
[FROM [db.]table | (subquery) | table_function] [FINAL]
[SAMPLE sample_coeff]
[ARRAY JOIN ...]
[GLOBAL] [ANY|ALL|ASOF] [INNER|LEFT|RIGHT|FULL|CROSS] [OUTER|SEMI|ANTI] JOIN (subquery)|table [(alias1 [, alias2 ...])] (ON <expr_list>)|(USING <column_list>)
[PREWHERE expr]
[WHERE expr]
[GROUP BY expr_list] [WITH ROLLUP|WITH CUBE] [WITH TOTALS]
[HAVING expr]
[WINDOW window_expr_list]
[QUALIFY expr]
[ORDER BY expr_list] [WITH FILL] [FROM expr] [TO expr] [STEP expr] [INTERPOLATE [(expr_list)]]
[LIMIT [offset_value, ]n BY columns]
[LIMIT [n, ]m] [WITH TIES]
[SETTINGS ...]
[UNION  ...]
[INTO OUTFILE filename [COMPRESSION type [LEVEL level]] ]
[FORMAT format]
```

所有子句都是可选的，除了 `SELECT` 后面的表达式列表是必需的，关于这一点将在 [下面](#select-clause) 详细介绍。

每个可选子句的具体内容在单独的部分中进行介绍，顺序与其执行顺序一致：

- [WITH 子句](../../../sql-reference/statements/select/with.md)
- [SELECT 子句](#select-clause)
- [DISTINCT 子句](../../../sql-reference/statements/select/distinct.md)
- [FROM 子句](../../../sql-reference/statements/select/from.md)
- [SAMPLE 子句](../../../sql-reference/statements/select/sample.md)
- [JOIN 子句](../../../sql-reference/statements/select/join.md)
- [PREWHERE 子句](../../../sql-reference/statements/select/prewhere.md)
- [WHERE 子句](../../../sql-reference/statements/select/where.md)
- [WINDOW 子句](../../../sql-reference/window-functions/index.md)
- [GROUP BY 子句](/sql-reference/statements/select/group-by)
- [LIMIT BY 子句](../../../sql-reference/statements/select/limit-by.md)
- [HAVING 子句](../../../sql-reference/statements/select/having.md)
- [QUALIFY 子句](../../../sql-reference/statements/select/qualify.md)
- [LIMIT 子句](../../../sql-reference/statements/select/limit.md)
- [OFFSET 子句](../../../sql-reference/statements/select/offset.md)
- [UNION 子句](../../../sql-reference/statements/select/union.md)
- [INTERSECT 子句](../../../sql-reference/statements/select/intersect.md)
- [EXCEPT 子句](../../../sql-reference/statements/select/except.md)
- [INTO OUTFILE 子句](../../../sql-reference/statements/select/into-outfile.md)
- [FORMAT 子句](../../../sql-reference/statements/select/format.md)

## SELECT 子句 {#select-clause}

在 `SELECT` 子句中指定的 [表达式](/sql-reference/syntax#expressions) 是在上述子句中的所有操作完成后计算的。这些表达式的作用类似于它们适用于结果中的独立行。如果 `SELECT` 子句中的表达式包含聚合函数，则 ClickHouse 在 [GROUP BY](/sql-reference/statements/select/group-by) 聚合期间处理聚合函数和作为其参数使用的表达式。

如果你想在结果中包含所有列，请使用星号 (`*`) 符号。例如，`SELECT * FROM ...`。

### 动态列选择 {#dynamic-column-selection}

动态列选择（也称为 COLUMNS 表达式）允许你使用 [re2](https://en.wikipedia.org/wiki/RE2_(software)) 正则表达式匹配结果中的某些列。

``` sql
COLUMNS('regexp')
```

例如，考虑以下表格：

``` sql
CREATE TABLE default.col_names (aa Int8, ab Int8, bc Int8) ENGINE = TinyLog
```

以下查询从所有包含 `a` 符号的列中选择数据。

``` sql
SELECT COLUMNS('a') FROM col_names
```

``` text
┌─aa─┬─ab─┐
│  1 │  1 │
└────┴────┘
```

选择的列不会以字母顺序返回。

你可以在一个查询中使用多个 `COLUMNS` 表达式并对其应用函数。

例如：

``` sql
SELECT COLUMNS('a'), COLUMNS('c'), toTypeName(COLUMNS('c')) FROM col_names
```

``` text
┌─aa─┬─ab─┬─bc─┬─toTypeName(bc)─┐
│  1 │  1 │  1 │ Int8           │
└────┴────┴────┴────────────────┘
```

由 `COLUMNS` 表达式返回的每个列都作为单独的参数传递给函数。如果函数支持其他参数，你也可以将其他参数传递给它。在使用函数时要小心。如果函数不支持你传递的参数数量，ClickHouse 将抛出异常。

例如：

``` sql
SELECT COLUMNS('a') + COLUMNS('c') FROM col_names
```

``` text
Received exception from server (version 19.14.1):
Code: 42. DB::Exception: Received from localhost:9000. DB::Exception: Number of arguments for function plus does not match: passed 3, should be 2.
```

在这个例子中，`COLUMNS('a')` 返回两列：`aa` 和 `ab`。`COLUMNS('c')` 返回 `bc` 列。`+` 运算符无法作用于 3 个参数，因此 ClickHouse 抛出带有相关消息的异常。

匹配 `COLUMNS` 表达式的列可以具有不同的数据类型。如果 `COLUMNS` 没有匹配任何列并且是 `SELECT` 中唯一的表达式，ClickHouse 将抛出异常。

### 星号 {#asterisk}

你可以在查询的任何部分使用星号替代表达式。当查询被分析时，星号会扩展为所有表列的列表（不包括 `MATERIALIZED` 和 `ALIAS` 列）。使用星号的情况非常有限：

- 当创建表转储时。
- 对于只包含少量列的表，例如系统表。
- 获取某个表中所有列的信息。在这种情况下，设置 `LIMIT 1`。但最好使用 `DESC TABLE` 查询。
- 当对少量列有强过滤使用 `PREWHERE`。
- 在子查询中（因外部查询不需要的列在子查询中将被排除）。

在其他情况下，我们不建议使用星号，因为它只会给你带来列式数据库管理系统的缺点，而不是优点。换句话说，不建议使用星号。

### 极值 {#extreme-values}

除了结果外，你还可以获取结果列的最小值和最大值。为此，将 **extremes** 设置为 1。最小值和最大值是针对数值类型、日期和时间日期计算的。对于其他列，输出默认值。

计算额外的两行 - 分别是最小值和最大值。这额外的两行以 `XML`、`JSON*`、`TabSeparated*`、`CSV*`、`Vertical`、`Template` 和 `Pretty*` [格式](../../../interfaces/formats.md) 输出，和其他行分开。对于其他格式，它们不会输出。

在 `JSON*` 和 `XML` 格式中，极值以单独的 'extremes' 字段输出。在 `TabSeparated*`、`CSV*` 和 `Vertical` 格式中，该行在主结果之后输出，在 'totals' 之后（如果存在）。在其他数据之后之前有一行空行。在 `Pretty*` 格式中，该行在主结果后以单独表的形式输出，在 `totals` 之后（如果存在）。在 `Template` 格式中，极值根据指定模板输出。

极值是在 `LIMIT` 之前计算的，但在 `LIMIT BY` 之后。然而，在使用 `LIMIT offset, size` 时，`offset` 之前的行包含在 `extremes` 中。在流请求中，结果还可能包含通过 `LIMIT` 的少量行。

### 注意事项 {#notes}

你可以在查询的任何部分使用同义词（`AS` 别名）。

`GROUP BY`、`ORDER BY` 和 `LIMIT BY` 子句可以支持位置参数。要启用此功能，请打开 [enable_positional_arguments](/operations/settings/settings#enable_positional_arguments) 设置。然后，例如，`ORDER BY 1,2` 将按表的第一列和第二列排序行。

## 实现细节 {#implementation-details}

如果查询省略了 `DISTINCT`、`GROUP BY` 和 `ORDER BY` 子句以及 `IN` 和 `JOIN` 子查询，则查询将完全流式处理，使用 O(1) 的 RAM。否则，如果没有指定适当的限制，查询可能会消耗大量的 RAM：

- `max_memory_usage`
- `max_rows_to_group_by`
- `max_rows_to_sort`
- `max_rows_in_distinct`
- `max_bytes_in_distinct`
- `max_rows_in_set`
- `max_bytes_in_set`
- `max_rows_in_join`
- `max_bytes_in_join`
- `max_bytes_before_external_sort`
- `max_bytes_ratio_before_external_sort`
- `max_bytes_before_external_group_by`
- `max_bytes_ratio_before_external_group_by`

有关更多信息，请参见“设置”部分。可以使用外部排序（将临时表保存到磁盘）和外部聚合。

## SELECT 修饰符 {#select-modifiers}

你可以在 `SELECT` 查询中使用以下修饰符。

### APPLY {#apply}

允许你为查询外部表表达式返回的每一行调用某个函数。

**语法：**

```sql
SELECT <expr> APPLY( <func> ) FROM [db.]table_name
```

**示例：**

```sql
CREATE TABLE columns_transformers (i Int64, j Int16, k Int64) ENGINE = MergeTree ORDER by (i);
INSERT INTO columns_transformers VALUES (100, 10, 324), (120, 8, 23);
SELECT * APPLY(sum) FROM columns_transformers;
```

```response
┌─sum(i)─┬─sum(j)─┬─sum(k)─┐
│    220 │     18 │    347 │
└────────┴────────┴────────┘
```

### EXCEPT {#except}

指定一个或多个要从结果中排除的列名。所有匹配的列名都不会出现在输出中。

**语法：**

``` sql
SELECT <expr> EXCEPT ( col_name1 [, col_name2, col_name3, ...] ) FROM [db.]table_name
```

**示例：**

```sql
SELECT * EXCEPT (i) from columns_transformers;
```

```response
┌──j─┬───k─┐
│ 10 │ 324 │
│  8 │  23 │
└────┴─────┘
```

### REPLACE {#replace}

指定一个或多个 [表达式别名](/sql-reference/syntax#expression-aliases)。每个别名必须与 `SELECT *` 语句中的某个列名匹配。在输出列列表中，匹配别名的列将被该 `REPLACE` 中的表达式替换。

此修饰符不会改变列的名称或顺序。然而，它可以改变值和类型。

**语法：**

``` sql
SELECT <expr> REPLACE( <expr> AS col_name) from [db.]table_name
```

**示例：**

```sql
SELECT * REPLACE(i + 1 AS i) from columns_transformers;
```

```response
┌───i─┬──j─┬───k─┐
│ 101 │ 10 │ 324 │
│ 121 │  8 │  23 │
└─────┴────┴─────┘
```

### 修饰符组合 {#modifier-combinations}

你可以分别使用每个修饰符，也可以将它们组合在一起。

**示例：**

多次使用相同的修饰符。

```sql
SELECT COLUMNS('[jk]') APPLY(toString) APPLY(length) APPLY(max) from columns_transformers;
```

```response
┌─max(length(toString(j)))─┬─max(length(toString(k)))─┐
│                        2 │                        3 │
└──────────────────────────┴──────────────────────────┘
```

在单个查询中使用多个修饰符。

```sql
SELECT * REPLACE(i + 1 AS i) EXCEPT (j) APPLY(sum) from columns_transformers;
```

```response
┌─sum(plus(i, 1))─┬─sum(k)─┐
│             222 │    347 │
└─────────────────┴────────┘
```

## SELECT 查询中的 SETTINGS {#settings-in-select-query}

你可以在 `SELECT` 查询中直接指定所需的设置。设置值仅适用于此查询，并在查询执行后重置为默认或先前的值。

有关其他设置方式，请参见 [这里](/operations/settings/overview)。

**示例**

```sql
SELECT * FROM some_table SETTINGS optimize_read_in_order=1, cast_keep_nullable=1;
```
