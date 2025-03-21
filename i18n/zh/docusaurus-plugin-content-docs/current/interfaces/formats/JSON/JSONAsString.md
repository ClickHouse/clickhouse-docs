---
title: 'JSONAsString'
slug: '/interfaces/formats/JSONAsString'
keywords: ['JSONAsString']
input_format: true
output_format: false
alias: []
---

| 输入   | 输出    | 别名  |
|--------|---------|-------|
| ✔      | ✗       |       |


## 描述 {#description}

在该格式中，单个 JSON 对象被解释为单个值。 
如果输入有多个 JSON 对象（用逗号分隔），它们将被解释为单独的行。 
如果输入数据被方括号包围，则被解释为一个 JSON 对象数组。

:::note
此格式仅可解析为只有一个类型为 [String](/sql-reference/data-types/string.md) 的字段的表。 
其余列必须设置为 [`DEFAULT`](/sql-reference/statements/create/table.md/#default) 或 [`MATERIALIZED`](/sql-reference/statements/create/view#materialized-view)， 
或者被省略。 
:::

一旦将整个 JSON 对象序列化为字符串，您可以使用 [JSON 函数](/sql-reference/functions/json-functions.md) 来处理它。

## 示例用法 {#example-usage}

### 基本示例 {#basic-example}

```sql title="查询"
DROP TABLE IF EXISTS json_as_string;
CREATE TABLE json_as_string (json String) ENGINE = Memory;
INSERT INTO json_as_string (json) FORMAT JSONAsString {"foo":{"bar":{"x":"y"},"baz":1}},{},{"any json stucture":1}
SELECT * FROM json_as_string;
```

```response title="响应"
┌─json──────────────────────────────┐
│ {"foo":{"bar":{"x":"y"},"baz":1}} │
│ {}                                │
│ {"any json stucture":1}           │
└───────────────────────────────────┘
```

### 一组 JSON 对象 {#an-array-of-json-objects}

```sql title="查询"
CREATE TABLE json_square_brackets (field String) ENGINE = Memory;
INSERT INTO json_square_brackets FORMAT JSONAsString [{"id": 1, "name": "name1"}, {"id": 2, "name": "name2"}];

SELECT * FROM json_square_brackets;
```

```response title="响应"
┌─field──────────────────────┐
│ {"id": 1, "name": "name1"} │
│ {"id": 2, "name": "name2"} │
└────────────────────────────┘
```

## 格式设置 {#format-settings}
