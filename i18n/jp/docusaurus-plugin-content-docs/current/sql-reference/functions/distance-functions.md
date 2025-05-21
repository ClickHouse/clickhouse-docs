---
description: '距離関数のドキュメント'
sidebar_label: '距離'
sidebar_position: 55
slug: /sql-reference/functions/distance-functions
title: '距離関数'
---


# 距離関数

## L1Norm {#l1norm}

ベクトルの絶対値の合計を計算します。

**構文**

```sql
L1Norm(vector)
```

エイリアス: `normL1`。

**引数**

- `vector` — [タプル](../data-types/tuple.md) または [配列](../data-types/array.md)。

**戻り値**

- L1-ノルムまたは [タクシー幾何学](https://en.wikipedia.org/wiki/Taxicab_geometry) による距離。[UInt](../data-types/int-uint.md)、[Float](../data-types/float.md) または [Decimal](../data-types/decimal.md)。

**例**

クエリ：

```sql
SELECT L1Norm((1, 2));
```

結果：

```text
┌─L1Norm((1, 2))─┐
│              3 │
└────────────────┘
```

## L2Norm {#l2norm}

ベクトルの値の二乗の合計の平方根を計算します。

**構文**

```sql
L2Norm(vector)
```

エイリアス: `normL2`。

**引数**

- `vector` — [タプル](../data-types/tuple.md) または [配列](../data-types/array.md)。

**戻り値**

- L2-ノルムまたは [ユークリッド距離](https://en.wikipedia.org/wiki/Euclidean_distance)。[Float](../data-types/float.md)。

**例**

クエリ：

```sql
SELECT L2Norm((1, 2));
```

結果：

```text
┌───L2Norm((1, 2))─┐
│ 2.23606797749979 │
└──────────────────┘
```
## L2SquaredNorm {#l2squarednorm}

ベクトルの値の二乗の合計の平方根（[L2Norm](#l2norm)）を二乗します。

**構文**

```sql
L2SquaredNorm(vector)
```

エイリアス: `normL2Squared`。

**引数**

- `vector` — [タプル](../data-types/tuple.md) または [配列](../data-types/array.md)。

**戻り値**

- L2-ノルムの二乗。[Float](../data-types/float.md)。

**例**

クエリ：

```sql
SELECT L2SquaredNorm((1, 2));
```

結果：

```text
┌─L2SquaredNorm((1, 2))─┐
│                     5 │
└───────────────────────┘
```

## LinfNorm {#linfnorm}

ベクトルの絶対値の最大を計算します。

**構文**

```sql
LinfNorm(vector)
```

エイリアス: `normLinf`。

**引数**

- `vector` — [タプル](../data-types/tuple.md) または [配列](../data-types/array.md)。

**戻り値**

- Linf-ノルムまたは最大絶対値。[Float](../data-types/float.md)。

**例**

クエリ：

```sql
SELECT LinfNorm((1, -2));
```

結果：

```text
┌─LinfNorm((1, -2))─┐
│                 2 │
└───────────────────┘
```

## LpNorm {#lpnorm}

ベクトルの絶対値の `p` 乗の合計の平方根を計算します。

**構文**

```sql
LpNorm(vector, p)
```

エイリアス: `normLp`。

**引数**

- `vector` — [タプル](../data-types/tuple.md) または [配列](../data-types/array.md)。
- `p` — 乗数。可能な値: `[1; inf)` の実数。[UInt](../data-types/int-uint.md) または [Float](../data-types/float.md)。

**戻り値**

- [Lp-ノルム](https://en.wikipedia.org/wiki/Norm_(mathematics)#p-norm)。[Float](../data-types/float.md)。

**例**

クエリ：

```sql
SELECT LpNorm((1, -2), 2);
```

結果：

```text
┌─LpNorm((1, -2), 2)─┐
│   2.23606797749979 │
└────────────────────┘
```

## L1Distance {#l1distance}

2つの点の距離を計算します（ベクトルの値は座標です）`L1` 空間（1-ノルム ([タクシー幾何学](https://en.wikipedia.org/wiki/Taxicab_geometry) 距離））で。

**構文**

```sql
L1Distance(vector1, vector2)
```

エイリアス: `distanceL1`。

**引数**

- `vector1` — 最初のベクトル。[タプル](../data-types/tuple.md) または [配列](../data-types/array.md)。
- `vector2` — 2番目のベクトル。[タプル](../data-types/tuple.md) または [配列](../data-types/array.md)。

**戻り値**

- 1-ノルム距離。[Float](../data-types/float.md)。

**例**

クエリ：

```sql
SELECT L1Distance((1, 2), (2, 3));
```

結果：

```text
┌─L1Distance((1, 2), (2, 3))─┐
│                          2 │
└────────────────────────────┘
```

## L2Distance {#l2distance}

2つの点の距離を計算します（ベクトルの値は座標です）ユークリッド空間における ([ユークリッド距離](https://en.wikipedia.org/wiki/Euclidean_distance))。

**構文**

```sql
L2Distance(vector1, vector2)
```

エイリアス: `distanceL2`。

**引数**

- `vector1` — 最初のベクトル。[タプル](../data-types/tuple.md) または [配列](../data-types/array.md)。
- `vector2` — 2番目のベクトル。[タプル](../data-types/tuple.md) または [配列](../data-types/array.md)。

**戻り値**

- 2-ノルム距離。[Float](../data-types/float.md)。

**例**

クエリ：

```sql
SELECT L2Distance((1, 2), (2, 3));
```

結果：

```text
┌─L2Distance((1, 2), (2, 3))─┐
│         1.4142135623730951 │
└────────────────────────────┘
```

## L2SquaredDistance {#l2squareddistance}

2つのベクトルの対応する要素間の差の二乗の合計を計算します。

**構文**

```sql
L2SquaredDistance(vector1, vector2)
```

エイリアス: `distanceL2Squared`。

**引数**

- `vector1` — 最初のベクトル。[タプル](../data-types/tuple.md) または [配列](../data-types/array.md)。
- `vector2` — 2番目のベクトル。[タプル](../data-types/tuple.md) または [配列](../data-types/array.md)。

**戻り値**

- 2つのベクトルの対応する要素間の差の二乗の合計。[Float](../data-types/float.md)。

**例**

クエリ：

```sql
SELECT L2SquaredDistance([1, 2, 3], [0, 0, 0])
```

結果：

```response
┌─L2SquaredDistance([1, 2, 3], [0, 0, 0])─┐
│                                      14 │
└─────────────────────────────────────────┘
```

## LinfDistance {#linfdistance}

2つの点間の距離を計算します（ベクトルの値は座標です）`L_{inf}` 空間における ([最大ノルム](https://en.wikipedia.org/wiki/Norm_(mathematics)#Maximum_norm_(special_case_of:_infinity_norm,_uniform_norm,_or_supremum_norm))。

**構文**

```sql
LinfDistance(vector1, vector2)
```

エイリアス: `distanceLinf`。

**引数**

- `vector1` — 最初のベクトル。[タプル](../data-types/tuple.md) または [配列](../data-types/array.md)。
- `vector2` — 2番目のベクトル。[タプル](../data-types/tuple.md) または [配列](../data-types/array.md)。

**戻り値**

- 無限ノルム距離。[Float](../data-types/float.md)。

**例**

クエリ：

```sql
SELECT LinfDistance((1, 2), (2, 3));
```

結果：

```text
┌─LinfDistance((1, 2), (2, 3))─┐
│                            1 │
└──────────────────────────────┘
```

## LpDistance {#lpdistance}

2つの点間の距離を計算します（ベクトルの値は座標です）`Lp` 空間における ([p-ノルム距離](https://en.wikipedia.org/wiki/Norm_(mathematics)#p-norm))。

**構文**

```sql
LpDistance(vector1, vector2, p)
```

エイリアス: `distanceLp`。

**引数**

- `vector1` — 最初のベクトル。[タプル](../data-types/tuple.md) または [配列](../data-types/array.md)。
- `vector2` — 2番目のベクトル。[タプル](../data-types/tuple.md) または [配列](../data-types/array.md)。
- `p` — 乗数。可能な値: `[1; inf)` の実数。[UInt](../data-types/int-uint.md) または [Float](../data-types/float.md)。

**戻り値**

- p-ノルム距離。[Float](../data-types/float.md)。

**例**

クエリ：

```sql
SELECT LpDistance((1, 2), (2, 3), 3);
```

結果：

```text
┌─LpDistance((1, 2), (2, 3), 3)─┐
│            1.2599210498948732 │
└───────────────────────────────┘
```

## L1Normalize {#l1normalize}

指定したベクトルの単位ベクトルを計算します（タプルの値は座標です） `L1` 空間における ([タクシー幾何学](https://en.wikipedia.org/wiki/Taxicab_geometry))。

**構文**

```sql
L1Normalize(tuple)
```

エイリアス: `normalizeL1`。

**引数**

- `tuple` — [タプル](../data-types/tuple.md)。

**戻り値**

- 単位ベクトル。[Float](../data-types/float.md) の [タプル](../data-types/tuple.md)。

**例**

クエリ：

```sql
SELECT L1Normalize((1, 2));
```

結果：

```text
┌─L1Normalize((1, 2))─────────────────────┐
│ (0.3333333333333333,0.6666666666666666) │
└─────────────────────────────────────────┘
```

## L2Normalize {#l2normalize}

指定したベクトルの単位ベクトルを計算します（タプルの値は座標です）ユークリッド空間における ([ユークリッド距離](https://en.wikipedia.org/wiki/Euclidean_distance))。

**構文**

```sql
L2Normalize(tuple)
```

エイリアス: `normalizeL1`。

**引数**

- `tuple` — [タプル](../data-types/tuple.md)。

**戻り値**

- 単位ベクトル。[Float](../data-types/float.md) の [タプル](../data-types/tuple.md)。

**例**

クエリ：

```sql
SELECT L2Normalize((3, 4));
```

結果：

```text
┌─L2Normalize((3, 4))─┐
│ (0.6,0.8)           │
└─────────────────────┘
```

## LinfNormalize {#linfnormalize}

指定したベクトルの単位ベクトルを計算します（タプルの値は座標です） `L_{inf}` 空間における ([最大ノルム](https://en.wikipedia.org/wiki/Norm_(mathematics)#Maximum_norm_(special_case_of:_infinity_norm,_uniform_norm,_or_supremum_norm))。

**構文**

```sql
LinfNormalize(tuple)
```

エイリアス: `normalizeLinf `。

**引数**

- `tuple` — [タプル](../data-types/tuple.md)。

**戻り値**

- 単位ベクトル。[Float](../data-types/float.md) の [タプル](../data-types/tuple.md)。

**例**

クエリ：

```sql
SELECT LinfNormalize((3, 4));
```

結果：

```text
┌─LinfNormalize((3, 4))─┐
│ (0.75,1)              │
└───────────────────────┘
```

## LpNormalize {#lpnormalize}

指定したベクトルの単位ベクトルを計算します（タプルの値は座標です） `Lp` 空間における ([p-ノルム](https://en.wikipedia.org/wiki/Norm_(mathematics)#p-norm))。

**構文**

```sql
LpNormalize(tuple, p)
```

エイリアス: `normalizeLp `。

**引数**

- `tuple` — [タプル](../data-types/tuple.md)。
- `p` — 乗数。可能な値: [1;inf) の任意の数。[UInt](../data-types/int-uint.md) または [Float](../data-types/float.md)。

**戻り値**

- 単位ベクトル。[Float](../data-types/float.md) の [タプル](../data-types/tuple.md)。

**例**

クエリ：

```sql
SELECT LpNormalize((3, 4),5);
```

結果：

```text
┌─LpNormalize((3, 4), 5)──────────────────┐
│ (0.7187302630182624,0.9583070173576831) │
└─────────────────────────────────────────┘
```

## cosineDistance {#cosinedistance}

2つのベクトル間のコサイン距離を計算します（タプルの値は座標です）。返された値が小さいほど、ベクトルは似ています。

**構文**

```sql
cosineDistance(vector1, vector2)
```

**引数**

- `vector1` — 最初のタプル。[タプル](../data-types/tuple.md) または [配列](../data-types/array.md)。
- `vector2` — 2番目のタプル。[タプル](../data-types/tuple.md) または [配列](../data-types/array.md)。

**戻り値**

- 2つのベクトルの間の角度のコサインから1を引いた値。[Float](../data-types/float.md)。

**例**

クエリ：

```sql
SELECT cosineDistance((1, 2), (2, 3));
```

結果：

```text
┌─cosineDistance((1, 2), (2, 3))─┐
│           0.007722123286332261 │
└────────────────────────────────┘
```
