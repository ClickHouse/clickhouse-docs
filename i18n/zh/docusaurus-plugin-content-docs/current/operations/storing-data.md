---
description: 'highlight-next-line 的文档'
sidebar_label: '用于存储数据的外部磁盘'
sidebar_position: 68
slug: /operations/storing-data
title: '用于存储数据的外部磁盘'
doc_type: 'guide'
---

在 ClickHouse 中处理的数据通常存储在运行 ClickHouse server 的那台机器的本地文件系统上。
这需要大容量磁盘，而这种磁盘可能比较昂贵。为避免在本地存储数据，ClickHouse 支持多种存储选项：
1. [Amazon S3](https://aws.amazon.com/s3/) 对象存储。
2. [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs)。
3. 不受支持：Hadoop 分布式文件系统（[HDFS](https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html)）

<br/>

:::note 
ClickHouse 还支持外部表引擎，它们不同于本页描述的外部存储选项，
因为它们允许读取以某种通用文件格式（如 Parquet）存储的数据。
本页描述的是 ClickHouse `MergeTree` 系列表或 `Log` 系列表的存储配置。

1. 要处理存储在 `Amazon S3` 磁盘上的数据，请使用 [S3](/engines/table-engines/integrations/s3.md) 表引擎。
2. 要处理存储在 Azure Blob Storage 中的数据，请使用 [AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage.md) 表引擎。
3. 要处理存储在 Hadoop 分布式文件系统（不受支持）中的数据，请使用 [HDFS](/engines/table-engines/integrations/hdfs.md) 表引擎。
:::



## 配置外部存储 {#configuring-external-storage}

[`MergeTree`](/engines/table-engines/mergetree-family/mergetree.md) 和 [`Log`](/engines/table-engines/log-family/log.md)
系列表引擎可以使用类型为 `s3`、`azure_blob_storage`、`hdfs`(不支持)的磁盘,将数据分别存储到 `S3`、`AzureBlobStorage`、`HDFS`(不支持)。

磁盘配置需要:

1. 一个 `type` 字段,值为 `s3`、`azure_blob_storage`、`hdfs`(不支持)、`local_blob_storage`、`web` 之一。
2. 特定外部存储类型的配置。

从 ClickHouse 24.1 版本开始,可以使用新的配置选项。
需要指定:

1. `type` 值为 `object_storage`
2. `object_storage_type`,值为 `s3`、`azure_blob_storage`(或从 `24.3` 版本开始简写为 `azure`)、`hdfs`(不支持)、`local_blob_storage`(或从 `24.3` 版本开始简写为 `local`)、`web` 之一。

<br />

可选地,可以指定 `metadata_type`(默认值为 `local`),也可以设置为 `plain`、`web`,以及从 `24.4` 版本开始支持的 `plain_rewritable`。
`plain` 元数据类型的使用方法在[普通存储章节](/operations/storing-data#plain-storage)中描述,`web` 元数据类型只能与 `web` 对象存储类型配合使用,`local` 元数据类型将元数据文件存储在本地(每个元数据文件包含对象存储中文件的映射关系以及相关的附加元信息)。

例如:

```xml
<s3>
    <type>s3</type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3>
```

等同于以下配置(从 `24.1` 版本开始):

```xml
<s3>
    <type>object_storage</type>
    <object_storage_type>s3</object_storage_type>
    <metadata_type>local</metadata_type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3>
```

以下配置:

```xml
<s3_plain>
    <type>s3_plain</type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain>
```

等同于:

```xml
<s3_plain>
    <type>object_storage</type>
    <object_storage_type>s3</object_storage_type>
    <metadata_type>plain</metadata_type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain>
```

完整存储配置示例如下:

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

从 24.1 版本开始,也可以配置为:


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

要将某种特定类型的存储设置为所有 `MergeTree` 表的默认类型，
请在配置文件中添加以下部分：

```xml
<clickhouse>
    <merge_tree>
        <storage_policy>s3</storage_policy>
    </merge_tree>
</clickhouse>
```

如果要为某张表配置特定的存储策略，可以在创建该表时在 SETTINGS 中进行指定：

```sql
CREATE TABLE test (a Int32, b String)
ENGINE = MergeTree() ORDER BY a
SETTINGS storage_policy = 's3';
```

你也可以使用 `disk` 来代替 `storage_policy`。在这种情况下，配置文件中无需包含 `storage_policy` 配置段，只需有一个 `disk` 配置段即可。

```sql
CREATE TABLE test (a Int32, b String)
ENGINE = MergeTree() ORDER BY a
SETTINGS disk = 's3';
```


## 动态配置 {#dynamic-configuration}

除了在配置文件中预定义磁盘配置外,还可以在 `CREATE`/`ATTACH` 查询设置中直接指定存储配置。

以下示例查询基于上述动态磁盘配置,演示了如何使用本地磁盘缓存存储在 URL 中的表数据。

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

下面的示例为外部存储添加缓存层。

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

在下面高亮显示的设置中,请注意 `type=web` 的磁盘嵌套在 `type=cache` 的磁盘内部。

:::note
该示例使用了 `type=web`,但任何磁盘类型都可以配置为动态磁盘,包括本地磁盘。本地磁盘要求路径参数必须位于服务器配置参数 `custom_local_disks_base_directory` 指定的目录内,该参数没有默认值,因此使用本地磁盘时也需要设置该参数。
:::

也可以将基于配置文件的配置与 SQL 定义的配置结合使用:

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

其中 `web` 来自服务器配置文件:


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

| 参数                | 描述                                                                                                                                                                            |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `endpoint`          | S3 端点 URL,支持 `path` 或 `virtual hosted` [样式](https://docs.aws.amazon.com/AmazonS3/latest/dev/VirtualHosting.html)。应包含存储桶名称和数据存储的根路径。 |
| `access_key_id`     | 用于身份验证的 S3 访问密钥 ID。                                                                                                                                              |
| `secret_access_key` | 用于身份验证的 S3 秘密访问密钥。                                                                                                                                          |

#### 可选参数 {#optional-parameters-s3}


| 参数                                       | 描述                                                                                                                                                                                                                                   | 默认值                            |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `region`                                        | S3 区域名称。                                                                                                                                                                                                                               | -                                        |
| `support_batch_delete`                          | 控制是否检查批量删除支持。使用 Google Cloud Storage (GCS) 时应设置为 `false`,因为 GCS 不支持批量删除。                                                                                                | `true`                                   |
| `use_environment_credentials`                   | 从环境变量读取 AWS 凭证:`AWS_ACCESS_KEY_ID`、`AWS_SECRET_ACCESS_KEY` 和 `AWS_SESSION_TOKEN`(如果存在)。                                                                                                        | `false`                                  |
| `use_insecure_imds_request`                     | 如果为 `true`,则在从 Amazon EC2 元数据获取凭证时使用不安全的 IMDS 请求。                                                                                                                                                    | `false`                                  |
| `expiration_window_seconds`                     | 检查基于过期时间的凭证是否已过期的宽限期(以秒为单位)。                                                                                                                                                          | `120`                                    |
| `proxy`                                         | S3 端点的代理配置。`proxy` 块内的每个 `uri` 元素应包含一个代理 URL。                                                                                                                                      | -                                        |
| `connect_timeout_ms`                            | 套接字连接超时时间(以毫秒为单位)。                                                                                                                                                                                                       | `10000`(10 秒)                     |
| `request_timeout_ms`                            | 请求超时时间(以毫秒为单位)。                                                                                                                                                                                                              | `5000`(5 秒)                       |
| `retry_attempts`                                | 失败请求的重试次数。                                                                                                                                                                                                 | `10`                                     |
| `single_read_retries`                           | 读取期间连接断开的重试次数。                                                                                                                                                                                    | `4`                                      |
| `min_bytes_for_seek`                            | 使用 seek 操作而非顺序读取的最小字节数。                                                                                                                                                                     | `1 MB`                                   |
| `metadata_path`                                 | 存储 S3 元数据文件的本地文件系统路径。                                                                                                                                                                                             | `/var/lib/clickhouse/disks/<disk_name>/` |
| `skip_access_check`                             | 如果为 `true`,则在启动期间跳过磁盘访问检查。                                                                                                                                                                                           | `false`                                  |
| `header`                                        | 向请求添加指定的 HTTP 标头。可以多次指定。                                                                                                                                                                                      | -                                        |
| `server_side_encryption_customer_key_base64`    | 访问使用 SSE-C 加密的 S3 对象所需的标头。                                                                                                                                                                              | -                                        |
| `server_side_encryption_kms_key_id`             | 访问使用 [SSE-KMS 加密](https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingKMSEncryption.html)的 S3 对象所需的标头。空字符串使用 AWS 托管的 S3 密钥。                                                     | -                                        |
| `server_side_encryption_kms_encryption_context` | SSE-KMS 的加密上下文标头(与 `server_side_encryption_kms_key_id` 一起使用)。                                                                                                                                        | -                                        |
| `server_side_encryption_kms_bucket_key_enabled` | 为 SSE-KMS 启用 S3 存储桶密钥(与 `server_side_encryption_kms_key_id` 一起使用)。                                                                                                                                           | 与存储桶级别设置一致             |
| `s3_max_put_rps`                                | 限流前每秒最大 PUT 请求数。                                                                                                                                                                                            | `0`(无限制)                          |
| `s3_max_put_burst`                              | 达到 RPS 限制前的最大并发 PUT 请求数。                                                                                                                                                                                     | 与 `s3_max_put_rps` 相同                 |
| `s3_max_get_rps`                                | 限流前每秒最大 GET 请求数。                                                                                                                                                                                            | `0`(无限制)                          |
| `s3_max_get_burst`                              | 达到 RPS 限制前的最大并发 GET 请求数。                                                                                                                                                                                     | 与 `s3_max_get_rps` 相同                 |
| `read_resource`                                 | 用于[调度](/operations/workload-scheduling.md)读取请求的资源名称。                                                                                                                                                             | 空字符串(已禁用)                  |
| `write_resource`                                | 用于[调度](/operations/workload-scheduling.md)写入请求的资源名称。                                                                                                                                                            | 空字符串(已禁用)                  |
| `key_template`                                  | 使用 [re2](https://github.com/google/re2/wiki/Syntax) 语法定义对象键生成格式。需要 `storage_metadata_write_full_object_key` 标志。与 `endpoint` 中的 `root path` 不兼容。需要 `key_compatibility_prefix`。 | -                                        |
| `key_compatibility_prefix`                      | 与 `key_template` 一起使用时必需。指定 `endpoint` 中先前的 `root path`,用于读取旧版本的元数据。                                                                                                                         | -                                        |
| `read_only`                                     | 仅允许从磁盘读取。                                                                                                                                                                                                          | -                                        |

:::note
使用 `s3` 类型也支持 Google Cloud Storage (GCS)。请参阅 [GCS 支持的 MergeTree](/integrations/gcs)。
:::

### 使用普通存储 {#plain-storage}


在 `22.10` 版本中引入了一种新的磁盘类型 `s3_plain`,它提供一次写入存储。
其配置参数与 `s3` 磁盘类型相同。
与 `s3` 磁盘类型不同,它按原样存储数据。换句话说,
它不使用随机生成的 blob 名称,而是使用普通文件名
(与 ClickHouse 在本地磁盘上存储文件的方式相同),并且不在本地存储任何
元数据。例如,它直接从 `s3` 上的数据派生。

此磁盘类型允许保留表的静态版本,因为它不允许
对现有数据执行合并操作,也不允许插入新数据。
此磁盘类型的一个使用场景是在其上创建备份,可以通过
`BACKUP TABLE data TO Disk('plain_disk_name', 'backup_name')` 来完成。之后,
您可以执行 `RESTORE TABLE data AS data_restored FROM Disk('plain_disk_name', 'backup_name')`
或使用 `ATTACH TABLE data (...) ENGINE = MergeTree() SETTINGS disk = 'plain_disk_name'`。

配置:

```xml
<s3_plain>
    <type>s3_plain</type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain>
```

从 `24.1` 版本开始,可以使用 `plain` 元数据类型配置任何对象存储磁盘(`s3`、`azure`、`hdfs`(不支持)、`local`)。

配置:

```xml
<s3_plain>
    <type>object_storage</type>
    <object_storage_type>azure</object_storage_type>
    <metadata_type>plain</metadata_type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain>
```

### 使用 S3 Plain 可重写存储 {#s3-plain-rewritable-storage}

在 `24.4` 版本中引入了一种新的磁盘类型 `s3_plain_rewritable`。
与 `s3_plain` 磁盘类型类似,它不需要额外的存储空间来存储
元数据文件。相反,元数据存储在 S3 中。
与 `s3_plain` 磁盘类型不同,`s3_plain_rewritable` 允许执行合并操作
并支持 `INSERT` 操作。
不支持表的[变更操作](/sql-reference/statements/alter#mutations)和复制。

此磁盘类型的一个使用场景是用于非复制的 `MergeTree` 表。尽管
`s3` 磁盘类型适用于非复制的 `MergeTree` 表,但如果您不需要表的本地元数据
并且愿意接受有限的操作集,则可以选择
`s3_plain_rewritable` 磁盘类型。例如,这对于系统表可能很有用。

配置:

```xml
<s3_plain_rewritable>
    <type>s3_plain_rewritable</type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain_rewritable>
```

等同于

```xml
<s3_plain_rewritable>
    <type>object_storage</type>
    <object_storage_type>s3</object_storage_type>
    <metadata_type>plain_rewritable</metadata_type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain_rewritable>
```

从 `24.5` 版本开始,可以使用 `plain_rewritable` 元数据类型配置任何对象存储磁盘
(`s3`、`azure`、`local`)。

### 使用 Azure Blob 存储 {#azure-blob-storage}

`MergeTree` 系列表引擎可以使用类型为 `azure_blob_storage` 的磁盘将数据存储到 [Azure Blob 存储](https://azure.microsoft.com/en-us/services/storage/blobs/)。

配置标记:


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

| 参数                        | 描述                                                                                                                                                                                      | 默认值       |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------- |
| `storage_account_url`(必需) | Azure Blob Storage 账户 URL。示例:`http://account.blob.core.windows.net` 或 `http://azurite1:10000/devstoreaccount1`。                                                                    | -                   |
| `container_name`                 | 目标容器名称。                                                                                                                                                                                           | `default-container` |
| `container_already_exists`       | 控制容器创建行为:<br/>- `false`:创建新容器<br/>- `true`:直接连接到现有容器<br/>- 未设置:检查容器是否存在,不存在则创建 | -                   |

身份验证参数(磁盘将尝试所有可用方法**以及**托管标识凭据):

| 参数           | 描述                                                     |
| ------------------- | --------------------------------------------------------------- |
| `connection_string` | 使用连接字符串进行身份验证。                   |
| `account_name`      | 使用共享密钥进行身份验证(与 `account_key` 配合使用)。  |
| `account_key`       | 使用共享密钥进行身份验证(与 `account_name` 配合使用)。 |

#### 限制参数 {#azure-blob-storage-limit-parameters}

| 参数                            | 描述                                                                 |
| ------------------------------------ | --------------------------------------------------------------------------- |
| `s3_max_single_part_upload_size`     | 单次上传到 Blob Storage 的最大块大小。                      |
| `min_bytes_for_seek`                 | 可寻址区域的最小大小。                                          |
| `max_single_read_retries`            | 从 Blob Storage 读取数据块的最大重试次数。       |
| `max_single_download_retries`        | 从 Blob Storage 下载可读缓冲区的最大重试次数。 |
| `thread_pool_size`                   | `IDiskRemote` 实例化的最大线程数。                  |
| `s3_max_inflight_parts_for_one_file` | 单个对象的最大并发 PUT 请求数。              |

#### 其他参数 {#azure-blob-storage-other-parameters}

| 参数                        | 描述                                                                        | 默认值                            |
| -------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------- |
| `metadata_path`                  | 存储 Blob Storage 元数据文件的本地文件系统路径。                    | `/var/lib/clickhouse/disks/<disk_name>/` |
| `skip_access_check`              | 如果为 `true`,则在启动时跳过磁盘访问检查。                                | `false`                                  |
| `read_resource`                  | 用于[调度](/operations/workload-scheduling.md)读取请求的资源名称。  | 空字符串(已禁用)                  |
| `write_resource`                 | 用于[调度](/operations/workload-scheduling.md)写入请求的资源名称。 | 空字符串(已禁用)                  |
| `metadata_keep_free_space_bytes` | 要保留的元数据磁盘可用空间大小。                                     | -                                        |

可在集成测试目录中找到可用的配置示例(例如参见 [test_merge_tree_azure_blob_storage](https://github.com/ClickHouse/ClickHouse/blob/master/tests/integration/test_merge_tree_azure_blob_storage/configs/config.d/storage_conf.xml) 或 [test_azure_blob_storage_zero_copy_replication](https://github.com/ClickHouse/ClickHouse/blob/master/tests/integration/test_azure_blob_storage_zero_copy_replication/configs/config.d/storage_conf.xml))。

:::note 零拷贝复制尚未准备好用于生产环境
在 ClickHouse 22.8 及更高版本中,零拷贝复制默认处于禁用状态。不建议在生产环境中使用此功能。
:::


## 使用 HDFS 存储（不支持） {#using-hdfs-storage-unsupported}

在此示例配置中：

- 磁盘类型为 `hdfs`（不支持）
- 数据托管在 `hdfs://hdfs1:9000/clickhouse/`

需要注意的是，HDFS 不受支持，因此使用时可能会出现问题。如果遇到任何问题，欢迎提交包含修复的拉取请求。

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

请注意，HDFS 在某些边界情况下可能无法正常工作。

### 使用数据加密 {#encrypted-virtual-file-system}

您可以对存储在 [S3](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3)、[HDFS](#using-hdfs-storage-unsupported)（不支持）外部磁盘或本地磁盘上的数据进行加密。要启用加密模式，必须在配置文件中定义一个类型为 `encrypted` 的磁盘，并选择用于保存数据的磁盘。`encrypted` 磁盘会实时加密所有写入的文件，当您从 `encrypted` 磁盘读取文件时，会自动解密。因此，您可以像使用普通磁盘一样使用 `encrypted` 磁盘。

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

例如，当 ClickHouse 将某个表的数据写入 `disk1` 的文件 `store/all_1_1_0/data.bin` 时，该文件实际上会被写入物理磁盘的路径 `/path1/store/all_1_1_0/data.bin`。

当将同一文件写入 `disk2` 时，它实际上会以加密模式写入物理磁盘的路径 `/path1/path2/store/all_1_1_0/data.bin`。

### 必需参数 {#required-parameters-encrypted-disk}

| 参数 | 类型   | 描述                                                                                                                                  |
| --------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`    | String | 必须设置为 `encrypted` 以创建加密磁盘。                                                                                      |
| `disk`    | String | 用于底层存储的磁盘类型。                                                                                                  |
| `key`     | Uint64 | 用于加密和解密的密钥。可以使用 `key_hex` 以十六进制格式指定。可以使用 `id` 属性指定多个密钥。 |

### 可选参数 {#optional-parameters-encrypted-disk}

| 参数        | 类型   | 默认值        | 描述                                                                                                                             |
| ---------------- | ------ | -------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `path`           | String | 根目录 | 数据在磁盘上的保存位置。                                                                                          |
| `current_key_id` | String | -              | 用于加密的密钥 ID。所有指定的密钥均可用于解密。                                                          |
| `algorithm`      | Enum   | `AES_128_CTR`  | 加密算法。可选项：<br/>- `AES_128_CTR`（16 字节密钥）<br/>- `AES_192_CTR`（24 字节密钥）<br/>- `AES_256_CTR`（32 字节密钥） |

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

从 22.3 版本开始,可以在存储配置中为磁盘配置本地缓存。
对于 22.3 - 22.7 版本,缓存仅支持 `s3` 磁盘类型。对于 >= 22.8 版本,缓存支持任何磁盘类型:S3、Azure、Local、Encrypted 等。
对于 >= 23.5 版本,缓存仅支持远程磁盘类型:S3、Azure、HDFS(不支持)。
缓存使用 `LRU` 缓存策略。

22.8 及更高版本的配置示例:

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <s3>
                <type>s3</type>
                <endpoint>...</endpoint>
                ... s3 配置 ...
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

22.8 之前版本的配置示例:

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <s3>
                <type>s3</type>
                <endpoint>...</endpoint>
                ... s3 配置 ...
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

文件缓存**磁盘配置设置**:

这些设置应在磁盘配置部分中定义。


| 参数                                  | 类型    | 默认值     | 描述                                                                                                                                                                                          |
|---------------------------------------|---------|------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `path`                                | String  | -          | **必需**。用于存储缓存的目录路径。                                                                                                                                                            |
| `max_size`                            | Size    | -          | **必需**。缓存的最大大小，可以为字节数或可读格式（例如 `10Gi`）。达到上限时，会根据 LRU 策略淘汰文件。支持 `ki`、`Mi`、`Gi` 格式（自 v22.10 起）。                                           |
| `cache_on_write_operations`           | Boolean | `false`    | 为 `INSERT` 查询和后台合并启用写透缓存。可在单个查询级别通过 `enable_filesystem_cache_on_write_operations` 覆盖。                                                                            |
| `enable_filesystem_query_cache_limit` | Boolean | `false`    | 基于 `max_query_cache_size` 启用按查询设置的缓存大小限制。                                                                                                                                    |
| `enable_cache_hits_threshold`         | Boolean | `false`    | 启用后，只有在数据被多次读取后才会进行缓存。                                                                                                                                                  |
| `cache_hits_threshold`                | Integer | `0`        | 在开始缓存数据之前所需的读取次数（需要启用 `enable_cache_hits_threshold`）。                                                                                                                 |
| `enable_bypass_cache_with_threshold`  | Boolean | `false`    | 对较大的读取范围跳过缓存。                                                                                                                                                                   |
| `bypass_cache_threshold`              | Size    | `256Mi`    | 触发跳过缓存的读取范围大小（需要启用 `enable_bypass_cache_with_threshold`）。                                                                                                                |
| `max_file_segment_size`               | Size    | `8Mi`      | 单个缓存文件的最大大小，可以为字节数或可读格式。                                                                                                                                              |
| `max_elements`                        | Integer | `10000000` | 缓存文件的最大数量。                                                                                                                                                                          |
| `load_metadata_threads`               | Integer | `16`       | 启动时用于加载缓存元数据的线程数。                                                                                                                                                            |

> **注意**：Size 类型的值支持 `ki`、`Mi`、`Gi` 等单位（例如 `10Gi`）。



## 文件缓存查询/配置设置 {#file-cache-query-profile-settings}

| 设置                                                                 | 类型    | 默认值                 | 描述                                                                                                                                                    |
| ----------------------------------------------------------------------- | ------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `enable_filesystem_cache`                                               | Boolean | `true`                  | 启用/禁用每个查询的缓存使用,即使使用 `cache` 磁盘类型时也适用。                                                                                   |
| `read_from_filesystem_cache_if_exists_otherwise_bypass_cache`           | Boolean | `false`                 | 启用时,仅在数据存在时使用缓存;新数据不会被缓存。                                                                                        |
| `enable_filesystem_cache_on_write_operations`                           | Boolean | `false` (Cloud: `true`) | 启用写穿透缓存。需要在缓存配置中设置 `cache_on_write_operations`。                                                                             |
| `enable_filesystem_cache_log`                                           | Boolean | `false`                 | 启用详细的缓存使用日志记录到 `system.filesystem_cache_log`。                                                                                         |
| `filesystem_cache_allow_background_download`                            | Boolean | `true`                  | 允许部分下载的段在后台完成。禁用此选项可使当前查询/会话的下载保持在前台。              |
| `max_query_cache_size`                                                  | Size    | `false`                 | 每个查询的最大缓存大小。需要在缓存配置中设置 `enable_filesystem_query_cache_limit`。                                                                  |
| `filesystem_cache_skip_download_if_exceeds_per_query_cache_write_limit` | Boolean | `true`                  | 控制达到 `max_query_cache_size` 时的行为: <br/>- `true`: 停止下载新数据 <br/>- `false`: 驱逐旧数据以为新数据腾出空间 |

:::warning
缓存配置设置和缓存查询设置对应于最新的 ClickHouse 版本,
对于早期版本,某些功能可能不受支持。
:::

#### 缓存系统表 {#cache-system-tables-file-cache}

| 表名                    | 描述                                         | 要求                                  |
| ----------------------------- | --------------------------------------------------- | --------------------------------------------- |
| `system.filesystem_cache`     | 显示文件系统缓存的当前状态。 | 无                                          |
| `system.filesystem_cache_log` | 提供每个查询的详细缓存使用统计信息。 | 需要 `enable_filesystem_cache_log = true` |

#### 缓存命令 {#cache-commands-file-cache}

##### `SYSTEM DROP FILESYSTEM CACHE (<cache_name>) (ON CLUSTER)` -- `ON CLUSTER` {#system-drop-filesystem-cache-on-cluster}

此命令仅在未提供 `<cache_name>` 时受支持

##### `SHOW FILESYSTEM CACHES` {#show-filesystem-caches}

显示在服务器上配置的文件系统缓存列表。
(对于小于或等于 `22.8` 的版本,该命令名为 `SHOW CACHES`)

```sql title="查询"
SHOW FILESYSTEM CACHES
```

```text title="响应"
┌─Caches────┐
│ s3_cache  │
└───────────┘
```

##### `DESCRIBE FILESYSTEM CACHE '<cache_name>'` {#describe-filesystem-cache}

显示特定缓存的缓存配置和一些常规统计信息。
缓存名称可以从 `SHOW FILESYSTEM CACHES` 命令中获取。(对于小于或等于 `22.8` 的版本,该命令名为 `DESCRIBE CACHE`)

```sql title="查询"
DESCRIBE FILESYSTEM CACHE 's3_cache'
```

```text title="响应"
┌────max_size─┬─max_elements─┬─max_file_segment_size─┬─boundary_alignment─┬─cache_on_write_operations─┬─cache_hits_threshold─┬─current_size─┬─current_elements─┬─path───────┬─background_download_threads─┬─enable_bypass_cache_with_threshold─┐
│ 10000000000 │      1048576 │             104857600 │            4194304 │                         1 │                    0 │         3276 │               54 │ /s3_cache/ │                           2 │                                  0 │
└─────────────┴──────────────┴───────────────────────┴────────────────────┴───────────────────────────┴──────────────────────┴──────────────┴──────────────────┴────────────┴─────────────────────────────┴────────────────────────────────────┘
```


| 缓存当前指标              | 缓存异步指标               | 缓存性能事件                                                                              |
| ------------------------- | -------------------------- | ----------------------------------------------------------------------------------------- |
| `FilesystemCacheSize`     | `FilesystemCacheBytes`     | `CachedReadBufferReadFromSourceBytes`, `CachedReadBufferReadFromCacheBytes`               |
| `FilesystemCacheElements` | `FilesystemCacheFiles`     | `CachedReadBufferReadFromSourceMicroseconds`, `CachedReadBufferReadFromCacheMicroseconds` |
|                           |                            | `CachedReadBufferCacheWriteBytes`, `CachedReadBufferCacheWriteMicroseconds`               |
|                           |                            | `CachedWriteBufferCacheWriteBytes`, `CachedWriteBufferCacheWriteMicroseconds`             |

### 使用静态 Web 存储(只读) {#web-storage}

这是一个只读磁盘。其数据仅供读取,不会被修改。通过 `ATTACH TABLE` 查询将新表加载到此磁盘(参见下面的示例)。实际上不使用本地磁盘,每个 `SELECT` 查询都会发起一个 `http` 请求来获取所需数据。对表数据的所有修改操作都将导致异常,即不允许执行以下类型的查询:[`CREATE TABLE`](/sql-reference/statements/create/table.md)、[`ALTER TABLE`](/sql-reference/statements/alter/index.md)、[`RENAME TABLE`](/sql-reference/statements/rename#rename-table)、[`DETACH TABLE`](/sql-reference/statements/detach.md) 和 [`TRUNCATE TABLE`](/sql-reference/statements/truncate.md)。
Web 存储可用于只读场景。典型用途包括托管示例数据或迁移数据。ClickHouse 提供了一个工具 `clickhouse-static-files-uploader`,可为指定表准备数据目录(`SELECT data_paths FROM system.tables WHERE name = 'table_name'`)。对于每个需要的表,您将获得一个文件目录。这些文件可以上传到例如提供静态文件服务的 Web 服务器。完成准备工作后,您可以通过 `DiskWeb` 将该表加载到任何 ClickHouse 服务器。

在此示例配置中:

- 磁盘类型为 `web`
- 数据托管在 `http://nginx:80/test1/`
- 使用本地存储上的缓存

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
如果不需要经常使用 Web 数据集,也可以在查询中临时配置存储,请参阅[动态配置](#dynamic-configuration),无需编辑配置文件。

[演示数据集](https://github.com/ClickHouse/web-tables-demo)托管在 GitHub 上。要为 Web 存储准备您自己的表,请参阅工具 [clickhouse-static-files-uploader](/operations/utilities/static-files-disk-uploader)
:::

在此 `ATTACH TABLE` 查询中,提供的 `UUID` 与数据目录名称匹配,endpoint 为 GitHub 原始内容的 URL。


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

一个现成的测试用例。你需要将此配置添加到 config 中：

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

#### 必需参数 {#static-web-storage-required-parameters}

| 参数  | 描述                                                                                                       |
| ---------- | ----------------------------------------------------------------------------------------------------------------- |
| `type`     | `web`。否则不会创建磁盘。                                                                         |
| `endpoint` | `path` 格式的端点 URL。端点 URL 必须包含存储数据的根路径,即数据上传的位置。 |

#### 可选参数 {#optional-parameters-web}


| 参数                                | 描述                                                                         | 默认值          |
| ----------------------------------- | ---------------------------------------------------------------------------- | --------------- |
| `min_bytes_for_seek`                | 使用定位操作而非顺序读取的最小字节数                                          | `1` MB          |
| `remote_fs_read_backoff_threashold` | 尝试读取远程磁盘数据时的最大等待时间                                          | `10000` 秒      |
| `remote_fs_read_backoff_max_tries`  | 使用退避策略的最大读取尝试次数                                                | `5`             |

如果查询失败并出现异常 `DB:Exception Unreachable URL`,则可以尝试调整以下设置:[http_connection_timeout](/operations/settings/settings.md/#http_connection_timeout)、[http_receive_timeout](/operations/settings/settings.md/#http_receive_timeout)、[keep_alive_timeout](/operations/server-configuration-parameters/settings#keep_alive_timeout)。

要获取用于上传的文件,请运行:
`clickhouse static-files-disk-uploader --metadata-path <path> --output-dir <dir>`(`--metadata-path` 可以通过查询 `SELECT data_paths FROM system.tables WHERE name = 'table_name'` 获得)。

通过 `endpoint` 加载文件时,必须将文件加载到 `<endpoint>/store/` 路径,但配置中只需包含 `endpoint`。

如果在服务器启动表时磁盘加载期间 URL 不可达,则会捕获所有错误。如果在这种情况下出现错误,可以通过 `DETACH TABLE table_name` -> `ATTACH TABLE table_name` 重新加载表(使其可见)。如果在服务器启动时成功加载了元数据,则表将立即可用。

使用 [http_max_single_read_retries](/operations/storing-data#web-storage) 设置来限制单次 HTTP 读取的最大重试次数。

### 零拷贝复制(尚未准备好用于生产环境){#zero-copy}

零拷贝复制在 `S3` 和 `HDFS`(不受支持)磁盘上是可行的,但不推荐使用。零拷贝复制意味着如果数据远程存储在多台机器上并需要同步,则仅复制元数据(数据部分的路径),而不复制数据本身。

:::note 零拷贝复制尚未准备好用于生产环境
在 ClickHouse 22.8 及更高版本中,零拷贝复制默认处于禁用状态。不建议在生产环境中使用此功能。
:::
