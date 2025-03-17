---
slug: /sql-reference/table-functions/cluster
sidebar_position: 30
sidebar_label: cluster
title: "clusterAllReplicas"
description: "クラスターのすべてのシャード（`remote_servers` セクションで構成された）にアクセスするために、分散テーブルを作成せずに使用します。"
---


# clusterAllReplicas テーブル関数

分散テーブルを作成せずに、クラスターのすべてのシャード（`remote_servers` セクションで構成された）にアクセスします。各シャードのレプリカのうち、1つだけがクエリされます。

`clusterAllReplicas` 関数は、`cluster` と同じですが、すべてのレプリカがクエリされます。クラスター内の各レプリカは、別のシャード/接続として使用されます。

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

- `cluster_name` – アドレスと接続パラメータのセットを構築するために使用されるクラスターの名前。指定されていない場合は `default` を設定します。
- `db.table` または `db`、`table` - データベースおよびテーブルの名前。
- `sharding_key` - シャーディングキー。オプションです。クラスターにシャードが複数ある場合は指定する必要があります。

**返される値**

クラスターからのデータセット。

**マクロの使用**

`cluster_name` にはマクロ — 中括弧内の置換を含めることができます。置換された値は、サーバー設定ファイルの [macros](../../operations/server-configuration-parameters/settings.md#macros) セクションから取得されます。

例:

```sql
SELECT * FROM cluster('{cluster}', default.example_table);
```

**使用法と推奨事項**

`cluster` および `clusterAllReplicas` テーブル関数の使用は、`Distributed` テーブルを作成するよりも効率が劣ります。なぜなら、この場合はリクエストごとにサーバー接続が再確立されるからです。多くのクエリを処理する場合は、常にあらかじめ `Distributed` テーブルを作成し、`cluster` および `clusterAllReplicas` テーブル関数を使用しないでください。

`cluster` および `clusterAllReplicas` テーブル関数は、次のような場合に役立ちます：

- データ比較、デバッグ、およびテストのために特定のクラスターにアクセスする。
- 研究目的でさまざまな ClickHouse クラスターおよびレプリカにクエリを送信する。
- 手動で行われる稀な分散リクエスト。

接続設定は、`host`、`port`、`user`、`password`、`compression`、`secure` が `<remote_servers>` 設定セクションから取得されます。詳細は [Distributed engine](../../engines/table-engines/special/distributed.md) を参照してください。

**関連項目**

- [skip_unavailable_shards](../../operations/settings/settings.md#skip_unavailable_shards)
- [load_balancing](../../operations/settings/settings.md#load_balancing)
