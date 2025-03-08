---
slug: /sql-reference/aggregate-functions/reference/maxintersections
sidebar_position: 163
title: maxIntersections
description: "Агрегатная функция, котораяcalculates the maximum number of times that a group of intervals intersects each other (if all the intervals intersect at least once)."
---


# maxIntersections

Агрегатная функция, которая calculates the maximum number of times that a group of intervals intersects each other (if all the intervals intersect at least once).

Синтаксис:

```sql
maxIntersections(start_column, end_column)
```

**Аргументы**

- `start_column` – числовая колонка, которая представляет начало каждого интервала. Если `start_column` равен `NULL` или 0, то интервал будет пропущен.

- `end_column` - числовая колонка, которая представляет конец каждого интервала. Если `end_column` равен `NULL` или 0, то интервал будет пропущен.

**Возвращаемое значение**

Возвращает максимальное количество пересекающихся интервалов.

**Пример**

```sql
CREATE TABLE my_events (
    start UInt32,
    end UInt32
)
Engine = MergeTree
ORDER BY tuple();

INSERT INTO my_events VALUES
   (1, 3),
   (1, 6),
   (2, 5),
   (3, 7);
```

Интервалы выглядят следующим образом:

```response
1 - 3
1 - - - - 6
  2 - - 5
    3 - - - 7
```

Три из этих интервалов имеют общее значение (значение `4`, но значение, которое является общим, не важно, мы измеряем количество пересечений). Интервалы `(1,3)` и `(3,7)` имеют общую границу, но не считаются пересекающимися согласно функции `maxIntersections`.

```sql
SELECT maxIntersections(start, end) FROM my_events;
```

Ответ:
```response
3
```

Если у вас есть несколько вхождений максимального интервала, вы можете использовать функцию [`maxIntersectionsPosition`](./maxintersectionsposition.md), чтобы определить количество и местоположение этих вхождений.
