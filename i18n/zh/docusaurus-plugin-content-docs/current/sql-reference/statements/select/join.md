
# JOIN 子句

`JOIN` 子句通过使用共同的值将一个或多个表的列组合在一起，生成一个新表。这是支持 SQL 的数据库中的常见操作，对应于 [关系代数](https://en.wikipedia.org/wiki/Relational_algebra#Joins_and_join-like_operators) 的连接。一个表的连接的特殊情况通常被称为“自连接”。

**语法**

```sql
SELECT <expr_list>
FROM <left_table>
[GLOBAL] [INNER|LEFT|RIGHT|FULL|CROSS] [OUTER|SEMI|ANTI|ANY|ALL|ASOF] JOIN <right_table>
(ON <expr_list>)|(USING <column_list>) ...
```

`ON` 子句中的表达式和 `USING` 子句中的列称为“连接键”。除非另有说明，`JOIN` 会生成具有匹配“连接键”的行的 [笛卡尔积](https://en.wikipedia.org/wiki/Cartesian_product)，这可能会产生比源表多得多的行结果。

## 支持的 JOIN 类型 {#supported-types-of-join}

所有标准的 [SQL JOIN](https://en.wikipedia.org/wiki/Join_(SQL)) 类型均受支持：

| 类型               | 描述                                                                           |
|-------------------|-------------------------------------------------------------------------------|
| `INNER JOIN`      | 仅返回匹配的行。                                                               |
| `LEFT OUTER JOIN` | 除了匹配的行，左表中的非匹配行也会被返回。                                     |
| `RIGHT OUTER JOIN`| 除了匹配的行，右表中的非匹配行也会被返回。                                    |
| `FULL OUTER JOIN` | 除了匹配的行，两个表中的非匹配行也会被返回。                                   |
| `CROSS JOIN`      | 生成整个表的笛卡尔积，未指定“连接键”。                                         |

- 未指定类型的 `JOIN` 视为 `INNER`。
- `OUTER` 关键字可以安全省略。
- `CROSS JOIN` 的另一种语法是在 [`FROM` 子句](../../../sql-reference/statements/select/from.md) 中用逗号分隔多个表。

在 ClickHouse 中可用的额外连接类型有：

| 类型                                          | 描述                                                                                                     |
|-----------------------------------------------|---------------------------------------------------------------------------------------------------------|
| `LEFT SEMI JOIN`, `RIGHT SEMI JOIN`         | 在“连接键”上进行白名单操作，而不会产生笛卡尔积。                                                                  |
| `LEFT ANTI JOIN`, `RIGHT ANTI JOIN`         | 在“连接键”上进行黑名单操作，而不会产生笛卡尔积。                                                                  |
| `LEFT ANY JOIN`, `RIGHT ANY JOIN`, `INNER ANY JOIN` | 部分（对于 `LEFT` 和 `RIGHT` 的相对侧）或完全（对于 `INNER` 和 `FULL`）禁用标准 `JOIN` 类型的笛卡尔积。 |
| `ASOF JOIN`, `LEFT ASOF JOIN`               | 连接序列的非精确匹配。下面描述了 `ASOF JOIN` 的用法。                                                        |
| `PASTE JOIN`                                | 执行两个表的水平连接。                                                                                          |

:::note
当 [join_algorithm](../../../operations/settings/settings.md#join_algorithm) 设置为 `partial_merge` 时，只有具有 `ALL` 严格性的 `RIGHT JOIN` 和 `FULL JOIN` 被支持（`SEMI`、`ANTI`、`ANY` 和 `ASOF` 不受支持）。
:::

## 设置 {#settings}

可以使用 [`join_default_strictness`](../../../operations/settings/settings.md#join_default_strictness) 设置覆盖默认的连接类型。

ClickHouse 服务器的 `ANY JOIN` 操作的行为取决于 [`any_join_distinct_right_table_keys`](../../../operations/settings/settings.md#any_join_distinct_right_table_keys) 设置。

**另见**

- [`join_algorithm`](../../../operations/settings/settings.md#join_algorithm)
- [`join_any_take_last_row`](../../../operations/settings/settings.md#join_any_take_last_row)
- [`join_use_nulls`](../../../operations/settings/settings.md#join_use_nulls)
- [`partial_merge_join_rows_in_right_blocks`](../../../operations/settings/settings.md#partial_merge_join_rows_in_right_blocks)
- [`join_on_disk_max_files_to_merge`](../../../operations/settings/settings.md#join_on_disk_max_files_to_merge)
- [`any_join_distinct_right_table_keys`](../../../operations/settings/settings.md#any_join_distinct_right_table_keys)

使用 `cross_to_inner_join_rewrite` 设置定义当 ClickHouse 未能将 `CROSS JOIN` 重写为 `INNER JOIN` 时的行为。默认值为 `1`，允许连接继续，但会更慢。如果希望抛出错误，请将 `cross_to_inner_join_rewrite` 设置为 `0`，将其设置为 `2` 则不执行交叉连接，而是强制重写所有逗号/交叉连接。如果在值为 `2` 时重写失败，您将收到一条错误消息，内容为“请尝试简化 `WHERE` 部分”。

## ON 子句条件 {#on-section-conditions}

`ON` 子句可以包含几个条件，这些条件使用 `AND` 和 `OR` 运算符组合。指定连接键的条件必须：
- 引用左表和右表
- 使用相等运算符

其他条件可以使用其他逻辑运算符，但必须引用查询的左表或右表。

如果满足整个复杂条件，则行会被连接。如果条件未满足，则根据 `JOIN` 类型，行仍可能包含在结果中。请注意，如果相同的条件放置在 `WHERE` 子句中且未满足，则行将始终从结果中过滤。

`ON` 子句中的 `OR` 运算符使用哈希连接算法——对于每个带有连接键的 `OR` 参数，会创建一个单独的哈希表，因此随着 `ON` 子句中 `OR` 表达式数量的增加，内存消耗和查询执行时间线性增长。

:::note
如果条件引用来自不同表的列，则仅支持相等运算符（`=`）。
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

带有一个连接键条件和额外条件的查询 `table_2`：

```sql
SELECT name, text FROM table_1 LEFT OUTER JOIN table_2
    ON table_1.Id = table_2.Id AND startsWith(table_2.text, 'Text');
```

请注意，结果包含名称为 `C` 的行和空文本列。由于使用了 `OUTER` 类型的连接，因此它包含在结果中。

```response
┌─name─┬─text───┐
│ A    │ Text A │
│ B    │ Text B │
│ C    │        │
└──────┴────────┘
```

带有 `INNER` 类型连接和多个条件的查询：

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
带有 `INNER` 类型连接和 `OR` 条件的查询：

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

带有 `INNER` 类型连接和具有 `OR` 和 `AND` 条件的查询：

:::note

默认情况下，仅支持同一表中的非相等条件。
例如，`t1.a = t2.key AND t1.b > 0 AND t2.b > t2.c`，因为 `t1.b > 0` 仅使用来自 `t1` 的列，并且 `t2.b > t2.c` 仅使用来自 `t2` 的列。
但是，您可以尝试为条件 `t1.a = t2.key AND t1.b > t2.key` 试验性地提供支持，下面的部分将提供更多细节。

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

## 具有不等条件的 JOIN，适用于来自不同表的列 {#join-with-inequality-conditions-for-columns-from-different-tables}

Clickhouse 目前支持带有不等条件的 `ALL/ANY/SEMI/ANTI INNER/LEFT/RIGHT/FULL JOIN`，除了等于条件。不等条件仅支持 `hash` 和 `grace_hash` 连接算法。与 `join_use_nulls` 不支持不等条件。

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
SELECT t1.*, t2.* from t1 LEFT JOIN t2 ON t1.key = t2.key and (t1.a < t2.a) ORDER BY (t1.key, t1.attr, t2.key, t2.attr);
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

`NULL` 不等于任何值，包括其自身。这意味着如果一个表中的 `JOIN` 键有 `NULL` 值，则在另一个表中不会匹配 `NULL` 值。

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

请注意，来自表 `A` 的 `Charlie` 行与来自表 `B` 的得分 88 的行未包含在结果中，因为 `JOIN` 键中有 `NULL` 值。

如果您希望匹配 `NULL` 值，可以使用 `isNotDistinctFrom` 函数来比较 `JOIN` 键。

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

此 JOIN 算法需要表中的特殊列。该列：

- 必须包含有序序列。
- 可以是以下类型之一：[Int, UInt](../../../sql-reference/data-types/int-uint.md)、[Float](../../../sql-reference/data-types/float.md)、[Date](../../../sql-reference/data-types/date.md)、[DateTime](../../../sql-reference/data-types/datetime.md)、[Decimal](../../../sql-reference/data-types/decimal.md)。
- 对于 `hash` 连接算法，不能是 `JOIN` 子句中的唯一列。

语法 `ASOF JOIN ... ON`：

```sql
SELECT expressions_list
FROM table_1
ASOF LEFT JOIN table_2
ON equi_cond AND closest_match_cond
```

您可以使用任意数量的相等条件和准确一个的最接近匹配条件。例如，`SELECT count() FROM table_1 ASOF LEFT JOIN table_2 ON table_1.a == table_2.b AND table_2.t <= table_1.t`。

支持的最接近匹配条件：`>`、`>=`、`<`、`<=`。

语法 `ASOF JOIN ... USING`：

```sql
SELECT expressions_list
FROM table_1
ASOF JOIN table_2
USING (equi_column1, ... equi_columnN, asof_column)
```

`ASOF JOIN` 使用 `equi_columnX` 进行相等连接，并使用 `asof_column` 进行最接近匹配的连接，条件为 `table_1.asof_column >= table_2.asof_column`。`asof_column` 列始终是 `USING` 子句中的最后一列。

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

`ASOF JOIN` 可以从 `table_1` 中获取用户事件的时间戳，并在 `table_2` 中找到该时间戳与 `table_1` 中事件的时间戳最接近的事件。相等的时间戳值是可用时最近的。在我们的示例中，`user_id` 列可以用于相等连接，`ev_time` 列可以用于最接近匹配。在我们的例子中，`event_1_1` 可以与 `event_2_1` 连接，`event_1_2` 可以与 `event_2_3` 连接，但 `event_2_2` 不能连接。

:::note
`ASOF JOIN` 仅被 `hash` 和 `full_sorting_merge` 连接算法支持。
它在 [Join](../../../engines/table-engines/special/join.md) 表引擎中 **不** 受支持。
:::

## PASTE JOIN 用法 {#paste-join-usage}

`PASTE JOIN` 的结果是一个包含左侧子查询中所有列的表，后跟右侧子查询中的所有列。
这些行根据它们在原始表中的位置匹配（行的顺序应定义）。
如果子查询返回不同数量的行，额外的行将被削减。

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

- 在使用普通 `JOIN` 时，查询被发送到远程服务器。子查询在每个服务器上运行，以生成右表，然后与该表进行连接。换句话说，右表是在每个服务器上单独形成的。
- 在使用 `GLOBAL ... JOIN` 时，首先请求服务器运行子查询以计算右表。该临时表被传递给每个远程服务器，并使用传输的临时数据在它们上运行查询。

使用 `GLOBAL` 时要小心。有关更多信息，请参见 [分布式子查询](/sql-reference/operators/in#distributed-subqueries) 部分。

## 隐式类型转换 {#implicit-type-conversion}

`INNER JOIN`、`LEFT JOIN`、`RIGHT JOIN` 和 `FULL JOIN` 查询支持“连接键”的隐式类型转换。但是如果左表和右表的连接键无法转换为单一类型，则无法执行查询（例如，没有数据类型可以容纳 `UInt64` 和 `Int64`，或者 `String` 和 `Int32` 的所有值）。

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

如果 `JOIN` 键是 [Nullable](../../../sql-reference/data-types/nullable.md) 字段，则至少有一个键值为 [NULL](/sql-reference/syntax#null) 的行不会被连接。

### 语法 {#syntax}

在 `USING` 中指定的列必须在两个子查询中具有相同的名称，其他列必须命名不同。您可以使用别名来更改子查询中的列名称。

`USING` 子句指定一个或多个用于连接的列，确立这些列的相等性。列的列表不设置括号。更复杂的连接条件不受支持。

### 语法限制 {#syntax-limitations}

对于单个 `SELECT` 查询中的多个 `JOIN` 子句：

- 通过 `*` 获取所有列仅在表连接时可用，而不是子查询时。
- 不可用 `PREWHERE` 子句。
- 不可用 `USING` 子句。

对于 `ON`、`WHERE` 和 `GROUP BY` 子句：

- 在 `ON`、`WHERE` 和 `GROUP BY` 子句中不可使用任意表达式，但是您可以在 `SELECT` 子句中定义表达式，然后通过别名在这些子句中使用它。

### 性能 {#performance}

在运行 `JOIN` 时，并不会优化执行顺序与查询的其他阶段相关。连接（在右表中的搜索）在 `WHERE` 之前和聚合之前运行。

每次使用相同的 `JOIN` 运行查询时，子查询都会再次运行，因为结果不会被缓存。为避免此情况，请使用特殊的 [Join](../../../engines/table-engines/special/join.md) 表引擎，它是用于连接的准备数组，始终在内存中。

在某些情况下，使用 [IN](../../../sql-reference/operators/in.md) 而不是 `JOIN` 会更有效。

如果您需要与维度表连接的 `JOIN`（这些是相对较小的表，包含维度属性，如广告活动的名称），由于每次查询都会重新访问右表，因此 `JOIN` 可能不太方便。在这种情况下，建议使用“字典”功能，而不是 `JOIN`。有关更多信息，请参见 [字典](../../../sql-reference/dictionaries/index.md) 部分。

### 内存限制 {#memory-limitations}

默认情况下，ClickHouse 使用 [哈希连接](https://en.wikipedia.org/wiki/Hash_join) 算法。ClickHouse 获取右表并在内存中为其创建哈希表。如果 `join_algorithm = 'auto'` 启用，则在达到某个内存消耗阈值后，ClickHouse 会回退到 [归并](https://en.wikipedia.org/wiki/Sort-merge_join) 连接算法。有关 `JOIN` 算法的描述，请参见 [join_algorithm](../../../operations/settings/settings.md#join_algorithm) 设置。

如果您需要限制 `JOIN` 操作的内存消耗，请使用以下设置：

- [max_rows_in_join](/operations/settings/settings#max_rows_in_join) — 限制哈希表中的行数。
- [max_bytes_in_join](/operations/settings/settings#max_bytes_in_join) — 限制哈希表的大小。

当达到任何这些限制时，ClickHouse 根据 [join_overflow_mode](/operations/settings/settings.md#join_overflow_mode) 设置进行处理。

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

- 博客：[ClickHouse：一个极速的支持完整 SQL JOIN 的 DBMS - 第 1 部分](https://clickhouse.com/blog/clickhouse-fully-supports-joins)
- 博客：[ClickHouse：一个极速的支持完整 SQL JOIN 的 DBMS - 引擎内部 - 第 2 部分](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2)
- 博客：[ClickHouse：一个极速的支持完整 SQL JOIN 的 DBMS - 引擎内部 - 第 3 部分](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3)
- 博客：[ClickHouse：一个极速的支持完整 SQL JOIN 的 DBMS - 引擎内部 - 第 4 部分](https://clickhouse.com/blog/clickhouse-fully-supports-joins-direct-join-part4)
