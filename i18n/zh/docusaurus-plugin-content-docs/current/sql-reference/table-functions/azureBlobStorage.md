---
description: '提供类似表的接口，用于在 Azure Blob Storage 中查询/插入文件。类似于 s3 函数。'
keywords: ['azure blob storage']
sidebar_label: 'azureBlobStorage'
sidebar_position: 10
slug: /sql-reference/table-functions/azureBlobStorage
title: 'azureBlobStorage'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# azureBlobStorage 表函数 {#azureblobstorage-table-function}

提供类似表的接口，用于在 [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) 中查询和插入文件。此表函数类似于 [s3 表函数](../../sql-reference/table-functions/s3.md)。



## 语法 {#syntax}

```sql
azureBlobStorage(- connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression, structure, partition_strategy, partition_columns_in_data_file, extra_credentials(client_id=, tenant_id=)])
```


## 参数 {#arguments}

| Argument                                    | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
|---------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `connection_string`\| `storage_account_url` | `connection_string` 包含账户名称和密钥（[创建连接字符串](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string?toc=%2Fazure%2Fstorage%2Fblobs%2Ftoc.json&bc=%2Fazure%2Fstorage%2Fblobs%2Fbreadcrumb%2Ftoc.json#configure-a-connection-string-for-an-azure-storage-account)），或者你也可以在此处提供存储账户的 URL，并将账户名称和账户密钥作为单独的参数提供（参见参数 `account_name` 和 `account_key`）。 |
| `container_name`                            | 容器名称                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `blobpath`                                  | 文件路径。只读模式下支持以下通配符：`*`、`**`、`?`、`{abc,def}` 和 `{N..M}`，其中 `N`、`M` 为数字，`'abc'`、`'def'` 为字符串。                                                                                                                                                                                                                                                                                                                                                            |
| `account_name`                              | 如果使用了 `storage_account_url`，则可以在此处指定账户名称。                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `account_key`                               | 如果使用了 `storage_account_url`，则可以在此处指定账户密钥。                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `format`                                    | 文件的[格式](/sql-reference/formats)。                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `compression`                               | 支持的值：`none`、`gzip/gz`、`brotli/br`、`xz/LZMA`、`zstd/zst`。默认情况下，将通过文件扩展名自动检测压缩格式（等同于将其设置为 `auto`）。                                                                                                                                                                                                                                                                                                                                               | 
| `structure`                                 | 表的结构。格式：`'column1_name column1_type, column2_name column2_type, ...'`。                                                                                                                                                                                                                                                                                                                                                                                                           |
| `partition_strategy`                        | 可选参数。支持的值：`WILDCARD` 或 `HIVE`。`WILDCARD` 要求路径中包含 `{_partition_id}`，该占位符会被分区键替换。`HIVE` 不允许使用通配符，假定路径为表的根路径，并生成 Hive 风格的分区目录，使用 Snowflake ID 作为文件名、文件格式作为扩展名。默认值为 `WILDCARD`。                                                                                                                                                                                                 |
| `partition_columns_in_data_file`            | 可选参数。仅在使用 `HIVE` 分区策略时生效。用于指示 ClickHouse 是否应当在数据文件中写入分区列。默认值为 `false`。                                                                                                                                                                                                                                                                                                                                                                         |
| `extra_credentials`                         | 使用 `client_id` 和 `tenant_id` 进行身份验证。如果提供了 `extra_credentials`，则其优先级高于 `account_name` 和 `account_key`。                                                                                                                                                                                                                                                                                                                                 |



## 返回值 {#returned_value}

具有指定结构的表，用于在指定文件中读写数据。



## 示例 {#examples}

与 [AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage) 表引擎类似，用户可以使用 Azurite 模拟器在本地进行 Azure Storage 开发。更多细节见[此处](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage)。下面我们假设 Azurite 可通过主机名 `azurite1` 访问。

使用以下方式将数据写入 Azure Blob 存储：

```sql
INSERT INTO TABLE FUNCTION azureBlobStorage('http://azurite1:10000/devstoreaccount1',
    'testcontainer', 'test_{_partition_id}.csv', 'devstoreaccount1', 'Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==',
    'CSV', 'auto', 'column1 UInt32, column2 UInt32, column3 UInt32') PARTITION BY column3 VALUES (1, 2, 3), (3, 2, 1), (78, 43, 3);
```

然后可以通过以下方式读取：

```sql
SELECT * FROM azureBlobStorage('http://azurite1:10000/devstoreaccount1',
    'testcontainer', 'test_1.csv', 'devstoreaccount1', 'Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==',
    'CSV', 'auto', 'column1 UInt32, column2 UInt32, column3 UInt32');
```

```response
┌───column1─┬────column2─┬───column3─┐
│     3     │       2    │      1    │
└───────────┴────────────┴───────────┘
```

或者使用连接字符串

```sql
SELECT count(*) FROM azureBlobStorage('DefaultEndpointsProtocol=https;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;EndPointSuffix=core.windows.net',
    'testcontainer', 'test_3.csv', 'CSV', 'auto' , 'column1 UInt32, column2 UInt32, column3 UInt32');
```

```text
┌─count()─┐
│      2  │
└─────────┘
```


## 虚拟列 {#virtual-columns}

- `_path` — 文件路径。类型：`LowCardinality(String)`。
- `_file` — 文件名。类型：`LowCardinality(String)`。
- `_size` — 文件大小（以字节为单位）。类型：`Nullable(UInt64)`。如果文件大小未知，则值为 `NULL`。
- `_time` — 文件的最后一次修改时间。类型：`Nullable(DateTime)`。如果该时间未知，则值为 `NULL`。



## 分区写入 {#partitioned-write}

### 分区策略 {#partition-strategy}

仅适用于 INSERT 查询。

`WILDCARD`（默认）：将文件路径中的 `{_partition_id}` 通配符替换为实际的分区键。

`HIVE` 实现用于读写的 Hive 风格分区。它使用以下格式生成文件：`<prefix>/<key1=val1/key2=val2...>/<snowflakeid>.<toLower(file_format)>`。

**`HIVE` 分区策略示例**

```sql
INSERT INTO TABLE FUNCTION azureBlobStorage(azure_conf2, storage_account_url = 'http://localhost:30000/devstoreaccount1', container='cont', blob_path='azure_table_root', format='CSVWithNames', compression='auto', structure='year UInt16, country String, id Int32', partition_strategy='hive') PARTITION BY (year, country) VALUES (2020, 'Russia', 1), (2021, 'Brazil', 2);
```

```result
select _path, * from azureBlobStorage(azure_conf2, storage_account_url = 'http://localhost:30000/devstoreaccount1', container='cont', blob_path='azure_table_root/**.csvwithnames')

   ┌─_path───────────────────────────────────────────────────────────────────────────┬─id─┬─year─┬─country─┐
1. │ cont/azure_table_root/year=2021/country=Brazil/7351307847391293440.csvwithnames │  2 │ 2021 │ Brazil  │
2. │ cont/azure_table_root/year=2020/country=Russia/7351307847378710528.csvwithnames │  1 │ 2020 │ Russia  │
   └─────────────────────────────────────────────────────────────────────────────────┴────┴──────┴─────────┘
```


## use&#95;hive&#95;partitioning 设置 {#hive-style-partitioning}

这是一个提示配置，用于让 ClickHouse 在读取时解析 Hive 风格的分区文件。它对写入没有影响。若要实现读写对称，请使用 `partition_strategy` 参数。

当将 SETTING `use_hive_partitioning` 设为 1 时，ClickHouse 会在路径中检测 Hive 风格的分区（`/name=value/`），并允许在查询中将分区列作为虚拟列使用。这些虚拟列的名称与分区路径中的名称相同，但会以 `_` 开头。

**示例**

使用 Hive 风格分区创建的虚拟列

```sql
SELECT * FROM azureBlobStorage(config, storage_account_url='...', container='...', blob_path='http://data/path/date=*/country=*/code=*/*.parquet') WHERE _date > '2020-01-01' AND _country = 'Netherlands' AND _code = 42;
```


## 使用共享访问签名 (SAS) {#using-shared-access-signatures-sas-sas-tokens}

共享访问签名 (SAS) 是一个 URI，用于授予对 Azure Storage 容器或文件的受限访问权限。使用它可以在不共享存储账户密钥的情况下，为存储账户资源提供限时访问。更多详情见[此处](https://learn.microsoft.com/en-us/rest/api/storageservices/delegate-access-with-shared-access-signature)。

`azureBlobStorage` 函数支持共享访问签名 (SAS)。

[Blob SAS token](https://learn.microsoft.com/en-us/azure/ai-services/translator/document-translation/how-to-guides/create-sas-tokens?tabs=Containers) 包含对请求进行身份验证所需的全部信息，包括目标 blob、权限以及有效期。要构造 blob URL，将 SAS token 追加到 blob 服务端点后。例如，如果端点是 `https://clickhousedocstest.blob.core.windows.net/`，则请求变为：

```sql
SELECT count()
FROM azureBlobStorage('BlobEndpoint=https://clickhousedocstest.blob.core.windows.net/;SharedAccessSignature=sp=r&st=2025-01-29T14:58:11Z&se=2025-01-29T22:58:11Z&spr=https&sv=2022-11-02&sr=c&sig=Ac2U0xl4tm%2Fp7m55IilWl1yHwk%2FJG0Uk6rMVuOiD0eE%3D', 'exampledatasets', 'example.csv')

┌─count()─┐
│      10 │
└─────────┘

1 row in set. Elapsed: 0.425 sec.
```

或者，用户还可以使用生成的 [Blob SAS URL](https://learn.microsoft.com/en-us/azure/ai-services/translator/document-translation/how-to-guides/create-sas-tokens?tabs=Containers)：

```sql
SELECT count()
FROM azureBlobStorage('https://clickhousedocstest.blob.core.windows.net/?sp=r&st=2025-01-29T14:58:11Z&se=2025-01-29T22:58:11Z&spr=https&sv=2022-11-02&sr=c&sig=Ac2U0xl4tm%2Fp7m55IilWl1yHwk%2FJG0Uk6rMVuOiD0eE%3D', 'exampledatasets', 'example.csv')

┌─count()─┐
│      10 │
└─────────┘

1 row in set. Elapsed: 0.153 sec.
```


## 相关 {#related}
- [AzureBlobStorage 表引擎](engines/table-engines/integrations/azureBlobStorage.md)
