---
description: 'File 表引擎将数据以受支持的文件格式之一（`TabSeparated`、`Native` 等）存储在文件中。'
sidebar_label: 'File'
sidebar_position: 40
slug: /engines/table-engines/special/file
title: 'File 表引擎'
doc_type: 'reference'
---



# File 表引擎

File 表引擎将数据存储在单个文件中，其格式为受支持的[文件格式](/interfaces/formats#formats-overview)之一（`TabSeparated`、`Native` 等）。

使用场景：

- 将数据从 ClickHouse 导出到文件。
- 将数据从一种格式转换为另一种格式。
- 通过编辑磁盘上的文件来更新 ClickHouse 中的数据。

:::note
此引擎目前在 ClickHouse Cloud 中不可用，请[改用 S3 表函数](/sql-reference/table-functions/s3.md)。
:::



## 在 ClickHouse 服务器中使用 {#usage-in-clickhouse-server}

```sql
File(Format)
```

`Format` 参数用于指定可用的文件格式之一。执行 `SELECT` 查询时,格式必须支持输入;执行 `INSERT` 查询时,格式必须支持输出。可用格式列表请参见 [Formats](/interfaces/formats#formats-overview) 部分。

ClickHouse 不允许为 `File` 指定文件系统路径。它将使用服务器配置中 [path](../../../operations/server-configuration-parameters/settings.md) 设置所定义的文件夹。

使用 `File(Format)` 创建表时,会在该文件夹中创建一个空的子目录。当向该表写入数据时,数据将被存放到该子目录中的 `data.Format` 文件中。

您可以在服务器文件系统中手动创建此子文件夹和文件,然后使用 [ATTACH](../../../sql-reference/statements/attach.md) 将其附加到名称匹配的表,从而可以查询该文件中的数据。

:::note
使用此功能时请务必小心,因为 ClickHouse 不会跟踪对这些文件的外部更改。通过 ClickHouse 和在 ClickHouse 外部同时写入的结果是未定义的。
:::


## 示例 {#example}

**1.** 创建 `file_engine_table` 表:

```sql
CREATE TABLE file_engine_table (name String, value UInt32) ENGINE=File(TabSeparated)
```

默认情况下,ClickHouse 会创建目录 `/var/lib/clickhouse/data/default/file_engine_table`。

**2.** 手动创建 `/var/lib/clickhouse/data/default/file_engine_table/data.TabSeparated` 文件,包含以下内容:

```bash
$ cat data.TabSeparated
one 1
two 2
```

**3.** 查询数据:

```sql
SELECT * FROM file_engine_table
```

```text
┌─name─┬─value─┐
│ one  │     1 │
│ two  │     2 │
└──────┴───────┘
```


## 在 ClickHouse-local 中使用 {#usage-in-clickhouse-local}

在 [clickhouse-local](../../../operations/utilities/clickhouse-local.md) 中,File 引擎除了 `Format` 参数外,还接受文件路径参数。默认输入/输出流可以使用数字或可读性更好的名称来指定,如 `0` 或 `stdin`、`1` 或 `stdout`。可以根据额外的引擎参数或文件扩展名(`gz`、`br` 或 `xz`)读写压缩文件。

**示例:**

```bash
$ echo -e "1,2\n3,4" | clickhouse-local -q "CREATE TABLE table (a Int64, b Int64) ENGINE = File(CSV, stdin); SELECT a, b FROM table; DROP TABLE table"
```


## 实现细节 {#details-of-implementation}

- 多个 `SELECT` 查询可以并发执行,但 `INSERT` 查询会相互等待。
- 支持通过 `INSERT` 查询创建新文件。
- 如果文件已存在,`INSERT` 会将新值追加到文件中。
- 不支持以下功能:
  - `ALTER`
  - `SELECT ... SAMPLE`
  - 索引
  - 复制


## PARTITION BY {#partition-by}

`PARTITION BY` — 可选项。可以通过分区键对数据进行分区,从而创建独立的文件。在大多数情况下,您不需要分区键;即使需要,通常也不需要比按月更细的分区粒度。分区不会加快查询速度(这与 ORDER BY 表达式不同)。切勿使用过细的分区粒度。不要按客户端标识符或名称对数据进行分区(应将客户端标识符或名称作为 ORDER BY 表达式的第一列)。

对于按月分区,使用 `toYYYYMM(date_column)` 表达式,其中 `date_column` 是 [Date](/sql-reference/data-types/date.md) 类型的日期列。分区名称格式为 `"YYYYMM"`。


## 虚拟列 {#virtual-columns}

- `_path` — 文件路径。类型：`LowCardinality(String)`。
- `_file` — 文件名称。类型：`LowCardinality(String)`。
- `_size` — 文件大小(以字节为单位)。类型：`Nullable(UInt64)`。如果大小未知,则值为 `NULL`。
- `_time` — 文件最后修改时间。类型：`Nullable(DateTime)`。如果时间未知,则值为 `NULL`。


## 设置 {#settings}

- [engine_file_empty_if_not_exists](/operations/settings/settings#engine_file_empty_if_not_exists) - 允许从不存在的文件中查询空数据。默认禁用。
- [engine_file_truncate_on_insert](/operations/settings/settings#engine_file_truncate_on_insert) - 允许在插入数据前清空文件。默认禁用。
- [engine_file_allow_create_multiple_files](/operations/settings/settings.md#engine_file_allow_create_multiple_files) - 当格式带有后缀时,允许每次插入时创建新文件。默认禁用。
- [engine_file_skip_empty_files](/operations/settings/settings.md#engine_file_skip_empty_files) - 允许在读取时跳过空文件。默认禁用。
- [storage_file_read_method](/operations/settings/settings#engine_file_empty_if_not_exists) - 从存储文件读取数据的方法,可选值:`read`、`pread`、`mmap`。mmap 方法不适用于 clickhouse-server(仅用于 clickhouse-local)。默认值:clickhouse-server 使用 `pread`,clickhouse-local 使用 `mmap`。
