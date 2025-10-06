---
'alias': []
'description': 'RowBinaryWithNamesAndTypes 形式に関するドキュメント'
'input_format': true
'keywords':
- 'RowBinaryWithNamesAndTypes'
'output_format': true
'slug': '/interfaces/formats/RowBinaryWithNamesAndTypes'
'title': 'RowBinaryWithNamesAndTypes'
'doc_type': 'reference'
---

import RowBinaryFormatSettings from './_snippets/common-row-binary-format-settings.md'

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

[RowBinary](./RowBinary.md) フォーマットに似ていますが、ヘッダーが追加されています：

- [`LEB128`](https://en.wikipedia.org/wiki/LEB128) エンコードされたカラムの数 (N)。
- N の `String` がカラム名を指定します。
- N の `String` がカラムタイプを指定します。

## 例の使用法 {#example-usage}

## フォーマット設定 {#format-settings}

<RowBinaryFormatSettings/>

:::note
設定 [`input_format_with_names_use_header`](/operations/settings/settings-formats.md/#input_format_with_names_use_header) が 1 に設定されている場合、
入力データのカラムはその名前を基にテーブルのカラムにマッピングされ、名前が不明なカラムは設定 [input_format_skip_unknown_fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) が 1 に設定されている場合はスキップされます。
そうでなければ、最初の行はスキップされます。
設定 [`input_format_with_types_use_header`](/operations/settings/settings-formats.md/#input_format_with_types_use_header) が `1` に設定されている場合、
入力データの型はテーブルの対応するカラムの型と比較されます。そうでなければ、2 行目はスキップされます。
:::
