---
slug: /sql-reference/data-types/newjson
sidebar_position: 63
sidebar_label: JSON
keywords: ['json', 'data type']
title: 'JSON 数据类型'
---
import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge/>

`JSON` 类型将 JavaScript 对象表示法 (JSON) 文档存储在单个列中。

:::note
此功能正在测试阶段，尚未准备好投入生产。如果您需要处理 JSON 文档，请考虑使用 [此指南](/integrations/data-formats/json/overview)。

如果您想使用 `JSON` 类型，以及本页面上的示例，请使用：

```sql
SET enable_json_type = 1
```

:::

要声明一个 `JSON` 类型的列，可以使用以下语法：

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
其中，上述语法中的参数定义如下：

| 参数                        | 描述                                                                                                                                                                                                                                                                                                                                                                           | 默认值        |
|-----------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------|
| `max_dynamic_paths`         | 一个可选参数，指示可以单独存储多少路径作为子列，跨越存储在单个数据块中的单个数据部分（例如，MergeTree 表）。 <br/><br/>如果超过此限制，所有其他路径将作为单个结构合并存储。                                                                                                                                        | `1024`        |
| `max_dynamic_types`         | 介于 `1` 和 `255` 之间的一个可选参数，指示可以存储多少种不同数据类型在单个路径列中，类型为 `Dynamic`，跨越存储在单个数据块中的单个数据部分（例如，MergeTree 表）。 <br/><br/>如果超出此限制，所有新类型将转换为类型 `String`。                                                                                                                                  | `32`          |
| `some.path TypeName`        | 特定路径的可选类型提示。这样的路径将始终作为指定类型的子列存储。                                                                                                                                                                                                                                                                                             |               |
| `SKIP path.to.skip`         | 对特定路径的可选提示，表示在 JSON 解析期间应跳过该路径。这样的路径将永远不会存储在 JSON 列中。如果指定的路径是嵌套的 JSON 对象，则整个嵌套对象将被跳过。                                                                                                                                                                                                        |               |
| `SKIP REGEXP 'path_regexp'` | 一个可选提示，使用正则表达式，在 JSON 解析过程中跳过路径。所有匹配此正则表达式的路径将永远不会存储在 JSON 列中。                                                                                                                                                                                                                                             |               |
## 创建 JSON {#creating-json}

在本节中，我们将看一下创建 `JSON` 的各种方式。
### 在表列定义中使用 `JSON` {#using-json-in-a-table-column-definition}

```sql title="查询 (示例 1)"
CREATE TABLE test (json JSON) ENGINE = Memory;
INSERT INTO test VALUES ('{"a" : {"b" : 42}, "c" : [1, 2, 3]}'), ('{"f" : "Hello, World!"}'), ('{"a" : {"b" : 43, "e" : 10}, "c" : [4, 5, 6]}');
SELECT json FROM test;
```

```text title="响应 (示例 1)"
┌─json────────────────────────────────────────┐
│ {"a":{"b":"42"},"c":["1","2","3"]}          │
│ {"f":"Hello, World!"}                       │
│ {"a":{"b":"43","e":"10"},"c":["4","5","6"]} │
└─────────────────────────────────────────────┘
```

```sql title="查询 (示例 2)"
CREATE TABLE test (json JSON(a.b UInt32, SKIP a.e)) ENGINE = Memory;
INSERT INTO test VALUES ('{"a" : {"b" : 42}, "c" : [1, 2, 3]}'), ('{"f" : "Hello, World!"}'), ('{"a" : {"b" : 43, "e" : 10}, "c" : [4, 5, 6]}');
SELECT json FROM test;
```

```text title="响应 (示例 2)"
┌─json──────────────────────────────┐
│ {"a":{"b":42},"c":[1,2,3]}        │
│ {"a":{"b":0},"f":"Hello, World!"} │
│ {"a":{"b":43},"c":[4,5,6]}        │
└───────────────────────────────────┘
```
### 使用 CAST 和 `::JSON` {#using-cast-with-json}

可以使用特殊语法 `::JSON` 将各种类型转换为 `JSON`。
#### 从 `字符串` 转换为 `JSON` {#cast-from-string-to-json}

```sql title="查询"
SELECT '{"a" : {"b" : 42},"c" : [1, 2, 3], "d" : "Hello, World!"}'::JSON AS json;
```

```text title="响应"
┌─json───────────────────────────────────────────┐
│ {"a":{"b":42},"c":[1,2,3],"d":"Hello, World!"} │
└────────────────────────────────────────────────┘
```
#### 从 `元组` 转换为 `JSON` {#cast-from-tuple-to-json}

```sql title="查询"
SET enable_named_columns_in_function_tuple = 1;
SELECT (tuple(42 AS b) AS a, [1, 2, 3] AS c, 'Hello, World!' AS d)::JSON AS json;
```

