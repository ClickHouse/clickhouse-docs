---
'description': 'Interval 特殊数据类型的文档'
'sidebar_label': '间隔'
'sidebar_position': 61
'slug': '/sql-reference/data-types/special-data-types/interval'
'title': 'Interval'
---




# 区间

表示时间和日期区间的数据类型家族。[INTERVAL](/sql-reference/operators#interval) 操作符的结果类型。

结构：

- 作为无符号整数值的时间间隔。
- 间隔的类型。

支持的间隔类型：

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

对于每种间隔类型，存在单独的数据类型。例如，`DAY` 间隔对应于 `IntervalDay` 数据类型：

```sql
SELECT toTypeName(INTERVAL 4 DAY)
```

```text
┌─toTypeName(toIntervalDay(4))─┐
│ IntervalDay                  │
└──────────────────────────────┘
```

## 使用说明 {#usage-remarks}

您可以在与 [Date](../../../sql-reference/data-types/date.md) 和 [DateTime](../../../sql-reference/data-types/datetime.md) 类型值进行算术运算时使用 `Interval` 类型的值。例如，您可以将 4 天增加到当前时间：

```sql
SELECT now() as current_date_time, current_date_time + INTERVAL 4 DAY
```

```text
┌───current_date_time─┬─plus(now(), toIntervalDay(4))─┐
│ 2019-10-23 10:58:45 │           2019-10-27 10:58:45 │
└─────────────────────┴───────────────────────────────┘
```

同时也可以同时使用多个间隔：

```sql
SELECT now() AS current_date_time, current_date_time + (INTERVAL 4 DAY + INTERVAL 3 HOUR)
```

```text
┌───current_date_time─┬─plus(current_date_time, plus(toIntervalDay(4), toIntervalHour(3)))─┐
│ 2024-08-08 18:31:39 │                                                2024-08-12 21:31:39 │
└─────────────────────┴────────────────────────────────────────────────────────────────────┘
```

并比较具有不同间隔的值：

```sql
SELECT toIntervalMicrosecond(3600000000) = toIntervalHour(1);
```

```text
┌─less(toIntervalMicrosecond(179999999), toIntervalMinute(3))─┐
│                                                           1 │
└─────────────────────────────────────────────────────────────┘
```

## 另请参阅 {#see-also}

- [INTERVAL](/sql-reference/operators#interval) 操作符
- [toInterval](/sql-reference/functions/type-conversion-functions#tointervalyear) 类型转换函数
