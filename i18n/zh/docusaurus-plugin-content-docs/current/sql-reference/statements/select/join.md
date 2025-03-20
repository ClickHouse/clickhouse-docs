---
slug: /sql-reference/statements/select/join
sidebar_label: 表连接
---


# JOIN 子句

连接通过使用共享的值，从一个或多个表中组合列生成一个新表。这是一个在支持 SQL 的数据库中的常见操作，对应于 [关系代数](https://en.wikipedia.org/wiki/Relational_algebra#Joins_and_join-like_operators) 的连接。一个表的特殊案例被称为“自连接”。

**语法**

``` sql
SELECT <expr_list>
FROM <left_table>
[GLOBAL] [INNER|LEFT|RIGHT|FULL|CROSS] [OUTER|SEMI|ANTI|ANY|ALL|ASOF] JOIN <right_table>
(ON <expr_list>)|(USING <column_list>) ...
```

`ON` 子句中的表达式和 `USING` 子句中的列称为“连接键”。除非另有说明，连接从具有匹配“连接键”的行中生成 [笛卡尔积](https://en.wikipedia.org/wiki/Cartesian_product)，这可能会产生比源表更多的行结果。

## 相关内容 {#related-content}

- 博客: [ClickHouse: 一种快速的支持完整 SQL 连接的数据库管理系统 - 第 1 部分](https://clickhouse.com/blog/clickhouse-fully-supports-joins)
- 博客: [ClickHouse: 一种快速的支持完整 SQL 连接的数据库管理系统 - 引擎内幕 - 第 2 部分](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2)
- 博客: [ClickHouse: 一种快速的支持完整 SQL 连接的数据库管理系统 - 引擎内幕 - 第 3 部分](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3)
- 博客: [ClickHouse: 一种快速的支持完整 SQL 连接的数据库管理系统 - 引擎内幕 - 第 4 部分](https://clickhouse.com/blog/clickhouse-fully-supports-joins-direct-join-part4)

## 支持的 JOIN 类型 {#supported-types-of-join}

所有标准的 [SQL JOIN](https://en.wikipedia.org/wiki/Join_(SQL)) 类型均被支持：

- `INNER JOIN`，仅返回匹配的行。
- `LEFT OUTER JOIN`，除了匹配的行外还返回左表中的不匹配行。
- `RIGHT OUTER JOIN`，除了匹配的行外还返回右表中的不匹配行。
- `FULL OUTER JOIN`，返回两个表中不匹配的行，外加匹配的行。
- `CROSS JOIN`，生成整个表的笛卡尔积，未指定“连接键”。

未指定类型的 `JOIN` 将隐含为 `INNER`。关键字 `OUTER` 可以安全省略。在 [FROM 子句](../../../sql-reference/statements/select/from.md) 中用逗号分隔多个表是 `CROSS JOIN` 的替代语法。

在 ClickHouse 中还支持其他连接类型：

- `LEFT SEMI JOIN` 和 `RIGHT SEMI JOIN`，对“连接键”的白名单，未生成笛卡尔积。
- `LEFT ANTI JOIN` 和 `RIGHT ANTI JOIN`，对“连接键”的黑名单，未生成笛卡尔积。
- `LEFT ANY JOIN`，`RIGHT ANY JOIN` 和 `INNER ANY JOIN`，部分（对于 `LEFT` 和 `RIGHT` 的对立面）或完全（对于 `INNER` 和 `FULL`）禁用标准 `JOIN` 类型的笛卡尔积。
- `ASOF JOIN` 和 `LEFT ASOF JOIN`，用于连接没有精确匹配的序列。`ASOF JOIN` 的使用如下所述。
- `PASTE JOIN`，执行两个表的水平连接。

:::note
当 [join_algorithm](../../../operations/settings/settings.md#join_algorithm) 设置为 `partial_merge` 时，`RIGHT JOIN` 和 `FULL JOIN` 仅在 `ALL` 严格性下支持（`SEMI`、`ANTI`、`ANY` 和 `ASOF` 不受支持）。
:::

## 设置 {#settings}

可以使用 [join_default_strictness](../../../operations/settings/settings.md#join_default_strictness) 设置来覆盖默认的连接类型。

ClickHouse 服务器对 `ANY JOIN` 操作的行为取决于 [any_join_distinct_right_table_keys](../../../operations/settings/settings.md#any_join_distinct_right_table_keys) 设置。

**另见**

- [join_algorithm](../../../operations/settings/settings.md#join_algorithm)
- [join_any_take_last_row](../../../operations/settings/settings.md#join_any_take_last_row)
- [join_use_nulls](../../../operations/settings/settings.md#join_use_nulls)
- [partial_merge_join_rows_in_right_blocks](../../../operations/settings/settings.md#partial_merge_join_rows_in_right_blocks)
- [join_on_disk_max_files_to_merge](../../../operations/settings/settings.md#join_on_disk_max_files_to_merge)
- [any_join_distinct_right_table_keys](../../../operations/settings/settings.md#any_join_distinct_right_table_keys)

使用 `cross_to_inner_join_rewrite` 设置来定义当 ClickHouse 无法将 `CROSS JOIN` 重写为 `INNER JOIN` 时的行为。默认值为 `1`，允许连接继续，但速度会更慢。如果希望引发错误，请将 `cross_to_inner_join_rewrite` 设置为 `0`，并将其设置为 `2`，以不运行交叉连接，而是强制重写所有逗号/交叉连接。如果重写在值为 `2` 时失败，您将收到一条错误消息，说明“请尝试简化 `WHERE` 部分”。

## ON 部分条件 {#on-section-conditions}

`ON` 部分可以包含几个条件，使用 `AND` 和 `OR` 运算符结合。指定连接键的条件必须同时引用左右表，并且必须使用等号运算符。其他条件可以使用其他逻辑运算符，但必须引用查询的左表或右表之一。

如果满足整个复杂条件，则行将被连接。如果条件不满足，行仍可能根据 `JOIN` 类型包含在结果中。请注意，如果相同的条件放置在 `WHERE` 部分，并且未满足，则行始终会从结果中过滤掉。

`ON` 子句中的 `OR` 运算符使用哈希连接算法 - 对于 `JOIN` 的每个 `OR` 参数与连接键，都会创建一个单独的哈希表，因此内存消耗和查询执行时间随 `ON` 子句中 `OR` 表达式的数量增加而线性增长。

:::note
如果条件引用来自不同表的列，则目前仅支持等号运算符（`=`）。
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

带有一个连接键条件和 `table_2` 的附加条件的查询：

``` sql
SELECT name, text FROM table_1 LEFT OUTER JOIN table_2
    ON table_1.Id = table_2.Id AND startsWith(table_2.text, 'Text');
```

注意结果包含名称为 `C` 的行和空的文本列。它被包含在结果中，因为使用了 `OUTER` 类型的连接。

```response
┌─name─┬─text───┐
│ A    │ Text A │
│ B    │ Text B │
│ C    │        │
└──────┴────────┘
```

带有 `INNER` 类型的连接和多个条件的查询：

``` sql
SELECT name, text, scores FROM table_1 INNER JOIN table_2
    ON table_1.Id = table_2.Id AND table_2.scores > 10 AND startsWith(table_2.text, 'Text');
```

结果：

```sql
┌─name─┬─text───┬─scores─┐
│ B    │ Text B │     15 │
└──────┴────────┴────────┘
```
带有 `INNER` 类型的连接和 `OR` 条件的查询：

``` sql
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

带有 `INNER` 类型的连接和含有 `OR` 和 `AND` 条件的查询：

:::note

默认情况下，只要使用来自同一表的列，非均等条件是被支持的。
例如，`t1.a = t2.key AND t1.b > 0 AND t2.b > t2.c`，因为 `t1.b > 0` 仅使用列来自 `t1`，而 `t2.b > t2.c` 仅使用列来自 `t2`。
但是，您可以尝试对条件如 `t1.a = t2.key AND t1.b > t2.key` 进行实验性支持，详细信息请查阅下面的部分。

:::

``` sql
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

## 带有不等式条件的 JOIN（来自不同表的列） {#join-with-inequality-conditions-for-columns-from-different-tables}

Clickhouse 目前支持具有不等式条件的 `ALL/ANY/SEMI/ANTI INNER/LEFT/RIGHT/FULL JOIN`，除了等式条件外。不等式条件仅支持 `hash` 和 `grace_hash` 连接算法。使用 `join_use_nulls` 时不支持不等式条件。

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
key1	a	1	1	2	key1	B	2	1	2
key1	a	1	1	2	key1	C	3	4	5
key1	a	1	1	2	key1	D	4	1	6
key1	b	2	3	2	key1	C	3	4	5
key1	b	2	3	2:key1:D	4	1	6
key1	c	3	2	1	key1:D	4	1	6
key1	d	4	7	2			0	0	\N
key1	e	5	5	5			0	0	\N
key2	a2	1	1	1			0	0	\N
key4	f	2	3	4			0	0	\N
```


## JOIN 键中的 NULL 值 {#null-values-in-join-keys}

NULL 不等于任何值，包括它自己。这意味着如果一个表中的 JOIN 键具有 NULL 值，它将无法与另一个表中的 NULL 值匹配。

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

注意，A 表中 `Charlie` 的行和 B 表中分数为 88 的行不在结果中，因为连接键的 NULL 值。

如果您想匹配 NULL 值，请使用 `isNotDistinctFrom` 函数来比较连接键。

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

`ASOF JOIN` 在您需要连接没有精确匹配的记录时非常有用。

算法要求表中有特定列。该列：

- 必须包含一个有序序列。
- 可以是以下任一类型: [Int, UInt](../../../sql-reference/data-types/int-uint.md)、[Float](../../../sql-reference/data-types/float.md)、[Date](../../../sql-reference/data-types/date.md)、[DateTime](../../../sql-reference/data-types/datetime.md)、[Decimal](../../../sql-reference/data-types/decimal.md)。
- 对于 `hash` 连接算法，它不能是 `JOIN` 子句中的唯一列。

语法 `ASOF JOIN ... ON`：

``` sql
SELECT expressions_list
FROM table_1
ASOF LEFT JOIN table_2
ON equi_cond AND closest_match_cond
```

您可以使用任意数量的等式条件和恰好一个最接近匹配条件。例如，`SELECT count() FROM table_1 ASOF LEFT JOIN table_2 ON table_1.a == table_2.b AND table_2.t <= table_1.t`。

支持的最接近匹配条件：`>`，`>=`，`<`，`<=`。

语法 `ASOF JOIN ... USING`：

``` sql
SELECT expressions_list
FROM table_1
ASOF JOIN table_2
USING (equi_column1, ... equi_columnN, asof_column)
```

`ASOF JOIN` 使用 `equi_columnX` 进行等价连接，使用 `asof_column` 进行最近匹配连接，条件为 `table_1.asof_column >= table_2.asof_column`。`asof_column` 列在 `USING` 子句中始终是最后一列。

例如，考虑以下表：

         table_1                           table_2
      event   | ev_time | user_id       event   | ev_time | user_id
    ----------|---------|---------- ----------|---------|----------
                  ...                               ...
    event_1_1 |  12:00  |  42         event_2_1 |  11:59  |   42
                  ...                 event_2_2 |  12:30  |   42
    event_1_2 |  13:00  |  42         event_2_3 |  13:00  |   42
                  ...                               ...

`ASOF JOIN` 可以从 `table_1` 获取用户事件的时间戳，并在 `table_2` 中查找时间戳最接近 `table_1` 中事件的时间戳的事件。等值的时间戳值是最近匹配，如果可用。这里可以使用 `user_id` 列进行等价连接，使用 `ev_time` 列进行最近匹配连接。在我们的示例中，`event_1_1` 可以与 `event_2_1` 连接，`event_1_2` 可以与 `event_2_3` 连接，但 `event_2_2` 则无法连接。

:::note
`ASOF JOIN` 仅通过 `hash` 和 `full_sorting_merge` 连接算法支持。
它 **不** 支持 [Join](../../../engines/table-engines/special/join.md) 表引擎。
:::

## PASTE JOIN 用法 {#paste-join-usage}

`PASTE JOIN` 的结果是一个表，包含从左侧子查询获取的所有列，后接从右侧子查询获取的所有列。
行是根据它们在原始表中的位置相匹配（行的顺序应被定义）。
如果子查询返回的行数不同，将剪切多余的行。

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
注意：在此情况下，如果读取是并行的，结果可能是非确定性的。示例：
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

执行涉及分布式表的连接有两种方式：

- 当使用普通的 `JOIN` 时，查询会发送到远程服务器。子查询在每个服务器上运行以生成右表，然后在此表上执行连接。换句话说，右表在每个服务器上分别形成。
- 当使用 `GLOBAL ... JOIN` 时，首先请求服务器运行子查询以计算右表。此临时表传递给每个远程服务器，并使用传输的临时数据在其上运行查询。

使用 `GLOBAL` 时请小心。有关更多信息，请查阅 [分布式子查询](/sql-reference/operators/in#distributed-subqueries) 部分。

## 隐式类型转换 {#implicit-type-conversion}

`INNER JOIN`，`LEFT JOIN`，`RIGHT JOIN` 和 `FULL JOIN` 查询支持“连接键”的隐式类型转换。但是如果左表和右表的连接键无法转换为单一类型，则查询不会执行（例如，没有数据类型可以同时容纳 `UInt64` 和 `Int64` 的所有值，或 `String` 和 `Int32`）。

**示例**

考虑表 `t_1`：
```response
┌─a─┬─b─┬─toTypeName(a)─┬─toTypeName(b)─┐
│ 1 │ 1 │ UInt16        │ UInt8         │
│ 2 │ 2 │ UInt16        │ UInt8         │
└───┴───┴───────────────┴───────────────┘
```
和表 `t_2`：
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
返回的结果集：
```response
┌──a─┬────b─┬─toTypeName(a)─┬─toTypeName(b)───┐
│  1 │    1 │ Int32         │ Nullable(Int64) │
│  2 │    2 │ Int32         │ Nullable(Int64) │
│ -1 │    1 │ Int32         │ Nullable(Int64) │
│  1 │   -1 │ Int32         │ Nullable(Int64) │
└────┴──────┴───────────────┴─────────────────┘
```

## 使用推荐 {#usage-recommendations}

### 处理空或 NULL 单元格 {#processing-of-empty-or-null-cells}

在连接表时，可能会出现空单元格。设置 [join_use_nulls](../../../operations/settings.md#join_use_nulls) 定义 ClickHouse 如何填充这些单元格。

如果 `JOIN` 键是 [Nullable](../../../sql-reference/data-types/nullable.md) 字段，则至少有一个键的值为 [NULL](/sql-reference/syntax#null) 的行不会被连接。

### 语法 {#syntax}

在 `USING` 中指定的列必须在两个子查询中具有相同的名称，其他列必须命名不同。您可以使用别名来改变子查询中列的名称。

`USING` 子句指定一个或多个用于连接的列，这建立了这些列的相等性。列列表不需要用括号括起来。不支持更复杂的连接条件。

### 语法限制 {#syntax-limitations}

对于单个 `SELECT` 查询中的多个 `JOIN` 子句：

- 仅在表连接时可通过 `*` 获取所有列，而在子查询连接时则不可以。
- 不可使用 `PREWHERE` 子句。
- 不可使用 `USING` 子句。

对于 `ON`，`WHERE` 和 `GROUP BY` 子句：

- 在 `ON`，`WHERE` 和 `GROUP BY` 子句中，无法使用任意表达式，但您可以在 `SELECT` 子句中定义一个表达式，然后通过别名在这些子句中使用它。

### 性能 {#performance}

执行 `JOIN` 时，不会针对查询的其他阶段优化执行顺序。连接（在右表中的搜索）是在 `WHERE` 过滤之前和聚合之前执行的。

每次以相同的 `JOIN` 运行查询时，子查询都会再次运行，因为结果不会被缓存。为避免这种情况，使用特殊的 [Join](../../../engines/table-engines/special/join.md) 表引擎，这是一个始终在内存中的连接准备数组。

在某些情况下，使用 [IN](../../../sql-reference/operators/in.md) 可能比 `JOIN` 更有效。

如果需要使用维度表进行连接（这些是相对较小的表，包含维度属性，例如广告活动的名称），由于每个查询都要重新访问右表，因此 `JOIN` 可能不是很方便。在这种情况下，建议使用“字典”的功能，而不是 `JOIN`。有关更多信息，请参见 [Dictionaries](../../../sql-reference/dictionaries/index.md) 部分。

### 内存限制 {#memory-limitations}

默认情况下，ClickHouse 使用 [hash join](https://en.wikipedia.org/wiki/Hash_join) 算法。ClickHouse 获取 `right_table` 并在内存中为其创建哈希表。如果启用了 `join_algorithm = 'auto'`，则在达到某个内存消耗阈值后，ClickHouse 会回退到 [merge](https://en.wikipedia.org/wiki/Sort-merge_join) 连接算法。有关 `JOIN` 算法的描述，请参见 [join_algorithm](../../../operations/settings/settings.md#join_algorithm) 设置。

如果您需要限制 `JOIN` 操作内存消耗，请使用以下设置：

- [max_rows_in_join](../../../operations/settings/query-complexity.md#settings-max_rows_in_join) — 限制哈希表中的行数。
- [max_bytes_in_join](../../../operations/settings/query-complexity.md#settings-max_bytes_in_join) — 限制哈希表的大小。

当达到任何这些限制时，ClickHouse 将按照 [join_overflow_mode](../../../operations/settings/settings.md#settings-join_overflow_mode) 设置的指示执行操作。

## 示例 {#examples}

示例：

``` sql
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

``` text
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
