---
'description': '关于 COLUMN 的文档'
'sidebar_label': 'COLUMN'
'sidebar_position': 37
'slug': '/sql-reference/statements/alter/column'
'title': '列操作'
---

一组允许更改表结构的查询。

语法：

```sql
ALTER [TEMPORARY] TABLE [db].name [ON CLUSTER cluster] ADD|DROP|RENAME|CLEAR|COMMENT|{MODIFY|ALTER}|MATERIALIZE COLUMN ...
```

在查询中，指定一个或多个以逗号分隔的操作列表。
每个操作是对列的操作。

支持以下操作：

- [ADD COLUMN](#add-column) — 向表中添加新列。
- [DROP COLUMN](#drop-column) — 删除列。
- [RENAME COLUMN](#rename-column) — 重命名现有列。
- [CLEAR COLUMN](#clear-column) — 重置列值。
- [COMMENT COLUMN](#comment-column) — 向列添加文本注释。
- [MODIFY COLUMN](#modify-column) — 更改列的类型、默认表达式、TTL和列设置。
- [MODIFY COLUMN REMOVE](#modify-column-remove) — 移除列的某个属性。
- [MODIFY COLUMN MODIFY SETTING](#modify-column-modify-setting) - 更改列设置。
- [MODIFY COLUMN RESET SETTING](#modify-column-reset-setting) - 重置列设置。
- [MATERIALIZE COLUMN](#materialize-column) — 在缺少列的分区中物化该列。
这些操作的详细内容在下面描述。

## ADD COLUMN {#add-column}

```sql
ADD COLUMN [IF NOT EXISTS] name [type] [default_expr] [codec] [AFTER name_after | FIRST]
```

向表中添加具有指定 `name`、`type`、[`codec`](../create/table.md/#column_compression_codec) 和 `default_expr` 的新列（请参阅 [默认表达式](/sql-reference/statements/create/table#default_values) 部分）。

如果包含 `IF NOT EXISTS` 子句，则当列已经存在时，查询不会返回错误。如果您指定 `AFTER name_after`（另一个列的名称），则该列会在指定列后添加到表列列表中。如果想在表的开头添加列，可以使用 `FIRST` 子句。否则，列将添加到表的末尾。对于操作链，`name_after` 可以是之前操作中添加的列的名称。

添加列仅更改表结构，而不对数据执行任何操作。执行 `ALTER` 后，数据不会出现在磁盘上。如果在从表读取时某列的数据缺失，则会用默认值填充（执行默认表达式，如果存在，或者使用零或空字符串）。在合并数据片段后，该列才会出现在磁盘上（见 [MergeTree](/engines/table-engines/mergetree-family/mergetree.md)）。

这种方法允许我们立即完成 `ALTER` 查询，而不会增加旧数据的量。

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

## DROP COLUMN {#drop-column}

```sql
DROP COLUMN [IF EXISTS] name
```

删除名称为 `name` 的列。如果指定了 `IF EXISTS` 子句，则当列不存在时，查询不会返回错误。

从文件系统中删除数据。由于这会删除整个文件，因此查询几乎瞬间完成。

:::tip
如果某列被 [物化视图](/sql-reference/statements/create/view) 引用，则无法删除该列。否则，将返回错误。
:::

示例：

```sql
ALTER TABLE visits DROP COLUMN browser
```

## RENAME COLUMN {#rename-column}

```sql
RENAME COLUMN [IF EXISTS] name to new_name
```

将列 `name` 重命名为 `new_name`。如果指定了 `IF EXISTS` 子句，则当列不存在时，查询不会返回错误。由于重命名不涉及底层数据，因此查询几乎瞬间完成。

**注意**：在表的键表达式中指定的列（通过 `ORDER BY` 或 `PRIMARY KEY`）无法重命名。尝试更改这些列将产生 `SQL Error [524]`。

示例：

```sql
ALTER TABLE visits RENAME COLUMN webBrowser TO browser
```

## CLEAR COLUMN {#clear-column}

```sql
CLEAR COLUMN [IF EXISTS] name IN PARTITION partition_name
```

重置指定分区中列的所有数据。有关设置分区名称的更多信息，请参阅 [如何设置分区表达式](../alter/partition.md/#how-to-set-partition-expression)。

如果指定了 `IF EXISTS` 子句，则当列不存在时，查询不会返回错误。

示例：

```sql
ALTER TABLE visits CLEAR COLUMN browser IN PARTITION tuple()
```

## COMMENT COLUMN {#comment-column}

```sql
COMMENT COLUMN [IF EXISTS] name 'Text comment'
```

向列添加注释。如果指定了 `IF EXISTS` 子句，则当列不存在时，查询不会返回错误。

每列可以有一个注释。如果列已经存在注释，则新注释将覆盖之前的注释。

注释存储在 [DESCRIBE TABLE](/sql-reference/statements/describe-table.md) 查询返回的 `comment_expression` 列中。

示例：

```sql
ALTER TABLE visits COMMENT COLUMN browser 'This column shows the browser used for accessing the site.'
```

## MODIFY COLUMN {#modify-column}

```sql
MODIFY COLUMN [IF EXISTS] name [type] [default_expr] [codec] [TTL] [settings] [AFTER name_after | FIRST]
ALTER COLUMN [IF EXISTS] name TYPE [type] [default_expr] [codec] [TTL] [settings] [AFTER name_after | FIRST]
```

此查询更改 `name` 列属性：

- 类型

- 默认表达式

- 压缩编码

- TTL

- 列级设置

有关修改列压缩 CODECS 的示例，请参见 [列压缩编解码器](../create/table.md/#column_compression_codec)。

有关列 TTL 修改的示例，请参见 [列 TTL](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-column-ttl)。

有关修改列级设置的示例，请参见 [列级设置](/engines/table-engines/mergetree-family/mergetree.md/#column-level-settings)。

如果指定了 `IF EXISTS` 子句，则当列不存在时，查询不会返回错误。

更改类型时，值会像应用 [toType](/sql-reference/functions/type-conversion-functions.md) 函数一样进行转换。如果只是更改了默认表达式，则查询不会执行任何复杂操作，并且几乎瞬间完成。

示例：

```sql
ALTER TABLE visits MODIFY COLUMN browser Array(String)
```

更改列类型是唯一复杂的操作——它会更改包含数据的文件的内容。对于大型表，这可能需要很长时间。

查询还可以使用 `FIRST | AFTER` 子句更改列的顺序，请参见 [ADD COLUMN](#add-column) 描述，但在这种情况下列类型是必需的。

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

`ALTER` 查询是原子的。对于 MergeTree 表，它还不需要锁定。

对列进行更改的 `ALTER` 查询是可复制的。指令保存在 ZooKeeper 中，然后每个副本应用它们。所有 `ALTER` 查询按相同顺序运行。查询等待其他副本完成相应操作。但是，在一个副本表中更改列的查询可能会被中断，所有操作将异步执行。

## MODIFY COLUMN REMOVE {#modify-column-remove}

移除列的一个属性： `DEFAULT`、`ALIAS`、`MATERIALIZED`、`CODEC`、`COMMENT`、`TTL`、`SETTINGS`。

语法：

```sql
ALTER TABLE table_name MODIFY COLUMN column_name REMOVE property;
```

**示例**

移除 TTL：

```sql
ALTER TABLE table_with_ttl MODIFY COLUMN column_ttl REMOVE TTL;
```

**另请参阅**

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

重置列设置，并从表的 CREATE 查询中删除设置声明。

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

物化带有 `DEFAULT` 或 `MATERIALIZED` 值表达式的列。当使用 `ALTER TABLE table_name ADD COLUMN column_name MATERIALIZED` 添加物化列时，现有行中没有物化值不会自动填充。可以使用 `MATERIALIZE COLUMN` 语句在添加或更新了 (仅更新了元数据，但不更改现有数据) `DEFAULT` 或 `MATERIALIZED` 表达式后重写现有列数据。请注意，在排序键中物化列是无效操作，因为它可能会破坏排序顺序。
实现为 [突变](/sql-reference/statements/alter/index.md#mutations)。

对于具有新或更新的 `MATERIALIZED` 值表达式的列，所有现有行将被重写。

对于具有新或更新的 `DEFAULT` 值表达式的列，则行为取决于 ClickHouse 版本：
- 在 ClickHouse < v24.2 中，所有现有行都将被重写。
- 在 ClickHouse >= v24.2 中，区分在插入时是否明确指定了 `DEFAULT` 值表达式的某行值，或者不是，即通过 `DEFAULT` 值表达式计算的。如果值是明确指定的，ClickHouse 将保持不变。如果值是计算得出的，ClickHouse 将其更改为新的或更新的 `MATERIALIZED` 值表达式。

语法：

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] MATERIALIZE COLUMN col [IN PARTITION partition | IN PARTITION ID 'partition_id'];
```
- 如果指定了 PARTITION，则仅对指定分区物化列。

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

- [MATERIALIZED](/sql-reference/statements/create/view#materialized-view)。

## 限制 {#limitations}

`ALTER` 查询允许您创建和删除嵌套数据结构中的单独元素（列），但不支持整个嵌套数据结构。要添加嵌套数据结构，可以添加名称似乎 `name.nested_name` 且类型为 `Array(T)` 的列。嵌套数据结构相当于多个数组列，它们的名称在点之前具有相同的前缀。

不支持删除主键或采样键中的列（在 `ENGINE` 表达式中使用的列）。仅当这项更改不会导致数据被修改时，才能更改包含在主键中的列的类型（例如，允许向 Enum 添加值或将类型从 `DateTime` 更改为 `UInt32`）。

如果 `ALTER` 查询不足以完成您所需的表更改，可以创建一个新表，将数据通过 [INSERT SELECT](/sql-reference/statements/insert-into.md/#inserting-the-results-of-select) 查询复制到其中，然后使用 [RENAME](/sql-reference/statements/rename.md/#rename-table) 查询切换表并删除旧表。

`ALTER` 查询会阻塞对该表的所有读取和写入。换句话说，如果在 `ALTER` 查询时运行了长时间的 `SELECT`，则 `ALTER` 查询将等待它完成。与此同时，所有对同一表的新查询将在执行此 `ALTER` 时等待。

对于不自己存储数据的表（例如 [Merge](/sql-reference/statements/alter/index.md) 和 [Distributed](/sql-reference/statements/alter/index.md)），`ALTER` 仅更改表结构，而不更改从属表的结构。例如，在 `Distributed` 表上运行 ALTER 时，您还需要对所有远程服务器上的表运行 `ALTER`。
