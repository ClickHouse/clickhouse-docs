---
description: '윈도우 함수 개요 페이지'
sidebar_label: '윈도우 함수'
sidebar_position: 1
slug: /sql-reference/window-functions/
title: '윈도우 함수'
doc_type: 'reference'
---



# 윈도우 함수  \{#window-functions\}

윈도우 함수는 현재 행과 관련된 행 집합에 대해 계산을 수행할 수 있게 합니다.
수행할 수 있는 계산 중 일부는 집계 함수로 할 수 있는 계산과 유사하지만, 윈도우 함수는 행을 단일 출력으로 그룹화하지 않으므로 개별 행이 그대로 반환됩니다.



## Standard window functions \{#standard-window-functions\}

ClickHouse는 윈도우 및 윈도우 함수 정의를 위한 표준 문법을 지원합니다. 아래 표는 각 기능의 현재 지원 여부를 보여줍니다.

| Feature                                                                  | Supported?                                                                                                                                                                       |
|--------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| ad hoc window specification (`count(*) over (partition by id order by time desc)`) | ✅                                                                                                                                                                                  |
| expressions involving window functions, e.g. `(count(*) over ()) / 2)`             | ✅                                                                                                                                                                                   |
| `WINDOW` clause (`select ... from table window w as (partition by id)`)            | ✅                                                                                                                                                                                   |
| `ROWS` frame                                                                       | ✅                                                                                                                                                                                   |
| `RANGE` frame                                                                      | ✅ (기본값)                                                                                                                                                                      |
| `INTERVAL` syntax for `DateTime` `RANGE OFFSET` frame                              | ❌ (대신 초 단위 숫자를 지정하면 됩니다. `RANGE`는 모든 숫자형 타입과 함께 동작합니다.)                                                                                                                                 |
| `GROUPS` frame                                                                     | ❌                                                                                                                                                                               |
| Calculating aggregate functions over a frame (`sum(value) over (order by time)`)   | ✅ (모든 집계 함수를 지원합니다.)                                                                                                                                                       |
| `rank()`, `dense_rank()`, `row_number()`                                           | ✅ <br/>별칭: `denseRank()`                                                                                                                                                                                   |
| `percent_rank()` | ✅  데이터셋에서 파티션 내 값의 상대적인 순위를 효율적으로 계산합니다. 이 함수는 다음과 같은 더 장황하고 계산 비용이 큰 수동 SQL 계산식을 효과적으로 대체합니다: `ifNull((rank() OVER(PARTITION BY x ORDER BY y) - 1) / nullif(count(1) OVER(PARTITION BY x) - 1, 0), 0)` <br/>별칭: `percentRank()`| 
| `cume_dist()` | ✅  값 집합 내에서 특정 값의 누적 분포를 계산합니다. 현재 행의 값보다 작거나 같은 값을 가진 행의 비율(퍼센트)을 반환합니다. | 
| `lag/lead(value, offset)`                                                          | ✅ <br/> 다음과 같은 우회 방법도 사용할 수 있습니다:<br/> 1) `any(value) over (.... rows between <offset> preceding and <offset> preceding)` 또는 `lead`의 경우 `following` 사용 <br/> 2) 윈도우 프레임을 존중하는 `lagInFrame/leadInFrame` 사용. `lag/lead`와 동일한 동작을 얻으려면 `rows between unbounded preceding and unbounded following`을 사용하십시오.                                                                 |
| ntile(buckets) | ✅ <br/> 다음과 같이 윈도우를 지정하십시오: (partition by x order by y rows between unbounded preceding and unbounded following). |



## ClickHouse 전용 윈도우 함수 \{#clickhouse-specific-window-functions\}

다음과 같은 ClickHouse 전용 윈도우 함수도 제공됩니다:

### nonNegativeDerivative(metric_column, timestamp_column[, INTERVAL X UNITS]) \{#nonnegativederivativemetric_column-timestamp_column-interval-x-units\}

주어진 `metric_column`에 대해 `timestamp_column`을 기준으로 음이 아닌 미분값을 계산합니다.
`INTERVAL`은 생략 가능하며, 기본값은 `INTERVAL 1 SECOND`입니다.
각 행에 대해 계산되는 값은 다음과 같습니다:

- 첫 번째 행: `0`,
- $i$번째 행: ${\text{metric}_i - \text{metric}_{i-1} \over \text{timestamp}_i - \text{timestamp}_{i-1}}  * \text{interval}$.


## 구문 \{#syntax\}

