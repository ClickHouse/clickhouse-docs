---
'alias': []
'description': 'CSVWithNamesAndTypes 格式的文档'
'input_format': true
'keywords':
- 'CSVWithNamesAndTypes'
'output_format': true
'slug': '/interfaces/formats/CSVWithNamesAndTypes'
'title': 'CSVWithNamesAndTypes'
'doc_type': 'reference'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 描述 {#description}

还会打印两行标题，包含列名称和类型，类似于 [TabSeparatedWithNamesAndTypes](../formats/TabSeparatedWithNamesAndTypes)。

## 示例用法 {#example-usage}

### 插入数据 {#inserting-data}

:::tip
从 [版本](https://github.com/ClickHouse/ClickHouse/releases) 23.1 开始，使用 `CSV` 格式时，ClickHouse 将自动检测 CSV 文件中的标题，因此不需要使用 `CSVWithNames` 或 `CSVWithNamesAndTypes`。
:::

使用以下 CSV 文件，命名为 `football_types.csv`：

```csv
date,season,home_team,away_team,home_team_goals,away_team_goals
Date,Int16,LowCardinality(String),LowCardinality(String),Int8,Int8
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

创建一个表：

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

使用 `CSVWithNamesAndTypes` 格式插入数据：

```sql
INSERT INTO football FROM INFILE 'football_types.csv' FORMAT CSVWithNamesAndTypes;
```

### 读取数据 {#reading-data}

使用 `CSVWithNamesAndTypes` 格式读取数据：

```sql
SELECT *
FROM football
FORMAT CSVWithNamesAndTypes
```

输出将是一个具有两行标题的 CSV，用于列名称和类型：

```csv
"date","season","home_team","away_team","home_team_goals","away_team_goals"
"Date","Int16","LowCardinality(String)","LowCardinality(String)","Int8","Int8"
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
如果设置 [input_format_with_names_use_header](/operations/settings/settings-formats.md/#input_format_with_names_use_header) 为 `1`，
则输入数据的列将根据列名称映射到表中的列，如果设置 [input_format_skip_unknown_fields](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 为 `1`，则名称未知的列将被跳过。
否则，第一行将被跳过。
:::

:::note
如果设置 [input_format_with_types_use_header](../../../operations/settings/settings-formats.md/#input_format_with_types_use_header) 为 `1`，
则输入数据的类型将与表中相应列的类型进行比较。否则，第二行将被跳过。
:::
