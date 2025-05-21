---
'description': 'Json 函数的文档'
'sidebar_label': 'JSON'
'sidebar_position': 105
'slug': '/sql-reference/functions/json-functions'
'title': 'JSON 函数'
---



有两个解析 JSON 的函数集：
   - [`simpleJSON*` (`visitParam*`)](#simplejson-visitparam-functions)，旨在快速解析有限子集的 JSON。
   - [`JSONExtract*`](#jsonextract-functions)，旨在解析普通 JSON。

## simpleJSON (visitParam) 函数 {#simplejson-visitparam-functions}

ClickHouse 具有处理简化 JSON 的特殊函数。所有这些 JSON 函数都基于对 JSON 可能性的强假设。它们尽量做到最少操作以尽快完成任务。

以下假设被提出：

1.  字段名称（函数参数）必须是常量。
2.  字段名称以某种方式在 JSON 中被规范编码。例如：`simpleJSONHas('{"abc":"def"}', 'abc') = 1`，但 `simpleJSONHas('{"\\u0061\\u0062\\u0063":"def"}', 'abc') = 0`
3.  在任何嵌套级别上进行字段搜索，不分辨。 如果存在多个匹配字段，使用第一个出现的字段。
4.  JSON 在字符串文字之外没有空格字符。

### simpleJSONHas {#simplejsonhas}

检查是否存在名为 `field_name` 的字段。结果为 `UInt8`。

**语法**

```sql
simpleJSONHas(json, field_name)
```

别名：`visitParamHas`。

**参数**

- `json` — 要搜索字段的 JSON。[字符串](/sql-reference/data-types/string)
- `field_name` — 要搜索的字段名称。[字符串文字](/sql-reference/syntax#string)

**返回值**

- 如果字段存在，则返回 `1`，否则返回 `0`。[UInt8](../data-types/int-uint.md)。

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

从名为 `field_name` 的字段值中解析 `UInt64`。如果这是一个字符串字段，它会尝试从字符串的开头解析一个数字。如果字段不存在，或者存在但不包含数字，则返回 `0`。

**语法**

```sql
simpleJSONExtractUInt(json, field_name)
```

别名：`visitParamExtractUInt`。

**参数**

- `json` — 要搜索字段的 JSON。[字符串](/sql-reference/data-types/string)
- `field_name` — 要搜索的字段名称。[字符串文字](/sql-reference/syntax#string)

**返回值**

- 如果字段存在并包含数字，则返回从字段解析的数字，否则返回 `0`。[UInt64](../data-types/int-uint.md)。

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

从名为 `field_name` 的字段值中解析 `Int64`。如果这是一个字符串字段，它会尝试从字符串的开头解析一个数字。如果字段不存在，或者存在但不包含数字，则返回 `0`。

**语法**

```sql
simpleJSONExtractInt(json, field_name)
```

别名：`visitParamExtractInt`。

**参数**

- `json` — 要搜索字段的 JSON。[字符串](/sql-reference/data-types/string)
- `field_name` — 要搜索的字段名称。[字符串文字](/sql-reference/syntax#string)

**返回值**

- 如果字段存在并包含数字，则返回从字段解析的数字，否则返回 `0`。[Int64](../data-types/int-uint.md)。

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

从名为 `field_name` 的字段值中解析 `Float64`。如果这是一个字符串字段，它会尝试从字符串的开头解析一个数字。如果字段不存在，或者存在但不包含数字，则返回 `0`。

**语法**

```sql
simpleJSONExtractFloat(json, field_name)
```

别名：`visitParamExtractFloat`。

**参数**

- `json` — 要搜索字段的 JSON。[字符串](/sql-reference/data-types/string)
- `field_name` — 要搜索的字段名称。[字符串文字](/sql-reference/syntax#string)

**返回值**

- 如果字段存在并包含数字，则返回从字段解析的数字，否则返回 `0`。[Float64](/sql-reference/data-types/float)。

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

从名为 `field_name` 的字段值中解析 true/false 值。结果为 `UInt8`。

**语法**

```sql
simpleJSONExtractBool(json, field_name)
```

别名：`visitParamExtractBool`。

**参数**

- `json` — 要搜索字段的 JSON。[字符串](/sql-reference/data-types/string)
- `field_name` — 要搜索的字段名称。[字符串文字](/sql-reference/syntax#string)

**返回值**

如果字段的值为 `true`，则返回 `1`，否则返回 `0`。 这意味着此函数会返回 `0` 的情况包括（但不限于）：
 - 如果字段不存在。
 - 如果字段包含 `true` 作为字符串，例如：`{"field":"true"}`。
 - 如果字段包含 `1` 作为数值。

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

将名为 `field_name` 的字段的值作为 `String` 返回，包括分隔符。

**语法**

```sql
simpleJSONExtractRaw(json, field_name)
```

别名：`visitParamExtractRaw`。

**参数**

- `json` — 要搜索字段的 JSON。[字符串](/sql-reference/data-types/string)
- `field_name` — 要搜索的字段名称。[字符串文字](/sql-reference/syntax#string)

**返回值**

- 返回字段的值作为字符串，包括分隔符（如果字段存在），否则返回空字符串。[`字符串`](/sql-reference/data-types/string)

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

从名为 `field_name` 的字段值中解析 `String`，并用双引号括起来。

**语法**

```sql
simpleJSONExtractString(json, field_name)
```

别名：`visitParamExtractString`。

**参数**

- `json` — 要搜索字段的 JSON。[字符串](/sql-reference/data-types/string)
- `field_name` — 要搜索的字段名称。[字符串文字](/sql-reference/syntax#string)

**返回值**

- 返回字段的未转义值作为字符串，包括分隔符。如果字段不包含双引号字符串、解码失败或字段不存在，则返回空字符串。[字符串](../data-types/string.md)。

**实现细节**

目前不支持格式为 `\uXXXX\uYYYY` 的代码点，且这些代码点不是来自基础多语言平面（它们转换为 CESU-8 而非 UTF-8）。

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

## JSONExtract 函数 {#jsonextract-functions}

以下函数基于 [simdjson](https://github.com/lemire/simdjson)，旨在满足更复杂的 JSON 解析需求。

### isValidJSON {#isvalidjson}

检查传入的字符串是否为有效 JSON。

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

如果值存在于 JSON 文档中，将返回 `1`。 如果值不存在，将返回 `0`。

**语法**

```sql
JSONHas(json [, indices_or_keys]...)
```

**参数**

- `json` — 要解析的 JSON 字符串。[字符串](../data-types/string.md)。
- `indices_or_keys` — 一系列零个或多个参数，每个参数可以是字符串或整数。[字符串](../data-types/string.md)， [Int*](../data-types/int-uint.md)。

`indices_or_keys` 类型：
- 字符串 = 按键访问对象成员。
- 正整数 = 从开头访问第 n 个成员/键。
- 负整数 = 从末尾访问第 n 个成员/键。

**返回值**

- 如果值存在于 `json` 中，则返回 `1`，否则返回 `0`。[UInt8](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT JSONHas('{"a": "hello", "b": [-100, 200.0, 300]}', 'b') = 1
SELECT JSONHas('{"a": "hello", "b": [-100, 200.0, 300]}', 'b', 4) = 0
```

元素的最小索引为 1。因此元素 0 不存在。您可以使用整数访问 JSON 数组和 JSON 对象。例如：

```sql
SELECT JSONExtractKey('{"a": "hello", "b": [-100, 200.0, 300]}', 1) = 'a'
SELECT JSONExtractKey('{"a": "hello", "b": [-100, 200.0, 300]}', 2) = 'b'
SELECT JSONExtractKey('{"a": "hello", "b": [-100, 200.0, 300]}', -1) = 'b'
SELECT JSONExtractKey('{"a": "hello", "b": [-100, 200.0, 300]}', -2) = 'a'
SELECT JSONExtractString('{"a": "hello", "b": [-100, 200.0, 300]}', 1) = 'hello'
```

### JSONLength {#jsonlength}

返回 JSON 数组或 JSON 对象的元素数量。如果值不存在或类型错误，将返回 `0`。

**语法**

```sql
JSONLength(json [, indices_or_keys]...)
```

**参数**

- `json` — 要解析的 JSON 字符串。[字符串](../data-types/string.md)。
- `indices_or_keys` — 一系列零个或多个参数，每个参数可以是字符串或整数。[字符串](../data-types/string.md)， [Int*](../data-types/int-uint.md)。

`indices_or_keys` 类型：
- 字符串 = 按键访问对象成员。
- 正整数 = 从开头访问第 n 个成员/键。
- 负整数 = 从末尾访问第 n 个成员/键。

**返回值**

- 返回 JSON 数组或 JSON 对象的长度。如果值不存在或类型错误，则返回 `0`。[UInt64](../data-types/int-uint.md)。

**示例**

```sql
SELECT JSONLength('{"a": "hello", "b": [-100, 200.0, 300]}', 'b') = 3
SELECT JSONLength('{"a": "hello", "b": [-100, 200.0, 300]}') = 2
```

### JSONType {#jsontype}

返回 JSON 值的类型。如果值不存在，将返回 `Null=0`（不是普通的 [Null](../data-types/nullable.md)，而是 `Enum8('Null' = 0, 'String' = 34,...` 的 `Null=0`）。

**语法**

```sql
JSONType(json [, indices_or_keys]...)
```

**参数**

- `json` — 要解析的 JSON 字符串。[字符串](../data-types/string.md)。
- `indices_or_keys` — 一系列零个或多个参数，每个参数可以是字符串或整数。[字符串](../data-types/string.md)， [Int*](../data-types/int-uint.md)。

`indices_or_keys` 类型：
- 字符串 = 按键访问对象成员。
- 正整数 = 从开头访问第 n 个成员/键。
- 负整数 = 从末尾访问第 n 个成员/键。

**返回值**

- 返回 JSON 值的类型作为字符串，如果值不存在则返回 `Null=0`。[枚举](../data-types/enum.md)。

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

- `json` — 要解析的 JSON 字符串。[字符串](../data-types/string.md)。
- `indices_or_keys` — 一系列零个或多个参数，每个参数可以是字符串或整数。[字符串](../data-types/string.md)， [Int*](../data-types/int-uint.md)。

`indices_or_keys` 类型：
- 字符串 = 按键访问对象成员。
- 正整数 = 从开头访问第 n 个成员/键。
- 负整数 = 从末尾访问第 n 个成员/键。

**返回值**

- 如果存在，则返回一个 UInt 值，否则返回 `0`。[UInt64](../data-types/int-uint.md)。

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

- `json` — 要解析的 JSON 字符串。[字符串](../data-types/string.md)。
- `indices_or_keys` — 一系列零个或多个参数，每个参数可以是字符串或整数。[字符串](../data-types/string.md)， [Int*](../data-types/int-uint.md)。

`indices_or_keys` 类型：
- 字符串 = 按键访问对象成员。
- 正整数 = 从开头访问第 n 个成员/键。
- 负整数 = 从末尾访问第 n 个成员/键。

**返回值**

- 如果存在，则返回一个 Int 值，否则返回 `0`。[Int64](../data-types/int-uint.md)。

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

- `json` — 要解析的 JSON 字符串。[字符串](../data-types/string.md)。
- `indices_or_keys` — 一系列零个或多个参数，每个参数可以是字符串或整数。[字符串](../data-types/string.md)， [Int*](../data-types/int-uint.md)。

`indices_or_keys` 类型：
- 字符串 = 按键访问对象成员。
- 正整数 = 从开头访问第 n 个成员/键。
- 负整数 = 从末尾访问第 n 个成员/键。

**返回值**

- 如果存在，则返回一个 Float 值，否则返回 `0`。[Float64](../data-types/float.md)。

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

解析 JSON 并提取布尔值。如果值不存在或类型错误，则返回 `0`。

**语法**

```sql
JSONExtractBool(json\[, indices_or_keys\]...)
```

**参数**

- `json` — 要解析的 JSON 字符串。[字符串](../data-types/string.md)。
- `indices_or_keys` — 一系列零个或多个参数，每个参数可以是字符串或整数。[字符串](../data-types/string.md)， [Int*](../data-types/int-uint.md)。

`indices_or_keys` 类型：
- 字符串 = 按键访问对象成员。
- 正整数 = 从开头访问第 n 个成员/键。
- 负整数 = 从末尾访问第 n 个成员/键。

**返回值**

- 如果存在，则返回布尔值，否则返回 `0`。[布尔](../data-types/boolean.md)。

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

解析 JSON 并提取字符串。此函数与 [`visitParamExtractString`](#simplejsonextractstring) 函数相似。如果值不存在或类型错误，则返回空字符串。

**语法**

```sql
JSONExtractString(json [, indices_or_keys]...)
```

**参数**

- `json` — 要解析的 JSON 字符串。[字符串](../data-types/string.md)。
- `indices_or_keys` — 一系列零个或多个参数，每个参数可以是字符串或整数。[字符串](../data-types/string.md)， [Int*](../data-types/int-uint.md)。

`indices_or_keys` 类型：
- 字符串 = 按键访问对象成员。
- 正整数 = 从开头访问第 n 个成员/键。
- 负整数 = 从末尾访问第 n 个成员/键。

**返回值**

- 从 `json` 返回未转义的字符串。如果解码失败、值不存在或类型错误，则返回空字符串。[字符串](../data-types/string.md)。

**示例**

```sql
SELECT JSONExtractString('{"a": "hello", "b": [-100, 200.0, 300]}', 'a') = 'hello'
SELECT JSONExtractString('{"abc":"\\n\\u0000"}', 'abc') = '\n\0'
SELECT JSONExtractString('{"abc":"\\u263a"}', 'abc') = '☺'
SELECT JSONExtractString('{"abc":"\\u263"}', 'abc') = ''
SELECT JSONExtractString('{"abc":"hello}', 'abc') = ''
```

### JSONExtract {#jsonextract}

解析 JSON 并提取给定 ClickHouse 数据类型的值。此函数是之前 `JSONExtract<type>` 函数的通用版本。意思是：

`JSONExtract(..., 'String')` 返回的正是 `JSONExtractString()`，
`JSONExtract(..., 'Float64')` 返回的正是 `JSONExtractFloat()`。

**语法**

```sql
JSONExtract(json [, indices_or_keys...], return_type)
```

**参数**

- `json` — 要解析的 JSON 字符串。[字符串](../data-types/string.md)。
- `indices_or_keys` — 一系列零个或多个参数，每个参数可以是字符串或整数。[字符串](../data-types/string.md)， [Int*](../data-types/int-uint.md)。
- `return_type` — 一个字符串，指定要提取的值的类型。[字符串](../data-types/string.md)。 

`indices_or_keys` 类型：
- 字符串 = 按键访问对象成员。
- 正整数 = 从开头访问第 n 个成员/键。
- 负整数 = 从末尾访问第 n 个成员/键。

**返回值**

- 返回具有指定返回类型的值（如果存在），否则返回 `0`、`Null` 或空字符串，具体取决于指定的返回类型。[UInt64](../data-types/int-uint.md)、[Int64](../data-types/int-uint.md)、[Float64](../data-types/float.md)、[Bool](../data-types/boolean.md) 或 [String](../data-types/string.md)。

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

从 JSON 中解析键值对，其中值为给定 ClickHouse 数据类型。

**语法**

```sql
JSONExtractKeysAndValues(json [, indices_or_keys...], value_type)
```

**参数**

- `json` — 要解析的 JSON 字符串。[字符串](../data-types/string.md)。
- `indices_or_keys` — 一系列零个或多个参数，每个参数可以是字符串或整数。[字符串](../data-types/string.md)， [Int*](../data-types/int-uint.md)。
- `value_type` — 一个字符串，指定要提取的值的类型。[字符串](../data-types/string.md)。

`indices_or_keys` 类型：
- 字符串 = 按键访问对象成员。
- 正整数 = 从开头访问第 n 个成员/键。
- 负整数 = 从末尾访问第 n 个成员/键。

**返回值**

- 返回解析后的键值对数组。[数组](../data-types/array.md)([元组](../data-types/tuple.md)(`value_type`))。

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

- `json` — [字符串](../data-types/string.md) 有效 JSON。
- `a, b, c...` — 逗号分隔的索引或键，指定嵌套 JSON 对象中内层字段的路径。每个参数可以是要按键获取字段的 [字符串](../data-types/string.md) 或获取第 N 个字段的 [整数](../data-types/int-uint.md)（从 1 开始索引，负整数从末尾计数）。如果未设置，则整个 JSON 被解析为顶级对象。可选参数。

**返回值**

- 返回 JSON 的键数组。[数组](../data-types/array.md)([字符串](../data-types/string.md))。

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

将部分 JSON 返回为未解析的字符串。如果该部分不存在或类型错误，则返回空字符串。

**语法**

```sql
JSONExtractRaw(json [, indices_or_keys]...)
```

**参数**

- `json` — 要解析的 JSON 字符串。[字符串](../data-types/string.md)。
- `indices_or_keys` — 一系列零个或多个参数，每个参数可以是字符串或整数。[字符串](../data-types/string.md)， [Int*](../data-types/int-uint.md)。

`indices_or_keys` 类型：
- 字符串 = 按键访问对象成员。
- 正整数 = 从开头访问第 n 个成员/键。
- 负整数 = 从末尾访问第 n 个成员/键。

**返回值**

- 将部分 JSON 返回为未解析的字符串。如果该部分不存在或类型错误，则返回空字符串。[字符串](../data-types/string.md)。

**示例**

```sql
SELECT JSONExtractRaw('{"a": "hello", "b": [-100, 200.0, 300]}', 'b') = '[-100, 200.0, 300]';
```

### JSONExtractArrayRaw {#jsonextractarrayraw}

返回 JSON 数组的元素数组，每个元素以未解析字符串表示。如果该部分不存在或不是数组，则返回空数组。

**语法**

```sql
JSONExtractArrayRaw(json [, indices_or_keys...])
```

**参数**

- `json` — 要解析的 JSON 字符串。[字符串](../data-types/string.md)。
- `indices_or_keys` — 一系列零个或多个参数，每个参数可以是字符串或整数。[字符串](../data-types/string.md)， [Int*](../data-types/int-uint.md)。

`indices_or_keys` 类型：
- 字符串 = 按键访问对象成员。
- 正整数 = 从开头访问第 n 个成员/键。
- 负整数 = 从末尾访问第 n 个成员/键。

**返回值**

- 返回 JSON 数组的元素数组，每个元素以未解析字符串表示。否则，如果该部分不存在或不是数组，则返回空数组。[数组](../data-types/array.md)([字符串](../data-types/string.md))。

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

- `json` — [字符串](../data-types/string.md) 有效 JSON。
- `p, a, t, h` — 逗号分隔的索引或键，指定嵌套 JSON 对象中内层字段的路径。每个参数可以是要按键获取字段的 [字符串](../data-types/string.md) 或获取第 N 个字段的 [整数](../data-types/int-uint.md)（从 1 开始索引，负整数从末尾计数）。如果未设置，则整个 JSON 被解析为顶级对象。可选参数。

**返回值**

- 包含 `('key', 'value')` 元组的数组。两个元组成员都是字符串。[数组](../data-types/array.md)([元组](../data-types/tuple.md)([字符串](../data-types/string.md), [字符串](../data-types/string.md))。
- 如果请求的对象不存在或输入 JSON 无效，则返回空数组。[数组](../data-types/array.md)([元组](../data-types/tuple.md)([字符串](../data-types/string.md), [字符串](../data-types/string.md))。

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

如果值存在于 JSON 文档中，将返回 `1`。 如果值不存在，将返回 `0`。

**语法**

```sql
JSON_EXISTS(json, path)
```

**参数**

- `json` — 有效 JSON 的字符串。[字符串](../data-types/string.md)。
- `path` — 一个表示路径的字符串。[字符串](../data-types/string.md)。

:::note
在 21.11 之前，参数的顺序是错误的，即 JSON_EXISTS(path, json)
:::

**返回值**

- 如果值存在于 JSON 文档中，将返回 `1`，否则返回 `0`。

**示例**

```sql
SELECT JSON_EXISTS('{"hello":1}', '$.hello');
SELECT JSON_EXISTS('{"hello":{"world":1}}', '$.hello.world');
SELECT JSON_EXISTS('{"hello":["world"]}', '$.hello[*]');
SELECT JSON_EXISTS('{"hello":["world"]}', '$.hello[0]');
```

### JSON_QUERY {#json_query}

解析 JSON 并提取值作为 JSON 数组或 JSON 对象。如果值不存在，则返回空字符串。

**语法**

```sql
JSON_QUERY(json, path)
```

**参数**

- `json` — 有效 JSON 的字符串。[字符串](../data-types/string.md)。
- `path` — 一个表示路径的字符串。[字符串](../data-types/string.md)。

:::note
在 21.11 之前，参数的顺序是错误的，即 JSON_EXISTS(path, json)
:::

**返回值**

- 返回提取的值作为 JSON 数组或 JSON 对象。否则，如果值不存在，则返回空字符串。[字符串](../data-types/string.md)。

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

解析 JSON 并提取值作为 JSON 标量。如果值不存在，则会默认返回空字符串。

此函数受以下设置控制：

- 通过设置 `function_json_value_return_type_allow_nullable` = `true`，将返回 `NULL`。 如果值为复杂类型（例如：结构、数组、映射），则会默认返回空字符串。
- 通过设置 `function_json_value_return_type_allow_complex` = `true`，将返回复杂值。

**语法**

```sql
JSON_VALUE(json, path)
```

**参数**

- `json` — 有效 JSON 的字符串。[字符串](../data-types/string.md)。
- `path` — 表示路径的字符串。[字符串](../data-types/string.md)。

:::note
在 21.11 之前，参数的顺序是错误的，即 JSON_EXISTS(path, json)
:::

**返回值**

- 如果存在，则返回提取的值作为 JSON 标量，否则返回空字符串。[字符串](../data-types/string.md)。

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

将值序列化为其 JSON 表示。支持各种数据类型和嵌套结构。
64 位 [整数](../data-types/int-uint.md) 或更大（如 `UInt64` 或 `Int128`）默认用引号括起来。[output_format_json_quote_64bit_integers](/operations/settings/formats#output_format_json_quote_64bit_integers) 控制此行为。
特殊值 `NaN` 和 `inf` 被替换为 `null`。启用 [output_format_json_quote_denormals](/operations/settings/formats#output_format_json_quote_denormals) 设置以显示它们。
序列化 [枚举](../data-types/enum.md) 值时，函数输出其名称。

**语法**

```sql
toJSONString(value)
```

**参数**

- `value` — 要序列化的值。 值可以是任何数据类型。

**返回值**

- 值的 JSON 表示。[字符串](../data-types/string.md)。

**示例**

第一个示例展示 [映射](../data-types/map.md) 的序列化。
第二个示例展示一些特殊值包裹在 [元组](../data-types/tuple.md) 中。

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

别名：`JSON_ARRAY_LENGTH(json)`。

**参数**

- `json` — [字符串](../data-types/string.md) 有效 JSON。

**返回值**

- 如果 `json` 是有效的 JSON 数组字符串，则返回数组元素的数量，否则返回 NULL。[Nullable(UInt64)](../data-types/int-uint.md)。

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

返回由多个 JSON 对象合并而成的合并 JSON 对象字符串。

**语法**

```sql
jsonMergePatch(json1, json2, ...)
```

**参数**

- `json` — [字符串](../data-types/string.md) 有效 JSON。

**返回值**

- 如果 JSON 对象字符串有效，返回合并的 JSON 对象字符串。[字符串](../data-types/string.md)。

**示例**

```sql
SELECT jsonMergePatch('{"a":1}', '{"name": "joey"}', '{"name": "tom"}', '{"name": "zoey"}') AS res

┌─res───────────────────┐
│ {"a":1,"name":"zoey"} │
└───────────────────────┘
```

### JSONAllPaths {#jsonallpaths}

返回存储在每行中的所有路径的列表，在 [JSON](../data-types/newjson.md) 列中。

**语法**

```sql
JSONAllPaths(json)
```

**参数**

- `json` — [JSON](../data-types/newjson.md)。

**返回值**

- 路径数组。[数组(字符串)](../data-types/array.md)。

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

返回存储在每行中的所有路径及其数据类型的映射，在 [JSON](../data-types/newjson.md) 列中。

**语法**

```sql
JSONAllPathsWithTypes(json)
```

**参数**

- `json` — [JSON](../data-types/newjson.md)。

**返回值**

- 路径的数组。[映射(字符串, 字符串)](../data-types/array.md)。

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

返回存储为单独子列的动态路径列表，在 [JSON](../data-types/newjson.md) 列中。

**语法**

```sql
JSONDynamicPaths(json)
```

**参数**

- `json` — [JSON](../data-types/newjson.md)。

**返回值**

- 路径数组。[数组(字符串)](../data-types/array.md)。

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

返回存储为单独子列的动态路径及其类型的映射，在每行中，在 [JSON](../data-types/newjson.md) 列中。

**语法**

```sql
JSONAllPathsWithTypes(json)
```

**参数**

- `json` — [JSON](../data-types/newjson.md)。

**返回值**

- 路径数组。[映射(字符串, 字符串)](../data-types/array.md)。

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

返回存储在共享数据结构中的路径列表，在 [JSON](../data-types/newjson.md) 列中。

**语法**

```sql
JSONSharedDataPaths(json)
```

**参数**

- `json` — [JSON](../data-types/newjson.md)。

**返回值**

- 路径数组。[数组(字符串)](../data-types/array.md)。

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

返回存储在共享数据结构中的路径及其类型的映射，在每行中，在 [JSON](../data-types/newjson.md) 列中。

**语法**

```sql
JSONSharedDataPathsWithTypes(json)
```

**参数**

- `json` — [JSON](../data-types/newjson.md)。

**返回值**

- 路径数组。[映射(字符串, 字符串)](../data-types/array.md)。

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
