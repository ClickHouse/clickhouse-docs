---
description: 'Создает массив выборочных значений аргумента. Размер результирующего
  массива ограничен `max_size` элементами. Значения аргумента выбираются и добавляются
  в массив случайным образом.'
sidebar_position: 145
slug: /sql-reference/aggregate-functions/reference/grouparraysample
title: 'groupArraySample'
doc_type: 'reference'
---

# groupArraySample {#grouparraysample}

Создаёт массив случайных значений аргумента. Размер результирующего массива ограничен `max_size` элементами. Значения аргумента выбираются и добавляются в массив случайным образом.

**Синтаксис**

```sql
groupArraySample(max_size[, seed])(x)
```

**Аргументы**

* `max_size` — Максимальный размер возвращаемого массива. [UInt64](../../data-types/int-uint.md).
* `seed` — Начальное значение для генератора случайных чисел (seed). Необязательный параметр. [UInt64](../../data-types/int-uint.md). Значение по умолчанию: `123456`.
* `x` — Аргумент (имя столбца или выражение).

**Возвращаемые значения**

* Массив случайным образом выбранных значений `x`.

Тип: [Array](../../data-types/array.md).

**Примеры**

Рассмотрим таблицу `colors`:

```text
┌─id─┬─color──┐
│  1 │ red    │
│  2 │ blue   │
│  3 │ green  │
│  4 │ white  │
│  5 │ orange │
└────┴────────┘
```

Запрос, в котором имя столбца передаётся как аргумент:

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

Запрос с выражением в качестве аргумента:

```sql
SELECT groupArraySample(3)(concat('light-', color)) as newcolors FROM colors;
```

Результат:

```text
┌─newcolors───────────────────────────────────┐
│ ['light-blue','light-orange','light-green'] │
└─────────────────────────────────────────────┘
```
