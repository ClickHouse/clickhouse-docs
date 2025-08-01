---
title: 'Other JSON approaches'
slug: '/integrations/data-formats/json/other-approaches'
description: 'Other approaches to modeling JSON'
keywords:
- 'json'
- 'formats'
---




# JSONモデリングの他のアプローチ

**以下はClickHouseにおけるJSONのモデリングの代替手法です。これらは、JSON型の開発前に適用できたものであり、完全性のために文書化されています。そのため、多くのユースケースにおいては一般的には推奨されず、適用されません。**

:::note オブジェクトレベルアプローチを適用する
異なるテクニックは、同じスキーマ内の異なるオブジェクトに対して適用される場合があります。例えば、一部のオブジェクトは`String`型を使用するのが最適であり、他のものは`Map`型を使用するのが最適です。`String`型が一度使用されると、それ以上のスキーマの決定を行う必要はありません。一方で、`Map`のキー内にサブオブジェクトをネストすることも可能です - JSONを表す`String`を含む形で、以下に示す通りです。
:::

## Stringを使用する {#using-string}

オブジェクトが非常に動的で、予測できない構造を持ち、任意のネストされたオブジェクトが含まれている場合、ユーザーは`String`型を使用するべきです。値は、以下に示すようにJSON関数を使用してクエリ時に抽出できます。

上記のように構造化アプローチでデータを扱うことは、動的JSONを持つユーザーにとっては実行可能でないことがしばしばあります。これは、変更が加えられる可能性があるか、スキーマが十分に理解されていない場合です。絶対的な柔軟性のために、ユーザーは単にJSONを`String`として保存し、必要に応じてフィールドを抽出するための関数を使用できます。これは、JSONを構造化されたオブジェクトとして扱うことの真逆を表しています。この柔軟性には、重要な欠点が伴い、主にクエリの構文の複雑さの増加やパフォーマンスの劣化をもたらします。

