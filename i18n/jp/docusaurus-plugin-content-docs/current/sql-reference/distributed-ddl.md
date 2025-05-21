---
description: '分散DDLのためのドキュメント'
sidebar_label: '分散DDL'
sidebar_position: 3
slug: /sql-reference/distributed-ddl
title: '分散DDLクエリ (ON CLUSTER句)'
---

デフォルトでは、`CREATE`、`DROP`、`ALTER`、および `RENAME` クエリは実行される現在のサーバーにのみ影響します。クラスタ設定では、`ON CLUSTER` 句を使用して、そのようなクエリを分散して実行することが可能です。

例えば、以下のクエリは `cluster` の各ホストに `all_hits` `Distributed` テーブルを作成します：

```sql
CREATE TABLE IF NOT EXISTS all_hits ON CLUSTER cluster (p Date, i Int32) ENGINE = Distributed(cluster, default, hits)
```

これらのクエリを正しく実行するためには、各ホストが同じクラスタ定義を持っている必要があります（設定の同期を簡素化するために、ZooKeeperからの置換を使用できます）。また、ZooKeeperサーバーに接続している必要があります。

ローカルバージョンのクエリは、現在利用できないホストがあっても、最終的にクラスタ内の各ホストで実行されます。

:::important    
単一ホスト内でのクエリ実行順序は保証されています。
:::
