---
slug: /sql-reference/data-types/date
sidebar_position: 12
sidebar_label: 日期
---


# 日期

日期。以无符号二字节形式存储，自1970-01-01以来的天数。允许存储从Unix纪元开始后的值到编译阶段定义的上限（目前为2149年，但最终完全支持的年份为2148年）。

支持的值范围：\[1970-01-01, 2149-06-06\]。

日期值在存储时不带时区。

**示例**

创建一个带有 `Date` 类型列的表并插入数据：

``` sql
CREATE TABLE dt
(
    `timestamp` Date,
    `event_id` UInt8
)
ENGINE = TinyLog;
```

``` sql
-- 解析日期
-- - 从字符串,
-- - 从被解释为自1970-01-01以来天数的 '小' 整数, 以及
-- - 从被解释为自1970-01-01以来秒数的 '大' 整数.
INSERT INTO dt VALUES ('2019-01-01', 1), (17897, 2), (1546300800, 3);

SELECT * FROM dt;
```

``` text
┌──timestamp─┬─event_id─┐
│ 2019-01-01 │        1 │
│ 2019-01-01 │        2 │
│ 2019-01-01 │        3 │
└────────────┴──────────┘
```

**另见**

- [处理日期和时间的函数](../../sql-reference/functions/date-time-functions.md)
- [处理日期和时间的运算符](../../sql-reference/operators#operators-for-working-with-dates-and-times)
- [`DateTime` 数据类型](../../sql-reference/data-types/datetime.md)
