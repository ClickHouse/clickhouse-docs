---
'description': 'highlight-next-line 的文档'
'sidebar_label': '外部磁盘用于存储数据'
'sidebar_position': 68
'slug': '/operations/storing-data'
'title': '外部磁盘用于存储数据'
---

在 ClickHouse 中处理的数据通常存储在本地文件系统上——与 ClickHouse 服务器位于同一台机器上。这需要大容量的磁盘，可能非常昂贵。为了避免这种情况，您可以将数据存储在远程位置。支持各种存储：
1. [Amazon S3](https://aws.amazon.com/s3/) 对象存储。
2. [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs)。
3. 不支持：Hadoop 分布式文件系统 ([HDFS](https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html))

:::note ClickHouse 还支持外部表引擎，与本页面描述的外部存储选项不同，它们允许读取以某种通用文件格式（如 Parquet）存储的数据，而在本页面中我们描述的是 ClickHouse `MergeTree` 家族或 `Log` 家族表的存储配置。
1. 要处理存储在 `Amazon S3` 磁盘上的数据，请使用 [S3](/engines/table-engines/integrations/s3.md) 表引擎。
2. 要处理存储在 Azure Blob Storage 中的数据，请使用 [AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage.md) 表引擎。
3. 不支持：要处理 Hadoop 分布式文件系统中的数据——[HDFS](/engines/table-engines/integrations/hdfs.md) 表引擎。
:::

## 配置外部存储 {#configuring-external-storage}

[MergeTree](/engines/table-engines/mergetree-family/mergetree.md) 和 [Log](/engines/table-engines/log-family/log.md) 家族表引擎可以使用类型为 `s3`、`azure_blob_storage`、`hdfs`（不支持）的磁盘将数据存储到 `S3`、`AzureBlobStorage`、`HDFS` 中。

磁盘配置要求：
1. `type` 部分，等于 `s3`、`azure_blob_storage`、`hdfs`（不支持）、`local_blob_storage`、`web` 中的一个。
2. 特定外部存储类型的配置。

从 24.1 版本开始，可以使用新配置选项。
需要指定：
1. `type` 等于 `object_storage`
2. `object_storage_type`，等于 `s3`、`azure_blob_storage`（或从 `24.3` 开始的 `azure`）、`hdfs`（不支持）、`local_blob_storage`（或从 `24.3` 开始的 `local`）、`web` 中的一个。
可选地，可以指定 `metadata_type`（默认等于 `local`），但也可以设置为 `plain`、`web`，并且从 `24.4` 开始，可以设置为 `plain_rewritable`。
`plain` 元数据类型的使用在 [plain storage section](/operations/storing-data#plain-storage) 中进行了描述，`web` 元数据类型只能与 `web` 对象存储类型一起使用，`local` 元数据类型在本地存储元数据文件（每个元数据文件包含对对象存储中文件的映射以及关于它们的一些附加元信息）。

例如，配置选项
```xml
<s3>
    <type>s3</type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3>
```

相当于配置（来自 `24.1`）：
```xml
<s3>
    <type>object_storage</type>
    <object_storage_type>s3</object_storage_type>
    <metadata_type>local</metadata_type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3>
```

配置
```xml
<s3_plain>
    <type>s3_plain</type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain>
```

等同于
```xml
<s3_plain>
    <type>object_storage</type>
    <object_storage_type>s3</object_storage_type>
    <metadata_type>plain</metadata_type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain>
```

完整存储配置的示例如下：
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

为了将特定类型的存储设置为所有 `MergeTree` 表的默认选项，请在配置文件中添加以下部分：
```xml
<clickhouse>
    <merge_tree>
        <storage_policy>s3</storage_policy>
    </merge_tree>
</clickhouse>
```

如果您只想为特定表配置特定的存储策略，可以在创建表时在设置中定义：

```sql
CREATE TABLE test (a Int32, b String)
ENGINE = MergeTree() ORDER BY a
SETTINGS storage_policy = 's3';
```

您还可以使用 `disk` 替代 `storage_policy`。在这种情况下，不需要在配置文件中有 `storage_policy` 部分，仅需要 `disk` 部分即可。

```sql
CREATE TABLE test (a Int32, b String)
ENGINE = MergeTree() ORDER BY a
SETTINGS disk = 's3';
```

## 动态配置 {#dynamic-configuration}

也可以在配置文件中指定存储配置，而不需要预定义的磁盘，但可以在 `CREATE`/`ATTACH` 查询设置中配置。

以下示例查询构建在上述动态磁盘配置基础上，展示如何使用本地磁盘缓存来自存储在 URL 的表的数据。

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

在下方突出显示的设置中，请注意 `type=web` 的磁盘被嵌套在 `type=cache` 的磁盘内。

:::note
示例使用 `type=web`，但是任何磁盘类型都可以配置为动态，即使是本地磁盘。本地磁盘需要一个路径参数，该参数必须在服务器配置参数 `custom_local_disks_base_directory` 内，且没有默认值，因此在使用本地磁盘时也请设置该值。
:::

配置基于的配置和 sql 定义的配置也是可能的：

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

必需参数：

- `endpoint` — S3 端点 URL，符合 `path` 或 `virtual hosted` [风格](https://docs.aws.amazon.com/AmazonS3/latest/dev/VirtualHosting.html)。端点 URL 应包含一个存储数据的存储桶和根路径。
- `access_key_id` — S3 访问密钥 ID。
- `secret_access_key` — S3 秘密访问密钥。

可选参数：

- `region` — S3 区域名称。
- `support_batch_delete` — 这控制检查是否支持批量删除。使用 Google Cloud Storage (GCS) 时，将此设置为 `false`，因为 GCS 不支持批量删除，防止检查将防止日志中的错误消息。
- `use_environment_credentials` — 从环境变量 AWS_ACCESS_KEY_ID 和 AWS_SECRET_ACCESS_KEY 及 AWS_SESSION_TOKEN 中读取 AWS 凭证（如果存在）。默认值为 `false`。
- `use_insecure_imds_request` — 如果设置为 `true`，S3 客户端将使用不安全的 IMDS 请求来从 Amazon EC2 元数据中获取凭证。默认值为 `false`。
- `expiration_window_seconds` — 检查基于过期的凭证是否过期的宽限期。可选，默认值为 `120`。
- `proxy` — S3 端点的代理配置。每个 `uri` 元素在 `proxy` 块内应包含一个代理 URL。
- `connect_timeout_ms` — 套接字连接超时时间（毫秒）。默认值为 `10 seconds`。
- `request_timeout_ms` — 请求超时时间（毫秒）。默认值为 `5 seconds`。
- `retry_attempts` — 请求失败时的重试次数。默认值为 `10`。
- `single_read_retries` — 读取过程中连接断开时的重试次数。默认值为 `4`。
- `min_bytes_for_seek` — 使用查找操作而不是顺序读取的最小字节数。默认值为 `1 Mb`。
- `metadata_path` — 在本地文件系统上存储 S3 的元数据文件的路径。默认值为 `/var/lib/clickhouse/disks/<disk_name>/`。
- `skip_access_check` — 如果为 true，则在磁盘启动时将不执行磁盘访问检查。默认值为 `false`。
- `header` — 为请求添加指定的 HTTP 头到给定的端点。可选，可以多次指定。
- `server_side_encryption_customer_key_base64` — 如果指定，将为使用 SSE-C 加密访问 S3 对象设置所需的头。
- `server_side_encryption_kms_key_id` - 如果指定，将为使用 [SSE-KMS 加密](https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingKMSEncryption.html) 访问 S3 对象设置所需的头。如果指定为空字符串，则将使用 AWS 管理的 S3 密钥。可选。
- `server_side_encryption_kms_encryption_context` - 如果与 `server_side_encryption_kms_key_id` 一起指定，则为 SSE-KMS 设置给定的加密上下文头。可选。
- `server_side_encryption_kms_bucket_key_enabled` - 如果与 `server_side_encryption_kms_key_id` 一起指定，则将为 SSE-KMS 设置启用 S3 存储桶密钥的头。可选，可以为 `true` 或 `false`，默认值为空（与存储桶级别设置匹配）。
- `s3_max_put_rps` — 每秒最大 PUT 请求速率，达到限制时开始限流。默认值为 `0`（无限制）。
- `s3_max_put_burst` — 可以同时发出的请求的最大数量，直到超过每秒限制。默认值（`0` 值）等于 `s3_max_put_rps`。
- `s3_max_get_rps` — 每秒最大 GET 请求速率，达到限制时开始限流。默认值为 `0`（无限制）。
- `s3_max_get_burst` — 可以同时发出的请求的最大数量，直到超过每秒限制。默认值（`0` 值）等于 `s3_max_get_rps`。
- `read_resource` — 用于对该磁盘 [调度](/operations/workload-scheduling.md) 读取请求的资源名称。默认值为空字符串（对于该磁盘未启用 IO 调度）。
- `write_resource` — 用于对该磁盘 [调度](/operations/workload-scheduling.md) 写入请求的资源名称。默认值为空字符串（对于该磁盘未启用 IO 调度）。
- `key_template` — 定义对象键生成的格式。默认情况下，Clickhouse 从 `endpoint` 选项中获取 `root path` 并添加随机生成的后缀。该后缀是一个包含三个随机符号的目录和一个包含 29 个随机符号的文件名。通过该选项，您可以完全控制对象键的生成方式。一些使用场景要求在前缀或对象键的中间有随机符号。例如：[a-z]{3}-prefix-random/constant-part/random-middle-[a-z]{3}/random-suffix-[a-z]{29}。该值使用 [`re2`](https://github.com/google/re2/wiki/Syntax) 解析。仅支持某些子集语法。在使用该选项之前，请确认您所需的格式是否受支持。如果 Clickhouse 无法通过 `key_template` 的值生成键，则磁盘未初始化。它需要启用功能标志 [storage_metadata_write_full_object_key](/operations/storing-data#s3-storage)。这禁止在 `endpoint` 选项中声明 `root path`。需要定义选项 `key_compatibility_prefix`。
- `key_compatibility_prefix` — 当选项 `key_template` 被使用时，此选项是必需的。为了能够读取以低于 `VERSION_FULL_OBJECT_KEY` 的元数据版本存储在元数据文件中的对象键，应在此设置先前的 `root path` ，此路径来自于 `endpoint` 选项。

:::note
Google Cloud Storage (GCS) 也支持使用类型 `s3`。请参见 [GCS backed MergeTree](/integrations/gcs)。
:::

### 使用 Plain 存储 {#plain-storage}

在 `22.10` 中引入了新的磁盘类型 `s3_plain`，它提供了一个只写存储。配置参数与 `s3` 磁盘类型相同。
与 `s3` 磁盘类型不同，它以原样存储数据，例如，它使用正常文件名而不是随机生成的 blob 名称（与 clickhouse 在本地磁盘上存储文件的方式相同），并且不在本地存储任何元数据，例如，它是通过 S3 上的数据派生的。

该磁盘类型允许保持表的静态版本，因为它不允许对现有数据执行合并，也不允许插入新数据。
此磁盘类型的用例是进行备份，可以通过 `BACKUP TABLE data TO Disk('plain_disk_name', 'backup_name')` 来完成。之后，您可以执行 `RESTORE TABLE data AS data_restored FROM Disk('plain_disk_name', 'backup_name')` 或使用 `ATTACH TABLE data (...) ENGINE = MergeTree() SETTINGS disk = 'plain_disk_name'`。

配置：
```xml
<s3_plain>
    <type>s3_plain</type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain>
```

从 `24.1` 开始，可以配置任何对象存储磁盘（`s3`、`azure`、`hdfs`（不支持）、`local`）使用 `plain` 元数据类型。

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

### 使用 S3 Plain 可重写存储 {#s3-plain-rewritable-storage}

在 `24.4` 中引入了一种新磁盘类型 `s3_plain_rewritable`。
与 `s3_plain` 磁盘类型类似，它不需要额外的存储来保存元数据文件；相反，元数据存储在 S3 中。
与 `s3_plain` 磁盘类型不同，`s3_plain_rewritable` 允许执行合并并支持 INSERT 操作。
[变更](/sql-reference/statements/alter#mutations)和表的复制不受支持。

此磁盘类型的使用场景为非复制的 `MergeTree` 表。尽管 `s3` 磁盘类型适合非复制的
MergeTree 表，您可能会选择 `s3_plain_rewritable` 磁盘类型，如果您不需要表的本地元数据，并愿意接受一组有限的操作。 这对于系统表等情况可能非常有用。

配置：
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

从 `24.5` 开始，可以配置任何对象存储磁盘（`s3`、`azure`、`local`）使用 `plain_rewritable` 元数据类型。

### 使用 Azure Blob Storage {#azure-blob-storage}

`MergeTree` 家族表引擎可以使用类型为 `azure_blob_storage` 的磁盘存储数据到 [Azure Blob Storage](https://azure.microsoft.com/en-us/services/storage/blobs/)。

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

连接参数：
* `storage_account_url` - **必需**，Azure Blob Storage 帐户 URL，例如 `http://account.blob.core.windows.net` 或 `http://azurite1:10000/devstoreaccount1`。
* `container_name` - 目标容器名称，默认为 `default-container`。
* `container_already_exists` - 如果设置为 `false`，则会在存储帐户中创建一个新的容器 `container_name`；如果设置为 `true`，则磁盘直接连接到该容器；如果未设置，则磁盘连接到帐户，检查容器 `container_name` 是否存在，并在不存在时创建它。

身份验证参数（磁盘将尝试所有可用方法 **和** 受管身份凭证）：
* `connection_string` - 用于使用连接字符串进行身份验证。
* `account_name` 和 `account_key` - 用于使用共享密钥进行身份验证。

限制参数（主要用于内部使用）：
* `s3_max_single_part_upload_size` - 限制对 Blob 存储的单个块上传的大小。
* `min_bytes_for_seek` - 限制可寻址区域的大小。
* `max_single_read_retries` - 限制从 Blob 存储读取数据块的尝试次数。
* `max_single_download_retries` - 限制从 Blob 存储下载可读缓冲区的尝试次数。
* `thread_pool_size` - 限制实例化 `IDiskRemote` 的线程数量。
* `s3_max_inflight_parts_for_one_file` - 限制可以并发运行的单个对象的 PUT 请求数量。

其他参数：
* `metadata_path` - 在本地文件系统上存储 Blob 存储的元数据文件的路径。默认值为 `/var/lib/clickhouse/disks/<disk_name>/`。
* `skip_access_check` - 如果为 true，则在磁盘启动时将不执行磁盘访问检查。默认值为 `false`。
* `read_resource` — 用于对该磁盘 [调度](/operations/workload-scheduling.md) 读取请求的资源名称。默认值为空字符串（IO 调度未启用）。
* `write_resource` — 用于对该磁盘 [调度](/operations/workload-scheduling.md) 写入请求的资源名称。默认值为空字符串（IO 调度未启用）。
* `metadata_keep_free_space_bytes` - 保留的元数据磁盘空间的数量。

可以在集成测试目录中找到工作配置的示例（例如 [test_merge_tree_azure_blob_storage](https://github.com/ClickHouse/ClickHouse/blob/master/tests/integration/test_merge_tree_azure_blob_storage/configs/config.d/storage_conf.xml) 或 [test_azure_blob_storage_zero_copy_replication](https://github.com/ClickHouse/ClickHouse/blob/master/tests/integration/test_azure_blob_storage_zero_copy_replication/configs/config.d/storage_conf.xml)）。

:::note 零拷贝复制还未准备好投入生产
在 ClickHouse 版本 22.8 及更高版本中，默认禁用零拷贝复制。此功能不建议用于生产用途。
:::

## 使用 HDFS 存储（不支持） {#using-hdfs-storage-unsupported}

在此示例配置中：
- 磁盘类型为 `hdfs`（不支持）
- 数据托管在 `hdfs://hdfs1:9000/clickhouse/`

顺便提一下，不支持 HDFS，因此在使用时可能会出现问题。如果出现任何问题，请随时提交修复的拉取请求。

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

请记住 HDFS 在边缘情况下可能无法正常工作。

### 使用数据加密 {#encrypted-virtual-file-system}

您可以加密存储在 [S3](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3) 或 [HDFS](#using-hdfs-storage-unsupported)（不支持）外部磁盘或本地磁盘的数据。要打开加密模式，您必须在配置文件中定义一个类型为 `encrypted` 的磁盘，并选择一个用于保存数据的磁盘。`encrypted` 磁盘会动态加密所有写入的文件，当您从 `encrypted` 磁盘中读取文件时，它会自动解密。因此您可以像使用普通磁盘一样使用 `encrypted` 磁盘。

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

例如，当 ClickHouse 将某个表的数据写入文件 `store/all_1_1_0/data.bin` 到 `disk1` 时，实际上，该文件将沿路径 `/path1/store/all_1_1_0/data.bin` 写入物理磁盘。

当将同一文件写入 `disk2` 时，它实际上将以加密模式写入物理磁盘，路径为 `/path1/path2/store/all_1_1_0/data.bin`。

必需参数：

- `type` — `encrypted`。否则不会创建加密磁盘。
- `disk` — 数据存储磁盘的类型。
- `key` — 用于加密和解密的密钥。类型：[Uint64](/sql-reference/data-types/int-uint.md)。您可以使用 `key_hex` 参数以十六进制形式编码密钥。
    您可以使用 `id` 属性指定多个密钥（见下例）。

可选参数：

- `path` — 指定数据将保存的磁盘位置的路径。如果没有指定，数据将保存在根目录。
- `current_key_id` — 用于加密的密钥。所有指定的密钥都可用于解密，并且始终可以在维护对先前加密数据的访问时切换到另一个密钥。
- `algorithm` — [算法](/sql-reference/statements/create/table#encryption-codecs) 用于加密。可能的值：`AES_128_CTR`、`AES_192_CTR` 或 `AES_256_CTR`。默认值：`AES_128_CTR`。密钥长度取决于算法：`AES_128_CTR` — 16 字节，`AES_192_CTR` — 24 字节，`AES_256_CTR` — 32 字节。

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
在版本 22.3 - 22.7 中，仅支持 `s3` 磁盘类型的缓存。在版本 >= 22.8 中，缓存适用于任何磁盘类型：S3、Azure、本地、加密等。
在版本 >= 23.5 中，缓存仅支持远程磁盘类型：S3、Azure、HDFS（不支持）。
缓存使用 `LRU` 缓存策略。

对于版本 22.8 或更高的示例配置：

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

对于版本早于 22.8 的示例配置：

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

这些设置应在磁盘配置部分中定义。

- `path` - 缓存目录的路径。默认值：无，此设置是强制的。

- `max_size` - 缓存的最大大小（以字节为单位或可读格式，例如 `ki、Mi、Gi` 等），示例 `10Gi`（这种格式从 `22.10` 版本开始有效）。当达到限制时，根据缓存驱逐策略驱逐缓存文件。默认值：无，此设置是强制的。

- `cache_on_write_operations` - 允许启用 `write-through` 缓存（在任何写操作时缓存数据：`INSERT` 查询、后台合并）。默认值：`false`。`write-through` 缓存可以通过设置 `enable_filesystem_cache_on_write_operations` 在每个查询中禁用（数据仅在缓存配置和相应查询设置都启用的情况下进行缓存）。

- `enable_filesystem_query_cache_limit` - 允许限制每个查询下载的缓存大小（取决于用户设置 `max_query_cache_size`）。默认值：`false`。

- `enable_cache_hits_threshold` - 定义需要读取多少次数据后才能缓存。默认值：`false`。此阈值可以由 `cache_hits_threshold` 定义。默认值：0，例如，在首次尝试读取数据时会进行缓存。

- `enable_bypass_cache_with_threshold` - 如果请求的读取范围超出阈值，则完全跳过缓存。默认值：`false`。此阈值可以由 `bypass_cache_threshold` 定义。默认值：268435456 (`256Mi`)。

- `max_file_segment_size` - 单个缓存文件的最大大小（以字节为单位或可读格式，例如 `ki、Mi、Gi` 等，示例 `10Gi`）。默认值：8388608 (`8Mi`)。

- `max_elements` - 缓存文件的数量限制。默认值：10000000。

- `load_metadata_threads` - 启动时用于加载缓存元数据的线程数。默认值：16。

文件缓存 **查询/配置文件设置**：

这些设置中的一些会在每个查询/配置文件中禁用默认启用的缓存特性或在磁盘配置设置中启用。例如，您可以在磁盘配置中启用缓存并在查询/配置文件设置 `enable_filesystem_cache` 中将其禁用为 `false`。在磁盘配置中将 `cache_on_write_operations` 设置为 `true` 意味着启用了“写穿”缓存。但是，如果您需要在特定查询中禁用此通用设置，则在特定查询/配置文件中将 `enable_filesystem_cache_on_write_operations` 设置为 `false`，意味着将为特定查询/配置文件禁用写操作缓存。

- `enable_filesystem_cache` - 允许在查询中禁用缓存，即使存储策略已配置为 `cache` 磁盘类型。默认值：`true`。

- `read_from_filesystem_cache_if_exists_otherwise_bypass_cache` - 在查询中仅在缓存已经存在时允许使用缓存，否则将不会将查询数据写入本地缓存存储。默认值：`false`。

- `enable_filesystem_cache_on_write_operations` - 启用 `write-through` 缓存。此设置仅在缓存配置中的 `cache_on_write_operations` 设置打开时有效。默认值：`false`。云默认值：`true`。

- `enable_filesystem_cache_log` - 启用记录到 `system.filesystem_cache_log` 表。提供每个查询缓存使用的详细视图。可以为特定查询开启，也可以在配置文件中启用。默认值：`false`。

- `max_query_cache_size` - 可写入本地缓存存储的缓存大小限制。需要在缓存配置中启用 `enable_filesystem_query_cache_limit`。默认值：`false`。

- `skip_download_if_exceeds_query_cache` - 允许更改设置 `max_query_cache_size` 的行为。默认值：`true`。如果此设置开启且在查询期间达到缓存下载限制，则将不再下载缓存到缓存存储。如果此设置关闭且在查询期间达到缓存下载限制，则仍然将缓存写入，但将驱逐先前在当前查询期间下载的数据，也就是说，第二种行为允许在保持查询缓存限制的情况下保留“最后最近使用”行为。

**警告**
缓存配置设置和缓存查询设置对应于最新的 ClickHouse 版本，对于早期版本，可能不支持某些内容。

缓存 **系统表**：

- `system.filesystem_cache` - 显示缓存当前状态的系统表。

- `system.filesystem_cache_log` - 显示每个查询详细缓存使用情况的系统表。需要将 `enable_filesystem_cache_log` 设置为 `true`。

缓存 **命令**：

- `SYSTEM DROP FILESYSTEM CACHE (<cache_name>) (ON CLUSTER)` -- `ON CLUSTER` 仅在未提供 `<cache_name>` 时支持

- `SHOW FILESYSTEM CACHES` -- 显示已在服务器上配置的文件系统缓存的列表。（对于版本 `<= 22.8`，命令名为 `SHOW CACHES`）

```sql
SHOW FILESYSTEM CACHES
```

结果：

```text
┌─Caches────┐
│ s3_cache  │
└───────────┘
```

- `DESCRIBE FILESYSTEM CACHE '<cache_name>'` - 显示特定缓存的配置和一些一般统计信息。缓存名称可以从 `SHOW FILESYSTEM CACHES` 命令中获取。（对于版本 `<= 22.8`，命令名为 `DESCRIBE CACHE`）

```sql
DESCRIBE FILESYSTEM CACHE 's3_cache'
```

```text
┌────max_size─┬─max_elements─┬─max_file_segment_size─┬─boundary_alignment─┬─cache_on_write_operations─┬─cache_hits_threshold─┬─current_size─┬─current_elements─┬─path───────┬─background_download_threads─┬─enable_bypass_cache_with_threshold─┐
│ 10000000000 │      1048576 │             104857600 │            4194304 │                         1 │                    0 │         3276 │               54 │ /s3_cache/ │                           2 │                                  0 │
└─────────────┴──────────────┴───────────────────────┴────────────────────┴───────────────────────────┴──────────────────────┴──────────────┴──────────────────┴────────────┴─────────────────────────────┴────────────────────────────────────┘
```

缓存当前指标：

- `FilesystemCacheSize`

- `FilesystemCacheElements`

缓存异步指标：

- `FilesystemCacheBytes`

- `FilesystemCacheFiles`

缓存配置文件事件：

- `CachedReadBufferReadFromSourceBytes`, `CachedReadBufferReadFromCacheBytes,`

- `CachedReadBufferReadFromSourceMicroseconds`, `CachedReadBufferReadFromCacheMicroseconds`

- `CachedReadBufferCacheWriteBytes`, `CachedReadBufferCacheWriteMicroseconds`

- `CachedWriteBufferCacheWriteBytes`, `CachedWriteBufferCacheWriteMicroseconds`

### 使用静态 Web 存储（只读） {#web-storage}

这是一种只读磁盘。它的数据仅被读取，永不被修改。通过 `ATTACH TABLE` 查询将新表加载到该磁盘上（见下例）。实际上不使用本地磁盘，每个 `SELECT` 查询都将发出 `http` 请求以获取所需数据。所有对表数据的修改将导致异常，即以下类型的查询不被允许：[CREATE TABLE](/sql-reference/statements/create/table.md)、[ALTER TABLE](/sql-reference/statements/alter/index.md)、[RENAME TABLE](/sql-reference/statements/rename#rename-table)、[DETACH TABLE](/sql-reference/statements/detach.md) 和 [TRUNCATE TABLE](/sql-reference/statements/truncate.md)。
Web 存储可用于只读目的。一个使用例是用于托管示例数据或迁移数据。
有一个工具 `clickhouse-static-files-uploader`，它为给定表准备数据目录（`SELECT data_paths FROM system.tables WHERE name = 'table_name'`）。对于您需要的每个表，您将获得一个文件目录。这些文件可以上传到例如静态文件的 Web 服务器上。在完成此准备后，您可以通过 `DiskWeb` 将该表加载到任何 ClickHouse 服务器中。

在此示例配置中：
- 磁盘类型为 `web`
- 数据托管在 `http://nginx:80/test1/`
- 使用了本地存储的缓存

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
如果不期望常规使用某个 Web 数据集，则可以在查询中临时配置存储，请查看 [动态配置](#dynamic-configuration) 并跳过编辑配置文件。
:::

:::tip
一个 [示例数据集](https://github.com/ClickHouse/web-tables-demo) 托管在 GitHub 上。要准备您自己的表进行 Web 存储，请参见工具 [clickhouse-static-files-uploader](/operations/utilities/static-files-disk-uploader)。
:::

在此 `ATTACH TABLE` 查询中，提供的 `UUID` 与数据目录名称匹配，端点是原始 GitHub 内容的 URL。

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

一个准备好的测试用例。您需要将此配置添加到配置文件：

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

必需参数：

- `type` — `web`。否则不会创建磁盘。
- `endpoint` — 以 `path` 格式给出的端点 URL。端点 URL 必须包含存储数据的根路径，即存储它们的路径。

可选参数：

- `min_bytes_for_seek` — 使用查找操作代替顺序读取的最小字节数。默认值：`1` Mb。
- `remote_fs_read_backoff_threashold` — 尝试从远程磁盘读取数据时的最大等待时间。默认值：`10000` 秒。
- `remote_fs_read_backoff_max_tries` — 尝试以回退方式读取的最大次数。默认值：`5`。

如果查询了异常 `DB:Exception Unreachable URL`，那么您可以尝试调整设置：[http_connection_timeout](/operations/settings/settings.md/#http_connection_timeout)、[http_receive_timeout](/operations/settings/settings.md/#http_receive_timeout)、[keep_alive_timeout](/operations/server-configuration-parameters/settings#keep_alive_timeout)。

要获取上传文件，请运行：
`clickhouse static-files-disk-uploader --metadata-path <path> --output-dir <dir>` （`--metadata-path` 可以在查询 `SELECT data_paths FROM system.tables WHERE name = 'table_name'` 中找到）。

通过 `endpoint` 加载文件时，必须将它们加载到 `<endpoint>/store/` 路径中，但配置中必须仅包含 `endpoint`。

如果在服务器启动加载表时，磁盘加载的 URL 不可达，则所有错误都会被捕获。如果此情况下发生错误，表可以通过 `DETACH TABLE table_name` -> `ATTACH TABLE table_name` 重新加载（变得可见）。如果在服务器启动时成功加载了元数据，则表可以立即使用。

使用 [http_max_single_read_retries](/operations/storing-data#web-storage) 设置来限制在单个 HTTP 读取期间的最大重试次数。

### 零拷贝复制（尚未准备好用于生产） {#zero-copy}

零拷贝复制是可能的，但不推荐使用，适用于 `S3` 和 `HDFS`（不支持）磁盘。零拷贝复制的意思是，如果数据存储在远程多个机器上并需要同步，则仅复制元数据（数据部分的路径），而不是数据本身。

:::note 零拷贝复制尚未准备好用于生产
在 ClickHouse 版本 22.8 及更高版本中，默认禁用零拷贝复制。此功能不建议用于生产用途。
:::
