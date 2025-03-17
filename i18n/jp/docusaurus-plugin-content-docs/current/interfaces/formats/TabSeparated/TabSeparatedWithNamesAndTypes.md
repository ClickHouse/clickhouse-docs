---
title: TabSeparatedWithNamesAndTypes
slug: /interfaces/formats/TabSeparatedWithNamesAndTypes
keywords: [TabSeparatedWithNamesAndTypes]
---

| 入力 | 出力 | エイリアス                                          |
|-------|--------|------------------------------------------------|
| 	✔    | 	✔     | `TSVWithNamesAndTypes`, `RawWithNamesAndTypes` |

## 説明 {#description}

[`TabSeparated`](./TabSeparated.md) 形式と異なり、カラム名が最初の行に書かれ、カラムタイプが二番目の行に書かれます。

:::note
- 設定 [`input_format_with_names_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_names_use_header) が `1` に設定されている場合、入力データのカラムはその名前に基づいてテーブルのカラムにマッピングされます。未知の名前のカラムは、設定 [`input_format_skip_unknown_fields`](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields) が `1` に設定されている場合にはスキップされます。そうでない場合、最初の行はスキップされます。
- 設定 [`input_format_with_types_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_types_use_header) が `1` に設定されている場合、入力データのタイプはテーブルの対応するカラムのタイプと比較されます。そうでなければ、二番目の行はスキップされます。
:::

## 使用例 {#example-usage}

## フォーマット設定 {#format-settings}
