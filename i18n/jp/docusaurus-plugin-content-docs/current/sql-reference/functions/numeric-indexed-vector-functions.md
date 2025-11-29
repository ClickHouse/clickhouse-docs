---
description: 'NumericIndexedVector に関するドキュメント'
sidebar_label: 'NumericIndexedVector'
slug: /sql-reference/functions/numeric-indexed-vector-functions
title: 'NumericIndexedVector 関数'
doc_type: 'reference'
---

# NumericIndexedVector {#numericindexedvector}

NumericIndexedVector は、ベクトルをカプセル化し、ベクトルの集約演算および要素ごとの演算を実装する抽象データ構造です。ストレージ方式として Bit-Sliced Index を利用します。理論的背景およびユースケースについては、論文 [Large-Scale Metric Computation in Online Controlled Experiment Platform](https://arxiv.org/pdf/2405.08411) を参照してください。

## BSI {#bit-sliced-index}

BSI（Bit-Sliced Index）ストレージ方式では、データはまず [Bit-Sliced Index](https://dl.acm.org/doi/abs/10.1145/253260.253268) として保存され、その後 [Roaring Bitmap](https://github.com/RoaringBitmap/RoaringBitmap) を用いて圧縮されます。集約演算や要素単位（pointwise）の演算は圧縮データ上で直接実行されるため、ストレージ効率とクエリ効率を大幅に向上できます。

ベクタにはインデックスとそれに対応する値が含まれます。BSI ストレージモードにおけるこのデータ構造の特徴と制約は次のとおりです。

- インデックスタイプは `UInt8`、`UInt16`、`UInt32` のいずれかです。**注意：** Roaring Bitmap の 64 ビット実装の性能を考慮し、BSI フォーマットは `UInt64`/`Int64` をサポートしません。
- 値の型は `Int8`、`Int16`、`Int32`、`Int64`、`UInt8`、`UInt16`、`UInt32`、`UInt64`、`Float32`、`Float64` のいずれかです。**注意：** 値の型は自動的には拡張されません。たとえば、値の型として `UInt8` を使用した場合、`UInt8` の容量を超える合計値は、より高い型に昇格されるのではなくオーバーフローします。同様に、整数に対する演算は整数結果を返します（たとえば、除算は自動的に浮動小数点結果に変換されません）。したがって、値の型は事前に計画・設計しておくことが重要です。実運用シナリオでは、浮動小数点型（`Float32`/`Float64`）が一般的に使用されます。
- 同じインデックスタイプおよび値の型を持つ 2 つのベクタ同士でのみ演算を行えます。
- 下層のストレージは Bit-Sliced Index を使用し、インデックスをビットマップとして保持します。ビットマップの具体的な実装として Roaring Bitmap が使用されます。ベストプラクティスとしては、圧縮率とクエリ性能を最大化するために、可能な限りインデックスを少数の Roaring Bitmap コンテナに集中させることが推奨されます。
- Bit-Sliced Index のメカニズムでは、値は二進数に変換されます。浮動小数点型に対しては固定小数点表現による変換を行うため、精度が失われる可能性があります。精度は、小数部に使用するビット数をカスタマイズすることで調整可能であり、デフォルトは 24 ビットです。これはほとんどのシナリオに十分です。集約関数 groupNumericIndexedVector によって `-State` を伴う NumericIndexedVector を構築する際に、整数部ビット数と小数部ビット数をカスタマイズできます。
- インデックスには、非ゼロ値、ゼロ値、存在しないものの 3 パターンがあります。NumericIndexedVector では、非ゼロ値とゼロ値のみが保存されます。さらに、2 つの NumericIndexedVector 間での要素単位演算では、存在しないインデックスの値は 0 とみなされます。除算のシナリオでは、除数がゼロの場合、結果はゼロになります。

## numericIndexedVector オブジェクトを作成する {#create-numeric-indexed-vector-object}

この構造を作成する方法は 2 通りあります。1 つは、集約関数 `groupNumericIndexedVector` に `-State` を付けて使用する方法です。
追加の条件を指定するには、サフィックスとして `-if` を付けることができます。
この集約関数は、その条件を満たした行のみを処理します。
もう 1 つは、`numericIndexedVectorBuild` を使って map から構築する方法です。
`groupNumericIndexedVectorState` 関数では、パラメータを通じて整数部および小数部のビット数をカスタマイズできますが、`numericIndexedVectorBuild` ではできません。

## groupNumericIndexedVector {#group-numeric-indexed-vector}

2 つのデータ列から NumericIndexedVector を構築し、すべての値の合計を `Float64` 型で返します。末尾にサフィックス `State` を付けた場合は、NumericIndexedVector オブジェクトを返します。

**構文**

```sql
groupNumericIndexedVectorState(col1, col2)
groupNumericIndexedVectorState(type, integer_bit_num, fraction_bit_num)(col1, col2)
```

**パラメータ**

* `type`: String、省略可能。ストレージ形式を指定します。現在サポートされているのは `'BSI'` のみです。
* `integer_bit_num`: `UInt32`、省略可能。`'BSI'` ストレージ形式で有効であり、このパラメータは整数部に使用されるビット数を示します。インデックスの型が整数型の場合、デフォルト値はインデックスの格納に使用されるビット数に対応します。例えば、インデックスの型が UInt16 の場合、デフォルトの `integer_bit_num` は 16 です。インデックスの型が Float32 および Float64 の場合、`integer_bit_num` のデフォルト値は 40 であり、そのため表現可能なデータの整数部は `[-2^39, 2^39 - 1]` の範囲になります。許可される範囲は `[0, 64]` です。
* `fraction_bit_num`: `UInt32`、省略可能。`'BSI'` ストレージ形式で有効であり、このパラメータは小数部に使用されるビット数を示します。値の型が整数の場合、デフォルト値は 0 です。値の型が Float32 または Float64 の場合、デフォルト値は 24 です。有効な範囲は `[0, 24]` です。
* さらに、`integer_bit_num + fraction_bit_num` の有効な範囲も `[0, 64]` であるという制約があります。
* `col1`: インデックス列。サポートされる型: `UInt8`/`UInt16`/`UInt32`/`Int8`/`Int16`/`Int32`。
* `col2`: 値列。サポートされる型: `Int8`/`Int16`/`Int32`/`Int64`/`UInt8`/`UInt16`/`UInt32`/`UInt64`/`Float32`/`Float64`。

**戻り値**

すべての値の合計を表す `Float64` 値。

**例**

テストデータ:

```text
UserID  PlayTime
1       10
2       20
3       30
```

クエリと結果:

```sql
SELECT groupNumericIndexedVector(UserID, PlayTime) AS num FROM t;
┌─num─┐
│  60 │
└─────┘

SELECT groupNumericIndexedVectorState(UserID, PlayTime) as res, toTypeName(res), numericIndexedVectorAllValueSum(res) FROM t;
┌─res─┬─toTypeName(res)─────────────────────────────────────────────┬─numericIndexedVectorAllValueSum(res)──┐
│     │ AggregateFunction(groupNumericIndexedVector, UInt8, UInt8)  │ 60                                    │
└─────┴─────────────────────────────────────────────────────────────┴───────────────────────────────────────┘

SELECT groupNumericIndexedVectorStateIf(UserID, PlayTime, day = '2025-04-22') as res, toTypeName(res), numericIndexedVectorAllValueSum(res) FROM t;
┌─res─┬─toTypeName(res)────────────────────────────────────────────┬─numericIndexedVectorAllValueSum(res)──┐
│     │ AggregateFunction(groupNumericIndexedVector, UInt8, UInt8) │ 30                                    │
└─────┴────────────────────────────────────────────────────────────┴───────────────────────────────────────┘

SELECT groupNumericIndexedVectorStateIf('BSI', 32, 0)(UserID, PlayTime, day = '2025-04-22') as res, toTypeName(res), numericIndexedVectorAllValueSum(res) FROM t;
┌─res─┬─toTypeName(res)──────────────────────────────────────────────────────────┬─numericIndexedVectorAllValueSum(res)──┐
│     │ AggregateFunction('BSI', 32, 0)(groupNumericIndexedVector, UInt8, UInt8) │ 30                                    │
└─────┴──────────────────────────────────────────────────────────────────────────┴───────────────────────────────────────┘
```

:::note
このドキュメントは `system.functions` システムテーブルから生成されています。
:::

{/* 
  以下のタグは system テーブルからドキュメントを自動生成するために使用されるものであり、削除しないでください。
  詳細については https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md を参照してください。
  */ }

{/*AUTOGENERATED_START*/ }

{/*AUTOGENERATED_END*/ }
