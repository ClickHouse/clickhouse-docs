---
'slug': '/best-practices/minimize-optimize-joins'
'sidebar_position': 10
'sidebar_label': '最小化和优化JOINs'
'title': '最小化和优化JOINs'
'description': '页面描述JOINs的最佳实践'
---

import Image from '@theme/IdealImage';
import joins from '@site/static/images/bestpractices/joins-speed-memory.png';

ClickHouse 支持多种 JOIN 类型和算法，并且 JOIN 性能在最近的版本中显著提高。然而，相较于从单个去规范化的表查询，JOIN 本质上更为昂贵。去规范化将计算工作从查询时间转移到插入或预处理时间，这通常会导致运行时延迟显著降低。对于实时或对延迟敏感的分析查询，**强烈建议去规范化**。

一般来说，当满足以下条件时，进行去规范化：

- 表格更改不频繁或当批量刷新是可以接受的。
- 关系不是多对多的，或者基数不是过高。
- 仅查询有限子集的列，即某些列可以被排除在去规范化之外。
- 你有能力将处理转移到上游系统，如 Flink，在那里可以管理实时的丰富或扁平化。

并非所有数据都需要去规范化——关注于那些经常被查询的属性。还可以考虑 [物化视图](/best-practices/use-materialized-views) 来增量计算聚合，而不是复制整个子表。当模式更新稀少且延迟至关重要时，去规范化提供了最佳性能权衡。

关于在 ClickHouse 中去规范化数据的完整指南，请参见 [这里](/data-modeling/denormalization)。

## 何时需要 JOIN {#when-joins-are-required}

当需要 JOIN 时，确保使用 **至少版本 24.12，最好是最新版本**，因为 JOIN 性能随着每个新版本的发布继续改善。截至 ClickHouse 24.12，查询计划器现在自动将较小的表放在 JOIN 的右侧以实现最佳性能——这项任务之前需要手动完成。更进一步的增强即将到来，包括更具攻击性的过滤下推和多个 JOIN 的自动重新排序。

遵循以下最佳实践以提高 JOIN 性能：

* **避免笛卡尔积**：如果左侧的一个值与右侧的多个值匹配，则 JOIN 将返回多个行——即所谓的笛卡尔积。如果你的用例不需要右侧的所有匹配，而只需要任何一个匹配，可使用 `ANY` JOIN（例如 `LEFT ANY JOIN`）。它们比常规 JOIN 更快，使用更少的内存。
* **减少 JOIN 表的大小**：JOIN 的运行时间和内存消耗与左侧和右侧表的大小成正比。要减少 JOIN 处理的数据量，请在查询的 `WHERE` 或 `JOIN ON` 子句中添加其他过滤条件。ClickHouse 会尽可能将过滤条件下推到查询计划中，通常是在 JOIN 之前。如果过滤器没有自动下推（出于任何原因），请将 JOIN 的一侧重写为子查询以强制下推。
* **在适当情况下通过字典使用直接 JOIN**：ClickHouse 中的标准 JOIN 分为两个阶段：构建阶段迭代右侧以构建哈希表，随后是探测阶段迭代左侧通过哈希表查找匹配的 JOIN 伙伴。如果右侧是一个 [字典](/dictionary) 或其他具有键值特征的表引擎（例如 [EmbeddedRocksDB](/engines/table-engines/integrations/embedded-rocksdb) 或 [Join 表引擎](/engines/table-engines/special/join)），则 ClickHouse 可以使用“直接” JOIN 算法，这实际上消除了构建哈希表的需要，从而加快查询处理。这适用于 `INNER` 和 `LEFT OUTER` JOIN，并且对于实时分析工作负载是首选。
* **利用表排序进行 JOIN**：ClickHouse 中的每个表都按表的主键列排序。可以通过所谓的排序归并 JOIN 算法（如 `full_sorting_merge` 和 `partial_merge`）利用表排序。与基于哈希表的标准 JOIN 算法（见下文，`parallel_hash`，`hash`，`grace_hash`）不同，排序归并 JOIN 算法首先对两个表进行排序，然后合并。如果查询通过各自的主键列对两个表进行 JOIN，则排序归并拥有一个优化，可以省略排序步骤，从而节省处理时间和开销。
* **避免磁盘溢出 JOIN**：JOIN 的中间状态（例如哈希表）可能变得太大以至于无法适应主内存。在这种情况下，ClickHouse 默认将返回内存不足错误。有些 JOIN 算法（见下文），例如 [`grace_hash`](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2)，[`partial_merge`](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3) 和 [`full_sorting_merge`](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3)，能够将中间状态溢出到磁盘并继续执行查询。然而，仍应谨慎使用这些 JOIN 算法，因为磁盘访问可能会显著减慢 JOIN 处理。我们建议通过其他方式优化 JOIN 查询，以减少中间状态的大小。
* **在外部 JOIN 中使用默认值作为无匹配标记**：左/右/完整外部 JOIN 包含来自左/右/两个表的所有值。如果在另一个表中未找到某个值的 JOIN 伙伴，则 ClickHouse 用一个特殊标记替换 JOIN 伙伴。SQL 标准规定数据库使用 NULL 作为这种标记。在 ClickHouse 中，这需要将结果列包装在 Nullable 中，造成额外的内存和性能开销。作为替代方案，您可以配置设置 `join_use_nulls = 0` 并使用结果列数据类型的默认值作为标记。

