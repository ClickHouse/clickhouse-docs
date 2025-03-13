---
slug: /sql-reference/table-functions/azureBlobStorage
sidebar_position: 10
sidebar_label: azureBlobStorage
title: 'azureBlobStorage'
description: 'Azure Blob Storageのファイルを選択/挿入するためのテーブルのようなインターフェースを提供します。s3関数に似ています。'
keywords: [azure blob storage]
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# azureBlobStorage テーブル関数

[Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs)のファイルを選択/挿入するためのテーブルのようなインターフェースを提供します。このテーブル関数は[s3関数](../../sql-reference/table-functions/s3.md)に似ています。

**構文**

``` sql
azureBlobStorage(- connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression, structure])
```

**引数**

- `connection_string|storage_account_url` — connection_stringにはアカウント名とキーが含まれています（[接続文字列の作成](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string?toc=%2Fazure%2Fstorage%2Fblobs%2Ftoc.json&bc=%2Fazure%2Fstorage%2Fblobs%2Fbreadcrumb%2Ftoc.json#configure-a-connection-string-for-an-azure-storage-account)）または、ここにストレージアカウントのURLを提供し、アカウント名とアカウントキーを別のパラメータとして指定することもできます（パラメータaccount_name & account_keyを参照）。
- `container_name` - コンテナ名
- `blobpath` - ファイルパス。読み取り専用モードでは次のワイルドカードをサポートしています： `*`, `**`, `?`, `{abc,def}` および `{N..M}` ここで `N`, `M` は数字、 `'abc'`, `'def'` は文字列です。
- `account_name` - storage_account_urlが使用されている場合、この場所でアカウント名を指定できます。
- `account_key` - storage_account_urlが使用されている場合、この場所でアカウントキーを指定できます。
- `format` — ファイルの[形式](/sql-reference/formats)。
- `compression` — サポートされている値： `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`。デフォルトでは、ファイル拡張子によって圧縮を自動検出します。（設定を`auto`にした場合と同じ）。
- `structure` — テーブルの構造。形式は`'column1_name column1_type, column2_name column2_type, ...'`です。

**戻り値**

指定したファイルでデータを読み書きするための指定された構造のテーブル。

**例**

[AazureBlobStorage](/engines/table-engines/integrations/azureBlobStorage)テーブルエンジンと同様に、ユーザーはローカルAzure Storage開発のためにAzuriteエミュレーターを使用できます。詳細は[こちら](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage)を参照してください。以下では、Azuriteがホスト名`azurite1`で利用可能であると仮定します。

次の方法でAzure Blob Storageにデータを書き込みます：

```sql
INSERT INTO TABLE FUNCTION azureBlobStorage('http://azurite1:10000/devstoreaccount1',
    'testcontainer', 'test_{_partition_id}.csv', 'devstoreaccount1', 'Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==',
    'CSV', 'auto', 'column1 UInt32, column2 UInt32, column3 UInt32') PARTITION BY column3 VALUES (1, 2, 3), (3, 2, 1), (78, 43, 3);
```

次に、以下のように読み取ることができます。

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

または、connection_stringを使用して

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

- `_path` — ファイルへのパス。型： `LowCardinality(String)`。
- `_file` — ファイル名。型： `LowCardinality(String)`。
- `_size` — ファイルのサイズ（バイト単位）。型： `Nullable(UInt64)`。ファイルサイズが不明な場合、値は`NULL`です。
- `_time` — ファイルの最終変更時間。型： `Nullable(DateTime)`。時間が不明な場合、値は`NULL`です。

**関連項目**

- [AzureBlobStorageテーブルエンジン](engines/table-engines/integrations/azureBlobStorage.md)

## Hiveスタイルのパーティショニング {#hive-style-partitioning}

`use_hive_partitioning`が1に設定されている場合、ClickHouseはパス内のHiveスタイルのパーティショニング（`/name=value/`）を検出し、クエリ内でパーティションカラムを仮想カラムとして使用できるようにします。これらの仮想カラムは、パーティションパス内の同じ名前ですが、先頭に`_`が付きます。

**例**

Hiveスタイルのパーティショニングで作成された仮想カラムを使用

``` sql
SELECT * from azureBlobStorage(config, storage_account_url='...', container='...', blob_path='http://data/path/date=*/country=*/code=*/*.parquet') where _date > '2020-01-01' and _country = 'Netherlands' and _code = 42;
```

## 共有アクセス署名（SAS）の使用 {#using-shared-access-signatures-sas-sas-tokens}

共有アクセス署名（SAS）は、Azure Storageコンテナまたはファイルへの制限付きアクセスを付与するURIです。ストレージアカウントキーを共有することなくストレージアカウントリソースへの時間制限付きアクセスを提供するために使用します。詳細は[こちら](https://learn.microsoft.com/en-us/rest/api/storageservices/delegate-access-with-shared-access-signature)をご覧ください。

`azureBlobStorage`関数は、共有アクセス署名（SAS）をサポートしています。

[Blob SASトークン](https://learn.microsoft.com/en-us/azure/ai-services/translator/document-translation/how-to-guides/create-sas-tokens?tabs=Containers)には、要求を認証するために必要なすべての情報が含まれており、ターゲットBlob、権限、有効期間が含まれます。Blob URLを構築するには、SASトークンをBlobサービスエンドポイントに追加します。たとえば、エンドポイントが`https://clickhousedocstest.blob.core.windows.net/`の場合、要求は次のようになります：

```sql
SELECT count()
FROM azureBlobStorage('BlobEndpoint=https://clickhousedocstest.blob.core.windows.net/;SharedAccessSignature=sp=r&st=2025-01-29T14:58:11Z&se=2025-01-29T22:58:11Z&spr=https&sv=2022-11-02&sr=c&sig=Ac2U0xl4tm%2Fp7m55IilWl1yHwk%2FJG0Uk6rMVuOiD0eE%3D', 'exampledatasets', 'example.csv')

┌─count()─┐
│      10 │
└─────────┘

1 row in set. Elapsed: 0.425 sec.
```

あるいは、ユーザーは生成された[Blob SAS URL](https://learn.microsoft.com/en-us/azure/ai-services/translator/document-translation/how-to-guides/create-sas-tokens?tabs=Containers)を使用することもできます：

```sql
SELECT count() 
FROM azureBlobStorage('https://clickhousedocstest.blob.core.windows.net/?sp=r&st=2025-01-29T14:58:11Z&se=2025-01-29T22:58:11Z&spr=https&sv=2022-11-02&sr=c&sig=Ac2U0xl4tm%2Fp7m55IilWl1yHwk%2FJG0Uk6rMVuOiD0eE%3D', 'exampledatasets', 'example.csv')

┌─count()─┐
│      10 │
└─────────┘

1 row in set. Elapsed: 0.153 sec.
```
