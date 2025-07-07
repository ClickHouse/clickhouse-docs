---
'alias': []
'description': 'CustomSeparatedWithNamesAndTypesフォーマットのドキュメント'
'input_format': true
'keywords':
- 'CustomSeparatedWithNamesAndTypes'
'output_format': true
'slug': '/interfaces/formats/CustomSeparatedWithNamesAndTypes'
'title': 'CustomSeparatedWithNamesAndTypes'
---



| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## Description {#description}

また、[TabSeparatedWithNamesAndTypes](../TabSeparated/TabSeparatedWithNamesAndTypes.md)と同様に、カラム名とタイプのヘッダー行を2つ印刷します。

## Example Usage {#example-usage}

## Format Settings {#format-settings}

:::note
設定 [`input_format_with_names_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_names_use_header) が `1` に設定されている場合、入力データのカラムは名前によってテーブルのカラムにマッピングされ、未知の名前のカラムは設定 [`input_format_skip_unknown_fields`](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields) が `1` に設定されている場合にスキップされます。それ以外の場合、最初の行はスキップされます。
:::

:::note
設定 [`input_format_with_types_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_types_use_header) が `1` に設定されている場合、入力データのタイプはテーブルの対応するカラムのタイプと比較されます。それ以外の場合、2行目はスキップされます。
:::
