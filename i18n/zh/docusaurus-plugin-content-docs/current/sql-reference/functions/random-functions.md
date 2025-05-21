---
'description': '生成随机数功能文档'
'sidebar_label': '随机数'
'sidebar_position': 145
'slug': '/sql-reference/functions/random-functions'
'title': 'Functions for Generating Random Numbers'
---




# 生成随机数的函数

本节中的所有函数接受零个或一个参数。参数的唯一用途（如果提供）是防止[常见子表达式消除](/sql-reference/functions/overview#common-subexpression-elimination)，使得同一行中两次执行相同的随机函数返回不同的随机值。

相关内容

- 博客: [在 ClickHouse 中生成随机数据](https://clickhouse.com/blog/generating-random-test-distribution-data-for-clickhouse)

:::note
随机数是通过非密码学算法生成的。
:::

## rand {#rand}

返回一个均匀分布的随机 UInt32 数字。

采用线性同余生成器，初始状态来自系统，这意味着虽然它看起来是随机的，但并不是真正的随机，如果已知初始状态可以预测。对于那些真正随机性至关重要的场景，考虑使用系统级调用或与外部库集成等替代方法。

**语法**

```sql
rand()
```

别名: `rand32`

**参数**

无。

**返回值**

返回一个类型为 UInt32 的数字。

**示例**

```sql
SELECT rand();
```

```response
1569354847 -- Note: The actual output will be a random number, not the specific number shown in the example
```

## rand64 {#rand64}

返回一个随机的 UInt64 整数 (UInt64) 数字。

**语法**

```sql
rand64()
```

**参数**

无。

**返回值**

返回一个均匀分布的 UInt64 数字。

采用线性同余生成器，初始状态来自系统，这意味着虽然它看起来是随机的，但并不是真正的随机，如果已知初始状态可以预测。对于那些真正随机性至关重要的场景，考虑使用系统级调用或与外部库集成等替代方法。

**示例**

```sql
SELECT rand64();
```

```response
15030268859237645412 -- Note: The actual output will be a random number, not the specific number shown in the example.
```

## randCanonical {#randcanonical}

返回一个随机的 Float64 数字。

**语法**

```sql
randCanonical()
```

**参数**

无。

**返回值**

返回一个介于 0（包含）和 1（不包含）之间的 Float64 值。

**示例**

```sql
SELECT randCanonical();
```

```response
0.3452178901234567 - Note: The actual output will be a random Float64 number between 0 and 1, not the specific number shown in the example.
```

## randConstant {#randconstant}

生成一个单列常量，填充随机值。与 `rand` 不同，这个函数确保在生成的列的每一行中都出现相同的随机值，这使其在需要在单个查询中跨行保持一致随机种子的场景中很有用。

**语法**

```sql
randConstant([x]);
```

**参数**

- **[x]（可选）：** 一个可选表达式，影响生成的随机值。即使提供，生成的值在同一查询执行中仍将保持不变。使用相同表达式的不同查询可能会生成不同的常量值。

**返回值**

返回一个类型为 UInt32 的列，每行包含相同的随机值。

**实现细节**

即使使用相同的可选表达式，实际输出在每次查询执行中也会不同。与单独使用 `randConstant` 相比，可选参数可能不会显著改变生成的值。

**示例**

```sql
SELECT randConstant() AS random_value;
```

```response
| random_value |
|--------------|
| 1234567890   |
```

```sql
SELECT randConstant(10) AS random_value;
```

```response
| random_value |
|--------------|
| 9876543210   |
```

## randUniform {#randuniform}

返回一个均匀分布在区间 [`min`, `max`] 内的随机 Float64。

**语法**

```sql
randUniform(min, max)
```

**参数**

- `min` - `Float64` - 范围的左边界，
- `max` - `Float64` - 范围的右边界。

**返回值**

一个类型为 [Float64](../data-types/float.md) 的随机数字。

**示例**

```sql
SELECT randUniform(5.5, 10) FROM numbers(5)
```

```response
┌─randUniform(5.5, 10)─┐
│    8.094978491443102 │
│   7.3181248914450885 │
│    7.177741903868262 │
│    6.483347380953762 │
│    6.122286382885112 │
└──────────────────────┘
```

## randNormal {#randnormal}

返回一个从 [正态分布](https://en.wikipedia.org/wiki/Normal_distribution) 中抽取的随机 Float64。

**语法**

```sql
randNormal(mean, stddev)
```

**参数**

- `mean` - `Float64` - 分布的均值，
- `stddev` - `Float64` - 分布的 [标准差](https://en.wikipedia.org/wiki/Standard_deviation)。

**返回值**

- 随机数字。 [Float64](../data-types/float.md)。

**示例**

```sql
SELECT randNormal(10, 2) FROM numbers(5)
```

结果：

```result
┌──randNormal(10, 2)─┐
│ 13.389228911709653 │
│  8.622949707401295 │
│ 10.801887062682981 │
│ 4.5220192605895315 │
│ 10.901239123982567 │
└────────────────────┘
```

## randLogNormal {#randlognormal}

返回一个从 [对数正态分布](https://en.wikipedia.org/wiki/Log-normal_distribution) 中抽取的随机 Float64。

**语法**

```sql
randLogNormal(mean, stddev)
```

**参数**

- `mean` - `Float64` - 分布的均值，
- `stddev` - `Float64` - 分布的 [标准差](https://en.wikipedia.org/wiki/Standard_deviation)。

**返回值**

- 随机数字。 [Float64](../data-types/float.md)。

**示例**

```sql
SELECT randLogNormal(100, 5) FROM numbers(5)
```

结果：

```result
┌─randLogNormal(100, 5)─┐
│  1.295699673937363e48 │
│  9.719869109186684e39 │
│  6.110868203189557e42 │
│  9.912675872925529e39 │
│ 2.3564708490552458e42 │
└───────────────────────┘
```

## randBinomial {#randbinomial}

返回一个从 [二项分布](https://en.wikipedia.org/wiki/Binomial_distribution) 中抽取的随机 UInt64。

**语法**

```sql
randBinomial(experiments, probability)
```

**参数**

- `experiments` - `UInt64` - 实验的数量，
- `probability` - `Float64` - 每个实验成功的概率，值在 0 和 1 之间。

**返回值**

- 随机数字。 [UInt64](../data-types/int-uint.md)。

**示例**

```sql
SELECT randBinomial(100, .75) FROM numbers(5)
```

结果：

```result
┌─randBinomial(100, 0.75)─┐
│                      74 │
│                      78 │
│                      76 │
│                      77 │
│                      80 │
└─────────────────────────┘
```

## randNegativeBinomial {#randnegativebinomial}

返回一个从 [负二项分布](https://en.wikipedia.org/wiki/Negative_binomial_distribution) 中抽取的随机 UInt64。

**语法**

```sql
randNegativeBinomial(experiments, probability)
```

**参数**

- `experiments` - `UInt64` - 实验的数量，
- `probability` - `Float64` - 每个实验失败的概率，值在 0 和 1 之间。

**返回值**

- 随机数字。 [UInt64](../data-types/int-uint.md)。

**示例**

```sql
SELECT randNegativeBinomial(100, .75) FROM numbers(5)
```

结果：

```result
┌─randNegativeBinomial(100, 0.75)─┐
│                              33 │
│                              32 │
│                              39 │
│                              40 │
│                              50 │
└─────────────────────────────────┘
```

## randPoisson {#randpoisson}

返回一个从 [泊松分布](https://en.wikipedia.org/wiki/Poisson_distribution) 中抽取的随机 UInt64。

**语法**

```sql
randPoisson(n)
```

**参数**

- `n` - `UInt64` - 发生次数的平均数。

**返回值**

- 随机数字。 [UInt64](../data-types/int-uint.md)。

**示例**

```sql
SELECT randPoisson(10) FROM numbers(5)
```

结果：

```result
┌─randPoisson(10)─┐
│               8 │
│               8 │
│               7 │
│              10 │
│               6 │
└─────────────────┘
```

## randBernoulli {#randbernoulli}

返回一个从 [伯努利分布](https://en.wikipedia.org/wiki/Bernoulli_distribution) 中抽取的随机 UInt64。

**语法**

```sql
randBernoulli(probability)
```

**参数**

- `probability` - `Float64` - 成功的概率，值在 0 和 1 之间。

**返回值**

- 随机数字。 [UInt64](../data-types/int-uint.md)。

**示例**

```sql
SELECT randBernoulli(.75) FROM numbers(5)
```

结果：

```result
┌─randBernoulli(0.75)─┐
│                   1 │
│                   1 │
│                   0 │
│                   1 │
│                   1 │
└─────────────────────┘
```

## randExponential {#randexponential}

返回一个从 [指数分布](https://en.wikipedia.org/wiki/Exponential_distribution) 中抽取的随机 Float64。

**语法**

```sql
randExponential(lambda)
```

**参数**

- `lambda` - `Float64` - lambda 值。

**返回值**

- 随机数字。 [Float64](../data-types/float.md)。

**示例**

```sql
SELECT randExponential(1/10) FROM numbers(5)
```

结果：

```result
┌─randExponential(divide(1, 10))─┐
│              44.71628934340778 │
│              4.211013337903262 │
│             10.809402553207766 │
│              15.63959406553284 │
│             1.8148392319860158 │
└────────────────────────────────┘
```

## randChiSquared {#randchisquared}

返回一个从 [卡方分布](https://en.wikipedia.org/wiki/Chi-squared_distribution) 中抽取的随机 Float64 - 是 k 个独立标准正态随机变量的平方和的分布。

**语法**

```sql
randChiSquared(degree_of_freedom)
```

**参数**

- `degree_of_freedom` - `Float64` - 自由度。

**返回值**

- 随机数字。 [Float64](../data-types/float.md)。

**示例**

```sql
SELECT randChiSquared(10) FROM numbers(5)
```

结果：

```result
┌─randChiSquared(10)─┐
│ 10.015463656521543 │
│  9.621799919882768 │
│   2.71785015634699 │
│ 11.128188665931908 │
│  4.902063104425469 │
└────────────────────┘
```

## randStudentT {#randstudentt}

返回一个从 [学生 t 分布](https://en.wikipedia.org/wiki/Student%27s_t-distribution) 中抽取的随机 Float64。

**语法**

```sql
randStudentT(degree_of_freedom)
```

**参数**

- `degree_of_freedom` - `Float64` - 自由度。

**返回值**

- 随机数字。 [Float64](../data-types/float.md)。

**示例**

```sql
SELECT randStudentT(10) FROM numbers(5)
```

结果：

```result
┌─────randStudentT(10)─┐
│   1.2217309938538725 │
│   1.7941971681200541 │
│ -0.28192176076784664 │
│   0.2508897721303792 │
│  -2.7858432909761186 │
└──────────────────────┘
```

## randFisherF {#randfisherf}

返回一个从 [F 分布](https://en.wikipedia.org/wiki/F-distribution) 中抽取的随机 Float64。

**语法**

```sql
randFisherF(d1, d2)
```

**参数**

- `d1` - `Float64` - d1 自由度在 `X = (S1 / d1) / (S2 / d2)` 中，
- `d2` - `Float64` - d2 自由度在 `X = (S1 / d1) / (S2 / d2)` 中，

**返回值**

- 随机数字。 [Float64](../data-types/float.md)。

**示例**

```sql
SELECT randFisherF(10, 3) FROM numbers(5)
```

结果：

```result
┌──randFisherF(10, 3)─┐
│   7.286287504216609 │
│ 0.26590779413050386 │
│ 0.22207610901168987 │
│  0.7953362728449572 │
│ 0.19278885985221572 │
└─────────────────────┘
```

## randomString {#randomString}

生成一个指定长度的字符串，填充随机字节（包括零字节）。并非所有字符都是可打印的。

**语法**

```sql
randomString(length)
```

**参数**

- `length` — 字符串长度（以字节为单位）。正整数。

**返回值**

- 填充随机字节的字符串。 [String](../data-types/string.md)。

**示例**

查询：

```sql
SELECT randomString(30) AS str, length(str) AS len FROM numbers(2) FORMAT Vertical;
```

结果：

```text
Row 1:
──────
str: 3 G  :   pT ?w тi  k aV f6
len: 30

Row 2:
──────
str: 9 ,]    ^   )  ]??  8
len: 30
```

## randomFixedString {#randomfixedstring}

生成一个指定长度的二进制字符串，填充随机字节（包括零字节）。并非所有字符都是可打印的。

**语法**

```sql
randomFixedString(length);
```

**参数**

- `length` — 字符串长度（以字节为单位）。 [UInt64](../data-types/int-uint.md)。

**返回值**

- 填充随机字节的字符串。 [FixedString](../data-types/fixedstring.md)。

**示例**

查询：

```sql
SELECT randomFixedString(13) as rnd, toTypeName(rnd)
```

结果：

```text
┌─rnd──────┬─toTypeName(randomFixedString(13))─┐
│ j▒h㋖HɨZ'▒ │ FixedString(13)                 │
└──────────┴───────────────────────────────────┘
```

## randomPrintableASCII {#randomprintableascii}

生成一个包含随机 [ASCII](https://en.wikipedia.org/wiki/ASCII#Printable_characters) 字符集的字符串。所有字符都是可打印的。
如果你传递 `length < 0`，函数的行为是未定义的。

**语法**

```sql
randomPrintableASCII(length)
```

**参数**

- `length` — 字符串长度（以字节为单位）。正整数。

**返回值**

- 包含随机 [ASCII](https://en.wikipedia.org/wiki/ASCII#Printable_characters) 可打印字符的字符串。 [String](../data-types/string.md)

**示例**

```sql
SELECT number, randomPrintableASCII(30) as str, length(str) FROM system.numbers LIMIT 3
```

```text
┌─number─┬─str────────────────────────────┬─length(randomPrintableASCII(30))─┐
│      0 │ SuiCOSTvC0csfABSw=UcSzp2.`rv8x │                               30 │
│      1 │ 1Ag NlJ &RCN:*>HVPG;PE-nO"SUFD │                               30 │
│      2 │ /"+<"wUTh:=LjJ Vm!c&hI*m#XTfzz │                               30 │
└────────┴────────────────────────────────┴──────────────────────────────────┘
```

## randomStringUTF8 {#randomstringutf8}

生成一个指定长度的随机字符串。结果字符串包含有效的 UTF-8 代码点。代码点的值可能超出分配的 Unicode 范围。

**语法**

```sql
randomStringUTF8(length);
```

**参数**

- `length` — 字符串的代码点长度。 [UInt64](../data-types/int-uint.md)。

**返回值**

- UTF-8 随机字符串。 [String](../data-types/string.md)。

**示例**

查询：

```sql
SELECT randomStringUTF8(13)
```

结果：

```text
┌─randomStringUTF8(13)─┐
│ 𘤗𙉝д兠庇󡅴󱱎󦐪􂕌𔊹𓰛   │
└──────────────────────┘
```

## fuzzBits {#fuzzBits}

**语法**

翻转字符串或固定字符串 `s` 的位，每个位的翻转概率为 `prob`。

**语法**

```sql
fuzzBits(s, prob)
```

**参数**

- `s` - `String` 或 `FixedString`，
- `prob` - 常数 `Float32/64`，范围在 0.0 到 1.0 之间。

**返回值**

模糊处理后的字符串，与 `s` 的类型相同。

**示例**

```sql
SELECT fuzzBits(materialize('abacaba'), 0.1)
FROM numbers(3)
```

结果：

```result
┌─fuzzBits(materialize('abacaba'), 0.1)─┐
│ abaaaja                               │
│ a*cjab+                               │
│ aeca2A                                │
└───────────────────────────────────────┘
```
