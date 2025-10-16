---
'description': 'INSERT INTO 语句的文档'
'sidebar_label': 'INSERT INTO'
'sidebar_position': 33
'slug': '/sql-reference/statements/insert-into'
'title': 'INSERT INTO 语句'
'doc_type': 'reference'
---


# INSERT INTO 语句

向表中插入数据。

**语法**

```sql
INSERT INTO [TABLE] [db.]table [(c1, c2, c3)] [SETTINGS ...] VALUES (v11, v12, v13), (v21, v22, v23), ...
```

您可以使用 `(c1, c2, c3)` 指定要插入的列列表。您还可以使用列 [匹配器](../../sql-reference/statements/select/index.md#asterisk) 表达式，例如 `*` 和/或 [修饰符](../../sql-reference/statements/select/index.md#select-modifiers)，例如 [APPLY](/sql-reference/statements/select/apply-modifier)，[EXCEPT](/sql-reference/statements/select/except-modifier)，[REPLACE](/sql-reference/statements/select/replace-modifier)。

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

如果您想向除列 `b` 之外的所有列插入数据，可以使用 `EXCEPT` 关键字。参考上面的语法，您需要确保插入的值（`VALUES (v11, v13)`）与您指定的列（`(c1, c3)`）数量相同：

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

在这个例子中，我们看到第二行插入行的 `a` 和 `c` 列由传递的值填充，而 `b` 列则填充了默认值。也可以使用 `DEFAULT` 关键字插入默认值：

```sql
INSERT INTO insert_select_testtable VALUES (1, DEFAULT, 1) ;
```

如果列列表不包含所有现有列，其余的列将填充：

- 在表定义中指定的 `DEFAULT` 表达式计算出的值。
- 如果未定义 `DEFAULT` 表达式，则填充零和空字符串。

数据可以以 ClickHouse 支持的任何 [格式](/sql-reference/formats) 传递给 INSERT。格式必须在查询中显式指定：

```sql
INSERT INTO [db.]table [(c1, c2, c3)] FORMAT format_name data_set
```

例如，以下查询格式与 `INSERT ... VALUES` 的基本版本相同：

```sql
INSERT INTO [db.]table [(c1, c2, c3)] FORMAT Values (v11, v12, v13), (v21, v22, v23), ...
```

ClickHouse 会在数据之前删除所有空格和一个换行符（如果存在）。在形成查询时，我们建议将数据放在查询操作符之后的新行中，这在数据以空格开头时特别重要。

示例：

```sql
INSERT INTO t FORMAT TabSeparated
11  Hello, world!
22  Qwerty
```

您可以使用 [命令行客户端](/operations/utilities/clickhouse-local) 或 [HTTP 接口](/interfaces/http/) 分开从查询中插入数据。

:::note
如果您要为 `INSERT` 查询指定 `SETTINGS`，则必须在 `FORMAT` 子句 _之前_ 进行，因为在 `FORMAT format_name` 之后的所有内容都被视为数据。例如：

```sql
INSERT INTO table SETTINGS ... FORMAT format_name data_set
```
:::

## 约束 {#constraints}

如果表具有 [约束](../../sql-reference/statements/create/table.md#constraints)，则将检查插入数据的每一行的表达式。如果未满足任何这些约束，则服务器将引发包含约束名称和表达式的异常，查询将停止。

## 从 SELECT 插入结果 {#inserting-the-results-of-select}

**语法**

```sql
INSERT INTO [TABLE] [db.]table [(c1, c2, c3)] SELECT ...
```

列按其在 `SELECT` 子句中的位置进行映射。但是，它们在 `SELECT` 表达式和用于 `INSERT` 的表中的名称可能不同。如果需要，将执行类型转换。

除 Values 格式外，没有数据格式允许将值设置为 `now()`、`1 + 2` 等表达式。Values 格式允许有限使用表达式，但不推荐这样做，因为在这种情况下使用的是低效的代码来执行它们。

不支持其他修改数据部分的查询：`UPDATE`、`DELETE`、`REPLACE`、`MERGE`、`UPSERT`、`INSERT UPDATE`。
但是，您可以使用 `ALTER TABLE ... DROP PARTITION` 删除旧数据。

如果 `SELECT` 子句包含表函数 [input()](../../sql-reference/table-functions/input.md)，则必须在查询的末尾指定 `FORMAT` 子句。

要向具有非空数据类型的列插入默认值而不是 `NULL`，请启用 [insert_null_as_default](../../operations/settings/settings.md#insert_null_as_default) 设置。

`INSERT` 还支持 CTE（公用表表达式）。例如，以下两个语句是等效的：

```sql
INSERT INTO x WITH y AS (SELECT * FROM numbers(10)) SELECT * FROM y;
WITH y AS (SELECT * FROM numbers(10)) INSERT INTO x SELECT * FROM y;
```

## 从文件插入数据 {#inserting-data-from-a-file}

**语法**

```sql
INSERT INTO [TABLE] [db.]table [(c1, c2, c3)] FROM INFILE file_name [COMPRESSION type] [SETTINGS ...] [FORMAT format_name]
```

使用上述语法从存储在 **客户端** 侧的文件或文件中插入数据。`file_name` 和 `type` 是字符串字面量。输入文件的 [格式](../../interfaces/formats.md) 必须在 `FORMAT` 子句中设置。

支持压缩文件。压缩类型通过文件名的扩展名检测。或者可以在 `COMPRESSION` 子句中显式指定。支持的类型有：`'none'`、`'gzip'`、`'deflate'`、`'br'`、`'xz'`、`'zstd'`、`'lz4'`、`'bz2'`。

该功能在 [命令行客户端](../../interfaces/cli.md) 和 [clickhouse-local](../../operations/utilities/clickhouse-local.md) 中可用。

**示例**

### 使用 FROM INFILE 插入单个文件 {#single-file-with-from-infile}

使用 [命令行客户端](../../interfaces/cli.md) 执行以下查询：

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

### 使用通配符从 FILE 插入多个文件 {#multiple-files-with-from-infile-using-globs}

该示例与前一个示例非常相似，但使用 `FROM INFILE 'input_*.csv` 从多个文件中进行插入。

```bash
echo 1,A > input_1.csv ; echo 2,B > input_2.csv
clickhouse-client --query="CREATE TABLE infile_globs (id UInt32, text String) ENGINE=MergeTree() ORDER BY id;"
clickhouse-client --query="INSERT INTO infile_globs FROM INFILE 'input_*.csv' FORMAT CSV;"
clickhouse-client --query="SELECT * FROM infile_globs FORMAT PrettyCompact;"
```

:::tip
除了使用 `*` 选择多个文件外，您还可以使用范围（`{1,2}` 或 `{1..9}`）和其他 [通配符替换](/sql-reference/table-functions/file.md/#globs-in-path)。这三种方法都适用于上面的示例：

```sql
INSERT INTO infile_globs FROM INFILE 'input_*.csv' FORMAT CSV;
INSERT INTO infile_globs FROM INFILE 'input_{1,2}.csv' FORMAT CSV;
INSERT INTO infile_globs FROM INFILE 'input_?.csv' FORMAT CSV;
```
:::

## 使用表函数插入 {#inserting-using-a-table-function}

数据可以插入到由 [表函数](../../sql-reference/table-functions/index.md) 引用的表中。

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

默认情况下，ClickHouse Cloud 上的服务提供多个副本以提高可用性。当您连接到服务时，会与这些副本中的一个建立连接。

在 `INSERT` 成功后，数据会写入底层存储。但是，副本接收这些更新可能需要一些时间。因此，如果您使用不同的连接在这些其他副本之一上执行 `SELECT` 查询，则更新数据可能尚未反映出来。

可以使用 `select_sequential_consistency` 强制副本接收最新更新。以下是使用此设置的 `SELECT` 查询示例：

```sql
SELECT .... SETTINGS select_sequential_consistency = 1;
```

请注意，使用 `select_sequential_consistency` 会增加 ClickHouse Keeper（ClickHouse Cloud 内部使用）上的负载，可能导致性能降低，具体取决于服务的负载。除非必要，我们不建议启用此设置。建议的方法是在同一会话中执行读/写，或使用使用本地协议的客户端驱动程序（因此支持粘性连接）。

## 插入到复制设置 {#inserting-into-a-replicated-setup}

在复制设置中，数据将在复制后在其他副本上可见。数据在 `INSERT` 后立即开始复制（下载到其他副本）。这与 ClickHouse Cloud 不同，在 ClickHouse Cloud 中，数据会立即写入共享存储，副本会订阅元数据更改。

请注意，对于复制设置，`INSERT` 有时可能需要相当长的时间（大约一秒），因为需要提交给 ClickHouse Keeper 以实现分布式共识。使用 S3 作为存储也会增加额外延迟。

## 性能考虑 {#performance-considerations}

`INSERT` 按主键对输入数据进行排序，并按分区键将其拆分为分区。如果您同时向多个分区插入数据，则可能会显著降低 `INSERT` 查询的性能。为避免这种情况：

- 批量添加相当大的数据，例如每次 100,000 行。
- 在将数据上传到 ClickHouse 之前按分区键对数据进行分组。

如果：

- 实时添加数据。
- 上传的数据显示出时间上的排序。

则性能不会降低。

### 异步插入 {#asynchronous-inserts}

可以以小而频繁的插入方式异步插入数据。此类插入的数据会合并为批次，然后安全地插入到表中。要使用异步插入，请启用 [`async_insert`](/operations/settings/settings#async_insert) 设置。

使用 `async_insert` 或 [`Buffer` 表引擎](/engines/table-engines/special/buffer) 会导致额外的缓冲。

### 大量或长时间运行的插入 {#large-or-long-running-inserts}

当您插入大量数据时，ClickHouse 将通过一个称为 "合并" 的过程优化写入性能。内存中插入的小块数据会合并并压缩成更大的块，然后写入磁盘。合并减少每个写入操作的开销。在此过程中，插入的数据将在 ClickHouse 完成写入每个 [`max_insert_block_size`](/operations/settings/settings#max_insert_block_size) 行后可用以查询。

**另请参见**

- [async_insert](/operations/settings/settings#async_insert)
- [wait_for_async_insert](/operations/settings/settings#wait_for_async_insert)
- [wait_for_async_insert_timeout](/operations/settings/settings#wait_for_async_insert_timeout)
- [async_insert_max_data_size](/operations/settings/settings#async_insert_max_data_size)
- [async_insert_busy_timeout_ms](/operations/settings/settings#async_insert_busy_timeout_max_ms)
- [async_insert_stale_timeout_ms](/operations/settings/settings#async_insert_max_data_size)