```text
aggregate_function (column_name)
  OVER ([[PARTITION BY grouping_column] [ORDER BY sorting_column] 
        [ROWS or RANGE expression_to_bound_rows_withing_the_group]] | [window_name])
FROM table_name
WINDOW window_name as ([[PARTITION BY grouping_column] [ORDER BY sorting_column]])
```

* `PARTITION BY` - 결과 집합을 그룹으로 나누는 방식을 정의합니다.
* `ORDER BY` - 집계 함수(`aggregate_function`) 계산 시 그룹 내 행의 정렬 방식을 정의합니다.
* `ROWS or RANGE` - 프레임의 경계를 정의하며, 집계 함수(`aggregate_function`)는 해당 프레임 내에서 계산됩니다.
* `WINDOW` - 여러 식에서 동일한 윈도우 정의를 사용할 수 있도록 합니다.

```text
      PARTITION
┌─────────────────┐  <-- UNBOUNDED PRECEDING (BEGINNING of the PARTITION)
│                 │
│                 │
│=================│  <-- N PRECEDING  <─┐
│      N ROWS     │                     │  F
│  Before CURRENT │                     │  R
│~~~~~~~~~~~~~~~~~│  <-- CURRENT ROW    │  A
│     M ROWS      │                     │  M
│   After CURRENT │                     │  E
│=================│  <-- M FOLLOWING  <─┘
│                 │
│                 │
└─────────────────┘  <--- UNBOUNDED FOLLOWING (END of the PARTITION)
```

### 함수 \{#functions\}

이 함수들은 윈도우 함수로만 사용할 수 있습니다.

* [`row_number()`](./row_number.md) - 파티션 내에서 현재 행에 1부터 시작하는 번호를 매깁니다.
* [`first_value(x)`](./first_value.md) - 정렬된 프레임 내에서 처음으로 평가된 값을 반환합니다.
* [`last_value(x)`](./last_value.md) - 정렬된 프레임 내에서 마지막으로 평가된 값을 반환합니다.
* [`nth_value(x, offset)`](./nth_value.md) - 정렬된 프레임에서 n번째 행(offset)에 대해 평가된 첫 번째 NULL이 아닌 값을 반환합니다.
* [`rank()`](./rank.md) - 파티션 내에서 현재 행에 순위를 매기되, 순위 값 사이에 공백이 있을 수 있습니다.
* [`dense_rank()`](./dense_rank.md) - 파티션 내에서 현재 행에 순위를 매기되, 순위 값 사이에 공백이 없도록 합니다.
* [`lagInFrame(x)`](./lagInFrame.md) - 정렬된 프레임 내에서 현재 행 이전의 지정된 물리적 오프셋만큼 떨어진 행에서 평가된 값을 반환합니다.
* [`leadInFrame(x)`](./leadInFrame.md) - 정렬된 프레임 내에서 현재 행 이후의 지정된 오프셋만큼 떨어진 행에서 평가된 값을 반환합니다.


## 예시 \{#examples\}

윈도우 함수의 사용 방법을 몇 가지 예를 통해 살펴보겠습니다.

### 행 번호 매기기 \{#numbering-rows\}

```sql
CREATE TABLE salaries
(
    `team` String,
    `player` String,
    `salary` UInt32,
    `position` String
)
Engine = Memory;

INSERT INTO salaries FORMAT Values
    ('Port Elizabeth Barbarians', 'Gary Chen', 195000, 'F'),
    ('New Coreystad Archdukes', 'Charles Juarez', 190000, 'F'),
    ('Port Elizabeth Barbarians', 'Michael Stanley', 150000, 'D'),
    ('New Coreystad Archdukes', 'Scott Harrison', 150000, 'D'),
    ('Port Elizabeth Barbarians', 'Robert George', 195000, 'M');
```

```sql
SELECT
    player,
    salary,
    row_number() OVER (ORDER BY salary ASC) AS row
FROM salaries;
```

```text
┌─player──────────┬─salary─┬─row─┐
│ Michael Stanley │ 150000 │   1 │
│ Scott Harrison  │ 150000 │   2 │
│ Charles Juarez  │ 190000 │   3 │
│ Gary Chen       │ 195000 │   4 │
│ Robert George   │ 195000 │   5 │
└─────────────────┴────────┴─────┘
```

```sql
SELECT
    player,
    salary,
    row_number() OVER (ORDER BY salary ASC) AS row,
    rank() OVER (ORDER BY salary ASC) AS rank,
    dense_rank() OVER (ORDER BY salary ASC) AS denseRank
FROM salaries;
```

