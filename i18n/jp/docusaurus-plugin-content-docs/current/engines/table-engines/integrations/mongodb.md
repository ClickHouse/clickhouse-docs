---
description: 'MongoDB エンジンは、リモートのコレクションからデータを読み取るための読み取り専用のテーブルエンジンです。'
sidebar_label: 'MongoDB'
sidebar_position: 135
slug: /engines/table-engines/integrations/mongodb
title: 'MongoDB テーブルエンジン'
doc_type: 'reference'
---



# MongoDB テーブルエンジン

MongoDB エンジンは、リモートの [MongoDB](https://www.mongodb.com/) コレクションからデータを読み取るための読み取り専用テーブルエンジンです。

MongoDB v3.6 以降のサーバーのみサポートされています。
[Seed list (`mongodb+srv`)](https://www.mongodb.com/docs/manual/reference/glossary/#std-term-seed-list) にはまだ対応していません。



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

| パラメータ     | 説明                                                                                                                                                                                              |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `host:port`   | MongoDBサーバーのアドレス。                                                                                                                                                                                  |
| `database`    | リモートデータベース名。                                                                                                                                                                                    |
| `collection`  | リモートコレクション名。                                                                                                                                                                                  |
| `user`        | MongoDBユーザー。                                                                                                                                                                                            |
| `password`    | ユーザーパスワード。                                                                                                                                                                                           |
| `options`     | オプション。URL形式の文字列で指定するMongoDB接続文字列[オプション](https://www.mongodb.com/docs/manual/reference/connection-string-options/#connection-options)。例: `'authSource=admin&ssl=true'` |
| `oid_columns` | WHERE句で`oid`として扱うカラムのカンマ区切りリスト。デフォルトは`_id`。                                                                                                   |

:::tip
MongoDB Atlasクラウドサービスを使用している場合、接続URLは'Atlas SQL'オプションから取得できます。
シードリスト(`mongodb**+srv**`)は現在サポートされていませんが、今後のリリースで追加される予定です。
:::

または、URIを渡すこともできます:

```sql
ENGINE = MongoDB(uri, collection[, oid_columns]);
```

**エンジンパラメータ**

| パラメータ     | 説明                                                                                            |
| ------------- | ------------------------------------------------------------------------------------------------------ |
| `uri`         | MongoDBサーバーの接続URI。                                                                       |
| `collection`  | リモートコレクション名。                                                                                |
| `oid_columns` | WHERE句で`oid`として扱うカラムのカンマ区切りリスト。デフォルトは`_id`。 |


## 型マッピング {#types-mappings}

| MongoDB                 | ClickHouse                                                            |
| ----------------------- | --------------------------------------------------------------------- |
| bool, int32, int64      | _Decimal以外の任意の数値型_, Boolean, String                   |
| double                  | Float64, String                                                       |
| date                    | Date, Date32, DateTime, DateTime64, String                            |
| string                  | String, _正しくフォーマットされている場合はDecimal以外の任意の数値型_    |
| document                | String(JSON形式)                                                       |
| array                   | Array, String(JSON形式)                                                |
| oid                     | String                                                                |
| binary                  | カラム内の場合はString、配列またはドキュメント内の場合はbase64エンコードされた文字列 |
| uuid (binary subtype 4) | UUID                                                                  |
| _その他_             | String                                                                |

MongoDBドキュメント内にキーが見つからない場合(例:カラム名が一致しない場合)、デフォルト値または`NULL`(カラムがnullableの場合)が挿入されます。

### OID {#oid}

WHERE句で`String`を`oid`として扱う場合は、テーブルエンジンの最後の引数にカラム名を指定します。
これは、MongoDBでデフォルトで`oid`型を持つ`_id`カラムでレコードをクエリする際に必要になることがあります。
テーブル内の`_id`フィールドが他の型(例:`uuid`)の場合、空の`oid_columns`を指定する必要があります。指定しない場合、このパラメータのデフォルト値である`_id`が使用されます。

```javascript
db.sample_oid.insertMany([{ another_oid_column: ObjectId() }])

db.sample_oid.find()
;[
  {
    _id: { $oid: "67bf6cc44ebc466d33d42fb2" },
    another_oid_column: { $oid: "67bf6cc40000000000ea41b1" }
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

SELECT count() FROM sample_oid WHERE _id = '67bf6cc44ebc466d33d42fb2'; --1を出力します
SELECT count() FROM sample_oid WHERE another_oid_column = '67bf6cc40000000000ea41b1'; --0を出力します
```

この場合、ClickHouseは`another_oid_column`が`oid`型であることを認識していないため、出力は`0`になります。これを修正しましょう:

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

SELECT count() FROM sample_oid WHERE another_oid_column = '67bf6cc40000000000ea41b1'; -- これで1を出力します
```


## サポートされる句 {#supported-clauses}

単純な式を含むクエリのみがサポートされます（例：`WHERE field = <constant> ORDER BY field2 LIMIT <constant>`）。
このような式はMongoDBクエリ言語に変換され、サーバー側で実行されます。
[mongodb_throw_on_unsupported_query](../../../operations/settings/settings.md#mongodb_throw_on_unsupported_query)を使用することで、これらすべての制限を無効化できます。
その場合、ClickHouseはベストエフォートベースでクエリの変換を試みますが、フルテーブルスキャンやClickHouse側での処理が発生する可能性があります。

:::note
Mongoは厳密に型付けされたフィルタを必要とするため、リテラルの型を明示的に設定することを常に推奨します。\
例えば、`Date`でフィルタリングする場合：

```sql
SELECT * FROM mongo_table WHERE date = '2024-01-01'
```

これは動作しません。Mongoは文字列を`Date`にキャストしないため、手動でキャストする必要があります：

```sql
SELECT * FROM mongo_table WHERE date = '2024-01-01'::Date OR date = toDate('2024-01-01')
```

これは`Date`、`Date32`、`DateTime`、`Bool`、`UUID`に適用されます。

:::


## 使用例 {#usage-example}

MongoDBに[sample_mflix](https://www.mongodb.com/docs/atlas/sample-data/sample-mflix)データセットがロードされていることを前提とします

MongoDBコレクションからデータを読み取るためのClickHouseテーブルを作成します:

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
-- JSONExtractStringはMongoDBにプッシュダウンできません
SET mongodb_throw_on_unsupported_query = 0;

-- 評価が7.5を超える「バック・トゥ・ザ・フューチャー」の続編をすべて検索
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
plot:      若い男性が友人のエメット・ブラウン博士が発明したタイムトラベル可能なデロリアンで誤って30年前の過去に送られ、自分の存在を守るために高校生時代の両親を結びつけなければならない。
genres:    ['Adventure','Comedy','Sci-Fi']
directors: ['Robert Zemeckis']
released:  1985-07-03

Row 2:
──────
title:     Back to the Future Part II
plot:      2015年を訪れた後、マーティ・マクフライは1985年への壊滅的な変化を防ぐために1955年への訪問を繰り返さなければならない...最初の旅行に干渉することなく。
genres:    ['Action','Adventure','Comedy']
directors: ['Robert Zemeckis']
released:  1989-11-22
```

```sql
-- コーマック・マッカーシーの著書に基づく上位3作品を検索
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

生成されたMongoDBクエリは、DEBUGレベルのログで確認できます。

実装の詳細については、[mongocxx](https://github.com/mongodb/mongo-cxx-driver)および[mongoc](https://github.com/mongodb/mongo-c-driver)のドキュメントを参照してください。
