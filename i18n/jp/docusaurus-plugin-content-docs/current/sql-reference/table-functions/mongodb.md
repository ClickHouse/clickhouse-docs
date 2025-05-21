---
description: 'リモートMongoDBサーバーに保存されているデータに対して、`SELECT`クエリを実行できるようにします。'
sidebar_label: 'mongodb'
sidebar_position: 135
slug: /sql-reference/table-functions/mongodb
title: 'mongodb'
---


# mongodb テーブル関数

リモートMongoDBサーバーに保存されているデータに対して、`SELECT`クエリを実行できるようにします。

**構文**

```sql
mongodb(host:port, database, collection, user, password, structure[, options[, oid_columns]])
```

**引数**

- `host:port` — MongoDBサーバーのアドレス。

- `database` — リモートデータベース名。

- `collection` — リモートコレクション名。

- `user` — MongoDBユーザー。

- `password` — ユーザーパスワード。

- `structure` - この関数から返されるClickHouseテーブルのスキーマ。

- `options` - MongoDB接続文字列オプション（オプションのパラメータ）。

- `oid_columns` - WHERE句で`oid`として扱うべきカラムのカンマ区切りリスト。デフォルトは`_id`。

:::tip
MongoDB Atlasのクラウドサービスを利用している場合、以下のオプションを追加してください：

```ini
'connectTimeoutMS=10000&ssl=true&authSource=admin'
```
:::

URIによって接続することも可能です：

```sql
mongodb(uri, collection, structure[, oid_columns])
```

**引数**

- `uri` — 接続文字列。

- `collection` — リモートコレクション名。

- `structure` — この関数から返されるClickHouseテーブルのスキーマ。

- `oid_columns` - WHERE句で`oid`として扱うべきカラムのカンマ区切りリスト。デフォルトは`_id`。

**返される値**

元のMongoDBテーブルと同じカラムを持つテーブルオブジェクト。

**例**

`test`というMongoDBデータベースに`my_collection`というコレクションがあり、いくつかのドキュメントを挿入したと仮定します：

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

`mongodb`テーブル関数を使用してコレクションをクエリしましょう：

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

または：

```sql
SELECT * FROM mongodb(
    'mongodb://test_user:password@127.0.0.1:27017/test?connectionTimeoutMS=10000',
    'my_collection',
    'log_type String, host String, command String'
)
```

**関連情報**

- [MongoDBテーブルエンジン](engines/table-engines/integrations/mongodb.md)
- [MongoDBを辞書ソースとして使用する](sql-reference/dictionaries/index.md#mongodb)
