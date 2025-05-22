---
'description': 'JOIN 子句的文档'
'sidebar_label': 'JOIN'
'slug': '/sql-reference/statements/select/join'
'title': 'JOIN 子句'
---


# JOIN子句

`JOIN`子句通过使用各表中共同的值结合一个或多个表的列来生成新表。这是一种在支持SQL的数据库中常见的操作，对应于[关系代数](https://en.wikipedia.org/wiki/Relational_algebra#Joins_and_join-like_operators)的连接。单表连接的特例通常称为“自连接”。

**语法**

```sql
SELECT <expr_list>
FROM <left_table>
[GLOBAL] [INNER|LEFT|RIGHT|FULL|CROSS] [OUTER|SEMI|ANTI|ANY|ALL|ASOF] JOIN <right_table>
(ON <expr_list>)|(USING <column_list>) ...
```

`ON`子句中的表达式和`USING`子句中的列称为“连接键”。除非另有说明，`JOIN`会从具有匹配“连接键”的行中产生一个[笛卡尔积](https://en.wikipedia.org/wiki/Cartesian_product)，这可能导致结果的行数远远超过源表的行数。

## 支持的JOIN类型 {#supported-types-of-join}

支持所有标准的[SQL JOIN](https://en.wikipedia.org/wiki/Join_(SQL))类型：

| 类型                   | 描述                                                                       |
|------------------------|---------------------------------------------------------------------------|
| `INNER JOIN`           | 仅返回匹配的行。                                                            |
| `LEFT OUTER JOIN`      | 返回左表中非匹配的行以及匹配的行。                                          |
| `RIGHT OUTER JOIN`     | 返回右表中非匹配的行以及匹配的行。                                          |
| `FULL OUTER JOIN`      | 返回两个表中非匹配的行以及匹配的行。                                        |
| `CROSS JOIN`           | 产生两个表的笛卡尔积，**不**指定“连接键”。                                 |

- 未指定类型的`JOIN`默认为`INNER`。
- 关键字`OUTER`可以安全省略。
- `CROSS JOIN`的替代语法是使用逗号分隔的多个表在[`FROM`子句](../../../sql-reference/statements/select/from.md)中指定。

ClickHouse中可用的其他连接类型有：

| 类型                                         | 描述                                                                                                           |
|----------------------------------------------|------------------------------------------------------------------------------------------------------------------|
| `LEFT SEMI JOIN`，`RIGHT SEMI JOIN`       | 仅允许“连接键”的白名单，而不产生笛卡尔积。                                                                          |
| `LEFT ANTI JOIN`，`RIGHT ANTI JOIN`       | 针对“连接键”的黑名单，而不产生笛卡尔积。                                                                          |
| `LEFT ANY JOIN`，`RIGHT ANY JOIN`，`INNER ANY JOIN` | 部分（对于`LEFT`和`RIGHT`的对立面）或完全（对于`INNER`和`FULL`）禁用标准`JOIN`类型的笛卡尔积。          |
| `ASOF JOIN`，`LEFT ASOF JOIN`             | 使用非精确匹配连接序列。`ASOF JOIN`的用法如下所述。                                                             |
| `PASTE JOIN`                               | 对两个表执行水平连接。                                                                                          |

:::note
当[join_algorithm](../../../operations/settings/settings.md#join_algorithm)设置为`partial_merge`时，仅支持`RIGHT JOIN`和`FULL JOIN`，并且仅在`ALL`严格性下（`SEMI`、`ANTI`、`ANY`和`ASOF`不受支持）。
:::

## 设置 {#settings}

可以使用[`join_default_strictness`](../../../operations/settings/settings.md#join_default_strictness)设置覆盖默认的连接类型。

ClickHouse服务器对于`ANY JOIN`操作的行为取决于[`any_join_distinct_right_table_keys`](../../../operations/settings/settings.md#any_join_distinct_right_table_keys)设置。

**另见**

- [`join_algorithm`](../../../operations/settings/settings.md#join_algorithm)
- [`join_any_take_last_row`](../../../operations/settings/settings.md#join_any_take_last_row)
- [`join_use_nulls`](../../../operations/settings/settings.md#join_use_nulls)
- [`partial_merge_join_rows_in_right_blocks`](../../../operations/settings/settings.md#partial_merge_join_rows_in_right_blocks)
- [`join_on_disk_max_files_to_merge`](../../../operations/settings/settings.md#join_on_disk_max_files_to_merge)
- [`any_join_distinct_right_table_keys`](../../../operations/settings/settings.md#any_join_distinct_right_table_keys)

使用`cross_to_inner_join_rewrite`设置定义当ClickHouse无法将`CROSS JOIN`重写为`INNER JOIN`时的行为。默认值为`1`，允许连接继续，但会更慢。如果希望抛出错误，请将`cross_to_inner_join_rewrite`设置为`0`，将其设置为`2`将不运行交叉连接，而是强制重写所有逗号/交叉连接。如果在值为`2`时重写失败，您将收到一条错误消息，说明“请尝试简化`WHERE`部分”。

## ON部分条件 {#on-section-conditions}

`ON`部分可以包含多个通过`AND`和`OR`运算符组合的条件。指定连接键的条件必须：
- 引用左表和右表
- 使用等式运算符

其他条件可以使用其他逻辑运算符，但必须引用查询的左表或右表。

如果满足整个复杂条件，则行被连接。如果条件不满足，则根据`JOIN`类型，行仍可能包含在结果中。请注意，如果相同的条件放置在`WHERE`部分且没有满足，则行将始终从结果中过滤掉。

`ON`子句中的`OR`运算符使用哈希连接算法——对于每个带有`JOIN`的连接键的`OR`参数，会创建一个单独的哈希表，因此内存消耗和查询执行时间随着`ON`子句中表达式`OR`数量的增加而线性增长。

:::note
如果条件引用来自不同表的列，则目前仅支持等值运算符（`=`）。
:::

**示例**

考虑`table_1`和`table_2`：

```response
┌─Id─┬─name─┐     ┌─Id─┬─text───────────┬─scores─┐
│  1 │ A    │     │  1 │ Text A         │     10 │
│  2 │ B    │     │  1 │ Another text A │     12 │
│  3 │ C    │     │  2 │ Text B         │     15 │
└────┴──────┘     └────┴────────────────┴────────┘
```

包含一个连接键条件和一个对`table_2`的附加条件的查询：

```sql
SELECT name, text FROM table_1 LEFT OUTER JOIN table_2
    ON table_1.Id = table_2.Id AND startsWith(table_2.text, 'Text');
```

请注意，结果中包含名字为`C`且文本列为空的行。由于使用了`OUTER`类型的连接，因此它被包含在结果中。

```response
┌─name─┬─text───┐
│ A    │ Text A │
│ B    │ Text B │
│ C    │        │
└──────┴────────┘
```

使用`INNER`类型连接和多个条件的查询：

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
使用`INNER`类型连接和带有`OR`条件的查询：

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

使用`INNER`类型连接和带有`OR`和`AND`条件的查询：

:::note

默认情况下，非相等条件是支持的，只要它们使用同一表中的列。
例如，`t1.a = t2.key AND t1.b > 0 AND t2.b > t2.c`，因为`t1.b > 0`仅使用`t1`中的列，而`t2.b > t2.c`仅使用`t2`中的列。
但是，您可以尝试实验性支持条件，例如`t1.a = t2.key AND t1.b > t2.key`，请查看下面的部分以获取更多详细信息。

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

## 带有不同表的列的不等式条件的JOIN {#join-with-inequality-conditions-for-columns-from-different-tables}

Clickhouse当前支持`ALL/ANY/SEMI/ANTI INNER/LEFT/RIGHT/FULL JOIN`，并使用不等式条件以补充等式条件。不等式条件仅支持`hash`和`grace_hash`连接算法。使用`join_use_nulls`时不支持不等式条件。

**示例**

表`t1`：

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

表`t2`

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


## JOIN键中的NULL值 {#null-values-in-join-keys}

`NULL`不等于任何值，包括它自己。这意味着如果一个`JOIN`键在一个表中有`NULL`值，它将与另一个表中的`NULL`值不匹配。

**示例**

表`A`：

```response
┌───id─┬─name────┐
│    1 │ Alice   │
│    2 │ Bob     │
│ ᴺᵁᴸᴸ │ Charlie │
└──────┴─────────┘
```

表`B`：

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

请注意，表`A`中的`Charlie`行和表`B`中的得分为88的行未出现在结果中，因为`JOIN`键中有`NULL`值。

如果您想匹配`NULL`值，可以使用`isNotDistinctFrom`函数比较`JOIN`键。

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

## ASOF JOIN用法 {#asof-join-usage}

`ASOF JOIN`在您需要连接没有精确匹配的记录时非常有用。

此JOIN算法在表中需要一个特殊列。该列：

- 必须包含一个有序序列。
- 可以是以下类型之一：[Int, UInt](../../../sql-reference/data-types/int-uint.md)、[Float](../../../sql-reference/data-types/float.md)、[Date](../../../sql-reference/data-types/date.md)、[DateTime](../../../sql-reference/data-types/datetime.md)、[Decimal](../../../sql-reference/data-types/decimal.md)。
- 对于`hash`连接算法，它不能是`JOIN`子句中唯一的列。

语法`ASOF JOIN ... ON`：

```sql
SELECT expressions_list
FROM table_1
ASOF LEFT JOIN table_2
ON equi_cond AND closest_match_cond
```

您可以使用任意数量的等式条件和恰好一个最近匹配条件。例如，`SELECT count() FROM table_1 ASOF LEFT JOIN table_2 ON table_1.a == table_2.b AND table_2.t <= table_1.t`。

最近匹配支持的条件：`>`、`>=`、`<`、`<=`。

语法`ASOF JOIN ... USING`：

```sql
SELECT expressions_list
FROM table_1
ASOF JOIN table_2
USING (equi_column1, ... equi_columnN, asof_column)
```

`ASOF JOIN`使用`equi_columnX`进行等式连接，使用`asof_column`进行最近匹配连接，条件为`table_1.asof_column >= table_2.asof_column`。`asof_column`列始终是在`USING`子句中的最后一个列。

例如，考虑下面的表：

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

`ASOF JOIN`可以从`table_1`获取用户事件的时间戳，并找到`table_2`中时间戳最接近于来自`table_1`的事件时间戳的事件，满足最近匹配条件。如果可用，相等的时间戳值就是最近的。在我们的例子中，`event_1_1`可以与`event_2_1`连接，`event_1_2`可以与`event_2_3`连接，但`event_2_2`无法连接。

:::note
`ASOF JOIN`仅支持`hash`和`full_sorting_merge`连接算法。
不支持[Join](../../../engines/table-engines/special/join.md)表引擎。
:::

## PASTE JOIN用法 {#paste-join-usage}

`PASTE JOIN`的结果是一个包含左侧子查询所有列的表，随后是右侧子查询的所有列。
根据原始表中的位置匹配行（行的顺序应该被定义）。
如果子查询返回不同数量的行，则多余的行会被截断。

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

注意：在这种情况下，如果读取是并行的，结果可能是不确定的。例如：

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

## 分布式JOIN {#distributed-join}

涉及分布式表的JOIN有两种执行方式：

- 当使用普通的`JOIN`时，查询被发送到远程服务器。在每个服务器上运行子查询以生成右表，连接在此表上执行。换句话说，右表在每个服务器上单独生成。
- 当使用`GLOBAL ... JOIN`时，请求服务器首先运行一个子查询来计算右表。此临时表被传递到每个远程服务器，在它们上使用传输的临时数据运行查询。

使用`GLOBAL`时要小心。有关更多信息，请参见[分布式子查询](/sql-reference/operators/in#distributed-subqueries)部分。

## 隐式类型转换 {#implicit-type-conversion}

`INNER JOIN`、`LEFT JOIN`、`RIGHT JOIN`和`FULL JOIN`查询支持“连接键”的隐式类型转换。但是，如果左表和右表中的连接键无法转换为单一类型，则无法执行查询（例如，不能有数据类型可以同时容纳所有来自`UInt64`和`Int64`的值，或 `String`和`Int32`）。

**示例**

考虑表`t_1`：
```response
┌─a─┬─b─┬─toTypeName(a)─┬─toTypeName(b)─┐
│ 1 │ 1 │ UInt16        │ UInt8         │
│ 2 │ 2 │ UInt16        │ UInt8         │
└───┴───┴───────────────┴───────────────┘
```
以及表`t_2`：
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

### 处理空或NULL单元格 {#processing-of-empty-or-null-cells}

在连接表时，可能会出现空单元格。[join_use_nulls](../../../operations/settings/settings.md#join_use_nulls)设置定义了ClickHouse如何填充这些单元格。

如果`JOIN`键是[Nullable](../../../sql-reference/data-types/nullable.md)字段，则至少有一个键的值为[NULL](/sql-reference/syntax#null)的行不会连接。

### 语法 {#syntax}

在`USING`中指定的列在两个子查询中必须具有相同的名称，其他列必须命名不同。您可以使用别名更改子查询中的列名。

`USING`子句指定一个或多个要连接的列，从而建立这些列的相等性。列列表未用括号括起来。不支持更复杂的连接条件。

### 语法限制 {#syntax-limitations}

对于单个`SELECT`查询中的多个`JOIN`子句：

- 只有在连接表时才能通过`*`获取所有列，而不是子查询。
- `PREWHERE`子句不可用。
- `USING`子句不可用。

对于`ON`、`WHERE`和`GROUP BY`子句：

- 在`ON`、`WHERE`和`GROUP BY`子句中不能使用任意表达式，但是您可以在`SELECT`子句中定义表达式，然后通过别名在这些子句中使用它。

### 性能 {#performance}

在执行`JOIN`时，查询执行的顺序不会相对于查询的其他阶段进行优化。连接（在右表中搜索）在`WHERE`中的过滤之前执行，并且在聚合之前执行。

每次使用相同`JOIN`运行查询时，子查询会再次运行，因为结果不会被缓存。为避免这种情况，使用特殊的[Join](../../../engines/table-engines/special/join.md)表引擎，这是一个始终在RAM中的准备好的用于连接的数组。

在某些情况下，使用[IN](../../../sql-reference/operators/in.md)可能比`JOIN`更有效。

如果您需要一个用于与维度表连接的`JOIN`（这些表相对较小，包含维度属性，如广告活动的名称），由于右表在每个查询中都被重新访问，`JOIN`可能不太方便。对于这种情况，您应该使用“字典”功能，而不是`JOIN`。有关更多信息，请参见[字典](../../../sql-reference/dictionaries/index.md)部分。

### 内存限制 {#memory-limitations}

默认情况下，ClickHouse使用[哈希连接](https://en.wikipedia.org/wiki/Hash_join)算法。ClickHouse取右表并在RAM中为其创建哈希表。如果启用`join_algorithm = 'auto'`，那么在某些内存消耗阈值后，ClickHouse将回退到[归并](https://en.wikipedia.org/wiki/Sort-merge_join)连接算法。有关`JOIN`算法的描述，请参见[join_algorithm](../../../operations/settings/settings.md#join_algorithm)设置。

如果您需要限制`JOIN`操作的内存消耗，请使用以下设置：

- [max_rows_in_join](/operations/settings/settings#max_rows_in_join) — 限制哈希表中的行数。
- [max_bytes_in_join](/operations/settings/settings#max_bytes_in_join) — 限制哈希表的大小。

达到这些限制中的任何一个时，ClickHouse将按照[join_overflow_mode](/operations/settings/settings.md#join_overflow_mode)设置指示的方式进行处理。

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

- 博客：[ClickHouse: 一个快速的DBMS，完全支持SQL连接 - 第1部分](https://clickhouse.com/blog/clickhouse-fully-supports-joins)
- 博客：[ClickHouse: 一个快速的DBMS，完全支持SQL连接 - 细节分析 - 第2部分](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2)
- 博客：[ClickHouse: 一个快速的DBMS，完全支持SQL连接 - 细节分析 - 第3部分](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3)
- 博客：[ClickHouse: 一个快速的DBMS，完全支持SQL连接 - 细节分析 - 第4部分](https://clickhouse.com/blog/clickhouse-fully-supports-joins-direct-join-part4)
