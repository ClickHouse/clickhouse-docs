import Image from '@theme/IdealImage';
import simple_merges from '@site/static/images/bestpractices/simple_merges.png';

使用 **MergeTree 引擎** 的 ClickHouse 表会将数据以 **不可变的分片（parts）** 形式存储在磁盘上，每次插入数据时都会创建新的分片。

每次插入都会创建一个新的分片，其中包含已排序、压缩的列文件，以及诸如索引和校验和等元数据。关于分片结构以及其形成方式的详细说明，请参阅此[指南](/parts)。

随着时间推移，后台进程会将较小的分片合并为更大的分片，以减少碎片并提升查询性能。

<Image img={simple_merges} size="md" alt="简单合并" />

虽然我们可能会想通过以下方式手动触发这一合并操作：

```sql
OPTIMIZE TABLE <表> FINAL;
```

**在大多数情况下，你应当避免执行 `OPTIMIZE FINAL` 操作**，因为它会触发资源密集型流程，可能影响集群性能。

:::note OPTIMIZE FINAL vs FINAL
`OPTIMIZE FINAL` 与 `FINAL` 并不相同。`FINAL` 在某些情况下是必须使用的，比如在使用 `ReplacingMergeTree` 时，为了获得无重复的结果。通常来说，如果查询是在与主键相同的列上进行过滤，那么使用 `FINAL` 是没有问题的。
:::


## 为什么要避免使用? {#why-avoid}

### 开销巨大 {#its-expensive}

运行 `OPTIMIZE FINAL` 会强制 ClickHouse 将**所有**活动部分合并为**单个部分**,即使已经执行过大规模合并。这个过程包括:

1. **解压缩**所有部分
2. **合并**数据
3. 再次**压缩**数据
4. 将最终部分**写入**磁盘或对象存储

这些步骤属于**CPU 和 I/O 密集型**操作,会对系统造成显著负担,尤其是在处理大型数据集时。

### 忽略安全限制 {#it-ignores-safety-limits}

通常情况下,ClickHouse 会避免合并大于约 150 GB 的部分(可通过 [max_bytes_to_merge_at_max_space_in_pool](/operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool) 配置)。但 `OPTIMIZE FINAL` **会忽略此安全保护机制**,这意味着:

- 它可能会尝试将**多个 150 GB 的部分**合并为一个超大部分
- 这可能导致**合并时间过长**、**内存压力增大**,甚至出现**内存溢出错误**
- 这些大型部分可能变得难以合并,即由于上述原因,进一步合并它们的尝试会失败。在需要通过合并来确保正确查询行为的情况下,这可能导致不良后果,例如 [ReplacingMergeTree 中累积重复数据](/guides/developer/deduplication#using-replacingmergetree-for-upserts),从而降低查询性能。


## 让后台合并完成工作 {#let-background-merges-do-the-work}

ClickHouse 已经会执行智能后台合并以优化存储和查询效率。这些合并是增量式的、具有资源感知能力的,并且会遵守配置的阈值。除非您有非常特定的需求(例如,在冻结表或导出之前最终确定数据),**否则最好让 ClickHouse 自行管理合并**。
