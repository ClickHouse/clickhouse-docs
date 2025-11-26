---
description: '分散 DDL のドキュメント'
sidebar_label: '分散 DDL'
sidebar_position: 3
slug: /sql-reference/distributed-ddl
title: '分散 DDL クエリ（ON CLUSTER 句）'
doc_type: 'reference'
---

デフォルトでは、`CREATE`、`DROP`、`ALTER`、`RENAME` クエリは、それらが実行される現在のサーバーのみに影響します。クラスター環境では、`ON CLUSTER` 句を使用して、このようなクエリを分散実行することができます。

たとえば、次のクエリは、`cluster` 内の各ホスト上に、`Distributed` テーブル `all_hits` を作成します。

```sql
CREATE TABLE IF NOT EXISTS all_hits ON CLUSTER cluster (p Date, i Int32) ENGINE = Distributed(cluster, default, hits)
```

これらのクエリを正しく実行するためには、各ホストが同一のクラスタ定義を持っている必要があります（設定の同期を簡略化するには、ZooKeeper を使った置換機能を利用できます）。また、各ホストは ZooKeeper サーバーに接続していなければなりません。

ローカル版のクエリは、たとえ一部のホストが現在利用できない状態であっても、最終的にはクラスタ内の各ホスト上で実行されます。

:::important\
1 つのホスト内におけるクエリの実行順序は保証されます。
:::
