---
description: 'NumericIndexedVector とその関数に関するドキュメント'
sidebar_label: 'NumericIndexedVector'
slug: /sql-reference/functions/numeric-indexed-vector-functions
title: 'NumericIndexedVector 関数'
doc_type: 'reference'
---



# NumericIndexedVector

NumericIndexedVector は、ベクトルをカプセル化し、ベクトルの集約演算および要素単位の演算を実装する抽象データ構造です。ストレージ方式として Bit-Sliced Index を用います。理論的背景および利用シナリオについては、論文 [Large-Scale Metric Computation in Online Controlled Experiment Platform](https://arxiv.org/pdf/2405.08411) を参照してください。



## BSI {#bit-sliced-index}

BSI（Bit-Sliced Index）ストレージ方式では、データは[Bit-Sliced Index](https://dl.acm.org/doi/abs/10.1145/253260.253268)に格納され、[Roaring Bitmap](https://github.com/RoaringBitmap/RoaringBitmap)を使用して圧縮されます。集約操作と要素単位の操作は圧縮データ上で直接実行されるため、ストレージとクエリの効率を大幅に向上させることができます。

ベクトルはインデックスとそれに対応する値を含みます。以下は、BSIストレージモードにおけるこのデータ構造の特性と制約です:

- インデックス型は`UInt8`、`UInt16`、または`UInt32`のいずれかを使用できます。**注:** Roaring Bitmapの64ビット実装のパフォーマンスを考慮して、BSI形式は`UInt64`/`Int64`をサポートしていません。
- 値型は`Int8`、`Int16`、`Int32`、`Int64`、`UInt8`、`UInt16`、`UInt32`、`UInt64`、`Float32`、または`Float64`のいずれかを使用できます。**注:** 値型は自動的に拡張されません。例えば、値型として`UInt8`を使用した場合、`UInt8`の容量を超える合計は上位の型に昇格されず、オーバーフローが発生します。同様に、整数に対する演算は整数の結果を生成します(例えば、除算は自動的に浮動小数点の結果に変換されません)。したがって、事前に値型を計画し設計することが重要です。実際のシナリオでは、浮動小数点型(`Float32`/`Float64`)が一般的に使用されます。
- 同じインデックス型と値型を持つ2つのベクトルのみが演算を実行できます。
- 基盤となるストレージはBit-Sliced Indexを使用し、ビットマップでインデックスを格納します。Roaring Bitmapがビットマップの具体的な実装として使用されます。ベストプラクティスは、圧縮とクエリパフォーマンスを最大化するために、インデックスをできるだけ少数のRoaring Bitmapコンテナに集中させることです。
- Bit-Sliced Indexメカニズムは値を2進数に変換します。浮動小数点型の場合、変換には固定小数点表現が使用され、精度の損失が発生する可能性があります。精度は小数部に使用するビット数をカスタマイズすることで調整でき、デフォルトは24ビットで、ほとんどのシナリオで十分です。集約関数groupNumericIndexedVectorを`-State`と共に使用してNumericIndexedVectorを構築する際に、整数ビット数と小数ビット数をカスタマイズできます。
- インデックスには3つのケースがあります:非ゼロ値、ゼロ値、および存在しない値です。NumericIndexedVectorでは、非ゼロ値とゼロ値のみが格納されます。さらに、2つのNumericIndexedVector間の要素単位の演算では、存在しないインデックスの値は0として扱われます。除算のシナリオでは、除数がゼロの場合、結果はゼロになります。


## numericIndexedVectorオブジェクトの作成 {#create-numeric-indexed-vector-object}

この構造を作成する方法は2つあります。1つ目は、集約関数`groupNumericIndexedVector`を`-State`と組み合わせて使用する方法です。
追加の条件を指定するには、サフィックス`-if`を付加することができます。
集約関数は、条件を満たす行のみを処理します。
2つ目は、`numericIndexedVectorBuild`を使用してマップから構築する方法です。
`groupNumericIndexedVectorState`関数では、パラメータを通じて整数ビット数と小数ビット数をカスタマイズできますが、`numericIndexedVectorBuild`ではカスタマイズできません。


## groupNumericIndexedVector {#group-numeric-indexed-vector}

2つのデータ列からNumericIndexedVectorを構築し、すべての値の合計を`Float64`型として返します。接尾辞`State`を追加すると、NumericIndexedVectorオブジェクトを返します。

**構文**

```sql
groupNumericIndexedVectorState(col1, col2)
groupNumericIndexedVectorState(type, integer_bit_num, fraction_bit_num)(col1, col2)
```

**パラメータ**

- `type`: 文字列、オプション。ストレージ形式を指定します。現在、`'BSI'`のみがサポートされています。
- `integer_bit_num`: `UInt32`、オプション。`'BSI'`ストレージ形式で有効です。このパラメータは整数部に使用されるビット数を示します。インデックス型が整数型の場合、デフォルト値はインデックスの格納に使用されるビット数に対応します。例えば、インデックス型がUInt16の場合、デフォルトの`integer_bit_num`は16です。Float32およびFloat64インデックス型の場合、integer_bit_numのデフォルト値は40であり、表現可能なデータの整数部の範囲は`[-2^39, 2^39 - 1]`となります。有効な範囲は`[0, 64]`です。
- `fraction_bit_num`: `UInt32`、オプション。`'BSI'`ストレージ形式で有効です。このパラメータは小数部に使用されるビット数を示します。値の型が整数の場合、デフォルト値は0です。値の型がFloat32またはFloat64型の場合、デフォルト値は24です。有効な範囲は`[0, 24]`です。
- また、integer_bit_num + fraction_bit_numの有効な範囲は[0, 64]であるという制約があります。
- `col1`: インデックス列。サポートされる型: `UInt8`/`UInt16`/`UInt32`/`Int8`/`Int16`/`Int32`。
- `col2`: 値列。サポートされる型: `Int8`/`Int16`/`Int32`/`Int64`/`UInt8`/`UInt16`/`UInt32`/`UInt64`/`Float32`/`Float64`。

**戻り値**

すべての値の合計を表す`Float64`値。

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
以下のドキュメントは`system.functions`システムテーブルから生成されています。
:::

<!--
the tags below are used to generate the documentation from system tables, and should not be removed.
For more details see https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
-->


<!--AUTOGENERATED_START-->

## numericIndexedVectorAllValueSum {#numericIndexedVectorAllValueSum}

導入バージョン: v25.7

numericIndexedVector内のすべての値の合計を返します。

**構文**

```sql
numericIndexedVectorAllValueSum(v)
```

**引数**

- `v` — [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**戻り値**

合計を返します。[`Float64`](/sql-reference/data-types/float)

**例**

**使用例**

```sql title=クエリ
SELECT numericIndexedVectorAllValueSum(numericIndexedVectorBuild(mapFromArrays([1, 2, 3], [10, 20, 30]))) AS res;
```

```response title=レスポンス
┌─res─┐
│  60 │
└─────┘
```


## numericIndexedVectorBuild {#numericIndexedVectorBuild}

導入バージョン: v25.7

マップからNumericIndexedVectorを作成します。マップのキーはベクトルのインデックスを表し、マップの値はベクトルの値を表します。

**構文**

```sql
numericIndexedVectorBuild(map)
```

**引数**

- `map` — インデックスから値へのマッピング。[`Map`](/sql-reference/data-types/map)

**戻り値**

NumericIndexedVectorオブジェクトを返します。[`AggregateFunction`](/sql-reference/data-types/aggregatefunction)

**例**

**使用例**

```sql title=クエリ
SELECT numericIndexedVectorBuild(mapFromArrays([1, 2, 3], [10, 20, 30])) AS res, toTypeName(res);
```

```response title=レスポンス
┌─res─┬─toTypeName(res)────────────────────────────────────────────┐
│     │ AggregateFunction(groupNumericIndexedVector, UInt8, UInt8) │
└─────┴────────────────────────────────────────────────────────────┘
```


## numericIndexedVectorCardinality {#numericIndexedVectorCardinality}

導入バージョン: v25.7

numericIndexedVectorのカーディナリティ（一意のインデックス数）を返します。

**構文**

```sql
numericIndexedVectorCardinality(v)
```

**引数**

- `v` — [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**戻り値**

一意のインデックス数を返します。[`UInt64`](/sql-reference/data-types/int-uint)

**例**

**使用例**

```sql title=Query
SELECT numericIndexedVectorCardinality(numericIndexedVectorBuild(mapFromArrays([1, 2, 3], [10, 20, 30]))) AS res;
```

```response title=Response
┌─res─┐
│  3  │
└─────┘
```


## numericIndexedVectorGetValue {#numericIndexedVectorGetValue}

導入バージョン: v25.7

numericIndexedVectorから指定されたインデックスに対応する値を取得します。

**構文**

```sql
numericIndexedVectorGetValue(v, i)
```

**引数**

- `v` — [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
- `i` — 値を取得するインデックス。[`(U)Int*`](/sql-reference/data-types/int-uint)

**戻り値**

NumericIndexedVectorの値型と同じ型の数値。[`(U)Int*`](/sql-reference/data-types/int-uint)または[`Float*`](/sql-reference/data-types/float)

**例**

**使用例**

```sql title=Query
SELECT numericIndexedVectorGetValue(numericIndexedVectorBuild(mapFromArrays([1, 2, 3], [10, 20, 30])), 3) AS res;
```

```response title=Response
┌─res─┐
│  30 │
└─────┘
```


## numericIndexedVectorPointwiseAdd {#numericIndexedVectorPointwiseAdd}

導入バージョン: v25.7

numericIndexedVectorと別のnumericIndexedVectorまたは数値定数との間で要素ごとの加算を実行します。

**構文**

```sql
numericIndexedVectorPointwiseAdd(v1, v2)
```

**引数**

- `v1` — [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
- `v2` — 数値定数またはnumericIndexedVectorオブジェクト。[`(U)Int*`](/sql-reference/data-types/int-uint)、[`Float*`](/sql-reference/data-types/float)、または[`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**戻り値**

新しいnumericIndexedVectorオブジェクトを返します。[`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**例**

**使用例**

```sql title=クエリ
WITH
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toInt32(x), [10, 20, 30]))) AS vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toInt32(x), [10, 20, 30]))) AS vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseAdd(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseAdd(vec1, 2)) AS res2;
```

```response title=応答
┌─res1──────────────────┬─res2─────────────┐
│ {1:10,2:30,3:50,4:30} │ {1:12,2:22,3:32} │
└───────────────────────┴──────────────────┘
```


## numericIndexedVectorPointwiseDivide {#numericIndexedVectorPointwiseDivide}

導入バージョン: v25.7

numericIndexedVectorと別のnumericIndexedVectorまたは数値定数との間で要素ごとの除算を実行します。

**構文**

```sql
numericIndexedVectorPointwiseDivide(v1, v2)
```

**引数**

- `v1` — [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
- `v2` — 数値定数またはnumericIndexedVectorオブジェクト。[`(U)Int*`](/sql-reference/data-types/int-uint)、[`Float*`](/sql-reference/data-types/float)、または[`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**戻り値**

新しいnumericIndexedVectorオブジェクトを返します。[`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**例**

**使用例**

```sql title=クエリ
with
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toFloat64(x), [10, 20, 30]))) as vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toFloat64(x), [10, 20, 30]))) as vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseDivide(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseDivide(vec1, 2)) AS res2;
```

```response title=レスポンス
┌─res1────────┬─res2────────────┐
│ {2:2,3:1.5} │ {1:5,2:10,3:15} │
└─────────────┴─────────────────┘
```


## numericIndexedVectorPointwiseEqual {#numericIndexedVectorPointwiseEqual}

導入バージョン: v25.7

numericIndexedVectorと別のnumericIndexedVectorまたは数値定数との間で要素ごとの比較を実行します。
結果は、値が等しいインデックスを含むnumericIndexedVectorで、対応するすべての値が1に設定されます。

**構文**

```sql
numericIndexedVectorPointwiseEqual(v1, v2)
```

**引数**

- `v1` — [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
- `v2` — 数値定数またはnumericIndexedVectorオブジェクト。[`(U)Int*`](/sql-reference/data-types/int-uint)、[`Float*`](/sql-reference/data-types/float)、または[`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**戻り値**

新しいnumericIndexedVectorオブジェクトを返します。[`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**例**

---

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

導入バージョン: v25.7

numericIndexedVectorと別のnumericIndexedVectorまたは数値定数との間で要素ごとの比較を実行します。
結果は、1番目のベクトルの値が2番目のベクトルの値より大きいインデックスを含むnumericIndexedVectorで、該当するすべての値は1に設定されます。

**構文**

```sql
numericIndexedVectorPointwiseGreater(v1, v2)
```

**引数**

- `v1` — [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
- `v2` — 数値定数またはnumericIndexedVectorオブジェクト。[`(U)Int*`](/sql-reference/data-types/int-uint)、[`Float*`](/sql-reference/data-types/float)、または[`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**戻り値**

新しいnumericIndexedVectorオブジェクトを返します。[`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**例**

**使用例**

```sql title=クエリ
with
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toFloat64(x), [10, 20, 50]))) as vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toFloat64(x), [20, 40, 30]))) as vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseGreater(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseGreater(vec1, 20)) AS res2;
```

```response title=レスポンス
┌─res1──────┬─res2──┐
│ {1:1,3:1} │ {3:1} │
└───────────┴───────┘
```


## numericIndexedVectorPointwiseGreaterEqual {#numericIndexedVectorPointwiseGreaterEqual}

導入バージョン: v25.7

numericIndexedVectorと別のnumericIndexedVectorまたは数値定数との間で要素ごとの比較を実行します。
結果は、1番目のベクトルの値が2番目のベクトルの値以上であるインデックスを含むnumericIndexedVectorで、該当するすべての値は1に設定されます。

**構文**

```sql
numericIndexedVectorPointwiseGreaterEqual(v1, v2)
```

**引数**

- `v1` — [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
- `v2` — 数値定数またはnumericIndexedVectorオブジェクト。[`(U)Int*`](/sql-reference/data-types/int-uint)、[`Float*`](/sql-reference/data-types/float)、または[`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**戻り値**

新しいnumericIndexedVectorオブジェクトを返します。[`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**例**

**使用例**

```sql title=クエリ
with
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toFloat64(x), [10, 20, 50]))) as vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toFloat64(x), [20, 40, 30]))) as vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseGreaterEqual(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseGreaterEqual(vec1, 20)) AS res2;
```

```response title=レスポンス
┌─res1──────────┬─res2──────┐
│ {1:1,2:1,3:1} │ {2:1,3:1} │
└───────────────┴───────────┘
```


## numericIndexedVectorPointwiseLess {#numericIndexedVectorPointwiseLess}

導入バージョン: v25.7

numericIndexedVectorと別のnumericIndexedVectorまたは数値定数との間で要素ごとの比較を実行します。
結果は、1番目のベクトルの値が2番目のベクトルの値より小さいインデックスを含むnumericIndexedVectorで、該当するすべての値は1に設定されます。

**構文**

```sql
numericIndexedVectorPointwiseLess(v1, v2)
```

**引数**

- `v1` — [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
- `v2` — 数値定数またはnumericIndexedVectorオブジェクト。[`(U)Int*`](/sql-reference/data-types/int-uint)、[`Float*`](/sql-reference/data-types/float)、または[`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**戻り値**

新しいnumericIndexedVectorオブジェクトを返します。[`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**例**

**使用例**

```sql title=クエリ
with
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toFloat64(x), [10, 20, 30]))) as vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toFloat64(x), [20, 40, 30]))) as vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseLess(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseLess(vec1, 20)) AS res2;
```

```response title=レスポンス
┌─res1──────┬─res2──┐
│ {3:1,4:1} │ {1:1} │
└───────────┴───────┘
```


## numericIndexedVectorPointwiseLessEqual {#numericIndexedVectorPointwiseLessEqual}

導入バージョン: v25.7

numericIndexedVectorと別のnumericIndexedVectorまたは数値定数との間で要素ごとの比較を実行します。
結果は、1番目のベクトルの値が2番目のベクトルの値以下であるインデックスを含むnumericIndexedVectorで、該当するすべての値は1に設定されます。

**構文**

```sql
numericIndexedVectorPointwiseLessEqual(v1, v2)
```

**引数**

- `v1` — [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
- `v2` — 数値定数またはnumericIndexedVectorオブジェクト [`(U)Int*`](/sql-reference/data-types/int-uint) または [`Float*`](/sql-reference/data-types/float) または [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**戻り値**

新しいnumericIndexedVectorオブジェクトを返します。[`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**例**

**使用例**

```sql title=クエリ
with
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toFloat64(x), [10, 20, 30]))) as vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toFloat64(x), [20, 40, 30]))) as vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseLessEqual(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseLessEqual(vec1, 20)) AS res2;
```

```response title=レスポンス
┌─res1──────────┬─res2──────┐
│ {2:1,3:1,4:1} │ {1:1,2:1} │
└───────────────┴───────────┘
```


## numericIndexedVectorPointwiseMultiply {#numericIndexedVectorPointwiseMultiply}

導入バージョン: v25.7

numericIndexedVectorと別のnumericIndexedVectorまたは数値定数との要素ごとの乗算を実行します。

**構文**

```sql
numericIndexedVectorPointwiseMultiply(v1, v2)
```

**引数**

- `v1` — [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
- `v2` — 数値定数またはnumericIndexedVectorオブジェクト。[`(U)Int*`](/sql-reference/data-types/int-uint)、[`Float*`](/sql-reference/data-types/float)、または[`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**戻り値**

新しいnumericIndexedVectorオブジェクトを返します。[`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**例**

---

```sql title=クエリ
with
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toInt32(x), [10, 20, 30]))) as vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toInt32(x), [10, 20, 30]))) as vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseMultiply(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseMultiply(vec1, 2)) AS res2;
```

```response title=レスポンス
┌─res1──────────┬─res2─────────────┐
│ {2:200,3:600} │ {1:20,2:40,3:60} │
└───────────────┴──────────────────┘
```


## numericIndexedVectorPointwiseNotEqual {#numericIndexedVectorPointwiseNotEqual}

導入バージョン: v25.7

numericIndexedVectorと別のnumericIndexedVectorまたは数値定数との間で要素ごとの比較を実行します。
結果は、値が等しくないインデックスを含むnumericIndexedVectorで、対応するすべての値が1に設定されます。

**構文**

```sql
numericIndexedVectorPointwiseNotEqual(v1, v2)
```

**引数**

- `v1` — [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
- `v2` — 数値定数またはnumericIndexedVectorオブジェクト。[`(U)Int*`](/sql-reference/data-types/int-uint)、[`Float*`](/sql-reference/data-types/float)、または[`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**返り値**

新しいnumericIndexedVectorオブジェクトを返します。[`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**例**

**使用例**

```sql title=クエリ
with
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toFloat64(x), [10, 20, 30]))) as vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toFloat64(x), [20, 20, 30]))) as vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseNotEqual(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseNotEqual(vec1, 20)) AS res2;
```

```response title=レスポンス
┌─res1──────────┬─res2──────┐
│ {1:1,3:1,4:1} │ {1:1,3:1} │
└───────────────┴───────────┘
```


## numericIndexedVectorPointwiseSubtract {#numericIndexedVectorPointwiseSubtract}

導入バージョン: v25.7

numericIndexedVectorと別のnumericIndexedVectorまたは数値定数との間で要素ごとの減算を実行します。

**構文**

```sql
numericIndexedVectorPointwiseSubtract(v1, v2)
```

**引数**

- `v1` — [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
- `v2` — 数値定数またはnumericIndexedVectorオブジェクト。[`(U)Int*`](/sql-reference/data-types/int-uint)、[`Float*`](/sql-reference/data-types/float)、または[`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**戻り値**

新しいnumericIndexedVectorオブジェクトを返します。[`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**例**

**使用例**

```sql title=クエリ
WITH
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toInt32(x), [10, 20, 30]))) AS vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toInt32(x), [10, 20, 30]))) AS vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseSubtract(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseSubtract(vec1, 2)) AS res2;
```

```response title=レスポンス
┌─res1───────────────────┬─res2────────────┐
│ {1:10,2:10,3:10,4:-30} │ {1:8,2:18,3:28} │
└────────────────────────┴─────────────────┘
```


## numericIndexedVectorShortDebugString {#numericIndexedVectorShortDebugString}

導入バージョン: v25.7

numericIndexedVectorの内部情報をJSON形式で返します。
この関数は主にデバッグ用途で使用されます。

**構文**

```sql
numericIndexedVectorShortDebugString(v)
```

**引数**

- `v` — [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**戻り値**

デバッグ情報を含むJSON文字列を返します。[`String`](/sql-reference/data-types/string)

**例**

**使用例**

```sql title=Query
SELECT numericIndexedVectorShortDebugString(numericIndexedVectorBuild(mapFromArrays([1, 2, 3], [10, 20, 30]))) AS res\G;
```

```response title=Response
Row 1:
──────
res: {"vector_type":"BSI","index_type":"char8_t","value_type":"char8_t","integer_bit_num":8,"fraction_bit_num":0,"zero_indexes_info":{"cardinality":"0"},"non_zero_indexes_info":{"total_cardinality":"3","all_value_sum":60,"number_of_bitmaps":"8","bitmap_info":{"cardinality":{"0":"0","1":"2","2":"2","3":"2","4":"2","5":"0","6":"0","7":"0"}}}}
```


## numericIndexedVectorToMap {#numericIndexedVectorToMap}

導入バージョン: v25.7

numericIndexedVectorをマップに変換します。

**構文**

```sql
numericIndexedVectorToMap(v)
```

**引数**

- `v` — [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**戻り値**

インデックスと値のペアを持つマップを返します。[`Map`](/sql-reference/data-types/map)

**例**

**使用例**

```sql title=クエリ
SELECT numericIndexedVectorToMap(numericIndexedVectorBuild(mapFromArrays([1, 2, 3], [10, 20, 30]))) AS res;
```

```response title=レスポンス
┌─res──────────────┐
│ {1:10,2:20,3:30} │
└──────────────────┘
```

<!--AUTOGENERATED_END-->
