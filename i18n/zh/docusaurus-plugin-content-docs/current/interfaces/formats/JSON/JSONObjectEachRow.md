---
'alias': []
'description': 'JSONObjectEachRow 格式的文档'
'input_format': true
'keywords':
- 'JSONObjectEachRow'
'output_format': true
'slug': '/interfaces/formats/JSONObjectEachRow'
'title': 'JSONObjectEachRow'
---



| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✔     | ✔      |       |

## 描述 {#description}

在这种格式中，所有数据都作为单个 JSON 对象表示，每一行作为该对象的单独字段，类似于 [`JSONEachRow`](./JSONEachRow.md) 格式。

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

要将对象名称用作列值，可以使用特殊设置 [`format_json_object_each_row_column_for_object_name`](/operations/settings/settings-formats.md/#format_json_object_each_row_column_for_object_name)。 
该设置的值设置为一列的名称，该名称用作结果对象中行的 JSON 键。

#### 输出 {#output}

假设我们有一个名为 `test` 的表，包含两列：

```text
┌─object_name─┬─number─┐
│ first_obj   │      1 │
│ second_obj  │      2 │
│ third_obj   │      3 │
└─────────────┴────────┘
```

我们将其以 `JSONObjectEachRow` 格式输出，并使用 `format_json_object_each_row_column_for_object_name` 设置：

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

假设我们将前一个示例的输出存储在名为 `data.json` 的文件中：

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

它也适用于模式推断：

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

- 对象中键值对的任何顺序。
- 省略某些值。

ClickHouse 会忽略元素之间的空格和对象后面的逗号。您可以在一行中传递所有对象。您不需要用换行符分隔它们。

#### 省略值处理 {#omitted-values-processing}

ClickHouse 用相应的 [数据类型](/sql-reference/data-types/index.md) 的默认值替代省略值。

如果指定了 `DEFAULT expr`，ClickHouse 会根据 [input_format_defaults_for_omitted_fields](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields) 设置使用不同的替代规则。

考虑以下表：

```sql title="Query"
CREATE TABLE IF NOT EXISTS example_table
(
    x UInt32,
    a DEFAULT x * 2
) ENGINE = Memory;
```

- 如果 `input_format_defaults_for_omitted_fields = 0`，则 `x` 和 `a` 的默认值均为 `0` （因为 `UInt32` 数据类型的默认值为 `0`）。
- 如果 `input_format_defaults_for_omitted_fields = 1`，则 `x` 的默认值为 `0`，但 `a` 的默认值为 `x * 2`。

:::note
使用 `input_format_defaults_for_omitted_fields = 1` 插入数据时，ClickHouse 消耗的计算资源比使用 `input_format_defaults_for_omitted_fields = 0` 时更多。
:::

### 选择数据 {#json-selecting-data}

以 `UserActivity` 表为例：

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

与 [JSON](/interfaces/formats/JSON) 格式不同，无法替换无效的 UTF-8 序列。值以与 `JSON` 相同的方式进行转义。

:::info
任何字节集都可以在字符串中输出。如果您确信表中的数据可以无损地格式化为 JSON，请使用 [`JSONEachRow`](./JSONEachRow.md) 格式。
:::

### 使用嵌套结构 {#jsoneachrow-nested}

如果您有包含 [`Nested`](/sql-reference/data-types/nested-data-structures/index.md) 数据类型列的表，您可以插入具有相同结构的 JSON 数据。通过 [input_format_import_nested_json](/operations/settings/settings-formats.md/#input_format_import_nested_json) 设置启用此功能。

例如，考虑以下表：

```sql
CREATE TABLE json_each_row_nested (n Nested (s String, i Int32) ) ENGINE = Memory
```

如您在 `Nested` 数据类型描述中看到的，ClickHouse 将嵌套结构的每个组件视为单独的列（对于我们的表来说是 `n.s` 和 `n.i`）。您可以如下插入数据：

```sql
INSERT INTO json_each_row_nested FORMAT JSONEachRow {"n.s": ["abc", "def"], "n.i": [1, 23]}
```

要将数据作为层次 JSON 对象插入，请设置 [`input_format_import_nested_json=1`](/operations/settings/settings-formats.md/#input_format_import_nested_json)。

```json
{
    "n": {
        "s": ["abc", "def"],
        "i": [1, 23]
    }
}
```

如果未设置此配置，ClickHouse 会抛出异常。

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
|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [`input_format_import_nested_json`](/operations/settings/settings-formats.md/#input_format_import_nested_json)                                                              | 将嵌套 JSON 数据映射到嵌套表（它适用于 JSONEachRow 格式）。                                                                                                | `false`  |                                                                                                                                                                                               |
| [`input_format_json_read_bools_as_numbers`](/operations/settings/settings-formats.md/#input_format_json_read_bools_as_numbers)                                              | 允许在 JSON 输入格式中将布尔值解析为数字。                                                                                                                  | `true`   |                                                                                                                                                                                               |
| [`input_format_json_read_bools_as_strings`](/operations/settings/settings-formats.md/#input_format_json_read_bools_as_strings)                                              | 允许在 JSON 输入格式中将布尔值解析为字符串。                                                                                                                  | `true`   |                                                                                                                                                                                               |
| [`input_format_json_read_numbers_as_strings`](/operations/settings/settings-formats.md/#input_format_json_read_numbers_as_strings)                                          | 允许在 JSON 输入格式中将数字解析为字符串。                                                                                                                | `true`   |                                                                                                                                                                                               |
| [`input_format_json_read_arrays_as_strings`](/operations/settings/settings-formats.md/#input_format_json_read_arrays_as_strings)                                            | 允许在 JSON 输入格式中将 JSON 数组解析为字符串。                                                                                                            | `true`   |                                                                                                                                                                                               |
| [`input_format_json_read_objects_as_strings`](/operations/settings/settings-formats.md/#input_format_json_read_objects_as_strings)                                          | 允许在 JSON 输入格式中将 JSON 对象解析为字符串。                                                                                                           | `true`   |                                                                                                                                                                                               |
| [`input_format_json_named_tuples_as_objects`](/operations/settings/settings-formats.md/#input_format_json_named_tuples_as_objects)                                          | 将命名元组列解析为 JSON 对象。                                                                                                                              | `true`   |                                                                                                                                                                                               |
| [`input_format_json_try_infer_numbers_from_strings`](/operations/settings/settings-formats.md/#input_format_json_try_infer_numbers_from_strings)                            | 在模式推断时尝试从字符串字段推断数字。                                                                                                         | `false`  |                                                                                                                                                                                               |
| [`input_format_json_try_infer_named_tuples_from_objects`](/operations/settings/settings-formats.md/#input_format_json_try_infer_named_tuples_from_objects)                  | 尝试在模式推断过程中从 JSON 对象推断命名元组。                                                                                                     | `true`   |                                                                                                                                                                                               |
| [`input_format_json_infer_incomplete_types_as_strings`](/operations/settings/settings-formats.md/#input_format_json_infer_incomplete_types_as_strings)                      | 在 JSON 输入格式的模式推断中，对于只包含 Null 或空对象/数组的键使用类型 String。                                                | `true`   |                                                                                                                                                                                               |
| [`input_format_json_defaults_for_missing_elements_in_named_tuple`](/operations/settings/settings-formats.md/#input_format_json_defaults_for_missing_elements_in_named_tuple) | 在解析命名元组时，为 JSON 对象中缺失的元素插入默认值。                                                                                   | `true`   |                                                                                                                                                                                               |
| [`input_format_json_ignore_unknown_keys_in_named_tuple`](/operations/settings/settings-formats.md/#input_format_json_ignore_unknown_keys_in_named_tuple)                    | 忽略命名元组的 JSON 对象中的未知键。                                                                                                                    | `false`  |                                                                                                                                                                                               |
| [`input_format_json_compact_allow_variable_number_of_columns`](/operations/settings/settings-formats.md/#input_format_json_compact_allow_variable_number_of_columns)        | 允许在 JSONCompact/JSONCompactEachRow 格式中使用可变数量的列，忽略多余的列，并在缺失的列上使用默认值。                              | `false`  |                                                                                                                                                                                               |
| [`input_format_json_throw_on_bad_escape_sequence`](/operations/settings/settings-formats.md/#input_format_json_throw_on_bad_escape_sequence)                                | 如果 JSON 字符串包含错误的转义序列，则抛出异常。如果禁用，错误的转义序列将在数据中保持原样。                                        | `true`   |                                                                                                                                                                                               |
| [`input_format_json_empty_as_default`](/operations/settings/settings-formats.md/#input_format_json_empty_as_default)                                                        | 将 JSON 输入中的空字段视为默认值。                                                                                                                     | `false`. | 对于复杂默认表达式，必须启用 [`input_format_defaults_for_omitted_fields`](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields)。 |
| [`output_format_json_quote_64bit_integers`](/operations/settings/settings-formats.md/#output_format_json_quote_64bit_integers)                                              | 控制 JSON 输出格式中 64 位整数的引号。                                                                                                              | `true`   |                                                                                                                                                                                               |
| [`output_format_json_quote_64bit_floats`](/operations/settings/settings-formats.md/#output_format_json_quote_64bit_floats)                                                  | 控制 JSON 输出格式中 64 位浮点数的引号。                                                                                                                | `false`  |                                                                                                                                                                                               |
| [`output_format_json_quote_denormals`](/operations/settings/settings-formats.md/#output_format_json_quote_denormals)                                                        | 在 JSON 输出格式中启用输出 '+nan'、'-nan'、'+inf'、'-inf'。                                                                                                   | `false`  |                                                                                                                                                                                               |
| [`output_format_json_quote_decimals`](/operations/settings/settings-formats.md/#output_format_json_quote_decimals)                                                          | 控制 JSON 输出格式中小数的引号。                                                                                                                     | `false`  |                                                                                                                                                                                               |
| [`output_format_json_escape_forward_slashes`](/operations/settings/settings-formats.md/#output_format_json_escape_forward_slashes)                                          | 控制 JSON 输出格式中字符串输出的正斜杠转义。                                                                                             | `true`   |                                                                                                                                                                                               |
| [`output_format_json_named_tuples_as_objects`](/operations/settings/settings-formats.md/#output_format_json_named_tuples_as_objects)                                        | 将命名元组列序列化为 JSON 对象。                                                                                                                          | `true`   |                                                                                                                                                                                               |
| [`output_format_json_array_of_rows`](/operations/settings/settings-formats.md/#output_format_json_array_of_rows)                                                            | 在 JSONEachRow(Compact) 格式中输出所有行的 JSON 数组。                                                                                                         | `false`  |                                                                                                                                                                                               |
| [`output_format_json_validate_utf8`](/operations/settings/settings-formats.md/#output_format_json_validate_utf8)                                                            | 启用 JSON 输出格式中对 UTF-8 序列的验证（请注意，这不会影响 JSON/JSONCompact/JSONColumnsWithMetadata 格式，它们始终验证 utf8）。 | `false`  |                                                                                                                                                                                               |
