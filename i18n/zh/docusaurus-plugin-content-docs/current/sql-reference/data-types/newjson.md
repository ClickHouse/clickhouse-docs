---
description: 'ClickHouse 中 JSON 数据类型的文档，该类型原生支持对 JSON 数据的处理'
keywords: ['json', 'data type']
sidebar_label: 'JSON'
sidebar_position: 63
slug: /sql-reference/data-types/newjson
title: 'JSON 数据类型'
doc_type: 'reference'
---

import {CardSecondary} from '@clickhouse/click-ui/bundled';
import Link from '@docusaurus/Link'

<Link to="/docs/best-practices/use-json-where-appropriate" style={{display: 'flex', textDecoration: 'none', width: 'fit-content'}}>
  <CardSecondary badgeState="success" badgeText="" description="查看我们的 JSON 最佳实践指南，了解示例、高级功能以及使用 JSON 类型时需要考虑的事项。" icon="book" infoText="阅读更多" infoUrl="/docs/best-practices/use-json-where-appropriate" title="需要使用指南？" />
</Link>

<br />

`JSON` 类型在单个列中存储 JSON（JavaScript 对象表示法）文档。

:::note
在 ClickHouse 开源版中，JSON 数据类型从 25.3 版本起被标记为可用于生产环境。不建议在更早的版本中将该类型用于生产环境。
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

上述语法中的参数定义如下：

| 参数                          | 描述                                                                                                                                                                 | 默认值    |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| `max_dynamic_paths`         | 一个可选参数，用于指示在单个（独立存储的）数据块中（例如 MergeTree 表的单个数据部分 data part），有多少个路径可以作为子列单独存储。<br /><br />如果超过该限制，其余所有路径将被一起存储在同一个结构中。                                               | `1024` |
| `max_dynamic_types`         | 一个介于 `1` 和 `255` 之间的可选参数，用于指示在单个（独立存储的）数据块中（例如 MergeTree 表的单个数据部分 data part），在具有 `Dynamic` 类型的单个路径列中最多可以存储多少种不同的数据类型。<br /><br />如果超过该限制，所有新增类型都将被转换为 `String` 类型。 | `32`   |
| `some.path TypeName`        | 针对 JSON 中特定路径的可选类型提示。此类路径将始终以指定类型的子列形式进行存储。                                                                                                                        |        |
| `SKIP path.to.skip`         | 针对在 JSON 解析时应被跳过的特定路径的可选提示。此类路径将不会被存储在 JSON 列中。如果指定路径是嵌套 JSON 对象，则整个嵌套对象都会被跳过。                                                                                     |        |
| `SKIP REGEXP 'path_regexp'` | 一个可选提示，使用正则表达式在 JSON 解析期间跳过路径。所有与该正则表达式匹配的路径都不会被存储在 JSON 列中。                                                                                                       |        |


## 创建 JSON {#creating-json}

本节将介绍创建 `JSON` 的各种方法。

### 在表列定义中使用 `JSON` {#using-json-in-a-table-column-definition}

```sql title="查询(示例 1)"
CREATE TABLE test (json JSON) ENGINE = Memory;
INSERT INTO test VALUES ('{"a" : {"b" : 42}, "c" : [1, 2, 3]}'), ('{"f" : "Hello, World!"}'), ('{"a" : {"b" : 43, "e" : 10}, "c" : [4, 5, 6]}');
SELECT json FROM test;
```

```text title="响应(示例 1)"
┌─json────────────────────────────────────────┐
│ {"a":{"b":"42"},"c":["1","2","3"]}          │
│ {"f":"Hello, World!"}                       │
│ {"a":{"b":"43","e":"10"},"c":["4","5","6"]} │
└─────────────────────────────────────────────┘
```

```sql title="查询(示例 2)"
CREATE TABLE test (json JSON(a.b UInt32, SKIP a.e)) ENGINE = Memory;
INSERT INTO test VALUES ('{"a" : {"b" : 42}, "c" : [1, 2, 3]}'), ('{"f" : "Hello, World!"}'), ('{"a" : {"b" : 43, "e" : 10}, "c" : [4, 5, 6]}');
SELECT json FROM test;
```

