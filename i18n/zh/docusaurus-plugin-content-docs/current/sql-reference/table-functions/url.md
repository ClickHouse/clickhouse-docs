---
'description': 'Creates a table from the `URL` with given `format` and `structure`'
'sidebar_label': 'url'
'sidebar_position': 200
'slug': '/sql-reference/table-functions/url'
'title': 'url'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# url 表函数

`url` 函数从给定的 `URL` 创建一个表，具有指定的 `format` 和 `structure`。

`url` 函数可以在 [URL](../../engines/table-engines/special/url.md) 表的数据上用于 `SELECT` 和 `INSERT` 查询。

## 语法 {#syntax}

```sql
url(URL [,format] [,structure] [,headers])
```

## 参数 {#parameters}

| 参数        | 描述                                                                                                                       |
|-------------|----------------------------------------------------------------------------------------------------------------------------|
| `URL`       | HTTP 或 HTTPS 服务器地址，可以接受 `GET` 或 `POST` 请求（分别对应 `SELECT` 或 `INSERT` 查询）。类型: [String](../../sql-reference/data-types/string.md)。               |
| `format`    | 数据的 [格式](/sql-reference/formats)。类型: [String](../../sql-reference/data-types/string.md)。                                                   |
| `structure` | 表结构，格式为 `'UserID UInt64, Name String'`。决定列名和类型。类型: [String](../../sql-reference/data-types/string.md)。                                      |
| `headers`   | headers 格式为 `'headers('key1'='value1', 'key2'='value2')'`。您可以为 HTTP 调用设置 headers。                                        |

## 返回值 {#returned_value}

返回一个具有指定格式和结构以及来自定义 `URL` 的数据的表。

## 示例 {#examples}

从HTTP服务器获取包含 `String` 和 [UInt32](../../sql-reference/data-types/int-uint.md) 类型的列的表的前 3 行，该服务器以 [CSV](../../interfaces/formats.md#csv) 格式响应。

```sql
SELECT * FROM url('http://127.0.0.1:12345/', CSV, 'column1 String, column2 UInt32', headers('Accept'='text/csv; charset=utf-8')) LIMIT 3;
```

将数据从 `URL` 插入到表中：

```sql
CREATE TABLE test_table (column1 String, column2 UInt32) ENGINE=Memory;
INSERT INTO FUNCTION url('http://127.0.0.1:8123/?query=INSERT+INTO+test_table+FORMAT+CSV', 'CSV', 'column1 String, column2 UInt32') VALUES ('http interface', 42);
SELECT * FROM test_table;
```

## URL 中的通配符 {#globs-in-url}

花括号 `{ }` 中的模式用于生成一组分片或指定故障转移地址。支持的模式类型及示例在 [remote](remote.md#globs-in-addresses) 函数的描述中可以找到。
模式内部的字符 `|` 用于指定故障转移地址。这些地址按模式中列出的顺序进行迭代。生成的地址数量受到 [glob_expansion_max_elements](../../operations/settings/settings.md#glob_expansion_max_elements) 设置的限制。

## 虚拟列 {#virtual-columns}

- `_path` — `URL` 的路径。类型: `LowCardinality(String)`。
- `_file` — `URL` 的资源名称。类型: `LowCardinality(String)`。
- `_size` — 资源的大小（以字节为单位）。类型: `Nullable(UInt64)`。如果大小未知，值为 `NULL`。
- `_time` — 文件的最后修改时间。类型: `Nullable(DateTime)`。如果时间未知，值为 `NULL`。
- `_headers` - HTTP 响应头。类型: `Map(LowCardinality(String), LowCardinality(String))`。

## Hive 风格分区 {#hive-style-partitioning}

当设置 `use_hive_partitioning` 为 1 时，ClickHouse 将检测路径中的 Hive 风格分区 (`/name=value/`)，并允许在查询中将分区列用作虚拟列。这些虚拟列将具有与分区路径中相同的名称，但以 `_` 开头。

**示例**

使用 Hive 风格分区创建的虚拟列

```sql
SELECT * from url('http://data/path/date=*/country=*/code=*/*.parquet') where _date > '2020-01-01' and _country = 'Netherlands' and _code = 42;
```

## 存储设置 {#storage-settings}

- [engine_url_skip_empty_files](/operations/settings/settings.md#engine_url_skip_empty_files) - 允许在读取时跳过空文件。默认情况下禁用。
- [enable_url_encoding](/operations/settings/settings.md#enable_url_encoding) - 允许启用/禁用 URI 中路径的解码/编码。默认情况下启用。

## 权限 {#permissions}

`url` 函数需要 `CREATE TEMPORARY TABLE` 权限。因此，对于设置 [readonly](/operations/settings/permissions-for-queries#readonly) = 1 的用户将无法使用。至少需要 readonly = 2。

## 相关 {#related}

- [虚拟列](/engines/table-engines/index.md#table_engines-virtual_columns)
