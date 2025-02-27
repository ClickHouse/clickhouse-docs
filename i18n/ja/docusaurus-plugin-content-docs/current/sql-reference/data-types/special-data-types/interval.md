---
slug: /sql-reference/data-types/special-data-types/interval
sidebar_position: 61
sidebar_label: インターバル
---

# インターバル

時間と日付のインターバルを表すデータ型のファミリー。 [INTERVAL](../../../sql-reference/operators/index.md#operator-interval) 演算子の結果となる型。

構造:

- 符号なし整数値としての時間間隔。
- インターバルの型。

サポートされているインターバルの型:

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

各インターバル型には別々のデータ型があります。例えば、`DAY` インターバルは `IntervalDay` データ型に対応します:

``` sql
SELECT toTypeName(INTERVAL 4 DAY)
```

``` text
┌─toTypeName(toIntervalDay(4))─┐
│ IntervalDay                  │
└──────────────────────────────┘
```

## 使用に関する注意事項 {#usage-remarks}

`Interval` 型の値を [Date](../../../sql-reference/data-types/date.md) および [DateTime](../../../sql-reference/data-types/datetime.md) 型の値との算術演算に使用できます。例えば、現在の時刻に4日を追加することができます:

``` sql
SELECT now() as current_date_time, current_date_time + INTERVAL 4 DAY
```

``` text
┌───current_date_time─┬─plus(now(), toIntervalDay(4))─┐
│ 2019-10-23 10:58:45 │           2019-10-27 10:58:45 │
└─────────────────────┴───────────────────────────────┘
```

また、複数のインターバルを同時に使用することも可能です:

``` sql
SELECT now() AS current_date_time, current_date_time + (INTERVAL 4 DAY + INTERVAL 3 HOUR)
```

``` text
┌───current_date_time─┬─plus(current_date_time, plus(toIntervalDay(4), toIntervalHour(3)))─┐
│ 2024-08-08 18:31:39 │                                                2024-08-12 21:31:39 │
└─────────────────────┴────────────────────────────────────────────────────────────────────┘
```

異なるインターバルの値を比較することもできます:

``` sql
SELECT toIntervalMicrosecond(3600000000) = toIntervalHour(1);
```

``` text
┌─less(toIntervalMicrosecond(179999999), toIntervalMinute(3))─┐
│                                                           1 │
└─────────────────────────────────────────────────────────────┘
```

## 参照 {#see-also}

- [INTERVAL](../../../sql-reference/operators/index.md#operator-interval) 演算子
- [toInterval](../../../sql-reference/functions/type-conversion-functions.md#function-tointerval) 型変換関数
