---
'description': 'lagInFrame 윈도우 함수에 대한 문서'
'sidebar_label': 'lagInFrame'
'sidebar_position': 9
'slug': '/sql-reference/window-functions/lagInFrame'
'title': 'lagInFrame'
'doc_type': 'reference'
---


# lagInFrame

현재 행 이전에 지정된 물리적 오프셋 행에 있는 값을 반환합니다.

:::warning
`lagInFrame`의 동작은 표준 SQL `lag` 윈도우 함수와 다릅니다.
Clickhouse 윈도우 함수 `lagInFrame`은 윈도우 프레임을 고려합니다.
`lag`와 동일한 동작을 원하면 `ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING`을 사용하세요.
:::

**문법**

```sql
lagInFrame(x[, offset[, default]])
  OVER ([[PARTITION BY grouping_column] [ORDER BY sorting_column]
        [ROWS or RANGE expression_to_bound_rows_withing_the_group]] | [window_name])
FROM table_name
WINDOW window_name as ([[PARTITION BY grouping_column] [ORDER BY sorting_column])
```

윈도우 함수 문법에 대한 자세한 내용은 다음을 참조하세요: [Window Functions - Syntax](./index.md/#syntax).

**매개변수**
- `x` — 컬럼 이름.
- `offset` — 적용할 오프셋. [(U)Int*](../data-types/int-uint.md). (선택적 - 기본값은 `1`).
- `default` — 계산된 행이 윈도우 프레임의 경계를 초과할 경우 반환할 값. (선택적 - 생략 시 컬럼 유형의 기본값).

**반환 값**

- 정렬된 프레임 내에서 현재 행 이전의 지정된 물리적 오프셋에 있는 행에서 평가된 값.

**예제**

이 예제는 특정 주식의 역사적 데이터를 살펴보고 `lagInFrame` 함수를 사용하여 주식의 종가에서 일일 델타 및 백분율 변화를 계산합니다.

쿼리:

```sql
CREATE TABLE stock_prices
(
    `date`   Date,
    `open`   Float32, -- opening price
    `high`   Float32, -- daily high
    `low`    Float32, -- daily low
    `close`  Float32, -- closing price
    `volume` UInt32   -- trade volume
)
Engine = Memory;

INSERT INTO stock_prices FORMAT Values
    ('2024-06-03', 113.62, 115.00, 112.00, 115.00, 438392000),
    ('2024-06-04', 115.72, 116.60, 114.04, 116.44, 403324000),
    ('2024-06-05', 118.37, 122.45, 117.47, 122.44, 528402000),
    ('2024-06-06', 124.05, 125.59, 118.32, 121.00, 664696000),
    ('2024-06-07', 119.77, 121.69, 118.02, 120.89, 412386000);
```

```sql
SELECT
    date,
    close,
    lagInFrame(close, 1, close) OVER (ORDER BY date ASC
       ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
     ) AS previous_day_close,
    COALESCE(ROUND(close - previous_day_close, 2)) AS delta,
    COALESCE(ROUND((delta / previous_day_close) * 100, 2)) AS percent_change
FROM stock_prices
ORDER BY date DESC
```

결과:

```response
   ┌───────date─┬──close─┬─previous_day_close─┬─delta─┬─percent_change─┐
1. │ 2024-06-07 │ 120.89 │                121 │ -0.11 │          -0.09 │
2. │ 2024-06-06 │    121 │             122.44 │ -1.44 │          -1.18 │
3. │ 2024-06-05 │ 122.44 │             116.44 │     6 │           5.15 │
4. │ 2024-06-04 │ 116.44 │                115 │  1.44 │           1.25 │
5. │ 2024-06-03 │    115 │                115 │     0 │              0 │
   └────────────┴────────┴────────────────────┴───────┴────────────────┘
```
