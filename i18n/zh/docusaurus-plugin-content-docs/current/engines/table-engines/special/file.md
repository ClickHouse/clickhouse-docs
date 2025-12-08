---
description: 'File 表引擎将数据保存在采用受支持的文件格式（`TabSeparated`、`Native` 等）之一的文件中。'
sidebar_label: 'File'
sidebar_position: 40
slug: /engines/table-engines/special/file
title: 'File 表引擎'
doc_type: 'reference'
---

# File 表引擎 {#file-table-engine}

`File` 表引擎将数据保存在一个文件中，文件使用受支持的[文件格式](/interfaces/formats#formats-overview)之一（如 `TabSeparated`、`Native` 等）。

使用场景：

- 将数据从 ClickHouse 导出到文件。
- 将数据从一种格式转换为另一种格式。
- 通过编辑磁盘上的文件来更新 ClickHouse 中的数据。

:::note
该引擎目前在 ClickHouse Cloud 中不可用，请[改用 S3 表函数](/sql-reference/table-functions/s3.md)。
:::

## 在 ClickHouse 服务器中的使用 {#usage-in-clickhouse-server}

```sql
File(Format)
```

`Format` 参数指定可用文件格式之一。要执行 `SELECT` 查询，该格式必须支持输入；要执行 `INSERT` 查询，该格式必须支持输出。可用格式列在 [Formats](/interfaces/formats#formats-overview) 部分。

ClickHouse 不允许为 `File` 指定文件系统路径。它将使用服务器配置中 [path](../../../operations/server-configuration-parameters/settings.md) 设置所定义的目录。

使用 `File(Format)` 创建表时，会在该目录中创建一个空的子目录。将数据写入该表时，数据会被写入该子目录中的 `data.Format` 文件。

你可以在服务器文件系统中手动创建这个子目录和文件，然后使用与其名称匹配的表信息对其执行 [ATTACH](../../../sql-reference/statements/attach.md) 操作，这样就可以从该文件中查询数据。

:::note
请谨慎使用此功能，因为 ClickHouse 不会跟踪对此类文件的外部修改。通过 ClickHouse 和 ClickHouse 之外同时对其进行写入的结果是未定义的。
:::

## 示例 {#example}

**1.** 创建 `file_engine_table` 表：

```sql
CREATE TABLE file_engine_table (name String, value UInt32) ENGINE=File(TabSeparated)
```

默认情况下，ClickHouse 会在 `/var/lib/clickhouse/data/default/file_engine_table` 创建目录。

**2.** 手动创建文件 `/var/lib/clickhouse/data/default/file_engine_table/data.TabSeparated`，并写入以下内容：

```bash
$ cat data.TabSeparated
one 1
two 2
```

**3.** 查询数据：

```sql
SELECT * FROM file_engine_table
```

```text
┌─name─┬─value─┐
│ one  │     1 │
│ two  │     2 │
└──────┴───────┘
```

## 在 ClickHouse-local 中的用法 {#usage-in-clickhouse-local}

在 [clickhouse-local](../../../operations/utilities/clickhouse-local.md) 中，File 引擎除了 `Format` 外还可以接收文件路径。可以使用数字或人类可读的名称（例如 `0` 或 `stdin`、`1` 或 `stdout`）来指定默认输入/输出流。可以根据额外的引擎参数或文件扩展名（`gz`、`br` 或 `xz`）来读写压缩文件。

**示例：**

```bash
$ echo -e "1,2\n3,4" | clickhouse-local -q "CREATE TABLE table (a Int64, b Int64) ENGINE = File(CSV, stdin); SELECT a, b FROM table; DROP TABLE table"
```

## 实现细节 {#details-of-implementation}

- 可以并发执行多个 `SELECT` 查询，但各个 `INSERT` 查询之间会互相等待。
- 支持通过 `INSERT` 查询创建新文件。
- 如果文件已存在，`INSERT` 会向其中追加新数据。
- 不支持：
  - `ALTER`
  - `SELECT ... SAMPLE`
  - 索引
  - 复制

## PARTITION BY {#partition-by}

`PARTITION BY` — 可选。可以按分区键对数据进行分区，从而生成各自独立的文件。在大多数情况下，不需要分区键；即便需要，一般也不需要比按月更细的分区粒度。分区并不会加速查询（与 ORDER BY 表达式不同）。绝不应该使用过于细粒度的分区。不要按客户端标识符或名称对数据进行分区（相反，应将客户端标识符或名称作为 ORDER BY 表达式中的第一列）。

要按月进行分区，使用 `toYYYYMM(date_column)` 表达式，其中 `date_column` 是一个类型为 [Date](/sql-reference/data-types/date.md) 的日期列。此时分区名称采用 `"YYYYMM"` 格式。

## 虚拟列 {#virtual-columns}

- `_path` — 文件路径。类型：`LowCardinality(String)`。
- `_file` — 文件名。类型：`LowCardinality(String)`。
- `_size` — 文件大小（以字节为单位）。类型：`Nullable(UInt64)`。如果大小未知，则值为 `NULL`。
- `_time` — 文件的最后修改时间。类型：`Nullable(DateTime)`。如果时间未知，则值为 `NULL`。

## 设置 {#settings}

- [engine_file_empty_if_not_exists](/operations/settings/settings#engine_file_empty_if_not_exists) - 允许在文件不存在时返回空结果。默认禁用。
- [engine_file_truncate_on_insert](/operations/settings/settings#engine_file_truncate_on_insert) - 允许在插入数据前截断文件。默认禁用。
- [engine_file_allow_create_multiple_files](/operations/settings/settings.md#engine_file_allow_create_multiple_files) - 如果格式带有后缀，允许在每次插入时创建一个新文件。默认禁用。
- [engine_file_skip_empty_files](/operations/settings/settings.md#engine_file_skip_empty_files) - 允许在读取时跳过空文件。默认禁用。
- [storage_file_read_method](/operations/settings/settings#engine_file_empty_if_not_exists) - 从存储文件读取数据的方法，可选值：`read`、`pread`、`mmap`。`mmap` 方法不适用于 clickhouse-server（用于 clickhouse-local）。默认值：clickhouse-server 为 `pread`，clickhouse-local 为 `mmap`。
