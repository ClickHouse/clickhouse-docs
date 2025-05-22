import Image from '@theme/IdealImage';
import simple_merges from '@site/static/images/bestpractices/simple_merges.png';

ClickHouse 表使用 **MergeTree 引擎** 将数据作为 **不可变的部分** 存储在磁盘上，每次插入数据时都会创建新部分。

每次插入都会创建一个新的部分，其中包含排序后的压缩列文件，以及诸如索引和校验和之类的元数据。有关部分结构及其形成方式的详细描述，我们推荐这个 [指南](/parts)。

随着时间的推移，后台进程将较小的部分合并为更大的部分，以减少碎片化并提高查询性能。

<Image img={simple_merges} size="md" alt="简单合并" />

虽然手动触发此合并是令人诱惑的，但使用：

```sql
OPTIMIZE TABLE <table> FINAL;
```

**你应该在大多数情况下避免此操作**，因为这会启动资源密集型操作，可能会影响集群性能。

## 为什么要避免？ {#why-avoid}

### 这很昂贵 {#its-expensive}

运行 `OPTIMIZE FINAL` 强制 ClickHouse 将 **所有** 活动部分合并为 **单个部分**，即使在已经发生大型合并的情况下。这涉及：

1. **解压缩** 所有部分
2. **合并** 数据
3. **再次压缩** 
4. **将** 最终部分写入磁盘或对象存储

这些步骤是 **CPU 和 I/O 密集型** 的，并且可能会对系统造成重大压力，尤其是在涉及大型数据集时。

### 它忽略了安全限制 {#it-ignores-safety-limits}

通常，ClickHouse 避免合并大于 ~150 GB 的部分（可通过 [max_bytes_to_merge_at_max_space_in_pool](/operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool) 配置）。但是 `OPTIMIZE FINAL` **会忽略此保障**，这意味着：

* 它可能试图将 **多个 150 GB 部分** 合并为一个巨大的部分
* 这可能会导致 **较长的合并时间**，**内存压力**，甚至 **内存溢出错误**
* 这些大型部分可能会变得难以合并，即尝试进一步合并时因上述原因失败。在需要合并以确保正确查询时间行为的情况下，这可能会导致不良后果，例如 [为 ReplacingMergeTree 累积重复项](/guides/developer/deduplication#using-replacingmergetree-for-upserts)，增加查询时间性能。

## 让后台合并来完成工作 {#let-background-merges-do-the-work}

ClickHouse 已经执行智能的后台合并，以优化存储和查询效率。这些合并是渐进式的，资源感知的，并遵循配置的阈值。除非你有非常具体的需求（例如，在冻结表之前最终确定数据或导出），**否则最好让 ClickHouse 自行管理合并**。
