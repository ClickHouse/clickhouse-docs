---
alias: []
description: 'Vertical formatのドキュメント'
input_format: false
keywords:
- 'Vertical'
output_format: true
slug: '/interfaces/formats/Vertical'
title: 'Vertical'
---



| Input | Output | Alias |
|-------|--------|-------|
| ✗     | ✔      |       |

## 説明 {#description}

指定したカラム名で各値を別々の行に出力します。この形式は、各行が大量のカラムで構成されている場合に、一つまたは少数の行を印刷するのに便利です。
[`NULL`](/sql-reference/syntax.md)は`ᴺᵁᴸᴸ`として出力されます。

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

この形式はクエリ結果の出力にのみ適しており、データをテーブルに挿入するための解析には適していません。

## フォーマット設定 {#format-settings}
