---
'description': 'MongoDB engine is read-only table engine which allows to read data
  from a remote collection.'
'sidebar_label': 'MongoDB'
'sidebar_position': 135
'slug': '/engines/table-engines/integrations/mongodb'
'title': 'MongoDB'
---




# MongoDB

MongoDBエンジンは、リモートの [MongoDB](https://www.mongodb.com/) コレクションからデータを読み取ることができる読み取り専用テーブルエンジンです。

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

- `host:port` — MongoDBサーバーのアドレス。

- `database` — リモートデータベース名。

- `collection` — リモートコレクション名。

- `user` — MongoDBユーザー。

- `password` — ユーザーパスワード。

- `options` — MongoDB接続文字列オプション（オプションパラメータ）。

- `oid_columns` - WHERE句で`oid`として扱うべきカラムのカンマ区切りリスト。デフォルトは`_id`です。

:::tip
MongoDB Atlasクラウドオファリングを使用している場合、接続URLは「Atlas SQL」オプションから取得できます。
Seed list(`mongodb**+srv**`) はまだサポートされていませんが、将来的なリリースで追加される予定です。
:::

別の方法として、URIを渡すこともできます：

```sql
ENGINE = MongoDB(uri, collection[, oid_columns]);
```

**エンジンパラメータ**

- `uri` — MongoDBサーバーの接続URI。

- `collection` — リモートコレクション名。

- `oid_columns` - WHERE句で`oid`として扱うべきカラムのカンマ区切りリスト。デフォルトは`_id`です。

## 型マッピング {#types-mappings}

| MongoDB                 | ClickHouse                                                            |
|-------------------------|-----------------------------------------------------------------------|
| bool, int32, int64      | *任意の数値型*, String                                               |
| double                  | Float64, String                                                       |
| date                    | Date, Date32, DateTime, DateTime64, String                            |
| string                  | String                                                                |
| document                | String(をJSONとして)                                                 |
| array                   | Array, String(をJSONとして)                                          |
| oid                     | String                                                                |
| binary                  | 列にある場合はString, 配列またはドキュメントにある場合はbase64エンコードされた文字列 |
| uuid (binary subtype 4) | UUID                                                                  |
| *その他すべて*         | String                                                                |

MongoDBドキュメントにキーが見つからない場合（たとえば、カラム名が一致しない場合）、デフォルト値または`NULL`（カラムがnullableの場合）が挿入されます。

### OID {#oid}

WHERE句で`String`を`oid`として扱いたい場合は、テーブルエンジンの最後の引数にカラム名を指定してください。
これは、MongoDBでデフォルトで`oid`型を持つ`_id`カラムでレコードをクエリする際に必要となる場合があります。
テーブルの`_id`フィールドが他の型（たとえば`uuid`）の場合、空の`oid_columns`を指定する必要があります。さもないと、このパラメータのデフォルト値である`_id`が使用されます。

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

デフォルトでは、`_id`のみが`oid`カラムとして扱われます。

```sql
CREATE TABLE sample_oid
(
    _id String,
    another_oid_column String
) ENGINE = MongoDB('mongodb://user:pass@host/db', 'sample_oid');

SELECT count() FROM sample_oid WHERE _id = '67bf6cc44ebc466d33d42fb2'; -- 出力は1になります。
SELECT count() FROM sample_oid WHERE another_oid_column = '67bf6cc40000000000ea41b1'; -- 出力は0になります
```

この場合、出力は`0`になります。ClickHouseは`another_oid_column`が`oid`型であることを知らないため、修正しましょう：

```sql
CREATE TABLE sample_oid
(
    _id String,
    another_oid_column String
) ENGINE = MongoDB('mongodb://user:pass@host/db', 'sample_oid', '_id,another_oid_column');

-- または

CREATE TABLE sample_oid
(
    _id String,
    another_oid_column String
) ENGINE = MongoDB('host', 'db', 'sample_oid', 'user', 'pass', '', '_id,another_oid_column');

SELECT count() FROM sample_oid WHERE another_oid_column = '67bf6cc40000000000ea41b1'; -- これで出力は1になります。
```

## サポートされている句 {#supported-clauses}

単純な式を持つクエリのみがサポートされています（例えば、`WHERE field = <定数> ORDER BY field2 LIMIT <定数>`）。
そのような式はMongoDBクエリ言語に変換され、サーバー側で実行されます。
この制限をすべて無効にするには、[mongodb_throw_on_unsupported_query](../../../operations/settings/settings.md#mongodb_throw_on_unsupported_query)を使用してください。
その場合、ClickHouseはクエリを最善の努力で変換しようとしますが、これにより全テーブルスキャンやClickHouse側での処理が発生する可能性があります。

:::note
リテラルの型を明示的に設定することが常に望ましいです。なぜならMongoは厳密な型フィルターを必要とするからです。\
たとえば、`Date`でフィルタリングしたい場合：

```sql
SELECT * FROM mongo_table WHERE date = '2024-01-01'
```

これは機能しません。Mongoは文字列を`Date`にキャストしないため、手動でキャストする必要があります。

```sql
SELECT * FROM mongo_table WHERE date = '2024-01-01'::Date OR date = toDate('2024-01-01')
```

これは`Date`、`Date32`、`DateTime`、`Bool`、`UUID`に適用されます。

:::


## 使用例 {#usage-example}

MongoDBに[ sample_mflix](https://www.mongodb.com/docs/atlas/sample-data/sample-mflix) データセットがロードされていると仮定します。

MongoDBのコレクションからデータを読み取ることを可能にするClickHouseのテーブルを作成します：

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
    year String,
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
-- JSONExtractStringはMongoDBにプッシュダウンできません
SET mongodb_throw_on_unsupported_query = 0;

-- 評価が7.5を超える「バック・トゥ・ザ・フューチャー」の続編をすべて見つける
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
-- コーマック・マッカーシーの作品に基づくトップ3の映画を見つける
SELECT title, toFloat32(JSONExtractString(imdb, 'rating')) as rating
FROM sample_mflix_table
WHERE arrayExists(x -> x like 'Cormac McCarthy%', writers)
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
DEBUGレベルのログで生成されたMongoDBクエリを見ることができます。

実装の詳細は、[mongocxx](https://github.com/mongodb/mongo-cxx-driver) および [mongoc](https://github.com/mongodb/mongo-c-driver) のドキュメントで確認できます。
