---
description: 'first_value 윈도우 함수 문서'
sidebar_label: 'first_value'
sidebar_position: 3
slug: /sql-reference/window-functions/first_value
title: 'first_value'
doc_type: 'reference'
---

# first_value \{#first_value\}

정렬된 프레임 내에서 평가되는 첫 번째 값을 반환합니다. 기본적으로 NULL 인수는 건너뛰지만, `RESPECT NULLS` 수정자를 사용하면 이 동작을 변경할 수 있습니다.

**Syntax**

```sql
first_value (column_name) [[RESPECT NULLS] | [IGNORE NULLS]]
  OVER ([[PARTITION BY grouping_column] [ORDER BY sorting_column] 
        [ROWS or RANGE expression_to_bound_rows_withing_the_group]] | [window_name])
FROM table_name
WINDOW window_name as ([PARTITION BY grouping_column] [ORDER BY sorting_column])
```

별칭: `any`.

:::note
선택적 수정자 `RESPECT NULLS`를 `first_value(column_name)` 뒤에 사용하면 `NULL` 인수가 건너뛰어지지 않도록 보장합니다.
자세한 내용은 [NULL 처리](../aggregate-functions/index.md/#null-processing)를 참조하십시오.

별칭: `firstValueRespectNulls`
:::

윈도우 함수 구문에 대한 자세한 내용은 [Window Functions - Syntax](./index.md/#syntax)를 참조하십시오.

**반환 값**

* 정렬된 프레임 내에서 평가되는 첫 번째 값입니다.

**예제**

이 예제에서는 가상의 프리미어 리그 축구 선수 연봉 데이터셋에서 가장 높은 연봉을 받는 선수를 찾기 위해 `first_value` 함수를 사용합니다.

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

INSERT INTO salaries FORMAT VALUES
    ('Port Elizabeth Barbarians', 'Gary Chen', 196000, 'F'),
    ('New Coreystad Archdukes', 'Charles Juarez', 190000, 'F'),
    ('Port Elizabeth Barbarians', 'Michael Stanley', 100000, 'D'),
    ('New Coreystad Archdukes', 'Scott Harrison', 180000, 'D'),
    ('Port Elizabeth Barbarians', 'Robert George', 195000, 'M'),
    ('South Hampton Seagulls', 'Douglas Benson', 150000, 'M'),
    ('South Hampton Seagulls', 'James Henderson', 140000, 'M');
```

```sql
SELECT player, salary, 
       first_value(player) OVER (ORDER BY salary DESC) AS highest_paid_player
FROM salaries;
```

결과:

```response
   ┌─player──────────┬─salary─┬─highest_paid_player─┐
1. │ Gary Chen       │ 196000 │ Gary Chen           │
2. │ Robert George   │ 195000 │ Gary Chen           │
3. │ Charles Juarez  │ 190000 │ Gary Chen           │
4. │ Scott Harrison  │ 180000 │ Gary Chen           │
5. │ Douglas Benson  │ 150000 │ Gary Chen           │
6. │ James Henderson │ 140000 │ Gary Chen           │
7. │ Michael Stanley │ 100000 │ Gary Chen           │
   └─────────────────┴────────┴─────────────────────┘
```
