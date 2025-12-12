---
description: 'NumericIndexedVector およびその関数のドキュメント'
sidebar_label: 'NumericIndexedVector'
slug: /sql-reference/functions/numeric-indexed-vector-functions
title: 'NumericIndexedVector の関数'
doc_type: 'reference'
---

# NumericIndexedVector {#numericindexedvector}

NumericIndexedVector は、ベクトルをカプセル化し、ベクトルの集約および要素単位の演算を実装する抽象データ構造です。Bit-Sliced Index をそのストレージ方式として利用します。理論的な背景と利用シナリオについては、論文 [Large-Scale Metric Computation in Online Controlled Experiment Platform](https://arxiv.org/pdf/2405.08411) を参照してください。

## BSI {#bit-sliced-index}

BSI（Bit-Sliced Index）ストレージ方式では、データは[Bit-Sliced Index](https://dl.acm.org/doi/abs/10.1145/253260.253268)として保存され、その後[Roaring Bitmap](https://github.com/RoaringBitmap/RoaringBitmap)を用いて圧縮されます。集約演算および要素ごとの演算は圧縮データに対して直接実行され、ストレージおよびクエリの効率を大幅に向上させることができます。

ベクトルはインデックスとそれに対応する値を保持します。以下は、BSI ストレージモードにおけるこのデータ構造の特徴と制約です。

- インデックスタイプは `UInt8`、`UInt16`、`UInt32` のいずれかです。**注:** Roaring Bitmap の 64 ビット実装の性能を考慮し、BSI フォーマットは `UInt64`/`Int64` をサポートしません。
- 値の型は `Int8`、`Int16`、`Int32`、`Int64`、`UInt8`、`UInt16`、`UInt32`、`UInt64`、`Float32`、`Float64` のいずれかです。**注:** 値の型は自動的に拡張されません。たとえば、値の型として `UInt8` を使用した場合、`UInt8` の容量を超える合計値は、より高い型に昇格されるのではなくオーバーフローを引き起こします。同様に、整数に対する演算は整数の結果を返します（例: 除算は自動的に浮動小数点の結果に変換されません）。したがって、値の型は事前に計画・設計しておくことが重要です。実運用のシナリオでは、浮動小数点型（`Float32`/`Float64`）が一般的に使用されます。
- 同じインデックスタイプおよび値の型を持つ 2 つのベクトルのみが演算を行うことができます。
- 下位ストレージ層では Bit-Sliced Index を使用し、ビットマップはインデックスを保持します。ビットマップの具体的な実装として Roaring Bitmap が使用されます。ベストプラクティスとしては、圧縮率とクエリ性能を最大化するために、インデックスをできるだけ少数の Roaring Bitmap コンテナに集中させることが推奨されます。
- Bit-Sliced Index の仕組みでは、値は 2 進数に変換されます。浮動小数点型については固定小数点表現による変換が行われるため、精度が損なわれる可能性があります。精度は、小数部に使用するビット数をカスタマイズすることで調整でき、デフォルトは 24 ビットであり、ほとんどのシナリオで十分です。集約関数 groupNumericIndexedVector の `-State` 版を用いて NumericIndexedVector を構築する際に、整数部と小数部に使用するビット数をカスタマイズできます。
- インデックスには、非ゼロ値を持つもの、ゼロ値を持つもの、存在しないものの 3 通りがあります。NumericIndexedVector では、非ゼロ値とゼロ値のみが保存されます。さらに、2 つの NumericIndexedVector 間の要素ごとの演算において、存在しないインデックスの値は 0 として扱われます。除算のシナリオでは、除数が 0 の場合、結果は 0 になります。

## numericIndexedVector オブジェクトを作成する {#create-numeric-indexed-vector-object}

この構造を作成する方法は 2 つあります。1 つは、集約関数 `groupNumericIndexedVector` に `-State` を付けて使用する方法です。
追加の条件を指定できるように、接尾辞 `-if` を付けることができます。
集約関数は、その条件を満たす行のみを処理します。
もう 1 つは、`numericIndexedVectorBuild` を使用して Map から構築する方法です。
`groupNumericIndexedVectorState` 関数では、パラメータによって整数ビット数と小数ビット数をカスタマイズできますが、`numericIndexedVectorBuild` にはその機能はありません。

## groupNumericIndexedVector {#group-numeric-indexed-vector}

2 つのデータ列から NumericIndexedVector を構築し、すべての値の合計を `Float64` 型で返します。末尾に `State` を付けた場合は、NumericIndexedVector オブジェクトを返します。

**構文**

```sql
groupNumericIndexedVectorState(col1, col2)
groupNumericIndexedVectorState(type, integer_bit_num, fraction_bit_num)(col1, col2)
```

**パラメータ**

* `type`: 文字列型、省略可能。ストレージ形式を指定します。現在サポートされているのは `'BSI'` のみです。
* `integer_bit_num`: `UInt32`、省略可能。`'BSI'` ストレージ形式で有効で、このパラメータは整数部に使用するビット数を示します。インデックス型が整数型の場合、デフォルト値はインデックスの格納に使用されるビット数に一致します。たとえば、インデックス型が `UInt16` の場合、デフォルトの `integer_bit_num` は 16 です。インデックス型が `Float32` および `Float64` の場合、`integer_bit_num` のデフォルト値は 40 であるため、表現可能なデータの整数部の範囲は `[-2^39, 2^39 - 1]` となります。有効な範囲は `[0, 64]` です。
* `fraction_bit_num`: `UInt32`、省略可能。`'BSI'` ストレージ形式で有効で、このパラメータは小数部に使用するビット数を示します。値の型が整数の場合、デフォルト値は 0 です。値の型が `Float32` または `Float64` の場合、デフォルト値は 24 です。有効な範囲は `[0, 24]` です。
* さらに、`integer_bit_num` + `fraction_bit_num` の有効な範囲は `[0, 64]` であるという制約があります。
* `col1`: インデックス列。サポートされる型: `UInt8`/`UInt16`/`UInt32`/`Int8`/`Int16`/`Int32`。
* `col2`: 値列。サポートされる型: `Int8`/`Int16`/`Int32`/`Int64`/`UInt8`/`UInt16`/`UInt32`/`UInt64`/`Float32`/`Float64`。

**戻り値**

すべての値の合計を表す `Float64` 型の値。

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
このドキュメントは、`system.functions` システムテーブルから自動生成されたものです。
:::

{/* 
  これらのタグは system テーブルからドキュメントを生成するために使用されており、削除しないでください。
  詳細については https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md を参照してください。
  */ }

{/*AUTOGENERATED_START*/ }

## numericIndexedVectorAllValueSum {#numericIndexedVectorAllValueSum}

導入バージョン: v25.7

`numericIndexedVector` のすべての値の合計を返します。

**構文**

```sql
numericIndexedVectorAllValueSum(v)
```

**引数**

* `v` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**戻り値**

合計を返します。[`Float64`](/sql-reference/data-types/float)

**例**

**使用例**

```sql title=Query
SELECT numericIndexedVectorAllValueSum(numericIndexedVectorBuild(mapFromArrays([1, 2, 3], [10, 20, 30]))) AS res;
```

```response title=Response
┌─res─┐
│  60 │
└─────┘
```



## numericIndexedVectorBuild {#numericIndexedVectorBuild}

Introduced in: v25.7


Creates a NumericIndexedVector from a map. The map's keys represent the vector's index and map's value represents the vector's value.
        

**Syntax**

```sql
numericIndexedVectorBuild(map)
```

**Arguments**

- `map` — A mapping from index to value. [`Map`](/sql-reference/data-types/map)


**Returned value**

Returns a NumericIndexedVector object. [`AggregateFunction`](/sql-reference/data-types/aggregatefunction)

**Examples**

**Usage example**

```sql title=Query
SELECT numericIndexedVectorBuild(mapFromArrays([1, 2, 3], [10, 20, 30])) AS res, toTypeName(res);
```

```response title=Response
┌─res─┬─toTypeName(res)────────────────────────────────────────────┐
│     │ AggregateFunction(groupNumericIndexedVector, UInt8, UInt8) │
└─────┴────────────────────────────────────────────────────────────┘
```



## numericIndexedVectorCardinality {#numericIndexedVectorCardinality}

Introduced in: v25.7


Returns the cardinality (number of unique indexes) of the numericIndexedVector.
        

**Syntax**

```sql
numericIndexedVectorCardinality(v)
```

**Arguments**

- `v` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)


**Returned value**

Returns the number of unique indexes. [`UInt64`](/sql-reference/data-types/int-uint)

**Examples**

**Usage example**

```sql title=Query
SELECT numericIndexedVectorCardinality(numericIndexedVectorBuild(mapFromArrays([1, 2, 3], [10, 20, 30]))) AS res;
```

```response title=Response
┌─res─┐
│  3  │
└─────┘
```



## numericIndexedVectorGetValue {#numericIndexedVectorGetValue}

Introduced in: v25.7


Retrieves the value corresponding to a specified index from a numericIndexedVector.
        

**Syntax**

```sql
numericIndexedVectorGetValue(v, i)
```

**Arguments**

- `v` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
- `i` — The index for which the value is to be retrieved. [`(U)Int*`](/sql-reference/data-types/int-uint)


**Returned value**

A numeric value with the same type as the value type of NumericIndexedVector. [`(U)Int*`](/sql-reference/data-types/int-uint) or [`Float*`](/sql-reference/data-types/float)

**Examples**

**Usage example**

```sql title=Query
SELECT numericIndexedVectorGetValue(numericIndexedVectorBuild(mapFromArrays([1, 2, 3], [10, 20, 30])), 3) AS res;
```

```response title=Response
┌─res─┐
│  30 │
└─────┘
```



## numericIndexedVectorPointwiseAdd {#numericIndexedVectorPointwiseAdd}

Introduced in: v25.7


Performs pointwise addition between a numericIndexedVector and either another numericIndexedVector or a numeric constant.
        

**Syntax**

```sql
numericIndexedVectorPointwiseAdd(v1, v2)
```

**Arguments**

- `v1` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
- `v2` — A numeric constant or numericIndexedVector object. [`(U)Int*`](/sql-reference/data-types/int-uint) or [`Float*`](/sql-reference/data-types/float) or [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)


**Returned value**

Returns a new numericIndexedVector object. [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Examples**

**Usage example**

```sql title=Query
WITH
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toInt32(x), [10, 20, 30]))) AS vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toInt32(x), [10, 20, 30]))) AS vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseAdd(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseAdd(vec1, 2)) AS res2;
```

```response title=Response
┌─res1──────────────────┬─res2─────────────┐
│ {1:10,2:30,3:50,4:30} │ {1:12,2:22,3:32} │
└───────────────────────┴──────────────────┘
```



## numericIndexedVectorPointwiseDivide {#numericIndexedVectorPointwiseDivide}

Introduced in: v25.7


Performs pointwise division between a numericIndexedVector and either another numericIndexedVector or a numeric constant.
        

**Syntax**

```sql
numericIndexedVectorPointwiseDivide(v1, v2)
```

**Arguments**

- `v1` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
- `v2` — A numeric constant or numericIndexedVector object. [`(U)Int*`](/sql-reference/data-types/int-uint) or [`Float*`](/sql-reference/data-types/float) or [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)


**Returned value**

Returns a new numericIndexedVector object. [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Examples**

**Usage example**

```sql title=Query
with
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toFloat64(x), [10, 20, 30]))) as vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toFloat64(x), [10, 20, 30]))) as vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseDivide(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseDivide(vec1, 2)) AS res2;
```

```response title=Response
┌─res1────────┬─res2────────────┐
│ {2:2,3:1.5} │ {1:5,2:10,3:15} │
└─────────────┴─────────────────┘
```



## numericIndexedVectorPointwiseEqual {#numericIndexedVectorPointwiseEqual}

Introduced in: v25.7


Performs pointwise comparison between a numericIndexedVector and either another numericIndexedVector or a numeric constant.
The result is a numericIndexedVector containing the indices where the values are equal, with all corresponding values set to 1.
        

**Syntax**

```sql
numericIndexedVectorPointwiseEqual(v1, v2)
```

**Arguments**

- `v1` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
- `v2` — A numeric constant or numericIndexedVector object. [`(U)Int*`](/sql-reference/data-types/int-uint) or [`Float*`](/sql-reference/data-types/float) or [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)


**Returned value**

Returns a new numericIndexedVector object. [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Examples**

****

```sql title=Query
with
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toFloat64(x), [10, 20, 30]))) as vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toFloat64(x), [20, 20, 30]))) as vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseEqual(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseEqual(vec1, 20)) AS res2;
```

```response title=Response
┌─res1──┬─res2──┐
│ {2:1} │ {2:1} │
└───────┴───────┘
```



## numericIndexedVectorPointwiseGreater {#numericIndexedVectorPointwiseGreater}

Introduced in: v25.7


Performs pointwise comparison between a numericIndexedVector and either another numericIndexedVector or a numeric constant.
The result is a numericIndexedVector containing the indices where the first vector's value is greater than the second vector's value, with all corresponding values set to 1.
        

**Syntax**

```sql
numericIndexedVectorPointwiseGreater(v1, v2)
```

**Arguments**

- `v1` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
- `v2` — A numeric constant or numericIndexedVector object. [`(U)Int*`](/sql-reference/data-types/int-uint) or [`Float*`](/sql-reference/data-types/float) or [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)


**Returned value**

Returns a new numericIndexedVector object. [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Examples**

**Usage example**

```sql title=Query
with
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toFloat64(x), [10, 20, 50]))) as vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toFloat64(x), [20, 40, 30]))) as vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseGreater(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseGreater(vec1, 20)) AS res2;
```

```response title=Response
┌─res1──────┬─res2──┐
│ {1:1,3:1} │ {3:1} │
└───────────┴───────┘
```



## numericIndexedVectorPointwiseGreaterEqual {#numericIndexedVectorPointwiseGreaterEqual}

Introduced in: v25.7


Performs pointwise comparison between a numericIndexedVector and either another numericIndexedVector or a numeric constant.
The result is a numericIndexedVector containing the indices where the first vector's value is greater than or equal to the second vector's value, with all corresponding values set to 1.
        

**Syntax**

```sql
numericIndexedVectorPointwiseGreaterEqual(v1, v2)
```

**Arguments**

- `v1` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
- `v2` — A numeric constant or numericIndexedVector object. [`(U)Int*`](/sql-reference/data-types/int-uint) or [`Float*`](/sql-reference/data-types/float) or [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)


**Returned value**

Returns a new numericIndexedVector object. [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Examples**

**Usage example**

```sql title=Query
with
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toFloat64(x), [10, 20, 50]))) as vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toFloat64(x), [20, 40, 30]))) as vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseGreaterEqual(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseGreaterEqual(vec1, 20)) AS res2;
```

```response title=Response
┌─res1──────────┬─res2──────┐
│ {1:1,2:1,3:1} │ {2:1,3:1} │
└───────────────┴───────────┘
```



## numericIndexedVectorPointwiseLess {#numericIndexedVectorPointwiseLess}

Introduced in: v25.7


Performs pointwise comparison between a numericIndexedVector and either another numericIndexedVector or a numeric constant.
The result is a numericIndexedVector containing the indices where the first vector's value is less than the second vector's value, with all corresponding values set to 1.
        

**Syntax**

```sql
numericIndexedVectorPointwiseLess(v1, v2)
```

**Arguments**

- `v1` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
- `v2` — A numeric constant or numericIndexedVector object. [`(U)Int*`](/sql-reference/data-types/int-uint) or [`Float*`](/sql-reference/data-types/float) or [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)


**Returned value**

Returns a new numericIndexedVector object. [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Examples**

**Usage example**

```sql title=Query
with
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toFloat64(x), [10, 20, 30]))) as vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toFloat64(x), [20, 40, 30]))) as vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseLess(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseLess(vec1, 20)) AS res2;
```

```response title=Response
┌─res1──────┬─res2──┐
│ {3:1,4:1} │ {1:1} │
└───────────┴───────┘
```



## numericIndexedVectorPointwiseLessEqual {#numericIndexedVectorPointwiseLessEqual}

Introduced in: v25.7


Performs pointwise comparison between a numericIndexedVector and either another numericIndexedVector or a numeric constant.
The result is a numericIndexedVector containing the indices where the first vector's value is less than or equal to the second vector's value, with all corresponding values set to 1.
        

**Syntax**

```sql
numericIndexedVectorPointwiseLessEqual(v1, v2)
```

**Arguments**

- `v1` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
- `v2` — A numeric constant or numericIndexedVector object [`(U)Int*`](/sql-reference/data-types/int-uint) or [`Float*`](/sql-reference/data-types/float) or [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)


**Returned value**

Returns a new numericIndexedVector object. [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Examples**

**Usage example**

```sql title=Query
with
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toFloat64(x), [10, 20, 30]))) as vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toFloat64(x), [20, 40, 30]))) as vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseLessEqual(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseLessEqual(vec1, 20)) AS res2;
```

```response title=Response
┌─res1──────────┬─res2──────┐
│ {2:1,3:1,4:1} │ {1:1,2:1} │
└───────────────┴───────────┘
```



## numericIndexedVectorPointwiseMultiply {#numericIndexedVectorPointwiseMultiply}

Introduced in: v25.7


Performs pointwise multiplication between a numericIndexedVector and either another numericIndexedVector or a numeric constant.
        

**Syntax**

```sql
numericIndexedVectorPointwiseMultiply(v1, v2)
```

**Arguments**

- `v1` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
- `v2` — A numeric constant or numericIndexedVector object. [`(U)Int*`](/sql-reference/data-types/int-uint) or [`Float*`](/sql-reference/data-types/float) or [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)


**Returned value**

Returns a new numericIndexedVector object. [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Examples**

****

```sql title=Query
with
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toInt32(x), [10, 20, 30]))) as vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toInt32(x), [10, 20, 30]))) as vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseMultiply(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseMultiply(vec1, 2)) AS res2;
```

```response title=Response
┌─res1──────────┬─res2─────────────┐
│ {2:200,3:600} │ {1:20,2:40,3:60} │
└───────────────┴──────────────────┘
```



## numericIndexedVectorPointwiseNotEqual {#numericIndexedVectorPointwiseNotEqual}

Introduced in: v25.7


Performs pointwise comparison between a numericIndexedVector and either another numericIndexedVector or a numeric constant.
The result is a numericIndexedVector containing the indices where the values are not equal, with all corresponding values set to 1.
        

**Syntax**

```sql
numericIndexedVectorPointwiseNotEqual(v1, v2)
```

**Arguments**

- `v1` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
- `v2` — A numeric constant or numericIndexedVector object. [`(U)Int*`](/sql-reference/data-types/int-uint) or [`Float*`](/sql-reference/data-types/float) or [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)


**Returned value**

Returns a new numericIndexedVector object. [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Examples**

**Usage example**

```sql title=Query
with
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toFloat64(x), [10, 20, 30]))) as vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toFloat64(x), [20, 20, 30]))) as vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseNotEqual(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseNotEqual(vec1, 20)) AS res2;
```

```response title=Response
┌─res1──────────┬─res2──────┐
│ {1:1,3:1,4:1} │ {1:1,3:1} │
└───────────────┴───────────┘
```



## numericIndexedVectorPointwiseSubtract {#numericIndexedVectorPointwiseSubtract}

Introduced in: v25.7


Performs pointwise subtraction between a numericIndexedVector and either another numericIndexedVector or a numeric constant.
        

**Syntax**

```sql
numericIndexedVectorPointwiseSubtract(v1, v2)
```

**Arguments**

- `v1` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
- `v2` — A numeric constant or numericIndexedVector object. [`(U)Int*`](/sql-reference/data-types/int-uint) or [`Float*`](/sql-reference/data-types/float) or [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)


**Returned value**

Returns a new numericIndexedVector object. [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Examples**

**Usage example**

```sql title=Query
WITH
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toInt32(x), [10, 20, 30]))) AS vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toInt32(x), [10, 20, 30]))) AS vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseSubtract(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseSubtract(vec1, 2)) AS res2;
```

```response title=Response
┌─res1───────────────────┬─res2────────────┐
│ {1:10,2:10,3:10,4:-30} │ {1:8,2:18,3:28} │
└────────────────────────┴─────────────────┘
```



## numericIndexedVectorShortDebugString {#numericIndexedVectorShortDebugString}

Introduced in: v25.7


Returns internal information of the numericIndexedVector in JSON format.
This function is primarily used for debugging purposes.
        

**Syntax**

```sql
numericIndexedVectorShortDebugString(v)
```

**Arguments**

- `v` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)


**Returned value**

Returns a JSON string containing debug information. [`String`](/sql-reference/data-types/string)

**Examples**

**Usage example**

```sql title=Query
SELECT numericIndexedVectorShortDebugString(numericIndexedVectorBuild(mapFromArrays([1, 2, 3], [10, 20, 30]))) AS res\G;
```

```response title=Response
1 行目：
──────
res: {"vector_type":"BSI","index_type":"char8_t","value_type":"char8_t","integer_bit_num":8,"fraction_bit_num":0,"zero_indexes_info":{"cardinality":"0"},"non_zero_indexes_info":{"total_cardinality":"3","all_value_sum":60,"number_of_bitmaps":"8","bitmap_info":{"cardinality":{"0":"0","1":"2","2":"2","3":"2","4":"2","5":"0","6":"0","7":"0"}}}}
```



## numericIndexedVectorToMap {#numericIndexedVectorToMap}

Introduced in: v25.7


Converts a numericIndexedVector to a map.
        

**Syntax**

```sql
numericIndexedVectorToMap(v)
```

**Arguments**

- `v` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)


**Returned value**

Returns a map with index-value pairs. [`Map`](/sql-reference/data-types/map)

**Examples**

**Usage example**

```sql title=Query
SELECT numericIndexedVectorToMap(numericIndexedVectorBuild(mapFromArrays([1, 2, 3], [10, 20, 30]))) AS res;
```

```response title=Response
┌─res──────────────┐
│ {1:10,2:20,3:30} │
└──────────────────┘
```

{/*AUTOGENERATED_END*/ }
