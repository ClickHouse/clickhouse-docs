---
title: 'LineAsString'
slug: /interfaces/formats/LineAsString
keywords: [LineAsString]
input_format: true
output_format: true
alias: []
---

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

`LineAsString` 形式は、入力データの各行を単一の文字列値として解釈します。  
この形式は、[String](/sql-reference/data-types/string.md) 型の単一フィールドを持つテーブルに対してのみ解析可能です。  
残りのカラムは [`DEFAULT`](/sql-reference/statements/create/table.md/#default)、[`MATERIALIZED`](/sql-reference/statements/create/view#materialized-view) に設定するか、省略する必要があります。

## 使用例 {#example-usage}

```sql title="クエリ"
DROP TABLE IF EXISTS line_as_string;
CREATE TABLE line_as_string (field String) ENGINE = Memory;
INSERT INTO line_as_string FORMAT LineAsString "I love apple", "I love banana", "I love orange";
SELECT * FROM line_as_string;
```

```text title="レスポンス"
┌─field─────────────────────────────────────────────┐
│ "I love apple", "I love banana", "I love orange"; │
└───────────────────────────────────────────────────┘
```

## フォーマット設定 {#format-settings}
