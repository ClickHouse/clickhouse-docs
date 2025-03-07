---
slug: '/sql-reference/data-types/date32'
sidebar_position: 14
sidebar_label: 'Date32'
keywords: ['Date32', 'データ型', 'ClickHouse']
description: 'Date32型は1970年1月1日以降の日数を表す日付です。'
---


# Date32

日付。 [DateTime64](../../sql-reference/data-types/datetime64.md) と同じ日付範囲をサポートしています。1970年1月1日からの経過日数を表す値として、ネイティブバイトオーダーの符号付き32ビット整数として保存されます（0は1970年1月1日を表し、負の値は1970年以前の日数を示します）。

**例**

`Date32`型のカラムを持つテーブルを作成し、そこにデータを挿入する例：

``` sql
CREATE TABLE dt32
(
    `timestamp` Date32,
    `event_id` UInt8
)
ENGINE = TinyLog;
```

``` sql
-- 日付の解析
-- - 文字列から、
-- - 1970年1月1日からの日数として解釈される'small'整数から、及び
-- - 1970年1月1日からの秒数として解釈される'big'整数から。
INSERT INTO dt32 VALUES ('2100-01-01', 1), (47482, 2), (4102444800, 3);

SELECT * FROM dt32;
```

``` text
┌──timestamp─┬─event_id─┐
│ 2100-01-01 │        1 │
│ 2100-01-01 │        2 │
└────────────┴──────────┘
```

**関連リンク**

- [toDate32](../../sql-reference/functions/type-conversion-functions.md#todate32)
- [toDate32OrZero](/sql-reference/functions/type-conversion-functions#todate32orzero)
- [toDate32OrNull](/sql-reference/functions/type-conversion-functions#todate32ornull)
