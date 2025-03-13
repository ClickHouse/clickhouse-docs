---
slug: /sql-reference/statements/delete
sidebar_position: 36
sidebar_label: 删除
description: 轻量级删除简化了从数据库中删除数据的过程。
keywords: [删除]
title: 轻量级删除语句
---

轻量级 `DELETE` 语句从表 `[db.]table` 中删除匹配表达式 `expr` 的行。它仅适用于 *MergeTree 表引擎系列。

``` sql
DELETE FROM [db.]table [ON CLUSTER cluster] [IN PARTITION partition_expr] WHERE expr;
```

之所以称为“轻量级 `DELETE`”，是为了与 [ALTER TABLE ... DELETE](/sql-reference/statements/alter/delete) 命令进行对比，后者是一种重量级过程。

## 示例 {#examples}

```sql
-- 删除 `hits` 表中 `Title` 列包含文本 `hello` 的所有行
DELETE FROM hits WHERE Title LIKE '%hello%';
```

## 轻量级 `DELETE` 不会立即删除数据 {#lightweight-delete-does-not-delete-data-immediately}

轻量级 `DELETE` 实施为一种 [mutation](/sql-reference/statements/alter#mutations)，它标记行为已删除，但并不立即物理删除它们。

默认情况下，`DELETE` 语句会在标记行已删除完成后才返回。如果数据量很大，这可能需要很长时间。或者，您可以使用设置 [`lightweight_deletes_sync`](/operations/settings/settings#lightweight_deletes_sync) 在后台异步运行它。如果禁用，则 `DELETE` 语句将立即返回，但在后台变更完成之前，查询仍然可以看到数据。

变更不会物理删除已标记为删除的行，这只会在下次合并时发生。因此，在未指定的时间内，数据实际上可能并未从存储中删除，而只是标记为删除。

如果您需要确保您的数据在可预测的时间内从存储中删除，请考虑使用表设置 [`min_age_to_force_merge_seconds`](/operations/settings/merge-tree-settings#min_age_to_force_merge_seconds)。或者，您可以使用 [ALTER TABLE ... DELETE](/sql-reference/statements/alter/delete) 命令。请注意，使用 `ALTER TABLE ... DELETE` 删除数据可能会消耗大量资源，因为它会重新创建所有受影响的分区片段。

## 删除大量数据 {#deleting-large-amounts-of-data}

大量删除可能对 ClickHouse 性能产生负面影响。如果您试图从表中删除所有行，请考虑使用 [`TRUNCATE TABLE`](/sql-reference/statements/truncate) 命令。

如果您预计会频繁删除，请考虑使用 [自定义分区键](/engines/table-engines/mergetree-family/custom-partitioning-key)。然后您可以使用 [`ALTER TABLE ... DROP PARTITION`](/sql-reference/statements/alter/partition#drop-partitionpart) 命令快速删除与该分区关联的所有行。

## 轻量级 `DELETE` 的限制 {#limitations-of-lightweight-delete}

### 带有投影的轻量级 `DELETE` {#lightweight-deletes-with-projections}

默认情况下，`DELETE` 不适用于具有投影的表。这是因为投影中的行可能会受到 `DELETE` 操作的影响。但有一个 [MergeTree 设置](/operations/settings/merge-tree-settings) `lightweight_mutation_projection_mode` 可以改变此行为。

## 使用轻量级 `DELETE` 的性能考虑 {#performance-considerations-when-using-lightweight-delete}

**使用轻量级 `DELETE` 语句删除大量数据可能会对 SELECT 查询性能产生负面影响。**

以下因素也可能会对轻量级 `DELETE` 性能产生负面影响：

- `DELETE` 查询中的重型 `WHERE` 条件。
- 如果变更队列充满了许多其他变更，这可能会导致性能问题，因为表上的所有变更都是按顺序执行的。
- 受影响表的数据分区片段非常多。
- 在紧凑的分区片段中有大量数据。在紧凑的分区片段中，所有列都存储在一个文件中。

## 删除权限 {#delete-permissions}

`DELETE` 需要 `ALTER DELETE` 特权。要为特定用户启用特定表上的 `DELETE` 语句，请运行以下命令：

```sql
GRANT ALTER DELETE ON db.table to username;
```

## 轻量级 DELETE 在 ClickHouse 中的内部工作原理 {#how-lightweight-deletes-work-internally-in-clickhouse}

1. **对受影响的行应用“掩码”**

   当执行 `DELETE FROM table ...` 查询时，ClickHouse 保存一个掩码，其中每行被标记为“存在”或“已删除”。这些“已删除”的行在后续查询中被忽略。然而，行实际上只有在后续合并时才会被移除。写入这个掩码相比 `ALTER TABLE ... DELETE` 查询所做的要轻量得多。

   掩码实现为一个隐藏的系统列 `_row_exists`，它为所有可见行存储 `True`，为已删除的行存储 `False`。当某部分中有行被删除时，该列仅在此部分中存在。当某部分的所有值都等于 `True` 时，此列不存在。

2. **`SELECT` 查询被转化为包含掩码**

   当查询中使用被掩盖的列时，内部 `SELECT ... FROM table WHERE condition` 查询会通过在 `_row_exists` 上的谓词扩展，并转化为：
   ```sql
   SELECT ... FROM table PREWHERE _row_exists WHERE condition
   ```
   在执行时，读取 `_row_exists` 列以确定哪些行不应返回。如果有许多已删除的行，ClickHouse 可以确定在读取其余列时哪些分粒可以完全跳过。

3. **`DELETE` 查询被转化为 `ALTER TABLE ... UPDATE` 查询**

   `DELETE FROM table WHERE condition` 被翻译为 `ALTER TABLE table UPDATE _row_exists = 0 WHERE condition` 的变更。

   在内部，此变更分两步执行：

   1. 为每个单独的部分执行 `SELECT count() FROM table WHERE condition` 命令，以确定该部分是否受到影响。

   2. 根据上述命令，影响到的部分被变更，并为未影响的部分创建硬链接。在宽部分的情况下，每行的 `_row_exists` 列更新，所有其他列的文件都被硬链接。对于紧凑部分，由于所有列都存储在一个文件中，因此所有列都被重写。

   从上述步骤来看，使用掩码技术的轻量级 `DELETE` 在性能上优于传统的 `ALTER TABLE ... DELETE`，因为它并不重新写入所有受影响部分的所有列文件。

## 相关内容 {#related-content}

- 博客: [在 ClickHouse 中处理更新和删除](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
