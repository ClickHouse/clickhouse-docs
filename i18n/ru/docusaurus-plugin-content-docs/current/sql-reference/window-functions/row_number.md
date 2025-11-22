---
description: 'Документация об оконной функции row_number'
sidebar_label: 'row_number'
sidebar_position: 2
slug: /sql-reference/window-functions/row_number
title: 'row_number'
doc_type: 'reference'
---

# row&#95;number

Нумерует текущую строку в рамках ее раздела, начиная с 1.

**Синтаксис**

```sql
row_number (column_name)
  OVER ([[PARTITION BY grouping_column] [ORDER BY sorting_column] 
        [ROWS or RANGE expression_to_bound_rows_withing_the_group]] | [window_name])
FROM table_name
WINDOW window_name as ([[PARTITION BY grouping_column] [ORDER BY sorting_column])
```

Более подробную информацию о синтаксисе оконных функций см. в разделе [Window Functions - Syntax](./index.md/#syntax).

**Возвращаемое значение**

* Число — номер текущей строки в её разделе. [UInt64](../data-types/int-uint.md).

**Пример**

Следующий пример основан на примере, представленном в видеоруководстве [Ranking window functions in ClickHouse](https://youtu.be/Yku9mmBYm_4?si=XIMu1jpYucCQEoXA).

Запрос:

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

Результат:

```response
   ┌─игрок───────────┬─зарплата─┬─номер_строки─┐
1. │ Gary Chen       │ 195000 │          1 │
2. │ Robert George   │ 195000 │          2 │
3. │ Charles Juarez  │ 190000 │          3 │
4. │ Scott Harrison  │ 150000 │          4 │
5. │ Michael Stanley │ 150000 │          5 │
   └─────────────────┴──────────┴──────────────┘
```
