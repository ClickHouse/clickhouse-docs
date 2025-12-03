---
slug: /parts
title: '数据部分'
description: 'ClickHouse 中的数据部分是什么'
keywords: ['part']
doc_type: 'reference'
---

import merges from '@site/static/images/managing-data/core-concepts/merges.png';
import part from '@site/static/images/managing-data/core-concepts/part.png';
import Image from '@theme/IdealImage';


## ClickHouse 中的表部件是什么？ {#what-are-table-parts-in-clickhouse}

<br />

在 ClickHouse 中，每个使用 [MergeTree engine family](/engines/table-engines/mergetree-family) 的表，其数据在磁盘上被组织成一组不可变的 `data parts`（数据片段）。

为说明这一点，我们使用[这张表](https://sql.clickhouse.com/?query=U0hPVyBDUkVBVEUgVEFCTEUgdWsudWtfcHJpY2VfcGFpZF9zaW1wbGU\&run_query=true\&tab=results)（改编自 [UK property prices dataset](/getting-started/example-datasets/uk-price-paid)），用于追踪英国已售房产的成交日期、城镇、街道和价格：

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

你可以在我们的 ClickHouse SQL Playground 中[查询此表](https://sql.clickhouse.com/?query=U0VMRUNUICogRlJPTSB1ay51a19wcmljZV9wYWlkX3NpbXBsZTs\&run_query=true\&tab=results)。

每当有一组行被插入到表中时，就会创建一个数据部分（data part）。如下图所示：

<Image img={part} size="lg" />

<br />

当 ClickHouse 服务器处理示意图中包含 4 行的示例插入操作（例如通过 [INSERT INTO 语句](/sql-reference/statements/insert-into)）时，将执行以下几个步骤：

① **排序**：根据表的 ^^排序键^^ `(town, street)` 对行进行排序，并为排序后的行生成[稀疏主索引](/guides/best-practices/sparse-primary-indexes)。

② **拆分**：将排序后的数据按列拆分。

③ **压缩**：对每一列进行[压缩](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)。

④ **写入磁盘**：将压缩后的列作为二进制列文件保存在一个新目录中，该目录代表此次插入产生的数据部分。同时，稀疏主索引也会被压缩并存储在同一目录中。

根据表所使用的具体引擎，在排序的同时可能还会进行其他[转换](/operations/settings/settings)。

^^数据部分^^ 是自包含的，包含了解释其内容所需的全部元数据，而不需要一个集中式目录。除了稀疏主索引之外，^^数据部分^^ 还包含其他元数据，例如二级[数据跳过索引](/optimize/skipping-indexes)、[列统计信息](https://clickhouse.com/blog/clickhouse-release-23-11#column-statistics-for-prewhere)、校验和、最小-最大索引（如果使用了[分区](/partitions)），以及[更多信息](https://github.com/ClickHouse/ClickHouse/blob/a065b11d591f22b5dd50cb6224fab2ca557b4989/src/Storages/MergeTree/MergeTreeData.h#L104)。


## Part 合并 {#part-merges}

为了管理每个表中的 ^^parts^^ 数量，[后台合并](/merges) 任务会定期将较小的 ^^parts^^ 合并成更大的部分，直到它们达到一个[可配置的](/operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool)压缩大小（通常约为 150 GB）。合并后的 ^^parts^^ 会被标记为非活动，并在[可配置的](/operations/settings/merge-tree-settings#old_parts_lifetime)时间间隔后删除。随着时间推移，这一过程会形成一个由合并 ^^parts^^ 组成的分层结构，这也是该表引擎被称为 ^^MergeTree^^ 表的原因：

<Image img={merges} size="lg" />

<br />

为尽量减少初始 ^^parts^^ 的数量以及合并带来的开销，[数据库客户端](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)建议要么批量插入元组，例如一次插入 20,000 行，要么使用[异步插入模式](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)。在异步模式下，ClickHouse 会将来自多个针对同一张表的 INSERT 语句的行缓存在一起，仅当缓冲区大小超过可配置阈值或超时时，才创建一个新的 part。



## 监控表的分片 {#monitoring-table-parts}

你可以使用[虚拟列](/engines/table-engines#table_engines-virtual_columns) `_part`，[查询](https://sql.clickhouse.com/?query=U0VMRUNUIF9wYXJ0CkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGUKR1JPVVAgQlkgX3BhcnQKT1JERVIgQlkgX3BhcnQgQVNDOw\&run_query=true\&tab=results)示例表当前所有处于活动状态的 ^^parts^^（分片）列表：

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

上面的查询会检索磁盘上的目录名称，每个目录都代表该表的一个活动数据 part。目录名称中的各个组成部分具有特定含义，相关说明记录在[此处](https://github.com/ClickHouse/ClickHouse/blob/f90551824bb90ade2d8a1d8edd7b0a3c0a459617/src/Storages/MergeTree/MergeTreeData.h#L130)，供有兴趣进一步了解的读者参考。

另外，ClickHouse 会在 [system.parts](/operations/system-tables/parts) 系统表中跟踪所有表的全部 ^^parts^^ 信息，下面这个查询会针对上面的示例表[返回](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICBuYW1lLAogICAgbGV2ZWwsCiAgICByb3dzCkZST00gc3lzdGVtLnBhcnRzCldIRVJFIChkYXRhYmFzZSA9ICd1aycpIEFORCAoYHRhYmxlYCA9ICd1a19wcmljZV9wYWlkX3NpbXBsZScpIEFORCBhY3RpdmUKT1JERVIgQlkgbmFtZSBBU0M7\&run_query=true\&tab=results)当前所有活动 ^^parts^^ 的列表，包括它们的合并层级以及这些 ^^parts^^ 中存储的行数：

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

每在该数据块上执行一次合并操作，其合并级别就会增加 1。级别为 0 表示这是一个尚未被合并过的新数据块。
