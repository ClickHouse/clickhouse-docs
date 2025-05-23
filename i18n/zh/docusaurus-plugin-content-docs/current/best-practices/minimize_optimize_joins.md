---
'slug': '/best-practices/minimize-optimize-joins'
'sidebar_position': 10
'sidebar_label': '最小化和优化 JOINs'
'title': '最小化和优化 JOINs'
'description': '页面描述 JOINs 的最佳实践'
---

import Image from '@theme/IdealImage';
import joins from '@site/static/images/bestpractices/joins-speed-memory.png';

ClickHouse 支持多种 JOIN 类型和算法，并且 JOIN 性能在最近的版本中显著改善。然而，JOIN 本质上比从单个非规范化表中查询要更昂贵。非规范化将计算工作从查询时间转移到插入或预处理时间，这通常会显著降低运行时的延迟。对于实时或对延迟敏感的分析查询，**强烈建议非规范化**。

一般来说，当满足以下条件时，可以考虑非规范化：

- 表的变更不频繁或可接受批量刷新。
- 关系不是多对多或者基数没有过高。
- 只会查询限制的列子集，即某些列可以排除在非规范化之外。
- 您有能力将处理转移到 ClickHouse 之外的上游系统，如 Flink，以便比较实时的补充或扁平化。

并非所有数据都需要非规范化——请关注频繁查询的属性。还可以考虑 [物化视图](/best-practices/use-materialized-views) 来增量计算聚合，而不是复制整个子表。当模式更新较少且对延迟要求关键时，非规范化提供了最佳的性能权衡。

有关在 ClickHouse 中非规范化数据的完整指南，请参见 [这里](/data-modeling/denormalization)。

## 何时需要 JOIN {#when-joins-are-required}

当需要 JOIN 时，请确保您使用的是 **至少版本 24.12，并且最好是最新版本**，因为每个新版本的 JOIN 性能不断提高。从 ClickHouse 24.12 开始，查询规划器现在会自动将较小的表放置在 JOIN 的右侧，以获得最佳性能——这一任务以前必须手动完成。更进一步的改进即将到来，包括更具侵略性的过滤下推和自动调整多个 JOIN 的顺序。

遵循以下最佳实践以提高 JOIN 性能：

* **避免笛卡尔积**：如果左侧的一个值与右侧的多个值匹配，JOIN 将返回多行——即所谓的笛卡尔积。如果您的用例不需要从右侧获取所有匹配项，而只需要任意单个匹配，您可以使用 `ANY` JOIN（例如 `LEFT ANY JOIN`）。它们比常规 JOIN 更快，且占用更少内存。
* **减少 JOIN 表的大小**：JOIN 的运行时和内存消耗与左侧和右侧表的大小呈正比。为了减少 JOIN 处理的数据量，请在查询的 `WHERE` 或 `JOIN ON` 子句中添加额外的过滤条件。ClickHouse 会将过滤条件尽可能深地下推到查询计划中，通常是在 JOIN 之前。如果过滤条件没有自动下推（出于任何原因），请将 JOIN 的一侧重写为子查询以强制下推。
* **在适当的情况下使用字典进行直接 JOIN**：ClickHouse 中的标准 JOIN 分为两个阶段执行：构建阶段迭代右侧以构建哈希表，然后是探测阶段迭代左侧通过哈希表查找匹配的 JOIN 伙伴。如果右侧是 [字典](/dictionary) 或其他具有键值特征的表引擎（例如 [EmbeddedRocksDB](/engines/table-engines/integrations/embedded-rocksdb) 或 [JOIN 表引擎](/engines/table-engines/special/join)），那么 ClickHouse 可以使用“直接”JOIN 算法，这有效地省略了构建哈希表的需要，从而加快查询处理。这适用于 `INNER` 和 `LEFT OUTER` JOIN，并且在实时分析工作负载中更受欢迎。
* **利用表的排序进行 JOIN**：ClickHouse 中的每个表都是按照表的主键列进行排序的。可以通过所谓的排序合并 JOIN 算法（如 `full_sorting_merge` 和 `partial_merge`）来利用表的排序。与基于哈希表的标准 JOIN 算法（见下文，`parallel_hash`，`hash`，`grace_hash`）不同，排序合并 JOIN 算法首先对两个表进行排序，然后再进行合并。如果查询按各自的主键列为两个表进行 JOIN，则排序合并具有一种优化，省略排序步骤，从而节省处理时间和开销。
* **避免磁盘溢出 JOIN**：JOIN 的中间状态（例如哈希表）可能会变得如此庞大，以至于不再适合主内存。在这种情况下，ClickHouse 默认会返回内存不足的错误。一些 JOIN 算法（见下文），例如 [`grace_hash`](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2)，[`partial_merge`](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3) 和 [`full_sorting_merge`](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3)，能够将中间状态溢出到磁盘并继续查询执行。然而，这些 JOIN 算法应谨慎使用，因为磁盘访问可能会显著减慢 JOIN 处理。我们建议以其他方式优化 JOIN 查询，以减少中间状态的大小。
* **在外层 JOIN 中使用默认值作为无匹配标记**：左/右/全外 JOIN 包括来自左/右/两个表的所有值。如果在另一个表中找不到某个值的 JOIN 伙伴，ClickHouse 将用一个特殊标记替换该 JOIN 伙伴。SQL 标准规定数据库使用 NULL 作为此标记。在 ClickHouse 中，这需要将结果列包装为 Nullable，增加额外的内存和性能开销。作为替代，您可以配置设置 `join_use_nulls = 0`，并使用结果列数据类型的默认值作为标记。


