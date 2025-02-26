---
slug: /engines/table-engines/integrations/mongodb
sidebar_position: 135
sidebar_label: MongoDB
title: "MongoDB"
description: "MongoDBエンジンは、リモートコレクションからデータを読み取ることができる読み取り専用のテーブルエンジンです。"
---

# MongoDB

MongoDBエンジンは、リモートの[MongoDB](https://www.mongodb.com/)コレクションからデータを読み取ることができる読み取り専用のテーブルエンジンです。

MongoDB v3.6+ サーバーのみがサポートされています。
[Seed list(`mongodb+srv`)](https://www.mongodb.com/docs/manual/reference/glossary/#std-term-seed-list)はまだサポートされていません。

:::note
問題が発生した場合は、問題を報告してください。また、[レガシー実装](../../../operations/server-configuration-parameters/settings.md#use_legacy_mongodb_integration)を使用してみてください。
これは非推奨であり、次回のリリースで削除される予定ですのでご注意ください。
:::

## テーブルの作成 {#creating-a-table}

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name
(
    name1 [type1],
    name2 [type2],
    ...
) ENGINE = MongoDB(host:port, database, collection, user, password [, options]);
```

**エンジンパラメータ**

- `host:port` — MongoDBサーバーのアドレス。

- `database` — リモートデータベース名。

- `collection` — リモートコレクション名。

- `user` — MongoDBユーザー。

- `password` — ユーザーパスワード。

- `options` — MongoDB接続文字列オプション（オプションパラメータ）。

:::tip
MongoDB Atlasクラウドを使用している場合、接続URLは「Atlas SQL」オプションから取得できます。
Seed list(`mongodb**+srv**`)はまだサポートされていませんが、将来的に追加される予定です。
:::

また、URIを単純に渡すこともできます：

``` sql
ENGINE = MongoDB(uri, collection);
```

**エンジンパラメータ**

- `uri` — MongoDBサーバーの接続URI。

- `collection` — リモートコレクション名。

## 型のマッピング {#types-mappings}

| MongoDB            | ClickHouse                                                            |
|--------------------|-----------------------------------------------------------------------|
| bool, int32, int64 | *任意の数値型*, String                                            |
| double             | Float64, String                                                       |
| date               | Date, Date32, DateTime, DateTime64, String                            |
| string             | String, UUID                                                          |
| document           | String（JSONとして）                                                     |
| array              | Array, String（JSONとして）                                            |
| oid                | String                                                                |
| binary             | 列にある場合はString、配列またはドキュメントにある場合はbase64エンコードされた文字列 |
| *その他すべて*        | String                                                                |

MongoDBドキュメント内にキーが見つからない場合（例えば、カラム名が一致しない場合）、デフォルト値または`NULL`（カラムがnullableの場合）が挿入されます。

## サポートされている句 {#supported-clauses}

単純な式を持つクエリのみがサポートされています（例えば、`WHERE field = <constant> ORDER BY field2 LIMIT <constant>`）。
これらの式はMongoDBのクエリ言語に変換され、サーバー側で実行されます。
すべての制限を無効にしたい場合は、[mongodb_throw_on_unsupported_query](../../../operations/settings/settings.md#mongodb_throw_on_unsupported_query)を使用することができます。
その場合、ClickHouseは最善の努力に基づいてクエリを変換しようとしますが、完全なテーブルスキャンとClickHouse側での処理が発生する可能性があります。

:::note
リテラルの型を明示的に設定する方が常に良いです。なぜなら、MongoDBは厳格な型フィルタを要求するからです。\
例えば、`Date`でフィルタリングしたい場合：

```sql
SELECT * FROM mongo_table WHERE date = '2024-01-01'
```

これは機能しません。MongoDBは文字列を`Date`にキャストしないため、手動でキャストする必要があります：

```sql
SELECT * FROM mongo_table WHERE date = '2024-01-01'::Date OR date = toDate('2024-01-01')
```

これは`Date`、`Date32`、`DateTime`、`Bool`、`UUID`に適用されます。

:::


## 使用例 {#usage-example}

MongoDBに[sample_mflix](https://www.mongodb.com/docs/atlas/sample-data/sample-mflix)データセットがロードされていると仮定します。

MongoDBコレクションからデータを読み取ることができるClickHouseのテーブルを作成します：

``` sql
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

``` sql
SELECT count() FROM sample_mflix_table
```

``` text
   ┌─count()─┐
1. │   21349 │
   └─────────┘
```

```sql
-- JSONExtractStringはMongoDBにプッシュダウンできません
SET mongodb_throw_on_unsupported_query = 0;

-- 評価 > 7.5 の「バック・トゥ・ザ・フューチャー」続編を探す
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
-- コーマック・マッカーシーの本に基づくトップ3の映画を探す
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
生成されたMongoDBクエリはDEBUGレベルのログに表示されます。

実装の詳細については、[mongocxx](https://github.com/mongodb/mongo-cxx-driver)および[mongoc](https://github.com/mongodb/mongo-c-driver)のドキュメントを参照してください。
