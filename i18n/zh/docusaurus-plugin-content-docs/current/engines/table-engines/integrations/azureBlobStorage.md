---
description: '此引擎提供与 Azure Blob Storage 生态系统的集成。'
sidebar_label: 'Azure Blob Storage'
sidebar_position: 10
slug: /engines/table-engines/integrations/azureBlobStorage
title: 'AzureBlobStorage 表引擎'
doc_type: 'reference'
---

# AzureBlobStorage 表引擎 \{#azureblobstorage-table-engine\}

该引擎用于与 [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) 生态系统集成。

## 创建表 \{#create-table\}

```sql
CREATE TABLE azure_blob_storage_table (name String, value UInt32)
    ENGINE = AzureBlobStorage(connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression, partition_strategy, partition_columns_in_data_file, extra_credentials(client_id=, tenant_id=)])
    [PARTITION BY expr]
    [SETTINGS ...]
```

### 引擎参数 \{#engine-parameters\}

* `endpoint` — 带有容器和前缀的 Azure Blob Storage 端点 URL。如所用的认证方式需要，还可以选择在其中包含 account&#95;name。（`http://azurite1:{port}/[account_name]{container_name}/{data_prefix}`）或者也可以通过 `storage_account_url`、`account_name` 和 `container` 单独提供这些参数。要指定前缀时，应使用 `endpoint`。
* `endpoint_contains_account_name` - 此标志用于指定 `endpoint` 是否包含 `account_name`，因为只有某些认证方式才需要它。（默认值：true）
* `connection_string|storage_account_url` — `connection_string` 包含账户名和密钥（[创建 connection string](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string?toc=%2Fazure%2Fstorage%2Fblobs%2Ftoc.json\&bc=%2Fazure%2Fstorage%2Fblobs%2Fbreadcrumb%2Ftoc.json#configure-a-connection-string-for-an-azure-storage-account)），或者你也可以在此处提供 storage account URL，并通过单独的参数提供账户名和账户密钥（参见参数 `account_name` 和 `account_key`）。
* `container_name` - 容器名称。
* `blobpath` - 文件路径。在只读模式下支持以下通配符：`*`、`**`、`?`、`{abc,def}` 和 `{N..M}`，其中 `N`、`M` 为数字，`'abc'`、`'def'` 为字符串。
* `account_name` - 如果使用 `storage_account_url`，则可在此处指定账户名。
* `account_key` - 如果使用 `storage_account_url`，则可在此处指定账户密钥。
* `format` — 文件的[格式](/interfaces/formats.md)。
* `compression` — 支持的值：`none`、`gzip/gz`、`brotli/br`、`xz/LZMA`、`zstd/zst`。默认会通过文件扩展名自动检测压缩类型（等同于设置为 `auto`）。
* `partition_strategy` – 选项：`WILDCARD` 或 `HIVE`。`WILDCARD` 要求在路径中包含 `{_partition_id}`，该占位符会被分区键替换。`HIVE` 不允许使用通配符，假定路径为表的根路径，并生成 Hive 风格的分区目录，文件名为 Snowflake ID，扩展名为文件格式。默认值为 `WILDCARD`。
* `partition_columns_in_data_file` - 仅在使用 `HIVE` 分区策略时有效。告知 ClickHouse 是否应在数据文件中写入分区列。默认值为 `false`。
* `extra_credentials` - 使用 `client_id` 和 `tenant_id` 进行认证。如果提供了 `extra_credentials`，则其优先级高于 `account_name` 和 `account_key`。

**示例**

用户可以使用 Azurite 仿真器进行本地 Azure Storage 开发。详情见[此处](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage)。如果使用本地的 Azurite 实例，用户可能需要在下面的命令中将 `http://azurite1:10000` 替换为 `http://localhost:10000`，其中我们假设 Azurite 可通过主机 `azurite1` 访问。

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

## 虚拟列 \{#virtual-columns\}

- `_path` — 文件路径。类型：`LowCardinality(String)`。
- `_file` — 文件名。类型：`LowCardinality(String)`。
- `_size` — 文件大小（字节数）。类型：`Nullable(UInt64)`。如果大小未知，则值为 `NULL`。
- `_time` — 文件的最后修改时间。类型：`Nullable(DateTime)`。如果时间未知，则值为 `NULL`。

## 身份验证 \{#authentication\}

当前有 3 种身份验证方式：

* `Managed Identity` - 可以通过提供 `endpoint`、`connection_string` 或 `storage_account_url` 进行身份验证。
* `SAS Token` - 可以通过提供 `endpoint`、`connection_string` 或 `storage_account_url` 进行身份验证。通过 URL 中是否包含 `?` 来识别。示例参见 [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage#using-shared-access-signatures-sas-sas-tokens)。
* `Workload Identity` - 可以通过提供 `endpoint` 或 `storage_account_url` 进行身份验证。如果在配置中设置了 `use_workload_identity` 参数，则会使用 [workload identity](https://github.com/Azure/azure-sdk-for-cpp/tree/main/sdk/identity/azure-identity#authenticate-azure-hosted-applications) 进行身份验证。

### 数据缓存 \{#data-cache\}

`Azure` 表引擎支持在本地磁盘上进行数据缓存。
有关文件系统缓存配置选项及用法，请参见本[节](/operations/storing-data.md/#using-local-cache)。
缓存是基于存储对象的路径和 ETag 进行的，因此 ClickHouse 不会读取陈旧的缓存数据。

要启用缓存，请设置 `filesystem_cache_name = '<name>'` 和 `enable_filesystem_cache = 1`。

```sql
SELECT *
FROM azureBlobStorage('DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://azurite1:10000/devstoreaccount1/;', 'testcontainer', 'test_table', 'CSV')
SETTINGS filesystem_cache_name = 'cache_for_azure', enable_filesystem_cache = 1;
```

1. 在 ClickHouse 配置文件中添加以下节：

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

### PARTITION BY \{#partition-by\}

`PARTITION BY` —— 可选。在大多数情况下不需要分区键；即便需要，一般也不需要比按月更细的分区键。分区不会加速查询（与 ORDER BY 表达式相反）。切勿使用粒度过细的分区。不要按客户端标识符或名称对数据进行分区（相反，应将客户端标识符或名称作为 ORDER BY 表达式中的第一列）。

对于按月分区，使用 `toYYYYMM(date_column)` 表达式，其中 `date_column` 是类型为 [Date](/sql-reference/data-types/date.md) 的日期列。这里的分区名称采用 `"YYYYMM"` 格式。

#### 分区策略 \{#partition-strategy\}

`WILDCARD`（默认）：将文件路径中的 `{_partition_id}` 通配符替换为实际的分区键。不支持读取。

`HIVE` 为读写实现 Hive 风格的分区。读取通过递归 glob 模式完成。写入生成的文件采用以下格式：`<prefix>/<key1=val1/key2=val2...>/<snowflakeid>.<toLower(file_format)>`。

注意：使用 `HIVE` 分区策略时，`use_hive_partitioning` 设置不起任何作用。

`HIVE` 分区策略示例：

```sql
arthur :) create table azure_table (year UInt16, country String, counter UInt8) ENGINE=AzureBlobStorage(account_name='devstoreaccount1', account_key='Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==', storage_account_url = 'http://localhost:30000/devstoreaccount1', container='cont', blob_path='hive_partitioned', format='Parquet', compression='auto', partition_strategy='hive') PARTITION BY (year, country);

arthur :) insert into azure_table values (2020, 'Russia', 1), (2021, 'Brazil', 2);

arthur :) select _path, * from azure_table;

   ┌─_path──────────────────────────────────────────────────────────────────────┬─year─┬─country─┬─counter─┐
1. │ cont/hive_partitioned/year=2020/country=Russia/7351305360873664512.parquet │ 2020 │ Russia  │       1 │
2. │ cont/hive_partitioned/year=2021/country=Brazil/7351305360894636032.parquet │ 2021 │ Brazil  │       2 │
   └────────────────────────────────────────────────────────────────────────────┴──────┴─────────┴─────────┘
```

┌─&#95;path──────────────────────────────────────────────────────────────────────┬─year─┬─country─┬─counter─┐

1. │ cont/hive&#95;partitioned/year=2020/country=Russia/7351305360873664512.parquet │ 2020 │ Russia  │       1 │
2. │ cont/hive&#95;partitioned/year=2021/country=Brazil/7351305360894636032.parquet │ 2021 │ Brazil  │       2 │
   └────────────────────────────────────────────────────────────────────────────┴──────┴─────────┴─────────┘

```
```

## 另请参阅 \{#see-also\}

[Azure Blob 存储表函数](/sql-reference/table-functions/azureBlobStorage)
