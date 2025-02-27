---
slug: /sql-reference/data-types/date
sidebar_position: 12
sidebar_label: 日付
---

# 日付

日付。1970-01-01からの日数を示す無符号の2バイトとして保存されます。Unixエポックの開始から、コンパイル時に定義された定数による上限までの値を格納できます（現在は2149年までですが、最終的に完全にサポートされる年は2148年です）。

サポートされている値の範囲: \[1970-01-01, 2149-06-06\]。

日付の値は、タイムゾーンなしで保存されます。

**例**

`Date`型のカラムを持つテーブルを作成し、そのデータを挿入する:

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
-- - 文字列から、
-- - '小' 整数として解釈された1970-01-01からの日数、
-- - '大' 整数として解釈された1970-01-01からの秒数。
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

- [日付と時刻で作業するための関数](../../sql-reference/functions/date-time-functions.md)
- [日付と時刻で作業するための演算子](../../sql-reference/operators/index.md#operators-datetime)
- [`DateTime`データ型](../../sql-reference/data-types/datetime.md)
