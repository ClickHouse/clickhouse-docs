---
slug: /sql-reference/statements/alter/column
sidebar_position: 37
sidebar_label: COLUMN
title: '列操作'
---

一组允许更改表结构的查询。

语法：

``` sql
ALTER [TEMPORARY] TABLE [db].name [ON CLUSTER cluster] ADD|DROP|RENAME|CLEAR|COMMENT|{MODIFY|ALTER}|MATERIALIZE COLUMN ...
```

在查询中，指定一个或多个逗号分隔的操作列表。
每个操作都是对列的操作。

支持以下操作：

- [ADD COLUMN](#add-column) — 向表中添加新列。
- [DROP COLUMN](#drop-column) — 删除列。
- [RENAME COLUMN](#rename-column) — 重命名现有列。
- [CLEAR COLUMN](#clear-column) — 重置列值。
- [COMMENT COLUMN](#comment-column) — 向列添加文本注释。
- [MODIFY COLUMN](#modify-column) — 更改列的类型、默认表达式、TTL 和列设置。
- [MODIFY COLUMN REMOVE](#modify-column-remove) — 移除列的某个属性。
- [MODIFY COLUMN MODIFY SETTING](#modify-column-modify-setting) - 更改列设置。
- [MODIFY COLUMN RESET SETTING](#modify-column-reset-setting) - 重置列设置。
- [MATERIALIZE COLUMN](#materialize-column) — 在缺少列的分片中物化列。
这些操作将在下面详细描述。

## ADD COLUMN {#add-column}

``` sql
ADD COLUMN [IF NOT EXISTS] name [type] [default_expr] [codec] [AFTER name_after | FIRST]
```

向表中添加具有指定 `name`、`type`、[`codec`](../create/table.md/#column_compression_codec) 和 `default_expr`（请参见 [默认表达式](/sql-reference/statements/create/table#default_values) 部分）的新列。

如果包含 `IF NOT EXISTS` 子句，当列已经存在时，查询不会返回错误。如果指定 `AFTER name_after`（另一个列的名称），则将在表列的列表中，在指定列之后添加该列。如果要将列添加到表的开头，请使用 `FIRST` 子句。否则，列将添加到表的末尾。对于操作链，`name_after` 可以是前一个操作中添加的列的名称。

添加列只会更改表结构，而不会对数据执行任何操作。经过 `ALTER` 后，数据不会出现在磁盘上。如果在从表中读取时缺少列的数据，将以默认值填充（如果有，则执行默认表达式，或者使用零或空字符串）。在合并数据片段后，列会出现在磁盘上（请参见 [MergeTree](/engines/table-engines/mergetree-family/mergetree.md)）。

这种方法允许我们即时完成 `ALTER` 查询，而不会增加旧数据的体积。

示例：

``` sql
ALTER TABLE alter_test ADD COLUMN Added1 UInt32 FIRST;
ALTER TABLE alter_test ADD COLUMN Added2 UInt32 AFTER NestedColumn;
ALTER TABLE alter_test ADD COLUMN Added3 UInt32 AFTER ToDrop;
DESC alter_test FORMAT TSV;
```

``` text
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

## DROP COLUMN {#drop-column}

``` sql
DROP COLUMN [IF EXISTS] name
```

删除名称为 `name` 的列。如果指定 `IF EXISTS` 子句，当列不存在时，查询不会返回错误。

从文件系统中删除数据。由于这会删除整个文件，因此查询几乎即时完成。

:::tip
如果列被 [物化视图](/sql-reference/statements/create/view) 引用，则不能删除该列。否则将返回错误。
:::

示例：

``` sql
ALTER TABLE visits DROP COLUMN browser
```

## RENAME COLUMN {#rename-column}

``` sql
RENAME COLUMN [IF EXISTS] name to new_name
```

将列 `name` 重命名为 `new_name`。如果指定 `IF EXISTS` 子句，当列不存在时，查询不会返回错误。由于重命名不涉及基础数据，因此查询几乎即时完成。

**注意**: 在表的键表达式中指定的列（无论是通过 `ORDER BY` 还是 `PRIMARY KEY`）都无法重命名。尝试更改这些列将产生 `SQL Error [524]`。

示例：

``` sql
ALTER TABLE visits RENAME COLUMN webBrowser TO browser
```

## CLEAR COLUMN {#clear-column}

``` sql
CLEAR COLUMN [IF EXISTS] name IN PARTITION partition_name
```

重置指定分区中列的所有数据。有关设置分区名称的更多信息，请参见 [如何设置分区表达式](../alter/partition.md/#how-to-set-partition-expression) 部分。

如果指定 `IF EXISTS` 子句，当列不存在时，查询不会返回错误。

示例：

``` sql
ALTER TABLE visits CLEAR COLUMN browser IN PARTITION tuple()
```

## COMMENT COLUMN {#comment-column}

``` sql
COMMENT COLUMN [IF EXISTS] name 'Text comment'
```

向列添加注释。如果指定 `IF EXISTS` 子句，当列不存在时，查询不会返回错误。

每列可以有一个注释。如果列已有注释，则新的注释将覆盖之前的注释。

注释存储在通过 [DESCRIBE TABLE](/sql-reference/statements/describe-table.md) 查询返回的 `comment_expression` 列中。

示例：

``` sql
ALTER TABLE visits COMMENT COLUMN browser 'This column shows the browser used for accessing the site.'
```

## MODIFY COLUMN {#modify-column}

``` sql
MODIFY COLUMN [IF EXISTS] name [type] [default_expr] [codec] [TTL] [settings] [AFTER name_after | FIRST]
ALTER COLUMN [IF EXISTS] name TYPE [type] [default_expr] [codec] [TTL] [settings] [AFTER name_after | FIRST]
```

此查询更改 `name` 列的属性：

- 类型

- 默认表达式

- 压缩编解码器

- TTL

- 列级设置

有关列压缩编码修改的示例，请参见 [列压缩编解码器](../create/table.md/#column_compression_codec)。

有关列TTL修改的示例，请参见 [列 TTL](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-column-ttl)。

有关列级设置修改的示例，请参见 [列级设置](/engines/table-engines/mergetree-family/mergetree.md/#column-level-settings)。

如果指定 `IF EXISTS` 子句，当列不存在时，查询不会返回错误。

更改类型时，将值转换为就像应用 [toType](/sql-reference/functions/type-conversion-functions.md) 函数一样。如果仅更改默认表达式，查询不会做任何复杂操作，并且几乎会立即完成。

示例：

``` sql
ALTER TABLE visits MODIFY COLUMN browser Array(String)
```

更改列类型是唯一的复杂操作——它会更改数据文件的内容。对于大型表，这可能需要很长时间。

查询还可以使用 `FIRST | AFTER` 子句更改列的顺序，请参见 [ADD COLUMN](#add-column) 的描述，但在这种情况下列类型是强制要求的。

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

`ALTER` 查询是原子的。对于 MergeTree 表，它也是无锁的。

`ALTER` 查询用于更改列是可复制的。指令保存在 ZooKeeper 中，然后每个副本应用它们。所有 `ALTER` 查询以相同的顺序运行。查询会等待其他副本上相应操作的完成。但是，针对复制表的列更改查询可能会被中断，所有操作将异步执行。

## MODIFY COLUMN REMOVE {#modify-column-remove}

移除列的某个属性：`DEFAULT`、`ALIAS`、`MATERIALIZED`、`CODEC`、`COMMENT`、`TTL`、`SETTINGS`。

语法：

```sql
ALTER TABLE table_name MODIFY COLUMN column_name REMOVE property;
```

**示例**

移除TTL：

```sql
ALTER TABLE table_with_ttl MODIFY COLUMN column_ttl REMOVE TTL;
```

**参见**

- [REMOVE TTL](ttl.md)。

## MODIFY COLUMN MODIFY SETTING {#modify-column-modify-setting}

修改列设置。

语法：

```sql
ALTER TABLE table_name MODIFY COLUMN column_name MODIFY SETTING name=value,...;
```

**示例**

将列的 `max_compress_block_size` 修改为 `1MB`：

```sql
ALTER TABLE table_name MODIFY COLUMN column_name MODIFY SETTING max_compress_block_size = 1048576;
```

## MODIFY COLUMN RESET SETTING {#modify-column-reset-setting}

重置列设置，还会删除表的 CREATE 查询中列表达式的设置声明。

语法：

```sql
ALTER TABLE table_name MODIFY COLUMN column_name RESET SETTING name,...;
```

**示例**

将列设置 `max_compress_block_size` 重置为其默认值：

```sql
ALTER TABLE table_name MODIFY COLUMN column_name RESET SETTING max_compress_block_size;
```

## MATERIALIZE COLUMN {#materialize-column}

物化具有 `DEFAULT` 或 `MATERIALIZED` 值表达式的列。当使用 `ALTER TABLE table_name ADD COLUMN column_name MATERIALIZED` 添加物化列时，现有行在没有物化值的情况下不会自动填充。`MATERIALIZE COLUMN` 语句可用于在添加或更新后重写现有列数据（只会更新元数据，但不会更改现有数据）。请注意，物化排序键中的列是无效操作，因为它可能破坏排序顺序。
实现为 [mutation](/sql-reference/statements/alter/index.md#mutations)。

对于具有新或更新的 `MATERIALIZED` 值表达式的列，所有现有行都会被重写。

对于具有新或更新的 `DEFAULT` 值表达式的列，其行为取决于 ClickHouse 版本：
- 在 ClickHouse < v24.2 中，所有现有行都会重写。
- ClickHouse >= v24.2 将区分在插入时列中 `DEFAULT` 值表达式的行值是显式指定的，还是没有显式指定，即从 `DEFAULT` 值表达式计算得到的。如果值是显式指定的，则 ClickHouse 保持原值不变。如果值是计算得出的，则 ClickHouse 将其更改为新的或更新的 `MATERIALIZED` 值表达式。

语法：

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] MATERIALIZE COLUMN col [IN PARTITION partition | IN PARTITION ID 'partition_id'];
```
- 如果指定了 PARTITION，列将仅在指定的分区中物化。

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

**参见**

- [MATERIALIZED](/sql-reference/statements/create/view#materialized-view)。

## 限制 {#limitations}

`ALTER` 查询允许您在嵌套数据结构中创建和删除单独的元素（列），但不支持整个嵌套数据结构的删除。要添加嵌套数据结构，您可以添加名称为 `name.nested_name` 且类型为 `Array(T)` 的列。嵌套数据结构相当于多个以点前缀相同的数组列。

不支持删除主键或采样键中的列（在 `ENGINE` 表达式中使用的列）。仅在不导致数据被修改的情况下，允许更改包含在主键中的列的类型（例如，允许向枚举中添加值或将类型从 `DateTime` 更改为 `UInt32`）。

如果 `ALTER` 查询不足以进行所需的表更改，您可以创建一个新表，使用 [INSERT SELECT](/sql-reference/statements/insert-into.md/#inserting-the-results-of-select) 查询将数据复制到新表中，然后使用 [RENAME](/sql-reference/statements/rename.md/#rename-table) 查询切换表并删除旧表。

`ALTER` 查询阻塞对表的所有读写。换句话说，如果在 `ALTER` 查询时长时间运行 `SELECT`，则 `ALTER` 查询会等待其完成。与此同时，所有对同一表的新查询都会在执行此 `ALTER` 时等待。

对于不存储数据本身的表（如 [Merge](/sql-reference/statements/alter/index.md) 和 [Distributed](/sql-reference/statements/alter/index.md)），`ALTER` 仅更改表结构，而不改变从属表的结构。例如，当对 `Distributed` 表执行 ALTER 时，您还需要对所有远程服务器上的表执行 `ALTER`。
