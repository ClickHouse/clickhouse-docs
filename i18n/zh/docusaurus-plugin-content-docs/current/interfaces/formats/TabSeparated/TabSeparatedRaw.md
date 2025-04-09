---
title: TabSeparatedRaw
slug: /interfaces/formats/TabSeparatedRaw
keywords: ['TabSeparatedRaw']
input_format: true
output_format: true
alias: ['TSVRaw', 'Raw']
---

| Input | Output | Alias           |
|-------|--------|-----------------|
| ✔     | ✔      | `TSVRaw`, `Raw` |

## 描述 {#description}

与 [`TabSeparated`](/interfaces/formats/TabSeparated) 格式不同的是，行在写入时不进行转义。

:::note
使用此格式进行解析时，每个字段中不允许出现制表符或换行符。
:::

有关 `TabSeparatedRaw` 格式和 `RawBlob` 格式的比较，请参见：[原始格式比较](../RawBLOB.md/#raw-formats-comparison)

## 示例用法 {#example-usage}

## 格式设置 {#format-settings}
