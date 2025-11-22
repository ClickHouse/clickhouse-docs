---
description: '轻量级更新通过使用补丁片段简化在数据库中更新数据的过程。'
keywords: ['update']
sidebar_label: 'UPDATE'
sidebar_position: 39
slug: /sql-reference/statements/update
title: '轻量级 UPDATE 语句'
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

:::note
轻量级更新目前处于 Beta 测试阶段。
如果遇到问题，请在 [ClickHouse 仓库](https://github.com/clickhouse/clickhouse/issues) 中提交 issue。
:::

轻量级 `UPDATE` 语句会更新表 `[db.]table` 中满足表达式 `filter_expr` 的行。
之所以称为“轻量级更新”，是为了与 [`ALTER TABLE ... UPDATE`](/sql-reference/statements/alter/update) 查询形成对比，后者是一个开销较大的过程，会重写数据分片中的整列数据。
它仅适用于 [`MergeTree`](/engines/table-engines/mergetree-family/mergetree) 表引擎家族。

```sql
UPDATE [db.]table [ON CLUSTER cluster] SET column1 = expr1 [, ...] [IN PARTITION partition_expr] WHERE filter_expr;
```

`filter_expr` 必须是 `UInt8` 类型。该查询会将指定列的值更新为相应表达式的值，仅对那些 `filter_expr` 结果为非零的行生效。
使用 `CAST` 运算符将值转换为列的类型。不支持更新参与计算主键或分区键的列。


## 示例 {#examples}

```sql
UPDATE hits SET Title = 'Updated Title' WHERE EventDate = today();

UPDATE wikistat SET hits = hits + 1, time = now() WHERE path = 'ClickHouse';
```


## 轻量级更新不会立即更新数据 {#lightweight-update-does-not-update-data-immediately}

轻量级 `UPDATE` 通过 **补丁部分（patch parts）** 实现——这是一种特殊的数据部分，仅包含已更新的列和行。
轻量级 `UPDATE` 会创建补丁部分,但不会立即在物理存储中修改原始数据。
更新过程类似于 `INSERT ... SELECT ...` 查询,但 `UPDATE` 查询会等待补丁部分创建完成后才返回结果。


更新后的值具有以下特性:

- 通过应用补丁,在 `SELECT` 查询中**立即可见**
- 仅在后续合并和变更操作期间**物理实体化**
- 一旦所有活动部分的补丁都已实体化,将**自动清理**

## 轻量级更新要求 {#lightweight-update-requirements}

轻量级更新支持 [`MergeTree`](/engines/table-engines/mergetree-family/mergetree)、[`ReplacingMergeTree`](/engines/table-engines/mergetree-family/replacingmergetree)、[`CollapsingMergeTree`](/engines/table-engines/mergetree-family/collapsingmergetree) 引擎及其 [`Replicated`](/engines/table-engines/mergetree-family/replication.md) 和 [`Shared`](/cloud/reference/shared-merge-tree) 版本。

要使用轻量级更新,必须通过表设置 [`enable_block_number_column`](/operations/settings/merge-tree-settings#enable_block_number_column) 和 [`enable_block_offset_column`](/operations/settings/merge-tree-settings#enable_block_offset_column) 启用 `_block_number` 和 `_block_offset` 列的物化。


## 轻量级删除 {#lightweight-delete}

[轻量级 `DELETE`](/sql-reference/statements/delete) 查询可以作为轻量级 `UPDATE` 执行,而非 `ALTER UPDATE` 变更操作。轻量级 `DELETE` 的实现通过设置 [`lightweight_delete_mode`](/operations/settings/settings#lightweight_delete_mode) 来控制。


## 性能考量 {#performance-considerations}

**轻量级更新的优势：**

- 更新延迟与 `INSERT ... SELECT ...` 查询的延迟相当
- 仅写入更新的列和值，而非数据部分中的完整列
- 无需等待当前正在运行的合并/变更操作完成，因此更新延迟可预测
- 支持并行执行轻量级更新

**潜在的性能影响：**

- 对需要应用补丁的 `SELECT` 查询增加额外开销
- 对于需要应用补丁的数据部分中的列，[跳数索引](/engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-data_skipping-indexes)将不会被使用。如果表中存在补丁部分，[投影](/engines/table-engines/mergetree-family/mergetree.md/#projections)将不会被使用，即使对于无需应用补丁的数据部分也是如此。
- 过于频繁的小规模更新可能导致"部分过多"错误。建议将多个更新批量合并到单个查询中，例如在 `WHERE` 子句中使用单个 `IN` 子句来指定需要更新的 id
- 轻量级更新适用于更新少量行（最多约占表的 10%）。如果需要更新更大量的数据，建议使用 [`ALTER TABLE ... UPDATE`](/sql-reference/statements/alter/update) 变更操作


## 并发操作 {#concurrent-operations}

与重量级变更不同,轻量级更新不会等待当前正在运行的合并/变更完成。
并发轻量级更新的一致性由 [`update_sequential_consistency`](/operations/settings/settings#update_sequential_consistency) 和 [`update_parallel_mode`](/operations/settings/settings#update_parallel_mode) 设置控制。


## 更新权限 {#update-permissions}

`UPDATE` 需要 `ALTER UPDATE` 权限。要为指定用户启用对特定表的 `UPDATE` 语句,请运行:

```sql
GRANT ALTER UPDATE ON db.table TO username;
```


## 实现细节 {#details-of-the-implementation}

补丁数据部分(patch parts)与常规数据部分相同,但仅包含更新的列和几个系统列:

- `_part` - 原始数据部分的名称
- `_part_offset` - 原始数据部分中的行号
- `_block_number` - 原始数据部分中该行的数据块编号
- `_block_offset` - 原始数据部分中该行的数据块偏移量
- `_data_version` - 更新数据的数据版本(为 `UPDATE` 查询分配的数据块编号)

平均而言,补丁数据部分中每个更新行会产生约 40 字节(未压缩数据)的开销。
系统列用于在原始数据部分中查找需要更新的行。
系统列与原始数据部分中的[虚拟列](/engines/table-engines/mergetree-family/mergetree.md/#virtual-columns)相关,当需要应用补丁数据部分时,这些虚拟列会被添加用于读取。
补丁数据部分按 `_part` 和 `_part_offset` 排序。

补丁数据部分与原始数据部分属于不同的分区。
补丁数据部分的分区 ID 为 `patch-<补丁数据部分中列名的哈希值>-<原始分区ID>`。
因此,包含不同列的补丁数据部分存储在不同的分区中。
例如,三个更新操作 `SET x = 1 WHERE <cond>`、`SET y = 1 WHERE <cond>` 和 `SET x = 1, y = 1 WHERE <cond>` 将在三个不同的分区中创建三个补丁数据部分。

补丁数据部分可以相互合并,以减少 `SELECT` 查询中应用的补丁数量并降低开销。补丁数据部分的合并使用[替换](/engines/table-engines/mergetree-family/replacingmergetree)合并算法,以 `_data_version` 作为版本列。
因此,补丁数据部分始终为数据部分中每个更新的行存储最新版本。

轻量级更新不会等待当前正在运行的合并和变更操作完成,而是始终使用数据部分的当前快照来执行更新并生成补丁数据部分。
因此,应用补丁数据部分可能存在两种情况。

例如,如果我们读取数据部分 `A`,需要应用补丁数据部分 `X`:

- 如果 `X` 包含数据部分 `A` 本身。这种情况发生在执行 `UPDATE` 时 `A` 未参与合并。
- 如果 `X` 包含数据部分 `B` 和 `C`,它们被数据部分 `A` 覆盖。这种情况发生在执行 `UPDATE` 时正在运行合并 (`B`, `C`) -> `A`。

对于这两种情况,分别有两种应用补丁数据部分的方式:

- 使用按排序列 `_part`、`_part_offset` 进行合并。
- 使用按 `_block_number`、`_block_offset` 列进行连接。

连接模式比合并模式更慢且需要更多内存,但使用频率较低。


## 相关内容 {#related-content}

- [`ALTER UPDATE`](/sql-reference/statements/alter/update) - 重量级 `UPDATE` 操作
- [轻量级 `DELETE`](/sql-reference/statements/delete) - 轻量级 `DELETE` 操作