```text title="响应(示例 2)"
┌─json──────────────────────────────┐
│ {"a":{"b":42},"c":["1","2","3"]}  │
│ {"a":{"b":0},"f":"Hello, World!"} │
│ {"a":{"b":43},"c":["4","5","6"]}  │
└───────────────────────────────────┘
```

### 使用 CAST 与 `::JSON` {#using-cast-with-json}

可以使用特殊语法 `::JSON` 对各种类型进行转换。

#### 从 `String` 转换为 `JSON` {#cast-from-string-to-json}

```sql title="查询"
SELECT '{"a" : {"b" : 42},"c" : [1, 2, 3], "d" : "Hello, World!"}'::JSON AS json;
```

```text title="响应"
┌─json───────────────────────────────────────────────────┐
│ {"a":{"b":"42"},"c":["1","2","3"],"d":"Hello, World!"} │
└────────────────────────────────────────────────────────┘
```

#### 从 `Tuple` 转换为 `JSON` {#cast-from-tuple-to-json}

```sql title="查询"
SET enable_named_columns_in_function_tuple = 1;
SELECT (tuple(42 AS b) AS a, [1, 2, 3] AS c, 'Hello, World!' AS d)::JSON AS json;
```

```text title="响应"
┌─json───────────────────────────────────────────────────┐
│ {"a":{"b":"42"},"c":["1","2","3"],"d":"Hello, World!"} │
└────────────────────────────────────────────────────────┘
```

#### 从 `Map` 转换为 `JSON` {#cast-from-map-to-json}

```sql title="查询"
SET use_variant_as_common_type=1;
SELECT map('a', map('b', 42), 'c', [1,2,3], 'd', 'Hello, World!')::JSON AS json;
```

```text title="响应"
┌─json───────────────────────────────────────────────────┐
│ {"a":{"b":"42"},"c":["1","2","3"],"d":"Hello, World!"} │
└────────────────────────────────────────────────────────┘
```

:::note
JSON 路径以扁平化方式存储。这意味着当从类似 `a.b.c` 的路径格式化 JSON 对象时,
无法确定该对象应构造为 `{ "a.b.c" : ... }` 还是 `{ "a": { "b": { "c": ... } } }`。
我们的实现始终采用后者。

例如:

```sql
SELECT CAST('{"a.b.c" : 42}', 'JSON') AS json
```

将返回:

```response
   ┌─json───────────────────┐
1. │ {"a":{"b":{"c":"42"}}} │
   └────────────────────────┘
```

而**不是**:


```sql
   ┌─json───────────┐
1. │ {"a.b.c":"42"} │
   └────────────────┘
```

:::


## 将 JSON 路径作为子列读取 {#reading-json-paths-as-sub-columns}

`JSON` 类型支持将每个路径作为独立的子列读取。
如果在 JSON 类型声明中未指定请求路径的类型,
则该路径的子列将始终为 [Dynamic](/sql-reference/data-types/dynamic.md) 类型。

例如:

```sql title="查询"
CREATE TABLE test (json JSON(a.b UInt32, SKIP a.e)) ENGINE = Memory;
INSERT INTO test VALUES ('{"a" : {"b" : 42, "g" : 42.42}, "c" : [1, 2, 3], "d" : "2020-01-01"}'), ('{"f" : "Hello, World!", "d" : "2020-01-02"}'), ('{"a" : {"b" : 43, "e" : 10, "g" : 43.43}, "c" : [4, 5, 6]}');
SELECT json FROM test;
```

```text title="响应"
┌─json────────────────────────────────────────────────────────┐
│ {"a":{"b":42,"g":42.42},"c":["1","2","3"],"d":"2020-01-01"} │
│ {"a":{"b":0},"d":"2020-01-02","f":"Hello, World!"}          │
│ {"a":{"b":43,"g":43.43},"c":["4","5","6"]}                  │
└─────────────────────────────────────────────────────────────┘
```

