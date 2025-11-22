---
description: 'ClickHouse における JSON データ型に関するドキュメント。JSON データを扱うためのネイティブサポートを提供します'
keywords: ['json', 'データ型']
sidebar_label: 'JSON'
sidebar_position: 63
slug: /sql-reference/data-types/newjson
title: 'JSON データ型'
doc_type: 'reference'
---

import {CardSecondary} from '@clickhouse/click-ui/bundled';
import Link from '@docusaurus/Link'

<Link to="/docs/best-practices/use-json-where-appropriate" style={{display: 'flex', textDecoration: 'none', width: 'fit-content'}}>
  <CardSecondary badgeState="success" badgeText="" description="JSON 型を使用する際の例、高度な機能、利用上の注意点については、JSON のベストプラクティスガイドをご覧ください。" icon="book" infoText="詳細はこちら" infoUrl="/docs/best-practices/use-json-where-appropriate" title="ガイドをお探しですか？" />
</Link>

<br />

`JSON` 型は、JavaScript Object Notation (JSON) ドキュメントを 1 つの列に保存します。

:::note
ClickHouse オープンソース版では、JSON データ型はバージョン 25.3 で本番利用可能 (production ready) としてマークされています。以前のバージョンでこの型を本番環境で使用することは推奨されません。
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

上記の構文中の各パラメータは、次のように定義されます。

| Parameter                   | Description                                                                                                                                                                 | Default Value |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| `max_dynamic_paths`         | 1 つのデータブロック（たとえば MergeTree テーブルの 1 つのデータパーツ）の中で、サブカラムとして個別に保持できるパスの数を指定するオプションのパラメータです。<br /><br />この上限を超えた場合、それ以外のすべてのパスは 1 つの構造体にまとめて格納されます。                              | `1024`        |
| `max_dynamic_types`         | 1 から `255` の範囲で、1 つのデータブロック（たとえば MergeTree テーブルの 1 つのデータパーツ）の中で、`Dynamic` 型の 1 つのパス列に格納できる異なるデータ型の数を指定するオプションのパラメータです。<br /><br />この上限を超えた場合、新しく現れた型はすべて `String` 型に変換されます。 | `32`          |
| `some.path TypeName`        | JSON 内の特定のパスに対するオプションの型ヒントです。このように型ヒントが指定されたパスは、常にその型でサブカラムとして保存されます。                                                                                                       |               |
| `SKIP path.to.skip`         | JSON パース時にスキップすべき特定のパスを指定するオプションのヒントです。これらのパスは JSON 列には一切保存されません。指定したパスがネストされた JSON オブジェクトである場合、そのネストされたオブジェクト全体がスキップされます。                                                  |               |
| `SKIP REGEXP 'path_regexp'` | JSON パース時にスキップするパスを指定するための正規表現を与えるオプションのヒントです。この正規表現にマッチするすべてのパスは、JSON 列には一切保存されません。                                                                                        |               |


## JSONの作成 {#creating-json}

このセクションでは、`JSON`を作成するさまざまな方法を見ていきます。

### テーブルのカラム定義における`JSON`の使用 {#using-json-in-a-table-column-definition}

```sql title="クエリ(例1)"
CREATE TABLE test (json JSON) ENGINE = Memory;
INSERT INTO test VALUES ('{"a" : {"b" : 42}, "c" : [1, 2, 3]}'), ('{"f" : "Hello, World!"}'), ('{"a" : {"b" : 43, "e" : 10}, "c" : [4, 5, 6]}');
SELECT json FROM test;
```

```text title="レスポンス(例1)"
┌─json────────────────────────────────────────┐
│ {"a":{"b":"42"},"c":["1","2","3"]}          │
│ {"f":"Hello, World!"}                       │
│ {"a":{"b":"43","e":"10"},"c":["4","5","6"]} │
└─────────────────────────────────────────────┘
```

```sql title="クエリ(例2)"
CREATE TABLE test (json JSON(a.b UInt32, SKIP a.e)) ENGINE = Memory;
INSERT INTO test VALUES ('{"a" : {"b" : 42}, "c" : [1, 2, 3]}'), ('{"f" : "Hello, World!"}'), ('{"a" : {"b" : 43, "e" : 10}, "c" : [4, 5, 6]}');
SELECT json FROM test;
```

```text title="レスポンス(例2)"
┌─json──────────────────────────────┐
│ {"a":{"b":42},"c":["1","2","3"]}  │
│ {"a":{"b":0},"f":"Hello, World!"} │
│ {"a":{"b":43},"c":["4","5","6"]}  │
└───────────────────────────────────┘
```

### `::JSON`を使用したCASTの利用 {#using-cast-with-json}

特殊な構文`::JSON`を使用して、さまざまな型をキャストすることが可能です。

#### `String`から`JSON`へのCAST {#cast-from-string-to-json}

```sql title="クエリ"
SELECT '{"a" : {"b" : 42},"c" : [1, 2, 3], "d" : "Hello, World!"}'::JSON AS json;
```

```text title="レスポンス"
┌─json───────────────────────────────────────────────────┐
│ {"a":{"b":"42"},"c":["1","2","3"],"d":"Hello, World!"} │
└────────────────────────────────────────────────────────┘
```

#### `Tuple`から`JSON`へのCAST {#cast-from-tuple-to-json}

