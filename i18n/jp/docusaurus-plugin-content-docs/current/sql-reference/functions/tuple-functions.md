---
slug: '/sql-reference/functions/tuple-functions'
sidebar_position: 180
sidebar_label: 'タプル'
title: 'タプル関数'
---

## tuple {#tuple}

複数のカラムをグループ化することを可能にする関数です。  
カラム C1, C2, ... の型が T1, T2, ... の場合、名前が一意で引用符のない識別子として扱える場合には、これらのカラムを含む名前付きの Tuple(C1 T1, C2 T2, ...) 型のタプルを返します。そうでない場合は Tuple(T1, T2, ...) が返されます。関数を実行するコストはありません。  
タプルは通常、IN 演算子の引数の中間値として使用されるか、ラムダ関数の正式なパラメータのリストを作成するために使用されます。タプルはテーブルに書き込むことはできません。

この関数は演算子 `(x, y, ...)` を実装しています。

**構文**

``` sql
tuple(x, y, ...)
```

## tupleElement {#tupleelement}

タプルからカラムを取得することを可能にする関数です。

2番目の引数が数値 `index` の場合、それはカラムのインデックスで、1から始まります。2番目の引数が文字列 `name` の場合、それは要素の名前を表します。また、インデックスが範囲外または名前に対する要素が存在しない場合にデフォルト値を返すための3番目のオプション引数を提供することもできます。2番目と3番目の引数が提供される場合、定数でなければなりません。関数を実行するコストはありません。

この関数は演算子 `x.index` と `x.name` を実装しています。

**構文**

``` sql
tupleElement(tuple, index, [, default_value])
tupleElement(tuple, name, [, default_value])
```

## untuple {#untuple}

呼び出し位置での [tuple](/sql-reference/data-types/tuple) 要素の構文的置換を行います。

結果カラムの名前は実装に依存し、変更される可能性があります。 `untuple` の後に特定のカラム名を仮定しないでください。

**構文**

``` sql
untuple(x)
```

クエリの結果としてカラムをスキップするには、 `EXCEPT` 表現を使用できます。

**引数**

- `x` — `tuple` 関数、カラム、または要素のタプル。 [Tuple](../data-types/tuple.md)。

**返り値**

- なし。

**例**

入力テーブル:

``` text
┌─key─┬─v1─┬─v2─┬─v3─┬─v4─┬─v5─┬─v6────────┐
│   1 │ 10 │ 20 │ 40 │ 30 │ 15 │ (33,'ab') │
│   2 │ 25 │ 65 │ 70 │ 40 │  6 │ (44,'cd') │
│   3 │ 57 │ 30 │ 20 │ 10 │  5 │ (55,'ef') │
│   4 │ 55 │ 12 │  7 │ 80 │ 90 │ (66,'gh') │
│   5 │ 30 │ 50 │ 70 │ 25 │ 55 │ (77,'kl') │
└─────┴────┴────┴────┴────┴────┴───────────┘
```

`Tuple` 型カラムを `untuple` 関数パラメータとして使用する例:

クエリ:

``` sql
SELECT untuple(v6) FROM kv;
```

結果:

``` text
┌─_ut_1─┬─_ut_2─┐
│    33 │ ab    │
│    44 │ cd    │
│    55 │ ef    │
│    66 │ gh    │
│    77 │ kl    │
└───────┴───────┘
```

`EXCEPT` 表現を使用する例:

クエリ:

``` sql
SELECT untuple((* EXCEPT (v2, v3),)) FROM kv;
```

結果:

``` text
┌─key─┬─v1─┬─v4─┬─v5─┬─v6────────┐
│   1 │ 10 │ 30 │ 15 │ (33,'ab') │
│   2 │ 25 │ 40 │  6 │ (44,'cd') │
│   3 │ 57 │ 10 │  5 │ (55,'ef') │
│   4 │ 55 │ 80 │ 90 │ (66,'gh') │
│   5 │ 30 │ 25 │ 55 │ (77,'kl') │
└─────┴────┴────┴────┴───────────┘
```

**関連情報**

- [Tuple](../data-types/tuple.md)

## tupleHammingDistance {#tuplehammingdistance}

