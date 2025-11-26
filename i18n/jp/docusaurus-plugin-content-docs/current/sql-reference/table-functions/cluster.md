---
description: '`remote_servers` セクションで設定されたクラスタ内のすべてのシャードに、Distributed テーブルを作成せずにアクセスできます。'
sidebar_label: 'クラスタ'
sidebar_position: 30
slug: /sql-reference/table-functions/cluster
title: 'clusterAllReplicas'
doc_type: 'reference'
---



# clusterAllReplicas テーブル関数

`remote_servers` セクションで設定されたクラスター内のすべてのシャードに、[Distributed](../../engines/table-engines/special/distributed.md) テーブルを作成せずにアクセスできます。各シャードにつき 1 つのレプリカのみがクエリされます。

`clusterAllReplicas` 関数は `cluster` と同様ですが、すべてのレプリカに対してクエリを実行します。クラスター内の各レプリカは、個別のシャード／接続として扱われます。

:::note
利用可能なすべてのクラスターは、[system.clusters](../../operations/system-tables/clusters.md) テーブルに一覧表示されています。
:::



## 構文 {#syntax}



```sql
cluster(['cluster_name', db.table, sharding_key])
cluster(['cluster_name', db, table, sharding_key])
clusterAllReplicas(['cluster_name', db.table, sharding_key])
clusterAllReplicas(['cluster_name', db, table, sharding_key])
```

## 引数

| 引数                          | 説明                                                                                  |
| --------------------------- | ----------------------------------------------------------------------------------- |
| `cluster_name`              | リモートおよびローカルサーバーへのアドレスおよび接続パラメータの集合を構成するために使用されるクラスタ名。指定されていない場合は `default` が使用されます。 |
| `db.table` or `db`, `table` | データベース名とテーブル名。                                                                      |
| `sharding_key`              | シャーディングキー。省略可能。クラスタに複数のシャードがある場合に指定する必要があります。                                       |


## 戻り値 {#returned_value}

クラスタからのデータセット。



## マクロの使用

`cluster_name` にはマクロ（波かっこで囲まれた置換式）を含めることができます。置換される値は、サーバー構成ファイルの [macros](../../operations/server-configuration-parameters/settings.md#macros) セクションから取得されます。

例:

```sql
SELECT * FROM cluster('{cluster}', default.example_table);
```


## 使用方法と推奨事項 {#usage_recommendations}

`cluster` および `clusterAllReplicas` テーブル関数の使用は、各リクエストごとにサーバー接続が再確立されるため、`Distributed` テーブルを作成して利用する場合と比べて効率が低くなります。多数のクエリを処理する際は、必ず事前に `Distributed` テーブルを作成し、`cluster` および `clusterAllReplicas` テーブル関数の使用は避けてください。

`cluster` および `clusterAllReplicas` テーブル関数は、次のような場合に有用です。

- データ比較、デバッグ、テストのために特定のクラスタへアクセスする場合
- 調査目的で、さまざまな ClickHouse クラスタやレプリカに対してクエリを実行する場合
- 手動で行う、頻度の低い分散リクエスト

`host`、`port`、`user`、`password`、`compression`、`secure` といった接続設定は、`<remote_servers>` 設定セクションから取得されます。詳細は [Distributed engine](../../engines/table-engines/special/distributed.md) を参照してください。



## 関連項目 {#related}

- [skip_unavailable_shards](../../operations/settings/settings.md#skip_unavailable_shards)
- [load_balancing](../../operations/settings/settings.md#load_balancing)
