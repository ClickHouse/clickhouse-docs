---
'alias': []
'description': 'JSONObjectEachRow 格式的文档'
'input_format': true
'keywords':
- 'JSONObjectEachRow'
'output_format': true
'slug': '/interfaces/formats/JSONObjectEachRow'
'title': 'JSONObjectEachRow'
'doc_type': 'reference'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 描述 {#description}

在此格式中，所有数据都表示为单个 JSON 对象，每一行作为该对象的一个单独字段，类似于 [`JSONEachRow`](./JSONEachRow.md) 格式。

## 示例用法 {#example-usage}

### 基本示例 {#basic-example}

给定某些 JSON：

```json
{
  "row_1": {"num": 42, "str": "hello", "arr":  [0,1]},
  "row_2": {"num": 43, "str": "hello", "arr":  [0,1,2]},
  "row_3": {"num": 44, "str": "hello", "arr":  [0,1,2,3]}
}
```

要使用对象名称作为列值，可以使用特殊设置 [`format_json_object_each_row_column_for_object_name`](/operations/settings/settings-formats.md/#format_json_object_each_row_column_for_object_name)。该设置的值被设置为一列的名称，该名称被用作结果对象中行的 JSON 键。

#### 输出 {#output}

假设我们有一个名为 `test` 的表，包含两列：

```text
┌─object_name─┬─number─┐
│ first_obj   │      1 │
│ second_obj  │      2 │
│ third_obj   │      3 │
└─────────────┴────────┘
```

让我们以 `JSONObjectEachRow` 格式输出，并使用 `format_json_object_each_row_column_for_object_name` 设置：

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

假设我们将上一个示例的输出存储在名为 `data.json` 的文件中：

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

这也适用于模式推断：

```sql title="Query"
DESCRIBE file('data.json', JSONObjectEachRow) SETTING format_json_object_each_row_column_for_object_name='object_name'
```

```response title="Response"
┌─name────────┬─type────────────┐
│ object_name │ String          │
│ number      │ Nullable(Int64) │
└─────────────┴─────────────────┘
```

### 插入数据 {#json-inserting-data}

```sql title="Query"
INSERT INTO UserActivity FORMAT JSONEachRow {"PageViews":5, "UserID":"4324182021466249494", "Duration":146,"Sign":-1} {"UserID":"4324182021466249494","PageViews":6,"Duration":185,"Sign":1}
```

ClickHouse 允许：

- 对象中的键值对以任意顺序排列。
- 省略某些值。

ClickHouse 会忽略元素之间的空格以及对象后的逗号。您可以在一行中传递所有对象，无需用换行符分隔它们。

#### 省略值处理 {#omitted-values-processing}

ClickHouse 用相应 [数据类型](/sql-reference/data-types/index.md) 的默认值替代省略的值。

如果指定了 `DEFAULT expr`，ClickHouse 根据 [input_format_defaults_for_omitted_fields](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields) 设置使用不同的替代规则。

考虑以下表：

```sql title="Query"
CREATE TABLE IF NOT EXISTS example_table
(
    x UInt32,
    a DEFAULT x * 2
) ENGINE = Memory;
```

- 如果 `input_format_defaults_for_omitted_fields = 0`，则 `x` 和 `a` 的默认值均为 `0`（因为 `UInt32` 数据类型的默认值）。
- 如果 `input_format_defaults_for_omitted_fields = 1`，则 `x` 的默认值为 `0`，但 `a` 的默认值为 `x * 2`。

:::note
使用 `input_format_defaults_for_omitted_fields = 1` 插入数据时，ClickHouse 消耗的计算资源相对较多，而使用 `input_format_defaults_for_omitted_fields = 0` 插入时则较少。
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

与 [JSON](/interfaces/formats/JSON) 格式不同，非法的 UTF-8 序列不被替代。值的转义方式与 `JSON` 相同。

:::info
任何字节集都可以在字符串中输出。如果您确保表中的数据可以格式化为 JSON 而不丢失任何信息，请使用 [`JSONEachRow`](./JSONEachRow.md) 格式。
:::

### 使用嵌套结构 {#jsoneachrow-nested}

如果您有一张包含 [`Nested`](/sql-reference/data-types/nested-data-structures/index.md) 数据类型列的表，您可以插入具有相同结构的 JSON 数据。通过 [input_format_import_nested_json](/operations/settings/settings-formats.md/#input_format_import_nested_json) 设置启用该功能。

例如，考虑以下表：

```sql
CREATE TABLE json_each_row_nested (n Nested (s String, i Int32) ) ENGINE = Memory
```

如您在 `Nested` 数据类型描述中所见，ClickHouse 将嵌套结构的每个组件视为独立的列（`n.s` 和 `n.i` 为我们的表）。您可以以以下方式插入数据：

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

没有此设置，ClickHouse 将抛出异常。

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

| 设置                                                                                                                                                                            | 描述                                                                                                                                                             | 默认值  | 备注                                                                                                                                                                                         |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [`input_format_import_nested_json`](/operations/settings/settings-formats.md/#input_format_import_nested_json)                                                              | 将嵌套 JSON 数据映射到嵌套表（适用于 JSONEachRow 格式）。                                                                                                  | `false`  |                                                                                                                                                                                              |
| [`input_format_json_read_bools_as_numbers`](/operations/settings/settings-formats.md/#input_format_json_read_bools_as_numbers)                                              | 允许将布尔值解析为 JSON 输入格式中的数字。                                                                                                                   | `true`   |                                                                                                                                                                                              |
| [`input_format_json_read_bools_as_strings`](/operations/settings/settings-formats.md/#input_format_json_read_bools_as_strings)                                              | 允许将布尔值解析为 JSON 输入格式中的字符串。                                                                                                                  | `true`   |                                                                                                                                                                                              |
| [`input_format_json_read_numbers_as_strings`](/operations/settings/settings-formats.md/#input_format_json_read_numbers_as_strings)                                          | 允许将数字解析为 JSON 输入格式中的字符串。                                                                                                                  | `true`   |                                                                                                                                                                                              |
| [`input_format_json_read_arrays_as_strings`](/operations/settings/settings-formats.md/#input_format_json_read_arrays_as_strings)                                            | 允许将 JSON 数组解析为 JSON 输入格式中的字符串。                                                                                                              | `true`   |                                                                                                                                                                                              |
| [`input_format_json_read_objects_as_strings`](/operations/settings/settings-formats.md/#input_format_json_read_objects_as_strings)                                          | 允许将 JSON 对象解析为 JSON 输入格式中的字符串。                                                                                                             | `true`   |                                                                                                                                                                                              |
| [`input_format_json_named_tuples_as_objects`](/operations/settings/settings-formats.md/#input_format_json_named_tuples_as_objects)                                          | 将命名元组列解析为 JSON 对象。                                                                                                                                 | `true`   |                                                                                                                                                                                              |
| [`input_format_json_try_infer_numbers_from_strings`](/operations/settings/settings-formats.md/#input_format_json_try_infer_numbers_from_strings)                            | 尝试在模式推断时从字符串字段推断数字。                                                                                                                       | `false`  |                                                                                                                                                                                              |
| [`input_format_json_try_infer_named_tuples_from_objects`](/operations/settings/settings-formats.md/#input_format_json_try_infer_named_tuples_from_objects)                  | 尝试在模式推断期间从 JSON 对象推断命名元组。                                                                                                               | `true`   |                                                                                                                                                                                              |
| [`input_format_json_infer_incomplete_types_as_strings`](/operations/settings/settings-formats.md/#input_format_json_infer_incomplete_types_as_strings)                      | 在 JSON 输入格式的模式推断过程中，对于仅包含 Null 或空对象/数组的键使用 String 类型。                                                                            | `true`   |                                                                                                                                                                                              |
| [`input_format_json_defaults_for_missing_elements_in_named_tuple`](/operations/settings/settings-formats.md/#input_format_json_defaults_for_missing_elements_in_named_tuple) | 在解析命名元组时为 JSON 对象中缺少的元素插入默认值。                                                                                                          | `true`   |                                                                                                                                                                                              |
| [`input_format_json_ignore_unknown_keys_in_named_tuple`](/operations/settings/settings-formats.md/#input_format_json_ignore_unknown_keys_in_named_tuple)                    | 在命名元组的 JSON 对象中忽略未知键。                                                                                                                         | `false`  |                                                                                                                                                                                              |
| [`input_format_json_compact_allow_variable_number_of_columns`](/operations/settings/settings-formats.md/#input_format_json_compact_allow_variable_number_of_columns)        | 允许在 JSONCompact/JSONCompactEachRow 格式中有可变数量的列，忽略多余的列并对缺少的列使用默认值。                                                               | `false`  |                                                                                                                                                                                              |
| [`input_format_json_throw_on_bad_escape_sequence`](/operations/settings/settings-formats.md/#input_format_json_throw_on_bad_escape_sequence)                                | 如果 JSON 字符串包含不好的转义序列则抛出异常。如果禁用，不好的转义序列将在数据中保持原样。                                                                   | `true`   |                                                                                                                                                                                              |
| [`input_format_json_empty_as_default`](/operations/settings/settings-formats.md/#input_format_json_empty_as_default)                                                        | 将 JSON 输入中的空字段视为默认值。                                                                                                                             | `false`. | 对于复杂的默认表达式，必须启用 [`input_format_defaults_for_omitted_fields`](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields)。                      |
| [`output_format_json_quote_64bit_integers`](/operations/settings/settings-formats.md/#output_format_json_quote_64bit_integers)                                              | 控制 JSON 输出格式中 64 位整数的引号。                                                                                                                       | `true`   |                                                                                                                                                                                              |
| [`output_format_json_quote_64bit_floats`](/operations/settings/settings-formats.md/#output_format_json_quote_64bit_floats)                                                  | 控制 JSON 输出格式中 64 位浮点数的引号。                                                                                                                     | `false`  |                                                                                                                                                                                              |
| [`output_format_json_quote_denormals`](/operations/settings/settings-formats.md/#output_format_json_quote_denormals)                                                        | 启用在 JSON 输出格式中输出 '+nan', '-nan', '+inf', '-inf'。                                                                                                    | `false`  |                                                                                                                                                                                              |
| [`output_format_json_quote_decimals`](/operations/settings/settings-formats.md/#output_format_json_quote_decimals)                                                          | 控制 JSON 输出格式中小数的引号。                                                                                                                                 | `false`  |                                                                                                                                                                                              |
| [`output_format_json_escape_forward_slashes`](/operations/settings/settings-formats.md/#output_format_json_escape_forward_slashes)                                          | 控制 JSON 输出格式中字符串输出的正斜杠转义。                                                                                                                    | `true`   |                                                                                                                                                                                              |
| [`output_format_json_named_tuples_as_objects`](/operations/settings/settings-formats.md/#output_format_json_named_tuples_as_objects)                                        | 将命名元组列序列化为 JSON 对象。                                                                                                                                 | `true`   |                                                                                                                                                                                              |
| [`output_format_json_array_of_rows`](/operations/settings/settings-formats.md/#output_format_json_array_of_rows)                                                            | 以 JSONEachRow(Compact) 格式输出所有行的 JSON 数组。                                                                                                             | `false`  |                                                                                                                                                                                              |
| [`output_format_json_validate_utf8`](/operations/settings/settings-formats.md/#output_format_json_validate_utf8)                                                            | 启用对 JSON 输出格式中 UTF-8 序列的验证（请注意，这不会影响格式 JSON/JSONCompact/JSONColumnsWithMetadata，它们总是验证 utf8）。                                   | `false`  |                                                                                                                                                                                              |
