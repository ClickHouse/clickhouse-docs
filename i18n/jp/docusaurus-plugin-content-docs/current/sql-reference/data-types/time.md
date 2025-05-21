description: 'ClickHouseにおけるTimeデータ型のドキュメントで、秒単位の精度で時間範囲を保存します'
slug: /sql-reference/data-types/time
sidebar_position: 15
sidebar_label: 'Time'
title: 'Time'
```


# Time

`Time` データ型は、カレンダーの日付に依存しない時間値を保存するために使用されます。これは、日々のスケジュール、イベントの時間、または時間のコンポーネント（時、分、秒）のみが重要な状況に最適です。

構文:

``` sql
Time()
```

サポートされている値の範囲: \[-999:59:59, 999:59:59\]。

解像度: 1秒。

## Speed {#speed}

`Date` データ型は、_ほとんどの場合_ `Time` よりも速いです。しかし、`Time` データ型は `DateTime` データ型とほぼ同じ速度です。

実装の詳細により、`Time` と `DateTime` 型は4バイトのストレージを必要とし、`Date` は2バイトを必要とします。ただし、データベースが圧縮されたとき、この違いは拡大します。

## Usage Remarks {#usage-remarks}

時点は、タイムゾーンや夏時間に関係なく、[Unixタイムスタンプ](https://en.wikipedia.org/wiki/Unix_time)として保存されます。

**注意:** Timeデータ型はタイムゾーンを考慮しません。それは、日付や地域のオフセット文脈なしに独自の時間を表します。Timeカラムにタイムゾーンを適用または変更しようとすると、効果がなく、サポートされません。

## Examples {#examples}

**1.** `Time`型カラムを持つテーブルを作成し、データを挿入する:

``` sql
CREATE TABLE dt
(
    `time` Time,
    `event_id` UInt8
)
ENGINE = TinyLog;
```

``` sql
-- Timeを解析
-- - 文字列から、
-- - 1970-01-01以降の経過秒数として解釈される整数から。
INSERT INTO dt VALUES ('100:00:00', 1), (12453, 3);

SELECT * FROM dt;
```

``` text
   ┌──────time─┬─event_id─┐
1. │ 100:00:00 │        1 │
2. │ 003:27:33 │        3 │
   └───────────┴──────────┘
```

**2.** `Time`値でのフィルタリング

``` sql
SELECT * FROM dt WHERE time = toTime('100:00:00')
```

``` text
   ┌──────time─┬─event_id─┐
1. │ 100:00:00 │        1 │
   └───────────┴──────────┘
```

`Time`カラムの値は、`WHERE`述語内で文字列値を使用してフィルタリングできます。それは自動的に`Time`に変換されます:

``` sql
SELECT * FROM dt WHERE time = '100:00:00'
```

``` text
   ┌──────time─┬─event_id─┐
1. │ 100:00:00 │        1 │
   └───────────┴──────────┘
```

**3.** `Time`型カラムのタイムゾーンを取得する:

``` sql
SELECT toTime(now()) AS column, toTypeName(column) AS x
```

``` text
   ┌────column─┬─x────┐
1. │ 018:55:15 │ Time │
   └───────────┴──────┘
```

## See Also {#see-also}

- [型変換関数](../functions/type-conversion-functions.md)
- [日付と時間を扱うための関数](../functions/date-time-functions.md)
- [配列を扱うための関数](../functions/array-functions.md)
- [`date_time_input_format`設定](../../operations/settings/settings-formats.md#date_time_input_format)
- [`date_time_output_format`設定](../../operations/settings/settings-formats.md#date_time_output_format)
- [`timezone`サーバー設定パラメータ](../../operations/server-configuration-parameters/settings.md#timezone)
- [`session_timezone`設定](../../operations/settings/settings.md#session_timezone)
- [`DateTime`データ型](datetime.md)
- [`Date`データ型](date.md)
