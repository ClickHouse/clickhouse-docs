---
'description': '操作符的文档'
'displayed_sidebar': 'sqlreference'
'sidebar_label': '操作符'
'sidebar_position': 38
'slug': '/sql-reference/operators/'
'title': '操作符'
'doc_type': 'reference'
---


# 运算符

ClickHouse 会根据运算符的优先级、等级和结合性，在查询解析阶段将运算符转换为相应的函数。

## 访问运算符 {#access-operators}

`a[N]` – 访问数组的元素。相当于 `arrayElement(a, N)` 函数。

`a.N` – 访问元组元素。相当于 `tupleElement(a, N)` 函数。

## 数值否定运算符 {#numeric-negation-operator}

`-a` – 相当于 `negate(a)` 函数。

对于元组否定： [tupleNegate](../../sql-reference/functions/tuple-functions.md#tuplenegate)。

## 乘法和除法运算符 {#multiplication-and-division-operators}

`a * b` – 相当于 `multiply(a, b)` 函数。

对于元组乘以数字：[tupleMultiplyByNumber](../../sql-reference/functions/tuple-functions.md#tuplemultiplybynumber)，对于标量积：[dotProduct](/sql-reference/functions/array-functions#arrayDotProduct)。

`a / b` – 相当于 `divide(a, b)` 函数。

对于元组除以数字：[tupleDivideByNumber](../../sql-reference/functions/tuple-functions.md#tupledividebynumber)。

`a % b` – 相当于 `modulo(a, b)` 函数。

## 加法和减法运算符 {#addition-and-subtraction-operators}

`a + b` – 相当于 `plus(a, b)` 函数。

对于元组加法：[tuplePlus](../../sql-reference/functions/tuple-functions.md#tupleplus)。

`a - b` – 相当于 `minus(a, b)` 函数。

对于元组减法：[tupleMinus](../../sql-reference/functions/tuple-functions.md#tupleminus)。

## 比较运算符 {#comparison-operators}

### 等于函数 {#equals-function}
`a = b` – 相当于 `equals(a, b)` 函数。

`a == b` – 相当于 `equals(a, b)` 函数。

### 不等于函数 {#notequals-function}
`a != b` – 相当于 `notEquals(a, b)` 函数。

`a <> b` – 相当于 `notEquals(a, b)` 函数。

### 小于或等于函数 {#lessorequals-function}
`a <= b` – 相当于 `lessOrEquals(a, b)` 函数。

### 大于或等于函数 {#greaterorequals-function}
`a >= b` – 相当于 `greaterOrEquals(a, b)` 函数。

### 小于函数 {#less-function}
`a < b` – 相当于 `less(a, b)` 函数。

### 大于函数 {#greater-function}
`a > b` – 相当于 `greater(a, b)` 函数。

### LIKE 函数 {#like-function}
`a LIKE b` – 相当于 `like(a, b)` 函数。

### NOT LIKE 函数 {#notlike-function}
`a NOT LIKE b` – 相当于 `notLike(a, b)` 函数。

### ILIKE 函数 {#ilike-function}
`a ILIKE b` – 相当于 `ilike(a, b)` 函数。

### BETWEEN 函数 {#between-function}
`a BETWEEN b AND c` – 与 `a >= b AND a <= c` 相同。

`a NOT BETWEEN b AND c` – 与 `a < b OR a > c` 相同。

## 数据集操作运算符 {#operators-for-working-with-data-sets}

参见 [IN 运算符](../../sql-reference/operators/in.md) 和 [EXISTS](../../sql-reference/operators/exists.md) 运算符。

### in 函数 {#in-function}
`a IN ...` – 相当于 `in(a, b)` 函数。

### notIn 函数 {#notin-function}
`a NOT IN ...` – 相当于 `notIn(a, b)` 函数。

### globalIn 函数 {#globalin-function}
`a GLOBAL IN ...` – 相当于 `globalIn(a, b)` 函数。

### globalNotIn 函数 {#globalnotin-function}
`a GLOBAL NOT IN ...` – 相当于 `globalNotIn(a, b)` 函数。

### in 子查询函数 {#in-subquery-function}
`a = ANY (subquery)` – 相当于 `in(a, subquery)` 函数。  

### notIn 子查询函数 {#notin-subquery-function}
`a != ANY (subquery)` – 与 `a NOT IN (SELECT singleValueOrNull(*) FROM subquery)` 相同。

### in 子查询函数 {#in-subquery-function-1}
`a = ALL (subquery)` – 与 `a IN (SELECT singleValueOrNull(*) FROM subquery)` 相同。

### notIn 子查询函数 {#notin-subquery-function-1}
`a != ALL (subquery)` – 相当于 `notIn(a, subquery)` 函数。 

**示例**

查询使用 ALL:

```sql
SELECT number AS a FROM numbers(10) WHERE a > ALL (SELECT number FROM numbers(3, 3));
```

结果:

```text
┌─a─┐
│ 6 │
│ 7 │
│ 8 │
│ 9 │
└───┘
```

查询使用 ANY:

```sql
SELECT number AS a FROM numbers(10) WHERE a > ANY (SELECT number FROM numbers(3, 3));
```

结果:

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

## 日期和时间操作运算符 {#operators-for-working-with-dates-and-times}

### EXTRACT {#extract}

```sql
EXTRACT(part FROM date);
```

从给定日期提取部分值。例如，您可以从给定日期中获取月份，或者从时间中获取秒。

`part` 参数指定要检索的日期部分。可用的值如下：

- `DAY` — 月中的天。可能的值：1–31。
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

在以下示例中，我们创建一个表并插入一个具有 `DateTime` 类型的值。

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

创建一个 [Interval](../../sql-reference/data-types/special-data-types/interval.md)-类型值，该值应在与 [Date](../../sql-reference/data-types/date.md) 和 [DateTime](../../sql-reference/data-types/datetime.md)-类型值进行算术操作时使用。

间隔类型：
- `SECOND`
- `MINUTE`
- `HOUR`
- `DAY`
- `WEEK`
- `MONTH`
- `QUARTER`
- `YEAR`

设置 `INTERVAL` 值时，您还可以使用字符串字面量。例如，`INTERVAL 1 HOUR` 与 `INTERVAL '1 hour'` 或 `INTERVAL '1' hour` 是相同的。

:::tip    
不同类型的间隔不能结合。您不能使用表达式如 `INTERVAL 4 DAY 1 HOUR`。应在小于或等于间隔的最小单位的单位中指定间隔，例如 `INTERVAL 25 HOUR`。您可以使用连续操作，如下例所示。
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
建议优先使用 `INTERVAL` 语法或 `addDays` 函数。简单的加法或减法（如 `now() + ...` 的语法）不考虑时间设置。例如，夏令时。
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

**另请参见**

- [Interval](../../sql-reference/data-types/special-data-types/interval.md) 数据类型
- [toInterval](/sql-reference/functions/type-conversion-functions#tointervalyear) 类型转换函数

## 逻辑与运算符 {#logical-and-operator}

语法 `SELECT a AND b` — 计算 `a` 和 `b` 的逻辑合取，使用函数 [and](/sql-reference/functions/logical-functions#and)。

## 逻辑或运算符 {#logical-or-operator}

语法 `SELECT a OR b` — 计算 `a` 和 `b` 的逻辑析取，使用函数 [or](/sql-reference/functions/logical-functions#or)。

## 逻辑否定运算符 {#logical-negation-operator}

语法 `SELECT NOT a` — 计算 `a` 的逻辑否定，使用函数 [not](/sql-reference/functions/logical-functions#not)。

## 条件运算符 {#conditional-operator}

`a ? b : c` – 相当于 `if(a, b, c)` 函数。

注意：

条件运算符计算 b 和 c 的值，然后检查条件 a 是否满足，随后返回相应的值。如果 `b` 或 `c` 是 [arrayJoin()](/sql-reference/functions/array-join) 函数，则无论 "a" 条件如何，每行都会被复制。

## 条件表达式 {#conditional-expression}

```sql
CASE [x]
    WHEN a THEN b
    [WHEN ... THEN ...]
    [ELSE c]
END
```

如果指定了 `x`，则使用 `transform(x, [a, ...], [b, ...], c)` 函数。否则使用 `multiIf(a, b, ..., c)`。

如果表达式中没有 `ELSE c` 子句，则默认值为 `NULL`。

`transform` 函数不适用于 `NULL`。

## 连接运算符 {#concatenation-operator}

`s1 || s2` – 相当于 `concat(s1, s2)` 函数。

## Lambda 创建运算符 {#lambda-creation-operator}

`x -> expr` – 相当于 `lambda(x, expr)` 函数。

以下运算符没有优先级，因为它们是括号：

## 数组创建运算符 {#array-creation-operator}

`[x1, ...]` – 相当于 `array(x1, ...)` 函数。

## 元组创建运算符 {#tuple-creation-operator}

`(x1, x2, ...)` – 相当于 `tuple(x2, x2, ...)` 函数。

## 结合性 {#associativity}

所有二元运算符都是左结合的。例如，`1 + 2 + 3` 转换为 `plus(plus(1, 2), 3)`。
有时这不按您预期的方式工作。例如，`SELECT 4 > 2 > 3` 的结果将为 0。

为了效率，`and` 和 `or` 函数接受任何数量的参数。相应的 `AND` 和 `OR` 运算符的链条会被转换为这些函数的单一调用。

## 检查 `NULL` {#checking-for-null}

ClickHouse 支持 `IS NULL` 和 `IS NOT NULL` 运算符。

### IS NULL {#is_null}

- 对于 [Nullable](../../sql-reference/data-types/nullable.md) 类型的值，`IS NULL` 运算符返回：
  - `1`，如果值为 `NULL`。
  - 否则返回 `0`。
- 对于其他值，`IS NULL` 运算符始终返回 `0`。

可以通过启用 [optimize_functions_to_subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns) 设置来优化。使用 `optimize_functions_to_subcolumns = 1` 时，函数只读取 [null](../../sql-reference/data-types/nullable.md#finding-null) 子列，而不是读取和处理整列数据。查询 `SELECT n IS NULL FROM table` 转换为 `SELECT n.null FROM TABLE`。

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

- 对于 [Nullable](../../sql-reference/data-types/nullable.md) 类型的值，`IS NOT NULL` 运算符返回：
  - `0`，如果值为 `NULL`。
  - 否则返回 `1`。
- 对于其他值，`IS NOT NULL` 运算符始终返回 `1`。

<!-- -->

```sql
SELECT * FROM t_null WHERE y IS NOT NULL
```

```text
┌─x─┬─y─┐
│ 2 │ 3 │
└───┴───┘
```

可以通过启用 [optimize_functions_to_subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns) 设置来优化。使用 `optimize_functions_to_subcolumns = 1` 时，函数只读取 [null](../../sql-reference/data-types/nullable.md#finding-null) 子列，而不是读取和处理整列数据。查询 `SELECT n IS NOT NULL FROM table` 转换为 `SELECT NOT n.null FROM TABLE`。
