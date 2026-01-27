---
description: 'これは deltaLake テーブル関数の拡張です。'
sidebar_label: 'deltaLakeCluster'
sidebar_position: 46
slug: /sql-reference/table-functions/deltalakeCluster
title: 'deltaLakeCluster'
doc_type: 'reference'
---

# deltaLakeCluster テーブル関数 \{#deltalakecluster-table-function\}

これは [deltaLake](sql-reference/table-functions/deltalake.md) テーブル関数の拡張です。

指定したクラスタ内の多数のノードから、Amazon S3 上の [Delta Lake](https://github.com/delta-io/delta) テーブルのファイルを並列処理できるようにします。イニシエーターはクラスタ内のすべてのノードへの接続を確立し、各ファイルを動的に割り振ります。ワーカーノードは、処理すべき次のタスクについてイニシエーターに問い合わせ、そのタスクを処理します。すべてのタスクが完了するまで、これが繰り返されます。

## 構文 \{#syntax\}

```sql
deltaLakeCluster(cluster_name, url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
deltaLakeCluster(cluster_name, named_collection[, option=value [,..]])

deltaLakeS3Cluster(cluster_name, url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
deltaLakeS3Cluster(cluster_name, named_collection[, option=value [,..]])

deltaLakeAzureCluster(cluster_name, connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])
deltaLakeAzureCluster(cluster_name, named_collection[, option=value [,..]])
```

`deltaLakeS3Cluster` は `deltaLakeCluster` のエイリアスであり、どちらも S3 向けです。`

## 引数 \{#arguments\}

- `cluster_name` — リモートおよびローカルサーバーへのアドレスや接続パラメータのセットを構成するために使用されるクラスタの名前。

- その他すべての引数の説明は、同等の [deltaLake](sql-reference/table-functions/deltalake.md) テーブル関数における引数の説明と同一です。

## 返される値 \{#returned_value\}

S3 内の指定された Delta Lake テーブルのうち、クラスタからデータを読み取るために指定された構造を持つテーブル。

## 仮想カラム \{#virtual-columns\}

- `_path` — ファイルへのパス。型: `LowCardinality(String)`。
- `_file` — ファイル名。型: `LowCardinality(String)`。
- `_size` — ファイルのサイズ（バイト単位）。型: `Nullable(UInt64)`。ファイルサイズが不明な場合、値は `NULL` になります。
- `_time` — ファイルの最終更新時刻。型: `Nullable(DateTime)`。時刻が不明な場合、値は `NULL` になります。
- `_etag` — ファイルの ETag。型: `LowCardinality(String)`。ETag が不明な場合、値は `NULL` になります。

## 関連項目 \{#related\}

- [deltaLake エンジン](engines/table-engines/integrations/deltalake.md)
- [deltaLake テーブル関数](sql-reference/table-functions/deltalake.md)
