---
description: 'このエンジンは Azure Blob Storage エコシステムとの統合を提供します。'
sidebar_label: 'Azure Blob Storage'
sidebar_position: 10
slug: /engines/table-engines/integrations/azureBlobStorage
title: 'AzureBlobStorage テーブルエンジン'
---


# AzureBlobStorage テーブルエンジン

このエンジンは [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) エコシステムとの統合を提供します。

## テーブル作成 {#create-table}

```sql
CREATE TABLE azure_blob_storage_table (name String, value UInt32)
    ENGINE = AzureBlobStorage(connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression])
    [PARTITION BY expr]
    [SETTINGS ...]
```

### エンジンパラメータ {#engine-parameters}

- `endpoint` — AzureBlobStorage のエンドポイント URL で、コンテナ & プレフィックスを含みます。オプションで、認証方法によって必要な場合は account_name を含むことがあります。(`http://azurite1:{port}/[account_name]{container_name}/{data_prefix}`) または、これらのパラメータは storage_account_url、account_name & container を使用して別々に提供することができます。プレフィックスを指定するには、endpoint を使用するべきです。
- `endpoint_contains_account_name` - このフラグは、endpoint に account_name が含まれているかどうかを指定するために使用されます。これは特定の認証方法にのみ必要です。(デフォルト : true)
- `connection_string|storage_account_url` — connection_string にはアカウント名とキーが含まれます ([接続文字列の作成](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string?toc=%2Fazure%2Fstorage%2Fblobs%2Ftoc.json&bc=%2Fazure%2Fstorage%2Fblobs%2Fbreadcrumb%2Ftoc.json#configure-a-connection-string-for-an-azure-storage-account)) また、ここにストレージアカウントの URL を提供し、アカウント名とアカウントキーを別のパラメータとしても提供できます（parameters account_name & account_key を参照）。
- `container_name` - コンテナ名
- `blobpath` - ファイルパス。読み取り専用モードで次のワイルドカードをサポートします: `*`, `**`, `?`, `{abc,def}` および `{N..M}` で、`N`, `M` — 数字、`'abc'`, `'def'` — 文字列。
- `account_name` - storage_account_url が使用されている場合、アカウント名をここで指定できます。
- `account_key` - storage_account_url が使用されている場合、アカウントキーをここで指定できます。
- `format` — ファイルの [フォーマット](/interfaces/formats.md)。
- `compression` — サポートされている値: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`。デフォルトでは、ファイル拡張子によって圧縮を自動検出します。(設定を `auto` にしているのと同じです)。

**例**

ユーザーは Azure Storage のローカル開発のために Azurite エミュレーターを使用できます。詳細は [こちら](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage) をご覧ください。ローカルの Azurite インスタンスを使用する場合、ユーザーは以下のコマンドで `http://azurite1:10000` を `http://localhost:10000` に置き換える必要があります。ここでは、Azulite がホスト `azurite1` で利用可能であると仮定しています。

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
- `_size` — ファイルのサイズ（バイト単位）。タイプ: `Nullable(UInt64)`。サイズが不明な場合、値は `NULL` になります。
- `_time` — ファイルの最終変更時刻。タイプ: `Nullable(DateTime)`。時間が不明な場合、値は `NULL` になります。

## 認証 {#authentication}

現在、認証方法は次の3つがあります：
- `Managed Identity` - `endpoint`、`connection_string` または `storage_account_url` を提供することで使用できます。
- `SAS トークン` - `endpoint`、`connection_string` または `storage_account_url` を提供することで使用できます。URLに '?' が存在することで識別されます。例については [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage#using-shared-access-signatures-sas-sas-tokens) を参照してください。
- `Workload Identity` - `endpoint` または `storage_account_url` を提供することで使用できます。config で `use_workload_identity` パラメータが設定されている場合、([workload identity](https://github.com/Azure/azure-sdk-for-cpp/tree/main/sdk/identity/azure-identity#authenticate-azure-hosted-applications)) が認証に使用されます。

### データキャッシュ {#data-cache}

`Azure` テーブルエンジンはローカルディスク上でのデータキャッシュをサポートしています。
キャッシュに関するオプションと使用方法はこの [セクション](/operations/storing-data.md/#using-local-cache) を参照してください。
キャッシュはストレージオブジェクトのパスとETagに基づいて作成されるため、ClickHouseは古いキャッシュバージョンを読み込むことはありません。

キャッシュを有効にするには、設定 `filesystem_cache_name = '<name>'` と `enable_filesystem_cache = 1` を使用します。

```sql
SELECT *
FROM azureBlobStorage('DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://azurite1:10000/devstoreaccount1/;', 'testcontainer', 'test_table', 'CSV')
SETTINGS filesystem_cache_name = 'cache_for_azure', enable_filesystem_cache = 1;
```

1. ClickHouse の構成ファイルに次のセクションを追加します：

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

2. ClickHouse の `storage_configuration` セクションからキャッシュ設定（したがってキャッシュストレージ）を再利用します。 [こちら](https://operations/storing-data.md/#using-local-cache) をご覧ください。

## 参照 {#see-also}

[Azure Blob Storage テーブル関数](/sql-reference/table-functions/azureBlobStorage)