```text
┌─player──────────┬─salary─┬─row─┬─rank─┬─denseRank─┐
│ Michael Stanley │ 150000 │   1 │    1 │         1 │
│ Scott Harrison  │ 150000 │   2 │    1 │         1 │
│ Charles Juarez  │ 190000 │   3 │    3 │         2 │
│ Gary Chen       │ 195000 │   4 │    4 │         3 │
│ Robert George   │ 195000 │   5 │    4 │         3 │
└─────────────────┴────────┴─────┴──────┴───────────┘
```

### 집계 함수 \{#aggregation-functions\}

각 선수의 연봉을 팀 평균과 비교합니다.

```sql
SELECT
    player,
    salary,
    team,
    avg(salary) OVER (PARTITION BY team) AS teamAvg,
    salary - teamAvg AS diff
FROM salaries;
```

```text
┌─player──────────┬─salary─┬─team──────────────────────┬─teamAvg─┬───diff─┐
│ Charles Juarez  │ 190000 │ New Coreystad Archdukes   │  170000 │  20000 │
│ Scott Harrison  │ 150000 │ New Coreystad Archdukes   │  170000 │ -20000 │
│ Gary Chen       │ 195000 │ Port Elizabeth Barbarians │  180000 │  15000 │
│ Michael Stanley │ 150000 │ Port Elizabeth Barbarians │  180000 │ -30000 │
│ Robert George   │ 195000 │ Port Elizabeth Barbarians │  180000 │  15000 │
└─────────────────┴────────┴───────────────────────────┴─────────┴────────┘
```

각 선수의 연봉을 팀 내 최고 연봉과 비교합니다.

```sql
SELECT
    player,
    salary,
    team,
    max(salary) OVER (PARTITION BY team) AS teamMax,
    salary - teamMax AS diff
FROM salaries;
```


```text
┌─player──────────┬─salary─┬─team──────────────────────┬─teamMax─┬───diff─┐
│ Charles Juarez  │ 190000 │ New Coreystad Archdukes   │  190000 │      0 │
│ Scott Harrison  │ 150000 │ New Coreystad Archdukes   │  190000 │ -40000 │
│ Gary Chen       │ 195000 │ Port Elizabeth Barbarians │  195000 │      0 │
│ Michael Stanley │ 150000 │ Port Elizabeth Barbarians │  195000 │ -45000 │
│ Robert George   │ 195000 │ Port Elizabeth Barbarians │  195000 │      0 │
└─────────────────┴────────┴───────────────────────────┴─────────┴────────┘
```

### 컬럼별 파티셔닝 \{#partitioning-by-column\}

```sql
CREATE TABLE wf_partition
(
    `part_key` UInt64,
    `value` UInt64,
    `order` UInt64    
)
ENGINE = Memory;

INSERT INTO wf_partition FORMAT Values
   (1,1,1), (1,2,2), (1,3,3), (2,0,0), (3,0,0);

SELECT
    part_key,
    value,
    order,
    groupArray(value) OVER (PARTITION BY part_key) AS frame_values
FROM wf_partition
ORDER BY
    part_key ASC,
    value ASC;

┌─part_key─┬─value─┬─order─┬─frame_values─┐
│        1 │     1 │     1 │ [1,2,3]      │   <┐   
│        1 │     2 │     2 │ [1,2,3]      │    │  1-st group
│        1 │     3 │     3 │ [1,2,3]      │   <┘ 
│        2 │     0 │     0 │ [0]          │   <- 2-nd group
│        3 │     0 │     0 │ [0]          │   <- 3-d group
└──────────┴───────┴───────┴──────────────┘
```

### 프레임 경계 지정 \{#frame-bounding\}

```sql
CREATE TABLE wf_frame
(
    `part_key` UInt64,
    `value` UInt64,
    `order` UInt64
)
ENGINE = Memory;

INSERT INTO wf_frame FORMAT Values
   (1,1,1), (1,2,2), (1,3,3), (1,4,4), (1,5,5);
```

```sql
-- Frame is bounded by bounds of a partition (BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING)
SELECT
    part_key,
    value,
    order,
    groupArray(value) OVER (
        PARTITION BY part_key 
        ORDER BY order ASC
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    ) AS frame_values
FROM wf_frame
ORDER BY
    part_key ASC,
    value ASC;
    
┌─part_key─┬─value─┬─order─┬─frame_values─┐
│        1 │     1 │     1 │ [1,2,3,4,5]  │
│        1 │     2 │     2 │ [1,2,3,4,5]  │
│        1 │     3 │     3 │ [1,2,3,4,5]  │
│        1 │     4 │     4 │ [1,2,3,4,5]  │
│        1 │     5 │     5 │ [1,2,3,4,5]  │
└──────────┴───────┴───────┴──────────────┘
```


