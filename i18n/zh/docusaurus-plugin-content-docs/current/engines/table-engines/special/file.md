---
slug: /engines/table-engines/special/file
sidebar_position: 40
sidebar_label:  文件
title: "文件表引擎"
description: "文件表引擎将数据保存在其中一种支持的文件格式 (`TabSeparated`, `Native` 等) 的文件中。"
---


# 文件表引擎

文件表引擎将数据保存在其中一种支持的 [文件格式](/interfaces/formats#formats-overview) (`TabSeparated`, `Native` 等) 的文件中。

使用场景：

- 从 ClickHouse 导出数据到文件。
- 将数据从一种格式转换为另一种格式。
- 通过编辑磁盘上的文件在 ClickHouse 中更新数据。

:::note
此引擎目前在 ClickHouse Cloud 中不可用，请 [改用 S3 表函数](/sql-reference/table-functions/s3.md)。
:::

## 在 ClickHouse 服务器中的使用 {#usage-in-clickhouse-server}

``` sql
File(Format)
```

`Format` 参数指定可用的文件格式之一。要执行 `SELECT` 查询，格式必须支持输入，而要执行 `INSERT` 查询，则必须支持输出。可用格式列在 [格式](/interfaces/formats#formats-overview) 部分。

ClickHouse 不允许为 `File` 指定文件系统路径。它将使用在服务器配置中的 [path](../../../operations/server-configuration-parameters/settings.md) 设置定义的文件夹。

使用 `File(Format)` 创建表时，它会在该文件夹中创建一个空子目录。当数据写入该表时，它会放入该子目录中的 `data.Format` 文件中。

您可以手动在服务器文件系统中创建此子文件夹和文件，然后通过 [ATTACH](../../../sql-reference/statements/attach.md) 将其附加到匹配名称的表信息，以便您可以从该文件查询数据。

:::note
请小心使用此功能，因为 ClickHouse 不会跟踪对这些文件的外部更改。通过 ClickHouse 和 ClickHouse 之外的同时写入的结果是未定义的。
:::

## 示例 {#example}

**1.** 设置 `file_engine_table` 表：

``` sql
CREATE TABLE file_engine_table (name String, value UInt32) ENGINE=File(TabSeparated)
```

默认情况下，ClickHouse 将创建文件夹 `/var/lib/clickhouse/data/default/file_engine_table`。

**2.** 手动创建 `/var/lib/clickhouse/data/default/file_engine_table/data.TabSeparated`，内容为：

``` bash
$ cat data.TabSeparated
one 1
two 2
```

**3.** 查询数据：

``` sql
SELECT * FROM file_engine_table
```

``` text
┌─name─┬─value─┐
│ one  │     1 │
│ two  │     2 │
└──────┴───────┘
```

## 在 ClickHouse-local 中的使用 {#usage-in-clickhouse-local}

在 [clickhouse-local](../../../operations/utilities/clickhouse-local.md) 中，File 引擎除了 `Format` 外还接受文件路径。默认的输入/输出流可以使用数字或人类可读的名称如 `0` 或 `stdin`，`1` 或 `stdout` 指定。可以基于附加引擎参数或文件扩展名（`gz`，`br` 或 `xz`）读取和写入压缩文件。

**示例：**

``` bash
$ echo -e "1,2\n3,4" | clickhouse-local -q "CREATE TABLE table (a Int64, b Int64) ENGINE = File(CSV, stdin); SELECT a, b FROM table; DROP TABLE table"
```

## 实现细节 {#details-of-implementation}

- 可以同时执行多个 `SELECT` 查询，但 `INSERT` 查询将相互等待。
- 支持通过 `INSERT` 查询创建新文件。
- 如果文件存在，`INSERT` 将在其中附加新值。
- 不支持：
    - `ALTER`
    - `SELECT ... SAMPLE`
    - 索引
    - 复制

## PARTITION BY {#partition-by}

`PARTITION BY` — 可选。可以通过对分区键进行分区来创建单独的文件。在大多数情况下，您不需要分区键，如果需要，通常不需要比按月更精细的分区键。分区不会加速查询（与 ORDER BY 表达式相反）。您永远不应使用过于细粒度的分区。不要根据客户标识符或名称对数据进行分区（而是将客户标识符或名称作为 ORDER BY 表达式中的第一列）。

对于按月分区，使用 `toYYYYMM(date_column)` 表达式，其中 `date_column` 是 [Date](/sql-reference/data-types/date.md) 类型的日期列。这里的分区名称采用 `"YYYYMM"` 格式。

## 虚拟列 {#virtual-columns}

- `_path` — 文件的路径。类型：`LowCardinality(String)`。
- `_file` — 文件名。类型：`LowCardinality(String)`。
- `_size` — 文件大小（以字节为单位）。类型：`Nullable(UInt64)`。如果大小未知，则值为 `NULL`。
- `_time` — 文件的最后修改时间。类型：`Nullable(DateTime)`。如果时间未知，则值为 `NULL`。

## 设置 {#settings}

- [engine_file_empty_if_not_exists](/operations/settings/settings#engine_file_empty_if_not_exists) - 允许从不存在的文件中选择空数据。默认情况下禁用。
- [engine_file_truncate_on_insert](/operations/settings/settings#engine_file_truncate_on_insert) - 允许在插入之前截断文件。默认情况下禁用。
- [engine_file_allow_create_multiple_files](/operations/settings/settings.md#engine_file_allow_create_multiple_files) - 如果格式有后缀，则允许在每次插入时创建新文件。默认情况下禁用。
- [engine_file_skip_empty_files](/operations/settings/settings.md#engine_file_skip_empty_files) - 允许在读取时跳过空文件。默认情况下禁用。
- [storage_file_read_method](/operations/settings/settings#engine_file_empty_if_not_exists) - 从存储文件读取数据的方法，可以是：`read`，`pread`，`mmap`。`mmap` 方法不适用于 clickhouse-server（它是为了 clickhouse-local 而设计的）。默认值：`clickhouse-server` 的 `pread`，`clickhouse-local` 的 `mmap`。
