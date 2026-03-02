---
description: '提供类似于表的接口，用于在 Azure Blob Storage 中查询和插入文件。类似于 s3 函数。'
keywords: ['azure blob storage']
sidebar_label: 'azureBlobStorage'
sidebar_position: 10
slug: /sql-reference/table-functions/azureBlobStorage
title: 'azureBlobStorage'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# azureBlobStorage 表函数 \{#azureblobstorage-table-function\}

提供类似表的接口，用于在 [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) 中查询/插入文件。此表函数类似于 [s3 函数](../../sql-reference/table-functions/s3.md)。

## 语法 \{#syntax\}

<Tabs>
<TabItem value="connection_string" label="连接字符串" default>

凭证信息已嵌入到连接字符串中，因此无需单独提供 `account_name`/`account_key` 参数：

```sql
azureBlobStorage(connection_string, container_name, blobpath [, format, compression, structure])
```

</TabItem>
<TabItem value="storage_account_url" label="存储帐户 URL">

需要将 `account_name` 和 `account_key` 作为单独的参数传入：

```sql
azureBlobStorage(storage_account_url, container_name, blobpath, account_name, account_key [, format, compression, structure])
```

</TabItem>
<TabItem value="named_collection" label="命名集合">

有关受支持的键的完整列表，请参阅下文的 [Named Collections](#named-collections)：

```sql
azureBlobStorage(named_collection[, option=value [,..]])
```

</TabItem>
</Tabs>

## 参数 \{#arguments\}

| Argument                         | Description                                                                                                                                                                                                                                                                                                                                               |
|----------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `connection_string`              | 包含嵌入凭证（账户名称 + 账户密钥或 SAS 令牌）的连接字符串。使用此形式时，`account_name` 和 `account_key` **不应**单独传入。参见[配置连接字符串](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string?toc=%2Fazure%2Fstorage%2Fblobs%2Ftoc.json&bc=%2Fazure%2Fstorage%2Fblobs%2Fbreadcrumb%2Ftoc.json#configure-a-connection-string-for-an-azure-storage-account)。 |
| `storage_account_url`            | 存储账户的终结点 URL，例如 `https://myaccount.blob.core.windows.net/`。使用此形式时，**必须**同时传入 `account_name` 和 `account_key`。                                                                                                                                                                                         |
| `container_name`                 | 容器名称。                                                                                                                                                                                                                                                                                                                                           |
| `blobpath`                       | 文件路径。在只读模式下支持以下通配符：`*`、`**`、`?`、`{abc,def}` 以及 `{N..M}`，其中 `N`、`M` 为数字，`'abc'`、`'def'` 为字符串。                                                                                                                                                                                            |
| `account_name`                   | 存储账户名称。使用不带 SAS 的 `storage_account_url` 时为**必需**；使用 `connection_string` 时**不得**传入。                                                                                                                                                                                                                               |
| `account_key`                    | 存储账户密钥。使用不带 SAS 的 `storage_account_url` 时为**必需**；使用 `connection_string` 时**不得**传入。                                                                                                                                                                                                                                |
| `format`                         | 文件的[格式](/sql-reference/formats)。                                                                                                                                                                                                                                                                                                         |
| `compression`                    | 支持的取值：`none`、`gzip/gz`、`brotli/br`、`xz/LZMA`、`zstd/zst`。默认情况下，会根据文件扩展名自动检测压缩格式（等同于设置为 `auto`）。                                                                                                                                                                                       |
| `structure`                      | 表结构。格式：`'column1_name column1_type, column2_name column2_type, ...'`。                                                                                                                                                                                                                                                             |
| `partition_strategy`             | 可选。支持的取值：`WILDCARD` 或 `HIVE`。`WILDCARD` 要求路径中包含 `{_partition_id}`，该占位符会被分区键替换。`HIVE` 不允许使用通配符，假定路径为表根目录，并生成 Hive 风格的分区目录，使用 Snowflake ID 作为文件名，并以文件格式作为扩展名。默认值为 `WILDCARD`。 |
| `partition_columns_in_data_file` | 可选。仅在 `HIVE` 分区策略下使用。用于告知 ClickHouse 数据文件中是否会写入分区列。默认值为 `false`。                                                                                                                                                                                                 |
| `extra_credentials`              | 使用 `client_id` 和 `tenant_id` 进行认证。如果提供了 `extra_credentials`，则其优先级高于 `account_name` 和 `account_key`。                                                                                                                                                                                                     |

## 命名集合 \{#named-collections\}

参数也可以通过[命名集合](/operations/named-collections)传递。在这种情况下支持以下键：

| Key                   | Required | Description                                                        |
| --------------------- | -------- | ------------------------------------------------------------------ |
| `container`           | Yes      | 容器名称。对应位置参数 `container_name`。                                      |
| `blob_path`           | Yes      | 文件路径（可带通配符）。对应位置参数 `blobpath`。                                     |
| `connection_string`   | No*      | 带有内嵌凭证的连接字符串。*必须提供 `connection_string` 或 `storage_account_url` 之一。 |
| `storage_account_url` | No*      | 存储账户端点 URL。*必须提供 `connection_string` 或 `storage_account_url` 之一。   |
| `account_name`        | No       | 使用 `storage_account_url` 时必填。                                      |
| `account_key`         | No       | 使用 `storage_account_url` 时必填。                                      |
| `format`              | No       | 文件格式。                                                              |
| `compression`         | No       | 压缩类型。                                                              |
| `structure`           | No       | 表结构。                                                               |
| `client_id`           | No       | 用于认证的 Client ID。                                                   |
| `tenant_id`           | No       | 用于认证的 Tenant ID。                                                   |

:::note
命名集合的键名与位置参数名不同：`container`（不是 `container_name`）和 `blob_path`（不是 `blobpath`）。
:::

**示例：**

```sql
CREATE NAMED COLLECTION azure_my_data AS
    storage_account_url = 'https://myaccount.blob.core.windows.net/',
    container = 'mycontainer',
    blob_path = 'data/*.parquet',
    account_name = 'myaccount',
    account_key = 'mykey...==',
    format = 'Parquet';

SELECT *
FROM azureBlobStorage(azure_my_data)
LIMIT 5;
```

你还可以在执行查询时重写命名集合中的值：

```sql
SELECT *
FROM azureBlobStorage(azure_my_data, blob_path = 'other_data/*.csv', format = 'CSVWithNames')
LIMIT 5;
```


## 返回值 \{#returned_value\}

具有指定结构的表，用于在指定文件中读写数据。

## 示例 \{#examples\}

### 使用 `storage_account_url` 形式读取数据 \{#reading-with-storage-account-url\}

```sql
SELECT *
FROM azureBlobStorage(
    'https://myaccount.blob.core.windows.net/',
    'mycontainer',
    'data/*.parquet',
    'myaccount',
    'mykey...==',
    'Parquet'
)
LIMIT 5;
```


### 使用 `connection_string` 形式读取数据 \{#reading-with-connection-string\}

```sql
SELECT *
FROM azureBlobStorage(
    'DefaultEndpointsProtocol=https;AccountName=myaccount;AccountKey=mykey...==;EndPointSuffix=core.windows.net',
    'mycontainer',
    'data/*.csv',
    'CSVWithNames'
)
LIMIT 5;
```


### 使用分区写入 \{#writing-with-partitions\}

```sql
INSERT INTO TABLE FUNCTION azureBlobStorage(
    'DefaultEndpointsProtocol=https;AccountName=myaccount;AccountKey=mykey...==;EndPointSuffix=core.windows.net',
    'mycontainer',
    'test_{_partition_id}.csv',
    'CSV',
    'auto',
    'column1 UInt32, column2 UInt32, column3 UInt32'
) PARTITION BY column3
VALUES (1, 2, 3), (3, 2, 1), (78, 43, 3);
```

然后再读取特定的分区：

```sql
SELECT *
FROM azureBlobStorage(
    'DefaultEndpointsProtocol=https;AccountName=myaccount;AccountKey=mykey...==;EndPointSuffix=core.windows.net',
    'mycontainer',
    'test_1.csv',
    'CSV',
    'auto',
    'column1 UInt32, column2 UInt32, column3 UInt32'
);
```

```response
┌─column1─┬─column2─┬─column3─┐
│       3 │       2 │       1 │
└─────────┴─────────┴─────────┘
```


## 虚拟列 \{#virtual-columns\}

- `_path` — 文件路径。类型：`LowCardinality(String)`。
- `_file` — 文件名。类型：`LowCardinality(String)`。
- `_size` — 文件大小（字节）。类型：`Nullable(UInt64)`。如果文件大小未知，则值为 `NULL`。
- `_time` — 文件最后一次修改时间。类型：`Nullable(DateTime)`。如果时间未知，则值为 `NULL`。

## 分区写入 \{#partitioned-write\}

### 分区策略 \{#partition-strategy\}

仅支持 INSERT 语句。

`WILDCARD`（默认）：将文件路径中的 `{_partition_id}` 通配符替换为实际的分区键。

`HIVE` 在读写时采用 Hive 风格分区。生成的文件格式如下：`<prefix>/<key1=val1/key2=val2...>/<snowflakeid>.<toLower(file_format)>`。

**`HIVE` 分区策略示例**

```sql
INSERT INTO TABLE FUNCTION azureBlobStorage(
    azure_conf2,
    storage_account_url = 'https://myaccount.blob.core.windows.net/',
    container = 'cont',
    blob_path = 'azure_table_root',
    format = 'CSVWithNames',
    compression = 'auto',
    structure = 'year UInt16, country String, id Int32',
    partition_strategy = 'hive'
) PARTITION BY (year, country)
VALUES (2020, 'Russia', 1), (2021, 'Brazil', 2);
```

```result
SELECT _path, * FROM azureBlobStorage(
    azure_conf2,
    storage_account_url = 'https://myaccount.blob.core.windows.net/',
    container = 'cont',
    blob_path = 'azure_table_root/**.csvwithnames'
)

   ┌─_path───────────────────────────────────────────────────────────────────────────┬─id─┬─year─┬─country─┐
1. │ cont/azure_table_root/year=2021/country=Brazil/7351307847391293440.csvwithnames │  2 │ 2021 │ Brazil  │
2. │ cont/azure_table_root/year=2020/country=Russia/7351307847378710528.csvwithnames │  1 │ 2020 │ Russia  │
   └─────────────────────────────────────────────────────────────────────────────────┴────┴──────┴─────────┘
```


## use_hive_partitioning 设置 \{#hive-style-partitioning\}

这是一个设置，用于让 ClickHouse 在读取时解析 Hive 风格分区文件。它对写入没有任何影响。若要在读写两侧保持对称，请使用 `partition_strategy` 参数。

当将 `use_hive_partitioning` 设置为 1 时，ClickHouse 会在路径中检测 Hive 风格分区（`/name=value/`），并允许在查询中将分区列作为虚拟列来使用。这些虚拟列的名称将与分区路径中的名称相同，但会以 `_` 作为前缀。

**示例**

在查询中使用由 Hive 风格分区创建的虚拟列

```sql
SELECT * FROM azureBlobStorage(config, storage_account_url='...', container='...', blob_path='http://data/path/date=*/country=*/code=*/*.parquet') WHERE _date > '2020-01-01' AND _country = 'Netherlands' AND _code = 42;
```


## 使用共享访问签名 (SAS) \{#using-shared-access-signatures-sas-sas-tokens\}

共享访问签名 (Shared Access Signature，SAS) 是一个 URI，用于授予对 Azure Storage 容器或文件的受限访问权限。使用它可以在不共享存储账户密钥的情况下，为存储账户资源提供限定时间的访问权限。详细信息请参阅[此处](https://learn.microsoft.com/en-us/rest/api/storageservices/delegate-access-with-shared-access-signature)。

`azureBlobStorage` 函数支持共享访问签名 (SAS)。

[Blob SAS 令牌](https://learn.microsoft.com/en-us/azure/ai-services/translator/document-translation/how-to-guides/create-sas-tokens?tabs=Containers)包含对请求进行身份验证所需的全部信息，包括目标 blob、权限以及有效期。要构造 blob URL，请将 SAS 令牌追加到 blob 服务端点之后。例如，如果端点为 `https://clickhousedocstest.blob.core.windows.net/`，则请求变为：

```sql
SELECT count()
FROM azureBlobStorage('BlobEndpoint=https://clickhousedocstest.blob.core.windows.net/;SharedAccessSignature=sp=r&st=2025-01-29T14:58:11Z&se=2025-01-29T22:58:11Z&spr=https&sv=2022-11-02&sr=c&sig=Ac2U0xl4tm%2Fp7m55IilWl1yHwk%2FJG0Uk6rMVuOiD0eE%3D', 'exampledatasets', 'example.csv')

┌─count()─┐
│      10 │
└─────────┘

1 row in set. Elapsed: 0.425 sec.
```

或者，您可以使用生成的 [Blob SAS URL](https://learn.microsoft.com/en-us/azure/ai-services/translator/document-translation/how-to-guides/create-sas-tokens?tabs=Containers):

```sql
SELECT count()
FROM azureBlobStorage('https://clickhousedocstest.blob.core.windows.net/?sp=r&st=2025-01-29T14:58:11Z&se=2025-01-29T22:58:11Z&spr=https&sv=2022-11-02&sr=c&sig=Ac2U0xl4tm%2Fp7m55IilWl1yHwk%2FJG0Uk6rMVuOiD0eE%3D', 'exampledatasets', 'example.csv')

┌─count()─┐
│      10 │
└─────────┘

1 row in set. Elapsed: 0.153 sec.
```


## 相关内容 \{#related\}

- [AzureBlobStorage 表引擎](engines/table-engines/integrations/azureBlobStorage.md)