```sql title="查询(将 JSON 路径作为子列读取)"
SELECT json.a.b, json.a.g, json.c, json.d FROM test;
```

```text title="响应(将 JSON 路径作为子列读取)"
┌─json.a.b─┬─json.a.g─┬─json.c──┬─json.d─────┐
│       42 │ 42.42    │ [1,2,3] │ 2020-01-01 │
│        0 │ ᴺᵁᴸᴸ     │ ᴺᵁᴸᴸ    │ 2020-01-02 │
│       43 │ 43.43    │ [4,5,6] │ ᴺᵁᴸᴸ       │
└──────────┴──────────┴─────────┴────────────┘
```

您也可以使用 `getSubcolumn` 函数从 JSON 类型中读取子列:

```sql title="查询"
SELECT getSubcolumn(json, 'a.b'), getSubcolumn(json, 'a.g'), getSubcolumn(json, 'c'), getSubcolumn(json, 'd') FROM test;
```

```text title="响应"
┌─getSubcolumn(json, 'a.b')─┬─getSubcolumn(json, 'a.g')─┬─getSubcolumn(json, 'c')─┬─getSubcolumn(json, 'd')─┐
│                        42 │ 42.42                     │ [1,2,3]                 │ 2020-01-01              │
│                         0 │ ᴺᵁᴸᴸ                      │ ᴺᵁᴸᴸ                    │ 2020-01-02              │
│                        43 │ 43.43                     │ [4,5,6]                 │ ᴺᵁᴸᴸ                    │
└───────────────────────────┴───────────────────────────┴─────────────────────────┴─────────────────────────┘
```

如果在数据中未找到请求的路径,将使用 `NULL` 值填充:

```sql title="查询"
SELECT json.non.existing.path FROM test;
```

```text title="响应"
┌─json.non.existing.path─┐
│ ᴺᵁᴸᴸ                   │
│ ᴺᵁᴸᴸ                   │
│ ᴺᵁᴸᴸ                   │
└────────────────────────┘
```

让我们检查返回的子列的数据类型:

```sql title="查询"
SELECT toTypeName(json.a.b), toTypeName(json.a.g), toTypeName(json.c), toTypeName(json.d) FROM test;
```


```text title="Response"
┌─toTypeName(json.a.b)─┬─toTypeName(json.a.g)─┬─toTypeName(json.c)─┬─toTypeName(json.d)─┐
│ UInt32               │ Dynamic              │ Dynamic            │ Dynamic            │
│ UInt32               │ Dynamic              │ Dynamic            │ Dynamic            │
│ UInt32               │ Dynamic              │ Dynamic            │ Dynamic            │
└──────────────────────┴──────────────────────┴────────────────────┴────────────────────┘
```

可以看到，对于 `a.b`，其类型是我们在 JSON 类型声明中指定的 `UInt32`，
而所有其他子列的类型都是 `Dynamic`。

还可以使用特殊语法 `json.some.path.:TypeName` 来读取 `Dynamic` 类型的子列：

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

