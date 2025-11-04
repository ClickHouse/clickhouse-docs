---
'description': 'ClickHouse 中 JSON 数据类型的文档，它原生支持处理 JSON 数据'
'keywords':
- 'json'
- 'data type'
'sidebar_label': 'JSON'
'sidebar_position': 63
'slug': '/sql-reference/data-types/newjson'
'title': 'JSON 数据类型'
'doc_type': 'reference'
---

import {CardSecondary} from '@clickhouse/click-ui/bundled';
import Link from '@docusaurus/Link'

```jsx
<Link to="/docs/best-practices/use-json-where-appropriate" style={{display: 'flex', textDecoration: 'none', width: 'fit-content'}}>
<CardSecondary
  badgeState="success"
  badgeText=""
  description="查看我们的 JSON 最佳实践指南，了解使用 JSON 类型的示例、先进功能和注意事项。"
  icon="book"
  infoText="阅读更多"
  infoUrl="/docs/best-practices/use-json-where-appropriate"
  title="在寻找指南吗？"
/>
</Link>
<br/>

`JSON` 类型将 JavaScript 对象表示法 (JSON) 文档存储在单个列中。

:::note
在 ClickHouse 开源版本中，JSON 数据类型在 25.3 版本中标记为生产就绪。不建议在之前的版本中在生产中使用此类型。
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
其中上面语法中的参数定义如下：

| 参数                       | 描述                                                                                                                                                                                                                                                                                                                                                        | 默认值        |
|-----------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------|
| `max_dynamic_paths`         | 一个可选参数，指示可以单独存储为子列的路径数，这些子列跨单个数据块单独存储（例如，跨 MergeTree 表的单个数据部分）。<br/><br/>如果超过此限制，所有其他路径将一起存储在单个结构中。                                                                                                                                                       | `1024`        |
| `max_dynamic_types`         | 一个可选参数，介于 `1` 和 `255` 之间，指示在用类型 `Dynamic` 的单个路径列中可以存储多少种不同的数据类型，这些类型跨单个数据块单独存储（例如，跨 MergeTree 表的单个数据部分）。<br/><br/>如果超过此限制，所有新类型将被转换为类型 `String`。                                                                      | `32`          |
| `some.path TypeName`        | JSON 中特定路径的可选类型提示。此类路径将始终作为具有指定类型的子列存储。                                                                                                                                                                                                                                                                                   |               |
| `SKIP path.to.skip`         | 在 JSON 解析期间应跳过的特定路径的可选提示。此类路径将永远不会存储在 JSON 列中。如果指定路径是一个嵌套的 JSON 对象，则将跳过整个嵌套对象。                                                                                                                                                                                           |               |
| `SKIP REGEXP 'path_regexp'` | 一个可选提示，使用正则表达式来跳过在 JSON 解析期间的路径。所有与该正则表达式匹配的路径将永远不会存储在 JSON 列中。                                                                                                                                                                                                                                   |               |

## 创建 JSON {#creating-json}

在本节中，我们将查看创建 `JSON` 的各种方法。

### 在表列定义中使用 `JSON` {#using-json-in-a-table-column-definition}

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

### 使用 `::JSON` 进行 CAST {#using-cast-with-json}

可以使用特殊语法 `::JSON` 来强制转换各种类型。

#### 从 `String` 到 `JSON` 的 CAST {#cast-from-string-to-json}

```sql title="Query"
SELECT '{"a" : {"b" : 42},"c" : [1, 2, 3], "d" : "Hello, World!"}'::JSON AS json;
```

```text title="Response"
┌─json───────────────────────────────────────────────────┐
│ {"a":{"b":"42"},"c":["1","2","3"],"d":"Hello, World!"} │
└────────────────────────────────────────────────────────┘
```

#### 从 `Tuple` 到 `JSON` 的 CAST {#cast-from-tuple-to-json}

```sql title="Query"
SET enable_named_columns_in_function_tuple = 1;
SELECT (tuple(42 AS b) AS a, [1, 2, 3] AS c, 'Hello, World!' AS d)::JSON AS json;
```

```text title="Response"
┌─json───────────────────────────────────────────────────┐
│ {"a":{"b":"42"},"c":["1","2","3"],"d":"Hello, World!"} │
└────────────────────────────────────────────────────────┘
```

#### 从 `Map` 到 `JSON` 的 CAST {#cast-from-map-to-json}

```sql title="Query"
SET use_variant_as_common_type=1;
SELECT map('a', map('b', 42), 'c', [1,2,3], 'd', 'Hello, World!')::JSON AS json;
```

```text title="Response"
┌─json───────────────────────────────────────────────────┐
│ {"a":{"b":"42"},"c":["1","2","3"],"d":"Hello, World!"} │
└────────────────────────────────────────────────────────┘
```

#### 从弃用的 `Object('json')` 到 `JSON` 的 CAST {#cast-from-deprecated-objectjson-to-json}

```sql title="Query"
SET allow_experimental_object_type = 1;
SELECT '{"a" : {"b" : 42},"c" : [1, 2, 3], "d" : "Hello, World!"}'::Object('json')::JSON AS json;
```

```text title="Response"
┌─json───────────────────────────────────────────────────┐
│ {"a":{"b":"42"},"c":["1","2","3"],"d":"Hello, World!"} │
└────────────────────────────────────────────────────────┘
```

:::note
JSON 路径被存储为扁平化形式。这意味着当从路径 `a.b.c` 格式化 JSON 对象时，无法知道对象应该构建为 `{ "a.b.c" : ... }` 还是 `{ "a": { "b": { "c": ... }}}`。我们的实现将始终假设后者。

例如：

```sql
SELECT CAST('{"a.b.c" : 42}', 'JSON') AS json
```

将返回：

```response
   ┌─json───────────────────┐
