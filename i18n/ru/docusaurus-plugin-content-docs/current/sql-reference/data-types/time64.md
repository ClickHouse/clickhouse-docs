---
description: 'Документация для типа данных Time64 в ClickHouse, который хранит
  диапазон времени с точностью до долей секунды'
slug: /sql-reference/data-types/time64
sidebar_position: 17
sidebar_label: 'Time64'
title: 'Time64'
---


# Time64

Тип данных Time64 позволяет хранить временные значения с точностью до долей секунды. В отличие от DateTime64, он не включает в себя календарную дату, а представляет только время. Точность определяет разрешение хранимых значений в долях секунды.

Размер тика (точность): 10<sup>-precision</sup> секунд. Допустимый диапазон: [ 0 : 9 ].
Обычно используются - 3 (миллисекунды), 6 (микросекунды), 9 (наносекунды).

**Синтаксис:**

``` sql
Time64(precision)
```

Внутренне Time64 хранит данные как число Int64 тиков с начала суток (000:00:00.000000000). Разрешение тика определяется параметром точности. При желании, временная зона может быть указана на уровне колонки, что влияет на то, как временные значения интерпретируются и отображаются в текстовом формате.

В отличие от DateTime64, Time64 не хранит компонент даты, что означает, что он представляет только время. Подробности смотрите в [Time](../../sql-reference/data-types/time.md).

Поддерживаемый диапазон значений: \[000:00:00, 999:59:59.99999999\]

## Примеры {#examples}

1. Создание таблицы с колонкой типа `Time64` и вставка данных в нее:

``` sql
CREATE TABLE t64
(
    `timestamp` Time64(3),
    `event_id` UInt8
)
ENGINE = TinyLog;
```

``` sql
-- Парсинг времени
-- - из целого числа, интерпретируемого как количество секунд с 1970-01-01.
-- - из строки,
INSERT INTO t64 VALUES (15463123, 1), (154600.123, 2), ('100:00:00', 3);

SELECT * FROM t64;
```

``` text
   ┌─────timestamp─┬─event_id─┐
1. │ 004:17:43.123 │        1 │
2. │ 042:56:40.123 │        2 │
3. │ 100:00:00.000 │        3 │
   └───────────────┴──────────┘
```

2. Фильтрация по значениям `Time64`

``` sql
SELECT * FROM t64 WHERE timestamp = toTime64('100:00:00', 3);
```

``` text
   ┌─────timestamp─┬─event_id─┐
1. │ 100:00:00.000 │        3 │
   └───────────────┴──────────┘
```

В отличие от `Time`, значения `Time64` не конвертируются из `String` автоматически.

``` sql
SELECT * FROM t64 WHERE timestamp = toTime64(154600.123, 3);
```

``` text
   ┌─────timestamp─┬─event_id─┐
1. │ 042:56:40.123 │        2 │
   └───────────────┴──────────┘
```

В отличие от вставки, функция `toTime64` будет рассматривать все значения как десятичный вариант, поэтому точность необходимо указывать после десятичной точки.

3. Получение временной зоны для значения типа `Time64`:

``` sql
SELECT toTime64(now(), 3) AS column, toTypeName(column) AS x;
```

``` text
   ┌────────column─┬─x─────────┐
1. │ 019:14:16.000 │ Time64(3) │
   └───────────────┴───────────┘
```


**Смотрите также**

- [Функции преобразования типов](../../sql-reference/functions/type-conversion-functions.md)
- [Функции для работы с датами и временем](../../sql-reference/functions/date-time-functions.md)
- [Настройка `date_time_input_format`](../../operations/settings/settings-formats.md#date_time_input_format)
- [Настройка `date_time_output_format`](../../operations/settings/settings-formats.md#date_time_output_format)
- [Параметр конфигурации сервера `timezone`](../../operations/server-configuration-parameters/settings.md#timezone)
- [Настройка `session_timezone`](../../operations/settings/settings.md#session_timezone)
- [Операторы для работы с датами и временем](../../sql-reference/operators/index.md#operators-for-working-with-dates-and-times)
- [`Date` тип данных](../../sql-reference/data-types/date.md)
- [`Time` тип данных](../../sql-reference/data-types/time.md)
- [`DateTime` тип данных](../../sql-reference/data-types/datetime.md)
