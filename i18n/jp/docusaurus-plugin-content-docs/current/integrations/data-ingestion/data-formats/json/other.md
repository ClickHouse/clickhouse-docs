---
title: 'JSON のその他のアプローチ'
slug: /integrations/data-formats/json/other-approaches
description: 'JSON モデリングにおけるその他の手法'
keywords: ['json', 'formats']
doc_type: 'reference'
---

# JSON をモデリングするその他のアプローチ \\{#other-approaches-to-modeling-json\\}

**以下は、ClickHouse における JSON モデリングの別手法です。網羅性のために記載していますが、これらは JSON 型が登場する以前に有用だったものであり、現在では多くのユースケースにおいて推奨されず、ほとんどの場合適用されません。**

:::note オブジェクト単位のアプローチを適用する
同じスキーマ内でも、オブジェクトごとに異なる手法を適用できます。たとえば、一部のオブジェクトには `String` 型が最適であり、別のものには `Map` 型が最適な場合があります。`String` 型を使用した場合、それ以降にスキーマに関する追加の決定を行う必要はない点に注意してください。逆に、以下で示すように、JSON を表す `String` を含め、サブオブジェクトを `Map` のキーに対応する値としてネストすることも可能です。
:::

## String 型の使用 \{#using-string\}

オブジェクトが非常に動的で、予測可能な構造がなく、任意のネストされたオブジェクトを含む場合は、`String` 型を使用することが推奨されます。値は、以下で示すように、クエリ実行時に JSON 関数を使用して抽出できます。

上記で説明したような構造化されたアプローチでデータを扱うことは、動的な JSON、すなわちスキーマが頻繁に変化する、あるいは十分に把握されていない JSON を扱うユーザーにとっては、現実的でない場合がよくあります。最大限の柔軟性を確保するには、JSON を単に `String` として保存し、その後、必要に応じてフィールドを抽出する関数を使用できます。これは、JSON を構造化オブジェクトとして扱う方法とは完全に対極にあります。この柔軟性にはコストが伴い、主な欠点はクエリ構文の複雑さの増大とパフォーマンスの低下です。