```text title="响应"
┌─json───────────────────────────────────────────┐
│ {"a":{"b":42},"c":[1,2,3],"d":"Hello, World!"} │
└────────────────────────────────────────────────┘
```
#### 从 `映射` 转换为 `JSON` {#cast-from-map-to-json}

```sql title="查询"
SET enable_variant_type=1, use_variant_as_common_type=1;
SELECT map('a', map('b', 42), 'c', [1,2,3], 'd', 'Hello, World!')::JSON AS json;
```

```text title="响应"
┌─json───────────────────────────────────────────┐
│ {"a":{"b":42},"c":[1,2,3],"d":"Hello, World!"} │
└────────────────────────────────────────────────┘
```
#### 从已弃用的 `Object('json')` 转换为 `JSON` {#cast-from-deprecated-objectjson-to-json}

```sql title="查询"
SET allow_experimental_object_type = 1;
SELECT '{"a" : {"b" : 42},"c" : [1, 2, 3], "d" : "Hello, World!"}'::Object('json')::JSON AS json;
```

```text title="响应"
┌─json───────────────────────────────────────────┐
│ {"a":{"b":42},"c":[1,2,3],"d":"Hello, World!"} │
└────────────────────────────────────────────────┘
```

:::note
JSON 路径被存储为扁平结构。这意味着，当从路径如 `a.b.c` 格式化 JSON 对象时，无法知道该对象是应该构建为 `{ "a.b.c" : ... }` 还是 `{ "a" : {"b" : {"c" : ... }}}`。我们的实现将始终假设后者。

例如：

```sql
SELECT CAST('{"a.b.c" : 42}', 'JSON') as json
```

将返回：

```response
   ┌─json───────────────────┐
1. │ {"a":{"b":{"c":"42"}}} │
   └────────────────────────┘
```

而 **不是**：

```sql
   ┌─json───────────┐
1. │ {"a.b.c":"42"} │
   └────────────────┘
```
:::
## 读取 JSON 路径作为子列 {#reading-json-paths-as-sub-columns}

`JSON` 类型支持将每个路径作为单独的子列进行读取。 
如果请求的路径类型在 JSON 类型声明中未指定，则该路径的子列将始终具有类型 [Dynamic](/sql-reference/data-types/dynamic.md)。

例如：

```sql title="查询"
CREATE TABLE test (json JSON(a.b UInt32, SKIP a.e)) ENGINE = Memory;
INSERT INTO test VALUES ('{"a" : {"b" : 42, "g" : 42.42}, "c" : [1, 2, 3], "d" : "2020-01-01"}'), ('{"f" : "Hello, World!", "d" : "2020-01-02"}'), ('{"a" : {"b" : 43, "e" : 10, "g" : 43.43}, "c" : [4, 5, 6]}');
SELECT json FROM test;
```

```text title="响应"
┌─json──────────────────────────────────────────────────┐
│ {"a":{"b":42,"g":42.42},"c":[1,2,3],"d":"2020-01-01"} │
│ {"a":{"b":0},"d":"2020-01-02","f":"Hello, World!"}    │
│ {"a":{"b":43,"g":43.43},"c":[4,5,6]}                  │
└───────────────────────────────────────────────────────┘
```

```sql title="查询 (读取 JSON 路径作为子列)"
SELECT json.a.b, json.a.g, json.c, json.d FROM test;
```

```text title="响应 (读取 JSON 路径作为子列)"
┌─json.a.b─┬─json.a.g─┬─json.c──┬─json.d─────┐
│       42 │ 42.42    │ [1,2,3] │ 2020-01-01 │
│        0 │ ᴺᵁᴺᴸᴸ     │ ᴺᵁᴺᴸᴸ    │ 2020-01-02 │
│       43 │ 43.43    │ [4,5,6] │ ᴺᵁᴺᴸᴸ       │
└──────────┴──────────┴─────────┴────────────┘
```

如果请求的路径在数据中未找到，则将用 `NULL` 值填充：

```sql title="查询"
SELECT json.non.existing.path FROM test;
```

```text title="响应"
┌─json.non.existing.path─┐
│ ᴺᵁᴺᴸᴸ                   │
│ ᴺᵁᴺᴸᴸ                   │
│ ᴺᵁᴺᴸᴸ                   │
└────────────────────────┘
```

让我们检查返回的子列的数据类型：

```sql title="查询"
SELECT toTypeName(json.a.b), toTypeName(json.a.g), toTypeName(json.c), toTypeName(json.d) FROM test;
```

```text title="响应"
┌─toTypeName(json.a.b)─┬─toTypeName(json.a.g)─┬─toTypeName(json.c)─┬─toTypeName(json.d)─┐
│ UInt32               │ Dynamic              │ Dynamic            │ Dynamic            │
│ UInt32               │ Dynamic              │ Dynamic            │ Dynamic            │
│ UInt32               │ Dynamic              │ Dynamic            │ Dynamic            │
└──────────────────────┴──────────────────────┴────────────────────┴────────────────────┘
```

