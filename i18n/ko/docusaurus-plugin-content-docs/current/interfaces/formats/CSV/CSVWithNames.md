---
alias: []
description: 'CSV 형식에 대한 문서'
input_format: true
keywords: ['CSVWithNames']
output_format: true
slug: /interfaces/formats/CSVWithNames
title: 'CSVWithNames'
doc_type: 'reference'
---

| 입력 | 출력 | 별칭 |
|-------|--------|-------|
| ✔     | ✔      |       |

## 설명 \{#description\}

또한 [TabSeparatedWithNames](/interfaces/formats/TabSeparatedWithNames)와 마찬가지로 컬럼 이름이 포함된 헤더 행을 함께 출력합니다.

## 사용 예 \{#example-usage\}

### 데이터 삽입 \{#inserting-data\}

:::tip
[버전](https://github.com/ClickHouse/ClickHouse/releases) 23.1부터는 ClickHouse에서 `CSV` 형식을 사용할 때 CSV 파일의 헤더를 자동으로 감지하므로, `CSVWithNames`나 `CSVWithNamesAndTypes`를 별도로 사용할 필요가 없습니다.
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

테이블을 생성하십시오:

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

`CSVWithNames` 형식으로 데이터를 삽입합니다:

```sql
INSERT INTO football FROM INFILE 'football.csv' FORMAT CSVWithNames;
```


### 데이터 읽기 \{#reading-data\}

`CSVWithNames` 형식을 사용하여 데이터를 읽습니다.

```sql
SELECT *
FROM football
FORMAT CSVWithNames
```

출력 결과는 헤더 행이 하나뿐인 CSV입니다.

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


## 포맷 설정 \{#format-settings\}

:::note
[`input_format_with_names_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_names_use_header) 설정이 `1`로 되어 있으면,
입력 데이터의 컬럼은 이름을 기준으로 테이블의 컬럼에 매핑되며, [input_format_skip_unknown_fields](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 설정이 `1`로 되어 있는 경우 알 수 없는 이름의 컬럼은 건너뛰어집니다.
그렇지 않으면 첫 번째 행이 건너뛰어집니다.
:::