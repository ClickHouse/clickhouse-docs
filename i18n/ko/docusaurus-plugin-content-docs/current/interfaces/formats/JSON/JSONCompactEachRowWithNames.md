---
'alias': []
'description': 'JSONCompactEachRowWithNames 형식에 대한 문서'
'input_format': true
'keywords':
- 'JSONCompactEachRowWithNames'
'output_format': true
'slug': '/interfaces/formats/JSONCompactEachRowWithNames'
'title': 'JSONCompactEachRowWithNames'
'doc_type': 'reference'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 설명 {#description}

[`JSONCompactEachRow`](./JSONCompactEachRow.md) 형식과의 차이는 컬럼 이름이 포함된 헤더 행도 인쇄된다는데 있으며, 이는 [`TabSeparatedWithNames`](../TabSeparated/TabSeparatedWithNames.md) 형식과 유사합니다.

## 예제 사용법 {#example-usage}

### 데이터 삽입 {#inserting-data}

다음 데이터를 가진 JSON 파일을 사용하며, 파일 이름은 `football.json`입니다:

```json
["date", "season", "home_team", "away_team", "home_team_goals", "away_team_goals"]
["2022-04-30", 2021, "Sutton United", "Bradford City", 1, 4]
["2022-04-30", 2021, "Swindon Town", "Barrow", 2, 1]
["2022-04-30", 2021, "Tranmere Rovers", "Oldham Athletic", 2, 0]
["2022-05-02", 2021, "Port Vale", "Newport County", 1, 2]
["2022-05-02", 2021, "Salford City", "Mansfield Town", 2, 2]
["2022-05-07", 2021, "Barrow", "Northampton Town", 1, 3]
["2022-05-07", 2021, "Bradford City", "Carlisle United", 2, 0]
["2022-05-07", 2021, "Bristol Rovers", "Scunthorpe United", 7, 0]
["2022-05-07", 2021, "Exeter City", "Port Vale", 0, 1]
["2022-05-07", 2021, "Harrogate Town A.F.C.", "Sutton United", 0, 2]
["2022-05-07", 2021, "Hartlepool United", "Colchester United", 0, 2]
["2022-05-07", 2021, "Leyton Orient", "Tranmere Rovers", 0, 1]
["2022-05-07", 2021, "Mansfield Town", "Forest Green Rovers", 2, 2]
["2022-05-07", 2021, "Newport County", "Rochdale", 0, 2]
["2022-05-07", 2021, "Oldham Athletic", "Crawley Town", 3, 3]
["2022-05-07", 2021, "Stevenage Borough", "Salford City", 4, 2]
["2022-05-07", 2021, "Walsall", "Swindon Town", 0, 3]
```

데이터를 삽입합니다:

```sql
INSERT INTO football FROM INFILE 'football.json' FORMAT JSONCompactEachRowWithNames;
```

### 데이터 읽기 {#reading-data}

`JSONCompactEachRowWithNames` 형식을 사용하여 데이터를 읽습니다:

```sql
SELECT *
FROM football
FORMAT JSONCompactEachRowWithNames
```

출력은 JSON 형식이 됩니다:

```json
["date", "season", "home_team", "away_team", "home_team_goals", "away_team_goals"]
["2022-04-30", 2021, "Sutton United", "Bradford City", 1, 4]
["2022-04-30", 2021, "Swindon Town", "Barrow", 2, 1]
["2022-04-30", 2021, "Tranmere Rovers", "Oldham Athletic", 2, 0]
["2022-05-02", 2021, "Port Vale", "Newport County", 1, 2]
["2022-05-02", 2021, "Salford City", "Mansfield Town", 2, 2]
["2022-05-07", 2021, "Barrow", "Northampton Town", 1, 3]
["2022-05-07", 2021, "Bradford City", "Carlisle United", 2, 0]
["2022-05-07", 2021, "Bristol Rovers", "Scunthorpe United", 7, 0]
["2022-05-07", 2021, "Exeter City", "Port Vale", 0, 1]
["2022-05-07", 2021, "Harrogate Town A.F.C.", "Sutton United", 0, 2]
["2022-05-07", 2021, "Hartlepool United", "Colchester United", 0, 2]
["2022-05-07", 2021, "Leyton Orient", "Tranmere Rovers", 0, 1]
["2022-05-07", 2021, "Mansfield Town", "Forest Green Rovers", 2, 2]
["2022-05-07", 2021, "Newport County", "Rochdale", 0, 2]
["2022-05-07", 2021, "Oldham Athletic", "Crawley Town", 3, 3]
["2022-05-07", 2021, "Stevenage Borough", "Salford City", 4, 2]
["2022-05-07", 2021, "Walsall", "Swindon Town", 0, 3]
```

## 형식 설정 {#format-settings}

:::note
[`input_format_with_names_use_header`](/operations/settings/settings-formats.md/#input_format_with_names_use_header) 설정이 1로 설정되면,
입력 데이터의 컬럼은 테이블의 컬럼과 이름으로 매핑되며, 알려지지 않은 이름의 컬럼은 [`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 설정이 1로 설정된 경우 건너뛰게 됩니다.
그렇지 않으면 첫 번째 행은 건너뛰어집니다.
:::
