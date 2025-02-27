---
slug: /sql-reference/table-functions/azureBlobStorageCluster
sidebar_position: 15
sidebar_label: azureBlobStorageCluster
title: "azureBlobStorageCluster テーブル関数"
---

指定されたクラスター内の多数のノードから並行して [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) のファイルを処理することを可能にします。イニシエータでは、クラスター内のすべてのノードに接続を確立し、S3ファイルパスのアスタリスクを開示し、各ファイルを動的にディスパッチします。ワーカーノードでは、イニシエータに次の処理タスクを尋ね、処理を行います。これをすべてのタスクが終了するまで繰り返します。このテーブル関数は [s3Cluster 関数](../../sql-reference/table-functions/s3Cluster.md) に似ています。

**構文**

``` sql
azureBlobStorageCluster(cluster_name, connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression, structure])
```

**引数**

- `cluster_name` — リモートおよびローカルサーバーへのアドレスおよび接続パラメータのセットを構築するために使用されるクラスターの名前。
- `connection_string|storage_account_url` — connection_string にはアカウント名とキーが含まれています（[接続文字列の作成](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string?toc=%2Fazure%2Fstorage%2Fblobs%2Ftoc.json&bc=%2Fazure%2Fstorage%2Fblobs%2Fbreadcrumb%2Ftoc.json#configure-a-connection-string-for-an-azure-storage-account)）。また、ここでストレージアカウントのURLを提供し、アカウント名およびアカウントキーを別のパラメータとして指定することもできます（パラメータの account_name および account_key を参照）。
- `container_name` - コンテナ名
- `blobpath` - ファイルパス。読み取り専用モードで以下のワイルドカードをサポートしています: `*`, `**`, `?`, `{abc,def}` および `{N..M}`（ここで `N`, `M` は数値、`'abc'`, `'def'` は文字列）。
- `account_name` - storage_account_url が使用されている場合、ここでアカウント名を指定できます。
- `account_key` - storage_account_url が使用されている場合、ここでアカウントキーを指定できます。
- `format` — ファイルの [フォーマット](../../interfaces/formats.md#formats)。
- `compression` — サポートされている値: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`。デフォルトでは、ファイル拡張子によって圧縮を自動検出します（`auto` に設定するのと同じです）。
- `structure` — テーブルの構造。フォーマットは `'column1_name column1_type, column2_name column2_type, ...'`。

**戻り値**

指定されたファイル内のデータを読み書きするための、指定された構造のテーブル。

**例**

[AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage) テーブルエンジンに似て、ユーザーはローカル Azure ストレージ開発のために Azurite エミュレーターを使用できます。詳細は [こちら](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage) をご覧ください。以下では、Azurite がホスト名 `azurite1` で使用可能であると仮定します。

`cluster_simple` クラスター内のすべてのノードを使用して、ファイル `test_cluster_*.csv` のカウントを選択します：

``` sql
SELECT count(*) from azureBlobStorageCluster(
        'cluster_simple', 'http://azurite1:10000/devstoreaccount1', 'testcontainer', 'test_cluster_count.csv', 'devstoreaccount1',
        'Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==', 'CSV',
        'auto', 'key UInt64')
```

**関連項目**

- [AzureBlobStorage エンジン](../../engines/table-engines/integrations/azureBlobStorage.md)
- [azureBlobStorage テーブル関数](../../sql-reference/table-functions/azureBlobStorage.md)

## 共有アクセス署名 (SAS) を使用する {#using-shared-access-signatures-sas-sas-tokens}

例については [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage#using-shared-access-signatures-sas-sas-tokens) を参照してください。
