---
'description': 'Rounding Functions 的文档'
'sidebar_label': '四舍五入'
'sidebar_position': 155
'slug': '/sql-reference/functions/rounding-functions'
'title': '四舍五入函数'
---


# 四舍五入函数

## floor {#floor}

返回不大于 `x` 的最大整除数。
整除数是 1 / 10 * N 的倍数，或者在 1 / 10 * N 不准确时的数据类型的最近值。

整数参数可以用负的 `N` 参数进行整除，使用非负的 `N` 时，函数返回 `x`，即不执行任何操作。

如果整除导致溢出（例如 `floor(-128, -1)`），结果是不确定的。

**语法**

```sql
floor(x[, N])
```

**参数**

- `x` - 要四舍五入的值。 [Float*](../data-types/float.md), [Decimal*](../data-types/decimal.md), 或 [(U)Int*](../data-types/int-uint.md)。
- `N` . [(U)Int*](../data-types/int-uint.md)。 默认值为零，意味着四舍五入到整数。 可以是负数。

**返回值**

与 `x` 相同类型的整除数。

**示例**

查询：

```sql
SELECT floor(123.45, 1) AS rounded
```

结果：

```response
┌─rounded─┐
│   123.4 │
└─────────┘
```

查询：

```sql
SELECT floor(123.45, -1)
```

结果：

```response
┌─rounded─┐
│     120 │
└─────────┘
```

## ceiling {#ceiling}

类似于 `floor`，但是返回不小于 `x` 的最小整除数。

**语法**

```sql
ceiling(x[, N])
```

别名: `ceil`

## truncate {#truncate}

类似于 `floor`，但是返回绝对值最大的整除数，该绝对值小于或等于 `x` 的绝对值。

**语法**

```sql
truncate(x[, N])
```

别名: `trunc`。

**示例**

查询：

```sql
SELECT truncate(123.499, 1) as res;
```

```response
┌───res─┐
│ 123.4 │
└───────┘
```

## round {#round}

将值四舍五入到指定的小数位数。

该函数返回指定阶数的最近值。
如果输入值与两个相邻数的距离相等，函数对 [Float*](../data-types/float.md) 输入使用银行家舍入，对其他数字类型 ([Decimal*](../data-types/decimal.md)) 采用远离零的舍入。

**语法**

```sql
round(x[, N])
```

**参数**

- `x` — 需要四舍五入的数字。 [Float*](../data-types/float.md), [Decimal*](../data-types/decimal.md), 或 [(U)Int*](../data-types/int-uint.md)。
- `N` — 要四舍五入的小数位数。 整数。 默认值为 `0`。
    - 如果 `N > 0`，函数四舍五入到小数点的右侧。
    - 如果 `N < 0`，函数四舍五入到小数点的左侧。
    - 如果 `N = 0`，函数四舍五入到下一个整数。

**返回值:**

与 `x` 相同类型的整除数。

**示例**

使用 `Float` 输入的示例：

```sql
SELECT number / 2 AS x, round(x) FROM system.numbers LIMIT 3;
```

```response
┌───x─┬─round(divide(number, 2))─┐
│   0 │                        0 │
│ 0.5 │                        0 │
│   1 │                        1 │
└─────┴──────────────────────────┘
```

使用 `Decimal` 输入的示例：

```sql
SELECT cast(number / 2 AS  Decimal(10,4)) AS x, round(x) FROM system.numbers LIMIT 3;
```

```sql
┌───x─┬─round(CAST(divide(number, 2), 'Decimal(10, 4)'))─┐
│   0 │                                                0 │
│ 0.5 │                                                1 │
│   1 │                                                1 │
└─────┴──────────────────────────────────────────────────┘
```

要保留尾随零，启用设置 `output_format_decimal_trailing_zeros`：

```sql
SELECT cast(number / 2 AS  Decimal(10,4)) AS x, round(x) FROM system.numbers LIMIT 3 settings output_format_decimal_trailing_zeros=1;

```

```sql
┌──────x─┬─round(CAST(divide(number, 2), 'Decimal(10, 4)'))─┐
│ 0.0000 │                                           0.0000 │
│ 0.5000 │                                           1.0000 │
│ 1.0000 │                                           1.0000 │
└────────┴──────────────────────────────────────────────────┘
```

四舍五入至最近数的示例：

