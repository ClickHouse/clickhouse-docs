---
'description': '从 HDFS 中的文件创建一个表。这个表函数类似于 url 和 file 表函数。'
'sidebar_label': 'hdfs'
'sidebar_position': 80
'slug': '/sql-reference/table-functions/hdfs'
'title': 'hdfs'
'doc_type': 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# hdfs 表函数 

从 HDFS 中的文件创建表。此表函数类似于 [url](../../sql-reference/table-functions/url.md) 和 [file](../../sql-reference/table-functions/file.md) 表函数。

## 语法 {#syntax}

```sql
hdfs(URI, format, structure)
```

## 参数 {#arguments}

| 参数      | 描述                                                                                                                                                                   |
|-----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `URI`     | HDFS 中文件的相对 URI。文件路径在只读模式下支持以下通配符：`*`, `?`, `{abc,def}` 和 `{N..M}` 其中 `N`，`M` 为数字，`'abc', 'def'` 为字符串。                             |
| `format`  | 文件的 [格式](/sql-reference/formats)。                                                                                                                                 |
| `structure`| 表的结构。格式为 `'column1_name column1_type, column2_name column2_type, ...'`。                                                                                     |

## 返回值 {#returned_value}

一个具有指定结构的表，用于读取或写入指定文件中的数据。

**示例**

来自 `hdfs://hdfs1:9000/test` 的表，并从中选择前两行：

```sql
SELECT *
FROM hdfs('hdfs://hdfs1:9000/test', 'TSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
LIMIT 2
```

```text
┌─column1─┬─column2─┬─column3─┐
│       1 │       2 │       3 │
│       3 │       2 │       1 │
└─────────┴─────────┴─────────┘
```

## 路径中的通配符 {#globs_in_path}

路径可以使用通配符。文件必须与整个路径模式匹配，而不仅仅是后缀或前缀。

- `*` — 表示任意多个除 `/` 以外的字符，包括空字符串。
- `**` — 表示文件夹内的所有文件，递归查找。
- `?` — 表示一个任意字符。
- `{some_string,another_string,yet_another_one}` — 替换为任何字符串 `'some_string', 'another_string', 'yet_another_one'`。字符串可以包含 `/` 符号。
- `{N..M}` — 表示任何数字 `>= N` 且 `<= M`。

使用 `{}` 的构造与 [remote](remote.md) 和 [file](file.md) 表函数相似。

**示例**

1. 假设我们在 HDFS 上有几个具有以下 URI 的文件：

- 'hdfs://hdfs1:9000/some_dir/some_file_1'
- 'hdfs://hdfs1:9000/some_dir/some_file_2'
- 'hdfs://hdfs1:9000/some_dir/some_file_3'
- 'hdfs://hdfs1:9000/another_dir/some_file_1'
- 'hdfs://hdfs1:9000/another_dir/some_file_2'
- 'hdfs://hdfs1:9000/another_dir/some_file_3'

2. 查询这些文件中的行数：

<!-- -->

```sql
SELECT count(*)
FROM hdfs('hdfs://hdfs1:9000/{some,another}_dir/some_file_{1..3}', 'TSV', 'name String, value UInt32')
```

3. 查询这两个目录中所有文件的行数：

<!-- -->

```sql
SELECT count(*)
FROM hdfs('hdfs://hdfs1:9000/{some,another}_dir/*', 'TSV', 'name String, value UInt32')
```

:::note
如果文件列表中包含带前导零的数字范围，请为每个数字分别使用带大括号的构造，或使用 `?`。
:::

**示例**

查询名为 `file000`, `file001`, ... , `file999` 的文件中的数据：

```sql
SELECT count(*)
FROM hdfs('hdfs://hdfs1:9000/big_dir/file{0..9}{0..9}{0..9}', 'CSV', 'name String, value UInt32')
```

## 虚拟列 {#virtual-columns}

- `_path` — 文件的路径。类型：`LowCardinality(String)`。
- `_file` — 文件的名称。类型：`LowCardinality(String)`。
- `_size` — 文件的大小（以字节为单位）。类型：`Nullable(UInt64)`。如果大小未知，则值为 `NULL`。
- `_time` — 文件的最后修改时间。类型：`Nullable(DateTime)`。如果时间未知，则值为 `NULL`。

## use_hive_partitioning 设置 {#hive-style-partitioning}

当设置 `use_hive_partitioning` 为 1 时，ClickHouse 将在路径中检测 Hive 风格的分区（`/name=value/`），并允许在查询中将分区列用作虚拟列。这些虚拟列将与分区路径中的名称相同，但以 `_` 开头。

**示例**

使用虚拟列，创建于 Hive 风格分区

```sql
SELECT * FROM HDFS('hdfs://hdfs1:9000/data/path/date=*/country=*/code=*/*.parquet') WHERE _date > '2020-01-01' AND _country = 'Netherlands' AND _code = 42;
```

## 存储设置 {#storage-settings}

- [hdfs_truncate_on_insert](operations/settings/settings.md#hdfs_truncate_on_insert) - 允许在插入之前截断文件。默认情况下禁用。
- [hdfs_create_new_file_on_insert](operations/settings/settings.md#hdfs_create_new_file_on_insert) - 允许在每次插入时创建一个新文件（如果格式有后缀）。默认情况下禁用。
- [hdfs_skip_empty_files](operations/settings/settings.md#hdfs_skip_empty_files) - 允许在读取时跳过空文件。默认情况下禁用。

## 相关 {#related}

- [虚拟列](../../engines/table-engines/index.md#table_engines-virtual_columns)
