---
slug: /sql-reference/aggregate-functions/reference/count
sidebar_position: 120
title: 'count'
description: 'Считывает количество строк или ненулевых значений.'
---


# count

Считывает количество строк или ненулевых значений.

ClickHouse поддерживает следующие синтаксисы для `count`:

- `count(expr)` или `COUNT(DISTINCT expr)`.
- `count()` или `COUNT(*)`. Синтаксис `count()` является специфичным для ClickHouse.

**Аргументы**

Функция может принимать:

- Ноль параметров.
- Одно [выражение](/sql-reference/syntax#expressions).

**Возвращаемое значение**

- Если функция вызывается без параметров, она считает количество строк.
- Если передано [выражение](/sql-reference/syntax#expressions), то функция подсчитывает, сколько раз это выражение возвращалось ненулевым. Если выражение возвращает значение типа [Nullable](../../../sql-reference/data-types/nullable.md), то результат `count` остается не `Nullable`. Функция возвращает 0, если выражение возвращало `NULL` для всех строк.

В обоих случаях тип возвращаемого значения — [UInt64](../../../sql-reference/data-types/int-uint.md).

**Подробности**

ClickHouse поддерживает синтаксис `COUNT(DISTINCT ...)`. Поведение этой конструкции зависит от параметра [count_distinct_implementation](../../../operations/settings/settings.md#count_distinct_implementation). Он определяет, какая из функций [uniq*](/sql-reference/aggregate-functions/reference/uniq) используется для выполнения операции. Значение по умолчанию — функция [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact).

Запрос `SELECT count() FROM table` оптимизируется по умолчанию с использованием метаданных из MergeTree. Если вам нужно использовать безопасность на уровне строк, отключите оптимизацию, используя параметр [optimize_trivial_count_query](/operations/settings/settings#optimize_trivial_count_query).

Однако запрос `SELECT count(nullable_column) FROM table` может быть оптимизирован путем включения параметра [optimize_functions_to_subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns). При `optimize_functions_to_subcolumns = 1` функция считывает только подколонку [null](../../../sql-reference/data-types/nullable.md#finding-null) вместо чтения и обработки всех данных колонки. Запрос `SELECT count(n) FROM table` преобразуется в `SELECT sum(NOT n.null) FROM table`.

**Улучшение производительности COUNT(DISTINCT expr)**

Если ваш запрос `COUNT(DISTINCT expr)` работает медленно, рассмотрите возможность добавления [`GROUP BY`](/sql-reference/statements/select/group-by) предложения, так как это улучшает параллелизацию. Вы также можете использовать [прогрессивное представление](../../../sql-reference/statements/alter/projection.md) для создания индекса на целевой колонке, используемой с `COUNT(DISTINCT target_col)`.

**Примеры**

Пример 1:

``` sql
SELECT count() FROM t
```

``` text
┌─count()─┐
│       5 │
└─────────┘
```

Пример 2:

``` sql
SELECT name, value FROM system.settings WHERE name = 'count_distinct_implementation'
```

``` text
┌─name──────────────────────────┬─value─────┐
│ count_distinct_implementation │ uniqExact │
└───────────────────────────────┴───────────┘
```

``` sql
SELECT count(DISTINCT num) FROM t
```

``` text
┌─uniqExact(num)─┐
│              3 │
└────────────────┘
```

Этот пример показывает, что `count(DISTINCT num)` выполняется с помощью функции `uniqExact` в соответствии со значением параметра `count_distinct_implementation`.
