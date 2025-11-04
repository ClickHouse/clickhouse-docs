---
slug: '/sql-reference/data-types/datetime64'
sidebar_label: DateTime64
sidebar_position: 18
description: 'Документация для типа данных DateTime64 в ClickHouse, который хранит'
title: DateTime64
doc_type: reference
---
# DateTime64

Позволяет хранить момент времени, который может быть выражен как календарная дата и время суток, с определенной подсекундной точностью.

Размер тика (точность): 10<sup>-precision</sup> секунд. Допустимый диапазон: [ 0 : 9 ].
Обычно используются - 3 (миллисекунды), 6 (микросекунды), 9 (наносекунды).

**Синтаксис:**

```sql
DateTime64(precision, [timezone])
```

Внутри данные хранятся как количество 'тиков' с начала эпохи (1970-01-01 00:00:00 UTC) в формате Int64. Разрешение тика определяется параметром точности. Дополнительно, тип `DateTime64` может хранить временную зону, одинаковую для всей колонки, что влияет на то, как значения типа `DateTime64` отображаются в текстовом формате и как значения, указанные в виде строк, разбираются ('2020-01-01 05:00:01.000'). Временная зона не хранится в строках таблицы (или в результирующем наборе), а сохраняется в метаданных колонки. См. подробности в [DateTime](../../sql-reference/data-types/datetime.md).

Поддерживаемый диапазон значений: \[1900-01-01 00:00:00, 2299-12-31 23:59:59.99999999\]

Количество цифр после десятичной точки зависит от параметра точности.

Примечание: Точность максимального значения составляет 8. Если используется максимальная точность 9 цифр (наносекунды), максимальное поддерживаемое значение равно `2262-04-11 23:47:16` в UTC.

## Примеры {#examples}

1. Создание таблицы с колонкой типа `DateTime64` и вставка данных в неё:

```sql
CREATE TABLE dt64
(
    `timestamp` DateTime64(3, 'Asia/Istanbul'),
    `event_id` UInt8
)
ENGINE = TinyLog;
```

```sql
-- Parse DateTime
-- - from integer interpreted as number of microseconds (because of precision 3) since 1970-01-01,
-- - from decimal interpreted as number of seconds before the decimal part, and based on the precision after the decimal point,
-- - from string.
INSERT INTO dt64 VALUES (1546300800123, 1), (1546300800.123, 2), ('2019-01-01 00:00:00', 3);

SELECT * FROM dt64;
```

```text
┌───────────────timestamp─┬─event_id─┐
│ 2019-01-01 03:00:00.123 │        1 │
│ 2019-01-01 03:00:00.123 │        2 │
│ 2019-01-01 00:00:00.000 │        3 │
└─────────────────────────┴──────────┘
```

- При вставке datetime в виде целого числа оно обрабатывается как соответственно изменённый Unix Timestamp (UTC). `1546300800000` (с точностью 3) представляет собой `'2019-01-01 00:00:00'` UTC. Однако, поскольку колонка `timestamp` имеет заданную временную зону `Asia/Istanbul` (UTC+3), при выводе в виде строки значение будет показано как `'2019-01-01 03:00:00'`. Вставка datetime в виде десятичного числа будет обрабатываться аналогично целому числу, за исключением того, что значение перед десятичной точкой — это Unix Timestamp вплоть до секунд, а после десятичной точки будет восприниматься как точность.
- При вставке строкового значения как datetime оно обрабатывается как относящееся к временной зоне колонки. `'2019-01-01 00:00:00'` будет восприниматься как находящееся в временной зоне `Asia/Istanbul` и сохранено как `1546290000000`.

2. Фильтрация по значениям `DateTime64`

```sql
SELECT * FROM dt64 WHERE timestamp = toDateTime64('2019-01-01 00:00:00', 3, 'Asia/Istanbul');
```

```text
┌───────────────timestamp─┬─event_id─┐
│ 2019-01-01 00:00:00.000 │        3 │
└─────────────────────────┴──────────┘
```

В отличие от `DateTime`, значения `DateTime64` не конвертируются автоматически из `String`.

```sql
SELECT * FROM dt64 WHERE timestamp = toDateTime64(1546300800.123, 3);
```

```text
┌───────────────timestamp─┬─event_id─┐
│ 2019-01-01 03:00:00.123 │        1 │
│ 2019-01-01 03:00:00.123 │        2 │
└─────────────────────────┴──────────┘
```

В отличие от вставки, функция `toDateTime64` будет рассматривать все значения как десятичный вариант, поэтому точность должна быть указана после десятичной точки.

3. Получение временной зоны для значения типа `DateTime64`:

```sql
SELECT toDateTime64(now(), 3, 'Asia/Istanbul') AS column, toTypeName(column) AS x;
```

```text
┌──────────────────column─┬─x──────────────────────────────┐
│ 2023-06-05 00:09:52.000 │ DateTime64(3, 'Asia/Istanbul') │
└─────────────────────────┴────────────────────────────────┘
```

4. Преобразование временной зоны

```sql
SELECT
toDateTime64(timestamp, 3, 'Europe/London') AS lon_time,
toDateTime64(timestamp, 3, 'Asia/Istanbul') AS istanbul_time
FROM dt64;
```

```text
┌────────────────lon_time─┬───────────istanbul_time─┐
│ 2019-01-01 00:00:00.123 │ 2019-01-01 03:00:00.123 │
│ 2019-01-01 00:00:00.123 │ 2019-01-01 03:00:00.123 │
│ 2018-12-31 21:00:00.000 │ 2019-01-01 00:00:00.000 │
└─────────────────────────┴─────────────────────────┘
```

**См. также**

- [Функции преобразования типов](../../sql-reference/functions/type-conversion-functions.md)
- [Функции для работы с датами и временем](../../sql-reference/functions/date-time-functions.md)
- [Настройка `date_time_input_format`](../../operations/settings/settings-formats.md#date_time_input_format)
- [Настройка `date_time_output_format`](../../operations/settings/settings-formats.md#date_time_output_format)
- [Параметр конфигурации сервера `timezone`](../../operations/server-configuration-parameters/settings.md#timezone)
- [Настройка `session_timezone`](../../operations/settings/settings.md#session_timezone)
- [Операторы для работы с датами и временем](../../sql-reference/operators/index.md#operators-for-working-with-dates-and-times)
- [`Date` тип данных](../../sql-reference/data-types/date.md)
- [`DateTime` тип данных](../../sql-reference/data-types/datetime.md)