1. │ {"a":{"b":{"c":"42"}}} │
   └────────────────────────┘
```

而且 **不是**：

```sql
   ┌─json───────────┐
1. │ {"a.b.c":"42"} │
   └────────────────┘
```
:::

## 将 JSON 路径作为子列读取 {#reading-json-paths-as-sub-columns}

`JSON` 类型支持将每个路径作为单独的子列读取。
如果请求的路径的类型没有在 JSON 类型声明中指定，则路径的子列将始终具有类型 [Dynamic](/sql-reference/data-types/dynamic.md)。

例如：

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

您还可以使用 `getSubcolumn` 函数从 JSON 类型读取子列：

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

如果在数据中未找到请求的路径，则将填写 `NULL` 值：

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

让我们检查返回的子列的数据类型：

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

如我们所见，对于 `a.b`，类型为 `UInt32`，正如我们在 JSON 类型声明中指定的那样，所有其他子列的类型为 `Dynamic`。

使用特殊语法 `json.some.path.:TypeName` 也可以读取 `Dynamic` 类型的子列：

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

`Dynamic` 子列可以被强制转换为任何数据类型。在这种情况下，如果 `Dynamic` 内部的类型无法强制转换为请求的类型，将抛出异常：

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
为了有效地从紧凑的 MergeTree 部分读取子列，请确保启用了 MergeTree 设置 [write_marks_for_substreams_in_compact_parts](../../operations/settings/merge-tree-settings.md#write_marks_for_substreams_in_compact_parts)。
:::

## 将 JSON 子对象作为子列读取 {#reading-json-sub-objects-as-sub-columns}

`JSON` 类型支持使用特殊语法 `json.^some.path` 将嵌套对象作为类型 `JSON` 的子列读取：

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
将子对象作为子列读取可能效率低下，因为这可能需要对 JSON 数据进行几乎完整的扫描。
:::

## 路径的类型推断 {#type-inference-for-paths}

在解析 `JSON` 时，ClickHouse 尝试为每个 JSON 路径检测最合适的数据类型。
它的工作方式类似于 [输入数据的自动模式推断](/interfaces/schema-inference.md)，
并受相同设置控制：

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

让我们来看一些例子：

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

## 处理 JSON 对象的数组 {#handling-arrays-of-json-objects}

包含对象数组的 JSON 路径被解析为类型 `Array(JSON)`，并插入到路径的 `Dynamic` 列中。
要读取对象数组，可以将其作为子列从 `Dynamic` 列中提取：

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

正如您可能已经注意到的，嵌套 `JSON` 类型的 `max_dynamic_types` / `max_dynamic_paths` 参数相较于默认值有所减少。
这是为了避免在 JSON 对象的嵌套数组上子列数量失控增长。

让我们尝试从嵌套 `JSON` 列中读取子列：

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

我们可以使用特殊语法避免写 `Array(JSON)` 子列名称：

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

路径后面的 `[]` 数量指示数组的级别。例如，`json.path[][]` 将被转换为 `json.path.:Array(Array(JSON))`

让我们检查我们 `Array(JSON)` 中的路径和类型：

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

让我们从 `Array(JSON)` 列中读取子列：

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

我们还可以从嵌套的 `JSON` 列中读取子对象子列：

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

## 处理带有点的 JSON 键 {#handling-json-keys-with-dots}

内部 JSON 列以扁平化形式存储所有路径和值。这意味着默认情况下，这两个对象被视为相同：
```json
{"a" : {"b" : 42}}
{"a.b" : 42}
```

它们都将内部存储为路径 `a.b` 和值 `42` 的一对。在格式化 JSON 时，我们始终根据用点分隔的路径部分形成嵌套对象：

```sql title="Query"
SELECT '{"a" : {"b" : 42}}'::JSON AS json1, '{"a.b" : 42}'::JSON AS json2, JSONAllPaths(json1), JSONAllPaths(json2);
```

```text title="Response"
┌─json1────────────┬─json2────────────┬─JSONAllPaths(json1)─┬─JSONAllPaths(json2)─┐
│ {"a":{"b":"42"}} │ {"a":{"b":"42"}} │ ['a.b']             │ ['a.b']             │
└──────────────────┴──────────────────┴─────────────────────┴─────────────────────┘
```

正如您所看到的，初始 JSON `{"a.b" : 42}` 现在被格式化为 `{"a" : {"b" : 42}}`。

此限制还会导致解析有效 JSON 对象失败，如下所示：

```sql title="Query"
SELECT '{"a.b" : 42, "a" : {"b" : "Hello World!"}}'::JSON AS json;
```

```text title="Response"
Code: 117. DB::Exception: Cannot insert data into JSON column: Duplicate path found during parsing JSON object: a.b. You can enable setting type_json_skip_duplicated_paths to skip duplicated paths during insert: In scope SELECT CAST('{"a.b" : 42, "a" : {"b" : "Hello, World"}}', 'JSON') AS json. (INCORRECT_DATA)
```

如果您想保留带点的键并避免将它们格式化为嵌套对象，可以启用设置 [json_type_escape_dots_in_keys](/operations/settings/formats#json_type_escape_dots_in_keys) （从 `25.8` 版本开始可用）。在这种情况下，在解析期间，JSON 键中的所有点将被转义为 `%2E`，并在格式化过程中反转义。

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

要将带有转义点的键作为子列读取，您必须在子列名称中使用转义点：

```sql title="Query"
SET json_type_escape_dots_in_keys=1;
SELECT '{"a.b" : 42, "a" : {"b" : "Hello World!"}}'::JSON AS json, json.`a%2Eb`, json.a.b;
```

```text title="Response"
┌─json──────────────────────────────────┬─json.a%2Eb─┬─json.a.b─────┐
│ {"a.b":"42","a":{"b":"Hello World!"}} │ 42         │ Hello World! │
└───────────────────────────────────────┴────────────┴──────────────┘
```

注意：由于标识符解析器和分析器的限制，子列 ``json.`a.b`\`` 等价于子列 `json.a.b`，并且不会读取带有转义点的路径：

