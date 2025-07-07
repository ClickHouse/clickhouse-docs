---
'alias': []
'description': 'RowBinaryWithDefaults フォーマットのドキュメント'
'input_format': true
'keywords':
- 'RowBinaryWithDefaults'
'output_format': false
'slug': '/interfaces/formats/RowBinaryWithDefaults'
'title': 'RowBinaryWithDefaults'
---

import RowBinaryFormatSettings from './_snippets/common-row-binary-format-settings.md'

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✗      |       |

## 説明 {#description}

[`RowBinary`](./RowBinary.md) フォーマットに似ていますが、各カラムの前にデフォルト値を使用する必要があるかどうかを示す追加のバイトがあります。

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

- カラム `x` には、デフォルト値を使用する必要があることを示すバイト `01` が1つだけあります。このバイトの後には他のデータは提供されていません。
- カラム `y` のデータは、カラムに実際の値があることを示すバイト `00` から始まり、後続のデータ `01000000` から読み取る必要があります。

## フォーマット設定 {#format-settings}

<RowBinaryFormatSettings/>
