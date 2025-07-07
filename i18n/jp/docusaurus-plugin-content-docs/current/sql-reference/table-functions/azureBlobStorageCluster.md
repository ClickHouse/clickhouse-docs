---
'description': '指定されたクラスタ内の多数のノードでAzure Blobストレージからファイルを並行処理することを可能にします。'
'sidebar_label': 'Azure Blobストレージクラスタ'
'sidebar_position': 15
'slug': '/sql-reference/table-functions/azureBlobStorageCluster'
'title': 'azureBlobStorageCluster'
---




# azureBlobStorageCluster テーブル関数

指定されたクラスタ内の多数のノードで、[Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs)からファイルを並列処理することを可能にします。イニシエーターでは、クラスタ内のすべてのノードへの接続を作成し、S3ファイルパスのアスタリスクを開示し、各ファイルを動的に配信します。ワーカーノードでは、次に処理するタスクについてイニシエーターに問い合わせ、それを処理します。すべてのタスクが完了するまでこれを繰り返します。
このテーブル関数は、[s3Cluster関数](../../sql-reference/table-functions/s3Cluster.md)に似ています。

## 構文 {#syntax}

```sql
azureBlobStorageCluster(cluster_name, connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression, structure])
```

## 引数 {#arguments}

| 引数                | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
|---------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `cluster_name`      | リモートおよびローカルサーバーへのアドレスと接続パラメータのセットを構築するために使用されるクラスタの名前。                                                                                                                                                                                                                                                                                                                                                                                                 |
| `connection_string` | storage_account_url` — connection_string はアカウント名とキーを含みます（[接続文字列の作成](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string?toc=%2Fazure%2Fstorage%2Fblobs%2Ftoc.json&bc=%2Fazure%2Fstorage%2Fblobs%2Fbreadcrumb%2Ftoc.json#configure-a-connection-string-for-an-azure-storage-account））または、ここにストレージアカウントURLを提供し、アカウント名とアカウントキーを別のパラメータとして提供することもできます（パラメータaccount_nameおよびaccount_keyを参照）| 
| `container_name`    | コンテナ名                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
| `blobpath`          | ファイルパス。読み取り専用モードで次のワイルドカードをサポートします: `*`, `**`, `?`, `{abc,def}` および `{N..M}` ただし、`N`および `M` は数字、`'abc'` および `'def'` は文字列です。                                                                                                                                                                                                                                                                                                                                                          |
| `account_name`      | storage_account_url が使用される場合、ここでアカウント名を指定できます。                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `account_key`       | storage_account_url が使用される場合、ここでアカウントキーを指定できます。                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `format`            | ファイルの[形式](/sql-reference/formats)。                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `compression`       | サポートされている値: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`。デフォルトでは、ファイル拡張子によって圧縮を自動検出します。（`auto`に設定するのと同じです）。                                                                                                                                                                                                                                                                                                                                               |
| `structure`         | テーブルの構造。形式は `'column1_name column1_type, column2_name column2_type, ...'`。                                                                                                                                                                                                                                                                                                                                                                                                                          |

## 返される値 {#returned_value}

指定されたファイル内のデータを読み書きするための、指定された構造のテーブル。

## 例 {#examples}

[AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage) テーブルエンジンと同様に、ユーザーはローカル Azure Storage 開発のために Azurite エミュレーターを使用できます。詳細は[こちら](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage)をご覧ください。以下では、Azurite がホスト名 `azurite1` で利用可能であると仮定します。

クラスタ `cluster_simple` のすべてのノードを使用して、ファイル `test_cluster_*.csv` のカウントを選択します:

```sql
SELECT count(*) from azureBlobStorageCluster(
        'cluster_simple', 'http://azurite1:10000/devstoreaccount1', 'testcontainer', 'test_cluster_count.csv', 'devstoreaccount1',
        'Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==', 'CSV',
        'auto', 'key UInt64')
```

## 共有アクセス署名 (SAS) の使用 {#using-shared-access-signatures-sas-sas-tokens}

例については、[azureBlobStorage](/sql-reference/table-functions/azureBlobStorage#using-shared-access-signatures-sas-sas-tokens) を参照してください。

## 関連 {#related}

- [AzureBlobStorage エンジン](../../engines/table-engines/integrations/azureBlobStorage.md)
- [azureBlobStorage テーブル関数](../../sql-reference/table-functions/azureBlobStorage.md)
