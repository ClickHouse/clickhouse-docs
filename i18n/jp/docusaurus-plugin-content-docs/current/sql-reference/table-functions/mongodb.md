---
'description': 'リモートMongoDBサーバーに保存されたデータに対して`SELECT`クエリを実行できるようにします。'
'sidebar_label': 'mongodb'
'sidebar_position': 135
'slug': '/sql-reference/table-functions/mongodb'
'title': 'mongodb'
'doc_type': 'reference'
---


# mongodb テーブル関数

リモートの MongoDB サーバーに保存されているデータに対して `SELECT` クエリを実行できるようにします。

## 構文 {#syntax}

```sql
mongodb(host:port, database, collection, user, password, structure[, options[, oid_columns]])
```

## 引数 {#arguments}

| 引数            | 説明                                                                                                |
|----------------|-----------------------------------------------------------------------------------------------------|
| `host:port`    | MongoDB サーバーのアドレス。                                                                       |
| `database`     | リモートデータベース名。                                                                           |
| `collection`   | リモートコレクション名。                                                                           |
| `user`         | MongoDB ユーザー。                                                                                 |
| `password`     | ユーザーのパスワード。                                                                              |
| `structure`    | この関数から返される ClickHouse テーブルのスキーマ。                                                |
| `options`      | MongoDB 接続文字列のオプション（任意のパラメータ）。                                                  |
| `oid_columns`  | WHERE 句で `oid` として扱うべきカラムのカンマ区切りリスト。デフォルトは `_id`。                       |

:::tip
MongoDB Atlas クラウドサービスを使用している場合は、これらのオプションを追加してください：

```ini
'connectTimeoutMS=10000&ssl=true&authSource=admin'
```
:::

URI で接続することも可能です：

```sql
mongodb(uri, collection, structure[, oid_columns])
```

| 引数            | 説明                                                                                                |
|----------------|-----------------------------------------------------------------------------------------------------|
| `uri`          | 接続文字列。                                                                                       |
| `collection`   | リモートコレクション名。                                                                           |
| `structure`    | この関数から返される ClickHouse テーブルのスキーマ。                                                |
| `oid_columns`  | WHERE 句で `oid` として扱うべきカラムのカンマ区切りリスト。デフォルトは `_id`。                       |

## 戻り値 {#returned_value}

元の MongoDB テーブルと同じカラムを持つテーブルオブジェクト。

## 例 {#examples}

MongoDB データベース `test` に定義されたコレクション `my_collection` があり、いくつかのドキュメントを挿入したとします：

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

`mongodb` テーブル関数を使用してコレクションをクエリします：

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

## 関連 {#related}

- [MongoDB テーブルエンジン](engines/table-engines/integrations/mongodb.md)
- [MongoDB を辞書ソースとして使用する](sql-reference/dictionaries/index.md#mongodb)
