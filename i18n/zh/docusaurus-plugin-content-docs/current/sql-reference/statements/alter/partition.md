---
description: '分区相关文档'
sidebar_label: '分区（PARTITION）'
sidebar_position: 38
slug: /sql-reference/statements/alter/partition
title: '操作分区和分片（Parts）'
doc_type: 'reference'
---

可以对[分区](/engines/table-engines/mergetree-family/custom-partitioning-key.md)执行以下操作：

* [DETACH PARTITION|PART](#detach-partitionpart) — 将一个分区或分片移动到 `detached` 目录，并使其从表中“遗忘”。
* [DROP PARTITION|PART](#drop-partitionpart) — 删除一个分区或分片。
* [DROP DETACHED PARTITION|PART](#drop-detached-partitionpart) - 从 `detached` 中删除某个分片或某个分区的全部分片。
* [FORGET PARTITION](#forget-partition) — 如果分区为空，则从 ZooKeeper 中删除该分区的元数据。
* [ATTACH PARTITION|PART](#attach-partitionpart) — 将 `detached` 目录中的一个分区或分片重新加入到表中。
* [ATTACH PARTITION FROM](#attach-partition-from) — 将一个分区的数据从一张表复制到另一张表并添加。
* [REPLACE PARTITION](#replace-partition) — 将一个分区的数据从一张表复制到另一张表并进行替换。
* [MOVE PARTITION TO TABLE](#move-partition-to-table) — 将一个分区的数据从一张表移动到另一张表。
* [CLEAR COLUMN IN PARTITION](#clear-column-in-partition) — 重置某个分区中指定列的值。
* [CLEAR INDEX IN PARTITION](#clear-index-in-partition) — 重置某个分区中指定的二级索引。
* [FREEZE PARTITION](#freeze-partition) — 创建某个分区的备份。
* [UNFREEZE PARTITION](#unfreeze-partition) — 删除某个分区的备份。
* [FETCH PARTITION|PART](#fetch-partitionpart) — 从另一台服务器下载一个分片或分区。
* [MOVE PARTITION|PART](#move-partitionpart) — 将分区或分片移动到另一块磁盘或卷。
* [UPDATE IN PARTITION](#update-in-partition) — 按条件更新分区内的数据。
* [DELETE IN PARTITION](#delete-in-partition) — 按条件删除分区内的数据。
* [REWRITE PARTS](#rewrite-parts) — 完全重写表中的分片（或特定分区中的分片）。

{/* */ }


## DETACH PARTITION|PART 分离分区/分片 {#detach-partitionpart}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] DETACH PARTITION|PART partition_expr
```

将指定分区的所有数据移动到 `detached` 目录。服务器会“遗忘”这个已分离的数据分区，就好像它不存在一样。在你执行 [ATTACH](#attach-partitionpart) 查询之前，服务器都不会知道这些数据的存在。

示例：

```sql
ALTER TABLE mt DETACH PARTITION '2020-11-21';
ALTER TABLE mt DETACH PART 'all_2_2_0';
```

请参见[如何设置分区表达式](#how-to-set-partition-expression)一节了解如何设置分区表达式。

在查询执行完成后，可以对 `detached` 目录中的数据执行任意操作——从文件系统中删除它，或者直接保留。

该查询会在所有副本上被复制执行——它会将所有副本上的数据移动到 `detached` 目录。请注意，只能在 leader 副本上执行此查询。要确定某个副本是否为 leader 副本，请对 [system.replicas](/operations/system-tables/replicas) 表执行 `SELECT` 查询。或者，更简单的做法是在所有副本上执行 `DETACH` 查询——除 leader 副本外，所有副本都会抛出异常（因为允许存在多个 leader 副本）。


## DROP PARTITION|PART {#drop-partitionpart}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] DROP PARTITION|PART partition_expr
```

从表中删除指定分区。该查询会将分区标记为非活动状态，并在大约 10 分钟内彻底删除数据。

关于设置分区表达式，请参阅[如何设置分区表达式](#how-to-set-partition-expression)一节。

这是一个复制查询 —— 它会在所有副本上删除数据。

示例：

```sql
ALTER TABLE mt DROP PARTITION '2020-11-21';
ALTER TABLE mt DROP PART 'all_4_4_0';
```


## DROP DETACHED PARTITION|PART {#drop-detached-partitionpart}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] DROP DETACHED PARTITION|PART ALL|partition_expr
```

从 `detached` 中移除指定分区的某个或全部数据部分。
有关设置分区表达式的更多信息，请参见[如何设置分区表达式](#how-to-set-partition-expression)一节。


## FORGET PARTITION 语句 {#forget-partition}

```sql
ALTER TABLE table_name FORGET PARTITION partition_expr
```

从 ZooKeeper 中删除空分区的所有元数据。如果分区不为空或不存在，则查询会失败。请确保仅对以后不会再使用的分区执行此操作。

关于设置分区表达式，请参阅章节[如何设置分区表达式](#how-to-set-partition-expression)。

示例：

```sql
ALTER TABLE mt FORGET PARTITION '20201121';
```


## ATTACH PARTITION|PART（附加分区/部件） {#attach-partitionpart}

```sql
ALTER TABLE table_name ATTACH PARTITION|PART partition_expr
```

从 `detached` 目录向表中添加数据。可以为整个分区或单个分片添加数据。示例：

```sql
ALTER TABLE visits ATTACH PARTITION 201901;
ALTER TABLE visits ATTACH PART 201901_2_2_0;
```

在[如何设置分区表达式](#how-to-set-partition-expression)一节中可以了解更多关于设置分区表达式的信息。

该查询会在各个副本上执行。发起该查询的副本会检查 `detached` 目录中是否有数据。
如果存在数据，查询会检查其完整性。如果一切正确，查询会将数据添加到表中。

当非发起副本接收到 `ATTACH` 命令时，如果在自身的 `detached` 目录中找到了具有正确校验和的数据片段，则会在不从其他副本拉取数据的情况下直接附加这些数据。
如果不存在具有正确校验和的数据片段，则会从任意拥有该数据片段的副本下载数据。

你可以先在某个副本的 `detached` 目录中放入数据，然后使用 `ALTER ... ATTACH` 查询将其添加到所有副本上的表中。


## ATTACH PARTITION FROM 语句 {#attach-partition-from}

```sql
ALTER TABLE table2 [ON CLUSTER cluster] ATTACH PARTITION partition_expr FROM table1
```

此查询将数据分区从 `table1` 复制到 `table2`。

请注意：

* 不会从 `table1` 或 `table2` 中删除数据。
* `table1` 可以是临时表。

要使查询成功执行，必须满足以下条件：

* 两个表必须具有相同的结构。
* 两个表必须具有相同的分区键、相同的 ORDER BY 键以及相同的主键。
* 两个表必须具有相同的存储策略。
* 目标表必须包含源表中的所有索引和投影。如果在目标表中启用了 `enforce_index_structure_match_on_partition_manipulation` 设置，则索引和投影必须完全一致。否则，目标表可以具有源表索引和投影的超集。


## REPLACE PARTITION（替换分区） {#replace-partition}

```sql
ALTER TABLE table2 [ON CLUSTER cluster] REPLACE PARTITION partition_expr FROM table1
```

此查询将数据分区从 `table1` 复制到 `table2`，并替换 `table2` 中现有的分区。该操作是原子的。

请注意：

* `table1` 中的数据不会被删除。
* `table1` 可以是临时表。

要使查询成功运行，必须满足以下条件：

* 两个表必须具有相同的结构。
* 两个表必须具有相同的分区键、相同的 ORDER BY 键以及相同的主键。
* 两个表必须具有相同的存储策略。
* 目标表必须包含源表中的所有索引和投影。如果在目标表中启用了 `enforce_index_structure_match_on_partition_manipulation` 设置，则索引和投影必须完全相同。否则，目标表可以拥有源表索引和投影的超集。


## 将分区移动到其他表 {#move-partition-to-table}

```sql
ALTER TABLE table_source [ON CLUSTER cluster] MOVE PARTITION partition_expr TO TABLE table_dest
```

此查询会将数据分区从 `table_source` 移动到 `table_dest`，并从 `table_source` 中删除这些数据。

要使查询成功运行，必须满足以下条件：

* 两个表必须具有相同的结构。
* 两个表必须具有相同的分区键、相同的 ORDER BY 键以及相同的主键。
* 两个表必须使用相同的存储策略。
* 两个表必须属于相同的引擎家族（复制或非复制）。
* 目标表必须包含源表的所有索引和投影。如果在目标表中启用了 `enforce_index_structure_match_on_partition_manipulation` 设置，则索引和投影必须完全一致。否则，目标表可以包含源表索引和投影的超集。


## 清除分区中的列 {#clear-column-in-partition}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] CLEAR COLUMN column_name IN PARTITION partition_expr
```

重置分区中指定列的所有值。如果在创建表时指定了 `DEFAULT` 子句，则该查询会将该列的值重置为指定的默认值。

示例：

```sql
ALTER TABLE visits CLEAR COLUMN hour in PARTITION 201902
```


## 冻结分区 {#freeze-partition}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] FREEZE [PARTITION partition_expr] [WITH NAME 'backup_name']
```

此查询会为指定分区创建本地备份。若省略 `PARTITION` 子句，则该查询会一次性为所有分区创建备份。

:::note
整个备份过程在不停止服务器的情况下完成。
:::

注意，对于旧式表，可以指定分区名称的前缀（例如 `2019`）——此时，查询会为所有对应的分区创建备份。有关设置分区表达式的说明，请参阅[如何设置分区表达式](#how-to-set-partition-expression)一节。

在执行时，为生成数据快照，查询会对表数据创建硬链接。硬链接会被放置在目录 `/var/lib/clickhouse/shadow/N/...` 中，其中：

* `/var/lib/clickhouse/` 是在配置中指定的 ClickHouse 工作目录。
* `N` 是备份的自增编号。
* 如果指定了 `WITH NAME` 参数，则使用 `'backup_name'` 参数的值来代替自增编号。

:::note
如果您在表中使用了[一组磁盘来存储数据](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-multiple-volumes)，则每块磁盘上都会出现 `shadow/N` 目录，用于存储与 `PARTITION` 表达式匹配的数据部分。
:::

备份中的目录结构与 `/var/lib/clickhouse/` 内部的结构相同。查询会对所有文件执行 `chmod` 操作，禁止对其进行写入。

创建备份后，您可以将 `/var/lib/clickhouse/shadow/` 中的数据复制到远程服务器，然后再从本地服务器上删除这些数据。注意，`ALTER t FREEZE PARTITION` 查询不会在副本间进行复制，它只会在本地服务器上创建本地备份。

该查询几乎可以瞬间完成备份创建（但会先等待当前对相应表的查询执行完毕）。

`ALTER TABLE t FREEZE PARTITION` 只会复制数据，而不会复制表元数据。若要备份表元数据，请复制文件 `/var/lib/clickhouse/metadata/database/table.sql`

要从备份中恢复数据，请执行以下步骤：

1. 如果表不存在则创建该表。要查看创建表的查询，请使用 .sql 文件（将其中的 `ATTACH` 替换为 `CREATE`）。
2. 将备份中 `data/database/table/` 目录下的数据复制到 `/var/lib/clickhouse/data/database/table/detached/` 目录。
3. 运行 `ALTER TABLE t ATTACH PARTITION` 查询，将数据添加到表中。

从备份恢复数据不需要停止服务器。

该查询会并行处理数据部分，线程数量由 `max_threads` 设置控制。

有关备份和数据恢复的更多信息，请参阅 [《在 ClickHouse 中进行备份与恢复》](/operations/backup/overview) 一节。


## 解冻分区 {#unfreeze-partition}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] UNFREEZE [PARTITION 'part_expr'] WITH NAME 'backup_name'
```

从磁盘中删除名称为指定值的 `frozen` 分区。若省略 `PARTITION` 子句，则该查询将一次性删除所有分区的备份。


## 清除分区索引 {#clear-index-in-partition}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] CLEAR INDEX index_name IN PARTITION partition_expr
```

该查询的作用类似于 `CLEAR COLUMN`，但它重置的是索引而不是列数据。


## FETCH PARTITION|PART 命令 {#fetch-partitionpart}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] FETCH PARTITION|PART partition_expr FROM 'path-in-zookeeper'
```

从另一台服务器下载一个分区。此查询仅适用于复制表。

该查询会执行以下操作：

1. 从指定分片下载指定的 partition|part。在 `path-in-zookeeper` 中必须指定该分片在 ZooKeeper 中的路径。
2. 然后将下载的数据放入 `table_name` 表的 `detached` 目录下。使用 [ATTACH PARTITION|PART](#attach-partitionpart) 查询将数据添加到表中。

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

* `ALTER ... FETCH PARTITION|PART` 查询不会在副本间复制执行。它只会在本地服务器上将分区或数据分片放入 `detached` 目录。
* `ALTER TABLE ... ATTACH` 查询会在副本间复制执行。它会将数据添加到所有副本中：从某个副本的 `detached` 目录中将数据添加到该副本，从其他副本则通过相邻副本拉取数据。

在拉取之前，系统会检查该分区是否存在以及表结构是否匹配。系统会在健康的副本中自动选择最合适的副本。

虽然该查询名为 `ALTER TABLE`，但它不会更改表结构，也不会立即更改表中可用的数据。


## MOVE PARTITION|PART {#move-partitionpart}

将 `MergeTree` 引擎表的分区或数据部分移动到其他卷或磁盘。参见 [使用多个块设备进行数据存储](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-multiple-volumes)。

```sql
ALTER TABLE table_name [ON CLUSTER cluster] MOVE PARTITION|PART partition_expr TO DISK|VOLUME 'disk_name'
```

`ALTER TABLE t MOVE` 查询：

* 不会在副本之间复制执行，因为不同副本可以有不同的存储策略。
* 如果指定的磁盘或卷未配置，则返回错误。如果存储策略中指定的数据移动条件无法满足，查询同样会返回错误。
* 当要移动的数据已经被后台进程、并发执行的 `ALTER TABLE t MOVE` 查询或后台数据合并移动时，也可能返回错误。在这种情况下，用户无需执行任何额外操作。

示例：

```sql
ALTER TABLE hits MOVE PART '20190301_14343_16206_438' TO VOLUME 'slow'
ALTER TABLE hits MOVE PARTITION '2019-09-01' TO DISK 'fast_ssd'
```


## 在分区中执行 UPDATE {#update-in-partition}

对匹配指定过滤表达式的目标分区中的数据进行修改。通过[变更（mutation）](/sql-reference/statements/alter/index.md#mutations)实现。

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


### 另请参阅 {#see-also}

* [UPDATE](/sql-reference/statements/alter/partition#update-in-partition)

## DELETE IN PARTITION {#delete-in-partition}

删除指定分区中与给定过滤表达式匹配的数据。实现方式为一次[变更](/sql-reference/statements/alter/index.md#mutations)。

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


## 重写分区片段 {#rewrite-parts}

这将使用所有新的设置，从头开始重写这些分区片段。这样做是合理的，因为像 `use_const_adaptive_granularity` 这样的表级设置，默认情况下只会应用于新写入的分区片段。

### 示例 {#example-rewrite-parts}

```sql
ALTER TABLE mt REWRITE PARTS;
ALTER TABLE mt REWRITE PARTS IN PARTITION 2;
```


### 另请参阅 {#see-also-1}

* [DELETE](/sql-reference/statements/alter/delete)

## 如何设置分区表达式 {#how-to-set-partition-expression}

可以在 `ALTER ... PARTITION` 查询中通过多种方式指定分区表达式：

* 作为 `system.parts` 表中 `partition` 列的值。例如，`ALTER TABLE visits DETACH PARTITION 201901`。
* 使用关键字 `ALL`。它只能与 DROP/DETACH/ATTACH/ATTACH FROM 一起使用。例如，`ALTER TABLE visits ATTACH PARTITION ALL`。
* 作为一个表达式或常量的元组，其类型需与表的分区键元组匹配。对于只有单个元素的分区键，表达式应放在 `tuple (...)` 函数中。例如，`ALTER TABLE visits DETACH PARTITION tuple(toYYYYMM(toDate('2019-01-25')))`。
* 使用分区 ID。分区 ID 是一个字符串标识符（如果可能，应为可读格式），在文件系统和 ZooKeeper 中作为分区名称使用。分区 ID 必须在 `PARTITION ID` 子句中以单引号指定。例如，`ALTER TABLE visits DETACH PARTITION ID '201901'`。
* 在 [ALTER ATTACH PART](#attach-partitionpart) 和 [DROP DETACHED PART](#drop-detached-partitionpart) 查询中，要指定一个 part 的名称，请使用字符串字面量，其值来自 [system.detached&#95;parts](/operations/system-tables/detached_parts) 表中的 `name` 列。例如，`ALTER TABLE visits ATTACH PART '201901_1_1_0'`。

在指定分区时是否使用引号取决于分区表达式的类型。例如，对于 `String` 类型，必须使用引号 (`'`) 指定其名称。对于 `Date` 和 `Int*` 类型则不需要引号。

上述所有规则同样适用于 [OPTIMIZE](/sql-reference/statements/optimize.md) 查询。如果在优化一个未分区的表时需要仅指定一个分区，请将表达式设置为 `PARTITION tuple()`。例如：

```sql
OPTIMIZE TABLE table_not_partitioned PARTITION tuple() FINAL;
```

`IN PARTITION` 指定在执行 `ALTER TABLE` 查询时，[UPDATE](/sql-reference/statements/alter/update) 或 [DELETE](/sql-reference/statements/alter/delete) 表达式所作用的分区。新的 part 只会从指定的分区中创建。通过这种方式，当表被划分为许多分区而你只需要对数据进行局部更新时，`IN PARTITION` 有助于降低负载。

`ALTER ... PARTITION` 查询的示例见测试 [`00502_custom_partitioning_local`](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/00502_custom_partitioning_local.sql) 和 [`00502_custom_partitioning_replicated_zookeeper`](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/00502_custom_partitioning_replicated_zookeeper.sql)。