`Dynamic` 子列可以被转换为任意数据类型。如果 `Dynamic` 内部的类型无法转换为目标类型，则会抛出异常：

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
从服务器收到异常:
Code: 48. DB::Exception: Received from localhost:9000. DB::Exception: 
不支持数值类型与 UUID 之间的转换。
传递的 UUID 可能未加引号: 
执行 'FUNCTION CAST(__table1.json.a.g :: 2, 'UUID'_String :: 1) -> CAST(__table1.json.a.g, 'UUID'_String) UUID : 0' 时。
(NOT_IMPLEMENTED)
```

:::note
要高效读取 Compact MergeTree 数据片段中的子列，请确保已启用 MergeTree 设置 [write&#95;marks&#95;for&#95;substreams&#95;in&#95;compact&#95;parts](../../operations/settings/merge-tree-settings.md#write_marks_for_substreams_in_compact_parts)。
:::


## 将 JSON 子对象读取为子列 {#reading-json-sub-objects-as-sub-columns}

`JSON` 类型支持使用特殊语法 `json.^some.path` 将嵌套对象作为 `JSON` 类型的子列读取:

```sql title="查询"
CREATE TABLE test (json JSON) ENGINE = Memory;
INSERT INTO test VALUES ('{"a" : {"b" : {"c" : 42, "g" : 42.42}}, "c" : [1, 2, 3], "d" : {"e" : {"f" : {"g" : "Hello, World", "h" : [1, 2, 3]}}}}'), ('{"f" : "Hello, World!", "d" : {"e" : {"f" : {"h" : [4, 5, 6]}}}}'), ('{"a" : {"b" : {"c" : 43, "e" : 10, "g" : 43.43}}, "c" : [4, 5, 6]}');
SELECT json FROM test;
```

```text title="响应"
┌─json──────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ {"a":{"b":{"c":"42","g":42.42}},"c":["1","2","3"],"d":{"e":{"f":{"g":"Hello, World","h":["1","2","3"]}}}} │
│ {"d":{"e":{"f":{"h":["4","5","6"]}}},"f":"Hello, World!"}                                                 │
│ {"a":{"b":{"c":"43","e":"10","g":43.43}},"c":["4","5","6"]}                                               │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

```sql title="查询"
SELECT json.^a.b, json.^d.e.f FROM test;
```

```text title="响应"
┌─json.^`a`.b───────────────────┬─json.^`d`.e.f──────────────────────────┐
│ {"c":"42","g":42.42}          │ {"g":"Hello, World","h":["1","2","3"]} │
│ {}                            │ {"h":["4","5","6"]}                    │
│ {"c":"43","e":"10","g":43.43} │ {}                                     │
└───────────────────────────────┴────────────────────────────────────────┘
```

:::note
将子对象读取为子列可能效率不高,因为这可能需要对 JSON 数据进行近乎完整的扫描。
:::


## 路径类型推断 {#type-inference-for-paths}

在解析 `JSON` 时,ClickHouse 会尝试为每个 JSON 路径检测最合适的数据类型。
其工作方式类似于[从输入数据自动推断架构](/interfaces/schema-inference.md),
并由以下相同的设置控制:

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

下面是一些示例:

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

包含对象数组的 JSON 路径会被解析为 `Array(JSON)` 类型,并插入到该路径对应的 `Dynamic` 列中。
要读取对象数组,可以将其作为子列从 `Dynamic` 列中提取:

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

如您所见,嵌套 `JSON` 类型的 `max_dynamic_types`/`max_dynamic_paths` 参数相比默认值有所减少。
这样做是为了避免 JSON 对象嵌套数组的子列数量无限制地增长。

下面尝试从嵌套的 `JSON` 列中读取子列:

```sql title="查询"
SELECT json.a.b.:`Array(JSON)`.c, json.a.b.:`Array(JSON)`.f, json.a.b.:`Array(JSON)`.d FROM test;
```


```text title="Response"
┌─json.a.b.:`Array(JSON)`.c─┬─json.a.b.:`Array(JSON)`.f───────────────────────────────────┬─json.a.b.:`Array(JSON)`.d─┐
│ [42,43,NULL]              │ [[['{"g":42.42}']],NULL,[['{"g":43.43,"h":"2020-01-01"}']]] │ ['Hello',NULL,'My']       │
│ []                        │ []                                                          │ []                        │
│ [44,NULL]                 │ [[['{"h":"2020-01-02"}']],[['{"g":44.44}']]]                │ [NULL,'World']            │
└───────────────────────────┴─────────────────────────────────────────────────────────────┴───────────────────────────┘
```

我们可以使用一种特殊语法来避免书写 `Array(JSON)` 子列名：

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

路径后面的 `[]` 个数表示数组的嵌套层级。例如，`json.path[][]` 会被解析为 `json.path.:Array(Array(JSON))`

让我们检查一下 `Array(JSON)` 内部的路径和类型：

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

我们还可以从嵌套的 `JSON` 列中读取子对象中的子列：

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


## 处理包含 NULL 的 JSON 键 {#handling-json-keys-with-nulls}

在 ClickHouse 的 JSON 实现中，`null` 值和缺失值被视为等价：

