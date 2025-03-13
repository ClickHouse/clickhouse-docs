---
title: CustomSeparatedWithNamesAndTypes
slug: /interfaces/formats/CustomSeparatedWithNamesAndTypes
keywords: [CustomSeparatedWithNamesAndTypes]
input_format: true
output_format: true
alias: []
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## Description {#description}

カラム名とタイプのヘッダー行を2つ印刷します。これは、[TabSeparatedWithNamesAndTypes](../TabSeparated/TabSeparatedWithNamesAndTypes.md)と類似しています。

## Example Usage {#example-usage}

## Format Settings {#format-settings}

:::note
設定 [`input_format_with_names_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_names_use_header) が `1` に設定されている場合、
入力データのカラムは、その名前に基づいてテーブルのカラムにマッピングされ、未知の名前のカラムは設定 [`input_format_skip_unknown_fields`](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields) が `1` に設定されている場合はスキップされます。
そうでない場合、最初の行はスキップされます。
:::

:::note
設定 [`input_format_with_types_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_types_use_header) が `1` に設定されている場合、
入力データのタイプは、テーブルの対応するカラムのタイプと比較されます。そうでない場合、2行目はスキップされます。
:::
