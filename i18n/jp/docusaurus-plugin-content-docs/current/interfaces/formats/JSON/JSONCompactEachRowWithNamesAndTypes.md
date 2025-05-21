---
alias: []
description: 'JSONCompactEachRowWithNamesAndTypes フォーマットのドキュメント'
input_format: true
keywords: ['JSONCompactEachRowWithNamesAndTypes']
output_format: true
slug: /interfaces/formats/JSONCompactEachRowWithNamesAndTypes
title: 'JSONCompactEachRowWithNamesAndTypes'
---

| 入力 | 出力 | エイリアス |
|------|------|-----------|
| ✔    | ✔    |           |

## 説明 {#description}

[`JSONCompactEachRow`](./JSONCompactEachRow.md) フォーマットとは異なり、カラム名とタイプの2つのヘッダ行も出力します。これは [TabSeparatedWithNamesAndTypes](../TabSeparated/TabSeparatedWithNamesAndTypes.md) フォーマットに似ています。

## 使用例 {#example-usage}

## フォーマット設定 {#format-settings}

:::note
設定 [`input_format_with_names_use_header`](/operations/settings/settings-formats.md/#input_format_with_names_use_header) が `1` に設定されている場合、 
入力データのカラムはテーブルのカラムとその名前でマッピングされ、未知の名前のカラムは設定 [input_format_skip_unknown_fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) が `1` に設定されている場合はスキップされます。 
そうでなければ、最初の行はスキップされます。
設定 [`input_format_with_types_use_header`](/operations/settings/settings-formats.md/#input_format_with_types_use_header) が `1` に設定されている場合、 
入力データのタイプはテーブルの対応するカラムのタイプと比較されます。そうでなければ、2行目はスキップされます。
:::
