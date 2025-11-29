---
alias: ['TSVRawWithNamesAndTypes', 'RawWithNamesAndTypes']
description: 'TabSeparatedRawWithNamesAndTypes 格式说明文档'
input_format: true
keywords: ['TabSeparatedRawWithNamesAndTypes', 'TSVRawWithNamesAndTypes', 'RawWithNamesAndTypes']
output_format: true
slug: /interfaces/formats/TabSeparatedRawWithNamesAndTypes
title: 'TabSeparatedRawWithNamesAndTypes'
doc_type: 'reference'
---

| 输入 | 输出 | 别名                                             |
|-------|--------|---------------------------------------------------|
| ✔     | ✔      | `TSVRawWithNamesAndNames`, `RawWithNamesAndNames` |



## 描述 {#description}

与 [`TabSeparatedWithNamesAndTypes`](./TabSeparatedWithNamesAndTypes.md) 格式不同，
该格式在写入行数据时不会进行转义。

:::note
使用此格式进行解析时，每个字段中不允许包含制表符或换行符。
:::



## 使用示例 {#example-usage}

### 插入数据 {#inserting-data}

使用以下名为 `football.tsv` 的 TSV 文件：

```tsv
date    season  home_team       away_team       home_team_goals away_team_goals
Date    Int16   LowCardinality(String)  LowCardinality(String)  Int8    Int8
2022-04-30      2021    Sutton United   Bradford City   1       4
2022-04-30      2021    Swindon Town    Barrow  2       1
2022-04-30      2021    Tranmere Rovers Oldham Athletic 2       0
2022-05-02      2021    Port Vale       Newport County  1       2
2022-05-02      2021    Salford City    Mansfield Town  2       2
2022-05-07      2021    Barrow  Northampton Town        1       3
2022-05-07      2021    Bradford City   Carlisle United 2       0
2022-05-07      2021    Bristol Rovers  Scunthorpe United       7       0
2022-05-07      2021    Exeter City     Port Vale       0       1
2022-05-07      2021    Harrogate Town A.F.C.   Sutton United   0       2
2022-05-07      2021    Hartlepool United       Colchester United       0       2
2022-05-07      2021    Leyton Orient   Tranmere Rovers 0       1
2022-05-07      2021    Mansfield Town  Forest Green Rovers     2       2
2022-05-07      2021    Newport County  Rochdale        0       2
2022-05-07      2021    Oldham Athletic Crawley Town    3       3
2022-05-07      2021    Stevenage Borough       Salford City    4       2
2022-05-07      2021    Walsall Swindon Town    0       3
```

插入数据：

```sql
INSERT INTO football FROM INFILE 'football.tsv' FORMAT TabSeparatedRawWithNamesAndTypes;
```

### 读取数据 {#reading-data}

以 `TabSeparatedRawWithNamesAndTypes` 格式读取数据：

```sql
SELECT *
FROM football
FORMAT TabSeparatedRawWithNamesAndTypes
```

输出将采用制表符分隔的格式，并包含两行表头，分别用于列名和列类型：


```tsv
date    season  home_team       away_team       home_team_goals away_team_goals
Date    Int16   LowCardinality(String)  LowCardinality(String)  Int8    Int8
2022-04-30      2021    Sutton United   Bradford City   1       4
2022-04-30      2021    Swindon Town    Barrow  2       1
2022-04-30      2021    Tranmere Rovers Oldham Athletic 2       0
2022-05-02      2021    Port Vale       Newport County  1       2
2022-05-02      2021    Salford City    Mansfield Town  2       2
2022-05-07      2021    Barrow  Northampton Town        1       3
2022-05-07      2021    Bradford City   Carlisle United 2       0
2022-05-07      2021    Bristol Rovers  Scunthorpe United       7       0
2022-05-07      2021    Exeter City     Port Vale       0       1
2022-05-07      2021    Harrogate Town A.F.C.   Sutton United   0       2
2022-05-07      2021    Hartlepool United       Colchester United       0       2
2022-05-07      2021    Leyton Orient   Tranmere Rovers 0       1
2022-05-07      2021    Mansfield Town  Forest Green Rovers     2       2
2022-05-07      2021    Newport County  Rochdale        0       2
2022-05-07      2021    Oldham Athletic Crawley Town    3       3
2022-05-07      2021    Stevenage Borough       Salford City    4       2
2022-05-07      2021    Walsall Swindon Town    0       3
```


## 格式设置 {#format-settings}
