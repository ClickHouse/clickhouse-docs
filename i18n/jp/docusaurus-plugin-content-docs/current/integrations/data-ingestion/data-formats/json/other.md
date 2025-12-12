---
title: 'その他のJSONアプローチ'
slug: /integrations/data-formats/json/other-approaches
description: 'JSONをモデル化する他のアプローチ'
keywords: ['json', 'formats']
doc_type: 'reference'
---

# JSONをモデル化する他のアプローチ

**以下は、ClickHouseでJSONをモデル化する代替手段です。これらは完全性のために文書化されており、JSON型の開発前に適用可能でしたが、ほとんどのユースケースでは一般的に推奨されず、適用可能でもありません。**

:::note オブジェクトレベルのアプローチを適用する
同じスキーマ内の異なるオブジェクトに異なる技術を適用できます。たとえば、一部のオブジェクトは`String`型で最もよく解決でき、他のオブジェクトは`Map`型で解決できます。`String`型を使用すると、それ以上のスキーマの決定を行う必要がないことに注意してください。逆に、以下に示すように、JSONを表す`String`を含む`Map`キー内にサブオブジェクトをネストすることは可能です:
:::

## String型の使用 {#using-string}

オブジェクトが高度に動的で、予測可能な構造がなく、任意のネストされたオブジェクトが含まれている場合は、`String`型を使用する必要があります。以下に示すように、JSON関数を使用してクエリ時に値を抽出できます。

上記で説明した構造化アプローチを使用したデータの処理は、変更される可能性がある、またはスキーマが十分に理解されていない動的JSONを持つユーザーにとって、しばしば実行可能ではありません。絶対的な柔軟性を得るために、JSONを`String`として保存してから、必要に応じて関数を使用してフィールドを抽出することができます。これは、JSONを構造化オブジェクトとして処理することの正反対を表します。この柔軟性にはコストがかかり、重大な欠点があります - 主にクエリ構文の複雑さの増加とパフォーマンスの低下です。

前述したように、[元のpersonオブジェクト](/integrations/data-formats/json/schema#static-vs-dynamic-json)の場合、`tags`列の構造を保証することはできません。元の行(`company.labels`を含み、今のところ無視します)を挿入し、`Tags`列を`String`として宣言します:

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
    `company` Tuple(catchPhrase String, name String),
    `dob` Date,
    `tags` String
)
ENGINE = MergeTree
ORDER BY username

INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics","labels":{"type":"database systems","founded":"2021"}},"dob":"2007-03-31","tags":{"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}}}

Ok.
1 row in set. Elapsed: 0.002 sec.
```

`tags`列を選択すると、JSONが文字列として挿入されていることがわかります:

```sql
SELECT tags
FROM people

