---
description: 'Interval 特殊データ型に関するドキュメント'
sidebar_label: 'Interval'
sidebar_position: 61
slug: /sql-reference/data-types/special-data-types/interval
title: 'Interval'
doc_type: 'reference'
---

# Interval {#interval}

日時の間隔を表すデータ型のファミリーです。[INTERVAL](/sql-reference/operators#interval) 演算子の結果として得られる型です。

構造:

* 符号なし整数値として表される時間間隔。
* 間隔の型。

サポートされている間隔の種類:

* `NANOSECOND`
* `MICROSECOND`
* `MILLISECOND`
* `SECOND`
* `MINUTE`
* `HOUR`
* `DAY`
* `WEEK`
* `MONTH`
* `QUARTER`
* `YEAR`

各間隔の種類ごとに、個別のデータ型が定義されています。たとえば、`DAY` 間隔は `IntervalDay` データ型に対応します。

```sql
SELECT toTypeName(INTERVAL 4 DAY)
```

```text
┌─toTypeName(toIntervalDay(4))─┐
│ IntervalDay                  │
└──────────────────────────────┘
```

## 使用上の注意 {#usage-remarks}

`Interval` 型の値は、[Date](../../../sql-reference/data-types/date.md) 型および [DateTime](../../../sql-reference/data-types/datetime.md) 型の値との算術演算に使用できます。たとえば、現在時刻に 4 日を足すことができます。

```sql
SELECT now() AS current_date_time, current_date_time + INTERVAL 4 DAY
```

```text
┌───current_date_time─┬─plus(now(), toIntervalDay(4))─┐
│ 2019-10-23 10:58:45 │           2019-10-27 10:58:45 │
└─────────────────────┴───────────────────────────────┘
```

また、複数のインターバルを同時に指定することもできます。

```sql
SELECT now() AS current_date_time, current_date_time + (INTERVAL 4 DAY + INTERVAL 3 HOUR)
```

```text
┌───current_date_time─┬─plus(current_date_time, plus(toIntervalDay(4), toIntervalHour(3)))─┐
│ 2024-08-08 18:31:39 │                                                2024-08-12 21:31:39 │
└─────────────────────┴────────────────────────────────────────────────────────────────────┘
```

また、異なる間隔の値を比較するには、次のようにします：

```sql
SELECT toIntervalMicrosecond(3600000000) = toIntervalHour(1);
```

```text
┌─less(toIntervalMicrosecond(179999999), toIntervalMinute(3))─┐
│                                                           1 │
└─────────────────────────────────────────────────────────────┘
```

## 関連項目 {#see-also}

- [INTERVAL](/sql-reference/operators#interval) 演算子
- [toInterval](/sql-reference/functions/type-conversion-functions#toIntervalYear) 型変換関数
