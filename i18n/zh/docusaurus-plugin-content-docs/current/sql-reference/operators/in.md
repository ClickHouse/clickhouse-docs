
# IN 操作符

`IN`、`NOT IN`、`GLOBAL IN` 和 `GLOBAL NOT IN` 操作符将单独介绍，因为它们的功能相当丰富。

操作符的左侧可以是单个列或一个元组。

示例：

```sql
SELECT UserID IN (123, 456) FROM ...
SELECT (CounterID, UserID) IN ((34, 123), (101500, 456)) FROM ...
```

如果左侧是一个在索引中的单个列，而右侧是一组常量，系统会使用索引来处理查询。

不要显式列出太多的值（即百万）。如果数据集很大，请将其放入临时表中（例如，参见 [查询处理的外部数据](../../engines/table-engines/special/external-data.md) 一节），然后使用子查询。

操作符的右侧可以是一组常量表达式、一组带有常量表达式的元组（如上述示例所示），或包含数据库表名称或带括号的 `SELECT` 子查询的名称。

ClickHouse 允许 `IN` 子查询左右部分的类型不同。在这种情况下，它会将右侧值转换为左侧的类型，就像将 [accurateCastOrNull](/sql-reference/functions/type-conversion-functions#accuratecastornullx-t) 函数应用于右侧一样。

这意味着数据类型将变为 [Nullable](../../sql-reference/data-types/nullable.md)，如果无法进行转换，则返回 [NULL](/operations/settings/formats#input_format_null_as_default)。

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

如果操作符的右侧是表的名称（例如，`UserID IN users`），这相当于子查询 `UserID IN (SELECT * FROM users)`。在处理与查询一起发送的外部数据时使用此功能。例如，可以将查询与一组加载到 'users' 临时表中的用户 ID 一起发送，以便进行过滤。

如果操作符的右侧是具有 Set 引擎的表名（始终在内存中的准备数据集），则该数据集不会为每个查询重新创建。

子查询可以为过滤元组指定多个列。

示例：

```sql
SELECT (CounterID, UserID) IN (SELECT CounterID, UserID FROM ...) FROM ...
```

`IN` 操作符左右两侧的列应具有相同的类型。

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

在 3 月 17 日之后的每一天，计算在 3 月 17 日访问过该站点的用户所做的页面浏览量的百分比。
`IN` 子句中的子查询总是只在单个服务器上运行一次。没有依赖子查询。

## NULL 处理 {#null-processing}

在请求处理中，`IN` 操作符假定与 [NULL](/operations/settings/formats#input_format_null_as_default) 的操作结果始终等于 `0`，无论 `NULL` 在操作符的左侧还是右侧。`NULL` 值不包含在任何数据集中，不相互对应，并且在 [transform_null_in = 0](../../operations/settings/settings.md#transform_null_in) 的情况下无法进行比较。

以下是一个 `t_null` 表的示例：

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

可以看到，`y = NULL` 的行被从查询结果中丢弃。这是因为 ClickHouse 无法决定 `NULL` 是否包含在 `(NULL,3)` 集合中，返回 `0` 作为操作的结果，`SELECT` 将此行从最终输出中排除。

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

`IN` 操作符的子查询有两种选项（类似于 `JOIN` 操作符）：正常的 `IN` / `JOIN` 和 `GLOBAL IN` / `GLOBAL JOIN`。它们在分布式查询处理上运行方式不同。

:::note    
请记住，下面描述的算法可能会根据 [设置](../../operations/settings/settings.md) `distributed_product_mode` 设置而有所不同。
:::

使用常规 `IN` 时，查询被发送到远程服务器，每个服务器在 `IN` 或 `JOIN` 子句中运行子查询。

使用 `GLOBAL IN` / `GLOBAL JOIN` 时，首先运行所有的子查询以进行 `GLOBAL IN` / `GLOBAL JOIN`，并将结果收集到临时表中。然后将临时表发送到每个远程服务器，并在这些临时数据上运行查询。

对于非分布式查询，使用常规 `IN` / `JOIN`。

在进行分布式查询处理时，使用 `IN` / `JOIN` 子句中的子查询时要小心。

让我们来看一些示例。假设集群中的每台服务器都有一个正常的 **local_table**。每台服务器还有一个 **distributed_table** 表，其类型为 **Distributed**，查看集群中的所有服务器。

对于 **distributed_table** 的查询，将查询发送到所有远程服务器并在它们上使用 **local_table** 运行。

例如，查询

```sql
SELECT uniq(UserID) FROM distributed_table
```

将被发送到所有远程服务器，如下所示：

```sql
SELECT uniq(UserID) FROM local_table
```

并在每台服务器上并行运行，直到达到可以合并中间结果的阶段。然后将中间结果返回给请求服务器并在其上合并，最终结果将发送给客户端。

现在让我们检查一个包含 `IN` 的查询：

```sql
SELECT uniq(UserID) FROM distributed_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM local_table WHERE CounterID = 34)
```

- 两个站点受众的交集计算。

此查询将被发送到所有远程服务器，如下所示：

```sql
SELECT uniq(UserID) FROM local_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM local_table WHERE CounterID = 34)
```

换句话说，`IN` 子句中的数据集将在每个服务器上独立收集，仅在每台服务器上存储的本地数据中进行。

如果你做好了这样的准备，并将数据分散在集群服务器上，使得单个 UserID 的数据完全在单个服务器上，这将工作正确且优化。在这种情况下，所需的所有数据将在每个服务器上本地可用。否则，结果将不准确。我们将这种查询的变体称为“本地 IN”。

要纠正查询工作方式的问题，当数据在集群服务器之间随机分散时，可以在子查询中指定 **distributed_table**。查询将如下所示：

```sql
SELECT uniq(UserID) FROM distributed_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM distributed_table WHERE CounterID = 34)
```

此查询将被发送到所有远程服务器，如下所示：

```sql
SELECT uniq(UserID) FROM local_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM distributed_table WHERE CounterID = 34)
```

子查询将在每个远程服务器上开始运行。由于子查询使用的是分布式表，在每个远程服务器上的子查询将被重新发送到每个远程服务器，如下所示：

```sql
SELECT UserID FROM local_table WHERE CounterID = 34
```

例如，如果你有一个由 100 台服务器组成的集群，执行整个查询将需要 10,000 个基础请求，这通常被认为是不可接受的。

在这种情况下，你应该始终使用 `GLOBAL IN` 而不是 `IN`。让我们看看它在查询中的工作方式：

```sql
SELECT uniq(UserID) FROM distributed_table WHERE CounterID = 101500 AND UserID GLOBAL IN (SELECT UserID FROM distributed_table WHERE CounterID = 34)
```

请求服务器将运行子查询：

```sql
SELECT UserID FROM distributed_table WHERE CounterID = 34
```

结果将放入 RAM 中的临时表中。然后请求将被发送到每个远程服务器，如下所示：

```sql
SELECT uniq(UserID) FROM local_table WHERE CounterID = 101500 AND UserID GLOBAL IN _data1
```

临时表 `_data1` 将与查询一起发送到每个远程服务器（临时表的名称是实现定义的）。

这比使用常规的 `IN` 更优化。然而，请注意以下几点：

1.  创建临时表时，数据不会变得唯一。为了减少通过网络传输的数据量，请在子查询中指定 DISTINCT。 （对于普通的 `IN`，你不需要这样做。）
2.  临时表将被发送到所有远程服务器。传输不考虑网络拓扑。例如，如果 10 台远程服务器位于与请求服务器非常遥远的数据中心中，则数据将在通道中发送到远程数据中心 10 次。使用 `GLOBAL IN` 时尽量避免大数据集。
3.  向远程服务器传输数据时，网络带宽的限制是不可配置的。你可能会造成网络过载。
4.  尝试在服务器中分散数据，使你不需要定期使用 `GLOBAL IN`。
5.  如果你需要经常使用 `GLOBAL IN`，请规划 ClickHouse 集群的位置，使得单组副本不超过一个数据中心，且它们之间有快速的网络，这样查询可以完全在单个数据中心内处理。

在 `GLOBAL IN` 子句中指定本地表也有意义，以防该本地表仅在请求服务器上可用，而你希望在远程服务器上使用其中的数据。

### 分布式子查询与 max_rows_in_set {#distributed-subqueries-and-max_rows_in_set}

你可以使用 [`max_rows_in_set`](/operations/settings/settings#max_rows_in_set) 和 [`max_bytes_in_set`](/operations/settings/settings#max_bytes_in_set) 来控制在分布式查询中传输的数据量。

这在 `GLOBAL IN` 查询返回大量数据时尤其重要。考虑以下 SQL：

```sql
select * from table1 where col1 global in (select col1 from table2 where <some_predicate>)
```

如果 `some_predicate` 不够选择性，它会返回大量数据并导致性能问题。在这种情况下，最好限制通过网络传输的数据量。另外，请注意 [`set_overflow_mode`](/operations/settings/settings#set_overflow_mode) 的默认设置为 `throw`，这意味着当达到这些阈值时会引发异常。

### 分布式子查询与 max_parallel_replicas {#distributed-subqueries-and-max_parallel_replicas}

当 [max_parallel_replicas](#distributed-subqueries-and-max_parallel_replicas) 大于 1 时，分布式查询会进一步转化。

例如，以下：

```sql
SELECT CounterID, count() FROM distributed_table_1 WHERE UserID IN (SELECT UserID FROM local_table_2 WHERE CounterID < 100)
SETTINGS max_parallel_replicas=3
```

将在每台服务器上转化为：

```sql
SELECT CounterID, count() FROM local_table_1 WHERE UserID IN (SELECT UserID FROM local_table_2 WHERE CounterID < 100)
SETTINGS parallel_replicas_count=3, parallel_replicas_offset=M
```

其中 `M` 在 `1` 和 `3` 之间，具体取决于局部查询正在执行的副本。

这些设置影响查询中的每个 MergeTree 家族表，并具有施加 `SAMPLE 1/3 OFFSET (M-1)/3` 在每个表上的相同效果。

因此，仅在两个表具有相同的复制方案并按 UserID 或其子键进行采样时，添加 [max_parallel_replicas](#distributed-subqueries-and-max_parallel_replicas) 设置才能产生正确的结果。特别是，如果 `local_table_2` 没有采样键，将产生不正确的结果。相同的规则适用于 `JOIN`。

如果 `local_table_2` 不符合要求的一种解决方法是使用 `GLOBAL IN` 或 `GLOBAL JOIN`。

如果表没有采样键，可以使用更灵活的 [parallel_replicas_custom_key](/operations/settings/settings#parallel_replicas_custom_key) 选项，以便产生不同且更优化的行为。
