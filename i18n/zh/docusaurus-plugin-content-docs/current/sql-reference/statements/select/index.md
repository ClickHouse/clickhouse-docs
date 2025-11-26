---
description: 'SELECT 查询语句文档'
sidebar_label: 'SELECT'
sidebar_position: 32
slug: /sql-reference/statements/select/
title: 'SELECT 查询语句'
doc_type: 'reference'
---

# SELECT 查询

`SELECT` 查询用于执行数据检索。默认情况下，查询请求的数据会返回给客户端；配合 [INSERT INTO](../../../sql-reference/statements/insert-into.md) 使用时，可以将其转发到其他表。

## 语法

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
[INTO OUTFILE filename [TRUNCATE] [COMPRESSION type [LEVEL level]] ]
[FORMAT format]
```

除紧随 `SELECT` 之后且必需的表达式列表外，其余子句均为可选，该部分在[下文](#select-clause)中有更详细的说明。

每个可选子句的具体内容在单独的小节中进行说明，列出的顺序与其执行顺序一致：

* [WITH 子句](../../../sql-reference/statements/select/with.md)
* [SELECT 子句](#select-clause)
* [DISTINCT 子句](../../../sql-reference/statements/select/distinct.md)
* [FROM 子句](../../../sql-reference/statements/select/from.md)
* [SAMPLE 子句](../../../sql-reference/statements/select/sample.md)
* [JOIN 子句](../../../sql-reference/statements/select/join.md)
* [PREWHERE 子句](../../../sql-reference/statements/select/prewhere.md)
* [WHERE 子句](../../../sql-reference/statements/select/where.md)
* [WINDOW 子句](../../../sql-reference/window-functions/index.md)
* [GROUP BY 子句](/sql-reference/statements/select/group-by)
* [LIMIT BY 子句](../../../sql-reference/statements/select/limit-by.md)
* [HAVING 子句](../../../sql-reference/statements/select/having.md)
* [QUALIFY 子句](../../../sql-reference/statements/select/qualify.md)
* [LIMIT 子句](../../../sql-reference/statements/select/limit.md)
* [OFFSET 子句](../../../sql-reference/statements/select/offset.md)
* [UNION 子句](../../../sql-reference/statements/select/union.md)
* [INTERSECT 子句](../../../sql-reference/statements/select/intersect.md)
* [EXCEPT 子句](../../../sql-reference/statements/select/except.md)
* [INTO OUTFILE 子句](../../../sql-reference/statements/select/into-outfile.md)
* [FORMAT 子句](../../../sql-reference/statements/select/format.md)


## SELECT 子句 \{#select-clause\}

在 `SELECT` 子句中指定的[表达式](/sql-reference/syntax#expressions)会在前面各子句中描述的所有操作完成之后再进行计算。这些表达式的行为就像是分别应用于结果集中的每一行。如果 `SELECT` 子句中的表达式包含聚合函数，那么在执行 [GROUP BY](/sql-reference/statements/select/group-by) 聚合时，ClickHouse 会处理这些聚合函数以及作为其参数的表达式。

如果您想在结果中包含所有列，请使用星号（`*`）符号。例如：`SELECT * FROM ...`。

### 动态列选择

动态列选择（也称为 COLUMNS 表达式）可以使用 [re2](https://en.wikipedia.org/wiki/RE2_\(software\)) 正则表达式对结果中的部分列进行匹配。

```sql
COLUMNS('regexp')
```

例如，考虑下面这张表：

```sql
CREATE TABLE default.col_names (aa Int8, ab Int8, bc Int8) ENGINE = TinyLog
```

以下查询会从所有列名中包含字母 `a` 的列中选取数据。

```sql
SELECT COLUMNS('a') FROM col_names
```

```text
┌─aa─┬─ab─┐
│  1 │  1 │
└────┴────┘
```

返回的所选列不是按字母顺序排列。

你可以在查询中使用多个 `COLUMNS` 表达式，并对这些列应用函数。

例如：

```sql
SELECT COLUMNS('a'), COLUMNS('c'), toTypeName(COLUMNS('c')) FROM col_names
```

```text
┌─aa─┬─ab─┬─bc─┬─toTypeName(bc)─┐
│  1 │  1 │  1 │ Int8           │
└────┴────┴────┴────────────────┘
```

`COLUMNS` 表达式返回的每一列都会作为单独的参数传递给该函数。如果函数支持的话，你还可以向该函数传递其他参数。使用函数时要小心。如果函数不支持当前传入的参数个数，ClickHouse 会抛出异常。

例如：

```sql
SELECT COLUMNS('a') + COLUMNS('c') FROM col_names
```

```text
服务器返回异常(版本 19.14.1):
代码: 42. DB::Exception: 来自 localhost:9000。DB::Exception: 函数 plus 的参数数量不匹配:传入 3 个参数,应为 2 个。
```

在这个示例中，`COLUMNS('a')` 返回两列：`aa` 和 `ab`。`COLUMNS('c')` 返回列 `bc`。`+` 运算符不能应用于 3 个参数，因此 ClickHouse 会抛出带有相应错误信息的异常。

与 `COLUMNS` 表达式匹配的列可以具有不同的数据类型。如果 `COLUMNS` 未匹配到任何列，并且它是 `SELECT` 中唯一的表达式，ClickHouse 会抛出异常。


### 星号 \{#asterisk\}

在查询的任何部分，可以使用星号代替表达式。查询在被分析时，星号会被展开为该表的所有列（不包括 `MATERIALIZED` 和 `ALIAS` 列）。只有在少数几种情况下，使用星号才是合理的：

- 创建表数据转储时。
- 对仅包含少量列的表（例如系统表）。
- 需要了解表中包含哪些列时。在这种情况下，应设置 `LIMIT 1`，但更好的方式是使用 `DESC TABLE` 查询。
- 使用 `PREWHERE` 对少量列进行高度选择性过滤时。
- 在子查询中（因为子查询中不参与外层查询的列会被排除）。

在所有其他情况下，不建议使用星号，因为这只会让你承受列式数据库的劣势，而无法获得其优势。换言之，一般不推荐使用星号。

### 极值 \{#extreme-values\}

除了结果之外，你还可以获取结果列的最小值和最大值。为此，将 **extremes** 设置为 1。最小值和最大值会为数值类型、日期以及带时间的日期计算。对于其他列，会输出默认值。

会额外计算两行——分别是最小值和最大值。这两行额外数据会在 `XML`、`JSON*`、`TabSeparated*`、`CSV*`、`Vertical`、`Template` 和 `Pretty*` [格式](../../../interfaces/formats.md) 中与其他行分开输出。对于其他格式则不会输出。

在 `JSON*` 和 `XML` 格式中，极值会输出在单独的 `extremes` 字段中。在 `TabSeparated*`、`CSV*` 和 `Vertical` 格式中，这些行会位于主结果之后，如果存在 `totals`，则位于其后。在这之前会有一个空行（在其他数据之后）。在 `Pretty*` 格式中，这些行作为单独的表格输出在主结果之后，如果存在 `totals`，则位于其后。在 `Template` 格式中，极值会根据指定的模板进行输出。

极值是基于应用 `LIMIT` 之前、但在应用 `LIMIT BY` 之后得到的行计算的。不过，当使用 `LIMIT offset, size` 时，`offset` 之前的行也会包含在 `extremes` 中。在流式请求中，结果还可能额外包含少量通过 `LIMIT` 的行。

### 注意事项 \{#notes\}

你可以在查询的任意部分使用别名（`AS`）。

`GROUP BY`、`ORDER BY` 和 `LIMIT BY` 子句可以支持位置参数。要启用此功能，请在设置中启用 [enable_positional_arguments](/operations/settings/settings#enable_positional_arguments)。然后，例如，`ORDER BY 1,2` 将按照表中的第一列、然后第二列对行进行排序。

## 实现细节 \{#implementation-details\}

如果查询省略了 `DISTINCT`、`GROUP BY` 和 `ORDER BY` 子句以及 `IN` 和 `JOIN` 子查询，则查询将以完全流式方式处理，只使用 O(1) 级别的 RAM。否则，如果未指定合适的限制参数，查询可能会消耗大量 RAM：

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

有关更多信息，请参阅 “Settings” 部分。可以使用外部排序（将临时表保存到磁盘）和外部聚合。

## SELECT 修饰符 \{#select-modifiers\}

可以在 `SELECT` 查询中使用以下修饰符。

| Modifier                            | Description                                                                                                                                                                                                                                                                                                                                                                              |
|-------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [`APPLY`](./apply_modifier.md)     | 允许对查询外层表表达式返回的每一行调用某个函数。                                                                                                                                                                                                                                                                                        |
| [`EXCEPT`](./except_modifier.md)   | 指定要从结果中排除的一个或多个列名。所有匹配的列名都会从输出中省略。                                                                                                                                                                                                                                                            |
| [`REPLACE`](./replace_modifier.md) | 指定一个或多个[表达式别名](/sql-reference/syntax#expression-aliases)。每个别名必须与 `SELECT *` 语句中的某个列名匹配。在输出的列列表中，与该别名匹配的列会被该 `REPLACE` 中的表达式替换。此修饰符不会更改列的名称或顺序，但可以更改列的值及其类型。 |

### 修饰符组合

你可以单独使用每个修饰符，也可以将多个修饰符组合起来使用。

**示例：**

多次使用同一个修饰符。

```sql
SELECT COLUMNS('[jk]') APPLY(toString) APPLY(length) APPLY(max) FROM columns_transformers;
```

```response
┌─max(length(toString(j)))─┬─max(length(toString(k)))─┐
│                        2 │                        3 │
└──────────────────────────┴──────────────────────────┘
```

在单个查询中同时使用多个修饰符。

```sql
SELECT * REPLACE(i + 1 AS i) EXCEPT (j) APPLY(sum) from columns_transformers;
```

```response
┌─sum(plus(i, 1))─┬─sum(k)─┐
│             222 │    347 │
└─────────────────┴────────┘
```


## 在 SELECT 查询中使用 SETTINGS

您可以在 `SELECT` 查询中直接指定所需的设置。该设置值仅对本次查询生效，查询执行完成后将被重置为默认值或先前的值。

其他设置方式见[此处](/operations/settings/overview)。

对于值为 true 的布尔类型设置项，可以通过省略赋值来使用简写语法。当只指定设置名称时，它会自动被设为 `1`（true）。

**示例**

```sql
SELECT * FROM some_table SETTINGS optimize_read_in_order=1, cast_keep_nullable=1;
```
