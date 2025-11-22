---
description: 'Подсчитывает количество строк или значений, отличных от NULL.'
sidebar_position: 120
slug: /sql-reference/aggregate-functions/reference/count
title: 'count'
doc_type: 'reference'
---

# count

Подсчитывает количество строк или ненулевых (not-NULL) значений.

ClickHouse поддерживает следующие варианты синтаксиса для `count`:

* `count(expr)` или `COUNT(DISTINCT expr)`.
* `count()` или `COUNT(*)`. Синтаксис `count()` является специфичным для ClickHouse.

**Arguments**

Функция может принимать:

* Ноль параметров.
* Одно [выражение](/sql-reference/syntax#expressions).

**Returned value**

* Если функция вызывается без параметров, она подсчитывает количество строк.
* Если передано [выражение](/sql-reference/syntax#expressions), функция подсчитывает, сколько раз это выражение вернуло не `NULL`. Если выражение возвращает значение типа [Nullable](../../../sql-reference/data-types/nullable.md), то результат функции `count` остаётся не `Nullable`. Функция возвращает 0, если выражение вернуло `NULL` для всех строк.

В обоих случаях тип возвращаемого значения — [UInt64](../../../sql-reference/data-types/int-uint.md).

**Details**

ClickHouse поддерживает синтаксис `COUNT(DISTINCT ...)`. Поведение этой конструкции зависит от настройки [count&#95;distinct&#95;implementation](../../../operations/settings/settings.md#count_distinct_implementation). Она определяет, какая из функций [uniq*](/sql-reference/aggregate-functions/reference/uniq) используется для выполнения операции. По умолчанию используется функция [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact).

Запрос `SELECT count() FROM table` по умолчанию оптимизируется с использованием метаданных из MergeTree. Если вам нужно использовать построчную (row-level) безопасность, отключите оптимизацию с помощью настройки [optimize&#95;trivial&#95;count&#95;query](/operations/settings/settings#optimize_trivial_count_query).

Однако запрос `SELECT count(nullable_column) FROM table` может быть оптимизирован за счёт включения настройки [optimize&#95;functions&#95;to&#95;subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns). При `optimize_functions_to_subcolumns = 1` функция читает только подколонку [null](../../../sql-reference/data-types/nullable.md#finding-null) вместо чтения и обработки всех данных столбца. Запрос `SELECT count(n) FROM table` преобразуется в `SELECT sum(NOT n.null) FROM table`.

**Improving COUNT(DISTINCT expr) performance**

Если ваш запрос `COUNT(DISTINCT expr)` выполняется медленно, рассмотрите возможность добавления предложения [`GROUP BY`](/sql-reference/statements/select/group-by), так как это улучшает параллельное выполнение. Вы также можете использовать [projection](../../../sql-reference/statements/alter/projection.md) для создания индекса по целевому столбцу, используемому с `COUNT(DISTINCT target_col)`.

**Examples**

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

Этот пример показывает, что операция `count(DISTINCT num)` выполняется с помощью функции `uniqExact` в соответствии со значением настройки `count_distinct_implementation`.
