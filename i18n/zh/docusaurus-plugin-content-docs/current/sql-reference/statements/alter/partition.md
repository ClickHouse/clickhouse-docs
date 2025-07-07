---
'description': 'Partition 的文档'
'sidebar_label': 'PARTITION'
'sidebar_position': 38
'slug': '/sql-reference/statements/alter/partition'
'title': '操作分区和分区片段'
---

以下与 [分区](/engines/table-engines/mergetree-family/custom-partitioning-key.md) 相关的操作可用：

- [DETACH PARTITION\|PART](#detach-partitionpart) — 将分区或片段移动到 `detached` 目录并忘记它。
- [DROP PARTITION\|PART](#drop-partitionpart) — 删除分区或片段。
- [DROP DETACHED PARTITION\|PART](#drop-detached-partitionpart) - 从 `detached` 删除一个片段或所有片段。
- [FORGET PARTITION](#forget-partition) — 如果分区为空，则从 Zookeeper 中删除分区元数据。
- [ATTACH PARTITION\|PART](#attach-partitionpart) — 从 `detached` 目录向表中添加分区或片段。
- [ATTACH PARTITION FROM](#attach-partition-from) — 将一个表中的数据分区复制到另一个表并添加。
- [REPLACE PARTITION](#replace-partition) — 将一个表中的数据分区复制到另一个表并替换。
- [MOVE PARTITION TO TABLE](#move-partition-to-table) — 将数据分区从一个表移动到另一个表。
- [CLEAR COLUMN IN PARTITION](#clear-column-in-partition) — 重置分区中指定列的值。
- [CLEAR INDEX IN PARTITION](#clear-index-in-partition) — 重置分区中指定的二级索引。
- [FREEZE PARTITION](#freeze-partition) — 创建分区的备份。
- [UNFREEZE PARTITION](#unfreeze-partition) — 删除分区的备份。
- [FETCH PARTITION\|PART](#fetch-partitionpart) — 从另一个服务器下载片段或分区。
- [MOVE PARTITION\|PART](#move-partitionpart) — 将分区/数据片段移动到另一个磁盘或卷。
- [UPDATE IN PARTITION](#update-in-partition) — 根据条件更新分区内的数据。
- [DELETE IN PARTITION](#delete-in-partition) — 根据条件删除分区内的数据。

<!-- -->

## DETACH PARTITION\|PART {#detach-partitionpart}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] DETACH PARTITION|PART partition_expr
```

将指定分区的所有数据移动到 `detached` 目录。服务器忘记此已分离的数据分区，就好像它不存在。服务器在您执行 [ATTACH](#attach-partitionpart) 查询之前将对此数据一无所知。

示例：

```sql
ALTER TABLE mt DETACH PARTITION '2020-11-21';
ALTER TABLE mt DETACH PART 'all_2_2_0';
```

有关设置分区表达式的更多信息，请参见 [如何设置分区表达式](#how-to-set-partition-expression) 部分。

查询执行后，您可以对 `detached` 目录中的数据做任何您想做的事情——从文件系统中删除它，或者就这样留着。

这个查询是可复制的——它将在所有副本上将数据移动到 `detached` 目录。请注意，您只能在主副本上执行此查询。要找出某个副本是否为主副本，请对 [system.replicas](/operations/system-tables/replicas) 表执行 `SELECT` 查询。或者，在所有副本上执行 `DETACH` 查询更容易——所有副本都会抛出异常，除主副本外（因为允许多个主副本）。

## DROP PARTITION\|PART {#drop-partitionpart}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] DROP PARTITION|PART partition_expr
```

从表中删除指定的分区。该查询将分区标记为非活动，并完全删除数据，约需10分钟。

有关设置分区表达式的更多信息，请参见 [如何设置分区表达式](#how-to-set-partition-expression) 部分。

该查询是可复制的——它会删除所有副本上的数据。

示例：

```sql
ALTER TABLE mt DROP PARTITION '2020-11-21';
ALTER TABLE mt DROP PART 'all_4_4_0';
```

## DROP DETACHED PARTITION\|PART {#drop-detached-partitionpart}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] DROP DETACHED PARTITION|PART ALL|partition_expr
```

从 `detached` 中删除指定的片段或指定分区的所有片段。
有关设置分区表达式的更多信息，请参见 [如何设置分区表达式](#how-to-set-partition-expression) 部分。

## FORGET PARTITION {#forget-partition}

```sql
ALTER TABLE table_name FORGET PARTITION partition_expr
```

从 ZooKeeper 中删除有关空分区的所有元数据。如果分区不为空或未知，查询将失败。确保仅对将不再使用的分区执行此操作。

有关设置分区表达式的更多信息，请参见 [如何设置分区表达式](#how-to-set-partition-expression) 部分。

示例：

```sql
ALTER TABLE mt FORGET PARTITION '20201121';
```

## ATTACH PARTITION\|PART {#attach-partitionpart}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] ATTACH PARTITION|PART partition_expr
```

从 `detached` 目录向表中添加数据。可以为整个分区或单个片段添加数据。示例：

```sql
ALTER TABLE visits ATTACH PARTITION 201901;
ALTER TABLE visits ATTACH PART 201901_2_2_0;
```

有关设置分区表达式的更多信息，请参见 [如何设置分区表达式](#how-to-set-partition-expression) 部分。

该查询是可复制的。副本发起者检查 `detached` 目录中是否存在数据。
如果数据存在，查询将检查其完整性。如果一切正常，查询将数据添加到表中。

如果非发起副本在接收到附加命令时找到其自己 `detached` 文件夹中具有正确校验和的片段，则它会在不从其他副本获取数据的情况下附加该数据。
如果没有具有正确校验和的片段，则从任何拥有该片段的副本下载数据。

您可以将数据放入一个副本的 `detached` 目录，并使用 `ALTER ... ATTACH` 查询将其添加到所有副本的表中。

## ATTACH PARTITION FROM {#attach-partition-from}

```sql
ALTER TABLE table2 [ON CLUSTER cluster] ATTACH PARTITION partition_expr FROM table1
```

该查询将数据分区从 `table1` 复制到 `table2`。

请注意：

- 数据不会从 `table1` 或 `table2` 中删除。
- `table1` 可以是临时表。

为使查询成功执行，必须满足以下条件：

- 两个表必须具有相同的结构。
- 两个表必须具有相同的分区键、相同的排序键和相同的主键。
- 两个表必须具有相同的存储策略。
- 目标表必须包含源表中的所有索引和投影。如果目标表中启用了 `enforce_index_structure_match_on_partition_manipulation` 设置，则索引和投影必须完全相同。否则，目标表可以包含源表索引和投影的超集。

## REPLACE PARTITION {#replace-partition}

```sql
ALTER TABLE table2 [ON CLUSTER cluster] REPLACE PARTITION partition_expr FROM table1
```

该查询将数据分区从 `table1` 复制到 `table2` 并替换 `table2` 中的现有分区。该操作是原子的。

请注意：

- 数据不会从 `table1` 中删除。
- `table1` 可以是临时表。

为使查询成功执行，必须满足以下条件：

- 两个表必须具有相同的结构。
- 两个表必须具有相同的分区键、相同的排序键和相同的主键。
- 两个表必须具有相同的存储策略。
- 目标表必须包含源表中的所有索引和投影。如果目标表中启用了 `enforce_index_structure_match_on_partition_manipulation` 设置，则索引和投影必须完全相同。否则，目标表可以包含源表索引和投影的超集。

## MOVE PARTITION TO TABLE {#move-partition-to-table}

```sql
ALTER TABLE table_source [ON CLUSTER cluster] MOVE PARTITION partition_expr TO TABLE table_dest
```

该查询将数据分区从 `table_source` 移动到 `table_dest`，并从 `table_source` 中删除数据。

为使查询成功执行，必须满足以下条件：

- 两个表必须具有相同的结构。
- 两个表必须具有相同的分区键、相同的排序键和相同的主键。
- 两个表必须具有相同的存储策略。
- 两个表必须属于相同的引擎系列（复制或非复制）。
- 目标表必须包含源表中的所有索引和投影。如果目标表中启用了 `enforce_index_structure_match_on_partition_manipulation` 设置，则索引和投影必须完全相同。否则，目标表可以包含源表索引和投影的超集。

## CLEAR COLUMN IN PARTITION {#clear-column-in-partition}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] CLEAR COLUMN column_name IN PARTITION partition_expr
```

重置分区中指定列的所有值。如果在创建表时确定了 `DEFAULT` 子句，则该查询将列值设置为指定的默认值。

示例：

```sql
ALTER TABLE visits CLEAR COLUMN hour in PARTITION 201902
```

## FREEZE PARTITION {#freeze-partition}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] FREEZE [PARTITION partition_expr] [WITH NAME 'backup_name']
```

该查询为指定分区创建本地备份。如果省略 `PARTITION` 子句，则查询会一次性创建所有分区的备份。

:::note
整个备份过程在不停止服务器的情况下进行。
:::

请注意，对于旧风格的表，您可以指定分区名称的前缀（例如 `2019`）——然后查询将为所有相应的分区创建备份。有关设置分区表达式的更多信息，请参见 [如何设置分区表达式](#how-to-set-partition-expression) 部分。

在执行时，对于数据快照，该查询会对表数据创建硬链接。硬链接位于目录 `/var/lib/clickhouse/shadow/N/...` 中，其中：

- `/var/lib/clickhouse/` 是配置中指定的工作 ClickHouse 目录。
- `N` 是备份的递增编号。
- 如果指定了 `WITH NAME` 参数，则 `'backup_name'` 参数的值将替代递增编号。

:::note
如果您在表中使用 [一组磁盘进行数据存储](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-multiple-volumes)，则在每个磁盘上都将出现 `shadow/N` 目录，存储与 `PARTITION` 表达式匹配的数据片段。
:::

备份内部的目录结构与 `/var/lib/clickhouse/` 内的结构相同。该查询对所有文件执行 `chmod`，禁止对其写入。

创建备份后，您可以将数据从 `/var/lib/clickhouse/shadow/` 复制到远程服务器，然后从本地服务器中删除。请注意，`ALTER t FREEZE PARTITION` 查询不会被复制。它仅在本地服务器上创建本地备份。

该查询几乎是瞬时的（但首先它会等待与相应表相关的当前查询完成运行）。

`ALTER TABLE t FREEZE PARTITION` 仅复制数据，而不复制表元数据。要备份表元数据，请复制文件 `/var/lib/clickhouse/metadata/database/table.sql`。

要从备份中恢复数据，请执行以下操作：

1. 如果表不存在，则创建该表。要查看查询，请使用 .sql 文件（将 `ATTACH` 替换为 `CREATE`）。
2. 将备份中 `data/database/table/` 目录中的数据复制到 `/var/lib/clickhouse/data/database/table/detached/` 目录中。
3. 执行 `ALTER TABLE t ATTACH PARTITION` 查询将数据添加到表中。

从备份恢复无需停止服务器。

有关备份和恢复数据的更多信息，请参见 [数据备份](/operations/backup.md) 部分。

## UNFREEZE PARTITION {#unfreeze-partition}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] UNFREEZE [PARTITION 'part_expr'] WITH NAME 'backup_name'
```

从磁盘中删除具有指定名称的 `frozen` 分区。如果省略 `PARTITION` 子句，查询会一次性删除所有分区的备份。

## CLEAR INDEX IN PARTITION {#clear-index-in-partition}

该查询的工作原理类似于 `CLEAR COLUMN`，但重置的是索引而不是列数据。

## FETCH PARTITION\|PART {#fetch-partitionpart}

从另一个服务器下载分区。此查询仅适用于复制表。

该查询执行以下操作：

1. 从指定分片下载分区|片段。在 'path-in-zookeeper' 中，您必须指定指向 ZooKeeper 中分片的路径。
2. 然后查询将下载的数据放入 `table_name` 表的 `detached` 目录。使用 [ATTACH PARTITION\|PART](#attach-partitionpart) 查询将数据添加到表中。

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

- `ALTER ... FETCH PARTITION|PART` 查询不会被复制。它仅在本地服务器上将片段或分区放入 `detached` 目录。
- `ALTER TABLE ... ATTACH` 查询是可复制的。它将数据添加到所有副本中。数据从 `detached` 目录中的一个副本添加到其他副本中，则从邻近副本添加。

在下载之前，系统检查分区是否存在以及表结构是否匹配。最合适的副本将从健康副本中自动选择。

尽管查询被称为 `ALTER TABLE`，但它不会更改表结构，并且不会立即更改表中可用的数据。

## MOVE PARTITION\|PART {#move-partitionpart}

将分区或数据片段移动到 `MergeTree` 引擎表的另一个卷或磁盘。请参见 [使用多个存储设备进行数据存储](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-multiple-volumes)。

```sql
ALTER TABLE table_name [ON CLUSTER cluster] MOVE PARTITION|PART partition_expr TO DISK|VOLUME 'disk_name'
```

`ALTER TABLE t MOVE` 查询：

- 不可复制，因为不同副本可能具有不同的存储策略。
- 如果未配置指定的磁盘或卷，将返回错误。如果所指定的存储策略无法应用于数据移动，查询也会返回错误。
- 如果要移动的数据已被后台进程、并发的 `ALTER TABLE t MOVE` 查询或作为后台数据合并的结果移动，可能会返回错误。在这种情况下，用户不应执行任何其他操作。

示例：

```sql
ALTER TABLE hits MOVE PART '20190301_14343_16206_438' TO VOLUME 'slow'
ALTER TABLE hits MOVE PARTITION '2019-09-01' TO DISK 'fast_ssd'
```

## UPDATE IN PARTITION {#update-in-partition}

操作指定分区中匹配指定过滤表达式的数据。实现为 [突变](/sql-reference/statements/alter/index.md#mutations)。

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

### 另见 {#see-also}

- [UPDATE](/sql-reference/statements/alter/partition#update-in-partition)

## DELETE IN PARTITION {#delete-in-partition}

删除指定分区中匹配指定过滤表达式的数据。实现为 [突变](/sql-reference/statements/alter/index.md#mutations)。

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

### 另见 {#see-also-1}

- [DELETE](/sql-reference/statements/alter/delete)

## 如何设置分区表达式 {#how-to-set-partition-expression}

您可以在 `ALTER ... PARTITION` 查询中通过不同方式指定分区表达式：

- 作为 `system.parts` 表中 `partition` 列的值。例如，`ALTER TABLE visits DETACH PARTITION 201901`。
- 使用关键字 `ALL`。此关键字仅可与 DROP/DETACH/ATTACH/ATTACH FROM 一起使用。例如，`ALTER TABLE visits ATTACH PARTITION ALL`。
- 作为与表分区键元组在类型上匹配的表达式或常量的元组。在单元素分区键的情况下，表达式应包裹在 `tuple (...)` 函数中。例如，`ALTER TABLE visits DETACH PARTITION tuple(toYYYYMM(toDate('2019-01-25')))`.
- 使用分区 ID。分区 ID 是分区的字符串标识符（尽可能易于阅读），在文件系统和 Zookeeper 中作为分区的名称。分区 ID 必须在 `PARTITION ID` 子句中用单引号指定。例如，`ALTER TABLE visits DETACH PARTITION ID '201901'`。
- 在 [ALTER ATTACH PART](#attach-partitionpart) 和 [DROP DETACHED PART](#drop-detached-partitionpart) 查询中，要指定片段的名称，可使用来自 [system.detached_parts](/operations/system-tables/detached_parts) 表中 `name` 列的字符串字面值。例如，`ALTER TABLE visits ATTACH PART '201901_1_1_0'`。

指定分区时使用引号取决于分区表达式的类型。例如，对于 `String` 类型，您必须用引号（`'`）指定其名称。对于 `Date` 和 `Int*` 类型则不需要引号。

上述所有规则在 [OPTIMIZE](/sql-reference/statements/optimize.md) 查询中同样适用。如果您需要在优化非分区表时指定唯一分区，请设置表达式 `PARTITION tuple()`。例如：

```sql
OPTIMIZE TABLE table_not_partitioned PARTITION tuple() FINAL;
```

`IN PARTITION` 指定应用于 `UPDATE`(/sql-reference/statements/alter/update) 或 `DELETE`(/sql-reference/statements/alter/delete) 表达式的分区，作为 `ALTER TABLE` 查询的结果。从指定分区中只会创建新的片段。通过这种方式，`IN PARTITION` 有助于在表被划分为许多分区时减少负载，而您只需逐点更新数据。

`ALTER ... PARTITION` 查询的示例在测试 [`00502_custom_partitioning_local`](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/00502_custom_partitioning_local.sql) 和 [`00502_custom_partitioning_replicated_zookeeper`](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/00502_custom_partitioning_replicated_zookeeper.sql) 中展示。
