---
description: 'IN 运算符（不包括 NOT IN、GLOBAL IN 和 GLOBAL NOT IN 运算符，这些在单独文档中说明）'
slug: /sql-reference/operators/in
title: 'IN 运算符'
doc_type: 'reference'
---

# IN 运算符 {#in-operators}

`IN`、`NOT IN`、`GLOBAL IN` 和 `GLOBAL NOT IN` 运算符单独介绍，因为它们的功能较为丰富。

运算符左侧可以是单个列或元组。

示例：

```sql
SELECT UserID IN (123, 456) FROM ...
SELECT (CounterID, UserID) IN ((34, 123), (101500, 456)) FROM ...
```

如果左侧是一个被索引的单个列，而右侧是一个常量集合，系统会使用该索引来处理查询。

不要显式列出过多的值（例如数百万个）。如果数据集很大，请将其放入一个临时表中（例如，参见 [External data for query processing](../../engines/table-engines/special/external-data.md) 一节），然后再使用子查询。

运算符的右侧可以是常量表达式的集合、由常量表达式构成的元组的集合（如上面的示例所示），或者是一个数据库表名，或用括号括起来的 `SELECT` 子查询。

ClickHouse 允许 `IN` 子查询左右两侧的类型不同。
在这种情况下，它会将右侧的值转换为左侧的类型，
就像在右侧应用了 [accurateCastOrNull](/sql-reference/functions/type-conversion-functions#accurateCastOrNull) 函数一样。

这意味着数据类型会变为 [Nullable](../../sql-reference/data-types/nullable.md)，并且如果无法完成转换，则返回 [NULL](/operations/settings/formats#input_format_null_as_default)。

**示例**

查询：

```sql
SELECT '1' IN (SELECT 1);
```

结果：

```text
┌─in('1', _subquery49)─┐
│                    1 │
└──────────────────────┘
```

如果运算符右侧是表名（例如 `UserID IN users`），这等价于子查询 `UserID IN (SELECT * FROM users)`。在处理随查询一同发送的外部数据时，可以使用这种方式。例如，可以将查询与一组用户 ID 一起发送，这些 ID 被加载到临时表 &#39;users&#39; 中，并需要对其进行过滤。

如果运算符右侧是使用 Set 引擎（始终驻留在 RAM 中的预先准备的数据集）的表名，则不会在每次查询时重复创建该数据集。

子查询可以指定多列来过滤元组。

示例：

```sql
SELECT (CounterID, UserID) IN (SELECT CounterID, UserID FROM ...) FROM ...
```

`IN` 运算符左侧和右侧的列必须具有相同的数据类型。

`IN` 运算符和子查询可以出现在查询语句的任何部分，包括聚合函数和 lambda 函数中。
示例：

```sql
SELECT
    EventDate,
    avg(UserID IN
    (
        SELECT UserID
        FROM test.hits
        WHERE EventDate = toDate('2014-03-17')
    )) AS ratio
FROM test.hits
GROUP BY EventDate
ORDER BY EventDate ASC
```

```text
┌──EventDate─┬────ratio─┐
│ 2014-03-17 │        1 │
│ 2014-03-18 │ 0.807696 │
│ 2014-03-19 │ 0.755406 │
│ 2014-03-20 │ 0.723218 │
│ 2014-03-21 │ 0.697021 │
│ 2014-03-22 │ 0.647851 │
│ 2014-03-23 │ 0.648416 │
└────────────┴──────────┘
```

对于 3 月 17 日之后的每一天，统计页面浏览量中来自在 3 月 17 日访问过该站点的用户的占比。
`IN` 子句中的子查询始终只会在单个服务器上执行一次。不存在相关子查询。

## NULL 处理 {#null-processing}

在请求处理过程中，`IN` 运算符假定与 [NULL](/operations/settings/formats#input_format_null_as_default) 的运算结果始终等于 `0`，无论 `NULL` 位于运算符的右侧还是左侧。如果 [transform&#95;null&#95;in = 0](../../operations/settings/settings.md#transform_null_in)，则 `NULL` 值不会包含在任何数据集中，彼此之间也不相等，且无法进行比较。

下面是使用 `t_null` 表的一个示例：

```text
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
│ 2 │    3 │
└───┴──────┘
```

运行查询 `SELECT x FROM t_null WHERE y IN (NULL,3)` 将得到以下结果：

```text
┌─x─┐
│ 2 │
└───┘
```

你可以看到，`y = NULL` 所在的行被从查询结果中剔除了。这是因为 ClickHouse 无法判断 `(NULL,3)` 这个 set 中是否包含 `NULL`，因此将该运算的结果返回为 `0`，而 `SELECT` 会将这一行从最终输出中排除。

```sql
SELECT y IN (NULL, 3)
FROM t_null
```

```text
┌─in(y, tuple(NULL, 3))─┐
│                     0 │
│                     1 │
└───────────────────────┘
```

## 分布式子查询 {#distributed-subqueries}

对于带有子查询的 `IN` 运算符（类似于 `JOIN` 运算符），有两种用法：普通的 `IN` / `JOIN` 和 `GLOBAL IN` / `GLOBAL JOIN`。它们在分布式查询处理中的执行方式不同。

:::note
请注意，下文描述的算法可能会因 [settings](../../operations/settings/settings.md) 中的 `distributed_product_mode` 设置而表现不同。
:::

当使用常规的 `IN` 时，查询会被发送到远程服务器，每个远程服务器都会在其上执行 `IN` 或 `JOIN` 子句中的子查询。

当使用 `GLOBAL IN` / `GLOBAL JOIN` 时，首先会执行所有 `GLOBAL IN` / `GLOBAL JOIN` 的子查询，并将结果收集到临时表中。然后，这些临时表被发送到每个远程服务器，在远程服务器上使用这些临时数据来执行查询。

对于非分布式查询，请使用普通的 `IN` / `JOIN`。

在分布式查询处理时，在 `IN` / `JOIN` 子句中使用子查询要格外小心。

来看一些例子。假设集群中的每台服务器都有一个普通的 **local&#95;table**。每台服务器还有一个 **Distributed** 类型的 **distributed&#95;table** 表，该表指向集群中的所有服务器。

对于发往 **distributed&#95;table** 的查询，该查询会被发送到所有远程服务器，并在这些服务器上基于 **local&#95;table** 执行。

例如，查询

```sql
SELECT uniq(UserID) FROM distributed_table
```

将以如下形式发送到所有远程服务器

```sql
SELECT uniq(UserID) FROM local_table
```

并在每个节点上并行运行，直到达到可以合并中间结果的阶段。然后中间结果会被返回到发起请求的服务器并在其上合并，最终结果将被发送给客户端。

现在让我们来看一个带有 `IN` 的查询：

```sql
SELECT uniq(UserID) FROM distributed_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM local_table WHERE CounterID = 34)
```

* 计算两个网站受众的交集。

此查询将以如下形式发送到所有远程服务器：

```sql
SELECT uniq(UserID) FROM local_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM local_table WHERE CounterID = 34)
```

换句话说，`IN` 子句中的数据集会在每台服务器上独立收集，只会基于该服务器本地存储的数据进行处理。

如果你事先为这种情况做好准备，并且在集群服务器之间分布数据，使得单个 UserID 的数据完全存放在同一台服务器上，那么该机制会正确且高效地工作。在这种情况下，每台服务器上所需的数据都可以在本地获取。否则，结果将会不准确。我们将这种形式的查询称为 “local IN”。

当数据随机分布在集群服务器上时，为了修正查询的执行方式，你可以在子查询中指定 **distributed&#95;table**。查询将如下所示：

```sql
SELECT uniq(UserID) FROM distributed_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM distributed_table WHERE CounterID = 34)
```

该查询将以如下形式发送到所有远程服务器：

```sql
SELECT uniq(UserID) FROM local_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM distributed_table WHERE CounterID = 34)
```

子查询会在每台远程服务器上开始执行。由于子查询使用了分布式表，每台远程服务器上的该子查询会被重新发送到所有远程服务器，如下所示：

```sql
SELECT UserID FROM local_table WHERE CounterID = 34
```

例如，如果你有一个包含 100 台服务器的集群，执行整个查询将需要 10,000 个基础请求，这样的开销通常是不可接受的。

在这种情况下，你应始终使用 `GLOBAL IN` 而不是 `IN`。让我们看看它在该查询中的工作方式：

```sql
SELECT uniq(UserID) FROM distributed_table WHERE CounterID = 101500 AND UserID GLOBAL IN (SELECT UserID FROM distributed_table WHERE CounterID = 34)
```

发起请求的服务器会执行该子查询：

```sql
SELECT UserID FROM distributed_table WHERE CounterID = 34
```

其结果会被放入 RAM 中的临时表。然后将请求按如下方式发送到每个远程服务器：

```sql
SELECT uniq(UserID) FROM local_table WHERE CounterID = 101500 AND UserID GLOBAL IN _data1
```

临时表 `_data1` 将随查询一起发送到每个远程服务器（临时表的名称由具体实现决定）。

这比使用普通的 `IN` 更高效，但请注意以下几点：

1. 创建临时表时，数据不会自动去重。为了减少通过网络传输的数据量，请在子查询中使用 DISTINCT。（对于普通的 `IN`，不需要这样做。）
2. 临时表会被发送到所有远程服务器。传输时不会考虑网络拓扑结构。例如，如果有 10 台远程服务器位于距离发起请求的服务器很远的数据中心，则数据会通过与该远程数据中心的网络链路被发送 10 次。在使用 `GLOBAL IN` 时，尽量避免使用大型数据集。
3. 向远程服务器传输数据时，无法对网络带宽限制进行配置，这可能会导致网络过载。
4. 尽量将数据合理分布到各个服务器上，以避免经常需要使用 `GLOBAL IN`。
5. 如果你需要频繁使用 `GLOBAL IN`，请规划 ClickHouse 集群的部署位置，使得同一组副本不跨越多个数据中心，并在它们之间使用高速网络，以便一个查询可以完全在单个数据中心内完成处理。

在 `GLOBAL IN` 子句中指定一个本地表也是有意义的，特别是在该本地表仅在发起请求的服务器上可用，而你又希望在远程服务器上使用其中数据的情况下。

### 分布式子查询和 max&#95;rows&#95;in&#95;set {#distributed-subqueries-and-max&#95;rows&#95;in&#95;set}

你可以使用 [`max_rows_in_set`](/operations/settings/settings#max_rows_in_set) 和 [`max_bytes_in_set`](/operations/settings/settings#max_bytes_in_set) 来控制在分布式查询期间传输的数据量。

如果 `GLOBAL IN` 查询返回的数据量很大，这一点尤为重要。请考虑下面的 SQL：

```sql
SELECT * FROM table1 WHERE col1 GLOBAL IN (SELECT col1 FROM table2 WHERE <some_predicate>)
```

如果 `some_predicate` 的选择性不够高，它会返回大量数据并导致性能问题。在这种情况下，限制通过网络传输的数据量是明智的做法。另请注意，[`set_overflow_mode`](/operations/settings/settings#set_overflow_mode) 默认设置为 `throw`，这意味着当达到这些阈值时会抛出异常。

### 分布式子查询与 max&#95;parallel&#95;replicas {#distributed-subqueries-and-max&#95;parallel&#95;replicas}

当 [max&#95;parallel&#95;replicas](#distributed-subqueries-and-max_parallel_replicas) 大于 1 时，分布式查询会被进一步转换。

例如，如下所示：

```sql
SELECT CounterID, count() FROM distributed_table_1 WHERE UserID IN (SELECT UserID FROM local_table_2 WHERE CounterID < 100)
SETTINGS max_parallel_replicas=3
```

在每台服务器上被转换为：

```sql
SELECT CounterID, count() FROM local_table_1 WHERE UserID IN (SELECT UserID FROM local_table_2 WHERE CounterID < 100)
SETTINGS parallel_replicas_count=3, parallel_replicas_offset=M
```

其中 `M` 的取值范围为 `1` 到 `3`，取决于本地查询正在第几个副本上执行。

这些设置会影响该查询中所有 MergeTree 系列表，并且其效果等同于在每个表上应用 `SAMPLE 1/3 OFFSET (M-1)/3`。

因此，只有在两个表具有相同的复制方案，并且都按 UserID 或其子键进行采样时，添加 [max&#95;parallel&#95;replicas](#distributed-subqueries-and-max_parallel_replicas) 设置才会产生正确的结果。尤其是，如果 `local_table_2` 没有采样键，则会产生不正确的结果。同样的规则也适用于 `JOIN`。

如果 `local_table_2` 不满足这些要求，一种变通方法是使用 `GLOBAL IN` 或 `GLOBAL JOIN`。

如果某个表没有采样键，则可以使用更灵活的 [parallel&#95;replicas&#95;custom&#95;key](/operations/settings/settings#parallel_replicas_custom_key) 选项，从而实现不同且更优的行为。
