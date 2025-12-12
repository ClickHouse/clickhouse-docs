---
description: 'ClickHouse における JSON データ型のドキュメントで、JSON データを扱うためのネイティブサポートについて説明します'
keywords: ['json', 'data type']
sidebar_label: 'JSON'
sidebar_position: 63
slug: /sql-reference/data-types/newjson
title: 'JSON データ型'
doc_type: 'reference'
---

import {CardSecondary} from '@clickhouse/click-ui/bundled';
import Link from '@docusaurus/Link'

<Link to="/docs/best-practices/use-json-where-appropriate" style={{display: 'flex', textDecoration: 'none', width: 'fit-content'}}>
  <CardSecondary badgeState="success" badgeText="" description="JSON 型を使用する際の例、高度な機能、および考慮事項については、JSON ベストプラクティスガイドをご覧ください。" icon="book" infoText="詳しく読む" infoUrl="/docs/best-practices/use-json-where-appropriate" title="ガイドをお探しですか？" />
</Link>

<br />

`JSON` 型は、JavaScript Object Notation (JSON) ドキュメントを 1 つの列に保存します。

:::note
ClickHouse オープンソース版では、バージョン 25.3 で JSON データ型が本番利用可能 (production ready) としてマークされています。以前のバージョンでこの型を本番環境で使用することは推奨されません。
:::

`JSON` 型の列を宣言するには、次の構文を使用できます。

```sql
<column_name> JSON
(
    max_dynamic_paths=N, 
    max_dynamic_types=M, 
    some.path TypeName, 
    SKIP path.to.skip, 
    SKIP REGEXP 'paths_regexp'
)
```

上記の構文内の各パラメータは、次のように定義されます。

| Parameter                   | Description                                                                                                                                                                                 | Default Value |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| `max_dynamic_paths`         | 個別に保存される 1 つのデータブロック内で（例えば、MergeTree テーブルの 1 つのデータパーツ内で）、いくつのパスをサブカラムとして個別に保持できるかを示すオプションのパラメータです。<br /><br />この制限を超えた場合、それ以外のすべてのパスは 1 つの共通の構造体としてまとめて保存されます。                              | `1024`        |
| `max_dynamic_types`         | 個別に保存される 1 つのデータブロック内で（例えば、MergeTree テーブルの 1 つのデータパーツ内で）、型 `Dynamic` を持つ 1 つのパスカラム内にいくつの異なるデータ型を保存できるかを示す、`1` から `255` の範囲のオプションのパラメータです。<br /><br />この制限を超えた場合、新しい型はすべて `String` 型に変換されます。 | `32`          |
| `some.path TypeName`        | JSON 内の特定のパスに対するオプションの型ヒントです。そのようなパスは、常に指定された型のサブカラムとして保存されます。                                                                                                                              |               |
| `SKIP path.to.skip`         | JSON パース時にスキップすべき特定のパスを指定するオプションのヒントです。そのようなパスは JSON カラム内に保存されることはありません。指定されたパスがネストされた JSON オブジェクトである場合、そのネストされたオブジェクト全体がスキップされます。                                                          |               |
| `SKIP REGEXP 'path_regexp'` | JSON パース中にパスをスキップするために使用される正規表現を指定するオプションのヒントです。この正規表現にマッチするすべてのパスは、JSON カラム内に保存されることはありません。                                                                                                |               |

## JSON の生成 {#creating-json}

このセクションでは、`JSON` を生成するさまざまな方法を確認します。

### テーブルの列定義で `JSON` を使用する {#using-json-in-a-table-column-definition}

```sql title="Query (Example 1)"
CREATE TABLE test (json JSON) ENGINE = Memory;
INSERT INTO test VALUES ('{"a" : {"b" : 42}, "c" : [1, 2, 3]}'), ('{"f" : "Hello, World!"}'), ('{"a" : {"b" : 43, "e" : 10}, "c" : [4, 5, 6]}');
SELECT json FROM test;
```

```text title="Response (Example 1)"
┌─json────────────────────────────────────────┐
│ {"a":{"b":"42"},"c":["1","2","3"]}          │
│ {"f":"Hello, World!"}                       │
│ {"a":{"b":"43","e":"10"},"c":["4","5","6"]} │
└─────────────────────────────────────────────┘
```

```sql title="Query (Example 2)"
CREATE TABLE test (json JSON(a.b UInt32, SKIP a.e)) ENGINE = Memory;
INSERT INTO test VALUES ('{"a" : {"b" : 42}, "c" : [1, 2, 3]}'), ('{"f" : "Hello, World!"}'), ('{"a" : {"b" : 43, "e" : 10}, "c" : [4, 5, 6]}');
SELECT json FROM test;
```

```text title="Response (Example 2)"
┌─json──────────────────────────────┐
│ {"a":{"b":42},"c":["1","2","3"]}  │
│ {"a":{"b":0},"f":"Hello, World!"} │
│ {"a":{"b":43},"c":["4","5","6"]}  │
└───────────────────────────────────┘
```

### `::JSON` を使用した CAST {#using-cast-with-json}

特別な構文 `::JSON` を使用して、さまざまな型の値を `JSON` 型にキャストできます。

#### `String` から `JSON` への CAST {#cast-from-string-to-json}

```sql title="Query"
SELECT '{"a" : {"b" : 42},"c" : [1, 2, 3], "d" : "Hello, World!"}'::JSON AS json;
```

```text title="Response"
┌─json───────────────────────────────────────────────────┐
│ {"a":{"b":"42"},"c":["1","2","3"],"d":"Hello, World!"} │
└────────────────────────────────────────────────────────┘
```

#### `Tuple` から `JSON` への CAST {#cast-from-tuple-to-json}

```sql title="Query"
SET enable_named_columns_in_function_tuple = 1;
SELECT (tuple(42 AS b) AS a, [1, 2, 3] AS c, 'Hello, World!' AS d)::JSON AS json;
```

```text title="Response"
┌─json───────────────────────────────────────────────────┐
│ {"a":{"b":"42"},"c":["1","2","3"],"d":"Hello, World!"} │
└────────────────────────────────────────────────────────┘
```

#### `Map` を `JSON` に CAST する {#cast-from-map-to-json}

```sql title="Query"
SET use_variant_as_common_type=1;
SELECT map('a', map('b', 42), 'c', [1,2,3], 'd', 'Hello, World!')::JSON AS json;
```

```text title="Response"
┌─json───────────────────────────────────────────────────┐
│ {"a":{"b":"42"},"c":["1","2","3"],"d":"Hello, World!"} │
└────────────────────────────────────────────────────────┘
```

:::note
JSON のパスはフラット化されたパスとして保存されます。これは、`a.b.c` のようなパスから JSON オブジェクトを整形する際に、
そのオブジェクトを `{ "a.b.c" : ... }` として構築すべきなのか、あるいは `{ "a": { "b": { "c": ... } } }` として構築すべきなのかを判別できないことを意味します。
本実装では常に後者として解釈します。

例えば次のとおりです。

```sql
SELECT CAST('{"a.b.c" : 42}', 'JSON') AS json
```

は以下を返します:

```response
   ┌─json───────────────────┐
1. │ {"a":{"b":{"c":"42"}}} │
   └────────────────────────┘
```

そして、**次のようにしてはいけません**:

```sql
   ┌─json───────────┐
1. │ {"a.b.c":"42"} │
   └────────────────┘
```

:::

## JSON パスをサブカラムとして読み取る {#reading-json-paths-as-sub-columns}

