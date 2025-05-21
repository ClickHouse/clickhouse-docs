
---
description: 'JSON関数のドキュメント'
sidebar_label: 'JSON'
sidebar_position: 105
slug: /sql-reference/functions/json-functions
title: 'JSON関数'
---

JSONを解析するための2つの関数セットがあります：
   - [`simpleJSON*` (`visitParam*`)](#simplejson-visitparam-functions) は、非常に限られたサブセットのJSONを高速で解析するために作成されています。
   - [`JSONExtract*`](#jsonextract-functions) は、通常のJSONを解析するために作成されています。
## simpleJSON (visitParam) 関数 {#simplejson-visitparam-functions}

ClickHouseには、簡略化されたJSONを操作するための特別な関数があります。これらのすべてのJSON関数は、JSONがどのようなものかについて強い仮定に基づいています。できるだけ少ない作業で、できるだけ早く仕事を終えようとします。

以下の仮定がなされています：

1. フィールド名（関数の引数）は定数でなければなりません。
2. フィールド名はJSON内で何らかの方法で標準的にエンコードされています。たとえば： `simpleJSONHas('{"abc":"def"}', 'abc') = 1` ですが、 `simpleJSONHas('{"\\u0061\\u0062\\u0063":"def"}', 'abc') = 0` です。
3. フィールドは任意のネストレベルで無差別に検索されます。複数の一致するフィールドが存在する場合は、最初の出現が使用されます。
4. JSONには文字列リテラルの外に空白文字が存在しません。
### simpleJSONHas {#simplejsonhas}

`field_name` という名前のフィールドが存在するかどうかを確認します。結果は `UInt8` です。

**構文**

```sql
simpleJSONHas(json, field_name)
```

エイリアス: `visitParamHas`。

**パラメータ**

- `json` — フィールドが検索されるJSON。 [String](/sql-reference/data-types/string)
- `field_name` — 検索するフィールドの名前。 [String literal](/sql-reference/syntax#string)

**返される値**

- フィールドが存在する場合は `1` を、そうでない場合は `0` を返します。 [UInt8](../data-types/int-uint.md)。

**例**

クエリ：

```sql
CREATE TABLE jsons
(
    `json` String
)
ENGINE = Memory;

INSERT INTO jsons VALUES ('{"foo":"true","qux":1}');

SELECT simpleJSONHas(json, 'foo') FROM jsons;
SELECT simpleJSONHas(json, 'bar') FROM jsons;
```

結果：

```response
1
0
```
### simpleJSONExtractUInt {#simplejsonextractuint}

`field_name` という名前のフィールドの値から `UInt64` を解析します。これが文字列フィールドの場合、文字列の先頭から数字を解析しようとします。フィールドが存在しないか、存在しても数字を含まない場合は `0` を返します。

**構文**

```sql
simpleJSONExtractUInt(json, field_name)
```

エイリアス: `visitParamExtractUInt`。

**パラメータ**

- `json` — フィールドが検索されるJSON。 [String](/sql-reference/data-types/string)
- `field_name` — 検索するフィールドの名前。 [String literal](/sql-reference/syntax#string)

**返される値**

- フィールドが存在し、数字を含んでいる場合はフィールドから解析された数字を返し、そうでない場合は `0` を返します。 [UInt64](../data-types/int-uint.md)。

**例**

クエリ：

```sql
CREATE TABLE jsons
(
    `json` String
)
ENGINE = Memory;

INSERT INTO jsons VALUES ('{"foo":"4e3"}');
INSERT INTO jsons VALUES ('{"foo":3.4}');
INSERT INTO jsons VALUES ('{"foo":5}');
INSERT INTO jsons VALUES ('{"foo":"not1number"}');
INSERT INTO jsons VALUES ('{"baz":2}');

SELECT simpleJSONExtractUInt(json, 'foo') FROM jsons ORDER BY json;
```

結果：

```response
0
4
0
3
5
```
### simpleJSONExtractInt {#simplejsonextractint}

`field_name` という名前のフィールドの値から `Int64` を解析します。これが文字列フィールドの場合、文字列の先頭から数字を解析しようとします。フィールドが存在しないか、存在しても数字を含まない場合は `0` を返します。

**構文**

```sql
simpleJSONExtractInt(json, field_name)
```

エイリアス: `visitParamExtractInt`。

**パラメータ**

- `json` — フィールドが検索されるJSON。 [String](/sql-reference/data-types/string)
- `field_name` — 検索するフィールドの名前。 [String literal](/sql-reference/syntax#string)

**返される値**

- フィールドが存在し、数字を含んでいる場合はフィールドから解析された数字を返し、そうでない場合は `0` を返します。 [Int64](../data-types/int-uint.md)。

**例**

クエリ：

```sql
CREATE TABLE jsons
(
    `json` String
)
ENGINE = Memory;

INSERT INTO jsons VALUES ('{"foo":"-4e3"}');
INSERT INTO jsons VALUES ('{"foo":-3.4}');
INSERT INTO jsons VALUES ('{"foo":5}');
INSERT INTO jsons VALUES ('{"foo":"not1number"}');
INSERT INTO jsons VALUES ('{"baz":2}');

SELECT simpleJSONExtractInt(json, 'foo') FROM jsons ORDER BY json;
```

結果：

```response
0
-4
0
-3
5
```
### simpleJSONExtractFloat {#simplejsonextractfloat}

`field_name` という名前のフィールドの値から `Float64` を解析します。これが文字列フィールドの場合、文字列の先頭から数字を解析しようとします。フィールドが存在しないか、存在しても数字を含まない場合は `0` を返します。

**構文**

```sql
simpleJSONExtractFloat(json, field_name)
```

エイリアス: `visitParamExtractFloat`。

**パラメータ**

- `json` — フィールドが検索されるJSON。 [String](/sql-reference/data-types/string)
- `field_name` — 検索するフィールドの名前。 [String literal](/sql-reference/syntax#string)

**返される値**

- フィールドが存在し、数字を含んでいる場合はフィールドから解析された数字を返し、そうでない場合は `0` を返します。 [Float64](/sql-reference/data-types/float)。

**例**

クエリ：

```sql
CREATE TABLE jsons
(
    `json` String
)
ENGINE = Memory;

INSERT INTO jsons VALUES ('{"foo":"-4e3"}');
INSERT INTO jsons VALUES ('{"foo":-3.4}');
INSERT INTO jsons VALUES ('{"foo":5}');
INSERT INTO jsons VALUES ('{"foo":"not1number"}');
INSERT INTO jsons VALUES ('{"baz":2}');

SELECT simpleJSONExtractFloat(json, 'foo') FROM jsons ORDER BY json;
```

結果：

```response
0
-4000
0
-3.4
5
```
### simpleJSONExtractBool {#simplejsonextractbool}

`field_name` という名前のフィールドの値から真偽値を解析します。結果は `UInt8` です。

**構文**

```sql
simpleJSONExtractBool(json, field_name)
```

エイリアス: `visitParamExtractBool`。

**パラメータ**

- `json` — フィールドが検索されるJSON。 [String](/sql-reference/data-types/string)
- `field_name` — 検索するフィールドの名前。 [String literal](/sql-reference/syntax#string)

**返される値**

フィールドの値が `true` であれば `1` を返し、そうでない場合は `0` を返します。この関数は以下のケースも含めて `0` を返すことに注意してください：
 - フィールドが存在しない場合。
 - フィールドが文字列として `true` を含む場合（例： `{"field":"true"}`）。
 - フィールドが数値として `1` を含む場合。

**例**

クエリ：

```sql
CREATE TABLE jsons
(
    `json` String
)
ENGINE = Memory;

INSERT INTO jsons VALUES ('{"foo":false,"bar":true}');
INSERT INTO jsons VALUES ('{"foo":"true","qux":1}');

SELECT simpleJSONExtractBool(json, 'bar') FROM jsons ORDER BY json;
SELECT simpleJSONExtractBool(json, 'foo') FROM jsons ORDER BY json;
```

結果：

```response
0
1
0
0
```
### simpleJSONExtractRaw {#simplejsonextractraw}

`field_name` という名前のフィールドの値を区切り文字を含む `String` として返します。

**構文**

```sql
simpleJSONExtractRaw(json, field_name)
```

エイリアス: `visitParamExtractRaw`。

**パラメータ**

- `json` — フィールドが検索されるJSON。 [String](/sql-reference/data-types/string)
- `field_name` — 検索するフィールドの名前。 [String literal](/sql-reference/syntax#string)

**返される値**

- フィールドが存在する場合は、その値を文字列として返し、存在しない場合は空文字を返します。 [`String`](/sql-reference/data-types/string)

**例**

クエリ：

```sql
CREATE TABLE jsons
(
    `json` String
)
ENGINE = Memory;

INSERT INTO jsons VALUES ('{"foo":"-4e3"}');
INSERT INTO jsons VALUES ('{"foo":-3.4}');
INSERT INTO jsons VALUES ('{"foo":5}');
INSERT INTO jsons VALUES ('{"foo":{"def":[1,2,3]}}');
INSERT INTO jsons VALUES ('{"baz":2}');

SELECT simpleJSONExtractRaw(json, 'foo') FROM jsons ORDER BY json;
```

結果：

```response

"-4e3"
-3.4
5
{"def":[1,2,3]}
```
### simpleJSONExtractString {#simplejsonextractstring}

`field_name` という名前のフィールドの値から二重引用符で囲まれた `String` を解析します。

**構文**

```sql
simpleJSONExtractString(json, field_name)
```

エイリアス: `visitParamExtractString`。

**パラメータ**

- `json` — フィールドが検索されるJSON。 [String](/sql-reference/data-types/string)
- `field_name` — 検索するフィールドの名前。 [String literal](/sql-reference/syntax#string)

**返される値**

- フィールドが二重引用符で囲まれた文字列を含む場合は、フィールドの非エスケープ値を文字列として返します。フィールドが二重引用符で囲まれた文字列を含まない場合や、非エスケープに失敗した場合、フィールドが存在しない場合は空文字列が返されます。 [String](../data-types/string.md)。

**実装詳細**

現在、基本多言語平面に含まれない形式 `\uXXXX\uYYYY` のコードポイントのサポートはありません（これらはUTF-8ではなくCESU-8に変換されます）。

**例**

クエリ：

```sql
CREATE TABLE jsons
(
    `json` String
)
ENGINE = Memory;

INSERT INTO jsons VALUES ('{"foo":"\\n\\u0000"}');
INSERT INTO jsons VALUES ('{"foo":"\\u263"}');
INSERT INTO jsons VALUES ('{"foo":"\\u263a"}');
INSERT INTO jsons VALUES ('{"foo":"hello}');

SELECT simpleJSONExtractString(json, 'foo') FROM jsons ORDER BY json;
```

結果：

```response
\n\0

☺

```
## JSONExtract 関数 {#jsonextract-functions}

以下の関数は、[simdjson](https://github.com/lemire/simdjson) に基づいており、より複雑なJSON解析の要件に対応するために設計されています。
### isValidJSON {#isvalidjson}

渡された文字列が有効なJSONであるかどうかを確認します。

**構文**

```sql
isValidJSON(json)
```

**例**

```sql
SELECT isValidJSON('{"a": "hello", "b": [-100, 200.0, 300]}') = 1
SELECT isValidJSON('not a json') = 0
```
### JSONHas {#jsonhas}

値がJSON文書に存在する場合は `1` が返されます。値が存在しない場合は `0` が返されます。

**構文**

```sql
JSONHas(json [, indices_or_keys]...)
```

**パラメータ**

- `json` — 解析するJSON文字列。 [String](../data-types/string.md)。
- `indices_or_keys` — 0個以上の引数のリストで、各引数は文字列または整数のいずれかです。 [String](../data-types/string.md)、 [Int*](../data-types/int-uint.md)。

`indices_or_keys` の型：
- 文字列 = キーでオブジェクトメンバーにアクセスします。
- 正の整数 = 先頭から n 番目のメンバー/キーにアクセスします。
- 負の整数 = 終わりから n 番目のメンバー/キーにアクセスします。

**返される値**

- `json` に値が存在する場合は `1` を、そうでない場合は `0` を返します。 [UInt8](../data-types/int-uint.md)。

**例**

クエリ：

```sql
SELECT JSONHas('{"a": "hello", "b": [-100, 200.0, 300]}', 'b') = 1
SELECT JSONHas('{"a": "hello", "b": [-100, 200.0, 300]}', 'b', 4) = 0
```

要素の最小インデックスは1です。したがって、要素0は存在しません。整数を使用して、JSON配列とJSONオブジェクトの両方にアクセスできます。例えば：

```sql
SELECT JSONExtractKey('{"a": "hello", "b": [-100, 200.0, 300]}', 1) = 'a'
SELECT JSONExtractKey('{"a": "hello", "b": [-100, 200.0, 300]}', 2) = 'b'
SELECT JSONExtractKey('{"a": "hello", "b": [-100, 200.0, 300]}', -1) = 'b'
SELECT JSONExtractKey('{"a": "hello", "b": [-100, 200.0, 300]}', -2) = 'a'
SELECT JSONExtractString('{"a": "hello", "b": [-100, 200.0, 300]}', 1) = 'hello'
```
### JSONLength {#jsonlength}

JSON配列またはJSONオブジェクトの長さを返します。値が存在しない場合やタイプが誤っている場合は `0` が返されます。

**構文**

```sql
JSONLength(json [, indices_or_keys]...)
```

**パラメータ**

- `json` — 解析するJSON文字列。 [String](../data-types/string.md)。
- `indices_or_keys` — 0個以上の引数のリストで、各引数は文字列または整数のいずれかです。 [String](../data-types/string.md)、 [Int*](../data-types/int-uint.md)。

`indices_or_keys` の型：
- 文字列 = キーでオブジェクトメンバーにアクセスします。
- 正の整数 = 先頭から n 番目のメンバー/キーにアクセスします。
- 負の整数 = 終わりから n 番目のメンバー/キーにアクセスします。

**返される値**

- JSON配列またはJSONオブジェクトの長さを返します。存在しない場合やタイプが誤っている場合は `0` を返します。 [UInt64](../data-types/int-uint.md)。

**例**

```sql
SELECT JSONLength('{"a": "hello", "b": [-100, 200.0, 300]}', 'b') = 3
SELECT JSONLength('{"a": "hello", "b": [-100, 200.0, 300]}') = 2
```
### JSONType {#jsontype}

JSON値のタイプを返します。値が存在しない場合は `Null=0` が返されます（通常の [Null](../data-types/nullable.md) ではなく、 `Enum8('Null' = 0, 'String' = 34,...)` の `Null=0` です）。

**構文**

```sql
JSONType(json [, indices_or_keys]...)
```

**パラメータ**

- `json` — 解析するJSON文字列。 [String](../data-types/string.md)。
- `indices_or_keys` — 0個以上の引数のリストで、各引数は文字列または整数のいずれかです。 [String](../data-types/string.md)、 [Int*](../data-types/int-uint.md)。

`indices_or_keys` の型：
- 文字列 = キーでオブジェクトメンバーにアクセスします。
- 正の整数 = 先頭から n 番目のメンバー/キーにアクセスします。
- 負の整数 = 終わりから n 番目のメンバー/キーにアクセスします。

**返される値**

- JSON値のタイプを文字列として返します。存在しない場合は `Null=0` を返します。 [Enum](../data-types/enum.md)。

**例**

```sql
SELECT JSONType('{"a": "hello", "b": [-100, 200.0, 300]}') = 'Object'
SELECT JSONType('{"a": "hello", "b": [-100, 200.0, 300]}', 'a') = 'String'
SELECT JSONType('{"a": "hello", "b": [-100, 200.0, 300]}', 'b') = 'Array'
```
### JSONExtractUInt {#jsonextractuint}

JSONを解析し、UInt型の値を抽出します。

**構文**

```sql
JSONExtractUInt(json [, indices_or_keys]...)
```

**パラメータ**

- `json` — 解析するJSON文字列。 [String](../data-types/string.md)。
- `indices_or_keys` — 0個以上の引数のリストで、各引数は文字列または整数のいずれかです。 [String](../data-types/string.md)、 [Int*](../data-types/int-uint.md)。

`indices_or_keys` の型：
- 文字列 = キーでオブジェクトメンバーにアクセスします。
- 正の整数 = 先頭から n 番目のメンバー/キーにアクセスします。
- 負の整数 = 終わりから n 番目のメンバー/キーにアクセスします。

**返される値**

- 存在すればUInt値を返し、そうでなければ `0` を返します。 [UInt64](../data-types/int-uint.md)。

**例**

クエリ：

```sql
SELECT JSONExtractUInt('{"a": "hello", "b": [-100, 200.0, 300]}', 'b', -1) as x, toTypeName(x);
```

結果：

```response
┌───x─┬─toTypeName(x)─┐
│ 300 │ UInt64        │
└─────┴───────────────┘
```
### JSONExtractInt {#jsonextractint}

JSONを解析し、Int型の値を抽出します。

**構文**

```sql
JSONExtractInt(json [, indices_or_keys]...)
```

**パラメータ**

- `json` — 解析するJSON文字列。 [String](../data-types/string.md)。
- `indices_or_keys` — 0個以上の引数のリストで、各引数は文字列または整数のいずれかです。 [String](../data-types/string.md)、 [Int*](../data-types/int-uint.md)。

`indices_or_keys` の型：
- 文字列 = キーでオブジェクトメンバーにアクセスします。
- 正の整数 = 先頭から n 番目のメンバー/キーにアクセスします。
- 負の整数 = 終わりから n 番目のメンバー/キーにアクセスします。

**返される値**

- 存在すればInt値を返し、そうでなければ `0` を返します。 [Int64](../data-types/int-uint.md)。

**例**

クエリ：

```sql
SELECT JSONExtractInt('{"a": "hello", "b": [-100, 200.0, 300]}', 'b', -1) as x, toTypeName(x);
```

結果：

```response
┌───x─┬─toTypeName(x)─┐
│ 300 │ Int64         │
└─────┴───────────────┘
```
### JSONExtractFloat {#jsonextractfloat}

JSONを解析し、Float型の値を抽出します。

**構文**

```sql
JSONExtractFloat(json [, indices_or_keys]...)
```

**パラメータ**

- `json` — 解析するJSON文字列。 [String](../data-types/string.md)。
- `indices_or_keys` — 0個以上の引数のリストで、各引数は文字列または整数のいずれかです。 [String](../data-types/string.md)、 [Int*](../data-types/int-uint.md)。

`indices_or_keys` の型：
- 文字列 = キーでオブジェクトメンバーにアクセスします。
- 正の整数 = 先頭から n 番目のメンバー/キーにアクセスします。
- 負の整数 = 終わりから n 番目のメンバー/キーにアクセスします。

**返される値**

- 存在すればFloat値を返し、そうでなければ `0` を返します。 [Float64](../data-types/float.md)。

**例**

クエリ：

```sql
SELECT JSONExtractFloat('{"a": "hello", "b": [-100, 200.0, 300]}', 'b', 2) as x, toTypeName(x);
```

結果：

```response
┌───x─┬─toTypeName(x)─┐
│ 200 │ Float64       │
└─────┴───────────────┘
```
### JSONExtractBool {#jsonextractbool}

JSONを解析し、ブール値を抽出します。値が存在しないか、タイプが間違っている場合は `0` が返されます。

**構文**

```sql
JSONExtractBool(json[, indices_or_keys]...)
```

**パラメータ**

- `json` — 解析するJSON文字列。 [String](../data-types/string.md)。
- `indices_or_keys` — 0個以上の引数のリストで、各引数は文字列または整数のいずれかです。 [String](../data-types/string.md)、 [Int*](../data-types/int-uint.md)。

`indices_or_keys` の型：
- 文字列 = キーでオブジェクトメンバーにアクセスします。
- 正の整数 = 先頭から n 番目のメンバー/キーにアクセスします。
- 負の整数 = 終わりから n 番目のメンバー/キーにアクセスします。

**返される値**

- 存在すればブール値を返し、そうでなければ `0` を返します。 [Bool](../data-types/boolean.md)。

**例**

クエリ：

```sql
SELECT JSONExtractBool('{"passed": true}', 'passed');
```

結果：

```response
┌─JSONExtractBool('{"passed": true}', 'passed')─┐
│                                             1 │
└───────────────────────────────────────────────┘
```
### JSONExtractString {#jsonextractstring}

JSONを解析し、文字列を抽出します。この関数は [`visitParamExtractString`](#simplejsonextractstring) 関数と類似しています。値が存在しないか、タイプが間違っている場合は空文字列が返されます。

**構文**

```sql
JSONExtractString(json [, indices_or_keys]...)
```

**パラメータ**

- `json` — 解析するJSON文字列。 [String](../data-types/string.md)。
- `indices_or_keys` — 0個以上の引数のリストで、各引数は文字列または整数のいずれかです。 [String](../data-types/string.md)、 [Int*](../data-types/int-uint.md)。

`indices_or_keys` の型：
- 文字列 = キーでオブジェクトメンバーにアクセスします。
- 正の整数 = 先頭から n 番目のメンバー/キーにアクセスします。
- 負の整数 = 終わりから n 番目のメンバー/キーにアクセスします。

**返される値**

- JSONからエスケープされていない文字列を返します。エスケープに失敗した場合、値が存在しない場合、またはタイプが間違っている場合は空文字列を返します。 [String](../data-types/string.md)。

**例**

```sql
SELECT JSONExtractString('{"a": "hello", "b": [-100, 200.0, 300]}', 'a') = 'hello'
SELECT JSONExtractString('{"abc":"\\n\\u0000"}', 'abc') = '\n\0'
SELECT JSONExtractString('{"abc":"\\u263a"}', 'abc') = '☺'
SELECT JSONExtractString('{"abc":"\\u263"}', 'abc') = ''
SELECT JSONExtractString('{"abc":"hello}', 'abc') = ''
```
### JSONExtract {#jsonextract}

JSONを解析し、指定されたClickHouseデータ型の値を抽出します。この関数は、以前の `JSONExtract<type>` 関数の一般化バージョンです。つまり：

`JSONExtract(..., 'String')` は `JSONExtractString()` と全く同じものを返し、
`JSONExtract(..., 'Float64')` は `JSONExtractFloat()` と全く同じものを返します。

**構文**

```sql
JSONExtract(json [, indices_or_keys...], return_type)
```

**パラメータ**

- `json` — 解析するJSON文字列。 [String](../data-types/string.md)。
- `indices_or_keys` — 0個以上の引数のリストで、各引数は文字列または整数のいずれかです。 [String](../data-types/string.md)、 [Int*](../data-types/int-uint.md)。
- `return_type` — 抽出する値の型を指定する文字列。 [String](../data-types/string.md)。

`indices_or_keys` の型：
- 文字列 = キーでオブジェクトメンバーにアクセスします。
- 正の整数 = 先頭から n 番目のメンバー/キーにアクセスします。
- 負の整数 = 終わりから n 番目のメンバー/キーにアクセスします。

**返される値**

- 存在すれば指定された返却型の値を返し、そうでなければ `0`、`Null`、または返却型に応じて空文字列を返します。 [UInt64](../data-types/int-uint.md)、 [Int64](../data-types/int-uint.md)、 [Float64](../data-types/float.md)、 [Bool](../data-types/boolean.md) または [String](../data-types/string.md)。

**例**

```sql
SELECT JSONExtract('{"a": "hello", "b": [-100, 200.0, 300]}', 'Tuple(String, Array(Float64))') = ('hello',[-100,200,300])
SELECT JSONExtract('{"a": "hello", "b": [-100, 200.0, 300]}', 'Tuple(b Array(Float64), a String)') = ([-100,200,300],'hello')
SELECT JSONExtract('{"a": "hello", "b": "world"}', 'Map(String, String)') = map('a',  'hello', 'b', 'world');
SELECT JSONExtract('{"a": "hello", "b": [-100, 200.0, 300]}', 'b', 'Array(Nullable(Int8))') = [-100, NULL, NULL]
SELECT JSONExtract('{"a": "hello", "b": [-100, 200.0, 300]}', 'b', 4, 'Nullable(Int64)') = NULL
SELECT JSONExtract('{"passed": true}', 'passed', 'UInt8') = 1
SELECT JSONExtract('{"day": "Thursday"}', 'day', 'Enum8(\'Sunday\' = 0, \'Monday\' = 1, \'Tuesday\' = 2, \'Wednesday\' = 3, \'Thursday\' = 4, \'Friday\' = 5, \'Saturday\' = 6)') = 'Thursday'
SELECT JSONExtract('{"day": 5}', 'day', 'Enum8(\'Sunday\' = 0, \'Monday\' = 1, \'Tuesday\' = 2, \'Wednesday\' = 3, \'Thursday\' = 4, \'Friday\' = 5, \'Saturday\' = 6)') = 'Friday'
```

ネストされた値を参照するために、複数の `indices_or_keys` パラメータを渡します：
```sql
SELECT JSONExtract('{"a":{"b":"hello","c":{"d":[1,2,3],"e":[1,3,7]}}}','a','c','Map(String, Array(UInt8))') AS val, toTypeName(val), val['d'];
```
結果：
```response
┌─val───────────────────────┬─toTypeName(val)───────────┬─arrayElement(val, 'd')─┐
│ {'d':[1,2,3],'e':[1,3,7]} │ Map(String, Array(UInt8)) │ [1,2,3]                │
└───────────────────────────┴───────────────────────────┴────────────────────────┘
```
### JSONExtractKeysAndValues {#jsonextractkeysandvalues}

JSONからキーと値のペアを解析します。値は指定されたClickHouseデータ型です。

**構文**

```sql
JSONExtractKeysAndValues(json [, indices_or_keys...], value_type)
```

**パラメータ**

- `json` — 解析するJSON文字列。 [String](../data-types/string.md)。
- `indices_or_keys` — 0個以上の引数のリストで、各引数は文字列または整数のいずれかです。 [String](../data-types/string.md)、 [Int*](../data-types/int-uint.md)。
- `value_type` — 抽出する値の型を指定する文字列。 [String](../data-types/string.md)。

`indices_or_keys` の型：
- 文字列 = キーでオブジェクトメンバーにアクセスします。
- 正の整数 = 先頭から n 番目のメンバー/キーにアクセスします。
- 負の整数 = 終わりから n 番目のメンバー/キーにアクセスします。

**返される値**

- 解析されたキーと値のペアの配列を返します。 [Array](../data-types/array.md)([Tuple](../data-types/tuple.md)(`value_type`))。

**例**

```sql
SELECT JSONExtractKeysAndValues('{"x": {"a": 5, "b": 7, "c": 11}}', 'x', 'Int8') = [('a',5),('b',7),('c',11)];
```
### JSONExtractKeys {#jsonextractkeys}

JSON文字列を解析し、キーを抽出します。

**構文**

```sql
JSONExtractKeys(json[, a, b, c...])
```

**パラメータ**

- `json` — 有効なJSONを持つ [String](../data-types/string.md)。
- `a, b, c...` — ネストされたJSONオブジェクト内の内部フィールドへのパスを指定する、カンマ区切りのインデックスまたはキー。各引数は文字列（キーでフィールドを取得）または整数（N番目のフィールドを取得）である必要があります（インデックスは1から始まり、負の整数は後ろから数えます）。設定しない場合、全体がトップレベルオブジェクトとして解析されます。オプションのパラメータです。

**返される値**

- JSONのキーの配列を返します。 [Array](../data-types/array.md)([String](../data-types/string.md))。

**例**

クエリ：

```sql
SELECT JSONExtractKeys('{"a": "hello", "b": [-100, 200.0, 300]}');
```

結果：

```response
┌─JSONExtractKeys('{"a": "hello", "b": [-100, 200.0, 300]}')─┐
│ ['a','b']                                                  │
└────────────────────────────────────────────────────────────┘
```
### JSONExtractRaw {#jsonextractraw}

JSONの一部を未解析の文字列として返します。部分が存在しない場合やタイプが間違っている場合は、空文字列が返されます。

**構文**

```sql
JSONExtractRaw(json [, indices_or_keys]...)
```

**パラメータ**

- `json` — 解析するJSON文字列。 [String](../data-types/string.md)。
- `indices_or_keys` — 0個以上の引数のリストで、各引数は文字列または整数のいずれかです。 [String](../data-types/string.md)、 [Int*](../data-types/int-uint.md)。

`indices_or_keys` の型：
- 文字列 = キーでオブジェクトメンバーにアクセスします。
- 正の整数 = 先頭から n 番目のメンバー/キーにアクセスします。
- 負の整数 = 終わりから n 番目のメンバー/キーにアクセスします。

**返される値**

- JSONの一部を未解析の文字列として返します。部分が存在しない場合やタイプが間違っている場合は、空文字列が返されます。 [String](../data-types/string.md)。

**例**

```sql
SELECT JSONExtractRaw('{"a": "hello", "b": [-100, 200.0, 300]}', 'b') = '[-100, 200.0, 300]';
```
### JSONExtractArrayRaw {#jsonextractarrayraw}

JSON配列の要素を未解析の文字列として表す配列を返します。部分が存在しない場合や配列でない場合は空の配列が返されます。

**構文**

```sql
JSONExtractArrayRaw(json [, indices_or_keys...])
```

**パラメータ**

- `json` — 解析するJSON文字列。 [String](../data-types/string.md)。
- `indices_or_keys` — 0個以上の引数のリストで、各引数は文字列または整数のいずれかです。 [String](../data-types/string.md)、 [Int*](../data-types/int-uint.md)。

`indices_or_keys` の型：
- 文字列 = キーでオブジェクトメンバーにアクセスします。
- 正の整数 = 先頭から n 番目のメンバー/キーにアクセスします。
- 負の整数 = 終わりから n 番目のメンバー/キーにアクセスします。

**返される値**

- JSON配列の要素を未解析の文字列として表す配列を返します。存在しない場合や配列でない場合は空の配列が返されます。 [Array](../data-types/array.md)([String](../data-types/string.md))。

**例**

```sql
SELECT JSONExtractArrayRaw('{"a": "hello", "b": [-100, 200.0, "hello"]}', 'b') = ['-100', '200.0', '"hello"'];
```
### JSONExtractKeysAndValuesRaw {#jsonextractkeysandvaluesraw}

JSONオブジェクトから生データを抽出します。

**構文**

```sql
JSONExtractKeysAndValuesRaw(json[, p, a, t, h])
```

**引数**

- `json` — 有効なJSONを持つ [String](../data-types/string.md)。
- `p, a, t, h` — ネストされたJSONオブジェクト内の内部フィールドへのパスを指定する、カンマ区切りのインデックスまたはキー。各引数は文字列（キーでフィールドを取得）または整数（N番目のフィールドを取得）である必要があります（インデックスは1から始まり、負の整数は後ろから数えます）。設定しない場合、全体がトップレベルオブジェクトとして解析されます。オプションのパラメータです。

**返される値**

- `('key', 'value')` タプルの配列。両方のタプルメンバーは文字列です。 [Array](../data-types/array.md)([Tuple](../data-types/tuple.md)([String](../data-types/string.md), [String](../data-types/string.md)))。
- リクエストされたオブジェクトが存在しない場合や、入力JSONが無効な場合は空の配列。 [Array](../data-types/array.md)([Tuple](../data-types/tuple.md)([String](../data-types/string.md), [String](../data-types/string.md)))。

**例**

クエリ：

```sql
SELECT JSONExtractKeysAndValuesRaw('{"a": [-100, 200.0], "b":{"c": {"d": "hello", "f": "world"}}}');
```

結果：

```text
┌─JSONExtractKeysAndValuesRaw('{"a": [-100, 200.0], "b":{"c": {"d": "hello", "f": "world"}}}')─┐
│ [('a','[-100,200]'),('b','{"c":{"d":"hello","f":"world"}}')]                                 │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
```

クエリ：

```sql
SELECT JSONExtractKeysAndValuesRaw('{"a": [-100, 200.0], "b":{"c": {"d": "hello", "f": "world"}}}', 'b');
```

結果：

```text
┌─JSONExtractKeysAndValuesRaw('{"a": [-100, 200.0], "b":{"c": {"d": "hello", "f": "world"}}}', 'b')─┐
│ [('c','{"d":"hello","f":"world"}')]                                                               │
└───────────────────────────────────────────────────────────────────────────────────────────────────┘
```

クエリ：

```sql
SELECT JSONExtractKeysAndValuesRaw('{"a": [-100, 200.0], "b":{"c": {"d": "hello", "f": "world"}}}', -1, 'c');
```

結果：

```text
┌─JSONExtractKeysAndValuesRaw('{"a": [-100, 200.0], "b":{"c": {"d": "hello", "f": "world"}}}', -1, 'c')─┐
│ [('d','"hello"'),('f','"world"')]                                                                     │
└───────────────────────────────────────────────────────────────────────────────────────────────────────┘
```
### JSON_EXISTS {#json_exists}

値がJSON文書に存在する場合は `1` が返されます。値が存在しない場合は `0` が返されます。

**構文**

```sql
JSON_EXISTS(json, path)
```

**パラメータ**

- `json` — 有効なJSONを持つ文字列。 [String](../data-types/string.md)。 
- `path` — パスを表す文字列。 [String](../data-types/string.md)。

:::note
バージョン21.11以前では、引数の順序が誤っていました。すなわち、 `JSON_EXISTS(path, json)` でした。
:::

**返される値**

- 値がJSON文書に存在する場合は `1` を、そうでない場合は `0` を返します。

**例**

```sql
SELECT JSON_EXISTS('{"hello":1}', '$.hello');
SELECT JSON_EXISTS('{"hello":{"world":1}}', '$.hello.world');
SELECT JSON_EXISTS('{"hello":["world"]}', '$.hello[*]');
SELECT JSON_EXISTS('{"hello":["world"]}', '$.hello[0]');
```
### JSON_QUERY {#json_query}

JSONを解析し、JSON配列またはJSONオブジェクトとして値を抽出します。値が存在しない場合は空文字列が返されます。

**構文**

```sql
JSON_QUERY(json, path)
```

**パラメータ**

- `json` — 有効なJSONを持つ文字列。 [String](../data-types/string.md)。 
- `path` — パスを表す文字列。 [String](../data-types/string.md)。

:::note
バージョン21.11以前では、引数の順序が誤っていました。すなわち、 `JSON_EXISTS(path, json)` でした。
:::

**返される値**

- 抽出された値をJSON配列またはJSONオブジェクトとして返します。存在しない場合は空文字列が返されます。 [String](../data-types/string.md)。

**例**

クエリ：

```sql
SELECT JSON_QUERY('{"hello":"world"}', '$.hello');
SELECT JSON_QUERY('{"array":[[0, 1, 2, 3, 4, 5], [0, -1, -2, -3, -4, -5]]}', '$.array[*][0 to 2, 4]');
SELECT JSON_QUERY('{"hello":2}', '$.hello');
SELECT toTypeName(JSON_QUERY('{"hello":2}', '$.hello'));
```

結果：

```text
["world"]
[0, 1, 4, 0, -1, -4]
[2]
String
```
```
```yaml
title: 'JSON_VALUE'
sidebar_label: 'JSON_VALUE'
keywords: ['JSON', '解析', 'クエリ']
description: 'JSONを解析し、値をJSONスカラーとして抽出します。'
```

### JSON_VALUE {#json_value}

JSONを解析し、値をJSONスカラーとして抽出します。値が存在しない場合、デフォルトで空文字列が返されます。

この関数は以下の設定によって制御されます：

- `function_json_value_return_type_allow_nullable` を `SET` で `true`に設定すると、`NULL`が返されます。値が複雑な型（例：構造体、配列、マップ）の場合、デフォルトで空文字列が返されます。
- `function_json_value_return_type_allow_complex` を `SET` で `true`に設定すると、複雑な値が返されます。

**構文**

```sql
JSON_VALUE(json, path)
```

**パラメータ**

- `json` — 有効なJSONを含む文字列。[String](../data-types/string.md)。
- `path` — パスを表す文字列。[String](../data-types/string.md)。

:::note
バージョン21.11以前は、引数の順序が間違っていました。すなわち、JSON_EXISTS(path, json)です。
:::

**返される値**

- 抽出された値が存在する場合はJSONスカラーとして返され、存在しない場合は空文字列が返されます。[String](../data-types/string.md)。

**例**

クエリ:

```sql
SELECT JSON_VALUE('{"hello":"world"}', '$.hello');
SELECT JSON_VALUE('{"array":[[0, 1, 2, 3, 4, 5], [0, -1, -2, -3, -4, -5]]}', '$.array[*][0 to 2, 4]');
SELECT JSON_VALUE('{"hello":2}', '$.hello');
SELECT toTypeName(JSON_VALUE('{"hello":2}', '$.hello'));
select JSON_VALUE('{"hello":"world"}', '$.b') settings function_json_value_return_type_allow_nullable=true;
select JSON_VALUE('{"hello":{"world":"!"}}', '$.hello') settings function_json_value_return_type_allow_complex=true;
```

結果:

```text
world
0
2
String
```

```yaml
title: 'toJSONString'
sidebar_label: 'toJSONString'
keywords: ['JSON', 'シリアライズ']
description: '値をそのJSON表現にシリアライズします。'
```

### toJSONString {#tojsonstring}

値をそのJSON表現にシリアライズします。さまざまなデータ型とネストされた構造がサポートされています。
64ビットの[整数](../data-types/int-uint.md)またはそれ以上（`UInt64`や`Int128`など）は、デフォルトで引用符で囲まれます。[output_format_json_quote_64bit_integers](/operations/settings/formats#output_format_json_quote_64bit_integers)がこの挙動を制御します。
特別な値`NaN`および`inf`は`null`に置き換えられます。[output_format_json_quote_denormals](/operations/settings/formats#output_format_json_quote_denormals)設定を有効にすると、それらが表示されます。
[Enum](../data-types/enum.md)値をシリアライズする際、関数はその名前を出力します。

**構文**

```sql
toJSONString(value)
```

**引数**

- `value` — シリアライズする値。値は任意のデータ型であることができます。

**返される値**

- 値のJSON表現。[String](../data-types/string.md)。

**例**

最初の例は[Map](../data-types/map.md)のシリアライズを示します。
2番目の例は、特別な値を[Tuple](../data-types/tuple.md)でラップしたものを示します。

クエリ:

```sql
SELECT toJSONString(map('key1', 1, 'key2', 2));
SELECT toJSONString(tuple(1.25, NULL, NaN, +inf, -inf, [])) SETTINGS output_format_json_quote_denormals = 1;
```

結果:

```text
{"key1":1,"key2":2}
[1.25,null,"nan","inf","-inf",[]]
```

**参照**

- [output_format_json_quote_64bit_integers](/operations/settings/formats#output_format_json_quote_64bit_integers)
- [output_format_json_quote_denormals](/operations/settings/formats#output_format_json_quote_denormals)

```yaml
title: 'JSONArrayLength'
sidebar_label: 'JSONArrayLength'
keywords: ['JSON', '配列', '長さ']
description: '最外部JSON配列の要素数を返します。'
```

### JSONArrayLength {#jsonarraylength}

最外部のJSON配列の要素数を返します。入力JSON文字列が無効な場合、この関数はNULLを返します。

**構文**

```sql
JSONArrayLength(json)
```

エイリアス: `JSON_ARRAY_LENGTH(json)`。

**引数**

- `json` — 有効なJSONを含む[String](../data-types/string.md)。

**返される値**

- `json`が有効なJSON配列文字列である場合、配列の要素数を返します。それ以外の場合はNULLを返します。[Nullable(UInt64)](../data-types/int-uint.md)。

**例**

```sql
SELECT
    JSONArrayLength(''),
    JSONArrayLength('[1,2,3]')

┌─JSONArrayLength('')─┬─JSONArrayLength('[1,2,3]')─┐
│                ᴺᵁᴸᴸ │                          3 │
└─────────────────────┴────────────────────────────┘
```

```yaml
title: 'jsonMergePatch'
sidebar_label: 'jsonMergePatch'
keywords: ['JSON', 'マージ', 'オブジェクト']
description: '複数のJSONオブジェクトをマージしたJSONオブジェクト文字列を返します。'
```

### jsonMergePatch {#jsonmergepatch}

複数のJSONオブジェクトをマージしたJSONオブジェクト文字列を返します。

**構文**

```sql
jsonMergePatch(json1, json2, ...)
```

**引数**

- `json` — 有効なJSONを含む[String](../data-types/string.md)。

**返される値**

- JSONオブジェクト文字列が有効な場合、マージされたJSONオブジェクト文字列を返します。[String](../data-types/string.md)。

**例**

```sql
SELECT jsonMergePatch('{"a":1}', '{"name": "joey"}', '{"name": "tom"}', '{"name": "zoey"}') AS res

┌─res───────────────────┐
│ {"a":1,"name":"zoey"} │
└───────────────────────┘
```

```yaml
title: 'JSONAllPaths'
sidebar_label: 'JSONAllPaths'
keywords: ['JSON', 'パス', '列']
description: 'JSON列に格納されている各行のすべてのパスのリストを返します。'
```

### JSONAllPaths {#jsonallpaths}

[JSON](../data-types/newjson.md)列に格納されている各行のすべてのパスのリストを返します。

**構文**

```sql
JSONAllPaths(json)
```

**引数**

- `json` — [JSON](../data-types/newjson.md)。

**返される値**

- パスの配列。[Array(String)](../data-types/array.md)。

**例**

```sql
CREATE TABLE test (json JSON(max_dynamic_paths=1)) ENGINE = Memory;
INSERT INTO test FORMAT JSONEachRow {"json" : {"a" : 42}}, {"json" : {"b" : "Hello"}}, {"json" : {"a" : [1, 2, 3], "c" : "2020-01-01"}}
SELECT json, JSONAllPaths(json) FROM test;
```

```response
┌─json─────────────────────────────────┬─JSONAllPaths(json)─┐
│ {"a":"42"}                           │ ['a']              │
│ {"b":"Hello"}                        │ ['b']              │
│ {"a":["1","2","3"],"c":"2020-01-01"} │ ['a','c']          │
└──────────────────────────────────────┴────────────────────┘
```

```yaml
title: 'JSONAllPathsWithTypes'
sidebar_label: 'JSONAllPathsWithTypes'
keywords: ['JSON', 'データ型', 'パス']
description: '各行に格納されているすべてのパスとそのデータ型のマップを返します。'
```

### JSONAllPathsWithTypes {#jsonallpathswithtypes}

[JSON](../data-types/newjson.md)列に格納されている各行のすべてのパスとそのデータ型のマップを返します。

**構文**

```sql
JSONAllPathsWithTypes(json)
```

**引数**

- `json` — [JSON](../data-types/newjson.md)。

**返される値**

- パスの配列。[Map(String, String)](../data-types/array.md)。

**例**

```sql
CREATE TABLE test (json JSON(max_dynamic_paths=1)) ENGINE = Memory;
INSERT INTO test FORMAT JSONEachRow {"json" : {"a" : 42}}, {"json" : {"b" : "Hello"}}, {"json" : {"a" : [1, 2, 3], "c" : "2020-01-01"}}
SELECT json, JSONAllPathsWithTypes(json) FROM test;
```

```response
┌─json─────────────────────────────────┬─JSONAllPathsWithTypes(json)───────────────┐
│ {"a":"42"}                           │ {'a':'Int64'}                             │
│ {"b":"Hello"}                        │ {'b':'String'}                            │
│ {"a":["1","2","3"],"c":"2020-01-01"} │ {'a':'Array(Nullable(Int64))','c':'Date'} │
└──────────────────────────────────────┴───────────────────────────────────────────┘
```

```yaml
title: 'JSONDynamicPaths'
sidebar_label: 'JSONDynamicPaths'
keywords: ['JSON', '動的パス']
description: 'JSON列に格納されている動的パスのリストを返します。'
```

### JSONDynamicPaths {#jsondynamicpaths}

[JSON](../data-types/newjson.md)列に格納されている動的パスを返します。

**構文**

```sql
JSONDynamicPaths(json)
```

**引数**

- `json` — [JSON](../data-types/newjson.md)。

**返される値**

- パスの配列。[Array(String)](../data-types/array.md)。

**例**

```sql
CREATE TABLE test (json JSON(max_dynamic_paths=1)) ENGINE = Memory;
INSERT INTO test FORMAT JSONEachRow {"json" : {"a" : 42}}, {"json" : {"b" : "Hello"}}, {"json" : {"a" : [1, 2, 3], "c" : "2020-01-01"}}
SELECT json, JSONDynamicPaths(json) FROM test;
```

```response
┌─json─────────────────────────────────┬─JSONDynamicPaths(json)─┐
| {"a":"42"}                           │ ['a']                  │
│ {"b":"Hello"}                        │ []                     │
│ {"a":["1","2","3"],"c":"2020-01-01"} │ ['a']                  │
└──────────────────────────────────────┴────────────────────────┘
```

```yaml
title: 'JSONDynamicPathsWithTypes'
sidebar_label: 'JSONDynamicPathsWithTypes'
keywords: ['JSON', '動的パス', 'データ型']
description: '動的パスとその型を持つマップを返します。'
```

### JSONDynamicPathsWithTypes {#jsondynamicpathswithtypes}

[JSON](../data-types/newjson.md)列に格納されている動的パスとその型を持つマップを返します。

**構文**

```sql
JSONAllPathsWithTypes(json)
```

**引数**

- `json` — [JSON](../data-types/newjson.md)。

**返される値**

- パスの配列。[Map(String, String)](../data-types/array.md)。

**例**

```sql
CREATE TABLE test (json JSON(max_dynamic_paths=1)) ENGINE = Memory;
INSERT INTO test FORMAT JSONEachRow {"json" : {"a" : 42}}, {"json" : {"b" : "Hello"}}, {"json" : {"a" : [1, 2, 3], "c" : "2020-01-01"}}
SELECT json, JSONDynamicPathsWithTypes(json) FROM test;
```

```response
┌─json─────────────────────────────────┬─JSONDynamicPathsWithTypes(json)─┐
│ {"a":"42"}                           │ {'a':'Int64'}                   │
│ {"b":"Hello"}                        │ {}                              │
│ {"a":["1","2","3"],"c":"2020-01-01"} │ {'a':'Array(Nullable(Int64))'}  │
└──────────────────────────────────────┴─────────────────────────────────┘
```

```yaml
title: 'JSONSharedDataPaths'
sidebar_label: 'JSONSharedDataPaths'
keywords: ['JSON', '共有データパス']
description: '共有データ構造に格納されているパスのリストを返します。'
```

### JSONSharedDataPaths {#jsonshareddatapaths}

JSON列に格納されている共有データ構造のパスのリストを返します。

**構文**

```sql
JSONSharedDataPaths(json)
```

**引数**

- `json` — [JSON](../data-types/newjson.md)。

**返される値**

- パスの配列。[Array(String)](../data-types/array.md)。

**例**

```sql
CREATE TABLE test (json JSON(max_dynamic_paths=1)) ENGINE = Memory;
INSERT INTO test FORMAT JSONEachRow {"json" : {"a" : 42}}, {"json" : {"b" : "Hello"}}, {"json" : {"a" : [1, 2, 3], "c" : "2020-01-01"}}
SELECT json, JSONSharedDataPaths(json) FROM test;
```

```response
┌─json─────────────────────────────────┬─JSONSharedDataPaths(json)─┐
│ {"a":"42"}                           │ []                        │
│ {"b":"Hello"}                        │ ['b']                     │
│ {"a":["1","2","3"],"c":"2020-01-01"} │ ['c']                     │
└──────────────────────────────────────┴───────────────────────────┘
```

```yaml
title: 'JSONSharedDataPathsWithTypes'
sidebar_label: 'JSONSharedDataPathsWithTypes'
keywords: ['JSON', '共有データパス', 'データ型']
description: '共有データ構造に格納されているパスとその型のマップを返します。'
```

### JSONSharedDataPathsWithTypes {#jsonshareddatapathswithtypes}

共有データ構造に格納されているパスとその型のマップを返します。

**構文**

```sql
JSONSharedDataPathsWithTypes(json)
```

**引数**

- `json` — [JSON](../data-types/newjson.md)。

**返される値**

- パスの配列。[Map(String, String)](../data-types/array.md)。

**例**

```sql
CREATE TABLE test (json JSON(max_dynamic_paths=1)) ENGINE = Memory;
INSERT INTO test FORMAT JSONEachRow {"json" : {"a" : 42}}, {"json" : {"b" : "Hello"}}, {"json" : {"a" : [1, 2, 3], "c" : "2020-01-01"}}
SELECT json, JSONSharedDataPathsWithTypes(json) FROM test;
```

```response
┌─json─────────────────────────────────┬─JSONSharedDataPathsWithTypes(json)─┐
│ {"a":"42"}                           │ {}                                 │
│ {"b":"Hello"}                        │ {'b':'String'}                     │
│ {"a":["1","2","3"],"c":"2020-01-01"} │ {'c':'Date'}                       │
└──────────────────────────────────────┴────────────────────────────────────┘
```
