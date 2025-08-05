---
description: 'Documentation for the Date32 data type in ClickHouse, which stores
  dates with an extended range compared to Date'
sidebar_label: 'Date32'
sidebar_position: 14
slug: '/sql-reference/data-types/date32'
title: 'Date32'
---




# Date32

日付。 [DateTime64](../../sql-reference/data-types/datetime64.md) と同じ日付範囲をサポートしています。 1900-01-01 からの日数を表す値で、ネイティブバイトオーダーで符号付き32ビット整数として保存されます（0は1900-01-01を表し、負の値は1900年より前の日数を表します）。

**例**

`Date32`型のカラムを持つテーブルを作成し、データを挿入する:

```sql
CREATE TABLE dt32
(
    `timestamp` Date32,
    `event_id` UInt8
)
ENGINE = TinyLog;
```

```sql
-- 日付を解析
-- - 文字列から、
-- - 1970-01-01以降の日数として解釈される'small'整数から、及び
-- - 1970-01-01以降の秒数として解釈される'big'整数から。
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

**関連リンク**

- [toDate32](../../sql-reference/functions/type-conversion-functions.md#todate32)
- [toDate32OrZero](/sql-reference/functions/type-conversion-functions#todate32orzero)
- [toDate32OrNull](/sql-reference/functions/type-conversion-functions#todate32ornull)
