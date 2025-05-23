---
'alias': []
'description': 'RowBinaryWithNamesAndTypes フォーマットのドキュメント'
'input_format': true
'keywords':
- 'RowBinaryWithNamesAndTypes'
'output_format': true
'slug': '/interfaces/formats/RowBinaryWithNamesAndTypes'
'title': 'RowBinaryWithNamesAndTypes'
---

import RowBinaryFormatSettings from './_snippets/common-row-binary-format-settings.md'

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

[RowBinary](./RowBinary.md) 形式に似ていますが、ヘッダーが追加されています:

- [`LEB128`](https://en.wikipedia.org/wiki/LEB128)エンコードされたカラムの数 (N)。
- N個の`String`でカラム名を指定。
- N個の`String`でカラムタイプを指定。

## 使用例 {#example-usage}

## フォーマット設定 {#format-settings}

<RowBinaryFormatSettings/>

:::note
設定 [`input_format_with_names_use_header`](/operations/settings/settings-formats.md/#input_format_with_names_use_header) が1に設定されている場合、
入力データのカラムは、名前によってテーブルのカラムにマッピングされ、未知の名前のカラムは、設定 [input_format_skip_unknown_fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) が1に設定されている場合はスキップされます。
そうでない場合、最初の行はスキップされます。
設定 [`input_format_with_types_use_header`](/operations/settings/settings-formats.md/#input_format_with_types_use_header) が`1`に設定されている場合、
入力データのタイプは、テーブルの対応するカラムのタイプと比較されます。そうでない場合、2行目はスキップされます。
:::
