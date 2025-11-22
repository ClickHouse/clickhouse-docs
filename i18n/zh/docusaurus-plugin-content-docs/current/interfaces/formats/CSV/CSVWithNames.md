---
alias: []
description: 'CSV 格式文档'
input_format: true
keywords: ['CSVWithNames']
output_format: true
slug: /interfaces/formats/CSVWithNames
title: 'CSVWithNames'
doc_type: 'reference'
---

| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✔     | ✔      |       |



## Description {#description}

同时输出包含列名的标题行,类似于 [TabSeparatedWithNames](/interfaces/formats/TabSeparatedWithNames)。


## 使用示例 {#example-usage}

### 插入数据 {#inserting-data}

:::tip
从 [版本](https://github.com/ClickHouse/ClickHouse/releases) 23.1 开始,ClickHouse 在使用 `CSV` 格式时会自动检测 CSV 文件中的标题行,因此不需要使用 `CSVWithNames` 或 `CSVWithNamesAndTypes`。
:::

使用以下名为 `football.csv` 的 CSV 文件:

```csv
date,season,home_team,away_team,home_team_goals,away_team_goals
2022-04-30,2021,Sutton United,Bradford City,1,4
2022-04-30,2021,Swindon Town,Barrow,2,1
2022-04-30,2021,Tranmere Rovers,Oldham Athletic,2,0
2022-05-02,2021,Salford City,Mansfield Town,2,2
2022-05-02,2021,Port Vale,Newport County,1,2
2022-05-07,2021,Barrow,Northampton Town,1,3
2022-05-07,2021,Bradford City,Carlisle United,2,0
2022-05-07,2021,Bristol Rovers,Scunthorpe United,7,0
2022-05-07,2021,Exeter City,Port Vale,0,1
2022-05-07,2021,Harrogate Town A.F.C.,Sutton United,0,2
2022-05-07,2021,Hartlepool United,Colchester United,0,2
2022-05-07,2021,Leyton Orient,Tranmere Rovers,0,1
2022-05-07,2021,Mansfield Town,Forest Green Rovers,2,2
2022-05-07,2021,Newport County,Rochdale,0,2
2022-05-07,2021,Oldham Athletic,Crawley Town,3,3
2022-05-07,2021,Stevenage Borough,Salford City,4,2
2022-05-07,2021,Walsall,Swindon Town,0,3
```

创建表:

```sql
CREATE TABLE football
(
    `date` Date,
    `season` Int16,
    `home_team` LowCardinality(String),
    `away_team` LowCardinality(String),
    `home_team_goals` Int8,
    `away_team_goals` Int8
)
ENGINE = MergeTree
ORDER BY (date, home_team);
```

使用 `CSVWithNames` 格式插入数据:

```sql
INSERT INTO football FROM INFILE 'football.csv' FORMAT CSVWithNames;
```

### 读取数据 {#reading-data}

使用 `CSVWithNames` 格式读取数据:

```sql
SELECT *
FROM football
FORMAT CSVWithNames
```

输出将是带有单个标题行的 CSV:


```csv
"date","season","home_team","away_team","home_team_goals","away_team_goals"
"2022-04-30",2021,"Sutton United","Bradford City",1,4
"2022-04-30",2021,"Swindon Town","Barrow",2,1
"2022-04-30",2021,"Tranmere Rovers","Oldham Athletic",2,0
"2022-05-02",2021,"Port Vale","Newport County",1,2
"2022-05-02",2021,"Salford City","Mansfield Town",2,2
"2022-05-07",2021,"Barrow","Northampton Town",1,3
"2022-05-07",2021,"Bradford City","Carlisle United",2,0
"2022-05-07",2021,"Bristol Rovers","Scunthorpe United",7,0
"2022-05-07",2021,"Exeter City","Port Vale",0,1
"2022-05-07",2021,"Harrogate Town A.F.C.","Sutton United",0,2
"2022-05-07",2021,"Hartlepool United","Colchester United",0,2
"2022-05-07",2021,"Leyton Orient","Tranmere Rovers",0,1
"2022-05-07",2021,"Mansfield Town","Forest Green Rovers",2,2
"2022-05-07",2021,"Newport County","Rochdale",0,2
"2022-05-07",2021,"Oldham Athletic","Crawley Town",3,3
"2022-05-07",2021,"Stevenage Borough","Salford City",4,2
"2022-05-07",2021,"Walsall","Swindon Town",0,3
```


## 格式设置 {#format-settings}

:::note
如果将设置 [`input_format_with_names_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_names_use_header) 设为 `1`,
输入数据中的列将按名称映射到表中的列,若设置 [input_format_skip_unknown_fields](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 为 `1`,则会跳过名称未知的列。
否则,将跳过第一行。
:::
