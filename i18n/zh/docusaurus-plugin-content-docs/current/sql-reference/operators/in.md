---
'description': 'IN 运算符的文档，不包括 NOT IN、GLOBAL IN 和 GLOBAL NOT IN 运算符，这些运算符单独覆盖'
'slug': '/sql-reference/operators/in'
'title': 'IN 运算符'
'doc_type': 'reference'
---


# IN 操作符

`IN`、`NOT IN`、`GLOBAL IN` 和 `GLOBAL NOT IN` 操作符分别讨论，因为它们的功能相当丰富。

操作符的左侧可以是单个列或元组。

示例：

```sql
SELECT UserID IN (123, 456) FROM ...
SELECT (CounterID, UserID) IN ((34, 123), (101500, 456)) FROM ...
```

如果左侧是一个在索引中的单列，而右侧是一组常量，则系统会利用索引来处理查询。

不要显式列出过多的值（即数百万个）。如果数据集很大，请将其放入临时表中（例如，请参见[查询处理的外部数据](../../engines/table-engines/special/external-data.md)一节），然后使用子查询。

操作符的右侧可以是一组常量表达式、一组带有常量表达式的元组（如上面示例所示），或者是用括号括起来的数据库表名或`SELECT`子查询。

ClickHouse 允许 `IN` 子查询的左侧和右侧的类型不同。
在这种情况下，它将右侧的值转换为左侧的类型，就好像对右侧应用了[accurateCastOrNull](/sql-reference/functions/type-conversion-functions#accuratecastornullx-t)函数一样。

这意味着数据类型变为[Nullable](../../sql-reference/data-types/nullable.md)，如果无法进行转换，则返回[NULL](/operations/settings/formats#input_format_null_as_default)。

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

如果操作符的右侧是表的名称（例如，`UserID IN users`），这就等同于子查询`UserID IN (SELECT * FROM users)`。在处理与查询一起发送的外部数据时使用此方法。例如，查询可以与加载到“users”临时表中的用户 ID 集合一起发送，这些用户 ID 应该被过滤。

如果操作符的右侧是具有 Set 引擎的表名（一个始终在 RAM 中的数据集），该数据集将不会为每个查询重复创建。

子查询可以指定多个列以过滤元组。

示例：

```sql
SELECT (CounterID, UserID) IN (SELECT CounterID, UserID FROM ...) FROM ...
```

`IN` 操作符左侧和右侧的列应具有相同的类型。

`IN` 操作符和子查询可以出现在查询的任何部分，包括聚合函数和 lambda 函数。
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

对于 3 月 17 日之后的每一天，计算在 3 月 17 日访问了该网站的用户产生的页面浏览量的百分比。
`IN` 子句中的子查询在单个服务器上始终只运行一次。没有依赖子查询。

## NULL 处理 {#null-processing}

在请求处理过程中，`IN` 操作符假定与[NULL](/operations/settings/formats#input_format_null_as_default)的操作结果始终等于 `0`，无论 `NULL` 在操作符的右边还是左边。`NULL` 值不包含在任何数据集中，不彼此对应，也无法在[transform_null_in = 0](../../operations/settings/settings.md#transform_null_in)时进行比较。

这是一个包含 `t_null` 表的示例：

```text
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
│ 2 │    3 │
└───┴──────┘
```

运行查询 `SELECT x FROM t_null WHERE y IN (NULL,3)` 将返回以下结果：

```text
┌─x─┐
│ 2 │
└───┘
```

可以看到，其中 `y = NULL` 的行被排除在查询结果之外。这是因为 ClickHouse 无法决定 `NULL` 是否包含在 `(NULL,3)` 集合中，返回操作的结果为 `0`，因此 `SELECT` 将该行从最终输出中排除。

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

`IN` 操作符与子查询有两种选项（类似于 `JOIN` 操作符）：普通 `IN` / `JOIN` 和 `GLOBAL IN` / `GLOBAL JOIN`。它们在分布式查询处理中的运行方式不同。

:::note    
请记住，下面描述的算法可能会根据[设置](../../operations/settings/settings.md)中的`distributed_product_mode`设置而异。
:::

使用常规的 `IN` 时，查询会发送到远程服务器，每台服务器都会运行 `IN` 或 `JOIN` 子句中的子查询。

使用 `GLOBAL IN` / `GLOBAL JOIN` 时，首先对所有子查询进行 `GLOBAL IN` / `GLOBAL JOIN`，并将结果收集到临时表中。然后将临时表发送到每个远程服务器，在这些服务器上使用该临时数据运行查询。

对于非分布式查询，请使用常规的 `IN` / `JOIN`。

在分布式查询处理时，使用 `IN` / `JOIN` 子句中的子查询时请小心。

让我们看一些示例。假设集群中的每台服务器都有一个普通的 **local_table**。每台服务器还有一个 **distributed_table** 表，其类型为 **Distributed**，可以查看集群中的所有服务器。

针对 **distributed_table** 的查询将发送到所有远程服务器，并在它们上使用 **local_table**。

例如，查询

```sql
SELECT uniq(UserID) FROM distributed_table
```

将以如下格式发送到所有远程服务器

```sql
SELECT uniq(UserID) FROM local_table
```

并在每台服务器上并行运行，直到达到可以合并中间结果的阶段。然后将中间结果返回给请求者服务器并在其上合并，最终结果将发送给客户端。

现在让我们检查一个带有 `IN` 的查询：

```sql
SELECT uniq(UserID) FROM distributed_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM local_table WHERE CounterID = 34)
```

- 计算两个网站受众的交集。

该查询将以如下格式发送到所有远程服务器

```sql
SELECT uniq(UserID) FROM local_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM local_table WHERE CounterID = 34)
```

换句话说，`IN` 子句中的数据集将在每台服务器上独立收集，仅针对每台服务器本地存储的数据。

如果您已经为此情况做好准备，并且在集群服务器上分布数据，使得单个 UserID 的数据完全位于一台服务器上，则这样工作会正确且最佳。在这种情况下，所有必要的数据都会在每台服务器的本地可用。否则，结果将不准确。我们将这种查询的变体称为“本地 IN”。

为了修正查询在数据随机分布于集群服务器上的工作方式，您可以在子查询中指定 **distributed_table**。查询将如下所示：

```sql
SELECT uniq(UserID) FROM distributed_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM distributed_table WHERE CounterID = 34)
```

该查询将以如下格式发送到所有远程服务器

```sql
SELECT uniq(UserID) FROM local_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM distributed_table WHERE CounterID = 34)
```

子查询将在每个远程服务器上开始运行。由于子查询使用分布式表，因此每个远程服务器上的子查询将重新发送到每台远程服务器，如下所示：

```sql
SELECT UserID FROM local_table WHERE CounterID = 34
```

例如，如果您有一个 100 台服务器的集群，执行整个查询将需要 10,000 个基本请求，这通常被认为是不可接受的。

在这种情况下，您应该始终使用 `GLOBAL IN` 而不是 `IN`。让我们看看查询的工作原理：

```sql
SELECT uniq(UserID) FROM distributed_table WHERE CounterID = 101500 AND UserID GLOBAL IN (SELECT UserID FROM distributed_table WHERE CounterID = 34)
```

请求服务器将运行子查询：

```sql
SELECT UserID FROM distributed_table WHERE CounterID = 34
```

结果将放入 RAM 中的临时表中。然后请求将以如下格式发送到每个远程服务器：

```sql
SELECT uniq(UserID) FROM local_table WHERE CounterID = 101500 AND UserID GLOBAL IN _data1
```

临时表 `_data1` 将与查询一起发送到每台远程服务器（临时表的名称是实现定义的）。

这比使用常规的 `IN` 更具优化。但是，请记住以下几点：

1.  创建临时表时，数据不会变得唯一。为了减少通过网络传输的数据量，请在子查询中指定 DISTINCT。（对于普通的 `IN`，您不需要这样做。）
2.  临时表将发送到所有远程服务器。传输不考虑网络拓扑。例如，如果 10 台远程服务器位于与请求服务器非常偏远的数据中心，则数据将在通道上向远程数据中心发送 10 次。在使用 `GLOBAL IN` 时，尝试避免大型数据集。
3.  向远程服务器传输数据时，网络带宽的限制不可配置。您可能会导致网络过载。
4.  尝试在服务器间分配数据，以便您不需要定期使用 `GLOBAL IN`。
5.  如果您需要频繁使用 `GLOBAL IN`，请规划 ClickHouse 集群的位置，以便一组副本位于不超过一个数据中心中，并且它们之间的网络快速，这样查询可以完全在单一数据中心内处理。

在 `GLOBAL IN` 子句中指定本地表也是有意义的，如果该本地表仅在请求服务器上可用，并且您希望在远程服务器上使用该数据。

### 分布式子查询与 max_rows_in_set {#distributed-subqueries-and-max_rows_in_set}

您可以使用 [`max_rows_in_set`](/operations/settings/settings#max_rows_in_set) 和 [`max_bytes_in_set`](/operations/settings/settings#max_bytes_in_set) 来控制分布式查询期间传输的数据量。

这在 `GLOBAL IN` 查询返回大量数据时尤为重要。请考虑以下 SQL：

```sql
SELECT * FROM table1 WHERE col1 GLOBAL IN (SELECT col1 FROM table2 WHERE <some_predicate>)
```

如果 `some_predicate` 的选择性不够，它将返回大量数据并导致性能问题。在这种情况下，限制通过网络传输的数据量是明智的。此外，请注意，[`set_overflow_mode`](/operations/settings/settings#set_overflow_mode) 默认为 `throw`，这意味着达到了这些阈值时会抛出异常。

### 分布式子查询与 max_parallel_replicas {#distributed-subqueries-and-max_parallel_replicas}

当[max_parallel_replicas](#distributed-subqueries-and-max_parallel_replicas)大于 1 时，分布式查询会进一步转换。

例如，以下内容：

```sql
SELECT CounterID, count() FROM distributed_table_1 WHERE UserID IN (SELECT UserID FROM local_table_2 WHERE CounterID < 100)
SETTINGS max_parallel_replicas=3
```

在每台服务器上转换为：

```sql
SELECT CounterID, count() FROM local_table_1 WHERE UserID IN (SELECT UserID FROM local_table_2 WHERE CounterID < 100)
SETTINGS parallel_replicas_count=3, parallel_replicas_offset=M
```

其中 `M` 介于 `1` 和 `3` 之间，具体取决于本地查询在哪个副本上执行。

这些设置影响查询中的每个 MergeTree 系列表，并与对每个表应用 `SAMPLE 1/3 OFFSET (M-1)/3` 的效果相同。

因此，仅在两个表具有相同的复制方案并按 UserID 或其子键进行采样时，添加 [max_parallel_replicas](#distributed-subqueries-and-max_parallel_replicas) 设置才会产生正确的结果。特别是如果 `local_table_2` 没有采样键，将会产生不正确的结果。相同的规则适用于 `JOIN`。

如果 `local_table_2` 不满足要求，一种解决方法是使用 `GLOBAL IN` 或 `GLOBAL JOIN`。

如果表没有采样键，可以使用更灵活的选项 [parallel_replicas_custom_key](/operations/settings/settings#parallel_replicas_custom_key) 来产生不同且更优化的行为。
