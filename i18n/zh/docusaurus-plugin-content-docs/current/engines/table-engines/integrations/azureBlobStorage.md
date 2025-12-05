---
description: '该引擎提供与 Azure Blob Storage 生态系统的集成。'
sidebar_label: 'Azure Blob Storage'
sidebar_position: 10
slug: /engines/table-engines/integrations/azureBlobStorage
title: 'AzureBlobStorage 表引擎'
doc_type: 'reference'
---



# AzureBlobStorage 表引擎 {#azureblobstorage-table-engine}

该引擎用于与 [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) 生态系统进行集成。



## 创建表 {#create-table}

```sql
CREATE TABLE azure_blob_storage_table (name String, value UInt32)
    ENGINE = AzureBlobStorage(connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression, partition_strategy, partition_columns_in_data_file, extra_credentials(client_id=, tenant_id=)])
    [PARTITION BY expr]
    [SETTINGS ...]
```

### 引擎参数 {#engine-parameters}

* `endpoint` — 包含容器和前缀的 Azure Blob Storage endpoint URL。如果所用的身份验证方法需要，也可以在其中包含 account&#95;name（`http://azurite1:{port}/[account_name]{container_name}/{data_prefix}`）。或者也可以通过 storage&#95;account&#95;url、account&#95;name 和 container 分别提供这些参数。要指定前缀时，应使用 endpoint。
* `endpoint_contains_account_name` - 此标志用于指定 endpoint 中是否包含 account&#95;name，因为只有某些身份验证方法才需要。（默认值：true）
* `connection_string|storage_account_url` — connection&#95;string 包含 account name 和 key（[创建连接字符串](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string?toc=%2Fazure%2Fstorage%2Fblobs%2Ftoc.json\&bc=%2Fazure%2Fstorage%2Fblobs%2Fbreadcrumb%2Ftoc.json#configure-a-connection-string-for-an-azure-storage-account)），或者可以在此处提供 storage account url，并将 account name 和 account key 作为单独参数提供（参见参数 account&#95;name 和 account&#95;key）。
* `container_name` - 容器名称
* `blobpath` - 文件路径。在只读模式下支持以下通配符：`*`、`**`、`?`、`{abc,def}` 和 `{N..M}`，其中 `N`、`M` 为数字，`'abc'`、`'def'` 为字符串。
* `account_name` - 如果使用 storage&#95;account&#95;url，则可以在此处指定 account name
* `account_key` - 如果使用 storage&#95;account&#95;url，则可以在此处指定 account key
* `format` — 文件的[格式](/interfaces/formats.md)。
* `compression` — 支持的值：`none`、`gzip/gz`、`brotli/br`、`xz/LZMA`、`zstd/zst`。默认情况下，将通过文件扩展名自动检测压缩格式（等同于将其设置为 `auto`）。
* `partition_strategy` – 可选值：`WILDCARD` 或 `HIVE`。`WILDCARD` 要求路径中包含 `{_partition_id}`，该占位符会被分区键替换。`HIVE` 不允许使用通配符，假定该路径是表的根路径，并生成 Hive 风格的分区目录，使用 Snowflake ID 作为文件名，文件格式作为扩展名。默认为 `WILDCARD`。
* `partition_columns_in_data_file` - 仅在使用 `HIVE` 分区策略时生效。用于告知 ClickHouse 是否应在数据文件中写入分区列。默认为 `false`。
* `extra_credentials` - 使用 `client_id` 和 `tenant_id` 进行身份验证。如果提供了 extra&#95;credentials，将优先于 `account_name` 和 `account_key`。

**示例**

用户可以使用 Azurite 模拟器进行本地 Azure Storage 开发。详细信息参见[此处](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage)。如果使用本地 Azurite 实例，用户可能需要在下面的命令中将 `http://azurite1:10000` 替换为 `http://localhost:10000`，其中假设 Azurite 可通过主机 `azurite1` 访问。

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
- `_size` — 以字节为单位的文件大小。类型：`Nullable(UInt64)`。如果大小未知，则值为 `NULL`。
- `_time` — 文件的最后修改时间。类型：`Nullable(DateTime)`。如果时间未知，则值为 `NULL`。



