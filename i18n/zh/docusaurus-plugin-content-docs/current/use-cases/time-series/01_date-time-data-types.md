---
title: '日期和时间数据类型 - 时间序列'
sidebar_label: '日期和时间数据类型'
description: 'ClickHouse 中的时序数据类型。'
slug: /use-cases/time-series/date-time-data-types
keywords: ['时间序列', 'DateTime', 'DateTime64', 'Date', 'Time', 'Time64', '数据类型', '时序数据', '时间戳']
show_related_blogs: true
doc_type: 'reference'
---

# 日期和时间数据类型 \{#date-and-time-data-types\}

要高效管理时间序列数据，必须具备一套完善的日期和时间类型，而 ClickHouse 正是为此而设计。
从紧凑的日期表示到具备纳秒级精度的高精度时间戳，这些类型旨在兼顾存储效率与各类时间序列应用的实际需求。

无论您处理的是历史金融数据、IoT 传感器读数，还是未来发生的事件，ClickHouse 的日期和时间类型都能提供应对各种时间数据场景所需的灵活性。
丰富的支持类型使您能够在满足用例所需精度的同时，优化存储空间和查询性能。

* [`Date`](/sql-reference/data-types/date) 类型在大多数情况下已经足够。该类型存储一个日期需要 2 字节，取值范围限制为 `[1970-01-01, 2149-06-06]`。

* [`Date32`](/sql-reference/data-types/date32) 支持更大的日期范围。存储一个日期需要 4 字节，取值范围限制为 `[1900-01-01, 2299-12-31]`

* [`DateTime`](/sql-reference/data-types/datetime) 以秒级精度存储日期时间值，取值范围为 `[1970-01-01 00:00:00, 2106-02-07 06:28:15]`。每个值需要 4 字节。

* 对于需要更高精度的场景，可以使用 [`DateTime64`](/sql-reference/data-types/datetime64)。它支持存储最高纳秒级精度的时间，取值范围为 `[1900-01-01 00:00:00, 2299-12-31 23:59:59.99999999]`。每个值需要 8 字节。

让我们创建一个用于存储多种日期类型的表：

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

我们可以使用 [`now()`](/sql-reference/functions/date-time-functions#now) 函数返回当前时间，并使用 [`now64()`](/sql-reference/functions/date-time-functions#now64) 通过第一个参数按指定精度获取当前时间。

```sql
INSERT INTO dates 
SELECT now(), 
       now()::Date32 + toIntervalYear(100),
       now(), 
       now64(3), 
       now64(9) + toIntervalYear(200);
```

这将根据列类型，用相应的时间值填充各列：

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

## Time 和 Time64 类型 \{#time-series-time-types\}

对于需要存储不包含日期部分的时刻值的场景，ClickHouse 提供了 [`Time`](/sql-reference/data-types/time) 和 [`Time64`](/sql-reference/data-types/time64) 类型，它们在 25.6 版本中引入。这些类型适合用于表示周期性计划、每日规律，或其他适合将日期与时间分开处理的场景。

:::note
使用 `Time` 和 `Time64` 需要启用以下设置：`SET enable_time_time64_type = 1;`

这些类型在 25.6 版本中引入
:::

`Time` 类型以秒级精度存储小时、分钟和秒。其内部以有符号 32 位整数存储，支持 `[-999:59:59, 999:59:59]` 范围，因此可以表示超过 24 小时的值。这在跟踪耗时或执行算术操作后得到超出单日范围的值时非常有用。

如需亚秒级精度，`Time64` 以带可配置秒小数部分的有符号 Decimal64 值存储时间。它接受一个精度参数 (0-9)，用于定义小数位数。常见的精度值为 3 (毫秒) 、6 (微秒) 和 9 (纳秒) 。

`Time` 和 `Time64` 均不支持时区——它们表示的是不带区域上下文的纯时刻值。

让我们创建一个包含时间列的表：

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

可以使用字符串字面量或数值插入时间值。对于 `Time`，数值会被解释为自 00:00:00 起的秒数。对于 `Time64`，数值会被解释为自 00:00:00 起的秒数，其中的小数部分会根据该列的精度进行解释：

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

时间值可以很方便地进行筛选：

```sql
SELECT * FROM time_examples WHERE basic_time = '14:30:25';
```

## 时区 \{#time-series-timezones\}

许多用例还需要同时存储时区信息。我们可以将时区指定为 `DateTime` 或 `DateTime64` 类型的最后一个参数：

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

既然已在 DDL 中定义了时区，我们现在就可以插入带有不同时区的时间值：

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

现在来看看表中有哪些内容：

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

* `dt_1` 和 `dt64_1` 会在查询时自动转换为 `Europe/Berlin`。
* `dt_2` 和 `dt64_2` 没有指定时区，因此会使用服务器的本地时区，这种情况下为 `Europe/London`。

在第二行中，我们插入所有值时都未使用时区，因此使用的是服务器的本地时区。
与第一行一样，`dt_1` 和 `dt64_1` 会转换为 `Europe/Berlin`，而 `dt_2` 和 `dt64_2` 使用服务器的本地时区。

## 日期和时间函数 \{#time-series-date-time-functions\}

ClickHouse 还提供了一组函数，用于在不同的数据类型之间进行转换。

例如，我们可以使用 [`toDate`](/sql-reference/functions/type-conversion-functions#toDate) 将 `DateTime` 值转换为 `Date` 类型：

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

我们可以使用 [`toDateTime64`](/sql-reference/functions/type-conversion-functions#toDateTime64) 将 `DateTime` 类型转换为 `DateTime64`：

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

我们还可以使用 [`toDateTime`](/sql-reference/functions/type-conversion-functions#toDateTime) 将 `Date` 或 `DateTime64` 转换回 `DateTime`：

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
