---
'description': '轻量级删除简化了从数据库中删除数据的过程。'
'keywords':
- 'delete'
'sidebar_label': 'DELETE'
'sidebar_position': 36
'slug': '/sql-reference/statements/delete'
'title': '轻量级 DELETE 语句'
---

轻量级 `DELETE` 语句从表 `[db.]table` 中删除与表达式 `expr` 匹配的行。它仅可用于 *MergeTree 表引擎系列。

```sql
DELETE FROM [db.]table [ON CLUSTER cluster] [IN PARTITION partition_expr] WHERE expr;
```

之所以称为“轻量级 `DELETE`”，是为了与 [ALTER TABLE ... DELETE](/sql-reference/statements/alter/delete) 命令形成对比，后者是一个重量级过程。

## 示例 {#examples}

```sql
-- Deletes all rows from the `hits` table where the `Title` column contains the text `hello`
DELETE FROM hits WHERE Title LIKE '%hello%';
```

## 轻量级 `DELETE` 不会立即删除数据 {#lightweight-delete-does-not-delete-data-immediately}

轻量级 `DELETE` 实现为一个 [mutation](/sql-reference/statements/alter#mutations)，它将行标记为已删除，但并不会立即物理删除它们。

默认情况下，`DELETE` 语句会等待直到标记行已删除完成后再返回。如果数据量很大，这可能需要很长时间。或者，您可以使用设置 [`lightweight_deletes_sync`](/operations/settings/settings#lightweight_deletes_sync) 在后台异步运行它。如果禁用，`DELETE` 语句将立即返回，但在后台分支完成之前，数据仍可能对查询可见。

该变更不会物理删除已标记为删除的行，只有在下次合并时才会发生。因此，在未指定的时间内，数据可能不会立即从存储中删除，而只是标记为已删除。

如果您需要确保数据在可预测的时间内从存储中删除，可以考虑使用表设置 [`min_age_to_force_merge_seconds`](/operations/settings/merge-tree-settings#min_age_to_force_merge_seconds)。或者，您可以使用 [ALTER TABLE ... DELETE](/sql-reference/statements/alter/delete) 命令。请注意，使用 `ALTER TABLE ... DELETE` 删除数据可能会消耗大量资源，因为它会重新创建所有受影响的部分。

## 删除大量数据 {#deleting-large-amounts-of-data}

大量删除可能会对 ClickHouse 性能产生负面影响。如果您试图从表中删除所有行，建议使用 [`TRUNCATE TABLE`](/sql-reference/statements/truncate) 命令。

如果您预期会频繁删除，可以考虑使用 [自定义分区键](/engines/table-engines/mergetree-family/custom-partitioning-key)。然后，您可以使用 [`ALTER TABLE ... DROP PARTITION`](/sql-reference/statements/alter/partition#drop-partitionpart) 命令快速删除与该分区相关的所有行。

## 轻量级 `DELETE` 的限制 {#limitations-of-lightweight-delete}

### 带有投影的轻量级 `DELETE` {#lightweight-deletes-with-projections}

默认情况下，`DELETE` 不适用于带有投影的表。这是因为投影中的行可能会受 `DELETE` 操作的影响。但有一个 [MergeTree 设置](/operations/settings/merge-tree-settings) `lightweight_mutation_projection_mode` 可以更改此行为。

## 使用轻量级 `DELETE` 的性能考虑 {#performance-considerations-when-using-lightweight-delete}

**使用轻量级 `DELETE` 语句删除大量数据可能会对 SELECT 查询性能产生负面影响。**

以下因素也可能对轻量级 `DELETE` 性能产生负面影响：

- `DELETE` 查询中的繁重 `WHERE` 条件。
- 如果变更队列中填充了许多其他变更，这可能会导致性能问题，因为对表的所有变更都是按顺序执行的。
- 受影响的表有大量数据部分。
- 在紧凑部分中有大量数据。在紧凑部分中，所有列都存储在一个文件中。

## 删除权限 {#delete-permissions}

`DELETE` 需要 `ALTER DELETE` 权限。要为特定用户在指定表上启用 `DELETE` 语句，请运行以下命令：

```sql
GRANT ALTER DELETE ON db.table to username;
```

## 点击房子内部如何工作轻量级 DELETE {#how-lightweight-deletes-work-internally-in-clickhouse}

1. **对受影响行应用“掩码”**

   当执行 `DELETE FROM table ...` 查询时，ClickHouse 保存一个掩码，其中每行被标记为“存在”或“已删除”。这些“已删除”的行在后续查询中被省略。不过，实际上这些行会在后续合并中被删除。写入此掩码要比通过 `ALTER TABLE ... DELETE` 查询所做的工作轻得多。

   该掩码实现为一个隐藏的 `_row_exists` 系统列，存储可见行的 `True` 和已删除行的 `False`。只有当部分中有某些行被删除时，该列才会存在。当一个部分中的所有值都等于 `True` 时，该列不存在。

2. **`SELECT` 查询被转换以包括掩码**

   当在查询中使用掩码列时，内部的 `SELECT ... FROM table WHERE condition` 查询将通过对 `_row_exists` 的谓词进行扩展，并转换为：
```sql
SELECT ... FROM table PREWHERE _row_exists WHERE condition
```
   在执行时，读取列 `_row_exists` 以确定哪些行不应返回。如果有很多已删除的行，ClickHouse 可以确定在读取其余列时可以完全跳过哪些粒度。

3. **`DELETE` 查询被转换为 `ALTER TABLE ... UPDATE` 查询**

   `DELETE FROM table WHERE condition` 被翻译为 `ALTER TABLE table UPDATE _row_exists = 0 WHERE condition` 的变更。

   从内部来看，该变更分为两个步骤执行：

   1. 为每个单独的部分执行 `SELECT count() FROM table WHERE condition` 命令，以确定该部分是否受影响。

   2. 根据以上命令，对受影响的部分进行变更，并为未受影响的部分创建硬链接。在宽部分的情况下，更新每行的 `_row_exists` 列，而所有其他列的文件则被硬链接。对于紧凑部分，由于所有列都存储在一个文件中，因此所有列都被重新写入。

   通过以上步骤，可以看出使用掩码技术的轻量级 `DELETE` 在性能上优于传统的 `ALTER TABLE ... DELETE`，因为它不需要重新写入受影响部分的所有列文件。

## 相关内容 {#related-content}

- 博客: [处理 ClickHouse 中的更新和删除](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
