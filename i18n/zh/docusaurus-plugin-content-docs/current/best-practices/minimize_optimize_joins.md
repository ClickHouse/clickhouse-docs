---
'slug': '/best-practices/minimize-optimize-joins'
'sidebar_position': 10
'sidebar_label': '最小化和优化 JOINs'
'title': '最小化和优化 JOINs'
'description': '页面描述 JOINs 的最佳实践'
'keywords':
- 'JOIN'
- 'Parallel Hash JOIN'
'show_related_blogs': true
---

import Image from '@theme/IdealImage';
import joins from '@site/static/images/bestpractices/joins-speed-memory.png';

ClickHouse 支持多种 JOIN 类型和算法，且 JOIN 性能在近期版本中显著提升。然而，JOIN 本质上比从单个非规范化表查询更昂贵。非规范化将计算工作从查询时间转移到插入或预处理时间，从而在运行时通常会导致显著更低的延迟。对于实时或对延迟敏感的分析查询，**强烈建议非规范化**。

一般情况下，在以下情况下进行非规范化：

- 表变更不频繁或批量刷新是可以接受的。
- 关系不是多对多或者在基数上不会过高。
- 只有有限的列子集会被查询，即某些列可以从非规范化中排除。
- 你有能力将处理从 ClickHouse 转移到上游系统（如 Flink），在这些系统中可以管理实时丰富或扁平化。

并不是所有数据都需要非规范化 - 应关注频繁被查询的属性。也可以考虑 [物化视图](/best-practices/use-materialized-views) 来逐步计算聚合，而不是复制整个子表。当模式更新较少且延迟至关重要时，非规范化提供了最佳的性能权衡。

有关在 ClickHouse 中非规范化数据的完整指南，请查看 [这里](/data-modeling/denormalization)。

## 何时需要 JOINs {#when-joins-are-required}

当需要 JOINs 时，确保 **至少使用版本 24.12，最好是最新版本**，因为 JOIN 性能在每个新版本中都在持续改进。自 ClickHouse 24.12 起，查询规划器现在会自动将较小的表放置在 JOIN 的右侧，以获得最佳性能 - 这一任务之前需要手动完成。更进一步的增强即将到来，包括更积极的过滤下推和多个 JOIN 的自动重排序。

遵循以下最佳实践以提高 JOIN 性能：

* **避免笛卡尔乘积**：如果左侧的某个值与右侧的多个值匹配，则 JOIN 将返回多行 - 即笛卡尔乘积。如果你的用例不需要右侧的所有匹配结果，而只需要任何单个匹配值，可以使用 `ANY` JOINs（例如 `LEFT ANY JOIN`）。它们比常规 JOINs 更快，内存使用更少。
* **减少 JOIN 表的大小**：JOIN 的运行时和内存消耗与左表和右表的大小成正比。要减少 JOIN 处理的数据量，请在查询的 `WHERE` 或 `JOIN ON` 子句中添加其他过滤条件。ClickHouse 将过滤条件尽可能深地下推到查询计划中，通常是在 JOIN 之前。如果过滤器没有被自动下推（出于某种原因），则重写 JOIN 的一侧为子查询以强制下推。
* **如合适使用字典进行直接 JOIN**：ClickHouse 中的标准 JOIN 分为两个阶段执行：构建阶段遍历右侧以构建哈希表，后续是探测阶段遍历左侧以通过哈希表查找匹配的 JOIN 伙伴。如果右侧是 [字典](/dictionary) 或其他具有键值特征的表引擎（例如 [EmbeddedRocksDB](/engines/table-engines/integrations/embedded-rocksdb) 或 [Join 表引擎](/engines/table-engines/special/join)），则 ClickHouse 可以使用“直接” JOIN 算法，这样就实际消除了构建哈希表的需要，加快了查询处理。此方法适用于 `INNER` 和 `LEFT OUTER` JOIN，且更适合实时分析工作负载。
* **利用表排序进行 JOIN**：ClickHouse 中的每个表都根据表的主键列进行排序。可以利用表排序，通过所谓的排序合并 JOIN 算法，如 `full_sorting_merge` 和 `partial_merge`。与基于哈希表的标准 JOIN 算法不同（见下文，`parallel_hash`，`hash`，`grace_hash`），排序合并 JOIN 算法首先排序，然后合并两个表。如果查询通过各自的主键列 JOIN 了两个表，则排序合并具有一种优化，可以省略排序步骤，从而节省处理时间和开销。
* **避免磁盘溢出 JOIN**：JOIN 的中间状态（例如哈希表）可能会变得过大，以至于无法再适应主内存。在这种情况下，ClickHouse 将默认返回内存不足错误。一些 JOIN 算法（见下文），例如 [`grace_hash`](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2)，[`partial_merge`](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3) 和 [`full_sorting_merge`](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3)，能够将中间状态溢出到磁盘并继续查询执行。然而，使用这些 JOIN 算法时仍需谨慎，因为磁盘访问会显著减慢 JOIN 处理。我们反而建议通过其他方式优化 JOIN 查询，以减少中间状态的大小。
* **在外部 JOIN 中使用默认值作为无匹配标记**：左/右/全外 JOIN 包含来自左/右/两个表的所有值。如果在另一张表中未找到某个值的 JOIN 伙伴，ClickHouse 将用一个特殊标记替换该 JOIN 伙伴。SQL 标准规定数据库使用 NULL 作为这样的标记。在 ClickHouse 中，这需要将结果列包装在 Nullable 中，增加额外的内存和性能开销。作为替代方案，你可以配置设置 `join_use_nulls = 0`，并使用结果列数据类型的默认值作为标记。

