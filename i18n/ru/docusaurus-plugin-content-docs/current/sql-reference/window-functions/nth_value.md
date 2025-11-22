---
description: 'Документация по оконной функции nth_value'
sidebar_label: 'nth_value'
sidebar_position: 5
slug: /sql-reference/window-functions/nth_value
title: 'nth_value'
doc_type: 'reference'
---

# nth&#95;value

Возвращает первое значение, отличное от NULL, вычисленное для n-й строки (смещения) в упорядоченном фрейме.

**Синтаксис**

```sql
nth_value (x, offset)
  OVER ([[PARTITION BY столбец_группировки] [ORDER BY столбец_сортировки] 
        [ROWS или RANGE выражение_ограничения_строк_в_группе]] | [имя_окна])
FROM имя_таблицы
WINDOW имя_окна as ([[PARTITION BY столбец_группировки] [ORDER BY столбец_сортировки])
```

Более подробно о синтаксисе оконных функций см.: [Window Functions - Syntax](./index.md/#syntax).

**Параметры**

* `x` — имя столбца.
* `offset` — номер строки (n-я строка), относительно которой вычисляется текущая строка.

**Возвращаемое значение**

* Первое значение, не равное NULL, вычисленное относительно n-й строки (`offset`) в ее упорядоченном окне.

**Пример**

В этом примере функция `nth-value` используется для поиска третьей по величине зарплаты во вымышленном наборе данных о зарплатах футболистов Премьер-лиги.

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

INSERT INTO salaries FORMAT Values
    ('Port Elizabeth Barbarians', 'Gary Chen', 195000, 'F'),
    ('New Coreystad Archdukes', 'Charles Juarez', 190000, 'F'),
    ('Port Elizabeth Barbarians', 'Michael Stanley', 100000, 'D'),
    ('New Coreystad Archdukes', 'Scott Harrison', 180000, 'D'),
    ('Port Elizabeth Barbarians', 'Robert George', 195000, 'M'),
    ('South Hampton Seagulls', 'Douglas Benson', 150000, 'M'),
    ('South Hampton Seagulls', 'James Henderson', 140000, 'M');
```

```sql
SELECT player, salary, nth_value(player,3) OVER(ORDER BY salary DESC) AS third_highest_salary FROM salaries;
```

Результат:

```response
   ┌─player──────────┬─salary─┬─third_highest_salary─┐
1. │ Gary Chen       │ 195000 │                      │
2. │ Robert George   │ 195000 │                      │
3. │ Charles Juarez  │ 190000 │ Charles Juarez       │
4. │ Scott Harrison  │ 180000 │ Charles Juarez       │
5. │ Douglas Benson  │ 150000 │ Charles Juarez       │
6. │ James Henderson │ 140000 │ Charles Juarez       │
7. │ Michael Stanley │ 100000 │ Charles Juarez       │
   └─────────────────┴────────┴──────────────────────┘
```
