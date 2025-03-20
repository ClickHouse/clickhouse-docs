---
title: JSONColumns
slug: /interfaces/formats/JSONColumns
keywords: ['JSONColumns']
input_format: true
output_format: true
alias: []
---

| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✔     | ✔      |       |

## 描述 {#description}

:::tip
JSONColumns* 格式的输出提供了 ClickHouse 字段名称，然后是该字段的每一行的内容；在视觉上，数据向左旋转 90 度。
:::

在这种格式中，所有数据都表示为一个单一的 JSON 对象。

:::note
`JSONColumns` 格式会将所有数据缓存在内存中，然后作为一个单独的块输出，因此可能导致高内存消耗。
:::

## 示例用法 {#example-usage}

示例：

```json
{
	"num": [42, 43, 44],
	"str": ["hello", "hello", "hello"],
	"arr": [[0,1], [0,1,2], [0,1,2,3]]
}
```

## 格式设置 {#format-settings}

在导入过程中，如果设置 [`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 为 `1`，则会跳过未知名称的列。不存在于块中的列将使用默认值填充（您可以在此使用 [`input_format_defaults_for_omitted_fields`](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields) 设置）。
