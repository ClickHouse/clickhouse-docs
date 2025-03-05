---
slug: /sql-reference/data-types/newjson
sidebar_position: 63
sidebar_label: JSON
keywords: [json, data type]
title: "JSONデータ型"
---
import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge/>

`JSON`型は、JavaScriptオブジェクト表記（JSON）ドキュメントを単一のカラムに格納します。

:::note
この機能はベータ版であり、まだ本番環境向けではありません。JSONドキュメントを処理する必要がある場合は、代わりに[このガイド](/integrations/data-formats/json/overview)を参照してください。

`JSON`型を使用したい場合、そしてこのページの例を事前に実行する場合は、次のコマンドを使用してください：

```sql
SET enable_json_type = 1
```

:::

`JSON`型のカラムを宣言するには、次の構文を使用できます：

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
上記の構文のパラメータは以下のように定義されます：

| パラメータ                    | 説明                                                                                                                                                                                                                                                                                                                                                       | デフォルト値 |
|-------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------|
| `max_dynamic_paths`           | 任意のパラメータで、JSONの単一のデータブロック内で別々に保存できるパスの数を示します（たとえば、MergeTreeテーブルの単一のデータパート内で）。 <br/><br/>この制限を超えると、すべての他のパスは単一の構造にまとめて保存されます。                                                                                                                                   | `1024`        |
| `max_dynamic_types`           | 1から255の間の任意のパラメータで、単一のパスカラム内で`Dynamic`型として格納できる異なるデータ型の数を示します。 <br/><br/>この制限を超えると、すべての新しい型は`String`型に変換されます。                                                                                                                                                           | `32`          |
| `some.path TypeName`          | JSON内の特定のパスに対する任意の型ヒント。指定された型を持つサブカラムとして常に保存されます。                                                                                                                                                                                                                                                  |               |
| `SKIP path.to.skip`           | JSON解析中にスキップすべき特定のパスに対する任意のヒント。これらのパスはJSONカラムに決して保存されません。指定されたパスがネストされたJSONオブジェクトの場合、全体のネストされたオブジェクトがスキップされます。                                                                                                                                              |               |
| `SKIP REGEXP 'path_regexp'`   | JSON解析中にパスをスキップするのに使用される正規表現を持つ任意のヒント。正規表現に一致するすべてのパスはJSONカラムに決して保存されません。                                                                                                                                                                                                                                           |               |

## JSONの作成 {#creating-json}

このセクションでは、`JSON`を作成するためのさまざまな方法を見ていきます。

### テーブルカラム定義での`JSON`の使用 {#using-json-in-a-table-column-definition}

```sql title="クエリ (例 1)"
CREATE TABLE test (json JSON) ENGINE = Memory;
INSERT INTO test VALUES ('{"a" : {"b" : 42}, "c" : [1, 2, 3]}'), ('{"f" : "Hello, World!"}'), ('{"a" : {"b" : 43, "e" : 10}, "c" : [4, 5, 6]}');
SELECT json FROM test;
```

```text title="レスポンス (例 1)"
┌─json────────────────────────────────────────┐
│ {"a":{"b":"42"},"c":["1","2","3"]}          │
│ {"f":"Hello, World!"}                       │
│ {"a":{"b":"43","e":"10"},"c":["4","5","6"]} │
└─────────────────────────────────────────────┘
```

```sql title="クエリ (例 2)"
CREATE TABLE test (json JSON(a.b UInt32, SKIP a.e)) ENGINE = Memory;
INSERT INTO test VALUES ('{"a" : {"b" : 42}, "c" : [1, 2, 3]}'), ('{"f" : "Hello, World!"}'), ('{"a" : {"b" : 43, "e" : 10}, "c" : [4, 5, 6]}');
SELECT json FROM test;
```

```text title="レスポンス (例 2)"
┌─json──────────────────────────────┐
│ {"a":{"b":42},"c":[1,2,3]}        │
│ {"a":{"b":0},"f":"Hello, World!"} │
│ {"a":{"b":43},"c":[4,5,6]}        │
└───────────────────────────────────┘
```