```sql
-- short form - no bound expression, no order by,
-- an equalent of `ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING`
SELECT
    part_key,
    value,
    order,
    groupArray(value) OVER (PARTITION BY part_key) AS frame_values_short,
    groupArray(value) OVER (PARTITION BY part_key
         ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    ) AS frame_values
FROM wf_frame
ORDER BY
    part_key ASC,
    value ASC;
┌─part_key─┬─value─┬─order─┬─frame_values_short─┬─frame_values─┐
│        1 │     1 │     1 │ [1,2,3,4,5]        │ [1,2,3,4,5]  │
│        1 │     2 │     2 │ [1,2,3,4,5]        │ [1,2,3,4,5]  │
│        1 │     3 │     3 │ [1,2,3,4,5]        │ [1,2,3,4,5]  │
│        1 │     4 │     4 │ [1,2,3,4,5]        │ [1,2,3,4,5]  │
│        1 │     5 │     5 │ [1,2,3,4,5]        │ [1,2,3,4,5]  │
└──────────┴───────┴───────┴────────────────────┴──────────────┘
```

```sql
-- frame is bounded by the beginning of a partition and the current row
SELECT
    part_key,
    value,
    order,
    groupArray(value) OVER (
        PARTITION BY part_key 
        ORDER BY order ASC
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS frame_values
FROM wf_frame
ORDER BY
    part_key ASC,
    value ASC;

┌─part_key─┬─value─┬─order─┬─frame_values─┐
│        1 │     1 │     1 │ [1]          │
│        1 │     2 │     2 │ [1,2]        │
│        1 │     3 │     3 │ [1,2,3]      │
│        1 │     4 │     4 │ [1,2,3,4]    │
│        1 │     5 │     5 │ [1,2,3,4,5]  │
└──────────┴───────┴───────┴──────────────┘
```

```sql
-- short form (frame is bounded by the beginning of a partition and the current row)
-- an equalent of `ORDER BY order ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`
SELECT
    part_key,
    value,
    order,
    groupArray(value) OVER (PARTITION BY part_key ORDER BY order ASC) AS frame_values_short,
    groupArray(value) OVER (PARTITION BY part_key ORDER BY order ASC
       ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS frame_values
FROM wf_frame
ORDER BY
    part_key ASC,
    value ASC;

┌─part_key─┬─value─┬─order─┬─frame_values_short─┬─frame_values─┐
│        1 │     1 │     1 │ [1]                │ [1]          │
│        1 │     2 │     2 │ [1,2]              │ [1,2]        │
│        1 │     3 │     3 │ [1,2,3]            │ [1,2,3]      │
│        1 │     4 │     4 │ [1,2,3,4]          │ [1,2,3,4]    │
│        1 │     5 │     5 │ [1,2,3,4,5]        │ [1,2,3,4,5]  │
└──────────┴───────┴───────┴────────────────────┴──────────────┘
```


```sql
-- frame is bounded by the beginning of a partition and the current row, but order is backward
SELECT
    part_key,
    value,
    order,
    groupArray(value) OVER (PARTITION BY part_key ORDER BY order DESC) AS frame_values
FROM wf_frame
ORDER BY
    part_key ASC,
    value ASC;

┌─part_key─┬─value─┬─order─┬─frame_values─┐
│        1 │     1 │     1 │ [5,4,3,2,1]  │
│        1 │     2 │     2 │ [5,4,3,2]    │
│        1 │     3 │     3 │ [5,4,3]      │
│        1 │     4 │     4 │ [5,4]        │
│        1 │     5 │     5 │ [5]          │
└──────────┴───────┴───────┴──────────────┘
```

```sql
-- sliding frame - 1 PRECEDING ROW AND CURRENT ROW
SELECT
    part_key,
    value,
    order,
    groupArray(value) OVER (
        PARTITION BY part_key 
        ORDER BY order ASC
        ROWS BETWEEN 1 PRECEDING AND CURRENT ROW
    ) AS frame_values
FROM wf_frame
ORDER BY
    part_key ASC,
    value ASC;

┌─part_key─┬─value─┬─order─┬─frame_values─┐
│        1 │     1 │     1 │ [1]          │
│        1 │     2 │     2 │ [1,2]        │
│        1 │     3 │     3 │ [2,3]        │
│        1 │     4 │     4 │ [3,4]        │
│        1 │     5 │     5 │ [4,5]        │
└──────────┴───────┴───────┴──────────────┘
```

