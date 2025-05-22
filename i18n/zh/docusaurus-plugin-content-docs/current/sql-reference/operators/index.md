---
'description': '操作符的文档'
'displayed_sidebar': 'sqlreference'
'sidebar_label': '操作符'
'sidebar_position': 38
'slug': '/sql-reference/operators/'
'title': '操作符'
---


# 操作符

ClickHouse 在查询解析阶段根据操作符的优先级、优先顺序和结合性将操作符转换为其相应的函数。

## 访问操作符 {#access-operators}

`a[N]` – 访问数组的一个元素。这个对应的函数是 `arrayElement(a, N)`。

`a.N` – 访问元组元素。这个对应的函数是 `tupleElement(a, N)`。

## 数值取负操作符 {#numeric-negation-operator}

`-a` – 这个对应的函数是 `negate (a)`。

对于元组取负: [tupleNegate](../../sql-reference/functions/tuple-functions.md#tuplenegate)。

## 乘法和除法操作符 {#multiplication-and-division-operators}

`a * b` – 这个对应的函数是 `multiply (a, b)`。

用于将元组与数字相乘: [tupleMultiplyByNumber](../../sql-reference/functions/tuple-functions.md#tuplemultiplybynumber)，用于标量乘积: [dotProduct](/sql-reference/functions/array-functions#arraydotproduct)。

`a / b` – 这个对应的函数是 `divide(a, b)`。

用于将元组与数字相除: [tupleDivideByNumber](../../sql-reference/functions/tuple-functions.md#tupledividebynumber)。

`a % b` – 这个对应的函数是 `modulo(a, b)`。

## 加法和减法操作符 {#addition-and-subtraction-operators}

`a + b` – 这个对应的函数是 `plus(a, b)`。

用于元组的加法: [tuplePlus](../../sql-reference/functions/tuple-functions.md#tupleplus)。

`a - b` – 这个对应的函数是 `minus(a, b)`。

用于元组的减法: [tupleMinus](../../sql-reference/functions/tuple-functions.md#tupleminus)。

## 比较操作符 {#comparison-operators}

### 等于函数 {#equals-function}
`a = b` – 这个对应的函数是 `equals(a, b)`。

`a == b` – 这个对应的函数是 `equals(a, b)`。

### 不等于函数 {#notequals-function}
`a != b` – 这个对应的函数是 `notEquals(a, b)`。

`a <> b` – 这个对应的函数是 `notEquals(a, b)`。

### 小于或等于函数 {#lessorequals-function}
`a <= b` – 这个对应的函数是 `lessOrEquals(a, b)`。

### 大于或等于函数 {#greaterorequals-function}
`a >= b` – 这个对应的函数是 `greaterOrEquals(a, b)`。

### 小于函数 {#less-function}
`a < b` – 这个对应的函数是 `less(a, b)`。

### 大于函数 {#greater-function}
`a > b` – 这个对应的函数是 `greater(a, b)`。

### LIKE 函数 {#like-function}
`a LIKE s` – 这个对应的函数是 `like(a, b)`。

### NOT LIKE 函数 {#notlike-function}
`a NOT LIKE s` – 这个对应的函数是 `notLike(a, b)`。

### ILIKE 函数 {#ilike-function}
`a ILIKE s` – 这个对应的函数是 `ilike(a, b)`。

### BETWEEN 函数 {#between-function}
`a BETWEEN b AND c` – 与 `a >= b AND a <= c` 相同。

`a NOT BETWEEN b AND c` – 与 `a < b OR a > c` 相同。

## 数据集操作的操作符 {#operators-for-working-with-data-sets}

请参阅 [IN 操作符](../../sql-reference/operators/in.md) 和 [EXISTS](../../sql-reference/operators/exists.md) 操作符。

### IN 函数 {#in-function}
`a IN ...` – 这个对应的函数是 `in(a, b)`。

### NOT IN 函数 {#notin-function}
`a NOT IN ...` – 这个对应的函数是 `notIn(a, b)`。

### GLOBAL IN 函数 {#globalin-function}
`a GLOBAL IN ...` – 这个对应的函数是 `globalIn(a, b)`。

### GLOBAL NOT IN 函数 {#globalnotin-function}
`a GLOBAL NOT IN ...` – 这个对应的函数是 `globalNotIn(a, b)`。

### IN 子查询函数 {#in-subquery-function}
`a = ANY (subquery)` – 这个对应的函数是 `in(a, subquery)`。  

### NOT IN 子查询函数 {#notin-subquery-function}
`a != ANY (subquery)` – 与 `a NOT IN (SELECT singleValueOrNull(*) FROM subquery)` 相同。

### IN 子查询函数 {#in-subquery-function-1}
`a = ALL (subquery)` – 与 `a IN (SELECT singleValueOrNull(*) FROM subquery)` 相同。

### NOT IN 子查询函数 {#notin-subquery-function-1}
`a != ALL (subquery)` – 这个对应的函数是 `notIn(a, subquery)`。 


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

从给定日期提取部分。例如，您可以从给定日期中提取月份，或者从时间中提取秒数。

`part` 参数指定要提取日期的哪个部分。以下值可用：

- `DAY` — 月中的某一天。可取值：1–31。
- `MONTH` — 月份的数字。可取值：1–12。
- `YEAR` — 年。
- `SECOND` — 秒。可取值：0–59。
- `MINUTE` — 分钟。可取值：0–59。
- `HOUR` — 小时。可取值：0–23。

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

您可以在 [tests](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/00619_extract.sql) 中查看更多示例。

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

在设置 `INTERVAL` 值时，您还可以使用字符串文字。例如，`INTERVAL 1 HOUR` 与 `INTERVAL '1 hour'` 或 `INTERVAL '1' hour` 是相同的。

:::tip    
不同类型的间隔不能结合。您不能使用像 `INTERVAL 4 DAY 1 HOUR` 这样的表达式。请在单位小于或等于间隔的最小单位时指定间隔，例如 `INTERVAL 25 HOUR`。您可以执行连续操作，如下面的示例所示。
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
总是推荐使用 `INTERVAL` 语法或 `addDays` 函数。简单的加法或减法（例如 `now() + ...`）不考虑时间设置，例如夏令时。
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

## 逻辑 AND 操作符 {#logical-and-operator}

语法 `SELECT a AND b` — 计算 `a` 和 `b` 的逻辑与，使用函数 [and](/sql-reference/functions/logical-functions#and)。

## 逻辑 OR 操作符 {#logical-or-operator}

语法 `SELECT a OR b` — 计算 `a` 和 `b` 的逻辑或，使用函数 [or](/sql-reference/functions/logical-functions#or)。

## 逻辑取反操作符 {#logical-negation-operator}

语法 `SELECT NOT a` — 计算 `a` 的逻辑取反，使用函数 [not](/sql-reference/functions/logical-functions#not)。

## 条件操作符 {#conditional-operator}

`a ? b : c` – 这个对应的函数是 `if(a, b, c)`。

注意：

条件操作符计算 b 和 c 的值，然后检查条件 a 是否满足，然后返回相应的值。如果 `b` 或 `C` 是一个 [arrayJoin()](/sql-reference/functions/array-join) 函数，则每一行将被复制，不管 "a" 条件。

## 条件表达式 {#conditional-expression}

```sql
CASE [x]
    WHEN a THEN b
    [WHEN ... THEN ...]
    [ELSE c]
END
```

如果指定了 `x`，则使用 `transform(x, [a, ...], [b, ...], c)` 函数。否则 – `multiIf(a, b, ..., c)`。

如果表达式中没有 `ELSE c` 子句，默认值为 `NULL`。

`transform` 函数不适用于 `NULL`。

## 连接操作符 {#concatenation-operator}

`s1 || s2` – 这个对应的函数是 `concat(s1, s2)`。

## Lambda 创建操作符 {#lambda-creation-operator}

`x -> expr` – 这个对应的函数是 `lambda(x, expr)`。

以下操作符没有优先级，因为它们是括号：

## 数组创建操作符 {#array-creation-operator}

`[x1, ...]` – 这个对应的函数是 `array(x1, ...)`。

## 元组创建操作符 {#tuple-creation-operator}

`(x1, x2, ...)` – 这个对应的函数是 `tuple(x2, x2, ...)`。

## 结合性 {#associativity}

所有二元操作符具有左结合性。例如，`1 + 2 + 3` 转换为 `plus(plus(1, 2), 3)`。
有时这并不会按照您的预期工作。例如，`SELECT 4 > 2 > 3` 将结果为 0。

为了提高效率，`and` 和 `or` 函数接受任意数量的参数。对应的 `AND` 和 `OR` 操作符的链被转换为这些函数的单次调用。

## NULL 检查 {#checking-for-null}

ClickHouse 支持 `IS NULL` 和 `IS NOT NULL` 操作符。

### IS NULL {#is_null}

- 对于 [Nullable](../../sql-reference/data-types/nullable.md) 类型的值，`IS NULL` 操作符返回：
    - `1`，如果值为 `NULL`。
    - 否则返回 `0`。
- 对于其他值，`IS NULL` 操作符始终返回 `0`。

可以通过启用 [optimize_functions_to_subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns) 设置进行优化。使用 `optimize_functions_to_subcolumns = 1` 时，该函数仅读取 [null](../../sql-reference/data-types/nullable.md#finding-null) 子列，而不是读取和处理整个列的数据。查询 `SELECT n IS NULL FROM table` 转换为 `SELECT n.null FROM TABLE`。

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

- 对于 [Nullable](../../sql-reference/data-types/nullable.md) 类型的值，`IS NOT NULL` 操作符返回：
    - `0`，如果值为 `NULL`。
    - 否则返回 `1`。
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

可以通过启用 [optimize_functions_to_subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns) 设置进行优化。使用 `optimize_functions_to_subcolumns = 1` 时，该函数仅读取 [null](../../sql-reference/data-types/nullable.md#finding-null) 子列，而不是读取和处理整个列的数据。查询 `SELECT n IS NOT NULL FROM table` 转换为 `SELECT NOT n.null FROM TABLE`。
