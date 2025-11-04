---
'slug': '/best-practices/minimize-optimize-joins'
'sidebar_position': 10
'sidebar_label': '最小化和优化 JOINs'
'title': '最小化和优化 JOINs'
'description': '描述 JOINs 最佳实践的页面'
'keywords':
- 'JOIN'
- 'Parallel Hash JOIN'
'show_related_blogs': true
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import joins from '@site/static/images/bestpractices/joins-speed-memory.png';

ClickHouse 支持多种类型的 JOIN 和算法，并且 JOIN 性能在最近的版本中有了显著提升。然而，JOIN 本质上比从单个去规范化的表中查询更为昂贵。去规范化将计算工作从查询时间转移到插入或预处理时间，这通常会在运行时显著降低延迟。对于实时或时延敏感的分析查询，**强烈建议使用去规范化**。

一般来说，当满足以下条件时应去规范化：

- 表不经常变化，或当批量刷新是可以接受的。
- 关系不是多对多，或基数不异常高。
- 只会查询有限子集的列，即某些列可以从去规范化中排除。
- 您能够将处理转移到上游系统（如 Flink），在这些系统中可以管理实时丰富或扁平化。

并非所有数据都需要去规范化——重点关注经常查询的属性。还可以考虑 [物化视图](/best-practices/use-materialized-views) 来增量计算聚合，而不是复制整个子表。当模式更新较少且延迟至关重要时，去规范化提供了最佳性能权衡。

有关在 ClickHouse 中去规范化数据的完整指南，请参见 [这里](/data-modeling/denormalization)。

## 何时需要 JOIN {#when-joins-are-required}

当需要 JOIN 时，请确保使用 **至少版本 24.12，最好是最新版本**，因为 JOIN 性能随着每个新版本的发布而不断提高。根据 ClickHouse 24.12，查询规划器现在会自动将较小的表放在 JOIN 的右侧以优化性能——这一任务以前需要手动完成。更多增强功能即将推出，包括更强的过滤推送和多个 JOIN 的自动重排序。

遵循以下最佳实践以提高 JOIN 性能：

* **避免笛卡尔积**：如果左侧的某个值与右侧的多个值匹配，JOIN 将返回多行——所谓的笛卡尔积。如果您的用例并不需要来自右侧的所有匹配项，而只是任何单个匹配项，则可以使用 `ANY` JOIN（例如，`LEFT ANY JOIN`）。它们比常规 JOIN 更快，占用更少的内存。
* **减少已 JOIN 表的大小**：JOIN 的运行时间和内存消耗与左侧和右侧表的大小成正比。要减少 JOIN 处理的数据量，请在查询的 `WHERE` 或 `JOIN ON` 子句中添加额外的过滤条件。ClickHouse 会尽可能深地推送过滤条件到查询计划中，通常是在 JOIN 之前。如果过滤条件未自动推送（出于任何原因），可以将 JOIN 的一侧重写为子查询以强制推送。
* **适当时通过字典使用直接 JOIN**：ClickHouse 中的标准 JOIN 分为两个阶段执行：构建阶段迭代右侧以构建哈希表，随后是探测阶段迭代左侧通过哈希表查找匹配的 JOIN 伙伴。如果右侧是一个 [字典](/dictionary) 或其他具有键值特征的表引擎（例如 [EmbeddedRocksDB](/engines/table-engines/integrations/embedded-rocksdb) 或 [Join 表引擎](/engines/table-engines/special/join)），则 ClickHouse 可以使用“直接” JOIN 算法，有效地消除了构建哈希表的需要，从而加速查询处理。这适用于 `INNER` 和 `LEFT OUTER` JOIN，并且是实时分析工作负载的首选。
* **利用表排序进行 JOIN**：ClickHouse 中的每个表都是按照表的主键列排序的。可以利用所谓的排序合并 JOIN 算法（如 `full_sorting_merge` 和 `partial_merge`）利用表的排序。与基于哈希表的标准 JOIN 算法（见下文 `parallel_hash`，`hash`，`grace_hash`）不同，排序合并 JOIN 算法首先对两个表进行排序，然后进行合并。如果查询通过各自的主键列对两个表进行 JOIN，则排序合并具有省略排序步骤的优化，从而节省处理时间和开销。
* **避免磁盘溢出 JOIN**：JOIN 的中间状态（例如，哈希表）可能会变得非常大，以至于无法再装入主内存。在这种情况下，ClickHouse 将默认返回内存不足错误。一些 JOIN 算法（见下文），例如 [`grace_hash`](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2)，[`partial_merge`](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3) 和 [`full_sorting_merge`](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3)，能够将中间状态溢出到磁盘，并继续执行查询。然而，应该谨慎使用这些JOIN算法，因为磁盘访问可能显著减慢 JOIN 处理。我们建议以其他方式优化 JOIN 查询，以减少中间状态的大小。
* **将默认值作为外部 JOIN 中的无匹配标记**：左/右/全外部 JOIN 包含左/右/两个表的所有值。如果在另一个表中找不到某个值的 JOIN 伙伴，ClickHouse 将用一个特殊标记替换此 JOIN 伙伴。SQL 标准要求数据库使用 NULL 作为此类标记。在 ClickHouse 中，这需要将结果列包装在 Nullable 中，从而产生额外的内存和性能开销。作为替代，您可以配置设置 `join_use_nulls = 0`，并使用结果列数据类型的默认值作为标记。