:::note 注意谨慎使用字典
在 ClickHouse 中使用字典进行 JOIN 时，重要的是要理解字典设计上不允许重复键。在数据加载期间，任何重复的键都会被默默去重 - 仅保留给定键的最后加载值。这一行为使得字典非常适合一对一或多对一关系，其中只需要最新或权威的值。然而，使用字典处理一对多或多对多关系（例如将角色与演员关联，演员可能有多个角色）将导致静默数据丢失，因为所有与之匹配的行中除了一个外的行都将被丢弃。因此，字典不适用于需要在多个匹配中保持完整关系的场景。
:::

## 选择正确的 JOIN 算法 {#choosing-the-right-join-algorithm}

ClickHouse 支持几种在速度和内存之间进行权衡的 JOIN 算法：

* **并行哈希 JOIN（默认）：** 适合适合内存的小到中等右侧表。
* **直接 JOIN：** Ideal when using dictionaries (or other table engines with key-value characteristics) with `INNER` or `LEFT ANY JOIN`  - 这是进行点查找的最快方法，因为它消除了构建哈希表的需要。
* **全排序合并 JOIN：** 当两个表均按连接键排序时高效。
* **部分合并 JOIN：** 内存占用最小，但速度较慢 - 最适合在内存有限的情况下连接大表。
* **Grace 哈希 JOIN：** 灵活且可调节内存，适合大型数据集，具有可调整的性能特性。

<Image img={joins} size="md" alt="Joins - speed vs memory"/>

:::note
每种算法对 JOIN 类型的支持各不相同。每种算法支持的 JOIN 类型的完整列表可以在 [这里](/guides/joining-tables#choosing-a-join-algorithm) 找到。
:::

你可以通过设置 `join_algorithm = 'auto'`（默认值）让 ClickHouse 自动选择最佳算法，或根据你的工作负载明确控制。如果你需要选择 JOIN 算法以优化性能或内存开销，我们推荐 [此指南](/guides/joining-tables#choosing-a-join-algorithm)。

为了获得最佳性能：

* 在高性能工作负载中将 JOIN 限制在最低限度。
* 避免每个查询中包含超过 3-4 个 JOIN。
* 在真实数据上基准测试不同算法 - 性能根据 JOIN 键的分布和数据大小而变化。

有关 JOIN 优化策略、JOIN 算法及其调优的更多信息，请参阅 [ClickHouse 文档](/guides/joining-tables) 和这 [博客系列](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)。
