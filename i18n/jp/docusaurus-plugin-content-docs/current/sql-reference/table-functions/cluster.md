description: 'クラスタの `remote_servers` セクションで構成された全シャードにアクセスできるようにし、
  分散テーブルを作成することなく利用できます。'
sidebar_label: 'cluster'
sidebar_position: 30
slug: /sql-reference/table-functions/cluster
title: 'clusterAllReplicas'
```


# clusterAllReplicas テーブル関数

分散テーブルを作成することなく、クラスタの `remote_servers` セクションで構成された全シャードにアクセスできるようにします。各シャードのレプリカのうち1つのみがクエリされます。

`clusterAllReplicas` 関数は `cluster` と同様ですが、全てのレプリカがクエリされます。クラスタ内の各レプリカは、別々のシャード/接続として使用されます。

:::note
利用可能な全てのクラスタは [system.clusters](../../operations/system-tables/clusters.md) テーブルに一覧されています。
:::

**構文**

```sql
cluster(['cluster_name', db.table, sharding_key])
cluster(['cluster_name', db, table, sharding_key])
clusterAllReplicas(['cluster_name', db.table, sharding_key])
clusterAllReplicas(['cluster_name', db, table, sharding_key])
```
**引数**

- `cluster_name` – リモートおよびローカルサーバーへのアドレスおよび接続パラメータのセットを構築するために使用されるクラスタの名前。指定しない場合は `default` を設定します。
- `db.table` または `db`, `table` - データベースとテーブルの名前。
- `sharding_key` - シャーディングキー。オプション。クラスタにシャードが1つ以上ある場合は指定する必要があります。

**返される値**

クラスタからのデータセット。

**マクロの使用**

`cluster_name` にはマクロ — 中カッコ内の置換を含めることができます。置換された値はサーバー構成ファイルの [macros](../../operations/server-configuration-parameters/settings.md#macros) セクションから取得されます。

例:

```sql
SELECT * FROM cluster('{cluster}', default.example_table);
```

**使用と推奨事項**

`cluster` と `clusterAllReplicas` テーブル関数を使用することは、`Distributed` テーブルを作成するよりも効率が悪くなります。この場合、リクエストごとにサーバー接続が再確立されるためです。大量のクエリを処理する場合は、必ず事前に `Distributed` テーブルを作成し、`cluster` と `clusterAllReplicas` テーブル関数の使用は避けてください。

`cluster` と `clusterAllReplicas` テーブル関数は、以下の場合に便利です：

- データ比較、デバッグ、テストのために特定のクラスタにアクセスする場合。
- 研究目的で様々な ClickHouse クラスタおよびレプリカへのクエリ。
- 手動で行われる稀な分散リクエスト。

接続設定（`host`、`port`、`user`、`password`、`compression`、`secure`）は `<remote_servers>` の構成セクションから取得されます。詳細は [Distributed engine](../../engines/table-engines/special/distributed.md) を参照してください。

**関連項目**

- [skip_unavailable_shards](../../operations/settings/settings.md#skip_unavailable_shards)
- [load_balancing](../../operations/settings/settings.md#load_balancing)
