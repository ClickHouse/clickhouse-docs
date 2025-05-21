---
description: '日付と時間を扱う関数のドキュメント'
sidebar_label: '日付と時間'
sidebar_position: 45
slug: /sql-reference/functions/date-time-functions
title: '日付と時間を扱う関数'
---

# 日付と時間を扱う関数

このセクションのほとんどの関数は、オプションのタイムゾーン引数を受け入れます。例えば、`Europe/Amsterdam`です。この場合、指定されたタイムゾーンがローカル（デフォルト）のものではなくなります。

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
- 年と年の日引数から。

**構文**

```sql
makeDate(year, month, day);
makeDate(year, day_of_year);
```

エイリアス:
- `MAKEDATE(year, month, day);`
- `MAKEDATE(year, day_of_year);`

**引数**

- `year` — 年。[Integer](../data-types/int-uint.md)、[Float](../data-types/float.md)または[Decimal](../data-types/decimal.md)。
- `month` — 月。[Integer](../data-types/int-uint.md)、[Float](../data-types/float.md)または[Decimal](../data-types/decimal.md)。
- `day` — 日。[Integer](../data-types/int-uint.md)、[Float](../data-types/float.md)または[Decimal](../data-types/decimal.md)。
- `day_of_year` — 年の日。[Integer](../data-types/int-uint.md)、[Float](../data-types/float.md)または[Decimal](../data-types/decimal.md)。

**戻り値**

- 引数から作成された日付。[Date](../data-types/date.md)。

**例**

年、月、日から日付を作成:

```sql
SELECT makeDate(2023, 2, 28) AS Date;
```

結果:

```text
┌───────date─┐
│ 2023-02-28 │
└────────────┘
```

年と年の日引数から日付を作成:

```sql
SELECT makeDate(2023, 42) AS Date;
```

結果:

```text
┌───────date─┐
│ 2023-02-11 │
└────────────┘
```
## makeDate32 {#makedate32}

年、月、日（またはオプションで年と日）の値から[Date32](../../sql-reference/data-types/date32.md)型の日時を作成します。

**構文**

```sql
makeDate32(year, [month,] day)
```

**引数**

- `year` — 年。[Integer](../../sql-reference/data-types/int-uint.md)、[Float](../../sql-reference/data-types/float.md)または[Decimal](../../sql-reference/data-types/decimal.md)。
- `month` — 月（オプショナル）。[Integer](../../sql-reference/data-types/int-uint.md)、[Float](../../sql-reference/data-types/float.md)または[Decimal](../../sql-reference/data-types/decimal.md)。
- `day` — 日。[Integer](../../sql-reference/data-types/int-uint.md)、[Float](../../sql-reference/data-types/float.md)または[Decimal](../../sql-reference/data-types/decimal.md)。

:::note
`month`が省略されると、`day`は`1`から`365`の間の値を取らなければならず、そうでない場合は`1`から`31`の間の値を取る必要があります。
:::

**戻り値**

- 引数から作成された日付。[Date32](../../sql-reference/data-types/date32.md)。

**例**

年、月、日から日付を作成:

クエリ:

```sql
SELECT makeDate32(2024, 1, 1);
```

結果:

```response
2024-01-01
```

年と年の日から日付を作成:

クエリ:

```sql
SELECT makeDate32(2024, 100);
```

結果:

```response
2024-04-09
```
## makeDateTime {#makedatetime}

年、月、日、時、分、秒の引数から[DateTime](../data-types/datetime.md)を作成します。

**構文**

```sql
makeDateTime(year, month, day, hour, minute, second[, timezone])
```

**引数**

- `year` — 年。[Integer](../data-types/int-uint.md)、[Float](../data-types/float.md)または[Decimal](../data-types/decimal.md)。
- `month` — 月。[Integer](../data-types/int-uint.md)、[Float](../data-types/float.md)または[Decimal](../data-types/decimal.md)。
- `day` — 日。[Integer](../data-types/int-uint.md)、[Float](../data-types/float.md)または[Decimal](../data-types/decimal.md)。
- `hour` — 時。[Integer](../data-types/int-uint.md)、[Float](../data-types/float.md)または[Decimal](../data-types/decimal.md)。
- `minute` — 分。[Integer](../data-types/int-uint.md)、[Float](../data-types/float.md)または[Decimal](../data-types/decimal.md)。
- `second` — 秒。[Integer](../data-types/int-uint.md)、[Float](../data-types/float.md)または[Decimal](../data-types/decimal.md)。
- `timezone` — 戻り値の[Timezone](../../operations/server-configuration-parameters/settings.md#timezone)（オプショナル）。

**戻り値**

- 引数から作成された日時。[DateTime](../data-types/datetime.md)。

**例**

```sql
SELECT makeDateTime(2023, 2, 28, 17, 12, 33) AS DateTime;
```

結果:

```text
┌────────────DateTime─┐
│ 2023-02-28 17:12:33 │
└─────────────────────┘
```
## makeDateTime64 {#makedatetime64}

コンポーネントから[DateTime64](../../sql-reference/data-types/datetime64.md)データタイプの値を作成します：年、月、日、時、分、秒。オプションでミリ秒精度を指定できます。

**構文**

```sql
makeDateTime64(year, month, day, hour, minute, second[, precision])
```

**引数**

- `year` — 年（0-9999）。[Integer](../../sql-reference/data-types/int-uint.md)、[Float](../../sql-reference/data-types/float.md)または[Decimal](../../sql-reference/data-types/decimal.md)。
- `month` — 月（1-12）。[Integer](../../sql-reference/data-types/int-uint.md)、[Float](../../sql-reference/data-types/float.md)または[Decimal](../../sql-reference/data-types/decimal.md)。
- `day` — 日（1-31）。[Integer](../../sql-reference/data-types/int-uint.md)、[Float](../../sql-reference/data-types/float.md)または[Decimal](../../sql-reference/data-types/decimal.md)。
- `hour` — 時間（0-23）。[Integer](../../sql-reference/data-types/int-uint.md)、[Float](../../sql-reference/data-types/float.md)または[Decimal](../../sql-reference/data-types/decimal.md)。
- `minute` — 分（0-59）。[Integer](../../sql-reference/data-types/int-uint.md)、[Float](../../sql-reference/data-types/float.md)または[Decimal](../../sql-reference/data-types/decimal.md)。
- `second` — 秒（0-59）。[Integer](../../sql-reference/data-types/int-uint.md)、[Float](../../sql-reference/data-types/float.md)または[Decimal](../../sql-reference/data-types/decimal.md)。
- `precision` — サブ秒コンポーネントの精度のオプション（0-9）。[Integer](../../sql-reference/data-types/int-uint.md)。

**戻り値**

- 引数から作成された日時。[DateTime64](../../sql-reference/data-types/datetime64.md)。

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

最初の引数 'expr' を[DateTime64(6)](../data-types/datetime64.md)型に変換します。
2つ目の引数'expr_time'が提供されると、指定された時間を変換された値に加えます。

**構文**

```sql
timestamp(expr[, expr_time])
```

エイリアス: `TIMESTAMP`

**引数**

- `expr` - 日付または日時を含む日付。[String](../data-types/string.md)。
- `expr_time` - オプションのパラメータ。加算する時間。[String](../data-types/string.md)。

**例**

```sql
SELECT timestamp('2023-12-31') as ts;
```

結果:

```text
┌─────────────────────────ts─┐
│ 2023-12-31 00:00:00.000000 │
└────────────────────────────┘
```

```sql
SELECT timestamp('2023-12-31 12:00:00', '12:00:00.11') as ts;
```

結果:

```text
┌─────────────────────────ts─┐
│ 2024-01-01 00:00:00.110000 │
└────────────────────────────┘
```

**戻り値**

- [DateTime64](../data-types/datetime64.md)(6)
## timeZone {#timezone}

現在のセッションのタイムゾーンを返します。つまり、設定[session_timezone](../../operations/settings/settings.md#session_timezone)の値です。
関数が分散テーブルのコンテキストで実行される場合、各シャードに関連する値を含む通常のカラムを生成します。そうでない場合は、一定の値を生成します。

**構文**

```sql
timeZone()
```

エイリアス: `timezone`.

**戻り値**

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

サーバーのタイムゾーン、つまり設定[timezone](../../operations/server-configuration-parameters/settings.md#timezone)の値を返します。
関数が分散テーブルのコンテキストで実行される場合、各シャードに関連する値を含む通常のカラムを生成します。そうでない場合は、一定の値を生成します。

**構文**

```sql
serverTimeZone()
```

エイリアス: `serverTimezone`.

**戻り値**

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

日付または日時を指定されたタイムゾーンに変換します。データの内部値（Unix秒数）は変更せず、値のタイムゾーン属性と値の文字列表現のみが変更されます。

**構文**

```sql
toTimezone(value, timezone)
```

エイリアス: `toTimezone`.

**引数**

- `value` — 時間または日時。[DateTime64](../data-types/datetime64.md)。
- `timezone` — 戻り値のタイムゾーン。[String](../data-types/string.md)。この引数は定数であるため、`toTimezone`はカラムのタイムゾーンを変更します（タイムゾーンは`DateTime*`型の属性です）。

**戻り値**

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

```sql
timeZoneOf(value)
```

エイリアス: `timezoneOf`.

**引数**

- `value` — 日時。[DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md) 。

**戻り値**

- タイムゾーン名。[String](../data-types/string.md)。

**例**

```sql
SELECT timezoneOf(now());
```

結果:
```text
┌─timezoneOf(now())─┐
│ Etc/UTC           │
└───────────────────┘
```
## timeZoneOffset {#timezoneoffset}

[UTC](https://en.wikipedia.org/wiki/Coordinated_Universal_Time)からの秒単位のタイムゾーンオフセットを返します。
関数は[夏時間](https://en.wikipedia.org/wiki/Daylight_saving_time)と指定された日時における歴史的なタイムゾーンの変更を考慮に入れます。
[ IANAタイムゾーンドータベース](https://www.iana.org/time-zones)を使用してオフセットを計算します。

**構文**

```sql
timeZoneOffset(value)
```

エイリアス: `timezoneOffset`.

**引数**

- `value` — 日時。[DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)。

**戻り値**

- 秒単位でのUTCからのオフセット。[Int32](../data-types/int-uint.md)。

**例**

```sql
SELECT toDateTime('2021-04-21 10:20:30', 'America/New_York') AS Time, toTypeName(Time) AS Type,
       timeZoneOffset(Time) AS Offset_in_seconds, (Offset_in_seconds / 3600) AS Offset_in_hours;
```

結果:

```text
┌────────────────Time─┬─Type─────────────────────────┬─Offset_in_seconds─┬─Offset_in_hours─┐
│ 2021-04-21 10:20:30 │ DateTime('America/New_York') │            -14400 │              -4 │
└─────────────────────┴──────────────────────────────┴───────────────────┴─────────────────┘
```
## toYear {#toyear}

日付または日時の年の部分（西暦）を返します。

**構文**

```sql
toYear(value)
```

エイリアス: `YEAR`

**引数**

- `value` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) または[DateTime64](../data-types/datetime64.md)。

**戻り値**

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

日付または日時の四半期（1-4）を返します。

**構文**

```sql
toQuarter(value)
```

エイリアス: `QUARTER`

**引数**

- `value` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)。

**戻り値**

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

日付または日時の月の部分（1-12）を返します。

**構文**

```sql
toMonth(value)
```

エイリアス: `MONTH`

**引数**

- `value` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)。

**戻り値**

- 指定された日付/時間の月（1 - 12）。[UInt8](../data-types/int-uint.md)。

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

日付または日時の年内の日の数（1-366）を返します。

**構文**

```sql
toDayOfYear(value)
```

エイリアス: `DAYOFYEAR`

**引数**

- `value` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)。

**戻り値**

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

日付または日時の月内の日の数（1-31）を返します。

**構文**

```sql
toDayOfMonth(value)
```

エイリアス: `DAYOFMONTH`, `DAY`

**引数**

- `value` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)。

**戻り値**

- 指定された日付/時間の月の日（1 - 31）。[UInt8](../data-types/int-uint.md)。

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

日付または日時の週内の日の数を返します。

`toDayOfWeek()`の2引数形式では、週の最初の日が月曜日か日曜日か、戻り値が0から6の範囲か1から7の範囲であるかを指定できます。モード引数が省略されると、デフォルトモードは0です。日時のタイムゾーンを3番目の引数として指定できます。

| モード | 週の最初の日 | 範囲                                          |
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

- `t` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)。
- `mode` - 週の最初の日を決定します。可能な値は0, 1, 2または3です。上記の表での違いを参照してください。
- `timezone` - オプションのパラメータで、他の変換関数と同様に動作します。

