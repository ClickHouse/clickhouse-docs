---
slug: /parts
title: '数据分片（parts）'
description: 'ClickHouse 中的数据分片（data parts）是什么'
keywords: ['part']
doc_type: 'reference'
---

import merges from '@site/static/images/managing-data/core-concepts/merges.png';
import part from '@site/static/images/managing-data/core-concepts/part.png';
import Image from '@theme/IdealImage';


## ClickHouse 中的表部分是什么? {#what-are-table-parts-in-clickhouse}

<br />

ClickHouse [MergeTree 引擎家族](/engines/table-engines/mergetree-family)中每个表的数据在磁盘上以一组不可变的 `数据部分` 形式组织。

为了说明这一点,我们使用[此表](https://sql.clickhouse.com/?query=U0hPVyBDUkVBVEUgVEFCTEUgdWsudWtfcHJpY2VfcGFpZF9zaW1wbGU&run_query=true&tab=results)(改编自[英国房产价格数据集](/getting-started/example-datasets/uk-price-paid))来跟踪英国已售房产的日期、城镇、街道和价格:

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

您可以在我们的 ClickHouse SQL Playground 中[查询此表](https://sql.clickhouse.com/?query=U0VMRUNUICogRlJPTSB1ay51a19wcmljZV9wYWlkX3NpbXBsZTs&run_query=true&tab=results)。

每当向表中插入一组行时,就会创建一个数据部分。下图展示了这一过程:

<Image img={part} size='lg' />

<br />

当 ClickHouse 服务器处理上图所示的包含 4 行的示例插入操作(例如,通过 [INSERT INTO 语句](/sql-reference/statements/insert-into))时,它会执行以下几个步骤:

① **排序**: 按表的^^排序键^^ `(town, street)` 对行进行排序,并为排序后的行生成[稀疏主索引](/guides/best-practices/sparse-primary-indexes)。

② **拆分**: 将排序后的数据拆分为列。

③ **压缩**: 对每列进行[压缩](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)。

④ **写入磁盘**: 将压缩后的列作为二进制列文件保存在代表该插入操作数据部分的新目录中。稀疏主索引也会被压缩并存储在同一目录中。

根据表的具体引擎,在排序的同时[可能](/operations/settings/settings)还会进行其他转换。

数据^^部分^^是自包含的,包含解释其内容所需的所有元数据,无需中央目录。除了稀疏主索引之外,^^部分^^还包含其他元数据,例如辅助[数据跳过索引](/optimize/skipping-indexes)、[列统计信息](https://clickhouse.com/blog/clickhouse-release-23-11#column-statistics-for-prewhere)、校验和、最小-最大索引(如果使用了[分区](/partitions))以及[更多](https://github.com/ClickHouse/ClickHouse/blob/a065b11d591f22b5dd50cb6224fab2ca557b4989/src/Storages/MergeTree/MergeTreeData.h#L104)。


## 数据分片合并 {#part-merges}

为了管理每个表中 ^^parts^^ 的数量,[后台合并](/merges)任务会定期将较小的 ^^parts^^ 合并成较大的 ^^parts^^,直到达到[可配置的](/operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool)压缩大小(通常约 150 GB)。 合并后的 ^^parts^^ 会被标记为非活动状态,并在经过[可配置的](/operations/settings/merge-tree-settings#old_parts_lifetime)时间间隔后删除。 随着时间推移,这个过程会创建出合并后 ^^parts^^ 的层次结构,这也是它被称为 ^^MergeTree^^ 表的原因:

<Image img={merges} size='lg' />

<br />

为了最小化初始 ^^parts^^ 的数量和合并开销,[建议](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)数据库客户端采用批量插入方式,例如一次插入 20,000 行,或使用[异步插入模式](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)。在异步插入模式下,ClickHouse 会将多个传入 INSERT 的行缓冲到同一个表中,仅在缓冲区大小超过可配置的阈值或超时到期后才创建新的 part。


## 监控表的分片 {#monitoring-table-parts}

你可以使用[虚拟列](/engines/table-engines#table_engines-virtual_columns) `_part` 来[查询](https://sql.clickhouse.com/?query=U0VMRUNUIF9wYXJ0CkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGUKR1JPVVAgQlkgX3BhcnQKT1JERVIgQlkgX3BhcnQgQVNDOw&run_query=true&tab=results)示例表当前存在的所有活动 ^^分片^^ 列表：

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

上面的查询会返回磁盘上的目录名称，每个目录都对应表的一个活动数据分片。目录名称中的各个组成部分具有特定含义，感兴趣的读者可以在[此处](https://github.com/ClickHouse/ClickHouse/blob/f90551824bb90ade2d8a1d8edd7b0a3c0a459617/src/Storages/MergeTree/MergeTreeData.h#L130)查阅详细说明。

另外，ClickHouse 会在 [system.parts](/operations/system-tables/parts) 系统表中跟踪所有表的所有 ^^分片^^ 信息，下面的查询会为前面的示例表[返回](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICBuYW1lLAogICAgbGV2ZWwsCiAgICByb3dzCkZST00gc3lzdGVtLnBhcnRzCldIRVJFIChkYXRhYmFzZSA9ICd1aycpIEFORCAoYHRhYmxlYCA9ICd1a19wcmljZV9wYWlkX3NpbXBsZScpIEFORCBhY3RpdmUKT1JERVIgQlkgbmFtZSBBU0M7&run_query=true&tab=results)所有当前活动 ^^分片^^ 的列表、它们的合并层级，以及这些 ^^分片^^ 中存储的行数：

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

每当对某个分片执行一次新的合并操作，其合并层级就会加一。层级为 0 表示这是尚未被合并过的新分片。
