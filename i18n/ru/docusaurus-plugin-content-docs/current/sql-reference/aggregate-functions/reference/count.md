---
slug: '/sql-reference/aggregate-functions/reference/count'
sidebar_position: 120
description: 'Считает количество строк или значений, не равных NULL.'
title: count
doc_type: reference
---
# count

Считывает количество строк или ненулевых значений.

ClickHouse поддерживает следующую синтаксисы для `count`:

- `count(expr)` или `COUNT(DISTINCT expr)`.
- `count()` или `COUNT(*)`. Синтаксис `count()` является специфичным для ClickHouse.

**Аргументы**

Функция может принимать:

- Ноль параметров.
- Одно [выражение](/sql-reference/syntax#expressions).

**Возвращаемое значение**

- Если функция вызывается без параметров, она считает количество строк.
- Если передано [выражение](/sql-reference/syntax#expressions), то функция считает, сколько раз это выражение вернуло ненулевое значение. Если выражение возвращает значение типа [Nullable](../../../sql-reference/data-types/nullable.md), то результат `count` остается ненулевым. Функция возвращает 0, если выражение вернуло `NULL` для всех строк.

В обоих случаях тип возвращаемого значения — [UInt64](../../../sql-reference/data-types/int-uint.md).

**Подробности**

ClickHouse поддерживает синтаксис `COUNT(DISTINCT ...)`. Поведение этой конструкции зависит от настройки [count_distinct_implementation](../../../operations/settings/settings.md#count_distinct_implementation). Она определяет, какая из функций [uniq*](/sql-reference/aggregate-functions/reference/uniq) используется для выполнения операции. По умолчанию используется функция [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact).

Запрос `SELECT count() FROM table` по умолчанию оптимизирован с использованием метаданных из MergeTree. Если вам нужно использовать безопасность на уровне строк, отключите оптимизацию с помощью настройки [optimize_trivial_count_query](/operations/settings/settings#optimize_trivial_count_query).

Однако запрос `SELECT count(nullable_column) FROM table` может быть оптимизирован, если включить настройку [optimize_functions_to_subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns). При `optimize_functions_to_subcolumns = 1` функция читает только [null](../../../sql-reference/data-types/nullable.md#finding-null) подколонку вместо чтения и обработки всех данных колонки. Запрос `SELECT count(n) FROM table` трансформируется в `SELECT sum(NOT n.null) FROM table`.

**Улучшение производительности COUNT(DISTINCT expr)**

Если ваш запрос `COUNT(DISTINCT expr)` работает медленно, подумайте о добавлении конструкции [`GROUP BY`](/sql-reference/statements/select/group-by), так как это улучшает параллелизацию. Вы также можете использовать [проекцию](../../../sql-reference/statements/alter/projection.md), чтобы создать индекс для целевой колонки, используемой с `COUNT(DISTINCT target_col)`.

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