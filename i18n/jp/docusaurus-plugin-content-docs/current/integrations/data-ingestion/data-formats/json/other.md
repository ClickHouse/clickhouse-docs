---
title: 'JSONのその他のアプローチ'
slug: /integrations/data-formats/json/other-approaches
description: 'JSONモデル化のその他のアプローチ'
keywords: ['json', 'formats']
---


# JSONのその他のアプローチ

**以下は、ClickHouseにおけるJSONモデル化の代替手段です。これらは完全性のために文書化されており、JSONタイプの開発以前のものであるため、一般的には推奨されず、ほとんどの使用例には適用されません。**

:::note オブジェクトレベルのアプローチを適用
異なるテクニックを同じスキーマ内の異なるオブジェクトに適用することができます。たとえば、あるオブジェクトは `String` タイプで最もよく解決できる一方、他のオブジェクトは `Map` タイプで解決できる場合があります。 `String` タイプを使用すると、これ以上のスキーマの決定は必要ありません。逆に、 `Map` キー内に `String` を含めたサブオブジェクトをネストすることも可能です。以下に示すようにJSONを表現します。
:::

## Stringを使用する {#using-string}

オブジェクトが非常に動的で、予測可能な構造がなく、任意のネストされたオブジェクトを含む場合、ユーザーは `String` タイプを使用するべきです。値は、以下に示すようにJSON関数を使用してクエリ時に抽出できます。

上記の構造化アプローチでデータを扱うことは、動的JSON（変更の対象であるか、スキーマがよく理解されていないもの）のユーザーにはしばしば実現不可能です。絶対的な柔軟性のために、ユーザーは単にJSONを `String` として保存し、必要に応じてフィールドを抽出するための関数を使用することができます。これは、JSONを構造化されたオブジェクトとして扱うことの極端な反対を示します。この柔軟性は、主にクエリ構文の複雑さの増加とパフォーマンスの低下という大きな欠点をもたらします。

