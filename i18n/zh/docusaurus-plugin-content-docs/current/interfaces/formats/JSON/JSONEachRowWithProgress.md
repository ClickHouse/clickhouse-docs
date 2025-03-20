---
title: 'JSONEachRowWithProgress'
slug: '/interfaces/formats/JSONEachRowWithProgress'
keywords: ['JSONEachRowWithProgress']
input_format: false
output_format: true
alias: []
---

| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✗     | ✔      |       |

## 描述 {#description}

与 [`JSONEachRow`](./JSONEachRow.md)/[`JSONStringsEachRow`](./JSONStringsEachRow.md) 的不同之处在于，ClickHouse 还会将进度信息作为 JSON 值输出。

## 示例用法 {#example-usage}

```json
{"row":{"num":42,"str":"hello","arr":[0,1]}}
{"row":{"num":43,"str":"hello","arr":[0,1,2]}}
{"row":{"num":44,"str":"hello","arr":[0,1,2,3]}}
{"progress":{"read_rows":"3","read_bytes":"24","written_rows":"0","written_bytes":"0","total_rows_to_read":"3"}}
```

## 格式设置 {#format-settings}
