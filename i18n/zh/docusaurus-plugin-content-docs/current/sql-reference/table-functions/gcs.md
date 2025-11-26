---
description: '提供类似表的接口，用于对 Google Cloud Storage 中的数据执行 `SELECT` 和 `INSERT` 操作。需要 `Storage Object User` IAM 角色。'
keywords: ['gcs', 'bucket']
sidebar_label: 'gcs'
sidebar_position: 70
slug: /sql-reference/table-functions/gcs
title: 'gcs'
doc_type: 'reference'
---



# gcs 表函数

提供一个类表接口，用于在 [Google Cloud Storage（GCS）](https://cloud.google.com/storage/) 中执行 `SELECT` 和 `INSERT` 操作。需要具备 [`Storage Object User` IAM 角色](https://cloud.google.com/storage/docs/access-control/iam-roles)。

这是 [s3 表函数](../../sql-reference/table-functions/s3.md) 的别名。

如果集群中有多个副本，可以改用 [s3Cluster 函数](../../sql-reference/table-functions/s3Cluster.md)（同样适用于 GCS）来并行化写入。



## 语法

```sql
gcs(url [, NOSIGN | hmac_key, hmac_secret] [,format] [,structure] [,compression_method])
gcs(named_collection[, option=value [,..]])
```

:::tip GCS
GCS 表函数通过 GCS XML API 和 HMAC 密钥与 Google Cloud Storage 集成。
有关端点和 HMAC 的更多信息，请参阅 [Google 互操作性文档](https://cloud.google.com/storage/docs/interoperability)。
:::


## 参数

| 参数                           | 描述                                                                                                     |
| ---------------------------- | ------------------------------------------------------------------------------------------------------ |
| `url`                        | 文件在 bucket 中的路径。在只读模式下支持以下通配符：`*`、`**`、`?`、`{abc,def}` 和 `{N..M}`，其中 `N`、`M` 为数字，`'abc'`、`'def'` 为字符串。 |
| `NOSIGN`                     | 如果在凭证位置提供该关键字，则所有请求都不会进行签名。                                                                            |
| `hmac_key` and `hmac_secret` | 指定用于给定 endpoint 的凭证密钥。可选。                                                                              |
| `format`                     | 文件的[格式](/sql-reference/formats)。                                                                       |
| `structure`                  | 表结构。格式：`'column1_name column1_type, column2_name column2_type, ...'`。                                  |
| `compression_method`         | 可选参数。支持的值：`none`、`gzip` 或 `gz`、`brotli` 或 `br`、`xz` 或 `LZMA`、`zstd` 或 `zst`。默认情况下，将根据文件扩展名自动检测压缩方法。    |

:::note GCS
GCS 路径采用此格式，是因为 Google XML API 的 endpoint 与 JSON API 不同：

```text
  https://storage.googleapis.com/<bucket>/<folder>/<filename(s)>
```

而不是 ~~[https://storage.cloud.google.com](https://storage.cloud.google.com)~~。
:::

参数也可以通过[命名集合](operations/named-collections.md)进行传递。在这种情况下，`url`、`format`、`structure`、`compression_method` 的行为相同，并且还支持一些额外参数：

| Parameter                     | Description                                                                                                                                                         |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `access_key_id`               | `hmac_key`，可选。                                                                                                                                                      |
| `secret_access_key`           | `hmac_secret`，可选。                                                                                                                                                   |
| `filename`                    | 如果指定，则会追加到 URL 末尾。                                                                                                                                                  |
| `use_environment_credentials` | 默认启用，允许通过环境变量 `AWS_CONTAINER_CREDENTIALS_RELATIVE_URI`、`AWS_CONTAINER_CREDENTIALS_FULL_URI`、`AWS_CONTAINER_AUTHORIZATION_TOKEN`、`AWS_EC2_METADATA_DISABLED` 传递额外参数。 |
| `no_sign_request`             | 默认禁用。                                                                                                                                                               |
| `expiration_window_seconds`   | 默认值为 120。                                                                                                                                                           |


## 返回值 {#returned_value}

具有指定结构的表，用于从指定文件读取或向其写入数据。



## 示例

从 GCS 文件 `https://storage.googleapis.com/my-test-bucket-768/data.csv` 中选取表的前两行：

```sql
SELECT *
FROM gcs('https://storage.googleapis.com/clickhouse_public_datasets/my-test-bucket-768/data.csv.gz', 'CSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
LIMIT 2;
```

```text
┌─column1─┬─column2─┬─column3─┐
│       1 │       2 │       3 │
│       3 │       2 │       1 │
└─────────┴─────────┴─────────┘
```

类似的示例，不过来自使用 `gzip` 压缩方式的文件：

```sql
SELECT *
FROM gcs('https://storage.googleapis.com/clickhouse_public_datasets/my-test-bucket-768/data.csv.gz', 'CSV', 'column1 UInt32, column2 UInt32, column3 UInt32', 'gzip')
LIMIT 2;
```

```text
┌─column1─┬─column2─┬─column3─┐
│       1 │       2 │       3 │
│       3 │       2 │       1 │
└─────────┴─────────┴─────────┘
```


## 用法

假设我们在 GCS 中有若干文件，其 URI 如下：

* &#39;[https://storage.googleapis.com/my-test-bucket-768/some&#95;prefix/some&#95;file&#95;1.csv](https://storage.googleapis.com/my-test-bucket-768/some_prefix/some_file_1.csv)&#39;
* &#39;[https://storage.googleapis.com/my-test-bucket-768/some&#95;prefix/some&#95;file&#95;2.csv](https://storage.googleapis.com/my-test-bucket-768/some_prefix/some_file_2.csv)&#39;
* &#39;[https://storage.googleapis.com/my-test-bucket-768/some&#95;prefix/some&#95;file&#95;3.csv](https://storage.googleapis.com/my-test-bucket-768/some_prefix/some_file_3.csv)&#39;
* &#39;[https://storage.googleapis.com/my-test-bucket-768/some&#95;prefix/some&#95;file&#95;4.csv](https://storage.googleapis.com/my-test-bucket-768/some_prefix/some_file_4.csv)&#39;
* &#39;[https://storage.googleapis.com/my-test-bucket-768/another&#95;prefix/some&#95;file&#95;1.csv](https://storage.googleapis.com/my-test-bucket-768/another_prefix/some_file_1.csv)&#39;
* &#39;[https://storage.googleapis.com/my-test-bucket-768/another&#95;prefix/some&#95;file&#95;2.csv](https://storage.googleapis.com/my-test-bucket-768/another_prefix/some_file_2.csv)&#39;
* &#39;[https://storage.googleapis.com/my-test-bucket-768/another&#95;prefix/some&#95;file&#95;3.csv](https://storage.googleapis.com/my-test-bucket-768/another_prefix/some_file_3.csv)&#39;
* &#39;[https://storage.googleapis.com/my-test-bucket-768/another&#95;prefix/some&#95;file&#95;4.csv](https://storage.googleapis.com/my-test-bucket-768/another_prefix/some_file_4.csv)&#39;

统计文件名以数字 1 到 3 结尾的文件中的行数：

```sql
SELECT count(*)
FROM gcs('https://storage.googleapis.com/clickhouse_public_datasets/my-test-bucket-768/{some,another}_prefix/some_file_{1..3}.csv', 'CSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
```

```text
┌─count()─┐
│      18 │
└─────────┘
```

计算这两个目录中所有文件的总行数：

```sql
SELECT count(*)
FROM gcs('https://storage.googleapis.com/clickhouse_public_datasets/my-test-bucket-768/{some,another}_prefix/*', 'CSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
```

```text
┌─count()─┐
│      24 │
└─────────┘
```

:::warning
如果你的文件列表中包含带前导零的编号范围，请对每一位数字分别使用花括号的形式，或者使用 `?`。
:::

统计名为 `file-000.csv`、`file-001.csv`、…、`file-999.csv` 这些文件中的总行数：

```sql
SELECT count(*)
FROM gcs('https://storage.googleapis.com/clickhouse_public_datasets/my-test-bucket-768/big_prefix/file-{000..999}.csv', 'CSV', 'name String, value UInt32');
```

```text
┌─count()─┐
│      12 │
└─────────┘
```

向文件 `test-data.csv.gz` 中插入数据：

```sql
INSERT INTO FUNCTION gcs('https://storage.googleapis.com/my-test-bucket-768/test-data.csv.gz', 'CSV', 'name String, value UInt32', 'gzip')
VALUES ('test-data', 1), ('test-data-2', 2);
```

将现有表中的数据导出到文件 `test-data.csv.gz`：

```sql
INSERT INTO FUNCTION gcs('https://storage.googleapis.com/my-test-bucket-768/test-data.csv.gz', 'CSV', 'name String, value UInt32', 'gzip')
SELECT name, value FROM existing_table;
```

Glob 模式 `**` 可用于递归遍历目录。参考以下示例，它会递归地获取 `my-test-bucket-768` 目录下的所有文件：

```sql
SELECT * FROM gcs('https://storage.googleapis.com/my-test-bucket-768/**', 'CSV', 'name String, value UInt32', 'gzip');
```

下面的示例将递归地从 `my-test-bucket` 目录下各级子目录中的所有 `test-data.csv.gz` 文件中获取数据：

```sql
SELECT * FROM gcs('https://storage.googleapis.com/my-test-bucket-768/**/test-data.csv.gz', 'CSV', 'name String, value UInt32', 'gzip');
```

在生产环境中，推荐使用[命名集合](operations/named-collections.md)。示例如下：

```sql

CREATE NAMED COLLECTION creds AS
        access_key_id = '***',
        secret_access_key = '***';
SELECT count(*)
FROM gcs(creds, url='https://s3-object-url.csv')
```


## 分区写入

如果在向 `GCS` 表插入数据时指定了 `PARTITION BY` 表达式，则会为每个分区值创建一个单独的文件。将数据拆分为多个独立文件有助于提升读操作的效率。

**示例**

1. 在键中使用分区 ID 会创建单独的文件：

```sql
INSERT INTO TABLE FUNCTION
    gcs('http://bucket.amazonaws.com/my_bucket/file_{_partition_id}.csv', 'CSV', 'a String, b UInt32, c UInt32')
    PARTITION BY a VALUES ('x', 2, 3), ('x', 4, 5), ('y', 11, 12), ('y', 13, 14), ('z', 21, 22), ('z', 23, 24);
```

因此，数据会被写入三个文件：`file_x.csv`、`file_y.csv` 和 `file_z.csv`。

2. 在 bucket 名称中使用分区 ID 会在不同的 bucket 中生成文件：

```sql
INSERT INTO TABLE FUNCTION
    gcs('http://bucket.amazonaws.com/my_bucket_{_partition_id}/file.csv', 'CSV', 'a UInt32, b UInt32, c UInt32')
    PARTITION BY a VALUES (1, 2, 3), (1, 4, 5), (10, 11, 12), (10, 13, 14), (20, 21, 22), (20, 23, 24);
```

因此，数据将被写入位于不同 bucket 中的三个文件：`my_bucket_1/file.csv`、`my_bucket_10/file.csv` 和 `my_bucket_20/file.csv`。


## 相关 {#related}
- [S3 表函数](s3.md)
- [S3 引擎](../../engines/table-engines/integrations/s3.md)
