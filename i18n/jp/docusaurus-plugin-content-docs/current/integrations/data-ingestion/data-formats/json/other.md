---
title: 'その他の JSON アプローチ'
slug: /integrations/data-formats/json/other-approaches
description: 'JSON モデリングのその他のアプローチ'
keywords: ['json', 'formats']
doc_type: 'reference'
---



# JSON をモデリングするその他のアプローチ

**以下は、ClickHouse における JSON モデリングの代替手法です。網羅性のために記載していますが、これらは `JSON` 型の開発以前に用いられていた手法であり、そのため一般的には、ほとんどのユースケースで推奨も適用もされません。**

:::note オブジェクト単位のアプローチを適用する
同じスキーマ内でも、オブジェクトごとに異なる手法を適用できます。たとえば、あるオブジェクトには `String` 型が最適で、別のオブジェクトには `Map` 型が適している場合があります。`String` 型を使用した場合、それ以上スキーマに関する意思決定を行う必要がない点に注意してください。逆に、以下で示すように、`Map` のキーの下にサブオブジェクトをネストすることも可能であり、その中には JSON を表す `String` を含めることもできます。
:::



## String型の使用 {#using-string}

オブジェクトが高度に動的で予測可能な構造を持たず、任意のネストされたオブジェクトを含む場合は、`String`型を使用してください。以下に示すように、クエリ時にJSON関数を使用して値を抽出できます。

上記で説明した構造化アプローチによるデータ処理は、変更される可能性があるか、スキーマが十分に理解されていない動的なJSONを扱うユーザーにとって、実用的でない場合が多くあります。最大限の柔軟性を得るために、JSONを`String`として保存し、必要に応じて関数を使用してフィールドを抽出することができます。これは、JSONを構造化オブジェクトとして扱うことの正反対のアプローチです。この柔軟性には代償が伴い、重大な欠点があります。主にクエリ構文の複雑化とパフォーマンスの低下です。

