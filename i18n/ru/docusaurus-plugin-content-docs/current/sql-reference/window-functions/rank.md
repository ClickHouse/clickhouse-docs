---
description: 'Документация по оконной функции rank'
sidebar_label: 'rank'
sidebar_position: 6
slug: /sql-reference/window-functions/rank
title: 'rank'
doc_type: 'reference'
---

# rank

Присваивает текущей строке ранг в пределах её раздела с пропусками в последовательности рангов. Другими словами, если значение обрабатываемой строки равно значению предыдущей строки, то она получит тот же ранг, что и предыдущая строка.
Ранг следующей строки равен рангу предыдущей плюс величина разрыва, равная количеству присвоений предыдущего ранга.

Функция [dense&#95;rank](./dense_rank.md) обеспечивает аналогичное поведение, но без пропусков в ранжировании.

**Синтаксис**

```sql
rank ()
  OVER ([[PARTITION BY столбец_группировки] [ORDER BY столбец_сортировки]
        [ROWS или RANGE выражение_для_ограничения_строк_внутри_группы]] | [имя_окна])
FROM имя_таблицы
WINDOW имя_окна as ([[PARTITION BY столбец_группировки] [ORDER BY столбец_сортировки])
```

Подробное описание синтаксиса оконных функций см. в разделе: [Window Functions - Syntax](./index.md/#syntax).

**Возвращаемое значение**

* Число для текущей строки в пределах её/своего раздела, с сохранением пропусков. [UInt64](../data-types/int-uint.md).

**Пример**

Следующий пример основан на примере из обучающего видеоролика [Ranking window functions in ClickHouse](https://youtu.be/Yku9mmBYm_4?si=XIMu1jpYucCQEoXA).

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