┌─tags───────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ {"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}} │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.001 sec.
```

[`JSONExtract`](/sql-reference/functions/json-functions#jsonextract-functions)関数を使用して、このJSONから値を取得できます。以下の簡単な例を考えてみましょう:

```sql
SELECT JSONExtractString(tags, 'holidays') AS holidays FROM people

┌─holidays──────────────────────────────────────┐
│ [{"year":2024,"location":"Azores, Portugal"}] │
└───────────────────────────────────────────────┘

1 row in set. Elapsed: 0.002 sec.
```

関数が`String`列`tags`への参照とJSONで抽出するパスの両方を必要とすることに注意してください。ネストされたパスでは、関数をネストする必要があります。例えば、`JSONExtractUInt(JSONExtractString(tags, 'car'), 'year')`は列`tags.car.year`を抽出します。ネストされたパスの抽出は、関数[`JSON_QUERY`](/sql-reference/functions/json-functions#JSON_QUERY)と[`JSON_VALUE`](/sql-reference/functions/json-functions#JSON_VALUE)を通じて簡素化できます。

本体全体を`String`と見なす`arxiv`データセットでの極端なケースを考えてみましょう。

```sql
CREATE TABLE arxiv (
  body String
)
ENGINE = MergeTree ORDER BY ()
```

このスキーマに挿入するには、`JSONAsString`形式を使用する必要があります:

```sql
INSERT INTO arxiv SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz', 'JSONAsString')

0 rows in set. Elapsed: 25.186 sec. Processed 2.52 million rows, 1.38 GB (99.89 thousand rows/s., 54.79 MB/s.)
```

年ごとにリリースされた論文の数をカウントしたいとします。文字列のみを使用した次のクエリと、スキーマの[構造化バージョン](/integrations/data-formats/json/inference#creating-tables)を対比してください:

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

ここでXPath式を使用してメソッドでJSONをフィルタリングしていることに注意してください。つまり、`JSON_VALUE(body, '$.versions[0].created')`です。

String関数は、インデックスを使用した明示的な型変換よりもかなり遅い(> 10倍)です。上記のクエリは常にフルテーブルスキャンとすべての行の処理を必要とします。これらのクエリは、このような小さなデータセットでは依然として高速ですが、より大きなデータセットではパフォーマンスが低下します。

このアプローチの柔軟性には明確なパフォーマンスと構文のコストが伴い、スキーマ内の高度に動的なオブジェクトに対してのみ使用する必要があります。

### 単純なJSON関数 {#simple-json-functions}

上記の例では、JSON*ファミリーの関数を使用しています。これらは、[simdjson](https://github.com/simdjson/simdjson)に基づく完全なJSONパーサーを利用しており、解析において厳密で、異なるレベルでネストされた同じフィールドを区別します。これらの関数は、構文的には正しいが整形式ではないJSON、たとえばキー間の二重スペースなどを処理できます。

より高速で厳格な一連の関数が利用可能です。これらの`simpleJSON*`関数は、主にJSONの構造と形式に関して厳格な仮定を行うことで、潜在的に優れたパフォーマンスを提供します。具体的には:

- フィールド名は定数でなければなりません
- フィールド名の一貫したエンコーディング。例: `simpleJSONHas('{"abc":"def"}', 'abc') = 1`ですが、`visitParamHas('{"\\u0061\\u0062\\u0063":"def"}', 'abc') = 0`
- フィールド名はすべてのネストされた構造全体で一意です。ネストレベル間で区別は行われず、マッチングは無差別です。複数の一致するフィールドがある場合、最初に出現したものが使用されます。
- 文字列リテラル以外に特殊文字はありません。これにはスペースが含まれます。以下は無効で、解析されません。

    ```json
    {"@timestamp": 893964617, "clientip": "40.135.0.0", "request": {"method": "GET",
    "path": "/images/hm_bg.jpg", "version": "HTTP/1.0"}, "status": 200, "size": 24736}
    ```

一方、以下は正しく解析されます:

```json
{"@timestamp":893964617,"clientip":"40.135.0.0","request":{"method":"GET",
    "path":"/images/hm_bg.jpg","version":"HTTP/1.0"},"status":200,"size":24736}
```

パフォーマンスが重要で、JSONが上記の要件を満たす場合、これらは適切である可能性があります。`simpleJSON*`関数を使用するように書き直した以前のクエリの例を以下に示します:

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
Peak memory usage: 211.49 MiB.
```

上記のクエリは、`simpleJSONExtractString`を使用して`created`キーを抽出し、公開日に対して最初の値のみが必要であるという事実を利用しています。この場合、`simpleJSON*`関数の制限は、パフォーマンスの向上のために許容されます。

## Map型の使用 {#using-map}

オブジェクトが任意のキーを保存するために使用され、ほとんどが1つの型の場合は、`Map`型の使用を検討してください。理想的には、ユニークなキーの数は数百を超えないようにする必要があります。`Map`型は、後者がその型に均一性を持っている場合、サブオブジェクトを持つオブジェクトにも検討できます。一般的に、ラベルとタグ、たとえばログデータ内のKubernetesポッドラベルには`Map`型を使用することをお勧めします。

`Map`はネストされた構造を表現する簡単な方法を提供しますが、いくつかの注目すべき制限があります:

- フィールドはすべて同じ型でなければなりません。
- サブ列へのアクセスには、フィールドが列として存在しないため、特別なマップ構文が必要です。オブジェクト全体_が_列です。
- サブ列へのアクセスは、`Map`値全体、つまりすべての兄弟とそれぞれの値をロードします。大きなマップの場合、これは重大なパフォーマンスペナルティにつながる可能性があります。

:::note Stringキー
オブジェクトを`Map`としてモデル化する場合、JSONキー名を保存するために`String`キーが使用されます。したがって、マップは常に`Map(String, T)`になります。ここで、`T`はデータによって異なります。
:::

#### プリミティブ値 {#primitive-values}

`Map`の最も単純な適用は、オブジェクトに値として同じプリミティブ型が含まれている場合です。ほとんどの場合、これには値`T`に対して`String`型を使用することが含まれます。

`company.labels`オブジェクトが動的であると判断された[以前のperson JSON](/integrations/data-formats/json/schema#static-vs-dynamic-json)を考えてみましょう。重要なことに、このオブジェクトにはString型のキーと値のペアのみが追加されることが予想されます。したがって、これを`Map(String, String)`として宣言できます:

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

元の完全なJSONオブジェクトを挿入できます:

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics","labels":{"type":"database systems","founded":"2021"}},"dob":"2007-03-31","tags":{"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}}}

