---
alias: []
description: 'LineAsString 格式文档'
input_format: true
keywords: ['LineAsString']
output_format: true
slug: /interfaces/formats/LineAsString
title: 'LineAsString'
doc_type: 'reference'
---

| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✔     | ✔      |       |

## 描述 \\{#description\\}

`LineAsString` 格式将输入数据的每一行都视为一个单独的字符串值。
此格式只能用于解析仅包含一个 [String](/sql-reference/data-types/string.md) 类型字段的表。
其余列必须设置为 [`DEFAULT`](/sql-reference/statements/create/table.md/#default)、[`MATERIALIZED`](/sql-reference/statements/create/view#materialized-view) 或省略。

## 使用示例 \\{#example-usage\\}

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

## 格式设置 \\{#format-settings\\}