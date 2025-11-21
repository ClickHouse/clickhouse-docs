---
slug: /best-practices/minimize-optimize-joins
sidebar_position: 10
sidebar_label: '最小化并优化 JOIN 操作'
title: '最小化并优化 JOIN 操作'
description: '本页介绍 JOIN 的最佳实践'
keywords: ['JOIN', 'Parallel Hash JOIN']
show_related_blogs: true
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import joins from '@site/static/images/bestpractices/joins-speed-memory.png';

ClickHouse 支持多种 JOIN 类型和算法，且在近期版本中 JOIN 性能已有显著提升。然而，与从单个已反规范化的表中查询相比，JOIN 本质上始终更昂贵。反规范化会将计算工作从查询时转移到写入或预处理阶段，这通常会在运行时显著降低延迟。对于实时或对延迟敏感的分析查询，**强烈建议采用反规范化**。

通常在以下情况下应进行反规范化：

* 表更新不频繁，或者可以接受批量刷新。
* 关系并非多对多，或者基数不至于过高。
* 只会查询部分列，即可以将某些列排除在反规范化之外。
* 你具备将处理从 ClickHouse 转移到上游系统（例如 Flink）的能力，并在这些系统中管理实时富化或扁平化。

并非所有数据都需要反规范化——重点关注被频繁查询的属性。同时，可考虑使用[物化视图](/best-practices/use-materialized-views)来增量计算聚合，而不是复制整个子表。当模式更新很少且延迟至关重要时，反规范化能提供最佳的性能权衡。

有关在 ClickHouse 中对数据进行反规范化的完整指南，请参见[此文](/data-modeling/denormalization)。


## 当需要使用 JOIN 时 {#when-joins-are-required}

当需要使用 JOIN 时,请确保使用**至少 24.12 版本,最好使用最新版本**,因为 JOIN 性能在每个新版本中都在持续改进。从 ClickHouse 24.12 开始,查询规划器现在会自动将较小的表放置在连接的右侧以获得最佳性能——这项任务以前必须手动完成。更多增强功能即将推出,包括更积极的过滤器下推和多个连接的自动重新排序。

遵循以下最佳实践来提高 JOIN 性能:

- **避免笛卡尔积**: 如果左侧的一个值与右侧的多个值匹配,JOIN 将返回多行——即所谓的笛卡尔积。如果您的用例不需要右侧的所有匹配项,而只需要任意单个匹配项,则可以使用 `ANY` JOIN(例如 `LEFT ANY JOIN`)。它们比常规 JOIN 更快且使用更少的内存。
- **减小 JOIN 表的大小**: JOIN 的运行时间和内存消耗与左表和右表的大小成正比增长。要减少 JOIN 处理的数据量,请在查询的 `WHERE` 或 `JOIN ON` 子句中添加额外的过滤条件。ClickHouse 会尽可能将过滤条件深入下推到查询计划中,通常在 JOIN 之前。如果过滤器没有自动下推(无论出于何种原因),请将 JOIN 的一侧重写为子查询以强制下推。
- **在适当时通过字典使用直接 JOIN**: ClickHouse 中的标准 JOIN 分两个阶段执行:构建阶段遍历右侧以构建哈希表,然后是探测阶段遍历左侧通过哈希表查找来查找匹配的连接伙伴。如果右侧是[字典](/dictionary)或具有键值特性的其他表引擎(例如 [EmbeddedRocksDB](/engines/table-engines/integrations/embedded-rocksdb) 或 [Join 表引擎](/engines/table-engines/special/join)),则 ClickHouse 可以使用"直接"连接算法,有效地消除了构建哈希表的需要,从而加快查询处理速度。这适用于 `INNER` 和 `LEFT OUTER` JOIN,并且是实时分析工作负载的首选。
- **利用表排序进行 JOIN**: ClickHouse 中的每个表都按表的主键列排序。可以通过使用所谓的排序合并 JOIN 算法(如 `full_sorting_merge` 和 `partial_merge`)来利用表的排序。与基于哈希表的标准 JOIN 算法(见下文,`parallel_hash`、`hash`、`grace_hash`)不同,排序合并 JOIN 算法首先对两个表进行排序,然后合并。如果查询按各自的主键列连接两个表,则排序合并具有省略排序步骤的优化,从而节省处理时间和开销。
- **避免磁盘溢出 JOIN**: JOIN 的中间状态(例如哈希表)可能变得非常大,以至于无法再容纳在主内存中。在这种情况下,ClickHouse 默认会返回内存不足错误。某些连接算法(见下文),例如 [`grace_hash`](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2)、[`partial_merge`](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3) 和 [`full_sorting_merge`](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3),能够将中间状态溢出到磁盘并继续执行查询。然而,这些连接算法应谨慎使用,因为磁盘访问会显著降低连接处理速度。我们建议通过其他方式优化 JOIN 查询以减小中间状态的大小。
- **在外连接中使用默认值作为无匹配标记**: 左/右/全外连接包含左表/右表/两个表的所有值。如果在另一个表中找不到某个值的连接伙伴,ClickHouse 会用一个特殊标记替换连接伙伴。SQL 标准要求数据库使用 NULL 作为这样的标记。在 ClickHouse 中,这需要将结果列包装在 Nullable 中,从而产生额外的内存和性能开销。作为替代方案,您可以配置设置 `join_use_nulls = 0` 并使用结果列数据类型的默认值作为标记。


