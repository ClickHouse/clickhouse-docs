---
'slug': '/best-practices/minimize-optimize-joins'
'sidebar_position': 10
'sidebar_label': '最小化和优化JOIN'
'title': '最小化和优化JOIN'
'description': '页面描述了JOIN的最佳实践'
---

import Image from '@theme/IdealImage';
import joins from '@site/static/images/bestpractices/joins-speed-memory.png';

ClickHouse 支持多种 JOIN 类型和算法，并且在最近的版本中 JOIN 性能有了显著提升。然而，JOIN 本质上比从单个非规范化表中查询更昂贵。非规范化将计算工作从查询时间转移到插入或预处理时间，这通常导致在运行时显著降低延迟。对于实时或对延迟敏感的分析查询，**强烈建议使用非规范化**。

一般来说，在以下情况下进行非规范化：

- 表不经常变化或者接受批量刷新。
- 关系不是多对多关系或基数不高。
- 只会查询到有限的列子集，即某些列可以排除在非规范化之外。
- 您有能力将处理从 ClickHouse 移出去到上游系统（如 Flink），在这些系统中可以管理实时增强或扁平化。

并非所有数据都需要非规范化 - 重点关注经常被查询的属性。同时考虑使用 [物化视图](/best-practices/use-materialized-views) 来逐步计算聚合，而不是重复整个子表。当模式更新较少且延迟至关重要时，非规范化提供了最佳性能折衷。

有关在 ClickHouse 中非规范化数据的完整指南，请参见 [此处](/data-modeling/denormalization)。

## 何时需要 JOIN {#when-joins-are-required}

当需要使用 JOIN 时，请确保您使用的是**至少 24.12 版本，最好是最新版本**，因为 JOIN 性能随着每个新版本不断提高。从 ClickHouse 24.12 开始，查询规划器现在会自动将较小的表放置在 JOIN 的右侧以获得最佳性能 - 这一任务过去需要手动完成。即将发布更多增强功能，包括更积极的过滤器下推和多个 JOIN 的自动重排序。

遵循以下最佳实践以提高 JOIN 性能：

* **避免笛卡尔积**：如果左侧的值与右侧的多个值匹配，JOIN 将返回多行 - 即所谓的笛卡尔积。如果您的用例不需要右侧的所有匹配，只需任何单个匹配，您可以使用 `ANY` JOIN（例如 `LEFT ANY JOIN`）。它们比常规 JOIN 更快且使用更少内存。
* **减少 JOIN 表的大小**：JOIN 的运行时和内存消耗与左侧和右侧表的大小成正比。为减少 JOIN 处理的数据量，请在查询的 `WHERE` 或 `JOIN ON` 子句中添加额外的过滤条件。ClickHouse 会尽可能深地推动过滤条件，通常是在 JOIN 之前。如果过滤条件未能自动下推（出于任何原因），请将 JOIN 的一侧重写为子查询以强制下推。
* **如合适则通过字典使用直接 JOIN**：ClickHouse 中的标准 JOIN 分为两个阶段执行：构建阶段迭代右侧表以构建哈希表，接着是探针阶段迭代左侧表以通过哈希表查找匹配的 JOIN 伙伴。如果右侧是 [字典](/dictionary) 或其他具有键值特性的表引擎（例如 [EmbeddedRocksDB](/engines/table-engines/integrations/embedded-rocksdb) 或 [Join 表引擎](/engines/table-engines/special/join)），那么 ClickHouse 可以使用“直接” JOIN 算法，这有效地消除了构建哈希表的需求，从而加快查询处理速度。这对于 `INNER` 和 `LEFT OUTER` JOIN 是有效的，并且对于实时分析工作负载更为理想。
* **利用表排序进行 JOIN**：ClickHouse 中每个表都是按表的主键列排序的。可以利用所谓的排序归并 JOIN 算法，如 `full_sorting_merge` 和 `partial_merge`。与基于哈希表的标准 JOIN 算法（见下文，`parallel_hash`、`hash`、`grace_hash`）不同，排序归并 JOIN 算法首先会对两个表进行排序，然后合并。如果查询通过各自的主键列对两个表进行 JOIN，则排序归并具有一个优化，即省略排序步骤，从而节省处理时间和开销。
* **避免磁盘溢出 JOIN**：JOIN 的中间状态（例如哈希表）可能会变得过大，以至于无法放入主内存。在这种情况下，ClickHouse 默认会返回内存不足错误。一些 JOIN 算法（见下文），例如 [`grace_hash`](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2)、[`partial_merge`](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3) 和 [`full_sorting_merge`](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3)，能够将中间状态溢出到磁盘并继续进行查询执行。然而，仍需谨慎使用这些 JOIN 算法，因为磁盘访问可能显著减慢 JOIN 处理速度。我们建议通过其他方式优化 JOIN 查询以减小中间状态的大小。
* **在外部 JOIN 中使用默认值作为无匹配标记**：左/右/全外部 JOIN 包含来自左/右/两个表的所有值。如果在另一个表中找不到某个值的 JOIN 伙伴，ClickHouse 会用一个特殊标记替换该 JOIN 伙伴。SQL 标准要求数据库使用 NULL 作为此类标记。在 ClickHouse 中，这需要将结果列包装在 Nullable 中，造成额外的内存和性能开销。作为替代，您可以配置设置 `join_use_nulls = 0`，并使用结果列数据类型的默认值作为标记。

