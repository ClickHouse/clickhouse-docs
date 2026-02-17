---
alias: []
description: 'JSONCompactStringsEachRowWithNames 형식에 대한 문서'
input_format: true
keywords: ['JSONCompactStringsEachRowWithNames']
output_format: true
slug: /interfaces/formats/JSONCompactStringsEachRowWithNames
title: 'JSONCompactStringsEachRowWithNames'
doc_type: 'reference'
---

| 입력 | 출력 | 별칭 |
|-------|--------|-------|
| ✔     | ✔      |       |

## 설명 \{#description\}

[`JSONCompactEachRow`](./JSONCompactEachRow.md) 형식과는 달리, [TabSeparatedWithNames](../TabSeparated/TabSeparatedWithNames.md) 형식과 유사하게 컬럼 이름이 포함된 헤더 행도 함께 출력합니다.

## 사용 예 \{#example-usage\}

### 데이터 삽입 \{#inserting-data\}

다음 내용이 포함된 JSON 파일 `football.json`을 사용합니다.

```json
["date", "season", "home_team", "away_team", "home_team_goals", "away_team_goals"]
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

데이터를 삽입하십시오:

```sql
INSERT INTO football FROM INFILE 'football.json' FORMAT JSONCompactStringsEachRowWithNames;
```


### 데이터 읽기 \{#reading-data\}

`JSONCompactStringsEachRowWithNames` 형식을 사용해 데이터를 읽습니다:

```sql
SELECT *
FROM football
FORMAT JSONCompactStringsEachRowWithNames
```

출력은 JSON 형식입니다:

```json
["date", "season", "home_team", "away_team", "home_team_goals", "away_team_goals"]
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


## 포맷 설정 \{#format-settings\}

:::note
[`input_format_with_names_use_header`](/operations/settings/settings-formats.md/#input_format_with_names_use_header) 설정이 `1`로 설정되어 있으면,
입력 데이터의 컬럼은 이름을 기준으로 테이블의 컬럼과 매핑되며, [`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 설정이 `1`로 설정되어 있는 경우 테이블에 존재하지 않는 이름의 컬럼은 건너뜁니다.
그렇지 않으면 첫 번째 행은 건너뜁니다.
:::