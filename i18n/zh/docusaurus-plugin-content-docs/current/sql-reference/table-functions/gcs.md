---
slug: /sql-reference/table-functions/gcs
sidebar_position: 70
sidebar_label: gcs
keywords: [gcs, bucket]
title: 'gcs'
description: '提供了一个表状接口来从 Google Cloud Storage 中 `SELECT` 和 `INSERT` 数据。需要 `Storage Object User` IAM 角色。'
---


# gcs 表函数

提供了一个表状接口来从 [Google Cloud Storage](https://cloud.google.com/storage/) 中 `SELECT` 和 `INSERT` 数据。需要 [`Storage Object User` IAM 角色](https://cloud.google.com/storage/docs/access-control/iam-roles)。

这是 [s3 表函数](../../sql-reference/table-functions/s3.md) 的别名。

如果在您的集群中有多个副本，您可以使用 [s3Cluster 函数](../../sql-reference/table-functions/s3Cluster.md)（该函数支持 GCS）来并行化插入。

**语法**

``` sql
gcs(url [, NOSIGN | hmac_key, hmac_secret] [,format] [,structure] [,compression_method])
gcs(named_collection[, option=value [,..]])
```

:::tip GCS
GCS 表函数通过使用 GCS XML API 和 HMAC 密钥与 Google Cloud Storage 集成。有关端点和 HMAC 的更多详细信息，请参见 [Google 互操作性文档]( https://cloud.google.com/storage/docs/interoperability) 。

:::

**参数**

- `url` — 文件的存储桶路径。在只读模式下支持以下通配符： `*`, `**`, `?`, `{abc,def}` 和 `{N..M}`，其中 `N`, `M` — 数字， `'abc'`, `'def'` — 字符串。
  :::note GCS
  GCS 路径的格式为：Google XML API 的端点与 JSON API 不同：
```text
  https://storage.googleapis.com/<bucket>/<folder>/<filename(s)>
  ```
  而不是 ~~https://storage.cloud.google.com~~。
  :::
- `NOSIGN` — 如果在凭据的位置提供此关键词，则所有请求将不被签名。
- `hmac_key` 和 `hmac_secret` — 指定与给定端点一起使用的凭据的密钥。可选。
- `format` — 文件的 [格式](/sql-reference/formats)。
- `structure` — 表的结构。格式为 `'column1_name column1_type, column2_name column2_type, ...'`。
- `compression_method` — 此参数是可选的。支持的值： `none`，`gzip` 或 `gz`，`brotli` 或 `br`，`xz` 或 `LZMA`，`zstd` 或 `zst`。默认情况下，它将根据文件扩展名自动检测压缩方法。

参数也可以使用 [命名集合](operations/named-collections.md) 传递。在这种情况下，`url`，`format`，`structure`，`compression_method` 的用法相同，并且支持一些额外的参数：

 - `access_key_id` — `hmac_key`，可选。
 - `secret_access_key` — `hmac_secret`，可选。
 - `filename` — 如果指定，则附加到 url。
 - `use_environment_credentials` — 默认启用，允许使用环境变量 `AWS_CONTAINER_CREDENTIALS_RELATIVE_URI`，`AWS_CONTAINER_CREDENTIALS_FULL_URI`，`AWS_CONTAINER_AUTHORIZATION_TOKEN`，`AWS_EC2_METADATA_DISABLED` 传递额外参数。
 - `no_sign_request` — 默认禁用。
 - `expiration_window_seconds` — 默认值为 120。

**返回值**

返回一个表，具有指定结构，用于读取或写入指定文件中的数据。

**示例**

从 GCS 文件 `https://storage.googleapis.com/my-test-bucket-768/data.csv` 中选择前两行：

``` sql
SELECT *
FROM gcs('https://storage.googleapis.com/clickhouse_public_datasets/my-test-bucket-768/data.csv.gz', 'CSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
LIMIT 2;
```

``` text
┌─column1─┬─column2─┬─column3─┐
│       1 │       2 │       3 │
│       3 │       2 │       1 │
└─────────┴─────────┴─────────┘
```

从具有 `gzip` 压缩方法的文件中选择：

``` sql
SELECT *
FROM gcs('https://storage.googleapis.com/clickhouse_public_datasets/my-test-bucket-768/data.csv.gz', 'CSV', 'column1 UInt32, column2 UInt32, column3 UInt32', 'gzip')
LIMIT 2;
```

``` text
┌─column1─┬─column2─┬─column3─┐
│       1 │       2 │       3 │
│       3 │       2 │       1 │
└─────────┴─────────┴─────────┘
```

## 用法 {#usage}

假设我们在 GCS 上有多个文件，其 URI如下：

-   'https://storage.googleapis.com/my-test-bucket-768/some_prefix/some_file_1.csv'
-   'https://storage.googleapis.com/my-test-bucket-768/some_prefix/some_file_2.csv'
-   'https://storage.googleapis.com/my-test-bucket-768/some_prefix/some_file_3.csv'
-   'https://storage.googleapis.com/my-test-bucket-768/some_prefix/some_file_4.csv'
-   'https://storage.googleapis.com/my-test-bucket-768/another_prefix/some_file_1.csv'
-   'https://storage.googleapis.com/my-test-bucket-768/another_prefix/some_file_2.csv'
-   'https://storage.googleapis.com/my-test-bucket-768/another_prefix/some_file_3.csv'
-   'https://storage.googleapis.com/my-test-bucket-768/another_prefix/some_file_4.csv'

统计以数字 1 到 3 结尾的文件中的行数：

``` sql
SELECT count(*)
FROM gcs('https://storage.googleapis.com/clickhouse_public_datasets/my-test-bucket-768/{some,another}_prefix/some_file_{1..3}.csv', 'CSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
```

``` text
┌─count()─┐
│      18 │
└─────────┘
```

统计这两个目录中所有文件的总行数：

``` sql
SELECT count(*)
FROM gcs('https://storage.googleapis.com/clickhouse_public_datasets/my-test-bucket-768/{some,another}_prefix/*', 'CSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
```

``` text
┌─count()─┐
│      24 │
└─────────┘
```

:::warning
如果您的文件列表包含带有前导零的数字范围，请分别使用大括号对每个数字进行构造，或使用 `?`。
:::

统计文件 `file-000.csv`、`file-001.csv`、... 、`file-999.csv` 中的总行数：

``` sql
SELECT count(*)
FROM gcs('https://storage.googleapis.com/clickhouse_public_datasets/my-test-bucket-768/big_prefix/file-{000..999}.csv', 'CSV', 'name String, value UInt32');
```

``` text
┌─count()─┐
│      12 │
└─────────┘
```

将数据插入文件 `test-data.csv.gz`：

``` sql
INSERT INTO FUNCTION gcs('https://storage.googleapis.com/my-test-bucket-768/test-data.csv.gz', 'CSV', 'name String, value UInt32', 'gzip')
VALUES ('test-data', 1), ('test-data-2', 2);
```

从现有表中插入数据到文件 `test-data.csv.gz`：

``` sql
INSERT INTO FUNCTION gcs('https://storage.googleapis.com/my-test-bucket-768/test-data.csv.gz', 'CSV', 'name String, value UInt32', 'gzip')
SELECT name, value FROM existing_table;
```

`**` 可以用来进行递归目录遍历。考虑以下示例，它将递归地从 `my-test-bucket-768` 目录中获取所有文件：

``` sql
SELECT * FROM gcs('https://storage.googleapis.com/my-test-bucket-768/**', 'CSV', 'name String, value UInt32', 'gzip');
```

以下示例从 `my-test-bucket` 目录中的任何文件夹递归地获取所有 `test-data.csv.gz` 文件中的数据：

``` sql
SELECT * FROM gcs('https://storage.googleapis.com/my-test-bucket-768/**/test-data.csv.gz', 'CSV', 'name String, value UInt32', 'gzip');
```

对于生产用例，建议使用 [命名集合](operations/named-collections.md)。以下是示例：
``` sql

CREATE NAMED COLLECTION creds AS
        access_key_id = '***',
        secret_access_key = '***';
SELECT count(*)
FROM gcs(creds, url='https://s3-object-url.csv')
```

## 分区写入 {#partitioned-write}

如果在插入数据到 `GCS` 表时指定 `PARTITION BY` 表达式，则为每个分区值创建一个单独的文件。将数据拆分为单独的文件有助于提高读取操作的效率。

**示例**

1. 使用键中的分区 ID 创建单独的文件：

```sql
INSERT INTO TABLE FUNCTION
    gcs('http://bucket.amazonaws.com/my_bucket/file_{_partition_id}.csv', 'CSV', 'a String, b UInt32, c UInt32')
    PARTITION BY a VALUES ('x', 2, 3), ('x', 4, 5), ('y', 11, 12), ('y', 13, 14), ('z', 21, 22), ('z', 23, 24);
```
结果是数据写入三个文件： `file_x.csv`、`file_y.csv` 和 `file_z.csv`。

2. 在存储桶名称中使用分区 ID 创建不同存储桶中的文件：

```sql
INSERT INTO TABLE FUNCTION
    gcs('http://bucket.amazonaws.com/my_bucket_{_partition_id}/file.csv', 'CSV', 'a UInt32, b UInt32, c UInt32')
    PARTITION BY a VALUES (1, 2, 3), (1, 4, 5), (10, 11, 12), (10, 13, 14), (20, 21, 22), (20, 23, 24);
```
结果是数据写入不同存储桶中的三个文件： `my_bucket_1/file.csv`、`my_bucket_10/file.csv` 和 `my_bucket_20/file.csv`。

**另见**

-   [S3 表函数](s3.md)
-   [S3 引擎](../../engines/table-engines/integrations/s3.md)
