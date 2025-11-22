---
description: '此引擎实现了与 Azure Blob Storage 生态系统的集成。'
sidebar_label: 'Azure Blob Storage'
sidebar_position: 10
slug: /engines/table-engines/integrations/azureBlobStorage
title: 'AzureBlobStorage 表引擎'
doc_type: 'reference'
---



# AzureBlobStorage 表引擎

该引擎实现了与 [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) 生态系统的集成。



## 创建表 {#create-table}

```sql
CREATE TABLE azure_blob_storage_table (name String, value UInt32)
    ENGINE = AzureBlobStorage(connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression, partition_strategy, partition_columns_in_data_file, extra_credentials(client_id=, tenant_id=)])
    [PARTITION BY expr]
    [SETTINGS ...]
```

### 引擎参数 {#engine-parameters}

- `endpoint` — AzureBlobStorage 端点 URL,包含容器和前缀。如果使用的身份验证方法需要,可选择性地包含 account_name。(`http://azurite1:{port}/[account_name]{container_name}/{data_prefix}`) 或者可以使用 storage_account_url、account_name 和 container 分别提供这些参数。若要指定前缀,应使用 endpoint。
- `endpoint_contains_account_name` - 此标志用于指定 endpoint 是否包含 account_name,因为仅在某些身份验证方法中需要。(默认值:true)
- `connection_string|storage_account_url` — connection_string 包含账户名称和密钥([创建连接字符串](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string?toc=%2Fazure%2Fstorage%2Fblobs%2Ftoc.json&bc=%2Fazure%2Fstorage%2Fblobs%2Fbreadcrumb%2Ftoc.json#configure-a-connection-string-for-an-azure-storage-account)),或者也可以在此处提供存储账户 URL,并将账户名称和账户密钥作为单独的参数提供(参见参数 account_name 和 account_key)
- `container_name` - 容器名称
- `blobpath` - 文件路径。在只读模式下支持以下通配符:`*`、`**`、`?`、`{abc,def}` 和 `{N..M}`,其中 `N`、`M` 为数字,`'abc'`、`'def'` 为字符串。
- `account_name` - 如果使用 storage_account_url,则可在此处指定账户名称
- `account_key` - 如果使用 storage_account_url,则可在此处指定账户密钥
- `format` — 文件的[格式](/interfaces/formats.md)。
- `compression` — 支持的值:`none`、`gzip/gz`、`brotli/br`、`xz/LZMA`、`zstd/zst`。默认情况下,将根据文件扩展名自动检测压缩方式(与设置为 `auto` 相同)。
- `partition_strategy` – 选项:`WILDCARD` 或 `HIVE`。`WILDCARD` 要求路径中包含 `{_partition_id}`,它将被分区键替换。`HIVE` 不允许使用通配符,假定路径为表根目录,并生成 Hive 风格的分区目录,使用 Snowflake ID 作为文件名,文件格式作为扩展名。默认值为 `WILDCARD`
- `partition_columns_in_data_file` - 仅与 `HIVE` 分区策略一起使用。告知 ClickHouse 是否期望分区列写入数据文件中。默认值为 `false`。
- `extra_credentials` - 使用 `client_id` 和 `tenant_id` 进行身份验证。如果提供了 extra_credentials,它们将优先于 `account_name` 和 `account_key`。

**示例**

用户可以使用 Azurite 模拟器进行本地 Azure Storage 开发。更多详细信息请参见[此处](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage)。如果使用本地 Azurite 实例,用户可能需要在下面的命令中将 `http://azurite1:10000` 替换为 `http://localhost:10000`,我们假设 Azurite 在主机 `azurite1` 上可用。

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
- `_file` — 文件名称。类型：`LowCardinality(String)`。
- `_size` — 文件大小(以字节为单位)。类型：`Nullable(UInt64)`。如果大小未知,则值为 `NULL`。
- `_time` — 文件最后修改时间。类型：`Nullable(DateTime)`。如果时间未知,则值为 `NULL`。


## 身份验证 {#authentication}

目前有 3 种身份验证方式:

- `Managed Identity` - 可通过提供 `endpoint`、`connection_string` 或 `storage_account_url` 来使用。
- `SAS Token` - 可通过提供 `endpoint`、`connection_string` 或 `storage_account_url` 来使用。通过 URL 中是否存在 '?' 来识别。示例请参见 [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage#using-shared-access-signatures-sas-sas-tokens)。
- `Workload Identity` - 可通过提供 `endpoint` 或 `storage_account_url` 来使用。如果在配置中设置了 `use_workload_identity` 参数,则使用 ([workload identity](https://github.com/Azure/azure-sdk-for-cpp/tree/main/sdk/identity/azure-identity#authenticate-azure-hosted-applications)) 进行身份验证。

### 数据缓存 {#data-cache}

`Azure` 表引擎支持在本地磁盘上缓存数据。
文件系统缓存配置选项和使用方法请参见此[章节](/operations/storing-data.md/#using-local-cache)。
缓存基于存储对象的路径和 ETag 进行,因此 ClickHouse 不会读取过期的缓存版本。

要启用缓存,请使用设置 `filesystem_cache_name = '<name>'` 和 `enable_filesystem_cache = 1`。

```sql
SELECT *
FROM azureBlobStorage('DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://azurite1:10000/devstoreaccount1/;', 'testcontainer', 'test_table', 'CSV')
SETTINGS filesystem_cache_name = 'cache_for_azure', enable_filesystem_cache = 1;
```

1. 在 ClickHouse 配置文件中添加以下部分:

```xml
<clickhouse>
    <filesystem_caches>
        <cache_for_azure>
            <path>缓存目录路径</path>
            <max_size>10Gi</max_size>
        </cache_for_azure>
    </filesystem_caches>
</clickhouse>
```

2. 从 ClickHouse 的 `storage_configuration` 部分重用缓存配置(以及缓存存储),[此处有详细说明](/operations/storing-data.md/#using-local-cache)

### PARTITION BY {#partition-by}

`PARTITION BY` — 可选。在大多数情况下,您不需要分区键,即使需要,通常也不需要比按月更细粒度的分区键。分区不会加速查询(与 ORDER BY 表达式相反)。您不应使用过于细粒度的分区。不要按客户端标识符或名称对数据进行分区(而应将客户端标识符或名称作为 ORDER BY 表达式中的第一列)。

对于按月分区,使用 `toYYYYMM(date_column)` 表达式,其中 `date_column` 是类型为 [Date](/sql-reference/data-types/date.md) 的日期列。此处的分区名称采用 `"YYYYMM"` 格式。

#### 分区策略 {#partition-strategy}

`WILDCARD`(默认):将文件路径中的 `{_partition_id}` 通配符替换为实际的分区键。不支持读取。

`HIVE` 为读取和写入实现 Hive 风格的分区。读取使用递归 glob 模式实现。写入使用以下格式生成文件:`<prefix>/<key1=val1/key2=val2...>/<snowflakeid>.<toLower(file_format)>`。

注意:使用 `HIVE` 分区策略时,`use_hive_partitioning` 设置不起作用。

`HIVE` 分区策略示例:

```sql
arthur :) create table azure_table (year UInt16, country String, counter UInt8) ENGINE=AzureBlobStorage(account_name='devstoreaccount1', account_key='Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==', storage_account_url = 'http://localhost:30000/devstoreaccount1', container='cont', blob_path='hive_partitioned', format='Parquet', compression='auto', partition_strategy='hive') PARTITION BY (year, country);

arthur :) insert into azure_table values (2020, 'Russia', 1), (2021, 'Brazil', 2);

arthur :) select _path, * from azure_table;

```


┌─&#95;path──────────────────────────────────────────────────────────────────────┬─year─┬─country─┬─counter─┐

1. │ cont/hive&#95;partitioned/year=2020/country=Russia/7351305360873664512.parquet │ 2020 │ Russia  │       1 │
2. │ cont/hive&#95;partitioned/year=2021/country=Brazil/7351305360894636032.parquet │ 2021 │ Brazil  │       2 │
   └────────────────────────────────────────────────────────────────────────────┴──────┴─────────┴─────────┘

```
```


## 另请参阅 {#see-also}

[Azure Blob Storage 表函数](/sql-reference/table-functions/azureBlobStorage)
