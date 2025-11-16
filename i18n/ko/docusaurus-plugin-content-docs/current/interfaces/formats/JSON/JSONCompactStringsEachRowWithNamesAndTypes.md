---
'description': 'JSONCompactStringsEachRowWithNamesAndTypes 형식에 대한 문서'
'keywords':
- 'JSONCompactStringsEachRowWithNamesAndTypes'
'slug': '/interfaces/formats/JSONCompactStringsEachRowWithNamesAndTypes'
'title': 'JSONCompactStringsEachRowWithNamesAndTypes'
'doc_type': 'reference'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 설명 {#description}

`JSONCompactEachRow` 형식과는 달리 열 이름과 유형을 포함한 두 개의 헤더 행도 출력됩니다. 이는 [TabSeparatedWithNamesAndTypes](/interfaces/formats/TabSeparatedRawWithNamesAndTypes)와 유사합니다.

## 사용 예 {#example-usage}

### 데이터 삽입 {#inserting-data}

다음 데이터를 포함한 JSON 파일 `football.json`을 사용합니다:

```json
["date", "season", "home_team", "away_team", "home_team_goals", "away_team_goals"]
["Date", "Int16", "LowCardinality(String)", "LowCardinality(String)", "Int8", "Int8"]
["2022-04-30", "2021", "Sutton United", "Bradford City", "1", "4"]
["2022-04-30", "2021", "Swindon Town", "Barrow", "2", "1"]
["2022-04-30", "2021", "Tranmere Rovers", "Oldham Athletic", "2", "0"]
["2022-05-02", "2021", "Port Vale", "Newport County", "1", "2"]
["2022-05-02", "2021", "Salford City", "Mansfield Town", "2", "2"]
["2022-05-07", "2021", "Barrow", "Northampton Town", "1", "3"]
["2022-05-07", "2021", "Bradford City", "Carlisle United", "2", "0"]
["2022-05-07", "2021", "Bristol Rovers", "Scunthorpe United", "7", "0"]
["2022-05-07", "2021", "Exeter City", "Port Vale", "0", "1"]
["2022-05-07", "2021", "Harrogate Town A.F.C.", "Sutton United", "0", "2"]
["2022-05-07", "2021", "Hartlepool United", "Colchester United", "0", "2"]
["2022-05-07", "2021", "Leyton Orient", "Tranmere Rovers", "0", "1"]
["2022-05-07", "2021", "Mansfield Town", "Forest Green Rovers", "2", "2"]
["2022-05-07", "2021", "Newport County", "Rochdale", "0", "2"]
["2022-05-07", "2021", "Oldham Athletic", "Crawley Town", "3", "3"]
["2022-05-07", "2021", "Stevenage Borough", "Salford City", "4", "2"]
["2022-05-07", "2021", "Walsall", "Swindon Town", "0", "3"]
```

데이터를 삽입합니다:

```sql
INSERT INTO football FROM INFILE 'football.json' FORMAT JSONCompactStringsEachRowWithNamesAndTypes;
```

### 데이터 읽기 {#reading-data}

`JSONCompactStringsEachRowWithNamesAndTypes` 형식을 사용하여 데이터를 읽습니다:

```sql
SELECT *
FROM football
FORMAT JSONCompactStringsEachRowWithNamesAndTypes
```

출력은 JSON 형식으로 제공됩니다:

```json
["date", "season", "home_team", "away_team", "home_team_goals", "away_team_goals"]
["Date", "Int16", "LowCardinality(String)", "LowCardinality(String)", "Int8", "Int8"]
["2022-04-30", "2021", "Sutton United", "Bradford City", "1", "4"]
["2022-04-30", "2021", "Swindon Town", "Barrow", "2", "1"]
["2022-04-30", "2021", "Tranmere Rovers", "Oldham Athletic", "2", "0"]
["2022-05-02", "2021", "Port Vale", "Newport County", "1", "2"]
["2022-05-02", "2021", "Salford City", "Mansfield Town", "2", "2"]
["2022-05-07", "2021", "Barrow", "Northampton Town", "1", "3"]
["2022-05-07", "2021", "Bradford City", "Carlisle United", "2", "0"]
["2022-05-07", "2021", "Bristol Rovers", "Scunthorpe United", "7", "0"]
["2022-05-07", "2021", "Exeter City", "Port Vale", "0", "1"]
["2022-05-07", "2021", "Harrogate Town A.F.C.", "Sutton United", "0", "2"]
["2022-05-07", "2021", "Hartlepool United", "Colchester United", "0", "2"]
["2022-05-07", "2021", "Leyton Orient", "Tranmere Rovers", "0", "1"]
["2022-05-07", "2021", "Mansfield Town", "Forest Green Rovers", "2", "2"]
["2022-05-07", "2021", "Newport County", "Rochdale", "0", "2"]
["2022-05-07", "2021", "Oldham Athletic", "Crawley Town", "3", "3"]
["2022-05-07", "2021", "Stevenage Borough", "Salford City", "4", "2"]
["2022-05-07", "2021", "Walsall", "Swindon Town", "0", "3"]
```

## 형식 설정 {#format-settings}

:::note
설정 [input_format_with_names_use_header](/operations/settings/settings-formats.md/#input_format_with_names_use_header)가 1로 설정된 경우,
입력 데이터의 컬럼은 테이블의 컬럼에 이름으로 매핑됩니다. 알려지지 않은 이름의 컬럼은 설정 [input_format_skip_unknown_fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields)가 1로 설정된 경우 생략됩니다.
그렇지 않으면 첫 번째 행이 생략됩니다.
:::

:::note
설정 [input_format_with_types_use_header](/operations/settings/settings-formats.md/#input_format_with_types_use_header)가 1로 설정된 경우,
입력 데이터의 유형은 테이블의 해당 컬럼의 유형과 비교됩니다. 그렇지 않으면 두 번째 행이 생략됩니다.
:::
