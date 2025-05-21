---
alias: []
description: '行バイナリデフォルト形式のドキュメント'
input_format: true
keywords: ['RowBinaryWithDefaults']
output_format: false
slug: /interfaces/formats/RowBinaryWithDefaults
title: '行バイナリデフォルト'
---

import RowBinaryFormatSettings from './_snippets/common-row-binary-format-settings.md'

| 入力 | 出力 | エイリアス |
|------|------|-----------|
| ✔    | ✗    |           |

## 説明 {#description}

[`RowBinary`](./RowBinary.md) 形式に類似していますが、各カラムの前にデフォルト値が使用されるべきかどうかを示すバイトが追加されています。

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

- カラム `x` には、デフォルト値が使用されることを示すバイト `01` だけがあり、このバイトの後に他のデータは提供されていません。
- カラム `y` のデータは、カラムに実際の値が含まれていることを示すバイト `00` から始まり、次のデータ `01000000` から読み取られます。

## フォーマット設定 {#format-settings}

<RowBinaryFormatSettings/>
