---
title: '带名称和类型的制表符分隔原始格式'
slug: '/interfaces/formats/TabSeparatedRawWithNamesAndTypes'
keywords: ['带名称和类型的制表符分隔原始格式', '带名称和类型的TSV原始格式', '带名称和类型的原始格式']
input_format: true
output_format: true
alias: ['TSVRawWithNamesAndTypes', 'RawWithNamesAndTypes']
---

| 输入 | 输出 | 别名                                             |
|-------|--------|---------------------------------------------------|
| ✔     | ✔      | `TSVRawWithNamesAndNames`, `RawWithNamesAndNames` |

## 描述 {#description}

与 [`TabSeparatedWithNamesAndTypes`](./TabSeparatedWithNamesAndTypes.md) 格式不同的是，行的写入不需要转义。

:::note
使用此格式解析时，每个字段中不允许包含制表符或换行符。
:::

## 示例用法 {#example-usage}

## 格式设置 {#format-settings}