如我们所见，`a.b` 的类型是 `UInt32`，因为我们在 JSON 类型声明中指定了，所有其他子列的类型是 `Dynamic`。

还可以使用特殊语法 `json.some.path.:TypeName` 读取 `Dynamic` 类型的子列：

```sql title="查询"
SELECT
    json.a.g.:Float64,
    dynamicType(json.a.g),
    json.d.:Date,
    dynamicType(json.d)
FROM test
```

```text title="响应"
┌─json.a.g.:`Float64`─┬─dynamicType(json.a.g)─┬─json.d.:`Date`─┬─dynamicType(json.d)─┐
│               42.42 │ Float64               │     2020-01-01 │ Date                │
│                ᴺᵁᴺᴸᴸ │ None                  │     2020-01-02 │ Date                │
│               43.43 │ Float64               │           ᴺᵁᴺᴸᴸ │ None                │
└─────────────────────┴───────────────────────┴────────────────┴─────────────────────┘
```

`Dynamic` 子列可以转换为任何数据类型。在这种情况下，如果 `Dynamic` 内部类型无法被转换为请求类型，将抛出异常：

```sql title="查询"
SELECT json.a.g::UInt64 AS uint 
FROM test;
```

```text title="响应"
┌─uint─┐
│   42 │
│    0 │
│   43 │
└──────┘
```

```sql title="查询"
SELECT json.a.g::UUID AS float 
FROM test;
```

```text title="响应"
从服务器收到异常：
代码：48。 DB::Exception：从 localhost:9000 收到。 DB::Exception： 
数字类型和 UUID 之间的转换不支持。
可能传递的 UUID 是没有引号的： 
在执行 'FUNCTION CAST(__table1.json.a.g :: 2, 'UUID'_String :: 1) -> CAST(__table1.json.a.g, 'UUID'_String) UUID : 0' 时。
(NOT_IMPLEMENTED)
```
## 读取 JSON 子对象作为子列 {#reading-json-sub-objects-as-sub-columns}

`JSON` 类型支持使用特殊语法 `json.^some.path` 将嵌套对象作为子列读取：

```sql title="查询"
CREATE TABLE test (json JSON) ENGINE = Memory;
INSERT INTO test VALUES ('{"a" : {"b" : {"c" : 42, "g" : 42.42}}, "c" : [1, 2, 3], "d" : {"e" : {"f" : {"g" : "Hello, World", "h" : [1, 2, 3]}}}}'), ('{"f" : "Hello, World!", "d" : {"e" : {"f" : {"h" : [4, 5, 6]}}}}'), ('{"a" : {"b" : {"c" : 43, "e" : 10, "g" : 43.43}}, "c" : [4, 5, 6]}');
SELECT json FROM test;
```

