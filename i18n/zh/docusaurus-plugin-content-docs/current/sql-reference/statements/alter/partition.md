---
description: "分区文档"
sidebar_label: "PARTITION"
sidebar_position: 38
slug: /sql-reference/statements/alter/partition
title: "操作分区和数据部分"
doc_type: "reference"
---

以下[分区](/engines/table-engines/mergetree-family/custom-partitioning-key.md)操作可用:

- [DETACH PARTITION\|PART](#detach-partitionpart) — 将分区或数据部分移动到 `detached` 目录并使其脱离管理。
- [DROP PARTITION\|PART](#drop-partitionpart) — 删除分区或数据部分。
- [DROP DETACHED PARTITION\|PART](#drop-detached-partitionpart) - 从 `detached` 中删除数据部分或分区的所有部分。
- [FORGET PARTITION](#forget-partition) — 如果分区为空,则从 ZooKeeper 中删除分区元数据。
- [ATTACH PARTITION\|PART](#attach-partitionpart) — 将 `detached` 目录中的分区或数据部分添加到表中。
- [ATTACH PARTITION FROM](#attach-partition-from) — 将数据分区从一个表复制到另一个表并添加。
- [REPLACE PARTITION](#replace-partition) — 将数据分区从一个表复制到另一个表并替换。
- [MOVE PARTITION TO TABLE](#move-partition-to-table) — 将数据分区从一个表移动到另一个表。
- [CLEAR COLUMN IN PARTITION](#clear-column-in-partition) — 重置分区中指定列的值。
- [CLEAR INDEX IN PARTITION](#clear-index-in-partition) — 重置分区中指定的二级索引。
- [FREEZE PARTITION](#freeze-partition) — 创建分区的备份。
- [UNFREEZE PARTITION](#unfreeze-partition) — 删除分区的备份。
- [FETCH PARTITION\|PART](#fetch-partitionpart) — 从另一台服务器下载数据部分或分区。
- [MOVE PARTITION\|PART](#move-partitionpart) — 将分区/数据部分移动到另一个磁盘或卷。
- [UPDATE IN PARTITION](#update-in-partition) — 按条件更新分区内的数据。
- [DELETE IN PARTITION](#delete-in-partition) — 按条件删除分区内的数据。
- [REWRITE PARTS](#rewrite-parts) — 完全重写表(或特定分区)中的数据部分。

<!-- -->


## DETACH PARTITION\|PART {#detach-partitionpart}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] DETACH PARTITION|PART partition_expr
```

将指定分区的所有数据移动到 `detached` 目录。服务器将忽略已分离的数据分区,视其为不存在。在执行 [ATTACH](#attach-partitionpart) 查询之前,服务器不会识别这些数据。

示例:

```sql
ALTER TABLE mt DETACH PARTITION '2020-11-21';
ALTER TABLE mt DETACH PART 'all_2_2_0';
```

有关设置分区表达式的详细信息,请参阅 [如何设置分区表达式](#how-to-set-partition-expression) 章节。

查询执行后,您可以对 `detached` 目录中的数据进行任意操作——从文件系统中删除或保留。

此查询会被复制——它会将数据移动到所有副本的 `detached` 目录。请注意,您只能在 leader 副本上执行此查询。要确定副本是否为 leader,请对 [system.replicas](/operations/system-tables/replicas) 表执行 `SELECT` 查询。或者,更简单的方法是在所有副本上执行 `DETACH` 查询——除 leader 副本外,所有副本都会抛出异常(因为允许存在多个 leader)。


## DROP PARTITION\|PART {#drop-partitionpart}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] DROP PARTITION|PART partition_expr
```

从表中删除指定的分区。此查询将分区标记为非活动状态,并在约 10 分钟内完全删除数据。

有关设置分区表达式的详细信息,请参阅[如何设置分区表达式](#how-to-set-partition-expression)章节。

该查询会被复制——它会删除所有副本上的数据。

示例:

```sql
ALTER TABLE mt DROP PARTITION '2020-11-21';
ALTER TABLE mt DROP PART 'all_4_4_0';
```


## DROP DETACHED PARTITION\|PART {#drop-detached-partitionpart}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] DROP DETACHED PARTITION|PART ALL|partition_expr
```

从 `detached` 中移除指定分区的指定部分或所有部分。
关于设置分区表达式的更多信息，请参阅[如何设置分区表达式](#how-to-set-partition-expression)章节。


## FORGET PARTITION {#forget-partition}

```sql
ALTER TABLE table_name FORGET PARTITION partition_expr
```

从 ZooKeeper 中删除空分区的所有元数据。如果分区非空或不存在,查询将失败。请确保仅对永远不会再使用的分区执行此操作。

关于设置分区表达式的详细信息,请参阅[如何设置分区表达式](#how-to-set-partition-expression)章节。

示例:

```sql
ALTER TABLE mt FORGET PARTITION '20201121';
```


## ATTACH PARTITION\|PART {#attach-partitionpart}

```sql
ALTER TABLE table_name ATTACH PARTITION|PART partition_expr
```

从 `detached` 目录向表中添加数据。可以添加整个分区的数据或单独某个部分的数据。示例:

```sql
ALTER TABLE visits ATTACH PARTITION 201901;
ALTER TABLE visits ATTACH PART 201901_2_2_0;
```

有关设置分区表达式的更多信息,请参阅[如何设置分区表达式](#how-to-set-partition-expression)章节。

此查询会被复制。发起副本会检查 `detached` 目录中是否存在数据。
如果数据存在,查询会检查其完整性。如果一切正常,查询会将数据添加到表中。

如果非发起副本在接收到 attach 命令后,在其自己的 `detached` 目录中找到具有正确校验和的部分,它会直接附加数据而不从其他副本获取。
如果不存在具有正确校验和的部分,则会从任何拥有该部分的副本下载数据。

您可以将数据放入某个副本的 `detached` 目录中,然后使用 `ALTER ... ATTACH` 查询将其添加到所有副本的表中。


## ATTACH PARTITION FROM {#attach-partition-from}

```sql
ALTER TABLE table2 [ON CLUSTER cluster] ATTACH PARTITION partition_expr FROM table1
```

此查询将 `table1` 的数据分区复制到 `table2`。

注意事项:

- `table1` 和 `table2` 中的数据都不会被删除。
- `table1` 可以是临时表。

要成功执行此查询,必须满足以下条件:

- 两个表必须具有相同的结构。
- 两个表必须具有相同的分区键、排序键和主键。
- 两个表必须具有相同的存储策略。
- 目标表必须包含源表的所有索引和投影。如果目标表启用了 `enforce_index_structure_match_on_partition_manipulation` 设置,则索引和投影必须完全相同。否则,目标表可以包含源表索引和投影的超集。


## REPLACE PARTITION {#replace-partition}

```sql
ALTER TABLE table2 [ON CLUSTER cluster] REPLACE PARTITION partition_expr FROM table1
```

此查询将 `table1` 中的数据分区复制到 `table2`，并替换 `table2` 中已存在的分区。该操作具有原子性。

注意事项：

- `table1` 中的数据不会被删除。
- `table1` 可以是临时表。

要成功执行此查询，必须满足以下条件：

- 两个表必须具有相同的表结构。
- 两个表必须具有相同的分区键、排序键和主键。
- 两个表必须具有相同的存储策略。
- 目标表必须包含源表的所有索引和投影。如果目标表启用了 `enforce_index_structure_match_on_partition_manipulation` 设置，则索引和投影必须完全一致。否则，目标表可以包含源表索引和投影的超集。


## 将分区移动到表 {#move-partition-to-table}

```sql
ALTER TABLE table_source [ON CLUSTER cluster] MOVE PARTITION partition_expr TO TABLE table_dest
```

此查询将数据分区从 `table_source` 移动到 `table_dest`,并从 `table_source` 中删除数据。

要成功执行此查询,必须满足以下条件:

- 两个表必须具有相同的结构。
- 两个表必须具有相同的分区键、排序键和主键。
- 两个表必须具有相同的存储策略。
- 两个表必须属于相同的引擎系列(复制或非复制)。
- 目标表必须包含源表的所有索引和投影。如果目标表启用了 `enforce_index_structure_match_on_partition_manipulation` 设置,则索引和投影必须完全相同。否则,目标表可以包含源表索引和投影的超集。


## 清除分区中的列 {#clear-column-in-partition}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] CLEAR COLUMN column_name IN PARTITION partition_expr
```

重置分区中指定列的所有值。如果在创建表时定义了 `DEFAULT` 子句,此查询将把列值设置为指定的默认值。

示例:

```sql
ALTER TABLE visits CLEAR COLUMN hour in PARTITION 201902
```


## FREEZE PARTITION {#freeze-partition}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] FREEZE [PARTITION partition_expr] [WITH NAME 'backup_name']
```

此查询创建指定分区的本地备份。如果省略 `PARTITION` 子句,查询将一次性创建所有分区的备份。

:::note
整个备份过程无需停止服务器即可执行。
:::

请注意,对于旧式表,您可以指定分区名称的前缀(例如 `2019`)——查询将为所有相应的分区创建备份。有关设置分区表达式的信息,请参阅[如何设置分区表达式](#how-to-set-partition-expression)部分。

在执行时,查询会为数据快照创建指向表数据的硬链接。硬链接放置在目录 `/var/lib/clickhouse/shadow/N/...` 中,其中:

- `/var/lib/clickhouse/` 是配置中指定的 ClickHouse 工作目录。
- `N` 是备份的递增编号。
- 如果指定了 `WITH NAME` 参数,则使用 `'backup_name'` 参数的值代替递增编号。

:::note
如果您使用[一组磁盘在表中存储数据](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-multiple-volumes),则 `shadow/N` 目录会出现在每个磁盘上,存储与 `PARTITION` 表达式匹配的数据部分。
:::

备份内部创建的目录结构与 `/var/lib/clickhouse/` 内部相同。查询对所有文件执行 `chmod`,禁止写入这些文件。

创建备份后,您可以将数据从 `/var/lib/clickhouse/shadow/` 复制到远程服务器,然后从本地服务器删除。请注意,`ALTER t FREEZE PARTITION` 查询不会被复制,它仅在本地服务器上创建本地备份。

查询几乎立即创建备份(但首先会等待对相应表的当前查询执行完成)。

`ALTER TABLE t FREEZE PARTITION` 仅复制数据,不复制表元数据。要备份表元数据,请复制文件 `/var/lib/clickhouse/metadata/database/table.sql`

要从备份恢复数据,请执行以下操作:

1.  如果表不存在,请创建表。要查看查询,请使用 .sql 文件(将其中的 `ATTACH` 替换为 `CREATE`)。
2.  将备份内 `data/database/table/` 目录中的数据复制到 `/var/lib/clickhouse/data/database/table/detached/` 目录。
3.  运行 `ALTER TABLE t ATTACH PARTITION` 查询将数据添加到表中。

从备份恢复不需要停止服务器。

查询并行处理数据部分,线程数由 `max_threads` 设置控制。

有关备份和恢复数据的更多信息,请参阅[数据备份](/operations/backup.md)部分。


## UNFREEZE PARTITION {#unfreeze-partition}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] UNFREEZE [PARTITION 'part_expr'] WITH NAME 'backup_name'
```

从磁盘中删除具有指定名称的 `frozen` 分区。如果省略 `PARTITION` 子句,该查询将一次性删除所有分区的备份。


## CLEAR INDEX IN PARTITION {#clear-index-in-partition}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] CLEAR INDEX index_name IN PARTITION partition_expr
```

该查询的工作方式与 `CLEAR COLUMN` 类似,但重置的是索引而非列数据。


## FETCH PARTITION|PART {#fetch-partitionpart}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] FETCH PARTITION|PART partition_expr FROM 'path-in-zookeeper'
```

从另一台服务器下载分区。此查询仅适用于复制表。

该查询执行以下操作:

1.  从指定的分片下载分区|部分。在 'path-in-zookeeper' 中,您必须指定 ZooKeeper 中分片的路径。
2.  然后查询将下载的数据放入 `table_name` 表的 `detached` 目录。使用 [ATTACH PARTITION\|PART](#attach-partitionpart) 查询将数据添加到表中。

例如:

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

注意:

- `ALTER ... FETCH PARTITION|PART` 查询不会被复制。它仅在本地服务器上将部分或分区放置到 `detached` 目录。
- `ALTER TABLE ... ATTACH` 查询会被复制。它将数据添加到所有副本。数据从 `detached` 目录添加到其中一个副本,而其他副本则从相邻副本获取数据。

在下载之前,系统会检查分区是否存在以及表结构是否匹配。系统会自动从健康的副本中选择最合适的副本。

尽管该查询称为 `ALTER TABLE`,但它不会更改表结构,也不会立即更改表中可用的数据。


## MOVE PARTITION\|PART {#move-partitionpart}

将 `MergeTree` 引擎表的分区或数据部分移动到另一个卷或磁盘。请参阅[使用多个块设备存储数据](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-multiple-volumes)。

```sql
ALTER TABLE table_name [ON CLUSTER cluster] MOVE PARTITION|PART partition_expr TO DISK|VOLUME 'disk_name'
```

`ALTER TABLE t MOVE` 查询：

- 不会被复制，因为不同的副本可以有不同的存储策略。
- 如果指定的磁盘或卷未配置，则返回错误。如果存储策略中指定的数据移动条件无法应用，查询也会返回错误。
- 当要移动的数据已被后台进程、并发的 `ALTER TABLE t MOVE` 查询或后台数据合并移动时，可能会返回错误。在这种情况下，用户不应执行任何额外操作。

示例：

```sql
ALTER TABLE hits MOVE PART '20190301_14343_16206_438' TO VOLUME 'slow'
ALTER TABLE hits MOVE PARTITION '2019-09-01' TO DISK 'fast_ssd'
```


## UPDATE IN PARTITION {#update-in-partition}

操作指定分区中符合指定过滤表达式的数据。以[变更](/sql-reference/statements/alter/index.md#mutations)方式实现。

语法：

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] UPDATE column1 = expr1 [, ...] [IN PARTITION partition_expr] WHERE filter_expr
```

### 示例 {#example}

```sql
-- 使用分区名称
ALTER TABLE mt UPDATE x = x + 1 IN PARTITION 2 WHERE p = 2;

-- 使用分区 ID
ALTER TABLE mt UPDATE x = x + 1 IN PARTITION ID '2' WHERE p = 2;
```

### 另请参阅 {#see-also}

- [UPDATE](/sql-reference/statements/alter/partition#update-in-partition)


## DELETE IN PARTITION {#delete-in-partition}

删除指定分区中与指定过滤表达式匹配的数据。以[变更](/sql-reference/statements/alter/index.md#mutations)方式实现。

语法:

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] DELETE [IN PARTITION partition_expr] WHERE filter_expr
```

### 示例 {#example-1}

```sql
-- 使用分区名称
ALTER TABLE mt DELETE IN PARTITION 2 WHERE p = 2;

-- 使用分区 ID
ALTER TABLE mt DELETE IN PARTITION ID '2' WHERE p = 2;
```


## REWRITE PARTS {#rewrite-parts}

此操作将使用所有新设置从头重写数据分区。这是有意义的,因为像 `use_const_adaptive_granularity` 这样的表级设置默认仅应用于新写入的数据分区。

### 示例 {#example-rewrite-parts}

```sql
ALTER TABLE mt REWRITE PARTS;
ALTER TABLE mt REWRITE PARTS IN PARTITION 2;
```

### 另请参阅 {#see-also-1}

- [DELETE](/sql-reference/statements/alter/delete)


## 如何设置分区表达式 {#how-to-set-partition-expression}

您可以通过以下几种方式在 `ALTER ... PARTITION` 查询中指定分区表达式:

- 使用 `system.parts` 表中 `partition` 列的值。例如,`ALTER TABLE visits DETACH PARTITION 201901`。
- 使用关键字 `ALL`。该关键字仅可与 DROP/DETACH/ATTACH/ATTACH FROM 配合使用。例如,`ALTER TABLE visits ATTACH PARTITION ALL`。
- 使用与表分区键元组类型匹配的表达式或常量元组。对于单元素分区键,表达式应包装在 `tuple (...)` 函数中。例如,`ALTER TABLE visits DETACH PARTITION tuple(toYYYYMM(toDate('2019-01-25')))`。
- 使用分区 ID。分区 ID 是分区的字符串标识符(尽可能具有可读性),用作文件系统和 ZooKeeper 中的分区名称。分区 ID 必须在 `PARTITION ID` 子句中使用单引号指定。例如,`ALTER TABLE visits DETACH PARTITION ID '201901'`。
- 在 [ALTER ATTACH PART](#attach-partitionpart) 和 [DROP DETACHED PART](#drop-detached-partitionpart) 查询中,要指定数据部分的名称,请使用 [system.detached_parts](/operations/system-tables/detached_parts) 表中 `name` 列的字符串字面量值。例如,`ALTER TABLE visits ATTACH PART '201901_1_1_0'`。

指定分区时是否使用引号取决于分区表达式的类型。例如,对于 `String` 类型,必须使用引号(`'`)指定其名称。对于 `Date` 和 `Int*` 类型则不需要引号。

上述所有规则同样适用于 [OPTIMIZE](/sql-reference/statements/optimize.md) 查询。如果需要在优化非分区表时指定单个分区,请设置表达式 `PARTITION tuple()`。例如:

```sql
OPTIMIZE TABLE table_not_partitioned PARTITION tuple() FINAL;
```

`IN PARTITION` 用于指定在 `ALTER TABLE` 查询中应用 [UPDATE](/sql-reference/statements/alter/update) 或 [DELETE](/sql-reference/statements/alter/delete) 表达式的分区。新数据部分仅从指定的分区创建。这样,当表被划分为多个分区且您只需要逐点更新数据时,`IN PARTITION` 有助于降低负载。

`ALTER ... PARTITION` 查询的示例可参见测试 [`00502_custom_partitioning_local`](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/00502_custom_partitioning_local.sql) 和 [`00502_custom_partitioning_replicated_zookeeper`](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/00502_custom_partitioning_replicated_zookeeper.sql)。
