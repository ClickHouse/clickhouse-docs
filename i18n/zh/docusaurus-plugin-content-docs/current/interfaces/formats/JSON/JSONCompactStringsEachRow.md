---
title: 'JSONCompactStringsEachRow'
slug: '/interfaces/formats/JSONCompactStringsEachRow'
keywords: ['JSONCompactStringsEachRow']
input_format: true
output_format: true
alias: []
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## Description {#description}

与 [`JSONCompactEachRow`](./JSONCompactEachRow.md) 的区别在于数据字段以字符串形式输出，而不是以类型化的 JSON 值输出。

## Example Usage {#example-usage}

示例：

```json
["42", "hello", "[0,1]"]
["43", "hello", "[0,1,2]"]
["44", "hello", "[0,1,2,3]"]
```

## Format Settings {#format-settings}