### `::JSON`を使用したCAST {#using-cast-with-json}

`::JSON`の特別な構文を使用して、さまざまな型をキャストすることができます。

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
JSONパスはフラットに保存されます。これは、パスのように`a.b.c`からJSONオブジェクトがフォーマットされるときに、オブジェクトが`{ "a.b.c" : ... }`として構成されるべきか、または`{ "a" : { "b" : { "c" : ... } } }`として構成されるべきかを知ることができないことを意味します。私たちの実装は常に後者を前提とします。

例えば：

```sql
SELECT CAST('{"a.b.c" : 42}', 'JSON') as json
```

は次のように返します：

```response
   ┌─json───────────────────┐
1. │ {"a":{"b":{"c":"42"}}} │
   └────────────────────────┘
```

そして **ではなく**：

```sql
   ┌─json───────────┐
1. │ {"a.b.c":"42"} │
   └────────────────┘
```
:::

## JSONパスをサブカラムとして読む {#reading-json-paths-as-sub-columns}

`JSON`型は、すべてのパスを別々のサブカラムとして読み取ることをサポートしています。 
リクエストされたパスの型がJSON型宣言で指定されていない場合、 
そのパスのサブカラムは常に[Dynamic](/sql-reference/data-types/dynamic.md)型になります。

例えば：

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

リクエストされたパスがデータ内に見つからなかった場合、それは`NULL`値で埋められます：

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

返されたサブカラムのデータ型を確認しましょう：

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

上記のように、`a.b`の型はJSON型宣言で指定した通り`UInt32`となっており、他のすべてのサブカラムの型は`Dynamic`です。

`Dynamic`型のサブカラムは、特別な構文`json.some.path.:TypeName`を使用して読み取ることもできます：

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

