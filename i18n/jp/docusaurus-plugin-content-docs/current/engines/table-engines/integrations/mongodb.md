---
'description': 'MongoDB エンジンはリードオンリーのテーブルエンジンで、リモートコレクションからデータを読み取ることができます。'
'sidebar_label': 'MongoDB'
'sidebar_position': 135
'slug': '/engines/table-engines/integrations/mongodb'
'title': 'MongoDB'
'doc_type': 'guide'
---


# MongoDB

MongoDBエンジンはリードオンリーのテーブルエンジンであり、リモートの [MongoDB](https://www.mongodb.com/) コレクションからデータを読み取ることができます。

MongoDB v3.6+ サーバーのみがサポートされています。
[Seed list(`mongodb+srv`)](https://www.mongodb.com/docs/manual/reference/glossary/#std-term-seed-list) はまだサポートされていません。

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

| パラメータ       | 説明                                                                                                                                                                                              |
|------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `host:port`      | MongoDBサーバーのアドレス。                                                                                                                                                                      |
| `database`       | リモートデータベース名。                                                                                                                                                                        |
| `collection`     | リモートコレクション名。                                                                                                                                                                        |
| `user`           | MongoDBユーザー。                                                                                                                                                                              |
| `password`       | ユーザーパスワード。                                                                                                                                                                             |
| `options`        | オプション。MongoDB接続文字列の [オプション](https://www.mongodb.com/docs/manual/reference/connection-string-options/#connection-options) をURL形式の文字列で指定。例: `'authSource=admin&ssl=true'` |
| `oid_columns`    | WHERE句で `oid` として扱うべきカラムのカンマ区切りリスト。デフォルトは `_id`。                                                                                                                 |

:::tip
MongoDB Atlasクラウドオファリングを使用している場合、接続URLは「Atlas SQL」オプションから取得できます。
Seed list(`mongodb**+srv**`) はまだサポートされていませんが、今後のリリースで追加される予定です。
:::

または、URIを渡すこともできます：

```sql
ENGINE = MongoDB(uri, collection[, oid_columns]);
```

**エンジンパラメータ**

| パラメータ       | 説明                                                                                                            |
|------------------|----------------------------------------------------------------------------------------------------------------|
| `uri`            | MongoDBサーバーの接続URI。                                                                                      |
| `collection`     | リモートコレクション名。                                                                                        |
| `oid_columns`    | WHERE句で `oid` として扱うべきカラムのカンマ区切りリスト。デフォルトは `_id`。                                  |

## タイプマッピング {#types-mappings}

| MongoDB                 | ClickHouse                                                             |
|-------------------------|------------------------------------------------------------------------|
| bool, int32, int64      | *任意の数値型（Decimalを除く）*, Boolean, String                   |
| double                  | Float64, String                                                       |
| date                    | Date, Date32, DateTime, DateTime64, String                            |
| string                  | String, *正しくフォーマットされた場合の任意の数値型（Decimalを除く）*    |
| document                | String（JSONとして）                                                 |
| array                   | Array, String（JSONとして）                                          |
| oid                     | String                                                                |
| binary                  | カラム内にある場合はString、配列またはドキュメント内にある場合はbase64エンコードされた文字列 |
| uuid (binary subtype 4) | UUID                                                                  |
| *その他のもの*          | String                                                                |

MongoDBドキュメントにキーが見つからない場合（例えば、カラム名が一致しない場合）、デフォルト値または `NULL`（カラムがnullableである場合）が挿入されます。

### OID {#oid}

WHERE句で `String` を `oid` として扱いたい場合、テーブルエンジンの最後の引数にカラム名を指定してください。
これは、デフォルトでMongoDBの `_id` カラムが `oid` 型であるため、レコードを `_id` カラムでクエリする際に必要です。
テーブル内の `_id` フィールドが他の型、例えば `uuid` の場合、空の `oid_columns` を指定する必要があります。さもなくば、このパラメータのデフォルト値 `_id` が使用されます。

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

デフォルトでは、`_id` のみが `oid` カラムとして扱われます。

```sql
CREATE TABLE sample_oid
(
    _id String,
    another_oid_column String
) ENGINE = MongoDB('mongodb://user:pass@host/db', 'sample_oid');

SELECT count() FROM sample_oid WHERE _id = '67bf6cc44ebc466d33d42fb2'; --will output 1.
SELECT count() FROM sample_oid WHERE another_oid_column = '67bf6cc40000000000ea41b1'; --will output 0
```

この場合、出力は `0` になります。ClickHouseは `another_oid_column` が `oid` 型であることを認識しないため、これを修正しましょう：

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

単純な式を持つクエリのみがサポートされています（例えば、 `WHERE field = <constant> ORDER BY field2 LIMIT <constant>`）。
このような式はMongoDBのクエリ言語に変換され、サーバー側で実行されます。
すべての制限を無効にするには、 [mongodb_throw_on_unsupported_query](../../../operations/settings/settings.md#mongodb_throw_on_unsupported_query) を使用します。
その場合、ClickHouseは可能な限りクエリを変換しようとしますが、これにより全表スキャンやClickHouse側での処理が発生する可能性があります。

:::note
リテラルの型を明示的に設定する方が常に良いです。Mongoは厳格な型のフィルタを要求するので。\
例えば、`Date` でフィルタリングしたい場合：

```sql
SELECT * FROM mongo_table WHERE date = '2024-01-01'
```

これは機能しません。なぜならMongoは文字列を `Date` にキャストしないからです。したがって、手動でキャストする必要があります：

```sql
SELECT * FROM mongo_table WHERE date = '2024-01-01'::Date OR date = toDate('2024-01-01')
```

これは `Date`, `Date32`, `DateTime`, `Bool`, `UUID` に適用されます。

:::

## 使用例 {#usage-example}

MongoDBに [sample_mflix](https://www.mongodb.com/docs/atlas/sample-data/sample-mflix) データセットがロードされていると仮定します。

MongoDBコレクションからデータを読み取ることを許可するClickHouseのテーブルを作成します：

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

クエリ：

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
DEBUGレベルのログで生成されたMongoDBクエリを確認できます。

実装の詳細は [mongocxx](https://github.com/mongodb/mongo-cxx-driver) および [mongoc](https://github.com/mongodb/mongo-c-driver) のドキュメントで確認できます。
