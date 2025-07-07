---
'description': '`remote_servers` セクションで構成されたすべてのシャードにアクセスを可能にし、分散テーブルを作成しなくてもクラスターのすべてのレプリカにアクセスできます。'
'sidebar_label': 'クラスター'
'sidebar_position': 30
'slug': '/sql-reference/table-functions/cluster'
'title': 'clusterAllReplicas'
---




# clusterAllReplicas テーブル関数

`remote_servers` セクションで設定されたすべてのシャードにアクセスできるようにし、[Distributed](../../engines/table-engines/special/distributed.md) テーブルを作成する必要がありません。一つのシャードの各レプリカだけがクエリされます。

`clusterAllReplicas` 関数は、 `cluster` と同じですが、すべてのレプリカがクエリされます。クラスター内の各レプリカは、別々のシャード/接続として使用されます。

:::note
利用可能なすべてのクラスターは、[system.clusters](../../operations/system-tables/clusters.md) テーブルにリストされています。
:::

## 構文 {#syntax}

```sql
cluster(['cluster_name', db.table, sharding_key])
cluster(['cluster_name', db, table, sharding_key])
clusterAllReplicas(['cluster_name', db.table, sharding_key])
clusterAllReplicas(['cluster_name', db, table, sharding_key])
```
## 引数 {#arguments}

| 引数                       | タイプ                                                                                                                                              |
|----------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| `cluster_name`             | リモートサーバーとローカルサーバーへのアドレスと接続パラメーターのセットを構築するために使用されるクラスターの名前。指定されていない場合は `default` を設定します。 |
| `db.table` または `db`, `table` | データベースとテーブルの名前。                                                                                                                   |
| `sharding_key`             | シャーディングキー。オプション。クラスターが1つ以上のシャードを持つ場合は指定する必要があります。                                                           |

## 戻り値 {#returned_value}

クラスタからのデータセット。

## マクロの使用 {#using_macros}

`cluster_name` はマクロを含むことができます — 波括弧内の置換。置換された値は、サーバー設定ファイルの [macros](../../operations/server-configuration-parameters/settings.md#macros) セクションから取得されます。

例:

```sql
SELECT * FROM cluster('{cluster}', default.example_table);
```

## 使用法と推奨事項 {#usage_recommendations}

`cluster` と `clusterAllReplicas` テーブル関数を使用することは、`Distributed` テーブルを作成するよりも効率が悪くなります。この場合、リクエストごとにサーバー接続が再確立されるためです。多数のクエリを処理する場合は、必ず予め `Distributed` テーブルを作成し、`cluster` および `clusterAllReplicas` テーブル関数は使用しないでください。

`cluster` および `clusterAllReplicas` テーブル関数は、以下のような場合に便利です：

- データ比較、デバッグ、テストのために特定のクラスターにアクセスする。
- 研究目的でさまざまな ClickHouse クラスターとレプリカにクエリを実行する。
- 手動で行われる稀な分散リクエスト。

接続設定は、 `<remote_servers>` 設定セクションから `host`、`port`、`user`、`password`、`compression`、`secure` などが取得されます。詳細は [Distributed engine](../../engines/table-engines/special/distributed.md) を参照してください。

## 関連 {#related}

- [skip_unavailable_shards](../../operations/settings/settings.md#skip_unavailable_shards)
- [load_balancing](../../operations/settings/settings.md#load_balancing)
