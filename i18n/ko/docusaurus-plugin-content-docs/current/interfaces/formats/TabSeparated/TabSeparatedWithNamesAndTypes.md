---
'description': 'TabSeparatedWithNamesAndTypes 형식에 대한 Documentation'
'keywords':
- 'TabSeparatedWithNamesAndTypes'
'slug': '/interfaces/formats/TabSeparatedWithNamesAndTypes'
'title': 'TabSeparatedWithNamesAndTypes'
'doc_type': 'reference'
---

| Input | Output | Alias                                          |
|-------|--------|------------------------------------------------|
|     ✔    |     ✔     | `TSVWithNamesAndTypes`, `RawWithNamesAndTypes` |

## 설명 {#description}

[`TabSeparated`](./TabSeparated.md) 형식과의 차이점은 첫 번째 행에 컬럼 이름이 기록되고 두 번째 행에 컬럼 타입이 기록된다는 점입니다.

:::note
- [`input_format_with_names_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_names_use_header) 설정이 `1`로 설정된 경우,
입력 데이터의 컬럼은 이름에 따라 테이블의 컬럼에 매핑되며, 이름이 알려지지 않은 컬럼은 [`input_format_skip_unknown_fields`](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 설정이 1로 설정된 경우 스킵됩니다.
그렇지 않으면 첫 번째 행은 스킵됩니다.
- [`input_format_with_types_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_types_use_header) 설정이 `1`로 설정된 경우,
입력 데이터의 타입은 테이블의 해당 컬럼의 타입과 비교됩니다. 그렇지 않으면 두 번째 행은 스킵됩니다.
:::

## 예제 사용법 {#example-usage}

### 데이터 삽입 {#inserting-data}

다음의 tsv 파일을 `football.tsv`라는 이름으로 사용합니다:

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

데이터를 삽입합니다:

```sql
INSERT INTO football FROM INFILE 'football.tsv' FORMAT TabSeparatedWithNamesAndTypes;
```

### 데이터 읽기 {#reading-data}

`TabSeparatedWithNamesAndTypes` 형식을 사용하여 데이터를 읽습니다:

```sql
SELECT *
FROM football
FORMAT TabSeparatedWithNamesAndTypes
```

출력은 컬럼 이름과 타입에 대한 두 개의 헤더 행이 있는 탭 분리 형식으로 제공됩니다:

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

## 형식 설정 {#format-settings}
