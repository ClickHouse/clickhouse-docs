---
slug: /merges
title: 分片合并
description: ClickHouse中的分片合并是什么
keywords: ['merges']
---

import merges_01 from '@site/static/images/managing-data/core-concepts/merges_01.png';
import merges_02 from '@site/static/images/managing-data/core-concepts/merges_02.png';
import merges_03 from '@site/static/images/managing-data/core-concepts/merges_03.png';
import merges_04 from '@site/static/images/managing-data/core-concepts/merges_04.png';
import merges_05 from '@site/static/images/managing-data/core-concepts/merges_05.png';
import merges_06 from '@site/static/images/managing-data/core-concepts/merges_06.png';
import merges_07 from '@site/static/images/managing-data/core-concepts/merges_07.png';
import merges_dashboard from '@site/static/images/managing-data/core-concepts/merges-dashboard.gif';

## ClickHouse中的分片合并是什么? {#what-are-part-merges-in-clickhouse}

<br/>

ClickHouse [之所以快](/concepts/why-clickhouse-is-so-fast) 不仅是因为查询速度快，也因其 [存储层](https://www.vldb.org/pvldb/vol17/p3731-schulze.pdf) 快速实现了类似于 [LSM 树](https://en.wikipedia.org/wiki/Log-structured_merge-tree) 的功能：

① 插入（从 [MergeTree 引擎](/engines/table-engines/mergetree-family) 系列的表中）创建排序的、不可变的 [数据分片](/parts)。

② 所有数据处理都被放入 **后台分片合并** 中完成。

这使得数据写入变得轻量且 [高效](/concepts/why-clickhouse-is-so-fast#storage-layer-concurrent-inserts-are-isolated-from-each-other)。

为了控制每个表的分片数量并实现上述 ②，ClickHouse 持续地在后台将较小的分片合并成更大的分片（[按分区](/partitions#per-partition-merges)），直到达到约 [~150 GB](/operations/settings/merge-tree-settings#max-bytes-to-merge-at-max-space-in-pool) 的压缩大小。

下图描述了此后台合并过程：

<img src={merges_01} alt='分片合并' class='image' />
<br/>

分片的 `merge level` 随着每次合并而递增。`0`级别表示该分片为新的，还未被合并。已合并为更大分片的分片标记为 [不活跃的](/operations/system-tables/parts)，并在 [可配置的](/operations/settings/merge-tree-settings#old-parts-lifetime) 时间（默认8分钟）后最终被删除。随着时间的推移，这会形成一个 **合并树** 的结构。因此命名为 [合并树](/engines/table-engines/mergetree-family) 表。

## 监控合并情况 {#monitoring-merges}

在 [表分片是什么](/parts) 的示例中，我们 [展示了](/parts#monitoring-table-parts) ClickHouse 如何在 [parts](/operations/system-tables/parts) 系统表中跟踪所有表分片。我们使用以下查询检索该示例表中每个活动分片的合并级别和存储行数：
```sql
SELECT
    name,
    level,
    rows
FROM system.parts
WHERE (database = 'uk') AND (`table` = 'uk_price_paid_simple') AND active
ORDER BY name ASC;
```

[之前记录的](/parts#monitoring-table-parts) 查询结果表明，示例表有四个活动分片，每个分片由最初插入的分片合并而成：
```response
   ┌─name────────┬─level─┬────rows─┐
1. │ all_0_5_1   │     1 │ 6368414 │
2. │ all_12_17_1 │     1 │ 6442494 │
3. │ all_18_23_1 │     1 │ 5977762 │
4. │ all_6_11_1  │     1 │ 6459763 │
   └─────────────┴───────┴─────────┘
```

[运行](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICBuYW1lLAogICAgbGV2ZWwsCiAgICByb3dzCkZST00gc3lzdGVtLnBhcnRzCldIRVJFIChkYXRhYmFzZSA9ICd1aycpIEFORCAoYHRhYmxlYCA9ICd1a19wcmljZV9wYWlkX3NpbXBsZScpIEFORCBhY3RpdmUKT1JERVIgQlkgbmFtZSBBU0M7&run_query=true&tab=results) 此查询现在显示这四个分片已合并为一个最终分片（前提是表中没有进一步的插入）：

```response
   ┌─name───────┬─level─┬─────rows─┐
1. │ all_0_23_2 │     2 │ 25248433 │
   └────────────┴───────┴──────────┘
```

在 ClickHouse 24.10 中，内置的 [监控仪表板](https://presentations.clickhouse.com/2024-release-24.10/index.html#17) 增加了新的 [合并仪表板](https://clickhouse.com/blog/common-issues-you-can-solve-using-advanced-monitoring-dashboards)。它可以在 OSS 和 Cloud 中通过 `/merges` HTTP 处理程序使用，我们可以利用它来可视化我们示例表的所有分片合并：

<img src={merges_dashboard} alt='分片合并' class='image' />
<br/>

上面记录的仪表板捕获了整个过程，从初始数据插入到最终合并成一个分片：

① 活动分片的数量。

② 分片合并，使用框图可视化（框的大小反映分片大小）。

③ [写放大效应](https://en.wikipedia.org/wiki/Write_amplification)。

## 并发合并 {#concurrent-merges}

单个 ClickHouse 服务器使用多个后台 [合并线程](/operations/server-configuration-parameters/settings#background_pool_size) 来执行并发的分片合并：

<img src={merges_02} alt='分片合并' class='image' />
<br/>

每个合并线程执行一个循环：

① 决定接下来要合并哪些分片，并将这些分片加载到内存中。

② 将内存中的分片合并为更大的分片。

③ 将合并后的分片写入磁盘。

回到 ①

请注意，增加 CPU 核心数量和 RAM 的大小可以提高后台合并的吞吐量。

## 内存优化合并 {#memory-optimized-merges}

ClickHouse 不一定会一次加载所有要合并的分片到内存中，如 [上一个示例](/merges#concurrent-merges) 所示。基于多个 [因素](https://github.com/ClickHouse/ClickHouse/blob/bf37120c925ed846ae5cd72cd51e6340bebd2918/src/Storages/MergeTree/MergeTreeSettings.cpp#L210)，为了减少内存消耗（牺牲合并速度），所谓的 [垂直合并](https://github.com/ClickHouse/ClickHouse/blob/bf37120c925ed846ae5cd72cd51e6340bebd2918/src/Storages/MergeTree/MergeTreeSettings.cpp#L209) 是通过逐块加载并合并分片，而不是一次性进行。

## 合并机制 {#merge-mechanics}

下图说明了 ClickHouse 中单个后台 [合并线程](/merges#concurrent-merges) 如何合并分片（默认情况下，不使用 [垂直合并](/merges#memory-optimized-merges)）：

<img src={merges_03} alt='分片合并' class='image' />
<br/>

分片合并的过程分为几个步骤：

**① 解压和加载**：要合并的分片中的 [压缩二进制列文件](/parts#what-are-table-parts-in-clickhouse) 被解压并加载到内存中。

**② 合并**：数据被合并到更大的列文件中。

**③ 索引**：为合并的列文件生成一个新的 [稀疏主索引](/guides/best-practices/sparse-primary-indexes)。

**④ 压缩和存储**：新的列文件和索引被 [压缩](/sql-reference/statements/create/table#column_compression_codec) 并保存在一个新的 [目录](/parts#what-are-table-parts-in-clickhouse) 中，表示合并后的数据分片。

附加的 [数据分片元数据](/parts)，如二级数据跳过索引、列统计信息、校验和及最小最大索引，也根据合并的列文件进行重建。为简洁起见，我们省略了这些细节。

步骤 ② 的机制取决于特定的 [MergeTree 引擎](/engines/table-engines/mergetree-family)，因为不同的引擎以不同方式处理合并。例如，如果行过时，可能会进行聚合或替换。如前所述，这种方法 **将所有数据处理都放入后台合并中**，使得通过保持写操作轻量和高效，实现 **超快的插入**。

接下来，我们将简要概述 MergeTree 系列中具体引擎的合并机制。

### 标准合并 {#standard-merges}

下图说明了在标准 [MergeTree](/engines/table-engines/mergetree-family/mergetree) 表中如何合并分片：

<img src={merges_04} alt='分片合并' class='image' />
<br/>

上图中的 DDL 语句创建了一个 `MergeTree` 表，具有排序键 `(town, street)`，这意味着磁盘上的数据按这些列排序，并相应地生成稀疏主索引。

① 解压的预排序表列 ② 以保持由表的排序键定义的全局排序顺序进行合并，③ 生成新的稀疏主索引，④ 将合并后的列文件和索引压缩并存储为磁盘上的新数据分片。

### 替换合并 {#replacing-merges}

在 [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree) 表中的分片合并工作与 [标准合并](/merges#standard-merges) 类似，但只保留每行的最新版本，丢弃旧版本：

<img src={merges_05} alt='分片合并' class='image' />
<br/>

上图中的 DDL 语句创建了一个 `ReplacingMergeTree` 表，具有排序键 `(town, street, id)`，这意味着磁盘上的数据按这些列排序，并相应地生成稀疏主索引。

② 合并的过程类似于标准 `MergeTree` 表，合并预排序的解压列，同时保持全局排序顺序。

然而，`ReplacingMergeTree` 会移除具有相同排序键的重复行，仅保留基于其包含分片的创建时间戳的最新行。

<br/>

### 汇总合并 {#summing-merges}

在 [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree) 表中，数字数据在合并分片时会自动汇总：

<img src={merges_06} alt='分片合并' class='image' />
<br/>

上图中的 DDL 语句定义了一个 `SummingMergeTree` 表，以 `town` 作为排序键，这意味着磁盘上的数据按此列排序，并相应地创建稀疏主索引。

在②合并步骤中，ClickHouse将所有具有相同排序键的行替换为单行，汇总数值列的值。

### 聚合合并 {#aggregating-merges}

上面的 `SummingMergeTree` 表示例是 [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree) 表的一种专门变体，通过在分片合并期间应用任何 [90+](https://www.youtube.com/watch?v=QDAJTKZT8y4) 聚合函数，允许 [自动增量数据转换](https://www.youtube.com/watch?v=QDAJTKZT8y4)：

<img src={merges_07} alt='分片合并' class='image' />
<br/>

上图中的 DDL 语句创建了一个 `AggregatingMergeTree` 表，以 `town` 作为排序键，确保数据在磁盘上按此列排序，并生成相应的稀疏主索引。

在②合并过程中，ClickHouse 用单行替换所有具有相同排序键的行，存储 [部分聚合状态](https://clickhouse.com/blog/clickhouse_vs_elasticsearch_mechanics_of_count_aggregations#-multi-core-parallelization)（例如，`sum` 和 `count` 用于 `avg()`）。这些状态通过增量后台合并确保结果的准确性。