`JSON` 型では、各パスを個別のサブカラムとして読み取ることができます。
要求されたパスの型が JSON 型の宣言で指定されていない場合、
そのパスのサブカラムは常に型 [Dynamic](/sql-reference/data-types/dynamic.md) になります。

例：

```sql title="Query"
CREATE TABLE test (json JSON(a.b UInt32, SKIP a.e)) ENGINE = Memory;
INSERT INTO test VALUES ('{"a" : {"b" : 42, "g" : 42.42}, "c" : [1, 2, 3], "d" : "2020-01-01"}'), ('{"f" : "Hello, World!", "d" : "2020-01-02"}'), ('{"a" : {"b" : 43, "e" : 10, "g" : 43.43}, "c" : [4, 5, 6]}');
SELECT json FROM test;
```

```text title="Response"
┌─json────────────────────────────────────────────────────────┐
│ {"a":{"b":42,"g":42.42},"c":["1","2","3"],"d":"2020-01-01"} │
│ {"a":{"b":0},"d":"2020-01-02","f":"Hello, World!"}          │
│ {"a":{"b":43,"g":43.43},"c":["4","5","6"]}                  │
└─────────────────────────────────────────────────────────────┘
```

```sql title="Query (Reading JSON paths as sub-columns)"
SELECT json.a.b, json.a.g, json.c, json.d FROM test;
```

```text title="Response (Reading JSON paths as sub-columns)"
┌─json.a.b─┬─json.a.g─┬─json.c──┬─json.d─────┐
│       42 │ 42.42    │ [1,2,3] │ 2020-01-01 │
│        0 │ ᴺᵁᴸᴸ     │ ᴺᵁᴸᴸ    │ 2020-01-02 │
│       43 │ 43.43    │ [4,5,6] │ ᴺᵁᴸᴸ       │
└──────────┴──────────┴─────────┴────────────┘
```

`getSubcolumn` 関数を使用して、`JSON` 型からサブカラムを読み取ることもできます。

```sql title="Query"
SELECT getSubcolumn(json, 'a.b'), getSubcolumn(json, 'a.g'), getSubcolumn(json, 'c'), getSubcolumn(json, 'd') FROM test;
```

```text title="Response"
┌─getSubcolumn(json, 'a.b')─┬─getSubcolumn(json, 'a.g')─┬─getSubcolumn(json, 'c')─┬─getSubcolumn(json, 'd')─┐
│                        42 │ 42.42                     │ [1,2,3]                 │ 2020-01-01              │
│                         0 │ ᴺᵁᴸᴸ                      │ ᴺᵁᴸᴸ                    │ 2020-01-02              │
│                        43 │ 43.43                     │ [4,5,6]                 │ ᴺᵁᴸᴸ                    │
└───────────────────────────┴───────────────────────────┴─────────────────────────┴─────────────────────────┘
```

要求されたパスがデータ内に存在しなかった場合、そのパスは `NULL` 値で埋められます：

```sql title="Query"
SELECT json.non.existing.path FROM test;
```

```text title="Response"
┌─json.non.existing.path─┐
│ ᴺᵁᴸᴸ                   │
│ ᴺᵁᴸᴸ                   │
│ ᴺᵁᴸᴸ                   │
└────────────────────────┘
```

返されたサブカラムのデータ型を確認してみましょう。

```sql title="Query"
SELECT toTypeName(json.a.b), toTypeName(json.a.g), toTypeName(json.c), toTypeName(json.d) FROM test;
```

```text title="Response"
┌─toTypeName(json.a.b)─┬─toTypeName(json.a.g)─┬─toTypeName(json.c)─┬─toTypeName(json.d)─┐
│ UInt32               │ Dynamic              │ Dynamic            │ Dynamic            │
│ UInt32               │ Dynamic              │ Dynamic            │ Dynamic            │
│ UInt32               │ Dynamic              │ Dynamic            │ Dynamic            │
└──────────────────────┴──────────────────────┴────────────────────┴────────────────────┘
```

上記のとおり、`a.b` については JSON の型宣言で指定したとおり型は `UInt32` になっており、
それ以外のすべてのサブカラムの型は `Dynamic` になっています。

また、特別な構文 `json.some.path.:TypeName` を使用して、`Dynamic` 型のサブカラムを読み取ることもできます。

```sql title="Query"
SELECT
    json.a.g.:Float64,
    dynamicType(json.a.g),
    json.d.:Date,
    dynamicType(json.d)
FROM test
```

```text title="Response"
┌─json.a.g.:`Float64`─┬─dynamicType(json.a.g)─┬─json.d.:`Date`─┬─dynamicType(json.d)─┐
│               42.42 │ Float64               │     2020-01-01 │ Date                │
│                ᴺᵁᴸᴸ │ None                  │     2020-01-02 │ Date                │
│               43.43 │ Float64               │           ᴺᵁᴸᴸ │ None                │
└─────────────────────┴───────────────────────┴────────────────┴─────────────────────┘
```

`Dynamic` のサブカラムは任意のデータ型にキャストできます。このとき、`Dynamic` の内部型を要求された型にキャストできない場合には、例外がスローされます。

```sql title="Query"
SELECT json.a.g::UInt64 AS uint 
FROM test;
```

```text title="Response"
┌─uint─┐
│   42 │
│    0 │
│   43 │
└──────┘
```

```sql title="Query"
SELECT json.a.g::UUID AS float 
FROM test;
```

```text title="Response"
Received exception from server:
Code: 48. DB::Exception: Received from localhost:9000. DB::Exception: 
Conversion between numeric types and UUID is not supported. 
Probably the passed UUID is unquoted: 
while executing 'FUNCTION CAST(__table1.json.a.g :: 2, 'UUID'_String :: 1) -> CAST(__table1.json.a.g, 'UUID'_String) UUID : 0'. 
(NOT_IMPLEMENTED)
```