```text title="响应"
┌─json────────────────────────────────────────────────────────────────────────────────────────┐
│ {"a":{"b":{"c":42,"g":42.42}},"c":[1,2,3],"d":{"e":{"f":{"g":"Hello, World","h":[1,2,3]}}}} │
│ {"d":{"e":{"f":{"h":[4,5,6]}}},"f":"Hello, World!"}                                         │
│ {"a":{"b":{"c":43,"e":10,"g":43.43}},"c":[4,5,6]}                                           │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

```sql title="查询"
SELECT json.^a.b, json.^d.e.f FROM test;
```

```text title="响应"
┌─json.^`a`.b───────────────┬─json.^`d`.e.f────────────────────┐
│ {"c":42,"g":42.42}        │ {"g":"Hello, World","h":[1,2,3]} │
│ {}                        │ {"h":[4,5,6]}                    │
│ {"c":43,"e":10,"g":43.43} │ {}                               │
└───────────────────────────┴──────────────────────────────────┘
```

:::note
以子列读取子对象可能效率低下，因为这可能需要对 JSON 数据进行几乎全面的扫描。
:::
## 路径的类型推断 {#type-inference-for-paths}

在解析 `JSON` 时，ClickHouse 会尝试检测每个 JSON 路径的最合适数据类型。 
它的工作方式类似于 [输入数据的自动架构推断](/interfaces/schema-inference.md)，并受相同设置控制：
 
- [input_format_try_infer_integers](/operations/settings/formats#input_format_try_infer_integers)
- [input_format_try_infer_dates](/operations/settings/formats#input_format_try_infer_dates)
- [input_format_try_infer_datetimes](/operations/settings/formats#input_format_try_infer_datetimes)
- [schema_inference_make_columns_nullable](/operations/settings/formats#schema_inference_make_columns_nullable)
- [input_format_json_try_infer_numbers_from_strings](/operations/settings/formats#input_format_json_try_infer_numbers_from_strings)
- [input_format_json_infer_incomplete_types_as_strings](/operations/settings/formats#input_format_json_infer_incomplete_types_as_strings)
- [input_format_json_read_numbers_as_strings](/operations/settings/formats#input_format_json_read_numbers_as_strings)
- [input_format_json_read_bools_as_strings](/operations/settings/formats#input_format_json_read_bools_as_strings)
- [input_format_json_read_bools_as_numbers](/operations/settings/formats#input_format_json_read_bools_as_numbers)
- [input_format_json_read_arrays_as_strings](/operations/settings/formats#input_format_json_read_arrays_as_strings)

让我们看看一些示例：

```sql title="查询"
SELECT JSONAllPathsWithTypes('{"a" : "2020-01-01", "b" : "2020-01-01 10:00:00"}'::JSON) AS paths_with_types settings input_format_try_infer_dates=1, input_format_try_infer_datetimes=1;
```

```text title="响应"
┌─paths_with_types─────────────────┐
│ {'a':'Date','b':'DateTime64(9)'} │
└──────────────────────────────────┘
```

```sql title="查询"
SELECT JSONAllPathsWithTypes('{"a" : "2020-01-01", "b" : "2020-01-01 10:00:00"}'::JSON) AS paths_with_types settings input_format_try_infer_dates=0, input_format_try_infer_datetimes=0;
```

```text title="响应"
┌─paths_with_types────────────┐
│ {'a':'String','b':'String'} │
└─────────────────────────────┘
```

```sql title="查询"
SELECT JSONAllPathsWithTypes('{"a" : [1, 2, 3]}'::JSON) AS paths_with_types settings schema_inference_make_columns_nullable=1;
```

```text title="响应"
┌─paths_with_types───────────────┐
│ {'a':'Array(Nullable(Int64))'} │
└────────────────────────────────┘
```

```sql title="查询"
SELECT JSONAllPathsWithTypes('{"a" : [1, 2, 3]}'::JSON) AS paths_with_types settings schema_inference_make_columns_nullable=0;
```

```text title="响应"
┌─paths_with_types─────┐
│ {'a':'Array(Int64)'} │
└──────────────────────┘
```
## 处理 JSON 对象数组 {#handling-arrays-of-json-objects}

包含对象数组的 JSON 路径被解析为类型 `Array(JSON)` 并插入到该路径的 `Dynamic` 列中。 
要读取对象数组，您可以将其作为子列从 `Dynamic` 列中提取：

```sql title="查询"
CREATE TABLE test (json JSON) ENGINE = Memory;
INSERT INTO test VALUES
('{"a" : {"b" : [{"c" : 42, "d" : "Hello", "f" : [[{"g" : 42.42}]], "k" : {"j" : 1000}}, {"c" : 43}, {"e" : [1, 2, 3], "d" : "My", "f" : [[{"g" : 43.43, "h" : "2020-01-01"}]],  "k" : {"j" : 2000}}]}}'),
('{"a" : {"b" : [1, 2, 3]}}'),
('{"a" : {"b" : [{"c" : 44, "f" : [[{"h" : "2020-01-02"}]]}, {"e" : [4, 5, 6], "d" : "World", "f" : [[{"g" : 44.44}]],  "k" : {"j" : 3000}}]}}');
SELECT json FROM test;
```

```text title="响应"
┌─json────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ {"a":{"b":[{"c":"42","d":"Hello","f":[[{"g":42.42}]],"k":{"j":"1000"}},{"c":"43"},{"d":"My","e":["1","2","3"],"f":[[{"g":43.43,"h":"2020-01-01"}]],"k":{"j":"2000"}}]}} │
│ {"a":{"b":["1","2","3"]}}                                                                                                                                               │
│ {"a":{"b":[{"c":"44","f":[[{"h":"2020-01-02"}]]},{"d":"World","e":["4","5","6"],"f":[[{"g":44.44}]],"k":{"j":"3000"}}]}}                                                │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

```sql title="查询"
SELECT json.a.b, dynamicType(json.a.b) FROM test;
```

```text title="响应"
┌─json.a.b──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬─dynamicType(json.a.b)────────────────────────────────────┐
│ ['{"c":"42","d":"Hello","f":[[{"g":42.42}]],"k":{"j":"1000"}}','{"c":"43"}','{"d":"My","e":["1","2","3"],"f":[[{"g":43.43,"h":"2020-01-01"}]],"k":{"j":"2000"}}'] │ Array(JSON(max_dynamic_types=16, max_dynamic_paths=256)) │
│ [1,2,3]                                                                                                                                                           │ Array(Nullable(Int64))                                   │
│ ['{"c":"44","f":[[{"h":"2020-01-02"}]]}','{"d":"World","e":["4","5","6"],"f":[[{"g":44.44}]],"k":{"j":"3000"}}']                                                  │ Array(JSON(max_dynamic_types=16, max_dynamic_paths=256)) │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────────────────────────────────────────────────┘
```

