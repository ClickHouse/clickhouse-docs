---
description: 'サブ秒精度のタイムスタンプを保持する ClickHouse の DateTime64 データ型に関するドキュメント'
sidebar_label: 'DateTime64'
sidebar_position: 18
slug: /sql-reference/data-types/datetime64
title: 'DateTime64'
doc_type: 'reference'
---



# DateTime64

カレンダーの日付と一日の時刻で表現できる時点を、サブ秒精度を指定して保存できます。

ティックサイズ（精度）：10<sup>-precision</sup> 秒。 有効な範囲: [ 0 : 9 ]。
一般的には、3（ミリ秒）、6（マイクロ秒）、9（ナノ秒）が使用されます。

**構文:**

```sql
DateTime64(precision, [timezone])
```

内部的には、エポックの開始（1970-01-01 00:00:00 UTC）からの「ティック」数を Int64 として保持します。ティックの解像度は precision パラメータによって決定されます。さらに、`DateTime64` 型は列全体で共通のタイムゾーンを保持することができ、これにより `DateTime64` 型の値がテキスト形式でどのように表示されるか、および文字列として指定された値（&#39;2020-01-01 05:00:01.000&#39;）がどのように解釈・解析されるかに影響します。タイムゾーンはテーブル（または結果セット）の各行には保存されず、列メタデータに保存されます。詳細は [DateTime](../../sql-reference/data-types/datetime.md) を参照してください。

サポートされる値の範囲: [1900-01-01 00:00:00, 2299-12-31 23:59:59.999999999]

小数点以下の桁数は precision パラメータによって決まります。

注意: 上限値に対する精度は 8 です。最大精度である 9 桁（ナノ秒）を使用する場合、UTC におけるサポートされる最大値は `2262-04-11 23:47:16` です。


## 例 {#examples}

1. `DateTime64`型のカラムを持つテーブルを作成し、データを挿入する:

```sql
CREATE TABLE dt64
(
    `timestamp` DateTime64(3, 'Asia/Istanbul'),
    `event_id` UInt8
)
ENGINE = TinyLog;
```

```sql
-- DateTimeを解析
-- - 整数値から: 1970-01-01からのマイクロ秒数として解釈(精度が3のため)
-- - 小数値から: 小数点前は秒数として解釈し、小数点以下は精度に基づいて解釈
-- - 文字列から
INSERT INTO dt64 VALUES (1546300800123, 1), (1546300800.123, 2), ('2019-01-01 00:00:00', 3);

SELECT * FROM dt64;
```

```text
┌───────────────timestamp─┬─event_id─┐
│ 2019-01-01 03:00:00.123 │        1 │
│ 2019-01-01 03:00:00.123 │        2 │
│ 2019-01-01 00:00:00.000 │        3 │
└─────────────────────────┴──────────┘
```

- 日時を整数値として挿入する場合、適切にスケーリングされたUnixタイムスタンプ(UTC)として扱われます。`1546300800000`(精度3)は`'2019-01-01 00:00:00'` UTCを表します。ただし、`timestamp`カラムには`Asia/Istanbul`(UTC+3)タイムゾーンが指定されているため、文字列として出力する際には`'2019-01-01 03:00:00'`と表示されます。日時を小数値として挿入する場合も整数値と同様に扱われますが、小数点前の値は秒単位までのUnixタイムスタンプとなり、小数点以下は精度として扱われます。
- 文字列値を日時として挿入する場合、カラムのタイムゾーンにあるものとして扱われます。`'2019-01-01 00:00:00'`は`Asia/Istanbul`タイムゾーンにあるものとして扱われ、`1546290000000`として保存されます。

2. `DateTime64`値でのフィルタリング

```sql
SELECT * FROM dt64 WHERE timestamp = toDateTime64('2019-01-01 00:00:00', 3, 'Asia/Istanbul');
```

```text
┌───────────────timestamp─┬─event_id─┐
│ 2019-01-01 00:00:00.000 │        3 │
└─────────────────────────┴──────────┘
```

`DateTime`とは異なり、`DateTime64`値は`String`から自動的に変換されません。

```sql
SELECT * FROM dt64 WHERE timestamp = toDateTime64(1546300800.123, 3);
```

```text
┌───────────────timestamp─┬─event_id─┐
│ 2019-01-01 03:00:00.123 │        1 │
│ 2019-01-01 03:00:00.123 │        2 │
└─────────────────────────┴──────────┘
```

挿入時とは対照的に、`toDateTime64`関数はすべての値を小数形式として扱うため、小数点以下に精度を指定する必要があります。

3. `DateTime64`型の値のタイムゾーンを取得する:

```sql
SELECT toDateTime64(now(), 3, 'Asia/Istanbul') AS column, toTypeName(column) AS x;
```

```text
┌──────────────────column─┬─x──────────────────────────────┐
│ 2023-06-05 00:09:52.000 │ DateTime64(3, 'Asia/Istanbul') │
└─────────────────────────┴────────────────────────────────┘
```

4. タイムゾーン変換

```sql
SELECT
toDateTime64(timestamp, 3, 'Europe/London') AS lon_time,
toDateTime64(timestamp, 3, 'Asia/Istanbul') AS istanbul_time
FROM dt64;
```


```text
┌────────────────lon_time─┬───────────istanbul_time─┐
│ 2019-01-01 00:00:00.123 │ 2019-01-01 03:00:00.123 │
│ 2019-01-01 00:00:00.123 │ 2019-01-01 03:00:00.123 │
│ 2018-12-31 21:00:00.000 │ 2019-01-01 00:00:00.000 │
└─────────────────────────┴─────────────────────────┘
```

**関連項目**

* [型変換関数](../../sql-reference/functions/type-conversion-functions.md)
* [日付と時刻を扱う関数](../../sql-reference/functions/date-time-functions.md)
* [`date_time_input_format` 設定](../../operations/settings/settings-formats.md#date_time_input_format)
* [`date_time_output_format` 設定](../../operations/settings/settings-formats.md#date_time_output_format)
* [`timezone` サーバー構成パラメーター](../../operations/server-configuration-parameters/settings.md#timezone)
* [`session_timezone` 設定](../../operations/settings/settings.md#session_timezone)
* [日付と時刻を扱う演算子](../../sql-reference/operators/index.md#operators-for-working-with-dates-and-times)
* [`Date` データ型](../../sql-reference/data-types/date.md)
* [`DateTime` データ型](../../sql-reference/data-types/datetime.md)
