---
slug: /sql-reference/table-functions/azureBlobStorage
sidebar_position: 10
sidebar_label: azureBlobStorage
keywords: [azure blob storage]
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# azureBlobStorage テーブル関数

[Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs)内のファイルを選択/挿入するためのテーブルのようなインターフェースを提供します。このテーブル関数は、[s3 関数](../../sql-reference/table-functions/s3.md)に似ています。

**構文**

```sql
azureBlobStorage(- connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression, structure])
```

**引数**

- `connection_string|storage_account_url` — connection_stringにはアカウント名とキーが含まれます（[接続文字列の作成](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string?toc=%2Fazure%2Fstorage%2Fblobs%2Ftoc.json&bc=%2Fazure%2Fstorage%2Fblobs%2Fbreadcrumb%2Ftoc.json#configure-a-connection-string-for-an-azure-storage-account)）または、ここにストレージアカウントのURLを提供し、アカウント名とアカウントキーを別のパラメータ（account_name と account_key）として指定することもできます。
- `container_name` - コンテナ名
- `blobpath` - ファイルパスです。読み取り専用モードで以下のワイルドカードをサポートします： `*`, `**`, `?`, `{abc,def}` と `{N..M}` で、`N`, `M` は数字、`'abc'`, `'def'` は文字列です。
- `account_name` - storage_account_url が使用されている場合、ここでアカウント名を指定できます。
- `account_key` - storage_account_url が使用されている場合、ここでアカウントキーを指定できます。
- `format` — ファイルの[フォーマット](../../interfaces/formats.md#formats)。
- `compression` — サポートされている値： `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`。デフォルトでは、ファイル拡張子に基づいて圧縮を自動検出します（`auto`を設定するのと同じ）。
- `structure` — テーブルの構造。フォーマットは `'column1_name column1_type, column2_name column2_type, ...'`。

**返される値**

指定されたファイル内のデータを読み書きするための、指定された構造のテーブル。

**例**

[AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage) テーブルエンジンに似て、ユーザーはローカルの Azure Storage 開発のために Azurite エミュレーターを使用できます。詳細は[こちら](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage)を参照ください。以下では、Azurite がホスト名 `azurite1` で利用可能であると仮定します。

以下を使用して Azure Blob Storage にデータを書き込みます：

```sql
INSERT INTO TABLE FUNCTION azureBlobStorage('http://azurite1:10000/devstoreaccount1',
    'testcontainer', 'test_{_partition_id}.csv', 'devstoreaccount1', 'Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==',
    'CSV', 'auto', 'column1 UInt32, column2 UInt32, column3 UInt32') PARTITION BY column3 VALUES (1, 2, 3), (3, 2, 1), (78, 43, 3);
```

次に、以下を使用して読み取ることができます：

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

もしくは、connection_string を使用して：

```sql
SELECT count(*) FROM azureBlobStorage('DefaultEndpointsProtocol=https;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;EndPointSuffix=core.windows.net',
    'testcontainer', 'test_3.csv', 'CSV', 'auto' , 'column1 UInt32, column2 UInt32, column3 UInt32');
```

```text
┌─count()─┐
│      2  │
└─────────┘
```

## 仮想カラム {#virtual-columns}

- `_path` — ファイルへのパス。タイプ: `LowCardinality(String)`。
- `_file` — ファイル名。タイプ: `LowCardinality(String)`。
- `_size` — ファイルのサイズ（バイト単位）。タイプ: `Nullable(UInt64)`。ファイルサイズが不明な場合、値は `NULL` です。
- `_time` — ファイルの最終更新時刻。タイプ: `Nullable(DateTime)`。時刻が不明な場合、値は `NULL` です。

**関連情報**

- [AzureBlobStorage テーブルエンジン](/engines/table-engines/integrations/azureBlobStorage.md)

## Hiveスタイルのパーティショニング {#hive-style-partitioning}

`use_hive_partitioning` を 1 に設定すると、ClickHouse はパス内の Hiveスタイルのパーティショニングを検出し（`/name=value/`）、クエリ内でパーティションカラムを仮想カラムとして使用できるようになります。これらの仮想カラムはパーティションされたパスと同じ名前を持ちますが、前に `_` が付きます。

**例**

Hiveスタイルのパーティショニングを使用して作成された仮想カラムを使用：

```sql
SELECT * from azureBlobStorage(config, storage_account_url='...', container='...', blob_path='http://data/path/date=*/country=*/code=*/*.parquet') where _date > '2020-01-01' and _country = 'Netherlands' and _code = 42;
```

## 共有アクセス署名 (SAS) の使用 {#using-shared-access-signatures-sas-sas-tokens}

共有アクセス署名（SAS）は、Azure Storage コンテナまたはファイルへの制限付きアクセスを付与する URI です。ストレージアカウントキーを共有することなく、ストレージアカウントリソースへの時間制限付きアクセスを提供するために使用します。詳細は[こちら](https://learn.microsoft.com/en-us/rest/api/storageservices/delegate-access-with-shared-access-signature)を参照してください。

`azureBlobStorage` 関数は共有アクセス署名（SAS）をサポートしています。

[Blob SAS トークン](https://learn.microsoft.com/en-us/azure/ai-services/translator/document-translation/how-to-guides/create-sas-tokens?tabs=Containers)には、リクエストを認証するために必要なすべての情報（ターゲットの blob、権限、有効期限など）が含まれています。blob URL を構成するには、SAS トークンを blob サービスエンドポイントに追加します。たとえば、エンドポイントが `https://clickhousedocstest.blob.core.windows.net/` の場合、リクエストは次のようになります：

```sql
SELECT count()
FROM azureBlobStorage('BlobEndpoint=https://clickhousedocstest.blob.core.windows.net/;SharedAccessSignature=sp=r&st=2025-01-29T14:58:11Z&se=2025-01-29T22:58:11Z&spr=https&sv=2022-11-02&sr=c&sig=Ac2U0xl4tm%2Fp7m55IilWl1yHwk%2FJG0Uk6rMVuOiD0eE%3D', 'exampledatasets', 'example.csv')

┌─count()─┐
│      10 │
└─────────┘

1 行がセットされました。経過時間: 0.425 秒。
```

あるいは、ユーザーは生成された[Blob SAS URL](https://learn.microsoft.com/en-us/azure/ai-services/translator/document-translation/how-to-guides/create-sas-tokens?tabs=Containers)を使用できます：

```sql
SELECT count() 
FROM azureBlobStorage('https://clickhousedocstest.blob.core.windows.net/?sp=r&st=2025-01-29T14:58:11Z&se=2025-01-29T22:58:11Z&spr=https&sv=2022-11-02&sr=c&sig=Ac2U0xl4tm%2Fp7m55IilWl1yHwk%2FJG0Uk6rMVuOiD0eE%3D', 'exampledatasets', 'example.csv')

┌─count()─┐
│      10 │
└─────────┘

1 行がセットされました。経過時間: 0.153 秒。
```
