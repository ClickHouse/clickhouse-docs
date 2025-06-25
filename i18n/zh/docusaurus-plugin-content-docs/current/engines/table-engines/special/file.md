---
'description': '文件表引擎以受支持的文件格式（`TabSeparated`、`Native` 等）保持数据在文件中。'
'sidebar_label': '文件'
'sidebar_position': 40
'slug': '/engines/table-engines/special/file'
'title': '文件表引擎'
---


# 文件表引擎

文件表引擎将数据保存在支持的 [文件格式](/interfaces/formats#formats-overview)（`TabSeparated`、`Native` 等）中的文件中。

使用场景：

- 从 ClickHouse 导出数据到文件。
- 将数据从一种格式转换为另一种格式。
- 通过在磁盘上编辑文件来更新 ClickHouse 中的数据。

:::note
此引擎当前在 ClickHouse Cloud 中不可用，请 [改用 S3 表函数](/sql-reference/table-functions/s3.md)。
:::

## 在 ClickHouse 服务器中的使用 {#usage-in-clickhouse-server}

```sql
File(Format)
```

`Format` 参数指定可用的文件格式之一。要执行 `SELECT` 查询，格式必须支持输入；要执行 `INSERT` 查询，格式必须支持输出。可用格式列在 [格式](/interfaces/formats#formats-overview) 部分。

ClickHouse 不允许为 `File` 指定文件系统路径。它将使用服务器配置中通过 [path](../../../operations/server-configuration-parameters/settings.md) 设置定义的文件夹。

使用 `File(Format)` 创建表时，会在该文件夹中创建一个空子目录。将数据写入该表时，数据将被放入该子目录中的 `data.Format` 文件中。

您可以手动在服务器文件系统中创建此子文件夹和文件，然后 [ATTACH](../../../sql-reference/statements/attach.md) 到具有匹配名称的表信息，这样您就可以查询该文件中的数据。

:::note
请谨慎使用此功能，因为 ClickHouse 不会跟踪对这些文件的外部更改。通过 ClickHouse 和 ClickHouse 外部的同时写入结果是未定义的。
:::

## 示例 {#example}

**1.** 设置 `file_engine_table` 表：

```sql
CREATE TABLE file_engine_table (name String, value UInt32) ENGINE=File(TabSeparated)
```

默认情况下，ClickHouse 会在 `/var/lib/clickhouse/data/default/file_engine_table` 下创建文件夹。

**2.** 手动创建 `/var/lib/clickhouse/data/default/file_engine_table/data.TabSeparated`，内容为：

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

## 在 ClickHouse-local 中的使用 {#usage-in-clickhouse-local}

在 [clickhouse-local](../../../operations/utilities/clickhouse-local.md) 中，文件引擎除了接受 `Format` 之外，还接受文件路径。可以使用数字或人类可读的名称（如 `0` 或 `stdin`，`1` 或 `stdout`）指定默认的输入/输出流。可以通过附加的引擎参数或文件扩展名（`gz`、`br` 或 `xz`）来读取和写入压缩文件。

**示例：**

```bash
$ echo -e "1,2\n3,4" | clickhouse-local -q "CREATE TABLE table (a Int64, b Int64) ENGINE = File(CSV, stdin); SELECT a, b FROM table; DROP TABLE table"
```

## 实现细节 {#details-of-implementation}

- 可以并发执行多个 `SELECT` 查询，但 `INSERT` 查询会相互等待。
- 支持通过 `INSERT` 查询创建新文件。
- 如果文件已存在，`INSERT` 将在其中追加新值。
- 不支持：
    - `ALTER`
    - `SELECT ... SAMPLE`
    - 索引
    - 复制

## 分区 {#partition-by}

`PARTITION BY` — 可选。 可以通过对分区键进行分区，来创建单独的文件。在大多数情况下，您不需要分区键，如果需要，通常不需要比按月份更细粒度的分区。分区不会加速查询（与 ORDER BY 表达式相比）。您永远不应该使用过于细粒度的分区。不要按客户标识符或名称对数据进行分区（而是让客户标识符或名称成为 ORDER BY 表达式中的第一列）。

要按月份分区，请使用 `toYYYYMM(date_column)` 表达式，其中 `date_column` 是类型为 [Date](/sql-reference/data-types/date.md) 的日期列。此处分区名称采用 `"YYYYMM"` 格式。

## 虚拟列 {#virtual-columns}

- `_path` — 文件路径。类型：`LowCardinality(String)`。
- `_file` — 文件名。类型：`LowCardinality(String)`。
- `_size` — 文件大小（以字节为单位）。类型：`Nullable(UInt64)`。如果大小未知，值为 `NULL`。
- `_time` — 文件的最后修改时间。类型：`Nullable(DateTime)`。如果时间未知，值为 `NULL`。

## 设置 {#settings}

- [engine_file_empty_if_not_exists](/operations/settings/settings#engine_file_empty_if_not_exists) - 允许从不存在的文件中选择空数据。默认禁用。
- [engine_file_truncate_on_insert](/operations/settings/settings#engine_file_truncate_on_insert) - 允许在插入之前截断文件。默认禁用。
- [engine_file_allow_create_multiple_files](/operations/settings/settings.md#engine_file_allow_create_multiple_files) - 如果格式有后缀，则允许在每次插入时创建新文件。默认禁用。
- [engine_file_skip_empty_files](/operations/settings/settings.md#engine_file_skip_empty_files) - 允许在读取时跳过空文件。默认禁用。
- [storage_file_read_method](/operations/settings/settings.md#engine_file_empty_if_not_exists) - 从存储文件读取数据的方法，值为 `read`、`pread`、`mmap` 之一。mmap 方法不适用于 clickhouse-server（它用于 clickhouse-local）。默认值：对于 clickhouse-server 是 `pread`，对于 clickhouse-local 是 `mmap`。
