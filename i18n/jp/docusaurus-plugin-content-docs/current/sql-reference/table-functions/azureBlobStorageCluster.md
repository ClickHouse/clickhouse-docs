---
slug: /sql-reference/table-functions/azureBlobStorageCluster
sidebar_position: 15
sidebar_label: azureBlobStorageCluster
title: "azureBlobStorageCluster"
description: "指定されたクラスタ内の複数のノードで、Azure Blob ストレージのファイルを並列処理を可能にします。"
---


# azureBlobStorageCluster テーブル関数

指定されたクラスタ内の複数のノードで [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) のファイルを並列に処理します。イニシエーターはクラスタ内のすべてのノードへの接続を作成し、S3ファイルパスのアスタリスクを開示し、各ファイルを動的にディスパッチします。ワーカーノードでは、イニシエーターに次に処理するタスクについて尋ね、そのタスクを処理します。すべてのタスクが終了するまでこのプロセスは繰り返されます。このテーブル関数は [s3Cluster 関数](../../sql-reference/table-functions/s3Cluster.md) に類似しています。

**構文**

``` sql
azureBlobStorageCluster(cluster_name, connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression, structure])
```

**引数**

- `cluster_name` — リモートおよびローカルサーバーへのアドレスと接続パラメータのセットを構築するために使用されるクラスタの名前。
- `connection_string|storage_account_url` — connection_string にはアカウント名とキーが含まれます ([接続文字列の作成](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string?toc=%2Fazure%2Fstorage%2Fblobs%2Ftoc.json&bc=%2Fazure%2Fstorage%2Fblobs%2Fbreadcrumb%2Ftoc.json#configure-a-connection-string-for-an-azure-storage-account))。ここでストレージアカウントURLを指定し、アカウント名とアカウントキーを別のパラメータ（parameters account_name & account_key）として提供することもできます。
- `container_name` - コンテナ名
- `blobpath` - ファイルパス。読み取り専用モードで次のワイルドカードをサポートします: `*`, `**`, `?`, `{abc,def}` および `{N..M}` で、`N`、`M` — 数字、`'abc'`、`'def'` — 文字列。
- `account_name` - storage_account_url が使用されている場合、ここにアカウント名を指定できます。
- `account_key` - storage_account_url が使用されている場合、ここにアカウントキーを指定できます。
- `format` — ファイルの [形式](../../interfaces/formats.md#formats)。
- `compression` — サポートされている値: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`。デフォルトではファイル拡張子によって圧縮を自動検出します。（`auto` への設定と同じです）。
- `structure` — テーブルの構造。形式は `'column1_name column1_type, column2_name column2_type, ...'`。

**戻り値**

指定されたファイルにデータを読み書きするための指定された構造のテーブル。

**例**

[AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage) テーブルエンジンに類似して、ユーザーはローカル Azure ストレージ開発のために Azurite エミュレーターを利用できます。詳細については [こちら](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage) を参照してください。以下では、Azurite がホスト名 `azurite1` で利用可能であると仮定します。

`cluster_simple` クラスタ内のすべてのノードを使用して、ファイル `test_cluster_*.csv` のカウントを取得します：

``` sql
SELECT count(*) from azureBlobStorageCluster(
        'cluster_simple', 'http://azurite1:10000/devstoreaccount1', 'testcontainer', 'test_cluster_count.csv', 'devstoreaccount1',
        'Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==', 'CSV',
        'auto', 'key UInt64')
```

**参照**

- [AzureBlobStorage エンジン](../../engines/table-engines/integrations/azureBlobStorage.md)
- [azureBlobStorage テーブル関数](../../sql-reference/table-functions/azureBlobStorage.md)

## 共有アクセス署名 (SAS) の使用 {#using-shared-access-signatures-sas-sas-tokens}

例については [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage#using-shared-access-signatures-sas-sas-tokens) を参照してください。
