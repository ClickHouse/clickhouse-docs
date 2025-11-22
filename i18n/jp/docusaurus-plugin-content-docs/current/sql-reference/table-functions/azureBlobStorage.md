---
description: 'Azure Blob Storage 上のファイルを選択／挿入するためのテーブル類似のインターフェースを提供します。s3 関数と同様です。'
keywords: ['azure blob storage']
sidebar_label: 'azureBlobStorage'
sidebar_position: 10
slug: /sql-reference/table-functions/azureBlobStorage
title: 'azureBlobStorage'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# azureBlobStorage テーブル関数

[Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) 上のファイルに対して、テーブルのようなインターフェイスを提供し、SELECT および INSERT 操作を実行できるようにします。このテーブル関数は [s3 関数](../../sql-reference/table-functions/s3.md) と同様です。



## 構文 {#syntax}

```sql
azureBlobStorage(- connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression, structure, partition_strategy, partition_columns_in_data_file, extra_credentials(client_id=, tenant_id=)])
```


## 引数 {#arguments}

| 引数                                    | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `connection_string`\| `storage_account_url` | connection_stringにはアカウント名とキーが含まれます（[接続文字列の作成](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string?toc=%2Fazure%2Fstorage%2Fblobs%2Ftoc.json&bc=%2Fazure%2Fstorage%2Fblobs%2Fbreadcrumb%2Ftoc.json#configure-a-connection-string-for-an-azure-storage-account)）。または、ストレージアカウントのURLをここで指定し、アカウント名とアカウントキーを別々のパラメータとして指定することもできます（パラメータaccount_nameとaccount_keyを参照してください） |
| `container_name`                            | コンテナ名                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `blobpath`                                  | ファイルパス。読み取り専用モードでは次のワイルドカードをサポートします：`*`、`**`、`?`、`{abc,def}`、`{N..M}`（`N`、`M`は数値、`'abc'`、`'def'`は文字列）                                                                                                                                                                                                                                                                                                                                   |
| `account_name`                              | storage_account_urlを使用する場合、アカウント名をここで指定できます                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `account_key`                               | storage_account_urlを使用する場合、アカウントキーをここで指定できます                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `format`                                    | ファイルの[フォーマット](/sql-reference/formats)                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `compression`                               | サポートされる値：`none`、`gzip/gz`、`brotli/br`、`xz/LZMA`、`zstd/zst`。デフォルトでは、ファイル拡張子から圧縮形式を自動検出します（`auto`に設定した場合と同じ）                                                                                                                                                                                                                                                                                                                        |
| `structure`                                 | テーブルの構造。フォーマット：`'column1_name column1_type, column2_name column2_type, ...'`                                                                                                                                                                                                                                                                                                                                                                                              |
| `partition_strategy`                        | オプションのパラメータ。サポートされる値：`WILDCARD`または`HIVE`。`WILDCARD`はパス内に`{_partition_id}`が必要で、これはパーティションキーに置き換えられます。`HIVE`はワイルドカードを許可せず、パスをテーブルのルートと見なし、Snowflake IDをファイル名、ファイルフォーマットを拡張子としてHive形式のパーティションディレクトリを生成します。デフォルトは`WILDCARD`です                                                                                                           |
| `partition_columns_in_data_file`            | オプションのパラメータ。`HIVE`パーティション戦略でのみ使用されます。パーティションカラムがデータファイルに書き込まれることを期待するかどうかをClickHouseに指示します。デフォルトは`false`です                                                                                                                                                                                                                                                                                                                    |
| `extra_credentials`                         | 認証には`client_id`と`tenant_id`を使用します。extra_credentialsが指定された場合、`account_name`と`account_key`よりも優先されます                                                                                                                                                                                                                                      |


## 戻り値 {#returned_value}

指定されたファイル内のデータを読み書きするための、指定された構造のテーブル。


## Examples {#examples}

[AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage)テーブルエンジンと同様に、ローカルのAzure Storage開発にはAzuriteエミュレータを使用できます。詳細は[こちら](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage)を参照してください。以下の例では、Azuriteがホスト名`azurite1`で利用可能であることを前提としています。

以下のようにAzure Blob Storageにデータを書き込みます:

```sql
INSERT INTO TABLE FUNCTION azureBlobStorage('http://azurite1:10000/devstoreaccount1',
    'testcontainer', 'test_{_partition_id}.csv', 'devstoreaccount1', 'Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==',
    'CSV', 'auto', 'column1 UInt32, column2 UInt32, column3 UInt32') PARTITION BY column3 VALUES (1, 2, 3), (3, 2, 1), (78, 43, 3);
```

その後、以下のように読み取ることができます:

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

または接続文字列を使用する場合:

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

- `_path` — ファイルへのパス。型: `LowCardinality(String)`。
- `_file` — ファイル名。型: `LowCardinality(String)`。
- `_size` — ファイルのサイズ(バイト単位)。型: `Nullable(UInt64)`。ファイルサイズが不明な場合、値は `NULL` です。
- `_time` — ファイルの最終更新時刻。型: `Nullable(DateTime)`。時刻が不明な場合、値は `NULL` です。


## パーティション書き込み {#partitioned-write}

### パーティション戦略 {#partition-strategy}

INSERT クエリでのみサポートされています。

`WILDCARD` (デフォルト): ファイルパス内の `{_partition_id}` ワイルドカードを実際のパーティションキーで置き換えます。

`HIVE` は読み取りと書き込みに対して Hive スタイルのパーティショニングを実装します。次の形式でファイルを生成します: `<prefix>/<key1=val1/key2=val2...>/<snowflakeid>.<toLower(file_format)>`。

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


## use_hive_partitioning 設定 {#hive-style-partitioning}

これは、ClickHouseが読み取り時にHiveスタイルでパーティション化されたファイルを解析するためのヒントです。書き込みには影響しません。読み取りと書き込みを対称的に行うには、`partition_strategy`引数を使用してください。

`use_hive_partitioning`設定を1に設定すると、ClickHouseはパス内のHiveスタイルのパーティション化（`/name=value/`）を検出し、クエリ内でパーティションカラムを仮想カラムとして使用できるようにします。これらの仮想カラムは、パーティション化されたパスと同じ名前を持ちますが、`_`で始まります。

**例**

Hiveスタイルのパーティション化で作成された仮想カラムを使用する

```sql
SELECT * FROM azureBlobStorage(config, storage_account_url='...', container='...', blob_path='http://data/path/date=*/country=*/code=*/*.parquet') WHERE _date > '2020-01-01' AND _country = 'Netherlands' AND _code = 42;
```


## Shared Access Signature (SAS) の使用 {#using-shared-access-signatures-sas-sas-tokens}

Shared Access Signature (SAS) は、Azure Storage コンテナまたはファイルへの制限付きアクセスを許可する URI です。ストレージアカウントキーを共有せずに、ストレージアカウントリソースへの期限付きアクセスを提供するために使用します。詳細は[こちら](https://learn.microsoft.com/en-us/rest/api/storageservices/delegate-access-with-shared-access-signature)を参照してください。

`azureBlobStorage` 関数は Shared Access Signature (SAS) に対応しています。

[Blob SAS トークン](https://learn.microsoft.com/en-us/azure/ai-services/translator/document-translation/how-to-guides/create-sas-tokens?tabs=Containers)には、対象 blob、権限、有効期間など、リクエストの認証に必要なすべての情報が含まれています。blob URL を構築するには、blob サービスエンドポイントに SAS トークンを付加します。例えば、エンドポイントが `https://clickhousedocstest.blob.core.windows.net/` の場合、リクエストは次のようになります:

```sql
SELECT count()
FROM azureBlobStorage('BlobEndpoint=https://clickhousedocstest.blob.core.windows.net/;SharedAccessSignature=sp=r&st=2025-01-29T14:58:11Z&se=2025-01-29T22:58:11Z&spr=https&sv=2022-11-02&sr=c&sig=Ac2U0xl4tm%2Fp7m55IilWl1yHwk%2FJG0Uk6rMVuOiD0eE%3D', 'exampledatasets', 'example.csv')

┌─count()─┐
│      10 │
└─────────┘

1 行のセット。経過時間: 0.425 秒。
```

または、生成された [Blob SAS URL](https://learn.microsoft.com/en-us/azure/ai-services/translator/document-translation/how-to-guides/create-sas-tokens?tabs=Containers) を使用することもできます:

```sql
SELECT count()
FROM azureBlobStorage('https://clickhousedocstest.blob.core.windows.net/?sp=r&st=2025-01-29T14:58:11Z&se=2025-01-29T22:58:11Z&spr=https&sv=2022-11-02&sr=c&sig=Ac2U0xl4tm%2Fp7m55IilWl1yHwk%2FJG0Uk6rMVuOiD0eE%3D', 'exampledatasets', 'example.csv')

┌─count()─┐
│      10 │
└─────────┘

1 行のセット。経過時間: 0.153 秒。
```


## 関連項目 {#related}

- [AzureBlobStorage テーブルエンジン](engines/table-engines/integrations/azureBlobStorage.md)
