---
'description': '关于 IN 运算符的文档，不包括 NOT IN、GLOBAL IN 和 GLOBAL NOT IN 运算符，这些运算符单独覆盖。'
'slug': '/sql-reference/operators/in'
'title': 'IN 运算符'
---


# IN 操作符

`IN`、`NOT IN`、`GLOBAL IN` 和 `GLOBAL NOT IN` 操作符单独涵盖，因为它们的功能非常丰富。

操作符的左侧可以是单个列或一个元组。

示例：

```sql
SELECT UserID IN (123, 456) FROM ...
SELECT (CounterID, UserID) IN ((34, 123), (101500, 456)) FROM ...
```

如果左侧是一个在索引中的单个列，而右侧是一组常量，系统将使用索引来处理查询。

不要显式列出太多值（例如——亿级）。如果数据集很大，请将其放入临时表中（例如，参见 [用于查询处理的外部数据](../../engines/table-engines/special/external-data.md)），然后使用子查询。

操作符的右侧可以是一组常量表达式、一组带常量表达式的元组（如上例所示），或用括号括起来的数据库表名或 `SELECT` 子查询。

ClickHouse 允许 `IN` 子查询的左右部分的类型不同。在这种情况下，它会将右侧的值转换为左侧的类型，就好像对右侧应用了 [accurateCastOrNull](/sql-reference/functions/type-conversion-functions#accuratecastornullx-t) 函数一样。

这意味着数据类型变为 [Nullable](../../sql-reference/data-types/nullable.md)，如果无法进行转换，将返回 [NULL](/operations/settings/formats#input_format_null_as_default)。

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

如果操作符的右侧是一个表名（例如，`UserID IN users`），这等同于子查询 `UserID IN (SELECT * FROM users)`。在处理与查询一起发送的外部数据时使用此方式。例如，可以将查询与加载到“users”临时表的用户 ID 集一起发送，以便进行过滤。

如果操作符的右侧是一个具有 Set 引擎的表名（这是一个始终在 RAM 中的准备好数据集），则数据集不会为每个查询重新创建。

子查询可以指定多个列来过滤元组。

示例：

```sql
SELECT (CounterID, UserID) IN (SELECT CounterID, UserID FROM ...) FROM ...
```

`IN` 操作符左右的列应具有相同的类型。

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

在 3 月 17 日之后的每一天，统计访问 3 月 17 日网站的用户所产生的页面浏览量比例。
`IN` 子句中的子查询总是仅在单台服务器上运行一次。没有依赖性子查询。

## NULL 处理 {#null-processing}

在请求处理期间，`IN` 操作符假设与 [NULL](/operations/settings/formats#input_format_null_as_default) 的运算结果始终等于 `0`，无论 `NULL` 在操作符的左侧还是右侧。`NULL` 值不包含在任何数据集中，彼此不对应，如果 [transform_null_in = 0](../../operations/settings/settings.md#transform_null_in)，则无法进行比较。

这是一个 `t_null` 表的示例：

```text
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
│ 2 │    3 │
└───┴──────┘
```

执行查询 `SELECT x FROM t_null WHERE y IN (NULL,3)` 产生以下结果：

```text
┌─x─┐
│ 2 │
└───┘
```

可以看到 `y = NULL` 的行被从查询结果中排除。这是因为 ClickHouse 无法确定 `NULL` 是否包含在 `(NULL,3)` 集中，返回 `0` 作为运算结果，因此 `SELECT` 排除该行的最终输出。

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

带有子查询的 `IN` 操作符有两种选项（类似于 `JOIN` 操作符）：普通的 `IN` / `JOIN` 和 `GLOBAL IN` / `GLOBAL JOIN`。它们在分布式查询处理中运行的方式不同。

:::note    
请记住，下面描述的算法可能会根据 [设置](../../operations/settings/settings.md) 中的 `distributed_product_mode` 设置而有所不同。
:::

使用常规的 `IN` 时，查询会发送到远程服务器，每个服务器会运行 `IN` 或 `JOIN` 子句中的子查询。

使用 `GLOBAL IN` / `GLOBAL JOIN` 时，首先运行所有 `GLOBAL IN` / `GLOBAL JOIN` 的子查询，并将结果收集到临时表中。然后将临时表发送到每个远程服务器，查询将使用这些临时数据运行。

对于非分布式查询，请使用常规的 `IN` / `JOIN`。

在进行分布式查询处理时，小心使用 `IN` / `JOIN` 子句中的子查询。

让我们看看一些示例。假设集群中的每个服务器都有一个普通的 **local_table**。每个服务器还具有一个类型为 **Distributed** 的 **distributed_table** 表，用于查看集群中的所有服务器。

对于 **distributed_table** 的查询，查询将发送到所有远程服务器，并在它们上运行，使用 **local_table**。

例如，查询

```sql
SELECT uniq(UserID) FROM distributed_table
```

将作为以下查询发送到所有远程服务器：

```sql
SELECT uniq(UserID) FROM local_table
```

并在每个服务器上并行运行，直到达到可以组合中间结果的阶段。然后，中间结果将返回请求服务器并在其上合并，最终结果将发送到客户端。

现在让我们检查一个带有 `IN` 的查询：

```sql
SELECT uniq(UserID) FROM distributed_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM local_table WHERE CounterID = 34)
```

- 计算两个网站受众的交集。

此查询将作为以下查询发送到所有远程服务器：

```sql
SELECT uniq(UserID) FROM local_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM local_table WHERE CounterID = 34)
```

换句话说，`IN` 子句中的数据集将在每台服务器上独立收集，仅跨每台服务器上存储的数据。

如果您为此情况做好准备，并且已经将数据分布在集群服务器上，以便单个 UserID 的数据完全位于单个服务器上，则这将正确且高效地工作。在这种情况下，每台服务器上都将本地可用所有必要数据。否则，结果将不准确。我们将这种查询变体称为“本地 IN”。

要更正查询在数据随机分布在集群服务器上的工作方式，您可以在子查询中指定 **distributed_table**。查询将如下所示：

```sql
SELECT uniq(UserID) FROM distributed_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM distributed_table WHERE CounterID = 34)
```

此查询将作为以下查询发送到所有远程服务器：

```sql
SELECT uniq(UserID) FROM local_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM distributed_table WHERE CounterID = 34)
```

子查询将开始在每个远程服务器上运行。由于子查询使用分布式表，因此每个远程服务器上的子查询将重新发送到所有远程服务器，如下所示：

```sql
SELECT UserID FROM local_table WHERE CounterID = 34
```

例如，如果您有一个由 100 台服务器组成的集群，执行整个查询将需要 10,000 个基本请求，这通常被认为是不可接受的。

在这种情况下，您应该始终使用 `GLOBAL IN` 而不是 `IN`。让我们看看它在查询中的工作方式：

```sql
SELECT uniq(UserID) FROM distributed_table WHERE CounterID = 101500 AND UserID GLOBAL IN (SELECT UserID FROM distributed_table WHERE CounterID = 34)
```

请求服务器将运行子查询：

```sql
SELECT UserID FROM distributed_table WHERE CounterID = 34
```

结果将放入 RAM 中的临时表。然后请求将作为以下内容发送到每个远程服务器：

```sql
SELECT uniq(UserID) FROM local_table WHERE CounterID = 101500 AND UserID GLOBAL IN _data1
```

临时表 `_data1` 将与查询一起发送到每个远程服务器（临时表的名称由实现决定）。

这比使用普通的 `IN` 更有效。但请记住以下几点：

1.  创建临时表时，数据不会唯一。为了减少网络上传输的数据量，请在子查询中指定 DISTINCT。（对于普通的 `IN` 不需要这样做。）
2.  临时表将发送到所有远程服务器。传输不考虑网络拓扑。例如，如果 10 台远程服务器位于与请求服务器关系非常遥远的数据中心，则数据将通过通道发送 10 次到远程数据中心。尝试在使用 `GLOBAL IN` 时避免大型数据集。
3.  向远程服务器传输数据时，无法配置网络带宽的限制。您可能会过载网络。
4.  尝试在服务器之间分配数据，以便不需要经常使用 `GLOBAL IN`。
5.  如果您需要频繁使用 `GLOBAL IN`，请规划 ClickHouse 集群的位置，以便一组副本不超过一个数据中心，并且它们之间网络速度较快，以便查询可以完全在单个数据中心内处理。

在 `GLOBAL IN` 子句中指定本地表也是合理的，以防此本地表仅在请求服务器上可用，并且您希望从远程服务器使用该数据。

### 分布式子查询与 max_rows_in_set {#distributed-subqueries-and-max_rows_in_set}

您可以使用 [`max_rows_in_set`](/operations/settings/settings#max_rows_in_set) 和 [`max_bytes_in_set`](/operations/settings/settings#max_bytes_in_set) 来控制在分布式查询期间传输的数据量。 

这对于 `GLOBAL IN` 查询返回大量数据时尤其重要。考虑以下 SQL：

```sql
select * from table1 where col1 global in (select col1 from table2 where <some_predicate>)
```
 
如果 `some_predicate` 的选择性不足，将返回大量数据并导致性能问题。在这种情况下，限制网络数据传输是明智的。此外，请注意 [`set_overflow_mode`](/operations/settings/settings#set_overflow_mode) 默认为 `throw`，这意味着当达到这些阈值时会引发异常。

### 分布式子查询与 max_parallel_replicas {#distributed-subqueries-and-max_parallel_replicas}

当 [max_parallel_replicas](#distributed-subqueries-and-max_parallel_replicas) 大于 1 时，分布式查询进一步转化。

例如，下面的查询：

```sql
SELECT CounterID, count() FROM distributed_table_1 WHERE UserID IN (SELECT UserID FROM local_table_2 WHERE CounterID < 100)
SETTINGS max_parallel_replicas=3
```

在每个服务器上转化为：

```sql
SELECT CounterID, count() FROM local_table_1 WHERE UserID IN (SELECT UserID FROM local_table_2 WHERE CounterID < 100)
SETTINGS parallel_replicas_count=3, parallel_replicas_offset=M
```

其中 `M` 在 `1` 和 `3` 之间，具体取决于本地查询在哪个副本上执行。

这些设置影响查询中的每个 MergeTree 家族表，并具有与在每个表上应用 `SAMPLE 1/3 OFFSET (M-1)/3` 相同的效果。

因此，添加 [max_parallel_replicas](#distributed-subqueries-and-max_parallel_replicas) 设置只有在两个表具有相同的复制方案并按 UserID 或其子键进行采样时才会产生正确的结果。特别是，如果 `local_table_2` 没有采样键，将会产生不正确的结果。这个规则同样适用于 `JOIN`。

如果 `local_table_2` 不符合要求，那么可以使用 `GLOBAL IN` 或 `GLOBAL JOIN` 作为变通方法。

如果表没有采样键，可以使用更灵活的 [parallel_replicas_custom_key](/operations/settings/settings#parallel_replicas_custom_key) 选项，这可以产生不同且更优的行为。
