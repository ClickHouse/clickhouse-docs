---
'description': 'ClickHouse 中 Date32 数据类型的文档，它存储的日期范围比 Date 更大'
'sidebar_label': 'Date32'
'sidebar_position': 14
'slug': '/sql-reference/data-types/date32'
'title': 'Date32'
---


# Date32

一种日期。支持与 [DateTime64](../../sql-reference/data-types/datetime64.md) 相同的日期范围。以原生字节顺序存储为有符号的32位整数，其值表示自1900-01-01以来的天数（0表示1900-01-01，负值表示1900年前的天数）。

**示例**

创建一个具有 `Date32` 类型列的表并插入数据：

```sql
CREATE TABLE dt32
(
    `timestamp` Date32,
    `event_id` UInt8
)
ENGINE = TinyLog;
```

```sql
-- Parse Date
-- - from string,
-- - from 'small' integer interpreted as number of days since 1970-01-01, and
-- - from 'big' integer interpreted as number of seconds since 1970-01-01.
INSERT INTO dt32 VALUES ('2100-01-01', 1), (47482, 2), (4102444800, 3);

SELECT * FROM dt32;
```

```text
┌──timestamp─┬─event_id─┐
│ 2100-01-01 │        1 │
│ 2100-01-01 │        2 │
│ 2100-01-01 │        3 │
└────────────┴──────────┘
```

**另见**

- [toDate32](../../sql-reference/functions/type-conversion-functions.md#todate32)
- [toDate32OrZero](/sql-reference/functions/type-conversion-functions#todate32orzero)
- [toDate32OrNull](/sql-reference/functions/type-conversion-functions#todate32ornull)
