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

# azureBlobStorage テーブル関数 {#azureblobstorage-table-function}

[Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) 内のファイルに対して SELECT および INSERT を行うための、テーブルのようなインターフェイスを提供します。このテーブル関数は、[s3 関数](../../sql-reference/table-functions/s3.md) と類似しています。

## 構文 {#syntax}

```sql
azureBlobStorage(- connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression, structure, partition_strategy, partition_columns_in_data_file, extra_credentials(client_id=, tenant_id=)])
```

## 引数 {#arguments}

| Argument                                    | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
|---------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `connection_string`\| `storage_account_url` | `connection_string` にはアカウント名とキーが含まれます（[Create connection string](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string?toc=%2Fazure%2Fstorage%2Fblobs%2Ftoc.json&bc=%2Fazure%2Fstorage%2Fblobs%2Fbreadcrumb%2Ftoc.json#configure-a-connection-string-for-an-azure-storage-account) を参照）。または、ここにストレージ アカウントの URL を指定し、アカウント名とアカウントキーを個別のパラメータとして指定することもできます（`account_name` および `account_key` パラメータを参照）。 |
| `container_name`                            | コンテナー名                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `blobpath`                                  | ファイルパス。読み取り専用モードでは、次のワイルドカードが使用できます: `*`, `**`, `?`, `{abc,def}`, `{N..M}`。ここで `N`, `M` は数値、`'abc'`, `'def'` は文字列です。                                                                                                                                                                                                                                                                                                                   |
| `account_name`                              | `storage_account_url` を使用する場合、アカウント名をここで指定できます。                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `account_key`                               | `storage_account_url` を使用する場合、アカウントキーをここで指定できます。                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `format`                                    | ファイルの [format](/sql-reference/formats)。                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `compression`                               | サポートされる値: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`。デフォルトでは、ファイル拡張子から圧縮形式を自動検出します（`auto` を指定した場合と同じ動作）。                                                                                                                                                                                                                                                                                                                   | 
| `structure`                                 | テーブルの構造。形式: `'column1_name column1_type, column2_name column2_type, ...'`。                                                                                                                                                                                                                                                                                                                                                                                                     |
| `partition_strategy`                        | 省略可能なパラメータです。サポートされる値: `WILDCARD` または `HIVE`。`WILDCARD` では、パス内に `{_partition_id}` を含める必要があり、これはパーティションキーで置き換えられます。`HIVE` ではワイルドカードは使用できず、パスはテーブルのルートであるとみなされます。この場合、ファイル名として Snowflake ID、拡張子としてファイルフォーマットを用いた Hive 形式のパーティションディレクトリが生成されます。デフォルトは `WILDCARD` です。                                                                                                           |
| `partition_columns_in_data_file`            | 省略可能なパラメータです。`HIVE` パーティション戦略でのみ使用されます。パーティション列がデータファイル内に書き込まれているかどうかを ClickHouse に指示します。デフォルトは `false` です。                                                                                                                                                                                                                                                                                                   |
| `extra_credentials`                         | 認証には `client_id` と `tenant_id` を使用します。`extra_credentials` が指定されている場合、`account_name` および `account_key` よりも優先して使用されます。

## 返される値 {#returned_value}

指定されたファイル内のデータを読み取り／書き込みするための、指定された構造を持つテーブル。

## 例 {#examples}

[AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage) テーブルエンジンと同様に、ローカル環境での Azure Storage の開発には Azurite エミュレーターを使用できます。詳細は[こちら](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage)を参照してください。以下では、Azurite がホスト名 `azurite1` で利用可能であると仮定します。

次の方法で Azure Blob Storage にデータを書き込みます：

```sql
INSERT INTO TABLE FUNCTION azureBlobStorage('http://azurite1:10000/devstoreaccount1',
    'testcontainer', 'test_{_partition_id}.csv', 'devstoreaccount1', 'Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==',
    'CSV', 'auto', 'column1 UInt32, column2 UInt32, column3 UInt32') PARTITION BY column3 VALUES (1, 2, 3), (3, 2, 1), (78, 43, 3);
```

その後、次のようにして読み出せます

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

- `_path` — ファイルへのパス。型: `LowCardinality(String)`。
- `_file` — ファイル名。型: `LowCardinality(String)`。
- `_size` — ファイルサイズ（バイト単位）。型: `Nullable(UInt64)`。ファイルサイズが不明な場合、値は `NULL` です。
- `_time` — ファイルの最終更新時刻。型: `Nullable(DateTime)`。時刻が不明な場合、値は `NULL` です。

## パーティション分割での書き込み {#partitioned-write}

### パーティション戦略 {#partition-strategy}

INSERT クエリでのみサポートされます。

`WILDCARD`（デフォルト）：ファイルパス内の `{_partition_id}` ワイルドカードを実際のパーティションキーで置き換えます。

`HIVE` は、読み取りおよび書き込みに対して Hive スタイルのパーティション分割を実装します。次の形式でファイルを生成します：`<prefix>/<key1=val1/key2=val2...>/<snowflakeid>.<toLower(file_format)>`。

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

これは、読み取り時に ClickHouse が Hive スタイルのパーティション分割ファイルを解析するためのヒントとなる設定です。書き込み時には影響しません。読み取りと書き込みの動作を対称にしたい場合は、`partition_strategy` 引数を使用してください。

`use_hive_partitioning` 設定を 1 にすると、ClickHouse はパス内の Hive スタイルのパーティション分割（`/name=value/`）を検出し、クエリ内でパーティション列を仮想カラムとして使用できるようにします。これらの仮想カラムは、パーティション分割されたパス内の名前と同じ名前を持ちますが、先頭に `_` が付きます。

**Example**

Hive スタイルのパーティション分割で作成された仮想カラムを使用する。

```sql
SELECT * FROM azureBlobStorage(config, storage_account_url='...', container='...', blob_path='http://data/path/date=*/country=*/code=*/*.parquet') WHERE _date > '2020-01-01' AND _country = 'Netherlands' AND _code = 42;
```

## 共有アクセス署名 (SAS) の使用 {#using-shared-access-signatures-sas-sas-tokens}

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

## 関連項目 {#related}
- [AzureBlobStorage テーブルエンジン](engines/table-engines/integrations/azureBlobStorage.md)
