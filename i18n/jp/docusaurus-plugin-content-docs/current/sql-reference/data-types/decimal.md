---
'description': 'ClickHouseのDecimalデータ型に関するDocumentationであり、設定可能な精度を持つ固定小数点演算を提供します。'
'sidebar_label': 'Decimal'
'sidebar_position': 6
'slug': '/sql-reference/data-types/decimal'
'title': 'Decimal, Decimal(P), Decimal(P, S), Decimal32(S), Decimal64(S), Decimal128(S),
  Decimal256(S)'
'doc_type': 'reference'
---


# Decimal, Decimal(P), Decimal(P, S), Decimal32(S), Decimal64(S), Decimal128(S), Decimal256(S)

加算、減算、乗算操作中に精度を保持する符号付き固定小数点数。除算の場合、下位の桁は切り捨てられます（丸められません）。

## Parameters {#parameters}

- P - 精度。有効範囲: \[ 1 : 76 \]。数値が持つことができる小数桁数（小数部分を含む）を決定します。デフォルトでは、精度は10です。
- S - スケール。有効範囲: \[ 0 : P \]。小数部分が持つことができる桁数を決定します。

Decimal(P) は Decimal(P, 0) と同等です。同様に、文法 Decimal は Decimal(10, 0) と等しいです。

P パラメーターの値に応じて、Decimal(P, S) は以下の同義語となります。
- P が \[ 1 : 9 \] の場合 - Decimal32(S)
- P が \[ 10 : 18 \] の場合 - Decimal64(S)
- P が \[ 19 : 38 \] の場合 - Decimal128(S)
- P が \[ 39 : 76 \] の場合 - Decimal256(S)

## Decimal Value Ranges {#decimal-value-ranges}

- Decimal(P, S) - ( -1 \* 10^(P - S), 1 \* 10^(P - S) )
- Decimal32(S) - ( -1 \* 10^(9 - S), 1 \* 10^(9 - S) )
- Decimal64(S) - ( -1 \* 10^(18 - S), 1 \* 10^(18 - S) )
- Decimal128(S) - ( -1 \* 10^(38 - S), 1 \* 10^(38 - S) )
- Decimal256(S) - ( -1 \* 10^(76 - S), 1 \* 10^(76 - S) )

例えば、Decimal32(4)は -99999.9999 から 99999.9999 までの数値を 0.0001 ステップで含むことができます。

## Internal Representation {#internal-representation}

内部的には、データはそれぞれのビット幅を持つ符号付き整数として表現されます。メモリに格納できる実際の値の範囲は、上記で指定された範囲よりも若干大きく、これは文字列からの変換時にのみチェックされます。

現代のCPUは128ビットおよび256ビットの整数をネイティブにサポートしていないため、Decimal128およびDecimal256の操作はエミュレートされています。したがって、Decimal128およびDecimal256はDecimal32/Decimal64よりもかなり遅く動作します。

## Operations and Result Type {#operations-and-result-type}

Decimalに対する二項演算は、より広い結果型をもたらします（引数の順序に関係なく）。

- `Decimal64(S1) <op> Decimal32(S2) -> Decimal64(S)`
- `Decimal128(S1) <op> Decimal32(S2) -> Decimal128(S)`
- `Decimal128(S1) <op> Decimal64(S2) -> Decimal128(S)`
- `Decimal256(S1) <op> Decimal<32|64|128>(S2) -> Decimal256(S)`

スケールに対するルール：

- 加算、減算: S = max(S1, S2)。
- 乗算: S = S1 + S2。
- 除算: S = S1。

Decimalと整数間の同様の操作では、結果は引数と同じサイズのDecimalとなります。

DecimalとFloat32/Float64との演算は定義されていません。必要な場合は、toDecimal32、toDecimal64、toDecimal128、またはtoFloat32、toFloat64のビルトインを使用して引数の一方を明示的にキャストできます。ただし、結果は精度を失い、型変換は計算コストの高い操作であることに注意してください。

Decimalに対するいくつかの関数は、結果をFloat64として返します（たとえば、varやstddevなど）。中間計算はDecimalで行われることもあり、同じ値を持つFloat64とDecimalの入力間で異なる結果をもたらす可能性があります。

## Overflow Checks {#overflow-checks}

Decimalの計算中に整数オーバーフローが発生する可能性があります。小数部分の桁数が過剰になると切り捨てられます（丸められません）。整数部分の桁数が過剰になると例外が発生します。

:::warning
Decimal128およびDecimal256に対するオーバーフローチェックは実装されていません。オーバーフローが発生した場合、不正な結果が返され、例外はスローされません。
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

オーバーフローチェックは操作の遅延を引き起こします。オーバーフローが発生しないことがわかっている場合は、`decimal_check_overflow`設定を使用してチェックを無効にすることが理にかなっています。チェックが無効でオーバーフローが発生した場合、結果は不正になります：

```sql
SET decimal_check_overflow = 0;
SELECT toDecimal32(4.2, 8) AS x, 6 * x
```

```text
┌──────────x─┬─multiply(6, toDecimal32(4.2, 8))─┐
│ 4.20000000 │                     -17.74967296 │
└────────────┴──────────────────────────────────┘
```

オーバーフローチェックは、算術演算だけでなく値の比較でも行われます：

```sql
SELECT toDecimal32(1, 8) < 100
```

```text
DB::Exception: Can't compare.
```

**See also**
- [isDecimalOverflow](/sql-reference/functions/other-functions#isdecimaloverflow)
- [countDigits](/sql-reference/functions/other-functions#countdigits)
