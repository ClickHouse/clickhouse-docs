---
description: 'Apache Iceberg から指定されたクラスタ内の多数のノードでファイルを並行処理することを可能にする iceberg テーブル関数の拡張。'
sidebar_label: 'icebergCluster'
sidebar_position: 91
slug: /sql-reference/table-functions/icebergCluster
title: 'icebergCluster'
---


# icebergCluster テーブル関数

これは、[iceberg](/sql-reference/table-functions/iceberg.md) テーブル関数の拡張です。

Apache [Iceberg](https://iceberg.apache.org/) から指定されたクラスタ内の多数のノードでファイルを並行処理することを可能にします。イニシエーターでは、クラスタ内のすべてのノードへの接続を作成し、各ファイルを動的にディスパッチします。ワーカーノードでは、イニシエーターに次の処理タスクを尋ね、それを処理します。すべてのタスクが終了するまでこの操作が繰り返されます。

**構文**

```sql
icebergS3Cluster(cluster_name, url [, NOSIGN | access_key_id, secret_access_key, [session_token]] [,format] [,compression_method])
icebergS3Cluster(cluster_name, named_collection[, option=value [,..]])

icebergAzureCluster(cluster_name, connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])
icebergAzureCluster(cluster_name, named_collection[, option=value [,..]])

icebergHDFSCluster(cluster_name, path_to_table, [,format] [,compression_method])
icebergHDFSCluster(cluster_name, named_collection[, option=value [,..]])
```

**引数**

- `cluster_name` — リモートおよびローカルサーバーへのアドレスと接続パラメータのセットを構築するために使用されるクラスターの名前。

- その他の引数の説明は、同等の [iceberg](/sql-reference/table-functions/iceberg.md) テーブル関数の引数の説明と一致します。

**返される値**

指定された Iceberg テーブルからクラスタ内のデータを読み取るための指定の構造を持つテーブル。

**例**

```sql
SELECT * FROM icebergS3Cluster('cluster_simple', 'http://test.s3.amazonaws.com/clickhouse-bucket/test_table', 'test', 'test')
```

**関連項目**

- [Icebergエンジン](/engines/table-engines/integrations/iceberg.md)
- [Iceberg テーブル関数](sql-reference/table-functions/iceberg.md)
