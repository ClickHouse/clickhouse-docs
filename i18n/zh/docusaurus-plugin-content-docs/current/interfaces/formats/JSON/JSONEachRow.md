---
alias: ['JSONLines', 'NDJSON']
description: 'JSONEachRow 格式文档'
keywords: ['JSONEachRow']
slug: /interfaces/formats/JSONEachRow
title: 'JSONEachRow'
doc_type: 'reference'
---

| Input | Output | Alias                 |
|-------|--------|-----------------------|
| ✔     | ✔      | `JSONLines`, `NDJSON` |



## Description {#description}

在此格式下,ClickHouse 会将每一行输出为独立的、以换行符分隔的 JSON 对象。


## 使用示例 {#example-usage}

### 插入数据 {#inserting-data}

使用包含以下数据的 JSON 文件,命名为 `football.json`:

```json
{"date":"2022-04-30","season":2021,"home_team":"Sutton United","away_team":"Bradford City","home_team_goals":1,"away_team_goals":4}
{"date":"2022-04-30","season":2021,"home_team":"Swindon Town","away_team":"Barrow","home_team_goals":2,"away_team_goals":1}
{"date":"2022-04-30","season":2021,"home_team":"Tranmere Rovers","away_team":"Oldham Athletic","home_team_goals":2,"away_team_goals":0}
{"date":"2022-05-02","season":2021,"home_team":"Port Vale","away_team":"Newport County","home_team_goals":1,"away_team_goals":2}
{"date":"2022-05-02","season":2021,"home_team":"Salford City","away_team":"Mansfield Town","home_team_goals":2,"away_team_goals":2}
{"date":"2022-05-07","season":2021,"home_team":"Barrow","away_team":"Northampton Town","home_team_goals":1,"away_team_goals":3}
{"date":"2022-05-07","season":2021,"home_team":"Bradford City","away_team":"Carlisle United","home_team_goals":2,"away_team_goals":0}
{"date":"2022-05-07","season":2021,"home_team":"Bristol Rovers","away_team":"Scunthorpe United","home_team_goals":7,"away_team_goals":0}
{"date":"2022-05-07","season":2021,"home_team":"Exeter City","away_team":"Port Vale","home_team_goals":0,"away_team_goals":1}
{"date":"2022-05-07","season":2021,"home_team":"Harrogate Town A.F.C.","away_team":"Sutton United","home_team_goals":0,"away_team_goals":2}
{"date":"2022-05-07","season":2021,"home_team":"Hartlepool United","away_team":"Colchester United","home_team_goals":0,"away_team_goals":2}
{"date":"2022-05-07","season":2021,"home_team":"Leyton Orient","away_team":"Tranmere Rovers","home_team_goals":0,"away_team_goals":1}
{"date":"2022-05-07","season":2021,"home_team":"Mansfield Town","away_team":"Forest Green Rovers","home_team_goals":2,"away_team_goals":2}
{"date":"2022-05-07","season":2021,"home_team":"Newport County","away_team":"Rochdale","home_team_goals":0,"away_team_goals":2}
{"date":"2022-05-07","season":2021,"home_team":"Oldham Athletic","away_team":"Crawley Town","home_team_goals":3,"away_team_goals":3}
{"date":"2022-05-07","season":2021,"home_team":"Stevenage Borough","away_team":"Salford City","home_team_goals":4,"away_team_goals":2}
{"date":"2022-05-07","season":2021,"home_team":"Walsall","away_team":"Swindon Town","home_team_goals":0,"away_team_goals":3}
```

插入数据:

```sql
INSERT INTO football FROM INFILE 'football.json' FORMAT JSONEachRow;
```

### 读取数据 {#reading-data}

使用 `JSONEachRow` 格式读取数据:

```sql
SELECT *
FROM football
FORMAT JSONEachRow
```

输出结果为 JSON 格式:


```json
{"date":"2022-04-30","season":2021,"home_team":"Sutton United","away_team":"Bradford City","home_team_goals":1,"away_team_goals":4}
{"date":"2022-04-30","season":2021,"home_team":"Swindon Town","away_team":"Barrow","home_team_goals":2,"away_team_goals":1}
{"date":"2022-04-30","season":2021,"home_team":"Tranmere Rovers","away_team":"Oldham Athletic","home_team_goals":2,"away_team_goals":0}
{"date":"2022-05-02","season":2021,"home_team":"Port Vale","away_team":"Newport County","home_team_goals":1,"away_team_goals":2}
{"date":"2022-05-02","season":2021,"home_team":"Salford City","away_team":"Mansfield Town","home_team_goals":2,"away_team_goals":2}
{"date":"2022-05-07","season":2021,"home_team":"Barrow","away_team":"Northampton Town","home_team_goals":1,"away_team_goals":3}
{"date":"2022-05-07","season":2021,"home_team":"Bradford City","away_team":"Carlisle United","home_team_goals":2,"away_team_goals":0}
{"date":"2022-05-07","season":2021,"home_team":"Bristol Rovers","away_team":"Scunthorpe United","home_team_goals":7,"away_team_goals":0}
{"date":"2022-05-07","season":2021,"home_team":"Exeter City","away_team":"Port Vale","home_team_goals":0,"away_team_goals":1}
{"date":"2022-05-07","season":2021,"home_team":"Harrogate Town A.F.C.","away_team":"Sutton United","home_team_goals":0,"away_team_goals":2}
{"date":"2022-05-07","season":2021,"home_team":"Hartlepool United","away_team":"Colchester United","home_team_goals":0,"away_team_goals":2}
{"date":"2022-05-07","season":2021,"home_team":"Leyton Orient","away_team":"Tranmere Rovers","home_team_goals":0,"away_team_goals":1}
{"date":"2022-05-07","season":2021,"home_team":"Mansfield Town","away_team":"Forest Green Rovers","home_team_goals":2,"away_team_goals":2}
{"date":"2022-05-07","season":2021,"home_team":"Newport County","away_team":"Rochdale","home_team_goals":0,"away_team_goals":2}
{"date":"2022-05-07","season":2021,"home_team":"Oldham Athletic","away_team":"Crawley Town","home_team_goals":3,"away_team_goals":3}
{"date":"2022-05-07","season":2021,"home_team":"Stevenage Borough","away_team":"Salford City","home_team_goals":4,"away_team_goals":2}
{"date":"2022-05-07","season":2021,"home_team":"Walsall","away_team":"Swindon Town","home_team_goals":0,"away_team_goals":3}
```

如果将设置 [input&#95;format&#95;skip&#95;unknown&#95;fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 设为 1，那么导入时名称未知的列将会被跳过。


## 格式设置 {#format-settings}
