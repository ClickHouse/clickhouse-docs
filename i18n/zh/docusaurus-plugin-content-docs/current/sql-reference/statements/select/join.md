---
'description': 'JOIN 子句的文档'
'sidebar_label': 'JOIN'
'slug': '/sql-reference/statements/select/join'
'title': 'JOIN 子句'
'keywords':
- 'INNER JOIN'
- 'LEFT JOIN'
- 'LEFT OUTER JOIN'
- 'RIGHT JOIN'
- 'RIGHT OUTER JOIN'
- 'FULL OUTER JOIN'
- 'CROSS JOIN'
- 'LEFT SEMI JOIN'
- 'RIGHT SEMI JOIN'
- 'LEFT ANTI JOIN'
- 'RIGHT ANTI JOIN'
- 'LEFT ANY JOIN'
- 'RIGHT ANY JOIN'
- 'INNER ANY JOIN'
- 'ASOF JOIN'
- 'LEFT ASOF JOIN'
- 'PASTE JOIN'
'doc_type': 'reference'
---


# JOIN 子句

`JOIN` 子句通过使用每个表中共同的值，组合一个或多个表的列，从而生成一个新表。这是 SQL 支持的数据库中的一种常见操作，对应于 [关系代数](https://en.wikipedia.org/wiki/Relational_algebra#Joins_and_join-like_operators) 中的连接。一个表连接的特例通常被称为“自连接”。

**语法**

```sql
SELECT <expr_list>
FROM <left_table>
[GLOBAL] [INNER|LEFT|RIGHT|FULL|CROSS] [OUTER|SEMI|ANTI|ANY|ALL|ASOF] JOIN <right_table>
(ON <expr_list>)|(USING <column_list>) ...
```

`ON` 子句中的表达式和 `USING` 子句中的列称为“连接键”。除非另有说明，`JOIN` 会从具有匹配“连接键”的行生成 [笛卡尔积](https://en.wikipedia.org/wiki/Cartesian_product)，这可能会产生比源表更多的行结果。

## 支持的 JOIN 类型 {#supported-types-of-join}

支持所有标准的 [SQL JOIN](https://en.wikipedia.org/wiki/Join_(SQL)) 类型：

| 类型               | 描述                                                                         |
|-------------------|-----------------------------------------------------------------------------|
| `INNER JOIN`      | 仅返回匹配的行。                                                           |
| `LEFT OUTER JOIN` | 除匹配的行外，还返回左表中的不匹配行。                                    |
| `RIGHT OUTER JOIN`| 除匹配的行外，还返回右表中的不匹配行。                                    |
| `FULL OUTER JOIN` | 除匹配的行外，还返回两个表中的不匹配行。                                  |
| `CROSS JOIN`      | 生成整个表的笛卡尔积，未指定“连接键”。                                    |

- 未指定类型的 `JOIN` 默认使用 `INNER`。
- 关键字 `OUTER` 可以安全省略。
- `CROSS JOIN` 的另一种语法是将多个表通过逗号分隔在 [`FROM` 子句](../../../sql-reference/statements/select/from.md) 中指定。

ClickHouse 中还提供额外的连接类型：

| 类型                                        | 描述                                                                                                                               |
|---------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------|
| `LEFT SEMI JOIN`, `RIGHT SEMI JOIN`         | 允许列表“连接键”，不产生笛卡尔积。                                                                                                    |
| `LEFT ANTI JOIN`, `RIGHT ANTI JOIN`         | 拒绝列表“连接键”，不产生笛卡尔积。                                                                                                    |
| `LEFT ANY JOIN`, `RIGHT ANY JOIN`, `INNER ANY JOIN` | 部分（对应于 `LEFT` 和 `RIGHT` 的反面）或完全（对于 `INNER` 和 `FULL`）禁用标准 `JOIN` 类型的笛卡尔积。                             |
| `ASOF JOIN`, `LEFT ASOF JOIN`               | 通过非完全匹配连接序列。`ASOF JOIN` 的用法在下文中描述。                                                                            |
| `PASTE JOIN`                                | 执行两个表的横向连接。                                                                                                               |

:::note
当 [join_algorithm](../../../operations/settings/settings.md#join_algorithm) 设置为 `partial_merge` 时，`RIGHT JOIN` 和 `FULL JOIN` 仅在 `ALL` 严格性下支持（`SEMI`、`ANTI`、`ANY` 和 `ASOF` 不支持）。
:::

## 设置 {#settings}

默认的连接类型可以使用 [`join_default_strictness`](../../../operations/settings/settings.md#join_default_strictness) 设置进行覆盖。

ClickHouse 服务器对于 `ANY JOIN` 操作的行为取决于 [`any_join_distinct_right_table_keys`](../../../operations/settings/settings.md#any_join_distinct_right_table_keys) 设置。

**另见**

- [`join_algorithm`](../../../operations/settings/settings.md#join_algorithm)
- [`join_any_take_last_row`](../../../operations/settings/settings.md#join_any_take_last_row)
- [`join_use_nulls`](../../../operations/settings/settings.md#join_use_nulls)
- [`partial_merge_join_rows_in_right_blocks`](../../../operations/settings/settings.md#partial_merge_join_rows_in_right_blocks)
- [`join_on_disk_max_files_to_merge`](../../../operations/settings/settings.md#join_on_disk_max_files_to_merge)
- [`any_join_distinct_right_table_keys`](../../../operations/settings/settings.md#any_join_distinct_right_table_keys)

使用 `cross_to_inner_join_rewrite` 设置来定义 ClickHouse 在无法将 `CROSS JOIN` 重写为 `INNER JOIN` 时的行为。默认值为 `1`，这允许连接继续，但会更慢。如果希望抛出错误，请将 `cross_to_inner_join_rewrite` 设置为 `0`；如果希望不运行交叉连接，而强制重写所有逗号/交叉连接，则将其设置为 `2`。如果在值为 `2` 时重写失败，您将收到一条错误消息，说明“请尝试简化 `WHERE` 部分”。

## ON 子句条件 {#on-section-conditions}

`ON` 子句可以包含多个通过 `AND` 和 `OR` 操作符组合的条件。指定连接键的条件必须：
- 同时引用左表和右表
- 使用等于操作符

其他条件可以使用其他逻辑操作符，但必须引用查询的左表或右表。

如果满足整个复杂条件，则行被连接。如果条件未满足，则可能会根据 `JOIN` 类型在结果中仍包括行。请注意，如果相同的条件放置在 `WHERE` 子句中且未满足，则行总是从结果中被过滤掉。

`ON` 子句中的 `OR` 操作符使用哈希连接算法工作——对于每个带有连接键的 `JOIN` 的 `OR` 参数，将创建一个单独的哈希表，因此内存消耗和查询执行时间随着 `ON` 子句中 `OR` 表达式的增加而线性增长。

:::note
如果条件引用来自不同表的列，则目前仅支持等于操作符（`=`）。
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

具有一个连接键条件和一个额外条件的查询以 `table_2` 为准：

```sql
SELECT name, text FROM table_1 LEFT OUTER JOIN table_2
    ON table_1.Id = table_2.Id AND startsWith(table_2.text, 'Text');
```

请注意，结果包含名称为 `C` 的行和空文本列。它包含在结果中，因为使用的是 `OUTER` 类型的连接。

```response
┌─name─┬─text───┐
│ A    │ Text A │
│ B    │ Text B │
│ C    │        │
└──────┴────────┘
```

具有 `INNER` 类型连接和多个条件的查询：

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
具有 `INNER` 类型连接和 `OR` 条件的查询：

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

具有 `INNER` 类型连接和 `OR` 和 `AND` 条件的查询：

:::note

默认情况下，只要使用同一表中的列，就支持不等条件。
例如，`t1.a = t2.key AND t1.b > 0 AND t2.b > t2.c`，因为 `t1.b > 0` 仅使用列来自 `t1`，而 `t2.b > t2.c` 仅使用列来自 `t2`。
但是，您可以尝试实验性支持条件，例如 `t1.a = t2.key AND t1.b > t2.key`，有关更多详细信息，请查看下面的部分。

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

## 对不同表的列使用不等条件的 JOIN {#join-with-inequality-conditions-for-columns-from-different-tables}

ClickHouse 目前支持 `ALL/ANY/SEMI/ANTI INNER/LEFT/RIGHT/FULL JOIN` 的不等条件，除了支持等于条件。不等条件仅支持 `hash` 和 `grace_hash` 连接算法。`join_use_nulls` 不支持不等条件。

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

`NULL` 不等于任何值，包括它自己。这意味着如果一个表中的 `JOIN` 键具有 `NULL` 值，则在另一个表中不会与 `NULL` 值匹配。

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

请注意，来自表 `A` 的行 `Charlie` 和来自表 `B` 的行 `88` 不在结果中，因为 `JOIN` 键中的 `NULL` 值。

如果您想匹配 `NULL` 值，请使用 `isNotDistinctFrom` 函数来比较 `JOIN` 键。

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

`ASOF JOIN` 在需要连接没有精确匹配的记录时非常有用。

此 JOIN 算法需要表中的一个特殊列。该列：

- 必须包含一个有序序列。
- 可以是以下类型之一：[Int, UInt](../../../sql-reference/data-types/int-uint.md)、[Float](../../../sql-reference/data-types/float.md)、[Date](../../../sql-reference/data-types/date.md)、[DateTime](../../../sql-reference/data-types/datetime.md)、[Decimal](../../../sql-reference/data-types/decimal.md)。
- 对于 `hash` 连接算法，它不能是 `JOIN` 子句中的唯一列。

语法 `ASOF JOIN ... ON`：

```sql
SELECT expressions_list
FROM table_1
ASOF LEFT JOIN table_2
ON equi_cond AND closest_match_cond
```

您可以使用任意数量的等式条件和恰好一个最近匹配条件。例如，`SELECT count() FROM table_1 ASOF LEFT JOIN table_2 ON table_1.a == table_2.b AND table_2.t <= table_1.t`。

为最近匹配支持的条件：`>`、`>=`、`<`、`<=`。

语法 `ASOF JOIN ... USING`：

```sql
SELECT expressions_list
FROM table_1
ASOF JOIN table_2
USING (equi_column1, ... equi_columnN, asof_column)
```

`ASOF JOIN` 使用 `equi_columnX` 进行等于连接，并使用 `asof_column` 进行最近匹配连接，条件为 `table_1.asof_column >= table_2.asof_column`。`asof_column` 列始终是 `USING` 子句中的最后一列。

例如，考虑以下表：

```text
     table_1                           table_2
  event   | ev_time | user_id       event   | ev_time | user_id
----------|---------|---------- ----------|---------|----------
              ...                               ...
event_1_1 |  12:00  |  42         event_2_1 |  11:59  |   42
              ...                 event_2_2 |  12:30  |   42
event_1_2 |  13:00  |  42         event_2_3 |  13:00  |   42
              ...                               ...
```

`ASOF JOIN` 可以从 `table_1` 提取用户事件的时间戳，并在 `table_2` 中找到与从 `table_1` 中提取的事件最近的时间戳相符合的事件。如果有可用的相同时间戳值，则这些值是最近的。在我们的示例中，`user_id` 列可用于用于等于连接，`ev_time` 列可用于最近匹配连接。 在我们的示例中，`event_1_1` 可以与 `event_2_1` 连接，`event_1_2` 可以与 `event_2_3` 连接，但 `event_2_2` 不能连接。

:::note
`ASOF JOIN` 仅受 `hash` 和 `full_sorting_merge` 连接算法的支持。
它在 [JOIN](../../../engines/table-engines/special/join.md) 表引擎中**不**受支持。
:::

## PASTE JOIN 用法 {#paste-join-usage}

`PASTE JOIN` 的结果是一个表，其中包含所有来自左子查询的列，后跟所有来自右子查询的列。
行是根据它们在原始表中的位置进行匹配（行的顺序必须已经定义）。
如果子查询返回不同数量的行，将会截断多余的行。

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

注意：在这种情况下，如果读取是并行的，结果可能是非确定性的。例如：

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

执行涉及分布式表的 JOIN 有两种方式：

- 使用普通的 `JOIN` 时，查询发送到远程服务器。每个服务器上运行子查询以生成右表，然后与该表进行连接。换句话说，右表在每个服务器上分别生成。
- 使用 `GLOBAL ... JOIN` 时，首先请求服务器运行一个子查询以计算右表。此临时表将传递到每个远程服务器，并在它们上使用传输的临时数据运行查询。

使用 `GLOBAL` 时请小心。有关更多信息，请参见 [分布式子查询](/sql-reference/operators/in#distributed-subqueries) 部分。

## 隐式类型转换 {#implicit-type-conversion}

`INNER JOIN`、`LEFT JOIN`、`RIGHT JOIN` 和 `FULL JOIN` 查询支持对“连接键”的隐式类型转换。然而，如果左表和右表的连接键无法转换为单一类型（例如，没有数据类型能够同时容纳 `UInt64` 和 `Int64`，或 `String` 和 `Int32` 中的所有值），查询将无法执行。

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

查询
```sql
SELECT a, b, toTypeName(a), toTypeName(b) FROM t_1 FULL JOIN t_2 USING (a, b);
```
返回集合：
```response
┌──a─┬────b─┬─toTypeName(a)─┬─toTypeName(b)───┐
│  1 │    1 │ Int32         │ Nullable(Int64) │
│  2 │    2 │ Int32         │ Nullable(Int64) │
│ -1 │    1 │ Int32         │ Nullable(Int64) │
│  1 │   -1 │ Int32         │ Nullable(Int64) │
└────┴──────┴───────────────┴─────────────────┘
```

## 使用建议 {#usage-recommendations}

### 处理空或 NULL 单元格 {#processing-of-empty-or-null-cells}

在连接表时，可能会出现空单元格。设置 [join_use_nulls](../../../operations/settings/settings.md#join_use_nulls) 定义 ClickHouse 如何填充这些单元格。

如果 `JOIN` 键是 [Nullable](../../../sql-reference/data-types/nullable.md) 字段，其中至少一个键的值为 [NULL](/sql-reference/syntax#null) 的行不会被连接。

### 语法 {#syntax}

在 `USING` 中指定的列在两个子查询中必须具有相同的名称，其他列必须命名不同。您可以使用别名更改子查询中列的名称。

`USING` 子句指定一个或多个列以进行连接，从而建立这些列的相等关系。列的列表不带括号设置。不支持更复杂的连接条件。

### 语法限制 {#syntax-limitations}

对于单个 `SELECT` 查询中的多个 `JOIN` 子句：

- 通过 `*` 获取所有列仅在表连接时可用，而不适用于子查询。
- `PREWHERE` 子句不可用。
- `USING` 子句不可用。

对于 `ON`、`WHERE` 和 `GROUP BY` 子句：

- `ON`、`WHERE` 和 `GROUP BY` 子句中不能使用任意表达式，但您可以在 `SELECT` 子句中定义一个表达式，然后通过别名在这些子句中使用。

### 性能 {#performance}

运行 `JOIN` 时，查询的执行顺序不会优化为与其他阶段相关。连接（在右表中搜索）在 `WHERE` 中的过滤之前以及聚合之前运行。

每次以相同的 `JOIN` 运行查询时，子查询会再次运行，因为结果不会被缓存。要避免这种情况，使用特殊的 [JOIN](../../../engines/table-engines/special/join.md) 表引擎，该引擎是用于连接的准备好的数组，始终在内存中。

在某些情况下，使用 [IN](../../../sql-reference/operators/in.md) 代替 `JOIN` 更有效。

如果您需要与维度表进行连接的 `JOIN`（这些表相对较小，包含维度属性，如广告活动的名称），由于右表在每个查询中都会被重新访问，`JOIN` 可能不方便。在这种情况下，您应该使用“字典”功能，而不是使用 `JOIN`。有关更多信息，请参见 [字典](../../../sql-reference/dictionaries/index.md) 部分。

### 内存限制 {#memory-limitations}

默认情况下，ClickHouse 使用 [哈希连接](https://en.wikipedia.org/wiki/Hash_join) 算法。ClickHouse 将右表创建一个哈希表放入内存中。如果 `join_algorithm = 'auto'` 被启用，则在超过某个内存消耗阈值后，ClickHouse 会退回到 [合并](https://en.wikipedia.org/wiki/Sort-merge_join) 连接算法。有关 `JOIN` 算法的描述，请参阅 [join_algorithm](../../../operations/settings/settings.md#join_algorithm) 设置。

如果您需要限制 `JOIN` 操作的内存消耗，请使用以下设置：

- [max_rows_in_join](/operations/settings/settings#max_rows_in_join) — 限制哈希表中的行数。
- [max_bytes_in_join](/operations/settings/settings#max_bytes_in_join) — 限制哈希表的大小。

当达到这些限制时，ClickHouse 的表现将按照 [join_overflow_mode](/operations/settings/settings.md#join_overflow_mode) 设置指示的方式进行。

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

- 博客：[ClickHouse：一款快速的完全支持 SQL 连接的 DBMS - 第 1 部分](https://clickhouse.com/blog/clickhouse-fully-supports-joins)
- 博客：[ClickHouse：一款快速的完全支持 SQL 连接的 DBMS - 引擎深度解析 - 第 2 部分](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2)
- 博客：[ClickHouse：一款快速的完全支持 SQL 连接的 DBMS - 引擎深度解析 - 第 3 部分](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3)
- 博客：[ClickHouse：一款快速的完全支持 SQL 连接的 DBMS - 引擎深度解析 - 第 4 部分](https://clickhouse.com/blog/clickhouse-fully-supports-joins-direct-join-part4)