```sql
-- sliding frame - ROWS BETWEEN 1 PRECEDING AND UNBOUNDED FOLLOWING 
SELECT
    part_key,
    value,
    order,
    groupArray(value) OVER (
        PARTITION BY part_key 
        ORDER BY order ASC
        ROWS BETWEEN 1 PRECEDING AND UNBOUNDED FOLLOWING
    ) AS frame_values
FROM wf_frame
ORDER BY
    part_key ASC,
    value ASC;

┌─part_key─┬─value─┬─order─┬─frame_values─┐
│        1 │     1 │     1 │ [1,2,3,4,5]  │
│        1 │     2 │     2 │ [1,2,3,4,5]  │
│        1 │     3 │     3 │ [2,3,4,5]    │
│        1 │     4 │     4 │ [3,4,5]      │
│        1 │     5 │     5 │ [4,5]        │
└──────────┴───────┴───────┴──────────────┘
```

```sql
-- row_number does not respect the frame, so rn_1 = rn_2 = rn_3 != rn_4
SELECT
    part_key,
    value,
    order,
    groupArray(value) OVER w1 AS frame_values,
    row_number() OVER w1 AS rn_1,
    sum(1) OVER w1 AS rn_2,
    row_number() OVER w2 AS rn_3,
    sum(1) OVER w2 AS rn_4
FROM wf_frame
WINDOW
    w1 AS (PARTITION BY part_key ORDER BY order DESC),
    w2 AS (
        PARTITION BY part_key 
        ORDER BY order DESC 
        ROWS BETWEEN 1 PRECEDING AND CURRENT ROW
    )
ORDER BY
    part_key ASC,
    value ASC;
```


┌─part&#95;key─┬─value─┬─order─┬─frame&#95;values─┬─rn&#95;1─┬─rn&#95;2─┬─rn&#95;3─┬─rn&#95;4─┐
│        1 │     1 │     1 │ [5,4,3,2,1]  │    5 │    5 │    5 │    2 │
│        1 │     2 │     2 │ [5,4,3,2]    │    4 │    4 │    4 │    2 │
│        1 │     3 │     3 │ [5,4,3]      │    3 │    3 │    3 │    2 │
│        1 │     4 │     4 │ [5,4]        │    2 │    2 │    2 │    2 │
│        1 │     5 │     5 │ [5]          │    1 │    1 │    1 │    1 │
└──────────┴───────┴───────┴──────────────┴──────┴──────┴──────┴──────┘

````

```sql
-- first_value and last_value respect the frame
SELECT
    groupArray(value) OVER w1 AS frame_values_1,
    first_value(value) OVER w1 AS first_value_1,
    last_value(value) OVER w1 AS last_value_1,
    groupArray(value) OVER w2 AS frame_values_2,
    first_value(value) OVER w2 AS first_value_2,
    last_value(value) OVER w2 AS last_value_2
FROM wf_frame
WINDOW
    w1 AS (PARTITION BY part_key ORDER BY order ASC),
    w2 AS (PARTITION BY part_key ORDER BY order ASC ROWS BETWEEN 1 PRECEDING AND CURRENT ROW)
ORDER BY
    part_key ASC,
    value ASC;

┌─frame_values_1─┬─first_value_1─┬─last_value_1─┬─frame_values_2─┬─first_value_2─┬─last_value_2─┐
│ [1]            │             1 │            1 │ [1]            │             1 │            1 │
│ [1,2]          │             1 │            2 │ [1,2]          │             1 │            2 │
│ [1,2,3]        │             1 │            3 │ [2,3]          │             2 │            3 │
│ [1,2,3,4]      │             1 │            4 │ [3,4]          │             3 │            4 │
│ [1,2,3,4,5]    │             1 │            5 │ [4,5]          │             4 │            5 │
└────────────────┴───────────────┴──────────────┴────────────────┴───────────────┴──────────────┘
````

```sql
-- second value within the frame
SELECT
    groupArray(value) OVER w1 AS frame_values_1,
    nth_value(value, 2) OVER w1 AS second_value
FROM wf_frame
WINDOW w1 AS (PARTITION BY part_key ORDER BY order ASC ROWS BETWEEN 3 PRECEDING AND CURRENT ROW)
ORDER BY
    part_key ASC,
    value ASC;

