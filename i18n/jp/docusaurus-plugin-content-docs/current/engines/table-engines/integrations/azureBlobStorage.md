---
description: 'このエンジンは Azure Blob Storage エコシステムとの連携機能を提供します。'
sidebar_label: 'Azure Blob Storage'
sidebar_position: 10
slug: /engines/table-engines/integrations/azureBlobStorage
title: 'AzureBlobStorage テーブルエンジン'
doc_type: 'reference'
---

# AzureBlobStorage テーブルエンジン {#azureblobstorage-table-engine}

このエンジンは、[Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) エコシステムとの統合機能を提供します。

## テーブルを作成する {#create-table}

```sql
CREATE TABLE azure_blob_storage_table (name String, value UInt32)
    ENGINE = AzureBlobStorage(connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression, partition_strategy, partition_columns_in_data_file, extra_credentials(client_id=, tenant_id=)])
    [PARTITION BY expr]
    [SETTINGS ...]
```

### エンジンパラメータ {#engine-parameters}

* `endpoint` — コンテナおよびプレフィックスを含む Azure Blob Storage のエンドポイント URL。使用する認証方式で必要な場合は、任意で account&#95;name を含めることもできます（`http://azurite1:{port}/[account_name]{container_name}/{data_prefix}`）。あるいは、これらのパラメータを storage&#95;account&#95;url、account&#95;name、container を用いて個別に指定することもできます。プレフィックスを指定する場合は、endpoint を使用する必要があります。
* `endpoint_contains_account_name` - endpoint に account&#95;name が含まれているかどうかを指定するためのフラグです。これは特定の認証方式でのみ必要となります（デフォルト: true）。
* `connection_string|storage_account_url` — connection&#95;string にはアカウント名とキーを含めます（[Create connection string](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string?toc=%2Fazure%2Fstorage%2Fblobs%2Ftoc.json\&bc=%2Fazure%2Fstorage%2Fblobs%2Fbreadcrumb%2Ftoc.json#configure-a-connection-string-for-an-azure-storage-account) を参照）。あるいは、ここにはストレージアカウントの URL を指定し、アカウント名およびアカウントキーを別のパラメータとして指定することもできます（account&#95;name および account&#95;key パラメータを参照）。
* `container_name` - コンテナ名。
* `blobpath` - ファイルパス。読み取り専用モードで、次のワイルドカードをサポートします: `*`, `**`, `?`, `{abc,def}`, `{N..M}`。ここで `N`, `M` は数値、`'abc'`, `'def'` は文字列です。
* `account_name` - storage&#95;account&#95;url を使用する場合、ここでアカウント名を指定できます。
* `account_key` - storage&#95;account&#95;url を使用する場合、ここでアカウントキーを指定できます。
* `format` — ファイルの[フォーマット](/interfaces/formats.md)。
* `compression` — サポートされる値: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`。デフォルトでは、ファイル拡張子から圧縮形式を自動検出します（`auto` を設定した場合と同じです）。
* `partition_strategy` – オプション: `WILDCARD` または `HIVE`。`WILDCARD` はパス内に `{_partition_id}` を必要とし、これはパーティションキーに置き換えられます。`HIVE` はワイルドカードを許可せず、パスをテーブルルートとみなし、Snowflake ID をファイル名、ファイルフォーマットを拡張子とする Hive 形式のパーティションディレクトリを生成します。デフォルトは `WILDCARD` です。
* `partition_columns_in_data_file` - `HIVE` パーティション戦略でのみ使用されます。ClickHouse がパーティションカラムもデータファイル内に書き込むことを想定すべきかどうかを指定します。デフォルトは `false` です。
* `extra_credentials` - 認証には `client_id` および `tenant_id` を使用します。extra&#95;credentials が指定されている場合、`account_name` および `account_key` よりも優先されます。

**Example**

ユーザーはローカルの Azure Storage 開発用に Azurite エミュレーターを使用できます。詳細は[こちら](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage)を参照してください。ローカルインスタンスの Azurite を使用する場合、以下のコマンドでは Azurite がホスト `azurite1` で利用可能であると仮定しているため、`http://azurite1:10000` を `http://localhost:10000` に置き換える必要がある場合があります。

```sql
CREATE TABLE test_table (key UInt64, data String)
    ENGINE = AzureBlobStorage('DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://azurite1:10000/devstoreaccount1/;', 'testcontainer', 'test_table', 'CSV');

INSERT INTO test_table VALUES (1, 'a'), (2, 'b'), (3, 'c');

SELECT * FROM test_table;
```

```text
┌─key──┬─data──┐
│  1   │   a   │
│  2   │   b   │
│  3   │   c   │
└──────┴───────┘
```

## 仮想カラム {#virtual-columns}

- `_path` — ファイルへのパス。型: `LowCardinality(String)`。
- `_file` — ファイル名。型: `LowCardinality(String)`。
- `_size` — ファイルサイズ（バイト単位）。型: `Nullable(UInt64)`。サイズが不明な場合、値は `NULL` になります。
- `_time` — ファイルの最終更新時刻。型: `Nullable(DateTime)`。時刻が不明な場合、値は `NULL` になります。

## 認証 {#authentication}