:::note 注意谨慎使用字典
在 ClickHouse 中使用字典进行 JOIN 时，重要的是要了解字典设计时不允许重复键。在数据加载期间，任何重复键会被默默去重 - 仅保留给定键最后加载的值。这种行为使字典非常适合一对一或多对一关系，其中只需要最新或权威值。然而，对于一对多或多对多关系（例如将角色与演员连接，演员可以有多个角色），使用字典会导致数据默默丢失，因为所有匹配的行中只有一行会被保留。因此，字典不适用于需要完整关系保真度的场景。
:::

## 选择合适的 JOIN 算法 {#choosing-the-right-join-algorithm}

ClickHouse 支持几种 JOIN 算法，速度和内存之间存在权衡：

* **并行哈希 JOIN（默认）**：适用于适合在内存中的小到中型右侧表。
* **直接 JOIN**：当使用字典（或其他具有键值特性的表引擎）进行 `INNER` 或 `LEFT ANY JOIN` 时理想 - 这是点查找的最快方法，因为它消除了构建哈希表的需要。
* **全排序归并 JOIN**：当两个表按 JOIN 键排序时有效。
* **部分归并 JOIN**：内存占用最小，但速度较慢 - 最适合与有限内存的大表进行 JOIN。
* **Grace 哈希 JOIN**：灵活可调内存，适用于具有可调性能特征的大数据集。

<Image img={joins} size="md" alt="Joins - speed vs memory"/>

:::note
每种算法对 JOIN 类型的支持各不相同。可以在 [此处](/guides/joining-tables#choosing-a-join-algorithm) 找到每种算法支持的 JOIN 类型的完整列表。
:::

您可以通过设置 `join_algorithm = 'auto'`（默认值）让 ClickHouse 选择最佳算法，或根据您的工作负载显式控制它。如果需要选择 JOIN 算法以优化性能或内存开销，我们建议参阅 [此指南](/guides/joining-tables#choosing-a-join-algorithm)。

为了获得最佳性能：

* 在高性能工作负载中将 JOIN 限制到最小。
* 每个查询避免超过 3-4 个 JOIN。
* 在真实数据上对不同算法进行基准测试 - 性能根据 JOIN 键分布和数据大小而有所不同。

有关 JOIN 优化策略、JOIN 算法及如何调整它们的更多信息，请参考 [ClickHouse 文档](/guides/joining-tables) 和此 [博客系列](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)。
