---
description: 'MongoDB エンジンは、リモートのコレクションからデータを読み取ることができる読み取り専用のテーブルエンジンです。'
sidebar_label: 'MongoDB'
sidebar_position: 135
slug: /engines/table-engines/integrations/mongodb
title: 'MongoDB テーブルエンジン'
doc_type: 'reference'
---



# MongoDB テーブルエンジン {#mongodb-table-engine}

MongoDB エンジンは、リモートの [MongoDB](https://www.mongodb.com/) コレクションからデータを読み取るための読み取り専用のテーブルエンジンです。

MongoDB v3.6+ サーバーのみサポートされています。
[シードリスト（`mongodb+srv`）](https://www.mongodb.com/docs/manual/reference/glossary/#std-term-seed-list) はまだサポートされていません。



## テーブルの作成 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name
(
    name1 [type1],
    name2 [type2],
    ...
) ENGINE = MongoDB(host:port, database, collection, user, password[, options[, oid_columns]]);
```

**エンジンパラメータ**

| Parameter     | Description                                                                                                                                                                 |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `host:port`   | MongoDB サーバーのアドレス。                                                                                                                                                          |
| `database`    | リモートデータベース名。                                                                                                                                                                |
| `collection`  | リモートコレクション名。                                                                                                                                                                |
| `user`        | MongoDB ユーザー。                                                                                                                                                               |
| `password`    | ユーザーのパスワード。                                                                                                                                                                 |
| `options`     | 任意。URL 形式の文字列として指定する MongoDB 接続文字列の [options](https://www.mongodb.com/docs/manual/reference/connection-string-options/#connection-options)。例: `'authSource=admin&ssl=true'` |
| `oid_columns` | WHERE 句で `oid` として扱うカラムのカンマ区切りリスト。デフォルトは `_id`。                                                                                                                             |

:::tip
MongoDB Atlas のクラウドサービスを使用している場合、接続 URL は「Atlas SQL」オプションから取得できます。
シードリスト (`mongodb**+srv**`) にはまだ対応していませんが、今後のリリースで追加される予定です。
:::

または、URI を指定することもできます。

```sql
ENGINE = MongoDB(uri, collection[, oid_columns]);
```

**エンジンパラメータ**

| Parameter     | Description                                     |
| ------------- | ----------------------------------------------- |
| `uri`         | MongoDB サーバーの接続 URI。                            |
| `collection`  | リモートコレクション名。                                    |
| `oid_columns` | WHERE 句で `oid` として扱うカラムのリスト（カンマ区切り）。既定値は `_id`。 |


## 型マッピング {#types-mappings}

| MongoDB                 | ClickHouse                                          |
| ----------------------- | --------------------------------------------------- |
| bool, int32, int64      | *Decimals を除く任意の数値型*, Boolean, String               |
| double                  | Float64, String                                     |
| date                    | Date, Date32, DateTime, DateTime64, String          |
| string                  | String, *適切にフォーマットされていれば任意の数値型 (Decimals を除く)*      |
| document                | String（JSON として）                                    |
| array                   | Array, String（JSON として）                             |
| oid                     | String                                              |
| binary                  | カラム内では String、配列または document 内では base64 エンコードされた文字列 |
| uuid (binary subtype 4) | UUID                                                |
| *any other*             | String                                              |

MongoDB のドキュメントでキーが見つからない場合（たとえばカラム名が一致しない場合）、デフォルト値または `NULL`（カラムが Nullable の場合）が挿入されます。

### OID {#oid}

WHERE 句で `String` を `oid` として扱いたい場合は、テーブルエンジンの最後の引数にそのカラム名を指定します。
これは、MongoDB でデフォルトで `oid` 型を持つ `_id` カラムでレコードをクエリする際に必要になる場合があります。
テーブル内の `_id` フィールドが `uuid` など別の型である場合は、空の `oid_columns` を指定する必要があります。そうしないと、このパラメータのデフォルト値 `_id` が使用されます。

```javascript
db.sample_oid.insertMany([
    {"another_oid_column": ObjectId()},
]);

db.sample_oid.find();
[
    {
        "_id": {"$oid": "67bf6cc44ebc466d33d42fb2"},
        "another_oid_column": {"$oid": "67bf6cc40000000000ea41b1"}
    }
]
```

デフォルトでは、`oid` カラムとして扱われるのは `_id` だけです。

```sql
CREATE TABLE sample_oid
(
    _id String,
    another_oid_column String
) ENGINE = MongoDB('mongodb://user:pass@host/db', 'sample_oid');

SELECT count() FROM sample_oid WHERE _id = '67bf6cc44ebc466d33d42fb2'; --will output 1.
SELECT count() FROM sample_oid WHERE another_oid_column = '67bf6cc40000000000ea41b1'; --will output 0
```

この場合、出力は `0` になります。ClickHouse が `another_oid_column` を `oid` 型として認識していないためです。では、これを修正しましょう。

```sql
CREATE TABLE sample_oid
(
    _id String,
    another_oid_column String
) ENGINE = MongoDB('mongodb://user:pass@host/db', 'sample_oid', '_id,another_oid_column');

-- or

CREATE TABLE sample_oid
(
    _id String,
    another_oid_column String
) ENGINE = MongoDB('host', 'db', 'sample_oid', 'user', 'pass', '', '_id,another_oid_column');

SELECT count() FROM sample_oid WHERE another_oid_column = '67bf6cc40000000000ea41b1'; -- will output 1 now
```


## サポートされる句 {#supported-clauses}

単純な式を含むクエリのみがサポートされます（例：`WHERE field = <constant> ORDER BY field2 LIMIT <constant>`）。
このような式は MongoDB のクエリ言語に変換され、サーバー側で実行されます。
[mongodb&#95;throw&#95;on&#95;unsupported&#95;query](../../../operations/settings/settings.md#mongodb_throw_on_unsupported_query) を使用して、これらの制限をすべて無効にできます。
その場合、ClickHouse はベストエフォートでクエリの変換を試みますが、テーブル全体のスキャンや ClickHouse 側での処理が発生する可能性があります。

:::note
Mongo では厳密に型付けされたフィルターが必要になるため、リテラルの型は常に明示的に設定することを推奨します。
たとえば、`Date` でフィルタリングしたい場合:

```sql
SELECT * FROM mongo_table WHERE date = '2024-01-01'
```

これは、Mongo が文字列を `Date` にキャストしないため動作しません。そのため、自分で明示的にキャストする必要があります。

```sql
SELECT * FROM mongo_table WHERE date = '2024-01-01'::Date OR date = toDate('2024-01-01')
```

これは `Date`、`Date32`、`DateTime`、`Bool`、`UUID` 型に適用されます。

:::


## 使用例 {#usage-example}

MongoDB に [sample&#95;mflix](https://www.mongodb.com/docs/atlas/sample-data/sample-mflix) データセットがロードされているものとします。

MongoDB のコレクションからデータを読み取れる ClickHouse テーブルを作成します:

```sql
CREATE TABLE sample_mflix_table
(
    _id String,
    title String,
    plot String,
    genres Array(String),
    directors Array(String),
    writers Array(String),
    released Date,
    imdb String,
    year String
) ENGINE = MongoDB('mongodb://<USERNAME>:<PASSWORD>@atlas-sql-6634be87cefd3876070caf96-98lxs.a.query.mongodb.net/sample_mflix?ssl=true&authSource=admin', 'movies');
```

クエリ:

```sql
SELECT count() FROM sample_mflix_table
```

```text
   ┌─count()─┐
1. │   21349 │
   └─────────┘
```

```sql
-- JSONExtractString cannot be pushed down to MongoDB
SET mongodb_throw_on_unsupported_query = 0;

-- Find all 'Back to the Future' sequels with rating > 7.5
SELECT title, plot, genres, directors, released FROM sample_mflix_table
WHERE title IN ('Back to the Future', 'Back to the Future Part II', 'Back to the Future Part III')
    AND toFloat32(JSONExtractString(imdb, 'rating')) > 7.5
ORDER BY year
FORMAT Vertical;
```

```text
Row 1:
──────
title:     Back to the Future
plot:      A young man is accidentally sent 30 years into the past in a time-traveling DeLorean invented by his friend, Dr. Emmett Brown, and must make sure his high-school-age parents unite in order to save his own existence.
genres:    ['Adventure','Comedy','Sci-Fi']
directors: ['Robert Zemeckis']
released:  1985-07-03

Row 2:
──────
title:     Back to the Future Part II
plot:      After visiting 2015, Marty McFly must repeat his visit to 1955 to prevent disastrous changes to 1985... without interfering with his first trip.
genres:    ['Action','Adventure','Comedy']
directors: ['Robert Zemeckis']
released:  1989-11-22
```

```sql
-- Find top 3 movies based on Cormac McCarthy's books
SELECT title, toFloat32(JSONExtractString(imdb, 'rating')) AS rating
FROM sample_mflix_table
WHERE arrayExists(x -> x LIKE 'Cormac McCarthy%', writers)
ORDER BY rating DESC
LIMIT 3;
```

```text
   ┌─title──────────────────┬─rating─┐
1. │ No Country for Old Men │    8.1 │
2. │ The Sunset Limited     │    7.4 │
3. │ The Road               │    7.3 │
   └────────────────────────┴────────┘
```


## トラブルシューティング {#troubleshooting}
DEBUG レベルのログで、生成された MongoDB クエリを確認できます。

実装の詳細については、[mongocxx](https://github.com/mongodb/mongo-cxx-driver) および [mongoc](https://github.com/mongodb/mongo-c-driver) のドキュメントを参照してください。
