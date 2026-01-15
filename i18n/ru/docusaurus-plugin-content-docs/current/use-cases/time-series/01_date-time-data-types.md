---
title: 'Типы данных даты и времени — временные ряды'
sidebar_label: 'Типы данных даты и времени'
description: 'Типы данных для временных рядов в ClickHouse.'
slug: /use-cases/time-series/date-time-data-types
keywords: ['временные ряды', 'DateTime', 'DateTime64', 'Date', 'Time', 'Time64', 'типы данных', 'временные данные', 'timestamp']
show_related_blogs: true
doc_type: 'reference'
---

# Типы данных для даты и времени {#date-and-time-data-types}

Наличие обширного набора типов данных для даты и времени необходимо для эффективного управления временными рядами, и ClickHouse предоставляет именно такой набор.
От компактных представлений дат до высокоточных меток времени с наносекундной точностью — эти типы спроектированы так, чтобы сбалансировать эффективность хранения с практическими требованиями различных приложений для временных рядов.

Независимо от того, работаете ли вы с историческими финансовыми данными, показаниями IoT‑датчиков или событиями с датой в будущем, типы данных даты и времени в ClickHouse обеспечивают необходимую гибкость для обработки различных сценариев работы с временными данными.
Диапазон поддерживаемых типов позволяет оптимизировать как занимаемое место в хранилище, так и производительность запросов, сохраняя при этом точность, требуемую вашим сценарием использования.

* Тип [`Date`](/sql-reference/data-types/date) в большинстве случаев должен быть достаточен. Этот тип требует 2 байта для хранения даты и ограничивает диапазон значениями `[1970-01-01, 2149-06-06]`.

* [`Date32`](/sql-reference/data-types/date32) охватывает более широкий диапазон дат. Он требует 4 байта для хранения даты и ограничивает диапазон значениями `[1900-01-01, 2299-12-31]`

* [`DateTime`](/sql-reference/data-types/datetime) хранит значения даты и времени с точностью до секунды и диапазоном `[1970-01-01 00:00:00, 2106-02-07 06:28:15]`. Он требует 4 байта на значение.

* В случаях, когда требуется более высокая точность, можно использовать [`DateTime64`](/sql-reference/data-types/datetime64). Этот тип позволяет хранить время с точностью до наносекунд, с диапазоном `[1900-01-01 00:00:00, 2299-12-31 23:59:59.99999999]`. Он требует 8 байт на значение.

Создадим таблицу, которая хранит различные типы дат:

```sql
CREATE TABLE dates
(
    `date` Date,
    `wider_date` Date32,
    `datetime` DateTime,
    `precise_datetime` DateTime64(3),
    `very_precise_datetime` DateTime64(9)
)
ENGINE = MergeTree
ORDER BY tuple();
```

