slug: '/sql-reference/functions/date-time-functions'
sidebar_position: 45
sidebar_label: '日付と時間'
keywords: 'ClickHouse, SQL, 日付, 時間, 関数'
description: '日付と時間を扱うための関数のリファレンス'
---

# 日付と時間を扱うための関数

このセクションのほとんどの関数は、オプションのタイムゾーン引数を受け付けます。例: `Europe/Amsterdam`。この場合、指定されたタイムゾーンがローカル（デフォルト）のものではなく使用されます。

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

[Date](../data-types/date.md)を作成します。
- 年、月、日引数から、または
- 年と年の日数引数から。

**構文**

``` sql
makeDate(year, month, day);
makeDate(year, day_of_year);
```

エイリアス:
- `MAKEDATE(year, month, day);`
- `MAKEDATE(year, day_of_year);`

**引数**

- `year` — 年。 [Integer](../data-types/int-uint.md), [Float](../data-types/float.md) または [Decimal](../data-types/decimal.md)。
- `month` — 月。 [Integer](../data-types/int-uint.md), [Float](../data-types/float.md) または [Decimal](../data-types/decimal.md)。
- `day` — 日。 [Integer](../data-types/int-uint.md), [Float](../data-types/float.md) または [Decimal](../data-types/decimal.md)。
- `day_of_year` — 年の日数。 [Integer](../data-types/int-uint.md), [Float](../data-types/float.md) または [Decimal](../data-types/decimal.md)。

**返される値**

- 引数から作成された日付。[Date](../data-types/date.md)。

**例**

年、月、日から日付を作成します。

``` sql
SELECT makeDate(2023, 2, 28) AS Date;
```

結果:

``` text
┌───────date─┐
│ 2023-02-28 │
└────────────┘
```

年と年の日数引数から日付を作成します。

``` sql
SELECT makeDate(2023, 42) AS Date;
```

結果:

``` text
┌───────date─┐
│ 2023-02-11 │
└────────────┘
```
## makeDate32 {#makedate32}

年、月、日（またはオプションで年と日）から[Date32](../../sql-reference/data-types/date32.md)タイプの日付を作成します。

**構文**

```sql
makeDate32(year, [month,] day)
```

**引数**

- `year` — 年。 [Integer](../../sql-reference/data-types/int-uint.md), [Float](../../sql-reference/data-types/float.md) または [Decimal](../../sql-reference/data-types/decimal.md)。
- `month` — 月（オプション）。 [Integer](../../sql-reference/data-types/int-uint.md), [Float](../../sql-reference/data-types/float.md) または [Decimal](../../sql-reference/data-types/decimal.md)。
- `day` — 日。 [Integer](../../sql-reference/data-types/int-uint.md), [Float](../../sql-reference/data-types/float.md) または [Decimal](../../sql-reference/data-types/decimal.md)。

:::note
`month`が省略されている場合、`day`には`1`から`365`の値を取る必要があります。それ以外の場合は、`1`から`31`の値を取る必要があります。
:::

**返される値**

- 引数から作成された日付。[Date32](../../sql-reference/data-types/date32.md)。

**例**

年、月、日から日付を作成します。

クエリ:

```sql
SELECT makeDate32(2024, 1, 1);
```

結果:

```response
2024-01-01
```

年と年の日数から日付を作成します。

クエリ:

``` sql
SELECT makeDate32(2024, 100);
```

結果:

```response
2024-04-09
```
## makeDateTime {#makedatetime}

年、月、日、時、分、秒の引数から[DateTime](../data-types/datetime.md)を作成します。

**構文**

``` sql
makeDateTime(year, month, day, hour, minute, second[, timezone])
```

**引数**

