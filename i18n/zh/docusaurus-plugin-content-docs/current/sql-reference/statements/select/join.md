---
description: 'JOIN 子句文档'
sidebar_label: 'JOIN'
slug: /sql-reference/statements/select/join
title: 'JOIN 子句'
keywords: ['INNER JOIN', 'LEFT JOIN', 'LEFT OUTER JOIN', 'RIGHT JOIN', 'RIGHT OUTER JOIN', 'FULL OUTER JOIN', 'CROSS JOIN', 'LEFT SEMI JOIN', 'RIGHT SEMI JOIN', 'LEFT ANTI JOIN', 'RIGHT ANTI JOIN', 'LEFT ANY JOIN', 'RIGHT ANY JOIN', 'INNER ANY JOIN', 'ASOF JOIN', 'LEFT ASOF JOIN', 'PASTE JOIN']
doc_type: 'reference'
---



# JOIN 子句

`JOIN` 子句通过使用各个表中共有的值，将一个或多个表的列组合在一起，从而生成一张新表。它是在支持 SQL 的数据库中一种常见的操作，对应于[关系代数](https://en.wikipedia.org/wiki/Relational_algebra#Joins_and_join-like_operators)中的连接（join）运算。对同一张表进行连接的特殊情况通常称为“自连接”（self-join）。

**语法**

```sql
SELECT <表达式列表>
FROM <左表>
[GLOBAL] [INNER|LEFT|RIGHT|FULL|CROSS] [OUTER|SEMI|ANTI|ANY|ALL|ASOF] JOIN <右表>
(ON <表达式列表>)|(USING <字段列表>) ...
```

`ON` 子句中的表达式和 `USING` 子句中的列被称为“连接键”（join keys）。除非另有说明，`JOIN` 会对具有相同“连接键”的行生成[笛卡尔积](https://en.wikipedia.org/wiki/Cartesian_product)，这可能会产生比源表多得多的结果行。


## 支持的 JOIN 类型 {#supported-types-of-join}

支持所有标准的 [SQL JOIN](<https://en.wikipedia.org/wiki/Join_(SQL)>) 类型:

| 类型               | 描述                                                                    |
| ------------------ | ------------------------------------------------------------------------------ |
| `INNER JOIN`       | 仅返回匹配的行。                                               |
| `LEFT OUTER JOIN`  | 除匹配的行外,还返回左表中不匹配的行。   |
| `RIGHT OUTER JOIN` | 除匹配的行外,还返回右表中不匹配的行。  |
| `FULL OUTER JOIN`  | 除匹配的行外,还返回两个表中不匹配的行。  |
| `CROSS JOIN`       | 生成整个表的笛卡尔积,**不**指定"连接键"。 |

- 未指定类型的 `JOIN` 默认为 `INNER`。
- 关键字 `OUTER` 可以安全地省略。
- `CROSS JOIN` 的另一种语法是在 [`FROM` 子句](../../../sql-reference/statements/select/from.md) 中用逗号分隔多个表。

ClickHouse 中可用的其他连接类型包括:

| 类型                                                | 描述                                                                                                                                          |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `LEFT SEMI JOIN`, `RIGHT SEMI JOIN`                 | 基于"连接键"的白名单,不生成笛卡尔积。                                                                                  |
| `LEFT ANTI JOIN`, `RIGHT ANTI JOIN`                 | 基于"连接键"的黑名单,不生成笛卡尔积。                                                                                    |
| `LEFT ANY JOIN`, `RIGHT ANY JOIN`, `INNER ANY JOIN` | 对于标准 `JOIN` 类型,部分禁用(`LEFT` 和 `RIGHT` 的对侧)或完全禁用(`INNER` 和 `FULL`)笛卡尔积。 |
| `ASOF JOIN`, `LEFT ASOF JOIN`                       | 使用非精确匹配连接序列。`ASOF JOIN` 的用法将在下文描述。                                                                      |
| `PASTE JOIN`                                        | 执行两个表的水平拼接。                                                                                                   |

:::note
当 [join_algorithm](../../../operations/settings/settings.md#join_algorithm) 设置为 `partial_merge` 时,`RIGHT JOIN` 和 `FULL JOIN` 仅支持 `ALL` 严格性(不支持 `SEMI`、`ANTI`、`ANY` 和 `ASOF`)。
:::


## 设置 {#settings}

可以使用 [`join_default_strictness`](../../../operations/settings/settings.md#join_default_strictness) 设置覆盖默认的连接类型。

ClickHouse 服务器执行 `ANY JOIN` 操作的行为取决于 [`any_join_distinct_right_table_keys`](../../../operations/settings/settings.md#any_join_distinct_right_table_keys) 设置。

**另请参阅**

- [`join_algorithm`](../../../operations/settings/settings.md#join_algorithm)
- [`join_any_take_last_row`](../../../operations/settings/settings.md#join_any_take_last_row)
- [`join_use_nulls`](../../../operations/settings/settings.md#join_use_nulls)
- [`partial_merge_join_rows_in_right_blocks`](../../../operations/settings/settings.md#partial_merge_join_rows_in_right_blocks)
- [`join_on_disk_max_files_to_merge`](../../../operations/settings/settings.md#join_on_disk_max_files_to_merge)
- [`any_join_distinct_right_table_keys`](../../../operations/settings/settings.md#any_join_distinct_right_table_keys)

使用 `cross_to_inner_join_rewrite` 设置可定义当 ClickHouse 无法将 `CROSS JOIN` 重写为 `INNER JOIN` 时的行为。默认值为 `1`,允许连接继续执行但速度会较慢。如果希望抛出错误,请将 `cross_to_inner_join_rewrite` 设置为 `0`;如果希望不执行交叉连接而是强制重写所有逗号/交叉连接,请将其设置为 `2`。当值为 `2` 时,如果重写失败,您将收到错误消息"Please, try to simplify `WHERE` section"。


## ON 子句条件 {#on-section-conditions}

`ON` 子句可以包含使用 `AND` 和 `OR` 运算符组合的多个条件。指定连接键的条件必须:

- 同时引用左表和右表
- 使用等值运算符

其他条件可以使用其他逻辑运算符,但必须仅引用查询的左表或右表。

当满足整个复合条件时,行会被连接。如果条件不满足,根据 `JOIN` 类型,行仍可能包含在结果中。请注意,如果将相同的条件放在 `WHERE` 子句中且条件不满足,则这些行始终会从结果中被过滤掉。

`ON` 子句中的 `OR` 运算符使用哈希连接算法——对于 `JOIN` 中每个带有连接键的 `OR` 参数,都会创建一个单独的哈希表,因此内存消耗和查询执行时间会随着 `ON` 子句中 `OR` 表达式数量的增加而线性增长。

:::note
如果条件引用来自不同表的列,则目前仅支持等值运算符 (`=`)。
:::

**示例**

考虑 `table_1` 和 `table_2`:

```response
┌─Id─┬─name─┐     ┌─Id─┬─text───────────┬─scores─┐
│  1 │ A    │     │  1 │ Text A         │     10 │
│  2 │ B    │     │  1 │ Another text A │     12 │
│  3 │ C    │     │  2 │ Text B         │     15 │
└────┴──────┘     └────┴────────────────┴────────┘
```

包含一个连接键条件和 `table_2` 附加条件的查询:

```sql
SELECT name, text FROM table_1 LEFT OUTER JOIN table_2
    ON table_1.Id = table_2.Id AND startsWith(table_2.text, 'Text');
```

请注意,结果包含名称为 `C` 且文本列为空的行。该行被包含在结果中是因为使用了 `OUTER` 类型的连接。

```response
┌─name─┬─text───┐
│ A    │ Text A │
│ B    │ Text B │
│ C    │        │
└──────┴────────┘
```

包含 `INNER` 类型连接和多个条件的查询:

```sql
SELECT name, text, scores FROM table_1 INNER JOIN table_2
    ON table_1.Id = table_2.Id AND table_2.scores > 10 AND startsWith(table_2.text, 'Text');
```

结果:

```sql
┌─name─┬─text───┬─scores─┐
│ B    │ Text B │     15 │
└──────┴────────┴────────┘
```

包含 `INNER` 类型连接和 `OR` 条件的查询:

```sql
CREATE TABLE t1 (`a` Int64, `b` Int64) ENGINE = MergeTree() ORDER BY a;

CREATE TABLE t2 (`key` Int32, `val` Int64) ENGINE = MergeTree() ORDER BY key;

INSERT INTO t1 SELECT number as a, -a as b from numbers(5);

INSERT INTO t2 SELECT if(number % 2 == 0, toInt64(number), -number) as key, number as val from numbers(5);

SELECT a, b, val FROM t1 INNER JOIN t2 ON t1.a = t2.key OR t1.b = t2.key;
```

结果:

```response
┌─a─┬──b─┬─val─┐
│ 0 │  0 │   0 │
│ 1 │ -1 │   1 │
│ 2 │ -2 │   2 │
│ 3 │ -3 │   3 │
│ 4 │ -4 │   4 │
└───┴────┴─────┘
```

包含 `INNER` 类型连接以及 `OR` 和 `AND` 条件的查询:

:::note


默认情况下，只要非等值条件中使用的列都来自同一张表，就会被支持。
例如，`t1.a = t2.key AND t1.b > 0 AND t2.b > t2.c`，因为 `t1.b > 0` 只使用了 `t1` 的列，而 `t2.b > t2.c` 只使用了 `t2` 的列。
不过，你也可以尝试对类似 `t1.a = t2.key AND t1.b > t2.key` 这样的条件启用实验性支持，更多细节请参见下方章节。

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


## 对来自不同表的列使用不等条件的 JOIN {#join-with-inequality-conditions-for-columns-from-different-tables}

ClickHouse 目前支持在 `ALL/ANY/SEMI/ANTI INNER/LEFT/RIGHT/FULL JOIN` 中同时使用不等条件和等值条件。不等条件仅支持 `hash` 和 `grace_hash` 连接算法。不等条件不支持与 `join_use_nulls` 配合使用。

**示例**

表 `t1`:

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

`NULL` 不等于任何值,包括其自身。这意味着如果一个表中的 `JOIN` 键为 `NULL` 值,它不会与另一个表中的 `NULL` 值匹配。

**示例**

表 `A`:

```response
┌───id─┬─name────┐
│    1 │ Alice   │
│    2 │ Bob     │
│ ᴺᵁᴸᴸ │ Charlie │
└──────┴─────────┘
```

表 `B`:

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

请注意,表 `A` 中 `Charlie` 所在的行和表 `B` 中分数为 88 的行未出现在结果中,原因是 `JOIN` 键中存在 `NULL` 值。

如果需要匹配 `NULL` 值,可以使用 `isNotDistinctFrom` 函数来比较 `JOIN` 键。

```sql
SELECT A.name, B.score FROM A LEFT JOIN B ON isNotDistinctFrom(A.id, B.id)
```

```markdown
┌─name────┬─score─┐
│ Alice │ 90 │
│ Bob │ 0 │
│ Charlie │ 88 │
└─────────┴───────┘
```


## ASOF JOIN 用法 {#asof-join-usage}

当需要连接没有精确匹配的记录时,`ASOF JOIN` 非常有用。

此 JOIN 算法要求表中包含一个特殊列。该列:

- 必须包含有序序列。
- 可以是以下类型之一:[Int, UInt](../../../sql-reference/data-types/int-uint.md)、[Float](../../../sql-reference/data-types/float.md)、[Date](../../../sql-reference/data-types/date.md)、[DateTime](../../../sql-reference/data-types/datetime.md)、[Decimal](../../../sql-reference/data-types/decimal.md)。
- 对于 `hash` 连接算法,该列不能是 `JOIN` 子句中的唯一列。

语法 `ASOF JOIN ... ON`:

```sql
SELECT expressions_list
FROM table_1
ASOF LEFT JOIN table_2
ON equi_cond AND closest_match_cond
```

可以使用任意数量的相等条件和恰好一个最接近匹配条件。例如,`SELECT count() FROM table_1 ASOF LEFT JOIN table_2 ON table_1.a == table_2.b AND table_2.t <= table_1.t`。

最接近匹配支持的条件:`>`、`>=`、`<`、`<=`。

语法 `ASOF JOIN ... USING`:

```sql
SELECT expressions_list
FROM table_1
ASOF JOIN table_2
USING (equi_column1, ... equi_columnN, asof_column)
```

`ASOF JOIN` 使用 `equi_columnX` 进行相等连接,使用 `asof_column` 通过 `table_1.asof_column >= table_2.asof_column` 条件进行最接近匹配连接。`asof_column` 列始终是 `USING` 子句中的最后一列。

例如,考虑以下表:

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

`ASOF JOIN` 可以从 `table_1` 中获取用户事件的时间戳,并在 `table_2` 中查找时间戳最接近 `table_1` 中事件时间戳且符合最接近匹配条件的事件。如果存在相等的时间戳值,则它们是最接近的。在这里,`user_id` 列可用于相等连接,`ev_time` 列可用于最接近匹配连接。在本例中,`event_1_1` 可以与 `event_2_1` 连接,`event_1_2` 可以与 `event_2_3` 连接,但 `event_2_2` 无法连接。

:::note
`ASOF JOIN` 仅由 `hash` 和 `full_sorting_merge` 连接算法支持。
[Join](../../../engines/table-engines/special/join.md) 表引擎**不**支持该功能。
:::


## PASTE JOIN 用法 {#paste-join-usage}

`PASTE JOIN` 的结果是一个表,其中包含左子查询的所有列,后面紧跟右子查询的所有列。
行基于它们在原始表中的位置进行匹配(行的顺序应当是确定的)。
如果子查询返回的行数不同,多余的行将被截断。

示例:

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

注意:在这种情况下,如果采用并行读取,结果可能是不确定的。例如:

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

涉及分布式表的 JOIN 有两种执行方式:

- 使用普通 `JOIN` 时,查询会被发送到远程服务器。子查询在每个服务器上运行以构建右表,然后与该表执行连接操作。换句话说,右表在每个服务器上分别构建。
- 使用 `GLOBAL ... JOIN` 时,首先由请求服务器运行子查询来计算右表。该临时表会传递到每个远程服务器,然后在这些服务器上使用传输的临时数据运行查询。

使用 `GLOBAL` 时需要谨慎。更多信息请参阅[分布式子查询](/sql-reference/operators/in#distributed-subqueries)部分。


## 隐式类型转换 {#implicit-type-conversion}

`INNER JOIN`、`LEFT JOIN`、`RIGHT JOIN` 和 `FULL JOIN` 查询支持对"连接键"进行隐式类型转换。但是,如果左表和右表的连接键无法转换为单一类型,则查询无法执行(例如,不存在可以同时容纳 `UInt64` 和 `Int64` 所有值的数据类型,或者 `String` 和 `Int32` 所有值的数据类型)。

**示例**

考虑表 `t_1`:

```response
┌─a─┬─b─┬─toTypeName(a)─┬─toTypeName(b)─┐
│ 1 │ 1 │ UInt16        │ UInt8         │
│ 2 │ 2 │ UInt16        │ UInt8         │
└───┴───┴───────────────┴───────────────┘
```

以及表 `t_2`:

```response
┌──a─┬────b─┬─toTypeName(a)─┬─toTypeName(b)───┐
│ -1 │    1 │ Int16         │ Nullable(Int64) │
│  1 │   -1 │ Int16         │ Nullable(Int64) │
│  1 │    1 │ Int16         │ Nullable(Int64) │
└────┴──────┴───────────────┴─────────────────┘
```

该查询

```sql
SELECT a, b, toTypeName(a), toTypeName(b) FROM t_1 FULL JOIN t_2 USING (a, b);
```

返回结果集:

```response
┌──a─┬────b─┬─toTypeName(a)─┬─toTypeName(b)───┐
│  1 │    1 │ Int32         │ Nullable(Int64) │
│  2 │    2 │ Int32         │ Nullable(Int64) │
│ -1 │    1 │ Int32         │ Nullable(Int64) │
│  1 │   -1 │ Int32         │ Nullable(Int64) │
└────┴──────┴───────────────┴─────────────────┘
```


## 使用建议 {#usage-recommendations}

### 处理空值或 NULL 单元格 {#processing-of-empty-or-null-cells}

在连接表时,可能会出现空单元格。[join_use_nulls](../../../operations/settings/settings.md#join_use_nulls) 设置定义了 ClickHouse 如何填充这些单元格。

如果 `JOIN` 键是 [Nullable](../../../sql-reference/data-types/nullable.md) 字段,则至少有一个键的值为 [NULL](/sql-reference/syntax#null) 的行将不会被连接。

### 语法 {#syntax}

在 `USING` 中指定的列在两个子查询中必须具有相同的名称,而其他列必须使用不同的名称。您可以使用别名来更改子查询中列的名称。

`USING` 子句指定一个或多个用于连接的列,这将建立这些列的相等关系。列列表设置时不使用括号。不支持更复杂的连接条件。

### 语法限制 {#syntax-limitations}

对于单个 `SELECT` 查询中的多个 `JOIN` 子句:

- 仅当连接的是表而不是子查询时,才能通过 `*` 获取所有列。
- `PREWHERE` 子句不可用。
- `USING` 子句不可用。

对于 `ON`、`WHERE` 和 `GROUP BY` 子句:

- 不能在 `ON`、`WHERE` 和 `GROUP BY` 子句中使用任意表达式,但您可以在 `SELECT` 子句中定义表达式,然后通过别名在这些子句中使用它。

### 性能 {#performance}

在运行 `JOIN` 时,执行顺序相对于查询的其他阶段没有优化。连接操作(在右表中搜索)在 `WHERE` 过滤之前和聚合之前运行。

每次使用相同的 `JOIN` 运行查询时,子查询都会再次运行,因为结果不会被缓存。为避免这种情况,请使用特殊的 [Join](../../../engines/table-engines/special/join.md) 表引擎,它是一个始终位于 RAM 中的预准备连接数组。

在某些情况下,使用 [IN](../../../sql-reference/operators/in.md) 比使用 `JOIN` 更高效。

如果您需要使用 `JOIN` 来连接维度表(这些是包含维度属性的相对较小的表,例如广告活动的名称),由于每次查询都会重新访问右表,`JOIN` 可能不太方便。对于这种情况,有一个"字典"功能,您应该使用它来代替 `JOIN`。有关更多信息,请参阅[字典](../../../sql-reference/dictionaries/index.md)部分。

### 内存限制 {#memory-limitations}

默认情况下,ClickHouse 使用[哈希连接](https://en.wikipedia.org/wiki/Hash_join)算法。ClickHouse 获取右表并在 RAM 中为其创建哈希表。如果启用了 `join_algorithm = 'auto'`,则在内存消耗达到某个阈值后,ClickHouse 会回退到[归并](https://en.wikipedia.org/wiki/Sort-merge_join)连接算法。有关 `JOIN` 算法的描述,请参阅 [join_algorithm](../../../operations/settings/settings.md#join_algorithm) 设置。

如果您需要限制 `JOIN` 操作的内存消耗,请使用以下设置:

- [max_rows_in_join](/operations/settings/settings#max_rows_in_join) — 限制哈希表中的行数。
- [max_bytes_in_join](/operations/settings/settings#max_bytes_in_join) — 限制哈希表的大小。

当达到这些限制中的任何一个时,ClickHouse 会按照 [join_overflow_mode](/operations/settings/settings#join_overflow_mode) 设置的指示执行操作。


## 示例 {#examples}

示例:

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

- 博客：[ClickHouse：具备完整 SQL Join 支持的超高速 DBMS - 第 1 部分](https://clickhouse.com/blog/clickhouse-fully-supports-joins)
- 博客：[ClickHouse：具备完整 SQL Join 支持的超高速 DBMS - 底层原理 - 第 2 部分](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2)
- 博客：[ClickHouse：具备完整 SQL Join 支持的超高速 DBMS - 底层原理 - 第 3 部分](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3)
- 博客：[ClickHouse：具备完整 SQL Join 支持的超高速 DBMS - 底层原理 - 第 4 部分](https://clickhouse.com/blog/clickhouse-fully-supports-joins-direct-join-part4)
