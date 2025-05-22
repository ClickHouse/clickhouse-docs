---
'description': 'Documentation for the Decimal data types in ClickHouse, which provide
  fixed-point arithmetic with configurable precision'
'sidebar_label': 'Decimal'
'sidebar_position': 6
'slug': '/sql-reference/data-types/decimal'
'title': 'Decimal, Decimal(P), Decimal(P, S), Decimal32(S), Decimal64(S), Decimal128(S),
  Decimal256(S)'
---




# Decimal, Decimal(P), Decimal(P, S), Decimal32(S), Decimal64(S), Decimal128(S), Decimal256(S)

符号付き固定小数点数は、加算、減算、および乗算操作中に精度を保持します。除算では、最小値の桁が切り捨てられます（四捨五入されません）。

## Parameters {#parameters}

- P - 精度。有効範囲: \[ 1 : 76 \]。数値が持つことができる小数桁数を決定します（小数部分を含む）。デフォルトでは、精度は10です。
- S - スケール。有効範囲: \[ 0 : P \]。小数部分が持つことができる桁数を決定します。

Decimal(P) は Decimal(P, 0) と等価です。同様に、構文 Decimal は Decimal(10, 0) と等価です。

P パラメータの値に応じて、Decimal(P, S) は次のように同義語です:
- P が \[ 1 : 9 \] の場合 - Decimal32(S) のため
- P が \[ 10 : 18 \] の場合 - Decimal64(S) のため
- P が \[ 19 : 38 \] の場合 - Decimal128(S) のため
- P が \[ 39 : 76 \] の場合 - Decimal256(S) のため

## Decimal Value Ranges {#decimal-value-ranges}

- Decimal(P, S) - ( -1 \* 10^(P - S), 1 \* 10^(P - S) )
- Decimal32(S) - ( -1 \* 10^(9 - S), 1 \* 10^(9 - S) )
- Decimal64(S) - ( -1 \* 10^(18 - S), 1 \* 10^(18 - S) )
- Decimal128(S) - ( -1 \* 10^(38 - S), 1 \* 10^(38 - S) )
- Decimal256(S) - ( -1 \* 10^(76 - S), 1 \* 10^(76 - S) )

例えば、Decimal32(4) は -99999.9999 から 99999.9999 までの数値を 0.0001 ステップで含むことができます。

## Internal Representation {#internal-representation}

内部的にデータは、対応するビット幅の通常の符号付き整数として表現されます。メモリに格納できる実際の値範囲は上記で指定された範囲よりもわずかに大きく、そのチェックは文字列からの変換時にのみ行われます。

現代のCPUは128ビットおよび256ビット整数をネイティブにサポートしていないため、Decimal128 および Decimal256 の操作はエミュレーションされます。そのため、Decimal128 および Decimal256 は Decimal32/Decimal64 よりも大幅に遅く動作します。

## Operations and Result Type {#operations-and-result-type}

Decimal に対する二項演算は、幅のある結果型（引数の順序に関係なく）を生成します。

- `Decimal64(S1) <op> Decimal32(S2) -> Decimal64(S)`
- `Decimal128(S1) <op> Decimal32(S2) -> Decimal128(S)`
- `Decimal128(S1) <op> Decimal64(S2) -> Decimal128(S)`
- `Decimal256(S1) <op> Decimal<32|64|128>(S2) -> Decimal256(S)`

スケールのルール:

- 加算、減算: S = max(S1, S2)。
- 乗算: S = S1 + S2。
- 除算: S = S1。

Decimal と整数間の同様の操作では、結果は引数と同じサイズの Decimal になります。

Decimal と Float32/Float64 間の操作は定義されていません。それらが必要な場合は、toDecimal32、toDecimal64、toDecimal128 または toFloat32、toFloat64 のビルトインを使って明示的に引数の1つをキャストできます。ただし、結果は精度を失い、型変換は計算コストの高い操作であることに注意してください。

Decimal に対するいくつかの関数は結果を Float64 として返します（例えば、var や stddev）。中間計算は Decimal で行われることがあり、同じ値を持つ Float64 と Decimal の入力間で異なる結果をもたらすことがあります。

## Overflow Checks {#overflow-checks}

Decimal の計算中に整数のオーバーフローが発生することがあります。小数部分の過剰な桁は切り捨てられます（四捨五入されません）。整数部分の過剰な桁は例外を引き起こします。

:::warning
Decimal128 と Decimal256 にはオーバーフローチェックが実装されていません。オーバーフローが発生した場合、不正確な結果が返され、例外はスローされません。
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

オーバーフローチェックは操作の遅延を引き起こします。オーバーフローが発生しないことが知られている場合は、`decimal_check_overflow` 設定を使用してチェックを無効にすることが意味があります。チェックが無効にされ、オーバーフローが発生した場合、不正確な結果が得られます：

```sql
SET decimal_check_overflow = 0;
SELECT toDecimal32(4.2, 8) AS x, 6 * x
```

```text
┌──────────x─┬─multiply(6, toDecimal32(4.2, 8))─┐
│ 4.20000000 │                     -17.74967296 │
└────────────┴──────────────────────────────────┘
```

オーバーフローチェックは算術演算だけでなく、値の比較にも行われます：

```sql
SELECT toDecimal32(1, 8) < 100
```

```text
DB::Exception: Can't compare.
```

**See also**
- [isDecimalOverflow](/sql-reference/functions/other-functions#isdecimaloverflow)
- [countDigits](/sql-reference/functions/other-functions#countdigits)