`Dynamic`型のサブカラムは、任意のデータ型にキャストできます。この場合、`Dynamic`内の内部型が要求された型にキャストできない場合、例外がスローされます：

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
サーバーから例外を受信しました：
コード: 48. DB::Exception: localhost:9000から受信しました。DB::Exception: 
数値型とUUID間の変換はサポートされていません。 
おそらく渡されたUUIDが引用されていません： 
'FUNCTION CAST(__table1.json.a.g :: 2, 'UUID'_String :: 1) -> CAST(__table1.json.a.g, 'UUID'_String) UUID : 0'を実行中。 
(NOT_IMPLEMENTED)
```
## JSONサブオブジェクトをサブカラムとして読む {#reading-json-sub-objects-as-sub-columns}

`JSON`型は、特別な構文`json.^some.path`を使用して、ネストされたオブジェクトを型`JSON`のサブカラムとして読み取ることをサポートしています：

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
サブオブジェクトをサブカラムとして読むことは非効率な場合があります。これは、JSONデータ全体をスキャンする必要がある場合があるためです。
:::
## パスの型推論 {#type-inference-for-paths}

`JSON`を解析する際、ClickHouseは各JSONパスに最も適切なデータ型を検出しようとします。 
これは[入力データからの自動スキーマ推論](/interfaces/schema-inference.md)に似た方法で機能し、同じ設定によって制御されます：
 
- [input_format_try_infer_integers](/interfaces/schema-inference.md#inputformattryinferintegers)
- [input_format_try_infer_dates](/interfaces/schema-inference.md#inputformattryinferdates)
- [input_format_try_infer_datetimes](/interfaces/schema-inference.md#inputformattryinferdatetimes)
- [schema_inference_make_columns_nullable](/interfaces/schema-inference.md#schemainferencemakecolumnsnullable)
- [input_format_json_try_infer_numbers_from_strings](/interfaces/schema-inference.md#inputformatjsontryinfernumbersfromstrings)
- [input_format_json_infer_incomplete_types_as_strings](/interfaces/schema-inference.md#inputformatjsoninferincompletetypesasstrings)
- [input_format_json_read_numbers_as_strings](/interfaces/schema-inference.md#inputformatjsonreadnumbersasstrings)
- [input_format_json_read_bools_as_strings](/interfaces/schema-inference.md#inputformatjsonreadboolsasstrings)
- [input_format_json_read_bools_as_numbers](/interfaces/schema-inference.md#inputformatjsonreadboolsasnumbers)
- [input_format_json_read_arrays_as_strings](/interfaces/schema-inference.md#inputformatjsonreadarraysasstrings)

いくつかの例を見てみましょう：

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
## JSONオブジェクトの配列の処理 {#handling-arrays-of-json-objects}

オブジェクトの配列を含むJSONパスは、型`Array(JSON)`として解析され、そのパスの`Dynamic`カラムに挿入されます。 
オブジェクトの配列を読み取るには、`Dynamic`カラムからサブカラムとして抽出できます：

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

ご覧のとおり、ネストされた`JSON`型の`max_dynamic_types`/`max_dynamic_paths`パラメータはデフォルト値に比べて減少しています。この変更は、ネストされたJSONオブジェクトの配列が無限に増えないようにするためです。

ネストされた`JSON`カラムからサブカラムを読み取ってみましょう：

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

`Array(JSON)`型のサブカラム名を書かなくても済む特別な構文を使用することもできます：

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

パスの後の`[]`の数は配列の階層を示します。例えば、`json.path[][]`は`json.path.:Array(Array(JSON))`に変換されます。

`Array(JSON)`内のパスと型を確認してみましょう：

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

`Array(JSON)`カラムからサブカラムを読み取ってみましょう：

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

ネストされた`JSON`カラムからサブオブジェクトのサブカラムを読み取ることもできます：

```sql title="クエリ"
SELECT json.a.b[].^k FROM test
```

```text title="レスポンス"
┌─json.a.b.:`Array(JSON)`.^`k`─────────┐
│ ['{"j":"1000"}','{}','{"j":"2000"}'] │
│ []                                   │
│ ['{}','{"j":"3000"}']                │
└──────────────────────────────────────┘
```
## データからJSON型を読む {#reading-json-type-from-data}

すべてのテキスト形式 
([`JSONEachRow`](../../interfaces/formats/JSON/JSONEachRow.md), 
[`TSV`](../../interfaces/formats/TabSeparated/TabSeparated.md), 
[`CSV`](../../interfaces/formats/CSV/CSV.md), 
[`CustomSeparated`](../../interfaces/formats/CustomSeparated/CustomSeparated.md), 
[`Values`](../../interfaces/formats/Values.md)、等）は、`JSON`型の読み込みをサポートしています。

例：

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

テキスト形式の`CSV`/`TSV`/等では、`JSON`はJSONオブジェクトを含む文字列から解析されます：

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
## JSON内の動的パスの制限に達する {#reaching-the-limit-of-dynamic-paths-inside-json}

`JSON`データ型は、内部的に別々のサブカラムとして格納できるパスの数に制限があります。 
デフォルトでは、この制限は`1024`ですが、型宣言で`max_dynamic_paths`パラメータを使用して変更できます。

制限に達すると、`JSON`カラムに新しく挿入されたすべてのパスは単一の共有データ構造に保存されます。 
このようなパスをサブカラムとして読み取ることはできますが、 
パスの値を抽出するために、全体の共有データ構造を読み取る必要があります。 
この制限は、テーブルが使用不能になるほどの非常に多くの異なるサブカラムが増えるのを防ぐために必要です。

制限に達したときのさまざまなシナリオで何が起こるか見てみましょう。
### データ解析中に制限に達する {#reaching-the-limit-during-data-parsing}

データからJSONオブジェクトを解析中に、現在のデータブロックの制限に達した場合、 
新しいすべてのパスは共有データ構造に保存されます。次の2つの内部調査関数`JSONDynamicPaths`、`JSONSharedDataPaths`を使用できます：

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

ご覧のとおり、パス`e`と`f.g`を挿入により制限に達し、 
これらは共有データ構造に挿入されました。
### MergeTree テーブルエンジンにおけるデータパーツのマージ中 {#during-merges-of-data-parts-in-mergetree-table-engines}

`MergeTree` テーブル内の複数のデータパーツのマージ中に、結果のデータパート内の `JSON` カラムは動的パスの制限に達する可能性があり、ソースパーツからのすべてのパスをサブカラムとして格納できなくなります。この場合、ClickHouse はマージ後にどのパスをサブカラムとして保持し、どのパスを共有データ構造に格納するかを選択します。ほとんどの場合、ClickHouse は、非NULL値の数が最も多いパスを保持し、まれなパスを共有データ構造に移動しようとします。ただし、これは実装に依存します。

このようなマージの例を見てみましょう。まず、`JSON` カラムを持つテーブルを作成し、動的パスの制限を `3` に設定してから、`5` の異なるパスを持つ値を挿入します。

```sql title="クエリ"
CREATE TABLE test (id UInt64, json JSON(max_dynamic_paths=3)) engine=MergeTree ORDER BY id;
SYSTEM STOP MERGES test;
INSERT INTO test SELECT number, formatRow('JSONEachRow', number as a) FROM numbers(5);
INSERT INTO test SELECT number, formatRow('JSONEachRow', number as b) FROM numbers(4);
INSERT INTO test SELECT number, formatRow('JSONEachRow', number as c) FROM numbers(3);
INSERT INTO test SELECT number, formatRow('JSONEachRow', number as d) FROM numbers(2);
INSERT INTO test SELECT number, formatRow('JSONEachRow', number as e) FROM numbers(1);
```

各挿入は、単一のパスを含む `JSON` カラムを持つ別々のデータパートを作成します。

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

```text title="レスポンス"
┌─count()─┬─dynamic_paths─┬─shared_data_paths─┬─_part─────┐
│       5 │ ['a']         │ []                │ all_1_1_0 │
│       4 │ ['b']         │ []                │ all_2_2_0 │
│       3 │ ['c']         │ []                │ all_3_3_0 │
│       2 │ ['d']         │ []                │ all_4_4_0 │
│       1 │ ['e']         │ []                │ all_5_5_0 │
└─────────┴───────────────┴───────────────────┴───────────┘
```

さて、すべてのパーツを1つにマージして、何が起こるか見てみましょう。

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

```text title="レスポンス"
┌─count()─┬─dynamic_paths─┬─shared_data_paths─┬─_part─────┐
│      15 │ ['a','b','c'] │ ['d','e']         │ all_1_5_2 │
└─────────┴───────────────┴───────────────────┴───────────┘
```

ご覧の通り、ClickHouse は最も頻繁なパス `a`、`b`、`c` を保持し、パス `d` と `e` を共有データ構造に移動しました。

## 内部調査関数 {#introspection-functions}

JSONカラムの内容を調査するのに役立ついくつかの関数があります：
- [`JSONAllPaths`](../functions/json-functions.md#jsonallpaths)
- [`JSONAllPathsWithTypes`](../functions/json-functions.md#jsonallpathswithtypes)
- [`JSONDynamicPaths`](../functions/json-functions.md#jsondynamicpaths)
- [`JSONDynamicPathsWithTypes`](../functions/json-functions.md#jsondynamicpathswithtypes)
- [`JSONSharedDataPaths`](../functions/json-functions.md#jsonshareddatapaths)
- [`JSONSharedDataPathsWithTypes`](../functions/json-functions.md#jsonshareddatapathswithtypes)
- [`distinctDynamicTypes`](../aggregate-functions/reference/distinctdynamictypes.md)
- [`distinctJSONPaths and distinctJSONPathsAndTypes`](../aggregate-functions/reference/distinctjsonpaths.md)

**例**

`2020-01-01` の [GH Archive](https://www.gharchive.org/) データセットの内容を調査してみましょう：

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

## ALTER COLUMN を JSON 型に変更する {#alter-modify-column-to-json-type}

既存のテーブルを変更して、カラムの型を新しい `JSON` 型に変更することが可能です。現在、`String` 型からの `ALTER` のみがサポートされています。

**例**

```sql title="クエリ"
CREATE TABLE test (json String) ENGINE=MergeTree ORDeR BY tuple();
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