```sql title="クエリ"
SET enable_named_columns_in_function_tuple = 1;
SELECT (tuple(42 AS b) AS a, [1, 2, 3] AS c, 'Hello, World!' AS d)::JSON AS json;
```

```text title="レスポンス"
┌─json───────────────────────────────────────────────────┐
│ {"a":{"b":"42"},"c":["1","2","3"],"d":"Hello, World!"} │
└────────────────────────────────────────────────────────┘
```

#### `Map`から`JSON`へのCAST {#cast-from-map-to-json}

```sql title="クエリ"
SET use_variant_as_common_type=1;
SELECT map('a', map('b', 42), 'c', [1,2,3], 'd', 'Hello, World!')::JSON AS json;
```

```text title="レスポンス"
┌─json───────────────────────────────────────────────────┐
│ {"a":{"b":"42"},"c":["1","2","3"],"d":"Hello, World!"} │
└────────────────────────────────────────────────────────┘
```

:::note
JSONパスはフラット化されて保存されます。これは、`a.b.c`のようなパスからJSONオブジェクトがフォーマットされる際に、オブジェクトを`{ "a.b.c" : ... }`として構築すべきか、`{ "a": { "b": { "c": ... } } }`として構築すべきかを判断できないことを意味します。
本実装では常に後者を想定します。

例:

```sql
SELECT CAST('{"a.b.c" : 42}', 'JSON') AS json
```

は次を返します:

```response
   ┌─json───────────────────┐
1. │ {"a":{"b":{"c":"42"}}} │
   └────────────────────────┘
```

次のようには**なりません**:


```sql
   ┌─json───────────┐
1. │ {"a.b.c":"42"} │
   └────────────────┘
```

:::


## JSONパスをサブカラムとして読み取る {#reading-json-paths-as-sub-columns}

`JSON`型は、各パスを個別のサブカラムとして読み取ることをサポートしています。
要求されたパスの型がJSON型宣言で指定されていない場合、
そのパスのサブカラムは常に[Dynamic](/sql-reference/data-types/dynamic.md)型となります。

例:

```sql title="クエリ"
CREATE TABLE test (json JSON(a.b UInt32, SKIP a.e)) ENGINE = Memory;
INSERT INTO test VALUES ('{"a" : {"b" : 42, "g" : 42.42}, "c" : [1, 2, 3], "d" : "2020-01-01"}'), ('{"f" : "Hello, World!", "d" : "2020-01-02"}'), ('{"a" : {"b" : 43, "e" : 10, "g" : 43.43}, "c" : [4, 5, 6]}');
SELECT json FROM test;
```

```text title="レスポンス"
┌─json────────────────────────────────────────────────────────┐
│ {"a":{"b":42,"g":42.42},"c":["1","2","3"],"d":"2020-01-01"} │
│ {"a":{"b":0},"d":"2020-01-02","f":"Hello, World!"}          │
│ {"a":{"b":43,"g":43.43},"c":["4","5","6"]}                  │
└─────────────────────────────────────────────────────────────┘
```

```sql title="クエリ(JSONパスをサブカラムとして読み取る)"
SELECT json.a.b, json.a.g, json.c, json.d FROM test;
```

```text title="レスポンス(JSONパスをサブカラムとして読み取る)"
┌─json.a.b─┬─json.a.g─┬─json.c──┬─json.d─────┐
│       42 │ 42.42    │ [1,2,3] │ 2020-01-01 │
│        0 │ ᴺᵁᴸᴸ     │ ᴺᵁᴸᴸ    │ 2020-01-02 │
│       43 │ 43.43    │ [4,5,6] │ ᴺᵁᴸᴸ       │
└──────────┴──────────┴─────────┴────────────┘
```

また、`getSubcolumn`関数を使用してJSON型からサブカラムを読み取ることもできます:

```sql title="クエリ"
SELECT getSubcolumn(json, 'a.b'), getSubcolumn(json, 'a.g'), getSubcolumn(json, 'c'), getSubcolumn(json, 'd') FROM test;
```

```text title="レスポンス"
┌─getSubcolumn(json, 'a.b')─┬─getSubcolumn(json, 'a.g')─┬─getSubcolumn(json, 'c')─┬─getSubcolumn(json, 'd')─┐
│                        42 │ 42.42                     │ [1,2,3]                 │ 2020-01-01              │
│                         0 │ ᴺᵁᴸᴸ                      │ ᴺᵁᴸᴸ                    │ 2020-01-02              │
│                        43 │ 43.43                     │ [4,5,6]                 │ ᴺᵁᴸᴸ                    │
└───────────────────────────┴───────────────────────────┴─────────────────────────┴─────────────────────────┘
```

要求されたパスがデータ内に見つからない場合、`NULL`値で埋められます:

```sql title="クエリ"
SELECT json.non.existing.path FROM test;
```

```text title="レスポンス"
┌─json.non.existing.path─┐
│ ᴺᵁᴸᴸ                   │
│ ᴺᵁᴸᴸ                   │
│ ᴺᵁᴸᴸ                   │
└────────────────────────┘
```

返されたサブカラムのデータ型を確認してみましょう:

```sql title="クエリ"
SELECT toTypeName(json.a.b), toTypeName(json.a.g), toTypeName(json.c), toTypeName(json.d) FROM test;
```