## 身份验证 {#authentication}

当前支持 3 种身份验证方式：

* `Managed Identity` —— 通过提供 `endpoint`、`connection_string` 或 `storage_account_url` 使用。
* `SAS Token` —— 通过提供 `endpoint`、`connection_string` 或 `storage_account_url` 使用。它通过 URL 中是否存在 `?` 来识别。示例参见 [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage#using-shared-access-signatures-sas-sas-tokens)。
* `Workload Identity` —— 通过提供 `endpoint` 或 `storage_account_url` 使用。如果在配置中设置了 `use_workload_identity` 参数，则会使用 [workload identity](https://github.com/Azure/azure-sdk-for-cpp/tree/main/sdk/identity/azure-identity#authenticate-azure-hosted-applications) 进行身份验证。

### 数据缓存 {#data-cache}

`Azure` 表引擎支持在本地磁盘上进行数据缓存。
有关文件系统缓存配置选项和用法，请参阅本[章节](/operations/storing-data.md/#using-local-cache)。
缓存会根据存储对象的路径和 ETag 进行，因此 ClickHouse 不会读取陈旧的缓存版本。

要启用缓存，请设置 `filesystem_cache_name = '<name>'` 和 `enable_filesystem_cache = 1`。

```sql
SELECT *
FROM azureBlobStorage('DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://azurite1:10000/devstoreaccount1/;', 'testcontainer', 'test_table', 'CSV')
SETTINGS filesystem_cache_name = 'cache_for_azure', enable_filesystem_cache = 1;
```

1. 在 ClickHouse 配置文件中添加以下配置段：

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

2. 复用 ClickHouse `storage_configuration` 部分中的缓存配置（以及相应的缓存存储），[见此处](/operations/storing-data.md/#using-local-cache)

### PARTITION BY {#partition-by}

`PARTITION BY` — 可选。在大多数情况下通常不需要分区键；如果确实需要，一般也不必使用比“按月”更细粒度的分区键。分区不会加速查询（与 ORDER BY 表达式相反）。应避免使用过于细粒度的分区。不要按客户端标识或名称对数据进行分区（相反，应将客户端标识或名称作为 ORDER BY 表达式中的第一列）。

要按月分区，使用 `toYYYYMM(date_column)` 表达式，其中 `date_column` 是一个类型为 [Date](/sql-reference/data-types/date.md) 的日期列。此时的分区名称采用 `"YYYYMM"` 格式。

#### 分区策略 {#partition-strategy}

`WILDCARD`（默认）：将文件路径中的 `{_partition_id}` 通配符替换为实际分区键。不支持读取。

`HIVE` 实现了用于读写的 Hive 风格分区。读取使用递归 glob 模式实现。写入时按以下格式生成文件：`<prefix>/<key1=val1/key2=val2...>/<snowflakeid>.<toLower(file_format)>`。

注意：使用 `HIVE` 分区策略时，`use_hive_partitioning` 设置不起作用。

`HIVE` 分区策略示例：

```sql
arthur :) create table azure_table (year UInt16, country String, counter UInt8) ENGINE=AzureBlobStorage(account_name='devstoreaccount1', account_key='Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==', storage_account_url = 'http://localhost:30000/devstoreaccount1', container='cont', blob_path='hive_partitioned', format='Parquet', compression='auto', partition_strategy='hive') PARTITION BY (year, country);

arthur :) insert into azure_table values (2020, 'Russia', 1), (2021, 'Brazil', 2);

arthur :) select _path, * from azure_table;
```


┌─&#95;path──────────────────────────────────────────────────────────────────────┬─年份─┬─国家───┬─计数───┐

1. │ cont/hive&#95;partitioned/year=2020/country=Russia/7351305360873664512.parquet │ 2020 │ Russia  │       1 │
2. │ cont/hive&#95;partitioned/year=2021/country=Brazil/7351305360894636032.parquet │ 2021 │ Brazil  │       2 │
   └────────────────────────────────────────────────────────────────────────────┴──────┴─────────┴─────────┘

```
```


## 另请参阅 {#see-also}

[Azure Blob Storage 表函数](/sql-reference/table-functions/azureBlobStorage)
