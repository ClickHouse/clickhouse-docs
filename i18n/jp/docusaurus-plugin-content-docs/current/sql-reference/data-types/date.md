---
description: 'ClickHouseのDateデータ型のドキュメント'
sidebar_label: '日付'
sidebar_position: 12
slug: '/sql-reference/data-types/date'
title: 'Date'
---




# 日付

日付。1970-01-01 からの経過日数として、符号なし二バイトで保存されます。Unixエポックの開始直後から、コンパイル時に定義された定数で設定された上限までの値を保存できます（現在、これは2149年までですが、最終的に完全にサポートされる年は2148年です）。

サポートされる値の範囲: \[1970-01-01, 2149-06-06\].

日付値はタイムゾーンなしで保存されます。

**例**

`Date`型のカラムを持つテーブルを作成し、データを挿入します：

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
-- - 1970-01-01 からの経過日数として解釈される'small'整数から、  
-- - 1970-01-01 からの経過秒数として解釈される'big'整数から。
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

**関連情報**

- [日付と時間を操作するための関数](../../sql-reference/functions/date-time-functions.md)
- [日付と時間を操作するための演算子](../../sql-reference/operators#operators-for-working-with-dates-and-times)
- [`DateTime`データ型](../../sql-reference/data-types/datetime.md)
