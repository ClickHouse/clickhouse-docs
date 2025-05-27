---
'description': 'ClickHouse 中的 Date 数据类型文档'
'sidebar_label': '日期'
'sidebar_position': 12
'slug': '/sql-reference/data-types/date'
'title': '日期'
---


# 日期

一个日期。以两个字节存储，自1970年1月1日以来的天数（无符号）。允许存储值的范围从Unix纪元开始后不久到在编译阶段定义的常量所定义的上限（目前为2149年，但最终完全支持的年份是2148年）。

支持的值范围：\[1970年1月1日, 2149年6月6日\]。

日期值不带时区存储。

**示例**

创建一个带有 `Date` 类型列的表并插入数据：

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
