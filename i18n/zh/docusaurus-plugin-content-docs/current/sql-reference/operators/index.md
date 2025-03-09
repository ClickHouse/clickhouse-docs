---
slug: /sql-reference/operators/
sidebar_position: 38
sidebar_label: 操作符
displayed_sidebar: sqlreference
---


# 操作符

ClickHouse 在查询解析阶段根据操作符的优先级、优先顺序和结合性将其转换为相应的函数。

## 访问操作符 {#access-operators}

`a[N]` – 访问数组的一个元素。`arrayElement(a, N)` 函数。

`a.N` – 访问元组元素。`tupleElement(a, N)` 函数。

## 数字否定操作符 {#numeric-negation-operator}

`-a` – `negate(a)` 函数。

对于元组否定： [tupleNegate](../../sql-reference/functions/tuple-functions.md#tuplenegate)。

## 乘法和除法操作符 {#multiplication-and-division-operators}

`a * b` – `multiply(a, b)` 函数。

对于用数值乘以元组：[tupleMultiplyByNumber](../../sql-reference/functions/tuple-functions.md#tuplemultiplybynumber)，对于标量积：[dotProduct](/sql-reference/functions/array-functions#arraydotproduct)。

`a / b` – `divide(a, b)` 函数。

对于用数值除以元组：[tupleDivideByNumber](../../sql-reference/functions/tuple-functions.md#tupledividebynumber)。

`a % b` – `modulo(a, b)` 函数。

## 加法和减法操作符 {#addition-and-subtraction-operators}

`a + b` – `plus(a, b)` 函数。

对于元组加法：[tuplePlus](../../sql-reference/functions/tuple-functions.md#tupleplus)。

`a - b` – `minus(a, b)` 函数。

对于元组减法：[tupleMinus](../../sql-reference/functions/tuple-functions.md#tupleminus)。

## 比较操作符 {#comparison-operators}

### equals 函数 {#equals-function}
`a = b` – `equals(a, b)` 函数。

`a == b` – `equals(a, b)` 函数。

### notEquals 函数 {#notequals-function}
`a != b` – `notEquals(a, b)` 函数。

`a <> b` – `notEquals(a, b)` 函数。

### lessOrEquals 函数 {#lessorequals-function}
`a <= b` – `lessOrEquals(a, b)` 函数。

### greaterOrEquals 函数 {#greaterorequals-function}
`a >= b` – `greaterOrEquals(a, b)` 函数。

### less 函数 {#less-function}
`a < b` – `less(a, b)` 函数。

### greater 函数 {#greater-function}
`a > b` – `greater(a, b)` 函数。

### like 函数 {#like-function}
`a LIKE s` – `like(a, b)` 函数。

### notLike 函数 {#notlike-function}
`a NOT LIKE s` – `notLike(a, b)` 函数。

### ilike 函数 {#ilike-function}
`a ILIKE s` – `ilike(a, b)` 函数。

### BETWEEN 函数 {#between-function}
`a BETWEEN b AND c` – 同于 `a >= b AND a <= c`。

`a NOT BETWEEN b AND c` – 同于 `a < b OR a > c`。

## 用于处理数据集的操作符 {#operators-for-working-with-data-sets}

请参见 [IN 操作符](../../sql-reference/operators/in.md) 和 [EXISTS](../../sql-reference/operators/exists.md) 操作符。

### in 函数 {#in-function}
`a IN ...` – `in(a, b)` 函数。

### notIn 函数 {#notin-function}
`a NOT IN ...` – `notIn(a, b)` 函数。

### globalIn 函数 {#globalin-function}
`a GLOBAL IN ...` – `globalIn(a, b)` 函数。

### globalNotIn 函数 {#globalnotin-function}
`a GLOBAL NOT IN ...` – `globalNotIn(a, b)` 函数。

### in 子查询函数 {#in-subquery-function}
`a = ANY (subquery)` – `in(a, subquery)` 函数。  

### notIn 子查询函数 {#notin-subquery-function}
`a != ANY (subquery)` – 同于 `a NOT IN (SELECT singleValueOrNull(*) FROM subquery)`。

### in 子查询函数 {#in-subquery-function-1}
`a = ALL (subquery)` – 同于 `a IN (SELECT singleValueOrNull(*) FROM subquery)`。

### notIn 子查询函数 {#notin-subquery-function-1}
`a != ALL (subquery)` – `notIn(a, subquery)` 函数。 

**示例**

使用 ALL 的查询：

``` sql
SELECT number AS a FROM numbers(10) WHERE a > ALL (SELECT number FROM numbers(3, 3));
```

结果：

``` text
┌─a─┐
│ 6 │
│ 7 │
│ 8 │
│ 9 │
└───┘
```

使用 ANY 的查询：

``` sql
SELECT number AS a FROM numbers(10) WHERE a > ANY (SELECT number FROM numbers(3, 3));
```

结果：

``` text
┌─a─┐
│ 4 │
│ 5 │
│ 6 │
│ 7 │
│ 8 │
│ 9 │
└───┘
```

## 用于处理日期和时间的操作符 {#operators-for-working-with-dates-and-times}

### EXTRACT {#extract}

``` sql
EXTRACT(part FROM date);
```

从给定日期提取部分。例如，您可以从给定日期检索一个月份，或从时间中检索一个秒数。

`part` 参数指定要检索日期的哪个部分。可用的值如下：

- `DAY` — 月中的天。可能的值：1–31。
- `MONTH` — 月份的编号。可能的值：1–12。
- `YEAR` — 年份。
- `SECOND` — 秒。可能的值：0–59。
- `MINUTE` — 分钟。可能的值：0–59。
- `HOUR` — 小时。可能的值：0–23。

`part` 参数不区分大小写。

`date` 参数指定要处理的日期或时间。支持 [Date](../../sql-reference/data-types/date.md) 或 [DateTime](../../sql-reference/data-types/datetime.md) 类型。

示例：

``` sql
SELECT EXTRACT(DAY FROM toDate('2017-06-15'));
SELECT EXTRACT(MONTH FROM toDate('2017-06-15'));
SELECT EXTRACT(YEAR FROM toDate('2017-06-15'));
```

在以下示例中，我们创建一个表并插入一个 `DateTime` 类型的值。

``` sql
CREATE TABLE test.Orders
(
    OrderId UInt64,
    OrderName String,
    OrderDate DateTime
)
ENGINE = Log;
```

``` sql
INSERT INTO test.Orders VALUES (1, 'Jarlsberg Cheese', toDateTime('2008-10-11 13:23:44'));
```

``` sql
SELECT
    toYear(OrderDate) AS OrderYear,
    toMonth(OrderDate) AS OrderMonth,
    toDayOfMonth(OrderDate) AS OrderDay,
    toHour(OrderDate) AS OrderHour,
    toMinute(OrderDate) AS OrderMinute,
    toSecond(OrderDate) AS OrderSecond
FROM test.Orders;
```

``` text
┌─OrderYear─┬─OrderMonth─┬─OrderDay─┬─OrderHour─┬─OrderMinute─┬─OrderSecond─┐
│      2008 │         10 │       11 │        13 │          23 │          44 │
└───────────┴────────────┴──────────┴───────────┴─────────────┴─────────────┘
```

您可以在 [tests](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/00619_extract.sql) 中看到更多示例。

### INTERVAL {#interval}

创建一个应在与 [Date](../../sql-reference/data-types/date.md) 和 [DateTime](../../sql-reference/data-types/datetime.md) 类型值进行算术操作时使用的 [Interval](../../sql-reference/data-types/special-data-types/interval.md) 类型值。

间隔类型：
- `SECOND`
- `MINUTE`
- `HOUR`
- `DAY`
- `WEEK`
- `MONTH`
- `QUARTER`
- `YEAR`

在设置 `INTERVAL` 值时，您也可以使用字符串文字。例如，`INTERVAL 1 HOUR` 等同于 `INTERVAL '1 hour'` 或 `INTERVAL '1' hour`。

:::tip    
不同类型的间隔不能组合。您不能使用 `INTERVAL 4 DAY 1 HOUR` 这样的表达式。请指定小于或等于间隔的最小单位的间隔，例如，`INTERVAL 25 HOUR`。您可以使用连续的操作，如以下示例所示。
:::

示例：

``` sql
SELECT now() AS current_date_time, current_date_time + INTERVAL 4 DAY + INTERVAL 3 HOUR;
```

``` text
┌───current_date_time─┬─plus(plus(now(), toIntervalDay(4)), toIntervalHour(3))─┐
│ 2020-11-03 22:09:50 │                                    2020-11-08 01:09:50 │
└─────────────────────┴────────────────────────────────────────────────────────┘
```

``` sql
SELECT now() AS current_date_time, current_date_time + INTERVAL '4 day' + INTERVAL '3 hour';
```

``` text
┌───current_date_time─┬─plus(plus(now(), toIntervalDay(4)), toIntervalHour(3))─┐
│ 2020-11-03 22:12:10 │                                    2020-11-08 01:12:10 │
└─────────────────────┴────────────────────────────────────────────────────────┘
```

``` sql
SELECT now() AS current_date_time, current_date_time + INTERVAL '4' day + INTERVAL '3' hour;
```

``` text
┌───current_date_time─┬─plus(plus(now(), toIntervalDay('4')), toIntervalHour('3'))─┐
│ 2020-11-03 22:33:19 │                                        2020-11-08 01:33:19 │
└─────────────────────┴────────────────────────────────────────────────────────────┘
```

:::note    
`INTERVAL` 语法或 `addDays` 函数始终是首选。简单的加法或减法（语法如 `now() + ...`）不会考虑时间设置。例如，夏令时。
:::

示例：

``` sql
SELECT toDateTime('2014-10-26 00:00:00', 'Asia/Istanbul') AS time, time + 60 * 60 * 24 AS time_plus_24_hours, time + toIntervalDay(1) AS time_plus_1_day;
```

``` text
┌────────────────time─┬──time_plus_24_hours─┬─────time_plus_1_day─┐
│ 2014-10-26 00:00:00 │ 2014-10-26 23:00:00 │ 2014-10-27 00:00:00 │
└─────────────────────┴─────────────────────┴─────────────────────┘
```

**另见**

- [Interval](../../sql-reference/data-types/special-data-types/interval.md) 数据类型
- [toInterval](/sql-reference/functions/type-conversion-functions#tointervalyear) 类型转换函数

## 逻辑与操作符 {#logical-and-operator}

语法 `SELECT a AND b` — 用函数 [and](/sql-reference/functions/logical-functions#and) 计算 `a` 和 `b` 的逻辑与。

## 逻辑或操作符 {#logical-or-operator}

语法 `SELECT a OR b` — 用函数 [or](/sql-reference/functions/logical-functions#or) 计算 `a` 和 `b` 的逻辑或。

## 逻辑否定操作符 {#logical-negation-operator}

语法 `SELECT NOT a` — 用函数 [not](/sql-reference/functions/logical-functions#not) 计算 `a` 的逻辑否定。

## 条件操作符 {#conditional-operator}

`a ? b : c` – `if(a, b, c)` 函数。

注意：

条件操作符计算 b 和 c 的值，然后检查条件 a 是否满足，然后返回相应的值。如果 `b` 或 `C` 是 [arrayJoin()](/sql-reference/functions/array-join) 函数，则每一行将被复制，无论 "a" 条件如何。

## 条件表达式 {#conditional-expression}

``` sql
CASE [x]
    WHEN a THEN b
    [WHEN ... THEN ...]
    [ELSE c]
END
```

如果指定了 `x`，则使用 `transform(x, [a, ...], [b, ...], c)` 函数。否则 – `multiIf(a, b, ..., c)`。

如果表达式中没有 `ELSE c` 子句，则默认值为 `NULL`。

`transform` 函数不与 `NULL` 一起使用。

## 连接操作符 {#concatenation-operator}

`s1 || s2` – `concat(s1, s2)` 函数。

## Lambda 创建操作符 {#lambda-creation-operator}

`x -> expr` – `lambda(x, expr)` 函数。

以下操作符没有优先级，因为它们是括号：

## 数组创建操作符 {#array-creation-operator}

`[x1, ...]` – `array(x1, ...)` 函数。

## 元组创建操作符 {#tuple-creation-operator}

`(x1, x2, ...)` – `tuple(x1, x2, ...)` 函数。

## 结合性 {#associativity}

所有二元操作符具有左结合性。例如，`1 + 2 + 3` 被转换为 `plus(plus(1, 2), 3)`。
有时这并不像您预期的那样工作。例如，`SELECT 4 > 2 > 3` 将返回 0。

为了效率，`and` 和 `or` 函数接受任意数量的参数。相应的 `AND` 和 `OR` 操作符链被转换为这些函数的单次调用。

## 检查 `NULL` {#checking-for-null}

ClickHouse 支持 `IS NULL` 和 `IS NOT NULL` 操作符。

### IS NULL {#is_null}

- 对于 [Nullable](../../sql-reference/data-types/nullable.md) 类型值，`IS NULL` 操作符返回：
    - `1`，如果值为 `NULL`。
    - 否则返回 `0`。
- 对于其他值，`IS NULL` 操作符始终返回 `0`。

可以通过启用 [optimize_functions_to_subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns) 设置进行优化。将 `optimize_functions_to_subcolumns = 1` 时，函数仅读取 [null](../../sql-reference/data-types/nullable.md#finding-null) 子列，而不是读取和处理整个列数据。查询 `SELECT n IS NULL FROM table` 转换为 `SELECT n.null FROM TABLE`。

<!-- -->

``` sql
SELECT x+100 FROM t_null WHERE y IS NULL
```

``` text
┌─plus(x, 100)─┐
│          101 │
└──────────────┘
```

### IS NOT NULL {#is_not_null}

- 对于 [Nullable](../../sql-reference/data-types/nullable.md) 类型值，`IS NOT NULL` 操作符返回：
    - `0`，如果值为 `NULL`。
    - 否则返回 `1`。
- 对于其他值，`IS NOT NULL` 操作符始终返回 `1`。

<!-- -->

``` sql
SELECT * FROM t_null WHERE y IS NOT NULL
```

``` text
┌─x─┬─y─┐
│ 2 │ 3 │
└───┴───┘
```

可以通过启用 [optimize_functions_to_subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns) 设置进行优化。将 `optimize_functions_to_subcolumns = 1` 时，函数仅读取 [null](../../sql-reference/data-types/nullable.md#finding-null) 子列，而不是读取和处理整个列数据。查询 `SELECT n IS NOT NULL FROM table` 转换为 `SELECT NOT n.null FROM TABLE`。
