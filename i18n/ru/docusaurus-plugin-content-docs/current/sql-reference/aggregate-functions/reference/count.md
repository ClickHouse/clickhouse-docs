---
description: 'Считывает количество строк или ненулевых значений.'
sidebar_position: 120
slug: /sql-reference/aggregate-functions/reference/count
title: 'count'
---


# count

Считывает количество строк или ненулевых значений.

ClickHouse поддерживает следующие синтаксисы для `count`:

- `count(expr)` или `COUNT(DISTINCT expr)`.
- `count()` или `COUNT(*)`. Синтаксис `count()` специфичен для ClickHouse.

**Аргументы**

Функция может принимать:

- Ноль параметров.
- Один [выражение](/sql-reference/syntax#expressions).

**Возвращаемое значение**

- Если функция вызывается без параметров, она считает количество строк.
- Если передано [выражение](/sql-reference/syntax#expressions), то функция считает, сколько раз это выражение вернуло ненулевое значение. Если выражение возвращает значение типа [Nullable](../../../sql-reference/data-types/nullable.md), то результат `count` остается не `Nullable`. Функция возвращает 0, если выражение вернуло `NULL` для всех строк.

В обоих случаях тип возвращаемого значения — [UInt64](../../../sql-reference/data-types/int-uint.md).

**Детали**

ClickHouse поддерживает синтаксис `COUNT(DISTINCT ...)`. Поведение этой конструкции зависит от настройки [count_distinct_implementation](../../../operations/settings/settings.md#count_distinct_implementation). Она определяет, какая из [uniq\*](/sql-reference/aggregate-functions/reference/uniq) функций используется для выполнения операции. По умолчанию используется функция [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact).

Запрос `SELECT count() FROM table` по умолчанию оптимизируется с использованием метаданных из MergeTree. Если вам нужно использовать безопасность на уровне строк, отключите оптимизацию с помощью настройки [optimize_trivial_count_query](/operations/settings/settings#optimize_trivial_count_query).

Тем не менее, запрос `SELECT count(nullable_column) FROM table` может быть оптимизирован путем включения настройки [optimize_functions_to_subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns). При `optimize_functions_to_subcolumns = 1` функция читает только подколонку [null](../../../sql-reference/data-types/nullable.md#finding-null) вместо того, чтобы читать и обрабатывать все данные колонки. Запрос `SELECT count(n) FROM table` преобразуется в `SELECT sum(NOT n.null) FROM table`.

**Улучшение производительности COUNT(DISTINCT expr)**

Если ваш запрос `COUNT(DISTINCT expr)` работает медленно, рассмотрите возможность добавления оператора [`GROUP BY`](/sql-reference/statements/select/group-by), так как это улучшает параллелизацию. Вы также можете использовать [проекцию](../../../sql-reference/statements/alter/projection.md) для создания индекса на целевой колонке, используемой с `COUNT(DISTINCT target_col)`.

**Примеры**

Пример 1:

```sql
SELECT count() FROM t
```

```text
┌─count()─┐
│       5 │
└─────────┘
```

Пример 2:

```sql
SELECT name, value FROM system.settings WHERE name = 'count_distinct_implementation'
```

```text
┌─name──────────────────────────┬─value─────┐
│ count_distinct_implementation │ uniqExact │
└───────────────────────────────┴───────────┘
```

```sql
SELECT count(DISTINCT num) FROM t
```

```text
┌─uniqExact(num)─┐
│              3 │
└────────────────┘
```

Этот пример показывает, что `count(DISTINCT num)` выполняется функцией `uniqExact` в соответствии со значением настройки `count_distinct_implementation`.