前述のとおり、[元の person オブジェクト](/integrations/data-formats/json/schema#static-vs-dynamic-json)については、`tags` カラムの構造を保証できません。`company.labels`（ここでは無視します）を含む元の行を挿入する際、`Tags` カラムを `String` として宣言します。

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

`tags` 列を選択すると、JSON が文字列として挿入されていることがわかります。

```sql
SELECT tags
FROM people

┌─tags───────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ {"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}} │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.001 sec.
```

[`JSONExtract`](/sql-reference/functions/json-functions#jsonextract-functions) 関数を使用して、この JSON データから値を取得できます。次の簡単な例を見てみましょう。

```sql
SELECT JSONExtractString(tags, 'holidays') AS holidays FROM people

┌─holidays──────────────────────────────────────┐
│ [{"year":2024,"location":"Azores, Portugal"}] │
└───────────────────────────────────────────────┘

1 row in set. Elapsed: 0.002 sec.
```

これらの関数では、`String` 型の列 `tags` への参照と、抽出したい JSON 内のパスの両方が必要になります。ネストされたパスには関数のネストが必要であり、例えば `JSONExtractUInt(JSONExtractString(tags, 'car'), 'year')` のように記述すると、列 `tags.car.year` を抽出できます。ネストされたパスの抽出は、関数 [`JSON_QUERY`](/sql-reference/functions/json-functions#JSON_QUERY) および [`JSON_VALUE`](/sql-reference/functions/json-functions#JSON_VALUE) を用いることで簡略化できます。

本文全体を `String` と見なす `arxiv` データセットという極端なケースを考えてみましょう。

```sql
CREATE TABLE arxiv (
  body String
)
ENGINE = MergeTree ORDER BY ()
```

このスキーマにデータを挿入するには、`JSONAsString` 形式を使用する必要があります。

```sql
INSERT INTO arxiv SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz', 'JSONAsString')

0 rows in set. Elapsed: 25.186 sec. Processed 2.52 million rows, 1.38 GB (99.89 thousand rows/s., 54.79 MB/s.)
```


例えば、発行年ごとの論文数を集計したいとします。次のクエリを、単一の文字列カラムのみを使う場合と、スキーマの[構造化されたバージョン](/integrations/data-formats/json/inference#creating-tables)を使う場合で比較してみましょう。

```sql
-- using structured schema
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

-- using unstructured String

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

ここでは、メソッドで JSON をフィルタリングするために XPath 式を使用している点に注目してください。例えば `JSON_VALUE(body, '$.versions[0].created')` のようになります。

文字列関数は、インデックスを用いた明示的な型変換と比べて顕著に遅く（10倍以上）、上記クエリでは常にテーブル全体のスキャンと全行の処理が必要になります。このようなクエリは、ここで扱っているような小さなデータセットであれば依然として高速ですが、データセットが大きくなるとパフォーマンスは低下します。

このアプローチは柔軟性が高い一方で、明確なパフォーマンスおよび構文上のコストを伴うため、スキーマ内で非常に動的なオブジェクトに対してのみ使用すべきです。


### Simple JSON functions \{#simple-json-functions\}

上記の例では JSON* 系の関数を使用しています。これらは [simdjson](https://github.com/simdjson/simdjson) に基づく完全な JSON パーサーを利用しており、厳密なパースを行い、異なる階層にネストされた同名フィールドを区別します。これらの関数は、構文的には正しいものの体裁が整っていない JSON（例: キー間に二重スペースがあるなど）も扱うことができます。

より高速で厳格な関数群も利用可能です。これらの `simpleJSON*` 関数は、主に JSON の構造とフォーマットに関して厳しい前提を置くことで、より優れたパフォーマンスを発揮できます。具体的には、次のとおりです。

* フィールド名は定数でなければなりません
* フィールド名のエンコーディングが一貫している必要があります。例: `simpleJSONHas('{"abc":"def"}', 'abc') = 1` ですが、`visitParamHas('{"\\u0061\\u0062\\u0063":"def"}', 'abc') = 0`
* フィールド名は、すべてのネストされた構造を通じて一意である必要があります。ネストレベルによる区別は行われず、マッチングは無差別です。複数のフィールドが一致する場合、最初に出現したものが使用されます。
* 文字列リテラル外での特殊文字は許可されません。スペースも含まれます。次の例は無効であり、パースに失敗します。

  ```json
  {"@timestamp": 893964617, "clientip": "40.135.0.0", "request": {"method": "GET",
  "path": "/images/hm_bg.jpg", "version": "HTTP/1.0"}, "status": 200, "size": 24736}
  ```

一方、次の例は正しくパースされます。

````json
{"@timestamp":893964617,"clientip":"40.135.0.0","request":{"method":"GET",
    "path":"/images/hm_bg.jpg","version":"HTTP/1.0"},"status":200,"size":24736}

In some circumstances, where performance is critical and your JSON meets the above requirements, these may be appropriate. An example of the earlier query, re-written to use `simpleJSON*` functions, is shown below:

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
````

上記のクエリでは、公開日については最初の値だけを取得すればよいという前提を利用して、`created` キーを抽出するために `simpleJSONExtractString` を使用しています。このケースでは、パフォーマンス向上と引き換えになる `simpleJSON*` 関数の制約は許容できます。


## Map 型の使用 {#using-map}

オブジェクトが任意のキーを格納するために使われ、その多くが単一の型である場合は、`Map` 型の使用を検討してください。理想的には、一意なキーの数は数百を超えないことが望まれます。サブオブジェクトを持つオブジェクトについても、サブオブジェクトの型が一様であれば `Map` 型を検討できます。一般的には、ラベルやタグ、たとえばログデータ中の Kubernetes ポッドラベルなどに対して `Map` 型の使用を推奨します。

`Map` はネストした構造を表現する簡単な方法を提供しますが、いくつか顕著な制限があります。

- フィールドはすべて同じ型でなければなりません。
- フィールドは列として存在しないため、サブカラムへアクセスするには特別な `Map` 構文が必要です。オブジェクト全体が 1 つの列 *である* ためです。
- サブカラムにアクセスすると、`Map` の値全体、すなわちすべての兄弟のキーとそれぞれの値が読み込まれます。大きな `Map` では、これが顕著なパフォーマンス低下につながる可能性があります。

:::note String keys
オブジェクトを `Map` としてモデリングする場合、JSON のキー名を格納するのに `String` キーが使われます。そのため `Map` は常に `Map(String, T)` となり、`T` はデータに応じて決まります。
:::

#### プリミティブ値

`Map` の最も単純な適用例は、オブジェクトが同じプリミティブ型を値として含む場合です。多くの場合、値 `T` として `String` 型を使用します。

`company.labels` オブジェクトが動的であると判断された、[先ほどの person の JSON](/integrations/data-formats/json/schema#static-vs-dynamic-json) を考えてみます。重要なのは、このオブジェクトに追加されるのはキー・値ともに String 型であるペアのみと想定している点です。そのため、これを `Map(String, String)` として宣言できます。

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

元の JSON オブジェクト全体をそのまま挿入できます：

```sql
INSERT INTO people FORMAT JSONEachRow
{"id":1,"name":"Clicky McCliickHouse","username":"Clicky","email":"clicky@clickhouse.com","address":[{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":-43.9509,"lng":-34.4618}}],"phone_numbers":["010-692-6593","020-192-3333"],"website":"clickhouse.com","company":{"name":"ClickHouse","catchPhrase":"The real-time data warehouse for analytics","labels":{"type":"database systems","founded":"2021"}},"dob":"2007-03-31","tags":{"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}}}

Ok.

1 row in set. Elapsed: 0.002 sec.
```

`request` オブジェクト内のこれらのフィールドをクエリするには、`Map` 構文を使用する必要があります。例えば次のように記述します。

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

この型に対してクエリを実行するための `Map` 関数の完全なセットが利用可能であり、[こちら](/sql-reference/functions/tuple-map-functions.md)で説明されています。データの型が一貫していない場合は、[必要な型変換](/sql-reference/functions/type-conversion-functions)を行うための関数が用意されています。


#### オブジェクトの値

`Map` 型は、サブオブジェクトを持つオブジェクトに対しても、それらサブオブジェクトの型に一貫性がある場合には利用できます。

`persons` オブジェクトの `tags` キーが一貫した構造を持つ必要があり、各 `tag` のサブオブジェクトが `name` と `time` のカラムを持つとします。このような JSON ドキュメントの単純化した例は、次のようになります。

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

これは、次のように `Map(String, Tuple(name String, time DateTime))` でモデル化できます。

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

このケースで `Map` を利用することは通常はまれであり、動的なキー名がサブオブジェクトを持たないようにデータをモデリングし直すべきであることを示唆しています。たとえば、上記は次のようにモデリングし直すことで、`Array(Tuple(key String, name String, time DateTime))` を使用できるようになります。

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


## Nested 型の使用

[Nested 型](/sql-reference/data-types/nested-data-structures/nested) は、ほとんど変更されない静的オブジェクトをモデリングするために使用でき、`Tuple` や `Array(Tuple)` の代替手段となります。挙動が分かりにくい場合が多いため、JSON に対してこの型を使用するのは一般的に避けることを推奨します。`Nested` の主な利点は、サブカラムを並び替えキー（ORDER BY キー）として使用できることです。

以下では、静的オブジェクトをモデリングするために Nested 型を使用する例を示します。次のような単純な JSON 形式のログエントリを考えます。

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

`request` キーを `Nested` 型として宣言できます。`Tuple` と同様に、サブカラムを指定する必要があります。

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

`flatten_nested` 設定は Nested の動作を制御します。

#### flatten&#95;nested=1

値が `1`（デフォルト）の場合、任意のレベルのネストはサポートされません。この値では、ネストされたデータ構造は、同じ長さを持つ複数の [Array](/sql-reference/data-types/array) カラムと考えると分かりやすいです。`method`、`path`、`version` フィールドは、すべて実質的には別々の `Array(Type)` カラムですが、重要な制約が 1 つあります。**`method`、`path`、`version` フィールドの長さはすべて同じでなければなりません。** `SHOW CREATE TABLE` を使用すると、これは次のように示されます。

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

以下では、このテーブルにデータを挿入してみます。

```sql
SET input_format_import_nested_json = 1;
INSERT INTO http
FORMAT JSONEachRow
{"timestamp":897819077,"clientip":"45.212.12.0","request":[{"method":"GET","path":"/french/images/hm_nav_bar.gif","version":"HTTP/1.0"}],"status":200,"size":3305}
```

ここでいくつか重要なポイントを押さえておきましょう。

* JSON をネストされた構造として挿入するには、設定 `input_format_import_nested_json` を使用する必要があります。これを指定しない場合は、JSON をフラット化する必要があります。つまり次のようになります。

  ```sql
  INSERT INTO http FORMAT JSONEachRow
  {"timestamp":897819077,"clientip":"45.212.12.0","request":{"method":["GET"],"path":["/french/images/hm_nav_bar.gif"],"version":["HTTP/1.0"]},"status":200,"size":3305}
  ```
* ネストされたフィールド `method`、`path`、`version` は、JSON 配列として渡す必要があります。つまり次のようになります。

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

列はドット記法でクエリできます。

```sql
SELECT clientip, status, size, `request.method` FROM http WHERE has(request.method, 'GET');

┌─clientip────┬─status─┬─size─┬─request.method─┐
│ 45.212.12.0 │    200 │ 3305 │ ['GET']        │
└─────────────┴────────┴──────┴────────────────┘
1 row in set. Elapsed: 0.002 sec.
```

サブカラムに `Array` を使用することで、[`ARRAY JOIN`](/sql-reference/statements/select/array-join) 句を含む [Array functions](/sql-reference/functions/array-functions) の全体を幅広く活用できる可能性があります。これは、カラムに複数の値が含まれている場合に便利です。


#### flatten&#95;nested=0

これは任意のレベルのネストを許可し、ネストされたカラムは単一の `Tuple` 配列として保持されることを意味します。実質的に、それらは `Array(Tuple)` と同じになります。

**これは推奨される方法であり、多くの場合、`Nested` と JSON を組み合わせて使用する最も単純な方法です。このあと示すように、すべてのオブジェクトがリストでありさえすれば十分です。**

以下では、テーブルを再作成し、行を再度挿入します。

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

ここでいくつか重要なポイントを挙げます。

* `input_format_import_nested_json` は挿入時に必須ではありません。
* `Nested` 型は `SHOW CREATE TABLE` を実行しても保持されます。このカラムの実体は実際には `Array(Tuple(Nested(method LowCardinality(String), path String, version LowCardinality(String))))` です。
* その結果、`request` は配列として挿入する必要があります。つまり次のようになります。

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

カラムは再びドット記法を使ってクエリできます。

```sql
SELECT clientip, status, size, `request.method` FROM http WHERE has(request.method, 'GET');

┌─clientip────┬─status─┬─size─┬─request.method─┐
│ 45.212.12.0 │    200 │ 3305 │ ['GET']        │
└─────────────┴────────┴──────┴────────────────┘
1 row in set. Elapsed: 0.002 sec.
```


### 例

上記データのより大きなサンプルデータが、S3 のパブリックバケット `s3://datasets-documentation/http/` で公開されています。

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

JSON の制約および入力形式を踏まえ、次のクエリを使用してこのサンプルデータセットを挿入します。ここでは `flatten_nested=0` を設定します。

次のステートメントは 1,000 万行を挿入するため、実行には数分かかる場合があります。必要に応じて `LIMIT` を適用してください。

```sql
INSERT INTO http
SELECT `@timestamp` AS `timestamp`, clientip, [request], status,
size FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/documents-01.ndjson.gz',
'JSONEachRow');
```

このデータをクエリするには、リクエストフィールドに配列としてアクセスする必要があります。以下では、一定期間におけるエラーと HTTP メソッドを集計します。

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


### ペアワイズ配列の使用

ペアワイズ配列は、JSON を文字列として表現する際の柔軟性と、より構造化されたアプローチによる高い性能とのバランスを提供します。スキーマは柔軟であり、新しいフィールドを任意にルートレベルへ追加することができます。しかしその一方で、クエリ構文が大幅に複雑になり、ネストされた構造とは互換性がありません。

例として、次のテーブルを考えます。

```sql
CREATE TABLE http_with_arrays (
   keys Array(String),
   values Array(String)
)
ENGINE = MergeTree  ORDER BY tuple();
```

このテーブルにデータを挿入するには、JSON をキーと値のリストとして構造化する必要があります。次のクエリは、これを実現するために `JSONExtractKeysAndValues` 関数を使用する例です。

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

`request` 列が、文字列として表現された入れ子構造のままである点に注目してください。ルートレベルには任意の新しいキーを追加できます。また、JSON 自体の内容も自由に変更できます。ローカルテーブルに挿入するには、次を実行します。

```sql
INSERT INTO http_with_arrays
SELECT
    arrayMap(x -> (x.1), JSONExtractKeysAndValues(json, 'String')) AS keys,
    arrayMap(x -> (x.2), JSONExtractKeysAndValues(json, 'String')) AS values
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/documents-01.ndjson.gz', 'JSONAsString')

0 rows in set. Elapsed: 12.121 sec. Processed 10.00 million rows, 107.30 MB (825.01 thousand rows/s., 8.85 MB/s.)
```

この構造をクエリするには、必要なキーのインデックスを特定するために [`indexOf`](/sql-reference/functions/array-functions#indexOf) 関数を使用する必要があります（これは値の順序と対応している必要があります）。これを利用して values 配列列、すなわち `values[indexOf(keys, 'status')]` にアクセスできます。`request` 列については依然として JSON をパースする手段が必要であり、この例では `simpleJSONExtractString` を使用します。

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
