---
slug: /updating-data/overview
title: 概述
description: 如何在 ClickHouse 中更新数据
keywords: [更新, 更新数据]
---

## 在 ClickHouse 和 OLTP 数据库中更新数据的区别 {#differences-between-updating-data-in-clickhouse-and-oltp-databases}

在处理更新时，ClickHouse 和 OLTP 数据库由于其底层设计哲学和目标用例的不同而显著不同。例如，PostgreSQL 是一个面向行的、符合 ACID 的关系数据库，支持强大且事务性的更新和删除操作，通过多版本并发控制（MVCC）等机制确保数据的一致性和完整性。这使得在高并发环境中也能安全可靠地进行修改。

相反，ClickHouse 是一个针对读重分析和高吞吐量追加操作优化的列式数据库。虽然它本质上支持就地更新和删除，但必须谨慎使用以避免高 I/O。或者，可以重构表，将删除和更新转换为追加操作，在这些操作中，数据会异步处理和/或在读取时进行处理，从而反映出对高吞吐数据摄取和高效查询性能的关注，而非实时数据操作。

## 在 ClickHouse 中更新数据的方法 {#methods-to-update-data-in-clickhouse}

在 ClickHouse 中更新数据有几种方法，每种方法都有其优缺点和性能特征。您应根据数据模型和计划更新的数据量选择适当的方法。

对于这两种操作，如果提交的变更数量持续超过在某个时间间隔内处理的变更数量，则必须应用的非物化变更的队列将继续增长。这将导致最终 `SELECT` 查询性能下降。

总结来说，更新操作应谨慎发出，并应使用 `system.mutations` 表密切跟踪变更队列。不要像在 OLTP 数据库中那样频繁发出更新。如果您需要频繁更新，请参见 [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree)。

| 方法                                                                                | 语法                               | 使用时机                                                                                                                                                                                                                              |
|---------------------------------------------------------------------------------------|--------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [更新变更](/sql-reference/statements/alter/update)                          | `ALTER TABLE [table] UPDATE`         | 当数据必须立即更新到磁盘时使用（例如，出于合规需求）。会对 `SELECT` 性能产生负面影响。                                                                                                                        |
| [轻量级更新](/guides/developer/lightweight-update)                         | `ALTER TABLE [table] UPDATE`         | 启用 `SET apply_mutations_on_fly = 1;`。在更新少量数据时使用。行会在所有后续的 `SELECT` 查询中立即返回更新的数据，但在磁盘上初始时仅内部标记为已更新。 |
| [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree)   | `ENGINE = ReplacingMergeTree`        | 当需要更新大量数据时使用。该表引擎优化了合并时的数据去重。                                                                                                                                |
| [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree) | `ENGINE = CollapsingMergeTree(Sign)` | 当频繁更新单行时使用，或在需要维护随时间变化的对象最新状态的场景中。例如，跟踪用户活动或文章统计数据。                                       |

以下是更新 ClickHouse 中数据的不同方法的总结：

## 更新变更 {#update-mutations}

更新变更可以通过 `ALTER TABLE … UPDATE` 命令发出，例如：

```sql
ALTER TABLE posts_temp
	(UPDATE AnswerCount = AnswerCount + 1 WHERE AnswerCount = 0)
```
这些操作极其消耗 I/O，重写所有与 `WHERE` 表达式匹配的分片。此过程没有原子性 - 当部分准备就绪时，被替换的部分会被取代，并且在变更期间开始执行的 `SELECT` 查询将看到已变更部分的数据以及尚未变更部分的数据。用户可以通过 [systems.mutations](/operations/system-tables/mutations) 表跟踪进度。这些是 I/O 密集型操作，应谨慎使用，因为它们会影响集群的 `SELECT` 性能。

了解更多关于 [更新变更](/sql-reference/statements/alter/update)。

## 轻量级更新 {#lightweight-updates}

轻量级更新提供了一种机制来更新行，使其立即更新，并且后续的 `SELECT` 查询将自动返回更改后的值（这会导致开销且会减慢查询）。这有效地解决了常规变更的原子性限制。我们在下面展示一个示例：

```sql
SET apply_mutations_on_fly = 1;

SELECT ViewCount
FROM posts
WHERE Id = 404346

┌─ViewCount─┐
│ 	26762   │
└───────────┘

1 行在集合中。消耗时间: 0.115 秒。处理了 5955 万行，238.25 MB (517.83 万行/秒，2.07 GB/秒)。
峰值内存使用: 113.65 MiB。

- 增量计数
ALTER TABLE posts
	(UPDATE ViewCount = ViewCount + 1 WHERE Id = 404346)

SELECT ViewCount
FROM posts
WHERE Id = 404346

┌─ViewCount─┐
│ 	26763   │
└───────────┘

1 行在集合中。消耗时间: 0.149 秒。处理了 5955 万行，259.91 MB (399.99 万行/秒，1.75 GB/秒)。
```

注意，对于轻量级更新，仍然使用了变更来更新数据；只是不会立即物化并在 `SELECT` 查询中应用。它仍将在后台作为异步过程应用，并造成与变更相同的高开销，因此是一个应谨慎使用的 I/O 密集型操作。与此操作一起使用的表达式也有限（查看此处的 [详细信息](/guides/developer/lightweight-update#support-for-subqueries-and-non-deterministic-functions)）。

了解更多关于 [轻量级更新](/guides/developer/lightweight-update)。

## Collapsing Merge Tree {#collapsing-merge-tree}

发源于更新成本高昂但插入可以被利用来执行更新的思想，`[CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree)` 表引擎可以与 `sign` 列一起使用，以告知 ClickHouse 通过合并（删除）一对带有 sign `1` 和 `-1` 的行来更新特定行。
如果对于 `sign` 列插入 `-1`，则整行将被删除。
如果对于 `sign` 列插入 `1`，ClickHouse 将保留该行。
要更新的行是基于在创建表时 `ORDER BY ()` 语句中使用的排序键来识别的。

```sql
CREATE TABLE UAct
(
    UserID UInt64,
    PageViews UInt8,
    Duration UInt8,
    Sign Int8 -- 用于 CollapsingMergeTree 表引擎的特殊列
)
ENGINE = CollapsingMergeTree(Sign)
ORDER BY UserID

INSERT INTO UAct VALUES (4324182021466249494, 5, 146, 1)
INSERT INTO UAct VALUES (4324182021466249494, 5, 146, -1) -- sign = -1 表示更新此行的状态
INSERT INTO UAct VALUES (4324182021466249494, 6, 185, 1) -- 行被替换为新状态

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
虽然从 ClickHouse 的角度来看这是最有效的，但在大规模操作时可能很复杂。

我们建议阅读 [`CollapsingMergeTree`](/engines/table-engines/mergetree-family/collapsingmergetree) 的文档，以获取更全面的概述。
:::

## 更多资源 {#more-resources}

- [在 ClickHouse 中处理更新和删除](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