最初の引数は、[parseDateTime64BestEffort()](type-conversion-functions.md#parsedatetime64besteffort)でサポートされる形式の[String](../data-types/string.md)としても指定できます。文字列引数のサポートは、特定のサードパーティツールによって期待されるMySQLとの互換性の理由でのみ存在します。文字列引数のサポートは、将来的に新しいMySQL互換性設定に依存するようにされる可能性があり、文字列パースは一般的に遅いため、使用することは推奨されません。

**戻り値**

- 指定された日付/時間の週の日（1-7）、選択したモードに応じて。

**例**

以下の日付は2023年4月21日金曜日です。

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

日時の時間部分（0-24）を返します。

時計が進められる場合、1時間進むと仮定し、午前2時に行われ、時計が元に戻される場合は、1時間戻ると仮定し、午前3時に行われます（正確にいつ行われるかはタイムゾーンによります）。

**構文**

```sql
toHour(value)
```

エイリアス: `HOUR`

**引数**

- `value` - [DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md) 。

**戻り値**

- 指定された日付/時間の時間（0 - 23）。[UInt8](../data-types/int-uint.md)。

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

日時の分部分（0-59）を返します。

**構文**

```sql
toMinute(value)
```

エイリアス: `MINUTE`

**引数**

- `value` - [DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)。

**戻り値**

- 指定された日付/時間の時間の分（0 - 59）。[UInt8](../data-types/int-uint.md)。

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

日時の秒部分（0-59）を返します。うるう秒は考慮されません。

**構文**

```sql
toSecond(value)
```

エイリアス: `SECOND`

**引数**

- `value` - [DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)。

**戻り値**

- 指定された日付/時間の分の秒（0 - 59）。[UInt8](../data-types/int-uint.md)。

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

日時のミリ秒部分（0-999）を返します。

**構文**

```sql
toMillisecond(value)
```

**引数**

- `value` - [DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md) 。

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

**戻り値**

- 指定された日付/時間の分のミリ秒（0 - 59）。[UInt16](../data-types/int-uint.md)。
## toUnixTimestamp {#tounixtimestamp}

文字列、日付または日時を[Unix Timestamp](https://en.wikipedia.org/wiki/Unix_time)に変換し、`UInt32`形式で返します。

関数が文字列で呼び出された場合、オプションのタイムゾーン引数を受け入れます。

**構文**

```sql
toUnixTimestamp(date)
toUnixTimestamp(str, [timezone])
```

**戻り値**

- Unixタイムスタンプを返します。[UInt32](../data-types/int-uint.md)。

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

結果:

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
`toStartOf*`、`toLastDayOf*`、`toMonday`、`timeSlot`関数の戻り値の型は、設定パラメータ[enable_extended_results_for_datetime_functions](/operations/settings/settings#enable_extended_results_for_datetime_functions)により決まります。このパラメータはデフォルトでは`0`です。

動作は以下の通りです。
* `enable_extended_results_for_datetime_functions = 0`:
  * 関数`toStartOfYear`、`toStartOfISOYear`、`toStartOfQuarter`、`toStartOfMonth`、`toStartOfWeek`、`toLastDayOfWeek`、`toLastDayOfMonth`、`toMonday`は引数が`Date`または`DateTime`であれば`Date`または`DateTime`を返し、引数が`Date32`または`DateTime64`であれば`Date32`または`DateTime64`を返しません。
  * 関数`toStartOfDay`、`toStartOfHour`、`toStartOfFifteenMinutes`、`toStartOfTenMinutes`、`toStartOfFiveMinutes`、`toStartOfMinute`、`timeSlot`は引数が`Date`または`DateTime`であれば`DateTime`を返し、引数が`Date32`または`DateTime64`であれば`DateTime64`を返すことを含め、通常の範囲外の時間を渡すと（1970年から2149年の`Date` / 2106年の`DateTime`）は誤った結果になります。
* `enable_extended_results_for_datetime_functions = 1`:
  * 関数`toStartOfYear`、`toStartOfISOYear`、`toStartOfQuarter`、`toStartOfMonth`、`toStartOfWeek`、`toLastDayOfWeek`、`toLastDayOfMonth`、`toMonday`は引数が`Date`または`DateTime`であれば`Date`または`DateTime`を返し、引数が`Date32`または`DateTime64`であれば`Date32`または`DateTime64`を返します。
  * 関数`toStartOfDay`、`toStartOfHour`、`toStartOfFifteenMinutes`、`toStartOfTenMinutes`、`toStartOfFiveMinutes`、`toStartOfMinute`、`timeSlot`は引数が`Date`や`DateTime`の時は`DateTime`を返し、引数が`Date32`や`DateTime64`の時は`DateTime64`を返します。
:::
## toStartOfYear {#tostartofyear}

日付または日時を年の最初の日に切り下げます。日付を`Date`オブジェクトとして返します。

**構文**

```sql
toStartOfYear(value)
```

**引数**

- `value` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)。

**戻り値**

- 入力された日付/時間の年の最初の日。[Date](../data-types/date.md)。

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

日付または日時をISO年の最初の日に切り下げます。ISO年は通常の年と異なることがあります。（詳細は[https://en.wikipedia.org/wiki/ISO_week_date](https://en.wikipedia.org/wiki/ISO_week_date)を参照してください）。

**構文**

```sql
toStartOfISOYear(value)
```

**引数**

- `value` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)。

**戻り値**

- 入力された日付/時間のISO年の最初の日。[Date](../data-types/date.md)。

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

日付または日時を四半期の最初の日に切り下げます。四半期の最初の日は、1月1日、4月1日、7月1日、または10月1日です。
日付を返します。

**構文**

```sql
toStartOfQuarter(value)
```

**引数**

- `value` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)。

**戻り値**

- 指定された日付/時間の四半期の最初の日。[Date](../data-types/date.md)。

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

日付または日時を月の最初の日に切り下げます。日付を返します。

**構文**

```sql
toStartOfMonth(value)
```

**引数**

- `value` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)。

**戻り値**

- 指定された日付/時間の月の最初の日。[Date](../data-types/date.md)。

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
不正な日付の解析の動作は、実装によって異なります。ClickHouseはゼロ日付を返すこともあれば、例外をスローしたり、"自然"オーバーフローを行うこともあります。
:::
## toLastDayOfMonth {#tolastdayofmonth}

日時を月の最終日に切り下げます。日付を返します。

**構文**

```sql
toLastDayOfMonth(value)
```

エイリアス: `LAST_DAY`

**引数**

- `value` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)。

**戻り値**

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

日付または日時を最寄りの月曜日に切り下げます。日付を返します。

**構文**

```sql
toMonday(value)
```

**引数**

- `value` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)または[DateTime64](../data-types/datetime64.md)。

**戻り値**

- 指定された日付に最も近い月曜日の日付。[Date](../data-types/date.md)。

**例**

```sql
SELECT
    toMonday(toDateTime('2023-04-21 10:20:30')), /* 金曜日 */
    toMonday(toDate('2023-04-24')); /* すでに月曜日 */
```

結果:

```response
┌─toMonday(toDateTime('2023-04-21 10:20:30'))─┬─toMonday(toDate('2023-04-24'))─┐
│                                  2023-04-17 │                     2023-04-24 │
└─────────────────────────────────────────────┴────────────────────────────────┘
```
```yaml
title: 'toStartOfWeek'
sidebar_label: 'toStartOfWeek'
keywords: ['toStartOfWeek', 'ClickHouse', '関数']
description: '日付を最も近い日曜日または月曜日に切り捨てて、日付を返します。'
```

## toStartOfWeek {#tostartofweek}

日付または時間付きの日付を最も近い日曜日または月曜日に切り捨てます。日付を返します。mode引数は`toWeek()`関数のmode引数と正確に同じように機能します。modeが指定されていない場合は、デフォルトで0になります。

**構文**

```sql
toStartOfWeek(t[, mode[, timezone]])
```

**引数**

