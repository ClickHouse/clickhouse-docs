---
slug: '/sql-reference/aggregate-functions/reference/maxintersections'
sidebar_position: 163
description: 'Агрегатная функция, которая рассчитывает максимальное количество раз,'
title: maxIntersections
doc_type: reference
---
# maxIntersections

Агрегатная функция, которая вычисляет максимальное количество раз, когда группа интервалов пересекается между собой (если все интервалы пересекаются хотя бы раз).

Синтаксис:

```sql
maxIntersections(start_column, end_column)
```

**Аргументы**

- `start_column` – числовая колонка, представляющая начало каждого интервала. Если `start_column` равен `NULL` или 0, то интервал будет пропущен.

- `end_column` - числовая колонка, представляющая конец каждого интервала. Если `end_column` равен `NULL` или 0, то интервал будет пропущен.

**Возвращаемое значение**

Возвращает максимальное количество пересекающихся интервалов.

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

Три из этих интервалов имеют общее значение (значение равно `4`, но общее значение не важно, мы измеряем количество пересечений). Интервалы `(1,3)` и `(3,7)` имеют общую границу, но не считаются пересекающимися по функции `maxIntersections`.

```sql
SELECT maxIntersections(start, end) FROM my_events;
```

Ответ:
```response
3
```

Если у вас есть несколько вхождений максимального интервала, вы можете использовать функцию [`maxIntersectionsPosition`](./maxintersectionsposition.md) для определения числа и местоположения этих вхождений.