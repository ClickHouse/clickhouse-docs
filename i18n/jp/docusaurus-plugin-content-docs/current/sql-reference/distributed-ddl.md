---
'description': 'Distributed Ddlに関するドキュメント'
'sidebar_label': '分散DDL'
'sidebar_position': 3
'slug': '/sql-reference/distributed-ddl'
'title': '分散DDLクエリ (ON CLUSTER句)'
'doc_type': 'reference'
---

デフォルトでは、`CREATE`、`DROP`、`ALTER`、および `RENAME` クエリは、それらが実行される現在のサーバーにのみ影響を与えます。クラスタ設定では、`ON CLUSTER` 句を使用して、そのようなクエリを分散方式で実行することが可能です。

例えば、以下のクエリは、`cluster` 内の各ホストに `all_hits` `Distributed` テーブルを作成します：

```sql
CREATE TABLE IF NOT EXISTS all_hits ON CLUSTER cluster (p Date, i Int32) ENGINE = Distributed(cluster, default, hits)
```

これらのクエリを正しく実行するには、各ホストが同じクラスタ定義を持っている必要があります（設定を同期するために、ZooKeeper のサブスティテューションを使用することができます）。また、ZooKeeper サーバーに接続する必要があります。

ローカルバージョンのクエリは、現在利用できないホストがあっても、最終的にはクラスタ内の各ホストで実行されます。

:::important    
単一ホスト内でのクエリ実行の順序は保証されています。
:::
