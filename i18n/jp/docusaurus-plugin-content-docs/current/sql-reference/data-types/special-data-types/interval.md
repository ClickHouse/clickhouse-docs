---
'description': 'Interval 特殊データ型の Documentation'
'sidebar_label': 'インターバル'
'sidebar_position': 61
'slug': '/sql-reference/data-types/special-data-types/interval'
'title': 'インターバル'
'doc_type': 'reference'
---


# インターバル

時間と日付のインターバルを表すデータ型のファミリー。結果のデータ型は [INTERVAL](/sql-reference/operators#interval) 演算子から得られます。

構造：

- 符号なしの整数値としての時間インターバル。
- インターバルのタイプ。

サポートされているインターバルタイプ：

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

各インターバルタイプには、別々のデータ型があります。例えば、`DAY` インターバルは `IntervalDay` データ型に対応します：

```sql
SELECT toTypeName(INTERVAL 4 DAY)
```

```text
┌─toTypeName(toIntervalDay(4))─┐
│ IntervalDay                  │
└──────────────────────────────┘
```

## 使用の注意事項 {#usage-remarks}

`Interval`型の値を、[Date](../../../sql-reference/data-types/date.md) および [DateTime](../../../sql-reference/data-types/datetime.md)型の値との算術演算に使用できます。例えば、現在の時間に4日を加えることができます：

```sql
SELECT now() AS current_date_time, current_date_time + INTERVAL 4 DAY
```

```text
┌───current_date_time─┬─plus(now(), toIntervalDay(4))─┐
│ 2019-10-23 10:58:45 │           2019-10-27 10:58:45 │
└─────────────────────┴───────────────────────────────┘
```

また、複数のインターバルを同時に使用することも可能です：

```sql
SELECT now() AS current_date_time, current_date_time + (INTERVAL 4 DAY + INTERVAL 3 HOUR)
```

```text
┌───current_date_time─┬─plus(current_date_time, plus(toIntervalDay(4), toIntervalHour(3)))─┐
│ 2024-08-08 18:31:39 │                                                2024-08-12 21:31:39 │
└─────────────────────┴────────────────────────────────────────────────────────────────────┘
```

異なるインターバルを持つ値を比較することもできます：

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
