---
description: 'ClickHouse の Date32 データ型に関するドキュメントで、Date と比較して拡張された範囲の日付を格納します'
sidebar_label: 'Date32'
sidebar_position: 14
slug: /sql-reference/data-types/date32
title: 'Date32'
---


# Date32

日付を表します。 [DateTime64](../../sql-reference/data-types/datetime64.md) と同じ日付範囲をサポートしています。1900年1月1日以降の日数を表す値で、ネイティブバイトオーダーの符号付き32ビット整数として格納されます（0は1900年1月1日を表し、負の値は1900年以前の日数を表します）。

**例**

`Date32`型のカラムを持つテーブルを作成し、そのテーブルにデータを挿入する例:

```sql
CREATE TABLE dt32
(
    `timestamp` Date32,
    `event_id` UInt8
)
ENGINE = TinyLog;
```

```sql
-- 日付の解析
-- - 文字列から、
-- - 1970年1月1日以降の日数として解釈される'small'整数から、及び
-- - 1970年1月1日以降の秒数として解釈される'big'整数から。
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

**関連項目**

- [toDate32](../../sql-reference/functions/type-conversion-functions.md#todate32)
- [toDate32OrZero](/sql-reference/functions/type-conversion-functions#todate32orzero)
- [toDate32OrNull](/sql-reference/functions/type-conversion-functions#todate32ornull)
