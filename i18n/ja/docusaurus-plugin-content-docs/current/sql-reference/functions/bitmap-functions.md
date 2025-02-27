---
slug: /sql-reference/functions/bitmap-functions
sidebar_position: 25
sidebar_label: ビットマップ
---

# ビットマップ関数

ビットマップは二つの方法で構築できます。一つ目の方法は、集約関数 `groupBitmap` と `-State` を使用して構築する方法です。もう一つの方法は、Array オブジェクトからビットマップを構築することです。

## bitmapBuild {#bitmapbuild}

符号なし整数配列からビットマップを構築します。

**構文**

``` sql
bitmapBuild(array)
```

**引数**

- `array` – 符号なし整数配列。

**例**

``` sql
SELECT bitmapBuild([1, 2, 3, 4, 5]) AS res, toTypeName(res);
```

``` text
┌─res─┬─toTypeName(bitmapBuild([1, 2, 3, 4, 5]))─────┐
│     │ AggregateFunction(groupBitmap, UInt8)        │
└─────┴──────────────────────────────────────────────┘
```

## bitmapToArray {#bitmaptoarray}

ビットマップを整数配列に変換します。

**構文**

``` sql
bitmapToArray(bitmap)
```

**引数**

- `bitmap` – ビットマップオブジェクト。

**例**

``` sql
SELECT bitmapToArray(bitmapBuild([1, 2, 3, 4, 5])) AS res;
```

結果:

``` text
┌─res─────────┐
│ [1,2,3,4,5] │
└─────────────┘
```

## bitmapSubsetInRange {#bitmapsubsetinrange}

値の範囲内のビットを持つビットマップのサブセットを返します。

**構文**

``` sql
bitmapSubsetInRange(bitmap, range_start, range_end)
```

**引数**

