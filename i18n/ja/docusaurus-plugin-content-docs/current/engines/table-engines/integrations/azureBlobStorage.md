---
slug: /engines/table-engines/integrations/azureBlobStorage
sidebar_position: 10
sidebar_label: Azure Blob Storage
title: "AzureBlobStorage テーブルエンジン"
description: "このエンジンは Azure Blob Storage エコシステムとの統合を提供します。"
---

# AzureBlobStorage テーブルエンジン

このエンジンは [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) エコシステムとの統合を提供します。

## テーブルの作成 {#create-table}

``` sql
CREATE TABLE azure_blob_storage_table (name String, value UInt32)
    ENGINE = AzureBlobStorage(connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression])
    [PARTITION BY expr]
    [SETTINGS ...]
```

### エンジンパラメータ {#engine-parameters}

- `endpoint` — AzureBlobStorage エンドポイント URL（コンテナとプレフィックスを含む）。必要に応じて、認証方式によっては account_name を含むことがあります。(`http://azurite1:{port}/[account_name]{container_name}/{data_prefix}`) または、これらのパラメータは storage_account_url、account_name、container を使用して別々に提供できます。プレフィックスを指定するには、endpoint を使用する必要があります。
- `endpoint_contains_account_name` - このフラグは、endpoint に account_name が含まれているかどうかを指定するために使用されます。特定の認証方法にのみ必要です。（デフォルト: true）
- `connection_string|storage_account_url` — connection_string にはアカウント名とキーが含まれます（[接続文字列を作成する](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string?toc=%2Fazure%2Fstorage%2Fblobs%2Ftoc.json&bc=%2Fazure%2Fstorage%2Fblobs%2Fbreadcrumb%2Ftoc.json#configure-a-connection-string-for-an-azure-storage-account)）。ここで storage account url を提供し、アカウント名とアカウントキーを別のパラメータとして指定することもできます（パラメータ account_name と account_key を参照）。
- `container_name` - コンテナ名
- `blobpath` - ファイルパス。読み取り専用モードで次のワイルドカードをサポートします: `*`, `**`, `?`, `{abc,def}` および `{N..M}` （ここで `N`, `M` は数字、`'abc'`, `'def'` は文字列）。
- `account_name` - storage_account_url が使用されている場合、ここでアカウント名を指定できます。
- `account_key` - storage_account_url が使用されている場合、ここでアカウントキーを指定できます。
- `format` — ファイルの [フォーマット](/interfaces/formats.md)。
- `compression` — サポートされている値: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`。デフォルトでは、ファイル拡張子によって圧縮を自動検出します。（`auto` に設定するのと同じです）。

**例**

ユーザーは、ローカル Azure Storage 開発のために Azurite エミュレーターを使用できます。詳細は [こちら](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage) をご覧ください。ローカルの Azurite インスタンスを使用している場合、コマンドの中で `http://azurite1:10000` の代わりに `http://localhost:10000` を使用する必要があるかもしれません。ここでは Azurite がホスト `azurite1` にあると仮定しています。

``` sql
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
- `_size` — ファイルのサイズ（バイト単位）。型: `Nullable(UInt64)`。サイズが不明な場合、値は `NULL` になります。
- `_time` — 最終変更時刻。型: `Nullable(DateTime)`。時刻が不明な場合、値は `NULL` になります。

## 認証 {#authentication}

現在、認証方法は3種類あります：
- `Managed Identity` - `endpoint`、`connection_string` もしくは `storage_account_url` を提供することで使用できます。
- `SAS Token` - `endpoint`、`connection_string` もしくは `storage_account_url` を提供することで使用できます。URL に '?' が存在することで識別します。例については [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage#using-shared-access-signatures-sas-sas-tokens) を参照してください。
- `Workload Identity` - `endpoint` もしくは `storage_account_url` を提供することで使用できます。設定で `use_workload_identity` パラメータが指定されている場合、([workload identity](https://github.com/Azure/azure-sdk-for-cpp/tree/main/sdk/identity/azure-identity#authenticate-azure-hosted-applications)) が認証に使用されます。

### データキャッシュ {#data-cache}

`Azure` テーブルエンジンはローカルディスク上でのデータキャッシュをサポートしています。
ファイルシステムキャッシュの設定オプションと使用法については、この [セクション](/operations/storing-data.md/#using-local-cache) を参照してください。キャッシングは、ストレージオブジェクトのパスと ETag に基づいて行われるため、ClickHouse は古いキャッシュバージョンを読み込むことはありません。

キャッシングを有効にするには、`filesystem_cache_name = '<name>'` および `enable_filesystem_cache = 1` の設定を使用します。

```sql
SELECT *
FROM azureBlobStorage('DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://azurite1:10000/devstoreaccount1/;', 'testcontainer', 'test_table', 'CSV')
SETTINGS filesystem_cache_name = 'cache_for_azure', enable_filesystem_cache = 1;
```

1. 次のセクションを ClickHouse の設定ファイルに追加します：

``` xml
<clickhouse>
    <filesystem_caches>
        <cache_for_azure>
            <path>キャッシュディレクトリへのパス</path>
            <max_size>10Gi</max_size>
        </cache_for_azure>
    </filesystem_caches>
</clickhouse>
```

2. ClickHouse の `storage_configuration` セクションからキャッシュ設定を再利用することができます（[こちら](/operations/storing-data.md/#using-local-cache)を参照）。

## 参照 {#see-also}

[Azure Blob Storage テーブル関数](/sql-reference/table-functions/azureBlobStorage)
