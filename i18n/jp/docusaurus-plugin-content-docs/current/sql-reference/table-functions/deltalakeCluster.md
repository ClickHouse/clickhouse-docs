---
description: 'これは deltaLake テーブル関数に対する拡張です。'
sidebar_label: 'deltaLakeCluster'
sidebar_position: 46
slug: /sql-reference/table-functions/deltalakeCluster
title: 'deltaLakeCluster'
doc_type: 'reference'
---



# deltaLakeCluster テーブル関数

これは [deltaLake](sql-reference/table-functions/deltalake.md) テーブル関数の拡張です。

指定したクラスタ内の複数ノードから、Amazon S3 上の [Delta Lake](https://github.com/delta-io/delta) テーブルのファイルを並列に処理できるようにします。イニシエーターはクラスタ内のすべてのノードへの接続を確立し、各ファイルを動的に振り分けます。ワーカーノードは、処理すべき次のタスクをイニシエーターに問い合わせてから、それを処理します。これは、すべてのタスクが完了するまで繰り返されます。



## 構文 {#syntax}

```sql
deltaLakeCluster(cluster_name, url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
deltaLakeCluster(cluster_name, named_collection[, option=value [,..]])

deltaLakeS3Cluster(cluster_name, url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
deltaLakeS3Cluster(cluster_name, named_collection[, option=value [,..]])

deltaLakeAzureCluster(cluster_name, connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])
deltaLakeAzureCluster(cluster_name, named_collection[, option=value [,..]])
```

`deltaLakeS3Cluster`は`deltaLakeCluster`のエイリアスであり、両方ともS3用です。


## 引数 {#arguments}

- `cluster_name` — リモートサーバーおよびローカルサーバーへのアドレスセットと接続パラメータを構築するために使用されるクラスタ名。

- その他すべての引数の説明は、同等の [deltaLake](sql-reference/table-functions/deltalake.md) テーブル関数の引数説明と同じです。


## 戻り値 {#returned_value}

S3内の指定されたDelta Lakeテーブルのクラスタからデータを読み取るための、指定された構造を持つテーブル。


## 仮想カラム {#virtual-columns}

- `_path` — ファイルへのパス。型: `LowCardinality(String)`。
- `_file` — ファイル名。型: `LowCardinality(String)`。
- `_size` — ファイルのサイズ(バイト単位)。型: `Nullable(UInt64)`。ファイルサイズが不明な場合、値は `NULL` です。
- `_time` — ファイルの最終更新時刻。型: `Nullable(DateTime)`。時刻が不明な場合、値は `NULL` です。
- `_etag` — ファイルのetag。型: `LowCardinality(String)`。etagが不明な場合、値は `NULL` です。


## 関連項目 {#related}

- [deltaLakeエンジン](engines/table-engines/integrations/deltalake.md)
- [deltaLakeテーブル関数](sql-reference/table-functions/deltalake.md)
