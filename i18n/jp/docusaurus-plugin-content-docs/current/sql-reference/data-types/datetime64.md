---
description: 'ClickHouseにおけるDateTime64データ型のドキュメントで、サブ秒精度のタイムスタンプを保存します。'
sidebar_label: 'DateTime64'
sidebar_position: 18
slug: /sql-reference/data-types/datetime64
title: 'DateTime64'
---


# DateTime64

カレンダーの日付と日の時間として表現可能な瞬間を、定義されたサブ秒精度で保存することを許可します。

ティックサイズ（精度）：10<sup>-precision</sup>秒。有効範囲：[ 0 : 9 ]。通常は- 3（ミリ秒）、6（マイクロ秒）、9（ナノ秒）が使用されます。

**構文:**

```sql
DateTime64(precision, [timezone])
```

内部的には、エポック開始（1970-01-01 00:00:00 UTC）からのティック数をInt64として保存します。ティックの解像度は精度パラメータによって決まります。さらに、`DateTime64`型は、カラム全体で同じタイムゾーンを保存することができ、これが`DateTime64`型の値がテキスト形式で表示される方法や、文字列として指定された値がどのように解析されるか（'2020-01-01 05:00:01.000'）に影響を与えます。タイムゾーンはテーブルの行（または結果セット）には保存されていませんが、カラムメタデータには保存されています。詳細は[DateTime](../../sql-reference/data-types/datetime.md)を参照してください。

サポートされている値の範囲：\[1900-01-01 00:00:00, 2299-12-31 23:59:59.99999999\]

注意：最大値の精度は8です。最大精度の9桁（ナノ秒）が使用される場合、サポートされる最大値は`2262-04-11 23:47:16` UTCです。

## 例 {#examples}

1. `DateTime64`型のカラムを持つテーブルを作成し、データを挿入する：

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
-- - 1970-01-01以降の秒数として解釈される整数から
-- - 文字列から、
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

- 整数としてdatetimeを挿入する場合、それは適切にスケーリングされたUnixタイムスタンプ（UTC）として扱われます。`1546300800000`（精度3）は`'2019-01-01 00:00:00'` UTCを表します。ただし、`timestamp`カラムには`Asia/Istanbul`（UTC+3）タイムゾーンが指定されているため、文字列として出力されるときに、値は`'2019-01-01 03:00:00'`として表示されます。小数点としてdatetimeを挿入すると、整数と同様に扱われますが、小数点前の値は秒までのUnixタイムスタンプとし、小数点以降は精度として扱われます。
- 文字列値をdatetimeとして挿入する場合、それはカラムのタイムゾーンのもとで扱われます。`'2019-01-01 00:00:00'`は`Asia/Istanbul`タイムゾーンであるとみなされ、`1546290000000`として保存されます。

2. `DateTime64`値でフィルター処理する

```sql
SELECT * FROM dt64 WHERE timestamp = toDateTime64('2019-01-01 00:00:00', 3, 'Asia/Istanbul');
```

```text
┌───────────────timestamp─┬─event_id─┐
│ 2019-01-01 00:00:00.000 │        3 │
└─────────────────────────┴──────────┘
```

`DateTime`とは異なり、`DateTime64`値は自動的に`String`から変換されません。

```sql
SELECT * FROM dt64 WHERE timestamp = toDateTime64(1546300800.123, 3);
```

```text
┌───────────────timestamp─┬─event_id─┐
│ 2019-01-01 03:00:00.123 │        1 │
│ 2019-01-01 03:00:00.123 │        2 │
└─────────────────────────┴──────────┘
```

挿入と異なり、`toDateTime64`関数はすべての値を小数点形式として扱うため、精度は小数点の後に指定する必要があります。

3. `DateTime64`型値のためのタイムゾーンを取得する：

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
toDateTime64(timestamp, 3, 'Europe/London') as lon_time,
toDateTime64(timestamp, 3, 'Asia/Istanbul') as istanbul_time
FROM dt64;
```

```text
┌────────────────lon_time─┬───────────istanbul_time─┐
│ 2019-01-01 00:00:00.123 │ 2019-01-01 03:00:00.123 │
│ 2019-01-01 00:00:00.123 │ 2019-01-01 03:00:00.123 │
│ 2018-12-31 21:00:00.000 │ 2019-01-01 00:00:00.000 │
└─────────────────────────┴─────────────────────────┘
```

**参照**

- [型変換関数](../../sql-reference/functions/type-conversion-functions.md)
- [日付と時間に関する関数](../../sql-reference/functions/date-time-functions.md)
- [`date_time_input_format`設定](../../operations/settings/settings-formats.md#date_time_input_format)
- [`date_time_output_format`設定](../../operations/settings/settings-formats.md#date_time_output_format)
- [`timezone`サーバー構成パラメータ](../../operations/server-configuration-parameters/settings.md#timezone)
- [`session_timezone`設定](../../operations/settings/settings.md#session_timezone)
- [日付と時間に関する演算子](../../sql-reference/operators/index.md#operators-for-working-with-dates-and-times)
- [`Date`データ型](../../sql-reference/data-types/date.md)
- [`DateTime`データ型](../../sql-reference/data-types/datetime.md)
