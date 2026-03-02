---
description: 'row_number 윈도우 함수 문서'
sidebar_label: 'row_number'
sidebar_position: 2
slug: /sql-reference/window-functions/row_number
title: 'row_number'
doc_type: 'reference'
---

# row_number \{#row_number\}

현재 파티션 내에서 현재 행에 1부터 번호를 매깁니다.

**구문**

```sql
row_number (column_name)
  OVER ([[PARTITION BY grouping_column] [ORDER BY sorting_column] 
        [ROWS or RANGE expression_to_bound_rows_withing_the_group]] | [window_name])
FROM table_name
WINDOW window_name as ([[PARTITION BY grouping_column] [ORDER BY sorting_column])
```

윈도우 함수 구문에 대한 자세한 내용은 [Window Functions - Syntax](./index.md/#syntax)를 참조하십시오.

**반환 값**

* 파티션 내에서 현재 행의 번호입니다. 타입은 [UInt64](../data-types/int-uint.md)입니다.

**예시**

다음 예시는 동영상 강의 [Ranking window functions in ClickHouse](https://youtu.be/Yku9mmBYm_4?si=XIMu1jpYucCQEoXA)에서 제공된 예시를 기반으로 합니다.

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
    ('Port Elizabeth Barbarians', 'Robert George', 195000, 'M');
```

```sql
SELECT player, salary, 
       row_number() OVER (ORDER BY salary DESC) AS row_number
FROM salaries;
```

결과:

```response
   ┌─player──────────┬─salary─┬─row_number─┐
1. │ Gary Chen       │ 195000 │          1 │
2. │ Robert George   │ 195000 │          2 │
3. │ Charles Juarez  │ 190000 │          3 │
4. │ Scott Harrison  │ 150000 │          4 │
5. │ Michael Stanley │ 150000 │          5 │
   └─────────────────┴────────┴────────────┘
```
