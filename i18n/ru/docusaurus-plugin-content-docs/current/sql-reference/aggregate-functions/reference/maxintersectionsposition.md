---
description: 'Агрегатная функция, вычисляющая позиции вхождений, найденных функцией maxIntersections.'
sidebar_position: 164
slug: /sql-reference/aggregate-functions/reference/maxintersectionsposition
title: 'maxIntersectionsPosition'
doc_type: 'reference'
---

# maxIntersectionsPosition

Агрегатная функция, которая вычисляет позиции вхождений функции [`maxIntersections`](./maxintersections.md).

Синтаксис:

```sql
maxIntersectionsPosition(start_column, end_column)
```

**Аргументы**

* `start_column` — числовой столбец, соответствующий началу каждого интервала. Если `start_column` равен `NULL` или 0, то интервал будет пропущен.

* `end_column` — числовой столбец, соответствующий концу каждого интервала. Если `end_column` равен `NULL` или 0, то интервал будет пропущен.

**Возвращаемое значение**

Возвращает начальные позиции наибольшего количества пересекающихся интервалов.

**Пример**

```sql
CREATE TABLE my_events (
    start UInt32,
    end UInt32
)
ENGINE = MergeTree
ORDER BY tuple();

INSERT INTO my_events VALUES
   (1, 3),
   (1, 6),
   (2, 5),
   (3, 7);
```

Интервалы имеют следующий вид:

```response
1 - 3
1 - - - - 6
  2 - - 5
    3 - - - 7
```

Обратите внимание, что значение 4 встречается в трёх из этих интервалов, начиная со второго:

```sql
SELECT maxIntersectionsPosition(start, end) FROM my_events;
```

Ответ:

```response
2
```

Другими словами, строка `(1,6)` является началом трёх интервалов, которые пересекаются, и 3 — это максимальное количество пересекающихся интервалов.
