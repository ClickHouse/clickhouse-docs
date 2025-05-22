---
'slug': '/parts'
'title': '表分区片段'
'description': '在 ClickHouse 中数据分区片段是什么'
'keywords':
- 'part'
---

import merges from '@site/static/images/managing-data/core-concepts/merges.png';
import part from '@site/static/images/managing-data/core-concepts/part.png';
import Image from '@theme/IdealImage';

## ClickHouse中的表分片是什么？ {#what-are-table-parts-in-clickhouse}

<br/>

ClickHouse中每个表的数据在磁盘上以不可变的 `data parts` 集合组织，属于 [MergeTree 引擎家族](/engines/table-engines/mergetree-family)。

为了说明这一点，我们使用 [这个](https://sql.clickhouse.com/?query=U0hPVyBDUkVBVEUgVEFCTEUgdWsudWtfcHJpY2VfcGFpZF9zaW1wbGU&run_query=true&tab=results) 表（改编自 [英国物业价格数据集](/getting-started/example-datasets/uk-price-paid)），该表跟踪英国出售房产的日期、城镇、街道和价格：

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

您可以在我们的 ClickHouse SQL Playground 中 [查询此表](https://sql.clickhouse.com/?query=U0VMRUNUICogRlJPTSB1ay51a19wcmljZV9wYWlkX3NpbXBsZTs&run_query=true&tab=results)。

每当一组行插入到表中时，就会创建一个数据部分。以下图示展现了这一过程：

<Image img={part} size="lg"/>

<br/>

当 ClickHouse 服务器处理上面图中绘制的插入 4 行数据（例如，通过 [INSERT INTO 语句](/sql-reference/statements/insert-into)）时，它执行几个步骤：

① **排序**：行按表的排序键 `(town, street)` 排序，并为排序后的行生成一个 [稀疏主索引](/guides/best-practices/sparse-primary-indexes)。

② **拆分**：排序后的数据被拆分成列。

③ **压缩**：每列被 [压缩](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)。

④ **写入磁盘**：压缩后的列以二进制列文件的形式保存在一个新的目录中，该目录表示插入的数据部分。稀疏主索引也会被压缩并存储在同一目录中。

根据表的具体引擎，除了排序之外，可能还进行其他转换 [may](/operations/settings/settings)。

数据部分是自包含的，包括解释内容所需的所有元数据，而无需依赖中央目录。除了稀疏主索引外，部分还包含其他元数据，例如次级 [数据跳过索引](/optimize/skipping-indexes)、[列统计信息](https://clickhouse.com/blog/clickhouse-release-23-11#column-statistics-for-prewhere)、校验和、最小-最大索引（如果使用了 [分区](/partitions)），以及 [更多](https://github.com/ClickHouse/ClickHouse/blob/a065b11d591f22b5dd50cb6224fab2ca557b4989/src/Storages/MergeTree/MergeTreeData.h#L104)。

## 部分合并 {#part-merges}

为了管理每个表的部分数量，[后台合并](/merges) 任务会定期将较小的部分合并成较大的部分，直到它们达到 [可配置的](/operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool) 压缩大小（通常约为 150 GB）。合并后的部分标记为非活动，并在经过 [可配置的](/operations/settings/merge-tree-settings#old_parts_lifetime) 时间间隔后被删除。随着时间的推移，这一过程创建了合并部分的层次结构，这就是为什么称之为 MergeTree 表：

<Image img={merges} size="lg"/>

<br/>

为了最小化初始部分的数量以及合并的开销，建议数据库客户端 [encouraged](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance) 批量插入元组，例如一次插入 20,000 行，或者使用 [异步插入模式](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)，在该模式下，ClickHouse 将来自多个插入的行缓冲到同一表中，只有在缓冲区大小超过可配置阈值或超时到期后，才创建一个新部分。

## 监控表分片 {#monitoring-table-parts}

您可以通过使用虚拟列 [_part](/engines/table-engines#table_engines-virtual_columns) 来 [查询](https://sql.clickhouse.com/?query=U0VMRUNUIF9wYXJ0CkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGUKR1JPVVAgQlkgX3BhcnQKT1JERVIgQlkgX3BhcnQgQVNDOw&run_query=true&tab=results) 我们示例表的所有当前活动部分列表：

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
上面的查询检索了磁盘上目录的名称，每个目录代表表的一个活动数据部分。这些目录名称的组成部分具有特定含义，感兴趣的用户可以在 [这里](https://github.com/ClickHouse/ClickHouse/blob/f90551824bb90ade2d8a1d8edd7b0a3c0a459617/src/Storages/MergeTree/MergeTreeData.h#L130) 查阅相关文档以进一步探索。

另外，ClickHouse 跟踪所有表的所有部分的信息，可以在 [system.parts](/operations/system-tables/parts) 系统表中找到，以下查询 [返回](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICBuYW1lLAogICAgbGV2ZWwsCiAgICByb3dzCkZST00gc3lzdGVtLnBhcnRzCldIRVJFIChkYXRhYmFzZSA9ICd1aycpIEFORCAoYHRhYmxlYCA9ICd1a19wcmljZV9wYWlkX3NpbXBsZScpIEFORCBhY3RpdmUKT1JERVIgQlkgbmFtZSBBU0M7&run_query=true&tab=results) 我们示例表的所有当前活动部分、它们的合并级别以及存储在这些部分中的行数：

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
每次对部分进行额外合并时，合并级别增加一。级别为 0 表示这是一个尚未合并的新部分。
