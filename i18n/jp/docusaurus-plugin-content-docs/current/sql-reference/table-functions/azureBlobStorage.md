---
description: 'Azure Blob Storage 内のファイルの選択/挿入を行うためのテーブル形式のインターフェイスを提供します。s3 テーブル関数と同様です。'
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


# azureBlobStorage テーブル関数 \{#azureblobstorage-table-function\}

[Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) 内のファイルに対して SELECT および INSERT を行うための、テーブルのようなインターフェイスを提供します。このテーブル関数は、[s3 関数](../../sql-reference/table-functions/s3.md) と類似しています。

## 構文 \{#syntax\}

<Tabs>
<TabItem value="connection_string" label="Connection string" default>

認証情報は connection string に埋め込まれているため、別途 `account_name`/`account_key` を指定する必要はありません。

```sql
azureBlobStorage(connection_string, container_name, blobpath [, format, compression, structure])
```

</TabItem>
<TabItem value="storage_account_url" label="Storage account URL">

`account_name` と `account_key` を個別の引数として指定する必要があります。

```sql
azureBlobStorage(storage_account_url, container_name, blobpath, account_name, account_key [, format, compression, structure])
```

</TabItem>
<TabItem value="named_collection" label="Named collection">

サポートされているキーの一覧については、後述の [Named Collections](#named-collections) を参照してください。

```sql
azureBlobStorage(named_collection[, option=value [,..]])
```

</TabItem>
</Tabs>

## Arguments \{#arguments\}

| Argument                         | Description                                                                                                                                                                                                                                                                                                                                               |
|----------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `connection_string`              | 組み込み認証情報（アカウント名 + アカウントキー または SAS トークン）を含む接続文字列。この形式を使用する場合、`account_name` と `account_key` を別々に指定してはいけません。詳しくは、[Configure a connection string](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string?toc=%2Fazure%2Fstorage%2Fblobs%2Ftoc.json&bc=%2Fazure%2Fstorage%2Fblobs%2Fbreadcrumb%2Ftoc.json#configure-a-connection-string-for-an-azure-storage-account) を参照してください。 |
| `storage_account_url`            | ストレージアカウントのエンドポイント URL。例: `https://myaccount.blob.core.windows.net/`。この形式を使用する場合は、`account_name` と `account_key` も**必ず**指定する必要があります。                                                                                                                                                                                         |
| `container_name`                 | コンテナー名。                                                                                                                                                                                                                                                                                                                                           |
| `blobpath`                       | ファイルパス。読み取り専用モードで次のワイルドカードをサポートします: `*`, `**`, `?`, `{abc,def}`, `{N..M}`。ここで `N`, `M` は数値、`'abc'`, `'def'` は文字列です。                                                                                                                                                                                            |
| `account_name`                   | ストレージアカウント名。SAS なしで `storage_account_url` を使用する場合は**必須**です。`connection_string` を使用する場合は指定してはいけません。                                                                                                                                                                                                                               |
| `account_key`                    | ストレージアカウントキー。SAS なしで `storage_account_url` を使用する場合は**必須**です。`connection_string` を使用する場合は指定してはいけません。                                                                                                                                                                                                                                |
| `format`                         | ファイルの[フォーマット](/sql-reference/formats)。                                                                                                                                                                                                                                                                                                         |
| `compression`                    | サポートされる値: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`。デフォルトでは、ファイル拡張子から圧縮形式を自動検出します（`auto` を指定した場合と同じ動作）。                                                                                                                                                                                       |
| `structure`                      | テーブルの構造。形式: `'column1_name column1_type, column2_name column2_type, ...'`。                                                                                                                                                                                                                                                             |
| `partition_strategy`             | オプション。サポートされる値は `WILDCARD` または `HIVE`。`WILDCARD` ではパス内に `{_partition_id}` が必要で、これはパーティションキーで置き換えられます。`HIVE` ではワイルドカードは使用できず、パスがテーブルのルートであるとみなし、Snowflake ID をファイル名、ファイル形式を拡張子とする Hive 形式のパーティションディレクトリを生成します。デフォルトは `WILDCARD` です。 |
| `partition_columns_in_data_file` | オプション。`HIVE` パーティション戦略でのみ使用されます。ClickHouse がパーティションカラムがデータファイル内に書き込まれていることを前提とすべきかどうかを指定します。デフォルトは `false` です。                                                                                                                                                                                                 |
| `extra_credentials`              | `client_id` と `tenant_id` を使用して認証します。`extra_credentials` が指定されている場合、それらが `account_name` および `account_key` よりも優先されます。                                                                                                                                                                                                     |

## 名前付きコレクション \{#named-collections\}

引数は [named collections](/operations/named-collections) を使って渡すこともできます。この場合、次のキーがサポートされています。

| Key                   | Required | Description                                                                             |
| --------------------- | -------- | --------------------------------------------------------------------------------------- |
| `container`           | Yes      | コンテナ名。位置引数 `container_name` に対応します。                                                     |
| `blob_path`           | Yes      | ファイルパス（ワイルドカード指定も可能）。位置引数 `blobpath` に対応します。                                            |
| `connection_string`   | No*      | 認証情報を埋め込んだ接続文字列。*`connection_string` または `storage_account_url` のいずれかを指定する必要があります。       |
| `storage_account_url` | No*      | ストレージアカウントのエンドポイントURL。*`connection_string` または `storage_account_url` のいずれかを指定する必要があります。 |
| `account_name`        | No       | `storage_account_url` を使用する場合に必須です。                                                     |
| `account_key`         | No       | `storage_account_url` を使用する場合に必須です。                                                     |
| `format`              | No       | ファイルフォーマット。                                                                             |
| `compression`         | No       | 圧縮形式。                                                                                   |
| `structure`           | No       | テーブル構造。                                                                                 |
| `client_id`           | No       | 認証用の Client ID。                                                                         |
| `tenant_id`           | No       | 認証用の Tenant ID。                                                                         |

:::note
名前付きコレクションのキー名は位置引数の名前と異なります。`container`（`container_name` ではない）および `blob_path`（`blobpath` ではない）です。
:::

**例:**

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

クエリ実行時に名前付きコレクションの値を上書きすることもできます。

```sql
SELECT *
FROM azureBlobStorage(azure_my_data, blob_path = 'other_data/*.csv', format = 'CSVWithNames')
LIMIT 5;
```


## 返される値 \{#returned_value\}

指定されたファイル内のデータを読み取り／書き込みするための、指定された構造を持つテーブル。

## 例 \{#examples\}

### `storage_account_url` 形式での読み取り \{#reading-with-storage-account-url\}

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


### `connection_string` 形式での読み込み \{#reading-with-connection-string\}

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


### パーティションを用いた書き込み \{#writing-with-partitions\}

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

次に、特定のパーティションを読み出します：

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


## 仮想カラム \{#virtual-columns\}

- `_path` — ファイルへのパス。型: `LowCardinality(String)`。
- `_file` — ファイル名。型: `LowCardinality(String)`。
- `_size` — ファイルサイズ（バイト単位）。型: `Nullable(UInt64)`。ファイルサイズが不明な場合、値は `NULL` です。
- `_time` — ファイルの最終更新時刻。型: `Nullable(DateTime)`。時刻が不明な場合、値は `NULL` です。

## パーティション分割での書き込み \{#partitioned-write\}

### パーティション戦略 \{#partition-strategy\}

INSERT クエリでのみサポートされます。

`WILDCARD`（デフォルト）：ファイルパス内の `{_partition_id}` ワイルドカードを実際のパーティションキーで置き換えます。

`HIVE` は、読み取りおよび書き込みに対して Hive スタイルのパーティション分割を実装します。次の形式でファイルを生成します：`<prefix>/<key1=val1/key2=val2...>/<snowflakeid>.<toLower(file_format)>`。

**`HIVE` パーティション戦略の例**

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


## use_hive_partitioning 設定 \{#hive-style-partitioning\}

これは、読み取り時に ClickHouse が Hive スタイルのパーティション分割ファイルを解析するためのヒントとなる設定です。書き込み時には影響しません。読み取りと書き込みの動作を対称にしたい場合は、`partition_strategy` 引数を使用してください。

`use_hive_partitioning` 設定を 1 にすると、ClickHouse はパス内の Hive スタイルのパーティション分割 (`/name=value/`) を検出し、クエリ内でパーティション列を仮想カラムとして使用できるようにします。これらの仮想カラムは、パーティション分割されたパス内の名前と同じ名前を持ちます。

**Example**

Hive スタイルのパーティション分割で作成された仮想カラムを使用する。

```sql
SELECT * FROM azureBlobStorage(config, storage_account_url='...', container='...', blob_path='http://data/path/date=*/country=*/code=*/*.parquet') WHERE date > '2020-01-01' AND country = 'Netherlands' AND code = 42;
```


## 共有アクセス署名 (SAS) の使用 \{#using-shared-access-signatures-sas-sas-tokens\}

共有アクセス署名 (SAS) は、Azure Storage のコンテナまたはファイルへの制限されたアクセス権を付与する URI です。これを使用すると、ストレージ アカウント キーを共有せずに、ストレージ アカウント リソースへの有効期限付きアクセスを提供できます。詳細は[こちら](https://learn.microsoft.com/en-us/rest/api/storageservices/delegate-access-with-shared-access-signature)を参照してください。

`azureBlobStorage` 関数は共有アクセス署名 (SAS) をサポートしています。

[Blob SAS トークン](https://learn.microsoft.com/en-us/azure/ai-services/translator/document-translation/how-to-guides/create-sas-tokens?tabs=Containers)には、対象の BLOB、アクセス許可、有効期間など、リクエストの認証に必要なすべての情報が含まれます。BLOB の URL を構成するには、BLOB サービス エンドポイントに SAS トークンを付加します。たとえば、エンドポイントが `https://clickhousedocstest.blob.core.windows.net/` の場合、リクエストは次のようになります。

```sql
SELECT count()
FROM azureBlobStorage('BlobEndpoint=https://clickhousedocstest.blob.core.windows.net/;SharedAccessSignature=sp=r&st=2025-01-29T14:58:11Z&se=2025-01-29T22:58:11Z&spr=https&sv=2022-11-02&sr=c&sig=Ac2U0xl4tm%2Fp7m55IilWl1yHwk%2FJG0Uk6rMVuOiD0eE%3D', 'exampledatasets', 'example.csv')

┌─count()─┐
│      10 │
└─────────┘

1 row in set. Elapsed: 0.425 sec.
```

または、生成された [Blob SAS URL](https://learn.microsoft.com/en-us/azure/ai-services/translator/document-translation/how-to-guides/create-sas-tokens?tabs=Containers) を使用することもできます。

```sql
SELECT count()
FROM azureBlobStorage('https://clickhousedocstest.blob.core.windows.net/?sp=r&st=2025-01-29T14:58:11Z&se=2025-01-29T22:58:11Z&spr=https&sv=2022-11-02&sr=c&sig=Ac2U0xl4tm%2Fp7m55IilWl1yHwk%2FJG0Uk6rMVuOiD0eE%3D', 'exampledatasets', 'example.csv')

┌─count()─┐
│      10 │
└─────────┘

1 row in set. Elapsed: 0.153 sec.
```


## 関連項目 \{#related\}

- [AzureBlobStorage テーブルエンジン](engines/table-engines/integrations/azureBlobStorage.md)