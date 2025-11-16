---
'description': 'dense_rank 윈도우 함수에 대한 Documentation'
'sidebar_label': 'dense_rank'
'sidebar_position': 7
'slug': '/sql-reference/window-functions/dense_rank'
'title': 'dense_rank'
'doc_type': 'reference'
---


# dense_rank

자신의 파티션 내에서 현재 행의 순위를 격차 없이 매깁니다. 즉, 새로 발견된 행의 값이 이전 행 중 하나의 값과 같다면, 순위에 격차 없이 다음 순위를 부여받습니다.

[rank](./rank.md) 함수는 동일한 동작을 제공하지만, 순위에 격차가 있습니다.

**구문**

별칭: `denseRank` (대소문자 구분)

```sql
dense_rank ()
  OVER ([[PARTITION BY grouping_column] [ORDER BY sorting_column]
        [ROWS or RANGE expression_to_bound_rows_withing_the_group]] | [window_name])
FROM table_name
WINDOW window_name as ([[PARTITION BY grouping_column] [ORDER BY sorting_column])
```

창 함수 구문에 대한 자세한 내용은 다음을 참조하세요: [Window Functions - Syntax](./index.md/#syntax).

**반환 값**

- 순위에 격차 없이 자신의 파티션 내에서 현재 행에 대한 숫자. [UInt64](../data-types/int-uint.md).

**예시**

다음 예시는 비디오 교육 [Ranking window functions in ClickHouse](https://youtu.be/Yku9mmBYm_4?si=XIMu1jpYucCQEoXA)에서 제공된 예제를 기반으로 합니다.

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
       dense_rank() OVER (ORDER BY salary DESC) AS dense_rank
FROM salaries;
```

결과:

```response
   ┌─player──────────┬─salary─┬─dense_rank─┐
1. │ Gary Chen       │ 195000 │          1 │
2. │ Robert George   │ 195000 │          1 │
3. │ Charles Juarez  │ 190000 │          2 │
4. │ Michael Stanley │ 150000 │          3 │
5. │ Douglas Benson  │ 150000 │          3 │
6. │ Scott Harrison  │ 150000 │          3 │
7. │ James Henderson │ 140000 │          4 │
   └─────────────────┴────────┴────────────┘
```
