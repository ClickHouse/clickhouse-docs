```json
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics","labels":{"type":"database systems","founded":"2021"}},"dob":"2007-03-31","tags":{"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}}}
```

この完全なJSONオブジェクトを挿入することができます：

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics","labels":{"type":"database systems","founded":"2021"}},"dob":"2007-03-31","tags":{"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}}}

Ok.
1 row in set. Elapsed: 0.002 sec.
```

`tags`カラムを選択すると、JSONが文字列として挿入されたことが確認できます：

```sql
SELECT tags
FROM people

┌─tags───────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ {"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}} │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.001 sec.
```

[JSONExtract](/sql-reference/functions/json-functions#jsonextract-functions)関数を使用して、このJSONから値を取得できます。以下は単純な例です：

```sql
SELECT JSONExtractString(tags, 'holidays') as holidays FROM people

┌─holidays──────────────────────────────────────┐
│ [{"year":2024,"location":"Azores, Portugal"}] │
└───────────────────────────────────────────────┘

1 row in set. Elapsed: 0.002 sec.
```

関数には、`String`カラム`tags`への参照と、抽出するためのJSON内のパスが必要です。ネストされたパスを取得するには、関数をネストする必要があります。例：`JSONExtractUInt(JSONExtractString(tags, 'car'), 'year')`は、`tags.car.year`カラムを抽出します。ネストされたパスの抽出は、[JSON_QUERY](/sql-reference/functions/json-functions.md/#json_queryjson-path)および[JSON_VALUE](/sql-reference/functions/json-functions.md/#json_valuejson-path)関数によって簡素化できます。

次の例では、`arxiv`データセットを考慮し、全体のボディを`String`と見なします。

```sql
CREATE TABLE arxiv (
  body String
)
ENGINE = MergeTree ORDER BY ()
```

このスキーマに挿入するには、`JSONAsString`形式を使用する必要があります：

```sql
INSERT INTO arxiv SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz', 'JSONAsString')

0 rows in set. Elapsed: 25.186 sec. Processed 2.52 million rows, 1.38 GB (99.89 thousand rows/s., 54.79 MB/s.)
```

年ごとに発表された論文の数をカウントしたいとします。スキーマの[構造化バージョン](/integrations/data-formats/json/inference#creating-tables)と、文字列のみを使用する場合とを比較します：

```sql
-- 構造化スキーマを使用
SELECT
    toYear(parseDateTimeBestEffort(versions.created[1])) AS published_year,
    count() AS c
FROM arxiv_v2
GROUP BY published_year
ORDER BY c ASC
LIMIT 10

┌─published_year─┬─────c─┐
│           1986 │     1 │
│           1988 │     1 │
│           1989 │     6 │
│           1990 │    26 │
│           1991 │   353 │
│           1992 │  3190 │
│           1993 │  6729 │
│           1994 │ 10078 │
│           1995 │ 13006 │
│           1996 │ 15872 │
└────────────────┴───────┘

10 rows in set. Elapsed: 0.264 sec. Processed 2.31 million rows, 153.57 MB (8.75 million rows/s., 582.58 MB/s.)

-- 非構造化Stringを使用

SELECT
    toYear(parseDateTimeBestEffort(JSON_VALUE(body, '$.versions[0].created'))) AS published_year,
    count() AS c
FROM arxiv
GROUP BY published_year
ORDER BY published_year ASC
LIMIT 10

┌─published_year─┬─────c─┐
│           1986 │     1 │
│           1988 │     1 │
│           1989 │     6 │
│           1990 │    26 │
│           1991 │   353 │
│           1992 │  3190 │
│           1993 │  6729 │
│           1994 │ 10078 │
│           1995 │ 13006 │
│           1996 │ 15872 │
└────────────────┴───────┘

10 rows in set. Elapsed: 1.281 sec. Processed 2.49 million rows, 4.22 GB (1.94 million rows/s., 3.29 GB/s.)
Peak memory usage: 205.98 MiB.
```

XPath式をここで使用し、メソッドによってJSONをフィルタリングしています。すなわち、`JSON_VALUE(body, '$.versions[0].created')`です。

文字列関数は、明示的な型変換によるインデックスを使用する場合よりも著しく遅く（> 10倍）、これらのクエリは常にフルテーブルスキャンを必要とし、すべての行の処理が行われます。この方法の柔軟性は明らかなパフォーマンスと構文のコストを伴い、スキーマ内の非常に動的なオブジェクトにのみ使用すべきです。

#### 簡単なJSON関数 {#simple-json-functions}

上記の例では、JSON*ファミリーの関数を使用しています。これらは、[simdjson](https://github.com/simdjson/simdjson)に基づくフルJSONパーサーを利用しており、厳密に解析を行い、異なるレベルで入れ子にされた同じフィールドを区別します。これらの関数は、文法的には正しいがあまり整形されていないJSONを扱うことができます。例えば、キー間の二重空白など。

パフォーマンスが重要な場合、必要な要件を満たす場合には、高速でより厳格な関数のセットが利用可能です。これらの`simpleJSON*`関数は、JSONの構造や形式についての厳格な仮定を行うことで、潜在的に優れたパフォーマンスを提供します。

* フィールド名は定数である必要があります。
* フィールド名の一貫したエンコーディング（例えば、`simpleJSONHas('{"abc":"def"}', 'abc') = 1`）。
* フィールド名は入れ子の構造全体にわたり一意である必要があります。入れ子レベルの違いは区別されず、照合は無差別です。複数の一致するフィールドがある場合、最初の出現を使用します。
* 文字列リテラルの外に特別な文字は使用できません。これには空白が含まれます。以下は無効とされ、解析されません。

    ```json
    {"@timestamp": 893964617, "clientip": "40.135.0.0", "request": {"method": "GET",
    "path": "/images/hm_bg.jpg", "version": "HTTP/1.0"}, "status": 200, "size": 24736}
    ```

    一方で、以下は正しく解析されます：

    ```json
    {"@timestamp":893964617,"clientip":"40.135.0.0","request":{"method":"GET",
    "path":"/images/hm_bg.jpg","version":"HTTP/1.0"},"status":200,"size":24736}
    ```

このような場合には、パフォーマンスが重要な場合に`simpleJSON*`関数を使用することが適切です。以下は、`simpleJSON*`関数を使用して書き換えた以前のクエリの例です：

```sql
SELECT
    toYear(parseDateTimeBestEffort(simpleJSONExtractString(simpleJSONExtractRaw(body, 'versions'), 'created'))) AS published_year,
    count() AS c
FROM arxiv
GROUP BY published_year
ORDER BY published_year ASC
LIMIT 10

┌─published_year─┬─────c─┐
│           1986 │     1 │
│           1988 │     1 │
│           1989 │     6 │
│           1990 │    26 │
│           1991 │   353 │
│           1992 │  3190 │
│           1993 │  6729 │
│           1994 │ 10078 │
│           1995 │ 13006 │
│           1996 │ 15872 │
└────────────────┴───────┘

10 rows in set. Elapsed: 0.964 sec. Processed 2.48 million rows, 4.21 GB (2.58 million rows/s., 4.36 GB/s.)
```

上記は、最初の値だけを求めるために`simpleJSONExtractString`を使用し、`created`キーを抽出しています。この場合、`simpleJSON*`関数の制限はパフォーマンス向上のために許容できるものとなります。

### Mapの使用 {#using-map}

オブジェクトが主に1つの型の任意のキーを保存するために使用される場合、`Map`型を使用することを考慮します。理想的には、ユニークなキーの数は数百を超えてはいけません。`Map`型は、ラベルやタグ（例：ログデータ内のKubernetesポッドラベル）のために使用することをお勧めします。`Map`は入れ子構造を表すための簡単な方法ですが、いくつかの顕著な制限があります：

- フィールドはすべて同じ型でなければなりません。
- サブカラムにアクセスするには、特別なマップ構文が必要です。これは、フィールドがカラムとして存在しないためです。オブジェクト全体がカラムとなっています。
- サブカラムにアクセスすると、全体の`Map`値、すなわち全ての兄弟とその値が読み込まれます。大きなマップでは、これがかなりのパフォーマンスペナルティにつながる可能性があります。

:::note 文字列キー
オブジェクトを`Map`としてモデル化する際、JSONキー名を保存するために`String`キーが使用されます。そのため、マップは常に`Map(String, T)`となり、`T`はデータに応じて変わります。
:::

#### 原始的な値 {#primitive-values}

`Map`の最も単純な適用は、オブジェクトが値として同じ原始的タイプを含む場合です。通常、これは値`T`として`String`型を使用することを意味します。

以前の[人JSON](/integrations/data-formats/json/schema#static-vs-dynamic-json)例では、`company.labels`オブジェクトが動的であると判断されました。重要なことに、このオブジェクトには、追加されるキー-値ペアがString型であることのみを期待しています。したがって、これを`Map(String, String)`として宣言できます：

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
    `company` Tuple(catchPhrase String, name String, labels Map(String,String)),
    `dob` Date,
    `tags` String
)
ENGINE = MergeTree
ORDER BY username
```

元の完全なJSONオブジェクトを挿入できます：

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics","labels":{"type":"database systems","founded":"2021"}},"dob":"2007-03-31","tags":{"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}}}
```

このコードを続けることができます。
```markdown
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics","labels":{"type":"database systems","founded":"2021"}},"dob":"2007-03-31","tags":{"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}}}

