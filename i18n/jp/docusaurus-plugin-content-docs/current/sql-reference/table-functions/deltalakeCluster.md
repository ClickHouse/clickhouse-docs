---
slug: /sql-reference/table-functions/deltalakeCluster
sidebar_position: 46
sidebar_label: deltaLakeCluster
title: "deltaLakeCluster"
description: "This is an extension to the deltaLake table function."
---


# deltaLakeCluster テーブル関数

これは [deltaLake](sql-reference/table-functions/deltalake.md) テーブル関数への拡張です。

指定されたクラスター内の多くのノードから、Amazon S3 の [Delta Lake](https://github.com/delta-io/delta) テーブルのファイルを並行して処理することを許可します。イニシエーターはクラスター内のすべてのノードへの接続を作成し、各ファイルを動的に配信します。ワーカーノードでは、次の処理タスクについてイニシエーターに問い合わせてそれを処理します。これをすべてのタスクが完了するまで繰り返します。

**構文**

``` sql
deltaLakeCluster(cluster_name, url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
```

**引数**

- `cluster_name` — リモートおよびローカルサーバーへのアドレスと接続パラメータのセットを構築するために使用されるクラスターの名前。

- 他のすべての引数の説明は、同等の [deltaLake](sql-reference/table-functions/deltalake.md) テーブル関数の引数の説明と一致します。

**戻り値**

指定された Delta Lake テーブルからクラスターのデータを読み取るための指定された構造を持つテーブル。

**参考**

- [deltaLake エンジン](engines/table-engines/integrations/deltalake.md)
- [deltaLake テーブル関数](sql-reference/table-functions/deltalake.md)
