---
description: '列相关文档'
sidebar_label: 'COLUMN'
sidebar_position: 37
slug: /sql-reference/statements/alter/column
title: '列操作'
doc_type: 'reference'
---

一组用于更改表结构的查询。

语法：

```sql
ALTER [TEMPORARY] TABLE [db].name [ON CLUSTER cluster] ADD|DROP|RENAME|CLEAR|COMMENT|{MODIFY|ALTER}|MATERIALIZE COLUMN ...
```

在查询中指定一个或多个以逗号分隔的操作。
每个操作都作用于某一列。

支持以下操作：

* [ADD COLUMN](#add-column) — 向表中添加一个新列。
* [DROP COLUMN](#drop-column) — 删除该列。
* [RENAME COLUMN](#rename-column) — 重命名现有列。
* [CLEAR COLUMN](#clear-column) — 重置列的值。
* [COMMENT COLUMN](#comment-column) — 为列添加文本注释。
* [MODIFY COLUMN](#modify-column) — 更改列的类型、默认表达式、TTL 和列设置。
* [MODIFY COLUMN REMOVE](#modify-column-remove) — 移除列的某个属性。
* [MODIFY COLUMN MODIFY SETTING](#modify-column-modify-setting) — 更改列设置。
* [MODIFY COLUMN RESET SETTING](#modify-column-reset-setting) — 重置列设置。
* [MATERIALIZE COLUMN](#materialize-column) — 在缺少该列的数据部分中物化该列。
  这些操作的详细说明见下文。

## ADD COLUMN {#add-column}

```sql
ADD COLUMN [IF NOT EXISTS] name [type] [default_expr] [codec] [AFTER name_after | FIRST]
```

向表中添加一个具有指定 `name`、`type`、[`codec`](../create/table.md/#column_compression_codec) 和 `default_expr` 的新列（参见 [默认表达式](/sql-reference/statements/create/table#default_values) 章节）。

如果包含 `IF NOT EXISTS` 子句，当该列已经存在时，查询不会返回错误。如果你指定了 `AFTER name_after`（另一列的名称），则该列会被添加到列表中指定列之后的位置。如果你想将列添加到表的开头，请使用 `FIRST` 子句。否则，该列会被添加到表的末尾。在一系列操作中，`name_after` 可以是之前某个操作中添加的列的名称。

添加列只会改变表结构，不会对现有数据执行任何操作。`ALTER` 之后数据不会立刻出现在磁盘上。如果在从表中读取时某列缺少数据，它会被默认值填充（如果存在默认表达式，则执行默认表达式，否则使用零或空字符串）。在数据部分合并之后，该列才会出现在磁盘上（参见 [MergeTree](/engines/table-engines/mergetree-family/mergetree.md)）。

这种方式可以使 `ALTER` 查询立即完成，而不会增加旧数据的大小。

示例：

```sql
ALTER TABLE alter_test ADD COLUMN Added1 UInt32 FIRST;
ALTER TABLE alter_test ADD COLUMN Added2 UInt32 AFTER NestedColumn;
ALTER TABLE alter_test ADD COLUMN Added3 UInt32 AFTER ToDrop;
DESC alter_test FORMAT TSV;
```

```text
Added1  UInt32
CounterID       UInt32
StartDate       Date
UserID  UInt32
VisitID UInt32
NestedColumn.A  Array(UInt8)
NestedColumn.S  Array(String)
Added2  UInt32
ToDrop  UInt32
Added3  UInt32
```

## 删除列（DROP COLUMN） {#drop-column}

```sql
DROP COLUMN [IF EXISTS] name
```

删除名称为 `name` 的列。如果指定了 `IF EXISTS` 子句，当该列不存在时，查询不会返回错误。

从文件系统中删除数据。由于是删除整个文件，查询几乎会瞬间完成。

:::tip
如果某列被[物化视图](/sql-reference/statements/create/view)引用，则不能删除该列，否则会返回错误。
:::

示例：

```sql
ALTER TABLE visits DROP COLUMN browser
```

## 重命名列 {#rename-column}

```sql
RENAME COLUMN [IF EXISTS] name to new_name
```

将列 `name` 重命名为 `new_name`。如果指定了 `IF EXISTS` 子句，当列不存在时查询不会返回错误。由于重命名不涉及底层数据，查询几乎可以立即完成。

**注意**：在表的键表达式中指定的列（通过 `ORDER BY` 或 `PRIMARY KEY`）不能被重命名。尝试更改这些列会触发 `SQL Error [524]`。

示例：

```sql
ALTER TABLE visits RENAME COLUMN webBrowser TO browser
```

## CLEAR COLUMN（清空列） {#clear-column}

```sql
CLEAR COLUMN [IF EXISTS] name IN PARTITION partition_name
```

重置指定分区中某列的全部数据。关于如何设置分区表达式的更多信息，请参阅[如何设置分区表达式](../alter/partition.md/#how-to-set-partition-expression)一节。

如果指定了 `IF EXISTS` 子句，当列不存在时查询不会返回错误。

示例：

```sql
ALTER TABLE visits CLEAR COLUMN browser IN PARTITION tuple()
```

## 备注列 {#comment-column}

```sql
COMMENT COLUMN [IF EXISTS] name 'Text comment'
```

向列添加注释。如果指定了 `IF EXISTS` 子句，当列不存在时查询不会返回错误。

每一列只能有一个注释。如果该列已经有注释，则新注释会覆盖先前的注释。

注释存储在 [DESCRIBE TABLE](/sql-reference/statements/describe-table.md) 查询返回的 `comment_expression` 列中。

示例：

```sql
ALTER TABLE visits COMMENT COLUMN browser 'This column shows the browser used for accessing the site.'
```

## 修改列 {#modify-column}

```sql
MODIFY COLUMN [IF EXISTS] name [type] [default_expr] [codec] [TTL] [settings] [AFTER name_after | FIRST]
ALTER COLUMN [IF EXISTS] name TYPE [type] [default_expr] [codec] [TTL] [settings] [AFTER name_after | FIRST]
```

该查询会更改 `name` 列的以下属性：

* 类型

* 默认表达式

* 压缩编解码器

* TTL

* 列级设置

有关修改列压缩编解码器的示例，请参阅 [Column Compression Codecs](../create/table.md/#column_compression_codec)。

有关修改列 TTL 的示例，请参阅 [Column TTL](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-column-ttl)。

有关修改列级设置的示例，请参阅 [Column-level Settings](/engines/table-engines/mergetree-family/mergetree.md/#column-level-settings)。

如果指定了 `IF EXISTS` 子句，当列不存在时，查询不会返回错误。

在更改类型时，值会像对其应用了 [toType](/sql-reference/functions/type-conversion-functions.md) 函数一样被转换。若只更改默认表达式，查询不会执行复杂操作，并且几乎会立即完成。

示例：

```sql
ALTER TABLE visits MODIFY COLUMN browser Array(String)
```

更改列类型是唯一比较复杂的操作——它会修改包含数据的文件内容。对于大型表，这可能会耗费较长时间。

查询还可以使用 `FIRST | AFTER` 子句更改列的顺序，参见 [ADD COLUMN](#add-column) 的说明，但在这种情况下必须指定列类型。

示例：

```sql
CREATE TABLE users (
    c1 Int16,
    c2 String
) ENGINE = MergeTree
ORDER BY c1;

DESCRIBE users;
┌─name─┬─type───┬
│ c1   │ Int16  │
│ c2   │ String │
└──────┴────────┴

ALTER TABLE users MODIFY COLUMN c2 String FIRST;

DESCRIBE users;
┌─name─┬─type───┬
│ c2   │ String │
│ c1   │ Int16  │
└──────┴────────┴

ALTER TABLE users ALTER COLUMN c2 TYPE String AFTER c1;

DESCRIBE users;
┌─name─┬─type───┬
│ c1   │ Int16  │
│ c2   │ String │
└──────┴────────┴
```

`ALTER` 查询是原子性的。对于 MergeTree 表，它也是无锁的。

在修改列时，`ALTER` 查询会在副本之间复制。指令会保存在 ZooKeeper 中，然后每个副本各自应用这些指令。所有 `ALTER` 查询都会以相同的顺序运行。查询会等待其他副本上的相应操作完成。不过，用于更改复制表中列的查询可能会被中断，且所有操作将以异步方式完成。

:::note
在将 Nullable 列更改为 Non-Nullable 时请务必小心。请确保其中没有任何 NULL 值，否则在读取该列时会导致问题。在这种情况下，可以通过 Kill 该 mutation，并将该列恢复为 Nullable 类型来规避问题。
:::

## MODIFY COLUMN REMOVE {#modify-column-remove}

移除某个列属性：`DEFAULT`、`ALIAS`、`MATERIALIZED`、`CODEC`、`COMMENT`、`TTL`、`SETTINGS`。

语法：

```sql
ALTER TABLE table_name MODIFY COLUMN column_name REMOVE property;
```

**示例**

删除 TTL：

```sql
ALTER TABLE table_with_ttl MODIFY COLUMN column_ttl REMOVE TTL;
```

**另请参见**

* [REMOVE TTL](ttl.md)

## MODIFY COLUMN MODIFY SETTING {#modify-column-modify-setting}

修改列的设置。

语法：

```sql
ALTER TABLE table_name MODIFY COLUMN column_name MODIFY SETTING name=value,...;
```

**示例**

将该列的 `max_compress_block_size` 修改为 `1MB`：

```sql
ALTER TABLE table_name MODIFY COLUMN column_name MODIFY SETTING max_compress_block_size = 1048576;
```

## MODIFY COLUMN RESET SETTING {#modify-column-reset-setting}

重置列的设置，同时从该表的 CREATE 查询中的列表达式里移除该设置的声明。

语法：

```sql
ALTER TABLE table_name MODIFY COLUMN column_name RESET SETTING name,...;
```

**示例**

将列设置项 `max_compress_block_size` 重置为默认值：

```sql
ALTER TABLE table_name MODIFY COLUMN column_name RESET SETTING max_compress_block_size;
```

## MATERIALIZE COLUMN {#materialize-column}

对具有 `DEFAULT` 或 `MATERIALIZED` 值表达式的列进行物化（materialize）。当使用 `ALTER TABLE table_name ADD COLUMN column_name MATERIALIZED` 添加物化列时，现有行中缺少物化值的部分不会被自动填充。在添加或更新 `DEFAULT` 或 `MATERIALIZED` 表达式之后（这只会更新元数据而不会更改现有数据），可以使用 `MATERIALIZE COLUMN` 语句重写已有列数据。请注意，对排序键中的列进行物化是无效操作，因为这可能破坏排序顺序。
其实现方式为一次[变更（mutation）](/sql-reference/statements/alter/index.md#mutations)。

对于具有新的或已更新的 `MATERIALIZED` 值表达式的列，所有已有行都会被重写。

对于具有新的或已更新的 `DEFAULT` 值表达式的列，其行为取决于 ClickHouse 版本：

* 在 ClickHouse &lt; v24.2 中，所有已有行都会被重写。
* ClickHouse &gt;= v24.2 会区分在插入时，列中带有 `DEFAULT` 值表达式的行值是被显式指定，还是根据 `DEFAULT` 值表达式计算得到的。如果该值是显式指定的，ClickHouse 会保持不变。如果该值是计算得到的，ClickHouse 会根据新的或已更新的 `MATERIALIZED` 值表达式重新计算并更新该值。

语法：

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] MATERIALIZE COLUMN col [IN PARTITION partition | IN PARTITION ID 'partition_id'];
```

* 如果你指定了 PARTITION，则只会为指定的分区物化该列。

**示例**

```sql
DROP TABLE IF EXISTS tmp;
SET mutations_sync = 2;
CREATE TABLE tmp (x Int64) ENGINE = MergeTree() ORDER BY tuple() PARTITION BY tuple();
INSERT INTO tmp SELECT * FROM system.numbers LIMIT 5;
ALTER TABLE tmp ADD COLUMN s String MATERIALIZED toString(x);

ALTER TABLE tmp MATERIALIZE COLUMN s;

SELECT groupArray(x), groupArray(s) FROM (select x,s from tmp order by x);

┌─groupArray(x)─┬─groupArray(s)─────────┐
│ [0,1,2,3,4]   │ ['0','1','2','3','4'] │
└───────────────┴───────────────────────┘

ALTER TABLE tmp MODIFY COLUMN s String MATERIALIZED toString(round(100/x));

INSERT INTO tmp SELECT * FROM system.numbers LIMIT 5,5;

SELECT groupArray(x), groupArray(s) FROM tmp;

┌─groupArray(x)─────────┬─groupArray(s)──────────────────────────────────┐
│ [0,1,2,3,4,5,6,7,8,9] │ ['0','1','2','3','4','20','17','14','12','11'] │
└───────────────────────┴────────────────────────────────────────────────┘

ALTER TABLE tmp MATERIALIZE COLUMN s;

SELECT groupArray(x), groupArray(s) FROM tmp;

┌─groupArray(x)─────────┬─groupArray(s)─────────────────────────────────────────┐
│ [0,1,2,3,4,5,6,7,8,9] │ ['inf','100','50','33','25','20','17','14','12','11'] │
└───────────────────────┴───────────────────────────────────────────────────────┘
```

**另请参阅**

* [MATERIALIZED](/sql-reference/statements/create/view#materialized-view).

## 限制 {#limitations}

`ALTER` 查询允许在嵌套数据结构中创建和删除单个元素（列），但不能整体创建或删除整个嵌套数据结构。要添加一个嵌套数据结构，可以添加名称类似于 `name.nested_name` 且类型为 `Array(T)` 的列。一个嵌套数据结构等价于多个数组列，这些列在点号之前具有相同的前缀名称。

当前不支持删除主键或采样键中的列（即在 `ENGINE` 表达式中使用的列）。对于包含在主键中的列，只有在类型变更不会导致数据被修改的情况下才允许修改类型（例如，可以向 Enum 中添加值，或者将类型从 `DateTime` 改为 `UInt32`）。

如果通过 `ALTER` 查询不足以完成所需的表结构修改，可以创建一个新表，使用 [INSERT SELECT](/sql-reference/statements/insert-into.md/#inserting-the-results-of-select) 查询将数据复制到新表，然后通过 [RENAME](/sql-reference/statements/rename.md/#rename-table) 查询切换新旧表，最后删除旧表。

`ALTER` 查询会阻塞该表上的所有读写操作。换句话说，如果在执行 `ALTER` 查询时有一个耗时的 `SELECT` 正在运行，`ALTER` 查询会等待该查询完成。同时，所有对同一张表的新查询也会在这个 `ALTER` 执行期间处于等待状态。

对于自身不存储数据的表（例如 [Merge](/sql-reference/statements/alter/index.md) 和 [Distributed](/sql-reference/statements/alter/index.md)），`ALTER` 只会改变表结构，而不会改变下属表的结构。比如，对一个 `Distributed` 表执行 `ALTER` 时，还需要在所有远程服务器上的相应表上执行 `ALTER`。
