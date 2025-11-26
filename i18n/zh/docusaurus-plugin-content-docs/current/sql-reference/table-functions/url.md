---
description: '从指定的 `URL` 按给定的 `format` 和 `structure` 创建一张表'
sidebar_label: 'url'
sidebar_position: 200
slug: /sql-reference/table-functions/url
title: 'url'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# url 表函数

`url` 函数根据给定的 `format` 和 `structure`，基于指定的 `URL` 创建一个表。

`url` 函数可以在对 [URL](../../engines/table-engines/special/url.md) 表数据执行的 `SELECT` 和 `INSERT` 查询中使用。



## 语法

```sql
url(URL [,format] [,structure] [,headers])
```


## 参数 {#parameters}

| 参数        | 描述                                                                                                                                                   |
|-------------|--------------------------------------------------------------------------------------------------------------------------------------------------------|
| `URL`       | 用单引号括起来的 HTTP 或 HTTPS 服务器地址，该服务器可以接受 `GET` 或 `POST` 请求（分别对应 `SELECT` 或 `INSERT` 查询）。类型： [String](../../sql-reference/data-types/string.md)。 |
| `format`    | 数据的[格式](/sql-reference/formats)。类型： [String](../../sql-reference/data-types/string.md)。                                                  |
| `structure` | 表结构，格式为 `'UserID UInt64, Name String'`。用于确定列名和列类型。类型： [String](../../sql-reference/data-types/string.md)。     |
| `headers`   | 请求头，格式为 `'headers('key1'='value1', 'key2'='value2')'`。可用于为 HTTP 调用设置请求头。                                                  |



## 返回值 {#returned_value}

一个具有指定格式和结构，并包含来自已定义 `URL` 的数据的表。



## 示例

从以 [CSV](/interfaces/formats/CSV) 格式响应的 HTTP 服务器获取一个包含 `String` 和 [UInt32](../../sql-reference/data-types/int-uint.md) 类型列的表的前 3 行。

```sql
SELECT * FROM url('http://127.0.0.1:12345/', CSV, 'column1 String, column2 UInt32', headers('Accept'='text/csv; charset=utf-8')) LIMIT 3;
```

从 `URL` 向表中插入数据：

```sql
CREATE TABLE test_table (column1 String, column2 UInt32) ENGINE=Memory;
INSERT INTO FUNCTION url('http://127.0.0.1:8123/?query=INSERT+INTO+test_table+FORMAT+CSV', 'CSV', 'column1 String, column2 UInt32') VALUES ('http interface', 42);
SELECT * FROM test_table;
```


## URL 中的通配模式 {#globs-in-url}

花括号 `{ }` 中的模式用于生成一组分片，或用于指定故障转移地址。受支持的模式类型及示例请参见 [remote](remote.md#globs-in-addresses) 函数的描述。
模式中的字符 `|` 用于指定故障转移地址。故障转移地址会按照在模式中列出的顺序依次迭代。生成地址的数量受 [glob_expansion_max_elements](../../operations/settings/settings.md#glob_expansion_max_elements) 设置的限制。



## 虚拟列 {#virtual-columns}

- `_path` — `URL` 的路径。类型：`LowCardinality(String)`。
- `_file` — `URL` 的资源名。类型：`LowCardinality(String)`。
- `_size` — 资源以字节为单位的大小。类型：`Nullable(UInt64)`。如果大小未知，则值为 `NULL`。
- `_time` — 文件的最后修改时间。类型：`Nullable(DateTime)`。如果时间未知，则值为 `NULL`。
- `_headers` - HTTP 响应头部。类型：`Map(LowCardinality(String), LowCardinality(String))`。



## use&#95;hive&#95;partitioning 设置

当将 `use_hive_partitioning` 设置为 1 时，ClickHouse 会在路径（`/name=value/`）中检测 Hive 风格的分区，并允许在查询中将分区列作为虚拟列使用。这些虚拟列的名称与分区路径中的名称相同，但会以 `_` 作为前缀。

**示例**

使用通过 Hive 风格分区创建的虚拟列

```sql
SELECT * FROM url('http://data/path/date=*/country=*/code=*/*.parquet') WHERE _date > '2020-01-01' AND _country = 'Netherlands' AND _code = 42;
```


## 存储设置 {#storage-settings}

- [engine_url_skip_empty_files](/operations/settings/settings.md#engine_url_skip_empty_files) - 用于在读取时跳过空文件。默认禁用。
- [enable_url_encoding](/operations/settings/settings.md#enable_url_encoding) - 用于控制是否对 URI 中路径进行解码/编码。默认启用。



## 权限 {#permissions}

`url` 函数需要 `CREATE TEMPORARY TABLE` 权限。因此，对于将 [readonly](/operations/settings/permissions-for-queries#readonly) 设置为 1 的用户，它将无法使用。至少需要 readonly = 2。



## 相关内容 {#related}

- [虚拟列](/engines/table-engines/index.md#table_engines-virtual_columns)
