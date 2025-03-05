---
slug: /sql-reference/table-functions/azureBlobStorage
sidebar_position: 10
sidebar_label: azureBlobStorage
title: "azureBlobStorage"
description: "Azure Blob Storage でファイルを選択/挿入するためのテーブルのようなインターフェースを提供します。 s3 関数に似ています。"
keywords: [azure blob storage]
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# azureBlobStorage テーブル関数

[Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) でファイルを選択/挿入するためのテーブルのようなインターフェースを提供します。このテーブル関数は [s3 関数](../../sql-reference/table-functions/s3.md) に似ています。

**構文**

``` sql
azureBlobStorage(- connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression, structure])
```

**引数**

- `connection_string|storage_account_url` — connection_string にはアカウント名とキーが含まれます ([接続文字列の作成](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string?toc=%2Fazure%2Fstorage%2Fblobs%2Ftoc.json&bc=%2Fazure%2Fstorage%2Fblobs%2Fbreadcrumb%2Ftoc.json#configure-a-connection-string-for-an-azure-storage-account)) ここにストレージアカウントの URL を指定し、アカウント名とアカウントキーを別々のパラメータ (account_name および account_key) として指定することもできます。
- `container_name` - コンテナ名
- `blobpath` - ファイルパス。読み取り専用モードで次のワイルドカードをサポートします: `*`, `**`, `?`, `{abc,def}` および `{N..M}` （ここで `N`, `M` は数値、`'abc'`, `'def'` は文字列です）。
- `account_name` - storage_account_url が使用されている場合、ここにアカウント名を指定できます。
- `account_key` - storage_account_url が使用されている場合、ここにアカウントキーを指定できます。
- `format` — ファイルの[フォーマット](../../interfaces/formats.md#formats)。
- `compression` — サポートされている値: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`。デフォルトでは、ファイルの拡張子で圧縮を自動検出します（`auto` の設定と同じ）。
- `structure` — テーブルの構造。形式は `'column1_name column1_type, column2_name column2_type, ...'`。

**返される値**

指定された構造のテーブルが、指定されたファイル内のデータの読み取りまたは書き込みに使用されます。

**例**

[AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage) テーブルエンジンに似て、ユーザーはローカル Azure Storage 開発のために Azurite エミュレーターを使用できます。詳細は[こちら](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage)を参照してください。以下では、Azurite がホスト名 `azurite1` で利用可能であると仮定します。

次のようにして Azure Blob Storage にデータを書き込みます：

```sql
INSERT INTO TABLE FUNCTION azureBlobStorage('http://azurite1:10000/devstoreaccount1',
    'testcontainer', 'test_{_partition_id}.csv', 'devstoreaccount1', 'Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==',
    'CSV', 'auto', 'column1 UInt32, column2 UInt32, column3 UInt32') PARTITION BY column3 VALUES (1, 2, 3), (3, 2, 1), (78, 43, 3);
```

その後、次のようにして読み取ることができます：

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

``` text
┌─count()─┐
│      2  │
└─────────┘
```

## 仮想カラム {#virtual-columns}

- `_path` — ファイルへのパス。タイプ: `LowCardinality(String)`。
- `_file` — ファイル名。タイプ: `LowCardinality(String)`。
- `_size` — ファイルのサイズ（バイト）。タイプ: `Nullable(UInt64)`。ファイルサイズが不明な場合、値は `NULL` になります。
- `_time` — ファイルの最終変更時間。タイプ: `Nullable(DateTime)`。時間が不明な場合、値は `NULL` になります。

**関連項目**

- [AzureBlobStorage テーブルエンジン](engines/table-engines/integrations/azureBlobStorage.md)

## Hive スタイルのパーティショニング {#hive-style-partitioning}

`use_hive_partitioning` を 1 に設定すると、ClickHouse はパス内の Hive スタイルのパーティショニングを検出し、クエリ内でパーティションカラムを仮想カラムとして使用できるようになります。これらの仮想カラムは、パーティション化されたパスと同じ名前になりますが、 `_` で始まります。

**例**

Hive スタイルのパーティショニングで作成された仮想カラムを使用する：

``` sql
SELECT * from azureBlobStorage(config, storage_account_url='...', container='...', blob_path='http://data/path/date=*/country=*/code=*/*.parquet') where _date > '2020-01-01' and _country = 'Netherlands' and _code = 42;
```

## 共有アクセス署名 (SAS) の使用 {#using-shared-access-signatures-sas-sas-tokens}

共有アクセス署名 (SAS) は、Azure Storage コンテナまたはファイルに対する制限付きアクセスを付与する URI です。ストレージアカウントキーを共有せずにストレージアカウントリソースへの時間制限付きアクセスを提供するために使用します。詳細は[こちら](https://learn.microsoft.com/en-us/rest/api/storageservices/delegate-access-with-shared-access-signature)をご覧ください。

`azureBlobStorage` 関数は共有アクセス署名 (SAS) をサポートしています。

[Blob SAS トークン](https://learn.microsoft.com/en-us/azure/ai-services/translator/document-translation/how-to-guides/create-sas-tokens?tabs=Containers) には、要求を認証するために必要なすべての情報が含まれます。対象の blob、権限、有効期限が含まれます。blob URL を構成するには、SAS トークンを blob サービスエンドポイントに追加します。たとえば、エンドポイントが `https://clickhousedocstest.blob.core.windows.net/` の場合、要求は次のようになります：

```sql
SELECT count()
FROM azureBlobStorage('BlobEndpoint=https://clickhousedocstest.blob.core.windows.net/;SharedAccessSignature=sp=r&st=2025-01-29T14:58:11Z&se=2025-01-29T22:58:11Z&spr=https&sv=2022-11-02&sr=c&sig=Ac2U0xl4tm%2Fp7m55IilWl1yHwk%2FJG0Uk6rMVuOiD0eE%3D', 'exampledatasets', 'example.csv')

┌─count()─┐
│      10 │
└─────────┘

1 行セット。経過時間: 0.425 秒。
```

あるいは、ユーザーは生成された[Blob SAS URL](https://learn.microsoft.com/en-us/azure/ai-services/translator/document-translation/how-to-guides/create-sas-tokens?tabs=Containers)を使用することもできます：

```sql
SELECT count() 
FROM azureBlobStorage('https://clickhousedocstest.blob.core.windows.net/?sp=r&st=2025-01-29T14:58:11Z&se=2025-01-29T22:58:11Z&spr=https&sv=2022-11-02&sr=c&sig=Ac2U0xl4tm%2Fp7m55IilWl1yHwk%2FJG0Uk6rMVuOiD0eE%3D', 'exampledatasets', 'example.csv')

┌─count()─┐
│      10 │
└─────────┘

1 行セット。経過時間: 0.153 秒。
```