:::note 谨慎使用字典
在 ClickHouse 中将字典用于 JOIN 时，需要了解字典在设计上不允许出现重复键。在数据加载过程中，任何重复键都会被静默去重——对于给定键，只保留最后加载的那个值。此行为使得字典非常适合一对一或多对一的关系场景，在这些场景中只需要最新或权威的值即可。然而，如果将字典用于一对多或多对多关系（例如将角色与演员做关联，而一个演员可以拥有多个角色），就会导致静默的数据丢失，因为除了一条匹配记录之外，其余匹配行都会被丢弃。因此，在需要在多条匹配结果之间保持完整关系语义的场景下，字典并不适用。
:::



## 选择正确的 JOIN 算法 {#choosing-the-right-join-algorithm}

ClickHouse 支持多种 JOIN 算法,可在速度和内存之间进行权衡:

- **并行哈希 JOIN(默认):** 适用于能够放入内存的中小型右表,速度快。
- **直接 JOIN:** 在使用字典(或其他具有键值特性的表引擎)进行 `INNER` 或 `LEFT ANY JOIN` 时最为理想——这是点查询最快的方法,因为它无需构建哈希表。
- **完全排序合并 JOIN:** 当两个表都按连接键排序时效率高。
- **部分合并 JOIN:** 最小化内存使用但速度较慢——最适合在内存有限的情况下连接大表。
- **Grace 哈希 JOIN:** 灵活且内存可调,适用于具有可调整性能特性的大型数据集。

<Image img={joins} size='md' alt='JOIN — 速度与内存' />

:::note
每种算法对 JOIN 类型的支持各不相同。每种算法支持的连接类型完整列表可以在[此处](/guides/joining-tables#choosing-a-join-algorithm)找到。
:::

您可以通过设置 `join_algorithm = 'auto'`(默认值)让 ClickHouse 选择最佳算法,或根据您的工作负载显式控制。如果您需要选择连接算法以优化性能或内存开销,我们推荐参考[此指南](/guides/joining-tables#choosing-a-join-algorithm)。

为获得最佳性能:

- 在高性能工作负载中尽量减少 JOIN 的使用。
- 避免每个查询中超过 3-4 个连接。
- 在真实数据上对不同算法进行基准测试——性能会根据 JOIN 键分布和数据大小而变化。

有关 JOIN 优化策略、JOIN 算法以及如何调优的更多信息,请参阅 [ClickHouse 文档](/guides/joining-tables)和此[博客系列](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)。
