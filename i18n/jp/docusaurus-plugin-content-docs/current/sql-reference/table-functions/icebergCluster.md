---
slug: /sql-reference/table-functions/icebergCluster
sidebar_position: 91
sidebar_label: icebergCluster
title: "icebergCluster"
description: "指定したクラスター内の複数のノードからApache Icebergのファイルを並行処理するためのicebergテーブル関数の拡張です。"
---


# icebergCluster テーブル関数

これは[iceberg](/sql-reference/table-functions/iceberg.md)テーブル関数の拡張です。

指定したクラスター内の複数のノードからApache [Iceberg](https://iceberg.apache.org/)のファイルを並行処理することを可能にします。イニシエーター上で、クラスター内のすべてのノードへの接続を作成し、各ファイルを動的にディスパッチします。ワーカーノードでは、イニシエーターに次に処理するタスクを尋ね、それを処理します。これはすべてのタスクが完了するまで繰り返されます。

**構文**

``` sql
icebergS3Cluster(cluster_name, url [, NOSIGN | access_key_id, secret_access_key, [session_token]] [,format] [,compression_method])
icebergS3Cluster(cluster_name, named_collection[, option=value [,..]])

icebergAzureCluster(cluster_name, connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])
icebergAzureCluster(cluster_name, named_collection[, option=value [,..]])

icebergHDFSCluster(cluster_name, path_to_table, [,format] [,compression_method])
icebergHDFSCluster(cluster_name, named_collection[, option=value [,..]])
```

**引数**

- `cluster_name` — リモートおよびローカルサーバーへのアドレスと接続パラメータのセットを構築するために使用されるクラスターの名前です。

- その他のすべての引数の説明は、同等の[iceberg](/sql-reference/table-functions/iceberg.md)テーブル関数の引数の説明と一致します。

**返される値**

指定されたIcebergテーブルからクラスターのデータを読み取るための指定された構造のテーブルです。

**例**

```sql
SELECT * FROM icebergS3Cluster('cluster_simple', 'http://test.s3.amazonaws.com/clickhouse-bucket/test_table', 'test', 'test')
```

**関連情報**

- [Icebergエンジン](/engines/table-engines/integrations/iceberg.md)
- [Icebergテーブル関数](sql-reference/table-functions/iceberg.md)