## JSON 型の値の比較 {#comparison-between-values-of-the-json-type}

`JSON` カラムの値は `less/greater` 関数で比較することはできませんが、`equal` 関数を使用して比較できます。

2つの JSON オブジェクトは、同じパスのセットを持ち、これらのパスが両方のオブジェクトで同じ型と値を持つ場合、等しいと見なされます。

例えば：

```sql title="クエリ"
CREATE TABLE test (json1 JSON(a UInt32), json2 JSON(a UInt32)) ENGINE=Memory;
INSERT INTO test FORMAT JSONEachRow
{"json1" : {"a" : 42, "b" : 42, "c" : "Hello"}, "json2" : {"a" : 42, "b" : 42, "c" : "Hello"}}
{"json1" : {"a" : 42, "b" : 42, "c" : "Hello"}, "json2" : {"a" : 43, "b" : 42, "c" : "Hello"}}
{"json1" : {"a" : 42, "b" : 42, "c" : "Hello"}, "json2" : {"a" : 43, "b" : 42, "c" : "Hello"}}
{"json1" : {"a" : 42, "b" : 42, "c" : "Hello"}, "json2" : {"a" : 42, "b" : 42, "c" : "World"}}
{"json1" : {"a" : 42, "b" : [1, 2, 3], "c" : "Hello"}, "json2" : {"a" : 42, "b" : 42, "c" : "Hello"}}
{"json1" : {"a" : 42, "b" : 42.0, "c" : "Hello"}, "json2" : {"a" : 42, "b" : 42, "c" : "Hello"}}
{"json1" : {"a" : 42, "b" : "42", "c" : "Hello"}, "json2" : {"a" : 42, "b" : 42, "c" : "Hello"}};

SELECT json1, json2, json1 == json2 FROM test;
```

