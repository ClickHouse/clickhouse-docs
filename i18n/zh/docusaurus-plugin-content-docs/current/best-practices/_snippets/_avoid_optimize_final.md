---
null
...
---

import Image from '@theme/IdealImage';
import simple_merges from '@site/static/images/bestpractices/simple_merges.png';

ClickHouse 表使用 **MergeTree 引擎** 将数据存储为 **不可变的分片**，每次插入数据时都会创建新的分片。

每次插入都会创建一个新的分片，其中包含排序过的、压缩的列文件，以及索引和校验和等元数据。有关分片结构及其形成方式的详细描述，我们推荐查看此 [指南](/parts)。

随着时间的推移，后台进程将较小的分片合并为较大的分片，以减少碎片化并提高查询性能。

<Image img={simple_merges} size="md" alt="简单合并" />

虽然手动触发此合并是很诱人的，如下所示：

```sql
OPTIMIZE TABLE <table> FINAL;
```

**但在大多数情况下，您应避免此操作**，因为它会触发资源密集型操作，可能会影响集群性能。

## 为什么要避免？ {#why-avoid}

### 这是昂贵的 {#its-expensive}

执行 `OPTIMIZE FINAL` 将迫使 ClickHouse 将 **所有** 活跃分片合并为 **单个分片**，即使已经发生了大合并。这涉及到：

1. **解压缩** 所有分片
2. **合并** 数据
3. **再次压缩**
4. **将** 最终分片写入磁盘或对象存储

这些步骤都是 **CPU 和 I/O 密集型** 的，尤其是当涉及到大型数据集时，可能会给您的系统带来显著的压力。

### 它忽略了安全限制 {#it-ignores-safety-limits}

通常，ClickHouse 会避免合并大于 ~150 GB 的分片（可以通过 [max_bytes_to_merge_at_max_space_in_pool](/operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool) 配置）。但是 `OPTIMIZE FINAL` **忽略了这个保护**，这意味着：

* 它可能尝试将 **多个 150 GB 分片** 合并为一个巨大的分片
* 这可能导致 **长时间的合并**，**内存压力**，甚至 **内存溢出错误**
* 这些大型分片可能会变得难以合并，即进一步尝试合并失败，原因如上所述。在需要为正确的查询时间行为进行合并的情况下，这可能会导致意想不到的后果，例如 [使用 ReplacingMergeTree 进行去重](/guides/developer/deduplication#using-replacingmergetree-for-upserts) 时重复数据的积累，从而增加查询时间性能。

## 让后台合并来完成工作 {#let-background-merges-do-the-work}

ClickHouse 已经执行智能的后台合并，以优化存储和查询效率。这些合并是增量的，考虑到资源，并尊重配置的阈值。除非您有非常特定的需求（例如，在冻结表或导出之前整理数据），**否则您最好让 ClickHouse 自行管理合并**。
