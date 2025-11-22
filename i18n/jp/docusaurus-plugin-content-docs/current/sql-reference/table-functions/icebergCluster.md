---
description: '指定したクラスタ内の多数のノードから Apache Iceberg のファイルを並列処理できるようにする、iceberg テーブル関数の拡張。'
sidebar_label: 'icebergCluster'
sidebar_position: 91
slug: /sql-reference/table-functions/icebergCluster
title: 'icebergCluster'
doc_type: 'reference'
---



# icebergCluster テーブル関数

これは、[iceberg](/sql-reference/table-functions/iceberg.md) テーブル関数を拡張したものです。

指定したクラスタ内の複数のノード上で、Apache [Iceberg](https://iceberg.apache.org/) のファイルを並列に処理できるようにします。イニシエータでは、クラスタ内のすべてのノードへの接続を確立し、各ファイルを動的に割り当てます。ワーカーノードでは、処理すべき次のタスクをイニシエータに要求し、そのタスクを処理します。これは、すべてのタスクが完了するまで繰り返されます。



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

- `cluster_name` — リモートサーバーおよびローカルサーバーへのアドレスセットと接続パラメータを構築するために使用されるクラスタ名。
- その他すべての引数の説明は、同等の[iceberg](/sql-reference/table-functions/iceberg.md)テーブル関数の引数説明と一致します。

**戻り値**

指定されたIcebergテーブル内のクラスタからデータを読み取るための、指定された構造を持つテーブル。

**例**

```sql
SELECT * FROM icebergS3Cluster('cluster_simple', 'http://test.s3.amazonaws.com/clickhouse-bucket/test_table', 'test', 'test')
```


## 仮想カラム {#virtual-columns}

- `_path` — ファイルへのパス。型: `LowCardinality(String)`。
- `_file` — ファイル名。型: `LowCardinality(String)`。
- `_size` — ファイルのサイズ(バイト単位)。型: `Nullable(UInt64)`。ファイルサイズが不明な場合、値は `NULL` です。
- `_time` — ファイルの最終更新時刻。型: `Nullable(DateTime)`。時刻が不明な場合、値は `NULL` です。
- `_etag` — ファイルのetag。型: `LowCardinality(String)`。etagが不明な場合、値は `NULL` です。

**関連項目**

- [Icebergエンジン](/engines/table-engines/integrations/iceberg.md)
- [Icebergテーブル関数](sql-reference/table-functions/iceberg.md)
