---
'slug': '/parts'
'title': '表分区片段'
'description': 'ClickHouse中的数据部分是什么'
'keywords':
- 'part'
'doc_type': 'reference'
---

import merges from '@site/static/images/managing-data/core-concepts/merges.png';
import part from '@site/static/images/managing-data/core-concepts/part.png';
import Image from '@theme/IdealImage';

## 在 ClickHouse 中，表分区是什么？ {#what-are-table-parts-in-clickhouse}

<br />

ClickHouse [MergeTree 引擎系列](/engines/table-engines/mergetree-family) 中每个表的数据在磁盘上组织为不可变的 `data parts` 集合。

为了说明这一点，我们使用 [此](https://sql.clickhouse.com/?query=U0hPVyBDUkVBVEUgVEFCTEUgdWsudWtfcHJpY2VfcGFpZF9zaW1wbGU&run_query=true&tab=results) 表（改编自 [英国房产价格数据集](/getting-started/example-datasets/uk-price-paid)），跟踪在英国售出房产的日期、城镇、街道和价格：

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

当一组行插入到表中时，会创建一个数据分区。以下图示说明了这一点：

<Image img={part} size="lg" />

<br />

当 ClickHouse 服务器处理上面图中勾勒的 4 行示例插入（例如，通过 [INSERT INTO 语句](/sql-reference/statements/insert-into)）时，它会执行几个步骤：

① **排序**：行按表的 ^^sorting key^^ `(town, street)` 进行排序，并为排序后的行生成一个 [稀疏主索引](/guides/best-practices/sparse-primary-indexes)。

② **拆分**：排序后的数据被拆分为列。

③ **压缩**：每一列被 [压缩](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)。

④ **写入磁盘**：压缩后的列作为二进制列文件保存在一个新目录中，该目录表示插入的数据分区。稀疏主索引也被压缩并存储在同一目录中。

根据表的具体引擎，排序期间还可能发生其他转换 [可能](/operations/settings/settings)。

数据 ^^parts^^ 是自包含的，包括解释其内容所需的所有元数据，无需中央目录。除了稀疏主索引，^^parts^^ 还包含其他元数据，例如次要 [数据跳过索引](/optimize/skipping-indexes)、[列统计信息](https://clickhouse.com/blog/clickhouse-release-23-11#column-statistics-for-prewhere)、校验和、最小-最大索引（如果使用了 [分区](/partitions)）以及 [更多](https://github.com/ClickHouse/ClickHouse/blob/a065b11d591f22b5dd50cb6224fab2ca557b4989/src/Storages/MergeTree/MergeTreeData.h#L104)。

## 分区合并 {#part-merges}

为了管理每个表的 ^^parts^^ 数量，[后台合并](/merges) 任务会定期将较小的 ^^parts^^ 合并为较大的 ^^parts^^，直到它们达到可配置的 [压缩大小](/operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool)（通常约为 150 GB）。合并后的 ^^parts^^ 被标记为非活动，并在 [可配置](/operations/settings/merge-tree-settings#old_parts_lifetime) 时间间隔后被删除。随着时间的推移，该过程创建了一个合并的 ^^parts^^ 层次结构，这就是为什么它被称为 ^^MergeTree^^ 表：

<Image img={merges} size="lg" />

<br />

为了最小化初始 ^^parts^^ 的数量和合并的开销，数据库客户端被 [鼓励](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance) 要么批量插入元组，例如一次 20,000 行，要么使用 [异步插入模式](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)，在该模式下 ClickHouse 会将来自多个传入 INSERT 的行缓冲到同一表中，并仅在缓冲区大小超过可配置阈值或超时到期后创建新分区。

## 监控表分区 {#monitoring-table-parts}

您可以通过使用 [虚拟列](/engines/table-engines#table_engines-virtual_columns) `_part` 来 [查询](https://sql.clickhouse.com/?query=U0VMRUNUIF9wYXJ0CkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGUKR1JPVVAgQlkgX3BhcnQKT1JERVIgQlkgX3BhcnQgQVNDOw&run_query=true&tab=results) 我们示例表中所有当前存在的活动 ^^parts^^ 列表：

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
上述查询检索磁盘上的目录名称，每个目录代表表的一个活动数据分区。这些目录名称的组件具有特定含义，对于有兴趣进一步探索的人可以在 [这里](https://github.com/ClickHouse/ClickHouse/blob/f90551824bb90ade2d8a1d8edd7b0a3c0a459617/src/Storages/MergeTree/MergeTreeData.h#L130) 找到相关文档。

或者，ClickHouse 会在 [system.parts](/operations/system-tables/parts) 系统表中跟踪所有表的所有 ^^parts^^ 的信息，以下查询 [返回](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICBuYW1lLAogICAgbGV2ZWwsCiAgICByb3dzCkZST00gc3lzdGVtLnBhcnRzCldIRVJFIChkYXRhYmFzZSA9ICd1aycpIEFORCAoYHRhYmxlYCA9ICd1a19wcmljZV9wYWlkX3NpbXBsZScpIEFORCBhY3RpdmUKT1JERVIgQlkgbmFtZSBBU0M7&run_query=true&tab=results) 我们示例表中所有当前活动 ^^parts^^ 的列表、它们的合并级别以及存储在这些 ^^parts^^ 中的行数：

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
每次在分区上进行额外合并时，合并级别递增 1。级别 0 表示这是一个尚未合并的新分区。
