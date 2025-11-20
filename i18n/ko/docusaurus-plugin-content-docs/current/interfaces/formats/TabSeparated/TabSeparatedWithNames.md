---
'alias':
- 'TSVWithNames'
'description': 'TabSeparatedWithNames 형식에 대한 Documentation'
'input_format': true
'keywords':
- 'TabSeparatedWithNames'
'output_format': true
'slug': '/interfaces/formats/TabSeparatedWithNames'
'title': 'TabSeparatedWithNames'
'doc_type': 'reference'
---

| Input | Output | Alias                          |
|-------|--------|--------------------------------|
|     ✔    |     ✔     | `TSVWithNames`, `RawWithNames` |

## 설명 {#description}

[`TabSeparated`](./TabSeparated.md) 형식과 다르게, 첫 번째 행에 컬럼 이름이 기록됩니다.

파싱 중 첫 번째 행에는 컬럼 이름이 포함될 것으로 예상됩니다. 컬럼 이름을 사용하여 위치를 결정하고 정확성을 확인할 수 있습니다.

:::note
[`input_format_with_names_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_names_use_header) 설정이 `1`로 설정되면,
입력 데이터의 컬럼은 이름으로 테이블의 컬럼에 매핑되고, 알려지지 않은 이름의 컬럼은 [`input_format_skip_unknown_fields`](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 설정이 `1`로 설정되어 있으면 건너뛰어집니다.
그렇지 않으면 첫 번째 행은 건너뛰어집니다.
:::

## 예제 사용 {#example-usage}

### 데이터 삽입 {#inserting-data}

다음 `football.tsv`라는 이름의 tsv 파일을 사용하여:

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

데이터를 삽입합니다:

```sql
INSERT INTO football FROM INFILE 'football.tsv' FORMAT TabSeparatedWithNames;
```

### 데이터 읽기 {#reading-data}

`TabSeparatedWithNames` 형식을 사용하여 데이터를 읽습니다:

```sql
SELECT *
FROM football
FORMAT TabSeparatedWithNames
```

출력은 탭 분리 형식이 됩니다:

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

## 형식 설정 {#format-settings}
