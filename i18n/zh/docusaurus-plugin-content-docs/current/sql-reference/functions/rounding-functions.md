---
'description': 'Documentation for Rounding Functions'
'sidebar_label': 'Rounding'
'sidebar_position': 155
'slug': '/sql-reference/functions/rounding-functions'
'title': 'Rounding Functions'
---




# 四舍五入函数

## floor {#floor}

返回小于或等于 `x` 的最大整数。
一个整数是 1 / 10 * N 的倍数，或者如果 1 / 10 * N 不是精确的，则是适当数据类型的最近数字。

整数参数可以用负的 `N` 参数进行四舍五入，对于非负的 `N`，函数返回 `x`，即什么都不做。

如果四舍五入导致溢出（例如，`floor(-128, -1)`），结果是未定义的。

**语法**

```sql
floor(x[, N])
```

**参数**

- `x` - 要四舍五入的值。 [Float*](../data-types/float.md)， [Decimal*](../data-types/decimal.md) 或 [(U)Int*](../data-types/int-uint.md)。
- `N` . [(U)Int*](../data-types/int-uint.md)。 默认值为零，表示四舍五入到整数。可以为负数。

**返回值**

返回与 `x` 相同类型的四舍五入数字。

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

与 `floor` 类似，但返回大于或等于 `x` 的最小整数。

**语法**

```sql
ceiling(x[, N])
```

别名：`ceil`

## truncate {#truncate}

与 `floor` 类似，但返回具有最大绝对值且绝对值小于或等于 `x` 的整数。

**语法**

```sql
truncate(x[, N])
```

别名：`trunc`。

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

该函数返回指定顺序的最近数字。
如果输入值与两个邻近数字的距离相等，则函数对 [Float*](../data-types/float.md) 输入使用银行家舍入法，对其他数字类型（[Decimal*](../data-types/decimal.md)）则远离零进行四舍五入。

**语法**

```sql
round(x[, N])
```

**参数**

- `x` — 要四舍五入的数字。 [Float*](../data-types/float.md)， [Decimal*](../data-types/decimal.md) 或 [(U)Int*](../data-types/int-uint.md)。
- `N` — 要四舍五入到的小数位数。 整数。 默认为 `0`。
    - 如果 `N > 0`，函数在小数点右侧进行四舍五入。
    - 如果 `N < 0`，函数在小数点左侧进行四舍五入。
    - 如果 `N = 0`，函数四舍五入到下一个整数。

**返回值：**

返回与 `x` 相同类型的四舍五入数字。

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

要保留尾随零，请启用设置 `output_format_decimal_trailing_zeros`：

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

四舍五入为最近数字的示例：

```text
round(3.2, 0) = 3
round(4.1267, 2) = 4.13
round(22,-1) = 20
round(467,-2) = 500
round(-467,-2) = -500
```

银行家舍入法。

```text
round(3.5) = 4
round(4.5) = 4
round(3.55, 1) = 3.6
round(3.65, 1) = 3.6
```

**另见**

