---
description: '从指定的 `URL` 按给定的 `format` 和 `structure` 创建表'
sidebar_label: 'url'
sidebar_position: 200
slug: /sql-reference/table-functions/url
title: 'url'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# url 表函数

`url` 函数根据给定的 `format` 和 `structure`，从指定的 `URL` 创建一个表。

`url` 函数可用于对 [URL](../../engines/table-engines/special/url.md) 表中数据执行 `SELECT` 和 `INSERT` 查询。



## 语法 {#syntax}

```sql
url(URL [,format] [,structure] [,headers])
```


## 参数 {#parameters}

| 参数   | 描述                                                                                                                                                                                         |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `URL`       | 用单引号括起的 HTTP 或 HTTPS 服务器地址,可接受 `GET` 或 `POST` 请求(分别对应 `SELECT` 或 `INSERT` 查询)。类型:[String](../../sql-reference/data-types/string.md)。 |
| `format`    | 数据的[格式](/sql-reference/formats)。类型:[String](../../sql-reference/data-types/string.md)。                                                                                             |
| `structure` | 表结构,格式为 `'UserID UInt64, Name String'`。用于确定列名和类型。类型:[String](../../sql-reference/data-types/string.md)。                                              |
| `headers`   | 请求头,格式为 `'headers('key1'='value1', 'key2'='value2')'`。可用于设置 HTTP 调用的请求头。                                                                                                 |


## 返回值 {#returned_value}

返回一个具有指定格式和结构的表,其数据来自定义的 `URL`。


## 示例 {#examples}

从以 [CSV](/interfaces/formats/CSV) 格式响应的 HTTP 服务器获取包含 `String` 和 [UInt32](../../sql-reference/data-types/int-uint.md) 类型列的表的前 3 行。

```sql
SELECT * FROM url('http://127.0.0.1:12345/', CSV, 'column1 String, column2 UInt32', headers('Accept'='text/csv; charset=utf-8')) LIMIT 3;
```

将数据从 `URL` 插入到表中:

```sql
CREATE TABLE test_table (column1 String, column2 UInt32) ENGINE=Memory;
INSERT INTO FUNCTION url('http://127.0.0.1:8123/?query=INSERT+INTO+test_table+FORMAT+CSV', 'CSV', 'column1 String, column2 UInt32') VALUES ('http interface', 42);
SELECT * FROM test_table;
```


## Globs in URL {#globs-in-url}

花括号 `{ }` 中的模式用于生成一组分片或指定故障转移地址。有关支持的模式类型和示例,请参阅 [remote](remote.md#globs-in-addresses) 函数的说明。
模式中的字符 `|` 用于指定故障转移地址。这些地址将按照模式中列出的顺序进行迭代。生成的地址数量受 [glob_expansion_max_elements](../../operations/settings/settings.md#glob_expansion_max_elements) 设置限制。


## 虚拟列 {#virtual-columns}

- `_path` — `URL` 的路径。类型:`LowCardinality(String)`。
- `_file` — `URL` 的资源名称。类型:`LowCardinality(String)`。
- `_size` — 资源大小(字节)。类型:`Nullable(UInt64)`。如果大小未知,则值为 `NULL`。
- `_time` — 文件最后修改时间。类型:`Nullable(DateTime)`。如果时间未知,则值为 `NULL`。
- `_headers` — HTTP 响应头。类型:`Map(LowCardinality(String), LowCardinality(String))`。


## use_hive_partitioning 设置 {#hive-style-partitioning}

当设置 `use_hive_partitioning` 为 1 时,ClickHouse 将检测路径中的 Hive 风格分区(`/name=value/`),并允许在查询中将分区列作为虚拟列使用。这些虚拟列的名称与分区路径中的名称相同,但以 `_` 开头。

**示例**

使用 Hive 风格分区创建的虚拟列

```sql
SELECT * FROM url('http://data/path/date=*/country=*/code=*/*.parquet') WHERE _date > '2020-01-01' AND _country = 'Netherlands' AND _code = 42;
```


## 存储设置 {#storage-settings}

- [engine_url_skip_empty_files](/operations/settings/settings.md#engine_url_skip_empty_files) - 允许在读取时跳过空文件。默认为禁用。
- [enable_url_encoding](/operations/settings/settings.md#enable_url_encoding) - 允许启用/禁用 URI 路径的编码/解码。默认为启用。


## 权限 {#permissions}

`url` 函数需要 `CREATE TEMPORARY TABLE` 权限。因此,对于设置了 [readonly](/operations/settings/permissions-for-queries#readonly) = 1 的用户,该函数将无法使用。至少需要 readonly = 2。


## 相关内容 {#related}

- [虚拟列](/engines/table-engines/index.md#table_engines-virtual_columns)
