---
description: '对 `s3` 表函数的扩展，允许在指定集群的多个节点上并行处理来自 Amazon S3 和 Google Cloud Storage 的文件。'
sidebar_label: 's3Cluster'
sidebar_position: 181
slug: /sql-reference/table-functions/s3Cluster
title: 's3Cluster'
doc_type: 'reference'
---



# s3Cluster 表函数

这是对 [s3](sql-reference/table-functions/s3.md) 表函数的扩展。

允许在指定集群中的多个节点上并行处理来自 [Amazon S3](https://aws.amazon.com/s3/) 和 [Google Cloud Storage](https://cloud.google.com/storage/) 的文件。在发起节点上，它会与集群中所有节点建立连接，展开 S3 文件路径中的通配符（*），并将每个文件动态分发出去。在工作节点上，它会向发起节点请求下一个要处理的任务并对其进行处理。该过程会反复执行，直到所有任务都完成为止。



## 语法 {#syntax}

```sql
s3Cluster(cluster_name, url[, NOSIGN | access_key_id, secret_access_key,[session_token]][, format][, structure][, compression_method][, headers][, extra_credentials])
s3Cluster(cluster_name, named_collection[, option=value [,..]])
```


## 参数 {#arguments}

| 参数                                    | 说明                                                                                                                                                                                                                                                                                              |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cluster_name`                          | 用于构建到远程和本地服务器的地址和连接参数集合的集群名称。                                                                                                                                                                                                                                        |
| `url`                                   | 指向单个文件或一组文件的路径。在只读模式下支持以下通配符：`*`、`**`、`?`、`{'abc','def'}` 和 `{N..M}`，其中 `N`、`M` 为数字，`abc`、`def` 为字符串。更多信息参见[路径中的通配符](../../engines/table-engines/integrations/s3.md#wildcards-in-path)。                                            |
| `NOSIGN`                                | 如果使用该关键字替代凭证，则所有请求都不会进行签名。                                                                                                                                                                                                                                              |
| `access_key_id` and `secret_access_key` | 指定在给定 endpoint 上使用的凭证密钥。可选。                                                                                                                                                                                                                                                       |
| `session_token`                         | 与给定密钥一起使用的会话令牌。在传递密钥时可选。                                                                                                                                                                                                                                                   |
| `format`                                | 文件的[格式](/sql-reference/formats)。                                                                                                                                                                                                                                                            |
| `structure`                             | 表的结构。格式为 `'column1_name column1_type, column2_name column2_type, ...'`。                                                                                                                                                                                                                 |
| `compression_method`                    | 可选参数。支持的取值：`none`、`gzip` 或 `gz`、`brotli` 或 `br`、`xz` 或 `LZMA`、`zstd` 或 `zst`。默认情况下，将根据文件扩展名自动检测压缩方法。                                                                                                              |
| `headers`                               | 可选参数。允许在 S3 请求中传递请求头。以 `headers(key=value)` 的格式传入，例如 `headers('x-amz-request-payer' = 'requester')`。使用示例参见[此处](/sql-reference/table-functions/s3#accessing-requester-pays-buckets)。                                       |
| `extra_credentials`                     | 可选。可以通过此参数传入 `roleARN`。示例参见[此处](/cloud/data-sources/secure-s3#access-your-s3-bucket-with-the-clickhouseaccess-role)。                                                                                                                    |

参数也可以通过[命名集合](operations/named-collections.md)传递。在这种情况下，`url`、`access_key_id`、`secret_access_key`、`format`、`structure`、`compression_method` 的行为与前面描述相同，并且还支持一些额外的参数：

| 参数                          | 说明                                                                                                                                                                                                                              |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `filename`                    | 如果指定，则会附加到 url 之后。                                                                                                                                                                                                   |
| `use_environment_credentials` | 默认启用，允许通过环境变量 `AWS_CONTAINER_CREDENTIALS_RELATIVE_URI`、`AWS_CONTAINER_CREDENTIALS_FULL_URI`、`AWS_CONTAINER_AUTHORIZATION_TOKEN`、`AWS_EC2_METADATA_DISABLED` 传入额外参数。                                       |
| `no_sign_request`             | 默认禁用。                                                                                                                                                                                                                        |
| `expiration_window_seconds`   | 默认值为 120。                                                                                                                                                                                                                    |


## 返回值 {#returned_value}

返回一个具有指定结构的表,用于在指定文件中读取或写入数据。


## 示例 {#examples}

使用 `cluster_simple` 集群中的所有节点,从 `/root/data/clickhouse` 和 `/root/data/database/` 文件夹中的所有文件选取数据:

```sql
SELECT * FROM s3Cluster(
    'cluster_simple',
    'http://minio1:9001/root/data/{clickhouse,database}/*',
    'minio',
    'ClickHouse_Minio_P@ssw0rd',
    'CSV',
    'name String, value UInt32, polygon Array(Array(Tuple(Float64, Float64)))'
) ORDER BY (name, value, polygon);
```

统计 `cluster_simple` 集群中所有文件的总行数:

:::tip
如果文件列表包含带前导零的数字范围,请对每个数字分别使用花括号结构,或使用 `?`。
:::

对于生产环境用例,建议使用[命名集合](operations/named-collections.md)。示例如下:

```sql

CREATE NAMED COLLECTION creds AS
        access_key_id = 'minio',
        secret_access_key = 'ClickHouse_Minio_P@ssw0rd';
SELECT count(*) FROM s3Cluster(
    'cluster_simple', creds, url='https://s3-object-url.csv',
    format='CSV', structure='name String, value UInt32, polygon Array(Array(Tuple(Float64, Float64)))'
)
```


## 访问私有和公共存储桶 {#accessing-private-and-public-buckets}

用户可以使用与 s3 函数文档中相同的方法,详见[此处](/sql-reference/table-functions/s3#accessing-public-buckets)。


## 优化性能 {#optimizing-performance}

有关优化 s3 函数性能的详细信息,请参阅[详细指南](/integrations/s3/performance)。


## 相关内容 {#related}

- [S3 引擎](../../engines/table-engines/integrations/s3.md)
- [s3 表函数](../../sql-reference/table-functions/s3.md)
