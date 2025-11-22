---
alias: []
description: 'JSONCompactStringsEachRowWithProgress 格式文档'
input_format: true
keywords: ['JSONCompactStringsEachRowWithProgress']
output_format: true
slug: /interfaces/formats/JSONCompactStringsEachRowWithProgress
title: 'JSONCompactStringsEachRowWithProgress'
doc_type: 'reference'
---

| 输入 | 输出  | 别名  |
|-------|---------|--------|
| ✗     | ✔       |        |



## Description {#description}

类似于 [`JSONCompactEachRowWithProgress`](/interfaces/formats/JSONCompactEachRowWithProgress),但所有值都转换为字符串。
当需要所有数据类型具有一致的字符串表示形式时,此格式非常有用。

主要特性:

- 与 `JSONCompactEachRowWithProgress` 结构相同
- 所有值均以字符串形式表示(数字、数组等都是带引号的字符串)
- 包含进度更新、总计和异常处理
- 适用于偏好或要求使用基于字符串的数据的客户端


## 使用示例 {#example-usage}

### 插入数据 {#inserting-data}

```sql title="查询"
SELECT *
FROM generateRandom('a Array(Int8), d Decimal32(4), c Tuple(DateTime64(3), UUID)', 1, 10, 2)
LIMIT 5
FORMAT JSONCompactStringsEachRowWithProgress
```

```response title="响应"
{"meta":[{"name":"a","type":"Array(Int8)"},{"name":"d","type":"Decimal(9, 4)"},{"name":"c","type":"Tuple(DateTime64(3), UUID)"}]}
{"row":["[-8]", "46848.5225", "('2064-06-11 14:00:36.578','b06f4fa1-22ff-f84f-a1b7-a5807d983ae6')"]}
{"row":["[-76]", "-85331.598", "('2038-06-16 04:10:27.271','2bb0de60-3a2c-ffc0-d7a7-a5c88ed8177c')"]}
{"row":["[-32]", "-31470.8994", "('2027-07-18 16:58:34.654','1cdbae4c-ceb2-1337-b954-b175f5efbef8')"]}
{"row":["[-116]", "32104.097", "('1979-04-27 21:51:53.321','66903704-3c83-8f8a-648a-da4ac1ffa9fc')"]}
{"row":["[]", "2427.6614", "('1980-04-24 11:30:35.487','fee19be8-0f46-149b-ed98-43e7455ce2b2')"]}
{"progress":{"read_rows":"5","read_bytes":"184","total_rows_to_read":"5","elapsed_ns":"191151"}}
{"rows_before_limit_at_least":5}
```


## 格式设置 {#format-settings}
