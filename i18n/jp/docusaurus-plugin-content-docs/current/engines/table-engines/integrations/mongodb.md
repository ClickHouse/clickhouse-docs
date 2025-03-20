---
slug: /engines/table-engines/integrations/mongodb
sidebar_position: 135
sidebar_label: MongoDB
title: "MongoDB"
description: "MongoDBエンジンはリモートコレクションからデータを読み取ることができる読み取り専用テーブルエンジンです。"
---


# MongoDB

MongoDBエンジンはリモートの [MongoDB](https://www.mongodb.com/) コレクションからデータを読み取ることができる読み取り専用テーブルエンジンです。

MongoDB v3.6+ サーバーのみがサポートされています。  
[Seed list(`mongodb+srv`)](https://www.mongodb.com/docs/manual/reference/glossary/#std-term-seed-list) はまだサポートされていません。

:::note
問題が発生した場合は、問題を報告してください。また、[レガシー実装](../../../operations/server-configuration-parameters/settings.md#use_legacy_mongodb_integration)を使用してみてください。  
これは非推奨であり、次のリリースで削除されることに注意してください。
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

- `database` — リモートデータベースの名前。

- `collection` — リモートコレクションの名前。

- `user` — MongoDBユーザー。

- `password` — ユーザーパスワード。

- `options` — MongoDB接続文字列オプション（オプションのパラメータ）。

:::tip
MongoDB Atlasクラウドを使用している場合、接続URLは「Atlas SQL」オプションから取得できます。  
Seed list(`mongodb**+srv**`)はまだサポートされていませんが、将来のリリースで追加される予定です。
:::

URIを渡すこともできます：

``` sql
ENGINE = MongoDB(uri, collection);
```

**エンジンパラメータ**

- `uri` — MongoDBサーバーの接続URI

- `collection` — リモートコレクションの名前。


## 型のマッピング {#types-mappings}

| MongoDB            | ClickHouse                                                            |
|--------------------|-----------------------------------------------------------------------|
| bool, int32, int64 | *任意の数値型*, String                                             |
| double             | Float64, String                                                       |
| date               | Date, Date32, DateTime, DateTime64, String                            |
| string             | String, UUID                                                          |
| document           | String（JSONとして）                                                |
| array              | Array, String（JSONとして）                                         |
| oid                | String                                                                |
| binary             | カラムにある場合はString、配列またはドキュメントにある場合はbase64エンコードされた文字列 |
| *その他すべて*     | String                                                                |

MongoDBドキュメントにキーが見つからない場合（例えば、カラム名が一致しない場合）、デフォルト値または `NULL`（カラムがnullableの場合）が挿入されます。

## サポートされる句 {#supported-clauses}

単純な式を持つクエリのみがサポートされています（例えば、`WHERE field = <constant> ORDER BY field2 LIMIT <constant>`）。  
このような式はMongoDBのクエリ言語に変換され、サーバー側で実行されます。  
このすべての制限を無効にするには、 [mongodb_throw_on_unsupported_query](../../../operations/settings/settings.md#mongodb_throw_on_unsupported_query) を使用してください。  
その場合、ClickHouseはクエリを最善の努力で変換しようとしますが、完全なテーブルスキャンおよびClickHouse側での処理を引き起こす可能性があります。

:::note
リテラルの型は明示的に設定することが常に良いです。Mongoは厳格な型フィルタを要求します。\
例えば、`Date`でフィルタしたい場合：

```sql
SELECT * FROM mongo_table WHERE date = '2024-01-01'
```

これは動作しません。Mongoは文字列を `Date` にキャストしないため、手動でキャストする必要があります：

```sql
SELECT * FROM mongo_table WHERE date = '2024-01-01'::Date OR date = toDate('2024-01-01')
```

これは `Date`, `Date32`, `DateTime`, `Bool`, `UUID` に適用されます。

:::


## 使用例 {#usage-example}

MongoDBに [sample_mflix](https://www.mongodb.com/docs/atlas/sample-data/sample-mflix) データセットがロードされていると仮定します。

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
plot:      友人のドクター・エメット・ブラウンが発明したタイムトラベル・デロリアンで30年前に偶然送り込まれた若者が、自らの存在を救うために高校時代の両親が結ばれるようにしなければならない。
genres:    ['Adventure','Comedy','Sci-Fi']
directors: ['Robert Zemeckis']
released:  1985-07-03

Row 2:
──────
title:     Back to the Future Part II
plot:      2015年を訪れたマーティ・マクフライは、1985年への災害の変更を防ぐために1955年への訪問を繰り返さなければならないが、自らの初回旅行には干渉してはいけない。
genres:    ['Action','Adventure','Comedy']
directors: ['Robert Zemeckis']
released:  1989-11-22
```

```sql
-- コーマック・マッカーシーの本に基づくトップ3の映画を見つける
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

実装の詳細は、[mongocxx](https://github.com/mongodb/mongo-cxx-driver)および[mongoc](https://github.com/mongodb/mongo-c-driver)のドキュメントで確認できます。
