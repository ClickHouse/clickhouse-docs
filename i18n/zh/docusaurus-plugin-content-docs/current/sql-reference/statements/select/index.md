---
description: 'SELECT 查询语句文档'
sidebar_label: 'SELECT'
sidebar_position: 32
slug: /sql-reference/statements/select/
title: 'SELECT 查询语句'
doc_type: 'reference'
---

# SELECT 查询 {#select-query}

`SELECT` 查询用于执行数据检索。默认情况下，请求的数据会返回给客户端，而与 [INSERT INTO](../../../sql-reference/statements/insert-into.md) 结合使用时，可以将其转发到另一张表中。

## 语法 {#syntax}

```sql
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

除了紧跟在 `SELECT` 之后的必需表达式列表(详见[下文](#select-clause))之外,所有子句均为可选。

每个可选子句的具体说明在单独的章节中介绍,这些章节按执行顺序列出:

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

`SELECT` 子句中指定的[表达式](/sql-reference/syntax#expressions)会在上述所有子句的操作完成后进行计算。这些表达式的作用相当于应用于结果中的各个独立行。如果 `SELECT` 子句中的表达式包含聚合函数,ClickHouse 会在 [GROUP BY](/sql-reference/statements/select/group-by) 聚合过程中处理聚合函数及其参数中使用的表达式。

如果要在结果中包含所有列,请使用星号 (`*`) 符号。例如:`SELECT * FROM ...`。

### 动态列选择 {#dynamic-column-selection}

动态列选择(也称为 COLUMNS 表达式)允许您使用 [re2](<https://en.wikipedia.org/wiki/RE2_(software)>) 正则表达式匹配结果中的某些列。

```sql
COLUMNS('regexp')
```

例如,考虑以下表:

```sql
CREATE TABLE default.col_names (aa Int8, ab Int8, bc Int8) ENGINE = TinyLog
```

以下查询从名称中包含 `a` 字符的所有列中选择数据。

```sql
SELECT COLUMNS('a') FROM col_names
```

```text
┌─aa─┬─ab─┐
│  1 │  1 │
└────┴────┘
```

选定的列不按字母顺序返回。

您可以在查询中使用多个 `COLUMNS` 表达式并对它们应用函数。

例如:

```sql
SELECT COLUMNS('a'), COLUMNS('c'), toTypeName(COLUMNS('c')) FROM col_names
```

```text
┌─aa─┬─ab─┬─bc─┬─toTypeName(bc)─┐
│  1 │  1 │  1 │ Int8           │
└────┴────┴────┴────────────────┘
```

`COLUMNS` 表达式返回的每一列都作为单独的参数传递给函数。如果函数支持,您还可以向函数传递其他参数。使用函数时要小心。如果函数不支持您传递的参数数量,ClickHouse 会抛出异常。

例如:

```sql
SELECT COLUMNS('a') + COLUMNS('c') FROM col_names
```

```text
Received exception from server (version 19.14.1):
Code: 42. DB::Exception: Received from localhost:9000. DB::Exception: Number of arguments for function plus does not match: passed 3, should be 2.
```

在此示例中,`COLUMNS('a')` 返回两列:`aa` 和 `ab`。`COLUMNS('c')` 返回 `bc` 列。`+` 运算符无法应用于 3 个参数,因此 ClickHouse 会抛出带有相关消息的异常。

与 `COLUMNS` 表达式匹配的列可以具有不同的数据类型。如果 `COLUMNS` 不匹配任何列且是 `SELECT` 中的唯一表达式,ClickHouse 会抛出异常。

### 星号 {#asterisk}

您可以在查询的任何部分使用星号来代替表达式。当分析查询时,星号会扩展为所有表列的列表(不包括 `MATERIALIZED` 和 `ALIAS` 列)。只有少数情况下使用星号是合理的:

- 创建表转储时。
- 对于仅包含少数列的表,例如系统表。
- 获取表中列信息时。在这种情况下,设置 `LIMIT 1`。但最好使用 `DESC TABLE` 查询。
- 使用 `PREWHERE` 对少量列进行强过滤时。
- 在子查询中(因为外部查询不需要的列会从子查询中排除)。

在所有其他情况下,我们不建议使用星号,因为它只会给您带来列式数据库管理系统的缺点而非优点。换句话说,不建议使用星号。

### 极值 {#extreme-values}

除了结果之外,您还可以获取结果列的最小值和最大值。为此,请将 **extremes** 设置设为 1。最小值和最大值会针对数值类型、日期和带时间的日期进行计算。对于其他列,输出默认值。


会额外计算两行数据——分别是最小值和最大值。这两行额外数据会在 `XML`、`JSON*`、`TabSeparated*`、`CSV*`、`Vertical`、`Template` 和 `Pretty*` [格式](../../../interfaces/formats.md)中输出,与其他行分开显示。其他格式不会输出这些数据。

在 `JSON*` 和 `XML` 格式中,极值会在单独的 'extremes' 字段中输出。在 `TabSeparated*`、`CSV*` 和 `Vertical` 格式中,该行位于主结果之后,如果存在 'totals' 则位于 'totals' 之后。该行前面会有一个空行(位于其他数据之后)。在 `Pretty*` 格式中,该行会作为单独的表格输出在主结果之后,如果存在 `totals` 则位于 `totals` 之后。在 `Template` 格式中,极值会根据指定的模板输出。

极值是针对 `LIMIT` 之前但 `LIMIT BY` 之后的行计算的。但是,当使用 `LIMIT offset, size` 时,`offset` 之前的行会包含在 `extremes` 中。在流式请求中,结果还可能包含少量已通过 `LIMIT` 的行。

### 注意事项 {#notes}

您可以在查询的任何部分使用同义词(`AS` 别名)。

`GROUP BY`、`ORDER BY` 和 `LIMIT BY` 子句支持位置参数。要启用此功能,请开启 [enable_positional_arguments](/operations/settings/settings#enable_positional_arguments) 设置。例如,`ORDER BY 1,2` 将按表中的第一列和第二列对行进行排序。

## 实现细节 {#implementation-details}

如果查询中省略了 `DISTINCT`、`GROUP BY` 和 `ORDER BY` 子句,以及 `IN` 和 `JOIN` 子查询,则查询将完全采用流式处理,仅使用 O(1) 级别的 RAM。否则,如果未指定适当的限制条件,查询可能会消耗大量 RAM:

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

更多信息请参阅"设置"章节。可以使用外部排序(将临时表保存到磁盘)和外部聚合。

## SELECT 修饰符 {#select-modifiers}

您可以在 `SELECT` 查询中使用以下修饰符。

| 修饰符                           | 描述                                                                                                                                                                                                                                                                                                                                                                              |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`APPLY`](./apply_modifier.md)     | 允许您对查询的外部表表达式返回的每一行调用指定函数。                                                                                                                                                                                                                                                                                        |
| [`EXCEPT`](./except_modifier.md)   | 指定要从结果中排除的一个或多个列名。所有匹配的列名都将从输出中省略。                                                                                                                                                                                                                                                                            |
| [`REPLACE`](./replace_modifier.md) | 指定一个或多个[表达式别名](/sql-reference/syntax#expression-aliases)。每个别名必须与 `SELECT *` 语句中的列名匹配。在输出列列表中,与别名匹配的列将被 `REPLACE` 中的表达式替换。此修饰符不会更改列的名称或顺序,但可以更改列的值和值类型。 |

### 修饰符组合 {#modifier-combinations}

您可以单独使用每个修饰符,也可以将它们组合使用。

**示例:**

多次使用同一修饰符。

```sql
SELECT COLUMNS('[jk]') APPLY(toString) APPLY(length) APPLY(max) FROM columns_transformers;
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

您可以直接在 `SELECT` 查询中指定所需的设置。设置值仅应用于此查询,并在查询执行后重置为默认值或之前的值。

其他设置方式请参见[此处](/operations/settings/overview)。

对于布尔类型的设置,当需要设置为 true 时,您可以省略值赋值使用简写语法。当仅指定设置名称时,它会自动设置为 `1`(true)。

**示例**

```sql
SELECT * FROM some_table SETTINGS optimize_read_in_order=1, cast_keep_nullable=1;
```