您可能已注意到，嵌套 `JSON` 类型的 `max_dynamic_types`/`max_dynamic_paths` 参数与默认值相比有所减少。 
这是为避免在 JSON 对象的嵌套数组中子列数量失控而需要的。

让我们尝试从嵌套 `JSON` 列中读取子列：

```sql title="查询"
SELECT json.a.b.:`Array(JSON)`.c, json.a.b.:`Array(JSON)`.f, json.a.b.:`Array(JSON)`.d FROM test; 
```

```text title="响应"
┌─json.a.b.:`Array(JSON)`.c─┬─json.a.b.:`Array(JSON)`.f───────────────────────────────────┬─json.a.b.:`Array(JSON)`.d─┐
│ [42,43,NULL]              │ [[['{"g":42.42}']],NULL,[['{"g":43.43,"h":"2020-01-01"}']]] │ ['Hello',NULL,'My']       │
│ []                        │ []                                                          │ []                        │
│ [44,NULL]                 │ [[['{"h":"2020-01-02"}']],[['{"g":44.44}']]]                │ [NULL,'World']            │
└───────────────────────────┴─────────────────────────────────────────────────────────────┴───────────────────────────┘
```

我们可以使用特殊语法避免编写 `Array(JSON)` 子列名称：

```sql title="查询"
SELECT json.a.b[].c, json.a.b[].f, json.a.b[].d FROM test;
```

```text title="响应"
┌─json.a.b.:`Array(JSON)`.c─┬─json.a.b.:`Array(JSON)`.f───────────────────────────────────┬─json.a.b.:`Array(JSON)`.d─┐
│ [42,43,NULL]              │ [[['{"g":42.42}']],NULL,[['{"g":43.43,"h":"2020-01-01"}']]] │ ['Hello',NULL,'My']       │
│ []                        │ []                                                          │ []                        │
│ [44,NULL]                 │ [[['{"h":"2020-01-02"}']],[['{"g":44.44}']]]                │ [NULL,'World']            │
└───────────────────────────┴─────────────────────────────────────────────────────────────┴───────────────────────────┘
```

路径后面的 `[]` 表示数组级别。例如，`json.path[][]` 将被转换为 `json.path.:Array(Array(JSON))`

让我们检查我们 `Array(JSON)` 中的路径和类型：

```sql title="查询"
SELECT DISTINCT arrayJoin(JSONAllPathsWithTypes(arrayJoin(json.a.b[]))) FROM test;
```

```text title="响应"
┌─arrayJoin(JSONAllPathsWithTypes(arrayJoin(json.a.b.:`Array(JSON)`)))──┐
│ ('c','Int64')                                                         │
│ ('d','String')                                                        │
│ ('f','Array(Array(JSON(max_dynamic_types=8, max_dynamic_paths=64)))') │
│ ('k.j','Int64')                                                       │
│ ('e','Array(Nullable(Int64))')                                        │
└───────────────────────────────────────────────────────────────────────┘
```

让我们从 `Array(JSON)` 列读取子列：

```sql title="查询"
SELECT json.a.b[].c.:Int64, json.a.b[].f[][].g.:Float64, json.a.b[].f[][].h.:Date FROM test;
```

```text title="响应"
┌─json.a.b.:`Array(JSON)`.c.:`Int64`─┬─json.a.b.:`Array(JSON)`.f.:`Array(Array(JSON))`.g.:`Float64`─┬─json.a.b.:`Array(JSON)`.f.:`Array(Array(JSON))`.h.:`Date`─┐
│ [42,43,NULL]                       │ [[[42.42]],[],[[43.43]]]                                     │ [[[NULL]],[],[['2020-01-01']]]                            │
│ []                                 │ []                                                           │ []                                                        │
│ [44,NULL]                          │ [[[NULL]],[[44.44]]]                                         │ [[['2020-01-02']],[[NULL]]]                               │
└────────────────────────────────────┴──────────────────────────────────────────────────────────────┴───────────────────────────────────────────────────────────┘
```

我们还可以从嵌套的 `JSON` 列读取子对象子列：

```sql title="查询"
SELECT json.a.b[].^k FROM test
```

```text title="响应"
┌─json.a.b.:`Array(JSON)`.^`k`─────────┐
│ ['{"j":"1000"}','{}','{"j":"2000"}'] │
│ []                                   │
│ ['{}','{"j":"3000"}']                │
└──────────────────────────────────────┘
```
## 从数据中读取 JSON 类型 {#reading-json-type-from-data}

