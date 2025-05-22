
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

查询：

```sql
SELECT round(exp(-1), 4);
```

结果：

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

返回给定参数的 2 次幂

**语法**

```sql
exp2(x)
```

**参数**

- `x` - [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md) 或 [Decimal*](../data-types/decimal.md)。

**返回值**

类型: [Float*](../data-types/float.md)。

## intExp2 {#intexp2}

类似于 [`exp`](#exp)，但返回一个 UInt64。

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

返回给定参数的 10 次幂。

**语法**

```sql
exp10(x)
```

**参数**

- `x` - [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md) 或 [Decimal*](../data-types/decimal.md)。

**返回值**

类型: [Float*](../data-types/float.md)。

## intExp10 {#intexp10}

类似于 [`exp10`](#exp10)，但返回一个 UInt64。

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

如果 `x` 为非负，则 $erf(\frac{x}{\sigma\sqrt{2}})$ 是具有标准差 $\sigma$ 的正态分布的随机变量大于预期值与 `x` 之间的距离的概率。

**语法**

```sql
erf(x)
```

**参数**

- `x` - [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md) 或 [Decimal*](../data-types/decimal.md)。

**返回值**

类型: [Float*](../data-types/float.md)。

**示例**

（三西格玛法则）

```sql
SELECT erf(3 / sqrt(2));
```

```result
┌─erf(divide(3, sqrt(2)))─┐
│      0.9973002039367398 │
└─────────────────────────┘
```

## erfc {#erfc}

返回一个接近于 $1-erf(x)$ 的数，在大 `x` 值的情况下保留精度。

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

返回参数的正弦值。

**语法**

```sql
sin(x)
```

**参数**

- `x` - [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md) 或 [Decimal*](../data-types/decimal.md)。

**返回值**

类型: [Float*](../data-types/float.md)。

**示例**

查询：

```sql
SELECT sin(1.23);
```

```response
0.9424888019316975
```

## cos {#cos}

返回参数的余弦值。

**语法**

```sql
cos(x)
```

**参数**

- `x` - [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md) 或 [Decimal*](../data-types/decimal.md)。

**返回值**

类型: [Float*](../data-types/float.md)。

## tan {#tan}

返回参数的正切值。

**语法**

```sql
tan(x)
```

**参数**

- `x` - [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md) 或 [Decimal*](../data-types/decimal.md)。

**返回值**

类型: [Float*](../data-types/float.md)。

## asin {#asin}

返回参数的反正弦值。

**语法**

```sql
asin(x)
```

**参数**

- `x` - [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md) 或 [Decimal*](../data-types/decimal.md)。

**返回值**

类型: [Float*](../data-types/float.md)。

## acos {#acos}

返回参数的反余弦值。

**语法**

```sql
acos(x)
```

**参数**

- `x` - [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md) 或 [Decimal*](../data-types/decimal.md)。

**返回值**

类型: [Float*](../data-types/float.md)。

## atan {#atan}

返回参数的反正切值。

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

返回参数的[双曲余弦](https://in.mathworks.com/help/matlab/ref/cosh.html)值。

**语法**

```sql
cosh(x)
```

**参数**

- `x` — 角度，单位为弧度。值在区间：$-\infty \lt x \lt +\infty$。[(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md) 或 [Decimal*](../data-types/decimal.md)。

**返回值**

- 值在区间：$1 \le cosh(x) \lt +\infty$。

类型: [Float64](/sql-reference/data-types/float)。

**示例**

```sql
SELECT cosh(0);
```

结果：

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

- `x` — 角度的双曲余弦。值在区间：$1 \le x \lt +\infty$。[(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md) 或 [Decimal*](../data-types/decimal.md)。

**返回值**

- 角度，单位为弧度。值在区间：$0 \le acosh(x) \lt +\infty$。

类型: [Float64](/sql-reference/data-types/float)。

**示例**

```sql
SELECT acosh(1);
```

结果：

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

- `x` — 角度，单位为弧度。值在区间：$-\infty \lt x \lt +\infty$。[(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md) 或 [Decimal*](../data-types/decimal.md)。

**返回值**

- 值在区间：$-\infty \lt sinh(x) \lt +\infty$。

类型: [Float64](/sql-reference/data-types/float)。

**示例**

```sql
SELECT sinh(0);
```

结果：

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

- `x` — 角度的双曲正弦。值在区间：$-\infty \lt x \lt +\infty$。[(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md) 或 [Decimal*](../data-types/decimal.md)。

**返回值**

- 角度，单位为弧度。值在区间：$-\infty \lt asinh(x) \lt +\infty$。

类型: [Float64](/sql-reference/data-types/float)。

**示例**

```sql
SELECT asinh(0);
```

结果：

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

- `x` — 角度，单位为弧度。值在区间：$-\infty \lt x \lt +\infty$。[(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md) 或 [Decimal*](../data-types/decimal.md)。

**返回值**

- 值在区间：$-1 \lt tanh(x) \lt 1$。

类型: [Float*](/sql-reference/data-types/float)。

**示例**

```sql
SELECT tanh(0);
```

结果：

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

- `x` — 角度的双曲正切。值在区间：$-1 \lt x \lt 1$。[(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md) 或 [Decimal*](../data-types/decimal.md)。

**返回值**

- 角度，单位为弧度。值在区间：$-\infty \lt atanh(x) \lt +\infty$。

类型: [Float64](/sql-reference/data-types/float)。

**示例**

```sql
SELECT atanh(0);
```

结果：

```result
┌─atanh(0)─┐
│        0 │
└──────────┘
```

## atan2 {#atan2}

返回在欧几里得平面中，从正 x 轴到点 `(x, y) ≠ (0, 0)` 的射线所夹的角度，单位为弧度。

**语法**

```sql
atan2(y, x)
```

**参数**

- `y` — 射线经过的点的 y 坐标。[(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md) 或 [Decimal*](../data-types/decimal.md)。
- `x` — 射线经过的点的 x 坐标。[(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md) 或 [Decimal*](../data-types/decimal.md)。

**返回值**

- 角度 `θ` 使得 $-\pi \lt 0 \le \pi$，单位为弧度。

类型: [Float64](/sql-reference/data-types/float)。

**示例**

```sql
SELECT atan2(1, 1);
```

结果：

```result
┌────────atan2(1, 1)─┐
│ 0.7853981633974483 │
└────────────────────┘
```

## hypot {#hypot}

返回直角三角形的斜边长度。[Hypot](https://en.wikipedia.org/wiki/Hypot) 避免在对非常大或非常小的数字进行平方时出现问题。

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

结果：

```result
┌────────hypot(1, 1)─┐
│ 1.4142135623730951 │
└────────────────────┘
```

## log1p {#log1p}

计算 `log(1+x)`。对于小值的 `x`，[计算](https://en.wikipedia.org/wiki/Natural_logarithm#lnp1) `log1p(x)` 比 `log(1+x)` 更准确。

**语法**

```sql
log1p(x)
```

**参数**

- `x` — 值在区间：$-1 \lt x \lt +\infty$。[(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md) 或 [Decimal*](../data-types/decimal.md)。

**返回值**

- 值在区间：$-\infty < log1p(x) \lt +\infty$。

类型: [Float64](/sql-reference/data-types/float)。

**示例**

```sql
SELECT log1p(0);
```

结果：

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

- `x` — 值在 $-\infty$ 到 $+\infty$。支持 ClickHouse 中的所有数字类型。

**返回值**

- 对于 `x < 0` 返回 -1
- 对于 `x = 0` 返回 0
- 对于 `x > 0` 返回 1

类型: [Int8](../data-types/int-uint.md)。

**示例**

零值符号：

```sql
SELECT sign(0);
```

结果：

```result
┌─sign(0)─┐
│       0 │
└─────────┘
```

正值符号：

```sql
SELECT sign(1);
```

结果：

```result
┌─sign(1)─┐
│       1 │
└─────────┘
```

负值符号：

```sql
SELECT sign(-1);
```

结果：

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

- `x` — 输入值。值在区间：$-\infty \lt x \lt +\infty$。[(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md) 或 [Decimal*](../data-types/decimal.md)。

**返回值**

- 位于 0 和 1 之间的对应值。[Float64](../data-types/float.md)。

**示例**

查询：

```sql
SELECT round(sigmoid(x), 5) FROM (SELECT arrayJoin([-1, 0, 1]) AS x);
```

结果：

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

- `x` — 输入为弧度。[(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md) 或 [Decimal*](../data-types/decimal.md)。
- `x` — 输入为弧度。[(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md) 或 [Decimal*](../data-types/decimal.md)。

**返回值**

- 以度为单位的值。[Float64](/sql-reference/data-types/float)。

**示例**

```sql
SELECT degrees(3.141592653589793);
```

结果：

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

- `x` — 输入为度数。[(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md) 或 [Decimal*](../data-types/decimal.md)。

**返回值**

- 以弧度为单位的值。

类型: [Float64](/sql-reference/data-types/float)。

**示例**

```sql
SELECT radians(180);
```

结果：

```result
┌──────radians(180)─┐
│ 3.141592653589793 │
└───────────────────┘
```

## factorial {#factorial}

计算整数值的阶乘。适用于任何原生整数类型，包括 UInt(8|16|32|64) 和 Int(8|16|32|64)。返回类型为 UInt64。

0 的阶乘为 1。同样，factorial() 函数对任何负值返回 1。输入参数的最大正值为 20，值为 21 或更大将导致异常抛出。

**语法**

```sql
factorial(n)
```

**示例**

```sql
SELECT factorial(10);
```

结果：

```result
┌─factorial(10)─┐
│       3628800 │
└───────────────┘
```

## width_bucket {#width_bucket}

返回在具有 `count` 个等宽桶的直方图中，`operand` 落入哪个桶中。若 `operand < low` 则返回 `0`，若 `operand >= high` 则返回 `count+1`。

`operand`、`low`、`high` 可以是任何原生数字类型。`count` 只能是无符号原生整数且其值不能为零。

**语法**

```sql
widthBucket(operand, low, high, count)
```
别名: `WIDTH_BUCKET`

**示例**

```sql
SELECT widthBucket(10.15, -8.6, 23, 18);
```

结果：

```result
┌─widthBucket(10.15, -8.6, 23, 18)─┐
│                               11 │
└──────────────────────────────────┘
```

## proportionsZTest {#proportionsztest}

返回两个比例 Z 检验的测试统计量 - 用于比较来自两个种群 `x` 和 `y` 的比例的统计检验。

**语法**

```sql
proportionsZTest(successes_x, successes_y, trials_x, trials_y, conf_level, pool_type)
```

**参数**

- `successes_x`: 种群 `x` 中的成功次数。 [UInt64](../data-types/int-uint.md)。
- `successes_y`: 种群 `y` 中的成功次数。 [UInt64](../data-types/int-uint.md)。
- `trials_x`: 种群 `x` 中的试验次数。 [UInt64](../data-types/int-uint.md)。
- `trials_y`: 种群 `y` 中的试验次数。 [UInt64](../data-types/int-uint.md)。
- `conf_level`: 对于检验的置信水平。 [Float64](../data-types/float.md)。
- `pool_type`: 合并选择（标准误的估计方式）。可以是 `unpooled` 或 `pooled`。 [String](../data-types/string.md)。

:::note
对于参数 `pool_type`: 在合并版本中，两个比例被平均，并只用一个比例来估计标准误。在未合并版本中，两个比例分别使用。
:::

**返回值**

- `z_stat`: Z 统计量。 [Float64](../data-types/float.md)。
- `p_val`: P 值。 [Float64](../data-types/float.md)。
- `ci_low`: 较低置信区间。 [Float64](../data-types/float.md)。
- `ci_high`: 较高置信区间。 [Float64](../data-types/float.md)。

**示例**

查询：

```sql
SELECT proportionsZTest(10, 11, 100, 101, 0.95, 'unpooled');
```

结果：

```response
┌─proportionsZTest(10, 11, 100, 101, 0.95, 'unpooled')───────────────────────────────┐
│ (-0.20656724435948853,0.8363478437079654,-0.09345975390115283,0.07563797172293502) │
└────────────────────────────────────────────────────────────────────────────────────┘
```
