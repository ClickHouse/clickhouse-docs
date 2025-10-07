---
'description': '轻量级更新简化了使用分区片段在数据库中更新数据的过程。'
'keywords':
- 'update'
'sidebar_label': 'UPDATE'
'sidebar_position': 39
'slug': '/sql-reference/statements/update'
'title': '轻量级 UPDATE 语句'
'doc_type': 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge/>

:::note
轻量级更新目前处于测试阶段。
如果遇到问题，请在 [ClickHouse 仓库](https://github.com/clickhouse/clickhouse/issues) 中提起问题。
:::

轻量级 `UPDATE` 语句更新与表达式 `filter_expr` 匹配的表 `[db.]table` 中的行。
之所以称为“轻量级更新”，是为了与 [`ALTER TABLE ... UPDATE`](/sql-reference/statements/alter/update) 查询进行对比，后者是一个重型过程，重写数据部分中的整个列。
它仅适用于 [`MergeTree`](/engines/table-engines/mergetree-family/mergetree) 表引擎系列。

```sql
UPDATE [db.]table [ON CLUSTER cluster] SET column1 = expr1 [, ...] [IN PARTITION partition_expr] WHERE filter_expr;
```

`filter_expr` 必须为 `UInt8` 类型。该查询将指定列的值更新为 `filter_expr` 值为非零值的行中对应表达式的值。
使用 `CAST` 操作符将值转换为列类型。更新用于计算主键或分区键的列是不支持的。

## 示例 {#examples}

```sql
UPDATE hits SET Title = 'Updated Title' WHERE EventDate = today();

UPDATE wikistat SET hits = hits + 1, time = now() WHERE path = 'ClickHouse';
```

## 轻量级更新不会立即更新数据 {#lightweight-update-does-not-update-data-immediately}

轻量级 `UPDATE` 是通过 **patch parts** 实现的 - 一种仅包含更新列和行的特殊数据部分。
轻量级 `UPDATE` 创建补丁部分，但不会立即在存储中物理修改原始数据。
更新过程类似于 `INSERT ... SELECT ...` 查询，但 `UPDATE` 查询在返回之前等待补丁部分创建完成。

更新的值是：
- **立即可见** 通过补丁应用的 `SELECT` 查询
- **物理具现** 仅在后续的合并和变更过程中
- **自动清理** 一旦所有活动部分已经应用补丁

## 轻量级更新要求 {#lightweight-update-requirements}

轻量级更新支持 [`MergeTree`](/engines/table-engines/mergetree-family/mergetree)、[`ReplacingMergeTree`](/engines/table-engines/mergetree-family/replacingmergetree)、[`CollapsingMergeTree`](/engines/table-engines/mergetree-family/collapsingmergetree) 引擎及其 [`Replicated`](/engines/table-engines/mergetree-family/replication.md) 和 [`Shared`](/cloud/reference/shared-merge-tree) 版本。

要使用轻量级更新，必须通过表设置 [`enable_block_number_column`](/operations/settings/merge-tree-settings#enable_block_number_column) 和 [`enable_block_offset_column`](/operations/settings/merge-tree-settings#enable_block_offset_column) 启用 `_block_number` 和 `_block_offset` 列的具现化。

## 轻量级删除 {#lightweight-delete}

可以将 [轻量级 `DELETE`](/sql-reference/statements/delete) 查询作为轻量级 `UPDATE` 运行，而不是 `ALTER UPDATE` 变更。轻量级 `DELETE` 的实现由设置 [`lightweight_delete_mode`](/operations/settings/settings#lightweight_delete_mode) 控制。

## 性能考虑 {#performance-considerations}

**轻量级更新的优点：**
- 更新的延迟与 `INSERT ... SELECT ...` 查询的延迟相当
- 仅写入更新的列和值，而不是数据部分中的整个列
- 无需等待当前正在运行的合并/变更完成，因此更新的延迟是可预测的
- 可能并行执行轻量级更新

**潜在的性能影响：**
- 为需要应用补丁的 `SELECT` 查询添加额外开销
- [跳过索引](/engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-data_skipping-indexes) 将不适用于数据部分中需要应用补丁的列。如果表中存在补丁部分，则 [投影](/engines/table-engines/mergetree-family/mergetree.md/#projections) 将不被使用，包括数据部分中没有需要应用补丁的部分。
- 频繁的小更新可能导致“部分过多”错误。建议将多个更新批量成一个单独的查询，例如将更新的 ids 放在 `WHERE` 子句中的单个 `IN` 子句中
- 轻量级更新旨在更新少量行（最多约 10% 的表）。如果需要更新较大数量，建议使用 [`ALTER TABLE ... UPDATE`](/sql-reference/statements/alter/update) 变更

## 并发操作 {#concurrent-operations}

轻量级更新不同于重型变更，不需要等待当前运行的合并/变更完成。
并发轻量级更新的一致性由设置 [`update_sequential_consistency`](/operations/settings/settings#update_sequential_consistency) 和 [`update_parallel_mode`](/operations/settings/settings#update_parallel_mode) 控制。

## 更新权限 {#update-permissions}

`UPDATE` 需要 `ALTER UPDATE` 权限。要为特定用户启用特定表上的 `UPDATE` 语句，请运行：

```sql
GRANT ALTER UPDATE ON db.table TO username;
```

## 实现细节 {#details-of-the-implementation}

补丁部分与常规部分相同，但仅包含更新的列和几个系统列：
- `_part` - 原始部分的名称
- `_part_offset` - 原始部分中的行号
- `_block_number` - 原始部分中行的块编号
- `_block_offset` - 原始部分中行的块偏移量
- `_data_version` - 更新数据的数据版本（为 `UPDATE` 查询分配的块编号）

平均而言，它在补丁部分中每更新行提供大约 40 字节（未压缩数据）的开销。
系统列有助于找到原始部分中应该更新的行。
系统列与原始部分中的 [虚拟列](/engines/table-engines/mergetree-family/mergetree.md/#virtual-columns) 相关，这些虚拟列在应应用补丁部分时添加以供读取。
补丁部分按 `_part` 和 `_part_offset` 排序。

补丁部分属于与原始部分不同的分区。
补丁部分的分区 ID 为 `patch-<补丁部分列名的哈希>-<原始分区 ID>`。
因此，具有不同列的补丁部分存储在不同的分区中。
例如，三个更新 `SET x = 1 WHERE <cond>`、`SET y = 1 WHERE <cond>` 和 `SET x = 1, y = 1 WHERE <cond>` 将在三个不同的分区中创建三个补丁部分。

补丁部分可以在它们之间合并，以减少 `SELECT` 查询中已应用补丁的数量并减少开销。补丁部分的合并使用 [替换](/engines/table-engines/mergetree-family/replacingmergetree) 合并算法，使用 `_data_version` 作为版本列。
因此，补丁部分始终存储每个更新行在部分中的最新版本。

轻量级更新不等待当前运行的合并和变更完成，并始终使用数据部分的当前快照来执行更新并生成补丁部分。
因此可以有两种情况应用补丁部分。

例如，如果我们读取部分 `A`，需要应用补丁部分 `X`：
- 如果 `X` 包含部分 `A` 本身。发生这种情况是因为当执行 `UPDATE` 时，`A` 并未参与合并。
- 如果 `X` 包含部分 `B` 和 `C`，它们被部分 `A` 覆盖。这种情况发生在执行 `UPDATE` 时有一个合并（`B`、`C`）-> `A` 正在运行。

对于这两种情况，分别有两种方法应用补丁部分：
- 按照已排序列 `_part`、`_part_offset` 使用合并。
- 按照 `_block_number`、`_block_offset` 列使用连接。

连接模式比合并模式慢，并需要更多内存，但使用频率较低。

## 相关内容 {#related-content}

- [`ALTER UPDATE`](/sql-reference/statements/alter/update) - 重型 `UPDATE` 操作
- [轻量级 `DELETE`](/sql-reference/statements/delete) - 轻量级 `DELETE` 操作
