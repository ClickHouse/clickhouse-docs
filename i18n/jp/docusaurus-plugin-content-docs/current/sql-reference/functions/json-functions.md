---
'description': 'Documentation for Json Functions'
'sidebar_label': 'JSON'
'sidebar_position': 105
'slug': '/sql-reference/functions/json-functions'
'title': 'JSON Functions'
---



There are two sets of functions to parse JSON:
   - [`simpleJSON*` (`visitParam*`)](#simplejson-visitparam-functions) は、JSONの限られたサブセットを極めて高速に解析するために作られています。
   - [`JSONExtract*`](#jsonextract-functions) は、通常のJSONを解析するために作られています。

## simpleJSON (visitParam) functions {#simplejson-visitparam-functions}

ClickHouseには、簡易化されたJSONを扱うための特別な関数があります。これらのJSON関数は、JSONがどのようなものであり得るかについての強い前提に基づいています。できるだけ少ない操作で、できるだけ早く仕事を済ませることを目指しています。

以下の前提があります：

1.  フィールド名（関数引数）は定数でなければなりません。
2.  フィールド名は何らかの方法でJSONに正規化されてエンコードされています。たとえば： `simpleJSONHas('{"abc":"def"}', 'abc') = 1` ですが、 `simpleJSONHas('{"\\u0061\\u0062\\u0063":"def"}', 'abc') = 0` です。
3.  フィールドは、あらゆるネスティングレベルで無差別に検索されます。複数の一致するフィールドがある場合は、最初の出現が使用されます。
4.  JSONには、文字列リテラル以外の場所に空白文字がありません。

### simpleJSONHas {#simplejsonhas}

`field_name`という名前のフィールドが存在するかどうかをチェックします。結果は `UInt8` です。

**構文**

```sql
simpleJSONHas(json, field_name)
```

エイリアス: `visitParamHas`。

**パラメータ**

- `json` — フィールドが検索されるJSON。 [String](/sql-reference/data-types/string)
- `field_name` — 検索するフィールドの名前。 [String literal](/sql-reference/syntax#string)

**戻り値**

- フィールドが存在する場合は `1` を返し、存在しない場合は `0` を返します。 [UInt8](../data-types/int-uint.md) 。

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

`field_name`という名前のフィールドの値から `UInt64` を解析します。これは文字列フィールドの場合、文字列の先頭から数を解析しようとします。フィールドが存在しない場合、または存在するが数を含まない場合は `0` を返します。

**構文**

```sql
simpleJSONExtractUInt(json, field_name)
```

エイリアス: `visitParamExtractUInt`。

**パラメータ**

- `json` — フィールドが検索されるJSON。 [String](/sql-reference/data-types/string)
- `field_name` — 検索するフィールドの名前。 [String literal](/sql-reference/syntax#string)

**戻り値**

- フィールドが存在し、数を含む場合はその数を返し、そうでない場合は `0` を返します。 [UInt64](../data-types/int-uint.md)。

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

`field_name`という名前のフィールドの値から `Int64` を解析します。これは文字列フィールドの場合、文字列の先頭から数を解析しようとします。フィールドが存在しない場合、または存在するが数を含まない場合は `0` を返します。

**構文**

```sql
simpleJSONExtractInt(json, field_name)
```

エイリアス: `visitParamExtractInt`。

**パラメータ**

- `json` — フィールドが検索されるJSON。 [String](/sql-reference/data-types/string)
- `field_name` — 検索するフィールドの名前。 [String literal](/sql-reference/syntax#string)

**戻り値**

- フィールドが存在し、数を含む場合はその数を返し、そうでない場合は `0` を返します。 [Int64](../data-types/int-uint.md)。

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

`field_name`という名前のフィールドの値から `Float64` を解析します。これは文字列フィールドの場合、文字列の先頭から数を解析しようとします。フィールドが存在しない場合、または存在するが数を含まない場合は `0` を返します。

**構文**

```sql
simpleJSONExtractFloat(json, field_name)
```

エイリアス: `visitParamExtractFloat`。

**パラメータ**

- `json` — フィールドが検索されるJSON。 [String](/sql-reference/data-types/string)
- `field_name` — 検索するフィールドの名前。 [String literal](/sql-reference/syntax#string)

**戻り値**

- フィールドが存在し、数を含む場合はその数を返し、そうでない場合は `0` を返します。 [Float64](/sql-reference/data-types/float)。

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

`field_name`という名前のフィールドの値から真偽値を解析します。結果は `UInt8` です。

**構文**

```sql
simpleJSONExtractBool(json, field_name)
```

エイリアス: `visitParamExtractBool`。

**パラメータ**

- `json` — フィールドが検索されるJSON。 [String](/sql-reference/data-types/string)
- `field_name` — 検索するフィールドの名前。 [String literal](/sql-reference/syntax#string)

**戻り値**

フィールドの値が `true` の場合は `1` を返し、そうでない場合は `0` を返します。この関数は、次のようなケースも含めて `0` を返します。
 - フィールドが存在しない場合。
 - フィールドが文字列として `true` を含む場合、例えば： `{"field":"true"}`。
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

フィールド名 `field_name` の値を区切りを含む `String` として返します。

**構文**

```sql
simpleJSONExtractRaw(json, field_name)
```

エイリアス: `visitParamExtractRaw`。

**パラメータ**

- `json` — フィールドが検索されるJSON。 [String](/sql-reference/data-types/string)
- `field_name` — 検索するフィールドの名前。 [String literal](/sql-reference/syntax#string)

**戻り値**

- フィールドが存在する場合は、区切りを含むフィールドの値を文字列として返し、そうでない場合は空の文字列を返します。 [`String`](/sql-reference/data-types/string)

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

`field_name`という名前のフィールドの値から二重引用符付きの `String` を解析します。

**構文**

```sql
simpleJSONExtractString(json, field_name)
```

エイリアス: `visitParamExtractString`。

**パラメータ**

- `json` — フィールドが検索されるJSON。 [String](/sql-reference/data-types/string)
- `field_name` — 検索するフィールドの名前。 [String literal](/sql-reference/syntax#string)

**戻り値**

- フィールドの値を文字列としてアンエスケープされた形で返します。フィールドが二重引用符付きの文字列を含まない場合や、アンエスケープが失敗した場合、またはフィールドが存在しない場合は空の文字列を返します。 [String](../data-types/string.md)。

**実装の詳細**

現在、基本多言語プレーン以外の `\uXXXX\uYYYY` の形式のコードポイントはサポートされていません（これらはUTF-8ではなくCESU-8に変換されます）。

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

## JSONExtract functions {#jsonextract-functions}

次の関数は [simdjson](https://github.com/lemire/simdjson) に基づいており、より複雑なJSON解析の要件に対応するように設計されています。

### isValidJSON {#isvalidjson}

渡された文字列が有効なJSONかどうかをチェックします。

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

- `json` — 解析するJSON文字列。 [String](../data-types/string.md) 。
- `indices_or_keys` — 文字列または整数のいずれかを指定できるゼロ個以上の引数のリスト。 [String](../data-types/string.md)、 [Int*](../data-types/int-uint.md)。

`indices_or_keys` のタイプ：
- String = キーによってオブジェクトメンバーにアクセスします。
- Positive integer = 開始から n 番目のメンバー/キーにアクセスします。
- Negative integer = 終わりから n 番目のメンバー/キーにアクセスします。

**戻り値**

- 値が `json` に存在する場合は `1` を返し、そうでない場合は `0` を返します。 [UInt8](../data-types/int-uint.md)。

**例**

クエリ：

```sql
SELECT JSONHas('{"a": "hello", "b": [-100, 200.0, 300]}', 'b') = 1
SELECT JSONHas('{"a": "hello", "b": [-100, 200.0, 300]}', 'b', 4) = 0
```

要素の最小インデックスは1です。したがって、要素0は存在しません。整数を使用してJSON配列とJSONオブジェクトの両方にアクセスすることができます。たとえば：

```sql
SELECT JSONExtractKey('{"a": "hello", "b": [-100, 200.0, 300]}', 1) = 'a'
SELECT JSONExtractKey('{"a": "hello", "b": [-100, 200.0, 300]}', 2) = 'b'
SELECT JSONExtractKey('{"a": "hello", "b": [-100, 200.0, 300]}', -1) = 'b'
SELECT JSONExtractKey('{"a": "hello", "b": [-100, 200.0, 300]}', -2) = 'a'
SELECT JSONExtractString('{"a": "hello", "b": [-100, 200.0, 300]}', 1) = 'hello'
```

### JSONLength {#jsonlength}

JSON配列またはJSONオブジェクトの長さを返します。値が存在しないか、間違ったタイプの場合は `0` が返されます。

**構文**

```sql
JSONLength(json [, indices_or_keys]...)
```

**パラメータ**

- `json` — 解析するJSON文字列。 [String](../data-types/string.md) 。
- `indices_or_keys` — 文字列または整数のいずれかを指定できるゼロ個以上の引数のリスト。 [String](../data-types/string.md)、 [Int*](../data-types/int-uint.md)。

`indices_or_keys` のタイプ：
- String = キーによってオブジェクトメンバーにアクセスします。
- Positive integer = 開始から n 番目のメンバー/キーにアクセスします。
- Negative integer = 終わりから n 番目のメンバー/キーにアクセスします。

**戻り値**

- JSON配列またはJSONオブジェクトの長さを返します。存在しない場合や間違ったタイプの場合は `0` を返します。 [UInt64](../data-types/int-uint.md)。

**例**

```sql
SELECT JSONLength('{"a": "hello", "b": [-100, 200.0, 300]}', 'b') = 3
SELECT JSONLength('{"a": "hello", "b": [-100, 200.0, 300]}') = 2
```

### JSONType {#jsontype}

JSON値のタイプを返します。値が存在しない場合は `Null=0` が返されます（通常の [Null](../data-types/nullable.md) ではなく、`Enum8('Null' = 0, 'String' = 34,...)` の `Null=0` です）。

**構文**

```sql
JSONType(json [, indices_or_keys]...)
```

**パラメータ**

- `json` — 解析するJSON文字列。 [String](../data-types/string.md) 。
- `indices_or_keys` — 文字列または整数のいずれかを指定できるゼロ個以上の引数のリスト。 [String](../data-types/string.md)、 [Int*](../data-types/int-uint.md)。

`indices_or_keys` のタイプ：
- String = キーによってオブジェクトメンバーにアクセスします。
- Positive integer = 開始から n 番目のメンバー/キーにアクセスします。
- Negative integer = 終わりから n 番目のメンバー/キーにアクセスします。

**戻り値**

- JSON値のタイプを文字列として返します。値が存在しない場合、 `Null=0` を返します。 [Enum](../data-types/enum.md)。

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

- `json` — 解析するJSON文字列。 [String](../data-types/string.md) 。
- `indices_or_keys` — 文字列または整数のいずれかを指定できるゼロ個以上の引数のリスト。 [String](../data-types/string.md)、 [Int*](../data-types/int-uint.md)。

`indices_or_keys` のタイプ：
- String = キーによってオブジェクトメンバーにアクセスします。
- Positive integer = 開始から n 番目のメンバー/キーにアクセスします。
- Negative integer = 終わりから n 番目のメンバー/キーにアクセスします。

**戻り値**

- 存在する場合はUInt値を返し、そうでない場合は `0` を返します。 [UInt64](../data-types/int-uint.md)。

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

- `json` — 解析するJSON文字列。 [String](../data-types/string.md) 。
- `indices_or_keys` — 文字列または整数のいずれかを指定できるゼロ個以上の引数のリスト。 [String](../data-types/string.md)、 [Int*](../data-types/int-uint.md)。

`indices_or_keys` のタイプ：
- String = キーによってオブジェクトメンバーにアクセスします。
- Positive integer = 開始から n 番目のメンバー/キーにアクセスします。
- Negative integer = 終わりから n 番目のメンバー/キーにアクセスします。

**戻り値**

- 存在する場合はInt値を返し、そうでない場合は `0` を返します。 [Int64](../data-types/int-uint.md)。

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

- `json` — 解析するJSON文字列。 [String](../data-types/string.md) 。
- `indices_or_keys` — 文字列または整数のいずれかを指定できるゼロ個以上の引数のリスト。 [String](../data-types/string.md)、 [Int*](../data-types/int-uint.md)。

`indices_or_keys` のタイプ：
- String = キーによってオブジェクトメンバーにアクセスします。
- Positive integer = 開始から n 番目のメンバー/キーにアクセスします。
- Negative integer = 終わりから n 番目のメンバー/キーにアクセスします。

**戻り値**

- 存在する場合はFloat値を返し、そうでない場合は `0` を返します。 [Float64](../data-types/float.md)。

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

JSONを解析し、ブール値を抽出します。値が存在しないか間違ったタイプの場合は `0` が返されます。

**構文**

```sql
JSONExtractBool(json[, indices_or_keys]...)
```

**パラメータ**

- `json` — 解析するJSON文字列。 [String](../data-types/string.md) 。
- `indices_or_keys` — 文字列または整数のいずれかを指定できるゼロ個以上の引数のリスト。 [String](../data-types/string.md)、 [Int*](../data-types/int-uint.md)。

`indices_or_keys` のタイプ：
- String = キーによってオブジェクトメンバーにアクセスします。
- Positive integer = 開始から n 番目のメンバー/キーにアクセスします。
- Negative integer = 終わりから n 番目のメンバー/キーにアクセスします。

**戻り値**

- 存在する場合はブール値を返し、そうでない場合は `0` を返します。 [Bool](../data-types/boolean.md)。

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

JSONを解析し、文字列を抽出します。この関数は [`visitParamExtractString`](#simplejsonextractstring) 関数と似ています。値が存在しないか間違ったタイプの場合は、空の文字列が返されます。

**構文**

```sql
JSONExtractString(json [, indices_or_keys]...)
```

**パラメータ**

- `json` — 解析するJSON文字列。 [String](../data-types/string.md) 。
- `indices_or_keys` — 文字列または整数のいずれかを指定できるゼロ個以上の引数のリスト。 [String](../data-types/string.md)、 [Int*](../data-types/int-uint.md)。

`indices_or_keys` のタイプ：
- String = キーによってオブジェクトメンバーにアクセスします。
- Positive integer = 開始から n 番目のメンバー/キーにアクセスします。
- Negative integer = 終わりから n 番目のメンバー/キーにアクセスします。

**戻り値**

- JSONからアンエスケープされた文字列を返します。アンエスケープが失敗した場合、存在しない場合、または間違ったタイプの場合は空の文字列を返します。 [String](../data-types/string.md)。

**例**

```sql
SELECT JSONExtractString('{"a": "hello", "b": [-100, 200.0, 300]}', 'a') = 'hello'
SELECT JSONExtractString('{"abc":"\\n\\u0000"}', 'abc') = '\n\0'
SELECT JSONExtractString('{"abc":"\\u263a"}', 'abc') = '☺'
SELECT JSONExtractString('{"abc":"\\u263"}', 'abc') = ''
SELECT JSONExtractString('{"abc":"hello}', 'abc') = ''
```

### JSONExtract {#jsonextract}

JSONを解析し、指定されたClickHouseデータ型の値を抽出します。この関数は、以前の `JSONExtract<type>` 関数の一般化されたバージョンです。つまり：

`JSONExtract(..., 'String')` はまったく同じ結果を返し、`JSONExtractString()`と同じで、 
`JSONExtract(..., 'Float64')` はまったく同じ結果を返し、`JSONExtractFloat()`と同じです。

**構文**

```sql
JSONExtract(json [, indices_or_keys...], return_type)
```

**パラメータ**

- `json` — 解析するJSON文字列。 [String](../data-types/string.md) 。
- `indices_or_keys` — 文字列または整数のいずれかを指定できるゼロ個以上の引数のリスト。 [String](../data-types/string.md)、 [Int*](../data-types/int-uint.md)。
- `return_type` — 抽出する値の型を指定する文字列。 [String](../data-types/string.md) 。

`indices_or_keys` のタイプ：
- String = キーによってオブジェクトメンバーにアクセスします。
- Positive integer = 開始から n 番目のメンバー/キーにアクセスします。
- Negative integer = 終わりから n 番目のメンバー/キーにアクセスします。

**戻り値**

- 指定された型の存在する値を返し、そうでない場合は指定された型に応じて `0` 、 `Null` 、または空文字列を返します。 [UInt64](../data-types/int-uint.md)、 [Int64](../data-types/int-uint.md)、 [Float64](../data-types/float.md)、 [Bool](../data-types/boolean.md) または [String](../data-types/string.md)。

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

ネストされた値を参照するには、複数のindices_or_keysパラメータを渡します：
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

指定されたClickHouseデータ型の値を持つJSONから、キー-値ペアを解析します。

**構文**

```sql
JSONExtractKeysAndValues(json [, indices_or_keys...], value_type)
```

**パラメータ**

- `json` — 解析するJSON文字列。 [String](../data-types/string.md) 。
- `indices_or_keys` — 文字列または整数のいずれかを指定できるゼロ個以上の引数のリスト。 [String](../data-types/string.md)、 [Int*](../data-types/int-uint.md)。
- `value_type` — 抽出する値の型を指定する文字列。 [String](../data-types/string.md) 。

`indices_or_keys` のタイプ：
- String = キーによってオブジェクトメンバーにアクセスします。
- Positive integer = 開始から n 番目のメンバー/キーにアクセスします。
- Negative integer = 終わりから n 番目のメンバー/キーにアクセスします。

**戻り値**

- 解析されたキー-値ペアの配列を返します。 [Array](../data-types/array.md)([Tuple](../data-types/tuple.md)(`value_type`))。

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

- `json` — 有効なJSONの [String](../data-types/string.md) 。
- `a, b, c...` — ネストされたJSONオブジェクト内のフィールドに到達するためのインデックスまたはキーを指定するカンマ区切りの引数。各引数はキーによってフィールドを取得するための [String](../data-types/string.md) または N 番目のフィールドを取得するための [Integer](../data-types/int-uint.md) であるべきです（1から始まるインデックス，負の整数は終了からカウントします）。設定しない場合、全体のJSONがトップレベルのオブジェクトとして解析されます。オプションのパラメータです。

**戻り値**

- JSONのキーを含む配列を返します。 [Array](../data-types/array.md)([String](../data-types/string.md))。

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

JSONの一部を未解析の文字列として返します。部分が存在しないか間違ったタイプの場合、空の文字列が返されます。

**構文**

```sql
JSONExtractRaw(json [, indices_or_keys]...)
```

**パラメータ**

- `json` — 解析するJSON文字列。 [String](../data-types/string.md) 。
- `indices_or_keys` — 文字列または整数のいずれかを指定できるゼロ個以上の引数のリスト。 [String](../data-types/string.md)、 [Int*](../data-types/int-uint.md)。

`indices_or_keys` のタイプ：
- String = キーによってオブジェクトメンバーにアクセスします。
- Positive integer = 開始から n 番目のメンバー/キーにアクセスします。
- Negative integer = 終わりから n 番目のメンバー/キーにアクセスします。

**戻り値**

- JSONの未解析の部分を文字列として返します。部分が存在しないか間違ったタイプの場合、空の文字列が返されます。 [String](../data-types/string.md)。

**例**

```sql
SELECT JSONExtractRaw('{"a": "hello", "b": [-100, 200.0, 300]}', 'b') = '[-100, 200.0, 300]';
```

### JSONExtractArrayRaw {#jsonextractarrayraw}

JSON配列の要素を未解析の文字列として表現された配列を返します。部分が存在しないか配列でない場合は、空の配列が返されます。

**構文**

```sql
JSONExtractArrayRaw(json [, indices_or_keys...])
```

**パラメータ**

- `json` — 解析するJSON文字列。 [String](../data-types/string.md) 。
- `indices_or_keys` — 文字列または整数のいずれかを指定できるゼロ個以上の引数のリスト。 [String](../data-types/string.md)、 [Int*](../data-types/int-uint.md)。

`indices_or_keys` のタイプ：
- String = キーによってオブジェクトメンバーにアクセスします。
- Positive integer = 開始から n 番目のメンバー/キーにアクセスします。
- Negative integer = 終わりから n 番目のメンバー/キーにアクセスします。

**戻り値**

- JSON配列の要素を未解析の文字列として表現した配列を返します。部分が存在しないか配列でない場合は空の配列が返されます。 [Array](../data-types/array.md)([String](../data-types/string.md))。

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

- `json` — 有効なJSONの [String](../data-types/string.md) 。
- `p, a, t, h` — ネストされたJSONオブジェクト内のフィールドに到達するためのインデックスまたはキーを指定するカンマ区切りの引数。各引数はキーによってフィールドを取得するための [string](../data-types/string.md) または N 番目のフィールドを取得するための [integer](../data-types/int-uint.md) であるべきです（1から始まるインデックス，負の整数は終了からカウントします）。設定しない場合、全体のJSONがトップレベルのオブジェクトとして解析されます。オプションのパラメータです。

**戻り値**

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

- `json` — 有効なJSONの文字列。 [String](../data-types/string.md). 
- `path` — 文字列で表現されるパス。 [String](../data-types/string.md)。

:::note
21.11バージョン以前は引数の順序が間違っていました、つまり JSON_EXISTS(path, json)
:::

**戻り値**

- 値がJSON文書に存在する場合は `1` を返し、そうでない場合は `0` を返します。

**例**

```sql
SELECT JSON_EXISTS('{"hello":1}', '$.hello');
SELECT JSON_EXISTS('{"hello":{"world":1}}', '$.hello.world');
SELECT JSON_EXISTS('{"hello":["world"]}', '$.hello[*]');
SELECT JSON_EXISTS('{"hello":["world"]}', '$.hello[0]');
```

### JSON_QUERY {#json_query}

JSONを解析し、JSON配列またはJSONオブジェクトとして値を抽出します。値が存在しない場合、空の文字列が返されます。

**構文**

```sql
JSON_QUERY(json, path)
```

**パラメータ**

- `json` — 有効なJSONの文字列。 [String](../data-types/string.md). 
- `path` — 文字列で表現されるパス。 [String](../data-types/string.md)。

:::note
21.11バージョン以前は引数の順序が間違っていました、つまり JSON_EXISTS(path, json)
:::

**戻り値**

- 抽出した値をJSON配列またはJSONオブジェクトとして返します。そうでない場合、値が存在しないときは空の文字列が返されます。 [String](../data-types/string.md)。

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
### JSON_VALUE {#json_value}

JSONを解析し、値をJSONスカラーとして抽出します。値が存在しない場合は、デフォルトで空文字列が返されます。

この関数は以下の設定によって制御されます：

- SET `function_json_value_return_type_allow_nullable` = `true` の場合、`NULL` が返されます。値が複雑な型（構造体、配列、マップなど）の場合、デフォルトで空文字列が返されます。
- SET `function_json_value_return_type_allow_complex` = `true` の場合、複雑な値が返されます。

**構文**

```sql
JSON_VALUE(json, path)
```

**パラメータ**

- `json` — 有効なJSONを持つ文字列。 [String](../data-types/string.md). 
- `path` — パスを表す文字列。 [String](../data-types/string.md).

:::note
バージョン21.11以前では、引数の順序が誤っていました。すなわち、JSON_EXISTS(path, json) でした。
:::

**返される値**

- 抽出された値が存在する場合は、JSONスカラーとして返され、そうでない場合は空文字列が返されます。 [String](../data-types/string.md).

**例**

クエリ：

```sql
SELECT JSON_VALUE('{"hello":"world"}', '$.hello');
SELECT JSON_VALUE('{"array":[[0, 1, 2, 3, 4, 5], [0, -1, -2, -3, -4, -5]]}', '$.array[*][0 to 2, 4]');
SELECT JSON_VALUE('{"hello":2}', '$.hello');
SELECT toTypeName(JSON_VALUE('{"hello":2}', '$.hello'));
select JSON_VALUE('{"hello":"world"}', '$.b') settings function_json_value_return_type_allow_nullable=true;
select JSON_VALUE('{"hello":{"world":"!"}}', '$.hello') settings function_json_value_return_type_allow_complex=true;
```

結果：

```text
world
0
2
String
```
### toJSONString {#tojsonstring}

値をそのJSON表現にシリアライズします。さまざまなデータ型やネストされた構造がサポートされています。
64ビットの [整数](../data-types/int-uint.md) またはそれ以上（`UInt64`や`Int128`のような）は、デフォルトで引用符で囲まれます。 [output_format_json_quote_64bit_integers](/operations/settings/formats#output_format_json_quote_64bit_integers) がこの動作を制御します。
特別な値`NaN`および`inf`は`null`と置き換えられます。これらを表示するには、[output_format_json_quote_denormals](/operations/settings/formats#output_format_json_quote_denormals) 設定を有効にします。
[Enum](../data-types/enum.md) 値をシリアライズする際には、関数はその名前を出力します。

**構文**

```sql
toJSONString(value)
```

**引数**

- `value` — シリアライズする値。値は任意のデータ型である可能性があります。

**返される値**

- 値のJSON表現。 [String](../data-types/string.md).

**例**

最初の例は、[Map](../data-types/map.md) のシリアライズを示しています。
2番目の例は、[Tuple](../data-types/tuple.md) 内にラップされた特別な値を示しています。

クエリ：

```sql
SELECT toJSONString(map('key1', 1, 'key2', 2));
SELECT toJSONString(tuple(1.25, NULL, NaN, +inf, -inf, [])) SETTINGS output_format_json_quote_denormals = 1;
```

結果：

```text
{"key1":1,"key2":2}
[1.25,null,"nan","inf","-inf",[]]
```

**関連項目**

- [output_format_json_quote_64bit_integers](/operations/settings/formats#output_format_json_quote_64bit_integers)
- [output_format_json_quote_denormals](/operations/settings/formats#output_format_json_quote_denormals)
### JSONArrayLength {#jsonarraylength}

最外部のJSON配列内の要素の数を返します。入力JSON文字列が無効な場合はNULLを返します。

**構文**

```sql
JSONArrayLength(json)
```

エイリアス: `JSON_ARRAY_LENGTH(json)`.

**引数**

- `json` — 有効なJSONを持つ [String](../data-types/string.md).

**返される値**

- `json` が有効なJSON配列文字列である場合、配列の要素数を返し、そうでない場合はNULLを返します。 [Nullable(UInt64)](../data-types/int-uint.md).

**例**

```sql
SELECT
    JSONArrayLength(''),
    JSONArrayLength('[1,2,3]')

┌─JSONArrayLength('')─┬─JSONArrayLength('[1,2,3]')─┐
│                ᴺᵁᴸᴸ │                          3 │
└─────────────────────┴────────────────────────────┘
```
### jsonMergePatch {#jsonmergepatch}

複数のJSONオブジェクトをマージして形成されたマージされたJSONオブジェクト文字列を返します。

**構文**

```sql
jsonMergePatch(json1, json2, ...)
```

**引数**

- `json` — 有効なJSONを持つ [String](../data-types/string.md).

**返される値**

- JSONオブジェクト文字列が有効な場合、マージされたJSONオブジェクト文字列を返します。 [String](../data-types/string.md).

**例**

```sql
SELECT jsonMergePatch('{"a":1}', '{"name": "joey"}', '{"name": "tom"}', '{"name": "zoey"}') AS res

┌─res───────────────────┐
│ {"a":1,"name":"zoey"} │
└───────────────────────┘
```
### JSONAllPaths {#jsonallpaths}

[JSON](../data-types/newjson.md) カラム内の各行に保存されているすべてのパスのリストを返します。

**構文**

```sql
JSONAllPaths(json)
```

**引数**

- `json` — [JSON](../data-types/newjson.md).

**返される値**

- パスの配列。 [Array(String)](../data-types/array.md).

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
### JSONAllPathsWithTypes {#jsonallpathswithtypes}

[JSON](../data-types/newjson.md) カラム内の各行に保存されているすべてのパスとそのデータ型のマップを返します。

**構文**

```sql
JSONAllPathsWithTypes(json)
```

**引数**

- `json` — [JSON](../data-types/newjson.md).

**返される値**

- パスの配列。 [Map(String, String)](../data-types/array.md).

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
### JSONDynamicPaths {#jsondynamicpaths}

[JSON](../data-types/newjson.md) カラム内に保存されている動的パスのリストを返します。

**構文**

```sql
JSONDynamicPaths(json)
```

**引数**

- `json` — [JSON](../data-types/newjson.md).

**返される値**

- パスの配列。 [Array(String)](../data-types/array.md).

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
### JSONDynamicPathsWithTypes {#jsondynamicpathswithtypes}

[JSON](../data-types/newjson.md) カラム内の各行に保存されている動的パスとその型のマップを返します。

**構文**

```sql
JSONDynamicPathsWithTypes(json)
```

**引数**

- `json` — [JSON](../data-types/newjson.md).

**返される値**

- パスの配列。 [Map(String, String)](../data-types/array.md).

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
### JSONSharedDataPaths {#jsonshareddatapaths}

[JSON](../data-types/newjson.md) カラム内に保存されている共有データ構造のパスのリストを返します。

**構文**

```sql
JSONSharedDataPaths(json)
```

**引数**

- `json` — [JSON](../data-types/newjson.md).

**返される値**

- パスの配列。 [Array(String)](../data-types/array.md).

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
### JSONSharedDataPathsWithTypes {#jsonshareddatapathswithtypes}

[JSON](../data-types/newjson.md) カラム内の各行に保存されている共有データ構造のパスとその型のマップを返します。

**構文**

```sql
JSONSharedDataPathsWithTypes(json)
```

**引数**

- `json` — [JSON](../data-types/newjson.md).

**返される値**

- パスの配列。 [Map(String, String)](../data-types/array.md).

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
