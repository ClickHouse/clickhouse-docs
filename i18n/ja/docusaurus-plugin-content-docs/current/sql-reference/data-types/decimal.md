---
slug: /sql-reference/data-types/decimal
sidebar_position: 6
sidebar_label: Decimal
---

# Decimal, Decimal(P), Decimal(P, S), Decimal32(S), Decimal64(S), Decimal128(S), Decimal256(S)

符号付き固定小数点数で、加算、減算、および乗算時に精度を保持します。除算の場合、最下位桁は破棄されます（丸められません）。

## パラメータ {#parameters}

- P - 精度。有効範囲：\[ 1 : 76 \]。数値が持つことができる小数桁の数（小数部分を含む）を決定します。デフォルトでは、精度は10です。
- S - スケール。有効範囲：\[ 0 : P \]。小数部分が持つことができる小数桁の数を決定します。

Decimal(P)はDecimal(P, 0)に相当します。同様に、構文DecimalはDecimal(10, 0)に相当します。

Pパラメータの値に応じて、Decimal(P, S)は次の同義語になります：
- Pが\[ 1 : 9 \]の場合 - Decimal32(S)
- Pが\[ 10 : 18 \]の場合 - Decimal64(S)
- Pが\[ 19 : 38 \]の場合 - Decimal128(S)
- Pが\[ 39 : 76 \]の場合 - Decimal256(S)

## Decimal値の範囲 {#decimal-value-ranges}

- Decimal32(S) - ( -1 \* 10^(9 - S), 1 \* 10^(9 - S) )
- Decimal64(S) - ( -1 \* 10^(18 - S), 1 \* 10^(18 - S) )
- Decimal128(S) - ( -1 \* 10^(38 - S), 1 \* 10^(38 - S) )
- Decimal256(S) - ( -1 \* 10^(76 - S), 1 \* 10^(76 - S) )

例えば、Decimal32(4)は-99999.9999から99999.9999までの数値を0.0001刻みで含むことができます。

## 内部表現 {#internal-representation}

内部的にデータは、各ビット幅に対応する符号付き整数として表現されます。メモリに格納できる実際の値の範囲は、上記で指定されたものよりも若干大きく、これは文字列からの変換時にのみチェックされます。

現代のCPUは128ビットおよび256ビットの整数をネイティブにサポートしていないため、Decimal128およびDecimal256の演算はエミュレートされます。このため、Decimal128およびDecimal256はDecimal32/Decimal64よりも著しく遅く動作します。

## 演算と結果型 {#operations-and-result-type}

Decimalに対する2項演算は、結果型を広くします（引数の順序に関係なく）。

- `Decimal64(S1) <op> Decimal32(S2) -> Decimal64(S)`
- `Decimal128(S1) <op> Decimal32(S2) -> Decimal128(S)`
- `Decimal128(S1) <op> Decimal64(S2) -> Decimal128(S)`
- `Decimal256(S1) <op> Decimal<32|64|128>(S2) -> Decimal256(S)`

スケールに関するルール：

- 加算、減算：S = max(S1, S2)。
- 乗算：S = S1 + S2。
- 除算：S = S1。

Decimalと整数との間の同様の演算では、結果は引数と同じサイズのDecimalとなります。

DecimalとFloat32/Float64との間の演算は定義されていません。必要な場合は、引数のいずれかをtoDecimal32、toDecimal64、toDecimal128、またはtoFloat32、toFloat64のビルトインを使用して明示的にキャストできます。結果は精度を失い、型変換は計算的に高価な操作であることに注意してください。

Decimalに関する一部の関数は結果をFloat64として返します（例えば、varやstddevなど）。中間計算はまだDecimalで行われる可能性があり、同じ値を持つFloat64とDecimal入力の結果が異なることがあります。

## オーバーフローチェック {#overflow-checks}

Decimalの計算中に整数のオーバーフローが発生することがあります。小数部分の過剰な桁は破棄されます（丸められません）。整数部分の過剰な桁は例外を引き起こします。

:::warning
Decimal128およびDecimal256に対するオーバーフローチェックは実装されていません。オーバーフローが発生した場合、不正な結果が返され、例外はスローされません。
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

オーバーフローチェックは演算の遅延を引き起こします。オーバーフローが発生しないことが既知の場合、`decimal_check_overflow`設定を使用してチェックを無効にする意味があります。チェックが無効でオーバーフローが発生した場合、結果は不正確になります：

``` sql
SET decimal_check_overflow = 0;
SELECT toDecimal32(4.2, 8) AS x, 6 * x
```

``` text
┌──────────x─┬─multiply(6, toDecimal32(4.2, 8))─┐
│ 4.20000000 │                     -17.74967296 │
└────────────┴──────────────────────────────────┘
```

オーバーフローチェックは算術演算のみならず、値の比較にも行われます：

``` sql
SELECT toDecimal32(1, 8) < 100
```

``` text
DB::Exception: Can't compare.
```

**関連項目**
- [isDecimalOverflow](../../sql-reference/functions/other-functions.md#is-decimal-overflow)
- [countDigits](../../sql-reference/functions/other-functions.md#count-digits)
