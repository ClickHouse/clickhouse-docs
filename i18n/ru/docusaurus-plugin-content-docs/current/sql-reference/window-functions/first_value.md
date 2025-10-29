---
slug: '/sql-reference/window-functions/first_value'
sidebar_label: first_value
sidebar_position: 3
description: 'Документация для функции окон first_value'
title: first_value
doc_type: reference
---
# first_value

Возвращает первое значение, вычисленное в рамках своего упорядоченного фрейма. По умолчанию NULL-аргументы пропускаются, однако модификатор `RESPECT NULLS` может быть использован для отмены этого поведения.

**Синтаксис**

```sql
first_value (column_name) [[RESPECT NULLS] | [IGNORE NULLS]]
  OVER ([[PARTITION BY grouping_column] [ORDER BY sorting_column] 
        [ROWS or RANGE expression_to_bound_rows_withing_the_group]] | [window_name])
FROM table_name
WINDOW window_name as ([PARTITION BY grouping_column] [ORDER BY sorting_column])
```

Псевдоним: `any`.

:::note
Использование дополнительного модификатора `RESPECT NULLS` после `first_value(column_name)` гарантирует, что аргументы `NULL` не будут пропущены.
Смотрите [Обработка NULL](../aggregate-functions/index.md/#null-processing) для получения дополнительной информации.

Псевдоним: `firstValueRespectNulls`
:::

Для более подробной информации о синтаксисе оконных функций смотрите: [Оконные функции - Синтаксис](./index.md/#syntax).

**Возвращаемое значение**

- Первое значение, вычисленное в рамках его упорядоченного фрейма.

**Пример**

В этом примере функция `first_value` используется для нахождения самого высокооплачиваемого футболиста на основе вымышленного набора данных о зарплатах футболистов Премьер-лиги.

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
       first_value(player) OVER (ORDER BY salary DESC) AS highest_paid_player
FROM salaries;
```

Результат:

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