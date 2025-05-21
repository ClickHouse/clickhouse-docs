---
'description': '轻量级删除简化了从数据库中删除数据的过程。'
'keywords':
- 'delete'
'sidebar_label': '删除'
'sidebar_position': 36
'slug': '/sql-reference/statements/delete'
'title': '轻量级删除语句'
---



轻量级 `DELETE` 语句从表 `[db.]table` 中删除与表达式 `expr` 匹配的行。它只适用于 *MergeTree 表引擎家族。

```sql
DELETE FROM [db.]table [ON CLUSTER cluster] [IN PARTITION partition_expr] WHERE expr;
```

之所以称为“轻量级 `DELETE`”，是为了与 [ALTER TABLE ... DELETE](/sql-reference/statements/alter/delete) 命令区分，后者是一个重型操作。

## 示例 {#examples}

```sql
-- Deletes all rows from the `hits` table where the `Title` column contains the text `hello`
DELETE FROM hits WHERE Title LIKE '%hello%';
```

## 轻量级 `DELETE` 不会立即删除数据 {#lightweight-delete-does-not-delete-data-immediately}

轻量级 `DELETE` 实现为一个 [mutation](/sql-reference/statements/alter#mutations)，该 mutation 将行标记为已删除，但不会立即物理删除它们。

默认情况下，`DELETE` 语句会等待标记行已删除的过程完成后才返回。如果数据量较大，这可能需要很长时间。作为替代方案，您可以使用设置 [`lightweight_deletes_sync`](/operations/settings/settings#lightweight_deletes_sync) 在后台异步运行它。如果禁用，`DELETE` 语句将立即返回，但在后台 mutation 完成之前数据仍然可能对查询可见。

这个 mutation 并不会物理删除已标记为已删除的行，这将在下一次合并期间才会发生。因此，在不确定的时间段内，数据实际上并没有从存储中删除，只是被标记为已删除。

如果您需要保证数据在可预测的时间内从存储中删除，请考虑使用表设置 [`min_age_to_force_merge_seconds`](/operations/settings/merge-tree-settings#min_age_to_force_merge_seconds)。或者您可以使用 [ALTER TABLE ... DELETE](/sql-reference/statements/alter/delete) 命令。请注意，使用 `ALTER TABLE ... DELETE` 删除数据可能会消耗大量资源，因为它会重建所有受影响的分区片段。

## 删除大量数据 {#deleting-large-amounts-of-data}

大量删除操作可能会对 ClickHouse 性能产生负面影响。如果您试图从一个表中删除所有行，考虑使用 [`TRUNCATE TABLE`](/sql-reference/statements/truncate) 命令。

如果您预期会频繁执行删除操作，考虑使用 [自定义分区键](/engines/table-engines/mergetree-family/custom-partitioning-key)。然后，您可以使用 [`ALTER TABLE ... DROP PARTITION`](/sql-reference/statements/alter/partition#drop-partitionpart) 命令快速删除与该分区关联的所有行。

## 轻量级 `DELETE` 的限制 {#limitations-of-lightweight-delete}

### 与投影的轻量级 `DELETE` {#lightweight-deletes-with-projections}

默认情况下，`DELETE` 不适用于具有投影的表。这是因为投影中的行可能会受到 `DELETE` 操作的影响。但有一个 [MergeTree 设置](/operations/settings/merge-tree-settings) `lightweight_mutation_projection_mode` 可以改变这种行为。

## 使用轻量级 `DELETE` 时的性能考虑 {#performance-considerations-when-using-lightweight-delete}

**使用轻量级 `DELETE` 语句删除大容量数据可能会对 SELECT 查询性能产生负面影响。**

以下因素也可能会对轻量级 `DELETE` 性能产生负面影响：

- `DELETE` 查询中的重型 `WHERE` 条件。
- 如果 mutation 队列充满了许多其他 mutation，这可能会导致性能问题，因为所有与表相关的 mutation 都是按顺序执行的。
- 受影响的表具有非常大量的数据分区片段。
- 在紧凑的分区片段中有大量数据。紧凑分区片段中，所有列都存储在一个文件中。

## 删除权限 {#delete-permissions}

`DELETE` 需要 `ALTER DELETE` 权限。要为特定用户启用特定表上的 `DELETE` 语句，请运行以下命令：

```sql
GRANT ALTER DELETE ON db.table to username;
```

## 轻量级 DELETE 在 ClickHouse 中的内部工作原理 {#how-lightweight-deletes-work-internally-in-clickhouse}

1. **对受影响的行应用“掩码”**

   当执行 `DELETE FROM table ...` 查询时，ClickHouse 保存一个掩码，其中每行标记为“存在”或“已删除”。这些“已删除”的行在后续查询中被忽略。然而，行最终仅在后续合并中被删除。写入此掩码要比 `ALTER TABLE ... DELETE` 查询的执行轻量得多。

   该掩码实现为一个隐藏的 `_row_exists` 系统列，对于所有可见行存储 `True`，对于已删除的行存储 `False`。仅当该分区片段中的某些行被删除时，该列才存在。如果一个分区片段的所有值均为 `True`，则该列不存在。

2. **`SELECT` 查询将转换为包括掩码**

   当在查询中使用掩码列时，`SELECT ... FROM table WHERE condition` 查询在内部通过对 `_row_exists` 的谓词扩展而转换为：
```sql
   SELECT ... FROM table PREWHERE _row_exists WHERE condition
```
   在执行时，将读取列 `_row_exists` 以确定不应该返回哪些行。如果有许多已删除的行，ClickHouse 可以确定在读取其余列时可以完全跳过哪些粒度。

3. **`DELETE` 查询转化为 `ALTER TABLE ... UPDATE` 查询**

   `DELETE FROM table WHERE condition` 被转换为 `ALTER TABLE table UPDATE _row_exists = 0 WHERE condition` 的 mutation。

   从内部来看，此 mutation 分两步执行：

   1. 对每个单独的分区片段执行 `SELECT count() FROM table WHERE condition` 命令，以确定该分区片段是否受到影响。

   2. 根据上述命令，对受影响的分区片段进行 mutation，并为未受影响的分区片段创建硬链接。在宽分区片段的情况下，更新每一行的 `_row_exists` 列，而所有其他列的文件则进行硬链接。对于紧凑分区片段，所有列会被重写，因为它们都存储在一个文件中。

   从上述步骤中，我们可以看到，使用掩码技术的轻量级 `DELETE` 比传统的 `ALTER TABLE ... DELETE` 提高了性能，因为它不会重写受影响分区片段的所有列文件。

## 相关内容 {#related-content}

- 博客: [在 ClickHouse 中处理更新和删除](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
