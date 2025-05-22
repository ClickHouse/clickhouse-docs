---
'description': 'Documentation for 数学函数'
'sidebar_label': 'Mathematical'
'sidebar_position': 125
'slug': '/sql-reference/functions/math-functions'
'title': '数学函数'
---


# 数学函数

## e {#e}

返回 $e$ ([欧拉常数](https://en.wikipedia.org/wiki/Euler%27s_constant))。

**语法**

```sql
e()
```

**返回值**

类型: [Float64](../data-types/float.md)。

## pi {#pi}

返回 $\pi$ ([圆周率](https://en.wikipedia.org/wiki/Pi))。

**语法**

```sql
pi()
```
**返回值**

类型: [Float64](../data-types/float.md)。

## exp {#exp}

返回 $e^{x}$，其中 x 是传递给函数的参数。

**语法**

```sql
exp(x)
```

**参数**

- `x` - [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md) 或 [Decimal*](../data-types/decimal.md)。

**示例**

查询:

```sql
SELECT round(exp(-1), 4);
```

结果:

```response
┌─round(exp(-1), 4)─┐
│            0.3679 │
└───────────────────┘
```

**返回值**

类型: [Float*](../data-types/float.md)。

## log {#log}

返回参数的自然对数。

**语法**

```sql
log(x)
```

别名: `ln(x)`

**参数**

- `x` - [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md) 或 [Decimal*](../data-types/decimal.md)。

**返回值**

类型: [Float*](../data-types/float.md)。

## exp2 {#exp2}

返回 2 的给定幂。

**语法**

```sql
exp2(x)
```

**参数**

- `x` - [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md) 或 [Decimal*](../data-types/decimal.md)。

**返回值**

类型: [Float*](../data-types/float.md)。

## intExp2 {#intexp2}

类似于 [`exp`](#exp)，但返回 UInt64。

**语法**

```sql
intExp2(x)
```

## log2 {#log2}

返回参数的二进制对数。

**语法**

```sql
log2(x)
```

**参数**

- `x` - [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md) 或 [Decimal*](../data-types/decimal.md)。

**返回值**

类型: [Float*](../data-types/float.md)。

## exp10 {#exp10}

返回 10 的给定幂。

**语法**

```sql
exp10(x)
```

**参数**

- `x` - [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md) 或 [Decimal*](../data-types/decimal.md)。

**返回值**

类型: [Float*](../data-types/float.md)。

## intExp10 {#intexp10}

类似于 [`exp10`](#exp10)，但返回 UInt64。

**语法**

```sql
intExp10(x)
```

## log10 {#log10}

返回参数的十进制对数。

**语法**

```sql
log10(x)
```

**参数**

- `x` - [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md) 或 [Decimal*](../data-types/decimal.md)。

**返回值**

类型: [Float*](../data-types/float.md)。

## sqrt {#sqrt}

返回参数的平方根。

```sql
sqrt(x)
```

**参数**

- `x` - [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md) 或 [Decimal*](../data-types/decimal.md)。

**返回值**

类型: [Float*](../data-types/float.md)。

## cbrt {#cbrt}

返回参数的立方根。

```sql
cbrt(x)
```

**参数**

- `x` - [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md) 或 [Decimal*](../data-types/decimal.md)。

**返回值**

类型: [Float*](../data-types/float.md)。

## erf {#erf}

如果 `x` 是非负的，则 $erf(\frac{x}{\sigma\sqrt{2}})$ 是随机变量在标准差 $\sigma$ 下，取值与预期值相隔超过 `x` 的概率。

**语法**

```sql
erf(x)
```

**参数**

- `x` - [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md) 或 [Decimal*](../data-types/decimal.md)。

**返回值**

类型: [Float*](../data-types/float.md)。

**示例**

（三个西格玛法则）

```sql
SELECT erf(3 / sqrt(2));
```

```result
┌─erf(divide(3, sqrt(2)))─┐
│      0.9973002039367398 │
└─────────────────────────┘
```

## erfc {#erfc}

返回一个接近 $1-erf(x)$ 的值，且在大 `x` 值时没有精度损失。

**语法**

```sql
erfc(x)
```

**参数**

- `x` - [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md) 或 [Decimal*](../data-types/decimal.md)。

**返回值**

类型: [Float*](../data-types/float.md)。

## lgamma {#lgamma}

返回伽马函数的对数。

**语法**

```sql
lgamma(x)
```

**参数**

- `x` - [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md) 或 [Decimal*](../data-types/decimal.md)。

**返回值**

类型: [Float*](../data-types/float.md)。

## tgamma {#tgamma}

返回伽马函数。

**语法**

```sql
gamma(x)
```

**参数**

- `x` - [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md) 或 [Decimal*](../data-types/decimal.md)。

**返回值**

类型: [Float*](../data-types/float.md)。

## sin {#sin}

返回参数的正弦。

**语法**

```sql
sin(x)
```

**参数**

- `x` - [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md) 或 [Decimal*](../data-types/decimal.md)。

**返回值**

类型: [Float*](../data-types/float.md)。

**示例**

查询:

```sql
SELECT sin(1.23);
```

```response
0.9424888019316975
```

## cos {#cos}

返回参数的余弦。

**语法**

```sql
cos(x)
```

**参数**

- `x` - [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md) 或 [Decimal*](../data-types/decimal.md)。

**返回值**

类型: [Float*](../data-types/float.md)。

## tan {#tan}

返回参数的正切。

**语法**

```sql
tan(x)
```

**参数**

- `x` - [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md) 或 [Decimal*](../data-types/decimal.md)。

**返回值**

类型: [Float*](../data-types/float.md)。

## asin {#asin}

返回参数的反正弦。

**语法**

```sql
asin(x)
```

**参数**

- `x` - [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md) 或 [Decimal*](../data-types/decimal.md)。

**返回值**

类型: [Float*](../data-types/float.md)。

## acos {#acos}

返回参数的反余弦。

**语法**

```sql
acos(x)
```

**参数**

- `x` - [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md) 或 [Decimal*](../data-types/decimal.md)。

**返回值**

类型: [Float*](../data-types/float.md)。

## atan {#atan}

返回参数的反正切。

**语法**

```sql
atan(x)
```

**参数**

- `x` - [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md) 或 [Decimal*](../data-types/decimal.md)。

**返回值**

类型: [Float*](../data-types/float.md)。

## pow {#pow}

返回 $x^y$。

**语法**

```sql
pow(x, y)
```

别名: `power(x, y)`

**参数**

- `x` - [(U)Int8/16/32/64](../data-types/int-uint.md)、[Float*](../data-types/float.md) 或 [Decimal*](../data-types/decimal.md)
- `y` - [(U)Int8/16/32/64](../data-types/int-uint.md)、[Float*](../data-types/float.md) 或 [Decimal*](../data-types/decimal.md)

**返回值**

类型: [Float64](../data-types/float.md)。

## cosh {#cosh}

返回参数的[双曲余弦](https://in.mathworks.com/help/matlab/ref/cosh.html)。

**语法**

```sql
cosh(x)
```

**参数**

- `x` — 角度，以弧度为单位。区间内的值: $-\infty \lt x \lt +\infty$。[(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md) 或 [Decimal*](../data-types/decimal.md)。

**返回值**

- 区间内的值: $1 \le cosh(x) \lt +\infty$。

类型: [Float64](/sql-reference/data-types/float)。

**示例**

```sql
SELECT cosh(0);
```

结果:

```result
┌─cosh(0)──┐
│        1 │
└──────────┘
```

## acosh {#acosh}

返回[反双曲余弦](https://www.mathworks.com/help/matlab/ref/acosh.html)。

**语法**

```sql
acosh(x)
```

**参数**

- `x` — 角度的双曲余弦。区间内的值: $1 \le x \lt +\infty$。[(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md) 或 [Decimal*](../data-types/decimal.md)。

**返回值**

- 角度，以弧度为单位。区间内的值: $0 \le acosh(x) \lt +\infty$。

类型: [Float64](/sql-reference/data-types/float)。

**示例**

```sql
SELECT acosh(1);
```

结果:

```result
┌─acosh(1)─┐
│        0 │
└──────────┘
```

## sinh {#sinh}

返回[双曲正弦](https://www.mathworks.com/help/matlab/ref/sinh.html)。

**语法**

```sql
sinh(x)
```

**参数**

- `x` — 角度，以弧度为单位。区间内的值: $-\infty \lt x \lt +\infty$。[(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md) 或 [Decimal*](../data-types/decimal.md)。

**返回值**

- 区间内的值: $-\infty \lt sinh(x) \lt +\infty$。

类型: [Float64](/sql-reference/data-types/float)。

**示例**

```sql
SELECT sinh(0);
```

结果:

```result
┌─sinh(0)──┐
│        0 │
└──────────┘
```

## asinh {#asinh}

返回[反双曲正弦](https://www.mathworks.com/help/matlab/ref/asinh.html)。

**语法**

```sql
asinh(x)
```

**参数**

- `x` — 角度的双曲正弦。区间内的值: $-\infty \lt x \lt +\infty$。[(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md) 或 [Decimal*](../data-types/decimal.md)。

**返回值**

- 角度，以弧度为单位。区间内的值: $-\infty \lt asinh(x) \lt +\infty$。

类型: [Float64](/sql-reference/data-types/float)。

**示例**

```sql
SELECT asinh(0);
```

结果:

```result
┌─asinh(0)─┐
│        0 │
└──────────┘
```

## tanh {#tanh}

返回[双曲正切](https://www.mathworks.com/help/matlab/ref/tanh.html)。

**语法**

```sql
tanh(x)
```

**参数**

- `x` — 角度，以弧度为单位。区间内的值: $-\infty \lt x \lt +\infty$。[(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md) 或 [Decimal*](../data-types/decimal.md)。

**返回值**

- 区间内的值: $-1 \lt tanh(x) \lt 1$。

类型: [Float*](/sql-reference/data-types/float)。

**示例**

```sql
SELECT tanh(0);
```

结果:

```result
0
```

## atanh {#atanh}

返回[反双曲正切](https://www.mathworks.com/help/matlab/ref/atanh.html)。

**语法**

```sql
atanh(x)
```

**参数**

- `x` — 角度的双曲正切。区间内的值: $-1 \lt x \lt 1$。[(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md) 或 [Decimal*](../data-types/decimal.md)。

**返回值**

- 角度，以弧度为单位。区间内的值: $-\infty \lt atanh(x) \lt +\infty$。

类型: [Float64](/sql-reference/data-types/float)。

**示例**

```sql
SELECT atanh(0);
```

结果:

```result
┌─atanh(0)─┐
│        0 │
└──────────┘
```

## atan2 {#atan2}

返回[atan2](https://en.wikipedia.org/wiki/Atan2)，作为在欧几里得平面中，正 x 轴与射线到点 `(x, y) ≠ (0, 0)` 之间的角度，以弧度计。

**语法**

```sql
atan2(y, x)
```

**参数**

- `y` — 射线经过的点的 y 坐标。[(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md) 或 [Decimal*](../data-types/decimal.md)。
- `x` — 射线经过的点的 x 坐标。[(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md) 或 [Decimal*](../data-types/decimal.md)。

**返回值**

- 角度 `θ`，使得 $-\pi \lt 0 \le \pi$，以弧度计。

类型: [Float64](/sql-reference/data-types/float)。

**示例**

```sql
SELECT atan2(1, 1);
```

结果:

```result
┌────────atan2(1, 1)─┐
│ 0.7853981633974483 │
└────────────────────┘
```

## hypot {#hypot}

返回直角三角形的斜边长度。[Hypot](https://en.wikipedia.org/wiki/Hypot) 避免在平方非常大的或非常小的数字时出现的问题。

**语法**

```sql
hypot(x, y)
```

**参数**

- `x` — 直角三角形的第一条直角边。[(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md) 或 [Decimal*](../data-types/decimal.md)。
- `y` — 直角三角形的第二条直角边。[(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md) 或 [Decimal*](../data-types/decimal.md)。

**返回值**

- 直角三角形的斜边长度。

类型: [Float64](/sql-reference/data-types/float)。

**示例**

```sql
SELECT hypot(1, 1);
```

结果:

```result
┌────────hypot(1, 1)─┐
│ 1.4142135623730951 │
└────────────────────┘
```

## log1p {#log1p}

计算 `log(1+x)`。对于小的 x 值，[计算](https://en.wikipedia.org/wiki/Natural_logarithm#lnp1) `log1p(x)` 比 `log(1+x)` 更精确。

**语法**

```sql
log1p(x)
```

**参数**

- `x` — 区间内的值: $-1 \lt x \lt +\infty$。[(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md) 或 [Decimal*](../data-types/decimal.md)。

**返回值**

- 区间内的值: $-\infty < log1p(x) \lt +\infty$。

类型: [Float64](/sql-reference/data-types/float)。

**示例**

```sql
SELECT log1p(0);
```

结果:

```result
┌─log1p(0)─┐
│        0 │
└──────────┘
```

## sign {#sign}

返回实数的符号。

**语法**

```sql
sign(x)
```

**参数**

- `x` — 值在 $-\infty$ 到 $+\infty$ 之间。支持 ClickHouse 中的所有数值类型。

**返回值**

- 当 `x < 0` 时返回 -1
- 当 `x = 0` 时返回 0
- 当 `x > 0` 时返回 1

类型: [Int8](../data-types/int-uint.md)。

**示例**

零值的符号：

```sql
SELECT sign(0);
```

结果:

```result
┌─sign(0)─┐
│       0 │
└─────────┘
```

正值的符号：

```sql
SELECT sign(1);
```

结果:

```result
┌─sign(1)─┐
│       1 │
└─────────┘
```

负值的符号：

```sql
SELECT sign(-1);
```

结果:

```result
┌─sign(-1)─┐
│       -1 │
└──────────┘
```

## sigmoid {#sigmoid}

返回[ sigmoid 函数](https://en.wikipedia.org/wiki/Sigmoid_function)。

**语法**

```sql
sigmoid(x)
```

**参数**

- `x` — 输入值。区间内的值: $-\infty \lt x \lt +\infty$。[(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md) 或 [Decimal*](../data-types/decimal.md)。

**返回值**

- 在 sigmoid 曲线上的对应值，范围在 0 到 1 之间。[Float64](../data-types/float.md)。

**示例**

查询:

```sql
SELECT round(sigmoid(x), 5) FROM (SELECT arrayJoin([-1, 0, 1]) AS x);
```

结果:

```result
0.26894
0.5
0.73106
```

## degrees {#degrees}

将弧度转换为度数。

**语法**

```sql
degrees(x)
```

**参数**

- `x` — 输入，单位为弧度。[(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md) 或 [Decimal*](../data-types/decimal.md)。
- `x` — 输入，单位为弧度。[(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md) 或 [Decimal*](../data-types/decimal.md)。  

**返回值**

- 以度为单位的值。 [Float64](/sql-reference/data-types/float)。

**示例**

```sql
SELECT degrees(3.141592653589793);
```

结果:

```result
┌─degrees(3.141592653589793)─┐
│                        180 │
└────────────────────────────┘
```

## radians {#radians}

将度数转换为弧度。

**语法**

```sql
radians(x)
```

**参数**

- `x` — 输入，单位为度数。[(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md) 或 [Decimal*](../data-types/decimal.md)。

**返回值**

- 以弧度为单位的值。

类型: [Float64](/sql-reference/data-types/float)。

**示例**

```sql
SELECT radians(180);
```

结果:

```result
┌──────radians(180)─┐
│ 3.141592653589793 │
└───────────────────┘
```

## factorial {#factorial}

计算整数值的阶乘。适用于包括 UInt(8|16|32|64) 和 Int(8|16|32|64) 在内的任何原生整数类型。返回类型为 UInt64。

0 的阶乘为 1。同样，factorial() 函数对于任何负值返回 1。输入参数的最大正值为 20，21 或更大的值将导致异常抛出。

**语法**

```sql
factorial(n)
```

**示例**

```sql
SELECT factorial(10);
```

结果:

```result
┌─factorial(10)─┐
│       3628800 │
└───────────────┘
```

## width_bucket {#width_bucket}

返回在具有 `count` 个等宽桶的直方图中 `operand` 所在的桶的编号，桶的范围从 `low` 到 `high`。如果 `operand < low` 返回 `0`，如果 `operand >= high` 返回 `count+1`。

`operand`、`low`、`high` 可以是任何原生数字类型。`count` 只能是无符号的原生整数，并且其值不能为零。

**语法**

```sql
widthBucket(operand, low, high, count)
```
别名: `WIDTH_BUCKET`

**示例**

```sql
SELECT widthBucket(10.15, -8.6, 23, 18);
```

结果:

```result
┌─widthBucket(10.15, -8.6, 23, 18)─┐
│                               11 │
└──────────────────────────────────┘
```

## proportionsZTest {#proportionsztest}

返回两个比例 Z 检验的测试统计量 - 用于比较两个人口 `x` 和 `y` 的比例的统计检验。

**语法**

```sql
proportionsZTest(successes_x, successes_y, trials_x, trials_y, conf_level, pool_type)
```

**参数**

- `successes_x`: 人口 `x` 中成功次数。 [UInt64](../data-types/int-uint.md)。
- `successes_y`: 人口 `y` 中成功次数。 [UInt64](../data-types/int-uint.md)。
- `trials_x`: 人口 `x` 中的试验次数。 [UInt64](../data-types/int-uint.md)。
- `trials_y`: 人口 `y` 中的试验次数。 [UInt64](../data-types/int-uint.md)。
- `conf_level`: 检验的置信水平。 [Float64](../data-types/float.md)。
- `pool_type`: 选择池化（估计标准误差的方式）。可以是 `unpooled` 或 `pooled`。 [String](../data-types/string.md)。 

:::note
对于参数 `pool_type`: 在池化版本中，两个比例被平均，只有一个比例用于估计标准误差。在非池化版本中，两个比例单独使用。
:::

**返回值**

- `z_stat`: Z 统计量。 [Float64](../data-types/float.md)。
- `p_val`: P 值。 [Float64](../data-types/float.md)。
- `ci_low`: 下置信区间。 [Float64](../data-types/float.md)。
- `ci_high`: 上置信区间。 [Float64](../data-types/float.md)。

**示例**

查询:

```sql
SELECT proportionsZTest(10, 11, 100, 101, 0.95, 'unpooled');
```

结果:

```response
┌─proportionsZTest(10, 11, 100, 101, 0.95, 'unpooled')───────────────────────────────┐
│ (-0.20656724435948853,0.8363478437079654,-0.09345975390115283,0.07563797172293502) │
└────────────────────────────────────────────────────────────────────────────────────┘
```