Ok.

1 row in set. Elapsed: 0.002 sec.
```

リクエストオブジェクト内のこれらのフィールドをクエリするには、マップ構文が必要です。例:

```sql
SELECT company.labels FROM people

┌─company.labels───────────────────────────────┐
│ {'type':'database systems','founded':'2021'} │
└──────────────────────────────────────────────┘

1 row in set. Elapsed: 0.001 sec.

SELECT company.labels['type'] AS type FROM people

┌─type─────────────┐
│ database systems │
└──────────────────┘

1 row in set. Elapsed: 0.001 sec.
```

この時点でこの型をクエリするための完全な`Map`関数のセットが利用可能で、[こちら](/sql-reference/functions/tuple-map-functions.md)で説明されています。データの型が一貫していない場合、[必要な型強制](/sql-reference/functions/type-conversion-functions)を実行する関数が存在します。

#### オブジェクト値 {#object-values}

`Map`型は、後者がその型に一貫性を持っている場合、サブオブジェクトを持つオブジェクトにも検討できます。

`persons`オブジェクトの`tags`キーが一貫した構造を必要とし、各`tag`のサブオブジェクトに`name`と`time`列があるとします。そのようなJSONドキュメントの簡略化された例は次のようになります:

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

これは、以下に示すように`Map(String, Tuple(name String, time DateTime))`でモデル化できます:

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

1 row in set. Elapsed: 0.002 sec.

SELECT tags['hobby'] AS hobby
FROM people
FORMAT JSONEachRow

{"hobby":{"name":"Diving","time":"2024-07-11 14:18:01"}}

1 row in set. Elapsed: 0.001 sec.
```

この場合のマップの適用は通常まれであり、動的キー名にサブオブジェクトがないようにデータを再モデル化する必要があることを示唆しています。たとえば、上記は次のように再モデル化でき、`Array(Tuple(key String, name String, time DateTime))`の使用が可能になります。

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

## Nested型の使用 {#using-nested}

[Nested型](/sql-reference/data-types/nested-data-structures/nested)は、変更されることがほとんどない静的オブジェクトをモデル化するために使用でき、`Tuple`と`Array(Tuple)`の代替を提供します。その動作はしばしば混乱を招くため、JSONにはこの型を使用しないことを一般的にお勧めします。`Nested`の主な利点は、サブ列を順序キーで使用できることです。

