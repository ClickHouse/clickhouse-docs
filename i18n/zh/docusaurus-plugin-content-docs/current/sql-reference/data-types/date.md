---
'description': 'ClickHouse 中 Date 数据类型的文档'
'sidebar_label': 'Date'
'sidebar_position': 12
'slug': '/sql-reference/data-types/date'
'title': 'Date'
'doc_type': 'reference'
---


# Date

一个日期。以两个字节存储为自1970-01-01以来的天数（无符号）。允许存储从Unix纪元开始后的值到在编译阶段定义的常量所定义的上限（目前，这在2149年之前，但最终完全支持的年份是2148年）。

支持的值范围：\[1970-01-01, 2149-06-06\]。

日期值不存储时区。

**示例**

创建一个带有`Date`类型列的表并向其中插入数据：

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

- [处理日期和时间的函数](../../sql-reference/functions/date-time-functions.md)
- [处理日期和时间的运算符](../../sql-reference/operators#operators-for-working-with-dates-and-times)
- [`DateTime` 数据类型](../../sql-reference/data-types/datetime.md)
