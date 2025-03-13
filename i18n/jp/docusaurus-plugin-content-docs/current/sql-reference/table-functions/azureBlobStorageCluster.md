---
slug: '/sql-reference/table-functions/azureBlobStorageCluster'
sidebar_position: 15
sidebar_label: 'azureBlobStorageCluster'
title: 'azureBlobStorageCluster'
description: '指定したクラスター内の多数のノードで Azure Blob ストレージからファイルを並列処理することを可能にします。'
---


# azureBlobStorageCluster テーブル関数

指定したクラスター内の多数のノードで [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) からファイルを並列処理することを可能にします。イニシエーターはクラスター内のすべてのノードへの接続を作成し、S3ファイルパスにアスタリスクを開示し、各ファイルを動的に分配します。ワーカーノードでは、次に処理するタスクについてイニシエーターに尋ね、タスクを処理します。このプロセスは、すべてのタスクが完了するまで繰り返されます。このテーブル関数は [s3Cluster 関数](../../sql-reference/table-functions/s3Cluster.md) に似ています。

**構文**

``` sql
azureBlobStorageCluster(cluster_name, connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression, structure])
```

**引数**

- `cluster_name` — リモートおよびローカルサーバーへのアドレスと接続パラメータのセットを構築するために使用されるクラスターの名前。
- `connection_string|storage_account_url` — connection_string にはアカウント名とキーが含まれています ([接続文字列を作成する](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string?toc=%2Fazure%2Fstorage%2Fblobs%2Ftoc.json&bc=%2Fazure%2Fstorage%2Fblobs%2Fbreadcrumb%2Ftoc.json#configure-a-connection-string-for-an-azure-storage-account)) または、ここにストレージアカウントのURLを提供し、アカウント名とアカウントキーを別のパラメータ（account_name と account_key）として提供することもできます。
- `container_name` - コンテナ名
- `blobpath` - ファイルパス。読み取り専用モードで次のワイルドカードをサポートします: `*`, `**`, `?`, `{abc,def}` と `{N..M}` ここで `N`, `M` は数字、`'abc'`, `'def'` は文字列です。
- `account_name` - storage_account_url を使用する場合、ここにアカウント名を指定できます。
- `account_key` - storage_account_url を使用する場合、ここにアカウントキーを指定できます。
- `format` — ファイルの [フォーマット](/sql-reference/formats)。
- `compression` — サポートされている値: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`。デフォルトでは、ファイル拡張子によって圧縮を自動検出します。（設定を `auto` にするのと同じ）。
- `structure` — テーブルの構造。形式は `'column1_name column1_type, column2_name column2_type, ...'`。

**返される値**

指定されたファイル内のデータを読み書きするための、指定された構造を持つテーブル。

**例**

[AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage) テーブルエンジンと同様に、ユーザーはローカル Azure ストレージ開発のために Azurite エミュレーターを使用できます。詳細は [こちら](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage) を参照してください。ここでは Azurite がホスト名 `azurite1` で利用可能であると仮定します。

`cluster_simple` クラスター内のすべてのノードを使用してファイル `test_cluster_*.csv` のカウントを選択します：

``` sql
SELECT count(*) from azureBlobStorageCluster(
        'cluster_simple', 'http://azurite1:10000/devstoreaccount1', 'testcontainer', 'test_cluster_count.csv', 'devstoreaccount1',
        'Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==', 'CSV',
        'auto', 'key UInt64')
```

**関連項目**

- [AzureBlobStorage エンジン](../../engines/table-engines/integrations/azureBlobStorage.md)
- [azureBlobStorage テーブル関数](../../sql-reference/table-functions/azureBlobStorage.md)

## 共有アクセス Signature (SAS) の使用 {#using-shared-access-signatures-sas-sas-tokens}

例については [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage#using-shared-access-signatures-sas-sas-tokens) を参照してください。