┌─frame_values_1─┬─second_value─┐
│ [1]            │            0 │
│ [1,2]          │            2 │
│ [1,2,3]        │            2 │
│ [1,2,3,4]      │            2 │
│ [2,3,4,5]      │            3 │
└────────────────┴──────────────┘
```

```sql
-- second value within the frame + Null for missing values
SELECT
    groupArray(value) OVER w1 AS frame_values_1,
    nth_value(toNullable(value), 2) OVER w1 AS second_value
FROM wf_frame
WINDOW w1 AS (PARTITION BY part_key ORDER BY order ASC ROWS BETWEEN 3 PRECEDING AND CURRENT ROW)
ORDER BY
    part_key ASC,
    value ASC;
```


┌─frame&#95;values&#95;1─┬─second&#95;value─┐
│ [1]            │         ᴺᵁᴸᴸ │
│ [1,2]          │            2 │
│ [1,2,3]        │            2 │
│ [1,2,3,4]      │            2 │
│ [2,3,4,5]      │            3 │
└────────────────┴──────────────┘

```
```


## 실제 사례 \{#real-world-examples\}

다음 예제들은 실제로 자주 발생하는 문제를 해결하는 방법을 보여줍니다.

### 부서별 최대/총 급여액 \{#maximumtotal-salary-per-department\}

```sql
CREATE TABLE employees
(
    `department` String,
    `employee_name` String,
    `salary` Float
)
ENGINE = Memory;

INSERT INTO employees FORMAT Values
   ('Finance', 'Jonh', 200),
   ('Finance', 'Joan', 210),
   ('Finance', 'Jean', 505),
   ('IT', 'Tim', 200),
   ('IT', 'Anna', 300),
   ('IT', 'Elen', 500);
```

```sql
SELECT
    department,
    employee_name AS emp,
    salary,
    max_salary_per_dep,
    total_salary_per_dep,
    round((salary / total_salary_per_dep) * 100, 2) AS `share_per_dep(%)`
FROM
(
    SELECT
        department,
        employee_name,
        salary,
        max(salary) OVER wndw AS max_salary_per_dep,
        sum(salary) OVER wndw AS total_salary_per_dep
    FROM employees
    WINDOW wndw AS (
        PARTITION BY department
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    )
    ORDER BY
        department ASC,
        employee_name ASC
);

┌─department─┬─emp──┬─salary─┬─max_salary_per_dep─┬─total_salary_per_dep─┬─share_per_dep(%)─┐
│ Finance    │ Jean │    505 │                505 │                  915 │            55.19 │
│ Finance    │ Joan │    210 │                505 │                  915 │            22.95 │
│ Finance    │ Jonh │    200 │                505 │                  915 │            21.86 │
│ IT         │ Anna │    300 │                500 │                 1000 │               30 │
│ IT         │ Elen │    500 │                500 │                 1000 │               50 │
│ IT         │ Tim  │    200 │                500 │                 1000 │               20 │
└────────────┴──────┴────────┴────────────────────┴──────────────────────┴──────────────────┘
```

### 누적 합 \{#cumulative-sum\}

```sql
CREATE TABLE warehouse
(
    `item` String,
    `ts` DateTime,
    `value` Float
)
ENGINE = Memory

INSERT INTO warehouse VALUES
    ('sku38', '2020-01-01', 9),
    ('sku38', '2020-02-01', 1),
    ('sku38', '2020-03-01', -4),
    ('sku1', '2020-01-01', 1),
    ('sku1', '2020-02-01', 1),
    ('sku1', '2020-03-01', 1);
```

```sql
SELECT
    item,
    ts,
    value,
    sum(value) OVER (PARTITION BY item ORDER BY ts ASC) AS stock_balance
FROM warehouse
ORDER BY
    item ASC,
    ts ASC;

