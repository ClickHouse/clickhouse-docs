---
'description': '用于突出显示下一行的文档'
'sidebar_label': '用于存储数据的外部磁盘'
'sidebar_position': 68
'slug': '/operations/storing-data'
'title': '用于存储数据的外部磁盘'
---

Data, processed in ClickHouse, is usually stored in the local file system — on the same machine with the ClickHouse server. That requires large-capacity disks, which can be expensive enough. To avoid that you can store the data remotely. Various storages are supported:
1. [Amazon S3](https://aws.amazon.com/s3/) 对象存储。
2. [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs)。
3. 不支持：Hadoop 分布式文件系统 ([HDFS](https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html))

:::note ClickHouse 还支持外部表引擎，这与本页所描述的外部存储选项不同，因为它们允许读取以某种通用文件格式（如 Parquet）存储的数据，而本页描述的是 ClickHouse `MergeTree` 家族或 `Log` 家族表的存储配置。
1. 使用 [S3](/engines/table-engines/integrations/s3.md) 表引擎处理存储在 `Amazon S3` 磁盘上的数据。
2. 使用 [AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage.md) 表引擎处理存储在 Azure Blob Storage 中的数据。
3. 不支持：使用 Hadoop 分布式文件系统的数据 - [HDFS](/engines/table-engines/integrations/hdfs.md) 表引擎。
:::

## 配置外部存储 {#configuring-external-storage}

[MergeTree](/engines/table-engines/mergetree-family/mergetree.md) 和 [Log](/engines/table-engines/log-family/log.md) 家族表引擎可以通过类型为 `s3`、`azure_blob_storage`、`hdfs`（不支持） 的磁盘存储数据到 `S3`、`AzureBlobStorage`、`HDFS`（不支持）。

磁盘配置要求：
1. `type` 部分，等于 `s3`、`azure_blob_storage`、`hdfs`（不支持）、`local_blob_storage`、`web` 之一。
2. 特定外部存储类型的配置。

从 24.1 版本开始，clickhouse 版本可以使用新的配置选项。
它要求指定：
1. `type` 等于 `object_storage`
2. `object_storage_type` 等于 `s3`、`azure_blob_storage`（或从 `24.3` 起仅为 `azure`）、`hdfs`（不支持）、`local_blob_storage`（或从 `24.3` 起仅为 `local`）、`web`。
可选地，可以指定 `metadata_type`（默认等于 `local`），但它也可以设置为 `plain`、`web`，并且从 `24.4` 开始，可以为 `plain_rewritable`。
使用 `plain` 元数据类型的描述在 [plain storage section](/operations/storing-data#plain-storage) 中，`web` 元数据类型只能与 `web` 对象存储类型一起使用，`local` 元数据类型将元数据文件存储在本地（每个元数据文件包含对对象存储中文件的映射和一些关于它们的附加元信息）。

例如配置选项
```xml
<s3>
    <type>s3</type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3>
```

等同于配置（从 `24.1`）：
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

从 24.1 clickhouse 版本开始，它的形式也可以如下：
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

为了使特定类型的存储成为所有 `MergeTree` 表的默认选项，请将以下部分添加到配置文件中：
```xml
<clickhouse>
    <merge_tree>
        <storage_policy>s3</storage_policy>
    </merge_tree>
</clickhouse>
```

如果您只想为特定表配置特定的存储策略，可以在创建表时在设置中定义它：

```sql
CREATE TABLE test (a Int32, b String)
ENGINE = MergeTree() ORDER BY a
SETTINGS storage_policy = 's3';
```

您也可以使用 `disk` 代替 `storage_policy`。在这种情况下，配置文件中不需要有 `storage_policy` 部分，只需要 `disk` 部分即可。

```sql
CREATE TABLE test (a Int32, b String)
ENGINE = MergeTree() ORDER BY a
SETTINGS disk = 's3';
```

## 动态配置 {#dynamic-configuration}

还可以在配置文件中指定存储配置，而无需预定义磁盘，但可以在 `CREATE` / `ATTACH` 查询设置中配置。

以下示例查询建立在上述动态磁盘配置的基础上，展示了如何使用本地磁盘缓存来自存储在 URL 中的表的数据。

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

在下面突出显示的设置中，注意 `type=web` 的磁盘嵌套在类型为 `cache` 的磁盘内。

:::note
该示例使用 `type=web`，但任何磁盘类型都可以配置为动态，甚至本地磁盘。本地磁盘需要一个路径参数，该路径参数应在服务器配置参数 `custom_local_disks_base_directory` 内，此参数没有默认值，因此在使用本地磁盘时也要设置。
:::

基于配置的配置与 SQL 定义的配置的组合也是可以的：

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

其中 `web` 来自于服务器配置文件：

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

所需参数：

- `endpoint` — S3 端点 URL，采用 `path` 或 `virtual hosted` [样式](https://docs.aws.amazon.com/AmazonS3/latest/dev/VirtualHosting.html)。端点 URL 应包含桶和存储数据的根路径。
- `access_key_id` — S3 访问密钥 id。
- `secret_access_key` — S3 秘密访问密钥。

可选参数：

- `region` — S3 区域名称。
- `support_batch_delete` — 这会控制是否支持批量删除。在使用 Google Cloud Storage (GCS) 时，将此设置为 `false`，因为 GCS 不支持批量删除，防止检查将防止日志中的错误消息。
- `use_environment_credentials` — 如果存在，从环境变量 AWS_ACCESS_KEY_ID 和 AWS_SECRET_ACCESS_KEY 和 AWS_SESSION_TOKEN 中读取 AWS 凭据。默认值为 `false`。
- `use_insecure_imds_request` — 如果设置为 `true`，S3 客户端将在从 Amazon EC2 元数据获取凭据时使用不安全的 IMDS 请求。默认值为 `false`。
- `expiration_window_seconds` — 检查基于过期的凭据是否已过期的宽限期。可选，默认值为 `120`。
- `proxy` — S3 端点的代理配置。每个 `uri` 元素应包含一个代理 URL。
- `connect_timeout_ms` — 以毫秒为单位的 socket 连接超时。默认值为 `10 秒`。
- `request_timeout_ms` — 以毫秒为单位的请求超时。默认值为 `5 秒`。
- `retry_attempts` — 在请求失败时的重试次数。默认值为 `10`。
- `single_read_retries` — 在读取期间连接丢失时的重试次数。默认值为 `4`。
- `min_bytes_for_seek` — 使用 seek 操作而不是顺序读取的最小字节数。默认值为 `1 Mb`。
- `metadata_path` — 在本地文件系统中存储 S3 元数据文件的路径。默认值为 `/var/lib/clickhouse/disks/<disk_name>/`。
- `skip_access_check` — 如果为 true，则在启动磁盘时将不执行磁盘访问检查。默认值为 `false`。
- `header` — 向请求中添加指定的 HTTP 头到给定的端点。可选，可以多次指定。
- `server_side_encryption_customer_key_base64` — 如果指定，将设置访问使用 SSE-C 加密 S3 对象所需的头。
- `server_side_encryption_kms_key_id` - 如果指定，将设置访问使用 [SSE-KMS 加密](https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingKMSEncryption.html) S3 对象所需的头。如果指定为空字符串，则将使用 AWS 管理的 S3 密钥。可选。
- `server_side_encryption_kms_encryption_context` - 如果与 `server_side_encryption_kms_key_id` 一起指定，将为 SSE-KMS 设置给定的加密上下文头。可选。
- `server_side_encryption_kms_bucket_key_enabled` - 如果与 `server_side_encryption_kms_key_id` 一起指定，将设置用于 SSE-KMS 的 S3 桶密钥的启用头。可选，可以是 `true` 或 `false`，默认为空（匹配桶级设置）。
- `s3_max_put_rps` — 在节流之前每秒最大 PUT 请求率。默认值为 `0`（无限制）。
- `s3_max_put_burst` — 在达到每秒请求限制之前可以同时发出的最大请求数。默认值为 `0`（等于 `s3_max_put_rps`）。
- `s3_max_get_rps` — 在节流之前每秒最大 GET 请求率。默认值为 `0`（无限制）。
- `s3_max_get_burst` — 在达到每秒请求限制之前可以同时发出的最大请求数。默认值为 `0`（等于 `s3_max_get_rps`）。
- `read_resource` — 要用于 [调度](/operations/workload-scheduling.md) 此磁盘读取请求的资源名称。默认值为空字符串（此磁盘未启用 IO 调度）。
- `write_resource` — 要用于 [调度](/operations/workload-scheduling.md) 此磁盘写请求的资源名称。默认值为空字符串（此磁盘未启用 IO 调度）。
- `key_template` — 定义对象键生成的格式。默认情况下，Clickhouse 从 `endpoint` 选项中获取 `root path` 并添加随机生成的后缀。该后缀是一个具有 3 个随机符号的目录和具有 29 个随机符号的文件名。使用该选项，您可以完全控制对象键的生成方式。一些使用场景要求在前缀或对象键中间具有随机符号。例如：`[a-z]{3}-prefix-random/constant-part/random-middle-[a-z]{3}/random-suffix-[a-z]{29}`。该值由 [`re2`](https://github.com/google/re2/wiki/Syntax) 解析。仅支持语法的某些子集。使用该选项之前，请检查您希望的格式是否受支持。如果 clickhouse 无法根据 `key_template` 的值生成密钥，则磁盘不会初始化。它需要启用功能标志 [storage_metadata_write_full_object_key](/operations/storing-data#s3-storage)。它禁止在 `endpoint` 选项中声明 `root path`。它需要定义 `key_compatibility_prefix` 选项。
- `key_compatibility_prefix` — 当使用 `key_template` 选项时，必须提供该选项。为了能够读取存储在元数据文件中的对象键（其元数据版本低于 `VERSION_FULL_OBJECT_KEY`），此处应设置 `endpoint` 选项中的先前 `root path`。

:::note
Google Cloud Storage (GCS) 也支持使用类型 `s3`。请查看 [GCS backed MergeTree](/integrations/gcs)。
:::

### 使用 Plain 存储 {#plain-storage}

在 `22.10` 中引入了一种新的磁盘类型 `s3_plain`，提供一次写入存储。配置参数与 `s3` 磁盘类型相同。
与 `s3` 磁盘类型不同，它以原样存储数据，例如，它使用正常的文件名（与 clickhouse 在本地磁盘上存储文件的方式相同），并且不在本地存储任何元数据，例如，它是来自 `s3` 的数据。

此磁盘类型允许保持表的静态版本，因为它不允许对现有数据执行合并并且不允许插入新数据。
此磁盘类型的用例是在其上创建备份，可以通过 `BACKUP TABLE data TO Disk('plain_disk_name', 'backup_name')` 来实现。之后，您可以执行 `RESTORE TABLE data AS data_restored FROM Disk('plain_disk_name', 'backup_name')` 或使用 `ATTACH TABLE data (...) ENGINE = MergeTree() SETTINGS disk = 'plain_disk_name'`。

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
在 `24.4` 中引入了一种新的磁盘类型 `s3_plain_rewritable`。
与 `s3_plain` 磁盘类型类似，它不需要额外的存储用于元数据文件；相反，元数据存储在 S3 中。
与 `s3_plain` 磁盘类型不同，`s3_plain_rewritable` 允许执行合并并支持 INSERT 操作。
[Mutations](/sql-reference/statements/alter#mutations) 和表的复制不受支持。

此磁盘类型的用例是非复制的 `MergeTree` 表。虽然 `s3` 磁盘类型适合非复制的 MergeTree 表，但如果您不需要表的本地元数据并愿意接受有限的操作集，您可以选择 `s3_plain_rewritable` 磁盘类型。这可能非常有用，例如，对于系统表。

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

从 `24.5` 开始，可以配置任何对象存储磁盘（`s3`、`azure`、`local`）使用 `plain_rewritable` 元数据类型。

### 使用 Azure Blob 存储 {#azure-blob-storage}

`MergeTree` 家族表引擎可以使用类型为 `azure_blob_storage` 的磁盘将数据存储到 [Azure Blob Storage](https://azure.microsoft.com/en-us/services/storage/blobs/) 中。

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
* `storage_account_url` - **必需**，Azure Blob Storage 账户 URL，如 `http://account.blob.core.windows.net` 或 `http://azurite1:10000/devstoreaccount1`。
* `container_name` - 目标容器名称，默认为 `default-container`。
* `container_already_exists` - 如果设置为 `false`，则在存储账户中创建一个新容器 `container_name`；如果设置为 `true`，则磁盘直接连接到容器；如果未设置，则磁盘连接到账户，检查容器 `container_name` 是否存在，如果不存在则创建它。

身份验证参数（磁盘将尝试所有可用方法 **和** 管理身份凭据）：
* `connection_string` - 用于使用连接字符串进行身份验证。
* `account_name` 和 `account_key` - 用于使用共享密钥进行身份验证。

限制参数（主要用于内部使用）：
* `s3_max_single_part_upload_size` - 限制上传到 Blob Storage 的单个块大小。
* `min_bytes_for_seek` - 限制可寻址区域的大小。
* `max_single_read_retries` - 限制从 Blob Storage 读取数据块的尝试次数。
* `max_single_download_retries` - 限制从 Blob Storage 下载可读缓冲区的尝试次数。
* `thread_pool_size` - 限制实例化 `IDiskRemote` 的线程数量。
* `s3_max_inflight_parts_for_one_file` - 限制单个对象可以并发运行的 PUT 请求数。

其他参数：
* `metadata_path` - 在本地文件系统中存储 Blob Storage 的元数据文件的路径。默认值为 `/var/lib/clickhouse/disks/<disk_name>/`。
* `skip_access_check` - 如果为 true，则在磁盘启动时将不执行磁盘访问检查。默认值为 `false`。
* `read_resource` — 要用于 [调度](/operations/workload-scheduling.md) 此磁盘读取请求的资源名称。默认值为空字符串（此磁盘未启用 IO 调度）。
* `write_resource` — 要用于 [调度](/operations/workload-scheduling.md) 此磁盘写请求的资源名称。默认值为空字符串（此磁盘未启用 IO 调度）。
* `metadata_keep_free_space_bytes` - 要保留的空闲元数据磁盘空间的量。

可以在集成测试目录中找到工作配置示例（例如 [test_merge_tree_azure_blob_storage](https://github.com/ClickHouse/ClickHouse/blob/master/tests/integration/test_merge_tree_azure_blob_storage/configs/config.d/storage_conf.xml) 或 [test_azure_blob_storage_zero_copy_replication](https://github.com/ClickHouse/ClickHouse/blob/master/tests/integration/test_azure_blob_storage_zero_copy_replication/configs/config.d/storage_conf.xml)）。

:::note 零拷贝复制尚未准备好用于生产
零拷贝复制在 ClickHouse 版本 22.8 及更高版本中默认禁用。 不建议在生产中使用此功能。
:::

## 使用 HDFS 存储（不支持） {#using-hdfs-storage-unsupported}

在此示例配置中：
- 磁盘为 `hdfs`（不支持）类型
- 数据托管在 `hdfs://hdfs1:9000/clickhouse/`

顺便提一下，HDFS 不被支持，因此在使用时可能会出现问题。如果出现任何问题，请随时提交拉取请求进行修复。

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

请记住，HDFS 在边角情况可能无法正常工作。

### 使用数据加密 {#encrypted-virtual-file-system}

您可以加密存储在 [S3](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3) 或 [HDFS](#using-hdfs-storage-unsupported)（不支持）外部磁盘上的数据，或在本地磁盘上。要启用加密模式，必须在配置文件中定义一个类型为 `encrypted` 的磁盘，并选择一个用于保存数据的磁盘。`encrypted` 磁盘会即时加密所有写入的文件，当您从 `encrypted` 磁盘读取文件时，它会自动解密。因此，您可以像使用普通磁盘一样使用 `encrypted` 磁盘。

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

例如，当 ClickHouse 从某个表写入数据到文件 `store/all_1_1_0/data.bin` 到 `disk1` 时，实际上该文件将在路径 `/path1/store/all_1_1_0/data.bin` 下写入到物理磁盘。

将同一文件写入 `disk2` 时，它将实际上在路径 `/path1/path2/store/all_1_1_0/data.bin` 下以加密模式写入到物理磁盘。

所需参数：

- `type` — `encrypted`。否则不会创建加密磁盘。
- `disk` — 数据存储类型的磁盘。
- `key` — 加密和解密的密钥。类型： [Uint64](/sql-reference/data-types/int-uint.md)。您可以使用 `key_hex` 参数以十六进制形式编码密钥。
    您可以使用 `id` 属性指定多个密钥（如下面的示例所示）。

可选参数：

- `path` — 数据将保存到的磁盘上的位置路径。如果未指定，则数据将保存在根目录中。
- `current_key_id` — 用于加密的密钥。所有指定的密钥都可以用于解密，您可以始终在保持对先前加密数据的访问的同时切换到另一个密钥。
- `algorithm` — [加密算法](/sql-reference/statements/create/table#encryption-codecs)。可能的值： `AES_128_CTR`、`AES_192_CTR` 或 `AES_256_CTR`。默认值： `AES_128_CTR`。密钥长度取决于算法： `AES_128_CTR` — 16 字节， `AES_192_CTR` — 24 字节， `AES_256_CTR` — 32 字节。

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

从 22.3 版本开始，可以在存储配置中配置本地磁盘上的缓存。
对于版本 22.3 - 22.7，缓存仅支持 `s3` 磁盘类型。对于 22.8 及更高版本，缓存支持任何磁盘类型：S3、Azure、本地、加密等。
对于 23.5 及更高版本，缓存仅支持远程磁盘类型：S3、Azure、HDFS（不支持）。
缓存使用 `LRU` 缓存策略。

对于 22.8 及更高版本的配置示例：

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

对于 22.8 之前的版本的配置示例：

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

- `max_size` - 缓存的最大大小（以字节或可读格式表示，例如 `ki, Mi, Gi, 等等`），示例 `10Gi`（此格式自 `22.10` 版本开始有效）。达到限制时，根据缓存逐出策略逐出缓存文件。默认值：无，此设置是强制的。

- `cache_on_write_operations` - 允许启用 `write-through` 缓存（在任何写操作上缓存数据： `INSERT` 查询、后台合并）。默认： `false`。可以通过设置 `enable_filesystem_cache_on_write_operations` 禁用 `write-through` 缓存（数据仅在缓存配置设置和相应查询设置均启用时才缓存）。

- `enable_filesystem_query_cache_limit` - 允许限制在每个查询中下载的缓存大小（取决于用户设置 `max_query_cache_size`）。默认： `false`。

- `enable_cache_hits_threshold` - 定义某些数据在被缓存之前需要读取的次数的数字。默认： `false`。此阈值可以通过 `cache_hits_threshold` 定义。默认： `0`，例如，数据在第一次尝试读取时即被缓存。

- `enable_bypass_cache_with_threshold` - 如果请求的读取范围超过阈值，则允许完全跳过缓存。默认： `false`。此阈值可以通过 `bypass_cache_threashold` 定义。默认： `268435456`（ `256Mi`）。

- `max_file_segment_size` - 单个缓存文件的最大大小（以字节或可读格式表示， `ki, Mi, Gi, 等等`，示例 `10Gi`）。默认： `8388608`（ `8Mi`）。

- `max_elements` - 缓存文件的数量限制。默认： `10000000`。

- `load_metadata_threads` - 启动时用于加载缓存元数据的线程数量。默认： `16`。

文件缓存 **查询/配置文件设置**：

其中一些设置将禁用默认启用的缓存特性，或在磁盘配置设置中启用的特性。例如，您可以在磁盘配置中启用缓存，并通过查询/配置文件设置 `enable_filesystem_cache` 设置为 `false` 禁用它。此外，将 `cache_on_write_operations` 设置为 `true` 的磁盘配置意味着启用了 "写回" 缓存。但是，如果您需要在特定查询中禁用此通用设置，则将 `enable_filesystem_cache_on_write_operations` 设置为 `false` 意味着特定查询/配置文件的写操作缓存将被禁用。

- `enable_filesystem_cache` - 允许在查询中禁用缓存，即使存储策略已配置为 `cache` 磁盘类型。默认： `true`。

- `read_from_filesystem_cache_if_exists_otherwise_bypass_cache` - 仅在缓存已存在时允许在查询中使用缓存，否则查询数据不会写入本地缓存存储。默认： `false`。

- `enable_filesystem_cache_on_write_operations` - 启用 `write-through` 缓存。仅在缓存配置中的 `cache_on_write_operations` 设置开启时有效。默认： `false`。云默认值： `true`。

- `enable_filesystem_cache_log` - 启用到 `system.filesystem_cache_log` 表的日志记录。提供每个查询的缓存使用的详细视图。可以为特定查询启用或在配置文件中启用。默认： `false`。

- `max_query_cache_size` - 限制可写入本地缓存存储的缓存大小。需要在缓存配置中启用 `enable_filesystem_query_cache_limit`。默认： `false`。

- `skip_download_if_exceeds_query_cache` - 允许更改设置 `max_query_cache_size` 的行为。默认： `true`。如果该设置开启，并且查询期间的缓存下载限制已达到，则不会再下载缓存到缓存存储。如果该设置关闭，并且查询期间的缓存下载限制已达到，则缓存仍将写入，代价是逐出以前下载的数据（在当前查询中），例如，第二种行为允许在保持查询缓存限制的同时保持 `最近最少使用` 行为。

**警告**
缓存配置设置和查询设置对应于最新的 ClickHouse 版本，对于早期版本某些内容可能不受支持。

缓存 **系统表**：

- `system.filesystem_cache` - 显示缓存的当前状态的系统表。

- `system.filesystem_cache_log` - 显示每个查询的详细缓存使用情况的系统表。需要设置 `enable_filesystem_cache_log` 为 `true`。

缓存 **命令**：

- `SYSTEM DROP FILESYSTEM CACHE (<cache_name>) (ON CLUSTER)` -- `ON CLUSTER` 仅在未提供 `<cache_name>` 时受支持

- `SHOW FILESYSTEM CACHES` -- 显示在服务器上配置的文件系统缓存列表。 （对于版本 `<= 22.8`，该命令名为 `SHOW CACHES`）

```sql
SHOW FILESYSTEM CACHES
```

结果：

```text
┌─Caches────┐
│ s3_cache  │
└───────────┘
```

- `DESCRIBE FILESYSTEM CACHE '<cache_name>'` - 显示特定缓存的配置和一些一般统计信息。缓存名称可以从 `SHOW FILESYSTEM CACHES` 命令中获取。 （对于版本 `<= 22.8`，该命令名为 `DESCRIBE CACHE`）

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

这是一个只读磁盘。其数据仅被读取而不被修改。通过 `ATTACH TABLE` 查询将新表加载到此磁盘中（见下面的示例）。实际上不使用本地磁盘，每个 `SELECT` 查询将导致 `http` 请求以获取所需数据。所有对表数据的修改将导致异常，即以下类型的查询不被允许：[CREATE TABLE](/sql-reference/statements/create/table.md)、[ALTER TABLE](/sql-reference/statements/alter/index.md)、[RENAME TABLE](/sql-reference/statements/rename#rename-table)、[DETACH TABLE](/sql-reference/statements/detach.md) 和 [TRUNCATE TABLE](/sql-reference/statements/truncate.md)。
Web 存储可用于只读目的。一个示例用法是在网上托管样本数据，或进行数据迁移。
有一个工具 `clickhouse-static-files-uploader`，它为给定表准备数据目录（`SELECT data_paths FROM system.tables WHERE name = 'table_name'`）。对于您所需的每个表，您将获得一个文件目录。这些文件可以上传到例如静态文件的 web 服务器。在进行此准备之后，您可以通过 `DiskWeb` 将此表加载到任何 ClickHouse 服务器中。

在此示例配置中：
- 磁盘类型为 `web`
- 数据托管在 `http://nginx:80/test1/`
- 使用本地存储缓存

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
存储也可以在查询中临时配置，如果不期望例行使用 web 数据集，请参见 [动态配置](#dynamic-configuration) 并跳过编辑配置文件。
:::

:::tip
在 GitHub 上托管有一个 [演示数据集](https://github.com/ClickHouse/web-tables-demo)。 要准备您自己的表以用于 Web 存储，请参见工具 [clickhouse-static-files-uploader](/operations/utilities/static-files-disk-uploader)
:::

在这个 `ATTACH TABLE` 查询中，提供的 `UUID` 与数据目录名称匹配，端点是原始 GitHub 内容的 URL。

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

所需参数：

- `type` — `web`。否则不会创建磁盘。
- `endpoint` — 端点 URL，采用 `path` 格式。端点 URL 必须包含存储数据的根路径，其中已上传数据。

可选参数：

- `min_bytes_for_seek` — 使用 seek 操作而不是顺序读取的最小字节数。默认值： `1` Mb。
- `remote_fs_read_backoff_threashold` — 尝试读取远程磁盘时的最大等待时间。默认值： `10000` 秒。
- `remote_fs_read_backoff_max_tries` — 进行回退读取的最大尝试次数。默认值： `5`。

如果查询因异常而失败 `DB:Exception Unreachable URL`，那么您可以尝试调整设置：[http_connection_timeout](/operations/settings/settings.md/#http_connection_timeout)、[http_receive_timeout](/operations/settings/settings.md/#http_receive_timeout)、[keep_alive_timeout](/operations/server-configuration-parameters/settings#keep_alive_timeout)。

要获取要上传的文件，请运行：
`clickhouse static-files-disk-uploader --metadata-path <path> --output-dir <dir>` （`--metadata-path` 可以在查询 `SELECT data_paths FROM system.tables WHERE name = 'table_name'` 中找到）。

通过 `endpoint` 加载文件时，必须将它们加载到 `<endpoint>/store/` 路径中，但配置中只需包含 `endpoint`。

如果在表启动时加载磁盘时端点无法访问，则会捕获所有错误。如果在这种情况下出现错误，可以通过 `DETACH TABLE table_name` -> `ATTACH TABLE table_name` 重新加载表（变为可见）。如果在服务器启动时成功加载了元数据，则表将立即可用。

使用 [http_max_single_read_retries](/operations/storing-data#web-storage) 设置限制在单个 HTTP 读取过程中最大重试次数。

### 零拷贝复制（尚未做好生产准备） {#zero-copy}

零拷贝复制是可能的，但不推荐，适用于 `S3` 和 `HDFS`（不支持）磁盘。零拷贝复制意味着如果数据存储在多个机器上并且需要同步，则仅复制元数据（数据部分的路径），而不复制数据本身。

:::note 零拷贝复制尚未准备好用于生产
零拷贝复制在 ClickHouse 版本 22.8 及更高版本中默认禁用。  不建议在生产中使用此功能。
:::