```text title="Response"
┌─toTypeName(json.a.b)─┬─toTypeName(json.a.g)─┬─toTypeName(json.c)─┬─toTypeName(json.d)─┐
│ UInt32               │ Dynamic              │ Dynamic            │ Dynamic            │
│ UInt32               │ Dynamic              │ Dynamic            │ Dynamic            │
│ UInt32               │ Dynamic              │ Dynamic            │ Dynamic            │
└──────────────────────┴──────────────────────┴────────────────────┴────────────────────┘
```

ご覧のとおり、`a.b` については JSON の型宣言でそのように指定したとおり、型は `UInt32` であり、その他のすべてのサブカラムの型は `Dynamic` になります。

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

`Dynamic` のサブカラムは任意のデータ型にキャストできます。この場合、`Dynamic` の内部型を要求されたデータ型にキャストできないと、例外がスローされます。

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
サーバーから例外を受信しました:
Code: 48. DB::Exception: Received from localhost:9000. DB::Exception: 
数値型とUUID間の変換はサポートされていません。
渡されたUUIDが引用符で囲まれていない可能性があります: 
'FUNCTION CAST(__table1.json.a.g :: 2, 'UUID'_String :: 1) -> CAST(__table1.json.a.g, 'UUID'_String) UUID : 0'の実行中。
(NOT_IMPLEMENTED)
```

:::note
Compact MergeTree パーツからサブカラムを効率的に読み出すには、MergeTree 設定 [write&#95;marks&#95;for&#95;substreams&#95;in&#95;compact&#95;parts](../../operations/settings/merge-tree-settings.md#write_marks_for_substreams_in_compact_parts) が有効になっていることを確認してください。
:::


## JSONサブオブジェクトをサブカラムとして読み取る {#reading-json-sub-objects-as-sub-columns}

`JSON`型は、特殊な構文`json.^some.path`を使用して、ネストされたオブジェクトを`JSON`型のサブカラムとして読み取ることができます:

```sql title="クエリ"
CREATE TABLE test (json JSON) ENGINE = Memory;
INSERT INTO test VALUES ('{"a" : {"b" : {"c" : 42, "g" : 42.42}}, "c" : [1, 2, 3], "d" : {"e" : {"f" : {"g" : "Hello, World", "h" : [1, 2, 3]}}}}'), ('{"f" : "Hello, World!", "d" : {"e" : {"f" : {"h" : [4, 5, 6]}}}}'), ('{"a" : {"b" : {"c" : 43, "e" : 10, "g" : 43.43}}, "c" : [4, 5, 6]}');
SELECT json FROM test;
```

```text title="レスポンス"
┌─json──────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ {"a":{"b":{"c":"42","g":42.42}},"c":["1","2","3"],"d":{"e":{"f":{"g":"Hello, World","h":["1","2","3"]}}}} │
│ {"d":{"e":{"f":{"h":["4","5","6"]}}},"f":"Hello, World!"}                                                 │
│ {"a":{"b":{"c":"43","e":"10","g":43.43}},"c":["4","5","6"]}                                               │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

```sql title="クエリ"
SELECT json.^a.b, json.^d.e.f FROM test;
```

```text title="レスポンス"
┌─json.^`a`.b───────────────────┬─json.^`d`.e.f──────────────────────────┐
│ {"c":"42","g":42.42}          │ {"g":"Hello, World","h":["1","2","3"]} │
│ {}                            │ {"h":["4","5","6"]}                    │
│ {"c":"43","e":"10","g":43.43} │ {}                                     │
└───────────────────────────────┴────────────────────────────────────────┘
```

:::note
サブオブジェクトをサブカラムとして読み取る場合、JSONデータのほぼ全体スキャンが必要になる可能性があるため、非効率的になることがあります。
:::


## パスの型推論 {#type-inference-for-paths}

`JSON`の解析時、ClickHouseは各JSONパスに対して最も適切なデータ型を検出しようとします。
これは[入力データからの自動スキーマ推論](/interfaces/schema-inference.md)と同様に動作し、
同じ設定によって制御されます:

