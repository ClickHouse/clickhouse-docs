---
'description': 'highlight-next-line的文档'
'sidebar_label': '外部磁盘用于存储数据'
'sidebar_position': 68
'slug': '/operations/storing-data'
'title': 'External Disks for Storing Data'
---



处理 ClickHouse 中的数据通常存储在本地文件系统中——即与 ClickHouse 服务器位于同一台机器上。这就需要大容量的磁盘，而这往往比较昂贵。为了避免这个问题，您可以将数据存储在远程。支持各种存储：
1. [Amazon S3](https://aws.amazon.com/s3/) 对象存储。
2. [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs)。
3. 不支持：Hadoop 分布式文件系统 ([HDFS](https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html))

:::note ClickHouse 还支持外部表引擎，这些引擎与此页面上描述的外部存储选项不同，因为它们允许读取一些通用文件格式（如 Parquet）中存储的数据，而在此页面上我们描述的是 ClickHouse `MergeTree` 系列或 `Log` 系列表的存储配置。
1. 要处理存储在 `Amazon S3` 磁盘上的数据，请使用 [S3](/engines/table-engines/integrations/s3.md) 表引擎。
2. 要处理存储在 Azure Blob Storage 中的数据，请使用 [AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage.md) 表引擎。
3. 不支持：要处理存储在 Hadoop 分布式文件系统中的数据——[HDFS](/engines/table-engines/integrations/hdfs.md) 表引擎。
:::

## 配置外部存储 {#configuring-external-storage}

[MergeTree](/engines/table-engines/mergetree-family/mergetree.md) 和 [Log](/engines/table-engines/log-family/log.md) 系列表引擎可以使用 `s3`、`azure_blob_storage`、`hdfs`（不支持）类型的磁盘将数据存储到 `S3`、`AzureBlobStorage` 和 `HDFS`（不支持）。

磁盘配置要求：
1. `type` 部分，应等于 `s3`、`azure_blob_storage`、`hdfs`（不支持）、`local_blob_storage`、`web` 之一。
2. 特定外部存储类型的配置。

从 24.1 版本的 ClickHouse 开始，可以使用新的配置选项。需要指定：
1. `type` 等于 `object_storage`
2. `object_storage_type`，等于 `s3`、`azure_blob_storage`（或从 `24.3` 开始直接为 `azure`）、`hdfs`（不支持）、`local_blob_storage`（或从 `24.3` 开始直接为 `local`）、`web` 之一。
可选地，可以指定 `metadata_type`（默认值为 `local`），它也可以设置为 `plain`、`web`，并且从 `24.4` 开始也可设置为 `plain_rewritable`。
使用 `plain` 元数据类型的详细信息请参阅 [plain storage section](/operations/storing-data#plain-storage)，`web` 元数据类型仅适用于 `web` 对象存储类型，`local` 元数据类型在本地存储元数据文件（每个元数据文件包含对对象存储中文件的映射以及一些额外的元信息）。

例如，配置选项
```xml
<s3>
    <type>s3</type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3>
```

等同于配置（自 `24.1` 开始）：
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

完整存储配置的示例：
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

从 24.1 版本的 ClickHouse 开始，它也可以看作：
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

为了使特定类型的存储成为所有 `MergeTree` 表的默认选项，请在配置文件中添加以下部分：
```xml
<clickhouse>
    <merge_tree>
        <storage_policy>s3</storage_policy>
    </merge_tree>
</clickhouse>
```

如果您只想为特定表配置特定的存储策略，则可以在创建表时在设置中定义它：

```sql
CREATE TABLE test (a Int32, b String)
ENGINE = MergeTree() ORDER BY a
SETTINGS storage_policy = 's3';
```

您也可以使用 `disk` 代替 `storage_policy`。在这种情况下，不需要在配置文件中添加 `storage_policy` 部分，仅 `disk` 部分就足够了。

```sql
CREATE TABLE test (a Int32, b String)
ENGINE = MergeTree() ORDER BY a
SETTINGS disk = 's3';
```

## 动态配置 {#dynamic-configuration}

还可以在配置文件中指定没有预定义磁盘的存储配置，但可以在 `CREATE`/`ATTACH` 查询设置中进行配置。

以下示例查询基于上述动态磁盘配置，并演示如何使用本地磁盘缓存来自 URL 的表中的数据。

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

下面的示例为外部存储添加缓存。

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

在以下突出显示的设置中，请注意 `type=web` 的磁盘嵌套在 `type=cache` 的磁盘内。

:::note
示例使用 `type=web`，但任何磁盘类型都可以配置为动态，即使是本地磁盘。本地磁盘需要路径参数以位于服务器配置参数 `custom_local_disks_base_directory` 内，该参数没有默认值，因此在使用本地磁盘时也要设置该参数。
:::

基于配置的配置和 SQL 定义的配置也是可能的：

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

所需参数：

- `endpoint` — S3 端点 URL，采用 `path` 或 `virtual hosted` [样式](https://docs.aws.amazon.com/AmazonS3/latest/dev/VirtualHosting.html)。端点 URL 应包含一个桶和存储数据的根路径。
- `access_key_id` — S3 访问密钥 ID。
- `secret_access_key` — S3 秘密访问密钥。

可选参数：

- `region` — S3 区域名称。
- `support_batch_delete` — 控制是否支持批量删除。当使用 Google Cloud Storage (GCS) 时，请将此设置为 `false`，因为 GCS 不支持批量删除，从而防止检查引发的日志错误消息。
- `use_environment_credentials` — 从环境变量 AWS_ACCESS_KEY_ID 和 AWS_SECRET_ACCESS_KEY 读取 AWS 凭证（如果存在）。默认值为 `false`。
- `use_insecure_imds_request` — 如果设置为 `true`，S3 客户端将在从 Amazon EC2 元数据中获取凭证时使用不安全的 IMDS 请求。默认值为 `false`。
- `expiration_window_seconds` — 检查基于过期的凭证是否已过期的宽限期。可选，默认值为 `120`。
- `proxy` — S3 端点的代理配置。每个 `uri` 元素应包含一个代理 URL。
- `connect_timeout_ms` — 以毫秒为单位的 socket 连接超时。默认值为 `10 秒`。
- `request_timeout_ms` — 以毫秒为单位的请求超时。默认值为 `5 秒`。
- `retry_attempts` — 请求失败时的重试次数。默认值为 `10`。
- `single_read_retries` — 在读取期间连接中断时的重试次数。默认值为 `4`。
- `min_bytes_for_seek` — 使用查找操作而不是顺序读取的最小字节数。默认值为 `1 Mb`。
- `metadata_path` — 存储 S3 元数据文件的本地文件系统路径。默认值为 `/var/lib/clickhouse/disks/<disk_name>/`。
- `skip_access_check` — 如果为 true，启动磁盘时不会执行磁盘访问检查。默认值为 `false`。
- `header` — 向给定端点的请求添加指定 HTTP 头。可选，可以多次指定。
- `server_side_encryption_customer_key_base64` — 如果指定，则将设置访问 S3 对象所需的用于 SSE-C 加密的头。
- `server_side_encryption_kms_key_id` — 如果指定，则将设置访问 S3 对象所需的 [SSE-KMS 加密](https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingKMSEncryption.html) 的头。如果指定为空字符串，则将使用 AWS 管理的 S3 密钥。可选。
- `server_side_encryption_kms_encryption_context` — 如果与 `server_side_encryption_kms_key_id` 一起指定，将设置此给定的加密上下文头。可选。
- `server_side_encryption_kms_bucket_key_enabled` — 如果与 `server_side_encryption_kms_key_id` 一起指定，将设置启用 SSE-KMS 的 S3 存储桶密钥的头。可选，可以为 `true` 或 `false`，默认为空（与存储桶级别设置匹配）。
- `s3_max_put_rps` — 在节流之前的每秒最大 PUT 请求速率。默认值为 `0`（无限制）。
- `s3_max_put_burst` — 在达到每秒请求限制之前，可以同时发出的请求的最大数量。默认值（`0` 值）等于 `s3_max_put_rps`。
- `s3_max_get_rps` — 在节流之前的每秒最大 GET 请求速率。默认值为 `0`（无限制）。
- `s3_max_get_burst` — 在达到每秒请求限制之前，可以同时发出的请求的最大数量。默认值（`0` 值）等于 `s3_max_get_rps`。
- `read_resource` — 用于调度此磁盘的读取请求的资源名称。[调度]( /operations/workload-scheduling.md)的默认值为空字符串（未为此磁盘启用 IO 调度）。
- `write_resource` — 用于调度此磁盘的写入请求的资源名称。[调度]( /operations/workload-scheduling.md)的默认值为空字符串（未为此磁盘启用 IO 调度）。
- `key_template` — 定义生成对象密钥的格式。默认情况下，Clickhouse 从 `endpoint` 选项中获取 `root path` 并添加随机生成的后缀。该后缀是带有 3 个随机符号的目录和带有 29 个随机符号的文件名。使用此选项，您可以完全控制对象密钥的生成方式。一些使用场景需要在前缀或对象密钥中间有随机符号。例如：`[a-z]{3}-prefix-random/constant-part/random-middle-[a-z]{3}/random-suffix-[a-z]{29}`。该值与 [`re2`](https://github.com/google/re2/wiki/Syntax) 一起解析。仅支持语法的一部分。在使用该选项之前，请检查您首选的格式是否受支持。如果 Clickhouse 无法通过 `key_template` 的值生成密钥，则磁盘将未初始化。它要求启用功能标志 [storage_metadata_write_full_object_key](/operations/storing-data#s3-storage)。它禁止在 `endpoint` 选项中声明 `root path`。要求定义选项 `key_compatibility_prefix`。
- `key_compatibility_prefix` — 当使用 `key_template` 选项时，此选项是必需的。为了能够读取在元数据文件中存储的密钥，其元数据版本低于 `VERSION_FULL_OBJECT_KEY`，应在此处设置 `endpoint` 选项中的先前 `root path`。

:::note
Google Cloud Storage (GCS) 也通过 `s3` 类型得到支持。见 [GCS backed MergeTree](/integrations/gcs)。
:::

### 使用普通存储 {#plain-storage}

在 `22.10` 中，引入了一种新的磁盘类型 `s3_plain`，提供一次写入存储。配置参数与 `s3` 磁盘类型相同。
与 `s3` 磁盘类型不同，它以原样存储数据，例如，它使用正常的文件名（与 ClickHouse 在本地磁盘上存储文件的方式相同），并且不在本地存储任何元数据，例如，它是从 `s3` 上的数据推导的。

此磁盘类型允许保留表的静态版本，因为它不允许对现有数据执行合并，也不允许插入新数据。
该磁盘类型的用例是创建备份，这可以通过 `BACKUP TABLE data TO Disk('plain_disk_name', 'backup_name')` 完成。之后，您可以执行 `RESTORE TABLE data AS data_restored FROM Disk('plain_disk_name', 'backup_name')` 或使用 `ATTACH TABLE data (...) ENGINE = MergeTree() SETTINGS disk = 'plain_disk_name'`。

配置：
```xml
<s3_plain>
    <type>s3_plain</type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain>
```

从 `24.1` 开始，可以使用 `plain` 元数据类型配置任何对象存储磁盘（`s3`、`azure`、`hdfs`（不支持）、`local`）。

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

### 使用 S3 普通可重写存储 {#s3-plain-rewritable-storage}
在 `24.4` 中引入了一种新的磁盘类型 `s3_plain_rewritable`。
与 `s3_plain` 磁盘类型类似，它不需要额外的存储用于元数据文件；相反，元数据存储在 S3 中。
与 `s3_plain` 磁盘类型不同，`s3_plain_rewritable` 允许执行合并并支持 INSERT 操作。
不支持 [Mutations](/sql-reference/statements/alter#mutations) 和表的复制。

该磁盘类型的用例是非复制的 `MergeTree` 表。虽然 `s3` 磁盘类型适合非复制的 MergeTree 表，但如果您不需要表的本地元数据并且愿意接受有限的操作集，则可以选择 `s3_plain_rewritable` 磁盘类型。这对于系统表可能很有用。

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

从 `24.5` 开始，可以使用 `plain_rewritable` 元数据类型配置任何对象存储磁盘（`s3`、`azure`、`local`）。

### 使用 Azure Blob Storage {#azure-blob-storage}

`MergeTree` 系列表引擎可以使用 `azure_blob_storage` 类型的磁盘将数据存储到 [Azure Blob Storage](https://azure.microsoft.com/en-us/services/storage/blobs/)。

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
* `storage_account_url` - **必需**，Azure Blob 存储帐户 URL，如 `http://account.blob.core.windows.net` 或 `http://azurite1:10000/devstoreaccount1`。
* `container_name` - 目标容器名称，默认为 `default-container`。
* `container_already_exists` - 如果设置为 `false`，则在存储帐户中创建一个新容器 `container_name`，如果设置为 `true`，则磁盘直接连接到容器，如果未设置，则磁盘连接到帐户，检查容器 `container_name` 是否存在，如果不存在，则创建它。

身份验证参数（磁盘将尝试所有可用方法 **和** 托管身份凭证）：
* `connection_string` - 用于使用连接字符串进行身份验证。
* `account_name` 和 `account_key` - 用于使用共享密钥进行身份验证。

限制参数（主要用于内部使用）：
* `s3_max_single_part_upload_size` - 限制 Blob 存储上单个块上传的大小。
* `min_bytes_for_seek` - 限制可查找区域的大小。
* `max_single_read_retries` - 限制从 Blob 存储中读取数据块的尝试次数。
* `max_single_download_retries` - 限制从 Blob 存储中下载可读缓冲区的尝试次数。
* `thread_pool_size` - 限制 `IDiskRemote` 实例化的线程数量。
* `s3_max_inflight_parts_for_one_file` - 限制对一个对象可以并行运行的 PUT 请求数量。

其他参数：
* `metadata_path` - 存储 Blob 存储元数据文件的本地文件系统路径。默认值为 `/var/lib/clickhouse/disks/<disk_name>/`。
* `skip_access_check` - 如果为 true，启动磁盘时不会执行磁盘访问检查。默认值为 `false`。
* `read_resource` — 用于调度此磁盘的读取请求的资源名称。[调度](/operations/workload-scheduling.md)的默认值为空字符串（未为此磁盘启用 IO 调度）。
* `write_resource` — 用于调度此磁盘的写入请求的资源名称。[调度](/operations/workload-scheduling.md)的默认值为空字符串（未为此磁盘启用 IO 调度）。
* `metadata_keep_free_space_bytes` - 预留的元数据磁盘空间量。

工作配置的示例可以在集成测试目录中找到（见例如 [test_merge_tree_azure_blob_storage](https://github.com/ClickHouse/ClickHouse/blob/master/tests/integration/test_merge_tree_azure_blob_storage/configs/config.d/storage_conf.xml) 或 [test_azure_blob_storage_zero_copy_replication](https://github.com/ClickHouse/ClickHouse/blob/master/tests/integration/test_azure_blob_storage_zero_copy_replication/configs/config.d/storage_conf.xml)）。

:::note 零拷贝复制尚未准备好用于生产
在 ClickHouse 版本 22.8 及更高版本中，零拷贝复制默认是禁用的。此功能不建议用于生产使用。
:::

## 使用 HDFS 存储（不支持） {#using-hdfs-storage-unsupported}

在此示例配置中：
- 磁盘类型为 `hdfs`（不支持）
- 数据托管在 `hdfs://hdfs1:9000/clickhouse/`

话说回来，HDFS 不受支持，因此在使用时可能会出现问题。如果出现任何问题，请随时提交修复的拉取请求。

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

请记住，HDFS 在特定情况下可能无法正常工作。

### 使用数据加密 {#encrypted-virtual-file-system}

您可以对存储在 [S3](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3) 或 [HDFS](#using-hdfs-storage-unsupported)（不支持）的外部磁盘或在本地磁盘上存储的数据进行加密。要开启加密模式，在配置文件中，您必须定义一个类型为 `encrypted` 的磁盘，并选择一个磁盘来保存数据。`encrypted` 磁盘实时加密所有写入的文件，而当您从 `encrypted` 磁盘读取文件时，它会自动解密。因此，您可以像使用普通磁盘一样使用 `encrypted` 磁盘。

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

例如，当 ClickHouse 将来自某个表的数据写入文件 `store/all_1_1_0/data.bin` 到 `disk1` 时，实际上该文件将沿路径 `/path1/store/all_1_1_0/data.bin` 写入物理磁盘。

将相同文件写入 `disk2` 时，它实际上将以加密模式写入物理磁盘，路径为 `/path1/path2/store/all_1_1_0/data.bin`。

所需参数：

- `type` — `encrypted`。否则不会创建加密磁盘。
- `disk` — 数据存储的磁盘类型。
- `key` — 用于加密和解密的密钥。类型：[Uint64](/sql-reference/data-types/int-uint.md)。您可以使用 `key_hex` 参数以十六进制形式编码密钥。
    您可以使用 `id` 属性指定多个密钥（见下面示例）。

可选参数：

- `path` — 数据将保存到磁盘的位置的路径。如果未指定，则数据将保存在根目录中。
- `current_key_id` — 用于加密的密钥。所有指定的密钥都可以用于解密，并且您始终可以在维护对先前加密数据访问的同时切换到其他密钥。
- `algorithm` — [加密算法](/sql-reference/statements/create/table#encryption-codecs)。可能的值：`AES_128_CTR`、`AES_192_CTR` 或 `AES_256_CTR`。默认值：`AES_128_CTR`。密钥长度取决于算法：`AES_128_CTR` — 16 字节，`AES_192_CTR` — 24 字节，`AES_256_CTR` — 32 字节。

磁盘配置的示例：

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

从版本 22.3 开始，可以在存储配置中配置本地缓存。
对于版本 22.3 - 22.7，仅支持 `s3` 磁盘类型的缓存。对于版本 >= 22.8，支持任何磁盘类型：S3、Azure、本地、加密等。
对于版本 >= 23.5，仅支持远程磁盘类型的缓存：S3、Azure、HDFS（不支持）。
缓存使用 `LRU` 缓存策略。

适用于版本 22.8 及更高版本的配置示例：

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

适用于版本 22.8 之前的配置示例：

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

- `max_size` - 缓存的最大大小，以字节或可读格式表示，例如 `ki, Mi, Gi, 等`，示例 `10Gi`（此格式适用于从 `22.10` 版本开始）。达到限制时，缓存文件根据缓存驱逐策略被驱逐。默认值：无，此设置是强制的。

- `cache_on_write_operations` - 允许打开 `write-through` 缓存（在任何写操作中缓存数据：`INSERT` 查询、后台合并）。默认值：`false`。在查询中使用设置 `enable_filesystem_cache_on_write_operations` 可以禁用 `write-through` 缓存（仅在同时启用缓存配置设置和相应查询设置时，数据才会被缓存）。

- `enable_filesystem_query_cache_limit` - 允许限制在每个查询中下载的缓存大小（取决于用户设置 `max_query_cache_size`）。默认值：`false`。

- `enable_cache_hits_threshold` - 定义在缓存数据之前需要读取多少次数据的数字。默认值：`false`。该阈值可以通过 `cache_hits_threshold` 定义。默认值：`0`，例如，在第一次尝试读取数据时就缓存。

- `enable_bypass_cache_with_threshold` - 在请求的读取范围超过阈值时允许完全跳过缓存。默认值：`false`。该阈值可以通过 `bypass_cache_threashold` 定义。默认值：`268435456`（`256Mi`）。

- `max_file_segment_size` - 单个缓存文件的最大大小，以字节或可读格式（`ki, Mi, Gi, 等`，示例 `10Gi`）。默认值：`8388608`（`8Mi`）。

- `max_elements` - 缓存文件数量的限制。默认值：`10000000`。

- `load_metadata_threads` - 启动时用于加载缓存元数据的线程数量。默认值：`16`。

文件缓存 **查询/配置文件设置**：

其中一些设置将在查询/配置文件中禁用默认或磁盘配置设置中启用的缓存功能。例如，您可以在磁盘配置中启用缓存，并通过查询/配置文件设置 `enable_filesystem_cache` 设置为 `false` 禁用它。此外，在磁盘配置中将 `cache_on_write_operations` 设置为 `true` 意味着启用了 “write-though” 缓存。但是，如果您需要在特定查询中禁用此一般设置，则将设置 `enable_filesystem_cache_on_write_operations` 设置为 `false` 表示该特定查询/配置文件将禁用写操作缓存。

- `enable_filesystem_cache` - 允许在查询中禁用缓存，即使存储策略已配置为 `cache` 磁盘类型。默认值：`true`。

- `read_from_filesystem_cache_if_exists_otherwise_bypass_cache` - 仅在缓存已存在的情况下使用查询中的缓存， 否则查询数据将不会写入本地缓存存储。默认值：`false`。

- `enable_filesystem_cache_on_write_operations` - 开启 `write-through` 缓存。仅在缓存配置中设置的 `cache_on_write_operations` 开启时有效。默认值：`false`。云默认值：`true`。

- `enable_filesystem_cache_log` - 开启对 `system.filesystem_cache_log` 表的日志记录。提供每个查询的缓存使用的详细视图。可以为特定查询开启，或在配置文件中启用。默认值：`false`。

- `max_query_cache_size` - 限制可以写入本地缓存存储的缓存大小。需要在缓存配置中启用 `enable_filesystem_query_cache_limit`。默认值：`false`。

- `skip_download_if_exceeds_query_cache` - 允许更改设置 `max_query_cache_size` 的行为。默认值：`true`。如果启用此设置，当查询期间达到缓存下载限制时，将不再下载任何其他缓存到缓存存储。如果禁用该设置，当查询期间达到缓存下载限制时，缓存仍会以驱逐先前下载的（在当前查询）数据为代价进行写入，例如，第二种行为允许在保持查询缓存限制的同时保留 `last recently used` 行为。

**警告**
缓存配置设置和缓存查询设置与最新的 ClickHouse 版本相对应，对于早期版本，某些功能可能不受支持。

缓存 **系统表**：

- `system.filesystem_cache` - 显示当前缓存状态的系统表。

- `system.filesystem_cache_log` - 显示每个查询的详细缓存使用情况的系统表。需要将 `enable_filesystem_cache_log` 设置为 `true`。

缓存 **命令**：

- `SYSTEM DROP FILESYSTEM CACHE (<cache_name>) (ON CLUSTER)` -- `ON CLUSTER` 仅在未提供 `<cache_name>` 时受支持

- `SHOW FILESYSTEM CACHES` -- 显示在服务器上配置的文件系统缓存列表。（对于版本 &lt;= `22.8`，命令名为 `SHOW CACHES`）

```sql
SHOW FILESYSTEM CACHES
```

结果：

```text
┌─Caches────┐
│ s3_cache  │
└───────────┘
```

- `DESCRIBE FILESYSTEM CACHE '<cache_name>'` - 显示特定缓存的缓存配置和一些一般统计信息。缓存名称可以从 `SHOW FILESYSTEM CACHES` 命令获取。（对于版本 &lt;= `22.8`，命令名为 `DESCRIBE CACHE`）

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

这是一个只读磁盘。它的数据仅被读取，而不被修改。通过 `ATTACH TABLE` 查询将新表加载到此磁盘中（见下面的示例）。实际上不使用本地磁盘，每个 `SELECT` 查询都将导致一次 `http` 请求以获取所需数据。所有对表数据的修改都会导致异常，即以下类型的查询是不允许的：[CREATE TABLE](/sql-reference/statements/create/table.md)、[ALTER TABLE](/sql-reference/statements/alter/index.md)、[RENAME TABLE](/sql-reference/statements/rename#rename-table)、[DETACH TABLE](/sql-reference/statements/detach.md) 和 [TRUNCATE TABLE](/sql-reference/statements/truncate.md)。
Web 存储可供只读使用。一个示例用例是用于托管示例数据或迁移数据。
有一个工具 `clickhouse-static-files-uploader`，可以为给定表准备数据目录（`SELECT data_paths FROM system.tables WHERE name = 'table_name'`）。对于每个您需要的表，您会得到一个文件目录。这些文件可以上传到，例如，静态文件的 Web 服务器。完成此准备后，您可以通过 `DiskWeb` 将该表加载到任何 ClickHouse 服务器中。

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
如果不期望经常使用 Web 数据集，可以在查询中临时配置存储，请参阅 [dynamic configuration](#dynamic-configuration)，并跳过编辑配置文件。
:::

:::tip
在 GitHub 上托管了一个 [演示数据集](https://github.com/ClickHouse/web-tables-demo)。要准备您自己的表以供 Web 存储，请参见工具 [clickhouse-static-files-uploader](/operations/utilities/static-files-disk-uploader)
:::

在此 `ATTACH TABLE` 查询中，提供的 `UUID` 匹配数据的目录名称，端点是原始 GitHub 内容的 URL。

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

准备好的测试用例。您需要将此配置添加到配置中：

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
- `endpoint` — 端点 URL，采用 `path` 格式。端点 URL 必须包含存储数据的根路径，即它们被上传的路径。

可选参数：

- `min_bytes_for_seek` — 使用查找操作而不是顺序读取的最小字节数。默认值：`1` Mb。
- `remote_fs_read_backoff_threashold` — 尝试从远程磁盘读取数据时的最大等待时间。默认值：`10000` 秒。
- `remote_fs_read_backoff_max_tries` — 尝试读取时的最大重试次数。默认值：`5`。

如果查询失败，且出现异常 `DB:Exception Unreachable URL`，则可以尝试调整设置：[http_connection_timeout](/operations/settings/settings.md/#http_connection_timeout)、[http_receive_timeout](/operations/settings/settings.md/#http_receive_timeout)、[keep_alive_timeout](/operations/server-configuration-parameters/settings#keep_alive_timeout)。

要获取可以上传的文件，请运行：
`clickhouse static-files-disk-uploader --metadata-path <path> --output-dir <dir>`（`--metadata-path` 可以在查询 `SELECT data_paths FROM system.tables WHERE name = 'table_name'` 中找到）。

在通过 `endpoint` 加载文件时，它们必须加载到 `<endpoint>/store/` 路径，但配置中只能包含 `endpoint`。

如果在启动服务器时加载表时，磁盘加载 URL 不可达，则所有错误都会被捕获。如果在这种情况下出现错误，则可以通过 `DETACH TABLE table_name` -> `ATTACH TABLE table_name` 重新加载表（变得可见）。如果在服务器启动时成功加载了元数据，则表将立即可用。

使用 [http_max_single_read_retries](/operations/storing-data#web-storage) 设置限制单次 HTTP 读取期间的最大重试次数。

### 零拷贝复制（尚未准备好用于生产） {#zero-copy}

零拷贝复制是可能的，但不推荐，与 `S3` 和 `HDFS`（不支持）磁盘。如果数据存储在多台机器上的远程位置并且需要同步，那么仅复制元数据（数据部分的路径），而不复制数据本身。

:::note 零拷贝复制尚未准备好用于生产
在 ClickHouse 版本 22.8 及更高版本中，零拷贝复制默认是禁用的。此功能不建议用于生产使用。
:::