現在、認証方法は 3 つあります:

* `Managed Identity` — `endpoint`、`connection_string`、または `storage_account_url` を指定することで利用できます。
* `SAS Token` — `endpoint`、`connection_string`、または `storage_account_url` を指定することで利用できます。URL 内に &#39;?&#39; が含まれていることで識別されます。例については [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage#using-shared-access-signatures-sas-sas-tokens) を参照してください。
* `Workload Identity` — `endpoint` または `storage_account_url` を指定することで利用できます。設定で `use_workload_identity` パラメータが指定されている場合、認証には [workload identity](https://github.com/Azure/azure-sdk-for-cpp/tree/main/sdk/identity/azure-identity#authenticate-azure-hosted-applications) が使用されます。

### データキャッシュ {#data-cache}

`Azure` テーブルエンジンはローカルディスク上でのデータキャッシュをサポートします。
ファイルシステムキャッシュの設定オプションと利用方法については、この [セクション](/operations/storing-data.md/#using-local-cache) を参照してください。
キャッシュはストレージオブジェクトのパスと ETag に基づいて行われるため、ClickHouse は古いキャッシュバージョンを読み込みません。

キャッシュを有効にするには、`filesystem_cache_name = '<name>'` と `enable_filesystem_cache = 1` の設定を使用します。

```sql
SELECT *
FROM azureBlobStorage('DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://azurite1:10000/devstoreaccount1/;', 'testcontainer', 'test_table', 'CSV')
SETTINGS filesystem_cache_name = 'cache_for_azure', enable_filesystem_cache = 1;
```

1. ClickHouse の設定ファイルに以下のセクションを追加します:

```xml
<clickhouse>
    <filesystem_caches>
        <cache_for_azure>
            <path>path to cache directory</path>
            <max_size>10Gi</max_size>
        </cache_for_azure>
    </filesystem_caches>
</clickhouse>
```

2. ClickHouse の `storage_configuration` セクションで定義されたキャッシュ設定（およびキャッシュストレージ）を再利用します。詳細は[こちら](/operations/storing-data.md/#using-local-cache)を参照してください。

### PARTITION BY {#partition-by}

`PARTITION BY` — 任意です。ほとんどの場合、パーティションキーは不要であり、必要な場合でも月単位より細かいパーティションキーが必要になることは通常ありません。パーティショニングは（ORDER BY 式とは対照的に）クエリの高速化には寄与しません。パーティションを細かくし過ぎてはいけません。データをクライアント識別子やクライアント名でパーティション分割しないでください（代わりに、クライアント識別子または名前を ORDER BY 式の先頭のカラムにします）。

月単位でパーティショニングするには、`toYYYYMM(date_column)` 式を使用します。ここで `date_column` は型が [Date](/sql-reference/data-types/date.md) の日付カラムです。ここでのパーティション名は `"YYYYMM"` 形式になります。

#### パーティション戦略 {#partition-strategy}

`WILDCARD`（デフォルト）：ファイルパス内の `{_partition_id}` ワイルドカードを実際のパーティションキーに置き換えます。読み取りはサポートされていません。

`HIVE` は読み取りと書き込みのための Hive スタイルのパーティショニングを実装します。読み取りは再帰的なグロブパターンを用いて行われます。書き込みでは、次の形式でファイルを生成します: `<prefix>/<key1=val1/key2=val2...>/<snowflakeid>.<toLower(file_format)>`。

注意: `HIVE` パーティション戦略を使用する場合、`use_hive_partitioning` 設定は影響しません。

`HIVE` パーティション戦略の例:

```sql
arthur :) create table azure_table (year UInt16, country String, counter UInt8) ENGINE=AzureBlobStorage(account_name='devstoreaccount1', account_key='Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==', storage_account_url = 'http://localhost:30000/devstoreaccount1', container='cont', blob_path='hive_partitioned', format='Parquet', compression='auto', partition_strategy='hive') PARTITION BY (year, country);

arthur :) insert into azure_table values (2020, 'Russia', 1), (2021, 'Brazil', 2);

arthur :) select _path, * from azure_table;

   ┌─_path──────────────────────────────────────────────────────────────────────┬─year─┬─country─┬─counter─┐
1. │ cont/hive_partitioned/year=2020/country=Russia/7351305360873664512.parquet │ 2020 │ Russia  │       1 │
2. │ cont/hive_partitioned/year=2021/country=Brazil/7351305360894636032.parquet │ 2021 │ Brazil  │       2 │
   └────────────────────────────────────────────────────────────────────────────┴──────┴─────────┴─────────┘
```

┌─&#95;path──────────────────────────────────────────────────────────────────────┬─年─┬─国─┬─カウンタ─┐

1. │ cont/hive&#95;partitioned/year=2020/country=Russia/7351305360873664512.parquet │ 2020 │ Russia  │       1 │
2. │ cont/hive&#95;partitioned/year=2021/country=Brazil/7351305360894636032.parquet │ 2021 │ Brazil  │       2 │
   └────────────────────────────────────────────────────────────────────────────┴──────┴─────────┴─────────┘

```
```

## 関連項目 {#see-also}

[Azure Blob Storage テーブル関数](/sql-reference/table-functions/azureBlobStorage)
