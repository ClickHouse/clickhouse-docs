---
'description': 'ClickHouseのDateTime64データ型に関するドキュメントで、サブ秒精度でタイムスタンプを保存します'
'sidebar_label': 'DateTime64'
'sidebar_position': 18
'slug': '/sql-reference/data-types/datetime64'
'title': 'DateTime64'
'doc_type': 'reference'
---


# DateTime64

ある瞬間を保存することを可能にし、カレンダーの日付と1日の時刻として表現でき、定義されたサブ秒精度を持ちます。

ティックサイズ（精度）：10<sup>-precision</sup> 秒。 有効範囲：[ 0 : 9 ]。  
一般的に使用されるのは - 3（ミリ秒）、6（マイクロ秒）、9（ナノ秒）です。

**構文：**

```sql
DateTime64(precision, [timezone])
```

内部的には、エポック開始（1970-01-01 00:00:00 UTC）からのティックの数としてデータを Int64 として保存します。 ティックの解像度は、精度パラメータによって決まります。さらに、`DateTime64` 型は、全カラムにわたって同じタイムゾーンを保存でき、これにより `DateTime64` 型の値がテキスト形式で表示される方法や、文字列として指定された値がパースされる方法（'2020-01-01 05:00:01.000'）に影響を与えます。タイムゾーンはテーブルの行（または結果セット）には保存されませんが、カラムのメタデータに保存されます。詳細は [DateTime](../../sql-reference/data-types/datetime.md) をご覧ください。

サポートされる値の範囲：\[1900-01-01 00:00:00, 2299-12-31 23:59:59.99999999\]

小数点以下の桁数は、精度パラメータに依存します。

注意：最大値の精度は 8 です。最大精度の 9 桁（ナノ秒）が使用される場合、最大サポート値は `2262-04-11 23:47:16` UTC です。

## 例 {#examples}

1. `DateTime64` 型のカラムを持つテーブルを作成し、データを挿入する：

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

- 整数として日時を挿入すると、それは適切にスケーリングされた Unix タイムスタンプ（UTC）として扱われます。`1546300800000`（精度 3）は、`'2019-01-01 00:00:00'` UTC を表します。しかし、`timestamp` カラムに `Asia/Istanbul`（UTC+3）のタイムゾーンが指定されているため、文字列として出力される際には値は `'2019-01-01 03:00:00'` と表示されます。小数として日時を挿入すると、整数と同様に扱われますが、小数点前の値は秒までの Unix タイムスタンプとなり、小数点の後は精度として扱われます。
- 文字列値を日時として挿入する場合、それはカラムのタイムゾーン内にあるとみなされます。`'2019-01-01 00:00:00'` は `Asia/Istanbul` タイムゾーンにあるとみなされ、`1546290000000` として保存されます。

2. `DateTime64` 値でのフィルタリング

```sql
SELECT * FROM dt64 WHERE timestamp = toDateTime64('2019-01-01 00:00:00', 3, 'Asia/Istanbul');
```

```text
┌───────────────timestamp─┬─event_id─┐
│ 2019-01-01 00:00:00.000 │        3 │
└─────────────────────────┴──────────┘
```

`DateTime` とは異なり、`DateTime64` 値は自動的に `String` から変換されません。

```sql
SELECT * FROM dt64 WHERE timestamp = toDateTime64(1546300800.123, 3);
```

```text
┌───────────────timestamp─┬─event_id─┐
│ 2019-01-01 03:00:00.123 │        1 │
│ 2019-01-01 03:00:00.123 │        2 │
└─────────────────────────┴──────────┘
```

挿入する際とは対照的に、`toDateTime64` 関数はすべての値を小数バリアントとして扱うため、小数点の後に精度を指定する必要があります。

3. `DateTime64` 型の値に対するタイムゾーンを取得する：

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

**参考資料**

- [型変換関数](../../sql-reference/functions/type-conversion-functions.md)
- [日付と時刻に関する関数](../../sql-reference/functions/date-time-functions.md)
- [`date_time_input_format` 設定](../../operations/settings/settings-formats.md#date_time_input_format)
- [ `date_time_output_format` 設定](../../operations/settings/settings-formats.md#date_time_output_format)
- [ `timezone` サーバー設定パラメータ](../../operations/server-configuration-parameters/settings.md#timezone)
- [ `session_timezone` 設定](../../operations/settings/settings.md#session_timezone)
- [日付と時刻を処理するための演算子](../../sql-reference/operators/index.md#operators-for-working-with-dates-and-times)
- [`Date` データ型](../../sql-reference/data-types/date.md)
- [`DateTime` データ型](../../sql-reference/data-types/datetime.md)
