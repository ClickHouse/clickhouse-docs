---
alias: []
description: 'JSONObjectEachRow 格式文档'
input_format: true
keywords: ['JSONObjectEachRow']
output_format: true
slug: /interfaces/formats/JSONObjectEachRow
title: 'JSONObjectEachRow'
doc_type: 'reference'
---

| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✔     | ✔      |       |

## 描述 {#description}

在这种格式中，所有数据都表示为单个 JSON 对象，其中每一行对应该对象的一个独立字段，类似于 [`JSONEachRow`](./JSONEachRow.md) 格式。

## 示例用法 {#example-usage}

### 基本示例 {#basic-example}

假设有如下 JSON：

```json
{
  "row_1": {"num": 42, "str": "hello", "arr":  [0,1]},
  "row_2": {"num": 43, "str": "hello", "arr":  [0,1,2]},
  "row_3": {"num": 44, "str": "hello", "arr":  [0,1,2,3]}
}
```

要将对象名用作列值，可以使用特殊设置 [`format_json_object_each_row_column_for_object_name`](/operations/settings/settings-formats.md/#format_json_object_each_row_column_for_object_name)。
该设置的值应设为某一列的名称，该列将在生成的对象中作为每一行的 JSON 键名。

#### 输出 {#output}

假设我们有一张名为 `test` 的表，其中包含两列：

```text
┌─object_name─┬─number─┐
│ first_obj   │      1 │
│ second_obj  │      2 │
│ third_obj   │      3 │
└─────────────┴────────┘
```

我们将它输出为 `JSONObjectEachRow` 格式，并使用 `format_json_object_each_row_column_for_object_name` 设置：

```sql title="Query"
SELECT * FROM test SETTINGS format_json_object_each_row_column_for_object_name='object_name'
```

```json title="Response"
{
    "first_obj": {"number": 1},
    "second_obj": {"number": 2},
    "third_obj": {"number": 3}
}
```

#### 输入 {#input}

假设我们将上一个示例的输出保存到名为 `data.json` 的文件中：

```sql title="Query"
SELECT * FROM file('data.json', JSONObjectEachRow, 'object_name String, number UInt64') SETTINGS format_json_object_each_row_column_for_object_name='object_name'
```

```response title="Response"
┌─object_name─┬─number─┐
│ first_obj   │      1 │
│ second_obj  │      2 │
│ third_obj   │      3 │
└─────────────┴────────┘
```

同样适用于模式推断：

```sql title="Query"
DESCRIBE file('data.json', JSONObjectEachRow) SETTING format_json_object_each_row_column_for_object_name='object_name'
```

```response title="Response"
┌─name────────┬─type────────────┐
│ object_name │ String          │
│ number      │ Nullable(Int64) │
└─────────────┴─────────────────┘
```

### 写入数据 {#json-inserting-data}

```sql title="Query"
INSERT INTO UserActivity FORMAT JSONEachRow {"PageViews":5, "UserID":"4324182021466249494", "Duration":146,"Sign":-1} {"UserID":"4324182021466249494","PageViews":6,"Duration":185,"Sign":1}
```

ClickHouse 允许：

* 对象中的键值对可以以任意顺序出现。
* 省略某些值。

ClickHouse 会忽略元素之间的空格以及对象后面的逗号。可以在同一行中传递所有对象，无需使用换行符将它们分隔开。

#### 省略值的处理 {#omitted-values-processing}

ClickHouse 会使用相应[数据类型](/sql-reference/data-types/index.md)的默认值来替换被省略的值。

如果指定了 `DEFAULT expr`，ClickHouse 会根据 [input&#95;format&#95;defaults&#95;for&#95;omitted&#95;fields](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields) 设置采用不同的替换规则。

考虑下列表：

```sql title="Query"
CREATE TABLE IF NOT EXISTS example_table
(
    x UInt32,
    a DEFAULT x * 2
) ENGINE = Memory;
```

* 如果 `input_format_defaults_for_omitted_fields = 0`，则 `x` 和 `a` 的默认值为 `0`（即 `UInt32` 数据类型的默认值）。
* 如果 `input_format_defaults_for_omitted_fields = 1`，则 `x` 的默认值为 `0`，但 `a` 的默认值为 `x * 2`。

:::note
在使用 `input_format_defaults_for_omitted_fields = 1` 插入数据时，相比使用 `input_format_defaults_for_omitted_fields = 0` 插入，ClickHouse 会消耗更多计算资源。
:::

### 查询数据 {#json-selecting-data}

以 `UserActivity` 表为例：

```response
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │   -1 │
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

查询 `SELECT * FROM UserActivity FORMAT JSONEachRow` 将返回：

```response
{"UserID":"4324182021466249494","PageViews":5,"Duration":146,"Sign":-1}
{"UserID":"4324182021466249494","PageViews":6,"Duration":185,"Sign":1}
```

与 [JSON](/interfaces/formats/JSON) 格式不同，这里不会对无效的 UTF-8 序列进行替换。值的转义方式与 `JSON` 相同。

:::info
字符串中可以输出任意字节序列。如果确定表中的数据可以在不丢失任何信息的情况下被格式化为 JSON，请使用 [`JSONEachRow`](./JSONEachRow.md) 格式。
:::

### 嵌套结构的使用 {#jsoneachrow-nested}

如果有一张带有 [`Nested`](/sql-reference/data-types/nested-data-structures/index.md) 数据类型列的表，就可以插入具有相同结构的 JSON 数据。通过 [input&#95;format&#95;import&#95;nested&#95;json](/operations/settings/settings-formats.md/#input_format_import_nested_json) 设置启用此功能。

例如，考虑以下数据表：

```sql
CREATE TABLE json_each_row_nested (n Nested (s String, i Int32) ) ENGINE = Memory
```

正如您在 `Nested` 数据类型的说明中所看到的，ClickHouse 将嵌套结构的每个组件视为单独的一列（在我们的表中为 `n.s` 和 `n.i`）。您可以通过以下方式插入数据：

```sql
INSERT INTO json_each_row_nested FORMAT JSONEachRow {"n.s": ["abc", "def"], "n.i": [1, 23]}
```

要将数据作为层级 JSON 对象插入，请设置 [`input_format_import_nested_json=1`](/operations/settings/settings-formats.md/#input_format_import_nested_json)。

```json
{
    "n": {
        "s": ["abc", "def"],
        "i": [1, 23]
    }
}
```

如果未进行此设置，ClickHouse 会抛出异常。

```sql title="Query"
SELECT name, value FROM system.settings WHERE name = 'input_format_import_nested_json'
```

```response title="Response"
┌─name────────────────────────────┬─value─┐
│ input_format_import_nested_json │ 0     │
└─────────────────────────────────┴───────┘
```

```sql title="Query"
INSERT INTO json_each_row_nested FORMAT JSONEachRow {"n": {"s": ["abc", "def"], "i": [1, 23]}}
```

```response title="Response"
Code: 117. DB::Exception: Unknown field found while parsing JSONEachRow format: n: (at row 1)
```

```sql title="Query"
SET input_format_import_nested_json=1
INSERT INTO json_each_row_nested FORMAT JSONEachRow {"n": {"s": ["abc", "def"], "i": [1, 23]}}
SELECT * FROM json_each_row_nested
```

```response title="Response"
┌─n.s───────────┬─n.i────┐
│ ['abc','def'] │ [1,23] │
└───────────────┴────────┘
```

## 格式设置 {#format-settings}

| 配置                                                                                                                                                                           | 说明                                                                                                    | 默认       | 注意事项                                                                                                                                                |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`input_format_import_nested_json`](/operations/settings/settings-formats.md/#input_format_import_nested_json)                                                               | 将嵌套 JSON 数据映射为嵌套表（适用于 JSONEachRow 格式）。                                                                | `false`  |                                                                                                                                                     |
| [`input_format_json_read_bools_as_numbers`](/operations/settings/settings-formats.md/#input_format_json_read_bools_as_numbers)                                               | 允许在 JSON 输入格式中将布尔值解析为数值。                                                                              | `true`   |                                                                                                                                                     |
| [`input_format_json_read_bools_as_strings`](/operations/settings/settings-formats.md/#input_format_json_read_bools_as_strings)                                               | 允许在 JSON 输入格式中将布尔值作为字符串进行解析。                                                                          | `true`   |                                                                                                                                                     |
| [`input_format_json_read_numbers_as_strings`](/operations/settings/settings-formats.md/#input_format_json_read_numbers_as_strings)                                           | 允许在 JSON 输入格式中按字符串方式解析数值。                                                                             | `true`   |                                                                                                                                                     |
| [`input_format_json_read_arrays_as_strings`](/operations/settings/settings-formats.md/#input_format_json_read_arrays_as_strings)                                             | 允许在 JSON 输入格式中将 JSON 数组解析为字符串值。                                                                       | `true`   |                                                                                                                                                     |
| [`input_format_json_read_objects_as_strings`](/operations/settings/settings-formats.md/#input_format_json_read_objects_as_strings)                                           | 允许在 JSON 输入格式中将 JSON 对象作为字符串进行解析。                                                                     | `true`   |                                                                                                                                                     |
| [`input_format_json_named_tuples_as_objects`](/operations/settings/settings-formats.md/#input_format_json_named_tuples_as_objects)                                           | 将 Named Tuple 类型的列解析为 JSON 对象。                                                                        | `true`   |                                                                                                                                                     |
| [`input_format_json_try_infer_numbers_from_strings`](/operations/settings/settings-formats.md/#input_format_json_try_infer_numbers_from_strings)                             | 在进行模式推断时，尝试从字符串字段中推断数值。                                                                               | `false`  |                                                                                                                                                     |
| [`input_format_json_try_infer_named_tuples_from_objects`](/operations/settings/settings-formats.md/#input_format_json_try_infer_named_tuples_from_objects)                   | 在模式推断时尝试将 JSON 对象推断为命名元组。                                                                             | `true`   |                                                                                                                                                     |
| [`input_format_json_infer_incomplete_types_as_strings`](/operations/settings/settings-formats.md/#input_format_json_infer_incomplete_types_as_strings)                       | 在对 JSON 输入格式进行模式推断时，对于仅包含 Null 或空对象/数组的键，将其类型设为 String。                                               | `true`   |                                                                                                                                                     |
| [`input_format_json_defaults_for_missing_elements_in_named_tuple`](/operations/settings/settings-formats.md/#input_format_json_defaults_for_missing_elements_in_named_tuple) | 在解析 named tuple 时，为 JSON 对象中缺失的字段填充默认值。                                                               | `true`   |                                                                                                                                                     |
| [`input_format_json_ignore_unknown_keys_in_named_tuple`](/operations/settings/settings-formats.md/#input_format_json_ignore_unknown_keys_in_named_tuple)                     | 对命名元组的 JSON 对象忽略未知键。                                                                                  | `false`  |                                                                                                                                                     |
| [`input_format_json_compact_allow_variable_number_of_columns`](/operations/settings/settings-formats.md/#input_format_json_compact_allow_variable_number_of_columns)         | 允许 JSONCompact/JSONCompactEachRow 格式使用可变数量的列，忽略多余的列，并对缺失的列使用默认值。                                      | `false`  |                                                                                                                                                     |
| [`input_format_json_throw_on_bad_escape_sequence`](/operations/settings/settings-formats.md/#input_format_json_throw_on_bad_escape_sequence)                                 | 如果 JSON 字符串包含错误的转义序列，则抛出异常。若禁用，则错误的转义序列将原样保留在数据中。                                                     | `true`   |                                                                                                                                                     |
| [`input_format_json_empty_as_default`](/operations/settings/settings-formats.md/#input_format_json_empty_as_default)                                                         | 将 JSON 输入中的空字段按默认值处理。                                                                                 | `false`。 | 对于复杂的默认值表达式，也必须启用 [`input_format_defaults_for_omitted_fields`](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields)。 |
| [`output_format_json_quote_64bit_integers`](/operations/settings/settings-formats.md/#output_format_json_quote_64bit_integers)                                               | 控制在 JSON 输出格式中是否为 64 位整数加引号。                                                                          | `true`   |                                                                                                                                                     |
| [`output_format_json_quote_64bit_floats`](/operations/settings/settings-formats.md/#output_format_json_quote_64bit_floats)                                                   | 控制 JSON 输出格式中 64 位浮点数是否以带引号的形式输出。                                                                     | `false`  |                                                                                                                                                     |
| [`output_format_json_quote_denormals`](/operations/settings/settings-formats.md/#output_format_json_quote_denormals)                                                         | 在 JSON 输出格式中允许输出 &#39;+nan&#39;、&#39;-nan&#39;、&#39;+inf&#39;、&#39;-inf&#39;。                         | `false`  |                                                                                                                                                     |
| [`output_format_json_quote_decimals`](/operations/settings/settings-formats.md/#output_format_json_quote_decimals)                                                           | 控制在 JSON 输出格式中是否为小数加引号。                                                                               | `false`  |                                                                                                                                                     |
| [`output_format_json_escape_forward_slashes`](/operations/settings/settings-formats.md/#output_format_json_escape_forward_slashes)                                           | 控制是否在 JSON 输出格式的字符串中对正斜杠进行转义。                                                                         | `true`   |                                                                                                                                                     |
| [`output_format_json_named_tuples_as_objects`](/operations/settings/settings-formats.md/#output_format_json_named_tuples_as_objects)                                         | 将 NamedTuple 列序列化为 JSON 对象。                                                                           | `true`   |                                                                                                                                                     |
| [`output_format_json_array_of_rows`](/operations/settings/settings-formats.md/#output_format_json_array_of_rows)                                                             | 输出一个包含所有行的 JSON 数组，采用 JSONEachRow(Compact) 格式。                                                        | `false`  |                                                                                                                                                     |
| [`output_format_json_validate_utf8`](/operations/settings/settings-formats.md/#output_format_json_validate_utf8)                                                             | 在 JSON 输出格式中启用对 UTF-8 序列的校验（注意，这不会影响 JSON/JSONCompact/JSONColumnsWithMetadata 这些格式，它们始终会进行 UTF-8 校验）。 | `false`  |                                                                                                                                                     |