┌─item──┬──────────────────ts─┬─value─┬─stock_balance─┐
│ sku1  │ 2020-01-01 00:00:00 │     1 │             1 │
│ sku1  │ 2020-02-01 00:00:00 │     1 │             2 │
│ sku1  │ 2020-03-01 00:00:00 │     1 │             3 │
│ sku38 │ 2020-01-01 00:00:00 │     9 │             9 │
│ sku38 │ 2020-02-01 00:00:00 │     1 │            10 │
│ sku38 │ 2020-03-01 00:00:00 │    -4 │             6 │
└───────┴─────────────────────┴───────┴───────────────┘
```

### 이동 / 슬라이딩 평균 (3행 기준) \{#moving--sliding-average-per-3-rows\}

```sql
CREATE TABLE sensors
(
    `metric` String,
    `ts` DateTime,
    `value` Float
)
ENGINE = Memory;
```


insert into sensors values(&#39;cpu&#95;temp&#39;, &#39;2020-01-01 00:00:00&#39;, 87),
(&#39;cpu&#95;temp&#39;, &#39;2020-01-01 00:00:01&#39;, 77),
(&#39;cpu&#95;temp&#39;, &#39;2020-01-01 00:00:02&#39;, 93),
(&#39;cpu&#95;temp&#39;, &#39;2020-01-01 00:00:03&#39;, 87),
(&#39;cpu&#95;temp&#39;, &#39;2020-01-01 00:00:04&#39;, 87),
(&#39;cpu&#95;temp&#39;, &#39;2020-01-01 00:00:05&#39;, 87),
(&#39;cpu&#95;temp&#39;, &#39;2020-01-01 00:00:06&#39;, 87),
(&#39;cpu&#95;temp&#39;, &#39;2020-01-01 00:00:07&#39;, 87);

````

```sql
SELECT
    metric,
    ts,
    value,
    avg(value) OVER (
        PARTITION BY metric 
        ORDER BY ts ASC 
        ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
    ) AS moving_avg_temp
FROM sensors
ORDER BY
    metric ASC,
    ts ASC;

┌─metric───┬──────────────────ts─┬─value─┬───moving_avg_temp─┐
│ cpu_temp │ 2020-01-01 00:00:00 │    87 │                87 │
│ cpu_temp │ 2020-01-01 00:00:01 │    77 │                82 │
│ cpu_temp │ 2020-01-01 00:00:02 │    93 │ 85.66666666666667 │
│ cpu_temp │ 2020-01-01 00:00:03 │    87 │ 85.66666666666667 │
│ cpu_temp │ 2020-01-01 00:00:04 │    87 │                89 │
│ cpu_temp │ 2020-01-01 00:00:05 │    87 │                87 │
│ cpu_temp │ 2020-01-01 00:00:06 │    87 │                87 │
│ cpu_temp │ 2020-01-01 00:00:07 │    87 │                87 │
└──────────┴─────────────────────┴───────┴───────────────────┘
````

### 이동/슬라이딩 평균(10초 기준) \{#moving--sliding-average-per-10-seconds\}

```sql
SELECT
    metric,
    ts,
    value,
    avg(value) OVER (PARTITION BY metric ORDER BY ts
      RANGE BETWEEN 10 PRECEDING AND CURRENT ROW) AS moving_avg_10_seconds_temp
FROM sensors
ORDER BY
    metric ASC,
    ts ASC;
    
┌─metric───┬──────────────────ts─┬─value─┬─moving_avg_10_seconds_temp─┐
│ cpu_temp │ 2020-01-01 00:00:00 │    87 │                         87 │
│ cpu_temp │ 2020-01-01 00:01:10 │    77 │                         77 │
│ cpu_temp │ 2020-01-01 00:02:20 │    93 │                         93 │
│ cpu_temp │ 2020-01-01 00:03:30 │    87 │                         87 │
│ cpu_temp │ 2020-01-01 00:04:40 │    87 │                         87 │
│ cpu_temp │ 2020-01-01 00:05:50 │    87 │                         87 │
│ cpu_temp │ 2020-01-01 00:06:00 │    87 │                         87 │
│ cpu_temp │ 2020-01-01 00:07:10 │    87 │                         87 │
└──────────┴─────────────────────┴───────┴────────────────────────────┘
```

### 이동 / 슬라이딩 평균(10일 단위) \{#moving--sliding-average-per-10-days\}

온도는 초 단위 정밀도로 저장되지만, `Range`와 `ORDER BY toDate(ts)`를 사용하여 크기가 10인 프레임을 구성하며, `toDate(ts)`로 인해 그 단위는 일(日) 단위가 됩니다.

```sql
CREATE TABLE sensors
(
    `metric` String,
    `ts` DateTime,
    `value` Float
)
ENGINE = Memory;
```


