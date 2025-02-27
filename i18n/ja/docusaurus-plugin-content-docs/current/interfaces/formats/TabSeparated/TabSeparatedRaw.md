---
title : TabSeparatedRaw
slug: /interfaces/formats/TabSeparatedRaw
keywords : [TabSeparatedRaw]
input_format: true
output_format: true
alias: ['TSVRaw', 'Raw']
---

| 入力  | 出力  | エイリアス        |
|-------|--------|-----------------|
| ✔     | ✔      | `TSVRaw`, `Raw` |

## 説明 {#description}

[`TabSeparated`](/interfaces/formats/TabSeparated) フォーマットとは異なり、行がエスケープなしで書き込まれます。

:::note
このフォーマットで解析する際には、各フィールドにタブや改行が含まれることは許可されていません。
:::

`TabSeparatedRaw` フォーマットと `RawBlob` フォーマットの比較については、[Raw Formats Comparison](../RawBLOB.md/#raw-formats-comparison)を参照してください。

## 使用例 {#example-usage}

## フォーマット設定 {#format-settings}
