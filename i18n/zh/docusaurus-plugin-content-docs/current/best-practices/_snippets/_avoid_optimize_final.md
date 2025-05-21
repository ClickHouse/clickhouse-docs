---
{}
---

import Image from '@theme/IdealImage';
import simple_merges from '@site/static/images/bestpractices/simple_merges.png';

ClickHouse 表使用 **MergeTree 引擎** 将数据以 **不可变分片** 的形式存储在磁盘上，每次插入数据时都会创建新的分片。

每次插入都会创建一个新的分片，其中包含已排序的、压缩的列文件，以及索引和校验和等元数据。要了解分片结构及其形成方式的详细说明，我们推荐参阅这个 [指南](/parts)。

随着时间的推移，后台进程会将较小的分片合并为较大的分片，以减少碎片并提高查询性能。

<Image img={simple_merges} size="md" alt="简单合并" />

虽然手动触发此合并是很诱人的，但:

```sql
OPTIMIZE TABLE <table> FINAL;
```

**在大多数情况下，您应该避免此操作**，因为这会启动资源密集型操作，从而可能影响集群性能。

## 为什么要避免？ {#why-avoid}

### 这很昂贵 {#its-expensive}

运行 `OPTIMIZE FINAL` 会迫使 ClickHouse 将 **所有** 活跃分片合并为 **单个分片**，即使已发生了大规模合并。这涉及到：

1. **解压** 所有分片
2. **合并** 数据
3. **再次压缩**
4. **将** 最终分片写入磁盘或对象存储

这些步骤是 **CPU 和 I/O 密集型** 的，尤其是在涉及大数据集时，可能会对您的系统造成显著压力。

### 它忽略了安全限制 {#it-ignores-safety-limits}

通常，ClickHouse 会避免合并大于 ~150 GB 的分片（可通过 [max_bytes_to_merge_at_max_space_in_pool](/operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool) 配置）。但是，`OPTIMIZE FINAL` **会忽略此保护措施**，这意味着：

* 它可能会尝试将 **多个 150 GB 的分片** 合并为一个巨大的分片
* 这可能导致 **较长的合并时间**、**内存压力**，甚至 **内存溢出错误**
* 这些大型分片可能会变得难以合并，即更进一步合并的尝试会因上述原因失败。在需要合并以保证查询时间行为的情况下，这可能导致不良后果，例如 [在 ReplacingMergeTree 中累积重复项](/guides/developer/deduplication#using-replacingmergetree-for-upserts)，从而增加查询时间性能。

## 让后台合并来完成工作 {#let-background-merges-do-the-work}

ClickHouse 已经执行智能的后台合并，以优化存储和查询效率。这些合并是增量的、资源感知的，并且遵循配置阈值。除非您有非常具体的需求（例如，在冻结表或导出之前完成数据），**否则您最好让 ClickHouse 自行管理合并**。
