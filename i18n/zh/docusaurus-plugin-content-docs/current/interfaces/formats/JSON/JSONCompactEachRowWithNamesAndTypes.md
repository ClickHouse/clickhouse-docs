---
alias: []
description: 'JSONCompactEachRowWithNamesAndTypes 格式文档'
input_format: true
keywords: ['JSONCompactEachRowWithNamesAndTypes']
output_format: true
slug: /interfaces/formats/JSONCompactEachRowWithNamesAndTypes
title: 'JSONCompactEachRowWithNamesAndTypes'
doc_type: 'reference'
---

| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✔     | ✔      |       |



## 描述 {#description}

与 [`JSONCompactEachRow`](./JSONCompactEachRow.md) 格式不同,该格式会额外输出两个标题行,分别包含列名和类型信息,类似于 [TabSeparatedWithNamesAndTypes](../TabSeparated/TabSeparatedWithNamesAndTypes.md) 格式。


## 使用示例 {#example-usage}

### 插入数据 {#inserting-data}

使用以下 JSON 文件,文件名为 `football.json`:

```json
["date", "season", "home_team", "away_team", "home_team_goals", "away_team_goals"]
["Date", "Int16", "LowCardinality(String)", "LowCardinality(String)", "Int8", "Int8"]
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

插入数据:

```sql
INSERT INTO football FROM INFILE 'football.json' FORMAT JSONCompactEachRowWithNamesAndTypes;
```

### 读取数据 {#reading-data}

使用 `JSONCompactEachRowWithNamesAndTypes` 格式读取数据:

```sql
SELECT *
FROM football
FORMAT JSONCompactEachRowWithNamesAndTypes
```

输出为 JSON 格式:


```json
["日期", "赛季", "主队", "客队", "主队进球", "客队进球"]
["日期", "Int16", "LowCardinality(String)", "LowCardinality(String)", "Int8", "Int8"]
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

:::note
如果将设置 [`input_format_with_names_use_header`](/operations/settings/settings-formats.md/#input_format_with_names_use_header) 设为 `1`,
输入数据中的列将按名称映射到表中的列,若设置 [input_format_skip_unknown_fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 为 1,则会跳过名称未知的列。
否则,将跳过第一行。
如果将设置 [`input_format_with_types_use_header`](/operations/settings/settings-formats.md/#input_format_with_types_use_header) 设为 `1`,
输入数据中的类型将与表中相应列的类型进行比较。否则,将跳过第二行。
:::