所有文本格式 
([`JSONEachRow`](../../interfaces/formats/JSON/JSONEachRow.md)、 
[`TSV`](../../interfaces/formats/TabSeparated/TabSeparated.md)、 
[`CSV`](../../interfaces/formats/CSV/CSV.md)、 
[`CustomSeparated`](../../interfaces/formats/CustomSeparated/CustomSeparated.md)、 
[`Values`](../../interfaces/formats/Values.md) 等) 支持读取 `JSON` 类型。

示例：

```sql title="查询"
SELECT json FROM format(JSONEachRow, 'json JSON(a.b.c UInt32, SKIP a.b.d, SKIP d.e, SKIP REGEXP \'b.*\')', '
{"json" : {"a" : {"b" : {"c" : 1, "d" : [0, 1]}}, "b" : "2020-01-01", "c" : 42, "d" : {"e" : {"f" : ["s1", "s2"]}, "i" : [1, 2, 3]}}}
{"json" : {"a" : {"b" : {"c" : 2, "d" : [2, 3]}}, "b" : [1, 2, 3], "c" : null, "d" : {"e" : {"g" : 43}, "i" : [4, 5, 6]}}}
{"json" : {"a" : {"b" : {"c" : 3, "d" : [4, 5]}}, "b" : {"c" : 10}, "e" : "Hello, World!"}}
{"json" : {"a" : {"b" : {"c" : 4, "d" : [6, 7]}}, "c" : 43}}
{"json" : {"a" : {"b" : {"c" : 5, "d" : [8, 9]}}, "b" : {"c" : 11, "j" : [1, 2, 3]}, "d" : {"e" : {"f" : ["s3", "s4"], "g" : 44}, "h" : "2020-02-02 10:00:00"}}}
')
```

```text title="响应"
┌─json──────────────────────────────────────────────────────────┐
│ {"a":{"b":{"c":1}},"c":"42","d":{"i":["1","2","3"]}}          │
│ {"a":{"b":{"c":2}},"d":{"i":["4","5","6"]}}                   │
│ {"a":{"b":{"c":3}},"e":"Hello, World!"}                       │
│ {"a":{"b":{"c":4}},"c":"43"}                                  │
│ {"a":{"b":{"c":5}},"d":{"h":"2020-02-02 10:00:00.000000000"}} │
└───────────────────────────────────────────────────────────────┘
```

对于像 `CSV`/`TSV`/等的文本格式，`JSON` 是从包含 JSON 对象的字符串解析的：

```sql title="查询"
SELECT json FROM format(TSV, 'json JSON(a.b.c UInt32, SKIP a.b.d, SKIP REGEXP \'b.*\')',
'{"a" : {"b" : {"c" : 1, "d" : [0, 1]}}, "b" : "2020-01-01", "c" : 42, "d" : {"e" : {"f" : ["s1", "s2"]}, "i" : [1, 2, 3]}}
{"a" : {"b" : {"c" : 2, "d" : [2, 3]}}, "b" : [1, 2, 3], "c" : null, "d" : {"e" : {"g" : 43}, "i" : [4, 5, 6]}}
{"a" : {"b" : {"c" : 3, "d" : [4, 5]}}, "b" : {"c" : 10}, "e" : "Hello, World!"}
{"a" : {"b" : {"c" : 4, "d" : [6, 7]}}, "c" : 43}
{"a" : {"b" : {"c" : 5, "d" : [8, 9]}}, "b" : {"c" : 11, "j" : [1, 2, 3]}, "d" : {"e" : {"f" : ["s3", "s4"], "g" : 44}, "h" : "2020-02-02 10:00:00"}}')
```

```text title="响应"
┌─json──────────────────────────────────────────────────────────┐
│ {"a":{"b":{"c":1}},"c":"42","d":{"i":["1","2","3"]}}          │
│ {"a":{"b":{"c":2}},"d":{"i":["4","5","6"]}}                   │
│ {"a":{"b":{"c":3}},"e":"Hello, World!"}                       │
│ {"a":{"b":{"c":4}},"c":"43"}                                  │
│ {"a":{"b":{"c":5}},"d":{"h":"2020-02-02 10:00:00.000000000"}} │
└───────────────────────────────────────────────────────────────┘
```
## 达到 JSON 中动态路径的限制 {#reaching-the-limit-of-dynamic-paths-inside-json}

`JSON` 数据类型只能将有限数量的路径作为内部单独子列存储。 
默认情况下，此限制为 `1024`，但是您可以在类型声明中使用参数 `max_dynamic_paths` 更改此限制。

当达到限制时，插入到 `JSON` 列中的所有新路径将存储在单个共享数据结构中。 
仍然可以将这些路径作为子列读取，但将需要读取整个共享数据结构以提取该路径的值。 
此限制的设定是为了避免生成过多的不同子列，使得表无法使用。