```sql title="Query"
SELECT '{}'::JSON AS json1, '{"a" : null}'::JSON AS json2, json1 = json2
```

```text title="Response"
┌─json1─┬─json2─┬─equals(json1, json2)─┐
│ {}    │ {}    │                    1 │
└───────┴───────┴──────────────────────┘
```

这意味着无法判断原始 JSON 数据中某个路径是包含 NULL 值，还是完全不存在该路径。


## 处理包含点号的 JSON 键 {#handling-json-keys-with-dots}

JSON 列在内部以扁平化形式存储所有路径和值。这意味着默认情况下,以下两个对象被视为相同:

```json
{"a" : {"b" : 42}}
{"a.b" : 42}
```

它们都将在内部存储为路径 `a.b` 和值 `42` 的键值对。在格式化 JSON 时,我们始终根据点号分隔的路径部分来构建嵌套对象:

```sql title="查询"
SELECT '{"a" : {"b" : 42}}'::JSON AS json1, '{"a.b" : 42}'::JSON AS json2, JSONAllPaths(json1), JSONAllPaths(json2);
```

```text title="响应"
┌─json1────────────┬─json2────────────┬─JSONAllPaths(json1)─┬─JSONAllPaths(json2)─┐
│ {"a":{"b":"42"}} │ {"a":{"b":"42"}} │ ['a.b']             │ ['a.b']             │
└──────────────────┴──────────────────┴─────────────────────┴─────────────────────┘
```

如您所见,原始 JSON `{"a.b" : 42}` 现在被格式化为 `{"a" : {"b" : 42}}`。

此限制还会导致解析以下有效 JSON 对象时失败:

```sql title="查询"
SELECT '{"a.b" : 42, "a" : {"b" : "Hello World!"}}'::JSON AS json;
```

```text title="响应"
Code: 117. DB::Exception: Cannot insert data into JSON column: Duplicate path found during parsing JSON object: a.b. You can enable setting type_json_skip_duplicated_paths to skip duplicated paths during insert: In scope SELECT CAST('{"a.b" : 42, "a" : {"b" : "Hello, World"}}', 'JSON') AS json. (INCORRECT_DATA)
```

