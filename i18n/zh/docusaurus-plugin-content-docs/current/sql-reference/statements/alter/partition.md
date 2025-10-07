---
'description': 'Partition 的文档'
'sidebar_label': 'PARTITION'
'sidebar_position': 38
'slug': '/sql-reference/statements/alter/partition'
'title': '操作分区和分区片段'
'doc_type': 'reference'
---

以下关于 [partitions](/engines/table-engines/mergetree-family/custom-partitioning-key.md) 的操作可用：

- [DETACH PARTITION\|PART](#detach-partitionpart) — 将一个分区或部分移动到 `detached` 目录并忘记它。
- [DROP PARTITION\|PART](#drop-partitionpart) — 删除一个分区或部分。
- [DROP DETACHED PARTITION\|PART](#drop-detached-partitionpart) - 从 `detached` 删除一个部分或所有分区的部分。
- [FORGET PARTITION](#forget-partition) — 如果分区为空，则从 zookeeper 中删除分区元数据。
- [ATTACH PARTITION\|PART](#attach-partitionpart) — 从 `detached` 目录向表中添加一个分区或部分。
- [ATTACH PARTITION FROM](#attach-partition-from) — 将一个表的数据分区复制到另一个表并添加。
- [REPLACE PARTITION](#replace-partition) — 将一个表的数据分区复制到另一个表并替换。
- [MOVE PARTITION TO TABLE](#move-partition-to-table) — 将一个表的数据分区移动到另一个表。
- [CLEAR COLUMN IN PARTITION](#clear-column-in-partition) — 重置分区中指定列的值。
- [CLEAR INDEX IN PARTITION](#clear-index-in-partition) — 重置分区中指定的二级索引。
- [FREEZE PARTITION](#freeze-partition) — 创建一个分区的备份。
- [UNFREEZE PARTITION](#unfreeze-partition) — 删除分区的备份。
- [FETCH PARTITION\|PART](#fetch-partitionpart) — 从另一台服务器下载一个部分或分区。
- [MOVE PARTITION\|PART](#move-partitionpart) — 将分区/数据部分移动到另一个磁盘或卷。
- [UPDATE IN PARTITION](#update-in-partition) — 通过条件更新分区内的数据。
- [DELETE IN PARTITION](#delete-in-partition) — 通过条件删除分区内的数据。
- [REWRITE PARTS](#rewrite-parts) — 完全重写表中的部分（或特定分区）。

<!-- -->

## DETACH PARTITION\|PART {#detach-partitionpart}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] DETACH PARTITION|PART partition_expr
```

将指定分区的所有数据移动到 `detached` 目录。服务器忘记了已分离的数据分区，仿佛它不存在。直到您执行 [ATTACH](#attach-partitionpart) 查询，服务器才会知道这些数据。

示例：

```sql
ALTER TABLE mt DETACH PARTITION '2020-11-21';
ALTER TABLE mt DETACH PART 'all_2_2_0';
```

阅读关于在 [如何设置分区表达式](#how-to-set-partition-expression) 一节中的分区表达式设置。

在查询执行后，您可以随意处理 `detached` 目录中的数据——从文件系统中删除它，或只是留下它。

此查询是复制的——它将数据移动到所有副本的 `detached` 目录。请注意，您只能在一个主副本上执行此查询。要找出某个副本是否是主副本，请对 [system.replicas](/operations/system-tables/replicas) 表执行 `SELECT` 查询。或者，更简单地可以在所有副本上执行 `DETACH` 查询——所有副本都会抛出异常，除了主副本（因为允许多个主副本）。

## DROP PARTITION\|PART {#drop-partitionpart}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] DROP PARTITION|PART partition_expr
```

从表中删除指定的分区。此查询将分区标记为非活动状态并完全删除数据，约需10分钟。

阅读关于在 [如何设置分区表达式](#how-to-set-partition-expression) 一节中的分区表达式设置。

此查询是复制的——它在所有副本上删除数据。

示例：

```sql
ALTER TABLE mt DROP PARTITION '2020-11-21';
ALTER TABLE mt DROP PART 'all_4_4_0';
```

## DROP DETACHED PARTITION\|PART {#drop-detached-partitionpart}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] DROP DETACHED PARTITION|PART ALL|partition_expr
```

从 `detached` 中删除指定的部分或所有指定分区的部分。
阅读更多关于在 [如何设置分区表达式](#how-to-set-partition-expression) 中的分区表达式设置。

## FORGET PARTITION {#forget-partition}

```sql
ALTER TABLE table_name FORGET PARTITION partition_expr
```

从 ZooKeeper 中删除关于空分区的所有元数据。如果分区不为空或未知，查询将失败。请确保仅对将来不会再使用的分区执行此操作。

阅读关于在 [如何设置分区表达式](#how-to-set-partition-expression) 一节中的分区表达式设置。

示例：

```sql
ALTER TABLE mt FORGET PARTITION '20201121';
```

## ATTACH PARTITION\|PART {#attach-partitionpart}

```sql
ALTER TABLE table_name ATTACH PARTITION|PART partition_expr
```

从 `detached` 目录向表中添加数据。可以为整个分区或单个部分添加数据。示例：

```sql
ALTER TABLE visits ATTACH PARTITION 201901;
ALTER TABLE visits ATTACH PART 201901_2_2_0;
```

阅读更多关于在 [如何设置分区表达式](#how-to-set-partition-expression) 一节中的分区表达式设置。

此查询是复制的。启动副本检查 `detached` 目录中是否有数据。
如果存在数据，查询将检查其完整性。如果所有内容都是正确的，查询将数据添加到表中。

如果非启动副本在接收到附加命令时，在其自己的 `detached` 文件夹中找到具有正确校验和的部分，它将无需从其他副本获取数据而直接附加该数据。
如果没有具有正确校验和的部分，则数据将从任何具有该部分的副本下载。

您可以在一个副本的 `detached` 目录中放置数据，并使用 `ALTER ... ATTACH` 查询将其添加到所有副本的表中。

## ATTACH PARTITION FROM {#attach-partition-from}

```sql
ALTER TABLE table2 [ON CLUSTER cluster] ATTACH PARTITION partition_expr FROM table1
```

此查询将 `table1` 的数据分区复制到 `table2`。

请注意：

- 数据不会从 `table1` 或 `table2` 中删除。
- `table1` 可以是临时表。

要确保查询成功执行，必须满足以下条件：

- 两个表结构必须相同。
- 两个表必须具有相同的分区键、相同的排序键和相同的主键。
- 两个表必须具有相同的存储策略。
- 目标表必须包含源表的所有索引和投影。如果目标表中启用了 `enforce_index_structure_match_on_partition_manipulation` 设置，则索引和投影必须完全相同。否则，目标表可以包含源表的索引和投影的超集。

## REPLACE PARTITION {#replace-partition}

```sql
ALTER TABLE table2 [ON CLUSTER cluster] REPLACE PARTITION partition_expr FROM table1
```

此查询将 `table1` 的数据分区复制到 `table2`，并替换 `table2` 中的现有分区。此操作是原子的。

请注意：

- 数据不会从 `table1` 中删除。
- `table1` 可以是临时表。

要确保查询成功执行，必须满足以下条件：

- 两个表结构必须相同。
- 两个表必须具有相同的分区键、相同的排序键和相同的主键。
- 两个表必须具有相同的存储策略。
- 目标表必须包含源表的所有索引和投影。如果目标表中启用了 `enforce_index_structure_match_on_partition_manipulation` 设置，则索引和投影必须完全相同。否则，目标表可以包含源表的索引和投影的超集。

## MOVE PARTITION TO TABLE {#move-partition-to-table}

```sql
ALTER TABLE table_source [ON CLUSTER cluster] MOVE PARTITION partition_expr TO TABLE table_dest
```

此查询将数据分区从 `table_source` 移动到 `table_dest`，同时删除 `table_source` 中的数据。

要确保查询成功执行，必须满足以下条件：

- 两个表结构必须相同。
- 两个表必须具有相同的分区键、相同的排序键和相同的主键。
- 两个表必须具有相同的存储策略。
- 两个表必须属于相同的引擎系列（复制的或非复制的）。
- 目标表必须包含源表的所有索引和投影。如果目标表中启用了 `enforce_index_structure_match_on_partition_manipulation` 设置，则索引和投影必须完全相同。否则，目标表可以包含源表的索引和投影的超集。

## CLEAR COLUMN IN PARTITION {#clear-column-in-partition}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] CLEAR COLUMN column_name IN PARTITION partition_expr
```

重置分区中指定列的所有值。如果在创建表时确定了 `DEFAULT` 子句，此查询将列的值设置为指定的默认值。

示例：

```sql
ALTER TABLE visits CLEAR COLUMN hour in PARTITION 201902
```

## FREEZE PARTITION {#freeze-partition}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] FREEZE [PARTITION partition_expr] [WITH NAME 'backup_name']
```

此查询创建指定分区的本地备份。如果省略 `PARTITION` 子句，则查询一次性创建所有分区的备份。

:::note
整个备份过程在不停止服务器的情况下进行。
:::

请注意，对于旧风格的表，您可以指定分区名称的前缀（例如 `2019`）—这样查询将为所有对应的分区创建备份。阅读关于在 [如何设置分区表达式](#how-to-set-partition-expression) 中的分区表达式设置。

在执行时，对于数据快照，该查询会生成表数据的硬链接。硬链接置于 `/var/lib/clickhouse/shadow/N/...` 目录，其中：

- `/var/lib/clickhouse/` 是配置中指定的工作 ClickHouse 目录。
- `N` 是备份的增量编号。
- 如果指定了 `WITH NAME` 参数，则将使用 `'backup_name'` 参数的值，而不是增量编号。

:::note
如果您使用 [一组磁盘进行数据存储](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-multiple-volumes)，则在每个磁盘上都会出现 `shadow/N` 目录，存储与 `PARTITION` 表达式匹配的数据部分。
:::

查询内部创建的目录结构与 `/var/lib/clickhouse/` 中的相同。查询会对所有文件执行 `chmod`，禁止写入。

创建备份后，您可以从 `/var/lib/clickhouse/shadow/` 复制数据到远程服务器，然后从本地服务器中删除它。请注意，`ALTER t FREEZE PARTITION` 查询不进行复制。它仅在本地服务器上创建本地备份。

该查询几乎是瞬时创建的（但首先它会等待当前对相应表的查询完成执行）。

`ALTER TABLE t FREEZE PARTITION` 仅复制数据，不复制表元数据。要备份表的元数据，请复制 `/var/lib/clickhouse/metadata/database/table.sql` 文件。

要从备份中恢复数据，请执行以下步骤：

1. 如果表不存在，则创建该表。要查看查询，请使用 .sql 文件（将其中的 `ATTACH` 替换为 `CREATE`）。
2. 从备份中的 `data/database/table/` 目录复制数据到 `/var/lib/clickhouse/data/database/table/detached/` 目录。
3. 运行 `ALTER TABLE t ATTACH PARTITION` 查询将数据添加到表中。

从备份中恢复不需要停止服务器。

有关备份和恢复数据的更多信息，请参见 [数据备份](/operations/backup.md) 一节。

## UNFREEZE PARTITION {#unfreeze-partition}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] UNFREEZE [PARTITION 'part_expr'] WITH NAME 'backup_name'
```

从磁盘中删除具有指定名称的 `frozen` 分区。如果省略 `PARTITION` 子句，则查询一次性删除所有分区的备份。

## CLEAR INDEX IN PARTITION {#clear-index-in-partition}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] CLEAR INDEX index_name IN PARTITION partition_expr
```

该查询与 `CLEAR COLUMN` 类似，但它重置的是一个索引，而不是列数据。

## FETCH PARTITION|PART {#fetch-partitionpart}

从另一台服务器下载一个分区。此查询仅适用于复制表。

该查询执行以下操作：

1. 从指定的分片下载分区|部分。在 'path-in-zookeeper' 中，您必须指定 ZooKeeper 中的分片路径。
2. 然后，查询将下载的数据放入 `table_name` 表的 `detached` 目录。使用 [ATTACH PARTITION\|PART](#attach-partitionpart) 查询将数据添加到表中。

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

- `ALTER ... FETCH PARTITION|PART` 查询没有复制。它仅在本地服务器上将部分或分区放入 `detached` 目录。
- `ALTER TABLE ... ATTACH` 查询是复制的。它将数据添加到所有副本中。数据从 `detached` 目录添加到其中一个副本，从邻近副本添加到其他副本。

在下载之前，系统会检查分区是否存在以及表结构是否匹配。从健康副本中自动选择最合适的副本。

尽管该查询称为 `ALTER TABLE`，但它并不更改表结构，也不立即更改表中的可用数据。

## MOVE PARTITION\|PART {#move-partitionpart}

将分区或数据部分移动到另一卷或磁盘用于 `MergeTree` 引擎表。请参见 [使用多个块设备进行数据存储](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-multiple-volumes)。

```sql
ALTER TABLE table_name [ON CLUSTER cluster] MOVE PARTITION|PART partition_expr TO DISK|VOLUME 'disk_name'
```

`ALTER TABLE t MOVE` 查询：

- 不进行复制，因为不同副本可以有不同的存储策略。
- 如果指定的磁盘或卷没有配置，则返回错误。如果在存储策略中指定的数据移动条件无法应用，也会返回错误。
- 如果要移动的数据已被后台进程、并发的 `ALTER TABLE t MOVE` 查询或后台数据合并进程移动，则可能返回错误。在这种情况下，用户不应执行任何其他操作。

示例：

```sql
ALTER TABLE hits MOVE PART '20190301_14343_16206_438' TO VOLUME 'slow'
ALTER TABLE hits MOVE PARTITION '2019-09-01' TO DISK 'fast_ssd'
```

## UPDATE IN PARTITION {#update-in-partition}

根据指定的过滤表达式操作指定分区中的数据。实现为 [mutation](/sql-reference/statements/alter/index.md#mutations)。

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

根据指定的过滤表达式删除指定分区中的数据。实现为 [mutation](/sql-reference/statements/alter/index.md#mutations)。

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

## REWRITE PARTS {#rewrite-parts}

这将从头开始重写部分，使用所有新设置。这是有意义的，因为例如 `use_const_adaptive_granularity` 的表级设置默认仅对新写入的部分应用。

### 示例 {#example-rewrite-parts}

```sql
ALTER TABLE mt REWRITE PARTS;
ALTER TABLE mt REWRITE PARTS IN PARTITION 2;
```

### 另请参见 {#see-also-1}

- [DELETE](/sql-reference/statements/alter/delete)

## 如何设置分区表达式 {#how-to-set-partition-expression}

您可以在 `ALTER ... PARTITION` 查询中以不同方式指定分区表达式：

- 作为 `system.parts` 表的 `partition` 列中的值。例如，`ALTER TABLE visits DETACH PARTITION 201901`。
- 使用关键字 `ALL`。它只能与 DROP/DETACH/ATTACH/ATTACH FROM 一起使用。例如，`ALTER TABLE visits ATTACH PARTITION ALL`。
- 作为与表分区键元组匹配（在类型上）的表达式或常量的元组。在单元素分区键的情况下，表达式应包装在 `tuple (...)` 函数中。例如，`ALTER TABLE visits DETACH PARTITION tuple(toYYYYMM(toDate('2019-01-25')))`.
- 使用分区 ID。分区 ID 是分区的字符串标识符（如果可能的话，便于人类阅读），用于文件系统和 ZooKeeper 中作为分区的名称。分区 ID 必须在 `PARTITION ID` 子句中用单引号指定。例如，`ALTER TABLE visits DETACH PARTITION ID '201901'`。
- 在 [ALTER ATTACH PART](#attach-partitionpart) 和 [DROP DETACHED PART](#drop-detached-partitionpart) 查询中，要指定部分的名称，请使用来自 [system.detached_parts](/operations/system-tables/detached_parts) 表的 `name` 列的字符串字面量。例如，`ALTER TABLE visits ATTACH PART '201901_1_1_0'`。

在指定分区时使用引号取决于分区表达式的类型。例如，对于 `String` 类型，您必须在引号（`'`）中指定其名称。对于 `Date` 和 `Int*` 类型，则不需要引号。

上述所有规则对于 [OPTIMIZE](/sql-reference/statements/optimize.md) 查询同样适用。如果您需要在优化非分区表时仅指定一个分区，请设置表达式 `PARTITION tuple()`。例如：

```sql
OPTIMIZE TABLE table_not_partitioned PARTITION tuple() FINAL;
```

`IN PARTITION` 指定在 `ALTER TABLE` 查询的结果中应用 [UPDATE](/sql-reference/statements/alter/update) 或 [DELETE](/sql-reference/statements/alter/delete) 表达式的分区。仅从指定分区创建新部分。通过这种方式，`IN PARTITION` 有助于减少当表划分为多个分区且您只需逐点更新数据时的负载。

`ALTER ... PARTITION` 查询的示例在测试中演示 [`00502_custom_partitioning_local`](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/00502_custom_partitioning_local.sql) 和 [`00502_custom_partitioning_replicated_zookeeper`](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/00502_custom_partitioning_replicated_zookeeper.sql)。
