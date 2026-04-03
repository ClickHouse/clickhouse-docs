---
description: 'Interval 特殊データ型に関するドキュメント'
sidebar_label: 'Interval'
sidebar_position: 61
slug: /sql-reference/data-types/special-data-types/interval
title: 'Interval'
doc_type: 'reference'
---

# Interval \{#interval\}

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

各間隔の種類ごとに、個別のデータ型が定義されています。たとえば、`DAY` 間隔は `IntervalDay` データ型に対応します:

```sql
SELECT toTypeName(INTERVAL 4 DAY)
```

```text
┌─toTypeName(toIntervalDay(4))─┐
│ IntervalDay                  │
└──────────────────────────────┘
```


## 使用上の注意 \{#usage-remarks\}

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

また、異なるインターバル同士の値を比較するには、次のようにします：

```sql
SELECT toIntervalMicrosecond(3600000000) = toIntervalHour(1);
```

```text
┌─less(toIntervalMicrosecond(179999999), toIntervalMinute(3))─┐
│                                                           1 │
└─────────────────────────────────────────────────────────────┘
```


## 混合型インターバル \{#mixed-type-intervals\}

複数の時間と複数の分のような混合型インターバルは、`INTERVAL 'value' <from_kind> TO <to_kind>` 構文を使用して作成できます。
結果は、2 つ以上のインターバルからなるタプルです。

サポートされる組み合わせ:

| 構文                 | 文字列フォーマット | 例                                     |
| ------------------ | --------- | ------------------------------------- |
| `YEAR TO MONTH`    | `Y-M`     | `INTERVAL '2-6' YEAR TO MONTH`        |
| `DAY TO HOUR`      | `D H`     | `INTERVAL '5 12' DAY TO HOUR`         |
| `DAY TO MINUTE`    | `D H:M`   | `INTERVAL '5 12:30' DAY TO MINUTE`    |
| `DAY TO SECOND`    | `D H:M:S` | `INTERVAL '5 12:30:45' DAY TO SECOND` |
| `HOUR TO MINUTE`   | `H:M`     | `INTERVAL '1:30' HOUR TO MINUTE`      |
| `HOUR TO SECOND`   | `H:M:S`   | `INTERVAL '1:30:45' HOUR TO SECOND`   |
| `MINUTE TO SECOND` | `M:S`     | `INTERVAL '5:30' MINUTE TO SECOND`    |

先頭以外のフィールドは SQL 標準に従って検証されます。`MONTH` は 0～11、`HOUR` は 0～23、`MINUTE` は 0～59、`SECOND` は 0～59 です。

```sql
SELECT INTERVAL '1:30' HOUR TO MINUTE;
```

```text
┌─(toIntervalHour(1), toIntervalMinute(30))─┐
│ (1,30)                                     │
└────────────────────────────────────────────┘
```

先頭の省略可能な `+` または `-` 符号は、すべての部分に適用されます:

```sql
SELECT INTERVAL '+1:30' HOUR TO MINUTE;
-- this is equivalent to:
-- SELECT INTERVAL '1:30' HOUR TO MINUTE;
```

```text
┌─(toIntervalHour(1), toIntervalMinute(30))─┐
│ (1,30)                                     │
└────────────────────────────────────────────┘
```


## 関連項目 \{#see-also\}

- [INTERVAL](/sql-reference/operators#interval) 演算子
- [toInterval](/sql-reference/functions/type-conversion-functions#toIntervalYear) 型変換関数