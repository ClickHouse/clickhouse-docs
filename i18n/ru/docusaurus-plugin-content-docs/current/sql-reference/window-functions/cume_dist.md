---
description: 'Документация об оконной функции cume_dist'
sidebar_label: 'cume_dist'
sidebar_position: 11
slug: /sql-reference/window-functions/cume_dist
title: 'cume_dist'
doc_type: 'reference'
---

# cume&#95;dist

Вычисляет накопленное распределение значения в группе значений, то есть процент строк со значениями, меньшими или равными значению текущей строки. Может использоваться для определения относительного положения значения внутри секции (partition).

**Синтаксис**

```sql
cume_dist ()
  OVER ([[PARTITION BY grouping_column] [ORDER BY sorting_column]
        [RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING]] | [window_name])
FROM table_name
WINDOW window_name as ([PARTITION BY grouping_column] [ORDER BY sorting_column] RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING)
```

Определение фрейма окна по умолчанию (и одновременно обязательное): `RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING`.

Подробнее о синтаксисе оконных функций см. в разделе [Window Functions - Syntax](./index.md/#syntax).

**Возвращаемое значение**

* Относительный ранг текущей строки. Тип возвращаемого значения — Float64 в диапазоне [0, 1]. [Float64](../data-types/float.md).

**Пример**

В следующем примере вычисляется кумулятивное распределение зарплат внутри команды:

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
       cume_dist() OVER (ORDER BY salary DESC) AS cume_dist
FROM salaries;
```

Результат:

```response
   ┌─игрок───────────┬─зарплата─┬───────────cume_dist─┐
1. │ Robert George   │ 195000 │  0.2857142857142857 │
2. │ Gary Chen       │ 195000 │  0.2857142857142857 │
3. │ Charles Juarez  │ 190000 │ 0.42857142857142855 │
4. │ Douglas Benson  │ 150000 │  0.8571428571428571 │
5. │ Michael Stanley │ 150000 │  0.8571428571428571 │
6. │ Scott Harrison  │ 150000 │  0.8571428571428571 │
7. │ James Henderson │ 140000 │                   1 │
   └─────────────────┴──────────┴─────────────────────┘
```

**Детали реализации**

Функция `cume_dist()` вычисляет относительное положение по следующей формуле:

```text
cume_dist = (количество строк ≤ значению текущей строки) / (общее количество строк в партиции)
```

Строки с одинаковыми значениями (пиры) получают одинаковое значение кумулятивного распределения, которое соответствует наибольшей позиции в группе пиров.
