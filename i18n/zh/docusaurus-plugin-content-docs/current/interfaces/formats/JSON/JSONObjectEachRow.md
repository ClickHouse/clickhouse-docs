---
title: JSONObjectEachRow
slug: /interfaces/formats/JSONObjectEachRow
keywords: ['JSONObjectEachRow']
input_format: true
output_format: true
alias: []
---

| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✔     | ✔      |       |

## 描述 {#description}

在此格式中，所有数据都表示为一个单一的 JSON 对象，每行表示为该对象的一个独立字段，类似于 [`JSONEachRow`](./JSONEachRow.md) 格式。

## 示例用法 {#example-usage}

### 基本示例 {#basic-example}

给定一些 JSON：

```json
{
  "row_1": {"num": 42, "str": "hello", "arr":  [0,1]},
  "row_2": {"num": 43, "str": "hello", "arr":  [0,1,2]},
  "row_3": {"num": 44, "str": "hello", "arr":  [0,1,2,3]}
}
```

要将对象名称用作列值，您可以使用特殊设置 [`format_json_object_each_row_column_for_object_name`](/operations/settings/settings-formats.md/#format_json_object_each_row_column_for_object_name)。该设置的值被设置为列的名称，作为结果对象中行的 JSON 键使用。

#### 输出 {#output}

假设我们有一个名为 `test` 的表，包含两个列：

```text
┌─object_name─┬─number─┐
│ first_obj   │      1 │
│ second_obj  │      2 │
│ third_obj   │      3 │
└─────────────┴────────┘
```

让我们以 `JSONObjectEachRow` 格式输出它，并使用 `format_json_object_each_row_column_for_object_name` 设置：

```sql title="查询"
SELECT * FROM test SETTINGS format_json_object_each_row_column_for_object_name='object_name'
```

```json title="响应"
{
	"first_obj": {"number": 1},
	"second_obj": {"number": 2},
	"third_obj": {"number": 3}
}
```

#### 输入 {#input}

假设我们将前面的示例输出存储在名为 `data.json` 的文件中：

```sql title="查询"
SELECT * FROM file('data.json', JSONObjectEachRow, 'object_name String, number UInt64') SETTINGS format_json_object_each_row_column_for_object_name='object_name'
```

```response title="响应"
┌─object_name─┬─number─┐
│ first_obj   │      1 │
│ second_obj  │      2 │
│ third_obj   │      3 │
└─────────────┴────────┘
```

它也适用于架构推断：

```sql title="查询"
DESCRIBE file('data.json', JSONObjectEachRow) SETTING format_json_object_each_row_column_for_object_name='object_name'
```

```response title="响应"
┌─name────────┬─type────────────┐
│ object_name │ String          │
│ number      │ Nullable(Int64) │
└─────────────┴─────────────────┘
```


### 插入数据 {#json-inserting-data}

```sql title="查询"
INSERT INTO UserActivity FORMAT JSONEachRow {"PageViews":5, "UserID":"4324182021466249494", "Duration":146,"Sign":-1} {"UserID":"4324182021466249494","PageViews":6,"Duration":185,"Sign":1}
```

ClickHouse 允许：

- 对象中的键值对顺序任意。
- 省略某些值。

ClickHouse 忽略元素之间的空格以及对象后面的逗号。您可以将所有对象以一行传入，无需用换行符分隔。

#### 省略值处理 {#omitted-values-processing}

ClickHouse 用对应 [数据类型](/sql-reference/data-types/index.md) 的默认值替代省略的值。

如果指定了 `DEFAULT expr`，则 ClickHouse 根据 [input_format_defaults_for_omitted_fields](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields) 设置使用不同的替代规则。

考虑以下表：

```sql title="查询"
CREATE TABLE IF NOT EXISTS example_table
(
    x UInt32,
    a DEFAULT x * 2
) ENGINE = Memory;
```

- 如果 `input_format_defaults_for_omitted_fields = 0`，则 `x` 和 `a` 的默认值均为 `0`（作为 `UInt32` 数据类型的默认值）。
- 如果 `input_format_defaults_for_omitted_fields = 1`，则 `x` 的默认值为 `0`，但 `a` 的默认值为 `x * 2`。

:::note
当使用 `input_format_defaults_for_omitted_fields = 1` 插入数据时，ClickHouse 消耗的计算资源更多，与使用 `input_format_defaults_for_omitted_fields = 0` 插入时相比。
:::

### 选择数据 {#json-selecting-data}

考虑 `UserActivity` 表作为示例：

```response
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │   -1 │
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

查询 `SELECT * FROM UserActivity FORMAT JSONEachRow` 返回：

```response
{"UserID":"4324182021466249494","PageViews":5,"Duration":146,"Sign":-1}
{"UserID":"4324182021466249494","PageViews":6,"Duration":185,"Sign":1}
```

与 [JSON](/interfaces/formats/JSON) 格式不同，不存在替代无效 UTF-8 序列。值使用与 `JSON` 相同的方式进行转义。

:::info
可以在字符串中输出任何字节集。如果您确保表中的数据可以格式化为 JSON 而不丢失任何信息，请使用 [`JSONEachRow`](./JSONEachRow.md) 格式。
:::

### 使用嵌套结构 {#jsoneachrow-nested}

如果您有一个包含 [`Nested`](/sql-reference/data-types/nested-data-structures/index.md) 数据类型列的表，您可以插入具有相同结构的 JSON 数据。通过 [input_format_import_nested_json](/operations/settings/settings-formats.md/#input_format_import_nested_json) 设置启用此功能。

例如，考虑以下表：

```sql
CREATE TABLE json_each_row_nested (n Nested (s String, i Int32) ) ENGINE = Memory
```

正如您在 `Nested` 数据类型描述中看到的，ClickHouse 将嵌套结构的每个组件视为单独的列（我们表中的 `n.s` 和 `n.i`）。您可以以以下方式插入数据：

```sql
INSERT INTO json_each_row_nested FORMAT JSONEachRow {"n.s": ["abc", "def"], "n.i": [1, 23]}
```

要将数据插入为层次 JSON 对象，请设置 [`input_format_import_nested_json=1`](/operations/settings/settings-formats.md/#input_format_import_nested_json)。

```json
{
    "n": {
        "s": ["abc", "def"],
        "i": [1, 23]
    }
}
```

在没有此设置的情况下，ClickHouse 会抛出异常。

```sql title="查询"
SELECT name, value FROM system.settings WHERE name = 'input_format_import_nested_json'
```

```response title="响应"
┌─name────────────────────────────┬─value─┐
│ input_format_import_nested_json │ 0     │
└─────────────────────────────────┴───────┘
```

```sql title="查询"
INSERT INTO json_each_row_nested FORMAT JSONEachRow {"n": {"s": ["abc", "def"], "i": [1, 23]}}
```

```response title="响应"
Code: 117. DB::Exception: Unknown field found while parsing JSONEachRow format: n: (at row 1)
```

```sql title="查询"
SET input_format_import_nested_json=1
INSERT INTO json_each_row_nested FORMAT JSONEachRow {"n": {"s": ["abc", "def"], "i": [1, 23]}}
SELECT * FROM json_each_row_nested
```

```response title="响应"
┌─n.s───────────┬─n.i────┐
│ ['abc','def'] │ [1,23] │
└───────────────┴────────┘
```

## 格式设置 {#format-settings}

| 设置                                                                                                                                                                            | 描述                                                                                                                                                             | 默认值  | 备注                                                                                                                                                                                         |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [`input_format_import_nested_json`](/operations/settings/settings-formats.md/#input_format_import_nested_json)                                                              | 将嵌套 JSON 数据映射到嵌套表（它适用于 JSONEachRow 格式）。                                                                                                  | `false`  |                                                                                                                                                                                               |
| [`input_format_json_read_bools_as_numbers`](/operations/settings/settings-formats.md/#input_format_json_read_bools_as_numbers)                                              | 允许在 JSON 输入格式中将布尔值解析为数字。                                                                                                                  | `true`   |                                                                                                                                                                                               |
| [`input_format_json_read_bools_as_strings`](/operations/settings/settings-formats.md/#input_format_json_read_bools_as_strings)                                              | 允许在 JSON 输入格式中将布尔值解析为字符串。                                                                                                                  | `true`   |                                                                                                                                                                                               |
| [`input_format_json_read_numbers_as_strings`](/operations/settings/settings-formats.md/#input_format_json_read_numbers_as_strings)                                          | 允许在 JSON 输入格式中将数字解析为字符串。                                                                                                                | `true`   |                                                                                                                                                                                               |
| [`input_format_json_read_arrays_as_strings`](/operations/settings/settings-formats.md/#input_format_json_read_arrays_as_strings)                                            | 允许在 JSON 输入格式中将 JSON 数组解析为字符串。                                                                                                            | `true`   |                                                                                                                                                                                               |
| [`input_format_json_read_objects_as_strings`](/operations/settings/settings-formats.md/#input_format_json_read_objects_as_strings)                                          | 允许在 JSON 输入格式中将 JSON 对象解析为字符串。                                                                                                           | `true`   |                                                                                                                                                                                               |
| [`input_format_json_named_tuples_as_objects`](/operations/settings/settings-formats.md/#input_format_json_named_tuples_as_objects)                                          | 将命名元组列解析为 JSON 对象。                                                                                                                              | `true`   |                                                                                                                                                                                               |
| [`input_format_json_try_infer_numbers_from_strings`](/operations/settings/settings-formats.md/#input_format_json_try_infer_numbers_from_strings)                            | 尝试在模式推断期间从字符串字段推断数字。                                                                                                         | `false`  |                                                                                                                                                                                               |
| [`input_format_json_try_infer_named_tuples_from_objects`](/operations/settings/settings-formats.md/#input_format_json_try_infer_named_tuples_from_objects)                  | 尝试在模式推断期间从 JSON 对象推断命名元组。                                                                                                     | `true`   |                                                                                                                                                                                               |
| [`input_format_json_infer_incomplete_types_as_strings`](/operations/settings/settings-formats.md/#input_format_json_infer_incomplete_types_as_strings)                      | 在 JSON 输入格式的模式推断期间，对仅包含 Null 或空对象/数组的键使用类型字符串。                                                | `true`   |                                                                                                                                                                                               |
| [`input_format_json_defaults_for_missing_elements_in_named_tuple`](/operations/settings/settings-formats.md/#input_format_json_defaults_for_missing_elements_in_named_tuple) | 在解析命名元组的 JSON 对象时，为缺失元素插入默认值。                                                                                   | `true`   |                                                                                                                                                                                               |
| [`input_format_json_ignore_unknown_keys_in_named_tuple`](/operations/settings/settings-formats.md/#input_format_json_ignore_unknown_keys_in_named_tuple)                    | 忽略命名元组的 JSON 对象中的未知键。                                                                                                                    | `false`  |                                                                                                                                                                                               |
| [`input_format_json_compact_allow_variable_number_of_columns`](/operations/settings/settings-formats.md/#input_format_json_compact_allow_variable_number_of_columns)        | 允许在 JSONCompact/JSONCompactEachRow 格式中使用变量数量的列，忽略额外列并对缺失列使用默认值。                              | `false`  |                                                                                                                                                                                               |
| [`input_format_json_throw_on_bad_escape_sequence`](/operations/settings/settings-formats.md/#input_format_json_throw_on_bad_escape_sequence)                                | 如果 JSON 字符串包含错误的转义序列则抛出异常。如果禁用，错误的转义序列将保持不变。                                        | `true`   |                                                                                                                                                                                               |
| [`input_format_json_empty_as_default`](/operations/settings/settings-formats.md/#input_format_json_empty_as_default)                                                        | 将 JSON 输入中的空字段视为默认值。                                                                                                                     | `false`  | 对于复杂的默认表达式，必须同时启用 [`input_format_defaults_for_omitted_fields`](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields)。 |
| [`output_format_json_quote_64bit_integers`](/operations/settings/settings-formats.md/#output_format_json_quote_64bit_integers)                                              | 控制在 JSON 输出格式中 64 位整数的引用方式。                                                                                                              | `true`   |                                                                                                                                                                                               |
| [`output_format_json_quote_64bit_floats`](/operations/settings/settings-formats.md/#output_format_json_quote_64bit_floats)                                                  | 控制在 JSON 输出格式中 64 位浮点数的引用方式。                                                                                                                | `false`  |                                                                                                                                                                                               |
| [`output_format_json_quote_denormals`](/operations/settings/settings-formats.md/#output_format_json_quote_denormals)                                                        | 启用在 JSON 输出格式中的 '+nan'、'-nan'、'+inf' 和 '-inf' 输出。                                                                                                   | `false`  |                                                                                                                                                                                               |
| [`output_format_json_quote_decimals`](/operations/settings/settings-formats.md/#output_format_json_quote_decimals)                                                          | 控制在 JSON 输出格式中十进制的引用方式。                                                                                                                     | `false`  |                                                                                                                                                                                               |
| [`output_format_json_escape_forward_slashes`](/operations/settings/settings-formats.md/#output_format_json_escape_forward_slashes)                                          | 控制在 JSON 输出格式中对字符串输出的正斜杠进行转义。                                                                                             | `true`   |                                                                                                                                                                                               |
| [`output_format_json_named_tuples_as_objects`](/operations/settings/settings-formats.md/#output_format_json_named_tuples_as_objects)                                        | 将命名元组列序列化为 JSON 对象。                                                                                                                          | `true`   |                                                                                                                                                                                               |
| [`output_format_json_array_of_rows`](/operations/settings/settings-formats.md/#output_format_json_array_of_rows)                                                            | 以 JSONEachRow(Compact) 格式输出所有行的 JSON 数组。                                                                                                         | `false`  |                                                                                                                                                                                               |
| [`output_format_json_validate_utf8`](/operations/settings/settings-formats.md/#output_format_json_validate_utf8)                                                            | 启用在 JSON 输出格式中对 UTF-8 序列的验证（注意，它不会影响 JSON/JSONCompact/JSONColumnsWithMetadata 格式，它们总是验证 UTF-8）。 | `false`  |                                                                                                                                                                                               |