insert into sensors values(&#39;ambient&#95;temp&#39;, &#39;2020-01-01 00:00:00&#39;, 16),
(&#39;ambient&#95;temp&#39;, &#39;2020-01-01 12:00:00&#39;, 16),
(&#39;ambient&#95;temp&#39;, &#39;2020-01-02 11:00:00&#39;, 9),
(&#39;ambient&#95;temp&#39;, &#39;2020-01-02 12:00:00&#39;, 9),
(&#39;ambient&#95;temp&#39;, &#39;2020-02-01 10:00:00&#39;, 10),
(&#39;ambient&#95;temp&#39;, &#39;2020-02-01 12:00:00&#39;, 10),
(&#39;ambient&#95;temp&#39;, &#39;2020-02-10 12:00:00&#39;, 12),
(&#39;ambient&#95;temp&#39;, &#39;2020-02-10 13:00:00&#39;, 12),
(&#39;ambient&#95;temp&#39;, &#39;2020-02-20 12:00:01&#39;, 16),
(&#39;ambient&#95;temp&#39;, &#39;2020-03-01 12:00:00&#39;, 16),
(&#39;ambient&#95;temp&#39;, &#39;2020-03-01 12:00:00&#39;, 16),
(&#39;ambient&#95;temp&#39;, &#39;2020-03-01 12:00:00&#39;, 16);

````

```sql
SELECT
    metric,
    ts,
    value,
    round(avg(value) OVER (PARTITION BY metric ORDER BY toDate(ts) 
       RANGE BETWEEN 10 PRECEDING AND CURRENT ROW),2) AS moving_avg_10_days_temp
FROM sensors
ORDER BY
    metric ASC,
    ts ASC;

┌─metric───────┬──────────────────ts─┬─value─┬─moving_avg_10_days_temp─┐
│ ambient_temp │ 2020-01-01 00:00:00 │    16 │                      16 │
│ ambient_temp │ 2020-01-01 12:00:00 │    16 │                      16 │
│ ambient_temp │ 2020-01-02 11:00:00 │     9 │                    12.5 │
│ ambient_temp │ 2020-01-02 12:00:00 │     9 │                    12.5 │
│ ambient_temp │ 2020-02-01 10:00:00 │    10 │                      10 │
│ ambient_temp │ 2020-02-01 12:00:00 │    10 │                      10 │
│ ambient_temp │ 2020-02-10 12:00:00 │    12 │                      11 │
│ ambient_temp │ 2020-02-10 13:00:00 │    12 │                      11 │
│ ambient_temp │ 2020-02-20 12:00:01 │    16 │                   13.33 │
│ ambient_temp │ 2020-03-01 12:00:00 │    16 │                      16 │
│ ambient_temp │ 2020-03-01 12:00:00 │    16 │                      16 │
│ ambient_temp │ 2020-03-01 12:00:00 │    16 │                      16 │
└──────────────┴─────────────────────┴───────┴─────────────────────────┘
````


## 참고 자료 \{#references\}

### GitHub 이슈 \{#github-issues\}

윈도 함수에 대한 초기 지원 로드맵은 [이 이슈에 있습니다](https://github.com/ClickHouse/ClickHouse/issues/18097).

윈도 함수와 관련된 모든 GitHub 이슈에는 [comp-window-functions](https://github.com/ClickHouse/ClickHouse/labels/comp-window-functions) 태그가 지정되어 있습니다.

### 테스트 \{#tests\}

다음 테스트는 현재 지원되는 문법 예제를 포함합니다.

https://github.com/ClickHouse/ClickHouse/blob/master/tests/performance/window_functions.xml

https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/01591_window_functions.sql

### Postgres 문서 \{#postgres-docs\}

https://www.postgresql.org/docs/current/sql-select.html#SQL-WINDOW

https://www.postgresql.org/docs/devel/sql-expressions.html#SYNTAX-WINDOW-FUNCTIONS

https://www.postgresql.org/docs/devel/functions-window.html

https://www.postgresql.org/docs/devel/tutorial-window.html

### MySQL 문서 \{#mysql-docs\}

https://dev.mysql.com/doc/refman/8.0/en/window-function-descriptions.html

https://dev.mysql.com/doc/refman/8.0/en/window-functions-usage.html

https://dev.mysql.com/doc/refman/8.0/en/window-functions-frames.html



## 관련 콘텐츠 \{#related-content\}

- 블로그: [ClickHouse에서 시계열 데이터를 처리하는 방법](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
- 블로그: [Git 커밋 시퀀스를 위한 윈도 함수와 배열 함수](https://clickhouse.com/blog/clickhouse-window-array-functions-git-commits)
- 블로그: [ClickHouse로 데이터 가져오기 - 3부: S3 사용](https://clickhouse.com/blog/getting-data-into-clickhouse-part-3-s3)
