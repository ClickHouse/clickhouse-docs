---
'description': '指定したクラスター内の多くのノードでAzure Blobストレージからファイルを並行して処理できるようにします。'
'sidebar_label': 'azureBlobStorageCluster'
'sidebar_position': 15
'slug': '/sql-reference/table-functions/azureBlobStorageCluster'
'title': 'azureBlobStorageCluster'
'doc_type': 'reference'
---


# azureBlobStorageCluster テーブル関数

指定されたクラスタ内の多くのノードでファイルを並列処理できるようにします。[Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) からのファイルです。イニシエーターでクラスター内のすべてのノードへの接続を作成し、S3ファイルパスのアスタリスクを開示し、各ファイルを動的に配信します。ワーカーノードでは、イニシエーターに次の処理タスクを尋ね、それを処理します。すべてのタスクが完了するまで、この処理は繰り返されます。このテーブル関数は、[s3Cluster 関数](../../sql-reference/table-functions/s3Cluster.md)に似ています。

## 構文 {#syntax}

```sql
azureBlobStorageCluster(cluster_name, connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression, structure])
```

## 引数 {#arguments}

| 引数                    | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
|-------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `cluster_name`          | リモートおよびローカルサーバーへのアドレスと接続パラメータのセットを構築するために使用されるクラスタの名前。                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `connection_string`     | storage_account_url` — connection_string にはアカウント名とキーが含まれます ([接続文字列の作成](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string?toc=%2Fazure%2Fstorage%2Fblobs%2Ftoc.json&bc=%2Fazure%2Fstorage%2Fblobs%2Fbreadcrumb%2Ftoc.json#configure-a-connection-string-for-an-azure-storage-account))。ここでストレージアカウントのURLを提供し、アカウント名とアカウントキーを別のパラメータとして指定することもできます（パラメータ account_name および account_key を参照）。 |
| `container_name`        | コンテナ名                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `blobpath`              | ファイルパス。読み取り専用モードで次のワイルドカードをサポートします: `*`, `**`, `?`, `{abc,def}` および `{N..M}` 。（ここで、`N`、`M` は数字、`'abc'`、`'def'` は文字列です。）                                                                                                                                                                                                                                                                            |
| `account_name`          | storage_account_url が使用されている場合、ここでアカウント名を指定できます。                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `account_key`           | storage_account_url が使用されている場合、ここでアカウントキーを指定できます。                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `format`                | ファイルの[形式](/sql-reference/formats)。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `compression`           | サポートされている値: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`。デフォルトでは、ファイルの拡張子によって圧縮を自動検出します。（`auto` に設定するのと同じです。）                                                                                                                                                                                                                                                                                                              |
| `structure`             | テーブルの構造。形式は `'column1_name column1_type, column2_name column2_type, ...'` です。                                                                                                                                                                                                                                                                                                                                                                                                                                        |

## 戻り値 {#returned_value}

指定された構造のテーブルが返され、指定されたファイルからデータの読み書きができます。

## 例 {#examples}

[AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage) テーブルエンジンと同様に、ユーザーはローカルの Azure Storage 開発に Azurite エミュレーターを使用できます。詳細は[こちら](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage)を参照してください。以下では、Azurite がホスト名 `azurite1` で使用できると仮定します。

`cluster_simple` クラスター内のすべてのノードを使用して、ファイル `test_cluster_*.csv` のカウントを選択します：

```sql
SELECT count(*) FROM azureBlobStorageCluster(
        'cluster_simple', 'http://azurite1:10000/devstoreaccount1', 'testcontainer', 'test_cluster_count.csv', 'devstoreaccount1',
        'Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==', 'CSV',
        'auto', 'key UInt64')
```

## 共有アクセス署名（SAS）の使用 {#using-shared-access-signatures-sas-sas-tokens}

例については [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage#using-shared-access-signatures-sas-sas-tokens) を参照してください。

## 関連 {#related}

- [AzureBlobStorage エンジン](../../engines/table-engines/integrations/azureBlobStorage.md)
- [azureBlobStorage テーブル関数](../../sql-reference/table-functions/azureBlobStorage.md)
