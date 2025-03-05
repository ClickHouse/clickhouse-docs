---
slug: /sql-reference/data-types/decimal
sidebar_position: 6
sidebar_label: Decimal
---


# Decimal, Decimal(P), Decimal(P, S), Decimal32(S), Decimal64(S), Decimal128(S), Decimal256(S)

符号付き固定小数点数で、加算、減算、乗算操作中に精度を保持します。割り算の際には最下位桁が捨てられます（丸められません）。

## パラメータ {#parameters}

- P - 精度。妥当な範囲：\[ 1 : 76 \]。数値が持つことができる小数桁数（小数部分を含む）を決定します。デフォルトでは、精度は10です。
- S - スケール。妥当な範囲：\[ 0 : P \]。小数部分が持つことができる小数桁数を決定します。

Decimal(P) は Decimal(P, 0) に相当します。同様に、構文 Decimal は Decimal(10, 0) に相当します。

P パラメータの値に応じて、Decimal(P, S) は次の同義語となります：
- P が \[ 1 : 9 \] の場合 - Decimal32(S)
- P が \[ 10 : 18 \] の場合 - Decimal64(S)
- P が \[ 19 : 38 \] の場合 - Decimal128(S)
- P が \[ 39 : 76 \] の場合 - Decimal256(S)

## Decimal 値の範囲 {#decimal-value-ranges}

- Decimal32(S) - ( -1 \* 10^(9 - S), 1 \* 10^(9 - S) )
- Decimal64(S) - ( -1 \* 10^(18 - S), 1 \* 10^(18 - S) )
- Decimal128(S) - ( -1 \* 10^(38 - S), 1 \* 10^(38 - S) )
- Decimal256(S) - ( -1 \* 10^(76 - S), 1 \* 10^(76 - S) )

例えば、Decimal32(4) は -99999.9999 から 99999.9999 までの数値を 0.0001 ステップで含むことができます。

## 内部表現 {#internal-representation}

内部的には、データはそれぞれのビット幅を持つ通常の符号付き整数として表現されます。メモリに格納できる実際の値の範囲は、上記で指定された範囲よりも少し大きく、これは文字列からの変換時にのみチェックされます。

現代の CPU は 128 ビットおよび 256 ビット整数をネイティブにはサポートしていないため、Decimal128 および Decimal256 に対する操作はエミュレーションされます。そのため、Decimal128 および Decimal256 は Decimal32/Decimal64 よりも著しく遅く動作します。

## 演算と結果の型 {#operations-and-result-type}

Decimal に対する二項演算は、結果の型がより広くなります（引数の順序に関係なく）。

- `Decimal64(S1) <op> Decimal32(S2) -> Decimal64(S)`
- `Decimal128(S1) <op> Decimal32(S2) -> Decimal128(S)`
- `Decimal128(S1) <op> Decimal64(S2) -> Decimal128(S)`
- `Decimal256(S1) <op> Decimal<32|64|128>(S2) -> Decimal256(S)`

スケールに関するルール：

- 加算、減算：S = max(S1, S2)。
- 乗算：S = S1 + S2。
- 割り算：S = S1。

Decimal と整数の間の類似の操作では、結果は引数と同じサイズの Decimal になります。

Decimal と Float32/Float64 の間の演算は定義されていません。必要な場合は、引数の1つを明示的に toDecimal32、toDecimal64、toDecimal128 または toFloat32、toFloat64 のビルトイン関数を使用してキャストすることができます。ただし、結果は精度を失い、型変換は計算コストが高い操作であることに注意してください。

Decimal に対するいくつかの関数は、結果を Float64 として返します（例えば、var または stddev）。中間計算は依然として Decimal で行われる可能性があり、同じ値を持つ Float64 と Decimal の入力との間で異なる結果をもたらすことがあります。

## オーバーフローチェック {#overflow-checks}

Decimal に対する計算中に整数オーバーフローが発生する可能性があります。小数部分の過剰な桁は捨てられます（丸められません）。整数部分の過剰な桁は例外を引き起こします。

:::warning
Decimal128 と Decimal256 のオーバーフローチェックは実装されていません。オーバーフローが発生した場合、不正確な結果が返され、例外はスローされません。
:::

``` sql
SELECT toDecimal32(2, 4) AS x, x / 3
```

``` text
┌──────x─┬─divide(toDecimal32(2, 4), 3)─┐
│ 2.0000 │                       0.6666 │
└────────┴──────────────────────────────┘
```

``` sql
SELECT toDecimal32(4.2, 8) AS x, x * x
```

``` text
DB::Exception: Scale is out of bounds.
```

``` sql
SELECT toDecimal32(4.2, 8) AS x, 6 * x
```

``` text
DB::Exception: Decimal math overflow.
```

オーバーフローチェックは操作の遅延を引き起こします。オーバーフローが発生する可能性がないことが既知の場合、`decimal_check_overflow` 設定を使用してチェックを無効にすることが意味があります。チェックが無効化され、オーバーフローが発生した場合、結果は不正確です：

``` sql
SET decimal_check_overflow = 0;
SELECT toDecimal32(4.2, 8) AS x, 6 * x
```

``` text
┌──────────x─┬─multiply(6, toDecimal32(4.2, 8))─┐
│ 4.20000000 │                     -17.74967296 │
└────────────┴──────────────────────────────────┘
```

オーバーフローチェックは、算術演算だけでなく、値の比較にも行われます：

``` sql
SELECT toDecimal32(1, 8) < 100
```

``` text
DB::Exception: Can't compare.
```

**関連情報**
- [isDecimalOverflow](../../sql-reference/functions/other-functions.md#is-decimal-overflow)
- [countDigits](../../sql-reference/functions/other-functions.md#count-digits)