前述の通り、[元の人オブジェクト](/integrations/data-formats/json/schema#static-vs-dynamic-json)については、`tags`カラムの構造を保証することはできません。元の行（`company.labels`を含むが、ここでは無視します）を挿入し、`Tags`カラムを`String`として宣言します：

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

`tags`カラムを選択すると、JSONが文字列として挿入されたことがわかります：

```sql
SELECT tags
FROM people

┌─tags───────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ {"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}} │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.001 sec.
```

[`JSONExtract`](/sql-reference/functions/json-functions#jsonextract-functions)関数を使用して、このJSONから値を取得できます。以下の簡単な例を考えてみましょう：

```sql
SELECT JSONExtractString(tags, 'holidays') as holidays FROM people

┌─holidays──────────────────────────────────────┐
│ [{"year":2024,"location":"Azores, Portugal"}] │
└───────────────────────────────────────────────┘

1 row in set. Elapsed: 0.002 sec.
```

関数は、`String`カラム`tags`への参照と、抽出するためのJSON内のパスの両方を必要とすることに注意してください。ネストされたパスは、関数をネストさせる必要があります。例えば、`JSONExtractUInt(JSONExtractString(tags, 'car'), 'year')`は、カラム`tags.car.year`を抽出します。ネストされたパスの抽出は、関数[`JSON_QUERY`](/sql-reference/functions/json-functions#json_query)および[`JSON_VALUE`](/sql-reference/functions/json-functions#json_value)を通じて簡素化できます。

`arxiv`データセットの極端なケースを考えてみましょう。このデータセットでは、本文全体を`String`として扱います。

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

年ごとにリリースされた論文の数をカウントしたい場合、以下のクエリを考えてみましょう。単なる文字列を使用した場合と[構造化バージョン](/integrations/data-formats/json/inference#creating-tables)のスキーマを対比させます：

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

ここでのXPath式の使用に注目してください。これはメソッドによってJSONをフィルタリングします。すなわち、`JSON_VALUE(body, '$.versions[0].created')`です。

String関数は明らかに遅く（> 10倍）、インデックスを用いた明示的な型変換に比べてパフォーマンスが劣ります。上記のクエリは常に全表スキャンと各行の処理を要求します。このようなクエリは、このような小規模なデータセットでは依然として速いですが、大規模なデータセットではパフォーマンスが劣化します。

このアプローチの柔軟性は、明確なパフォーマンスと構文コストを伴い、スキーマ内の非常に動的なオブジェクトにのみ使用すべきです。

### シンプルなJSON関数 {#simple-json-functions}

上記の例では、JSON*ファミリーの関数が使用されています。これらは、[simdjson](https://github.com/simdjson/simdjson)に基づくフルJSONパーサーを利用しており、厳密に解析され、異なるレベルでネストされた同じフィールドを区別します。これらの関数は、文法的には正しいが適切にフォーマットされていないJSON（例えば、キー間に二重スペースがある場合）も処理できます。

より高速で厳密な関数セットも利用可能です。これらの`simpleJSON*`関数は、主にJSONの構造とフォーマットについて厳密な仮定を行うことにより、潜在的に優れたパフォーマンスを提供します。具体的には：

- フィールド名は定数でなければなりません
- フィールド名の一貫したエンコーディング（例：`simpleJSONHas('{"abc":"def"}', 'abc') = 1`）が必要ですが、`visitParamHas('{"\\u0061\\u0062\\u0063":"def"}', 'abc') = 0`は無効です
- フィールド名は、すべてのネストされた構造の間で一意である必要があります。ネストのレベル間での区別は行われず、マッチは無差別に行われます。複数のフィールドが一致する場合、最初に現れたものが使用されます。
- 文字列リテラル以外の特殊文字はありません。これにはスペースも含まれます。以下は無効であり、解析されません。

    ```json
    {"@timestamp": 893964617, "clientip": "40.135.0.0", "request": {"method": "GET",
    "path": "/images/hm_bg.jpg", "version": "HTTP/1.0"}, "status": 200, "size": 24736}
    ```

次の例は正しく解析されます：

```json
{"@timestamp":893964617,"clientip":"40.135.0.0","request":{"method":"GET",
    "path":"/images/hm_bg.jpg","version":"HTTP/1.0"},"status":200,"size":24736}

パフォーマンスが重要で、JSONが上記の要件を満たす場合、これらの関数が適切であることがあります。前述のクエリの例を`simpleJSON*`関数を使用するように再記述すると、以下のようになります：

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

上記のクエリは、`simpleJSONExtractString`を使用して`created`キーを抽出し、公開日の日付のみを必要とするという事実を利用しています。この場合、`simpleJSON*`関数の制限は、パフォーマンスの向上を伴って許容されるものとなります。

## Mapを使用する {#using-map}

任意のキーを格納するためにオブジェクトが使用される場合、主に1つのタイプの値を持つ場合は、`Map`型を使用することを検討してください。理想的には、ユニークなキーの数は数百を超えないべきです。`Map`型は、サブオブジェクトを持つオブジェクトにも使用できますが、その場合は一貫性が必要です。一般的に、`Map`型はラベルやタグに使用することが推奨されます。例えば、ログデータのKubernetesポッドラベルなどです。

`Map`はネストされた構造を表現する簡単な方法を提供しますが、いくつかの顕著な制限があります：

- フィールドはすべて同じ型でなければなりません。
- サブカラムにアクセスするには特別なマップ構文が必要です。なぜなら、フィールドはカラムとして存在しないからです。オブジェクト全体が**カラム**です。
- サブカラムにアクセスする際には、全ての兄弟とそれぞれの値を含む`Map`値をロードします。大きなマップの場合、これには重大なパフォーマンスペナルティが伴う可能性があります。

:::note 文字列キー
オブジェクトを`Map`としてモデリングする際には、`String`キーを使用してJSONキー名を格納します。したがって、マップは常に`Map(String, T)`となり、ここで`T`はデータに依存します。
:::

#### プリミティブ値 {#primitive-values}

`Map`の最もシンプルな適用は、オブジェクトが同じプリミティブ型の値を含む場合です。ほとんどの場合、これは`String`型の値`T`を使用することを含みます。

先ほどの[人物JSON](/integrations/data-formats/json/schema#static-vs-dynamic-json)を考えてみましょう。ここでは、`company.labels`オブジェクトが動的であることが決定されていました。重要なことに、このオブジェクトには文字列型のキーと値のペアのみが追加されることが期待されています。したがって、これを`Map(String, String)`として宣言できます：

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

元の完全なJSONオブジェクトを挿入します：

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics","labels":{"type":"database systems","founded":"2021"}},"dob":"2007-03-31","tags":{"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}}}

Ok.

1 row in set. Elapsed: 0.002 sec.
```

リクエストオブジェクト内のこれらのフィールドをクエリするには、マップ構文が必要です。例えば：

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

マップ関数の完全なセットが、クエリするために利用可能であり、[こちら](/sql-reference/functions/tuple-map-functions.md)に説明されています。データが一貫した型でない場合、[必要な型変換](/sql-reference/functions/type-conversion-functions)を実行するための関数が存在します。

#### オブジェクト値 {#object-values}

`Map`型は、サブオブジェクトがあるオブジェクトにも考慮できる場合がありますが、その場合は一貫性が必要です。

例えば、`persons`オブジェクトの`tags`キーが一貫した構造を要求する場合、各`tag`のサブオブジェクトは`name`と`time`カラムを持つ必要があります。このようなJSONドキュメントの簡易例は以下のようになります：

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

これは、`Map(String, Tuple(name String, time DateTime))`を使用してモデル化できます。以下を参照してください：

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

この場合のマップの適用は通常稀であり、動的キー名を持つデータをサブオブジェクトなしで再設計する必要があることを示唆しています。たとえば、上記は次のように再設計され、`Array(Tuple(key String, name String, time DateTime))`の使用を許可します。

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

## Nestedを使用する {#using-nested}

[Nested型](/sql-reference/data-types/nested-data-structures/nested)は、静的オブジェクトをモデル化するために使用できます。これらは変更されることが滅多にないため、`Tuple`や`Array(Tuple)`の代替手段を提供します。一般的に、このタイプをJSONに使用することは避けるべきです。なぜなら、その挙動はしばしば混乱を招くからです。`Nested`の主な利点は、サブカラムをオーダリングキーで使用できることです。

以下に、静的オブジェクトをモデル化するためにNested型を使用する例を示します。以下は、JSONのシンプルなログエントリです：

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

`request`キーを`Nested`として宣言できます。`Tuple`と同様に、サブカラムを指定する必要があります。

```sql
-- デフォルト
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

設定`flatten_nested`は、ネストされた動作を制御します。

#### flatten_nested=1 {#flatten_nested1}

値が`1`（デフォルト）は、任意のレベルのネスティングをサポートしません。この値では、ネストされたデータ構造を長さが同じ複数の[Array](/sql-reference/data-types/array)カラムとして考えることが最も簡単です。フィールド`method`、`path`、および`version`はすべて実質的に別々の`Array(Type)`カラムであり、1つの重要な制約があります：**`method`、`path`、および`version`フィールドの長さは同じでなければなりません。** `SHOW CREATE TABLE`を使用すると、以下のように示されます：

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

以下に、このテーブルに挿入します：

```sql
SET input_format_import_nested_json = 1;
INSERT INTO http
FORMAT JSONEachRow
{"timestamp":897819077,"clientip":"45.212.12.0","request":[{"method":"GET","path":"/french/images/hm_nav_bar.gif","version":"HTTP/1.0"}],"status":200,"size":3305}
```

ここで注目すべき重要なポイントがいくつかあります：

* JSONをネストされた構造として挿入するために、設定`input_format_import_nested_json`を使用する必要があります。これがないと、JSONをフラットにする必要があります。すなわち、

    ```sql
    INSERT INTO http FORMAT JSONEachRow
    {"timestamp":897819077,"clientip":"45.212.12.0","request":{"method":["GET"],"path":["/french/images/hm_nav_bar.gif"],"version":["HTTP/1.0"]},"status":200,"size":3305}
    ```

* ネストされたフィールド`method`、`path`、`version`は、JSON配列として渡す必要があります。すなわち、

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

カラムはドット表記を使用してクエリできます：

```sql
SELECT clientip, status, size, `request.method` FROM http WHERE has(request.method, 'GET');

┌─clientip────┬─status─┬─size─┬─request.method─┐
│ 45.212.12.0 │    200 │ 3305 │ ['GET']        │
└─────────────┴────────┴──────┴────────────────┘
1 row in set. Elapsed: 0.002 sec.
```

サブカラム'の`Array`を使用することにより、[Array関数](/sql-reference/functions/array-functions)が活用できることに注意してください。特に、[ARRAY JOIN](/sql-reference/statements/select/array-join)句が役立つ場合があります - もしあなたのカラムに複数の値がある場合です。

#### flatten_nested=0 {#flatten_nested0}

これは任意のレベルのネスティングを許可し、ネストされたカラムを単一の`Tuple`の配列として保持します - 事実的に、これらは`Array(Tuple)`と同じになります。

**これは好ましい方法であり、しばしばJSONを`Nested`に使用する最もシンプルな方法です。以下に示すように、すべてのオブジェクトをリストにするだけで済みます。**

以下に、テーブルを再作成し、行を再挿入します：

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

-- note Nested type is preserved.
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

ここで注意すべき重要なポイントがいくつかあります：

* 挿入には`input_format_import_nested_json`は必要ありません。
* `Nested`型は`SHOW CREATE TABLE`で保持されます。この列は実質的に`Array(Tuple(Nested(method LowCardinality(String), path String, version LowCardinality(String))))`です。
* 結果として、`request`を配列として挿入する必要があります。すなわち、 

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

カラムは再びドット表記を用いてクエリできます：

```sql
SELECT clientip, status, size, `request.method` FROM http WHERE has(request.method, 'GET');

┌─clientip────┬─status─┬─size─┬─request.method─┐
│ 45.212.12.0 │    200 │ 3305 │ ['GET']        │
└─────────────┴────────┴──────┴────────────────┘
1 row in set. Elapsed: 0.002 sec.
```

### 例 {#example}

上記のデータのより大きな例が、S3のパブリックバケットにあります： `s3://datasets-documentation/http/`。

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

制約とJSONの入力形式に基づいて、このサンプルデータセットを挿入するには、以下のクエリを実行します。ここでは、`flatten_nested=0`を設定します。

次の文は1000万行を挿入するため、実行には数分かかる場合があります。必要に応じて`LIMIT`を適用してください：

```sql
INSERT INTO http
SELECT `@timestamp` AS `timestamp`, clientip, [request], status,
size FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/documents-01.ndjson.gz',
'JSONEachRow');
```

このデータをクエリするには、要求フィールドにアクセスするために配列としてアクセスする必要があります。以下に、固定された時間範囲内でのエラーおよびHTTPメソッドを要約します。

```sql
SELECT status, request.method[1] as method, count() as c
FROM http
WHERE status >= 400
  AND toDateTime(timestamp) BETWEEN '1998-01-01 00:00:00' AND '1998-06-01 00:00:00'
GROUP by method, status
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

### ペアワイズ配列を使用する {#using-pairwise-arrays}

ペアワイズ配列は、JSONを文字列として表現する柔軟性と、より構造化されたアプローチのパフォーマンスのバランスを提供します。このスキーマは柔軟性があり、新しいフィールドをルートに追加することができます。ただし、これはかなり複雑なクエリ構文を必要とし、ネストされた構造とは互換性がありません。

たとえば、次のようなテーブルを考えてみましょう：

```sql
CREATE TABLE http_with_arrays (
   keys Array(String),
   values Array(String)
)
ENGINE = MergeTree  ORDER BY tuple();
```

このテーブルに挿入するには、JSONをキーと値のリストとして構造化する必要があります。以下のクエリは、`JSONExtractKeysAndValues`を使用してこれを達成する例を示しています：

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

要求カラムは、文字列として表されたネストされた構造のままであることに注意してください。ルートに新しいキーを追加することができ、JSON自体にも任意の違いを持つことができます。ローカルテーブルに挿入するには、次のクエリを実行します：

```sql
INSERT INTO http_with_arrays
SELECT
    arrayMap(x -> (x.1), JSONExtractKeysAndValues(json, 'String')) AS keys,
    arrayMap(x -> (x.2), JSONExtractKeysAndValues(json, 'String')) AS values
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/documents-01.ndjson.gz', 'JSONAsString')

0 rows in set. Elapsed: 12.121 sec. Processed 10.00 million rows, 107.30 MB (825.01 thousand rows/s., 8.85 MB/s.)
```

この構造をクエリするには、`indexOf`関数を使用して必要なキーのインデックスを特定する必要があります（これは値の順序と一致する必要があります）。これを使用して値配列カラムにアクセスできます。すなわち、`values[indexOf(keys, 'status')]`。要求カラムに対しては、JSON解析メソッドが引き続き必要です。この場合、`simpleJSONExtractString`ですが、

```sql
SELECT toUInt16(values[indexOf(keys, 'status')])                           as status,
       simpleJSONExtractString(values[indexOf(keys, 'request')], 'method') as method,
       count()                                                             as c
FROM http_with_arrays
WHERE status >= 400
  AND toDateTime(values[indexOf(keys, '@timestamp')]) BETWEEN '1998-01-01 00:00:00' AND '1998-06-01 00:00:00'
GROUP by method, status ORDER BY c DESC LIMIT 5;

┌─status─┬─method─┬─────c─┐
│    404 │ GET    │ 11267 │
│    404 │ HEAD   │   276 │
│    500 │ GET    │   160 │
│    500 │ POST   │   115 │
│    400 │ GET    │    81 │
└────────┴────────┴───────┘

5 rows in set. Elapsed: 0.383 sec. Processed 8.22 million rows, 1.97 GB (21.45 million rows/s., 5.15 GB/s.)
```
