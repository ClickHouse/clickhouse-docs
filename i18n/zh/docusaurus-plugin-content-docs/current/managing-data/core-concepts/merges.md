---
'slug': '/merges'
'title': '分区合并'
'description': 'ClickHouse中的分区合并是什么'
'keywords':
- 'merges'
---

import merges_01 from '@site/static/images/managing-data/core-concepts/merges_01.png';
import merges_02 from '@site/static/images/managing-data/core-concepts/merges_02.png';
import merges_03 from '@site/static/images/managing-data/core-concepts/merges_03.png';
import merges_04 from '@site/static/images/managing-data/core-concepts/merges_04.png';
import merges_05 from '@site/static/images/managing-data/core-concepts/merges_05.png';
import merges_06 from '@site/static/images/managing-data/core-concepts/merges_06.png';
import merges_07 from '@site/static/images/managing-data/core-concepts/merges_07.png';
import merges_dashboard from '@site/static/images/managing-data/core-concepts/merges-dashboard.gif';
import Image from '@theme/IdealImage';

## ClickHouse 中的部分合并是什么？ {#what-are-part-merges-in-clickhouse}

<br/>

ClickHouse [不仅查询快速](/concepts/why-clickhouse-is-so-fast)，插入速度也很快，这要归功于其 [存储层](https://www.vldb.org/pvldb/vol17/p3731-schulze.pdf)，该层的工作方式类似于 [LSM 树](https://en.wikipedia.org/wiki/Log-structured_merge-tree)：

① 插入（来自 [MergeTree 引擎](/engines/table-engines/mergetree-family) 家族的表）创建了排序的、不可变的 [数据部分](/parts)。

② 所有数据处理都被卸载到 **后台部分合并**。

这使得数据写入变得轻量且 [高效](/concepts/why-clickhouse-is-so-fast#storage-layer-concurrent-inserts-are-isolated-from-each-other)。

为了控制每个表的部分数量并实现上述的 ②，ClickHouse 不断在后台将较小的部分合并成较大的部分（[按分区](/partitions#per-partition-merges)），直到它们达到约 [~150 GB](/operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool) 的压缩大小。

以下图示简要描述了这个后台合并过程：

<Image img={merges_01} size="lg" alt='PART MERGES'/>

<br/>

合并级别的 `merge level` 每增加一次合并就会加一。级别为 `0` 表示该部分是新的，并且尚未合并。被合并到较大部分中的部分标记为 [非活动](/operations/system-tables/parts)，并在 [可配置](/operations/settings/merge-tree-settings#old_parts_lifetime) 的时间后最终删除（默认为 8 分钟）。随着时间的推移，这会创建一个 **树** 形的合并部分。因此命名为 [merge tree](/engines/table-engines/mergetree-family) 表。

## 监控合并 {#monitoring-merges}

在 [什么是表部分](/parts) 示例中，我们 [展示了](/parts#monitoring-table-parts) ClickHouse 如何在 [parts](/operations/system-tables/parts) 系统表中跟踪所有表部分。我们使用以下查询来检索示例表每个活动部分的合并级别和存储行数：
```sql
SELECT
    name,
    level,
    rows
FROM system.parts
WHERE (database = 'uk') AND (`table` = 'uk_price_paid_simple') AND active
ORDER BY name ASC;
```

[先前记录的](/parts#monitoring-table-parts) 查询结果显示，示例表有四个活动部分，每个部分都是从最初插入的部分中合并而来的：
```response
   ┌─name────────┬─level─┬────rows─┐
1. │ all_0_5_1   │     1 │ 6368414 │
2. │ all_12_17_1 │     1 │ 6442494 │
3. │ all_18_23_1 │     1 │ 5977762 │
4. │ all_6_11_1  │     1 │ 6459763 │
   └─────────────┴───────┴─────────┘
```

[运行](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICBuYW1lLAogICAgbGV2ZWwsCiAgICByb3dzCkZST00gc3lzdGVtLnBhcnRzCldIRVJFIChkYXRhYmFzZSA9ICd1aycpIEFORCAoYHRhYmxlYCA9ICd1a19wcmljZV9wYWlkX3NpbXBsZScpIEFORCBhY3RpdmUKT1JERVIgQlkgbmFtZSBBU0M7&run_query=true&tab=results) 后，查询现在显示四个部分已经合并成一个最终部分（只要没有进一步的插入进入该表）：

```response
   ┌─name───────┬─level─┬─────rows─┐
1. │ all_0_23_2 │     2 │ 25248433 │
   └────────────┴───────┴──────────┘
```

在 ClickHouse 24.10 中，添加了一个新的 [合并仪表板](https://presentations.clickhouse.com/2024-release-24.10/index.html#17) 到内置 [监控仪表板](https://clickhouse.com/blog/common-issues-you-can-solve-using-advanced-monitoring-dashboards)。通过 `/merges` HTTP 处理器，在 OSS 和 Cloud 中均可使用，我们可以用它来可视化示例表的所有部分合并：

<Image img={merges_dashboard} size="lg" alt='PART MERGES'/>

<br/>

上面的记录仪表板捕获了整个过程，从初始数据插入到最终合并为一个部分：

① 活动部分的数量。

② 部分合并，以方框形式直观呈现（大小反映部分大小）。

③ [写放大](https://en.wikipedia.org/wiki/Write_amplification)。

## 并发合并 {#concurrent-merges}

单个 ClickHouse 服务器使用多个后台 [合并线程](/operations/server-configuration-parameters/settings#background_pool_size) 来执行并发部分合并：

<Image img={merges_02} size="lg" alt='PART MERGES'/>

<br/>

每个合并线程执行一个循环：

① 决定下一个要合并的部分，并将这些部分加载到内存中。

② 将内存中的部分合并为一个更大的部分。

③ 将合并后的部分写入磁盘。

返回到 ①

注意，增加 CPU 核心数量和 RAM 大小可以提高后台合并的吞吐量。

## 内存优化的合并 {#memory-optimized-merges}

ClickHouse 不一定会一次性将所有要合并的部分加载到内存中，如 [先前示例](/merges#concurrent-merges) 中概述的那样。基于几个 [因素](https://github.com/ClickHouse/ClickHouse/blob/bf37120c925ed846ae5cd72cd51e6340bebd2918/src/Storages/MergeTree/MergeTreeSettings.cpp#L210)，为了减少内存消耗（牺牲合并速度），所谓的 [垂直合并](https://github.com/ClickHouse/ClickHouse/blob/bf37120c925ed846ae5cd72cd51e6340bebd2918/src/Storages/MergeTree/MergeTreeSettings.cpp#L209) 按块分块加载和合并部分，而不是一次性完成。

## 合并机制 {#merge-mechanics}

下图说明了 ClickHouse 中单个后台 [合并线程](/merges#concurrent-merges) 如何合并部分（默认情况下，不进行 [垂直合并](/merges#memory-optimized-merges)）：

<Image img={merges_03} size="lg" alt='PART MERGES'/>

<br/>

合并部分的过程分为几个步骤：

**① 解压与加载**：将要合并的部分中的 [压缩的二进制列文件](/parts#what-are-table-parts-in-clickhouse) 解压并加载到内存中。

**② 合并**：将数据合并到更大的列文件中。

**③ 索引**：为合并后的列文件生成新的 [稀疏主索引](/guides/best-practices/sparse-primary-indexes)。

**④ 压缩与存储**：新的列文件和索引被 [压缩](/sql-reference/statements/create/table#column_compression_codec) 并保存在表示合并数据部分的新 [目录](/parts#what-are-table-parts-in-clickhouse) 中。

数据部分中的其他 [元数据](/parts)，例如二级数据跳过索引、列统计、校验和和 min-max 索引，也会根据合并的列文件重新创建。为了简化描述，我们省略了这些细节。

步骤 ② 的机制取决于所使用的特定 [MergeTree 引擎](/engines/table-engines/mergetree-family)，因为不同的引擎处理合并的方式不同。例如，行可能在过期时被汇总或替换。如前所述，这种方法 **将所有数据处理卸载到后台合并**，实现 **超级快速的插入**，使写操作保持轻量和高效。

接下来，我们将简要概述 MergeTree 家族中特定引擎的合并机制。

### 标准合并 {#standard-merges}

下图说明了标准 [MergeTree](/engines/table-engines/mergetree-family/mergetree) 表中部分的合并方式：

<Image img={merges_04} size="lg" alt='PART MERGES'/>

<br/>

上图中的 DDL 语句创建了一个 `MergeTree` 表，排序键为 `(town, street)`，这意味着磁盘上的数据按这些列排序，并生成相应的稀疏主索引。

在 ① 解压后的预排序的表列中，② 在保留表的全局排序顺序的情况下进行合并，③ 生成新的稀疏主索引，④ 合并的列文件和索引被压缩并存储为磁盘上的新数据部分。

### 替换合并 {#replacing-merges}

[ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree) 表中的部分合并类似于 [标准合并](/merges#standard-merges)，但仅保留每行的最新版本，旧版本将被丢弃：

<Image img={merges_05} size="lg" alt='PART MERGES'/>

<br/>

上图中的 DDL 语句创建了一个 `ReplacingMergeTree` 表，排序键为 `(town, street, id)`，这意味着磁盘上的数据按这些列排序，并生成相应的稀疏主索引。

在 ② 合并过程中，类似于标准 `MergeTree` 表，合并解压后的预排序列，同时保留全局排序顺序。

然而，`ReplacingMergeTree` 会移除具有相同排序键的重复行，仅保留基于其所包含部分的创建时间戳的最新行。

<br/>

### 汇总合并 {#summing-merges}

在 [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree) 表的部分合并中，数值数据会自动汇总：

<Image img={merges_06} size="lg" alt='PART MERGES'/>

<br/>

上图中的 DDL 语句定义了一个 `SummingMergeTree` 表，`town` 作为排序键，这意味着磁盘上的数据按此列排序，并生成相应的稀疏主索引。

在 ② 合并步骤中，ClickHouse 将所有具有相同排序键的行替换为单行，汇总数值列的值。

### 聚合合并 {#aggregating-merges}

上面的 `SummingMergeTree` 表示例是 [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree) 表的专用变体，允许在部分合并期间通过应用 [90+](https://sql-reference/aggregate-functions/reference) 种聚合函数进行 [自动增量数据转换](https://www.youtube.com/watch?v=QDAJTKZT8y4)：

<Image img={merges_07} size="lg" alt='PART MERGES'/>

<br/>

上图中的 DDL 语句创建了一个 `AggregatingMergeTree` 表，`town` 作为排序键，确保数据在磁盘上按此列排序，并生成相应的稀疏主索引。

在 ② 合并过程中，ClickHouse 将所有具有相同排序键的行替换为单行，存储 [部分聚合状态](https://clickhouse.com/blog/clickhouse_vs_elasticsearch_mechanics_of_count_aggregations#-multi-core-parallelization)（例如，`avg()` 的 `sum` 和 `count`）。这些状态确保通过增量后台合并获得准确结果。
