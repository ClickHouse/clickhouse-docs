---
alias: ['TSVRawWithNames', 'RawWithNames']
description: 'TabSeparatedRawWithNames 형식에 대한 문서'
input_format: true
keywords: ['TabSeparatedRawWithNames', 'TSVRawWithNames', 'RawWithNames']
output_format: true
slug: /interfaces/formats/TabSeparatedRawWithNames
title: 'TabSeparatedRawWithNames'
doc_type: 'reference'
---

| 입력 | 출력 | 별칭                             |
|-------|--------|-----------------------------------|
| ✔     | ✔      | `TSVRawWithNames`, `RawWithNames` |



## 설명 \{#description\}

[`TabSeparatedWithNames`](./TabSeparatedWithNames.md) 형식과의 차이점은 
각 행이 이스케이프 없이 기록된다는 점입니다.

:::note
이 형식으로 파싱할 때는 각 필드에 탭이나 줄 바꿈 문자가 포함될 수 없습니다.
:::



## 사용 예시 \{#example-usage\}

### 데이터 삽입 \{#inserting-data\}

다음과 같은 `football.tsv` TSV 파일을 사용합니다:

```tsv
date    season  home_team       away_team       home_team_goals away_team_goals
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
INSERT INTO football FROM INFILE 'football.tsv' FORMAT TabSeparatedRawWithNames;
```

### 데이터 읽기 \{#reading-data\}

`TabSeparatedRawWithNames` 형식을 사용하여 데이터를 읽습니다:

```sql
SELECT *
FROM football
FORMAT TabSeparatedRawWithNames
```

출력은 한 줄짜리 헤더가 있는 탭 구분 형식입니다:

```tsv
date    season  home_team       away_team       home_team_goals away_team_goals
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