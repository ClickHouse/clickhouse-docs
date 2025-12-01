---
description: 'ClickHouse 中 JSON 数据类型的参考文档，该类型在处理 JSON 数据时提供原生支持'
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
  <CardSecondary badgeState="success" badgeText="" description="查看我们的 JSON 最佳实践指南，了解在使用 JSON 类型时的示例、高级功能和注意事项。" icon="book" infoText="阅读更多" infoUrl="/docs/best-practices/use-json-where-appropriate" title="在找指南？" />
</Link>

<br />

`JSON` 类型会在单个列中存储 JavaScript Object Notation (JSON) 文档。

:::note
在 ClickHouse 开源版中，JSON 数据类型从 25.3 版本开始被标记为可用于生产环境。不建议在更早的版本中在生产环境使用此类型。
:::

要声明一个 `JSON` 类型的列，可以使用以下语法：

```sql
<列名> JSON
(
    max_dynamic_paths=N, 
    max_dynamic_types=M, 
    some.path 类型名, 
    SKIP path.to.skip, 
    SKIP REGEXP 'paths_regexp'
)
```

上述语法中的各参数定义如下：

| Parameter                   | Description                                                                                                                                                  | Default Value |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------- |
| `max_dynamic_paths`         | 一个可选参数，表示在单个独立存储的数据块中（例如 MergeTree 表的单个 data part），最多可以有多少个路径以子列形式单独存储。<br /><br />如果超过此限制，所有其余路径将合并存储在一个单一结构中。                                              | `1024`        |
| `max_dynamic_types`         | 一个取值范围在 `1` 到 `255` 之间的可选参数，表示在单个独立存储的数据块中（例如 MergeTree 表的单个 data part），在类型为 `Dynamic` 的单个路径列中最多可以存储多少种不同的数据类型。<br /><br />如果超过此限制，所有新增类型都会被转换为 `String` 类型。 | `32`          |
| `some.path TypeName`        | 针对 JSON 中特定路径的可选类型提示。此类路径将始终作为具有指定类型的子列进行存储。                                                                                                                 |               |
| `SKIP path.to.skip`         | 针对在 JSON 解析期间应跳过的特定路径的可选提示。此类路径将永远不会存储在 JSON 列中。若指定路径是一个嵌套 JSON 对象，则整个嵌套对象都会被跳过。                                                                             |               |
| `SKIP REGEXP 'path_regexp'` | 使用正则表达式在 JSON 解析期间跳过路径的可选提示。所有匹配此正则表达式的路径将永远不会存储在 JSON 列中。                                                                                                   |               |


## 创建 JSON {#creating-json}

本节将介绍创建 `JSON` 的多种方法。

### 在表的列定义中使用 `JSON` {#using-json-in-a-table-column-definition}

```sql title="Query (Example 1)"
CREATE TABLE test (json JSON) ENGINE = Memory;
INSERT INTO test VALUES ('{"a" : {"b" : 42}, "c" : [1, 2, 3]}'), ('{"f" : "Hello, World!"}'), ('{"a" : {"b" : 43, "e" : 10}, "c" : [4, 5, 6]}');
SELECT json FROM test;
```

```text title="Response (Example 1)"
┌─json────────────────────────────────────────┐
│ {"a":{"b":"42"},"c":["1","2","3"]}          │
│ {"f":"你好，世界！"}                       │
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
│ {"a":{"b":0},"f":"你好，世界！"} │
│ {"a":{"b":43},"c":["4","5","6"]}  │
└───────────────────────────────────┘
```

### 使用 `::JSON` 进行 CAST {#using-cast-with-json}

可以使用特殊语法 `::JSON` 对各种类型执行类型转换（CAST）。

#### 使用 CAST 将 `String` 转换为 `JSON` {#cast-from-string-to-json}

```sql title="Query"
SELECT '{"a" : {"b" : 42},"c" : [1, 2, 3], "d" : "Hello, World!"}'::JSON AS json;
```

