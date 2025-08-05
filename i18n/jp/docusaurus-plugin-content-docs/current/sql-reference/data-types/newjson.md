---
description: 'JSONデータ型に関するClickHouseのドキュメントで、JSONデータを扱うためのネイティブサポートを提供します'
keywords:
- 'json'
- 'data type'
sidebar_label: 'JSON'
sidebar_position: 63
slug: '/sql-reference/data-types/newjson'
title: 'JSON データ型'
---

import {CardSecondary} from '@clickhouse/click-ui/bundled';

<CardSecondary
  badgeState="success"
  badgeText=""
  description="JSON型を使用する際の例、進んだ機能、考慮事項については、私たちのJSONベストプラクティスガイドをご覧ください。"
  icon="book"
  infoText="詳しく読む"
  infoUrl="/docs/best-practices/use-json-where-appropriate"
  title="ガイドをお探しですか？"
/>
<br/>

`JSON`型は、JavaScript Object Notation (JSON) ドキュメントを単一のカラムに格納します。

`JSON`型を使用する場合、及びこのページの例については、次のコマンドを使用してください:

```sql
SET enable_json_type = 1
```

しかし、ClickHouse Cloudを使用している場合、`JSON`型の使用を有効にするために最初に[サポートに連絡する必要があります](https://clickhouse.com/docs/about-us/support)。

:::note
ClickHouse Open-Sourceでは、JSONデータ型はバージョン25.3でプロダクション準備完了とマークされています。以前のバージョンでは、この型を本番環境で使用することは推奨されません。
:::

`JSON`型のカラムを宣言するには、次の構文を使用できます:

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

ここで、上記の構文のパラメータは次のように定義されています:

| パラメータ                   | 説明                                                                                                                                                                                                                                                                                                                                                | デフォルト値 |
|-----------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------|
| `max_dynamic_paths`         | 1つのデータブロックで個別に保存できるパスの数を示すオプショナルパラメータ。これは、(例えば、MergeTreeテーブルの単一データパートで)個別に保存されます。<br/><br/>この制限を超えると、他のすべてのパスは1つの構造体にまとめて保存されます。                                                                                                       | `1024`        |
| `max_dynamic_types`         | `1`から`255`の間のオプショナルパラメータで、単一パスのカラムに`Dynamic`型として保持されることのできる異なるデータ型の数を示します。<br/><br/>この制限を超えると、すべての新しい型は`String`型に変換されます。                                                                                                          | `32`          |
| `some.path TypeName`        | JSON内の特定のパスのためのオプショナル型ヒント。これらのパスは常に指定された型でサブカラムとして保存されます。                                                                                                                                                                                                                                               |               |
| `SKIP path.to.skip`         | JSONパース中にスキップすべき特定のパスに対するオプショナルヒント。こうしたパスはJSONカラムに保存されません。指定されたパスがネストされたJSONオブジェクトである場合、ネストされたオブジェクト全体がスキップされます。                                                                                                                                                    |               |
| `SKIP REGEXP 'path_regexp'` | JSONパース中にパスをスキップするために使用される正規表現を持つオプショナルヒント。この正規表現に一致するすべてのパスはJSONカラムに保存されません。                                                                                                                                                                                             |               |

## JSONの作成 {#creating-json}

このセクションでは、`JSON`を作成するためのさまざまな方法を見ていきます。
### テーブルカラム定義における`JSON`の使用 {#using-json-in-a-table-column-definition}

```sql title="クエリ (例1)"
CREATE TABLE test (json JSON) ENGINE = Memory;
INSERT INTO test VALUES ('{"a" : {"b" : 42}, "c" : [1, 2, 3]}'), ('{"f" : "Hello, World!"}'), ('{"a" : {"b" : 43, "e" : 10}, "c" : [4, 5, 6]}');
SELECT json FROM test;
```

```text title="レスポンス (例1)"
┌─json────────────────────────────────────────┐
│ {"a":{"b":"42"},"c":["1","2","3"]}          │
│ {"f":"Hello, World!"}                       │
│ {"a":{"b":"43","e":"10"},"c":["4","5","6"]} │
└─────────────────────────────────────────────┘
```

```sql title="クエリ (例2)"
CREATE TABLE test (json JSON(a.b UInt32, SKIP a.e)) ENGINE = Memory;
INSERT INTO test VALUES ('{"a" : {"b" : 42}, "c" : [1, 2, 3]}'), ('{"f" : "Hello, World!"}'), ('{"a" : {"b" : 43, "e" : 10}, "c" : [4, 5, 6]}');
SELECT json FROM test;
```

```text title="レスポンス (例2)"
┌─json──────────────────────────────┐
│ {"a":{"b":42},"c":[1,2,3]}        │
│ {"a":{"b":0},"f":"Hello, World!"} │
│ {"a":{"b":43},"c":[4,5,6]}        │
└───────────────────────────────────┘
```

### `::JSON`を使用したCAST {#using-cast-with-json}

特別な構文`::JSON`を使用してさまざまな型をキャストすることが可能です。
#### `String`から`JSON`へのCAST {#cast-from-string-to-json}

```sql title="クエリ"
SELECT '{"a" : {"b" : 42},"c" : [1, 2, 3], "d" : "Hello, World!"}'::JSON AS json;
```

```text title="レスポンス"
┌─json───────────────────────────────────────────┐
│ {"a":{"b":42},"c":[1,2,3],"d":"Hello, World!"} │
└────────────────────────────────────────────────┘
```

#### `Tuple`から`JSON`へのCAST {#cast-from-tuple-to-json}

```sql title="クエリ"
SET enable_named_columns_in_function_tuple = 1;
SELECT (tuple(42 AS b) AS a, [1, 2, 3] AS c, 'Hello, World!' AS d)::JSON AS json;
```

```text title="レスポンス"
┌─json───────────────────────────────────────────┐
│ {"a":{"b":42},"c":[1,2,3],"d":"Hello, World!"} │
└────────────────────────────────────────────────┘
```

#### `Map`から`JSON`へのCAST {#cast-from-map-to-json}

```sql title="クエリ"
SET enable_variant_type=1, use_variant_as_common_type=1;
SELECT map('a', map('b', 42), 'c', [1,2,3], 'd', 'Hello, World!')::JSON AS json;
```

```text title="レスポンス"
┌─json───────────────────────────────────────────┐
│ {"a":{"b":42},"c":[1,2,3],"d":"Hello, World!"} │
└────────────────────────────────────────────────┘
```

#### 非推奨の`Object('json')`から`JSON`へのCAST {#cast-from-deprecated-objectjson-to-json}

```sql title="クエリ"
SET allow_experimental_object_type = 1;
SELECT '{"a" : {"b" : 42},"c" : [1, 2, 3], "d" : "Hello, World!"}'::Object('json')::JSON AS json;
```

```text title="レスポンス"
┌─json───────────────────────────────────────────┐
│ {"a":{"b":42},"c":[1,2,3],"d":"Hello, World!"} │
└────────────────────────────────────────────────┘
```

:::note
JSONのパスは平坦化されて保存されます。これは、`a.b.c`のようなパスからJSONオブジェクトがフォーマットされる場合、そのオブジェクトが`{ "a.b.c" : ... }`として構築されるべきか、`{ "a" : {"b" : {"c" : ... }}}`として構築されるべきかを知ることが不可能であることを意味します。私たちの実装は常に後者を想定します。

例えば:

```sql
SELECT CAST('{"a.b.c" : 42}', 'JSON') as json
```

は次のように返します:

```response
   ┌─json───────────────────┐
1. │ {"a":{"b":{"c":"42"}}} │
   └────────────────────────┘
```

そして**決して**:

```sql
   ┌─json───────────┐
1. │ {"a.b.c":"42"} │
   └────────────────┘
```
:::
## JSONパスをサブカラムとして読む {#reading-json-paths-as-sub-columns}

`JSON`型は、すべてのパスを別々のサブカラムとして読むことをサポートしています。 
要求されたパスの型がJSON型宣言で指定されていない場合、パスのサブカラムは常に型[Dynamic](/sql-reference/data-types/dynamic.md)を持ちます。

例えば:

```sql title="クエリ"
CREATE TABLE test (json JSON(a.b UInt32, SKIP a.e)) ENGINE = Memory;
INSERT INTO test VALUES ('{"a" : {"b" : 42, "g" : 42.42}, "c" : [1, 2, 3], "d" : "2020-01-01"}'), ('{"f" : "Hello, World!", "d" : "2020-01-02"}'), ('{"a" : {"b" : 43, "e" : 10, "g" : 43.43}, "c" : [4, 5, 6]}');
SELECT json FROM test;
```

```text title="レスポンス"
┌─json──────────────────────────────────────────────────┐
│ {"a":{"b":42,"g":42.42},"c":[1,2,3],"d":"2020-01-01"} │
│ {"a":{"b":0},"d":"2020-01-02","f":"Hello, World!"}    │
│ {"a":{"b":43,"g":43.43},"c":[4,5,6]}                  │
└───────────────────────────────────────────────────────┘
```

```sql title="クエリ (JSONパスをサブカラムとして読む)"
SELECT json.a.b, json.a.g, json.c, json.d FROM test;
```

```text title="レスポンス (JSONパスをサブカラムとして読む)"
┌─json.a.b─┬─json.a.g─┬─json.c──┬─json.d─────┐
│       42 │ 42.42    │ [1,2,3] │ 2020-01-01 │
│        0 │ ᴺᵁᴸᴸ     │ ᴺᵁᴸᴸ    │ 2020-01-02 │
│       43 │ 43.43    │ [4,5,6] │ ᴺᵁᴸᴸ       │
└──────────┴──────────┴─────────┴────────────┘
```

要求されたパスがデータ内に見つからなかった場合、それは`NULL`値で埋め込まれます:

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

返されたサブカラムのデータ型を確認しましょう:

```sql title="クエリ"
SELECT toTypeName(json.a.b), toTypeName(json.a.g), toTypeName(json.c), toTypeName(json.d) FROM test;
```

```text title="レスポンス"
┌─toTypeName(json.a.b)─┬─toTypeName(json.a.g)─┬─toTypeName(json.c)─┬─toTypeName(json.d)─┐
│ UInt32               │ Dynamic              │ Dynamic            │ Dynamic            │
│ UInt32               │ Dynamic              │ Dynamic            │ Dynamic            │
│ UInt32               │ Dynamic              │ Dynamic            │ Dynamic            │
└──────────────────────┴──────────────────────┴────────────────────┴────────────────────┘
```

ご覧のように、`a.b`については、私たちがJSON型宣言で指定した通りに`UInt32`型です。 
他のすべてのサブカラムの型は`Dynamic`です。

特別な構文`json.some.path.:TypeName`を使用して、`Dynamic`型のサブカラムを読むことも可能です:

```sql title="クエリ"
SELECT
    json.a.g.:Float64,
    dynamicType(json.a.g),
    json.d.:Date,
    dynamicType(json.d)
FROM test
```

```text title="レスポンス"
┌─json.a.g.:`Float64`─┬─dynamicType(json.a.g)─┬─json.d.:`Date`─┬─dynamicType(json.d)─┐
│               42.42 │ Float64               │     2020-01-01 │ Date                │
│                ᴺᵁᴸᴸ │ None                  │     2020-01-02 │ Date                │
│               43.43 │ Float64               │           ᴺᵁᴸᴸ │ None                │
└─────────────────────┴───────────────────────┴────────────────┴─────────────────────┘
```

`Dynamic`サブカラムは任意のデータ型にキャストできます。この場合、`Dynamic`内の内部型が要求された型にキャストできない場合は例外がスローされます:

```sql title="クエリ"
SELECT json.a.g::UInt64 AS uint 
FROM test;
```

```text title="レスポンス"
┌─uint─┐
│   42 │
│    0 │
│   43 │
└──────┘
```

```sql title="クエリ"
SELECT json.a.g::UUID AS float 
FROM test;
```

```text title="レスポンス"
サーバーからの例外を受信:
コード: 48. DB::Exception: localhost:9000から受信。DB::Exception: 
数値型とUUIDの間の変換はサポートされていません。 
おそらく渡されたUUIDは引用符が付いていません: 
'UUID'_String :: 1) -> CAST(__table1.json.a.g, 'UUID'_String) UUID : 0'を実行中です。 
(未実装)
```

## JSONサブオブジェクトをサブカラムとして読む {#reading-json-sub-objects-as-sub-columns}

`JSON`型は、特別な構文`json.^some.path`を使用して、型`JSON`としてネストされたオブジェクトをサブカラムとして読むことをサポートしています:

```sql title="クエリ"
CREATE TABLE test (json JSON) ENGINE = Memory;
INSERT INTO test VALUES ('{"a" : {"b" : {"c" : 42, "g" : 42.42}}, "c" : [1, 2, 3], "d" : {"e" : {"f" : {"g" : "Hello, World", "h" : [1, 2, 3]}}}}'), ('{"f" : "Hello, World!", "d" : {"e" : {"f" : {"h" : [4, 5, 6]}}}}'), ('{"a" : {"b" : {"c" : 43, "e" : 10, "g" : 43.43}}, "c" : [4, 5, 6]}');
SELECT json FROM test;
```

```text title="レスポンス"
┌─json────────────────────────────────────────────────────────────────────────────────────────┐
│ {"a":{"b":{"c":42,"g":42.42}},"c":[1,2,3],"d":{"e":{"f":{"g":"Hello, World","h":[1,2,3]}}}} │
│ {"d":{"e":{"f":{"h":[4,5,6]}}},"f":"Hello, World!"}                                         │
│ {"a":{"b":{"c":43,"e":10,"g":43.43}},"c":[4,5,6]}                                           │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

```sql title="クエリ"
SELECT json.^a.b, json.^d.e.f FROM test;
```

```text title="レスポンス"
┌─json.^`a`.b───────────────┬─json.^`d`.e.f────────────────────┐
│ {"c":42,"g":42.42}        │ {"g":"Hello, World","h":[1,2,3]} │
│ {}                        │ {"h":[4,5,6]}                    │
│ {"c":43,"e":10,"g":43.43} │ {}                               │
└───────────────────────────┴──────────────────────────────────┘
```

:::note
サブオブジェクトをサブカラムとして読むことは、効率が悪い可能性があります。これは、JSONデータ全体をほぼフルスキャンする必要があるからです。
:::
## パスの型推論 {#type-inference-for-paths}

`JSON`の解析中、ClickHouseは各JSONパスに最も適切なデータ型を検出しようとします。 
これは、[入力データからの自動スキーマ推論](/interfaces/schema-inference.md)と似たように機能し、次の設定で制御されます:

- [input_format_try_infer_dates](/operations/settings/formats#input_format_try_infer_dates)
- [input_format_try_infer_datetimes](/operations/settings/formats#input_format_try_infer_datetimes)
- [schema_inference_make_columns_nullable](/operations/settings/formats#schema_inference_make_columns_nullable)
- [input_format_json_try_infer_numbers_from_strings](/operations/settings/formats#input_format_json_try_infer_numbers_from_strings)
- [input_format_json_infer_incomplete_types_as_strings](/operations/settings/formats#input_format_json_infer_incomplete_types_as_strings)
- [input_format_json_read_numbers_as_strings](/operations/settings/formats#input_format_json_read_numbers_as_strings)
- [input_format_json_read_bools_as_strings](/operations/settings/formats#input_format_json_read_bools_as_strings)
- [input_format_json_read_bools_as_numbers](/operations/settings/formats#input_format_json_read_bools_as_numbers)
- [input_format_json_read_arrays_as_strings](/operations/settings/formats#input_format_json_read_arrays_as_strings)

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
## JSONオブジェクトの配列を処理する {#handling-arrays-of-json-objects}

オブジェクトの配列を含むJSONパスは、型`Array(JSON)`として解析され、パスの`Dynamic`カラムに挿入されます。 
オブジェクトの配列を読むには、それを`Dynamic`カラムからサブカラムとして抽出できます:

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
│ ['{"c":"42","d":"Hello","f":[[{"g":42.42}]],"k":{"j":"1000"}}','{"c":"43"}','{"d":"My","e":["1","2","3"],"f":[[{"g":43.43}]],"k":{"j":"2000"}}'] │ Array(JSON(max_dynamic_types=16, max_dynamic_paths=256)) │
│ [1,2,3]                                                                                                                                                           │ Array(Nullable(Int64))                                   │
│ ['{"c":"44","f":[[{"h":"2020-01-02"}]]}','{"d":"World","e":["4","5","6"],"f":[[{"g":44.44}]],"k":{"j":"3000"}}']                                                  │ Array(JSON(max_dynamic_types=16, max_dynamic_paths=256)) │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────────────────────────────────────────────────┘
```

ご覧のとおり、ネストされた`JSON`型の`max_dynamic_types`/`max_dynamic_paths`パラメータは、デフォルト値と比較して減少しています。 
これは、ネストされたJSONオブジェクトの配列で異なるサブカラムの数が無限に増えるのを避けるために必要です。

ネストされた`JSON`カラムからサブカラムを読み取ってみましょう:

```sql title="クエリ"
SELECT json.a.b.:`Array(JSON)`.c, json.a.b.:`Array(JSON)`.f, json.a.b.:`Array(JSON)`.d FROM test; 
```

```text title="レスポンス"
┌─json.a.b.:`Array(JSON)`.c─┬─json.a.b.:`Array(JSON)`.f───────────────────────────────────┬─json.a.b.:`Array(JSON)`.d─┐
│ [42,43,NULL]              │ [[['{"g":42.42}']],NULL,[['{"g":43.43,"h":"2020-01-01"}']]] │ ['Hello',NULL,'My']       │
│ []                        │ []                                                          │ []                        │
│ [44,NULL]                 │ [[['{"h":"2020-01-02"}']],[['{"g":44.44}']]]                │ [NULL,'World']            │
└───────────────────────────┴─────────────────────────────────────────────────────────────┴───────────────────────────┘
```

`Array(JSON)`のサブカラム名を記述する際、特別な構文を使用して`[]`の記述を省略できます:

```sql title="クエリ"
SELECT json.a.b[].c, json.a.b[].f, json.a.b[].d FROM test;
```

```text title="レスポンス"
┌─json.a.b.:`Array(JSON)`.c─┬─json.a.b.:`Array(JSON)`.f───────────────────────────────────┬─json.a.b.:`Array(JSON)`.d─┐
│ [42,43,NULL]              │ [[['{"g":42.42}']],NULL,[['{"g":43.43,"h":"2020-01-01"}']]] │ ['Hello',NULL,'My']       │
│ []                        │ []                                                          │ []                        │
│ [44,NULL]                 │ [[['{"h":"2020-01-02"}']],[['{"g":44.44}']]]                │ [NULL,'World']            │
└───────────────────────────┴─────────────────────────────────────────────────────────────┴───────────────────────────┘
```

`[]`の数は、配列のレベルを示します。例えば、`json.path[][]`は`json.path.:Array(Array(JSON))`に変換されます。

`Array(JSON)`内のパスと型を確認しましょう:

```sql title="クエリ"
SELECT DISTINCT arrayJoin(JSONAllPathsWithTypes(arrayJoin(json.a.b[]))) FROM test;
```

```text title="レスポンス"
┌─arrayJoin(JSONAllPathsWithTypes(arrayJoin(json.a.b.:`Array(JSON)`)))──┐
│ ('c','Int64')                                                         │
│ ('d','String')                                                        │
│ ('f','Array(Array(JSON(max_dynamic_types=8, max_dynamic_paths=64)))') │
│ ('k.j','Int64')                                                       │
│ ('e','Array(Nullable(Int64))')                                        │
└───────────────────────────────────────────────────────────────────────┘
```

`Array(JSON)`カラムからサブカラムを読み取ってみましょう:

```sql title="クエリ"
SELECT json.a.b[].c.:Int64, json.a.b[].f[][].g.:Float64, json.a.b[].f[][].h.:Date FROM test;
```

```text title="レスポンス"
┌─json.a.b.:`Array(JSON)`.c.:`Int64`─┬─json.a.b.:`Array(JSON)`.f.:`Array(Array(JSON))`.g.:`Float64`─┬─json.a.b.:`Array(JSON)`.f.:`Array(Array(JSON))`.h.:`Date`─┐
│ [42,43,NULL]                       │ [[[42.42]],[],[[43.43]]]                                     │ [[[NULL]],[],[['2020-01-01']]]                            │
│ []                                 │ []                                                           │ []                                                        │
│ [44,NULL]                          │ [[[NULL]],[[44.44]]]                                         │ [[['2020-01-02']],[[NULL]]]                               │
└────────────────────────────────────┴──────────────────────────────────────────────────────────────┴───────────────────────────────────────────────────────────┘
```

ネストされた`JSON`カラムからサブオブジェクトのサブカラムも読み取ることができます:

```sql title="クエリ"
SELECT json.a.b[].^k FROM test
```

```text title="レスポンス"
┌─json.a.b.:`Array(JSON)`.^`k`─────────┐
│ ['{"j":"1000"}','{}','{"j":"2000"} │
│ []                                   │
│ ['{}','{"j":"3000"}']                │
└──────────────────────────────────────┘
```
## データからのJSON型の読み取り {#reading-json-type-from-data}

すべてのテキスト形式 
([`JSONEachRow`](../../interfaces/formats/JSON/JSONEachRow.md)、 
[`TSV`](../../interfaces/formats/TabSeparated/TabSeparated.md)、 
[`CSV`](../../interfaces/formats/CSV/CSV.md)、 
[`CustomSeparated`](../../interfaces/formats/CustomSeparated/CustomSeparated.md)、 
[`Values`](../../interfaces/formats/Values.md)、など)は、`JSON`型の読み取りをサポートしています。

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

テキスト形式での`JSON`は、JSONオブジェクトを含む文字列から解析されます:

```sql title="クエリ"
SELECT json FROM format(TSV, 'json JSON(a.b.c UInt32, SKIP a.b.d, SKIP REGEXP \'b.*\')',
'{"a" : {"b" : {"c" : 1, "d" : [0, 1]}}, "b" : "2020-01-01", "c" : 42, "d" : {"e" : {"f" : ["s1", "s2"]}, "i" : [1, 2, 3]}}
{"a" : {"b" : {"c" : 2, "d" : [2, 3]}}, "b" : [1, 2, 3], "c" : null, "d" : {"e" : {"g" : 43}, "i" : [4, 5, 6]}}
{"a" : {"b" : {"c" : 3, "d" : [4, 5]}}, "b" : {"c" : 10}, "e" : "Hello, World!"}
{"a" : {"b" : {"c" : 4, "d" : [6, 7]}}, "c" : 43}
{"a" : {"b" : {"c" : 5, "d" : [8, 9]}}, "b" : {"c" : 11, "j" : [1, 2, 3]}, "d" : {"e" : {"f" : ["s3", "s4"], "g" : 44}, "h" : "2020-02-02 10:00:00"}}')
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
## JSON内の動的パスの限界に達する {#reaching-the-limit-of-dynamic-paths-inside-json}

`JSON`データ型は、内部で別々のサブカラムとして保存できるパスの数に限りがあります。 
デフォルトでこの上限は`1024`ですが、型宣言内でパラメータ`max_dynamic_paths`を使用して変更できます。

制限に達すると、`JSON`カラムに挿入されるすべての新しいパスは、単一の共有データ構造に保存されます。 
こうしたパスはサブカラムとして読み取ることができますが、値を抽出するために共有データ構造全体を読み取る必要があります。 
この制限は、テーブルを使用不能にすることがある大量の異なるサブカラムが発生するのを避けるために必要です。

制限に達した場合に何が起こるかを、いくつかの異なるシナリオで見てみましょう。
### データ解析中に制限に達する {#reaching-the-limit-during-data-parsing}

データから`JSON`オブジェクトを解析する際、現在のデータブロックの制限に達すると、すべての新しいパスは共有データ構造に保存されます。 
次の2つのイントロスペクション関数`JSONDynamicPaths`、`JSONSharedDataPaths`を使用できます:

```sql title="クエリ"
SELECT json, JSONDynamicPaths(json), JSONSharedDataPaths(json) FROM format(JSONEachRow, 'json JSON(max_dynamic_paths=3)', '
{"json" : {"a" : {"b" : 42}, "c" : [1, 2, 3]}}
{"json" : {"a" : {"b" : 43}, "d" : "2020-01-01"}}
{"json" : {"a" : {"b" : 44}, "c" : [4, 5, 6]}}
{"json" : {"a" : {"b" : 43}, "d" : "2020-01-02", "e" : "Hello", "f" : {"g" : 42.42}}}
{"json" : {"a" : {"b" : 43}, "c" : [7, 8, 9], "f" : {"g" : 43.43}, "h" : "World"}}
')
```

```text title="レスポンス"
┌─json───────────────────────────────────────────────────────────┬─JSONDynamicPaths(json)─┬─JSONSharedDataPaths(json)─┐
│ {"a":{"b":"42"},"c":["1","2","3"]}                             │ ['a.b','c','d']        │ []                        │
│ {"a":{"b":"43"},"d":"2020-01-01"}                              │ ['a.b','c','d']        │ []                        │
│ {"a":{"b":"44"},"c":["4","5","6"]}                             │ ['a.b','c','d']        │ []                        │
│ {"a":{"b":"43"},"d":"2020-01-02","e":"Hello","f":{"g":42.42}}  │ ['a.b','c','d']        │ ['e','f.g']               │
│ {"a":{"b":"43"},"c":["7","8","9"],"f":{"g":43.43},"h":"World"} │ ['a.b','c','d']        │ ['f.g','h']               │
└────────────────────────────────────────────────────────────────┴────────────────────────┴───────────────────────────┘
```

ご覧のとおり、`e`と`f.g`というパスが挿入された後、制限に達し、共有データ構造に挿入されました。
### MergeTreeテーブルエンジンにおけるデータパーツのマージ中 {#during-merges-of-data-parts-in-mergetree-table-engines}

`MergeTree` テーブルで複数のデータパーツをマージする際、結果のデータパーツにおける `JSON` カラムは動的パスの制限に達し、ソースパーツからのすべてのパスをサブカラムとして保存できなくなります。この場合、ClickHouseはマージ後にどのパスがサブカラムとして残り、どのパスが共有データ構造に保存されるかを選択します。ほとんどの場合、ClickHouseは非NULL値の数が最も多いパスを保持し、最も希少なパスを共有データ構造に移動させます。ただし、これは実装に依存します。

このようなマージの例を見てみましょう。まず、`JSON` カラムを持つテーブルを作成し、動的パスの制限を `3` に設定し、次に `5` つの異なるパスを持つ値を挿入します：

```sql title="クエリ"
CREATE TABLE test (id UInt64, json JSON(max_dynamic_paths=3)) engine=MergeTree ORDER BY id;
SYSTEM STOP MERGES test;
INSERT INTO test SELECT number, formatRow('JSONEachRow', number as a) FROM numbers(5);
INSERT INTO test SELECT number, formatRow('JSONEachRow', number as b) FROM numbers(4);
INSERT INTO test SELECT number, formatRow('JSONEachRow', number as c) FROM numbers(3);
INSERT INTO test SELECT number, formatRow('JSONEachRow', number as d) FROM numbers(2);
INSERT INTO test SELECT number, formatRow('JSONEachRow', number as e) FROM numbers(1);
```

各挿入は、`JSON` カラムに単一のパスを含む別々のデータパーツを作成します：

```sql title="クエリ"
SELECT
    count(),
    groupArrayArrayDistinct(JSONDynamicPaths(json)) AS dynamic_paths,
    groupArrayArrayDistinct(JSONSharedDataPaths(json)) AS shared_data_paths,
    _part
FROM test
GROUP BY _part
ORDER BY _part ASC
```

```text title="応答"
┌─count()─┬─dynamic_paths─┬─shared_data_paths─┬─_part─────┐
│       5 │ ['a']         │ []                │ all_1_1_0 │
│       4 │ ['b']         │ []                │ all_2_2_0 │
│       3 │ ['c']         │ []                │ all_3_3_0 │
│       2 │ ['d']         │ []                │ all_4_4_0 │
│       1 │ ['e']         │ []                │ all_5_5_0 │
└─────────┴───────────────┴───────────────────┴───────────┘
```

さて、すべてのパーツを1つにマージし、何が起こるかを見てみましょう：

```sql title="クエリ"
SELECT
    count(),
    groupArrayArrayDistinct(JSONDynamicPaths(json)) AS dynamic_paths,
    groupArrayArrayDistinct(JSONSharedDataPaths(json)) AS shared_data_paths,
    _part
FROM test
GROUP BY _part
ORDER BY _part ASC
```

```text title="応答"
┌─count()─┬─dynamic_paths─┬─shared_data_paths─┬─_part─────┐
│      15 │ ['a','b','c'] │ ['d','e']         │ all_1_5_2 │
└─────────┴───────────────┴───────────────────┴───────────┘
```

ご覧のように、ClickHouseは最も頻繁に出現するパスである `a`、`b`、`c` を保持し、`d` と `e` のパスを共有データ構造に移動しました。
## 内部調査関数 {#introspection-functions}

`JSON` カラムの内容を検査するのに役立つ関数がいくつかあります：
- [`JSONAllPaths`](../functions/json-functions.md#jsonallpaths)
- [`JSONAllPathsWithTypes`](../functions/json-functions.md#jsonallpathswithtypes)
- [`JSONDynamicPaths`](../functions/json-functions.md#jsondynamicpaths)
- [`JSONDynamicPathsWithTypes`](../functions/json-functions.md#jsondynamicpathswithtypes)
- [`JSONSharedDataPaths`](../functions/json-functions.md#jsonshareddatapaths)
- [`JSONSharedDataPathsWithTypes`](../functions/json-functions.md#jsonshareddatapathswithtypes)
- [`distinctDynamicTypes`](../aggregate-functions/reference/distinctdynamictypes.md)
- [`distinctJSONPaths and distinctJSONPathsAndTypes`](../aggregate-functions/reference/distinctjsonpaths.md)

**例**

`2020-01-01` の日付に対する [GH Archive](https://www.gharchive.org/) データセットの内容を調査しましょう：

```sql title="クエリ"
SELECT arrayJoin(distinctJSONPaths(json))
FROM s3('s3://clickhouse-public-datasets/gharchive/original/2020-01-01-*.json.gz', JSONAsObject) 
```

```text title="応答"
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
## ALTER MODIFY COLUMNを使用してJSON型に変更 {#alter-modify-column-to-json-type}

既存のテーブルを変更し、カラムの型を新しい `JSON` 型に変更することができます。現在、`String` 型からの `ALTER` のみがサポートされています。

**例**

```sql title="クエリ"
CREATE TABLE test (json String) ENGINE=MergeTree ORDeR BY tuple();
INSERT INTO test VALUES ('{"a" : 42}'), ('{"a" : 43, "b" : "Hello"}'), ('{"a" : 44, "b" : [1, 2, 3]}'), ('{"c" : "2020-01-01"}');
ALTER TABLE test MODIFY COLUMN json JSON;
SELECT json, json.a, json.b, json.c FROM test;
```

```text title="応答"
┌─json─────────────────────────┬─json.a─┬─json.b──┬─json.c─────┐
│ {"a":"42"}                   │ 42     │ ᴺᵁᴸᴸ    │ ᴺᵁᴸᴸ       │
│ {"a":"43","b":"Hello"}       │ 43     │ Hello   │ ᴺᵁᴸᴸ       │
│ {"a":"44","b":["1","2","3"]} │ 44     │ [1,2,3] │ ᴺᵁᴸᴸ       │
│ {"c":"2020-01-01"}           │ ᴺᵁᴸᴸ   │ ᴺᵁᴸᴸ    │ 2020-01-01 │
└──────────────────────────────┴────────┴─────────┴────────────┘
```
## JSON型の値の比較 {#comparison-between-values-of-the-json-type}

JSONオブジェクトは、マップと同様に比較されます。

例えば：

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

```text title="応答"
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

**注意:** 2つのパスが異なるデータ型の値を含む場合、それらは `Variant` データ型の[比較規則](/sql-reference/data-types/variant#comparing-values-of-variant-data)に従って比較されます。
## JSON型のより良い使用のためのヒント {#tips-for-better-usage-of-the-json-type}

`JSON` カラムを作成し、データをロードする前に、以下のヒントを考慮してください：

- データを調査し、できるだけ多くのパスヒントとタイプを指定してください。これにより、ストレージと読み取りがはるかに効率的になります。
- 必要なパスと決して必要ないパスについて考えます。必要ないパスは、`SKIP` セクション、`SKIP REGEXP` セクションに指定してください。これにより、ストレージが改善されます。
- `max_dynamic_paths` パラメータを非常に高い値に設定しないでください。これは、ストレージと読み取りの効率を低下させる可能性があります。
  システムパラメータ（メモリ、CPUなど）に依存するため、一般的な目安として `max_dynamic_paths` > 10 000 に設定しないことをお勧めします。
## さらなる情報 {#further-reading}

- [ClickHouseの新しい強力なJSONデータ型をどのように構築したか](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse)
- [10億ドキュメントのJSONチャレンジ: ClickHouse対MongoDB、Elasticsearch、その他](https://clickhouse.com/blog/json-bench-clickhouse-vs-mongodb-elasticsearch-duckdb-postgresql)
