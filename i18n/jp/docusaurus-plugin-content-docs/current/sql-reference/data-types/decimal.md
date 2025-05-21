description: 'ClickHouseにおけるDecimalデータ型のドキュメントで、可変精度の固定小数点演算を提供します'
sidebar_label: 'Decimal'
sidebar_position: 6
slug: /sql-reference/data-types/decimal
title: 'Decimal, Decimal(P), Decimal(P, S), Decimal32(S), Decimal64(S), Decimal128(S), Decimal256(S)'
```


# Decimal, Decimal(P), Decimal(P, S), Decimal32(S), Decimal64(S), Decimal128(S), Decimal256(S)

符号付き固定小数点数は、加算、減算および乗算操作中に精度を保持します。除算では、最下位の桁が捨てられます（四捨五入されません）。

## Parameters {#parameters}

- P - 精度。正しい範囲: \[ 1 : 76 \]。数値が持つことができる小数桁数を決定します（小数部分を含む）。デフォルトでは、精度は10です。
- S - スケール。正しい範囲: \[ 0 : P \]。小数部分が持つことができる桁数を決定します。

Decimal(P) は Decimal(P, 0) に相当します。同様に、構文 Decimal は Decimal(10, 0) に相当します。

Pパラメータの値に応じて、Decimal(P, S) は以下の同義語です：
- Pが \[ 1 : 9 \] の場合 - Decimal32(S)
- Pが \[ 10 : 18 \] の場合 - Decimal64(S)
- Pが \[ 19 : 38 \] の場合 - Decimal128(S)
- Pが \[ 39 : 76 \] の場合 - Decimal256(S)

## Decimal Value Ranges {#decimal-value-ranges}

- Decimal(P, S) - ( -1 \* 10^(P - S), 1 \* 10^(P - S) )
- Decimal32(S) - ( -1 \* 10^(9 - S), 1 \* 10^(9 - S) )
- Decimal64(S) - ( -1 \* 10^(18 - S), 1 \* 10^(18 - S) )
- Decimal128(S) - ( -1 \* 10^(38 - S), 1 \* 10^(38 - S) )
- Decimal256(S) - ( -1 \* 10^(76 - S), 1 \* 10^(76 - S) )

例えば、Decimal32(4) は -99999.9999 から 99999.9999 までの数値を 0.0001 ステップで含むことができます。

## Internal Representation {#internal-representation}

内部的にデータは、それぞれのビット幅を持つ符号付き整数として表現されます。メモリに保存できる実際の値の範囲は、上記で指定された値より少し大きく、文字列からの変換時にのみチェックされます。

現代のCPUは128ビットおよび256ビット整数をネイティブにサポートしていないため、Decimal128およびDecimal256の操作はエミュレートされます。そのため、Decimal128およびDecimal256は、Decimal32およびDecimal64よりもかなり遅く動作します。

## Operations and Result Type {#operations-and-result-type}

Decimalに対する二項演算は、より広い結果型を生成します（引数の順序は問わず）。

- `Decimal64(S1) <op> Decimal32(S2) -> Decimal64(S)`
- `Decimal128(S1) <op> Decimal32(S2) -> Decimal128(S)`
- `Decimal128(S1) <op> Decimal64(S2) -> Decimal128(S)`
- `Decimal256(S1) <op> Decimal<32|64|128>(S2) -> Decimal256(S)`

スケールに関するルール：

- 加算、減算: S = max(S1, S2)。
- 乗算: S = S1 + S2。
- 除算: S = S1。

Decimalと整数との間の類似の操作では、結果は引数と同じサイズのDecimalになります。

DecimalとFloat32/Float64との間の演算は定義されていません。必要な場合は、toDecimal32、toDecimal64、toDecimal128、toFloat32、toFloat64ビルトインを使用して、引数のいずれかを明示的にキャストできます。結果は精度を失うことに注意し、型変換は計算コストの高い操作です。

いくつかの関数に対して、Decimalの結果はFloat64として返される場合があります（例えば、varやstddev）。中間計算は依然としてDecimalで行われる可能性があり、これにより同じ値を持つFloat64とDecimalの入力の間に異なる結果が生じることがあります。

## Overflow Checks {#overflow-checks}

Decimalに対する計算中に整数オーバーフローが発生する可能性があります。小数部分の桁が過剰な場合は捨てられます（四捨五入されません）。整数部の過剰な桁は例外を引き起こします。

:::warning
Decimal128およびDecimal256に対してはオーバーフローチェックが実装されていません。オーバーフローが発生した場合、不正確な結果が返され、例外はスローされません。
:::

```sql
SELECT toDecimal32(2, 4) AS x, x / 3
```

```text
┌──────x─┬─divide(toDecimal32(2, 4), 3)─┐
│ 2.0000 │                       0.6666 │
└────────┴──────────────────────────────┘
```

```sql
SELECT toDecimal32(4.2, 8) AS x, x * x
```

```text
DB::Exception: Scale is out of bounds.
```

```sql
SELECT toDecimal32(4.2, 8) AS x, 6 * x
```

```text
DB::Exception: Decimal math overflow.
```

オーバーフローチェックは、操作の遅延につながります。オーバーフローが発生しないことがわかっている場合は、`decimal_check_overflow` 設定を使用してチェックを無効にすることが理にかなっています。チェックが無効にされ、オーバーフローが発生した場合、結果は不正確になります：

```sql
SET decimal_check_overflow = 0;
SELECT toDecimal32(4.2, 8) AS x, 6 * x
```

```text
┌──────────x─┬─multiply(6, toDecimal32(4.2, 8))─┐
│ 4.20000000 │                     -17.74967296 │
└────────────┴──────────────────────────────────┘
```

オーバーフローチェックは、算術演算だけでなく、値の比較にも行われます：

```sql
SELECT toDecimal32(1, 8) < 100
```

```text
DB::Exception: Can't compare.
```

**See also**
- [isDecimalOverflow](/sql-reference/functions/other-functions#isdecimaloverflow)
- [countDigits](/sql-reference/functions/other-functions#countdigits)
