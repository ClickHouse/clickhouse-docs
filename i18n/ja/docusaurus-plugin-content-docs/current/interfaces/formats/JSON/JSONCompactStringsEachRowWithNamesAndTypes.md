---
title : JSONCompactStringsEachRowWithNamesAndTypes
slug: /interfaces/formats/JSONCompactStringsEachRowWithNamesAndTypes
keywords : [JSONCompactStringsEachRowWithNamesAndTypes]
---

## 説明 {#description}

`JSONCompactEachRow` 形式と異なり、列名と型の2つのヘッダー行も出力され、[TabSeparatedWithNamesAndTypes](/interfaces/formats/TabSeparatedRawWithNamesAndTypes) に似ています。

## 使用例 {#example-usage}

## フォーマット設定 {#format-settings}

:::note
設定 [input_format_with_names_use_header](/operations/settings/settings-formats.md/#input_format_with_names_use_header) が 1 に設定されている場合、
入力データのカラムは、その名前によってテーブルのカラムにマッピングされます。未知の名前のカラムは、設定 [input_format_skip_unknown_fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) が 1 に設定されている場合、スキップされます。
そうでない場合、最初の行はスキップされます。
:::

:::note
設定 [input_format_with_types_use_header](/operations/settings/settings-formats.md/#input_format_with_types_use_header) が 1 に設定されている場合、
入力データの型は、テーブルの対応するカラムの型と比較されます。そうでない場合、2行目はスキップされます。
:::