- `t` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)
- `mode` - [toWeek()](#toweek)関数で説明されるように、週の最初の日を決定します
- `timezone` - オプションのパラメーターで、他の変換関数のように機能します

**返される値**

- 指定された日付に基づき、最も近い日曜日または月曜日の日付（modeに応じて）。[Date](../data-types/date.md)。

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

日付または時間付きの日付を最も近い土曜日または日曜日に切り上げます。日付を返します。
mode引数は`toWeek()`関数のmode引数と正確に同じように機能します。modeが指定されていない場合、modeは0と見なされます。

**構文**

```sql
toLastDayOfWeek(t[, mode[, timezone]])
```

**引数**

- `t` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)
- `mode` - [toWeek](#toweek)関数で説明されるように、週の最終日を決定します
- `timezone` - オプションのパラメーターで、他の変換関数のように機能します

**返される値**

- 指定された日付に基づき、最も近い日曜日または月曜日の日付（modeに応じて）。[Date](../data-types/date.md)。

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

時間付きの日付をその日の開始時刻に切り捨てます。

**構文**

```sql
toStartOfDay(value)
```

**引数**

- `value` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)

**返される値**

- 指定された日付/時間の開始時刻。[DateTime](../data-types/datetime.md)。

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

時間付きの日付をその時の開始時刻に切り捨てます。

**構文**

```sql
toStartOfHour(value)
```

**引数**

- `value` - [DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)

**返される値**

- 指定された日付/時間の開始時刻。[DateTime](../data-types/datetime.md)。

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

時間付きの日付をその分の開始時刻に切り捨てます。

**構文**

```sql
toStartOfMinute(value)
```

**引数**

- `value` - [DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)

**返される値**

- 指定された日付/時間の開始時刻。[DateTime](../data-types/datetime.md)。

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

