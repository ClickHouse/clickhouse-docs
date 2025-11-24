---
'description': 'cume_dist 윈도우 함수에 대한 문서'
'sidebar_label': 'cume_dist'
'sidebar_position': 11
'slug': '/sql-reference/window-functions/cume_dist'
'title': 'cume_dist'
'doc_type': 'reference'
---


# cume_dist

값의 누적 분포를 그룹의 값들 내에서 계산합니다. 즉, 현재 행의 값보다 작거나 같은 값을 가진 행의 비율입니다. 파티션 내에서 값의 상대적인 위치를 판단하는 데 사용할 수 있습니다.

**구문**

```sql
cume_dist ()
  OVER ([[PARTITION BY grouping_column] [ORDER BY sorting_column]
        [RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING]] | [window_name])
FROM table_name
WINDOW window_name as ([PARTITION BY grouping_column] [ORDER BY sorting_column] RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING)
```

기본 및 필수 창 프레임 정의는 `RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING`입니다.

창 함수 구문에 대한 자세한 내용은 다음을 참조하십시오: [Window Functions - Syntax](./index.md/#syntax).

**반환 값**

- 현재 행의 상대적 순위입니다. 반환 타입은 [0, 1] 범위의 Float64입니다. [Float64](../data-types/float.md).

**예제**

다음 예제는 팀 내에서 급여의 누적 분포를 계산합니다:

쿼리:

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
    ('Port Elizabeth Barbarians', 'Robert George', 195000, 'M'),
    ('South Hampton Seagulls', 'Douglas Benson', 150000, 'M'),
    ('South Hampton Seagulls', 'James Henderson', 140000, 'M');
```

```sql
SELECT player, salary,
       cume_dist() OVER (ORDER BY salary DESC) AS cume_dist
FROM salaries;
```

결과:

```response
   ┌─player──────────┬─salary─┬───────────cume_dist─┐
1. │ Robert George   │ 195000 │  0.2857142857142857 │
2. │ Gary Chen       │ 195000 │  0.2857142857142857 │
3. │ Charles Juarez  │ 190000 │ 0.42857142857142855 │
4. │ Douglas Benson  │ 150000 │  0.8571428571428571 │
5. │ Michael Stanley │ 150000 │  0.8571428571428571 │
6. │ Scott Harrison  │ 150000 │  0.8571428571428571 │
7. │ James Henderson │ 140000 │                   1 │
   └─────────────────┴────────┴─────────────────────┘
```

**구현 세부정보**

`cume_dist()` 함수는 다음 공식을 사용하여 상대 위치를 계산합니다:

```text
cume_dist = (number of rows ≤ current row value) / (total number of rows in partition)
```

동일한 값(피어)을 가진 행은 같은 누적 분포 값을 받으며, 이는 피어 그룹의 가장 높은 위치에 해당합니다.
