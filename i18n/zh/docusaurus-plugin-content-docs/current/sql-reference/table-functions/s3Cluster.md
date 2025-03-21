---
slug: /sql-reference/table-functions/s3Cluster
sidebar_position: 181
sidebar_label: s3Cluster
title: 's3Cluster'
description: '对 s3 表函数的扩展，它允许在指定集群中的多个节点上并行处理来自 Amazon S3 和 Google Cloud Storage 的文件。'
---


# s3Cluster 表函数

这是对 [s3](sql-reference/table-functions/s3.md) 表函数的扩展。

允许在指定集群中的多个节点上并行处理来自 [Amazon S3](https://aws.amazon.com/s3/) 和 [Google Cloud Storage](https://cloud.google.com/storage/) 的文件。在发起节点上，它与集群中的所有节点建立连接，暴露 S3 文件路径中的星号，并动态分配每个文件。在工作节点上，它向发起节点询问下一个处理任务，并进行处理。这个过程会重复，直到所有任务完成。

**语法**

``` sql
s3Cluster(cluster_name, url [, NOSIGN | access_key_id, secret_access_key, [session_token]] [,format] [,structure] [,compression_method],[,headers])
s3Cluster(cluster_name, named_collection[, option=value [,..]])
```

**参数**

- `cluster_name` — 用于构建远程和本地服务器的地址和连接参数集的集群名称。
- `url` — 文件或一组文件的路径。在只读模式下支持以下通配符：`*`，`**`，`?`，`{'abc','def'}` 和 `{N..M}`，其中 `N`，`M` 为数字，`abc`，`def` 为字符串。有关更多信息，请参见 [路径中的通配符](../../engines/table-engines/integrations/s3.md#wildcards-in-path)。
- `NOSIGN` — 如果在凭证的位置提供此关键字，则所有请求将不被签名。
- `access_key_id` 和 `secret_access_key` — 指定与给定端点一起使用的凭证的密钥。可选。
- `session_token` - 使用给定密钥的会话令牌。在传递密钥时可选。
- `format` — 文件的 [格式](/sql-reference/formats)。
- `structure` — 表的结构。格式为 `'column1_name column1_type, column2_name column2_type, ...'`。
- `compression_method` — 参数为可选。支持的值：`none`，`gzip` 或 `gz`，`brotli` 或 `br`，`xz` 或 `LZMA`，`zstd` 或 `zst`。默认情况下，将根据文件扩展名自动检测压缩方法。
- `headers` - 参数为可选。允许在 S3 请求中传递头信息。格式为 `headers(key=value)` 例如 `headers('x-amz-request-payer' = 'requester')`。有关使用示例，请参见 [这里](/sql-reference/table-functions/s3#accessing-requester-pays-buckets)。

参数也可以使用 [命名集合](operations/named-collections.md) 传递。在这种情况下，`url`，`access_key_id`，`secret_access_key`，`format`，`structure`，`compression_method` 的工作方式相同，同时支持一些额外参数：

 - `filename` — 如果指定，附加到 URL。
 - `use_environment_credentials` — 默认启用，允许使用环境变量 `AWS_CONTAINER_CREDENTIALS_RELATIVE_URI`，`AWS_CONTAINER_CREDENTIALS_FULL_URI`，`AWS_CONTAINER_AUTHORIZATION_TOKEN`，`AWS_EC2_METADATA_DISABLED` 传递额外参数。
 - `no_sign_request` — 默认禁用。
 - `expiration_window_seconds` — 默认值为 120。

**返回值**

一个具有指定结构的表，用于在指定文件中读取或写入数据。

**示例**

从 `/root/data/clickhouse` 和 `/root/data/database/` 文件夹中的所有文件选择数据，使用 `cluster_simple` 集群中的所有节点：

``` sql
SELECT * FROM s3Cluster(
    'cluster_simple',
    'http://minio1:9001/root/data/{clickhouse,database}/*',
    'minio',
    'minio123',
    'CSV',
    'name String, value UInt32, polygon Array(Array(Tuple(Float64, Float64)))'
) ORDER BY (name, value, polygon);
```

计算 `cluster_simple` 中所有文件的总行数：

:::tip
如果您的文件列表包含前导零的数字范围，则使用大括号分别为每个数字构造，或使用 `?`。
:::

对于生产用例，建议使用 [命名集合](operations/named-collections.md)。以下是示例：
``` sql

CREATE NAMED COLLECTION creds AS
        access_key_id = 'minio',
        secret_access_key = 'minio123';
SELECT count(*) FROM s3Cluster(
    'cluster_simple', creds, url='https://s3-object-url.csv',
    format='CSV', structure='name String, value UInt32, polygon Array(Array(Tuple(Float64, Float64)))'
)
```

## 访问私有和公共存储桶 {#accessing-private-and-public-buckets}

用户可以使用与 s3 函数文档相同的方法 [这里](/sql-reference/table-functions/s3#accessing-public-buckets)。

## 优化性能 {#optimizing-performance}

有关优化 s3 函数性能的详细信息，请参见 [我们详细的指南](/integrations/s3/performance)。

**另请参见**

- [S3 引擎](../../engines/table-engines/integrations/s3.md)
- [s3 表函数](../../sql-reference/table-functions/s3.md)
