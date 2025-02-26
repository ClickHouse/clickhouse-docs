---
title : 垂直
slug: /interfaces/formats/Vertical
keywords : [垂直]
input_format: false
output_format: true
alias: []
---

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✗     | ✔      |       |

## 説明 {#description}

各値を指定されたカラム名とともに別々の行に印刷します。このフォーマットは、各行が多くのカラムで構成される場合に、1つまたは数行のみを印刷するのに便利です。
[`NULL`](/sql-reference/syntax.md) は `ᴺᵁᴸᴸ` として出力されます。

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

このフォーマットはクエリ結果の出力には適していますが、データを解析（テーブルに挿入するために取得）するには適していません。

## フォーマット設定 {#format-settings}
