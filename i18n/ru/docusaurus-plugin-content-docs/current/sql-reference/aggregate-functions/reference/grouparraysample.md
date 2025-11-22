---
description: 'Создает массив выборочно отобранных значений аргумента. Размер результирующего массива ограничен `max_size` элементами. Значения аргумента выбираются случайным образом и добавляются в массив.'
sidebar_position: 145
slug: /sql-reference/aggregate-functions/reference/grouparraysample
title: 'groupArraySample'
doc_type: 'reference'
---

# groupArraySample

Создаёт массив из выборки значений аргумента. Размер результирующего массива ограничен `max_size` элементами. Значения аргумента выбираются и добавляются в массив случайным образом.

**Синтаксис**

```sql
groupArraySample(max_size[, seed])(x)
```

**Аргументы**

* `max_size` — максимальный размер результирующего массива. [UInt64](../../data-types/int-uint.md).
* `seed` — начальное значение (seed) для генератора случайных чисел. Необязательный параметр. [UInt64](../../data-types/int-uint.md). Значение по умолчанию: `123456`.
* `x` — аргумент (имя столбца или выражение).

**Возвращаемые значения**

* Массив элементов `x`, выбранных случайным образом.

Тип: [Array](../../data-types/array.md).

**Примеры**

Рассмотрим таблицу `colors`:

```text
┌─id─┬─color──┐
│  1 │ красный    │
│  2 │ синий   │
│  3 │ зеленый  │
│  4 │ белый  │
│  5 │ оранжевый │
└────┴────────┘
```

Запрос, в котором имя столбца передается как аргумент:

```sql
SELECT groupArraySample(3)(color) as newcolors FROM colors;
```

Результат:

```text
┌─newcolors──────────────────┐
│ ['white','blue','green']   │
└────────────────────────────┘
```

Запрос с именем столбца и другим значением seed:

```sql
SELECT groupArraySample(3, 987654321)(color) as newcolors FROM colors;
```

Результат:

```text
┌─newcolors──────────────────┐
│ ['red','orange','green']   │
└────────────────────────────┘
```

Запрос, в котором аргументом является выражение:

```sql
SELECT groupArraySample(3)(concat('light-', color)) as newcolors FROM colors;
```

Результат:

```text
┌─newcolors───────────────────────────────────┐
│ ['light-blue','light-orange','light-green'] │
└─────────────────────────────────────────────┘
```
