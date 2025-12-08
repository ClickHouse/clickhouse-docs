---
alias: []
description: 'JSONCompactEachRow 格式文档'
input_format: true
keywords: ['JSONCompactEachRow']
output_format: true
slug: /interfaces/formats/JSONCompactEachRow
title: 'JSONCompactEachRow'
doc_type: 'reference'
---

| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✔     | ✔      |       |

## 描述 {#description}

与 [`JSONEachRow`](./JSONEachRow.md) 的唯一区别在于，数据行以数组而非对象的形式输出。

## 示例用法 {#example-usage}

### 插入数据 {#inserting-data}

使用包含以下数据的 JSON 文件，并将其命名为 `football.json`：

```json
["2022-04-30", 2021, "Sutton United", "Bradford City", 1, 4]
["2022-04-30", 2021, "Swindon Town", "Barrow", 2, 1]
["2022-04-30", 2021, "Tranmere Rovers", "Oldham Athletic", 2, 0]
["2022-05-02", 2021, "Port Vale", "Newport County", 1, 2]
["2022-05-02", 2021, "Salford City", "Mansfield Town", 2, 2]
["2022-05-07", 2021, "Barrow", "Northampton Town", 1, 3]
["2022-05-07", 2021, "Bradford City", "Carlisle United", 2, 0]
["2022-05-07", 2021, "Bristol Rovers", "Scunthorpe United", 7, 0]
["2022-05-07", 2021, "Exeter City", "Port Vale", 0, 1]
["2022-05-07", 2021, "Harrogate Town A.F.C.", "Sutton United", 0, 2]
["2022-05-07", 2021, "Hartlepool United", "Colchester United", 0, 2]
["2022-05-07", 2021, "Leyton Orient", "Tranmere Rovers", 0, 1]
["2022-05-07", 2021, "Mansfield Town", "Forest Green Rovers", 2, 2]
["2022-05-07", 2021, "Newport County", "Rochdale", 0, 2]
["2022-05-07", 2021, "Oldham Athletic", "Crawley Town", 3, 3]
["2022-05-07", 2021, "Stevenage Borough", "Salford City", 4, 2]
["2022-05-07", 2021, "Walsall", "Swindon Town", 0, 3]
```

插入数据：

```sql
INSERT INTO football FROM INFILE 'football.json' FORMAT JSONCompactEachRow;
```

### 读取数据 {#reading-data}

使用 `JSONCompactEachRow` 格式来读取数据：

```sql
SELECT *
FROM football
FORMAT JSONCompactEachRow
```

输出将为 JSON 格式：

```json
["2022-04-30", 2021, "Sutton United", "Bradford City", 1, 4]
["2022-04-30", 2021, "Swindon Town", "Barrow", 2, 1]
["2022-04-30", 2021, "Tranmere Rovers", "Oldham Athletic", 2, 0]
["2022-05-02", 2021, "Port Vale", "Newport County", 1, 2]
["2022-05-02", 2021, "Salford City", "Mansfield Town", 2, 2]
["2022-05-07", 2021, "Barrow", "Northampton Town", 1, 3]
["2022-05-07", 2021, "Bradford City", "Carlisle United", 2, 0]
["2022-05-07", 2021, "Bristol Rovers", "Scunthorpe United", 7, 0]
["2022-05-07", 2021, "Exeter City", "Port Vale", 0, 1]
["2022-05-07", 2021, "Harrogate Town A.F.C.", "Sutton United", 0, 2]
["2022-05-07", 2021, "Hartlepool United", "Colchester United", 0, 2]
["2022-05-07", 2021, "Leyton Orient", "Tranmere Rovers", 0, 1]
["2022-05-07", 2021, "Mansfield Town", "Forest Green Rovers", 2, 2]
["2022-05-07", 2021, "Newport County", "Rochdale", 0, 2]
["2022-05-07", 2021, "Oldham Athletic", "Crawley Town", 3, 3]
["2022-05-07", 2021, "Stevenage Borough", "Salford City", 4, 2]
["2022-05-07", 2021, "Walsall", "Swindon Town", 0, 3]
```

## 格式设置 {#format-settings}