---
'alias': []
'description': 'CSVWithNamesAndTypes 형식에 대한 Documentation'
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

## 설명 {#description}

또한 [TabSeparatedWithNamesAndTypes](../formats/TabSeparatedWithNamesAndTypes)와 유사하게 컬럼 이름과 타입이 포함된 두 개의 헤더 행을 출력합니다.

## 예제 사용법 {#example-usage}

### 데이터 삽입 {#inserting-data}

:::tip
[버전](https://github.com/ClickHouse/ClickHouse/releases) 23.1부터 ClickHouse는 `CSV` 형식을 사용할 때 CSV 파일에서 헤더를 자동으로 감지하므로 `CSVWithNames` 또는 `CSVWithNamesAndTypes`를 사용할 필요가 없습니다.
:::

다음과 같은 CSV 파일을 사용합니다, 이름은 `football_types.csv`입니다:

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

`CSVWithNamesAndTypes` 형식을 사용하여 데이터를 삽입합니다:

```sql
INSERT INTO football FROM INFILE 'football_types.csv' FORMAT CSVWithNamesAndTypes;
```

### 데이터 읽기 {#reading-data}

`CSVWithNamesAndTypes` 형식을 사용하여 데이터를 읽습니다:

```sql
SELECT *
FROM football
FORMAT CSVWithNamesAndTypes
```

출력은 컬럼 이름과 타입을 위한 두 개의 헤더 행이 있는 CSV가 될 것입니다:

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

## 형식 설정 {#format-settings}

:::note
설정 [input_format_with_names_use_header](/operations/settings/settings-formats.md/#input_format_with_names_use_header)가 `1`로 설정되면,
입력 데이터의 컬럼은 테이블의 컬럼 이름으로 매핑되며, 이름이 알려지지 않은 컬럼은 설정 [input_format_skip_unknown_fields](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields)가 `1`로 설정된 경우 생략됩니다.
그렇지 않으면 첫 번째 행이 생략됩니다.
:::

:::note
설정 [input_format_with_types_use_header](../../../operations/settings/settings-formats.md/#input_format_with_types_use_header)가 `1`로 설정되면,
입력 데이터의 타입은 테이블의 해당 컬럼의 타입과 비교됩니다. 그렇지 않으면 두 번째 행이 생략됩니다.
:::
