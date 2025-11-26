---
alias: []
description: 'LineAsString フォーマットに関するドキュメント'
input_format: true
keywords: ['LineAsString']
output_format: true
slug: /interfaces/formats/LineAsString
title: 'LineAsString'
doc_type: 'reference'
---

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✔     | ✔      |       |



## 説明 {#description}

`LineAsString` フォーマットは、入力データの各行を 1 つの文字列値として解釈します。  
このフォーマットは、[String](/sql-reference/data-types/string.md) 型の単一フィールドだけを持つテーブルでのみ使用できます。  
残りのカラムは、[`DEFAULT`](/sql-reference/statements/create/table.md/#default)、[`MATERIALIZED`](/sql-reference/statements/create/view#materialized-view) に設定するか、省略する必要があります。



## 使用例

```sql title="Query"
DROP TABLE IF EXISTS line_as_string;
CREATE TABLE line_as_string (field String) ENGINE = Memory;
INSERT INTO line_as_string FORMAT LineAsString "私はリンゴが好きです", "私はバナナが好きです", "私はオレンジが好きです";
SELECT * FROM line_as_string;
```

```text title="Response"
┌─field─────────────────────────────────────────────┐
│ "I love apple", "I love banana", "I love orange"; │
└───────────────────────────────────────────────────┘
```


## フォーマット設定 {#format-settings}