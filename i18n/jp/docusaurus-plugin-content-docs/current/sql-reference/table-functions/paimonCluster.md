---
description: '指定したクラスタ内の複数ノードから Apache Paimon のファイルを並列処理するための paimon テーブル関数の拡張機能。'
sidebar_label: 'paimonCluster'
sidebar_position: 91
slug: /sql-reference/table-functions/paimonCluster
title: 'paimonCluster'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# paimonCluster テーブル関数

<ExperimentalBadge />

これは [paimon](/sql-reference/table-functions/paimon.md) テーブル関数を拡張したものです。

指定したクラスター内の複数ノードから、Apache [Paimon](https://paimon.apache.org/) のファイルを並列に処理できるようにします。イニシエーターでは、クラスター内のすべてのノードへの接続を確立し、各ファイルを動的に割り当てます。ワーカーノードでは、処理すべき次のタスクをイニシエーターに問い合わせ、そのタスクを処理します。これは、すべてのタスクが完了するまで繰り返されます。



## 構文 {#syntax}

```sql
paimonS3Cluster(cluster_name, url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])

paimonAzureCluster(cluster_name, connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])

paimonHDFSCluster(cluster_name, path_to_table, [,format] [,compression_method])
```


## 引数 {#arguments}

- `cluster_name` — リモートサーバーおよびローカルサーバーへのアドレスセットと接続パラメータを構築するために使用されるクラスタ名。
- その他すべての引数の説明は、対応する [paimon](/sql-reference/table-functions/paimon.md) テーブル関数の引数の説明と同じです。

**戻り値**

指定されたPaimonテーブル内のクラスタからデータを読み取るための、指定された構造を持つテーブル。


## 仮想カラム {#virtual-columns}

- `_path` — ファイルへのパス。型: `LowCardinality(String)`
- `_file` — ファイル名。型: `LowCardinality(String)`
- `_size` — ファイルのサイズ(バイト単位)。型: `Nullable(UInt64)`。ファイルサイズが不明な場合、値は `NULL` です。
- `_time` — ファイルの最終更新時刻。型: `Nullable(DateTime)`。時刻が不明な場合、値は `NULL` です。
- `_etag` — ファイルのetag。型: `LowCardinality(String)`。etagが不明な場合、値は `NULL` です。

**関連項目**

- [Paimonテーブル関数](sql-reference/table-functions/paimon.md)