Ok.

1 行がセットにあります。経過時間: 0.002 秒。
```

これらのフィールドをリクエストオブジェクト内でクエリするには、マップ構文を使用する必要があります。例:

```sql
SELECT company.labels FROM people

┌─company.labels───────────────────────────────┐
│ {'type':'database systems','founded':'2021'} │
└──────────────────────────────────────────────┘

1 行がセットにあります。経過時間: 0.001 秒。

SELECT company.labels['type'] AS type FROM people

┌─type─────────────┐
│ database systems │
└──────────────────┘

1 行がセットにあります。経過時間: 0.001 秒。
```

この時点でクエリできる完全な `Map` 関数のセットが利用可能で、詳細は [こちら](/sql-reference/functions/tuple-map-functions.md) で説明されています。データの型が一貫していない場合、[必要な型変換](/sql-reference/functions/type-conversion-functions)を行うための関数が存在します。

#### オブジェクト値 {#object-values}

`Map` 型は、サブオブジェクトを持つオブジェクトにも考慮することができます。ただし、サブオブジェクトの型は一貫性を持つ必要があります。

例えば、`persons` オブジェクトの `tags` キーが一貫した構造を必要とし、各 `tag` のサブオブジェクトが `name` と `time` カラムを持つとします。このようなJSONドキュメントの簡略化された例は次のようになります:

```json
{
  "id": 1,
  "name": "Clicky McCliickHouse",
  "username": "Clicky",
  "email": "clicky@clickhouse.com",
  "tags": {
    "hobby": {
      "name": "Diving",
      "time": "2024-07-11 14:18:01"
    },
    "car": {
      "name": "Tesla",
      "time": "2024-07-11 15:18:23"
    }
  }
}
```

これは `Map(String, Tuple(name String, time DateTime))` でモデル化できます。以下のように示されています:

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
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","tags":{"hobby":{"name":"Diving","time":"2024-07-11 14:18:01"},"car":{"name":"Tesla","time":"2024-07-11 15:18:23"}}}

Ok.

1 行がセットにあります。経過時間: 0.002 秒。

SELECT tags['hobby'] AS hobby
FROM people
FORMAT JSONEachRow

{"hobby":{"name":"Diving","time":"2024-07-11 14:18:01"}}

1 行がセットにあります。経過時間: 0.001 秒。
```

この場合、マップの適用は通常稀であり、データは動的キー名がサブオブジェクトを持たないように再構築されるべきであることを示唆しています。例えば、上記は次のように再構築して、 `Array(Tuple(key String, name String, time DateTime))` の使用を許可することができます。

```json
{
  "id": 1,
  "name": "Clicky McCliickHouse",
  "username": "Clicky",
  "email": "clicky@clickhouse.com",
  "tags": [
    {
      "key": "hobby",
      "name": "Diving",
      "time": "2024-07-11 14:18:01"
    },
    {
      "key": "car",
      "name": "Tesla",
      "time": "2024-07-11 15:18:23"
    }
  ]
}
```
```
