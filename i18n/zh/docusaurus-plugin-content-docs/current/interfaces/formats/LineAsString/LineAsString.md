---
'alias': []
'description': 'LineAsString 格式的文档'
'input_format': true
'keywords':
- 'LineAsString'
'output_format': true
'slug': '/interfaces/formats/LineAsString'
'title': 'LineAsString'
'doc_type': 'reference'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 描述 {#description}

`LineAsString` 格式将每行输入数据解析为单个字符串值。 
此格式只能用于具有单个 [String](/sql-reference/data-types/string.md) 类型字段的表。 
其余列必须设置为 [`DEFAULT`](/sql-reference/statements/create/table.md/#default)、[`MATERIALIZED`](/sql-reference/statements/create/view#materialized-view) 或省略。

## 示例用法 {#example-usage}

```sql title="Query"
DROP TABLE IF EXISTS line_as_string;
CREATE TABLE line_as_string (field String) ENGINE = Memory;
INSERT INTO line_as_string FORMAT LineAsString "I love apple", "I love banana", "I love orange";
SELECT * FROM line_as_string;
```

```text title="Response"
┌─field─────────────────────────────────────────────┐
│ "I love apple", "I love banana", "I love orange"; │
└───────────────────────────────────────────────────┘
```

## 格式设置 {#format-settings}
