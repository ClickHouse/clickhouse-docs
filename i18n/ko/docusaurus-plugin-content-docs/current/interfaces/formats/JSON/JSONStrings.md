---
'alias': []
'description': 'JSONStrings 포맷에 대한 Documentation'
'input_format': true
'keywords':
- 'JSONStrings'
'output_format': true
'slug': '/interfaces/formats/JSONStrings'
'title': 'JSONStrings'
'doc_type': 'reference'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 설명 {#description}

데이터 필드가 타입이 지정된 JSON 값이 아닌 문자열로 출력된다는 점에서만 [JSON](./JSON.md) 형식과 다릅니다.

## 사용 예시 {#example-usage}

### 데이터 삽입 {#inserting-data}

다음 데이터를 포함하는 JSON 파일인 `football.json`을 사용합니다:

```json
{
    "meta":
    [
            {
                    "name": "date",
                    "type": "Date"
            },
            {
                    "name": "season",
                    "type": "Int16"
            },
            {
                    "name": "home_team",
                    "type": "LowCardinality(String)"
            },
            {
                    "name": "away_team",
                    "type": "LowCardinality(String)"
            },
            {
                    "name": "home_team_goals",
                    "type": "Int8"
            },
            {
                    "name": "away_team_goals",
                    "type": "Int8"
            }
    ],
    "data":
    [
            {
                    "date": "2022-04-30",
                    "season": "2021",
                    "home_team": "Sutton United",
                    "away_team": "Bradford City",
                    "home_team_goals": "1",
                    "away_team_goals": "4"
            },
            {
                    "date": "2022-04-30",
                    "season": "2021",
                    "home_team": "Swindon Town",
                    "away_team": "Barrow",
                    "home_team_goals": "2",
                    "away_team_goals": "1"
            },
            {
                    "date": "2022-04-30",
                    "season": "2021",
                    "home_team": "Tranmere Rovers",
                    "away_team": "Oldham Athletic",
                    "home_team_goals": "2",
                    "away_team_goals": "0"
            },
            {
                    "date": "2022-05-02",
                    "season": "2021",
                    "home_team": "Port Vale",
                    "away_team": "Newport County",
                    "home_team_goals": "1",
                    "away_team_goals": "2"
            },
            {
                    "date": "2022-05-02",
                    "season": "2021",
                    "home_team": "Salford City",
                    "away_team": "Mansfield Town",
                    "home_team_goals": "2",
                    "away_team_goals": "2"
            },
            {
                    "date": "2022-05-07",
                    "season": "2021",
                    "home_team": "Barrow",
                    "away_team": "Northampton Town",
                    "home_team_goals": "1",
                    "away_team_goals": "3"
            },
            {
                    "date": "2022-05-07",
                    "season": "2021",
                    "home_team": "Bradford City",
                    "away_team": "Carlisle United",
                    "home_team_goals": "2",
                    "away_team_goals": "0"
            },
            {
                    "date": "2022-05-07",
                    "season": "2021",
                    "home_team": "Bristol Rovers",
                    "away_team": "Scunthorpe United",
                    "home_team_goals": "7",
                    "away_team_goals": "0"
            },
            {
                    "date": "2022-05-07",
                    "season": "2021",
                    "home_team": "Exeter City",
                    "away_team": "Port Vale",
                    "home_team_goals": "0",
                    "away_team_goals": "1"
            },
            {
                    "date": "2022-05-07",
                    "season": "2021",
                    "home_team": "Harrogate Town A.F.C.",
                    "away_team": "Sutton United",
                    "home_team_goals": "0",
                    "away_team_goals": "2"
            },
            {
                    "date": "2022-05-07",
                    "season": "2021",
                    "home_team": "Hartlepool United",
                    "away_team": "Colchester United",
                    "home_team_goals": "0",
                    "away_team_goals": "2"
            },
            {
                    "date": "2022-05-07",
                    "season": "2021",
                    "home_team": "Leyton Orient",
                    "away_team": "Tranmere Rovers",
                    "home_team_goals": "0",
                    "away_team_goals": "1"
            },
            {
                    "date": "2022-05-07",
                    "season": "2021",
                    "home_team": "Mansfield Town",
                    "away_team": "Forest Green Rovers",
                    "home_team_goals": "2",
                    "away_team_goals": "2"
            },
            {
                    "date": "2022-05-07",
                    "season": "2021",
                    "home_team": "Newport County",
                    "away_team": "Rochdale",
                    "home_team_goals": "0",
                    "away_team_goals": "2"
            },
            {
                    "date": "2022-05-07",
                    "season": "2021",
                    "home_team": "Oldham Athletic",
                    "away_team": "Crawley Town",
                    "home_team_goals": "3",
                    "away_team_goals": "3"
            },
            {
                    "date": "2022-05-07",
                    "season": "2021",
                    "home_team": "Stevenage Borough",
                    "away_team": "Salford City",
                    "home_team_goals": "4",
                    "away_team_goals": "2"
            },
            {
                    "date": "2022-05-07",
                    "season": "2021",
                    "home_team": "Walsall",
                    "away_team": "Swindon Town",
                    "home_team_goals": "0",
                    "away_team_goals": "3"
            }
    ]
}
```

데이터를 삽입합니다:

```sql
INSERT INTO football FROM INFILE 'football.json' FORMAT JSONStrings;
```

### 데이터 읽기 {#reading-data}

`JSONStrings` 형식을 사용하여 데이터를 읽습니다:

```sql
SELECT *
FROM football
FORMAT JSONStrings
```

출력은 JSON 형식이 될 것입니다:

```json
{
    "meta":
    [
            {
                    "name": "date",
                    "type": "Date"
            },
            {
                    "name": "season",
                    "type": "Int16"
            },
            {
                    "name": "home_team",
                    "type": "LowCardinality(String)"
            },
            {
                    "name": "away_team",
                    "type": "LowCardinality(String)"
            },
            {
                    "name": "home_team_goals",
                    "type": "Int8"
            },
            {
                    "name": "away_team_goals",
                    "type": "Int8"
            }
    ],

    "data":
    [
            {
                    "date": "2022-04-30",
                    "season": "2021",
                    "home_team": "Sutton United",
                    "away_team": "Bradford City",
                    "home_team_goals": "1",
                    "away_team_goals": "4"
            },
            {
                    "date": "2022-04-30",
                    "season": "2021",
                    "home_team": "Swindon Town",
                    "away_team": "Barrow",
                    "home_team_goals": "2",
                    "away_team_goals": "1"
            },
            {
                    "date": "2022-04-30",
                    "season": "2021",
                    "home_team": "Tranmere Rovers",
                    "away_team": "Oldham Athletic",
                    "home_team_goals": "2",
                    "away_team_goals": "0"
            },
            {
                    "date": "2022-05-02",
                    "season": "2021",
                    "home_team": "Port Vale",
                    "away_team": "Newport County",
                    "home_team_goals": "1",
                    "away_team_goals": "2"
            },
            {
                    "date": "2022-05-02",
                    "season": "2021",
                    "home_team": "Salford City",
                    "away_team": "Mansfield Town",
                    "home_team_goals": "2",
                    "away_team_goals": "2"
            },
            {
                    "date": "2022-05-07",
                    "season": "2021",
                    "home_team": "Barrow",
                    "away_team": "Northampton Town",
                    "home_team_goals": "1",
                    "away_team_goals": "3"
            },
            {
                    "date": "2022-05-07",
                    "season": "2021",
                    "home_team": "Bradford City",
                    "away_team": "Carlisle United",
                    "home_team_goals": "2",
                    "away_team_goals": "0"
            },
            {
                    "date": "2022-05-07",
                    "season": "2021",
                    "home_team": "Bristol Rovers",
                    "away_team": "Scunthorpe United",
                    "home_team_goals": "7",
                    "away_team_goals": "0"
            },
            {
                    "date": "2022-05-07",
                    "season": "2021",
                    "home_team": "Exeter City",
                    "away_team": "Port Vale",
                    "home_team_goals": "0",
                    "away_team_goals": "1"
            },
            {
                    "date": "2022-05-07",
                    "season": "2021",
                    "home_team": "Harrogate Town A.F.C.",
                    "away_team": "Sutton United",
                    "home_team_goals": "0",
                    "away_team_goals": "2"
            },
            {
                    "date": "2022-05-07",
                    "season": "2021",
                    "home_team": "Hartlepool United",
                    "away_team": "Colchester United",
                    "home_team_goals": "0",
                    "away_team_goals": "2"
            },
            {
                    "date": "2022-05-07",
                    "season": "2021",
                    "home_team": "Leyton Orient",
                    "away_team": "Tranmere Rovers",
                    "home_team_goals": "0",
                    "away_team_goals": "1"
            },
            {
                    "date": "2022-05-07",
                    "season": "2021",
                    "home_team": "Mansfield Town",
                    "away_team": "Forest Green Rovers",
                    "home_team_goals": "2",
                    "away_team_goals": "2"
            },
            {
                    "date": "2022-05-07",
                    "season": "2021",
                    "home_team": "Newport County",
                    "away_team": "Rochdale",
                    "home_team_goals": "0",
                    "away_team_goals": "2"
            },
            {
                    "date": "2022-05-07",
                    "season": "2021",
                    "home_team": "Oldham Athletic",
                    "away_team": "Crawley Town",
                    "home_team_goals": "3",
                    "away_team_goals": "3"
            },
            {
                    "date": "2022-05-07",
                    "season": "2021",
                    "home_team": "Stevenage Borough",
                    "away_team": "Salford City",
                    "home_team_goals": "4",
                    "away_team_goals": "2"
            },
            {
                    "date": "2022-05-07",
                    "season": "2021",
                    "home_team": "Walsall",
                    "away_team": "Swindon Town",
                    "home_team_goals": "0",
                    "away_team_goals": "3"
            }
    ],

    "rows": 17,

    "statistics":
    {
            "elapsed": 0.173464376,
            "rows_read": 0,
            "bytes_read": 0
    }
}
```

## 형식 설정 {#format-settings}