:::note
Compact MergeTree のパーツからサブカラムを効率的に読み込むには、MergeTree 設定 [write&#95;marks&#95;for&#95;substreams&#95;in&#95;compact&#95;parts](../../operations/settings/merge-tree-settings.md#write_marks_for_substreams_in_compact_parts) が有効になっていることを確認してください。
:::

## JSON サブオブジェクトをサブカラムとして読み取る {#reading-json-sub-objects-as-sub-columns}

`JSON` 型では、特別な構文 `json.^some.path` を使うことで、ネストされたオブジェクトを型 `JSON` のサブカラムとして読み取ることができます。

```sql title="Query"
CREATE TABLE test (json JSON) ENGINE = Memory;
INSERT INTO test VALUES ('{"a" : {"b" : {"c" : 42, "g" : 42.42}}, "c" : [1, 2, 3], "d" : {"e" : {"f" : {"g" : "Hello, World", "h" : [1, 2, 3]}}}}'), ('{"f" : "Hello, World!", "d" : {"e" : {"f" : {"h" : [4, 5, 6]}}}}'), ('{"a" : {"b" : {"c" : 43, "e" : 10, "g" : 43.43}}, "c" : [4, 5, 6]}');
SELECT json FROM test;
```

```text title="Response"
┌─json──────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ {"a":{"b":{"c":"42","g":42.42}},"c":["1","2","3"],"d":{"e":{"f":{"g":"Hello, World","h":["1","2","3"]}}}} │
│ {"d":{"e":{"f":{"h":["4","5","6"]}}},"f":"Hello, World!"}                                                 │
│ {"a":{"b":{"c":"43","e":"10","g":43.43}},"c":["4","5","6"]}                                               │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

```sql title="Query"
SELECT json.^a.b, json.^d.e.f FROM test;
```

```text title="Response"
┌─json.^`a`.b───────────────────┬─json.^`d`.e.f──────────────────────────┐
│ {"c":"42","g":42.42}          │ {"g":"Hello, World","h":["1","2","3"]} │
│ {}                            │ {"h":["4","5","6"]}                    │
│ {"c":"43","e":"10","g":43.43} │ {}                                     │
└───────────────────────────────┴────────────────────────────────────────┘
```

:::note
サブオブジェクトをサブカラムとして読み出すことは非効率になる可能性があります。JSON データをほぼ全件スキャンする必要が生じる場合があるためです。
:::

## パスの型推論 {#type-inference-for-paths}

`JSON` のパース中、ClickHouse は各 JSON パスに対して最も適切なデータ型を推定しようとします。
これは [入力データからの自動スキーマ推論](/interfaces/schema-inference.md) と同様に動作し、
同じ設定によって制御されます：

* [input&#95;format&#95;try&#95;infer&#95;dates](/operations/settings/formats#input_format_try_infer_dates)
* [input&#95;format&#95;try&#95;infer&#95;datetimes](/operations/settings/formats#input_format_try_infer_datetimes)
* [schema&#95;inference&#95;make&#95;columns&#95;nullable](/operations/settings/formats#schema_inference_make_columns_nullable)
* [input&#95;format&#95;json&#95;try&#95;infer&#95;numbers&#95;from&#95;strings](/operations/settings/formats#input_format_json_try_infer_numbers_from_strings)
* [input&#95;format&#95;json&#95;infer&#95;incomplete&#95;types&#95;as&#95;strings](/operations/settings/formats#input_format_json_infer_incomplete_types_as_strings)
* [input&#95;format&#95;json&#95;read&#95;numbers&#95;as&#95;strings](/operations/settings/formats#input_format_json_read_numbers_as_strings)
* [input&#95;format&#95;json&#95;read&#95;bools&#95;as&#95;strings](/operations/settings/formats#input_format_json_read_bools_as_strings)
* [input&#95;format&#95;json&#95;read&#95;bools&#95;as&#95;numbers](/operations/settings/formats#input_format_json_read_bools_as_numbers)
* [input&#95;format&#95;json&#95;read&#95;arrays&#95;as&#95;strings](/operations/settings/formats#input_format_json_read_arrays_as_strings)
* [input&#95;format&#95;json&#95;infer&#95;array&#95;of&#95;dynamic&#95;from&#95;array&#95;of&#95;different&#95;types](/operations/settings/formats#input_format_json_infer_array_of_dynamic_from_array_of_different_types)

いくつかの例を見てみましょう。

```sql title="Query"
SELECT JSONAllPathsWithTypes('{"a" : "2020-01-01", "b" : "2020-01-01 10:00:00"}'::JSON) AS paths_with_types settings input_format_try_infer_dates=1, input_format_try_infer_datetimes=1;
```

```text title="Response"
┌─paths_with_types─────────────────┐
│ {'a':'Date','b':'DateTime64(9)'} │
└──────────────────────────────────┘
```

```sql title="Query"
SELECT JSONAllPathsWithTypes('{"a" : "2020-01-01", "b" : "2020-01-01 10:00:00"}'::JSON) AS paths_with_types settings input_format_try_infer_dates=0, input_format_try_infer_datetimes=0;
```

```text title="Response"
┌─paths_with_types────────────┐
│ {'a':'String','b':'String'} │
└─────────────────────────────┘
```

```sql title="Query"
SELECT JSONAllPathsWithTypes('{"a" : [1, 2, 3]}'::JSON) AS paths_with_types settings schema_inference_make_columns_nullable=1;
```

```text title="Response"
┌─paths_with_types───────────────┐
│ {'a':'Array(Nullable(Int64))'} │
└────────────────────────────────┘
```

```sql title="Query"
SELECT JSONAllPathsWithTypes('{"a" : [1, 2, 3]}'::JSON) AS paths_with_types settings schema_inference_make_columns_nullable=0;
```

```text title="Response"
┌─paths_with_types─────┐
│ {'a':'Array(Int64)'} │
└──────────────────────┘
```

## JSON オブジェクト配列の扱い方 {#handling-arrays-of-json-objects}

JSON オブジェクトの配列を含む JSON パスは、型 `Array(JSON)` として解釈され、そのパスに対応する `Dynamic` 列に挿入されます。
オブジェクト配列を読み取るには、`Dynamic` 列からサブカラムとして抽出します。

```sql title="Query"
CREATE TABLE test (json JSON) ENGINE = Memory;
INSERT INTO test VALUES
('{"a" : {"b" : [{"c" : 42, "d" : "Hello", "f" : [[{"g" : 42.42}]], "k" : {"j" : 1000}}, {"c" : 43}, {"e" : [1, 2, 3], "d" : "My", "f" : [[{"g" : 43.43, "h" : "2020-01-01"}]],  "k" : {"j" : 2000}}]}}'),
('{"a" : {"b" : [1, 2, 3]}}'),
('{"a" : {"b" : [{"c" : 44, "f" : [[{"h" : "2020-01-02"}]]}, {"e" : [4, 5, 6], "d" : "World", "f" : [[{"g" : 44.44}]],  "k" : {"j" : 3000}}]}}');
SELECT json FROM test;
```

```text title="Response"
┌─json────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ {"a":{"b":[{"c":"42","d":"Hello","f":[[{"g":42.42}]],"k":{"j":"1000"}},{"c":"43"},{"d":"My","e":["1","2","3"],"f":[[{"g":43.43,"h":"2020-01-01"}]],"k":{"j":"2000"}}]}} │
│ {"a":{"b":["1","2","3"]}}                                                                                                                                               │
│ {"a":{"b":[{"c":"44","f":[[{"h":"2020-01-02"}]]},{"d":"World","e":["4","5","6"],"f":[[{"g":44.44}]],"k":{"j":"3000"}}]}}                                                │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

```sql title="Query"
SELECT json.a.b, dynamicType(json.a.b) FROM test;
```

```text title="Response"
┌─json.a.b──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬─dynamicType(json.a.b)────────────────────────────────────┐
│ ['{"c":"42","d":"Hello","f":[[{"g":42.42}]],"k":{"j":"1000"}}','{"c":"43"}','{"d":"My","e":["1","2","3"],"f":[[{"g":43.43,"h":"2020-01-01"}]],"k":{"j":"2000"}}'] │ Array(JSON(max_dynamic_types=16, max_dynamic_paths=256)) │
│ [1,2,3]                                                                                                                                                           │ Array(Nullable(Int64))                                   │
│ ['{"c":"44","f":[[{"h":"2020-01-02"}]]}','{"d":"World","e":["4","5","6"],"f":[[{"g":44.44}]],"k":{"j":"3000"}}']                                                  │ Array(JSON(max_dynamic_types=16, max_dynamic_paths=256)) │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────────────────────────────────────────────────┘
```

ご覧のとおり、ネストされた `JSON` 型の `max_dynamic_types` と `max_dynamic_paths` パラメータは、デフォルト値よりも小さい値に減らされています。
これは、JSON オブジェクトの配列が入れ子になっている場合に、サブカラムの数が際限なく増加するのを防ぐために必要です。

ネストされた `JSON` カラムからサブカラムを読み取ってみましょう。

```sql title="Query"
SELECT json.a.b.:`Array(JSON)`.c, json.a.b.:`Array(JSON)`.f, json.a.b.:`Array(JSON)`.d FROM test; 
```

```text title="Response"
┌─json.a.b.:`Array(JSON)`.c─┬─json.a.b.:`Array(JSON)`.f───────────────────────────────────┬─json.a.b.:`Array(JSON)`.d─┐
│ [42,43,NULL]              │ [[['{"g":42.42}']],NULL,[['{"g":43.43,"h":"2020-01-01"}']]] │ ['Hello',NULL,'My']       │
│ []                        │ []                                                          │ []                        │
│ [44,NULL]                 │ [[['{"h":"2020-01-02"}']],[['{"g":44.44}']]]                │ [NULL,'World']            │
└───────────────────────────┴─────────────────────────────────────────────────────────────┴───────────────────────────┘
```

特別な構文を使うことで、`Array(JSON)` サブカラムの名前を記述せずに済みます。

```sql title="Query"
SELECT json.a.b[].c, json.a.b[].f, json.a.b[].d FROM test;
```

```text title="Response"
┌─json.a.b.:`Array(JSON)`.c─┬─json.a.b.:`Array(JSON)`.f───────────────────────────────────┬─json.a.b.:`Array(JSON)`.d─┐
│ [42,43,NULL]              │ [[['{"g":42.42}']],NULL,[['{"g":43.43,"h":"2020-01-01"}']]] │ ['Hello',NULL,'My']       │
│ []                        │ []                                                          │ []                        │
│ [44,NULL]                 │ [[['{"h":"2020-01-02"}']],[['{"g":44.44}']]]                │ [NULL,'World']            │
└───────────────────────────┴─────────────────────────────────────────────────────────────┴───────────────────────────┘
```

パスの後に続く `[]` の数は配列のネストレベルを示します。例えば、`json.path[][]` は `json.path.:Array(Array(JSON))` に変換されます。

`Array(JSON)` 内のパスと型を確認してみましょう。

```sql title="Query"
SELECT DISTINCT arrayJoin(JSONAllPathsWithTypes(arrayJoin(json.a.b[]))) FROM test;
```

```text title="Response"
┌─arrayJoin(JSONAllPathsWithTypes(arrayJoin(json.a.b.:`Array(JSON)`)))──┐
│ ('c','Int64')                                                         │
│ ('d','String')                                                        │
│ ('f','Array(Array(JSON(max_dynamic_types=8, max_dynamic_paths=64)))') │
│ ('k.j','Int64')                                                       │
│ ('e','Array(Nullable(Int64))')                                        │
└───────────────────────────────────────────────────────────────────────┘
```

`Array(JSON)` 型の列からサブカラムを読み取ってみましょう：

```sql title="Query"
SELECT json.a.b[].c.:Int64, json.a.b[].f[][].g.:Float64, json.a.b[].f[][].h.:Date FROM test;
```

```text title="Response"
┌─json.a.b.:`Array(JSON)`.c.:`Int64`─┬─json.a.b.:`Array(JSON)`.f.:`Array(Array(JSON))`.g.:`Float64`─┬─json.a.b.:`Array(JSON)`.f.:`Array(Array(JSON))`.h.:`Date`─┐
│ [42,43,NULL]                       │ [[[42.42]],[],[[43.43]]]                                     │ [[[NULL]],[],[['2020-01-01']]]                            │
│ []                                 │ []                                                           │ []                                                        │
│ [44,NULL]                          │ [[[NULL]],[[44.44]]]                                         │ [[['2020-01-02']],[[NULL]]]                               │
└────────────────────────────────────┴──────────────────────────────────────────────────────────────┴───────────────────────────────────────────────────────────┘
```

ネストされた `JSON` カラムからサブオブジェクト内のサブカラムを読み取ることもできます。

```sql title="Query"
SELECT json.a.b[].^k FROM test
```

```text title="Response"
┌─json.a.b.:`Array(JSON)`.^`k`─────────┐
│ ['{"j":"1000"}','{}','{"j":"2000"}'] │
│ []                                   │
│ ['{}','{"j":"3000"}']                │
└──────────────────────────────────────┘
```

## NULL を含む JSON キーの扱い {#handling-json-keys-with-nulls}

本製品の JSON 実装では、`null` と値が存在しない状態は同等と見なされます。

```sql title="Query"
SELECT '{}'::JSON AS json1, '{"a" : null}'::JSON AS json2, json1 = json2
```

```text title="Response"
┌─json1─┬─json2─┬─equals(json1, json2)─┐
│ {}    │ {}    │                    1 │
└───────┴───────┴──────────────────────┘
```

これは、元の JSON データに NULL 値を持つパスが含まれていたのか、それともそのようなパスがそもそも含まれていなかったのかを判定することが不可能であることを意味します。

## ドットを含む JSON キーの扱い {#handling-json-keys-with-dots}

内部的に、JSON カラムではすべてのパスと値がフラットな形式で保存されます。つまり、デフォルトでは次の 2 つのオブジェクトは同一のものとして扱われます。

```json
{"a" : {"b" : 42}}
{"a.b" : 42}
```

どちらも内部的には、パス `a.b` と値 `42` の組として保存されます。JSON を整形する際には、ドットで区切られたパスの各要素に基づいて、常に入れ子のオブジェクトを構築します。

```sql title="Query"
SELECT '{"a" : {"b" : 42}}'::JSON AS json1, '{"a.b" : 42}'::JSON AS json2, JSONAllPaths(json1), JSONAllPaths(json2);
```

```text title="Response"
┌─json1────────────┬─json2────────────┬─JSONAllPaths(json1)─┬─JSONAllPaths(json2)─┐
│ {"a":{"b":"42"}} │ {"a":{"b":"42"}} │ ['a.b']             │ ['a.b']             │
└──────────────────┴──────────────────┴─────────────────────┴─────────────────────┘
```

ご覧のとおり、元の JSON `{"a.b" : 42}` は、`{"a" : {"b" : 42}}` のような形式に変換されています。

この制約により、次のような有効な JSON オブジェクトも正しく解析できません。

```sql title="Query"
SELECT '{"a.b" : 42, "a" : {"b" : "Hello World!"}}'::JSON AS json;
```

```text title="Response"
Code: 117. DB::Exception: Cannot insert data into JSON column: Duplicate path found during parsing JSON object: a.b. You can enable setting type_json_skip_duplicated_paths to skip duplicated paths during insert: In scope SELECT CAST('{"a.b" : 42, "a" : {"b" : "Hello, World"}}', 'JSON') AS json. (INCORRECT_DATA)
```

ドットを含むキーをそのまま保持し、それらをネストされたオブジェクトとして解釈させたくない場合は、`25.8` バージョン以降で利用可能な設定 [json&#95;type&#95;escape&#95;dots&#95;in&#95;keys](/operations/settings/formats#json_type_escape_dots_in_keys) を有効にしてください。この場合、パース時に JSON キー内のすべてのドットは `%2E` にエスケープされ、フォーマット時に元に戻されます。

```sql title="Query"
SET json_type_escape_dots_in_keys=1;
SELECT '{"a" : {"b" : 42}}'::JSON AS json1, '{"a.b" : 42}'::JSON AS json2, JSONAllPaths(json1), JSONAllPaths(json2);
```

```text title="Response"
┌─json1────────────┬─json2────────┬─JSONAllPaths(json1)─┬─JSONAllPaths(json2)─┐
│ {"a":{"b":"42"}} │ {"a.b":"42"} │ ['a.b']             │ ['a%2Eb']           │
└──────────────────┴──────────────┴─────────────────────┴─────────────────────┘
```

```sql title="Query"
SET json_type_escape_dots_in_keys=1;
SELECT '{"a.b" : 42, "a" : {"b" : "Hello World!"}}'::JSON AS json, JSONAllPaths(json);
```

```text title="Response"
┌─json──────────────────────────────────┬─JSONAllPaths(json)─┐
│ {"a.b":"42","a":{"b":"Hello World!"}} │ ['a%2Eb','a.b']    │
└───────────────────────────────────────┴────────────────────┘
```

エスケープされたドットを含むキーをサブカラムとして読み取るには、サブカラム名にもエスケープされたドットを使用する必要があります。

```sql title="Query"
SET json_type_escape_dots_in_keys=1;
SELECT '{"a.b" : 42, "a" : {"b" : "Hello World!"}}'::JSON AS json, json.`a%2Eb`, json.a.b;
```

```text title="Response"
┌─json──────────────────────────────────┬─json.a%2Eb─┬─json.a.b─────┐
│ {"a.b":"42","a":{"b":"Hello World!"}} │ 42         │ Hello World! │
└───────────────────────────────────────┴────────────┴──────────────┘
```

注意: 識別子パーサーおよびアナライザーの制限により、サブカラム `` json.`a.b` `` はサブカラム `json.a.b` と同等とみなされ、エスケープされたドットを含むパスとしては解釈されません:

```sql title="Query"
SET json_type_escape_dots_in_keys=1;
SELECT '{"a.b" : 42, "a" : {"b" : "Hello World!"}}'::JSON AS json, json.`a%2Eb`, json.`a.b`, json.a.b;
```

```text title="Response"
┌─json──────────────────────────────────┬─json.a%2Eb─┬─json.a.b─────┬─json.a.b─────┐
│ {"a.b":"42","a":{"b":"Hello World!"}} │ 42         │ Hello World! │ Hello World! │
└───────────────────────────────────────┴────────────┴──────────────┴──────────────┘
```

また、キー名にドットを含む JSON パスに対してヒントを指定する場合（あるいはそれを `SKIP` / `SKIP REGEX` セクションで使用する場合）は、ヒント内ではドットをエスケープして記述する必要があります。

```sql title="Query"
SET json_type_escape_dots_in_keys=1;
SELECT '{"a.b" : 42, "a" : {"b" : "Hello World!"}}'::JSON(`a%2Eb` UInt8) as json, json.`a%2Eb`, toTypeName(json.`a%2Eb`);
```

```text title="Response"
┌─json────────────────────────────────┬─json.a%2Eb─┬─toTypeName(json.a%2Eb)─┐
│ {"a.b":42,"a":{"b":"Hello World!"}} │         42 │ UInt8                  │
└─────────────────────────────────────┴────────────┴────────────────────────┘
```

```sql title="Query"
SET json_type_escape_dots_in_keys=1;
SELECT '{"a.b" : 42, "a" : {"b" : "Hello World!"}}'::JSON(SKIP `a%2Eb`) as json, json.`a%2Eb`;
```

```text title="Response"
┌─json───────────────────────┬─json.a%2Eb─┐
│ {"a":{"b":"Hello World!"}} │ ᴺᵁᴸᴸ       │
└────────────────────────────┴────────────┘
```

## データから JSON 型を読み込む {#reading-json-type-from-data}

すべてのテキストフォーマット
([`JSONEachRow`](/interfaces/formats/JSONEachRow),
[`TSV`](/interfaces/formats/TabSeparated),
[`CSV`](/interfaces/formats/CSV),
[`CustomSeparated`](/interfaces/formats/CustomSeparated),
[`Values`](/interfaces/formats/Values) など) は、`JSON` 型のデータの読み取りをサポートしています。

例:

```sql title="Query"
SELECT json FROM format(JSONEachRow, 'json JSON(a.b.c UInt32, SKIP a.b.d, SKIP d.e, SKIP REGEXP \'b.*\')', '
{"json" : {"a" : {"b" : {"c" : 1, "d" : [0, 1]}}, "b" : "2020-01-01", "c" : 42, "d" : {"e" : {"f" : ["s1", "s2"]}, "i" : [1, 2, 3]}}}
{"json" : {"a" : {"b" : {"c" : 2, "d" : [2, 3]}}, "b" : [1, 2, 3], "c" : null, "d" : {"e" : {"g" : 43}, "i" : [4, 5, 6]}}}
{"json" : {"a" : {"b" : {"c" : 3, "d" : [4, 5]}}, "b" : {"c" : 10}, "e" : "Hello, World!"}}
{"json" : {"a" : {"b" : {"c" : 4, "d" : [6, 7]}}, "c" : 43}}
{"json" : {"a" : {"b" : {"c" : 5, "d" : [8, 9]}}, "b" : {"c" : 11, "j" : [1, 2, 3]}, "d" : {"e" : {"f" : ["s3", "s4"], "g" : 44}, "h" : "2020-02-02 10:00:00"}}}
')
```

```text title="Response"
┌─json──────────────────────────────────────────────────────────┐
│ {"a":{"b":{"c":1}},"c":"42","d":{"i":["1","2","3"]}}          │
│ {"a":{"b":{"c":2}},"d":{"i":["4","5","6"]}}                   │
│ {"a":{"b":{"c":3}},"e":"Hello, World!"}                       │
│ {"a":{"b":{"c":4}},"c":"43"}                                  │
│ {"a":{"b":{"c":5}},"d":{"h":"2020-02-02 10:00:00.000000000"}} │
└───────────────────────────────────────────────────────────────┘
```

`CSV` や `TSV` などのテキスト形式では、`JSON` は JSON オブジェクトを含む文字列から解析されます。

```sql title="Query"
SELECT json FROM format(TSV, 'json JSON(a.b.c UInt32, SKIP a.b.d, SKIP REGEXP \'b.*\')',
'{"a" : {"b" : {"c" : 1, "d" : [0, 1]}}, "b" : "2020-01-01", "c" : 42, "d" : {"e" : {"f" : ["s1", "s2"]}, "i" : [1, 2, 3]}}
{"a" : {"b" : {"c" : 2, "d" : [2, 3]}}, "b" : [1, 2, 3], "c" : null, "d" : {"e" : {"g" : 43}, "i" : [4, 5, 6]}}
{"a" : {"b" : {"c" : 3, "d" : [4, 5]}}, "b" : {"c" : 10}, "e" : "Hello, World!"}
{"a" : {"b" : {"c" : 4, "d" : [6, 7]}}, "c" : 43}
{"a" : {"b" : {"c" : 5, "d" : [8, 9]}}, "b" : {"c" : 11, "j" : [1, 2, 3]}, "d" : {"e" : {"f" : ["s3", "s4"], "g" : 44}, "h" : "2020-02-02 10:00:00"}}')
```

```text title="Response"
┌─json──────────────────────────────────────────────────────────┐
│ {"a":{"b":{"c":1}},"c":"42","d":{"i":["1","2","3"]}}          │
│ {"a":{"b":{"c":2}},"d":{"i":["4","5","6"]}}                   │
│ {"a":{"b":{"c":3}},"e":"Hello, World!"}                       │
│ {"a":{"b":{"c":4}},"c":"43"}                                  │
│ {"a":{"b":{"c":5}},"d":{"h":"2020-02-02 10:00:00.000000000"}} │
└───────────────────────────────────────────────────────────────┘
```

## JSON 内部の動的パス数の上限に到達する場合 {#reaching-the-limit-of-dynamic-paths-inside-json}

`JSON` データ型は、内部的にサブカラムとして保持できるパスの数に上限があります。
デフォルトではこの上限は `1024` ですが、型宣言時にパラメータ `max_dynamic_paths` を指定して変更できます。

上限に到達すると、その後に `JSON` カラムへ挿入される新しいパスは、1 つの共有データ構造に格納されます。
そのようなパスも引き続きサブカラムとして読み取ることは可能ですが、
効率は低下する可能性があります（[共有データに関するセクション](#shared-data-structure) を参照）。
この上限は、テーブルが使用不能になるほど膨大な数のサブカラムが作成されるのを防ぐために必要です。

いくつかのシナリオで、この上限に到達した場合に何が起こるかを見ていきます。

### データのパース中に上限へ到達する場合 {#reaching-the-limit-during-data-parsing}

データから `JSON` オブジェクトをパースしている際に、現在のデータブロックで上限に達した場合、
それ以降のすべての新しいパスは共有データ構造に格納されます。次の 2 つのイントロスペクション関数 `JSONDynamicPaths`、`JSONSharedDataPaths` を使用できます。

```sql title="Query"
SELECT json, JSONDynamicPaths(json), JSONSharedDataPaths(json) FROM format(JSONEachRow, 'json JSON(max_dynamic_paths=3)', '
{"json" : {"a" : {"b" : 42}, "c" : [1, 2, 3]}}
{"json" : {"a" : {"b" : 43}, "d" : "2020-01-01"}}
{"json" : {"a" : {"b" : 44}, "c" : [4, 5, 6]}}
{"json" : {"a" : {"b" : 43}, "d" : "2020-01-02", "e" : "Hello", "f" : {"g" : 42.42}}}
{"json" : {"a" : {"b" : 43}, "c" : [7, 8, 9], "f" : {"g" : 43.43}, "h" : "World"}}
')
```

```text title="Response"
┌─json───────────────────────────────────────────────────────────┬─JSONDynamicPaths(json)─┬─JSONSharedDataPaths(json)─┐
│ {"a":{"b":"42"},"c":["1","2","3"]}                             │ ['a.b','c','d']        │ []                        │
│ {"a":{"b":"43"},"d":"2020-01-01"}                              │ ['a.b','c','d']        │ []                        │
│ {"a":{"b":"44"},"c":["4","5","6"]}                             │ ['a.b','c','d']        │ []                        │
│ {"a":{"b":"43"},"d":"2020-01-02","e":"Hello","f":{"g":42.42}}  │ ['a.b','c','d']        │ ['e','f.g']               │
│ {"a":{"b":"43"},"c":["7","8","9"],"f":{"g":43.43},"h":"World"} │ ['a.b','c','d']        │ ['f.g','h']               │
└────────────────────────────────────────────────────────────────┴────────────────────────┴───────────────────────────┘
```

ご覧のとおり、パス `e` と `f.g` を挿入した後に上限に達し、
それらは共有データ構造に格納されました。

### MergeTree テーブルエンジンにおけるデータパーツのマージ中 {#during-merges-of-data-parts-in-mergetree-table-engines}

`MergeTree` テーブルで複数のデータパーツをマージする際、結果として得られるデータパーツ内の `JSON` 列が動的パスの上限に達し、
元のパーツに含まれるすべてのパスをサブカラムとして保持できなくなる場合があります。
この場合、ClickHouse はマージ後もサブカラムとして残すパスと、
共有データ構造に格納するパスを選択します。
多くの場合、ClickHouse は非 NULL 値の数が最も多いパスを保持し、
出現頻度の低いパスを共有データ構造に移動しようとします。
ただし、これは実装に依存します。

このようなマージの例を見てみましょう。
まず、`JSON` 列を持つテーブルを作成し、動的パスの上限を `3` に設定してから、
`5` つの異なるパスを持つ値を挿入してみます。

```sql title="Query"
CREATE TABLE test (id UInt64, json JSON(max_dynamic_paths=3)) ENGINE=MergeTree ORDER BY id;
SYSTEM STOP MERGES test;
INSERT INTO test SELECT number, formatRow('JSONEachRow', number as a) FROM numbers(5);
INSERT INTO test SELECT number, formatRow('JSONEachRow', number as b) FROM numbers(4);
INSERT INTO test SELECT number, formatRow('JSONEachRow', number as c) FROM numbers(3);
INSERT INTO test SELECT number, formatRow('JSONEachRow', number as d) FROM numbers(2);
INSERT INTO test SELECT number, formatRow('JSONEachRow', number as e) FROM numbers(1);
```

各 `INSERT` は、1 つのパスのみを含む `JSON` 列を持つ、別個のデータパーツを作成します。

```sql title="Query"
SELECT
    count(),
    groupArrayArrayDistinct(JSONDynamicPaths(json)) AS dynamic_paths,
    groupArrayArrayDistinct(JSONSharedDataPaths(json)) AS shared_data_paths,
    _part
FROM test
GROUP BY _part
ORDER BY _part ASC
```

```text title="Response"
┌─count()─┬─dynamic_paths─┬─shared_data_paths─┬─_part─────┐
│       5 │ ['a']         │ []                │ all_1_1_0 │
│       4 │ ['b']         │ []                │ all_2_2_0 │
│       3 │ ['c']         │ []                │ all_3_3_0 │
│       2 │ ['d']         │ []                │ all_4_4_0 │
│       1 │ ['e']         │ []                │ all_5_5_0 │
└─────────┴───────────────┴───────────────────┴───────────┘
```

では、すべてのパーツをひとつにまとめて、どうなるか確認してみましょう。

```sql title="Query"
SELECT
    count(),
    groupArrayArrayDistinct(JSONDynamicPaths(json)) AS dynamic_paths,
    groupArrayArrayDistinct(JSONSharedDataPaths(json)) AS shared_data_paths,
    _part
FROM test
GROUP BY _part
ORDER BY _part ASC
```

```text title="Response"
┌─count()─┬─dynamic_paths─┬─shared_data_paths─┬─_part─────┐
│      15 │ ['a','b','c'] │ ['d','e']         │ all_1_5_2 │
└─────────┴───────────────┴───────────────────┴───────────┘
```

ご覧のとおり、ClickHouse は最も頻出するパスである `a`、`b`、`c` を保持し、パス `d` と `e` を共有のデータ構造に移しました。

## 共有データ構造 {#shared-data-structure}

前のセクションで説明したように、`max_dynamic_paths` の制限に達すると、すべての新しいパスは 1 つの共有データ構造に保存されます。
このセクションでは、その共有データ構造の詳細と、そこからパスのサブカラムをどのように読み取るかを見ていきます。

JSON カラムの内容を調査するために使用される関数の詳細については、「["introspection functions"](/sql-reference/data-types/newjson#introspection-functions)」セクションを参照してください。

### メモリ上の共有データ構造 {#shared-data-structure-in-memory}

メモリ上では、共有データ構造は単に `Map(String, String)` 型のサブカラムであり、フラット化された JSON パスからバイナリエンコードされた値へのマッピングを保持します。
そこから特定のパスのサブカラムを抽出するには、この `Map` カラムのすべての行を走査し、要求されたパスとその値を探します。

### MergeTree パーツ内の共有データ構造 {#shared-data-structure-in-merge-tree-parts}

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルでは、ローカルまたはリモートのディスク上にあるすべてのデータを格納するデータパーツにデータを保存します。ディスク上のデータは、メモリとは異なる方式で保存される場合があります。
現在、MergeTree のデータパーツには 3 種類の共有データ構造シリアライゼーションがあります: `map`、`map_with_buckets`、
および `advanced` です。

シリアライゼーションのバージョンは MergeTree の
設定 [object_shared_data_serialization_version](../../operations/settings/merge-tree-settings.md#object_shared_data_serialization_version)
と [object_shared_data_serialization_version_for_zero_level_parts](../../operations/settings/merge-tree-settings.md#object_shared_data_serialization_version_for_zero_level_parts) 
によって制御されます（ゼロレベルパーツはテーブルへのデータ挿入時に作成されるパーツであり、マージ中に作成されるパーツはより高いレベルを持ちます）。

注記: 共有データ構造のシリアライゼーションの変更がサポートされるのは、
`v3` の [object serialization version](../../operations/settings/merge-tree-settings.md#object_serialization_version) の場合のみです。

#### Map {#shared-data-map}

`map` シリアライゼーションバージョンでは、共有データはメモリ上と同様に、`Map(String, String)` 型の単一カラムとしてシリアライズされます。
この形式のシリアライゼーションからパスのサブカラムを読み取るために、ClickHouse は `Map` カラム全体を読み込み、
メモリ上で要求されたパスを抽出します。

このシリアライゼーションはデータの書き込みや `JSON` カラム全体の読み取りには効率的ですが、パスのサブカラムの読み取りには効率的ではありません。

#### Map with buckets {#shared-data-map-with-buckets} 

`map_with_buckets` シリアライゼーションバージョンでは、共有データは `Map(String, String)` 型の `N` 個のカラム（「バケット」）としてシリアライズされます。
各バケットにはパスのサブセットのみが含まれます。この形式のシリアライゼーションからパスのサブカラムを読み取るために、ClickHouse は
単一のバケットから `Map` カラム全体を読み込み、メモリ上で要求されたパスを抽出します。

このシリアライゼーションはデータの書き込みや `JSON` カラム全体の読み取りについては効率が低くなりますが、必要なバケットからのみデータを読み取るため、
パスのサブカラムの読み取りにはより効率的です。

バケット数 `N` は、MergeTree 設定 [object_shared_data_buckets_for_compact_part](
../../operations/settings/merge-tree-settings.md#object_shared_data_buckets_for_compact_part)（デフォルト 8）
および [object_shared_data_buckets_for_wide_part](
../../operations/settings/merge-tree-settings.md#object_shared_data_buckets_for_wide_part)（デフォルト 32）によって制御されます。

#### Advanced {#shared-data-advanced}

`advanced` シリアライゼーションバージョンでは、共有データはパスのサブカラムの読み取り性能を最大化するための特殊なデータ構造としてシリアライズされます。このデータ構造では、要求されたパスのデータのみを読み取れるようにする追加情報を保持します。
このシリアライゼーションもバケットをサポートしており、各バケットにはパスのサブセットのみが含まれます。

このシリアライゼーションはデータの書き込みにはかなり非効率的であるため（ゼロレベルパーツでこのシリアライゼーションを使用することは推奨されません）、`JSON` カラム全体の読み取りは `map` シリアライゼーションと比較してわずかに効率が低下しますが、パスのサブカラムの読み取りには非常に効率的です。

注記: データ構造内部に追加情報を保存するため、このシリアライゼーションでは `map` および `map_with_buckets` シリアライゼーションと比較してディスクのストレージサイズが大きくなります。

新しい共有データシリアライゼーションのより詳細な概要と実装の詳細については、[ブログ記事](https://clickhouse.com/blog/json-data-type-gets-even-better) を参照してください。

## イントロスペクション関数 {#introspection-functions}

JSON 列の内容を調査するのに役立つ関数がいくつかあります：

* [`JSONAllPaths`](../functions/json-functions.md#JSONAllPaths)
* [`JSONAllPathsWithTypes`](../functions/json-functions.md#JSONAllPathsWithTypes)
* [`JSONDynamicPaths`](../functions/json-functions.md#JSONDynamicPaths)
* [`JSONDynamicPathsWithTypes`](../functions/json-functions.md#JSONDynamicPathsWithTypes)
* [`JSONSharedDataPaths`](../functions/json-functions.md#JSONSharedDataPaths)
* [`JSONSharedDataPathsWithTypes`](../functions/json-functions.md#JSONSharedDataPathsWithTypes)
* [`distinctDynamicTypes`](../aggregate-functions/reference/distinctdynamictypes.md)
* [`distinctJSONPaths and distinctJSONPathsAndTypes`](../aggregate-functions/reference/distinctjsonpaths.md)

**例**

`2020-01-01` の [GH Archive](https://www.gharchive.org/) データセットの内容を調査してみましょう。

```sql title="Query"
SELECT arrayJoin(distinctJSONPaths(json))
FROM s3('s3://clickhouse-public-datasets/gharchive/original/2020-01-01-*.json.gz', JSONAsObject) 
```

```text title="Response"
┌─arrayJoin(distinctJSONPaths(json))─────────────────────────┐
│ actor.avatar_url                                           │
│ actor.display_login                                        │
│ actor.gravatar_id                                          │
│ actor.id                                                   │
│ actor.login                                                │
│ actor.url                                                  │
│ created_at                                                 │
│ id                                                         │
│ org.avatar_url                                             │
│ org.gravatar_id                                            │
│ org.id                                                     │
│ org.login                                                  │
│ org.url                                                    │
│ payload.action                                             │
│ payload.before                                             │
│ payload.comment._links.html.href                           │
│ payload.comment._links.pull_request.href                   │
│ payload.comment._links.self.href                           │
│ payload.comment.author_association                         │
│ payload.comment.body                                       │
│ payload.comment.commit_id                                  │
│ payload.comment.created_at                                 │
│ payload.comment.diff_hunk                                  │
│ payload.comment.html_url                                   │
│ payload.comment.id                                         │
│ payload.comment.in_reply_to_id                             │
│ payload.comment.issue_url                                  │
│ payload.comment.line                                       │
│ payload.comment.node_id                                    │
│ payload.comment.original_commit_id                         │
│ payload.comment.original_position                          │
│ payload.comment.path                                       │
│ payload.comment.position                                   │
│ payload.comment.pull_request_review_id                     │
...
│ payload.release.node_id                                    │
│ payload.release.prerelease                                 │
│ payload.release.published_at                               │
│ payload.release.tag_name                                   │
│ payload.release.tarball_url                                │
│ payload.release.target_commitish                           │
│ payload.release.upload_url                                 │
│ payload.release.url                                        │
│ payload.release.zipball_url                                │
│ payload.size                                               │
│ public                                                     │
│ repo.id                                                    │
│ repo.name                                                  │
│ repo.url                                                   │
│ type                                                       │
└─arrayJoin(distinctJSONPaths(json))─────────────────────────┘
```

```sql
SELECT arrayJoin(distinctJSONPathsAndTypes(json))
FROM s3('s3://clickhouse-public-datasets/gharchive/original/2020-01-01-*.json.gz', JSONAsObject)
SETTINGS date_time_input_format = 'best_effort'
```

```text
┌─arrayJoin(distinctJSONPathsAndTypes(json))──────────────────┐
│ ('actor.avatar_url',['String'])                             │
│ ('actor.display_login',['String'])                          │
│ ('actor.gravatar_id',['String'])                            │
│ ('actor.id',['Int64'])                                      │
│ ('actor.login',['String'])                                  │
│ ('actor.url',['String'])                                    │
│ ('created_at',['DateTime'])                                 │
│ ('id',['String'])                                           │
│ ('org.avatar_url',['String'])                               │
│ ('org.gravatar_id',['String'])                              │
│ ('org.id',['Int64'])                                        │
│ ('org.login',['String'])                                    │
│ ('org.url',['String'])                                      │
│ ('payload.action',['String'])                               │
│ ('payload.before',['String'])                               │
│ ('payload.comment._links.html.href',['String'])             │
│ ('payload.comment._links.pull_request.href',['String'])     │
│ ('payload.comment._links.self.href',['String'])             │
│ ('payload.comment.author_association',['String'])           │
│ ('payload.comment.body',['String'])                         │
│ ('payload.comment.commit_id',['String'])                    │
│ ('payload.comment.created_at',['DateTime'])                 │
│ ('payload.comment.diff_hunk',['String'])                    │
│ ('payload.comment.html_url',['String'])                     │
│ ('payload.comment.id',['Int64'])                            │
│ ('payload.comment.in_reply_to_id',['Int64'])                │
│ ('payload.comment.issue_url',['String'])                    │
│ ('payload.comment.line',['Int64'])                          │
│ ('payload.comment.node_id',['String'])                      │
│ ('payload.comment.original_commit_id',['String'])           │
│ ('payload.comment.original_position',['Int64'])             │
│ ('payload.comment.path',['String'])                         │
│ ('payload.comment.position',['Int64'])                      │
│ ('payload.comment.pull_request_review_id',['Int64'])        │
...
│ ('payload.release.node_id',['String'])                      │
│ ('payload.release.prerelease',['Bool'])                     │
│ ('payload.release.published_at',['DateTime'])               │
│ ('payload.release.tag_name',['String'])                     │
│ ('payload.release.tarball_url',['String'])                  │
│ ('payload.release.target_commitish',['String'])             │
│ ('payload.release.upload_url',['String'])                   │
│ ('payload.release.url',['String'])                          │
│ ('payload.release.zipball_url',['String'])                  │
│ ('payload.size',['Int64'])                                  │
│ ('public',['Bool'])                                         │
│ ('repo.id',['Int64'])                                       │
│ ('repo.name',['String'])                                    │
│ ('repo.url',['String'])                                     │
│ ('type',['String'])                                         │
└─arrayJoin(distinctJSONPathsAndTypes(json))──────────────────┘
```

## ALTER MODIFY COLUMN で JSON 型に変更する {#alter-modify-column-to-json-type}

既存のテーブルに対して `ALTER` を実行し、列の型を新しい `JSON` 型に変更できます。現時点では、`String` 型からの `ALTER` のみがサポートされています。

**例**

```sql title="Query"
CREATE TABLE test (json String) ENGINE=MergeTree ORDER BY tuple();
INSERT INTO test VALUES ('{"a" : 42}'), ('{"a" : 43, "b" : "Hello"}'), ('{"a" : 44, "b" : [1, 2, 3]}'), ('{"c" : "2020-01-01"}');
ALTER TABLE test MODIFY COLUMN json JSON;
SELECT json, json.a, json.b, json.c FROM test;
```

```text title="Response"
┌─json─────────────────────────┬─json.a─┬─json.b──┬─json.c─────┐
│ {"a":"42"}                   │ 42     │ ᴺᵁᴸᴸ    │ ᴺᵁᴸᴸ       │
│ {"a":"43","b":"Hello"}       │ 43     │ Hello   │ ᴺᵁᴸᴸ       │
│ {"a":"44","b":["1","2","3"]} │ 44     │ [1,2,3] │ ᴺᵁᴸᴸ       │
│ {"c":"2020-01-01"}           │ ᴺᵁᴸᴸ   │ ᴺᵁᴸᴸ    │ 2020-01-01 │
└──────────────────────────────┴────────┴─────────┴────────────┘
```

## JSON 型の値の比較 {#comparison-between-values-of-the-json-type}

JSON オブジェクトは Map 型と同様に比較されます。

例：

```sql title="Query"
CREATE TABLE test (json1 JSON, json2 JSON) ENGINE=Memory;
INSERT INTO test FORMAT JSONEachRow
{"json1" : {}, "json2" : {}}
{"json1" : {"a" : 42}, "json2" : {}}
{"json1" : {"a" : 42}, "json2" : {"a" : 41}}
{"json1" : {"a" : 42}, "json2" : {"a" : 42}}
{"json1" : {"a" : 42}, "json2" : {"a" : [1, 2, 3]}}
{"json1" : {"a" : 42}, "json2" : {"a" : "Hello"}}
{"json1" : {"a" : 42}, "json2" : {"b" : 42}}
{"json1" : {"a" : 42}, "json2" : {"a" : 42, "b" : 42}}
{"json1" : {"a" : 42}, "json2" : {"a" : 41, "b" : 42}}

SELECT json1, json2, json1 < json2, json1 = json2, json1 > json2 FROM test;
```

```text title="Response"
┌─json1──────┬─json2───────────────┬─less(json1, json2)─┬─equals(json1, json2)─┬─greater(json1, json2)─┐
│ {}         │ {}                  │                  0 │                    1 │                     0 │
│ {"a":"42"} │ {}                  │                  0 │                    0 │                     1 │
│ {"a":"42"} │ {"a":"41"}          │                  0 │                    0 │                     1 │
│ {"a":"42"} │ {"a":"42"}          │                  0 │                    1 │                     0 │
│ {"a":"42"} │ {"a":["1","2","3"]} │                  0 │                    0 │                     1 │
│ {"a":"42"} │ {"a":"Hello"}       │                  1 │                    0 │                     0 │
│ {"a":"42"} │ {"b":"42"}          │                  1 │                    0 │                     0 │
│ {"a":"42"} │ {"a":"42","b":"42"} │                  1 │                    0 │                     0 │
│ {"a":"42"} │ {"a":"41","b":"42"} │                  0 │                    0 │                     1 │
└────────────┴─────────────────────┴────────────────────┴──────────────────────┴───────────────────────┘
```

**注:** 2 つのパスに含まれる値のデータ型が異なる場合、それらは `Variant` データ型の[比較ルール](/sql-reference/data-types/variant#comparing-values-of-variant-data)に従って比較されます。

## JSON 型をより効果的に利用するためのヒント {#tips-for-better-usage-of-the-json-type}

`JSON` カラムを作成してデータを読み込む前に、次の点を検討してください。

- データを調査し、可能な限り多くのパスヒントとその型を指定してください。これにより、保存および読み取りがより効率的になります。
- 必要となるパスと、今後も使用しないパスを検討してください。不要なパスは `SKIP` セクションに、必要に応じて `SKIP REGEXP` セクションに指定します。これによりストレージ効率が向上します。
- `max_dynamic_paths` パラメータを過度に大きな値に設定しないでください。保存および読み取りが非効率になる可能性があります。  
  メモリ、CPU などのシステムパラメータに大きく依存しますが、一般的な目安として、ローカルファイルシステムストレージでは `max_dynamic_paths` を 10 000 を超える値に設定せず、リモートファイルシステムストレージでは 1024 を超える値に設定しないことを推奨します。

## 関連ドキュメント {#further-reading}

- [ClickHouse 向けに新しい強力な JSON データ型を構築した方法](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse)
- [10 億件 JSON ドキュメントチャレンジ: ClickHouse、MongoDB、Elasticsearch などの比較](https://clickhouse.com/blog/json-bench-clickhouse-vs-mongodb-elasticsearch-duckdb-postgresql)
