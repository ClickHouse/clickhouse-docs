---
'description': 'Azure Blob Storageのファイルを選択/挿入するためのテーブルのようなインターフェースを提供します。s3関数に似ています。'
'keywords':
- 'azure blob storage'
'sidebar_label': 'azureBlobStorage'
'sidebar_position': 10
'slug': '/sql-reference/table-functions/azureBlobStorage'
'title': 'azureBlobStorage'
'doc_type': 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';



# azureBlobStorage テーブル関数

[Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) でファイルを選択/挿入するためのテーブルのようなインターフェースを提供します。このテーブル関数は、[s3 関数](../../sql-reference/table-functions/s3.md) に似ています。

## 構文 {#syntax}

```sql
azureBlobStorage(- connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression, structure, partition_strategy, partition_columns_in_data_file, extra_credentials(client_id=, tenant_id=)])
```

## 引数 {#arguments}

| 引数                                        | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
|---------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `connection_string`\| `storage_account_url` | connection_string にはアカウント名とキーが含まれます ([接続文字列を作成する](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string?toc=%2Fazure%2Fstorage%2Fblobs%2Ftoc.json&bc=%2Fazure%2Fstorage%2Fblobs%2Fbreadcrumb%2Ftoc.json#configure-a-connection-string-for-an-azure-storage-account)) または、ストレージアカウントのURLをここに提供し、アカウント名とアカウントキーを別のパラメーター（パラメーター account_name と account_key を参照）として指定することもできます。 |
| `container_name`                            | コンテナ名                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `blobpath`                                  | ファイルパス。読み取り専用モードで次のワイルドカードをサポートします: `*`, `**`, `?`, `{abc,def}` および `{N..M}` （ここで `N`, `M` は数値、`'abc'`, `'def'` は文字列）。                                                                                                                                                                                                                                                                                                      |
| `account_name`                              | storage_account_url が使用される場合、ここでアカウント名を指定できます。                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `account_key`                               | storage_account_url が使用される場合、ここでアカウントキーを指定できます。                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `format`                                    | ファイルの[フォーマット](/sql-reference/formats)。                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `compression`                               | サポートされる値: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`。デフォルトでは、ファイル拡張子によって圧縮が自動検出されます。（`auto` に設定した場合と同じ）。                                                                                                                                                                                                                                                                                                         | 
| `structure`                                 | テーブルの構造。形式は `'column1_name column1_type, column2_name column2_type, ...'`。                                                                                                                                                                                                                                                                                                                                                                                                    |
| `partition_strategy`                        | このパラメーターはオプションです。サポートされる値: `WILDCARD` または `HIVE`。 `WILDCARD` はパスに `{_partition_id}` を必要とし、これはパーティションキーで置き換えられます。`HIVE` はワイルドカードを許可せず、パスをテーブルのルートと仮定し、ファイル名として Snowflake ID を使用し、ファイル形式を拡張子として生成する Hive スタイルのパーティションディレクトリを生成します。デフォルトは `WILDCARD` です。                                    |
| `partition_columns_in_data_file`           | このパラメーターはオプションです。`HIVE` パーティション戦略とのみ使用されます。データファイルにパーティションカラムが書き込まれることを ClickHouse に期待させるためのものです。デフォルトは `false` です。                                                                                                                                                                                                                                                                           |
| `extra_credentials`                         | 認証用に `client_id` と `tenant_id` を使用します。extra_credentials が提供されると、これらは `account_name` および `account_key` よりも優先されます。 |

## 戻り値 {#returned_value}

指定されたファイルのデータを読み書きするための指定された構造のテーブル。

## 例 {#examples}

[AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage) テーブルエンジンに似て、ユーザーは Azure Storage のローカル開発のために Azurite エミュレーターを使用できます。詳細は[こちら](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage)を参照してください。以下では、Azurite がホスト名 `azurite1` で利用可能であると仮定します。

次のようにして Azure Blob Storage にデータを書き込むことができます。

```sql
INSERT INTO TABLE FUNCTION azureBlobStorage('http://azurite1:10000/devstoreaccount1',
    'testcontainer', 'test_{_partition_id}.csv', 'devstoreaccount1', 'Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==',
    'CSV', 'auto', 'column1 UInt32, column2 UInt32, column3 UInt32') PARTITION BY column3 VALUES (1, 2, 3), (3, 2, 1), (78, 43, 3);
```

次に、以下のようにして読み取ることができます。

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

または connection_string を使用して

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

## パーティション書き込み {#partitioned-write}

### パーティション戦略 {#partition-strategy}

INSERT クエリのみに対してサポートされています。

`WILDCARD`（デフォルト）: ファイルパス内の `{_partition_id}` ワイルドカードを実際のパーティションキーで置き換えます。

`HIVE` は読み取りおよび書き込みのための Hive スタイルのパーティションを実装します。次の形式を使用してファイルを生成します: `<prefix>/<key1=val1/key2=val2...>/<snowflakeid>.<toLower(file_format)>`。

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

これは、読み取り時に Hive スタイルのパーティションファイルを解析するためのヒントです。書き込みには影響しません。対称的な read と write を行うには、`partition_strategy` 引数を使用してください。

`use_hive_partitioning` が 1 に設定されている場合、ClickHouse はパスの Hive スタイルのパーティショニングを検出し（`/name=value/`）、クエリ内でパーティションカラムを仮想カラムとして使用できるようにします。これらの仮想カラムは、パーティション化されたパスと同じ名前を持ちますが、先頭に `_` が付いています。

**例**

Hive スタイルのパーティショニングで作成された仮想カラムを使用します。

```sql
SELECT * FROM azureBlobStorage(config, storage_account_url='...', container='...', blob_path='http://data/path/date=*/country=*/code=*/*.parquet') WHERE _date > '2020-01-01' AND _country = 'Netherlands' AND _code = 42;
```

## 共有アクセス署名（SAS）の使用 {#using-shared-access-signatures-sas-sas-tokens}

共有アクセス署名（SAS）は、Azure Storage のコンテナまたはファイルへの制限付きアクセスを付与する URI です。ストレージアカウントキーを共有することなく、ストレージアカウントリソースへの時間制限付きアクセスを提供するために使用します。詳細は[こちら](https://learn.microsoft.com/en-us/rest/api/storageservices/delegate-access-with-shared-access-signature)を参照してください。

`azureBlobStorage` 関数は、共有アクセス署名（SAS）をサポートしています。

[Blob SAS トークン](https://learn.microsoft.com/en-us/azure/ai-services/translator/document-translation/how-to-guides/create-sas-tokens?tabs=Containers)には、リクエストを認証するために必要なすべての情報が含まれています。ターゲットの Blob、権限、そして有効期限などが含まれます。Blob URL を構成するには、SAS トークンを Blob サービスエンドポイントに追加します。例えば、エンドポイントが `https://clickhousedocstest.blob.core.windows.net/` の場合、リクエストは次のようになります。

```sql
SELECT count()
FROM azureBlobStorage('BlobEndpoint=https://clickhousedocstest.blob.core.windows.net/;SharedAccessSignature=sp=r&st=2025-01-29T14:58:11Z&se=2025-01-29T22:58:11Z&spr=https&sv=2022-11-02&sr=c&sig=Ac2U0xl4tm%2Fp7m55IilWl1yHwk%2FJG0Uk6rMVuOiD0eE%3D', 'exampledatasets', 'example.csv')

┌─count()─┐
│      10 │
└─────────┘

1 row in set. Elapsed: 0.425 sec.
```

代わりに、ユーザーは生成された[Blob SAS URL](https://learn.microsoft.com/en-us/azure/ai-services/translator/document-translation/how-to-guides/create-sas-tokens?tabs=Containers)を使用できます。

```sql
SELECT count()
FROM azureBlobStorage('https://clickhousedocstest.blob.core.windows.net/?sp=r&st=2025-01-29T14:58:11Z&se=2025-01-29T22:58:11Z&spr=https&sv=2022-11-02&sr=c&sig=Ac2U0xl4tm%2Fp7m55IilWl1yHwk%2FJG0Uk6rMVuOiD0eE%3D', 'exampledatasets', 'example.csv')

┌─count()─┐
│      10 │
└─────────┘

1 row in set. Elapsed: 0.153 sec.
```

## 関連 {#related}
- [AzureBlobStorage テーブルエンジン](engines/table-engines/integrations/azureBlobStorage.md)
