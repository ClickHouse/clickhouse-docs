```json
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics","labels":{"type":"database systems","founded":"2021"}},"dob":"2007-03-31","tags":{"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}}}
```

このJSONオブジェクトを扱うテーブルは次のようになります。

```sql
CREATE TABLE people
(
    `id` Int64,
    `name` String,
    `username` String,
    `email` String,
    `address` Array(Tuple(city String, geo Tuple(lat Float32, lng Float32), street String, suite String, zipcode String)),
    `phone_numbers` Array(String),
    `website` String,
    `company` Tuple(catchPhrase String, name String, labels Map(String, String)),
    `dob` Date,
    `tags` String
)
ENGINE = MergeTree
ORDER BY username
```

この場合、`labels`カラムを持つ`company`オブジェクトに対して、異なるラベルの設定が許可されます。これにより、データの柔軟性が高まります。

```sql
SELECT
    company.labels['type'] AS type,
    company.labels['founded'] AS founded
FROM people
```

このように`Map`型を利用すると、特定のキーに対する効率的な対応が可能になりますが、すべてのフィールドが同じ型でなければならないという制約があります。`Map`型を使用する場合の重要なポイントは、内容の一貫性を保ちつつデータの柔軟性を確保することです。直感的ではない部分も多いですが、システムパフォーマンスの観点から優れた選択肢となります。

## まとめ

各JSONオブジェクトの適切な扱い方を理解し、データが持つ特性に応じて設計を行うことが重要です。これにより、ClickHouse内でのデータ処理効率を最大限に引き上げることが可能になります。また、静的か動的かを判断し、それに応じて`Tuple`や`Map`、`String`などのデータ型を適切に使い分けることで、効果的なデータ管理が実現します。

JSONスキーマの設計は、パフォーマンスや互換性の観点からも重要な要素を含んでいます。正しいアプローチを用いることで、データアーキテクチャ全体の質が向上し、最終的にそれがビジネスの意思決定に寄与することになります。
```markdown
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"分析用のリアルタイムデータウェアハウス","labels":{"type":"データベースシステム","founded":"2021"}},"dob":"2007-03-31","tags":{"hobby":"データベース","holidays":[{"year":2024,"location":"アゾレス、ポルトガル"}],"car":{"model":"テスラ","year":2023}}}

Ok.

1 行が設定されました。経過時間: 0.002 秒。
```

リクエストオブジェクト内のこれらのフィールドをクエリするには、マップ構文を使用します。例:

```sql
SELECT company.labels FROM people

┌─company.labels───────────────────────────────┐
│ {'type':'データベースシステム','founded':'2021'} │
└──────────────────────────────────────────────┘

1 行が設定されました。経過時間: 0.001 秒。

SELECT company.labels['type'] AS type FROM people

┌─type─────────────┐
│ データベースシステム │
└──────────────────┘

1 行が設定されました。経過時間: 0.001 秒。
```

この時にクエリするための完全な `Map` 関数のセットが利用可能で、詳細は [こちら](/sql-reference/functions/tuple-map-functions.md) に記載されています。データが一貫した型でない場合は、[必要な型変換](/sql-reference/functions/type-conversion-functions) を行うための関数があります。

#### オブジェクト値 {#object-values}

`Map` タイプはサブオブジェクトを持つオブジェクトのために考慮することもできますが、そのサブオブジェクトは型が一貫している必要があります。

例えば、私たちの `persons` オブジェクトの `tags` キーが一貫した構造を必要とし、各 `tag` のサブオブジェクトに `name` と `time` カラムが必要な場合、以下のような簡略化された JSON ドキュメントが考えられます。

```json
{
  "id": 1,
  "name": "Clicky McCliickHouse",
  "username": "Clicky",
  "email": "clicky@clickhouse.com",
  "tags": {
    "hobby": {
      "name": "ダイビング",
      "time": "2024-07-11 14:18:01"
    },
    "car": {
      "name": "テスラ",
      "time": "2024-07-11 15:18:23"
    }
  }
}
```

以下のように `Map(String, Tuple(name String, time DateTime))` でモデル化できます。

```sql
CREATE TABLE people
(
    `id` Int64,
    `name` String,
    `username` String,
    `email` String,
    `tags` Map(String, Tuple(name String, time DateTime))
)
ENGINE = MergeTree
ORDER BY username

INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","tags":{"hobby":{"name":"ダイビング","time":"2024-07-11 14:18:01"},"car":{"name":"テスラ","time":"2024-07-11 15:18:23"}}}

Ok.

1 行が設定されました。経過時間: 0.002 秒。

SELECT tags['hobby'] AS hobby
FROM people
FORMAT JSONEachRow

{"hobby":{"name":"ダイビング","time":"2024-07-11 14:18:01"}}

1 行が設定されました。経過時間: 0.001 秒。
```

この場合のマップの適用は一般的に稀であり、動的キー名がサブオブジェクトを持たないようにデータを再モデル化することを示唆しています。例えば、上記を以下のように再モデル化し、`Array(Tuple(key String, name String, time DateTime))` を使用することができます。

```json
{
  "id": 1,
  "name": "Clicky McCliickHouse",
  "username": "Clicky",
  "email": "clicky@clickhouse.com",
  "tags": [
    {
      "key": "hobby",
      "name": "ダイビング",
      "time": "2024-07-11 14:18:01"
    },
    {
      "key": "car",
      "name": "テスラ",
      "time": "2024-07-11 15:18:23"
    }
  ]
}
```
