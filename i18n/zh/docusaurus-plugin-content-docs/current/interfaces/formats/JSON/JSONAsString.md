---
'alias': []
'description': 'JSONAsString 格式的文档'
'input_format': true
'keywords':
- 'JSONAsString'
'output_format': false
'slug': '/interfaces/formats/JSONAsString'
'title': 'JSONAsString'
'doc_type': 'reference'
---

| 输入 | 输出  | 别名 |
|-------|---------|-------|
| ✔     | ✗       |       |

## 描述 {#description}

在此格式中，单个 JSON 对象被解释为单个值。
如果输入包含多个 JSON 对象（用逗号分隔），它们被解释为单独的行。
如果输入数据被方括号括起来，则被解释为 JSON 对象的数组。

:::note
此格式只能解析为具有单个字段类型为 [String](/sql-reference/data-types/string.md) 的表。
其余列必须设置为 [`DEFAULT`](/sql-reference/statements/create/table.md/#default) 或 [`MATERIALIZED`](/sql-reference/statements/create/view#materialized-view)，
或被省略。
:::

一旦将整个 JSON 对象序列化为字符串，您可以使用 [JSON 函数](/sql-reference/functions/json-functions.md) 来处理它。

## 示例用法 {#example-usage}

### 基本示例 {#basic-example}

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

### JSON 对象的数组 {#an-array-of-json-objects}

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

## 格式设置 {#format-settings}
