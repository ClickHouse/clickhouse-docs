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

| Input | Output | 別名 |
|-------|--------|-------|
| ✗     | ✔      |       |



## Description {#description}

各値を列名とともに別々の行に出力します。この形式は、各行が多数の列で構成されている場合に、1行または数行のみを出力する際に便利です。

なお、[`NULL`](/sql-reference/syntax.md)は文字列値`NULL`と値なしを区別しやすくするために`ᴺᵁᴸᴸ`として出力されます。JSON列は整形されて出力され、`NULL`は有効なJSON値であり`"null"`と容易に区別できるため、`null`として出力されます。


## 使用例 {#example-usage}

例:

```sql
SELECT * FROM t_null FORMAT Vertical
```

```response
Row 1:
──────
x: 1
y: ᴺᵁᴸᴸ
```

Vertical形式では行はエスケープされません:

```sql
SELECT 'string with \'quotes\' and \t with some special \n characters' AS test FORMAT Vertical
```

```response
Row 1:
──────
test: string with 'quotes' and      with some special
 characters
```

この形式はクエリ結果の出力にのみ適しており、解析(テーブルへ挿入するデータの取得)には適していません。


## フォーマット設定 {#format-settings}
