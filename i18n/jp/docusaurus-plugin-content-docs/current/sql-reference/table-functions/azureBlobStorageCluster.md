---
description: '指定されたクラスター内の複数ノードを使用して、Azure Blob Storage 上のファイルを並列処理できるようにします。'
sidebar_label: 'azureBlobStorageCluster'
sidebar_position: 15
slug: /sql-reference/table-functions/azureBlobStorageCluster
title: 'azureBlobStorageCluster'
doc_type: 'reference'
---



# azureBlobStorageCluster テーブル関数

指定したクラスタ内の多数のノードで並列に、[Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) 上のファイルを処理することを可能にします。イニシエータノードでは、クラスタ内のすべてのノードへの接続を確立し、S3 ファイルパス内のアスタリスクを展開して、それぞれのファイルを動的に振り分けます。ワーカーノードでは、処理すべき次のタスクをイニシエータに問い合わせて、そのタスクを処理します。この処理は、すべてのタスクが完了するまで繰り返されます。
このテーブル関数は、[s3Cluster 関数](../../sql-reference/table-functions/s3Cluster.md) とよく似ています。



## 構文 {#syntax}

```sql
azureBlobStorageCluster(cluster_name, connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression, structure])
```


## 引数 {#arguments}

| 引数            | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cluster_name`      | リモートサーバーおよびローカルサーバーへのアドレスセットと接続パラメータを構築するために使用されるクラスタ名。                                                                                                                                                                                                                                                                                                                                                                                                 |
| `connection_string` | storage_account_url` — connection_stringにはアカウント名とキーが含まれます([接続文字列の作成](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string?toc=%2Fazure%2Fstorage%2Fblobs%2Ftoc.json&bc=%2Fazure%2Fstorage%2Fblobs%2Fbreadcrumb%2Ftoc.json#configure-a-connection-string-for-an-azure-storage-account))。または、ストレージアカウントのURLをここで指定し、アカウント名とアカウントキーを個別のパラメータとして指定することもできます(パラメータaccount_nameおよびaccount_keyを参照) |
| `container_name`    | コンテナ名                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `blobpath`          | ファイルパス。読み取り専用モードでは次のワイルドカードをサポートします:`*`、`**`、`?`、`{abc,def}`、`{N..M}`(ここで`N`、`M`は数値、`'abc'`、`'def'`は文字列)。                                                                                                                                                                                                                                                                                                                                          |
| `account_name`      | storage_account_urlを使用する場合、ここでアカウント名を指定できます                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `account_key`       | storage_account_urlを使用する場合、ここでアカウントキーを指定できます                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `format`            | ファイルの[フォーマット](/sql-reference/formats)。                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `compression`       | サポートされる値:`none`、`gzip/gz`、`brotli/br`、`xz/LZMA`、`zstd/zst`。デフォルトでは、ファイル拡張子によって圧縮形式を自動検出します(`auto`に設定した場合と同じ)。                                                                                                                                                                                                                                                                                                                                               |
| `structure`         | テーブルの構造。形式は`'column1_name column1_type, column2_name column2_type, ...'`。                                                                                                                                                                                                                                                                                                                                                                                                                     |


## 戻り値 {#returned_value}

指定されたファイル内のデータの読み取りまたは書き込みを行うための、指定された構造を持つテーブル。


## Examples {#examples}

[AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage)テーブルエンジンと同様に、ローカルのAzure Storage開発にはAzuriteエミュレータを使用できます。詳細は[こちら](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage)を参照してください。以下では、Azuriteがホスト名`azurite1`で利用可能であることを前提としています。

`cluster_simple`クラスタ内のすべてのノードを使用して、ファイル`test_cluster_*.csv`の件数を取得します:

```sql
SELECT count(*) FROM azureBlobStorageCluster(
        'cluster_simple', 'http://azurite1:10000/devstoreaccount1', 'testcontainer', 'test_cluster_count.csv', 'devstoreaccount1',
        'Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==', 'CSV',
        'auto', 'key UInt64')
```


## Shared Access Signature (SAS) の使用 {#using-shared-access-signatures-sas-sas-tokens}

例については [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage#using-shared-access-signatures-sas-sas-tokens) を参照してください。


## 関連項目 {#related}

- [AzureBlobStorage エンジン](../../engines/table-engines/integrations/azureBlobStorage.md)
- [azureBlobStorage テーブル関数](../../sql-reference/table-functions/azureBlobStorage.md)
