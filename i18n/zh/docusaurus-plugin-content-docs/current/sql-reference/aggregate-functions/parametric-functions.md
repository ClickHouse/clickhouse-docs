---
slug: /sql-reference/aggregate-functions/parametric-functions
sidebar_position: 38
sidebar_label: Parametric
---

# 参数化聚合函数

一些聚合函数不仅可以接受列作为参数（用于压缩），还可以接受一组参数 - 初始化的常量。语法是两个括号对，而不是一个。第一个是用于参数，第二个是用于参数。

## histogram {#histogram}

计算自适应直方图。它不保证精确的结果。

``` sql
histogram(number_of_bins)(values)
```

该函数使用 [A Streaming Parallel Decision Tree Algorithm](http://jmlr.org/papers/volume11/ben-haim10a/ben-haim10a.pdf)。随着新数据进入函数，直方图的区间边界会进行调整。在一般情况下，区间的宽度是不相等的。

**参数**

`values` — [表达式](/sql-reference/syntax#expressions)，产生输入值。

**参数列表**

`number_of_bins` — 直方图中区间的上限数量。该函数会自动计算区间的数量。它尝试达到指定的区间数量，但如果失败，它会使用更少的区间。

**返回值**

- [数组](../../sql-reference/data-types/array.md) 的 [元组](../../sql-reference/data-types/tuple.md)，格式如下：

        ```
        [(lower_1, upper_1, height_1), ... (lower_N, upper_N, height_N)]
        ```

        - `lower` — 区间的下界。
        - `upper` — 区间的上界。
        - `height` — 计算出的区间高度。

**示例**

``` sql
SELECT histogram(5)(number + 1)
FROM (
    SELECT *
    FROM system.numbers
    LIMIT 20
)
```

``` text
┌─histogram(5)(plus(number, 1))───────────────────────────────────────────┐
│ [(1,4.5,4),(4.5,8.5,4),(8.5,12.75,4.125),(12.75,17,4.625),(17,20,3.25)] │
└─────────────────────────────────────────────────────────────────────────┘
```

你可以用 [bar](/sql-reference/functions/other-functions#bar) 函数来可视化直方图，例如：

``` sql
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

``` text
┌─height─┬─bar───┐
│  2.125 │ █▋    │
│   3.25 │ ██▌   │
│  5.625 │ ████▏ │
│  5.625 │ ████▏ │
│  3.375 │ ██▌   │
└────────┴───────┘
```

在这种情况下，你应该记住你不知道直方图区间的边界。

## sequenceMatch {#sequencematch}

检查序列是否包含匹配模式的事件链。

**语法**

``` sql
sequenceMatch(pattern)(timestamp, cond1, cond2, ...)
```

:::note
在同一秒内发生的事件可能会以未定义的顺序排列在序列中，从而影响结果。
:::

**参数**

- `timestamp` — 被认为包含时间数据的列。典型数据类型是 `Date` 和 `DateTime`。你也可以使用任何支持的 [UInt](../../sql-reference/data-types/int-uint.md) 数据类型。

- `cond1`, `cond2` — 描述事件链的条件。数据类型：`UInt8`。最多可以传递 32 个条件参数。函数只考虑在这些条件中描述的事件。如果序列中包含未在条件中描述的数据，函数将跳过它们。

**参数列表**

- `pattern` — 模式字符串。请参见 [模式语法](#pattern-syntax)。

**返回值**

- 如果匹配模式，则返回 1。
- 如果未匹配模式，则返回 0。

类型：`UInt8`。

#### 模式语法 {#pattern-syntax}

- `(?N)` — 匹配位置为 `N` 的条件参数。条件在 `[1, 32]` 范围内编号。例如， `(?1)` 匹配传递给 `cond1` 参数的参数。

- `.*` — 匹配任意数量的事件。你不需要条件参数来匹配模式的这个部分。

- `(?t operator value)` — 设置应分隔两个事件的时间（单位为秒）。例如，模式 `(?1)(?t>1800)(?2)` 匹配在 1800 秒以上发生的事件。任意数量的任何事件可以在这些事件之间。你可以使用 `>=`、`>`、`<`、`<=`、`==` 操作符。

**示例**

考虑 `t` 表中的数据：

``` text
┌─time─┬─number─┐
│    1 │      1 │
│    2 │      3 │
│    3 │      2 │
└──────┴────────┘
```

执行查询：

``` sql
SELECT sequenceMatch('(?1)(?2)')(time, number = 1, number = 2) FROM t
```

``` text
┌─sequenceMatch('(?1)(?2)')(time, equals(number, 1), equals(number, 2))─┐
│                                                                     1 │
└───────────────────────────────────────────────────────────────────────┘
```

该函数找到事件链，其中数字 2 跟随数字 1。它跳过了它们之间的数字 3，因为该数字未被描述为事件。如果我们希望在搜索给定事件链时考虑到这个数字，我们应该为其设置一个条件。

``` sql
SELECT sequenceMatch('(?1)(?2)')(time, number = 1, number = 2, number = 3) FROM t
```

``` text
┌─sequenceMatch('(?1)(?2)')(time, equals(number, 1), equals(number, 2), equals(number, 3))─┐
│                                                                                        0 │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

在这种情况下，该函数未能找到匹配模式的事件链，因为数字 3 的事件发生在 1 和 2 之间。如果在同样的情况下检查数字 4 的条件，序列将匹配该模式。

``` sql
SELECT sequenceMatch('(?1)(?2)')(time, number = 1, number = 2, number = 4) FROM t
```

``` text
┌─sequenceMatch('(?1)(?2)')(time, equals(number, 1), equals(number, 2), equals(number, 4))─┐
│                                                                                        1 │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

**参见**

- [sequenceCount](#sequencecount)

## sequenceCount {#sequencecount}

计数匹配模式的事件链的数量。该函数搜索不重叠的事件链。它在当前链匹配后开始搜索下一个链。

:::note
在同一秒内发生的事件可能会以未定义的顺序排列在序列中，从而影响结果。
:::

**语法**

``` sql
sequenceCount(pattern)(timestamp, cond1, cond2, ...)
```

**参数**

- `timestamp` — 被认为包含时间数据的列。典型数据类型是 `Date` 和 `DateTime`。你也可以使用任何支持的 [UInt](../../sql-reference/data-types/int-uint.md) 数据类型。

- `cond1`, `cond2` — 描述事件链的条件。数据类型：`UInt8`。最多可以传递 32 个条件参数。函数只考虑在这些条件中描述的事件。如果序列中包含未在条件中描述的数据，函数将跳过它们。

**参数列表**

- `pattern` — 模式字符串。请参见 [模式语法](#pattern-syntax)。

**返回值**

- 匹配的非重叠事件链的数量。

类型：`UInt64`。

**示例**

考虑 `t` 表中的数据：

``` text
┌─time─┬─number─┐
│    1 │      1 │
│    2 │      3 │
│    3 │      2 │
│    4 │      1 │
│    5 │      3 │
│    6 │      2 │
└──────┴────────┘
```

计算数字 2 在数字 1 之后的次数，允许它们之间有任意其他数字：

``` sql
SELECT sequenceCount('(?1).*(?2)')(time, number = 1, number = 2) FROM t
```

``` text
┌─sequenceCount('(?1).*(?2)')(time, equals(number, 1), equals(number, 2))─┐
│                                                                       2 │
└─────────────────────────────────────────────────────────────────────────┘
```

## sequenceMatchEvents {#sequencematchevents}

返回匹配模式的最长事件链的事件时间戳。

:::note
在同一秒内发生的事件可能会以未定义的顺序排列在序列中，从而影响结果。
:::

**语法**

``` sql
sequenceMatchEvents(pattern)(timestamp, cond1, cond2, ...)
```

**参数**

- `timestamp` — 被认为包含时间数据的列。典型数据类型是 `Date` 和 `DateTime`。你也可以使用任何支持的 [UInt](../../sql-reference/data-types/int-uint.md) 数据类型。

- `cond1`, `cond2` — 描述事件链的条件。数据类型：`UInt8`。你可以传递最多 32 个条件参数。函数只考虑在这些条件中描述的事件。如果序列中包含未在条件中描述的数据，函数将跳过它们。

**参数列表**

- `pattern` — 模式字符串。请参见 [模式语法](#pattern-syntax)。

**返回值**

- 事件链中匹配条件参数 (?N) 的时间戳数组。数组中位置与模式中条件参数的位置匹配。

类型：数组。

**示例**

考虑 `t` 表中的数据：

``` text
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

``` sql
SELECT sequenceMatchEvents('(?1).*(?2).*(?1)(?3)')(time, number = 1, number = 2, number = 4) FROM t
```

``` text
┌─sequenceMatchEvents('(?1).*(?2).*(?1)(?3)')(time, equals(number, 1), equals(number, 2), equals(number, 4))─┐
│ [1,3,4]                                                                                                    │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**参见**

- [sequenceMatch](#sequencematch)

## windowFunnel {#windowfunnel}

在滑动时间窗口中搜索事件链并计算来自该链的事件发生的最大数量。

该函数按以下算法工作：

- 该函数搜索触发链中第一个条件的数据，并将事件计数器设置为 1。这是滑动窗口开始的时刻。

- 如果链中的事件在窗口内依次发生，则计数器递增。如果事件的顺序被打乱，则计数器不递增。

- 如果数据有多条事件链在不同的完成点，函数只输出最长链的大小。

**语法**

``` sql
windowFunnel(window, [mode, [mode, ...]] )(timestamp, cond1, cond2, ..., condN)
```

**参数**

- `timestamp` — 包含时间戳的列的名称。支持的数据类型：[Date](../../sql-reference/data-types/date.md)、[DateTime](/sql-reference/data-types/datetime) 和其他无符号整数类型（注意，尽管时间戳支持 `UInt64` 类型，但它的值不能超过 Int64 的最大值，即 2^63 - 1）。
- `cond` — 描述事件链的条件或数据。 [UInt8](../../sql-reference/data-types/int-uint.md)。

**参数列表**

- `window` — 滑动窗口的长度，它是第一个条件和最后一个条件之间的时间间隔。`window` 的单位取决于 `timestamp` 本身并有所不同。通过表达式 `timestamp of cond1 <= timestamp of cond2 <= ... <= timestamp of condN <= timestamp of cond1 + window` 确定。
- `mode` — 可选参数。可以设置一个或多个模式。
    - `'strict_deduplication'` — 如果事件序列中相同的条件成立，则这样的重复事件会中断进一步处理。注意：如果多个条件对同一个事件成立，它可能会表现得不如预期。
    - `'strict_order'` — 不允许其他事件的干预。例如，在 `A->B->D->C` 的情况下，它在 `D` 停止寻找 `A->B->C`，最大事件级别为 2。
    - `'strict_increase'` — 仅将条件应用于时间戳严格递增的事件。
    - `'strict_once'` — 即使事件满足条件多次，也只在链中计算每个事件一次。

**返回值**

在滑动时间窗口内，从链中连续触发的条件的最大数量。
选定的所有链都会被分析。

类型：`Integer`。

**示例**

确定用户在网上商店中选择电话并购买两次所需的时间是否足够。

设置以下事件链：

1. 用户登录到商店账户 (`eventID = 1003`)。
2. 用户搜索电话 (`eventID = 1007, product = 'phone'`)。
3. 用户下单 (`eventID = 1009`)。
4. 用户再次下单 (`eventID = 1010`)。

输入表：

``` text
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

找出在 2019 年 1 月至 2 月期间，用户 `user_id` 能通过链达到的程度。

查询：

``` sql
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

``` text
┌─level─┬─c─┐
│     4 │ 1 │
└───────┴───┘
```

## retention {#retention}

该函数以条件集作为参数，条件集最多包含 32 个 `UInt8` 类型的参数，指示事件是否满足特定条件。
任何条件都可以作为参数指定（如在 [WHERE](/sql-reference/statements/select/where) 中）。

除了第一个条件外，其他条件以成对的方式应用：第二个的结果将为 true 如果第一个和第二个都为 true，第三个的结果将为 true 如果第一个和第三个都为 true，等等。

**语法**

``` sql
retention(cond1, cond2, ..., cond32);
```

**参数**

- `cond` — 返回 `UInt8` 结果（1 或 0）的表达式。

**返回值**

返回 1 或 0 的数组。

- 1 — 事件满足条件。
- 0 — 事件不满足条件。

类型：`UInt8`。

**示例**

考虑一个示例，使用 `retention` 函数来确定站点流量。

**1.** 创建一个表来说明这个示例。

``` sql
CREATE TABLE retention_test(date Date, uid Int32) ENGINE = Memory;

INSERT INTO retention_test SELECT '2020-01-01', number FROM numbers(5);
INSERT INTO retention_test SELECT '2020-01-02', number FROM numbers(10);
INSERT INTO retention_test SELECT '2020-01-03', number FROM numbers(15);
```

输入表：

查询：

``` sql
SELECT * FROM retention_test
```

结果：

``` text
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

查询：

``` sql
SELECT
    uid,
    retention(date = '2020-01-01', date = '2020-01-02', date = '2020-01-03') AS r
FROM retention_test
WHERE date IN ('2020-01-01', '2020-01-02', '2020-01-03')
GROUP BY uid
ORDER BY uid ASC
```

结果：

``` text
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

**3.** 计算每天的站点访问总数。

查询：

``` sql
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

``` text
┌─r1─┬─r2─┬─r3─┐
│  5 │  5 │  5 │
└────┴────┴────┘
```

其中：

- `r1` - 在 2020-01-01 时访问站点的独立访客数量（`cond1` 条件）。
- `r2` - 在 2020-01-01 和 2020-01-02 之间的特定时间段内访问站点的独立访客数量（`cond1` 和 `cond2` 条件）。
- `r3` - 在 2020-01-01 和 2020-01-03 期间访问站点的独立访客数量（`cond1` 和 `cond3` 条件）。

## uniqUpTo(N)(x) {#uniquptonx}

计算参数中不同值的数量，直到指定的限制 `N`。如果不同参数值的数量大于 `N`，则此函数返回 `N` + 1，否则它计算确切值。

建议与小的 `N` 一起使用，最多 10。`N` 的最大值为 100。

对于聚合函数的状态，此函数使用的内存量等于 1 + `N` * 一个值的字节数。
在处理字符串时，此函数存储一个非加密的 8 字节哈希；对字符串的计算是近似的。

例如，如果你有一个记录用户在你的网站上进行的每个搜索查询的表。表中的每一行代表一个单独的搜索查询，包含用户 ID、搜索查询和查询的时间戳。你可以使用 `uniqUpTo` 创建一个报告，仅显示至少有 5 个独特用户使用的关键词。

```sql
SELECT SearchPhrase
FROM SearchLog
GROUP BY SearchPhrase
HAVING uniqUpTo(4)(UserID) >= 5
```

`uniqUpTo(4)(UserID)` 计算每个 `SearchPhrase` 的唯一 `UserID` 值的数量，但它只计算最多 4 个唯一值。如果某个 `SearchPhrase` 的唯一 `UserID` 值超过 4 个，函数返回 5（4 + 1）。`HAVING` 子句然后过滤出其唯一 `UserID` 值少于 5 的 `SearchPhrase` 值。这将提供至少有 5 个独特用户使用的搜索关键词的列表。

## sumMapFiltered {#summapfiltered}

此函数的行为与 [sumMap](/sql-reference/aggregate-functions/reference/summap) 相同，只不过它还接受一个要过滤的键数组作为参数。这在处理键的高基数时特别有用。

**语法**

`sumMapFiltered(keys_to_keep)(keys, values)`

**参数**

- `keys_to_keep`: [数组](../data-types/array.md) 要过滤的键。
- `keys`: [数组](../data-types/array.md) 键。
- `values`: [数组](../data-types/array.md) 值。

**返回值**

- 返回一个包含两个数组的元组：按顺序排列的键和对应键的求和值。

**示例**

查询：

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

结果：

```response
   ┌─sumMapFiltered([1, 4, 8])(statusMap.status, statusMap.requests)─┐
1. │ ([1,4,8],[10,20,10])                                            │
   └─────────────────────────────────────────────────────────────────┘
```

## sumMapFilteredWithOverflow {#summapfilteredwithoverflow}

此函数的行为与 [sumMap](/sql-reference/aggregate-functions/reference/summap) 相同，只不过它还接受一个要过滤的键数组作为参数。这在处理键的高基数时特别有用。它与 [sumMapFiltered](#summapfiltered) 函数的不同之处在于，它在求和时处理溢出 - 即返回与求和参数相同的数据类型。

**语法**

`sumMapFilteredWithOverflow(keys_to_keep)(keys, values)`

**参数**

- `keys_to_keep`: [数组](../data-types/array.md) 要过滤的键。
- `keys`: [数组](../data-types/array.md) 键。
- `values`: [数组](../data-types/array.md) 值。

**返回值**

- 返回一个包含两个数组的元组：按顺序排列的键和对应键的求和值。

**示例**

在这个示例中，我们创建一个 `sum_map` 表，插入一些数据，然后分别使用 `sumMapFilteredWithOverflow` 和 `sumMapFiltered` 以及 `toTypeName` 函数比较结果。由于 `requests` 在创建的表中的类型为 `UInt8`，`sumMapFiltered` 为了避免溢出将求和值的类型提升到 `UInt64`，而 `sumMapFilteredWithOverflow` 保持类型为 `UInt8`，这不足以存储结果 - 即发生了溢出。

查询：

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

结果：

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

_实验性功能，`SET allow_experimental_funnel_functions = 1` 以启用它。_

**语法**

``` sql
sequenceNextNode(direction, base)(timestamp, event_column, base_condition, event1, event2, event3, ...)
```

**参数**

- `direction` — 用于导航方向。
    - forward — 向前移动。
    - backward — 向后移动。

- `base` — 用于设置基点。
    - head — 将基点设置为第一个事件。
    - tail — 将基点设置为最后一个事件。
    - first_match — 将基点设置为第一个匹配的 `event1`。
    - last_match — 将基点设置为最后一个匹配的 `event1`。

**参数说明**

- `timestamp` — 包含时间戳的列的名称。支持的数据类型：[Date](../../sql-reference/data-types/date.md)、[DateTime](/sql-reference/data-types/datetime) 及其他无符号整数类型。
- `event_column` — 包含要返回的下一个事件值的列的名称。支持的数据类型：[String](../../sql-reference/data-types/string.md) 和 [Nullable(String)](../../sql-reference/data-types/nullable.md)。
- `base_condition` — 基点必须满足的条件。
- `event1`, `event2`, ... — 描述事件链的条件。 [UInt8](../../sql-reference/data-types/int-uint.md)。

**返回值**

- `event_column[next_index]` — 如果模式匹配且下一个值存在。
- `NULL` - 如果模式不匹配或下一个值不存在。

类型：[Nullable(String)](../../sql-reference/data-types/nullable.md)。

**示例**

可以在事件为 A->B->C->D->E 时使用，并想知道跟随 B->C 的事件是 D。

查询语句查找 A->B 后的事件：

``` sql
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

结果：

``` text
┌─id─┬─next_flow─┐
│  1 │ C         │
└────┴───────────┘
```

**`forward` 和 `head` 的行为**

``` sql
ALTER TABLE test_flow DELETE WHERE 1 = 1 settings mutations_sync = 1;

INSERT INTO test_flow VALUES (1, 1, 'Home') (2, 1, 'Gift') (3, 1, 'Exit');
INSERT INTO test_flow VALUES (1, 2, 'Home') (2, 2, 'Home') (3, 2, 'Gift') (4, 2, 'Basket');
INSERT INTO test_flow VALUES (1, 3, 'Gift') (2, 3, 'Home') (3, 3, 'Gift') (4, 3, 'Basket');
```

``` sql
SELECT id, sequenceNextNode('forward', 'head')(dt, page, page = 'Home', page = 'Home', page = 'Gift') FROM test_flow GROUP BY id;

                  dt   id   page
 1970-01-01 09:00:01    1   Home // 基点，匹配 Home
 1970-01-01 09:00:02    1   Gift // 匹配 Gift
 1970-01-01 09:00:03    1   Exit // 结果

 1970-01-01 09:00:01    2   Home // 基点，匹配 Home
 1970-01-01 09:00:02    2   Home // 未与 Gift 匹配
 1970-01-01 09:00:03    2   Gift
 1970-01-01 09:00:04    2   Basket

 1970-01-01 09:00:01    3   Gift // 基点，未与 Home 匹配
 1970-01-01 09:00:02    3   Home
 1970-01-01 09:00:03    3   Gift
 1970-01-01 09:00:04    3   Basket
```

**`backward` 和 `tail` 的行为**

``` sql
SELECT id, sequenceNextNode('backward', 'tail')(dt, page, page = 'Basket', page = 'Basket', page = 'Gift') FROM test_flow GROUP BY id;

                 dt   id   page
1970-01-01 09:00:01    1   Home
1970-01-01 09:00:02    1   Gift
1970-01-01 09:00:03    1   Exit // 基点，未与 Basket 匹配

1970-01-01 09:00:01    2   Home
1970-01-01 09:00:02    2   Home // 结果
1970-01-01 09:00:03    2   Gift // 匹配 Gift
1970-01-01 09:00:04    2   Basket // 基点，匹配 Basket

1970-01-01 09:00:01    3   Gift
1970-01-01 09:00:02    3   Home // 结果
1970-01-01 09:00:03    3   Gift // 基点，匹配 Gift
1970-01-01 09:00:04    3   Basket // 基点，匹配 Basket
```

**`forward` 和 `first_match` 的行为**

``` sql
SELECT id, sequenceNextNode('forward', 'first_match')(dt, page, page = 'Gift', page = 'Gift') FROM test_flow GROUP BY id;

                 dt   id   page
1970-01-01 09:00:01    1   Home
1970-01-01 09:00:02    1   Gift // 基点
1970-01-01 09:00:03    1   Exit // 结果

1970-01-01 09:00:01    2   Home
1970-01-01 09:00:02    2   Home
1970-01-01 09:00:03    2   Gift // 基点
1970-01-01 09:00:04    2   Basket  结果

1970-01-01 09:00:01    3   Gift // 基点
1970-01-01 09:00:02    3   Home // 结果
1970-01-01 09:00:03    3   Gift
1970-01-01 09:00:04    3   Basket
```

``` sql
SELECT id, sequenceNextNode('forward', 'first_match')(dt, page, page = 'Gift', page = 'Gift', page = 'Home') FROM test_flow GROUP BY id;

                 dt   id   page
1970-01-01 09:00:01    1   Home
1970-01-01 09:00:02    1   Gift // 基点
1970-01-01 09:00:03    1   Exit // 未与 Home 匹配

1970-01-01 09:00:01    2   Home
1970-01-01 09:00:02    2   Home
1970-01-01 09:00:03    2   Gift // 基点
1970-01-01 09:00:04    2   Basket // 未与 Home 匹配

1970-01-01 09:00:01    3   Gift // 基点
1970-01-01 09:00:02    3   Home // 匹配 Home
1970-01-01 09:00:03    3   Gift // 结果
1970-01-01 09:00:04    3   Basket
```

**`backward` 和 `last_match` 的行为**

``` sql
SELECT id, sequenceNextNode('backward', 'last_match')(dt, page, page = 'Gift', page = 'Gift') FROM test_flow GROUP BY id;

                 dt   id   page
1970-01-01 09:00:01    1   Home // 结果
1970-01-01 09:00:02    1   Gift // 基点
1970-01-01 09:00:03    1   Exit

1970-01-01 09:00:01    2   Home
1970-01-01 09:00:02    2   Home // 结果
1970-01-01 09:00:03    2   Gift // 基点
1970-01-01 09:00:04    2   Basket

1970-01-01 09:00:01    3   Gift
1970-01-01 09:00:02    3   Home // 结果
1970-01-01 09:00:03    3   Gift // 基点
1970-01-01 09:00:04    3   Basket
```

``` sql
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
```

**`base_condition` 的行为**

``` sql
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

``` sql
SELECT id, sequenceNextNode('forward', 'head')(dt, page, ref = 'ref1', page = 'A') FROM test_flow_basecond GROUP BY id;

                  dt   id   page   ref
 1970-01-01 09:00:01    1   A      ref4 // 头部不能作为基点，因为头部的 ref 列未与 'ref1' 匹配。
 1970-01-01 09:00:02    1   A      ref3
 1970-01-01 09:00:03    1   B      ref2
 1970-01-01 09:00:04    1   B      ref1
 ```

``` sql
SELECT id, sequenceNextNode('backward', 'tail')(dt, page, ref = 'ref4', page = 'B') FROM test_flow_basecond GROUP BY id;

                  dt   id   page   ref
 1970-01-01 09:00:01    1   A      ref4
 1970-01-01 09:00:02    1   A      ref3
 1970-01-01 09:00:03    1   B      ref2
 1970-01-01 09:00:04    1   B      ref1 // 尾部不能作为基点，因为尾部的 ref 列未与 'ref4' 匹配。
```

``` sql
SELECT id, sequenceNextNode('forward', 'first_match')(dt, page, ref = 'ref3', page = 'A') FROM test_flow_basecond GROUP BY id;

                  dt   id   page   ref
 1970-01-01 09:00:01    1   A      ref4 // 该行不能作为基点，因为 ref 列未与 'ref3' 匹配。
 1970-01-01 09:00:02    1   A      ref3 // 基点
 1970-01-01 09:00:03    1   B      ref2 // 结果
 1970-01-01 09:00:04    1   B      ref1
```

``` sql
SELECT id, sequenceNextNode('backward', 'last_match')(dt, page, ref = 'ref2', page = 'B') FROM test_flow_basecond GROUP BY id;

                  dt   id   page   ref
 1970-01-01 09:00:01    1   A      ref4
 1970-01-01 09:00:02    1   A      ref3 // 结果
 1970-01-01 09:00:03    1   B      ref2 // 基点
 1970-01-01 09:00:04    1   B      ref1 // 该行不能作为基点，因为 ref 列未与 'ref2' 匹配。
```
