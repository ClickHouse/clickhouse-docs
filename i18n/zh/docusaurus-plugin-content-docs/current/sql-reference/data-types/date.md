---
description: '关于 ClickHouse 中 Date 数据类型的文档'
sidebar_label: 'Date'
sidebar_position: 12
slug: /sql-reference/data-types/date
title: 'Date'
doc_type: 'reference'
---

# Date \{#date\}

一个日期值。以两个字节存储，为自 1970-01-01 起的天数（无符号）。允许存储的取值范围从 Unix 纪元起点之后，到在编译阶段由常量定义的上限（目前为 2149 年，但最后一个完全受支持的年份是 2148 年）。

支持的取值范围：[1970-01-01, 2149-06-06]。

日期值在存储时不包含时区信息。

**示例**

创建一个包含 `Date` 类型列的表并向其中插入数据：

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

**另请参阅**

* [用于处理日期和时间的函数](../../sql-reference/functions/date-time-functions.md)
* [用于处理日期和时间的运算符](../../sql-reference/operators#operators-for-working-with-dates-and-times)
* [`DateTime` 数据类型](../../sql-reference/data-types/datetime.md)
