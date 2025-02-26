---
title: JSONの他のアプローチ
slug: /integrations/data-formats/json/other-approaches
description: JSONモデル化の他のアプローチ
keywords: [json, formats]
---

# JSONモデル化の他のアプローチ

**次に示すのは、ClickHouseでJSONをモデル化するための代替手段です。これらは完全性のために文書化されており、一般的にはほとんどのユースケースでは推奨されないか、適用されません。**

## ネストを使用する {#using-nested}

[Nestedタイプ](/sql-reference/data-types/nested-data-structures/nested)は、稀に変更される静的オブジェクトをモデル化するのに使用でき、`Tuple`や`Array(Tuple)`の代替手段を提供します。通常、JSONにこのタイプを使用することは避けることを推奨します。その動作はしばしば混乱を招くためです。`Nested`の主な利点は、サブカラムがソートキーに使用できることです。

以下に、Nestedタイプを使用して静的オブジェクトをモデル化する例を示します。次のシンプルなJSONのログエントリを考えてみましょう。

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

設定`flatten_nested`は、ネストされた動作を制御します。

#### flatten_nested=1 {#flatten_nested1}

値が`1`（デフォルト）は、任意のネストレベルをサポートしていません。この値の場合、ネストされたデータ構造は同じ長さの複数の[Array](/sql-reference/data-types/array)列と考えるのが最も簡単です。フィールド`method`、`path`、`version`は全て別々の`Array(Type)`列であり、1つの重要な制約があります：**`method`、`path`、`version`フィールドの長さは同じでなければなりません。** `SHOW CREATE TABLE`を使用すると、これが示されます。

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

以下に、このテーブルに挿入します。

```sql
SET input_format_import_nested_json = 1;
INSERT INTO http
FORMAT JSONEachRow
{"timestamp":897819077,"clientip":"45.212.12.0","request":[{"method":"GET","path":"/french/images/hm_nav_bar.gif","version":"HTTP/1.0"}],"status":200,"size":3305}
```

ここでいくつかの重要なポイントに注意してください：

* JSONをネストされた構造で挿入するには、設定`input_format_import_nested_json`を使用する必要があります。これがないと、JSONをフラットにする必要があります。すなわち、

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

サブカラムの`Array`を使用することで、[Array関数](/sql-reference/functions/array-functions)全般を利用可能にし、[`ARRAY JOIN`](/sql-reference/statements/select/array-join)句を含め、列に複数の値がある場合に便利です。

#### flatten_nested=0 {#flatten_nested0}

これにより、任意のネストレベルが許可され、ネストされたカラムは単一の`Tuple`の配列として保持されます。効果的には、`Array(Tuple)`と同じになります。

**これは、`Nested`を使用してJSONを利用するための推奨される方法であり、しばしば最も簡単な方法です。以下に示すように、全てのオブジェクトがリストであることを要求するだけです。**

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

ここでいくつかの重要なポイントに注意してください：

* 挿入には`input_format_import_nested_json`は必要ありません。
* `SHOW CREATE TABLE`において`Nested`タイプは保持されます。このカラムは実質的には`Array(Tuple(Nested(method LowCardinality(String), path String, version LowCardinality(String))))`です。
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

カラムは再びドット表記を使用してクエリできます：

```sql
SELECT clientip, status, size, `request.method` FROM http WHERE has(request.method, 'GET');

┌─clientip────┬─status─┬─size─┬─request.method─┐
│ 45.212.12.0 │    200 │ 3305 │ ['GET']        │
└─────────────┴────────┴──────┴────────────────┘
1 row in set. Elapsed: 0.002 sec.
```

### 例 {#example}

上記データの大きな例は、s3の公開バケットにあります: `s3://datasets-documentation/http/`。

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

JSONの制約と入力形式を考慮し、このサンプルデータセットを次のクエリを使用して挿入します。ここでは、`flatten_nested=0`を設定します。

次のステートメントは1000万行を挿入するため、実行には数分かかることがあります。必要に応じて`LIMIT`を適用してください：

```sql
INSERT INTO http
SELECT `@timestamp` AS `timestamp`, clientip, [request], status,
size FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/documents-01.ndjson.gz',
'JSONEachRow');
```

このデータをクエリするには、リクエストフィールドを配列としてアクセスする必要があります。以下に、固定された期間中のエラーとHTTPメソッドの要約を示します。

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

ペアワイズ配列は、JSONを文字列として表現する柔軟性と、より構造化されたアプローチのパフォーマンスとのバランスを提供します。スキーマは柔軟であり、新しいフィールドをルートに潜在的に追加できます。ただし、これにはかなり複雑なクエリ構文が必要で、ネストされた構造とは互換性がありません。

例として、次のテーブルを考えてみましょう。

```sql
CREATE TABLE http_with_arrays (
   keys Array(String),
   values Array(String)
)
ENGINE = MergeTree  ORDER BY tuple();
```

このテーブルに挿入するには、JSONをキーと値のリストとして構築する必要があります。次のクエリは、`JSONExtractKeysAndValues`の使用を示します。

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

リクエストカラムが文字列として表現されたネストされた構造のままであることに注意してください。ルートに新しいキーを追加することもできます。また、JSON自体に任意の違いを持たせることもできます。ローカルテーブルに挿入するには、次の操作を実行します。

```sql
INSERT INTO http_with_arrays
SELECT
    arrayMap(x -> (x.1), JSONExtractKeysAndValues(json, 'String')) AS keys,
    arrayMap(x -> (x.2), JSONExtractKeysAndValues(json, 'String')) AS values
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/documents-01.ndjson.gz', 'JSONAsString')

0 rows in set. Elapsed: 12.121 sec. Processed 10.00 million rows, 107.30 MB (825.01 thousand rows/s., 8.85 MB/s.)
```

この構造をクエリするには、[`indexOf`](/sql-reference/functions/array-functions#indexofarr-x)関数を使用して必要なキーのインデックスを特定する必要があります（この順序は値と一致する必要があります）。これを使用して、値の配列カラムにアクセスします。すなわち、`values[indexOf(keys, 'status')]`です。リクエストカラムには、JSON解析メソッドが必要です。この場合、`simpleJSONExtractString`です。

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
```
