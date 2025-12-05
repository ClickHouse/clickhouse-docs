---
description: 'Azure Blob Storage 内のファイルを選択および挿入するためのテーブル関数のようなインターフェースを提供します。s3 関数と同様です。'
keywords: ['azure blob storage']
sidebar_label: 'azureBlobStorage'
sidebar_position: 10
slug: /sql-reference/table-functions/azureBlobStorage
title: 'azureBlobStorage'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# azureBlobStorage テーブル関数 {#azureblobstorage-table-function}

[Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) 内のファイルに対して、SELECT/INSERT クエリを実行するテーブル形式のインターフェイスを提供します。このテーブル関数は [s3 関数](../../sql-reference/table-functions/s3.md) と類似しています。



## 構文 {#syntax}

```sql
azureBlobStorage(- connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression, structure, partition_strategy, partition_columns_in_data_file, extra_credentials(client_id=, tenant_id=)])
```


## Arguments {#arguments}

| Argument                                    | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
|---------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `connection_string`\| `storage_account_url` | `connection_string` にはアカウント名とキーが含まれます（[接続文字列を作成](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string?toc=%2Fazure%2Fstorage%2Fblobs%2Ftoc.json&bc=%2Fazure%2Fstorage%2Fblobs%2Fbreadcrumb%2Ftoc.json#configure-a-connection-string-for-an-azure-storage-account) を参照）。または、ここにストレージアカウント URL を指定し、アカウント名とアカウントキーを別々のパラメータとして指定することもできます（パラメータ `account_name` および `account_key` を参照）。 |
| `container_name`                            | コンテナー名                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `blobpath`                                  | ファイルパス。読み取り専用モードで次のワイルドカードをサポートします: `*`, `**`, `?`, `{abc,def}`, `{N..M}`。ここで `N`, `M` は数値、`'abc'`, `'def'` は文字列です。                                                                                                                                                                                                                                                                                                                    |
| `account_name`                              | `storage_account_url` を使用する場合、アカウント名をここで指定できます。                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `account_key`                               | `storage_account_url` を使用する場合、アカウントキーをここで指定できます。                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `format`                                    | ファイルの [format](/sql-reference/formats)。                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `compression`                               | サポートされる値: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`。デフォルトでは、ファイル拡張子から圧縮形式を自動検出します（`auto` を指定した場合と同じ）。                                                                                                                                                                                                                                                                                                                        | 
| `structure`                                 | テーブルの構造。形式: `'column1_name column1_type, column2_name column2_type, ...'`。                                                                                                                                                                                                                                                                                                                                                                                                     |
| `partition_strategy`                        | オプションのパラメータです。サポートされる値: `WILDCARD` または `HIVE`。`WILDCARD` ではパス内に `{_partition_id}` が必要で、これがパーティションキーに置き換えられます。`HIVE` ではワイルドカードは使用できず、パスはテーブルのルートであるとみなし、ファイル名に Snowflake ID、拡張子にファイルフォーマットを用いた Hive 形式のパーティションディレクトリを生成します。デフォルトは `WILDCARD` です。                                                                                                           |
| `partition_columns_in_data_file`            | オプションのパラメータです。`HIVE` パーティション戦略でのみ使用されます。ClickHouse が、パーティションカラムがデータファイル内に書き込まれていることを想定すべきかどうかを指定します。デフォルトは `false` です。                                                                                                                                                                                                                                                                      |
| `extra_credentials`                         | 認証には `client_id` と `tenant_id` を使用してください。`extra_credentials` が指定されている場合は、`account_name` および `account_key` よりも優先されます。                                                                                                                                                                                                                                                                                                                              |



## 返される値 {#returned_value}

指定した構造を持ち、指定したファイル内のデータを読み書きするためのテーブル。



## 例 {#examples}

[AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage) テーブルエンジンと同様に、ローカルの Azure Storage 開発環境向けに Azurite エミュレーターを使用できます。詳細は[こちら](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage)を参照してください。以下では、Azurite がホスト名 `azurite1` で利用可能であると仮定します。

次の方法で Azure Blob Storage にデータを書き込みます：

```sql
INSERT INTO TABLE FUNCTION azureBlobStorage('http://azurite1:10000/devstoreaccount1',
    'testcontainer', 'test_{_partition_id}.csv', 'devstoreaccount1', 'Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==',
    'CSV', 'auto', 'column1 UInt32, column2 UInt32, column3 UInt32') PARTITION BY column3 VALUES (1, 2, 3), (3, 2, 1), (78, 43, 3);
```

その後、次のようにして読み込めます。

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

または connection&#95;string を使用する

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

- `_path` — ファイルへのパス。型は `LowCardinality(String)`。
- `_file` — ファイル名。型は `LowCardinality(String)`。
- `_size` — ファイルサイズ（バイト単位）。型は `Nullable(UInt64)`。ファイルサイズが不明な場合、値は `NULL` です。
- `_time` — ファイルの最終更新時刻。型は `Nullable(DateTime)`。時刻が不明な場合、値は `NULL` です。



## パーティション書き込み {#partitioned-write}

### パーティション戦略 {#partition-strategy}

INSERT クエリでのみサポートされています。

`WILDCARD`（デフォルト）：ファイルパス内の `{_partition_id}` ワイルドカードを実際のパーティションキーで置き換えます。

`HIVE` は、読み取りおよび書き込みの両方に対して Hive スタイルのパーティション方式を実装します。次の形式を使用してファイルを生成します：`<prefix>/<key1=val1/key2=val2...>/<snowflakeid>.<toLower(file_format)>`。

**`HIVE` パーティション戦略の例**

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


## use&#95;hive&#95;partitioning 設定 {#hive-style-partitioning}

これは、読み込み時に Hive スタイルでパーティション分割されたファイルを ClickHouse がパースするためのヒントです。書き込みには影響しません。読み込みと書き込みを対称にしたい場合は、`partition_strategy` 引数を使用してください。

`use_hive_partitioning` 設定を 1 にすると、ClickHouse はパス（`/name=value/`）内の Hive スタイルのパーティション分割を検出し、クエリ内でパーティションカラムを仮想カラムとして使用できるようになります。これらの仮想カラムは、パーティションパス内の名前と同じですが、先頭に `_` が付きます。

**例**

Hive スタイルのパーティション分割で作成された仮想カラムを使用する

```sql
SELECT * FROM azureBlobStorage(config, storage_account_url='...', container='...', blob_path='http://data/path/date=*/country=*/code=*/*.parquet') WHERE _date > '2020-01-01' AND _country = 'Netherlands' AND _code = 42;
```


## 共有アクセス署名 (SAS) の使用 {#using-shared-access-signatures-sas-sas-tokens}

共有アクセス署名 (SAS) は、Azure Storage のコンテナーまたはファイルへの制限付きアクセス権を付与する URI です。ストレージ アカウント キーを共有することなく、ストレージ アカウント リソースへの時間制限付きアクセスを提供するために使用します。詳細は[こちら](https://learn.microsoft.com/en-us/rest/api/storageservices/delegate-access-with-shared-access-signature)を参照してください。

`azureBlobStorage` 関数は共有アクセス署名 (SAS) をサポートします。

[Blob SAS トークン](https://learn.microsoft.com/en-us/azure/ai-services/translator/document-translation/how-to-guides/create-sas-tokens?tabs=Containers)には、対象 BLOB、権限、有効期間など、要求の認証に必要なすべての情報が含まれています。BLOB URL を構築するには、SAS トークンを BLOB サービス エンドポイントに付加します。たとえば、エンドポイントが `https://clickhousedocstest.blob.core.windows.net/` の場合、リクエストは次のようになります。

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


## 関連項目 {#related}
- [AzureBlobStorage テーブルエンジン](engines/table-engines/integrations/azureBlobStorage.md)
