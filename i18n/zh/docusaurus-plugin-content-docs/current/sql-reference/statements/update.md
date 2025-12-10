---
description: '轻量级更新通过补丁部分简化了数据库中的数据更新过程。'
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
轻量级更新目前为 Beta 功能。
如果遇到问题，请在 [ClickHouse 仓库](https://github.com/clickhouse/clickhouse/issues) 中提交 issue。
:::

轻量级 `UPDATE` 语句用于更新表 `[db.]table` 中满足表达式 `filter_expr` 的行。
之所以称为“轻量级更新”，是为了与 [`ALTER TABLE ... UPDATE`](/sql-reference/statements/alter/update) 查询区分开来；后者是一个需要重写数据分片（data parts）中整列数据的重量级操作。
它仅适用于 [`MergeTree`](/engines/table-engines/mergetree-family/mergetree) 表引擎家族。

```sql
UPDATE [db.]table [ON CLUSTER cluster] SET column1 = expr1 [, ...] [IN PARTITION partition_expr] WHERE filter_expr;
```

`filter_expr` 必须是 `UInt8` 类型。此查询会将指定列的值更新为对应表达式的值，更新发生在那些 `filter_expr` 为非零的行上。
值会使用 `CAST` 运算符转换为列的数据类型。不支持更新用于计算主键或分区键的列。

## 示例 {#examples}

```sql
UPDATE hits SET Title = 'Updated Title' WHERE EventDate = today();

UPDATE wikistat SET hits = hits + 1, time = now() WHERE path = 'ClickHouse';
```

## 轻量级更新不会立即更新数据 {#lightweight-update-does-not-update-data-immediately}

轻量级 `UPDATE` 是通过 **补丁部件（patch parts）** 实现的，这是一种只包含已更新列和行的特殊数据部件。
轻量级 `UPDATE` 会创建补丁部件，但不会立即对存储中的原始数据进行物理修改。
更新过程类似于 `INSERT ... SELECT ...` 查询，但 `UPDATE` 查询会在补丁部件创建完成后才返回。

更新后的值具有以下特性：
- 在应用补丁后，通过 `SELECT` 查询中**可立即看到**
- 仅在后续的合并（merge）和变更（mutation）过程中才会在物理数据部分中被**实际物化**
- 一旦所有活动数据分片中的补丁都已完成物化，就会被**自动清理**

## 轻量级更新的要求 {#lightweight-update-requirements}

轻量级更新适用于 [`MergeTree`](/engines/table-engines/mergetree-family/mergetree)、[`ReplacingMergeTree`](/engines/table-engines/mergetree-family/replacingmergetree)、[`CollapsingMergeTree`](/engines/table-engines/mergetree-family/collapsingmergetree) 引擎及其 [`Replicated`](/engines/table-engines/mergetree-family/replication.md) 和 [`Shared`](/cloud/reference/shared-merge-tree) 版本。

要使用轻量级更新，必须通过表设置 [`enable_block_number_column`](/operations/settings/merge-tree-settings#enable_block_number_column) 和 [`enable_block_offset_column`](/operations/settings/merge-tree-settings#enable_block_offset_column) 启用 `_block_number` 和 `_block_offset` 列的物化。

## 轻量级删除 {#lightweight-delete}

[轻量级 `DELETE`](/sql-reference/statements/delete) 查询可以作为轻量级 `UPDATE` 执行，而不是作为 `ALTER UPDATE` 变更语句。轻量级 `DELETE` 的实现由 [`lightweight_delete_mode`](/operations/settings/settings#lightweight_delete_mode) 设置进行控制。

## 性能注意事项 {#performance-considerations}

**轻量级更新的优势：**
- 更新延迟与 `INSERT ... SELECT ...` 查询的延迟相当
- 仅写入被更新的列和值，而不是数据部分中的整列
- 无需等待当前正在运行的合并/变更操作完成，因此更新延迟是可预测的
- 支持轻量级更新的并行执行

**潜在的性能影响：**
- 需要应用补丁的 `SELECT` 查询会增加开销
- 对于包含待应用补丁的数据部分，其中的列将不会使用[跳过索引](/engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-data_skipping-indexes)。如果表中存在补丁部分，则[投影](/engines/table-engines/mergetree-family/mergetree.md/#projections)将不会被使用，即使某些数据部分本身没有待应用的补丁。
- 过于频繁的小更新可能会导致 “too many parts” 错误。建议将多个更新合并为单个查询，例如在 `WHERE` 子句中通过一个 `IN` 子句统一指定所有要更新的 id
- 轻量级更新旨在用于更新少量行（大约不超过表的 10%）。如果需要更新更大数量的数据，建议使用 [`ALTER TABLE ... UPDATE`](/sql-reference/statements/alter/update) 变更操作

## 并发操作 {#concurrent-operations}

与重型 mutation 不同，轻量级更新不会等待当前正在运行的合并/变更操作完成。
并发轻量级更新的一致性由设置 [`update_sequential_consistency`](/operations/settings/settings#update_sequential_consistency) 和 [`update_parallel_mode`](/operations/settings/settings#update_parallel_mode) 控制。

## 更新权限 {#update-permissions}

`UPDATE` 需要 `ALTER UPDATE` 权限。要为指定用户在特定表上启用执行 `UPDATE` 语句的权限，请运行：

```sql
GRANT ALTER UPDATE ON db.table TO username;
```

## 实现细节 {#details-of-the-implementation}

Patch part 与常规 part 相同，但只包含已更新的列以及若干系统列：
- `_part` - 原始 part 的名称
- `_part_offset` - 原始 part 中的行号
- `_block_number` - 原始 part 中该行所在的 block 编号
- `_block_offset` - 原始 part 中该行在 block 内的偏移量
- `_data_version` - 更新数据的数据版本（为 `UPDATE` 查询分配的 block 编号）

平均而言，每行更新在 patch part 中会带来大约 40 字节（未压缩数据）的额外开销。
系统列有助于在原始 part 中查找需要更新的行。
系统列与原始 part 中的[虚拟列](/engines/table-engines/mergetree-family/mergetree.md/#virtual-columns)相关联，如果需要应用 patch part，这些虚拟列会在读取时被添加。
Patch part 按 `_part` 和 `_part_offset` 排序。

Patch part 属于与原始 part 不同的分区。
Patch part 的分区 ID 为 `patch-<hash of column names in patch part>-<original_partition_id>`。
因此，包含不同列的 patch part 会存储在不同的分区中。
例如，三次更新 `SET x = 1 WHERE <cond>`、`SET y = 1 WHERE <cond>` 和 `SET x = 1, y = 1 WHERE <cond>` 会在三个不同的分区中创建三个 patch part。

Patch part 之间可以相互合并，以减少在 `SELECT` 查询中需要应用的补丁数量并降低开销。Patch part 的合并使用 [replacing](/engines/table-engines/mergetree-family/replacingmergetree) 合并算法，并将 `_data_version` 作为版本列。
因此，patch part 始终为该 part 中每个被更新的行存储最新版本。

轻量级更新不会等待当前正在运行的 merge 和 mutation 完成，而是始终使用数据 part 的当前快照来执行更新并生成 patch part。
因此，在应用 patch part 时可能会有两种情况。

例如，如果我们读取 part `A`，需要应用 patch part `X`：
- 如果 `X` 直接包含 part `A` 本身。这种情况发生在执行 `UPDATE` 时，`A` 没有参与 merge。
- 如果 `X` 包含 part `B` 和 `C`，而它们已被 part `A` 覆盖。这种情况发生在执行 `UPDATE` 时，正在运行一个 merge (`B`, `C`) -> `A`。

针对这两种情况，分别有两种应用 patch part 的方式：
- 使用 `_part`、`_part_offset` 排序列进行 merge。
- 使用 `_block_number`、`_block_offset` 列进行 join。

join 模式比 merge 模式更慢且需要更多内存，但使用频率较低。

## 相关内容 {#related-content}

- [`ALTER UPDATE`](/sql-reference/statements/alter/update) - 大规模 `UPDATE` 操作
- [轻量级 `DELETE`](/sql-reference/statements/delete) - 轻量级 `DELETE` 操作
