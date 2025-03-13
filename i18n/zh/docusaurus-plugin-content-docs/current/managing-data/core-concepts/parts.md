---
slug: /parts
title: 表分区
description: ClickHouse中的数据分区是什么
keywords: [part]
---

import merges from '@site/static/images/managing-data/core-concepts/merges.png';
import part from '@site/static/images/managing-data/core-concepts/part.png';

## ClickHouse中的表分区是什么？ {#what-are-table-parts-in-clickhouse}

<br/>

在ClickHouse [MergeTree 引擎系列](/engines/table-engines/mergetree-family)中，每个表的数据在磁盘上的组织形式是一组不可变的 `data parts`。

为了解释这一点，我们使用[这个](https://sql.clickhouse.com/?query=U0hPVyBDUkVBVEUgVEFCTEUgdWsudWtfcHJpY2VfcGFpZF9zaW1wbGU&run_query=true&tab=results)表（改编自[英国房产价格数据集](/getting-started/example-datasets/uk-price-paid)），用于跟踪英国售出房产的日期、城镇、街道和价格：

```sql
CREATE TABLE uk.uk_price_paid_simple
(
    date Date,
    town LowCardinality(String),
    street LowCardinality(String),
    price UInt32
)
ENGINE = MergeTree
ORDER BY (town, street);
```

您可以在我们的 ClickHouse SQL Playground 中[查询这个表](https://sql.clickhouse.com/?query=U0VMRUNUICogRlJPTSB1ay51a19wcmljZV9wYWlkX3NpbXBsZTs&run_query=true&tab=results)。

每当一组行被插入到表中时，就会创建一个数据分区。以下图示简要说明了这一过程：

<img src={part} alt='插入处理' class='image' />
<br/>

当ClickHouse服务器处理上面的示例插入（例如，通过[INSERT INTO 语句](/sql-reference/statements/insert-into)）时，它会执行几个步骤：

① **排序**：这些行根据表的排序键`(town, street)`进行排序，并为排序后的行生成一个[稀疏主键索引](/guides/best-practices/sparse-primary-indexes)。

② **拆分**：排序后的数据被拆分成列。

③ **压缩**：每一列都被[压缩](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)。

④ **写入磁盘**：被压缩后的列作为二进制列文件保存在一个新的目录中，该目录表示插入的数据分区。稀疏主键索引也被压缩并保存在同一目录中。

根据表的具体引擎，排序过程中可能会发生额外的转换[可能会](/operations/settings/settings)。

数据分区是自包含的，包括解释其内容所需的所有元数据，而无需中央目录。除了稀疏主键索引，分区还包含其他元数据，例如二级[数据跳过索引](/optimize/skipping-indexes)、[列统计](https://clickhouse.com/blog/clickhouse-release-23-11#column-statistics-for-prewhere)、检查和最小-最大索引（如果使用了[分区](/partitions)），以及[更多](https://github.com/ClickHouse/ClickHouse/blob/a065b11d591f22b5dd50cb6224fab2ca557b4989/src/Storages/MergeTree/MergeTreeData.h#L104)。

## 分区合并 {#part-merges}

为了管理每个表的分区数量，后台[合并](/merges)作业会定期将较小的分区合并为较大的分区，直到它们达到[可配置的](/operations/settings/merge-tree-settings#max-bytes-to-merge-at-max-space-in-pool)压缩大小（通常约150 GB）。合并后的分区被标记为非活动状态，并在[可配置的](/operations/settings/merge-tree-settings#old-parts-lifetime)时间间隔后被删除。随着时间的推移，这一过程创建了一个合并分区的层次结构，这就是为什么它被称为MergeTree表的原因：

<img src={merges} alt='分区合并' class='image' />
<br/>

为了减少初始分区数量和合并的开销，数据库客户端被[鼓励](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)批量插入元组，例如一次插入20,000行，或使用[异步插入模式](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)，在这种模式下，ClickHouse将来自多个插入的行缓冲到同一个表中，仅在缓冲区大小超过可配置阈值或超时到期后才创建新的分区。

## 监控表分区 {#monitoring-table-parts}

您可以通过使用[虚拟列](/engines/table-engines#table_engines-virtual_columns) `_part` 来[查询](https://sql.clickhouse.com/?query=U0VMRUNUIF9wYXJ0CkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGUKR1JPVVAgQlkgX3BhcnQKT1JERVIgQlkgX3BhcnQgQVNDOw&run_query=true&tab=results)我们示例表当前所有活动分区的列表：

```sql
SELECT _part
FROM uk.uk_price_paid_simple
GROUP BY _part
ORDER BY _part ASC;

   ┌─_part───────┐
1. │ all_0_5_1   │
2. │ all_12_17_1 │
3. │ all_18_23_1 │
4. │ all_6_11_1  │
   └─────────────┘
```
上述查询检索磁盘上目录的名称，每个目录代表表的一个活动数据分区。这些目录名称的组成部分具有特定的含义，感兴趣的读者可以在[这里](https://github.com/ClickHouse/ClickHouse/blob/f90551824bb90ade2d8a1d8edd7b0a3c0a459617/src/Storages/MergeTree/MergeTreeData.h#L130)找到相关文档。

另外，ClickHouse在[system.parts](/operations/system-tables/parts)系统表中跟踪所有表所有分区的信息，以下查询[返回](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICBuYW1lLAogICAgbGV2ZWwsCiAgICByb3dzCkZST00gc3lzdGVtLnBhcnRzCldIRVJFIChkYXRhYmFzZSA9ICd1aycpIEFORCAoYHRhYmxlYCA9ICd1a19wcmljZV9wYWlkX3NpbXBsZScpIEFORCBhY3RpdmUKT1JERVIgQlkgbmFtZSBBU0M7&run_query=true&tab=results)我们上述示例表当前所有活动分区的列表、其合并级别和存储在这些分区中的行数：

```sql
SELECT
    name,
    level,
    rows
FROM system.parts
WHERE (database = 'uk') AND (`table` = 'uk_price_paid_simple') AND active
ORDER BY name ASC;


   ┌─name────────┬─level─┬────rows─┐
1. │ all_0_5_1   │     1 │ 6368414 │
2. │ all_12_17_1 │     1 │ 6442494 │
3. │ all_18_23_1 │     1 │ 5977762 │
4. │ all_6_11_1  │     1 │ 6459763 │
   └─────────────┴───────┴─────────┘
```
每次对分区进行额外的合并时，合并级别增加1。级别为0表示这是一个尚未合并的新分区。
