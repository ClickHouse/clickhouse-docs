---
description: '一种表引擎，提供在文件上执行 SELECT 和 INSERT 操作的类表接口，类似于 s3 表函数。处理本地文件时使用 `file()`，处理对象存储（如 S3、GCS 或 MinIO）中的 bucket 时使用 `s3()`。'
sidebar_label: 'file'
sidebar_position: 60
slug: /sql-reference/table-functions/file
title: 'file'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# file 表函数

一种表引擎，提供类似表的接口，用于对文件执行 SELECT 和 INSERT 操作，类似于 [s3](/sql-reference/table-functions/url.md) 表函数。处理本地文件时使用 `file()`，处理对象存储（如 S3、GCS 或 MinIO）中的存储桶（bucket）时使用 `s3()`。

`file` 函数可以在 `SELECT` 和 `INSERT` 查询中使用，用于从文件读取或向文件写入数据。



## 语法 {#syntax}

```sql
file([path_to_archive ::] path [,format] [,structure] [,compression])
```


## 参数 {#arguments}

| 参数              | 说明                                                                                                                                                                                                                                                                                                   |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `path`            | 相对于 [user_files_path](operations/server-configuration-parameters/settings.md#user_files_path) 的文件相对路径。在只读模式下支持以下[通配符](#globs-in-path):`*`、`?`、`{abc,def}`(其中 `'abc'` 和 `'def'` 为字符串)以及 `{N..M}`(其中 `N` 和 `M` 为数字)。 |
| `path_to_archive` | zip/tar/7z 归档文件的相对路径。支持与 `path` 相同的通配符。                                                                                                                                                                                                                                 |
| `format`          | 文件的[格式](/interfaces/formats)。                                                                                                                                                                                                                                                                |
| `structure`       | 表结构。格式:`'column1_name column1_type, column2_name column2_type, ...'`。                                                                                                                                                                                                                                |
| `compression`     | 在 `SELECT` 查询中使用时为现有的压缩类型,在 `INSERT` 查询中使用时为期望的压缩类型。支持的压缩类型有 `gz`、`br`、`xz`、`zst`、`lz4` 和 `bz2`。                                                                                                       |


## 返回值 {#returned_value}

返回一个用于读取或写入文件数据的表。


## 写入文件示例 {#examples-for-writing-to-a-file}

### 写入 TSV 文件 {#write-to-a-tsv-file}

```sql
INSERT INTO TABLE FUNCTION
file('test.tsv', 'TSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
VALUES (1, 2, 3), (3, 2, 1), (1, 3, 2)
```

执行后,数据将写入文件 `test.tsv`:


```bash
# cat /var/lib/clickhouse/user_files/test.tsv
1    2    3
3    2    1
1    3    2
```

### 分区写入多个 TSV 文件 {#partitioned-write-to-multiple-tsv-files}

在向 `file()` 类型的表函数插入数据时,如果指定了 `PARTITION BY` 表达式,则会为每个分区创建单独的文件。将数据拆分到不同文件中有助于提升读取操作的性能。

```sql
INSERT INTO TABLE FUNCTION
file('test_{_partition_id}.tsv', 'TSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
PARTITION BY column3
VALUES (1, 2, 3), (3, 2, 1), (1, 3, 2)
```

执行后,数据将被写入三个文件:`test_1.tsv`、`test_2.tsv` 和 `test_3.tsv`。


```bash
# cat /var/lib/clickhouse/user_files/test_1.tsv
3    2    1
```


# cat /var/lib/clickhouse/user_files/test_2.tsv
1    3    2



# cat /var/lib/clickhouse/user&#95;files/test&#95;3.tsv

1    2    3

```
```


## 从文件读取数据的示例 {#examples-for-reading-from-a-file}

### 从 CSV 文件中查询数据 {#select-from-a-csv-file}

首先,在服务器配置中设置 `user_files_path` 并准备文件 `test.csv`:

```bash
$ grep user_files_path /etc/clickhouse-server/config.xml
    <user_files_path>/var/lib/clickhouse/user_files/</user_files_path>

$ cat /var/lib/clickhouse/user_files/test.csv
    1,2,3
    3,2,1
    78,43,45
```

然后,从 `test.csv` 读取数据并查询前两行:

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

### 将文件中的数据插入到表中 {#inserting-data-from-a-file-into-a-table}

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

从位于 `archive1.zip` 或 `archive2.zip` 中的 `table.csv` 读取数据:

```sql
SELECT * FROM file('user_files/archives/archive{1..2}.zip :: table.csv');
```


## 路径中的通配符 {#globs-in-path}

路径可以使用通配符。文件必须匹配完整的路径模式,而不仅仅是后缀或前缀。有一个例外情况:如果路径指向一个已存在的目录且未使用通配符,则会在路径末尾隐式添加 `*`,从而选择该目录中的所有文件。

- `*` — 表示除 `/` 之外的任意多个字符,包括空字符串。
- `?` — 表示任意单个字符。
- `{some_string,another_string,yet_another_one}` — 匹配字符串 `'some_string'`、`'another_string'`、`'yet_another_one'` 中的任意一个。这些字符串可以包含 `/` 符号。
- `{N..M}` — 表示 `>= N` 且 `<= M` 的任意数字。
- `**` — 递归匹配文件夹内的所有文件。

使用 `{}` 的构造方式与 [remote](remote.md) 和 [hdfs](hdfs.md) 表函数类似。


## 示例 {#examples}

**示例**

假设存在以下相对路径的文件:

- `some_dir/some_file_1`
- `some_dir/some_file_2`
- `some_dir/some_file_3`
- `another_dir/some_file_1`
- `another_dir/some_file_2`
- `another_dir/some_file_3`

查询所有文件的总行数:

```sql
SELECT count(*) FROM file('{some,another}_dir/some_file_{1..3}', 'TSV', 'name String, value UInt32');
```

另一种实现相同效果的路径表达式:

```sql
SELECT count(*) FROM file('{some,another}_dir/*', 'TSV', 'name String, value UInt32');
```

使用隐式 `*` 查询 `some_dir` 中的总行数:

```sql
SELECT count(*) FROM file('some_dir', 'TSV', 'name String, value UInt32');
```

:::note
如果文件列表包含带前导零的数字范围,请对每个数字分别使用大括号构造,或使用 `?`。
:::

**示例**

查询名为 `file000`、`file001`、...、`file999` 的文件的总行数:

```sql
SELECT count(*) FROM file('big_dir/file{0..9}{0..9}{0..9}', 'CSV', 'name String, value UInt32');
```

**示例**

递归查询目录 `big_dir/` 内所有文件的总行数:

```sql
SELECT count(*) FROM file('big_dir/**', 'CSV', 'name String, value UInt32');
```

**示例**

递归查询目录 `big_dir/` 中任意文件夹内所有名为 `file002` 的文件的总行数:

```sql
SELECT count(*) FROM file('big_dir/**/file002', 'CSV', 'name String, value UInt32');
```


## 虚拟列 {#virtual-columns}

- `_path` — 文件路径。类型:`LowCardinality(String)`。
- `_file` — 文件名。类型:`LowCardinality(String)`。
- `_size` — 文件大小(以字节为单位)。类型:`Nullable(UInt64)`。如果文件大小未知,则值为 `NULL`。
- `_time` — 文件最后修改时间。类型:`Nullable(DateTime)`。如果时间未知,则值为 `NULL`。


## use_hive_partitioning 设置 {#hive-style-partitioning}

当设置 `use_hive_partitioning` 为 1 时,ClickHouse 将检测路径中的 Hive 风格分区(`/name=value/`),并允许在查询中将分区列作为虚拟列使用。这些虚拟列将与分区路径中的名称相同,但以 `_` 开头。

**示例**

使用通过 Hive 风格分区创建的虚拟列

```sql
SELECT * FROM file('data/path/date=*/country=*/code=*/*.parquet') WHERE _date > '2020-01-01' AND _country = 'Netherlands' AND _code = 42;
```


## 设置 {#settings}

| 设置                                                                                                            | 说明                                                                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [engine_file_empty_if_not_exists](/operations/settings/settings#engine_file_empty_if_not_exists)                   | 允许从不存在的文件中查询空数据。默认禁用。                                                                                            |
| [engine_file_truncate_on_insert](/operations/settings/settings#engine_file_truncate_on_insert)                     | 允许在插入数据前截断文件。默认禁用。                                                                                                         |
| [engine_file_allow_create_multiple_files](operations/settings/settings.md#engine_file_allow_create_multiple_files) | 当格式带有后缀时,允许每次插入时创建新文件。默认禁用。                                                                                       |
| [engine_file_skip_empty_files](operations/settings/settings.md#engine_file_skip_empty_files)                       | 允许在读取时跳过空文件。默认禁用。                                                                                                              |
| [storage_file_read_method](/operations/settings/settings#engine_file_empty_if_not_exists)                          | 从存储文件读取数据的方法,可选值:read、pread、mmap(仅适用于 clickhouse-local)。默认值:clickhouse-server 使用 `pread`,clickhouse-local 使用 `mmap`。 |


## 相关内容 {#related}

- [虚拟列](engines/table-engines/index.md#table_engines-virtual_columns)
- [处理后重命名文件](operations/settings/settings.md#rename_files_after_processing)
