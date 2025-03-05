---
slug: /sql-reference/data-types/date32
sidebar_position: 14
sidebar_label: Date32
---


# Date32

日付を表します。 [DateTime64](../../sql-reference/data-types/datetime64.md) と同じ日付範囲をサポートしています。1970-01-01からの日数を表す値として、ネイティブバイトオーダーで符号付き32ビット整数として格納されます（0は1970-01-01を表し、負の値は1970年より前の日数を表します）。

**例**

`Date32` 型のカラムを持つテーブルを作成し、データを挿入します。

``` sql
CREATE TABLE dt32
(
    `timestamp` Date32,
    `event_id` UInt8
)
ENGINE = TinyLog;
```

``` sql
-- 日付を解析
-- - 文字列から、
-- - '小' 整数（1970-01-01からの日数として解釈）から、及び
-- - '大' 整数（1970-01-01からの秒数として解釈）から。
INSERT INTO dt32 VALUES ('2100-01-01', 1), (47482, 2), (4102444800, 3);

SELECT * FROM dt32;
```

``` text
┌──timestamp─┬─event_id─┐
│ 2100-01-01 │        1 │
│ 2100-01-01 │        2 │
└────────────┴──────────┘
```

**関連情報**

- [toDate32](../../sql-reference/functions/type-conversion-functions.md#todate32)
- [toDate32OrZero](../../sql-reference/functions/type-conversion-functions.md#todate32-or-zero)
- [toDate32OrNull](../../sql-reference/functions/type-conversion-functions.md#todate32-or-null)
