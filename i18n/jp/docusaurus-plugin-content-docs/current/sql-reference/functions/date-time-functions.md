---
slug: /sql-reference/functions/date-time-functions
sidebar_position: 45
sidebar_label: 日付と時刻
---

# 日付と時刻を扱うための関数

このセクションのほとんどの関数は、オプションのタイムゾーン引数を受け付けます。例：`Europe/Amsterdam`。この場合、タイムゾーンはローカル（デフォルト）のものではなく、指定されたものになります。

**例**

``` sql
SELECT
    toDateTime('2016-06-15 23:00:00') AS time,
    toDate(time) AS date_local,
    toDate(time, 'Asia/Yekaterinburg') AS date_yekat,
    toString(time, 'US/Samoa') AS time_samoa
```

``` text
┌────────────────time─┬─date_local─┬─date_yekat─┬─time_samoa──────────┐
│ 2016-06-15 23:00:00 │ 2016-06-15 │ 2016-06-16 │ 2016-06-15 09:00:00 │
└─────────────────────┴────────────┴────────────┴─────────────────────┘
```
## makeDate {#makedate}

[Date](../data-types/date.md) を生成します。
- 年、月、日引数から、または
- 年および年の通算日引数から。

**構文**

``` sql
makeDate(year, month, day);
makeDate(year, day_of_year);
```

エイリアス：
- `MAKEDATE(year, month, day);`
- `MAKEDATE(year, day_of_year);`

**引数**

- `year` — 年。[Integer](../data-types/int-uint.md)、[Float](../data-types/float.md) または [Decimal](../data-types/decimal.md)。
- `month` — 月。[Integer](../data-types/int-uint.md)、[Float](../data-types/float.md) または [Decimal](../data-types/decimal.md)。
- `day` — 日。[Integer](../data-types/int-uint.md)、[Float](../data-types/float.md) または [Decimal](../data-types/decimal.md)。
- `day_of_year` — 年の通算日。[Integer](../data-types/int-uint.md)、[Float](../data-types/float.md) または [Decimal](../data-types/decimal.md)。

**返される値**

- 引数から生成された日付。[Date](../data-types/date.md)。

**例**

年、月、日から日付を生成する：

``` sql
SELECT makeDate(2023, 2, 28) AS Date;
```

結果：

``` text
┌───────date─┐
│ 2023-02-28 │
└────────────┘
```

年と年の通算日引数から日付を生成する：

``` sql
SELECT makeDate(2023, 42) AS Date;
```

結果：

``` text
┌───────date─┐
│ 2023-02-11 │
└────────────┘
```
## makeDate32 {#makedate32}

年、月、日（またはオプションで年と日の引数）から[Date32](../../sql-reference/data-types/date32.md)型の日付を生成します。

**構文**

```sql
makeDate32(year, [month,] day)
```

**引数**

- `year` — 年。[Integer](../../sql-reference/data-types/int-uint.md)、[Float](../../sql-reference/data-types/float.md) または [Decimal](../../sql-reference/data-types/decimal.md)。
- `month` — 月（オプション）。[Integer](../../sql-reference/data-types/int-uint.md)、[Float](../../sql-reference/data-types/float.md) または [Decimal](../../sql-reference/data-types/decimal.md)。
- `day` — 日。[Integer](../../sql-reference/data-types/int-uint.md)、[Float](../../sql-reference/data-types/float.md) または [Decimal](../../sql-reference/data-types/decimal.md)。

:::note
`month` が省略された場合、`day` は `1` から `365` の間の値を取る必要があります。そうでなければ、`1` から `31` の間の値を取る必要があります。
:::

**返される値**

- 引数から生成された日付。[Date32](../../sql-reference/data-types/date32.md)。

**例**

年、月、日から日付を生成する：

クエリ：

```sql
SELECT makeDate32(2024, 1, 1);
```

結果：

```response
2024-01-01
```

年と年の通算日から日付を生成する：

クエリ：

``` sql
SELECT makeDate32(2024, 100);
```

結果：

```response
2024-04-09
```
## makeDateTime {#makedatetime}

年、月、日、時、分、秒の引数から[DateTime](../data-types/datetime.md)を生成します。

**構文**

``` sql
makeDateTime(year, month, day, hour, minute, second[, timezone])
```

**引数**

