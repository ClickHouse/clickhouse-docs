---
alias: []
description: 'カスタム区切り形式のドキュメント'
input_format: true
keywords: ['CustomSeparatedWithNamesAndTypes']
output_format: true
slug: /interfaces/formats/CustomSeparatedWithNamesAndTypes
title: 'CustomSeparatedWithNamesAndTypes'
---

| 入力 | 出力 | エイリアス |
|------|------|-----------|
| ✔    | ✔    |           |

## 説明 {#description}

[TabSeparatedWithNamesAndTypes](../TabSeparated/TabSeparatedWithNamesAndTypes.md) に似たカラム名と型の2つのヘッダー行も印刷します。

## 使用例 {#example-usage}

## 形式設定 {#format-settings}

:::note
設定 [`input_format_with_names_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_names_use_header) が `1` に設定されている場合、入力データのカラムはその名前に基づいてテーブルのカラムにマッピングされ、未知の名前のカラムは設定 [`input_format_skip_unknown_fields`](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields) が `1` に設定されている場合にスキップされます。そうでなければ、最初の行はスキップされます。
:::

:::note
設定 [`input_format_with_types_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_types_use_header) が `1` に設定されている場合、入力データの型はテーブルの対応するカラムの型と比較されます。そうでなければ、2行目はスキップされます。
:::
