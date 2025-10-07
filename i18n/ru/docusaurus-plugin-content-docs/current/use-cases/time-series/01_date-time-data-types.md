---
'title': 'Дата и время типы данных - Временные ряды'
'sidebar_label': 'Дата и время типы данных'
'description': 'Типы данных временных рядов в ClickHouse.'
'slug': '/use-cases/time-series/date-time-data-types'
'keywords':
- 'Time Series'
- 'DateTime'
'show_related_blogs': true
'doc_type': 'reference'
---


# Типы данных даты и времени

Наличие обширного набора типов данных даты и времени необходимо для эффективного управления данными временных рядов, и ClickHouse предоставляет именно это. 
От компактных представлений дат до высокоточных временных отметок с точностью до наносекунд, эти типы предназначены для балансировки эффективности хранения и практических требований для различных приложений временных рядов.

Независимо от того, работаете ли вы с историческими финансовыми данными, показателями датчиков IoT или событиями с будущими датами, типы данных даты и времени ClickHouse обеспечивают необходимую гибкость для обработки различных временных данных. 
Диапазон поддерживаемых типов позволяет оптимизировать как пространство хранения, так и производительность запросов, сохраняя при этом точность, требуемую вашим случаем использования.

* Тип [`Date`](/sql-reference/data-types/date) должен быть достаточным в большинстве случаев. Этот тип требует 2 байта для хранения даты и ограничивает диапазон до `[1970-01-01, 2149-06-06]`.

* [`Date32`](/sql-reference/data-types/date32) охватывает более широкий диапазон дат. Он требует 4 байта для хранения даты и ограничивает диапазон до `[1900-01-01, 2299-12-31]`

* [`DateTime`](/sql-reference/data-types/datetime) хранит значения даты и времени с точностью до секунд и диапазоном `[1970-01-01 00:00:00, 2106-02-07 06:28:15]`. Он требует 4 байта на значение.

* В случаях, когда требуется больше точности, можно использовать [`DateTime64`](/sql-reference/data-types/datetime64). Это позволяет хранить время с точностью до наносекунд, с диапазоном `[1900-01-01 00:00:00, 2299-12-31 23:59:59.99999999]`. Он требует 8 байтов на значение.

Давайте создадим таблицу, которая хранит различные типы данных даты:

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

Мы можем использовать функцию [`now()`](/sql-reference/functions/date-time-functions#now), чтобы вернуть текущее время, и [`now64()`](/sql-reference/functions/date-time-functions#now64), чтобы получить его в указанной точности через первый аргумент.

```sql
INSERT INTO dates 
SELECT now(), 
       now()::Date32 + toIntervalYear(100),
       now(), 
       now64(3), 
       now64(9) + toIntervalYear(200);
```

Это заполнит наши столбцы временем в соответствии с типом столбца:

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

Многие сценарии использования требуют также хранения часовых поясов. Мы можем установить часовой пояс как последний аргумент для типов `DateTime` или `DateTime64`:

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

Определив часовой пояс в нашей DDL, теперь мы можем вставлять время, используя различные часовые пояса:

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

А теперь давайте посмотрим, что в нашей таблице:

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
* `dt_2` и `dt64_2` не имели указанного часового пояса, поэтому они используют местный часовой пояс сервера, который в данном случае `Europe/London`.

Во второй строке мы вставили все значения без часового пояса, поэтому использовался местный часовой пояс сервера.
Как и в первой строке, `dt_1` и `dt_3` преобразуются в `Europe/Berlin`, в то время как `dt_2` и `dt64_2` используют местный часовой пояс сервера.

## Функции даты и времени {#time-series-date-time-functions}

ClickHouse также поставляется с набором функций, которые позволяют нам преобразовывать между различными типами данных.

Например, мы можем использовать [`toDate`](/sql-reference/functions/type-conversion-functions#todate) для преобразования значения `DateTime` в тип `Date`:

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

Мы можем использовать [`toDateTime64`](/sql-reference/functions/type-conversion-functions#todatetime64) для преобразования `DateTime` в `DateTime64`:

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

И мы можем использовать [`toDateTime`](/sql-reference/functions/type-conversion-functions#todatetime) для перехода от `Date` или `DateTime64` обратно к `DateTime`:

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
