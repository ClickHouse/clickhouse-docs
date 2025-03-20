---
slug: /sql-reference/distributed-ddl
sidebar_position: 3
sidebar_label: 分散DDL
title: 分散DDLクエリ (ON CLUSTER句)
---

デフォルトでは、`CREATE`、`DROP`、`ALTER`、および `RENAME` クエリは、それが実行される現在のサーバーにのみ影響します。クラスターセットアップでは、`ON CLUSTER` 句を使用して、こうしたクエリを分散方式で実行することが可能です。

例えば、以下のクエリは、`cluster` の各ホストに `all_hits` `Distributed` テーブルを作成します：

``` sql
CREATE TABLE IF NOT EXISTS all_hits ON CLUSTER cluster (p Date, i Int32) ENGINE = Distributed(cluster, default, hits)
```

これらのクエリを正しく実行するためには、各ホストが同じクラスター定義を持っている必要があります（構成の同期を簡略化するために、ZooKeeperからの置き換えを使用することができます）。また、ZooKeeperサーバーに接続する必要があります。

ローカルバージョンのクエリは、現在利用できないホストがあっても、最終的にはクラスター内の各ホストで実行されます。

:::important    
単一のホスト内でのクエリ実行順序が保証されます。
:::
