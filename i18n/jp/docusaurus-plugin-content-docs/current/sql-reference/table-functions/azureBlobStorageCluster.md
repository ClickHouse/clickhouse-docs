---
description: '指定したクラスター内の複数ノードで Azure Blob Storage 上のファイルを並列処理できるようにします。'
sidebar_label: 'azureBlobStorageCluster'
sidebar_position: 15
slug: /sql-reference/table-functions/azureBlobStorageCluster
title: 'azureBlobStorageCluster'
doc_type: 'reference'
---



# azureBlobStorageCluster テーブル関数 {#azureblobstoragecluster-table-function}

指定したクラスタ内の多数のノードで、[Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) 上のファイルを並列処理することを可能にします。イニシエーターノードでは、クラスタ内のすべてのノードへの接続を確立し、S3 ファイルパス中のアスタリスクを展開して、各ファイルを動的に振り分けます。ワーカーノードでは、処理すべき次のタスクをイニシエーターに問い合わせ、そのタスクを処理します。これは、すべてのタスクが完了するまで繰り返されます。
このテーブル関数は [s3Cluster 関数](../../sql-reference/table-functions/s3Cluster.md) と類似しています。



## 構文 {#syntax}

```sql
azureBlobStorageCluster(cluster_name, connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression, structure])
```


## 引数 {#arguments}

| 引数                | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
|---------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `cluster_name`      | リモートおよびローカルサーバーへのアドレスおよび接続パラメータのセットを構成するために使用されるクラスター名。                                                                                                                                                                                                                                                                                                                                                                                                    |
| `connection_string` | `storage_account_url` — connection_string にはアカウント名とキーが含まれます（[Create connection string](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string?toc=%2Fazure%2Fstorage%2Fblobs%2Ftoc.json&bc=%2Fazure%2Fstorage%2Fblobs%2Fbreadcrumb%2Ftoc.json#configure-a-connection-string-for-an-azure-storage-account) を参照）。あるいは、ここにはストレージアカウントの URL を指定し、アカウント名とアカウントキーは別パラメータ（`account_name` と `account_key`）として指定することもできます。 | 
| `container_name`    | コンテナー名                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
| `blobpath`          | ファイルパス。読み取り専用モードでは、次のワイルドカードをサポートします: `*`, `**`, `?`, `{abc,def}` および `{N..M}`。ここで `N`, `M` は数値、`'abc'`, `'def'` は文字列です。                                                                                                                                                                                                                                                                                                                                |
| `account_name`      | `storage_account_url` が使用されている場合、ここでアカウント名を指定できます。                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `account_key`       | `storage_account_url` が使用されている場合、ここでアカウントキーを指定できます。                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `format`            | ファイルの[フォーマット](/sql-reference/formats)。                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `compression`       | サポートされる値: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`。デフォルトでは、ファイル拡張子から圧縮形式を自動検出します（`auto` を指定した場合と同じ）。                                                                                                                                                                                                                                                                                                                                                |
| `structure`         | テーブルの構造。形式は `'column1_name column1_type, column2_name column2_type, ...'`。                                                                                                                                                                                                                                                                                                                                                                                                                            |



## 返される値 {#returned_value}

指定された構造を持ち、指定されたファイル内のデータを読み書きするためのテーブル。



## 例 {#examples}

[AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage) テーブルエンジンと同様に、ローカルでの Azure Storage 開発には Azurite エミュレーターを使用できます。詳細は[こちら](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage)を参照してください。以下では、Azurite がホスト名 `azurite1` で利用可能であると仮定します。

`cluster_simple` クラスター内のすべてのノードを使用して、ファイル `test_cluster_*.csv` の件数を取得します：

```sql
SELECT count(*) FROM azureBlobStorageCluster(
        'cluster_simple', 'http://azurite1:10000/devstoreaccount1', 'testcontainer', 'test_cluster_count.csv', 'devstoreaccount1',
        'Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==', 'CSV',
        'auto', 'key UInt64')
```


## 共有アクセス署名 (SAS) の使用 {#using-shared-access-signatures-sas-sas-tokens}

使用例については [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage#using-shared-access-signatures-sas-sas-tokens) を参照してください。



## 関連項目 {#related}

- [AzureBlobStorage エンジン](../../engines/table-engines/integrations/azureBlobStorage.md)
- [azureBlobStorage テーブル関数](../../sql-reference/table-functions/azureBlobStorage.md)
