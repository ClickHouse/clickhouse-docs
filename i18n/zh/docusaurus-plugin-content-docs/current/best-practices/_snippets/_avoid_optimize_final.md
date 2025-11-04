import Image from '@theme/IdealImage';
import simple_merges from '@site/static/images/bestpractices/simple_merges.png';

ClickHouse 表使用 **MergeTree 引擎** 将数据以 **不可变部分** 的形式存储在磁盘上，每次插入数据时都会创建。 

每次插入都会生成一个新部分，包含排序、压缩的列文件，以及索引和校验和等元数据。有关部分结构及其形成方式的详细描述，我们推荐此 [指南](/parts)。

随着时间的推移，后台进程将较小的部分合并成更大的部分，以减少碎片化并提高查询性能。

<Image img={simple_merges} size="md" alt="简单合并" />

尽管手动触发此合并是诱人的，但：

```sql
OPTIMIZE TABLE <table> FINAL;
```

**在大多数情况下，您应该避免使用 `OPTIMIZE FINAL` 操作**，因为它会启动资源密集型操作，这可能会影响集群性能。

:::note OPTIMIZE FINAL 与 FINAL
`OPTIMIZE FINAL` 并不等同于 `FINAL`，后者在某些情况下是必要的，以避免结果重复，例如与 `ReplacingMergeTree` 一起使用。一般来说，如果您的查询过滤的列与主键中的列相同，使用 `FINAL` 是可以的。
:::

## 为什么要避免？  {#why-avoid}

### 代价高昂 {#its-expensive}

运行 `OPTIMIZE FINAL` 强制 ClickHouse 将 **所有** 活跃部分合并为 **单个部分**，即使已经发生了大型合并。这涉及：

1. **解压** 所有部分
2. **合并** 数据
3. **再压缩**
4. **将** 最终部分写入磁盘或对象存储

这些步骤是 **CPU 和 I/O 密集型的**，可能会对您的系统造成重大压力，尤其是在涉及大型数据集时。

### 忽略安全限制 {#it-ignores-safety-limits}

通常，ClickHouse 避免合并超过 ~150 GB 的部分（可以通过 [max_bytes_to_merge_at_max_space_in_pool](/operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool) 配置）。但 `OPTIMIZE FINAL` **会忽略此保护措施**，这意味着：

* 它可能尝试将 **多个 150 GB 部分** 合并成一个巨大的部分
* 这可能导致 **长时间合并**、**内存压力**，甚至 **内存溢出错误**
* 这些大型部分可能变得难以合并，即尝试进一步合并时因上述原因失败。在需要合并以确保查询时间正常行为的情况下，这可能导致不良后果，例如 [替换合并树中的重复项累积](/guides/developer/deduplication#using-replacingmergetree-for-upserts)，增加查询时间性能。

## 让后台合并来完成工作 {#let-background-merges-do-the-work}

ClickHouse 已经执行智能的后台合并，以优化存储和查询效率。这些合并是增量的、资源感知的，并且遵循配置的阈值。除非您有非常具体的需求（例如，在冻结表或导出之前完成数据），**否则最好让 ClickHouse 自行管理合并**。
