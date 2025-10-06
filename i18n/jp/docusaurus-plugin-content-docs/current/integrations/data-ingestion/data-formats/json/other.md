---
'title': '他のJSONアプローチ'
'slug': '/integrations/data-formats/json/other-approaches'
'description': 'JSONをモデル化するための他のアプローチ'
'keywords':
- 'json'
- 'formats'
'doc_type': 'reference'
---


# JSONのモデリングに関する他のアプローチ

**以下は、ClickHouseでのJSONモデリングの代替案です。これらは完全性のために文書化されており、JSON型の開発前に適用可能でしたが、一般的には推奨されず、ほとんどのユースケースには適用されません。**

:::note オブジェクトレベルのアプローチを適用
同じスキーマ内の異なるオブジェクトに対して異なる技術を適用できます。たとえば、一部のオブジェクトは`String`型で最適に解決でき、他のオブジェクトは`Map`型で解決できます。`String`型が使用されると、以降のスキーマの決定は不要です。対照的に、`Map`キー内にサブオブジェクトをネストすることも可能です - ここで示すように、JSONを表す`String`を含めてください。
:::

## String型の使用 {#using-string}

オブジェクトが非常にダイナミックであり、予測可能な構造を持たず、任意のネストされたオブジェクトを含む場合、ユーザーは`String`型を使用するべきです。値は、以下に示すように、クエリ時にJSON関数を使用して抽出できます。

上述の構造化されたアプローチを用いてデータを処理することは、動的なJSONを持つユーザーにはしばしば実行可能ではなく、これは変更の対象となるか、スキーマがよく理解されていない場合です。絶対的な柔軟性のために、ユーザーは単にJSONを`String`として保存し、その後必要に応じてフィールドを抽出する関数を使用できます。これは、JSONを構造化されたオブジェクトとして扱う場合の正反対を表しています。この柔軟性には、クエリ構文の複雑さの増加やパフォーマンスの低下といった重要な悪影響が伴います。

