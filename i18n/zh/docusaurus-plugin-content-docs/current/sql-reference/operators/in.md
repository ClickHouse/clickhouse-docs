---
'description': 'Documentation for the IN operators excluding NOT IN, GLOBAL IN and
  GLOBAL NOT IN operators which are covered separately'
'slug': '/sql-reference/operators/in'
'title': 'IN Operators'
---




# IN 操作符

`IN`、`NOT IN`、`GLOBAL IN` 和 `GLOBAL NOT IN` 操作符的功能相当丰富，因此单独进行介绍。

操作符的左侧是单个列或元组。

示例：

```sql
SELECT UserID IN (123, 456) FROM ...
SELECT (CounterID, UserID) IN ((34, 123), (101500, 456)) FROM ...
```

如果左侧是索引中的单列，右侧是一组常量，则系统会使用索引来处理查询。

不要显式列出太多值（即数百万个）。如果数据集很大，可以将其放入临时表中（例如，请参见 [External data for query processing](../../engines/table-engines/special/external-data.md) 部分），然后使用子查询。

操作符的右侧可以是常量表达式的集合、包含常量表达式的元组集合（如上面的示例所示），或带括号的数据库表名称或 `SELECT` 子查询。

ClickHouse 允许 `IN` 子查询的左右两侧的数据类型不同。
在这种情况下，它会将右侧值转换为左侧的类型， 
就像对右侧应用了 [accurateCastOrNull](/sql-reference/functions/type-conversion-functions#accuratecastornullx-t) 函数一样。

这意味着数据类型变为 [Nullable](../../sql-reference/data-types/nullable.md)，如果无法执行转换，则返回 [NULL](/operations/settings/formats#input_format_null_as_default)。

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

如果操作符的右侧是一个表的名称（例如，`UserID IN users`），这相当于子查询 `UserID IN (SELECT * FROM users)`。在处理与查询一起发送的外部数据时使用这一点。例如，可以将查询与加载到 'users' 临时表中的一组用户 ID 一起发送，这些 ID 应该被过滤。

如果操作符的右侧是具有 Set 引擎的表名（这是一个始终在 RAM 中的准备好的数据集），则数据集在每次查询时不会再次创建。

子查询可以指定多个列来过滤元组。

示例：

```sql
SELECT (CounterID, UserID) IN (SELECT CounterID, UserID FROM ...) FROM ...
```

`IN` 操作符的左右两侧的列应具有相同的数据类型。

`IN` 操作符和子查询可以出现在查询的任何部分，包括聚合函数和 Lambda 函数。
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

对于 3 月 17 日以后的每一天，计算在 3 月 17 日访问过该站点的用户所做页面浏览量的百分比。
`IN` 子句中的子查询始终在单台服务器上运行一次。不存在依赖子查询。

## NULL 处理 {#null-processing}

在处理请求期间，`IN` 操作符假定与 [NULL](/operations/settings/formats#input_format_null_as_default) 进行的操作的结果始终等于 `0`，无论 `NULL` 在操作符的左侧还是右侧。 `NULL` 值不包括在任何数据集中，彼此不对应，因此如果 [transform_null_in = 0](../../operations/settings/settings.md#transform_null_in)，将无法进行比较。

这是一个使用 `t_null` 表的示例：

```text
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
│ 2 │    3 │
└───┴──────┘
```

运行查询 `SELECT x FROM t_null WHERE y IN (NULL,3)` 会输出以下结果：

```text
┌─x─┐
│ 2 │
└───┘
```

可以看到，其中 `y = NULL` 的行被排除在查询结果之外。这是因为 ClickHouse 无法决定 `NULL` 是否包含在 `(NULL,3)` 集合中，因此将操作的结果返回 `0`，并且 `SELECT` 从最终输出中排除了这行。

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

`IN` 操作符与子查询的使用有两种选项（类似于 `JOIN` 操作符）：正常的 `IN` / `JOIN` 和 `GLOBAL IN` / `GLOBAL JOIN`。它们在分布式查询处理中的运行方式不同。

:::note    
请记住，下面描述的算法在不同的 [settings](../../operations/settings/settings.md) `distributed_product_mode` 设置下可能会有所不同。
:::

使用常规 `IN` 时，查询会发送到远程服务器，每个服务器会在其 `IN` 或 `JOIN` 子句中运行子查询。

使用 `GLOBAL IN` / `GLOBAL JOIN` 时，首先所有的子查询都是针对 `GLOBAL IN` / `GLOBAL JOIN` 运行，结果会被收集到临时表中。然后将临时表发送到每个远程服务器，在这些服务器上使用这些临时数据运行查询。

对于非分布式查询，使用常规 `IN` / `JOIN`。

在分布式查询处理中使用 `IN` / `JOIN` 子句时要小心。

让我们来看一些示例。假设集群中的每个服务器都有一个普通的 **local_table**。每个服务器还拥有一个 **distributed_table** 表，其类型为 **Distributed**，可以查看集群中的所有服务器。

对 **distributed_table** 的查询将会发送到所有远程服务器并使用 **local_table** 在它们上运行。

例如，查询

```sql
SELECT uniq(UserID) FROM distributed_table
```

将作为以下内容发送至所有远程服务器

```sql
SELECT uniq(UserID) FROM local_table
```

并在它们每个服务器上并行运行，直到达到可以合并中间结果的阶段。然后，中间结果将返回到请求服务器并合并在上面，最终结果将发送到客户端。

现在让我们检查一个带有 `IN` 的查询：

```sql
SELECT uniq(UserID) FROM distributed_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM local_table WHERE CounterID = 34)
```

- 计算两个站点受众的交集。

该查询将被发送到所有远程服务器，如

```sql
SELECT uniq(UserID) FROM local_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM local_table WHERE CounterID = 34)
```

换句话说，`IN` 子句中的数据集将在每台服务器上独立收集，仅针对存储在每台服务器本地的数据。

如果您为这种情况做好了准备，并且数据在集群服务器之间的分布方式使得单个 UserID 的所有数据都完全位于单台服务器上，则这将正常且最佳地工作。在这种情况下，所有必要的数据将在每台服务器上本地可用。否则，结果将不准确。我们将该查询的这种变体称为“本地 IN”。

为了修正数据在集群服务器之间随机分布时查询的工作方式，可以在子查询中指定 **distributed_table**。查询将如下所示：

```sql
SELECT uniq(UserID) FROM distributed_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM distributed_table WHERE CounterID = 34)
```

该查询将作为以下内容发送到所有远程服务器

```sql
SELECT uniq(UserID) FROM local_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM distributed_table WHERE CounterID = 34)
```

子查询将在每个远程服务器上开始运行。由于子查询使用分布式表，因此每个远程服务器上的子查询将重新发送到每个远程服务器，如下所示：

```sql
SELECT UserID FROM local_table WHERE CounterID = 34
```

例如，如果您有一个100个服务器的集群，执行整个查询将需要 10,000 个基本请求，这通常被认为是不可接受的。

在这种情况下，您应始终使用 `GLOBAL IN` 而不是 `IN`。让我们看一下该查询如何工作：

```sql
SELECT uniq(UserID) FROM distributed_table WHERE CounterID = 101500 AND UserID GLOBAL IN (SELECT UserID FROM distributed_table WHERE CounterID = 34)
```

请求服务器将运行子查询：

```sql
SELECT UserID FROM distributed_table WHERE CounterID = 34
```

结果将放入 RAM 中的临时表中。然后请求将作为以下内容发送到每个远程服务器：

```sql
SELECT uniq(UserID) FROM local_table WHERE CounterID = 101500 AND UserID GLOBAL IN _data1
```

临时表 `_data1` 将与查询一起发送到每个远程服务器（临时表的名称是实现定义的）。

这比使用常规的 `IN` 更优化。但请注意以下几点：

1.  创建临时表时，数据不会变得唯一。为了减少通过网络传输的数据量，请在子查询中指定 DISTINCT。（对于常规 `IN`，您无需这样做。）
2.  临时表将发送到所有远程服务器。传输不考虑网络拓扑。例如，如果 10 个远程服务器位于与请求服务器相对偏远的数据中心，则根据该通道，数据将被发送到远程数据中心 10 次。尝试在使用 `GLOBAL IN` 时避免使用较大数据集。
3.  在将数据传输到远程服务器时，网络带宽的限制不可配置。您可能会使网络过载。
4.  尝试在服务器之间分配数据，以便您不必定期使用 `GLOBAL IN`。
5.  如果需要频繁使用 `GLOBAL IN`，请计划 ClickHouse 集群的位置信息，使单组副本位于不超过一个数据中心，并保持它们之间有快速网络，以便查询可以完全在单个数据中心内处理。

在 `GLOBAL IN` 子句中指定本地表也是有意义的，以便如果此本地表仅在请求服务器上可用，并且您希望在远程服务器上使用其中的数据时，可以使用它。

### 分布式子查询和 max_rows_in_set {#distributed-subqueries-and-max_rows_in_set}

您可以使用 [`max_rows_in_set`](/operations/settings/settings#max_rows_in_set) 和 [`max_bytes_in_set`](/operations/settings/settings#max_bytes_in_set) 来控制在分布式查询中传输的数据量。

这在 `GLOBAL IN` 查询返回大量数据时尤为重要。考虑以下 SQL：

```sql
select * from table1 where col1 global in (select col1 from table2 where <some_predicate>)
```

如果 `some_predicate` 选择性不足，它将返回大量数据并导致性能问题。在这种情况下，限制通过网络传输的数据量是明智的。还要注意，[`set_overflow_mode`](/operations/settings/settings#set_overflow_mode) 默认设置为 `throw`，这意味着当达到这些阈值时会引发异常。

### 分布式子查询和 max_parallel_replicas {#distributed-subqueries-and-max_parallel_replicas}

当 [max_parallel_replicas](#distributed-subqueries-and-max_parallel_replicas) 大于 1 时，分布式查询会进一步转换。

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

其中 `M` 在 `1` 和 `3` 之间，具体取决于本地查询执行在哪个副本上。

这些设置影响查询中每个 MergeTree 系列表，并且具有在每个表上应用 `SAMPLE 1/3 OFFSET (M-1)/3` 的相同效果。

因此，添加 [max_parallel_replicas](#distributed-subqueries-and-max_parallel_replicas) 设置只有在两个表具有相同的复制方案并且按 UserID 或其子键进行抽样时，才能产生正确的结果。特别是，如果 `local_table_2` 没有采样键，则会产生不正确的结果。相同的规则适用于 `JOIN`。

如果 `local_table_2` 不符合要求，可以使用 `GLOBAL IN` 或 `GLOBAL JOIN` 作为解决方法。

如果表没有采样键，可以使用更灵活的选项 [parallel_replicas_custom_key](/operations/settings/settings#parallel_replicas_custom_key) 来获得不同或更优化的行为。