前述の通り、[元の人物オブジェクト](/integrations/data-formats/json/schema#static-vs-dynamic-json)のために、 `tags` カラムの構造を保証することはできません。元の行（ `company.labels` を含むが、今は無視します）を挿入し、 `Tags` カラムを `String` として宣言します。

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

`tags` カラムを選択すると、JSONが文字列として挿入されていることを確認できます。

```sql
SELECT tags
FROM people

┌─tags───────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ {"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}} │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.001 sec.
```

[`JSONExtract`](/sql-reference/functions/json-functions#jsonextract-functions) 関数を使用して、このJSONから値を取得できます。以下のシンプルな例を考えてみましょう。

```sql
SELECT JSONExtractString(tags, 'holidays') as holidays FROM people

┌─holidays──────────────────────────────────────┐
│ [{"year":2024,"location":"Azores, Portugal"}] │
└───────────────────────────────────────────────┘

1 row in set. Elapsed: 0.002 sec.
```

関数は、 `String` カラム `tags` への参照と、抽出するためのJSON内のパスの両方が必要であることに注意してください。ネストされたパスは、 `JSONExtractUInt(JSONExtractString(tags, 'car'), 'year')` のように関数をネストする必要があります。これはカラム `tags.car.year` を抽出します。ネストされたパスの抽出は、関数[`JSON_QUERY`](/sql-reference/functions/json-functions#json_query)および[`JSON_VALUE`](/sql-reference/functions/json-functions#json_value)を通じて簡略化できます。

`arxiv` データセットの極端なケースを考えてみましょう。ここで、全体を `String` と見なします。

```sql
CREATE TABLE arxiv (
  body String
)
ENGINE = MergeTree ORDER BY ()
```

このスキーマに挿入するには、 `JSONAsString` フォーマットを使用する必要があります。

```sql
INSERT INTO arxiv SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz', 'JSONAsString')

0 rows in set. Elapsed: 25.186 sec. Processed 2.52 million rows, 1.38 GB (99.89 thousand rows/s., 54.79 MB/s.)
```

年ごとの論文の数を数えたいとします。次のクエリは、文字列のみを使用する場合いたでの構造化バージョンと対照的です。

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

ここで、メソッドによってJSONをフィルタリングするためのXPath式（ `JSON_VALUE(body, '$.versions[0].created')` ）の使用に注意してください。

String関数は、明示的な型変換とインデックスを使用するよりも大幅に遅くなります (> 10倍)。上記のクエリでは常にフルテーブルスキャンが必要で、すべての行の処理を行います。このようなクエリは、この小さなデータセットではまだ速いですが、大きなデータセットではパフォーマンスが低下します。

このアプローチの柔軟性には明確なパフォーマンスと構文のコストが伴い、スキーマ内の高度に動的なオブジェクトに対してのみ使用されるべきです。

### シンプルなJSON関数 {#simple-json-functions}

上記の例では、JSON*関数のファミリーを使用しています。これらは、[simdjson](https://github.com/simdjson/simdjson)に基づいた完全なJSONパーサーを利用しており、厳密な解析を行い、異なるレベルでネストされた同じフィールドを区別します。これらの関数は、文法的には正しいが、フォーマットが整っていないJSONを処理することができます。たとえば、キー間の二重スペースなどです。

より速く、より厳密な関数のセットが利用可能です。これらの `simpleJSON*` 関数は、JSONの構造と形式について厳密な仮定を行うことにより、潜在的に優れたパフォーマンスを提供します。具体的には：

- フィールド名は定数である必要があります。
- フィールド名の一貫したエンコード 例えば `simpleJSONHas('{"abc":"def"}', 'abc') = 1` ただし `visitParamHas('{"\\u0061\\u0062\\u0063":"def"}', 'abc') = 0`
- フィールド名は、すべてのネストされた構造内で一意でなければなりません。ネストレベル間での区別はなく、一致は無差別です。複数の一致するフィールドがある場合、最初の出現が使用されます。
- 文字列リテラル以外の特別な文字はありません。これにはスペースも含まれます。以下は無効であり、パースされません。

    ```json
    {"@timestamp": 893964617, "clientip": "40.135.0.0", "request": {"method": "GET",
    "path": "/images/hm_bg.jpg", "version": "HTTP/1.0"}, "status": 200, "size": 24736}
    ```

逆に、以下は正しくパースされます。

```json
{"@timestamp":893964617,"clientip":"40.135.0.0","request":{"method":"GET",
    "path":"/images/hm_bg.jpg","version":"HTTP/1.0"},"status":200,"size":24736}

特定の条件においてパフォーマンスが重要であり、あなたのJSONが上記の要件を満たすなら、これらは適切である場合があります。以前のクエリの例を `simpleJSON*` 関数を使用するように書き直したものを以下に示します。

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

上記のクエリは、 `simpleJSONExtractString` を使用して `created` キーを抽出し、公開日として最初の値を取得することを活用しています。この場合、性能の向上のためには `simpleJSON*` 関数の制限は許容可能です。

## Mapを使用する {#using-map}

オブジェクトが主に1つのタイプの任意のキーを保存するために使用される場合、 `Map` タイプの使用を検討してください。理想的には、独自のキーの数が数百を超えるべきではありません。 `Map` タイプは、サブオブジェクトを持つオブジェクトにも考慮されますが、後者はその型において一貫性を持つ必要があります。一般的に、 `Map` タイプはラベルやタグに使用することをお勧めします。たとえば、ログデータ内のKubernetesポッドラベルなどです。

`Map` はネストされた構造を表現するシンプルな方法を提供しますが、いくつかの注目すべき制限があります：

- フィールドはすべて同じ型でなければなりません。
- サブカラムにアクセスするには特別なマップ構文が必要です。フィールドはカラムとして存在しないため、全体のオブジェクトはカラムの一部です。
- サブカラムにアクセスすると、全体の `Map` 値が読み込まれます。つまり、すべての兄弟およびそれぞれの値も含まれます。大きなマップでは、これがパフォーマンスの大きなペナルティをもたらす可能性があります。

:::note 文字列キー
オブジェクトを `Map` としてモデル化する際には、JSONキー名を格納するために `String` キーが使用されます。したがって、マップは常に `Map(String, T)` となり、 `T` はデータによって異なります。
:::

#### プリミティブ値 {#primitive-values}

`Map` の最もシンプルな適用は、オブジェクトが値として同じプリミティブ型を含む場合です。ほとんどの場合、これは `String` タイプを値 `T` として使用することを意味します。

前述の[人物JSON](/integrations/data-formats/json/schema#static-vs-dynamic-json)の例を考えると、 `company.labels` オブジェクトが動的であると判断されました。重要なのは、このオブジェクトにタイプStringのキーと値のペアのみが追加されることを期待しています。したがって、これを `Map(String, String)` として宣言できます。

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

元の完全なJSONオブジェクトを挿入することができます：

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics","labels":{"type":"database systems","founded":"2021"}},"dob":"2007-03-31","tags":{"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}}}

Ok.

1 row in set. Elapsed: 0.002 sec.
```

リクエストオブジェクト内のこれらのフィールドをクエリするには、マップ構文を必要とします。

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

利用可能な `Map` 関数の完全なセットが、[こちら](/sql-reference/functions/tuple-map-functions.md)に記載されています。データの型が一貫していない場合、[必要な型の変換を行う](/sql-reference/functions/type-conversion-functions)ための関数もあります。

#### オブジェクト値 {#object-values}

`Map` タイプは、サブオブジェクトの一貫性を持つ場合にも考慮されます。

たとえば、 `persons` オブジェクトの `tags` キーが一貫した構造を必要とし、各 `tag` のサブオブジェクトに `name` と `time` のカラムを持つ必要があるとします。このようなJSONドキュメントの簡略化された例は、以下のようになります。

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

これは、 `Map(String, Tuple(name String, time DateTime))` としてモデリングできます。以下のようになります。

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

この場合のマップの適用は通常まれであり、データをリモデリングして動的キー名がサブオブジェクトを持たないようにすることを示唆しています。たとえば、上記は、 `Array(Tuple(key String, name String, time DateTime))` を使用できるように次のようにリモデリングできます。

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

## ネストされた構造を使用する {#using-nested}

[Nestedタイプ](/sql-reference/data-types/nested-data-structures/nested)は、滅多に変更されない静的オブジェクトのモデル化に使用できます。これは、 `Tuple` および `Array(Tuple)` の代替手段を提供します。一般的には、このタイプをJSONに使用することは避けることをお勧めします。理由は、その動作がしばしば混乱を招くためです。`Nested` の主な利点は、サブカラムをオーダリングキーで使用できることです。

以下に、静的オブジェクトをモデル化するために `Nested` タイプを使用した例を示します。以下は、JSON形式のシンプルなログエントリです。

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

`request` キーを `Nested` として宣言できます。 `Tuple` と同様に、サブカラムを指定する必要があります。

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

設定 `flatten_nested` はネストされた動作を制御します。

#### flatten_nested=1 {#flatten_nested1}

値が `1` （デフォルト）は、任意のレベルのネスティングをサポートしていません。この値を使用すると、ネストされたデータ構造は、同じ長さの複数の[Array](/sql-reference/data-types/array)カラムとして考えることが最も簡単です。`method`、`path`、`version`フィールドは、実際には別々の `Array(Type)` カラムであり、1つの重要な制約があります。**`method`、`path`、および `version` フィールドの長さは同じでなければなりません。** `SHOW CREATE TABLE` を使用すると、次のように示されます。

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

以下では、このテーブルに挿入します。

```sql
SET input_format_import_nested_json = 1;
INSERT INTO http
FORMAT JSONEachRow
{"timestamp":897819077,"clientip":"45.212.12.0","request":[{"method":"GET","path":"/french/images/hm_nav_bar.gif","version":"HTTP/1.0"}],"status":200,"size":3305}
```

ここで、重要ないくつかの点に注意してください：

* ジェスチャー操作として、ネスト構造のJSONを挿入するには、設定 `input_format_import_nested_json` を使用する必要があります。これがない場合、JSONをフラット化する必要があります。すなわち：
  
    ```sql
    INSERT INTO http FORMAT JSONEachRow
    {"timestamp":897819077,"clientip":"45.212.12.0","request":{"method":["GET"],"path":["/french/images/hm_nav_bar.gif"],"version":["HTTP/1.0"]},"status":200,"size":3305}
    ```
* ネストされたフィールド `method`、`path`、および `version` は、JSON配列として渡す必要があります。すなわち：
  
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

カラムにドット表記を使ってクエリできます。

```sql
SELECT clientip, status, size, `request.method` FROM http WHERE has(request.method, 'GET');

┌─clientip────┬─status─┬─size─┬─request.method─┐
│ 45.212.12.0 │    200 │ 3305 │ ['GET']        │
└─────────────┴────────┴──────┴────────────────┘
1 row in set. Elapsed: 0.002 sec.
```

サブカラムの `Array` を使用すると、全ての[Array関数](/sql-reference/functions/array-functions)を利用できます。たとえば、[`ARRAY JOIN`](/sql-reference/statements/select/array-join)句は、カラムに複数の値がある場合に便利です。

#### flatten_nested=0 {#flatten_nested0}

これは任意のレベルのネスティングを許可し、ネストされたカラムは単一の `Tuple` の配列として保持されることを意味します。実際、これらは同じく `Array(Tuple)` として機能します。

**これは、JSONと`Nested`を使用する際の優先される方法であり、しばしば最も簡単な方法です。以下のように、すべてのオブジェクトがリストである必要があるだけです。**

以下に、テーブルを再作成し、行を再挿入します。

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

-- ネストされたタイプは保持されます。
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

重要な点に再度注意してください：

* `input_format_import_nested_json` は挿入には必要ありません。
* `Nested` タイプは `SHOW CREATE TABLE` に保存されます。内部的にはこのカラムは実際には `Array(Tuple(Nested(method LowCardinality(String), path String, version LowCardinality(String))))` です。
* 結果として、`request` を配列形式で挿入する必要があります。すなわち：

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

カラムには、再びドット表記でクエリできます。

```sql
SELECT clientip, status, size, `request.method` FROM http WHERE has(request.method, 'GET');

┌─clientip────┬─status─┬─size─┬─request.method─┐
│ 45.212.12.0 │    200 │ 3305 │ ['GET']        │
└─────────────┴────────┴──────┴────────────────┘
1 row in set. Elapsed: 0.002 sec.
```

### 例 {#example}

上記のデータの大規模な例は、s3のパブリックバケットにあります: `s3://datasets-documentation/http/` 。

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

JSONの制約と入力フォーマットに基づき、このサンプルデータセットを次のクエリを使用して挿入します。ここでは、 `flatten_nested=0` を設定します。

次のステートメントは、1000万行を挿入しますので、実行には数分かかることがあります。必要に応じて `LIMIT` を適用してください。

```sql
INSERT INTO http
SELECT `@timestamp` AS `timestamp`, clientip, [request], status,
size FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/documents-01.ndjson.gz',
'JSONEachRow');
```

このデータをクエリするには、リクエストフィールドに配列としてアクセスする必要があります。以下では、固定された期間内のエラーとHTTPメソッドを要約しています。

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

ペアワイズ配列は、文字列としてJSONを表現する柔軟性と、より構造化されたアプローチのパフォーマンスとのバランスを提供します。このスキーマは、ルートに新しいフィールドを追加する柔軟性を持っています。しかしながら、より複雑なクエリ構文が必要であり、ネストされた構造とは互換性がありません。

以下のテーブルを考えてみましょう。

```sql
CREATE TABLE http_with_arrays (
   keys Array(String),
   values Array(String)
)
ENGINE = MergeTree  ORDER BY tuple();
```

このテーブルに挿入するには、JSONをキーと値のリストとして構造化する必要があります。次のクエリは、 `JSONExtractKeysAndValues` を使用してこれを実現する方法を示しています。

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

リクエストカラムは文字列として表現されたネストされた構造のままであることに注意してください。ルートに新しいキーを追加することができます。また、JSON自体においても任意の違いがある場合があります。このローカルテーブルに挿入するには、次のクエリを実行します。

```sql
INSERT INTO http_with_arrays
SELECT
    arrayMap(x -> (x.1), JSONExtractKeysAndValues(json, 'String')) AS keys,
    arrayMap(x -> (x.2), JSONExtractKeysAndValues(json, 'String')) AS values
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/documents-01.ndjson.gz', 'JSONAsString')

0 rows in set. Elapsed: 12.121 sec. Processed 10.00 million rows, 107.30 MB (825.01 thousand rows/s., 8.85 MB/s.)
```

この構造をクエリするには、`indexOf` (/sql-reference/functions/array-functions#indexofarr-x) 関数を使用して必要なキーのインデックスを特定し、それを使用して値配列カラムにアクセスする必要があります。すなわち、`values[indexOf(keys, 'status')]`です。この場合、リクエストカラムに対してはJSON解析メソッドがまだ必要です。この場合は、`simpleJSONExtractString` です。

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
Peak memory usage: 51.35 MiB.
