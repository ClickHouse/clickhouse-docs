---
title: LineAsString
slug: /interfaces/formats/LineAsString
keywords: ['LineAsString']
input_format: true
output_format: true
alias: []
---

| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✔     | ✔      |       |

## 描述 {#description}

`LineAsString` 格式将每一行输入数据解释为一个单独的字符串值。  
该格式仅可用于具有单个字段类型为 [String](/sql-reference/data-types/string.md) 的表。  
其余列必须设置为 [`DEFAULT`](/sql-reference/statements/create/table.md/#default)、[`MATERIALIZED`](/sql-reference/statements/create/view#materialized-view) 或省略。

## 示例用法 {#example-usage}

```sql title="查询"
DROP TABLE IF EXISTS line_as_string;
CREATE TABLE line_as_string (field String) ENGINE = Memory;
INSERT INTO line_as_string FORMAT LineAsString "I love apple", "I love banana", "I love orange";
SELECT * FROM line_as_string;
```

```text title="响应"
┌─field─────────────────────────────────────────────┐
│ "I love apple", "I love banana", "I love orange"; │
└───────────────────────────────────────────────────┘
```

## 格式设置 {#format-settings}
