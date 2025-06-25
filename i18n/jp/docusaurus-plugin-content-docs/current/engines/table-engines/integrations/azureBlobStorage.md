---
'description': 'This engine provides an integration with Azure Blob Storage ecosystem.'
'sidebar_label': 'Azure Blob Storage'
'sidebar_position': 10
'slug': '/engines/table-engines/integrations/azureBlobStorage'
'title': 'AzureBlobStorage Table Engine'
---




# AzureBlobStorage テーブルエンジン

このエンジンは、[Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) エコシステムと統合を提供します。

## テーブルを作成する {#create-table}

```sql
CREATE TABLE azure_blob_storage_table (name String, value UInt32)
    ENGINE = AzureBlobStorage(connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression])
    [PARTITION BY expr]
    [SETTINGS ...]
```

### エンジンパラメータ {#engine-parameters}

- `endpoint` — AzureBlobStorage エンドポイント URL（コンテナとプレフィックスを含む）。認証方法に応じて account_name が必要な場合があります。 (`http://azurite1:{port}/[account_name]{container_name}/{data_prefix}`) または、これらのパラメータを storage_account_url、account_name および container を使って別々に指定できます。プレフィックスを指定するには、エンドポイントを使用する必要があります。
- `endpoint_contains_account_name` - このフラグは、エンドポイントに account_name が含まれているかどうかを指定するために使用されます。特定の認証メソッドにのみ必要です。（デフォルト: true）
- `connection_string|storage_account_url` — connection_string にはアカウント名とキーが含まれています（[接続文字列の作成](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string?toc=%2Fazure%2Fstorage%2Fblobs%2Ftoc.json&bc=%2Fazure%2Fstorage%2Fblobs%2Fbreadcrumb%2Ftoc.json#configure-a-connection-string-for-an-azure-storage-account)）または、ここでストレージアカウントの URL を提供し、アカウント名とアカウントキーを補足のパラメータとして提供することもできます（パラメータ account_name および account_key を参照）。
- `container_name` - コンテナ名
- `blobpath` - ファイルパス。読み取り専用モードで以下のワイルドカードをサポートします: `*`, `**`, `?`, `{abc,def}` および `{N..M}` ここで `N` と `M` は数字、`'abc'` と `'def'` は文字列です。
- `account_name` - storage_account_url が使用されている場合、アカウント名をここで指定できます。
- `account_key` - storage_account_url が使用されている場合、アカウントキーをここで指定できます。
- `format` — ファイルの[フォーマット](/interfaces/formats.md)。
- `compression` — サポートされている値: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`。デフォルトでは、ファイル拡張子によって圧縮が自動的に検出されます。（`auto` に設定するのと同じ）。

**例**

ユーザーは、ローカル Azure ストレージ開発のために Azurite エミュレーターを使用できます。詳細は[こちら](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage)をご覧ください。ローカルの Azurite インスタンスを使用する場合、ユーザーは下記のコマンドで `http://azurite1:10000` の代わりに `http://localhost:10000` を指定する必要があります。ここでは、Azurite がホスト `azurite1` で利用可能であると仮定しています。

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
- `_file` — ファイル名。タイプ: `LowCardinality(String)`。
- `_size` — ファイルのサイズ（バイト単位）。タイプ: `Nullable(UInt64)`。サイズが不明な場合、値は `NULL` です。
- `_time` — ファイルの最終更新時刻。タイプ: `Nullable(DateTime)`。時刻が不明な場合、値は `NULL` です。

## 認証 {#authentication}

現在、認証方法は3つあります：
- `Managed Identity` - `endpoint`、`connection_string`、または `storage_account_url` を指定することで使用できます。
- `SAS Token` - `endpoint`、`connection_string`、または `storage_account_url` を指定することで使用できます。URL に '?' が含まれているかどうかで識別されます。例については、[azureBlobStorage](/sql-reference/table-functions/azureBlobStorage#using-shared-access-signatures-sas-sas-tokens)を参照してください。
- `Workload Identity` - `endpoint` または `storage_account_url` を指定することで使用できます。 `use_workload_identity` パラメータが設定されている場合、（[workload identity](https://github.com/Azure/azure-sdk-for-cpp/tree/main/sdk/identity/azure-identity#authenticate-azure-hosted-applications)）が認証に使用されます。

### データキャッシュ {#data-cache}

`Azure` テーブルエンジンは、ローカルディスクにデータキャッシングをサポートしています。
この[セクション](/operations/storing-data.md/#using-local-cache)でファイルシステムキャッシュの構成オプションと使用法を確認してください。
キャッシングは、パスとストレージオブジェクトのETagに基づいて行われるため、ClickHouse は古いキャッシュバージョンを読み取ることはありません。

キャッシングを有効にするには、設定 `filesystem_cache_name = '<name>'` と `enable_filesystem_cache = 1` を使用します。

```sql
SELECT *
FROM azureBlobStorage('DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://azurite1:10000/devstoreaccount1/;', 'testcontainer', 'test_table', 'CSV')
SETTINGS filesystem_cache_name = 'cache_for_azure', enable_filesystem_cache = 1;
```

1. clickhouse の設定ファイルに以下のセクションを追加します:

```xml
<clickhouse>
    <filesystem_caches>
        <cache_for_azure>
            <path>キャッシュディレクトリへのパス</path>
            <max_size>10Gi</max_size>
        </cache_for_azure>
    </filesystem_caches>
</clickhouse>
```

2. clickhouse の `storage_configuration` セクションからキャッシュ設定（したがってキャッシュストレージ）を再利用します。これは[こちら](/operations/storing-data.md/#using-local-cache)に説明されています。

## 参照 {#see-also}

[Azure Blob Storage テーブル関数](/sql-reference/table-functions/azureBlobStorage)