:::note 谨慎使用字典
在 ClickHouse 中使用字典进行 JOIN 时，了解字典的设计是不允许重复键的，在数据加载过程中，任何重复的键都会被静默去重——仅保留给定键的最后加载值。这种行为使得字典非常适合一对一或多对一的关系，其中只需要最新或权威的值。然而，将字典用于一对多或多对多关系（例如，将角色链接到演员，其中一个演员可以有多个角色）会导致静默数据丢失，因为匹配的行中只保留一行。因此，字典不适合需要跨多个匹配保持完整关系保真度的场景。
:::

## 选择合适的 JOIN 算法 {#choosing-the-right-join-algorithm}

ClickHouse 支持几种 JOIN 算法，速度和内存之间进行权衡：

* **并行哈希 JOIN（默认）：** 针对适合内存中的小到中型右侧表快速。
* **直接 JOIN：** 使用字典（或其他具有键值特征的表引擎）时理想——这是最佳的针对点查找的方法，因为它消除了构建哈希表的需要。
* **全排序合并 JOIN：** 当两个表都按 JOIN 键排序时有效。
* **部分合并 JOIN：** 最小化内存，但较慢——最佳用于连接大表但内存有限的情况。
* **Grace 哈希 JOIN：** 灵活且可调节内存，适用于具有可调性能特征的大数据集。

<Image img={joins} size="md" alt="Joins - speed vs memory"/>

:::note
每种算法对 JOIN 类型的支持各不相同。每种算法支持的 JOIN 类型的完整列表可以在 [这里](/guides/joining-tables#choosing-a-join-algorithm) 找到。
:::

您可以通过设置 `join_algorithm = 'auto'`（默认）来让 ClickHouse 选择最佳算法，或者根据工作负载明确控制。如果您需要选择一个 JOIN 算法以优化性能或内存开销，建议参考 [本指南](/guides/joining-tables#choosing-a-join-algorithm)。

为了获得最佳性能：

* 在高性能工作负载中过少使用 JOIN。
* 每个查询避免超过 3-4 个 JOIN。
* 在实际数据上对不同算法进行基准测试——性能会根据 JOIN 键分布和数据大小变化。

有关 JOIN 优化策略、JOIN 算法以及如何调整它们的更多信息，请参考 [ClickHouse 文档](/guides/joining-tables) 和这篇 [博客系列](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)。
