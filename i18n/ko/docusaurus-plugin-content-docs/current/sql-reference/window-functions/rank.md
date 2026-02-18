---
description: 'rank 윈도우 함수 문서'
sidebar_label: 'rank'
sidebar_position: 6
slug: /sql-reference/window-functions/rank
title: 'rank'
doc_type: 'reference'
---

# rank \{#rank\}

현재 파티션 내에서 현재 행의 순위를, 중간 순위가 건너뛰어지는(비어 있는) 방식으로 매깁니다. 다시 말해, 읽어 들인 어떤 행의 값이 이전 행의 값과 같다면, 해당 행은 그 이전 행과 동일한 순위를 받습니다.
그 다음 행의 순위는 이전 행의 순위에, 그 이전 순위가 부여된 횟수만큼의 간격을 더한 값이 됩니다.

[dense&#95;rank](./dense_rank.md) 함수는 순위를 매기는 방식은 동일하지만, 중간에 순위가 비지 않도록 동작합니다.

**구문**

```sql
rank ()
  OVER ([[PARTITION BY grouping_column] [ORDER BY sorting_column]
        [ROWS or RANGE expression_to_bound_rows_withing_the_group]] | [window_name])
FROM table_name
WINDOW window_name as ([[PARTITION BY grouping_column] [ORDER BY sorting_column])
```

윈도우 함수 구문에 대한 자세한 내용은 다음을 참조하십시오: [Window Functions - Syntax](./index.md/#syntax).

**반환 값**

* 파티션 내 현재 행에 대한 번호이며, 값 사이의 공백(갭)도 포함합니다. [UInt64](../data-types/int-uint.md).

**예시**

다음 예시는 동영상 강의 [Ranking window functions in ClickHouse](https://youtu.be/Yku9mmBYm_4?si=XIMu1jpYucCQEoXA)에 제공된 예시를 기반으로 합니다.

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