```text
round(3.2, 0) = 3
round(4.1267, 2) = 4.13
round(22,-1) = 20
round(467,-2) = 500
round(-467,-2) = -500
```

银行家舍入。

```text
round(3.5) = 4
round(4.5) = 4
round(3.55, 1) = 3.6
round(3.65, 1) = 3.6
```

**另请参见**

- [roundBankers](#roundbankers)

## roundBankers {#roundbankers}

将数字四舍五入到指定的小数位。

如果舍入的数字正好位于两个数之间，函数使用银行家舍入。
银行家舍入是一种舍入分数数字的方法
当舍入数字位于两个数字之间时，它会舍入到指定小数位上的最近偶数。
例如：3.5 舍入到 4，2.5 舍入到 2。
这是在 [IEEE 754](https://en.wikipedia.org/wiki/IEEE_754#Roundings_to_nearest) 中定义的浮点数的默认舍入方法。
[round](#round) 函数对浮点数执行相同的舍入。
`roundBankers` 函数也以相同的方式对整数进行舍入，例如，`roundBankers(45, -1) = 40`。

在其他情况下，函数将数字舍入到最近的整数。

使用银行家舍入，您可以减少舍入数字对这些数字的求和或减法的结果的影响。

例如，将数字 1.5, 2.5, 3.5, 4.5 相加，用不同的舍入方法：

- 不舍入：1.5 + 2.5 + 3.5 + 4.5 = 12。
- 银行家舍入：2 + 2 + 4 + 4 = 12。
- 舍入到最近整数：2 + 3 + 4 + 5 = 14。

**语法**

```sql
roundBankers(x [, N])
```

**参数**

    - `N > 0` — 函数将数字舍入到小数点右侧的给定位置。 示例：`roundBankers(3.55, 1) = 3.6`。
    - `N < 0` — 函数将数字舍入到小数点左侧的给定位置。 示例：`roundBankers(24.55, -1) = 20`。
    - `N = 0` — 函数将数字舍入到整数。在这种情况下，可以省略参数。 示例：`roundBankers(2.5) = 2`。

- `x` — 需要四舍五入的数字。 [Float*](../data-types/float.md), [Decimal*](../data-types/decimal.md), 或 [(U)Int*](../data-types/int-uint.md)。
- `N` — 要四舍五入的小数位数。 整数。 默认值为 `0`。
    - 如果 `N > 0`，函数四舍五入到小数点的右侧。
    - 如果 `N < 0`，函数四舍五入到小数点的左侧。
    - 如果 `N = 0`，函数四舍五入到下一个整数。

**返回值**

使用银行家舍入方法舍入的值。

**示例**

查询：

```sql
SELECT number / 2 AS x, roundBankers(x, 0) AS b fROM system.numbers limit 10
```

结果：

```response
┌───x─┬─b─┐
│   0 │ 0 │
│ 0.5 │ 0 │
│   1 │ 1 │
│ 1.5 │ 2 │
│   2 │ 2 │
│ 2.5 │ 2 │
│   3 │ 3 │
│ 3.5 │ 4 │
│   4 │ 4 │
│ 4.5 │ 4 │
└─────┴───┘
```

银行家舍入的示例：

```response
roundBankers(0.4) = 0
roundBankers(-3.5) = -4
roundBankers(4.5) = 4
roundBankers(3.55, 1) = 3.6
roundBankers(3.65, 1) = 3.6
roundBankers(10.35, 1) = 10.4
roundBankers(10.755, 2) = 10.76
```

**另请参见**

- [round](#round)

## roundToExp2 {#roundtoexp2}

接受一个数字。如果该数字小于一，则返回 `0`。否则，将数字舍入到最近的（非负的）两个的整数次幂。

**语法**

```sql
roundToExp2(num)
```

**参数**

- `num`: 需要四舍五入的数字。 [UInt](../data-types/int-uint.md)/[Float](../data-types/float.md)。

**返回值**

- 当 `num` $\lt 1$ 时返回 `0`。 [UInt8](../data-types/int-uint.md)。
- `num` 四舍五入到最近的（非负的）两个的整数次幂。 [UInt](../data-types/int-uint.md)/[Float](../data-types/float.md) 与输入类型相同。

**示例**

查询：

```sql
SELECT *, roundToExp2(*) FROM system.numbers WHERE number IN (0, 2, 5, 10, 19, 50)
```

结果：

```response
┌─number─┬─roundToExp2(number)─┐
│      0 │                   0 │
│      2 │                   2 │
│      5 │                   4 │
│     10 │                   8 │
│     19 │                  16 │
│     50 │                  32 │
└────────┴─────────────────────┘
```

## roundDuration {#roundduration}

接受一个数字。如果该数字小于一，则返回 `0`。否则，将数字四舍五入到常用持续时间集合中的数字：`1, 10, 30, 60, 120, 180, 240, 300, 600, 1200, 1800, 3600, 7200, 18000, 36000`。

**语法**

```sql
roundDuration(num)
```

**参数**

- `num`: 需要四舍五入到常用持续时间集合中的数字。 [UInt](../data-types/int-uint.md)/[Float](../data-types/float.md)。

**返回值**

- 当 `num` $\lt 1$ 时返回 `0`。
- 否则，返回一个： `1, 10, 30, 60, 120, 180, 240, 300, 600, 1200, 1800, 3600, 7200, 18000, 36000`。 [UInt16](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT *, roundDuration(*) FROM system.numbers WHERE number IN (0, 9, 19, 47, 101, 149, 205, 271, 421, 789, 1423, 2345, 4567, 9876, 24680, 42573)
```

结果：

```response
┌─number─┬─roundDuration(number)─┐
│      0 │                     0 │
│      9 │                     1 │
│     19 │                    10 │
│     47 │                    30 │
│    101 │                    60 │
│    149 │                   120 │
│    205 │                   180 │
│    271 │                   240 │
│    421 │                   300 │
│    789 │                   600 │
│   1423 │                  1200 │
│   2345 │                  1800 │
│   4567 │                  3600 │
│   9876 │                  7200 │
│  24680 │                 18000 │
│  42573 │                 36000 │
└────────┴───────────────────────┘
```

## roundAge {#roundage}

接受一个数字，该数字在常用的人类年龄范围内，并返回该范围内的最大值或最小值。

**语法**

```sql
roundAge(num)
```

**参数**

- `age`: 表示岁数的数字。 [UInt](../data-types/int-uint.md)/[Float](../data-types/float.md)。

**返回值**

- 当 $age \lt 1$ 时返回 `0`。
- 当 $1 \leq age \leq 17$ 时返回 `17`。
- 当 $18 \leq age \leq 24$ 时返回 `18`。
- 当 $25 \leq age \leq 34$ 时返回 `25`。
- 当 $35 \leq age \leq 44$ 时返回 `35`。
- 当 $45 \leq age \leq 54$ 时返回 `45`。
- 当 $age \geq 55$ 时返回 `55`。

类型: [UInt8](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT *, roundAge(*) FROM system.numbers WHERE number IN (0, 5, 20, 31, 37, 54, 72);
```

结果：

```response
┌─number─┬─roundAge(number)─┐
│      0 │                0 │
│      5 │               17 │
│     20 │               18 │
│     31 │               25 │
│     37 │               35 │
│     54 │               45 │
│     72 │               55 │
└────────┴──────────────────┘
```

## roundDown {#rounddown}

接受一个数字，并将其取整到指定数组中的一个元素。如果值小于下限，则返回下限。

**语法**

```sql
roundDown(num, arr)
```

**参数**

- `num`: 需要向下舍入的数字。 [Numeric](../data-types/int-uint.md)。
- `arr`: 要将 `age` 向下舍入到的元素数组。 [Array](../data-types/array.md) 类型为 [UInt](../data-types/int-uint.md)/[Float](../data-types/float.md)。

**返回值**

- 向下舍入到 `arr` 中元素的数字。如果值小于下限，则返回下限。 [UInt](../data-types/int-uint.md)/[Float](../data-types/float.md) 的类型根据 `arr` 的类型推断。

**示例**

查询：

```sql
SELECT *, roundDown(*, [3, 4, 5]) FROM system.numbers WHERE number IN (0, 1, 2, 3, 4, 5)
```

结果：

```response
┌─number─┬─roundDown(number, [3, 4, 5])─┐
│      0 │                            3 │
│      1 │                            3 │
│      2 │                            3 │
│      3 │                            3 │
│      4 │                            4 │
│      5 │                            5 │
└────────┴──────────────────────────────┘
```

<!-- 
The inner content of the tags below are replaced at doc framework build time with 
docs generated from system.functions. Please do not modify or remove the tags.
See: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
-->

<!--AUTOGENERATED_START-->
<!--AUTOGENERATED_END-->
