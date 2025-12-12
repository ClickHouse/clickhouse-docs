---
description: '轻量级删除简化了从数据库中删除数据的过程。'
keywords: ['delete']
sidebar_label: 'DELETE'
sidebar_position: 36
slug: /sql-reference/statements/delete
title: '轻量级 DELETE 语句'
doc_type: 'reference'
---

轻量级 `DELETE` 语句会从表 `[db.]table` 中删除符合表达式 `expr` 的行。它仅适用于 *MergeTree 表引擎家族。

```sql
DELETE FROM [db.]table [ON CLUSTER cluster] [IN PARTITION partition_expr] WHERE expr;
```

之所以称为「轻量级 `DELETE`」，是为了与 [ALTER TABLE ... DELETE](/sql-reference/statements/alter/delete) 命令区分开来，后者是一个重量级的操作。

## 示例 {#examples}

```sql
-- Deletes all rows from the `hits` table where the `Title` column contains the text `hello`
DELETE FROM hits WHERE Title LIKE '%hello%';
```

## 轻量级 `DELETE` 不会立即删除数据 {#lightweight-delete-does-not-delete-data-immediately}

轻量级 `DELETE` 是作为一种[变更（mutation）](/sql-reference/statements/alter#mutations)实现的，它会将行标记为已删除，但不会立即物理删除这些行。

默认情况下，`DELETE` 语句会在将行标记为已删除的过程完成后才返回。如果数据量很大，这可能需要较长时间。也可以通过设置 [`lightweight_deletes_sync`](/operations/settings/settings#lightweight_deletes_sync)，在后台以异步方式运行该操作。如果禁用该设置，`DELETE` 语句会立即返回，但在后台变更完成之前，这些数据对查询仍然可见。

变更操作不会物理删除已被标记为删除的行，实际删除只会在下一次合并时发生。其结果是，在一段不确定的时间内，数据实际上并未从存储中删除，而只是被标记为已删除。

如果需要保证数据在可预测的时间内从存储中删除，可以考虑使用表设置 [`min_age_to_force_merge_seconds`](/operations/settings/merge-tree-settings#min_age_to_force_merge_seconds)。或者可以使用 [ALTER TABLE ... DELETE](/sql-reference/statements/alter/delete) 命令。请注意，使用 `ALTER TABLE ... DELETE` 删除数据可能会消耗大量资源，因为它会重新创建所有受影响的数据部分。

## 删除大量数据 {#deleting-large-amounts-of-data}

大规模删除操作可能会对 ClickHouse 的性能产生负面影响。如果打算删除表中的所有行，请考虑使用 [`TRUNCATE TABLE`](/sql-reference/statements/truncate) 命令。

如果预计需要频繁执行删除操作，请考虑使用[自定义分区键](/engines/table-engines/mergetree-family/custom-partitioning-key)。然后可以使用 [`ALTER TABLE ... DROP PARTITION`](/sql-reference/statements/alter/partition#drop-partitionpart) 命令快速删除与该分区关联的所有行。

## 轻量级 `DELETE` 的限制 {#limitations-of-lightweight-delete}

### 带有投影的轻量级 `DELETE` {#lightweight-deletes-with-projections}

默认情况下，`DELETE` 不适用于包含投影的表。这是因为投影中的行也可能会受到 `DELETE` 操作的影响。不过，可以使用 [MergeTree 设置](/operations/settings/merge-tree-settings) `lightweight_mutation_projection_mode` 来更改此行为。

## 使用轻量级 `DELETE` 时的性能注意事项 {#performance-considerations-when-using-lightweight-delete}

**使用轻量级 `DELETE` 语句删除大量数据可能会对 `SELECT` 查询性能产生负面影响。**

以下情况也会对轻量级 `DELETE` 的性能产生负面影响：

- 在 `DELETE` 查询中使用复杂或开销较大的 `WHERE` 条件。
- 如果变更（mutation）队列中已经堆积了大量其他变更，由于同一张表上的所有变更都是按顺序执行的，这可能会导致性能问题。
- 受影响的表包含非常多的数据分片（data parts）。
- 在紧凑分片（Compact part）中存在大量数据。在紧凑分片中，所有列都存储在同一个文件中。

## 删除权限 {#delete-permissions}

`DELETE` 语句需要具有 `ALTER DELETE` 权限。要为指定用户在特定表上启用 `DELETE` 语句，请运行以下命令：

```sql
GRANT ALTER DELETE ON db.table to username;
```

## ClickHouse 内部是如何实现轻量级 DELETE 的 {#how-lightweight-deletes-work-internally-in-clickhouse}

1. **对受影响的行应用“掩码”**

   当执行 `DELETE FROM table ...` 查询时，ClickHouse 会保存一个掩码，其中每一行都会被标记为“存在”或“已删除”。这些“已删除”的行在后续查询中会被忽略。不过，这些行实际上只会在之后的合并操作中被真正移除。写入这个掩码要比执行 `ALTER TABLE ... DELETE` 查询时所做的工作轻量得多。

   掩码是通过一个隐藏的 `_row_exists` 系统列实现的，该列对所有可见行存储 `True`，对已删除的行存储 `False`。只有当一个数据片段（part）中存在被删除的行时，这一列才会存在于该 part 中；如果某个 part 中所有行的值都是 `True`，则该列不存在。

2. **`SELECT` 查询会被转换以包含掩码**

   当在查询中使用了带掩码的列时，`SELECT ... FROM table WHERE condition` 查询在内部会通过增加对 `_row_exists` 的谓词被转换为：
   ```sql
   SELECT ... FROM table PREWHERE _row_exists WHERE condition
   ```
   在执行时，会读取 `_row_exists` 列以确定哪些行不应该被返回。如果存在大量已删除的行，ClickHouse 可以在读取其他列时判定哪些粒度块（granule）可以被完全跳过。

3. **`DELETE` 查询会被转换为 `ALTER TABLE ... UPDATE` 查询**

   `DELETE FROM table WHERE condition` 会被转换为 `ALTER TABLE table UPDATE _row_exists = 0 WHERE condition` 这一变更（mutation）操作。

   在内部，这个变更操作会分两步执行：

   1. 对每个单独的 part 执行一条 `SELECT count() FROM table WHERE condition` 命令，以确定该 part 是否受影响。

   2. 基于上述命令的结果，对受影响的 part 进行变更，对未受影响的 part 创建硬链接。在 wide part 的情况下，会更新每一行的 `_row_exists` 列，而所有其他列对应的文件则通过硬链接的方式复用。对于 compact part，由于所有列都存储在同一个文件中，因此所有列都会被重新写入。

   从上述步骤可以看出，使用掩码技术的轻量级 `DELETE` 相比传统的 `ALTER TABLE ... DELETE` 性能更好，因为它不会为受影响的 part 重写所有列的文件。

## 相关内容 {#related-content}

- 博客文章：[在 ClickHouse 中处理更新和删除](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
