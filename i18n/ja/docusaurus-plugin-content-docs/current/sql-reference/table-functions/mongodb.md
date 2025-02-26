---
slug: /sql-reference/table-functions/mongodb
sidebar_position: 135
sidebar_label: mongodb
---

# mongodb

リモートMongoDBサーバーに保存されているデータに対して`SELECT`クエリを実行できるようにします。

**構文**

```sql
mongodb(host:port, database, collection, user, password, structure [, options])
```

**引数**

- `host:port` — MongoDBサーバーアドレス。

- `database` — リモートデータベース名。

- `collection` — リモートコレクション名。

- `user` — MongoDBユーザー。

- `password` — ユーパスワード。

- `structure` - この関数から返されたClickHouseテーブルのスキーマ。

- `options` - MongoDB接続文字列オプション（オプションのパラメータ）。

:::tip
MongoDB Atlasクラウドサービスを使用している場合は、次のオプションを追加してください：

```ini
'connectTimeoutMS=10000&ssl=true&authSource=admin'
```

:::

また、URIによる接続も可能です：
```sql
mongodb(uri, collection, structure)
```
**引数**

- `uri` — 接続文字列。

- `collection` — リモートコレクション名。

- `structure` — この関数から返されたClickHouseテーブルのスキーマ。

**返される値**

元のMongoDBテーブルと同じカラムを持つテーブルオブジェクト。

**例**

MongoDBデータベース`test`内に`my_collection`というコレクションが定義されており、いくつかのドキュメントを挿入する場合を考えます：

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

`mongodb`テーブル関数を使用してコレクションをクエリします：

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

- [MongoDB テーブルエンジン](/engines/table-engines/integrations/mongodb.md)
- [MongoDBを辞書ソースとして使用する](/sql-reference/dictionaries/index.md#mongodb)
