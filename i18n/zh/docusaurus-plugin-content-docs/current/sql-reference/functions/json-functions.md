---
'description': 'JSON Functions 的文档'
'sidebar_label': 'JSON'
'sidebar_position': 105
'slug': '/sql-reference/functions/json-functions'
'title': 'JSON 函数'
---

There are two sets of functions to parse JSON:
   - [`simpleJSON*` (`visitParam*`)](#simplejson-visitparam-functions) 用于快速解析受限子集的 JSON。
   - [`JSONExtract*`](#jsonextract-functions) 用于解析普通 JSON。

## simpleJSON (visitParam) functions {#simplejson-visitparam-functions}

ClickHouse 具有用于简化 JSON 的特殊函数。所有这些 JSON 函数都基于对 JSON 可能的强假设。它们尽量做最少的事情，以尽快完成工作。

做出以下假设：

1.  字段名称（函数参数）必须是常量。
2.  字段名称以某种方式在 JSON 中以规范形式编码。例如： `simpleJSONHas('{"abc":"def"}', 'abc') = 1`，但 `simpleJSONHas('{"\\u0061\\u0062\\u0063":"def"}', 'abc') = 0`
3.  在任意嵌套级别上，字段不加区分地进行搜索。如果存在多个匹配字段，则使用第一个匹配项。
4.  JSON 的字符串文字外部没有空格字符。

### simpleJSONHas {#simplejsonhas}

检查是否存在名为 `field_name` 的字段。结果是 `UInt8`。

**语法**

```sql
simpleJSONHas(json, field_name)
```

别名： `visitParamHas`。

**参数**

- `json` — 要搜索字段的 JSON。 [String](/sql-reference/data-types/string)
- `field_name` — 要搜索的字段的名称。 [String literal](/sql-reference/syntax#string)

**返回值**

- 如果字段存在，则返回 `1`，否则返回 `0`。 [UInt8](../data-types/int-uint.md)。

**示例**

查询：

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

结果：

```response
1
0
```

### simpleJSONExtractUInt {#simplejsonextractuint}

从名为 `field_name` 的字段值解析 `UInt64`。如果这是一个字符串字段，它会尝试从字符串的开头解析一个数字。如果字段不存在，或者字段存在但不包含数字，则返回 `0`。

**语法**

```sql
simpleJSONExtractUInt(json, field_name)
```

别名： `visitParamExtractUInt`。

**参数**

- `json` — 要搜索字段的 JSON。 [String](/sql-reference/data-types/string)
- `field_name` — 要搜索的字段的名称。 [String literal](/sql-reference/syntax#string)

**返回值**

- 如果字段存在并且包含数字，则返回从字段解析出的数字， 否则返回 `0`。 [UInt64](../data-types/int-uint.md)。

**示例**

查询：

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

结果：

```response
0
4
0
3
5
```

### simpleJSONExtractInt {#simplejsonextractint}

从名为 `field_name` 的字段值解析 `Int64`。如果这是一个字符串字段，它会尝试从字符串的开头解析一个数字。如果字段不存在，或者字段存在但不包含数字，则返回 `0`。

**语法**

```sql
simpleJSONExtractInt(json, field_name)
```

别名： `visitParamExtractInt`。

**参数**

- `json` — 要搜索字段的 JSON。 [String](/sql-reference/data-types/string)
- `field_name` — 要搜索的字段的名称。 [String literal](/sql-reference/syntax#string)

**返回值**

- 如果字段存在并且包含数字，则返回从字段解析出的数字， 否则返回 `0`。 [Int64](../data-types/int-uint.md)。

**示例**

查询：

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

结果：

```response
0
-4
0
-3
5
```

### simpleJSONExtractFloat {#simplejsonextractfloat}

从名为 `field_name` 的字段值解析 `Float64`。如果这是一个字符串字段，它会尝试从字符串的开头解析一个数字。如果字段不存在，或者字段存在但不包含数字，则返回 `0`。

**语法**

```sql
simpleJSONExtractFloat(json, field_name)
```

别名： `visitParamExtractFloat`。

**参数**

- `json` — 要搜索字段的 JSON。 [String](/sql-reference/data-types/string)
- `field_name` — 要搜索的字段的名称。 [String literal](/sql-reference/syntax#string)

**返回值**

- 如果字段存在并且包含数字，则返回从字段解析出的数字， 否则返回 `0`。 [Float64](/sql-reference/data-types/float)。

**示例**

查询：

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

结果：

```response
0
-4000
0
-3.4
5
```

### simpleJSONExtractBool {#simplejsonextractbool}

从名为 `field_name` 的字段值解析 true/false 值。结果为 `UInt8`。

**语法**

```sql
simpleJSONExtractBool(json, field_name)
```

别名： `visitParamExtractBool`。

**参数**

- `json` — 要搜索字段的 JSON。 [String](/sql-reference/data-types/string)
- `field_name` — 要搜索的字段的名称。 [String literal](/sql-reference/syntax#string)

**返回值**

如果字段的值为 `true`，则返回 `1`，否则返回 `0`。这意味着该函数将返回 `0` 包括（而不仅仅是在以下情况下）：
 - 如果字段不存在。
 - 如果字段包含的值为 “true” 的字符串，例如： `{"field":"true"}`。
 - 如果字段包含的值为 `1` 的数值。

**示例**

查询：

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

结果：

```response
0
1
0
0
```

### simpleJSONExtractRaw {#simplejsonextractraw}

返回名为 `field_name` 的字段的值作为 `String`，包括分隔符。

**语法**

```sql
simpleJSONExtractRaw(json, field_name)
```

别名： `visitParamExtractRaw`。

**参数**

- `json` — 要搜索字段的 JSON。 [String](/sql-reference/data-types/string)
- `field_name` — 要搜索的字段的名称。 [String literal](/sql-reference/syntax#string)

**返回值**

- 如果字段存在，则返回字段的值作为字符串，包括分隔符，否则返回空字符串。 [`String`](/sql-reference/data-types/string)

**示例**

查询：

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

结果：

```response

"-4e3"
-3.4
5
{"def":[1,2,3]}
```

### simpleJSONExtractString {#simplejsonextractstring}

从名为 `field_name` 的字段值中解析 `String`（用双引号括起来）。

**语法**

```sql
simpleJSONExtractString(json, field_name)
```

别名： `visitParamExtractString`。

**参数**

- `json` — 要搜索字段的 JSON。 [String](/sql-reference/data-types/string)
- `field_name` — 要搜索的字段的名称。 [String literal](/sql-reference/syntax#string)

**返回值**

- 返回字段的未转义值作为字符串，包括分隔符。如果字段不包含用双引号括起来的字符串，如果解码失败或字段不存在，则返回空字符串。 [String](../data-types/string.md)。

**实现细节**

目前不支持格式为 `\uXXXX\uYYYY` 的代码点，它们被转换为 CESU-8，而不是 UTF-8。

**示例**

查询：

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

结果：

```response
\n\0

☺

```

## JSONExtract functions {#jsonextract-functions}

以下函数基于 [simdjson](https://github.com/lemire/simdjson)，旨在满足更复杂的 JSON 解析要求。

### isValidJSON {#isvalidjson}

检查传递的字符串是否是有效 JSON。

**语法**

```sql
isValidJSON(json)
```

**示例**

```sql
SELECT isValidJSON('{"a": "hello", "b": [-100, 200.0, 300]}') = 1
SELECT isValidJSON('not a json') = 0
```

### JSONHas {#jsonhas}

如果值在 JSON 文档中存在，将返回 `1`。如果值不存在，将返回 `0`。

**语法**

```sql
JSONHas(json [, indices_or_keys]...)
```

**参数**

- `json` — 要解析的 JSON 字符串。 [String](../data-types/string.md)。
- `indices_or_keys` — 一个零个或多个参数的列表，每个参数可以是字符串或整数。 [String](../data-types/string.md)， [Int*](../data-types/int-uint.md)。

`indices_or_keys` 类型：
- 字符串 = 通过键访问对象成员。
- 正整数 = 从头开始访问第 n 个成员/键。
- 负整数 = 从尾部访问第 n 个成员/键。

**返回值**

- 如果值在 `json` 中存在，则返回 `1`，否则返回 `0`。 [UInt8](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT JSONHas('{"a": "hello", "b": [-100, 200.0, 300]}', 'b') = 1
SELECT JSONHas('{"a": "hello", "b": [-100, 200.0, 300]}', 'b', 4) = 0
```

元素的最小索引为 1。因此，元素 0 不存在。您可以使用整数访问 JSON 数组和 JSON 对象。例如：

```sql
SELECT JSONExtractKey('{"a": "hello", "b": [-100, 200.0, 300]}', 1) = 'a'
SELECT JSONExtractKey('{"a": "hello", "b": [-100, 200.0, 300]}', 2) = 'b'
SELECT JSONExtractKey('{"a": "hello", "b": [-100, 200.0, 300]}', -1) = 'b'
SELECT JSONExtractKey('{"a": "hello", "b": [-100, 200.0, 300]}', -2) = 'a'
SELECT JSONExtractString('{"a": "hello", "b": [-100, 200.0, 300]}', 1) = 'hello'
```

### JSONLength {#jsonlength}

返回 JSON 数组或 JSON 对象的长度。如果值不存在或类型不正确，将返回 `0`。

**语法**

```sql
JSONLength(json [, indices_or_keys]...)
```

**参数**

- `json` — 要解析的 JSON 字符串。 [String](../data-types/string.md)。
- `indices_or_keys` — 一个零个或多个参数的列表，每个参数可以是字符串或整数。 [String](../data-types/string.md)， [Int*](../data-types/int-uint.md)。

`indices_or_keys` 类型：
- 字符串 = 通过键访问对象成员。
- 正整数 = 从头开始访问第 n 个成员/键。
- 负整数 = 从尾部访问第 n 个成员/键。

**返回值**

- 返回 JSON 数组或 JSON 对象的长度。如果值不存在或者类型不正确，则返回 `0`。 [UInt64](../data-types/int-uint.md)。

**示例**

```sql
SELECT JSONLength('{"a": "hello", "b": [-100, 200.0, 300]}', 'b') = 3
SELECT JSONLength('{"a": "hello", "b": [-100, 200.0, 300]}') = 2
```

### JSONType {#jsontype}

返回 JSON 值的类型。如果值不存在，将返回 `Null=0`（不是通常的 [Null](../data-types/nullable.md)，而是 `Enum8('Null' = 0, 'String' = 34,...`)。

**语法**

```sql
JSONType(json [, indices_or_keys]...)
```

**参数**

- `json` — 要解析的 JSON 字符串。 [String](../data-types/string.md)。
- `indices_or_keys` — 一个零个或多个参数的列表，每个参数可以是字符串或整数。 [String](../data-types/string.md)， [Int*](../data-types/int-uint.md)。

`indices_or_keys` 类型：
- 字符串 = 通过键访问对象成员。
- 正整数 = 从头开始访问第 n 个成员/键。
- 负整数 = 从尾部访问第 n 个成员/键。

**返回值**

- 返回 JSON 值的类型作为字符串，如果值不存在则返回 `Null=0`。 [Enum](../data-types/enum.md)。

**示例**

```sql
SELECT JSONType('{"a": "hello", "b": [-100, 200.0, 300]}') = 'Object'
SELECT JSONType('{"a": "hello", "b": [-100, 200.0, 300]}', 'a') = 'String'
SELECT JSONType('{"a": "hello", "b": [-100, 200.0, 300]}', 'b') = 'Array'
```

### JSONExtractUInt {#jsonextractuint}

解析 JSON 并提取 UInt 类型的值。

**语法**

```sql
JSONExtractUInt(json [, indices_or_keys]...)
```

**参数**

- `json` — 要解析的 JSON 字符串。 [String](../data-types/string.md)。
- `indices_or_keys` — 一个零个或多个参数的列表，每个参数可以是字符串或整数。 [String](../data-types/string.md)， [Int*](../data-types/int-uint.md)。

`indices_or_keys` 类型：
- 字符串 = 通过键访问对象成员。
- 正整数 = 从头开始访问第 n 个成员/键。
- 负整数 = 从尾部访问第 n 个成员/键。

**返回值**

- 如果存在，则返回 UInt 值，否则返回 `0`。 [UInt64](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT JSONExtractUInt('{"a": "hello", "b": [-100, 200.0, 300]}', 'b', -1) as x, toTypeName(x);
```

结果：

```response
┌───x─┬─toTypeName(x)─┐
│ 300 │ UInt64        │
└─────┴───────────────┘
```

### JSONExtractInt {#jsonextractint}

解析 JSON 并提取 Int 类型的值。

**语法**

```sql
JSONExtractInt(json [, indices_or_keys]...)
```

**参数**

- `json` — 要解析的 JSON 字符串。 [String](../data-types/string.md)。
- `indices_or_keys` — 一个零个或多个参数的列表，每个参数可以是字符串或整数。 [String](../data-types/string.md)， [Int*](../data-types/int-uint.md)。

`indices_or_keys` 类型：
- 字符串 = 通过键访问对象成员。
- 正整数 = 从头开始访问第 n 个成员/键。
- 负整数 = 从尾部访问第 n 个成员/键。

**返回值**

- 如果存在，则返回 Int 值，否则返回 `0`。 [Int64](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT JSONExtractInt('{"a": "hello", "b": [-100, 200.0, 300]}', 'b', -1) as x, toTypeName(x);
```

结果：

```response
┌───x─┬─toTypeName(x)─┐
│ 300 │ Int64         │
└─────┴───────────────┘
```

### JSONExtractFloat {#jsonextractfloat}

解析 JSON 并提取 Float 类型的值。

**语法**

```sql
JSONExtractFloat(json [, indices_or_keys]...)
```

**参数**

- `json` — 要解析的 JSON 字符串。 [String](../data-types/string.md)。
- `indices_or_keys` — 一个零个或多个参数的列表，每个参数可以是字符串或整数。 [String](../data-types/string.md)， [Int*](../data-types/int-uint.md)。

`indices_or_keys` 类型：
- 字符串 = 通过键访问对象成员。
- 正整数 = 从头开始访问第 n 个成员/键。
- 负整数 = 从尾部访问第 n 个成员/键。

**返回值**

- 如果存在，则返回 Float 值，否则返回 `0`。 [Float64](../data-types/float.md)。

**示例**

查询：

```sql
SELECT JSONExtractFloat('{"a": "hello", "b": [-100, 200.0, 300]}', 'b', 2) as x, toTypeName(x);
```

结果：

```response
┌───x─┬─toTypeName(x)─┐
│ 200 │ Float64       │
└─────┴───────────────┘
```

### JSONExtractBool {#jsonextractbool}

解析 JSON 并提取布尔值。如果值不存在或类型不正确，则返回 `0`。

**语法**

```sql
JSONExtractBool(json\[, indices_or_keys\]...)
```

**参数**

- `json` — 要解析的 JSON 字符串。 [String](../data-types/string.md)。
- `indices_or_keys` — 一个零个或多个参数的列表，每个参数可以是字符串或整数。 [String](../data-types/string.md)， [Int*](../data-types/int-uint.md)。

`indices_or_keys` 类型：
- 字符串 = 通过键访问对象成员。
- 正整数 = 从头开始访问第 n 个成员/键。
- 负整数 = 从尾部访问第 n 个成员/键。

**返回值**

- 返回布尔值如果存在，否则返回 `0`。 [Bool](../data-types/boolean.md)。

**示例**

查询：

```sql
SELECT JSONExtractBool('{"passed": true}', 'passed');
```

结果：

```response
┌─JSONExtractBool('{"passed": true}', 'passed')─┐
│                                             1 │
└───────────────────────────────────────────────┘
```

### JSONExtractString {#jsonextractstring}

解析 JSON 并提取字符串。此函数与 [`visitParamExtractString`](#simplejsonextractstring) 函数类似。如果值不存在或类型不正确，将返回空字符串。

**语法**

```sql
JSONExtractString(json [, indices_or_keys]...)
```

**参数**

- `json` — 要解析的 JSON 字符串。 [String](../data-types/string.md)。
- `indices_or_keys` — 一个零个或多个参数的列表，每个参数可以是字符串或整数。 [String](../data-types/string.md)， [Int*](../data-types/int-uint.md)。

`indices_or_keys` 类型：
- 字符串 = 通过键访问对象成员。
- 正整数 = 从头开始访问第 n 个成员/键。
- 负整数 = 从尾部访问第 n 个成员/键。

**返回值**

- 返回从 `json` 提取的未经转义的字符串。如果解码失败，如果值不存在或类型不正确，则返回空字符串。 [String](../data-types/string.md)。

**示例**

```sql
SELECT JSONExtractString('{"a": "hello", "b": [-100, 200.0, 300]}', 'a') = 'hello'
SELECT JSONExtractString('{"abc":"\\n\\u0000"}', 'abc') = '\n\0'
SELECT JSONExtractString('{"abc":"\\u263a"}', 'abc') = '☺'
SELECT JSONExtractString('{"abc":"\\u263"}', 'abc') = ''
SELECT JSONExtractString('{"abc":"hello}', 'abc') = ''
```

### JSONExtract {#jsonextract}

解析 JSON 并提取指定 ClickHouse 数据类型的值。此函数是前面 `JSONExtract<type>` 函数的通用版本。含义：

`JSONExtract(..., 'String')` 返回与 `JSONExtractString()` 完全相同，
`JSONExtract(..., 'Float64')` 返回与 `JSONExtractFloat()` 完全相同。

**语法**

```sql
JSONExtract(json [, indices_or_keys...], return_type)
```

**参数**

- `json` — 要解析的 JSON 字符串。 [String](../data-types/string.md)。
- `indices_or_keys` — 一个零个或多个参数的列表，每个参数可以是字符串或整数。 [String](../data-types/string.md)， [Int*](../data-types/int-uint.md)。
- `return_type` — 指定要提取的值类型的字符串。 [String](../data-types/string.md)。 

`indices_or_keys` 类型：
- 字符串 = 通过键访问对象成员。
- 正整数 = 从头开始访问第 n 个成员/键。
- 负整数 = 从尾部访问第 n 个成员/键。

**返回值**

- 返回指定返回类型的值（如果存在），否则会根据指定的返回类型返回 `0`、`Null` 或空字符串。 [UInt64](../data-types/int-uint.md)、[Int64](../data-types/int-uint.md)、[Float64](../data-types/float.md)、[Bool](../data-types/boolean.md) 或 [String](../data-types/string.md)。

**示例**

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

通过传递多个 indices_or_keys 参数引用嵌套值：
```sql
SELECT JSONExtract('{"a":{"b":"hello","c":{"d":[1,2,3],"e":[1,3,7]}}}','a','c','Map(String, Array(UInt8))') AS val, toTypeName(val), val['d'];
```
结果：
```response
┌─val───────────────────────┬─toTypeName(val)───────────┬─arrayElement(val, 'd')─┐
│ {'d':[1,2,3],'e':[1,3,7]} │ Map(String, Array(UInt8)) │ [1,2,3]                │
└───────────────────────────┴───────────────────────────┴────────────────────────┘
```

### JSONExtractKeysAndValues {#jsonextractkeysandvalues}

从 JSON 中解析键值对，其中值是指定的 ClickHouse 数据类型。

**语法**

```sql
JSONExtractKeysAndValues(json [, indices_or_keys...], value_type)
```

**参数**

- `json` — 要解析的 JSON 字符串。 [String](../data-types/string.md)。
- `indices_or_keys` — 一个零个或多个参数的列表，每个参数可以是字符串或整数。 [String](../data-types/string.md)， [Int*](../data-types/int-uint.md)。
- `value_type` — 指定要提取的值的类型的字符串。 [String](../data-types/string.md)。 

`indices_or_keys` 类型：
- 字符串 = 通过键访问对象成员。
- 正整数 = 从头开始访问第 n 个成员/键。
- 负整数 = 从尾部访问第 n 个成员/键。

**返回值**

- 返回解析的键值对数组。 [Array](../data-types/array.md)([Tuple](../data-types/tuple.md)(`value_type`))。 

**示例**

```sql
SELECT JSONExtractKeysAndValues('{"x": {"a": 5, "b": 7, "c": 11}}', 'x', 'Int8') = [('a',5),('b',7),('c',11)];
```

### JSONExtractKeys {#jsonextractkeys}

解析 JSON 字符串并提取键。

**语法**

```sql
JSONExtractKeys(json[, a, b, c...])
```

**参数**

- `json` — [String](../data-types/string.md) 有效 JSON。
- `a, b, c...` — 逗号分隔的索引或键，指定在嵌套 JSON 对象中内部字段的路径。每个参数可以是 [String](../data-types/string.md)通过键获取字段，或 [Integer](../data-types/int-uint.md) 获取第 N 个字段（从 1 开始索引，负整数从结尾计数）。如果未设置，则将整个 JSON 作为顶级对象解析。可选参数。

**返回值**

- 返回 JSON 的键数组。 [Array](../data-types/array.md)([String](../data-types/string.md))。

**示例**

查询：

```sql
SELECT JSONExtractKeys('{"a": "hello", "b": [-100, 200.0, 300]}');
```

结果：

```response
┌─JSONExtractKeys('{"a": "hello", "b": [-100, 200.0, 300]}')─┐
│ ['a','b']                                                  │
└────────────────────────────────────────────────────────────┘
```

### JSONExtractRaw {#jsonextractraw}

将 JSON 的一部分作为未解析的字符串返回。如果该部分不存在或类型不正确，则返回空字符串。

**语法**

```sql
JSONExtractRaw(json [, indices_or_keys]...)
```

**参数**

- `json` — 要解析的 JSON 字符串。 [String](../data-types/string.md)。
- `indices_or_keys` — 一个零个或多个参数的列表，每个参数可以是字符串或整数。 [String](../data-types/string.md)， [Int*](../data-types/int-uint.md)。

`indices_or_keys` 类型：
- 字符串 = 通过键访问对象成员。
- 正整数 = 从头开始访问第 n 个成员/键。
- 负整数 = 从尾部访问第 n 个成员/键。

**返回值**

- 将 JSON 的一部分作为未解析的字符串返回。如果该部分不存在或类型不正确，则返回空字符串。 [String](../data-types/string.md)。

**示例**

```sql
SELECT JSONExtractRaw('{"a": "hello", "b": [-100, 200.0, 300]}', 'b') = '[-100, 200.0, 300]';
```

### JSONExtractArrayRaw {#jsonextractarrayraw}

返回 JSON 数组的元素数组，每个元素表示为未解析的字符串。如果该部分不存在或不是数组，则返回空数组。

**语法**

```sql
JSONExtractArrayRaw(json [, indices_or_keys...])
```

**参数**

- `json` — 要解析的 JSON 字符串。 [String](../data-types/string.md)。
- `indices_or_keys` — 一个零个或多个参数的列表，每个参数可以是字符串或整数。 [String](../data-types/string.md)， [Int*](../data-types/int-uint.md)。

`indices_or_keys` 类型：
- 字符串 = 通过键访问对象成员。
- 正整数 = 从头开始访问第 n 个成员/键。
- 负整数 = 从尾部访问第 n 个成员/键。

**返回值**

- 返回 JSON 数组的元素数组，每个元素表示为未解析的字符串。否则，如果该部分不存在或不是数组，则返回空数组。 [Array](../data-types/array.md)([String](../data-types/string.md))。

**示例**

```sql
SELECT JSONExtractArrayRaw('{"a": "hello", "b": [-100, 200.0, "hello"]}', 'b') = ['-100', '200.0', '"hello"'];
```

### JSONExtractKeysAndValuesRaw {#jsonextractkeysandvaluesraw}

从 JSON 对象中提取原始数据。

**语法**

```sql
JSONExtractKeysAndValuesRaw(json[, p, a, t, h])
```

**参数**

- `json` — [String](../data-types/string.md) 有效 JSON。
- `p, a, t, h` — 逗号分隔的索引或键，指定在嵌套 JSON 对象中内部字段的路径。每个参数可以是 [string](../data-types/string.md) 通过键获取字段，或 [integer](../data-types/int-uint.md) 获取第 N 个字段（从 1 开始索引，负整数从结尾计数）。如果未设置，则整个 JSON 作为顶级对象解析。可选参数。

**返回值**

- 返回 `('key', 'value')` 元组的数组。两个元组成员都为字符串。 [Array](../data-types/array.md)([Tuple](../data-types/tuple.md)([String](../data-types/string.md), [String](../data-types/string.md)))。
- 如果请求的对象不存在，或输入 JSON 无效，则返回空数组。 [Array](../data-types/array.md)([Tuple](../data-types/tuple.md)([String](../data-types/string.md), [String](../data-types/string.md)))。

**示例**

查询：

```sql
SELECT JSONExtractKeysAndValuesRaw('{"a": [-100, 200.0], "b":{"c": {"d": "hello", "f": "world"}}}');
```

结果：

```text
┌─JSONExtractKeysAndValuesRaw('{"a": [-100, 200.0], "b":{"c": {"d": "hello", "f": "world"}}}')─┐
│ [('a','[-100,200]'),('b','{"c":{"d":"hello","f":"world"}}')]                                 │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
```

查询：

```sql
SELECT JSONExtractKeysAndValuesRaw('{"a": [-100, 200.0], "b":{"c": {"d": "hello", "f": "world"}}}', 'b');
```

结果：

```text
┌─JSONExtractKeysAndValuesRaw('{"a": [-100, 200.0], "b":{"c": {"d": "hello", "f": "world"}}}', 'b')─┐
│ [('c','{"d":"hello","f":"world"}')]                                                               │
└───────────────────────────────────────────────────────────────────────────────────────────────────┘
```

查询：

```sql
SELECT JSONExtractKeysAndValuesRaw('{"a": [-100, 200.0], "b":{"c": {"d": "hello", "f": "world"}}}', -1, 'c');
```

结果：

```text
┌─JSONExtractKeysAndValuesRaw('{"a": [-100, 200.0], "b":{"c": {"d": "hello", "f": "world"}}}', -1, 'c')─┐
│ [('d','"hello"'),('f','"world"')]                                                                     │
└───────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### JSON_EXISTS {#json_exists}

如果值在 JSON 文档中存在，则返回 `1`。如果值不存在，则返回 `0`。

**语法**

```sql
JSON_EXISTS(json, path)
```

**参数**

- `json` — 有效 JSON 的字符串。 [String](../data-types/string.md)。
- `path` — 表示路径的字符串。 [String](../data-types/string.md)。

:::note
在 21.11 版本之前，参数的顺序是错误的，即 JSON_EXISTS(path, json)
:::

**返回值**

- 如果值存在于 JSON 文档中，则返回 `1`，否则返回 `0`。

**示例**

```sql
SELECT JSON_EXISTS('{"hello":1}', '$.hello');
SELECT JSON_EXISTS('{"hello":{"world":1}}', '$.hello.world');
SELECT JSON_EXISTS('{"hello":["world"]}', '$.hello[*]');
SELECT JSON_EXISTS('{"hello":["world"]}', '$.hello[0]');
```

### JSON_QUERY {#json_query}

解析 JSON 并将值提取为 JSON 数组或 JSON 对象。如果值不存在，则返回空字符串。

**语法**

```sql
JSON_QUERY(json, path)
```

**参数**

- `json` — 有效 JSON 的字符串。 [String](../data-types/string.md)。
- `path` — 表示路径的字符串。 [String](../data-types/string.md)。

:::note
在 21.11 版本之前，参数的顺序是错误的，即 JSON_EXISTS(path, json)
:::

**返回值**

- 返回提取的 JSON 数组或 JSON 对象的值。否则，如果值不存在，则返回空字符串。 [String](../data-types/string.md)。

**示例**

查询：

```sql
SELECT JSON_QUERY('{"hello":"world"}', '$.hello');
SELECT JSON_QUERY('{"array":[[0, 1, 2, 3, 4, 5], [0, -1, -2, -3, -4, -5]]}', '$.array[*][0 to 2, 4]');
SELECT JSON_QUERY('{"hello":2}', '$.hello');
SELECT toTypeName(JSON_QUERY('{"hello":2}', '$.hello'));
```

结果：

```text
["world"]
[0, 1, 4, 0, -1, -4]
[2]
String
```

### JSON_VALUE {#json_value}

解析 JSON 并提取值作为 JSON 标量。如果值不存在，默认情况下返回空字符串。

此函数受以下设置控制：

- 通过 SET `function_json_value_return_type_allow_nullable` = `true`，将返回 `NULL`。如果值是复杂类型（例如：结构、数组、映射），将默认返回空字符串。
- 通过 SET `function_json_value_return_type_allow_complex` = `true`，将返回复杂值。

**语法**

```sql
JSON_VALUE(json, path)
```

**参数**

- `json` — 有效 JSON 的字符串。 [String](../data-types/string.md)。
- `path` — 表示路径的字符串。 [String](../data-types/string.md)。

:::note
在 21.11 版本之前，参数的顺序是错误的，即 JSON_EXISTS(path, json)
:::

**返回值**

- 如果值存在，则作为 JSON 标量返回提取的值，否则返回空字符串。 [String](../data-types/string.md)。

**示例**

查询：

```sql
SELECT JSON_VALUE('{"hello":"world"}', '$.hello');
SELECT JSON_VALUE('{"array":[[0, 1, 2, 3, 4, 5], [0, -1, -2, -3, -4, -5]]}', '$.array[*][0 to 2, 4]');
SELECT JSON_VALUE('{"hello":2}', '$.hello');
SELECT toTypeName(JSON_VALUE('{"hello":2}', '$.hello'));
select JSON_VALUE('{"hello":"world"}', '$.b') settings function_json_value_return_type_allow_nullable=true;
select JSON_VALUE('{"hello":{"world":"!"}}', '$.hello') settings function_json_value_return_type_allow_complex=true;
```

结果：

```text
world
0
2
String
```

### toJSONString {#tojsonstring}

将值序列化为 JSON 表示形式。支持各种数据类型和嵌套结构。
64 位 [整数](../data-types/int-uint.md) 或更大（如 `UInt64` 或 `Int128`）默认用引号括起来。 [output_format_json_quote_64bit_integers](/operations/settings/formats#output_format_json_quote_64bit_integers) 控制此行为。
特定值 `NaN` 和 `inf` 被替换为 `null`。启用 [output_format_json_quote_denormals](/operations/settings/formats#output_format_json_quote_denormals) 设置以显示它们。
在序列化 [Enum](../data-types/enum.md) 值时，函数输出其名称。

**语法**

```sql
toJSONString(value)
```

**参数**

- `value` — 要序列化的值。值可以是任何数据类型。

**返回值**

- 值的 JSON 表示形式。 [String](../data-types/string.md)。

**示例**

第一个示例显示了 [Map](../data-types/map.md) 的序列化。
第二个示例显示了一些特殊值封装在 [Tuple](../data-types/tuple.md) 中。

查询：

```sql
SELECT toJSONString(map('key1', 1, 'key2', 2));
SELECT toJSONString(tuple(1.25, NULL, NaN, +inf, -inf, [])) SETTINGS output_format_json_quote_denormals = 1;
```

结果：

```text
{"key1":1,"key2":2}
[1.25,null,"nan","inf","-inf",[]]
```

**另见**

- [output_format_json_quote_64bit_integers](/operations/settings/formats#output_format_json_quote_64bit_integers)
- [output_format_json_quote_denormals](/operations/settings/formats#output_format_json_quote_denormals)


### JSONArrayLength {#jsonarraylength}

返回最外层 JSON 数组中的元素数量。如果输入 JSON 字符串无效，则函数返回 NULL。

**语法**

```sql
JSONArrayLength(json)
```

别名： `JSON_ARRAY_LENGTH(json)`。

**参数**

- `json` — [String](../data-types/string.md) 有效 JSON。

**返回值**

- 如果 `json` 是有效的 JSON 数组字符串，则返回数组元素的数量，否则返回 NULL。 [Nullable(UInt64)](../data-types/int-uint.md)。

**示例**

```sql
SELECT
    JSONArrayLength(''),
    JSONArrayLength('[1,2,3]')

┌─JSONArrayLength('')─┬─JSONArrayLength('[1,2,3]')─┐
│                ᴺᵁᴸᴸ │                          3 │
└─────────────────────┴────────────────────────────┘
```


### jsonMergePatch {#jsonmergepatch}

返回合并后的 JSON 对象字符串，合并多个 JSON 对象生成。

**语法**

```sql
jsonMergePatch(json1, json2, ...)
```

**参数**

- `json` — [String](../data-types/string.md) 有效 JSON。

**返回值**

- 如果 JSON 对象字符串有效，返回合并后的 JSON 对象字符串。 [String](../data-types/string.md)。

**示例**

```sql
SELECT jsonMergePatch('{"a":1}', '{"name": "joey"}', '{"name": "tom"}', '{"name": "zoey"}') AS res

┌─res───────────────────┐
│ {"a":1,"name":"zoey"} │
└───────────────────────┘
```

### JSONAllPaths {#jsonallpaths}

返回存储在每行的 [JSON](../data-types/newjson.md) 列中的所有路径列表。

**语法**

```sql
JSONAllPaths(json)
```

**参数**

- `json` — [JSON](../data-types/newjson.md)。

**返回值**

- 路径数组。 [Array(String)](../data-types/array.md)。

**示例**

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

返回存储在每行的 [JSON](../data-types/newjson.md) 列中的所有路径及其数据类型的映射。

**语法**

```sql
JSONAllPathsWithTypes(json)
```

**参数**

- `json` — [JSON](../data-types/newjson.md)。

**返回值**

- 路径数组。 [Map(String, String)](../data-types/array.md)。

**示例**

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

返回存储在 [JSON](../data-types/newjson.md) 列中作为单独子列的动态路径列表。

**语法**

```sql
JSONDynamicPaths(json)
```

**参数**

- `json` — [JSON](../data-types/newjson.md)。

**返回值**

- 路径数组。 [Array(String)](../data-types/array.md)。

**示例**

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

返回存储在 [JSON](../data-types/newjson.md) 列中作为单独子列的动态路径及其类型的映射。

**语法**

```sql
JSONAllPathsWithTypes(json)
```

**参数**

- `json` — [JSON](../data-types/newjson.md)。

**返回值**

- 路径数组。 [Map(String, String)](../data-types/array.md)。

**示例**

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

返回存储在 [JSON](../data-types/newjson.md) 列中的共享数据结构中的路径列表。

**语法**

```sql
JSONSharedDataPaths(json)
```

**参数**

- `json` — [JSON](../data-types/newjson.md)。

**返回值**

- 路径数组。 [Array(String)](../data-types/array.md)。

**示例**

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

返回存储在 [JSON](../data-types/newjson.md) 列中共享数据结构及其类型的路径的映射。

**语法**

```sql
JSONSharedDataPathsWithTypes(json)
```

**参数**

- `json` — [JSON](../data-types/newjson.md)。

**返回值**

- 路径数组。 [Map(String, String)](../data-types/array.md)。

**示例**

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

<!-- 
The inner content of the tags below are replaced at doc framework build time with 
docs generated from system.functions. Please do not modify or remove the tags.
See: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
-->

<!--AUTOGENERATED_START-->
<!--AUTOGENERATED_END-->
