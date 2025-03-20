---
slug: '/sql-reference/functions/time-window-functions'
sidebar_position: 175
sidebar_label: '時間ウィンドウ'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';



# 時間ウィンドウ関数

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

時間ウィンドウ関数は、対応するウィンドウの包含的下限と排他的上限を返します。[WindowView](/sql-reference/statements/create/view#window-view)で作業するための関数は以下に示されています。

## tumble {#tumble}

チューニング時間ウィンドウは、到達的で連続したウィンドウにレコードを割り当て、固定の期間（`interval`）を持ちます。

**構文**

``` sql
tumble(time_attr, interval [, timezone])
```

**引数**
- `time_attr` — 日付と時刻。[DateTime](../data-types/datetime.md)。
- `interval` — ウィンドウインターバルの[Interval](../data-types/special-data-types/interval.md)。
- `timezone` — [タイムゾーン名](../../operations/server-configuration-parameters/settings.md#timezone)（オプション）。

**返される値**

- 対応するチューニングウィンドウの包含的下限と排他的上限。[タプル](../data-types/tuple.md)([DateTime](../data-types/datetime.md), [DateTime](../data-types/datetime.md))。

**例**

クエリ:

``` sql
SELECT tumble(now(), toIntervalDay('1'));
```

結果:

``` text
┌─tumble(now(), toIntervalDay('1'))─────────────┐
│ ('2024-07-04 00:00:00','2024-07-05 00:00:00') │
└───────────────────────────────────────────────┘
```

## tumbleStart {#tumblestart}

対応する[tumbling window](#tumble)の包含的下限を返します。

**構文**

``` sql
tumbleStart(time_attr, interval [, timezone]);
```

**引数**

- `time_attr` — 日付と時刻。[DateTime](../data-types/datetime.md)。
- `interval` — ウィンドウインターバルの[Interval](../data-types/special-data-types/interval.md)。
- `timezone` — [タイムゾーン名](../../operations/server-configuration-parameters/settings.md#timezone)（オプション）。

**返される値**

- 対応するチューニングウィンドウの包含的下限。[DateTime](../data-types/datetime.md)、[タプル](../data-types/tuple.md)または[UInt32](../data-types/int-uint.md)。

**例**

クエリ:

```sql
SELECT tumbleStart(now(), toIntervalDay('1'));
```

結果:

```response
┌─tumbleStart(now(), toIntervalDay('1'))─┐
│                    2024-07-04 00:00:00 │
└────────────────────────────────────────┘
```

## tumbleEnd {#tumbleend}

対応する[tumbling window](#tumble)の排他的上限を返します。

**構文**

``` sql
tumbleEnd(time_attr, interval [, timezone]);
```

**引数**

- `time_attr` — 日付と時刻。[DateTime](../data-types/datetime.md)。
- `interval` — ウィンドウインターバルの[Interval](../data-types/special-data-types/interval.md)。
- `timezone` — [タイムゾーン名](../../operations/server-configuration-parameters/settings.md#timezone)（オプション）。

**返される値**

- 対応するチューニングウィンドウの包含的下限。[DateTime](../data-types/datetime.md)、[タプル](../data-types/tuple.md)または[UInt32](../data-types/int-uint.md)。

**例**

クエリ:

```sql
SELECT tumbleEnd(now(), toIntervalDay('1'));
```

結果:

```response
┌─tumbleEnd(now(), toIntervalDay('1'))─┐
│                  2024-07-05 00:00:00 │
└──────────────────────────────────────┘
```

## hop {#hop}

ホッピング時間ウィンドウは固定の期間（`window_interval`）を持ち、指定されたホップ間隔（`hop_interval`）によってホップします。`hop_interval`が`window_interval`より小さい場合、ホッピングウィンドウは重複します。したがって、レコードは複数のウィンドウに割り当てられることがあります。

``` sql
hop(time_attr, hop_interval, window_interval [, timezone])
```

**引数**

- `time_attr` — 日付と時刻。[DateTime](../data-types/datetime.md)。
- `hop_interval` — 正のホップ間隔。[Interval](../data-types/special-data-types/interval.md)。
- `window_interval` — 正のウィンドウ間隔。[Interval](../data-types/special-data-types/interval.md)。
- `timezone` — [タイムゾーン名](../../operations/server-configuration-parameters/settings.md#timezone)（オプション）。

**返される値**

- 対応するホッピングウィンドウの包含的下限と排他的上限。[タプル](../data-types/tuple.md)([DateTime](../data-types/datetime.md), [DateTime](../data-types/datetime.md))。

:::note
1つのレコードが複数のホップウィンドウに割り当てられる可能性があるため、ホップ関数が`WINDOW VIEW`なしで使用される場合、関数は**最初**のウィンドウの境界のみを返します。
:::

**例**

クエリ:

``` sql
SELECT hop(now(), INTERVAL '1' DAY, INTERVAL '2' DAY);
```

結果:

``` text
┌─hop(now(), toIntervalDay('1'), toIntervalDay('2'))─┐
│ ('2024-07-03 00:00:00','2024-07-05 00:00:00')      │
└────────────────────────────────────────────────────┘
```

## hopStart {#hopstart}

対応する[ホッピングウィンドウ](#hop)の包含的下限を返します。

**構文**

``` sql
hopStart(time_attr, hop_interval, window_interval [, timezone]);
```
**引数**

- `time_attr` — 日付と時刻。[DateTime](../data-types/datetime.md)。
- `hop_interval` — 正のホップ間隔。[Interval](../data-types/special-data-types/interval.md)。
- `window_interval` — 正のウィンドウ間隔。[Interval](../data-types/special-data-types/interval.md)。
- `timezone` — [タイムゾーン名](../../operations/server-configuration-parameters/settings.md#timezone)（オプション）。

**返される値**

- 対応するホッピングウィンドウの包含的下限。[DateTime](../data-types/datetime.md)、[タプル](../data-types/tuple.md)または[UInt32](../data-types/int-uint.md)。

:::note
1つのレコードが複数のホップウィンドウに割り当てられる可能性があるため、ホップ関数が`WINDOW VIEW`なしで使用される場合、関数は**最初**のウィンドウの境界のみを返します。
:::

**例**

クエリ:

``` sql
SELECT hopStart(now(), INTERVAL '1' DAY, INTERVAL '2' DAY);
```

結果:

``` text
┌─hopStart(now(), toIntervalDay('1'), toIntervalDay('2'))─┐
│                                     2024-07-03 00:00:00 │
└─────────────────────────────────────────────────────────┘
```

## hopEnd {#hopend}

対応する[ホッピングウィンドウ](#hop)の排他的上限を返します。

**構文**

``` sql
hopEnd(time_attr, hop_interval, window_interval [, timezone]);
```
**引数**

- `time_attr` — 日付と時刻。[DateTime](../data-types/datetime.md)。
- `hop_interval` — 正のホップ間隔。[Interval](../data-types/special-data-types/interval.md)。
- `window_interval` — 正のウィンドウ間隔。[Interval](../data-types/special-data-types/interval.md)。
- `timezone` — [タイムゾーン名](../../operations/server-configuration-parameters/settings.md#timezone)（オプション）。

**返される値**

- 対応するホッピングウィンドウの排他的上限。[DateTime](../data-types/datetime.md)、[タプル](../data-types/tuple.md)または[UInt32](../data-types/int-uint.md)。

:::note
1つのレコードが複数のホップウィンドウに割り当てられる可能性があるため、ホップ関数が`WINDOW VIEW`なしで使用される場合、関数は**最初**のウィンドウの境界のみを返します。
:::

**例**

クエリ:

``` sql
SELECT hopEnd(now(), INTERVAL '1' DAY, INTERVAL '2' DAY);
```

結果:

``` text
┌─hopEnd(now(), toIntervalDay('1'), toIntervalDay('2'))─┐
│                                   2024-07-05 00:00:00 │
└───────────────────────────────────────────────────────┘

```

## 関連コンテンツ {#related-content}

- Blog: [ClickHouseでの時系列データの操作](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
