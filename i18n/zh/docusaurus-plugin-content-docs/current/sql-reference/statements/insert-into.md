---
description: 'INSERT INTO 语句文档'
sidebar_label: 'INSERT INTO'
sidebar_position: 33
slug: /sql-reference/statements/insert-into
title: 'INSERT INTO 语句'
doc_type: 'reference'
---



# INSERT INTO 语句

将数据插入表中。

**语法**

```sql
INSERT INTO [TABLE] [db.]table [(c1, c2, c3)] [SETTINGS ...] VALUES (v11, v12, v13), (v21, v22, v23), ...
```

你可以使用 `(c1, c2, c3)` 来指定要插入的列列表。你也可以使用带有列[匹配器](../../sql-reference/statements/select/index.md#asterisk)（例如 `*`）的表达式，以及/或者使用带有[修饰符](../../sql-reference/statements/select/index.md#select-modifiers)（例如 [APPLY](/sql-reference/statements/select/apply-modifier)、[EXCEPT](/sql-reference/statements/select/except-modifier)、[REPLACE](/sql-reference/statements/select/replace-modifier)）的表达式。

例如，考虑如下表：

```sql
SHOW CREATE insert_select_testtable;
```

```text
CREATE TABLE insert_select_testtable
(
    `a` Int8,
    `b` String,
    `c` Int8
)
ENGINE = MergeTree()
ORDER BY a
```

```sql
INSERT INTO insert_select_testtable (*) VALUES (1, 'a', 1) ;
```

如果你想向除列 `b` 之外的所有列插入数据，可以使用 `EXCEPT` 关键字。结合上面的语法，你需要确保插入的值的数量（`VALUES (v11, v13)`）与指定的列的数量（`(c1, c3)`）一致：

```sql
INSERT INTO insert_select_testtable (* EXCEPT(b)) Values (2, 2);
```

```sql
SELECT * FROM insert_select_testtable;
```

```text
┌─a─┬─b─┬─c─┐
│ 2 │   │ 2 │
└───┴───┴───┘
┌─a─┬─b─┬─c─┐
│ 1 │ a │ 1 │
└───┴───┴───┘
```

在此示例中，我们可以看到第二条插入的记录中，`a` 和 `c` 列由提供的值填充，而 `b` 列则使用默认值填充。也可以使用 `DEFAULT` 关键字来插入默认值：

```sql
INSERT INTO insert_select_testtable VALUES (1, DEFAULT, 1) ;
```

如果列列表未包含所有现有列，其余列将被填充为：

* 在表定义中由 `DEFAULT` 表达式计算得到的值。
* 如果未定义 `DEFAULT` 表达式，则填充为零和空字符串。

可以以 ClickHouse 支持的任意[格式](/sql-reference/formats)向 INSERT 语句传递数据。必须在查询中显式指定格式：

```sql
INSERT INTO [db.]table [(c1, c2, c3)] FORMAT format_name data_set
```

例如，以下查询格式与 `INSERT ... VALUES` 的基本形式完全相同：

```sql
INSERT INTO [db.]table [(c1, c2, c3)] FORMAT Values (v11, v12, v13), (v21, v22, v23), ...
```

ClickHouse 会在数据之前移除所有空格以及一个换行符（如果存在）。在编写查询时，我们建议在查询运算符之后将数据放在新的一行上；如果数据以空格开头，这一点尤为重要。

示例：

```sql
INSERT INTO t FORMAT TabSeparated
11  你好，世界！
22  Qwerty
```

您可以使用 [命令行客户端](/operations/utilities/clickhouse-local) 或 [HTTP 接口](/interfaces/http/) 在查询之外单独插入数据。

:::note
如果要为 `INSERT` 查询指定 `SETTINGS`，则必须在 `FORMAT` 子句*之前*进行指定，因为在 `FORMAT format_name` 之后的所有内容都会被当作数据处理。例如：

```sql
INSERT INTO table SETTINGS ... FORMAT format_name data_set
```

:::


## 约束 {#constraints}

如果表定义了[约束](../../sql-reference/statements/create/table.md#constraints),则会对插入数据的每一行检查其约束表达式。如果任何约束条件不满足,服务器将抛出包含约束名称和表达式的异常,并停止查询。


## 插入 SELECT 的结果 {#inserting-the-results-of-select}

**语法**

```sql
INSERT INTO [TABLE] [db.]table [(c1, c2, c3)] SELECT ...
```

列根据它们在 `SELECT` 子句中的位置进行映射。但是,`SELECT` 表达式中的列名和 `INSERT` 目标表中的列名可以不同。必要时会执行类型转换。

除 Values 格式外,其他数据格式都不允许将值设置为表达式,例如 `now()`、`1 + 2` 等。Values 格式允许有限地使用表达式,但不建议这样做,因为这种情况下会使用低效的代码来执行。

不支持其他修改数据部分的查询:`UPDATE`、`DELETE`、`REPLACE`、`MERGE`、`UPSERT`、`INSERT UPDATE`。
但是,可以使用 `ALTER TABLE ... DROP PARTITION` 删除旧数据。

如果 `SELECT` 子句包含表函数 [input()](../../sql-reference/table-functions/input.md),则必须在查询末尾指定 `FORMAT` 子句。

要将默认值而不是 `NULL` 插入到非空数据类型的列中,请启用 [insert_null_as_default](../../operations/settings/settings.md#insert_null_as_default) 设置。

`INSERT` 还支持 CTE(公共表表达式)。例如,以下两个语句是等效的:

```sql
INSERT INTO x WITH y AS (SELECT * FROM numbers(10)) SELECT * FROM y;
WITH y AS (SELECT * FROM numbers(10)) INSERT INTO x SELECT * FROM y;
```


## 从文件插入数据 {#inserting-data-from-a-file}

**语法**

```sql
INSERT INTO [TABLE] [db.]table [(c1, c2, c3)] FROM INFILE file_name [COMPRESSION type] [SETTINGS ...] [FORMAT format_name]
```

使用上述语法从存储在**客户端**的一个或多个文件中插入数据。`file_name` 和 `type` 是字符串字面量。必须在 `FORMAT` 子句中指定输入文件的[格式](../../interfaces/formats.md)。

支持压缩文件。压缩类型可通过文件扩展名自动检测,也可以在 `COMPRESSION` 子句中显式指定。支持的类型包括:`'none'`、`'gzip'`、`'deflate'`、`'br'`、`'xz'`、`'zstd'`、`'lz4'`、`'bz2'`。

此功能在[命令行客户端](../../interfaces/cli.md)和 [clickhouse-local](../../operations/utilities/clickhouse-local.md) 中可用。

**示例**

### 使用 FROM INFILE 插入单个文件 {#single-file-with-from-infile}

使用[命令行客户端](../../interfaces/cli.md)执行以下查询:

```bash
echo 1,A > input.csv ; echo 2,B >> input.csv
clickhouse-client --query="CREATE TABLE table_from_file (id UInt32, text String) ENGINE=MergeTree() ORDER BY id;"
clickhouse-client --query="INSERT INTO table_from_file FROM INFILE 'input.csv' FORMAT CSV;"
clickhouse-client --query="SELECT * FROM table_from_file FORMAT PrettyCompact;"
```

结果:

```text
┌─id─┬─text─┐
│  1 │ A    │
│  2 │ B    │
└────┴──────┘
```

### 使用 FROM INFILE 和通配符插入多个文件 {#multiple-files-with-from-infile-using-globs}

此示例与前一个非常相似,但使用 `FROM INFILE 'input_*.csv` 从多个文件执行插入。

```bash
echo 1,A > input_1.csv ; echo 2,B > input_2.csv
clickhouse-client --query="CREATE TABLE infile_globs (id UInt32, text String) ENGINE=MergeTree() ORDER BY id;"
clickhouse-client --query="INSERT INTO infile_globs FROM INFILE 'input_*.csv' FORMAT CSV;"
clickhouse-client --query="SELECT * FROM infile_globs FORMAT PrettyCompact;"
```

:::tip
除了使用 `*` 选择多个文件外,还可以使用范围(`{1,2}` 或 `{1..9}`)和其他[通配符替换](/sql-reference/table-functions/file.md/#globs-in-path)。以下三种方式都适用于上述示例:

```sql
INSERT INTO infile_globs FROM INFILE 'input_*.csv' FORMAT CSV;
INSERT INTO infile_globs FROM INFILE 'input_{1,2}.csv' FORMAT CSV;
INSERT INTO infile_globs FROM INFILE 'input_?.csv' FORMAT CSV;
```

:::


## 使用表函数插入数据 {#inserting-using-a-table-function}

可以通过[表函数](../../sql-reference/table-functions/index.md)向表中插入数据。

**语法**

```sql
INSERT INTO [TABLE] FUNCTION table_func ...
```

**示例**

以下查询使用了 [remote](/sql-reference/table-functions/remote) 表函数:

```sql
CREATE TABLE simple_table (id UInt32, text String) ENGINE=MergeTree() ORDER BY id;
INSERT INTO TABLE FUNCTION remote('localhost', default.simple_table)
    VALUES (100, 'inserted via remote()');
SELECT * FROM simple_table;
```

结果:

```text
┌──id─┬─text──────────────────┐
│ 100 │ inserted via remote() │
└─────┴───────────────────────┘
```


## 向 ClickHouse Cloud 插入数据 {#inserting-into-clickhouse-cloud}

默认情况下,ClickHouse Cloud 服务提供多个副本以实现高可用性。当您连接到服务时,会与其中一个副本建立连接。

`INSERT` 成功后,数据会写入底层存储。但是,副本接收这些更新可能需要一些时间。因此,如果您使用不同的连接在其他副本上执行 `SELECT` 查询,更新后的数据可能尚未体现。

可以使用 `select_sequential_consistency` 设置来强制副本接收最新更新。以下是使用此设置的 `SELECT` 查询示例:

```sql
SELECT .... SETTINGS select_sequential_consistency = 1;
```

请注意,使用 `select_sequential_consistency` 会增加 ClickHouse Keeper(ClickHouse Cloud 内部使用)的负载,并可能导致性能下降,具体取决于服务的负载情况。除非必要,否则我们不建议启用此设置。推荐的做法是在同一会话中执行读写操作,或使用支持原生协议的客户端驱动程序(从而支持粘性连接)。


## 向副本集群插入数据 {#inserting-into-a-replicated-setup}

在副本集群中,数据完成复制后才会在其他副本上可见。`INSERT` 操作执行后,数据会立即开始复制(下载到其他副本)。这与 ClickHouse Cloud 不同,ClickHouse Cloud 会立即将数据写入共享存储,各副本通过订阅元数据变更来获取数据。

请注意,在副本集群中,`INSERT` 操作有时可能需要较长时间(约一秒左右),因为需要提交到 ClickHouse Keeper 以达成分布式共识。使用 S3 作为存储也会增加额外的延迟。


## 性能注意事项 {#performance-considerations}

`INSERT` 会按主键对输入数据进行排序,并按分区键将数据拆分到不同分区中。如果同时向多个分区插入数据,可能会显著降低 `INSERT` 查询的性能。为避免这种情况:

- 以较大的批次添加数据,例如每次 100,000 行。
- 在上传到 ClickHouse 之前按分区键对数据进行分组。

在以下情况下性能不会下降:

- 实时添加数据。
- 上传的数据通常按时间排序。

### 异步插入 {#asynchronous-inserts}

可以通过小批量但频繁的插入来异步插入数据。来自此类插入的数据会被组合成批次,然后安全地插入到表中。要使用异步插入,请启用 [`async_insert`](/operations/settings/settings#async_insert) 设置。

使用 `async_insert` 或 [`Buffer` 表引擎](/engines/table-engines/special/buffer)会产生额外的缓冲。

### 大批量或长时间运行的插入 {#large-or-long-running-inserts}

当插入大量数据时,ClickHouse 会通过一个称为"压缩合并"(squashing)的过程来优化写入性能。内存中的小数据块会被合并并压缩成更大的块,然后再写入磁盘。压缩合并减少了与每次写入操作相关的开销。在此过程中,插入的数据将在 ClickHouse 完成写入每 [`max_insert_block_size`](/operations/settings/settings#max_insert_block_size) 行后可供查询。

**另请参阅**

- [async_insert](/operations/settings/settings#async_insert)
- [wait_for_async_insert](/operations/settings/settings#wait_for_async_insert)
- [wait_for_async_insert_timeout](/operations/settings/settings#wait_for_async_insert_timeout)
- [async_insert_max_data_size](/operations/settings/settings#async_insert_max_data_size)
- [async_insert_busy_timeout_ms](/operations/settings/settings#async_insert_busy_timeout_max_ms)
- [async_insert_stale_timeout_ms](/operations/settings/settings#async_insert_max_data_size)