以下では、Nested型を使用して静的オブジェクトをモデル化する例を示します。JSONの次の簡単なログエントリを考えてみましょう:

```json
{
  "timestamp": 897819077,
  "clientip": "45.212.12.0",
  "request": {
    "method": "GET",
    "path": "/french/images/hm_nav_bar.gif",
    "version": "HTTP/1.0"
  },
  "status": 200,
  "size": 3305
}
```

`request`キーを`Nested`として宣言できます。`Tuple`と同様に、サブ列を指定する必要があります。

```sql
-- default
SET flatten_nested=1
CREATE table http
(
   timestamp Int32,
   clientip     IPv4,
   request Nested(method LowCardinality(String), path String, version LowCardinality(String)),
   status       UInt16,
   size         UInt32,
) ENGINE = MergeTree() ORDER BY (status, timestamp);
```

### flatten_nested {#flatten_nested}

設定`flatten_nested`は、nestedの動作を制御します。

#### flatten_nested=1 {#flatten_nested1}

値`1`(デフォルト)は、任意のレベルのネストをサポートしません。この値では、ネストされたデータ構造を同じ長さの複数の[Array](/sql-reference/data-types/array)列と考えるのが最も簡単です。フィールド`method`、`path`、`version`は、すべて事実上個別の`Array(Type)`列であり、1つの重要な制約があります: **`method`、`path`、`version`フィールドの長さは同じでなければなりません。** `SHOW CREATE TABLE`を使用すると、これが示されます:

```sql
SHOW CREATE TABLE http

CREATE TABLE http
(
    `timestamp` Int32,
    `clientip` IPv4,
    `request.method` Array(LowCardinality(String)),
    `request.path` Array(String),
    `request.version` Array(LowCardinality(String)),
    `status` UInt16,
    `size` UInt32
)
ENGINE = MergeTree
ORDER BY (status, timestamp)
```

以下では、このテーブルに挿入します:

```sql
SET input_format_import_nested_json = 1;
INSERT INTO http
FORMAT JSONEachRow
{"timestamp":897819077,"clientip":"45.212.12.0","request":[{"method":"GET","path":"/french/images/hm_nav_bar.gif","version":"HTTP/1.0"}],"status":200,"size":3305}
```

注意すべき重要な点がいくつかあります:

* ネストされた構造としてJSONを挿入するには、設定`input_format_import_nested_json`を使用する必要があります。これがないと、JSONをフラット化する必要があります。つまり

    ```sql
    INSERT INTO http FORMAT JSONEachRow
    {"timestamp":897819077,"clientip":"45.212.12.0","request":{"method":["GET"],"path":["/french/images/hm_nav_bar.gif"],"version":["HTTP/1.0"]},"status":200,"size":3305}
    ```
* ネストされたフィールド`method`、`path`、`version`は、JSON配列として渡す必要があります。つまり

  ```json
  {
    "@timestamp": 897819077,
    "clientip": "45.212.12.0",
    "request": {
      "method": [
        "GET"
      ],
      "path": [
        "/french/images/hm_nav_bar.gif"
      ],
      "version": [
        "HTTP/1.0"
      ]
    },
    "status": 200,
    "size": 3305
  }
  ```

列は、ドット記法を使用してクエリできます:

```sql
SELECT clientip, status, size, `request.method` FROM http WHERE has(request.method, 'GET');

┌─clientip────┬─status─┬─size─┬─request.method─┐
│ 45.212.12.0 │    200 │ 3305 │ ['GET']        │
└─────────────┴────────┴──────┴────────────────┘
1 row in set. Elapsed: 0.002 sec.
```

サブ列に`Array`を使用することは、完全な[Array関数](/sql-reference/functions/array-functions)を潜在的に利用できることを意味します。これには[`ARRAY JOIN`](/sql-reference/statements/select/array-join)句も含まれます - 列に複数の値がある場合に便利です。

#### flatten_nested=0 {#flatten_nested0}

