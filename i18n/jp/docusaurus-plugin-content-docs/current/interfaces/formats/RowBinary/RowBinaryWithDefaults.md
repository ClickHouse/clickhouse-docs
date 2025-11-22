---
alias: []
description: 'RowBinaryWithDefaults 形式に関するドキュメント'
input_format: true
keywords: ['RowBinaryWithDefaults']
output_format: false
slug: /interfaces/formats/RowBinaryWithDefaults
title: 'RowBinaryWithDefaults'
doc_type: 'reference'
---

import RowBinaryFormatSettings from './_snippets/common-row-binary-format-settings.md'

| 入力 | 出力 | エイリアス |
| -- | -- | ----- |
| ✔  | ✗  |       |


## 説明 {#description}

[`RowBinary`](./RowBinary.md)形式と同様ですが、各カラムの前にデフォルト値を使用するかどうかを示す追加のバイトが付加されます。


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

- カラム `x` には、デフォルト値を使用することを示す1バイト `01` のみが存在し、このバイトの後に他のデータは提供されていません。
- カラム `y` のデータは、カラムに実際の値が存在し、後続のデータ `01000000` から読み取る必要があることを示すバイト `00` で始まります。


## フォーマット設定 {#format-settings}

<RowBinaryFormatSettings />
