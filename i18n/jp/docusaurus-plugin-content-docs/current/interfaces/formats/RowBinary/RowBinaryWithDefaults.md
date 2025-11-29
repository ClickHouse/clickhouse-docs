---
alias: []
description: 'RowBinaryWithDefaults フォーマットに関するドキュメント'
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

[`RowBinary`](./RowBinary.md) 形式と似ていますが、各列の前に 1 バイトが追加され、そのバイトでデフォルト値を使用するかどうかを示します。



## 使用例 {#example-usage}

例：

```sql title="Query"
SELECT * FROM FORMAT('RowBinaryWithDefaults', 'x UInt32 default 42, y UInt32', x'010001000000')
```

```response title="Response"
┌──x─┬─y─┐
│ 42 │ 1 │
└────┴───┘
```

* 列 `x` には、デフォルト値を使用すべきことを示す 1 バイトの `01` だけがあり、このバイト以降には一切データがありません。
* 列 `y` では、データはバイト `00` から始まっており、これは列に実際の値が存在し、その値を後続のデータ `01000000` から読み取る必要があることを示します。


## フォーマット設定 {#format-settings}

<RowBinaryFormatSettings/>
