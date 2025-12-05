---
description: 'このエンジンは Azure Blob Storage エコシステムとの連携機能を提供します。'
sidebar_label: 'Azure Blob Storage'
sidebar_position: 10
slug: /engines/table-engines/integrations/azureBlobStorage
title: 'AzureBlobStorage テーブルエンジン {#azureblobstorage-table-engine}'
doc_type: 'reference'
---



# AzureBlobStorage テーブルエンジン {#azureblobstorage-table-engine}

このエンジンは、[Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) エコシステムとの連携機能を提供します。



## テーブルを作成 {#create-table}

```sql
CREATE TABLE azure_blob_storage_table (name String, value UInt32)
    ENGINE = AzureBlobStorage(connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression, partition_strategy, partition_columns_in_data_file, extra_credentials(client_id=, tenant_id=)])
    [PARTITION BY expr]
    [SETTINGS ...]
```

### エンジンパラメータ {#engine-parameters}

* `endpoint` — コンテナとプレフィックスを含む AzureBlobStorage のエンドポイント URL。使用する認証方法に応じて、必要であれば account&#95;name を含めることもできます（`http://azurite1:{port}/[account_name]{container_name}/{data_prefix}`）。あるいは、storage&#95;account&#95;url・account&#95;name・container を用いてこれらのパラメータを個別に指定することもできます。prefix を指定する場合は、endpoint を使用する必要があります。
* `endpoint_contains_account_name` - endpoint に account&#95;name が含まれているかどうかを指定するためのフラグです。一部の認証方法でのみ必要になります（デフォルト: true）。
* `connection_string|storage_account_url` — connection&#95;string にはアカウント名とキーが含まれます（[接続文字列の作成](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string?toc=%2Fazure%2Fstorage%2Fblobs%2Ftoc.json\&bc=%2Fazure%2Fstorage%2Fblobs%2Fbreadcrumb%2Ftoc.json#configure-a-connection-string-for-an-azure-storage-account) を参照）。または、ここでストレージアカウントの URL を指定し、account name と account key を別パラメータとして指定することもできます（パラメータ account&#95;name および account&#95;key を参照）。
* `container_name` - コンテナ名。
* `blobpath` - ファイルパス。読み取り専用モードで次のワイルドカードをサポートします: `*`, `**`, `?`, `{abc,def}` および `{N..M}`。ここで `N`, `M` は数値、`'abc'`, `'def'` は文字列です。
* `account_name` - storage&#95;account&#95;url を使用する場合、ここでアカウント名を指定できます。
* `account_key` - storage&#95;account&#95;url を使用する場合、ここでアカウントキーを指定できます。
* `format` — ファイルの[format](/interfaces/formats.md)。
* `compression` — サポートされる値: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`。デフォルトではファイル拡張子により圧縮方式を自動検出します（`auto` を指定した場合と同様）。
* `partition_strategy` – オプション: `WILDCARD` または `HIVE`。`WILDCARD` では、パス内に `{_partition_id}` を含める必要があり、これがパーティションキーに置き換えられます。`HIVE` ではワイルドカードを許可せず、パスをテーブルのルートとみなし、ファイル名として Snowflake ID、拡張子としてファイルフォーマットを用いた Hive 形式のパーティションディレクトリを生成します。デフォルトは `WILDCARD` です。
* `partition_columns_in_data_file` - `HIVE` パーティション戦略でのみ使用されます。データファイル内にパーティションカラムが書き込まれていることを ClickHouse が想定すべきかどうかを指定します。デフォルトは `false` です。
* `extra_credentials` - 認証に `client_id` および `tenant_id` を使用します。extra&#95;credentials が指定されている場合、それらは `account_name` および `account_key` より優先されます。

**例**

ユーザーはローカルでの Azure Storage 開発用に Azurite エミュレータを使用できます。詳細は[こちら](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage)を参照してください。ローカルの Azurite インスタンスを使用する場合、以下のコマンドでは Azurite がホスト `azurite1` で利用可能であると仮定しているため、`http://azurite1:10000` を `http://localhost:10000` に置き換える必要がある場合があります。

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
- `_size` — ファイルサイズ（バイト単位）。型: `Nullable(UInt64)`。サイズが不明な場合、値は `NULL`。
- `_time` — ファイルの最終更新時刻。型: `Nullable(DateTime)`。時刻が不明な場合、値は `NULL`。



## 認証 {#authentication}

現在、認証方法は 3 つあります:

