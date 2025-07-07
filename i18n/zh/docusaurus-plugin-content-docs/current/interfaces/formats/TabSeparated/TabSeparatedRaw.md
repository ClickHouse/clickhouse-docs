---
'alias':
- 'TSVRaw'
- 'Raw'
'description': 'TabSeparatedRaw 格式的文档'
'input_format': true
'keywords':
- 'TabSeparatedRaw'
'output_format': true
'slug': '/interfaces/formats/TabSeparatedRaw'
'title': 'TabSeparatedRaw'
---

| 输入  | 输出   | 别名              |
|-------|--------|-------------------|
| ✔     | ✔      | `TSVRaw`, `Raw`   |

## 描述 {#description}

与 [`TabSeparated`](/interfaces/formats/TabSeparated) 格式不同的是，行是以不转义的形式写入的。

:::note
在使用此格式解析时，各个字段中不允许包含制表符或换行符。
:::

有关 `TabSeparatedRaw` 格式和 `RawBlob` 格式的比较，请参见： [原始格式比较](../RawBLOB.md/#raw-formats-comparison)

## 示例用法 {#example-usage}

## 格式设置 {#format-settings}
