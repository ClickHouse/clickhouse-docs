---
title: RowBinaryWithDefaults
slug: /interfaces/formats/RowBinaryWithDefaults
keywords: [RowBinaryWithDefaults]
input_format: true
output_format: false
alias: []
---

import RowBinaryFormatSettings from './_snippets/common-row-binary-format-settings.md'

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✔     | ✗      |       |

## 説明 {#description}

[`RowBinary`](./RowBinary.md) フォーマットと似ていますが、各カラムの前にデフォルト値を使用すべきかを示す追加のバイトがあります。

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

- カラム `x` にはデフォルト値を使用すべきであり、このバイト以降には他のデータが提供されていないことを示す `01` のみの1バイトがあります。
- カラム `y` では、値が実際に次のデータ `01000000` から読み取られるべきであることを示すバイト `00` から始まります。

## フォーマット設定 {#format-settings}

<RowBinaryFormatSettings/>