これにより、任意のレベルのネストが可能になり、ネストされた列は`Tuple`の単一の配列として保持されます - 事実上、`Array(Tuple)`と同じになります。

**これは、JSONで`Nested`を使用する好ましい方法であり、多くの場合最も簡単な方法です。以下に示すように、すべてのオブジェクトがリストである必要があるだけです。**

以下では、テーブルを再作成し、行を再挿入します:

```sql
CREATE TABLE http
(
    `timestamp` Int32,
    `clientip` IPv4,
    `request` Nested(method LowCardinality(String), path String, version LowCardinality(String)),
    `status` UInt16,
    `size` UInt32
)
ENGINE = MergeTree
ORDER BY (status, timestamp)

SHOW CREATE TABLE http

-- Nested型が保持されることに注意してください。
CREATE TABLE default.http
(
    `timestamp` Int32,
    `clientip` IPv4,
    `request` Nested(method LowCardinality(String), path String, version LowCardinality(String)),
    `status` UInt16,
    `size` UInt32
)
ENGINE = MergeTree
ORDER BY (status, timestamp)

INSERT INTO http
FORMAT JSONEachRow
{"timestamp":897819077,"clientip":"45.212.12.0","request":[{"method":"GET","path":"/french/images/hm_nav_bar.gif","version":"HTTP/1.0"}],"status":200,"size":3305}
```

注意すべき重要な点がいくつかあります:

* `input_format_import_nested_json`は挿入に必要ありません。
* `SHOW CREATE TABLE`で`Nested`型が保持されます。この列の下は事実上`Array(Tuple(Nested(method LowCardinality(String), path String, version LowCardinality(String))))`です
* その結果、`request`を配列として挿入する必要があります。つまり

  ```json
  {
    "timestamp": 897819077,
    "clientip": "45.212.12.0",
    "request": [
      {
        "method": "GET",
        "path": "/french/images/hm_nav_bar.gif",
        "version": "HTTP/1.0"
      }
    ],
    "status": 200,
    "size": 3305
  }
  ```

列は、ドット記法を使用して再度クエリできます:

```sql
SELECT clientip, status, size, `request.method` FROM http WHERE has(request.method, 'GET');

┌─clientip────┬─status─┬─size─┬─request.method─┐
│ 45.212.12.0 │    200 │ 3305 │ ['GET']        │
└─────────────┴────────┴──────┴────────────────┘
1 row in set. Elapsed: 0.002 sec.
```

### 例 {#example}

上記のデータのより大きな例は、s3のパブリックバケット(`s3://datasets-documentation/http/`)で利用可能です。

```sql
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/documents-01.ndjson.gz', 'JSONEachRow')
LIMIT 1
FORMAT PrettyJSONEachRow

{
    "@timestamp": "893964617",
    "clientip": "40.135.0.0",
    "request": {
        "method": "GET",
        "path": "\/images\/hm_bg.jpg",
        "version": "HTTP\/1.0"
    },
    "status": "200",
    "size": "24736"
}

1 row in set. Elapsed: 0.312 sec.
```

JSONの制約と入力形式を考慮して、次のクエリを使用してこのサンプルデータセットを挿入します。ここで、`flatten_nested=0`を設定します。

次のステートメントは1000万行を挿入するため、実行には数分かかる場合があります。必要に応じて`LIMIT`を適用してください:

```sql
INSERT INTO http
SELECT `@timestamp` AS `timestamp`, clientip, [request], status,
size FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/documents-01.ndjson.gz',
'JSONEachRow');
```

このデータをクエリするには、リクエストフィールドに配列としてアクセスする必要があります。以下では、固定期間にわたってエラーとhttpメソッドを要約します。

