---
'description': 'rank 윈도우 함수에 대한 Documentation'
'sidebar_label': '랭크'
'sidebar_position': 6
'slug': '/sql-reference/window-functions/rank'
'title': '랭크'
'doc_type': 'reference'
---


# rank

현재 행을 파티션 내에서 갭이 있는 상태로 순위 매깁니다. 다시 말해, 만약 어떤 행의 값이 이전 행의 값과 같다면, 그 행은 이전 행과 동일한 순위를 부여받습니다. 다음 행의 순위는 이전 행의 순위에 이전 순위가 부여된 횟수만큼의 갭을 더한 값이 됩니다.

[dense_rank](./dense_rank.md) 함수는 순위에서 갭이 없는 동일한 동작을 제공합니다.

**구문**

```sql
rank ()
  OVER ([[PARTITION BY grouping_column] [ORDER BY sorting_column]
        [ROWS or RANGE expression_to_bound_rows_withing_the_group]] | [window_name])
FROM table_name
WINDOW window_name as ([[PARTITION BY grouping_column] [ORDER BY sorting_column])
```

윈도우 함수 구문에 대한 자세한 내용은 다음을 참조하세요: [윈도우 함수 - 구문](./index.md/#syntax).

**반환 값**

- 갭을 포함하여 파티션 내의 현재 행에 대한 숫자입니다. [UInt64](../data-types/int-uint.md).

**예시**

다음 예시는 비디오 교육 [ClickHouse의 순위 윈도우 함수](https://youtu.be/Yku9mmBYm_4?si=XIMu1jpYucCQEoXA)에서 제공된 예제를 기반으로 합니다.

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
       rank() OVER (ORDER BY salary DESC) AS rank
FROM salaries;
```

결과:

```response
   ┌─player──────────┬─salary─┬─rank─┐
1. │ Gary Chen       │ 195000 │    1 │
2. │ Robert George   │ 195000 │    1 │
3. │ Charles Juarez  │ 190000 │    3 │
4. │ Douglas Benson  │ 150000 │    4 │
5. │ Michael Stanley │ 150000 │    4 │
6. │ Scott Harrison  │ 150000 │    4 │
7. │ James Henderson │ 140000 │    7 │
   └─────────────────┴────────┴──────┘
```
