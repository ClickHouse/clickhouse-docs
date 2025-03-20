---
slug: /sql-reference/data-types/date
sidebar_position: 12
sidebar_label: 日付
---


# 日付

日付。1970-01-01からの経過日数を表す2バイトで保存されます（符号なし）。Unixエポックの開始直後から、コンパイル時に定義された上限（現在は2149年までですが、最終的に完全にサポートされる年は2148年です）までの値を保存することができます。

サポートされる値の範囲: \[1970-01-01, 2149-06-06\]。

日付の値はタイムゾーンなしで保存されます。

**例**

`Date`型のカラムを持つテーブルを作成し、そのデータを挿入する：

``` sql
CREATE TABLE dt
(
    `timestamp` Date,
    `event_id` UInt8
)
ENGINE = TinyLog;
```

``` sql
-- 日付の解析
-- - 文字列から,
-- - '小' 整数から（1970-01-01からの経過日数として解釈される）および
-- - '大' 整数から（1970-01-01からの経過秒数として解釈される）。
INSERT INTO dt VALUES ('2019-01-01', 1), (17897, 2), (1546300800, 3);

SELECT * FROM dt;
```

``` text
┌──timestamp─┬─event_id─┐
│ 2019-01-01 │        1 │
│ 2019-01-01 │        2 │
│ 2019-01-01 │        3 │
└────────────┴──────────┘
```

**関連情報**

- [日付と時間に関する関数](../../sql-reference/functions/date-time-functions.md)
- [日付と時間に関する演算子](../../sql-reference/operators#operators-for-working-with-dates-and-times)
- [`DateTime`データ型](../../sql-reference/data-types/datetime.md)
