---
slug: '/sql-reference/window-functions/rank'
sidebar_label: rank
sidebar_position: 6
description: 'Документация для функции оконного ранга'
title: rank
doc_type: reference
---
# rank

Ранжирует текущую строку в пределах её партиции с пропусками. Иными словами, если значение любой строки, с которой она сталкивается, равно значению предыдущей строки, то она получит такой же ранг, как и эта предыдущая строка. Ранг следующей строки равен рангу предыдущей строки плюс пропуск, равный количеству раз, когда был присвоен предыдущий ранг.

Функция [dense_rank](./dense_rank.md) обеспечивает такое же поведение, но без пропусков в ранжировании.

**Синтаксис**

```sql
rank ()
  OVER ([[PARTITION BY grouping_column] [ORDER BY sorting_column]
        [ROWS or RANGE expression_to_bound_rows_withing_the_group]] | [window_name])
FROM table_name
WINDOW window_name as ([[PARTITION BY grouping_column] [ORDER BY sorting_column])
```

Для получения более подробной информации о синтаксисе оконных функций смотрите: [Оконные функции - Синтаксис](./index.md/#syntax).

**Возвращаемое значение**

- Число для текущей строки в пределах её партиции, включая пропуски. [UInt64](../data-types/int-uint.md).

**Пример**

Следующий пример основан на примере, предоставленном в видеоинструкции [Ранжирование оконных функций в ClickHouse](https://youtu.be/Yku9mmBYm_4?si=XIMu1jpYucCQEoXA).

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
    ('Port Elizabeth Barbarians', 'Robert George', 195000, 'M'),
    ('South Hampton Seagulls', 'Douglas Benson', 150000, 'M'),
    ('South Hampton Seagulls', 'James Henderson', 140000, 'M');
```

```sql
SELECT player, salary,
       rank() OVER (ORDER BY salary DESC) AS rank
FROM salaries;
```

Результат:

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