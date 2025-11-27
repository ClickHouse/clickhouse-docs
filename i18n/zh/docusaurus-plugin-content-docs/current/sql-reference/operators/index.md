---
description: '运算符文档'
sidebar_label: '运算符'
sidebar_position: 38
slug: /sql-reference/operators/
title: '运算符'
doc_type: 'reference'
---

# 运算符

ClickHouse 会在解析查询时，根据运算符的优先级、结合性等规则，将运算符转换为对应的函数。

## 访问运算符 \{#access-operators\}

`a[N]` – 访问数组的某个元素。对应的函数是 `arrayElement(a, N)`。

`a.N` – 访问元组的某个元素。对应的函数是 `tupleElement(a, N)`。

## 数值取负运算符 \{#numeric-negation-operator\}

`-a` – `negate(a)` 函数。

对于元组取负： [tupleNegate](../../sql-reference/functions/tuple-functions.md#tupleNegate)。

## 乘法和除法运算符 \{#multiplication-and-division-operators\}

`a * b` – `multiply(a, b)` 函数。

将元组与数字相乘时：参见 [tupleMultiplyByNumber](../../sql-reference/functions/tuple-functions.md#tupleMultiplyByNumber)，计算标量积时：参见 [dotProduct](/sql-reference/functions/array-functions#arrayDotProduct)。

`a / b` – `divide(a, b)` 函数。

将元组除以数字时：参见 [tupleDivideByNumber](../../sql-reference/functions/tuple-functions.md#tupleDivideByNumber)。

`a % b` – `modulo(a, b)` 函数。

## 加法和减法运算符 \{#addition-and-subtraction-operators\}

`a + b` – `plus(a, b)` 函数。

元组加法运算： [tuplePlus](../../sql-reference/functions/tuple-functions.md#tuplePlus)。

`a - b` – `minus(a, b)` 函数。

元组减法运算： [tupleMinus](../../sql-reference/functions/tuple-functions.md#tupleMinus)。

## 比较运算符 \{#comparison-operators\}

### equals 函数 \{#equals-function\}

`a = b` – `equals(a, b)` 函数。

`a == b` – `equals(a, b)` 函数。

### notEquals 函数 \{#notequals-function\}

`a != b` – 等价于 `notEquals(a, b)` 函数。

`a <> b` – 等价于 `notEquals(a, b)` 函数。

### lessOrEquals 函数 \{#lessorequals-function\}

`a <= b` – 即 `lessOrEquals(a, b)` 函数。

### greaterOrEquals 函数 \{#greaterorequals-function\}

`a >= b` – 即 `greaterOrEquals(a, b)` 函数。

### less 函数 \{#less-function\}

`a < b` – 等同于 `less(a, b)` 函数。

### greater 函数 \{#greater-function\}

`a > b` – `greater(a, b)` 函数。

### like 函数 \{#like-function\}

`a LIKE b` – `like(a, b)` 函数。

### notLike 函数 \{#notlike-function\}

`a NOT LIKE b` – `notLike(a, b)` 函数。

### ilike 函数 \{#ilike-function\}

`a ILIKE b` – 等价于 `ilike(a, b)` 函数。

### BETWEEN 函数 \{#between-function\}

`a BETWEEN b AND c` – 等价于 `a >= b AND a <= c`。

`a NOT BETWEEN b AND c` – 等价于 `a < b OR a > c`。

## 用于处理数据集的运算符 \{#operators-for-working-with-data-sets\}

参见 [IN 运算符](../../sql-reference/operators/in.md) 和 [EXISTS 运算符](../../sql-reference/operators/exists.md)。

### in 函数 \{#in-function\}

`a IN ...` – 等价于 `in(a, b)` 函数。

### notIn 函数 \{#notin-function\}

`a NOT IN ...` – 对应 `notIn(a, b)` 函数。

### globalIn 函数 \{#globalin-function\}

`a GLOBAL IN ...` —— 对应的函数为 `globalIn(a, b)`。

### globalNotIn 函数 \{#globalnotin-function\}

`a GLOBAL NOT IN ...` – `globalNotIn(a, b)` 函数。

### in 子查询函数 \{#in-subquery-function\}

`a = ANY (subquery)` – 等价于 `in(a, subquery)` 函数。  

### notIn 子查询函数 \{#notin-subquery-function\}

`a != ANY (subquery)` – 等同于 `a NOT IN (SELECT singleValueOrNull(*) FROM subquery)`。

### in subquery 函数 \{#in-subquery-function-1\}

`a = ALL (subquery)` – 等价于 `a IN (SELECT singleValueOrNull(*) FROM subquery)`。

### notIn 子查询函数

`a != ALL (subquery)` – `notIn(a, subquery)` 函数。

**示例**

包含 ALL 的查询：

```sql
SELECT number AS a FROM numbers(10) WHERE a > ALL (SELECT number FROM numbers(3, 3));
```

结果：

```text
┌─a─┐
│ 6 │
│ 7 │
│ 8 │
│ 9 │
└───┘
```

使用 ANY 查询：

```sql
SELECT number AS a FROM numbers(10) WHERE a > ANY (SELECT number FROM numbers(3, 3));
```

结果：

```text
┌─a─┐
│ 4 │
│ 5 │
│ 6 │
│ 7 │
│ 8 │
│ 9 │
└───┘
```


## 日期和时间运算符 \{#operators-for-working-with-dates-and-times\}

### EXTRACT

```sql
EXTRACT(part FROM date);
```

从给定日期中提取某个部分。例如，你可以从日期中获取月份，或从时间中获取秒数。

参数 `part` 指定要从日期中提取的部分。可取值如下：

* `DAY` — 月中的某一天。可能的取值范围：1–31。
* `MONTH` — 月份序号。可能的取值范围：1–12。
* `YEAR` — 年。
* `SECOND` — 秒。可能的取值范围：0–59。
* `MINUTE` — 分钟。可能的取值范围：0–59。
* `HOUR` — 小时。可能的取值范围：0–23。

参数 `part` 不区分大小写。

参数 `date` 指定要处理的日期或时间。支持 [Date](../../sql-reference/data-types/date.md) 或 [DateTime](../../sql-reference/data-types/datetime.md) 类型。

示例：

```sql
SELECT EXTRACT(DAY FROM toDate('2017-06-15'));
SELECT EXTRACT(MONTH FROM toDate('2017-06-15'));
SELECT EXTRACT(YEAR FROM toDate('2017-06-15'));
```

在下面的示例中，我们创建一张表，并向其中插入一条 `DateTime` 类型的数据。

```sql
CREATE TABLE test.Orders
(
    OrderId UInt64,
    OrderName String,
    OrderDate DateTime
)
ENGINE = Log;
```

```sql
INSERT INTO test.Orders VALUES (1, 'Jarlsberg 奶酪', toDateTime('2008-10-11 13:23:44'));
```

```sql
SELECT
    toYear(OrderDate) AS OrderYear,
    toMonth(OrderDate) AS OrderMonth,
    toDayOfMonth(OrderDate) AS OrderDay,
    toHour(OrderDate) AS OrderHour,
    toMinute(OrderDate) AS OrderMinute,
    toSecond(OrderDate) AS OrderSecond
FROM test.Orders;
```

```text
┌─OrderYear─┬─OrderMonth─┬─OrderDay─┬─OrderHour─┬─OrderMinute─┬─OrderSecond─┐
│      2008 │         10 │       11 │        13 │          23 │          44 │
└───────────┴────────────┴──────────┴───────────┴─────────────┴─────────────┘
```

可以在 [tests](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/00619_extract.sql) 中查看更多示例。


### INTERVAL

创建一个 [Interval](../../sql-reference/data-types/special-data-types/interval.md) 类型的值，用于与 [Date](../../sql-reference/data-types/date.md) 和 [DateTime](../../sql-reference/data-types/datetime.md) 类型的值进行算术运算。

可用的时间间隔类型：

* `SECOND`
* `MINUTE`
* `HOUR`
* `DAY`
* `WEEK`
* `MONTH`
* `QUARTER`
* `YEAR`

在设置 `INTERVAL` 值时，也可以使用字符串字面量。例如，`INTERVAL 1 HOUR` 等同于 `INTERVAL '1 hour'` 或 `INTERVAL '1' hour`。

:::tip\
不同类型的时间间隔不能组合使用。不能使用类似 `INTERVAL 4 DAY 1 HOUR` 的表达式。请使用不大于该间隔中最小时间单位的单位来指定间隔，例如 `INTERVAL 25 HOUR`。也可以像下面示例中那样通过多次连续运算来实现。
:::

示例：

```sql
SELECT now() AS current_date_time, current_date_time + INTERVAL 4 DAY + INTERVAL 3 HOUR;
```

```text
┌───current_date_time─┬─plus(plus(now(), toIntervalDay(4)), toIntervalHour(3))─┐
│ 2020-11-03 22:09:50 │                                    2020-11-08 01:09:50 │
└─────────────────────┴────────────────────────────────────────────────────────┘
```

```sql
SELECT now() AS current_date_time, current_date_time + INTERVAL '4 day' + INTERVAL '3 hour';
```

```text
┌───current_date_time─┬─plus(plus(now(), toIntervalDay(4)), toIntervalHour(3))─┐
│ 2020-11-03 22:12:10 │                                    2020-11-08 01:12:10 │
└─────────────────────┴────────────────────────────────────────────────────────┘
```

```sql
SELECT now() AS current_date_time, current_date_time + INTERVAL '4' day + INTERVAL '3' hour;
```

```text
┌───current_date_time─┬─plus(plus(now(), toIntervalDay('4')), toIntervalHour('3'))─┐
│ 2020-11-03 22:33:19 │                                        2020-11-08 01:33:19 │
└─────────────────────┴────────────────────────────────────────────────────────────┘
```

:::note\
应始终优先使用 `INTERVAL` 语法或 `addDays` 函数。简单的加减运算（例如 `now() + ...` 这样的语法）不会考虑时区等时间设置，比如夏令时。
:::

示例：

```sql
SELECT toDateTime('2014-10-26 00:00:00', 'Asia/Istanbul') AS time, time + 60 * 60 * 24 AS time_plus_24_hours, time + toIntervalDay(1) AS time_plus_1_day;
```

```text
┌────────────────time─┬──time_plus_24_hours─┬─────time_plus_1_day─┐
│ 2014-10-26 00:00:00 │ 2014-10-26 23:00:00 │ 2014-10-27 00:00:00 │
└─────────────────────┴─────────────────────┴─────────────────────┘
```

**另请参阅**

* [Interval](../../sql-reference/data-types/special-data-types/interval.md) 数据类型
* [toInterval](/sql-reference/functions/type-conversion-functions#tointervalyear) 类型转换函数


## 逻辑与运算符 \{#logical-and-operator\}

语法 `SELECT a AND b` —— 使用函数 [and](/sql-reference/functions/logical-functions#and) 计算 `a` 和 `b` 的逻辑与结果。

## 逻辑 OR 运算符 \{#logical-or-operator\}

语法 `SELECT a OR b` — 使用函数 [or](/sql-reference/functions/logical-functions#or) 计算 `a` 和 `b` 的逻辑或。

## 逻辑非运算符 \{#logical-negation-operator\}

语法 `SELECT NOT a`——使用函数 [not](/sql-reference/functions/logical-functions#not) 计算 `a` 的逻辑非。

## 条件运算符 \{#conditional-operator\}

`a ? b : c` – `if(a, b, c)` 函数。

注意：

条件运算符会先计算表达式 b 和 c 的值，然后检查条件 a 是否满足，并返回相应的结果。如果 `b` 或 `c` 是 [arrayJoin()](/sql-reference/functions/array-join) 函数，每一行都会被复制，与条件 a 是否成立无关。

## 条件表达式

```sql
CASE [x]
    WHEN a THEN b
    [WHEN ... THEN ...]
    [ELSE c]
END
```

如果指定了 `x`，则使用函数 `transform(x, [a, ...], [b, ...], c)`；否则使用 `multiIf(a, b, ..., c)`。

如果表达式中没有 `ELSE c` 子句，则默认值为 `NULL`。

`transform` 函数不支持 `NULL`。


## 连接运算符 \{#concatenation-operator\}

`s1 || s2` – 表示 `concat(s1, s2)` 函数。

## Lambda 创建运算符 \{#lambda-creation-operator\}

`x -> expr` – `lambda(x, expr)` 函数。

以下运算符不区分优先级，因为它们起到括号的作用：

## 数组创建运算符 \{#array-creation-operator\}

`[x1, ...]` – 对应 `array(x1, ...)` 函数。

## 元组创建运算符 \{#tuple-creation-operator\}

`(x1, x2, ...)` – 等价于调用 `tuple(x1, x2, ...)` 函数。

## 结合性 \{#associativity\}

所有二元运算符都是左结合的。例如，`1 + 2 + 3` 会被转换为 `plus(plus(1, 2), 3)`。
有时其行为可能与预期不符。例如，`SELECT 4 > 2 > 3` 的结果为 0。

为了提高效率，`and` 和 `or` 函数可以接受任意数量的参数。相应的 `AND` 和 `OR` 运算符链会被转换为对这些函数的一次调用。

## 检查 `NULL` 值 \{#checking-for-null\}

ClickHouse 支持 `IS NULL` 和 `IS NOT NULL` 运算符。

### IS NULL \

* 对于 [Nullable](../../sql-reference/data-types/nullable.md) 类型的值，`IS NULL` 运算符返回：
  * 如果值为 `NULL`，则返回 `1`。
  * 否则返回 `0`。
* 对于其他值，`IS NULL` 运算符始终返回 `0`。

可以通过启用 [optimize&#95;functions&#95;to&#95;subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns) 设置进行优化。将 `optimize_functions_to_subcolumns` 设为 `1` 后，函数只会读取 [null](../../sql-reference/data-types/nullable.md#finding-null) 子列，而不是读取并处理整个列的数据。查询 `SELECT n IS NULL FROM table` 会被转换为 `SELECT n.null FROM TABLE`。

{/* */ }

```sql
SELECT x+100 FROM t_null WHERE y IS NULL
```

```text
┌─plus(x, 100)─┐
│          101 │
└──────────────┘
```


### IS NOT NULL \

* 对于 [Nullable](../../sql-reference/data-types/nullable.md) 类型的值，`IS NOT NULL` 运算符返回：
  * 当值为 `NULL` 时返回 `0`。
  * 否则返回 `1`。
* 对于其他值，`IS NOT NULL` 运算符始终返回 `1`。

{/* */ }

```sql
SELECT * FROM t_null WHERE y IS NOT NULL
```

```text
┌─x─┬─y─┐
│ 2 │ 3 │
└───┴───┘
```

可以通过启用 [optimize&#95;functions&#95;to&#95;subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns) 设置来进行优化。将 `optimize_functions_to_subcolumns` 设为 `1` 时，函数只读取 [null](../../sql-reference/data-types/nullable.md#finding-null) 子列，而不是读取和处理整列数据。查询 `SELECT n IS NOT NULL FROM table` 会被转换为 `SELECT NOT n.null FROM TABLE`。
