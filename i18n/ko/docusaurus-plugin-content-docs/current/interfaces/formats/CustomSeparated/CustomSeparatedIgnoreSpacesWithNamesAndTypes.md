---
description: 'CustomSeparatedIgnoreSpacesWithNamesAndTypes 포맷에 대한 문서'
keywords: ['CustomSeparatedIgnoreSpacesWithNamesAndTypes']
slug: /interfaces/formats/CustomSeparatedIgnoreSpacesWithNamesAndTypes
title: 'CustomSeparatedIgnoreSpacesWithNamesAndTypes'
doc_type: 'reference'
---

| 입력 | 출력 | 별칭 |
|-------|--------|-------|
| ✔     |        |       |

## 설명 \{#description\}

## 사용 예시 \{#example-usage\}

### 데이터 삽입 \{#inserting-data\}

다음 내용의 `football.txt` 텍스트 파일을 사용합니다:

```text
row('date'; 'season'; 'home_team'; 'away_team'; 'home_team_goals'; 'away_team_goals'), row('Date'; 'Int16'; 'LowCardinality(String)'; 'LowCardinality(String)'; 'Int8'; 'Int8'), row('2022-04-30'; 2021; 'Sutton United'; 'Bradford City'; 1; 4), row( '2022-04-30'; 2021; 'Swindon Town'; 'Barrow'; 2; 1), row( '2022-04-30'; 2021; 'Tranmere Rovers'; 'Oldham Athletic'; 2; 0), row('2022-05-02'; 2021; 'Salford City'; 'Mansfield Town'; 2; 2), row('2022-05-02'; 2021; 'Port Vale'; 'Newport County'; 1; 2), row('2022-05-07'; 2021; 'Barrow'; 'Northampton Town'; 1; 3), row('2022-05-07'; 2021; 'Bradford City'; 'Carlisle United'; 2; 0), row('2022-05-07'; 2021; 'Bristol Rovers'; 'Scunthorpe United'; 7; 0), row('2022-05-07'; 2021; 'Exeter City'; 'Port Vale'; 0; 1), row('2022-05-07'; 2021; 'Harrogate Town A.F.C.'; 'Sutton United'; 0; 2), row('2022-05-07'; 2021; 'Hartlepool United'; 'Colchester United'; 0; 2), row('2022-05-07'; 2021; 'Leyton Orient'; 'Tranmere Rovers'; 0; 1), row('2022-05-07'; 2021; 'Mansfield Town'; 'Forest Green Rovers'; 2; 2), row('2022-05-07'; 2021; 'Newport County'; 'Rochdale'; 0; 2), row('2022-05-07'; 2021; 'Oldham Athletic'; 'Crawley Town'; 3; 3), row('2022-05-07'; 2021; 'Stevenage Borough'; 'Salford City'; 4; 2), row('2022-05-07'; 2021; 'Walsall'; 'Swindon Town'; 0; 3)
```

사용자 정의 구분 기호 설정을 구성합니다:

```sql
SET format_custom_row_before_delimiter = 'row(';
SET format_custom_row_after_delimiter = ')';
SET format_custom_field_delimiter = ';';
SET format_custom_row_between_delimiter = ',';
SET format_custom_escaping_rule = 'Quoted';
```

데이터를 삽입하십시오:

```sql
INSERT INTO football FROM INFILE 'football.txt' FORMAT CustomSeparatedIgnoreSpacesWithNamesAndTypes;
```


## 형식 설정 \{#format-settings\}