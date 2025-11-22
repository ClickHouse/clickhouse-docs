---
description: 'ClickHouse 中 Date 数据类型文档'
sidebar_label: 'Date'
sidebar_position: 12
slug: /sql-reference/data-types/date
title: 'Date'
doc_type: 'reference'
---

# Date

表示日期。以无符号两字节整数形式存储，为自 1970-01-01 起的天数。可存储的值范围从 Unix 纪元（Unix Epoch）开始之后，到编译阶段由常量定义的上限（当前上限为 2149 年，但最后完全受支持的年份为 2148 年）。

支持的取值范围：[1970-01-01, 2149-06-06]。

日期值在存储时不包含时区信息。

**示例**

创建一个带有 `Date` 类型列的表并向其中插入数据：

```sql
CREATE TABLE dt
(
    `timestamp` Date,
    `event_id` UInt8
)
ENGINE = TinyLog;
```

```sql
-- 解析日期
-- - 从字符串解析，
-- - 从"小"整数解析（解释为自 1970-01-01 以来的天数），以及
-- - 从"大"整数解析（解释为自 1970-01-01 以来的秒数）。
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
