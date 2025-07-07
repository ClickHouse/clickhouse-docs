---
'slug': '/updating-data/overview'
'title': '概述'
'description': '如何在 ClickHouse 中更新数据'
'keywords':
- 'update'
- 'updating data'
---

## 在 ClickHouse 和 OLTP 数据库中更新数据的差异 {#differences-between-updating-data-in-clickhouse-and-oltp-databases}

在处理更新时，由于其底层设计哲学和目标用例的不同，ClickHouse 和 OLTP 数据库显著不同。例如，PostgreSQL 是一种面向行的、符合 ACID 的关系数据库，支持强大的事务性更新和删除操作，通过多版本并发控制（MVCC）等机制确保数据一致性和完整性。这使得在高并发环境中进行安全可靠的修改成为可能。

相反，ClickHouse 是一种针对读密集型分析和高吞吐量附加操作优化的列式数据库。虽然它本身支持就地更新和删除，但必须谨慎使用以避免高 I/O。另一种选择是重新构造表，将删除和更新转换为附加操作，在这些操作中，它们被异步处理并/或在读取时处理，从而反映出对高吞吐量数据摄取和高效查询性能的关注，而非实时数据操作。

## 在 ClickHouse 中更新数据的方法 {#methods-to-update-data-in-clickhouse}

在 ClickHouse 中有几种更新数据的方法，每种方法都有其自身的优点和性能特征。你应该根据数据模型和你打算更新的数据量选择合适的方法。

对于这两种操作，如果提交的突变数量持续超过在某个时间间隔内在后台处理的突变数量，则必须应用的未物化突变队列将继续增长。这将最终导致 `SELECT` 查询性能的下降。

总而言之，更新操作应谨慎进行，并应通过 `system.mutations` 表密切跟踪突变队列。请不要像在 OLTP 数据库中那样频繁地发出更新。如果你有频繁更新的需求，请参见 [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree)。

| 方法                                                                                         | 语法                               | 适用场景                                                                                                                                                                                                                          |
|----------------------------------------------------------------------------------------------|--------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [更新突变](/sql-reference/statements/alter/update)                                          | `ALTER TABLE [table] UPDATE`         | 当数据必须立即更新到磁盘时（例如，为了合规性）。会对 `SELECT` 性能产生负面影响。                                                                                                                                              |
| [轻量级更新](/guides/developer/lightweight-update)                                          | `ALTER TABLE [table] UPDATE`         | 通过 `SET apply_mutations_on_fly = 1;` 启用。用于更新少量数据时。行在所有后续 `SELECT` 查询中立即返回更新的数据，但最初仅在磁盘上被内部标记为更新。                                                                                          |
| [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree)           | `ENGINE = ReplacingMergeTree`        | 当更新大量数据时使用。该表引擎针对合并时的数据去重进行了优化。                                                                                                                                                           |
| [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree)         | `ENGINE = CollapsingMergeTree(Sign)` | 当频繁更新单个行，或在需要维护随时间变化的对象最新状态的场景中使用。例如，跟踪用户活动或文章统计。                                                                                           |

下面是更新 ClickHouse 中数据的不同方式的总结：

## 更新突变 {#update-mutations}

更新突变可以通过 `ALTER TABLE ... UPDATE` 命令发出，例如：

```sql
ALTER TABLE posts_temp
        (UPDATE AnswerCount = AnswerCount + 1 WHERE AnswerCount = 0)
```
这些操作非常消耗 I/O，会重写所有匹配 `WHERE` 表达式的部分。该过程没有原子性 - 当突变部分准备好后，就会用突变部分替换，而在突变过程中开始执行的 `SELECT` 查询将看到已经突变的部分和尚未突变的部分的数据。用户可以通过 [systems.mutations](/operations/system-tables/mutations) 表跟踪进度。这些是 I/O 密集型操作，应谨慎使用，因为它们可能会影响集群 `SELECT` 性能。

阅读更多关于 [更新突变](/sql-reference/statements/alter/update)。

## 轻量级更新 {#lightweight-updates}

轻量级更新提供了一种机制，可以更新行，使其立即更新，并且后续的 `SELECT` 查询将自动返回更改的值（这会产生额外开销并减慢查询）。这有效地解决了正常突变的原子性限制。以下是一个示例：

```sql
SET apply_mutations_on_fly = 1;

SELECT ViewCount
FROM posts
WHERE Id = 404346

┌─ViewCount─┐
│       26762   │
└───────────┘

1 row in set. Elapsed: 0.115 sec. Processed 59.55 million rows, 238.25 MB (517.83 million rows/s., 2.07 GB/s.)
Peak memory usage: 113.65 MiB.

-increment count
ALTER TABLE posts
        (UPDATE ViewCount = ViewCount + 1 WHERE Id = 404346)

SELECT ViewCount
FROM posts
WHERE Id = 404346

┌─ViewCount─┐
│       26763   │
└───────────┘

1 row in set. Elapsed: 0.149 sec. Processed 59.55 million rows, 259.91 MB (399.99 million rows/s., 1.75 GB/s.)
```

请注意，对于轻量级更新，仍然会使用突变来更新数据；只是在 `SELECT` 查询时不会立即实现并应用。它仍会作为异步过程在后台应用，并会带来与突变相同的重负载，因此是 I/O 密集型操作，应谨慎使用。此操作可以使用的表达式也有限（有关详细信息，请参见 [这里](/guides/developer/lightweight-update#support-for-subqueries-and-non-deterministic-functions)）。

阅读更多关于 [轻量级更新](/guides/developer/lightweight-update)。

## Collapsing Merge Tree {#collapsing-merge-tree}

基于更新代价高昂，但可以利用插入来执行更新的想法，[`CollapsingMergeTree`](/engines/table-engines/mergetree-family/collapsingmergetree) 表引擎可以与 `sign` 列结合使用，作为告诉 ClickHouse 通过折叠（删除）一对 `1` 和 `-1` 的行来更新特定行的方法。
如果 `-1` 插入到 `sign` 列中，将删除整行。
如果 `1` 插入到 `sign` 列中，ClickHouse 将保留该行。
要更新的行根据创建表时在 `ORDER BY ()` 语句中使用的排序键进行识别。

```sql
CREATE TABLE UAct
(
    UserID UInt64,
    PageViews UInt8,
    Duration UInt8,
    Sign Int8 -- A special column used with the CollapsingMergeTree table engine
)
ENGINE = CollapsingMergeTree(Sign)
ORDER BY UserID

INSERT INTO UAct VALUES (4324182021466249494, 5, 146, 1)
INSERT INTO UAct VALUES (4324182021466249494, 5, 146, -1) -- sign = -1 signals to update the state of this row
INSERT INTO UAct VALUES (4324182021466249494, 6, 185, 1) -- the row is replaced with the new state

SELECT
    UserID,
    sum(PageViews * Sign) AS PageViews,
    sum(Duration * Sign) AS Duration
FROM UAct
GROUP BY UserID
HAVING sum(Sign) > 0

┌──────────────UserID─┬─PageViews─┬─Duration─┐
│ 4324182021466249494 │         6 │      185 │
└─────────────────────┴───────────┴──────────┘
```

:::note
上述更新方法要求用户在客户端维护状态。
虽然从 ClickHouse 的角度来看，这是最有效的，但在大规模操作时可能会很复杂。

我们建议阅读关于 [`CollapsingMergeTree`](/engines/table-engines/mergetree-family/collapsingmergetree) 的文档，以获得更全面的概述。
:::

## 更多资源 {#more-resources}

- [在 ClickHouse 中处理更新和删除](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
