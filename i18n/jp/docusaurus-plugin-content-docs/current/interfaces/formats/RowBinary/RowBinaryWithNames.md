---
'description': 'RowBinaryWithNames形式のドキュメント'
'input_format': true
'keywords':
- 'RowBinaryWithNames'
'output_format': true
'slug': '/interfaces/formats/RowBinaryWithNames'
'title': 'RowBinaryWithNames'
---

import RowBinaryFormatSettings from './_snippets/common-row-binary-format-settings.md'

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

[`RowBinary`](./RowBinary.md) フォーマットに似ていますが、ヘッダーが追加されています：

- [`LEB128`](https://en.wikipedia.org/wiki/LEB128) エンコードされたカラム数 (N)。
- N の `String` がカラム名を指定します。

## 使用例 {#example-usage}

## フォーマット設定 {#format-settings}

<RowBinaryFormatSettings/>

:::note
- 設定 [`input_format_with_names_use_header`](/operations/settings/settings-formats.md/#input_format_with_names_use_header) が `1` に設定されている場合、インプットデータのカラムはその名前によってテーブルのカラムにマッピングされ、名前が不明なカラムはスキップされます。
- 設定 [`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) が `1` に設定されている場合、そうでない場合は最初の行がスキップされます。
:::
