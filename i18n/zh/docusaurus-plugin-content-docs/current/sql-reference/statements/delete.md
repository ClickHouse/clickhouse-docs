轻量级 `DELETE` 语句从表 `[db.]table` 中移除匹配表达式 `expr` 的行。它仅适用于 *MergeTree 表引擎家族。

```sql
DELETE FROM [db.]table [ON CLUSTER cluster] [IN PARTITION partition_expr] WHERE expr;
```

之所以称其为“轻量级 `DELETE`”，是为了与 [ALTER TABLE ... DELETE](/sql-reference/statements/alter/delete) 命令区分，后者是一个重量级的过程。

## 示例 {#examples}

```sql
-- Deletes all rows from the `hits` table where the `Title` column contains the text `hello`
DELETE FROM hits WHERE Title LIKE '%hello%';
```

## 轻量级 `DELETE` 不会立即删除数据 {#lightweight-delete-does-not-delete-data-immediately}

轻量级 `DELETE` 实现为一个 [mutation](/sql-reference/statements/alter#mutations)，该 mutation 将行标记为已删除，但不会立即物理删除它们。

默认情况下，`DELETE` 语句会在标记行已删除完成后再返回。如果数据量很大，这可能会花费很长时间。或者，您可以通过设置 [`lightweight_deletes_sync`](/operations/settings/settings#lightweight_deletes_sync) 来异步在后台运行。如果禁用，`DELETE` 语句将立即返回，但在后台 mutation 完成之前，数据仍然可能对查询可见。

该 mutation 并未物理删除已标记为删除的行，只有在下一次合并时才会发生。因此，在未指定的时间内，数据可能并不会实际从存储中删除，而仅仅被标记为已删除。

如果您需要保证数据在可预测的时间内从存储中删除，请考虑使用表设置 [`min_age_to_force_merge_seconds`](/operations/settings/merge-tree-settings#min_age_to_force_merge_seconds)。或者，您可以使用 [ALTER TABLE ... DELETE](/sql-reference/statements/alter/delete) 命令。请注意，使用 `ALTER TABLE ... DELETE` 删除数据可能会消耗大量资源，因为它会重新创建所有受影响的部分。

## 删除大量数据 {#deleting-large-amounts-of-data}

大规模删除可能会对 ClickHouse 性能产生负面影响。如果您试图从表中删除所有行，请考虑使用 [`TRUNCATE TABLE`](/sql-reference/statements/truncate) 命令。

如果您预计会频繁删除，请考虑使用 [自定义分区键](/engines/table-engines/mergetree-family/custom-partitioning-key)。您可以使用 [`ALTER TABLE ... DROP PARTITION`](/sql-reference/statements/alter/partition#drop-partitionpart) 命令快速删除与该分区关联的所有行。

## 轻量级 `DELETE` 的限制 {#limitations-of-lightweight-delete}

### 带有投影的轻量级 `DELETE` {#lightweight-deletes-with-projections}

默认情况下，`DELETE` 不适用于具有投影的表。这是因为投影中的行可能会受到 `DELETE` 操作的影响。但有一个 [MergeTree 设置](/operations/settings/merge-tree-settings) `lightweight_mutation_projection_mode` 可以改变这种行为。

## 使用轻量级 `DELETE` 时的性能考虑 {#performance-considerations-when-using-lightweight-delete}

**使用轻量级 `DELETE` 语句删除大量数据可能会对 SELECT 查询性能产生负面影响。**

以下因素也可能对轻量级 `DELETE` 性能产生负面影响：

- `DELETE` 查询中的重型 `WHERE` 条件。
- 如果变更队列中有许多其他变更，这可能导致性能问题，因为表上的所有变更都是串行执行的。
- 受影响的表具有非常大的数据部分。
- 在紧凑部分中有大量数据。在紧凑部分中，所有列都存储在一个文件中。

## 删除权限 {#delete-permissions}

`DELETE` 需要 `ALTER DELETE` 权限。要为特定用户启用特定表的 `DELETE` 语句，请运行以下命令：

```sql
GRANT ALTER DELETE ON db.table to username;
```

## 轻量级 DELETE 在 ClickHouse 中的内部工作原理 {#how-lightweight-deletes-work-internally-in-clickhouse}

1. **对受影响的行应用“标记”**

   当执行 `DELETE FROM table ...` 查询时，ClickHouse 保存一个标记，其中每行被标记为“存在”或“已删除”。这些“已删除”的行将被省略以供后续查询使用。然而，实际的行只有在随后合并时才会被移除。写入这个标记要比 `ALTER TABLE ... DELETE` 查询的操作轻得多。

   该标记实现为一个隐藏的 `_row_exists` 系统列，所有可见行存储 `True`，而已删除行存储 `False`。只有在某些行被删除的情况下，该列才会出现在某个部分中。当某个部分的所有值都等于 `True` 时，该列不存在。

2. **`SELECT` 查询被转换以包含标记**

   当在查询中使用标记列时，`SELECT ... FROM table WHERE condition` 查询在内部会通过对 `_row_exists` 的谓词进行扩展并转换为：
```sql
SELECT ... FROM table PREWHERE _row_exists WHERE condition
```
   在执行时，读取 `_row_exists` 列以确定哪些行不应返回。如果有很多已删除行，ClickHouse 可以确定在读取其余列时可以完全跳过哪些粒度。

3. **`DELETE` 查询转换为 `ALTER TABLE ... UPDATE` 查询**

   `DELETE FROM table WHERE condition` 被翻译为 `ALTER TABLE table UPDATE _row_exists = 0 WHERE condition` 变更。

   在内部，该变更执行分为两个步骤：

   1. 对每个单独的部分执行 `SELECT count() FROM table WHERE condition` 命令，以确定该部分是否受到影响。

   2. 根据上述命令，对受影响的部分进行变更，并为未受影响的部分创建硬链接。在宽部分的情况下，为每行更新 `_row_exists` 列，所有其他列的文件则被硬链接。在紧凑部分中，由于所有列都一起存储在一个文件中，因此所有列都进行重写。

   从上述步骤可以看出，使用标记技术的轻量级 `DELETE` 在性能上优于传统的 `ALTER TABLE ... DELETE`，因为它不会为受影响部分重写所有列的文件。

## 相关内容 {#related-content}

- 博客: [在 ClickHouse 中处理更新和删除](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
