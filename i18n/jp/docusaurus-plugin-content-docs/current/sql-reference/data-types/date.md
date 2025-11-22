---
description: 'ClickHouse の Date データ型に関するドキュメント'
sidebar_label: 'Date'
sidebar_position: 12
slug: /sql-reference/data-types/date
title: 'Date'
doc_type: 'reference'
---

# Date

日付。1970-01-01 からの経過日数を表す符号なし 2 バイト整数として保存されます。Unix エポックの開始直後から、コンパイル時に定数として定義される上限値までの値を保存できます（現在は 2149 年までですが、完全にサポートされる最終年は 2148 年です）。

サポートされる値の範囲: [1970-01-01, 2149-06-06]。

日付の値はタイムゾーンを考慮せずに保存されます。

**例**

`Date` 型の列を持つテーブルを作成し、その列にデータを挿入します:

```sql
CREATE TABLE dt
(
    `timestamp` Date,
    `event_id` UInt8
)
ENGINE = TinyLog;
```

```sql
-- 日付の解析
-- - 文字列から
-- - 1970-01-01からの日数として解釈される「小さい」整数から
-- - 1970-01-01からの秒数として解釈される「大きい」整数から
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

**関連項目**

* [日付と時刻を扱う関数](../../sql-reference/functions/date-time-functions.md)
* [日付と時刻を扱う演算子](../../sql-reference/operators#operators-for-working-with-dates-and-times)
* [`DateTime` データ型](../../sql-reference/data-types/datetime.md)
