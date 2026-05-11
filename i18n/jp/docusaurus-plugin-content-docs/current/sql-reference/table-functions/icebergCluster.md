---
description: '指定されたクラスタ内の多数のノードから Apache Iceberg のファイルを並列処理できる、iceberg テーブル関数の拡張機能。'
sidebar_label: 'icebergCluster'
sidebar_position: 91
slug: /sql-reference/table-functions/icebergCluster
title: 'icebergCluster'
doc_type: 'reference'
---

# icebergCluster テーブル関数 \{#icebergcluster-table-function\}

これは、[iceberg](/sql-reference/table-functions/iceberg.md) テーブル関数の拡張機能です。

指定されたクラスタ内の多数のノードで、Apache [Iceberg](https://iceberg.apache.org/) のファイルを並列処理できるようにします。イニシエータでは、クラスタ内のすべてのノードへの接続を作成し、各ファイルを動的に振り分けます。ワーカーノードでは、次に処理するタスクをイニシエータに問い合わせて処理します。これを、すべてのタスクが完了するまで繰り返します。

## 構文 \{#syntax\}

```sql
icebergS3Cluster(cluster_name, url [, NOSIGN | access_key_id, secret_access_key, [session_token]] [,format] [,compression_method] [,extra_credentials])
icebergS3Cluster(cluster_name, named_collection[, option=value [,..]])

icebergAzureCluster(cluster_name, connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])
icebergAzureCluster(cluster_name, named_collection[, option=value [,..]])

icebergHDFSCluster(cluster_name, path_to_table, [,format] [,compression_method])
icebergHDFSCluster(cluster_name, named_collection[, option=value [,..]])
```


## 引数 \{#arguments\}

- `cluster_name` — リモートサーバーおよびローカルサーバーへのアドレスと接続パラメータのセットを構築するために使用されるクラスタの名前。
- そのほかのすべての引数の説明は、同等の [iceberg](/sql-reference/table-functions/iceberg.md) テーブル関数における引数の説明と一致します。
- オプションの `extra_credentials` パラメータを使用すると、ClickHouse Cloud でロールベースのアクセスに使用する `role_arn` を渡すことができます。設定手順については [Secure S3](/cloud/data-sources/secure-s3) を参照してください。

**戻り値**

指定された Iceberg テーブルで、指定された構造を持ち、クラスタからデータを読み取るためのテーブル。

**例**

```sql
SELECT * FROM icebergS3Cluster('cluster_simple', 'http://test.s3.amazonaws.com/clickhouse-bucket/test_table', 'test', 'test')
```

## 仮想カラム \{#virtual-columns\}

* `_path` — ファイルへのパス。型: `LowCardinality(String)`。
* `_file` — ファイル名。型: `LowCardinality(String)`。
* `_size` — ファイルサイズ (バイト単位) 。型: `Nullable(UInt64)`。ファイルサイズが不明な場合、値は `NULL` です。
* `_time` — ファイルの最終更新時刻。型: `Nullable(DateTime)`。時刻が不明な場合、値は `NULL` です。
* `_etag` — ファイルの ETag。型: `LowCardinality(String)`。ETag が不明な場合、値は `NULL` です。

**関連項目**

* [Iceberg エンジン](/engines/table-engines/integrations/iceberg.md)
* [Iceberg テーブル関数](sql-reference/table-functions/iceberg.md)