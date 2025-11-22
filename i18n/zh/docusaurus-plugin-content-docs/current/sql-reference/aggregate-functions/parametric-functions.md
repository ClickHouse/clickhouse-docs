---
description: '参数化聚合函数文档'
sidebar_label: '参数化'
sidebar_position: 38
slug: /sql-reference/aggregate-functions/parametric-functions
title: '参数化聚合函数'
doc_type: 'reference'
---



# 参数化聚合函数

某些聚合函数不仅可以接受参数列（用于聚合计算），还可以接受一组参数——用于初始化的常量。其语法是使用两对括号而不是一对：第一对用于参数，第二对用于参数列。



## histogram {#histogram}

计算自适应直方图。不保证结果精确。

```sql
histogram(number_of_bins)(values)
```

该函数使用[流式并行决策树算法](http://jmlr.org/papers/volume11/ben-haim10a/ben-haim10a.pdf)。随着新数据进入函数,直方图分箱的边界会动态调整。通常情况下,各分箱的宽度并不相等。

**参数**

`values` — 产生输入值的[表达式](/sql-reference/syntax#expressions)。

**参数**

`number_of_bins` — 直方图分箱数量的上限。函数会自动计算分箱数量。它会尝试达到指定的分箱数量,如果无法达到,则使用较少的分箱。

**返回值**

- 以下格式的[元组](../../sql-reference/data-types/tuple.md)[数组](../../sql-reference/data-types/array.md):

        ```
        [(lower_1, upper_1, height_1), ... (lower_N, upper_N, height_N)]
        ```

        - `lower` — 分箱的下界。
        - `upper` — 分箱的上界。
        - `height` — 分箱的计算高度。

**示例**

```sql
SELECT histogram(5)(number + 1)
FROM (
    SELECT *
    FROM system.numbers
    LIMIT 20
)
```

```text
┌─histogram(5)(plus(number, 1))───────────────────────────────────────────┐
│ [(1,4.5,4),(4.5,8.5,4),(8.5,12.75,4.125),(12.75,17,4.625),(17,20,3.25)] │
└─────────────────────────────────────────────────────────────────────────┘
```

您可以使用 [bar](/sql-reference/functions/other-functions#bar) 函数将直方图可视化,例如:

```sql
WITH histogram(5)(rand() % 100) AS hist
SELECT
    arrayJoin(hist).3 AS height,
    bar(height, 0, 6, 5) AS bar
FROM
(
    SELECT *
    FROM system.numbers
    LIMIT 20
)
```

```text
┌─height─┬─bar───┐
│  2.125 │ █▋    │
│   3.25 │ ██▌   │
│  5.625 │ ████▏ │
│  5.625 │ ████▏ │
│  3.375 │ ██▌   │
└────────┴───────┘
```

在这种情况下,需要注意您无法得知直方图分箱的边界值。


## sequenceMatch {#sequencematch}

检查序列中是否包含与模式匹配的事件链。

**语法**

```sql
sequenceMatch(pattern)(timestamp, cond1, cond2, ...)
```

:::note
在同一秒内发生的事件可能以未定义的顺序出现在序列中,从而影响结果。
:::

**参数**

- `timestamp` — 包含时间数据的列。典型数据类型为 `Date` 和 `DateTime`。也可以使用任何受支持的 [UInt](../../sql-reference/data-types/int-uint.md) 数据类型。

- `cond1`, `cond2` — 描述事件链的条件。数据类型:`UInt8`。最多可以传递 32 个条件参数。函数仅考虑这些条件中描述的事件。如果序列中包含未在条件中描述的数据,函数将跳过这些数据。

**参数**

- `pattern` — 模式字符串。参见[模式语法](#pattern-syntax)。

**返回值**

- 1,如果模式匹配。
- 0,如果模式不匹配。

类型:`UInt8`。

#### 模式语法 {#pattern-syntax}

- `(?N)` — 匹配位置 `N` 的条件参数。条件编号范围为 `[1, 32]`。例如,`(?1)` 匹配传递给 `cond1` 参数的参数。

- `.*` — 匹配任意数量的事件。匹配模式的此元素不需要条件参数。

- `(?t operator value)` — 设置两个事件之间应间隔的时间(以秒为单位)。例如,模式 `(?1)(?t>1800)(?2)` 匹配相隔超过 1800 秒的事件。这些事件之间可以存在任意数量的其他事件。可以使用 `>=`、`>`、`<`、`<=`、`==` 运算符。

**示例**

考虑 `t` 表中的数据:

```text
┌─time─┬─number─┐
│    1 │      1 │
│    2 │      3 │
│    3 │      2 │
└──────┴────────┘
```

执行查询:

```sql
SELECT sequenceMatch('(?1)(?2)')(time, number = 1, number = 2) FROM t
```

```text
┌─sequenceMatch('(?1)(?2)')(time, equals(number, 1), equals(number, 2))─┐
│                                                                     1 │
└───────────────────────────────────────────────────────────────────────┘
```

函数找到了数字 2 跟随数字 1 的事件链。它跳过了中间的数字 3,因为该数字未被描述为事件。如果我们想在搜索示例中给出的事件链时将这个数字考虑在内,应该为它创建一个条件。

```sql
SELECT sequenceMatch('(?1)(?2)')(time, number = 1, number = 2, number = 3) FROM t
```

```text
┌─sequenceMatch('(?1)(?2)')(time, equals(number, 1), equals(number, 2), equals(number, 3))─┐
│                                                                                        0 │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

在这种情况下,函数无法找到与模式匹配的事件链,因为数字 3 的事件发生在 1 和 2 之间。如果在相同情况下检查数字 4 的条件,序列将匹配该模式。

```sql
SELECT sequenceMatch('(?1)(?2)')(time, number = 1, number = 2, number = 4) FROM t
```

```text
┌─sequenceMatch('(?1)(?2)')(time, equals(number, 1), equals(number, 2), equals(number, 4))─┐
│                                                                                        1 │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

**另请参阅**

- [sequenceCount](#sequencecount)


## sequenceCount {#sequencecount}

计算与模式匹配的事件链数量。该函数搜索不重叠的事件链,在当前链匹配后开始搜索下一个链。

:::note
在同一秒内发生的事件可能以未定义的顺序出现在序列中,从而影响结果。
:::

**语法**

```sql
sequenceCount(pattern)(timestamp, cond1, cond2, ...)
```

**参数**

- `timestamp` — 包含时间数据的列。典型数据类型为 `Date` 和 `DateTime`。也可以使用任何支持的 [UInt](../../sql-reference/data-types/int-uint.md) 数据类型。

- `cond1`, `cond2` — 描述事件链的条件。数据类型:`UInt8`。最多可以传递 32 个条件参数。该函数仅考虑这些条件中描述的事件。如果序列包含条件中未描述的数据,函数将跳过这些数据。

**参数**

- `pattern` — 模式字符串。参见[模式语法](#pattern-syntax)。

**返回值**

- 匹配的非重叠事件链数量。

类型:`UInt64`。

**示例**

考虑 `t` 表中的数据:

```text
┌─time─┬─number─┐
│    1 │      1 │
│    2 │      3 │
│    3 │      2 │
│    4 │      1 │
│    5 │      3 │
│    6 │      2 │
└──────┴────────┘
```

计算数字 2 在数字 1 之后出现的次数,它们之间可以有任意数量的其他数字:

```sql
SELECT sequenceCount('(?1).*(?2)')(time, number = 1, number = 2) FROM t
```

```text
┌─sequenceCount('(?1).*(?2)')(time, equals(number, 1), equals(number, 2))─┐
│                                                                       2 │
└─────────────────────────────────────────────────────────────────────────┘
```


## sequenceMatchEvents {#sequencematchevents}

返回与模式匹配的最长事件链的事件时间戳。

:::note
在同一秒内发生的事件可能以未定义的顺序出现在序列中,从而影响结果。
:::

**语法**

```sql
sequenceMatchEvents(pattern)(timestamp, cond1, cond2, ...)
```

**参数**

- `timestamp` — 包含时间数据的列。典型的数据类型为 `Date` 和 `DateTime`。也可以使用任何支持的 [UInt](../../sql-reference/data-types/int-uint.md) 数据类型。

- `cond1`, `cond2` — 描述事件链的条件。数据类型:`UInt8`。最多可以传递 32 个条件参数。该函数仅考虑这些条件中描述的事件。如果序列包含未在条件中描述的数据,函数将跳过这些数据。

**参数**

- `pattern` — 模式字符串。参见[模式语法](#pattern-syntax)。

**返回值**

- 事件链中匹配条件参数 (?N) 的时间戳数组。数组中的位置与模式中条件参数的位置相对应

类型:Array。

**示例**

考虑 `t` 表中的数据:

```text
┌─time─┬─number─┐
│    1 │      1 │
│    2 │      3 │
│    3 │      2 │
│    4 │      1 │
│    5 │      3 │
│    6 │      2 │
└──────┴────────┘
```

返回最长链的事件时间戳

```sql
SELECT sequenceMatchEvents('(?1).*(?2).*(?1)(?3)')(time, number = 1, number = 2, number = 4) FROM t
```

```text
┌─sequenceMatchEvents('(?1).*(?2).*(?1)(?3)')(time, equals(number, 1), equals(number, 2), equals(number, 4))─┐
│ [1,3,4]                                                                                                    │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**另请参阅**

- [sequenceMatch](#sequencematch)


## windowFunnel {#windowfunnel}

在滑动时间窗口中搜索事件链,并计算链中发生的最大事件数。

该函数按照以下算法工作:

- 函数搜索触发链中第一个条件的数据,并将事件计数器设置为 1。此时滑动窗口开始计时。

- 如果链中的事件在窗口内按顺序发生,则计数器递增。如果事件序列被中断,则计数器不递增。

- 如果数据中存在多个处于不同完成阶段的事件链,函数将仅输出最长链的长度。

**语法**

```sql
windowFunnel(window, [mode, [mode, ... ]])(timestamp, cond1, cond2, ..., condN)
```

**参数**

- `timestamp` — 包含时间戳的列名。支持的数据类型:[Date](../../sql-reference/data-types/date.md)、[DateTime](/sql-reference/data-types/datetime) 以及其他无符号整数类型(请注意,尽管 timestamp 支持 `UInt64` 类型,但其值不能超过 Int64 的最大值,即 2^63 - 1)。
- `cond` — 描述事件链的条件或数据。[UInt8](../../sql-reference/data-types/int-uint.md)。

**参数**

- `window` — 滑动窗口的长度,即第一个条件和最后一个条件之间的时间间隔。`window` 的单位取决于 `timestamp` 本身,因此会有所不同。通过表达式 `timestamp of cond1 <= timestamp of cond2 <= ... <= timestamp of condN <= timestamp of cond1 + window` 来确定。
- `mode` — 可选参数。可以设置一个或多个模式。
  - `'strict_deduplication'` — 如果事件序列中相同条件重复出现,则此类重复事件会中断后续处理。注意:如果同一事件满足多个条件,可能会出现意外行为。
  - `'strict_order'` — 不允许其他事件的干预。例如,在 `A->B->D->C` 的情况下,会在 `D` 处停止查找 `A->B->C`,最大事件级别为 2。
  - `'strict_increase'` — 仅将条件应用于时间戳严格递增的事件。
  - `'strict_once'` — 即使事件多次满足条件,也只在链中计数一次

**返回值**

滑动时间窗口内链中连续触发条件的最大数量。
将分析选择中的所有链。

类型:`Integer`。

**示例**

判断设定的时间段是否足够用户在在线商店中选择手机并购买两次。

设置以下事件链:

1.  用户登录到商店账户(`eventID = 1003`)。
2.  用户搜索手机(`eventID = 1007, product = 'phone'`)。
3.  用户下单(`eventID = 1009`)。
4.  用户再次下单(`eventID = 1010`)。

输入表:


```text
┌─event_date─┬─user_id─┬───────────timestamp─┬─eventID─┬─product─┐
│ 2019-01-28 │       1 │ 2019-01-29 10:00:00 │    1003 │ phone   │
└────────────┴─────────┴─────────────────────┴─────────┴─────────┘
┌─event_date─┬─user_id─┬───────────timestamp─┬─eventID─┬─product─┐
│ 2019-01-31 │       1 │ 2019-01-31 09:00:00 │    1007 │ phone   │
└────────────┴─────────┴─────────────────────┴─────────┴─────────┘
┌─event_date─┬─user_id─┬───────────timestamp─┬─eventID─┬─product─┐
│ 2019-01-30 │       1 │ 2019-01-30 08:00:00 │    1009 │ phone   │
└────────────┴─────────┴─────────────────────┴─────────┴─────────┘
┌─event_date─┬─user_id─┬───────────timestamp─┬─eventID─┬─product─┐
│ 2019-02-01 │       1 │ 2019-02-01 08:00:00 │    1010 │ phone   │
└────────────┴─────────┴─────────────────────┴─────────┴─────────┘
```

找出在 2019 年 1 月至 2 月期间，用户 `user_id` 在该链路中最远走到了哪一步。

查询：

```sql
SELECT
    level,
    count() AS c
FROM
(
    SELECT
        user_id,
        windowFunnel(6048000000000000)(timestamp, eventID = 1003, eventID = 1009, eventID = 1007, eventID = 1010) AS level
    FROM trend
    WHERE (event_date >= '2019-01-01') AND (event_date <= '2019-02-02')
    GROUP BY user_id
)
GROUP BY level
ORDER BY level ASC;
```

结果：

```text
┌─level─┬─c─┐
│     4 │ 1 │
└───────┴───┘
```


## retention {#retention}

该函数接受 1 到 32 个 `UInt8` 类型的条件参数,用于指示事件是否满足特定条件。
任何条件都可以作为参数指定(如 [WHERE](/sql-reference/statements/select/where) 中所示)。

除第一个条件外,其他条件成对应用:如果第一个和第二个条件都为真,则第二个结果为真;如果第一个和第三个条件都为真,则第三个结果为真,依此类推。

**语法**

```sql
retention(cond1, cond2, ..., cond32);
```

**参数**

- `cond` — 返回 `UInt8` 结果(1 或 0)的表达式。

**返回值**

由 1 或 0 组成的数组。

- 1 — 事件满足条件。
- 0 — 事件不满足条件。

类型:`UInt8`。

**示例**

以下示例演示如何使用 `retention` 函数来计算网站留存情况。

**1.** 创建一个表来演示示例。

```sql
CREATE TABLE retention_test(date Date, uid Int32) ENGINE = Memory;

INSERT INTO retention_test SELECT '2020-01-01', number FROM numbers(5);
INSERT INTO retention_test SELECT '2020-01-02', number FROM numbers(10);
INSERT INTO retention_test SELECT '2020-01-03', number FROM numbers(15);
```

输入表:

查询:

```sql
SELECT * FROM retention_test
```

结果:

```text
┌───────date─┬─uid─┐
│ 2020-01-01 │   0 │
│ 2020-01-01 │   1 │
│ 2020-01-01 │   2 │
│ 2020-01-01 │   3 │
│ 2020-01-01 │   4 │
└────────────┴─────┘
┌───────date─┬─uid─┐
│ 2020-01-02 │   0 │
│ 2020-01-02 │   1 │
│ 2020-01-02 │   2 │
│ 2020-01-02 │   3 │
│ 2020-01-02 │   4 │
│ 2020-01-02 │   5 │
│ 2020-01-02 │   6 │
│ 2020-01-02 │   7 │
│ 2020-01-02 │   8 │
│ 2020-01-02 │   9 │
└────────────┴─────┘
┌───────date─┬─uid─┐
│ 2020-01-03 │   0 │
│ 2020-01-03 │   1 │
│ 2020-01-03 │   2 │
│ 2020-01-03 │   3 │
│ 2020-01-03 │   4 │
│ 2020-01-03 │   5 │
│ 2020-01-03 │   6 │
│ 2020-01-03 │   7 │
│ 2020-01-03 │   8 │
│ 2020-01-03 │   9 │
│ 2020-01-03 │  10 │
│ 2020-01-03 │  11 │
│ 2020-01-03 │  12 │
│ 2020-01-03 │  13 │
│ 2020-01-03 │  14 │
└────────────┴─────┘
```

**2.** 使用 `retention` 函数按唯一 ID `uid` 对用户进行分组。

查询:

```sql
SELECT
    uid,
    retention(date = '2020-01-01', date = '2020-01-02', date = '2020-01-03') AS r
FROM retention_test
WHERE date IN ('2020-01-01', '2020-01-02', '2020-01-03')
GROUP BY uid
ORDER BY uid ASC
```

结果:


```text
┌─uid─┬─r───────┐
│   0 │ [1,1,1] │
│   1 │ [1,1,1] │
│   2 │ [1,1,1] │
│   3 │ [1,1,1] │
│   4 │ [1,1,1] │
│   5 │ [0,0,0] │
│   6 │ [0,0,0] │
│   7 │ [0,0,0] │
│   8 │ [0,0,0] │
│   9 │ [0,0,0] │
│  10 │ [0,0,0] │
│  11 │ [0,0,0] │
│  12 │ [0,0,0] │
│  13 │ [0,0,0] │
│  14 │ [0,0,0] │
└─────┴─────────┘
```

**3.** 计算每天网站的总访问次数。

查询：

```sql
SELECT
    sum(r[1]) AS r1,
    sum(r[2]) AS r2,
    sum(r[3]) AS r3
FROM
(
    SELECT
        uid,
        retention(date = '2020-01-01', date = '2020-01-02', date = '2020-01-03') AS r
    FROM retention_test
    WHERE date IN ('2020-01-01', '2020-01-02', '2020-01-03')
    GROUP BY uid
)
```

结果：

```text
┌─r1─┬─r2─┬─r3─┐
│  5 │  5 │  5 │
└────┴────┴────┘
```

Where:

* `r1`- 在 2020-01-01 当天访问过该站点的唯一访问者数量（满足 `cond1` 条件）。
* `r2`- 在 2020-01-01 到 2020-01-02 之间某个特定时间段内访问过该站点的唯一访问者数量（满足 `cond1` 和 `cond2` 条件）。
* `r3`- 在 2020-01-01 和 2020-01-03 某个特定时间段内访问过该站点的唯一访问者数量（满足 `cond1` 和 `cond3` 条件）。


## uniqUpTo(N)(x) {#uniquptonx}

计算参数的不同值数量,最多计算到指定限制 `N`。如果不同参数值的数量大于 `N`,则此函数返回 `N` + 1,否则返回精确值。

建议在 `N` 值较小时使用,最大建议值为 10。`N` 的最大值为 100。

对于聚合函数的状态,此函数使用的内存量等于 1 + `N` × 单个值的字节大小。
处理字符串时,此函数存储 8 字节的非加密哈希值;对字符串的计算是近似的。

例如,假设您有一个表记录了用户在网站上进行的每次搜索查询。表中的每一行代表一次搜索查询,包含用户 ID、搜索查询和查询时间戳等列。您可以使用 `uniqUpTo` 生成报告,仅显示至少有 5 个不同用户搜索过的关键词。

```sql
SELECT SearchPhrase
FROM SearchLog
GROUP BY SearchPhrase
HAVING uniqUpTo(4)(UserID) >= 5
```

`uniqUpTo(4)(UserID)` 计算每个 `SearchPhrase` 的不同 `UserID` 值数量,但最多只计数到 4 个不同值。如果某个 `SearchPhrase` 有超过 4 个不同的 `UserID` 值,该函数返回 5(4 + 1)。然后 `HAVING` 子句过滤掉不同 `UserID` 值数量少于 5 的 `SearchPhrase`。这样您将得到至少被 5 个不同用户使用过的搜索关键词列表。


## sumMapFiltered {#summapfiltered}

此函数的行为与 [sumMap](/sql-reference/aggregate-functions/reference/summap) 相同,但它还接受一个键数组作为参数用于过滤。在处理高基数键时,这个功能特别有用。

**语法**

`sumMapFiltered(keys_to_keep)(keys, values)`

**参数**

- `keys_to_keep`: 用于过滤的键 [数组](../data-types/array.md)。
- `keys`: 键 [数组](../data-types/array.md)。
- `values`: 值 [数组](../data-types/array.md)。

**返回值**

- 返回一个包含两个数组的元组:按排序顺序的键,以及对应键的求和值。

**示例**

查询:

```sql
CREATE TABLE sum_map
(
    `date` Date,
    `timeslot` DateTime,
    `statusMap` Nested(status UInt16, requests UInt64)
)
ENGINE = Log

INSERT INTO sum_map VALUES
    ('2000-01-01', '2000-01-01 00:00:00', [1, 2, 3], [10, 10, 10]),
    ('2000-01-01', '2000-01-01 00:00:00', [3, 4, 5], [10, 10, 10]),
    ('2000-01-01', '2000-01-01 00:01:00', [4, 5, 6], [10, 10, 10]),
    ('2000-01-01', '2000-01-01 00:01:00', [6, 7, 8], [10, 10, 10]);
```

```sql
SELECT sumMapFiltered([1, 4, 8])(statusMap.status, statusMap.requests) FROM sum_map;
```

结果:

```response
   ┌─sumMapFiltered([1, 4, 8])(statusMap.status, statusMap.requests)─┐
1. │ ([1,4,8],[10,20,10])                                            │
   └─────────────────────────────────────────────────────────────────┘
```


## sumMapFilteredWithOverflow {#summapfilteredwithoverflow}

此函数的行为与 [sumMap](/sql-reference/aggregate-functions/reference/summap) 相同,但它还接受一个键数组作为参数用于过滤。这在处理高基数键时特别有用。它与 [sumMapFiltered](#summapfiltered) 函数的区别在于它执行带溢出的求和 - 即求和结果返回与参数相同的数据类型。

**语法**

`sumMapFilteredWithOverflow(keys_to_keep)(keys, values)`

**参数**

- `keys_to_keep`: 用于过滤的键的 [Array](../data-types/array.md)。
- `keys`: 键的 [Array](../data-types/array.md)。
- `values`: 值的 [Array](../data-types/array.md)。

**返回值**

- 返回一个包含两个数组的元组:按排序顺序排列的键,以及对应键的求和值。

**示例**

在此示例中,我们创建一个表 `sum_map`,向其中插入一些数据,然后使用 `sumMapFilteredWithOverflow` 和 `sumMapFiltered` 以及 `toTypeName` 函数来比较结果。在创建的表中,`requests` 的类型为 `UInt8`,`sumMapFiltered` 将求和值的类型提升为 `UInt64` 以避免溢出,而 `sumMapFilteredWithOverflow` 保持类型为 `UInt8`,该类型不足以存储结果 - 即发生了溢出。

查询:

```sql
CREATE TABLE sum_map
(
    `date` Date,
    `timeslot` DateTime,
    `statusMap` Nested(status UInt8, requests UInt8)
)
ENGINE = Log

INSERT INTO sum_map VALUES
    ('2000-01-01', '2000-01-01 00:00:00', [1, 2, 3], [10, 10, 10]),
    ('2000-01-01', '2000-01-01 00:00:00', [3, 4, 5], [10, 10, 10]),
    ('2000-01-01', '2000-01-01 00:01:00', [4, 5, 6], [10, 10, 10]),
    ('2000-01-01', '2000-01-01 00:01:00', [6, 7, 8], [10, 10, 10]);
```

```sql
SELECT sumMapFilteredWithOverflow([1, 4, 8])(statusMap.status, statusMap.requests) as summap_overflow, toTypeName(summap_overflow) FROM sum_map;
```

```sql
SELECT sumMapFiltered([1, 4, 8])(statusMap.status, statusMap.requests) as summap, toTypeName(summap) FROM sum_map;
```

结果:

```response
   ┌─sum──────────────────┬─toTypeName(sum)───────────────────┐
1. │ ([1,4,8],[10,20,10]) │ Tuple(Array(UInt8), Array(UInt8)) │
   └──────────────────────┴───────────────────────────────────┘
```

```response
   ┌─summap───────────────┬─toTypeName(summap)─────────────────┐
1. │ ([1,4,8],[10,20,10]) │ Tuple(Array(UInt8), Array(UInt64)) │
   └──────────────────────┴────────────────────────────────────┘
```


## sequenceNextNode {#sequencenextnode}

返回与事件链匹配的下一个事件的值。

_实验性函数,需设置 `SET allow_experimental_funnel_functions = 1` 来启用。_

**语法**

```sql
sequenceNextNode(direction, base)(timestamp, event_column, base_condition, event1, event2, event3, ...)
```

**参数**

- `direction` — 用于指定导航方向。
  - forward — 向前移动。
  - backward — 向后移动。

- `base` — 用于设置基准点。
  - head — 将基准点设置为第一个事件。
  - tail — 将基准点设置为最后一个事件。
  - first_match — 将基准点设置为第一个匹配的 `event1`。
  - last_match — 将基准点设置为最后一个匹配的 `event1`。

**参数**

- `timestamp` — 包含时间戳的列名。支持的数据类型:[Date](../../sql-reference/data-types/date.md)、[DateTime](/sql-reference/data-types/datetime) 以及其他无符号整数类型。
- `event_column` — 包含要返回的下一个事件值的列名。支持的数据类型:[String](../../sql-reference/data-types/string.md) 和 [Nullable(String)](../../sql-reference/data-types/nullable.md)。
- `base_condition` — 基准点必须满足的条件。
- `event1`、`event2`、... — 描述事件链的条件。[UInt8](../../sql-reference/data-types/int-uint.md)。

**返回值**

- `event_column[next_index]` — 如果模式匹配且下一个值存在。
- `NULL` - 如果模式不匹配或下一个值不存在。

类型:[Nullable(String)](../../sql-reference/data-types/nullable.md)。

**示例**

当事件序列为 A->B->C->D->E 且您想知道 B->C 之后的事件时可以使用此函数,结果为 D。

查询 A->B 之后事件的语句:

```sql
CREATE TABLE test_flow (
    dt DateTime,
    id int,
    page String)
ENGINE = MergeTree()
PARTITION BY toYYYYMMDD(dt)
ORDER BY id;

INSERT INTO test_flow VALUES (1, 1, 'A') (2, 1, 'B') (3, 1, 'C') (4, 1, 'D') (5, 1, 'E');

SELECT id, sequenceNextNode('forward', 'head')(dt, page, page = 'A', page = 'A', page = 'B') as next_flow FROM test_flow GROUP BY id;
```

结果:

```text
┌─id─┬─next_flow─┐
│  1 │ C         │
└────┴───────────┘
```

**`forward` 和 `head` 的行为**

```sql
ALTER TABLE test_flow DELETE WHERE 1 = 1 settings mutations_sync = 1;

INSERT INTO test_flow VALUES (1, 1, 'Home') (2, 1, 'Gift') (3, 1, 'Exit');
INSERT INTO test_flow VALUES (1, 2, 'Home') (2, 2, 'Home') (3, 2, 'Gift') (4, 2, 'Basket');
INSERT INTO test_flow VALUES (1, 3, 'Gift') (2, 3, 'Home') (3, 3, 'Gift') (4, 3, 'Basket');
```

```sql
SELECT id, sequenceNextNode('forward', 'head')(dt, page, page = 'Home', page = 'Home', page = 'Gift') FROM test_flow GROUP BY id;

                  dt   id   page
 1970-01-01 09:00:01    1   Home // 基准点,与 Home 匹配
 1970-01-01 09:00:02    1   Gift // 与 Gift 匹配
 1970-01-01 09:00:03    1   Exit // 结果

 1970-01-01 09:00:01    2   Home // 基准点,与 Home 匹配
 1970-01-01 09:00:02    2   Home // 与 Gift 不匹配
 1970-01-01 09:00:03    2   Gift
 1970-01-01 09:00:04    2   Basket

```


1970-01-01 09:00:01    3   Gift // 基准点，与 Home 不对应
1970-01-01 09:00:02    3   Home
1970-01-01 09:00:03    3   Gift
1970-01-01 09:00:04    3   Basket

````

**`backward` 和 `tail` 的行为**

```sql
SELECT id, sequenceNextNode('backward', 'tail')(dt, page, page = 'Basket', page = 'Basket', page = 'Gift') FROM test_flow GROUP BY id;

                 dt   id   page
1970-01-01 09:00:01    1   Home
1970-01-01 09:00:02    1   Gift
1970-01-01 09:00:03    1   Exit // 基准点,与 Basket 不匹配

1970-01-01 09:00:01    2   Home
1970-01-01 09:00:02    2   Home // 结果
1970-01-01 09:00:03    2   Gift // 与 Gift 匹配
1970-01-01 09:00:04    2   Basket // 基准点,与 Basket 匹配

1970-01-01 09:00:01    3   Gift
1970-01-01 09:00:02    3   Home // 结果
1970-01-01 09:00:03    3   Gift // 基准点,与 Gift 匹配
1970-01-01 09:00:04    3   Basket // 基准点,与 Basket 匹配
````

**`forward` 和 `first_match` 的行为**

```sql
SELECT id, sequenceNextNode('forward', 'first_match')(dt, page, page = 'Gift', page = 'Gift') FROM test_flow GROUP BY id;

                 dt   id   page
1970-01-01 09:00:01    1   Home
1970-01-01 09:00:02    1   Gift // 基点
1970-01-01 09:00:03    1   Exit // 结果

1970-01-01 09:00:01    2   Home
1970-01-01 09:00:02    2   Home
1970-01-01 09:00:03    2   Gift // 基点
1970-01-01 09:00:04    2   Basket  // 结果

1970-01-01 09:00:01    3   Gift // 基点
1970-01-01 09:00:02    3   Home // 结果
1970-01-01 09:00:03    3   Gift
1970-01-01 09:00:04    3   Basket
```

```sql
SELECT id, sequenceNextNode('forward', 'first_match')(dt, page, page = 'Gift', page = 'Gift', page = 'Home') FROM test_flow GROUP BY id;

                 dt   id   page
1970-01-01 09:00:01    1   Home
1970-01-01 09:00:02    1   Gift // 基准点
1970-01-01 09:00:03    1   Exit // 与 Home 不匹配

1970-01-01 09:00:01    2   Home
1970-01-01 09:00:02    2   Home
1970-01-01 09:00:03    2   Gift // 基准点
1970-01-01 09:00:04    2   Basket // 与 Home 不匹配

1970-01-01 09:00:01    3   Gift // 基准点
1970-01-01 09:00:02    3   Home // 与 Home 匹配
1970-01-01 09:00:03    3   Gift // 结果
1970-01-01 09:00:04    3   Basket
```

**`backward` 和 `last_match` 的行为**

```sql
SELECT id, sequenceNextNode('backward', 'last_match')(dt, page, page = 'Gift', page = 'Gift') FROM test_flow GROUP BY id;
```


dt   id   page
1970-01-01 09:00:01    1   Home // 结果
1970-01-01 09:00:02    1   Gift // 基准点
1970-01-01 09:00:03    1   Exit

1970-01-01 09:00:01    2   Home
1970-01-01 09:00:02    2   Home // 结果
1970-01-01 09:00:03    2   Gift // 基准点
1970-01-01 09:00:04    2   Basket

1970-01-01 09:00:01    3   Gift
1970-01-01 09:00:02    3   Home // 结果
1970-01-01 09:00:03    3   Gift // 基准点
1970-01-01 09:00:04    3   Basket

````

```sql
SELECT id, sequenceNextNode('backward', 'last_match')(dt, page, page = 'Gift', page = 'Gift', page = 'Home') FROM test_flow GROUP BY id;

                 dt   id   page
1970-01-01 09:00:01    1   Home // 与 Home 匹配，结果为 null
1970-01-01 09:00:02    1   Gift // 基点
1970-01-01 09:00:03    1   Exit

1970-01-01 09:00:01    2   Home // 结果
1970-01-01 09:00:02    2   Home // 与 Home 匹配
1970-01-01 09:00:03    2   Gift // 基点
1970-01-01 09:00:04    2   Basket

1970-01-01 09:00:01    3   Gift // 结果
1970-01-01 09:00:02    3   Home // 与 Home 匹配
1970-01-01 09:00:03    3   Gift // 基点
1970-01-01 09:00:04    3   Basket
````

**`base_condition` 的行为**

```sql
CREATE TABLE test_flow_basecond
(
    `dt` DateTime,
    `id` int,
    `page` String,
    `ref` String
)
ENGINE = MergeTree
PARTITION BY toYYYYMMDD(dt)
ORDER BY id;

INSERT INTO test_flow_basecond VALUES (1, 1, 'A', 'ref4') (2, 1, 'A', 'ref3') (3, 1, 'B', 'ref2') (4, 1, 'B', 'ref1');
```

```sql
SELECT id, sequenceNextNode('forward', 'head')(dt, page, ref = 'ref1', page = 'A') FROM test_flow_basecond GROUP BY id;

                  dt   id   page   ref
 1970-01-01 09:00:01    1   A      ref4 // 该头节点不能作为基点，因为其 ref 列的值不等于 'ref1'。
 1970-01-01 09:00:02    1   A      ref3
 1970-01-01 09:00:03    1   B      ref2
 1970-01-01 09:00:04    1   B      ref1
```

```sql
SELECT id, sequenceNextNode('backward', 'tail')(dt, page, ref = 'ref4', page = 'B') FROM test_flow_basecond GROUP BY id;

                  dt   id   page   ref
 1970-01-01 09:00:01    1   A      ref4
 1970-01-01 09:00:02    1   A      ref3
 1970-01-01 09:00:03    1   B      ref2
 1970-01-01 09:00:04    1   B      ref1 // 尾节点不能作为基准点，因为其 ref 列的值与 'ref4' 不一致。
```

```sql
SELECT id, sequenceNextNode('forward', 'first_match')(dt, page, ref = 'ref3', page = 'A') FROM test_flow_basecond GROUP BY id;
```


dt   id   page   ref
1970-01-01 09:00:01    1   A      ref4 // 该行不能作为基准点，因为 ref 列的值与 &#39;ref3&#39; 不匹配。
1970-01-01 09:00:02    1   A      ref3 // 基准点
1970-01-01 09:00:03    1   B      ref2 // 结果
1970-01-01 09:00:04    1   B      ref1

````

```sql
SELECT id, sequenceNextNode('backward', 'last_match')(dt, page, ref = 'ref2', page = 'B') FROM test_flow_basecond GROUP BY id;

                  dt   id   page   ref
 1970-01-01 09:00:01    1   A      ref4
 1970-01-01 09:00:02    1   A      ref3 // 结果
 1970-01-01 09:00:03    1   B      ref2 // 基准点
 1970-01-01 09:00:04    1   B      ref1 // 此行不能作为基准点,因为 ref 列与 'ref2' 不匹配。
````
