---
description: '关于 IN 运算符的文档（不包括 NOT IN、GLOBAL IN 和 GLOBAL NOT IN 运算符，它们另有说明）'
slug: /sql-reference/operators/in
title: 'IN 运算符'
doc_type: 'reference'
---



# IN 运算符

由于 `IN`、`NOT IN`、`GLOBAL IN` 和 `GLOBAL NOT IN` 运算符的功能相当丰富，这里单独进行说明。

运算符左侧可以是单个列或一个元组。

示例：

```sql
SELECT UserID IN (123, 456) FROM ...
SELECT (CounterID, UserID) IN ((34, 123), (101500, 456)) FROM ...
```

如果左侧是索引中的单个列，而右侧是常量集合，系统会使用索引来处理查询。

不要显式列出过多的值（例如数百万个）。如果数据集很大，请将其放入临时表中（例如，参见[用于查询处理的外部数据](../../engines/table-engines/special/external-data.md)部分），然后使用子查询。

运算符的右侧可以是常量表达式集合、带有常量表达式的元组集合（如上面的示例所示），或者是数据库表名，或用括号括起来的 `SELECT` 子查询。

ClickHouse 允许 `IN` 子查询左侧和右侧的类型不同。
在这种情况下，它会将右侧的值转换为左侧的类型，就像对右侧应用了 [accurateCastOrNull](/sql-reference/functions/type-conversion-functions#accuratecastornullx-t) 函数一样。

这意味着数据类型会变为 [Nullable](../../sql-reference/data-types/nullable.md)，并且如果无法执行转换，则返回 [NULL](/operations/settings/formats#input_format_null_as_default)。

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

如果运算符右侧是一个表名（例如 `UserID IN users`），这等同于子查询 `UserID IN (SELECT * FROM users)`。在处理随查询一起发送的外部数据时可以使用这种方式。例如，可以将查询与一组已加载到临时表 &#39;users&#39; 中的用户 ID 一起发送，然后对其进行过滤。

如果运算符右侧是一个使用 Set 引擎的表名（始终驻留在 RAM 中的预先准备的数据集），则不会为每个查询重复创建该数据集。

子查询可以指定多个列来对元组进行过滤。

示例：

```sql
SELECT (CounterID, UserID) IN (SELECT CounterID, UserID FROM ...) FROM ...
```

`IN` 运算符左侧和右侧的列必须是相同类型。

`IN` 运算符和子查询可以出现在查询的任何部分，包括聚合函数和 lambda 函数中。
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

对于 3 月 17 日之后的每一天，统计在 3 月 17 日访问过网站的用户所产生的页面浏览量占比。
`IN` 子句中的子查询始终只会在单个服务器上执行一次。不存在相关子查询。


## NULL 处理 {#null-processing}

在请求处理过程中,`IN` 运算符假定与 [NULL](/operations/settings/formats#input_format_null_as_default) 进行运算的结果始终等于 `0`,无论 `NULL` 位于运算符的右侧还是左侧。当 [transform_null_in = 0](../../operations/settings/settings.md#transform_null_in) 时,`NULL` 值不会包含在任何数据集中,彼此之间不对应,也无法进行比较。

以下是使用 `t_null` 表的示例:

```text
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
│ 2 │    3 │
└───┴──────┘
```

运行查询 `SELECT x FROM t_null WHERE y IN (NULL,3)` 会得到以下结果:

```text
┌─x─┐
│ 2 │
└───┘
```

可以看到,`y = NULL` 的行被排除在查询结果之外。这是因为 ClickHouse 无法判断 `NULL` 是否包含在 `(NULL,3)` 集合中,因此返回 `0` 作为运算结果,`SELECT` 将此行从最终输出中排除。

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

对于带有子查询的 `IN` 运算符(类似于 `JOIN` 运算符),有两种选项:普通 `IN` / `JOIN` 和 `GLOBAL IN` / `GLOBAL JOIN`。它们在分布式查询处理的执行方式上有所不同。

:::note  
请注意,下面描述的算法可能会根据 `distributed_product_mode` [设置](../../operations/settings/settings.md)而有所不同。
:::

使用普通 `IN` 时,查询会被发送到远程服务器,每个服务器都会运行 `IN` 或 `JOIN` 子句中的子查询。

使用 `GLOBAL IN` / `GLOBAL JOIN` 时,首先会运行 `GLOBAL IN` / `GLOBAL JOIN` 的所有子查询,并将结果收集到临时表中。然后将临时表发送到每个远程服务器,在那里使用这些临时数据运行查询。

对于非分布式查询,请使用普通 `IN` / `JOIN`。

在分布式查询处理中使用 `IN` / `JOIN` 子句中的子查询时要小心。

让我们看一些示例。假设集群中的每个服务器都有一个普通的 **local_table**。每个服务器还有一个 **Distributed** 类型的 **distributed_table** 表,该表会查看集群中的所有服务器。

对于查询 **distributed_table**,查询将被发送到所有远程服务器,并在这些服务器上使用 **local_table** 运行。

例如,查询

```sql
SELECT uniq(UserID) FROM distributed_table
```

将作为以下形式发送到所有远程服务器

```sql
SELECT uniq(UserID) FROM local_table
```

并在每个服务器上并行运行,直到达到可以合并中间结果的阶段。然后中间结果将返回到请求服务器并在其上合并,最终结果将发送给客户端。

现在让我们看一个带有 `IN` 的查询:

```sql
SELECT uniq(UserID) FROM distributed_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM local_table WHERE CounterID = 34)
```

- 计算两个站点受众的交集。

此查询 将作为以下形式发送到所有远程服务器

```sql
SELECT uniq(UserID) FROM local_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM local_table WHERE CounterID = 34)
```

换句话说,`IN` 子句中的数据集将在每个服务器上独立收集,仅涵盖存储在每个服务器本地的数据。

如果您为这种情况做好了准备,并且已经在集群服务器之间分散数据,使得单个 UserID 的数据完全驻留在单个服务器上,那么这将正确且最优地工作。在这种情况下,所有必要的数据都将在每个服务器上本地可用。否则,结果将不准确。我们将这种查询变体称为"本地 IN"。

要纠正当数据随机分散在集群服务器上时查询的工作方式,您可以在子查询中指定 **distributed_table**。查询将如下所示:

```sql
SELECT uniq(UserID) FROM distributed_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM distributed_table WHERE CounterID = 34)
```

This query 将作为以下形式发送到所有远程服务器

```sql
SELECT uniq(UserID) FROM local_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM distributed_table WHERE CounterID = 34)
```

子查询将开始在每个远程服务器上运行。由于子查询使用分布式表,每个远程服务器上的子查询将作为以下形式重新发送到每个远程服务器:

```sql
SELECT UserID FROM local_table WHERE CounterID = 34
```

例如,如果您有一个包含 100 台服务器的集群,执行整个查询将需要 10,000 个基本请求,这通常被认为是不可接受的。

在这种情况下,您应该始终使用 `GLOBAL IN` 而不是 `IN`。让我们看看它如何处理查询:

```sql
SELECT uniq(UserID) FROM distributed_table WHERE CounterID = 101500 AND UserID GLOBAL IN (SELECT UserID FROM distributed_table WHERE CounterID = 34)
```

请求服务器将运行子查询:

```sql
SELECT UserID FROM distributed_table WHERE CounterID = 34
```

结果将被放入 RAM 中的临时表。然后请求将作为以下形式发送到每个远程服务器:

```sql
SELECT uniq(UserID) FROM local_table WHERE CounterID = 101500 AND UserID GLOBAL IN _data1
```

临时表 `_data1` 将与查询一起发送到每个远程服务器(临时表的名称由实现定义)。


这比使用普通的 `IN` 更优。但是,请注意以下几点:

1.  创建临时表时,数据不会去重。为了减少通过网络传输的数据量,请在子查询中指定 DISTINCT。(对于普通的 `IN` 不需要这样做。)
2.  临时表将被发送到所有远程服务器。传输不考虑网络拓扑。例如,如果 10 个远程服务器位于相对于请求服务器非常远的数据中心,数据将通过通道向远程数据中心发送 10 次。使用 `GLOBAL IN` 时尽量避免大数据集。
3.  向远程服务器传输数据时,网络带宽限制不可配置。您可能会使网络过载。
4.  尽量在服务器之间分布数据,这样您就不需要经常使用 `GLOBAL IN`。
5.  如果您需要经常使用 `GLOBAL IN`,请规划 ClickHouse 集群的位置,使单个副本组驻留在不超过一个数据中心内,并且它们之间有快速网络,这样查询可以完全在单个数据中心内处理。

在 `GLOBAL IN` 子句中指定本地表也是有意义的,以防该本地表仅在请求服务器上可用,而您想在远程服务器上使用其中的数据。

### 分布式子查询和 max_rows_in_set {#distributed-subqueries-and-max_rows_in_set}

您可以使用 [`max_rows_in_set`](/operations/settings/settings#max_rows_in_set) 和 [`max_bytes_in_set`](/operations/settings/settings#max_bytes_in_set) 来控制分布式查询期间传输的数据量。

如果 `GLOBAL IN` 查询返回大量数据,这一点尤为重要。考虑以下 SQL:

```sql
SELECT * FROM table1 WHERE col1 GLOBAL IN (SELECT col1 FROM table2 WHERE <some_predicate>)
```

如果 `some_predicate` 的选择性不够强,它将返回大量数据并导致性能问题。在这种情况下,限制通过网络传输的数据是明智的。另外,请注意 [`set_overflow_mode`](/operations/settings/settings#set_overflow_mode) 默认设置为 `throw`,这意味着当达到这些阈值时会引发异常。

### 分布式子查询和 max_parallel_replicas {#distributed-subqueries-and-max_parallel_replicas}

当 [max_parallel_replicas](#distributed-subqueries-and-max_parallel_replicas) 大于 1 时,分布式查询会进一步转换。

例如,以下查询:

```sql
SELECT CounterID, count() FROM distributed_table_1 WHERE UserID IN (SELECT UserID FROM local_table_2 WHERE CounterID < 100)
SETTINGS max_parallel_replicas=3
```

在每个服务器上转换为:

```sql
SELECT CounterID, count() FROM local_table_1 WHERE UserID IN (SELECT UserID FROM local_table_2 WHERE CounterID < 100)
SETTINGS parallel_replicas_count=3, parallel_replicas_offset=M
```

其中 `M` 在 `1` 和 `3` 之间,取决于本地查询在哪个副本上执行。

这些设置影响查询中的每个 MergeTree 系列表,其效果与在每个表上应用 `SAMPLE 1/3 OFFSET (M-1)/3` 相同。

因此,只有当两个表具有相同的复制方案并且按 UserID 或其子键采样时,添加 [max_parallel_replicas](#distributed-subqueries-and-max_parallel_replicas) 设置才会产生正确的结果。特别是,如果 `local_table_2` 没有采样键,将产生不正确的结果。同样的规则也适用于 `JOIN`。

如果 `local_table_2` 不满足要求,一种解决方法是使用 `GLOBAL IN` 或 `GLOBAL JOIN`。

如果表没有采样键,可以使用更灵活的 [parallel_replicas_custom_key](/operations/settings/settings#parallel_replicas_custom_key) 选项,这可以产生不同且更优的行为。