* `Managed Identity` - `endpoint`、`connection_string`、`storage_account_url` のいずれかを指定して利用できます。
* `SAS Token` - `endpoint`、`connection_string`、`storage_account_url` のいずれかを指定して利用できます。URL 内に &#39;?&#39; が含まれていることで識別されます。例については [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage#using-shared-access-signatures-sas-sas-tokens) を参照してください。
* `Workload Identity` - `endpoint` または `storage_account_url` を指定して利用できます。設定内で `use_workload_identity` パラメータが設定されている場合、認証には [workload identity](https://github.com/Azure/azure-sdk-for-cpp/tree/main/sdk/identity/azure-identity#authenticate-azure-hosted-applications) が使用されます。

### データキャッシュ {#data-cache}

`Azure` テーブルエンジンはローカルディスク上でのデータキャッシュをサポートします。
ファイルシステムキャッシュの設定オプションと使用方法については、この[セクション](/operations/storing-data.md/#using-local-cache)を参照してください。
キャッシュはストレージオブジェクトのパスと ETag に基づいて行われるため、ClickHouse は古いキャッシュバージョンを読み取りません。

キャッシュを有効にするには、`filesystem_cache_name = '<name>'` と `enable_filesystem_cache = 1` を設定します。

```sql
SELECT *
FROM azureBlobStorage('DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://azurite1:10000/devstoreaccount1/;', 'testcontainer', 'test_table', 'CSV')
SETTINGS filesystem_cache_name = 'cache_for_azure', enable_filesystem_cache = 1;
```

1. ClickHouse の設定ファイルに次のセクションを追加します：

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

2. ClickHouse の `storage_configuration` セクションで使用されているキャッシュ構成（およびキャッシュストレージ）を再利用します。[こちらで説明しています](/operations/storing-data.md/#using-local-cache)

### PARTITION BY {#partition-by}

`PARTITION BY` — オプションです。ほとんどの場合、パーティションキーは不要です。必要な場合でも、一般的には月単位より細かいパーティションキーは必要ありません。パーティション分割は（ORDER BY 式とは対照的に）クエリを高速化しません。パーティションを細かくしすぎてはいけません。クライアント識別子や名前でデータをパーティションしないでください（代わりに、クライアント識別子または名前を ORDER BY 式の最初のカラムにします）。

月ごとにパーティション分割するには、`toYYYYMM(date_column)` 式を使用します。ここで `date_column` は型が [Date](/sql-reference/data-types/date.md) の日付を保持するカラムです。ここでのパーティション名は `"YYYYMM"` 形式になります。

#### パーティション戦略 {#partition-strategy}

`WILDCARD`（デフォルト）: ファイルパス内の `{_partition_id}` ワイルドカードを実際のパーティションキーに置き換えます。読み取りはサポートされていません。

`HIVE` は、読み取りおよび書き込みに対して Hive スタイルのパーティション分割を実装します。読み取りは再帰的なグロブパターンを使用して実装されています。書き込みでは、次の形式でファイルを生成します: `<prefix>/<key1=val1/key2=val2...>/<snowflakeid>.<toLower(file_format)>`。

注意: `HIVE` パーティション戦略を使用する場合、`use_hive_partitioning` 設定は効果を持ちません。

`HIVE` パーティション戦略の例:

```sql
arthur :) create table azure_table (year UInt16, country String, counter UInt8) ENGINE=AzureBlobStorage(account_name='devstoreaccount1', account_key='Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==', storage_account_url = 'http://localhost:30000/devstoreaccount1', container='cont', blob_path='hive_partitioned', format='Parquet', compression='auto', partition_strategy='hive') PARTITION BY (year, country);

arthur :) insert into azure_table values (2020, 'Russia', 1), (2021, 'Brazil', 2);

arthur :) select _path, * from azure_table;
```


┌─&#95;path──────────────────────────────────────────────────────────────────────┬─year─┬─country─┬─counter─┐

1. │ cont/hive&#95;partitioned/year=2020/country=Russia/7351305360873664512.parquet │ 2020 │ ロシア  │       1 │
2. │ cont/hive&#95;partitioned/year=2021/country=Brazil/7351305360894636032.parquet │ 2021 │ ブラジル │       2 │
   └────────────────────────────────────────────────────────────────────────────┴──────┴─────────┴─────────┘

```
```


## 関連項目 {#see-also}

[Azure Blob Storage テーブル関数](/sql-reference/table-functions/azureBlobStorage)
