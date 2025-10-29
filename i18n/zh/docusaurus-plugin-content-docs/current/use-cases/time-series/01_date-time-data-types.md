---
'title': '日期和时间数据类型 - 时间序列'
'sidebar_label': '日期和时间数据类型'
'description': 'ClickHouse中的时间序列数据类型。'
'slug': '/use-cases/time-series/date-time-data-types'
'keywords':
- 'Time Series'
- 'DateTime'
'show_related_blogs': true
'doc_type': 'reference'
---


# 日期和时间数据类型

拥有全面的日期和时间类型对于有效的时间序列数据管理是必要的，而 ClickHouse 正是提供了这一点。
从紧凑的日期表示到以纳秒精度的高精度时间戳，这些类型旨在平衡存储效率与不同时间序列应用的实际需求。

无论您是在处理历史金融数据、物联网传感器读数，还是未来日期的事件，ClickHouse 的日期和时间类型都提供了处理各种时间数据场景所需的灵活性。
支持的类型范围使您能够在优化存储空间和查询性能的同时，保持您用例所需的精度。

* [`Date`](/sql-reference/data-types/date) 类型在大多数情况下都是足够的。此类型需要 2 个字节来存储一个日期，限制范围为 `[1970-01-01, 2149-06-06]`。

* [`Date32`](/sql-reference/data-types/date32) 覆盖了更广泛的日期范围。它需要 4 个字节来存储一个日期，限制范围为 `[1900-01-01, 2299-12-31]`。

* [`DateTime`](/sql-reference/data-types/datetime) 存储秒精度的日期时间值，范围为 `[1970-01-01 00:00:00, 2106-02-07 06:28:15]`。它需要每个值 4 个字节。

* 对于需要更多精度的情况，可以使用 [`DateTime64`](/sql-reference/data-types/datetime64)。这允许以纳秒精度存储时间，范围为 `[1900-01-01 00:00:00, 2299-12-31 23:59:59.99999999]`。它每个值需要 8 个字节。

让我们创建一个存储各种日期类型的表：

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

我们可以使用 [`now()`](/sql-reference/functions/date-time-functions#now) 函数返回当前时间，并使用 [`now64()`](/sql-reference/functions/date-time-functions#now64) 通过第一个参数以指定精度获取时间。

```sql
INSERT INTO dates 
SELECT now(), 
       now()::Date32 + toIntervalYear(100),
       now(), 
       now64(3), 
       now64(9) + toIntervalYear(200);
```

这将根据列类型相应填充我们的列：

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

## 时区 {#time-series-timezones}

许多用例还需要存储时区。我们可以将时区设为 `DateTime` 或 `DateTime64` 类型的最后一个参数：

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

在我们的 DDL 中定义了时区后，我们现在可以使用不同的时区插入时间：

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

现在让我们查看一下我们的表中有什么内容：

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

在第一行中，我们使用 `America/New_York` 时区插入了所有值。
* `dt_1` 和 `dt64_1` 在查询时自动转换为 `Europe/Berlin`。
* `dt_2` 和 `dt64_2` 没有指定时区，因此使用服务器的本地时区，在这种情况下是 `Europe/London`。

在第二行中，我们插入的所有值都没有时区，因此使用了服务器的本地时区。
与第一行一样，`dt_1` 和 `dt_3` 被转换为 `Europe/Berlin`，而 `dt_2` 和 `dt64_2` 使用了服务器的本地时区。

## 日期和时间函数 {#time-series-date-time-functions}

ClickHouse 还提供了一组函数，允许我们在不同数据类型之间进行转换。

例如，我们可以使用 [`toDate`](/sql-reference/functions/type-conversion-functions#todate) 将 `DateTime` 值转换为 `Date` 类型：

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

我们可以使用 [`toDateTime64`](/sql-reference/functions/type-conversion-functions#todatetime64) 将 `DateTime` 转换为 `DateTime64`：

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

我们可以使用 [`toDateTime`](/sql-reference/functions/type-conversion-functions#todatetime) 从 `Date` 或 `DateTime64` 回到 `DateTime`：

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
