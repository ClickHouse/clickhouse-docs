---
'description': 'Documentation for Functions for Working with Dates and Times'
'sidebar_label': 'Dates and Times'
'sidebar_position': 45
'slug': '/sql-reference/functions/date-time-functions'
'title': 'Functions for Working with Dates and Times'
---




# 日付と時刻に関する関数

このセクションのほとんどの関数は、オプションのタイムゾーン引数を受け入れます。例: `Europe/Amsterdam`。この場合、タイムゾーンは指定されたもので、ローカル（デフォルト）のものではありません。

**例**

```sql
SELECT
    toDateTime('2016-06-15 23:00:00') AS time,
    toDate(time) AS date_local,
    toDate(time, 'Asia/Yekaterinburg') AS date_yekat,
    toString(time, 'US/Samoa') AS time_samoa
```

```text
┌────────────────time─┬─date_local─┬─date_yekat─┬─time_samoa──────────┐
│ 2016-06-15 23:00:00 │ 2016-06-15 │ 2016-06-16 │ 2016-06-15 09:00:00 │
└─────────────────────┴────────────┴────────────┴─────────────────────┘
```
## makeDate {#makedate}

[Date](../data-types/date.md)を作成します
- 年、月、日引数から、または
- 年と年の日数引数から。

**構文**

```sql
makeDate(year, month, day);
makeDate(year, day_of_year);
```

エイリアス:
- `MAKEDATE(year, month, day);`
- `MAKEDATE(year, day_of_year);`

**引数**

- `year` — 年。 [Integer](../data-types/int-uint.md)、[Float](../data-types/float.md) または [Decimal](../data-types/decimal.md)。
- `month` — 月。 [Integer](../data-types/int-uint.md)、[Float](../data-types/float.md) または [Decimal](../data-types/decimal.md)。
- `day` — 日。 [Integer](../data-types/int-uint.md)、[Float](../data-types/float.md) または [Decimal](../data-types/decimal.md)。
- `day_of_year` — 年の日数。 [Integer](../data-types/int-uint.md)、[Float](../data-types/float.md) または [Decimal](../data-types/decimal.md)。

**戻り値**

- 引数から作成された日付。 [Date](../data-types/date.md)。

**例**

年、月、日から日付を作成します：

```sql
SELECT makeDate(2023, 2, 28) AS Date;
```

結果：

```text
┌───────date─┐
│ 2023-02-28 │
└────────────┘
```

年と年の日数引数から日付を作成します：

```sql
SELECT makeDate(2023, 42) AS Date;
```

結果：

```text
┌───────date─┐
│ 2023-02-11 │
└────────────┘
```
## makeDate32 {#makedate32}

年、月、日（またはオプションで年と日）から[Date32](../../sql-reference/data-types/date32.md)の型の日付を作成します。

**構文**

```sql
makeDate32(year, [month,] day)
```

**引数**

- `year` — 年。 [Integer](../../sql-reference/data-types/int-uint.md)、[Float](../../sql-reference/data-types/float.md) または [Decimal](../../sql-reference/data-types/decimal.md)。
- `month` — 月（オプション）。 [Integer](../../sql-reference/data-types/int-uint.md)、[Float](../../sql-reference/data-types/float.md) または [Decimal](../../sql-reference/data-types/decimal.md)。
- `day` — 日。 [Integer](../../sql-reference/data-types/int-uint.md)、[Float](../../sql-reference/data-types/float.md) または [Decimal](../../sql-reference/data-types/decimal.md)。

:::note
`month`が省略されると、`day`は`1`から`365`の範囲の値である必要があります。そうでなければ、`1`から`31`の範囲の値である必要があります。
:::

**戻り値**

- 引数から作成された日付。 [Date32](../../sql-reference/data-types/date32.md)。

**例**

年、月、日から日付を作成します：

クエリ：

```sql
SELECT makeDate32(2024, 1, 1);
```

結果：

```response
2024-01-01
```

年と年の日数から日付を作成します：

クエリ：

```sql
SELECT makeDate32(2024, 100);
```

結果：

```response
2024-04-09
```
## makeDateTime {#makedatetime}

年、月、日、時間、分、秒の引数から [DateTime](../data-types/datetime.md) を作成します。

**構文**

```sql
makeDateTime(year, month, day, hour, minute, second[, timezone])
```

**引数**

