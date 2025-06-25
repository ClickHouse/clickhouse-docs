---
'alias': []
'description': 'JSONAsString 格式的文档'
'input_format': true
'keywords':
- 'JSONAsString'
'output_format': false
'slug': '/interfaces/formats/JSONAsString'
'title': 'JSONAsString'
---

| Input | Output  | Alias |
|-------|---------|-------|
| ✔     | ✗       |       |


## Description {#description}

在这种格式中，单个 JSON 对象被解释为单个值。 
如果输入包含多个 JSON 对象（用逗号分隔），则它们被解释为独立的行。 
如果输入数据被方括号括起来，则它被解释为 JSON 对象的数组。

:::note
此格式只能被解析为具有单个字段类型为 [String](/sql-reference/data-types/string.md) 的表。 
其余列必须设置为 [`DEFAULT`](/sql-reference/statements/create/table.md/#default) 或 [`MATERIALIZED`](/sql-reference/statements/create/view#materialized-view)， 
或省略。 
:::

一旦你将整个 JSON 对象序列化为 String，你可以使用 [JSON functions](/sql-reference/functions/json-functions.md) 来处理它。

## Example Usage {#example-usage}

### Basic Example {#basic-example}

```sql title="Query"
DROP TABLE IF EXISTS json_as_string;
CREATE TABLE json_as_string (json String) ENGINE = Memory;
INSERT INTO json_as_string (json) FORMAT JSONAsString {"foo":{"bar":{"x":"y"},"baz":1}},{},{"any json stucture":1}
SELECT * FROM json_as_string;
```

```response title="Response"
┌─json──────────────────────────────┐
│ {"foo":{"bar":{"x":"y"},"baz":1}} │
│ {}                                │
│ {"any json stucture":1}           │
└───────────────────────────────────┘
```

### An array of JSON objects {#an-array-of-json-objects}

```sql title="Query"
CREATE TABLE json_square_brackets (field String) ENGINE = Memory;
INSERT INTO json_square_brackets FORMAT JSONAsString [{"id": 1, "name": "name1"}, {"id": 2, "name": "name2"}];

SELECT * FROM json_square_brackets;
```

```response title="Response"
┌─field──────────────────────┐
│ {"id": 1, "name": "name1"} │
│ {"id": 2, "name": "name2"} │
└────────────────────────────┘
```

## Format Settings {#format-settings}
