---
description: 'TabSeparatedWithNamesAndTypes 형식에 대한 설명서'
keywords: ['TabSeparatedWithNamesAndTypes']
slug: /interfaces/formats/TabSeparatedWithNamesAndTypes
title: 'TabSeparatedWithNamesAndTypes'
doc_type: 'reference'
---

| Input | Output | 별칭                                          |
|-------|--------|------------------------------------------------|
|     ✔    |     ✔     | `TSVWithNamesAndTypes`, `RawWithNamesAndTypes` |



## 설명 \{#description\}

[`TabSeparated`](./TabSeparated.md) 포맷과 다른 점은 첫 번째 행에는 컬럼 이름이, 두 번째 행에는 컬럼 타입이 기록된다는 점입니다.

:::note
- 설정 [`input_format_with_names_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_names_use_header)이 `1`로 설정된 경우,
입력 데이터의 컬럼은 이름을 기준으로 테이블의 컬럼과 매핑되며, 설정 [`input_format_skip_unknown_fields`](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields)이 `1`로 설정된 경우 이름을 알 수 없는 컬럼은 건너뜁니다.
그렇지 않으면 첫 번째 행은 건너뜁니다.
- 설정 [`input_format_with_types_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_types_use_header)이 `1`로 설정된 경우,
입력 데이터의 타입은 테이블의 해당 컬럼 타입과 비교됩니다. 그렇지 않으면 두 번째 행은 건너뜁니다.
:::



## 사용 예시 \{#example-usage\}

### 데이터 삽입 \{#inserting-data\}

다음 tsv 파일(`football.tsv`)을 사용합니다.

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
INSERT INTO football FROM INFILE 'football.tsv' FORMAT TabSeparatedWithNamesAndTypes;
```

### 데이터 읽기 \{#reading-data\}

`TabSeparatedWithNamesAndTypes` 형식을 사용하여 데이터를 읽습니다:

```sql
SELECT *
FROM football
FORMAT TabSeparatedWithNamesAndTypes
```

출력은 컬럼 이름과 타입을 나타내는 두 개의 헤더 행이 포함된 탭 구분 형식입니다.


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