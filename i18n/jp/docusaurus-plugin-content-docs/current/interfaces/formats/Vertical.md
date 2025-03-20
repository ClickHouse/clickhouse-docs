---
title: Vertical
slug: /interfaces/formats/Vertical
keywords: [Vertical]
input_format: false
output_format: true
alias: []
---

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✗     | ✔      |       |

## 説明 {#description}

各値を指定されたカラム名で別の行に出力します。このフォーマットは、各行が多数のカラムで構成されている場合に、1つまたは数行だけを印刷するのに便利です。 [`NULL`](/sql-reference/syntax.md) は `ᴺᵁᴸᴸ` として出力されます。

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

Verticalフォーマットでは、行はエスケープされません:

```sql
SELECT 'string with \'quotes\' and \t with some special \n characters' AS test FORMAT Vertical
```

```response
行 1:
──────
test: string with 'quotes' and      with some special
 characters
```

このフォーマットはクエリ結果の出力にのみ適しており、データをテーブルに挿入するための解析には適していません。

## フォーマット設定 {#format-settings}