- `year` — 年。[Integer](../data-types/int-uint.md)、[Float](../data-types/float.md) または [Decimal](../data-types/decimal.md)。
- `month` — 月。[Integer](../data-types/int-uint.md)、[Float](../data-types/float.md) または [Decimal](../data-types/decimal.md)。
- `day` — 日。[Integer](../data-types/int-uint.md)、[Float](../data-types/float.md) または [Decimal](../data-types/decimal.md)。
- `hour` — 時。[Integer](../data-types/int-uint.md)、[Float](../data-types/float.md) または [Decimal](../data-types/decimal.md)。
- `minute` — 分。[Integer](../data-types/int-uint.md)、[Float](../data-types/float.md) または [Decimal](../data-types/decimal.md)。
- `second` — 秒。[Integer](../data-types/int-uint.md)、[Float](../data-types/float.md) または [Decimal](../data-types/decimal.md)。
- `timezone` — 返される値のための[タイムゾーン](../../operations/server-configuration-parameters/settings.md#timezone)（オプション）。

**返される値**

- 引数から生成された日時。[DateTime](../data-types/datetime.md)。

**例**

``` sql
SELECT makeDateTime(2023, 2, 28, 17, 12, 33) AS DateTime;
```

結果：

``` text
┌────────────DateTime─┐
│ 2023-02-28 17:12:33 │
└─────────────────────┘
```
## makeDateTime64 {#makedatetime64}

年、月、日、時、分、秒のコンポーネントから[DateTime64](../../sql-reference/data-types/datetime64.md)データ型の値を生成します。オプションでサブ秒精度を指定できます。

**構文**

```sql
makeDateTime64(year, month, day, hour, minute, second[, precision])
```

**引数**

- `year` — 年（0-9999）。[Integer](../../sql-reference/data-types/int-uint.md)、[Float](../../sql-reference/data-types/float.md) または [Decimal](../../sql-reference/data-types/decimal.md)。
- `month` — 月（1-12）。[Integer](../../sql-reference/data-types/int-uint.md)、[Float](../../sql-reference/data-types/float.md) または [Decimal](../../sql-reference/data-types/decimal.md)。
- `day` — 日（1-31）。[Integer](../../sql-reference/data-types/int-uint.md)、[Float](../../sql-reference/data-types/float.md) または [Decimal](../../sql-reference/data-types/decimal.md)。
- `hour` — 時（0-23）。[Integer](../../sql-reference/data-types/int-uint.md)、[Float](../../sql-reference/data-types/float.md) または [Decimal](../../sql-reference/data-types/decimal.md)。
- `minute` — 分（0-59）。[Integer](../../sql-reference/data-types/int-uint.md)、[Float](../../sql-reference/data-types/float.md) または [Decimal](../../sql-reference/data-types/decimal.md)。
- `second` — 秒（0-59）。[Integer](../../sql-reference/data-types/int-uint.md)、[Float](../../sql-reference/data-types/float.md) または [Decimal](../../sql-reference/data-types/decimal.md)。
- `precision` — サブ秒コンポーネントのオプションの精度（0-9）。[Integer](../../sql-reference/data-types/int-uint.md)。

**返される値**

- 引数から生成された日時。[DateTime64](../../sql-reference/data-types/datetime64.md)。

**例**

``` sql
SELECT makeDateTime64(2023, 5, 15, 10, 30, 45, 779, 5);
```

```response
┌─makeDateTime64(2023, 5, 15, 10, 30, 45, 779, 5)─┐
│                       2023-05-15 10:30:45.00779 │
└─────────────────────────────────────────────────┘
```
## timestamp {#timestamp}

最初の引数 'expr' を[DateTime64(6)](../data-types/datetime64.md)型に変換します。
第二引数 'expr_time' を指定すると、変換された値に指定された時間を加算します。

**構文**

``` sql
timestamp(expr[, expr_time])
```

エイリアス： `TIMESTAMP`

**引数**

- `expr` - 日付または日時。[String](../data-types/string.md)。
- `expr_time` - オプションのパラメーター。加算する時間。[String](../data-types/string.md)。

**例**

``` sql
SELECT timestamp('2023-12-31') as ts;
```

結果：

``` text
┌─────────────────────────ts─┐
│ 2023-12-31 00:00:00.000000 │
└────────────────────────────┘
```

``` sql
SELECT timestamp('2023-12-31 12:00:00', '12:00:00.11') as ts;
```

結果：

``` text
┌─────────────────────────ts─┐
│ 2024-01-01 00:00:00.110000 │
└────────────────────────────┘
```

**返される値**

- [DateTime64](../data-types/datetime64.md)(6)
## timeZone {#timezone}

現在のセッションのタイムゾーン、すなわち設定[session_timezone](../../operations/settings/settings.md#session_timezone)の値を返します。
関数が分散テーブルのコンテキストで実行される場合、各シャードに関連する値の通常のカラムを生成します。そうでない場合は、定数値を生成します。

**構文**

```sql
timeZone()
```

エイリアス： `timezone`。

**返される値**

- タイムゾーン。[String](../data-types/string.md)。

**例**

```sql
SELECT timezone()
```

結果：

```response
┌─timezone()─────┐
│ America/Denver │
└────────────────┘
```

**関連事項**

- [serverTimeZone](#servertimezone)
## serverTimeZone {#servertimezone}

サーバーのタイムゾーン、すなわち設定[timezone](../../operations/server-configuration-parameters/settings.md#timezone)の値を返します。
関数が分散テーブルのコンテキストで実行される場合、各シャードに関連する値の通常のカラムを生成します。そうでない場合は、定数値を生成します。

**構文**

``` sql
serverTimeZone()
```

エイリアス： `serverTimezone`。

**返される値**

- タイムゾーン。[String](../data-types/string.md)。

**例**

```sql
SELECT serverTimeZone()
```

結果：

```response
┌─serverTimeZone()─┐
│ UTC              │
└──────────────────┘
```

**関連事項**

- [timeZone](#timezone)
## toTimeZone {#totimezone}

日付または日時を指定されたタイムゾーンに変換します。データの内部値（Unix秒の数）は変更せず、値のタイムゾーン属性と値の文字列表現のみが変更されます。

**構文**

``` sql
toTimezone(value, timezone)
```

エイリアス： `toTimezone`。

**引数**

- `value` — 時間または日付と時間。[DateTime64](../data-types/datetime64.md)。
- `timezone` — 返される値のタイムゾーン。[String](../data-types/string.md)。この引数は定数です。`toTimezone`はカラムのタイムゾーンを変更します（タイムゾーンは`DateTime*`型の属性です）。

**返される値**

- 日時。[DateTime](../data-types/datetime.md)。

**例**

```sql
SELECT toDateTime('2019-01-01 00:00:00', 'UTC') AS time_utc,
    toTypeName(time_utc) AS type_utc,
    toInt32(time_utc) AS int32utc,
    toTimeZone(time_utc, 'Asia/Yekaterinburg') AS time_yekat,
    toTypeName(time_yekat) AS type_yekat,
    toInt32(time_yekat) AS int32yekat,
    toTimeZone(time_utc, 'US/Samoa') AS time_samoa,
    toTypeName(time_samoa) AS type_samoa,
    toInt32(time_samoa) AS int32samoa
FORMAT Vertical;
```

結果：

```text
Row 1:
──────
time_utc:   2019-01-01 00:00:00
type_utc:   DateTime('UTC')
int32utc:   1546300800
time_yekat: 2019-01-01 05:00:00
type_yekat: DateTime('Asia/Yekaterinburg')
int32yekat: 1546300800
time_samoa: 2018-12-31 13:00:00
type_samoa: DateTime('US/Samoa')
int32samoa: 1546300800
```

**関連事項**

- [formatDateTime](#formatdatetime) - 非定数タイムゾーンをサポート。
- [toString](type-conversion-functions.md#tostring) - 非定数タイムゾーンをサポート。
## timeZoneOf {#timezoneof}

[DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)型のタイムゾーン名を返します。

**構文**

``` sql
timeZoneOf(value)
```

エイリアス： `timezoneOf`。

**引数**

- `value` — 日付と時間。[DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)。

**返される値**

- タイムゾーン名。[String](../data-types/string.md)。

**例**

``` sql
SELECT timezoneOf(now());
```

結果：
``` text
┌─timezoneOf(now())─┐
│ Etc/UTC           │
└───────────────────┘
```
## timeZoneOffset {#timezoneoffset}

[UTC](https://en.wikipedia.org/wiki/Coordinated_Universal_Time)からのタイムゾーンオフセット（秒単位）を返します。
この関数は、指定された日付と時刻での[サマータイム](https://en.wikipedia.org/wiki/Daylight_saving_time)と歴史的なタイムゾーン変更を考慮に入れます。
オフセットを計算するために[IANAタイムゾーンデータベース](https://www.iana.org/time-zones)が使用されます。

**構文**

``` sql
timeZoneOffset(value)
```

エイリアス： `timezoneOffset`。

**引数**

- `value` — 日付と時刻。[DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)。

**返される値**

- UTCからのオフセット（秒単位）。[Int32](../data-types/int-uint.md)。

**例**

``` sql
SELECT toDateTime('2021-04-21 10:20:30', 'America/New_York') AS Time, toTypeName(Time) AS Type,
       timeZoneOffset(Time) AS Offset_in_seconds, (Offset_in_seconds / 3600) AS Offset_in_hours;
```

結果：

``` text
┌────────────────Time─┬─Type─────────────────────────┬─Offset_in_seconds─┬─Offset_in_hours─┐
│ 2021-04-21 10:20:30 │ DateTime('America/New_York') │            -14400 │              -4 │
└─────────────────────┴──────────────────────────────┴───────────────────┴─────────────────┘
```
## toYear {#toyear}

日付または日時の年のコンポーネント（AD）を返します。

**構文**

```sql
toYear(value)
```

エイリアス： `YEAR`

**引数**

- `value` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)

**返される値**

- 指定された日付/時刻の年。[UInt16](../data-types/int-uint.md)。

**例**

```sql
SELECT toYear(toDateTime('2023-04-21 10:20:30'))
```

結果：

```response
┌─toYear(toDateTime('2023-04-21 10:20:30'))─┐
│                                      2023 │
└───────────────────────────────────────────┘
```
## toQuarter {#toquarter}

日付または日時の四半期（1-4）を返します。

**構文**

```sql
toQuarter(value)
```

エイリアス： `QUARTER`

**引数**

- `value` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)

**返される値**

- 指定された日付/時刻の年の四半期（1、2、3または4）。[UInt8](../data-types/int-uint.md)。

**例**

```sql
SELECT toQuarter(toDateTime('2023-04-21 10:20:30'))
```

結果：

```response
┌─toQuarter(toDateTime('2023-04-21 10:20:30'))─┐
│                                            2 │
└──────────────────────────────────────────────┘
```
## toMonth {#tomonth}

日付または日時の月のコンポーネント（1-12）を返します。

**構文**

```sql
toMonth(value)
```

エイリアス：

```text
MONTH
```

**引数**

- `value` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)

**返される値**

- 指定された日付/時刻の年の月（1 - 12）。[UInt8](../data-types/int-uint.md)。

**例**

```sql
SELECT toMonth(toDateTime('2023-04-21 10:20:30'))
```

結果：

```response
┌─toMonth(toDateTime('2023-04-21 10:20:30'))─┐
│                                          4 │
└────────────────────────────────────────────┘
```
## toDayOfYear {#todayofyear}

日付または日時の年内の通算日（1-366）を返します。

**構文**

```sql
toDayOfYear(value)
```

エイリアス： `DAYOFYEAR`

**引数**

- `value` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)

**返される値**

- 指定された日付/時刻の年内の通算日（1 - 366）。[UInt16](../data-types/int-uint.md)。

**例**

```sql
SELECT toDayOfYear(toDateTime('2023-04-21 10:20:30'))
```

結果：

```response
┌─toDayOfYear(toDateTime('2023-04-21 10:20:30'))─┐
│                                            111 │
└────────────────────────────────────────────────┘
```
## toDayOfMonth {#todayofmonth}

日付または日時の月内の日の番号（1-31）を返します。

**構文**

```sql
toDayOfMonth(value)
```

エイリアス： `DAYOFMONTH`, `DAY`

**引数**

- `value` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)

**返される値**

- 指定された日付/時刻の月内の日（1 - 31）。[UInt8](../data-types/int-uint.md)。

**例**

```sql
SELECT toDayOfMonth(toDateTime('2023-04-21 10:20:30'))
```

結果：

```response
┌─toDayOfMonth(toDateTime('2023-04-21 10:20:30'))─┐
│                                              21 │
└─────────────────────────────────────────────────┘
```
## toDayOfWeek {#todayofweek}

日付または日時の週内の曜日の番号を返します。

`toDayOfWeek()`の二引数形式を使用すると、週の始まりを月曜日または日曜日に指定し、返される値を0から6または1から7の範囲にするかを選択できます。モード引数が省略された場合、デフォルトモードは0です。日付のタイムゾーンを三番目の引数として指定できます。

| モード | 週の初日 | 範囲                                          |
|------|-------------------|------------------------------------------------|
| 0    | 月曜日            | 1-7: 月曜日 = 1, 火曜日 = 2, ..., 日曜日 = 7  |
| 1    | 月曜日            | 0-6: 月曜日 = 0, 火曜日 = 1, ..., 日曜日 = 6  |
| 2    | 日曜日            | 0-6: 日曜日 = 0, 月曜日 = 1, ..., 土曜日 = 6 |
| 3    | 日曜日            | 1-7: 日曜日 = 1, 月曜日 = 2, ..., 土曜日 = 7 |

**構文**

``` sql
toDayOfWeek(t[, mode[, timezone]])
```

エイリアス： `DAYOFWEEK`。

**引数**

- `t` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)
- `mode` - 週の初日を決定します。可能な値は0、1、2、または3です。上記の表を参照して違いを確認してください。
- `timezone` - オプションのパラメータで、他の変換関数と同様に機能します

最初の引数は、[parseDateTime64BestEffort()](type-conversion-functions.md#parsedatetime64besteffort)でサポートされている形式の[String](../data-types/string.md)としても指定できます。文字列引数のサポートは、特定の第三者ツールによって期待されるMySQLとの互換性のためだけに存在します。文字列引数のサポートは、将来的に新しいMySQL互換設定に依存する可能性があり、文字列解析は一般的に遅いため、使用しないことが推奨されます。

**返される値**

- 指定された日付/時刻の選択したモードによる曜日（1-7）。

**例**

次の日付は2023年4月21日で、金曜日でした：

```sql
SELECT
    toDayOfWeek(toDateTime('2023-04-21')),
    toDayOfWeek(toDateTime('2023-04-21'), 1)
```

結果：

```response
┌─toDayOfWeek(toDateTime('2023-04-21'))─┬─toDayOfWeek(toDateTime('2023-04-21'), 1)─┐
│                                     5 │                                        4 │
└───────────────────────────────────────┴──────────────────────────────────────────┘
```
## toHour {#tohour}

日時の時間コンポーネント（0-24）を返します。

時計が進む場合は、1時間進むと仮定し、午前2時に発生し、時計が戻る場合は、1時間戻ると仮定し、午前3時に発生します（これは常に正確な時間ではありません - タイムゾーンに依存します）。

**構文**

```sql
toHour(value)
```

エイリアス： `HOUR`

**引数**

- `value` - [DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)

**返される値**

- 指定された日付/時刻のその日の時間（0 - 23）。[UInt8](../data-types/int-uint.md)。

**例**

```sql
SELECT toHour(toDateTime('2023-04-21 10:20:30'))
```

結果：

```response
┌─toHour(toDateTime('2023-04-21 10:20:30'))─┐
│                                        10 │
└───────────────────────────────────────────┘
```
## toMinute {#tominute}

日時の分のコンポーネント（0-59）を返します。

**構文**

```sql
toMinute(value)
```

エイリアス： `MINUTE`

**引数**

- `value` - [DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)

**返される値**

- 指定された日付/時刻のその時間の分（0 - 59）。[UInt8](../data-types/int-uint.md)。

**例**

```sql
SELECT toMinute(toDateTime('2023-04-21 10:20:30'))
```

結果：

```response
┌─toMinute(toDateTime('2023-04-21 10:20:30'))─┐
│                                          20 │
└─────────────────────────────────────────────┘
```
## toSecond {#tosecond}

日時の秒のコンポーネント（0-59）を返します。うるう秒は考慮されません。

**構文**

```sql
toSecond(value)
```

エイリアス： `SECOND`

**引数**

- `value` - [DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)

**返される値**

- 指定された日付/時刻のその分の秒（0 - 59）。[UInt8](../data-types/int-uint.md)。

**例**

```sql
SELECT toSecond(toDateTime('2023-04-21 10:20:30'))
```

結果：

```response
┌─toSecond(toDateTime('2023-04-21 10:20:30'))─┐
│                                          30 │
└─────────────────────────────────────────────┘
```
## toMillisecond {#tomillisecond}

日時のミリ秒コンポーネント（0-999）を返します。

**構文**

```sql
toMillisecond(value)
```

**引数**

- `value` - [DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)

エイリアス： `MILLISECOND`

```sql
SELECT toMillisecond(toDateTime64('2023-04-21 10:20:30.456', 3))
```

結果：

```response
┌──toMillisecond(toDateTime64('2023-04-21 10:20:30.456', 3))─┐
│                                                        456 │
└────────────────────────────────────────────────────────────┘
```

**返される値**

- 指定された日付/時刻のその分のミリ秒（0 - 999）。[UInt16](../data-types/int-uint.md)。
## toUnixTimestamp {#tounixtimestamp}

文字列、日付または日時を[Unixタイムスタンプ](https://en.wikipedia.org/wiki/Unix_time)に変換します。`UInt32`表現。

関数が文字列で呼び出されるとき、オプションのタイムゾーン引数を受け付けます。

**構文**

``` sql
toUnixTimestamp(date)
toUnixTimestamp(str, [timezone])
```

**返される値**

- Unixタイムスタンプを返します。[UInt32](../data-types/int-uint.md)。

**例**

``` sql
SELECT
    '2017-11-05 08:07:47' AS dt_str,
    toUnixTimestamp(dt_str) AS from_str,
    toUnixTimestamp(dt_str, 'Asia/Tokyo') AS from_str_tokyo,
    toUnixTimestamp(toDateTime(dt_str)) AS from_datetime,
    toUnixTimestamp(toDateTime64(dt_str, 0)) AS from_datetime64,
    toUnixTimestamp(toDate(dt_str)) AS from_date,
    toUnixTimestamp(toDate32(dt_str)) AS from_date32
FORMAT Vertical;
```

結果：

``` text
Row 1:
──────
dt_str:          2017-11-05 08:07:47
from_str:        1509869267
from_str_tokyo:  1509836867
from_datetime:   1509869267
from_datetime64: 1509869267
from_date:       1509840000
from_date32:     1509840000
```

:::note
`toStartOf*`、`toLastDayOf*`、`toMonday`、`timeSlot`関数の返却型は、構成パラメータ[enable_extended_results_for_datetime_functions](../../operations/settings/settings.md#enable-extended-results-for-datetime-functions)によって決定されます。このパラメータのデフォルト値は `0` です。

動作
* `enable_extended_results_for_datetime_functions = 0`:
  * 関数`toStartOfYear`、`toStartOfISOYear`、`toStartOfQuarter`、`toStartOfMonth`、`toStartOfWeek`、`toLastDayOfWeek`、`toLastDayOfMonth`、`toMonday`は、引数が`Date`または`DateTime`の場合は`Date`または`DateTime`を返し、引数が`Date32`または`DateTime64`の場合は`Date32`または`DateTime64`を返します。
  * 関数`toStartOfDay`、`toStartOfHour`、`toStartOfFifteenMinutes`、`toStartOfTenMinutes`、`toStartOfFiveMinutes`、`toStartOfMinute`、`timeSlot`は`DateTime`を返します。ただし、これらの関数は拡張された型の`Date32`や`DateTime64`を引数として受け取ることができますが、通常の範囲外（1970年から2149年/ DateTimeの場合は2106年）の時間を渡すと誤った結果が生成されます。
* `enable_extended_results_for_datetime_functions = 1`:
  * 関数`toStartOfYear`、`toStartOfISOYear`、`toStartOfQuarter`、`toStartOfMonth`、`toStartOfWeek`、`toLastDayOfWeek`、`toLastDayOfMonth`、`toMonday`は、引数が`Date`または`DateTime`の場合は`Date`または`DateTime`を返し、引数が`Date32`または`DateTime64`の場合は`Date32`または`DateTime64`を返します。
  * 関数`toStartOfDay`、`toStartOfHour`、`toStartOfFifteenMinutes`、`toStartOfTenMinutes`、`toStartOfFiveMinutes`、`toStartOfMinute`、`timeSlot`は、引数が`Date`または`DateTime`の場合は`DateTime`を返し、引数が`Date32`または`DateTime64`の場合は`DateTime64`を返します。
:::
## toStartOfYear {#tostartofyear}

日付または日時を年の最初の日に切り捨てます。結果は`Date`オブジェクトとして返されます。

**構文**

```sql
toStartOfYear(value)
```

**引数**

- `value` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)

**返される値**

- 入力の日付/時刻の年の最初の日。 [Date](../data-types/date.md)。

**例**

```sql
SELECT toStartOfYear(toDateTime('2023-04-21 10:20:30'))
```

結果：

```response
┌─toStartOfYear(toDateTime('2023-04-21 10:20:30'))─┐
│                                       2023-01-01 │
└──────────────────────────────────────────────────┘
```
## toStartOfISOYear {#tostartofisoyear}

日付または日時をISO年の最初の日に切り捨てます。これは「通常」の年とは異なる場合があります。（詳細については[https://en.wikipedia.org/wiki/ISO_week_date](https://en.wikipedia.org/wiki/ISO_week_date)を参照）。

**構文**

```sql
toStartOfISOYear(value)
```

**引数**

- `value` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)

**返される値**

- 入力の日付/時刻のISO年の最初の日。[Date](../data-types/date.md)。

**例**

```sql
SELECT toStartOfISOYear(toDateTime('2023-04-21 10:20:30'))
```

結果：

```response
┌─toStartOfISOYear(toDateTime('2023-04-21 10:20:30'))─┐
│                                          2023-01-02 │
└─────────────────────────────────────────────────────┘
```
## toStartOfQuarter {#tostartofquarter}

日付または日時を四半期の最初の日に切り捨てます。四半期の最初の日は、1月1日、4月1日、7月1日、または10月1日のいずれかです。
日付を返します。

**構文**

```sql
toStartOfQuarter(value)
```

**引数**

- `value` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)

**返される値**

- 指定された日付/時刻の四半期の最初の日。[Date](../data-types/date.md)。

**例**

```sql
SELECT toStartOfQuarter(toDateTime('2023-04-21 10:20:30'))
```

結果：

```response
┌─toStartOfQuarter(toDateTime('2023-04-21 10:20:30'))─┐
│                                          2023-04-01 │
└─────────────────────────────────────────────────────┘
```
## toStartOfMonth {#tostartofmonth}

日付または日時を月の最初の日に切り捨てます。日付を返します。

**構文**

```sql
toStartOfMonth(value)
```

**引数**

- `value` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)

**返される値**

- 指定された日付/時刻の月の最初の日。[Date](../data-types/date.md)。

**例**

```sql
SELECT toStartOfMonth(toDateTime('2023-04-21 10:20:30'))
```

結果：

```response
┌─toStartOfMonth(toDateTime('2023-04-21 10:20:30'))─┐
│                                        2023-04-01 │
└───────────────────────────────────────────────────┘
```

:::note
不正な日付の解析の動作は実装依存です。ClickHouseはゼロの日付を返すか、例外をスローするか、または「自然な」オーバーフローを行う場合があります。
:::
## toLastDayOfMonth {#tolastdayofmonth}

日付または日時を月の最終日に切り捨てます。日付を返します。

**構文**

```sql
toLastDayOfMonth(value)
```

エイリアス： `LAST_DAY`

**引数**

- `value` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)

**返される値**

- 指定された日付/時刻の月の最終日。[Date](../data-types/date.md)。

**例**

```sql
SELECT toLastDayOfMonth(toDateTime('2023-04-21 10:20:30'))
```

結果：

```response
┌─toLastDayOfMonth(toDateTime('2023-04-21 10:20:30'))─┐
│                                          2023-04-30 │
└─────────────────────────────────────────────────────┘
```
## toMonday {#tomonday}

日付または日時を最寄りの月曜日に切り捨てます。日付を返します。

**構文**

```sql
toMonday(value)
```

**引数**

- `value` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)

**返される値**

- 指定された日付の前または当日の最寄りの月曜日の日付。[Date](../data-types/date.md)。

**例**

```sql
SELECT
    toMonday(toDateTime('2023-04-21 10:20:30')), /* 金曜日 */
    toMonday(toDate('2023-04-24')), /* 既に月曜日 */
```

結果：

```response
┌─toMonday(toDateTime('2023-04-21 10:20:30'))─┬─toMonday(toDate('2023-04-24'))─┐
│                                  2023-04-17 │                     2023-04-24 │
└─────────────────────────────────────────────┴────────────────────────────────┘
```
## toStartOfWeek {#tostartofweek}

日付または時間を伴う日付を、最も近い日曜日または月曜日に切り捨てます。日付を返します。mode引数は、関数 `toWeek()` のmode引数と全く同じように機能します。modeが指定されていない場合は、デフォルトで0になります。

**構文**

``` sql
toStartOfWeek(t[, mode[, timezone]])
```

**引数**

- `t` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)、または[DateTime64](../data-types/datetime64.md)
- `mode` - [toWeek()](#toweek) 関数で説明されている週の最初の日を決定します
- `timezone` - 任意のパラメータで、他の変換関数と同様に動作します

**戻り値**

- 指定された日付またはそれ以前の最も近い日曜日または月曜日の日付、modeに応じて。[Date](../data-types/date.md)。

**例**

```sql
SELECT
    toStartOfWeek(toDateTime('2023-04-21 10:20:30')), /* 金曜日 */
    toStartOfWeek(toDateTime('2023-04-21 10:20:30'), 1), /* 金曜日 */
    toStartOfWeek(toDate('2023-04-24')), /* 月曜日 */
    toStartOfWeek(toDate('2023-04-24'), 1) /* 月曜日 */
FORMAT Vertical
```

結果:

```response
Row 1:
──────
toStartOfWeek(toDateTime('2023-04-21 10:20:30')):    2023-04-16
toStartOfWeek(toDateTime('2023-04-21 10:20:30'), 1): 2023-04-17
toStartOfWeek(toDate('2023-04-24')):                 2023-04-23
toStartOfWeek(toDate('2023-04-24'), 1):              2023-04-24
```

## toLastDayOfWeek {#tolastdayofweek}

日付または時間を伴う日付を、最も近い土曜日または日曜日に切り上げます。日付を返します。mode引数は、関数 `toWeek()` のmode引数と全く同じように機能します。modeが指定されていない場合は、modeは0と見なされます。

**構文**

``` sql
toLastDayOfWeek(t[, mode[, timezone]])
```

**引数**

- `t` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)、または[DateTime64](../data-types/datetime64.md)
- `mode` - [toWeek](#toweek) 関数で説明されている週の最後の日を決定します
- `timezone` - 任意のパラメータで、他の変換関数と同様に動作します

**戻り値**

- 指定された日付またはそれ以降の最も近い日曜日または月曜日の日付、modeに応じて。[Date](../data-types/date.md)。

**例**

```sql
SELECT
    toLastDayOfWeek(toDateTime('2023-04-21 10:20:30')), /* 金曜日 */
    toLastDayOfWeek(toDateTime('2023-04-21 10:20:30'), 1), /* 金曜日 */
    toLastDayOfWeek(toDate('2023-04-22')), /* 土曜日 */
    toLastDayOfWeek(toDate('2023-04-22'), 1) /* 土曜日 */
FORMAT Vertical
```

結果:

```response
Row 1:
──────
toLastDayOfWeek(toDateTime('2023-04-21 10:20:30')):    2023-04-22
toLastDayOfWeek(toDateTime('2023-04-21 10:20:30'), 1): 2023-04-23
toLastDayOfWeek(toDate('2023-04-22')):                 2023-04-22
toLastDayOfWeek(toDate('2023-04-22'), 1):              2023-04-23
```

## toStartOfDay {#tostartofday}

時間を伴う日付を、その日の開始に切り捨てます。

**構文**

```sql
toStartOfDay(value)
```

**引数**

- `value` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)、または[DateTime64](../data-types/datetime64.md)

**戻り値**

- 指定された日付/時間のその日の開始時刻。[DateTime](../data-types/datetime.md)。

**例**

```sql
SELECT toStartOfDay(toDateTime('2023-04-21 10:20:30'))
```

結果:

```response
┌─toStartOfDay(toDateTime('2023-04-21 10:20:30'))─┐
│                             2023-04-21 00:00:00 │
└─────────────────────────────────────────────────┘
```

## toStartOfHour {#tostartofhour}

時間を伴う日付を、その時間の開始に切り捨てます。

**構文**

```sql
toStartOfHour(value)
```

**引数**

- `value` - [DateTime](../data-types/datetime.md) または[DateTime64](../data-types/datetime64.md)

**戻り値**

- 指定された日付/時間のその時間の開始時刻。[DateTime](../data-types/datetime.md)。

**例**

```sql
SELECT
    toStartOfHour(toDateTime('2023-04-21 10:20:30')),
    toStartOfHour(toDateTime64('2023-04-21', 6))
```

結果:

```response
┌─toStartOfHour(toDateTime('2023-04-21 10:20:30'))─┬─toStartOfHour(toDateTime64('2023-04-21', 6))─┐
│                              2023-04-21 10:00:00 │                          2023-04-21 00:00:00 │
└──────────────────────────────────────────────────┴──────────────────────────────────────────────┘
```

## toStartOfMinute {#tostartofminute}

時間を伴う日付を、その分の開始に切り捨てます。

**構文**

```sql
toStartOfMinute(value)
```

**引数**

- `value` - [DateTime](../data-types/datetime.md) または[DateTime64](../data-types/datetime64.md)

**戻り値**

- 指定された日付/時間のその分の開始時刻。[DateTime](../data-types/datetime.md)。

**例**

```sql
SELECT
    toStartOfMinute(toDateTime('2023-04-21 10:20:30')),
    toStartOfMinute(toDateTime64('2023-04-21 10:20:30.5300', 8))
FORMAT Vertical
```

結果:

```response
Row 1:
──────
toStartOfMinute(toDateTime('2023-04-21 10:20:30')):           2023-04-21 10:20:00
toStartOfMinute(toDateTime64('2023-04-21 10:20:30.5300', 8)): 2023-04-21 10:20:00
```

## toStartOfSecond {#tostartofsecond}

サブ秒を切り捨てます。

**構文**

``` sql
toStartOfSecond(value, [timezone])
```

**引数**

- `value` — 日付と時刻。[DateTime64](../data-types/datetime64.md)。
- `timezone` — 戻り値の[タイムゾーン](../../operations/server-configuration-parameters/settings.md#timezone)（オプション）。指定されていない場合、関数は `value` パラメータのタイムゾーンを使用します。[String](../data-types/string.md)。

**戻り値**

- サブ秒のない入力値。[DateTime64](../data-types/datetime64.md)。

**例**

タイムゾーンなしのクエリ:

``` sql
WITH toDateTime64('2020-01-01 10:20:30.999', 3) AS dt64
SELECT toStartOfSecond(dt64);
```

結果:

``` text
┌───toStartOfSecond(dt64)─┐
│ 2020-01-01 10:20:30.000 │
└─────────────────────────┘
```

タイムゾーンありのクエリ:

``` sql
WITH toDateTime64('2020-01-01 10:20:30.999', 3) AS dt64
SELECT toStartOfSecond(dt64, 'Asia/Istanbul');
```

結果:

``` text
┌─toStartOfSecond(dt64, 'Asia/Istanbul')─┐
│                2020-01-01 13:20:30.000 │
└────────────────────────────────────────┘
```

**参照**

- [タイムゾーン](../../operations/server-configuration-parameters/settings.md#timezone) サーバ設定パラメータ。

## toStartOfMillisecond {#tostartofmillisecond}

時間を伴う日付をミリ秒の開始に切り捨てます。

**構文**

``` sql
toStartOfMillisecond(value, [timezone])
```

**引数**

- `value` — 日付と時刻。[DateTime64](../../sql-reference/data-types/datetime64.md)。
- `timezone` — 戻り値の[タイムゾーン](../../operations/server-configuration-parameters/settings.md#timezone)（オプション）。指定されていない場合、関数は `value` パラメータのタイムゾーンを使用します。[String](../../sql-reference/data-types/string.md)。

**戻り値**

- サブミリ秒を含む入力値。[DateTime64](../../sql-reference/data-types/datetime64.md)。

**例**

タイムゾーンなしのクエリ:

``` sql
WITH toDateTime64('2020-01-01 10:20:30.999999999', 9) AS dt64
SELECT toStartOfMillisecond(dt64);
```

結果:

``` text
┌────toStartOfMillisecond(dt64)─┐
│ 2020-01-01 10:20:30.999000000 │
└───────────────────────────────┘
```

タイムゾーンありのクエリ:

``` sql
WITH toDateTime64('2020-01-01 10:20:30.999999999', 9) AS dt64
SELECT toStartOfMillisecond(dt64, 'Asia/Istanbul');
```

結果:

``` text
┌─toStartOfMillisecond(dt64, 'Asia/Istanbul')─┐
│               2020-01-01 12:20:30.999000000 │
└─────────────────────────────────────────────┘
```

**参照**

- [タイムゾーン](../../operations/server-configuration-parameters/settings.md#timezone) サーバ設定パラメータ。

## toStartOfMicrosecond {#tostartofmicrosecond}

時間を伴う日付をマイクロ秒の開始に切り捨てます。

**構文**

``` sql
toStartOfMicrosecond(value, [timezone])
```

**引数**

- `value` — 日付と時刻。[DateTime64](../../sql-reference/data-types/datetime64.md)。
- `timezone` — 戻り値の[タイムゾーン](../../operations/server-configuration-parameters/settings.md#timezone)（オプション）。指定されていない場合、関数は `value` パラメータのタイムゾーンを使用します。[String](../../sql-reference/data-types/string.md)。

**戻り値**

- サブマイクロ秒を含む入力値。[DateTime64](../../sql-reference/data-types/datetime64.md)。

**例**

タイムゾーンなしのクエリ:

``` sql
WITH toDateTime64('2020-01-01 10:20:30.999999999', 9) AS dt64
SELECT toStartOfMicrosecond(dt64);
```

結果:

``` text
┌────toStartOfMicrosecond(dt64)─┐
│ 2020-01-01 10:20:30.999999000 │
└───────────────────────────────┘
```

タイムゾーンありのクエリ:

``` sql
WITH toDateTime64('2020-01-01 10:20:30.999999999', 9) AS dt64
SELECT toStartOfMicrosecond(dt64, 'Asia/Istanbul');
```

結果:

``` text
┌─toStartOfMicrosecond(dt64, 'Asia/Istanbul')─┐
│               2020-01-01 12:20:30.999999000 │
└─────────────────────────────────────────────┘
```

**参照**

- [タイムゾーン](../../operations/server-configuration-parameters/settings.md#timezone) サーバ設定パラメータ。

## toStartOfNanosecond {#tostartofnanosecond}

時間を伴う日付をナノ秒の開始に切り捨てます。

**構文**

``` sql
toStartOfNanosecond(value, [timezone])
```

**引数**

- `value` — 日付と時刻。[DateTime64](../../sql-reference/data-types/datetime64.md)。
- `timezone` — 戻り値の[タイムゾーン](../../operations/server-configuration-parameters/settings.md#timezone)（オプション）。指定されていない場合、関数は `value` パラメータのタイムゾーンを使用します。[String](../../sql-reference/data-types/string.md)。

**戻り値**

- サブナノ秒を含む入力値。[DateTime64](../../sql-reference/data-types/datetime64.md)。

**例**

タイムゾーンなしのクエリ:

``` sql
WITH toDateTime64('2020-01-01 10:20:30.999999999', 9) AS dt64
SELECT toStartOfNanosecond(dt64);
```

結果:

``` text
┌─────toStartOfNanosecond(dt64)─┐
│ 2020-01-01 10:20:30.999999999 │
└───────────────────────────────┘
```

タイムゾーンありのクエリ:

``` sql
WITH toDateTime64('2020-01-01 10:20:30.999999999', 9) AS dt64
SELECT toStartOfNanosecond(dt64, 'Asia/Istanbul');
```

結果:

``` text
┌─toStartOfNanosecond(dt64, 'Asia/Istanbul')─┐
│              2020-01-01 12:20:30.999999999 │
└────────────────────────────────────────────┘
```

**参照**

- [タイムゾーン](../../operations/server-configuration-parameters/settings.md#timezone) サーバ設定パラメータ。

## toStartOfFiveMinutes {#tostartoffiveminutes}

時間を伴う日付を5分間隔の開始に切り捨てます。

**構文**

```sql
toStartOfFiveMinutes(value)
```

**引数**

- `value` - [DateTime](../data-types/datetime.md) または[DateTime64](../data-types/datetime64.md)

**戻り値**

- 指定された日付/時間の5分間隔の開始時刻。[DateTime](../data-types/datetime.md)。

**例**

```sql
SELECT
    toStartOfFiveMinutes(toDateTime('2023-04-21 10:17:00')),
    toStartOfFiveMinutes(toDateTime('2023-04-21 10:20:00')),
    toStartOfFiveMinutes(toDateTime('2023-04-21 10:23:00'))
FORMAT Vertical
```

結果:

```response
Row 1:
──────
toStartOfFiveMinutes(toDateTime('2023-04-21 10:17:00')): 2023-04-21 10:15:00
toStartOfFiveMinutes(toDateTime('2023-04-21 10:20:00')): 2023-04-21 10:20:00
toStartOfFiveMinutes(toDateTime('2023-04-21 10:23:00')): 2023-04-21 10:20:00
```

## toStartOfTenMinutes {#tostartoftenminutes}

時間を伴う日付を10分間隔の開始に切り捨てます。

**構文**

```sql
toStartOfTenMinutes(value)
```

**引数**

- `value` - [DateTime](../data-types/datetime.md) または[DateTime64](../data-types/datetime64.md)

**戻り値**

- 指定された日付/時間の10分間隔の開始時刻。[DateTime](../data-types/datetime.md)。

**例**

```sql
SELECT
    toStartOfTenMinutes(toDateTime('2023-04-21 10:17:00')),
    toStartOfTenMinutes(toDateTime('2023-04-21 10:20:00')),
    toStartOfTenMinutes(toDateTime('2023-04-21 10:23:00'))
FORMAT Vertical
```

結果:

```response
Row 1:
──────
toStartOfTenMinutes(toDateTime('2023-04-21 10:17:00')): 2023-04-21 10:10:00
toStartOfTenMinutes(toDateTime('2023-04-21 10:20:00')): 2023-04-21 10:20:00
toStartOfTenMinutes(toDateTime('2023-04-21 10:23:00')): 2023-04-21 10:20:00
```

## toStartOfFifteenMinutes {#tostartoffifteenminutes}

時間を伴う日付を15分間隔の開始に切り捨てます。

**構文**

```sql
toStartOfFifteenMinutes(value)
```

**引数**

- `value` - [DateTime](../data-types/datetime.md) または[DateTime64](../data-types/datetime64.md)

**戻り値**

- 指定された日付/時間の15分間隔の開始時刻。[DateTime](../data-types/datetime.md)。

**例**

```sql
SELECT
    toStartOfFifteenMinutes(toDateTime('2023-04-21 10:17:00')),
    toStartOfFifteenMinutes(toDateTime('2023-04-21 10:20:00')),
    toStartOfFifteenMinutes(toDateTime('2023-04-21 10:23:00'))
FORMAT Vertical
```

結果:

```response
Row 1:
──────
toStartOfFifteenMinutes(toDateTime('2023-04-21 10:17:00')): 2023-04-21 10:15:00
toStartOfFifteenMinutes(toDateTime('2023-04-21 10:20:00')): 2023-04-21 10:15:00
toStartOfFifteenMinutes(toDateTime('2023-04-21 10:23:00')): 2023-04-21 10:15:00
```

## toStartOfInterval {#tostartofinterval}

この関数は、`toStartOf*()` 関数を `toStartOfInterval(date_or_date_with_time, INTERVAL x unit [, time_zone])` 構文で一般化します。
例えば、
- `toStartOfInterval(t, INTERVAL 1 YEAR)` は `toStartOfYear(t)` と同じ結果を返します。
- `toStartOfInterval(t, INTERVAL 1 MONTH)` は `toStartOfMonth(t)` と同じ結果を返します。
- `toStartOfInterval(t, INTERVAL 1 DAY)` は `toStartOfDay(t)` と同じ結果を返します。
- `toStartOfInterval(t, INTERVAL 15 MINUTE)` は `toStartOfFifteenMinutes(t)` と同じ結果を返します。

計算は特定の時点に対して行われます:

| インターバル    | スタート                  |
|----------------|---------------------------|
| YEAR           | 年 0                      |
| QUARTER        | 1900年第1四半期          |
| MONTH          | 1900年1月                |
| WEEK           | 1970年第1週 (01-05)      |
| DAY            | 1970-01-01                |
| HOUR           | (*)                       |
| MINUTE         | 1970-01-01 00:00:00       |
| SECOND         | 1970-01-01 00:00:00       |
| MILLISECOND    | 1970-01-01 00:00:00       |
| MICROSECOND    | 1970-01-01 00:00:00       |
| NANOSECOND     | 1970-01-01 00:00:00       |

(*) 時間のインターバルは特別なもので、計算は常に現在の日の午前0時を基準に行われます。そのため、1時から23時までの時間値のみが有用です。

unit `WEEK` が指定された場合、`toStartOfInterval` は週の始まりが月曜日であると見なします。この動作は、デフォルトで日曜日から始まる `toStartOfWeek` 関数とは異なる点に注意してください。

**構文**

```sql
toStartOfInterval(value, INTERVAL x unit[, time_zone])
toStartOfInterval(value, INTERVAL x unit[, origin[, time_zone]])
```
エイリアス: `time_bucket`, `date_bin`。

2番目のオーバーロードは、TimescaleDBの `time_bucket()` 関数、およびPostgreSQLの `date_bin()` 関数を模倣します。例えば、

``` SQL
SELECT toStartOfInterval(toDateTime('2023-01-01 14:45:00'), INTERVAL 1 MINUTE, toDateTime('2023-01-01 14:35:30'));
```

結果:

``` reference
┌───toStartOfInterval(...)─┐
│      2023-01-01 14:44:30 │
└──────────────────────────┘
```

**参照**
- [date_trunc](#date_trunc)

## toTime {#totime}

時間を維持しながら、日付を特定の固定日付に変換します。

**構文**

```sql
toTime(date[,timezone])
```

**引数**

- `date` — 時間に変換する日付。[Date](../data-types/date.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。
- `timezone` （オプション）— 戻り値のタイムゾーン。[String](../data-types/string.md)。

**戻り値**

- 日付は `1970-01-02` に設定され、時間は保持されたDateTime。[DateTime](../data-types/datetime.md)。

:::note
もし `date` 入力引数にサブ秒コンポーネントが含まれていた場合、戻り値の `DateTime` では秒単位で切り捨てられます。
:::

**例**

クエリ:

```sql
SELECT toTime(toDateTime64('1970-12-10 01:20:30.3000',3)) AS result, toTypeName(result);
```

結果:

```response
┌──────────────result─┬─toTypeName(result)─┐
│ 1970-01-02 01:20:30 │ DateTime           │
└─────────────────────┴────────────────────┘
```

## toRelativeYearNum {#torelativeyearnum}

日付または時間を伴う日付を、過去の特定の固定ポイントから経過した年数に変換します。

**構文**

```sql
toRelativeYearNum(date)
```

**引数**

- `date` — 日付または時間を伴う日付。[Date](../data-types/date.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**戻り値**

- 過去の固定参照点からの年数。[UInt16](../data-types/int-uint.md)。

**例**

クエリ:

```sql
SELECT
    toRelativeYearNum(toDate('2002-12-08')) AS y1,
    toRelativeYearNum(toDate('2010-10-26')) AS y2
```

結果:

```response
┌───y1─┬───y2─┐
│ 2002 │ 2010 │
└──────┴──────┘
```

## toRelativeQuarterNum {#torelativequarternum}

日付または時間を伴う日付を、過去の特定の固定ポイントから経過した四半期数に変換します。

**構文**

```sql
toRelativeQuarterNum(date)
```

**引数**

- `date` — 日付または時間を伴う日付。[Date](../data-types/date.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**戻り値**

- 過去の固定参照点からの四半期数。[UInt32](../data-types/int-uint.md)。

**例**

クエリ:

```sql
SELECT
  toRelativeQuarterNum(toDate('1993-11-25')) AS q1,
  toRelativeQuarterNum(toDate('2005-01-05')) AS q2
```

結果:

```response
┌───q1─┬───q2─┐
│ 7975 │ 8020 │
└──────┴──────┘
```

## toRelativeMonthNum {#torelativemonthnum}

日付または時間を伴う日付を、過去の特定の固定ポイントから経過した月数に変換します。

**構文**

```sql
toRelativeMonthNum(date)
```

**引数**

- `date` — 日付または時間を伴う日付。[Date](../data-types/date.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**戻り値**

- 過去の固定参照点からの月数。[UInt32](../data-types/int-uint.md)。

**例**

クエリ:

```sql
SELECT
  toRelativeMonthNum(toDate('2001-04-25')) AS m1,
  toRelativeMonthNum(toDate('2009-07-08')) AS m2
```

結果:

```response
┌────m1─┬────m2─┐
│ 24016 │ 24115 │
└───────┴───────┘
```

## toRelativeWeekNum {#torelativeweeknum}

日付または時間を伴う日付を、過去の特定の固定ポイントから経過した週数に変換します。

**構文**

```sql
toRelativeWeekNum(date)
```

**引数**

- `date` — 日付または時間を伴う日付。[Date](../data-types/date.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**戻り値**

- 過去の固定参照点からの週数。[UInt32](../data-types/int-uint.md)。

**例**

クエリ:

```sql
SELECT
  toRelativeWeekNum(toDate('2000-02-29')) AS w1,
  toRelativeWeekNum(toDate('2001-01-12')) AS w2
```

結果:

```response
┌───w1─┬───w2─┐
│ 1574 │ 1619 │
└──────┴──────┘
```

## toRelativeDayNum {#torelativedaynum}

日付または時間を伴う日付を、過去の特定の固定ポイントから経過した日数に変換します。

**構文**

```sql
toRelativeDayNum(date)
```

**引数**

- `date` — 日付または時間を伴う日付。[Date](../data-types/date.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**戻り値**

- 過去の固定参照点からの日数。[UInt32](../data-types/int-uint.md)。

**例**

クエリ:

```sql
SELECT
  toRelativeDayNum(toDate('1993-10-05')) AS d1,
  toRelativeDayNum(toDate('2000-09-20')) AS d2
```

結果:

```response
┌───d1─┬────d2─┐
│ 8678 │ 11220 │
└──────┴───────┘
```

## toRelativeHourNum {#torelativehournum}

日付または時間を伴う日付を、過去の特定の固定ポイントから経過した時間数に変換します。

**構文**

```sql
toRelativeHourNum(date)
```

**引数**

- `date` — 日付または時間を伴う日付。[Date](../data-types/date.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**戻り値**

- 過去の固定参照点からの時間数。[UInt32](../data-types/int-uint.md)。

**例**

クエリ:

```sql
SELECT
  toRelativeHourNum(toDateTime('1993-10-05 05:20:36')) AS h1,
  toRelativeHourNum(toDateTime('2000-09-20 14:11:29')) AS h2
```

結果:

```response
┌─────h1─┬─────h2─┐
│ 208276 │ 269292 │
└────────┴────────┘
```

## toRelativeMinuteNum {#torelativeminutenum}

日付または時間を伴う日付を、過去の特定の固定ポイントから経過した分数に変換します。

**構文**

```sql
toRelativeMinuteNum(date)
```

**引数**

- `date` — 日付または時間を伴う日付。[Date](../data-types/date.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**戻り値**

- 過去の固定参照点からの分数。[UInt32](../data-types/int-uint.md)。

**例**

クエリ:

```sql
SELECT
  toRelativeMinuteNum(toDateTime('1993-10-05 05:20:36')) AS m1,
  toRelativeMinuteNum(toDateTime('2000-09-20 14:11:29')) AS m2
```

結果:

```response
┌───────m1─┬───────m2─┐
│ 12496580 │ 16157531 │
└──────────┴──────────┘
```

## toRelativeSecondNum {#torelativesecondnum}

日付または時間を伴う日付を、過去の特定の固定ポイントから経過した秒数に変換します。

**構文**

```sql
toRelativeSecondNum(date)
```

**引数**

- `date` — 日付または時間を伴う日付。[Date](../data-types/date.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**戻り値**

- 過去の固定参照点からの秒数。[UInt32](../data-types/int-uint.md)。

**例**

クエリ:

```sql
SELECT
  toRelativeSecondNum(toDateTime('1993-10-05 05:20:36')) AS s1,
  toRelativeSecondNum(toDateTime('2000-09-20 14:11:29')) AS s2
```

結果:

```response
┌────────s1─┬────────s2─┐
│ 749794836 │ 969451889 │
└───────────┴───────────┘
```

## toISOYear {#toisoyear}

日付または時間を伴う日付を、UInt16のISO年に変換します。

**構文**

```sql
toISOYear(value)
```

**引数**

- `value` — 日付または時間を伴う日付の値。[Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)

**戻り値**

- 入力値をISO年番号に変換したもの。[UInt16](../data-types/int-uint.md)。

**例**

クエリ:

```sql
SELECT
  toISOYear(toDate('2024/10/02')) as year1,
  toISOYear(toDateTime('2024-10-02 01:30:00')) as year2
```

結果:

```response
┌─year1─┬─year2─┐
│  2024 │  2024 │
└───────┴───────┘
```

## toISOWeek {#toisoweek}

日付または時間を伴う日付を、UInt8のISO週番号に変換します。

**構文**

```sql
toISOWeek(value)
```

**引数**

- `value` — 日付または時間を伴う日付の値。

**戻り値**

- `value`を現在のISO週番号に変換したもの。[UInt8](../data-types/int-uint.md)。

**例**

クエリ:

```sql
SELECT
  toISOWeek(toDate('2024/10/02')) AS week1,
  toISOWeek(toDateTime('2024/10/02 01:30:00')) AS week2
```

結果:

```response
┌─week1─┬─week2─┐
│    40 │    40 │
└───────┴───────┘
```

## toWeek {#toweek}

この関数は、日付または日時の週番号を返します。2引数の `toWeek()` 形式を使用すると、週が日曜日または月曜日に始まるかどうか、戻り値が0から53の範囲になるか1から53の範囲になるかを指定できます。mode引数が省略された場合、デフォルトのmodeは0です。

`toISOWeek()` は、`toWeek(date,3)` と同等の互換関数です。

以下の表は、mode引数がどのように機能するかを説明しています。

| モード | 週の最初の日 | 範囲  | 週 1 は次の条件を満たす週 ...    |
|--------|---------------|-------|-----------------------------------|
| 0      | 日曜日       | 0-53  | 今年の中で日曜日がある週        |
| 1      | 月曜日       | 0-53  | 今年の中で4日以上ある週       |
| 2      | 日曜日       | 1-53  | 今年の中で日曜日がある週        |
| 3      | 月曜日       | 1-53  | 今年の中で4日以上ある週       |
| 4      | 日曜日       | 0-53  | 今年の中で4日以上ある週        |
| 5      | 月曜日       | 0-53  | 今年の中で月曜日がある週       |
| 6      | 日曜日       | 1-53  | 今年の中で4日以上ある週        |
| 7      | 月曜日       | 1-53  | 今年の中で月曜日がある週       |
| 8      | 日曜日       | 1-53  | 1月1日を含む週                |
| 9      | 月曜日       | 1-53  | 1月1日を含む週                |

「今年の中で4日以上ある週」という意味を持つモード値では、週はISO 8601:1988に従って番号付けされます：

- 1月1日を含む週が4日以上あれば、それは週1です。
- そうでない場合は前年の最後の週となり、次の週が週1となります。

「1月1日を含む」という意味を持つモード値では、1月1日を含む週は週1です。新年の何日を含んでいるかは関係ありません。つまり、12月の最後の週が翌年の1月1日を含んでいれば、それは翌年の週1です。

**構文**

``` sql
toWeek(t[, mode[, time_zone]])
```

エイリアス: `WEEK`

**引数**

- `t` – 日付または日時。
- `mode` – 任意のパラメータ、値の範囲は\[0,9\]、デフォルトは0です。
- `timezone` – 任意のパラメータで、他の変換関数と同様に動作します。

最初の引数も、[String](../data-types/string.md)として、[parseDateTime64BestEffort()](type-conversion-functions.md#parsedatetime64besteffort)でサポートされている形式で指定できます。文字列引数のサポートは、特定のサードパーティツールで期待されるMySQLとの互換性を目的としたもので、将来的にMySQL対応設定に依存する可能性があるため、使用しないことを推奨します。

**例**

``` sql
SELECT toDate('2016-12-27') AS date, toWeek(date) AS week0, toWeek(date,1) AS week1, toWeek(date,9) AS week9;
```

``` text
┌───────date─┬─week0─┬─week1─┬─week9─┐
│ 2016-12-27 │    52 │    52 │     1 │
└────────────┴───────┴───────┴───────┘
```

## toYearWeek {#toyearweek}

日付に対して年と週を返します。結果の年は、年の最初の週と最後の週に対して、引数の日付の年とは異なる場合があります。

mode引数は、`toWeek()` に対するmode引数と同様に機能します。単一引数の構文の場合、mode値は0が使用されます。

`toISOYear()` は、`intDiv(toYearWeek(date,3),100)` と同等の互換関数です。

:::warning
`toYearWeek()` によって返される週番号は、`toWeek()` が返す週番号と異なる可能性があります。`toWeek()` は常に指定された年の文脈で週番号を返し、`toWeek()` が `0` を返す場合、`toYearWeek()` は前年の最終週に対応する値を返します。以下の例の `prev_yearWeek` を参照してください。
:::

**構文**

``` sql
toYearWeek(t[, mode[, timezone]])
```

エイリアス: `YEARWEEK`

最初の引数も、[String](../data-types/string.md)として、[parseDateTime64BestEffort()](type-conversion-functions.md#parsedatetime64besteffort)でサポートされている形式で指定できます。文字列引数のサポートは、特定のサードパーティツールで期待されるMySQLとの互換性を目的としたもので、将来的にMySQL対応設定に依存する可能性があるため、使用しないことを推奨します。

**例**

``` sql
SELECT toDate('2016-12-27') AS date, toYearWeek(date) AS yearWeek0, toYearWeek(date,1) AS yearWeek1, toYearWeek(date,9) AS yearWeek9, toYearWeek(toDate('2022-01-01')) AS prev_yearWeek;
```

``` text
┌───────date─┬─yearWeek0─┬─yearWeek1─┬─yearWeek9─┬─prev_yearWeek─┐
│ 2016-12-27 │    201652 │    201652 │    201701 │        202152 │
└────────────┴───────────┴───────────┴───────────┴───────────────┘
```

## toDaysSinceYearZero {#todayssinceyearzero}

指定された日付に対して、[グレゴリオ暦のプロレプティックカレンダーに基づく](https://en.wikipedia.org/wiki/Year_zero) である[ISO 8601](https://en.wikipedia.org/wiki/Gregorian_calendar#Proleptic_Gregorian_calendar)での年0の[1月1日](https://en.wikipedia.org/wiki/Year_zero)以降、経過した日数を返します。この計算はMySQLの[`TO_DAYS()`](https://dev.mysql.com/doc/refman/8.0/en/date-and-time-functions.html#function_to-days)関数と同じです。

**構文**

``` sql
toDaysSinceYearZero(date[, time_zone])
```

エイリアス: `TO_DAYS`

**引数**

- `date` — 年ゼロ以降での経過日数を計算する日付。[Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)、または[DateTime64](../data-types/datetime64.md)。
- `time_zone` — タイムゾーンを表す定数値のString型、または表現。[String types](../data-types/string.md)

**戻り値**

年0-01-01以降の経過日数。[UInt32](../data-types/int-uint.md)。

**例**

``` sql
SELECT toDaysSinceYearZero(toDate('2023-09-08'));
```

結果:

``` text
┌─toDaysSinceYearZero(toDate('2023-09-08')))─┐
│                                     713569 │
└────────────────────────────────────────────┘
```

**参照**

- [fromDaysSinceYearZero](#fromdayssinceyearzero)
## fromDaysSinceYearZero {#fromdayssinceyearzero}

指定された日数が[西暦0000年1月1日](https://en.wikipedia.org/wiki/Year_zero)から経過した日数に対して、[ISO 8601で定義されたプロレプティックグレゴリオ暦](https://en.wikipedia.org/wiki/Gregorian_calendar#Proleptic_Gregorian_calendar)に対応する日付を返します。この計算は、MySQLの[`FROM_DAYS()`](https://dev.mysql.com/doc/refman/8.0/en/date-and-time-functions.html#function_from-days)関数と同じです。

[`Date`](../data-types/date.md)型の範囲内で表現できない場合、結果は未定義です。

**構文**

``` sql
fromDaysSinceYearZero(days)
```

エイリアス: `FROM_DAYS`

**引数**

- `days` — 年0から経過した日数。

**返される値**

年0から経過した日数に対応する日付。[Date](../data-types/date.md)。

**例**

``` sql
SELECT fromDaysSinceYearZero(739136), fromDaysSinceYearZero(toDaysSinceYearZero(toDate('2023-09-08')));
```

結果:

``` text
┌─fromDaysSinceYearZero(739136)─┬─fromDaysSinceYearZero(toDaysSinceYearZero(toDate('2023-09-08')))─┐
│                    2023-09-08 │                                                       2023-09-08 │
└───────────────────────────────┴──────────────────────────────────────────────────────────────────┘
```

**関連項目**

- [toDaysSinceYearZero](#todayssinceyearzero)
## fromDaysSinceYearZero32 {#fromdayssinceyearzero32}

[fromDaysSinceYearZero](#fromdayssinceyearzero)と同様ですが、[Date32](../data-types/date32.md)を返します。
## age {#age}

`startdate`と`enddate`の差の`unit`コンポーネントを返します。差は1ナノ秒の精度で計算されます。
例えば、`2021-12-29`と`2022-01-01`の差は、`day`単位では3日、`month`単位では0ヶ月、`year`単位では0年です。

`age`の代替として、`date_diff`関数を参照してください。

**構文**

``` sql
age('unit', startdate, enddate, [timezone])
```

**引数**

- `unit` — 結果のインターバルの種類。[String](../data-types/string.md)。
    可能な値:

    - `nanosecond`, `nanoseconds`, `ns`
    - `microsecond`, `microseconds`, `us`, `u`
    - `millisecond`, `milliseconds`, `ms`
    - `second`, `seconds`, `ss`, `s`
    - `minute`, `minutes`, `mi`, `n`
    - `hour`, `hours`, `hh`, `h`
    - `day`, `days`, `dd`, `d`
    - `week`, `weeks`, `wk`, `ww`
    - `month`, `months`, `mm`, `m`
    - `quarter`, `quarters`, `qq`, `q`
    - `year`, `years`, `yyyy`, `yy`

- `startdate` — 最初に引く時間の値（被減数）。[Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)。

- `enddate` — 引く対象となる2番目の時間の値（減数）。[Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)。

- `timezone` — [タイムゾーン名](../../operations/server-configuration-parameters/settings.md#timezone)（オプション）。指定した場合、`startdate`と`enddate`の両方に適用されます。指定しない場合、`startdate`と`enddate`のタイムゾーンが使用されます。同じでない場合、結果は未定義です。[String](../data-types/string.md)。

**返される値**

`enddate`と`startdate`の差を`unit`で表現したもの。[Int](../data-types/int-uint.md)。

**例**

``` sql
SELECT age('hour', toDateTime('2018-01-01 22:30:00'), toDateTime('2018-01-02 23:00:00'));
```

結果:

``` text
┌─age('hour', toDateTime('2018-01-01 22:30:00'), toDateTime('2018-01-02 23:00:00'))─┐
│                                                                                24 │
└───────────────────────────────────────────────────────────────────────────────────┘
```

``` sql
SELECT
    toDate('2022-01-01') AS e,
    toDate('2021-12-29') AS s,
    age('day', s, e) AS day_age,
    age('month', s, e) AS month__age,
    age('year', s, e) AS year_age;
```

結果:

``` text
┌──────────e─┬──────────s─┬─day_age─┬─month__age─┬─year_age─┐
│ 2022-01-01 │ 2021-12-29 │       3 │          0 │        0 │
└────────────┴────────────┴─────────┴────────────┴──────────┘
```
## date_diff {#date_diff}

`startdate`と`enddate`の間で交差した指定された`unit`の境界の数を返します。
差は相対的な単位で計算されます。例えば、`2021-12-29`と`2022-01-01`の差は、`day`単位では3日（[toRelativeDayNum](#torelativedaynum)を参照）、`month`単位では1ヶ月（[toRelativeMonthNum](#torelativemonthnum)を参照）、`year`単位では1年（[toRelativeYearNum](#torelativeyearnum)を参照）です。

`week`単位が指定された場合、`date_diff`は、週が月曜日に始まると仮定します。この動作は、デフォルトで週が日曜日に始まる`toWeek()`関数とは異なることに注意してください。

`date_diff`の代替として、`age`関数を参照してください。

**構文**

``` sql
date_diff('unit', startdate, enddate, [timezone])
```

エイリアス: `dateDiff`, `DATE_DIFF`, `timestampDiff`, `timestamp_diff`, `TIMESTAMP_DIFF`。

**引数**

- `unit` — 結果のインターバルの種類。[String](../data-types/string.md)。
    可能な値:

    - `nanosecond`, `nanoseconds`, `ns`
    - `microsecond`, `microseconds`, `us`, `u`
    - `millisecond`, `milliseconds`, `ms`
    - `second`, `seconds`, `ss`, `s`
    - `minute`, `minutes`, `mi`, `n`
    - `hour`, `hours`, `hh`, `h`
    - `day`, `days`, `dd`, `d`
    - `week`, `weeks`, `wk`, `ww`
    - `month`, `months`, `mm`, `m`
    - `quarter`, `quarters`, `qq`, `q`
    - `year`, `years`, `yyyy`, `yy`

- `startdate` — 最初に引く時間の値（被減数）。[Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)。

- `enddate` — 引く対象となる2番目の時間の値（減数）。[Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)。

- `timezone` — [タイムゾーン名](../../operations/server-configuration-parameters/settings.md#timezone)（オプション）。指定した場合、`startdate`と`enddate`の両方に適用されます。指定しない場合、`startdate`と`enddate`のタイムゾーンが使用されます。同じでない場合、結果は未定義です。[String](../data-types/string.md)。

**返される値**

`enddate`と`startdate`の差を`unit`で表現したもの。[Int](../data-types/int-uint.md)。

**例**

``` sql
SELECT dateDiff('hour', toDateTime('2018-01-01 22:00:00'), toDateTime('2018-01-02 23:00:00'));
```

結果:

``` text
┌─dateDiff('hour', toDateTime('2018-01-01 22:00:00'), toDateTime('2018-01-02 23:00:00'))─┐
│                                                                                     25 │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

``` sql
SELECT
    toDate('2022-01-01') AS e,
    toDate('2021-12-29') AS s,
    dateDiff('day', s, e) AS day_diff,
    dateDiff('month', s, e) AS month__diff,
    dateDiff('year', s, e) AS year_diff;
```

結果:

``` text
┌──────────e─┬──────────s─┬─day_diff─┬─month__diff─┬─year_diff─┐
│ 2022-01-01 │ 2021-12-29 │        3 │           1 │         1 │
└────────────┴────────────┴──────────┴─────────────┴───────────┘
```
## date\_trunc {#date_trunc}

日付と時間のデータを指定した日付部分に切り捨てます。

**構文**

``` sql
date_trunc(unit, value[, timezone])
```

エイリアス: `dateTrunc`。

**引数**

- `unit` — 結果を切り捨てるインターバルの種類。[String Literal](../syntax.md#syntax-string-literal)。
    可能な値:

    - `nanosecond` - DateTime64と互換性あり
    - `microsecond` - DateTime64と互換性あり
    - `milisecond` - DateTime64と互換性あり
    - `second`
    - `minute`
    - `hour`
    - `day`
    - `week`
    - `month`
    - `quarter`
    - `year`

    `unit`引数は大文字小文字を区別しません。

- `value` — 日付と時間。[Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)。
- `timezone` — 返される値用の[タイムゾーン名](../../operations/server-configuration-parameters/settings.md#timezone)（オプション）。指定しない場合、関数は`value`パラメータのタイムゾーンを使用します。[String](../data-types/string.md)。

**返される値**

- 指定された日付部分に切り捨てられた値。[DateTime](../data-types/datetime.md)。

**例**

タイムゾーン指定なしのクエリ:

``` sql
SELECT now(), date_trunc('hour', now());
```

結果:

``` text
┌───────────────now()─┬─date_trunc('hour', now())─┐
│ 2020-09-28 10:40:45 │       2020-09-28 10:00:00 │
└─────────────────────┴───────────────────────────┘
```

指定されたタイムゾーンでのクエリ:

```sql
SELECT now(), date_trunc('hour', now(), 'Asia/Istanbul');
```

結果:

```text
┌───────────────now()─┬─date_trunc('hour', now(), 'Asia/Istanbul')─┐
│ 2020-09-28 10:46:26 │                        2020-09-28 13:00:00 │
└─────────────────────┴────────────────────────────────────────────┘
```

**関連項目**

- [toStartOfInterval](#tostartofinterval)
## date\_add {#date_add}

指定された日付または日付と時間に時間間隔または日付間隔を加えます。

加算により、データ型の範囲外の値が生成された場合、結果は未定義です。

**構文**

``` sql
date_add(unit, value, date)
```

代替構文:

``` sql
date_add(date, INTERVAL value unit)
```

エイリアス: `dateAdd`, `DATE_ADD`。

**引数**

- `unit` — 加算するインターバルの種類。注意: これは[String](../data-types/string.md)ではなく、引用符で囲んではいけません。
    可能な値:

    - `second`
    - `minute`
    - `hour`
    - `day`
    - `week`
    - `month`
    - `quarter`
    - `year`

- `value` — 加算するインターバルの値。[Int](../data-types/int-uint.md)。
- `date` — `value`が加算される日付または日付と時間。[Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)。

**返される値**

`date`に`value`を`unit`で表現したものを加えた結果の日付または日付と時間。[Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)。

**例**

```sql
SELECT date_add(YEAR, 3, toDate('2018-01-01'));
```

結果:

```text
┌─plus(toDate('2018-01-01'), toIntervalYear(3))─┐
│                                    2021-01-01 │
└───────────────────────────────────────────────┘
```

```sql
SELECT date_add(toDate('2018-01-01'), INTERVAL 3 YEAR);
```

結果:

```text
┌─plus(toDate('2018-01-01'), toIntervalYear(3))─┐
│                                    2021-01-01 │
└───────────────────────────────────────────────┘
```



**関連項目**

- [addDate](#adddate)
## date\_sub {#date_sub}

指定された日付または日付と時間から時間間隔または日付間隔を引きます。

減算により、データ型の範囲外の値が生成された場合、結果は未定義です。

**構文**

``` sql
date_sub(unit, value, date)
```

代替構文:

``` sql
date_sub(date, INTERVAL value unit)
```


エイリアス: `dateSub`, `DATE_SUB`。

**引数**

- `unit` — 引くインターバルの種類。注意: これは[String](../data-types/string.md)ではなく、引用符で囲んではいけません。

    可能な値:

    - `second`
    - `minute`
    - `hour`
    - `day`
    - `week`
    - `month`
    - `quarter`
    - `year`

- `value` — 減算するインターバルの値。[Int](../data-types/int-uint.md)。
- `date` — `value`が引かれる日付または日付と時間。[Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)。

**返される値**

`date`から`value`を`unit`で表現したものを引いた結果の日付または日付と時間。[Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)。

**例**

``` sql
SELECT date_sub(YEAR, 3, toDate('2018-01-01'));
```

結果:

``` text
┌─minus(toDate('2018-01-01'), toIntervalYear(3))─┐
│                                     2015-01-01 │
└────────────────────────────────────────────────┘
```

``` sql
SELECT date_sub(toDate('2018-01-01'), INTERVAL 3 YEAR);
```

結果:

``` text
┌─minus(toDate('2018-01-01'), toIntervalYear(3))─┐
│                                     2015-01-01 │
└────────────────────────────────────────────────┘
```


**関連項目**

- [subDate](#subdate)
## timestamp\_add {#timestamp_add}

指定された時間値を提供された日付または日付と時間に加えます。

加算により、データ型の範囲外の値が生成された場合、結果は未定義です。

**構文**

``` sql
timestamp_add(date, INTERVAL value unit)
```

エイリアス: `timeStampAdd`, `TIMESTAMP_ADD`。

**引数**

- `date` — 日付または日付と時間。[Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)。
- `value` — 加算するインターバルの値。[Int](../data-types/int-uint.md)。
- `unit` — 加算するインターバルの種類。[String](../data-types/string.md)。
    可能な値:

    - `second`
    - `minute`
    - `hour`
    - `day`
    - `week`
    - `month`
    - `quarter`
    - `year`

**返される値**

`date`に指定された`value`を`unit`で表現したものを加えた、日付または日付と時間。[Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)。

**例**

```sql
select timestamp_add(toDate('2018-01-01'), INTERVAL 3 MONTH);
```

結果:

```text
┌─plus(toDate('2018-01-01'), toIntervalMonth(3))─┐
│                                     2018-04-01 │
└────────────────────────────────────────────────┘
```
## timestamp\_sub {#timestamp_sub}

指定された日付または日付と時間から時間間隔を引きます。

減算により、データ型の範囲外の値が生成された場合、結果は未定義です。

**構文**

``` sql
timestamp_sub(unit, value, date)
```

エイリアス: `timeStampSub`, `TIMESTAMP_SUB`。

**引数**

- `unit` — 引くインターバルの種類。[String](../data-types/string.md)。
    可能な値:

    - `second`
    - `minute`
    - `hour`
    - `day`
    - `week`
    - `month`
    - `quarter`
    - `year`

- `value` — 減算するインターバルの値。[Int](../data-types/int-uint.md)。
- `date` — 日付または日付と時間。[Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)。

**返される値**

`date`から`value`を`unit`で表現したものを引いた結果の日付または日付と時間。[Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)。

**例**

```sql
select timestamp_sub(MONTH, 5, toDateTime('2018-12-18 01:02:03'));
```

結果:

```text
┌─minus(toDateTime('2018-12-18 01:02:03'), toIntervalMonth(5))─┐
│                                          2018-07-18 01:02:03 │
└──────────────────────────────────────────────────────────────┘
```
## addDate {#adddate}

指定された日付、日付と時間、または文字列形式の日付/日付と時間に時間間隔を加えます。

加算により、データ型の範囲外の値が生成された場合、結果は未定義です。

**構文**

``` sql
addDate(date, interval)
```

**引数**

- `date` — `interval`が加算される日付または日付と時間。[Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)、[DateTime64](../data-types/datetime64.md)、または[String](../data-types/string.md)
- `interval` — 加算するインターバル。[Interval](../data-types/special-data-types/interval.md)。

**返される値**

`date`に`interval`を加えた結果の日付または日付と時間。[Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)。

**例**

```sql
SELECT addDate(toDate('2018-01-01'), INTERVAL 3 YEAR);
```

結果:

```text
┌─addDate(toDate('2018-01-01'), toIntervalYear(3))─┐
│                                       2021-01-01 │
└──────────────────────────────────────────────────┘
```

エイリアス: `ADDDATE`

**関連項目**

- [date_add](#date_add)
## subDate {#subdate}

指定された日付、日付と時間、または文字列形式の日付/日付と時間から時間間隔を引きます。

減算により、データ型の範囲外の値が生成された場合、結果は未定義です。

**構文**

``` sql
subDate(date, interval)
```

**引数**

- `date` — `interval`が引かれる日付または日付と時間。[Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)、[DateTime64](../data-types/datetime64.md)、または[String](../data-types/string.md)
- `interval` — 減算するインターバル。[Interval](../data-types/special-data-types/interval.md)。

**返される値**

`date`から`interval`を引いた結果の日付または日付と時間。[Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)。

**例**

```sql
SELECT subDate(toDate('2018-01-01'), INTERVAL 3 YEAR);
```

結果:

```text
┌─subDate(toDate('2018-01-01'), toIntervalYear(3))─┐
│                                       2015-01-01 │
└──────────────────────────────────────────────────┘
```

エイリアス: `SUBDATE`

**関連項目**

- [date_sub](#date_sub)
## now {#now}

クエリ分析の瞬間における現在の日付と時間を返します。この関数は定数式です。

エイリアス: `current_timestamp`。

**構文**

``` sql
now([timezone])
```

**引数**

- `timezone` — 返される値用の[タイムゾーン名](../../operations/server-configuration-parameters/settings.md#timezone)（オプション）。[String](../data-types/string.md)。

**返される値**

- 現在の日付と時間。[DateTime](../data-types/datetime.md)。

**例**

タイムゾーン指定なしのクエリ:

``` sql
SELECT now();
```

結果:

``` text
┌───────────────now()─┐
│ 2020-10-17 07:42:09 │
└─────────────────────┘
```

指定されたタイムゾーンでのクエリ:

``` sql
SELECT now('Asia/Istanbul');
```

結果:

``` text
┌─now('Asia/Istanbul')─┐
│  2020-10-17 10:42:23 │
└──────────────────────┘
```
## now64 {#now64}

クエリ分析の瞬間におけるサブ秒精度での現在の日付と時間を返します。この関数は定数式です。

**構文**

``` sql
now64([scale], [timezone])
```

**引数**

- `scale` - チックサイズ（精度）：10<sup>-precision</sup>秒。有効範囲: [ 0 : 9 ]。通常は、3（デフォルト）（ミリ秒）、6（マイクロ秒）、9（ナノ秒）が使用されます。
- `timezone` — 返される値用の[タイムゾーン名](../../operations/server-configuration-parameters/settings.md#timezone)（オプション）。[String](../data-types/string.md)。

**返される値**

- サブ秒精度での現在の日付と時間。[DateTime64](../data-types/datetime64.md)。

**例**

``` sql
SELECT now64(), now64(9, 'Asia/Istanbul');
```

結果:

``` text
┌─────────────────now64()─┬─────now64(9, 'Asia/Istanbul')─┐
│ 2022-08-21 19:34:26.196 │ 2022-08-21 22:34:26.196542766 │
└─────────────────────────┴───────────────────────────────┘
```
## nowInBlock {#nowInBlock}

各データブロック処理の瞬間における現在の日付と時間を返します。[now](#now)関数とは異なり、定数式ではなく、長時間実行されるクエリの異なるブロックで返される値が異なる場合があります。

長時間実行されるINSERT SELECTクエリで現在の時刻を生成するためにこの関数を使用する意義があります。

**構文**

``` sql
nowInBlock([timezone])
```

**引数**

- `timezone` — 返される値用の[タイムゾーン名](../../operations/server-configuration-parameters/settings.md#timezone)（オプション）。[String](../data-types/string.md)。

**返される値**

- 各データブロック処理の瞬間における現在の日付と時間。[DateTime](../data-types/datetime.md)。

**例**

``` sql
SELECT
    now(),
    nowInBlock(),
    sleep(1)
FROM numbers(3)
SETTINGS max_block_size = 1
FORMAT PrettyCompactMonoBlock
```

結果:

``` text
┌───────────────now()─┬────────nowInBlock()─┬─sleep(1)─┐
│ 2022-08-21 19:41:19 │ 2022-08-21 19:41:19 │        0 │
│ 2022-08-21 19:41:19 │ 2022-08-21 19:41:20 │        0 │
│ 2022-08-21 19:41:19 │ 2022-08-21 19:41:21 │        0 │
└─────────────────────┴─────────────────────┴──────────┘
```
## today {#today}

クエリ分析の瞬間における現在の日付を返します。これは`toDate(now())`と同じで、エイリアスには`curdate`、`current_date`があります。

**構文**

```sql
today()
```

**引数**

- なし

**返される値**

- 現在の日付。[DateTime](../data-types/datetime.md)。

**例**

クエリ:

```sql
SELECT today() AS today, curdate() AS curdate, current_date() AS current_date FORMAT Pretty
```

**結果**:

2024年3月3日に上記のクエリを実行すると、次のレスポンスが返されます:

```response
┏━━━━━━━━━━━━┳━━━━━━━━━━━━┳━━━━━━━━━━━━━━┓
┃      today ┃    curdate ┃ current_date ┃
┡━━━━━━━━━━━━╇━━━━━━━━━━━━╇━━━━━━━━━━━━━━┩
│ 2024-03-03 │ 2024-03-03 │   2024-03-03 │
└────────────┴────────────┴──────────────┘
```
## yesterday {#yesterday}

引数を受け取らず、クエリ分析の瞬間に昨日の日付を返します。これは`today() - 1`と同じです。
## timeSlot {#timeslot}

時間を30分間隔の開始時刻に丸めます。

**構文**

```sql
timeSlot(time[, time_zone])
```

**引数**

- `time` — 30分間隔の開始時刻に丸める時間。[DateTime](../data-types/datetime.md)/[Date32](../data-types/date32.md)/[DateTime64](../data-types/datetime64.md)。
- `time_zone` — タイムゾーンを示す文字列型の定数値または式。[String](../data-types/string.md)。

:::note
この関数は拡張型 `Date32` と `DateTime64` の値を引数として受け取ることができますが、通常の範囲（`Date`は1970年から2149年、`DateTime`は2106年まで）外の時間を渡すと、誤った結果が生成されます。
:::

**返す型**

- 30分間隔の開始時刻に丸められた時間を返します。[DateTime](../data-types/datetime.md)。

**例**

クエリ:

```sql
SELECT timeSlot(toDateTime('2000-01-02 03:04:05', 'UTC'));
```

結果:

```response
┌─timeSlot(toDateTime('2000-01-02 03:04:05', 'UTC'))─┐
│                                2000-01-02 03:00:00 │
└────────────────────────────────────────────────────┘
```
## toYYYYMM {#toyyyymm}

日付または日付と時間を、年と月の番号（YYYY * 100 + MM）を含むUInt32番号に変換します。2番目のオプションのタイムゾーン引数を受け取ります。提供される場合、タイムゾーンは文字列定数である必要があります。

この関数は関数`YYYYMMDDToDate()`の逆です。

**例**

``` sql
SELECT
    toYYYYMM(now(), 'US/Eastern')
```

結果:

``` text
┌─toYYYYMM(now(), 'US/Eastern')─┐
│                        202303 │
└───────────────────────────────┘
```
## toYYYYMMDD {#toyyyymmdd}

日付または日付と時間を、年、月、日の番号（YYYY * 10000 + MM * 100 + DD）を含むUInt32番号に変換します。2番目のオプションのタイムゾーン引数を受け取ります。提供される場合、タイムゾーンは文字列定数である必要があります。

**例**

```sql
SELECT toYYYYMMDD(now(), 'US/Eastern')
```

結果:

```response
┌─toYYYYMMDD(now(), 'US/Eastern')─┐
│                        20230302 │
└─────────────────────────────────┘
```
## toYYYYMMDDhhmmss {#toyyyymmddhhmmss}

日付または日付と時間を、年、月、日、時間、分、秒の番号（YYYY * 10000000000 + MM * 100000000 + DD * 1000000 + hh * 10000 + mm * 100 + ss）を含むUInt64番号に変換します。2番目のオプションのタイムゾーン引数を受け取ります。提供される場合、タイムゾーンは文字列定数である必要があります。

**例**

```sql
SELECT toYYYYMMDDhhmmss(now(), 'US/Eastern')
```

結果:

```response
┌─toYYYYMMDDhhmmss(now(), 'US/Eastern')─┐
│                        20230302112209 │
└───────────────────────────────────────┘
```
## YYYYMMDDToDate {#yyyymmddtodate}

年、月、日を含む番号を[Date](../data-types/date.md)に変換します。

この関数は関数`toYYYYMMDD()`の逆です。

入力が有効なDate値をエンコードしていない場合、出力は未定義です。

**構文**

```sql
YYYYMMDDToDate(yyyymmdd);
```

**引数**

- `yyyymmdd` - 年、月、日を表す番号。[Integer](../data-types/int-uint.md)、[Float](../data-types/float.md)または[Decimal](../data-types/decimal.md)。

**返される値**

- 引数から作成された日付。[Date](../data-types/date.md)。

**例**

```sql
SELECT YYYYMMDDToDate(20230911);
```

結果:

```response
┌─toYYYYMMDD(20230911)─┐
│           2023-09-11 │
└──────────────────────┘
```
## YYYYMMDDToDate32 {#yyyymmddtodate32}

関数`YYYYMMDDToDate()`に似ていますが、[Date32](../data-types/date32.md)を生成します。
## YYYYMMDDhhmmssToDateTime {#yyyymmddhhmmsstodatetime}

年、月、日、時、分、秒の番号を[DateTime](../data-types/datetime.md)に変換します。

入力が有効なDateTime値をエンコードしていない場合、出力は未定義です。

この関数は関数`toYYYYMMDDhhmmss()`の逆です。

**構文**

```sql
YYYYMMDDhhmmssToDateTime(yyyymmddhhmmss[, timezone]);
```

**引数**

- `yyyymmddhhmmss` - 年、月、日を含む番号。[Integer](../data-types/int-uint.md)、[Float](../data-types/float.md)または[Decimal](../data-types/decimal.md)。
- `timezone` - 返される値用の[タイムゾーン](../../operations/server-configuration-parameters/settings.md#timezone)（オプション）。

**返される値**

- 引数から作成された日付と時間。[DateTime](../data-types/datetime.md)。

**例**

```sql
SELECT YYYYMMDDToDateTime(20230911131415);
```

結果:

```response
┌──────YYYYMMDDhhmmssToDateTime(20230911131415)─┐
│                           2023-09-11 13:14:15 │
└───────────────────────────────────────────────┘
```
## YYYYMMDDhhmmssToDateTime64 {#yyyymmddhhmmsstodatetime64}

関数`YYYYMMDDhhmmssToDate()`に似ていますが、[DateTime64](../data-types/datetime64.md)を生成します。

`timezone`パラメータの後にオプションの`precision`パラメータを追加で受け取ります。
## changeYear {#changeyear}

日付または日時の年のコンポーネントを変更します。

**構文**
``` sql

changeYear(date_or_datetime, value)
```

**引数**

- `date_or_datetime` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)
- `value` - 年の新しい値。[Integer](../../sql-reference/data-types/int-uint.md)。

**返される値**

- `date_or_datetime`と同じ型。

**例**

``` sql
SELECT changeYear(toDate('1999-01-01'), 2000), changeYear(toDateTime64('1999-01-01 00:00:00.000', 3), 2000);
```

結果:

```sql
┌─changeYear(toDate('1999-01-01'), 2000)─┬─changeYear(toDateTime64('1999-01-01 00:00:00.000', 3), 2000)─┐
│                             2000-01-01 │                                      2000-01-01 00:00:00.000 │
└────────────────────────────────────────┴──────────────────────────────────────────────────────────────┘
```
## changeMonth {#changemonth}

日付または日時の月のコンポーネントを変更します。

**構文**

``` sql
changeMonth(date_or_datetime, value)
```

**引数**

- `date_or_datetime` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)
- `value` - 月の新しい値。[Integer](../../sql-reference/data-types/int-uint.md)。

**返される値**

- `date_or_datetime`と同じ型の値を返します。

**例**

``` sql
SELECT changeMonth(toDate('1999-01-01'), 2), changeMonth(toDateTime64('1999-01-01 00:00:00.000', 3), 2);
```

結果:

```sql
┌─changeMonth(toDate('1999-01-01'), 2)─┬─changeMonth(toDateTime64('1999-01-01 00:00:00.000', 3), 2)─┐
│                           1999-02-01 │                                    1999-02-01 00:00:00.000 │
└──────────────────────────────────────┴────────────────────────────────────────────────────────────┘
```
## changeDay {#changeday}

日付または日時の日のコンポーネントを変更します。

**構文**

``` sql
changeDay(date_or_datetime, value)
```

**引数**

- `date_or_datetime` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)
- `value` - 日の新しい値。[Integer](../../sql-reference/data-types/int-uint.md)。

**返される値**

- `date_or_datetime`と同じ型の値を返します。

**例**

``` sql
SELECT changeDay(toDate('1999-01-01'), 5), changeDay(toDateTime64('1999-01-01 00:00:00.000', 3), 5);
```

結果:

```sql
┌─changeDay(toDate('1999-01-01'), 5)─┬─changeDay(toDateTime64('1999-01-01 00:00:00.000', 3), 5)─┐
│                         1999-01-05 │                                  1999-01-05 00:00:00.000 │
└────────────────────────────────────┴──────────────────────────────────────────────────────────┘
```
## changeHour {#changehour}

日付または日時の時間コンポーネントを変更します。

**構文**

``` sql
changeHour(date_or_datetime, value)
```

**引数**

- `date_or_datetime` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)
- `value` - 新しい時間の値。 [Integer](../../sql-reference/data-types/int-uint.md)。

**返される値**

- `date_or_datetime` と同じ型の値を返します。入力が [Date](../data-types/date.md) の場合、[DateTime](../data-types/datetime.md) を返します。入力が [Date32](../data-types/date32.md) の場合、[DateTime64](../data-types/datetime64.md) を返します。

**例**

``` sql
SELECT changeHour(toDate('1999-01-01'), 14), changeHour(toDateTime64('1999-01-01 00:00:00.000', 3), 14);
```

結果:

```sql
┌─changeHour(toDate('1999-01-01'), 14)─┬─changeHour(toDateTime64('1999-01-01 00:00:00.000', 3), 14)─┐
│                  1999-01-01 14:00:00 │                                    1999-01-01 14:00:00.000 │
└──────────────────────────────────────┴────────────────────────────────────────────────────────────┘
```

## changeMinute {#changeminute}

日付または日時の分コンポーネントを変更します。

**構文**

``` sql
changeMinute(date_or_datetime, value)
```

**引数**

- `date_or_datetime` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)
- `value` - 新しい分の値。 [Integer](../../sql-reference/data-types/int-uint.md)。

**返される値**

- `date_or_datetime` と同じ型の値を返します。入力が [Date](../data-types/date.md) の場合、[DateTime](../data-types/datetime.md) を返します。入力が [Date32](../data-types/date32.md) の場合、[DateTime64](../data-types/datetime64.md) を返します。

**例**

``` sql
    SELECT changeMinute(toDate('1999-01-01'), 15), changeMinute(toDateTime64('1999-01-01 00:00:00.000', 3), 15);
```

結果:

```sql
┌─changeMinute(toDate('1999-01-01'), 15)─┬─changeMinute(toDateTime64('1999-01-01 00:00:00.000', 3), 15)─┐
│                    1999-01-01 00:15:00 │                                      1999-01-01 00:15:00.000 │
└────────────────────────────────────────┴──────────────────────────────────────────────────────────────┘
```

## changeSecond {#changesecond}

日付または日時の秒コンポーネントを変更します。

**構文**

``` sql
changeSecond(date_or_datetime, value)
```

**引数**

- `date_or_datetime` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)
- `value` - 新しい秒の値。 [Integer](../../sql-reference/data-types/int-uint.md)。

**返される値**

- `date_or_datetime` と同じ型の値を返します。入力が [Date](../data-types/date.md) の場合、[DateTime](../data-types/datetime.md) を返します。入力が [Date32](../data-types/date32.md) の場合、[DateTime64](../data-types/datetime64.md) を返します。

**例**

``` sql
SELECT changeSecond(toDate('1999-01-01'), 15), changeSecond(toDateTime64('1999-01-01 00:00:00.000', 3), 15);
```

結果:

```sql
┌─changeSecond(toDate('1999-01-01'), 15)─┬─changeSecond(toDateTime64('1999-01-01 00:00:00.000', 3), 15)─┐
│                    1999-01-01 00:00:15 │                                      1999-01-01 00:00:15.000 │
└────────────────────────────────────────┴──────────────────────────────────────────────────────────────┘
```

## addYears {#addyears}

指定された年数を日付、日時、または文字列形式の日付 / 日時に追加します。

**構文**

```sql
addYears(date, num)
```

**パラメータ**

- `date`: 年数を追加する日付 / 日時。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 追加する年数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**返される値**

- `date` に `num` 年を追加します。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**例**

```sql
WITH
    toDate('2024-01-01') AS date,
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    addYears(date, 1) AS add_years_with_date,
    addYears(date_time, 1) AS add_years_with_date_time,
    addYears(date_time_string, 1) AS add_years_with_date_time_string
```

```response
┌─add_years_with_date─┬─add_years_with_date_time─┬─add_years_with_date_time_string─┐
│          2025-01-01 │      2025-01-01 00:00:00 │         2025-01-01 00:00:00.000 │
└─────────────────────┴──────────────────────────┴─────────────────────────────────┘
```

## addQuarters {#addquarters}

指定された四半期数を日付、日時、または文字列形式の日付 / 日時に追加します。

**構文**

```sql
addQuarters(date, num)
```

**パラメータ**

- `date`: 四半期数を追加する日付 / 日時。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 追加する四半期数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**返される値**

- `date` に `num` 四半期を追加します。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**例**

```sql
WITH
    toDate('2024-01-01') AS date,
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    addQuarters(date, 1) AS add_quarters_with_date,
    addQuarters(date_time, 1) AS add_quarters_with_date_time,
    addQuarters(date_time_string, 1) AS add_quarters_with_date_time_string
```

```response
┌─add_quarters_with_date─┬─add_quarters_with_date_time─┬─add_quarters_with_date_time_string─┐
│             2024-04-01 │         2024-04-01 00:00:00 │            2024-04-01 00:00:00.000 │
└────────────────────────┴─────────────────────────────┴────────────────────────────────────┘
```

## addMonths {#addmonths}

指定された月数を日付、日時、または文字列形式の日付 / 日時に追加します。

**構文**

```sql
addMonths(date, num)
```

**パラメータ**

- `date`: 月数を追加する日付 / 日時。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 追加する月数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**返される値**

- `date` に `num` 月を追加します。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**例**

```sql
WITH
    toDate('2024-01-01') AS date,
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    addMonths(date, 6) AS add_months_with_date,
    addMonths(date_time, 6) AS add_months_with_date_time,
    addMonths(date_time_string, 6) AS add_months_with_date_time_string
```

```response
┌─add_months_with_date─┬─add_months_with_date_time─┬─add_months_with_date_time_string─┐
│           2024-07-01 │       2024-07-01 00:00:00 │          2024-07-01 00:00:00.000 │
└──────────────────────┴───────────────────────────┴──────────────────────────────────┘
```

## addWeeks {#addweeks}

指定された週数を日付、日時、または文字列形式の日付 / 日時に追加します。

**構文**

```sql
addWeeks(date, num)
```

**パラメータ**

- `date`: 週数を追加する日付 / 日時。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 追加する週数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**返される値**

- `date` に `num` 週を追加します。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**例**

```sql
WITH
    toDate('2024-01-01') AS date,
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    addWeeks(date, 5) AS add_weeks_with_date,
    addWeeks(date_time, 5) AS add_weeks_with_date_time,
    addWeeks(date_time_string, 5) AS add_weeks_with_date_time_string
```

```response
┌─add_weeks_with_date─┬─add_weeks_with_date_time─┬─add_weeks_with_date_time_string─┐
│          2024-02-05 │      2024-02-05 00:00:00 │         2024-02-05 00:00:00.000 │
└─────────────────────┴──────────────────────────┴─────────────────────────────────┘
```

## addDays {#adddays}

指定された日数を日付、日時、または文字列形式の日付 / 日時に追加します。

**構文**

```sql
addDays(date, num)
```

**パラメータ**

- `date`: 日数を追加する日付 / 日時。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 追加する日数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**返される値**

- `date` に `num` 日を追加します。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**例**

```sql
WITH
    toDate('2024-01-01') AS date,
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    addDays(date, 5) AS add_days_with_date,
    addDays(date_time, 5) AS add_days_with_date_time,
    addDays(date_time_string, 5) AS add_days_with_date_time_string
```

```response
┌─add_days_with_date─┬─add_days_with_date_time─┬─add_days_with_date_time_string─┐
│         2024-01-06 │     2024-01-06 00:00:00 │        2024-01-06 00:00:00.000 │
└────────────────────┴─────────────────────────┴────────────────────────────────┘
```

## addHours {#addhours}

指定された時間数を日付、日時、または文字列形式の日付 / 日時に追加します。

**構文**

```sql
addHours(date, num)
```

**パラメータ**

- `date`: 時間数を追加する日付 / 日時。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 追加する時間数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**返される値**

- `date` に `num` 時間を追加します。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**例**

```sql
WITH
    toDate('2024-01-01') AS date,
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    addHours(date, 12) AS add_hours_with_date,
    addHours(date_time, 12) AS add_hours_with_date_time,
    addHours(date_time_string, 12) AS add_hours_with_date_time_string
```

```response
┌─add_hours_with_date─┬─add_hours_with_date_time─┬─add_hours_with_date_time_string─┐
│ 2024-01-01 12:00:00 │      2024-01-01 12:00:00 │         2024-01-01 12:00:00.000 │
└─────────────────────┴──────────────────────────┴─────────────────────────────────┘
```

## addMinutes {#addminutes}

指定された分数を日付、日時、または文字列形式の日付 / 日時に追加します。

**構文**

```sql
addMinutes(date, num)
```

**パラメータ**

- `date`: 分数を追加する日付 / 日時。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 追加する分数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**返される値**

- `date` に `num` 分を追加します。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**例**

```sql
WITH
    toDate('2024-01-01') AS date,
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    addMinutes(date, 20) AS add_minutes_with_date,
    addMinutes(date_time, 20) AS add_minutes_with_date_time,
    addMinutes(date_time_string, 20) AS add_minutes_with_date_time_string
```

```response
┌─add_minutes_with_date─┬─add_minutes_with_date_time─┬─add_minutes_with_date_time_string─┐
│   2024-01-01 00:20:00 │        2024-01-01 00:20:00 │           2024-01-01 00:20:00.000 │
└───────────────────────┴────────────────────────────┴───────────────────────────────────┘
```

## addSeconds {#addseconds}

指定された秒数を日付、日時、または文字列形式の日付 / 日時に追加します。

**構文**

```sql
addSeconds(date, num)
```

**パラメータ**

- `date`: 秒数を追加する日付 / 日時。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 追加する秒数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**返される値**

- `date` に `num` 秒を追加します。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**例**

```sql
WITH
    toDate('2024-01-01') AS date,
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    addSeconds(date, 30) AS add_seconds_with_date,
    addSeconds(date_time, 30) AS add_seconds_with_date_time,
    addSeconds(date_time_string, 30) AS add_seconds_with_date_time_string
```

```response
┌─add_seconds_with_date─┬─add_seconds_with_date_time─┬─add_seconds_with_date_time_string─┐
│   2024-01-01 00:00:30 │        2024-01-01 00:00:30 │           2024-01-01 00:00:30.000 │
└───────────────────────┴────────────────────────────┴───────────────────────────────────┘
```

## addMilliseconds {#addmilliseconds}

指定されたミリ秒数を日時または文字列形式の日時に追加します。

**構文**

```sql
addMilliseconds(date_time, num)
```

**パラメータ**

- `date_time`: ミリ秒を追加する日時。 [DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 追加するミリ秒数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**返される値**

- `date_time` に `num` ミリ秒を追加します。 [DateTime64](../data-types/datetime64.md)。

**例**

```sql
WITH
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    addMilliseconds(date_time, 1000) AS add_milliseconds_with_date_time,
    addMilliseconds(date_time_string, 1000) AS add_milliseconds_with_date_time_string
```

```response
┌─add_milliseconds_with_date_time─┬─add_milliseconds_with_date_time_string─┐
│         2024-01-01 00:00:01.000 │                2024-01-01 00:00:01.000 │
└─────────────────────────────────┴────────────────────────────────────────┘
```

## addMicroseconds {#addmicroseconds}

指定されたマイクロ秒数を日時または文字列形式の日時に追加します。

**構文**

```sql
addMicroseconds(date_time, num)
```

**パラメータ**

- `date_time`: マイクロ秒を追加する日時。 [DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 追加するマイクロ秒数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**返される値**

- `date_time` に `num` マイクロ秒を追加します。 [DateTime64](../data-types/datetime64.md)。

**例**

```sql
WITH
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    addMicroseconds(date_time, 1000000) AS add_microseconds_with_date_time,
    addMicroseconds(date_time_string, 1000000) AS add_microseconds_with_date_time_string
```

```response
┌─add_microseconds_with_date_time─┬─add_microseconds_with_date_time_string─┐
│      2024-01-01 00:00:01.000000 │             2024-01-01 00:00:01.000000 │
└─────────────────────────────────┴────────────────────────────────────────┘
```

## addNanoseconds {#addnanoseconds}

指定されたナノ秒数を日時または文字列形式の日時に追加します。

**構文**

```sql
addNanoseconds(date_time, num)
```

**パラメータ**

- `date_time`: ナノ秒を追加する日時。 [DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 追加するナノ秒数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**返される値**

- `date_time` に `num` ナノ秒を追加します。 [DateTime64](../data-types/datetime64.md)。

**例**

```sql
WITH
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    addNanoseconds(date_time, 1000) AS add_nanoseconds_with_date_time,
    addNanoseconds(date_time_string, 1000) AS add_nanoseconds_with_date_time_string
```

```response
┌─add_nanoseconds_with_date_time─┬─add_nanoseconds_with_date_time_string─┐
│  2024-01-01 00:00:00.000001000 │         2024-01-01 00:00:00.000001000 │
└────────────────────────────────┴───────────────────────────────────────┘
```

## addInterval {#addinterval}

別のインターバルまたはインターバルのタプルを追加します。

**構文**

```sql
addInterval(interval_1, interval_2)
```

**パラメータ**

- `interval_1`: 最初のインターバルまたはインターバルのタプル。 [interval](../data-types/special-data-types/interval.md)、[tuple](../data-types/tuple.md)([interval](../data-types/special-data-types/interval.md))。
- `interval_2`: 追加される2つ目のインターバル。 [interval](../data-types/special-data-types/interval.md)。

**返される値**

- インターバルのタプルを返します。 [tuple](../data-types/tuple.md)([interval](../data-types/special-data-types/interval.md))。

:::note
同じタイプのインターバルは単一のインターバルにまとめられます。たとえば、 `toIntervalDay(1)` と `toIntervalDay(2)` が渡されると、結果は `(3)` になります。
:::

**例**

クエリ:

```sql
SELECT addInterval(INTERVAL 1 DAY, INTERVAL 1 MONTH);
SELECT addInterval((INTERVAL 1 DAY, INTERVAL 1 YEAR), INTERVAL 1 MONTH);
SELECT addInterval(INTERVAL 2 DAY, INTERVAL 1 DAY);
```

結果:

```response
┌─addInterval(toIntervalDay(1), toIntervalMonth(1))─┐
│ (1,1)                                             │
└───────────────────────────────────────────────────┘
┌─addInterval((toIntervalDay(1), toIntervalYear(1)), toIntervalMonth(1))─┐
│ (1,1,1)                                                                │
└────────────────────────────────────────────────────────────────────────┘
┌─addInterval(toIntervalDay(2), toIntervalDay(1))─┐
│ (3)                                             │
└─────────────────────────────────────────────────┘
```

## addTupleOfIntervals {#addtupleofintervals}

日付または日時にインターバルのタプルを順に追加します。

**構文**

```sql
addTupleOfIntervals(interval_1, interval_2)
```

**パラメータ**

- `date`: 最初のインターバルまたはインターバルのタプル。 [date](../data-types/date.md)/[date32](../data-types/date32.md)/[datetime](../data-types/datetime.md)/[datetime64](../data-types/datetime64.md)。
- `intervals`: `date` に追加するインターバルのタプル。 [tuple](../data-types/tuple.md)([interval](../data-types/special-data-types/interval.md))。

**返される値**

- `intervals` を追加した `date` を返します。 [date](../data-types/date.md)/[date32](../data-types/date32.md)/[datetime](../data-types/datetime.md)/[datetime64](../data-types/datetime64.md)。

**例**

クエリ:

```sql
WITH toDate('2018-01-01') AS date
SELECT addTupleOfIntervals(date, (INTERVAL 1 DAY, INTERVAL 1 MONTH, INTERVAL 1 YEAR))
```

結果:

```response
┌─addTupleOfIntervals(date, (toIntervalDay(1), toIntervalMonth(1), toIntervalYear(1)))─┐
│                                                                           2019-02-02 │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

## subtractYears {#subtractyears}

指定された年数を日付、日時、または文字列形式の日付 / 日時から減算します。

**構文**

```sql
subtractYears(date, num)
```

**パラメータ**

- `date`: 年数を減算する日付 / 日時。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 減算する年数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**返される値**

- `date` から `num` 年を減算します。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**例**

```sql
WITH
    toDate('2024-01-01') AS date,
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    subtractYears(date, 1) AS subtract_years_with_date,
    subtractYears(date_time, 1) AS subtract_years_with_date_time,
    subtractYears(date_time_string, 1) AS subtract_years_with_date_time_string
```

```response
┌─subtract_years_with_date─┬─subtract_years_with_date_time─┬─subtract_years_with_date_time_string─┐
│               2023-01-01 │           2023-01-01 00:00:00 │              2023-01-01 00:00:00.000 │
└──────────────────────────┴───────────────────────────────┴──────────────────────────────────────┘
```

## subtractQuarters {#subtractquarters}

指定された四半期数を日付、日時、または文字列形式の日付 / 日時から減算します。

**構文**

```sql
subtractQuarters(date, num)
```

**パラメータ**

- `date`: 四半期数を減算する日付 / 日時。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 減算する四半期数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**返される値**

- `date` から `num` 四半期を減算します。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**例**

```sql
WITH
    toDate('2024-01-01') AS date,
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    subtractQuarters(date, 1) AS subtract_quarters_with_date,
    subtractQuarters(date_time, 1) AS subtract_quarters_with_date_time,
    subtractQuarters(date_time_string, 1) AS subtract_quarters_with_date_time_string
```

```response
┌─subtract_quarters_with_date─┬─subtract_quarters_with_date_time─┬─subtract_quarters_with_date_time_string─┐
│                  2023-10-01 │              2023-10-01 00:00:00 │                 2023-10-01 00:00:00.000 │
└─────────────────────────────┴──────────────────────────────────┴─────────────────────────────────────────┘
```

## subtractMonths {#subtractmonths}

指定された月数を日付、日時、または文字列形式の日付 / 日時から減算します。

**構文**

```sql
subtractMonths(date, num)
```

**パラメータ**

- `date`: 月数を減算する日付 / 日時。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 減算する月数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**返される値**

- `date` から `num` 月を減算します。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**例**

```sql
WITH
    toDate('2024-01-01') AS date,
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    subtractMonths(date, 1) AS subtract_months_with_date,
    subtractMonths(date_time, 1) AS subtract_months_with_date_time,
    subtractMonths(date_time_string, 1) AS subtract_months_with_date_time_string
```

```response
┌─subtract_months_with_date─┬─subtract_months_with_date_time─┬─subtract_months_with_date_time_string─┐
│                2023-12-01 │            2023-12-01 00:00:00 │               2023-12-01 00:00:00.000 │
└───────────────────────────┴────────────────────────────────┴───────────────────────────────────────┘
```

## subtractWeeks {#subtractweeks}

指定された週数を日付、日時、または文字列形式の日付 / 日時から減算します。

**構文**

```sql
subtractWeeks(date, num)
```

**パラメータ**

- `date`: 週数を減算する日付 / 日時。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 減算する週数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**返される値**

- `date` から `num` 週を減算します。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**例**

```sql
WITH
    toDate('2024-01-01') AS date,
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    subtractWeeks(date, 1) AS subtract_weeks_with_date,
    subtractWeeks(date_time, 1) AS subtract_weeks_with_date_time,
    subtractWeeks(date_time_string, 1) AS subtract_weeks_with_date_time_string
```

```response
 ┌─subtract_weeks_with_date─┬─subtract_weeks_with_date_time─┬─subtract_weeks_with_date_time_string─┐
 │               2023-12-25 │           2023-12-25 00:00:00 │              2023-12-25 00:00:00.000 │
 └──────────────────────────┴───────────────────────────────┴──────────────────────────────────────┘
```

## subtractDays {#subtractdays}

指定された日数を日付、日時、または文字列形式の日付 / 日時から減算します。

**構文**

```sql
subtractDays(date, num)
```

**パラメータ**

- `date`: 日数を減算する日付 / 日時。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 減算する日数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**返される値**

- `date` から `num` 日を減算します。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**例**

```sql
WITH
    toDate('2024-01-01') AS date,
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    subtractDays(date, 31) AS subtract_days_with_date,
    subtractDays(date_time, 31) AS subtract_days_with_date_time,
    subtractDays(date_time_string, 31) AS subtract_days_with_date_time_string
```

```response
┌─subtract_days_with_date─┬─subtract_days_with_date_time─┬─subtract_days_with_date_time_string─┐
│              2023-12-01 │          2023-12-01 00:00:00 │             2023-12-01 00:00:00.000 │
└─────────────────────────┴──────────────────────────────┴─────────────────────────────────────┘
```

## subtractHours {#subtracthours}

指定された時間数を日付、日時、または文字列形式の日付 / 日時から減算します。

**構文**

```sql
subtractHours(date, num)
```

**パラメータ**

- `date`: 時間数を減算する日付 / 日時。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[Datetime](../data-types/datetime.md)/[Datetime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 減算する時間数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**返される値**

- `date` から `num` 時間を減算します。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[Datetime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**例**

```sql
WITH
    toDate('2024-01-01') AS date,
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    subtractHours(date, 12) AS subtract_hours_with_date,
    subtractHours(date_time, 12) AS subtract_hours_with_date_time,
    subtractHours(date_time_string, 12) AS subtract_hours_with_date_time_string
```

```response
┌─subtract_hours_with_date─┬─subtract_hours_with_date_time─┬─subtract_hours_with_date_time_string─┐
│      2023-12-31 12:00:00 │           2023-12-31 12:00:00 │              2023-12-31 12:00:00.000 │
└──────────────────────────┴───────────────────────────────┴──────────────────────────────────────┘
```
## subtractMinutes {#subtractminutes}

指定された分数を日付、時刻付きの日付、または文字列形式の日時から引きます。

**構文**

```sql
subtractMinutes(date, num)
```

**パラメータ**

- `date`: 引く分数を指定する日付または時刻付きの日付。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md), [String](../data-types/string.md)。
- `num`: 引く分数。[(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md)。

**返される値**

- `date` から `num` 分を引いた結果を返します。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**例**

```sql
WITH
    toDate('2024-01-01') AS date,
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    subtractMinutes(date, 30) AS subtract_minutes_with_date,
    subtractMinutes(date_time, 30) AS subtract_minutes_with_date_time,
    subtractMinutes(date_time_string, 30) AS subtract_minutes_with_date_time_string
```

```response
┌─subtract_minutes_with_date─┬─subtract_minutes_with_date_time─┬─subtract_minutes_with_date_time_string─┐
│        2023-12-31 23:30:00 │             2023-12-31 23:30:00 │                2023-12-31 23:30:00.000 │
└────────────────────────────┴─────────────────────────────────┴────────────────────────────────────────┘
```
## subtractSeconds {#subtractseconds}

指定された秒数を日付、時刻付きの日付、または文字列形式の日時から引きます。

**構文**

```sql
subtractSeconds(date, num)
```

**パラメータ**

- `date`: 引く秒数を指定する日付または時刻付きの日付。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md), [String](../data-types/string.md)。
- `num`: 引く秒数。[(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md)。

**返される値**

- `date` から `num` 秒を引いた結果を返します。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**例**

```sql
WITH
    toDate('2024-01-01') AS date,
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    subtractSeconds(date, 60) AS subtract_seconds_with_date,
    subtractSeconds(date_time, 60) AS subtract_seconds_with_date_time,
    subtractSeconds(date_time_string, 60) AS subtract_seconds_with_date_time_string
```

```response
┌─subtract_seconds_with_date─┬─subtract_seconds_with_date_time─┬─subtract_seconds_with_date_time_string─┐
│        2023-12-31 23:59:00 │             2023-12-31 23:59:00 │                2023-12-31 23:59:00.000 │
└────────────────────────────┴─────────────────────────────────┴────────────────────────────────────────┘
```
## subtractMilliseconds {#subtractmilliseconds}

指定されたミリ秒を時刻付きの日付または文字列形式の時刻付き日付から引きます。

**構文**

```sql
subtractMilliseconds(date_time, num)
```

**パラメータ**

- `date_time`: 引くミリ秒を指定する時刻付きの日付。 [DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md), [String](../data-types/string.md)。
- `num`: 引くミリ秒。[(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md)。

**返される値**

- `date_time` から `num` ミリ秒を引いた結果を返します。 [DateTime64](../data-types/datetime64.md)。

**例**

```sql
WITH
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    subtractMilliseconds(date_time, 1000) AS subtract_milliseconds_with_date_time,
    subtractMilliseconds(date_time_string, 1000) AS subtract_milliseconds_with_date_time_string
```

```response
┌─subtract_milliseconds_with_date_time─┬─subtract_milliseconds_with_date_time_string─┐
│              2023-12-31 23:59:59.000 │                     2023-12-31 23:59:59.000 │
└──────────────────────────────────────┴─────────────────────────────────────────────┘
```
## subtractMicroseconds {#subtractmicroseconds}

指定されたマイクロ秒を時刻付きの日付または文字列形式の時刻付き日付から引きます。

**構文**

```sql
subtractMicroseconds(date_time, num)
```

**パラメータ**

- `date_time`: 引くマイクロ秒を指定する時刻付きの日付。 [DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md), [String](../data-types/string.md)。
- `num`: 引くマイクロ秒。[(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md)。

**返される値**

- `date_time` から `num` マイクロ秒を引いた結果を返します。 [DateTime64](../data-types/datetime64.md)。

**例**

```sql
WITH
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    subtractMicroseconds(date_time, 1000000) AS subtract_microseconds_with_date_time,
    subtractMicroseconds(date_time_string, 1000000) AS subtract_microseconds_with_date_time_string
```

```response
┌─subtract_microseconds_with_date_time─┬─subtract_microseconds_with_date_time_string─┐
│           2023-12-31 23:59:59.000000 │                  2023-12-31 23:59:59.000000 │
└──────────────────────────────────────┴─────────────────────────────────────────────┘
```
## subtractNanoseconds {#subtractnanoseconds}

指定されたナノ秒を時刻付きの日付または文字列形式の時刻付き日付から引きます。

**構文**

```sql
subtractNanoseconds(date_time, num)
```

**パラメータ**

- `date_time`: 引くナノ秒を指定する時刻付きの日付。 [DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md), [String](../data-types/string.md)。
- `num`: 引くナノ秒。[(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md)。

**返される値**

- `date_time` から `num` ナノ秒を引いた結果を返します。 [DateTime64](../data-types/datetime64.md)。

**例**

```sql
WITH
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    subtractNanoseconds(date_time, 1000) AS subtract_nanoseconds_with_date_time,
    subtractNanoseconds(date_time_string, 1000) AS subtract_nanoseconds_with_date_time_string
```

```response
┌─subtract_nanoseconds_with_date_time─┬─subtract_nanoseconds_with_date_time_string─┐
│       2023-12-31 23:59:59.999999000 │              2023-12-31 23:59:59.999999000 │
└─────────────────────────────────────┴────────────────────────────────────────────┘
```
## subtractInterval {#subtractinterval}

間隔を別の間隔またはタプルの間隔に引き算します。

**構文**

```sql
subtractInterval(interval_1, interval_2)
```

**パラメータ**

- `interval_1`: 最初の間隔または間隔のタプル。 [interval](../data-types/special-data-types/interval.md), [tuple](../data-types/tuple.md)([interval](../data-types/special-data-types/interval.md))。
- `interval_2`: 反転される第2の間隔。 [interval](../data-types/special-data-types/interval.md)。

**返される値**

- タプルの間隔を返します。 [tuple](../data-types/tuple.md)([interval](../data-types/special-data-types/interval.md))。

:::note
同じ型の間隔は1つの間隔にまとめられます。たとえば、`toIntervalDay(2)` と `toIntervalDay(1)` を渡すと、結果は `(1)` になります。
:::

**例**

クエリ:

```sql
SELECT subtractInterval(INTERVAL 1 DAY, INTERVAL 1 MONTH);
SELECT subtractInterval((INTERVAL 1 DAY, INTERVAL 1 YEAR), INTERVAL 1 MONTH);
SELECT subtractInterval(INTERVAL 2 DAY, INTERVAL 1 DAY);
```

結果:

```response
┌─subtractInterval(toIntervalDay(1), toIntervalMonth(1))─┐
│ (1,-1)                                                 │
└────────────────────────────────────────────────────────┘
┌─subtractInterval((toIntervalDay(1), toIntervalYear(1)), toIntervalMonth(1))─┐
│ (1,1,-1)                                                                    │
└─────────────────────────────────────────────────────────────────────────────┘
┌─subtractInterval(toIntervalDay(2), toIntervalDay(1))─┐
│ (1)                                                  │
└──────────────────────────────────────────────────────┘
```
## subtractTupleOfIntervals {#subtracttupleofintervals}

日付または DateTime からタプルの間隔を連続的に引きます。

**構文**

```sql
subtractTupleOfIntervals(interval_1, interval_2)
```

**パラメータ**

- `date`: 最初の間隔または間隔のタプル。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。
- `intervals`: `date` から引く間隔のタプル。 [tuple](../data-types/tuple.md)([interval](../data-types/special-data-types/interval.md))。

**返される値**

- 引かれた `intervals` を持つ `date` を返します。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**例**

クエリ:

```sql
WITH toDate('2018-01-01') AS date SELECT subtractTupleOfIntervals(date, (INTERVAL 1 DAY, INTERVAL 1 YEAR))
```

結果:

```response
┌─subtractTupleOfIntervals(date, (toIntervalDay(1), toIntervalYear(1)))─┐
│                                                            2016-12-31 │
└───────────────────────────────────────────────────────────────────────┘
```
## timeSlots {#timeslots}

'StartTime' から始まり 'Duration' 秒間続く時間間隔のために、'Size' 秒単位で丸められたこの間隔のポイントからなる時間の瞬間の配列を返します。 'Size' はオプションのパラメータで、デフォルトでは 1800（30 分）に設定されています。これは、対応するセッション内のページビューを検索する際などに必要です。 'StartTime' 引数には DateTime と DateTime64 を受け付けます。 DateTime の場合、'Duration' と 'Size' 引数は `UInt32` でなければなりません。 'DateTime64' の場合は `Decimal64` でなければなりません。DateTime/DateTime64 の配列を返します（返り値の型は 'StartTime' の型に一致します）。DateTime64 の場合、返される値のスケールは 'StartTime' のスケールとは異なる場合があります --- 与えられたすべての引数の中で最も高いスケールが取られます。

**構文**

```sql
timeSlots(StartTime, Duration,\[, Size\])
```

**例**

```sql
SELECT timeSlots(toDateTime('2012-01-01 12:20:00'), toUInt32(600));
SELECT timeSlots(toDateTime('1980-12-12 21:01:02', 'UTC'), toUInt32(600), 299);
SELECT timeSlots(toDateTime64('1980-12-12 21:01:02.1234', 4, 'UTC'), toDecimal64(600.1, 1), toDecimal64(299, 0));
```

結果:

``` text
┌─timeSlots(toDateTime('2012-01-01 12:20:00'), toUInt32(600))─┐
│ ['2012-01-01 12:00:00','2012-01-01 12:30:00']               │
└─────────────────────────────────────────────────────────────┘
┌─timeSlots(toDateTime('1980-12-12 21:01:02', 'UTC'), toUInt32(600), 299)─┐
│ ['1980-12-12 20:56:13','1980-12-12 21:01:12','1980-12-12 21:06:11']     │
└─────────────────────────────────────────────────────────────────────────┘
┌─timeSlots(toDateTime64('1980-12-12 21:01:02.1234', 4, 'UTC'), toDecimal64(600.1, 1), toDecimal64(299, 0))─┐
│ ['1980-12-12 20:56:13.0000','1980-12-12 21:01:12.0000','1980-12-12 21:06:11.0000']                        │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```
## formatDateTime {#formatdatetime}

指定されたフォーマット文字列に従って時間をフォーマットします。フォーマットは定数式なので、単一の結果列に対して複数のフォーマットを持つことはできません。

formatDateTime は MySQL の日時フォーマットスタイルを使用します。詳細は [MySQL ドキュメント](https://dev.mysql.com/doc/refman/8.0/en/date-and-time-functions.html#function_date-format) を参照してください。

この関数の逆の操作は[parseDateTime](../functions/type-conversion-functions.md#type_conversion_functions-parseDateTime)です。

エイリアス: `DATE_FORMAT`.

**構文**

``` sql
formatDateTime(Time, Format[, Timezone])
```

**返される値**

構文されたフォーマットに従って、時間と日付の値を返します。

**置換フィールド**

置換フィールドを使用することで、結果の文字列のパターンを定義できます。"Example" 列は `2018-01-02 22:33:44` に対するフォーマット結果を示します。

| プレースホルダー | 説明                                                                                                                                                                           | 例       |
|------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------|
| %a               | 短縮された曜日の名前 (月曜日-日曜日)                                                                                                                                       | Mon       |
| %b               | 短縮された月の名前 (1月-12月)                                                                                                                                             | Jan       |
| %c               | 整数値としての月 (01-12)                                                                                                                                                   | 01        |
| %C               | 100 で割られ、整数に切り捨てられた年 (00-99)                                                                                                                                | 20        |
| %d               | ゼロパディングされた月の日 (01-31)                                                                                                                                       | 02        |
| %D               | 短い MM/DD/YY 日付、%m/%d/%y に相当                                                                                                                                       | 01/02/18  |
| %e               | スペースパディングされた月の日 (1-31)                                                                                                                                   | &nbsp; 2  |
| %f               | 小数秒、下記の「注 1」と「注 2」を参照                                                                                                                                   | 123456    |
| %F               | 短い YYYY-MM-DD 日付、%Y-%m-%d に相当                                                                                                                                     | 2018-01-02 |
| %g               | 2 桁の年形式、ISO 8601 に沿った補正済み、4 桁の表記から略された                                                                                                            | 18        |
| %G               | ISO 週番号用の 4 桁の年形式、週に基づく年 [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601#Week_dates) の基準によって計算され、通常は %V と共に有用                                   | 2018      |
| %h               | 12 時間形式の時間 (01-12)                                                                                                                                               | 09        |
| %H               | 24 時間形式の時間 (00-23)                                                                                                                                               | 22        |
| %i               | 分 (00-59)                                                                                                                                                                | 33        |
| %I               | 12 時間形式の時間 (01-12)                                                                                                                                               | 10        |
| %j               | 年の中の日 (001-366)                                                                                                                                                      | 002       |
| %k               | 24 時間形式の時間 (00-23)、下記の「注 4」を参照                                                                                                                               | 14        |
| %l               | 12 時間形式の時間 (01-12)、下記の「注 4」を参照                                                                                                                               | 09        |
| %m               | 整数としての月 (01-12)                                                                                                                                                   | 01        |
| %M               | 月の完全名 (1 月-12 月)、下記の「注 3」を参照                                                                                                                             | January   |
| %n               | 改行文字 ('')                                                                                                                                                               |           |
| %p               | AM または PM の指定                                                                                                                                                      | PM        |
| %Q               | 四半期 (1-4)                                                                                                                                                             | 1         |
| %r               | 12 時間 HH:MM AM/PM 時間、%h:%i %p に相当                                                                                                                                 | 10:30 PM  |
| %R               | 24 時間 HH:MM 時間、%H:%i に相当                                                                                                                                        | 22:33     |
| %s               | 秒 (00-59)                                                                                                                                                               | 44        |
| %S               | 秒 (00-59)                                                                                                                                                               | 44        |
| %t               | 水平タブ文字 (')                                                                                                                                                          |           |
| %T               | ISO 8601 時間形式 (HH:MM:SS)、%H:%i:%S に相当                                                                                                                              | 22:33:44  |
| %u               | ISO 8601 曜日の数値、月曜日を 1 (1-7)                                                                                                                                           | 2         |
| %V               | ISO 8601 週番号 (01-53)                                                                                                                                                  | 01        |
| %w               | 日曜日を 0 (0-6) としたときの曜日の整数                                                                                                                                        | 2         |
| %W               | 完全な曜日の名前 (月曜日-日曜日)                                                                                                                                         | Monday    |
| %y               | 年の下 2 桁 (00-99)                                                                                                                                                      | 18        |
| %Y               | 年                                                                                                                                                                       | 2018      |
| %z               | UTC からのオフセット、+HHMM または -HHMM                                                                                                                                       | -0500     |
| %%               | % 記号                                                                                                                                                                 | %         |

注 1: ClickHouse の v23.4 以前のバージョンでは、`%f` はフォーマットされた値が日付、Date32 または DateTime（小数秒を持たない）である場合、または DateTime64 の精度が 0 の場合、単一のゼロ (0) を表示します。以前の動作は `formatdatetime_f_prints_single_zero = 1` 設定を使用して復元できます。

注 2: ClickHouse の v25.1 以前のバージョンでは、`%f` はそれぞれの DateTime64 のスケールによって指定された桁数の数字を表示します。以前の動作は `formatdatetime_f_prints_scale_number_of_digits= 1` 設定を使用して復元できます。

注 3: ClickHouse の v23.4 以前のバージョンでは、`%M` は完全な月の名前 (1 月-12 月) ではなく、分 (00-59) を表示します。以前の動作は `formatdatetime_parsedatetime_m_is_month_name = 0` 設定を使用して復元できます。

注 4: ClickHouse の v23.11 以前のバージョンでは、関数 `parseDateTime()` はフォーマッター `%c` (月) と `%l`/`%k` (時間) に対して先頭のゼロが必要でした。後のバージョンでは、先頭のゼロは省略可能です。この以前の動作は `parsedatetime_parse_without_leading_zeros = 0` 設定を使用して復元できます。ただし、デフォルトでは `formatDateTime()` 関数は `%c` と `%l`/`%k` に対して先頭のゼロを印刷して、既存の使用例を壊さないようにします。この動作は `formatdatetime_format_without_leading_zeros = 1` 設定により変更できます。

**例**

``` sql
SELECT formatDateTime(toDate('2010-01-04'), '%g')
```

結果:

```text
┌─formatDateTime(toDate('2010-01-04'), '%g')─┐
│ 10                                         │
└────────────────────────────────────────────┘
```

``` sql
SELECT formatDateTime(toDateTime64('2010-01-04 12:34:56.123456', 7), '%f')
```

結果:

```sql
┌─formatDateTime(toDateTime64('2010-01-04 12:34:56.123456', 7), '%f')─┐
│ 1234560                                                             │
└─────────────────────────────────────────────────────────────────────┘
```

さらに、`formatDateTime` 関数は、第3の文字列引数としてタイムゾーンの名前を受け取ることができます。例: `Asia/Istanbul`。この場合、時間は指定されたタイムゾーンに従ってフォーマットされます。

**例**

```sql
SELECT
    now() AS ts,
    time_zone,
    formatDateTime(ts, '%T', time_zone) AS str_tz_time
FROM system.time_zones
WHERE time_zone LIKE 'Europe%'
LIMIT 10

┌──────────────────ts─┬─time_zone─────────┬─str_tz_time─┐
│ 2023-09-08 19:13:40 │ Europe/Amsterdam  │ 21:13:40    │
│ 2023-09-08 19:13:40 │ Europe/Andorra    │ 21:13:40    │
│ 2023-09-08 19:13:40 │ Europe/Astrakhan  │ 23:13:40    │
│ 2023-09-08 19:13:40 │ Europe/Athens     │ 22:13:40    │
│ 2023-09-08 19:13:40 │ Europe/Belfast    │ 20:13:40    │
│ 2023-09-08 19:13:40 │ Europe/Belgrade   │ 21:13:40    │
│ 2023-09-08 19:13:40 │ Europe/Berlin     │ 21:13:40    │
│ 2023-09-08 19:13:40 │ Europe/Bratislava │ 21:13:40    │
│ 2023-09-08 19:13:40 │ Europe/Brussels   │ 21:13:40    │
│ 2023-09-08 19:13:40 │ Europe/Bucharest  │ 22:13:40    │
└─────────────────────┴───────────────────┴─────────────┘
```

**参照**

- [formatDateTimeInJodaSyntax](#formatdatetimeinjodasyntax)
## formatDateTimeInJodaSyntax {#formatdatetimeinjodasyntax}

formatDateTime に似ていますが、MySQL スタイルではなく Joda スタイルで日付時刻をフォーマットします。詳細は [Joda Time 公式ドキュメント](https://joda-time.sourceforge.net/apidocs/org/joda/time/format/DateTimeFormat.html) を参照してください。

この関数の逆の操作は [parseDateTimeInJodaSyntax](../functions/type-conversion-functions.md#type_conversion_functions-parseDateTimeInJodaSyntax) です。

**置換フィールド**

置換フィールドを使用することで、結果の文字列のパターンを定義できます。

| プレースホルダー | 説明                                   | 表示           | 例                                |
|------------------|--------------------------------------|---------------|----------------------------------|
| G                | 時代                                  | テキスト       | AD                               |
| C                | 時代の世紀 (>=0)                     | 数量           | 20                               |
| Y                | 時代の年 (>=0)                       | 年             | 1996                             |
| x                | ウィークイヤー (未サポート)         | 年             | 1996                             |
| w                | ウィークイヤーの週 (未サポート)     | 数量           | 27                               |
| e                | 曜日                                 | 数量           | 2                                |
| E                | 曜日                                 | テキスト       | Tuesday; Tue                     |
| y                | 年                                   | 年             | 1996                             |
| D                | 年の日                               | 数量           | 189                              |
| M                | 年の月                               | 月             | July; Jul; 07                   |
| d                | 月の日                               | 数量           | 10                               |
| a                | 日の半分                             | テキスト       | PM                               |
| K                | 半日の時間 (0~11)                   | 数量           | 0                                |
| h                | 半日の時計の時間 (1~12)             | 数量           | 12                               |
| H                | 日の時間 (0~23)                     | 数量           | 0                                |
| k                | 日の時計の時間 (1~24)               | 数量           | 24                               |
| m                | 時間の分                             | 数量           | 30                               |
| s                | 分の秒                               | 数量           | 55                               |
| S                | 秒の小数                             | 数量           | 978                              |
| z                | タイムゾーン                         | テキスト       | Eastern Standard Time; EST       |
| Z                | タイムゾーンオフセット               | ゾーン         | -0800; -0812                     |
| '                | 文字列のエスケープ                   | 区切り符号     |                                  |
| ''               | 単一引用符                           | リテラル       | '                                |

**例**

``` sql
SELECT formatDateTimeInJodaSyntax(toDateTime('2010-01-04 12:34:56'), 'yyyy-MM-dd HH:mm:ss')
```

結果:

```java
┌─formatDateTimeInJodaSyntax(toDateTime('2010-01-04 12:34:56'), 'yyyy-MM-dd HH:mm:ss')─┐
│ 2010-01-04 12:34:56                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```
## dateName {#datename}

指定された日付の部分を返します。

**構文**

``` sql
dateName(date_part, date)
```

**引数**

- `date_part` — 日付の部分。可能な値: 'year', 'quarter', 'month', 'week', 'dayofyear', 'day', 'weekday', 'hour', 'minute', 'second'。 [String](../data-types/string.md)。
- `date` — 日付。 [Date](../data-types/date.md), [Date32](../data-types/date32.md), [DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)。
- `timezone` — タイムゾーン。任意。 [String](../data-types/string.md)。

**返される値**

- 指定された日付の部分。 [String](../data-types/string.md#string)

**例**

```sql
WITH toDateTime('2021-04-14 11:22:33') AS date_value
SELECT
    dateName('year', date_value),
    dateName('month', date_value),
    dateName('day', date_value);
```

結果:

```text
┌─dateName('year', date_value)─┬─dateName('month', date_value)─┬─dateName('day', date_value)─┐
│ 2021                         │ April                         │ 14                          │
└──────────────────────────────┴───────────────────────────────┴─────────────────────────────┘
```
## monthName {#monthname}

月の名前を返します。

**構文**

``` sql
monthName(date)
```

**引数**

- `date` — 日付または時刻付き日付。 [Date](../data-types/date.md), [DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)。

**返される値**

- 月の名前。 [String](../data-types/string.md#string)

**例**

```sql
WITH toDateTime('2021-04-14 11:22:33') AS date_value
SELECT monthName(date_value);
```

結果:

```text
┌─monthName(date_value)─┐
│ April                 │
└───────────────────────┘
```
## fromUnixTimestamp {#fromunixtimestamp}

この関数は、Unix タイムスタンプをカレンダー日付およびその日の時間に変換します。

二つの方法で呼び出すことができます。

1 つの引数を [Integer](../data-types/int-uint.md) 型で与えられる場合、[DateTime](../data-types/datetime.md) 型の値を返します。すなわち、[toDateTime](../../sql-reference/functions/type-conversion-functions.md#todatetime) のように動作します。

エイリアス: `FROM_UNIXTIME`.

**例:**

```sql
SELECT fromUnixTimestamp(423543535);
```

結果:

```text
┌─fromUnixTimestamp(423543535)─┐
│          1983-06-04 10:58:55 │
└──────────────────────────────┘
```

二つまたは三つの引数が与えられた場合、最初の引数が [Integer](../data-types/int-uint.md)、[Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)、または [DateTime64](../data-types/datetime64.md) 型の値で、二番目の引数が定数フォーマット文字列、三番目の引数がオプションの定数タイムゾーン文字列である場合、この関数は [String](../data-types/string.md#string) 型の値を返します。すなわち、[formatDateTime](#formatdatetime) のように動作します。この場合、[MySQL の datetime フォーマットスタイル](https://dev.mysql.com/doc/refman/8.0/en/date-and-time-functions.html#function_date-format) が使用されます。

**例:**

```sql
SELECT fromUnixTimestamp(1234334543, '%Y-%m-%d %R:%S') AS DateTime;
```

結果:

```text
┌─DateTime────────────┐
│ 2009-02-11 14:42:23 │
└─────────────────────┘
```

**関連項目**

- [fromUnixTimestampInJodaSyntax](#fromunixtimestampinjodasyntax)

## fromUnixTimestampInJodaSyntax {#fromunixtimestampinjodasyntax}

[fromUnixTimestamp](#fromunixtimestamp) と同じですが、二つまたは三つの引数を指定した場合には、フォーマットは MySQL スタイルではなく、[Joda スタイル](https://joda-time.sourceforge.net/apidocs/org/joda/time/format/DateTimeFormat.html) を使用して行われます。

**例:**

```sql
SELECT fromUnixTimestampInJodaSyntax(1234334543, 'yyyy-MM-dd HH:mm:ss', 'UTC') AS DateTime;
```

結果:

```text
┌─DateTime────────────┐
│ 2009-02-11 06:42:23 │
└─────────────────────┘
```

## toModifiedJulianDay {#tomodifiedjulianday}

テキスト形式 `YYYY-MM-DD` の [先行グレゴリオ暦](https://en.wikipedia.org/wiki/Proleptic_Gregorian_calendar) 日付を [修正ユリウス日](https://en.wikipedia.org/wiki/Julian_day#Variants) 数に変換します。この関数は `0000-01-01` から `9999-12-31` までの日付をサポートしています。引数が日付として解析できない場合や、日付が無効な場合には例外を発生させます。

**構文**

```sql
toModifiedJulianDay(date)
```

**引数**

- `date` — テキスト形式の日付。 [String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。

**返される値**

- 修正ユリウス日数。 [Int32](../data-types/int-uint.md)。

**例**

```sql
SELECT toModifiedJulianDay('2020-01-01');
```

結果:

```text
┌─toModifiedJulianDay('2020-01-01')─┐
│                             58849 │
└───────────────────────────────────┘
```

## toModifiedJulianDayOrNull {#tomodifiedjuliandayornull}

[toModifiedJulianDay()](#tomodifiedjulianday) と似ていますが、例外を発生させる代わりに `NULL` を返します。

**構文**

```sql
toModifiedJulianDayOrNull(date)
```

**引数**

- `date` — テキスト形式の日付。 [String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。

**返される値**

- 修正ユリウス日数。 [Nullable(Int32)](../data-types/int-uint.md)。

**例**

```sql
SELECT toModifiedJulianDayOrNull('2020-01-01');
```

結果:

```text
┌─toModifiedJulianDayOrNull('2020-01-01')─┐
│                                   58849 │
└─────────────────────────────────────────┘
```

## fromModifiedJulianDay {#frommodifiedjulianday}

[修正ユリウス日](https://en.wikipedia.org/wiki/Julian_day#Variants) 数をテキスト形式 `YYYY-MM-DD` の [先行グレゴリオ暦](https://en.wikipedia.org/wiki/Proleptic_Gregorian_calendar) 日付に変換します。この関数は `-678941` から `2973483` までの日数をサポートしています（これがそれぞれ `0000-01-01` および `9999-12-31` を表します）。日数がサポートされている範囲外の場合には例外を発生させます。

**構文**

```sql
fromModifiedJulianDay(day)
```

**引数**

- `day` — 修正ユリウス日数。 [任意の整数型](../data-types/int-uint.md)。

**返される値**

- テキスト形式の日付。 [String](../data-types/string.md)

**例**

```sql
SELECT fromModifiedJulianDay(58849);
```

結果:

```text
┌─fromModifiedJulianDay(58849)─┐
│ 2020-01-01                   │
└──────────────────────────────┘
```

## fromModifiedJulianDayOrNull {#frommodifiedjuliandayornull}

[fromModifiedJulianDayOrNull()](#frommodifiedjuliandayornull) と似ていますが、例外を発生させる代わりに `NULL` を返します。

**構文**

```sql
fromModifiedJulianDayOrNull(day)
```

**引数**

- `day` — 修正ユリウス日数。 [任意の整数型](../data-types/int-uint.md)。

**返される値**

- テキスト形式の日付。 [Nullable(String)](../data-types/string.md)

**例**

```sql
SELECT fromModifiedJulianDayOrNull(58849);
```

結果:

```text
┌─fromModifiedJulianDayOrNull(58849)─┐
│ 2020-01-01                         │
└────────────────────────────────────┘
```

## toUTCTimestamp {#toutctimestamp}

DateTime/DateTime64 型の値を異なるタイムゾーンから UTC タイムゾーンタイムスタンプに変換します。この関数は主に Apache Spark や同様のフレームワークとの互換性のために含まれています。

**構文**

```sql
toUTCTimestamp(time_val, time_zone)
```

**引数**

- `time_val` — DayTime/DateTime64 型の定数値または式。 [DateTime/DateTime64 型](../data-types/datetime.md)
- `time_zone` — タイムゾーンを表す定数の文字列型値または式。 [String 型](../data-types/string.md)

**返される値**

- テキスト形式の DateTime/DateTime64

**例**

```sql
SELECT toUTCTimestamp(toDateTime('2023-03-16'), 'Asia/Shanghai');
```

結果:

```text
┌─toUTCTimestamp(toDateTime('2023-03-16'), 'Asia/Shanghai')┐
│                                     2023-03-15 16:00:00 │
└─────────────────────────────────────────────────────────┘
```

## fromUTCTimestamp {#fromutctimestamp}

UTC タイムゾーンから他のタイムゾーンに DateTime/DateTime64 型の値を変換します。この関数は主に Apache Spark や同様のフレームワークとの互換性のために含まれています。

**構文**

```sql
fromUTCTimestamp(time_val, time_zone)
```

**引数**

- `time_val` — DayTime/DateTime64 型の定数値または式。 [DateTime/DateTime64 型](../data-types/datetime.md)
- `time_zone` — タイムゾーンを表す定数の文字列型値または式。 [String 型](../data-types/string.md)

**返される値**

- テキスト形式の DateTime/DateTime64

**例**

```sql
SELECT fromUTCTimestamp(toDateTime64('2023-03-16 10:00:00', 3), 'Asia/Shanghai');
```

結果:

```text
┌─fromUTCTimestamp(toDateTime64('2023-03-16 10:00:00',3), 'Asia/Shanghai')─┐
│                                                 2023-03-16 18:00:00.000 │
└─────────────────────────────────────────────────────────────────────────┘
```

## UTCTimestamp {#utctimestamp}

クエリ解析の瞬間の現在の日付と時間を返します。この関数は定数式です。

:::note
この関数は `now('UTC')` の何らかの結果を返します。MySQL のサポートのために追加されたものであり、[`now`](#now) の使用が推奨されます。
:::

**構文**

```sql
UTCTimestamp()
```

エイリアス: `UTC_timestamp`.

**返される値**

- クエリ解析の瞬間の現在の日付と時間。 [DateTime](../data-types/datetime.md)。

**例**

クエリ:

```sql
SELECT UTCTimestamp();
```

結果:

```response
┌──────UTCTimestamp()─┐
│ 2024-05-28 08:32:09 │
└─────────────────────┘
```

## timeDiff {#timediff}

二つの日付または日時の値間の差を秒単位で返します。この差は `dateDiff` と同じように計算され、MySQL サポートのために追加されただけです。 `dateDiff` が推奨されます。

**構文**

```sql
timeDiff(first_datetime, second_datetime)
```

**引数**

- `first_datetime` — DayTime/DateTime64 型の定数値または式。 [DateTime/DateTime64 型](../data-types/datetime.md)
- `second_datetime` — DayTime/DateTime64 型の定数値または式。 [DateTime/DateTime64 型](../data-types/datetime.md)

**返される値**

二つの日付または日時の値の差（秒単位）。

**例**

クエリ:

```sql
timeDiff(toDateTime64('1927-01-01 00:00:00', 3), toDate32('1927-01-02'));
```

**結果**:

```response
┌─timeDiff(toDateTime64('1927-01-01 00:00:00', 3), toDate32('1927-01-02'))─┐
│                                                                    86400 │
└──────────────────────────────────────────────────────────────────────────┘
```

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouse における時系列データの扱い](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