```sql title="Query"
SET json_type_escape_dots_in_keys=1;
SELECT '{"a.b" : 42, "a" : {"b" : "Hello World!"}}'::JSON AS json, json.`a%2Eb`, json.`a.b`, json.a.b;
```

```text title="Response"
┌─json──────────────────────────────────┬─json.a%2Eb─┬─json.a.b─────┬─json.a.b─────┐
│ {"a.b":"42","a":{"b":"Hello World!"}} │ 42         │ Hello World! │ Hello World! │
└───────────────────────────────────────┴────────────┴──────────────┴──────────────┘
```

此外，如果您想为包含带有点的键的 JSON 路径指定提示（或在 `SKIP` / `SKIP REGEX` 部分中使用），必须在提示中使用转义点：

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

## 从数据读取 JSON 类型 {#reading-json-type-from-data}

所有文本格式
([`JSONEachRow`](../../interfaces/formats/JSON/JSONEachRow.md)，
[`TSV`](../../interfaces/formats/TabSeparated/TabSeparated.md)，
[`CSV`](../../interfaces/formats/CSV/CSV.md)，
[`CustomSeparated`](../../interfaces/formats/CustomSeparated/CustomSeparated.md)，
[`Values`](../../interfaces/formats/Values.md) 等) 支持读取 `JSON` 类型。

示例：

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

对于文本格式，如 `CSV` / `TSV` / 等，`JSON` 从包含 JSON 对象的字符串中解析：

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

## 达到 JSON 内部动态路径的限制 {#reaching-the-limit-of-dynamic-paths-inside-json}

`JSON` 数据类型只能内部存储有限数量的路径作为单独的子列。
默认情况下，此限制为 `1024`，但您可以使用参数 `max_dynamic_paths` 在类型声明中进行更改。

