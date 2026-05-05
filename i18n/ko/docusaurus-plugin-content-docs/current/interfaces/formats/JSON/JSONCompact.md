---
alias: []
description: 'JSONCompact 형식에 대한 문서'
input_format: true
keywords: ['JSONCompact']
output_format: true
slug: /interfaces/formats/JSONCompact
title: 'JSONCompact'
doc_type: 'reference'
---

| 입력 | 출력 | 별칭 |
|-------|--------|-------|
| ✔     | ✔      |       |

## 설명 \{#description\}

데이터 행은 객체가 아닌 배열로 출력된다는 점만 [JSON](./JSON.md)과 다릅니다.

## 사용 예 \{#example-usage\}

### 데이터 삽입 \{#inserting-data\}

다음과 같은 데이터를 담은 JSON 파일 `football.json`을 사용합니다:

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
        ["2022-04-30", 2021, "Sutton United", "Bradford City", 1, 4],
        ["2022-04-30", 2021, "Swindon Town", "Barrow", 2, 1],
        ["2022-04-30", 2021, "Tranmere Rovers", "Oldham Athletic", 2, 0],
        ["2022-05-02", 2021, "Port Vale", "Newport County", 1, 2],
        ["2022-05-02", 2021, "Salford City", "Mansfield Town", 2, 2],
        ["2022-05-07", 2021, "Barrow", "Northampton Town", 1, 3],
        ["2022-05-07", 2021, "Bradford City", "Carlisle United", 2, 0],
        ["2022-05-07", 2021, "Bristol Rovers", "Scunthorpe United", 7, 0],
        ["2022-05-07", 2021, "Exeter City", "Port Vale", 0, 1],
        ["2022-05-07", 2021, "Harrogate Town A.F.C.", "Sutton United", 0, 2],
        ["2022-05-07", 2021, "Hartlepool United", "Colchester United", 0, 2],
        ["2022-05-07", 2021, "Leyton Orient", "Tranmere Rovers", 0, 1],
        ["2022-05-07", 2021, "Mansfield Town", "Forest Green Rovers", 2, 2],
        ["2022-05-07", 2021, "Newport County", "Rochdale", 0, 2],
        ["2022-05-07", 2021, "Oldham Athletic", "Crawley Town", 3, 3],
        ["2022-05-07", 2021, "Stevenage Borough", "Salford City", 4, 2],
        ["2022-05-07", 2021, "Walsall", "Swindon Town", 0, 3]
    ]
}
```

데이터를 삽입하십시오:

```sql
INSERT INTO football FROM INFILE 'football.json' FORMAT JSONCompact;
```


### 데이터 읽기 \{#reading-data\}

`JSONCompact` 형식을 사용하여 데이터를 읽으십시오.

```sql
SELECT *
FROM football
FORMAT JSONCompact
```

출력 결과는 JSON 형식입니다:

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
        ["2022-04-30", 2021, "Sutton United", "Bradford City", 1, 4],
        ["2022-04-30", 2021, "Swindon Town", "Barrow", 2, 1],
        ["2022-04-30", 2021, "Tranmere Rovers", "Oldham Athletic", 2, 0],
        ["2022-05-02", 2021, "Port Vale", "Newport County", 1, 2],
        ["2022-05-02", 2021, "Salford City", "Mansfield Town", 2, 2],
        ["2022-05-07", 2021, "Barrow", "Northampton Town", 1, 3],
        ["2022-05-07", 2021, "Bradford City", "Carlisle United", 2, 0],
        ["2022-05-07", 2021, "Bristol Rovers", "Scunthorpe United", 7, 0],
        ["2022-05-07", 2021, "Exeter City", "Port Vale", 0, 1],
        ["2022-05-07", 2021, "Harrogate Town A.F.C.", "Sutton United", 0, 2],
        ["2022-05-07", 2021, "Hartlepool United", "Colchester United", 0, 2],
        ["2022-05-07", 2021, "Leyton Orient", "Tranmere Rovers", 0, 1],
        ["2022-05-07", 2021, "Mansfield Town", "Forest Green Rovers", 2, 2],
        ["2022-05-07", 2021, "Newport County", "Rochdale", 0, 2],
        ["2022-05-07", 2021, "Oldham Athletic", "Crawley Town", 3, 3],
        ["2022-05-07", 2021, "Stevenage Borough", "Salford City", 4, 2],
        ["2022-05-07", 2021, "Walsall", "Swindon Town", 0, 3]
    ],

    "rows": 17,

    "statistics":
    {
        "elapsed": 0.223690876,
        "rows_read": 0,
        "bytes_read": 0
    }
}
```


## 형식 설정 \{#format-settings\}