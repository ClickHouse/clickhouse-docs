---
slug: /sql-reference/table-functions/hudiCluster
sidebar_position: 86
sidebar_label: hudiCluster
title: "hudiCluster テーブル関数"
---
これは [hudi](/sql-reference/table-functions/hudi.md) テーブル関数の拡張です。

Amazon S3 にある Apache [Hudi](https://hudi.apache.org/) テーブルのファイルを、指定されたクラスター内の複数のノードから並行処理できるようにします。イニシエーターがクラスター内のすべてのノードに接続を作成し、各ファイルを動的に配信します。ワーカーノードでは、次に処理するタスクについてイニシエーターに問い合わせ、そのタスクを処理します。この処理は、すべてのタスクが完了するまで繰り返されます。

**構文**

``` sql
hudiCluster(cluster_name, url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
```

**引数**

- `cluster_name` — リモートおよびローカルサーバーへの接続パラメータとアドレスのセットを構築するために使用されるクラスターの名前。

- その他の引数の説明は、同等の [hudi](/sql-reference/table-functions/hudi.md) テーブル関数の引数の説明と一致します。

**返される値**

指定された Hudi テーブルからクラスターのデータを読み取るための指定された構造のテーブル。

**関連情報**

- [Hudi エンジン](/engines/table-engines/integrations/hudi.md)
- [Hudi テーブル関数](/sql-reference/table-functions/hudi.md)
