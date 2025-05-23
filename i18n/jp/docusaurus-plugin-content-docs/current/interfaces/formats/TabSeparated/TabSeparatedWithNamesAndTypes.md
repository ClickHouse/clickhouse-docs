---
'description': 'TabSeparatedWithNamesAndTypes形式のドキュメント'
'keywords':
- 'TabSeparatedWithNamesAndTypes'
'slug': '/interfaces/formats/TabSeparatedWithNamesAndTypes'
'title': 'TabSeparatedWithNamesAndTypes'
---



| Input | Output | Alias                                          |
|-------|--------|------------------------------------------------|
|     ✔    |     ✔     | `TSVWithNamesAndTypes`, `RawWithNamesAndTypes` |

## 説明 {#description}

`TabSeparated`（[`TabSeparated`](./TabSeparated.md)）フォーマットとは異なり、カラム名が最初の行に書かれ、カラムタイプが二行目に記載されます。

:::note
- 設定 [`input_format_with_names_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_names_use_header) が `1` に設定されている場合、
入力データのカラムは名前によってテーブルのカラムにマッピングされます。未知の名前のカラムは、設定 [`input_format_skip_unknown_fields`](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields) が 1 に設定されている場合はスキップされます。
そうでなければ、最初の行はスキップされます。
- 設定 [`input_format_with_types_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_types_use_header) が `1` に設定されている場合、
入力データのタイプはテーブルの対応するカラムのタイプと比較されます。そうでなければ、二行目はスキップされます。
:::

## 使用例 {#example-usage}

## フォーマット設定 {#format-settings}
