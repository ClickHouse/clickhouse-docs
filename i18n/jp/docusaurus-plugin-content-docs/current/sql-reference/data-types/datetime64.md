---
description: 'サブ秒精度のタイムスタンプを格納する ClickHouse の DateTime64 データ型に関するドキュメント'
sidebar_label: 'DateTime64'
sidebar_position: 18
slug: /sql-reference/data-types/datetime64
title: 'DateTime64'
doc_type: 'reference'
---

# DateTime64 \{#datetime64\}

カレンダー日付と一日の時刻で表現できる時点を、サブ秒精度を指定して保存できるデータ型です。

ティックサイズ（精度）は 10<sup>-precision</sup> 秒です。指定可能な範囲: [ 0 : 9 ]。\
通常は 3（ミリ秒）、6（マイクロ秒）、9（ナノ秒）が使用されます。

**構文:**

```sql
DateTime64(precision, [timezone])
```

内部的には、エポック開始（1970-01-01 00:00:00 UTC）からの「ティック」数としてデータを Int64 で格納します。ティックの分解能は precision パラメータによって決まります。さらに、`DateTime64` 型では列全体で共通のタイムゾーンを保持でき、このタイムゾーンが `DateTime64` 型の値のテキスト形式での表示方法や、文字列として指定された値（&#39;2020-01-01 05:00:01.000&#39;）のパース方法に影響します。タイムゾーンはテーブルの行（または結果セット）には保存されず、列メタデータとして保存されます。詳細は [DateTime](../../sql-reference/data-types/datetime.md) を参照してください。

サポートされる値の範囲: [1900-01-01 00:00:00, 2299-12-31 23:59:59.999999999]

小数点以下の桁数は precision パラメータに依存します。

注記: 最大値に対する precision は 8 です。最大の 9 桁（ナノ秒）の precision を使用する場合、UTC におけるサポートされる最大値は `2262-04-11 23:47:16` です。

## 例 \{#examples\}

1. `DateTime64` 型の列を持つテーブルを作成し、データを挿入する：

```sql
CREATE TABLE dt64
(
    `timestamp` DateTime64(3, 'Asia/Istanbul'),
    `event_id` UInt8
)
ENGINE = TinyLog;
```

```sql
-- Parse DateTime
-- - from integer interpreted as number of microseconds (because of precision 3) since 1970-01-01,
-- - from decimal interpreted as number of seconds before the decimal part, and based on the precision after the decimal point,
-- - from string.
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

* datetime を整数として挿入する場合、それは適切にスケーリングされた Unix タイムスタンプ (UTC) として扱われます。精度 3 の `1546300800000` は UTC の `'2019-01-01 00:00:00'` を表します。ただし、`timestamp` 列にはタイムゾーンとして `Asia/Istanbul` (UTC+3) が指定されているため、文字列として出力すると、値は `'2019-01-01 03:00:00'` と表示されます。datetime を小数として挿入する場合も整数と同様に扱われますが、小数点より前の値は秒までを含む Unix タイムスタンプであり、小数点より後ろの値は精度として扱われます。
* 文字列値を datetime として挿入する場合、それは当該列のタイムゾーンの時刻として解釈されます。`'2019-01-01 00:00:00'` は `Asia/Istanbul` タイムゾーンの時刻として扱われ、`1546290000000` として保存されます。

2. `DateTime64` 値でのフィルタリング

```sql
SELECT * FROM dt64 WHERE timestamp = toDateTime64('2019-01-01 00:00:00', 3, 'Asia/Istanbul');
```

```text
┌───────────────timestamp─┬─event_id─┐
│ 2019-01-01 00:00:00.000 │        3 │
└─────────────────────────┴──────────┘
```

`DateTime` と異なり、`DateTime64` の値は `String` 型から自動的には変換されません。

```sql
SELECT * FROM dt64 WHERE timestamp = toDateTime64(1546300800.123, 3);
```

```text
┌───────────────timestamp─┬─event_id─┐
│ 2019-01-01 03:00:00.123 │        1 │
│ 2019-01-01 03:00:00.123 │        2 │
└─────────────────────────┴──────────┘
```

挿入する場合とは異なり、`toDateTime64` 関数はすべての値を小数形式として扱うため、小数点以下の精度を指定する必要があります。

3. `DateTime64` 型の値に対してタイムゾーンを取得する方法:

```sql
SELECT toDateTime64(now(), 3, 'Asia/Istanbul') AS column, toTypeName(column) AS x;
```

```text
┌──────────────────column─┬─x──────────────────────────────┐
│ 2023-06-05 00:09:52.000 │ DateTime64(3, 'Asia/Istanbul') │
└─────────────────────────┴────────────────────────────────┘
```

4. タイムゾーンの変換

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
* [日付と時刻を操作する関数](../../sql-reference/functions/date-time-functions.md)
* [`date_time_input_format` 設定](../../operations/settings/settings-formats.md#date_time_input_format)
* [`date_time_output_format` 設定](../../operations/settings/settings-formats.md#date_time_output_format)
* [`timezone` サーバー構成パラメータ](../../operations/server-configuration-parameters/settings.md#timezone)
* [`session_timezone` 設定](../../operations/settings/settings.md#session_timezone)
* [日付と時刻を操作する演算子](../../sql-reference/operators/index.md#operators-for-working-with-dates-and-times)
* [`Date` データ型](../../sql-reference/data-types/date.md)
* [`DateTime` データ型](../../sql-reference/data-types/datetime.md)