```text title="レスポンス"
┌─json1──────────────────────────────────┬─json2─────────────────────────┬─equals(json1, json2)─┐
│ {"a":42,"b":"42","c":"Hello"}          │ {"a":42,"b":"42","c":"Hello"} │                    1 │
│ {"a":42,"b":"42","c":"Hello"}          │ {"a":43,"b":"42","c":"Hello"} │                    0 │
│ {"a":42,"b":"42","c":"Hello"}          │ {"a":43,"b":"42","c":"Hello"} │                    0 │
│ {"a":42,"b":"42","c":"Hello"}          │ {"a":42,"b":"42","c":"World"} │                    0 │
│ {"a":42,"b":["1","2","3"],"c":"Hello"} │ {"a":42,"b":"42","c":"Hello"} │                    0 │
│ {"a":42,"b":42,"c":"Hello"}            │ {"a":42,"b":"42","c":"Hello"} │                    0 │
│ {"a":42,"b":"42","c":"Hello"}          │ {"a":42,"b":"42","c":"Hello"} │                    0 │
└────────────────────────────────────────┴───────────────────────────────┴──────────────────────┘
```

## JSON 型をより効果的に使用するためのヒント {#tips-for-better-usage-of-the-json-type}

`JSON` カラムを作成してデータをロードする前に、以下のヒントを考慮してください。

- データを調査し、できるだけ多くのパスヒントと型を指定してください。これにより、ストレージと読み取りがはるかに効率的になります。
- 必要なパスと決して必要ないパスについて考えます。必要ないパスは `SKIP` セクションおよび必要に応じて `SKIP REGEXP` セクションで指定します。これによりストレージが改善されます。
- `max_dynamic_paths` パラメータを非常に高い値に設定しないでください。そうしないと、ストレージと読み取りが非効率的になる可能性があります。
  システムパラメータ（メモリ、CPUなど）に強く依存しますが、一般的な指針としては `max_dynamic_paths` を 10,000 を超えないように設定することです。

## さらに読む {#further-reading}

- [ClickHouse のために新しい強力な JSON データ型を構築した方法](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse)
- [ビリオンドキュメント JSON チャレンジ: ClickHouse vs. MongoDB、Elasticsearch、その他](https://clickhouse.com/blog/json-bench-clickhouse-vs-mongodb-elasticsearch-duckdb-postgresql)
