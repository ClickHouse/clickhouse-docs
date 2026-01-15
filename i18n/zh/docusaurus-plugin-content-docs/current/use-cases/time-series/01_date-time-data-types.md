---
title: '日期和时间数据类型 - 时间序列'
sidebar_label: '日期和时间数据类型'
description: 'ClickHouse 中的时间序列数据类型。'
slug: /use-cases/time-series/date-time-data-types
keywords: ['时间序列', 'DateTime', 'DateTime64', 'Date', 'Time', 'Time64', '数据类型', '时序数据', '时间戳']
show_related_blogs: true
doc_type: 'reference'
---

# 日期和时间数据类型 {#date-and-time-data-types}

要有效管理时间序列数据，需要一套完整的日期和时间类型，而 ClickHouse 正好提供了这一点。
从紧凑的日期表示到具有纳秒精度的高精度时间戳，这些类型在存储效率与不同时间序列应用的实际需求之间取得了平衡。

无论是处理历史金融数据、IoT 传感器读数，还是未来日期的事件，ClickHouse 的日期和时间类型都能提供处理各种时间数据场景所需的灵活性。
支持的类型范围使你可以在保持用例所需精度的前提下，同时优化存储空间和查询性能。

* 在大多数情况下，[`Date`](/sql-reference/data-types/date) 类型就足够了。该类型使用 2 字节存储一个日期，取值范围为 `[1970-01-01, 2149-06-06]`。

* [`Date32`](/sql-reference/data-types/date32) 覆盖了更广的日期范围。它使用 4 字节存储一个日期，取值范围为 `[1900-01-01, 2299-12-31]`

* [`DateTime`](/sql-reference/data-types/datetime) 以秒为精度存储日期时间值，取值范围为 `[1970-01-01 00:00:00, 2106-02-07 06:28:15]`，每个值需要 4 字节。

* 当需要更高精度时，可以使用 [`DateTime64`](/sql-reference/data-types/datetime64)。它允许以最高纳秒精度存储时间，取值范围为 `[1900-01-01 00:00:00, 2299-12-31 23:59:59.99999999]`，每个值需要 8 字节。

我们来创建一张存储多种日期类型的表：

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

我们可以使用 [`now()`](/sql-reference/functions/date-time-functions#now) 函数返回当前时间，并使用 [`now64()`](/sql-reference/functions/date-time-functions#now64) 通过第一个参数指定精度来获取当前时间。

```sql
INSERT INTO dates 
SELECT now(), 
       now()::Date32 + toIntervalYear(100),
       now(), 
       now64(3), 
       now64(9) + toIntervalYear(200);
```

这会根据各列的类型填充相应的时间值：

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


## Time 和 Time64 类型 {#time-series-time-types}

对于需要存储不带日期组件的“时间（time-of-day）”值的场景，ClickHouse 提供了 [`Time`](/sql-reference/data-types/time) 和 [`Time64`](/sql-reference/data-types/time64) 类型，它们是在 25.6 版本中引入的。它们适用于表示重复日程、每日模式，或在逻辑上需要将日期与时间组件分离的情况。

:::note
使用 `Time` 和 `Time64` 需要启用以下设置：`SET enable_time_time64_type = 1;`

这些类型是在 25.6 版本中引入的。
:::

`Time` 类型以秒级精度存储小时、分钟和秒。其在内部以有符号 32 位整数存储，支持范围为 `[-999:59:59, 999:59:59]`，允许超过 24 小时的值。这在跟踪耗时或执行导致结果超出单日范围的算术运算时会很有用。

对于亚秒级精度，`Time64` 使用有符号 Decimal64 值存储时间，并提供可配置的小数秒精度。它接受一个精度参数（0–9），用于定义小数位数。常见的精度值包括 3（毫秒）、6（微秒）和 9（纳秒）。

`Time` 和 `Time64` 都不支持时区——它们表示的是纯粹的“一天中的时间（time-of-day）”值，不带任何区域上下文。

让我们创建一个带有时间列的表：

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

我们可以使用字符串字面量或数值来插入时间值。对于 `Time`，数值被解释为自 00:00:00 起经过的秒数。对于 `Time64`，数值被解释为自 00:00:00 起经过的秒数，其中小数部分会根据该列的精度进行解析：

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

时间值可以直接用于筛选：

```sql
SELECT * FROM time_examples WHERE basic_time = '14:30:25';
```


## 时区 {#time-series-timezones}

许多使用场景需要同时存储时区信息。我们可以将时区设置为 `DateTime` 或 `DateTime64` 类型的最后一个参数：

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

在 DDL 中定义好时区后，我们现在可以插入使用不同时区的时间数据：

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

现在来看一下表中的内容：

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

第一行中，我们使用 `America/New_York` 时区插入了所有值。

* `dt_1` 和 `dt64_1` 在查询时会自动转换为 `Europe/Berlin`。
* `dt_2` 和 `dt64_2` 没有指定时区，因此使用服务器的本地时区，在本例中是 `Europe/London`。

第二行中，我们在未指定时区的情况下插入了所有值，因此使用了服务器的本地时区。
与第一行相同，`dt_1` 和 `dt64_1` 被转换为 `Europe/Berlin`，而 `dt_2` 和 `dt64_2` 使用服务器的本地时区。


## 日期和时间函数 {#time-series-date-time-functions}

ClickHouse 还提供了一组函数，用于在不同数据类型之间相互转换。

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

我们可以使用 [`toDateTime64`](/sql-reference/functions/type-conversion-functions#toDateTime64) 将 `DateTime` 转换为 `DateTime64`：

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

此外，我们可以使用 [`toDateTime`](/sql-reference/functions/type-conversion-functions#toDateTime) 将 `Date` 或 `DateTime64` 转换回 `DateTime`：

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