当达到这个限制时，插入到 `JSON` 列的所有新路径将存储在一个共享的数据结构中。
仍然可以将此类路径作为子列读取，
但可能效率较低（[参见共享数据部分](#shared-data-structure)）。
此限制是为了避免有大量不同子列，从而使表无法使用。

让我们看看在几个不同场景下达到限制时会发生什么。

### 在数据解析期间达到限制 {#reaching-the-limit-during-data-parsing}

在从数据中解析 `JSON` 对象时，当当前数据块达到限制时，
所有新路径将存储在共享数据结构中。我们可以使用以下两个 introspection 函数 `JSONDynamicPaths`，`JSONSharedDataPaths`：

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

正如我们所见，在插入路径 `e` 和 `f.g` 之后，达到了限制，
它们被插入到共享数据结构中。

### 在 MergeTree 表引擎中合并数据部分期间 {#during-merges-of-data-parts-in-mergetree-table-engines}

在 `MergeTree` 表中合并多个数据部分时，结果数据部分中的 `JSON` 列可能达到动态路径的限制 
并且无法将所有路径作为子列存储。
在这种情况下，ClickHouse 会选择哪些路径在合并后保持为子列，以及哪些路径将存储在共享数据结构中。
在大多数情况下，ClickHouse 会尝试保留包含
最大数量非空值的路径，并将最稀有的路径移入共享数据结构。这确实取决于实现。

让我们看一个这样的合并示例。
首先，让我们创建一个包含 `JSON` 列的表，将动态路径的限制设置为 `3`，然后插入具有 `5` 条不同路径的值：

```sql title="Query"
CREATE TABLE test (id UInt64, json JSON(max_dynamic_paths=3)) ENGINE=MergeTree ORDER BY id;
SYSTEM STOP MERGES test;
INSERT INTO test SELECT number, formatRow('JSONEachRow', number as a) FROM numbers(5);
INSERT INTO test SELECT number, formatRow('JSONEachRow', number as b) FROM numbers(4);
INSERT INTO test SELECT number, formatRow('JSONEachRow', number as c) FROM numbers(3);
INSERT INTO test SELECT number, formatRow('JSONEachRow', number as d) FROM numbers(2);
INSERT INTO test SELECT number, formatRow('JSONEachRow', number as e) FROM numbers(1);
```

每次插入都会创建一个包含单个路径的 `JSON` 列的单独数据部分：

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

现在，让我们将所有部分合并为一个，看看会发生什么：

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

正如我们所见，ClickHouse 保留了最常见的路径 `a`、`b` 和 `c` 并将路径 `d` 和 `e` 移入共享数据结构。

## 共享数据结构 {#shared-data-structure}

正如在上一节中所述，当 `max_dynamic_paths` 限制达到时，所有新路径将存储在一个共享数据结构中。
在本节中，我们将查看共享数据结构的详细信息以及如何从中读取路径子列。

有关用于检查 JSON 列内容的函数的详细信息，请参见节 ["introspection functions"](/sql-reference/data-types/newjson#introspection-functions)。

### 内存中的共享数据结构 {#shared-data-structure-in-memory}

在内存中，共享数据结构只是一个类型为 `Map(String, String)` 的子列，用于存储从扁平化 JSON 路径到二进制编码值的映射。
要从中提取路径子列，我们只需遍历此 `Map` 列中的所有行，并尝试找到请求的路径及其值。

### 在 MergeTree 部分中的共享数据结构 {#shared-data-structure-in-merge-tree-parts}

在 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表中，我们在数据部分中存储数据，这些数据存储在磁盘上（本地或远程）。而存储在磁盘上的数据可以以不同于内存的方式存储。
目前，MergeTree 数据部分中有三种不同的共享数据结构序列化：`map`、`map_with_buckets` 和 `advanced`。

序列化版本由 MergeTree
设置 [object_shared_data_serialization_version](../../operations/settings/merge-tree-settings.md#object_shared_data_serialization_version)
和 [object_shared_data_serialization_version_for_zero_level_parts](../../operations/settings/merge-tree-settings.md#object_shared_data_serialization_version_for_zero_level_parts) 控制
（零级部分是在将数据插入表时创建的，合并期间部分具有更高级别）。

注意：仅支持更改 `v3` [对象序列化版本](../../operations/settings/merge-tree-settings.md#object_serialization_version) 的共享数据结构序列化

#### Map {#shared-data-map}

在 `map` 序列化版本中，共享数据序列化为类型为 `Map(String, String)` 的单列，与它在内存中存储的相同。要从此类型的序列化中读取路径子列，ClickHouse 读取整个 `Map` 列并在内存中提取请求的路径。

此序列化对写入数据和读取整个 `JSON` 列效率较高，但对读取路径子列效率较低。

#### 带有桶的 Map {#shared-data-map-with-buckets} 

在 `map_with_buckets` 序列化版本中，共享数据序列化为 `N` 列（“桶”），类型为 `Map(String, String)`。
每个这样的桶仅包含路径的子集。要从此类型的序列化中读取路径子列，ClickHouse 从单个桶读取整个 `Map` 列并在内存中提取请求的路径。

此序列化对写入数据和读取整个 `JSON` 列效率较低，但对读取路径子列更高效，因为它仅从所需的桶中读取数据。

桶的数量 `N` 由 MergeTree 设置 [object_shared_data_buckets_for_compact_part](../../operations/settings/merge-tree-settings.md#object_shared_data_buckets_for_compact_part)（默认 8）和 [object_shared_data_buckets_for_wide_part](../../operations/settings/merge-tree-settings.md#object_shared_data_buckets_for_wide_part)（默认 32）控制。

#### 先进 {#shared-data-advanced}

在 `advanced` 序列化版本中，共享数据以一种特殊的数据结构进行序列化，该结构通过存储一些附加信息来最大化路径子列读取的性能，允许仅读取请求路径的数据。
此序列化还支持桶，因此每个桶仅包含路径的子集。

此序列化对写入数据非常低效（因此不建议在零级部分使用此序列化），读取整个 `JSON` 列与 `map` 序列化相比稍微低效，但对读取路径子列非常有效。

注意：由于在数据结构中存储一些附加信息，因此与 `map` 和 `map_with_buckets` 序列化相比，此序列化的磁盘存储大小更高。

## Introspection 函数 {#introspection-functions}

有几个函数可以帮助检查 JSON 列的内容：
- [`JSONAllPaths`](../functions/json-functions.md#JSONAllPaths)
- [`JSONAllPathsWithTypes`](../functions/json-functions.md#JSONAllPathsWithTypes)
- [`JSONDynamicPaths`](../functions/json-functions.md#JSONDynamicPaths)
- [`JSONDynamicPathsWithTypes`](../functions/json-functions.md#JSONDynamicPathsWithTypes)
- [`JSONSharedDataPaths`](../functions/json-functions.md#JSONSharedDataPaths)
- [`JSONSharedDataPathsWithTypes`](../functions/json-functions.md#JSONSharedDataPathsWithTypes)
- [`distinctDynamicTypes`](../aggregate-functions/reference/distinctdynamictypes.md)
- [`distinctJSONPaths and distinctJSONPathsAndTypes`](../aggregate-functions/reference/distinctjsonpaths.md)

**示例**

让我们检查 `2020-01-01` 的 [GH Archive](https://www.gharchive.org/) 数据集的内容：

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

## ALTER MODIFY COLUMN 转换为 JSON 类型 {#alter-modify-column-to-json-type}

可以更改现有表并将列类型更改为新的 `JSON` 类型。目前仅支持从 `String` 类型进行 `ALTER`。

**示例**

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

## 比较 JSON 类型值 {#comparison-between-values-of-the-json-type}

JSON 对象的比较方式类似于 Maps。

例如：

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

**注意：** 当两个路径包含不同数据类型的值时，它们会根据 `Variant` 数据类型的 [比较规则](/sql-reference/data-types/variant#comparing-values-of-variant-data) 进行比较。

## 提高 JSON 类型使用效率的技巧 {#tips-for-better-usage-of-the-json-type}

在创建 `JSON` 列并将数据加载到其中之前，请考虑以下建议：

- 调查您的数据，并尽可能指定尽量多的路径提示和类型。这会使存储和读取更加高效。
- 考虑您需要哪些路径以及您绝对不会需要哪些路径。将您不会需要的路径在 `SKIP` 部分中指定，如果需要，在 `SKIP REGEXP` 部分中也指定。这将改善存储。
- 不要将 `max_dynamic_paths` 参数设置为非常高的值，因为这可能会降低存储和读取的效率。
  虽然这在很大程度上依赖于系统参数，如内存、CPU 等，但一般经验法则是：不要将 `max_dynamic_paths` 设置大于 10 000 对于本地文件系统存储，和 1024 对于远程文件系统存储。

## 进一步阅读 {#further-reading}

- [我们是如何为 ClickHouse 构建一个新的强大的 JSON 数据类型的](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse)
- [十亿文档的 JSON 挑战：ClickHouse 与 MongoDB、Elasticsearch 等的比较](https://clickhouse.com/blog/json-bench-clickhouse-vs-mongodb-elasticsearch-duckdb-postgresql)
