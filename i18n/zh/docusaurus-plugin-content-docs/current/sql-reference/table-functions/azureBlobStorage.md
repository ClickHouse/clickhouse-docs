---
slug: /sql-reference/table-functions/azureBlobStorage
sidebar_position: 10
sidebar_label: azureBlobStorage
title: "azureBlobStorage"
description: "提供类似表的接口以在 Azure Blob Storage 中选择/插入文件。类似于 s3 函数。"
keywords: [azure blob storage]
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# azureBlobStorage 表函数

提供类似表的接口以在 [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) 中选择/插入文件。该表函数类似于 [s3 函数](../../sql-reference/table-functions/s3.md)。

**语法**

``` sql
azureBlobStorage(- connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression, structure])
```

**参数**

- `connection_string|storage_account_url` — connection_string 包括账户名称和密钥 ([创建连接字符串](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string?toc=%2Fazure%2Fstorage%2Fblobs%2Ftoc.json&bc=%2Fazure%2Fstorage%2Fblobs%2Fbreadcrumb%2Ftoc.json#configure-a-connection-string-for-an-azure-storage-account))，或者您也可以在此提供存储帐户 URL，并将账户名称和账户密钥作为单独的参数传递（参见参数 account_name 和 account_key）
- `container_name` - 容器名称
- `blobpath` - 文件路径。在只读模式下支持以下通配符：`*`, `**`, `?`, `{abc,def}` 和 `{N..M}`，其中 `N`，`M` — 数字，`'abc'`，`'def'` — 字符串。
- `account_name` - 如果使用了 storage_account_url，则可以在此指定账户名称
- `account_key` - 如果使用了 storage_account_url，则可以在此指定账户密钥
- `format` — 文件的 [格式](/sql-reference/formats)。
- `compression` — 支持的值：`none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`。默认情况下，它将通过文件扩展名自动检测压缩。（与设置为 `auto` 相同）。
- `structure` — 表的结构。格式为 `'column1_name column1_type, column2_name column2_type, ...'`。

**返回值**

一个具有指定结构的表，用于在指定文件中读取或写入数据。

**示例**

类似于 [AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage) 表引擎，用户可以使用 Azurite 模拟器进行本地 Azure 存储开发。更多细节 [在此](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage)。下面我们假设 Azurite 可用，其主机名为 `azurite1`。

使用以下方式将数据写入 azure blob storage：

```sql
INSERT INTO TABLE FUNCTION azureBlobStorage('http://azurite1:10000/devstoreaccount1',
    'testcontainer', 'test_{_partition_id}.csv', 'devstoreaccount1', 'Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==',
    'CSV', 'auto', 'column1 UInt32, column2 UInt32, column3 UInt32') PARTITION BY column3 VALUES (1, 2, 3), (3, 2, 1), (78, 43, 3);
```

然后可以使用以下方式读取数据：

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

或者使用 connection_string

```sql
SELECT count(*) FROM azureBlobStorage('DefaultEndpointsProtocol=https;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;EndPointSuffix=core.windows.net',
    'testcontainer', 'test_3.csv', 'CSV', 'auto' , 'column1 UInt32, column2 UInt32, column3 UInt32');
```

``` text
┌─count()─┐
│      2  │
└─────────┘
```

## 虚拟列 {#virtual-columns}

- `_path` — 文件路径。类型：`LowCardinality(String)`。
- `_file` — 文件名称。类型：`LowCardinality(String)`。
- `_size` — 文件大小（以字节为单位）。类型：`Nullable(UInt64)`。如果文件大小未知，值为 `NULL`。
- `_time` — 文件的最后修改时间。类型：`Nullable(DateTime)`。如果时间未知，值为 `NULL`。

**参见**

- [AzureBlobStorage 表引擎](engines/table-engines/integrations/azureBlobStorage.md)

## Hive 风格分区 {#hive-style-partitioning}

当设置 `use_hive_partitioning` 为 1 时，ClickHouse 将在路径中检测 Hive 风格的分区（`/name=value/`），并允许在查询中将分区列用作虚拟列。这些虚拟列将与分区路径中的名称相同，但以 `_` 开头。

**示例**

使用虚拟列，创建了 Hive 风格的分区

``` sql
SELECT * from azureBlobStorage(config, storage_account_url='...', container='...', blob_path='http://data/path/date=*/country=*/code=*/*.parquet') where _date > '2020-01-01' and _country = 'Netherlands' and _code = 42;
```

## 使用共享访问签名 (SAS) {#using-shared-access-signatures-sas-sas-tokens}

共享访问签名 (SAS) 是一种 URI，允许对 Azure 存储容器或文件进行有限制的访问。使用它可以提供时间限制的存储帐户资源访问，而无需共享您的存储帐户密钥。更多细节 [在此](https://learn.microsoft.com/en-us/rest/api/storageservices/delegate-access-with-shared-access-signature)。

`azureBlobStorage` 函数支持共享访问签名 (SAS)。

一个 [Blob SAS 令牌](https://learn.microsoft.com/en-us/azure/ai-services/translator/document-translation/how-to-guides/create-sas-tokens?tabs=Containers) 包含身份验证请求所需的所有信息，包括目标 blob、权限和有效期。要构建 blob URL，请将 SAS 令牌附加到 blob 服务端点。例如，如果端点是 `https://clickhousedocstest.blob.core.windows.net/`，则请求变为：

```sql
SELECT count()
FROM azureBlobStorage('BlobEndpoint=https://clickhousedocstest.blob.core.windows.net/;SharedAccessSignature=sp=r&st=2025-01-29T14:58:11Z&se=2025-01-29T22:58:11Z&spr=https&sv=2022-11-02&sr=c&sig=Ac2U0xl4tm%2Fp7m55IilWl1yHwk%2FJG0Uk6rMVuOiD0eE%3D', 'exampledatasets', 'example.csv')

┌─count()─┐
│      10 │
└─────────┘

1 row in set. Elapsed: 0.425 sec.
```

或者，用户可以使用生成的 [Blob SAS URL](https://learn.microsoft.com/en-us/azure/ai-services/translator/document-translation/how-to-guides/create-sas-tokens?tabs=Containers)：

```sql
SELECT count() 
FROM azureBlobStorage('https://clickhousedocstest.blob.core.windows.net/?sp=r&st=2025-01-29T14:58:11Z&se=2025-01-29T22:58:11Z&spr=https&sv=2022-11-02&sr=c&sig=Ac2U0xl4tm%2Fp7m55IilWl1yHwk%2FJG0Uk6rMVuOiD0eE%3D', 'exampledatasets', 'example.csv')

┌─count()─┐
│      10 │
└─────────┘

1 row in set. Elapsed: 0.153 sec.
```
