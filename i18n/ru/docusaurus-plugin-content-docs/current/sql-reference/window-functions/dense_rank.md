---
slug: /sql-reference/window-functions/dense_rank
sidebar_label: 'dense_rank'
sidebar_position: 7
---


# dense_rank

Ранжирует текущую строку в пределах своей партиции без пропусков. Другими словами, если значение любой новой строки, встреченной в процессе ранжирования, равно значению одной из предыдущих строк, то она получит следующий последовательный ранг без пропусков в ранжировании.

Функция [rank](./rank.md) предоставляет аналогичное поведение, но с пропусками в ранжировании.

**Синтаксис**

Псевдоним: `denseRank` (чувствительно к регистру)

```sql
dense_rank ()
  OVER ([[PARTITION BY grouping_column] [ORDER BY sorting_column]
        [ROWS или RANGE expression_to_bound_rows_withing_the_group]] | [window_name])
FROM table_name
WINDOW window_name as ([[PARTITION BY grouping_column] [ORDER BY sorting_column])
```

Для получения более детальной информации о синтаксисе оконных функций см.: [Оконные функции - Синтаксис](./index.md/#syntax).

**Возвращаемое значение**

- Число для текущей строки в пределах своей партиции, без пропусков в ранжировании. [UInt64](../data-types/int-uint.md).

**Пример**

Следующий пример основан на примере, приведенном в видеоинструкции [Ранжирование оконных функций в ClickHouse](https://youtu.be/Yku9mmBYm_4?si=XIMu1jpYucCQEoXA).

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
