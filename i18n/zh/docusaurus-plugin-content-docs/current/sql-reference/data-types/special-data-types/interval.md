---
description: 'Interval 特殊数据类型文档'
sidebar_label: 'Interval'
sidebar_position: 61
slug: /sql-reference/data-types/special-data-types/interval
title: 'Interval'
doc_type: 'reference'
---

# Interval \{#interval\}

表示时间和日期间隔的一类数据类型。[INTERVAL](/sql-reference/operators#interval) 运算符所产生的结果类型。

结构：

* 以无符号整数值表示的时间间隔。
* 间隔的类型。

支持的间隔类型：

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

对于每种间隔类型，都有一个对应的数据类型。例如，`DAY` 间隔对应 `IntervalDay` 数据类型：

```sql
SELECT toTypeName(INTERVAL 4 DAY)
```

```text
┌─toTypeName(toIntervalDay(4))─┐
│ IntervalDay                  │
└──────────────────────────────┘
```


## 使用注意事项 \{#usage-remarks\}

可以将 `Interval` 类型的值与 [Date](../../../sql-reference/data-types/date.md) 和 [DateTime](../../../sql-reference/data-types/datetime.md) 类型的值一起用于算术运算。例如，可以在当前时间的基础上加 4 天：

```sql
SELECT now() AS current_date_time, current_date_time + INTERVAL 4 DAY
```

```text
┌───current_date_time─┬─plus(now(), toIntervalDay(4))─┐
│ 2019-10-23 10:58:45 │           2019-10-27 10:58:45 │
└─────────────────────┴───────────────────────────────┘
```

也可以同时使用多个时间区间：

```sql
SELECT now() AS current_date_time, current_date_time + (INTERVAL 4 DAY + INTERVAL 3 HOUR)
```

```text
┌───current_date_time─┬─plus(current_date_time, plus(toIntervalDay(4), toIntervalHour(3)))─┐
│ 2024-08-08 18:31:39 │                                                2024-08-12 21:31:39 │
└─────────────────────┴────────────────────────────────────────────────────────────────────┘
```

以及比较基于不同时间区间的值：

```sql
SELECT toIntervalMicrosecond(3600000000) = toIntervalHour(1);
```

```text
┌─less(toIntervalMicrosecond(179999999), toIntervalMinute(3))─┐
│                                                           1 │
└─────────────────────────────────────────────────────────────┘
```


## 混合类型时间间隔 \{#mixed-type-intervals\}

可以使用 `INTERVAL 'value' <from_kind> TO <to_kind>` 语法创建混合类型的时间间隔，例如同时包含多个小时和多个分钟的时间间隔。
结果是一个由两个或更多时间间隔组成的元组。

支持的组合：

| 语法                 | 字符串格式     | 示例                                    |
| ------------------ | --------- | ------------------------------------- |
| `YEAR TO MONTH`    | `Y-M`     | `INTERVAL '2-6' YEAR TO MONTH`        |
| `DAY TO HOUR`      | `D H`     | `INTERVAL '5 12' DAY TO HOUR`         |
| `DAY TO MINUTE`    | `D H:M`   | `INTERVAL '5 12:30' DAY TO MINUTE`    |
| `DAY TO SECOND`    | `D H:M:S` | `INTERVAL '5 12:30:45' DAY TO SECOND` |
| `HOUR TO MINUTE`   | `H:M`     | `INTERVAL '1:30' HOUR TO MINUTE`      |
| `HOUR TO SECOND`   | `H:M:S`   | `INTERVAL '1:30:45' HOUR TO SECOND`   |
| `MINUTE TO SECOND` | `M:S`     | `INTERVAL '5:30' MINUTE TO SECOND`    |

根据 SQL 标准，非首字段会按以下范围进行校验：`MONTH` 为 0-11，`HOUR` 为 0-23，`MINUTE` 为 0-59，`SECOND` 为 0-59。

```sql
SELECT INTERVAL '1:30' HOUR TO MINUTE;
```

```text
┌─(toIntervalHour(1), toIntervalMinute(30))─┐
│ (1,30)                                     │
└────────────────────────────────────────────┘
```

可选的前导 `+` 或 `-` 符号会应用于所有部分：

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


## 另请参阅 \{#see-also\}

- [INTERVAL](/sql-reference/operators#interval) 运算符
- [toInterval](/sql-reference/functions/type-conversion-functions#toIntervalYear) 类型转换函数