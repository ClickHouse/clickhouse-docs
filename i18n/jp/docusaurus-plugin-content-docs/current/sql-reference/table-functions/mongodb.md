---
description: 'リモート MongoDB サーバー上に保存されたデータに対して `SELECT` クエリを実行できるようにします。'
sidebar_label: 'mongodb'
sidebar_position: 135
slug: /sql-reference/table-functions/mongodb
title: 'mongodb'
doc_type: 'reference'
---



# mongodb テーブル関数

リモートの MongoDB サーバー上に保存されているデータに対して `SELECT` クエリを実行できます。



## 構文 {#syntax}

```sql
mongodb(host:port, database, collection, user, password, structure[, options[, oid_columns]])
```


## 引数 {#arguments}

| 引数      | 説明                                                                                            |
| ------------- | ------------------------------------------------------------------------------------------------------ |
| `host:port`   | MongoDBサーバーアドレス。                                                                                |
| `database`    | リモートデータベース名。                                                                                  |
| `collection`  | リモートコレクション名。                                                                                |
| `user`        | MongoDBユーザー。                                                                                          |
| `password`    | ユーザーパスワード。                                                                                         |
| `structure`   | この関数から返されるClickHouseテーブルのスキーマ。                                       |
| `options`     | MongoDB接続文字列オプション(オプションパラメータ)。                                                |
| `oid_columns` | WHERE句で`oid`として扱うカラムのカンマ区切りリスト。デフォルトは`_id`。 |

:::tip
MongoDB Atlasクラウドサービスを使用している場合は、以下のオプションを追加してください:

```ini
'connectTimeoutMS=10000&ssl=true&authSource=admin'
```

:::

URIによる接続も可能です:

```sql
mongodb(uri, collection, structure[, oid_columns])
```

| 引数      | 説明                                                                                            |
| ------------- | ------------------------------------------------------------------------------------------------------ |
| `uri`         | 接続文字列。                                                                                     |
| `collection`  | リモートコレクション名。                                                                                |
| `structure`   | この関数から返されるClickHouseテーブルのスキーマ。                                       |
| `oid_columns` | WHERE句で`oid`として扱うカラムのカンマ区切りリスト。デフォルトは`_id`。 |


## 戻り値 {#returned_value}

元のMongoDBテーブルと同じカラムを持つテーブルオブジェクト。


## 例 {#examples}

`test`という名前のMongoDBデータベースに`my_collection`という名前のコレクションが定義されており、いくつかのドキュメントを挿入する場合を想定します。

```sql
db.createUser({user:"test_user",pwd:"password",roles:[{role:"readWrite",db:"test"}]})

db.createCollection("my_collection")

db.my_collection.insertOne(
    { log_type: "event", host: "120.5.33.9", command: "check-cpu-usage -w 75 -c 90" }
)

db.my_collection.insertOne(
    { log_type: "event", host: "120.5.33.4", command: "system-check"}
)
```

`mongodb`テーブル関数を使用してコレクションをクエリしてみましょう。

```sql
SELECT * FROM mongodb(
    '127.0.0.1:27017',
    'test',
    'my_collection',
    'test_user',
    'password',
    'log_type String, host String, command String',
    'connectTimeoutMS=10000'
)
```

または:

```sql
SELECT * FROM mongodb(
    'mongodb://test_user:password@127.0.0.1:27017/test?connectionTimeoutMS=10000',
    'my_collection',
    'log_type String, host String, command String'
)
```


## 関連項目 {#related}

- [`MongoDB`テーブルエンジン](engines/table-engines/integrations/mongodb.md)
- [MongoDBをディクショナリソースとして使用](sql-reference/dictionaries/index.md#mongodb)
