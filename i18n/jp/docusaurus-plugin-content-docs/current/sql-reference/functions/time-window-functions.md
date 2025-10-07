---
'description': 'Documentation for Time Window Functions'
'sidebar_label': '時間窓'
'slug': '/sql-reference/functions/time-window-functions'
'title': '時間窓関数'
'doc_type': 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# 時間ウィンドウ関数

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

時間ウィンドウ関数は、対応するウィンドウの包含下限と排他上限を返します。 [WindowView](/sql-reference/statements/create/view#window-view) を操作するための関数は以下に示されています。

## tumble {#tumble}

タンブル時間ウィンドウは、固定の期間（`interval`）を持つ非重複の連続したウィンドウにレコードを割り当てます。

**構文**

```sql
tumble(time_attr, interval [, timezone])
```

**引数**
- `time_attr` — 日付と時刻。 [DateTime](../data-types/datetime.md).
- `interval` — [Interval](../data-types/special-data-types/interval.md) のウィンドウ間隔。
- `timezone` — [タイムゾーン名](../../operations/server-configuration-parameters/settings.md#timezone) (オプション)。

**返される値**

- 対応するタンブルウィンドウの包含下限と排他上限。 [Tuple](../data-types/tuple.md)([DateTime](../data-types/datetime.md), [DateTime](../data-types/datetime.md))。

**例**

クエリ:

```sql
SELECT tumble(now(), toIntervalDay('1'));
```

結果:

```text
┌─tumble(now(), toIntervalDay('1'))─────────────┐
│ ('2024-07-04 00:00:00','2024-07-05 00:00:00') │
└───────────────────────────────────────────────┘
```

## tumbleStart {#tumblestart}

対応する [タンブルウィンドウ](#tumble) の包含下限を返します。

**構文**

```sql
tumbleStart(time_attr, interval [, timezone]);
```

**引数**

- `time_attr` — 日付と時刻。 [DateTime](../data-types/datetime.md).
- `interval` — [Interval](../data-types/special-data-types/interval.md) のウィンドウ間隔。
- `timezone` — [タイムゾーン名](../../operations/server-configuration-parameters/settings.md#timezone) (オプション)。

**返される値**

- 対応するタンブルウィンドウの包含下限。 [DateTime](../data-types/datetime.md), [Tuple](../data-types/tuple.md) または [UInt32](../data-types/int-uint.md)。

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

対応する [タンブルウィンドウ](#tumble) の排他上限を返します。

**構文**

```sql
tumbleEnd(time_attr, interval [, timezone]);
```

**引数**

- `time_attr` — 日付と時刻。 [DateTime](../data-types/datetime.md).
- `interval` — [Interval](../data-types/special-data-types/interval.md) のウィンドウ間隔。
- `timezone` — [タイムゾーン名](../../operations/server-configuration-parameters/settings.md#timezone) (オプション)。

**返される値**

- 対応するタンブルウィンドウの包含下限。 [DateTime](../data-types/datetime.md), [Tuple](../data-types/tuple.md) または [UInt32](../data-types/int-uint.md)。

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

ホッピング時間ウィンドウは、固定の期間（`window_interval`）を持ち、指定されたホップ間隔（`hop_interval`）ごとにホップします。 `hop_interval` が `window_interval` より小さい場合、ホッピングウィンドウは重複します。したがって、レコードは複数のウィンドウに割り当てることができます。

```sql
hop(time_attr, hop_interval, window_interval [, timezone])
```

**引数**

- `time_attr` — 日付と時刻。 [DateTime](../data-types/datetime.md).
- `hop_interval` — 正のホップ間隔。 [Interval](../data-types/special-data-types/interval.md).
- `window_interval` — 正のウィンドウ間隔。 [Interval](../data-types/special-data-types/interval.md).
- `timezone` — [タイムゾーン名](../../operations/server-configuration-parameters/settings.md#timezone) (オプション)。

**返される値**

- 対応するホッピングウィンドウの包含下限と排他上限。 [Tuple](../data-types/tuple.md)([DateTime](../data-types/datetime.md), [DateTime](../data-types/datetime.md))。

:::note
1つのレコードが複数のホップウィンドウに割り当てられる可能性があるため、ホップ関数が **WINDOW VIEW** なしで使用される場合、関数は **最初の** ウィンドウの境界のみを返します。
:::

**例**

クエリ:

```sql
SELECT hop(now(), INTERVAL '1' DAY, INTERVAL '2' DAY);
```

結果:

```text
┌─hop(now(), toIntervalDay('1'), toIntervalDay('2'))─┐
│ ('2024-07-03 00:00:00','2024-07-05 00:00:00')      │
└────────────────────────────────────────────────────┘
```

## hopStart {#hopstart}

対応する [ホッピングウィンドウ](#hop) の包含下限を返します。

**構文**

```sql
hopStart(time_attr, hop_interval, window_interval [, timezone]);
```
**引数**

- `time_attr` — 日付と時刻。 [DateTime](../data-types/datetime.md).
- `hop_interval` — 正のホップ間隔。 [Interval](../data-types/special-data-types/interval.md).
- `window_interval` — 正のウィンドウ間隔。 [Interval](../data-types/special-data-types/interval.md).
- `timezone` — [タイムゾーン名](../../operations/server-configuration-parameters/settings.md#timezone) (オプション)。

**返される値**

- 対応するホッピングウィンドウの包含下限。 [DateTime](../data-types/datetime.md), [Tuple](../data-types/tuple.md) または [UInt32](../data-types/int-uint.md)。

:::note
1つのレコードが複数のホップウィンドウに割り当てられる可能性があるため、ホップ関数が **WINDOW VIEW** なしで使用される場合、関数は **最初の** ウィンドウの境界のみを返します。
:::

**例**

クエリ:

```sql
SELECT hopStart(now(), INTERVAL '1' DAY, INTERVAL '2' DAY);
```

結果:

```text
┌─hopStart(now(), toIntervalDay('1'), toIntervalDay('2'))─┐
│                                     2024-07-03 00:00:00 │
└─────────────────────────────────────────────────────────┘
```

## hopEnd {#hopend}

対応する [ホッピングウィンドウ](#hop) の排他上限を返します。

**構文**

```sql
hopEnd(time_attr, hop_interval, window_interval [, timezone]);
```
**引数**

- `time_attr` — 日付と時刻。 [DateTime](../data-types/datetime.md).
- `hop_interval` — 正のホップ間隔。 [Interval](../data-types/special-data-types/interval.md).
- `window_interval` — 正のウィンドウ間隔。 [Interval](../data-types/special-data-types/interval.md).
- `timezone` — [タイムゾーン名](../../operations/server-configuration-parameters/settings.md#timezone) (オプション)。

**返される値**

- 対応するホッピングウィンドウの排他上限。 [DateTime](../data-types/datetime.md), [Tuple](../data-types/tuple.md) または [UInt32](../data-types/int-uint.md)。

:::note
1つのレコードが複数のホップウィンドウに割り当てられる可能性があるため、ホップ関数が **WINDOW VIEW** なしで使用される場合、関数は **最初の** ウィンドウの境界のみを返します。
:::

**例**

クエリ:

```sql
SELECT hopEnd(now(), INTERVAL '1' DAY, INTERVAL '2' DAY);
```

結果:

```text
┌─hopEnd(now(), toIntervalDay('1'), toIntervalDay('2'))─┐
│                                   2024-07-05 00:00:00 │
└───────────────────────────────────────────────────────┘

```

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseでの時系列データの操作](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)

<!-- 
The inner content of the tags below are replaced at doc framework build time with 
docs generated from system.functions. Please do not modify or remove the tags.
See: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
-->

<!--AUTOGENERATED_START-->
<!--AUTOGENERATED_END-->