- `value` — 日付と時間。[DateTime64](../data-types/datetime64.md)。
- `timezone` — 戻り値の[タイムゾーン](../../operations/server-configuration-parameters/settings.md#timezone)（オプション）。指定しない場合、関数は`value`パラメータのタイムゾーンを使用します。[String](../data-types/string.md)。

**返される値**

- サブ秒のない入力値。[DateTime64](../data-types/datetime64.md)。

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

**関連事項**

- [タイムゾーン](../../operations/server-configuration-parameters/settings.md#timezone)サーバー構成パラメーター。

## toStartOfMillisecond {#tostartofmillisecond}

時間付きの日付をミリ秒の開始時刻に切り捨てます。

**構文**

```sql
toStartOfMillisecond(value, [timezone])
```

**引数**

- `value` — 日付と時間。[DateTime64](../../sql-reference/data-types/datetime64.md)。
- `timezone` — 戻り値の[タイムゾーン](../../operations/server-configuration-parameters/settings.md#timezone)（オプション）。指定しない場合、関数は`value`パラメータのタイムゾーンを使用します。[String](../../sql-reference/data-types/string.md)。

**返される値**

- サブミリ秒のある入力値。[DateTime64](../../sql-reference/data-types/datetime64.md)。

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
SELECT toStartOfMillisecond(dt64, 'Asia/Istanbul');
```

結果:

```text
┌─toStartOfMillisecond(dt64, 'Asia/Istanbul')─┐
│               2020-01-01 12:20:30.999000000 │
└─────────────────────────────────────────────┘
```

## toStartOfMicrosecond {#tostartofmicrosecond}

時間付きの日付をマイクロ秒の開始時刻に切り捨てます。

**構文**

```sql
toStartOfMicrosecond(value, [timezone])
```

**引数**

- `value` — 日付と時間。[DateTime64](../../sql-reference/data-types/datetime64.md)。
- `timezone` — 戻り値の[タイムゾーン](../../operations/server-configuration-parameters/settings.md#timezone)（オプション）。指定しない場合、関数は`value`パラメータのタイムゾーンを使用します。[String](../../sql-reference/data-types/string.md)。

**返される値**

- サブマイクロ秒のある入力値。[DateTime64](../../sql-reference/data-types/datetime64.md)。

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

**関連事項**

- [タイムゾーン](../../operations/server-configuration-parameters/settings.md#timezone)サーバー構成パラメーター。

## toStartOfNanosecond {#tostartofnanosecond}

時間付きの日付をナノ秒の開始時刻に切り捨てます。

**構文**

```sql
toStartOfNanosecond(value, [timezone])
```

**引数**

- `value` — 日付と時間。[DateTime64](../../sql-reference/data-types/datetime64.md)。
- `timezone` — 戻り値の[タイムゾーン](../../operations/server-configuration-parameters/settings.md#timezone)（オプション）。指定しない場合、関数は`value`パラメータのタイムゾーンを使用します。[String](../../sql-reference/data-types/string.md)。

**返される値**

- サブナノ秒のある入力値。[DateTime64](../../sql-reference/data-types/datetime64.md)。

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

**関連事項**

- [タイムゾーン](../../operations/server-configuration-parameters/settings.md#timezone)サーバー構成パラメーター。

## toStartOfFiveMinutes {#tostartoffiveminutes}

時間付きの日付を5分間隔の開始時刻に切り捨てます。

**構文**

```sql
toStartOfFiveMinutes(value)
```

**引数**

- `value` - [DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)

**返される値**

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

時間付きの日付を10分間隔の開始時刻に切り捨てます。

**構文**

```sql
toStartOfTenMinutes(value)
```

**引数**

- `value` - [DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)

**返される値**

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

時間付きの日付を15分間隔の開始時刻に切り捨てます。

**構文**

```sql
toStartOfFifteenMinutes(value)
```

**引数**

- `value` - [DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)

**返される値**

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

この関数は、`toStartOf*()`関数を一般化し、`toStartOfInterval(date_or_date_with_time, INTERVAL x unit [, time_zone])`構文を使用します。
例えば:
- `toStartOfInterval(t, INTERVAL 1 YEAR)`は`toStartOfYear(t)`と同じ結果を返します。
- `toStartOfInterval(t, INTERVAL 1 MONTH)`は`toStartOfMonth(t)`と同じ結果を返します。
- `toStartOfInterval(t, INTERVAL 1 DAY)`は`toStartOfDay(t)`と同じ結果を返します。
- `toStartOfInterval(t, INTERVAL 15 MINUTE)`は`toStartOfFifteenMinutes(t)`と同じ結果を返します。

計算は特定の時点に対して行われます:

| インターバル     | 開始                   |
|------------------|------------------------|
| YEAR             | year 0                 |
| QUARTER          | 1900 Q1                |
| MONTH            | 1900年1月             |
| WEEK             | 1970年第1週 (01-05)    |
| DAY              | 1970-01-01             |
| HOUR             | (*)                    |
| MINUTE           | 1970-01-01 00:00:00    |
| SECOND           | 1970-01-01 00:00:00    |
| MILLISECOND      | 1970-01-01 00:00:00    |
| MICROSECOND      | 1970-01-01 00:00:00    |
| NANOSECOND       | 1970-01-01 00:00:00    |

(*) 時間のインターバルは特別です: 計算は常に当日の00:00:00 (真夜中) を基準にして行われます。その結果、1から23の範囲の時間値だけが有用です。

`WEEK`が指定されている場合、`toStartOfInterval`は週が月曜日から始まることを想定します。この動作は、週がデフォルトで日曜日から始まる`toStartOfWeek`関数とは異なります。

**構文**

```sql
toStartOfInterval(value, INTERVAL x unit[, time_zone])
toStartOfInterval(value, INTERVAL x unit[, origin[, time_zone]])
```

エイリアス: `time_bucket`, `date_bin`.

2番目のオーバーロードは、TimescaleDBの`time_bucket()`関数、およびPostgreSQLの`date_bin()`関数をエミュレートします。例:

```SQL
SELECT toStartOfInterval(toDateTime('2023-01-01 14:45:00'), INTERVAL 1 MINUTE, toDateTime('2023-01-01 14:35:30'));
```

結果:

```reference
┌───toStartOfInterval(...)─┐
│      2023-01-01 14:44:30 │
└──────────────────────────┘
```

**関連事項**
- [date_trunc](#date_trunc)

## toTimeWithFixedDate {#totimewithfixeddate}

時間付きの日付を特定の固定日付に変換し、時間を保持します。

**構文**

```sql
toTimeWithFixedDate(date[,timezone])
```

エイリアス: `toTime` - `use_legacy_to_time`設定が有効な場合のみ使用できます。

**引数**

- `date` — 時間に変換する日付。[Date](../data-types/date.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。
- `timezone`（オプション） — 戻り値のタイムゾーン。[String](../data-types/string.md)。

**返される値**

- 時刻を保持しつつ、日付を`1970-01-02`に等しくしたDateTime。[DateTime](../data-types/datetime.md)。

:::note
入力引数`date`がサブ秒の要素を含んでいる場合、戻り値の`DateTime`では秒精度で切り捨てられます。
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

日付または時間付きの日付を、過去の特定の固定ポイントから経過した年数に変換します。

**構文**

```sql
toRelativeYearNum(date)
```

**引数**

- `date` — 日付または時間付きの日付。[Date](../data-types/date.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**返される値**

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

日付または時間付きの日付を、過去の特定の固定ポイントから経過した四半期数に変換します。

**構文**

```sql
toRelativeQuarterNum(date)
```

**引数**

- `date` — 日付または時間付きの日付。[Date](../data-types/date.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**返される値**

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

日付または時間付きの日付を、過去の特定の固定ポイントから経過した月数に変換します。

**構文**

```sql
toRelativeMonthNum(date)
```

**引数**

- `date` — 日付または時間付きの日付。[Date](../data-types/date.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**返される値**

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

日付または時間付きの日付を、過去の特定の固定ポイントから経過した週数に変換します。

**構文**

```sql
toRelativeWeekNum(date)
```

**引数**

- `date` — 日付または時間付きの日付。[Date](../data-types/date.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**返される値**

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

日付または時間付きの日付を、過去の特定の固定ポイントから経過した日数に変換します。

**構文**

```sql
toRelativeDayNum(date)
```

**引数**

- `date` — 日付または時間付きの日付。[Date](../data-types/date.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**返される値**

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

日付または時間付きの日付を、過去の特定の固定ポイントから経過した時間数に変換します。

**構文**

```sql
toRelativeHourNum(date)
```

**引数**

- `date` — 日付または時間付きの日付。[Date](../data-types/date.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**返される値**

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

日付または時間付きの日付を、過去の特定の固定ポイントから経過した分数に変換します。

**構文**

```sql
toRelativeMinuteNum(date)
```

**引数**

- `date` — 日付または時間付きの日付。[Date](../data-types/date.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**返される値**

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

日付または時間付きの日付を、過去の特定の固定ポイントから経過した秒数に変換します。

**構文**

```sql
toRelativeSecondNum(date)
```

**引数**

- `date` — 日付または時間付きの日付。[Date](../data-types/date.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**返される値**

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

日付または時間付きの日付をISO年を含むUInt16番号に変換します。

**構文**

```sql
toISOYear(value)
```

**引数**

- `value` — 日付または時間付きの日付の値。[Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)

**返される値**

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

日付または時間付きの日付を含むUInt8番号に変換し、ISO週番号を返します。

**構文**

```sql
toISOWeek(value)
```

**引数**

- `value` — 日付または時間付きの日付の値。

**返される値**

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

この関数は、日付または日付時間の週番号を返します。`toWeek()`の2引数形式を使用すると、週の始まりを日曜日または月曜日に指定でき、戻り値が0から53の範囲または1から53の範囲になるかどうかを指定できます。mode引数が省略された場合は、デフォルトのmodeは0です。

`toISOWeek()`は、`toWeek(date,3)`と等しい互換性関数です。

以下の表は、mode引数の動作を説明しています。

| モード | 週の最初の日 | 範囲 | 週1は次の週の最初の週 ... |
|--------|---------------|-------|-----------------------------|
| 0      | 日曜日      | 0-53  | その年のこの日に日曜日がある場合 |
| 1      | 月曜日      | 0-53  | その年に4日以上ある場合    |
| 2      | 日曜日      | 1-53  | その年のこの日に日曜日がある場合 |
| 3      | 月曜日      | 1-53  | その年に4日以上ある場合    |
| 4      | 日曜日      | 0-53  | その年に4日以上ある場合    |
| 5      | 月曜日      | 0-53  | その年のこの日に月曜日がある場合 |
| 6      | 日曜日      | 1-53  | その年に4日以上ある場合    |
| 7      | 月曜日      | 1-53  | その年のこの日に月曜日がある場合 |
| 8      | 日曜日      | 1-53  | 1月1日を含む               |
| 9      | 月曜日      | 1-53  | 1月1日を含む               |

4日以上ある年の意味を持つモード値の場合、週はISO 8601:1988に従って番号付けされます。

- 1月1日を含む週に4日以上の新しい年がある場合、その週は週1になります。
- そうでない場合は、前の年の最後の週と見なされ、次の週は週1になります。

1月1日を含むという意味のモード値の場合、週は1月1日が含まれている週であり、その年に含まれる日数は関係ありません。たとえ次の年の最終週が1月1日を含んでいる場合でも、次の年の週1になります。

**構文**

```sql
toWeek(t[, mode[, timezone]])
```

エイリアス: `WEEK`

**引数**

- `t` – 日付またはDateTime。
- `mode` – オプションのパラメーター、値の範囲は\[0,9\]、デフォルトは0。
- `timezone` – オプションのパラメーターで、他の変換関数のように機能します。

最初の引数は、[String](../data-types/string.md)としても指定できます。`parseDateTime64BestEffort()`でサポートされている形式です。文字列引数のサポートは、特定のサードパーティツールによって期待されるMySQLとの互換性の理由でのみ存在します。文字列引数のサポートは将来的にMySQL互換設定の新しいものに依存する可能性があり、文字列解析は一般的に遅いため、使用しないことをお勧めします。

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

日付の年と週を返します。結果の年は、年の最初および最後の週の場合、日付引数の年とは異なる場合があります。

mode引数は、`toWeek()`のmode引数と同様に機能します。シングル引数構文の場合は、モード値0が使用されます。

`toISOYear()`は、`intDiv(toYearWeek(date,3),100)`に等しい互換性関数です。

:::warning
`toYearWeek()`が返す週番号は、`toWeek()`が返すものとは異なる場合があります。`toWeek()`は常に与えられた年のコンテキスト内の週番号を返し、もし`toWeek()`が`0`を返す場合、`toYearWeek()`は前の年の最後の週に対応する値を返します。以下の例の`prev_yearWeek`を参照してください。
:::

**構文**

```sql
toYearWeek(t[, mode[, timezone]])
```

エイリアス: `YEARWEEK`

最初の引数は、[String](../data-types/string.md)としても指定できます。`parseDateTime64BestEffort()`でサポートされている形式です。文字列引数のサポートは、特定のサードパーティツールによるMySQLとの互換性の理由でのみ存在します。文字列引数のサポートは将来的にMySQL互換設定に依存する可能性があります。文字列解析は一般的に遅いため、使用しないことをお勧めします。

**例**

```sql
SELECT toDate('2016-12-27') AS date, toYearWeek(date) AS yearWeek0, toYearWeek(date,1) AS yearWeek1, toYearWeek(date,9) AS yearWeek9, toYearWeek(toDate('2022-01-01')) AS prev_yearWeek;
```

```text
┌───────date─┬─yearWeek0─┬─yearWeek1─┬─yearWeek9─┬─prev_yearWeek─┐
│ 2016-12-27 │    201652 │    201652 │    201701 │        202152 │
└────────────┴───────────┴───────────┴───────────┴─────────────────┘
```

## toDaysSinceYearZero {#todayssinceyearzero}

指定された日付から、[プロレプティック・グレゴリオ暦による0000年1月1日](https://ja.wikipedia.org/wiki/Year_zero)から経過した日数を返します。この計算はMySQLの[`TO_DAYS()`](https://dev.mysql.com/doc/refman/8.0/en/date-and-time-functions.html#function_to-days)関数と同じです。

**構文**

```sql
toDaysSinceYearZero(date[, time_zone])
```

エイリアス: `TO_DAYS`

**引数**

- `date` — 年ゼロから経過した日数を計算する日付。[Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)。
- `time_zone` — タイムゾーンを表す文字列型の定数値または式。[String types](../data-types/string.md)

**返される値**

0000-01-01から経過した日数。 [UInt32](../data-types/int-uint.md)。

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

**関連事項**

- [fromDaysSinceYearZero](#fromdayssinceyearzero)
```

## fromDaysSinceYearZero {#fromdayssinceyearzero}

指定された日数が[0000年1月1日](https://en.wikipedia.org/wiki/Year_zero)から経過している場合に、その日数に対応する日付を[ISO 8601で定義されたプロレプティックグレゴリオ暦](https://en.wikipedia.org/wiki/Gregorian_calendar#Proleptic_Gregorian_calendar)で返します。計算はMySQLの[`FROM_DAYS()`](https://dev.mysql.com/doc/refman/8.0/en/date-and-time-functions.html#function_from-days)関数と同じです。

[Date](../data-types/date.md)タイプの範囲内で表現できない場合、結果は未定義です。

**構文**

```sql
fromDaysSinceYearZero(days)
```

別名: `FROM_DAYS`

**引数**

- `days` — 年ゼロから経過した日数。

**戻り値**

年ゼロから経過した日数に対応する日付。[Date](../data-types/date.md)。

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

**関連機能**

- [toDaysSinceYearZero](#todayssinceyearzero)
## fromDaysSinceYearZero32 {#fromdayssinceyearzero32}

[fromDaysSinceYearZero](#fromdayssinceyearzero)と同様ですが、[Date32](../data-types/date32.md)を返します。
## age {#age}

`startdate`と`enddate`の差の`unit`コンポーネントを返します。差は1ナノ秒の精度で計算されます。
例: `2021-12-29`と`2022-01-01`の差は、`day`単位で3日、`month`単位で0ヶ月、`year`単位で0年です。

`age`の代替機能として、`date_diff`関数を参照してください。

**構文**

```sql
age('unit', startdate, enddate, [timezone])
```

**引数**

- `unit` — 結果の間隔のタイプ。[String](../data-types/string.md)。
    使用可能な値:

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

- `startdate` — 最初に引く時間の値（被減数）。[Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)、または[DateTime64](../data-types/datetime64.md)。

- `enddate` — 引かれる2番目の時間の値（減数）。[Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)、または[DateTime64](../data-types/datetime64.md)。

- `timezone` — [タイムゾーン名](../../operations/server-configuration-parameters/settings.md#timezone)（オプション）。指定された場合、`startdate`と`enddate`の両方に適用されます。指定されていない場合は、`startdate`と`enddate`のタイムゾーンが使用されます。異なる場合、結果は未定義です。[String](../data-types/string.md)。

**戻り値**

`enddate`と`startdate`の差を`unit`で表現した値。[Int](../data-types/int-uint.md)。

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

`startdate`と`enddate`間に越えた指定された`unit`境界の数を返します。
差は相対的な単位を使用して計算されます。例: `2021-12-29`と`2022-01-01`の差は、`day`単位で3日（[toRelativeDayNum](#torelativedaynum)参照）、`month`単位で1ヶ月（[toRelativeMonthNum](#torelativemonthnum)参照）、`year`単位で1年（[toRelativeYearNum](#torelativeyearnum)参照）です。

`week`単位が指定された場合、`date_diff`は週が月曜日から始まると仮定します。この動作は、週がデフォルトで日曜日から始まる`toWeek()`関数とは異なります。

`date_diff`の代替として、`age`関数を参照してください。

**構文**

```sql
date_diff('unit', startdate, enddate, [timezone])
```

別名: `dateDiff`, `DATE_DIFF`, `timestampDiff`, `timestamp_diff`, `TIMESTAMP_DIFF`.

**引数**

- `unit` — 結果の間隔のタイプ。[String](../data-types/string.md)。
    使用可能な値:

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

- `startdate` — 最初に引く時間の値（被減数）。[Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)、または[DateTime64](../data-types/datetime64.md)。

- `enddate` — 引かれる2番目の時間の値（減数）。[Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)、または[DateTime64](../data-types/datetime64.md)。

- `timezone` — [タイムゾーン名](../../operations/server-configuration-parameters/settings.md#timezone)（オプション）。指定された場合、`startdate`と`enddate`の両方に適用されます。指定されていない場合は、`startdate`と`enddate`のタイムゾーンが使用されます。異なる場合、結果は未定義です。[String](../data-types/string.md)。

**戻り値**

`enddate`と`startdate`の差を`unit`で表現した値。[Int](../data-types/int-uint.md)。

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

別名: `dateTrunc`。

**引数**

- `unit` — 結果を切り捨てるための間隔のタイプ。[String Literal](/sql-reference/syntax#string)。
    使用可能な値:

    - `nanosecond` - DateTime64専用
    - `microsecond` - DateTime64専用
    - `millisecond` - DateTime64専用
    - `second`
    - `minute`
    - `hour`
    - `day`
    - `week`
    - `month`
    - `quarter`
    - `year`

    `unit`引数は大文字と小文字を区別しません。

- `value` — 日付と時刻。[Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)、または[DateTime64](../data-types/datetime64.md)。
- `timezone` — 戻り値の[タイムゾーン名](../../operations/server-configuration-parameters/settings.md#timezone)（オプション）。指定されていない場合、関数は`value`パラメータのタイムゾーンを使用します。[String](../data-types/string.md)。

**戻り値**

`unit`引数が年、四半期、月、または週の場合、
- かつ`value`引数がDate32またはDateTime64の場合、[Date32](../data-types/date32.md)が返され、
- そうでない場合、[Date](../data-types/date.md)が返されます。

`unit`引数が日、時間、分、または秒の場合、
- かつ`value`引数がDate32またはDateTime64の場合、[DateTime64](../data-types/datetime64.md)が返され、
- そうでない場合、[DateTime](../data-types/datetime.md)が返されます。

`unit`引数がミリ秒、マイクロ秒、またはナノ秒の場合、スケール3または6または9（`unit`引数に応じて）の[DateTime64](../data-types/datetime64.md)が返されます。

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

**関連機能**

- [toStartOfInterval](#tostartofinterval)
## date\_add {#date_add}

指定された日付または日付時刻に時間または日付の間隔を追加します。

追加の結果がデータ型の範囲外になる場合、結果は未定義です。

**構文**

```sql
date_add(unit, value, date)
```

代替構文:

```sql
date_add(date, INTERVAL value unit)
```

別名: `dateAdd`, `DATE_ADD`。

**引数**

- `unit` — 追加する間隔のタイプ。注意: これは[String](../data-types/string.md)ではなく、引用符で囲まれてはいけません。
    使用可能な値:

    - `second`
    - `minute`
    - `hour`
    - `day`
    - `week`
    - `month`
    - `quarter`
    - `year`

- `value` — 追加する間隔の値。[Int](../data-types/int-uint.md)。
- `date` — `value`を追加する日付または日付時刻。[Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)、または[DateTime64](../data-types/datetime64.md)。

**戻り値**

`value`を追加して得られた日付または日付時刻。[Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)、または[DateTime64](../data-types/datetime64.md)。

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

**関連機能**

- [addDate](#adddate)
## date\_sub {#date_sub}

指定された日付または日付時刻から時間間隔または日付間隔を引きます。

引き算の結果がデータ型の範囲外になる場合、結果は未定義です。

**構文**

```sql
date_sub(unit, value, date)
```

代替構文:

```sql
date_sub(date, INTERVAL value unit)
```

別名: `dateSub`, `DATE_SUB`。

**引数**

- `unit` — 引く間隔のタイプ。注意: これは[String](../data-types/string.md)ではなく、引用符で囲まれてはいけません。

    使用可能な値:

    - `second`
    - `minute`
    - `hour`
    - `day`
    - `week`
    - `month`
    - `quarter`
    - `year`

- `value` — 引く間隔の値。[Int](../data-types/int-uint.md)。
- `date` — `value`を引く日付または日付時刻。[Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)、または[DateTime64](../data-types/datetime64.md)。

**戻り値**

`value`を`unit`で表現して`date`から引いた結果の日付または日付時刻。[Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)、または[DateTime64](../data-types/datetime64.md)。

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

**関連機能**

- [subDate](#subdate)
## timestamp\_add {#timestamp_add}

指定された時間値を提供された日付または日付時刻と追加します。

追加がデータ型の範囲外になる場合、結果は未定義です。

**構文**

```sql
timestamp_add(date, INTERVAL value unit)
```

別名: `timeStampAdd`, `TIMESTAMP_ADD`。

**引数**

- `date` — 日付または日付時刻。[Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)、または[DateTime64](../data-types/datetime64.md)。
- `value` — 追加する間隔の値。[Int](../data-types/int-uint.md)。
- `unit` — 追加する間隔のタイプ。[String](../data-types/string.md)。
    使用可能な値:

    - `second`
    - `minute`
    - `hour`
    - `day`
    - `week`
    - `month`
    - `quarter`
    - `year`

**戻り値**

指定された`value`を`unit`で表現して`date`に追加した結果の日付または日付時刻。[Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)、または[DateTime64](../data-types/datetime64.md)。

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

指定された時間間隔を提供された日付または日付時刻から引きます。

引き算の結果がデータ型の範囲外になる場合、結果は未定義です。

**構文**

```sql
timestamp_sub(unit, value, date)
```

別名: `timeStampSub`, `TIMESTAMP_SUB`。

**引数**

- `unit` — 引く間隔のタイプ。[String](../data-types/string.md)。
    使用可能な値:

    - `second`
    - `minute`
    - `hour`
    - `day`
    - `week`
    - `month`
    - `quarter`
    - `year`

- `value` — 引く間隔の値。[Int](../data-types/int-uint.md)。
- `date` — 日付または日付時刻。[Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)、または[DateTime64](../data-types/datetime64.md)。

**戻り値**

`value`を`unit`で表現して`date`から引いた結果の日付または日付時刻。[Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)、または[DateTime64](../data-types/datetime64.md)。

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

時間間隔を提供された日付、時刻付きの日付、または文字列形式の日付/時刻に追加します。

追加の結果がデータ型の範囲外になる場合、結果は未定義です。

**構文**

```sql
addDate(date, interval)
```

**引数**

- `date` — `interval`を追加する日付または日時。[Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)、[DateTime64](../data-types/datetime64.md)、または[String](../data-types/string.md)
- `interval` — 追加する間隔。[Interval](../data-types/special-data-types/interval.md)。

**戻り値**

`date`に`interval`を追加して得られる日付または日付時刻。[Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)、または[DateTime64](../data-types/datetime64.md)。

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

別名: `ADDDATE`

**関連機能**

- [date_add](#date_add)
## subDate {#subdate}

指定された時間間隔を提供された日付、時刻付きの日付、または文字列形式の日付/時刻から引きます。

引き算の結果がデータ型の範囲外になる場合、結果は未定義です。

**構文**

```sql
subDate(date, interval)
```

**引数**

- `date` — 引かれる日付または時刻付きの日付。[Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)、[DateTime64](../data-types/datetime64.md)、または[String](../data-types/string.md)
- `interval` — 引く間隔。[Interval](../data-types/special-data-types/interval.md)。

**戻り値**

`date`から引かれる`interval`を加えた結果の日付または日付時刻。[Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)、または[DateTime64](../data-types/datetime64.md)。

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

別名: `SUBDATE`

**関連機能**

- [date_sub](#date_sub)
## now {#now}

クエリ解析の瞬間に現在の日付と時刻を返します。この関数は定数式です。

別名: `current_timestamp`。

**構文**

```sql
now([timezone])
```

**引数**

- `timezone` — 戻り値の[タイムゾーン名](../../operations/server-configuration-parameters/settings.md#timezone)（オプション）。[String](../data-types/string.md)。

**戻り値**

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

指定したタイムゾーンを使ったクエリ:

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

クエリ解析の瞬間にサブ秒精度で現在の日付と時刻を返します。この関数は定数式です。

**構文**

```sql
now64([scale], [timezone])
```

**引数**

- `scale` - ティックサイズ（精度）：10<sup>-precision</sup>秒。有効範囲: [ 0 : 9 ]。通常は - 3（デフォルト）（ミリ秒）、6（マイクロ秒）、9（ナノ秒）を使用します。
- `timezone` — 戻り値の[タイムゾーン名](../../operations/server-configuration-parameters/settings.md#timezone)（オプション）。[String](../data-types/string.md)。

**戻り値**

- サブ秒精度の現在の日付と時刻。[DateTime64](../data-types/datetime64.md)。

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

各データブロックの処理時点で現在の日付と時刻を返します。[now](#now)関数とは異なり、これは定数式ではなく、長時間実行されるクエリの異なるブロックで異なる値が返されます。

この関数は長時間実行されるINSERT SELECTクエリで現在の時間を生成するために使用する意義があります。

**構文**

```sql
nowInBlock([timezone])
```

**引数**

- `timezone` — 戻り値の[タイムゾーン名](../../operations/server-configuration-parameters/settings.md#timezone)（オプション）。[String](../data-types/string.md)。

**戻り値**

- 各データブロックの処理時に現在の日付と時刻。[DateTime](../data-types/datetime.md)。

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

クエリ解析の瞬間の現在の日付を返します。これは'toDate(now())'と同じであり、別名: `curdate`, `current_date`があります。

**構文**

```sql
today()
```

**引数**

- なし

**戻り値**

- 現在の日付。[DateTime](../data-types/datetime.md)。

**例**

クエリ:

```sql
SELECT today() AS today, curdate() AS curdate, current_date() AS current_date FORMAT Pretty
```

**結果**:

2024年3月3日に上記のクエリを実行すると、以下のような応答が返されるでしょう:

```response
┏━━━━━━━━━━━━┳━━━━━━━━━━━━┳━━━━━━━━━━━━━━┓
┃      today ┃    curdate ┃ current_date ┃
┡━━━━━━━━━━━━╇━━━━━━━━━━━━╇━━━━━━━━━━━━━━┩
│ 2024-03-03 │ 2024-03-03 │   2024-03-03 │
└────────────┴────────────┴──────────────┘
```
## yesterday {#yesterday}

引数なしで、クエリ解析の1つの時点における昨日の日付を返します。
'today() - 1'と同じです。
## timeSlot {#timeslot}

時間を30分間隔の開始時刻に丸めます。

**構文**

```sql
timeSlot(time[, time_zone])
```

**引数**

- `time` — 30分間隔の開始時刻に丸める時間。[DateTime](../data-types/datetime.md)/[Date32](../data-types/date32.md)/[DateTime64](../data-types/datetime64.md)。
- `time_zone` — タイムゾーンを表す文字列型の定数値または式。[String](../data-types/string.md)。

:::note
この関数は拡張型の`Date32`および`DateTime64`の値を引数として取ることができますが、通常の範囲（`Date`の場合は1970年から2149年、`DateTime`は2106年）の外に時間を渡すと不正確な結果が得られます。
:::

**戻り値の型**

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

日付または日時をUInt32番号に変換し、年と月の数（YYYY * 100 + MM）を返します。第二のオプションのタイムゾーン引数を受け取ります。提供された場合、タイムゾーンは文字列定数でなければなりません。

この関数は`YYYYMMDDToDate()`の逆です。

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

日付または日時をUInt32番号に変換し、年と月の数（YYYY * 10000 + MM * 100 + DD）を返します。第二のオプションのタイムゾーン引数を受け取ります。提供された場合、タイムゾーンは文字列定数でなければなりません。

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

日付または日時をUInt64番号に変換し、年、月、日、時間、分、秒の数（YYYY * 10000000000 + MM * 100000000 + DD * 1000000 + hh * 10000 + mm * 100 + ss）を返します。第二のオプションのタイムゾーン引数を受け取ります。提供された場合、タイムゾーンは文字列定数でなければなりません。

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

年、月、日を表す数字を[Date](../data-types/date.md)に変換します。

この関数は`toYYYYMMDD()`の逆です。

入力が有効なDate値としてエンコードされていない場合、出力は未定義です。

**構文**

```sql
YYYYMMDDToDate(yyyymmdd);
```

**引数**

- `yyyymmdd` - 年、月、日を表す数。[Integer](../data-types/int-uint.md)、[Float](../data-types/float.md)または[Decimal](../data-types/decimal.md)。

**戻り値**

- 引数から生成された日付。[Date](../data-types/date.md)。

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

`YYYYMMDDToDate()`関数と同様ですが、[Date32](../data-types/date32.md)を生成します。
## YYYYMMDDhhmmssToDateTime {#yyyymmddhhmmsstodatetime}

年、月、日、時間、分、秒を表す数字を[DateTime](../data-types/datetime.md)に変換します。

入力が有効なDateTime値としてエンコードされていない場合、出力は未定義です。

この関数は`toYYYYMMDDhhmmss()`の逆です。

**構文**

```sql
YYYYMMDDhhmmssToDateTime(yyyymmddhhmmss[, timezone]);
```

**引数**

- `yyyymmddhhmmss` - 年、月、日を表す数字。[Integer](../data-types/int-uint.md)、[Float](../data-types/float.md)または[Decimal](../data-types/decimal.md)。
- `timezone` - 戻り値の[タイムゾーン](../../operations/server-configuration-parameters/settings.md#timezone)（オプション）。

**戻り値**

- 引数から生成された日付時刻。[DateTime](../data-types/datetime.md)。

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

`YYYYMMDDhhmmssToDate()`関数に似ていますが、[DateTime64](../data-types/datetime64.md)を生成します。

`timezone`パラメータの後に、追加のオプションの`precision`パラメータを受け取ります。
## changeYear {#changeyear}

日付または日時の年のコンポーネントを変更します。

**構文**
```sql

changeYear(date_or_datetime, value)
```

**引数**

- `date_or_datetime` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)、または[DateTime64](../data-types/datetime64.md)
- `value` - 年の新しい値。[Integer](../../sql-reference/data-types/int-uint.md)。

**戻り値**

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

- `date_or_datetime` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)、または[DateTime64](../data-types/datetime64.md)
- `value` - 月の新しい値。[Integer](../../sql-reference/data-types/int-uint.md)。

**戻り値**

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

- `date_or_datetime` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)、または[DateTime64](../data-types/datetime64.md)
- `value` - 新しい日の値。[Integer](../../sql-reference/data-types/int-uint.md)。

**戻り値**

- `date_or_datetime`と同じ型の値を返します。

**例**

```sql
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

```sql
changeHour(date_or_datetime, value)
```

**引数**

- `date_or_datetime` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)
- `value` - 時間の新しい値。 [Integer](../../sql-reference/data-types/int-uint.md)。

**戻り値**

- `date_or_datetime` と同じタイプの値を返します。入力が [Date](../data-types/date.md) の場合は [DateTime](../data-types/datetime.md) を返し、入力が [Date32](../data-types/date32.md) の場合は [DateTime64](../data-types/datetime64.md) を返します。

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

日付または日時の分コンポーネントを変更します。

**構文**

```sql
changeMinute(date_or_datetime, value)
```

**引数**

- `date_or_datetime` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)
- `value` - 分の新しい値。 [Integer](../../sql-reference/data-types/int-uint.md)。

**戻り値**

- `date_or_datetime` と同じタイプの値を返します。入力が [Date](../data-types/date.md) の場合は [DateTime](../data-types/datetime.md) を返し、入力が [Date32](../data-types/date32.md) の場合は [DateTime64](../data-types/datetime64.md) を返します。

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

日付または日時の秒コンポーネントを変更します。

**構文**

```sql
changeSecond(date_or_datetime, value)
```

**引数**

- `date_or_datetime` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)
- `value` - 秒の新しい値。 [Integer](../../sql-reference/data-types/int-uint.md)。

**戻り値**

- `date_or_datetime` と同じタイプの値を返します。入力が [Date](../data-types/date.md) の場合は [DateTime](../data-types/datetime.md) を返し、入力が [Date32](../data-types/date32.md) の場合は [DateTime64](../data-types/datetime64.md) を返します。

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

指定された年数を日付、日時、または文字列エンコードされた日付 / 日時に追加します。

**構文**

```sql
addYears(date, num)
```

**引数**

- `date`: 指定された年数を追加する日付 / 日時。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 追加する年数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**戻り値**

- `date` に `num` 年を加算した値を返します。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

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

指定された四半期数を日付、日時、または文字列エンコードされた日付 / 日時に追加します。

**構文**

```sql
addQuarters(date, num)
```

**引数**

- `date`: 指定された四半期数を追加する日付 / 日時。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 追加する四半期数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**戻り値**

- `date` に `num` 四半期を加算した値を返します。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

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

指定された月数を日付、日時、または文字列エンコードされた日付 / 日時に追加します。

**構文**

```sql
addMonths(date, num)
```

**引数**

- `date`: 指定された月数を追加する日付 / 日時。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 追加する月数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**戻り値**

- `date` に `num` 月を加算した値を返します。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

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

指定された週数を日付、日時、または文字列エンコードされた日付 / 日時に追加します。

**構文**

```sql
addWeeks(date, num)
```

**引数**

- `date`: 指定された週数を追加する日付 / 日時。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 追加する週数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**戻り値**

- `date` に `num` 週間を加算した値を返します。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

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

指定された日数を日付、日時、または文字列エンコードされた日付 / 日時に追加します。

**構文**

```sql
addDays(date, num)
```

**引数**

- `date`: 指定された日数を追加する日付 / 日時。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 追加する日数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**戻り値**

- `date` に `num` 日を加算した値を返します。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

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

指定された時間数を日付、日時、または文字列エンコードされた日付 / 日時に追加します。

**構文**

```sql
addHours(date, num)
```

**引数**

- `date`: 指定された時間数を追加する日付 / 日時。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 追加する時間数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**戻り値**

- `date` に `num` 時間を加算した値を返します。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

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

指定された分数を日付、日時、または文字列エンコードされた日付 / 日時に追加します。

**構文**

```sql
addMinutes(date, num)
```

**引数**

- `date`: 指定された分数を追加する日付 / 日時。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 追加する分数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**戻り値**

- `date` に `num` 分を加算した値を返します。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

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

指定された秒数を日付、日時、または文字列エンコードされた日付 / 日時に追加します。

**構文**

```sql
addSeconds(date, num)
```

**引数**

- `date`: 指定された秒数を追加する日付 / 日時。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 追加する秒数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**戻り値**

- `date` に `num` 秒を加算した値を返します。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

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

指定されたミリ秒数を日時または文字列エンコードされた日時に追加します。

**構文**

```sql
addMilliseconds(date_time, num)
```

**引数**

- `date_time`: 指定されたミリ秒数を追加する日時。 [DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 追加するミリ秒数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**戻り値**

- `date_time` に `num` ミリ秒を加算した値を返します。 [DateTime64](../data-types/datetime64.md)。

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

指定されたマイクロ秒数を日時または文字列エンコードされた日時に追加します。

**構文**

```sql
addMicroseconds(date_time, num)
```

**引数**

- `date_time`: 指定されたマイクロ秒数を追加する日時。 [DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 追加するマイクロ秒数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**戻り値**

- `date_time` に `num` マイクロ秒を加算した値を返します。 [DateTime64](../data-types/datetime64.md)。

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

指定されたナノ秒数を日時または文字列エンコードされた日時に追加します。

**構文**

```sql
addNanoseconds(date_time, num)
```

**引数**

- `date_time`: 指定されたナノ秒数を追加する日時。 [DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 追加するナノ秒数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**戻り値**

- `date_time` に `num` ナノ秒を加算した値を返します。 [DateTime64](../data-types/datetime64.md)。

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

インターバルを別のインターバルまたはインターバルのタプルに追加します。

**構文**

```sql
addInterval(interval_1, interval_2)
```

**引数**

- `interval_1`: 最初のインターバルまたはインターバルのタプル。 [interval](../data-types/special-data-types/interval.md)、[tuple](../data-types/tuple.md)([interval](../data-types/special-data-types/interval.md))。
- `interval_2`: 追加される第2のインターバル。 [interval](../data-types/special-data-types/interval.md)。

**戻り値**

- インターバルのタプルを返します。 [tuple](../data-types/tuple.md)([interval](../data-types/special-data-types/interval.md))。

:::note
同じタイプのインターバルは、単一のインターバルに結合されます。例えば `toIntervalDay(1)` と `toIntervalDay(2)` を渡すと、結果は `(3)` になります。
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

インターバルのタプルを日付または日時に順次追加します。

**構文**

```sql
addTupleOfIntervals(interval_1, interval_2)
```

**引数**

- `date`: 最初のインターバルまたはインターバルのタプル。 [date](../data-types/date.md)/[date32](../data-types/date32.md)/[datetime](../data-types/datetime.md)/[datetime64](../data-types/datetime64.md)。
- `intervals`: `date` に追加されるインターバルのタプル。 [tuple](../data-types/tuple.md)([interval](../data-types/special-data-types/interval.md))。

**戻り値**

- `intervals`を追加した`date` を返します。 [date](../data-types/date.md)/[date32](../data-types/date32.md)/[datetime](../data-types/datetime.md)/[datetime64](../data-types/datetime64.md)。

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

指定された年数を日付、日時、または文字列エンコードされた日付 / 日時から引きます。

**構文**

```sql
subtractYears(date, num)
```

**引数**

- `date`: 指定された年数を引く日付 / 日時。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 引く年数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**戻り値**

- `date` から `num` 年を引いた値を返します。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

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

指定された四半期数を日付、日時、または文字列エンコードされた日付 / 日時から引きます。

**構文**

```sql
subtractQuarters(date, num)
```

**引数**

- `date`: 指定された四半期数を引く日付 / 日時。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 引く四半期数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**戻り値**

- `date` から `num` 四半期を引いた値を返します。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

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

指定された月数を日付、日時、または文字列エンコードされた日付 / 日時から引きます。

**構文**

```sql
subtractMonths(date, num)
```

**引数**

- `date`: 指定された月数を引く日付 / 日時。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 引く月数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**戻り値**

- `date` から `num` 月を引いた値を返します。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

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

指定された週数を日付、日時、または文字列エンコードされた日付 / 日時から引きます。

**構文**

```sql
subtractWeeks(date, num)
```

**引数**

- `date`: 指定された週数を引く日付 / 日時。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 引く週数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**戻り値**

- `date` から `num` 週間を引いた値を返します。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

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

指定された日数を日付、日時、または文字列エンコードされた日付 / 日時から引きます。

**構文**

```sql
subtractDays(date, num)
```

**引数**

- `date`: 指定された日数を引く日付 / 日時。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 引く日数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**戻り値**

- `date` から `num` 日を引いた値を返します。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

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

指定された時間数を日付、日時、または文字列エンコードされた日付 / 日時から引きます。

**構文**

```sql
subtractHours(date, num)
```

**引数**

- `date`: 指定された時間数を引く日付 / 日時。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[Datetime](../data-types/datetime.md)/[Datetime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 引く時間数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**戻り値**

- `date` から `num` 時間を引いた値を返します。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[Datetime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

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

指定された分数を日付、時間付き日付、または文字列でエンコードされた日付 / 時間付き日付から減算します。

**構文**

```sql
subtractMinutes(date, num)
```

**パラメータ**

- `date`: 減算する対象の日付 / 時間付き日付。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 減算する分数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**返される値**

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

指定された秒数を日付、時間付き日付、または文字列でエンコードされた日付 / 時間付き日付から減算します。

**構文**

```sql
subtractSeconds(date, num)
```

**パラメータ**

- `date`: 減算対象の日付 / 時間付き日付。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 減算する秒数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**返される値**

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

指定されたミリ秒を時間付き日付または文字列でエンコードされた時間付き日付から減算します。

**構文**

```sql
subtractMilliseconds(date_time, num)
```

**パラメータ**

- `date_time`: 減算対象の時間付き日付。 [DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 減算するミリ秒数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**返される値**

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

指定されたマイクロ秒を時間付き日付または文字列でエンコードされた時間付き日付から減算します。

**構文**

```sql
subtractMicroseconds(date_time, num)
```

**パラメータ**

- `date_time`: 減算対象の時間付き日付。 [DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 減算するマイクロ秒数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**返される値**

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

指定されたナノ秒を時間付き日付または文字列でエンコードされた時間付き日付から減算します。

**構文**

```sql
subtractNanoseconds(date_time, num)
```

**パラメータ**

- `date_time`: 減算対象の時間付き日付。 [DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 減算するナノ秒数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**返される値**

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

別の間隔または間隔のタプルに対して、反転された間隔を加算します。

**構文**

```sql
subtractInterval(interval_1, interval_2)
```

**パラメータ**

- `interval_1`: 最初の間隔または間隔のタプル。 [interval](../data-types/special-data-types/interval.md)、[tuple](../data-types/tuple.md)([interval](../data-types/special-data-types/interval.md))。
- `interval_2`: 反転される2番目の間隔。 [interval](../data-types/special-data-types/interval.md)。

**返される値**

- 間隔のタプルを返します。 [tuple](../data-types/tuple.md)([interval](../data-types/special-data-types/interval.md))。

:::note
同じ型の間隔は単一の間隔に統合されます。たとえば、 `toIntervalDay(2)` と `toIntervalDay(1)` が渡された場合、結果は `(1)` になります。(2,1) ではなく。
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

日付または時間付き日付から、間隔のタプルを順次減算します。

**構文**

```sql
subtractTupleOfIntervals(interval_1, interval_2)
```

**パラメータ**

- `date`: 最初の間隔または間隔のタプル。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。
- `intervals`: `date` から減算する間隔のタプル。 [tuple](../data-types/tuple.md)([interval](../data-types/special-data-types/interval.md))。

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

'StartTime' から始まり、'Duration' 秒間続く時間間隔について、この間隔から下方向に 'Size' 秒単位で切り捨てたポイントの配列を返します。 'Size' はオプションのパラメータで、デフォルトで1800（30分）に設定されています。
これは、たとえば、対応するセッションでのページビューを検索する際に必要です。
'StartTime' 引数には DateTime と DateTime64 を受け入れます。DateTime の場合、'Duration' と 'Size' 引数は `UInt32` でなければなりません。 'DateTime64' の場合、それらは `Decimal64` でなければなりません。
DateTime/DateTime64 の配列を返します（返される型は 'StartTime' の型に一致します）。DateTime64 の場合、返された値のスケールは 'StartTime' のスケールとは異なることがあります --- すべての引数の中で最大のスケールが採用されます。

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

指定されたフォーマット文字列に従って時間をフォーマットします。フォーマットは定数式なので、単一の結果カラムに対して複数のフォーマットを持つことはできません。

formatDateTime は MySQL の日時フォーマットスタイルを使用します。参照: https://dev.mysql.com/doc/refman/8.0/en/date-and-time-functions.html#function_date-format.

この関数の逆操作は [parseDateTime](/sql-reference/functions/type-conversion-functions#parsedatetime) です。

エイリアス: `DATE_FORMAT`.

**構文**

```sql
formatDateTime(Time, Format[, Timezone])
```

**返される値**

決定されたフォーマットに従った時間と日付の値を返します。

**置換フィールド**

置換フィールドを使用して、結果文字列のパターンを定義できます。 "Example" 列には `2018-01-02 22:33:44` のフォーマット結果が示されています。

| プレースホルダー | 説明                                                                                                                                                                           | 例       |
|----------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| %a             | 曜日名の省略形 (月-日)                                                                                                                                                          | Mon      |
| %b             | 月名の省略形 (1月-12月)                                                                                                                                                          | Jan      |
| %c             | 月を整数として表したもの (01-12)、以下の 'Note 4' を参照                                                                                                                                  | 01       |
| %C             | 100で割った年を整数に切り捨てたもの (00-99)                                                                                                                                          | 20       |
| %d             | ゼロ埋めされた日 (01-31)                                                                                                                                                        | 02       |
| %D             | 短い MM/DD/YY 日付、%m/%d/%y と同等                                                                                                                                           | 01/02/18 |
| %e             | スペースでパディングされた日 ( 1-31)、以下の 'Note 5' を参照                                                                                                                    | &nbsp; 2 |
| %f             | 小数秒、以下の 'Note 1' と 'Note 2' を参照                                                                                                                                      | 123456   |
| %F             | 短い YYYY-MM-DD 日付、%Y-%m-%d と同等                                                                                                                                          | 2018-01-02 |
| %g             | ISO 8601 に合わせた2桁の年形式、4桁表記から略されたもの                                                                                                                        | 18       |
| %G             | ISO 週番号に対する4桁の年形式、通常は %V とともに使用される                                                                                                                       | 2018     |
| %h             | 12時間形式の時 (01-12)                                                                                                                                                          | 09       |
| %H             | 24時間形式の時 (00-23)                                                                                                                                                          | 22       |
| %i             | 分 (00-59)                                                                                                                                                                    | 33       |
| %I             | 12時間形式の時 (01-12)                                                                                                                                                          | 10       |
| %j             | 年の通日 (001-366)                                                                                                                                                               | 002      |
| %k             | 24時間形式の時 (00-23)、以下の 'Note 4' を参照                                                                                                                                  | 14       |
| %l             | 12時間形式の時 (01-12)、以下の 'Note 4' を参照                                                                                                                                  | 09       |
| %m             | 月を整数として表したもの (01-12)                                                                                                                                                  | 01       |
| %M             | 月名の完全な形式 (1月-12月)、以下の 'Note 3' を参照                                                                                                                              | January   |
| %n             | 改行文字 ('')                                                                                                                                                                 |          |
| %p             | AM または PM の指定                                                                                                                                                            | PM       |
| %Q             | 四半期 (1-4)                                                                                                                                                                   | 1        |
| %r             | 12時間の HH:MM AM/PM 時間、%h:%i %p と同等                                                                                                                                        | 10:30 PM |
| %R             | 24時間の HH:MM 時間、%H:%i と同等                                                                                                                                               | 22:33    |
| %s             | 秒 (00-59)                                                                                                                                                                    | 44       |
| %S             | 秒 (00-59)                                                                                                                                                                    | 44       |
| %t             | 水平方向のタブ文字 (')                                                                                                                                                            |          |
| %T             | ISO 8601 時間フォーマット (HH:MM:SS)、%H:%i:%S と同等                                                                                                                             | 22:33:44 |
| %u             | ISO 8601 曜日を1から始めた数値で表したもの (1-7)                                                                                                                                     | 2        |
| %V             | ISO 8601 週番号 (01-53)                                                                                                                                                         | 01       |
| %w             | 日曜日を0とした整数で表した曜日 (0-6)                                                                                                                                           | 2        |
| %W             | 完全な曜日名 (月曜日-日曜日)                                                                                                                                                        | Monday    |
| %y             | 年の最後の2桁 (00-99)                                                                                                                                                           | 18       |
| %Y             | 年                                                                                                                                                                           | 2018     |
| %z             | UTCからの時間オフセット (+HHMM または -HHMM)                                                                                                                                                          | -0500    |
| %%             | % 記号                                                                                                                                                                        | %        |

ノート 1: ClickHouse のバージョンが v23.4 より前の場合、%f はフォーマット値が Date、Date32 または DateTime（小数秒がない）または精度が 0 の DateTime64 の場合、単一のゼロ (0) を表示します。以前の動作は設定 `formatdatetime_f_prints_single_zero = 1` を使用することで復元できます。

ノート 2: ClickHouse のバージョンが v25.1 より前の場合、%f は固定6桁ではなく、DateTime64 のスケールによって指定された桁数として表示されます。以前の動作は設定 `formatdatetime_f_prints_scale_number_of_digits= 1` で復元できます。

ノート 3: ClickHouse のバージョンが v23.4 より前の場合、%M は完全な月名 (1月-12月) の代わりに分 (00-59) を表示します。以前の動作は設定 `formatdatetime_parsedatetime_m_is_month_name = 0` で復元できます。

ノート 4: ClickHouse のバージョンが v23.11 より前のとき、関数 `parseDateTime` はフォーマッタ `%c` (月) と `%l`/%`k` (時間) に先頭のゼロを必須としました。後のバージョンでは、先頭のゼロを省略できます。以前の動作は設定 `parsedatetime_parse_without_leading_zeros = 0` で復元できます。この動作は `formatDateTime` のデフォルトで、既存の利用ケースを壊さないように `%c` と `%l`/%`k` については先頭のゼロを表示します。この動作は設定 `formatdatetime_format_without_leading_zeros = 1` で変更できます。

ノート 5: ClickHouse のバージョンが v25.5 より前のとき、関数 `parseDateTime` はフォーマッタ `%e` に対して単一桁の日がスペースでパディングされることが必須でした。後のバージョンでは、スペースパディングはオプションで、`3` および ` 3` は機能します。以前の動作を保持するには、設定 `parsedatetime_e_requires_space_padding = 1` を設定します。同様に、`formatDateTime` の `%e` フォーマッタも以前は単にスペースパディングを行いましたが、現在はセレクティブに小さいゼロを付けません。以前の動作を保持するには設定 `formatdatetime_e_with_space_padding = 1` を設定します。

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

さらに、`formatDateTime` 関数は第3の文字列引数としてタイムゾーンの名前を取ることもできます。例: `Asia/Istanbul`。この場合、時間は指定されたタイムゾーンに従ってフォーマットされます。

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

formatDateTime と似ていますが、MySQL スタイルではなく Joda スタイルで日付時刻をフォーマットします。参照: https://joda-time.sourceforge.net/apidocs/org/joda/time/format/DateTimeFormat.html.

この関数の逆操作は [parseDateTimeInJodaSyntax](/sql-reference/functions/type-conversion-functions#parsedatetimeinjodasyntax) です。

**置換フィールド**

置換フィールドを使用して、結果文字列のパターンを定義できます。

| プレースホルダー | 説明                           | 表示         | 例                              |
|----------------|--------------------------------|--------------|---------------------------------|
| G              | 時代                           | テキスト      | AD                              |
| C              | 時代の世紀 (>=0)               | 数字         | 20                              |
| Y              | 時代の年 (>=0)                 | 年          | 1996                            |
| x              | 週年 (未対応)                  | 年           | 1996                            |
| w              | 週年の週 (未対応)              | 数字         | 27                              |
| e              | 曜日                           | 数字         | 2                               |
| E              | 曜日                           | テキスト      | Tuesday; Tue                    |
| y              | 年                             | 年          | 1996                            |
| D              | 年の日                         | 数字         | 189                             |
| M              | 年の月                        | 月           | July; Jul; 07                   |
| d              | 月の日                         | 数字         | 10                              |
| a              | 日の半日                      | テキスト      | PM                              |
| K              | 半日の時間 (0~11)              | 数字         | 0                               |
| h              | 半日の時計時間 (1~12)          | 数字         | 12                              |
| H              | 一日の時間 (0~23)              | 数字         | 0                               |
| k              | 一日の時計時間 (1~24)          | 数字         | 24                              |
| m              | 一時間の分                    | 数字         | 30                              |
| s              | 一分の秒                       | 数字         | 55                              |
| S              | 小数秒                        | 数字         | 978                             |
| z              | タイムゾーン                    | テキスト      | 東部標準時間; EST               |
| Z              | タイムゾーンオフセット         | ゾーン       | -0800; -0812                     |
| '              | テキストのエスケープ           | デリミタ     |                                 |
| ''             | シングルクオート               | リテラル     | '                               |

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

指定された日付の部分を返します。

**構文**

```sql
dateName(date_part, date)
```

**引数**

- `date_part` — 日付部分。可能な値: 'year', 'quarter', 'month', 'week', 'dayofyear', 'day', 'weekday', 'hour', 'minute', 'second'。 [String](../data-types/string.md)。
- `date` — 日付。 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) または [DateTime64](../data-types/datetime64.md)。
- `timezone` — タイムゾーン。オプション。[String](../data-types/string.md)。

**返される値**

指定された日付の部分。 [String](/sql-reference/data-types/string)

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
```yaml
title: 'monthName'
sidebar_label: 'monthName'
keywords: ['month', 'date', 'time']
description: '月の名前を返します。'
```

## monthName {#monthname}

月の名前を返します。

**構文**

```sql
monthName(date)
```

**引数**

- `date` — 日付または時間付きの日付。[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、または[DateTime64](../data-types/datetime64.md)。

**返される値**

- 月の名前。[String](/sql-reference/data-types/string)

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

この関数はUnixタイムスタンプをカレンダー日付と時間に変換します。

次の2つの方法で呼び出すことができます:

単一の引数を型[Integer](../data-types/int-uint.md)として与えると、[DateTime](../data-types/datetime.md)型の値を返します。つまり、[toDateTime](../../sql-reference/functions/type-conversion-functions.md#todatetime)のように動作します。

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

2つまたは3つの引数があり、最初の引数が[Integer](../data-types/int-uint.md)、[Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)、または[DateTime64](../data-types/datetime64.md)型の値で、2番目の引数が定数の形式文字列、3番目の引数がオプションの定数のタイムゾーン文字列である場合、この関数は[String](/sql-reference/data-types/string)型の値を返します。つまり、[formatDateTime](#formatdatetime)のように動作します。この場合、[MySQLのdatetime形式スタイル](https://dev.mysql.com/doc/refman/8.0/en/date-and-time-functions.html#function_date-format)が使用されます。

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

[fromUnixTimestamp](#fromunixtimestamp)と同様ですが、2つまたは3つの引数で呼び出すとき、フォーマッティングがMySQLスタイルの代わりに[Jodaスタイル](https://joda-time.sourceforge.net/apidocs/org/joda/time/format/DateTimeFormat.html)を使用して行われます。

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

テキスト形式`YYYY-MM-DD`の[プロレプティックグレゴリオ暦](https://en.wikipedia.org/wiki/Proleptic_Gregorian_calendar)の日付を[Int32]である[修正版ユリウス日](https://en.wikipedia.org/wiki/Julian_day#Variants)番号に変換します。この関数は`0000-01-01`から`9999-12-31`までの日付をサポートしています。引数が日付として解析できない場合や、日付が無効な場合は例外を発生させます。

**構文**

```sql
toModifiedJulianDay(date)
```

**引数**

- `date` — テキスト形式の日付。[String](../data-types/string.md)または[FixedString](../data-types/fixedstring.md)。

**返される値**

- 修正版ユリウス日番号。[Int32](../data-types/int-uint.md)。

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

- `date` — テキスト形式の日付。[String](../data-types/string.md)または[FixedString](../data-types/fixedstring.md)。

**返される値**

- 修正版ユリウス日番号。[Nullable(Int32)](../data-types/int-uint.md)。

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

[修正版ユリウス日](https://en.wikipedia.org/wiki/Julian_day#Variants)番号をテキスト形式`YYYY-MM-DD`の[プロレプティックグレゴリオ暦](https://en.wikipedia.org/wiki/Proleptic_Gregorian_calendar)日付に変換します。この関数は`-678941`から`2973483`までの所定の日数をサポートしています（これはそれぞれ`0000-01-01`と`9999-12-31`を表します）。日数がサポートされている範囲外の場合、例外を発生させます。

**構文**

```sql
fromModifiedJulianDay(day)
```

**引数**

- `day` — 修正版ユリウス日番号。[任意の整数型](../data-types/int-uint.md)。

**返される値**

- テキスト形式の日付。[String](../data-types/string.md)

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

- `day` — 修正版ユリウス日番号。[任意の整数型](../data-types/int-uint.md)。

**返される値**

- テキスト形式の日付。[Nullable(String)](../data-types/string.md)

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

DateTime/DateTime64型の値を他のタイムゾーンからUTCタイムゾーンのタイムスタンプに変換します。この関数は主にApache Sparkや類似のフレームワークとの互換性のために含まれています。

**構文**

```sql
toUTCTimestamp(time_val, time_zone)
```

**引数**

- `time_val` — 定数のDateTime/DateTime64型の値または式。[DateTime/DateTime64型](../data-types/datetime.md)
- `time_zone` — タイムゾーンを表す定数の文字列型の値または式。[文字列型](../data-types/string.md)

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

DateTime/DateTime64型の値をUTCタイムゾーンから他のタイムゾーンのタイムスタンプに変換します。この関数は主にApache Sparkや類似のフレームワークとの互換性のために含まれています。

**構文**

```sql
fromUTCTimestamp(time_val, time_zone)
```

**引数**

- `time_val` — 定数のDateTime/DateTime64型の値または式。[DateTime/DateTime64型](../data-types/datetime.md)
- `time_zone` — タイムゾーンを表す定数の文字列型の値または式。[文字列型](../data-types/string.md)

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

クエリ解析の瞬間における現在の日付と時間を返します。この関数は定数式です。

:::note
この関数は、`now('UTC')`と同じ結果を返します。MySQLのサポートのために追加されたものであり、[`now`](#now)の使用が推奨されます。
:::

**構文**

```sql
UTCTimestamp()
```

エイリアス: `UTC_timestamp`。

**返される値**

- クエリ解析の瞬間における現在の日付と時間を返します。[DateTime](../data-types/datetime.md)。

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

2つの日付または時間付き日付の差を返します。差は秒単位で計算されます。`dateDiff`と同じであり、MySQLのサポートのために追加されただけです。`dateDiff`が推奨されます。

**構文**

```sql
timeDiff(first_datetime, second_datetime)
```

**引数**

- `first_datetime` — 定数のDateTime/DateTime64型の値または式。[DateTime/DateTime64型](../data-types/datetime.md)
- `second_datetime` — 定数のDateTime/DateTime64型の値または式。[DateTime/DateTime64型](../data-types/datetime.md)

**返される値**

2つの日付または時間付き日付の差を秒単位で返します。

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
## 関連情報 {#related-content}

- ブログ: [ClickHouseでの時系列データの操作](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
