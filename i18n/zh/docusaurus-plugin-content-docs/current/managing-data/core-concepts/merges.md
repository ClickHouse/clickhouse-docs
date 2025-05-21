---
'slug': '/merges'
'title': '分区合并'
'description': 'ClickHouse 中的分区合并是什么'
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

ClickHouse [快速](/concepts/why-clickhouse-is-so-fast) 不仅在查询上，而且在插入上也很快，这要归功于其 [存储层](https://www.vldb.org/pvldb/vol17/p3731-schulze.pdf)，其操作方式类似于 [LSM 树](https://en.wikipedia.org/wiki/Log-structured_merge-tree)：

① 插入（来自 [MergeTree 引擎](/engines/table-engines/mergetree-family)系列的表中）会创建已排序的、不可变的 [数据部分](/parts)。

② 所有的数据处理都被卸载到 **后台部分合并** 中。

这使得数据写入变得轻量且 [高效](/concepts/why-clickhouse-is-so-fast#storage-layer-concurrent-inserts-are-isolated-from-each-other)。

为了控制每个表的部分数量并实现上述 ②，ClickHouse 持续在后台将较小的部分（[按分区](/partitions#per-partition-merges)）合并为更大的部分，直到它们达到大约 [~150 GB](/operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool) 的压缩大小。

以下图解概述了这个后台合并过程：

<Image img={merges_01} size="lg" alt='部分合并'/>

<br/>

部分的 `merge level` 在每次额外合并时增加一。`0`级表示该部分是新的，尚未合并。被合并为更大部分的部分被标记为 [非活动](/operations/system-tables/parts)，并最终在 [可配置](/operations/settings/merge-tree-settings#old_parts_lifetime) 的时间后删除（默认为 8 分钟）。随着时间的推移，这创建了一个 **树** 结构的合并部分。因此，被称为 [合并树](/engines/table-engines/mergetree-family) 表。

## 监控合并 {#monitoring-merges}

在 [表部分是什么](/parts) 的示例中，我们 [展示了](/parts#monitoring-table-parts) ClickHouse 如何跟踪 [parts](/operations/system-tables/parts) 系统表中的所有表部分。我们使用以下查询检索示例表每个活动部分的合并级别和存储的行数：
```sql
SELECT
    name,
    level,
    rows
FROM system.parts
WHERE (database = 'uk') AND (`table` = 'uk_price_paid_simple') AND active
ORDER BY name ASC;
```

[之前文档中](/parts#monitoring-table-parts) 的查询结果显示示例表有四个活动部分，每个来自最初插入部分的单个合并：
```response
   ┌─name────────┬─level─┬────rows─┐
1. │ all_0_5_1   │     1 │ 6368414 │
2. │ all_12_17_1 │     1 │ 6442494 │
3. │ all_18_23_1 │     1 │ 5977762 │
4. │ all_6_11_1  │     1 │ 6459763 │
   └─────────────┴───────┴─────────┘
```

[运行](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICBuYW1lLAogICAgbGV2ZWwsCiAgICByb3dzCkZST00gc3lzdGVtLnBhcnRzCldIRVJFIChkYXRhYmFzZSA9ICd1aycpIEFORCAoYHRhYmxlYCA9ICd1a19wcmljZV9wYWlkX3NpbXBsZScpIEFORCBhY3RpdmUKT1JERVIgQlkgbmFtZSBBU0M7&run_query=true&tab=results) 查询现在显示这四个部分已经合并为一个最终部分（只要没有进一步向表中插入）：

```response
   ┌─name───────┬─level─┬─────rows─┐
1. │ all_0_23_2 │     2 │ 25248433 │
   └────────────┴───────┴──────────┘
```

在 ClickHouse 24.10 中，新增了一个 [合并仪表板](https://presentations.clickhouse.com/2024-release-24.10/index.html#17)，可通过内置的 [监控仪表板](https://clickhouse.com/blog/common-issues-you-can-solve-using-advanced-monitoring-dashboards)访问。在 OSS 和云端都可通过 `/merges` HTTP 处理程序使用它，我们可以用它来可视化我们示例表的所有部分合并：

<Image img={merges_dashboard} size="lg" alt='部分合并'/>

<br/>

上述记录的仪表板捕获了整个过程，从初始数据插入到最终合并为一个部分：

① 活动部分的数量。

② 部分合并，以框的形式可视化（大小反映部分大小）。

③ [写放大](https://en.wikipedia.org/wiki/Write_amplification)。

## 并发合并 {#concurrent-merges}

单个 ClickHouse 服务器使用多个后台 [合并线程](/operations/server-configuration-parameters/settings#background_pool_size) 来执行并发部分合并：

<Image img={merges_02} size="lg" alt='部分合并'/>

<br/>

每个合并线程执行一个循环：

① 决定接下来要合并哪些部分，并将这些部分加载到内存中。

② 将内存中的部分合并为一个更大的部分。

③ 将合并的部分写入磁盘。

转到 ①

请注意，增加 CPU 内核数量和 RAM 大小可以提高后台合并的吞吐量。

## 内存优化合并 {#memory-optimized-merges}

ClickHouse 并不一定一次性加载所有要合并的部分到内存中，如 [前面示例中](/merges#concurrent-merges) 所示。基于多个 [因素](https://github.com/ClickHouse/ClickHouse/blob/bf37120c925ed846ae5cd72cd51e6340bebd2918/src/Storages/MergeTree/MergeTreeSettings.cpp#L210)，并为了减少内存消耗（牺牲合并速度），所谓的 [垂直合并](https://github.com/ClickHouse/ClickHouse/blob/bf37120c925ed846ae5cd72cd51e6340bebd2918/src/Storages/MergeTree/MergeTreeSettings.cpp#L209) 是按块将部分加载和合并，而不是一次性完成。

## 合并机制 {#merge-mechanics}

下面的图解说明了单个后台 [合并线程](/merges#concurrent-merges) 在 ClickHouse 中如何合并部分（默认情况下，不采用 [垂直合并](/merges#memory-optimized-merges)）：

<Image img={merges_03} size="lg" alt='部分合并'/>

<br/>

部分合并分几个步骤进行：

**① 解压和加载**: 要合并的部分的 [压缩二进制列文件](/parts#what-are-table-parts-in-clickhouse) 被解压并加载到内存中。

**② 合并**: 数据合并到更大的列文件中。

**③ 索引**: 为合并后的列文件生成新的 [稀疏主索引](/guides/best-practices/sparse-primary-indexes)。

**④ 压缩和存储**: 新的列文件和索引被 [压缩](/sql-reference/statements/create/table#column_compression_codec) 并保存在新的 [目录](/parts#what-are-table-parts-in-clickhouse) 中表示合并的数据部分。

额外的 [元数据在数据部分中](/parts)，例如二级数据跳过索引、列统计信息、校验和和最小最大索引，也根据合并的列文件重新创建。出于简化考虑，我们省略了这些细节。

步骤 ② 的机制依赖于所使用的特定 [MergeTree 引擎](/engines/table-engines/mergetree-family)，因为不同的引擎处理合并的方式不同。例如，如果行过时，它们可能被聚合或替换。如前所述，此方法 **将所有数据处理卸载到后台合并中**，从而通过保持写操作轻量和高效实现 **超快速插入**。

接下来，我们将简要概述 MergeTree 系列中特定引擎的合并机制。


### 标准合并 {#standard-merges}

下面的图解说明了标准 [MergeTree](/engines/table-engines/mergetree-family/mergetree) 表中部分的合并方式：

<Image img={merges_04} size="lg" alt='部分合并'/>

<br/>

上面图解中的 DDL 语句创建了一个 `MergeTree` 表，排序键为 `(town, street)`，这意味着磁盘上的数据按这些列排序，并相应地生成稀疏主索引。

① 解压后、预排序的表列被 ② 在保留表全局排序顺序（由表的排序键定义）的同时合并，③ 生成新的稀疏主索引，最后 ④ 将合并后的列文件和索引压缩并存储为新的数据部分。

### 替换合并 {#replacing-merges}

[ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree) 表中的部分合并与 [标准合并](/merges#standard-merges) 类似，但只保留每行的最新版本，旧版本被丢弃：

<Image img={merges_05} size="lg" alt='部分合并'/>

<br/>

上面图解中的 DDL 语句创建了一个 `ReplacingMergeTree` 表，排序键为 `(town, street, id)`，这意味着磁盘上的数据按这些列排序，并相应生成稀疏主索引。

② 合并的工作方式与标准 `MergeTree` 表类似，结合了解压后的预排序列，同时保留全局排序顺序。

然而，`ReplacingMergeTree` 通过相同的排序键删除重复行，只保留根据其所在部分的创建时间戳的最新行。

<br/>

### 求和合并 {#summing-merges}

来自 [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree) 表部分的数值数据在合并期间会自动汇总：

<Image img={merges_06} size="lg" alt='部分合并'/>

<br/>

上面图解中的 DDL 语句定义了一个 `SummingMergeTree` 表，以 `town` 作为排序键，这意味着磁盘上的数据按这一列排序，并相应创建稀疏主索引。

在 ② 合并步骤中，ClickHouse 用一行替换所有具有相同排序键的行，并对数值列的值进行求和。

### 聚合合并 {#aggregating-merges}

上面提到的 `SummingMergeTree` 表示例是 [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree) 表的一种专用变体，允许在部分合并期间使用 [90+](/sql-reference/aggregate-functions/reference) 种聚合函数进行 [自动增量数据转换](https://www.youtube.com/watch?v=QDAJTKZT8y4)：

<Image img={merges_07} size="lg" alt='部分合并'/>

<br/>

上面图解中的 DDL 语句创建了一个 `AggregatingMergeTree` 表，以 `town` 作为排序键，确保数据在磁盘上按此列排序，并生成相应的稀疏主索引。

在 ② 合并期间，ClickHouse 用一行替换所有具有相同排序键的行，该行存储 [部分聚合状态](https://clickhouse.com/blog/clickhouse_vs_elasticsearch_mechanics_of_count_aggregations#-multi-core-parallelization)（例如，用于 `avg()` 的 `sum` 和 `count`）。这些状态确保通过增量后台合并获得准确结果。