前述のように、[元の人物オブジェクト](/integrations/data-formats/json/schema#static-vs-dynamic-json)では、`tags`カラムの構造を保証することができません。原始の行（`company.labels`を含むが、ここでは無視します）を挿入し、`Tags`カラムを`String`として宣言します：

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

`tags`カラムを選択すると、JSONが文字列として挿入されていることが確認できます：

```sql
SELECT tags
FROM people

┌─tags───────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ {"hobby":"Databases","holidays":[{"year":2024,"location":"Azores, Portugal"}],"car":{"model":"Tesla","year":2023}} │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.001 sec.
```

[`JSONExtract`](/sql-reference/functions/json-functions#jsonextract-functions)関数を使用して、このJSONから値を取得できます。以下のシンプルな例を考えてみましょう：

```sql
SELECT JSONExtractString(tags, 'holidays') AS holidays FROM people

┌─holidays──────────────────────────────────────┐
│ [{"year":2024,"location":"Azores, Portugal"}] │
└───────────────────────────────────────────────┘

1 row in set. Elapsed: 0.002 sec.
```

関数は`String`カラム`tags`への参照と、抽出するJSON内のパスの両方を必要とします。ネストされたパスを抽出するには、関数をネストする必要があります。例：`JSONExtractUInt(JSONExtractString(tags, 'car'), 'year')`は、`tags.car.year`カラムを抽出します。ネストされたパスの抽出は、[`JSON_QUERY`](/sql-reference/functions/json-functions#JSON_QUERY)や[`JSON_VALUE`](/sql-reference/functions/json-functions#JSON_VALUE)関数を通じて簡素化できます。

`arxiv`データセットの最も極端なケースについて考えると、全体のボディを`String`とみなします。

```sql
CREATE TABLE arxiv (
  body String
)
ENGINE = MergeTree ORDER BY ()
```

このスキーマに挿入するには、`JSONAsString`フォーマットを使用する必要があります：

```sql
INSERT INTO arxiv SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz', 'JSONAsString')

0 rows in set. Elapsed: 25.186 sec. Processed 2.52 million rows, 1.38 GB (99.89 thousand rows/s., 54.79 MB/s.)
```

年ごとに発行された論文の数をカウントしたいと仮定しましょう。以下のクエリは、文字列のみを使用する場合と、[構造化バージョン](/integrations/data-formats/json/inference#creating-tables)を対比させています：

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

ここでJSONをフィルタリングするためにXPath式を使用していることに注意してください。すなわち、`JSON_VALUE(body, '$.versions[0].created')`です。

文字列関数は、インデックスとともに明示的な型変換よりも著しく遅くなります（> 10倍）。上記のクエリは常にフルテーブルスキャンを必要とし、すべての行の処理を行います。このクエリは、このような小さなデータセットではまだ高速ですが、大きなデータセットではパフォーマンスが低下します。

このアプローチの柔軟性は、明らかなパフォーマンスと構文コストを伴い、高度に動的なオブジェクトにのみ使用すべきです。

### シンプルなJSON関数 {#simple-json-functions}

上記の例では、JSON*関数ファミリーを使用しています。これらは、[simdjson](https://github.com/simdjson/simdjson)に基づく完全なJSONパーサーを利用しており、その解析は厳格で、異なるレベルでネストされた同じフィールドを区別します。これらの関数は、シンタックス的に正しいが形式が整っていないJSONを処理することができます。例えば、キー間の二重スペースなどです。

より高速で厳密な関数セットも利用可能です。これらの`simpleJSON*`関数は、それらがJSONの構造と形式について厳密な仮定をすることにより、潜在的に優れたパフォーマンスを提供します。具体的には：

- フィールド名は定数でなければならない
- フィールド名は一貫してコーディングされる必要があります。例えば、`simpleJSONHas('{"abc":"def"}', 'abc') = 1`ですが、`visitParamHas('{"\\u0061\\u0062\\u0063":"def"}', 'abc') = 0`です
- フィールド名はすべてのネスト構造内で一意でなければならない。ネストレベル間での差異はなく、照合は無差別です。複数の一致するフィールドがある場合、最初の出現が使用されます。
- 文字列リテラルの外での特別な文字はありません。これにはスペースが含まれます。以下は無効であり、解析されません。

```json
{"@timestamp": 893964617, "clientip": "40.135.0.0", "request": {"method": "GET",
"path": "/images/hm_bg.jpg", "version": "HTTP/1.0"}, "status": 200, "size": 24736}
```

一方、以下は正しく解析されます：

```json
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
```

上記のクエリは、`simpleJSONExtractString`を使用して`created`キーを抽出し、発行日には最初の値のみが必要であることを利用しています。この場合、`simpleJSON*`関数の制限はパフォーマンスの向上に対して受け入れられます。

## Map型の使用 {#using-map}

オブジェクトが任意のキーを保存するために使用され、主に同一の型である場合、`Map`型の使用を検討してください。理想的には、ユニークなキーの数は数百を超えないことが望ましいです。`Map`型はサブオブジェクトを持つオブジェクトにも考慮されますが、後者の型に一貫性が必要です。一般的に、ラベルやタグ、たとえばログデータ内のKubernetesポッドラベルに`Map`型を使用することを推奨しています。

`Map`を使用することでネスト構造を表現する簡単な方法が得られますが、いくつかの顕著な制限があります：

- フィールドはすべて同じ型でなければならない。
- サブカラムにアクセスするには特別なマップ構文が必要で、フィールドはカラムとして存在しません。全体のオブジェクトが1つのカラムです。
- サブカラムにアクセスすると、全体の`Map`値、すなわちすべての兄弟およびそれぞれの値がロードされます。大きなマップの場合、これが重大なパフォーマンスペナルティを引き起こす可能性があります。

:::note 文字列キー
オブジェクトを`Map`としてモデリングする際、JSONキー名を格納するために`String`キーが使用されます。したがって、マップは常に`Map(String, T)`となり、ここで`T`はデータに依存します。
:::

#### プリミティブ値 {#primitive-values}

`Map`の最もシンプルな適用は、オブジェクトが同じプリミティブ型を値として含む場合です。ほとんどの場合、これは値`T`に対して`String`型を使用することを含みます。

以前の[人物JSON](/integrations/data-formats/json/schema#static-vs-dynamic-json)を考えると、`company.labels`オブジェクトは動的であると判断されました。重要なことに、このオブジェクトに追加されるのはString型のキー-値ペアのみを期待しています。したがって、これを`Map(String, String)`として宣言できます：

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

`Map`関数のフルセットがこの時点で利用可能で、[ここ](/sql-reference/functions/tuple-map-functions.md)で説明されています。データが一貫した型でない場合、[必要な型強制](/sql-reference/functions/type-conversion-functions)を行うための関数が存在します。

#### オブジェクト値 {#object-values}

`Map`型は、一貫性のある型を持つサブオブジェクトを有するオブジェクトにも考慮されます。

例えば、`persons`オブジェクトの`tags`キーが、各`tag`のサブオブジェクトが`name`と`time`カラムを持つ一貫した構造を必要とする場合のことを考えましょう。このようなJSONドキュメントの簡素化された例は以下のようになります：

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

これは`Map(String, Tuple(name String, time DateTime))`を用いてモデル化できます。以下のように：

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

このケースでのマップの使用は通常稀であり、データは動的なキー名がサブオブジェクトを持たないように再構築すべきことを示唆します。たとえば、上記は次のように再モデル化され、`Array(Tuple(key String, name String, time DateTime))`の使用が可能です。

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

[Nested型](/sql-reference/data-types/nested-data-structures/nested)は、滅多に変更されない静的オブジェクトのモデリングに使用でき、`Tuple`や`Array(Tuple)`に代わるものです。一般的に、JSONにこの型を使用することは避けることを推奨します。なぜなら、その動作はしばしば混乱を引き起こすからです。`Nested`の主な利点は、サブカラムをオーダリングキーに使用できることです。

以下に、静的オブジェクトをモデル化するためにNested型を使用する例を示します。以下のシンプルなJSONログエントリを考えてみましょう：

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

設定`flatten_nested`は、ネストの動作を制御します。

#### flatten_nested=1 {#flatten_nested1}

値`1`（デフォルト）は、任意のレベルのネストをサポートしません。この値では、ネストデータ構造を複数の[Array](/sql-reference/data-types/array)カラムと考えるのが最も簡単です。`method`、`path`、および`version`フィールドはすべて、実質的に別々の`Array(Type)`カラムであり、1つの重要な制約があります：**`method`、`path`、および`version`フィールドの長さは同じでなければなりません。** `SHOW CREATE TABLE`を使用すると、これが示されます：

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

いくつか重要な点に注意してください：

* JSONをネストされた構造として挿入するには、設定`input_format_import_nested_json`を使用する必要があります。これがないと、JSONをフラット化する必要があります。すなわち：

```sql
INSERT INTO http FORMAT JSONEachRow
{"timestamp":897819077,"clientip":"45.212.12.0","request":{"method":["GET"],"path":["/french/images/hm_nav_bar.gif"],"version":["HTTP/1.0"]},"status":200,"size":3305}
```
* ネストフィールド`method`、`path`、および`version`はJSON配列として渡す必要があります。すなわち：

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

サブカラムのために`Array`を使用していることに注意すると、全ての[Array関数](/sql-reference/functions/array-functions)を活用できる可能性があり、[`ARRAY JOIN`](/sql-reference/statements/select/array-join)句を利用できることは重要です - 複数の値を持つカラムの場合、便利です。

#### flatten_nested=0 {#flatten_nested0}

これにより、任意のレベルのネストが許可され、ネストされたカラムは1つの`Tuple`の配列として残ります - 実質的に`Array(Tuple)`として扱われます。

**これは、`Nested`を使用したJSONの好ましい方法であり、しばしば最も簡単な方法を表します。以下に示すように、すべてのオブジェクトがリストであることが必要です。**

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

いくつか重要な点に注意してください：

* 挿入には`input_format_import_nested_json`は必要ありません。
* `SHOW CREATE TABLE`で`Nested`型は保持されます。このカラムの下は、実質的に`Array(Tuple(Nested(method LowCardinality(String), path String, version LowCardinality(String))))`です。
* 結果として、`request`を配列として挿入する必要があります。すなわち：

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

カラムは再びドット表記を使用してクエリできます：

```sql
SELECT clientip, status, size, `request.method` FROM http WHERE has(request.method, 'GET');

┌─clientip────┬─status─┬─size─┬─request.method─┐
│ 45.212.12.0 │    200 │ 3305 │ ['GET']        │
└─────────────┴────────┴──────┴────────────────┘
1 row in set. Elapsed: 0.002 sec.
```

### 例 {#example}

上記データのより大きな例は、s3の公開バケットにあります：`s3://datasets-documentation/http/`。

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

JSONの制約と入力形式を考慮し、以下のクエリを使用してこのサンプルデータセットを挿入します。ここでは、`flatten_nested=0`を設定します。

以下のステートメントは1000万行を挿入するため、実行に数分かかる場合があります。必要な場合は`LIMIT`を適用してください：

```sql
INSERT INTO http
SELECT `@timestamp` AS `timestamp`, clientip, [request], status,
size FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/documents-01.ndjson.gz',
'JSONEachRow');
```

このデータをクエリするには、リクエストフィールドに配列としてアクセスする必要があります。以下に、固定時間にわたるエラーとHTTPメソッドを要約しています。

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

ペアワイズ配列は、JSONを文字列として表現する柔軟性と、より構造化されたアプローチのパフォーマンスとのバランスを提供します。スキーマは柔軟であり、新しいフィールドをルートに追加することができます。しかし、これにはかなり複雑なクエリ構文が必要であり、ネスト構造との互換性はありません。

例として、以下のテーブルを考えます：

```sql
CREATE TABLE http_with_arrays (
   keys Array(String),
   values Array(String)
)
ENGINE = MergeTree  ORDER BY tuple();
```

このテーブルに挿入するには、JSONをキーと値のリストとして構造化する必要があります。次のクエリは、`JSONExtractKeysAndValues`を使用する方法を示しています：

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

リクエストカラムが文字列として表現されたネストされた構造であることに注意してください。ルートに新しいキーを追加することができます。また、JSON自体に任意の違いを持つことができます。ローカルテーブルに挿入するには、以下を実行します：

```sql
INSERT INTO http_with_arrays
SELECT
    arrayMap(x -> (x.1), JSONExtractKeysAndValues(json, 'String')) AS keys,
    arrayMap(x -> (x.2), JSONExtractKeysAndValues(json, 'String')) AS values
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/documents-01.ndjson.gz', 'JSONAsString')

0 rows in set. Elapsed: 12.121 sec. Processed 10.00 million rows, 107.30 MB (825.01 thousand rows/s., 8.85 MB/s.)
```

この構造をクエリするには、[`indexOf`](/sql-reference/functions/array-functions#indexOf)関数を使用して必要なキーのインデックスを特定する必要があります（このキーは値の順序と一致するべきです）。これは、値の配列カラムにアクセスするために使用でき、すなわち`values[indexOf(keys, 'status')]`です。リクエストカラムにはJSON解析方法が依然として必要です - この場合、`simpleJSONExtractString`です。
