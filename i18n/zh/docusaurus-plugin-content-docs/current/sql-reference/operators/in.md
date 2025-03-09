---
slug: /sql-reference/operators/in
---

# IN 运算符

`IN`、`NOT IN`、`GLOBAL IN` 和 `GLOBAL NOT IN` 运算符的功能相当丰富，因此需要单独介绍。

运算符的左侧要么是单个列，要么是一个元组。

示例：

``` sql
SELECT UserID IN (123, 456) FROM ...
SELECT (CounterID, UserID) IN ((34, 123), (101500, 456)) FROM ...
```

如果左侧是单个在索引中的列，右侧是一组常量，则系统将使用该索引来处理查询。

请不要显式列出过多的值（例如，数百万个）。如果数据集很大，请将其放入临时表中（例如，参见 [External data for query processing](../../engines/table-engines/special/external-data.md) 一节），然后使用子查询。

运算符的右侧可以是常量表达式的集合、一组包含常量表达式的元组（如上例所示），或者用括号括起来的数据库表名或 `SELECT` 子查询。

ClickHouse 允许 `IN` 子查询的左侧和右侧的类型不同。在这种情况下，它会将左侧的值转换为右侧的类型，就像应用了 [accurateCastOrNull](/sql-reference/functions/type-conversion-functions#accuratecastornullx-t) 函数一样。这意味着数据类型变为 [Nullable](../../sql-reference/data-types/nullable.md)，如果无法进行转换，则返回 [NULL](/operations/settings/formats#input_format_null_as_default)。

**示例**

查询：

``` sql
SELECT '1' IN (SELECT 1);
```

结果：

``` text
┌─in('1', _subquery49)─┐
│                    1 │
└──────────────────────┘
```

如果运算符的右侧是表的名称（例如，`UserID IN users`），这相当于子查询 `UserID IN (SELECT * FROM users)`。在处理与查询一起发送的外部数据时请使用这一点。例如，查询可以与加载到 'users' 临时表中的一组用户 ID 一起发送，这些用户 ID 应该被过滤。

如果运算符的右侧是具有 Set 引擎的表名（始终在 RAM 中的预准备数据集），则数据集将不会在每个查询中重新创建。

子查询可以指定多个列以过滤元组。

示例：

``` sql
SELECT (CounterID, UserID) IN (SELECT CounterID, UserID FROM ...) FROM ...
```

`IN` 运算符左侧和右侧的列应该具有相同的类型。

`IN` 运算符和子查询可以出现在查询的任何部分，包括聚合函数和 lambda 函数。
示例：

``` sql
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

``` text
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

对于 3 月 17 日之后的每一天，计算在 3 月 17 日访问过该站点的用户所产生的页面浏览量的百分比。
`IN` 子句中的子查询在单个服务器上始终只运行一次。没有从属子查询。

## NULL 处理 {#null-processing}

在请求处理期间，`IN` 运算符假设与 [NULL](/operations/settings/formats#input_format_null_as_default) 进行操作的结果始终等于 `0`，无论 `NULL` 是在运算符的右侧还是左侧。`NULL` 值不包含在任何数据集中，不相互对应，并且如果 [transform_null_in = 0](../../operations/settings/settings.md#transform_null_in)，则不能进行比较。

以下是带有 `t_null` 表的示例：

``` text
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
│ 2 │    3 │
└───┴──────┘
```

运行查询 `SELECT x FROM t_null WHERE y IN (NULL,3)` 将得到以下结果：

``` text
┌─x─┐
│ 2 │
└───┘
```

你可以看到 `y = NULL` 的行被排除在查询结果之外。这是因为 ClickHouse 无法决定 `NULL` 是否包含在 `(NULL,3)` 集中，返回 `0` 作为操作的结果，而 `SELECT` 将此行从最终输出中排除。

``` sql
SELECT y IN (NULL, 3)
FROM t_null
```

``` text
┌─in(y, tuple(NULL, 3))─┐
│                     0 │
│                     1 │
└───────────────────────┘
```

## 分布式子查询 {#distributed-subqueries}

对于带有子查询的 `IN` 运算符，有两种选择（类似于 `JOIN` 运算符）：常规的 `IN` / `JOIN` 和 `GLOBAL IN` / `GLOBAL JOIN`。它们在分布式查询处理时的运行方式有所不同。

:::note    
请记住，下面描述的算法可能会根据 [settings](../../operations/settings/settings.md) 的 `distributed_product_mode` 设置而有所不同。
:::

使用常规 `IN` 时，查询会发送到远程服务器，每个服务器都在 `IN` 或 `JOIN` 子句中运行子查询。

使用 `GLOBAL IN` / `GLOBAL JOIN` 时，首先运行所有的子查询以进行 `GLOBAL IN` / `GLOBAL JOIN`，结果收集在临时表中。然后将临时表发送到每个远程服务器，在这些服务器上使用该临时数据运行查询。

对于非分布式查询，请使用常规 `IN` / `JOIN`。

在进行分布式查询处理时，使用 `IN` / `JOIN` 子句中的子查询时要小心。

让我们看一些示例。假设集群中的每个服务器都有一个正常的 **local_table**。每个服务器也有一个 **distributed_table** 表，其类型为 **Distributed**，可查看集群中的所有服务器。

对于 **distributed_table** 的查询，查询将被发送到所有远程服务器并在它们上运行，使用 **local_table**。

例如，查询

``` sql
SELECT uniq(UserID) FROM distributed_table
```

将被发送到所有远程服务器，如下所示：

``` sql
SELECT uniq(UserID) FROM local_table
```

并在每个远程服务器上并行运行，直到达到可以合并中间结果的阶段。然后，中间结果将返回给请求服务器并在其上合并，并将最终结果发送给客户端。

现在我们检查一个带有 `IN` 的查询：

``` sql
SELECT uniq(UserID) FROM distributed_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM local_table WHERE CounterID = 34)
```

- 计算两个站点的观众交集。

此查询将被发送到所有远程服务器，如下所示：

``` sql
SELECT uniq(UserID) FROM local_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM local_table WHERE CounterID = 34)
```

换句话说，`IN` 子句中的数据集将针对每个服务器在其本地独立收集，仅跨越存储在每个服务器上的数据。

如果你为这种情况做好准备，并且根据集群服务器上的数据分布进行了合理的设置，使得单个 UserID 的数据完全位于单个服务器上，则此方法将正确且最优地工作。否则，结果将不准确。我们称这种查询方式为“本地 IN”。

为纠正查询在数据随机分布于集群服务器时的工作方式，你可以在子查询中指定 **distributed_table**。查询将如下所示：

``` sql
SELECT uniq(UserID) FROM distributed_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM distributed_table WHERE CounterID = 34)
```

此查询将被发送到所有远程服务器，如下所示：

``` sql
SELECT uniq(UserID) FROM local_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM distributed_table WHERE CounterID = 34)
```

子查询将在每个远程服务器上开始运行。由于子查询使用的是分布式表，因此每个远程服务器上的子查询将被重新发送到每个远程服务器，如下所示：

``` sql
SELECT UserID FROM local_table WHERE CounterID = 34
```

例如，如果你有一个 100 台服务器的集群，执行整个查询将需要 10,000 次基础请求，这通常被认为是不可接受的。

在这种情况下，应该始终使用 `GLOBAL IN` 而不是 `IN`。让我们看一下它如何在查询中工作：

``` sql
SELECT uniq(UserID) FROM distributed_table WHERE CounterID = 101500 AND UserID GLOBAL IN (SELECT UserID FROM distributed_table WHERE CounterID = 34)
```

请求服务器将运行子查询：

``` sql
SELECT UserID FROM distributed_table WHERE CounterID = 34
```

结果将放在 RAM 中的临时表中。然后，请求将被发送到每个远程服务器，如下所示：

``` sql
SELECT uniq(UserID) FROM local_table WHERE CounterID = 101500 AND UserID GLOBAL IN _data1
```

临时表 `_data1` 将与查询一起发送到所有远程服务器（临时表的名称是实现定义的）。

这比使用常规的 `IN` 更优化。然而，请记住以下几点：

1.  创建临时表时，数据不会变得唯一。为了减少通过网络传输的数据量，请在子查询中指定 DISTINCT。（对于常规的 `IN`，你不需要这样做。）
2.  临时表将发送到所有远程服务器。传输不考虑网络拓扑。例如，如果 10 台远程服务器位于与请求服务器非常遥远的数据中心，则数据会通过通道发送 10 次到远程数据中心。在使用 `GLOBAL IN` 时，请尽量避免大数据集。
3.  在将数据传输到远程服务器时，网络带宽限制是不可配置的。你可能会使网络超负荷。
4.  请尽量在服务器之间分配数据，以便不需要定期使用 `GLOBAL IN`。
5.  如果你需要频繁使用 `GLOBAL IN`，请规划 ClickHouse 集群的位置，使得单个副本组位于不超过一个数据中心，并在它们之间拥有快速网络，以便查询能够完全在单个数据中心内处理。

在 `GLOBAL IN` 子句中指定一个本地表也是有意义的，以防该本地表仅在请求服务器上可用，而你想在远程服务器上使用其数据。

### 分布式子查询和 max_rows_in_set {#distributed-subqueries-and-max_rows_in_set}

你可以使用 [`max_rows_in_set`](../../operations/settings/query-complexity.md#max-rows-in-set) 和 [`max_bytes_in_set`](../../operations/settings/query-complexity.md#max-rows-in-set) 来控制在分布式查询过程中传输的数据量。

这在 `GLOBAL IN` 查询返回大量数据时显得尤为重要。考虑以下 SQL：

```sql
select * from table1 where col1 global in (select col1 from table2 where <some_predicate>)
```

如果 `some_predicate` 不够选择性，则会返回大量数据并导致性能问题。在这种情况下，明智的做法是限制通过网络的数据传输。此外，请注意 [`set_overflow_mode`](/operations/settings/settings#set_overflow_mode) 默认设置为 `throw`，这意味着当触发这些阈值时，会引发异常。

### 分布式子查询和 max_parallel_replicas {#distributed-subqueries-and-max_parallel_replicas}

当 [max_parallel_replicas](#distributed-subqueries-and-max_parallel_replicas) 大于 1 时，分布式查询会进一步转换。

例如，以下查询：

```sql
SELECT CounterID, count() FROM distributed_table_1 WHERE UserID IN (SELECT UserID FROM local_table_2 WHERE CounterID < 100)
SETTINGS max_parallel_replicas=3
```

将在每个服务器上转换为：

```sql
SELECT CounterID, count() FROM local_table_1 WHERE UserID IN (SELECT UserID FROM local_table_2 WHERE CounterID < 100)
SETTINGS parallel_replicas_count=3, parallel_replicas_offset=M
```

其中 `M` 在 `1` 和 `3` 之间，具体取决于本地查询正在执行的副本。

这些设置会影响查询中的每个 MergeTree 家族表，并产生与在每个表上应用 `SAMPLE 1/3 OFFSET (M-1)/3` 的相同效果。

因此，添加 [max_parallel_replicas](#distributed-subqueries-and-max_parallel_replicas) 设置仅在两个表具有相同复制方案并按 UserID 或其子键进行采样时才会产生正确结果。特别是，如果 `local_table_2` 没有采样键，则将产生不正确的结果。此规则同样适用于 `JOIN`。

如果 `local_table_2` 不满足要求，可以使用 `GLOBAL IN` 或 `GLOBAL JOIN` 作为解决方法。

如果表没有采样键，则可以使用更灵活的 [parallel_replicas_custom_key](/operations/settings/settings#parallel_replicas_custom_key) 选项，以获得不同且更优化的行为。