- [roundBankers](#roundbankers)

## roundBankers {#roundbankers}

将数字四舍五入到指定的小数位置。

如果四舍五入的数字位于两个数字之间的中间，则该函数使用银行家舍入法。
银行家舍入是一种对分数数字进行舍入的方法。
当四舍五入的数字位于两个数字之间的中间时，它会舍入到指定小数位置的最近偶数位数字。
例如：3.5 向上舍入为 4，2.5 向下舍入为 2。
这是在 [IEEE 754](https://en.wikipedia.org/wiki/IEEE_754#Roundings_to_nearest) 中定义的浮点数的默认舍入方法。
[round](#round) 函数对浮点数执行相同的舍入。
`roundBankers` 函数对整数的舍入方式也相同，例如，`roundBankers(45, -1) = 40`。

在其他情况下，该函数将数字四舍五入到最近的整数。

使用银行家舍入法，您可以减少四舍五入数字对这些数字的求和或减法结果的影响。

例如，将数字 1.5、2.5、3.5、4.5 相加，不同的舍入效果如下：

- 无舍入：1.5 + 2.5 + 3.5 + 4.5 = 12。
- 银行家舍入：2 + 2 + 4 + 4 = 12。
- 四舍五入到最近整数：2 + 3 + 4 + 5 = 14。

**语法**

```sql
roundBankers(x [, N])
```

**参数**

- `N > 0` — 函数将数字四舍五入到小数点右侧的给定位置。 示例：`roundBankers(3.55, 1) = 3.6`。
- `N < 0` — 函数将数字四舍五入到小数点左侧的给定位置。 示例：`roundBankers(24.55, -1) = 20`。
- `N = 0` — 函数将数字四舍五入为整数。在这种情况下，可以省略参数。 示例：`roundBankers(2.5) = 2`。

- `x` — 要四舍五入的数字。 [Float*](../data-types/float.md)， [Decimal*](../data-types/decimal.md) 或 [(U)Int*](../data-types/int-uint.md)。
- `N` — 要四舍五入到的小数位数。 整数。 默认为 `0`。
    - 如果 `N > 0`，函数在小数点右侧进行四舍五入。
    - 如果 `N < 0`，函数在小数点左侧进行四舍五入。
    - 如果 `N = 0`，函数四舍五入到下一个整数。

**返回值**

按银行家舍入法舍入的值。

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

**另见**

- [round](#round)

## roundToExp2 {#roundtoexp2}

接受一个数字。如果该数字小于 1，则返回 `0`。否则，将数字向下四舍五入到最接近的（非负整数）2 的幂。

**语法**

```sql
roundToExp2(num)
```

**参数**

- `num`: 要四舍五入的数字。 [UInt](../data-types/int-uint.md)/[Float](../data-types/float.md)。

**返回值**

- `0`，对于 `num` $\lt 1$。 [UInt8](../data-types/int-uint.md)。
- `num` 向下四舍五入到最接近的（非负整数）2 的幂。 [UInt](../data-types/int-uint.md)/[Float](../data-types/float.md) 等同于输入类型。

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

接受一个数字。如果该数字小于 1，则返回 `0`。否则，将数字向下四舍五入到常用持续时间的集合中的数字：`1, 10, 30, 60, 120, 180, 240, 300, 600, 1200, 1800, 3600, 7200, 18000, 36000`。

**语法**

```sql
roundDuration(num)
```

**参数**

- `num`: 要四舍五入到常用持续时间集合中的某个数字。 [UInt](../data-types/int-uint.md)/[Float](../data-types/float.md)。

**返回值**

- `0`，对于 `num` $\lt 1$。
- 否则，返回：`1, 10, 30, 60, 120, 180, 240, 300, 600, 1200, 1800, 3600, 7200, 18000, 36000` 中的一个。 [UInt16](../data-types/int-uint.md)。

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

接受一个在各种常用人类年龄范围内的数字，并返回该范围内的最大或最小值。

**语法**

```sql
roundAge(num)
```

**参数**

- `age`: 表示年龄（以年为单位）的数字。 [UInt](../data-types/int-uint.md)/[Float](../data-types/float.md)。

**返回值**

- 返回 `0`，对于 $age \lt 1$。
- 返回 `17`，对于 $1 \leq age \leq 17$。
- 返回 `18`，对于 $18 \leq age \leq 24$。
- 返回 `25`，对于 $25 \leq age \leq 34$。
- 返回 `35`，对于 $35 \leq age \leq 44$。
- 返回 `45`，对于 $45 \leq age \leq 54$。
- 返回 `55`，对于 $age \geq 55$。

类型：[UInt8](../data-types/int-uint.md)。

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

接受一个数字，并将其向下舍入到指定数组中的元素。如果值小于下限，则返回下限。

**语法**

```sql
roundDown(num, arr)
```

**参数**

- `num`: 要向下舍入的数字。 [Numeric](../data-types/int-uint.md)。
- `arr`: 要将 `age` 向下舍入到的元素数组。 [Array](../data-types/array.md) 类型的 [UInt](../data-types/int-uint.md)/[Float](../data-types/float.md) 数组。

**返回值**

- 向下舍入到 `arr` 中某个元素的数字。如果值小于下限，则返回下限。 [UInt](../data-types/int-uint.md)/[Float](../data-types/float.md) 类型根据 `arr` 的类型推断得出。

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
