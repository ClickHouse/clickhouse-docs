---
description: 'このエンジンは Azure Blob Storage エコシステムとの連携機能を提供します。'
sidebar_label: 'Azure Blob Storage'
sidebar_position: 10
slug: /engines/table-engines/integrations/azureBlobStorage
title: 'AzureBlobStorage テーブルエンジン'
doc_type: 'reference'
---



# AzureBlobStorage テーブルエンジン

このエンジンは、[Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) エコシステムと統合するための機能を提供します。



## テーブルの作成 {#create-table}

```sql
CREATE TABLE azure_blob_storage_table (name String, value UInt32)
    ENGINE = AzureBlobStorage(connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression, partition_strategy, partition_columns_in_data_file, extra_credentials(client_id=, tenant_id=)])
    [PARTITION BY expr]
    [SETTINGS ...]
```

### エンジンパラメータ {#engine-parameters}

- `endpoint` — コンテナとプレフィックスを含むAzureBlobStorageエンドポイントURL。使用する認証方法で必要な場合は、オプションでaccount_nameを含めることができます（`http://azurite1:{port}/[account_name]{container_name}/{data_prefix}`）。または、これらのパラメータはstorage_account_url、account_name、containerを使用して個別に指定することもできます。プレフィックスを指定する場合は、endpointを使用してください。
- `endpoint_contains_account_name` - このフラグは、特定の認証方法でのみ必要となるaccount_nameがendpointに含まれているかどうかを指定するために使用されます（デフォルト：true）。
- `connection_string|storage_account_url` — connection_stringにはアカウント名とキーが含まれます（[接続文字列の作成](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string?toc=%2Fazure%2Fstorage%2Fblobs%2Ftoc.json&bc=%2Fazure%2Fstorage%2Fblobs%2Fbreadcrumb%2Ftoc.json#configure-a-connection-string-for-an-azure-storage-account)）。または、ここでストレージアカウントURLを指定し、アカウント名とアカウントキーを個別のパラメータとして指定することもできます（パラメータaccount_nameとaccount_keyを参照）。
- `container_name` - コンテナ名
- `blobpath` - ファイルパス。読み取り専用モードでは次のワイルドカードをサポートします：`*`、`**`、`?`、`{abc,def}`、`{N..M}`（`N`、`M`は数値、`'abc'`、`'def'`は文字列）。
- `account_name` - storage_account_urlを使用する場合、ここでアカウント名を指定できます
- `account_key` - storage_account_urlを使用する場合、ここでアカウントキーを指定できます
- `format` — ファイルの[フォーマット](/interfaces/formats.md)。
- `compression` — サポートされる値：`none`、`gzip/gz`、`brotli/br`、`xz/LZMA`、`zstd/zst`。デフォルトでは、ファイル拡張子によって圧縮形式を自動検出します（`auto`に設定した場合と同じ）。
- `partition_strategy` – オプション：`WILDCARD`または`HIVE`。`WILDCARD`はパス内に`{_partition_id}`を必要とし、これはパーティションキーに置き換えられます。`HIVE`はワイルドカードを許可せず、パスをテーブルルートと見なし、Snowflake IDをファイル名、ファイルフォーマットを拡張子としてHive形式のパーティションディレクトリを生成します。デフォルトは`WILDCARD`です。
- `partition_columns_in_data_file` - `HIVE`パーティション戦略でのみ使用されます。パーティションカラムがデータファイルに書き込まれることを期待するかどうかをClickHouseに指示します。デフォルトは`false`です。
- `extra_credentials` - 認証に`client_id`と`tenant_id`を使用します。extra_credentialsが指定された場合、`account_name`と`account_key`よりも優先されます。

**例**

ローカルのAzure Storage開発にはAzuriteエミュレータを使用できます。詳細は[こちら](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage)を参照してください。Azuriteのローカルインスタンスを使用する場合、以下のコマンドでは`http://azurite1:10000`を`http://localhost:10000`に置き換える必要がある場合があります。ここではAzuriteがホスト`azurite1`で利用可能であることを前提としています。

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
- `_size` — ファイルのサイズ(バイト単位)。型: `Nullable(UInt64)`。サイズが不明な場合、値は `NULL` です。
- `_time` — ファイルの最終更新時刻。型: `Nullable(DateTime)`。時刻が不明な場合、値は `NULL` です。


## 認証 {#authentication}

現在、3つの認証方法があります:

- `Managed Identity` - `endpoint`、`connection_string`、または`storage_account_url`を指定することで使用できます。
- `SAS Token` - `endpoint`、`connection_string`、または`storage_account_url`を指定することで使用できます。URLに'?'が含まれることで識別されます。例については[azureBlobStorage](/sql-reference/table-functions/azureBlobStorage#using-shared-access-signatures-sas-sas-tokens)を参照してください。
- `Workload Identity` - `endpoint`または`storage_account_url`を指定することで使用できます。設定で`use_workload_identity`パラメータが設定されている場合、認証には([workload identity](https://github.com/Azure/azure-sdk-for-cpp/tree/main/sdk/identity/azure-identity#authenticate-azure-hosted-applications))が使用されます。

### データキャッシュ {#data-cache}

`Azure`テーブルエンジンは、ローカルディスク上でのデータキャッシュをサポートしています。
ファイルシステムキャッシュの設定オプションと使用方法については、この[セクション](/operations/storing-data.md/#using-local-cache)を参照してください。
キャッシュはストレージオブジェクトのパスとETagに基づいて作成されるため、ClickHouseが古いキャッシュバージョンを読み取ることはありません。

キャッシュを有効にするには、`filesystem_cache_name = '<name>'`と`enable_filesystem_cache = 1`の設定を使用します。

```sql
SELECT *
FROM azureBlobStorage('DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://azurite1:10000/devstoreaccount1/;', 'testcontainer', 'test_table', 'CSV')
SETTINGS filesystem_cache_name = 'cache_for_azure', enable_filesystem_cache = 1;
```

1. ClickHouse設定ファイルに以下のセクションを追加します:

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

2. ClickHouseの`storage_configuration`セクションからキャッシュ設定(およびキャッシュストレージ)を再利用します。[こちらで説明されています](/operations/storing-data.md/#using-local-cache)

### PARTITION BY {#partition-by}

`PARTITION BY` — オプション。ほとんどの場合、パーティションキーは不要です。必要な場合でも、通常は月単位より細かいパーティションキーは必要ありません。パーティショニングはクエリを高速化しません(ORDER BY式とは対照的です)。過度に細かいパーティショニングは決して使用すべきではありません。クライアント識別子や名前でデータをパーティション化しないでください(代わりに、クライアント識別子や名前をORDER BY式の最初の列にしてください)。

月単位でパーティション化するには、`toYYYYMM(date_column)`式を使用します。ここで`date_column`は[Date](/sql-reference/data-types/date.md)型の日付を持つ列です。この場合のパーティション名は`"YYYYMM"`形式になります。

#### パーティション戦略 {#partition-strategy}

`WILDCARD`(デフォルト): ファイルパス内の`{_partition_id}`ワイルドカードを実際のパーティションキーに置き換えます。読み取りはサポートされていません。

`HIVE`は読み取りと書き込みのためにHiveスタイルのパーティショニングを実装します。読み取りは再帰的なglobパターンを使用して実装されます。書き込みは次の形式でファイルを生成します: `<prefix>/<key1=val1/key2=val2...>/<snowflakeid>.<toLower(file_format)>`。

注意: `HIVE`パーティション戦略を使用する場合、`use_hive_partitioning`設定は効果がありません。

`HIVE`パーティション戦略の例:

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