如果您想保留包含点号的键并避免将它们格式化为嵌套对象,可以启用设置 [json_type_escape_dots_in_keys](/operations/settings/formats#json_type_escape_dots_in_keys)(从版本 `25.8` 开始可用)。在这种情况下,解析期间 JSON 键中的所有点号将被转义为 `%2E`,并在格式化期间反转义。

```sql title="查询"
SET json_type_escape_dots_in_keys=1;
SELECT '{"a" : {"b" : 42}}'::JSON AS json1, '{"a.b" : 42}'::JSON AS json2, JSONAllPaths(json1), JSONAllPaths(json2);
```

```text title="响应"
┌─json1────────────┬─json2────────┬─JSONAllPaths(json1)─┬─JSONAllPaths(json2)─┐
│ {"a":{"b":"42"}} │ {"a.b":"42"} │ ['a.b']             │ ['a%2Eb']           │
└──────────────────┴──────────────┴─────────────────────┴─────────────────────┘
```

```sql title="查询"
SET json_type_escape_dots_in_keys=1;
SELECT '{"a.b" : 42, "a" : {"b" : "Hello World!"}}'::JSON AS json, JSONAllPaths(json);
```

```text title="响应"
┌─json──────────────────────────────────┬─JSONAllPaths(json)─┐
│ {"a.b":"42","a":{"b":"Hello World!"}} │ ['a%2Eb','a.b']    │
└───────────────────────────────────────┴────────────────────┘
```

要将包含转义点号的键作为子列读取,您必须在子列名称中使用转义点号:

```sql title="查询"
SET json_type_escape_dots_in_keys=1;
SELECT '{"a.b" : 42, "a" : {"b" : "Hello World!"}}'::JSON AS json, json.`a%2Eb`, json.a.b;
```

```text title="响应"
┌─json──────────────────────────────────┬─json.a%2Eb─┬─json.a.b─────┐
│ {"a.b":"42","a":{"b":"Hello World!"}} │ 42         │ Hello World! │
└───────────────────────────────────────┴────────────┴──────────────┘
```

注意:由于标识符解析器和分析器的限制,子列 `` json.`a.b` `` 等同于子列 `json.a.b`,不会读取包含转义点号的路径:


```sql title="Query"
SET json_type_escape_dots_in_keys=1;
SELECT '{"a.b" : 42, "a" : {"b" : "Hello World!"}}'::JSON AS json, json.`a%2Eb`, json.`a.b`, json.a.b;
```

```text title="Response"
┌─json──────────────────────────────────┬─json.a%2Eb─┬─json.a.b─────┬─json.a.b─────┐
│ {"a.b":"42","a":{"b":"Hello World!"}} │ 42         │ Hello World! │ Hello World! │
└───────────────────────────────────────┴────────────┴──────────────┴──────────────┘
```

另外，如果你想为键名中包含点号的 JSON 路径指定 hint（或在 `SKIP`/`SKIP REGEX` 部分中使用它），则必须在 hint 中使用转义的点号：

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
│ {"a":{"b":"你好世界!"}} │ ᴺᵁᴸᴸ       │
└────────────────────────────┴────────────┘
```


## 从数据中读取 JSON 类型 {#reading-json-type-from-data}

所有文本格式
([`JSONEachRow`](/interfaces/formats/JSONEachRow)、
[`TSV`](/interfaces/formats/TabSeparated)、
[`CSV`](/interfaces/formats/CSV)、
[`CustomSeparated`](/interfaces/formats/CustomSeparated)、
[`Values`](/interfaces/formats/Values) 等)均支持读取 `JSON` 类型。

示例:

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

对于 `CSV`/`TSV` 等文本格式,`JSON` 类型将从包含 JSON 对象的字符串中解析:


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
│ {"a":{"b":{"c":3}},"e":"你好，世界！"}                       │
│ {"a":{"b":{"c":4}},"c":"43"}                                  │
│ {"a":{"b":{"c":5}},"d":{"h":"2020-02-02 10:00:00.000000000"}} │
└───────────────────────────────────────────────────────────────┘
```


## 达到 JSON 内部动态路径的限制 {#reaching-the-limit-of-dynamic-paths-inside-json}

`JSON` 数据类型在内部只能将有限数量的路径存储为独立的子列。
默认情况下,此限制为 `1024`,但您可以在类型声明中使用参数 `max_dynamic_paths` 更改此限制。

当达到限制时,插入到 `JSON` 列的所有新路径都将存储在单个共享数据结构中。
仍然可以将这些路径作为子列读取,
但效率可能会较低([参见关于共享数据的章节](#shared-data-structure))。
设置此限制是为了避免产生大量不同的子列,从而导致表无法使用。

让我们看看在几种不同场景下达到限制时会发生什么。

### 数据解析期间达到限制 {#reaching-the-limit-during-data-parsing}

在从数据解析 `JSON` 对象期间,当当前数据块达到限制时,
所有新路径都将存储在共享数据结构中。我们可以使用以下两个内省函数 `JSONDynamicPaths`、`JSONSharedDataPaths`:

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

如我们所见,在插入路径 `e` 和 `f.g` 后达到了限制,
它们被插入到了共享数据结构中。

### MergeTree 表引擎中数据部分合并期间 {#during-merges-of-data-parts-in-mergetree-table-engines}

在 `MergeTree` 表中合并多个数据部分期间,结果数据部分中的 `JSON` 列可能会达到动态路径的限制,
并且无法将源部分中的所有路径存储为子列。
在这种情况下,ClickHouse 会选择哪些路径在合并后保留为子列,哪些路径将存储在共享数据结构中。
在大多数情况下,ClickHouse 会尝试保留包含
最多非空值的路径,并将最罕见的路径移至共享数据结构。但是,这取决于具体实现。

让我们看一个这样的合并示例。
首先,让我们创建一个带有 `JSON` 列的表,将动态路径的限制设置为 `3`,然后插入具有 `5` 个不同路径的值:


```sql title="Query"
CREATE TABLE test (id UInt64, json JSON(max_dynamic_paths=3)) ENGINE=MergeTree ORDER BY id;
SYSTEM STOP MERGES test;
INSERT INTO test SELECT number, formatRow('JSONEachRow', number as a) FROM numbers(5);
INSERT INTO test SELECT number, formatRow('JSONEachRow', number as b) FROM numbers(4);
INSERT INTO test SELECT number, formatRow('JSONEachRow', number as c) FROM numbers(3);
INSERT INTO test SELECT number, formatRow('JSONEachRow', number as d) FROM numbers(2);
INSERT INTO test SELECT number, formatRow('JSONEachRow', number as e) FROM numbers(1);
```

每次插入操作都会创建一个单独的数据部分，其中 `JSON` 列仅包含一个路径：

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

现在，让我们把所有部分合并在一起，看看会发生什么：

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

如上所示，ClickHouse 保留了最常见的路径 `a`、`b` 和 `c`，并将路径 `d` 和 `e` 放入了一个共享的数据结构中。


## 共享数据结构 {#shared-data-structure}

如前一节所述,当达到 `max_dynamic_paths` 限制时,所有新路径都会存储在单个共享数据结构中。
本节将详细介绍共享数据结构的细节以及如何从中读取路径子列。

有关用于检查 JSON 列内容的函数详情,请参阅["内省函数"](/sql-reference/data-types/newjson#introspection-functions)部分。

### 内存中的共享数据结构 {#shared-data-structure-in-memory}

在内存中,共享数据结构是一个类型为 `Map(String, String)` 的子列,用于存储从扁平化 JSON 路径到二进制编码值的映射。
要从中提取路径子列,只需遍历此 `Map` 列中的所有行,并查找请求的路径及其值。

### MergeTree 数据部分中的共享数据结构 {#shared-data-structure-in-merge-tree-parts}

在 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表中,数据存储在数据部分中,这些数据部分将所有内容存储在磁盘上(本地或远程)。磁盘上的数据存储方式可能与内存中不同。
目前,MergeTree 数据部分中有 3 种不同的共享数据结构序列化方式:`map`、`map_with_buckets` 和 `advanced`。

序列化版本由 MergeTree 设置 [object_shared_data_serialization_version](../../operations/settings/merge-tree-settings.md#object_shared_data_serialization_version) 和 [object_shared_data_serialization_version_for_zero_level_parts](../../operations/settings/merge-tree-settings.md#object_shared_data_serialization_version_for_zero_level_parts) 控制(零级部分是在向表中插入数据时创建的部分,合并期间的部分具有更高的级别)。

注意:仅 `v3` [对象序列化版本](../../operations/settings/merge-tree-settings.md#object_serialization_version)支持更改共享数据结构序列化方式。

#### Map {#shared-data-map}

在 `map` 序列化版本中,共享数据被序列化为单个类型为 `Map(String, String)` 的列,与其在内存中的存储方式相同。要从这种序列化类型中读取路径子列,ClickHouse 会读取整个 `Map` 列并在内存中提取请求的路径。

这种序列化方式对于写入数据和读取整个 `JSON` 列是高效的,但对于读取路径子列效率不高。

#### 带桶的 Map {#shared-data-map-with-buckets}

在 `map_with_buckets` 序列化版本中,共享数据被序列化为 `N` 个类型为 `Map(String, String)` 的列("桶")。
每个桶仅包含路径的子集。要从这种序列化类型中读取路径子列,ClickHouse 从单个桶中读取整个 `Map` 列并在内存中提取请求的路径。

这种序列化方式对于写入数据和读取整个 `JSON` 列的效率较低,但对于读取路径子列更高效,因为它仅从所需的桶中读取数据。

桶的数量 `N` 由 MergeTree 设置 [object_shared_data_buckets_for_compact_part](../../operations/settings/merge-tree-settings.md#object_shared_data_buckets_for_compact_part)(默认为 8)和 [object_shared_data_buckets_for_wide_part](../../operations/settings/merge-tree-settings.md#object_shared_data_buckets_for_wide_part)(默认为 32)控制。

#### 高级 {#shared-data-advanced}

在 `advanced` 序列化版本中,共享数据被序列化为一种特殊的数据结构,通过存储一些额外信息来最大化路径子列读取的性能,这些信息允许仅读取请求路径的数据。
这种序列化方式也支持桶,因此每个桶仅包含路径的子集。

这种序列化方式对于写入数据的效率较低(因此不建议对零级部分使用此序列化方式),读取整个 `JSON` 列的效率与 `map` 序列化相比略低,但对于读取路径子列非常高效。

注意:由于在数据结构内部存储了一些额外信息,与 `map` 和 `map_with_buckets` 序列化相比,此序列化方式的磁盘存储大小更大。

有关新共享数据序列化和实现细节的更详细概述,请阅读[博客文章](https://clickhouse.com/blog/json-data-type-gets-even-better)。


## 内省函数 {#introspection-functions}

有几个函数可以帮助检查 JSON 列的内容:

- [`JSONAllPaths`](../functions/json-functions.md#JSONAllPaths)
- [`JSONAllPathsWithTypes`](../functions/json-functions.md#JSONAllPathsWithTypes)
- [`JSONDynamicPaths`](../functions/json-functions.md#JSONDynamicPaths)
- [`JSONDynamicPathsWithTypes`](../functions/json-functions.md#JSONDynamicPathsWithTypes)
- [`JSONSharedDataPaths`](../functions/json-functions.md#JSONSharedDataPaths)
- [`JSONSharedDataPathsWithTypes`](../functions/json-functions.md#JSONSharedDataPathsWithTypes)
- [`distinctDynamicTypes`](../aggregate-functions/reference/distinctdynamictypes.md)
- [`distinctJSONPaths and distinctJSONPathsAndTypes`](../aggregate-functions/reference/distinctjsonpaths.md)

**示例**

让我们检查日期为 `2020-01-01` 的 [GH Archive](https://www.gharchive.org/) 数据集的内容:

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


## 使用 ALTER MODIFY COLUMN 将列修改为 JSON 类型 {#alter-modify-column-to-json-type}

可以修改现有表，将列的类型更改为新的 `JSON` 类型。目前仅支持从 `String` 类型进行 `ALTER` 操作。

**示例**

```sql title="查询"
CREATE TABLE test (json String) ENGINE=MergeTree ORDER BY tuple();
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


## JSON 类型值的比较 {#comparison-between-values-of-the-json-type}

JSON 对象的比较方式与 Map 类似。

例如:

```sql title="查询"
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

```text title="响应"
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

**注意:** 当两个路径包含不同数据类型的值时,将按照 `Variant` 数据类型的[比较规则](/sql-reference/data-types/variant#comparing-values-of-variant-data)进行比较。


## JSON 类型的最佳使用建议 {#tips-for-better-usage-of-the-json-type}

在创建 `JSON` 列并加载数据之前,请考虑以下建议:

- 分析您的数据并尽可能多地指定带类型的路径提示。这将显著提高存储和读取效率。
- 明确哪些路径是需要的,哪些路径永远不会用到。将不需要的路径指定在 `SKIP` 部分,必要时也可在 `SKIP REGEXP` 部分指定。这将优化存储性能。
- 不要将 `max_dynamic_paths` 参数设置得过高,否则会降低存储和读取效率。
  虽然这高度依赖于内存、CPU 等系统参数,但一般经验是:本地文件系统存储不应将 `max_dynamic_paths` 设置为超过 10 000,远程文件系统存储不应超过 1024。


## 延伸阅读 {#further-reading}

- [我们如何为 ClickHouse 构建强大的新型 JSON 数据类型](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse)
- [十亿文档 JSON 挑战赛：ClickHouse 与 MongoDB、Elasticsearch 等的对比](https://clickhouse.com/blog/json-bench-clickhouse-vs-mongodb-elasticsearch-duckdb-postgresql)
