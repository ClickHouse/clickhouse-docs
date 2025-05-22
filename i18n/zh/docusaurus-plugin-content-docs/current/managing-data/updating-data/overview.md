---
'slug': '/updating-data/overview'
'title': '概述'
'description': '如何在ClickHouse中更新数据'
'keywords':
- 'update'
- 'updating data'
---

## ClickHouse 和 OLTP 数据库更新数据的区别 {#differences-between-updating-data-in-clickhouse-and-oltp-databases}

在处理更新时，ClickHouse 和 OLTP 数据库由于其内在的设计理念和目标用例有显著区别。例如，PostgreSQL 是一种面向行的、符合 ACID 的关系型数据库，支持强大且事务性的更新和删除操作，通过多版本并发控制（MVCC）等机制确保数据的一致性和完整性。这使得在高并发环境下也能安全可靠地进行修改。

相反，ClickHouse 是一种针对读密集型分析和高吞吐量附加操作优化的列式数据库。虽然它确实原生支持就地更新和删除，但必须小心使用，以避免高 I/O。作为替代，可以重新构建表，以将删除和更新转换为附加操作，这样它们就能异步处理和/或在读取时处理，从而反映出对高吞吐入数据和高效查询性能的关注，而非实时数据操作。

## 在 ClickHouse 中更新数据的方法 {#methods-to-update-data-in-clickhouse}

在 ClickHouse 中有几种更新数据的方法，每种方法都有其优点和性能特征。您应该根据数据模型和计划更新的数据量选择合适的方法。

对于这两种操作，如果提交的突变数量持续超过某个时间间隔内后台处理的突变数量，则必须应用的非物化突变的队列将持续增长。这将导致最终 `SELECT` 查询性能的下降。

总之，更新操作应谨慎发出，并应密切跟踪突变队列，使用 `system.mutations` 表。不要像在 OLTP 数据库中那样频繁发出更新。如果您有频繁更新的需求，请参见 [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree)。

| 方法                                                                                 | 语法                                 | 何时使用                                                                                                                                                                                                                                   |
|------------------------------------------------------------------------------------|-------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [更新突变](/sql-reference/statements/alter/update)                                  | `ALTER TABLE [table] UPDATE`        | 当数据必须立即更新到磁盘上时使用（例如，为了合规性）。会对 `SELECT` 性能产生负面影响。                                                                                                                                                 |
| [轻量级更新](/guides/developer/lightweight-update)                                  | `ALTER TABLE [table] UPDATE`        | 通过设置 `SET apply_mutations_on_fly = 1;` 来启用。当更新少量数据时使用。行在随后的所有 `SELECT` 查询中立即返回更新后的数据，但初始时在磁盘上仅标记为更新。                                                                 |
| [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree)    | `ENGINE = ReplacingMergeTree`       | 当更新大量数据时使用。该表引擎优化了合并时的数据去重。                                                                                                                                                                        |
| [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree) | `ENGINE = CollapsingMergeTree(Sign)`| 当频繁更新单个行时使用，或者在需要维护随时间变化的对象的最新状态的情况下使用。例如，跟踪用户活动或文章统计信息。                                                                                                                   |

以下是 ClickHouse 中更新数据不同方法的总结：

## 更新突变 {#update-mutations}

更新突变可以通过 `ALTER TABLE ... UPDATE` 命令发出，例如：

```sql
ALTER TABLE posts_temp
        (UPDATE AnswerCount = AnswerCount + 1 WHERE AnswerCount = 0)
```
这些操作极其耗费 I/O，重写所有与 `WHERE` 表达式匹配的部分。这个过程没有原子性 - 当突变部分准备好时，会立即用它们替换原来部分，在突变过程中开始执行的 `SELECT` 查询会同时看到已经突变的部分和尚未突变的部分。用户可以通过 [systems.mutations](/operations/system-tables/mutations) 表来跟踪进度。这些操作 I/O 密集，应谨慎使用，因为它们可能影响集群的 `SELECT` 性能。

阅读更多关于 [更新突变](/sql-reference/statements/alter/update)。

## 轻量级更新 {#lightweight-updates}

轻量级更新提供了一种机制来更新行，使其立即更新，并且后续的 `SELECT` 查询会自动返回更改后的值（这会产生额外开销并会减慢查询）。这有效地解决了普通突变的原子性限制。以下是一个示例：

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

请注意，对于轻量级更新，仍然使用突变来更新数据；只是没有立即物化并在 `SELECT` 查询时应用。它仍将在后台作为异步过程应用，并产生与突变相同的重大开销，因此是一种 I/O 密集的操作，应谨慎使用。此操作可使用的表达式也受限（有关详细信息，请参见这里的 [详细信息](/guides/developer/lightweight-update#support-for-subqueries-and-non-deterministic-functions)）。

阅读更多关于 [轻量级更新](/guides/developer/lightweight-update)。

## Collapsing Merge Tree {#collapsing-merge-tree}

基于更新开销大的理念，但插入可以用来执行更新，[`CollapsingMergeTree`](/engines/table-engines/mergetree-family/collapsingmergetree) 表引擎可以与 `sign` 列一起使用，作为告诉 ClickHouse 通过合并（删除）一个 `1` 和 `-1` 的行来更新特定行的方法。
如果在 `sign` 列中插入 `-1`，则整行将被删除。
如果在 `sign` 列中插入 `1`，则 ClickHouse 将保留该行。
待更新的行根据创建表时在 `ORDER BY ()` 语句中使用的排序键来识别。

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
上述更新方法需要用户在客户端维护状态。
虽然从 ClickHouse 的角度来看这最有效，但在规模上可能较为复杂。

我们建议阅读 [`CollapsingMergeTree`](/engines/table-engines/mergetree-family/collapsingmergetree) 的文档，以获得更全面的概述。
:::

## 更多资源 {#more-resources}

- [在 ClickHouse 中处理更新和删除](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
