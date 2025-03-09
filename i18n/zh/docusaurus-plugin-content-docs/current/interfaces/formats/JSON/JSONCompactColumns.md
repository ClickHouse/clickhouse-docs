---
title: 'JSONCompactColumns'
slug: '/interfaces/formats/JSONCompactColumns'
keywords: ['JSONCompactColumns']
input_format: true
output_format: true
alias: []
---

| 输入  | 输出  | 别名  |
|-------|--------|-------|
| ✔     | ✔      |       |

## 描述 {#description}

在此格式中，所有数据以单个 JSON 数组表示。

:::note
`JSONCompactColumns` 输出格式会在内存中缓冲所有数据，以便将其作为单个块输出，这可能导致高内存消耗。
:::

## 示例用法 {#example-usage}

```json
[
	[42, 43, 44],
	["hello", "hello", "hello"],
	[[0,1], [0,1,2], [0,1,2,3]]
]
```

在块中未出现的列将用默认值填充（您可以在此处使用 [`input_format_defaults_for_omitted_fields`](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields) 设置）

## 格式设置 {#format-settings}
