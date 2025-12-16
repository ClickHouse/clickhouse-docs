---
description: 'JOIN 子句说明文档'
sidebar_label: 'JOIN'
slug: /sql-reference/statements/select/join
title: 'JOIN 子句'
keywords: ['INNER JOIN', 'LEFT JOIN', 'LEFT OUTER JOIN', 'RIGHT JOIN', 'RIGHT OUTER JOIN', 'FULL OUTER JOIN', 'CROSS JOIN', 'LEFT SEMI JOIN', 'RIGHT SEMI JOIN', 'LEFT ANTI JOIN', 'RIGHT ANTI JOIN', 'LEFT ANY JOIN', 'RIGHT ANY JOIN', 'INNER ANY JOIN', 'ASOF JOIN', 'LEFT ASOF JOIN', 'PASTE JOIN']
doc_type: 'reference'
---

# JOIN 子句 {#join-clause}

`JOIN` 子句通过使用一个或多个表中共有的值，将这些表的列组合在一起生成一个新表。它是支持 SQL 的数据库中常见的操作，对应于[关系代数](https://en.wikipedia.org/wiki/Relational_algebra#Joins_and_join-like_operators)中的连接（join）。对单个表自身进行连接的特殊情况通常被称为“自连接”（self-join）。

**语法**

```sql
SELECT <expr_list>
FROM <left_table>
[GLOBAL] [INNER|LEFT|RIGHT|FULL|CROSS] [OUTER|SEMI|ANTI|ANY|ALL|ASOF] JOIN <right_table>
(ON <expr_list>)|(USING <column_list>) ...
```

`ON` 子句中的表达式和 `USING` 子句中的列称为“连接键”（join keys）。除非另有说明，`JOIN` 会从具有匹配“连接键”的行生成[笛卡尔积](https://en.wikipedia.org/wiki/Cartesian_product)，这可能会产生比源表多得多的结果行。

## 支持的 JOIN 类型 {#supported-types-of-join}

支持所有标准的 [SQL JOIN](https://en.wikipedia.org/wiki/Join_(SQL)) 类型：

| Type              | Description                                                                   |
|-------------------|-------------------------------------------------------------------------------|
| `INNER JOIN`      | 仅返回匹配的行。                                                              |
| `LEFT OUTER JOIN` | 在返回匹配行的基础上，额外返回左表中未匹配的行。                              |
| `RIGHT OUTER JOIN`| 在返回匹配行的基础上，额外返回右表中未匹配的行。                              |
| `FULL OUTER JOIN` | 在返回匹配行的基础上，额外返回两个表中未匹配的行。                            |
| `CROSS JOIN`      | 生成整个表的笛卡尔积，不指定 “join keys”。                                    |

- 未显式指定类型的 `JOIN` 等价于 `INNER`。
- 关键字 `OUTER` 可以安全省略。
- `CROSS JOIN` 的另一种语法是在 [`FROM` 子句](../../../sql-reference/statements/select/from.md) 中使用逗号分隔指定多个表。

ClickHouse 还提供了额外的 join 类型：

| Type                                        | Description                                                                                                                               |
|---------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------|
| `LEFT SEMI JOIN`, `RIGHT SEMI JOIN`         | 基于 “join keys” 的允许列表（allowlist），不会生成笛卡尔积。                                                                               |
| `LEFT ANTI JOIN`, `RIGHT ANTI JOIN`         | 基于 “join keys” 的拒绝列表（denylist），不会生成笛卡尔积。                                                                               |
| `LEFT ANY JOIN`, `RIGHT ANY JOIN`, `INNER ANY JOIN` | 部分地（对于 `LEFT` 和 `RIGHT` 的另一侧）或完全地（对于 `INNER` 和 `FULL`）禁用标准 `JOIN` 类型中的笛卡尔积。                               |
| `ASOF JOIN`, `LEFT ASOF JOIN`               | 以非精确匹配的方式连接序列。`ASOF JOIN` 的用法将在下文介绍。                                                                                |
| `PASTE JOIN`                                | 对两个表执行水平方向的拼接。                                                                                                             |

:::note
当 [join_algorithm](../../../operations/settings/settings.md#join_algorithm) 设置为 `partial_merge` 时，仅在严格性为 `ALL` 时才支持 `RIGHT JOIN` 和 `FULL JOIN`（不支持 `SEMI`、`ANTI`、`ANY` 和 `ASOF`）。
:::

## 设置 {#settings}

可以使用 [`join_default_strictness`](../../../operations/settings/settings.md#join_default_strictness) 设置来覆盖默认的 JOIN 类型。

ClickHouse 服务器在执行 `ANY JOIN` 操作时的行为取决于 [`any_join_distinct_right_table_keys`](../../../operations/settings/settings.md#any_join_distinct_right_table_keys) 设置。

**另请参阅**

- [`join_algorithm`](../../../operations/settings/settings.md#join_algorithm)
- [`join_any_take_last_row`](../../../operations/settings/settings.md#join_any_take_last_row)
- [`join_use_nulls`](../../../operations/settings/settings.md#join_use_nulls)
- [`partial_merge_join_rows_in_right_blocks`](../../../operations/settings/settings.md#partial_merge_join_rows_in_right_blocks)
- [`join_on_disk_max_files_to_merge`](../../../operations/settings/settings.md#join_on_disk_max_files_to_merge)
- [`any_join_distinct_right_table_keys`](../../../operations/settings/settings.md#any_join_distinct_right_table_keys)

使用 `cross_to_inner_join_rewrite` 设置来定义当 ClickHouse 无法将 `CROSS JOIN` 重写为 `INNER JOIN` 时的行为。默认值为 `1`，此时允许 JOIN 继续执行，但会更慢。如果希望抛出错误，请将 `cross_to_inner_join_rewrite` 设为 `0`；若希望不执行 CROSS JOIN，而是强制重写所有逗号/CROSS JOIN，请将其设为 `2`。如果在值为 `2` 时重写失败，您将收到一条错误消息：“Please, try to simplify `WHERE` section”。

## ON 部分中的条件 {#on-section-conditions}

`ON` 部分可以包含多个条件，这些条件通过 `AND` 和 `OR` 运算符组合。指定连接键的条件必须：

* 同时引用左表和右表
* 使用等号运算符

其他条件可以使用其他逻辑运算符，但它们必须引用查询中的左表或右表之一。

只有当整个复杂条件满足时，行才会被连接。如果条件不满足，行是否仍会包含在结果中取决于 `JOIN` 类型。注意，如果将相同的条件放在 `WHERE` 部分且条件不满足，那么这些行将始终从结果中过滤掉。

`ON` 子句中的 `OR` 运算符基于哈希连接算法工作——对于每个带有 `JOIN` 连接键的 `OR` 分支，都会创建一个单独的哈希表，因此随着 `ON` 子句中 `OR` 表达式数量的增加，内存消耗和查询执行时间会线性增长。

:::note
如果一个条件引用了来自不同表的列，那么目前仅支持等号运算符（`=`）。
:::

**示例**

考虑 `table_1` 和 `table_2`：

```response
┌─Id─┬─name─┐     ┌─Id─┬─text───────────┬─scores─┐
│  1 │ A    │     │  1 │ Text A         │     10 │
│  2 │ B    │     │  1 │ Another text A │     12 │
│  3 │ C    │     │  2 │ Text B         │     15 │
└────┴──────┘     └────┴────────────────┴────────┘
```

包含一个连接键条件以及针对 `table_2` 的附加条件的查询：

```sql
SELECT name, text FROM table_1 LEFT OUTER JOIN table_2
    ON table_1.Id = table_2.Id AND startsWith(table_2.text, 'Text');
```

请注意，结果中包含名称为 `C` 且文本列为空的那一行。之所以会出现在结果中，是因为使用了 `OUTER` 类型的联接。

```response
┌─name─┬─text───┐
│ A    │ Text A │
│ B    │ Text B │
│ C    │        │
└──────┴────────┘
```

使用 `INNER` 连接类型且包含多个条件的查询：

```sql
SELECT name, text, scores FROM table_1 INNER JOIN table_2
    ON table_1.Id = table_2.Id AND table_2.scores > 10 AND startsWith(table_2.text, 'Text');
```

结果：

```sql
┌─name─┬─text───┬─scores─┐
│ B    │ Text B │     15 │
└──────┴────────┴────────┘
```

使用 `INNER` 连接类型且条件中包含 `OR` 的查询：

```sql
CREATE TABLE t1 (`a` Int64, `b` Int64) ENGINE = MergeTree() ORDER BY a;

CREATE TABLE t2 (`key` Int32, `val` Int64) ENGINE = MergeTree() ORDER BY key;

INSERT INTO t1 SELECT number as a, -a as b from numbers(5);

INSERT INTO t2 SELECT if(number % 2 == 0, toInt64(number), -number) as key, number as val from numbers(5);

SELECT a, b, val FROM t1 INNER JOIN t2 ON t1.a = t2.key OR t1.b = t2.key;
```

结果：

```response
┌─a─┬──b─┬─val─┐
│ 0 │  0 │   0 │
│ 1 │ -1 │   1 │
│ 2 │ -2 │   2 │
│ 3 │ -3 │   3 │
│ 4 │ -4 │   4 │
└───┴────┴─────┘
```

使用 `INNER` 类型 JOIN，且包含 `OR` 和 `AND` 条件的查询：

:::note

默认情况下，支持非等号条件，只要这些条件中使用的列都来自同一张表。
例如，`t1.a = t2.key AND t1.b > 0 AND t2.b > t2.c`，因为 `t1.b > 0` 只使用了 `t1` 的列，而 `t2.b > t2.c` 只使用了 `t2` 的列。
不过，你也可以尝试对类似 `t1.a = t2.key AND t1.b > t2.key` 这种条件的实验性支持，更多细节请参阅下方章节。

:::

```sql
SELECT a, b, val FROM t1 INNER JOIN t2 ON t1.a = t2.key OR t1.b = t2.key AND t2.val > 3;
```

结果：

```response
┌─a─┬──b─┬─val─┐
│ 0 │  0 │   0 │
│ 2 │ -2 │   2 │
│ 4 │ -4 │   4 │
└───┴────┴─────┘
```

## 针对来自不同表的列使用非等值条件的 JOIN {#join-with-inequality-conditions-for-columns-from-different-tables}

ClickHouse 目前除等值条件外，还支持在 `ALL/ANY/SEMI/ANTI INNER/LEFT/RIGHT/FULL JOIN` 中使用非等值条件。非等值条件仅在 `hash` 和 `grace_hash` join 算法中受支持。使用 `join_use_nulls` 时不支持非等值条件。

**示例**

表 `t1`：

```response
┌─key──┬─attr─┬─a─┬─b─┬─c─┐
│ key1 │ a    │ 1 │ 1 │ 2 │
│ key1 │ b    │ 2 │ 3 │ 2 │
│ key1 │ c    │ 3 │ 2 │ 1 │
│ key1 │ d    │ 4 │ 7 │ 2 │
│ key1 │ e    │ 5 │ 5 │ 5 │
│ key2 │ a2   │ 1 │ 1 │ 1 │
│ key4 │ f    │ 2 │ 3 │ 4 │
└──────┴──────┴───┴───┴───┘
```

表 `t2`

```response
┌─key──┬─attr─┬─a─┬─b─┬─c─┐
│ key1 │ A    │ 1 │ 2 │ 1 │
│ key1 │ B    │ 2 │ 1 │ 2 │
│ key1 │ C    │ 3 │ 4 │ 5 │
│ key1 │ D    │ 4 │ 1 │ 6 │
│ key3 │ a3   │ 1 │ 1 │ 1 │
│ key4 │ F    │ 1 │ 1 │ 1 │
└──────┴──────┴───┴───┴───┘
```

```sql
SELECT t1.*, t2.* FROM t1 LEFT JOIN t2 ON t1.key = t2.key AND (t1.a < t2.a) ORDER BY (t1.key, t1.attr, t2.key, t2.attr);
```

```response
key1    a    1    1    2    key1    B    2    1    2
key1    a    1    1    2    key1    C    3    4    5
key1    a    1    1    2    key1    D    4    1    6
key1    b    2    3    2    key1    C    3    4    5
key1    b    2    3    2    key1    D    4    1    6
key1    c    3    2    1    key1    D    4    1    6
key1    d    4    7    2            0    0    \N
key1    e    5    5    5            0    0    \N
key2    a2    1    1    1            0    0    \N
key4    f    2    3    4            0    0    \N
```

## JOIN 键中的 NULL 值 {#null-values-in-join-keys}

`NULL` 不等于任何值，包括它本身。这意味着如果某个表中用作 `JOIN` 键的列值为 `NULL`，它不会与另一张表中同样为 `NULL` 的值相匹配。

**示例**

表 `A`：

```response
┌───id─┬─name────┐
│    1 │ Alice   │
│    2 │ Bob     │
│ ᴺᵁᴸᴸ │ Charlie │
└──────┴─────────┘
```

表 `B`：

```response
┌───id─┬─score─┐
│    1 │    90 │
│    3 │    85 │
│ ᴺᵁᴸᴸ │    88 │
└──────┴───────┘
```

```sql
SELECT A.name, B.score FROM A LEFT JOIN B ON A.id = B.id
```

```response
┌─name────┬─score─┐
│ Alice   │    90 │
│ Bob     │     0 │
│ Charlie │     0 │
└─────────┴───────┘
```

请注意，表 `A` 中包含 `Charlie` 的那一行，以及表 `B` 中分数为 88 的那一行，都没有出现在结果中，这是因为 `JOIN` 键中存在 `NULL` 值。

如果需要匹配 `NULL` 值，请使用 `isNotDistinctFrom` 函数来比较 `JOIN` 键。

```sql
SELECT A.name, B.score FROM A LEFT JOIN B ON isNotDistinctFrom(A.id, B.id)
```

```markdown
┌─name────┬─score─┐
│ Alice   │    90 │
│ Bob     │     0 │
│ Charlie │    88 │
└─────────┴───────┘
```

## ASOF JOIN 用法 {#asof-join-usage}

当你需要联接那些没有精确匹配的记录时，`ASOF JOIN` 非常有用。

这种 JOIN 算法要求表中有一个特殊的列。该列：

* 必须包含一个有序序列。
* 可以是以下类型之一：[Int, UInt](../../../sql-reference/data-types/int-uint.md)、[Float](../../../sql-reference/data-types/float.md)、[Date](../../../sql-reference/data-types/date.md)、[DateTime](../../../sql-reference/data-types/datetime.md)、[Decimal](../../../sql-reference/data-types/decimal.md)。
* 在使用 `hash` JOIN 算法时，它不能是 `JOIN` 子句中唯一的列。

`ASOF JOIN ... ON` 语法：

```sql
SELECT expressions_list
FROM table_1
ASOF LEFT JOIN table_2
ON equi_cond AND closest_match_cond
```

你可以使用任意数量的等值条件，但最多只能使用一个最近匹配条件。例如：`SELECT count() FROM table_1 ASOF LEFT JOIN table_2 ON table_1.a == table_2.b AND table_2.t <= table_1.t`。

最近匹配所支持的条件有：`>`, `>=`, `<`, `<=`。

语法 `ASOF JOIN ... USING`：

```sql
SELECT expressions_list
FROM table_1
ASOF JOIN table_2
USING (equi_column1, ... equi_columnN, asof_column)
```

`ASOF JOIN` 使用 `equi_columnX` 进行等值连接，并使用 `asof_column` 在满足 `table_1.asof_column >= table_2.asof_column` 条件的情况下进行最接近的匹配连接。`asof_column` 列在 `USING` 子句中始终是最后一列。

例如，考虑下列表：

```text
         table_1                           table_2
      event   | ev_time | user_id       event   | ev_time | user_id
    ----------|---------|----------   ----------|---------|----------
                  ...                               ...
    event_1_1 |  12:00  |  42         event_2_1 |  11:59  |   42
                  ...                 event_2_2 |  12:30  |   42
    event_1_2 |  13:00  |  42         event_2_3 |  13:00  |   42
                  ...                               ...
```

`ASOF JOIN` 可以获取 `table_1` 中用户事件的时间戳，并在 `table_2` 中找到时间戳在满足最近匹配条件下最接近 `table_1` 中该事件时间戳的事件。如果存在相等的时间戳值，则优先视为最近匹配。在这里，`user_id` 列可用于等值连接，而 `ev_time` 列可用于按最近匹配进行连接。在我们的示例中，`event_1_1` 可以与 `event_2_1` 连接，`event_1_2` 可以与 `event_2_3` 连接，但 `event_2_2` 无法被连接。

:::note
`ASOF JOIN` 仅在 `hash` 和 `full_sorting_merge` 连接算法中受支持。
在 [Join](../../../engines/table-engines/special/join.md) 表引擎中**不**受支持。
:::

## PASTE JOIN 用法 {#paste-join-usage}

`PASTE JOIN` 的结果是一个表，包含左侧子查询的所有列，后面紧跟右侧子查询的所有列。
行是根据它们在原始表中的位置一一对应匹配的（行的顺序必须是确定的）。
如果子查询返回的行数不同，多出的行会被丢弃。

示例：

```sql
SELECT *
FROM
(
    SELECT number AS a
    FROM numbers(2)
) AS t1
PASTE JOIN
(
    SELECT number AS a
    FROM numbers(2)
    ORDER BY a DESC
) AS t2

┌─a─┬─t2.a─┐
│ 0 │    1 │
│ 1 │    0 │
└───┴──────┘
```

注意：在这种情况下，如果以并行方式进行读取，结果可能是不确定的。例如：

```sql
SELECT *
FROM
(
    SELECT number AS a
    FROM numbers_mt(5)
) AS t1
PASTE JOIN
(
    SELECT number AS a
    FROM numbers(10)
    ORDER BY a DESC
) AS t2
SETTINGS max_block_size = 2;

┌─a─┬─t2.a─┐
│ 2 │    9 │
│ 3 │    8 │
└───┴──────┘
┌─a─┬─t2.a─┐
│ 0 │    7 │
│ 1 │    6 │
└───┴──────┘
┌─a─┬─t2.a─┐
│ 4 │    5 │
└───┴──────┘
```

## 分布式 JOIN {#distributed-join}

在包含分布式表的 JOIN 中，有两种执行方式：

- 使用普通的 `JOIN` 时，查询会被发送到远程服务器。会在每个远程服务器上分别运行子查询来构造右表，然后在该表上执行 JOIN。换句话说，右表会在每个服务器上单独构建。
- 使用 `GLOBAL ... JOIN` 时，请求方服务器首先运行子查询以计算右表。这个临时表会被传递到每个远程服务器，然后在这些服务器上基于传输过来的临时数据执行查询。

在使用 `GLOBAL` 时要小心。更多信息请参见[分布式子查询](/sql-reference/operators/in#distributed-subqueries)一节。

## 隐式类型转换 {#implicit-type-conversion}

`INNER JOIN`、`LEFT JOIN`、`RIGHT JOIN` 和 `FULL JOIN` 查询支持对“连接键”进行隐式类型转换。但是，如果左右表的连接键无法被转换为同一种类型，则查询无法执行（例如，没有任何一种数据类型能够同时容纳来自 `UInt64` 和 `Int64`，或 `String` 和 `Int32` 的所有值）。

**示例**

考虑表 `t_1`：

```response
┌─a─┬─b─┬─toTypeName(a)─┬─toTypeName(b)─┐
│ 1 │ 1 │ UInt16        │ UInt8         │
│ 2 │ 2 │ UInt16        │ UInt8         │
└───┴───┴───────────────┴───────────────┘
```

以及表 `t_2`：

```response
┌──a─┬────b─┬─toTypeName(a)─┬─toTypeName(b)───┐
│ -1 │    1 │ Int16         │ Nullable(Int64) │
│  1 │   -1 │ Int16         │ Nullable(Int64) │
│  1 │    1 │ Int16         │ Nullable(Int64) │
└────┴──────┴───────────────┴─────────────────┘
```

此查询

```sql
SELECT a, b, toTypeName(a), toTypeName(b) FROM t_1 FULL JOIN t_2 USING (a, b);
```

返回以下集合：

```response
┌──a─┬────b─┬─toTypeName(a)─┬─toTypeName(b)───┐
│  1 │    1 │ Int32         │ Nullable(Int64) │
│  2 │    2 │ Int32         │ Nullable(Int64) │
│ -1 │    1 │ Int32         │ Nullable(Int64) │
│  1 │   -1 │ Int32         │ Nullable(Int64) │
└────┴──────┴───────────────┴─────────────────┘
```

## 使用建议 {#usage-recommendations}

### 空单元格或 NULL 单元格的处理 {#processing-of-empty-or-null-cells}

在进行表关联时，可能会出现空单元格。设置 [join_use_nulls](../../../operations/settings/settings.md#join_use_nulls) 定义了 ClickHouse 如何填充这些单元格。

如果 `JOIN` 键列是 [Nullable](../../../sql-reference/data-types/nullable.md) 字段，则至少有一个键的值为 [NULL](/sql-reference/syntax#null) 的行不会被关联。

### 语法 {#syntax}

在 `USING` 中指定的列在两个子查询中必须同名，而其他列必须使用不同的名称。你可以使用别名来更改子查询中列的名称。

`USING` 子句指定一个或多个用于关联的列，表示这些列在两侧需要相等。列列表直接列出，无需括号。不支持更复杂的关联条件。

### 语法限制 {#syntax-limitations}

对于单个 `SELECT` 查询中的多个 `JOIN` 子句：

- 仅当关联的是表而不是子查询时，才能通过 `*` 获取所有列。
- 不支持 `PREWHERE` 子句。
- 不支持 `USING` 子句。

对于 `ON`、`WHERE` 和 `GROUP BY` 子句：

- 不能在 `ON`、`WHERE` 和 `GROUP BY` 子句中使用任意表达式，但你可以在 `SELECT` 子句中定义一个表达式，然后通过别名在这些子句中使用它。

### 性能 {#performance}

在执行 `JOIN` 时，不会根据查询中其他阶段自动优化执行顺序。关联操作（在右表中查找）会在 `WHERE` 过滤和聚合之前执行。

每次运行带有相同 `JOIN` 的查询时，子查询都会再次执行，因为结果不会被缓存。为避免这种情况，请使用特殊的 [Join](../../../engines/table-engines/special/join.md) 表引擎，它是一个预先构建、始终驻留在内存中的关联数组。

在某些情况下，使用 [IN](../../../sql-reference/operators/in.md) 比使用 `JOIN` 更高效。

如果你需要通过 `JOIN` 与维度表进行关联（这些是相对较小的表，包含维度属性，例如广告活动名称），由于每次查询都会重新访问右表，`JOIN` 可能不是很方便。对于这类场景，应使用 “字典（dictionaries）” 功能来替代 `JOIN`。更多信息请参阅 [Dictionaries](../../../sql-reference/dictionaries/index.md) 章节。

### 内存限制 {#memory-limitations}

默认情况下，ClickHouse 使用 [hash join](https://en.wikipedia.org/wiki/Hash_join) 算法。ClickHouse 读取右表（right_table），并在内存中为其创建哈希表。如果启用了 `join_algorithm = 'auto'`，则在内存消耗超过某个阈值后，ClickHouse 会降级为 [merge](https://en.wikipedia.org/wiki/Sort-merge_join) join 算法。关于 `JOIN` 算法的说明参见 [join_algorithm](../../../operations/settings/settings.md#join_algorithm) 设置。

如果你需要限制 `JOIN` 操作的内存消耗，请使用以下设置：

- [max_rows_in_join](/operations/settings/settings#max_rows_in_join) — 限制哈希表中的行数。
- [max_bytes_in_join](/operations/settings/settings#max_bytes_in_join) — 限制哈希表的大小。

当达到上述任一限制时，ClickHouse 会按照 [join_overflow_mode](/operations/settings/settings#join_overflow_mode) 设置中的指示进行处理。

## 示例 {#examples}

示例：

```sql
SELECT
    CounterID,
    hits,
    visits
FROM
(
    SELECT
        CounterID,
        count() AS hits
    FROM test.hits
    GROUP BY CounterID
) ANY LEFT JOIN
(
    SELECT
        CounterID,
        sum(Sign) AS visits
    FROM test.visits
    GROUP BY CounterID
) USING CounterID
ORDER BY hits DESC
LIMIT 10
```

```text
┌─CounterID─┬───hits─┬─visits─┐
│   1143050 │ 523264 │  13665 │
│    731962 │ 475698 │ 102716 │
│    722545 │ 337212 │ 108187 │
│    722889 │ 252197 │  10547 │
│   2237260 │ 196036 │   9522 │
│  23057320 │ 147211 │   7689 │
│    722818 │  90109 │  17847 │
│     48221 │  85379 │   4652 │
│  19762435 │  77807 │   7026 │
│    722884 │  77492 │  11056 │
└───────────┴────────┴────────┘
```

## 相关内容 {#related-content}

- 博客：[ClickHouse：具备完整 SQL JOIN 支持的极速数据库管理系统（DBMS）- 第 1 部分](https://clickhouse.com/blog/clickhouse-fully-supports-joins)
- 博客：[ClickHouse：具备完整 SQL JOIN 支持的极速数据库管理系统（DBMS）- 深入解析 - 第 2 部分](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2)
- 博客：[ClickHouse：具备完整 SQL JOIN 支持的极速数据库管理系统（DBMS）- 深入解析 - 第 3 部分](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3)
- 博客：[ClickHouse：具备完整 SQL JOIN 支持的极速数据库管理系统（DBMS）- 深入解析 - 第 4 部分](https://clickhouse.com/blog/clickhouse-fully-supports-joins-direct-join-part4)
