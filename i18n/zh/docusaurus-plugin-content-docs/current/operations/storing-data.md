---
description: 'highlight-next-line 的文档'
sidebar_label: '用于存储数据的外部磁盘'
sidebar_position: 68
slug: /operations/storing-data
title: '用于存储数据的外部磁盘'
doc_type: 'guide'
---

在 ClickHouse 中处理的数据通常存储在运行 ClickHouse 服务器的
机器的本地文件系统中。这需要大容量磁盘，而这可能比较昂贵。为了避免在本地存储数据，ClickHouse 支持多种存储选项：
1. [Amazon S3](https://aws.amazon.com/s3/) 对象存储。
2. [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs)。
3. 不受支持：Hadoop 分布式文件系统（[HDFS](https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html)）

<br/>

:::note 
ClickHouse 还支持外部表引擎，它们与本页所描述的外部存储选项不同，因为这些引擎允许读取以通用文件格式（例如 Parquet）存储的数据。本页描述的是 ClickHouse `MergeTree` 系列表或 `Log` 系列表的存储配置。

1. 要处理存储在 `Amazon S3` 磁盘上的数据，请使用 [S3](/engines/table-engines/integrations/s3.md) 表引擎。
2. 要处理存储在 Azure Blob Storage 中的数据，请使用 [AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage.md) 表引擎。
3. 要处理 Hadoop 分布式文件系统（不受支持）中的数据，请使用 [HDFS](/engines/table-engines/integrations/hdfs.md) 表引擎。
:::

## 配置外部存储 {#configuring-external-storage}

[`MergeTree`](/engines/table-engines/mergetree-family/mergetree.md) 和 [`Log`](/engines/table-engines/log-family/log.md)
系列表引擎可以通过使用类型分别为 `s3`、`azure_blob_storage`、`hdfs`（不支持）的磁盘，将数据存储到 `S3`、`AzureBlobStorage`、`HDFS`（不支持）中。

磁盘配置需要：

1. 一个 `type` 段，其值为 `s3`、`azure_blob_storage`、`hdfs`（不支持）、`local_blob_storage`、`web` 之一。
2. 指定相应外部存储类型的配置。

从 ClickHouse 24.1 版本起，可以使用一个新的配置选项。
它需要指定：

1. 一个 `type`，其值为 `object_storage`
2. 一个 `object_storage_type`，其值为 `s3`、`azure_blob_storage`（或从 `24.3` 起简写为 `azure`）、`hdfs`（不支持）、`local_blob_storage`（或从 `24.3` 起简写为 `local`）、`web` 之一。

<br />

可以选配 `metadata_type`（默认值为 `local`），也可以将其设置为 `plain`、`web`，并且从 `24.4` 起可以设置为 `plain_rewritable`。
`plain` 元数据类型的用法在 [plain 存储部分](/operations/storing-data#plain-storage)中进行了说明；`web` 元数据类型只能与 `web` 对象存储类型一起使用；`local` 元数据类型会在本地存储元数据文件（每个元数据文件都包含对象存储中文件的映射关系，以及关于这些文件的一些附加元信息）。

例如：

```xml
<s3>
    <type>s3</type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3>
```

相当于以下配置（自 `24.1` 版本起）：

```xml
<s3>
    <type>object_storage</type>
    <object_storage_type>s3</object_storage_type>
    <metadata_type>local</metadata_type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3>
```

如下配置：

```xml
<s3_plain>
    <type>s3_plain</type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain>
```

等于：

```xml
<s3_plain>
    <type>object_storage</type>
    <object_storage_type>s3</object_storage_type>
    <metadata_type>plain</metadata_type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain>
```

一个完整的存储配置示例如下：

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <s3>
                <type>s3</type>
                <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
                <use_environment_credentials>1</use_environment_credentials>
            </s3>
        </disks>
        <policies>
            <s3>
                <volumes>
                    <main>
                        <disk>s3</disk>
                    </main>
                </volumes>
            </s3>
        </policies>
    </storage_configuration>
</clickhouse>
```

从 24.1 版本开始，它还可以写成：

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <s3>
                <type>object_storage</type>
                <object_storage_type>s3</object_storage_type>
                <metadata_type>local</metadata_type>
                <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
                <use_environment_credentials>1</use_environment_credentials>
            </s3>
        </disks>
        <policies>
            <s3>
                <volumes>
                    <main>
                        <disk>s3</disk>
                    </main>
                </volumes>
            </s3>
        </policies>
    </storage_configuration>
</clickhouse>
```

要将特定类型的存储设为所有 `MergeTree` 表的默认选项，
请在配置文件中添加以下配置段：

```xml
<clickhouse>
    <merge_tree>
        <storage_policy>s3</storage_policy>
    </merge_tree>
</clickhouse>
```

要为某个特定表配置专用的存储策略，可以在创建该表时通过 `SETTINGS` 子句进行定义：

```sql
CREATE TABLE test (a Int32, b String)
ENGINE = MergeTree() ORDER BY a
SETTINGS storage_policy = 's3';
```

你也可以使用 `disk` 替代 `storage_policy`。在这种情况下，无需在配置文件中包含 `storage_policy` 部分，只保留一个 `disk` 部分即可。

```sql
CREATE TABLE test (a Int32, b String)
ENGINE = MergeTree() ORDER BY a
SETTINGS disk = 's3';
```

## 动态配置 {#dynamic-configuration}

还可以在无需在配置文件中预先定义磁盘的情况下指定存储配置，而是通过
`CREATE`/`ATTACH` 查询的设置来进行配置。

下面的示例查询基于上述动态磁盘配置，并展示如何使用本地磁盘
来缓存存储在某个 URL 上的表的数据。

```sql
ATTACH TABLE uk_price_paid UUID 'cf712b4f-2ca8-435c-ac23-c4393efe52f7'
(
    price UInt32,
    date Date,
    postcode1 LowCardinality(String),
    postcode2 LowCardinality(String),
    type Enum8('other' = 0, 'terraced' = 1, 'semi-detached' = 2, 'detached' = 3, 'flat' = 4),
    is_new UInt8,
    duration Enum8('unknown' = 0, 'freehold' = 1, 'leasehold' = 2),
    addr1 String,
    addr2 String,
    street LowCardinality(String),
    locality LowCardinality(String),
    town LowCardinality(String),
    district LowCardinality(String),
    county LowCardinality(String)
)
ENGINE = MergeTree
ORDER BY (postcode1, postcode2, addr1, addr2)
  -- highlight-start
  SETTINGS disk = disk(
    type=web,
    endpoint='https://raw.githubusercontent.com/ClickHouse/web-tables-demo/main/web/'
  );
  -- highlight-end
```

以下示例演示如何为外部存储添加缓存。

```sql
ATTACH TABLE uk_price_paid UUID 'cf712b4f-2ca8-435c-ac23-c4393efe52f7'
(
    price UInt32,
    date Date,
    postcode1 LowCardinality(String),
    postcode2 LowCardinality(String),
    type Enum8('other' = 0, 'terraced' = 1, 'semi-detached' = 2, 'detached' = 3, 'flat' = 4),
    is_new UInt8,
    duration Enum8('unknown' = 0, 'freehold' = 1, 'leasehold' = 2),
    addr1 String,
    addr2 String,
    street LowCardinality(String),
    locality LowCardinality(String),
    town LowCardinality(String),
    district LowCardinality(String),
    county LowCardinality(String)
)
ENGINE = MergeTree
ORDER BY (postcode1, postcode2, addr1, addr2)
-- highlight-start
  SETTINGS disk = disk(
    type=cache,
    max_size='1Gi',
    path='/var/lib/clickhouse/custom_disk_cache/',
    disk=disk(
      type=web,
      endpoint='https://raw.githubusercontent.com/ClickHouse/web-tables-demo/main/web/'
      )
  );
-- highlight-end
```

在下方高亮显示的配置中可以看到，`type=web` 的磁盘被嵌套在
`type=cache` 的磁盘之内。

:::note
本示例使用了 `type=web`，但任何磁盘类型都可以配置为动态的，
包括本地磁盘。本地磁盘要求其路径参数位于服务器配置参数
`custom_local_disks_base_directory` 指定的目录下。该参数没有默认值，因此在使用本地磁盘时也需要进行设置。
:::

还可以组合使用基于配置文件的配置和基于 SQL 定义的配置：

```sql
ATTACH TABLE uk_price_paid UUID 'cf712b4f-2ca8-435c-ac23-c4393efe52f7'
(
    price UInt32,
    date Date,
    postcode1 LowCardinality(String),
    postcode2 LowCardinality(String),
    type Enum8('other' = 0, 'terraced' = 1, 'semi-detached' = 2, 'detached' = 3, 'flat' = 4),
    is_new UInt8,
    duration Enum8('unknown' = 0, 'freehold' = 1, 'leasehold' = 2),
    addr1 String,
    addr2 String,
    street LowCardinality(String),
    locality LowCardinality(String),
    town LowCardinality(String),
    district LowCardinality(String),
    county LowCardinality(String)
)
ENGINE = MergeTree
ORDER BY (postcode1, postcode2, addr1, addr2)
  -- highlight-start
  SETTINGS disk = disk(
    type=cache,
    max_size='1Gi',
    path='/var/lib/clickhouse/custom_disk_cache/',
    disk=disk(
      type=web,
      endpoint='https://raw.githubusercontent.com/ClickHouse/web-tables-demo/main/web/'
      )
  );
  -- highlight-end
```

其中的 `web` 来自服务器配置文件：

```xml
<storage_configuration>
    <disks>
        <web>
            <type>web</type>
            <endpoint>'https://raw.githubusercontent.com/ClickHouse/web-tables-demo/main/web/'</endpoint>
        </web>
    </disks>
</storage_configuration>
```

### 使用 S3 存储 {#s3-storage}

#### 必需参数 {#required-parameters-s3}

| Parameter           | Description                                                                                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `endpoint`          | 使用 `path` 或 `virtual hosted` [风格](https://docs.aws.amazon.com/AmazonS3/latest/dev/VirtualHosting.html) 的 S3 endpoint URL。应包含用于数据存储的 bucket 和根路径。 |
| `access_key_id`     | 用于身份验证的 S3 access key ID。                                                                                                                        |
| `secret_access_key` | 用于身份验证的 S3 secret access key。                                                                                                                    |

#### 可选参数 {#optional-parameters-s3}

| Parameter                                       | Description                                                                                                                                                                                                                                   | Default Value                            |
|-------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------|
| `region`                                        | S3 区域名称。                                                                                                                                                                                                                                | -                                        |
| `support_batch_delete`                          | 控制是否检查是否支持批量删除。在使用 Google Cloud Storage (GCS) 时将其设置为 `false`，因为 GCS 不支持批量删除。                                                                                                                              | `true`                                   |
| `use_environment_credentials`                   | 如果存在，则从环境变量 `AWS_ACCESS_KEY_ID`、`AWS_SECRET_ACCESS_KEY` 和 `AWS_SESSION_TOKEN` 中读取 AWS 凭证。                                                                                                                                | `false`                                  |
| `use_insecure_imds_request`                     | 如果为 `true`，在从 Amazon EC2 元数据获取凭证时使用不安全的 IMDS 请求。                                                                                                                                                                     | `false`                                  |
| `expiration_window_seconds`                     | 检查基于过期时间的凭证是否已过期的宽限期（秒）。                                                                                                                                                                                             | `120`                                    |
| `proxy`                                         | S3 endpoint 的代理配置。`proxy` 块中的每个 `uri` 元素都应包含一个代理 URL。                                                                                                                                                                  | -                                        |
| `connect_timeout_ms`                            | 套接字连接超时时间（毫秒）。                                                                                                                                                                                                                | `10000`（10 秒）                         |
| `request_timeout_ms`                            | 请求超时时间（毫秒）。                                                                                                                                                                                                                       | `5000`（5 秒）                           |
| `retry_attempts`                                | 失败请求的重试次数。                                                                                                                                                                                                                         | `10`                                     |
| `single_read_retries`                           | 读操作期间连接中断时的重试次数。                                                                                                                                                                                                             | `4`                                      |
| `min_bytes_for_seek`                            | 使用 seek 操作而不是顺序读取所需的最小字节数。                                                                                                                                                                                               | `1 MB`                                   |
| `metadata_path`                                 | 用于存储 S3 元数据文件的本地文件系统路径。                                                                                                                                                                                                  | `/var/lib/clickhouse/disks/<disk_name>/` |
| `skip_access_check`                             | 如果为 `true`，在启动过程中跳过磁盘访问检查。                                                                                                                                                                                               | `false`                                  |
| `header`                                        | 向请求添加指定的 HTTP 头。可以指定多次。                                                                                                                                                                                                     | -                                        |
| `server_side_encryption_customer_key_base64`    | 访问使用 SSE-C 加密的 S3 对象所需的 HTTP 头。                                                                                                                                                                                                | -                                        |
| `server_side_encryption_kms_key_id`             | 访问使用 [SSE-KMS 加密](https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingKMSEncryption.html) 的 S3 对象所需的 HTTP 头。空字符串表示使用 AWS 管理的 S3 密钥。                                                                       | -                                        |
| `server_side_encryption_kms_encryption_context` | SSE-KMS 的加密上下文 HTTP 头（与 `server_side_encryption_kms_key_id` 一起使用）。                                                                                                                                                            | -                                        |
| `server_side_encryption_kms_bucket_key_enabled` | 为 SSE-KMS 启用 S3 bucket key（与 `server_side_encryption_kms_key_id` 一起使用）。                                                                                                                                                           | 与 bucket 级别设置保持一致              |
| `s3_max_put_rps`                                | 在触发限流前允许的最大 PUT 请求数（每秒）。                                                                                                                                                                                                  | `0`（不限）                              |
| `s3_max_put_burst`                              | 触及 RPS 限制前允许的最大并发 PUT 请求数。                                                                                                                                                                                                   | 与 `s3_max_put_rps` 相同                 |
| `s3_max_get_rps`                                | 在触发限流前允许的最大 GET 请求数（每秒）。                                                                                                                                                                                                  | `0`（不限）                              |
| `s3_max_get_burst`                              | 触及 RPS 限制前允许的最大并发 GET 请求数。                                                                                                                                                                                                   | 与 `s3_max_get_rps` 相同                 |
| `read_resource`                                 | 用于[调度](/operations/workload-scheduling.md)读请求的资源名称。                                                                                                                                                                             | 空字符串（禁用）                         |
| `write_resource`                                | 用于[调度](/operations/workload-scheduling.md)写请求的资源名称。                                                                                                                                                                             | 空字符串（禁用）                         |
| `key_template`                                  | 使用 [re2](https://github.com/google/re2/wiki/Syntax) 语法定义对象 key 生成格式。需要 `storage_metadata_write_full_object_key` 标志。与 `endpoint` 中的 `root path` 不兼容。需要 `key_compatibility_prefix`。                                 | -                                        |
| `key_compatibility_prefix`                      | 与 `key_template` 一起使用。指定 `endpoint` 中之前的 `root path`，用于读取旧版本元数据。                                                                                                                                                     | -                                        |
| `read_only`                                      | 只允许从该磁盘读取数据。                                                                                                                                                                                                                     | -                                        |
:::note
也支持使用类型 `s3` 的 Google Cloud Storage (GCS)。参见[基于 GCS 的 MergeTree](/integrations/gcs)。
:::

### 使用 Plain Storage {#plain-storage}

在 `22.10` 中引入了一种新的磁盘类型 `s3_plain`，它提供只写一次的存储。
其配置参数与 `s3` 磁盘类型相同。
与 `s3` 磁盘类型不同，它按原样存储数据。换句话说，
它不会使用随机生成的 blob 名称，而是使用普通文件名
（与 ClickHouse 在本地磁盘上存储文件的方式相同），并且不会在本地存储任何
元数据。例如，这些元数据是从 `s3` 上的数据中推导而来。

这种磁盘类型允许保留表的静态版本，因为它不允许对现有数据执行合并，
也不允许插入新数据。该磁盘类型的一个用例是在其上创建备份，
可以通过 `BACKUP TABLE data TO Disk('plain_disk_name', 'backup_name')` 完成。
之后，可以执行
`RESTORE TABLE data AS data_restored FROM Disk('plain_disk_name', 'backup_name')`
或者使用
`ATTACH TABLE data (...) ENGINE = MergeTree() SETTINGS disk = 'plain_disk_name'`。

配置：

```xml
<s3_plain>
    <type>s3_plain</type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain>
```

从 `24.1` 版本开始，可以使用 `plain` 元数据类型来配置任意对象存储磁盘（`s3`、`azure`、`hdfs`（不支持）、`local`）。

配置：

```xml
<s3_plain>
    <type>object_storage</type>
    <object_storage_type>azure</object_storage_type>
    <metadata_type>plain</metadata_type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain>
```

### 使用 S3 Plain Rewritable 存储 {#s3-plain-rewritable-storage}

在 `24.4` 中引入了一种新的磁盘类型 `s3_plain_rewritable`。
与 `s3_plain` 磁盘类型类似，它不需要额外的存储空间来保存
元数据文件，而是将元数据存储在 S3 中。
不同于 `s3_plain` 磁盘类型，`s3_plain_rewritable` 允许执行合并操作，
并支持 `INSERT` 操作。
不支持[变更](/sql-reference/statements/alter#mutations)和表的复制。

此磁盘类型的一个使用场景是非复制的 `MergeTree` 表。尽管
`s3` 磁盘类型适用于非复制的 `MergeTree` 表，如果不需要表的本地元数据，
并且可以接受受限的操作集，则可以选择使用 `s3_plain_rewritable` 磁盘类型。
例如，这对于系统表可能会很有用。

配置：

```xml
<s3_plain_rewritable>
    <type>s3_plain_rewritable</type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain_rewritable>
```

等于

```xml
<s3_plain_rewritable>
    <type>object_storage</type>
    <object_storage_type>s3</object_storage_type>
    <metadata_type>plain_rewritable</metadata_type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain_rewritable>
```

从 `24.5` 版本起，可以使用 `plain_rewritable` 元数据类型来配置任意对象存储磁盘（`s3`、`azure`、`local`）。

### 使用 Azure Blob Storage {#azure-blob-storage}

`MergeTree` 系列的表引擎可以使用类型为 `azure_blob_storage` 的磁盘将数据存储到 [Azure Blob Storage](https://azure.microsoft.com/en-us/services/storage/blobs/)。

配置示例：

```xml
<storage_configuration>
    ...
    <disks>
        <blob_storage_disk>
            <type>azure_blob_storage</type>
            <storage_account_url>http://account.blob.core.windows.net</storage_account_url>
            <container_name>container</container_name>
            <account_name>account</account_name>
            <account_key>pass123</account_key>
            <metadata_path>/var/lib/clickhouse/disks/blob_storage_disk/</metadata_path>
            <cache_path>/var/lib/clickhouse/disks/blob_storage_disk/cache/</cache_path>
            <skip_access_check>false</skip_access_check>
        </blob_storage_disk>
    </disks>
    ...
</storage_configuration>
```

#### 连接参数 {#azure-blob-storage-connection-parameters}

| 参数                               | 描述                                                                                                              | 默认值                 |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------- |
| `storage_account_url` (Required) | Azure Blob Storage 帐户 URL。例如：`http://account.blob.core.windows.net` 或 `http://azurite1:10000/devstoreaccount1`。 | -                   |
| `container_name`                 | 目标容器名称。                                                                                                         | `default-container` |
| `container_already_exists`       | 控制容器创建行为：<br />- `false`：创建一个新容器 <br />- `true`：直接连接到已存在的容器 <br />- 未设置：检查容器是否存在，如不存在则创建                        | -                   |

身份验证参数（磁盘会尝试所有可用方法 **以及** Managed Identity Credential（托管身份凭据））：

| 参数                  | 描述                                   |
| ------------------- | ------------------------------------ |
| `connection_string` | 使用连接字符串进行身份验证。                       |
| `account_name`      | 使用共享密钥进行身份验证（与 `account_key` 配合使用）。  |
| `account_key`       | 使用共享密钥进行身份验证（与 `account_name` 配合使用）。 |

#### 限制参数 {#azure-blob-storage-limit-parameters}

| 参数                                   | 描述                             |
| ------------------------------------ | ------------------------------ |
| `s3_max_single_part_upload_size`     | 向 Blob Storage 上传单个分块的最大大小。    |
| `min_bytes_for_seek`                 | 可随机访问（seekable）区域的最小大小。        |
| `max_single_read_retries`            | 从 Blob Storage 读取一段数据的最大重试次数。  |
| `max_single_download_retries`        | 从 Blob Storage 下载可读缓冲区的最大重试次数。 |
| `thread_pool_size`                   | 用于实例化 `IDiskRemote` 的最大线程数。    |
| `s3_max_inflight_parts_for_one_file` | 针对单个对象的最大并发 PUT 请求数。           |

#### 其他参数 {#azure-blob-storage-other-parameters}

| 参数                               | 描述                                                   | 默认值                                      |
| -------------------------------- | ---------------------------------------------------- | ---------------------------------------- |
| `metadata_path`                  | 用于存储 Blob Storage 元数据文件的本地文件系统路径。                    | `/var/lib/clickhouse/disks/<disk_name>/` |
| `skip_access_check`              | 如果为 `true`，则在启动期间跳过磁盘访问检查。                           | `false`                                  |
| `read_resource`                  | 用于[调度](/operations/workload-scheduling.md)读取请求的资源名称。 | 空字符串（禁用）                                 |
| `write_resource`                 | 用于[调度](/operations/workload-scheduling.md)写入请求的资源名称。 | 空字符串（禁用）                                 |
| `metadata_keep_free_space_bytes` | 需要预留的元数据磁盘空闲空间大小。                                    | -                                        |

在集成测试目录中可以找到工作配置示例（例如 [test&#95;merge&#95;tree&#95;azure&#95;blob&#95;storage](https://github.com/ClickHouse/ClickHouse/blob/master/tests/integration/test_merge_tree_azure_blob_storage/configs/config.d/storage_conf.xml) 或 [test&#95;azure&#95;blob&#95;storage&#95;zero&#95;copy&#95;replication](https://github.com/ClickHouse/ClickHouse/blob/master/tests/integration/test_azure_blob_storage_zero_copy_replication/configs/config.d/storage_conf.xml)）。

:::note 零拷贝复制尚未准备好用于生产环境
在 ClickHouse 22.8 及更高版本中，零拷贝复制默认禁用。该功能不建议在生产环境中使用。
:::

## 使用 HDFS 存储（不受支持） {#using-hdfs-storage-unsupported}

在此示例配置中：

* 磁盘类型为 `hdfs`（不受支持）
* 数据托管在 `hdfs://hdfs1:9000/clickhouse/`

需要注意的是，HDFS 当前不受支持，因此在使用时可能会遇到问题。如果遇到问题并找到解决方案，欢迎提交 pull request 贡献修复。

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <hdfs>
                <type>hdfs</type>
                <endpoint>hdfs://hdfs1:9000/clickhouse/</endpoint>
                <skip_access_check>true</skip_access_check>
            </hdfs>
            <hdd>
                <type>local</type>
                <path>/</path>
            </hdd>
        </disks>
        <policies>
            <hdfs>
                <volumes>
                    <main>
                        <disk>hdfs</disk>
                    </main>
                    <external>
                        <disk>hdd</disk>
                    </external>
                </volumes>
            </hdfs>
        </policies>
    </storage_configuration>
</clickhouse>
```

请注意，HDFS 在某些极端情况下可能无法正常工作。

### 使用数据加密 {#encrypted-virtual-file-system}

可以对存储在 [S3](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3)、[HDFS](#using-hdfs-storage-unsupported)（不受支持）等外部磁盘，或本地磁盘上的数据进行加密。要启用加密模式，必须在配置文件中定义一个类型为 `encrypted` 的磁盘，并选择一个用于保存数据的底层磁盘。`encrypted` 磁盘会实时加密所有写入的文件，从 `encrypted` 磁盘读取文件时则会自动解密。因此，可以像使用普通磁盘一样使用 `encrypted` 磁盘。

磁盘配置示例：

```xml
<disks>
  <disk1>
    <type>local</type>
    <path>/path1/</path>
  </disk1>
  <disk2>
    <type>encrypted</type>
    <disk>disk1</disk>
    <path>path2/</path>
    <key>_16_ascii_chars_</key>
  </disk2>
</disks>
```

例如，当 ClickHouse 将某个表中的数据写入文件 `store/all_1_1_0/data.bin` 到 `disk1` 时，该文件实际会写入物理磁盘路径 `/path1/store/all_1_1_0/data.bin`。

当将同一个文件写入 `disk2` 时，实际上会以加密方式写入物理磁盘路径 `/path1/path2/store/all_1_1_0/data.bin`。

### 必需参数 {#required-parameters-encrypted-disk}

| Parameter | Type   | Description                                             |
| --------- | ------ | ------------------------------------------------------- |
| `type`    | String | 必须设置为 `encrypted` 才能创建加密磁盘。                             |
| `disk`    | String | 用于底层存储的磁盘类型。                                            |
| `key`     | Uint64 | 用于加密和解密的密钥。可以使用 `key_hex` 以十六进制形式指定。可以通过 `id` 属性指定多个密钥。 |

### 可选参数 {#optional-parameters-encrypted-disk}

| Parameter        | Type   | Default        | Description                                                                                        |
| ---------------- | ------ | -------------- | -------------------------------------------------------------------------------------------------- |
| `path`           | String | Root directory | 磁盘上保存数据的位置。                                                                                        |
| `current_key_id` | String | -              | 用于加密的密钥 ID。所有已指定的密钥都可用于解密。                                                                         |
| `algorithm`      | Enum   | `AES_128_CTR`  | 加密算法。选项：<br />- `AES_128_CTR`（16 字节密钥）<br />- `AES_192_CTR`（24 字节密钥）<br />- `AES_256_CTR`（32 字节密钥） |

磁盘配置示例：

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <disk_s3>
                <type>s3</type>
                <endpoint>...
            </disk_s3>
            <disk_s3_encrypted>
                <type>encrypted</type>
                <disk>disk_s3</disk>
                <algorithm>AES_128_CTR</algorithm>
                <key_hex id="0">00112233445566778899aabbccddeeff</key_hex>
                <key_hex id="1">ffeeddccbbaa99887766554433221100</key_hex>
                <current_key_id>1</current_key_id>
            </disk_s3_encrypted>
        </disks>
    </storage_configuration>
</clickhouse>
```

### 使用本地缓存 {#using-local-cache}

从 22.3 版本开始，可以在存储配置中为磁盘配置本地缓存。
在 22.3 - 22.7 版本中，缓存仅支持 `s3` 磁盘类型。对于 &gt;= 22.8 版本，缓存支持任意磁盘类型：S3、Azure、本地、加密等。
对于 &gt;= 23.5 版本，缓存仅支持远程磁盘类型：S3、Azure、HDFS（暂不支持）。
缓存使用 `LRU` 缓存策略。

适用于 22.8 及以上版本的配置示例：

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <s3>
                <type>s3</type>
                <endpoint>...</endpoint>
                ... S3 配置 ...
            </s3>
            <cache>
                <type>cache</type>
                <disk>s3</disk>
                <path>/s3_cache/</path>
                <max_size>10Gi</max_size>
            </cache>
        </disks>
        <policies>
            <s3_cache>
                <volumes>
                    <main>
                        <disk>cache</disk>
                    </main>
                </volumes>
            </s3_cache>
        <policies>
    </storage_configuration>
```

22.8 之前的版本配置示例：

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <s3>
                <type>s3</type>
                <endpoint>...</endpoint>
                ... S3 配置 ...
                <data_cache_enabled>1</data_cache_enabled>
                <data_cache_max_size>10737418240</data_cache_max_size>
            </s3>
        </disks>
        <policies>
            <s3_cache>
                <volumes>
                    <main>
                        <disk>s3</disk>
                    </main>
                </volumes>
            </s3_cache>
        <policies>
    </storage_configuration>
```

文件缓存 **磁盘配置参数**：

这些参数应在磁盘配置部分中定义。

| Parameter                             | Type    | Default    | Description                                                                                                                                                                                  |
|---------------------------------------|---------|------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `path`                                | String  | -          | **必需**。用于存储缓存的目录路径。                                                                                                                                                          |
| `max_size`                            | Size    | -          | **必需**。缓存的最大大小，可以是字节数或可读格式（例如 `10Gi`）。达到限制时，会使用 LRU 策略淘汰文件。支持 `ki`、`Mi`、`Gi` 格式（自 v22.10 起）。                                        |
| `cache_on_write_operations`           | Boolean | `false`    | 为 `INSERT` 查询和后台合并启用写穿缓存。可以通过 `enable_filesystem_cache_on_write_operations` 在每个查询级别进行覆盖。                                                                    |
| `enable_filesystem_query_cache_limit` | Boolean | `false`    | 基于 `max_query_cache_size` 启用按查询的缓存大小限制。                                                                                                                                      |
| `enable_cache_hits_threshold`         | Boolean | `false`    | 启用后，仅在数据被多次读取后才会将其缓存。                                                                                                                                                  |
| `cache_hits_threshold`                | Integer | `0`        | 将数据写入缓存前所需的读取次数（需要启用 `enable_cache_hits_threshold`）。                                                                                                                  |
| `enable_bypass_cache_with_threshold`  | Boolean | `false`    | 对大范围读取跳过缓存。                                                                                                                                                                      |
| `bypass_cache_threshold`              | Size    | `256Mi`    | 触发跳过缓存的读取范围大小（需要启用 `enable_bypass_cache_with_threshold`）。                                                                                                              |
| `max_file_segment_size`               | Size    | `8Mi`      | 单个缓存文件的最大大小，可以是字节数或可读格式。                                                                                                                                            |
| `max_elements`                        | Integer | `10000000` | 最大缓存文件数量。                                                                                                                                                                           |
| `load_metadata_threads`               | Integer | `16`       | 启动时用于加载缓存元数据的线程数。                                                                                                                                                          |

> **注意**：Size 值支持 `ki`、`Mi`、`Gi` 等单位（例如 `10Gi`）。

## 文件缓存查询/配置文件设置 {#file-cache-query-profile-settings}

| Setting                                                                 | Type    | Default                 | Description                                                                             |
| ----------------------------------------------------------------------- | ------- | ----------------------- | --------------------------------------------------------------------------------------- |
| `enable_filesystem_cache`                                               | Boolean | `true`                  | 针对单个查询启用或禁用缓存使用，即使使用的是 `cache` 磁盘类型。                                                    |
| `read_from_filesystem_cache_if_exists_otherwise_bypass_cache`           | Boolean | `false`                 | 启用后，仅在数据已存在于缓存中时才使用缓存；新的数据不会写入缓存。                                                       |
| `enable_filesystem_cache_on_write_operations`                           | Boolean | `false` (Cloud: `true`) | 启用写穿缓存。需要在缓存配置中设置 `cache_on_write_operations`。                                          |
| `enable_filesystem_cache_log`                                           | Boolean | `false`                 | 启用后会将详细的缓存使用情况记录到 `system.filesystem_cache_log`。                                        |
| `filesystem_cache_allow_background_download`                            | Boolean | `true`                  | 允许在后台完成部分已下载的分段。若禁用，则在当前查询/会话中始终在前台进行下载。                                                |
| `max_query_cache_size`                                                  | Size    | `false`                 | 每个查询可使用的最大缓存大小。需要在缓存配置中启用 `enable_filesystem_query_cache_limit`。                        |
| `filesystem_cache_skip_download_if_exceeds_per_query_cache_write_limit` | Boolean | `true`                  | 控制达到 `max_query_cache_size` 时的行为： <br />- `true`：停止下载新数据 <br />- `false`：淘汰旧数据以为新数据腾出空间 |

:::warning
缓存配置设置和缓存查询设置对应最新的 ClickHouse 版本，
在较早版本中，某些功能可能不受支持。
:::

#### 缓存系统表 {#cache-system-tables-file-cache}

| Table Name                    | Description        | Requirements                            |
| ----------------------------- | ------------------ | --------------------------------------- |
| `system.filesystem_cache`     | 显示文件系统缓存的当前状态。     | 无                                       |
| `system.filesystem_cache_log` | 提供每个查询的详细缓存使用统计信息。 | 需要 `enable_filesystem_cache_log = true` |

#### 缓存命令 {#cache-commands-file-cache}

##### `SYSTEM DROP FILESYSTEM CACHE (<cache_name>) (ON CLUSTER)` -- `ON CLUSTER` {#system-drop-filesystem-cache-on-cluster}

仅当未提供 `<cache_name>` 时才支持此命令。

##### `SHOW FILESYSTEM CACHES` {#show-filesystem-caches}

显示服务器上已配置的文件系统缓存列表。\
（对于版本小于或等于 `22.8`，该命令名称为 `SHOW CACHES`）

```sql title="Query"
显示文件系统缓存
```

```text title="Response"
┌─缓存──────┐
│ s3_cache  │
└───────────┘
```

##### `DESCRIBE FILESYSTEM CACHE '<cache_name>'` {#describe-filesystem-cache}

显示指定缓存的配置以及一些整体统计信息。
缓存名称可以通过 `SHOW FILESYSTEM CACHES` 命令获取。（对于版本小于或等于 `22.8` 的 ClickHouse，该命令名为 `DESCRIBE CACHE`）

```sql title="Query"
DESCRIBE FILESYSTEM CACHE 's3_cache'
```

```text title="Response"
┌────max_size─┬─max_elements─┬─max_file_segment_size─┬─boundary_alignment─┬─cache_on_write_operations─┬─cache_hits_threshold─┬─current_size─┬─current_elements─┬─path───────┬─background_download_threads─┬─enable_bypass_cache_with_threshold─┐
│ 10000000000 │      1048576 │             104857600 │            4194304 │                         1 │                    0 │         3276 │               54 │ /s3_cache/ │                           2 │                                  0 │
└─────────────┴──────────────┴───────────────────────┴────────────────────┴───────────────────────────┴──────────────────────┴──────────────┴──────────────────┴────────────┴─────────────────────────────┴────────────────────────────────────┘
```

| 缓存当前指标                    | 缓存异步指标                 | 缓存 Profile 事件                                                                             |
| ------------------------- | ---------------------- | ----------------------------------------------------------------------------------------- |
| `FilesystemCacheSize`     | `FilesystemCacheBytes` | `CachedReadBufferReadFromSourceBytes`, `CachedReadBufferReadFromCacheBytes`               |
| `FilesystemCacheElements` | `FilesystemCacheFiles` | `CachedReadBufferReadFromSourceMicroseconds`, `CachedReadBufferReadFromCacheMicroseconds` |
|                           |                        | `CachedReadBufferCacheWriteBytes`, `CachedReadBufferCacheWriteMicroseconds`               |
|                           |                        | `CachedWriteBufferCacheWriteBytes`, `CachedWriteBufferCacheWriteMicroseconds`             |

### 使用静态 Web 存储（只读） {#web-storage}

这是一个只读磁盘，其数据只会被读取，从不会被修改。通过 `ATTACH TABLE` 查询（见下方示例）将新表加载到该磁盘上。实际上不会使用本地磁盘，每个 `SELECT` 查询都会触发一次 `http` 请求以获取所需数据。所有对表数据的修改操作都会抛出异常，即不允许以下类型的查询：[`CREATE TABLE`](/sql-reference/statements/create/table.md)、[`ALTER TABLE`](/sql-reference/statements/alter/index.md)、[`RENAME TABLE`](/sql-reference/statements/rename#rename-table)、[`DETACH TABLE`](/sql-reference/statements/detach.md) 和 [`TRUNCATE TABLE`](/sql-reference/statements/truncate.md)。
Web 存储适用于只读场景。典型用例包括托管示例数据或执行数据迁移。有一个名为 `clickhouse-static-files-uploader` 的工具，用于为给定表准备数据目录（`SELECT data_paths FROM system.tables WHERE name = 'table_name'`）。对于每个所需的表，都会得到一个包含文件的目录。这些文件可以上传到例如提供静态文件的 Web 服务器上。完成上述准备后，就可以通过 `DiskWeb` 将该表加载到任意 ClickHouse 服务器中。

在此示例配置中：

* 磁盘类型为 `web`
* 数据托管在 `http://nginx:80/test1/`
* 使用了本地存储上的缓存

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <web>
                <type>web</type>
                <endpoint>http://nginx:80/test1/</endpoint>
            </web>
            <cached_web>
                <type>cache</type>
                <disk>web</disk>
                <path>cached_web_cache/</path>
                <max_size>100000000</max_size>
            </cached_web>
        </disks>
        <policies>
            <web>
                <volumes>
                    <main>
                        <disk>web</disk>
                    </main>
                </volumes>
            </web>
            <cached_web>
                <volumes>
                    <main>
                        <disk>cached_web</disk>
                    </main>
                </volumes>
            </cached_web>
        </policies>
    </storage_configuration>
</clickhouse>
```

:::tip
如果某个 web 数据集预期不会被常规使用，也可以在查询中临时配置存储。
参见 [dynamic configuration](#dynamic-configuration)，即可跳过编辑配置文件的步骤。

一个 [示例数据集](https://github.com/ClickHouse/web-tables-demo) 托管在 GitHub 上。要将您自己的表准备好用于 web
存储，请参阅工具 [clickhouse-static-files-uploader](/operations/utilities/static-files-disk-uploader)
:::

在这个 `ATTACH TABLE` 查询中，提供的 `UUID` 与数据所在目录的名称相匹配，endpoint 为指向 GitHub 原始内容的 URL。

```sql
-- highlight-next-line
ATTACH TABLE uk_price_paid UUID 'cf712b4f-2ca8-435c-ac23-c4393efe52f7'
(
    price UInt32,
    date Date,
    postcode1 LowCardinality(String),
    postcode2 LowCardinality(String),
    type Enum8('other' = 0, 'terraced' = 1, 'semi-detached' = 2, 'detached' = 3, 'flat' = 4),
    is_new UInt8,
    duration Enum8('unknown' = 0, 'freehold' = 1, 'leasehold' = 2),
    addr1 String,
    addr2 String,
    street LowCardinality(String),
    locality LowCardinality(String),
    town LowCardinality(String),
    district LowCardinality(String),
    county LowCardinality(String)
)
ENGINE = MergeTree
ORDER BY (postcode1, postcode2, addr1, addr2)
  -- highlight-start
  SETTINGS disk = disk(
      type=web,
      endpoint='https://raw.githubusercontent.com/ClickHouse/web-tables-demo/main/web/'
      );
  -- highlight-end
```

一个现成的测试用例。你需要将如下配置添加到 config 中：

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <web>
                <type>web</type>
                <endpoint>https://clickhouse-datasets.s3.yandex.net/disk-with-static-files-tests/test-hits/</endpoint>
            </web>
        </disks>
        <policies>
            <web>
                <volumes>
                    <main>
                        <disk>web</disk>
                    </main>
                </volumes>
            </web>
        </policies>
    </storage_configuration>
</clickhouse>
```

然后执行此查询：

```sql
ATTACH TABLE test_hits UUID '1ae36516-d62d-4218-9ae3-6516d62da218'
(
    WatchID UInt64,
    JavaEnable UInt8,
    Title String,
    GoodEvent Int16,
    EventTime DateTime,
    EventDate Date,
    CounterID UInt32,
    ClientIP UInt32,
    ClientIP6 FixedString(16),
    RegionID UInt32,
    UserID UInt64,
    CounterClass Int8,
    OS UInt8,
    UserAgent UInt8,
    URL String,
    Referer String,
    URLDomain String,
    RefererDomain String,
    Refresh UInt8,
    IsRobot UInt8,
    RefererCategories Array(UInt16),
    URLCategories Array(UInt16),
    URLRegions Array(UInt32),
    RefererRegions Array(UInt32),
    ResolutionWidth UInt16,
    ResolutionHeight UInt16,
    ResolutionDepth UInt8,
    FlashMajor UInt8,
    FlashMinor UInt8,
    FlashMinor2 String,
    NetMajor UInt8,
    NetMinor UInt8,
    UserAgentMajor UInt16,
    UserAgentMinor FixedString(2),
    CookieEnable UInt8,
    JavascriptEnable UInt8,
    IsMobile UInt8,
    MobilePhone UInt8,
    MobilePhoneModel String,
    Params String,
    IPNetworkID UInt32,
    TraficSourceID Int8,
    SearchEngineID UInt16,
    SearchPhrase String,
    AdvEngineID UInt8,
    IsArtifical UInt8,
    WindowClientWidth UInt16,
    WindowClientHeight UInt16,
    ClientTimeZone Int16,
    ClientEventTime DateTime,
    SilverlightVersion1 UInt8,
    SilverlightVersion2 UInt8,
    SilverlightVersion3 UInt32,
    SilverlightVersion4 UInt16,
    PageCharset String,
    CodeVersion UInt32,
    IsLink UInt8,
    IsDownload UInt8,
    IsNotBounce UInt8,
    FUniqID UInt64,
    HID UInt32,
    IsOldCounter UInt8,
    IsEvent UInt8,
    IsParameter UInt8,
    DontCountHits UInt8,
    WithHash UInt8,
    HitColor FixedString(1),
    UTCEventTime DateTime,
    Age UInt8,
    Sex UInt8,
    Income UInt8,
    Interests UInt16,
    Robotness UInt8,
    GeneralInterests Array(UInt16),
    RemoteIP UInt32,
    RemoteIP6 FixedString(16),
    WindowName Int32,
    OpenerName Int32,
    HistoryLength Int16,
    BrowserLanguage FixedString(2),
    BrowserCountry FixedString(2),
    SocialNetwork String,
    SocialAction String,
    HTTPError UInt16,
    SendTiming Int32,
    DNSTiming Int32,
    ConnectTiming Int32,
    ResponseStartTiming Int32,
    ResponseEndTiming Int32,
    FetchTiming Int32,
    RedirectTiming Int32,
    DOMInteractiveTiming Int32,
    DOMContentLoadedTiming Int32,
    DOMCompleteTiming Int32,
    LoadEventStartTiming Int32,
    LoadEventEndTiming Int32,
    NSToDOMContentLoadedTiming Int32,
    FirstPaintTiming Int32,
    RedirectCount Int8,
    SocialSourceNetworkID UInt8,
    SocialSourcePage String,
    ParamPrice Int64,
    ParamOrderID String,
    ParamCurrency FixedString(3),
    ParamCurrencyID UInt16,
    GoalsReached Array(UInt32),
    OpenstatServiceName String,
    OpenstatCampaignID String,
    OpenstatAdID String,
    OpenstatSourceID String,
    UTMSource String,
    UTMMedium String,
    UTMCampaign String,
    UTMContent String,
    UTMTerm String,
    FromTag String,
    HasGCLID UInt8,
    RefererHash UInt64,
    URLHash UInt64,
    CLID UInt32,
    YCLID UInt64,
    ShareService String,
    ShareURL String,
    ShareTitle String,
    ParsedParams Nested(
        Key1 String,
        Key2 String,
        Key3 String,
        Key4 String,
        Key5 String,
        ValueDouble Float64),
    IslandID FixedString(16),
    RequestNum UInt32,
    RequestTry UInt8
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(EventDate)
ORDER BY (CounterID, EventDate, intHash32(UserID))
SAMPLE BY intHash32(UserID)
SETTINGS storage_policy='web';
```

#### 必填参数 {#static-web-storage-required-parameters}

| Parameter  | Description                                            |
| ---------- | ------------------------------------------------------ |
| `type`     | `web`。否则不会创建磁盘。                                        |
| `endpoint` | 使用 `path` 格式的端点 URL。端点 URL 必须包含一个用于存储数据的根路径，即数据上传到的路径。 |

#### 可选参数 {#optional-parameters-web}

| 参数                                | 描述                                                                           | 默认值          |
|-------------------------------------|--------------------------------------------------------------------------------|-----------------|
| `min_bytes_for_seek`                | 使用 seek 操作而不是顺序读取所需的最小字节数                                   | `1` MB          |
| `remote_fs_read_backoff_threashold` | 尝试从远程磁盘读取数据时的最大等待时间                                         | `10000` seconds |
| `remote_fs_read_backoff_max_tries`  | 使用退避策略进行读取时的最大尝试次数                                           | `5`             |

如果查询失败并抛出异常 `DB:Exception Unreachable URL`，则可以尝试调整以下设置：[http_connection_timeout](/operations/settings/settings.md/#http_connection_timeout)、[http_receive_timeout](/operations/settings/settings.md/#http_receive_timeout)、[keep_alive_timeout](/operations/server-configuration-parameters/settings#keep_alive_timeout)。

要获取用于上传的文件，请运行：
`clickhouse static-files-disk-uploader --metadata-path <path> --output-dir <dir>`（`--metadata-path` 可通过查询 `SELECT data_paths FROM system.tables WHERE name = 'table_name'` 获取）。

当通过 `endpoint` 加载文件时，文件必须被加载到 `<endpoint>/store/` 路径下，但配置中只能包含 `endpoint`。

如果在服务器启动并加载表时无法访问磁盘上的 URL，则所有错误都会被捕获。如果在这种情况下发生了错误，可以通过 `DETACH TABLE table_name` -> `ATTACH TABLE table_name` 重新加载表（使其可见）。如果在服务器启动时元数据已成功加载，则表会立即可用。

使用 [http_max_single_read_retries](/operations/storing-data#web-storage) 设置来限制单次 HTTP 读取期间的最大重试次数。

### 零拷贝复制（尚未准备好用于生产环境） {#zero-copy}

在 `S3` 磁盘以及（尚不支持的）`HDFS` 磁盘上可以进行零拷贝复制，但不推荐使用。零拷贝复制意味着：如果数据在多台机器上以远程方式存储且需要同步，则仅复制元数据（数据分片的路径），而不复制数据本身。

:::note 零拷贝复制尚未准备好用于生产环境
在 ClickHouse 22.8 及更高版本中，零拷贝复制默认是禁用的。该功能不推荐用于生产环境。
:::
