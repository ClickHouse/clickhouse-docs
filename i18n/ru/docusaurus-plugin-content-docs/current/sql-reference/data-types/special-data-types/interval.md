---
description: 'Документация по специальному типу данных Interval'
sidebar_label: 'Interval'
sidebar_position: 61
slug: /sql-reference/data-types/special-data-types/interval
title: 'Interval'
doc_type: 'reference'
---

# Interval {#interval}

Семейство типов данных для представления временных и календарных интервалов. Типы, возвращаемые оператором [INTERVAL](/sql-reference/operators#interval).

Структура:

* Интервал в виде беззнакового целого числа.
* Тип интервала.

Поддерживаемые типы интервалов:

* `NANOSECOND`
* `MICROSECOND`
* `MILLISECOND`
* `SECOND`
* `MINUTE`
* `HOUR`
* `DAY`
* `WEEK`
* `MONTH`
* `QUARTER`
* `YEAR`

Для каждого типа интервала существует отдельный тип данных. Например, интервал `DAY` соответствует типу данных `IntervalDay`:

```sql
SELECT toTypeName(INTERVAL 4 DAY)
```

```text
┌─toTypeName(toIntervalDay(4))─┐
│ IntervalDay                  │
└──────────────────────────────┘
```

## Примечания по использованию {#usage-remarks}

Вы можете использовать значения типа `Interval` в арифметических операциях над значениями типов [Date](../../../sql-reference/data-types/date.md) и [DateTime](../../../sql-reference/data-types/datetime.md). Например, вы можете прибавить 4 дня к текущему времени:

```sql
SELECT now() AS current_date_time, current_date_time + INTERVAL 4 DAY
```

```text
┌───current_date_time─┬─plus(now(), toIntervalDay(4))─┐
│ 2019-10-23 10:58:45 │           2019-10-27 10:58:45 │
└─────────────────────┴───────────────────────────────┘
```

Также можно одновременно использовать несколько интервалов:

```sql
SELECT now() AS current_date_time, current_date_time + (INTERVAL 4 DAY + INTERVAL 3 HOUR)
```

```text
┌───current_date_time─┬─plus(current_date_time, plus(toIntervalDay(4), toIntervalHour(3)))─┐
│ 2024-08-08 18:31:39 │                                                2024-08-12 21:31:39 │
└─────────────────────┴────────────────────────────────────────────────────────────────────┘
```

А чтобы сравнить значения на разных интервалах:

```sql
SELECT toIntervalMicrosecond(3600000000) = toIntervalHour(1);
```

```text
┌─less(toIntervalMicrosecond(179999999), toIntervalMinute(3))─┐
│                                                           1 │
└─────────────────────────────────────────────────────────────┘
```

## См. также {#see-also}

- [INTERVAL](/sql-reference/operators#interval) — оператор
- [toInterval](/sql-reference/functions/type-conversion-functions#tointervalyear) — функции преобразования типов