- `year` — 年。 [Integer](../data-types/int-uint.md)、[Float](../data-types/float.md) または [Decimal](../data-types/decimal.md)。
- `month` — 月。 [Integer](../data-types/int-uint.md)、[Float](../data-types/float.md) または [Decimal](../data-types/decimal.md)。
- `day` — 日。 [Integer](../data-types/int-uint.md)、[Float](../data-types/float.md) または [Decimal](../data-types/decimal.md)。
- `hour` — 時間。 [Integer](../data-types/int-uint.md)、[Float](../data-types/float.md) または [Decimal](../data-types/decimal.md)。
- `minute` — 分。 [Integer](../data-types/int-uint.md)、[Float](../data-types/float.md) または [Decimal](../data-types/decimal.md)。
- `second` — 秒。 [Integer](../data-types/int-uint.md)、[Float](../data-types/float.md) または [Decimal](../data-types/decimal.md)。
- `timezone` — 戻り値のための [Timezone](../../operations/server-configuration-parameters/settings.md#timezone)（オプション）。

**戻り値**

- 引数から作成された日付と時間。 [DateTime](../data-types/datetime.md)。

**例**

```sql
SELECT makeDateTime(2023, 2, 28, 17, 12, 33) AS DateTime;
```

結果：

```text
┌────────────DateTime─┐
│ 2023-02-28 17:12:33 │
└─────────────────────┘
```
## makeDateTime64 {#makedatetime64}

年、月、日、時間、分、秒のコンポーネントから、オプションのサブ秒精度を持つ [DateTime64](../../sql-reference/data-types/datetime64.md) データ型の値を作成します。

**構文**

```sql
makeDateTime64(year, month, day, hour, minute, second[, precision])
```

**引数**

- `year` — 年（0-9999）。 [Integer](../../sql-reference/data-types/int-uint.md)、[Float](../../sql-reference/data-types/float.md) または [Decimal](../../sql-reference/data-types/decimal.md)。
- `month` — 月（1-12）。 [Integer](../../sql-reference/data-types/int-uint.md)、[Float](../../sql-reference/data-types/float.md) または [Decimal](../../sql-reference/data-types/decimal.md)。
- `day` — 日（1-31）。 [Integer](../../sql-reference/data-types/int-uint.md)、[Float](../../sql-reference/data-types/float.md) または [Decimal](../../sql-reference/data-types/decimal.md)。
- `hour` — 時間（0-23）。 [Integer](../../sql-reference/data-types/int-uint.md)、[Float](../../sql-reference/data-types/float.md) または [Decimal](../../sql-reference/data-types/decimal.md)。
- `minute` — 分（0-59）。 [Integer](../../sql-reference/data-types/int-uint.md)、[Float](../../sql-reference/data-types/float.md) または [Decimal](../../sql-reference/data-types/decimal.md)。
- `second` — 秒（0-59）。 [Integer](../../sql-reference/data-types/int-uint.md)、[Float](../../sql-reference/data-types/float.md) または [Decimal](../../sql-reference/data-types/decimal.md)。
- `precision` — サブ秒コンポーネントのオプションの精度（0-9）。 [Integer](../../sql-reference/data-types/int-uint.md)。

**戻り値**

- 提供された引数から作成された日付と時刻。 [DateTime64](../../sql-reference/data-types/datetime64.md)。

**例**

```sql
SELECT makeDateTime64(2023, 5, 15, 10, 30, 45, 779, 5);
```

```response
┌─makeDateTime64(2023, 5, 15, 10, 30, 45, 779, 5)─┐
│                       2023-05-15 10:30:45.00779 │
└─────────────────────────────────────────────────┘
```
## timestamp {#timestamp}

最初の引数 'expr' を [DateTime64(6)](../data-types/datetime64.md) 型に変換します。
2番目の引数 'expr_time' が提供されている場合、変換された値に指定された時間を加えます。

**構文**

```sql
timestamp(expr[, expr_time])
```

エイリアス: `TIMESTAMP`

**引数**

- `expr` - 日付または時間付きの日付。 [String](../data-types/string.md)。
- `expr_time` - オプションのパラメータ。追加する時間。 [String](../data-types/string.md)。

**例**

```sql
SELECT timestamp('2023-12-31') as ts;
```

結果：

```text
┌─────────────────────────ts─┐
│ 2023-12-31 00:00:00.000000 │
└────────────────────────────┘
```

```sql
SELECT timestamp('2023-12-31 12:00:00', '12:00:00.11') as ts;
```

結果：

```text
┌─────────────────────────ts─┐
│ 2024-01-01 00:00:00.110000 │
└────────────────────────────┘
```

**戻り値**

- [DateTime64](../data-types/datetime64.md)(6)
## timeZone {#timezone}

現在のセッションのタイムゾーンを返します。つまり、設定 [session_timezone](../../operations/settings/settings.md#session_timezone) の値です。
関数が分散テーブルのコンテキストで実行されると、各シャードに関連する値の通常のカラムを生成します。それ以外の場合、定数値を生成します。

**構文**

```sql
timeZone()
```

エイリアス: `timezone`.

**戻り値**

- タイムゾーン。 [String](../data-types/string.md)。

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

**関連情報**

- [serverTimeZone](#servertimezone)
## serverTimeZone {#servertimezone}

サーバーのタイムゾーンを返します。つまり、設定 [timezone](../../operations/server-configuration-parameters/settings.md#timezone) の値です。
関数が分散テーブルのコンテキストで実行されると、各シャードに関連する値の通常のカラムを生成します。それ以外の場合、定数値を生成します。

**構文**

```sql
serverTimeZone()
```

エイリアス: `serverTimezone`.

**戻り値**

- タイムゾーン。 [String](../data-types/string.md)。

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

**関連情報**

- [timeZone](#timezone)
## toTimeZone {#totimezone}

日付または時刻を指定されたタイムゾーンに変換します。データの内部値（UNIX秒の数）は変更されず、値のタイムゾーン属性および値の文字列表現のみが変更されます。

**構文**

```sql
toTimezone(value, timezone)
```

エイリアス: `toTimezone`.

**引数**

- `value` — 時間または日付と時刻。 [DateTime64](../data-types/datetime64.md)。
- `timezone` — 戻り値のためのタイムゾーン。 [String](../data-types/string.md)。この引数は定数です。なぜなら、`toTimezone`はカラムのタイムゾーンを変更するためです（タイムゾーンは`DateTime*`型の属性です）。

**戻り値**

- 日付と時刻。 [DateTime](../data-types/datetime.md)。

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

**関連情報**

- [formatDateTime](#formatdatetime) - 非定数タイムゾーンをサポートします。
- [toString](type-conversion-functions.md#tostring) - 非定数タイムゾーンをサポートします。
## timeZoneOf {#timezoneof}

[DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md) データ型のタイムゾーン名を返します。

**構文**

```sql
timeZoneOf(value)
```

エイリアス: `timezoneOf`.

**引数**

- `value` — 日付と時刻。 [DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)。

**戻り値**

- タイムゾーン名。 [String](../data-types/string.md)。

**例**

```sql
SELECT timezoneOf(now());
```

結果：
```text
┌─timezoneOf(now())─┐
│ Etc/UTC           │
└───────────────────┘
```
## timeZoneOffset {#timezoneoffset}

[UTC](https://en.wikipedia.org/wiki/Coordinated_Universal_Time) からのオフセットを秒単位で返します。
この関数は、指定された日付と時刻での[サマータイム](https://en.wikipedia.org/wiki/Daylight_saving_time)と歴史的タイムゾーンの変更を考慮します。
オフセットを計算するには、[IANAのタイムゾーンデータベース](https://www.iana.org/time-zones) が使用されます。

**構文**

```sql
timeZoneOffset(value)
```

エイリアス: `timezoneOffset`.

**引数**

- `value` — 日付と時刻。 [DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)。

**戻り値**

- UTCに対するオフセット（秒単位）。 [Int32](../data-types/int-uint.md)。

**例**

```sql
SELECT toDateTime('2021-04-21 10:20:30', 'America/New_York') AS Time, toTypeName(Time) AS Type,
       timeZoneOffset(Time) AS Offset_in_seconds, (Offset_in_seconds / 3600) AS Offset_in_hours;
```

結果：

```text
┌────────────────Time─┬─Type─────────────────────────┬─Offset_in_seconds─┬─Offset_in_hours─┐
│ 2021-04-21 10:20:30 │ DateTime('America/New_York') │            -14400 │              -4 │
└─────────────────────┴──────────────────────────────┴───────────────────┴─────────────────┘
```
## toYear {#toyear}

日付または時刻の年（AD）コンポーネントを返します。

**構文**

```sql
toYear(value)
```

エイリアス: `YEAR`

**引数**

- `value` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)

**戻り値**

- 指定された日付/時刻の年。 [UInt16](../data-types/int-uint.md)。

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

日付または時刻の四半期（1-4）を返します。

**構文**

```sql
toQuarter(value)
```

エイリアス: `QUARTER`

**引数**

- `value` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)

**戻り値**

- 指定された日付/時刻の年の四半期（1、2、3 または 4）。 [UInt8](../data-types/int-uint.md)。

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

日付または時刻の月（1-12）コンポーネントを返します。

**構文**

```sql
toMonth(value)
```

エイリアス: `MONTH`

**引数**

- `value` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)

**戻り値**

- 指定された日付/時刻の年の月（1 - 12）。 [UInt8](../data-types/int-uint.md)。

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

日付または時刻の年内の日数（1-366）を返します。

**構文**

```sql
toDayOfYear(value)
```

エイリアス: `DAYOFYEAR`

**引数**

- `value` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)

**戻り値**

- 指定された日付/時刻の年の日数（1 - 366）。 [UInt16](../data-types/int-uint.md)。

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

日付または時刻の月内の日数（1-31）を返します。

**構文**

```sql
toDayOfMonth(value)
```

エイリアス: `DAYOFMONTH`, `DAY`

**引数**

- `value` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)

**戻り値**

- 指定された日付/時刻の月の日数（1 - 31）。 [UInt8](../data-types/int-uint.md)。

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

日付または時刻の週内の日数を返します。

`toDayOfWeek()`の二引数形式を使用すると、週の始まりを月曜日または日曜日に指定し、戻り値の範囲を0から6または1から7にするかを指定できます。モード引数が省略されると、デフォルトモードは0です。日付のタイムゾーンは、3番目の引数として指定できます。

| モード | 週の始まり | 範囲                                          |
|------|-------------------|------------------------------------------------|
| 0    | 月曜日            | 1-7: 月曜日 = 1, 火曜日 = 2, ..., 日曜日 = 7  |
| 1    | 月曜日            | 0-6: 月曜日 = 0, 火曜日 = 1, ..., 日曜日 = 6  |
| 2    | 日曜日            | 0-6: 日曜日 = 0, 月曜日 = 1, ..., 土曜日 = 6 |
| 3    | 日曜日            | 1-7: 日曜日 = 1, 月曜日 = 2, ..., 土曜日 = 7 |

**構文**

```sql
toDayOfWeek(t[, mode[, timezone]])
```

エイリアス: `DAYOFWEEK`.

**引数**

- `t` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)
- `mode` - 週の始まりを決定します。可能な値は0、1、2または3です。上記の表を参照してください。
- `timezone` - オプションのパラメータで、他の変換関数と同様に機能します。

最初の引数は、[parseDateTime64BestEffort()](type-conversion-functions.md#parsedatetime64besteffort) でサポートされている形式の [String](../data-types/string.md) として指定することもできます。文字列引数のサポートは、特定のサードパーティツールによって想定されるMySQLとの互換性のためのものです。将来的に文字列引数のサポートが新しいMySQL互換設定に依存する可能性があるため、通常は使用しないことが推奨されます。

**戻り値**

- 指定された日付/時刻の、選択されたモードに応じた週の日数（1-7）。

**例**

以下の日付は2023年4月21日で、金曜日です：

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

日付付き時刻の時間コンポーネント（0-24）を返します。

時計が前に進められる場合、午後2時に1時間進むと仮定します。時計が後ろに戻される場合、午前3時に1時間戻すと仮定します（ただし、これは必ずしも正確な時刻ではなく、タイムゾーンによって異なります）。

**構文**

```sql
toHour(value)
```

エイリアス: `HOUR`

**引数**

- `value` - [DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)

**戻り値**

- 指定された日付/時刻の日の時間（0 - 23）。 [UInt8](../data-types/int-uint.md)。

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

日付と時刻の分コンポーネント（0-59）を返します。

**構文**

```sql
toMinute(value)
```

エイリアス: `MINUTE`

**引数**

- `value` - [DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)

**戻り値**

- 指定された日付/時刻の時間の分（0 - 59）。 [UInt8](../data-types/int-uint.md)。

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

日付と時刻の秒コンポーネント（0-59）を返します。うるう秒は考慮されません。

**構文**

```sql
toSecond(value)
```

エイリアス: `SECOND`

**引数**

- `value` - [DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)

**戻り値**

- 指定された日付/時刻の分の秒（0 - 59）。 [UInt8](../data-types/int-uint.md)。

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

日付と時刻のミリ秒コンポーネント（0-999）を返します。

**構文**

```sql
toMillisecond(value)
```

**引数**

- `value` - [DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)

エイリアス: `MILLISECOND`

```sql
SELECT toMillisecond(toDateTime64('2023-04-21 10:20:30.456', 3))
```

結果：

```response
┌──toMillisecond(toDateTime64('2023-04-21 10:20:30.456', 3))─┐
│                                                        456 │
└────────────────────────────────────────────────────────────┘
```

**戻り値**

- 指定された日付/時刻の分のミリ秒（0 - 59）。 [UInt16](../data-types/int-uint.md)。
## toUnixTimestamp {#tounixtimestamp}

文字列、日付、または日付と時刻を [Unix Timestamp](https://en.wikipedia.org/wiki/Unix_time) の `UInt32` 表現に変換します。

関数が文字列で呼び出された場合、オプションのタイムゾーン引数を受け入れます。

**構文**

```sql
toUnixTimestamp(date)
toUnixTimestamp(str, [timezone])
```

**戻り値**

- Unixタイムスタンプを返します。 [UInt32](../data-types/int-uint.md)。

**例**

```sql
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

```text
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
`toStartOf*`, `toLastDayOf*`, `toMonday`, `timeSlot` 関数の戻り値の型は、設定パラメータ [enable_extended_results_for_datetime_functions](/operations/settings/settings#enable_extended_results_for_datetime_functions) によって決定され、デフォルトでは`0`です。

動作
* `enable_extended_results_for_datetime_functions = 0`:
  * `toStartOfYear`, `toStartOfISOYear`, `toStartOfQuarter`, `toStartOfMonth`, `toStartOfWeek`, `toLastDayOfWeek`, `toLastDayOfMonth`, `toMonday` 関数は、引数が `Date` または `DateTime` の場合、 `Date` または `DateTime` を返します。
  * `toStartOfDay`, `toStartOfHour`, `toStartOfFifteenMinutes`, `toStartOfTenMinutes`, `toStartOfFiveMinutes`, `toStartOfMinute`, `timeSlot` 関数は、 `DateTime` を返します。これらの関数は拡張型 `Date32` と `DateTime64` の値を引数として受け取ることができますが、通常の範囲外の時刻を渡すと（1970年から2149年の間の`Date` / 2106年の`DateTime`）不正な結果を生じます。
* `enable_extended_results_for_datetime_functions = 1`:
  * `toStartOfYear`, `toStartOfISOYear`, `toStartOfQuarter`, `toStartOfMonth`, `toStartOfWeek`, `toLastDayOfWeek`, `toLastDayOfMonth`, `toMonday` 関数は、引数が `Date` または `DateTime` の場合、 `Date` または `DateTime` を返し、引数が `Date32` または `DateTime64` の場合、 `Date32` または `DateTime64` を返します。
  * `toStartOfDay`, `toStartOfHour`, `toStartOfFifteenMinutes`, `toStartOfTenMinutes`, `toStartOfFiveMinutes`, `toStartOfMinute`, `timeSlot` 関数は、引数が `Date` または `DateTime` の場合、 `DateTime` を返し、引数が `Date32` または `DateTime64` の場合、 `DateTime64` を返します。
:::
## toStartOfYear {#tostartofyear}

日付または日付付き時刻を年の最初の日に切り下げます。戻り値は `Date` オブジェクトとして返されます。

**構文**

```sql
toStartOfYear(value)
```

**引数**

- `value` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)

**戻り値**

- 入力日付/時刻の年の最初の日。 [Date](../data-types/date.md)。

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

日付または日付付き時刻をISO年の最初の日に切り下げます。通常の年とは異なる場合があります。（[https://en.wikipedia.org/wiki/ISO_week_date](https://en.wikipedia.org/wiki/ISO_week_date)を参照してください。）

**構文**

```sql
toStartOfISOYear(value)
```

**引数**

- `value` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)

**戻り値**

- 入力日付/時刻の年の最初の日。 [Date](../data-types/date.md)。

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

日付または日付付き時刻を四半期の最初の日に切り下げます。四半期の最初の日は、1月1日、4月1日、7月1日、または10月1日です。
日付を返します。

**構文**

```sql
toStartOfQuarter(value)
```

**引数**

- `value` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)

**戻り値**

- 指定された日付/時刻の四半期の最初の日。 [Date](../data-types/date.md)。

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

日付または日付付き時刻を月の最初の日に切り下げます。日付を返します。

**構文**

```sql
toStartOfMonth(value)
```

**引数**

- `value` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)

**戻り値**

- 指定された日付/時刻の月の最初の日。 [Date](../data-types/date.md)。

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
不正な日付の解析の動作は実装によって異なります。ClickHouseはゼロの日付を返したり、例外を投げたり、「自然な」オーバーフローを行ったりすることがあります。
:::
## toLastDayOfMonth {#tolastdayofmonth}

日付または日付付き時刻を月の最終日に丸めます。日付を返します。

**構文**

```sql
toLastDayOfMonth(value)
```

エイリアス: `LAST_DAY`

**引数**

- `value` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)

**戻り値**

- 指定された日付/時刻の月の最終日。 [Date](../data-types/date.md)。

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

日付または日付付き時刻を最寄りの月曜日に丸めます。日付を返します。

**構文**

```sql
toMonday(value)
```

**引数**

- `value` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)

**戻り値**

- 指定された日付の最寄りの月曜日の日付。 [Date](../data-types/date.md)。

**例**

```sql
SELECT
    toMonday(toDateTime('2023-04-21 10:20:30')), /* a Friday */
    toMonday(toDate('2023-04-24')), /* already a Monday */
```

結果：

```response
┌─toMonday(toDateTime('2023-04-21 10:20:30'))─┬─toMonday(toDate('2023-04-24'))─┐
│                                  2023-04-17 │                     2023-04-24 │
└─────────────────────────────────────────────┴────────────────────────────────┘
```
## toStartOfWeek {#tostartofweek}

日付または日付付き時刻を最寄りの日曜日または月曜日に切り下げます。日付を返します。モード引数は、`toWeek()` 関数のモード引数と同様に機能します。モードが指定されていない場合は、デフォルトで0になります。

**構文**

```sql
toStartOfWeek(t[, mode[, timezone]])
```

**引数**

- `t` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)
- `mode` - 上記の[toWeek()](#toweek)関数で説明されているように、週の始まりを決定します。
- `timezone` - オプションのパラメータで、他の変換関数と同様に機能します。

**戻り値**

- 指定された日付の最寄りの日曜日または月曜日の日。 [Date](../data-types/date.md)。

**例**

```sql
SELECT
    toStartOfWeek(toDateTime('2023-04-21 10:20:30')), /* a Friday */
    toStartOfWeek(toDateTime('2023-04-21 10:20:30'), 1), /* a Friday */
    toStartOfWeek(toDate('2023-04-24')), /* a Monday */
    toStartOfWeek(toDate('2023-04-24'), 1) /* a Monday */
FORMAT Vertical
```

結果：

```response
Row 1:
──────
toStartOfWeek(toDateTime('2023-04-21 10:20:30')):    2023-04-16
toStartOfWeek(toDateTime('2023-04-21 10:20:30'), 1): 2023-04-17
toStartOfWeek(toDate('2023-04-24')):                 2023-04-23
toStartOfWeek(toDate('2023-04-24'), 1):              2023-04-24
```
## toLastDayOfWeek {#tolastdayofweek}

日付または時間を含む日付を、最も近い土曜日または日曜日まで切り上げます。日付を返します。
mode引数は、関数`toWeek()`のmode引数とまったく同じように機能します。modeが指定されていない場合、modeは0と見なされます。

**構文**

```sql
toLastDayOfWeek(t[, mode[, timezone]])
```

**引数**

- `t` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)、または[DateTime64](../data-types/datetime64.md)
- `mode` - [toWeek](#toweek)関数で説明されているように、週の最終日を決定します
- `timezone` - オプションのパラメータで、他の変換関数のように振る舞います

**戻り値**

- 指定された日付に基づいて、最も近い日曜日または月曜日の日付。 [Date](../data-types/date.md)。

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

時間を含む日付を、その日の始まりまで切り下げます。

**構文**

```sql
toStartOfDay(value)
```

**引数**

- `value` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)、または[DateTime64](../data-types/datetime64.md)

**戻り値**

- 指定された日付/時刻の始まり。 [DateTime](../data-types/datetime.md)。

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

時間を含む日付を、その時の始まりまで切り下げます。

**構文**

```sql
toStartOfHour(value)
```

**引数**

- `value` - [DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)

**戻り値**

- 指定された日付/時刻の時の始まり。 [DateTime](../data-types/datetime.md)。

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

時間を含む日付を、その分の始まりまで切り下げます。

**構文**

```sql
toStartOfMinute(value)
```

**引数**

- `value` - [DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)

**戻り値**

- 指定された日付/時刻の分の始まり。 [DateTime](../data-types/datetime.md)。

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

```sql
toStartOfSecond(value, [timezone])
```

**引数**

- `value` — 日付と時間。 [DateTime64](../data-types/datetime64.md)。
- `timezone` — 戻り値の[タイムゾーン](../../operations/server-configuration-parameters/settings.md#timezone)（オプション）。指定しない場合、関数は`value`パラメータのタイムゾーンを使用します。 [String](../data-types/string.md)。

**戻り値**

- サブ秒のない入力値。 [DateTime64](../data-types/datetime64.md)。

**例**

タイムゾーンなしのクエリ:

```sql
WITH toDateTime64('2020-01-01 10:20:30.999', 3) AS dt64
SELECT toStartOfSecond(dt64);
```

結果:

```text
┌───toStartOfSecond(dt64)─┐
│ 2020-01-01 10:20:30.000 │
└─────────────────────────┘
```

タイムゾーンありのクエリ:

```sql
WITH toDateTime64('2020-01-01 10:20:30.999', 3) AS dt64
SELECT toStartOfSecond(dt64, 'Asia/Istanbul');
```

結果:

```text
┌─toStartOfSecond(dt64, 'Asia/Istanbul')─┐
│                2020-01-01 13:20:30.000 │
└────────────────────────────────────────┘
```

**関連情報**

- [タイムゾーン](../../operations/server-configuration-parameters/settings.md#timezone)サーバー設定パラメータ。
## toStartOfMillisecond {#tostartofmillisecond}

時間を含む日付を、ミリ秒の始まりまで切り下げます。

**構文**

```sql
toStartOfMillisecond(value, [timezone])
```

**引数**

- `value` — 日付と時間。 [DateTime64](../../sql-reference/data-types/datetime64.md)。
- `timezone` — 戻り値の[タイムゾーン](../../operations/server-configuration-parameters/settings.md#timezone)（オプション）。指定しない場合、関数は`value`パラメータのタイムゾーンを使用します。 [String](../../sql-reference/data-types/string.md)。

**戻り値**

- サブミリ秒のある入力値。 [DateTime64](../../sql-reference/data-types/datetime64.md)。

**例**

タイムゾーンなしのクエリ:

```sql
WITH toDateTime64('2020-01-01 10:20:30.999999999', 9) AS dt64
SELECT toStartOfMillisecond(dt64);
```

結果:

```text
┌────toStartOfMillisecond(dt64)─┐
│ 2020-01-01 10:20:30.999000000 │
└───────────────────────────────┘
```

タイムゾーンありのクエリ:

```sql
┌─toStartOfMillisecond(dt64, 'Asia/Istanbul')─┐
│               2020-01-01 12:20:30.999000000 │
└─────────────────────────────────────────────┘
```

結果:

```text
┌─toStartOfMillisecond(dt64, 'Asia/Istanbul')─┐
│                     2020-01-01 12:20:30.999 │
└─────────────────────────────────────────────┘
```
## toStartOfMicrosecond {#tostartofmicrosecond}

時間を含む日付を、マイクロ秒の始まりまで切り下げます。

**構文**

```sql
toStartOfMicrosecond(value, [timezone])
```

**引数**

- `value` — 日付と時間。 [DateTime64](../../sql-reference/data-types/datetime64.md)。
- `timezone` — 戻り値の[タイムゾーン](../../operations/server-configuration-parameters/settings.md#timezone)（オプション）。指定しない場合、関数は`value`パラメータのタイムゾーンを使用します。 [String](../../sql-reference/data-types/string.md)。

**戻り値**

- サブマイクロ秒のある入力値。 [DateTime64](../../sql-reference/data-types/datetime64.md)。

**例**

タイムゾーンなしのクエリ:

```sql
WITH toDateTime64('2020-01-01 10:20:30.999999999', 9) AS dt64
SELECT toStartOfMicrosecond(dt64);
```

結果:

```text
┌────toStartOfMicrosecond(dt64)─┐
│ 2020-01-01 10:20:30.999999000 │
└───────────────────────────────┘
```

タイムゾーンありのクエリ:

```sql
WITH toDateTime64('2020-01-01 10:20:30.999999999', 9) AS dt64
SELECT toStartOfMicrosecond(dt64, 'Asia/Istanbul');
```

結果:

```text
┌─toStartOfMicrosecond(dt64, 'Asia/Istanbul')─┐
│               2020-01-01 12:20:30.999999000 │
└─────────────────────────────────────────────┘
```

**関連情報**

- [タイムゾーン](../../operations/server-configuration-parameters/settings.md#timezone)サーバー設定パラメータ。
## toStartOfNanosecond {#tostartofnanosecond}

時間を含む日付を、ナノ秒の始まりまで切り下げます。

**構文**

```sql
toStartOfNanosecond(value, [timezone])
```

**引数**

- `value` — 日付と時間。 [DateTime64](../../sql-reference/data-types/datetime64.md)。
- `timezone` — 戻り値の[タイムゾーン](../../operations/server-configuration-parameters/settings.md#timezone)（オプション）。指定しない場合、関数は`value`パラメータのタイムゾーンを使用します。 [String](../../sql-reference/data-types/string.md)。

**戻り値**

- 入力値のナノ秒。 [DateTime64](../../sql-reference/data-types/datetime64.md)。

**例**

タイムゾーンなしのクエリ:

```sql
WITH toDateTime64('2020-01-01 10:20:30.999999999', 9) AS dt64
SELECT toStartOfNanosecond(dt64);
```

結果:

```text
┌─────toStartOfNanosecond(dt64)─┐
│ 2020-01-01 10:20:30.999999999 │
└───────────────────────────────┘
```

タイムゾーンありのクエリ:

```sql
WITH toDateTime64('2020-01-01 10:20:30.999999999', 9) AS dt64
SELECT toStartOfNanosecond(dt64, 'Asia/Istanbul');
```

結果:

```text
┌─toStartOfNanosecond(dt64, 'Asia/Istanbul')─┐
│              2020-01-01 12:20:30.999999999 │
└────────────────────────────────────────────┘
```

**関連情報**

- [タイムゾーン](../../operations/server-configuration-parameters/settings.md#timezone)サーバー設定パラメータ。
## toStartOfFiveMinutes {#tostartoffiveminutes}

時間を含む日付を、5分間隔の始まりまで切り下げます。

**構文**

```sql
toStartOfFiveMinutes(value)
```

**引数**

- `value` - [DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)

**戻り値**

- 指定された日付/時刻の5分間隔の始まり。 [DateTime](../data-types/datetime.md)。

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

時間を含む日付を、10分間隔の始まりまで切り下げます。

**構文**

```sql
toStartOfTenMinutes(value)
```

**引数**

- `value` - [DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)

**戻り値**

- 指定された日付/時刻の10分間隔の始まり。 [DateTime](../data-types/datetime.md)。

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

時間を含む日付を、15分間隔の始まりまで切り下げます。

**構文**

```sql
toStartOfFifteenMinutes(value)
```

**引数**

- `value` - [DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)

**戻り値**

- 指定された日付/時刻の15分間隔の始まり。 [DateTime](../data-types/datetime.md)。

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

この関数は、`toStartOf*()` 関数を一般化したもので、`toStartOfInterval(date_or_date_with_time, INTERVAL x unit [, time_zone])` 構文を使用します。
たとえば、
- `toStartOfInterval(t, INTERVAL 1 YEAR)`は`toStartOfYear(t)`と同じ結果を返し、
- `toStartOfInterval(t, INTERVAL 1 MONTH)`は`toStartOfMonth(t)`と同じ結果を返し、
- `toStartOfInterval(t, INTERVAL 1 DAY)`は`toStartOfDay(t)`と同じ結果を返し、
- `toStartOfInterval(t, INTERVAL 15 MINUTE)`は`toStartOfFifteenMinutes(t)`と同じ結果を返します。

計算は特定の時間のポイントに対して行われます：

| インターバル | 開始                   |
|--------------|-----------------------|
| YEAR         | 年0                   |
| QUARTER      | 1900年第1四半期      |
| MONTH        | 1900年1月            |
| WEEK         | 1970年第1週 (01-05)  |
| DAY          | 1970-01-01           |
| HOUR         | (*)                   |
| MINUTE       | 1970-01-01 00:00:00   |
| SECOND       | 1970-01-01 00:00:00   |
| MILLISECOND  | 1970-01-01 00:00:00   |
| MICROSECOND  | 1970-01-01 00:00:00   |
| NANOSECOND   | 1970-01-01 00:00:00   |

(*) 時のインターバルは特別です：計算は常にその日の00:00:00（真夜中）に対して行われます。その結果、1から23の間の時刻のみが有用です。

もし`WEEK`の単位が指定されている場合、`toStartOfInterval`は週が月曜日から始まると仮定します。この動作は、`toStartOfWeek`関数でのデフォルトの動作である日曜日の開始とは異なります。

**構文**

```sql
toStartOfInterval(value, INTERVAL x unit[, time_zone])
toStartOfInterval(value, INTERVAL x unit[, origin[, time_zone]])
```
エイリアス: `time_bucket`, `date_bin`.

2つ目のオーバーロードは、TimescaleDBの`time_bucket()`関数、またはPostgreSQLの`date_bin()`関数を模倣します。例えば、

```SQL
SELECT toStartOfInterval(toDateTime('2023-01-01 14:45:00'), INTERVAL 1 MINUTE, toDateTime('2023-01-01 14:35:30'));
```

結果:

```reference
┌───toStartOfInterval(...)─┐
│      2023-01-01 14:44:30 │
└──────────────────────────┘
```

**関連情報**
- [date_trunc](#date_trunc)
## toTimeWithFixedDate {#totimewithfixeddate}

時間を持つ日付を、特定の固定日付に変換し、時間を保持します。

**構文**

```sql
toTimeWithFixedDate(date[,timezone])
```

エイリアス: `toTime` - `use_legacy_to_time`設定が有効なときのみ使用できます。

**引数**

- `date` — 時間に変換する日付。 [Date](../data-types/date.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。
- `timezone`（オプション） — 戻り値のタイムゾーン。 [String](../data-types/string.md)。

**戻り値**

- 時間を保持しつつ`1970-01-02`に等しい日付のDateTime。 [DateTime](../data-types/datetime.md)。

:::note
`date`入力引数にサブ秒コンポーネントが含まれている場合、戻される`DateTime`値で秒精度で削除されます。
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

日付、または時間を含む日付を、過去の特定の固定ポイントから経過した年数に変換します。

**構文**

```sql
toRelativeYearNum(date)
```

**引数**

- `date` — 日付または時間を含む日付。 [Date](../data-types/date.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**戻り値**

- 過去の固定参照点からの年数。 [UInt16](../data-types/int-uint.md)。

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

日付、または時間を含む日付を、過去の特定の固定ポイントから経過した四半期数に変換します。

**構文**

```sql
toRelativeQuarterNum(date)
```

**引数**

- `date` — 日付または時間を含む日付。 [Date](../data-types/date.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**戻り値**

- 過去の固定参照点からの四半期数。 [UInt32](../data-types/int-uint.md)。

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

日付、または時間を含む日付を、過去の特定の固定ポイントから経過した月数に変換します。

**構文**

```sql
toRelativeMonthNum(date)
```

**引数**

- `date` — 日付または時間を含む日付。 [Date](../data-types/date.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**戻り値**

- 過去の固定参照点からの月数。 [UInt32](../data-types/int-uint.md)。

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

日付、または時間を含む日付を、過去の特定の固定ポイントから経過した週数に変換します。

**構文**

```sql
toRelativeWeekNum(date)
```

**引数**

- `date` — 日付または時間を含む日付。 [Date](../data-types/date.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**戻り値**

- 過去の固定参照点からの週数。 [UInt32](../data-types/int-uint.md)。

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

日付、または時間を含む日付を、過去の特定の固定ポイントから経過した日数に変換します。

**構文**

```sql
toRelativeDayNum(date)
```

**引数**

- `date` — 日付または時間を含む日付。 [Date](../data-types/date.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**戻り値**

- 過去の固定参照点からの日数。 [UInt32](../data-types/int-uint.md)。

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

日付、または時間を含む日付を、過去の特定の固定ポイントから経過した時間数に変換します。

**構文**

```sql
toRelativeHourNum(date)
```

**引数**

- `date` — 日付または時間を含む日付。 [Date](../data-types/date.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**戻り値**

- 過去の固定参照点からの時間数。 [UInt32](../data-types/int-uint.md)。

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

日付、または時間を含む日付を、過去の特定の固定ポイントから経過した分数に変換します。

**構文**

```sql
toRelativeMinuteNum(date)
```

**引数**

- `date` — 日付または時間を含む日付。 [Date](../data-types/date.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**戻り値**

- 過去の固定参照点からの分数。 [UInt32](../data-types/int-uint.md)。

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

日付、または時間を含む日付を、過去の特定の固定ポイントから経過した秒数に変換します。

**構文**

```sql
toRelativeSecondNum(date)
```

**引数**

- `date` — 日付または時間を含む日付。 [Date](../data-types/date.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**戻り値**

- 過去の固定参照点からの秒数。 [UInt32](../data-types/int-uint.md)。

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

日付、または時間を含む日付を、ISO年をUInt16の数値として変換します。

**構文**

```sql
toISOYear(value)
```

**引数**

- `value` — 日付または時間を持つ値。 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)、または[DateTime64](../data-types/datetime64.md)

**戻り値**

- 入力値をISO年番号に変換したもの。 [UInt16](../data-types/int-uint.md)。

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

日付、または時間を含む日付を、ISO週番号を含むUInt8の数値に変換します。

**構文**

```sql
toISOWeek(value)
```

**引数**

- `value` — 日付または時間を持つ値。

**戻り値**

- `value`を現在のISO週番号に変換したもの。 [UInt8](../data-types/int-uint.md)。

**例**

クエリ:

```sql
SELECT
  toISOWeek(toDate('2024/10/02')) AS week1,
  toISOWeek(toDateTime('2024/10/02 01:30:00')) AS week2
```

レスポンス:

```response
┌─week1─┬─week2─┐
│    40 │    40 │
└───────┴───────┘
```
## toWeek {#toweek}

この関数は、日付または日付時刻の週番号を返します。2引数形式の`toWeek()`は、週が日曜日または月曜日のどちらから始まるか、戻り値が0から53の範囲と1から53の範囲のどちらにするかを指定できます。mode引数が省略された場合、デフォルトのmodeは0です。

`toISOWeek()`は、`toWeek(date,3)`と同等の互換性関数です。

以下の表は、mode引数の動作を説明しています。

| Mode | 週間の最初の日  | 範囲 | 週1はこの年の最初の週 ...      |
|------|-----------------|-------|-------------------------------|
| 0    | 日曜日          | 0-53  | この年の日曜日が含まれている |
| 1    | 月曜日          | 0-53  | この年が4日以上ある          |
| 2    | 日曜日          | 1-53  | この年の日曜日が含まれている |
| 3    | 月曜日          | 1-53  | この年が4日以上ある          |
| 4    | 日曜日          | 0-53  | この年が4日以上ある          |
| 5    | 月曜日          | 0-53  | この年の月曜日が含まれている |
| 6    | 日曜日          | 1-53  | この年が4日以上ある          |
| 7    | 月曜日          | 1-53  | この年の月曜日が含まれている |
| 8    | 日曜日          | 1-53  | 1月1日を含む                |
| 9    | 月曜日          | 1-53  | 1月1日を含む                |

「この年が4日以上ある」という意味のmode値の場合、週はISO 8601:1988に従って番号付けされます：

- 1月1日を含む週が4日以上ある場合、それは週1になります。

- そうでない場合、前の年の最後の週になり、次の週が週1となります。

「1月1日を含む」という意味のmode値の場合、1月1日を含む週が週1です。
新しい年の何日を含んでいるかは関係ありません。たとえ1日だけでも含んでいれば、それが週1になります。
つまり、12月の最終週が翌年の1月1日を含んでいれば、それは翌年の週1になります。

**構文**

```sql
toWeek(t[, mode[, time_zone]])
```

エイリアス: `WEEK`

**引数**

- `t` – 日付またはDateTime。
- `mode` – オプションのパラメータ，範囲は\[0,9\]，デフォルトは0です。
- `timezone` – オプションのパラメータ、他の変換関数と同じように振る舞います。

最初の引数は、[String](../data-types/string.md)としても指定でき、これは[parseDateTime64BestEffort()](type-conversion-functions.md#parsedatetime64besteffort)でサポートされている形式です。文字列引数のサポートは、特定のサードパーティツールで期待されるMySQLとの互換性のためのみ存在します。文字列引数のサポートは将来的に新しいMySQL互換性設定に依存する可能性があるため、また、文字列パースは一般的に遅いため、使用することは推奨されません。

**例**

```sql
SELECT toDate('2016-12-27') AS date, toWeek(date) AS week0, toWeek(date,1) AS week1, toWeek(date,9) AS week9;
```

```text
┌───────date─┬─week0─┬─week1─┬─week9─┐
│ 2016-12-27 │    52 │    52 │     1 │
└────────────┴───────┴───────┴───────┘
```
## toYearWeek {#toyearweek}

日付の年と週を返します。結果の年は、年の最初と最後の週に対して、引数の日付の年と異なる場合があります。

mode引数は`toWeek()`のmode引数と同じように機能します。単一引数構文では、mode値0が使用されます。

`toISOYear()`は、`intDiv(toYearWeek(date,3),100)`と等しい互換性関数です。

:::warning
`toYearWeek()`が返す週番号は、`toWeek()`が返す週番号とは異なる可能性があります。`toWeek()`は、常に与えられた年の文脈における週番号を返し、`toWeek()`が`0`を返す場合、`toYearWeek()`は前の年の最後の週に対応する値を返します。以下の例の`prev_yearWeek`を参照してください。
:::

**構文**

```sql
toYearWeek(t[, mode[, timezone]])
```

エイリアス: `YEARWEEK`

最初の引数は、[String](../data-types/string.md)としても指定でき、これは[parseDateTime64BestEffort()](type-conversion-functions.md#parsedatetime64besteffort)でサポートされている形式です。文字列引数のサポートは、特定のサードパーティツールで期待されるMySQLとの互換性のためのみ存在します。文字列引数のサポートは将来的に新しいMySQL互換性設定に依存する可能性があり、文字列パースは一般的に遅い為、使用することは推奨されません。

**例**

```sql
SELECT toDate('2016-12-27') AS date, toYearWeek(date) AS yearWeek0, toYearWeek(date,1) AS yearWeek1, toYearWeek(date,9) AS yearWeek9, toYearWeek(toDate('2022-01-01')) AS prev_yearWeek;
```

```text
┌───────date─┬─yearWeek0─┬─yearWeek1─┬─yearWeek9─┬─prev_yearWeek─┐
│ 2016-12-27 │    201652 │    201652 │    201701 │        202152 │
└────────────┴───────────┴───────────┴───────────┴───────────────┘
```
## toDaysSinceYearZero {#todayssinceyearzero}

指定された日付に対して、[1 January 0000](https://en.wikipedia.org/wiki/Year_zero)から経過した日数を返します。この計算は、ISO 8601によって定義された[古典的グレゴリオ暦](https://en.wikipedia.org/wiki/Gregorian_calendar#Proleptic_Gregorian_calendar)と同じです。この計算は、MySQLの[`TO_DAYS()`](https://dev.mysql.com/doc/refman/8.0/en/date-and-time-functions.html#function_to-days)関数と同じです。

**構文**

```sql
toDaysSinceYearZero(date[, time_zone])
```

エイリアス: `TO_DAYS`

**引数**

- `date` — 年ゼロから経過した日数を計算する日付。 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)。
- `time_zone` — タイムゾーンを表す文字列型の値または式。 [String types](../data-types/string.md)

**戻り値**

日付0000-01-01から経過した日数の数。 [UInt32](../data-types/int-uint.md)。

**例**

```sql
SELECT toDaysSinceYearZero(toDate('2023-09-08'));
```

結果:

```text
┌─toDaysSinceYearZero(toDate('2023-09-08')))─┐
│                                     713569 │
└────────────────────────────────────────────┘
```

**関連情報**

- [fromDaysSinceYearZero](#fromdayssinceyearzero)
## fromDaysSinceYearZero {#fromdayssinceyearzero}

指定された年ゼロから経過した日数に対して、ISO 8601によって定義された古典的グレゴリオ暦の日付を返します。この計算は、MySQLの[`FROM_DAYS()`](https://dev.mysql.com/doc/refman/8.0/en/date-and-time-functions.html#function_from-days)関数と同じです。

結果は、[Date](../data-types/date.md)型の範囲内で表すことができない場合は未定義になります。

**構文**

```sql
fromDaysSinceYearZero(days)
```

エイリアス: `FROM_DAYS`

**引数**

- `days` — 年ゼロから経過した日数。

**戻り値**

年ゼロから経過した日数に対応する日付。 [Date](../data-types/date.md)。

**例**

```sql
SELECT fromDaysSinceYearZero(739136), fromDaysSinceYearZero(toDaysSinceYearZero(toDate('2023-09-08')));
```

結果:

```text
┌─fromDaysSinceYearZero(739136)─┬─fromDaysSinceYearZero(toDaysSinceYearZero(toDate('2023-09-08')))─┐
│                    2023-09-08 │                                                       2023-09-08 │
└───────────────────────────────┴──────────────────────────────────────────────────────────────────┘
```

**関連情報**

- [toDaysSinceYearZero](#todayssinceyearzero)
## fromDaysSinceYearZero32 {#fromdayssinceyearzero32}

[spからの相対的な日数を表す](#fromdayssinceyearzero)ようなもので、[Date32](../data-types/date32.md)を返します。
## age {#age}

`startdate`と`enddate`の差の`unit`コンポーネントを返します。この差は、精度1ナノ秒で計算されます。
例えば、`2021-12-29`と`2022-01-01`の差は、`day`単位で3日、`month`単位で0月、`year`単位で0年です。

`age`の代替として、関数`date_diff`を参照してください。

**構文**

```sql
age('unit', startdate, enddate, [timezone])
```

**引数**

- `unit` — 結果の間隔のタイプ。[String](../data-types/string.md)。
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

- `startdate` — 引き算する最初の時刻値（被減数）。[Date](../data-types/date.md), [Date32](../data-types/date32.md), [DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)。

- `enddate` — 引き算される2番目の時刻値（減数）。[Date](../data-types/date.md), [Date32](../data-types/date32.md), [DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)。

- `timezone` — [タイムゾーン名](../../operations/server-configuration-parameters/settings.md#timezone)（オプション）。指定された場合、`startdate`と`enddate`の両方に適用されます。指定されていない場合は、`startdate`と`enddate`のタイムゾーンが使用されます。異なる場合、結果は未定義です。[String](../data-types/string.md)。

**返される値**

`enddate`と`startdate`の差を`unit`で表現します。[Int](../data-types/int-uint.md)。

**例**

```sql
SELECT age('hour', toDateTime('2018-01-01 22:30:00'), toDateTime('2018-01-02 23:00:00'));
```

結果:

```text
┌─age('hour', toDateTime('2018-01-01 22:30:00'), toDateTime('2018-01-02 23:00:00'))─┐
│                                                                                24 │
└───────────────────────────────────────────────────────────────────────────────────┘
```

```sql
SELECT
    toDate('2022-01-01') AS e,
    toDate('2021-12-29') AS s,
    age('day', s, e) AS day_age,
    age('month', s, e) AS month__age,
    age('year', s, e) AS year_age;
```

結果:

```text
┌──────────e─┬──────────s─┬─day_age─┬─month__age─┬─year_age─┐
│ 2022-01-01 │ 2021-12-29 │       3 │          0 │        0 │
└────────────┴────────────┴─────────┴────────────┴──────────┘
```
## date_diff {#date_diff}

`startdate`と`enddate`の間で指定された`unit`の境界を超えたカウントを返します。
差は相対的な単位を使用して計算されます。例えば、`2021-12-29`と`2022-01-01`の差は、`day`単位で3日（[toRelativeDayNum](#torelativedaynum)を参照）、`month`単位で1か月（[toRelativeMonthNum](#torelativemonthnum)を参照）、`year`単位で1年（[toRelativeYearNum](#torelativeyearnum)を参照）です。

`week`単位が指定された場合、`date_diff`は週の始まりが月曜日であると仮定します。この挙動は、週のデフォルトが日曜日である`toWeek()`関数とは異なります。

`date_diff`の代替として、関数`age`を参照してください。

**構文**

```sql
date_diff('unit', startdate, enddate, [timezone])
```

エイリアス: `dateDiff`, `DATE_DIFF`, `timestampDiff`, `timestamp_diff`, `TIMESTAMP_DIFF`.

**引数**

- `unit` — 結果の間隔のタイプ。[String](../data-types/string.md)。
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

- `startdate` — 引き算する最初の時刻値（被減数）。[Date](../data-types/date.md), [Date32](../data-types/date32.md), [DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)。

- `enddate` — 引き算される2番目の時刻値（減数）。[Date](../data-types/date.md), [Date32](../data-types/date32.md), [DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)。

- `timezone` — [タイムゾーン名](../../operations/server-configuration-parameters/settings.md#timezone)（オプション）。指定された場合、`startdate`と`enddate`の両方に適用されます。指定されていない場合は、`startdate`と`enddate`のタイムゾーンが使用されます。異なる場合、結果は未定義です。[String](../data-types/string.md)。

**返される値**

`enddate`と`startdate`の差を`unit`で表現します。[Int](../data-types/int-uint.md)。

**例**

```sql
SELECT dateDiff('hour', toDateTime('2018-01-01 22:00:00'), toDateTime('2018-01-02 23:00:00'));
```

結果:

```text
┌─dateDiff('hour', toDateTime('2018-01-01 22:00:00'), toDateTime('2018-01-02 23:00:00'))─┐
│                                                                                     25 │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

```sql
SELECT
    toDate('2022-01-01') AS e,
    toDate('2021-12-29') AS s,
    dateDiff('day', s, e) AS day_diff,
    dateDiff('month', s, e) AS month__diff,
    dateDiff('year', s, e) AS year_diff;
```

結果:

```text
┌──────────e─┬──────────s─┬─day_diff─┬─month__diff─┬─year_diff─┐
│ 2022-01-01 │ 2021-12-29 │        3 │           1 │         1 │
└────────────┴────────────┴──────────┴─────────────┴───────────┘
```
## date\_trunc {#date_trunc}

日付と時刻データを指定された日付の部分に切り捨てます。

**構文**

```sql
date_trunc(unit, value[, timezone])
```

エイリアス: `dateTrunc`.

**引数**

- `unit` — 結果を切り捨てる間隔のタイプ。[String Literal](/sql-reference/syntax#string)。
    可能な値:

    - `nanosecond` - DateTime64と互換性
    - `microsecond` - DateTime64と互換性
    - `millisecond` - DateTime64と互換性
    - `second`
    - `minute`
    - `hour`
    - `day`
    - `week`
    - `month`
    - `quarter`
    - `year`

    `unit`引数は大文字と小文字を区別しません。

- `value` — 日付と時刻。[Date](../data-types/date.md), [Date32](../data-types/date32.md), [DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md).
- `timezone` — 返される値の[タイムゾーン名](../../operations/server-configuration-parameters/settings.md#timezone)（オプション）。指定されていない場合、関数は`value`パラメータのタイムゾーンを使用します。[String](../data-types/string.md)。

**返される値**

`unit`引数がYear、Quarter、Month、またはWeekの場合、
- `value`引数がDate32またはDateTime64であれば、[Date32](../data-types/date32.md)が返され、
- それ以外の場合は、[Date](../data-types/date.md)が返されます。

`unit`引数がDay、Hour、Minute、またはSecondの場合、
- `value`引数がDate32またはDateTime64であれば、[DateTime64](../data-types/datetime64.md)が返され、
- それ以外の場合は、[DateTime](../data-types/datetime.md)が返されます。

`unit`引数がMillisecond、Microsecond、またはNanosecondの場合、スケール3または6または9（単位引数に応じて）を持つ[DateTime64](../data-types/datetime64.md)が返されます。

**例**

タイムゾーンなしのクエリ:

```sql
SELECT now(), date_trunc('hour', now());
```

結果:

```text
┌───────────────now()─┬─date_trunc('hour', now())─┐
│ 2020-09-28 10:40:45 │       2020-09-28 10:00:00 │
└─────────────────────┴───────────────────────────┘
```

指定されたタイムゾーンを使用したクエリ:

```sql
SELECT now(), date_trunc('hour', now(), 'Asia/Istanbul');
```

結果:

```text
┌───────────────now()─┬─date_trunc('hour', now(), 'Asia/Istanbul')─┐
│ 2020-09-28 10:46:26 │                        2020-09-28 13:00:00 │
└─────────────────────┴────────────────────────────────────────────┘
```

**関連情報**

- [toStartOfInterval](#tostartofinterval)
## date\_add {#date_add}

提供された日付または時間付きの日付に時間間隔または日付間隔を追加します。

追加の結果がデータ型の範囲を超える場合、結果は未定義です。

**構文**

```sql
date_add(unit, value, date)
```

代替構文:

```sql
date_add(date, INTERVAL value unit)
```

エイリアス: `dateAdd`, `DATE_ADD`.

**引数**

- `unit` — 追加する間隔のタイプ。注意: これは[String](../data-types/string.md)ではなく、引用されるべきではありません。
    可能な値:

    - `second`
    - `minute`
    - `hour`
    - `day`
    - `week`
    - `month`
    - `quarter`
    - `year`

- `value` — 追加する間隔の値。[Int](../data-types/int-uint.md)。
- `date` — `value`が追加される日付または時間付きの日付。[Date](../data-types/date.md), [Date32](../data-types/date32.md), [DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)。

**返される値**

`date`に対して`unit`で表現された`value`が追加された日付または時間付きの日付。[Date](../data-types/date.md), [Date32](../data-types/date32.md), [DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md).

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



**関連情報**

- [addDate](#adddate)
## date\_sub {#date_sub}

提供された日付または時間付きの日付から時間間隔または日付間隔を引きます。

減算の結果がデータ型の範囲を超える場合、結果は未定義です。

**構文**

```sql
date_sub(unit, value, date)
```

代替構文:

```sql
date_sub(date, INTERVAL value unit)
```


エイリアス: `dateSub`, `DATE_SUB`.

**引数**

- `unit` — 引く間隔のタイプ。注意: これは[String](../data-types/string.md)ではなく、引用されるべきではありません。

    可能な値:

    - `second`
    - `minute`
    - `hour`
    - `day`
    - `week`
    - `month`
    - `quarter`
    - `year`

- `value` — 引く間隔の値。[Int](../data-types/int-uint.md)。
- `date` — `value`が引かれる日付または時間付きの日付。[Date](../data-types/date.md), [Date32](../data-types/date32.md), [DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)。

**返される値**

`date`から`unit`で表現された`value`が引かれた日付または時間付きの日付。[Date](../data-types/date.md), [Date32](../data-types/date32.md), [DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)。

**例**

```sql
SELECT date_sub(YEAR, 3, toDate('2018-01-01'));
```

結果:

```text
┌─minus(toDate('2018-01-01'), toIntervalYear(3))─┐
│                                     2015-01-01 │
└────────────────────────────────────────────────┘
```

```sql
SELECT date_sub(toDate('2018-01-01'), INTERVAL 3 YEAR);
```

結果:

```text
┌─minus(toDate('2018-01-01'), toIntervalYear(3))─┐
│                                     2015-01-01 │
└────────────────────────────────────────────────┘
```


**関連情報**

- [subDate](#subdate)
## timestamp\_add {#timestamp_add}

指定された時間値を提供された日付または日付時刻値に追加します。

追加の結果がデータ型の範囲を超える場合、結果は未定義です。

**構文**

```sql
timestamp_add(date, INTERVAL value unit)
```

エイリアス: `timeStampAdd`, `TIMESTAMP_ADD`.

**引数**

- `date` — 日付または時間付きの日付。[Date](../data-types/date.md), [Date32](../data-types/date32.md), [DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)。
- `value` — 追加する間隔の値。[Int](../data-types/int-uint.md)。
- `unit` — 追加する間隔のタイプ。[String](../data-types/string.md)。
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

指定された`value`が`unit`で`date`に追加された日付または時間付きの日付。[Date](../data-types/date.md), [Date32](../data-types/date32.md), [DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)。

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

提供された日付または時間付きの日付から時間間隔を減算します。

減算の結果がデータ型の範囲を超える場合、結果は未定義です。

**構文**

```sql
timestamp_sub(unit, value, date)
```

エイリアス: `timeStampSub`, `TIMESTAMP_SUB`.

**引数**

- `unit` — 減算する間隔のタイプ。[String](../data-types/string.md)。
    可能な値:

    - `second`
    - `minute`
    - `hour`
    - `day`
    - `week`
    - `month`
    - `quarter`
    - `year`

- `value` — 引く間隔の値。[Int](../data-types/int-uint.md)。
- `date` — 日付または時間付きの日付。[Date](../data-types/date.md), [Date32](../data-types/date32.md), [DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)。

**返される値**

`date`から`value`が`unit`で引かれた日付または時間付きの日付。[Date](../data-types/date.md), [Date32](../data-types/date32.md), [DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)。

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

時間間隔を提供された日付、時間付き日付、または文字列エンコードされた日付に追加します。

追加の結果がデータ型の範囲を超える場合、結果は未定義です。

**構文**

```sql
addDate(date, interval)
```

**引数**

- `date` — `interval`が追加される日付または時間付き日付。[Date](../data-types/date.md), [Date32](../data-types/date32.md), [DateTime](../data-types/datetime.md), [DateTime64](../data-types/datetime64.md)、または[String](../data-types/string.md)
- `interval` — 追加する間隔。[Interval](../data-types/special-data-types/interval.md)。

**返される値**

`date`に`interval`が追加された日付または時間付き日付。[Date](../data-types/date.md), [Date32](../data-types/date32.md), [DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)。

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

**関連情報**

- [date_add](#date_add)
## subDate {#subdate}

時間間隔を提供された日付、時間付き日付、または文字列エンコードされた日付から減算します。

減算の結果がデータ型の範囲を超える場合、結果は未定義です。

**構文**

```sql
subDate(date, interval)
```

**引数**

- `date` — `interval`が引かれる日付または時間付き日付。[Date](../data-types/date.md), [Date32](../data-types/date32.md), [DateTime](../data-types/datetime.md), [DateTime64](../data-types/datetime64.md)、または[String](../data-types/string.md)
- `interval` — 引く間隔。[Interval](../data-types/special-data-types/interval.md)。

**返される値**

`date`から`interval`が引かれた日付または時間付き日付。[Date](../data-types/date.md), [Date32](../data-types/date32.md), [DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)。

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

**関連情報**

- [date_sub](#date_sub)
## now {#now}

クエリ解析の瞬間での現在の日付と時刻を返します。この関数は定数式です。

エイリアス: `current_timestamp`.

**構文**

```sql
now([timezone])
```

**引数**

- `timezone` — 返される値の[タイムゾーン名](../../operations/server-configuration-parameters/settings.md#timezone)（オプション）。[String](../data-types/string.md)。

**返される値**

- 現在の日付と時刻。[DateTime](../data-types/datetime.md)。

**例**

タイムゾーンなしのクエリ:

```sql
SELECT now();
```

結果:

```text
┌───────────────now()─┐
│ 2020-10-17 07:42:09 │
└─────────────────────┘
```

指定されたタイムゾーンを使用したクエリ:

```sql
SELECT now('Asia/Istanbul');
```

結果:

```text
┌─now('Asia/Istanbul')─┐
│  2020-10-17 10:42:23 │
└──────────────────────┘
```
## now64 {#now64}

クエリ解析の瞬間でのサブ秒精度を持つ現在の日付と時刻を返します。この関数は定数式です。

**構文**

```sql
now64([scale], [timezone])
```

**引数**

- `scale` - チックサイズ（精度）: 10<sup>-precision</sup>秒。正当な範囲: [ 0 : 9 ]。通常、使用されるのは - 3（デフォルト）（ミリ秒）、6（マイクロ秒）、9（ナノ秒）です。
- `timezone` — 返される値の[タイムゾーン名](../../operations/server-configuration-parameters/settings.md#timezone)（オプション）。[String](../data-types/string.md)。

**返される値**

- サブ秒精度を持つ現在の日付と時刻。[DateTime64](../data-types/datetime64.md)。

**例**

```sql
SELECT now64(), now64(9, 'Asia/Istanbul');
```

結果:

```text
┌─────────────────now64()─┬─────now64(9, 'Asia/Istanbul')─┐
│ 2022-08-21 19:34:26.196 │ 2022-08-21 22:34:26.196542766 │
└─────────────────────────┴───────────────────────────────┘
```
## nowInBlock {#nowInBlock}

各データブロックの処理の瞬間での現在の日付と時刻を返します。[now](#now)関数とは異なり、定数式ではなく、長時間実行されるクエリでは異なるブロックで返される値が異なる場合があります。

この関数を使用すると、長時間実行されるINSERT SELECTクエリで現在の時刻を生成するのに意味があります。

**構文**

```sql
nowInBlock([timezone])
```

**引数**

- `timezone` — 返される値の[タイムゾーン名](../../operations/server-configuration-parameters/settings.md#timezone)（オプション）。[String](../data-types/string.md)。

**返される値**

- 各データブロックの処理の瞬間での現在の日付と時刻。[DateTime](../data-types/datetime.md)。

**例**

```sql
SELECT
    now(),
    nowInBlock(),
    sleep(1)
FROM numbers(3)
SETTINGS max_block_size = 1
FORMAT PrettyCompactMonoBlock
```

結果:

```text
┌───────────────now()─┬────────nowInBlock()─┬─sleep(1)─┐
│ 2022-08-21 19:41:19 │ 2022-08-21 19:41:19 │        0 │
│ 2022-08-21 19:41:19 │ 2022-08-21 19:41:20 │        0 │
│ 2022-08-21 19:41:19 │ 2022-08-21 19:41:21 │        0 │
└─────────────────────┴─────────────────────┴──────────┘
```
## today {#today}

クエリ解析の瞬間での現在の日付を返します。これは`toDate(now())`と同じで、エイリアスとして`curdate`, `current_date`があります。

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

2024年3月3日に上記のクエリを実行すると、次の応答が返されます。

```response
┏━━━━━━━━━━━━┳━━━━━━━━━━━━┳━━━━━━━━━━━━━━┓
┃      today ┃    curdate ┃ current_date ┃
┡━━━━━━━━━━━━╇━━━━━━━━━━━━╇━━━━━━━━━━━━━━┩
│ 2024-03-03 │ 2024-03-03 │   2024-03-03 │
└────────────┴────────────┴──────────────┘
```
## yesterday {#yesterday}

引数を受け取らず、クエリ解析の瞬間での昨日の日付を返します。
これは`today() - 1`と同じです。
## timeSlot {#timeslot}

時刻を30分の長さの間隔の開始に丸めます。

**構文**

```sql
timeSlot(time[, time_zone])
```

**引数**

- `time` — 30分の長さの間隔の開始に丸める時間。[DateTime](../data-types/datetime.md)/[Date32](../data-types/date32.md)/[DateTime64](../data-types/datetime64.md)。
- `time_zone` — タイムゾーンを表す文字列型の定数値または式。[String](../data-types/string.md)。

:::note
この関数は拡張型`Date32`および`DateTime64`の値を引数として受け取ることができますが、通常の範囲（年1970年から2149年まで、`Date`/2106年までの`DateTime`）の外の時間を渡すと、誤った結果が出力されます。
:::

**戻り値の型**

- 30分の長さの間隔の開始に丸められた時間を返します。[DateTime](../data-types/datetime.md)。

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

日付または時刻を含む日付を、年と月の番号を含むUInt32数（YYYY \* 100 + MM）に変換します。2番目のオプションのタイムゾーン引数を受け取ります。提供された場合、タイムゾーンは文字列定数でなければなりません。

この関数は関数`YYYYMMDDToDate()`の逆です。

**例**

```sql
SELECT
    toYYYYMM(now(), 'US/Eastern')
```

結果:

```text
┌─toYYYYMM(now(), 'US/Eastern')─┐
│                        202303 │
└───────────────────────────────┘
```
## toYYYYMMDD {#toyyyymmdd}

日付または時刻を含む日付を、年、月、日を含むUInt32数（YYYY \* 10000 + MM \* 100 + DD）に変換します。2番目のオプションのタイムゾーン引数を受け取ります。提供された場合、タイムゾーンは文字列定数でなければなりません。

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

日付または時刻を含む日付を、年、月、日、時間、分、秒を含むUInt64数（YYYY \* 10000000000 + MM \* 100000000 + DD \* 1000000 + hh \* 10000 + mm \* 100 + ss）に変換します。2番目のオプションのタイムゾーン引数を受け取ります。提供された場合、タイムゾーンは文字列定数でなければなりません。

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

年、月、日を含む数を[Date](../data-types/date.md)に変換します。

この関数は関数`toYYYYMMDD()`の逆です。

入力が有効なDate値をエンコードしていない場合、出力は未定義です。

**構文**

```sql
YYYYMMDDToDate(yyyymmdd);
```

**引数**

- `yyyymmdd` - 年、月、日を表す数。[Integer](../data-types/int-uint.md), [Float](../data-types/float.md) または [Decimal](../data-types/decimal.md)。

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

関数`YYYYMMDDToDate()`と同様ですが、[Date32](../data-types/date32.md)を生成します。
## YYYYMMDDhhmmssToDateTime {#yyyymmddhhmmsstodatetime}

年、月、日、時間、分、秒を含む数を[DateTime](../data-types/datetime.md)に変換します。

入力が有効なDateTime値をエンコードしていない場合、出力は未定義です。

この関数は関数`toYYYYMMDDhhmmss()`の逆です。

**構文**

```sql
YYYYMMDDhhmmssToDateTime(yyyymmddhhmmss[, timezone]);
```

**引数**

- `yyyymmddhhmmss` - 年、月、日を表す数。[Integer](../data-types/int-uint.md), [Float](../data-types/float.md) または [Decimal](../data-types/decimal.md)。
- `timezone` - 返される値の[タイムゾーン](../../operations/server-configuration-parameters/settings.md#timezone)（オプション）。

**返される値**

- 引数から作成された時間付きの日付。[DateTime](../data-types/datetime.md)。

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

関数`YYYYMMDDhhmmssToDate()`と同様ですが、[DateTime64](../data-types/datetime64.md)を生成します。

タイムゾーン引数の後に追加のオプションの`precision`パラメータを受け取ります。
## changeYear {#changeyear}

日付または日時の年のコンポーネントを変更します。

**構文**
```sql

changeYear(date_or_datetime, value)
```

**引数**

- `date_or_datetime` - [Date](../data-types/date.md), [Date32](../data-types/date32.md), [DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)
- `value` - 年の新しい値。[Integer](../../sql-reference/data-types/int-uint.md)。

**返される値**

- `date_or_datetime`と同じ型。

**例**

```sql
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

```sql
changeMonth(date_or_datetime, value)
```

**引数**

- `date_or_datetime` - [Date](../data-types/date.md), [Date32](../data-types/date32.md), [DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)
- `value` - 月の新しい値。[Integer](../../sql-reference/data-types/int-uint.md)。

**返される値**

- `date_or_datetime`と同じ型の値を返します。

**例**

```sql
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

```sql
changeDay(date_or_datetime, value)
```

**引数**

- `date_or_datetime` - [Date](../data-types/date.md), [Date32](../data-types/date32.md), [DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)
- `value` - 日の新しい値。[Integer](../../sql-reference/data-types/int-uint.md)。

**返される値**

- `date_or_datetime`と同じ型の値を返します。

**例**

```sql
SELECT changeDay(toDate('1999-01-01'), 5), changeDay(toDateTime64('1999-01-01 00:00:00.000', 3), 5);
```

**結果**

```sql
┌─changeDay(toDate('1999-01-01'), 5)─┬─changeDay(toDateTime64('1999-01-01 00:00:00.000', 3), 5)─┐
│                         1999-01-05 │                                  1999-01-05 00:00:00.000 │
└────────────────────────────────────┴──────────────────────────────────────────────────────────┘
```
## changeHour {#changehour}

日付または日時の時間のコンポーネントを変更します。

**構文**

```sql
changeHour(date_or_datetime, value)
```

**引数**

- `date_or_datetime` - [Date](../data-types/date.md), [Date32](../data-types/date32.md), [DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)
- `value` - 時間の新しい値。[Integer](../../sql-reference/data-types/int-uint.md)。

**返される値**

- `date_or_datetime`と同じ型の値を返します。入力が[Date](../data-types/date.md)の場合、[DateTime](../data-types/datetime.md)を返します。入力が[Date32](../data-types/date32.md)の場合、[DateTime64](../data-types/datetime64.md)を返します。

**例**

```sql
SELECT changeHour(toDate('1999-01-01'), 14), changeHour(toDateTime64('1999-01-01 00:00:00.000', 3), 14);
```

結果:

```sql
┌─changeHour(toDate('1999-01-01'), 14)─┬─changeHour(toDateTime64('1999-01-01 00:00:00.000', 3), 14)─┐
│                  1999-01-01 14:00:00 │                                    1999-01-01 14:00:00.000 │
└──────────────────────────────────────┴────────────────────────────────────────────────────────────┘
```

## changeMinute {#changeminute}

日付または日時の分の要素を変更します。

**構文**

```sql
changeMinute(date_or_datetime, value)
```

**引数**

- `date_or_datetime` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)
- `value` - 分の新しい値。 [Integer](../../sql-reference/data-types/int-uint.md)。

**戻り値**

- `date_or_datetime` と同じ型の値を返します。入力が [Date](../data-types/date.md) の場合、[DateTime](../data-types/datetime.md) を返します。入力が [Date32](../data-types/date32.md) の場合、[DateTime64](../data-types/datetime64.md) を返します。

**例**

```sql
    SELECT changeMinute(toDate('1999-01-01'), 15), changeMinute(toDateTime64('1999-01-01 00:00:00.000', 3), 15);
```

結果:

```sql
┌─changeMinute(toDate('1999-01-01'), 15)─┬─changeMinute(toDateTime64('1999-01-01 00:00:00.000', 3), 15)─┐
│                    1999-01-01 00:15:00 │                                      1999-01-01 00:15:00.000 │
└────────────────────────────────────────┴──────────────────────────────────────────────────────────────┘
```
## changeSecond {#changesecond}

日付または日時の秒の要素を変更します。

**構文**

```sql
changeSecond(date_or_datetime, value)
```

**引数**

- `date_or_datetime` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)
- `value` - 秒の新しい値。 [Integer](../../sql-reference/data-types/int-uint.md)。

**戻り値**

- `date_or_datetime` と同じ型の値を返します。入力が [Date](../data-types/date.md) の場合、[DateTime](../data-types/datetime.md) を返します。入力が [Date32](../data-types/date32.md) の場合、[DateTime64](../data-types/datetime64.md) を返します。

**例**

```sql
SELECT changeSecond(toDate('1999-01-01'), 15), changeSecond(toDateTime64('1999-01-01 00:00:00.000', 3), 15);
```

結果:

```sql
┌─changeSecond(toDate('1999-01-01'), 15)─┬─changeSecond(toDateTime64('1999-01-01 00:00:00.000', 3), 15)─┐
│                    1999-01-01 00:00:15 │                                      1999-01-01 00:00:15.000 │
└────────────────────────────────────────┴──────────────────────────────────────────────────────────────┘
```
## addYears {#addyears}

日付、日時、または文字列でエンコードされた日付/日時に指定した数の年を追加します。

**構文**

```sql
addYears(date, num)
```

**引数**

- `date`: 指定した数の年を追加する日付 / 日時。[Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 追加する年数。(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**戻り値**

- `date` に `num` 年を加えた結果を返します。[Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

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

結果:

```sql
┌─add_years_with_date─┬─add_years_with_date_time─┬─add_years_with_date_time_string─┐
│          2025-01-01 │      2025-01-01 00:00:00 │         2025-01-01 00:00:00.000 │
└─────────────────────┴──────────────────────────┴─────────────────────────────────┘
```
## addQuarters {#addquarters}

日付、日時、または文字列でエンコードされた日付/日時に指定した数の四半期を追加します。

**構文**

```sql
addQuarters(date, num)
```

**引数**

- `date`: 指定した数の四半期を追加する日付 / 日時。[Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 追加する四半期の数。(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**戻り値**

- `date` に `num` 四半期を加えた結果を返します。[Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

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

結果:

```sql
┌─add_quarters_with_date─┬─add_quarters_with_date_time─┬─add_quarters_with_date_time_string─┐
│             2024-04-01 │         2024-04-01 00:00:00 │            2024-04-01 00:00:00.000 │
└────────────────────────┴─────────────────────────────┴────────────────────────────────────┘
```
## addMonths {#addmonths}

日付、日時、または文字列でエンコードされた日付/日時に指定した数の月を追加します。

**構文**

```sql
addMonths(date, num)
```

**引数**

- `date`: 指定した数の月を追加する日付 / 日時。[Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 追加する月の数。(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**戻り値**

- `date` に `num` 月を加えた結果を返します。[Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

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

結果:

```sql
┌─add_months_with_date─┬─add_months_with_date_time─┬─add_months_with_date_time_string─┐
│           2024-07-01 │       2024-07-01 00:00:00 │          2024-07-01 00:00:00.000 │
└──────────────────────┴───────────────────────────┴──────────────────────────────────┘
```
## addWeeks {#addweeks}

日付、日時、または文字列でエンコードされた日付/日時に指定した数の週を追加します。

**構文**

```sql
addWeeks(date, num)
```

**引数**

- `date`: 指定した数の週を追加する日付 / 日時。[Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 追加する週の数。(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**戻り値**

- `date` に `num` 週を加えた結果を返します。[Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

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

結果:

```sql
┌─add_weeks_with_date─┬─add_weeks_with_date_time─┬─add_weeks_with_date_time_string─┐
│          2024-02-05 │      2024-02-05 00:00:00 │         2024-02-05 00:00:00.000 │
└─────────────────────┴──────────────────────────┴─────────────────────────────────┘
```
## addDays {#adddays}

日付、日時、または文字列でエンコードされた日付/日時に指定した数の日を追加します。

**構文**

```sql
addDays(date, num)
```

**引数**

- `date`: 指定した数の日を追加する日付 / 日時。[Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 追加する日の数。(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**戻り値**

- `date` に `num` 日を加えた結果を返します。[Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

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

結果:

```sql
┌─add_days_with_date─┬─add_days_with_date_time─┬─add_days_with_date_time_string─┐
│         2024-01-06 │     2024-01-06 00:00:00 │        2024-01-06 00:00:00.000 │
└────────────────────┴─────────────────────────┴────────────────────────────────┘
```
## addHours {#addhours}

日付、日時、または文字列でエンコードされた日付/日時に指定した数の時間を追加します。

**構文**

```sql
addHours(date, num)
```

**引数**

- `date`: 指定した数の時間を追加する日付 / 日時。[Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 追加する時間の数。(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**戻り値**

- `date` に `num` 時間を加えた結果を返します。[Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

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

結果:

```sql
┌─add_hours_with_date─┬─add_hours_with_date_time─┬─add_hours_with_date_time_string─┐
│ 2024-01-01 12:00:00 │      2024-01-01 12:00:00 │         2024-01-01 12:00:00.000 │
└─────────────────────┴──────────────────────────┴─────────────────────────────────┘
```
## addMinutes {#addminutes}

日付、日時、または文字列でエンコードされた日付/日時に指定した数の分を追加します。

**構文**

```sql
addMinutes(date, num)
```

**引数**

- `date`: 指定した数の分を追加する日付 / 日時。[Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 追加する分の数。(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**戻り値**

- `date` に `num` 分を加えた結果を返します。[Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

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

結果:

```sql
┌─add_minutes_with_date─┬─add_minutes_with_date_time─┬─add_minutes_with_date_time_string─┐
│   2024-01-01 00:20:00 │        2024-01-01 00:20:00 │           2024-01-01 00:20:00.000 │
└───────────────────────┴────────────────────────────┴───────────────────────────────────┘
```
## addSeconds {#addseconds}

日付、日時、または文字列でエンコードされた日付/日時に指定した数の秒を追加します。

**構文**

```sql
addSeconds(date, num)
```

**引数**

- `date`: 指定した数の秒を追加する日付 / 日時。[Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 追加する秒の数。(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**戻り値**

- `date` に `num` 秒を加えた結果を返します。[Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

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

結果:

```sql
┌─add_seconds_with_date─┬─add_seconds_with_date_time─┬─add_seconds_with_date_time_string─┐
│   2024-01-01 00:00:30 │        2024-01-01 00:00:30 │           2024-01-01 00:00:30.000 │
└───────────────────────┴────────────────────────────┴───────────────────────────────────┘
```
## addMilliseconds {#addmilliseconds}

日時または文字列でエンコードされた日時に指定した数のミリ秒を追加します。

**構文**

```sql
addMilliseconds(date_time, num)
```

**引数**

- `date_time`: 指定した数のミリ秒を追加する日時。[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 追加するミリ秒の数。(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**戻り値**

- `date_time` に `num` ミリ秒を加えた結果を返します。[DateTime64](../data-types/datetime64.md)。

**例**

```sql
WITH
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    addMilliseconds(date_time, 1000) AS add_milliseconds_with_date_time,
    addMilliseconds(date_time_string, 1000) AS add_milliseconds_with_date_time_string
```

結果:

```sql
┌─add_milliseconds_with_date_time─┬─add_milliseconds_with_date_time_string─┐
│         2024-01-01 00:00:01.000 │                2024-01-01 00:00:01.000 │
└─────────────────────────────────┴────────────────────────────────────────┘
```
## addMicroseconds {#addmicroseconds}

日時または文字列でエンコードされた日時に指定した数のマイクロ秒を追加します。

**構文**

```sql
addMicroseconds(date_time, num)
```

**引数**

- `date_time`: 指定した数のマイクロ秒を追加する日時。[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 追加するマイクロ秒の数。(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**戻り値**

- `date_time` に `num` マイクロ秒を加えた結果を返します。[DateTime64](../data-types/datetime64.md)。

**例**

```sql
WITH
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    addMicroseconds(date_time, 1000000) AS add_microseconds_with_date_time,
    addMicroseconds(date_time_string, 1000000) AS add_microseconds_with_date_time_string
```

結果:

```sql
┌─add_microseconds_with_date_time─┬─add_microseconds_with_date_time_string─┐
│      2024-01-01 00:00:01.000000 │             2024-01-01 00:00:01.000000 │
└─────────────────────────────────┴────────────────────────────────────────┘
```
## addNanoseconds {#addnanoseconds}

日時または文字列でエンコードされた日時に指定した数のナノ秒を追加します。

**構文**

```sql
addNanoseconds(date_time, num)
```

**引数**

- `date_time`: 指定した数のナノ秒を追加する日時。[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 追加するナノ秒の数。(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**戻り値**

- `date_time` に `num` ナノ秒を加えた結果を返します。[DateTime64](../data-types/datetime64.md)。

**例**

```sql
WITH
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    addNanoseconds(date_time, 1000) AS add_nanoseconds_with_date_time,
    addNanoseconds(date_time_string, 1000) AS add_nanoseconds_with_date_time_string
```

結果:

```sql
┌─add_nanoseconds_with_date_time─┬─add_nanoseconds_with_date_time_string─┐
│  2024-01-01 00:00:00.000001000 │         2024-01-01 00:00:00.000001000 │
└────────────────────────────────┴───────────────────────────────────────┘
```
## addInterval {#addinterval}

ある間隔を別の間隔または間隔のタプルに追加します。

**構文**

```sql
addInterval(interval_1, interval_2)
```

**引数**

- `interval_1`: 最初の間隔または間隔のタプル。[interval](../data-types/special-data-types/interval.md)、[tuple](../data-types/tuple.md)([interval](../data-types/special-data-types/interval.md))。
- `interval_2`: 追加される第二の間隔。[interval](../data-types/special-data-types/interval.md)。

**戻り値**

- 間隔のタプルを返します。[tuple](../data-types/tuple.md)([interval](../data-types/special-data-types/interval.md))。

:::note
同じタイプの間隔は1つの間隔に結合されます。たとえば、`toIntervalDay(1)` と `toIntervalDay(2)` が渡されると、結果は `(3)` となり `(1,1)` にはなりません。
:::

**例**

クエリ:

```sql
SELECT addInterval(INTERVAL 1 DAY, INTERVAL 1 MONTH);
SELECT addInterval((INTERVAL 1 DAY, INTERVAL 1 YEAR), INTERVAL 1 MONTH);
SELECT addInterval(INTERVAL 2 DAY, INTERVAL 1 DAY);
```

結果:

```sql
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

日付または日時に対して間隔のタプルを順次追加します。

**構文**

```sql
addTupleOfIntervals(interval_1, interval_2)
```

**引数**

- `date`: 最初の間隔またはタプルの間隔。[date](../data-types/date.md)/[date32](../data-types/date32.md)/[datetime](../data-types/datetime.md)/[datetime64](../data-types/datetime64.md)。
- `intervals`: `date` に追加する間隔のタプル。[tuple](../data-types/tuple.md)([interval](../data-types/special-data-types/interval.md))。

**戻り値**

- `date` に追加された `intervals` を返します。[date](../data-types/date.md)/[date32](../data-types/date32.md)/[datetime](../data-types/datetime.md)/[datetime64](../data-types/datetime64.md)。

**例**

クエリ:

```sql
WITH toDate('2018-01-01') AS date
SELECT addTupleOfIntervals(date, (INTERVAL 1 DAY, INTERVAL 1 MONTH, INTERVAL 1 YEAR))
```

結果:

```sql
┌─addTupleOfIntervals(date, (toIntervalDay(1), toIntervalMonth(1), toIntervalYear(1)))─┐
│                                                                           2019-02-02 │
└──────────────────────────────────────────────────────────────────────────────────────┘
```
## subtractYears {#subtractyears}

日付、日時、または文字列でエンコードされた日付/日時から指定した数の年を引きます。

**構文**

```sql
subtractYears(date, num)
```

**引数**

- `date`: 指定した数の年を引く日付 / 日時。[Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 引く年数。(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**戻り値**

- `date` から `num` 年を引いた結果を返します。[Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

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

結果:

```sql
┌─subtract_years_with_date─┬─subtract_years_with_date_time─┬─subtract_years_with_date_time_string─┐
│               2023-01-01 │           2023-01-01 00:00:00 │              2023-01-01 00:00:00.000 │
└──────────────────────────┴───────────────────────────────┴──────────────────────────────────────┘
```
## subtractQuarters {#subtractquarters}

日付、日時、または文字列でエンコードされた日付/日時から指定した数の四半期を引きます。

**構文**

```sql
subtractQuarters(date, num)
```

**引数**

- `date`: 指定した数の四半期を引く日付 / 日時。[Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 引く四半期の数。(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**戻り値**

- `date` から `num` 四半期を引いた結果を返します。[Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

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

結果:

```sql
┌─subtract_quarters_with_date─┬─subtract_quarters_with_date_time─┬─subtract_quarters_with_date_time_string─┐
│                  2023-10-01 │              2023-10-01 00:00:00 │                 2023-10-01 00:00:00.000 │
└─────────────────────────────┴──────────────────────────────────┴─────────────────────────────────────────┘
```
## subtractMonths {#subtractmonths}

日付、日時、または文字列でエンコードされた日付/日時から指定した数の月を引きます。

**構文**

```sql
subtractMonths(date, num)
```

**引数**

- `date`: 指定した数の月を引く日付 / 日時。[Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 引く月の数。(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**戻り値**

- `date` から `num` 月を引いた結果を返します。[Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

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

結果:

```sql
┌─subtract_months_with_date─┬─subtract_months_with_date_time─┬─subtract_months_with_date_time_string─┐
│                2023-12-01 │            2023-12-01 00:00:00 │               2023-12-01 00:00:00.000 │
└───────────────────────────┴────────────────────────────────┴───────────────────────────────────────┘
```
## subtractWeeks {#subtractweeks}

日付、日時、または文字列でエンコードされた日付/日時から指定した数の週を引きます。

**構文**

```sql
subtractWeeks(date, num)
```

**引数**

- `date`: 指定した数の週を引く日付 / 日時。[Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 引く週の数。(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**戻り値**

- `date` から `num` 週を引いた結果を返します。[Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

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

結果:

```sql
 ┌─subtract_weeks_with_date─┬─subtract_weeks_with_date_time─┬─subtract_weeks_with_date_time_string─┐
 │               2023-12-25 │           2023-12-25 00:00:00 │              2023-12-25 00:00:00.000 │
 └──────────────────────────┴───────────────────────────────┴──────────────────────────────────────┘
```
## subtractDays {#subtractdays}

日付、日時、または文字列でエンコードされた日付/日時から指定した数の日を引きます。

**構文**

```sql
subtractDays(date, num)
```

**引数**

- `date`: 指定した数の日を引く日付 / 日時。[Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 引く日の数。(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**戻り値**

- `date` から `num` 日を引いた結果を返します。[Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

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

結果:

```sql
┌─subtract_days_with_date─┬─subtract_days_with_date_time─┬─subtract_days_with_date_time_string─┐
│              2023-12-01 │          2023-12-01 00:00:00 │             2023-12-01 00:00:00.000 │
└─────────────────────────┴──────────────────────────────┴─────────────────────────────────────┘
```
## subtractHours {#subtracthours}

日付、日時、または文字列でエンコードされた日付/日時から指定した数の時間を引きます。

**構文**

```sql
subtractHours(date, num)
```

**引数**

- `date`: 指定した数の時間を引く日付 / 日時。[Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[Datetime](../data-types/datetime.md)/[Datetime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 引く時間の数。(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**戻り値**

- `date` から `num` 時間を引いた結果を返します。[Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[Datetime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

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

結果:

```sql
┌─subtract_hours_with_date─┬─subtract_hours_with_date_time─┬─subtract_hours_with_date_time_string─┐
│      2023-12-31 12:00:00 │           2023-12-31 12:00:00 │              2023-12-31 12:00:00.000 │
└──────────────────────────┴───────────────────────────────┴──────────────────────────────────────┘
```
## subtractMinutes {#subtractminutes}

指定した分数を日付、日時、または文字列形式の日付/日時から減算します。

**構文**

```sql
subtractMinutes(date, num)
```

**パラメータ**

- `date`: 指定した分数を減算する日付/日時。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 減算する分数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**戻り値**

- `date` から `num` 分を減算した結果を返します。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

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

指定した秒数を日付、日時、または文字列形式の日付/日時から減算します。

**構文**

```sql
subtractSeconds(date, num)
```

**パラメータ**

- `date`: 指定した秒数を減算する日付/日時。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 減算する秒数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**戻り値**

- `date` から `num` 秒を減算した結果を返します。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

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

指定したミリ秒を日付と時刻、または文字列形式の日時から減算します。

**構文**

```sql
subtractMilliseconds(date_time, num)
```

**パラメータ**

- `date_time`: 指定したミリ秒を減算する日時。 [DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 減算するミリ秒の数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**戻り値**

- `date_time` から `num` ミリ秒を減算した結果を返します。 [DateTime64](../data-types/datetime64.md)。

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

指定したマイクロ秒を日付と時刻、または文字列形式の日時から減算します。

**構文**

```sql
subtractMicroseconds(date_time, num)
```

**パラメータ**

- `date_time`: 指定したマイクロ秒を減算する日時。 [DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 減算するマイクロ秒の数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**戻り値**

- `date_time` から `num` マイクロ秒を減算した結果を返します。 [DateTime64](../data-types/datetime64.md)。

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

指定したナノ秒を日付と時刻、または文字列形式の日時から減算します。

**構文**

```sql
subtractNanoseconds(date_time, num)
```

**パラメータ**

- `date_time`: 指定したナノ秒を減算する日時。 [DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 減算するナノ秒の数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**戻り値**

- `date_time` から `num` ナノ秒を減算した結果を返します。 [DateTime64](../data-types/datetime64.md)。

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

ネガティブインターバルを他のインターバルまたはインターバルのタプルから引きます。

**構文**

```sql
subtractInterval(interval_1, interval_2)
```

**パラメータ**

- `interval_1`: 最初のインターバルまたはタプルのインターバル。 [interval](../data-types/special-data-types/interval.md)、[tuple](../data-types/tuple.md)([interval](../data-types/special-data-types/interval.md))。
- `interval_2`: 反転させる2番目のインターバル。 [interval](../data-types/special-data-types/interval.md)。

**戻り値**

- インターバルのタプルを返します。 [tuple](../data-types/tuple.md)([interval](../data-types/special-data-types/interval.md))。

:::note
同じタイプのインターバルは1つのインターバルにまとめられます。例えば `toIntervalDay(2)` と `toIntervalDay(1)` が渡されると、結果は `(1)` になります。
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

日付または日時からインターバルのタプルを連続して引きます。

**構文**

```sql
subtractTupleOfIntervals(interval_1, interval_2)
```

**パラメータ**

- `date`: 最初のインターバルまたはタプルのインターバル。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。
- `intervals`: `date` から引くインターバルのタプル。 [tuple](../data-types/tuple.md)([interval](../data-types/special-data-types/interval.md))。

**戻り値**

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

'StartTime' から始まり 'Duration' 秒間続く時間間隔に対して、'Size' 秒単位に四捨五入されたこのインターバルの点からなる時間の配列を返します。 'Size' はオプションのパラメータで、デフォルトは 1800 (30 分) に設定されています。
これは、例えば、対応するセッション内のページビューを検索する際に必要です。
'StartTime' 引数には DateTime と DateTime64 を受け入れます。 DateTime の場合、'Duration' と 'Size' 引数は `UInt32` でなければなりません。 'DateTime64' の場合、これらは `Decimal64` でなければなりません。
DateTime/DateTime64 の配列を返します（戻り値の型は'StartTime' の型と一致します）。 DateTime64 の場合、戻り値のスケールは 'StartTime' のスケールと異なる可能性があり、与えられた引数の中で最も高いスケールが取られます。

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

```text
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

指定したフォーマット文字列に従って日時をフォーマットします。フォーマットは定数式であるため、単一の結果カラムに対して複数のフォーマットを持つことはできません。

formatDateTime は MySQL の日時フォーマットスタイルを使用します。詳しくは [こちら](https://dev.mysql.com/doc/refman/8.0/en/date-and-time-functions.html#function_date-format) を参照してください。

この関数の逆の操作は [parseDateTime](/sql-reference/functions/type-conversion-functions#parsedatetime) です。

エイリアス: `DATE_FORMAT`。

**構文**

```sql
formatDateTime(Time, Format[, Timezone])
```

**戻り値**

指定されたフォーマットに従った日時の値を返します。

**置換フィールド**

置換フィールドを使用して、結果文字列のパターンを定義できます。「例」カラムには `2018-01-02 22:33:44` のフォーマット結果が示されています。

| プレースホルダー | 説明                                                                                                                                                                                         | 例        |
|-----------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------|
| %a              | 省略形の曜日名 (月〜日)                                                                                                                                                                      | 月曜日    |
| %b              | 省略形の月名 (1月〜12月)                                                                                                                                                                    | 1月      |
| %c              | 月を整数として表現 (01〜12)。 '注記4' を参照                                                                                                                                                     | 01        |
| %C              | 100で割った年（整数に切り捨て、00〜99）の値                                                                                                                                                     | 20        |
| %d              | ゼロ埋めされた日（01〜31）                                                                                                                                                                   | 02        |
| %D              | 短い MM/DD/YY 日付、%m/%d/%y に相当                                                                                                                                                         | 01/02/18  |
| %e              | スペースで埋められた日（1〜31）、'注記5' を参照                                                                                                                                                  | &nbsp; 2  |
| %f              | 小数点以下の秒、'注記1' および '注記2' を参照                                                                                                                                               | 123456    |
| %F              | 短い YYYY-MM-DD 日付、%Y-%m-%d に相当                                                                                                                                                       | 2018-01-02 |
| %g              | ISO 8601 に合わせた2桁の年形式、4桁表記から省略された形式                                                                                                                                  | 18        |
| %G              | ISO 週番号のための4桁の年形式、[ISO 8601](https://en.wikipedia.org/wiki/ISO_8601#Week_dates)標準によって定義された週ベースの年から計算され、通常は %V とともに使用されます | 2018      |
| %h              | 12時間形式の時間 (01-12)                                                                                                                                                                    | 09        |
| %H              | 24時間形式の時間 (00-23)                                                                                                                                                                    | 22        |
| %i              | 分 (00-59)                                                                                                                                                                                  | 33        |
| %I              | 12時間形式の時間 (01-12)                                                                                                                                                                    | 10        |
| %j              | 年の何日目か (001-366)                                                                                                                                                                        | 002       |
| %k              | 24時間形式の時間 (00-23)、'注記4' を参照                                                                                                                                                       | 14        |
| %l              | 12時間形式の時間 (01-12)、'注記4' を参照                                                                                                                                                       | 09        |
| %m              | 月を整数として表現 (01-12)                                                                                                                                                                    | 01        |
| %M              | 完全な月名 (1月〜12月)、'注記3' を参照                                                                                                                                                          | 1月      |
| %n              | 改行文字 ( '')                                                                                                                                                                              |           |
| %p              | AM または PM の指定                                                                                                                                                                          | PM        |
| %Q              | 四半期 (1-4)                                                                                                                                                                                | 1         |
| %r              | 12時間の HH:MM AM/PM 時間、%h:%i %p に相当                                                                                                                                                    | 10:30 PM  |
| %R              | 24時間の HH:MM 時間、%H:%i に相当                                                                                                                                                            | 22:33     |
| %s              | 秒 (00-59)                                                                                                                                                                                  | 44        |
| %S              | 秒 (00-59)                                                                                                                                                                                  | 44        |
| %t              | 水平タブ文字 ( '')                                                                                                                                                                           |           |
| %T              | ISO 8601 時間フォーマット (HH:MM:SS)、%H:%i:%S に相当                                                                                                                                         | 22:33:44  |
| %u              | ISO 8601 曜日を数字で、月曜日を1（1-7）とする                                                                                                                                                 | 2         |
| %V              | ISO 8601 週番号 (01-53)                                                                                                                                                                       | 01        |
| %w              | 日曜日を0（0-6）として、整数で曜日を表現                                                                                                                                                     | 2         |
| %W              | 完全な曜日名 (月曜日〜日曜日)                                                                                                                                                                 | 月曜日    |
| %y              | 年の最後の2桁 (00-99)                                                                                                                                                                       | 18        |
| %Y              | 年                                                                                                                                                                                        | 2018      |
| %z              | +HHMM または -HHMM 形式のUTCオフセット                                                                                                                                                          | -0500     |
| %%              | % 記号                                                                                                                                                                                 | %         |

注記 1: ClickHouse のバージョンが v23.4 より前の場合、%f はフォーマット値が Date、Date32 または DateTime（小数点以下の秒なし）または精度が 0 の DateTime64 の場合、単一のゼロ (0) を印刷します。以前の動作は設定 `formatdatetime_f_prints_single_zero = 1` を使用して復元できます。

注記 2: ClickHouse のバージョンが v25.1 より前の場合、%f は提供された DateTime64 のスケールによって指定された桁数だけ印刷します。以前の動作は設定 `formatdatetime_f_prints_scale_number_of_digits= 1` を使用して復元できます。

注記 3: ClickHouse のバージョンが v23.4 より前の場合、%M は完全な月名 (1月〜12月) の代わりに分 (00-59) を印刷します。以前の動作は設定 `formatdatetime_parsedatetime_m_is_month_name = 0` を使用して復元できます。

注記 4: ClickHouse のバージョンが v23.11 より前の場合、`parseDateTime` 関数はフォーマッタ `%c`（月）と `%l`/`%k`（時間）のために先頭のゼロを要求しました。後のバージョンでは、先頭のゼロが省略できるようになりました。以前の動作は設定 `parsedatetime_parse_without_leading_zeros = 0` を使用して復元できます。関数 `formatDateTime` は、デフォルトで `%c` および `%l`/`%k` の先頭のゼロを印刷して、既存の使用ケースを壊さないようにします。この動作は設定 `formatdatetime_format_without_leading_zeros = 1` によって変更できます。

注記 5: ClickHouse のバージョンが v25.5 より前の場合、`parseDateTime` 関数はフォーマッタ `%e` に対して、1桁の日をスペースで埋めることを要求しました。後のバージョンでは、スペースでの埋めはオプションになり、`3` と ` 3` の両方が動作します。以前の動作を保持するには、設定 `parsedatetime_e_requires_space_padding = 1` を設定します。同様に、`formatDateTime` 関数内のフォーマッタ `%e` は、以前は単一桁を条件なしでスペースで埋めましたが、今はスペースなしで印刷します。以前の動作を保持するには、設定 `formatdatetime_e_with_space_padding = 1` を設定します。

**例**

```sql
SELECT formatDateTime(toDate('2010-01-04'), '%g')
```

結果:

```text
┌─formatDateTime(toDate('2010-01-04'), '%g')─┐
│ 10                                         │
└────────────────────────────────────────────┘
```

```sql
SELECT formatDateTime(toDateTime64('2010-01-04 12:34:56.123456', 7), '%f')
```

結果:

```sql
┌─formatDateTime(toDateTime64('2010-01-04 12:34:56.123456', 7), '%f')─┐
│ 1234560                                                             │
└─────────────────────────────────────────────────────────────────────┘
```

さらに、 `formatDateTime` 関数は、タイムゾーン名を含む3番目の文字列引数を受け取ることができます。例：`Asia/Istanbul`。この場合、時刻は指定されたタイムゾーンに従ってフォーマットされます。

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

formatDateTime と似ていますが、MySQLスタイルではなく Joda スタイルで日時をフォーマットします。詳しくは [こちら](https://joda-time.sourceforge.net/apidocs/org/joda/time/format/DateTimeFormat.html) を参照してください。

この関数の逆の操作は [parseDateTimeInJodaSyntax](/sql-reference/functions/type-conversion-functions#parsedatetimeinjodasyntax) です。

**置換フィールド**

置換フィールドを使用して、結果文字列のパターンを定義できます。

| プレースホルダー | 説明                              | プレゼンテーション | 例                          |
|-----------------|-----------------------------------|-------------------|-----------------------------|
| G               | 紀元                              | テキスト            | AD                          |
| C               | 紀元の世紀 (>=0)               | 数字                | 20                          |
| Y               | 紀元の年 (>=0)                  | 年                   | 1996                        |
| x               | 週年（未対応）                   | 年                   | 1996                        |
| w               | 週の週年（未対応）               | 数字                | 27                          |
| e               | 週の日                            | 数字                | 2                           |
| E               | 週の日                            | テキスト            | 火曜日; 火                 |
| y               | 年                               | 年                   | 1996                        |
| D               | 年の日                           | 数字                | 189                         |
| M               | 年の月                           | 月                  | 7月; 7月; 07              |
| d               | 月の日                           | 数字                | 10                          |
| a               | 半日の昼/夜                     | テキスト           | PM                          |
| K               | 半日の時 (0〜11)                | 数字                | 0                           |
| h               | 半日の時（1〜12）                | 数字                | 12                          |
| H               | 日の時（0〜23）                  | 数字                | 0                           |
| k               | 日の時（1〜24）                  | 数字                | 24                          |
| m               | 時の分                           | 数字                | 30                          |
| s               | 分の秒                           | 数字                | 55                          |
| S               | 秒の小数                         | 数字                | 978                         |
| z               | タイムゾーン                     | テキスト            | 東部標準時; EST            |
| Z               | タイムゾーンオフセット          | ゾーン              | -0800; -0812                |
| '               | テキスト用のエスケープ         | デリミタ            |                             |
| ''              | 単一引用符                       | リテラル            | '                           |

**例**

```sql
SELECT formatDateTimeInJodaSyntax(toDateTime('2010-01-04 12:34:56'), 'yyyy-MM-dd HH:mm:ss')
```

結果:

```java
┌─formatDateTimeInJodaSyntax(toDateTime('2010-01-04 12:34:56'), 'yyyy-MM-dd HH:mm:ss')─┐
│ 2010-01-04 12:34:56                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```
## dateName {#datename}

日付の指定された部分を返します。

**構文**

```sql
dateName(date_part, date)
```

**引数**

- `date_part` — 日付の部分。可能な値: 'year', 'quarter', 'month', 'week', 'dayofyear', 'day', 'weekday', 'hour', 'minute', 'second'。 [String](../data-types/string.md)。
- `date` — 日付。 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)。
- `timezone` — タイムゾーン。オプション。 [String](../data-types/string.md)。

**戻り値**

指定された日付部分。 [String](/sql-reference/data-types/string)

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

```sql
monthName(date)
```

**引数**

- `date` — 日付または日時。 [Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、または [DateTime64](../data-types/datetime64.md)。

**返される値**

- 月の名前。 [String](/sql-reference/data-types/string)

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

この関数はUnixタイムスタンプをカレンダーの日付および時刻に変換します。

次の2つの方法で呼び出すことができます:

1つの引数として [Integer](../data-types/int-uint.md) 型の値を与えられた場合、[DateTime](../data-types/datetime.md) 型の値を返します。つまり、[toDateTime](../../sql-reference/functions/type-conversion-functions.md#todatetime) のように動作します。

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

最初の引数が [Integer](../data-types/int-uint.md)、[Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md) 型の値で、2番目の引数が定数形式文字列、3番目の引数がオプションの定数タイムゾーン文字列の場合、この関数は [String](/sql-reference/data-types/string) 型の値を返します。つまり、[formatDateTime](#formatdatetime) のように動作します。この場合、[MySQLの日時形式スタイル](https://dev.mysql.com/doc/refman/8.0/en/date-and-time-functions.html#function_date-format) が使用されます。

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

[fromUnixTimestamp](#fromunixtimestamp) と同様ですが、2つまたは3つの引数で呼び出された場合、フォーマットはMySQLスタイルの代わりに[Jodaスタイル](https://joda-time.sourceforge.net/apidocs/org/joda/time/format/DateTimeFormat.html)を使用して行われます。

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

テキスト形式の[プロレプティックグレゴリオ暦](https://en.wikipedia.org/wiki/Proleptic_Gregorian_calendar)の日付 `YYYY-MM-DD` を[修正ジュリアン日](https://en.wikipedia.org/wiki/Julian_day#Variants)番号のInt32に変換します。この関数は `0000-01-01` から `9999-12-31` までの日付に対応しています。引数が日付として解析できない場合や、日付が無効な場合は例外が発生します。

**構文**

```sql
toModifiedJulianDay(date)
```

**引数**

- `date` — テキスト形式の日付。 [String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。

**返される値**

- 修正ジュリアン日番号。 [Int32](../data-types/int-uint.md)。

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

[toModifiedJulianDay()](#tomodifiedjulianday)と似ていますが、例外を発生させる代わりに`NULL`を返します。

**構文**

```sql
toModifiedJulianDayOrNull(date)
```

**引数**

- `date` — テキスト形式の日付。 [String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。

**返される値**

- 修正ジュリアン日番号。 [Nullable(Int32)](../data-types/int-uint.md)。

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

[修正ジュリアン日](https://en.wikipedia.org/wiki/Julian_day#Variants)番号をテキスト形式の[プロレプティックグレゴリオ暦](https://en.wikipedia.org/wiki/Proleptic_Gregorian_calendar)の日付 `YYYY-MM-DD` に変換します。この関数は `-678941` から `2973483` までの日数番号をサポートしています（これは `0000-01-01` および `9999-12-31` をそれぞれ表します）。日数番号がサポートされた範囲外の場合は例外が発生します。

**構文**

```sql
fromModifiedJulianDay(day)
```

**引数**

- `day` — 修正ジュリアン日番号。 [Any integral types](../data-types/int-uint.md)。

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

[fromModifiedJulianDayOrNull()](#frommodifiedjuliandayornull)と似ていますが、例外を発生させる代わりに`NULL`を返します。

**構文**

```sql
fromModifiedJulianDayOrNull(day)
```

**引数**

- `day` — 修正ジュリアン日番号。 [Any integral types](../data-types/int-uint.md)。

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

他のタイムゾーンからUTCタイムゾーンのタイムスタンプにDateTime/DateTime64型値を変換します。この関数は主にApache Sparkや同様のフレームワークとの互換性のために含まれています。

**構文**

```sql
toUTCTimestamp(time_val, time_zone)
```

**引数**

- `time_val` — DateTime/DateTime64型の定数値または式。 [DateTime/DateTime64 types](../data-types/datetime.md)
- `time_zone` — タイムゾーンを表す文字列型の定数値または式。 [String types](../data-types/string.md)

**返される値**

- テキスト形式のDateTime/DateTime64

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

UTCタイムゾーンから他のタイムゾーンのタイムスタンプにDateTime/DateTime64型値を変換します。この関数は主にApache Sparkや同様のフレームワークとの互換性のために含まれています。

**構文**

```sql
fromUTCTimestamp(time_val, time_zone)
```

**引数**

- `time_val` — DateTime/DateTime64型の定数値または式。 [DateTime/DateTime64 types](../data-types/datetime.md)
- `time_zone` — タイムゾーンを表す文字列型の定数値または式。 [String types](../data-types/string.md)

**返される値**

- テキスト形式のDateTime/DateTime64

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
この関数は `now('UTC')` が返すのと同じ結果を提供します。これはMySQLサポートのために追加されただけであり、[`now`](#now) が推奨される使用法です。
:::

**構文**

```sql
UTCTimestamp()
```

エイリアス: `UTC_timestamp`.

**返される値**

- クエリ解析の瞬間の現在の日付と時間を返します。 [DateTime](../data-types/datetime.md)。

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

2つの日付または日時付きの日付の差を返します。差は秒単位で計算されます。それは `dateDiff` と同じであり、MySQLサポートのために追加されただけです。`dateDiff` が推奨されます。

**構文**

```sql
timeDiff(first_datetime, second_datetime)
```

**引数**

- `first_datetime` — DateTime/DateTime64型の定数値または式。 [DateTime/DateTime64 types](../data-types/datetime.md)
- `second_datetime` — DateTime/DateTime64型の定数値または式。 [DateTime/DateTime64 types](../data-types/datetime.md)

**返される値**

2つの日付または日時付きの日付の差を秒単位で返します。

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

- ブログ: [ClickHouseでの時系列データの操作](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
