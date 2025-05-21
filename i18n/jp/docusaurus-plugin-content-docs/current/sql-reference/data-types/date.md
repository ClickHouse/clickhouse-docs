---
description: 'ClickHouseにおけるDateデータ型のドキュメント'
sidebar_label: 'Date'
sidebar_position: 12
slug: /sql-reference/data-types/date
title: 'Date'
---


# Date

日付。1970-01-01からの経過日数をunsignedの2バイトで保存します。Unixエポックの開始から、コンパイル時に定義された上限（現在は2149年まで、最終的にサポートされる年は2148年です）までの値を保存できます。

サポートされる値の範囲: \[1970-01-01, 2149-06-06\]。

日付の値は、タイムゾーンなしで保存されます。

**例**

`Date` 型のカラムを持つテーブルを作成し、データを挿入します:

```sql
CREATE TABLE dt
(
    `timestamp` Date,
    `event_id` UInt8
)
ENGINE = TinyLog;
```

```sql
-- 日付を解析
-- - 文字列から、
-- - 1970-01-01からの経過日数として解釈される'small'整数から、および
-- - 1970-01-01からの経過秒数として解釈される'big'整数から。
INSERT INTO dt VALUES ('2019-01-01', 1), (17897, 2), (1546300800, 3);

SELECT * FROM dt;
```

```text
┌──timestamp─┬─event_id─┐
│ 2019-01-01 │        1 │
│ 2019-01-01 │        2 │
│ 2019-01-01 │        3 │
└────────────┴──────────┘
```

**参照**

- [日付と時間を扱う関数](../../sql-reference/functions/date-time-functions.md)
- [日付と時間を扱う演算子](../../sql-reference/operators#operators-for-working-with-dates-and-times)
- [`DateTime` データ型](../../sql-reference/data-types/datetime.md)
