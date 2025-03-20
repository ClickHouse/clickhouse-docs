---
title: 'JSONStringsEachRow'
slug: '/interfaces/formats/JSONStringsEachRow'
keywords: ['JSONStringsEachRow']
input_format: false
output_format: true
alias: []
---

| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✗     | ✔      |       |

## 描述 {#description}

与 [`JSONEachRow`](./JSONEachRow.md) 的区别在于数据字段以字符串输出，而不是以类型化的 JSON 值输出。

## 示例用法 {#example-usage}

```json
{"num":"42","str":"hello","arr":"[0,1]"}
{"num":"43","str":"hello","arr":"[0,1,2]"}
{"num":"44","str":"hello","arr":"[0,1,2,3]"}
```

## 格式设置 {#format-settings}
