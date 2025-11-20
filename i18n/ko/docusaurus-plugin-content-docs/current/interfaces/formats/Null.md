---
'alias': []
'description': 'Null 형식에 대한 문서'
'input_format': false
'keywords':
- 'Null'
- 'format'
'output_format': true
'slug': '/interfaces/formats/Null'
'title': 'Null'
'doc_type': 'reference'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✗     | ✔      |       |

## Description {#description}

`Null` 형식에서는 아무것도 출력되지 않습니다. 
처음에는 이상하게 들릴 수 있지만, 아무것도 출력하지 않더라도 쿼리는 여전히 처리된다는 점에 유의해야 합니다. 
명령줄 클라이언트를 사용할 때, 데이터는 클라이언트로 전송됩니다. 

:::tip
`Null` 형식은 성능 테스트에 유용할 수 있습니다.
:::

## Example usage {#example-usage}

### Reading data {#reading-data}

다음 데이터를 가진 `football` 테이블을 고려해 보세요:

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

`Null` 형식을 사용하여 데이터를 읽어보세요:

```sql
SELECT *
FROM football
FORMAT Null
```

쿼리는 데이터를 처리하지만, 아무것도 출력하지 않습니다.

```response
0 rows in set. Elapsed: 0.154 sec.
```

## Format settings {#format-settings}
