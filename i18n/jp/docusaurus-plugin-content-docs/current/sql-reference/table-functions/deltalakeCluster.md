---
'description': 'これは deltaLake テーブル関数への拡張です。'
'sidebar_label': 'deltaLakeCluster'
'sidebar_position': 46
'slug': '/sql-reference/table-functions/deltalakeCluster'
'title': 'deltaLakeCluster'
'doc_type': 'reference'
---


# deltaLakeCluster テーブル関数

これは [deltaLake](sql-reference/table-functions/deltalake.md) テーブル関数の拡張です。

指定されたクラスター内の多数のノードから Amazon S3 の [Delta Lake](https://github.com/delta-io/delta) テーブルのファイルを並列に処理できるようにします。イニシエーター上で、クラスター内のすべてのノードへの接続を作成し、各ファイルを動的に配信します。ワーカーノードでは、イニシエーターに次の処理タスクを尋ね、そのタスクを処理します。すべてのタスクが完了するまでこのプロセスは繰り返されます。

## 構文 {#syntax}

```sql
deltaLakeCluster(cluster_name, url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
deltaLakeCluster(cluster_name, named_collection[, option=value [,..]])

deltaLakeS3Cluster(cluster_name, url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
deltaLakeS3Cluster(cluster_name, named_collection[, option=value [,..]])

deltaLakeAzureCluster(cluster_name, connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])
deltaLakeAzureCluster(cluster_name, named_collection[, option=value [,..]])
```
`deltaLakeS3Cluster` は `deltaLakeCluster` のエイリアスであり、どちらも S3 用です。

## 引数 {#arguments}

- `cluster_name` — リモートおよびローカルサーバーへのアドレスと接続パラメータのセットを構築するために使用されるクラスターの名前。

- その他すべての引数の説明は、対応する [deltaLake](sql-reference/table-functions/deltalake.md) テーブル関数の引数の説明と一致します。

## 戻り値 {#returned_value}

指定された Delta Lake テーブルからクラスターのデータを読み取るための指定された構造のテーブル。

## 仮想カラム {#virtual-columns}

- `_path` — ファイルのパス。タイプ：`LowCardinality(String)`。
- `_file` — ファイルの名前。タイプ：`LowCardinality(String)`。
- `_size` — ファイルのサイズ（バイト単位）。タイプ：`Nullable(UInt64)`。ファイルサイズが不明な場合、値は `NULL` です。
- `_time` — ファイルの最終変更時刻。タイプ：`Nullable(DateTime)`。時間が不明な場合、値は `NULL` です。
- `_etag` — ファイルの etag。タイプ：`LowCardinality(String)`。etag が不明な場合、値は `NULL` です。

## 関連 {#related}

- [deltaLake エンジン](engines/table-engines/integrations/deltalake.md)
- [deltaLake テーブル関数](sql-reference/table-functions/deltalake.md)
