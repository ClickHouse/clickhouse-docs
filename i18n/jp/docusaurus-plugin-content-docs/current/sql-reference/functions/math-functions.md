---
'description': '数学関数のドキュメント'
'sidebar_label': '数学'
'sidebar_position': 125
'slug': '/sql-reference/functions/math-functions'
'title': 'Mathematical Functions'
---




# 数学関数

## e {#e}

$e$（[オイラーの定数](https://en.wikipedia.org/wiki/Euler%27s_constant)）を返します。

**構文**

```sql
e()
```

**返される値**

タイプ: [Float64](../data-types/float.md).

## pi {#pi}

$\pi$（[円周率](https://en.wikipedia.org/wiki/Pi)）を返します。

**構文**

```sql
pi()
```
**返される値**

タイプ: [Float64](../data-types/float.md).

## exp {#exp}

$e^{x}$を返します。ここで、xは関数への引数です。

**構文**

```sql
exp(x)
```

**引数**

- `x` - [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)、または[Decimal*](../data-types/decimal.md)。

**例**

クエリ:

```sql
SELECT round(exp(-1), 4);
```

結果:

```response
┌─round(exp(-1), 4)─┐
│            0.3679 │
└───────────────────┘
```

**返される値**

タイプ: [Float*](../data-types/float.md).

## log {#log}

引数の自然対数を返します。

**構文**

```sql
log(x)
```

エイリアス: `ln(x)`

**引数**

- `x` - [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)、または[Decimal*](../data-types/decimal.md)。

**返される値**

タイプ: [Float*](../data-types/float.md).

## exp2 {#exp2}

指定された引数の2のべき乗を返します。

**構文**

```sql
exp2(x)
```

**引数**

- `x` - [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)、または[Decimal*](../data-types/decimal.md)。

**返される値**

タイプ: [Float*](../data-types/float.md).

## intExp2 {#intexp2}

[`exp`](#exp) と同様ですが、UInt64を返します。

**構文**

```sql
intExp2(x)
```

## log2 {#log2}

引数の二進対数を返します。

**構文**

```sql
log2(x)
```

**引数**

- `x` - [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)、または[Decimal*](../data-types/decimal.md)。

**返される値**

タイプ: [Float*](../data-types/float.md).

## exp10 {#exp10}

指定された引数の10のべき乗を返します。

**構文**

```sql
exp10(x)
```

**引数**

- `x` - [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)、または[Decimal*](../data-types/decimal.md)。

**返される値**

タイプ: [Float*](../data-types/float.md).

## intExp10 {#intexp10}

[`exp10`](#exp10) と同様ですが、UInt64を返します。

**構文**

```sql
intExp10(x)
```

## log10 {#log10}

引数の常用対数を返します。

**構文**

```sql
log10(x)
```

**引数**

- `x` - [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)、または[Decimal*](../data-types/decimal.md)。

**返される値**

タイプ: [Float*](../data-types/float.md).

## sqrt {#sqrt}

引数の平方根を返します。

```sql
sqrt(x)
```

**引数**

- `x` - [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)、または[Decimal*](../data-types/decimal.md)。

**返される値**

タイプ: [Float*](../data-types/float.md).

## cbrt {#cbrt}

引数の立方根を返します。

```sql
cbrt(x)
```

**引数**

- `x` - [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)、または[Decimal*](../data-types/decimal.md)。

**返される値**

タイプ: [Float*](../data-types/float.md).

## erf {#erf}

`x`が非負の場合、$erf(\frac{x}{\sigma\sqrt{2}})$は、標準偏差$\sigma$を持つ正規分布のランダム変数が期待値から`x`以上に離れた値を取る確率です。

**構文**

```sql
erf(x)
```

**引数**

- `x` - [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)、または[Decimal*](../data-types/decimal.md)。

**返される値**

タイプ: [Float*](../data-types/float.md).

**例**

（3シグマの法則）

```sql
SELECT erf(3 / sqrt(2));
```

```result
┌─erf(divide(3, sqrt(2)))─┐
│      0.9973002039367398 │
└─────────────────────────┘
```

## erfc {#erfc}

大きな`x`の値に対して、精度を失うことなく$1-erf(x)$に近い数字を返します。

**構文**

```sql
erfc(x)
```

**引数**

- `x` - [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)、または[Decimal*](../data-types/decimal.md)。

**返される値**

タイプ: [Float*](../data-types/float.md).

## lgamma {#lgamma}

ガンマ関数の対数を返します。

**構文**

```sql
lgamma(x)
```

**引数**

- `x` - [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)、または[Decimal*](../data-types/decimal.md)。

**返される値**

タイプ: [Float*](../data-types/float.md).

## tgamma {#tgamma}

ガンマ関数を返します。

**構文**

```sql
gamma(x)
```

**引数**

- `x` - [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)、または[Decimal*](../data-types/decimal.md)。

**返される値**

タイプ: [Float*](../data-types/float.md).

## sin {#sin}

引数のサインを返します。

**構文**

```sql
sin(x)
```

**引数**

- `x` - [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)、または[Decimal*](../data-types/decimal.md)。

**返される値**

タイプ: [Float*](../data-types/float.md).

**例**

クエリ:

```sql
SELECT sin(1.23);
```

```response
0.9424888019316975
```

## cos {#cos}

引数のコサインを返します。

**構文**

```sql
cos(x)
```

**引数**

- `x` - [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)、または[Decimal*](../data-types/decimal.md)。

**返される値**

タイプ: [Float*](../data-types/float.md).

## tan {#tan}

引数のタンジェントを返します。

**構文**

```sql
tan(x)
```

**引数**

- `x` - [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)、または[Decimal*](../data-types/decimal.md)。

**返される値**

タイプ: [Float*](../data-types/float.md).

## asin {#asin}

引数のアークサインを返します。

**構文**

```sql
asin(x)
```

**引数**

- `x` - [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)、または[Decimal*](../data-types/decimal.md)。

**返される値**

タイプ: [Float*](../data-types/float.md).

## acos {#acos}

引数のアークコサインを返します。

**構文**

```sql
acos(x)
```

**引数**

- `x` - [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)、または[Decimal*](../data-types/decimal.md)。

**返される値**

タイプ: [Float*](../data-types/float.md).

## atan {#atan}

引数のアークタンジェントを返します。

**構文**

```sql
atan(x)
```

**引数**

- `x` - [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)、または[Decimal*](../data-types/decimal.md)。

**返される値**

タイプ: [Float*](../data-types/float.md).

## pow {#pow}

$x^y$を返します。

**構文**

```sql
pow(x, y)
```

エイリアス: `power(x, y)`

**引数**

- `x` - [(U)Int8/16/32/64](../data-types/int-uint.md)、[Float*](../data-types/float.md)、または[Decimal*](../data-types/decimal.md)
- `y` - [(U)Int8/16/32/64](../data-types/int-uint.md)、[Float*](../data-types/float.md)、または[Decimal*](../data-types/decimal.md)

**返される値**

タイプ: [Float64](../data-types/float.md).

## cosh {#cosh}

引数の[双曲線コサイン](https://in.mathworks.com/help/matlab/ref/cosh.html)を返します。

**構文**

```sql
cosh(x)
```

**引数**

- `x` — ラジアンで表された角度。区間からの値: $-\infty \lt x \lt +\infty$。[(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)、または[Decimal*](../data-types/decimal.md)。

**返される値**

- 区間からの値: $1 \le cosh(x) \lt +\infty$。

タイプ: [Float64](/sql-reference/data-types/float).

**例**

```sql
SELECT cosh(0);
```

結果:

```result
┌─cosh(0)──┐
│        1 │
└──────────┘
```

## acosh {#acosh}

[逆双曲線コサイン](https://www.mathworks.com/help/matlab/ref/acosh.html)を返します。

**構文**

```sql
acosh(x)
```

**引数**

- `x` — 角度の双曲線コサイン。区間からの値: $1 \le x \lt +\infty$。[(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)、または[Decimal*](../data-types/decimal.md)。

**返される値**

- ラジアンで表された角度。区間からの値: $0 \le acosh(x) \lt +\infty$。

タイプ: [Float64](/sql-reference/data-types/float).

**例**

```sql
SELECT acosh(1);
```

結果:

```result
┌─acosh(1)─┐
│        0 │
└──────────┘
```

## sinh {#sinh}

[双曲線サイン](https://www.mathworks.com/help/matlab/ref/sinh.html)を返します。

**構文**

```sql
sinh(x)
```

**引数**

- `x` — ラジアンで表された角度。区間からの値: $-\infty \lt x \lt +\infty$。[(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)、または[Decimal*](../data-types/decimal.md)。

**返される値**

- 区間からの値: $-\infty \lt sinh(x) \lt +\infty$。

タイプ: [Float64](/sql-reference/data-types/float).

**例**

```sql
SELECT sinh(0);
```

結果:

```result
┌─sinh(0)──┐
│        0 │
└──────────┘
```

## asinh {#asinh}

[逆双曲線サイン](https://www.mathworks.com/help/matlab/ref/asinh.html)を返します。

**構文**

```sql
asinh(x)
```

**引数**

- `x` — 角度の双曲線サイン。区間からの値: $-\infty \lt x \lt +\infty$。[(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)、または[Decimal*](../data-types/decimal.md)。

**返される値**

- ラジアンで表された角度。区間からの値: $-\infty \lt asinh(x) \lt +\infty$。

タイプ: [Float64](/sql-reference/data-types/float).

**例**

```sql
SELECT asinh(0);
```

結果:

```result
┌─asinh(0)─┐
│        0 │
└──────────┘
```
## tanh {#tanh}

[双曲線タンジェント](https://www.mathworks.com/help/matlab/ref/tanh.html)を返します。

**構文**

```sql
tanh(x)
```

**引数**

- `x` — ラジアンで表された角度。区間からの値: $-\infty \lt x \lt +\infty$。[(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)、または[Decimal*](../data-types/decimal.md)。

**返される値**

- 区間からの値: $-1 \lt tanh(x) \lt 1$。

タイプ: [Float*](/sql-reference/data-types/float).

**例**

```sql
SELECT tanh(0);
```

結果:

```result
0
```

## atanh {#atanh}

[逆双曲線タンジェント](https://www.mathworks.com/help/matlab/ref/atanh.html)を返します。

**構文**

```sql
atanh(x)
```

**引数**

- `x` — 角度の双曲線タンジェント。区間からの値: $-1 \lt x \lt 1$。[(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)、または[Decimal*](../data-types/decimal.md)。

**返される値**

- ラジアンで表された角度。区間からの値: $-\infty \lt atanh(x) \lt +\infty$。

タイプ: [Float64](/sql-reference/data-types/float).

**例**

```sql
SELECT atanh(0);
```

結果:

```result
┌─atanh(0)─┐
│        0 │
└──────────┘
```

## atan2 {#atan2}

正のx軸と点`(x, y) ≠ (0, 0)`への光線の間の角度をラジアンで返します。

**構文**

```sql
atan2(y, x)
```

**引数**

- `y` — 光線が通過する点のy座標。[(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)、または[Decimal*](../data-types/decimal.md)。
- `x` — 光線が通過する点のx座標。[(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)、または[Decimal*](../data-types/decimal.md)。

**返される値**

- 角度`θ`は、$-\pi \lt 0 \le \pi$、ラジアンで。

タイプ: [Float64](/sql-reference/data-types/float).

**例**

```sql
SELECT atan2(1, 1);
```

結果:

```result
┌────────atan2(1, 1)─┐
│ 0.7853981633974483 │
└────────────────────┘
```

## hypot {#hypot}

直角三角形の斜辺の長さを返します。[Hypot](https://en.wikipedia.org/wiki/Hypot)は、非常に大きいまたは小さい数を2乗する時に発生する問題を回避します。

**構文**

```sql
hypot(x, y)
```

**引数**

- `x` — 直角三角形の第一カテト。[(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)、または[Decimal*](../data-types/decimal.md)。
- `y` — 直角三角形の第二カテト。[(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)、または[Decimal*](../data-types/decimal.md)。

**返される値**

- 直角三角形の斜辺の長さ。

タイプ: [Float64](/sql-reference/data-types/float).

**例**

```sql
SELECT hypot(1, 1);
```

結果:

```result
┌────────hypot(1, 1)─┐
│ 1.4142135623730951 │
└────────────────────┘
```

## log1p {#log1p}

`log(1+x)`を計算します。[計算](https://en.wikipedia.org/wiki/Natural_logarithm#lnp1) `log1p(x)`は、xの小さい値に対して`log(1+x)`よりも正確です。

**構文**

```sql
log1p(x)
```

**引数**

- `x` — 区間からの値: $-1 \lt x \lt +\infty$。[(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)、または[Decimal*](../data-types/decimal.md)。

**返される値**

- 区間からの値: $-\infty < log1p(x) \lt +\infty$。

タイプ: [Float64](/sql-reference/data-types/float).

**例**

```sql
SELECT log1p(0);
```

結果:

```result
┌─log1p(0)─┐
│        0 │
└──────────┘
```

## sign {#sign}

実数の符号を返します。

**構文**

```sql
sign(x)
```

**引数**

- `x` — $-\infty$から$+\infty$までの値。ClickHouseのすべての数値型をサポートします。

**返される値**

- `x < 0` の場合は-1
- `x = 0` の場合は0
- `x > 0` の場合は1

タイプ: [Int8](../data-types/int-uint.md).

**例**

ゼロ値の符号:

```sql
SELECT sign(0);
```

結果:

```result
┌─sign(0)─┐
│       0 │
└─────────┘
```

正の値の符号:

```sql
SELECT sign(1);
```

結果:

```result
┌─sign(1)─┐
│       1 │
└─────────┘
```

負の値の符号:

```sql
SELECT sign(-1);
```

結果:

```result
┌─sign(-1)─┐
│       -1 │
└──────────┘
```
## sigmoid {#sigmoid}

[sigmoid関数](https://en.wikipedia.org/wiki/Sigmoid_function)を返します。

**構文**

```sql
sigmoid(x)
```

**パラメータ**

- `x` — 入力値。区間からの値: $-\infty \lt x \lt +\infty$。[(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)、または[Decimal*](../data-types/decimal.md)。

**返される値**

- シグモイド曲線に沿った0と1の間の対応する値。 [Float64](../data-types/float.md).

**例**

クエリ:

```sql
SELECT round(sigmoid(x), 5) FROM (SELECT arrayJoin([-1, 0, 1]) AS x);
```

結果:

```result
0.26894
0.5
0.73106
```

## degrees {#degrees}

ラジアンを度に変換します。

**構文**

```sql
degrees(x)
```

**引数**

- `x` — ラジアンでの入力。[(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)、または[Decimal*](../data-types/decimal.md)。
- `x` — ラジアンでの入力。[(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)、または[Decimal*](../data-types/decimal.md)。  

**返される値**

- 度での値。 [Float64](/sql-reference/data-types/float).

**例**

```sql
SELECT degrees(3.141592653589793);
```

結果:

```result
┌─degrees(3.141592653589793)─┐
│                        180 │
└────────────────────────────┘
```

## radians {#radians}

度をラジアンに変換します。

**構文**

```sql
radians(x)
```

**引数**

- `x` — 度での入力。[(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)、または[Decimal*](../data-types/decimal.md)。

**返される値**

- ラジアンでの値。

タイプ: [Float64](/sql-reference/data-types/float).

**例**

```sql
SELECT radians(180);
```

結果:

```result
┌──────radians(180)─┐
│ 3.141592653589793 │
└───────────────────┘
```

## factorial {#factorial}

整数の階乗を計算します。UInt(8|16|32|64)およびInt(8|16|32|64)を含む任意のネイティブ整数型で動作します。返される型はUInt64です。

0の階乗は1です。同様に、factorial()関数は任意の負の値に対して1を返します。入力引数の最大正の値は20であり、21以上の値は例外を引き起こします。

**構文**

```sql
factorial(n)
```

**例**

```sql
SELECT factorial(10);
```

結果:

```result
┌─factorial(10)─┐
│       3628800 │
└───────────────┘
```

## width_bucket {#width_bucket}

`operand`が低い範囲から高い範囲までの等幅バケツ`count`のヒストグラムに落ちるバケツの番号を返します。`operand < low`の場合は`0`を返し、`operand >= high`の場合は`count+1`を返します。

`operand`、`low`、`high`は任意のネイティブ数値型であることができます。`count`は符号なしネイティブ整数のみに使用でき、その値はゼロにできません。

**構文**

```sql
widthBucket(operand, low, high, count)
```
エイリアス: `WIDTH_BUCKET`

**例**

```sql
SELECT widthBucket(10.15, -8.6, 23, 18);
```

結果:

```result
┌─widthBucket(10.15, -8.6, 23, 18)─┐
│                               11 │
└──────────────────────────────────┘
```

## proportionsZTest {#proportionsztest}

二つの母集団`x`および`y`の割合を比較するための統計的検定である二項Z検定の検定統計量を返します。

**構文**

```sql
proportionsZTest(successes_x, successes_y, trials_x, trials_y, conf_level, pool_type)
```

**引数**

- `successes_x`: 母集団`x`の成功数。 [UInt64](../data-types/int-uint.md)。
- `successes_y`: 母集団`y`の成功数。 [UInt64](../data-types/int-uint.md)。
- `trials_x`: 母集団`x`の試行数。 [UInt64](../data-types/int-uint.md)。
- `trials_y`: 母集団`y`の試行数。 [UInt64](../data-types/int-uint.md)。
- `conf_level`: 検定の信頼水準。 [Float64](../data-types/float.md)。
- `pool_type`: プーリングの選択（標準誤差が推定される方法）。`unpooled`または`pooled`のいずれか。 [String](../data-types/string.md)。 

:::note
引数`pool_type`について: プール版では、二つの割合が平均され、標準誤差の推定に一つの割合のみが使用されます。非プール版では、二つの割合が別々に使用されます。
:::

**返される値**

- `z_stat`: Z統計量。 [Float64](../data-types/float.md)。
- `p_val`: P値。 [Float64](../data-types/float.md)。
- `ci_low`: 下側信頼区間。 [Float64](../data-types/float.md)。
- `ci_high`: 上側信頼区間。 [Float64](../data-types/float.md)。

**例**

クエリ:

```sql
SELECT proportionsZTest(10, 11, 100, 101, 0.95, 'unpooled');
```

結果:

```response
┌─proportionsZTest(10, 11, 100, 101, 0.95, 'unpooled')───────────────────────────────┐
│ (-0.20656724435948853,0.8363478437079654,-0.09345975390115283,0.07563797172293502) │
└────────────────────────────────────────────────────────────────────────────────────┘
```
