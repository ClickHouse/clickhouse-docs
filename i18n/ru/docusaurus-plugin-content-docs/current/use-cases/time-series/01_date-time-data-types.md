---
title: 'Типы данных даты и времени — временные ряды'
sidebar_label: 'Типы данных даты и времени'
description: 'Типы данных временных рядов в ClickHouse.'
slug: /use-cases/time-series/date-time-data-types
keywords: ['time-series', 'DateTime', 'DateTime64', 'Date', 'data types', 'temporal data', 'timestamp']
show_related_blogs: true
doc_type: 'reference'
---



# Типы данных для дат и времени

Наличие полного набора типов для работы с датой и временем необходимо для эффективной обработки временных рядов, и ClickHouse предоставляет именно это.
От компактных представлений дат до высокоточных временных меток с точностью до наносекунды — эти типы спроектированы так, чтобы сбалансировать эффективность хранения с практическими требованиями различных приложений для временных рядов.

Независимо от того, работаете ли вы с историческими финансовыми данными, показаниями IoT‑датчиков или событиями, запланированными на будущее, типы данных даты и времени в ClickHouse обеспечивают гибкость, необходимую для обработки разнообразных сценариев работы с временными данными.
Диапазон поддерживаемых типов позволяет оптимизировать и занимаемое место, и производительность запросов, при этом сохраняя точность, требуемую вашей задачей.

* Тип [`Date`](/sql-reference/data-types/date) в большинстве случаев является достаточным. Этот тип требует 2 байта для хранения даты и ограничивает диапазон значений `[1970-01-01, 2149-06-06]`.

* [`Date32`](/sql-reference/data-types/date32) охватывает более широкий диапазон дат. Он требует 4 байта для хранения даты и ограничивает диапазон значений `[1900-01-01, 2299-12-31]`.

* [`DateTime`](/sql-reference/data-types/datetime) хранит значения даты и времени с точностью до секунды и диапазоном значений `[1970-01-01 00:00:00, 2106-02-07 06:28:15]`. Он требует 4 байта на значение.

* В случаях, когда требуется более высокая точность, можно использовать [`DateTime64`](/sql-reference/data-types/datetime64). Этот тип позволяет хранить время с точностью до наносекунд в диапазоне значений `[1900-01-01 00:00:00, 2299-12-31 23:59:59.99999999]`. Он требует 8 байт на значение.

Давайте создадим таблицу, которая хранит несколько различных типов дат:

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

Мы можем использовать функцию [`now()`](/sql-reference/functions/date-time-functions#now) для получения текущего времени и [`now64()`](/sql-reference/functions/date-time-functions#now64) — для получения его с заданной точностью, указываемой в первом аргументе.

```sql
INSERT INTO dates 
SELECT now(), 
       now()::Date32 + toIntervalYear(100),
       now(), 
       now64(3), 
       now64(9) + toIntervalYear(200);
```

Это заполнит наши столбцы временем в соответствии с их типом:

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


## Часовые пояса {#time-series-timezones}

Во многих сценариях использования требуется также сохранять информацию о часовых поясах. Часовой пояс можно указать в качестве последнего аргумента типов `DateTime` или `DateTime64`:

```sql
CREATE TABLE dtz
(
    `id` Int8,
    `dt_1` DateTime('Europe/Berlin'),
    `dt_2` DateTime,
    `dt64_1` DateTime64(9, 'Europe/Berlin'),
    `dt64_2` DateTime64(9),
)
ENGINE = MergeTree
ORDER BY id;
```

После определения часового пояса в DDL можно вставлять значения времени с использованием различных часовых поясов:

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

Теперь посмотрим, что содержится в таблице:

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

В первой строке все значения были вставлены с использованием часового пояса `America/New_York`.

- `dt_1` и `dt64_1` автоматически преобразуются в `Europe/Berlin` во время выполнения запроса.
- Для `dt_2` и `dt64_2` часовой пояс не был указан, поэтому используется локальный часовой пояс сервера, которым в данном случае является `Europe/London`.

Во второй строке все значения были вставлены без указания часового пояса, поэтому использовался локальный часовой пояс сервера.
Как и в первой строке, `dt_1` и `dt64_1` преобразуются в `Europe/Berlin`, тогда как `dt_2` и `dt64_2` используют локальный часовой пояс сервера.


## Функции для работы с датой и временем {#time-series-date-time-functions}

ClickHouse также предоставляет набор функций для преобразования между различными типами данных.

Например, можно использовать функцию [`toDate`](/sql-reference/functions/type-conversion-functions#todate) для преобразования значения типа `DateTime` в тип `Date`:

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

Для преобразования `DateTime` в `DateTime64` используется функция [`toDateTime64`](/sql-reference/functions/type-conversion-functions#todatetime64):

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

Для обратного преобразования из `Date` или `DateTime64` в `DateTime` используется функция [`toDateTime`](/sql-reference/functions/type-conversion-functions#todatetime):

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
