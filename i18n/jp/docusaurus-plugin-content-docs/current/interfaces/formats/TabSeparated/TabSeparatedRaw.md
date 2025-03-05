---
title: TabSeparatedRaw
slug: /interfaces/formats/TabSeparatedRaw
keywords: [TabSeparatedRaw]
input_format: true
output_format: true
alias: ['TSVRaw', 'Raw']
---

| 入力  | 出力  | エイリアス       |
|-------|--------|-----------------|
| ✔     | ✔      | `TSVRaw`, `Raw` |

## 説明 {#description}

[`TabSeparated`](/interfaces/formats/TabSeparated) 形式とは異なり、行がエスケープされずに書き込まれます。

:::note
この形式で解析する際には、各フィールド内にタブや改行を含めることはできません。
:::

`TabSeparatedRaw` 形式と `RawBlob` 形式の比較については、[Raw Formats Comparison](../RawBLOB.md/#raw-formats-comparison)を参照してください。

## 使用例 {#example-usage}

## 形式設定 {#format-settings}
