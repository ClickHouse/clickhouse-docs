---
description: 'Создает массив образцов значений аргумента. Размер результирующего массива ограничен элементами `max_size`. Значения аргументов выбираются и добавляются в массив случайным образом.'
sidebar_position: 145
slug: /sql-reference/aggregate-functions/reference/grouparraysample
title: 'groupArraySample'
---


# groupArraySample

Создает массив образцов значений аргумента. Размер результирующего массива ограничен элементами `max_size`. Значения аргументов выбираются и добавляются в массив случайным образом.

**Синтаксис**

```sql
groupArraySample(max_size[, seed])(x)
```

**Аргументы**

- `max_size` — Максимальный размер результирующего массива. [UInt64](../../data-types/int-uint.md).
- `seed` — Начальное значение для генератора случайных чисел. Необязательный. [UInt64](../../data-types/int-uint.md). Значение по умолчанию: `123456`.
- `x` — Аргумент (имя колонки или выражение).

**Возвращаемые значения**

- Массив случайно выбранных аргументов `x`.

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

Запрос с именем колонки в качестве аргумента:

```sql
SELECT groupArraySample(3)(color) as newcolors FROM colors;
```

Результат:

```text
┌─newcolors──────────────────┐
│ ['white','blue','green']   │
└────────────────────────────┘
```

Запрос с именем колонки и другим начальным значением:

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
