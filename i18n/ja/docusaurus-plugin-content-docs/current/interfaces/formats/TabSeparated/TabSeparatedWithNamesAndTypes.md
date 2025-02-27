---
title : TabSeparatedWithNamesAndTypes
slug: /interfaces/formats/TabSeparatedWithNamesAndTypes
keywords : [TabSeparatedWithNamesAndTypes]
---

| 入力 | 出力 | エイリアス                                    |
|-------|--------|------------------------------------------------|
| 	✔    | 	✔     | `TSVWithNamesAndTypes`, `RawWithNamesAndTypes` |

## 説明 {#description}

[`TabSeparated`](./TabSeparated.md) フォーマットとは異なり、カラム名が最初の行に書かれ、カラムタイプが2行目にあります。

:::note
- [`input_format_with_names_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_names_use_header) が `1` に設定されている場合、入力データのカラムはその名前によってテーブルのカラムにマッピングされ、未知の名前のカラムは、[`input_format_skip_unknown_fields`](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields) が `1` に設定されている場合はスキップされます。そうでない場合は、最初の行がスキップされます。
- [`input_format_with_types_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_types_use_header) が `1` に設定されている場合、入力データのタイプはテーブルの対応するカラムのタイプと比較されます。そうでない場合は、2行目がスキップされます。
:::

## 使用例 {#example-usage}

## フォーマット設定 {#format-settings}
