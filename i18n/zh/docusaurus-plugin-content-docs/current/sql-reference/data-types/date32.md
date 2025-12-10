---
description: 'ClickHouse 中 Date32 数据类型的文档，用于存储比 Date 具有更大取值范围的日期'
sidebar_label: 'Date32'
sidebar_position: 14
slug: /sql-reference/data-types/date32
title: 'Date32'
doc_type: 'reference'
---

# Date32 {#date32}

一种日期类型。支持与 [DateTime64](../../sql-reference/data-types/datetime64.md) 相同的日期范围。以本机字节序的有符号 32 位整数形式存储，其数值表示自 `1900-01-01` 起经过的天数。**重要！** 数值 0 表示 `1970-01-01`，负值表示 `1970-01-01` 之前的天数。

**示例**

创建一个包含 `Date32` 类型列的表并向其中插入数据：

```sql
CREATE TABLE dt32
(
    `timestamp` Date32,
    `event_id` UInt8
)
ENGINE = TinyLog;
```

```sql
-- 解析日期
-- - 从字符串解析
-- - 从"小"整数解析（解释为自 1970-01-01 以来的天数）
-- - 从"大"整数解析（解释为自 1970-01-01 以来的秒数）
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

**另请参阅**

* [toDate32](../../sql-reference/functions/type-conversion-functions.md#todate32)
* [toDate32OrZero](/sql-reference/functions/type-conversion-functions#todate32orzero)
* [toDate32OrNull](/sql-reference/functions/type-conversion-functions#todate32ornull)
