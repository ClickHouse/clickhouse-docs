---
'description': 'leadInFrame 윈도우 함수에 대한 문서'
'sidebar_label': 'leadInFrame'
'sidebar_position': 10
'slug': '/sql-reference/window-functions/leadInFrame'
'title': 'leadInFrame'
'doc_type': 'reference'
---


# leadInFrame

현재 행 이후로 오프셋 행이 있는 순서 지정된 프레임 내에서 평가된 값을 반환합니다.

:::warning
`leadInFrame`의 동작은 표준 SQL `lead` 윈도우 함수와 다릅니다.
Clickhouse 윈도우 함수 `leadInFrame`은 윈도우 프레임을 존중합니다.
`lead`와 동일한 동작을 원하면 `ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING`을 사용하십시오.
:::

**문법**

```sql
leadInFrame(x[, offset[, default]])
  OVER ([[PARTITION BY grouping_column] [ORDER BY sorting_column]
        [ROWS or RANGE expression_to_bound_rows_withing_the_group]] | [window_name])
FROM table_name
WINDOW window_name as ([[PARTITION BY grouping_column] [ORDER BY sorting_column])
```

윈도우 함수 문법에 대한 더 자세한 내용은 다음을 참조하십시오: [윈도우 함수 - 문법](./index.md/#syntax).

**매개변수**
- `x` — 컬럼 이름.
- `offset` — 적용할 오프셋. [(U)Int*](../data-types/int-uint.md). (선택 사항 - 기본값 `1`).
- `default` — 계산된 행이 윈도우 프레임의 경계를 초과할 경우 반환할 값. (선택 사항 - 생략 시 컬럼 타입의 기본값).

**반환 값**

- 순서 지정된 프레임 내에서 현재 행 이후로 오프셋 행이 있는 행에서 평가된 값.

**예제**

이 예제는 노벨상 수상자에 대한 [히스토리컬 데이터](https://www.kaggle.com/datasets/sazidthe1/nobel-prize-data)를 살펴보고 `leadInFrame` 함수를 사용하여 물리학 카테고리에서 연속적으로 수상한 목록을 반환합니다.

쿼리:

```sql
CREATE OR REPLACE VIEW nobel_prize_laureates
AS SELECT *
FROM file('nobel_laureates_data.csv');
```

```sql
SELECT
    fullName,
    leadInFrame(year, 1, year) OVER (PARTITION BY category ORDER BY year ASC
      ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    ) AS year,
    category,
    motivation
FROM nobel_prize_laureates
WHERE category = 'physics'
ORDER BY year DESC
LIMIT 9
```

결과:

```response
   ┌─fullName─────────┬─year─┬─category─┬─motivation─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
1. │ Anne L Huillier  │ 2023 │ physics  │ for experimental methods that generate attosecond pulses of light for the study of electron dynamics in matter                     │
2. │ Pierre Agostini  │ 2023 │ physics  │ for experimental methods that generate attosecond pulses of light for the study of electron dynamics in matter                     │
3. │ Ferenc Krausz    │ 2023 │ physics  │ for experimental methods that generate attosecond pulses of light for the study of electron dynamics in matter                     │
4. │ Alain Aspect     │ 2022 │ physics  │ for experiments with entangled photons establishing the violation of Bell inequalities and  pioneering quantum information science │
5. │ Anton Zeilinger  │ 2022 │ physics  │ for experiments with entangled photons establishing the violation of Bell inequalities and  pioneering quantum information science │
6. │ John Clauser     │ 2022 │ physics  │ for experiments with entangled photons establishing the violation of Bell inequalities and  pioneering quantum information science │
7. │ Giorgio Parisi   │ 2021 │ physics  │ for the discovery of the interplay of disorder and fluctuations in physical systems from atomic to planetary scales                │
8. │ Klaus Hasselmann │ 2021 │ physics  │ for the physical modelling of Earths climate quantifying variability and reliably predicting global warming                        │
9. │ Syukuro Manabe   │ 2021 │ physics  │ for the physical modelling of Earths climate quantifying variability and reliably predicting global warming                        │
   └──────────────────┴──────┴──────────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```
