---
'description': 'Documentation for the Time data type in ClickHouse, which stores the
  time range with second precision'
'slug': '/sql-reference/data-types/time'
'sidebar_position': 15
'sidebar_label': 'Time'
'title': 'Time'
---




# 時間

`Time` データ型は、カレンダーの日付に依存せずに時間値を保存するために使用されます。これは、日々のスケジュール、イベントの時間、または時間コンポーネント（時間、分、秒）のみが重要な状況を表現するのに最適です。

構文:

``` sql
Time()
```

サポートされる値の範囲: \[-999:59:59, 999:59:59\]。

解像度: 1秒。

## スピード {#speed}

`Date` データ型は、_ほとんど_ の条件下で `Time` よりも速いです。しかし、`Time` データ型は `DateTime` データ型とほぼ同じ速度です。

実装の詳細により、`Time` および `DateTime` 型は4バイトのストレージを必要とし、`Date` は2バイトを必要とします。ただし、データベースが圧縮されると、この違いは増幅されます。

## 使用上の注意 {#usage-remarks}

時点は、タイムゾーンや夏時間に関係なく、[Unix タイムスタンプ](https://en.wikipedia.org/wiki/Unix_time)として保存されます。

**注意:** `Time` データ型はタイムゾーンを考慮しません。それは、日付や地域のオフセットのコンテキストなしに、単独で時刻値を表します。`Time` カラムにタイムゾーンを適用または変更しようとする試みは、影響を及ぼさず、サポートされていません。

## 例 {#examples}

**1.** `Time` 型のカラムを持つテーブルを作成し、データを挿入します:

``` sql
CREATE TABLE dt
(
    `time` Time,
    `event_id` UInt8
)
ENGINE = TinyLog;
```

``` sql
-- 時間の解析
-- - 文字列から、
-- - 1970-01-01 からの秒数として解釈された整数から。
INSERT INTO dt VALUES ('100:00:00', 1), (12453, 3);

SELECT * FROM dt;
```

``` text
   ┌──────time─┬─event_id─┐
1. │ 100:00:00 │        1 │
2. │ 003:27:33 │        3 │
   └───────────┴──────────┘
```

**2.** `Time` 値でフィルタリング

``` sql
SELECT * FROM dt WHERE time = toTime('100:00:00')
```

``` text
   ┌──────time─┬─event_id─┐
1. │ 100:00:00 │        1 │
   └───────────┴──────────┘
```

`Time` カラムの値は、`WHERE` 節で文字列値を使用してフィルタリングできます。自動的に `Time` に変換されます:

``` sql
SELECT * FROM dt WHERE time = '100:00:00'
```

``` text
   ┌──────time─┬─event_id─┐
1. │ 100:00:00 │        1 │
   └───────────┴──────────┘
```

**3.** `Time` 型のカラムのタイムゾーンを取得する:

``` sql
SELECT toTime(now()) AS column, toTypeName(column) AS x
```

``` text
   ┌────column─┬─x────┐
1. │ 018:55:15 │ Time │
   └───────────┴──────┘
```


## 関連項目 {#see-also}

- [型変換関数](../functions/type-conversion-functions.md)
- [日付および時刻で操作するための関数](../functions/date-time-functions.md)
- [配列を操作するための関数](../functions/array-functions.md)
- [日付時刻入力フォーマット設定](../../operations/settings/settings-formats.md#date_time_input_format)
- [日付時刻出力フォーマット設定](../../operations/settings/settings-formats.md#date_time_output_format)
- [タイムゾーンサーバー構成パラメータ](../../operations/server-configuration-parameters/settings.md#timezone)
- [セッションタイムゾーン設定](../../operations/settings/settings.md#session_timezone)
- [DateTime データ型](datetime.md)
- [Date データ型](date.md)
