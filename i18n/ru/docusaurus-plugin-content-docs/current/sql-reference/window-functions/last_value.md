---
slug: '/sql-reference/window-functions/last_value'
sidebar_label: last_value
sidebar_position: 4
description: 'Документация для функции окон last_value'
title: last_value
doc_type: reference
---
# last_value

Возвращает последнее значение, оцененное в своем упорядоченном фрейме. По умолчанию аргументы NULL пропускаются, однако модификатор `RESPECT NULLS` может быть использован для переопределения этого поведения.

**Синтаксис**

```sql
last_value (column_name) [[RESPECT NULLS] | [IGNORE NULLS]]
  OVER ([[PARTITION BY grouping_column] [ORDER BY sorting_column] 
        [ROWS or RANGE expression_to_bound_rows_withing_the_group]] | [window_name])
FROM table_name
WINDOW window_name as ([[PARTITION BY grouping_column] [ORDER BY sorting_column])
```

Псевдоним: `anyLast`.

:::note
Использование необязательного модификатора `RESPECT NULLS` после `first_value(column_name)` обеспечит пропуск NULL аргументов.
Смотрите [Обработка NULL](../aggregate-functions/index.md/#null-processing) для получения дополнительной информации.

Псевдоним: `lastValueRespectNulls`
:::

Для получения подробной информации о синтаксисе оконных функций смотрите: [Оконные функции - Синтаксис](./index.md/#syntax).

**Возвращаемое значение**

- Последнее значение, оцененное в своем упорядоченном фрейме.

**Пример**

В этом примере функция `last_value` используется для нахождения наименее оплачиваемого футболиста из вымышленного набора данных зарплат футболистов Премьер-лиги.

Запрос:

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
       last_value(player) OVER (ORDER BY salary DESC RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS lowest_paid_player
FROM salaries;
```

Результат:

```response
   ┌─player──────────┬─salary─┬─lowest_paid_player─┐
1. │ Gary Chen       │ 196000 │ Michael Stanley    │
2. │ Robert George   │ 195000 │ Michael Stanley    │
3. │ Charles Juarez  │ 190000 │ Michael Stanley    │
4. │ Scott Harrison  │ 180000 │ Michael Stanley    │
5. │ Douglas Benson  │ 150000 │ Michael Stanley    │
6. │ James Henderson │ 140000 │ Michael Stanley    │
7. │ Michael Stanley │ 100000 │ Michael Stanley    │
   └─────────────────┴────────┴────────────────────┘
```