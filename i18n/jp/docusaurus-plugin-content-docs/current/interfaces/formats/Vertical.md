---
alias: []
description: '垂直フォーマットのドキュメント'
input_format: false
keywords: ['Vertical']
output_format: true
slug: /interfaces/formats/Vertical
title: '垂直'
---

| 入力 | 出力 | エイリアス |
|------|------|-----------|
| ✗    | ✔    |           |

## 説明 {#description}

各値を指定されたカラム名で別々の行に印刷します。このフォーマットは、各行が多数のカラムで構成されている場合に、1行または数行だけを印刷するのに便利です。 [`NULL`](/sql-reference/syntax.md) は `ᴺᵁᴸᴸ` として出力されます。

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

垂直フォーマットでは行はエスケープされません:

```sql
SELECT 'string with \'quotes\' and \t with some special \n characters' AS test FORMAT Vertical
```

```response
行 1:
──────
test: string with 'quotes' and      with some special
 characters
```

このフォーマットはクエリ結果を出力するのには適していますが、データをパース（テーブルに挿入するためのデータの取得）するためには不適切です。

## フォーマット設定 {#format-settings}
