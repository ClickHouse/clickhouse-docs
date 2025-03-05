---
title: RowBinaryWithNames
slug: /interfaces/formats/RowBinaryWithNames
keywords: [RowBinaryWithNames]
input_format: true
output_format: true
---

import RowBinaryFormatSettings from './_snippets/common-row-binary-format-settings.md'

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

[`RowBinary`](./RowBinary.md) 形式に類似していますが、ヘッダーが追加されています：

- [`LEB128`](https://en.wikipedia.org/wiki/LEB128) でエンコードされたカラム数 (N)。
- N の `String` がカラム名を指定します。

## 使用例 {#example-usage}

## 形式設定 {#format-settings}

<RowBinaryFormatSettings/>

:::note
- 設定 [`input_format_with_names_use_header`](/operations/settings/settings-formats.md/#input_format_with_names_use_header) が `1` に設定されている場合、
入力データのカラムはその名前に基づいてテーブルのカラムにマッピングされ、未知の名前を持つカラムはスキップされます。
- 設定 [`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) が `1` に設定されている場合、
それ以外では、最初の行がスキップされます。
:::
