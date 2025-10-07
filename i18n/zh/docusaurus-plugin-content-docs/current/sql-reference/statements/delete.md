---
'description': '轻量级删除简化了从数据库中删除数据的过程。'
'keywords':
- 'delete'
'sidebar_label': 'DELETE'
'sidebar_position': 36
'slug': '/sql-reference/statements/delete'
'title': '轻量级 DELETE 语句'
'doc_type': 'reference'
---

轻量级的 `DELETE` 语句从表 `[db.]table` 中删除匹配表达式 `expr` 的行。它仅适用于 *MergeTree 表引擎家族。

```sql
DELETE FROM [db.]table [ON CLUSTER cluster] [IN PARTITION partition_expr] WHERE expr;
```

之所以称为“轻量级 `DELETE`”，是与 [ALTER TABLE ... DELETE](/sql-reference/statements/alter/delete) 命令形成对比，而后者是一个重量级的过程。

## 示例 {#examples}

```sql
-- Deletes all rows from the `hits` table where the `Title` column contains the text `hello`
DELETE FROM hits WHERE Title LIKE '%hello%';
```

## 轻量级 `DELETE` 并不立即删除数据 {#lightweight-delete-does-not-delete-data-immediately}

轻量级 `DELETE` 实现为一个 [突变](/sql-reference/statements/alter#mutations)，它将行标记为已删除，但不会立即物理删除它们。

默认情况下，`DELETE` 语句会等到标记删除行完成后再返回。如果数据量很大，这可能会需要很长时间。或者，你可以使用设置 [`lightweight_deletes_sync`](/operations/settings/settings#lightweight_deletes_sync) 在后台异步运行。如果禁用，`DELETE` 语句将立即返回，但数据在后台突变完成之前仍可能对查询可见。

突变并不会物理删除被标记为删除的行，这仅会在下一次合并时发生。因此，可能在不确定的时间段内，数据并没有被实际从存储中删除，仅被标记为删除。

如果你需要确保你的数据在可预测的时间内从存储中删除，考虑使用表设置 [`min_age_to_force_merge_seconds`](/operations/settings/merge-tree-settings#min_age_to_force_merge_seconds)。或者你可以使用 [ALTER TABLE ... DELETE](/sql-reference/statements/alter/delete) 命令。请注意，使用 `ALTER TABLE ... DELETE` 删除数据可能会消耗大量资源，因为它会重新创建所有受影响的分区片段。

## 删除大量数据 {#deleting-large-amounts-of-data}

大量删除会对 ClickHouse 性能产生负面影响。如果你打算从一个表中删除所有行，考虑使用 [`TRUNCATE TABLE`](/sql-reference/statements/truncate) 命令。

如果你预期会频繁删除，考虑使用 [自定义分区键](/engines/table-engines/mergetree-family/custom-partitioning-key)。然后你可以使用 [`ALTER TABLE ... DROP PARTITION`](/sql-reference/statements/alter/partition#drop-partitionpart) 命令快速删除与该分区关联的所有行。

## 轻量级 `DELETE` 的限制 {#limitations-of-lightweight-delete}

### 带有投影的轻量级 `DELETE` {#lightweight-deletes-with-projections}

默认情况下，`DELETE` 对具有投影的表不起作用。这是因为投影中的行可能会受到 `DELETE` 操作的影响。但有一个 [MergeTree 设置](/operations/settings/merge-tree-settings) `lightweight_mutation_projection_mode` 可以更改此行为。

## 使用轻量级 `DELETE` 时的性能考虑 {#performance-considerations-when-using-lightweight-delete}

**使用轻量级 `DELETE` 语句删除大量数据可能会对 SELECT 查询性能产生负面影响。**

以下几点也可能对轻量级 `DELETE` 性能产生负面影响：

- `DELETE` 查询中的重条件。
- 如果突变队列中充满了许多其他突变，可能会导致性能问题，因为对一个表的所有突变是顺序执行的。
- 受影响的表具有非常多的数据分区。
- 过多的数据集中在紧凑分区中。在紧凑分区中，所有列都存储在一个文件中。

## 删除权限 {#delete-permissions}

`DELETE` 需要 `ALTER DELETE` 权限。要为特定用户在特定表上启用 `DELETE` 语句，请运行以下命令：

```sql
GRANT ALTER DELETE ON db.table to username;
```

## 轻量级 DELETE 在 ClickHouse 内部是如何工作的 {#how-lightweight-deletes-work-internally-in-clickhouse}

1. **应用“掩码”到受影响的行**

   当执行 `DELETE FROM table ...` 查询时，ClickHouse 保存一个掩码，其中每行被标记为“存在”或“已删除”。这些“已删除”的行会在后续查询中被省略。然而，这些行只有在后续合并时才会被实际移除。写入此掩码比执行 `ALTER TABLE ... DELETE` 查询要轻量得多。

   该掩码被实现为一个隐藏的 `_row_exists` 系统列，存储所有可见行的 `True` 和已删除行的 `False`。只有当分区中有一些行被删除时，该列才会存在。如果分区中的所有值都等于 `True`，则该列不存在。

2. **`SELECT` 查询被转换以包含掩码**

   当在查询中使用带掩码的列时，内部 `SELECT ... FROM table WHERE condition` 查询会通过 `_row_exists` 进行扩展，并转化为：
```sql
SELECT ... FROM table PREWHERE _row_exists WHERE condition
```
   在执行时，读取 `_row_exists` 列以确定哪些行不应返回。如果有很多已删除的行，ClickHouse 可以确定在读取其他列时可以完全跳过哪些颗粒。

3. **`DELETE` 查询被转换为 `ALTER TABLE ... UPDATE` 查询**

   `DELETE FROM table WHERE condition` 被翻译为 `ALTER TABLE table UPDATE _row_exists = 0 WHERE condition` 突变。

   内部，这个突变分两个步骤执行：

   1. 为每个单独的分区执行 `SELECT count() FROM table WHERE condition` 命令，以确定该分区是否受到影响。

   2. 根据上述命令，对受影响的分区进行突变，并为未受影响的分区创建硬链接。在宽分区的情况下，更新每行的 `_row_exists` 列，所有其他列的文件都被硬链接。对于紧凑分区，所有列都被重新写入，因为它们都存储在一个文件中。

   从上述步骤可以看出，使用掩码技术的轻量级 `DELETE` 相较于传统的 `ALTER TABLE ... DELETE` 提高了性能，因为它不必为受影响的分区重新写入所有列的文件。

## 相关内容 {#related-content}

- 博客: [在 ClickHouse 中处理更新和删除](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
