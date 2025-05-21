---
description: 'Apache Hudi テーブルに関する hudi テーブル関数の拡張です。指定されたクラスタ内の多くのノードで、Amazon S3 の Apache Hudi テーブルからファイルを並行して処理できます。'
sidebar_label: 'hudiCluster'
sidebar_position: 86
slug: /sql-reference/table-functions/hudiCluster
title: 'hudiCluster テーブル関数'
---


# hudiCluster テーブル関数

これは、[hudi](sql-reference/table-functions/hudi.md) テーブル関数の拡張です。

指定されたクラスタ内の多くのノードで、Amazon S3 の Apache [Hudi](https://hudi.apache.org/) テーブルからファイルを並行して処理できます。イニシエーターは、クラスタ内のすべてのノードへの接続を作成し、各ファイルを動的に配信します。ワーカーノードでは、イニシエーターに次に処理するタスクを尋ね、そのタスクを処理します。すべてのタスクが完了するまでこのプロセスを繰り返します。

**構文**

```sql
hudiCluster(cluster_name, url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
```

**引数**

- `cluster_name` — リモートおよびローカルサーバーへのアドレスと接続パラメータのセットを構築するために使用されるクラスタの名前。

- その他の引数の説明は、同等の [hudi](sql-reference/table-functions/hudi.md) テーブル関数の引数の説明と一致します。

**戻り値**

指定された Hudi テーブルからクラスタ内でデータを読み取るための指定された構造を持つテーブル。

**関連項目**

- [Hudi エンジン](engines/table-engines/integrations/hudi.md)
- [Hudi テーブル関数](sql-reference/table-functions/hudi.md)
