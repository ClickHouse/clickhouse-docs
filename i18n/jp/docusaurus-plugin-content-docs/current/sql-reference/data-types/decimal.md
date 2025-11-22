---
description: 'ClickHouse の Decimal データ型に関するドキュメント。精度を設定可能な固定小数点演算を提供します'
sidebar_label: 'Decimal'
sidebar_position: 6
slug: /sql-reference/data-types/decimal
title: 'Decimal, Decimal(P), Decimal(P, S), Decimal32(S), Decimal64(S), Decimal128(S), Decimal256(S)'
doc_type: 'reference'
---



# Decimal, Decimal(P), Decimal(P, S), Decimal32(S), Decimal64(S), Decimal128(S), Decimal256(S)

加算・減算・乗算において精度を保持する符号付き固定小数点数です。除算では最下位桁の値は四捨五入されず、切り捨てられます。



## パラメータ {#parameters}

- P - 精度。有効範囲: \[ 1 : 76 \]。数値が持つことができる10進数の桁数(小数部を含む)を決定します。デフォルトの精度は10です。
- S - スケール。有効範囲: \[ 0 : P \]。小数部が持つことができる10進数の桁数を決定します。

Decimal(P)はDecimal(P, 0)と等価です。同様に、Decimalという構文はDecimal(10, 0)と等価です。

Pパラメータの値に応じて、Decimal(P, S)は以下の同義語となります:

- Pが\[ 1 : 9 \]の範囲 - Decimal32(S)
- Pが\[ 10 : 18 \]の範囲 - Decimal64(S)
- Pが\[ 19 : 38 \]の範囲 - Decimal128(S)
- Pが\[ 39 : 76 \]の範囲 - Decimal256(S)


## Decimal値の範囲 {#decimal-value-ranges}

- Decimal(P, S) - ( -1 \* 10^(P - S), 1 \* 10^(P - S) )
- Decimal32(S) - ( -1 \* 10^(9 - S), 1 \* 10^(9 - S) )
- Decimal64(S) - ( -1 \* 10^(18 - S), 1 \* 10^(18 - S) )
- Decimal128(S) - ( -1 \* 10^(38 - S), 1 \* 10^(38 - S) )
- Decimal256(S) - ( -1 \* 10^(76 - S), 1 \* 10^(76 - S) )

例えば、Decimal32(4)は-99999.9999から99999.9999までの数値を0.0001刻みで格納できます。


## 内部表現 {#internal-representation}

内部的には、データはそれぞれのビット幅を持つ通常の符号付き整数として表現されます。メモリに格納できる実際の値の範囲は上記で指定されたものよりわずかに大きく、文字列からの変換時にのみチェックされます。

現代のCPUは128ビットおよび256ビット整数をネイティブサポートしていないため、Decimal128とDecimal256の演算はエミュレートされます。そのため、Decimal128とDecimal256はDecimal32/Decimal64と比較して著しく低速で動作します。


## 演算と結果の型 {#operations-and-result-type}

Decimal型に対する二項演算は、より広い結果型を返します(引数の順序に関わらず)。

- `Decimal64(S1) <op> Decimal32(S2) -> Decimal64(S)`
- `Decimal128(S1) <op> Decimal32(S2) -> Decimal128(S)`
- `Decimal128(S1) <op> Decimal64(S2) -> Decimal128(S)`
- `Decimal256(S1) <op> Decimal<32|64|128>(S2) -> Decimal256(S)`

スケールに関する規則:

- 加算、減算: S = max(S1, S2)
- 乗算: S = S1 + S2
- 除算: S = S1

Decimal型と整数型の間の同様の演算では、結果は引数と同じサイズのDecimal型になります。

Decimal型とFloat32/Float64型の間の演算は定義されていません。これらが必要な場合は、toDecimal32、toDecimal64、toDecimal128、またはtoFloat32、toFloat64の組み込み関数を使用して、いずれかの引数を明示的にキャストできます。結果は精度が失われ、型変換は計算コストの高い操作であることに注意してください。

Decimal型に対する一部の関数は、結果をFloat64型として返します(例: varやstddev)。中間計算はDecimal型で実行される可能性があるため、同じ値のFloat64型入力とDecimal型入力で異なる結果になる場合があります。


## オーバーフローチェック {#overflow-checks}

Decimal型の計算中に、整数オーバーフローが発生する可能性があります。小数部の余分な桁は破棄されます(四捨五入されません)。整数部の余分な桁は例外を引き起こします。

:::warning
Decimal128とDecimal256ではオーバーフローチェックが実装されていません。オーバーフローが発生した場合、例外はスローされず、誤った結果が返されます。
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

オーバーフローチェックは演算の速度低下を引き起こします。オーバーフローが発生しないことが分かっている場合は、`decimal_check_overflow`設定を使用してチェックを無効にすることが合理的です。チェックが無効でオーバーフローが発生した場合、結果は不正確になります:

```sql
SET decimal_check_overflow = 0;
SELECT toDecimal32(4.2, 8) AS x, 6 * x
```

```text
┌──────────x─┬─multiply(6, toDecimal32(4.2, 8))─┐
│ 4.20000000 │                     -17.74967296 │
└────────────┴──────────────────────────────────┘
```

オーバーフローチェックは算術演算だけでなく、値の比較でも発生します:

```sql
SELECT toDecimal32(1, 8) < 100
```

```text
DB::Exception: Can't compare.
```

**関連項目**

- [isDecimalOverflow](/sql-reference/functions/other-functions#isDecimalOverflow)
- [countDigits](/sql-reference/functions/other-functions#countDigits)