```text title="Response"
┌─json───────────────────────────────────────────────────┐
│ {"a":{"b":"42"},"c":["1","2","3"],"d":"你好，世界！"} │
└────────────────────────────────────────────────────────┘
```

#### 使用 CAST 将 `Tuple` 转换为 `JSON` {#cast-from-tuple-to-json}

```sql title="Query"
SET enable_named_columns_in_function_tuple = 1;
SELECT (tuple(42 AS b) AS a, [1, 2, 3] AS c, 'Hello, World!' AS d)::JSON AS json;
```

```text title="Response"
┌─json───────────────────────────────────────────────────┐
│ {"a":{"b":"42"},"c":["1","2","3"],"d":"你好，世界！"} │
└────────────────────────────────────────────────────────┘
```

#### 将 `Map` 类型 CAST 为 `JSON` {#cast-from-map-to-json}

```sql title="Query"
SET use_variant_as_common_type=1;
SELECT map('a', map('b', 42), 'c', [1,2,3], 'd', 'Hello, World!')::JSON AS json;
```

```text title="Response"
┌─json───────────────────────────────────────────────────┐
│ {"a":{"b":"42"},"c":["1","2","3"],"d":"你好，世界！"} │
└────────────────────────────────────────────────────────┘
```

:::note
JSON 路径会被存储为扁平结构。这意味着，当根据类似 `a.b.c` 这样的路径来构造一个 JSON 对象时，
无法确定该对象应被构造为 `{ "a.b.c" : ... }` 还是 `{ "a": { "b": { "c": ... } } }`。
我们的实现始终会采用后者的形式。

例如：

```sql
SELECT CAST('{"a.b.c" : 42}', 'JSON') AS json
```

将会返回：

```response
   ┌─json───────────────────┐
1. │ {"a":{"b":{"c":"42"}}} │
   └────────────────────────┘
```

而**不是**：


```sql
   ┌─json───────────┐
1. │ {"a.b.c":"42"} │
   └────────────────┘
```

:::


## 将 JSON 路径读取为子列 {#reading-json-paths-as-sub-columns}

`JSON` 类型支持将 JSON 中的每个路径读取为独立的子列。
如果在 JSON 类型的声明中未指定所请求路径的类型，
则该路径对应的子列类型始终为 [Dynamic](/sql-reference/data-types/dynamic.md)。

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

你还可以使用 `getSubcolumn` 函数从 JSON 类型中读取子列：

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

如果在数据中找不到请求的路径，将会被填充为 `NULL` 值：

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

让我们检查一下返回的子列的数据类型：

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

如上所示，对于 `a.b`，其类型为 `UInt32`，这是在 JSON 类型声明中显式指定的；
而所有其他子列的类型则为 `Dynamic`。

也可以使用特殊语法 `json.some.path.:TypeName` 来读取 `Dynamic` 类型的子列：

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

