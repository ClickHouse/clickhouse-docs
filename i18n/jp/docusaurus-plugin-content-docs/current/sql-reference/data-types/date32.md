---
description: 'ClickHouse における Date32 データ型に関するドキュメント。Date 型と比べて、より広い範囲の日付を保存できます'
sidebar_label: 'Date32'
sidebar_position: 14
slug: /sql-reference/data-types/date32
title: 'Date32'
doc_type: 'reference'
---

# Date32

日付型です。[DateTime64](../../sql-reference/data-types/datetime64.md) と同じ日付範囲をサポートします。ネイティブバイトオーダーの符号付き 32 ビット整数として保存され、その値は `1900-01-01` からの経過日数を表します。**重要!** 0 は `1970-01-01` を表し、負の値は `1970-01-01` より前の日付を表します。

**例**

`Date32` 型のカラムを持つテーブルを作成し、データを挿入する例:

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
-- - 文字列から
-- - 1970-01-01からの日数として解釈される「小さい」整数から
-- - 1970-01-01からの秒数として解釈される「大きい」整数から
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

* [toDate32](../../sql-reference/functions/type-conversion-functions.md#todate32)
* [toDate32OrZero](/sql-reference/functions/type-conversion-functions#todate32orzero)
* [toDate32OrNull](/sql-reference/functions/type-conversion-functions#todate32ornull)
