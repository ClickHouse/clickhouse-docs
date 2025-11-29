---
alias: []
description: 'Vertical 形式に関するドキュメント'
input_format: false
keywords: ['Vertical']
output_format: true
slug: /interfaces/formats/Vertical
title: 'Vertical'
doc_type: 'reference'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✗     | ✔      |       |



## 説明 {#description}

各値を、指定された列名とともに個別の行に出力します。この形式は、各行が多数の列で構成されている場合に、1 行または少数の行だけを出力するのに便利です。

[`NULL`](/sql-reference/syntax.md) は、文字列値 `NULL` と値が存在しないことを区別しやすくするために `ᴺᵁᴸᴸ` として出力されることに注意してください。JSON 列は整形して表示され、`NULL` は `null` として出力されます。これは有効な JSON 値であり、`"null"` と容易に区別できるためです。



## 使用例 {#example-usage}

例:

```sql
SELECT * FROM t_null FORMAT Vertical
```

```response
行 1:
──────
x: 1
y: ᴺᵁᴸᴸ
```

Vertical 形式では行はエスケープされません。

```sql
SELECT 'string with \'quotes\' and \t with some special \n characters' AS test FORMAT Vertical
```

```response
行 1:
──────
test: 'quotes' を含む文字列と      いくつかの特殊
 文字
```

この形式はクエリ結果の出力にのみ適しており、パース（テーブルへの挿入用にデータを取得する処理）には適していません。


## フォーマット設定 {#format-settings}
