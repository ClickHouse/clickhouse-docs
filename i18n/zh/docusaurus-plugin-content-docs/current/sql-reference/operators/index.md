---
'description': '运算符文档'
'displayed_sidebar': 'sqlreference'
'sidebar_label': '运算符'
'sidebar_position': 38
'slug': '/sql-reference/operators/'
'title': 'Operators'
---




# 操作符

ClickHouse 在查询解析阶段根据操作符的优先级、优先顺序和结合性将操作符转换为相应的函数。

## 访问操作符 {#access-operators}

`a[N]` – 访问数组的元素。对应的函数是 `arrayElement(a, N)`。

`a.N` – 访问元组元素。对应的函数是 `tupleElement(a, N)`。

## 数值取反操作符 {#numeric-negation-operator}

`-a` – 对应的函数是 `negate (a)`。

用于元组取反: [tupleNegate](../../sql-reference/functions/tuple-functions.md#tuplenegate)。

## 乘法和除法操作符 {#multiplication-and-division-operators}

`a * b` – 对应的函数是 `multiply (a, b)`。

用于将元组乘以数字: [tupleMultiplyByNumber](../../sql-reference/functions/tuple-functions.md#tuplemultiplybynumber)，用于标量积: [dotProduct](/sql-reference/functions/array-functions#arraydotproduct)。

`a / b` – 对应的函数是 `divide(a, b)`。

用于将元组除以数字: [tupleDivideByNumber](../../sql-reference/functions/tuple-functions.md#tupledividebynumber)。

`a % b` – 对应的函数是 `modulo(a, b)`。

## 加法和减法操作符 {#addition-and-subtraction-operators}

`a + b` – 对应的函数是 `plus(a, b)`。

用于元组加法: [tuplePlus](../../sql-reference/functions/tuple-functions.md#tupleplus)。

`a - b` – 对应的函数是 `minus(a, b)`。

用于元组减法: [tupleMinus](../../sql-reference/functions/tuple-functions.md#tupleminus)。

## 比较操作符 {#comparison-operators}

### equals 函数 {#equals-function}
`a = b` – 对应的函数是 `equals(a, b)`。

`a == b` – 对应的函数是 `equals(a, b)`。

### notEquals 函数 {#notequals-function}
`a != b` – 对应的函数是 `notEquals(a, b)`。

`a <> b` – 对应的函数是 `notEquals(a, b)`。

### lessOrEquals 函数 {#lessorequals-function}
`a <= b` – 对应的函数是 `lessOrEquals(a, b)`。

### greaterOrEquals 函数 {#greaterorequals-function}
`a >= b` – 对应的函数是 `greaterOrEquals(a, b)`。

### less 函数 {#less-function}
`a < b` – 对应的函数是 `less(a, b)`。

### greater 函数 {#greater-function}
`a > b` – 对应的函数是 `greater(a, b)`。

### like 函数 {#like-function}
`a LIKE s` – 对应的函数是 `like(a, b)`。

### notLike 函数 {#notlike-function}
`a NOT LIKE s` – 对应的函数是 `notLike(a, b)`。

### ilike 函数 {#ilike-function}
`a ILIKE s` – 对应的函数是 `ilike(a, b)`。

### BETWEEN 函数 {#between-function}
`a BETWEEN b AND c` – 同 `a >= b AND a <= c`。

`a NOT BETWEEN b AND c` – 同 `a < b OR a > c`。

## 数据集操作的操作符 {#operators-for-working-with-data-sets}

参见 [IN 操作符](../../sql-reference/operators/in.md) 和 [EXISTS](../../sql-reference/operators/exists.md) 操作符。

### in 函数 {#in-function}
`a IN ...` – 对应的函数是 `in(a, b)`。

### notIn 函数 {#notin-function}
`a NOT IN ...` – 对应的函数是 `notIn(a, b)`。

### globalIn 函数 {#globalin-function}
`a GLOBAL IN ...` – 对应的函数是 `globalIn(a, b)`。

### globalNotIn 函数 {#globalnotin-function}
`a GLOBAL NOT IN ...` – 对应的函数是 `globalNotIn(a, b)`。

### in 子查询函数 {#in-subquery-function}
`a = ANY (subquery)` – 对应的函数是 `in(a, subquery)`。  

### notIn 子查询函数 {#notin-subquery-function}
`a != ANY (subquery)` – 同 `a NOT IN (SELECT singleValueOrNull(*) FROM subquery)`。

### in 子查询函数 {#in-subquery-function-1}
`a = ALL (subquery)` – 同 `a IN (SELECT singleValueOrNull(*) FROM subquery)`。

### notIn 子查询函数 {#notin-subquery-function-1}
`a != ALL (subquery)` – 对应的函数是 `notIn(a, subquery)`。 


**示例**

使用 ALL 的查询：

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

使用 ANY 的查询：

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

## 日期和时间操作的操作符 {#operators-for-working-with-dates-and-times}

### EXTRACT {#extract}

```sql
EXTRACT(part FROM date);
```

从给定日期提取部分。例如，您可以从给定日期中检索月份，或从时间中检索秒。

`part` 参数指定要检索的日期部分。可用值有：

- `DAY` — 月中的天数。可能的值：1–31。
- `MONTH` — 月份的数字。可能的值：1–12。
- `YEAR` — 年。
- `SECOND` — 秒。可能的值：0–59。
- `MINUTE` — 分钟。可能的值：0–59。
- `HOUR` — 小时。可能的值：0–23。

`part` 参数不区分大小写。

`date` 参数指定要处理的日期或时间。支持 [Date](../../sql-reference/data-types/date.md) 或 [DateTime](../../sql-reference/data-types/datetime.md) 类型。

示例：

```sql
SELECT EXTRACT(DAY FROM toDate('2017-06-15'));
SELECT EXTRACT(MONTH FROM toDate('2017-06-15'));
SELECT EXTRACT(YEAR FROM toDate('2017-06-15'));
```

在以下示例中，我们创建一个表并插入一个 `DateTime` 类型的值。

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
INSERT INTO test.Orders VALUES (1, 'Jarlsberg Cheese', toDateTime('2008-10-11 13:23:44'));
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

您可以在 [tests](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/00619_extract.sql) 中看到更多示例。

### INTERVAL {#interval}

创建一个 [Interval](../../sql-reference/data-types/special-data-types/interval.md) 类型的值，该值应在与 [Date](../../sql-reference/data-types/date.md) 和 [DateTime](../../sql-reference/data-types/datetime.md) 类型的值进行算术运算时使用。

间隔类型：
- `SECOND`
- `MINUTE`
- `HOUR`
- `DAY`
- `WEEK`
- `MONTH`
- `QUARTER`
- `YEAR`

设置 `INTERVAL` 值时，您还可以使用字符串字面量。例如，`INTERVAL 1 HOUR` 与 `INTERVAL '1 hour'` 或 `INTERVAL '1' hour` 相同。

:::tip    
不同类型的间隔不能组合。您不能使用像 `INTERVAL 4 DAY 1 HOUR` 这样的表达式。请将间隔指定为小于或等于间隔最小单位的单位，例如，`INTERVAL 25 HOUR`。您可以使用连续的操作，例如下面的示例所示。
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

:::note    
优先使用 `INTERVAL` 语法或 `addDays` 函数。简单的加法或减法（例如 `now() + ...` ）不会考虑时间设置。例如，夏令时。
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

- [Interval](../../sql-reference/data-types/special-data-types/interval.md) 数据类型
- [toInterval](/sql-reference/functions/type-conversion-functions#tointervalyear) 类型转换函数

## 逻辑与操作符 {#logical-and-operator}

语法 `SELECT a AND b` — 使用函数 [and](/sql-reference/functions/logical-functions#and) 计算 `a` 和 `b` 的逻辑合取。

## 逻辑或操作符 {#logical-or-operator}

语法 `SELECT a OR b` — 使用函数 [or](/sql-reference/functions/logical-functions#or) 计算 `a` 和 `b` 的逻辑合取。

## 逻辑取反操作符 {#logical-negation-operator}

语法 `SELECT NOT a` — 使用函数 [not](/sql-reference/functions/logical-functions#not) 计算 `a` 的逻辑取反。

## 条件操作符 {#conditional-operator}

`a ? b : c` – 对应的函数是 `if(a, b, c)`。

注意：

条件操作符计算 b 和 c 的值，然后检查条件 a 是否满足，然后返回相应的值。如果 `b` 或 `C` 是 [arrayJoin()](/sql-reference/functions/array-join) 函数，则每一行都会复制，而不考虑 "a" 条件。

## 条件表达式 {#conditional-expression}

```sql
CASE [x]
    WHEN a THEN b
    [WHEN ... THEN ...]
    [ELSE c]
END
```

如果指定了 `x`，将使用函数 `transform(x, [a, ...], [b, ...], c)`。否则使用 `multiIf(a, b, ..., c)`。

如果表达式中没有 `ELSE c` 子句，则默认值为 `NULL`。

`transform` 函数不适用于 `NULL`。

## 连接操作符 {#concatenation-operator}

`s1 || s2` – 对应的函数是 `concat(s1, s2)`。

## Lambda 创建操作符 {#lambda-creation-operator}

`x -> expr` – 对应的函数是 `lambda(x, expr)`。

以下操作符没有优先级，因为它们是括号：

## 数组创建操作符 {#array-creation-operator}

`[x1, ...]` – 对应的函数是 `array(x1, ...)`。

## 元组创建操作符 {#tuple-creation-operator}

`(x1, x2, ...)` – 对应的函数是 `tuple(x2, x2, ...)`。

## 结合性 {#associativity}

所有二元操作符具有左结合性。例如，`1 + 2 + 3` 被转换为 `plus(plus(1, 2), 3)`。
有时这并不像您期待的那样工作。例如，`SELECT 4 > 2 > 3` 将结果为 0。

为了效率，`and` 和 `or` 函数接受任意数量的参数。相应的 `AND` 和 `OR` 操作符链会被转换为这些函数的单次调用。

## 检查 `NULL` {#checking-for-null}

ClickHouse 支持 `IS NULL` 和 `IS NOT NULL` 操作符。

### IS NULL {#is_null}

- 对于 [Nullable](../../sql-reference/data-types/nullable.md) 类型值，`IS NULL` 操作符返回：
    - `1`，如果值为 `NULL`。
    - `0`，否则。
- 对于其他值，`IS NULL` 操作符始终返回 `0`。

可以通过启用 [optimize_functions_to_subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns) 设置进行优化。设置 `optimize_functions_to_subcolumns = 1` 后，该函数仅读取 [null](../../sql-reference/data-types/nullable.md#finding-null) 子列，而不是读取和处理整个列数据。查询 `SELECT n IS NULL FROM table` 转换为 `SELECT n.null FROM TABLE`。

<!-- -->

```sql
SELECT x+100 FROM t_null WHERE y IS NULL
```

```text
┌─plus(x, 100)─┐
│          101 │
└──────────────┘
```

### IS NOT NULL {#is_not_null}

- 对于 [Nullable](../../sql-reference/data-types/nullable.md) 类型值，`IS NOT NULL` 操作符返回：
    - `0`，如果值为 `NULL`。
    - `1`，否则。
- 对于其他值，`IS NOT NULL` 操作符始终返回 `1`。

<!-- -->

```sql
SELECT * FROM t_null WHERE y IS NOT NULL
```

```text
┌─x─┬─y─┐
│ 2 │ 3 │
└───┴───┘
```

可以通过启用 [optimize_functions_to_subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns) 设置进行优化。设置 `optimize_functions_to_subcolumns = 1` 后，该函数仅读取 [null](../../sql-reference/data-types/nullable.md#finding-null) 子列，而不是读取和处理整个列数据。查询 `SELECT n IS NOT NULL FROM table` 转换为 `SELECT NOT n.null FROM TABLE`。
