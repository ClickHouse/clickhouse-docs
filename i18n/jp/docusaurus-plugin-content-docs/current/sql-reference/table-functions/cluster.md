---
'description': 'クラスターのすべてのシャード（`remote_servers` セクションで構成されている）にアクセスすることを可能にします。Distributed
  テーブルを作成することなく。'
'sidebar_label': 'クラスタ'
'sidebar_position': 30
'slug': '/sql-reference/table-functions/cluster'
'title': 'clusterAllReplicas'
'doc_type': 'reference'
---


# clusterAllReplicas テーブル関数

`remote_servers` セクションで構成されたすべてのシャードにアクセスすることを可能にします。 [Distributed](../../engines/table-engines/special/distributed.md) テーブルを作成することなく、各シャードの1つのレプリカのみがクエリされます。

`clusterAllReplicas` 関数 — `cluster` と同様ですが、すべてのレプリカがクエリされます。クラスター内の各レプリカは、個別のシャード/接続として使用されます。

:::note
利用可能なすべてのクラスターは [system.clusters](../../operations/system-tables/clusters.md) テーブルに一覧表示されています。
:::

## 構文 {#syntax}

```sql
cluster(['cluster_name', db.table, sharding_key])
cluster(['cluster_name', db, table, sharding_key])
clusterAllReplicas(['cluster_name', db.table, sharding_key])
clusterAllReplicas(['cluster_name', db, table, sharding_key])
```
## 引数 {#arguments}

| 引数                       | 型                                                                                               |
|----------------------------|--------------------------------------------------------------------------------------------------|
| `cluster_name`             | リモートおよびローカルサーバーへのアドレスと接続パラメータのセットを構築するために使用されるクラスターの名前。指定されていない場合は `default` を設定します。 |
| `db.table` または `db`, `table` | データベースとテーブルの名前。                                                                                               |
| `sharding_key`             | シャーディングキー。オプション。クラスターにシャードが2つ以上ある場合は指定する必要があります。                                         |

## 戻り値 {#returned_value}

クラスターからのデータセット。

## マクロの使用 {#using_macros}

`cluster_name` は、波かっこ内の置換を含むマクロを含むことができます。置換された値は、サーバー構成ファイルの [macros](../../operations/server-configuration-parameters/settings.md#macros) セクションから取得されます。

例：

```sql
SELECT * FROM cluster('{cluster}', default.example_table);
```

## 使用法と推奨事項 {#usage_recommendations}

`cluster` および `clusterAllReplicas` テーブル関数を使用することは、`Distributed` テーブルを作成するよりも効率が悪いです。この場合、リクエストごとにサーバー接続が再確立されます。大量のクエリを処理する場合は、常に事前に `Distributed` テーブルを作成し、`cluster` および `clusterAllReplicas` テーブル関数を使用しないでください。

`cluster` および `clusterAllReplicas` テーブル関数は、以下の場合に便利です：

- データの比較、デバッグ、テストのために特定のクラスターにアクセスする。
- 研究目的でさまざまな ClickHouse クラスターやレプリカに対するクエリ。
- 手動で行われる稀な分散リクエスト。

`host`、`port`、`user`、`password`、`compression`、`secure` などの接続設定は、`<remote_servers>` 構成セクションから取得されます。詳細は [Distributed engine](../../engines/table-engines/special/distributed.md) を参照してください。

## 関連 {#related}

- [skip_unavailable_shards](../../operations/settings/settings.md#skip_unavailable_shards)
- [load_balancing](../../operations/settings/settings.md#load_balancing)