:::note 谨慎使用字典
在 ClickHouse 中使用字典进行 JOIN 时，了解字典的设计不允许重复关键字是很重要的。在数据加载期间，任何重复的关键字都会被默默去重——仅保留给定关键字最后加载的值。这种行为使字典非常适合一对一或多对一的关系，只需求最新或权威的值。然而，在一对多或多对多关系中使用字典（例如，将角色连接到一个演员，演员可以有多个角色）将导致无声的数据丢失，因为匹配的行中只有一行会被保留。因此，字典不适合在多个匹配之间保持完全关系的场景。
:::

## 选择正确的 JOIN 算法 {#choosing-the-right-join-algorithm}

ClickHouse 支持几种在速度和内存之间权衡的 JOIN 算法：

* **并行哈希 JOIN（默认）：** 对于适合内存的小到中等右侧表非常快速。
* **直接 JOIN：** 在使用字典（或其他具有键值特征的表引擎）时理想，适用于 `INNER` 或 `LEFT ANY JOIN`——这是进行点查找的最快方法，因为它消除了构建哈希表的需要。
* **全排序合并 JOIN：** 当两个表都按 JOIN 键排序时效率高。
* **部分合并 JOIN：** 最小化内存使用但速度较慢——最适合将大表与内存有限的情况进行关联。
* **Grace 哈希 JOIN：** 灵活且可调节内存，适合大型数据集，具有可调整的性能特性。

<Image img={joins} size="md" alt="Joins - speed vs memory"/>

:::note
每种算法对 JOIN 类型的支持程度不同。每种算法支持的 JOIN 类型完整列表可以在 [这里](/guides/joining-tables#choosing-a-join-algorithm) 找到。
:::

您可以通过设置 `join_algorithm = 'auto'`（默认情况下）让 ClickHouse 选择最佳算法，或者根据您的工作负载明确控制。如果您需要选择一种 JOIN 算法来优化性能或内存开销，我们建议参阅 [此指南](/guides/joining-tables#choosing-a-join-algorithm)。

为了获得最佳性能：

* 在高性能负载中，尽量减少 JOIN 的使用。
* 每个查询避免超过 3-4 次 JOIN。
* 在真实数据上基准测试不同算法——性能因 JOIN 键分布和数据大小而异。

有关 JOIN 优化策略、JOIN 算法以及如何调整它们的更多信息，请参阅 [ClickHouse 文档](/guides/joining-tables) 和此 [博客系列](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)。
