---
alias: []
description: 'Null 형식에 대한 문서'
input_format: false
keywords: ['Null', 'format']
output_format: true
slug: /interfaces/formats/Null
title: 'Null'
doc_type: 'reference'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✗     | ✔      |       |



## 설명 \{#description\}

`Null` 포맷에서는 아무것도 출력하지 않습니다.
처음에는 다소 이상하게 들릴 수 있지만, 아무것도 출력되지 않더라도 쿼리는 여전히 처리되며,
명령줄 클라이언트를 사용할 때에도 데이터는 클라이언트로 전송된다는 점이 중요합니다.

:::tip
`Null` 포맷은 성능 테스트에 유용하게 사용할 수 있습니다.
:::



## 사용 예시 \{#example-usage\}

### 데이터 읽기 \{#reading-data\}

다음과 같은 데이터가 들어 있는 `football` 테이블이 있다고 가정합니다.

```text
    ┌───────date─┬─season─┬─home_team─────────────┬─away_team───────────┬─home_team_goals─┬─away_team_goals─┐
 1. │ 2022-04-30 │   2021 │ Sutton United         │ Bradford City       │               1 │               4 │
 2. │ 2022-04-30 │   2021 │ Swindon Town          │ Barrow              │               2 │               1 │
 3. │ 2022-04-30 │   2021 │ Tranmere Rovers       │ Oldham Athletic     │               2 │               0 │
 4. │ 2022-05-02 │   2021 │ Port Vale             │ Newport County      │               1 │               2 │
 5. │ 2022-05-02 │   2021 │ Salford City          │ Mansfield Town      │               2 │               2 │
 6. │ 2022-05-07 │   2021 │ Barrow                │ Northampton Town    │               1 │               3 │
 7. │ 2022-05-07 │   2021 │ Bradford City         │ Carlisle United     │               2 │               0 │
 8. │ 2022-05-07 │   2021 │ Bristol Rovers        │ Scunthorpe United   │               7 │               0 │
 9. │ 2022-05-07 │   2021 │ Exeter City           │ Port Vale           │               0 │               1 │
10. │ 2022-05-07 │   2021 │ Harrogate Town A.F.C. │ Sutton United       │               0 │               2 │
11. │ 2022-05-07 │   2021 │ Hartlepool United     │ Colchester United   │               0 │               2 │
12. │ 2022-05-07 │   2021 │ Leyton Orient         │ Tranmere Rovers     │               0 │               1 │
13. │ 2022-05-07 │   2021 │ Mansfield Town        │ Forest Green Rovers │               2 │               2 │
14. │ 2022-05-07 │   2021 │ Newport County        │ Rochdale            │               0 │               2 │
15. │ 2022-05-07 │   2021 │ Oldham Athletic       │ Crawley Town        │               3 │               3 │
16. │ 2022-05-07 │   2021 │ Stevenage Borough     │ Salford City        │               4 │               2 │
17. │ 2022-05-07 │   2021 │ Walsall               │ Swindon Town        │               0 │               3 │
    └────────────┴────────┴───────────────────────┴─────────────────────┴─────────────────┴─────────────────┘
```

`Null` 포맷으로 데이터를 읽습니다:

```sql
SELECT *
FROM football
FORMAT Null
```

이 쿼리는 데이터를 처리하지만 어떤 결과도 출력하지 않습니다.

```response
0 rows in set. Elapsed: 0.154 sec.
```


## 형식 설정 \{#format-settings\}
