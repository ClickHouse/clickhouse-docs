---
'description': 'Documentation for Distributed Ddl'
'sidebar_label': 'Distributed DDL'
'sidebar_position': 3
'slug': '/sql-reference/distributed-ddl'
'title': 'Distributed DDL Queries (ON CLUSTER Clause)'
---



デフォルトでは、`CREATE`、`DROP`、`ALTER`、および `RENAME` クエリは実行される現在のサーバーにのみ影響します。クラスタの設定では、`ON CLUSTER` 句を使用して、これらのクエリを分散方式で実行することが可能です。

例えば、以下のクエリは `cluster` 内の各ホストに `all_hits` `Distributed` テーブルを作成します：

```sql
CREATE TABLE IF NOT EXISTS all_hits ON CLUSTER cluster (p Date, i Int32) ENGINE = Distributed(cluster, default, hits)
```

これらのクエリを正しく実行するためには、各ホストが同じクラスタ定義を持っている必要があります（設定の同期を簡素化するために、ZooKeeper からの置換を使用できます）。また、それぞれのホストは ZooKeeper サーバーに接続する必要があります。

ローカル版のクエリは、現在利用できないホストがあっても、最終的にはクラスタ内の各ホストで実行されます。

:::important    
単一ホスト内でのクエリ実行の順序は保証されています。
:::
