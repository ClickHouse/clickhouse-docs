---
'description': 'An extension to the iceberg table function which allows processing
  files from Apache Iceberg in parallel from many nodes in a specified cluster.'
'sidebar_label': 'icebergCluster'
'sidebar_position': 91
'slug': '/sql-reference/table-functions/icebergCluster'
'title': 'icebergCluster'
---




# icebergCluster テーブル関数

これは [iceberg](/sql-reference/table-functions/iceberg.md) テーブル関数への拡張です。

指定されたクラスター内の多くのノードから Apache [Iceberg](https://iceberg.apache.org/) のファイルを並行して処理することを可能にします。イニシエーターでは、クラスター内のすべてのノードに接続を確立し、各ファイルを動的に配信します。ワーカーノードでは、イニシエーターに次のタスクを処理するように問い合わせ、それを処理します。これをすべてのタスクが完了するまで繰り返します。

## 構文 {#syntax}

```sql
icebergS3Cluster(cluster_name, url [, NOSIGN | access_key_id, secret_access_key, [session_token]] [,format] [,compression_method])
icebergS3Cluster(cluster_name, named_collection[, option=value [,..]])

icebergAzureCluster(cluster_name, connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])
icebergAzureCluster(cluster_name, named_collection[, option=value [,..]])

icebergHDFSCluster(cluster_name, path_to_table, [,format] [,compression_method])
icebergHDFSCluster(cluster_name, named_collection[, option=value [,..]])
```

## 引数 {#arguments}

- `cluster_name` — リモートおよびローカルサーバーへのアドレスと接続パラメータのセットを構築するために使用されるクラスターの名前。
- その他のすべての引数の説明は、同等の [iceberg](/sql-reference/table-functions/iceberg.md) テーブル関数の引数の説明と一致します。

**返される値**

指定された Iceberg テーブルからクラスターのデータを読み取るための指定された構造のテーブル。

**例**

```sql
SELECT * FROM icebergS3Cluster('cluster_simple', 'http://test.s3.amazonaws.com/clickhouse-bucket/test_table', 'test', 'test')
```

**参照**

- [Iceberg エンジン](/engines/table-engines/integrations/iceberg.md)
- [Iceberg テーブル関数](sql-reference/table-functions/iceberg.md)
