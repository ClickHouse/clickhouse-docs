---
slug: /sql-reference/table-functions/hudiCluster
sidebar_position: 86
sidebar_label: hudiCluster
title: "hudiCluster テーブル関数"
description: "hudi テーブル関数の拡張です。指定されたクラスター内の多くのノードで、Amazon S3 の Apache Hudi テーブルからファイルを並行処理することができます。"
---


# hudiCluster テーブル関数

これは [hudi](sql-reference/table-functions/hudi.md) テーブル関数の拡張です。

指定されたクラスター内の多くのノードで、Amazon S3 の Apache [Hudi](https://hudi.apache.org/) テーブルからファイルを並行処理することができます。イニシエーターはクラスター内のすべてのノードへの接続を作成し、各ファイルを動的に派遣します。ワーカーノードは、イニシエーターに次の処理タスクを問い合わせ、それを処理します。これはすべてのタスクが終了するまで繰り返されます。

**構文**

``` sql
hudiCluster(cluster_name, url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
```

**引数**

- `cluster_name` — リモートおよびローカルサーバーへのアドレスと接続パラメータのセットを構築するために使用されるクラスターの名前。

- その他の引数の説明は、同等の [hudi](sql-reference/table-functions/hudi.md) テーブル関数の引数の説明と一致します。

**返される値**

指定された構造のテーブルは、S3 内の指定された Hudi テーブルからクラスターのデータを読み取ります。

**関連項目**

- [Hudi エンジン](engines/table-engines/integrations/hudi.md)
- [Hudi テーブル関数](sql-reference/table-functions/hudi.md)
