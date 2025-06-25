---
description: 'Агрегатная функция, которая вычисляет позиции вхождений функции
  maxIntersections.'
sidebar_position: 164
slug: /sql-reference/aggregate-functions/reference/maxintersectionsposition
title: 'maxIntersectionsPosition'
---


# maxIntersectionsPosition

Агрегатная функция, которая вычисляет позиции вхождений функции [`maxIntersections`](./maxintersections.md).

Синтаксис:

```sql
maxIntersectionsPosition(start_column, end_column)
```

**Аргументы**

- `start_column` – числовая колонка, представляющая начало каждого интервала. Если `start_column` равно `NULL` или 0, то интервал будет пропущен.

- `end_column` - числовая колонка, представляющая конец каждого интервала. Если `end_column` равно `NULL` или 0, то интервал будет пропущен.

**Возвращаемое значение**

Возвращает начальные позиции максимального количества пересекающихся интервалов.

**Пример**

```sql
CREATE TABLE my_events (
    start UInt32,
    end UInt32
)
Engine = MergeTree
ORDER BY tuple();
```

Вставляем данные в таблицу:

```sql
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

Обратите внимание, что три из этих интервалов имеют значение 4 общее, и это начинается со второго интервала:

```sql
SELECT maxIntersectionsPosition(start, end) FROM my_events;
```

Ответ:
```response
2
```

Другими словами, строка `(1,6)` является началом 3 интервалов, которые пересекаются, и 3 - это максимальное количество пересекающихся интервалов.
