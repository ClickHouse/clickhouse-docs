---
slug: /sql-reference/table-functions/cluster
sidebar_position: 30
sidebar_label: cluster
title: "cluster, clusterAllReplicas"
---

クラスターのすべてのシャード（`remote_servers` セクションに構成されている）に、[Distributed](../../engines/table-engines/special/distributed.md) テーブルを作成せずにアクセスすることができます。各シャードのレプリカは一つだけクエリされます。

`clusterAllReplicas` 関数は、`cluster` と同様ですが、すべてのレプリカがクエリされます。クラスター内の各レプリカは、別々のシャード/接続として使用されます。

:::note
利用可能なすべてのクラスターは、[system.clusters](../../operations/system-tables/clusters.md) テーブルにリストされています。
:::

**構文**

``` sql
cluster(['cluster_name', db.table, sharding_key])
cluster(['cluster_name', db, table, sharding_key])
clusterAllReplicas(['cluster_name', db.table, sharding_key])
clusterAllReplicas(['cluster_name', db, table, sharding_key])
```
**引数**

- `cluster_name` – アドレスとリモートおよびローカルサーバーへの接続パラメータを構築するために使用されるクラスターの名前。指定されていない場合は `default` を設定します。
- `db.table` または `db`, `table` - データベースとテーブルの名前。
- `sharding_key` - シャーディングキー。オプション。クラスターにシャードが 1 つ以上ある場合は指定する必要があります。

**返される値**

クラスターからのデータセット。

**マクロの使用**

`cluster_name` にはマクロを含めることができます。波括弧内の置換は、サーバー設定ファイルの [macros](../../operations/server-configuration-parameters/settings.md#macros) セクションから取得される値を使用します。

例:

```sql
SELECT * FROM cluster('{cluster}', default.example_table);
```

**使用法と推奨事項**

`cluster` および `clusterAllReplicas` テーブル関数は、`Distributed` テーブルを作成するよりも効率が低くなります。この場合、リクエストごとにサーバー接続が再確立されるためです。大量のクエリを処理する場合は、必ず事前に `Distributed` テーブルを作成し、`cluster` および `clusterAllReplicas` テーブル関数を使用しないでください。

`cluster` および `clusterAllReplicas` テーブル関数は、以下のケースで有用です：

- データの比較、デバッグ、テストのために特定のクラスターにアクセスする場合。
- 研究目的でさまざまな ClickHouse クラスターやレプリカにクエリを送信する場合。
- 手動で行う稀な分散リクエスト。

接続設定は、`host`, `port`, `user`, `password`, `compression`, `secure` が `<remote_servers>` 設定セクションから取得されます。[Distributed engine](../../engines/table-engines/special/distributed.md) で詳細を参照してください。

**関連項目**

- [skip_unavailable_shards](../../operations/settings/settings.md#skip_unavailable_shards)
- [load_balancing](../../operations/settings/settings.md#load_balancing)