:::note 小心使用字典
在 ClickHouse 中使用字典进行 JOIN 时，重要的是要了解字典设计上不允许重复键。在数据加载期间，任何重复键都会被悄然去重——仅保留给定键的最后加载值。这种行为使字典非常适合一对一或多对一关系，在这些情况下只需要最新或权威的值。然而，对于一对多或多对多关系（例如将角色连接到演员，其中一个演员可以有多个角色），则会导致隐性数据丢失，因为匹配的行中除了一个之外的所有行都会被丢弃。因此，字典不适合需要在多个匹配之间保持完整关系的场景。
:::

## 选择正确的 JOIN 算法 {#choosing-the-right-join-algorithm}

ClickHouse 支持多种 JOIN 算法，它们在速度和内存之间进行权衡：

* **并行哈希 JOIN（默认）：** 对于适合内存的小到中型右侧表快速。
* **直接 JOIN:** 在使用字典（或其他具有键值特征的表引擎）时理想，适用于 `INNER` 或 `LEFT ANY JOIN` - 这是点查找的最快方法，因为它消除了构建哈希表的需要。
* **完全排序归并 JOIN:** 当两个表都按照 JOIN 键排序时高效。
* **部分归并 JOIN:** 最小化内存但速度较慢——适合在有限内存下连接大表。
* **Grace 哈希 JOIN:** 灵活且可调内存，适合具有可调性能特征的大型数据集。

<Image img={joins} size="md" alt="Joins - speed vs memory"/>

:::note
每个算法对 JOIN 类型的支持不同。每个算法支持的 JOIN 类型的完整列表可以在 [这里](/guides/joining-tables#choosing-a-join-algorithm) 找到。
:::

您可以通过设置 `join_algorithm = 'auto'`（默认）来让 ClickHouse 选择最佳算法，或根据您的工作负载明确控制它。如果您需要选择一个 JOIN 算法以优化性能或内存开销，我们建议参考 [本指南](/guides/joining-tables#choosing-a-join-algorithm)。

为了获得最佳性能：

* 在高性能工作负载中将 JOIN 限制为最低。
* 每个查询中避免超过 3–4 次 JOIN。
* 在真实数据上基准测试不同的算法——性能根据 JOIN 键的分布和数据大小而变化。

有关 JOIN 优化策略、JOIN 算法及其调整方法的更多信息，请参阅 [ClickHouse 文档](/guides/joining-tables) 和这系列 [博客](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)。
