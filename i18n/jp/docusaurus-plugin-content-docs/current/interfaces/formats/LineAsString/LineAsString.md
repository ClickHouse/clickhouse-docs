---
title: LineAsString
slug: /interfaces/formats/LineAsString
keywords: [LineAsString]
input_format: true
output_format: true
alias: []
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## Description {#description}

`LineAsString`フォーマットは、入力データの各行を単一の文字列値として解釈します。このフォーマットは、[String](/sql-reference/data-types/string.md)型のフィールドが一つだけのテーブルに対してのみパース可能です。他のカラムは[`DEFAULT`](/sql-reference/statements/create/table.md/#default)、[`MATERIALIZED`](/sql-reference/statements/create/table.md/#materialized)に設定するか、省略する必要があります。

## Example Usage {#example-usage}

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

## Format Settings {#format-settings}
