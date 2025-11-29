---
alias: []
description: 'JSONCompactEachRowWithProgress 格式文档'
input_format: false
keywords: ['JSONCompactEachRowWithProgress']
output_format: true
slug: /interfaces/formats/JSONCompactEachRowWithProgress
title: 'JSONCompactEachRowWithProgress'
doc_type: 'reference'
---

| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✗     | ✔      |       |

## 描述 {#description}

此格式将 `JSONCompactEachRow` 的紧凑按行输出与流式进度信息结合在一起。
它将元数据、单独的行、进度更新、汇总以及异常分别作为独立的 JSON 对象输出。各个值以其原生类型进行表示。

主要特性：

- 首先输出包含列名和列类型的元数据
- 每一行都是一个独立的 JSON 对象，使用 `"row"` 键包含一个值数组
- 在查询执行期间包含进度更新（作为 `{"progress":...}` 对象）
- 支持 totals（汇总）和 extremes（极值）
- 保留值的原生类型（数字为数字，字符串为字符串）

## 使用示例 {#example-usage}

```sql title="Query"
SELECT *
FROM generateRandom('a Array(Int8), d Decimal32(4), c Tuple(DateTime64(3), UUID)', 1, 10, 2)
LIMIT 5
FORMAT JSONCompactEachRowWithProgress
```

```response title="Response"
{"meta":[{"name":"a","type":"Array(Int8)"},{"name":"d","type":"Decimal(9, 4)"},{"name":"c","type":"Tuple(DateTime64(3), UUID)"}]}
{"row":[[-8], 46848.5225, ["2064-06-11 14:00:36.578","b06f4fa1-22ff-f84f-a1b7-a5807d983ae6"]]}
{"row":[[-76], -85331.598, ["2038-06-16 04:10:27.271","2bb0de60-3a2c-ffc0-d7a7-a5c88ed8177c"]]}
{"row":[[-32], -31470.8994, ["2027-07-18 16:58:34.654","1cdbae4c-ceb2-1337-b954-b175f5efbef8"]]}
{"row":[[-116], 32104.097, ["1979-04-27 21:51:53.321","66903704-3c83-8f8a-648a-da4ac1ffa9fc"]]}
{"row":[[], 2427.6614, ["1980-04-24 11:30:35.487","fee19be8-0f46-149b-ed98-43e7455ce2b2"]]}
{"progress":{"read_rows":"5","read_bytes":"184","total_rows_to_read":"5","elapsed_ns":"335771"}}
{"rows_before_limit_at_least":5}
```


## 格式设置 {#format-settings}