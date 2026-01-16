---
description: 'INSERT INTO 语句文档'
sidebar_label: 'INSERT INTO'
sidebar_position: 33
slug: /sql-reference/statements/insert-into
title: 'INSERT INTO 语句'
doc_type: '参考'
---

# INSERT INTO 语句 \{#insert-into-statement\}

将数据插入表中。

**语法**

```sql
INSERT INTO [TABLE] [db.]table [(c1, c2, c3)] [SETTINGS ...] VALUES (v11, v12, v13), (v21, v22, v23), ...
```

你可以使用 `(c1, c2, c3)` 指定要插入的列列表。你也可以使用带有列[匹配器](../../sql-reference/statements/select/index.md#asterisk)（例如 `*`）和/或[修饰符](../../sql-reference/statements/select/index.md#select-modifiers)（如 [APPLY](/sql-reference/statements/select/apply-modifier)、[EXCEPT](/sql-reference/statements/select/except-modifier)、[REPLACE](/sql-reference/statements/select/replace-modifier)）的表达式。

例如，考虑如下所示的表：

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

如果你想向除列 `b` 之外的所有列插入数据，可以使用 `EXCEPT` 关键字。参考上面的语法，你需要确保插入的值个数（`VALUES (v11, v13)`）与指定的列数（`(c1, c3)`）一致：

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

在这个示例中，我们可以看到第二行插入的数据中，`a` 和 `c` 列由传入的值填充，而 `b` 列使用默认值。也可以使用 `DEFAULT` 关键字来插入默认值：

```sql
INSERT INTO insert_select_testtable VALUES (1, DEFAULT, 1) ;
```

如果列名列表未包含所有现有列，其余列将被填充为：

* 表定义中 `DEFAULT` 表达式计算得到的值。
* 当未定义 `DEFAULT` 表达式时，填充为 0 和空字符串。

INSERT 语句可以接收 ClickHouse 支持的任意[格式](/sql-reference/formats)的数据。必须在查询中显式指定格式：

```sql
INSERT INTO [db.]table [(c1, c2, c3)] FORMAT format_name data_set
```

例如，以下查询格式与 `INSERT ... VALUES` 的基本形式完全相同：

```sql
INSERT INTO [db.]table [(c1, c2, c3)] FORMAT Values (v11, v12, v13), (v21, v22, v23), ...
```

ClickHouse 会在数据之前移除所有前导空格以及一个换行符（如果存在）。在构造查询时，我们建议将数据放在查询语句中运算符之后的下一行，这在数据以空格开头时尤为重要。

示例：

```sql
INSERT INTO t FORMAT TabSeparated
11  Hello, world!
22  Qwerty
```

你可以使用[命令行客户端](/operations/utilities/clickhouse-local)或 [HTTP 接口](/interfaces/http) 在查询之外单独插入数据。

:::note
如果你想为 `INSERT` 查询指定 `SETTINGS`，必须在 `FORMAT` 子句 *之前* 进行设置，因为在 `FORMAT format_name` 之后的所有内容都会被视为数据。例如：

```sql
INSERT INTO table SETTINGS ... FORMAT format_name data_set
```

:::


## 约束 \\{#constraints\\}

如果表定义了[约束](../../sql-reference/statements/create/table.md#constraints)，则会针对插入数据的每一行检查相应的约束表达式。如果任一约束未被满足，服务器将抛出一个包含约束名称和表达式的异常，并停止执行该查询。

## 插入 SELECT 查询结果 \{#inserting-the-results-of-select\}

**语法**

```sql
INSERT INTO [TABLE] [db.]table [(c1, c2, c3)] SELECT ...
```

列是根据它们在 `SELECT` 子句中的位置进行映射的。但是，它们在 `SELECT` 表达式中的名称与用于 `INSERT` 的表中的名称可能不同。如有必要，会执行类型转换。

除 Values 格式外，其他任何数据格式都不允许将值指定为诸如 `now()`、`1 + 2` 等表达式。Values 格式允许有限地使用表达式，但不推荐这样做，因为在这种情况下会使用效率较低的代码来执行这些表达式。

不支持其他用于修改分区片段的查询：`UPDATE`、`DELETE`、`REPLACE`、`MERGE`、`UPSERT`、`INSERT UPDATE`。
但是，你可以通过 `ALTER TABLE ... DROP PARTITION` 删除旧数据。

如果 `SELECT` 子句包含表函数 [input()](../../sql-reference/table-functions/input.md)，则必须在查询末尾指定 `FORMAT` 子句。

要在向具有非 Nullable 数据类型的列中插入 `NULL` 时改为写入默认值，请启用 [insert&#95;null&#95;as&#95;default](../../operations/settings/settings.md#insert_null_as_default) 设置。

`INSERT` 也支持 CTE（公用表表达式）。例如，以下两个语句是等价的：

```sql
INSERT INTO x WITH y AS (SELECT * FROM numbers(10)) SELECT * FROM y;
WITH y AS (SELECT * FROM numbers(10)) INSERT INTO x SELECT * FROM y;
```


## 从文件中插入数据 \{#inserting-data-from-a-file\}

**语法**

```sql
INSERT INTO [TABLE] [db.]table [(c1, c2, c3)] FROM INFILE file_name [COMPRESSION type] [SETTINGS ...] [FORMAT format_name]
```

使用上述语法从存储在**客户端**本地的一个或多个文件中插入数据。`file_name` 和 `type` 是字符串字面量。输入文件的[格式](../../interfaces/formats.md)必须在 `FORMAT` 子句中设置。

支持压缩文件。压缩类型通过文件名扩展名自动检测，也可以在 `COMPRESSION` 子句中显式指定。支持的类型包括：`'none'`、`'gzip'`、`'deflate'`、`'br'`、`'xz'`、`'zstd'`、`'lz4'`、`'bz2'`。

此功能可在[命令行客户端](../../interfaces/cli.md)和 [clickhouse-local](../../operations/utilities/clickhouse-local.md) 中使用。

**示例**


### 使用 FROM INFILE 的单个文件 \{#single-file-with-from-infile\}

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


### 使用通配符的多文件 FROM INFILE \{#multiple-files-with-from-infile-using-globs\}

此示例与上一个非常相似，不过这里是通过 `FROM INFILE 'input_*.csv'` 从多个文件中插入数据。

```bash
echo 1,A > input_1.csv ; echo 2,B > input_2.csv
clickhouse-client --query="CREATE TABLE infile_globs (id UInt32, text String) ENGINE=MergeTree() ORDER BY id;"
clickhouse-client --query="INSERT INTO infile_globs FROM INFILE 'input_*.csv' FORMAT CSV;"
clickhouse-client --query="SELECT * FROM infile_globs FORMAT PrettyCompact;"
```

:::tip
除了使用 `*` 来选择多个文件之外，你还可以使用范围（`{1,2}` 或 `{1..9}`）以及其他 [glob 通配模式](/sql-reference/table-functions/file.md/#globs-in-path)。在上面的示例中，下面这三种写法都可以使用：

```sql
INSERT INTO infile_globs FROM INFILE 'input_*.csv' FORMAT CSV;
INSERT INTO infile_globs FROM INFILE 'input_{1,2}.csv' FORMAT CSV;
INSERT INTO infile_globs FROM INFILE 'input_?.csv' FORMAT CSV;
```

:::


## 使用表函数插入数据 \{#inserting-using-a-table-function\}

可以向由[表函数](../../sql-reference/table-functions/index.md)引用的表中插入数据。

**语法**

```sql
INSERT INTO [TABLE] FUNCTION table_func ...
```

**示例**

在以下查询中使用 [remote](/sql-reference/table-functions/remote) 表函数：

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


## 在 ClickHouse Cloud 中插入数据 \{#inserting-into-clickhouse-cloud\}

默认情况下，ClickHouse Cloud 上的服务会提供多个副本以实现高可用性。当连接到某个服务时，连接会建立到这些副本中的一个。

当一次 `INSERT` 成功后，数据会被写入到底层存储。不过，副本接收并应用这些更新可能需要一定时间。因此，如果你使用不同的连接在其他副本上执行 `SELECT` 查询，更新后的数据可能尚未体现。

可以使用 `select_sequential_consistency` 来强制副本接收最新更新。下面是一个使用此设置的 `SELECT` 查询示例：

```sql
SELECT .... SETTINGS select_sequential_consistency = 1;
```

请注意，使用 `select_sequential_consistency` 会增加 ClickHouse Keeper（ClickHouse Cloud 内部使用的组件）的负载，并且可能会视该服务的负载情况导致性能下降。除非确有必要，否则我们不建议启用此设置。推荐的做法是在同一会话中执行读写操作，或者使用基于原生协议（从而支持粘性连接）的客户端驱动程序。


## 在复制部署中执行插入 \\{#inserting-into-a-replicated-setup\\}

在复制部署中，数据在完成复制后才会在其他副本上可见。`INSERT` 执行后，会立即开始复制过程（在其他副本上下载数据）。这与 ClickHouse Cloud 不同，后者会将数据直接写入共享存储，由副本订阅元数据变更。

请注意，对于复制部署，`INSERT` 操作有时可能会花费相当长的时间（大约一秒量级），因为它需要向 ClickHouse Keeper 提交以完成分布式共识。将 S3 用作存储也会引入额外的延迟。

## 性能注意事项 \\{#performance-considerations\\}

`INSERT` 会按照主键对输入数据进行排序，并根据分区键将其拆分为多个分区。如果一次性向多个分区插入数据，可能会显著降低 `INSERT` 查询的性能。为避免这种情况：

- 以相对较大的批次添加数据，例如每次 100,000 行。
- 在将数据导入 ClickHouse 之前，先按分区键对数据进行分组。

在以下情况下，性能不会下降：

- 以实时方式添加数据。
- 导入的数据通常已经按时间排序。

### 异步插入 \\{#asynchronous-inserts\\}

可以通过小批量但高频率的方式异步插入数据。这类插入产生的数据会被合并成批次，然后安全地插入到表中。要使用异步插入，请启用 [`async_insert`](/operations/settings/settings#async_insert) 设置。

使用 `async_insert` 或 [`Buffer` 表引擎](/engines/table-engines/special/buffer) 会引入额外的缓冲。

### 大量或长时间运行的插入 \\{#large-or-long-running-inserts\\}

当插入大量数据时，ClickHouse 会通过称为“合并（squashing）”的过程来优化写入性能。内存中插入的小数据块会先被合并成更大的数据块，然后再写入磁盘。合并可以减少与每次写入操作相关的开销。在此过程中，当 ClickHouse 完成写入每 [`max_insert_block_size`](/operations/settings/settings#max_insert_block_size) 行数据后，插入的数据就可以被查询。

**另请参阅**

- [async_insert](/operations/settings/settings#async_insert)
- [wait_for_async_insert](/operations/settings/settings#wait_for_async_insert)
- [wait_for_async_insert_timeout](/operations/settings/settings#wait_for_async_insert_timeout)
- [async_insert_max_data_size](/operations/settings/settings#async_insert_max_data_size)
- [async_insert_busy_timeout_ms](/operations/settings/settings#async_insert_busy_timeout_max_ms)
- [async_insert_stale_timeout_ms](/operations/settings/settings#async_insert_max_data_size)