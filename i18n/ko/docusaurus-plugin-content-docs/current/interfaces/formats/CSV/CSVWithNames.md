---
'alias': []
'description': 'CSV 형식에 대한 문서'
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

또한 [TabSeparatedWithNames](/interfaces/formats/TabSeparatedWithNames)와 유사하게 컬럼 이름이 포함된 헤더 행을 출력합니다.

## Example usage {#example-usage}

### Inserting data {#inserting-data}

:::tip
[버전](https://github.com/ClickHouse/ClickHouse/releases) 23.1부터, ClickHouse는 `CSV` 형식을 사용할 때 CSV 파일의 헤더를 자동으로 감지하므로 `CSVWithNames` 또는 `CSVWithNamesAndTypes`를 사용할 필요가 없습니다.
:::

다음과 같은 `football.csv`라는 이름의 CSV 파일을 사용합니다:

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

테이블을 생성합니다:

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

`CSVWithNames` 형식을 사용하여 데이터를 삽입합니다:

```sql
INSERT INTO football FROM INFILE 'football.csv' FORMAT CSVWithNames;
```

### Reading data {#reading-data}

`CSVWithNames` 형식을 사용하여 데이터를 읽습니다:

```sql
SELECT *
FROM football
FORMAT CSVWithNames
```

출력은 단일 헤더 행이 포함된 CSV가 될 것입니다:

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
[`input_format_with_names_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_names_use_header) 설정이 `1`로 설정되어 있는 경우,
입력 데이터의 컬럼은 컬럼 이름에 따라 테이블의 컬럼에 매핑됩니다. 이름이 알려지지 않은 컬럼은 [input_format_skip_unknown_fields](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 설정이 `1`로 설정된 경우 생략됩니다.
그렇지 않으면 첫 번째 행이 생략됩니다.
:::
