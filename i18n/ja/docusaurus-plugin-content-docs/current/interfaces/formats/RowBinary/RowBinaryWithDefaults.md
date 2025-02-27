---
title : RowBinaryWithDefaults
slug: /interfaces/formats/RowBinaryWithDefaults
keywords : [RowBinaryWithDefaults]
input_format: true
output_format: false
alias: []
---

import RowBinaryFormatSettings from './_snippets/common-row-binary-format-settings.md'

| 入力  | 出力  | エイリアス |
|-------|--------|-------|
| ✔     | ✗      |       |

## 説明 {#description}

[`RowBinary`](./RowBinary.md)フォーマットに似ていますが、各カラムの前にデフォルト値を使用するかどうかを示す追加のバイトがあります。

## 使用例 {#example-usage}

例:

```sql title="クエリ"
SELECT * FROM FORMAT('RowBinaryWithDefaults', 'x UInt32 default 42, y UInt32', x'010001000000')
```
```response title="レスポンス"
┌──x─┬─y─┐
│ 42 │ 1 │
└────┴───┘
```

- カラム `x` には、デフォルト値を使用することを示すバイト `01` のみがあり、このバイト以降には他のデータは提供されていません。
- カラム `y` のデータはバイト `00` から始まり、これはカラムに実際の値があり、その後のデータ `01000000` から読み取るべきことを示します。

## フォーマット設定 {#format-settings}

<RowBinaryFormatSettings/>
