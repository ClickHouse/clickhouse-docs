---
description: '`remote_servers` セクションで構成されたクラスター内のすべてのシャードへ、Distributed テーブルを作成せずにアクセスできるようにします。'
sidebar_label: 'クラスター'
sidebar_position: 30
slug: /sql-reference/table-functions/cluster
title: 'clusterAllReplicas'
doc_type: 'reference'
---



# clusterAllReplicas テーブル関数

[Distributed](../../engines/table-engines/special/distributed.md) テーブルを作成せずに、クラスター内の `remote_servers` セクションで設定されたすべてのシャードへアクセスできます。各シャードにつき 1 つのレプリカのみがクエリされます。

`clusterAllReplicas` 関数は `cluster` と同様ですが、すべてのレプリカに対してクエリを実行します。クラスター内の各レプリカは、個別のシャード／接続として扱われます。

:::note
利用可能なすべてのクラスターは [system.clusters](../../operations/system-tables/clusters.md) テーブルに一覧されています。
:::



## 構文 {#syntax}


```sql
cluster(['cluster_name', db.table, sharding_key])
cluster(['cluster_name', db, table, sharding_key])
clusterAllReplicas(['cluster_name', db.table, sharding_key])
clusterAllReplicas(['cluster_name', db, table, sharding_key])
```

## 引数 {#arguments}

| 引数                   | 型                                                                                                                                              |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cluster_name`              | リモートサーバーおよびローカルサーバーへのアドレスと接続パラメータのセットを構築するために使用されるクラスター名。指定されていない場合は `default` が設定されます。 |
| `db.table` または `db`, `table` | データベース名とテーブル名。                                                                                                                   |
| `sharding_key`              | シャーディングキー。オプション。クラスターに複数のシャードがある場合は指定が必要です。                                                           |


## 戻り値 {#returned_value}

クラスタから取得されたデータセット。


## マクロの使用 {#using_macros}

`cluster_name`にはマクロを含めることができます。マクロは波括弧内の置換文字列です。置換される値は、サーバー設定ファイルの[macros](../../operations/server-configuration-parameters/settings.md#macros)セクションから取得されます。

例:

```sql
SELECT * FROM cluster('{cluster}', default.example_table);
```


## 使用方法と推奨事項 {#usage_recommendations}

`cluster`および`clusterAllReplicas`テーブル関数の使用は、`Distributed`テーブルの作成よりも効率が劣ります。これは、リクエストごとにサーバー接続が再確立されるためです。大量のクエリを処理する場合は、必ず事前に`Distributed`テーブルを作成し、`cluster`および`clusterAllReplicas`テーブル関数は使用しないでください。

`cluster`および`clusterAllReplicas`テーブル関数は、以下の場合に有用です:

- データ比較、デバッグ、テストのために特定のクラスタにアクセスする場合
- 調査目的で様々なClickHouseクラスタおよびレプリカに対してクエリを実行する場合
- 手動で実行される頻度の低い分散リクエストの場合

`host`、`port`、`user`、`password`、`compression`、`secure`などの接続設定は、`<remote_servers>`設定セクションから取得されます。詳細は[Distributedエンジン](../../engines/table-engines/special/distributed.md)を参照してください。


## 関連項目 {#related}

- [skip_unavailable_shards](../../operations/settings/settings.md#skip_unavailable_shards)
- [load_balancing](../../operations/settings/settings.md#load_balancing)