```sql
SELECT status, request.method[1] AS method, count() AS c
FROM http
WHERE status >= 400
  AND toDateTime(timestamp) BETWEEN '1998-01-01 00:00:00' AND '1998-06-01 00:00:00'
GROUP BY method, status
ORDER BY c DESC LIMIT 5;

┌─status─┬─method─┬─────c─┐
│    404 │ GET    │ 11267 │
│    404 │ HEAD   │   276 │
│    500 │ GET    │   160 │
│    500 │ POST   │   115 │
│    400 │ GET    │    81 │
└────────┴────────┴───────┘

5 rows in set. Elapsed: 0.007 sec.
```

### ペアワイズ配列の使用 {#using-pairwise-arrays}

ペアワイズ配列は、JSONを文字列として表現する柔軟性と、より構造化されたアプローチのパフォーマンスのバランスを提供します。スキーマは、新しいフィールドを潜在的にルートに追加できるという点で柔軟です。ただし、これにははるかに複雑なクエリ構文が必要であり、ネストされた構造とは互換性がありません。

例として、次のテーブルを考えてみましょう:

```sql
CREATE TABLE http_with_arrays (
   keys Array(String),
   values Array(String)
)
ENGINE = MergeTree  ORDER BY tuple();
```

このテーブルに挿入するには、JSONをキーと値のリストとして構造化する必要があります。次のクエリは、これを実現するために`JSONExtractKeysAndValues`の使用を示しています:

```sql
SELECT
    arrayMap(x -> (x.1), JSONExtractKeysAndValues(json, 'String')) AS keys,
    arrayMap(x -> (x.2), JSONExtractKeysAndValues(json, 'String')) AS values
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/documents-01.ndjson.gz', 'JSONAsString')
LIMIT 1
FORMAT Vertical

Row 1:
──────
keys:   ['@timestamp','clientip','request','status','size']
values: ['893964617','40.135.0.0','{"method":"GET","path":"/images/hm_bg.jpg","version":"HTTP/1.0"}','200','24736']

1 row in set. Elapsed: 0.416 sec.
```

request列が文字列として表現されたネストされた構造のままであることに注意してください。ルートに新しいキーを挿入できます。JSON自体に任意の違いを持つこともできます。ローカルテーブルに挿入するには、次を実行します:

```sql
INSERT INTO http_with_arrays
SELECT
    arrayMap(x -> (x.1), JSONExtractKeysAndValues(json, 'String')) AS keys,
    arrayMap(x -> (x.2), JSONExtractKeysAndValues(json, 'String')) AS values
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/documents-01.ndjson.gz', 'JSONAsString')

0 rows in set. Elapsed: 12.121 sec. Processed 10.00 million rows, 107.30 MB (825.01 thousand rows/s., 8.85 MB/s.)
```

この構造をクエリするには、[`indexOf`](/sql-reference/functions/array-functions#indexOf)関数を使用して必要なキーのインデックスを特定する必要があります(値の順序と一致する必要があります)。これを使用して、values配列列にアクセスできます。つまり、`values[indexOf(keys, 'status')]`です。request列にはJSON解析メソッドが依然として必要です - この場合は`simpleJSONExtractString`です。

```sql
SELECT toUInt16(values[indexOf(keys, 'status')])                           AS status,
       simpleJSONExtractString(values[indexOf(keys, 'request')], 'method') AS method,
       count()                                                             AS c
FROM http_with_arrays
WHERE status >= 400
  AND toDateTime(values[indexOf(keys, '@timestamp')]) BETWEEN '1998-01-01 00:00:00' AND '1998-06-01 00:00:00'
GROUP BY method, status ORDER BY c DESC LIMIT 5;

┌─status─┬─method─┬─────c─┐
│    404 │ GET    │ 11267 │
│    404 │ HEAD   │   276 │
│    500 │ GET    │   160 │
│    500 │ POST   │   115 │
│    400 │ GET    │    81 │
└────────┴────────┴───────┘

5 rows in set. Elapsed: 0.383 sec. Processed 8.22 million rows, 1.97 GB (21.45 million rows/s., 5.15 GB/s.)
Peak memory usage: 51.35 MiB.
```
