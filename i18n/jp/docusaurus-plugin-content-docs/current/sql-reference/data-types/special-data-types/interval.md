---
description: 'Interval 特殊データ型のドキュメント'
sidebar_label: 'Interval'
sidebar_position: 61
slug: /sql-reference/data-types/special-data-types/interval
title: 'Interval'
doc_type: 'reference'
---



# Interval

日付・時刻のインターバルを表すデータ型ファミリーです。[INTERVAL](/sql-reference/operators#interval) 演算子の結果型となるデータ型です。

構造は次のとおりです:

* 符号なし整数値としての時間インターバル。
* インターバルの型。

サポートされているインターバルの型:

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

各インターバル型ごとに個別のデータ型があります。たとえば、`DAY` インターバルは `IntervalDay` データ型に対応します。

```sql
SELECT toTypeName(INTERVAL 4 DAY)
```

```text
┌─toTypeName(toIntervalDay(4))─┐
│ IntervalDay                  │
└──────────────────────────────┘
```


## 使用上の注意 {#usage-remarks}

`Interval`型の値は、[Date](../../../sql-reference/data-types/date.md)型および[DateTime](../../../sql-reference/data-types/datetime.md)型の値との算術演算で使用できます。例えば、現在時刻に4日を加算できます:

```sql
SELECT now() AS current_date_time, current_date_time + INTERVAL 4 DAY
```

```text
┌───current_date_time─┬─plus(now(), toIntervalDay(4))─┐
│ 2019-10-23 10:58:45 │           2019-10-27 10:58:45 │
└─────────────────────┴───────────────────────────────┘
```

また、複数のインターバルを同時に使用することも可能です:

```sql
SELECT now() AS current_date_time, current_date_time + (INTERVAL 4 DAY + INTERVAL 3 HOUR)
```

```text
┌───current_date_time─┬─plus(current_date_time, plus(toIntervalDay(4), toIntervalHour(3)))─┐
│ 2024-08-08 18:31:39 │                                                2024-08-12 21:31:39 │
└─────────────────────┴────────────────────────────────────────────────────────────────────┘
```

異なるインターバルの値を比較することもできます:

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
