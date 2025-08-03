---
description: 'Documentation for Tuple Functions'
sidebar_label: 'Tuples'
sidebar_position: 180
slug: '/sql-reference/functions/tuple-functions'
title: 'Tuple Functions'
---




## tuple {#tuple}

複数のカラムをグループ化することを許可する関数です。
カラム C1, C2, ... の型が T1, T2, ... であれば、名前がユニークで引用符なし識別子として扱える場合には、これらのカラムを含む名前付き Tuple(C1 T1, C2 T2, ...) 型のタプルを返します。そうでない場合は、Tuple(T1, T2, ...) が返されます。関数の実行にはコストがかかりません。
タプルは通常、IN 演算子の引数としての中間値や、ラムダ関数の形式パラメータリストを作成するために使用されます。タプルはテーブルに書き込むことはできません。

この関数は演算子 `(x, y, ...)` を実装しています。

**構文**

```sql
tuple(x, y, ...)
```

## tupleElement {#tupleelement}

タプルからカラムを取得することを許可する関数です。

第二引数が数値 `index` の場合、カラムインデックスを表します（1から始まります）。第二引数が文字列 `name` の場合、それは要素の名前を表します。さらに、第三のオプション引数を提供することができ、インデックスが範囲外であるか、名前に対する要素が存在しない場合には、例外をスローする代わりにデフォルト値が返されます。第二および第三の引数は、定数である必要があります。関数の実行にはコストがかかりません。

この関数はオペレーター `x.index` と `x.name` を実装します。

**構文**

```sql
tupleElement(tuple, index, [, default_value])
tupleElement(tuple, name, [, default_value])
```

## untuple {#untuple}

呼び出し位置での [tuple](/sql-reference/data-types/tuple) 要素の構文置換を実行します。

結果カラムの名前は実装に依存し、変更される可能性があります。`untuple` 後に特定のカラム名を仮定しないでください。

**構文**

```sql
untuple(x)
```

クエリの結果としてカラムをスキップするには、`EXCEPT` 式を使用できます。

**引数**

- `x` — `tuple` 関数、カラム、または要素のタプル。 [Tuple](../data-types/tuple.md)。

**返される値**

- なし。

**例**

入力テーブル:

```text
┌─key─┬─v1─┬─v2─┬─v3─┬─v4─┬─v5─┬─v6────────┐
│   1 │ 10 │ 20 │ 40 │ 30 │ 15 │ (33,'ab') │
│   2 │ 25 │ 65 │ 70 │ 40 │  6 │ (44,'cd') │
│   3 │ 57 │ 30 │ 20 │ 10 │  5 │ (55,'ef') │
│   4 │ 55 │ 12 │  7 │ 80 │ 90 │ (66,'gh') │
│   5 │ 30 │ 50 │ 70 │ 25 │ 55 │ (77,'kl') │
└─────┴────┴────┴────┴────┴────┴───────────┘
```

`Tuple` 型のカラムを `untuple` 関数のパラメータとして使用する例:

クエリ:

```sql
SELECT untuple(v6) FROM kv;
```

結果:

```text
┌─_ut_1─┬─_ut_2─┐
│    33 │ ab    │
│    44 │ cd    │
│    55 │ ef    │
│    66 │ gh    │
│    77 │ kl    │
└───────┴───────┘
```

`EXCEPT` 式を使用する例:

クエリ:

```sql
SELECT untuple((* EXCEPT (v2, v3),)) FROM kv;
```

結果:

```text
┌─key─┬─v1─┬─v4─┬─v5─┬─v6────────┐
│   1 │ 10 │ 30 │ 15 │ (33,'ab') │
│   2 │ 25 │ 40 │  6 │ (44,'cd') │
│   3 │ 57 │ 10 │  5 │ (55,'ef') │
│   4 │ 55 │ 80 │ 90 │ (66,'gh') │
│   5 │ 30 │ 25 │ 55 │ (77,'kl') │
└─────┴────┴────┴────┴───────────┘
```

**参照**

- [Tuple](../data-types/tuple.md)

## tupleHammingDistance {#tuplehammingdistance}

