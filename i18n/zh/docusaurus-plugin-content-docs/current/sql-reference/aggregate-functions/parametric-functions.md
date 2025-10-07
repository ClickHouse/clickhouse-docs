---
'description': '关于 Parametric Aggregate Functions 的文档'
'sidebar_label': 'Parametric'
'sidebar_position': 38
'slug': '/sql-reference/aggregate-functions/parametric-functions'
'title': '参数聚合函数'
'doc_type': 'reference'
---


# 参数化聚合函数

某些聚合函数不仅可以接受参数列（用于压缩），还可以接受一组参数 - 用于初始化的常量。语法是使用两个括号对而不是一个。第一个用于参数，第二个用于论据。

## histogram {#histogram}

计算自适应直方图。它不保证精确结果。

```sql
histogram(number_of_bins)(values)
```

该函数使用[A Streaming Parallel Decision Tree Algorithm](http://jmlr.org/papers/volume11/ben-haim10a/ben-haim10a.pdf)。随着新数据进入函数，直方图桶的边界会调整。在一般情况下，桶的宽度并不相等。

**参数**

`values` — [表达式](/sql-reference/syntax#expressions)，结果为输入值。

**参数**

`number_of_bins` — 直方图中桶的数量的上限。该函数会自动计算桶的数量。它试图达到指定的桶数，但如果失败，将使用更少的桶。

**返回值**

- [数组](../../sql-reference/data-types/array.md)的[元组](../../sql-reference/data-types/tuple.md)，格式如下：

```
[(lower_1, upper_1, height_1), ... (lower_N, upper_N, height_N)]
```

        - `lower` — 桶的下限。
        - `upper` — 桶的上限。
        - `height` — 桶的计算高度。

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

您可以使用[bar](/sql-reference/functions/other-functions#bar)函数来可视化直方图，例如：

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

在这种情况下，您应记住，不知道直方图桶的边界。

## sequenceMatch {#sequencematch}

检查序列中是否包含与模式匹配的事件链。

**语法**

```sql
sequenceMatch(pattern)(timestamp, cond1, cond2, ...)
```

:::note
同一秒钟发生的事件可能在序列中以未定义顺序排列，从而影响结果。
:::

**参数**

- `timestamp` — 被认为包含时间数据的列。典型数据类型为`Date`和`DateTime`。您还可以使用任何支持的[UInt](../../sql-reference/data-types/int-uint.md)数据类型。

- `cond1`, `cond2` — 描述事件链的条件。数据类型：`UInt8`。您最多可以传递32个条件参数。函数仅考虑这些条件中描述的事件。如果序列包含未在条件中描述的数据，函数会跳过它们。

**参数**

- `pattern` — 模式字符串。请参见[模式语法](#pattern-syntax)。

**返回值**

- 1，如果模式匹配。
- 0，如果模式不匹配。

类型：`UInt8`。

#### 模式语法 {#pattern-syntax}

- `(?N)` — 匹配位置为`N`的条件参数。条件编号在`[1, 32]`范围内。例如，`(?1)`匹配传递给`cond1`参数的论据。

- `.*` — 匹配任意数量的事件。您不需要条件参数来匹配模式的这个元素。

- `(?t operator value)` — 设置两个事件之间应分开的秒数。例如，模式`(?1)(?t>1800)(?2)`匹配发生在相隔超过1800秒的事件。这两个事件之间可以有任意数量的其他事件。您可以使用`>=`、`>`、`<`、`<=`、`==`运算符。

**示例**

考虑`t`表中的数据：

```text
┌─time─┬─number─┐
│    1 │      1 │
│    2 │      3 │
│    3 │      2 │
└──────┴────────┘
```

执行查询：

```sql
SELECT sequenceMatch('(?1)(?2)')(time, number = 1, number = 2) FROM t
```

```text
┌─sequenceMatch('(?1)(?2)')(time, equals(number, 1), equals(number, 2))─┐
│                                                                     1 │
└───────────────────────────────────────────────────────────────────────┘
```

该函数找到事件链，其中编号2跟随编号1。它跳过了它们之间的编号3，因为该编号未被描述为事件。如果我们想在搜索示例给定的事件链时考虑这个编号，我们应该为其制作一个条件。

```sql
SELECT sequenceMatch('(?1)(?2)')(time, number = 1, number = 2, number = 3) FROM t
```

```text
┌─sequenceMatch('(?1)(?2)')(time, equals(number, 1), equals(number, 2), equals(number, 3))─┐
│                                                                                        0 │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

在这种情况下，函数无法找到与模式匹配的事件链，因为编号3的事件发生在编号1和编号2之间。如果在同一情况下我们检查编号4的条件，序列会匹配模式。

```sql
SELECT sequenceMatch('(?1)(?2)')(time, number = 1, number = 2, number = 4) FROM t
```

```text
┌─sequenceMatch('(?1)(?2)')(time, equals(number, 1), equals(number, 2), equals(number, 4))─┐
│                                                                                        1 │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

**另见**

- [sequenceCount](#sequencecount)

## sequenceCount {#sequencecount}

计算与模式匹配的事件链的数量。该函数搜索不重叠的事件链。它在匹配当前链后开始搜索下一个链。

:::note
同一秒钟发生的事件可能在序列中以未定义顺序排列，从而影响结果。
:::

**语法**

```sql
sequenceCount(pattern)(timestamp, cond1, cond2, ...)
```

**参数**

- `timestamp` — 被认为包含时间数据的列。典型数据类型为`Date`和`DateTime`。您还可以使用任何支持的[UInt](../../sql-reference/data-types/int-uint.md)数据类型。

- `cond1`, `cond2` — 描述事件链的条件。数据类型：`UInt8`。您最多可以传递32个条件参数。函数仅考虑这些条件中描述的事件。如果序列包含未在条件中描述的数据，函数会跳过它们。

**参数**

- `pattern` — 模式字符串。请参见[模式语法](#pattern-syntax)。

**返回值**

- 匹配的不重叠事件链的数量。

类型：`UInt64`。

**示例**

考虑`t`表中的数据：

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

计算编号2在其间有任意数量其他数字后跟随编号1的次数：

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
同一秒钟发生的事件可能在序列中以未定义顺序排列，从而影响结果。
:::

**语法**

```sql
sequenceMatchEvents(pattern)(timestamp, cond1, cond2, ...)
```

**参数**

- `timestamp` — 被认为包含时间数据的列。典型数据类型为`Date`和`DateTime`。您还可以使用任何支持的[UInt](../../sql-reference/data-types/int-uint.md)数据类型。

- `cond1`, `cond2` — 描述事件链的条件。数据类型：`UInt8`。您最多可以传递32个条件参数。函数仅考虑这些条件中描述的事件。如果序列包含未在条件中描述的数据，函数会跳过它们。

**参数**

- `pattern` — 模式字符串。请参见[模式语法](#pattern-syntax)。

**返回值**

- 匹配条件参数 (?N) 的事件链的时间戳数组。数组中的位置与模式中条件参数的位置匹配。

类型：数组。

**示例**

考虑`t`表中的数据：

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

**另见**

- [sequenceMatch](#sequencematch)

## windowFunnel {#windowfunnel}

在一个滑动时间窗口中搜索事件链，并计算从链中发生的最大事件数量。

该函数根据以下算法工作：

- 函数搜索触发链中第一个条件的数据，并将事件计数器设置为1。这是滑动窗口开始的时刻。

- 如果链中的事件在窗口内顺序发生，则计数器递增。如果事件序列中断，计数器则不会递增。

- 如果数据在不同的完成点有多个事件链，函数将仅输出最长链的大小。

**语法**

```sql
windowFunnel(window, [mode, [mode, ... ]])(timestamp, cond1, cond2, ..., condN)
```

**参数**

- `timestamp` — 包含时间戳的列的名称。支持的数据类型：[Date](../../sql-reference/data-types/date.md)、[DateTime](/sql-reference/data-types/datetime)和其他无符号整数类型（请注意，尽管时间戳支持`UInt64`类型，但其值不能超过Int64最大值，即2^63 - 1）。
- `cond` — 描述事件链的条件或数据。[UInt8](../../sql-reference/data-types/int-uint.md)。

**参数**

- `window` — 滑动窗口的长度，即第一个条件和最后一个条件之间的时间间隔。`window`的单位取决于`timestamp`本身并有所不同。通过表达式`timestamp of cond1 <= timestamp of cond2 <= ... <= timestamp of condN <= timestamp of cond1 + window`确定。
- `mode` — 可选参数。可以设置一个或多个模式。
  - `'strict_deduplication'` — 如果事件序列中的相同条件成立，则该重复事件将中断进一步处理。注意：如果多个条件对同一事件成立，则可能会意外工作。
  - `'strict_order'` — 不允许其他事件的干预。例如，在`A->B->D->C`的情况下，它将在`D`处停止查找`A->B->C`，最大事件级别为2。
  - `'strict_increase'` — 仅对时间戳严格递增的事件应用条件。
  - `'strict_once'` — 即使事件多次满足条件也只是计数一次。

**返回值**

在滑动时间窗口中，从链中连续触发的条件的最大数量。
选择中的所有链都会被分析。

类型：`Integer`。

**示例**

确定设定的时间段是否足够让用户在在线商店中选择手机并购买两次。

设置以下事件链：

1. 用户登录商店账户（`eventID = 1003`）。
2. 用户搜索手机（`eventID = 1007, product = 'phone'`）。
3. 用户下订单（`eventID = 1009`）。
4. 用户再次下订单（`eventID = 1010`）。

输入表：

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

找出用户`user_id`在2019年1月至2月期间能够在链中前进的程度。

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

该函数接受一组条件作为参数，参数数量从1到32，类型为`UInt8`，指示事件是否满足特定条件。
任何条件都可以作为参数指定（如[WHERE](/sql-reference/statements/select/where)）。

所有条件，除了第一个，以对的方式适用：如果第一个和第二个条件都为真，第二个的结果为真；如果第一个和第三个条件都为真，则第三个的结果为真，依此类推。

**语法**

```sql
retention(cond1, cond2, ..., cond32);
```

**参数**

- `cond` — 返回`UInt8`结果（1或0）的表达式。

**返回值**

1或0的数组。

- 1 — 条件为事件满足。
- 0 — 条件未满足事件。

类型：`UInt8`。

**示例**

我们考虑一个计算`retention`函数以确定网站流量的示例。

**1.** 创建一个表来说明示例。

```sql
CREATE TABLE retention_test(date Date, uid Int32) ENGINE = Memory;

INSERT INTO retention_test SELECT '2020-01-01', number FROM numbers(5);
INSERT INTO retention_test SELECT '2020-01-02', number FROM numbers(10);
INSERT INTO retention_test SELECT '2020-01-03', number FROM numbers(15);
```

输入表：

查询：

```sql
SELECT * FROM retention_test
```

结果：

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

**2.** 使用`retention`函数按唯一ID `uid` 对用户进行分组。

查询：

```sql
SELECT
    uid,
    retention(date = '2020-01-01', date = '2020-01-02', date = '2020-01-03') AS r
FROM retention_test
WHERE date IN ('2020-01-01', '2020-01-02', '2020-01-03')
GROUP BY uid
ORDER BY uid ASC
```

结果：

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

**3.** 计算每天的总网站访客数。

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

其中：

- `r1`- 2020年1月1日访问网站的唯一访客数量（`cond1`条件）。
- `r2`- 在2020年1月1日至2020年1月2日期间访问网站的唯一访客数量（`cond1`和`cond2`条件）。
- `r3`- 在2020年1月1日和2020年1月3日期间访问网站的唯一访客数量（`cond1`和`cond3`条件）。

## uniqUpTo(N)(x) {#uniquptonx}

计算至指定限制`N`的不同参数值的数量。如果不同参数值的数量大于`N`，则该函数返回`N` + 1，否则计算精确值。

建议对小的`N`（最大到10）使用。 `N`的最大值为100。

对于聚合函数的状态，该函数使用的内存量为1 + `N`乘以单个值的字节大小。
处理字符串时，该函数存储8字节的非加密哈希;对字符串的计算是近似的。

例如，如果您有一个记录用户在您网站上每次搜索查询的表。表中的每一行代表一个单一的搜索查询，列包括用户ID、搜索查询和查询时间戳。您可以使用`uniqUpTo`生成仅显示产生至少5个唯一用户的关键字的报告。

```sql
SELECT SearchPhrase
FROM SearchLog
GROUP BY SearchPhrase
HAVING uniqUpTo(4)(UserID) >= 5
```

`uniqUpTo(4)(UserID)`计算每个`SearchPhrase`的唯一`UserID`值的数量，但最多只计算4个唯一值。如果某个`SearchPhrase`的唯一`UserID`值超过4个，则该函数返回5（4 + 1）。然后，`HAVING`子句过滤掉唯一`UserID`值少于5的`SearchPhrase`值。这样您将得到至少5个唯一用户使用的搜索关键字列表。

## sumMapFiltered {#summapfiltered}

该函数的行为与[sumMap](/sql-reference/aggregate-functions/reference/summap)相同，但它还接受一个要过滤的键的数组作为参数。当处理高基数的键时，这尤其有用。

**语法**

`sumMapFiltered(keys_to_keep)(keys, values)`

**参数**

- `keys_to_keep`: [数组](../data-types/array.md)，用于过滤的键。
- `keys`: [数组](../data-types/array.md) 的键。
- `values`: [数组](../data-types/array.md) 的值。

**返回值**

- 返回两个数组的元组：已排序的键，以及对应键的总和值。

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

该函数的行为与[sumMap](/sql-reference/aggregate-functions/reference/summap)相同，但它还接受一个要过滤的键的数组作为参数。当处理高基数的键时，这尤其有用。它与[sumMapFiltered](#summapfiltered)函数的不同之处在于它进行溢出求和 - 即返回求和与参数数据类型相同的数据类型。

**语法**

`sumMapFilteredWithOverflow(keys_to_keep)(keys, values)`

**参数**

- `keys_to_keep`: [数组](../data-types/array.md) 用于过滤的键。
- `keys`: [数组](../data-types/array.md) 的键。
- `values`: [数组](../data-types/array.md) 的值。

**返回值**

- 返回两个数组的元组：已排序的键，以及对应键的总和值。

**示例**

在此示例中，我们创建一个表`sum_map`，插入一些数据，然后使用`sumMapFilteredWithOverflow`和`sumMapFiltered`以及`toTypeName`函数进行结果比较。 在创建的表中，`requests`的类型为`UInt8`，而`sumMapFiltered`已将求和结果的类型提升至`UInt64`以避免溢出，而`sumMapFilteredWithOverflow`保持类型为`UInt8`，这不足以存储结果 - 即发生了溢出。

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

返回匹配事件链的下一个事件的值。

_实验性函数，使用`SET allow_experimental_funnel_functions = 1`启用。_

**语法**

```sql
sequenceNextNode(direction, base)(timestamp, event_column, base_condition, event1, event2, event3, ...)
```

**参数**

- `direction` — 用于导航到方向。
  - forward — 向前移动。
  - backward — 向后移动。

- `base` — 用于设置基点。
  - head — 设置基点为第一个事件。
  - tail — 设置基点为最后一个事件。
  - first_match — 设置基点为第一次匹配的`event1`。
  - last_match — 设置基点为最后一次匹配的`event1`。

**参数**

- `timestamp` — 包含时间戳的列的名称。支持的数据类型：[Date](../../sql-reference/data-types/date.md)、[DateTime](/sql-reference/data-types/datetime)和其他无符号整数类型。
- `event_column` — 包含要返回的下一个事件的值的列的名称。支持的数据类型：[String](../../sql-reference/data-types/string.md)和[Nullable(String)](../../sql-reference/data-types/nullable.md)。
- `base_condition` — 基点必须满足的条件。
- `event1`、`event2`，... — 描述事件链的条件。[UInt8](../../sql-reference/data-types/int-uint.md)。

**返回值**

- `event_column[next_index]` — 如果模式匹配并且存在下一个值。
- `NULL` — 如果模式不匹配或下一个值不存在。

类型：[Nullable(String)](../../sql-reference/data-types/nullable.md)。

**示例**

它可以用在事件为A->B->C->D->E时，您想知道事件B->C之后的事件D。

查询语句搜索事件A->B之后的事件：

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

结果：

```text
┌─id─┬─next_flow─┐
│  1 │ C         │
└────┴───────────┘
```

**`forward`和`head`的行为**

```sql
ALTER TABLE test_flow DELETE WHERE 1 = 1 settings mutations_sync = 1;

INSERT INTO test_flow VALUES (1, 1, 'Home') (2, 1, 'Gift') (3, 1, 'Exit');
INSERT INTO test_flow VALUES (1, 2, 'Home') (2, 2, 'Home') (3, 2, 'Gift') (4, 2, 'Basket');
INSERT INTO test_flow VALUES (1, 3, 'Gift') (2, 3, 'Home') (3, 3, 'Gift') (4, 3, 'Basket');
```

```sql
SELECT id, sequenceNextNode('forward', 'head')(dt, page, page = 'Home', page = 'Home', page = 'Gift') FROM test_flow GROUP BY id;

                  dt   id   page
 1970-01-01 09:00:01    1   Home // Base point, Matched with Home
 1970-01-01 09:00:02    1   Gift // Matched with Gift
 1970-01-01 09:00:03    1   Exit // The result

 1970-01-01 09:00:01    2   Home // Base point, Matched with Home
 1970-01-01 09:00:02    2   Home // Unmatched with Gift
 1970-01-01 09:00:03    2   Gift
 1970-01-01 09:00:04    2   Basket

 1970-01-01 09:00:01    3   Gift // Base point, Unmatched with Home
 1970-01-01 09:00:02    3   Home
 1970-01-01 09:00:03    3   Gift
 1970-01-01 09:00:04    3   Basket
```

**`backward`和`tail`的行为**

```sql
SELECT id, sequenceNextNode('backward', 'tail')(dt, page, page = 'Basket', page = 'Basket', page = 'Gift') FROM test_flow GROUP BY id;

                 dt   id   page
1970-01-01 09:00:01    1   Home
1970-01-01 09:00:02    1   Gift
1970-01-01 09:00:03    1   Exit // Base point, Unmatched with Basket

1970-01-01 09:00:01    2   Home
1970-01-01 09:00:02    2   Home // The result
1970-01-01 09:00:03    2   Gift // Matched with Gift
1970-01-01 09:00:04    2   Basket // Base point, Matched with Basket

1970-01-01 09:00:01    3   Gift
1970-01-01 09:00:02    3   Home // The result
1970-01-01 09:00:03    3   Gift // Base point, Matched with Gift
1970-01-01 09:00:04    3   Basket // Base point, Matched with Basket
```

**`forward`和`first_match`的行为**

```sql
SELECT id, sequenceNextNode('forward', 'first_match')(dt, page, page = 'Gift', page = 'Gift') FROM test_flow GROUP BY id;

                 dt   id   page
1970-01-01 09:00:01    1   Home
1970-01-01 09:00:02    1   Gift // Base point
1970-01-01 09:00:03    1   Exit // The result

1970-01-01 09:00:01    2   Home
1970-01-01 09:00:02    2   Home
1970-01-01 09:00:03    2   Gift // Base point
1970-01-01 09:00:04    2   Basket  The result

1970-01-01 09:00:01    3   Gift // Base point
1970-01-01 09:00:02    3   Home // The result
1970-01-01 09:00:03    3   Gift
1970-01-01 09:00:04    3   Basket
```

```sql
SELECT id, sequenceNextNode('forward', 'first_match')(dt, page, page = 'Gift', page = 'Gift', page = 'Home') FROM test_flow GROUP BY id;

                 dt   id   page
1970-01-01 09:00:01    1   Home
1970-01-01 09:00:02    1   Gift // Base point
1970-01-01 09:00:03    1   Exit // Unmatched with Home

1970-01-01 09:00:01    2   Home
1970-01-01 09:00:02    2   Home
1970-01-01 09:00:03    2   Gift // Base point
1970-01-01 09:00:04    2   Basket // Unmatched with Home

1970-01-01 09:00:01    3   Gift // Base point
1970-01-01 09:00:02    3   Home // Matched with Home
1970-01-01 09:00:03    3   Gift // The result
1970-01-01 09:00:04    3   Basket
```

**`backward`和`last_match`的行为**

```sql
SELECT id, sequenceNextNode('backward', 'last_match')(dt, page, page = 'Gift', page = 'Gift') FROM test_flow GROUP BY id;

                 dt   id   page
1970-01-01 09:00:01    1   Home // The result
1970-01-01 09:00:02    1   Gift // Base point
1970-01-01 09:00:03    1   Exit

1970-01-01 09:00:01    2   Home
1970-01-01 09:00:02    2   Home // The result
1970-01-01 09:00:03    2   Gift // Base point
1970-01-01 09:00:04    2   Basket

1970-01-01 09:00:01    3   Gift
1970-01-01 09:00:02    3   Home // The result
1970-01-01 09:00:03    3   Gift // Base point
1970-01-01 09:00:04    3   Basket
```

```sql
SELECT id, sequenceNextNode('backward', 'last_match')(dt, page, page = 'Gift', page = 'Gift', page = 'Home') FROM test_flow GROUP BY id;

                 dt   id   page
1970-01-01 09:00:01    1   Home // Matched with Home, the result is null
1970-01-01 09:00:02    1   Gift // Base point
1970-01-01 09:00:03    1   Exit

1970-01-01 09:00:01    2   Home // The result
1970-01-01 09:00:02    2   Home // Matched with Home
1970-01-01 09:00:03    2   Gift // Base point
1970-01-01 09:00:04    2   Basket

1970-01-01 09:00:01    3   Gift // The result
1970-01-01 09:00:02    3   Home // Matched with Home
1970-01-01 09:00:03    3   Gift // Base point
1970-01-01 09:00:04    3   Basket
```

**`base_condition`的行为**

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
 1970-01-01 09:00:01    1   A      ref4 // The head can not be base point because the ref column of the head unmatched with 'ref1'.
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
 1970-01-01 09:00:04    1   B      ref1 // The tail can not be base point because the ref column of the tail unmatched with 'ref4'.
```

```sql
SELECT id, sequenceNextNode('forward', 'first_match')(dt, page, ref = 'ref3', page = 'A') FROM test_flow_basecond GROUP BY id;

                  dt   id   page   ref
 1970-01-01 09:00:01    1   A      ref4 // This row can not be base point because the ref column unmatched with 'ref3'.
 1970-01-01 09:00:02    1   A      ref3 // Base point
 1970-01-01 09:00:03    1   B      ref2 // The result
 1970-01-01 09:00:04    1   B      ref1
```

```sql
SELECT id, sequenceNextNode('backward', 'last_match')(dt, page, ref = 'ref2', page = 'B') FROM test_flow_basecond GROUP BY id;

                  dt   id   page   ref
 1970-01-01 09:00:01    1   A      ref4
 1970-01-01 09:00:02    1   A      ref3 // The result
 1970-01-01 09:00:03    1   B      ref2 // Base point
 1970-01-01 09:00:04    1   B      ref1 // This row can not be base point because the ref column unmatched with 'ref2'.
```
