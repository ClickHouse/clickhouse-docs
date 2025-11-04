---
'description': '该引擎提供与 Azure Blob Storage 生态系统的集成。'
'sidebar_label': 'Azure Blob Storage'
'sidebar_position': 10
'slug': '/engines/table-engines/integrations/azureBlobStorage'
'title': 'AzureBlobStorage 表引擎'
'doc_type': 'reference'
---


# AzureBlobStorage 表引擎

该引擎提供与 [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) 生态系统的集成。

## 创建表 {#create-table}

```sql
CREATE TABLE azure_blob_storage_table (name String, value UInt32)
    ENGINE = AzureBlobStorage(connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression, partition_strategy, partition_columns_in_data_file, extra_credentials(client_id=, tenant_id=)])
    [PARTITION BY expr]
    [SETTINGS ...]
```

### 引擎参数 {#engine-parameters}

- `endpoint` — AzureBlobStorage 端点 URL，包含容器和前缀。可选地可以包含 account_name，如果所使用的身份验证方法需要它。(`http://azurite1:{port}/[account_name]{container_name}/{data_prefix}`)，或者这些参数可以单独提供，使用 storage_account_url、account_name 和 container。用于指定前缀时，应使用 endpoint。
- `endpoint_contains_account_name` - 此标志用于指定端点是否包含 account_name，因为它仅在某些身份验证方法中需要。（默认值：true）
- `connection_string|storage_account_url` — connection_string 包含帐户名称和密钥（[创建连接字符串](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string?toc=%2Fazure%2Fstorage%2Fblobs%2Ftoc.json&bc=%2Fazure%2Fstorage%2Fblobs%2Fbreadcrumb%2Ftoc.json#configure-a-connection-string-for-an-azure-storage-account)），或者您也可以在这里提供存储帐户 URL，并将帐户名称和帐户密钥作为单独的参数提供（请参见参数 account_name 和 account_key）。
- `container_name` - 容器名称
- `blobpath` - 文件路径。在只读模式下支持以下通配符：`*`、`**`、`?`、`{abc,def}` 和 `{N..M}`，其中 `N`、`M` — 数字，`'abc'`、`'def'` — 字符串。
- `account_name` - 如果使用 storage_account_url，则可以在此指定帐户名称。
- `account_key` - 如果使用 storage_account_url，则可以在此指定帐户密钥。
- `format` — 文件的 [格式](/interfaces/formats.md)。
- `compression` — 支持的值：`none`、`gzip/gz`、`brotli/br`、`xz/LZMA`、`zstd/zst`。默认情况下，它将通过文件扩展名自动检测压缩。（与设置为 `auto` 的效果相同）。
- `partition_strategy` – 选项：`WILDCARD` 或 `HIVE`。`WILDCARD` 需要在路径中包含 `{_partition_id}`，该值将替换为分区键。`HIVE` 不允许通配符，假设路径是表根，并生成 Hive 风格的分区目录，使用 Snowflake ID 作为文件名，并将文件格式作为扩展名。默认值为 `WILDCARD`。
- `partition_columns_in_data_file` - 仅与 `HIVE` 分区策略一起使用。告诉 ClickHouse 是否期望在数据文件中写入分区列。默认值为 `false`。
- `extra_credentials` - 使用 `client_id` 和 `tenant_id` 进行身份验证。如果提供了 extra_credentials，则优先于 `account_name` 和 `account_key`。

**示例**

用户可以使用 Azurite 模拟器进行本地 Azure 存储开发。更多详细信息请 [点击这里](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage)。如果使用本地 Azurite 实例，用户可能需要将以下命令中的 `http://azurite1:10000` 替换为 `http://localhost:10000`，假设 Azurite 在主机 `azurite1` 上可用。

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

- `_path` — 文件的路径。类型：`LowCardinality(String)`。
- `_file` — 文件名。类型：`LowCardinality(String)`。
- `_size` — 文件大小（以字节为单位）。类型：`Nullable(UInt64)`。如果大小未知，则值为 `NULL`。
- `_time` — 文件的最后修改时间。类型：`Nullable(DateTime)`。如果时间未知，则值为 `NULL`。

## 身份验证 {#authentication}

目前有 3 种身份验证方式：
- `Managed Identity` - 通过提供 `endpoint`、`connection_string` 或 `storage_account_url` 来使用。
- `SAS Token` - 通过提供 `endpoint`、`connection_string` 或 `storage_account_url` 来使用。通过 URL 中的 '?' 来识别。请参见 [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage#using-shared-access-signatures-sas-sas-tokens) 以获取示例。
- `Workload Identity` - 通过提供 `endpoint` 或 `storage_account_url` 来使用。如果配置中设置了 `use_workload_identity` 参数，([workload identity](https://github.com/Azure/azure-sdk-for-cpp/tree/main/sdk/identity/azure-identity#authenticate-azure-hosted-applications)) 则用于身份验证。

### 数据缓存 {#data-cache}

`Azure` 表引擎支持在本地磁盘上进行数据缓存。
有关文件系统缓存配置选项和使用方式，请参见 [此部分](/operations/storing-data.md/#using-local-cache)。
缓存取决于存储对象的路径和 ETag，因此 ClickHouse 不会读取过时的缓存版本。

要启用缓存，请使用设置 `filesystem_cache_name = '<name>'` 和 `enable_filesystem_cache = 1`。

```sql
SELECT *
FROM azureBlobStorage('DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://azurite1:10000/devstoreaccount1/;', 'testcontainer', 'test_table', 'CSV')
SETTINGS filesystem_cache_name = 'cache_for_azure', enable_filesystem_cache = 1;
```

1. 向 ClickHouse 配置文件添加以下部分：

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

2. 从 ClickHouse 的 `storage_configuration` 部分重用缓存配置（因此缓存存储），[在此处描述](/operations/storing-data.md/#using-local-cache)。

### 按分区 {#partition-by}

`PARTITION BY` — 可选。在大多数情况下，您不需要分区键，如果需要，通常不需要比按月更细粒度的分区。分区不会加速查询（与 ORDER BY 表达式相反）。您不应使用过于细粒度的分区。不要按客户端标识符或名称对数据进行分区（相反，确保客户端标识符或名称是 ORDER BY 表达式中的第一列）。

按月分区时，使用 `toYYYYMM(date_column)` 表达式，其中 `date_column` 是类型为 [Date](/sql-reference/data-types/date.md) 的日期列。这里的分区名称采用 `"YYYYMM"` 格式。

#### 分区策略 {#partition-strategy}

`WILDCARD`（默认）：将文件路径中的 `{_partition_id}` 通配符替换为实际的分区键。不支持读取。

`HIVE` 实现 Hive 风格的分区以进行读取和写入。读取使用递归的 glob 模式进行实现。写入生成的文件格式为：`<prefix>/<key1=val1/key2=val2...>/<snowflakeid>.<toLower(file_format)>`。

注意：使用 `HIVE` 分区策略时，`use_hive_partitioning` 设置没有效果。

`HIVE` 分区策略的示例：

```sql
arthur :) create table azure_table (year UInt16, country String, counter UInt8) ENGINE=AzureBlobStorage(account_name='devstoreaccount1', account_key='Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==', storage_account_url = 'http://localhost:30000/devstoreaccount1', container='cont', blob_path='hive_partitioned', format='Parquet', compression='auto', partition_strategy='hive') PARTITION BY (year, country);

arthur :) insert into azure_table values (2020, 'Russia', 1), (2021, 'Brazil', 2);

arthur :) select _path, * from azure_table;

   ┌─_path──────────────────────────────────────────────────────────────────────┬─year─┬─country─┬─counter─┐
1. │ cont/hive_partitioned/year=2020/country=Russia/7351305360873664512.parquet │ 2020 │ Russia  │       1 │
2. │ cont/hive_partitioned/year=2021/country=Brazil/7351305360894636032.parquet │ 2021 │ Brazil  │       2 │
   └────────────────────────────────────────────────────────────────────────────┴──────┴─────────┴─────────┘
```

## 另请参见 {#see-also}

[Azure Blob Storage 表函数](/sql-reference/table-functions/azureBlobStorage)
