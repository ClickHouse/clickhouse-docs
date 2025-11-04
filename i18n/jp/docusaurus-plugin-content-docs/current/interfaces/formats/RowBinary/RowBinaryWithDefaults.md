---
'alias': []
'description': 'RowBinaryWithDefaults フォーマットに関するドキュメント'
'input_format': true
'keywords':
- 'RowBinaryWithDefaults'
'output_format': false
'slug': '/interfaces/formats/RowBinaryWithDefaults'
'title': 'RowBinaryWithDefaults'
'doc_type': 'reference'
---

import RowBinaryFormatSettings from './_snippets/common-row-binary-format-settings.md'

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✗      |       |

## 説明 {#description}

[`RowBinary`](./RowBinary.md) 形式に似ていますが、各カラムの前にデフォルト値を使用すべきかどうかを示すバイトが追加されています。

## 使用例 {#example-usage}

例:

```sql title="Query"
SELECT * FROM FORMAT('RowBinaryWithDefaults', 'x UInt32 default 42, y UInt32', x'010001000000')
```
```response title="Response"
┌──x─┬─y─┐
│ 42 │ 1 │
└────┴───┘
```

- カラム `x` には、デフォルト値を使用するべきことを示すバイト `01` だけがあり、このバイトの後に他のデータは提供されません。
- カラム `y` のデータは、実際の値が続くデータ `01000000` から読み取るべきことを示すバイト `00` ではじまります。

## 形式設定 {#format-settings}

<RowBinaryFormatSettings/>
