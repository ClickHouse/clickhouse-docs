---
'description': 'Functions for Generating Random Numbersに関するDocumentation'
'sidebar_label': 'ランダム数'
'slug': '/sql-reference/functions/random-functions'
'title': '数値を生成するための関数'
'doc_type': 'reference'
---

# ランダム数生成のための関数

このセクションのすべての関数は、ゼロまたは1つの引数を受け入れます。引数が提供される場合の唯一の使用目的は、[共通部分式排除](/sql-reference/functions/overview#common-subexpression-elimination)を防ぐことであり、同じ行内での異なる実行が同じランダム関数に対して異なるランダム値を返すことを保証します。

関連コンテンツ

- ブログ: [ClickHouseでのランダムデータ生成](https://clickhouse.com/blog/generating-random-test-distribution-data-for-clickhouse)

:::note
生成されるランダム数は、非暗号学的アルゴリズムによって生成されます。
:::

## rand {#rand}

等確率のランダムなUInt32数を返します。

初期状態をシステムから取得した線形同剖生成器を使用しており、見た目はランダムですが、実際には本当にランダムではなく、初期状態が知られている場合には予測可能です。真のランダム性が重要なシナリオでは、システムレベルの呼び出しや外部ライブラリとの統合など、代替の方法を検討してください。

**構文**

```sql
rand()
```

エイリアス: `rand32`

**引数**

なし。

**戻り値**

UInt32型の数値を返します。

**例**

```sql
SELECT rand();
```

```response
1569354847 -- Note: The actual output will be a random number, not the specific number shown in the example
```

## rand64 {#rand64}

ランダムなUInt64整数（UInt64）の数を返します。

**構文**

```sql
rand64()
```

**引数**

なし。

**戻り値**

等確率のUInt64数を返します。

初期状態をシステムから取得した線形同剖生成器を使用しており、見た目はランダムですが、実際には本当にランダムではなく、初期状態が知られている場合には予測可能です。真のランダム性が重要なシナリオでは、システムレベルの呼び出しや外部ライブラリとの統合など、代替の方法を検討してください。

**例**

```sql
SELECT rand64();
```

```response
15030268859237645412 -- Note: The actual output will be a random number, not the specific number shown in the example.
```

## randCanonical {#randcanonical}

ランダムなFloat64数を返します。

**構文**

```sql
randCanonical()
```

**引数**

なし。

**戻り値**

0（含む）から1（含まない）までのFloat64値を返します。

**例**

```sql
SELECT randCanonical();
```

```response
0.3452178901234567 - Note: The actual output will be a random Float64 number between 0 and 1, not the specific number shown in the example.
```

## randConstant {#randconstant}

ランダムな値で埋められた単一の定数カラムを生成します。`rand`とは異なり、この関数は生成されたカラムの各行に同じランダム値が表示されることを保証し、単一のクエリ内で行間で一貫したランダムシードが必要なシナリオで役立ちます。

**構文**

```sql
randConstant([x]);
```

**引数**

- **[x] (オプショナル):** 生成されるランダム値に影響を与えるオプションの式。提供された場合でも、結果の値は同じクエリ実行内で依然として定数になります。同じ式を使用する異なるクエリは、異なる定数値を生成する可能性が高いです。

**戻り値**

各行に同じランダム値を持つUInt32型のカラムを返します。

**実装詳細**

実際の出力は、同じオプション式を使用していても、各クエリ実行ごとに異なります。オプションパラメータは、単独の`randConstant`を使用するのに比べて、生成される値を大幅に変更することはないかもしれません。

**例**

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

インターバル [`min`, `max`] から均一に引かれたランダムなFloat64を返します。

**構文**

```sql
randUniform(min, max)
```

**引数**

- `min` - `Float64` - 範囲の左境界、
- `max` - `Float64` - 範囲の右境界。

**戻り値**

[Float64](../data-types/float.md)型のランダムな数。

**例**

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

[正規分布](https://en.wikipedia.org/wiki/Normal_distribution)からランダムなFloat64を返します。

**構文**

```sql
randNormal(mean, stddev)
```

**引数**

- `mean` - `Float64` - 分布の平均値、
- `stddev` - `Float64` - 分布の[標準偏差](https://en.wikipedia.org/wiki/Standard_deviation)。

**戻り値**

- ランダムな数。[Float64](../data-types/float.md)。

**例**

```sql
SELECT randNormal(10, 2) FROM numbers(5)
```

結果:

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

[対数正規分布](https://en.wikipedia.org/wiki/Log-normal_distribution)からランダムなFloat64を返します。

**構文**

```sql
randLogNormal(mean, stddev)
```

**引数**

- `mean` - `Float64` - 分布の平均値、
- `stddev` - `Float64` - [標準偏差](https://en.wikipedia.org/wiki/Standard_deviation)。

**戻り値**

- ランダムな数。[Float64](../data-types/float.md)。

**例**

```sql
SELECT randLogNormal(100, 5) FROM numbers(5)
```

結果:

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

[二項分布](https://en.wikipedia.org/wiki/Binomial_distribution)から引かれたランダムなUInt64を返します。

**構文**

```sql
randBinomial(experiments, probability)
```

**引数**

- `experiments` - `UInt64` - 実験の数、
- `probability` - `Float64` - 各実験の成功確率、0から1の間の値。

**戻り値**

- ランダムな数。[UInt64](../data-types/int-uint.md)。

**例**

```sql
SELECT randBinomial(100, .75) FROM numbers(5)
```

結果:

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

[負の二項分布](https://en.wikipedia.org/wiki/Negative_binomial_distribution)から引かれたランダムなUInt64を返します。

**構文**

```sql
randNegativeBinomial(experiments, probability)
```

**引数**

- `experiments` - `UInt64` - 実験の数、
- `probability` - `Float64` - 各実験の失敗確率、0から1の間の値。

**戻り値**

- ランダムな数。[UInt64](../data-types/int-uint.md)。

**例**

```sql
SELECT randNegativeBinomial(100, .75) FROM numbers(5)
```

結果:

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

[ポアソン分布](https://en.wikipedia.org/wiki/Poisson_distribution)から引かれたランダムなUInt64を返します。

**構文**

```sql
randPoisson(n)
```

**引数**

- `n` - `UInt64` - 発生の平均数。

**戻り値**

- ランダムな数。[UInt64](../data-types/int-uint.md)。

**例**

```sql
SELECT randPoisson(10) FROM numbers(5)
```

結果:

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

[ベルヌーイ分布](https://en.wikipedia.org/wiki/Bernoulli_distribution)から引かれたランダムなUInt64を返します。

**構文**

```sql
randBernoulli(probability)
```

**引数**

- `probability` - `Float64` - 成功の確率、0から1の間の値。

**戻り値**

- ランダムな数。[UInt64](../data-types/int-uint.md)。

**例**

```sql
SELECT randBernoulli(.75) FROM numbers(5)
```

結果:

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

[指数分布](https://en.wikipedia.org/wiki/Exponential_distribution)から引かれたランダムなFloat64を返します。

**構文**

```sql
randExponential(lambda)
```

**引数**

- `lambda` - `Float64` - ラムダ値。

**戻り値**

- ランダムな数。[Float64](../data-types/float.md)。

**例**

```sql
SELECT randExponential(1/10) FROM numbers(5)
```

結果:

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

[カイ二乗分布](https://en.wikipedia.org/wiki/Chi-squared_distribution)から引かれたランダムなFloat64を返します - k個の独立した標準正規乱数の二乗和の分布です。

**構文**

```sql
randChiSquared(degree_of_freedom)
```

**引数**

- `degree_of_freedom` - `Float64` - 自由度。

**戻り値**

- ランダムな数。[Float64](../data-types/float.md)。

**例**

```sql
SELECT randChiSquared(10) FROM numbers(5)
```

結果:

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

[スチューデントt分布](https://en.wikipedia.org/wiki/Student%27s_t-distribution)から引かれたランダムなFloat64を返します。

**構文**

```sql
randStudentT(degree_of_freedom)
```

**引数**

- `degree_of_freedom` - `Float64` - 自由度。

**戻り値**

- ランダムな数。[Float64](../data-types/float.md)。

**例**

```sql
SELECT randStudentT(10) FROM numbers(5)
```

結果:

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

[F分布](https://en.wikipedia.org/wiki/F-distribution)から引かれたランダムなFloat64を返します。

**構文**

```sql
randFisherF(d1, d2)
```

**引数**

- `d1` - `Float64` - `X = (S1 / d1) / (S2 / d2)` におけるd1の自由度、
- `d2` - `Float64` - `X = (S1 / d1) / (S2 / d2)` におけるd2の自由度。

**戻り値**

- ランダムな数。[Float64](../data-types/float.md)。

**例**

```sql
SELECT randFisherF(10, 3) FROM numbers(5)
```

結果:

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

指定された長さのランダムバイト（ゼロバイトを含む）で埋められた文字列を生成します。すべての文字が印刷可能とは限りません。

**構文**

```sql
randomString(length)
```

**引数**

- `length` — バイト単位の文字列の長さ。正の整数。

**戻り値**

- ランダムバイトで埋められた文字列。[String](../data-types/string.md)。

**例**

クエリ:

```sql
SELECT randomString(30) AS str, length(str) AS len FROM numbers(2) FORMAT Vertical;
```

結果:

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

指定された長さのバイナリ文字列で埋められたランダムバイト（ゼロバイトを含む）を生成します。すべての文字が印刷可能とは限りません。

**構文**

```sql
randomFixedString(length);
```

**引数**

- `length` — バイト単位の文字列の長さ。[UInt64](../data-types/int-uint.md)。

**戻り値**

- ランダムバイトで埋められた文字列。[FixedString](../data-types/fixedstring.md)。

**例**

クエリ:

```sql
SELECT randomFixedString(13) AS rnd, toTypeName(rnd)
```

結果:

```text
┌─rnd──────┬─toTypeName(randomFixedString(13))─┐
│ j▒h㋖HɨZ'▒ │ FixedString(13)                 │
└──────────┴───────────────────────────────────┘
```

## randomPrintableASCII {#randomprintableascii}

ランダムなASCII[キャラクタ](https://en.wikipedia.org/wiki/ASCII#Printable_characters)のセットで生成された文字列を生成します。すべての文字が印刷可能です。
`length < 0`を渡すと、関数の動作は未定義です。

**構文**

```sql
randomPrintableASCII(length)
```

**引数**

- `length` — バイト単位の文字列の長さ。正の整数。

**戻り値**

- ランダムなASCII[印刷可能キャラクター](https://en.wikipedia.org/wiki/ASCII#Printable_characters)のセットを含む文字列。[String](../data-types/string.md)

**例**

```sql
SELECT number, randomPrintableASCII(30) AS str, length(str) FROM system.numbers LIMIT 3
```

```text
┌─number─┬─str────────────────────────────┬─length(randomPrintableASCII(30))─┐
│      0 │ SuiCOSTvC0csfABSw=UcSzp2.`rv8x │                               30 │
│      1 │ 1Ag NlJ &RCN:*>HVPG;PE-nO"SUFD │                               30 │
│      2 │ /"+<"wUTh:=LjJ Vm!c&hI*m#XTfzz │                               30 │
└────────┴────────────────────────────────┴──────────────────────────────────┘
```

## randomStringUTF8 {#randomstringutf8}

指定された長さのランダムな文字列を生成します。結果の文字列は有効なUTF-8コードポイントを含みます。コードポイントの値は、割り当てられたUnicodeの範囲を超えている可能性があります。

**構文**

```sql
randomStringUTF8(length);
```

**引数**

- `length` — コードポイントでの文字列の長さ。[UInt64](../data-types/int-uint.md)。

**戻り値**

- UTF-8のランダムな文字列。[String](../data-types/string.md)。

**例**

クエリ:

```sql
SELECT randomStringUTF8(13)
```

結果:

```text
┌─randomStringUTF8(13)─┐
│ 𘤗𙉝д兠庇󡅴󱱎󦐪􂕌𔊹𓰛   │
└──────────────────────┘
```

## fuzzBits {#fuzzBits}

**構文**

文字列またはFixedString `s`のビットを反転させ、それぞれが確率`prob`で反転します。

**構文**

```sql
fuzzBits(s, prob)
```

**引数**

- `s` - `String`または`FixedString`
- `prob` - 0.0から1.0の間の定数`Float32/64`。

**戻り値**

`s`と同じタイプのファジー文字列。

**例**

```sql
SELECT fuzzBits(materialize('abacaba'), 0.1)
FROM numbers(3)
```

結果:

```result
┌─fuzzBits(materialize('abacaba'), 0.1)─┐
│ abaaaja                               │
│ a*cjab+                               │
│ aeca2A                                │
└───────────────────────────────────────┘
```

<!-- 
The inner content of the tags below are replaced at doc framework build time with 
docs generated from system.functions. Please do not modify or remove the tags.
See: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
-->

<!--AUTOGENERATED_START-->
<!--AUTOGENERATED_END-->
