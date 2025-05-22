import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# file 表函数

一种表引擎，提供类似于从文件中 SELECT 和 INSERT 的表状接口，类似于 [s3](/sql-reference/table-functions/url.md) 表函数。在处理本地文件时使用 `file()`，在处理如 S3、GCS 或 MinIO 这样的对象存储桶时使用 `s3()`。

`file` 函数可以用于 `SELECT` 和 `INSERT` 查询，以读取或写入文件。

## 语法 {#syntax}

```sql
file([path_to_archive ::] path [,format] [,structure] [,compression])
```

## 参数 {#arguments}

| 参数              | 描述                                                                                                                                                                                                                                                                                             |
|-------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `path`            | 从 [user_files_path](operations/server-configuration-parameters/settings.md#user_files_path) 的相对路径。以只读模式支持以下 [globs](#globs-in-path): `*`、`?`、`{abc,def}`（其中 `'abc'` 和 `'def'` 为字符串）和 `{N..M}`（其中 `N` 和 `M` 为数字）。                          |
| `path_to_archive` | zip/tar/7z 压缩档案的相对路径。支持与 `path` 相同的 glob。                                                                                                                                                                                                                                               |
| `format`          | 文件的 [format](/interfaces/formats)。                                                                                                                                                                                                                                                                  |
| `structure`       | 表的结构。格式为：`'column1_name column1_type, column2_name column2_type, ...'`。                                                                                                                                                                                                                          |
| `compression`     | 在 `SELECT` 查询中使用时为现有压缩类型，或在 `INSERT` 查询中使用时为期望的压缩类型。支持的压缩类型为 `gz`、`br`、`xz`、`zst`、`lz4` 和 `bz2`。                                                                                                                                                          |

## 返回值 {#returned_value}

用于从文件读取或向文件写入数据的表。

## 写入文件的示例 {#examples-for-writing-to-a-file}

### 写入 TSV 文件 {#write-to-a-tsv-file}

```sql
INSERT INTO TABLE FUNCTION
file('test.tsv', 'TSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
VALUES (1, 2, 3), (3, 2, 1), (1, 3, 2)
```

结果，数据写入到文件 `test.tsv` 中：

```bash

# cat /var/lib/clickhouse/user_files/test.tsv
1    2    3
3    2    1
1    3    2
```

### 分区写入多个 TSV 文件 {#partitioned-write-to-multiple-tsv-files}

如果在将数据插入类型为 `file()` 的表函数时指定了 `PARTITION BY` 表达式，则为每个分区创建一个单独的文件。将数据拆分为单独文件有助于提高读取操作的性能。

```sql
INSERT INTO TABLE FUNCTION
file('test_{_partition_id}.tsv', 'TSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
PARTITION BY column3
VALUES (1, 2, 3), (3, 2, 1), (1, 3, 2)
```

结果，数据写入到三个文件中：`test_1.tsv`、`test_2.tsv` 和 `test_3.tsv`。

```bash

# cat /var/lib/clickhouse/user_files/test_1.tsv
3    2    1


# cat /var/lib/clickhouse/user_files/test_2.tsv
1    3    2


# cat /var/lib/clickhouse/user_files/test_3.tsv
1    2    3
```

## 从文件读取的示例 {#examples-for-reading-from-a-file}

### 从 CSV 文件 SELECT {#select-from-a-csv-file}

首先，在服务器配置中设置 `user_files_path` 并准备一个文件 `test.csv`：

```bash
$ grep user_files_path /etc/clickhouse-server/config.xml
    <user_files_path>/var/lib/clickhouse/user_files/</user_files_path>

$ cat /var/lib/clickhouse/user_files/test.csv
    1,2,3
    3,2,1
    78,43,45
```

然后，将数据从 `test.csv` 读取到一个表中，并选择其前两行：

```sql
SELECT * FROM
file('test.csv', 'CSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
LIMIT 2;
```

```text
┌─column1─┬─column2─┬─column3─┐
│       1 │       2 │       3 │
│       3 │       2 │       1 │
└─────────┴─────────┴─────────┘
```

### 从文件插入数据到表中 {#inserting-data-from-a-file-into-a-table}

```sql
INSERT INTO FUNCTION
file('test.csv', 'CSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
VALUES (1, 2, 3), (3, 2, 1);
```
```sql
SELECT * FROM
file('test.csv', 'CSV', 'column1 UInt32, column2 UInt32, column3 UInt32');
```

```text
┌─column1─┬─column2─┬─column3─┐
│       1 │       2 │       3 │
│       3 │       2 │       1 │
└─────────┴─────────┴─────────┘
```

从 `archive1.zip` 或/及 `archive2.zip` 中读取名为 `table.csv` 的数据：

```sql
SELECT * FROM file('user_files/archives/archive{1..2}.zip :: table.csv');
```

## 路径中的 Globs {#globs-in-path}

路径可以使用 globbing。文件必须匹配整个路径模式，而不仅仅是后缀或前缀。唯一的例外是，如果路径引用的是现有的目录并且不使用 glob，则会隐式地将 `*` 添加到路径中，以便选择目录中的所有文件。

- `*` — 表示任意多个字符，除了 `/` 之外但包括空字符串。
- `?` — 表示一个任意单字符。
- `{some_string,another_string,yet_another_one}` — 替换字符串 `'some_string'`、`'another_string'`、`'yet_another_one'` 中的任意一个。字符串可以包含 `/` 符号。
- `{N..M}` — 表示任何数字 `>= N` 和 `<= M`。
- `**` - 表示文件夹内的所有文件（递归）。

带有 `{}` 的构造与 [remote](remote.md) 和 [hdfs](hdfs.md) 表函数相似。

## 示例 {#examples}

**示例**

假设有以下文件及其相对路径：

- `some_dir/some_file_1`
- `some_dir/some_file_2`
- `some_dir/some_file_3`
- `another_dir/some_file_1`
- `another_dir/some_file_2`
- `another_dir/some_file_3`

查询所有文件的行数总和：

```sql
SELECT count(*) FROM file('{some,another}_dir/some_file_{1..3}', 'TSV', 'name String, value UInt32');
```

获取相同结果的替代路径表达式：

```sql
SELECT count(*) FROM file('{some,another}_dir/*', 'TSV', 'name String, value UInt32');
```

使用隐式 `*` 查询 `some_dir` 中的行数总和：

```sql
SELECT count(*) FROM file('some_dir', 'TSV', 'name String, value UInt32');
```

:::note
如果您的文件列表包含前导零的数字范围，请为每个数字分别使用带括号的构造或使用 `?`。
:::

**示例**

查询名为 `file000`、`file001`、...、`file999` 的文件的行数总和：

```sql
SELECT count(*) FROM file('big_dir/file{0..9}{0..9}{0..9}', 'CSV', 'name String, value UInt32');
```

**示例**

递归查询 `big_dir/` 目录中所有文件的行数总和：

```sql
SELECT count(*) FROM file('big_dir/**', 'CSV', 'name String, value UInt32');
```

**示例**

递归查询 `big_dir/` 目录中任何文件夹内所有名为 `file002` 的文件的行数总和：

```sql
SELECT count(*) FROM file('big_dir/**/file002', 'CSV', 'name String, value UInt32');
```

## 虚拟列 {#virtual-columns}

- `_path` — 文件路径。类型：`LowCardinality(String)`。
- `_file` — 文件名。类型：`LowCardinality(String)`。
- `_size` — 文件大小（以字节为单位）。类型：`Nullable(UInt64)`。如果文件大小未知，则值为 `NULL`。
- `_time` — 文件最后修改时间。类型：`Nullable(DateTime)`。如果时间未知，则值为 `NULL`。

## Hive 风格的分区 {#hive-style-partitioning}

当设置 `use_hive_partitioning` 为 1 时，ClickHouse 将检测路径中的 Hive 风格分区 (`/name=value/`) 并允许在查询中将分区列用作虚拟列。这些虚拟列将具有与分区路径中相同的名称，但前面带有 `_`。

**示例**

使用 Hive 风格分区创建的虚拟列

```sql
SELECT * from file('data/path/date=*/country=*/code=*/*.parquet') where _date > '2020-01-01' and _country = 'Netherlands' and _code = 42;
```

## 设置 {#settings}

| 设置                                                                                                            | 描述                                                                                                                                                   |
|----------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------|
| [engine_file_empty_if_not_exists](/operations/settings/settings#engine_file_empty_if_not_exists)                   | 允许从不存在的文件中选择空数据。默认情况下禁用。                                                                                                      |
| [engine_file_truncate_on_insert](/operations/settings/settings#engine_file_truncate_on_insert)                     | 允许在向其插入之前截断文件。默认情况下禁用。                                                                                                         |
| [engine_file_allow_create_multiple_files](operations/settings/settings.md#engine_file_allow_create_multiple_files) | 允许在每次插入时创建新文件（如果格式具有后缀）。默认情况下禁用。                                                                                       |
| [engine_file_skip_empty_files](operations/settings/settings.md#engine_file_skip_empty_files)                       | 允许在读取时跳过空文件。默认情况下禁用。                                                                                                            |
| [storage_file_read_method](/operations/settings/settings#engine_file_empty_if_not_exists)                          | 从存储文件中读取数据的方法，选项为：read、pread、mmap（仅适用于 clickhouse-local）。默认值：`pread` 用于 clickhouse-server，`mmap` 用于 clickhouse-local。 |

## 相关 {#related}

- [虚拟列](engines/table-engines/index.md#table_engines-virtual_columns)
- [处理后重命名文件](operations/settings/settings.md#rename_files_after_processing)
