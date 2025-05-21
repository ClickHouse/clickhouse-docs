---
description: 'JSONCompactStringsEachRowWithNamesAndTypesフォーマットのドキュメント'
keywords: ['JSONCompactStringsEachRowWithNamesAndTypes']
slug: /interfaces/formats/JSONCompactStringsEachRowWithNamesAndTypes
title: 'JSONCompactStringsEachRowWithNamesAndTypes'
---

## 説明 {#description}

`JSONCompactEachRow`フォーマットとは異なり、カラム名とカラムタイプの2つのヘッダー行も印刷され、[TabSeparatedWithNamesAndTypes](/interfaces/formats/TabSeparatedRawWithNamesAndTypes)に似ています。

## 使用例 {#example-usage}

## フォーマット設定 {#format-settings}

:::note
設定 [input_format_with_names_use_header](/operations/settings/settings-formats.md/#input_format_with_names_use_header) が1に設定されている場合、
入力データのカラムはその名前によってテーブルのカラムにマッピングされ、未知の名前のカラムは設定 [input_format_skip_unknown_fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) が1に設定されている場合はスキップされます。
そうでなければ、最初の行はスキップされます。
:::

:::note
設定 [input_format_with_types_use_header](/operations/settings/settings-formats.md/#input_format_with_types_use_header) が1に設定されている場合、
入力データのタイプはテーブルの対応するカラムのタイプと比較されます。そうでなければ、2行目はスキップされます。
:::
