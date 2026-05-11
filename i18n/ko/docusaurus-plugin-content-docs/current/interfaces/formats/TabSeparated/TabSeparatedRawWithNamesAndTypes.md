---
alias: ['TSVRawWithNamesAndTypes', 'RawWithNamesAndTypes']
description: 'TabSeparatedRawWithNamesAndTypes 형식에 대한 문서'
input_format: true
keywords: ['TabSeparatedRawWithNamesAndTypes', 'TSVRawWithNamesAndTypes', 'RawWithNamesAndTypes']
output_format: true
slug: /interfaces/formats/TabSeparatedRawWithNamesAndTypes
title: 'TabSeparatedRawWithNamesAndTypes'
doc_type: 'reference'
---

| 입력 | 출력 | 별칭                                             |
|-------|--------|---------------------------------------------------|
| ✔     | ✔      | `TSVRawWithNamesAndNames`, `RawWithNamesAndNames` |



## 설명 \{#description\}

각 행을 이스케이프하지 않고 기록한다는 점에서 [`TabSeparatedWithNamesAndTypes`](./TabSeparatedWithNamesAndTypes.md) 형식과 다릅니다.

:::note
이 형식으로 파싱할 때는 각 필드에 탭이나 줄 바꿈 문자를 사용할 수 없습니다.
:::



## 예시 사용법 \{#example-usage\}

### 데이터 삽입 \{#inserting-data\}

다음과 같은 내용의 TSV 파일 `football.tsv`를 사용합니다:

```tsv
date    season  home_team       away_team       home_team_goals away_team_goals
Date    Int16   LowCardinality(String)  LowCardinality(String)  Int8    Int8
2022-04-30      2021    Sutton United   Bradford City   1       4
2022-04-30      2021    Swindon Town    Barrow  2       1
2022-04-30      2021    Tranmere Rovers Oldham Athletic 2       0
2022-05-02      2021    Port Vale       Newport County  1       2
2022-05-02      2021    Salford City    Mansfield Town  2       2
2022-05-07      2021    Barrow  Northampton Town        1       3
2022-05-07      2021    Bradford City   Carlisle United 2       0
2022-05-07      2021    Bristol Rovers  Scunthorpe United       7       0
2022-05-07      2021    Exeter City     Port Vale       0       1
2022-05-07      2021    Harrogate Town A.F.C.   Sutton United   0       2
2022-05-07      2021    Hartlepool United       Colchester United       0       2
2022-05-07      2021    Leyton Orient   Tranmere Rovers 0       1
2022-05-07      2021    Mansfield Town  Forest Green Rovers     2       2
2022-05-07      2021    Newport County  Rochdale        0       2
2022-05-07      2021    Oldham Athletic Crawley Town    3       3
2022-05-07      2021    Stevenage Borough       Salford City    4       2
2022-05-07      2021    Walsall Swindon Town    0       3
```

데이터를 삽입하십시오:

```sql
INSERT INTO football FROM INFILE 'football.tsv' FORMAT TabSeparatedRawWithNamesAndTypes;
```

### 데이터 읽기 \{#reading-data\}

`TabSeparatedRawWithNamesAndTypes` 형식을 사용해 데이터를 읽습니다.

```sql
SELECT *
FROM football
FORMAT TabSeparatedRawWithNamesAndTypes
```

출력은 컬럼 이름과 타입을 나타내는 두 개의 헤더 행을 포함한 탭 구분 형식으로 제공됩니다.


```tsv
date    season  home_team       away_team       home_team_goals away_team_goals
Date    Int16   LowCardinality(String)  LowCardinality(String)  Int8    Int8
2022-04-30      2021    Sutton United   Bradford City   1       4
2022-04-30      2021    Swindon Town    Barrow  2       1
2022-04-30      2021    Tranmere Rovers Oldham Athletic 2       0
2022-05-02      2021    Port Vale       Newport County  1       2
2022-05-02      2021    Salford City    Mansfield Town  2       2
2022-05-07      2021    Barrow  Northampton Town        1       3
2022-05-07      2021    Bradford City   Carlisle United 2       0
2022-05-07      2021    Bristol Rovers  Scunthorpe United       7       0
2022-05-07      2021    Exeter City     Port Vale       0       1
2022-05-07      2021    Harrogate Town A.F.C.   Sutton United   0       2
2022-05-07      2021    Hartlepool United       Colchester United       0       2
2022-05-07      2021    Leyton Orient   Tranmere Rovers 0       1
2022-05-07      2021    Mansfield Town  Forest Green Rovers     2       2
2022-05-07      2021    Newport County  Rochdale        0       2
2022-05-07      2021    Oldham Athletic Crawley Town    3       3
2022-05-07      2021    Stevenage Borough       Salford City    4       2
2022-05-07      2021    Walsall Swindon Town    0       3
```


## 형식 설정 \{#format-settings\}