同じサイズの二つのタプル間の [ハミング距離](https://ja.wikipedia.org/wiki/ハミング距離) を返します。

**構文**

```sql
tupleHammingDistance(tuple1, tuple2)
```

**引数**

- `tuple1` — 第一のタプル。 [Tuple](../data-types/tuple.md)。
- `tuple2` — 第二のタプル。 [Tuple](../data-types/tuple.md)。

タプルは同じ型の要素を持つ必要があります。

**返される値**

- ハミング距離。

:::note
結果の型は [算術関数](../../sql-reference/functions/arithmetic-functions.md) と同様に、入力タプル内の要素数に基づいて計算されます。
:::

```sql
SELECT
    toTypeName(tupleHammingDistance(tuple(0), tuple(0))) AS t1,
    toTypeName(tupleHammingDistance((0, 0), (0, 0))) AS t2,
    toTypeName(tupleHammingDistance((0, 0, 0), (0, 0, 0))) AS t3,
    toTypeName(tupleHammingDistance((0, 0, 0, 0), (0, 0, 0, 0))) AS t4,
    toTypeName(tupleHammingDistance((0, 0, 0, 0, 0), (0, 0, 0, 0, 0))) AS t5
```

```text
┌─t1────┬─t2─────┬─t3─────┬─t4─────┬─t5─────┐
│ UInt8 │ UInt16 │ UInt32 │ UInt64 │ UInt64 │
└───────┴────────┴────────┴────────┴────────┘
```

**例**

クエリ:

```sql
SELECT tupleHammingDistance((1, 2, 3), (3, 2, 1)) AS HammingDistance;
```

結果:

```text
┌─HammingDistance─┐
│               2 │
└─────────────────┘
```

[MinHash](../../sql-reference/functions/hash-functions.md#ngramminhash) 関数と組み合わせて、部分重複する文字列を検出するために使用できます:

```sql
SELECT tupleHammingDistance(wordShingleMinHash(string), wordShingleMinHashCaseInsensitive(string)) AS HammingDistance
FROM (SELECT 'ClickHouse is a column-oriented database management system for online analytical processing of queries.' AS string);
```

結果:

```text
┌─HammingDistance─┐
│               2 │
└─────────────────┘
```

## tupleToNameValuePairs {#tupletonamevaluepairs}

名前付きタプルを (name, value) ペアの配列に変換します。`Tuple(a T, b T, ..., c T)` は `Array(Tuple(String, T), ...)` を返し、`Strings` はタプルの名前付きフィールドを表し、`T` はそれらの名前に関連付けられた値です。タプル内のすべての値は同じ型である必要があります。

**構文**

```sql
tupleToNameValuePairs(tuple)
```

**引数**

- `tuple` — 名前付きタプル。 [Tuple](../data-types/tuple.md) で、任意の型の値を持ちます。

**返される値**

- (name, value) ペアの配列。 [Array](../data-types/array.md)([Tuple](../data-types/tuple.md)([String](../data-types/string.md), ...))。

**例**

クエリ:

```sql
CREATE TABLE tupletest (col Tuple(user_ID UInt64, session_ID UInt64)) ENGINE = Memory;

INSERT INTO tupletest VALUES (tuple( 100, 2502)), (tuple(1,100));

SELECT tupleToNameValuePairs(col) FROM tupletest;
```

結果:

```text
┌─tupleToNameValuePairs(col)────────────┐
│ [('user_ID',100),('session_ID',2502)] │
│ [('user_ID',1),('session_ID',100)]    │
└───────────────────────────────────────┘
```

この関数を使用してカラムを行に変換することができます:

```sql
CREATE TABLE tupletest (col Tuple(CPU Float64, Memory Float64, Disk Float64)) ENGINE = Memory;

INSERT INTO tupletest VALUES(tuple(3.3, 5.5, 6.6));

SELECT arrayJoin(tupleToNameValuePairs(col)) FROM tupletest;
```

結果:

```text
┌─arrayJoin(tupleToNameValuePairs(col))─┐
│ ('CPU',3.3)                           │
│ ('Memory',5.5)                        │
│ ('Disk',6.6)                          │
└───────────────────────────────────────┘
```

単純なタプルを関数に渡すと、ClickHouse は値のインデックスをその名前として使用します:

```sql
SELECT tupleToNameValuePairs(tuple(3, 2, 1));
```

結果:

```text
┌─tupleToNameValuePairs(tuple(3, 2, 1))─┐
│ [('1',3),('2',2),('3',1)]             │
└───────────────────────────────────────┘
```

## tupleNames {#tuplenames}

タプルをカラム名の配列に変換します。`Tuple(a T, b T, ...)` の形式のタプルに対して、タプルの名前付きカラムを表す文字列の配列を返します。タプルの要素に明示的な名前がない場合、それらのインデックスがカラム名として使用されます。

**構文**

```sql
tupleNames(tuple)
```

**引数**

- `tuple` — 名前付きタプル。 [Tuple](../../sql-reference/data-types/tuple.md) で、任意の型の値を持ちます。

**返される値**

- 文字列の配列。

型: [Array](../../sql-reference/data-types/array.md)([Tuple](../../sql-reference/data-types/tuple.md)([String](../../sql-reference/data-types/string.md), ...))。

**例**

クエリ:

```sql
CREATE TABLE tupletest (col Tuple(user_ID UInt64, session_ID UInt64)) ENGINE = Memory;

INSERT INTO tupletest VALUES (tuple(1, 2));

SELECT tupleNames(col) FROM tupletest;
```

結果:

```text
┌─tupleNames(col)──────────┐
│ ['user_ID','session_ID'] │
└──────────────────────────┘
```

単純なタプルを関数に渡すと、ClickHouse はカラムのインデックスをその名前として使用します:

```sql
SELECT tupleNames(tuple(3, 2, 1));
```

結果:

```text
┌─tupleNames((3, 2, 1))─┐
│ ['1','2','3']         │
└───────────────────────┘
```

## tuplePlus {#tupleplus}

同じサイズの二つのタプルの対応する値の合計を計算します。

**構文**

```sql
tuplePlus(tuple1, tuple2)
```

エイリアス: `vectorSum`.

**引数**

- `tuple1` — 第一のタプル。 [Tuple](../data-types/tuple.md)。
- `tuple2` — 第二のタプル。 [Tuple](../data-types/tuple.md)。

**返される値**

- 合計を持つタプル。 [Tuple](../data-types/tuple.md)。

**例**

クエリ:

```sql
SELECT tuplePlus((1, 2), (2, 3));
```

結果:

```text
┌─tuplePlus((1, 2), (2, 3))─┐
│ (3,5)                     │
└───────────────────────────┘
```

## tupleMinus {#tupleminus}

同じサイズの二つのタプルの対応する値の引き算を計算します。

**構文**

```sql
tupleMinus(tuple1, tuple2)
```

エイリアス: `vectorDifference`.

**引数**

- `tuple1` — 第一のタプル。 [Tuple](../data-types/tuple.md)。
- `tuple2` — 第二のタプル。 [Tuple](../data-types/tuple.md)。

**返される値**

- 引き算の結果を持つタプル。 [Tuple](../data-types/tuple.md)。

**例**

クエリ:

```sql
SELECT tupleMinus((1, 2), (2, 3));
```

結果:

```text
┌─tupleMinus((1, 2), (2, 3))─┐
│ (-1,-1)                    │
└────────────────────────────┘
```

## tupleMultiply {#tuplemultiply}

同じサイズの二つのタプルの対応する値の掛け算を計算します。

**構文**

```sql
tupleMultiply(tuple1, tuple2)
```

**引数**

- `tuple1` — 第一のタプル。 [Tuple](../data-types/tuple.md)。
- `tuple2` — 第二のタプル。 [Tuple](../data-types/tuple.md)。

**返される値**

- 掛け算の結果を持つタプル。 [Tuple](../data-types/tuple.md)。

**例**

クエリ:

```sql
SELECT tupleMultiply((1, 2), (2, 3));
```

結果:

```text
┌─tupleMultiply((1, 2), (2, 3))─┐
│ (2,6)                         │
└───────────────────────────────┘
```

## tupleDivide {#tupledivide}

同じサイズの二つのタプルの対応する値の割り算を計算します。 ゼロでの割り算は `inf` を返します。

**構文**

```sql
tupleDivide(tuple1, tuple2)
```

**引数**

- `tuple1` — 第一のタプル。 [Tuple](../data-types/tuple.md)。
- `tuple2` — 第二のタプル。 [Tuple](../data-types/tuple.md)。

**返される値**

- 割り算の結果を持つタプル。 [Tuple](../data-types/tuple.md)。

**例**

クエリ:

```sql
SELECT tupleDivide((1, 2), (2, 3));
```

結果:

```text
┌─tupleDivide((1, 2), (2, 3))─┐
│ (0.5,0.6666666666666666)    │
└─────────────────────────────┘
```

## tupleNegate {#tuplenegate}

タプルの値の否定を計算します。

**構文**

```sql
tupleNegate(tuple)
```

**引数**

- `tuple` — [Tuple](../data-types/tuple.md)。

**返される値**

- 否定の結果を持つタプル。 [Tuple](../data-types/tuple.md)。

**例**

クエリ:

```sql
SELECT tupleNegate((1,  2));
```

結果:

```text
┌─tupleNegate((1, 2))─┐
│ (-1,-2)             │
└─────────────────────┘
```

## tupleMultiplyByNumber {#tuplemultiplybynumber}

すべての値を数値で掛け算したタプルを返します。

**構文**

```sql
tupleMultiplyByNumber(tuple, number)
```

**引数**

- `tuple` — [Tuple](../data-types/tuple.md)。
- `number` — 乗数。 [Int/UInt](../data-types/int-uint.md)、[Float](../data-types/float.md) または [Decimal](../data-types/decimal.md)。

**返される値**

- 掛け算した値を持つタプル。 [Tuple](../data-types/tuple.md)。

**例**

クエリ:

```sql
SELECT tupleMultiplyByNumber((1, 2), -2.1);
```

結果:

```text
┌─tupleMultiplyByNumber((1, 2), -2.1)─┐
│ (-2.1,-4.2)                         │
└─────────────────────────────────────┘
```

## tupleDivideByNumber {#tupledividebynumber}

すべての値を数値で割ったタプルを返します。 ゼロでの割り算は `inf` を返します。

**構文**

```sql
tupleDivideByNumber(tuple, number)
```

**引数**

- `tuple` — [Tuple](../data-types/tuple.md)。
- `number` — 割り算される数値。 [Int/UInt](../data-types/int-uint.md)、[Float](../data-types/float.md) または [Decimal](../data-types/decimal.md)。

**返される値**

- 割り算した値を持つタプル。 [Tuple](../data-types/tuple.md)。

**例**

クエリ:

```sql
SELECT tupleDivideByNumber((1, 2), 0.5);
```

結果:

```text
┌─tupleDivideByNumber((1, 2), 0.5)─┐
│ (2,4)                            │
└──────────────────────────────────┘
```

## tupleConcat {#tupleconcat}

引数として渡されたタプルを結合します。

```sql
tupleConcat(tuples)
```

**引数**

- `tuples` – [Tuple](../data-types/tuple.md) 型の任意の数の引数。

**例**

```sql
SELECT tupleConcat((1, 2), (3, 4), (true, false)) AS res
```

```text
┌─res──────────────────┐
│ (1,2,3,4,true,false) │
└──────────────────────┘
```

## tupleIntDiv {#tupleintdiv}

分子のタプルと分母のタプルの整数除算を行い、商のタプルを返します。

**構文**

```sql
tupleIntDiv(tuple_num, tuple_div)
```

**パラメータ**

- `tuple_num`: 分子値のタプル。 [Tuple](../data-types/tuple) の数値型。
- `tuple_div`: 除数値のタプル。 [Tuple](../data-types/tuple) の数値型。

**返される値**

- `tuple_num` と `tuple_div` の商のタプル。 [Tuple](../data-types/tuple) の整数値。

**実装の詳細**

- `tuple_num` または `tuple_div` が非整数値を含む場合、各非整数分子または除数を最も近い整数に丸めて計算されます。
- ゼロでの割り算にはエラーが発生します。

**例**

クエリ:

```sql
SELECT tupleIntDiv((15, 10, 5), (5, 5, 5));
```

結果:

```text
┌─tupleIntDiv((15, 10, 5), (5, 5, 5))─┐
│ (3,2,1)                             │
└─────────────────────────────────────┘
```

クエリ:

```sql
SELECT tupleIntDiv((15, 10, 5), (5.5, 5.5, 5.5));
```

結果:

```text
┌─tupleIntDiv((15, 10, 5), (5.5, 5.5, 5.5))─┐
│ (2,1,0)                                   │
└───────────────────────────────────────────┘
```

## tupleIntDivOrZero {#tupleintdivorzero}

[tupleIntDiv](#tupleintdiv) のように、分子のタプルと分母のタプルの整数除算を行い、商のタプルを返します。ゼロの除数に対してエラーをスローするのではなく、商を 0 として返します。

**構文**

```sql
tupleIntDivOrZero(tuple_num, tuple_div)
```

- `tuple_num`: 分子値のタプル。 [Tuple](../data-types/tuple) の数値型。
- `tuple_div`: 除数値のタプル。 [Tuple](../data-types/tuple) の数値型。

**返される値**

- `tuple_num` と `tuple_div` の商のタプル。 [Tuple](../data-types/tuple) の整数値。
- 除数が 0 の場合は商を 0 として返します。

**実装の詳細**

- `tuple_num` または `tuple_div` が非整数値を含む場合、`tupleIntDiv` と同様に各非整数分子または除数を最も近い整数に丸めて計算されます。

**例**

クエリ:

```sql
SELECT tupleIntDivOrZero((5, 10, 15), (0, 0, 0));
```

結果:

```text
┌─tupleIntDivOrZero((5, 10, 15), (0, 0, 0))─┐
│ (0,0,0)                                   │
└───────────────────────────────────────────┘
```

## tupleIntDivByNumber {#tupleintdivbynumber}

分子のタプルを指定された除数で割り算を行い、商のタプルを返します。

**構文**

```sql
tupleIntDivByNumber(tuple_num, div)
```

**パラメータ**

- `tuple_num`: 分子値のタプル。 [Tuple](../data-types/tuple) の数値型。
- `div`: 除数値。 [Numeric](../data-types/int-uint.md) 型。

**返される値**

- `tuple_num` と `div` の商のタプル。 [Tuple](../data-types/tuple) の整数値。

**実装の詳細**

- `tuple_num` または `div` が非整数値を含む場合、各非整数分子または除数を最も近い整数に丸めて計算されます。
- ゼロでの割り算にはエラーが発生します。

**例**

クエリ:

```sql
SELECT tupleIntDivByNumber((15, 10, 5), 5);
```

結果:

```text
┌─tupleIntDivByNumber((15, 10, 5), 5)─┐
│ (3,2,1)                             │
└─────────────────────────────────────┘
```

クエリ:

```sql
SELECT tupleIntDivByNumber((15.2, 10.7, 5.5), 5.8);
```

結果:

```text
┌─tupleIntDivByNumber((15.2, 10.7, 5.5), 5.8)─┐
│ (2,1,0)                                     │
└─────────────────────────────────────────────┘
```

## tupleIntDivOrZeroByNumber {#tupleintdivorzerobynumber}

[tupleIntDivByNumber](#tupleintdivbynumber) のように、分子のタプルを指定された除数で割り算を行い、商のタプルを返します。ゼロの除数に対してエラーをスローするのではなく、商を 0 として返します。

**構文**

```sql
tupleIntDivOrZeroByNumber(tuple_num, div)
```

**パラメータ**

- `tuple_num`: 分子値のタプル。 [Tuple](../data-types/tuple) の数値型。
- `div`: 除数値。 [Numeric](../data-types/int-uint.md) 型。

**返される値**

- `tuple_num` と `div` の商のタプル。 [Tuple](../data-types/tuple) の整数値。
- 除数が 0 の場合は商を 0 として返します。

**実装の詳細**

- `tuple_num` または `div` が非整数値を含む場合、[tupleIntDivByNumber](#tupleintdivbynumber) と同様に各非整数分子または除数を最も近い整数に丸めて計算されます。

**例**

クエリ:

```sql
SELECT tupleIntDivOrZeroByNumber((15, 10, 5), 5);
```

結果:

```text
┌─tupleIntDivOrZeroByNumber((15, 10, 5), 5)─┐
│ (3,2,1)                                   │
└───────────────────────────────────────────┘
```

クエリ:

```sql
SELECT tupleIntDivOrZeroByNumber((15, 10, 5), 0)
```

結果:

```text
┌─tupleIntDivOrZeroByNumber((15, 10, 5), 0)─┐
│ (0,0,0)                                   │
└───────────────────────────────────────────┘
```

## tupleModulo {#tuplemodulo}

二つのタプルの剰余演算の結果のタプルを返します。

**構文**

```sql
tupleModulo(tuple_num, tuple_mod)
```

**パラメータ**

- `tuple_num`: 分子値のタプル。 [Tuple](../data-types/tuple) の数値型。
- `tuple_mod`: 除数値のタプル。 [Tuple](../data-types/tuple) の数値型。

**返される値**

- `tuple_num` と `tuple_mod` の商の剰余のタプル。 [Tuple](../data-types/tuple) の非ゼロ整数値。
- ゼロでの除算に対してエラーが発生します。

**例**

クエリ:

```sql
SELECT tupleModulo((15, 10, 5), (5, 3, 2));
```

結果:

```text
┌─tupleModulo((15, 10, 5), (5, 3, 2))─┐
│ (0,1,1)                             │
└─────────────────────────────────────┘
```

## tupleModuloByNumber {#tuplemodulobynumber}

タプルの剰余演算の結果を指定された除数で返します。

**構文**

```sql
tupleModuloByNumber(tuple_num, div)
```

**パラメータ**

- `tuple_num`: 分子値のタプル。 [Tuple](../data-types/tuple) の数値型。
- `div`: 除数値。 [Numeric](../data-types/int-uint.md) 型。

**返される値**

- `tuple_num` と `div` の剰余のタプル。 [Tuple](../data-types/tuple) の非ゼロ整数値。
- ゼロでの除算に対してエラーが発生します。

**例**

クエリ:

```sql
SELECT tupleModuloByNumber((15, 10, 5), 2);
```

結果:

```text
┌─tupleModuloByNumber((15, 10, 5), 2)─┐
│ (1,0,1)                             │
└─────────────────────────────────────┘
```

## flattenTuple {#flattentuple}

ネストされた名前付き `input` タプルからフラットな `output` タプルを返します。 `output` タプルの要素は元の `input` タプルからのパスです。 例えば: `Tuple(a Int, Tuple(b Int, c Int)) -> Tuple(a Int, b Int, c Int)`。 `flattenTuple` は、型 `Object` のすべてのパスを個別のカラムとして選択するために使用できます。

**構文**

```sql
flattenTuple(input)
```

**パラメータ**

- `input`: フラット化するネストされた名前付きタプル。 [Tuple](../data-types/tuple)。

**返される値**

- 元の `input` からのパスを持つ `output` タプル。 [Tuple](../data-types/tuple)。

**例**

クエリ:

```sql
CREATE TABLE t_flatten_tuple(t Tuple(t1 Nested(a UInt32, s String), b UInt32, t2 Tuple(k String, v UInt32))) ENGINE = Memory;
INSERT INTO t_flatten_tuple VALUES (([(1, 'a'), (2, 'b')], 3, ('c', 4)));
SELECT flattenTuple(t) FROM t_flatten_tuple;
```

結果:

```text
┌─flattenTuple(t)───────────┐
│ ([1,2],['a','b'],3,'c',4) │
└───────────────────────────┘
```

## Distance functions {#distance-functions}

すべてのサポートされている関数は [distance functions documentation](../../sql-reference/functions/distance-functions.md) に記載されています。
