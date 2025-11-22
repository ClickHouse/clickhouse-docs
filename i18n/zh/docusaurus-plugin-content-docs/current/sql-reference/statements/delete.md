---
description: '轻量级删除简化了从数据库中删除数据的过程。'
keywords: ['delete']
sidebar_label: 'DELETE'
sidebar_position: 36
slug: /sql-reference/statements/delete
title: '轻量级 DELETE 语句'
doc_type: 'reference'
---

轻量级 `DELETE` 语句会从表 `[db.]table` 中删除满足表达式 `expr` 的行。它仅适用于 *MergeTree 表引擎系列。

```sql
DELETE FROM [db.]table [ON CLUSTER cluster] [IN PARTITION partition_expr] WHERE expr;
```

它之所以被称为“轻量级 `DELETE`”，是为了与 [ALTER TABLE ... DELETE](/sql-reference/statements/alter/delete) 命令区分开来，后者是一个重量级操作。


## 示例 {#examples}

```sql
-- 删除 `hits` 表中 `Title` 列包含文本 `hello` 的所有行
DELETE FROM hits WHERE Title LIKE '%hello%';
```


## 轻量级 `DELETE` 不会立即删除数据 {#lightweight-delete-does-not-delete-data-immediately}

轻量级 `DELETE` 以 [mutation](/sql-reference/statements/alter#mutations) 方式实现,它将行标记为已删除,但不会立即物理删除这些行。

默认情况下,`DELETE` 语句会等待行标记删除操作完成后才返回。如果数据量很大,这可能需要较长时间。或者,您可以使用 [`lightweight_deletes_sync`](/operations/settings/settings#lightweight_deletes_sync) 设置在后台异步执行该操作。如果禁用该设置,`DELETE` 语句将立即返回,但在后台 mutation 完成之前,查询仍然可以看到这些数据。

mutation 不会物理删除已标记为删除的行,只有在下一次合并时才会真正删除。因此,在一段不确定的时间内,数据实际上并未从存储中删除,仅被标记为已删除。

如果您需要保证数据在可预测的时间内从存储中删除,请考虑使用表设置 [`min_age_to_force_merge_seconds`](/operations/settings/merge-tree-settings#min_age_to_force_merge_seconds)。或者您可以使用 [ALTER TABLE ... DELETE](/sql-reference/statements/alter/delete) 命令。请注意,使用 `ALTER TABLE ... DELETE` 删除数据可能会消耗大量资源,因为它需要重建所有受影响的数据部分。


## 删除大量数据 {#deleting-large-amounts-of-data}

大量删除操作可能会对 ClickHouse 性能产生负面影响。如果您需要删除表中的所有行,建议使用 [`TRUNCATE TABLE`](/sql-reference/statements/truncate) 命令。

如果您预计需要频繁执行删除操作,建议使用[自定义分区键](/engines/table-engines/mergetree-family/custom-partitioning-key)。这样您就可以使用 [`ALTER TABLE ... DROP PARTITION`](/sql-reference/statements/alter/partition#drop-partitionpart) 命令快速删除该分区关联的所有行。


## 轻量级 `DELETE` 的限制 {#limitations-of-lightweight-delete}

### 使用投影时的轻量级 `DELETE` {#lightweight-deletes-with-projections}

默认情况下,`DELETE` 不支持包含投影的表。这是因为投影中的行可能会受到 `DELETE` 操作的影响。但是可以通过 [MergeTree 设置](/operations/settings/merge-tree-settings) `lightweight_mutation_projection_mode` 来更改此行为。


## 使用轻量级 `DELETE` 时的性能考虑 {#performance-considerations-when-using-lightweight-delete}

**使用轻量级 `DELETE` 语句删除大量数据可能会对 SELECT 查询性能产生负面影响。**

以下情况也可能对轻量级 `DELETE` 性能产生负面影响:

- `DELETE` 查询中包含复杂的 `WHERE` 条件。
- 如果变更队列中填充了许多其他变更操作,可能会导致性能问题,因为表上的所有变更操作都是按顺序执行的。
- 受影响的表具有大量数据分片。
- 紧凑分片中存在大量数据。在紧凑分片中,所有列都存储在一个文件中。


## 删除权限 {#delete-permissions}

`DELETE` 需要 `ALTER DELETE` 权限。要为指定用户启用特定表的 `DELETE` 语句,请运行以下命令:

```sql
GRANT ALTER DELETE ON db.table TO username;
```


## 轻量级 DELETE 在 ClickHouse 内部的工作原理 {#how-lightweight-deletes-work-internally-in-clickhouse}

1. **对受影响的行应用"掩码"**

   当执行 `DELETE FROM table ...` 查询时,ClickHouse 会保存一个掩码,其中每一行被标记为"存在"或"已删除"。这些"已删除"的行在后续查询中会被省略。然而,这些行实际上只会在后续的合并操作中被真正移除。写入此掩码比执行 `ALTER TABLE ... DELETE` 查询要轻量得多。

   该掩码实现为一个隐藏的 `_row_exists` 系统列,对所有可见行存储 `True`,对已删除行存储 `False`。只有当数据分片中的某些行被删除时,该列才会出现在该分片中。当数据分片的所有值都等于 `True` 时,该列不存在。

2. **`SELECT` 查询被转换以包含掩码**

   当查询中使用掩码列时,`SELECT ... FROM table WHERE condition` 查询在内部会通过 `_row_exists` 上的谓词进行扩展,并转换为:

   ```sql
   SELECT ... FROM table PREWHERE _row_exists WHERE condition
   ```

   在执行时,会读取 `_row_exists` 列以确定哪些行不应返回。如果存在大量已删除的行,ClickHouse 可以确定在读取其余列时可以完全跳过哪些颗粒。

3. **`DELETE` 查询被转换为 `ALTER TABLE ... UPDATE` 查询**

   `DELETE FROM table WHERE condition` 被转换为 `ALTER TABLE table UPDATE _row_exists = 0 WHERE condition` 变更操作。

   在内部,此变更操作分两步执行:
   1. 对每个单独的数据分片执行 `SELECT count() FROM table WHERE condition` 命令,以确定该分片是否受影响。

   2. 基于上述命令,受影响的数据分片会被变更,未受影响的数据分片则创建硬链接。对于宽格式分片,每行的 `_row_exists` 列会被更新,所有其他列的文件则创建硬链接。对于紧凑格式分片,所有列都会被重写,因为它们都存储在一个文件中。

   从上述步骤可以看出,使用掩码技术的轻量级 `DELETE` 相比传统的 `ALTER TABLE ... DELETE` 提升了性能,因为它不会重写受影响分片的所有列文件。


## 相关内容 {#related-content}

- 博客：[ClickHouse 中的更新和删除操作处理](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
