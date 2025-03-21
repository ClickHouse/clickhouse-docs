---
slug: /sql-reference/data-types/special-data-types/interval
sidebar_position: 61
sidebar_label: Interval
---


# Interval

表示时间和日期区间的数据类型系列。`[INTERVAL](/sql-reference/operators#interval)` 运算符的结果类型。

结构：

- 以无符号整数值表示的时间间隔。
- 区间的类型。

支持的区间类型：

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

对于每种区间类型，都有一个单独的数据类型。例如，`DAY` 区间对应于 `IntervalDay` 数据类型：

``` sql
SELECT toTypeName(INTERVAL 4 DAY)
```

``` text
┌─toTypeName(toIntervalDay(4))─┐
│ IntervalDay                  │
└──────────────────────────────┘
```

## 使用注意事项 {#usage-remarks}

您可以在与 [Date](../../../sql-reference/data-types/date.md) 和 [DateTime](../../../sql-reference/data-types/datetime.md) 类型值的算术运算中使用 `Interval` 类型值。例如，您可以将当前时间加上 4 天：

``` sql
SELECT now() as current_date_time, current_date_time + INTERVAL 4 DAY
```

``` text
┌───current_date_time─┬─plus(now(), toIntervalDay(4))─┐
│ 2019-10-23 10:58:45 │           2019-10-27 10:58:45 │
└─────────────────────┴───────────────────────────────┘
```

同时也可以使用多个区间：

``` sql
SELECT now() AS current_date_time, current_date_time + (INTERVAL 4 DAY + INTERVAL 3 HOUR)
```

``` text
┌───current_date_time─┬─plus(current_date_time, plus(toIntervalDay(4), toIntervalHour(3)))─┐
│ 2024-08-08 18:31:39 │                                                2024-08-12 21:31:39 │
└─────────────────────┴────────────────────────────────────────────────────────────────────┘
```

并且可以比较不同区间的值：

``` sql
SELECT toIntervalMicrosecond(3600000000) = toIntervalHour(1);
```

``` text
┌─less(toIntervalMicrosecond(179999999), toIntervalMinute(3))─┐
│                                                           1 │
└─────────────────────────────────────────────────────────────┘
```

## 另外参见 {#see-also}

- `[INTERVAL](/sql-reference/operators#interval)` 运算符
- `[toInterval](/sql-reference/functions/type-conversion-functions#tointervalyear)` 类型转换函数
