---
'description': 'nth_value 윈도우 함수에 대한 문서'
'sidebar_label': 'nth_value'
'sidebar_position': 5
'slug': '/sql-reference/window-functions/nth_value'
'title': 'nth_value'
'doc_type': 'reference'
---


# nth_value

n번째 행(오프셋)에 대해 평가된 첫 번째 비-NULL 값을 반환합니다.

**구문**

```sql
nth_value (x, offset)
  OVER ([[PARTITION BY grouping_column] [ORDER BY sorting_column] 
        [ROWS or RANGE expression_to_bound_rows_withing_the_group]] | [window_name])
FROM table_name
WINDOW window_name as ([[PARTITION BY grouping_column] [ORDER BY sorting_column])
```

윈도우 함수 구문에 대한 자세한 내용은 다음을 참조하세요: [Window Functions - Syntax](./index.md/#syntax).

**매개변수**

- `x` — 컬럼 이름.
- `offset` — 현재 행을 기준으로 평가할 n번째 행.

**반환 값**

- 정렬된 프레임 내에서 n번째 행(오프셋)에 대해 평가된 첫 번째 비-NULL 값.

**예제**

이 예제에서는 `nth-value` 함수를 사용하여 프리미어 리그 축구 선수들의 임금 데이터셋에서 세 번째로 높은 급여를 찾습니다.

쿼리:

```sql
DROP TABLE IF EXISTS salaries;
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
    ('Port Elizabeth Barbarians', 'Michael Stanley', 100000, 'D'),
    ('New Coreystad Archdukes', 'Scott Harrison', 180000, 'D'),
    ('Port Elizabeth Barbarians', 'Robert George', 195000, 'M'),
    ('South Hampton Seagulls', 'Douglas Benson', 150000, 'M'),
    ('South Hampton Seagulls', 'James Henderson', 140000, 'M');
```

```sql
SELECT player, salary, nth_value(player,3) OVER(ORDER BY salary DESC) AS third_highest_salary FROM salaries;
```

결과:

```response
   ┌─player──────────┬─salary─┬─third_highest_salary─┐
1. │ Gary Chen       │ 195000 │                      │
2. │ Robert George   │ 195000 │                      │
3. │ Charles Juarez  │ 190000 │ Charles Juarez       │
4. │ Scott Harrison  │ 180000 │ Charles Juarez       │
5. │ Douglas Benson  │ 150000 │ Charles Juarez       │
6. │ James Henderson │ 140000 │ Charles Juarez       │
7. │ Michael Stanley │ 100000 │ Charles Juarez       │
   └─────────────────┴────────┴──────────────────────┘
```
