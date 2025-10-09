---
'alias': []
'description': 'CSV形式に関するドキュメント'
'input_format': true
'keywords':
- 'CSVWithNames'
'output_format': true
'slug': '/interfaces/formats/CSVWithNames'
'title': 'CSVWithNames'
'doc_type': 'reference'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## Description {#description}

カラム名を含むヘッダー行も印刷され、[TabSeparatedWithNames](/interfaces/formats/TabSeparatedWithNames) と似ています。

## Example usage {#example-usage}

### Inserting data {#inserting-data}

:::tip
[バージョン](https://github.com/ClickHouse/ClickHouse/releases) 23.1 から、ClickHouse は `CSV` 形式を使用する際に CSV ファイル内のヘッダーを自動的に検出するため、`CSVWithNames` または `CSVWithNamesAndTypes` を使用する必要はありません。
:::

`football.csv` という名前の次の CSV ファイルを使用します：

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

テーブルを作成します：

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

`CSVWithNames` 形式を使用してデータを挿入します：

```sql
INSERT INTO football FROM INFILE 'football.csv' FORMAT CSVWithNames;
```

### Reading data {#reading-data}

`CSVWithNames` 形式を使用してデータを読み込みます：

```sql
SELECT *
FROM football
FORMAT CSVWithNames
```

出力は単一のヘッダー行を含む CSV になります：

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

## Format settings {#format-settings}

:::note
[`input_format_with_names_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_names_use_header) 設定が `1` に設定されている場合、入力データからのカラムはテーブルのカラムに名前でマップされ、未知の名前のカラムは [input_format_skip_unknown_fields](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 設定が `1` に設定されている場合にスキップされます。
そうでない場合、最初の行はスキップされます。
:::