让我们看看在几种不同情况下达到限制时会发生什么。
### 在数据解析期间达到限制 {#reaching-the-limit-during-data-parsing}

在从数据解析 `JSON` 对象时，当对当前数据块达到限制时，所有新路径将存储在共享数据结构中。我们可以使用以下两个 introspection 函数 `JSONDynamicPaths`，`JSONSharedDataPaths`：

```sql title="查询"
SELECT json, JSONDynamicPaths(json), JSONSharedDataPaths(json) FROM format(JSONEachRow, 'json JSON(max_dynamic_paths=3)', '
{"json" : {"a" : {"b" : 42}, "c" : [1, 2, 3]}}
{"json" : {"a" : {"b" : 43}, "d" : "2020-01-01"}}
{"json" : {"a" : {"b" : 44}, "c" : [4, 5, 6]}}
{"json" : {"a" : {"b" : 43}, "d" : "2020-01-02", "e" : "Hello", "f" : {"g" : 42.42}}}
{"json" : {"a" : {"b" : 43}, "c" : [7, 8, 9], "f" : {"g" : 43.43}, "h" : "World"}}
')
```

```text title="响应"
┌─json───────────────────────────────────────────────────────────┬─JSONDynamicPaths(json)─┬─JSONSharedDataPaths(json)─┐
│ {"a":{"b":"42"},"c":["1","2","3"]}                             │ ['a.b','c','d']        │ []                        │
│ {"a":{"b":"43"},"d":"2020-01-01"}                              │ ['a.b','c','d']        │ []                        │
│ {"a":{"b":"44"},"c":["4","5","6"]}                             │ ['a.b','c','d']        │ []                        │
│ {"a":{"b":"43"},"d":"2020-01-02","e":"Hello","f":{"g":42.42}}  │ ['a.b','c','d']        │ ['e','f.g']               │
│ {"a":{"b":"43"},"c":["7","8","9"],"f":{"g":43.43},"h":"World"} │ ['a.b','c','d']        │ ['f.g','h']               │
└────────────────────────────────────────────────────────────────┴────────────────────────┴───────────────────────────┘
```

正如我们所见，在插入路径 `e` 和 `f.g` 之后达到了限制， 
它们被插入到共享数据结构中。
### 在MergeTree表引擎中合并数据分片期间 {#during-merges-of-data-parts-in-mergetree-table-engines}

在`MergeTree`表的多个数据分片合并期间，生成的数据部分中的`JSON`列可能会达到动态路径的限制，并且无法将所有源部分的路径作为子列存储。在这种情况下，ClickHouse会选择哪些路径在合并后保留为子列，哪些路径会存储在共享数据结构中。在大多数情况下，ClickHouse会尝试保留包含最多非空值的路径，并将稀有的路径移到共享数据结构中。然而，这取决于具体的实现。

让我们看一个这样的合并示例。首先，我们创建一个具有`JSON`列的表，将动态路径的限制设置为`3`，然后插入具有`5`个不同路径的值：

```sql title="查询"
CREATE TABLE test (id UInt64, json JSON(max_dynamic_paths=3)) engine=MergeTree ORDER BY id;
SYSTEM STOP MERGES test;
INSERT INTO test SELECT number, formatRow('JSONEachRow', number as a) FROM numbers(5);
INSERT INTO test SELECT number, formatRow('JSONEachRow', number as b) FROM numbers(4);
INSERT INTO test SELECT number, formatRow('JSONEachRow', number as c) FROM numbers(3);
INSERT INTO test SELECT number, formatRow('JSONEachRow', number as d) FROM numbers(2);
INSERT INTO test SELECT number, formatRow('JSONEachRow', number as e) FROM numbers(1);
```

每次插入将创建一个单独的数据分片，`JSON`列包含一个路径：

```sql title="查询"
SELECT
    count(),
    groupArrayArrayDistinct(JSONDynamicPaths(json)) AS dynamic_paths,
    groupArrayArrayDistinct(JSONSharedDataPaths(json)) AS shared_data_paths,
    _part
FROM test
GROUP BY _part
ORDER BY _part ASC
```

```text title="响应"
┌─count()─┬─dynamic_paths─┬─shared_data_paths─┬─_part─────┐
│       5 │ ['a']         │ []                │ all_1_1_0 │
│       4 │ ['b']         │ []                │ all_2_2_0 │
│       3 │ ['c']         │ []                │ all_3_3_0 │
│       2 │ ['d']         │ []                │ all_4_4_0 │
│       1 │ ['e']         │ []                │ all_5_5_0 │
└─────────┴───────────────┴───────────────────┴───────────┘
```

现在，让我们将所有分片合并为一个，并查看会发生什么：

