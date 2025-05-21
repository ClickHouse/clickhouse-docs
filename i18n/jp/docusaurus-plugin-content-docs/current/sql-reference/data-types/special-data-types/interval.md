description: '時間と日付の間隔を表す特別なデータ型に関するドキュメント'
sidebar_label: '間隔'
sidebar_position: 61
slug: /sql-reference/data-types/special-data-types/interval
title: '間隔'
```


# 間隔

時間と日付の間隔を表すデータ型のファミリー。 [INTERVAL](/sql-reference/operators#interval) 演算子の結果として得られる型。

構造：

- 符号なし整数値としての時間間隔。
- 間隔のタイプ。

サポートされている間隔タイプ：

- `NANOSECOND`
- `MICROSECOND`
- `MILLISECOND`
- `SECOND`
- `MINUTE`
- `HOUR`
- `DAY`
- `WEEK`
- `MONTH`
- `QUARTER`
- `YEAR`

各間隔タイプには別々のデータ型があります。例えば、`DAY` 間隔は `IntervalDay` データ型に対応します：

```sql
SELECT toTypeName(INTERVAL 4 DAY)
```

```text
┌─toTypeName(toIntervalDay(4))─┐
│ IntervalDay                  │
└──────────────────────────────┘
```

## 使用上の注意 {#usage-remarks}

`Interval` 型の値を [Date](../../../sql-reference/data-types/date.md) および [DateTime](../../../sql-reference/data-types/datetime.md) 型の値との算術演算で使用できます。例えば、現在の時間に4日を加えることができます：

```sql
SELECT now() as current_date_time, current_date_time + INTERVAL 4 DAY
```

```text
┌───current_date_time─┬─plus(now(), toIntervalDay(4))─┐
│ 2019-10-23 10:58:45 │           2019-10-27 10:58:45 │
└─────────────────────┴───────────────────────────────┘
```

また、複数の間隔を同時に使用することも可能です：

```sql
SELECT now() AS current_date_time, current_date_time + (INTERVAL 4 DAY + INTERVAL 3 HOUR)
```

```text
┌───current_date_time─┬─plus(current_date_time, plus(toIntervalDay(4), toIntervalHour(3)))─┐
│ 2024-08-08 18:31:39 │                                                2024-08-12 21:31:39 │
└─────────────────────┴────────────────────────────────────────────────────────────────────┘
```

異なる間隔を持つ値を比較することもできます：

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
- [toInterval](/sql-reference/functions/type-conversion-functions#tointervalyear) 型変換関数