`Dynamic` 子列可以转换为任意数据类型。若 `Dynamic` 中的内部类型无法转换为请求的类型，则会抛出异常：

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
服务器返回异常：
Code: 48. DB::Exception: Received from localhost:9000. DB::Exception: 
不支持数值类型与 UUID 之间的转换。
传入的 UUID 可能未加引号： 
执行 'FUNCTION CAST(__table1.json.a.g :: 2, 'UUID'_String :: 1) -> CAST(__table1.json.a.g, 'UUID'_String) UUID : 0' 时发生错误。
(NOT_IMPLEMENTED)
```

:::note
要高效地从 Compact MergeTree 数据片段中读取子列，请确保已启用 MergeTree 设置 [write&#95;marks&#95;for&#95;substreams&#95;in&#95;compact&#95;parts](../../operations/settings/merge-tree-settings.md#write_marks_for_substreams_in_compact_parts)。
:::


## 将 JSON 子对象读取为子列 {#reading-json-sub-objects-as-sub-columns}

`JSON` 类型支持使用特殊语法 `json.^some.path` 将嵌套对象读取为 `JSON` 类型的子列：

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
将子对象作为子列读取可能效率较低，因为这可能需要几乎对整个 JSON 数据进行扫描。
:::


## 路径的类型推断 {#type-inference-for-paths}

在解析 `JSON` 时，ClickHouse 会尝试为每个 JSON 路径推断出最合适的数据类型。
其工作方式类似于[基于输入数据自动推断表结构](/interfaces/schema-inference.md)，
并且由相同的设置控制：

* [input&#95;format&#95;try&#95;infer&#95;dates](/operations/settings/formats#input_format_try_infer_dates)
* [input&#95;format&#95;try&#95;infer&#95;datetimes](/operations/settings/formats#input_format_try_infer_datetimes)
* [schema&#95;inference&#95;make&#95;columns&#95;nullable](/operations/settings/formats#schema_inference_make_columns_nullable)
* [input&#95;format&#95;json&#95;try&#95;infer&#95;numbers&#95;from&#95;strings](/operations/settings/formats#input_format_json_try_infer_numbers_from_strings)
* [input&#95;format&#95;json&#95;infer&#95;incomplete&#95;types&#95;as&#95;strings](/operations/settings/formats#input_format_json_infer_incomplete_types_as_strings)
* [input&#95;format&#95;json&#95;read&#95;numbers&#95;as&#95;strings](/operations/settings/formats#input_format_json_read_numbers_as_strings)
* [input&#95;format&#95;json&#95;read&#95;bools&#95;as&#95;strings](/operations/settings/formats#input_format_json_read_bools_as_strings)
* [input&#95;format&#95;json&#95;read&#95;bools&#95;as&#95;numbers](/operations/settings/formats#input_format_json_read_bools_as_numbers)
* [input&#95;format&#95;json&#95;read&#95;arrays&#95;as&#95;strings](/operations/settings/formats#input_format_json_read_arrays_as_strings)
* [input&#95;format&#95;json&#95;infer&#95;array&#95;of&#95;dynamic&#95;from&#95;array&#95;of&#95;different&#95;types](/operations/settings/formats#input_format_json_infer_array_of_dynamic_from_array_of_different_types)

下面来看一些示例：

```sql title="Query"
SELECT JSONAllPathsWithTypes('{"a" : "2020-01-01", "b" : "2020-01-01 10:00:00"}'::JSON) AS paths_with_types SETTINGS input_format_try_infer_dates=1, input_format_try_infer_datetimes=1;
```

```text title="Response"
┌─paths_with_types─────────────────┐
│ {'a':'Date','b':'DateTime64(9)'} │
└──────────────────────────────────┘
```

```sql title="Query"
SELECT JSONAllPathsWithTypes('{"a" : "2020-01-01", "b" : "2020-01-01 10:00:00"}'::JSON) AS paths_with_types SETTINGS input_format_try_infer_dates=0, input_format_try_infer_datetimes=0;
```

```text title="Response"
┌─paths_with_types────────────┐
│ {'a':'String','b':'String'} │
└─────────────────────────────┘
```

```sql title="Query"
SELECT JSONAllPathsWithTypes('{"a" : [1, 2, 3]}'::JSON) AS paths_with_types SETTINGS schema_inference_make_columns_nullable=1;
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


## 处理 JSON 对象数组 {#handling-arrays-of-json-objects}

包含对象数组的 JSON 路径会被解析为 `Array(JSON)` 类型，并插入到该路径对应的 `Dynamic` 列中。
要读取对象数组，可以从 `Dynamic` 列中将其提取为子列：

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
│ {"a":{"b":[{"c":"42","d":"你好","f":[[{"g":42.42}]],"k":{"j":"1000"}},{"c":"43"},{"d":"我的","e":["1","2","3"],"f":[[{"g":43.43,"h":"2020-01-01"}]],"k":{"j":"2000"}}]}} │
│ {"a":{"b":["1","2","3"]}}                                                                                                                                               │
│ {"a":{"b":[{"c":"44","f":[[{"h":"2020-01-02"}]]},{"d":"世界","e":["4","5","6"],"f":[[{"g":44.44}]],"k":{"j":"3000"}}]}}                                                │
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

