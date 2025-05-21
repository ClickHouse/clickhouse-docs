---
'slug': '/best-practices/choosing-a-partitioning-key'
'sidebar_position': 10
'sidebar_label': '选择分区键'
'title': '选择分区键'
'description': '描述如何选择分区键的页面'
---

import Image from '@theme/IdealImage';
import partitions from '@site/static/images/bestpractices/partitions.png';
import merges_with_partitions from '@site/static/images/bestpractices/merges_with_partitions.png';

:::note 数据管理技术
分区主要是一种数据管理技术，而不是查询优化工具，尽管它可以在特定工作负载中提高性能，但它不应成为加速查询的首选机制；分区键必须被谨慎选择，明确了解其影响，并且仅在与数据生命周期需求或经过充分理解的访问模式对齐时使用。
:::

在 ClickHouse 中，分区根据指定的键将数据组织成逻辑段。在表创建时使用 `PARTITION BY` 子句进行定义，通常用于按时间间隔、类别或其他与业务相关的维度对行进行分组。分区表达式的每个唯一值在磁盘上形成其自己的物理分区，ClickHouse 为每个这些值存储数据在单独的部分中。分区改善了数据管理，简化了保留策略，并可以帮助某些查询模式。

例如，考虑以下具有分区键 `toStartOfMonth(date)` 的英国价格数据集表。

```sql
CREATE TABLE uk.uk_price_paid_simple_partitioned
(
    date Date,
 town LowCardinality(String),
 street LowCardinality(String),
 price UInt32
)
ENGINE = MergeTree
ORDER BY (town, street)
PARTITION BY toStartOfMonth(date)
```

每当一组行被插入表中时，ClickHouse 并不是创建一个包含所有插入行的单一数据部分（如[这里](/parts)所述），而是为插入行中每个唯一的分区键值创建一个新的数据部分：

<Image img={partitions} size="lg" alt="Partitions" />

ClickHouse 服务器首先根据示例插入中示意图上方的 4 行的分区键值 `toStartOfMonth(date)` 拆分这些行。然后，对于每个识别的分区，这些行按[通常](/parts)流程处理，执行几个顺序步骤（① 排序，② 列拆分，③ 压缩，④ 写入磁盘）。

有关分区的更详细说明，我们推荐[本指南](/partitions)。

启用分区后，ClickHouse 仅在分区内[合并](/merges)数据部分，而不跨分区合并。我们为上面的示例表进行概述：

<Image img={merges_with_partitions} size="md" alt="Partitions" />

## 分区的应用 {#applications-of-partitioning}

分区是管理 ClickHouse 中大型数据集的强大工具，尤其是在可观察性和分析用例中。它通过允许整个分区（通常与时间或业务逻辑对齐）在单个元数据操作中被删除、移动或归档，支持高效的数据生命周期操作。这比行级删除或复制操作要快得多且资源占用较少。分区还与 ClickHouse 特性如 TTL 和分层存储整洁集成，使得在不需要自定义编排的情况下实施保留策略或热/冷存储策略成为可能。例如，最近的数据可以保留在快速 SSD 支持的存储中，而较旧的分区则自动移动到更便宜的对象存储中。

尽管分区可以提高某些工作负载的查询性能，但它也可能对响应时间产生负面影响。

如果分区键不在主键中并且你正在进行按此键过滤，用户可能会在查询性能上看到分区的改善。有关示例，请参见[这里](/partitions#query-optimization)。

反之，如果查询需要跨分区查询，性能可能会因总部分的数量增加而负面影响。因此，用户应该在考虑将分区作为查询优化技术之前，了解它们的访问模式。

总之，用户应主要将分区视为一种数据管理技术。有关管理数据的示例，请参见可观察性用例指南中的["管理数据"](/observability/managing-data)以及核心概念 - 表分区中的["表分区的用途是什么？"](/partitions#data-management)。

## 选择低基数分区键 {#choose-a-low-cardinality-partitioning-key}

重要的是，更多的部分会对查询性能产生负面影响。因此，如果部分数量超过在[总数](/operations/settings/merge-tree-settings#max_parts_in_total)或[每个分区](/operations/settings/merge-tree-settings#parts_to_throw_insert)中指定的限制，ClickHouse 会响应 "too many parts" 错误。

为分区键选择正确的 **基数** 是至关重要的。基数高的分区键—其不同分区值的数量很大—可能导致数据部分的激增。由于 ClickHouse 不会跨分区合并部分，因此过多的分区将导致未合并部分过多，最终触发“太多部分”错误。[合并对减少存储碎片和优化查询速度至关重要](/merges)，但对于高基数的分区，这种合并潜力会丧失。

相比之下，**低基数分区键**—具有少于 100 - 1,000 个不同值—通常是最佳选择。它能够实现高效的部分合并，保持元数据开销低，并避免在存储中创建过多对象。此外，ClickHouse 会自动在分区列上构建 MinMax 索引，这可以显著加速在这些列上过滤的查询。例如，当表按 `toStartOfMonth(date)` 进行分区时，按月过滤可使引擎完全跳过不相关的分区及其部分。

尽管分区可以改善某些查询模式的性能，但它主要是一个数据管理特性。在许多情况下，跨所有分区的查询可能比使用非分区表慢，因为数据碎片增加并且更多部分被扫描。合理使用分区，并始终确保所选择的键具有低基数，并与数据生命周期策略相一致（例如，通过 TTL 进行保留）。如果不确定分区是否必要，可以考虑先不使用它，然后根据观察到的访问模式进行优化。