- `year` — 年。[Integer](../data-types/int-uint.md), [Float](../data-types/float.md) または [Decimal](../data-types/decimal.md)。
- `month` — 月。[Integer](../data-types/int-uint.md), [Float](../data-types/float.md) または [Decimal](../data-types/decimal.md)。
- `day` — 日。[Integer](../data-types/int-uint.md), [Float](../data-types/float.md) または [Decimal](../data-types/decimal.md)。
- `hour` — 時。[Integer](../data-types/int-uint.md), [Float](../data-types/float.md) または [Decimal](../data-types/decimal.md)。
- `minute` — 分。[Integer](../data-types/int-uint.md), [Float](../data-types/float.md) または [Decimal](../data-types/decimal.md)。
- `second` — 秒。[Integer](../data-types/int-uint.md), [Float](../data-types/float.md) または [Decimal](../data-types/decimal.md)。
- `timezone` — 返される値の[タイムゾーン](../../operations/server-configuration-parameters/settings.md#timezone)（オプション）。

**返される値**

- 引数から作成された時間を伴う日付。[DateTime](../data-types/datetime.md)。

**例**

``` sql
SELECT makeDateTime(2023, 2, 28, 17, 12, 33) AS DateTime;
```

結果:

``` text
┌────────────DateTime─┐
│ 2023-02-28 17:12:33 │
└─────────────────────┘
```
## makeDateTime64 {#makedatetime64}

コンポーネントから[DateTime64](../../sql-reference/data-types/datetime64.md)データ型の値を作成します: 年、月、日、時、分、秒。オプションのサブ秒精度を含みます。

**構文**

```sql
makeDateTime64(year, month, day, hour, minute, second[, precision])
```

**引数**

- `year` — 年（0-9999）。 [Integer](../../sql-reference/data-types/int-uint.md), [Float](../../sql-reference/data-types/float.md) または [Decimal](../../sql-reference/data-types/decimal.md)。
- `month` — 月（1-12）。 [Integer](../../sql-reference/data-types/int-uint.md), [Float](../../sql-reference/data-types/float.md) または [Decimal](../../sql-reference/data-types/decimal.md)。
- `day` — 日（1-31）。 [Integer](../../sql-reference/data-types/int-uint.md), [Float](../../sql-reference/data-types/float.md) または [Decimal](../../sql-reference/data-types/decimal.md)。
- `hour` — 時間（0-23）。 [Integer](../../sql-reference/data-types/int-uint.md), [Float](../../sql-reference/data-types/float.md) または [Decimal](../../sql-reference/data-types/decimal.md)。
- `minute` — 分（0-59）。 [Integer](../../sql-reference/data-types/int-uint.md), [Float](../../sql-reference/data-types/float.md) または [Decimal](../../sql-reference/data-types/decimal.md)。
- `second` — 秒（0-59）。 [Integer](../../sql-reference/data-types/int-uint.md), [Float](../../sql-reference/data-types/float.md) または [Decimal](../../sql-reference/data-types/decimal.md)。
- `precision` — サブ秒コンポーネントの精度（0-9）のオプション。 [Integer](../../sql-reference/data-types/int-uint.md)。

**返される値**

- 提供された引数から作成された日付と時間。[DateTime64](../../sql-reference/data-types/datetime64.md)。

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

最初の引数'exp'を[DateTime64(6)](../data-types/datetime64.md)型に変換します。
第二の引数'expr_time'が提供される場合、指定された時間を変換された値に追加します。

**構文**

``` sql
timestamp(expr[, expr_time])
```

エイリアス: `TIMESTAMP`

**引数**

- `expr` - 日付または時間を伴う日付。 [String](../data-types/string.md)。
- `expr_time` - オプションのパラメータ。追加する時間。 [String](../data-types/string.md)。

**例**

``` sql
SELECT timestamp('2023-12-31') as ts;
```

結果:

``` text
┌─────────────────────────ts─┐
│ 2023-12-31 00:00:00.000000 │
└────────────────────────────┘
```

``` sql
SELECT timestamp('2023-12-31 12:00:00', '12:00:00.11') as ts;
```

結果:

``` text
┌─────────────────────────ts─┐
│ 2024-01-01 00:00:00.110000 │
└────────────────────────────┘
```

**返される値**

- [DateTime64](../data-types/datetime64.md)(6)
## timeZone {#timezone}

現在のセッションのタイムゾーンを返します。すなわち、設定 [session_timezone](../../operations/settings/settings.md#session_timezone) の値です。
関数が分散テーブルのコンテキストで実行されると、各シャードに関連した値を持つ通常のカラムを生成します。それ以外の場合は、定数値を生成します。

**構文**

```sql
timeZone()
```

エイリアス: `timezone`.

**返される値**

- タイムゾーン。[String](../data-types/string.md)。

**例**

```sql
SELECT timezone()
```

結果:

```response
┌─timezone()─────┐
│ America/Denver │
└────────────────┘
```

**参照**

- [serverTimeZone](#servertimezone)
## serverTimeZone {#servertimezone}

サーバーのタイムゾーンを返します。すなわち、設定 [timezone](../../operations/server-configuration-parameters/settings.md#timezone) の値です。
関数が分散テーブルのコンテキストで実行されると、各シャードに関連した値を持つ通常のカラムを生成します。それ以外の場合は、定数値を生成します。

**構文**

``` sql
serverTimeZone()
```

エイリアス: `serverTimezone`.

**返される値**

- タイムゾーン。[String](../data-types/string.md)。

**例**

```sql
SELECT serverTimeZone()
```

結果:

```response
┌─serverTimeZone()─┐
│ UTC              │
└──────────────────┘
```

**参照**

- [timeZone](#timezone)
## toTimeZone {#totimezone}

日付または時間を伴う日付を指定されたタイムゾーンに変換します。データの内部値（Unix秒数）は変更せず、値のタイムゾーン属性と値の文字列表現のみが変更されます。

**構文**

``` sql
toTimezone(value, timezone)
```

エイリアス: `toTimezone`.

**引数**

- `value` — 時間または日付と時間。[DateTime64](../data-types/datetime64.md)。
- `timezone` — 返される値のタイムゾーン。[String](../data-types/string.md)。この引数は定数です。なぜなら、`toTimezone`はカラムのタイムゾーンを変更するからです（タイムゾーンは`DateTime*`タイプの属性です）。

**返される値**

- 日付と時間。[DateTime](../data-types/datetime.md)。

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

結果:

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

**参照**

- [formatDateTime](#formatdatetime) - 非定数タイムゾーンをサポートします。
- [toString](type-conversion-functions.md#tostring) - 非定数タイムゾーンをサポートします。
## timeZoneOf {#timezoneof}

[DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)データ型のタイムゾーン名を返します。

**構文**

``` sql
timeZoneOf(value)
```

エイリアス: `timezoneOf`.

**引数**

- `value` — 日付と時間。[DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)。

**返される値**

- タイムゾーン名。[String](../data-types/string.md)。

**例**

``` sql
SELECT timezoneOf(now());
```

結果:
``` text
┌─timezoneOf(now())─┐
│ Etc/UTC           │
└───────────────────┘
```
## timeZoneOffset {#timezoneoffset}

[UTC](https://en.wikipedia.org/wiki/Coordinated_Universal_Time)から秒単位のタイムゾーンオフセットを返します。
関数は[サマータイム](https://en.wikipedia.org/wiki/Daylight_saving_time)や指定された日付と時間における歴史的なタイムゾーンの変更を考慮します。
オフセットを計算するために[IANAタイムゾーンデータベース](https://www.iana.org/time-zones)が使用されます。

**構文**

``` sql
timeZoneOffset(value)
```

エイリアス: `timezoneOffset`.

**引数**

- `value` — 日付と時間。[DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)。

**返される値**

- UTCからのオフセット（秒）。[Int32](../data-types/int-uint.md)。

**例**

``` sql
SELECT toDateTime('2021-04-21 10:20:30', 'America/New_York') AS Time, toTypeName(Time) AS Type,
       timeZoneOffset(Time) AS Offset_in_seconds, (Offset_in_seconds / 3600) AS Offset_in_hours;
```

結果:

``` text
┌────────────────Time─┬─Type─────────────────────────┬─Offset_in_seconds─┬─Offset_in_hours─┐
│ 2021-04-21 10:20:30 │ DateTime('America/New_York') │            -14400 │              -4 │
└─────────────────────┴──────────────────────────────┴───────────────────┴─────────────────┘
```
## toYear {#toyear}

日付または時間を伴う日付の年のコンポーネント（西暦）を返します。

**構文**

```sql
toYear(value)
```

エイリアス: `YEAR`

**引数**

- `value` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)

**返される値**

- 指定された日付/時間の年。[UInt16](../data-types/int-uint.md)。

**例**

```sql
SELECT toYear(toDateTime('2023-04-21 10:20:30'))
```

結果:

```response
┌─toYear(toDateTime('2023-04-21 10:20:30'))─┐
│                                      2023 │
└───────────────────────────────────────────┘
```
## toQuarter {#toquarter}

日付または時間を伴う日付の四半期（1-4）を返します。

**構文**

```sql
toQuarter(value)
```

エイリアス: `QUARTER`

**引数**

- `value` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)

**返される値**

- 指定された日付/時間の年の四半期（1, 2, 3または4）。[UInt8](../data-types/int-uint.md)。

**例**

```sql
SELECT toQuarter(toDateTime('2023-04-21 10:20:30'))
```

結果:

```response
┌─toQuarter(toDateTime('2023-04-21 10:20:30'))─┐
│                                            2 │
└──────────────────────────────────────────────┘
```
## toMonth {#tomonth}

日付または時間を伴う日付の月のコンポーネント（1-12）を返します。

**構文**

```sql
toMonth(value)
```

エイリアス: `MONTH`

**引数**

- `value` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)

**返される値**

- 指定された日付/時間の年の月（1 - 12）。[UInt8](../data-types/int-uint.md)。

**例**

```sql
SELECT toMonth(toDateTime('2023-04-21 10:20:30'))
```

結果:

```response
┌─toMonth(toDateTime('2023-04-21 10:20:30'))─┐
│                                          4 │
└────────────────────────────────────────────┘
```
## toDayOfYear {#todayofyear}

日付または時間を伴う日付の年内の日数（1-366）を返します。

**構文**

```sql
toDayOfYear(value)
```

エイリアス: `DAYOFYEAR`

**引数**

- `value` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)

**返される値**

- 指定された日付/時間の年の日（1 - 366）。[UInt16](../data-types/int-uint.md)。

**例**

```sql
SELECT toDayOfYear(toDateTime('2023-04-21 10:20:30'))
```

結果:

```response
┌─toDayOfYear(toDateTime('2023-04-21 10:20:30'))─┐
│                                            111 │
└────────────────────────────────────────────────┘
```
## toDayOfMonth {#todayofmonth}

日付または時間を伴う日付のその月の日数（1-31）を返します。

**構文**

```sql
toDayOfMonth(value)
```

エイリアス: `DAYOFMONTH`, `DAY`

**引数**

- `value` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)

**返される値**

- 指定された日付/時間のその月の日数（1 - 31）。[UInt8](../data-types/int-uint.md)。

**例**

```sql
SELECT toDayOfMonth(toDateTime('2023-04-21 10:20:30'))
```

結果:

```response
┌─toDayOfMonth(toDateTime('2023-04-21 10:20:30'))─┐
│                                              21 │
└─────────────────────────────────────────────────┘
```
## toDayOfWeek {#todayofweek}

日付または時間を伴う日付のその週の日数を返します。

`toDayOfWeek()`の二引数形式は、週の初めの日を月曜日または日曜日に指定でき、戻り値が0から6または1から7の範囲になるかを指定できます。モード引数を省略すると、デフォルトモードは0です。日付のタイムゾーンを第三引数として指定できます。

| モード | 週の初めの日 | 範囲                                          |
|------|-------------------|------------------------------------------------|
| 0    | 月曜日            | 1-7: 月曜日 = 1, 火曜日 = 2, ..., 日曜日 = 7  |
| 1    | 月曜日            | 0-6: 月曜日 = 0, 火曜日 = 1, ..., 日曜日 = 6  |
| 2    | 日曜日            | 0-6: 日曜日 = 0, 月曜日 = 1, ..., 土曜日 = 6 |
| 3    | 日曜日            | 1-7: 日曜日 = 1, 月曜日 = 2, ..., 土曜日 = 7 |

**構文**

``` sql
toDayOfWeek(t[, mode[, timezone]])
```

エイリアス: `DAYOFWEEK`.

**引数**

- `t` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)
- `mode` - 週の初めの日を決定します。可能な値は0, 1, 2または3です。上の表で違いを確認してください。
- `timezone` - オプションのパラメータで、他の変換関数と同様に動作します。

最初の引数は、[parseDateTime64BestEffort()](type-conversion-functions.md#parsedatetime64besteffort)によりサポートされる形式の[String](../data-types/string.md)としても指定できます。文字列引数のサポートは、特定のサードパーティツールが期待するMySQLとの互換性のためにのみ存在しています。文字列引数のサポートは、将来のMySQL互換性設定に依存する可能性があるため、一般的に文字列解析は遅いため、使用しないことが推奨されます。

**返される値**

- 指定された日付/時間における週の日数（1-7）、選択したモードに応じて

**例**

次の日付は2023年4月21日で、金曜日です。

```sql
SELECT
    toDayOfWeek(toDateTime('2023-04-21')),
    toDayOfWeek(toDateTime('2023-04-21'), 1)
```

結果:

```response
┌─toDayOfWeek(toDateTime('2023-04-21'))─┬─toDayOfWeek(toDateTime('2023-04-21'), 1)─┐
│                                     5 │                                        4 │
└───────────────────────────────────────┴──────────────────────────────────────────┘
```
## toHour {#tohour}

時間を伴う日付の時間コンポーネント（0-24）を返します。

時計が前に進められた場合、通常は1時間進められ、午前2時に発生し、逆に戻される場合は1時間戻され、午前3時になると想定されます（これは常に正確に発生するわけではなく、タイムゾーンに依存します）。

**構文**

```sql
toHour(value)
```

エイリアス: `HOUR`

**引数**

- `value` - [DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)

**返される値**

- 指定された日付/時間のその日の時間（0 - 23）。[UInt8](../data-types/int-uint.md)。

**例**

```sql
SELECT toHour(toDateTime('2023-04-21 10:20:30'))
```

結果:

```response
┌─toHour(toDateTime('2023-04-21 10:20:30'))─┐
│                                        10 │
└───────────────────────────────────────────┘
```
## toMinute {#tominute}

時間を伴う日付の分コンポーネント（0-59）を返します。

**構文**

```sql
toMinute(value)
```

エイリアス: `MINUTE`

**引数**

- `value` - [DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)

**返される値**

- 指定された日付/時間のその時間の分（0 - 59）。[UInt8](../data-types/int-uint.md)。

**例**

```sql
SELECT toMinute(toDateTime('2023-04-21 10:20:30'))
```

結果:

```response
┌─toMinute(toDateTime('2023-04-21 10:20:30'))─┐
│                                          20 │
└─────────────────────────────────────────────┘
```
## toSecond {#tosecond}

時間を伴う日付の秒コンポーネント（0-59）を返します。うるう秒は考慮されません。

**構文**

```sql
toSecond(value)
```

エイリアス: `SECOND`

**引数**

- `value` - [DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)

**返される値**

- 指定された日付/時間のその分の秒（0 - 59）。[UInt8](../data-types/int-uint.md)。

**例**

```sql
SELECT toSecond(toDateTime('2023-04-21 10:20:30'))
```

結果:

```response
┌─toSecond(toDateTime('2023-04-21 10:20:30'))─┐
│                                          30 │
└─────────────────────────────────────────────┘
```
## toMillisecond {#tomillisecond}

時間を伴う日付のミリ秒コンポーネント（0-999）を返します。

**構文**

```sql
toMillisecond(value)
```

**引数**

- `value` - [DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)

エイリアス: `MILLISECOND`

```sql
SELECT toMillisecond(toDateTime64('2023-04-21 10:20:30.456', 3))
```

結果:

```response
┌──toMillisecond(toDateTime64('2023-04-21 10:20:30.456', 3))─┐
│                                                        456 │
└────────────────────────────────────────────────────────────┘
```

**返される値**

- 指定された日付/時間のその分のミリ秒（0 - 59）。[UInt16](../data-types/int-uint.md)。
## toUnixTimestamp {#tounixtimestamp}

文字列、日付、または時間を伴う日付を[Unixタイムスタンプ](https://en.wikipedia.org/wiki/Unix_time)に`UInt32`表現で変換します。

関数が文字列で呼び出されると、オプションのタイムゾーン引数を受け付けます。

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

結果:

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
`toStartOf*`、`toLastDayOf*`、`toMonday`、`timeSlot`関数の返り値の型は、設定パラメータ [enable_extended_results_for_datetime_functions](/operations/settings/settings#enable_extended_results_for_datetime_functions) によって決まります。このパラメータはデフォルトで`0`です。

動作
* `enable_extended_results_for_datetime_functions = 0`:
  * 関数 `toStartOfYear`、`toStartOfISOYear`、`toStartOfQuarter`、`toStartOfMonth`、`toStartOfWeek`、`toLastDayOfWeek`、`toLastDayOfMonth`、`toMonday`は、引数が `Date` または `DateTime`の場合、`Date` または `DateTime`を返します。
  * 関数 `toStartOfDay`、`toStartOfHour`、`toStartOfFifteenMinutes`、`toStartOfTenMinutes`、`toStartOfFiveMinutes`、`toStartOfMinute`、`timeSlot`は、引数が`Date`または`DateTime`の場合、`DateTime`を返し、`Date32`や`DateTime64`を引数に指定しても正常な範囲（`Date`の場合1970年から2149年、`DateTime`の場合2106年）を超える時間を指定すると不正確な結果が得られます。
* `enable_extended_results_for_datetime_functions = 1`:
  * 関数 `toStartOfYear`、`toStartOfISOYear`、`toStartOfQuarter`、`toStartOfMonth`、`toStartOfWeek`、`toLastDayOfWeek`、`toLastDayOfMonth`、`toMonday`は引数が`Date`または`DateTime`の場合は`Date`または`DateTime`を返し、引数が`Date32`または`DateTime64`の場合は`Date32`または`DateTime64`を返します。
  * 関数 `toStartOfDay`、`toStartOfHour`、`toStartOfFifteenMinutes`、`toStartOfTenMinutes`、`toStartOfFiveMinutes`、`toStartOfMinute`、`timeSlot`は引数が`Date`または`DateTime`の場合は`DateTime`を返し、引数が`Date32`または`DateTime64`の場合は`DateTime64`を返します。
:::
## toStartOfYear {#tostartofyear}

日付または時間を伴う日付を年の初めの初日まで切り下げます。日付は`Date`オブジェクトとして返されます。

**構文**

```sql
toStartOfYear(value)
```

**引数**

- `value` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)

**返される値**

- 入力された日付/時間の年の初日。[Date](../data-types/date.md)。

**例**

```sql
SELECT toStartOfYear(toDateTime('2023-04-21 10:20:30'))
```

結果:

```response
┌─toStartOfYear(toDateTime('2023-04-21 10:20:30'))─┐
│                                       2023-01-01 │
└──────────────────────────────────────────────────┘
```
## toStartOfISOYear {#tostartofisoyear}

日付または時間を伴う日付をISO年の初日まで切り下げます。これは「通常の」年と異なる場合があります。（詳細は[ISO週日付](https://en.wikipedia.org/wiki/ISO_week_date)を参照）。

**構文**

```sql
toStartOfISOYear(value)
```

**引数**

- `value` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)

**返される値**

- 入力された日付/時間の年の初日。[Date](../data-types/date.md)。

**例**

```sql
SELECT toStartOfISOYear(toDateTime('2023-04-21 10:20:30'))
```

結果:

```response
┌─toStartOfISOYear(toDateTime('2023-04-21 10:20:30'))─┐
│                                          2023-01-02 │
└─────────────────────────────────────────────────────┘
```
## toStartOfQuarter {#tostartofquarter}

日付または時間を伴う日付を四半期の初日まで切り下げます。四半期の初日は、1月1日、4月1日、7月1日、または10月1日です。
日付を返します。

**構文**

```sql
toStartOfQuarter(value)
```

**引数**

- `value` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)

**返される値**

- 指定された日付/時間の四半期の初日。[Date](../data-types/date.md)。

**例**

```sql
SELECT toStartOfQuarter(toDateTime('2023-04-21 10:20:30'))
```

結果:

```response
┌─toStartOfQuarter(toDateTime('2023-04-21 10:20:30'))─┐
│                                          2023-04-01 │
└─────────────────────────────────────────────────────┘
```
## toStartOfMonth {#tostartofmonth}

日付または時間を伴う日付を月の初日まで切り下げます。日付を返します。

**構文**

```sql
toStartOfMonth(value)
```

**引数**

- `value` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)

**返される値**

- 指定された日付/時間の月の初日。[Date](../data-types/date.md)。

**例**

```sql
SELECT toStartOfMonth(toDateTime('2023-04-21 10:20:30'))
```

結果:

```response
┌─toStartOfMonth(toDateTime('2023-04-21 10:20:30'))─┐
│                                        2023-04-01 │
└───────────────────────────────────────────────────┘
```

:::note
不正な日付を解析する動作は実装に依存します。ClickHouseはゼロ日付を返すか、例外をスローするか、「自然」のオーバーフローを実行する可能性があります。
:::
## toLastDayOfMonth {#tolastdayofmonth}

日付または時間を伴う日付をその月の最終日まで切り上げます。日付を返します。

**構文**

```sql
toLastDayOfMonth(value)
```

エイリアス: `LAST_DAY`

**引数**

- `value` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)

**返される値**

- 指定された日付/時間の月の最終日。[Date](../data-types/date.md)。

**例**

```sql
SELECT toLastDayOfMonth(toDateTime('2023-04-21 10:20:30'))
```

結果:

```response
┌─toLastDayOfMonth(toDateTime('2023-04-21 10:20:30'))─┐
│                                          2023-04-30 │
└─────────────────────────────────────────────────────┘
```
## toMonday {#tomonday}

日付または時間を伴う日付を最近の月曜日まで切り下げます。日付を返します。

**構文**

```sql
toMonday(value)
```

**引数**

- `value` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)

**返される値**

- 指定された日付の直近の月曜日の日時。[Date](../data-types/date.md)。

**例**

```sql
SELECT
    toMonday(toDateTime('2023-04-21 10:20:30')), /* 金曜日 */
    toMonday(toDate('2023-04-24')), /* 既に月曜日 */
```

結果:

```response
┌─toMonday(toDateTime('2023-04-21 10:20:30'))─┬─toMonday(toDate('2023-04-24'))─┐
│                                  2023-04-17 │                     2023-04-24 │
└─────────────────────────────────────────────┴────────────────────────────────┘
```

## toStartOfWeek {#tostartofweek}

指定した日付または日時を最も近い日曜日または月曜日に丸めます。日付を返します。mode 引数は `toWeek()` 関数の mode 引数とまったく同じように機能します。モードが指定されていない場合、デフォルトで 0 になります。

**構文**

``` sql
toStartOfWeek(t[, mode[, timezone]])
```

**引数**

- `t` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)
- `mode` - [toWeek()](#toweek) 関数で説明されているように、週の最初の日を決定します。
- `timezone` - オプションのパラメータで、他の変換関数と同様に動作します。

**返される値**

- 指定した日付以前の最も近い日曜日または月曜日の日付。 [Date](../data-types/date.md)。

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

指定した日付または日時を最も近い土曜日または日曜日に丸めます。日付を返します。
mode 引数は `toWeek()` 関数の mode 引数とまったく同じように機能します。モードが指定されていない場合、モードは 0 と見なされます。

**構文**

``` sql
toLastDayOfWeek(t[, mode[, timezone]])
```

**引数**

- `t` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)
- `mode` - [toWeek](#toweek) 関数で説明されているように、週の最終日を決定します。
- `timezone` - オプションのパラメータで、他の変換関数と同様に動作します。

**返される値**

- 指定した日付以降の最も近い日曜日または土曜日の日付。 [Date](../data-types/date.md)。

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

日時をその日の開始時刻に丸めます。

**構文**

```sql
toStartOfDay(value)
```

**引数**

- `value` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)

**返される値**

- 指定した日付/時刻のその日の開始時刻。 [DateTime](../data-types/datetime.md)。

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

日時をその時刻の開始時刻に丸めます。

**構文**

```sql
toStartOfHour(value)
```

**引数**

- `value` - [DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)

**返される値**

- 指定した日付/時刻のその時刻の開始時刻。 [DateTime](../data-types/datetime.md)。

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

日時をその分の開始時刻に丸めます。

**構文**

```sql
toStartOfMinute(value)
```

**引数**

- `value` - [DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)

**返される値**

- 指定した日付/時刻のその分の開始時刻。 [DateTime](../data-types/datetime.md)。

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

- `value` — 日時。 [DateTime64](../data-types/datetime64.md)。
- `timezone` — 返される値の [Timezone](../../operations/server-configuration-parameters/settings.md#timezone) (オプション)。指定されていない場合、関数は `value` パラメータのタイムゾーンを使用します。 [String](../data-types/string.md)。

**返される値**

- サブ秒のない入力値。 [DateTime64](../data-types/datetime64.md)。

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

- [Timezone](../../operations/server-configuration-parameters/settings.md#timezone) サーバー構成パラメーター。

## toStartOfMillisecond {#tostartofmillisecond}

日時をミリ秒の開始時刻に丸めます。

**構文**

``` sql
toStartOfMillisecond(value, [timezone])
```

**引数**

- `value` — 日時。 [DateTime64](../../sql-reference/data-types/datetime64.md)。
- `timezone` — 返される値の [Timezone](../../operations/server-configuration-parameters/settings.md#timezone) (オプション)。指定されていない場合、関数は `value` パラメータのタイムゾーンを使用します。[String](../../sql-reference/data-types/string.md)。

**返される値**

- サブミリ秒のある入力値。 [DateTime64](../../sql-reference/data-types/datetime64.md)。

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

- [Timezone](../../operations/server-configuration-parameters/settings.md#timezone) サーバー構成パラメーター。

## toStartOfMicrosecond {#tostartofmicrosecond}

日時をマイクロ秒の開始時刻に丸めます。

**構文**

``` sql
toStartOfMicrosecond(value, [timezone])
```

**引数**

- `value` — 日時。 [DateTime64](../../sql-reference/data-types/datetime64.md)。
- `timezone` — 返される値の [Timezone](../../operations/server-configuration-parameters/settings.md#timezone) (オプション)。指定されていない場合、関数は `value` パラメータのタイムゾーンを使用します。 [String](../../sql-reference/data-types/string.md)。

**返される値**

- サブマイクロ秒のある入力値。 [DateTime64](../../sql-reference/data-types/datetime64.md)。

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

- [Timezone](../../operations/server-configuration-parameters/settings.md#timezone) サーバー構成パラメーター。

## toStartOfNanosecond {#tostartofnanosecond}

日時をナノ秒の開始時刻に丸めます。

**構文**

``` sql
toStartOfNanosecond(value, [timezone])
```

**引数**

- `value` — 日時。 [DateTime64](../../sql-reference/data-types/datetime64.md)。
- `timezone` — 返される値の [Timezone](../../operations/server-configuration-parameters/settings.md#timezone) (オプション)。指定されていない場合、関数は `value` パラメータのタイムゾーンを使用します。 [String](../../sql-reference/data-types/string.md)。

**返される値**

- ナノ秒のある入力値。 [DateTime64](../../sql-reference/data-types/datetime64.md)。

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

- [Timezone](../../operations/server-configuration-parameters/settings.md#timezone) サーバー構成パラメーター。

## toStartOfFiveMinutes {#tostartoffiveminutes}

日時を5分間隔の開始時刻に丸めます。

**構文**

```sql
toStartOfFiveMinutes(value)
```

**引数**

- `value` - [DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)

**返される値**

- 指定した日付/時刻の5分間隔の開始時刻。 [DateTime](../data-types/datetime.md)。

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

日時を10分間隔の開始時刻に丸めます。

**構文**

```sql
toStartOfTenMinutes(value)
```

**引数**

- `value` - [DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)

**返される値**

- 指定した日付/時刻の10分間隔の開始時刻。 [DateTime](../data-types/datetime.md)。

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

日時を15分間隔の開始時刻に丸めます。

**構文**

```sql
toStartOfFifteenMinutes(value)
```

**引数**

- `value` - [DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)

**返される値**

- 指定した日付/時刻の15分間隔の開始時刻。 [DateTime](../data-types/datetime.md)。

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

この関数は、`toStartOf*()` 関数を一般化し、`toStartOfInterval(date_or_date_with_time, INTERVAL x unit [, time_zone])` 構文を使用します。
例えば、
- `toStartOfInterval(t, INTERVAL 1 YEAR)` は `toStartOfYear(t)` と同じ結果を返します、
- `toStartOfInterval(t, INTERVAL 1 MONTH)` は `toStartOfMonth(t)` と同じ結果を返します、
- `toStartOfInterval(t, INTERVAL 1 DAY)` は `toStartOfDay(t)` と同じ結果を返します、
- `toStartOfInterval(t, INTERVAL 15 MINUTE)` は `toStartOfFifteenMinutes(t)` と同じ結果を返します。

計算は特定の時点に対して行われます:

| インターバル    | スタート                  |
|-------------|------------------------|
| YEAR        | year 0                 |
| QUARTER     | 1900 Q1                |
| MONTH       | 1900 January           |
| WEEK        | 1970, 1st week (01-05) |
| DAY         | 1970-01-01             |
| HOUR        | (*)                    |
| MINUTE      | 1970-01-01 00:00:00    |
| SECOND      | 1970-01-01 00:00:00    |
| MILLISECOND | 1970-01-01 00:00:00    |
| MICROSECOND | 1970-01-01 00:00:00    |
| NANOSECOND  | 1970-01-01 00:00:00    |

(*) 時間のインターバルは特別です：計算は常に現在の日の 00:00:00（真夜中）に対して行われます。その結果、1から23の間の時間の値のみが有用です。

もしユニット `WEEK` が指定された場合、`toStartOfInterval` は週が月曜日に始まると仮定します。この動作は、週がデフォルトで日曜日から始まる関数 `toStartOfWeek` とは異なります。

**構文**

```sql
toStartOfInterval(value, INTERVAL x unit[, time_zone])
toStartOfInterval(value, INTERVAL x unit[, origin[, time_zone]])
```
エイリアス: `time_bucket`, `date_bin`.

2番目のオーバーロードは、TimescaleDBの `time_bucket()` 関数、またはPostgreSQLの `date_bin()` 関数をエミュレートします。 例えば、

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

日時を特定の固定日付に変換し、時間を保持します。

**構文**

```sql
toTime(date[,timezone])
```

**引数**

- `date` — 時間に変換する日付。 [Date](../data-types/date.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。
- `timezone` (オプション) — 返される値のタイムゾーン。 [String](../data-types/string.md)。

**返される値**

- 日付が `1970-01-02` に設定された時刻を保持する DateTime。 [DateTime](../data-types/datetime.md)。

:::note
もし、`date` 入力引数にサブ秒成分が含まれている場合、それらは返される `DateTime` 値において秒精度で切り捨てられます。
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

日付または日時を、過去の特定の基準点から経過した年数に変換します。

**構文**

```sql
toRelativeYearNum(date)
```

**引数**

- `date` — 日付または日時。 [Date](../data-types/date.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**返される値**

- 過去の基準点からの年数。 [UInt16](../data-types/int-uint.md)。

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

日付または日時を、過去の特定の基準点から経過した四半期数に変換します。

**構文**

```sql
toRelativeQuarterNum(date)
```

**引数**

- `date` — 日付または日時。 [Date](../data-types/date.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**返される値**

- 過去の基準点からの四半期数。 [UInt32](../data-types/int-uint.md)。

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

日付または日時を、過去の特定の基準点から経過した月数に変換します。

**構文**

```sql
toRelativeMonthNum(date)
```

**引数**

- `date` — 日付または日時。 [Date](../data-types/date.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**返される値**

- 過去の基準点からの月数。 [UInt32](../data-types/int-uint.md)。

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

日付または日時を、過去の特定の基準点から経過した週数に変換します。

**構文**

```sql
toRelativeWeekNum(date)
```

**引数**

- `date` — 日付または日時。 [Date](../data-types/date.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**返される値**

- 過去の基準点からの週数。 [UInt32](../data-types/int-uint.md)。

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

日付または日時を、過去の特定の基準点から経過した日数に変換します。

**構文**

```sql
toRelativeDayNum(date)
```

**引数**

- `date` — 日付または日時。 [Date](../data-types/date.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**返される値**

- 過去の基準点からの日数。 [UInt32](../data-types/int-uint.md)。

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

日付または日時を、過去の特定の基準点から経過した時間数に変換します。

**構文**

```sql
toRelativeHourNum(date)
```

**引数**

- `date` — 日付または日時。 [Date](../data-types/date.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**返される値**

- 過去の基準点からの時間数。 [UInt32](../data-types/int-uint.md)。

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

日付または日時を、過去の特定の基準点から経過した分数に変換します。

**構文**

```sql
toRelativeMinuteNum(date)
```

**引数**

- `date` — 日付または日時。 [Date](../data-types/date.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**返される値**

- 過去の基準点からの分数。 [UInt32](../data-types/int-uint.md)。

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

日付または日時を、過去の特定の基準点から経過した秒数に変換します。

**構文**

```sql
toRelativeSecondNum(date)
```

**引数**

- `date` — 日付または日時。 [Date](../data-types/date.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**返される値**

- 過去の基準点からの秒数。 [UInt32](../data-types/int-uint.md)。

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

日付または日時を、ISO年を UInt16 型で返します。

**構文**

```sql
toISOYear(value)
```

**引数**

- `value` — 日付または日時の値。 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)

**返される値**

- 入力値をISO年数に変換。 [UInt16](../data-types/int-uint.md)。

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

日付または日時を、ISO週数で UInt8 型の数値に変換します。

**構文**

```sql
toISOWeek(value)
```

**引数**

- `value` — 日付または日時の値。

**返される値**

- 現在のISO週数に変換された `value`。 [UInt8](../data-types/int-uint.md)。

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

この関数は、日付または日時の週番号を返します。2引数形式の `toWeek()`を使うと、週の開始日が日曜日か月曜日か、返される値が0から53の範囲か1から53の範囲かを指定できます。mode 引数を省略すると、デフォルトのモードは 0 です。

`toISOWeek()` は `toWeek(date,3)` と同等の互換性関数です。

mode 引数がどのように機能するかを示す以下の表があります。

| モード | 週の最初の日 | 範囲 | 週 1は ... の最初の週 |
|------|-------------------|-------|-------------------------------|
| 0    | 日曜日            | 0-53  | この年に日曜日がある週    |
| 1    | 月曜日            | 0-53  | この年に4日以上ある週 |
| 2    | 日曜日            | 1-53  | この年に日曜日がある週    |
| 3    | 月曜日            | 1-53  | この年に4日以上ある週 |
| 4    | 日曜日            | 0-53  | この年に4日以上ある週 |
| 5    | 月曜日            | 0-53  | この年に月曜日がある週    |
| 6    | 日曜日            | 1-53  | この年に4日以上ある週 |
| 7    | 月曜日            | 1-53  | この年に月曜日がある週    |
| 8    | 日曜日            | 1-53  | 1月1日を含む            |
| 9    | 月曜日            | 1-53  | 1月1日を含む            |

「この年に4日以上ある週」という意味のモード値の場合、週はISO 8601:1988に従って番号が付けられます:

- 1月1日を含む週が4日以上新年にある場合、それは週1です。

- そうでない場合、それは前の年の最後の週であり、次の週は週1です。

「1月1日を含む」という意味のモード値の場合、1月1日を含む週が週1です。
新年に含まれる日数は関係ありません。たとえ新年に1日しか含まれなくてもかまいません。
すなわち、12月の最後の週が翌年の1月1日を含む場合、それは翌年の週1となります。

**構文**

``` sql
toWeek(t[, mode[, time_zone]])
```

エイリアス: `WEEK`

**引数**

- `t` – 日付または日時。
- `mode` – オプションのパラメータ、範囲の値は \[0,9\]、デフォルトは 0。
- `Timezone` – オプションのパラメータで、他の変換関数と同様に動作します。

最初の引数は [String](../data-types/string.md) としても指定できます。これは [parseDateTime64BestEffort()](type-conversion-functions.md#parsedatetime64besteffort) がサポートする形式です。文字列引数のサポートは、特定の3rdパーティツールが期待するMySQLとの互換性のためだけに存在します。文字列引数のサポートは、将来的に新しいMySQL互換設定に依存する可能性があり、文字列解析は一般的に遅いため、使用しないことをお勧めします。

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

日付に対して年と週を返します。結果の年は、年の最初と最後の週の場合、日付の年と異なる場合があります。

mode 引数は `toWeek()` に対する mode 引数のように機能します。単一引数構文の場合、モード値は 0 が使用されます。

`toISOYear()` は `intDiv(toYearWeek(date,3),100)` と同等の互換性関数です。

:::warning
`toYearWeek()` が返す週番号は、`toWeek()` が返すものとは異なる場合があります。 `toWeek()` は常に、指定された年の文脈における週番号を返し、`toWeek()` が `0` を返す場合、`toYearWeek()` は前の年の最後の週に対応する値を返します。以下の例の `prev_yearWeek` を参照してください。
:::

**構文**

``` sql
toYearWeek(t[, mode[, timezone]])
```

エイリアス: `YEARWEEK`

最初の引数は [String](../data-types/string.md) としても指定できます。これは [parseDateTime64BestEffort()](type-conversion-functions.md#parsedatetime64besteffort) がサポートする形式です。文字列引数のサポートは、特定の3rdパーティツールが期待するMySQLとの互換性のためだけに存在します。文字列引数のサポートは、将来的に新しいMySQL互換設定に依存する可能性があり、文字列解析は一般的に遅いため、使用しないことをお勧めします。

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

指定した日付の、[西暦 0000 年 1 月 1 日](https://en.wikipedia.org/wiki/Year_zero) からの日数を返します。ISO 8601 で定義された [延長グレゴリオ暦](https://en.wikipedia.org/wiki/Gregorian_calendar#Proleptic_Gregorian_calendar)と同じ計算です。この計算は、MySQL の [`TO_DAYS()`](https://dev.mysql.com/doc/refman/8.0/en/date-and-time-functions.html#function_to-days) 関数と同様です。

**構文**

``` sql
toDaysSinceYearZero(date[, time_zone])
```

エイリアス: `TO_DAYS`

**引数**

- `date` — 年ゼロから経過した日数を計算する日付。[Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)。
- `time_zone` — タイムゾーンを表す文字列型定数値または式。[String types](../data-types/string.md)

**返される値**

日付 0000-01-01 から経過した日数。[UInt32](../data-types/int-uint.md)。

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
```
```yaml
title: '日付と時間の関数'
sidebar_label: '日付と時間の関数'
keywords: 'ClickHouse, 日付, 時間, クエリ'
description: 'ClickHouseで使用される日付と時間に関連する関数のリファレンスです。'
```

## fromDaysSinceYearZero {#fromdayssinceyearzero}

[1 January 0000](https://en.wikipedia.org/wiki/Year_zero) から経過した日数に対する、[ISO 8601 によって定義された先行 Gregorian calendar](https://en.wikipedia.org/wiki/Gregorian_calendar#Proleptic_Gregorian_calendar) の対応する日付を返します。計算は MySQL の [`FROM_DAYS()`](https://dev.mysql.com/doc/refman/8.0/en/date-and-time-functions.html#function_from-days) 関数と同じです。

**結果は、[Date](../data-types/date.md) 型の範囲内で表現できない場合は未定義です。**

**構文**

``` sql
fromDaysSinceYearZero(days)
```

エイリアス: `FROM_DAYS`

**引数**

- `days` — 年ゼロから経過した日数。

**返される値**

年ゼロから経過した日数に対応する日付。 [Date](../data-types/date.md)。

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

**も参照**

- [toDaysSinceYearZero](#todayssinceyearzero)

## fromDaysSinceYearZero32 {#fromdayssinceyearzero32}

[fromDaysSinceYearZero](#fromdayssinceyearzero) と同様ですが、[Date32](../data-types/date32.md) を返します。

## age {#age}

`startdate` と `enddate` の間の差の `unit` コンポーネントを返します。差は1ナノ秒の精度で計算されます。
例えば、`2021-12-29` と `2022-01-01` の違いは、`day` 単位で3日、`month` 単位で0ヶ月、`year` 単位で0年です。

`age` の代替として `date_diff` 関数を参照してください。

**構文**

``` sql
age('unit', startdate, enddate, [timezone])
```

**引数**

- `unit` — 結果の間隔のタイプ。 [String](../data-types/string.md)。
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

- `startdate` — 引き算の最初の時間値（被減数）。 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)。

- `enddate` — 引き算の第二の時間値（減数）。 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)。

- `timezone` — [タイムゾーン名](../../operations/server-configuration-parameters/settings.md#timezone) （オプション）。指定された場合、`startdate` と `enddate` の両方に適用されます。指定されない場合は、`startdate` と `enddate` のタイムゾーンが使用されます。異なる場合、結果は未定義です。 [String](../data-types/string.md)。

**返される値**

`enddate` と `startdate` の違いを `unit` で表した値。 [Int](../data-types/int-uint.md)。

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

`startdate` と `enddate` の間に交差する指定された `unit` 境界の数を返します。
差は相対単位を使用して計算されます。例えば、`2021-12-29` と `2022-01-01` の違いは、単位 `day` では3日（[toRelativeDayNum](#torelativedaynum)を参照）、単位 `month` では1ヶ月（[toRelativeMonthNum](#torelativemonthnum)を参照）、単位 `year` では1年（[toRelativeYearNum](#torelativeyearnum)を参照）です。

単位 `week` が指定された場合、`date_diff` は週が月曜日から始まると仮定します。この動作は、週がデフォルトで日曜日から始まる `toWeek()` 関数とは異なります。

`date_diff` の代替として、`age` 関数を参照してください。

**構文**

``` sql
date_diff('unit', startdate, enddate, [timezone])
```

エイリアス: `dateDiff`, `DATE_DIFF`, `timestampDiff`, `timestamp_diff`, `TIMESTAMP_DIFF`.

**引数**

- `unit` — 結果の間隔のタイプ。 [String](../data-types/string.md)。
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

- `startdate` — 引き算の最初の時間値（被減数）。 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)。

- `enddate` — 引き算の第二の時間値（減数）。 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)。

- `timezone` — [タイムゾーン名](../../operations/server-configuration-parameters/settings.md#timezone) （オプション）。指定された場合、`startdate` と `enddate` の両方に適用されます。指定されない場合は、`startdate` と `enddate` のタイムゾーンが使用されます。異なる場合、結果は未定義です。 [String](../data-types/string.md)。

**返される値**

`enddate` と `startdate` の違いを `unit` で表した値。 [Int](../data-types/int-uint.md)。

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

日付と時間データを指定された日付の部分に切り捨てます。

**構文**

``` sql
date_trunc(unit, value[, timezone])
```

エイリアス: `dateTrunc`.

**引数**

- `unit` — 結果を切り捨てる間隔のタイプ。 [String Literal](/sql-reference/syntax#string)。
    可能な値:

    - `nanosecond` - DateTime64 のみと互換性があります
    - `microsecond` - DateTime64 のみと互換性があります
    - `milisecond` - DateTime64 のみと互換性があります
    - `second`
    - `minute`
    - `hour`
    - `day`
    - `week`
    - `month`
    - `quarter`
    - `year`

    `unit` 引数は大文字小文字を区別しません。

- `value` — 日付と時間。 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)。

- `timezone` — 返される値のタイムゾーン名（オプション）。指定されない場合、関数は `value` パラメーターのタイムゾーンを使用します。 [String](../data-types/string.md)。

**返される値**

- 指定された日付の部分に切り捨てられた値。 [DateTime](../data-types/datetime.md)。

**例**

タイムゾーンなしのクエリ:

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

**も参照**

- [toStartOfInterval](#tostartofinterval)

## date\_add {#date_add}

提供された日付または日付と時間に、時間間隔または日付間隔を追加します。

追加の結果がデータ型の範囲を超える場合、結果は未定義です。

**構文**

``` sql
date_add(unit, value, date)
```

代替構文:

``` sql
date_add(date, INTERVAL value unit)
```

エイリアス: `dateAdd`, `DATE_ADD`.

**引数**

- `unit` — 追加する間隔のタイプ。これは [String](../data-types/string.md) ではなく、引用符で囲まない必要があります。
    可能な値:

    - `second`
    - `minute`
    - `hour`
    - `day`
    - `week`
    - `month`
    - `quarter`
    - `year`

- `value` — 追加する間隔の値。 [Int](../data-types/int-uint.md)。

- `date` — `value` が追加される日付または日付と時間。 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)。

**返される値**

`value` を `unit` で表した日付または日付と時間を `date` に追加した結果。 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)。

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

**も参照**

- [addDate](#adddate)

## date\_sub {#date_sub}

提供された日付または日付と時間から、時間間隔または日付間隔を引き算します。

引き算の結果がデータ型の範囲を超える場合、結果は未定義です。

**構文**

``` sql
date_sub(unit, value, date)
```

代替構文:

``` sql
date_sub(date, INTERVAL value unit)
```

エイリアス: `dateSub`, `DATE_SUB`.

**引数**

- `unit` — 引き算する間隔のタイプ。これは [String](../data-types/string.md) ではなく、引用符で囲まない必要があります。

    可能な値:

    - `second`
    - `minute`
    - `hour`
    - `day`
    - `week`
    - `month`
    - `quarter`
    - `year`

- `value` — 引き算する間隔の値。 [Int](../data-types/int-uint.md)。

- `date` — `value` が引き算される日付または日付と時間。 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)。

**返される値**

`value` を `unit` で表した日付または日付と時間から `date` を引き算した結果。 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)。

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

**も参照**

- [subDate](#subdate)

## timestamp\_add {#timestamp_add}

指定された時間値を提供された日付または日付 時間値に追加します。

追加の結果がデータ型の範囲を超える場合、結果は未定義です。

**構文**

``` sql
timestamp_add(date, INTERVAL value unit)
```

エイリアス: `timeStampAdd`, `TIMESTAMP_ADD`.

**引数**

- `date` — 日付または日付と時間。 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)。

- `value` — 追加する間隔の値。 [Int](../data-types/int-uint.md)。

- `unit` — 追加する間隔のタイプ。 [String](../data-types/string.md)。
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

指定された `value` を `unit` で表した内容を `date` に追加した日付または日付と時間。 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)。

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

指定された間隔を提供された日付または日付と時間から引き算します。

引き算の結果がデータ型の範囲を超える場合、結果は未定義です。

**構文**

``` sql
timestamp_sub(unit, value, date)
```

エイリアス: `timeStampSub`, `TIMESTAMP_SUB`.

**引数**

- `unit` — 引き算する間隔のタイプ。 [String](../data-types/string.md)。
    可能な値:

    - `second`
    - `minute`
    - `hour`
    - `day`
    - `week`
    - `month`
    - `quarter`
    - `year`

- `value` — 引き算する間隔の値。 [Int](../data-types/int-uint.md)。

- `date` — 日付または日付と時間。 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)。

**返される値**

`value` を `unit` で表した内容を `date` から引き算した日付または日付と時間。 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)。

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

提供された日付、日付と時間または文字列で表現された日付に時間間隔を追加します。

追加の結果がデータ型の範囲を超える場合、結果は未定義です。

**構文**

``` sql
addDate(date, interval)
```

**引数**

- `date` — `interval` が追加される日付または日付と時間。 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)、[DateTime64](../data-types/datetime64.md)、または [String](../data-types/string.md)

- `interval` — 追加する間隔。 [Interval](../data-types/special-data-types/interval.md)。

**返される値**

`date` に `interval` を追加した結果の日付または日付と時間。 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)。

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

**も参照**

- [date_add](#date_add)

## subDate {#subdate}

提供された日付、日付と時間または文字列で表現された日付から時間間隔を引き算します。

引き算の結果がデータ型の範囲を超える場合、結果は未定義です。

**構文**

``` sql
subDate(date, interval)
```

**引数**

- `date` — `interval` が引き算される日付または日付と時間。 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)、[DateTime64](../data-types/datetime64.md)、または [String](../data-types/string.md)

- `interval` — 引き算する間隔。 [Interval](../data-types/special-data-types/interval.md)。

**返される値**

`date` から `interval` を引き算した結果の日付または日付と時間。 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)。

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

**も参照**

- [date_sub](#date_sub)

## now {#now}

クエリ分析の瞬間における現在の日付と時間を返します。この関数は定数式です。

エイリアス: `current_timestamp`.

**構文**

``` sql
now([timezone])
```

**引数**

- `timezone` — 返される値のタイムゾーン名（オプション）。 [String](../data-types/string.md)。

**返される値**

- 現在の日付と時間。 [DateTime](../data-types/datetime.md)。

**例**

タイムゾーンなしのクエリ:

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

クエリ分析の瞬間におけるサブ秒精度の現在の日付と時間を返します。この関数は定数式です。

**構文**

``` sql
now64([scale], [timezone])
```

**引数**

- `scale` - ティックサイズ（精度）：10<sup>-precision</sup>秒。有効範囲: [ 0 : 9 ]。通常使用されるのは - 3（デフォルト）（ミリ秒）、6（マイクロ秒）、9（ナノ秒）です。

- `timezone` — 返される値のタイムゾーン名（オプション）。 [String](../data-types/string.md)。

**返される値**

- サブ秒精度の現在の日付と時間。 [DateTime64](../data-types/datetime64.md)。

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

各データブロックの処理の瞬間における現在の日付と時間を返します。[now](#now) 関数とは異なり、これは定数式ではなく、長時間のクエリでは異なるブロックで返される値が異なります。

この関数は、長時間の INSERT SELECT クエリで現在の時刻を生成するために使うのが最適です。

**構文**

``` sql
nowInBlock([timezone])
```

**引数**

- `timezone` — 返される値のタイムゾーン名（オプション）。 [String](../data-types/string.md)。

**返される値**

- 各データブロックの処理の瞬間における現在の日付と時間。 [DateTime](../data-types/datetime.md)。

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

クエリ分析の瞬間における現在の日付を返します。これは 'toDate(now())' と同じで、エイリアス: `curdate`, `current_date` があります。

**構文**

```sql
today()
```

**引数**

- なし

**返される値**

- 現在の日付。 [DateTime](../data-types/datetime.md)。

**例**

クエリ:

```sql
SELECT today() AS today, curdate() AS curdate, current_date() AS current_date FORMAT Pretty
```

**結果**:

2024年3月3日に上記のクエリを実行すると、以下の結果が返されます:

```response
┏━━━━━━━━━━━━┳━━━━━━━━━━━━┳━━━━━━━━━━━━━━┓
┃      today ┃    curdate ┃ current_date ┃
┡━━━━━━━━━━━━╇━━━━━━━━━━━━╇━━━━━━━━━━━━━━┩
│ 2024-03-03 │ 2024-03-03 │   2024-03-03 │
└────────────┴────────────┴──────────────┘
```

## yesterday {#yesterday}

引数はゼロで、クエリ分析の瞬間に昨日の日付を返します。
'today() - 1' と同じです。

## timeSlot {#timeslot}

時間を30分の長さの間隔に切り上げます。

**構文**

```sql
timeSlot(time[, time_zone])
```

**引数**

- `time` — 30分の長さの間隔の開始に切り上げる時間。 [DateTime](../data-types/datetime.md)/[Date32](../data-types/date32.md)/[DateTime64](../data-types/datetime64.md)。
- `time_zone` — タイムゾーンを表す文字列型定数値または式。 [String](../data-types/string.md)。

:::note
この関数は、`Date32` と `DateTime64` の拡張型の値を引数として受け取ることができますが、通常の範囲（`Date` 用の1970年から2149年 / `DateTime` 用の2106年）を超える時間を渡すと間違った結果を生成します。
:::

**戻り値の型**

- 30分の長さの間隔の開始に切り上げられた時間を返します。 [DateTime](../data-types/datetime.md)。

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

日付または日付と時間を年と月の番号を含む UInt32 数（YYYY * 100 + MM）に変換します。第二のオプショナルタイムゾーン引数を受け取ります。提供された場合、タイムゾーンは文字列定数でなければなりません。

この関数は `YYYYMMDDToDate()` 関数の逆です。

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

日付または日付と時間を年、月、日の番号を含む UInt32 数（YYYY * 10000 + MM * 100 + DD）に変換します。第二のオプショナルタイムゾーン引数を受け取ります。提供された場合、タイムゾーンは文字列定数でなければなりません。

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

日付または日付と時間を年、月、日、時、分、秒の番号を含む UInt64 数（YYYY * 10000000000 + MM * 100000000 + DD * 1000000 + hh * 10000 + mm * 100 + ss）に変換します。第二のオプショナルタイムゾーン引数を受け取ります。提供された場合、タイムゾーンは文字列定数でなければなりません。

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

年、月、日を含む数を [Date](../data-types/date.md) に変換します。

この関数は `toYYYYMMDD()` 関数の逆です。

入力が有効な Date 値をエンコードしていない場合、出力は未定義になります。

**構文**

```sql
YYYYMMDDToDate(yyyymmdd);
```

**引数**

- `yyyymmdd` - 年、月、日を表す数。 [Integer](../data-types/int-uint.md)、[Float](../data-types/float.md) または [Decimal](../data-types/decimal.md)。

**返される値**

- 引数から作成された日付。 [Date](../data-types/date.md)。

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

`YYYYMMDDToDate()` 関数と同様ですが、[Date32](../data-types/date32.md) を生成します。

## YYYYMMDDhhmmssToDateTime {#yyyymmddhhmmsstodatetime}

年、月、日、時、分、秒の番号を含む数を [DateTime](../data-types/datetime.md) に変換します。

入力が有効な DateTime 値をエンコードしていない場合、出力は未定義になります。

この関数は `toYYYYMMDDhhmmss()` 関数の逆です。

**構文**

```sql
YYYYMMDDhhmmssToDateTime(yyyymmddhhmmss[, timezone]);
```

**引数**

- `yyyymmddhhmmss` - 年、月、日、時、分、秒を表す数。 [Integer](../data-types/int-uint.md)、[Float](../data-types/float.md) または [Decimal](../data-types/decimal.md)。

- `timezone` - 返される値のための [タイムゾーン](../../operations/server-configuration-parameters/settings.md#timezone) （オプション）。

**返される値**

- 引数から作成された日付と時間。 [DateTime](../data-types/datetime.md)。

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

`YYYYMMDDhhmmssToDate()` 関数と同様ですが、[DateTime64](../data-types/datetime64.md) を生成します。

追加のオプショナルな `precision` パラメーターを、`timezone` パラメーターの後に受け取ります。

## changeYear {#changeyear}

日付または日付 時間の年のコンポーネントを変更します。

**構文**
``` sql

changeYear(date_or_datetime, value)
```

**引数**

- `date_or_datetime` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)
- `value` - 年の新しい値。 [Integer](../../sql-reference/data-types/int-uint.md)。

**返される値**

- `date_or_datetime` と同じ型。

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

日付または日付 時間の月のコンポーネントを変更します。

**構文**

``` sql
changeMonth(date_or_datetime, value)
```

**引数**

- `date_or_datetime` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)
- `value` - 月の新しい値。 [Integer](../../sql-reference/data-types/int-uint.md)。

**返される値**

- `date_or_datetime` と同じ型の値を返します。

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

日付または日付 時間の日のコンポーネントを変更します。

**構文**

``` sql
changeDay(date_or_datetime, value)
```

**引数**

- `date_or_datetime` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)
- `value` - 日の新しい値。 [Integer](../../sql-reference/data-types/int-uint.md)。

**返される値**

- `date_or_datetime` と同じ型の値を返します。

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

日付または日付時刻の時間コンポーネントを変更します。

**構文**

``` sql
changeHour(date_or_datetime, value)
```

**引数**

- `date_or_datetime` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)、または [DateTime64](../data-types/datetime64.md)
- `value` - 時間の新しい値。[Integer](../../sql-reference/data-types/int-uint.md)。

**戻り値**

- `date_or_datetime` と同じ型の値を返します。入力が [Date](../data-types/date.md) の場合は [DateTime](../data-types/datetime.md) を返します。入力が [Date32](../data-types/date32.md) の場合は [DateTime64](../data-types/datetime64.md) を返します。

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

日付または日付時刻の分コンポーネントを変更します。

**構文**

``` sql
changeMinute(date_or_datetime, value)
```

**引数**

- `date_or_datetime` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)、または [DateTime64](../data-types/datetime64.md)
- `value` - 分の新しい値。[Integer](../../sql-reference/data-types/int-uint.md)。

**戻り値**

- `date_or_datetime` と同じ型の値を返します。入力が [Date](../data-types/date.md) の場合は [DateTime](../data-types/datetime.md) を返します。入力が [Date32](../data-types/date32.md) の場合は [DateTime64](../data-types/datetime64.md) を返します。

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

日付または日付時刻の秒コンポーネントを変更します。

**構文**

``` sql
changeSecond(date_or_datetime, value)
```

**引数**

- `date_or_datetime` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)、または [DateTime64](../data-types/datetime64.md)
- `value` - 秒の新しい値。[Integer](../../sql-reference/data-types/int-uint.md)。

**戻り値**

- `date_or_datetime` と同じ型の値を返します。入力が [Date](../data-types/date.md) の場合は [DateTime](../data-types/datetime.md) を返します。入力が [Date32](../data-types/date32.md) の場合は [DateTime64](../data-types/datetime64.md) を返します。

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

指定された年数を日付、日付時刻、または文字列エンコードされた日付/日付時刻に追加します。

**構文**

```sql
addYears(date, num)
```

**引数**

- `date`: 指定された年数を追加する日付/日付時刻。[Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 追加する年数。[(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**戻り値**

- `date` に `num` 年を追加します。[Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

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

指定された四半期数を日付、日付時刻、または文字列エンコードされた日付/日付時刻に追加します。

**構文**

```sql
addQuarters(date, num)
```

**引数**

- `date`: 指定された四半期数を追加する日付/日付時刻。[Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 追加する四半期数。[(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**戻り値**

- `date` に `num` 四半期を追加します。[Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

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

指定された月数を日付、日付時刻、または文字列エンコードされた日付/日付時刻に追加します。

**構文**

```sql
addMonths(date, num)
```

**引数**

- `date`: 指定された月数を追加する日付/日付時刻。[Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 追加する月数。[(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**戻り値**

- `date` に `num` ヶ月を追加します。[Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

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

指定された週数を日付、日付時刻、または文字列エンコードされた日付/日付時刻に追加します。

**構文**

```sql
addWeeks(date, num)
```

**引数**

- `date`: 指定された週数を追加する日付/日付時刻。[Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 追加する週数。[(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**戻り値**

- `date` に `num` 週を追加します。[Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

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

指定された日数を日付、日付時刻、または文字列エンコードされた日付/日付時刻に追加します。

**構文**

```sql
addDays(date, num)
```

**引数**

- `date`: 指定された日数を追加する日付/日付時刻。[Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 追加する日数。[(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**戻り値**

- `date` に `num` 日を追加します。[Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

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

指定された時間数を日付、日付時刻、または文字列エンコードされた日付/日付時刻に追加します。

**構文**

```sql
addHours(date, num)
```

**引数**

- `date`: 指定された時間数を追加する日付/日付時刻。[Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 追加する時間数。[(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**戻り値**

- `date` に `num` 時間を追加します。[Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

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

指定された分数を日付、日付時刻、または文字列エンコードされた日付/日付時刻に追加します。

**構文**

```sql
addMinutes(date, num)
```

**引数**

- `date`: 指定された分数を追加する日付/日付時刻。[Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 追加する分数。[(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**戻り値**

- `date` に `num` 分を追加します。[Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

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

指定された秒数を日付、日付時刻、または文字列エンコードされた日付/日付時刻に追加します。

**構文**

```sql
addSeconds(date, num)
```

**引数**

- `date`: 指定された秒数を追加する日付/日付時刻。[Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 追加する秒数。[(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**戻り値**

- `date` に `num` 秒を追加します。[Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

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

指定されたミリ秒数を日付時刻、または文字列エンコードされた日付時刻に追加します。

**構文**

```sql
addMilliseconds(date_time, num)
```

**引数**

- `date_time`: 指定されたミリ秒数を追加する日付時刻。[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 追加するミリ秒数。[(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**戻り値**

- `date_time` に `num` ミリ秒を追加します。[DateTime64](../data-types/datetime64.md)。

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

指定されたマイクロ秒数を日付時刻、または文字列エンコードされた日付時刻に追加します。

**構文**

```sql
addMicroseconds(date_time, num)
```

**引数**

- `date_time`: 指定されたマイクロ秒数を追加する日付時刻。[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 追加するマイクロ秒数。[(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**戻り値**

- `date_time` に `num` マイクロ秒を追加します。[DateTime64](../data-types/datetime64.md)。

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

指定されたナノ秒数を日付時刻、または文字列エンコードされた日付時刻に追加します。

**構文**

```sql
addNanoseconds(date_time, num)
```

**引数**

- `date_time`: 指定されたナノ秒数を追加する日付時刻。[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 追加するナノ秒数。[(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**戻り値**

- `date_time` に `num` ナノ秒を追加します。[DateTime64](../data-types/datetime64.md)。

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

他の間隔または間隔のタプルに間隔を追加します。

**構文**

```sql
addInterval(interval_1, interval_2)
```

**引数**

- `interval_1`: 最初の間隔または間隔のタプル。[interval](../data-types/special-data-types/interval.md)、[tuple](../data-types/tuple.md)([interval](../data-types/special-data-types/interval.md))。
- `interval_2`: 追加される2番目の間隔。[interval](../data-types/special-data-types/interval.md)。

**戻り値**

- 間隔のタプルを返します。[tuple](../data-types/tuple.md)([interval](../data-types/special-data-types/interval.md))。

:::note
同じタイプの間隔は1つの間隔に結合されます。たとえば、`toIntervalDay(1)` と `toIntervalDay(2)` を渡すと、結果は `(3)` になります。 `(1,1)` ではありません。
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

日付または日付時刻に間隔のタプルを逐次追加します。

**構文**

```sql
addTupleOfIntervals(interval_1, interval_2)
```

**引数**

- `date`: 最初の間隔または間隔のタプル。[date](../data-types/date.md)/[date32](../data-types/date32.md)/[datetime](../data-types/datetime.md)/[datetime64](../data-types/datetime64.md)。
- `intervals`: `date` に追加する間隔のタプル。[tuple](../data-types/tuple.md)([interval](../data-types/special-data-types/interval.md))。

**戻り値**

- `intervals` が追加された `date` を返します。[date](../data-types/date.md)/[date32](../data-types/date32.md)/[datetime](../data-types/datetime.md)/[datetime64](../data-types/datetime64.md)。

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

日付、日付時刻、または文字列エンコードされた日付/日付時刻から指定された年数を減算します。

**構文**

```sql
subtractYears(date, num)
```

**引数**

- `date`: 指定された年数を減算する日付/日付時刻。[Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 減算する年数。[(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**戻り値**

- `date` から `num` 年を引きます。[Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

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

日付、日付時刻、または文字列エンコードされた日付/日付時刻から指定された四半期数を減算します。

**構文**

```sql
subtractQuarters(date, num)
```

**引数**

- `date`: 指定された四半期数を減算する日付/日付時刻。[Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 減算する四半期数。[(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**戻り値**

- `date` から `num` 四半期を引きます。[Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

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

日付、日付時刻、または文字列エンコードされた日付/日付時刻から指定された月数を減算します。

**構文**

```sql
subtractMonths(date, num)
```

**引数**

- `date`: 指定された月数を減算する日付/日付時刻。[Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 減算する月数。[(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**戻り値**

- `date` から `num` ヶ月を引きます。[Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

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

日付、日付時刻、または文字列エンコードされた日付/日付時刻から指定された週数を減算します。

**構文**

```sql
subtractWeeks(date, num)
```

**引数**

- `date`: 指定された週数を減算する日付/日付時刻。[Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 減算する週数。[(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**戻り値**

- `date` から `num` 週を引きます。[Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

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

日付、日付時刻、または文字列エンコードされた日付/日付時刻から指定された日数を減算します。

**構文**

```sql
subtractDays(date, num)
```

**引数**

- `date`: 指定された日数を減算する日付/日付時刻。[Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 減算する日数。[(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**戻り値**

- `date` から `num` 日を引きます。[Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

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

日付、日付時刻、または文字列エンコードされた日付/日付時刻から指定された時間数を減算します。

**構文**

```sql
subtractHours(date, num)
```

**引数**

- `date`: 指定された時間数を減算する日付/日付時刻。[Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[Datetime](../data-types/datetime.md)/[Datetime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 減算する時間数。[(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**戻り値**

- `date` から `num` 時間を引きます。[Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[Datetime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

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
```yaml
title: 'subtract, formatDateTime, and date functions'
sidebar_label: '日付関数'
keywords:
  - subtract
  - formatDateTime
  - date functions
description: 'Subtracts specific time intervals and formats date and time in ClickHouse.'
```

## subtractMinutes {#subtractminutes}

指定された分数を日付、時間付きの日付、または文字列形式の日付/時間から減算します。

**構文**

```sql
subtractMinutes(date, num)
```

**パラメータ**

- `date`: 指定された分数を減算する日付/時間付きの日付。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 減算する分数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

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

指定された秒数を日付、時間付きの日付、または文字列形式の日付/時間から減算します。

**構文**

```sql
subtractSeconds(date, num)
```

**パラメータ**

- `date`: 指定された秒数を減算する日付/時間付きの日付。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 減算する秒数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

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

指定されたミリ秒数を時間付きの日付、または文字列形式の時間付きの日付から減算します。

**構文**

```sql
subtractMilliseconds(date_time, num)
```

**パラメータ**

- `date_time`: 指定されたミリ秒数を減算する時間付きの日付。 [DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 減算するミリ秒数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

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

指定されたマイクロ秒数を時間付きの日付、または文字列形式の時間付きの日付から減算します。

**構文**

```sql
subtractMicroseconds(date_time, num)
```

**パラメータ**

- `date_time`: 指定されたマイクロ秒数を減算する時間付きの日付。 [DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 減算するマイクロ秒数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

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

指定されたナノ秒数を時間付きの日付、または文字列形式の時間付きの日付から減算します。

**構文**

```sql
subtractNanoseconds(date_time, num)
```

**パラメータ**

- `date_time`: 指定されたナノ秒数を減算する時間付きの日付。 [DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 減算するナノ秒数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

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

他のインターバルまたはインターバルのタプルに否定されたインターバルを加算します。

**構文**

```sql
subtractInterval(interval_1, interval_2)
```

**パラメータ**

- `interval_1`: 最初のインターバルまたはタプルのインターバル。 [interval](../data-types/special-data-types/interval.md)、[tuple](../data-types/tuple.md)([interval](../data-types/special-data-types/interval.md))。
- `interval_2`: 否定される第2のインターバル。 [interval](../data-types/special-data-types/interval.md)。

**返される値**

- インターバルのタプルを返します。 [tuple](../data-types/tuple.md)([interval](../data-types/special-data-types/interval.md))。

:::note
同じタイプのインターバルは1つのインターバルに結合されます。例えば、`toIntervalDay(2)` と `toIntervalDay(1)` が渡された場合、結果は `(1)` になります。
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

タプルのインターバルを日付または日時から逐次減算します。

**構文**

```sql
subtractTupleOfIntervals(interval_1, interval_2)
```

**パラメータ**

- `date`: 最初のインターバルまたはタプルのインターバル。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。
- `intervals`: `date` から減算するインターバルのタプル。 [tuple](../data-types/tuple.md)([interval](../data-types/special-data-types/interval.md))。

**返される値**

- 減算された `intervals` を持つ `date` を返します。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

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

'StartTime' から開始し、'Duration' 秒間続く時間間隔に対して、この間隔を 'Size' 秒に切り捨てた時間の点の配列を返します。 'Size' は省略可能なパラメータで、デフォルトは1800（30分）です。
これは、例えば、対応するセッション内のページビューを検索する際に必要です。
'StartTime' 引数として DateTime と DateTime64 を受け取ります。 DateTime の場合、'Duration' と 'Size' 引数は `UInt32` でなければなりません。 'DateTime64' の場合、それらは `Decimal64` でなければなりません。
DateTime/DateTime64 の配列を返します（返り値の型は 'StartTime' の型と一致します）。 DateTime64 の場合、返り値のスケールは 'StartTime' のスケールと異なる場合があります --- 与えられたすべての引数の中で最高のスケールが採用されます。

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

指定されたフォーマット文字列に従って時間をフォーマットします。フォーマットは定数式であるため、単一の結果列に対して複数のフォーマットを持つことはできません。

formatDateTime は MySQL の日時フォーマットスタイルを使用します。詳細は https://dev.mysql.com/doc/refman/8.0/en/date-and-time-functions.html#function_date-format を参照してください。

この関数の逆操作は [parseDateTime](/sql-reference/functions/type-conversion-functions#parsedatetime) です。

エイリアス: `DATE_FORMAT`.

**構文**

``` sql
formatDateTime(Time, Format[, Timezone])
```

**返される値**

決定されたフォーマットに従った時間と日付の値を返します。

**置換フィールド**

置換フィールドを使用して、結果の文字列のパターンを定義できます。「例」カラムは `2018-01-02 22:33:44` のフォーマット結果を示しています。

| プレースホルダー | 説明                                                                                                                                                                                         | 例         |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------|
| %a       | 省略された曜日名 (月曜日-日曜日)                                                                                                                                                                   | Mon       |
| %b       | 省略された月名 (1月-12月)                                                                                                                                                                  | Jan       |
| %c       | 整数で表された月 (01-12)、下記の「注 4」を参照                                                                                                                                              | 01        |
| %C       | 100で割って整数に切り捨てた年 (00-99)                                                                                                                                                | 20        |
| %d       | ゼロパディングされた月の日 (01-31)                                                                                                                                                               | 02        |
| %D       | 短縮されたMM/DD/YY形式の日付で、%m/%d/%y と等しい                                                                                                                                     | 01/02/18  |
| %e       | スペースパディングされた月の日 (1-31)                                                                                                                                                               | &nbsp; 2  |
| %f       | 小数秒、下記の「注 1」及び「注 2」を参照                                                                                                                                                  | 123456    |
| %F       | 短縮されたYYYY-MM-DD形式の日付で、%Y-%m-%d と等しい                                                                                                                                     | 2018-01-02 |
| %g       | ISO 8601に準拠した2桁の年形式で、4桁の表記から省略されたもの                                                                                              | 18       |
| %G       | ISO週番号用の4桁の年形式、ISO 8601で定義された週ベースの年から計算される、通常は%Vと共に使用される                                                                                         | 2018      |
| %h       | 12時間形式の時 (01-12)                                                                                                                                                                   | 09        |
| %H       | 24時間形式の時 (00-23)                                                                                                                                                                   | 22        |
| %i       | 分 (00-59)                                                                                                                                                                               | 33        |
| %I       | 12時間形式の時 (01-12)                                                                                                                                                                   | 10        |
| %j       | 年の日 (001-366)                                                                                                                                                                           | 002       |
| %k       | 24時間形式の時 (00-23)、下記の「注 4」を参照                                                                                                                                             | 14        |
| %l       | 12時間形式の時 (01-12)、下記の「注 4」を参照                                                                                                                                             | 09        |
| %m       | 整数で表された月 (01-12)                                                                                                                                                                  | 01        |
| %M       | 月の完全な名前 (1月-12月)、下記の「注 3」を参照                                                                                                                                           | January   |
| %n       | 改行文字 ('')                                                                                                                                                                                |           |
| %p       | AMまたはPMの指定                                                                                                                                                                              | PM        |
| %Q       | 四半期 (1-4)                                                                                                                                                                                 | 1         |
| %r       | 12時間形式のHH:MM AM/PM時間、%h:%i %pと等しい                                                                                                                                               | 10:30 PM  |
| %R       | 24時間形式のHH:MM時間、%H:%iと等しい                                                                                                                                                          | 22:33     |
| %s       | 秒 (00-59)                                                                                                                                                                                 | 44        |
| %S       | 秒 (00-59)                                                                                                                                                                                 | 44        |
| %t       | 水平タブ文字 (')                                                                                                                                                                            |           |
| %T       | ISO 8601時間形式 (HH:MM:SS)、%H:%i:%Sと等しい                                                                                                                                                 | 22:33:44  |
| %u       | 月曜日を1とするISO 8601に準拠した曜日 (1-7)                                                                                                                                                     | 2         |
| %V       | ISO 8601週番号 (01-53)                                                                                                                                                                      | 01        |
| %w       | 日曜日を0とする整数で表された曜日 (0-6)                                                                                                                                               | 2         |
| %W       | 完全な曜日名 (月曜日-日曜日)                                                                                                                                                                   | Monday    |
| %y       | 年の下2桁 (00-99)                                                                                                                                                                    | 18        |
| %Y       | 年                                                                                                                                                                                                    | 2018      |
| %z       | UTCからの時間オフセットを +HHMM または -HHMM で表現                                                                                                                                             | -0500     |
| %%       | %記号                                                                                                                                                                                                | %         |

注 1: ClickHouseバージョン23.4未満では、%f は日付、Date32、DateTime（小数秒がない場合）または精度が0のDateTime64の場合は単一のゼロ (0) を出力します。以前の挙動は設定 `formatdatetime_f_prints_single_zero = 1` を使用して復元できます。

注 2: ClickHouseバージョン25.1未満では、%f はDateTime64のスケールが指定した桁数に応じて出力されます。以前の挙動は設定 `formatdatetime_f_prints_scale_number_of_digits= 1`を用いて復元できます。

注 3: ClickHouseバージョン23.4未満では、%M は完全な月名 (1月-12月) ではなく分 (00-59) を出力します。以前の挙動は設定 `formatdatetime_parsedatetime_m_is_month_name = 0` を使用して復元できます。

注 4: ClickHouseバージョン23.11未満では、関数 `parseDateTime()` はフォーマッタ %c（間隔）と %l/%k（時）に対し、先頭にゼロを必要としました（例: `07`）。以降のバージョンでは先頭のゼロを省略できます（例: `7`）。以前の挙動は設定 `parsedatetime_parse_without_leading_zeros = 0` を使って復元できます。関数 `formatDateTime()` は、デフォルトで%0と%l/%kに対し、既存の使用ケースを崩さないように先頭ゼロを出力します。この挙動は設定 `formatdatetime_format_without_leading_zeros = 1` で変更できます。

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

さらに、`formatDateTime` 関数には、タイムゾーンの名前を含む第三の文字列引数を与えることができます。例: `Asia/Istanbul`。この場合、時間は指定されたタイムゾーンに従ってフォーマットされます。

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

formatDateTimeと似ていますが、MySQLスタイルではなくJodaスタイルで日時をフォーマットします。 https://joda-time.sourceforge.net/apidocs/org/joda/time/format/DateTimeFormat.html を参照してください。

この関数の逆操作は [parseDateTimeInJodaSyntax](/sql-reference/functions/type-conversion-functions#parsedatetimeinjodasyntax) です。

**置換フィールド**

置換フィールドを使用して、結果の文字列のパターンを定義できます。

| プレースホルダー | 説明                              | 表示                       | 例                                |
| ----------- | ----------------------------------------- | ------------------------ | --------------------------------- |
| G           | 時代                                      | テキスト                  | AD                                |
| C           | 時代の世紀 (>=0)                          | 数字                     | 20                                |
| Y           | 時代の年 (>=0)                          | 年                        | 1996                              |
| x           | 週年 (未サポート)                          | 年                        | 1996                              |
| w           | 週年の週 (未サポート)                 | 数字                    | 27                                |
| e           | 曜日                                   | 数字                    | 2                                 |
| E           | 曜日                                   | テキスト                 | Tuesday; Tue                      |
| y           | 年                                     | 年                        | 1996                              |
| D           | 年の日                                 | 数字                    | 189                               |
| M           | 年の月                                 | 月                        | July; Jul; 07                     |
| d           | 月の日                                 | 数字                    | 10                                |
| a           | 日の半分                               | テキスト                 | PM                                |
| K           | 半日の時 (0~11)                           | 数字                    | 0                                 |
| h           | 半日の時 (1~12)                          | 数字                    | 12                                |
| H           | 一日の時 (0~23)                        | 数字                    | 0                                 |
| k           | 一日の時 (1~24)                          | 数字                    | 24                                |
| m           | 時の分                                 | 数字                    | 30                                |
| s           | 分の秒                                 | 数字                    | 55                                |
| S           | 秒の小数                                 | 数字                    | 978                               |
| z           | タイムゾーン                             | テキスト                 | Eastern Standard Time; EST         |
| Z           | タイムゾーンオフセット                  | ゾーン                     | -0800; -0812                      |
| '           | テキストのエスケープ                     | デリミタ                |                                   |
| ''          | シングルクォート                         | リテラル                  | '                                 |

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

- `date_part` — 日付部分。可能な値: 'year', 'quarter', 'month', 'week', 'dayofyear', 'day', 'weekday', 'hour', 'minute', 'second'。 [String](../data-types/string.md)。
- `date` — 日付。 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)。
- `timezone` — タイムゾーン。省略可能。 [String](../data-types/string.md)。

**返される値**

指定された日付部分。[String](/sql-reference/data-types/string)

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

- `date` — 日付または時間付きの日付。 [Date](../data-types/date.md)、[DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)。

**返される値**

月の名前。[String](/sql-reference/data-types/string)

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

この関数はUnixタイムスタンプをカレンダーの日付と一日の時間に変換します。

次の2つの方法で呼び出すことができます：

単一の引数が[Integer](../data-types/int-uint.md)型の場合、[DateTime](../data-types/datetime.md)型の値を返します。つまり、[toDateTime](../../sql-reference/functions/type-conversion-functions.md#todatetime)のように動作します。

エイリアス: `FROM_UNIXTIME`。

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

2つまたは3つの引数があり、最初の引数が[Integer](../data-types/int-uint.md)、[Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)型の場合、2番目の引数は定数のフォーマット文字列、3番目の引数はオプションの定数タイムゾーン文字列で、関数は[String](/sql-reference/data-types/string)型の値を返します。つまり、[formatDateTime](#formatdatetime)のように動作します。この場合、[MySQLのdatetimeフォーマットスタイル](https://dev.mysql.com/doc/refman/8.0/en/date-and-time-functions.html#function_date-format)が使用されます。

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

**関連情報**

- [fromUnixTimestampInJodaSyntax](#fromunixtimestampinjodasyntax)
## fromUnixTimestampInJodaSyntax {#fromunixtimestampinjodasyntax}

[fromUnixTimestamp](#fromunixtimestamp)と同様ですが、2つまたは3つの引数を使用して呼び出された場合、フォーマッティングはMySQLスタイルではなく[Jodaスタイル](https://joda-time.sourceforge.net/apidocs/org/joda/time/format/DateTimeFormat.html)で行われます。

**例:**

``` sql
SELECT fromUnixTimestampInJodaSyntax(1234334543, 'yyyy-MM-dd HH:mm:ss', 'UTC') AS DateTime;
```

結果:

```text
┌─DateTime────────────┐
│ 2009-02-11 06:42:23 │
└─────────────────────┘
```
## toModifiedJulianDay {#tomodifiedjulianday}

テキスト形式`YYYY-MM-DD`の[旧暦グレゴリオ暦](https://en.wikipedia.org/wiki/Proleptic_Gregorian_calendar)の日付を[Int32]の[修正ユリウス日](https://en.wikipedia.org/wiki/Julian_day#Variants)番号に変換します。この関数は、`0000-01-01`から`9999-12-31`までの日付をサポートしています。引数が日付として解析できない場合や、日付が無効な場合は例外が発生します。

**構文**

``` sql
toModifiedJulianDay(date)
```

**引数**

- `date` — テキスト形式の日付。[String](../data-types/string.md)または[FixedString](../data-types/fixedstring.md)。

**返される値**

- 修正ユリウス日番号。[Int32](../data-types/int-uint.md)。

**例**

``` sql
SELECT toModifiedJulianDay('2020-01-01');
```

結果:

``` text
┌─toModifiedJulianDay('2020-01-01')─┐
│                             58849 │
└───────────────────────────────────┘
```
## toModifiedJulianDayOrNull {#tomodifiedjuliandayornull}

[toModifiedJulianDay()](#tomodifiedjulianday)と似ていますが、例外を発生させる代わりに`NULL`を返します。

**構文**

``` sql
toModifiedJulianDayOrNull(date)
```

**引数**

- `date` — テキスト形式の日付。[String](../data-types/string.md)または[FixedString](../data-types/fixedstring.md)。

**返される値**

- 修正ユリウス日番号。[Nullable(Int32)](../data-types/int-uint.md)。

**例**

``` sql
SELECT toModifiedJulianDayOrNull('2020-01-01');
```

結果:

``` text
┌─toModifiedJulianDayOrNull('2020-01-01')─┐
│                                   58849 │
└─────────────────────────────────────────┘
```
## fromModifiedJulianDay {#frommodifiedjulianday}

[修正ユリウス日](https://en.wikipedia.org/wiki/Julian_day#Variants)番号をテキスト形式`YYYY-MM-DD`の[旧暦グレゴリオ暦](https://en.wikipedia.org/wiki/Proleptic_Gregorian_calendar)の日付に変換します。この関数は、`-678941`から`2973483`までの日数をサポートします（これはそれぞれ`0000-01-01`と`9999-12-31`を表します）。日数がサポート範囲外の場合は例外が発生します。

**構文**

``` sql
fromModifiedJulianDay(day)
```

**引数**

- `day` — 修正ユリウス日番号。[Any integral types](../data-types/int-uint.md)。

**返される値**

- テキスト形式の日付。[String](../data-types/string.md)。

**例**

``` sql
SELECT fromModifiedJulianDay(58849);
```

結果:

``` text
┌─fromModifiedJulianDay(58849)─┐
│ 2020-01-01                   │
└──────────────────────────────┘
```
## fromModifiedJulianDayOrNull {#frommodifiedjuliandayornull}

[fromModifiedJulianDay()](#frommodifiedjulianday)と似ていますが、例外を発生させる代わりに`NULL`を返します。

**構文**

``` sql
fromModifiedJulianDayOrNull(day)
```

**引数**

- `day` — 修正ユリウス日番号。[Any integral types](../data-types/int-uint.md)。

**返される値**

- テキスト形式の日付。[Nullable(String)](../data-types/string.md)。

**例**

``` sql
SELECT fromModifiedJulianDayOrNull(58849);
```

結果:

``` text
┌─fromModifiedJulianDayOrNull(58849)─┐
│ 2020-01-01                         │
└────────────────────────────────────┘
```
## toUTCTimestamp {#toutctimestamp}

DateTime/DateTime64型の値を他のタイムゾーンからUTCタイムゾーンのタイムスタンプに変換します。この関数は、主にApache Sparkや類似のフレームワークとの互換性を考慮して含まれています。

**構文**

``` sql
toUTCTimestamp(time_val, time_zone)
```

**引数**

- `time_val` — DateTime/DateTime64型の定数値または式。[DateTime/DateTime64 types](../data-types/datetime.md)
- `time_zone` — タイムゾーンを表すString型の定数値または式。[String types](../data-types/string.md)

**返される値**

- テキスト形式のDateTime/DateTime64

**例**

``` sql
SELECT toUTCTimestamp(toDateTime('2023-03-16'), 'Asia/Shanghai');
```

結果:

``` text
┌─toUTCTimestamp(toDateTime('2023-03-16'), 'Asia/Shanghai')┐
│                                     2023-03-15 16:00:00 │
└─────────────────────────────────────────────────────────┘
```
## fromUTCTimestamp {#fromutctimestamp}

UTCタイムゾーンから他のタイムゾーンのタイムスタンプにDateTime/DateTime64型の値を変換します。この関数は、主にApache Sparkや類似のフレームワークとの互換性を考慮して含まれています。

**構文**

``` sql
fromUTCTimestamp(time_val, time_zone)
```

**引数**

- `time_val` — DateTime/DateTime64型の定数値または式。[DateTime/DateTime64 types](../data-types/datetime.md)
- `time_zone` — タイムゾーンを表すString型の定数値または式。[String types](../data-types/string.md)

**返される値**

- テキスト形式のDateTime/DateTime64

**例**

``` sql
SELECT fromUTCTimestamp(toDateTime64('2023-03-16 10:00:00', 3), 'Asia/Shanghai');
```

結果:

``` text
┌─fromUTCTimestamp(toDateTime64('2023-03-16 10:00:00',3), 'Asia/Shanghai')─┐
│                                                 2023-03-16 18:00:00.000 │
└─────────────────────────────────────────────────────────────────────────┘
```
## UTCTimestamp {#utctimestamp}

クエリ解析の瞬間の現在の日付と時間を返します。この関数は定数式です。

:::note
この関数は`now('UTC')`が提供するのと同じ結果を返します。これはMySQLのサポートのために追加され、[`now`](#now)の使用が推奨されます。
:::

**構文**

```sql
UTCTimestamp()
```

エイリアス: `UTC_timestamp`。

**返される値**

- クエリ解析の瞬間の現在の日付と時間。[DateTime](../data-types/datetime.md)を返します。

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

2つの日付または時間付き日付の間の差を返します。差は秒単位で計算されます。これは`dateDiff`と同じであり、MySQLのサポートのために追加されました。`dateDiff`が推奨されます。

**構文**

```sql
timeDiff(first_datetime, second_datetime)
```

**引数**

- `first_datetime` — DateTime/DateTime64型の定数値または式。[DateTime/DateTime64 types](../data-types/datetime.md)
- `second_datetime` — DateTime/DateTime64型の定数値または式。[DateTime/DateTime64 types](../data-types/datetime.md)

**返される値**

2つの日付または時間付き日付の間の差を秒単位で返します。

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

- ブログ: [ClickHouseにおける時系列データの取り扱い](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