- `bitmap` – [ビットマップオブジェクト](#bitmapbuild)。
- `range_start` – 範囲の開始（含む）。 [UInt32](../data-types/int-uint.md)。
- `range_end` – 範囲の終了（除外）。 [UInt32](../data-types/int-uint.md)。

**例**

``` sql
SELECT bitmapToArray(bitmapSubsetInRange(bitmapBuild([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,100,200,500]), toUInt32(30), toUInt32(200))) AS res;
```

結果:

``` text
┌─res───────────────┐
│ [30,31,32,33,100] │
└───────────────────┘
```

## bitmapSubsetLimit {#bitmapsubsetlimit}

最小のビット値 `range_start` を持ち、最大で `cardinality_limit` 要素のビットマップのサブセットを返します。

**構文**

``` sql
bitmapSubsetLimit(bitmap, range_start, cardinality_limit)
```

**引数**

- `bitmap` – [ビットマップオブジェクト](#bitmapbuild)。
- `range_start` – 範囲の開始（含む）。 [UInt32](../data-types/int-uint.md)。
- `cardinality_limit` – サブセットの最大基数。 [UInt32](../data-types/int-uint.md)。

**例**

``` sql
SELECT bitmapToArray(bitmapSubsetLimit(bitmapBuild([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,100,200,500]), toUInt32(30), toUInt32(200))) AS res;
```

結果:

``` text
┌─res───────────────────────┐
│ [30,31,32,33,100,200,500] │
└───────────────────────────┘
```

## subBitmap {#subbitmap}

ビットマップのサブセットを返し、位置 `offset` から始まります。返されるビットマップの最大基数は `cardinality_limit` です。

**構文**

``` sql
subBitmap(bitmap, offset, cardinality_limit)
```

**引数**

- `bitmap` – ビットマップ。[ビットマップオブジェクト](#bitmapbuild)。
- `offset` – サブセットの最初の要素の位置。[UInt32](../data-types/int-uint.md)。
- `cardinality_limit` – サブセットの最大要素数。[UInt32](../data-types/int-uint.md)。

**例**

``` sql
SELECT bitmapToArray(subBitmap(bitmapBuild([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,100,200,500]), toUInt32(10), toUInt32(10))) AS res;
```

結果:

``` text
┌─res─────────────────────────────┐
│ [10,11,12,13,14,15,16,17,18,19] │
└─────────────────────────────────┘
```

## bitmapContains {#bitmapcontains}

ビットマップが要素を含むかどうかを確認します。

``` sql
bitmapContains(bitmap, needle)
```

**引数**

- `bitmap` – [ビットマップオブジェクト](#bitmapbuild)。
- `needle` – 検索するビット値。[UInt32](../data-types/int-uint.md)。

**戻り値**

- 0 — `bitmap` が `needle` を含まない場合。[UInt8](../data-types/int-uint.md)。
- 1 — `bitmap` が `needle` を含む場合。[UInt8](../data-types/int-uint.md)。

**例**

``` sql
SELECT bitmapContains(bitmapBuild([1,5,7,9]), toUInt32(9)) AS res;
```

結果:

``` text
┌─res─┐
│  1  │
└─────┘
```

## bitmapHasAny {#bitmaphasany}

二つのビットマップが交差するかどうかを確認します。

`bitmap2` に正確に一つの要素が含まれている場合、[bitmapContains](#bitmapcontains) の使用を検討してください。より効率的に動作します。

**構文**

``` sql
bitmapHasAny(bitmap1, bitmap2)
```

**引数**

- `bitmap1` – ビットマップオブジェクト1。
- `bitmap2` – ビットマップオブジェクト2。

**戻り値**

- `1`、もし `bitmap1` と `bitmap2` に少なくとも一つの共有要素がある場合。
- `0`、それ以外。

**例**

``` sql
SELECT bitmapHasAny(bitmapBuild([1,2,3]),bitmapBuild([3,4,5])) AS res;
```

結果:

``` text
┌─res─┐
│  1  │
└─────┘
```

## bitmapHasAll {#bitmaphasall}

最初のビットマップが二番目のビットマップのすべての要素を含む場合、1を返します。そうでなければ、0を返します。
二番目のビットマップが空であれば、1を返します。

また、`hasAll(array, array)` も参照してください。

**構文**

``` sql
bitmapHasAll(bitmap1, bitmap2)
```

**引数**

- `bitmap1` – ビットマップオブジェクト1。
- `bitmap2` – ビットマップオブジェクト2。

**例**

``` sql
SELECT bitmapHasAll(bitmapBuild([1,2,3]),bitmapBuild([3,4,5])) AS res;
```

結果:

``` text
┌─res─┐
│  0  │
└─────┘
```

## bitmapCardinality {#bitmapcardinality}

ビットマップの基数を返します。

**構文**

``` sql
bitmapCardinality(bitmap)
```

**引数**

- `bitmap` – ビットマップオブジェクト。

**例**

``` sql
SELECT bitmapCardinality(bitmapBuild([1, 2, 3, 4, 5])) AS res;
```

結果:

``` text
┌─res─┐
│   5 │
└─────┘
```

## bitmapMin {#bitmapmin}

ビットマップの中で設定された最小のビットを計算し、ビットマップが空であれば `UINT32_MAX` を返します。

**構文**

```sql 
bitmapMin(bitmap)
```

**引数**

- `bitmap` – ビットマップオブジェクト。

**例**

``` sql
SELECT bitmapMin(bitmapBuild([1, 2, 3, 4, 5])) AS res;
```

結果:

``` text
 ┌─res─┐
 │   1 │
 └─────┘
```

## bitmapMax {#bitmapmax}

ビットマップの中で設定された最大のビットを計算し、ビットマップが空であれば 0 を返します。

**構文**

```sql 
bitmapMax(bitmap)
```

**引数**

- `bitmap` – ビットマップオブジェクト。

**例**

``` sql
SELECT bitmapMax(bitmapBuild([1, 2, 3, 4, 5])) AS res;
```

結果:

``` text
 ┌─res─┐
 │   5 │
 └─────┘
```

## bitmapTransform {#bitmaptransform}

ビットマップ内の最大 N ビットを置き換えます。 i 番目の置き換えられたビットの古い値と新しい値は `from_array[i]` と `to_array[i]` で与えられます。

結果は `from_array` と `to_array` の配列の順序に依存します。

**構文**

``` sql
bitmapTransform(bitmap, from_array, to_array)
```

**引数**

- `bitmap` – ビットマップオブジェクト。
- `from_array` – UInt32 配列。`from_array.size()` の範囲内の idx に対して、ビットマップが `from_array[idx]` を含む場合、それを `to_array[idx]` で置き換えます。
- `to_array` – `from_array` と同じサイズの UInt32 配列。

**例**

``` sql
SELECT bitmapToArray(bitmapTransform(bitmapBuild([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]), cast([5,999,2] as Array(UInt32)), cast([2,888,20] as Array(UInt32)))) AS res;
```

結果:

``` text
 ┌─res───────────────────┐
 │ [1,3,4,6,7,8,9,10,20] │
 └───────────────────────┘
```

## bitmapAnd {#bitmapand}

二つのビットマップの論理積を計算します。

**構文**

``` sql
bitmapAnd(bitmap,bitmap)
```

**引数**

- `bitmap` – ビットマップオブジェクト。

**例**

``` sql
SELECT bitmapToArray(bitmapAnd(bitmapBuild([1,2,3]),bitmapBuild([3,4,5]))) AS res;
```

結果:

``` text
┌─res─┐
│ [3] │
└─────┘
```

## bitmapOr {#bitmapor}

二つのビットマップの論理和を計算します。

**構文**

``` sql
bitmapOr(bitmap,bitmap)
```

**引数**

- `bitmap` – ビットマップオブジェクト。

**例**

``` sql
SELECT bitmapToArray(bitmapOr(bitmapBuild([1,2,3]),bitmapBuild([3,4,5]))) AS res;
```

結果:

``` text
┌─res─────────┐
│ [1,2,3,4,5] │
└─────────────┘
```

## bitmapXor {#bitmapxor}

二つのビットマップの排他的論理和を計算します。

**構文**

``` sql
bitmapXor(bitmap,bitmap)
```

**引数**

- `bitmap` – ビットマップオブジェクト。

**例**

``` sql
SELECT bitmapToArray(bitmapXor(bitmapBuild([1,2,3]),bitmapBuild([3,4,5]))) AS res;
```

結果:

``` text
┌─res───────┐
│ [1,2,4,5] │
└───────────┘
```

## bitmapAndnot {#bitmapandnot}

二つのビットマップの論理積を計算し、その結果を否定します。

**構文**

``` sql
bitmapAndnot(bitmap,bitmap)
```

**引数**

- `bitmap` – ビットマップオブジェクト。

**例**

``` sql
SELECT bitmapToArray(bitmapAndnot(bitmapBuild([1,2,3]),bitmapBuild([3,4,5]))) AS res;
```

結果:

``` text
┌─res───┐
│ [1,2] │
└───────┘
```

## bitmapAndCardinality {#bitmapandcardinality}

二つのビットマップの論理積の基数を返します。

**構文**

``` sql
bitmapAndCardinality(bitmap,bitmap)
```

**引数**

- `bitmap` – ビットマップオブジェクト。

**例**

``` sql
SELECT bitmapAndCardinality(bitmapBuild([1,2,3]),bitmapBuild([3,4,5])) AS res;
```

結果:

``` text
┌─res─┐
│   1 │
└─────┘
```

## bitmapOrCardinality {#bitmaporcardinality}

二つのビットマップの論理和の基数を返します。

``` sql
bitmapOrCardinality(bitmap,bitmap)
```

**引数**

- `bitmap` – ビットマップオブジェクト。

**例**

``` sql
SELECT bitmapOrCardinality(bitmapBuild([1,2,3]),bitmapBuild([3,4,5])) AS res;
```

結果:

``` text
┌─res─┐
│   5 │
└─────┘
```

## bitmapXorCardinality {#bitmapxorcardinality}

二つのビットマップの排他的論理和の基数を返します。

``` sql
bitmapXorCardinality(bitmap,bitmap)
```

**引数**

- `bitmap` – ビットマップオブジェクト。

**例**

``` sql
SELECT bitmapXorCardinality(bitmapBuild([1,2,3]),bitmapBuild([3,4,5])) AS res;
```

結果:

``` text
┌─res─┐
│   4 │
└─────┘
```

## bitmapAndnotCardinality {#bitmapandnotcardinality}

二つのビットマップの AND-NOT 操作の基数を返します。

``` sql
bitmapAndnotCardinality(bitmap,bitmap)
```

**引数**

- `bitmap` – ビットマップオブジェクト。

**例**

``` sql
SELECT bitmapAndnotCardinality(bitmapBuild([1,2,3]),bitmapBuild([3,4,5])) AS res;
```

結果:

``` text
┌─res─┐
│   2 │
└─────┘
```
