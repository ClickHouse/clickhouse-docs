---
description: 'IN 运算符的文档，不包括 NOT IN、GLOBAL IN 和 GLOBAL NOT IN 运算符（这些运算符在单独的文档中说明）'
slug: /sql-reference/operators/in
title: 'IN 运算符'
doc_type: 'reference'
---

# IN 运算符 {#in-operators}

由于 `IN`、`NOT IN`、`GLOBAL IN` 和 `GLOBAL NOT IN` 运算符的功能相当丰富，这里单独进行说明。

运算符左侧可以是单个列，也可以是一个元组。

示例：

```sql
SELECT UserID IN (123, 456) FROM ...
SELECT (CounterID, UserID) IN ((34, 123), (101500, 456)) FROM ...
```

如果左侧是索引中的单个列，而右侧是一组常量，系统会使用索引来处理查询。

不要显式列出过多的值（例如数百万个）。如果数据集很大，请将其放入临时表中（例如，参见 [External data for query processing](../../engines/table-engines/special/external-data.md) 章节），然后使用子查询。

运算符右侧可以是一组常量表达式、一组包含常量表达式的元组（如上面的示例所示），或者是数据库表名，或用括号括起来的 `SELECT` 子查询。

ClickHouse 允许 `IN` 子查询的左右两部分类型不同。
在这种情况下，它会将右侧的值转换为左侧的类型，就像对右侧应用了 [accurateCastOrNull](/sql-reference/functions/type-conversion-functions#accuratecastornullx-t) 函数一样。

这意味着数据类型会变为 [Nullable](../../sql-reference/data-types/nullable.md)，如果无法执行转换，则返回 [NULL](/operations/settings/formats#input_format_null_as_default)。

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

如果运算符右侧是一个表名（例如 `UserID IN users`），则等价于子查询 `UserID IN (SELECT * FROM users)`。在处理随查询一同发送的外部数据时，可以使用这种方式。例如，可以将查询与一组已加载到临时表 &#39;users&#39; 中的用户 ID 一起发送，然后对其进行过滤。

如果运算符右侧是一个使用 Set 引擎的表名（一个始终驻留在 RAM 中的预先准备的数据集），则不会为每个查询重复创建该数据集。

子查询可以指定多列用于过滤元组。

示例：

```sql
SELECT (CounterID, UserID) IN (SELECT CounterID, UserID FROM ...) FROM ...
```

`IN` 运算符左右两侧的列必须具有相同的类型。

`IN` 运算符和子查询可以出现在查询的任何位置，包括聚合函数和 lambda 函数中。
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

对于 3 月 17 日之后的每一天，统计在 3 月 17 日访问过站点的用户所产生的页面浏览量占比。

`IN` 子句中的子查询始终只在单个服务器上执行一次。不存在相关子查询。

## NULL 处理 {#null-processing}

在请求处理期间，`IN` 运算符会将任何与 [NULL](/operations/settings/formats#input_format_null_as_default) 的运算结果一律视为 `0`，无论 `NULL` 位于运算符的左侧还是右侧。在 [transform&#95;null&#95;in = 0](../../operations/settings/settings.md#transform_null_in) 的情况下，`NULL` 值不会包含在任何数据集中，彼此不相等，也无法进行比较。

下面是一个使用 `t_null` 表的示例：

```text
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
│ 2 │    3 │
└───┴──────┘
```

运行查询 `SELECT x FROM t_null WHERE y IN (NULL,3)` 会得到如下结果：

```text
┌─x─┐
│ 2 │
└───┘
```

可以看到，其中 `y = NULL` 的那一行被排除在查询结果之外。原因在于 ClickHouse 无法确定 `NULL` 是否属于 `(NULL,3)` 这个集合，因此该运算的结果为 `0`，而 `SELECT` 会将这一行从最终输出中排除。

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

:::note\
请注意，下文所描述的算法，其行为可能会根据 [settings](../../operations/settings/settings.md) 中的 `distributed_product_mode` 设置而有所不同。
:::

使用普通的 `IN` 时，查询会被发送到远程服务器，并且每个远程服务器都会在本地执行 `IN` 或 `JOIN` 子句中的子查询。

使用 `GLOBAL IN` / `GLOBAL JOIN` 时，会先执行所有对应的子查询，并将结果收集到临时表中。然后，这些临时表会被发送到每个远程服务器，在这些服务器上基于这些临时数据来执行查询。

对于非分布式查询，请使用普通的 `IN` / `JOIN`。

在进行分布式查询处理时，在 `IN` / `JOIN` 子句中使用子查询时要特别小心。

我们来看一些示例。假设集群中的每台服务器上都有一个普通的 **local&#95;table**。每台服务器还有一个类型为 **Distributed** 的 **distributed&#95;table** 表，该表指向集群中的所有服务器。

对于针对 **distributed&#95;table** 的查询，该查询会被发送到所有远程服务器，并在它们上基于 **local&#95;table** 来执行。

例如，查询

```sql
SELECT uniq(UserID) FROM distributed_table
```

将以如下形式发送到所有远程服务器

```sql
SELECT uniq(UserID) FROM local_table
```

并在每个服务器上并行执行，直到到达可以合并中间结果的阶段。然后这些中间结果会被返回到发起请求的服务器并在其上合并，最终结果再发送给客户端。

现在让我们来看一个带有 `IN` 的查询：

```sql
SELECT uniq(UserID) FROM distributed_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM local_table WHERE CounterID = 34)
```

* 计算两个网站受众的交集。

此查询将以如下形式发送到所有远程服务器：

```sql
SELECT uniq(UserID) FROM local_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM local_table WHERE CounterID = 34)
```

换句话说，`IN` 子句中的数据集会在每台服务器上各自独立收集，只会基于该服务器本地存储的数据进行处理。

如果你在设计时就考虑到了这种情况，并在集群服务器之间合理分布数据，使得单个 UserID 的所有数据都完全位于同一台服务器上，那么查询将能正确且高效地工作。在这种情况下，每台服务器本地都能访问到所有所需数据。否则，查询结果将会不准确。我们将这种查询变体称为「local IN」。

要在数据随机分布在集群服务器上的情况下修正查询行为，你可以在子查询中使用 **distributed&#95;table**。查询将如下所示：

```sql
SELECT uniq(UserID) FROM distributed_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM distributed_table WHERE CounterID = 34)
```

此查询将以以下形式发送到所有远程服务器：

```sql
SELECT uniq(UserID) FROM local_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM distributed_table WHERE CounterID = 34)
```

该子查询会在每个远程服务器上开始运行。由于该子查询使用了分布式表，位于各个远程服务器上的子查询会再次被转发到所有远程服务器，如下所示：

```sql
SELECT UserID FROM local_table WHERE CounterID = 34
```

例如，如果你有一个由 100 台服务器组成的集群，执行整个查询将会产生 10,000 个基本请求，这在一般情况下是不可接受的。

在这种情况下，你应始终使用 `GLOBAL IN` 而不是 `IN`。让我们看看它在以下查询中的工作方式：

```sql
SELECT uniq(UserID) FROM distributed_table WHERE CounterID = 101500 AND UserID GLOBAL IN (SELECT UserID FROM distributed_table WHERE CounterID = 34)
```

发出请求的服务器将运行该子查询：

```sql
SELECT UserID FROM distributed_table WHERE CounterID = 34
```

结果会被写入内存（RAM）中的临时表。然后将如下所示的请求发送到每个远程服务器：

```sql
SELECT uniq(UserID) FROM local_table WHERE CounterID = 101500 AND UserID GLOBAL IN _data1
```

临时表 `_data1` 会随查询一起发送到每个远程服务器（临时表的名称取决于具体实现）。

这比使用普通的 `IN` 更高效。但请注意以下几点：

1. 在创建临时表时，数据不会被去重。为减少通过网络传输的数据量，请在子查询中使用 DISTINCT。（对于普通的 `IN`，不需要这样做。）
2. 临时表会被发送到所有远程服务器，传输过程不会考虑网络拓扑结构。例如，如果有 10 台远程服务器位于一个相对于请求方服务器非常偏远的数据中心中，那么数据会通过到该远程数据中心的链路被发送 10 次。在使用 `GLOBAL IN` 时，请尽量避免大型数据集。
3. 在向远程服务器传输数据时，网络带宽限制不可配置，可能会导致网络过载。
4. 尽量将数据合理地分布在各个服务器上，从而避免经常需要使用 `GLOBAL IN`。
5. 如果需要频繁使用 `GLOBAL IN`，请合理规划 ClickHouse 集群的部署位置，使同一组副本不跨越多个数据中心，并在它们之间部署高速网络，以便查询可以完全在单个数据中心内完成处理。

在 `GLOBAL IN` 子句中指定一个本地表也是有意义的，前提是该本地表仅在请求方服务器上可用，而希望在远程服务器上使用其中的数据。

### Distributed Subqueries and max&#95;rows&#95;in&#95;set {#distributed-subqueries-and-max&#95;rows&#95;in&#95;set}

可以使用 [`max_rows_in_set`](/operations/settings/settings#max_rows_in_set) 和 [`max_bytes_in_set`](/operations/settings/settings#max_bytes_in_set) 来控制在分布式查询期间传输的数据量。

如果 `GLOBAL IN` 查询返回的数据量很大，这一点尤其重要。请参考下面的 SQL 示例：

```sql
SELECT * FROM table1 WHERE col1 GLOBAL IN (SELECT col1 FROM table2 WHERE <某个谓词条件>)
```

如果 `some_predicate` 的选择性不够高，它将返回大量数据并导致性能问题。在这种情况下，应尽量减少通过网络传输的数据量。此外，请注意，[`set_overflow_mode`](/operations/settings/settings#set_overflow_mode) 默认为 `throw`，这意味着当达到这些阈值时会抛出异常。

### 分布式子查询和 max&#95;parallel&#95;replicas {#distributed-subqueries-and-max&#95;parallel&#95;replicas}

当 [max&#95;parallel&#95;replicas](#distributed-subqueries-and-max_parallel_replicas) 大于 1 时，分布式查询会被进一步重写。

例如：

```sql
SELECT CounterID, count() FROM distributed_table_1 WHERE UserID IN (SELECT UserID FROM local_table_2 WHERE CounterID < 100)
SETTINGS max_parallel_replicas=3
```

在每台服务器上会被转换为：

```sql
SELECT CounterID, count() FROM local_table_1 WHERE UserID IN (SELECT UserID FROM local_table_2 WHERE CounterID < 100)
SETTINGS parallel_replicas_count=3, parallel_replicas_offset=M
```

其中 `M` 在 `1` 到 `3` 之间，取决于本地查询正在其上执行的副本。

这些设置会影响查询中所有 MergeTree 系列表，并且其效果等同于对每个表应用 `SAMPLE 1/3 OFFSET (M-1)/3`。

因此，仅当两个表具有相同的复制方案，并且按 UserID 或其子键进行采样时，添加 [max&#95;parallel&#95;replicas](#distributed-subqueries-and-max_parallel_replicas) 设置才会产生正确结果。特别是，如果 `local_table_2` 没有采样键，将会产生不正确的结果。同样的规则也适用于 `JOIN`。

如果 `local_table_2` 不满足这些要求，一种变通方法是使用 `GLOBAL IN` 或 `GLOBAL JOIN`。

如果一个表没有采样键，可以使用 [parallel&#95;replicas&#95;custom&#95;key](/operations/settings/settings#parallel_replicas_custom_key) 中更灵活的选项，以获得不同且更优的执行效果。