Мы можем использовать функцию [`now()`](/sql-reference/functions/date-time-functions#now) для получения текущего времени и [`now64()`](/sql-reference/functions/date-time-functions#now64) — для получения значения с заданной точностью, определяемой первым аргументом.

```sql
INSERT INTO dates 
SELECT now(), 
       now()::Date32 + toIntervalYear(100),
       now(), 
       now64(3), 
       now64(9) + toIntervalYear(200);
```

Это заполнит столбцы временными значениями в соответствии с их типом:

```sql
SELECT * FROM dates
FORMAT Vertical;
```

```text
Row 1:
──────
date:                  2025-03-12
wider_date:            2125-03-12
datetime:              2025-03-12 11:39:07
precise_datetime:      2025-03-12 11:39:07.196
very_precise_datetime: 2025-03-12 11:39:07.196724000
```


## Типы Time и Time64 {#time-series-time-types}

Для сценариев, в которых нужно хранить значения времени суток без компонентов даты, ClickHouse предоставляет типы [`Time`](/sql-reference/data-types/time) и [`Time64`](/sql-reference/data-types/time64), которые были добавлены в версии 25.6. Они полезны для представления повторяющихся расписаний, ежедневных шаблонов или ситуаций, когда логично разделять компоненты даты и времени.

:::note
Использование `Time` и `Time64` требует включения настройки: `SET enable_time_time64_type = 1;`

Эти типы были добавлены в версии 25.6
:::

Тип `Time` хранит часы, минуты и секунды с точностью до секунды. Внутренне значение хранится как знаковое 32-битное целое число и поддерживает диапазон `[-999:59:59, 999:59:59]`, что позволяет использовать значения, превышающие 24 часа. Это может быть полезно при отслеживании прошедшего времени или выполнении арифметических операций, которые дают значения за пределами одних суток.

Для субсекундной точности `Time64` хранит время с настраиваемой дробной частью секунды как знаковое значение типа Decimal64. Он принимает параметр точности (0–9), определяющий количество дробных цифр. Типичными значениями точности являются 3 (миллисекунды), 6 (микросекунды) и 9 (наносекунды).

Ни `Time`, ни `Time64` не поддерживают часовые пояса — они представляют чистое время суток без регионального контекста.

Давайте создадим таблицу со столбцами времени:

```sql
SET enable_time_time64_type = 1;

CREATE TABLE time_examples
(
    `event_id` UInt8,
    `basic_time` Time,
    `precise_time` Time64(3)
)
ENGINE = MergeTree
ORDER BY event_id;
```

Мы можем задавать значения времени с помощью строковых литералов или числовых значений. Для `Time` числовые значения интерпретируются как количество секунд, прошедших с 00:00:00. Для `Time64` числовые значения интерпретируются как количество секунд, прошедших с 00:00:00, при этом дробная часть интерпретируется в соответствии с точностью столбца:

```sql
INSERT INTO time_examples VALUES 
    (1, '14:30:25', '14:30:25.123'),
    (2, 52225, 52225.456),
    (3, '26:11:10', '26:11:10.789');  -- Values normalize beyond 24 hours

SELECT * FROM time_examples ORDER BY event_id;
```

```text
┌─event_id─┬─basic_time─┬─precise_time─┐
│        1 │ 14:30:25   │ 14:30:25.123 │
│        2 │ 14:30:25   │ 14:30:25.456 │
│        3 │ 26:11:10   │ 26:11:10.789 │
└──────────┴────────────┴──────────────┘
```

Временные значения можно фильтровать привычным образом:

```sql
SELECT * FROM time_examples WHERE basic_time = '14:30:25';
```


## Часовые пояса {#time-series-timezones}

Во многих сценариях использования также требуется сохранять часовые пояса. Мы можем задать часовой пояс последним аргументом для типов `DateTime` или `DateTime64`:

```sql
CREATE TABLE dtz
(
    `id` Int8,
    `dt_1` DateTime('Europe/Berlin'),
    `dt_2` DateTime,
    `dt64_1` DateTime64(9, 'Europe/Berlin'),
    `dt64_2` DateTime64(9)
)
ENGINE = MergeTree
ORDER BY id;
```

После того как мы задали часовой пояс в DDL, мы можем вставлять значения времени в разных часовых поясах:

```sql
INSERT INTO dtz 
SELECT 1, 
       toDateTime('2022-12-12 12:13:14', 'America/New_York'),
       toDateTime('2022-12-12 12:13:14', 'America/New_York'),
       toDateTime64('2022-12-12 12:13:14.123456789', 9, 'America/New_York'),
       toDateTime64('2022-12-12 12:13:14.123456789', 9, 'America/New_York')
UNION ALL
SELECT 2, 
       toDateTime('2022-12-12 12:13:15'),
       toDateTime('2022-12-12 12:13:15'),
       toDateTime64('2022-12-12 12:13:15.123456789', 9),
       toDateTime64('2022-12-12 12:13:15.123456789', 9);
```

А теперь посмотрим, что в нашей таблице:

```sql
SELECT dt_1, dt64_1, dt_2, dt64_2
FROM dtz
FORMAT Vertical;
```

```text
Row 1:
──────
dt_1:   2022-12-12 18:13:14
dt64_1: 2022-12-12 18:13:14.123456789
dt_2:   2022-12-12 17:13:14
dt64_2: 2022-12-12 17:13:14.123456789

Row 2:
──────
dt_1:   2022-12-12 13:13:15
dt64_1: 2022-12-12 13:13:15.123456789
dt_2:   2022-12-12 12:13:15
dt64_2: 2022-12-12 12:13:15.123456789
```

В первой строке мы вставили все значения, используя часовой пояс `America/New_York`.

* `dt_1` и `dt64_1` автоматически преобразуются в `Europe/Berlin` во время выполнения запроса.
* Для `dt_2` и `dt64_2` часовой пояс не был указан, поэтому они используют локальный часовой пояс сервера, который в данном случае — `Europe/London`.

Во второй строке мы вставили все значения без указания часового пояса, поэтому использовался локальный часовой пояс сервера.
Как и в первой строке, `dt_1` и `dt64_1` преобразуются в `Europe/Berlin`, тогда как `dt_2` и `dt64_2` используют локальный часовой пояс сервера.


## Функции даты и времени {#time-series-date-time-functions}

ClickHouse также предоставляет набор функций, которые позволяют преобразовывать значения между различными типами данных.

Например, мы можем использовать [`toDate`](/sql-reference/functions/type-conversion-functions#toDate), чтобы преобразовать значение типа `DateTime` в тип `Date`:

```sql
SELECT
    now() AS current_time,
    toTypeName(current_time),
    toDate(current_time) AS date_only,
    toTypeName(date_only)
FORMAT Vertical;    
```

```text
Row 1:
──────
current_time:             2025-03-12 12:32:54
toTypeName(current_time): DateTime
date_only:                2025-03-12
toTypeName(date_only):    Date
```

Для преобразования `DateTime` в `DateTime64` можно использовать функцию [`toDateTime64`](/sql-reference/functions/type-conversion-functions#toDateTime64):

```sql
SELECT
    now() AS current_time,
    toTypeName(current_time),
    toDateTime64(current_time, 3) AS date_only,
    toTypeName(date_only)
FORMAT Vertical;
```

```text
Row 1:
──────
current_time:             2025-03-12 12:35:01
toTypeName(current_time): DateTime
date_only:                2025-03-12 12:35:01.000
toTypeName(date_only):    DateTime64(3)
```

Также можно использовать [`toDateTime`](/sql-reference/functions/type-conversion-functions#toDateTime), чтобы преобразовать `Date` или `DateTime64` обратно в `DateTime`:

```sql
SELECT
    now64() AS current_time,
    toTypeName(current_time),
    toDateTime(current_time) AS date_time1,
    toTypeName(date_time1),
    today() AS current_date,
    toTypeName(current_date),
    toDateTime(current_date) AS date_time2,
    toTypeName(date_time2)
FORMAT Vertical;
```

```text
Row 1:
──────
current_time:             2025-03-12 12:41:00.598
toTypeName(current_time): DateTime64(3)
date_time1:               2025-03-12 12:41:00
toTypeName(date_time1):   DateTime
current_date:             2025-03-12
toTypeName(current_date): Date
date_time2:               2025-03-12 00:00:00
toTypeName(date_time2):   DateTime
```
