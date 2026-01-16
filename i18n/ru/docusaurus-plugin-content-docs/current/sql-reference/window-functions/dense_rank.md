---
description: 'Документация об оконной функции dense_rank'
sidebar_label: 'dense_rank'
sidebar_position: 7
slug: /sql-reference/window-functions/dense_rank
title: 'dense_rank'
doc_type: 'reference'
---

# dense&#95;rank \\{#dense&#95;rank\\}

Присваивает текущей строке ранг внутри её раздела без пропусков. Иными словами, если значение любой новой строки совпадает со значением одной из предыдущих строк, то она получит следующий по порядку ранг без каких-либо пропусков в ранжировании.

Функция [rank](./rank.md) реализует то же поведение, но с пропусками в ранжировании.

**Синтаксис**

Псевдоним: `denseRank` (чувствительно к регистру)

```sql
dense_rank ()
  OVER ([[PARTITION BY grouping_column] [ORDER BY sorting_column]
        [ROWS or RANGE expression_to_bound_rows_withing_the_group]] | [window_name])
FROM table_name
WINDOW window_name as ([[PARTITION BY grouping_column] [ORDER BY sorting_column])
```

Подробности о синтаксисе оконных функций см. в разделе [Window Functions - Syntax](./index.md/#syntax).

**Возвращаемое значение**

* Число для текущей строки в своем разделе, без пропусков в ранжировании. [UInt64](../data-types/int-uint.md).

**Пример**

Следующий пример основан на примере, приведённом в видеоинструкции [Ranking window functions in ClickHouse](https://youtu.be/Yku9mmBYm_4?si=XIMu1jpYucCQEoXA).

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
       dense_rank() OVER (ORDER BY salary DESC) AS dense_rank
FROM salaries;
```

Результат:

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
