description: 'MongoDBエンジンは、リモートコレクションからデータを読み取るための読み取り専用テーブルエンジンです。'
sidebar_label: 'MongoDB'
sidebar_position: 135
slug: /engines/table-engines/integrations/mongodb
title: 'MongoDB'
```


# MongoDB

MongoDBエンジンは、リモートの [MongoDB](https://www.mongodb.com/) コレクションからデータを読み取るための読み取り専用テーブルエンジンです。

MongoDB v3.6+ サーバーのみがサポートされています。
[シードリスト(`mongodb+srv`)](https://www.mongodb.com/docs/manual/reference/glossary/#std-term-seed-list)は現在サポートされていません。

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

- `options` — MongoDB接続文字列オプション（オプションのパラメータ）。

- `oid_columns` - WHERE句で`oid`として扱われるべきカラムのコンマ区切りリスト。デフォルトは`_id`。

:::tip
MongoDB Atlasクラウド提供を使用している場合は、「Atlas SQL」オプションから接続URLを取得できます。
シードリスト(`mongodb**+srv**`)は現在サポートされていませんが、今後のリリースで追加される予定です。
:::

または、URIを渡すこともできます:

```sql
ENGINE = MongoDB(uri, collection[, oid_columns]);
```

**エンジンパラメータ**

- `uri` — MongoDBサーバーの接続URI。

- `collection` — リモートコレクション名。

- `oid_columns` - WHERE句で`oid`として扱われるべきカラムのコンマ区切りリスト。デフォルトは`_id`です。

## タイプマッピング {#types-mappings}

| MongoDB                 | ClickHouse                                                            |
|-------------------------|-----------------------------------------------------------------------|
| bool, int32, int64      | *任意の数値型*, String                                               |
| double                  | Float64, String                                                       |
| date                    | Date, Date32, DateTime, DateTime64, String                            |
| string                  | String                                                                |
| document                | String(as JSON)                                                       |
| array                   | Array, String(as JSON)                                                |
| oid                     | String                                                                |
| binary                  | カラム内ではString、配列またはドキュメント内ではbase64エンコードされたString |
| uuid (binary subtype 4) | UUID                                                                  |
| *その他の全て*         | String                                                                |

MongoDBドキュメント内にキーが見つからない場合（たとえば、カラム名が一致しない場合）、デフォルト値または`NULL`（カラムがNullableの場合）が挿入されます。

### OID {#oid}

WHERE句で`String`を`oid`として扱いたい場合は、テーブルエンジンの最後の引数にカラム名を指定してください。
これは、MongoDBでデフォルトで`oid`型を持つ`_id`カラムでレコードをクエリする場合に必要です。
テーブル内の`_id`フィールドが他の型（たとえば`uuid`）の場合、`oid_columns`を空に指定する必要があります。この場合、デフォルト値の`_id`が使用されます。

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

SELECT count() FROM sample_oid WHERE _id = '67bf6cc44ebc466d33d42fb2'; -- 1が返されます。
SELECT count() FROM sample_oid WHERE another_oid_column = '67bf6cc40000000000ea41b1'; -- 0が返されます。
```

この場合、出力は`0`になります。なぜならClickHouseは`another_oid_column`が`oid`型であることを認識していないからです。これを修正しましょう：

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

SELECT count() FROM sample_oid WHERE another_oid_column = '67bf6cc40000000000ea41b1'; -- 現在は1が返されます。
```

## サポートされている句 {#supported-clauses}

単純な式を持つクエリのみがサポートされています（例：`WHERE field = <constant> ORDER BY field2 LIMIT <constant>`）。
そのような式はMongoDBクエリ言語に変換され、サーバー側で実行されます。
これらの制限をすべて無効にするには、[mongodb_throw_on_unsupported_query](../../../operations/settings/settings.md#mongodb_throw_on_unsupported_query)を使用します。
その場合、ClickHouseはベストエフォートベースでクエリを変換しようとしますが、完全なテーブルスキャンとClickHouseサイドでの処理を引き起こす可能性があります。

:::note
リテラルの型を明示的に設定する方が常に良いです。なぜならMongoは厳密な型のフィルターを要求するためです。\
たとえば、`Date`でフィルタリングしたい場合：

```sql
SELECT * FROM mongo_table WHERE date = '2024-01-01'
```

これは機能しません。なぜならMongoは文字列を`Date`にキャストしないからです。したがって、手動でキャストする必要があります：

```sql
SELECT * FROM mongo_table WHERE date = '2024-01-01'::Date OR date = toDate('2024-01-01')
```

これは`Date`、`Date32`、`DateTime`、`Bool`、`UUID`に適用されます。
:::

## 使用例 {#usage-example}

MongoDBに [sample_mflix](https://www.mongodb.com/docs/atlas/sample-data/sample-mflix) データセットがロードされていると仮定します。

MongoDBコレクションからデータを読み取るためにClickHouseにテーブルを作成します：

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

-- 評価が> 7.5の「バック・トゥ・ザ・フューチャー」続編をすべて見つける
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
-- Cormac McCarthyの本に基づいてトップ3の映画を見つける
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
生成されたMongoDBクエリは、DEBUGレベルのログで確認できます。

実装の詳細は、[mongocxx](https://github.com/mongodb/mongo-cxx-driver)および[mongoc](https://github.com/mongodb/mongo-c-driver)のドキュメントで確認できます。