正如你可能已经注意到的，嵌套 `JSON` 类型的 `max_dynamic_types`/`max_dynamic_paths` 参数相比默认值被调低了。
这是为了避免在嵌套的 JSON 对象数组中，子列数量不受控制地增长。

让我们尝试从一个嵌套的 `JSON` 列中读取子列：

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

我们可以使用一种特殊语法来避免手动指定 `Array(JSON)` 子列名：

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

路径后面的 `[]` 数量表示数组的嵌套层级。例如，`json.path[][]` 会被转换为 `json.path.:Array(Array(JSON))`

让我们检查一下 `Array(JSON)` 中的路径和类型：

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

我们还可以从嵌套的 `JSON` 列中读取子对象的子列：

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

在我们的 JSON 实现中，`null` 与值的缺失被视为等同：

```sql title="Query"
SELECT '{}'::JSON AS json1, '{"a" : null}'::JSON AS json2, json1 = json2
```

```text title="Response"
┌─json1─┬─json2─┬─equals(json1, json2)─┐
│ {}    │ {}    │                    1 │
└───────┴───────┴──────────────────────┘
```

这意味着无法确定原始 JSON 数据中，是包含某个路径且其值为 NULL，还是根本不包含该路径。


## 处理包含点号的 JSON 键 {#handling-json-keys-with-dots}

在内部实现中，JSON 列会以扁平化的形式存储所有路径和值。这意味着在默认情况下，下面这两个对象会被视为相同：

```json
{"a" : {"b" : 42}}
{"a.b" : 42}
```

它们在内部都会以路径和值的二元组形式存储，即路径 `a.b` 和值 `42`。在格式化 JSON 时，我们始终基于以点分隔的路径片段来构造嵌套对象：

```sql title="Query"
SELECT '{"a" : {"b" : 42}}'::JSON AS json1, '{"a.b" : 42}'::JSON AS json2, JSONAllPaths(json1), JSONAllPaths(json2);
```

```text title="Response"
┌─json1────────────┬─json2────────────┬─JSONAllPaths(json1)─┬─JSONAllPaths(json2)─┐
│ {"a":{"b":"42"}} │ {"a":{"b":"42"}} │ ['a.b']             │ ['a.b']             │
└──────────────────┴──────────────────┴─────────────────────┴─────────────────────┘
```

如你所见，最初的 JSON `{"a.b" : 42}` 现在被格式化为 `{"a" : {"b" : 42}}`。

这一限制还会导致在解析如下这种有效 JSON 对象时失败：

```sql title="Query"
SELECT '{"a.b" : 42, "a" : {"b" : "Hello World!"}}'::JSON AS json;
```

```text title="Response"
代码：117. DB::Exception：无法将数据插入 JSON 列：解析 JSON 对象时发现重复路径：a.b。您可以启用 type_json_skip_duplicated_paths 设置以在插入时跳过重复路径：在作用域 SELECT CAST('{"a.b" : 42, "a" : {"b" : "Hello, World"}}', 'JSON') AS json 中。(INCORRECT_DATA)
```

