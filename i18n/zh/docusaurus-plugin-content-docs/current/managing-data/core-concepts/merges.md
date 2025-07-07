---
'slug': '/merges'
'title': '分区合并'
'description': '在 ClickHouse 中，什么是分区合并'
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

## ClickHouse 中的分区合并是什么？ {#what-are-part-merges-in-clickhouse}

<br/>

ClickHouse [快速](/concepts/why-clickhouse-is-so-fast) 不仅在查询时表现快速，在插入时也表现出色，这得益于其 [存储层](https://www.vldb.org/pvldb/vol17/p3731-schulze.pdf)，该层的操作类似于 [LSM 树](https://en.wikipedia.org/wiki/Log-structured_merge-tree)：

① 插入（到来自 [MergeTree 引擎](/engines/table-engines/mergetree-family) 的表中）会创建排序的、不可变的 [数据部分](/parts)。

② 所有数据处理都卸载到 **后台分区合并** 中。

这使得数据写入变得轻量且 [高效](/concepts/why-clickhouse-is-so-fast#storage-layer-concurrent-inserts-are-isolated-from-each-other)。

为了控制每个表的部分数量并实现上述②，ClickHouse 在后台不断将较小的部分合并成较大的部分（[按分区](/partitions#per-partition-merges)），直到它们的压缩大小达到大约 [~150 GB](/operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool)。

下图概述了这个后台合并过程：

<Image img={merges_01} size="lg" alt='PART MERGES'/>

<br/>

每进行一次额外的合并，部分的 `merge level` 就会增加一。`0`级别表示该部分是新的，尚未被合并。合并成较大部分的部分会被标记为 [非活动](/operations/system-tables/parts)，并在 [可配置的](/operations/settings/merge-tree-settings#old_parts_lifetime) 时间后（默认8分钟）最终被删除。随着时间的推移，这会创建一个 **树形** 的合并部分。因此称之为 [merge tree](/engines/table-engines/mergetree-family) 表。

## 监控合并 {#monitoring-merges}

在 [什么是表部分](/parts) 的示例中，我们 [显示了](/parts#monitoring-table-parts) ClickHouse 如何在 [parts](/operations/system-tables/parts) 系统表中跟踪所有表部分。我们使用以下查询来检索示例表每个活动部分的合并级别和存储的行数：
```sql
SELECT
    name,
    level,
    rows
FROM system.parts
WHERE (database = 'uk') AND (`table` = 'uk_price_paid_simple') AND active
ORDER BY name ASC;
```

[先前文档中的](/parts#monitoring-table-parts)查询结果显示示例表有四个活动部分，每个部分均来自最初插入部分的单次合并：
```response
   ┌─name────────┬─level─┬────rows─┐
1. │ all_0_5_1   │     1 │ 6368414 │
2. │ all_12_17_1 │     1 │ 6442494 │
3. │ all_18_23_1 │     1 │ 5977762 │
4. │ all_6_11_1  │     1 │ 6459763 │
   └─────────────┴───────┴─────────┘
```

现在运行 [查询](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICBuYW1lLAogICAgbGV2ZWwsCiAgICByb3dzCkZST00gc3lzdGVtLnBhcnRzCldIRVJFIChkYXRhYmFzZSA9ICd1aycpIEFORCAoYHRhYmxlYCA9ICd1a19wcmljZV9wYWlkX3NpbXBsZScpIEFORCBhY3RpdmUKT1JERVIgQlkgbmFtZSBBU0M7&run_query=true&tab=results) 后显示这四个部分已经合并成一个最终部分（只要表中没有进一步的插入）：

```response
   ┌─name───────┬─level─┬─────rows─┐
1. │ all_0_23_2 │     2 │ 25248433 │
   └────────────┴───────┴──────────┘
```

在 ClickHouse 24.10 中，内置的 [监控仪表盘](https://presentations.clickhouse.com/2024-release-24.10/index.html#17) 添加了新的 [合并仪表盘](https://clickhouse.com/blog/common-issues-you-can-solve-using-advanced-monitoring-dashboards)。通过 `/merges` HTTP 处理程序在 OSS 和 Cloud 中都可用，我们可以用它来可视化示例表的所有部分合并：

<Image img={merges_dashboard} size="lg" alt='PART MERGES'/>

<br/>

上述记录的仪表盘捕捉了整个过程，从初始数据插入到最终合并成一个部分：

① 活动部分的数量。

② 部分合并，以框的形式可视化（大小反映部分的大小）。

③ [写放大](https://en.wikipedia.org/wiki/Write_amplification)。

## 并发合并 {#concurrent-merges}

单个 ClickHouse 服务器使用多个后台 [合并线程](/operations/server-configuration-parameters/settings#background_pool_size) 来执行并发分区合并：

<Image img={merges_02} size="lg" alt='PART MERGES'/>

<br/>

每个合并线程执行一个循环：

① 决定下一个要合并的部分，并将这些部分加载到内存中。

② 在内存中将部分合并成一个更大的部分。

③ 将合并后的部分写入磁盘。

回到 ①

请注意，增加 CPU 核心数和 RAM 大小可以提高后台合并的吞吐量。

## 内存优化合并 {#memory-optimized-merges}

ClickHouse 不一定会一次将所有要合并的部分加载到内存中，如 [之前的示例](/merges#concurrent-merges) 所示。根据多个 [因素](https://github.com/ClickHouse/ClickHouse/blob/bf37120c925ed846ae5cd72cd51e6340bebd2918/src/Storages/MergeTree/MergeTreeSettings.cpp#L210)，并为了减少内存消耗（牺牲合并速度），所谓的 [垂直合并](https://github.com/ClickHouse/ClickHouse/blob/bf37120c925ed846ae5cd72cd51e6340bebd2918/src/Storages/MergeTree/MergeTreeSettings.cpp#L209) 按块的块加载和合并部分，而不是一次性合并。

## 合并机制 {#merge-mechanics}

下图说明了 ClickHouse 中单个后台 [合并线程](/merges#concurrent-merges) 如何合并部分（默认情况下，不进行 [垂直合并](/merges#memory-optimized-merges)）：

<Image img={merges_03} size="lg" alt='PART MERGES'/>

<br/>

部分合并分几个步骤进行：

**① 解压缩和加载**：要合并的部分的 [压缩二进制列文件](/parts#what-are-table-parts-in-clickhouse) 被解压缩并加载到内存中。

**② 合并**：数据被合并成更大的列文件。

**③ 索引**：为合并的列文件生成新的 [稀疏主索引](/guides/best-practices/sparse-primary-indexes)。

**④ 压缩与存储**：新列文件和索引被 [压缩](/sql-reference/statements/create/table#column_compression_codec) 并存储在一个新的 [目录](/parts#what-are-table-parts-in-clickhouse) 中，代表合并的数据部分。

部分中的额外 [元数据](/parts)，如二级数据跳过索引、列统计信息、校验和和最小最大索引，也基于合并的列文件重新创建。为了简化，我们省略了这些细节。

步骤②的机制取决于使用的特定 [MergeTree 引擎](/engines/table-engines/mergetree-family)，因为不同的引擎以不同的方式处理合并。例如，行可以被聚合或替换，如果过时。如前所述，这种方法 **将所有数据处理卸载到后台合并中**，通过保持写操作轻量且高效，实现 **超快速的插入**。

接下来，我们将简要概述 MergeTree 家族中特定引擎的合并机制。


### 标准合并 {#standard-merges}

下图说明了标准 [MergeTree](/engines/table-engines/mergetree-family/mergetree) 表中部分是如何合并的：

<Image img={merges_04} size="lg" alt='PART MERGES'/>

<br/>

上图中的 DDL 语句创建了一个 `MergeTree` 表，排序键为 `(town, street)`，这意味着磁盘上的数据是按这些列排序的，并相应生成稀疏主索引。

① 解压的、预排序的表列被 ② 合并，同时保持表的全局排序顺序，该顺序由表的排序键定义， ③ 生成新的稀疏主索引， ④ 合并后的列文件和索引被压缩并存储为新的数据部分在磁盘上。

### 替换合并 {#replacing-merges}

[ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree) 表中的部分合并的工作方式类似于 [标准合并](/merges#standard-merges)，但仅保留每行的最新版本，丢弃旧版本：

<Image img={merges_05} size="lg" alt='PART MERGES'/>

<br/>

上图中的 DDL 语句创建了一个排序键为 `(town, street, id)` 的 `ReplacingMergeTree` 表，这意味着磁盘上的数据是按这些列排序的，并相应生成稀疏主索引。

② 合并的过程与标准 `MergeTree` 表类似，合并解压的、预排序的列，同时保持全局排序顺序。

但是，`ReplacingMergeTree` 会删除具有相同排序键的重复行，仅保留根据其包含部分的创建时间戳确定的最新行。

<br/>

### 求和合并 {#summing-merges}

在 [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree) 表中的部分合并时，数值数据会自动汇总：

<Image img={merges_06} size="lg" alt='PART MERGES'/>

<br/>

上图中的 DDL 语句定义了一个以 `town` 为排序键的 `SummingMergeTree` 表，这意味着磁盘上的数据是按此列排序的，并相应生成稀疏主索引。

在 ② 合并步骤中，ClickHouse 用一行替换所有具有相同排序键的行，同时对数值列的值进行求和。

### 聚合合并 {#aggregating-merges}

上面的 `SummingMergeTree` 表例是 [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree) 表的一个特化变体，允许在部分合并过程中应用任何 [90+](https://sql-reference/aggregate-functions/reference) 聚合函数，从而实现 [自动增量数据转换](https://www.youtube.com/watch?v=QDAJTKZT8y4)：

<Image img={merges_07} size="lg" alt='PART MERGES'/>

<br/>

上图中的 DDL 语句创建了一个以 `town` 为排序键的 `AggregatingMergeTree` 表，确保磁盘上的数据是按此列排序的，并相应生成稀疏主索引。

在 ② 合并过程中，ClickHouse 用一行替换所有具有相同排序键的行，存储 [部分聚合状态](https://clickhouse.com/blog/clickhouse_vs_elasticsearch_mechanics_of_count_aggregations#-multi-core-parallelization)（例如，`avg()` 的 `sum` 和 `count`）。这些状态确保通过增量后台合并获得准确的结果。