同じサイズの2つのタプル間の [ハミング距離](https://en.wikipedia.org/wiki/Hamming_distance) を返します。

**構文**

``` sql
tupleHammingDistance(tuple1, tuple2)
```

**引数**

- `tuple1` — 1つ目のタプル。 [Tuple](../data-types/tuple.md)。
- `tuple2` — 2つ目のタプル。 [Tuple](../data-types/tuple.md)。

タプルは要素の同じ型である必要があります。

**返り値**

- ハミング距離。

:::note
結果の型は、[算術関数](../../sql-reference/functions/arithmetic-functions.md)と同様に、入力タプル内の要素数に基づいて計算されます。
:::

``` sql
SELECT
    toTypeName(tupleHammingDistance(tuple(0), tuple(0))) AS t1,
    toTypeName(tupleHammingDistance((0, 0), (0, 0))) AS t2,
    toTypeName(tupleHammingDistance((0, 0, 0), (0, 0, 0))) AS t3,
    toTypeName(tupleHammingDistance((0, 0, 0, 0), (0, 0, 0, 0))) AS t4,
    toTypeName(tupleHammingDistance((0, 0, 0, 0, 0), (0, 0, 0, 0, 0))) AS t5
```

``` text
┌─t1────┬─t2─────┬─t3─────┬─t4─────┬─t5─────┐
│ UInt8 │ UInt16 │ UInt32 │ UInt64 │ UInt64 │
└───────┴────────┴────────┴────────┴────────┘
```

**例**

クエリ:

``` sql
SELECT tupleHammingDistance((1, 2, 3), (3, 2, 1)) AS HammingDistance;
```

結果:

``` text
┌─HammingDistance─┐
│               2 │
└─────────────────┘
```

[MinHash](../../sql-reference/functions/hash-functions.md#ngramminhash) 関数と組み合わせてセミ重複文字列の検出に使用できます:

``` sql
SELECT tupleHammingDistance(wordShingleMinHash(string), wordShingleMinHashCaseInsensitive(string)) AS HammingDistance
FROM (SELECT 'ClickHouse is a column-oriented database management system for online analytical processing of queries.' AS string);
```

結果:

``` text
┌─HammingDistance─┐
│               2 │
└─────────────────┘
```

## tupleToNameValuePairs {#tupletonamevaluepairs}

名前付きタプルを (name, value) ペアの配列に変換します。  
`Tuple(a T, b T, ..., c T)` の場合、`Array(Tuple(String, T), ...)` を返し、`Strings` はタプルの名前付きフィールドを表し、`T` はそれらの名前に関連付けられた値です。すべてのタプル内の値は同じ型である必要があります。

**構文**

``` sql
tupleToNameValuePairs(tuple)
```

**引数**

- `tuple` — 名前付きタプル。値の任意の型の [Tuple](../data-types/tuple.md)。

**返り値**

- (name, value) ペアの配列。 [Array](../data-types/array.md)([Tuple](../data-types/tuple.md)([String](../data-types/string.md), ...))。

**例**

クエリ:

``` sql
CREATE TABLE tupletest (col Tuple(user_ID UInt64, session_ID UInt64)) ENGINE = Memory;

INSERT INTO tupletest VALUES (tuple( 100, 2502)), (tuple(1,100));

SELECT tupleToNameValuePairs(col) FROM tupletest;
```

結果:

``` text
┌─tupleToNameValuePairs(col)────────────┐
│ [('user_ID',100),('session_ID',2502)] │
│ [('user_ID',1),('session_ID',100)]    │
└───────────────────────────────────────┘
```

この関数を使用してカラムを行に変換することもできます:

``` sql
CREATE TABLE tupletest (col Tuple(CPU Float64, Memory Float64, Disk Float64)) ENGINE = Memory;

INSERT INTO tupletest VALUES(tuple(3.3, 5.5, 6.6));

SELECT arrayJoin(tupleToNameValuePairs(col)) FROM tupletest;
```

結果:

``` text
┌─arrayJoin(tupleToNameValuePairs(col))─┐
│ ('CPU',3.3)                           │
│ ('Memory',5.5)                        │
│ ('Disk',6.6)                          │
└───────────────────────────────────────┘
```

単純なタプルを関数に渡すと、ClickHouse は値のインデックスを名前として使用します:

``` sql
SELECT tupleToNameValuePairs(tuple(3, 2, 1));
```

結果:

``` text
┌─tupleToNameValuePairs(tuple(3, 2, 1))─┐
│ [('1',3),('2',2),('3',1)]             │
└───────────────────────────────────────┘
```

## tupleNames {#tuplenames}

タプルをカラム名の配列に変換します。  
`Tuple(a T, b T, ...)` の形のタプルの場合、タプルの名前付きカラムを表す文字列の配列を返します。タプルの要素に明示的な名前がない場合、そのインデックスがカラム名として使用されます。

**構文**

``` sql
tupleNames(tuple)
```

**引数**

- `tuple` — 名前付きタプル。 [Tuple](../../sql-reference/data-types/tuple.md) で、任意の型の値を持つ。

**返り値**

- 文字列の配列。

型: [Array](../../sql-reference/data-types/array.md)([Tuple](../../sql-reference/data-types/tuple.md)([String](../../sql-reference/data-types/string.md), ...))。

**例**

クエリ:

``` sql
CREATE TABLE tupletest (col Tuple(user_ID UInt64, session_ID UInt64)) ENGINE = Memory;

INSERT INTO tupletest VALUES (tuple(1, 2));

SELECT tupleNames(col) FROM tupletest;
```

結果:

``` text
┌─tupleNames(col)──────────┐
│ ['user_ID','session_ID'] │
└──────────────────────────┘
```

単純なタプルを関数に渡すと、ClickHouse はカラムのインデックスを名前として使用します:

``` sql
SELECT tupleNames(tuple(3, 2, 1));
```

結果:

``` text
┌─tupleNames((3, 2, 1))─┐
│ ['1','2','3']         │
└───────────────────────┘
```

## tuplePlus {#tupleplus}

同じサイズの2つのタプルの対応する値の合計を計算します。

**構文**

```sql
tuplePlus(tuple1, tuple2)
```

エイリアス: `vectorSum`.

**引数**

- `tuple1` — 1つ目のタプル。 [Tuple](../data-types/tuple.md)。
- `tuple2` — 2つ目のタプル。 [Tuple](../data-types/tuple.md)。

**返り値**

- 合計のタプル。 [Tuple](../data-types/tuple.md)。

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

同じサイズの2つのタプルの対応する値の引き算を計算します。

**構文**

```sql
tupleMinus(tuple1, tuple2)
```

エイリアス: `vectorDifference`.

**引数**

- `tuple1` — 1つ目のタプル。 [Tuple](../data-types/tuple.md)。
- `tuple2` — 2つ目のタプル。 [Tuple](../data-types/tuple.md)。

**返り値**

- 引き算の結果のタプル。 [Tuple](../data-types/tuple.md)。

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

同じサイズの2つのタプルの対応する値の乗算を計算します。

**構文**

```sql
tupleMultiply(tuple1, tuple2)
```

**引数**

- `tuple1` — 1つ目のタプル。 [Tuple](../data-types/tuple.md)。
- `tuple2` — 2つ目のタプル。 [Tuple](../data-types/tuple.md)。

**返り値**

- 乗算の結果のタプル。 [Tuple](../data-types/tuple.md)。

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

同じサイズの2つのタプルの対応する値の除算を計算します。ゼロでの除算は `inf` を返します。

**構文**

```sql
tupleDivide(tuple1, tuple2)
```

**引数**

- `tuple1` — 1つ目のタプル。 [Tuple](../data-types/tuple.md)。
- `tuple2` — 2つ目のタプル。 [Tuple](../data-types/tuple.md)。

**返り値**

- 除算の結果のタプル。 [Tuple](../data-types/tuple.md)。

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

**返り値**

- 否定の結果のタプル。 [Tuple](../data-types/tuple.md)。

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

すべての値を数値で乗算したタプルを返します。

**構文**

```sql
tupleMultiplyByNumber(tuple, number)
```

**引数**

- `tuple` — [Tuple](../data-types/tuple.md)。
- `number` — 乗算する数値。 [Int/UInt](../data-types/int-uint.md)、[Float](../data-types/float.md)、または [Decimal](../data-types/decimal.md)。

**返り値**

- 乗算された値のタプル。 [Tuple](../data-types/tuple.md)。

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

すべての値を数値で除算したタプルを返します。ゼロでの除算は `inf` を返します。

**構文**

```sql
tupleDivideByNumber(tuple, number)
```

**引数**

- `tuple` — [Tuple](../data-types/tuple.md)。
- `number` — 除算する数値。 [Int/UInt](../data-types/int-uint.md)、[Float](../data-types/float.md)、または [Decimal](../data-types/decimal.md)。

**返り値**

- 除算された値のタプル。 [Tuple](../data-types/tuple.md)。

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

``` sql
tupleConcat(tuples)
```

**引数**

- `tuples` – [Tuple](../data-types/tuple.md) 型の任意の数の引数。

**例**

``` sql
SELECT tupleConcat((1, 2), (3, 4), (true, false)) AS res
```

``` text
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

**引数**

- `tuple_num`: 分子の値のタプル。 [Tuple](../data-types/tuple) の数値型。
- `tuple_div`: 除数の値のタプル。 [Tuple](../data-types/tuple) の数値型。

**返り値**

- `tuple_num` と `tuple_div` の商のタプル。 [Tuple](../data-types/tuple) の整数値。

**実装の詳細**

- `tuple_num` または `tuple_div` に非整数値が含まれている場合、各非整数の分子または除数の近くの整数に丸めて計算されます。
- ゼロでの除算に対してエラーが発生します。 

**例**

クエリ:

``` sql
SELECT tupleIntDiv((15, 10, 5), (5, 5, 5));
```

結果:

``` text
┌─tupleIntDiv((15, 10, 5), (5, 5, 5))─┐
│ (3,2,1)                             │
└─────────────────────────────────────┘
```

クエリ:

``` sql
SELECT tupleIntDiv((15, 10, 5), (5.5, 5.5, 5.5));
```

結果:

``` text
┌─tupleIntDiv((15, 10, 5), (5.5, 5.5, 5.5))─┐
│ (2,1,0)                                   │
└───────────────────────────────────────────┘
```

## tupleIntDivOrZero {#tupleintdivorzero}

[tupleIntDiv](#tupleintdiv) と同様に、分子のタプルと分母のタプルの整数除算を行い、商のタプルを返します。0の除数に対してはエラーをスローする代わりに、商として0を返します。 

**構文**

```sql
tupleIntDivOrZero(tuple_num, tuple_div)
```

**引数**

- `tuple_num`: 分子の値のタプル。 [Tuple](../data-types/tuple) の数値型。
- `tuple_div`: 除数の値のタプル。 [Tuple](../data-types/tuple) の数値型。

**返り値**

- `tuple_num` と `tuple_div` の商のタプル。 [Tuple](../data-types/tuple) の整数値。
- 除数が0の場合、その商は0として返されます。

**実装の詳細**

- `tuple_num` または `tuple_div` に非整数値が含まれている場合、[tupleIntDiv](#tupleintdiv) と同様に、各非整数の分子または除数の近くの整数に丸めて計算されます。

**例**

クエリ:

``` sql
SELECT tupleIntDivOrZero((5, 10, 15), (0, 0, 0));
```

結果:

``` text
┌─tupleIntDivOrZero((5, 10, 15), (0, 0, 0))─┐
│ (0,0,0)                                   │
└───────────────────────────────────────────┘
```

## tupleIntDivByNumber {#tupleintdivbynumber}

分子のタプルを指定された除数で割り、商のタプルを返します。

**構文**

```sql
tupleIntDivByNumber(tuple_num, div)
```

**引数**

- `tuple_num`: 分子の値のタプル。 [Tuple](../data-types/tuple) の数値型。
- `div`: 除数の値。 [Numeric](../data-types/int-uint.md) 型。

**返り値**

- `tuple_num` と `div` の商のタプル。 [Tuple](../data-types/tuple) の整数値。

**実装の詳細**

- `tuple_num` または `div` に非整数値が含まれている場合、[tupleIntDiv](#tupleintdiv) と同様に、各非整数の分子または除数の近くの整数に丸めて計算されます。
- ゼロでの除算に対してエラーが発生します。 

**例**

クエリ:

``` sql
SELECT tupleIntDivByNumber((15, 10, 5), 5);
```

結果:

``` text
┌─tupleIntDivByNumber((15, 10, 5), 5)─┐
│ (3,2,1)                             │
└─────────────────────────────────────┘
```

クエリ:

``` sql
SELECT tupleIntDivByNumber((15.2, 10.7, 5.5), 5.8);
```

結果:

``` text
┌─tupleIntDivByNumber((15.2, 10.7, 5.5), 5.8)─┐
│ (2,1,0)                                     │
└─────────────────────────────────────────────┘
```

## tupleIntDivOrZeroByNumber {#tupleintdivorzerobynumber}

[tupleIntDivByNumber](#tupleintdivbynumber) と同様に、分子のタプルを指定された除数で割り、商のタプルを返します。0の除数に対してはエラーをスローする代わりに、商として0を返します。

**構文**

```sql
tupleIntDivOrZeroByNumber(tuple_num, div)
```

**引数**

- `tuple_num`: 分子の値のタプル。 [Tuple](../data-types/tuple) の数値型。
- `div`: 除数の値。 [Numeric](../data-types/int-uint.md) 型。

**返り値**

- `tuple_num` と `div` の商のタプル。 [Tuple](../data-types/tuple) の整数値。
- 除数が0の場合、その商は0として返されます。

**実装の詳細**

- `tuple_num` または `div` に非整数値が含まれている場合、[tupleIntDivByNumber](#tupleintdivbynumber) と同様に、各非整数の分子または除数の近くの整数に丸めて計算されます。

**例**

クエリ:

``` sql
SELECT tupleIntDivOrZeroByNumber((15, 10, 5), 5);
```

結果:

``` text
┌─tupleIntDivOrZeroByNumber((15, 10, 5), 5)─┐
│ (3,2,1)                                   │
└───────────────────────────────────────────┘
```

クエリ:

``` sql
SELECT tupleIntDivOrZeroByNumber((15, 10, 5), 0)
```

結果:

``` text
┌─tupleIntDivOrZeroByNumber((15, 10, 5), 0)─┐
│ (0,0,0)                                   │
└───────────────────────────────────────────┘
```

## tupleModulo {#tuplemodulo}

2つのタプルの除算操作の余りのタプルを返します。

**構文**

```sql
tupleModulo(tuple_num, tuple_mod)
```

**引数**

- `tuple_num`: 分子の値のタプル。 [Tuple](../data-types/tuple) の数値型。
- `tuple_div`: 除数の値のタプル。 [Tuple](../data-types/tuple) の数値型。

**返り値**

- `tuple_num` と `tuple_mod` の除算の余りのタプル。 [Tuple](../data-types/tuple) の非ゼロ整数値。
- ゼロでの除算に対してエラーが発生します。

**例**

クエリ:

``` sql
SELECT tupleModulo((15, 10, 5), (5, 3, 2));
```

結果:

``` text
┌─tupleModulo((15, 10, 5), (5, 3, 2))─┐
│ (0,1,1)                             │
└─────────────────────────────────────┘
```

## tupleModuloByNumber {#tuplemodulobynumber}

分子のタプルと指定された除数の除算操作の余りのタプルを返します。

**構文**

```sql
tupleModuloByNumber(tuple_num, div)
```

**引数**

- `tuple_num`: 分子の値のタプル。 [Tuple](../data-types/tuple) の数値型。
- `div`: 除数の値。 [Numeric](../data-types/int-uint.md) 型。

**返り値**

- `tuple_num` と `div` の除算の余りのタプル。 [Tuple](../data-types/tuple) の非ゼロ整数値。
- ゼロでの除算に対してエラーが発生します。

**例**

クエリ:

``` sql
SELECT tupleModuloByNumber((15, 10, 5), 2);
```

結果:

``` text
┌─tupleModuloByNumber((15, 10, 5), 2)─┐
│ (1,0,1)                             │
└─────────────────────────────────────┘
```

## flattenTuple {#flattentuple}

ネストされた名前付き `input` タプルからフラットな `output` タプルを返します。  
`output` タプルの要素は、元の `input` タプルからのパスです。たとえば: `Tuple(a Int, Tuple(b Int, c Int)) -> Tuple(a Int, b Int, c Int)`。 `flattenTuple` は、型 `Object` からすべてのパスを別々のカラムとして選択するために使用できます。

**構文**

```sql
flattenTuple(input)
```

**引数**

- `input`: フラット化するネストされた名前付きタプル。 [Tuple](../data-types/tuple)。

**返り値**

- 元の `input` からのパスを持つ `output` タプル。 [Tuple](../data-types/tuple)。

**例**

クエリ:

``` sql
CREATE TABLE t_flatten_tuple(t Tuple(t1 Nested(a UInt32, s String), b UInt32, t2 Tuple(k String, v UInt32))) ENGINE = Memory;
INSERT INTO t_flatten_tuple VALUES (([(1, 'a'), (2, 'b')], 3, ('c', 4)));
SELECT flattenTuple(t) FROM t_flatten_tuple;
```

結果:

``` text
┌─flattenTuple(t)───────────┐
│ ([1,2],['a','b'],3,'c',4) │
└───────────────────────────┘
```

## Distance functions {#distance-functions}

すべてのサポートされている関数は、[距離関数のドキュメント](../../sql-reference/functions/distance-functions.md)に記載されています。
