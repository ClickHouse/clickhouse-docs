---
slug: /parts
title: '表数据片段（parts）'
description: 'ClickHouse 中的数据片段（parts）是什么'
keywords: ['part']
doc_type: 'reference'
---

import merges from '@site/static/images/managing-data/core-concepts/merges.png';
import part from '@site/static/images/managing-data/core-concepts/part.png';
import Image from '@theme/IdealImage';


## ClickHouse 中的表部分是什么？ {#what-are-table-parts-in-clickhouse}

<br />

ClickHouse [MergeTree 引擎家族](/engines/table-engines/mergetree-family)中每个表的数据在磁盘上组织为一组不可变的 `data parts`(数据部分)。

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

① **排序**:行按表的^^排序键^^ `(town, street)` 进行排序,并为排序后的行生成[稀疏主索引](/guides/best-practices/sparse-primary-indexes)。

② **拆分**:排序后的数据按列拆分。

③ **压缩**:每一列都会被[压缩](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)。

④ **写入磁盘**:压缩后的列作为二进制列文件保存在代表此次插入的数据部分的新目录中。稀疏主索引也会被压缩并存储在同一目录中。

根据表的具体引擎,在排序的同时[可能](/operations/settings/settings)会进行额外的转换。

数据^^部分^^是自包含的,包含解释其内容所需的所有元数据,无需中央目录。除了稀疏主索引之外,^^部分^^还包含额外的元数据,例如辅助[数据跳过索引](/optimize/skipping-indexes)、[列统计信息](https://clickhouse.com/blog/clickhouse-release-23-11#column-statistics-for-prewhere)、校验和、最小-最大索引(如果使用了[分区](/partitions))以及[更多](https://github.com/ClickHouse/ClickHouse/blob/a065b11d591f22b5dd50cb6224fab2ca557b4989/src/Storages/MergeTree/MergeTreeData.h#L104)。


## 数据分片合并 {#part-merges}

为了管理每个表中 ^^parts^^ 的数量,[后台合并](/merges)作业会定期将较小的 ^^parts^^ 合并成较大的 ^^parts^^,直到达到[可配置的](/operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool)压缩大小(通常约为 150 GB)。已合并的 ^^parts^^ 会被标记为非活动状态,并在经过[可配置的](/operations/settings/merge-tree-settings#old_parts_lifetime)时间间隔后删除。随着时间推移,这个过程会形成已合并 ^^parts^^ 的层次结构,这也是 ^^MergeTree^^ 表名称的由来:

<Image img={merges} size='lg' />

<br />

为了减少初始 ^^parts^^ 的数量和合并开销,[建议](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)数据库客户端采用批量插入方式,例如一次插入 20,000 行,或使用[异步插入模式](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)。在异步插入模式下,ClickHouse 会将多个传入 INSERT 语句的数据行缓冲到同一张表中,仅在缓冲区大小超过可配置阈值或超时时间到期后才创建新的 part。


## 监控表数据分片 {#monitoring-table-数据分片}

您可以使用[虚拟列](/engines/table-engines#table_engines-virtual_columns) `_part` 来[查询](https://sql.clickhouse.com/?query=U0VMRUNUIF9wYXJ0CkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGUKR1JPVVAgQlkgX3BhcnQKT1JERVIgQlkgX3BhcnQgQVNDOw&run_query=true&tab=results)示例表中当前所有活跃^^数据分片^^的列表:

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

上述查询会检索磁盘上的目录名称,每个目录代表表的一个活跃数据分片。这些目录名称的各个组成部分具有特定含义,感兴趣的读者可以在[此处](https://github.com/ClickHouse/ClickHouse/blob/f90551824bb90ade2d8a1d8edd7b0a3c0a459617/src/Storages/MergeTree/MergeTreeData.h#L130)查阅相关文档以进一步了解。

另外,ClickHouse 在 [system.数据分片](/operations/system-tables/数据分片) 系统表中跟踪所有表的所有^^数据分片^^信息,以下查询针对上述示例表[返回](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICBuYW1lLAogICAgbGV2ZWwsCiAgICByb3dzCkZST00gc3lzdGVtLnBhcnRzCldIRVJFIChkYXRhYmFzZSA9ICd1aycpIEFORCAoYHRhYmxlYCA9ICd1a19wcmljZV9wYWlkX3NpbXBsZScpIEFORCBhY3RpdmUKT1JERVIgQlkgbmFtZSBBU0M7&run_query=true&tab=results)当前所有活跃^^数据分片^^的列表、它们的合并层级以及这些^^数据分片^^中存储的行数:

```sql
SELECT
    name,
    level,
    rows
FROM system.数据分片
WHERE (database = 'uk') AND (`table` = 'uk_price_paid_simple') AND active
ORDER BY name ASC;

   ┌─name────────┬─level─┬────rows─┐
1. │ all_0_5_1   │     1 │ 6368414 │
2. │ all_12_17_1 │     1 │ 6442494 │
3. │ all_18_23_1 │     1 │ 5977762 │
4. │ all_6_11_1  │     1 │ 6459763 │
   └─────────────┴───────┴─────────┘
```

每次对数据分片进行额外合并时,合并层级会递增 1。层级为 0 表示这是一个尚未经过合并的新数据分片。
