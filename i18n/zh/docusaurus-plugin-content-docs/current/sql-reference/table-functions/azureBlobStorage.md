---
'description': '为在Azure Blob存储中选择/插入文件提供类似于s3的表格界面。'
'keywords':
- 'azure blob storage'
'sidebar_label': 'Azure Blob存储'
'sidebar_position': 10
'slug': '/sql-reference/table-functions/azureBlobStorage'
'title': 'azureBlobStorage'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# azureBlobStorage 表函数

提供类似表的接口以在 [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) 中选择/插入文件。该表函数类似于 [s3 函数](../../sql-reference/table-functions/s3.md)。

## 语法 {#syntax}

```sql
azureBlobStorage(- connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression, structure])
```

## 参数 {#arguments}

| 参数                                      | 描述                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
|-------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `connection_string`\| `storage_account_url` | connection_string 包括账户名称和密钥 ([创建连接字符串](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string?toc=%2Fazure%2Fstorage%2Fblobs%2Ftoc.json&bc=%2Fazure%2Fstorage%2Fblobs%2Fbreadcrumb%2Ftoc.json#configure-a-connection-string-for-an-azure-storage-account))，或者你也可以在这里提供存储帐户 URL，并将帐户名称和帐户密钥作为单独参数提供（见参数 account_name 和 account_key）|
| `container_name`                          | 容器名称                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `blobpath`                                | 文件路径。在只读模式下，支持以下通配符：`*`，`**`，`?`，`{abc,def}` 和 `{N..M}`，其中 `N`，`M` — 数字，`'abc'`，`'def'` — 字符串。                                                                                                                                                                                                                                                                                                                        |
| `account_name`                            | 如果使用 storage_account_url，则可以在此处指定帐户名称。                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `account_key`                             | 如果使用 storage_account_url，则可以在此处指定帐户密钥。                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `format`                                  | 文件的 [格式](/sql-reference/formats)。                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `compression`                             | 支持的值：`none`，`gzip/gz`，`brotli/br`，`xz/LZMA`，`zstd/zst`。默认情况下，它将通过文件扩展名自动检测压缩。（与设置为 `auto` 相同）。                                                                                                                                                                                                                                                                                          | 
| `structure`                               | 表的结构。格式为 `'column1_name column1_type, column2_name column2_type, ...'`。                                                                                                                                                                                                                                                                                                                                                                                                         |

## 返回值 {#returned_value}

一个具有指定结构的表，用于在指定文件中读取或写入数据。

## 示例 {#examples}

与 [AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage) 表引擎类似，用户可以使用 Azurite 模拟器进行本地 Azure 存储开发。更多详情请见 [这里](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage)。以下假设 Azurite 可在主机名 `azurite1` 上使用。

使用以下方式将数据写入 azure blob 存储：

```sql
INSERT INTO TABLE FUNCTION azureBlobStorage('http://azurite1:10000/devstoreaccount1',
    'testcontainer', 'test_{_partition_id}.csv', 'devstoreaccount1', 'Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==',
    'CSV', 'auto', 'column1 UInt32, column2 UInt32, column3 UInt32') PARTITION BY column3 VALUES (1, 2, 3), (3, 2, 1), (78, 43, 3);
```

然后可以使用以下方式读取：

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

或使用 connection_string：

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

- `_path` — 文件的路径。类型：`LowCardinality(String)`。
- `_file` — 文件的名称。类型：`LowCardinality(String)`。
- `_size` — 文件的大小（以字节为单位）。类型：`Nullable(UInt64)`。如果文件大小未知，则值为 `NULL`。
- `_time` — 文件的最后修改时间。类型：`Nullable(DateTime)`。如果时间未知，则值为 `NULL`。

## Hive 风格分区 {#hive-style-partitioning}

当设置 `use_hive_partitioning` 为 1 时，ClickHouse 将在路径中检测 Hive 风格分区（`/name=value/`），并允许在查询中将分区列作为虚拟列使用。这些虚拟列将与分区路径中的名称相同，但以 `_` 开头。

**示例**

使用虚拟列，创建了 Hive 风格分区：

```sql
SELECT * from azureBlobStorage(config, storage_account_url='...', container='...', blob_path='http://data/path/date=*/country=*/code=*/*.parquet') where _date > '2020-01-01' and _country = 'Netherlands' and _code = 42;
```

## 使用共享访问签名 (SAS) {#using-shared-access-signatures-sas-sas-tokens}

共享访问签名 (SAS) 是一个 URI，用于授予对 Azure 存储容器或文件的受限访问。使用它可以提供对存储帐户资源的限时访问，而无需共享存储帐户密钥。更多详情请见 [这里](https://learn.microsoft.com/en-us/rest/api/storageservices/delegate-access-with-shared-access-signature)。

`azureBlobStorage` 函数支持共享访问签名 (SAS)。

一个 [Blob SAS 令牌](https://learn.microsoft.com/en-us/azure/ai-services/translator/document-translation/how-to-guides/create-sas-tokens?tabs=Containers) 包含所需的所有信息以验证请求，包括目标 Blob、权限和有效期。要构造 Blob URL，请将 SAS 令牌附加到 Blob 服务端点。例如，如果端点是 `https://clickhousedocstest.blob.core.windows.net/`，请求变为：

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

## 相关内容 {#related}
- [AzureBlobStorage 表引擎](engines/table-engines/integrations/azureBlobStorage.md)
