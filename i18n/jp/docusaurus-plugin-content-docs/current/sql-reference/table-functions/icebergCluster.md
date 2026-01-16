---
description: '指定したクラスタ内の複数ノードから Apache Iceberg ファイルを並列処理できる、iceberg テーブル関数の拡張機能。'
sidebar_label: 'icebergCluster'
sidebar_position: 91
slug: /sql-reference/table-functions/icebergCluster
title: 'icebergCluster'
doc_type: 'reference'
---

# icebergCluster テーブル関数 \\{#icebergcluster-table-function\\}

これは、[iceberg](/sql-reference/table-functions/iceberg.md) テーブル関数の拡張です。

指定されたクラスター内の複数のノードから Apache [Iceberg](https://iceberg.apache.org/) のファイルを並列処理できるようにします。イニシエーターはクラスター内のすべてのノードに接続し、各ファイルを動的に割り当てます。ワーカー ノードは、処理すべき次のタスクをイニシエーターに問い合わせてから、それを処理します。これは、すべてのタスクが完了するまで繰り返されます。

## 構文 \\{#syntax\\}

```sql
icebergS3Cluster(cluster_name, url [, NOSIGN | access_key_id, secret_access_key, [session_token]] [,format] [,compression_method])
icebergS3Cluster(cluster_name, named_collection[, option=value [,..]])

icebergAzureCluster(cluster_name, connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])
icebergAzureCluster(cluster_name, named_collection[, option=value [,..]])

icebergHDFSCluster(cluster_name, path_to_table, [,format] [,compression_method])
icebergHDFSCluster(cluster_name, named_collection[, option=value [,..]])
```

## 引数 \\{#arguments\\}

* `cluster_name` — リモートおよびローカルサーバーへのアドレスと接続パラメータの集合を構成するために使用されるクラスター名。
* 他のすべての引数の説明は、同等の [iceberg](/sql-reference/table-functions/iceberg.md) テーブル関数における引数の説明と同一です。

**戻り値**

指定された Iceberg テーブルに対して、クラスターからデータを読み取るための、指定された構造を持つテーブル。

**例**

```sql
SELECT * FROM icebergS3Cluster('cluster_simple', 'http://test.s3.amazonaws.com/clickhouse-bucket/test_table', 'test', 'test')
```

## 仮想カラム \\{#virtual-columns\\}

- `_path` — ファイルへのパス。型: `LowCardinality(String)`。
- `_file` — ファイル名。型: `LowCardinality(String)`。
- `_size` — ファイルサイズ（バイト単位）。型: `Nullable(UInt64)`。ファイルサイズが不明な場合、値は `NULL` です。
- `_time` — ファイルの最終更新時刻。型: `Nullable(DateTime)`。時刻が不明な場合、値は `NULL` です。
- `_etag` — ファイルの ETag。型: `LowCardinality(String)`。ETag が不明な場合、値は `NULL` です。

**関連項目**

- [Iceberg エンジン](/engines/table-engines/integrations/iceberg.md)
- [Iceberg テーブル関数](sql-reference/table-functions/iceberg.md)
