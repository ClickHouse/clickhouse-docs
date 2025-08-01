---
description: 'Provides a table-like interface to select/insert files in Azure Blob
  Storage. Similar to the s3 function.'
keywords:
- 'azure blob storage'
sidebar_label: 'Azure Blob Storage'
sidebar_position: 10
slug: '/sql-reference/table-functions/azureBlobStorage'
title: 'azureBlobStorage'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# azureBlobStorage テーブル関数

[Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) でファイルを選択/挿入するためのテーブルのようなインターフェースを提供します。このテーブル関数は [s3 関数](../../sql-reference/table-functions/s3.md) に似ています。

## 構文 {#syntax}

```sql
azureBlobStorage(- connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression, structure])
```

## 引数 {#arguments}

| 引数                                      | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
|-------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `connection_string`\| `storage_account_url` | connection_string はアカウント名とキーを含みます ([接続文字列の作成](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string?toc=%2Fazure%2Fstorage%2Fblobs%2Ftoc.json&bc=%2Fazure%2Fstorage%2Fblobs%2Fbreadcrumb%2Ftoc.json#configure-a-connection-string-for-an-azure-storage-account)) または、ここでストレージアカウントの URL とアカウント名およびアカウントキーを別々のパラメータとして指定できます（パラメータ account_name と account_key を参照してください）|
| `container_name`                          | コンテナ名                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `blobpath`                                | ファイルパス。読み取り専用モードで次のワイルドカードをサポートします： `*`, `**`, `?`, `{abc,def}` 及び `{N..M}` （ここで `N`、`M` は数字、`'abc'`、`'def'` は文字列）。                                                                                                                                                                                                                                                                                              |
| `account_name`                            | storage_account_url が使用されている場合、アカウント名をここに指定できます                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `account_key`                             | storage_account_url が使用されている場合、アカウントキーをここに指定できます                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `format`                                  | ファイルの[フォーマット](/sql-reference/formats)。                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `compression`                             | サポートされる値： `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`。デフォルトでは、ファイル拡張子によって圧縮を自動検出します（`auto` に設定されているのと同じ）。                                                                                                                                                                                                                                                                                                     | 
| `structure`                               | テーブルの構造。フォーマット `'column1_name column1_type, column2_name column2_type, ...'`。                                                                                                                                                                                                                                                                                                                                                |

## 戻り値 {#returned_value}

指定したファイル内のデータを読み書きするための指定された構造のテーブル。

## 例 {#examples}

[AureBlobStorage](/engines/table-engines/integrations/azureBlobStorage) テーブルエンジンに似て、おそらくユーザーはローカルAzureストレージ開発用にAzuriteエミュレーターを使用することができます。詳細は [こちら](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage) で確認できます。以下では、Azurite がホスト名 `azurite1` で利用可能であると仮定します。

次のようにして Azure Blob Storage にデータを書き込むことができます：

```sql
INSERT INTO TABLE FUNCTION azureBlobStorage('http://azurite1:10000/devstoreaccount1',
    'testcontainer', 'test_{_partition_id}.csv', 'devstoreaccount1', 'Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==',
    'CSV', 'auto', 'column1 UInt32, column2 UInt32, column3 UInt32') PARTITION BY column3 VALUES (1, 2, 3), (3, 2, 1), (78, 43, 3);
```

その後、次のように読み込むことができます：

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

または connection_string を使用して：

```sql
SELECT count(*) FROM azureBlobStorage('DefaultEndpointsProtocol=https;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;EndPointSuffix=core.windows.net',
    'testcontainer', 'test_3.csv', 'CSV', 'auto' , 'column1 UInt32, column2 UInt32, column3 UInt32');
```

```text
┌─count()─┐
│      2  │
└─────────┘
```

## バーチャルカラム {#virtual-columns}

- `_path` — ファイルへのパス。型： `LowCardinality(String)`。
- `_file` — ファイル名。型： `LowCardinality(String)`。
- `_size` — バイト単位のファイルサイズ。型： `Nullable(UInt64)`。ファイルサイズが不明な場合、値は `NULL` です。
- `_time` — ファイルの最終変更時間。型： `Nullable(DateTime)`。時間が不明な場合、値は `NULL` です。

## Hiveスタイルのパーティショニング {#hive-style-partitioning}

`use_hive_partitioning` が 1 に設定されていると、ClickHouse はパス内の Hive スタイルのパーティシoning (`/name=value/`) を検出し、クエリ内でパーティションカラムをバーチャルカラムとして使用できるようにします。これらのバーチャルカラムは、パーティションされたパスと同じ名前を持ちますが、`_` で始まります。

**例**

Hive スタイルのパーティショニングで作成された仮想カラムを使用する

```sql
SELECT * from azureBlobStorage(config, storage_account_url='...', container='...', blob_path='http://data/path/date=*/country=*/code=*/*.parquet') where _date > '2020-01-01' and _country = 'Netherlands' and _code = 42;
```

## 共有アクセス署名 (SAS) の使用 {#using-shared-access-signatures-sas-sas-tokens}

共有アクセス署名 (SAS) は、Azure ストレージコンテナまたはファイルへのアクセスを制限する URI です。これを使用して、ストレージアカウントのリソースへの時間制限付きのアクセスを提供できます。ストレージアカウントキーを共有せずにアクセスを提供することができます。詳細は [こちら](https://learn.microsoft.com/en-us/rest/api/storageservices/delegate-access-with-shared-access-signature) をご覧ください。

`azureBlobStorage` 関数は共有アクセス署名 (SAS) をサポートしています。

[Blob SAS トークン](https://learn.microsoft.com/en-us/azure/ai-services/translator/document-translation/how-to-guides/create-sas-tokens?tabs=Containers) には、リクエストの認証に必要なすべての情報が含まれており、ターゲットのBlob、権限、有効期限を含みます。Blob URL を構築するには、SAS トークンを Blob サービスエンドポイントに追加します。たとえば、エンドポイントが `https://clickhousedocstest.blob.core.windows.net/` の場合、リクエストは次のようになります：

```sql
SELECT count()
FROM azureBlobStorage('BlobEndpoint=https://clickhousedocstest.blob.core.windows.net/;SharedAccessSignature=sp=r&st=2025-01-29T14:58:11Z&se=2025-01-29T22:58:11Z&spr=https&sv=2022-11-02&sr=c&sig=Ac2U0xl4tm%2Fp7m55IilWl1yHwk%2FJG0Uk6rMVuOiD0eE%3D', 'exampledatasets', 'example.csv')

┌─count()─┐
│      10 │
└─────────┘

1 行がセットされました。経過時間: 0.425 秒。
```

または、ユーザーは生成された [Blob SAS URL](https://learn.microsoft.com/en-us/azure/ai-services/translator/document-translation/how-to-guides/create-sas-tokens?tabs=Containers) を使用できます：

```sql
SELECT count() 
FROM azureBlobStorage('https://clickhousedocstest.blob.core.windows.net/?sp=r&st=2025-01-29T14:58:11Z&se=2025-01-29T22:58:11Z&spr=https&sv=2022-11-02&sr=c&sig=Ac2U0xl4tm%2Fp7m55IilWl1yHwk%2FJG0Uk6rMVuOiD0eE%3D', 'exampledatasets', 'example.csv')

┌─count()─┐
│      10 │
└─────────┘

1 行がセットされました。経過時間: 0.153 秒。
```

## 関連 {#related}
- [AzureBlobStorage テーブルエンジン](engines/table-engines/integrations/azureBlobStorage.md)
