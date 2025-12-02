---
description: 'Агрегатная функция, вычисляющая позиции вхождений функции maxIntersections.'
sidebar_position: 164
slug: /sql-reference/aggregate-functions/reference/maxintersectionsposition
title: 'maxIntersectionsPosition'
doc_type: 'reference'
---

# maxIntersectionsPosition {#maxintersectionsposition}

Агрегатная функция, вычисляющая позиции вхождений функции [`maxIntersections`](./maxintersections.md).

Синтаксис следующий:

```sql
maxIntersectionsPosition(start_column, end_column)
```

**Аргументы**

* `start_column` – числовой столбец, задающий начало каждого интервала. Если `start_column` равен `NULL` или 0, этот интервал будет пропущен.

* `end_column` – числовой столбец, задающий конец каждого интервала. Если `end_column` равен `NULL` или 0, этот интервал будет пропущен.

**Возвращаемое значение**

Возвращает позиции начала максимального количества пересекающихся интервалов.

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

Интервалы выглядят следующим образом:

```response
1 - 3
1 - - - - 6
  2 - - 5
    3 - - - 7
```

Обратите внимание, что у трёх из этих интервалов общим является значение 4 — начиная со второго интервала:

```sql
SELECT maxIntersectionsPosition(start, end) FROM my_events;
```

Ответ:

```response
2
```

Другими словами, строка `(1,6)` является началом трёх пересекающихся интервалов, и 3 — максимальное число пересекающихся интервалов.