- [input_format_try_infer_dates](/operations/settings/formats#input_format_try_infer_dates)
- [input_format_try_infer_datetimes](/operations/settings/formats#input_format_try_infer_datetimes)
- [schema_inference_make_columns_nullable](/operations/settings/formats#schema_inference_make_columns_nullable)
- [input_format_json_try_infer_numbers_from_strings](/operations/settings/formats#input_format_json_try_infer_numbers_from_strings)
- [input_format_json_infer_incomplete_types_as_strings](/operations/settings/formats#input_format_json_infer_incomplete_types_as_strings)
- [input_format_json_read_numbers_as_strings](/operations/settings/formats#input_format_json_read_numbers_as_strings)
- [input_format_json_read_bools_as_strings](/operations/settings/formats#input_format_json_read_bools_as_strings)
- [input_format_json_read_bools_as_numbers](/operations/settings/formats#input_format_json_read_bools_as_numbers)
- [input_format_json_read_arrays_as_strings](/operations/settings/formats#input_format_json_read_arrays_as_strings)
- [input_format_json_infer_array_of_dynamic_from_array_of_different_types](/operations/settings/formats#input_format_json_infer_array_of_dynamic_from_array_of_different_types)

いくつかの例を見てみましょう:

```sql title="クエリ"
SELECT JSONAllPathsWithTypes('{"a" : "2020-01-01", "b" : "2020-01-01 10:00:00"}'::JSON) AS paths_with_types settings input_format_try_infer_dates=1, input_format_try_infer_datetimes=1;
```

```text title="レスポンス"
┌─paths_with_types─────────────────┐
│ {'a':'Date','b':'DateTime64(9)'} │
└──────────────────────────────────┘
```

```sql title="クエリ"
SELECT JSONAllPathsWithTypes('{"a" : "2020-01-01", "b" : "2020-01-01 10:00:00"}'::JSON) AS paths_with_types settings input_format_try_infer_dates=0, input_format_try_infer_datetimes=0;
```

```text title="レスポンス"
┌─paths_with_types────────────┐
│ {'a':'String','b':'String'} │
└─────────────────────────────┘
```

```sql title="クエリ"
SELECT JSONAllPathsWithTypes('{"a" : [1, 2, 3]}'::JSON) AS paths_with_types settings schema_inference_make_columns_nullable=1;
```

```text title="レスポンス"
┌─paths_with_types───────────────┐
│ {'a':'Array(Nullable(Int64))'} │
└────────────────────────────────┘
```

```sql title="クエリ"
SELECT JSONAllPathsWithTypes('{"a" : [1, 2, 3]}'::JSON) AS paths_with_types settings schema_inference_make_columns_nullable=0;
```

```text title="レスポンス"
┌─paths_with_types─────┐
│ {'a':'Array(Int64)'} │
└──────────────────────┘
```


## JSON オブジェクトの配列の処理 {#handling-arrays-of-json-objects}

オブジェクトの配列を含む JSON パスは `Array(JSON)` 型として解析され、そのパスの `Dynamic` カラムに挿入されます。
オブジェクトの配列を読み取るには、`Dynamic` カラムからサブカラムとして抽出します:

```sql title="クエリ"
CREATE TABLE test (json JSON) ENGINE = Memory;
INSERT INTO test VALUES
('{"a" : {"b" : [{"c" : 42, "d" : "Hello", "f" : [[{"g" : 42.42}]], "k" : {"j" : 1000}}, {"c" : 43}, {"e" : [1, 2, 3], "d" : "My", "f" : [[{"g" : 43.43, "h" : "2020-01-01"}]],  "k" : {"j" : 2000}}]}}'),
('{"a" : {"b" : [1, 2, 3]}}'),
('{"a" : {"b" : [{"c" : 44, "f" : [[{"h" : "2020-01-02"}]]}, {"e" : [4, 5, 6], "d" : "World", "f" : [[{"g" : 44.44}]],  "k" : {"j" : 3000}}]}}');
SELECT json FROM test;
```

```text title="レスポンス"
┌─json────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ {"a":{"b":[{"c":"42","d":"Hello","f":[[{"g":42.42}]],"k":{"j":"1000"}},{"c":"43"},{"d":"My","e":["1","2","3"],"f":[[{"g":43.43,"h":"2020-01-01"}]],"k":{"j":"2000"}}]}} │
│ {"a":{"b":["1","2","3"]}}                                                                                                                                               │
│ {"a":{"b":[{"c":"44","f":[[{"h":"2020-01-02"}]]},{"d":"World","e":["4","5","6"],"f":[[{"g":44.44}]],"k":{"j":"3000"}}]}}                                                │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

```sql title="クエリ"
SELECT json.a.b, dynamicType(json.a.b) FROM test;
```

```text title="レスポンス"
┌─json.a.b──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬─dynamicType(json.a.b)────────────────────────────────────┐
│ ['{"c":"42","d":"Hello","f":[[{"g":42.42}]],"k":{"j":"1000"}}','{"c":"43"}','{"d":"My","e":["1","2","3"],"f":[[{"g":43.43,"h":"2020-01-01"}]],"k":{"j":"2000"}}'] │ Array(JSON(max_dynamic_types=16, max_dynamic_paths=256)) │
│ [1,2,3]                                                                                                                                                           │ Array(Nullable(Int64))                                   │
│ ['{"c":"44","f":[[{"h":"2020-01-02"}]]}','{"d":"World","e":["4","5","6"],"f":[[{"g":44.44}]],"k":{"j":"3000"}}']                                                  │ Array(JSON(max_dynamic_types=16, max_dynamic_paths=256)) │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────────────────────────────────────────────────┘
```

ご覧のとおり、ネストされた `JSON` 型の `max_dynamic_types`/`max_dynamic_paths` パラメータはデフォルト値と比較して削減されています。
これは、JSON オブジェクトのネストされた配列においてサブカラムの数が制御不能に増加するのを防ぐために必要です。

ネストされた `JSON` カラムからサブカラムを読み取ってみましょう:

```sql title="クエリ"
SELECT json.a.b.:`Array(JSON)`.c, json.a.b.:`Array(JSON)`.f, json.a.b.:`Array(JSON)`.d FROM test;
```


```text title="Response"
┌─json.a.b.:`Array(JSON)`.c─┬─json.a.b.:`Array(JSON)`.f───────────────────────────────────┬─json.a.b.:`Array(JSON)`.d─┐
│ [42,43,NULL]              │ [[['{"g":42.42}']],NULL,[['{"g":43.43,"h":"2020-01-01"}']]] │ ['Hello',NULL,'My']       │
│ []                        │ []                                                          │ []                        │
│ [44,NULL]                 │ [[['{"h":"2020-01-02"}']],[['{"g":44.44}']]]                │ [NULL,'World']            │
└───────────────────────────┴─────────────────────────────────────────────────────────────┴───────────────────────────┘
```

特別な構文を使用することで、`Array(JSON)` のサブカラム名を明示的に書かずに済みます。

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

パスの後ろに続く `[]` の数は、配列の階層レベルを示します。たとえば、`json.path[][]` は `json.path.:Array(Array(JSON))` に変換されます。

`Array(JSON)` に含まれるパスと型を確認してみましょう。

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

`Array(JSON)` 列からサブカラムを読み取んでみましょう。

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

入れ子になった `JSON` 列から、サブオブジェクトのサブカラムを読み取ることもできます。

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


## NULLを含むJSONキーの処理 {#handling-json-keys-with-nulls}

ClickHouseのJSON実装では、`null`と値の不在は同等として扱われます：

```sql title="Query"
SELECT '{}'::JSON AS json1, '{"a" : null}'::JSON AS json2, json1 = json2
```

```text title="Response"
┌─json1─┬─json2─┬─equals(json1, json2)─┐
│ {}    │ {}    │                    1 │
└───────┴───────┴──────────────────────┘
```

これは、元のJSONデータにNULL値を持つパスが含まれていたのか、あるいは全く含まれていなかったのかを判別できないことを意味します。


## ドットを含むJSONキーの処理 {#handling-json-keys-with-dots}

内部的にJSON型カラムは、すべてのパスと値をフラット化された形式で保存します。つまり、デフォルトでは以下の2つのオブジェクトが同一とみなされます:

```json
{"a" : {"b" : 42}}
{"a.b" : 42}
```

これらは両方とも、内部的にはパス`a.b`と値`42`のペアとして保存されます。JSONのフォーマット時には、ドットで区切られたパス部分に基づいて常にネストされたオブジェクトを形成します:

```sql title="クエリ"
SELECT '{"a" : {"b" : 42}}'::JSON AS json1, '{"a.b" : 42}'::JSON AS json2, JSONAllPaths(json1), JSONAllPaths(json2);
```

```text title="レスポンス"
┌─json1────────────┬─json2────────────┬─JSONAllPaths(json1)─┬─JSONAllPaths(json2)─┐
│ {"a":{"b":"42"}} │ {"a":{"b":"42"}} │ ['a.b']             │ ['a.b']             │
└──────────────────┴──────────────────┴─────────────────────┴─────────────────────┘
```

ご覧のとおり、元のJSON `{"a.b" : 42}` は `{"a" : {"b" : 42}}` としてフォーマットされています。

この制限により、次のような有効なJSONオブジェクトの解析も失敗します:

```sql title="クエリ"
SELECT '{"a.b" : 42, "a" : {"b" : "Hello World!"}}'::JSON AS json;
```

```text title="レスポンス"
Code: 117. DB::Exception: JSON型カラムにデータを挿入できません: JSONオブジェクトの解析中に重複したパスが見つかりました: a.b。挿入時に重複したパスをスキップするには、type_json_skip_duplicated_paths設定を有効にできます: スコープ内 SELECT CAST('{"a.b" : 42, "a" : {"b" : "Hello, World"}}', 'JSON') AS json. (INCORRECT_DATA)
```

ドットを含むキーを保持し、ネストされたオブジェクトとしてフォーマットされることを避けたい場合は、
[json_type_escape_dots_in_keys](/operations/settings/formats#json_type_escape_dots_in_keys)設定を有効にできます(バージョン`25.8`以降で利用可能)。この場合、解析時にJSONキー内のすべてのドットが`%2E`にエスケープされ、フォーマット時にアンエスケープされます。

```sql title="クエリ"
SET json_type_escape_dots_in_keys=1;
SELECT '{"a" : {"b" : 42}}'::JSON AS json1, '{"a.b" : 42}'::JSON AS json2, JSONAllPaths(json1), JSONAllPaths(json2);
```

```text title="レスポンス"
┌─json1────────────┬─json2────────┬─JSONAllPaths(json1)─┬─JSONAllPaths(json2)─┐
│ {"a":{"b":"42"}} │ {"a.b":"42"} │ ['a.b']             │ ['a%2Eb']           │
└──────────────────┴──────────────┴─────────────────────┴─────────────────────┘
```

```sql title="クエリ"
SET json_type_escape_dots_in_keys=1;
SELECT '{"a.b" : 42, "a" : {"b" : "Hello World!"}}'::JSON AS json, JSONAllPaths(json);
```

```text title="レスポンス"
┌─json──────────────────────────────────┬─JSONAllPaths(json)─┐
│ {"a.b":"42","a":{"b":"Hello World!"}} │ ['a%2Eb','a.b']    │
└───────────────────────────────────────┴────────────────────┘
```

エスケープされたドットを含むキーをサブカラムとして読み取るには、サブカラム名にエスケープされたドットを使用する必要があります:

```sql title="クエリ"
SET json_type_escape_dots_in_keys=1;
SELECT '{"a.b" : 42, "a" : {"b" : "Hello World!"}}'::JSON AS json, json.`a%2Eb`, json.a.b;
```

```text title="レスポンス"
┌─json──────────────────────────────────┬─json.a%2Eb─┬─json.a.b─────┐
│ {"a.b":"42","a":{"b":"Hello World!"}} │ 42         │ Hello World! │
└───────────────────────────────────────┴────────────┴──────────────┘
```

注意: 識別子パーサーとアナライザーの制限により、サブカラム `` json.`a.b` `` はサブカラム `json.a.b` と等価であり、エスケープされたドットを含むパスは読み取られません:


```sql title="Query"
SET json_type_escape_dots_in_keys=1;
SELECT '{"a.b" : 42, "a" : {"b" : "Hello World!"}}'::JSON AS json, json.`a%2Eb`, json.`a.b`, json.a.b;
```

```text title="Response"
┌─json──────────────────────────────────┬─json.a%2Eb─┬─json.a.b─────┬─json.a.b─────┐
│ {"a.b":"42","a":{"b":"Hello World!"}} │ 42         │ Hello World! │ Hello World! │
└───────────────────────────────────────┴────────────┴──────────────┴──────────────┘
```

また、ドットを含むキーを持つ JSON パスに対してヒントを指定する場合（またはそれを `SKIP` / `SKIP REGEX` セクションで使用する場合）、ヒント内ではドットをエスケープして記述する必要があります。

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
│ {"a":{"b":"こんにちは世界！"}} │ ᴺᵁᴸᴸ       │
└────────────────────────────┴────────────┘
```


## データからのJSON型の読み取り {#reading-json-type-from-data}

すべてのテキスト形式
([`JSONEachRow`](/interfaces/formats/JSONEachRow)、
[`TSV`](/interfaces/formats/TabSeparated)、
[`CSV`](/interfaces/formats/CSV)、
[`CustomSeparated`](/interfaces/formats/CustomSeparated)、
[`Values`](/interfaces/formats/Values)など)は`JSON`型の読み取りをサポートしています。

例:

```sql title="クエリ"
SELECT json FROM format(JSONEachRow, 'json JSON(a.b.c UInt32, SKIP a.b.d, SKIP d.e, SKIP REGEXP \'b.*\')', '
{"json" : {"a" : {"b" : {"c" : 1, "d" : [0, 1]}}, "b" : "2020-01-01", "c" : 42, "d" : {"e" : {"f" : ["s1", "s2"]}, "i" : [1, 2, 3]}}}
{"json" : {"a" : {"b" : {"c" : 2, "d" : [2, 3]}}, "b" : [1, 2, 3], "c" : null, "d" : {"e" : {"g" : 43}, "i" : [4, 5, 6]}}}
{"json" : {"a" : {"b" : {"c" : 3, "d" : [4, 5]}}, "b" : {"c" : 10}, "e" : "Hello, World!"}}
{"json" : {"a" : {"b" : {"c" : 4, "d" : [6, 7]}}, "c" : 43}}
{"json" : {"a" : {"b" : {"c" : 5, "d" : [8, 9]}}, "b" : {"c" : 11, "j" : [1, 2, 3]}, "d" : {"e" : {"f" : ["s3", "s4"], "g" : 44}, "h" : "2020-02-02 10:00:00"}}}
')
```

```text title="レスポンス"
┌─json──────────────────────────────────────────────────────────┐
│ {"a":{"b":{"c":1}},"c":"42","d":{"i":["1","2","3"]}}          │
│ {"a":{"b":{"c":2}},"d":{"i":["4","5","6"]}}                   │
│ {"a":{"b":{"c":3}},"e":"Hello, World!"}                       │
│ {"a":{"b":{"c":4}},"c":"43"}                                  │
│ {"a":{"b":{"c":5}},"d":{"h":"2020-02-02 10:00:00.000000000"}} │
└───────────────────────────────────────────────────────────────┘
```

`CSV`/`TSV`などのテキスト形式では、`JSON`はJSONオブジェクトを含む文字列から解析されます:


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
│ {"a":{"b":{"c":3}},"e":"こんにちは、世界！"}                       │
│ {"a":{"b":{"c":4}},"c":"43"}                                  │
│ {"a":{"b":{"c":5}},"d":{"h":"2020-02-02 10:00:00.000000000"}} │
└───────────────────────────────────────────────────────────────┘
```


## JSON内の動的パスの上限に達した場合 {#reaching-the-limit-of-dynamic-paths-inside-json}

`JSON`データ型は、内部的に限られた数のパスのみを個別のサブカラムとして格納できます。
デフォルトでは、この上限は`1024`ですが、型宣言で`max_dynamic_paths`パラメータを使用して変更できます。

上限に達すると、`JSON`カラムに挿入される新しいパスはすべて、単一の共有データ構造に格納されます。
このようなパスをサブカラムとして読み取ることは可能ですが、
効率が低下する可能性があります（[共有データに関するセクション](#shared-data-structure)を参照）。
この上限は、膨大な数の異なるサブカラムが生成されてテーブルが使用不可能になることを防ぐために必要です。

上限に達した場合に何が起こるかを、いくつかの異なるシナリオで見てみましょう。

### データ解析中に上限に達した場合 {#reaching-the-limit-during-data-parsing}

データから`JSON`オブジェクトを解析する際、現在のデータブロックで上限に達すると、
新しいパスはすべて共有データ構造に格納されます。次の2つのイントロスペクション関数`JSONDynamicPaths`、`JSONSharedDataPaths`を使用できます：

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

ご覧のとおり、パス`e`と`f.g`を挿入した後に上限に達し、
これらは共有データ構造に挿入されました。

### MergeTreeテーブルエンジンでのデータパートのマージ中 {#during-merges-of-data-parts-in-mergetree-table-engines}

`MergeTree`テーブルで複数のデータパートをマージする際、結果のデータパート内の`JSON`カラムが動的パスの上限に達し、
ソースパートのすべてのパスをサブカラムとして格納できなくなる場合があります。
この場合、ClickHouseはマージ後にどのパスをサブカラムとして残し、どのパスを共有データ構造に格納するかを選択します。
ほとんどの場合、ClickHouseは非NULL値が最も多いパスを保持し、
最も稀なパスを共有データ構造に移動しようとします。ただし、これは実装に依存します。

このようなマージの例を見てみましょう。
まず、`JSON`カラムを持つテーブルを作成し、動的パスの上限を`3`に設定してから、`5`つの異なるパスを持つ値を挿入します：


```sql title="Query"
CREATE TABLE test (id UInt64, json JSON(max_dynamic_paths=3)) ENGINE=MergeTree ORDER BY id;
SYSTEM STOP MERGES test;
INSERT INTO test SELECT number, formatRow('JSONEachRow', number as a) FROM numbers(5);
INSERT INTO test SELECT number, formatRow('JSONEachRow', number as b) FROM numbers(4);
INSERT INTO test SELECT number, formatRow('JSONEachRow', number as c) FROM numbers(3);
INSERT INTO test SELECT number, formatRow('JSONEachRow', number as d) FROM numbers(2);
INSERT INTO test SELECT number, formatRow('JSONEachRow', number as e) FROM numbers(1);
```

各 INSERT 操作はそれぞれ別個のデータパートを作成し、その `JSON` 列には単一のパスのみが格納されます。

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

では、すべての部分を一つにまとめて、どうなるか見てみましょう。

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

ご覧のとおり、ClickHouse は最も頻繁に現れるパスである `a`、`b`、`c` を保持し、パス `d` と `e` を共有のデータ構造に移動しました。


## 共有データ構造 {#shared-data-structure}

前のセクションで説明したように、`max_dynamic_paths`の制限に達すると、すべての新しいパスは単一の共有データ構造に格納されます。
このセクションでは、共有データ構造の詳細と、そこからパスサブカラムを読み取る方法について説明します。

JSONカラムの内容を検査するために使用される関数の詳細については、["イントロスペクション関数"](/sql-reference/data-types/newjson#introspection-functions)のセクションを参照してください。

### メモリ内の共有データ構造 {#shared-data-structure-in-memory}

メモリ内では、共有データ構造は`Map(String, String)`型のサブカラムであり、フラット化されたJSONパスからバイナリエンコードされた値へのマッピングを格納します。
そこからパスサブカラムを抽出するには、この`Map`カラムのすべての行を反復処理し、要求されたパスとその値を検索します。

### MergeTreeパート内の共有データ構造 {#shared-data-structure-in-merge-tree-parts}

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)テーブルでは、すべてをディスク(ローカルまたはリモート)に格納するデータパートにデータを保存します。ディスク上のデータは、メモリとは異なる方法で格納できます。
現在、MergeTreeデータパートには3つの異なる共有データ構造のシリアライゼーション方式があります:`map`、`map_with_buckets`、および`advanced`です。

シリアライゼーションバージョンは、MergeTree設定の[object_shared_data_serialization_version](../../operations/settings/merge-tree-settings.md#object_shared_data_serialization_version)と[object_shared_data_serialization_version_for_zero_level_parts](../../operations/settings/merge-tree-settings.md#object_shared_data_serialization_version_for_zero_level_parts)によって制御されます(ゼロレベルパートはテーブルへのデータ挿入時に作成されるパートであり、マージ時にはパートはより高いレベルになります)。

注意:共有データ構造のシリアライゼーションの変更は、`v3`[オブジェクトシリアライゼーションバージョン](../../operations/settings/merge-tree-settings.md#object_serialization_version)でのみサポートされています

#### Map {#shared-data-map}

`map`シリアライゼーションバージョンでは、共有データはメモリに格納されているのと同じように、`Map(String, String)`型の単一カラムとしてシリアライズされます。このタイプのシリアライゼーションからパスサブカラムを読み取るために、ClickHouseは`Map`カラム全体を読み取り、メモリ内で要求されたパスを抽出します。

このシリアライゼーションは、データの書き込みと`JSON`カラム全体の読み取りには効率的ですが、パスサブカラムの読み取りには効率的ではありません。

#### バケット付きMap {#shared-data-map-with-buckets}

`map_with_buckets`シリアライゼーションバージョンでは、共有データは`Map(String, String)`型の`N`個のカラム(「バケット」)としてシリアライズされます。
各バケットにはパスのサブセットのみが含まれます。このタイプのシリアライゼーションからパスサブカラムを読み取るために、ClickHouseは単一のバケットから`Map`カラム全体を読み取り、メモリ内で要求されたパスを抽出します。

このシリアライゼーションは、データの書き込みと`JSON`カラム全体の読み取りには効率が劣りますが、必要なバケットからのみデータを読み取るため、パスサブカラムの読み取りにはより効率的です。

バケット数`N`は、MergeTree設定の[object_shared_data_buckets_for_compact_part](../../operations/settings/merge-tree-settings.md#object_shared_data_buckets_for_compact_part)(デフォルトは8)と[object_shared_data_buckets_for_wide_part](../../operations/settings/merge-tree-settings.md#object_shared_data_buckets_for_wide_part)(デフォルトは32)によって制御されます。

#### Advanced {#shared-data-advanced}

`advanced`シリアライゼーションバージョンでは、共有データは、要求されたパスのデータのみを読み取ることを可能にする追加情報を格納することで、パスサブカラムの読み取りパフォーマンスを最大化する特別なデータ構造でシリアライズされます。
このシリアライゼーションもバケットをサポートしているため、各バケットにはパスのサブセットのみが含まれます。

このシリアライゼーションは、データの書き込みにはかなり非効率的です(そのため、ゼロレベルパートにこのシリアライゼーションを使用することは推奨されません)。`JSON`カラム全体の読み取りは`map`シリアライゼーションと比較してわずかに効率が劣りますが、パスサブカラムの読み取りには非常に効率的です。

注意:データ構造内に追加情報を格納するため、このシリアライゼーションでは`map`および`map_with_buckets`シリアライゼーションと比較してディスクストレージサイズが大きくなります。

新しい共有データシリアライゼーションと実装の詳細についてのより詳しい概要については、[ブログ記事](https://clickhouse.com/blog/json-data-type-gets-even-better)をお読みください。


## イントロスペクション関数 {#introspection-functions}

JSON列の内容を検査するために利用できる関数がいくつかあります:

- [`JSONAllPaths`](../functions/json-functions.md#JSONAllPaths)
- [`JSONAllPathsWithTypes`](../functions/json-functions.md#JSONAllPathsWithTypes)
- [`JSONDynamicPaths`](../functions/json-functions.md#JSONDynamicPaths)
- [`JSONDynamicPathsWithTypes`](../functions/json-functions.md#JSONDynamicPathsWithTypes)
- [`JSONSharedDataPaths`](../functions/json-functions.md#JSONSharedDataPaths)
- [`JSONSharedDataPathsWithTypes`](../functions/json-functions.md#JSONSharedDataPathsWithTypes)
- [`distinctDynamicTypes`](../aggregate-functions/reference/distinctdynamictypes.md)
- [`distinctJSONPaths and distinctJSONPathsAndTypes`](../aggregate-functions/reference/distinctjsonpaths.md)

**例**

日付`2020-01-01`の[GH Archive](https://www.gharchive.org/)データセットの内容を調査してみましょう:

```sql title="クエリ"
SELECT arrayJoin(distinctJSONPaths(json))
FROM s3('s3://clickhouse-public-datasets/gharchive/original/2020-01-01-*.json.gz', JSONAsObject)
```

```text title="レスポンス"
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


## ALTER MODIFY COLUMNでJSON型に変更 {#alter-modify-column-to-json-type}

既存のテーブルを変更し、カラムの型を新しい`JSON`型に変更することができます。現在は`String`型からの`ALTER`のみがサポートされています。

**例**

```sql title="クエリ"
CREATE TABLE test (json String) ENGINE=MergeTree ORDER BY tuple();
INSERT INTO test VALUES ('{"a" : 42}'), ('{"a" : 43, "b" : "Hello"}'), ('{"a" : 44, "b" : [1, 2, 3]}'), ('{"c" : "2020-01-01"}');
ALTER TABLE test MODIFY COLUMN json JSON;
SELECT json, json.a, json.b, json.c FROM test;
```

```text title="レスポンス"
┌─json─────────────────────────┬─json.a─┬─json.b──┬─json.c─────┐
│ {"a":"42"}                   │ 42     │ ᴺᵁᴸᴸ    │ ᴺᵁᴸᴸ       │
│ {"a":"43","b":"Hello"}       │ 43     │ Hello   │ ᴺᵁᴸᴸ       │
│ {"a":"44","b":["1","2","3"]} │ 44     │ [1,2,3] │ ᴺᵁᴸᴸ       │
│ {"c":"2020-01-01"}           │ ᴺᵁᴸᴸ   │ ᴺᵁᴸᴸ    │ 2020-01-01 │
└──────────────────────────────┴────────┴─────────┴────────────┘
```


## JSON型の値の比較 {#comparison-between-values-of-the-json-type}

JSONオブジェクトはMap型と同様に比較されます。

例:

```sql title="クエリ"
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

```text title="レスポンス"
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

**注意:** 2つのパスに異なるデータ型の値が含まれる場合、`Variant`データ型の[比較ルール](/sql-reference/data-types/variant#comparing-values-of-variant-data)に従って比較されます。


## JSON型をより効果的に使用するためのヒント {#tips-for-better-usage-of-the-json-type}

`JSON`カラムを作成してデータをロードする前に、以下のヒントを考慮してください:

- データを調査し、可能な限り多くのパスヒントを型とともに指定してください。これにより、ストレージと読み取りがはるかに効率的になります。
- 必要なパスと不要なパスを検討してください。不要なパスは`SKIP`セクションに指定し、必要に応じて`SKIP REGEXP`セクションにも指定してください。これによりストレージが改善されます。
- `max_dynamic_paths`パラメータを非常に高い値に設定しないでください。ストレージと読み取りの効率が低下する可能性があります。
  メモリ、CPUなどのシステムパラメータに大きく依存しますが、一般的な目安として、ローカルファイルシステムストレージでは`max_dynamic_paths`を10,000以下に、リモートファイルシステムストレージでは1,024以下に設定することを推奨します。


## 参考資料 {#further-reading}

- [ClickHouseの新しい強力なJSONデータ型の構築方法](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse)
- [10億ドキュメントJSONチャレンジ: ClickHouse vs. MongoDB、Elasticsearch、その他](https://clickhouse.com/blog/json-bench-clickhouse-vs-mongodb-elasticsearch-duckdb-postgresql)
