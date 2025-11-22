---
alias: []
description: 'JSONCompactColumns 格式文档'
input_format: true
keywords: ['JSONCompactColumns']
output_format: true
slug: /interfaces/formats/JSONCompactColumns
title: 'JSONCompactColumns'
doc_type: 'reference'
---

| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✔     | ✔      |       |



## 描述 {#description}

在此格式中,所有数据表示为单个 JSON 数组。

:::note
`JSONCompactColumns` 输出格式会将所有数据缓冲到内存中以单个块的形式输出,这可能导致较高的内存消耗。
:::


## 使用示例 {#example-usage}

### 插入数据 {#inserting-data}

使用以下 JSON 文件,文件名为 `football.json`:

```json
[
  [
    "2022-04-30",
    "2022-04-30",
    "2022-04-30",
    "2022-05-02",
    "2022-05-02",
    "2022-05-07",
    "2022-05-07",
    "2022-05-07",
    "2022-05-07",
    "2022-05-07",
    "2022-05-07",
    "2022-05-07",
    "2022-05-07",
    "2022-05-07",
    "2022-05-07",
    "2022-05-07",
    "2022-05-07"
  ],
  [
    2021, 2021, 2021, 2021, 2021, 2021, 2021, 2021, 2021, 2021, 2021, 2021,
    2021, 2021, 2021, 2021, 2021
  ],
  [
    "Sutton United",
    "Swindon Town",
    "Tranmere Rovers",
    "Port Vale",
    "Salford City",
    "Barrow",
    "Bradford City",
    "Bristol Rovers",
    "Exeter City",
    "Harrogate Town A.F.C.",
    "Hartlepool United",
    "Leyton Orient",
    "Mansfield Town",
    "Newport County",
    "Oldham Athletic",
    "Stevenage Borough",
    "Walsall"
  ],
  [
    "Bradford City",
    "Barrow",
    "Oldham Athletic",
    "Newport County",
    "Mansfield Town",
    "Northampton Town",
    "Carlisle United",
    "Scunthorpe United",
    "Port Vale",
    "Sutton United",
    "Colchester United",
    "Tranmere Rovers",
    "Forest Green Rovers",
    "Rochdale",
    "Crawley Town",
    "Salford City",
    "Swindon Town"
  ],
  [1, 2, 2, 1, 2, 1, 2, 7, 0, 0, 0, 0, 2, 0, 3, 4, 0],
  [4, 1, 0, 2, 2, 3, 0, 0, 1, 2, 2, 1, 2, 2, 3, 2, 3]
]
```

插入数据:

```sql
INSERT INTO football FROM INFILE 'football.json' FORMAT JSONCompactColumns;
```

### 读取数据 {#reading-data}

使用 `JSONCompactColumns` 格式读取数据:

```sql
SELECT *
FROM football
FORMAT JSONCompactColumns
```

输出为 JSON 格式:


```json
[
    ["2022-04-30", "2022-04-30", "2022-04-30", "2022-05-02", "2022-05-02", "2022-05-07", "2022-05-07", "2022-05-07", "2022-05-07", "2022-05-07", "2022-05-07", "2022-05-07", "2022-05-07", "2022-05-07", "2022-05-07", "2022-05-07", "2022-05-07"],
    [2021, 2021, 2021, 2021, 2021, 2021, 2021, 2021, 2021, 2021, 2021, 2021, 2021, 2021, 2021, 2021, 2021],
    ["Sutton United", "Swindon Town", "Tranmere Rovers", "Port Vale", "Salford City", "Barrow", "Bradford City", "Bristol Rovers", "Exeter City", "Harrogate Town A.F.C.", "Hartlepool United", "Leyton Orient", "Mansfield Town", "Newport County", "Oldham Athletic", "Stevenage Borough", "Walsall"],
    ["Bradford City", "Barrow", "Oldham Athletic", "Newport County", "Mansfield Town", "Northampton Town", "Carlisle United", "Scunthorpe United", "Port Vale", "Sutton United", "Colchester United", "Tranmere Rovers", "Forest Green Rovers", "Rochdale", "Crawley Town", "Salford City", "Swindon Town"],
    [1, 2, 2, 1, 2, 1, 2, 7, 0, 0, 0, 0, 2, 0, 3, 4, 0],
    [4, 1, 0, 2, 2, 3, 0, 0, 1, 2, 2, 1, 2, 2, 3, 2, 3]
]
```

在数据块中不存在的列将会被填充为默认值（此处可以使用 [`input_format_defaults_for_omitted_fields`](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields) 设置）


## 格式设置 {#format-settings}
