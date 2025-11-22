---
description: 'Документация о специальном типе данных Interval'
sidebar_label: 'Interval'
sidebar_position: 61
slug: /sql-reference/data-types/special-data-types/interval
title: 'Interval'
doc_type: 'reference'
---



# Interval

Семейство типов данных, представляющих интервалы дат и времени. Типы, возвращаемые оператором [INTERVAL](/sql-reference/operators#interval).

Структура:

* Интервал времени в виде беззнакового целочисленного значения.
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

Значения типа `Interval` можно использовать в арифметических операциях со значениями типов [Date](../../../sql-reference/data-types/date.md) и [DateTime](../../../sql-reference/data-types/datetime.md). Например, можно добавить 4 дня к текущему времени:

```sql
SELECT now() AS current_date_time, current_date_time + INTERVAL 4 DAY
```

```text
┌───current_date_time─┬─plus(now(), toIntervalDay(4))─┐
│ 2019-10-23 10:58:45 │           2019-10-27 10:58:45 │
└─────────────────────┴───────────────────────────────┘
```

Также можно использовать несколько интервалов одновременно:

```sql
SELECT now() AS current_date_time, current_date_time + (INTERVAL 4 DAY + INTERVAL 3 HOUR)
```

```text
┌───current_date_time─┬─plus(current_date_time, plus(toIntervalDay(4), toIntervalHour(3)))─┐
│ 2024-08-08 18:31:39 │                                                2024-08-12 21:31:39 │
└─────────────────────┴────────────────────────────────────────────────────────────────────┘
```

А также сравнивать значения с различными интервалами:

```sql
SELECT toIntervalMicrosecond(3600000000) = toIntervalHour(1);
```

```text
┌─less(toIntervalMicrosecond(179999999), toIntervalMinute(3))─┐
│                                                           1 │
└─────────────────────────────────────────────────────────────┘
```


## См. также {#see-also}

- Оператор [INTERVAL](/sql-reference/operators#interval)
- Функции преобразования типов [toInterval](/sql-reference/functions/type-conversion-functions#tointervalyear)
