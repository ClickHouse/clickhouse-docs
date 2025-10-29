---
'description': 'ClickHouseにおけるDateデータ型のDocumentation'
'sidebar_label': '日付'
'sidebar_position': 12
'slug': '/sql-reference/data-types/date'
'title': '日付'
'doc_type': 'reference'
---


# 日付

日付。1970-01-01からの経過日数を2バイトで保存します（符号なし）。Unixエポックの始まりから、コンパイル時に定義された定数によって定義された上限（現在は2149年までですが、最終的に完全にサポートされる年は2148年です）までの値を保存することができます。

サポートされている値の範囲: \[1970-01-01, 2149-06-06\]。

日付の値はタイムゾーンなしで保存されます。

**例**

`Date`型のカラムを持つテーブルを作成し、データを挿入する：

```sql
CREATE TABLE dt
(
    `timestamp` Date,
    `event_id` UInt8
)
ENGINE = TinyLog;
```

```sql
-- Parse Date
-- - from string,
-- - from 'small' integer interpreted as number of days since 1970-01-01, and
-- - from 'big' integer interpreted as number of seconds since 1970-01-01.
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

- [日付と時刻に関する関数](../../sql-reference/functions/date-time-functions.md)
- [日付と時刻に関する演算子](../../sql-reference/operators#operators-for-working-with-dates-and-times)
- [`DateTime`データ型](../../sql-reference/data-types/datetime.md)
