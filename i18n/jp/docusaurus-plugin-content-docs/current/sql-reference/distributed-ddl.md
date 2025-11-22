---
description: 'Distributed DDL のドキュメント'
sidebar_label: 'Distributed DDL'
sidebar_position: 3
slug: /sql-reference/distributed-ddl
title: '分散 DDL クエリ（ON CLUSTER 句）'
doc_type: 'reference'
---

デフォルトでは、`CREATE`、`DROP`、`ALTER`、`RENAME` クエリは、それらが実行される現在のサーバーにのみ影響します。クラスタ環境では、`ON CLUSTER` 句を使用して、このようなクエリを分散実行できます。

たとえば、次のクエリは、`cluster` 内の各ホスト上に `all_hits` という `Distributed` テーブルを作成します。

```sql
CREATE TABLE IF NOT EXISTS all_hits ON CLUSTER cluster (p Date, i Int32) ENGINE = Distributed(cluster, default, hits)
```

これらのクエリを正しく実行するためには、各ホストが同じクラスター定義を持っている必要があります（設定の同期を容易にするために、ZooKeeper を利用した置換機能を使用できます）。また、各ホストは ZooKeeper サーバーにも接続していなければなりません。

クエリのローカル版は、たとえ一部のホストが現在利用不能であっても、最終的にはクラスター内の各ホスト上で実行されます。

:::important\
単一のホスト内におけるクエリの実行順序は保証されます。
:::
