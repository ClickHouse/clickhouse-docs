---
slug: /sql-reference/distributed-ddl
sidebar_position: 3
sidebar_label: 分散DDL
title: 分散DDLクエリ (ON CLUSTER句)
---

デフォルトでは、`CREATE`、`DROP`、`ALTER`、および`RENAME`クエリは、実行される現在のサーバーにのみ影響します。クラスター構成では、`ON CLUSTER`句を使用して、そのようなクエリを分散して実行することが可能です。

たとえば、以下のクエリは、`cluster`内の各ホストに`all_hits`という名前の`Distributed`テーブルを作成します：

``` sql
CREATE TABLE IF NOT EXISTS all_hits ON CLUSTER cluster (p Date, i Int32) ENGINE = Distributed(cluster, default, hits)
```

これらのクエリを正しく実行するためには、各ホストが同じクラスター定義を持っている必要があります（構成の同期を簡素化するために、ZooKeeperからの置換を使用できます）。また、ZooKeeperサーバーに接続していることも必要です。

ローカルバージョンのクエリは、現在一部のホストが利用できない場合でも、最終的にはクラスター内の各ホストで実行されます。

:::important    
単一のホスト内でのクエリ実行順序は保証されています。
:::