如果你希望保留带点号的键并避免将其格式化为嵌套对象，可以启用设置 [json&#95;type&#95;escape&#95;dots&#95;in&#95;keys](/operations/settings/formats#json_type_escape_dots_in_keys)（自 `25.8` 版本起可用）。在这种情况下，解析时 JSON 键中的所有点号都会被转义为 `%2E`，并在格式化时再还原回来。

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

要将包含转义点号的键作为子列读取时，必须在子列名称中同样使用转义点号：

```sql title="Query"
SET json_type_escape_dots_in_keys=1;
SELECT '{"a.b" : 42, "a" : {"b" : "Hello World!"}}'::JSON AS json, json.`a%2Eb`, json.a.b;
```

```text title="Response"
┌─json──────────────────────────────────┬─json.a%2Eb─┬─json.a.b─────┐
│ {"a.b":"42","a":{"b":"Hello World!"}} │ 42         │ Hello World! │
└───────────────────────────────────────┴────────────┴──────────────┘
```

注意：由于标识符解析器和分析器的限制，子列 `` json.`a.b` `` 等价于子列 `json.a.b`，且无法读取带有转义点号的路径：


```sql title="Query"
SET json_type_escape_dots_in_keys=1;
SELECT '{"a.b" : 42, "a" : {"b" : "Hello World!"}}'::JSON AS json, json.`a%2Eb`, json.`a.b`, json.a.b;
```

```text title="Response"
┌─json──────────────────────────────────┬─json.a%2Eb─┬─json.a.b─────┬─json.a.b─────┐
│ {"a.b":"42","a":{"b":"Hello World!"}} │ 42         │ Hello World! │ Hello World! │
└───────────────────────────────────────┴────────────┴──────────────┴──────────────┘
```

此外，如果你想为键名中包含点号的 JSON 路径指定提示（或在 `SKIP`/`SKIP REGEX` 部分中使用它），则必须在提示中将点号写为转义形式：

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
([`JSONEachRow`](/interfaces/formats/JSONEachRow),
[`TSV`](/interfaces/formats/TabSeparated),
[`CSV`](/interfaces/formats/CSV),
[`CustomSeparated`](/interfaces/formats/CustomSeparated),
[`Values`](/interfaces/formats/Values) 等) 都支持读取 `JSON` 类型的数据。

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
│ {"a":{"b":{"c":3}},"e":"你好，世界！"}                       │
│ {"a":{"b":{"c":4}},"c":"43"}                                  │
│ {"a":{"b":{"c":5}},"d":{"h":"2020-02-02 10:00:00.000000000"}} │
└───────────────────────────────────────────────────────────────┘
```

对于 `CSV`/`TSV`/等文本格式，会从包含 JSON 对象的字符串中解析 `JSON`：


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


## 达到 JSON 中动态路径数量的上限 {#reaching-the-limit-of-dynamic-paths-inside-json}

`JSON` 数据类型在内部只能将有限数量的路径存储为单独的子列。
默认情况下，此上限为 `1024`，但你可以在类型声明中通过参数 `max_dynamic_paths` 来修改。

当达到上限时，插入到 `JSON` 列中的所有新路径都会存储在一个共享的数据结构中。
这些路径仍然可以作为子列读取，
但效率可能会较低（[参见关于共享数据的章节](#shared-data-structure)）。
设置这个上限是为了避免出现数量巨大的不同子列，从而导致表无法正常使用。

下面我们来看看在几种不同场景下达到该上限时会发生什么。

### 在数据解析过程中达到上限 {#reaching-the-limit-during-data-parsing}

在从数据中解析 `JSON` 对象时，当当前数据块的路径数量达到上限后，
所有新路径都会存储在一个共享数据结构中。我们可以使用以下两个内省函数 `JSONDynamicPaths`、`JSONSharedDataPaths`：

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

正如我们所见，在插入路径 `e` 和 `f.g` 之后，已经达到了限制，
它们被写入到一个共享的数据结构中。

### 在 MergeTree 表引擎中合并数据部分时 {#during-merges-of-data-parts-in-mergetree-table-engines}

在 `MergeTree` 表中合并若干数据部分的过程中，结果数据部分中的 `JSON` 列可能会达到动态路径数量的上限，
从而无法将源数据部分中的所有路径都作为子列进行存储。
在这种情况下，ClickHouse 会选择哪些路径在合并后继续作为子列保留，哪些路径则存储在共享的数据结构中。
在大多数情况下，ClickHouse 会尽量保留包含
最多非空值的路径，并将最不常见的路径移到共享的数据结构中。不过，这仍然取决于具体实现。

我们来看一个这样的合并示例。
首先，我们创建一个带有 `JSON` 列的表，将动态路径的限制设置为 `3`，然后插入包含 `5` 个不同路径的值：


```sql title="Query"
CREATE TABLE test (id UInt64, json JSON(max_dynamic_paths=3)) ENGINE=MergeTree ORDER BY id;
SYSTEM STOP MERGES test;
INSERT INTO test SELECT number, formatRow('JSONEachRow', number as a) FROM numbers(5);
INSERT INTO test SELECT number, formatRow('JSONEachRow', number as b) FROM numbers(4);
INSERT INTO test SELECT number, formatRow('JSONEachRow', number as c) FROM numbers(3);
INSERT INTO test SELECT number, formatRow('JSONEachRow', number as d) FROM numbers(2);
INSERT INTO test SELECT number, formatRow('JSONEachRow', number as e) FROM numbers(1);
```

每次插入都会创建一个单独的数据片段，其中 `JSON` 列只包含一个路径：

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

现在，让我们把所有部分合并起来，看看会发生什么：

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

正如我们看到的，ClickHouse 保留了最常见的路径 `a`、`b` 和 `c`，并将路径 `d` 和 `e` 放入了一个共享的数据结构中。


## 共享数据结构 {#shared-data-structure}

如前一节所述，当达到 `max_dynamic_paths` 限制时，所有新的路径都会存储在一个共享数据结构中。
本节将详细介绍该共享数据结构的实现方式，以及如何从中读取路径子列。

有关用于检查 JSON 列内容的函数的详细信息，请参见[“自省函数”](/sql-reference/data-types/newjson#introspection-functions)一节。

### 内存中的共享数据结构 {#shared-data-structure-in-memory}

在内存中，共享数据结构只是一个类型为 `Map(String, String)` 的子列，用于存储从扁平化 JSON 路径到二进制编码值的映射。
要从中提取路径子列，只需遍历该 `Map` 列中的所有行，并尝试查找请求的路径及其对应的值。

### MergeTree 部件中的共享数据结构 {#shared-data-structure-in-merge-tree-parts}

在 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表中，我们将数据存储在数据部件中，这些部件会将所有内容存储在磁盘上（本地或远程）。而磁盘上的数据存储方式可能与内存中的不同。
目前，在 MergeTree 数据部件中存在 3 种不同的共享数据结构序列化方式：`map`、`map_with_buckets`
和 `advanced`。

序列化版本由 MergeTree 设置
[object_shared_data_serialization_version](../../operations/settings/merge-tree-settings.md#object_shared_data_serialization_version)
和 [object_shared_data_serialization_version_for_zero_level_parts](../../operations/settings/merge-tree-settings.md#object_shared_data_serialization_version_for_zero_level_parts) 控制
（零级部件是在向表中插入数据时创建的部件，在合并过程中生成的部件级别更高）。

注意：仅当使用 `v3` [对象序列化版本](../../operations/settings/merge-tree-settings.md#object_serialization_version) 时，才支持更改共享数据结构的序列化方式。

#### Map {#shared-data-map}

在 `map` 序列化版本中，共享数据会序列化为一个类型为 `Map(String, String)` 的单列，其存储方式与内存中相同。
要从这种序列化方式中读取路径子列，ClickHouse 会读取整个 `Map` 列，并在内存中提取请求的路径。

这种序列化方式在写入数据和读取整个 `JSON` 列时效率较高，但在读取路径子列时效率不高。

#### 带桶的 Map {#shared-data-map-with-buckets} 

在 `map_with_buckets` 序列化版本中，共享数据会序列化为 `N` 列（“桶”），每列的类型为 `Map(String, String)`。
每个桶仅包含路径的一个子集。要从这种序列化方式中读取路径子列，ClickHouse
会从单个桶中读取整个 `Map` 列，并在内存中提取请求的路径。

这种序列化方式在写入数据和读取整个 `JSON` 列时效率较低，但在读取路径子列时效率更高，
因为它只会从所需的桶中读取数据。

桶的数量 `N` 由 MergeTree 设置 [object_shared_data_buckets_for_compact_part](
../../operations/settings/merge-tree-settings.md#object_shared_data_buckets_for_compact_part)（默认值为 8）
和 [object_shared_data_buckets_for_wide_part](
../../operations/settings/merge-tree-settings.md#object_shared_data_buckets_for_wide_part)（默认值为 32）控制。

#### Advanced {#shared-data-advanced}

在 `advanced` 序列化版本中，共享数据会序列化为一种专门的数据结构，通过存储一些额外信息来最大化路径子列的读取性能，从而只读取请求路径的数据。
这种序列化方式同样支持桶，因此每个桶也只包含路径的一个子集。

这种序列化方式在写入数据时效率较低（因此不建议将其用于零级部件），读取整个 `JSON` 列时的效率相比 `map` 序列化略低，但在读取路径子列时非常高效。

注意：由于在数据结构中存储了额外信息，与 `map` 和 `map_with_buckets` 序列化方式相比，这种序列化在磁盘上的存储空间占用更高。

如需更详细地了解新的共享数据序列化方式及其实现细节，请参阅这篇[博客文章](https://clickhouse.com/blog/json-data-type-gets-even-better)。



## 自省函数 {#introspection-functions}

有多个函数可以用于查看 JSON 列的内容：

* [`JSONAllPaths`](../functions/json-functions.md#JSONAllPaths)
* [`JSONAllPathsWithTypes`](../functions/json-functions.md#JSONAllPathsWithTypes)
* [`JSONDynamicPaths`](../functions/json-functions.md#JSONDynamicPaths)
* [`JSONDynamicPathsWithTypes`](../functions/json-functions.md#JSONDynamicPathsWithTypes)
* [`JSONSharedDataPaths`](../functions/json-functions.md#JSONSharedDataPaths)
* [`JSONSharedDataPathsWithTypes`](../functions/json-functions.md#JSONSharedDataPathsWithTypes)
* [`distinctDynamicTypes`](../aggregate-functions/reference/distinctdynamictypes.md)
* [`distinctJSONPaths and distinctJSONPathsAndTypes`](../aggregate-functions/reference/distinctjsonpaths.md)

**示例**

让我们来分析一下 [GH Archive](https://www.gharchive.org/) 数据集中日期为 `2020-01-01` 的内容：

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


## 使用 ALTER MODIFY COLUMN 修改为 JSON 类型 {#alter-modify-column-to-json-type}

可以对现有表执行修改操作，将列的类型更改为新的 `JSON` 类型。目前仅支持对 `String` 类型列执行 `ALTER` 操作。

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


## JSON 类型值的比较 {#comparison-between-values-of-the-json-type}

JSON 对象的比较规则与 Map 类型类似。

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

**注意：** 当两个路径中包含不同数据类型的值时，将根据 `Variant` 数据类型的[比较规则](/sql-reference/data-types/variant#comparing-values-of-variant-data)进行比较。


## 更高效使用 JSON 类型的技巧 {#tips-for-better-usage-of-the-json-type}

在创建 `JSON` 列并向其中加载数据之前，请考虑以下几点建议：

- 先分析你的数据，并尽可能为更多路径提供带类型的路径提示（path hint）。这将显著提升存储和读取效率。
- 考虑在实际使用中会需要哪些路径，以及哪些路径基本不会被使用。对于不需要的路径，在 `SKIP` 部分中进行指定；如有必要，再在 `SKIP REGEXP` 部分中指定。这将改善存储效果。
- 不要将 `max_dynamic_paths` 参数设置得过高，否则可能会降低存储和读取效率。  
  虽然具体数值高度依赖于内存、CPU 等系统参数，但一个经验法则是：对于本地文件系统存储，不要将 `max_dynamic_paths` 设置为大于 10 000；对于远程文件系统存储，不要设置为大于 1024。



## 延伸阅读 {#further-reading}

- [我们如何为 ClickHouse 构建强大的全新 JSON 数据类型](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse)
- [十亿文档 JSON 挑战：ClickHouse 对比 MongoDB、Elasticsearch 等](https://clickhouse.com/blog/json-bench-clickhouse-vs-mongodb-elasticsearch-duckdb-postgresql)
