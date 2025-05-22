
# AzureBlobStorage 表引擎

该引擎提供了与 [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) 生态系统的集成。

## 创建表 {#create-table}

```sql
CREATE TABLE azure_blob_storage_table (name String, value UInt32)
    ENGINE = AzureBlobStorage(connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression])
    [PARTITION BY expr]
    [SETTINGS ...]
```

### 引擎参数 {#engine-parameters}

- `endpoint` — AzureBlobStorage 端点 URL，包括容器和前缀。如使用的认证方法需要，可以选择性地包含 account_name。(`http://azurite1:{port}/[account_name]{container_name}/{data_prefix}`) 或者这些参数可以通过 storage_account_url, account_name 和 container 分别提供。用于指定前缀，应使用 endpoint。
- `endpoint_contains_account_name` - 此标志用于指定 endpoint 是否包含 account_name，因为仅在某些认证方法下需要。 (默认值 : true)
- `connection_string|storage_account_url` — connection_string 包含账户名称及密钥 ([创建连接字符串](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string?toc=%2Fazure%2Fstorage%2Fblobs%2Ftoc.json&bc=%2Fazure%2Fstorage%2Fblobs%2Fbreadcrumb%2Ftoc.json#configure-a-connection-string-for-an-azure-storage-account))，或者您也可以在此处提供存储账户 URL，并将账户名称和账户密钥作为单独参数提供（参见参数 account_name 和 account_key）
- `container_name` - 容器名称
- `blobpath` - 文件路径。在只读模式下支持以下通配符：`*`, `**`, `?`, `{abc,def}` 和 `{N..M}`，其中 `N`, `M` 为数字，`'abc'`, `'def'` 为字符串。
- `account_name` - 如果使用 storage_account_url，则可以在此处指定账户名称
- `account_key` - 如果使用 storage_account_url，则可以在此处指定账户密钥
- `format` — 文件的 [格式](/interfaces/formats.md)。
- `compression` — 支持的值：`none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`。默认情况下，将根据文件扩展名自动检测压缩格式。（与设置为 `auto` 相同）。

**示例**

用户可以使用 Azurite 模拟器进行本地 Azure 存储开发。更多详细信息请参见 [此处](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage)。如果使用本地实例 Azurite，用户可能需要在以下命令中将 `http://localhost:10000` 替换为 `http://azurite1:10000`，我们假设 Azurite 在主机 `azurite1` 上可用。

```sql
CREATE TABLE test_table (key UInt64, data String)
    ENGINE = AzureBlobStorage('DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://azurite1:10000/devstoreaccount1/;', 'testcontainer', 'test_table', 'CSV');

INSERT INTO test_table VALUES (1, 'a'), (2, 'b'), (3, 'c');

SELECT * FROM test_table;
```

```text
┌─key──┬─data──┐
│  1   │   a   │
│  2   │   b   │
│  3   │   c   │
└──────┴───────┘
```

## 虚拟列 {#virtual-columns}

- `_path` — 文件路径。类型：`LowCardinality(String)`。
- `_file` — 文件名。类型：`LowCardinality(String)`。
- `_size` — 文件大小（以字节为单位）。类型：`Nullable(UInt64)`。如果大小未知，则值为 `NULL`。
- `_time` — 文件的最后修改时间。类型：`Nullable(DateTime)`。如果时间未知，则值为 `NULL`。

## 认证 {#authentication}

当前有 3 种方式进行认证：
- `Managed Identity` - 可以通过提供 `endpoint`，`connection_string` 或 `storage_account_url` 来使用。
- `SAS Token` - 可以通过提供 `endpoint`，`connection_string` 或 `storage_account_url` 来使用。通过 URL 中是否存在 '?' 来识别。请参见 [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage#using-shared-access-signatures-sas-sas-tokens) 以获取示例。
- `Workload Identity` - 可以通过提供 `endpoint` 或 `storage_account_url` 来使用。如果在配置中设置了 `use_workload_identity` 参数，（[workload identity](https://github.com/Azure/azure-sdk-for-cpp/tree/main/sdk/identity/azure-identity#authenticate-azure-hosted-applications)）将用于认证。

### 数据缓存 {#data-cache}

`Azure` 表引擎支持在本地磁盘上进行数据缓存。
请参见此 [部分](/operations/storing-data.md/#using-local-cache) 中的文件系统缓存配置选项和用法。
缓存根据存储对象的路径和 ETag 进行，因此 ClickHouse 将不会读取过期的缓存版本。

要启用缓存，请使用设置 `filesystem_cache_name = '<name>'` 和 `enable_filesystem_cache = 1`。

```sql
SELECT *
FROM azureBlobStorage('DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://azurite1:10000/devstoreaccount1/;', 'testcontainer', 'test_table', 'CSV')
SETTINGS filesystem_cache_name = 'cache_for_azure', enable_filesystem_cache = 1;
```

1. 将以下部分添加到 ClickHouse 配置文件中：

```xml
<clickhouse>
    <filesystem_caches>
        <cache_for_azure>
            <path>path to cache directory</path>
            <max_size>10Gi</max_size>
        </cache_for_azure>
    </filesystem_caches>
</clickhouse>
```

2. 从 ClickHouse 的 `storage_configuration` 部分重用缓存配置（因此也重用缓存存储），[详细描述见这里](/operations/storing-data.md/#using-local-cache)

## 另请参见 {#see-also}

[Azure Blob Storage 表函数](/sql-reference/table-functions/azureBlobStorage)
