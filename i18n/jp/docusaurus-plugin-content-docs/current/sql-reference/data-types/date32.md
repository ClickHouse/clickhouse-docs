---
'description': 'ClickHouseにおけるDate32データ型のドキュメントで、Dateと比較して拡張された範囲の日付を保存します。'
'sidebar_label': 'Date32'
'sidebar_position': 14
'slug': '/sql-reference/data-types/date32'
'title': 'Date32'
'doc_type': 'reference'
---


# Date32

日付。 [DateTime64](../../sql-reference/data-types/datetime64.md) と同じ日付範囲をサポートします。 `1900-01-01` からの経過日数を表す値として、ネイティブのバイト順序で符号付き32ビット整数として保存されます。 **重要！** 0は `1970-01-01` を表し、負の値は `1970-01-01` より前の日数を示します。

**例**

`Date32` タイプのカラムを持つテーブルを作成し、データを挿入する:

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

**関連項目**

- [toDate32](../../sql-reference/functions/type-conversion-functions.md#todate32)
- [toDate32OrZero](/sql-reference/functions/type-conversion-functions#todate32orzero)
- [toDate32OrNull](/sql-reference/functions/type-conversion-functions#todate32ornull)
