---
'description': 'Documentation for INSERT INTO Statement'
'sidebar_label': 'INSERT INTO'
'sidebar_position': 33
'slug': '/sql-reference/statements/insert-into'
'title': 'INSERT INTO Statement'
---




# INSERT INTO 语句

将数据插入表中。

**语法**

```sql
INSERT INTO [TABLE] [db.]table [(c1, c2, c3)] [SETTINGS ...] VALUES (v11, v12, v13), (v21, v22, v23), ...
```

您可以使用 `(c1, c2, c3)` 指定要插入的列列表。您还可以使用带有列 [matcher](../../sql-reference/statements/select/index.md#asterisk) 的表达式，例如 `*` 和/或 [modifiers](../../sql-reference/statements/select/index.md#select-modifiers)，例如 [APPLY](/sql-reference/statements/select#apply)、[EXCEPT](/sql-reference/statements/select#except)、[REPLACE](/sql-reference/statements/select#replace)。

例如，考虑以下表：

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

如果您想在插入数据时省略列 `b`，可以使用 `EXCEPT` 关键字。参考上述语法，您需要确保插入的值 (`VALUES (v11, v13)`) 的数量与您指定的列 (`(c1, c3)`) 的数量一致：

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

在这个例子中，我们看到插入的第二行中，`a` 和 `c` 列由传递的值填充，而 `b` 列则填充了默认值。还可以使用 `DEFAULT` 关键字插入默认值：

```sql
INSERT INTO insert_select_testtable VALUES (1, DEFAULT, 1) ;
```

如果列列表未包含所有现有列，其余列将会填充为：

- 表定义中指定的 `DEFAULT` 表达式计算的值。
- 如果未定义 `DEFAULT` 表达式，则填充为零和空字符串。

数据可以以 ClickHouse 支持的任何 [format](/sql-reference/formats) 格式传递给 INSERT。格式必须在查询中明确指定：

```sql
INSERT INTO [db.]table [(c1, c2, c3)] FORMAT format_name data_set
```

例如，以下查询格式与基本版本的 `INSERT ... VALUES` 相同：

```sql
INSERT INTO [db.]table [(c1, c2, c3)] FORMAT Values (v11, v12, v13), (v21, v22, v23), ...
```

ClickHouse 会在数据之前去除所有空格及换行符（如果有）。在形成查询时，我们建议将数据放在查询操作符之后的新行上，这在数据以空格开头时非常重要。

示例：

```sql
INSERT INTO t FORMAT TabSeparated
11  Hello, world!
22  Qwerty
```

您还可以通过使用 [command-line client](/operations/utilities/clickhouse-local) 或 [HTTP interface](/interfaces/http/) 单独插入数据。

:::note
如果您想为 `INSERT` 查询指定 `SETTINGS`，则必须在 `FORMAT` 子句之前进行设置，因为在 `FORMAT format_name` 之后的内容会被视为数据。例如：

```sql
INSERT INTO table SETTINGS ... FORMAT format_name data_set
```
:::

## 约束 {#constraints}

如果表具有 [constraints](../../sql-reference/statements/create/table.md#constraints)，则会对插入数据的每一行检查其表达式。如果满足任何约束，则服务器会引发包含约束名称和表达式的异常，并且查询会被停止。

## 从 SELECT 插入结果 {#inserting-the-results-of-select}

**语法**

```sql
INSERT INTO [TABLE] [db.]table [(c1, c2, c3)] SELECT ...
```

列根据它们在 `SELECT` 子句中的位置进行映射。然而，它们在 `SELECT` 表达式以及用于 `INSERT` 的表中的名称可能不同。如果必要，将进行类型转换。

除 Values 格式外，其他数据格式不允许将值设置为表达式，例如 `now()`、`1 + 2` 等。Values 格式允许有限的表达式使用，但不推荐使用，因为在这种情况下，会使用效率较低的代码来执行它们。

其他用于修改数据部分的查询不受支持：`UPDATE`、`DELETE`、`REPLACE`、`MERGE`、`UPSERT`、`INSERT UPDATE`。
但是，您可以使用 `ALTER TABLE ... DROP PARTITION` 删除旧数据。

如果 `SELECT` 子句包含表函数 [input()](../../sql-reference/table-functions/input.md)，则 `FORMAT` 子句必须在查询的末尾指定。

要在具有非空数据类型的列中插入默认值而不是 `NULL`，请启用 [insert_null_as_default](../../operations/settings/settings.md#insert_null_as_default) 设置。

`INSERT` 还支持 CTE（公共表表达式）。例如，以下两个语句是等效的：

```sql
INSERT INTO x WITH y AS (SELECT * FROM numbers(10)) SELECT * FROM y;
WITH y AS (SELECT * FROM numbers(10)) INSERT INTO x SELECT * FROM y;
```

## 从文件插入数据 {#inserting-data-from-a-file}

**语法**

```sql
INSERT INTO [TABLE] [db.]table [(c1, c2, c3)] FROM INFILE file_name [COMPRESSION type] [SETTINGS ...] [FORMAT format_name]
```

使用上面的语法从存储在 **客户端** 侧的文件中插入数据。`file_name` 和 `type` 是字符串字面量。输入文件 [format](../../interfaces/formats.md) 必须在 `FORMAT` 子句中设置。

支持压缩文件。压缩类型由文件名的扩展名检测。或者可以在 `COMPRESSION` 子句中明确定义。支持的类型有：`'none'`、`'gzip'`、`'deflate'`、`'br'`、`'xz'`、`'zstd'`、`'lz4'`、`'bz2'`。

此功能可在 [command-line client](../../interfaces/cli.md) 和 [clickhouse-local](../../operations/utilities/clickhouse-local.md) 中使用。

**示例**

### 使用 FROM INFILE 的单个文件 {#single-file-with-from-infile}

使用 [command-line client](../../interfaces/cli.md) 执行以下查询：

```bash
echo 1,A > input.csv ; echo 2,B >> input.csv
clickhouse-client --query="CREATE TABLE table_from_file (id UInt32, text String) ENGINE=MergeTree() ORDER BY id;"
clickhouse-client --query="INSERT INTO table_from_file FROM INFILE 'input.csv' FORMAT CSV;"
clickhouse-client --query="SELECT * FROM table_from_file FORMAT PrettyCompact;"
```

结果：

```text
┌─id─┬─text─┐
│  1 │ A    │
│  2 │ B    │
└────┴──────┘
```

### 使用通配符从多个文件插入数据 {#multiple-files-with-from-infile-using-globs}

此示例与前一个示例非常相似，但使用 `FROM INFILE 'input_*.csv` 从多个文件插入数据。

```bash
echo 1,A > input_1.csv ; echo 2,B > input_2.csv
clickhouse-client --query="CREATE TABLE infile_globs (id UInt32, text String) ENGINE=MergeTree() ORDER BY id;"
clickhouse-client --query="INSERT INTO infile_globs FROM INFILE 'input_*.csv' FORMAT CSV;"
clickhouse-client --query="SELECT * FROM infile_globs FORMAT PrettyCompact;"
```

:::tip
除了用 `*` 选择多个文件之外，您还可以使用范围（`{1,2}` 或 `{1..9}`）和其他 [glob substitutions](/sql-reference/table-functions/file.md/#globs-in-path)。这三个都可以与上述示例一起使用：

```sql
INSERT INTO infile_globs FROM INFILE 'input_*.csv' FORMAT CSV;
INSERT INTO infile_globs FROM INFILE 'input_{1,2}.csv' FORMAT CSV;
INSERT INTO infile_globs FROM INFILE 'input_?.csv' FORMAT CSV;
```
:::

## 使用表函数插入 {#inserting-using-a-table-function}

数据可以插入通过 [table functions](../../sql-reference/table-functions/index.md) 引用的表中。

**语法**

```sql
INSERT INTO [TABLE] FUNCTION table_func ...
```

**示例**

在以下查询中使用了 [remote](/sql-reference/table-functions/remote) 表函数：

```sql
CREATE TABLE simple_table (id UInt32, text String) ENGINE=MergeTree() ORDER BY id;
INSERT INTO TABLE FUNCTION remote('localhost', default.simple_table)
    VALUES (100, 'inserted via remote()');
SELECT * FROM simple_table;
```

结果：

```text
┌──id─┬─text──────────────────┐
│ 100 │ inserted via remote() │
└─────┴───────────────────────┘
```

## 插入到 ClickHouse Cloud {#inserting-into-clickhouse-cloud}

默认情况下，ClickHouse Cloud 上的服务提供多个副本以实现高可用性。当您连接到某个服务时，会建立与这些副本中的一个的连接。

成功的 `INSERT` 后，数据将写入基础存储。不过，副本接收这些更新可能需要一些时间。因此，如果您使用不同的连接在这些其他副本上执行 `SELECT` 查询，则更新的数据可能尚未反映。

可以使用 `select_sequential_consistency` 强制副本接收最新的更新。以下是使用此设置的 `SELECT` 查询示例：

```sql
SELECT .... SETTINGS select_sequential_consistency = 1;
```

注意，使用 `select_sequential_consistency` 会增加 ClickHouse Keeper（ClickHouse Cloud 内部使用）上的负载，并可能根据服务的负载导致性能下降。我们建议在没有必要的情况下不要启用该设置。推荐的方法是在同一会话中执行读/写操作，或使用支持本机协议的客户端驱动程序（因此支持粘性连接）。

## 插入到复制设置中 {#inserting-into-a-replicated-setup}

在复制设置中，数据在复制后会在其他副本上可见。数据在 `INSERT` 后立即开始被复制（下载到其他副本）。这与 ClickHouse Cloud 不同，在 ClickHouse Cloud 中，数据会立即写入共享存储，而副本会订阅元数据的更改。

注意，对于复制设置，`INSERT` 有时可能需要相当长的时间（大约一秒），因为它需要向 ClickHouse Keeper 提交分布式一致性。使用 S3 存储也会增加额外的延迟。

## 性能考虑 {#performance-considerations}

`INSERT` 会根据主键对输入数据进行排序，并按分区键将其划分为分区。如果您一次将数据插入多个分区，可能会显著降低 `INSERT` 查询的性能。为避免这种情况：

- 以相对较大的批次添加数据，例如每次 100,000 行。
- 在将数据上传到 ClickHouse 之前，按分区键对数据进行分组。

如果满足以下条件，则性能不会下降：

- 实时添加数据。
- 上传的数据通常按时间排序。

### 异步插入 {#asynchronous-inserts}

可以异步插入小但频繁的数据。此类插入的数据合并成批，然后安全地插入表中。要使用异步插入，请启用 [`async_insert`](/operations/settings/settings#async_insert) 设置。

使用 `async_insert` 或 [`Buffer` 表引擎](/engines/table-engines/special/buffer) 会导致额外的缓冲。

### 大量或长时间的插入 {#large-or-long-running-inserts}

当您插入大量数据时，ClickHouse 将通过一种称为“压缩”的过程优化写入性能。内存中插入的数据的小块会合并并压缩成较大的块，然后写入磁盘。压缩减少了每次写入操作的开销。在此过程中，插入的数据将在 ClickHouse 完成每 [`max_insert_block_size`](/operations/settings/settings#max_insert_block_size) 行的写入后可用于查询。

**另请参阅**

- [async_insert](/operations/settings/settings#async_insert)
- [wait_for_async_insert](/operations/settings/settings#wait_for_async_insert)
- [wait_for_async_insert_timeout](/operations/settings/settings#wait_for_async_insert_timeout)
- [async_insert_max_data_size](/operations/settings/settings#async_insert_max_data_size)
- [async_insert_busy_timeout_ms](/operations/settings/settings#async_insert_busy_timeout_max_ms)
- [async_insert_stale_timeout_ms](/operations/settings/settings#async_insert_max_data_size)
