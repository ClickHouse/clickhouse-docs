---
description: '指定されたクラスター内の多数のノードでAzure Blobストレージからファイルを並行して処理することを許可します。'
sidebar_label: 'azureBlobStorageCluster'
sidebar_position: 15
slug: /sql-reference/table-functions/azureBlobStorageCluster
title: 'azureBlobStorageCluster'
---


# azureBlobStorageCluster テーブル関数

指定されたクラスター内の多数のノードで [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) からファイルを並行して処理することを許可します。発信者では、クラスター内のすべてのノードへの接続を作成し、S3ファイルパス内のアスタリスクを開示し、各ファイルを動的に配信します。ワーカーノードでは、発信者に次の処理タスクを尋ね、それを処理します。すべてのタスクが完了するまでこれを繰り返します。このテーブル関数は、[s3Cluster関数](../../sql-reference/table-functions/s3Cluster.md)に似ています。

**構文**

```sql
azureBlobStorageCluster(cluster_name, connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression, structure])
```

**引数**

- `cluster_name` — リモートおよびローカルサーバーへのアドレスと接続パラメータのセットを構築するために使用されるクラスターの名前。
- `connection_string|storage_account_url` — connection_string にはアカウント名とキーが含まれます ([接続文字列を作成する](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string?toc=%2Fazure%2Fstorage%2Fblobs%2Ftoc.json&bc=%2Fazure%2Fstorage%2Fblobs%2Fbreadcrumb%2Ftoc.json#configure-a-connection-string-for-an-azure-storage-account))。または、ここでストレージアカウントのURLを提供し、アカウント名とアカウントキーを別のパラメータ（account_name および account_key）として指定することもできます。
- `container_name` - コンテナ名
- `blobpath` - ファイルパス。読み取り専用モードで以下のワイルドカードをサポートします: `*`, `**`, `?`, `{abc,def}` と `{N..M}`（ここで `N`, `M` は数値、`'abc'`, `'def'` は文字列）。
- `account_name` - storage_account_url が使用されている場合、ここでアカウント名を指定できます。
- `account_key` - storage_account_url が使用されている場合、ここでアカウントキーを指定できます。
- `format` — ファイルの[形式](/sql-reference/formats)。
- `compression` — サポートされる値: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`。デフォルトでは、ファイル拡張子によって圧縮を自動的に検出します（`auto`に設定するのと同じです）。
- `structure` — テーブルの構造。形式は `'column1_name column1_type, column2_name column2_type, ...'`。

**返される値**

指定されたファイル内のデータを読み書きするための指定された構造のテーブル。

**例**

[AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage) テーブルエンジンと同様に、ユーザーはローカルのAzureストレージ開発にAzuriteエミュレーターを使用できます。詳細は[こちら](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage)を参照してください。以下では、Azuriteがホスト名 `azurite1` で使用可能であると仮定します。

`cluster_simple` クラスター内のすべてのノードを使用して、ファイル `test_cluster_*.csv` のカウントを選択します。

```sql
SELECT count(*) from azureBlobStorageCluster(
        'cluster_simple', 'http://azurite1:10000/devstoreaccount1', 'testcontainer', 'test_cluster_count.csv', 'devstoreaccount1',
        'Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==', 'CSV',
        'auto', 'key UInt64')
```

**関連項目**

- [AzureBlobStorageエンジン](../../engines/table-engines/integrations/azureBlobStorage.md)
- [azureBlobStorageテーブル関数](../../sql-reference/table-functions/azureBlobStorage.md)

## 共有アクセス署名（SAS）の使用 {#using-shared-access-signatures-sas-sas-tokens}

例については[azureBlobStorage](/sql-reference/table-functions/azureBlobStorage#using-shared-access-signatures-sas-sas-tokens)を参照してください。
