---
'description': 'highlight-next-line 的文档'
'sidebar_label': '用于存储数据的外部磁盘'
'sidebar_position': 68
'slug': '/operations/storing-data'
'title': '用于存储数据的外部磁盘'
'doc_type': 'guide'
---

在 ClickHouse 中处理的数据通常存储在运行 ClickHouse 服务器的机器的本地文件系统中。这需要大容量的磁盘，这可能会很昂贵。为了避免本地存储数据，支持多种存储选项：
1. [Amazon S3](https://aws.amazon.com/s3/) 对象存储。
2. [Azure Blob 存储](https://azure.microsoft.com/en-us/products/storage/blobs)。
3. 不支持：Hadoop 分布式文件系统 ([HDFS](https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html))

<br/>

:::note 
ClickHouse 还支持外部表引擎，这与本页描述的外部存储选项不同，因为它们允许读取存储在某些通用文件格式（如 Parquet）中的数据。在本页上，我们描述 ClickHouse `MergeTree` 家族或 `Log` 家族表的存储配置。

1. 使用存储在 `Amazon S3` 磁盘上的数据，请使用 [S3](/engines/table-engines/integrations/s3.md) 表引擎。
2. 使用存储在 Azure Blob 存储中的数据，请使用 [AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage.md) 表引擎。
3. 使用存储在 Hadoop 分布式文件系统中的数据（不支持），请使用 [HDFS](/engines/table-engines/integrations/hdfs.md) 表引擎。
:::
## 配置外部存储 {#configuring-external-storage}

[`MergeTree`](/engines/table-engines/mergetree-family/mergetree.md) 和 [`Log`](/engines/table-engines/log-family/log.md) 
家族表引擎可以使用类型为 `s3`、`azure_blob_storage`、`hdfs`（不支持）的磁盘将数据存储到 `S3`、`AzureBlobStorage`、`HDFS`（不支持）。

磁盘配置要求：

1. 一个 `type` 部分，等于 `s3`、`azure_blob_storage`、`hdfs`（不支持）、`local_blob_storage`、`web` 之一。
2. 特定外部存储类型的配置。

从 24.1 版本的 clickhouse 开始，可能使用新的配置选项。
它需要指定：

1. 一个 `type` 等于 `object_storage`
2. `object_storage_type`，等于 `s3`、`azure_blob_storage`（或者从 `24.3` 开始只使用 `azure`）、`hdfs`（不支持）、`local_blob_storage`（或者从 `24.3` 开始只使用 `local`）、`web` 之一。

<br/>

可选地，可以指定 `metadata_type`（默认等于 `local`），但也可以设置为 `plain`、`web`，而且从 `24.4` 开始，`plain_rewritable`。`plain` 元数据类型的使用在 [plain storage section](/operations/storing-data#plain-storage) 中描述，`web` 元数据类型仅可与 `web` 对象存储类型一起使用，`local` 元数据类型将元数据文件本地存储（每个元数据文件包含对对象存储中文件的映射和一些关于它们的附加元信息）。

例如：

```xml
<s3>
    <type>s3</type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3>
```

等同于以下配置（来自 `24.1` 版本）：

```xml
<s3>
    <type>object_storage</type>
    <object_storage_type>s3</object_storage_type>
    <metadata_type>local</metadata_type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3>
```

以下配置：

```xml
<s3_plain>
    <type>s3_plain</type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain>
```

等同于：

```xml
<s3_plain>
    <type>object_storage</type>
    <object_storage_type>s3</object_storage_type>
    <metadata_type>plain</metadata_type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain>
```

完整的存储配置示例如下：

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

从 24.1 版本开始，它也可以如下所示：

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

要使特定类型的存储成为所有 `MergeTree` 表的默认选项，请在配置文件中添加以下部分：

```xml
<clickhouse>
    <merge_tree>
        <storage_policy>s3</storage_policy>
    </merge_tree>
</clickhouse>
```

如果您想为特定表配置特定的存储策略，可以在创建表时通过设置定义它：

```sql
CREATE TABLE test (a Int32, b String)
ENGINE = MergeTree() ORDER BY a
SETTINGS storage_policy = 's3';
```

您还可以使用 `disk` 替代 `storage_policy`。在这种情况下，配置文件中不需要有 `storage_policy` 部分，`disk` 部分就足够了。

```sql
CREATE TABLE test (a Int32, b String)
ENGINE = MergeTree() ORDER BY a
SETTINGS disk = 's3';
```
## 动态配置 {#dynamic-configuration}

还可以在配置文件中指定没有预定义磁盘的存储配置，但可以在 `CREATE`/`ATTACH` 查询设置中配置。

以下示例查询建立在以上动态磁盘配置的基础上，并展示如何使用本地磁盘缓存从 URL 存储的表中的数据。

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

下面的示例为外部存储添加了缓存。

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

在下面突出显示的设置中，请注意类型为 `web` 的磁盘嵌套在类型为 `cache` 的磁盘内。

:::note
示例使用了 `type=web`，但任何磁盘类型都可以配置为动态，包括本地磁盘。本地磁盘需要一个路径参数，以便处于服务器配置参数 `custom_local_disks_base_directory` 内部，该参数没有默认值，因此在使用本地磁盘时也要设置此参数。
:::

基于配置的配置与 SQL 定义的配置也可行：

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

其中 `web` 来自服务器配置文件：

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

| 参数                | 描述                                                                                                                                                                       |
|---------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `endpoint`          | S3 端点 URL，采用 `path` 或 `virtual hosted` [样式](https://docs.aws.amazon.com/AmazonS3/latest/dev/VirtualHosting.html)。应包括存储数据的存储桶和根路径。                     |
| `access_key_id`     | 用于身份验证的 S3 访问密钥 ID。                                                                                                                                          |
| `secret_access_key` | 用于身份验证的 S3 秘密访问密钥。                                                                                                                                      |
#### 可选参数 {#optional-parameters-s3}

| 参数                                           | 描述                                                                                                                                                                                                    | 默认值              |
|------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------|
| `region`                                        | S3 区域名称。                                                                                                                                                                                          | -                   |
| `support_batch_delete`                          | 控制是否检查批量删除支持。在使用 Google Cloud Storage (GCS) 时设置为 `false`，因为 GCS 不支持批量删除。                                                                                             | `true`              |
| `use_environment_credentials`                   | 从环境变量中读取 AWS 凭证：`AWS_ACCESS_KEY_ID`、`AWS_SECRET_ACCESS_KEY` 和 `AWS_SESSION_TOKEN`（如果存在）。                                                                                          | `false`             |
| `use_insecure_imds_request`                     | 如果为 `true`，在从 Amazon EC2 元数据获取凭证时使用不安全的 IMDS 请求。                                                                                                                             | `false`             |
| `expiration_window_seconds`                     | 检查基于到期的凭证是否已过期的宽限期（以秒为单位）。                                                                                                                                                   | `120`               |
| `proxy`                                         | S3 端点的代理配置。`proxy` 块中的每个 `uri` 元素应包含一个代理 URL。                                                                                                                                   | -                   |
| `connect_timeout_ms`                            | 以毫秒为单位的套接字连接超时。                                                                                                                                                                            | `10000`（10秒）     |
| `request_timeout_ms`                            | 以毫秒为单位的请求超时。                                                                                                                                                                                   | `5000`（5秒）       |
| `retry_attempts`                                | 失败请求的重试次数。                                                                                                                                                                                    | `10`                |
| `single_read_retries`                           | 在读取期间连接掉线的重试次数。                                                                                                                                                                           | `4`                 |
| `min_bytes_for_seek`                            | 使用跳过操作而不是顺序读取的最小字节数。                                                                                                                                                                   | `1 MB`              |
| `metadata_path`                                 | 用于存储 S3 元数据文件的本地文件系统路径。                                                                                                                                                                 | `/var/lib/clickhouse/disks/<disk_name>/` |
| `skip_access_check`                             | 如果为 `true`，在启动期间跳过磁盘访问检查。                                                                                                                                                               | `false`             |
| `header`                                        | 向请求添加指定的 HTTP 头。可以多次指定。                                                                                                                                                                      | -                   |
| `server_side_encryption_customer_key_base64`    | 访问 S3 对象时需要的 SSE-C 加密的头。                                                                                                                                                                         | -                   |
| `server_side_encryption_kms_key_id`             | 访问 S3 对象时需要的 [SSE-KMS 加密](https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingKMSEncryption.html) 的头。空字符串使用 AWS 管理的 S3 密钥。                           | -                   |
| `server_side_encryption_kms_encryption_context` | SSE-KMS 的加密上下文头（与 `server_side_encryption_kms_key_id` 一起使用）。                                                                                                                                 | -                   |
| `server_side_encryption_kms_bucket_key_enabled` | 启用针对 SSE-KMS 的 S3 存储桶密钥（与 `server_side_encryption_kms_key_id` 一起使用）。                                                                                                                              | 与存储桶级设置匹配 |
| `s3_max_put_rps`                                | 在限流之前每秒最大 PUT 请求数。                                                                                                                                                                           | `0`（无限制）      |
| `s3_max_put_burst`                              | 在达到 RPS 限制之前同时最大 PUT 请求数。                                                                                                                                                                    | 与 `s3_max_put_rps` 相同 |
| `s3_max_get_rps`                                | 在限流之前每秒最大 GET 请求数。                                                                                                                                                                           | `0`（无限制）      |
| `s3_max_get_burst`                              | 在达到 RPS 限制之前同时最大 GET 请求数。                                                                                                                                                                    | 与 `s3_max_get_rps` 相同 |
| `read_resource`                                 | [调度](/operations/workload-scheduling.md) 读取请求的资源名称。                                                                                                                                                    | 空字符串（禁用）     |
| `write_resource`                                | [调度](/operations/workload-scheduling.md) 写入请求的资源名称。                                                                                                                                                   | 空字符串（禁用）     |
| `key_template`                                  | 使用 [re2](https://github.com/google/re2/wiki/Syntax) 语法定义对象密钥生成格式。要求 `storage_metadata_write_full_object_key` 标志。不与 `endpoint` 中的 `root path` 兼容。要求 `key_compatibility_prefix`。     | -                   |
| `key_compatibility_prefix`                      | 必须与 `key_template` 一起使用。指定用于读取较旧元数据版本的 `endpoint` 中的先前 `root path`。                                                                                                       | -                   |
| `read_only`                                     | 仅允许从磁盘读取。                                                                                                                                                                                         | -                   |
:::note
Google Cloud Storage (GCS) 也支持使用类型 `s3`。请参见 [基于 GCS 的 MergeTree](/integrations/gcs)。
:::
### 使用简单存储 {#plain-storage}

在 `22.10` 中引入了新的磁盘类型 `s3_plain`，提供了一次性写入存储。其配置参数与 `s3` 磁盘类型相同。
与 `s3` 磁盘类型不同，它以原样存储数据。换句话说，
它使用正常的文件名（与 ClickHouse 在本地磁盘上存储文件的方式相同），并且不在本地存储任何元数据。例如，它源自 `s3` 上的数据。

这种磁盘类型允许保留表的静态版本，因为它不允许对现有数据执行合并，也不允许插入新数据。这种磁盘类型的用例是创建备份，可以通过 `BACKUP TABLE data TO Disk('plain_disk_name', 'backup_name')` 完成。随后，您可以执行 `RESTORE TABLE data AS data_restored FROM Disk('plain_disk_name', 'backup_name')` 
或使用 `ATTACH TABLE data (...) ENGINE = MergeTree() SETTINGS disk = 'plain_disk_name'`。

配置：

```xml
<s3_plain>
    <type>s3_plain</type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain>
```

从 `24.1` 开始，您可以使用 `plain` 元数据类型配置任何对象存储磁盘（`s3`、`azure`、`hdfs`（不支持）、`local`）。

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
### 使用 S3 可重写存储 {#s3-plain-rewritable-storage}

在 `24.4` 中引入了一种新的磁盘类型 `s3_plain_rewritable`。
与 `s3_plain` 磁盘类型类似，它不需要额外的元数据文件存储。相反，元数据存储在 S3 中。
与 `s3_plain` 磁盘类型不同，`s3_plain_rewritable` 允许执行合并 
并支持 `INSERT` 操作。
不支持表的 [Mutations](/sql-reference/statements/alter#mutations) 和复制。

这种磁盘类型的用例是针对非复制的 `MergeTree` 表。尽管 `s3` 磁盘类型适合非复制的 `MergeTree` 表，但如果您不需要表的本地元数据并且愿意接受有限的操作集，则可以选择 `s3_plain_rewritable` 磁盘类型。这可能对系统表等非常有用。

配置：

```xml
<s3_plain_rewritable>
    <type>s3_plain_rewritable</type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain_rewritable>
```

等价于

```xml
<s3_plain_rewritable>
    <type>object_storage</type>
    <object_storage_type>s3</object_storage_type>
    <metadata_type>plain_rewritable</metadata_type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain_rewritable>
```

从 `24.5` 开始，您可以使用 `plain_rewritable` 元数据类型配置任何对象存储磁盘（`s3`、`azure`、`local`）。
### 使用 Azure Blob 存储 {#azure-blob-storage}

`MergeTree` 家族表引擎可以使用类型为 `azure_blob_storage` 的磁盘将数据存储到 [Azure Blob 存储](https://azure.microsoft.com/en-us/services/storage/blobs/)。

配置标记：

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

| 参数                            | 描述                                                                                                                                                                   | 默认值                  |
|----------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------|
| `storage_account_url`（必需）    | Azure Blob 存储帐户 URL。例如：`http://account.blob.core.windows.net` 或 `http://azurite1:10000/devstoreaccount1`。                                                  | -                        |
| `container_name`                 | 目标容器名称。                                                                                                                                                      | `default-container`      |
| `container_already_exists`       | 控制容器创建行为： <br/>- `false`：创建新容器 <br/>- `true`：直接连接到现有容器 <br/>- 未设置：检查容器是否存在，如有必要则创建                                                         | -                        |

身份验证参数（磁盘将尝试所有可用方法 **和** 托管身份凭证）：

| 参数              | 描述                                      |
|-------------------|-------------------------------------------|
| `connection_string` | 用于通过连接字符串进行身份验证。          |
| `account_name`      | 用于通过共享密钥进行身份验证（与 `account_key` 一起使用）。 |
| `account_key`       | 用于通过共享密钥进行身份验证（与 `account_name` 一起使用）。 |
#### 限制参数 {#azure-blob-storage-limit-parameters}

| 参数                                 | 描述                                                                  |
|--------------------------------------|-----------------------------------------------------------------------|
| `s3_max_single_part_upload_size`     | 上传到 Blob 存储的单个块的最大大小。                                   |
| `min_bytes_for_seek`                 | 可寻址区域的最小大小。                                               |
| `max_single_read_retries`            | 从 Blob 存储读取数据块的最大尝试次数。                               |
| `max_single_download_retries`        | 从 Blob 存储下载可读缓冲区的最大尝试次数。                           |
| `thread_pool_size`                   | 用于 `IDiskRemote` 实例化的最大线程数。                               |
| `s3_max_inflight_parts_for_one_file` | 单个对象的最大并发 PUT 请求数。                                      |
#### 其他参数 {#azure-blob-storage-other-parameters}

| 参数                               | 描述                                                                | 默认值                                  |
|-------------------------------------|---------------------------------------------------------------------|------------------------------------------|
| `metadata_path`                     | 用于存储 Blob 存储元数据文件的本地文件系统路径。                     | `/var/lib/clickhouse/disks/<disk_name>/` |
| `skip_access_check`                 | 如果为 `true`，在启动时跳过磁盘访问检查。                              | `false`                                  |
| `read_resource`                     | [调度](/operations/workload-scheduling.md) 读取请求的资源名称。                | 空字符串（禁用）                          |
| `write_resource`                    | [调度](/operations/workload-scheduling.md) 写入请求的资源名称。               | 空字符串（禁用）                          |
| `metadata_keep_free_space_bytes`    | 要保留的自由元数据磁盘空间量。                                       | -                                        |

可以在集成测试目录中找到工作配置的示例（例如，查看 [test_merge_tree_azure_blob_storage](https://github.com/ClickHouse/ClickHouse/blob/master/tests/integration/test_merge_tree_azure_blob_storage/configs/config.d/storage_conf.xml) 或 [test_azure_blob_storage_zero_copy_replication](https://github.com/ClickHouse/ClickHouse/blob/master/tests/integration/test_azure_blob_storage_zero_copy_replication/configs/config.d/storage_conf.xml)）。

:::note 零拷贝复制尚未准备好用于生产
在 ClickHouse 版本 22.8 及更高版本中，默认情况下禁用零拷贝复制。建议不要在生产中使用此功能。
:::
## 使用 HDFS 存储（不支持） {#using-hdfs-storage-unsupported}

在此示例配置中：
- 磁盘类型为 `hdfs`（不支持）
- 数据托管在 `hdfs://hdfs1:9000/clickhouse/`

顺便说一下，HDFS 不受支持，因此在使用它时可能会出现问题。如果有任何问题，请随时提交拉取请求进行修复。

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

请注意，HDFS 在某些边缘情况下可能会出现故障。
### 使用数据加密 {#encrypted-virtual-file-system}

您可以加密存储在 [S3](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3) 或 [HDFS](#using-hdfs-storage-unsupported)（不支持）外部磁盘上的数据，或在本地磁盘上加密数据。要启用加密模式，您必须在配置文件中定义类型为 `encrypted` 的磁盘，并选择将保存数据的磁盘。`encrypted` 磁盘会实时对所有写入的文件进行加密，当您从 `encrypted` 磁盘读取文件时，它会自动解密。因此，您可以像使用普通磁盘一样使用 `encrypted` 磁盘。

以下是磁盘配置的示例：

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

例如，当 ClickHouse 将某个表的数据写入文件 `store/all_1_1_0/data.bin` 到 `disk1` 时，实际上该文件将写入到物理磁盘路径 `/path1/store/all_1_1_0/data.bin`。

将同一文件写入 `disk2` 时，它实际上将以加密模式写入物理磁盘路径 `/path1/path2/store/all_1_1_0/data.bin`。
### 必需参数 {#required-parameters-encrypted-disk}

| 参数         | 类型     | 描述                                                                                                                                |
|---------------|----------|-------------------------------------------------------------------------------------------------------------------------------------|
| `type`        | 字符串   | 必须设置为 `encrypted` 以创建加密磁盘。                                                                                            |
| `disk`        | 字符串   | 用于底层存储的磁盘类型。                                                                                                          |
| `key`         | Uint64   | 用于加密和解密的密钥。可以使用 `key_hex` 以十六进制给出。可以通过 `id` 属性指定多个密钥。                                         |
### 可选参数 {#optional-parameters-encrypted-disk}

| 参数                   | 类型     | 默认值        | 描述                                                                                                                               |
|-----------------------|----------|---------------|------------------------------------------------------------------------------------------------------------------------------------|
| `path`                | 字符串   | 根目录        | 将保存数据的磁盘上的位置。                                                                                                        |
| `current_key_id`      | 字符串   | -             | 用于加密的密钥 ID。所有指定的密钥都可以用于解密。                                                                                |
| `algorithm`           | 枚举     | `AES_128_CTR` | 加密算法。选项：<br/>- `AES_128_CTR`（16 字节密钥）<br/>- `AES_192_CTR`（24 字节密钥）<br/>- `AES_256_CTR`（32 字节密钥） |

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

从版本 22.3 开始，可以在存储配置中配置磁盘上的本地缓存。
在版本 22.3 - 22.7 中，缓存仅支持 `s3` 磁盘类型。对于版本 >= 22.8，缓存支持任何磁盘类型：S3、Azure、本地、加密等。
对于版本 >= 23.5，缓存仅支持远程磁盘类型：S3、Azure、HDFS（不支持）。
缓存使用 `LRU` 缓存策略。

版本 22.8 及以上的配置示例：

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <s3>
                <type>s3</type>
                <endpoint>...</endpoint>
                ... s3 configuration ...
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

版本 22.8 以下的配置示例：

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <s3>
                <type>s3</type>
                <endpoint>...</endpoint>
                ... s3 configuration ...
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

文件缓存 **磁盘配置设置**：

这些设置应在磁盘配置部分定义。

| 参数                                   | 类型    | 默认值     | 描述                                                                                                                                                                         |
|----------------------------------------|---------|------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `path`                                 | 字符串  | -          | **必需**。缓存将存储在的目录路径。                                                                                                                                           |
| `max_size`                             | 大小    | -          | **必需**。最大缓存大小，以字节或可读格式（例如， `10Gi`）。当达到限制时，文件将使用 LRU 策略驱逐。支持 `ki`、`Mi`、`Gi` 格式（自 v22.10 起）。                      |
| `cache_on_write_operations`            | 布尔值 | `false`    | 为 `INSERT` 查询和后台合并启用写通过缓存。可以通过 `enable_filesystem_cache_on_write_operations` per 查询覆盖。                                                               |
| `enable_filesystem_query_cache_limit`  | 布尔值 | `false`    | 启用基于 `max_query_cache_size` 的每查询缓存大小限制。                                                                                                                        |
| `enable_cache_hits_threshold`          | 布尔值 | `false`    | 启用后，数据仅在被读取多次后被缓存。                                                                                                                                          |
| `cache_hits_threshold`                 | 整数    | `0`        | 缓存数据所需的读取次数（需要 `enable_cache_hits_threshold`）。                                                                                                               |
| `enable_bypass_cache_with_threshold`   | 布尔值 | `false`    | 跳过大型读取范围的缓存。                                                                                                                                                    |
| `bypass_cache_threshold`               | 大小    | `256Mi`    | 触发缓存绕过的读取范围大小（需要 `enable_bypass_cache_with_threshold`）。                                                                                                    |
| `max_file_segment_size`                | 大小    | `8Mi`      | 单个缓存文件的最大大小，以字节或可读格式。                                                                                                                                  |
| `max_elements`                         | 整数    | `10000000` | 最大缓存文件数量。                                                                                                                                                          |
| `load_metadata_threads`                | 整数    | `16`       | 启动时加载缓存元数据的线程数。                                                                                                                                               |

> **注意**：大小值支持 `ki`、`Mi`、`Gi` 等单位（例如， `10Gi`）。
## 文件缓存查询/配置设置 {#file-cache-query-profile-settings}

| 设置                                                       | 类型    | 默认值                  | 描述                                                                                                                                                      |
|-----------------------------------------------------------|---------|-------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------|
| `enable_filesystem_cache`                                 | 布尔值 | `true`                  | 每个查询启用/禁用缓存使用，即使使用 `cache` 磁盘类型。                                                                                                    |
| `read_from_filesystem_cache_if_exists_otherwise_bypass_cache` | 布尔值 | `false`                 | 启用时，仅在数据存在时使用缓存；新数据不会被缓存。                                                                                                        |
| `enable_filesystem_cache_on_write_operations`             | 布尔值 | `false`（云：`true`）  | 启用写通过缓存。需要缓存配置中设置 `cache_on_write_operations`。                                                                                            |
| `enable_filesystem_cache_log`                             | 布尔值 | `false`                 | 启用详细的缓存使用日志记录到 `system.filesystem_cache_log`。                                                                                             |
| `max_query_cache_size`                                    | 大小    | `false`                 | 每查询的最大缓存大小。需要缓存配置中设置 `enable_filesystem_query_cache_limit`。                                                                            |
| `skip_download_if_exceeds_query_cache`                    | 布尔值 | `true`                  | 控制达到 `max_query_cache_size` 时的行为： <br/>- `true`：停止下载新数据 <br/>- `false`：驱逐旧数据以为新数据腾出空间                                                                 |

:::warning
缓存配置设置和缓存查询设置与最新的 ClickHouse 版本对应，对于早期版本可能不被支持。
:::
#### 缓存系统表 {#cache-system-tables-file-cache}

| 表名                       | 描述                                             | 要求                                    |
|---------------------------|--------------------------------------------------|-----------------------------------------|
| `system.filesystem_cache`  | 显示当前文件系统缓存的状态。                     | 无                                      |
| `system.filesystem_cache_log` | 提供每个查询的详细缓存使用统计信息。             | 需要 `enable_filesystem_cache_log = true` |
#### 缓存命令 {#cache-commands-file-cache}
##### `SYSTEM DROP FILESYSTEM CACHE (<cache_name>) (ON CLUSTER)` -- `ON CLUSTER` {#system-drop-filesystem-cache-on-cluster}

此命令仅在未提供 `<cache_name>` 时支持。
##### `SHOW FILESYSTEM CACHES` {#show-filesystem-caches}

显示在服务器上配置的文件系统缓存列表。
（对于版本小于或等于 `22.8`，该命令命名为 `SHOW CACHES`）

```sql title="Query"
SHOW FILESYSTEM CACHES
```

```text title="Response"
┌─Caches────┐
│ s3_cache  │
└───────────┘
```
##### `DESCRIBE FILESYSTEM CACHE '<cache_name>'` {#describe-filesystem-cache}

显示特定缓存的缓存配置及一些常规统计信息。
缓存名称可以通过 `SHOW FILESYSTEM CACHES` 命令获取。（对于版本小于或等于 `22.8`，该命令命名为 `DESCRIBE CACHE`）

```sql title="Query"
DESCRIBE FILESYSTEM CACHE 's3_cache'
```

```text title="Response"
┌────max_size─┬─max_elements─┬─max_file_segment_size─┬─boundary_alignment─┬─cache_on_write_operations─┬─cache_hits_threshold─┬─current_size─┬─current_elements─┬─path───────┬─background_download_threads─┬─enable_bypass_cache_with_threshold─┐
│ 10000000000 │      1048576 │             104857600 │            4194304 │                         1 │                    0 │         3276 │               54 │ /s3_cache/ │                           2 │                                  0 │
└─────────────┴──────────────┴───────────────────────┴────────────────────┴───────────────────────────┴──────────────────────┴──────────────┴──────────────────┴────────────┴─────────────────────────────┴────────────────────────────────────┘
```

| 当前缓存指标            | 异步缓存指标          | 缓存配置事件                                                              |
|-----------------------|------------------------|------------------------------------------------------------------------|
| `FilesystemCacheSize`  | `FilesystemCacheBytes` | `CachedReadBufferReadFromSourceBytes`, `CachedReadBufferReadFromCacheBytes`   |
| `FilesystemCacheElements` | `FilesystemCacheFiles` | `CachedReadBufferReadFromSourceMicroseconds`, `CachedReadBufferReadFromCacheMicroseconds` |
|                       |                        | `CachedReadBufferCacheWriteBytes`, `CachedReadBufferCacheWriteMicroseconds`  |
|                       |                        | `CachedWriteBufferCacheWriteBytes`, `CachedWriteBufferCacheWriteMicroseconds`  |
### 使用静态 Web 存储（只读） {#web-storage}

这是一个只读磁盘。其数据仅被读取而从未被修改。通过 `ATTACH TABLE` 查询将新表加载到此磁盘中（见下例）。实际上不使用本地磁盘，每个 `SELECT` 查询将导致执行 `http` 请求以获取所需数据。对表数据的所有修改都会导致异常，即不允许以下类型的查询：[`CREATE TABLE`](/sql-reference/statements/create/table.md), [`ALTER TABLE`](/sql-reference/statements/alter/index.md), [`RENAME TABLE`](/sql-reference/statements/rename#rename-table), [`DETACH TABLE`](/sql-reference/statements/detach.md) 和 [`TRUNCATE TABLE`](/sql-reference/statements/truncate.md)。
Web 存储可用于只读目的。一个示例用法是托管示例数据或用于迁移数据。这里有一个工具 `clickhouse-static-files-uploader`，用于为给定表准备数据目录（`SELECT data_paths FROM system.tables WHERE name = 'table_name'`）。
对于您需要的每个表，您将获得一个文件目录。这些文件可以上传到例如静态文件的 Web 服务器。在此准备工作后，您可以通过 `DiskWeb` 将此表加载到任何 ClickHouse 服务器。

在此示例配置中：
- 磁盘类型为 `web`
- 数据托管在 `http://nginx:80/test1/`
- 使用本地存储的缓存

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
如果不预期经常使用 Web 数据集，可以在查询中临时配置存储，参见 [动态配置](#dynamic-configuration)，跳过编辑配置文件。

在 GitHub 上托管了一个 [演示数据集](https://github.com/ClickHouse/web-tables-demo)。要为 Web 存储准备自己的表，请参见工具 [clickhouse-static-files-uploader](/operations/utilities/static-files-disk-uploader)。
:::

在此 `ATTACH TABLE` 查询中提供的 `UUID` 与数据的目录名称匹配，端点是原始 GitHub 内容的 URL。

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

一个准备好的测试用例。您需要将此配置添加到配置中：

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

| 参数      | 描述                                                                                                                |
|-----------|--------------------------------------------------------------------------------------------------------------------|
| `type`    | `web`。否则不会创建磁盘。                                                                                        |
| `endpoint`| 以 `path` 格式给出的端点 URL。端点 URL 必须包含存储数据的根路径，即它们上传的位置。                                           |
#### 可选参数 {#optional-parameters-web}

| 参数                                   | 描述                                                                  | 默认值       |
|---------------------------------------|-----------------------------------------------------------------------|--------------|
| `min_bytes_for_seek`                  | 使用随机读取操作所需的最小字节数                                       | `1` MB       |
| `remote_fs_read_backoff_threashold`   | 尝试从远程磁盘读取数据时的最大等待时间                                | `10000` 秒   |
| `remote_fs_read_backoff_max_tries`    | 读取时的最大重试次数                                                  | `5`          |

如果查询失败并出现异常 `DB:Exception Unreachable URL`，则可以尝试调整设置：[http_connection_timeout](/operations/settings/settings.md/#http_connection_timeout)、[http_receive_timeout](/operations/settings/settings.md/#http_receive_timeout)、[keep_alive_timeout](/operations/server-configuration-parameters/settings#keep_alive_timeout)。

要获取要上传的文件，请运行：
`clickhouse static-files-disk-uploader --metadata-path <path> --output-dir <dir>`（`--metadata-path` 可以在查询中找到 `SELECT data_paths FROM system.tables WHERE name = 'table_name'`）。

通过 `endpoint` 加载文件时，必须加载到 `<endpoint>/store/` 路径中，但配置中只需包含 `endpoint`。

如果在服务器启动表时加载到磁盘时 URL 无法访问，则所有错误都将被捕获。如果在这种情况下发生错误，则可以通过 `DETACH TABLE table_name` -> `ATTACH TABLE table_name` 重新加载（变为可见）表。如果在服务器启动时成功加载了元数据，则表会立即可用。

使用 [http_max_single_read_retries](/operations/storing-data#web-storage) 设置限制单次 HTTP 读取期间的最大重试次数。
### 零拷贝复制（尚未准备好用于生产） {#zero-copy}

零拷贝复制是可能的，但不推荐，使用 `S3` 和 `HDFS`（不支持）磁盘。零拷贝复制意味着，如果数据存储在多个机器上并需要同步，则仅复制元数据（数据部分的路径），而不复制数据本身。

:::note 零拷贝复制尚未准备好用于生产
自 ClickHouse 版本 22.8 及更高版本中，零拷贝复制默认禁用。此功能不推荐用于生产使用。
:::
