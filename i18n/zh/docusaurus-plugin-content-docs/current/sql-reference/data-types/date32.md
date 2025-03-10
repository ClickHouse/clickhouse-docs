---
slug: /sql-reference/data-types/date32
sidebar_position: 14
sidebar_label: Date32
---


# Date32

一种日期。支持与 [DateTime64](../../sql-reference/data-types/datetime64.md) 相同的日期范围。以原生字节顺序存储为有符号32位整数，值表示自1970-01-01以来的天数（0表示1970-01-01，负值表示1970年之前的天数）。

**示例**

创建一个带有 `Date32` 类型列的表并插入数据：

``` sql
CREATE TABLE dt32
(
    `timestamp` Date32,
    `event_id` UInt8
)
ENGINE = TinyLog;
```

``` sql
-- 解析日期
-- - 从字符串,
-- - 从被解释为自1970-01-01以来天数的“小”整数，以及
-- - 从被解释为自1970-01-01以来秒数的“大”整数。
INSERT INTO dt32 VALUES ('2100-01-01', 1), (47482, 2), (4102444800, 3);

SELECT * FROM dt32;
```

``` text
┌──timestamp─┬─event_id─┐
│ 2100-01-01 │        1 │
│ 2100-01-01 │        2 │
└────────────┴──────────┘
```

**另请参见**

- [toDate32](../../sql-reference/functions/type-conversion-functions.md#todate32)
- [toDate32OrZero](/sql-reference/functions/type-conversion-functions#todate32orzero)
- [toDate32OrNull](/sql-reference/functions/type-conversion-functions#todate32ornull)
