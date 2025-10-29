---
slug: '/sql-reference/data-types/date'
sidebar_label: Date
sidebar_position: 12
description: 'Документация для типа данных Date в ClickHouse'
title: Date
doc_type: reference
---
# Дата

Дата. Хранится в двух байтах как количество дней с 1970-01-01 (без знака). Позволяет хранить значения только с начала эпохи Unix до верхнего предела, определенного константой на этапе компиляции (в настоящее время это до 2149 года, но окончательный полностью поддерживаемый год — 2148).

Поддерживаемый диапазон значений: \[1970-01-01, 2149-06-06\].

Значение даты хранится без учета часового пояса.

**Пример**

Создание таблицы со столбцом типа `Date` и вставка данных в него:

```sql
CREATE TABLE dt
(
    `timestamp` Date,
    `event_id` UInt8
)
ENGINE = TinyLog;
```

```sql
-- Parse Date
-- - from string,
-- - from 'small' integer interpreted as number of days since 1970-01-01, and
-- - from 'big' integer interpreted as number of seconds since 1970-01-01.
INSERT INTO dt VALUES ('2019-01-01', 1), (17897, 2), (1546300800, 3);

SELECT * FROM dt;
```

```text
┌──timestamp─┬─event_id─┐
│ 2019-01-01 │        1 │
│ 2019-01-01 │        2 │
│ 2019-01-01 │        3 │
└────────────┴──────────┘
```

**Дополнительно**

- [Функции для работы с датами и временем](../../sql-reference/functions/date-time-functions.md)
- [Операторы для работы с датами и временем](../../sql-reference/operators#operators-for-working-with-dates-and-times)
- [`DateTime` Тип данных](../../sql-reference/data-types/datetime.md)