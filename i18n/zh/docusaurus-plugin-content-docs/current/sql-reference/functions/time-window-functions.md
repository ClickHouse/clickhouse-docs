---
'description': '时间窗口函数的文档'
'sidebar_label': '时间窗口'
'slug': '/sql-reference/functions/time-window-functions'
'title': '时间窗口函数'
'doc_type': 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# 时间窗口函数

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

时间窗口函数返回对应窗口的包含下限和排除上限。用于处理 [WindowView](/sql-reference/statements/create/view#window-view) 的函数如下所示：

## tumble {#tumble}

翻转时间窗口将记录分配到非重叠的、连续的具有固定持续时间（`interval`）的窗口中。

**语法**

```sql
tumble(time_attr, interval [, timezone])
```

**参数**
- `time_attr` — 日期和时间。 [DateTime](../data-types/datetime.md)。
- `interval` — [Interval](../data-types/special-data-types/interval.md) 中的窗口间隔。
- `timezone` — [时区名称](../../operations/server-configuration-parameters/settings.md#timezone)（可选）。

**返回值**

- 对应的翻转窗口的包含下限和排除上限。 [Tuple](../data-types/tuple.md)([DateTime](../data-types/datetime.md), [DateTime](../data-types/datetime.md))。

**示例**

查询：

```sql
SELECT tumble(now(), toIntervalDay('1'));
```

结果：

```text
┌─tumble(now(), toIntervalDay('1'))─────────────┐
│ ('2024-07-04 00:00:00','2024-07-05 00:00:00') │
└───────────────────────────────────────────────┘
```

## tumbleStart {#tumblestart}

返回对应 [翻转窗口](#tumble) 的包含下限。

**语法**

```sql
tumbleStart(time_attr, interval [, timezone]);
```

**参数**

- `time_attr` — 日期和时间。 [DateTime](../data-types/datetime.md)。
- `interval` — [Interval](../data-types/special-data-types/interval.md) 中的窗口间隔。
- `timezone` — [时区名称](../../operations/server-configuration-parameters/settings.md#timezone)（可选）。

**返回值**

- 对应翻转窗口的包含下限。 [DateTime](../data-types/datetime.md)，[Tuple](../data-types/tuple.md) 或 [UInt32](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT tumbleStart(now(), toIntervalDay('1'));
```

结果：

```response
┌─tumbleStart(now(), toIntervalDay('1'))─┐
│                    2024-07-04 00:00:00 │
└────────────────────────────────────────┘
```

## tumbleEnd {#tumbleend}

返回对应 [翻转窗口](#tumble) 的排除上限。

**语法**

```sql
tumbleEnd(time_attr, interval [, timezone]);
```

**参数**

- `time_attr` — 日期和时间。 [DateTime](../data-types/datetime.md)。
- `interval` — [Interval](../data-types/special-data-types/interval.md) 中的窗口间隔。
- `timezone` — [时区名称](../../operations/server-configuration-parameters/settings.md#timezone)（可选）。

**返回值**

- 对应翻转窗口的排除上限。 [DateTime](../data-types/datetime.md)，[Tuple](../data-types/tuple.md) 或 [UInt32](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT tumbleEnd(now(), toIntervalDay('1'));
```

结果：

```response
┌─tumbleEnd(now(), toIntervalDay('1'))─┐
│                  2024-07-05 00:00:00 │
└──────────────────────────────────────┘
```

## hop {#hop}

跳跃时间窗口具有固定的持续时间（`window_interval`）并按指定的跳跃间隔（`hop_interval`）跳跃。如果 `hop_interval` 小于 `window_interval`，则跳跃窗口会重叠。因此，记录可以被分配到多个窗口。

```sql
hop(time_attr, hop_interval, window_interval [, timezone])
```

**参数**

- `time_attr` — 日期和时间。 [DateTime](../data-types/datetime.md)。
- `hop_interval` — 正的跳跃间隔。 [Interval](../data-types/special-data-types/interval.md)。
- `window_interval` — 正的窗口间隔。 [Interval](../data-types/special-data-types/interval.md)。
- `timezone` — [时区名称](../../operations/server-configuration-parameters/settings.md#timezone)（可选）。

**返回值**

- 对应跳跃窗口的包含下限和排除上限。 [Tuple](../data-types/tuple.md)([DateTime](../data-types/datetime.md), [DateTime](../data-types/datetime.md))。

:::note
由于一条记录可以被分配到多个跳跃窗口，因此在 **不使用** `WINDOW VIEW` 的情况下调用跳跃函数时，该函数仅返回 **第一个** 窗口的边界。
:::

**示例**

查询：

```sql
SELECT hop(now(), INTERVAL '1' DAY, INTERVAL '2' DAY);
```

结果：

```text
┌─hop(now(), toIntervalDay('1'), toIntervalDay('2'))─┐
│ ('2024-07-03 00:00:00','2024-07-05 00:00:00')      │
└────────────────────────────────────────────────────┘
```

## hopStart {#hopstart}

返回对应 [跳跃窗口](#hop) 的包含下限。

**语法**

```sql
hopStart(time_attr, hop_interval, window_interval [, timezone]);
```

**参数**

- `time_attr` — 日期和时间。 [DateTime](../data-types/datetime.md)。
- `hop_interval` — 正的跳跃间隔。 [Interval](../data-types/special-data-types/interval.md)。
- `window_interval` — 正的窗口间隔。 [Interval](../data-types/special-data-types/interval.md)。
- `timezone` — [时区名称](../../operations/server-configuration-parameters/settings.md#timezone)（可选）。

**返回值**

- 对应跳跃窗口的包含下限。 [DateTime](../data-types/datetime.md)，[Tuple](../data-types/tuple.md) 或 [UInt32](../data-types/int-uint.md)。

:::note
由于一条记录可以被分配到多个跳跃窗口，因此在 **不使用** `WINDOW VIEW` 的情况下调用跳跃函数时，该函数仅返回 **第一个** 窗口的边界。
:::

**示例**

查询：

```sql
SELECT hopStart(now(), INTERVAL '1' DAY, INTERVAL '2' DAY);
```

结果：

```text
┌─hopStart(now(), toIntervalDay('1'), toIntervalDay('2'))─┐
│                                     2024-07-03 00:00:00 │
└─────────────────────────────────────────────────────────┘
```

## hopEnd {#hopend}

返回对应 [跳跃窗口](#hop) 的排除上限。

**语法**

```sql
hopEnd(time_attr, hop_interval, window_interval [, timezone]);
```

**参数**

- `time_attr` — 日期和时间。 [DateTime](../data-types/datetime.md)。
- `hop_interval` — 正的跳跃间隔。 [Interval](../data-types/special-data-types/interval.md)。
- `window_interval` — 正的窗口间隔。 [Interval](../data-types/special-data-types/interval.md)。
- `timezone` — [时区名称](../../operations/server-configuration-parameters/settings.md#timezone)（可选）。

**返回值**

- 对应跳跃窗口的排除上限。 [DateTime](../data-types/datetime.md)，[Tuple](../data-types/tuple.md) 或 [UInt32](../data-types/int-uint.md)。

:::note
由于一条记录可以被分配到多个跳跃窗口，因此在 **不使用** `WINDOW VIEW` 的情况下调用跳跃函数时，该函数仅返回 **第一个** 窗口的边界。
:::

**示例**

查询：

```sql
SELECT hopEnd(now(), INTERVAL '1' DAY, INTERVAL '2' DAY);
```

结果：

```text
┌─hopEnd(now(), toIntervalDay('1'), toIntervalDay('2'))─┐
│                                   2024-07-05 00:00:00 │
└───────────────────────────────────────────────────────┘

```

## 相关内容 {#related-content}

- 博客: [在 ClickHouse 中处理时间序列数据](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)

<!-- 
The inner content of the tags below are replaced at doc framework build time with 
docs generated from system.functions. Please do not modify or remove the tags.
See: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
-->

<!--AUTOGENERATED_START-->
<!--AUTOGENERATED_END-->