```sql title="查询"
SELECT
    count(),
    groupArrayArrayDistinct(JSONDynamicPaths(json)) AS dynamic_paths,
    groupArrayArrayDistinct(JSONSharedDataPaths(json)) AS shared_data_paths,
    _part
FROM test
GROUP BY _part
ORDER BY _part ASC
```

```text title="响应"
┌─count()─┬─dynamic_paths─┬─shared_data_paths─┬─_part─────┐
│      15 │ ['a','b','c'] │ ['d','e']         │ all_1_5_2 │
└─────────┴───────────────┴───────────────────┴───────────┘
```

如我们所见，ClickHouse保留了最常见的路径`a`、`b`和`c`，并将路径`d`和`e`移至共享数据结构中。

## 观察函数 {#introspection-functions}

有几个函数可以帮助检查JSON列的内容：
- [`JSONAllPaths`](../functions/json-functions.md#jsonallpaths)
- [`JSONAllPathsWithTypes`](../functions/json-functions.md#jsonallpathswithtypes)
- [`JSONDynamicPaths`](../functions/json-functions.md#jsondynamicpaths)
- [`JSONDynamicPathsWithTypes`](../functions/json-functions.md#jsondynamicpathswithtypes)
- [`JSONSharedDataPaths`](../functions/json-functions.md#jsonshareddatapaths)
- [`JSONSharedDataPathsWithTypes`](../functions/json-functions.md#jsonshareddatapathswithtypes)
- [`distinctDynamicTypes`](../aggregate-functions/reference/distinctdynamictypes.md)
- [`distinctJSONPaths and distinctJSONPathsAndTypes`](../aggregate-functions/reference/distinctjsonpaths.md)

**示例**

让我们检查[GH Archive](https://www.gharchive.org/)数据集中`2020-01-01`的内容：

```sql title="查询"
SELECT arrayJoin(distinctJSONPaths(json))
FROM s3('s3://clickhouse-public-datasets/gharchive/original/2020-01-01-*.json.gz', JSONAsObject) 
```

```text title="响应"
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

## ALTER MODIFY COLUMN 修改为JSON类型 {#alter-modify-column-to-json-type}

可以更改现有表并将列的类型更改为新的`JSON`类型。目前仅支持从`String`类型的`ALTER`。

**示例**

```sql title="查询"
CREATE TABLE test (json String) ENGINE=MergeTree ORDeR BY tuple();
INSERT INTO test VALUES ('{"a" : 42}'), ('{"a" : 43, "b" : "Hello"}'), ('{"a" : 44, "b" : [1, 2, 3]}'), ('{"c" : "2020-01-01"}');
ALTER TABLE test MODIFY COLUMN json JSON;
SELECT json, json.a, json.b, json.c FROM test;
```

```text title="响应"
┌─json─────────────────────────┬─json.a─┬─json.b──┬─json.c─────┐
│ {"a":"42"}                   │ 42     │ ᴺᵁᴸᴸ    │ ᴺᵁᴸᴸ       │
│ {"a":"43","b":"Hello"}       │ 43     │ Hello   │ ᴺᵁᴸᴸ       │
│ {"a":"44","b":["1","2","3"]} │ 44     │ [1,2,3] │ ᴺᵁᴸᴸ       │
│ {"c":"2020-01-01"}           │ ᴺᵁᴸᴸ   │ ᴺᵁᴸᴸ    │ 2020-01-01 │
└──────────────────────────────┴────────┴─────────┴────────────┘
```

## JSON类型值之间的比较 {#comparison-between-values-of-the-json-type}

`JSON`列的值无法使用`less/greater`函数进行比较，但可以使用`equal`函数进行比较。

当两个JSON对象具有相同的路径集合，并且每个路径在两个对象中具有相同的类型和值时，被认为是相等的。

例如：

```sql title="查询"
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

```text title="响应"
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

## 更好使用JSON类型的提示 {#tips-for-better-usage-of-the-json-type}

在创建`JSON`列并向其中加载数据之前，请考虑以下提示：

- 调查您的数据并尽可能多地指定路径提示及其类型。这将使存储和读取效率更高。
- 考虑您需要哪些路径以及哪些路径是永远不需要的。将您不需要的路径在`SKIP`部分中指定，必要时也可以在`SKIP REGEXP`部分中指定。这将改善存储。
- 不要将`max_dynamic_paths`参数设置为非常高的值，因为这可能会降低存储和读取效率。虽然高度依赖于系统参数，例如内存、CPU等，但一般经验法则是不要将`max_dynamic_paths`设置为> 10,000。

## 进一步阅读 {#further-reading}

- [我们是如何为ClickHouse构建一种强大的JSON数据类型的](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse)
- [十亿文档JSON挑战：ClickHouse与MongoDB、Elasticsearch等的对比](https://clickhouse.com/blog/json-bench-clickhouse-vs-mongodb-elasticsearch-duckdb-postgresql)
