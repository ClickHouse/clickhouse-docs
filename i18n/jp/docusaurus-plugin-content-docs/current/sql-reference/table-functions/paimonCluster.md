---
description: '指定したクラスタ内の複数ノードで Apache Paimon のファイルを並列処理できる paimon テーブル関数の拡張機能。'
sidebar_label: 'paimonCluster'
sidebar_position: 91
slug: /sql-reference/table-functions/paimonCluster
title: 'paimonCluster'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

# paimonCluster Table Function \{#paimoncluster-table-function\}

<ExperimentalBadge />

これは、[paimon](/sql-reference/table-functions/paimon.md) テーブル関数の拡張機能です。

指定したクラスタ内の多数のノードから、Apache [Paimon](https://paimon.apache.org/) のファイルを並列に処理できます。イニシエーターではクラスタ内のすべてのノードへの接続を作成し、各ファイルを動的にディスパッチします。ワーカーノードでは、処理する次のタスクについてイニシエーターに問い合わせ、それを処理します。これは、すべてのタスクが完了するまで繰り返されます。

## 構文 \{#syntax\}

```sql
paimonS3Cluster(cluster_name, url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression] [,extra_credentials])

paimonAzureCluster(cluster_name, connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])

paimonHDFSCluster(cluster_name, path_to_table, [,format] [,compression_method])
```

## 引数 \{#arguments\}

* `cluster_name` — リモートおよびローカルサーバーへのアドレスと接続パラメータのセットを構成するために使用されるクラスタ名。
* その他すべての引数の説明は、同等の [paimon](/sql-reference/table-functions/paimon.md) テーブル関数における引数の説明と同一です。
* オプションの `extra_credentials` パラメータを使用すると、ClickHouse Cloud でロールベースのアクセスに必要な `role_arn` を渡すことができます。設定手順については [Secure S3](/cloud/data-sources/secure-s3) を参照してください。

**戻り値**

指定された Paimon テーブル内のクラスタからデータを読み取るための、指定した構造を持つテーブルが返されます。

## 仮想カラム \{#virtual-columns\}

* `_path` — ファイルへのパス。型: `LowCardinality(String)`。
* `_file` — ファイル名。型: `LowCardinality(String)`。
* `_size` — ファイルサイズ (バイト単位) 。型: `Nullable(UInt64)`。ファイルサイズが不明な場合、値は `NULL` です。
* `_time` — ファイルの最終更新時刻。型: `Nullable(DateTime)`。時刻が不明な場合、値は `NULL` です。
* `_etag` — ファイルの etag。型: `LowCardinality(String)`。etag が不明な場合、値は `NULL` です。

**関連項目**

* [Paimon テーブル関数](sql-reference/table-functions/paimon.md)