前述のように、[元のpersonオブジェクト](/integrations/data-formats/json/schema#static-vs-dynamic-json)では、`tags`カラムの構造を保証できません。元の行を挿入し（現時点では無視する`company.labels`を含む）、`tags`カラムを`String`として宣言します：

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

[`JSONExtract`](/sql-reference/functions/json-functions#jsonextract-functions)関数を使用して、このJSONから値を取得できます。以下の簡単な例を見てみましょう：

```sql
SELECT JSONExtractString(tags, 'holidays') AS holidays FROM people

┌─holidays──────────────────────────────────────┐
│ [{"year":2024,"location":"Azores, Portugal"}] │
└───────────────────────────────────────────────┘

1 row in set. Elapsed: 0.002 sec.
```

関数には、`String`カラム`tags`への参照と、抽出するJSON内のパスの両方が必要であることに注意してください。ネストされたパスには、関数をネストする必要があります。例えば、`JSONExtractUInt(JSONExtractString(tags, 'car'), 'year')`は`tags.car.year`カラムを抽出します。ネストされたパスの抽出は、[`JSON_QUERY`](/sql-reference/functions/json-functions#JSON_QUERY)および[`JSON_VALUE`](/sql-reference/functions/json-functions#JSON_VALUE)関数を使用することで簡素化できます。

`arxiv`データセットの極端なケースを考えてみましょう。ここでは、本文全体を`String`として扱います。

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


年ごとにリリースされた論文の数を集計したいとします。文字列のみを使用するクエリと、スキーマの[構造化バージョン](/integrations/data-formats/json/inference#creating-tables)を使用するクエリを比較してみましょう:

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

ここでは、XPath式を使用してJSONをフィルタリングしていることに注目してください。つまり、`JSON_VALUE(body, '$.versions[0].created')`です。

String関数は、インデックスを使用した明示的な型変換よりも著しく遅く(10倍以上)なります。上記のクエリは常にフルテーブルスキャンとすべての行の処理が必要です。このような小規模なデータセットではこれらのクエリは依然として高速ですが、より大規模なデータセットではパフォーマンスが低下します。

このアプローチの柔軟性には、明確なパフォーマンスと構文のコストが伴うため、スキーマ内の高度に動的なオブジェクトに対してのみ使用すべきです。

### Simple JSON関数 {#simple-json-functions}

上記の例では、JSON\*ファミリーの関数を使用しています。これらは[simdjson](https://github.com/simdjson/simdjson)に基づく完全なJSONパーサーを利用しており、厳密な解析を行い、異なるレベルにネストされた同じフィールドを区別します。これらの関数は、構文的には正しいが整形されていないJSON(例:キー間の二重スペース)を処理できます。

より高速で厳格な関数セットが利用可能です。これらの`simpleJSON*`関数は、主にJSONの構造と形式について厳格な前提を置くことで、潜在的に優れたパフォーマンスを提供します。具体的には:

- フィールド名は定数である必要があります
- フィールド名の一貫したエンコーディング。例:`simpleJSONHas('{"abc":"def"}', 'abc') = 1`ですが、`visitParamHas('{"\\u0061\\u0062\\u0063":"def"}', 'abc') = 0`となります
- フィールド名はすべてのネスト構造全体で一意である必要があります。ネストレベル間の区別は行われず、マッチングは無差別です。複数の一致するフィールドがある場合、最初に出現したものが使用されます。
- 文字列リテラル外に特殊文字を含めることはできません。これにはスペースも含まれます。以下は無効であり、解析されません。

  ```json
  {
    "@timestamp": 893964617,
    "clientip": "40.135.0.0",
    "request": {
      "method": "GET",
      "path": "/images/hm_bg.jpg",
      "version": "HTTP/1.0"
    },
    "status": 200,
    "size": 24736
  }
  ```

一方、以下は正しく解析されます:


````json
{"@timestamp":893964617,"clientip":"40.135.0.0","request":{"method":"GET",
    "path":"/images/hm_bg.jpg","version":"HTTP/1.0"},"status":200,"size":24736}

パフォーマンスが重要で、JSONが上記の要件を満たす場合、これらの関数が適切な選択肢となります。以下は、先ほどのクエリを`simpleJSON*`関数を使用して書き直した例です：

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

上記のクエリでは、`simpleJSONExtractString` を使用して `created` キーを抽出しており、公開日時については最初の値だけが必要であるという点を利用しています。このケースでは、パフォーマンス向上と引き換えであれば `simpleJSON*` 関数の制約は許容できます。


## Map型の使用 {#using-map}

オブジェクトが任意のキーを格納するために使用され、そのほとんどが単一の型である場合は、`Map`型の使用を検討してください。理想的には、一意のキーの数は数百を超えないようにすべきです。`Map`型は、サブオブジェクトを持つオブジェクトにも使用できますが、サブオブジェクトの型に統一性がある場合に限ります。一般的に、`Map`型はラベルやタグに使用することを推奨します。例えば、ログデータ内のKubernetesポッドラベルなどです。

`Map`はネストされた構造を表現する簡単な方法を提供しますが、いくつかの注目すべき制限があります:

- すべてのフィールドは同じ型である必要があります。
- サブカラムへのアクセスには特別なマップ構文が必要です。これは、フィールドがカラムとして存在しないためです。オブジェクト全体_が_カラムです。
- サブカラムへのアクセスは`Map`値全体、つまりすべての兄弟要素とそれぞれの値を読み込みます。大きなマップの場合、これは重大なパフォーマンスペナルティをもたらす可能性があります。

:::note 文字列キー
オブジェクトを`Map`としてモデル化する場合、JSONキー名を格納するために`String`キーが使用されます。したがって、マップは常に`Map(String, T)`となり、`T`はデータに依存します。
:::

#### プリミティブ値 {#primitive-values}

`Map`の最も単純な適用は、オブジェクトが値として同じプリミティブ型を含む場合です。ほとんどの場合、これは値`T`に`String`型を使用することを意味します。

[以前のperson JSON](/integrations/data-formats/json/schema#static-vs-dynamic-json)を考えてみましょう。ここでは、`company.labels`オブジェクトが動的であると判断されました。重要なのは、このオブジェクトにはString型のキーと値のペアのみが追加されることを想定している点です。したがって、これを`Map(String, String)`として宣言できます:

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

リクエストオブジェクト内のこれらのフィールドをクエリするには、マップ構文が必要です。例えば:

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

`Map`関数の完全なセットがクエリに利用可能で、[こちら](/sql-reference/functions/tuple-map-functions.md)で説明されています。データの型が一貫していない場合は、[必要な型変換](/sql-reference/functions/type-conversion-functions)を実行する関数が存在します。

#### オブジェクト値 {#object-values}

`Map`型は、サブオブジェクトを持つオブジェクトにも使用できますが、サブオブジェクトの型に一貫性がある場合に限ります。

`persons`オブジェクトの`tags`キーが一貫した構造を必要とし、各`tag`のサブオブジェクトが`name`と`time`カラムを持つと仮定します。このようなJSONドキュメントの簡略化された例は次のようになります:


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

これは、次のように `Map(String, Tuple(name String, time DateTime))` で表現できます：

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

1行のセット。経過時間: 0.002秒

SELECT tags['hobby'] AS hobby
FROM people
FORMAT JSONEachRow

{"hobby":{"name":"Diving","time":"2024-07-11 14:18:01"}}

1行のセット。経過時間: 0.001秒
```

このケースで `Map` を使用することは一般的にほとんどなく、動的なキー名の下にサブオブジェクトを持たないようにデータを再設計すべきであることを示唆しています。例えば、上記は次のように再設計すれば、`Array(Tuple(key String, name String, time DateTime))` を使用できるようになります。

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


## Nested型の使用 {#using-nested}

[Nested型](/sql-reference/data-types/nested-data-structures/nested)は、変更されることが稀な静的オブジェクトをモデル化するために使用でき、`Tuple`や`Array(Tuple)`の代替手段となります。この型の動作は混乱を招くことが多いため、JSONに対してこの型を使用することは一般的に推奨されません。`Nested`の主な利点は、サブカラムをソートキーで使用できることです。

以下では、Nested型を使用して静的オブジェクトをモデル化する例を示します。次のシンプルなJSONログエントリを考えてみましょう:

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

`flatten_nested`設定は、ネストの動作を制御します。

#### flatten_nested=1 {#flatten_nested1}

値`1`(デフォルト)は、任意のレベルのネストをサポートしません。この値では、ネストされたデータ構造を同じ長さの複数の[Array](/sql-reference/data-types/array)カラムとして考えるのが最も簡単です。`method`、`path`、`version`フィールドは、実質的にすべて個別の`Array(Type)`カラムであり、1つの重要な制約があります:**`method`、`path`、`version`フィールドの長さは同じでなければなりません。**`SHOW CREATE TABLE`を使用すると、これが示されます:

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

ここで注意すべき重要な点がいくつかあります:

- JSONをネスト構造として挿入するには、`input_format_import_nested_json`設定を使用する必要があります。これがない場合、JSONをフラット化する必要があります。つまり:

  ```sql
  INSERT INTO http FORMAT JSONEachRow
  {"timestamp":897819077,"clientip":"45.212.12.0","request":{"method":["GET"],"path":["/french/images/hm_nav_bar.gif"],"version":["HTTP/1.0"]},"status":200,"size":3305}
  ```

- ネストされたフィールド`method`、`path`、`version`はJSON配列として渡す必要があります。つまり:

  ```json
  {
    "@timestamp": 897819077,
    "clientip": "45.212.12.0",
    "request": {
      "method": ["GET"],
      "path": ["/french/images/hm_nav_bar.gif"],
      "version": ["HTTP/1.0"]
    },
    "status": 200,
    "size": 3305
  }
  ```

カラムはドット記法を使用してクエリできます:

```sql
SELECT clientip, status, size, `request.method` FROM http WHERE has(request.method, 'GET');

┌─clientip────┬─status─┬─size─┬─request.method─┐
│ 45.212.12.0 │    200 │ 3305 │ ['GET']        │
└─────────────┴────────┴──────┴────────────────┘
1 row in set. Elapsed: 0.002 sec.
```


サブカラムに`Array`を使用することで、[配列関数](/sql-reference/functions/array-functions)の全機能を活用できます。これには[`ARRAY JOIN`](/sql-reference/statements/select/array-join)句も含まれ、カラムに複数の値がある場合に便利です。

#### flatten_nested=0 {#flatten_nested0}

これにより任意のレベルのネストが可能になり、ネストされたカラムは単一の`Tuple`配列として保持されます。実質的には`Array(Tuple)`と同じになります。

**これは`Nested`でJSONを使用する際の推奨方法であり、多くの場合最もシンプルな方法です。以下で示すように、すべてのオブジェクトをリストにするだけで済みます。**

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

-- Nested型が保持されていることに注意してください。
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

ここで注意すべき重要なポイントがいくつかあります:

- 挿入時に`input_format_import_nested_json`は不要です。
- `SHOW CREATE TABLE`で`Nested`型が保持されます。このカラムの内部構造は実質的に`Array(Tuple(Nested(method LowCardinality(String), path String, version LowCardinality(String))))`です。
- その結果、`request`を配列として挿入する必要があります。つまり:

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

カラムはドット記法を使用してクエリできます:

```sql
SELECT clientip, status, size, `request.method` FROM http WHERE has(request.method, 'GET');

┌─clientip────┬─status─┬─size─┬─request.method─┐
│ 45.212.12.0 │    200 │ 3305 │ ['GET']        │
└─────────────┴────────┴──────┴────────────────┘
1 row in set. Elapsed: 0.002 sec.
```

### 例 {#example}

上記データのより大きな例は、s3のパブリックバケット`s3://datasets-documentation/http/`で利用可能です。

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

JSONの制約と入力形式を考慮して、以下のクエリを使用してこのサンプルデータセットを挿入します。ここでは`flatten_nested=0`を設定します。

以下のステートメントは1000万行を挿入するため、実行に数分かかる場合があります。必要に応じて`LIMIT`を適用してください:

```sql
INSERT INTO http
SELECT `@timestamp` AS `timestamp`, clientip, [request], status,
size FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/documents-01.ndjson.gz',
'JSONEachRow');
```

このデータをクエリするには、requestフィールドに配列としてアクセスする必要があります。以下では、固定期間におけるエラーとHTTPメソッドを集計します。


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

### ペア配列の使用 {#using-pairwise-arrays}

ペア配列は、JSONを文字列として表現する柔軟性と、より構造化されたアプローチのパフォーマンスのバランスを提供します。スキーマは柔軟であり、ルートに新しいフィールドを追加することができます。ただし、これにはかなり複雑なクエリ構文が必要であり、ネストされた構造には対応していません。

例として、次のテーブルを考えてみましょう：

```sql
CREATE TABLE http_with_arrays (
   keys Array(String),
   values Array(String)
)
ENGINE = MergeTree  ORDER BY tuple();
```

このテーブルに挿入するには、JSONをキーと値のリストとして構造化する必要があります。次のクエリは、これを実現するための`JSONExtractKeysAndValues`の使用方法を示しています：

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

requestカラムが文字列として表現されたネスト構造のままであることに注意してください。ルートに新しいキーを挿入することができます。また、JSON自体に任意の差異を持たせることもできます。ローカルテーブルに挿入するには、次を実行します：

```sql
INSERT INTO http_with_arrays
SELECT
    arrayMap(x -> (x.1), JSONExtractKeysAndValues(json, 'String')) AS keys,
    arrayMap(x -> (x.2), JSONExtractKeysAndValues(json, 'String')) AS values
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/documents-01.ndjson.gz', 'JSONAsString')

0 rows in set. Elapsed: 12.121 sec. Processed 10.00 million rows, 107.30 MB (825.01 thousand rows/s., 8.85 MB/s.)
```

この構造をクエリするには、[`indexOf`](/sql-reference/functions/array-functions#indexOf)関数を使用して、必要なキーのインデックスを特定する必要があります（これは値の順序と一致している必要があります）。これを使用して、values配列カラムにアクセスできます。つまり、`values[indexOf(keys, 'status')]`です。requestカラムにはJSON解析メソッドが依然として必要です。この場合は`simpleJSONExtractString`を使用します。

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

```


5 行の結果。経過時間: 0.383 秒。処理済み 8.22 百万行, 1.97 GB (21.45 百万行/秒, 5.15 GB/秒)
ピークメモリ使用量: 51.35 MiB。

```
```
