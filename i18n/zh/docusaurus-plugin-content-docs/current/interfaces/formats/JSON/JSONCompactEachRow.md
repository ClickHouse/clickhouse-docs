---
title: 'JSONCompactEachRow'
slug: '/interfaces/formats/JSONCompactEachRow'
keywords: ['JSONCompactEachRow']
input_format: true
output_format: true
alias: []
---

| 输入  | 输出  | 别名 |
|-------|--------|-------|
| ✔     | ✔      |       |

## 描述 {#description}

与 [`JSONEachRow`](./JSONEachRow.md) 的区别在于数据行以数组形式输出，而不是对象形式。

## 示例用法 {#example-usage}

示例：

```json
[42, "hello", [0,1]]
[43, "hello", [0,1,2]]
[44, "hello", [0,1,2,3]]
```

## 格式设置 {#format-settings}
