---
'description': 'このエンジンはAzure Blob Storageエコシステムとの統合を提供します。'
'sidebar_label': 'Azure Blob Storage'
'sidebar_position': 10
'slug': '/engines/table-engines/integrations/azureBlobStorage'
'title': 'AzureBlobStorage テーブルエンジン'
'doc_type': 'reference'
---


# AzureBlobStorage テーブルエンジン

このエンジンは [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) エコシステムとの統合を提供します。

## テーブルの作成 {#create-table}

```sql
CREATE TABLE azure_blob_storage_table (name String, value UInt32)
    ENGINE = AzureBlobStorage(connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression, partition_strategy, partition_columns_in_data_file, extra_credentials(client_id=, tenant_id=)])
    [PARTITION BY expr]
    [SETTINGS ...]
```

### エンジンパラメータ {#engine-parameters}

- `endpoint` — AzureBlobStorage エンドポイント URL とコンテナおよびプレフィックス。必要に応じて、認証方法に必要な account_name を含むことがあります。(`http://azurite1:{port}/[account_name]{container_name}/{data_prefix}`) または、これらのパラメータを storage_account_url、account_name、container を使用して別々に提供できます。プレフィックスを指定するには、エンドポイントを使用する必要があります。
- `endpoint_contains_account_name` - このフラグは、特定の認証方法にのみ必要なため、エンドポイントが account_name を含むかどうかを指定するために使用されます。(デフォルト : true)
- `connection_string|storage_account_url` — connection_string にはアカウント名とキーが含まれます ([接続文字列の作成](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string?toc=%2Fazure%2Fstorage%2Fblobs%2Ftoc.json&bc=%2Fazure%2Fstorage%2Fblobs%2Fbreadcrumb%2Ftoc.json#configure-a-connection-string-for-an-azure-storage-account)) または、ここでストレージアカウントのURLを提供し、アカウント名とアカウントキーを別々のパラメータとして指定することもできます (パラメータ account_name および account_key を参照)
- `container_name` - コンテナ名
- `blobpath` - ファイルパス。読み取り専用モードで以下のワイルドカードをサポートします: `*`, `**`, `?`, `{abc,def}` および `{N..M}` ただし、`N` と `M` は数値、`'abc'` および `'def'` は文字列です。
- `account_name` - storage_account_url が使用されている場合、ここでアカウント名を指定できます。
- `account_key` - storage_account_url が使用されている場合、ここでアカウントキーを指定できます。
- `format` — ファイルの [フォーマット](/interfaces/formats.md)。
- `compression` — サポートされている値: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`。デフォルトでは、ファイルの拡張子によって圧縮を自動検出します。（`auto` に設定するのと同じです）。
- `partition_strategy` – オプション: `WILDCARD` または `HIVE`。`WILDCARD` は、パス内の `{_partition_id}` を実際のパーティションキーに置き換えます。`HIVE` はワイルドカードを許可せず、パスはテーブルのルートであると仮定し、Hiveスタイルのパーティションディレクトリを生成し、Snowflake ID をファイル名として、ファイル形式を拡張子として使用します。デフォルトは `WILDCARD`
- `partition_columns_in_data_file` - `HIVE` パーティション戦略でのみ使用されます。ClickHouse にデータファイルにパーティションカラムが書き込まれることを期待するかどうかを示します。デフォルトは `false`。
- `extra_credentials` - 認証のために `client_id` および `tenant_id` を使用します。extra_credentials が提供されると、それらは `account_name` と `account_key` よりも優先されます。

**例**

ユーザーは、ローカル Azure Storage 開発のために Azurite エミュレーターを使用できます。さらなる詳細は [こちら](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage) をご覧ください。ローカルの Azurite インスタンスを使用している場合、ユーザーは以下のコマンドで `http://azurite1:10000` を `http://localhost:10000` に置き換える必要があります。ここでは Azurite がホスト `azurite1` で利用可能であると仮定しています。

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

- `_path` — ファイルへのパス。タイプ: `LowCardinality(String)`。
- `_file` — ファイルの名前。タイプ: `LowCardinality(String)`。
- `_size` — ファイルのサイズ（バイト単位）。タイプ: `Nullable(UInt64)`。サイズが不明な場合、値は `NULL` です。
- `_time` — ファイルの最終更新時間。タイプ: `Nullable(DateTime)`。時間が不明な場合、値は `NULL` です。

## 認証 {#authentication}

現在、認証を行う方法は 3 つあります：
- `Managed Identity` - `endpoint`、`connection_string` または `storage_account_url` を提供することで使用できます。
- `SAS Token` - `endpoint`、`connection_string` または `storage_account_url` を提供することで使用できます。URL に '?' があることで識別されます。例については [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage#using-shared-access-signatures-sas-sas-tokens) を参照してください。
- `Workload Identity` - `endpoint` または `storage_account_url` を提供することで使用できます。config で `use_workload_identity` パラメータが設定されている場合、認証のために ([workload identity](https://github.com/Azure/azure-sdk-for-cpp/tree/main/sdk/identity/azure-identity#authenticate-azure-hosted-applications)) が使用されます。

### データキャッシュ {#data-cache}

`Azure` テーブルエンジンは、ローカルディスクでのデータキャッシングをサポートしています。
ファイルシステムキャッシュの設定オプションと使用法については、この [セクション](/operations/storing-data.md/#using-local-cache) を参照してください。
キャッシングはストレージオブジェクトのパスと ETag に依存するため、ClickHouse は古いキャッシュバージョンを読み込むことはありません。

キャッシングを有効にするには、設定 `filesystem_cache_name = '<name>'` および `enable_filesystem_cache = 1` を使用します。

```sql
SELECT *
FROM azureBlobStorage('DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://azurite1:10000/devstoreaccount1/;', 'testcontainer', 'test_table', 'CSV')
SETTINGS filesystem_cache_name = 'cache_for_azure', enable_filesystem_cache = 1;
```

1. ClickHouse 設定ファイルに次のセクションを追加します:

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

2. ClickHouse の `storage_configuration` セクションからキャッシュ設定（したがってキャッシュストレージ）を再利用します。これは [こちら](/operations/storing-data.md/#using-local-cache) で説明されています。

### パーティションによる {#partition-by}

`PARTITION BY` — オプションです。ほとんどの場合、パーティションキーは不要ですが、必要な場合、通常は月単位でそれ以上の細かなパーティションキーは必要ありません。パーティショニングはクエリを高速化しません（ORDER BY 式とは対照的）。あまりに細かなパーティショニングを行うべきではありません。クライアントの識別子や名前でデータをパーティショニングしないでください（その代わり、クライアント識別子や名前を ORDER BY 式の最初のカラムにしてください）。

月単位でのパーティショニングには、`toYYYYMM(date_column)` 式を使用します。ここで、`date_column` は [Date](/sql-reference/data-types/date.md) 型のカラムです。パーティション名はここで `"YYYYMM"` 形式になります。

#### パーティション戦略 {#partition-strategy}

`WILDCARD`（デフォルト）：ファイルパス内の `{_partition_id}` ワイルドカードを実際のパーティションキーに置き換えます。読み取りはサポートされていません。

`HIVE` は、読み取りおよび書き込みのための Hive スタイルのパーティショニングを実装します。読み取りは再帰的なグロブパターンを使用して実装されます。書き込みは次の形式のファイルを生成します: `<prefix>/<key1=val1/key2=val2...>/<snowflakeid>.<toLower(file_format)>`。

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

## 関連項目 {#see-also}

[Azure Blob Storage テーブル関数](/sql-reference/table-functions/azureBlobStorage)
