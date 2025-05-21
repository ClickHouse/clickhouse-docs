---
'description': '分区文档'
'sidebar_label': '分区'
'sidebar_position': 38
'slug': '/sql-reference/statements/alter/partition'
'title': '操作分区和分区片段'
---



以下是与 [分区](/engines/table-engines/mergetree-family/custom-partitioning-key.md) 相关的操作：

- [DETACH PARTITION\|PART](#detach-partitionpart) — 将分区或部分移动到 `detached` 目录并忘记它。
- [DROP PARTITION\|PART](#drop-partitionpart) — 删除一个分区或部分。
- [DROP DETACHED PARTITION\|PART](#drop-detached-partitionpart) - 从 `detached` 删除一个部分或某个分区的所有部分。
- [FORGET PARTITION](#forget-partition) — 如果分区是空的，则从 zookeeper 中删除该分区的元数据。
- [ATTACH PARTITION\|PART](#attach-partitionpart) — 从 `detached` 目录将分区或部分添加到表中。
- [ATTACH PARTITION FROM](#attach-partition-from) — 从一个表复制数据分区到另一个表并添加。
- [REPLACE PARTITION](#replace-partition) — 从一个表复制数据分区到另一个表并替换。
- [MOVE PARTITION TO TABLE](#move-partition-to-table) — 将数据分区从一个表移动到另一个表。
- [CLEAR COLUMN IN PARTITION](#clear-column-in-partition) — 重置分区中特定列的值。
- [CLEAR INDEX IN PARTITION](#clear-index-in-partition) — 重置分区中特定的次级索引。
- [FREEZE PARTITION](#freeze-partition) — 创建分区的备份。
- [UNFREEZE PARTITION](#unfreeze-partition) — 删除分区的备份。
- [FETCH PARTITION\|PART](#fetch-partitionpart) — 从另一个服务器下载一个部分或分区。
- [MOVE PARTITION\|PART](#move-partitionpart) — 将分区/数据部分移动到另一个磁盘或卷。
- [UPDATE IN PARTITION](#update-in-partition) — 按条件更新分区中的数据。
- [DELETE IN PARTITION](#delete-in-partition) — 按条件删除分区中的数据。

<!-- -->

## DETACH PARTITION\|PART {#detach-partitionpart}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] DETACH PARTITION|PART partition_expr
```

将指定分区的所有数据移动到 `detached` 目录。服务器就像忘记了该分区的数据那样，不再知道此分区。服务器在执行 [ATTACH](#attach-partitionpart) 查询之前将不会知道此数据。

示例：

```sql
ALTER TABLE mt DETACH PARTITION '2020-11-21';
ALTER TABLE mt DETACH PART 'all_2_2_0';
```

请阅读关于设置分区表达式的章节 [如何设置分区表达式](#how-to-set-partition-expression)。

查询执行后，您可以对 `detached` 目录中的数据进行任何操作 — 从文件系统中删除它，或者只是保留它。

该查询是复制的 - 它将数据移动到所有副本的 `detached` 目录。请注意，您只能在主副本上执行此查询。要检查副本是否为主副本，可以对 [system.replicas](/operations/system-tables/replicas) 表执行 `SELECT` 查询。或者，您可以在所有副本上发出一个 `DETACH` 查询 - 所有副本都会引发异常，除了主副本（因为允许多个主副本）。

## DROP PARTITION\|PART {#drop-partitionpart}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] DROP PARTITION|PART partition_expr
```

从表中删除指定的分区。此查询将分区标记为非活动，并大约在 10 分钟内完全删除数据。

请阅读关于设置分区表达式的章节 [如何设置分区表达式](#how-to-set-partition-expression)。

该查询是复制的 - 它会在所有副本上删除数据。

示例：

```sql
ALTER TABLE mt DROP PARTITION '2020-11-21';
ALTER TABLE mt DROP PART 'all_4_4_0';
```

## DROP DETACHED PARTITION\|PART {#drop-detached-partitionpart}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] DROP DETACHED PARTITION|PART ALL|partition_expr
```

从 `detached` 中移除指定的部分或指定分区的所有部分。
有关设置分区表达式的更多信息，请阅读章节 [如何设置分区表达式](#how-to-set-partition-expression)。

## FORGET PARTITION {#forget-partition}

```sql
ALTER TABLE table_name FORGET PARTITION partition_expr
```

从 ZooKeeper 中移除关于空分区的所有元数据。如果分区不是空的或者无法识别，则查询失败。确保只对不会再使用的分区执行此操作。

请阅读关于设置分区表达式的章节 [如何设置分区表达式](#how-to-set-partition-expression)。

示例：

```sql
ALTER TABLE mt FORGET PARTITION '20201121';
```

## ATTACH PARTITION\|PART {#attach-partitionpart}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] ATTACH PARTITION|PART partition_expr
```

从 `detached` 目录向表中添加数据。可以为整个分区或某个独立部分添加数据。示例：

```sql
ALTER TABLE visits ATTACH PARTITION 201901;
ALTER TABLE visits ATTACH PART 201901_2_2_0;
```

请阅读关于设置分区表达式的章节 [如何设置分区表达式](#how-to-set-partition-expression)。

此查询是复制的。副本发起者会检查 `detached` 目录中是否有数据。 
如果存在数据，查询会检查其完整性。如果一切正确，查询将数据添加到表中。

如果非发起副本在接收到附加命令时在自己的 `detached` 文件夹中找到了具有正确校验和的部分，副本将直接附加数据，而无需从其他副本提取数据。
如果没有具有正确校验和的部分，数据将从任何具有该部分的副本下载。

您可以在一个副本中将数据放入 `detached` 目录，并使用 `ALTER ... ATTACH` 查询将其添加到所有副本的表中。

## ATTACH PARTITION FROM {#attach-partition-from}

```sql
ALTER TABLE table2 [ON CLUSTER cluster] ATTACH PARTITION partition_expr FROM table1
```

此查询将数据分区从 `table1` 复制到 `table2`。

请注意：

- 数据不会从 `table1` 或 `table2` 删除。
- `table1` 可能是一个临时表。

为了使查询成功运行，必须满足以下条件：

- 两个表必须具有相同的结构。
- 两个表必须具有相同的分区键、相同的排序键和相同的主键。
- 两个表必须具有相同的存储策略。
- 目标表必须包含源表中的所有索引和投影。如果目标表中启用了 `enforce_index_structure_match_on_partition_manipulation` 设置，则索引和投影必须完全一致。否则，目标表可以包含源表的索引和投影的超集。

## REPLACE PARTITION {#replace-partition}

```sql
ALTER TABLE table2 [ON CLUSTER cluster] REPLACE PARTITION partition_expr FROM table1
```

此查询将数据分区从 `table1` 复制到 `table2` 并替换 `table2` 中的现有分区。此操作是原子的。

请注意：

- 数据不会从 `table1` 删除。
- `table1` 可能是一个临时表。

为了使查询成功运行，必须满足以下条件：

- 两个表必须具有相同的结构。
- 两个表必须具有相同的分区键、相同的排序键和相同的主键。
- 两个表必须具有相同的存储策略。
- 目标表必须包含源表中的所有索引和投影。如果目标表中启用了 `enforce_index_structure_match_on_partition_manipulation` 设置，则索引和投影必须完全一致。否则，目标表可以包含源表的索引和投影的超集。

## MOVE PARTITION TO TABLE {#move-partition-to-table}

```sql
ALTER TABLE table_source [ON CLUSTER cluster] MOVE PARTITION partition_expr TO TABLE table_dest
```

此查询将数据分区从 `table_source` 移动到 `table_dest`，同时从 `table_source` 中删除数据。

为了使查询成功运行，必须满足以下条件：

- 两个表必须具有相同的结构。
- 两个表必须具有相同的分区键、相同的排序键和相同的主键。
- 两个表必须具有相同的存储策略。
- 两个表必须属于相同的引擎家族（复制或非复制）。
- 目标表必须包括源表中的所有索引和投影。如果目标表中启用了 `enforce_index_structure_match_on_partition_manipulation` 设置，则索引和投影必须完全一致。否则，目标表可以包含源表的索引和投影的超集。

## CLEAR COLUMN IN PARTITION {#clear-column-in-partition}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] CLEAR COLUMN column_name IN PARTITION partition_expr
```

重置分区中特定列的所有值。如果在创建表时确定了 `DEFAULT` 子句，则该查询将列值设置为指定的默认值。

示例：

```sql
ALTER TABLE visits CLEAR COLUMN hour in PARTITION 201902
```

## FREEZE PARTITION {#freeze-partition}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] FREEZE [PARTITION partition_expr] [WITH NAME 'backup_name']
```

此查询创建指定分区的本地备份。如果省略 `PARTITION` 子句，则该查询一次创建所有分区的备份。

:::note
整个备份过程在不停止服务器的情况下进行。
:::

请注意，对于旧式表，您可以指定分区名称的前缀（例如，`2019`） - 然后查询会为所有相应的分区创建备份。请阅读关于设置分区表达式的章节 [如何设置分区表达式](#how-to-set-partition-expression)。

在执行时，对于数据快照，该查询创建指向表数据的硬链接。硬链接放置在目录 `/var/lib/clickhouse/shadow/N/...` 中，其中：

- `/var/lib/clickhouse/` 是在配置中指定的工作 ClickHouse 目录。
- `N` 是备份的递增编号。
- 如果指定了 `WITH NAME` 参数，则使用 `'backup_name'` 参数的值代替递增编号。

:::note
如果您使用 [一组磁盘来存储表中的数据](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-multiple-volumes)，则 `shadow/N` 目录会出现在每个磁盘上，存储与 `PARTITION` 表达式匹配的数据部分。
:::

备份内部创建的目录结构与 `/var/lib/clickhouse/` 内部相同。查询会对所有文件执行 `chmod` 命令，以禁止写入。

创建备份后，您可以从 `/var/lib/clickhouse/shadow/` 复制数据到远程服务器，然后从本地服务器中删除它。请注意，`ALTER t FREEZE PARTITION` 查询不是复制的。它仅在本地服务器上创建本地备份。

该查询几乎瞬间创建备份（但首先它会等待对相应表的当前查询完成）。

`ALTER TABLE t FREEZE PARTITION` 仅复制数据，而不复制表的元数据。若要备份表元数据，请复制文件 `/var/lib/clickhouse/metadata/database/table.sql`。

要从备份恢复数据，请执行以下操作：

1. 如果表不存在，则创建表。要查看查询，请使用 .sql 文件（将其中的 `ATTACH` 替换为 `CREATE`）。
2. 从备份中的 `data/database/table/` 目录将数据复制到 `/var/lib/clickhouse/data/database/table/detached/` 目录。
3. 运行 `ALTER TABLE t ATTACH PARTITION` 查询将数据添加到表中。

从备份恢复不需要停止服务器。

有关备份和数据恢复的更多信息，请参见 [数据备份](/operations/backup.md) 章节。

## UNFREEZE PARTITION {#unfreeze-partition}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] UNFREEZE [PARTITION 'part_expr'] WITH NAME 'backup_name'
```

从磁盘中删除具有指定名称的 `frozen` 分区。如果省略 `PARTITION` 子句，则查询一次删除所有分区的备份。

## CLEAR INDEX IN PARTITION {#clear-index-in-partition}

该查询的工作方式类似于 `CLEAR COLUMN`，但它会重置一个索引而不是列数据。

## FETCH PARTITION|PART {#fetch-partitionpart}

从另一服务器下载一个分区。该查询仅适用于复制表。

该查询执行以下操作：

1. 从指定分片下载分区|部分。在 'path-in-zookeeper' 中，必须指定 ZooKeeper 中分片的路径。
2. 然后将下载的数据放置到 `table_name` 表的 `detached` 目录中。使用 [ATTACH PARTITION\|PART](#attach-partitionpart) 查询将数据添加到表中。

例如：

1. FETCH PARTITION
```sql
ALTER TABLE users FETCH PARTITION 201902 FROM '/clickhouse/tables/01-01/visits';
ALTER TABLE users ATTACH PARTITION 201902;
```
2. FETCH PART
```sql
ALTER TABLE users FETCH PART 201901_2_2_0 FROM '/clickhouse/tables/01-01/visits';
ALTER TABLE users ATTACH PART 201901_2_2_0;
```

请注意：

- `ALTER ... FETCH PARTITION|PART` 查询不是复制的。它仅将部分或分区放置到本地服务器上的 `detached` 目录中。
- `ALTER TABLE ... ATTACH` 查询是复制的。它将数据添加到所有副本。数据从 `detached` 目录中的一个副本添加到其他副本 - 从周边副本。

在下载之前，系统会检查分区是否存在以及表结构是否匹配。最合适的副本会自动从健康的副本中选择。

虽然查询称为 `ALTER TABLE`，但它不会改变表结构，也不会立即改变表中可用的数据。

## MOVE PARTITION\|PART {#move-partitionpart}

将分区或数据部分移动到 `MergeTree` 引擎表的另一个卷或磁盘。请参见 [使用多块设备进行数据存储](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-multiple-volumes)。

```sql
ALTER TABLE table_name [ON CLUSTER cluster] MOVE PARTITION|PART partition_expr TO DISK|VOLUME 'disk_name'
```

`ALTER TABLE t MOVE` 查询：

- 不复制，因为不同的副本可能具有不同的存储策略。
- 如果指定的磁盘或卷没有配置，则返回错误。如果数据移动条件（即存储策略中的条件）无法应用，则查询也会返回错误。
- 在数据已经被后台进程、并发的 `ALTER TABLE t MOVE` 查询或后台数据合并的情况下，可能会返回错误。在这种情况下，用户不应再执行任何附加操作。

示例：

```sql
ALTER TABLE hits MOVE PART '20190301_14343_16206_438' TO VOLUME 'slow'
ALTER TABLE hits MOVE PARTITION '2019-09-01' TO DISK 'fast_ssd'
```

## UPDATE IN PARTITION {#update-in-partition}

在指定分区中操作与指定过滤表达式匹配的数据。实现为 [mutation](/sql-reference/statements/alter/index.md#mutations)。

语法：

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] UPDATE column1 = expr1 [, ...] [IN PARTITION partition_expr] WHERE filter_expr
```

### 示例 {#example}

```sql
-- using partition name
ALTER TABLE mt UPDATE x = x + 1 IN PARTITION 2 WHERE p = 2;

-- using partition id
ALTER TABLE mt UPDATE x = x + 1 IN PARTITION ID '2' WHERE p = 2;
```

### 另请参见 {#see-also}

- [UPDATE](/sql-reference/statements/alter/partition#update-in-partition)

## DELETE IN PARTITION {#delete-in-partition}

删除在指定分区内匹配指定过滤表达式的数据。实现为 [mutation](/sql-reference/statements/alter/index.md#mutations)。

语法：

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] DELETE [IN PARTITION partition_expr] WHERE filter_expr
```

### 示例 {#example-1}

```sql
-- using partition name
ALTER TABLE mt DELETE IN PARTITION 2 WHERE p = 2;

-- using partition id
ALTER TABLE mt DELETE IN PARTITION ID '2' WHERE p = 2;
```

### 另请参见 {#see-also-1}

- [DELETE](/sql-reference/statements/alter/delete)

## 如何设置分区表达式 {#how-to-set-partition-expression}

您可以以不同的方式在 `ALTER ... PARTITION` 查询中指定分区表达式：

- 作为来自 `system.parts` 表的 `partition` 列的值。例如，`ALTER TABLE visits DETACH PARTITION 201901`。
- 使用关键字 `ALL`。它只可以与 DROP/DETACH/ATTACH/ATTACH FROM 一起使用。例如，`ALTER TABLE visits ATTACH PARTITION ALL`。
- 作为与表分区键元组匹配的表达式或常量元组。在单元素分区键的情况下，表达式应包装在 `tuple (...)` 函数中。例如，`ALTER TABLE visits DETACH PARTITION tuple(toYYYYMM(toDate('2019-01-25')))`.
- 使用分区 ID。分区 ID 是分区的字符串标识符（人类可读，如果可能的话），用于文件系统和 ZooKeeper 中的分区名称。分区 ID 必须在 `PARTITION ID` 子句中指定，需加单引号。例如，`ALTER TABLE visits DETACH PARTITION ID '201901'`。
- 在 [ALTER ATTACH PART](#attach-partitionpart) 和 [DROP DETACHED PART](#drop-detached-partitionpart) 查询中，要指定部分的名称，使用来自 [system.detached_parts](/operations/system-tables/detached_parts) 表的 `name` 列中的字符串字面值。例如，`ALTER TABLE visits ATTACH PART '201901_1_1_0'`。

指定分区时使用引号取决于分区表达式的类型。例如，对于 `String` 类型，您必须在引号中指定其名称（`'`）。对于 `Date` 和 `Int*` 类型则不需要引号。

上述所有规则也适用于 [OPTIMIZE](/sql-reference/statements/optimize.md) 查询。如果您需要在优化未分区表时指定唯一分区，设置表达式 `PARTITION tuple()`。例如：

```sql
OPTIMIZE TABLE table_not_partitioned PARTITION tuple() FINAL;
```

`IN PARTITION` 指定要将 [UPDATE](/sql-reference/statements/alter/update) 或 [DELETE](/sql-reference/statements/alter/delete) 表达式应用于的分区，作为 `ALTER TABLE` 查询的结果。新部分仅从指定分区创建。通过这种方式，`IN PARTITION` 有助于减少负载在表被划分为多个分区时，而您只需要逐点更新数据。

`ALTER ... PARTITION` 查询的示例在 [`00502_custom_partitioning_local`](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/00502_custom_partitioning_local.sql) 和 [`00502_custom_partitioning_replicated_zookeeper`](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/00502_custom_partitioning_replicated_zookeeper.sql) 测试中进行了演示。
