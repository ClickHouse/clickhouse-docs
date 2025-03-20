---
title: 他のJSONアプローチ
slug: /integrations/data-formats/json/other-approaches
description: JSONモデリングの他のアプローチ
keywords: [json, formats]
---


# 他のJSONモデリングのアプローチ

**以下は、ClickHouseでのJSONモデリングの代替方法です。これらは完結性のために文書化されており、一般的には推奨されず、ほとんどのユースケースに適用されません。**

## ネストを使用する {#using-nested}

[ネスト型](/sql-reference/data-types/nested-data-structures/nested)は、変更が滅多にない静的オブジェクトをモデリングするために使用でき、`Tuple`や`Array(Tuple)`の代替手段を提供します。この型はその動作がしばしば混乱を招くため、JSONには使用しないことを一般的に推奨します。`Nested`の主な利点は、サブカラムをオーダリングキーに使用できることです。

以下は、静的オブジェクトをモデリングするためにネスト型を使用する例です。以下のJSONの簡単なログエントリを考えてみましょう:

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

値が`1`（デフォルト）は、任意のネストレベルをサポートしません。この値を用いると、ネストされたデータ構造を長さが同じ複数の[Array](/sql-reference/data-types/array)カラムとして考えるのが最も簡単です。`method`、`path`、`version`フィールドは全て、実質的には別々の`Array(Type)`カラムであり、1つの重要な制約があります: **`method`、`path`、`version`フィールドの長さは同じでなければなりません。** `SHOW CREATE TABLE`を用いると、これが明示されます:

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

以下にこのテーブルに挿入を行います:

```sql
SET input_format_import_nested_json = 1;
INSERT INTO http
FORMAT JSONEachRow
{"timestamp":897819077,"clientip":"45.212.12.0","request":[{"method":"GET","path":"/french/images/hm_nav_bar.gif","version":"HTTP/1.0"}],"status":200,"size":3305}
```

いくつかの重要なポイントに注意してください:

* JSONをネストされた構造として挿入するために`input_format_import_nested_json`設定を使用する必要があります。これがなければ、JSONをフラット化する必要があります。つまり、

    ```sql
    INSERT INTO http FORMAT JSONEachRow
    {"timestamp":897819077,"clientip":"45.212.12.0","request":{"method":["GET"],"path":["/french/images/hm_nav_bar.gif"],"version":["HTTP/1.0"]},"status":200,"size":3305}
    ```
* ネストされたフィールド`method`、`path`、`version`はJSON配列として渡される必要があります。つまり、

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

カラムはドット表記を使用してクエリできます:

```sql
SELECT clientip, status, size, `request.method` FROM http WHERE has(request.method, 'GET');

┌─clientip────┬─status─┬─size─┬─request.method─┐
│ 45.212.12.0 │    200 │ 3305 │ ['GET']        │
└─────────────┴────────┴──────┴────────────────┘
1 row in set. Elapsed: 0.002 sec.
```

サブカラムの`Array`の使用により、[Array関数](/sql-reference/functions/array-functions)を活用できる可能性があり、[`ARRAY JOIN`](/sql-reference/statements/select/array-join)句も利用可能です - これは、複数の値を持つカラムに便利です。

#### flatten_nested=0 {#flatten_nested0}

これにより、任意のネストレベルが許可され、ネストされたカラムは`Tuple`の単一の配列として保持されます - 効果的に`Array(Tuple)`と同じになります。

**これは、JSONを`Nested`と共に使用するための好ましい方法であり、最も簡単な方法の1つです。下記に示すように、すべてのオブジェクトをリストとして持つだけで済みます。**

以下にテーブルを再作成し、行を再挿入します:

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

-- 注意: ネスト型は保持されます。
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

いくつかの重要なポイントに注意してください:

* 挿入するために`input_format_import_nested_json`は必要ありません。
* `SHOW CREATE TABLE`で`Nested`型が保持されます。このカラムの下には、実質的には`Array(Tuple(Nested(method LowCardinality(String), path String, version LowCardinality(String))))`があります。
* その結果、`request`を配列として挿入する必要があります。つまり、

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

カラムは再びドット表記を使用してクエリできます:

```sql
SELECT clientip, status, size, `request.method` FROM http WHERE has(request.method, 'GET');

┌─clientip────┬─status─┬─size─┬─request.method─┐
│ 45.212.12.0 │    200 │ 3305 │ ['GET']        │
└─────────────┴────────┴──────┴────────────────┘
1 row in set. Elapsed: 0.002 sec.
```

### 例 {#example}

上記のデータの大きな例は、s3の公開バケットにあります: `s3://datasets-documentation/http/`。

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

JSONの制約と入力形式に基づいて、このサンプルデータセットを挿入するために次のクエリを使用します。ここでは、`flatten_nested=0`を設定します。

次の文は1000万行を挿入するので、実行に数分かかるかもしれません。必要に応じて`LIMIT`を適用してください:

```sql
INSERT INTO http
SELECT `@timestamp` AS `timestamp`, clientip, [request], status,
size FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/documents-01.ndjson.gz',
'JSONEachRow');
```

このデータにクエリを行うには、リクエストフィールドを配列としてアクセスする必要があります。以下に、特定の期間のエラーとHTTPメソッドを要約します。

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

ペアワイズ配列は、JSONを文字列として表現する柔軟性と、より構造化されたアプローチのパフォーマンスのバランスを提供します。このスキーマは柔軟であり、新しいフィールドをルートに追加することが可能です。しかし、これにはかなり複雑なクエリ構文が必要であり、ネスト構造とは互換性がありません。

例えば、以下のテーブルを考えてみます:

```sql
CREATE TABLE http_with_arrays (
   keys Array(String),
   values Array(String)
)
ENGINE = MergeTree  ORDER BY tuple();
```

このテーブルに挿入するには、JSONをキーと値のリストとして構築する必要があります。次のクエリは、`JSONExtractKeysAndValues`を使用してこれを達成する方法を示しています:

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

リクエストカラムが文字列として表されたネストされた構造が保持されています。ルートに任意の新しいキーを追加することも可能です。また、JSON自体に任意の違いを持つこともできます。ローカルテーブルに挿入するには、次のクエリを実行してください:

```sql
INSERT INTO http_with_arrays
SELECT
    arrayMap(x -> (x.1), JSONExtractKeysAndValues(json, 'String')) AS keys,
    arrayMap(x -> (x.2), JSONExtractKeysAndValues(json, 'String')) AS values
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/documents-01.ndjson.gz', 'JSONAsString')

0 rows in set. Elapsed: 12.121 sec. Processed 10.00 million rows, 107.30 MB (825.01 thousand rows/s., 8.85 MB/s.)
```

この構造をクエリするには、`indexOf`関数を使用して必要なキーのインデックスを特定する必要があります（これは値の順序と一致する必要があります）。これを使用して値の配列カラムをアクセスします。つまり、`values[indexOf(keys, 'status')]`を用います。リクエストカラムに対してはJSON解析メソッドが必要になります - この場合、`simpleJSONExtractString`を使用します。

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
